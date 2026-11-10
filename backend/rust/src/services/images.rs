use crate::generated::repositories::mimeTypesRepository::MimeTypesRepository;
use crate::generated::repositories::resourcesRepository::ResourcesRepository;
use crate::generated::Resource;
use futures_util::TryStreamExt;
use serde_json::{json, Value};
use std::collections::HashMap;
use std::path::{Path, PathBuf};
use std::sync::Arc;

pub const THUMBNAIL_SUFFIX: &str = "_thumbnail";
const THUMBNAIL_WIDTH: u32 = 480;

const EXTENSIONS: [(&str, &str); 9] = [
    ("image/jpeg", ".jpg"), ("image/png", ".png"), ("image/gif", ".gif"), ("image/webp", ".webp"),
    ("image/svg+xml", ".svg"), ("image/bmp", ".bmp"), ("image/tiff", ".tif"), ("image/x-icon", ".ico"), ("image/avif", ".avif"),
];
/// Types we store but do not shrink: no thumbnail row is made for these.
const NO_THUMBNAIL: [&str; 4] = ["image/svg+xml", "image/tiff", "image/avif", "image/x-icon"];

#[derive(Debug)]
pub enum ImageError {
    Datasource(datasources::DatasourceError),
    Unsupported(String),
    Io(std::io::Error),
}

impl From<datasources::DatasourceError> for ImageError {
    fn from(err: datasources::DatasourceError) -> Self {
        Self::Datasource(err)
    }
}

impl From<std::io::Error> for ImageError {
    fn from(err: std::io::Error) -> Self {
        Self::Io(err)
    }
}

type Result<T> = std::result::Result<T, ImageError>;

pub struct ImageUpload {
    pub data: Vec<u8>,
    pub content_type: String,
    pub file_name: Option<String>,
}

/// Content type for a stored key, from its extension.
pub fn content_type_of(key: &str) -> Option<&'static str> {
    let key = key.to_lowercase();
    EXTENSIONS.iter().find(|(_, ext)| key.ends_with(ext)).map(|(t, _)| *t)
}

fn extension_of(content_type: &str) -> Option<&'static str> {
    EXTENSIONS.iter().find(|(t, _)| *t == content_type).map(|(_, e)| *e)
}

/// How to look an image up; the first one given wins.
#[derive(Default)]
pub struct By {
    pub id: Option<i64>,
    pub uuid: Option<String>,
    pub name: Option<String>,
}

/// Pictures kept as `resource` rows, with the bytes in a local folder served at `/api/images/files/{key}`. Raster
/// images also get a resized copy as a second resource named `{name}_thumbnail`, which `list` hides.
pub struct ImagesService {
    repo: Arc<ResourcesRepository>,
    mimes: Arc<MimeTypesRepository>,
    root: PathBuf,
    public_base_url: String,
}

impl ImagesService {
    pub fn new(repo: Arc<ResourcesRepository>, mimes: Arc<MimeTypesRepository>) -> Self {
        let root = std::env::var("IMAGES_PATH").unwrap_or_else(|_| "uploads".into());
        let public_base_url = std::env::var("IMAGES_PUBLIC_BASE_URL").unwrap_or_default();
        Self { repo, mimes, root: PathBuf::from(root), public_base_url }
    }

    pub async fn create(&self, upload: ImageUpload, name: Option<&str>, description: Option<&str>) -> Result<Value> {
        let kind = normalize(&upload.content_type);
        self.check_mime(&kind).await?;
        let name = name.map(String::from).or(upload.file_name.clone()).unwrap_or_default();
        let image = self.create_row(&name, description.unwrap_or_default(), &kind, &upload.data).await?;
        self.save_thumbnail(&name, description.unwrap_or_default(), &kind, &upload.data).await?;
        Ok(to_json(&image))
    }

    /// Every image, oldest first, without the generated thumbnail rows.
    pub async fn list(&self) -> Result<Vec<Value>> {
        let mut rows = self.rows().await?;
        rows.retain(|r| !r.resource_name.ends_with(THUMBNAIL_SUFFIX));
        rows.sort_by_key(|r| r.id);
        Ok(rows.iter().map(to_json).collect())
    }

    pub async fn find(&self, by: &By) -> Result<Option<Value>> {
        Ok(self.find_row(by).await?.as_ref().map(to_json))
    }

    /// Image id to the URL of its generated thumbnail; images without a thumbnail are left out.
    pub async fn thumbnail_urls(&self) -> Result<HashMap<i64, String>> {
        let rows = self.rows().await?;
        let thumbs: HashMap<&str, &str> = rows
            .iter()
            .filter(|r| r.resource_name.ends_with(THUMBNAIL_SUFFIX))
            .map(|r| (r.resource_name.as_str(), r.location.as_str()))
            .collect();
        Ok(rows
            .iter()
            .filter_map(|r| thumbs.get(format!("{}{THUMBNAIL_SUFFIX}", r.resource_name).as_str()).map(|url| (r.id, url.to_string())))
            .collect())
    }

