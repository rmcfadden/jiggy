use crate::services::images::{content_type_of, By, ImageError, ImageUpload, ImagesService};
use axum::{
    extract::{DefaultBodyLimit, Multipart, Path, Query, State},
    http::{header, StatusCode},
    response::IntoResponse,
    routing::get,
    Json, Router,
};
use serde_json::{json, Value};
use std::{collections::HashMap, sync::Arc};

type Service = State<Arc<ImagesService>>;
type Failure = (StatusCode, Json<Value>);
type Reply = Result<Json<Value>, Failure>;

pub fn router(service: Arc<ImagesService>) -> Router {
    let max_bytes = std::env::var("IMAGES_MAX_BYTES").ok().and_then(|v| v.parse().ok()).unwrap_or(10 * 1024 * 1024);
    Router::new()
        .route("/api/images", get(list).post(create))
        .route("/api/images/files/{key}", get(file))
        .route("/api/images/{id}", get(read).put(update).delete(remove))
        .layer(DefaultBodyLimit::max(max_bytes))
        .with_state(service)
}

fn fail(err: ImageError) -> Failure {
    match err {
        ImageError::Unsupported(kind) => (StatusCode::BAD_REQUEST, Json(json!({ "error": format!("unsupported image type: {kind}") }))),
        ImageError::Datasource(err) => {
            eprintln!("images: {err:?}");
            (StatusCode::INTERNAL_SERVER_ERROR, Json(Value::Null))
        }
        ImageError::Io(err) => {
            eprintln!("images: {err}");
            (StatusCode::INTERNAL_SERVER_ERROR, Json(Value::Null))
        }
    }
}

fn bad(message: &str) -> Failure {
    (StatusCode::BAD_REQUEST, Json(json!({ "error": message })))
}

fn not_found() -> Failure {
    (StatusCode::NOT_FOUND, Json(Value::Null))
}

/// The multipart fields of an upload; every one is optional.
#[derive(Default)]
struct Form {
    file: Option<ImageUpload>,
    name: Option<String>,
    description: Option<String>,
}

async fn form(mut multipart: Multipart) -> Result<Form, Failure> {
    let mut form = Form::default();
    while let Some(field) = multipart.next_field().await.map_err(|_| bad("invalid multipart body"))? {
        match field.name().unwrap_or_default() {
            "file" => {
                let content_type = field.content_type().unwrap_or_default().to_string();
                let file_name = field.file_name().map(String::from);
                let data = field.bytes().await.map_err(|_| bad("could not read the file"))?.to_vec();
                form.file = Some(ImageUpload { data, content_type, file_name });
            }
            "name" => form.name = Some(field.text().await.map_err(|_| bad("invalid name"))?),
            "description" => form.description = Some(field.text().await.map_err(|_| bad("invalid description"))?),
            _ => {}
        }
    }
    Ok(form)
}

/// With `id`, `guid` or `name`, looks one image up (the result carries the image url); with none, lists every image.
async fn list(State(service): Service, Query(query): Query<HashMap<String, String>>) -> Reply {
    if !["id", "guid", "name"].iter().any(|k| query.contains_key(*k)) {
        return Ok(Json(Value::Array(service.list().await.map_err(fail)?)));
    }
    let by = By { id: query.get("id").and_then(|v| v.parse().ok()), uuid: query.get("guid").cloned(), name: query.get("name").cloned() };
    service.find(&by).await.map_err(fail)?.map(Json).ok_or_else(not_found)
}

async fn read(State(service): Service, Path(id): Path<i64>) -> Reply {
    service.find(&By { id: Some(id), ..By::default() }).await.map_err(fail)?.map(Json).ok_or_else(not_found)
}

/// Serves bytes for the local store.
async fn file(State(service): Service, Path(key): Path<String>) -> impl IntoResponse {
    match (content_type_of(&key), service.open(&key)) {
        (Some(kind), Some(bytes)) => ([(header::CONTENT_TYPE, kind)], bytes).into_response(),
        _ => StatusCode::NOT_FOUND.into_response(),
    }
}

async fn create(State(service): Service, multipart: Multipart) -> Result<(StatusCode, Json<Value>), Failure> {
    let form = form(multipart).await?;
    let Some(file) = form.file else { return Err(bad("multipart field 'file' is required")) };
    let image = service.create(file, form.name.as_deref(), form.description.as_deref()).await.map_err(fail)?;
    Ok((StatusCode::CREATED, Json(image)))
}

/// Every field is optional: send a file to swap the image, name/description to edit the metadata.
async fn update(State(service): Service, Path(id): Path<i64>, multipart: Multipart) -> Reply {
    let form = form(multipart).await?;
    service.replace(id, form.file, form.name.as_deref(), form.description.as_deref()).await.map_err(fail)?.map(Json).ok_or_else(not_found)
}

async fn remove(State(service): Service, Path(id): Path<i64>) -> StatusCode {
    match service.delete(id).await {
        Ok(true) => StatusCode::NO_CONTENT,
        Ok(false) => StatusCode::NOT_FOUND,
        Err(err) => fail(err).0,
    }
}
