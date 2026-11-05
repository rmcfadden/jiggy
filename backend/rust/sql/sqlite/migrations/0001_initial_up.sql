-- Generated initial migration for sqlite

-- Create added tables
CREATE TABLE "users" ("id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, "uuid" TEXT CONSTRAINT "users_uuid_default_constraint" DEFAULT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))), 2) || '-' || substr('89ab', abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))), 2) || '-' || lower(hex(randomblob(6)))) NOT NULL, "created" TEXT CONSTRAINT "users_created_default_constraint" DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL, "updated" TEXT CONSTRAINT "users_updated_default_constraint" DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL, "version" BLOB CONSTRAINT "users_version_default_constraint" DEFAULT X'00' NOT NULL, "username" TEXT NOT NULL, "is_enabled" BOOLEAN CONSTRAINT "users_is_enabled_default_constraint" DEFAULT 1 NOT NULL, CONSTRAINT "users_uuid_unique_constraint" UNIQUE ("uuid"));
GO
CREATE TRIGGER "trg_users_updated_at"
AFTER UPDATE ON "users"
FOR EACH ROW
WHEN NEW."updated" IS OLD."updated"
BEGIN
  UPDATE "users" SET "updated" = (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) WHERE "id" = OLD."id";
END;
GO
CREATE TABLE "roles" ("id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, "uuid" TEXT CONSTRAINT "roles_uuid_default_constraint" DEFAULT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))), 2) || '-' || substr('89ab', abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))), 2) || '-' || lower(hex(randomblob(6)))) NOT NULL, "created" TEXT CONSTRAINT "roles_created_default_constraint" DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL, "updated" TEXT CONSTRAINT "roles_updated_default_constraint" DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL, "version" BLOB CONSTRAINT "roles_version_default_constraint" DEFAULT X'00' NOT NULL, "name" TEXT NOT NULL, "description" TEXT CONSTRAINT "roles_description_default_constraint" DEFAULT '' NOT NULL, "is_enabled" BOOLEAN CONSTRAINT "roles_is_enabled_default_constraint" DEFAULT 1 NOT NULL, CONSTRAINT "roles_uuid_unique_constraint" UNIQUE ("uuid"));
GO
CREATE TRIGGER "trg_roles_updated_at"
AFTER UPDATE ON "roles"
FOR EACH ROW
WHEN NEW."updated" IS OLD."updated"
BEGIN
  UPDATE "roles" SET "updated" = (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) WHERE "id" = OLD."id";
END;
GO
CREATE TABLE "groups" ("id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, "uuid" TEXT CONSTRAINT "groups_uuid_default_constraint" DEFAULT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))), 2) || '-' || substr('89ab', abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))), 2) || '-' || lower(hex(randomblob(6)))) NOT NULL, "created" TEXT CONSTRAINT "groups_created_default_constraint" DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL, "updated" TEXT CONSTRAINT "groups_updated_default_constraint" DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL, "version" BLOB CONSTRAINT "groups_version_default_constraint" DEFAULT X'00' NOT NULL, "name" TEXT NOT NULL, "description" TEXT CONSTRAINT "groups_description_default_constraint" DEFAULT '' NOT NULL, "is_enabled" BOOLEAN CONSTRAINT "groups_is_enabled_default_constraint" DEFAULT 1 NOT NULL, CONSTRAINT "groups_uuid_unique_constraint" UNIQUE ("uuid"));
GO
CREATE TRIGGER "trg_groups_updated_at"
AFTER UPDATE ON "groups"
FOR EACH ROW
WHEN NEW."updated" IS OLD."updated"
BEGIN
  UPDATE "groups" SET "updated" = (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) WHERE "id" = OLD."id";
END;
GO
CREATE TABLE "user_groups" ("id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, "uuid" TEXT CONSTRAINT "user_groups_uuid_default_constraint" DEFAULT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))), 2) || '-' || substr('89ab', abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))), 2) || '-' || lower(hex(randomblob(6)))) NOT NULL, "created" TEXT CONSTRAINT "user_groups_created_default_constraint" DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL, "updated" TEXT CONSTRAINT "user_groups_updated_default_constraint" DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL, "version" BLOB CONSTRAINT "user_groups_version_default_constraint" DEFAULT X'00' NOT NULL, "user_id" INTEGER NOT NULL, "group_id" INTEGER NOT NULL, CONSTRAINT "user_groups_uuid_unique_constraint" UNIQUE ("uuid"), CONSTRAINT "user_groups_user_id_foreign_key" FOREIGN KEY ("user_id") REFERENCES "users" ("id"), CONSTRAINT "user_groups_group_id_foreign_key" FOREIGN KEY ("group_id") REFERENCES "groups" ("id"));
GO
CREATE TRIGGER "trg_user_groups_updated_at"
AFTER UPDATE ON "user_groups"
FOR EACH ROW
WHEN NEW."updated" IS OLD."updated"
BEGIN
  UPDATE "user_groups" SET "updated" = (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) WHERE "id" = OLD."id";
END;
GO
CREATE TABLE "user_roles" ("id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, "uuid" TEXT CONSTRAINT "user_roles_uuid_default_constraint" DEFAULT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))), 2) || '-' || substr('89ab', abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))), 2) || '-' || lower(hex(randomblob(6)))) NOT NULL, "created" TEXT CONSTRAINT "user_roles_created_default_constraint" DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL, "updated" TEXT CONSTRAINT "user_roles_updated_default_constraint" DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL, "version" BLOB CONSTRAINT "user_roles_version_default_constraint" DEFAULT X'00' NOT NULL, "user_id" INTEGER NOT NULL, "role_id" INTEGER NOT NULL, CONSTRAINT "user_roles_uuid_unique_constraint" UNIQUE ("uuid"), CONSTRAINT "user_roles_user_id_foreign_key" FOREIGN KEY ("user_id") REFERENCES "users" ("id"), CONSTRAINT "user_roles_role_id_foreign_key" FOREIGN KEY ("role_id") REFERENCES "roles" ("id"));
GO
CREATE TRIGGER "trg_user_roles_updated_at"
AFTER UPDATE ON "user_roles"
FOR EACH ROW
WHEN NEW."updated" IS OLD."updated"
BEGIN
  UPDATE "user_roles" SET "updated" = (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) WHERE "id" = OLD."id";
END;
GO
CREATE TABLE "user_settings" ("id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, "uuid" TEXT CONSTRAINT "user_settings_uuid_default_constraint" DEFAULT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))), 2) || '-' || substr('89ab', abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))), 2) || '-' || lower(hex(randomblob(6)))) NOT NULL, "created" TEXT CONSTRAINT "user_settings_created_default_constraint" DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL, "updated" TEXT CONSTRAINT "user_settings_updated_default_constraint" DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL, "version" BLOB CONSTRAINT "user_settings_version_default_constraint" DEFAULT X'00' NOT NULL, "user_id" INTEGER NOT NULL, "name" VARCHAR(128) NOT NULL, "value" TEXT NOT NULL, CONSTRAINT "user_settings_uuid_unique_constraint" UNIQUE ("uuid"), CONSTRAINT "user_settings_user_id_foreign_key" FOREIGN KEY ("user_id") REFERENCES "users" ("id"));
GO
CREATE UNIQUE INDEX "user_settings_user_setting_user_id_name_index" ON "user_settings" ("user_id", "name");
GO
CREATE TRIGGER "trg_user_settings_updated_at"
AFTER UPDATE ON "user_settings"
FOR EACH ROW
WHEN NEW."updated" IS OLD."updated"
BEGIN
  UPDATE "user_settings" SET "updated" = (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) WHERE "id" = OLD."id";
END;
GO
CREATE TABLE "contact_sources" ("id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, "uuid" TEXT CONSTRAINT "contact_sources_uuid_default_constraint" DEFAULT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))), 2) || '-' || substr('89ab', abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))), 2) || '-' || lower(hex(randomblob(6)))) NOT NULL, "created" TEXT CONSTRAINT "contact_sources_created_default_constraint" DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL, "updated" TEXT CONSTRAINT "contact_sources_updated_default_constraint" DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL, "version" BLOB CONSTRAINT "contact_sources_version_default_constraint" DEFAULT X'00' NOT NULL, "name" VARCHAR(64) NOT NULL, "description" TEXT, CONSTRAINT "contact_sources_uuid_unique_constraint" UNIQUE ("uuid"));
GO
CREATE TRIGGER "trg_contact_sources_updated_at"
AFTER UPDATE ON "contact_sources"
FOR EACH ROW
WHEN NEW."updated" IS OLD."updated"
BEGIN
  UPDATE "contact_sources" SET "updated" = (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) WHERE "id" = OLD."id";
END;
GO
CREATE TABLE "address_types" ("id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, "uuid" TEXT CONSTRAINT "address_types_uuid_default_constraint" DEFAULT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))), 2) || '-' || substr('89ab', abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))), 2) || '-' || lower(hex(randomblob(6)))) NOT NULL, "created" TEXT CONSTRAINT "address_types_created_default_constraint" DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL, "updated" TEXT CONSTRAINT "address_types_updated_default_constraint" DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL, "version" BLOB CONSTRAINT "address_types_version_default_constraint" DEFAULT X'00' NOT NULL, "name" VARCHAR(64) NOT NULL, "description" TEXT, CONSTRAINT "address_types_uuid_unique_constraint" UNIQUE ("uuid"));
GO
CREATE TRIGGER "trg_address_types_updated_at"
AFTER UPDATE ON "address_types"
FOR EACH ROW
WHEN NEW."updated" IS OLD."updated"
BEGIN
  UPDATE "address_types" SET "updated" = (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) WHERE "id" = OLD."id";
END;
GO
CREATE TABLE "phone_types" ("id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, "uuid" TEXT CONSTRAINT "phone_types_uuid_default_constraint" DEFAULT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))), 2) || '-' || substr('89ab', abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))), 2) || '-' || lower(hex(randomblob(6)))) NOT NULL, "created" TEXT CONSTRAINT "phone_types_created_default_constraint" DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL, "updated" TEXT CONSTRAINT "phone_types_updated_default_constraint" DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL, "version" BLOB CONSTRAINT "phone_types_version_default_constraint" DEFAULT X'00' NOT NULL, "name" VARCHAR(64) NOT NULL, "description" TEXT, CONSTRAINT "phone_types_uuid_unique_constraint" UNIQUE ("uuid"));
GO
CREATE TRIGGER "trg_phone_types_updated_at"
AFTER UPDATE ON "phone_types"
FOR EACH ROW
WHEN NEW."updated" IS OLD."updated"
BEGIN
  UPDATE "phone_types" SET "updated" = (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) WHERE "id" = OLD."id";
END;
GO
CREATE TABLE "contact_bases" ("id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, "uuid" TEXT CONSTRAINT "contact_bases_uuid_default_constraint" DEFAULT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))), 2) || '-' || substr('89ab', abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))), 2) || '-' || lower(hex(randomblob(6)))) NOT NULL, "created" TEXT CONSTRAINT "contact_bases_created_default_constraint" DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL, "updated" TEXT CONSTRAINT "contact_bases_updated_default_constraint" DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL, "version" BLOB CONSTRAINT "contact_bases_version_default_constraint" DEFAULT X'00' NOT NULL, "contact_source_id" INTEGER NOT NULL, "first_name" VARCHAR(128) NOT NULL, "last_name" VARCHAR(128) NOT NULL, "email" VARCHAR(256), "notes" TEXT, "user_id" INTEGER NOT NULL, CONSTRAINT "contact_bases_uuid_unique_constraint" UNIQUE ("uuid"), CONSTRAINT "contact_bases_contact_source_id_foreign_key" FOREIGN KEY ("contact_source_id") REFERENCES "contact_sources" ("id"), CONSTRAINT "contact_bases_user_id_foreign_key" FOREIGN KEY ("user_id") REFERENCES "users" ("id"));
GO
CREATE TRIGGER "trg_contact_bases_updated_at"
AFTER UPDATE ON "contact_bases"
FOR EACH ROW
WHEN NEW."updated" IS OLD."updated"
BEGIN
  UPDATE "contact_bases" SET "updated" = (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) WHERE "id" = OLD."id";
END;
GO
CREATE TABLE "address_bases" ("id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, "uuid" TEXT CONSTRAINT "address_bases_uuid_default_constraint" DEFAULT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))), 2) || '-' || substr('89ab', abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))), 2) || '-' || lower(hex(randomblob(6)))) NOT NULL, "created" TEXT CONSTRAINT "address_bases_created_default_constraint" DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL, "updated" TEXT CONSTRAINT "address_bases_updated_default_constraint" DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL, "version" BLOB CONSTRAINT "address_bases_version_default_constraint" DEFAULT X'00' NOT NULL, "latitude" INTEGER, "label_note" VARCHAR(128), "floor" INTEGER, "score" NUMERIC, "external_id" TEXT, "is_verified" BOOLEAN, "verified_at" TEXT, "stamp" BLOB, "contact_id" INTEGER NOT NULL, "address_type_id" INTEGER NOT NULL, "line1" VARCHAR(256) NOT NULL, "line2" VARCHAR(256), "city" VARCHAR(128) NOT NULL, "region" VARCHAR(128), "postal_code" VARCHAR(32), "country" VARCHAR(64), CONSTRAINT "address_bases_uuid_unique_constraint" UNIQUE ("uuid"), CONSTRAINT "address_bases_contact_id_foreign_key" FOREIGN KEY ("contact_id") REFERENCES "contact_bases" ("id"), CONSTRAINT "address_bases_address_type_id_foreign_key" FOREIGN KEY ("address_type_id") REFERENCES "address_types" ("id"));
GO
CREATE TRIGGER "trg_address_bases_updated_at"
AFTER UPDATE ON "address_bases"
FOR EACH ROW
WHEN NEW."updated" IS OLD."updated"
BEGIN
  UPDATE "address_bases" SET "updated" = (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) WHERE "id" = OLD."id";
END;
GO
CREATE TABLE "phone_bases" ("id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, "uuid" TEXT CONSTRAINT "phone_bases_uuid_default_constraint" DEFAULT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))), 2) || '-' || substr('89ab', abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))), 2) || '-' || lower(hex(randomblob(6)))) NOT NULL, "created" TEXT CONSTRAINT "phone_bases_created_default_constraint" DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL, "updated" TEXT CONSTRAINT "phone_bases_updated_default_constraint" DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL, "version" BLOB CONSTRAINT "phone_bases_version_default_constraint" DEFAULT X'00' NOT NULL, "contact_id" INTEGER NOT NULL, "phone_type_id" INTEGER NOT NULL, "number" VARCHAR(32) NOT NULL, "label" VARCHAR(32), CONSTRAINT "phone_bases_uuid_unique_constraint" UNIQUE ("uuid"), CONSTRAINT "phone_bases_contact_id_foreign_key" FOREIGN KEY ("contact_id") REFERENCES "contact_bases" ("id"), CONSTRAINT "phone_bases_phone_type_id_foreign_key" FOREIGN KEY ("phone_type_id") REFERENCES "phone_types" ("id"));
GO
CREATE TRIGGER "trg_phone_bases_updated_at"
AFTER UPDATE ON "phone_bases"
FOR EACH ROW
WHEN NEW."updated" IS OLD."updated"
BEGIN
  UPDATE "phone_bases" SET "updated" = (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) WHERE "id" = OLD."id";
END;
GO
CREATE TABLE "contact_group_bases" ("id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, "uuid" TEXT CONSTRAINT "contact_group_bases_uuid_default_constraint" DEFAULT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))), 2) || '-' || substr('89ab', abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))), 2) || '-' || lower(hex(randomblob(6)))) NOT NULL, "created" TEXT CONSTRAINT "contact_group_bases_created_default_constraint" DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL, "updated" TEXT CONSTRAINT "contact_group_bases_updated_default_constraint" DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL, "version" BLOB CONSTRAINT "contact_group_bases_version_default_constraint" DEFAULT X'00' NOT NULL, "name" VARCHAR(128) NOT NULL, "description" TEXT, CONSTRAINT "contact_group_bases_uuid_unique_constraint" UNIQUE ("uuid"));
GO
CREATE TRIGGER "trg_contact_group_bases_updated_at"
AFTER UPDATE ON "contact_group_bases"
FOR EACH ROW
WHEN NEW."updated" IS OLD."updated"
BEGIN
  UPDATE "contact_group_bases" SET "updated" = (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) WHERE "id" = OLD."id";
END;
GO
CREATE TABLE "contact_settings" ("id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, "uuid" TEXT CONSTRAINT "contact_settings_uuid_default_constraint" DEFAULT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))), 2) || '-' || substr('89ab', abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))), 2) || '-' || lower(hex(randomblob(6)))) NOT NULL, "created" TEXT CONSTRAINT "contact_settings_created_default_constraint" DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL, "updated" TEXT CONSTRAINT "contact_settings_updated_default_constraint" DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL, "version" BLOB CONSTRAINT "contact_settings_version_default_constraint" DEFAULT X'00' NOT NULL, "contact_id" INTEGER NOT NULL, "key" VARCHAR(64) NOT NULL, "value" TEXT NOT NULL, CONSTRAINT "contact_settings_uuid_unique_constraint" UNIQUE ("uuid"), CONSTRAINT "contact_settings_contact_id_foreign_key" FOREIGN KEY ("contact_id") REFERENCES "contact_bases" ("id"));
GO
CREATE UNIQUE INDEX "contact_settings_owner_key_index" ON "contact_settings" ("contact_id", "key");
GO
CREATE TRIGGER "trg_contact_settings_updated_at"
AFTER UPDATE ON "contact_settings"
FOR EACH ROW
WHEN NEW."updated" IS OLD."updated"
BEGIN
  UPDATE "contact_settings" SET "updated" = (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) WHERE "id" = OLD."id";
END;
GO
CREATE TABLE "contact_preferences" ("id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, "uuid" TEXT CONSTRAINT "contact_preferences_uuid_default_constraint" DEFAULT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))), 2) || '-' || substr('89ab', abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))), 2) || '-' || lower(hex(randomblob(6)))) NOT NULL, "created" TEXT CONSTRAINT "contact_preferences_created_default_constraint" DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL, "updated" TEXT CONSTRAINT "contact_preferences_updated_default_constraint" DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL, "version" BLOB CONSTRAINT "contact_preferences_version_default_constraint" DEFAULT X'00' NOT NULL, "contact_id" INTEGER NOT NULL, "key" VARCHAR(64) NOT NULL, "locale" VARCHAR(16) NOT NULL, "timezone" VARCHAR(64) NOT NULL, CONSTRAINT "contact_preferences_uuid_unique_constraint" UNIQUE ("uuid"), CONSTRAINT "contact_preferences_contact_id_foreign_key" FOREIGN KEY ("contact_id") REFERENCES "contact_bases" ("id"));
GO
CREATE UNIQUE INDEX "contact_preferences_owner_key_index" ON "contact_preferences" ("contact_id", "key");
GO
CREATE TRIGGER "trg_contact_preferences_updated_at"
AFTER UPDATE ON "contact_preferences"
FOR EACH ROW
WHEN NEW."updated" IS OLD."updated"
BEGIN
  UPDATE "contact_preferences" SET "updated" = (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) WHERE "id" = OLD."id";
END;
GO
CREATE TABLE "contact_group_members" ("id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, "uuid" TEXT CONSTRAINT "contact_group_members_uuid_default_constraint" DEFAULT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))), 2) || '-' || substr('89ab', abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))), 2) || '-' || lower(hex(randomblob(6)))) NOT NULL, "created" TEXT CONSTRAINT "contact_group_members_created_default_constraint" DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL, "updated" TEXT CONSTRAINT "contact_group_members_updated_default_constraint" DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL, "version" BLOB CONSTRAINT "contact_group_members_version_default_constraint" DEFAULT X'00' NOT NULL, "contact_id" INTEGER NOT NULL, "contact_group_id" INTEGER NOT NULL, CONSTRAINT "contact_group_members_uuid_unique_constraint" UNIQUE ("uuid"), CONSTRAINT "contact_group_members_contact_id_foreign_key" FOREIGN KEY ("contact_id") REFERENCES "contact_bases" ("id"), CONSTRAINT "contact_group_members_contact_group_id_foreign_key" FOREIGN KEY ("contact_group_id") REFERENCES "contact_group_bases" ("id"));
GO
CREATE TRIGGER "trg_contact_group_members_updated_at"
AFTER UPDATE ON "contact_group_members"
FOR EACH ROW
WHEN NEW."updated" IS OLD."updated"
BEGIN
  UPDATE "contact_group_members" SET "updated" = (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) WHERE "id" = OLD."id";
END;
GO
CREATE TABLE "legacy_contacts" ("key" VARCHAR(64) NOT NULL, "first_name" VARCHAR(128) NOT NULL, "last_name" VARCHAR(128) NOT NULL, "email" VARCHAR(256), "imported_at" TEXT);
GO
CREATE TABLE "contact_change_logs" ("id" INTEGER NOT NULL, "occurred_at" TEXT NOT NULL, "contact_id" INTEGER NOT NULL, "changed_by" VARCHAR(128) NOT NULL, "change_summary" TEXT NOT NULL, CONSTRAINT "contact_change_logs_primary_key" PRIMARY KEY ("id"));
GO
CREATE TABLE "categories" ("id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, "uuid" TEXT CONSTRAINT "categories_uuid_default_constraint" DEFAULT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))), 2) || '-' || substr('89ab', abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))), 2) || '-' || lower(hex(randomblob(6)))) NOT NULL, "created" TEXT CONSTRAINT "categories_created_default_constraint" DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL, "updated" TEXT CONSTRAINT "categories_updated_default_constraint" DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL, "version" BLOB CONSTRAINT "categories_version_default_constraint" DEFAULT X'00' NOT NULL, "category_id" INTEGER, "name" VARCHAR(128) NOT NULL, "description" TEXT NOT NULL, "is_enabled" BOOLEAN CONSTRAINT "categories_is_enabled_default_constraint" DEFAULT 1 NOT NULL, "is_deleted" BOOLEAN CONSTRAINT "categories_is_deleted_default_constraint" DEFAULT 0 NOT NULL, CONSTRAINT "categories_uuid_unique_constraint" UNIQUE ("uuid"), CONSTRAINT "categories_category_id_foreign_key" FOREIGN KEY ("category_id") REFERENCES "categories" ("id"));
GO
CREATE TRIGGER "trg_categories_updated_at"
AFTER UPDATE ON "categories"
FOR EACH ROW
WHEN NEW."updated" IS OLD."updated"
BEGIN
  UPDATE "categories" SET "updated" = (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) WHERE "id" = OLD."id";
END;
GO
CREATE TABLE "game_bases" ("id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, "uuid" TEXT CONSTRAINT "game_bases_uuid_default_constraint" DEFAULT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))), 2) || '-' || substr('89ab', abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))), 2) || '-' || lower(hex(randomblob(6)))) NOT NULL, "created" TEXT CONSTRAINT "game_bases_created_default_constraint" DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL, "updated" TEXT CONSTRAINT "game_bases_updated_default_constraint" DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL, "version" BLOB CONSTRAINT "game_bases_version_default_constraint" DEFAULT X'00' NOT NULL, "name" VARCHAR(128) NOT NULL, "description" TEXT NOT NULL, "location" VARCHAR(256) NOT NULL, "is_enabled" BOOLEAN CONSTRAINT "game_bases_is_enabled_default_constraint" DEFAULT 1 NOT NULL, "is_deleted" BOOLEAN CONSTRAINT "game_bases_is_deleted_default_constraint" DEFAULT 0 NOT NULL, CONSTRAINT "game_bases_uuid_unique_constraint" UNIQUE ("uuid"));
GO
CREATE TRIGGER "trg_game_bases_updated_at"
AFTER UPDATE ON "game_bases"
FOR EACH ROW
WHEN NEW."updated" IS OLD."updated"
BEGIN
  UPDATE "game_bases" SET "updated" = (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) WHERE "id" = OLD."id";
END;
GO
CREATE TABLE "game_categories" ("id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, "uuid" TEXT CONSTRAINT "game_categories_uuid_default_constraint" DEFAULT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))), 2) || '-' || substr('89ab', abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))), 2) || '-' || lower(hex(randomblob(6)))) NOT NULL, "created" TEXT CONSTRAINT "game_categories_created_default_constraint" DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL, "updated" TEXT CONSTRAINT "game_categories_updated_default_constraint" DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL, "version" BLOB CONSTRAINT "game_categories_version_default_constraint" DEFAULT X'00' NOT NULL, "game_id" INTEGER NOT NULL, "category_id" INTEGER NOT NULL, CONSTRAINT "game_categories_uuid_unique_constraint" UNIQUE ("uuid"), CONSTRAINT "game_categories_game_id_foreign_key" FOREIGN KEY ("game_id") REFERENCES "game_bases" ("id"), CONSTRAINT "game_categories_category_id_foreign_key" FOREIGN KEY ("category_id") REFERENCES "categories" ("id"));
GO
CREATE UNIQUE INDEX "game_categories_game_category_game_id_category_id_index" ON "game_categories" ("game_id", "category_id");
GO
CREATE TRIGGER "trg_game_categories_updated_at"
AFTER UPDATE ON "game_categories"
FOR EACH ROW
WHEN NEW."updated" IS OLD."updated"
BEGIN
  UPDATE "game_categories" SET "updated" = (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) WHERE "id" = OLD."id";
END;
GO
CREATE TABLE "game_states" ("id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, "uuid" TEXT CONSTRAINT "game_states_uuid_default_constraint" DEFAULT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))), 2) || '-' || substr('89ab', abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))), 2) || '-' || lower(hex(randomblob(6)))) NOT NULL, "created" TEXT CONSTRAINT "game_states_created_default_constraint" DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL, "updated" TEXT CONSTRAINT "game_states_updated_default_constraint" DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL, "version" BLOB CONSTRAINT "game_states_version_default_constraint" DEFAULT X'00' NOT NULL, "game_id" INTEGER NOT NULL, "user_id" INTEGER NOT NULL, "state" VARCHAR(256) NOT NULL, CONSTRAINT "game_states_uuid_unique_constraint" UNIQUE ("uuid"), CONSTRAINT "game_states_game_id_foreign_key" FOREIGN KEY ("game_id") REFERENCES "game_bases" ("id"), CONSTRAINT "game_states_user_id_foreign_key" FOREIGN KEY ("user_id") REFERENCES "users" ("id"));
GO
CREATE TRIGGER "trg_game_states_updated_at"
AFTER UPDATE ON "game_states"
FOR EACH ROW
WHEN NEW."updated" IS OLD."updated"
BEGIN
  UPDATE "game_states" SET "updated" = (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) WHERE "id" = OLD."id";
END;
GO
CREATE TABLE "game_settings" ("id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, "uuid" TEXT CONSTRAINT "game_settings_uuid_default_constraint" DEFAULT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))), 2) || '-' || substr('89ab', abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))), 2) || '-' || lower(hex(randomblob(6)))) NOT NULL, "created" TEXT CONSTRAINT "game_settings_created_default_constraint" DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL, "updated" TEXT CONSTRAINT "game_settings_updated_default_constraint" DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL, "version" BLOB CONSTRAINT "game_settings_version_default_constraint" DEFAULT X'00' NOT NULL, "game_id" INTEGER NOT NULL, "name" VARCHAR(128) NOT NULL, "value" TEXT NOT NULL, CONSTRAINT "game_settings_uuid_unique_constraint" UNIQUE ("uuid"), CONSTRAINT "game_settings_game_id_foreign_key" FOREIGN KEY ("game_id") REFERENCES "game_bases" ("id"));
GO
CREATE UNIQUE INDEX "game_settings_game_setting_game_id_name_index" ON "game_settings" ("game_id", "name");
GO
CREATE TRIGGER "trg_game_settings_updated_at"
AFTER UPDATE ON "game_settings"
FOR EACH ROW
WHEN NEW."updated" IS OLD."updated"
BEGIN
  UPDATE "game_settings" SET "updated" = (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) WHERE "id" = OLD."id";
END;
GO
CREATE TABLE "reviews" ("id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, "uuid" TEXT CONSTRAINT "reviews_uuid_default_constraint" DEFAULT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))), 2) || '-' || substr('89ab', abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))), 2) || '-' || lower(hex(randomblob(6)))) NOT NULL, "created" TEXT CONSTRAINT "reviews_created_default_constraint" DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL, "updated" TEXT CONSTRAINT "reviews_updated_default_constraint" DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL, "version" BLOB CONSTRAINT "reviews_version_default_constraint" DEFAULT X'00' NOT NULL, "game_id" INTEGER NOT NULL, "user_id" INTEGER NOT NULL, "description" TEXT NOT NULL, "rating" NUMERIC NOT NULL, "is_approved" BOOLEAN CONSTRAINT "reviews_is_approved_default_constraint" DEFAULT 0 NOT NULL, CONSTRAINT "reviews_uuid_unique_constraint" UNIQUE ("uuid"), CONSTRAINT "reviews_game_id_foreign_key" FOREIGN KEY ("game_id") REFERENCES "game_bases" ("id"), CONSTRAINT "reviews_user_id_foreign_key" FOREIGN KEY ("user_id") REFERENCES "users" ("id"));
GO
CREATE TRIGGER "trg_reviews_updated_at"
AFTER UPDATE ON "reviews"
FOR EACH ROW
WHEN NEW."updated" IS OLD."updated"
BEGIN
  UPDATE "reviews" SET "updated" = (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) WHERE "id" = OLD."id";
END;
