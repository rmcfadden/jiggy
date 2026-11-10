use crate::generated::repositories::templatesRepository::TemplatesRepository;
use crate::generated::Template;
use futures_util::TryStreamExt;
use serde_json::{json, Value};
use std::sync::Arc;

pub enum TemplateError {
    Datasource(datasources::DatasourceError),
}

impl From<datasources::DatasourceError> for TemplateError {
    fn from(err: datasources::DatasourceError) -> Self {
        Self::Datasource(err)
    }
}

type Result<T> = std::result::Result<T, TemplateError>;

pub struct TemplatesService {
    repo: Arc<TemplatesRepository>,
}

impl TemplatesService {
    pub fn new(repo: Arc<TemplatesRepository>) -> Self {
        Self { repo }
    }

    /// Templates of `kind` (a template type name such as "jigsaw"), or all of them when `None`.
    pub async fn list(&self, kind: Option<&str>) -> Result<Vec<Value>> {
        let rows: Vec<Template> = self.repo.read(None, None).try_collect().await?;
        Ok(rows
            .iter()
            .map(to_json)
            .filter(|t| kind.is_none_or(|k| t["type"] == k))
            .collect())
    }

    pub async fn get(&self, id: i64) -> Result<Option<Value>> {
        Ok(self.find(id).await?.as_ref().map(to_json))
    }

    /// Creates a template from `{ type, name, content }`, where `content` is any JSON.
    pub async fn create(&self, input: &Value) -> Result<Value> {
        let mut item = Template::default();
        apply(&mut item, input);
        let created = self.repo.create(item).await?;
        Ok(to_json(&self.find(created.id).await?.unwrap_or(created)))
    }

    /// Merges the fields present in `input` into the stored row.
    pub async fn update(&self, id: i64, input: &Value) -> Result<Option<Value>> {
        let Some(mut item) = self.find(id).await? else { return Ok(None) };
        apply(&mut item, input);
        self.repo.update(item.clone(), None).await?;
        Ok(Some(to_json(&item)))
    }

    pub async fn delete(&self, id: i64) -> Result<bool> {
        let Some(item) = self.find(id).await? else { return Ok(false) };
        self.repo.delete(item, None).await?;
        Ok(true)
    }

    /// Creates the templates in the seed file at `path` that are missing, matching on (type, name); existing rows are
    /// never changed. Returns the names added.
    pub async fn add_templates(&self, path: &std::path::Path) -> std::result::Result<Vec<String>, Box<dyn std::error::Error>> {
        let seeds: Vec<Value> = serde_json::from_str(&std::fs::read_to_string(path)?)?;
        let mut have: Vec<(String, String)> = self
            .list(None)
            .await
            .map_err(|_| "could not read templates")?
            .iter()
            .map(|t| (t["type"].as_str().unwrap_or_default().to_string(), t["name"].as_str().unwrap_or_default().to_string()))
            .collect();
        let mut added = vec![];
        for seed in &seeds {
            let key = (seed["type"].as_str().unwrap_or_default().to_string(), seed["name"].as_str().unwrap_or_default().to_string());
            if have.contains(&key) {
                continue;
            }
            self.create(seed).await.map_err(|_| format!("could not create template {}", key.1))?;
            added.push(key.1.clone());
            have.push(key);
        }
        Ok(added)
    }

    async fn find(&self, id: i64) -> Result<Option<Template>> {
        Ok(self.repo.read_single_by_id(&datasources::Value::Int(id)).await?)
    }
}

fn apply(item: &mut Template, input: &Value) {
    if let Some(kind) = input["type"].as_str() {
        item.template_type_name = kind.into();
    }
    if let Some(v) = input["name"].as_str() {
        item.name = v.into();
    }
    if !input["content"].is_null() {
        item.content = input["content"].to_string();
    }
}

fn to_json(t: &Template) -> Value {
    json!({
        "id": t.id,
        "uuid": t.uuid.to_string(),
        "type": t.template_type_name,
        "name": t.name,
        "content": serde_json::from_str::<Value>(&t.content).unwrap_or(Value::Null),
        "created": t.created.to_rfc3339(),
        "updated": t.updated.to_rfc3339(),
    })
}
