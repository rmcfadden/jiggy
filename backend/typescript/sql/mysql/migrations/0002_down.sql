-- Rollback migration for mysql
DROP TRIGGER IF EXISTS trg_templates_updated_at;
GO
DROP INDEX templates_template_template_type_id_name_index ON templates;
GO
DROP TABLE IF EXISTS templates;
GO
DROP TRIGGER IF EXISTS trg_template_types_updated_at;
GO
DROP TABLE IF EXISTS template_types;
