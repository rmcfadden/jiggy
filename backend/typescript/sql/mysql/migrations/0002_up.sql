-- Generated migration for mysql
CREATE TABLE template_types (
    id BIGINT AUTO_INCREMENT NOT NULL,
    uuid CHAR(36) DEFAULT (UUID()) NOT NULL,
    created DATETIME(3) DEFAULT (UTC_TIMESTAMP(3)) NOT NULL,
    updated DATETIME(3) DEFAULT (UTC_TIMESTAMP(3)) NOT NULL,
    version BLOB DEFAULT (X'00') NOT NULL,
    name VARCHAR(128) NOT NULL,
    description TEXT DEFAULT ('') NOT NULL,
    CONSTRAINT template_types_primary_key PRIMARY KEY (id),
    CONSTRAINT template_types_uuid_unique_constraint UNIQUE (uuid),
    CONSTRAINT template_types_name_unique_constraint UNIQUE (name)
);
GO
CREATE TRIGGER trg_template_types_updated_at BEFORE UPDATE ON template_types
FOR EACH ROW SET NEW.updated = (UTC_TIMESTAMP(3));
GO
CREATE TABLE templates (
    id BIGINT AUTO_INCREMENT NOT NULL,
    uuid CHAR(36) DEFAULT (UUID()) NOT NULL,
    created DATETIME(3) DEFAULT (UTC_TIMESTAMP(3)) NOT NULL,
    updated DATETIME(3) DEFAULT (UTC_TIMESTAMP(3)) NOT NULL,
    version BLOB DEFAULT (X'00') NOT NULL,
    template_type_id BIGINT NOT NULL,
    name VARCHAR(128) NOT NULL,
    content TEXT NOT NULL,
    CONSTRAINT templates_primary_key PRIMARY KEY (id),
    CONSTRAINT templates_uuid_unique_constraint UNIQUE (uuid),
    CONSTRAINT templates_template_type_id_foreign_key FOREIGN KEY (template_type_id) REFERENCES template_types (id)
);
GO
CREATE UNIQUE INDEX templates_template_template_type_id_name_index ON templates (template_type_id, name);
GO
CREATE TRIGGER trg_templates_updated_at BEFORE UPDATE ON templates
FOR EACH ROW SET NEW.updated = (UTC_TIMESTAMP(3));
-- Seed data
-- Seeds: template_types
GO
INSERT INTO template_types (id, uuid, name, description) VALUES (1, '88ba1ed1-69f1-54cf-9b1f-0273aaa19012', 'jigsaw', 'Jigsaw template settings');