    /// Merges the fields present, swapping the bytes when `upload` is given; `None` when it does not exist. The thumbnail row follows.
    pub async fn replace(&self, id: i64, upload: Option<ImageUpload>, name: Option<&str>, description: Option<&str>) -> Result<Option<Value>> {
        let Some(mut row) = self.repo.read_single_by_id(&datasources::Value::Int(id)).await?.filter(|r| !r.is_deleted) else { return Ok(None) };
        let old_name = row.resource_name.clone();
        let mut kind = row.mime_type_name.clone();
        if let Some(upload) = &upload {
            kind = normalize(&upload.content_type);
            self.check_mime(&kind).await?;
            let old_key = key_from_url(&row.location);
            // A fresh key, so caches of the old URL cannot serve the new bytes.
            row.location = self.save(&key_for(&datasources::uuid::Uuid::new_v4(), &kind), &upload.data)?;
            row.mime_type_name = kind.clone();
            self.remove_file(&old_key);
        }
        if let Some(name) = name {
            row.resource_name = name.into();
        }
        if let Some(description) = description {
            row.description = description.into();
        }
        self.repo.update(row.clone(), None).await?;

        if !row.resource_name.ends_with(THUMBNAIL_SUFFIX) {
            let old_thumb = By { name: Some(format!("{old_name}{THUMBNAIL_SUFFIX}")), ..By::default() };
            if let Some(upload) = &upload {
                self.delete_row(self.find_row(&old_thumb).await?).await?;
                self.save_thumbnail(&row.resource_name, &row.description, &kind, &upload.data).await?;
            } else if let Some(mut thumb) = self.find_row(&old_thumb).await? {
                thumb.resource_name = format!("{}{THUMBNAIL_SUFFIX}", row.resource_name);
                thumb.description = row.description.clone();
                self.repo.update(thumb, None).await?;
            }
        }
        Ok(Some(to_json(&row)))
    }

    /// Removes the image, its stored bytes and its thumbnail.
    pub async fn delete(&self, id: i64) -> Result<bool> {
        let Some(row) = self.repo.read_single_by_id(&datasources::Value::Int(id)).await?.filter(|r| !r.is_deleted) else { return Ok(false) };
        if !row.resource_name.ends_with(THUMBNAIL_SUFFIX) {
            let thumb = By { name: Some(format!("{}{THUMBNAIL_SUFFIX}", row.resource_name)), ..By::default() };
            self.delete_row(self.find_row(&thumb).await?).await?;
        }
        self.delete_row(Some(row)).await?;
        Ok(true)
    }

    /// Uploads every image under `directory`/<category>/<slug>.* (the frontend catalog) as resource `slug` with the
    /// category as description. Names that already exist are skipped; returns the names added.
    pub async fn add_samples(&self, directory: &Path) -> Result<Vec<String>> {
        let mut files = vec![];
        walk(directory, &mut files)?;
        files.sort();
        let mut have: Vec<String> = self.rows().await?.into_iter().map(|r| r.resource_name).collect();
        let mut added = vec![];
        for file in files {
            let ext = file.extension().and_then(|e| e.to_str()).unwrap_or_default().to_lowercase().replace("jpeg", "jpg");
            let name = file.file_stem().and_then(|s| s.to_str()).unwrap_or_default().to_string();
            let Some(kind) = content_type_of(&format!(".{ext}")) else { continue };
            if have.contains(&name) {
                continue;
            }
            let category = file.parent().and_then(|p| p.file_name()).and_then(|n| n.to_str()).unwrap_or_default().to_string();
            let upload = ImageUpload { data: std::fs::read(&file)?, content_type: kind.into(), file_name: file.file_name().and_then(|n| n.to_str()).map(String::from) };
            self.create(upload, Some(&name), Some(&category)).await?;
            have.push(name.clone());
            added.push(name);
        }
        Ok(added)
    }

    /// The bytes behind a key, or `None` when there are none (or the key is not a plain file name).
    pub fn open(&self, key: &str) -> Option<Vec<u8>> {
        std::fs::read(self.path_for(key)?).ok()
    }

    async fn create_row(&self, name: &str, description: &str, kind: &str, bytes: &[u8]) -> Result<Resource> {
        let mut row = Resource { resource_name: name.into(), mime_type_name: kind.into(), description: description.into(), ..Resource::default() };
        row.location = self.save(&key_for(&row.uuid, kind), bytes)?;
        let created = self.repo.create(row).await?;
        Ok(self.repo.read_single_by_id(&datasources::Value::Int(created.id)).await?.unwrap_or(created))
    }

