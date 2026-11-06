-- Generated migration for sqlite
CREATE TABLE "template_types" (
    "id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    "uuid" TEXT CONSTRAINT "template_types_uuid_default_constraint" DEFAULT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))), 2) || '-' || substr('89ab', abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))), 2) || '-' || lower(hex(randomblob(6)))) NOT NULL,
    "created" TEXT CONSTRAINT "template_types_created_default_constraint" DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
    "updated" TEXT CONSTRAINT "template_types_updated_default_constraint" DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
    "version" BLOB CONSTRAINT "template_types_version_default_constraint" DEFAULT X'00' NOT NULL,
    "name" VARCHAR(128) NOT NULL,
    "description" TEXT CONSTRAINT "template_types_description_default_constraint" DEFAULT '' NOT NULL,
    CONSTRAINT "template_types_uuid_unique_constraint" UNIQUE ("uuid"),
    CONSTRAINT "template_types_name_unique_constraint" UNIQUE ("name")
);
GO
CREATE TRIGGER "trg_template_types_updated_at"
AFTER UPDATE ON "template_types"
FOR EACH ROW
WHEN NEW."updated" IS OLD."updated"
BEGIN
  UPDATE "template_types" SET "updated" = (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) WHERE "id" = OLD."id";
END;
GO
CREATE TABLE "templates" (
    "id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    "uuid" TEXT CONSTRAINT "templates_uuid_default_constraint" DEFAULT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))), 2) || '-' || substr('89ab', abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))), 2) || '-' || lower(hex(randomblob(6)))) NOT NULL,
    "created" TEXT CONSTRAINT "templates_created_default_constraint" DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
    "updated" TEXT CONSTRAINT "templates_updated_default_constraint" DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
    "version" BLOB CONSTRAINT "templates_version_default_constraint" DEFAULT X'00' NOT NULL,
    "template_type_id" INTEGER NOT NULL,
    "name" VARCHAR(128) NOT NULL,
    "content" TEXT NOT NULL,
    CONSTRAINT "templates_uuid_unique_constraint" UNIQUE ("uuid"),
    CONSTRAINT "templates_template_type_id_foreign_key" FOREIGN KEY ("template_type_id") REFERENCES "template_types" ("id")
);
GO
CREATE UNIQUE INDEX "templates_template_template_type_id_name_index" ON "templates" ("template_type_id", "name");
GO
CREATE TRIGGER "trg_templates_updated_at"
AFTER UPDATE ON "templates"
FOR EACH ROW
WHEN NEW."updated" IS OLD."updated"
BEGIN
  UPDATE "templates" SET "updated" = (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) WHERE "id" = OLD."id";
END;
-- Seed data
-- Seeds: template_types
GO
INSERT INTO "template_types" ("id", "uuid", "name", "description") VALUES (1, '88ba1ed1-69f1-54cf-9b1f-0273aaa19012', 'jigsaw', 'Jigsaw template settings');
