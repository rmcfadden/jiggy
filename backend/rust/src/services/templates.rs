use crate::generated::{Template, TemplateType};
use datasources::CRUDRepository;
use futures_util::TryStreamExt;
use serde_json::{json, Value};
use std::sync::Arc;

pub enum TemplateError {
    /// The request named a template type that does not exist.
    UnknownType(String),
    Datasource(datasources::DatasourceError),
}

impl From<datasources::DatasourceError> for TemplateError {
    fn from(err: datasources::DatasourceError) -> Self {
        Self::Datasource(err)
    }
}

type Result<T> = std::result::Result<T, TemplateError>;

pub struct TemplatesService {
    repo: Arc<CRUDRepository<Template>>,
    types: Arc<CRUDRepository<TemplateType>>,
}

impl TemplatesService {
    pub fn new(repo: Arc<CRUDRepository<Template>>, types: Arc<CRUDRepository<TemplateType>>) -> Self {
        Self { repo, types }
    }

    /// Templates of `kind` (a template type name such as "jigsaw"), or all of them when `None`.
    pub async fn list(&self, kind: Option<&str>) -> Result<Vec<Value>> {
        let types = self.types().await?;
        let rows: Vec<Template> = self.repo.read(&(), None).try_collect().await?;
        Ok(rows
            .iter()
            .map(|t| to_json(t, &types))
            .filter(|t| kind.is_none_or(|k| t["type"] == k))
            .collect())
    }

    pub async fn get(&self, id: i64) -> Result<Option<Value>> {
        let types = self.types().await?;
        Ok(self.find(id).await?.as_ref().map(|t| to_json(t, &types)))
    }

    /// Creates a template from `{ type, name, content }`, where `content` is any JSON.
    pub async fn create(&self, input: &Value) -> Result<Value> {
        let types = self.types().await?;
        let mut item = Template::default();
        apply(&mut item, input, &types)?;
        let created = self.repo.create(item).await?;
        Ok(to_json(&self.find(created.id).await?.unwrap_or(created), &types))
    }

    /// Merges the fields present in `input` into the stored row.
    pub async fn update(&self, id: i64, input: &Value) -> Result<Option<Value>> {
        let Some(mut item) = self.find(id).await? else { return Ok(None) };
        let types = self.types().await?;
        apply(&mut item, input, &types)?;
        self.repo.update(item.clone(), None).await?;
        Ok(Some(to_json(&item, &types)))
    }

    pub async fn delete(&self, id: i64) -> Result<bool> {
        let Some(item) = self.find(id).await? else { return Ok(false) };
        self.repo.delete(item, None).await?;
        Ok(true)
    }

    async fn find(&self, id: i64) -> Result<Option<Template>> {
        Ok(self.repo.read_single_by_id(&datasources::Value::Int(id)).await?)
    }

    /// Template type id and name pairs.
    async fn types(&self) -> Result<Vec<(i64, String)>> {
        let rows: Vec<TemplateType> = self.types.read(&(), None).try_collect().await?;
        Ok(rows.into_iter().map(|t| (t.id, t.name)).collect())
    }
}

fn apply(item: &mut Template, input: &Value, types: &[(i64, String)]) -> Result<()> {
    if let Some(kind) = input["type"].as_str() {
        item.template_type_id = types.iter().find(|(_, n)| n == kind).map(|(id, _)| *id).ok_or_else(|| TemplateError::UnknownType(kind.into()))?;
    }
    if let Some(v) = input["name"].as_str() {
        item.name = v.into();
    }
    if !input["content"].is_null() {
        item.content = input["content"].to_string();
    }
    Ok(())
}

fn to_json(t: &Template, types: &[(i64, String)]) -> Value {
    json!({
        "id": t.id,
        "uuid": t.uuid,
        "type": types.iter().find(|(id, _)| *id == t.template_type_id).map(|(_, n)| n.as_str()).unwrap_or(""),
        "name": t.name,
        "content": serde_json::from_str::<Value>(&t.content).unwrap_or(Value::Null),
        "created": t.created.to_rfc3339(),
        "updated": t.updated.to_rfc3339(),
    })
}
