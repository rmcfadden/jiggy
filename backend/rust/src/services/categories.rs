use crate::generated::Category;
use crate::generated::repositories::categoriesRepository::CategoriesRepository;
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
