-- Rollback migration for postgres
DROP TRIGGER IF EXISTS "trg_templates_updated_at" ON "templates";
GO
DROP INDEX IF EXISTS "templates_template_template_type_id_name_index";
GO
DROP TABLE IF EXISTS "templates";
GO
DROP TRIGGER IF EXISTS "trg_template_types_updated_at" ON "template_types";
GO
DROP TABLE IF EXISTS "template_types";
