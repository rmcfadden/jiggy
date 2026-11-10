use crate::services::templates::{TemplateError, TemplatesService};
use axum::{
    extract::{Path, Query, State},
    http::StatusCode,
    routing::get,
    Json, Router,
};
use serde_json::Value;
use std::{collections::HashMap, sync::Arc};

type Service = State<Arc<TemplatesService>>;
type Reply = Result<Json<Value>, StatusCode>;

pub fn router(service: Arc<TemplatesService>) -> Router {
    Router::new()
        .route("/api/templates", get(list).post(create))
        .route("/api/templates/{id}", get(read).put(update).delete(remove))
        .with_state(service)
}

fn fail(err: TemplateError) -> StatusCode {
    match err {
        TemplateError::Datasource(err) => {
            eprintln!("templates: {err:?}");
            StatusCode::INTERNAL_SERVER_ERROR
        }
    }
}

async fn list(State(service): Service, Query(query): Query<HashMap<String, String>>) -> Reply {
    Ok(Json(Value::Array(service.list(query.get("type").map(String::as_str)).await.map_err(fail)?)))
}

async fn read(State(service): Service, Path(id): Path<i64>) -> Reply {
    service.get(id).await.map_err(fail)?.map(Json).ok_or(StatusCode::NOT_FOUND)
}

async fn create(State(service): Service, Json(body): Json<Value>) -> Result<(StatusCode, Json<Value>), StatusCode> {
    Ok((StatusCode::CREATED, Json(service.create(&body).await.map_err(fail)?)))
}

async fn update(State(service): Service, Path(id): Path<i64>, Json(body): Json<Value>) -> Reply {
    service.update(id, &body).await.map_err(fail)?.map(Json).ok_or(StatusCode::NOT_FOUND)
}

async fn remove(State(service): Service, Path(id): Path<i64>) -> StatusCode {
    match service.delete(id).await {
        Ok(true) => StatusCode::NO_CONTENT,
        Ok(false) => StatusCode::NOT_FOUND,
        Err(err) => fail(err),
    }
}