    async fn save_thumbnail(&self, name: &str, description: &str, kind: &str, bytes: &[u8]) -> Result<()> {
        if name.ends_with(THUMBNAIL_SUFFIX) || NO_THUMBNAIL.contains(&kind) {
            return Ok(());
        }
        if let Some(thumb) = make_thumbnail(bytes) {
            self.create_row(&format!("{name}{THUMBNAIL_SUFFIX}"), description, "image/jpeg", &thumb).await?;
        }
        Ok(())
    }

    fn save(&self, key: &str, bytes: &[u8]) -> Result<String> {
        std::fs::create_dir_all(&self.root)?;
        let path = self.path_for(key).ok_or_else(|| std::io::Error::other("invalid image key"))?;
        std::fs::write(path, bytes)?;
        Ok(format!("{}/api/images/files/{key}", self.public_base_url.trim_end_matches('/')))
    }

    fn remove_file(&self, key: &str) {
        if let Some(path) = self.path_for(key) {
            let _ = std::fs::remove_file(path);
        }
    }

    async fn delete_row(&self, row: Option<Resource>) -> Result<()> {
        if let Some(row) = row {
            self.remove_file(&key_from_url(&row.location));
            self.repo.delete(row, None).await?;
        }
        Ok(())
    }

    /// Keys are plain file names; anything that could leave the folder is rejected.
    fn path_for(&self, key: &str) -> Option<PathBuf> {
        let plain = !key.is_empty() && !key.starts_with('.') && Path::new(key).file_name().and_then(|n| n.to_str()) == Some(key);
        plain.then(|| self.root.join(key))
    }

    async fn rows(&self) -> Result<Vec<Resource>> {
        let mut rows: Vec<Resource> = self.repo.read(None, None).try_collect().await?;
        rows.retain(|r| !r.is_deleted);
        Ok(rows)
    }

    async fn find_row(&self, by: &By) -> Result<Option<Resource>> {
        Ok(self.rows().await?.into_iter().find(|r| match (by.id, &by.uuid, &by.name) {
            (Some(id), _, _) => r.id == id,
            (_, Some(uuid), _) => r.uuid.to_string() == *uuid,
            (_, _, Some(name)) => r.resource_name == *name,
            _ => false,
        }))
    }

    /// Only the image types we know an extension for, and that exist in mime_type, are accepted.
    async fn check_mime(&self, kind: &str) -> Result<()> {
        if extension_of(kind).is_none() {
            return Err(ImageError::Unsupported(kind.into()));
        }
        let mimes: Vec<crate::generated::MimeType> = self.mimes.read(None, None).try_collect().await?;
        if mimes.iter().any(|m| m.name == kind) { Ok(()) } else { Err(ImageError::Unsupported(kind.into())) }
    }
}

fn normalize(content_type: &str) -> String {
    content_type.split(';').next().unwrap_or_default().trim().to_lowercase()
}

fn key_for(uuid: &datasources::uuid::Uuid, kind: &str) -> String {
    format!("{}{}", uuid.simple(), extension_of(kind).unwrap_or_default())
}

fn key_from_url(url: &str) -> String {
    url.split('?').next().unwrap_or_default().trim_end_matches('/').rsplit('/').next().unwrap_or_default().to_string()
}

/// A JPEG no wider than `THUMBNAIL_WIDTH`, or `None` when the bytes are not a raster image we can decode.
fn make_thumbnail(bytes: &[u8]) -> Option<Vec<u8>> {
    use image::codecs::jpeg::JpegEncoder;
    let source = image::load_from_memory(bytes).ok()?;
    let small = if source.width() > THUMBNAIL_WIDTH { source.resize(THUMBNAIL_WIDTH, u32::MAX, image::imageops::FilterType::Lanczos3) } else { source };
    let mut out = vec![];
    small.to_rgb8().write_with_encoder(JpegEncoder::new_with_quality(&mut out, 80)).ok()?;
    Some(out)
}

fn walk(dir: &Path, found: &mut Vec<PathBuf>) -> std::io::Result<()> {
    let entries = match std::fs::read_dir(dir) {
        Ok(entries) => entries,
        Err(err) if err.kind() == std::io::ErrorKind::NotFound => return Ok(()),
        Err(err) => return Err(err),
    };
    for entry in entries {
        let path = entry?.path();
        if path.is_dir() { walk(&path, found)? } else { found.push(path) }
    }
    Ok(())
}

fn to_json(r: &Resource) -> Value {
    json!({
        "id": r.id,
        "uuid": r.uuid.to_string(),
        "name": r.resource_name,
        "mimeType": r.mime_type_name,
        "description": r.description,
        "url": r.location,
        "created": r.created.to_rfc3339(),
        "updated": r.updated.to_rfc3339(),
    })
}
