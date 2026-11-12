use crate::generated::Category;
use crate::generated::repositories::categoriesRepository::CategoriesRepository;
use crate::services::slug::slug;
use futures_util::TryStreamExt;
use serde_json::{json, Value};
use std::sync::Arc;

pub struct CategoriesService {
    repo: Arc<CategoriesRepository>,
}

impl CategoriesService {
    pub fn new(repo: Arc<CategoriesRepository>) -> Self {
        Self { repo }
    }

    /// Categories as a tree: `[{ id, name, description, children }]`, where `id` is the lowercased name.
    pub async fn tree(&self) -> Result<Vec<Value>, datasources::DatasourceError> {
        let rows: Vec<Category> = self.repo.read(None, None).try_collect().await?;
        let rows: Vec<Category> = rows.into_iter().filter(|c| c.is_enabled && !c.is_deleted).collect();
        Ok(children(&rows, None))
    }

    /// Every enabled category with its database id and parent, in id order: `[{ id, parentId, name, description }]`.
    pub async fn flat(&self) -> Result<Vec<Value>, datasources::DatasourceError> {
        let mut rows: Vec<Category> = self.repo.read(None, None).try_collect().await?;
        rows.retain(|c| c.is_enabled && !c.is_deleted);
        rows.sort_by_key(|c| c.id);
        Ok(rows
            .iter()
            .map(|c| json!({ "id": c.id, "parentId": c.category_id, "name": c.name, "description": c.description }))
            .collect())
    }

    /// The ids of the enabled category whose name has this slug and of all its descendants (the category first);
    /// `None` when there is no such category. Names are unique, so there is at most one.
    pub async fn find_by_slug(&self, name: &str) -> Result<Option<Vec<i64>>, datasources::DatasourceError> {
        let mut rows: Vec<Category> = self.repo.read(None, None).try_collect().await?;
        rows.retain(|c| c.is_enabled && !c.is_deleted);
        let Some(found) = rows.iter().find(|c| slug(&c.name) == name) else { return Ok(None) };
        let mut ids = vec![found.id];
        let mut i = 0;
        while i < ids.len() {
            let parent = ids[i];
            ids.extend(rows.iter().filter(|c| c.category_id == Some(parent)).map(|c| c.id));
            i += 1;
        }
        Ok(Some(ids))
    }

    /// Adds the categories in the JSON file at `path` that are not there yet, matching on name and parent
    /// (deleted rows count, so a removed category is not brought back); returns the names it added.
    pub async fn add_categories(&self, path: &std::path::Path) -> Result<Vec<String>, Box<dyn std::error::Error>> {
        let seeds: Vec<Value> = serde_json::from_str(&std::fs::read_to_string(path)?)?;
        let mut rows: Vec<Category> = self.repo.read(None, None).try_collect().await?;
        let mut added = vec![];
        for root in &seeds {
            let parent = self.ensure(&mut rows, root, None, &mut added).await?;
            for child in root["children"].as_array().into_iter().flatten() {
                self.ensure(&mut rows, child, Some(parent), &mut added).await?;
            }
        }
        Ok(added)
    }

    /// The id of the category named by `seed` under `parent`, creating it when missing.
    async fn ensure(&self, rows: &mut Vec<Category>, seed: &Value, parent: Option<i64>, added: &mut Vec<String>) -> Result<i64, datasources::DatasourceError> {
        let name = seed["name"].as_str().unwrap_or_default();
        if let Some(found) = rows.iter().find(|c| c.category_id == parent && c.name.eq_ignore_ascii_case(name)) {
            return Ok(found.id);
        }
        let item = Category {
            category_id: parent,
            name: name.into(),
            description: seed["description"].as_str().unwrap_or_default().into(),
            ..Category::default()
        };
        let created = self.repo.create(item).await?;
        let id = created.id;
        rows.push(created);
        added.push(name.to_string());
        Ok(id)
    }
}

fn children(rows: &[Category], parent: Option<i64>) -> Vec<Value> {
    rows.iter()
        .filter(|c| c.category_id == parent)
        .map(|c| {
            json!({
                "id": c.name.to_lowercase(),
                "name": c.name,
                "description": c.description,
                "children": children(rows, Some(c.id)),
            })
        })
        .collect()
}
