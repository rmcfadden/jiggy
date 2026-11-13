-- Generated initial migration for sqlite

-- Create added tables
CREATE TABLE "users" (
    "id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    "uuid" TEXT CONSTRAINT "users_uuid_default_constraint" DEFAULT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))), 2) || '-' || substr('89ab', abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))), 2) || '-' || lower(hex(randomblob(6)))) NOT NULL,
    "created" TEXT CONSTRAINT "users_created_default_constraint" DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
    "updated" TEXT CONSTRAINT "users_updated_default_constraint" DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
    "version" BLOB CONSTRAINT "users_version_default_constraint" DEFAULT X'00' NOT NULL,
    "username" TEXT NOT NULL,
    "is_enabled" BOOLEAN CONSTRAINT "users_is_enabled_default_constraint" DEFAULT 1 NOT NULL,
    CONSTRAINT "users_uuid_unique_constraint" UNIQUE ("uuid")
);
GO
CREATE TRIGGER "trg_users_updated_at"
AFTER UPDATE ON "users"
FOR EACH ROW
WHEN NEW."updated" IS OLD."updated"
BEGIN
  UPDATE "users" SET "updated" = (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) WHERE "id" = OLD."id";
END;
GO
CREATE TABLE "roles" (
    "id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    "uuid" TEXT CONSTRAINT "roles_uuid_default_constraint" DEFAULT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))), 2) || '-' || substr('89ab', abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))), 2) || '-' || lower(hex(randomblob(6)))) NOT NULL,
    "created" TEXT CONSTRAINT "roles_created_default_constraint" DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
    "updated" TEXT CONSTRAINT "roles_updated_default_constraint" DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
    "version" BLOB CONSTRAINT "roles_version_default_constraint" DEFAULT X'00' NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT CONSTRAINT "roles_description_default_constraint" DEFAULT '' NOT NULL,
    "is_enabled" BOOLEAN CONSTRAINT "roles_is_enabled_default_constraint" DEFAULT 1 NOT NULL,
    CONSTRAINT "roles_uuid_unique_constraint" UNIQUE ("uuid")
);
GO
CREATE TRIGGER "trg_roles_updated_at"
AFTER UPDATE ON "roles"
FOR EACH ROW
WHEN NEW."updated" IS OLD."updated"
BEGIN
  UPDATE "roles" SET "updated" = (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) WHERE "id" = OLD."id";
END;
GO
CREATE TABLE "groups" (
    "id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    "uuid" TEXT CONSTRAINT "groups_uuid_default_constraint" DEFAULT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))), 2) || '-' || substr('89ab', abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))), 2) || '-' || lower(hex(randomblob(6)))) NOT NULL,
    "created" TEXT CONSTRAINT "groups_created_default_constraint" DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
    "updated" TEXT CONSTRAINT "groups_updated_default_constraint" DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
    "version" BLOB CONSTRAINT "groups_version_default_constraint" DEFAULT X'00' NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT CONSTRAINT "groups_description_default_constraint" DEFAULT '' NOT NULL,
    "is_enabled" BOOLEAN CONSTRAINT "groups_is_enabled_default_constraint" DEFAULT 1 NOT NULL,
    CONSTRAINT "groups_uuid_unique_constraint" UNIQUE ("uuid")
);
GO
CREATE TRIGGER "trg_groups_updated_at"
AFTER UPDATE ON "groups"
FOR EACH ROW
WHEN NEW."updated" IS OLD."updated"
BEGIN
  UPDATE "groups" SET "updated" = (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) WHERE "id" = OLD."id";
END;
GO
CREATE TABLE "user_groups" (
    "id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    "uuid" TEXT CONSTRAINT "user_groups_uuid_default_constraint" DEFAULT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))), 2) || '-' || substr('89ab', abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))), 2) || '-' || lower(hex(randomblob(6)))) NOT NULL,
    "created" TEXT CONSTRAINT "user_groups_created_default_constraint" DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
    "updated" TEXT CONSTRAINT "user_groups_updated_default_constraint" DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
    "version" BLOB CONSTRAINT "user_groups_version_default_constraint" DEFAULT X'00' NOT NULL,
    "user_id" INTEGER NOT NULL,
    "group_id" INTEGER NOT NULL,
    CONSTRAINT "user_groups_uuid_unique_constraint" UNIQUE ("uuid"),
    CONSTRAINT "user_groups_user_id_foreign_key" FOREIGN KEY ("user_id") REFERENCES "users" ("id"),
    CONSTRAINT "user_groups_group_id_foreign_key" FOREIGN KEY ("group_id") REFERENCES "groups" ("id")
);
GO
CREATE TRIGGER "trg_user_groups_updated_at"
AFTER UPDATE ON "user_groups"
FOR EACH ROW
WHEN NEW."updated" IS OLD."updated"
BEGIN
  UPDATE "user_groups" SET "updated" = (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) WHERE "id" = OLD."id";
END;
GO
CREATE TABLE "user_roles" (
    "id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    "uuid" TEXT CONSTRAINT "user_roles_uuid_default_constraint" DEFAULT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))), 2) || '-' || substr('89ab', abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))), 2) || '-' || lower(hex(randomblob(6)))) NOT NULL,
    "created" TEXT CONSTRAINT "user_roles_created_default_constraint" DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
    "updated" TEXT CONSTRAINT "user_roles_updated_default_constraint" DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
    "version" BLOB CONSTRAINT "user_roles_version_default_constraint" DEFAULT X'00' NOT NULL,
    "user_id" INTEGER NOT NULL,
    "role_id" INTEGER NOT NULL,
    CONSTRAINT "user_roles_uuid_unique_constraint" UNIQUE ("uuid"),
    CONSTRAINT "user_roles_user_id_foreign_key" FOREIGN KEY ("user_id") REFERENCES "users" ("id"),
    CONSTRAINT "user_roles_role_id_foreign_key" FOREIGN KEY ("role_id") REFERENCES "roles" ("id")
);
GO
CREATE TRIGGER "trg_user_roles_updated_at"
AFTER UPDATE ON "user_roles"
FOR EACH ROW
WHEN NEW."updated" IS OLD."updated"
BEGIN
  UPDATE "user_roles" SET "updated" = (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) WHERE "id" = OLD."id";
END;
GO
CREATE TABLE "user_settings" (
    "id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    "uuid" TEXT CONSTRAINT "user_settings_uuid_default_constraint" DEFAULT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))), 2) || '-' || substr('89ab', abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))), 2) || '-' || lower(hex(randomblob(6)))) NOT NULL,
    "created" TEXT CONSTRAINT "user_settings_created_default_constraint" DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
    "updated" TEXT CONSTRAINT "user_settings_updated_default_constraint" DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
    "version" BLOB CONSTRAINT "user_settings_version_default_constraint" DEFAULT X'00' NOT NULL,
    "user_id" INTEGER NOT NULL,
    "name" VARCHAR(128) NOT NULL,
    "value" TEXT NOT NULL,
    CONSTRAINT "user_settings_uuid_unique_constraint" UNIQUE ("uuid"),
    CONSTRAINT "user_settings_user_id_foreign_key" FOREIGN KEY ("user_id") REFERENCES "users" ("id")
);
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
CREATE TABLE "reviews" (
    "id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    "uuid" TEXT CONSTRAINT "reviews_uuid_default_constraint" DEFAULT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))), 2) || '-' || substr('89ab', abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))), 2) || '-' || lower(hex(randomblob(6)))) NOT NULL,
    "created" TEXT CONSTRAINT "reviews_created_default_constraint" DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
    "updated" TEXT CONSTRAINT "reviews_updated_default_constraint" DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
    "version" BLOB CONSTRAINT "reviews_version_default_constraint" DEFAULT X'00' NOT NULL,
    "user_id" INTEGER NOT NULL,
    "comment" TEXT NOT NULL,
    "rating" NUMERIC NOT NULL,
    "is_moderated" BOOLEAN CONSTRAINT "reviews_is_moderated_default_constraint" DEFAULT 0 NOT NULL,
    CONSTRAINT "reviews_uuid_unique_constraint" UNIQUE ("uuid"),
    CONSTRAINT "reviews_user_id_foreign_key" FOREIGN KEY ("user_id") REFERENCES "users" ("id")
);
GO
CREATE TRIGGER "trg_reviews_updated_at"
AFTER UPDATE ON "reviews"
FOR EACH ROW
WHEN NEW."updated" IS OLD."updated"
BEGIN
  UPDATE "reviews" SET "updated" = (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) WHERE "id" = OLD."id";
END;
GO
CREATE TABLE "review_feedbacks" (
    "id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    "uuid" TEXT CONSTRAINT "review_feedbacks_uuid_default_constraint" DEFAULT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))), 2) || '-' || substr('89ab', abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))), 2) || '-' || lower(hex(randomblob(6)))) NOT NULL,
    "created" TEXT CONSTRAINT "review_feedbacks_created_default_constraint" DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
    "updated" TEXT CONSTRAINT "review_feedbacks_updated_default_constraint" DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
    "version" BLOB CONSTRAINT "review_feedbacks_version_default_constraint" DEFAULT X'00' NOT NULL,
    "review_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "is_positive" BOOLEAN NOT NULL,
    CONSTRAINT "review_feedbacks_uuid_unique_constraint" UNIQUE ("uuid"),
    CONSTRAINT "review_feedbacks_review_id_foreign_key" FOREIGN KEY ("review_id") REFERENCES "reviews" ("id"),
    CONSTRAINT "review_feedbacks_user_id_foreign_key" FOREIGN KEY ("user_id") REFERENCES "users" ("id")
);
GO
CREATE TRIGGER "trg_review_feedbacks_updated_at"
AFTER UPDATE ON "review_feedbacks"
FOR EACH ROW
WHEN NEW."updated" IS OLD."updated"
BEGIN
  UPDATE "review_feedbacks" SET "updated" = (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) WHERE "id" = OLD."id";
END;
GO
CREATE TABLE "genders" (
    "id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    "uuid" TEXT CONSTRAINT "genders_uuid_default_constraint" DEFAULT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))), 2) || '-' || substr('89ab', abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))), 2) || '-' || lower(hex(randomblob(6)))) NOT NULL,
    "created" TEXT CONSTRAINT "genders_created_default_constraint" DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
    "updated" TEXT CONSTRAINT "genders_updated_default_constraint" DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
    "version" BLOB CONSTRAINT "genders_version_default_constraint" DEFAULT X'00' NOT NULL,
    "name" VARCHAR(128) NOT NULL,
    "description" TEXT CONSTRAINT "genders_description_default_constraint" DEFAULT '' NOT NULL,
    CONSTRAINT "genders_uuid_unique_constraint" UNIQUE ("uuid")
);
GO
CREATE TRIGGER "trg_genders_updated_at"
AFTER UPDATE ON "genders"
FOR EACH ROW
WHEN NEW."updated" IS OLD."updated"
BEGIN
  UPDATE "genders" SET "updated" = (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) WHERE "id" = OLD."id";
END;
GO
CREATE TABLE "contacts" (
    "id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    "uuid" TEXT CONSTRAINT "contacts_uuid_default_constraint" DEFAULT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))), 2) || '-' || substr('89ab', abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))), 2) || '-' || lower(hex(randomblob(6)))) NOT NULL,
    "created" TEXT CONSTRAINT "contacts_created_default_constraint" DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
    "updated" TEXT CONSTRAINT "contacts_updated_default_constraint" DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
    "version" BLOB CONSTRAINT "contacts_version_default_constraint" DEFAULT X'00' NOT NULL,
    "name" VARCHAR(512) NOT NULL,
    "given_name" VARCHAR(512) NOT NULL,
    "additional_name" VARCHAR(512) CONSTRAINT "contacts_additional_name_default_constraint" DEFAULT '' NOT NULL,
    "pronunciation" VARCHAR(512) CONSTRAINT "contacts_pronunciation_default_constraint" DEFAULT '' NOT NULL,
    "family_name" VARCHAR(512) CONSTRAINT "contacts_family_name_default_constraint" DEFAULT '' NOT NULL,
    "nick_name" VARCHAR(512) CONSTRAINT "contacts_nick_name_default_constraint" DEFAULT '' NOT NULL,
    "job_title" VARCHAR(512) CONSTRAINT "contacts_job_title_default_constraint" DEFAULT '' NOT NULL,
    "gender_type_id" INTEGER NOT NULL,
    "organization" VARCHAR(512) CONSTRAINT "contacts_organization_default_constraint" DEFAULT '' NOT NULL,
    "is_starred" BOOLEAN CONSTRAINT "contacts_is_starred_default_constraint" DEFAULT 0 NOT NULL,
    "is_favorite" BOOLEAN CONSTRAINT "contacts_is_favorite_default_constraint" DEFAULT 0 NOT NULL,
    "is_deleted" BOOLEAN CONSTRAINT "contacts_is_deleted_default_constraint" DEFAULT 0 NOT NULL,
    "user_id" INTEGER NOT NULL,
    CONSTRAINT "contacts_uuid_unique_constraint" UNIQUE ("uuid"),
    CONSTRAINT "contacts_gender_type_id_foreign_key" FOREIGN KEY ("gender_type_id") REFERENCES "genders" ("id"),
    CONSTRAINT "contacts_user_id_foreign_key" FOREIGN KEY ("user_id") REFERENCES "users" ("id")
);
GO
CREATE TRIGGER "trg_contacts_updated_at"
AFTER UPDATE ON "contacts"
FOR EACH ROW
WHEN NEW."updated" IS OLD."updated"
BEGIN
  UPDATE "contacts" SET "updated" = (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) WHERE "id" = OLD."id";
END;
GO
CREATE TABLE "email_types" (
    "id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    "uuid" TEXT CONSTRAINT "email_types_uuid_default_constraint" DEFAULT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))), 2) || '-' || substr('89ab', abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))), 2) || '-' || lower(hex(randomblob(6)))) NOT NULL,
    "created" TEXT CONSTRAINT "email_types_created_default_constraint" DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
    "updated" TEXT CONSTRAINT "email_types_updated_default_constraint" DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
    "version" BLOB CONSTRAINT "email_types_version_default_constraint" DEFAULT X'00' NOT NULL,
    "name" VARCHAR(128) NOT NULL,
    "description" TEXT CONSTRAINT "email_types_description_default_constraint" DEFAULT '' NOT NULL,
    CONSTRAINT "email_types_uuid_unique_constraint" UNIQUE ("uuid")
);
GO
CREATE TRIGGER "trg_email_types_updated_at"
AFTER UPDATE ON "email_types"
FOR EACH ROW
WHEN NEW."updated" IS OLD."updated"
BEGIN
  UPDATE "email_types" SET "updated" = (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) WHERE "id" = OLD."id";
END;
GO
CREATE TABLE "emails" (
    "id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    "uuid" TEXT CONSTRAINT "emails_uuid_default_constraint" DEFAULT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))), 2) || '-' || substr('89ab', abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))), 2) || '-' || lower(hex(randomblob(6)))) NOT NULL,
    "created" TEXT CONSTRAINT "emails_created_default_constraint" DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
    "updated" TEXT CONSTRAINT "emails_updated_default_constraint" DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
    "version" BLOB CONSTRAINT "emails_version_default_constraint" DEFAULT X'00' NOT NULL,
    "email_type_id" INTEGER NOT NULL,
    "contact_id" INTEGER NOT NULL,
    "address" VARCHAR(320) NOT NULL,
    "display_name" VARCHAR(256) CONSTRAINT "emails_display_name_default_constraint" DEFAULT '' NOT NULL,
    "is_primary" BOOLEAN NOT NULL,
    "is_verified" BOOLEAN CONSTRAINT "emails_is_verified_default_constraint" DEFAULT 0 NOT NULL,
    CONSTRAINT "emails_uuid_unique_constraint" UNIQUE ("uuid"),
    CONSTRAINT "emails_email_type_id_foreign_key" FOREIGN KEY ("email_type_id") REFERENCES "email_types" ("id"),
    CONSTRAINT "emails_contact_id_foreign_key" FOREIGN KEY ("contact_id") REFERENCES "contacts" ("id")
);
GO
CREATE INDEX "emails_email_base_contact_id_index_index" ON "emails" ("contact_id");
GO
CREATE TRIGGER "trg_emails_updated_at"
AFTER UPDATE ON "emails"
FOR EACH ROW
WHEN NEW."updated" IS OLD."updated"
BEGIN
  UPDATE "emails" SET "updated" = (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) WHERE "id" = OLD."id";
END;
GO
CREATE TABLE "phone_types" (
    "id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    "uuid" TEXT CONSTRAINT "phone_types_uuid_default_constraint" DEFAULT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))), 2) || '-' || substr('89ab', abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))), 2) || '-' || lower(hex(randomblob(6)))) NOT NULL,
    "created" TEXT CONSTRAINT "phone_types_created_default_constraint" DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
    "updated" TEXT CONSTRAINT "phone_types_updated_default_constraint" DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
    "version" BLOB CONSTRAINT "phone_types_version_default_constraint" DEFAULT X'00' NOT NULL,
    "name" VARCHAR(128) NOT NULL,
    "description" TEXT CONSTRAINT "phone_types_description_default_constraint" DEFAULT '' NOT NULL,
    CONSTRAINT "phone_types_uuid_unique_constraint" UNIQUE ("uuid")
);
GO
CREATE TRIGGER "trg_phone_types_updated_at"
AFTER UPDATE ON "phone_types"
FOR EACH ROW
WHEN NEW."updated" IS OLD."updated"
BEGIN
  UPDATE "phone_types" SET "updated" = (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) WHERE "id" = OLD."id";
END;
GO
CREATE TABLE "phones" (
    "id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    "uuid" TEXT CONSTRAINT "phones_uuid_default_constraint" DEFAULT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))), 2) || '-' || substr('89ab', abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))), 2) || '-' || lower(hex(randomblob(6)))) NOT NULL,
    "created" TEXT CONSTRAINT "phones_created_default_constraint" DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
    "updated" TEXT CONSTRAINT "phones_updated_default_constraint" DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
    "version" BLOB CONSTRAINT "phones_version_default_constraint" DEFAULT X'00' NOT NULL,
    "phone_type_id" INTEGER NOT NULL,
    "contact_id" INTEGER NOT NULL,
    "number" VARCHAR(20) NOT NULL,
    "display_name" VARCHAR(256) NOT NULL,
    "extention" VARCHAR(10) NOT NULL,
    "is_primary" BOOLEAN NOT NULL,
    "is_verified" BOOLEAN CONSTRAINT "phones_is_verified_default_constraint" DEFAULT 0 NOT NULL,
    CONSTRAINT "phones_uuid_unique_constraint" UNIQUE ("uuid"),
    CONSTRAINT "phones_phone_type_id_foreign_key" FOREIGN KEY ("phone_type_id") REFERENCES "phone_types" ("id"),
    CONSTRAINT "phones_contact_id_foreign_key" FOREIGN KEY ("contact_id") REFERENCES "contacts" ("id")
);
GO
CREATE INDEX "phones_phone_base_contact_id_index_index" ON "phones" ("contact_id");
GO
CREATE TRIGGER "trg_phones_updated_at"
AFTER UPDATE ON "phones"
FOR EACH ROW
WHEN NEW."updated" IS OLD."updated"
BEGIN
  UPDATE "phones" SET "updated" = (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) WHERE "id" = OLD."id";
END;
GO
CREATE TABLE "addresses" (
    "id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    "uuid" TEXT CONSTRAINT "addresses_uuid_default_constraint" DEFAULT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))), 2) || '-' || substr('89ab', abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))), 2) || '-' || lower(hex(randomblob(6)))) NOT NULL,
    "created" TEXT CONSTRAINT "addresses_created_default_constraint" DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
    "updated" TEXT CONSTRAINT "addresses_updated_default_constraint" DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
    "version" BLOB CONSTRAINT "addresses_version_default_constraint" DEFAULT X'00' NOT NULL,
    "contact_id" INTEGER NOT NULL,
    "display_name" VARCHAR(255) CONSTRAINT "addresses_display_name_default_constraint" DEFAULT '' NOT NULL,
    "line_1" VARCHAR(255) NOT NULL,
    "line_2" VARCHAR(255) CONSTRAINT "addresses_line_2_default_constraint" DEFAULT '' NOT NULL,
    "line_3" VARCHAR(255) CONSTRAINT "addresses_line_3_default_constraint" DEFAULT '' NOT NULL,
    "neighborhood" VARCHAR(100) CONSTRAINT "addresses_neighborhood_default_constraint" DEFAULT '' NOT NULL,
    "district" VARCHAR(100) CONSTRAINT "addresses_district_default_constraint" DEFAULT '' NOT NULL,
    "city" VARCHAR(100) NOT NULL,
    "state_province" VARCHAR(100) CONSTRAINT "addresses_state_province_default_constraint" DEFAULT '' NOT NULL,
    "postal_code" VARCHAR(20) CONSTRAINT "addresses_postal_code_default_constraint" DEFAULT '' NOT NULL,
    "country_code" VARCHAR(2) NOT NULL,
    "formatted_address" TEXT CONSTRAINT "addresses_formatted_address_default_constraint" DEFAULT '' NOT NULL,
    "latitude" NUMERIC,
    "longitude" NUMERIC,
    "is_primary" BOOLEAN CONSTRAINT "addresses_is_primary_default_constraint" DEFAULT 0 NOT NULL,
    CONSTRAINT "addresses_uuid_unique_constraint" UNIQUE ("uuid"),
    CONSTRAINT "addresses_contact_id_foreign_key" FOREIGN KEY ("contact_id") REFERENCES "contacts" ("id")
);
GO
CREATE INDEX "addresses_address_base_contact_id_index_index" ON "addresses" ("contact_id");
GO
CREATE TRIGGER "trg_addresses_updated_at"
AFTER UPDATE ON "addresses"
FOR EACH ROW
WHEN NEW."updated" IS OLD."updated"
BEGIN
  UPDATE "addresses" SET "updated" = (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) WHERE "id" = OLD."id";
END;
GO
CREATE TABLE "contact_attributes" (
    "id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    "uuid" TEXT CONSTRAINT "contact_attributes_uuid_default_constraint" DEFAULT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))), 2) || '-' || substr('89ab', abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))), 2) || '-' || lower(hex(randomblob(6)))) NOT NULL,
    "created" TEXT CONSTRAINT "contact_attributes_created_default_constraint" DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
    "updated" TEXT CONSTRAINT "contact_attributes_updated_default_constraint" DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
    "version" BLOB CONSTRAINT "contact_attributes_version_default_constraint" DEFAULT X'00' NOT NULL,
    "contact_id" INTEGER NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "value" TEXT NOT NULL,
    CONSTRAINT "contact_attributes_uuid_unique_constraint" UNIQUE ("uuid"),
    CONSTRAINT "contact_attributes_contact_id_foreign_key" FOREIGN KEY ("contact_id") REFERENCES "contacts" ("id")
);
GO
CREATE INDEX "contact_attributes_contact_attribute_contact_id_index_index" ON "contact_attributes" ("contact_id");
GO
CREATE UNIQUE INDEX "contact_attributes_owner_key_index" ON "contact_attributes" ("contact_id", "name");
GO
CREATE TRIGGER "trg_contact_attributes_updated_at"
AFTER UPDATE ON "contact_attributes"
FOR EACH ROW
WHEN NEW."updated" IS OLD."updated"
BEGIN
  UPDATE "contact_attributes" SET "updated" = (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) WHERE "id" = OLD."id";
END;
GO
CREATE TABLE "address_attributes" (
    "id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    "uuid" TEXT CONSTRAINT "address_attributes_uuid_default_constraint" DEFAULT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))), 2) || '-' || substr('89ab', abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))), 2) || '-' || lower(hex(randomblob(6)))) NOT NULL,
    "created" TEXT CONSTRAINT "address_attributes_created_default_constraint" DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
    "updated" TEXT CONSTRAINT "address_attributes_updated_default_constraint" DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
    "version" BLOB CONSTRAINT "address_attributes_version_default_constraint" DEFAULT X'00' NOT NULL,
    "address_id" INTEGER NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "value" TEXT NOT NULL,
    CONSTRAINT "address_attributes_uuid_unique_constraint" UNIQUE ("uuid"),
    CONSTRAINT "address_attributes_address_id_foreign_key" FOREIGN KEY ("address_id") REFERENCES "addresses" ("id")
);
GO
CREATE INDEX "address_attributes_address_attribute_address_id_index_index" ON "address_attributes" ("address_id");
GO
CREATE UNIQUE INDEX "address_attributes_owner_key_index" ON "address_attributes" ("address_id", "name");
GO
CREATE TRIGGER "trg_address_attributes_updated_at"
AFTER UPDATE ON "address_attributes"
FOR EACH ROW
WHEN NEW."updated" IS OLD."updated"
BEGIN
  UPDATE "address_attributes" SET "updated" = (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) WHERE "id" = OLD."id";
END;
GO
CREATE TABLE "email_attributes" (
    "id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    "uuid" TEXT CONSTRAINT "email_attributes_uuid_default_constraint" DEFAULT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))), 2) || '-' || substr('89ab', abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))), 2) || '-' || lower(hex(randomblob(6)))) NOT NULL,
    "created" TEXT CONSTRAINT "email_attributes_created_default_constraint" DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
    "updated" TEXT CONSTRAINT "email_attributes_updated_default_constraint" DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
    "version" BLOB CONSTRAINT "email_attributes_version_default_constraint" DEFAULT X'00' NOT NULL,
    "email_id" INTEGER NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "value" TEXT NOT NULL,
    CONSTRAINT "email_attributes_uuid_unique_constraint" UNIQUE ("uuid"),
    CONSTRAINT "email_attributes_email_id_foreign_key" FOREIGN KEY ("email_id") REFERENCES "emails" ("id")
);
GO
CREATE UNIQUE INDEX "email_attributes_owner_key_index" ON "email_attributes" ("email_id", "name");
GO
CREATE TRIGGER "trg_email_attributes_updated_at"
AFTER UPDATE ON "email_attributes"
FOR EACH ROW
WHEN NEW."updated" IS OLD."updated"
BEGIN
  UPDATE "email_attributes" SET "updated" = (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) WHERE "id" = OLD."id";
END;
GO
CREATE TABLE "phone_attributes" (
    "id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    "uuid" TEXT CONSTRAINT "phone_attributes_uuid_default_constraint" DEFAULT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))), 2) || '-' || substr('89ab', abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))), 2) || '-' || lower(hex(randomblob(6)))) NOT NULL,
    "created" TEXT CONSTRAINT "phone_attributes_created_default_constraint" DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
    "updated" TEXT CONSTRAINT "phone_attributes_updated_default_constraint" DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
    "version" BLOB CONSTRAINT "phone_attributes_version_default_constraint" DEFAULT X'00' NOT NULL,
    "phone_id" INTEGER NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "value" TEXT NOT NULL,
    CONSTRAINT "phone_attributes_uuid_unique_constraint" UNIQUE ("uuid"),
    CONSTRAINT "phone_attributes_phone_id_foreign_key" FOREIGN KEY ("phone_id") REFERENCES "phones" ("id")
);
GO
CREATE UNIQUE INDEX "phone_attributes_owner_key_index" ON "phone_attributes" ("phone_id", "name");
GO
CREATE TRIGGER "trg_phone_attributes_updated_at"
AFTER UPDATE ON "phone_attributes"
FOR EACH ROW
WHEN NEW."updated" IS OLD."updated"
BEGIN
  UPDATE "phone_attributes" SET "updated" = (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) WHERE "id" = OLD."id";
END;
GO
CREATE TABLE "labels" (
    "id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    "uuid" TEXT CONSTRAINT "labels_uuid_default_constraint" DEFAULT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))), 2) || '-' || substr('89ab', abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))), 2) || '-' || lower(hex(randomblob(6)))) NOT NULL,
    "created" TEXT CONSTRAINT "labels_created_default_constraint" DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
    "updated" TEXT CONSTRAINT "labels_updated_default_constraint" DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
    "version" BLOB CONSTRAINT "labels_version_default_constraint" DEFAULT X'00' NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT CONSTRAINT "labels_description_default_constraint" DEFAULT '' NOT NULL,
    CONSTRAINT "labels_uuid_unique_constraint" UNIQUE ("uuid")
);
GO
CREATE TRIGGER "trg_labels_updated_at"
AFTER UPDATE ON "labels"
FOR EACH ROW
WHEN NEW."updated" IS OLD."updated"
BEGIN
  UPDATE "labels" SET "updated" = (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) WHERE "id" = OLD."id";
END;
GO
CREATE TABLE "contact_labels" (
    "id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    "uuid" TEXT CONSTRAINT "contact_labels_uuid_default_constraint" DEFAULT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))), 2) || '-' || substr('89ab', abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))), 2) || '-' || lower(hex(randomblob(6)))) NOT NULL,
    "created" TEXT CONSTRAINT "contact_labels_created_default_constraint" DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
    "updated" TEXT CONSTRAINT "contact_labels_updated_default_constraint" DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
    "version" BLOB CONSTRAINT "contact_labels_version_default_constraint" DEFAULT X'00' NOT NULL,
    "contact_id" INTEGER NOT NULL,
    "label_id" INTEGER NOT NULL,
    CONSTRAINT "contact_labels_uuid_unique_constraint" UNIQUE ("uuid"),
    CONSTRAINT "contact_labels_contact_id_foreign_key" FOREIGN KEY ("contact_id") REFERENCES "contacts" ("id"),
    CONSTRAINT "contact_labels_label_id_foreign_key" FOREIGN KEY ("label_id") REFERENCES "labels" ("id")
);
GO
CREATE UNIQUE INDEX "contact_labels_contact_label_contact_id_label_id_index" ON "contact_labels" ("contact_id", "label_id");
GO
CREATE INDEX "contact_labels_contact_label_label_id_index_index" ON "contact_labels" ("label_id");
GO
CREATE TRIGGER "trg_contact_labels_updated_at"
AFTER UPDATE ON "contact_labels"
FOR EACH ROW
WHEN NEW."updated" IS OLD."updated"
BEGIN
  UPDATE "contact_labels" SET "updated" = (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) WHERE "id" = OLD."id";
END;
GO
CREATE TABLE "address_labels" (
    "id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    "uuid" TEXT CONSTRAINT "address_labels_uuid_default_constraint" DEFAULT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))), 2) || '-' || substr('89ab', abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))), 2) || '-' || lower(hex(randomblob(6)))) NOT NULL,
    "created" TEXT CONSTRAINT "address_labels_created_default_constraint" DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
    "updated" TEXT CONSTRAINT "address_labels_updated_default_constraint" DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
    "version" BLOB CONSTRAINT "address_labels_version_default_constraint" DEFAULT X'00' NOT NULL,
    "address_id" INTEGER NOT NULL,
    "label_id" INTEGER NOT NULL,
    CONSTRAINT "address_labels_uuid_unique_constraint" UNIQUE ("uuid"),
    CONSTRAINT "address_labels_address_id_foreign_key" FOREIGN KEY ("address_id") REFERENCES "addresses" ("id"),
    CONSTRAINT "address_labels_label_id_foreign_key" FOREIGN KEY ("label_id") REFERENCES "labels" ("id")
);
GO
CREATE UNIQUE INDEX "address_labels_address_label_address_id_label_id_index" ON "address_labels" ("address_id", "label_id");
GO
CREATE TRIGGER "trg_address_labels_updated_at"
AFTER UPDATE ON "address_labels"
FOR EACH ROW
WHEN NEW."updated" IS OLD."updated"
BEGIN
  UPDATE "address_labels" SET "updated" = (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) WHERE "id" = OLD."id";
END;
GO
CREATE TABLE "email_labels" (
    "id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    "uuid" TEXT CONSTRAINT "email_labels_uuid_default_constraint" DEFAULT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))), 2) || '-' || substr('89ab', abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))), 2) || '-' || lower(hex(randomblob(6)))) NOT NULL,
    "created" TEXT CONSTRAINT "email_labels_created_default_constraint" DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
    "updated" TEXT CONSTRAINT "email_labels_updated_default_constraint" DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
    "version" BLOB CONSTRAINT "email_labels_version_default_constraint" DEFAULT X'00' NOT NULL,
    "email_id" INTEGER NOT NULL,
    "label_id" INTEGER NOT NULL,
    CONSTRAINT "email_labels_uuid_unique_constraint" UNIQUE ("uuid"),
    CONSTRAINT "email_labels_email_id_foreign_key" FOREIGN KEY ("email_id") REFERENCES "emails" ("id"),
    CONSTRAINT "email_labels_label_id_foreign_key" FOREIGN KEY ("label_id") REFERENCES "labels" ("id")
);
GO
CREATE UNIQUE INDEX "email_labels_email_label_email_id_label_id_index" ON "email_labels" ("email_id", "label_id");
GO
CREATE TRIGGER "trg_email_labels_updated_at"
AFTER UPDATE ON "email_labels"
FOR EACH ROW
WHEN NEW."updated" IS OLD."updated"
BEGIN
  UPDATE "email_labels" SET "updated" = (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) WHERE "id" = OLD."id";
END;
GO
CREATE TABLE "phone_labels" (
    "id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    "uuid" TEXT CONSTRAINT "phone_labels_uuid_default_constraint" DEFAULT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))), 2) || '-' || substr('89ab', abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))), 2) || '-' || lower(hex(randomblob(6)))) NOT NULL,
    "created" TEXT CONSTRAINT "phone_labels_created_default_constraint" DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
    "updated" TEXT CONSTRAINT "phone_labels_updated_default_constraint" DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
    "version" BLOB CONSTRAINT "phone_labels_version_default_constraint" DEFAULT X'00' NOT NULL,
    "phone_id" INTEGER NOT NULL,
    "label_id" INTEGER NOT NULL,
    CONSTRAINT "phone_labels_uuid_unique_constraint" UNIQUE ("uuid"),
    CONSTRAINT "phone_labels_phone_id_foreign_key" FOREIGN KEY ("phone_id") REFERENCES "phones" ("id"),
    CONSTRAINT "phone_labels_label_id_foreign_key" FOREIGN KEY ("label_id") REFERENCES "labels" ("id")
);
GO
CREATE UNIQUE INDEX "phone_labels_phone_label_phone_id_label_id_index" ON "phone_labels" ("phone_id", "label_id");
GO
CREATE TRIGGER "trg_phone_labels_updated_at"
AFTER UPDATE ON "phone_labels"
FOR EACH ROW
WHEN NEW."updated" IS OLD."updated"
BEGIN
  UPDATE "phone_labels" SET "updated" = (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) WHERE "id" = OLD."id";
END;
GO
CREATE TABLE "languages" (
    "id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    "uuid" TEXT CONSTRAINT "languages_uuid_default_constraint" DEFAULT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))), 2) || '-' || substr('89ab', abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))), 2) || '-' || lower(hex(randomblob(6)))) NOT NULL,
    "created" TEXT CONSTRAINT "languages_created_default_constraint" DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
    "updated" TEXT CONSTRAINT "languages_updated_default_constraint" DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
    "version" BLOB CONSTRAINT "languages_version_default_constraint" DEFAULT X'00' NOT NULL,
    "code" VARCHAR(2) NOT NULL,
    "name" VARCHAR(128) NOT NULL,
    "is_enabled" BOOLEAN CONSTRAINT "languages_is_enabled_default_constraint" DEFAULT 1 NOT NULL,
    "is_deleted" BOOLEAN CONSTRAINT "languages_is_deleted_default_constraint" DEFAULT 0 NOT NULL,
    CONSTRAINT "languages_uuid_unique_constraint" UNIQUE ("uuid")
);
GO
CREATE TRIGGER "trg_languages_updated_at"
AFTER UPDATE ON "languages"
FOR EACH ROW
WHEN NEW."updated" IS OLD."updated"
BEGIN
  UPDATE "languages" SET "updated" = (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) WHERE "id" = OLD."id";
END;
GO
CREATE TABLE "localized_string_names" (
    "id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    "uuid" TEXT CONSTRAINT "localized_string_names_uuid_default_constraint" DEFAULT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))), 2) || '-' || substr('89ab', abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))), 2) || '-' || lower(hex(randomblob(6)))) NOT NULL,
    "created" TEXT CONSTRAINT "localized_string_names_created_default_constraint" DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
    "updated" TEXT CONSTRAINT "localized_string_names_updated_default_constraint" DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
    "version" BLOB CONSTRAINT "localized_string_names_version_default_constraint" DEFAULT X'00' NOT NULL,
    "name" VARCHAR(128) NOT NULL,
    "description" TEXT NOT NULL,
    CONSTRAINT "localized_string_names_uuid_unique_constraint" UNIQUE ("uuid")
);
GO
CREATE TRIGGER "trg_localized_string_names_updated_at"
AFTER UPDATE ON "localized_string_names"
FOR EACH ROW
WHEN NEW."updated" IS OLD."updated"
BEGIN
  UPDATE "localized_string_names" SET "updated" = (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) WHERE "id" = OLD."id";
END;
GO
CREATE TABLE "localized_strings" (
    "id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    "uuid" TEXT CONSTRAINT "localized_strings_uuid_default_constraint" DEFAULT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))), 2) || '-' || substr('89ab', abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))), 2) || '-' || lower(hex(randomblob(6)))) NOT NULL,
    "created" TEXT CONSTRAINT "localized_strings_created_default_constraint" DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
    "updated" TEXT CONSTRAINT "localized_strings_updated_default_constraint" DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
    "version" BLOB CONSTRAINT "localized_strings_version_default_constraint" DEFAULT X'00' NOT NULL,
    "localized_string_name_id" INTEGER NOT NULL,
    "language_id" INTEGER NOT NULL,
    "value" TEXT NOT NULL,
    "is_enabled" BOOLEAN CONSTRAINT "localized_strings_is_enabled_default_constraint" DEFAULT 1 NOT NULL,
    "is_deleted" BOOLEAN CONSTRAINT "localized_strings_is_deleted_default_constraint" DEFAULT 0 NOT NULL,
    CONSTRAINT "localized_strings_uuid_unique_constraint" UNIQUE ("uuid"),
    CONSTRAINT "localized_strings_localized_string_name_id_foreign_key" FOREIGN KEY ("localized_string_name_id") REFERENCES "localized_string_names" ("id"),
    CONSTRAINT "localized_strings_language_id_foreign_key" FOREIGN KEY ("language_id") REFERENCES "languages" ("id")
);
GO
CREATE TRIGGER "trg_localized_strings_updated_at"
AFTER UPDATE ON "localized_strings"
FOR EACH ROW
WHEN NEW."updated" IS OLD."updated"
BEGIN
  UPDATE "localized_strings" SET "updated" = (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) WHERE "id" = OLD."id";
END;
GO
CREATE TABLE "mime_types" (
    "id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    "uuid" TEXT CONSTRAINT "mime_types_uuid_default_constraint" DEFAULT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))), 2) || '-' || substr('89ab', abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))), 2) || '-' || lower(hex(randomblob(6)))) NOT NULL,
    "created" TEXT CONSTRAINT "mime_types_created_default_constraint" DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
    "updated" TEXT CONSTRAINT "mime_types_updated_default_constraint" DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
    "version" BLOB CONSTRAINT "mime_types_version_default_constraint" DEFAULT X'00' NOT NULL,
    "name" VARCHAR(128) NOT NULL,
    "description" TEXT CONSTRAINT "mime_types_description_default_constraint" DEFAULT '' NOT NULL,
    CONSTRAINT "mime_types_uuid_unique_constraint" UNIQUE ("uuid")
);
GO
CREATE TRIGGER "trg_mime_types_updated_at"
AFTER UPDATE ON "mime_types"
FOR EACH ROW
WHEN NEW."updated" IS OLD."updated"
BEGIN
  UPDATE "mime_types" SET "updated" = (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) WHERE "id" = OLD."id";
END;
GO
CREATE TABLE "resources" (
    "id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    "uuid" TEXT CONSTRAINT "resources_uuid_default_constraint" DEFAULT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))), 2) || '-' || substr('89ab', abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))), 2) || '-' || lower(hex(randomblob(6)))) NOT NULL,
    "created" TEXT CONSTRAINT "resources_created_default_constraint" DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
    "updated" TEXT CONSTRAINT "resources_updated_default_constraint" DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
    "version" BLOB CONSTRAINT "resources_version_default_constraint" DEFAULT X'00' NOT NULL,
    "resource_name" VARCHAR(128) NOT NULL,
    "mime_type_id" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "location" VARCHAR(256) NOT NULL,
    "is_enabled" BOOLEAN CONSTRAINT "resources_is_enabled_default_constraint" DEFAULT 1 NOT NULL,
    "is_deleted" BOOLEAN CONSTRAINT "resources_is_deleted_default_constraint" DEFAULT 0 NOT NULL,
    CONSTRAINT "resources_uuid_unique_constraint" UNIQUE ("uuid"),
    CONSTRAINT "resources_mime_type_id_foreign_key" FOREIGN KEY ("mime_type_id") REFERENCES "mime_types" ("id")
);
GO
CREATE TRIGGER "trg_resources_updated_at"
AFTER UPDATE ON "resources"
FOR EACH ROW
WHEN NEW."updated" IS OLD."updated"
BEGIN
  UPDATE "resources" SET "updated" = (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) WHERE "id" = OLD."id";
END;
GO
CREATE TABLE "template_types" (
    "id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    "uuid" TEXT CONSTRAINT "template_types_uuid_default_constraint" DEFAULT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))), 2) || '-' || substr('89ab', abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))), 2) || '-' || lower(hex(randomblob(6)))) NOT NULL,
    "created" TEXT CONSTRAINT "template_types_created_default_constraint" DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
    "updated" TEXT CONSTRAINT "template_types_updated_default_constraint" DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
    "version" BLOB CONSTRAINT "template_types_version_default_constraint" DEFAULT X'00' NOT NULL,
    "name" VARCHAR(128) NOT NULL,
    "description" TEXT CONSTRAINT "template_types_description_default_constraint" DEFAULT '' NOT NULL,
    CONSTRAINT "template_types_uuid_unique_constraint" UNIQUE ("uuid")
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
    "language_id" INTEGER NOT NULL,
    "name" VARCHAR(128) NOT NULL,
    "content" TEXT NOT NULL,
    CONSTRAINT "templates_uuid_unique_constraint" UNIQUE ("uuid"),
    CONSTRAINT "templates_template_type_id_foreign_key" FOREIGN KEY ("template_type_id") REFERENCES "template_types" ("id"),
    CONSTRAINT "templates_language_id_foreign_key" FOREIGN KEY ("language_id") REFERENCES "languages" ("id")
);
GO
CREATE UNIQUE INDEX "templates_template_template_type_id_name_index" ON "templates" ("template_type_id", "language_id", "name");
GO
CREATE TRIGGER "trg_templates_updated_at"
AFTER UPDATE ON "templates"
FOR EACH ROW
WHEN NEW."updated" IS OLD."updated"
BEGIN
  UPDATE "templates" SET "updated" = (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) WHERE "id" = OLD."id";
END;
GO
CREATE TABLE "log_types" (
    "id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    "uuid" TEXT CONSTRAINT "log_types_uuid_default_constraint" DEFAULT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))), 2) || '-' || substr('89ab', abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))), 2) || '-' || lower(hex(randomblob(6)))) NOT NULL,
    "created" TEXT CONSTRAINT "log_types_created_default_constraint" DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
    "updated" TEXT CONSTRAINT "log_types_updated_default_constraint" DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
    "version" BLOB CONSTRAINT "log_types_version_default_constraint" DEFAULT X'00' NOT NULL,
    "name" VARCHAR(128) NOT NULL,
    "description" TEXT CONSTRAINT "log_types_description_default_constraint" DEFAULT '' NOT NULL,
    CONSTRAINT "log_types_uuid_unique_constraint" UNIQUE ("uuid"),
    CONSTRAINT "log_types_name_unique_constraint" UNIQUE ("name")
);
GO
CREATE TRIGGER "trg_log_types_updated_at"
AFTER UPDATE ON "log_types"
FOR EACH ROW
WHEN NEW."updated" IS OLD."updated"
BEGIN
  UPDATE "log_types" SET "updated" = (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) WHERE "id" = OLD."id";
END;
GO
CREATE TABLE "logs" (
    "id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    "uuid" TEXT CONSTRAINT "logs_uuid_default_constraint" DEFAULT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))), 2) || '-' || substr('89ab', abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))), 2) || '-' || lower(hex(randomblob(6)))) NOT NULL,
    "created" TEXT CONSTRAINT "logs_created_default_constraint" DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
    "updated" TEXT CONSTRAINT "logs_updated_default_constraint" DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
    "version" BLOB CONSTRAINT "logs_version_default_constraint" DEFAULT X'00' NOT NULL,
    "log_type_id" INTEGER NOT NULL,
    "message" TEXT NOT NULL,
    CONSTRAINT "logs_uuid_unique_constraint" UNIQUE ("uuid"),
    CONSTRAINT "logs_log_type_id_foreign_key" FOREIGN KEY ("log_type_id") REFERENCES "log_types" ("id")
);
GO
CREATE INDEX "logs_log_log_type_id_index_index" ON "logs" ("log_type_id");
GO
CREATE TRIGGER "trg_logs_updated_at"
AFTER UPDATE ON "logs"
FOR EACH ROW
WHEN NEW."updated" IS OLD."updated"
BEGIN
  UPDATE "logs" SET "updated" = (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) WHERE "id" = OLD."id";
END;
GO
CREATE TABLE "log_attributes" (
    "id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    "uuid" TEXT CONSTRAINT "log_attributes_uuid_default_constraint" DEFAULT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))), 2) || '-' || substr('89ab', abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))), 2) || '-' || lower(hex(randomblob(6)))) NOT NULL,
    "created" TEXT CONSTRAINT "log_attributes_created_default_constraint" DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
    "updated" TEXT CONSTRAINT "log_attributes_updated_default_constraint" DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
    "version" BLOB CONSTRAINT "log_attributes_version_default_constraint" DEFAULT X'00' NOT NULL,
    "log_id" INTEGER NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "value" TEXT NOT NULL,
    CONSTRAINT "log_attributes_uuid_unique_constraint" UNIQUE ("uuid"),
    CONSTRAINT "log_attributes_log_id_foreign_key" FOREIGN KEY ("log_id") REFERENCES "logs" ("id")
);
GO
CREATE UNIQUE INDEX "log_attributes_owner_key_index" ON "log_attributes" ("log_id", "name");
GO
CREATE TRIGGER "trg_log_attributes_updated_at"
AFTER UPDATE ON "log_attributes"
FOR EACH ROW
WHEN NEW."updated" IS OLD."updated"
BEGIN
  UPDATE "log_attributes" SET "updated" = (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) WHERE "id" = OLD."id";
END;
GO
CREATE TABLE "categories" (
    "id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    "uuid" TEXT CONSTRAINT "categories_uuid_default_constraint" DEFAULT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))), 2) || '-' || substr('89ab', abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))), 2) || '-' || lower(hex(randomblob(6)))) NOT NULL,
    "created" TEXT CONSTRAINT "categories_created_default_constraint" DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
    "updated" TEXT CONSTRAINT "categories_updated_default_constraint" DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
    "version" BLOB CONSTRAINT "categories_version_default_constraint" DEFAULT X'00' NOT NULL,
    "category_id" INTEGER,
    "name" VARCHAR(128) NOT NULL,
    "description" TEXT NOT NULL,
    "is_enabled" BOOLEAN CONSTRAINT "categories_is_enabled_default_constraint" DEFAULT 1 NOT NULL,
    "is_deleted" BOOLEAN CONSTRAINT "categories_is_deleted_default_constraint" DEFAULT 0 NOT NULL,
    CONSTRAINT "categories_uuid_unique_constraint" UNIQUE ("uuid"),
    CONSTRAINT "categories_category_id_foreign_key" FOREIGN KEY ("category_id") REFERENCES "categories" ("id")
);
GO
CREATE UNIQUE INDEX "categories_category_name_index" ON "categories" ("name");
GO
CREATE TRIGGER "trg_categories_updated_at"
AFTER UPDATE ON "categories"
FOR EACH ROW
WHEN NEW."updated" IS OLD."updated"
BEGIN
  UPDATE "categories" SET "updated" = (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) WHERE "id" = OLD."id";
END;
GO
CREATE TABLE "game_parents" (
    "id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    "uuid" TEXT CONSTRAINT "game_parents_uuid_default_constraint" DEFAULT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))), 2) || '-' || substr('89ab', abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))), 2) || '-' || lower(hex(randomblob(6)))) NOT NULL,
    "created" TEXT CONSTRAINT "game_parents_created_default_constraint" DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
    "updated" TEXT CONSTRAINT "game_parents_updated_default_constraint" DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
    "version" BLOB CONSTRAINT "game_parents_version_default_constraint" DEFAULT X'00' NOT NULL,
    "name" VARCHAR(128) NOT NULL,
    "description" TEXT NOT NULL,
    "location" VARCHAR(256) NOT NULL,
    "is_enabled" BOOLEAN CONSTRAINT "game_parents_is_enabled_default_constraint" DEFAULT 1 NOT NULL,
    "is_deleted" BOOLEAN CONSTRAINT "game_parents_is_deleted_default_constraint" DEFAULT 0 NOT NULL,
    CONSTRAINT "game_parents_uuid_unique_constraint" UNIQUE ("uuid")
);
GO
CREATE TRIGGER "trg_game_parents_updated_at"
AFTER UPDATE ON "game_parents"
FOR EACH ROW
WHEN NEW."updated" IS OLD."updated"
BEGIN
  UPDATE "game_parents" SET "updated" = (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) WHERE "id" = OLD."id";
END;
GO
CREATE TABLE "game_parent_configs" (
    "id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    "uuid" TEXT CONSTRAINT "game_parent_configs_uuid_default_constraint" DEFAULT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))), 2) || '-' || substr('89ab', abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))), 2) || '-' || lower(hex(randomblob(6)))) NOT NULL,
    "created" TEXT CONSTRAINT "game_parent_configs_created_default_constraint" DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
    "updated" TEXT CONSTRAINT "game_parent_configs_updated_default_constraint" DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
    "version" BLOB CONSTRAINT "game_parent_configs_version_default_constraint" DEFAULT X'00' NOT NULL,
    "game_parent_id" INTEGER NOT NULL,
    "name" VARCHAR(128) NOT NULL,
    "value" TEXT NOT NULL,
    CONSTRAINT "game_parent_configs_uuid_unique_constraint" UNIQUE ("uuid"),
    CONSTRAINT "game_parent_configs_game_parent_id_foreign_key" FOREIGN KEY ("game_parent_id") REFERENCES "game_parents" ("id")
);
GO
CREATE TRIGGER "trg_game_parent_configs_updated_at"
AFTER UPDATE ON "game_parent_configs"
FOR EACH ROW
WHEN NEW."updated" IS OLD."updated"
BEGIN
  UPDATE "game_parent_configs" SET "updated" = (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) WHERE "id" = OLD."id";
END;
GO
CREATE TABLE "games" (
    "id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    "uuid" TEXT CONSTRAINT "games_uuid_default_constraint" DEFAULT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))), 2) || '-' || substr('89ab', abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))), 2) || '-' || lower(hex(randomblob(6)))) NOT NULL,
    "created" TEXT CONSTRAINT "games_created_default_constraint" DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
    "updated" TEXT CONSTRAINT "games_updated_default_constraint" DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
    "version" BLOB CONSTRAINT "games_version_default_constraint" DEFAULT X'00' NOT NULL,
    "name" VARCHAR(128) NOT NULL,
    "description" TEXT NOT NULL,
    "game_parent_id" INTEGER NOT NULL,
    "is_deleted" BOOLEAN CONSTRAINT "games_is_deleted_default_constraint" DEFAULT 0 NOT NULL,
    "is_enabled" BOOLEAN CONSTRAINT "games_is_enabled_default_constraint" DEFAULT 1 NOT NULL,
    CONSTRAINT "games_uuid_unique_constraint" UNIQUE ("uuid"),
    CONSTRAINT "games_game_parent_id_foreign_key" FOREIGN KEY ("game_parent_id") REFERENCES "game_parents" ("id")
);
GO
CREATE UNIQUE INDEX "games_game_base_name_index" ON "games" ("name");
GO
CREATE TRIGGER "trg_games_updated_at"
AFTER UPDATE ON "games"
FOR EACH ROW
WHEN NEW."updated" IS OLD."updated"
BEGIN
  UPDATE "games" SET "updated" = (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) WHERE "id" = OLD."id";
END;
GO
CREATE TABLE "game_categories" (
    "id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    "uuid" TEXT CONSTRAINT "game_categories_uuid_default_constraint" DEFAULT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))), 2) || '-' || substr('89ab', abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))), 2) || '-' || lower(hex(randomblob(6)))) NOT NULL,
    "created" TEXT CONSTRAINT "game_categories_created_default_constraint" DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
    "updated" TEXT CONSTRAINT "game_categories_updated_default_constraint" DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
    "version" BLOB CONSTRAINT "game_categories_version_default_constraint" DEFAULT X'00' NOT NULL,
    "game_id" INTEGER NOT NULL,
    "category_id" INTEGER NOT NULL,
    CONSTRAINT "game_categories_uuid_unique_constraint" UNIQUE ("uuid"),
    CONSTRAINT "game_categories_game_id_foreign_key" FOREIGN KEY ("game_id") REFERENCES "games" ("id"),
    CONSTRAINT "game_categories_category_id_foreign_key" FOREIGN KEY ("category_id") REFERENCES "categories" ("id")
);
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
CREATE TABLE "game_parent_categories" (
    "id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    "uuid" TEXT CONSTRAINT "game_parent_categories_uuid_default_constraint" DEFAULT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))), 2) || '-' || substr('89ab', abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))), 2) || '-' || lower(hex(randomblob(6)))) NOT NULL,
    "created" TEXT CONSTRAINT "game_parent_categories_created_default_constraint" DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
    "updated" TEXT CONSTRAINT "game_parent_categories_updated_default_constraint" DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
    "version" BLOB CONSTRAINT "game_parent_categories_version_default_constraint" DEFAULT X'00' NOT NULL,
    "game_parent_id" INTEGER NOT NULL,
    "category_id" INTEGER NOT NULL,
    CONSTRAINT "game_parent_categories_uuid_unique_constraint" UNIQUE ("uuid"),
    CONSTRAINT "game_parent_categories_game_parent_id_foreign_key" FOREIGN KEY ("game_parent_id") REFERENCES "game_parents" ("id"),
    CONSTRAINT "game_parent_categories_category_id_foreign_key" FOREIGN KEY ("category_id") REFERENCES "categories" ("id")
);
GO
CREATE UNIQUE INDEX "game_parent_categories_game_parent_category_game_parent_id_category_id_index" ON "game_parent_categories" ("game_parent_id", "category_id");
GO
CREATE TRIGGER "trg_game_parent_categories_updated_at"
AFTER UPDATE ON "game_parent_categories"
FOR EACH ROW
WHEN NEW."updated" IS OLD."updated"
BEGIN
  UPDATE "game_parent_categories" SET "updated" = (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) WHERE "id" = OLD."id";
END;
GO
CREATE TABLE "game_plays" (
    "id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    "uuid" TEXT CONSTRAINT "game_plays_uuid_default_constraint" DEFAULT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))), 2) || '-' || substr('89ab', abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))), 2) || '-' || lower(hex(randomblob(6)))) NOT NULL,
    "created" TEXT CONSTRAINT "game_plays_created_default_constraint" DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
    "updated" TEXT CONSTRAINT "game_plays_updated_default_constraint" DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
    "version" BLOB CONSTRAINT "game_plays_version_default_constraint" DEFAULT X'00' NOT NULL,
    "game_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "finished" TEXT,
    CONSTRAINT "game_plays_uuid_unique_constraint" UNIQUE ("uuid"),
    CONSTRAINT "game_plays_game_id_foreign_key" FOREIGN KEY ("game_id") REFERENCES "games" ("id"),
    CONSTRAINT "game_plays_user_id_foreign_key" FOREIGN KEY ("user_id") REFERENCES "users" ("id")
);
GO
CREATE TRIGGER "trg_game_plays_updated_at"
AFTER UPDATE ON "game_plays"
FOR EACH ROW
WHEN NEW."updated" IS OLD."updated"
BEGIN
  UPDATE "game_plays" SET "updated" = (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) WHERE "id" = OLD."id";
END;
GO
CREATE TABLE "game_play_users" (
    "id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    "uuid" TEXT CONSTRAINT "game_play_users_uuid_default_constraint" DEFAULT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))), 2) || '-' || substr('89ab', abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))), 2) || '-' || lower(hex(randomblob(6)))) NOT NULL,
    "created" TEXT CONSTRAINT "game_play_users_created_default_constraint" DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
    "updated" TEXT CONSTRAINT "game_play_users_updated_default_constraint" DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
    "version" BLOB CONSTRAINT "game_play_users_version_default_constraint" DEFAULT X'00' NOT NULL,
    "game_play_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    CONSTRAINT "game_play_users_uuid_unique_constraint" UNIQUE ("uuid"),
    CONSTRAINT "game_play_users_game_play_id_foreign_key" FOREIGN KEY ("game_play_id") REFERENCES "game_plays" ("id"),
    CONSTRAINT "game_play_users_user_id_foreign_key" FOREIGN KEY ("user_id") REFERENCES "users" ("id")
);
GO
CREATE UNIQUE INDEX "game_play_users_game_play_users_game_play_id_user_id_index" ON "game_play_users" ("game_play_id", "user_id");
GO
CREATE TRIGGER "trg_game_play_users_updated_at"
AFTER UPDATE ON "game_play_users"
FOR EACH ROW
WHEN NEW."updated" IS OLD."updated"
BEGIN
  UPDATE "game_play_users" SET "updated" = (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) WHERE "id" = OLD."id";
END;
GO
CREATE TABLE "game_play_states" (
    "id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    "uuid" TEXT CONSTRAINT "game_play_states_uuid_default_constraint" DEFAULT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))), 2) || '-' || substr('89ab', abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))), 2) || '-' || lower(hex(randomblob(6)))) NOT NULL,
    "created" TEXT CONSTRAINT "game_play_states_created_default_constraint" DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
    "updated" TEXT CONSTRAINT "game_play_states_updated_default_constraint" DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
    "version" BLOB CONSTRAINT "game_play_states_version_default_constraint" DEFAULT X'00' NOT NULL,
    "game_play_id" INTEGER NOT NULL,
    "state_change" TEXT NOT NULL,
    CONSTRAINT "game_play_states_uuid_unique_constraint" UNIQUE ("uuid"),
    CONSTRAINT "game_play_states_game_play_id_foreign_key" FOREIGN KEY ("game_play_id") REFERENCES "game_plays" ("id")
);
GO
CREATE INDEX "game_play_states_game_play_state_game_play_id_index" ON "game_play_states" ("game_play_id");
GO
CREATE TRIGGER "trg_game_play_states_updated_at"
AFTER UPDATE ON "game_play_states"
FOR EACH ROW
WHEN NEW."updated" IS OLD."updated"
BEGIN
  UPDATE "game_play_states" SET "updated" = (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) WHERE "id" = OLD."id";
END;
GO
CREATE TABLE "game_play_actions" (
    "id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    "uuid" TEXT CONSTRAINT "game_play_actions_uuid_default_constraint" DEFAULT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))), 2) || '-' || substr('89ab', abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))), 2) || '-' || lower(hex(randomblob(6)))) NOT NULL,
    "created" TEXT CONSTRAINT "game_play_actions_created_default_constraint" DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
    "updated" TEXT CONSTRAINT "game_play_actions_updated_default_constraint" DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
    "version" BLOB CONSTRAINT "game_play_actions_version_default_constraint" DEFAULT X'00' NOT NULL,
    "game_play_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "action" TEXT NOT NULL,
    CONSTRAINT "game_play_actions_uuid_unique_constraint" UNIQUE ("uuid"),
    CONSTRAINT "game_play_actions_game_play_id_foreign_key" FOREIGN KEY ("game_play_id") REFERENCES "game_plays" ("id"),
    CONSTRAINT "game_play_actions_user_id_foreign_key" FOREIGN KEY ("user_id") REFERENCES "users" ("id")
);
GO
CREATE INDEX "game_play_actions_game_play_action_game_play_id_index" ON "game_play_actions" ("game_play_id");
GO
CREATE TRIGGER "trg_game_play_actions_updated_at"
AFTER UPDATE ON "game_play_actions"
FOR EACH ROW
WHEN NEW."updated" IS OLD."updated"
BEGIN
  UPDATE "game_play_actions" SET "updated" = (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) WHERE "id" = OLD."id";
END;
GO
CREATE TABLE "game_parent_settings" (
    "id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    "uuid" TEXT CONSTRAINT "game_parent_settings_uuid_default_constraint" DEFAULT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))), 2) || '-' || substr('89ab', abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))), 2) || '-' || lower(hex(randomblob(6)))) NOT NULL,
    "created" TEXT CONSTRAINT "game_parent_settings_created_default_constraint" DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
    "updated" TEXT CONSTRAINT "game_parent_settings_updated_default_constraint" DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
    "version" BLOB CONSTRAINT "game_parent_settings_version_default_constraint" DEFAULT X'00' NOT NULL,
    "game_parent_id" INTEGER NOT NULL,
    "name" VARCHAR(128) NOT NULL,
    "value" TEXT NOT NULL,
    CONSTRAINT "game_parent_settings_uuid_unique_constraint" UNIQUE ("uuid"),
    CONSTRAINT "game_parent_settings_game_parent_id_foreign_key" FOREIGN KEY ("game_parent_id") REFERENCES "game_parents" ("id")
);
GO
CREATE UNIQUE INDEX "game_parent_settings_game_parent_setting_game_parent_id_name_index" ON "game_parent_settings" ("game_parent_id", "name");
GO
CREATE TRIGGER "trg_game_parent_settings_updated_at"
AFTER UPDATE ON "game_parent_settings"
FOR EACH ROW
WHEN NEW."updated" IS OLD."updated"
BEGIN
  UPDATE "game_parent_settings" SET "updated" = (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) WHERE "id" = OLD."id";
END;
GO
CREATE TABLE "game_settings" (
    "id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    "uuid" TEXT CONSTRAINT "game_settings_uuid_default_constraint" DEFAULT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))), 2) || '-' || substr('89ab', abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))), 2) || '-' || lower(hex(randomblob(6)))) NOT NULL,
    "created" TEXT CONSTRAINT "game_settings_created_default_constraint" DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
    "updated" TEXT CONSTRAINT "game_settings_updated_default_constraint" DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
    "version" BLOB CONSTRAINT "game_settings_version_default_constraint" DEFAULT X'00' NOT NULL,
    "game_id" INTEGER NOT NULL,
    "name" VARCHAR(128) NOT NULL,
    "value" TEXT NOT NULL,
    CONSTRAINT "game_settings_uuid_unique_constraint" UNIQUE ("uuid"),
    CONSTRAINT "game_settings_game_id_foreign_key" FOREIGN KEY ("game_id") REFERENCES "games" ("id")
);
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
CREATE TABLE "game_attributes" (
    "id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    "uuid" TEXT CONSTRAINT "game_attributes_uuid_default_constraint" DEFAULT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))), 2) || '-' || substr('89ab', abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))), 2) || '-' || lower(hex(randomblob(6)))) NOT NULL,
    "created" TEXT CONSTRAINT "game_attributes_created_default_constraint" DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
    "updated" TEXT CONSTRAINT "game_attributes_updated_default_constraint" DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
    "version" BLOB CONSTRAINT "game_attributes_version_default_constraint" DEFAULT X'00' NOT NULL,
    "game_id" INTEGER NOT NULL,
    "name" VARCHAR(128) NOT NULL,
    "value" TEXT NOT NULL,
    CONSTRAINT "game_attributes_uuid_unique_constraint" UNIQUE ("uuid"),
    CONSTRAINT "game_attributes_game_id_foreign_key" FOREIGN KEY ("game_id") REFERENCES "games" ("id")
);
GO
CREATE UNIQUE INDEX "game_attributes_game_attribute_game_id_name_index" ON "game_attributes" ("game_id", "name");
GO
CREATE TRIGGER "trg_game_attributes_updated_at"
AFTER UPDATE ON "game_attributes"
FOR EACH ROW
WHEN NEW."updated" IS OLD."updated"
BEGIN
  UPDATE "game_attributes" SET "updated" = (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) WHERE "id" = OLD."id";
END;
GO
CREATE TABLE "game_reviews" (
    "id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    "uuid" TEXT CONSTRAINT "game_reviews_uuid_default_constraint" DEFAULT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))), 2) || '-' || substr('89ab', abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))), 2) || '-' || lower(hex(randomblob(6)))) NOT NULL,
    "created" TEXT CONSTRAINT "game_reviews_created_default_constraint" DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
    "updated" TEXT CONSTRAINT "game_reviews_updated_default_constraint" DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
    "version" BLOB CONSTRAINT "game_reviews_version_default_constraint" DEFAULT X'00' NOT NULL,
    "game_id" INTEGER NOT NULL,
    "review_id" INTEGER NOT NULL,
    CONSTRAINT "game_reviews_uuid_unique_constraint" UNIQUE ("uuid"),
    CONSTRAINT "game_reviews_game_id_foreign_key" FOREIGN KEY ("game_id") REFERENCES "games" ("id"),
    CONSTRAINT "game_reviews_review_id_foreign_key" FOREIGN KEY ("review_id") REFERENCES "reviews" ("id")
);
GO
CREATE TRIGGER "trg_game_reviews_updated_at"
AFTER UPDATE ON "game_reviews"
FOR EACH ROW
WHEN NEW."updated" IS OLD."updated"
BEGIN
  UPDATE "game_reviews" SET "updated" = (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) WHERE "id" = OLD."id";
END;
GO
CREATE TABLE "uri_types" (
    "id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    "uuid" TEXT CONSTRAINT "uri_types_uuid_default_constraint" DEFAULT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))), 2) || '-' || substr('89ab', abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))), 2) || '-' || lower(hex(randomblob(6)))) NOT NULL,
    "created" TEXT CONSTRAINT "uri_types_created_default_constraint" DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
    "updated" TEXT CONSTRAINT "uri_types_updated_default_constraint" DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
    "version" BLOB CONSTRAINT "uri_types_version_default_constraint" DEFAULT X'00' NOT NULL,
    "name" VARCHAR(256) NOT NULL,
    "description" TEXT,
    CONSTRAINT "uri_types_uuid_unique_constraint" UNIQUE ("uuid")
);
GO
CREATE TRIGGER "trg_uri_types_updated_at"
AFTER UPDATE ON "uri_types"
FOR EACH ROW
WHEN NEW."updated" IS OLD."updated"
BEGIN
  UPDATE "uri_types" SET "updated" = (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) WHERE "id" = OLD."id";
END;
GO
CREATE TABLE "uris_bases" (
    "id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    "uuid" TEXT CONSTRAINT "uris_bases_uuid_default_constraint" DEFAULT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))), 2) || '-' || substr('89ab', abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))), 2) || '-' || lower(hex(randomblob(6)))) NOT NULL,
    "created" TEXT CONSTRAINT "uris_bases_created_default_constraint" DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
    "updated" TEXT CONSTRAINT "uris_bases_updated_default_constraint" DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
    "version" BLOB CONSTRAINT "uris_bases_version_default_constraint" DEFAULT X'00' NOT NULL,
    "uri_type_id" INTEGER NOT NULL,
    "location" TEXT NOT NULL,
    "is_public" BOOLEAN CONSTRAINT "uris_bases_is_public_default_constraint" DEFAULT 0 NOT NULL,
    "is_enabled" BOOLEAN CONSTRAINT "uris_bases_is_enabled_default_constraint" DEFAULT 1 NOT NULL,
    "is_deleted" BOOLEAN CONSTRAINT "uris_bases_is_deleted_default_constraint" DEFAULT 0 NOT NULL,
    CONSTRAINT "uris_bases_uuid_unique_constraint" UNIQUE ("uuid"),
    CONSTRAINT "uris_bases_uri_type_id_foreign_key" FOREIGN KEY ("uri_type_id") REFERENCES "uri_types" ("id")
);
GO
CREATE TRIGGER "trg_uris_bases_updated_at"
AFTER UPDATE ON "uris_bases"
FOR EACH ROW
WHEN NEW."updated" IS OLD."updated"
BEGIN
  UPDATE "uris_bases" SET "updated" = (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) WHERE "id" = OLD."id";
END;
GO
CREATE TABLE "application_types" (
    "id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    "uuid" TEXT CONSTRAINT "application_types_uuid_default_constraint" DEFAULT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))), 2) || '-' || substr('89ab', abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))), 2) || '-' || lower(hex(randomblob(6)))) NOT NULL,
    "created" TEXT CONSTRAINT "application_types_created_default_constraint" DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
    "updated" TEXT CONSTRAINT "application_types_updated_default_constraint" DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
    "version" BLOB CONSTRAINT "application_types_version_default_constraint" DEFAULT X'00' NOT NULL,
    "name" VARCHAR(256) NOT NULL,
    "description" TEXT,
    CONSTRAINT "application_types_uuid_unique_constraint" UNIQUE ("uuid")
);
GO
CREATE TRIGGER "trg_application_types_updated_at"
AFTER UPDATE ON "application_types"
FOR EACH ROW
WHEN NEW."updated" IS OLD."updated"
BEGIN
  UPDATE "application_types" SET "updated" = (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) WHERE "id" = OLD."id";
END;
GO
CREATE TABLE "application_visibilities" (
    "id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    "uuid" TEXT CONSTRAINT "application_visibilities_uuid_default_constraint" DEFAULT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))), 2) || '-' || substr('89ab', abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))), 2) || '-' || lower(hex(randomblob(6)))) NOT NULL,
    "created" TEXT CONSTRAINT "application_visibilities_created_default_constraint" DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
    "updated" TEXT CONSTRAINT "application_visibilities_updated_default_constraint" DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
    "version" BLOB CONSTRAINT "application_visibilities_version_default_constraint" DEFAULT X'00' NOT NULL,
    "name" VARCHAR(512) NOT NULL,
    "description" TEXT,
    CONSTRAINT "application_visibilities_uuid_unique_constraint" UNIQUE ("uuid")
);
GO
CREATE TRIGGER "trg_application_visibilities_updated_at"
AFTER UPDATE ON "application_visibilities"
FOR EACH ROW
WHEN NEW."updated" IS OLD."updated"
BEGIN
  UPDATE "application_visibilities" SET "updated" = (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) WHERE "id" = OLD."id";
END;
GO
CREATE TABLE "applications" (
    "id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    "uuid" TEXT CONSTRAINT "applications_uuid_default_constraint" DEFAULT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))), 2) || '-' || substr('89ab', abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))), 2) || '-' || lower(hex(randomblob(6)))) NOT NULL,
    "created" TEXT CONSTRAINT "applications_created_default_constraint" DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
    "updated" TEXT CONSTRAINT "applications_updated_default_constraint" DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
    "version" BLOB CONSTRAINT "applications_version_default_constraint" DEFAULT X'00' NOT NULL,
    "name" VARCHAR(512) NOT NULL,
    "application_type_id" INTEGER NOT NULL,
    "application_visibility_id" INTEGER NOT NULL,
    "client_id" VARCHAR(512) NOT NULL,
    "description" TEXT,
    "is_enabled" BOOLEAN CONSTRAINT "applications_is_enabled_default_constraint" DEFAULT 1 NOT NULL,
    "is_deleted" BOOLEAN CONSTRAINT "applications_is_deleted_default_constraint" DEFAULT 0 NOT NULL,
    "is_builtin" BOOLEAN CONSTRAINT "applications_is_builtin_default_constraint" DEFAULT 0 NOT NULL,
    CONSTRAINT "applications_uuid_unique_constraint" UNIQUE ("uuid"),
    CONSTRAINT "applications_application_type_id_foreign_key" FOREIGN KEY ("application_type_id") REFERENCES "application_types" ("id"),
    CONSTRAINT "applications_application_visibility_id_foreign_key" FOREIGN KEY ("application_visibility_id") REFERENCES "application_visibilities" ("id")
);
GO
CREATE TRIGGER "trg_applications_updated_at"
AFTER UPDATE ON "applications"
FOR EACH ROW
WHEN NEW."updated" IS OLD."updated"
BEGIN
  UPDATE "applications" SET "updated" = (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) WHERE "id" = OLD."id";
END;
GO
CREATE TABLE "application_settings" (
    "id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    "uuid" TEXT CONSTRAINT "application_settings_uuid_default_constraint" DEFAULT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))), 2) || '-' || substr('89ab', abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))), 2) || '-' || lower(hex(randomblob(6)))) NOT NULL,
    "created" TEXT CONSTRAINT "application_settings_created_default_constraint" DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
    "updated" TEXT CONSTRAINT "application_settings_updated_default_constraint" DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
    "version" BLOB CONSTRAINT "application_settings_version_default_constraint" DEFAULT X'00' NOT NULL,
    "application_id" INTEGER NOT NULL,
    "name" VARCHAR(256) NOT NULL,
    "value" TEXT NOT NULL,
    CONSTRAINT "application_settings_uuid_unique_constraint" UNIQUE ("uuid"),
    CONSTRAINT "application_settings_application_id_foreign_key" FOREIGN KEY ("application_id") REFERENCES "applications" ("id")
);
GO
CREATE TRIGGER "trg_application_settings_updated_at"
AFTER UPDATE ON "application_settings"
FOR EACH ROW
WHEN NEW."updated" IS OLD."updated"
BEGIN
  UPDATE "application_settings" SET "updated" = (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) WHERE "id" = OLD."id";
END;
GO
CREATE TABLE "application_uris" (
    "id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    "uuid" TEXT CONSTRAINT "application_uris_uuid_default_constraint" DEFAULT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))), 2) || '-' || substr('89ab', abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))), 2) || '-' || lower(hex(randomblob(6)))) NOT NULL,
    "created" TEXT CONSTRAINT "application_uris_created_default_constraint" DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
    "updated" TEXT CONSTRAINT "application_uris_updated_default_constraint" DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
    "version" BLOB CONSTRAINT "application_uris_version_default_constraint" DEFAULT X'00' NOT NULL,
    "application_id" INTEGER NOT NULL,
    "uri_id" INTEGER NOT NULL,
    CONSTRAINT "application_uris_uuid_unique_constraint" UNIQUE ("uuid"),
    CONSTRAINT "application_uris_application_id_foreign_key" FOREIGN KEY ("application_id") REFERENCES "applications" ("id"),
    CONSTRAINT "application_uris_uri_id_foreign_key" FOREIGN KEY ("uri_id") REFERENCES "uris_bases" ("id")
);
GO
CREATE TRIGGER "trg_application_uris_updated_at"
AFTER UPDATE ON "application_uris"
FOR EACH ROW
WHEN NEW."updated" IS OLD."updated"
BEGIN
  UPDATE "application_uris" SET "updated" = (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) WHERE "id" = OLD."id";
END;
GO
CREATE TABLE "application_users" (
    "id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    "uuid" TEXT CONSTRAINT "application_users_uuid_default_constraint" DEFAULT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))), 2) || '-' || substr('89ab', abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))), 2) || '-' || lower(hex(randomblob(6)))) NOT NULL,
    "created" TEXT CONSTRAINT "application_users_created_default_constraint" DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
    "updated" TEXT CONSTRAINT "application_users_updated_default_constraint" DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
    "version" BLOB CONSTRAINT "application_users_version_default_constraint" DEFAULT X'00' NOT NULL,
    "application_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    CONSTRAINT "application_users_uuid_unique_constraint" UNIQUE ("uuid"),
    CONSTRAINT "application_users_application_id_foreign_key" FOREIGN KEY ("application_id") REFERENCES "applications" ("id"),
    CONSTRAINT "application_users_user_id_foreign_key" FOREIGN KEY ("user_id") REFERENCES "users" ("id")
);
GO
CREATE TRIGGER "trg_application_users_updated_at"
AFTER UPDATE ON "application_users"
FOR EACH ROW
WHEN NEW."updated" IS OLD."updated"
BEGIN
  UPDATE "application_users" SET "updated" = (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) WHERE "id" = OLD."id";
END;
GO
CREATE TABLE "services" (
    "id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    "uuid" TEXT CONSTRAINT "services_uuid_default_constraint" DEFAULT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))), 2) || '-' || substr('89ab', abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))), 2) || '-' || lower(hex(randomblob(6)))) NOT NULL,
    "created" TEXT CONSTRAINT "services_created_default_constraint" DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
    "updated" TEXT CONSTRAINT "services_updated_default_constraint" DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
    "version" BLOB CONSTRAINT "services_version_default_constraint" DEFAULT X'00' NOT NULL,
    "name" VARCHAR(512) NOT NULL,
    "description" TEXT,
    CONSTRAINT "services_uuid_unique_constraint" UNIQUE ("uuid")
);
GO
CREATE TRIGGER "trg_services_updated_at"
AFTER UPDATE ON "services"
FOR EACH ROW
WHEN NEW."updated" IS OLD."updated"
BEGIN
  UPDATE "services" SET "updated" = (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) WHERE "id" = OLD."id";
END;
GO
CREATE TABLE "application_services" (
    "id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    "uuid" TEXT CONSTRAINT "application_services_uuid_default_constraint" DEFAULT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))), 2) || '-' || substr('89ab', abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))), 2) || '-' || lower(hex(randomblob(6)))) NOT NULL,
    "created" TEXT CONSTRAINT "application_services_created_default_constraint" DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
    "updated" TEXT CONSTRAINT "application_services_updated_default_constraint" DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
    "version" BLOB CONSTRAINT "application_services_version_default_constraint" DEFAULT X'00' NOT NULL,
    "application_id" INTEGER NOT NULL,
    "service_id" INTEGER NOT NULL,
    CONSTRAINT "application_services_uuid_unique_constraint" UNIQUE ("uuid"),
    CONSTRAINT "application_services_application_id_foreign_key" FOREIGN KEY ("application_id") REFERENCES "applications" ("id"),
    CONSTRAINT "application_services_service_id_foreign_key" FOREIGN KEY ("service_id") REFERENCES "services" ("id")
);
GO
CREATE TRIGGER "trg_application_services_updated_at"
AFTER UPDATE ON "application_services"
FOR EACH ROW
WHEN NEW."updated" IS OLD."updated"
BEGIN
  UPDATE "application_services" SET "updated" = (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) WHERE "id" = OLD."id";
END;
GO
CREATE TABLE "service_uris" (
    "id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    "uuid" TEXT CONSTRAINT "service_uris_uuid_default_constraint" DEFAULT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))), 2) || '-' || substr('89ab', abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))), 2) || '-' || lower(hex(randomblob(6)))) NOT NULL,
    "created" TEXT CONSTRAINT "service_uris_created_default_constraint" DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
    "updated" TEXT CONSTRAINT "service_uris_updated_default_constraint" DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
    "version" BLOB CONSTRAINT "service_uris_version_default_constraint" DEFAULT X'00' NOT NULL,
    "service_id" INTEGER NOT NULL,
    "uri_id" INTEGER NOT NULL,
    CONSTRAINT "service_uris_uuid_unique_constraint" UNIQUE ("uuid"),
    CONSTRAINT "service_uris_service_id_foreign_key" FOREIGN KEY ("service_id") REFERENCES "services" ("id"),
    CONSTRAINT "service_uris_uri_id_foreign_key" FOREIGN KEY ("uri_id") REFERENCES "uris_bases" ("id")
);
GO
CREATE TRIGGER "trg_service_uris_updated_at"
AFTER UPDATE ON "service_uris"
FOR EACH ROW
WHEN NEW."updated" IS OLD."updated"
BEGIN
  UPDATE "service_uris" SET "updated" = (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) WHERE "id" = OLD."id";
END;
GO
CREATE TABLE "service_settings" (
    "id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    "uuid" TEXT CONSTRAINT "service_settings_uuid_default_constraint" DEFAULT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))), 2) || '-' || substr('89ab', abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))), 2) || '-' || lower(hex(randomblob(6)))) NOT NULL,
    "created" TEXT CONSTRAINT "service_settings_created_default_constraint" DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
    "updated" TEXT CONSTRAINT "service_settings_updated_default_constraint" DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
    "version" BLOB CONSTRAINT "service_settings_version_default_constraint" DEFAULT X'00' NOT NULL,
    "service_id" INTEGER NOT NULL,
    "name" VARCHAR(512) NOT NULL,
    "value" TEXT NOT NULL,
    CONSTRAINT "service_settings_uuid_unique_constraint" UNIQUE ("uuid"),
    CONSTRAINT "service_settings_service_id_foreign_key" FOREIGN KEY ("service_id") REFERENCES "services" ("id")
);
GO
CREATE TRIGGER "trg_service_settings_updated_at"
AFTER UPDATE ON "service_settings"
FOR EACH ROW
WHEN NEW."updated" IS OLD."updated"
BEGIN
  UPDATE "service_settings" SET "updated" = (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) WHERE "id" = OLD."id";
END;
GO
CREATE TABLE "oauth_grant_types" (
    "id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    "uuid" TEXT CONSTRAINT "oauth_grant_types_uuid_default_constraint" DEFAULT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))), 2) || '-' || substr('89ab', abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))), 2) || '-' || lower(hex(randomblob(6)))) NOT NULL,
    "created" TEXT CONSTRAINT "oauth_grant_types_created_default_constraint" DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
    "updated" TEXT CONSTRAINT "oauth_grant_types_updated_default_constraint" DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
    "version" BLOB CONSTRAINT "oauth_grant_types_version_default_constraint" DEFAULT X'00' NOT NULL,
    "name" VARCHAR(256) NOT NULL,
    "description" VARCHAR(512) NOT NULL,
    "is_custom" BOOLEAN CONSTRAINT "oauth_grant_types_is_custom_default_constraint" DEFAULT 0 NOT NULL,
    "is_enabled" BOOLEAN CONSTRAINT "oauth_grant_types_is_enabled_default_constraint" DEFAULT 1 NOT NULL,
    "is_legacy" BOOLEAN CONSTRAINT "oauth_grant_types_is_legacy_default_constraint" DEFAULT 0 NOT NULL,
    CONSTRAINT "oauth_grant_types_uuid_unique_constraint" UNIQUE ("uuid")
);
GO
CREATE TRIGGER "trg_oauth_grant_types_updated_at"
AFTER UPDATE ON "oauth_grant_types"
FOR EACH ROW
WHEN NEW."updated" IS OLD."updated"
BEGIN
  UPDATE "oauth_grant_types" SET "updated" = (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) WHERE "id" = OLD."id";
END;
GO
CREATE TABLE "secret_types" (
    "id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    "uuid" TEXT CONSTRAINT "secret_types_uuid_default_constraint" DEFAULT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))), 2) || '-' || substr('89ab', abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))), 2) || '-' || lower(hex(randomblob(6)))) NOT NULL,
    "created" TEXT CONSTRAINT "secret_types_created_default_constraint" DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
    "updated" TEXT CONSTRAINT "secret_types_updated_default_constraint" DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
    "version" BLOB CONSTRAINT "secret_types_version_default_constraint" DEFAULT X'00' NOT NULL,
    "name" VARCHAR(512) NOT NULL,
    "description" TEXT,
    CONSTRAINT "secret_types_uuid_unique_constraint" UNIQUE ("uuid")
);
GO
CREATE TRIGGER "trg_secret_types_updated_at"
AFTER UPDATE ON "secret_types"
FOR EACH ROW
WHEN NEW."updated" IS OLD."updated"
BEGIN
  UPDATE "secret_types" SET "updated" = (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) WHERE "id" = OLD."id";
END;
GO
CREATE TABLE "secrets" (
    "id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    "uuid" TEXT CONSTRAINT "secrets_uuid_default_constraint" DEFAULT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))), 2) || '-' || substr('89ab', abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))), 2) || '-' || lower(hex(randomblob(6)))) NOT NULL,
    "created" TEXT CONSTRAINT "secrets_created_default_constraint" DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
    "updated" TEXT CONSTRAINT "secrets_updated_default_constraint" DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
    "version" BLOB CONSTRAINT "secrets_version_default_constraint" DEFAULT X'00' NOT NULL,
    "secret_type_id" INTEGER NOT NULL,
    "value" VARCHAR(512) NOT NULL,
    "expires" TEXT,
    "is_enabled" BOOLEAN CONSTRAINT "secrets_is_enabled_default_constraint" DEFAULT 1 NOT NULL,
    "is_deleted" BOOLEAN CONSTRAINT "secrets_is_deleted_default_constraint" DEFAULT 0 NOT NULL,
    CONSTRAINT "secrets_uuid_unique_constraint" UNIQUE ("uuid"),
    CONSTRAINT "secrets_secret_type_id_foreign_key" FOREIGN KEY ("secret_type_id") REFERENCES "secret_types" ("id")
);
GO
CREATE TRIGGER "trg_secrets_updated_at"
AFTER UPDATE ON "secrets"
FOR EACH ROW
WHEN NEW."updated" IS OLD."updated"
BEGIN
  UPDATE "secrets" SET "updated" = (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) WHERE "id" = OLD."id";
END;
GO
CREATE TABLE "user_secrets" (
    "id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    "uuid" TEXT CONSTRAINT "user_secrets_uuid_default_constraint" DEFAULT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))), 2) || '-' || substr('89ab', abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))), 2) || '-' || lower(hex(randomblob(6)))) NOT NULL,
    "created" TEXT CONSTRAINT "user_secrets_created_default_constraint" DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
    "updated" TEXT CONSTRAINT "user_secrets_updated_default_constraint" DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
    "version" BLOB CONSTRAINT "user_secrets_version_default_constraint" DEFAULT X'00' NOT NULL,
    "user_id" INTEGER NOT NULL,
    "secret_id" INTEGER NOT NULL,
    CONSTRAINT "user_secrets_uuid_unique_constraint" UNIQUE ("uuid"),
    CONSTRAINT "user_secrets_user_id_foreign_key" FOREIGN KEY ("user_id") REFERENCES "users" ("id"),
    CONSTRAINT "user_secrets_secret_id_foreign_key" FOREIGN KEY ("secret_id") REFERENCES "secrets" ("id")
);
GO
CREATE TRIGGER "trg_user_secrets_updated_at"
AFTER UPDATE ON "user_secrets"
FOR EACH ROW
WHEN NEW."updated" IS OLD."updated"
BEGIN
  UPDATE "user_secrets" SET "updated" = (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) WHERE "id" = OLD."id";
END;
GO
CREATE TABLE "token_types" (
    "id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    "uuid" TEXT CONSTRAINT "token_types_uuid_default_constraint" DEFAULT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))), 2) || '-' || substr('89ab', abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))), 2) || '-' || lower(hex(randomblob(6)))) NOT NULL,
    "created" TEXT CONSTRAINT "token_types_created_default_constraint" DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
    "updated" TEXT CONSTRAINT "token_types_updated_default_constraint" DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
    "version" BLOB CONSTRAINT "token_types_version_default_constraint" DEFAULT X'00' NOT NULL,
    "name" VARCHAR(512) NOT NULL,
    "description" TEXT NOT NULL,
    CONSTRAINT "token_types_uuid_unique_constraint" UNIQUE ("uuid")
);
GO
CREATE TRIGGER "trg_token_types_updated_at"
AFTER UPDATE ON "token_types"
FOR EACH ROW
WHEN NEW."updated" IS OLD."updated"
BEGIN
  UPDATE "token_types" SET "updated" = (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) WHERE "id" = OLD."id";
END;
GO
CREATE TABLE "tokens" (
    "id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    "uuid" TEXT CONSTRAINT "tokens_uuid_default_constraint" DEFAULT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))), 2) || '-' || substr('89ab', abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))), 2) || '-' || lower(hex(randomblob(6)))) NOT NULL,
    "created" TEXT CONSTRAINT "tokens_created_default_constraint" DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
    "updated" TEXT CONSTRAINT "tokens_updated_default_constraint" DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
    "version" BLOB CONSTRAINT "tokens_version_default_constraint" DEFAULT X'00' NOT NULL,
    "token_type_id" INTEGER NOT NULL,
    "name" VARCHAR(128) NOT NULL,
    "secret" TEXT NOT NULL,
    "is_enabled" BOOLEAN CONSTRAINT "tokens_is_enabled_default_constraint" DEFAULT 1 NOT NULL,
    "expires" TEXT NOT NULL,
    "revoked" TEXT,
    "is_deleted" BOOLEAN CONSTRAINT "tokens_is_deleted_default_constraint" DEFAULT 0 NOT NULL,
    CONSTRAINT "tokens_uuid_unique_constraint" UNIQUE ("uuid"),
    CONSTRAINT "tokens_token_type_id_foreign_key" FOREIGN KEY ("token_type_id") REFERENCES "token_types" ("id")
);
GO
CREATE TRIGGER "trg_tokens_updated_at"
AFTER UPDATE ON "tokens"
FOR EACH ROW
WHEN NEW."updated" IS OLD."updated"
BEGIN
  UPDATE "tokens" SET "updated" = (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) WHERE "id" = OLD."id";
END;
GO
CREATE TABLE "user_tokens" (
    "id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    "uuid" TEXT CONSTRAINT "user_tokens_uuid_default_constraint" DEFAULT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))), 2) || '-' || substr('89ab', abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))), 2) || '-' || lower(hex(randomblob(6)))) NOT NULL,
    "created" TEXT CONSTRAINT "user_tokens_created_default_constraint" DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
    "updated" TEXT CONSTRAINT "user_tokens_updated_default_constraint" DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
    "version" BLOB CONSTRAINT "user_tokens_version_default_constraint" DEFAULT X'00' NOT NULL,
    "user_id" INTEGER NOT NULL,
    "token_id" INTEGER NOT NULL,
    CONSTRAINT "user_tokens_uuid_unique_constraint" UNIQUE ("uuid"),
    CONSTRAINT "user_tokens_user_id_foreign_key" FOREIGN KEY ("user_id") REFERENCES "users" ("id"),
    CONSTRAINT "user_tokens_token_id_foreign_key" FOREIGN KEY ("token_id") REFERENCES "tokens" ("id")
);
GO
CREATE TRIGGER "trg_user_tokens_updated_at"
AFTER UPDATE ON "user_tokens"
FOR EACH ROW
WHEN NEW."updated" IS OLD."updated"
BEGIN
  UPDATE "user_tokens" SET "updated" = (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) WHERE "id" = OLD."id";
END;
GO
CREATE TABLE "email_tokens" (
    "id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    "uuid" TEXT CONSTRAINT "email_tokens_uuid_default_constraint" DEFAULT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))), 2) || '-' || substr('89ab', abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))), 2) || '-' || lower(hex(randomblob(6)))) NOT NULL,
    "created" TEXT CONSTRAINT "email_tokens_created_default_constraint" DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
    "updated" TEXT CONSTRAINT "email_tokens_updated_default_constraint" DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
    "version" BLOB CONSTRAINT "email_tokens_version_default_constraint" DEFAULT X'00' NOT NULL,
    "email_id" INTEGER NOT NULL,
    "token_id" INTEGER NOT NULL,
    CONSTRAINT "email_tokens_uuid_unique_constraint" UNIQUE ("uuid"),
    CONSTRAINT "email_tokens_email_id_foreign_key" FOREIGN KEY ("email_id") REFERENCES "emails" ("id"),
    CONSTRAINT "email_tokens_token_id_foreign_key" FOREIGN KEY ("token_id") REFERENCES "tokens" ("id")
);
GO
CREATE TRIGGER "trg_email_tokens_updated_at"
AFTER UPDATE ON "email_tokens"
FOR EACH ROW
WHEN NEW."updated" IS OLD."updated"
BEGIN
  UPDATE "email_tokens" SET "updated" = (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) WHERE "id" = OLD."id";
END;
GO
CREATE TABLE "authentication_methods" (
    "id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    "uuid" TEXT CONSTRAINT "authentication_methods_uuid_default_constraint" DEFAULT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))), 2) || '-' || substr('89ab', abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))), 2) || '-' || lower(hex(randomblob(6)))) NOT NULL,
    "created" TEXT CONSTRAINT "authentication_methods_created_default_constraint" DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
    "updated" TEXT CONSTRAINT "authentication_methods_updated_default_constraint" DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
    "version" BLOB CONSTRAINT "authentication_methods_version_default_constraint" DEFAULT X'00' NOT NULL,
    "name" VARCHAR(256) NOT NULL,
    "description" VARCHAR(256),
    "is_default" BOOLEAN CONSTRAINT "authentication_methods_is_default_default_constraint" DEFAULT 1 NOT NULL,
    "is_enabled" BOOLEAN CONSTRAINT "authentication_methods_is_enabled_default_constraint" DEFAULT 1 NOT NULL,
    CONSTRAINT "authentication_methods_uuid_unique_constraint" UNIQUE ("uuid")
);
GO
CREATE TRIGGER "trg_authentication_methods_updated_at"
AFTER UPDATE ON "authentication_methods"
FOR EACH ROW
WHEN NEW."updated" IS OLD."updated"
BEGIN
  UPDATE "authentication_methods" SET "updated" = (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) WHERE "id" = OLD."id";
END;
GO
CREATE TABLE "identity_provider_types" (
    "id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    "uuid" TEXT CONSTRAINT "identity_provider_types_uuid_default_constraint" DEFAULT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))), 2) || '-' || substr('89ab', abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))), 2) || '-' || lower(hex(randomblob(6)))) NOT NULL,
    "created" TEXT CONSTRAINT "identity_provider_types_created_default_constraint" DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
    "updated" TEXT CONSTRAINT "identity_provider_types_updated_default_constraint" DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
    "version" BLOB CONSTRAINT "identity_provider_types_version_default_constraint" DEFAULT X'00' NOT NULL,
    "name" VARCHAR(256) NOT NULL,
    "description" TEXT,
    CONSTRAINT "identity_provider_types_uuid_unique_constraint" UNIQUE ("uuid")
);
GO
CREATE TRIGGER "trg_identity_provider_types_updated_at"
AFTER UPDATE ON "identity_provider_types"
FOR EACH ROW
WHEN NEW."updated" IS OLD."updated"
BEGIN
  UPDATE "identity_provider_types" SET "updated" = (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) WHERE "id" = OLD."id";
END;
GO
CREATE TABLE "identity_providers" (
    "id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    "uuid" TEXT CONSTRAINT "identity_providers_uuid_default_constraint" DEFAULT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))), 2) || '-' || substr('89ab', abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))), 2) || '-' || lower(hex(randomblob(6)))) NOT NULL,
    "created" TEXT CONSTRAINT "identity_providers_created_default_constraint" DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
    "updated" TEXT CONSTRAINT "identity_providers_updated_default_constraint" DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
    "version" BLOB CONSTRAINT "identity_providers_version_default_constraint" DEFAULT X'00' NOT NULL,
    "identity_provider_type_id" INTEGER NOT NULL,
    "name" VARCHAR(256) NOT NULL,
    "description" TEXT,
    "is_enabled" BOOLEAN CONSTRAINT "identity_providers_is_enabled_default_constraint" DEFAULT 1 NOT NULL,
    "is_builtin" BOOLEAN CONSTRAINT "identity_providers_is_builtin_default_constraint" DEFAULT 0 NOT NULL,
    "is_deleted" BOOLEAN CONSTRAINT "identity_providers_is_deleted_default_constraint" DEFAULT 0 NOT NULL,
    CONSTRAINT "identity_providers_uuid_unique_constraint" UNIQUE ("uuid"),
    CONSTRAINT "identity_providers_identity_provider_type_id_foreign_key" FOREIGN KEY ("identity_provider_type_id") REFERENCES "identity_provider_types" ("id")
);
GO
CREATE UNIQUE INDEX "identity_providers_name_index" ON "identity_providers" ("name");
GO
CREATE TRIGGER "trg_identity_providers_updated_at"
AFTER UPDATE ON "identity_providers"
FOR EACH ROW
WHEN NEW."updated" IS OLD."updated"
BEGIN
  UPDATE "identity_providers" SET "updated" = (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) WHERE "id" = OLD."id";
END;
GO
CREATE TABLE "identity_provider_settings" (
    "id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    "uuid" TEXT CONSTRAINT "identity_provider_settings_uuid_default_constraint" DEFAULT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))), 2) || '-' || substr('89ab', abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))), 2) || '-' || lower(hex(randomblob(6)))) NOT NULL,
    "created" TEXT CONSTRAINT "identity_provider_settings_created_default_constraint" DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
    "updated" TEXT CONSTRAINT "identity_provider_settings_updated_default_constraint" DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
    "version" BLOB CONSTRAINT "identity_provider_settings_version_default_constraint" DEFAULT X'00' NOT NULL,
    "identity_provider_id" INTEGER NOT NULL,
    "name" VARCHAR(256) NOT NULL,
    "value" TEXT NOT NULL,
    CONSTRAINT "identity_provider_settings_uuid_unique_constraint" UNIQUE ("uuid"),
    CONSTRAINT "identity_provider_settings_identity_provider_id_foreign_key" FOREIGN KEY ("identity_provider_id") REFERENCES "identity_providers" ("id")
);
GO
CREATE UNIQUE INDEX "identity_provider_settings_provider_id_name_index" ON "identity_provider_settings" ("identity_provider_id", "name");
GO
CREATE TRIGGER "trg_identity_provider_settings_updated_at"
AFTER UPDATE ON "identity_provider_settings"
FOR EACH ROW
WHEN NEW."updated" IS OLD."updated"
BEGIN
  UPDATE "identity_provider_settings" SET "updated" = (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) WHERE "id" = OLD."id";
END;
GO
CREATE TABLE "identity_provider_linked_user_field_types" (
    "id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    "uuid" TEXT CONSTRAINT "identity_provider_linked_user_field_types_uuid_default_constraint" DEFAULT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))), 2) || '-' || substr('89ab', abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))), 2) || '-' || lower(hex(randomblob(6)))) NOT NULL,
    "created" TEXT CONSTRAINT "identity_provider_linked_user_field_types_created_default_constraint" DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
    "updated" TEXT CONSTRAINT "identity_provider_linked_user_field_types_updated_default_constraint" DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
    "version" BLOB CONSTRAINT "identity_provider_linked_user_field_types_version_default_constraint" DEFAULT X'00' NOT NULL,
    "name" VARCHAR(256) NOT NULL,
    CONSTRAINT "identity_provider_linked_user_field_types_uuid_unique_constraint" UNIQUE ("uuid")
);
GO
CREATE TRIGGER "trg_identity_provider_linked_user_field_types_updated_at"
AFTER UPDATE ON "identity_provider_linked_user_field_types"
FOR EACH ROW
WHEN NEW."updated" IS OLD."updated"
BEGIN
  UPDATE "identity_provider_linked_user_field_types" SET "updated" = (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) WHERE "id" = OLD."id";
END;
GO
CREATE TABLE "identity_provider_linked_users" (
    "id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    "uuid" TEXT CONSTRAINT "identity_provider_linked_users_uuid_default_constraint" DEFAULT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))), 2) || '-' || substr('89ab', abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))), 2) || '-' || lower(hex(randomblob(6)))) NOT NULL,
    "created" TEXT CONSTRAINT "identity_provider_linked_users_created_default_constraint" DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
    "updated" TEXT CONSTRAINT "identity_provider_linked_users_updated_default_constraint" DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
    "version" BLOB CONSTRAINT "identity_provider_linked_users_version_default_constraint" DEFAULT X'00' NOT NULL,
    "identity_provider_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "identity_provider_linked_user_field_type_id" INTEGER NOT NULL,
    "value" TEXT NOT NULL,
    CONSTRAINT "identity_provider_linked_users_uuid_unique_constraint" UNIQUE ("uuid"),
    CONSTRAINT "identity_provider_linked_users_identity_provider_id_foreign_key" FOREIGN KEY ("identity_provider_id") REFERENCES "identity_providers" ("id"),
    CONSTRAINT "identity_provider_linked_users_user_id_foreign_key" FOREIGN KEY ("user_id") REFERENCES "users" ("id"),
    CONSTRAINT "identity_provider_linked_users_identity_provider_linked_user_field_type_id_foreign_key" FOREIGN KEY ("identity_provider_linked_user_field_type_id") REFERENCES "identity_provider_linked_user_field_types" ("id")
);
GO
CREATE TRIGGER "trg_identity_provider_linked_users_updated_at"
AFTER UPDATE ON "identity_provider_linked_users"
FOR EACH ROW
WHEN NEW."updated" IS OLD."updated"
BEGIN
  UPDATE "identity_provider_linked_users" SET "updated" = (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) WHERE "id" = OLD."id";
END;
GO
CREATE TABLE "session_types" (
    "id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    "uuid" TEXT CONSTRAINT "session_types_uuid_default_constraint" DEFAULT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))), 2) || '-' || substr('89ab', abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))), 2) || '-' || lower(hex(randomblob(6)))) NOT NULL,
    "created" TEXT CONSTRAINT "session_types_created_default_constraint" DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
    "updated" TEXT CONSTRAINT "session_types_updated_default_constraint" DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
    "version" BLOB CONSTRAINT "session_types_version_default_constraint" DEFAULT X'00' NOT NULL,
    "name" VARCHAR(512) NOT NULL,
    CONSTRAINT "session_types_uuid_unique_constraint" UNIQUE ("uuid")
);
GO
CREATE TRIGGER "trg_session_types_updated_at"
AFTER UPDATE ON "session_types"
FOR EACH ROW
WHEN NEW."updated" IS OLD."updated"
BEGIN
  UPDATE "session_types" SET "updated" = (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) WHERE "id" = OLD."id";
END;
GO
CREATE TABLE "sessions" (
    "id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    "uuid" TEXT CONSTRAINT "sessions_uuid_default_constraint" DEFAULT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))), 2) || '-' || substr('89ab', abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))), 2) || '-' || lower(hex(randomblob(6)))) NOT NULL,
    "created" TEXT CONSTRAINT "sessions_created_default_constraint" DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
    "updated" TEXT CONSTRAINT "sessions_updated_default_constraint" DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
    "version" BLOB CONSTRAINT "sessions_version_default_constraint" DEFAULT X'00' NOT NULL,
    "session_type_id" INTEGER NOT NULL,
    "user_id" INTEGER,
    "relative_expiration" INTEGER,
    "absolute_expiration" TEXT,
    "revoked" TEXT,
    "expired" TEXT,
    "is_enabled" BOOLEAN CONSTRAINT "sessions_is_enabled_default_constraint" DEFAULT 1 NOT NULL,
    CONSTRAINT "sessions_uuid_unique_constraint" UNIQUE ("uuid"),
    CONSTRAINT "sessions_session_type_id_foreign_key" FOREIGN KEY ("session_type_id") REFERENCES "session_types" ("id"),
    CONSTRAINT "sessions_user_id_foreign_key" FOREIGN KEY ("user_id") REFERENCES "users" ("id")
);
GO
CREATE TRIGGER "trg_sessions_updated_at"
AFTER UPDATE ON "sessions"
FOR EACH ROW
WHEN NEW."updated" IS OLD."updated"
BEGIN
  UPDATE "sessions" SET "updated" = (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) WHERE "id" = OLD."id";
END;
GO
CREATE TABLE "authorization_codes" (
    "id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    "uuid" TEXT CONSTRAINT "authorization_codes_uuid_default_constraint" DEFAULT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))), 2) || '-' || substr('89ab', abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))), 2) || '-' || lower(hex(randomblob(6)))) NOT NULL,
    "created" TEXT CONSTRAINT "authorization_codes_created_default_constraint" DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
    "updated" TEXT CONSTRAINT "authorization_codes_updated_default_constraint" DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
    "version" BLOB CONSTRAINT "authorization_codes_version_default_constraint" DEFAULT X'00' NOT NULL,
    "session_id" INTEGER,
    "code" VARCHAR(512) NOT NULL,
    "is_used" BOOLEAN CONSTRAINT "authorization_codes_is_used_default_constraint" DEFAULT 1 NOT NULL,
    "is_deleted" BOOLEAN CONSTRAINT "authorization_codes_is_deleted_default_constraint" DEFAULT 0 NOT NULL,
    CONSTRAINT "authorization_codes_uuid_unique_constraint" UNIQUE ("uuid"),
    CONSTRAINT "authorization_codes_session_id_foreign_key" FOREIGN KEY ("session_id") REFERENCES "sessions" ("id")
);
GO
CREATE TRIGGER "trg_authorization_codes_updated_at"
AFTER UPDATE ON "authorization_codes"
FOR EACH ROW
WHEN NEW."updated" IS OLD."updated"
BEGIN
  UPDATE "authorization_codes" SET "updated" = (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) WHERE "id" = OLD."id";
END;
GO
CREATE TABLE "identity_provider_authorize_sessions" (
    "id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    "uuid" TEXT CONSTRAINT "identity_provider_authorize_sessions_uuid_default_constraint" DEFAULT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))), 2) || '-' || substr('89ab', abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))), 2) || '-' || lower(hex(randomblob(6)))) NOT NULL,
    "created" TEXT CONSTRAINT "identity_provider_authorize_sessions_created_default_constraint" DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
    "updated" TEXT CONSTRAINT "identity_provider_authorize_sessions_updated_default_constraint" DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
    "version" BLOB CONSTRAINT "identity_provider_authorize_sessions_version_default_constraint" DEFAULT X'00' NOT NULL,
    "identity_provider_id" INTEGER NOT NULL,
    "session_id" INTEGER NOT NULL,
    "redirect_uri" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "code_challenge" TEXT NOT NULL,
    "code_challenge_method" VARCHAR(128) NOT NULL,
    "revoked" TEXT,
    "finished" TEXT,
    "is_deleted" BOOLEAN CONSTRAINT "identity_provider_authorize_sessions_is_deleted_default_constraint" DEFAULT 0 NOT NULL,
    CONSTRAINT "identity_provider_authorize_sessions_uuid_unique_constraint" UNIQUE ("uuid"),
    CONSTRAINT "identity_provider_authorize_sessions_identity_provider_id_foreign_key" FOREIGN KEY ("identity_provider_id") REFERENCES "identity_providers" ("id"),
    CONSTRAINT "identity_provider_authorize_sessions_session_id_foreign_key" FOREIGN KEY ("session_id") REFERENCES "sessions" ("id")
);
GO
CREATE TRIGGER "trg_identity_provider_authorize_sessions_updated_at"
AFTER UPDATE ON "identity_provider_authorize_sessions"
FOR EACH ROW
WHEN NEW."updated" IS OLD."updated"
BEGIN
  UPDATE "identity_provider_authorize_sessions" SET "updated" = (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) WHERE "id" = OLD."id";
END;
GO
CREATE TABLE "identity_provider_signin_attempts" (
    "id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    "uuid" TEXT CONSTRAINT "identity_provider_signin_attempts_uuid_default_constraint" DEFAULT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))), 2) || '-' || substr('89ab', abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))), 2) || '-' || lower(hex(randomblob(6)))) NOT NULL,
    "created" TEXT CONSTRAINT "identity_provider_signin_attempts_created_default_constraint" DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
    "updated" TEXT CONSTRAINT "identity_provider_signin_attempts_updated_default_constraint" DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
    "version" BLOB CONSTRAINT "identity_provider_signin_attempts_version_default_constraint" DEFAULT X'00' NOT NULL,
    "identity_provider_id" INTEGER NOT NULL,
    "session_id" INTEGER NOT NULL,
    "authentication_method_id" INTEGER NOT NULL,
    "is_success" BOOLEAN NOT NULL,
    CONSTRAINT "identity_provider_signin_attempts_uuid_unique_constraint" UNIQUE ("uuid"),
    CONSTRAINT "identity_provider_signin_attempts_identity_provider_id_foreign_key" FOREIGN KEY ("identity_provider_id") REFERENCES "identity_providers" ("id"),
    CONSTRAINT "identity_provider_signin_attempts_session_id_foreign_key" FOREIGN KEY ("session_id") REFERENCES "sessions" ("id"),
    CONSTRAINT "identity_provider_signin_attempts_authentication_method_id_foreign_key" FOREIGN KEY ("authentication_method_id") REFERENCES "authentication_methods" ("id")
);
GO
CREATE TRIGGER "trg_identity_provider_signin_attempts_updated_at"
AFTER UPDATE ON "identity_provider_signin_attempts"
FOR EACH ROW
WHEN NEW."updated" IS OLD."updated"
BEGIN
  UPDATE "identity_provider_signin_attempts" SET "updated" = (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) WHERE "id" = OLD."id";
END;
GO
CREATE TABLE "session_hits" (
    "id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    "uuid" TEXT CONSTRAINT "session_hits_uuid_default_constraint" DEFAULT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))), 2) || '-' || substr('89ab', abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))), 2) || '-' || lower(hex(randomblob(6)))) NOT NULL,
    "created" TEXT CONSTRAINT "session_hits_created_default_constraint" DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
    "updated" TEXT CONSTRAINT "session_hits_updated_default_constraint" DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
    "version" BLOB CONSTRAINT "session_hits_version_default_constraint" DEFAULT X'00' NOT NULL,
    "session_id" INTEGER NOT NULL,
    "ip_address" BLOB NOT NULL,
    CONSTRAINT "session_hits_uuid_unique_constraint" UNIQUE ("uuid"),
    CONSTRAINT "session_hits_session_id_foreign_key" FOREIGN KEY ("session_id") REFERENCES "sessions" ("id")
);
GO
CREATE TRIGGER "trg_session_hits_updated_at"
AFTER UPDATE ON "session_hits"
FOR EACH ROW
WHEN NEW."updated" IS OLD."updated"
BEGIN
  UPDATE "session_hits" SET "updated" = (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) WHERE "id" = OLD."id";
END;
GO
CREATE TABLE "session_states" (
    "id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    "uuid" TEXT CONSTRAINT "session_states_uuid_default_constraint" DEFAULT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))), 2) || '-' || substr('89ab', abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))), 2) || '-' || lower(hex(randomblob(6)))) NOT NULL,
    "created" TEXT CONSTRAINT "session_states_created_default_constraint" DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
    "updated" TEXT CONSTRAINT "session_states_updated_default_constraint" DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
    "version" BLOB CONSTRAINT "session_states_version_default_constraint" DEFAULT X'00' NOT NULL,
    "session_id" INTEGER NOT NULL,
    "state" TEXT NOT NULL,
    "code_challenge" TEXT,
    "code_challenge_method" VARCHAR(256),
    "revoked" TEXT,
    "is_enabled" BOOLEAN CONSTRAINT "session_states_is_enabled_default_constraint" DEFAULT 1 NOT NULL,
    CONSTRAINT "session_states_uuid_unique_constraint" UNIQUE ("uuid"),
    CONSTRAINT "session_states_session_id_foreign_key" FOREIGN KEY ("session_id") REFERENCES "sessions" ("id")
);
GO
CREATE TRIGGER "trg_session_states_updated_at"
AFTER UPDATE ON "session_states"
FOR EACH ROW
WHEN NEW."updated" IS OLD."updated"
BEGIN
  UPDATE "session_states" SET "updated" = (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) WHERE "id" = OLD."id";
END;
GO
CREATE TABLE "apps" (
    "id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    "uuid" TEXT CONSTRAINT "apps_uuid_default_constraint" DEFAULT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))), 2) || '-' || substr('89ab', abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))), 2) || '-' || lower(hex(randomblob(6)))) NOT NULL,
    "created" TEXT CONSTRAINT "apps_created_default_constraint" DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
    "updated" TEXT CONSTRAINT "apps_updated_default_constraint" DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
    "version" BLOB CONSTRAINT "apps_version_default_constraint" DEFAULT X'00' NOT NULL,
    "name" VARCHAR(128) NOT NULL,
    CONSTRAINT "apps_uuid_unique_constraint" UNIQUE ("uuid")
);
GO
CREATE UNIQUE INDEX "apps_app_base_name_index" ON "apps" ("name");
GO
CREATE TRIGGER "trg_apps_updated_at"
AFTER UPDATE ON "apps"
FOR EACH ROW
WHEN NEW."updated" IS OLD."updated"
BEGIN
  UPDATE "apps" SET "updated" = (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) WHERE "id" = OLD."id";
END;
GO
CREATE TABLE "settings" (
    "id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    "uuid" TEXT CONSTRAINT "settings_uuid_default_constraint" DEFAULT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))), 2) || '-' || substr('89ab', abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))), 2) || '-' || lower(hex(randomblob(6)))) NOT NULL,
    "created" TEXT CONSTRAINT "settings_created_default_constraint" DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
    "updated" TEXT CONSTRAINT "settings_updated_default_constraint" DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
    "version" BLOB CONSTRAINT "settings_version_default_constraint" DEFAULT X'00' NOT NULL,
    "app_id" INTEGER NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "value" TEXT NOT NULL,
    CONSTRAINT "settings_uuid_unique_constraint" UNIQUE ("uuid"),
    CONSTRAINT "settings_app_id_foreign_key" FOREIGN KEY ("app_id") REFERENCES "apps" ("id")
);
GO
CREATE UNIQUE INDEX "settings_setting_app_id_name_index" ON "settings" ("app_id", "name");
GO
CREATE TRIGGER "trg_settings_updated_at"
AFTER UPDATE ON "settings"
FOR EACH ROW
WHEN NEW."updated" IS OLD."updated"
BEGIN
  UPDATE "settings" SET "updated" = (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) WHERE "id" = OLD."id";
END;
GO
-- Seed data
-- Seeds: genders
GO
INSERT INTO "genders" ("id", "uuid", "name", "description") VALUES (1, '9a81c98b-b74f-55fc-ba2c-02365a89ea86', 'Male', 'Male');
GO
INSERT INTO "genders" ("id", "uuid", "name", "description") VALUES (2, 'e35b9efd-f2e0-5b76-a6df-521469c97c1b', 'Female', 'Female');
GO
INSERT INTO "genders" ("id", "uuid", "name", "description") VALUES (3, '259d0d77-76c9-50f7-a197-f7b0064b161c', 'Other', 'Other');
GO
INSERT INTO "genders" ("id", "uuid", "name", "description") VALUES (4, '7d42e061-bac3-5e43-aa4c-fd0a7924fa5b', 'Agender', 'A person who does not identify themselves with or experience any gender. Also called null-gender, genderless, gendervoid, or neutral gender.');
GO
INSERT INTO "genders" ("id", "uuid", "name", "description") VALUES (5, '6ec4e277-333d-5e40-9695-844289209c2d', 'Abimegender', 'Associated with being profound, deep, and infinite. May be used alone or in combination with other genders.');
GO
INSERT INTO "genders" ("id", "uuid", "name", "description") VALUES (6, '14f0a0f0-2495-5375-9c45-eaca1b180651', 'Adamas gender', 'A gender that is indefinable or indomitable. People identifying with this gender refuse to be categorized in any particular gender identity.');
GO
INSERT INTO "genders" ("id", "uuid", "name", "description") VALUES (7, '91d2c24a-1896-5772-87ce-bee6175cfb1f', 'Aerogender', 'Also called evaisgender, this gender identity changes according to one''s surroundings.');
GO
INSERT INTO "genders" ("id", "uuid", "name", "description") VALUES (8, 'c2970dfe-44be-539c-ab82-cab1c8412fd0', 'Aesthetigender', 'Also called aesthetgender, a type of gender identity derived from aesthetics.');
GO
INSERT INTO "genders" ("id", "uuid", "name", "description") VALUES (9, '7f51ee52-a2fb-5478-abb4-17f2d828ddee', 'Affectugender', 'Based on the person''s mood swings or fluctuations.');
GO
INSERT INTO "genders" ("id", "uuid", "name", "description") VALUES (10, 'af40649a-59ee-5626-8839-4d7fcc4e3bdd', 'Agenderflux', 'Mostly agender with brief shifts of belonging to other gender types.');
GO
INSERT INTO "genders" ("id", "uuid", "name", "description") VALUES (11, 'b3304b19-4885-5647-b486-eff531d360cf', 'Alexigender', 'A fluid gender identity between more than one type of gender although the person cannot name the genders they feel fluid in.');
GO
INSERT INTO "genders" ("id", "uuid", "name", "description") VALUES (12, '551c0b54-2fdb-5027-a583-1943118eda3d', 'Aliusgender', 'Stands apart from existing social gender constructs. A strong specific gender identity that is neither male nor female.');
GO
INSERT INTO "genders" ("id", "uuid", "name", "description") VALUES (13, 'aaf0ed50-15cc-50c5-b0a3-45ad541f77de', 'Amaregender', 'A gender identity that changes depending on the person one is emotionally attached to.');
GO
INSERT INTO "genders" ("id", "uuid", "name", "description") VALUES (14, '262a80da-4a72-54ff-a73a-a8b9d30a3aa4', 'Ambigender', 'Two specific gender identities simultaneously without any fluidity or fluctuations.');
GO
INSERT INTO "genders" ("id", "uuid", "name", "description") VALUES (15, 'df35e5ba-7e81-5b4b-8ead-1c8174011f5a', 'Ambonec', 'The person identifies as both man and woman and yet does not belong to either.');
GO
INSERT INTO "genders" ("id", "uuid", "name", "description") VALUES (16, 'dc3b2bba-09f9-5558-8857-509b7674e77b', 'Amicagender', 'A gender-fluid identity where a person changes their gender depending on the friends they have.');
GO
INSERT INTO "genders" ("id", "uuid", "name", "description") VALUES (17, 'c0529ffa-75e1-5cf4-94ae-e10f530798ba', 'Androgyne', 'A combination of feminine and masculine genders.');
GO
INSERT INTO "genders" ("id", "uuid", "name", "description") VALUES (18, 'e77df1e5-2d00-5e0f-ae9e-6571f62e4cf7', 'Anesigender', 'Feeling close to a specific type of gender despite being more comfortable identifying with another gender.');
GO
INSERT INTO "genders" ("id", "uuid", "name", "description") VALUES (19, '6f9fcd02-935f-57e0-be3b-8a953784ee6f', 'Angenital', 'Desiring to be without any primary sexual characteristics without identifying as genderless.');
GO
INSERT INTO "genders" ("id", "uuid", "name", "description") VALUES (20, 'bd47f1f7-5f2b-5606-bb12-f5661ac577ae', 'Anogender', 'Gender identity fades in and out in intensity but always comes back to the same gendered feeling.');
GO
INSERT INTO "genders" ("id", "uuid", "name", "description") VALUES (21, 'ffcad1cc-18af-5bac-8423-a58071dce22c', 'Anongender', 'Having a gender identity but not labeling it or preferring not to have a label.');
GO
INSERT INTO "genders" ("id", "uuid", "name", "description") VALUES (22, 'd992d30b-6063-56c9-8f3c-9f8e961e471c', 'Antegender', 'A protean gender that can be anything but is formless and motionless.');
GO
INSERT INTO "genders" ("id", "uuid", "name", "description") VALUES (23, '4d6f3cdb-4378-5d98-a885-b3090ebc0c0d', 'Anxiegender', 'A gender identity with anxiety as its prominent characteristic.');
GO
INSERT INTO "genders" ("id", "uuid", "name", "description") VALUES (24, '2f2d2aa4-14b1-58fe-9966-a0612f4913da', 'Apagender', 'Apathy or a lack of feelings toward one''s gender identity.');
GO
INSERT INTO "genders" ("id", "uuid", "name", "description") VALUES (25, 'd8080e89-b7de-52d7-847c-4fcb3a7cc4e2', 'Apconsugender', 'Knowing what are not the characteristics of gender but not knowing what are its characteristics.');
GO
INSERT INTO "genders" ("id", "uuid", "name", "description") VALUES (26, '1f1a5492-361e-5750-9621-d27eb533468d', 'Astergender', 'A bright and celestial gender identity.');
GO
INSERT INTO "genders" ("id", "uuid", "name", "description") VALUES (27, '5b98e88c-592f-5706-a82f-aa5826d6a988', 'Astral gender', 'A gender identity that feels related to space.');
GO
INSERT INTO "genders" ("id", "uuid", "name", "description") VALUES (28, 'e839b579-22ba-589e-8c7f-0a37cf3c635e', 'Autigender', 'A gender identity that feels closely related to being autistic.');
GO
INSERT INTO "genders" ("id", "uuid", "name", "description") VALUES (29, '657e3c23-2fcf-564e-bb00-e1be6e66eb45', 'Autogender', 'A gender experience that is deeply connected and personal to oneself.');
GO
INSERT INTO "genders" ("id", "uuid", "name", "description") VALUES (30, '557017db-086b-5a07-9f31-45c9dbf457cf', 'Axigender', 'Between the two extremes of agender and any other type of gender, experienced one at a time without overlapping.');
GO
INSERT INTO "genders" ("id", "uuid", "name", "description") VALUES (31, '30897e5a-80e4-5cce-b249-b84b59f66262', 'Bigender', 'Two gender identities at the same or different times.');
GO
INSERT INTO "genders" ("id", "uuid", "name", "description") VALUES (32, 'd1ce4717-7367-5ebf-95d7-a201820664ad', 'Biogender', 'A gender closely related to nature.');
GO
INSERT INTO "genders" ("id", "uuid", "name", "description") VALUES (33, 'f7d7aa3a-92e0-5967-bcad-0b95ea95661c', 'Blurgender', 'More than one gender identity that blur into each other so no particular type is clear. Also called gender fuss.');
GO
INSERT INTO "genders" ("id", "uuid", "name", "description") VALUES (34, '8b579b30-90f2-5f6e-a3ea-9e7df80009da', 'Boyflux', 'Identifies as male but experiences varying degrees of male identity, ranging from agender to completely male.');
GO
INSERT INTO "genders" ("id", "uuid", "name", "description") VALUES (35, 'd0de2d1b-8d6f-5c4e-ba3f-f039c1549e8c', 'Burstgender', 'Frequent bursts of intense feelings quickly move to the initial calm stage.');
GO
INSERT INTO "genders" ("id", "uuid", "name", "description") VALUES (36, 'bf99c30c-039c-57d6-94dd-6541349ff5e8', 'Caelgender', 'Shares the qualities or aesthetics of outer space.');
GO
INSERT INTO "genders" ("id", "uuid", "name", "description") VALUES (37, 'a2506b84-21ad-52dc-a6b8-afa02f0f9956', 'Cassgender', 'Associated with considering gender irrelevant or unimportant.');
GO
INSERT INTO "genders" ("id", "uuid", "name", "description") VALUES (38, '332d3550-2054-5c0b-8608-d99690a3e26d', 'Cassflux', 'A fluctuating intensity of irrelevance toward gender.');
GO
INSERT INTO "genders" ("id", "uuid", "name", "description") VALUES (39, 'f6af310c-a362-5bed-8bda-da005c14eece', 'Cavusgender', 'Feeling close to one gender when depressed and to another when not depressed.');
GO
INSERT INTO "genders" ("id", "uuid", "name", "description") VALUES (40, 'ab557c88-9992-5e16-a9ac-4a0be0154cfa', 'Cendgender', 'Gender identity changes from one gender to its opposite.');
GO
INSERT INTO "genders" ("id", "uuid", "name", "description") VALUES (41, 'c13e2aed-f124-529a-82f4-aacfc7893fec', 'Ceterogender', 'A nonbinary gender with specific masculine, feminine, or neutral feelings.');
GO
INSERT INTO "genders" ("id", "uuid", "name", "description") VALUES (42, '5ceb107c-3891-5aae-8af1-47d0c7fbe30f', 'Ceterofluid', 'A ceterogender whose identity keeps fluctuating between different genders.');
GO
INSERT INTO "genders" ("id", "uuid", "name", "description") VALUES (43, '9abd716e-bee3-5df6-807e-83399c02cf17', 'Cisgender', 'Closely related to the gender assigned at birth during the entire life.');
GO
INSERT INTO "genders" ("id", "uuid", "name", "description") VALUES (44, '2614df92-cf09-5fa7-923f-2d38088513cf', 'Cloudgender', 'Gender cannot be comprehended due to depersonalization and derealization disorder.');
GO
INSERT INTO "genders" ("id", "uuid", "name", "description") VALUES (45, '723becfb-3143-556c-8917-efaecdb73876', 'Collgender', 'Various genders present at the same time.');
GO
INSERT INTO "genders" ("id", "uuid", "name", "description") VALUES (46, '2ee58eba-e067-55d0-b2c9-302527efcaef', 'Colorgender', 'Colors are used to describe gender, e.g., pink gender or black gender.');
GO
INSERT INTO "genders" ("id", "uuid", "name", "description") VALUES (47, '8d856103-ee2f-5c70-85b1-9aaedf62c5ff', 'Commogender', 'Knows they are not cisgender yet continues to identify as one for a while.');
GO
INSERT INTO "genders" ("id", "uuid", "name", "description") VALUES (48, '2ef9d325-1df7-531c-b450-7502d3d42e34', 'Condigender', 'Feels their gender only under specific circumstances.');
GO
INSERT INTO "genders" ("id", "uuid", "name", "description") VALUES (49, 'bd129e22-40ff-56e3-92e4-8928f17a69b2', 'Deliciagender', 'Having multiple genders but preferring one over the other.');
GO
INSERT INTO "genders" ("id", "uuid", "name", "description") VALUES (50, '7efeb822-2613-5ebd-b84f-37fb10e630b3', 'Demifluid', 'Multiple genders, some fluid while others are static.');
GO
INSERT INTO "genders" ("id", "uuid", "name", "description") VALUES (51, '3527671a-ce52-52a7-8094-2adb82b3122c', 'Demiflux', 'Multiple genders with some static and others fluctuating in intensity.');
GO
INSERT INTO "genders" ("id", "uuid", "name", "description") VALUES (52, 'b198b34e-58a6-5377-a9d3-a86372cd4a8e', 'Demigender', 'Partial traits of one gender and the rest of the other gender.');
GO
INSERT INTO "genders" ("id", "uuid", "name", "description") VALUES (53, 'e8c75270-9ee0-5b9c-8f93-d70279e979b5', 'Domgender', 'Multiple genders with one dominating over the rest.');
GO
INSERT INTO "genders" ("id", "uuid", "name", "description") VALUES (54, 'cfde6341-f526-5644-93c9-2e3b77ee11f0', 'Duragender', 'More than one gender with one lasting longer than the others.');
GO
INSERT INTO "genders" ("id", "uuid", "name", "description") VALUES (55, '91c662e3-2d01-56c5-8884-25016970f781', 'Egogender', 'A personal type of gender identified by the individual alone, based on experience within the self.');
GO
INSERT INTO "genders" ("id", "uuid", "name", "description") VALUES (56, 'be6dea08-2d97-5480-9066-594280b46778', 'Epicene', 'A strong feeling of not being able to relate to any or both of the binary gender characteristics.');
GO
INSERT INTO "genders" ("id", "uuid", "name", "description") VALUES (57, 'e94171d6-5084-592e-9e5d-19ac857e1d1c', 'Esspigender', 'Gender identity related to spirits.');
GO
INSERT INTO "genders" ("id", "uuid", "name", "description") VALUES (58, '8a217618-a207-506f-9cb8-66a31e90e7da', 'Exgender', 'Denial to identify with any gender on the gender spectrum.');
GO
INSERT INTO "genders" ("id", "uuid", "name", "description") VALUES (59, '02371de9-1693-5415-9066-40ea8dc60f4b', 'Existigender', 'Gender identity exists only when the person makes conscious efforts to realize it.');
GO
INSERT INTO "genders" ("id", "uuid", "name", "description") VALUES (60, '6a38bad5-c61e-5204-b552-86aca7b013ef', 'Femfluid', 'Fluid or fluctuating regarding the feminine genders.');
GO
INSERT INTO "genders" ("id", "uuid", "name", "description") VALUES (61, 'c50e4548-a542-5b35-acc3-284b750b93df', 'Femgender', 'A nonbinary gender identity that is feminine.');
GO
INSERT INTO "genders" ("id", "uuid", "name", "description") VALUES (62, '6d049426-e583-5467-85ea-ed132cc85a1a', 'Fluidflux', 'Fluid between two or more genders with fluctuation in intensity of those genders.');
GO
INSERT INTO "genders" ("id", "uuid", "name", "description") VALUES (63, 'a7991187-ad26-543b-a1b5-0401094e2507', 'Gemigender', 'Two genders that are opposite yet flux and work together.');
GO
INSERT INTO "genders" ("id", "uuid", "name", "description") VALUES (64, 'afeec458-0b85-514d-9f43-1c5cf88f68bb', 'Genderblank', 'Closely related to a blank space.');
GO
INSERT INTO "genders" ("id", "uuid", "name", "description") VALUES (65, '431ebf68-70eb-5d26-8bb7-c0f630a070df', 'Genderflow', 'Gender identity is fluid between infinite feelings.');
GO
INSERT INTO "genders" ("id", "uuid", "name", "description") VALUES (66, '6a745a08-87a1-5ac9-a655-bcc84f4e6a1c', 'Genderfluid', 'Does not consistently adhere to one fixed gender and may have many genders.');
GO
INSERT INTO "genders" ("id", "uuid", "name", "description") VALUES (67, '2b2ccbdf-4e3d-515c-a54e-5c4931968191', 'Genderfuzz', 'More than one gender is blurred together.');
GO
INSERT INTO "genders" ("id", "uuid", "name", "description") VALUES (68, '56237acd-1c7f-59ed-b427-b2bf2c9480b9', 'Genderflux', 'Gender fluctuates in intensity.');
GO
INSERT INTO "genders" ("id", "uuid", "name", "description") VALUES (69, '08c2e05b-222d-57db-9bc7-a171466db27f', 'Genderpuck', 'Resists fitting in societal norms concerning genders.');
GO
INSERT INTO "genders" ("id", "uuid", "name", "description") VALUES (70, 'd7351b7a-097c-5883-9810-ef24e1b135e6', 'Genderqueer', 'Blurs the preconceived boundaries of gender in relation to the gender binary or having just one gender type.');
GO
INSERT INTO "genders" ("id", "uuid", "name", "description") VALUES (71, 'e60a3461-2c40-5b56-96ec-5c94e83ee75a', 'Gender witched', 'Inclined toward having one gender but does not know which.');
GO
INSERT INTO "genders" ("id", "uuid", "name", "description") VALUES (72, 'e03c40fb-a4fb-5a74-9639-9b1753d6a71a', 'Girlflux', 'Identifies as female but with varying intensities of female identity.');
GO
INSERT INTO "genders" ("id", "uuid", "name", "description") VALUES (73, '7d1e424f-540b-5996-bcda-a53f6fd24a0f', 'Healgender', 'A gender identity that gives the person peace, calm, and positivity.');
GO
INSERT INTO "genders" ("id", "uuid", "name", "description") VALUES (74, 'b49fcbb7-82df-5f35-9958-fa942df1ea0a', 'Mirrorgender', 'Changing one''s gender type based on the people surrounding.');
GO
INSERT INTO "genders" ("id", "uuid", "name", "description") VALUES (75, 'd0fbbea2-8e5b-56df-93e8-d6ae49a53219', 'Omnigender', 'Having or experiencing all genders.');
GO
-- Seeds: email_types
GO
INSERT INTO "email_types" ("id", "uuid", "name", "description") VALUES (1, 'ba9d1120-def1-5f64-9481-3d6ffe83e080', 'Work', 'Work');
GO
INSERT INTO "email_types" ("id", "uuid", "name", "description") VALUES (2, '89988ebb-6d06-5558-b58c-fb63bf1cb1b3', 'Personal', 'Personal');
GO
INSERT INTO "email_types" ("id", "uuid", "name", "description") VALUES (3, 'e7696dd3-2a8c-50e7-80ae-50f66c51d085', 'Billing', 'Billing');
GO
INSERT INTO "email_types" ("id", "uuid", "name", "description") VALUES (4, '520c4e2b-1554-5edf-9132-d9906c2e1f0e', 'Admin', 'Admin');
GO
INSERT INTO "email_types" ("id", "uuid", "name", "description") VALUES (5, 'd48b9dfd-dff4-5c95-9c26-86743fa5f93e', 'Temp', 'Temp');
GO
INSERT INTO "email_types" ("id", "uuid", "name", "description") VALUES (6, '059fe89b-9db7-5b0c-9d48-10e1b22a9895', 'Other', 'Other');
GO
-- Seeds: phone_types
GO
INSERT INTO "phone_types" ("id", "uuid", "name", "description") VALUES (1, '775f24d4-e8cb-505c-9671-1d53c44f2780', 'Mobile', 'Mobile');
GO
INSERT INTO "phone_types" ("id", "uuid", "name", "description") VALUES (2, 'f5400d5e-2d9c-5f28-855a-3c893af2e951', 'Work', 'Work');
GO
INSERT INTO "phone_types" ("id", "uuid", "name", "description") VALUES (3, '3341543b-9c7c-5006-9b77-527ea9521221', 'Home', 'Home');
GO
INSERT INTO "phone_types" ("id", "uuid", "name", "description") VALUES (4, 'c86ffd75-2e88-56c0-81a7-a6bf8fbbccf7', 'Fax', 'Fax');
GO
INSERT INTO "phone_types" ("id", "uuid", "name", "description") VALUES (5, '6a107d46-427f-5501-935a-7b2d7a1f7361', 'Other', 'Other');
GO
-- Seeds: labels
GO
INSERT INTO "labels" ("id", "uuid", "name", "description") VALUES (1, '62b21d4c-39ec-585d-8461-9352d97bc56d', 'Family', 'Family members and relatives');
GO
INSERT INTO "labels" ("id", "uuid", "name", "description") VALUES (2, 'ae2f4fca-f8b6-544f-903c-06487fb1aefc', 'Friends', 'Personal friends');
GO
INSERT INTO "labels" ("id", "uuid", "name", "description") VALUES (3, '9bd502c5-a97d-5b2e-9b6e-571e62d814f5', 'Work', 'Work and professional contacts');
GO
-- Seeds: languages
GO
INSERT INTO "languages" ("id", "uuid", "code", "name") VALUES (1, '483a00f1-9a33-593d-a73c-dcb43dbd14e3', 'aa', 'Afar');
GO
INSERT INTO "languages" ("id", "uuid", "code", "name") VALUES (2, '6738187c-66de-5c86-ad9b-273f84b97d49', 'ab', 'Abkhazian');
GO
INSERT INTO "languages" ("id", "uuid", "code", "name") VALUES (3, '96cf7ac4-2235-5c25-bad9-c896701910ea', 'ae', 'Avestan');
GO
INSERT INTO "languages" ("id", "uuid", "code", "name") VALUES (4, 'ff51c7dd-b613-5106-bffd-7de1b0628804', 'af', 'Afrikaans');
GO
INSERT INTO "languages" ("id", "uuid", "code", "name") VALUES (5, '34018963-1ee8-5f5f-9d76-327fe0804763', 'ak', 'Akan');
GO
INSERT INTO "languages" ("id", "uuid", "code", "name") VALUES (6, '6a6c36ee-a5bc-52e5-96eb-3ce5c7e67ca0', 'am', 'Amharic');
GO
INSERT INTO "languages" ("id", "uuid", "code", "name") VALUES (7, '8d64a44e-8bc0-56b1-8c03-fed7155f3bed', 'an', 'Aragonese');
GO
INSERT INTO "languages" ("id", "uuid", "code", "name") VALUES (8, 'c264cc5e-5f72-525d-8161-cf7c452c1320', 'ar', 'Arabic');
GO
INSERT INTO "languages" ("id", "uuid", "code", "name") VALUES (9, '98dcae40-fb4e-5c43-900d-696a78721ab2', 'as', 'Assamese');
GO
INSERT INTO "languages" ("id", "uuid", "code", "name") VALUES (10, '2a79aafa-9496-5082-ac50-9512abed0179', 'av', 'Avaric');
GO
INSERT INTO "languages" ("id", "uuid", "code", "name") VALUES (11, '82245f9b-f273-557a-b60f-fdf4f59ecc94', 'ay', 'Aymara');
GO
INSERT INTO "languages" ("id", "uuid", "code", "name") VALUES (12, 'de11d4d4-f374-5a31-9a07-f06342db5087', 'az', 'Azerbaijani');
GO
INSERT INTO "languages" ("id", "uuid", "code", "name") VALUES (13, 'edb52ca5-4368-5b43-b8da-733d426291d2', 'ba', 'Bashkir');
GO
INSERT INTO "languages" ("id", "uuid", "code", "name") VALUES (14, '1e6784be-66f8-5ee9-a1b1-ed2001de769e', 'be', 'Belarusian');
GO
INSERT INTO "languages" ("id", "uuid", "code", "name") VALUES (15, '2465dffe-7bcc-5263-8f32-3e9decb7c183', 'bg', 'Bulgarian');
GO
INSERT INTO "languages" ("id", "uuid", "code", "name") VALUES (16, '7a48f7a0-9bd9-50f2-87db-c520633539a8', 'bh', 'Bihari languages');
GO
INSERT INTO "languages" ("id", "uuid", "code", "name") VALUES (17, '0922f7d8-99df-5d25-96e9-44ac56a8414d', 'bi', 'Bislama');
GO
INSERT INTO "languages" ("id", "uuid", "code", "name") VALUES (18, 'a888ce6d-a5bd-5170-9ec3-d809808ebc9e', 'bm', 'Bambara');
GO
INSERT INTO "languages" ("id", "uuid", "code", "name") VALUES (19, '7ce18c20-63fa-5ea5-8d45-5ddfc4de658f', 'bn', 'Bengali');
GO
INSERT INTO "languages" ("id", "uuid", "code", "name") VALUES (20, 'cc89a949-83b0-5036-a442-ca5bf165a70e', 'bo', 'Tibetan');
GO
INSERT INTO "languages" ("id", "uuid", "code", "name") VALUES (21, '19b8840c-de61-53be-bf3f-cef10e83f10f', 'br', 'Breton');
GO
INSERT INTO "languages" ("id", "uuid", "code", "name") VALUES (22, 'c7a919ba-b2f1-5935-8c6e-38b8e426669f', 'bs', 'Bosnian');
GO
INSERT INTO "languages" ("id", "uuid", "code", "name") VALUES (23, 'e1583bfc-b9a6-5035-97a9-34e285571f0a', 'ca', 'Catalan');
GO
INSERT INTO "languages" ("id", "uuid", "code", "name") VALUES (24, '36a2ea48-23d8-5b15-bf54-d222ff60af96', 'ce', 'Chechen');
GO
INSERT INTO "languages" ("id", "uuid", "code", "name") VALUES (25, 'a454c9cd-c2ee-50d4-8534-419e4fe2bdfa', 'ch', 'Chamorro');
GO
INSERT INTO "languages" ("id", "uuid", "code", "name") VALUES (26, '2243227d-ffee-5a01-99e9-b1a37638519a', 'co', 'Corsican');
GO
INSERT INTO "languages" ("id", "uuid", "code", "name") VALUES (27, 'a47d87bf-620d-5fd6-a19f-3b4b9064b642', 'cr', 'Cree');
GO
INSERT INTO "languages" ("id", "uuid", "code", "name") VALUES (28, '155aa2eb-0219-506f-b1ae-83f2745e91f8', 'cs', 'Czech');
GO
INSERT INTO "languages" ("id", "uuid", "code", "name") VALUES (29, '54fb0c36-24ca-53d0-9b32-37906f3928de', 'cu', 'Church Slavic');
GO
INSERT INTO "languages" ("id", "uuid", "code", "name") VALUES (30, 'd739ad52-e41d-58b0-a2eb-ad5409b42925', 'cv', 'Chuvash');
GO
INSERT INTO "languages" ("id", "uuid", "code", "name") VALUES (31, 'cda500f2-4ad7-5253-bc3b-8448e8d5accc', 'cy', 'Welsh');
GO
INSERT INTO "languages" ("id", "uuid", "code", "name") VALUES (32, 'a4193e07-6b8c-590c-ad01-edd798606523', 'da', 'Danish');
GO
INSERT INTO "languages" ("id", "uuid", "code", "name") VALUES (33, 'd8f8eb54-1fe7-513d-874b-2ca19b5032cc', 'de', 'German');
GO
INSERT INTO "languages" ("id", "uuid", "code", "name") VALUES (34, 'fa0f3de6-a993-5cc7-9d23-18c9c7d26859', 'dv', 'Divehi');
GO
INSERT INTO "languages" ("id", "uuid", "code", "name") VALUES (35, '6fb584f0-9aee-55f4-9bea-c17ccf348463', 'dz', 'Dzongkha');
GO
INSERT INTO "languages" ("id", "uuid", "code", "name") VALUES (36, '4288bb22-d8f1-5304-824a-ee8a9edfa147', 'ee', 'Ewe');
GO
INSERT INTO "languages" ("id", "uuid", "code", "name") VALUES (37, 'cc51b429-4f60-58b5-83f6-e45d41a85eef', 'el', 'Greek');
GO
INSERT INTO "languages" ("id", "uuid", "code", "name") VALUES (38, '0a7755d3-e499-5cd2-afb6-f9fffb4a864f', 'en', 'English');
GO
INSERT INTO "languages" ("id", "uuid", "code", "name") VALUES (39, '1daf8cee-5a5d-52f6-9a04-3054507a9ca8', 'eo', 'Esperanto');
GO
INSERT INTO "languages" ("id", "uuid", "code", "name") VALUES (40, 'ac12f384-760b-55ea-940b-77caabf40987', 'es', 'Spanish');
GO
INSERT INTO "languages" ("id", "uuid", "code", "name") VALUES (41, 'f41e8f23-4c8a-592b-9deb-c2b330083ac0', 'et', 'Estonian');
GO
INSERT INTO "languages" ("id", "uuid", "code", "name") VALUES (42, '4ba7fe52-0e24-5311-99d7-9538f16a652a', 'eu', 'Basque');
GO
INSERT INTO "languages" ("id", "uuid", "code", "name") VALUES (43, '59255e99-2d0e-5e7c-9e29-1b641fa66d07', 'fa', 'Persian');
GO
INSERT INTO "languages" ("id", "uuid", "code", "name") VALUES (44, '2b785930-5633-5b76-bff0-479b1bd95abd', 'ff', 'Fulah');
GO
INSERT INTO "languages" ("id", "uuid", "code", "name") VALUES (45, 'a92bd078-5dd2-5cf1-8c93-75e9f384c146', 'fi', 'Finnish');
GO
INSERT INTO "languages" ("id", "uuid", "code", "name") VALUES (46, '1d24721f-b14f-5ed7-8d4b-62c2104401e5', 'fj', 'Fijian');
GO
INSERT INTO "languages" ("id", "uuid", "code", "name") VALUES (47, '975e882e-26b9-5d96-85c4-83995cc0c35b', 'fo', 'Faroese');
GO
INSERT INTO "languages" ("id", "uuid", "code", "name") VALUES (48, '5f47cbb2-682e-5a71-8148-bad120d85b5e', 'fr', 'French');
GO
INSERT INTO "languages" ("id", "uuid", "code", "name") VALUES (49, '9b9c2509-5f6e-5a53-941f-e9ad7910a88a', 'fy', 'Western Frisian');
GO
INSERT INTO "languages" ("id", "uuid", "code", "name") VALUES (50, 'ae43bc68-b16d-5f64-85ab-f20e01e6a4d6', 'ga', 'Irish');
GO
INSERT INTO "languages" ("id", "uuid", "code", "name") VALUES (51, 'c1cc908e-77e6-5e64-ad7f-b0ec3e740b48', 'gd', 'Scottish Gaelic');
GO
INSERT INTO "languages" ("id", "uuid", "code", "name") VALUES (52, 'f2505d6a-b1b5-59a9-9a2d-489b2c7d98fa', 'gl', 'Galician');
GO
INSERT INTO "languages" ("id", "uuid", "code", "name") VALUES (53, '8ac42c71-b786-5ab2-878a-e22a138baa66', 'gn', 'Guarani');
GO
INSERT INTO "languages" ("id", "uuid", "code", "name") VALUES (54, '351b0338-74c1-5591-ad84-bb375911ae54', 'gu', 'Gujarati');
GO
INSERT INTO "languages" ("id", "uuid", "code", "name") VALUES (55, '3c0b4648-c73e-5cdc-93bd-65339961f64a', 'gv', 'Manx');
GO
INSERT INTO "languages" ("id", "uuid", "code", "name") VALUES (56, '1be2cb05-37e5-5c81-b365-5129a63a7a79', 'ha', 'Hausa');
GO
INSERT INTO "languages" ("id", "uuid", "code", "name") VALUES (57, 'dd692d8c-66d1-5169-8df1-ba9b633345d6', 'he', 'Hebrew');
GO
INSERT INTO "languages" ("id", "uuid", "code", "name") VALUES (58, '799f88c1-69ac-5c7e-a1ad-a9f0ed5c7231', 'hi', 'Hindi');
GO
INSERT INTO "languages" ("id", "uuid", "code", "name") VALUES (59, '580e257b-2ede-539a-80ca-b7812fb621d1', 'ho', 'Hiri Motu');
GO
INSERT INTO "languages" ("id", "uuid", "code", "name") VALUES (60, '1017378a-6fd3-5dc4-8b59-f4e4f717ddf6', 'hr', 'Croatian');
GO
INSERT INTO "languages" ("id", "uuid", "code", "name") VALUES (61, '16b6d62c-c1fd-5011-af0f-e465f494e88a', 'ht', 'Haitian Creole');
GO
INSERT INTO "languages" ("id", "uuid", "code", "name") VALUES (62, 'a78289c1-0ed9-5dbc-931c-63c1327e310a', 'hu', 'Hungarian');
GO
INSERT INTO "languages" ("id", "uuid", "code", "name") VALUES (63, 'f2b27b5f-4999-50d5-a1fb-6500067c93df', 'hy', 'Armenian');
GO
INSERT INTO "languages" ("id", "uuid", "code", "name") VALUES (64, '72df619f-12ab-5a59-a280-72c87e16133c', 'hz', 'Herero');
GO
INSERT INTO "languages" ("id", "uuid", "code", "name") VALUES (65, '9e7d1da8-6396-5713-b265-cc8f9636e3b5', 'ia', 'Interlingua');
GO
INSERT INTO "languages" ("id", "uuid", "code", "name") VALUES (66, '074937f2-7864-5200-a13e-bd6e8e6e9bad', 'id', 'Indonesian');
GO
INSERT INTO "languages" ("id", "uuid", "code", "name") VALUES (67, 'ad69002b-56a7-5fd5-88af-9b465a1b4158', 'ie', 'Interlingue');
GO
INSERT INTO "languages" ("id", "uuid", "code", "name") VALUES (68, 'c886ed5f-6b98-54db-a598-8b7f0caa91f2', 'ig', 'Igbo');
GO
INSERT INTO "languages" ("id", "uuid", "code", "name") VALUES (69, 'c0de7c21-5df0-542e-a439-c99948be3a9e', 'ii', 'Sichuan Yi');
GO
INSERT INTO "languages" ("id", "uuid", "code", "name") VALUES (70, '39810f65-6378-59a2-864e-0bf2ab063bae', 'ik', 'Inupiaq');
GO
INSERT INTO "languages" ("id", "uuid", "code", "name") VALUES (71, 'bd83a49d-a94e-52ff-826f-c4a52f844213', 'io', 'Ido');
GO
INSERT INTO "languages" ("id", "uuid", "code", "name") VALUES (72, '61b5a747-bd5b-56d9-84f2-ffe867ef3f2d', 'is', 'Icelandic');
GO
INSERT INTO "languages" ("id", "uuid", "code", "name") VALUES (73, '57a93a16-35b4-5f47-89de-f51746421c41', 'it', 'Italian');
GO
INSERT INTO "languages" ("id", "uuid", "code", "name") VALUES (74, '2af506c5-326e-55e5-aea6-6e008de04557', 'iu', 'Inuktitut');
GO
INSERT INTO "languages" ("id", "uuid", "code", "name") VALUES (75, '1b89d298-410e-5b09-8ac9-0c6a18b0a35f', 'ja', 'Japanese');
GO
INSERT INTO "languages" ("id", "uuid", "code", "name") VALUES (76, '28875465-ef90-57fe-8b22-47747e73f9dc', 'jv', 'Javanese');
GO
INSERT INTO "languages" ("id", "uuid", "code", "name") VALUES (77, 'c2451643-042c-576e-a5de-c6bfebac6c9b', 'ka', 'Georgian');
GO
INSERT INTO "languages" ("id", "uuid", "code", "name") VALUES (78, '81ee890a-866b-5206-928b-2dc897c6bc58', 'kg', 'Kongo');
GO
INSERT INTO "languages" ("id", "uuid", "code", "name") VALUES (79, '066a0ff3-eabe-585a-a9ca-41e52865800b', 'ki', 'Kikuyu');
GO
INSERT INTO "languages" ("id", "uuid", "code", "name") VALUES (80, '4ed590bb-f778-5e5a-8cd2-d61829c0e3bb', 'kj', 'Kuanyama');
GO
INSERT INTO "languages" ("id", "uuid", "code", "name") VALUES (81, '9cb2dab5-4f24-5ef8-9c3c-743cfa89dc16', 'kk', 'Kazakh');
GO
INSERT INTO "languages" ("id", "uuid", "code", "name") VALUES (82, '9a2e1215-826d-5068-9ee0-3eb6787df1ce', 'kl', 'Kalaallisut');
GO
INSERT INTO "languages" ("id", "uuid", "code", "name") VALUES (83, 'a8bd3cce-d81a-5aed-8040-79c922030b62', 'km', 'Khmer');
GO
INSERT INTO "languages" ("id", "uuid", "code", "name") VALUES (84, '9f79600f-b8b3-5058-932c-2926766fca9c', 'kn', 'Kannada');
GO
INSERT INTO "languages" ("id", "uuid", "code", "name") VALUES (85, '9d54a774-2f46-52c0-b9df-cea7fbc90637', 'ko', 'Korean');
GO
INSERT INTO "languages" ("id", "uuid", "code", "name") VALUES (86, '9ab0c76e-c5f4-5916-8aae-b62a79bdd997', 'kr', 'Kanuri');
GO
INSERT INTO "languages" ("id", "uuid", "code", "name") VALUES (87, '5e964470-0acd-581b-94cc-69f1e14707bf', 'ks', 'Kashmiri');
GO
INSERT INTO "languages" ("id", "uuid", "code", "name") VALUES (88, '66d41f93-513b-5519-bb92-f5693516e924', 'ku', 'Kurdish');
GO
INSERT INTO "languages" ("id", "uuid", "code", "name") VALUES (89, 'bdd5028e-8809-5ad6-bf40-09527204f462', 'kv', 'Komi');
GO
INSERT INTO "languages" ("id", "uuid", "code", "name") VALUES (90, '64d18fe2-be3d-5638-bfcd-45fbd08279a1', 'kw', 'Cornish');
GO
INSERT INTO "languages" ("id", "uuid", "code", "name") VALUES (91, 'fead1550-29cd-50a0-94b3-e940fab97818', 'ky', 'Kyrgyz');
GO
INSERT INTO "languages" ("id", "uuid", "code", "name") VALUES (92, 'ea1a5c44-8836-52ad-8f78-a89ff0a01461', 'la', 'Latin');
GO
INSERT INTO "languages" ("id", "uuid", "code", "name") VALUES (93, '7ed113c1-f90b-5e6d-8600-971f5c855219', 'lb', 'Luxembourgish');
GO
INSERT INTO "languages" ("id", "uuid", "code", "name") VALUES (94, 'e8809906-3a60-53d1-ab7d-c8fb561072aa', 'lg', 'Ganda');
GO
INSERT INTO "languages" ("id", "uuid", "code", "name") VALUES (95, 'bf835519-717d-52d0-813a-8338becca115', 'li', 'Limburgish');
GO
INSERT INTO "languages" ("id", "uuid", "code", "name") VALUES (96, 'edfbc8a9-3f36-58f8-b579-7dd474243ad4', 'ln', 'Lingala');
GO
INSERT INTO "languages" ("id", "uuid", "code", "name") VALUES (97, 'ea8dd8f8-4169-51de-8c32-ebe8d387883f', 'lo', 'Lao');
GO
INSERT INTO "languages" ("id", "uuid", "code", "name") VALUES (98, 'f26a6a0b-495f-5f26-b376-404bdbc84083', 'lt', 'Lithuanian');
GO
INSERT INTO "languages" ("id", "uuid", "code", "name") VALUES (99, '913f171e-e037-5224-b16a-4e3da89b4c9d', 'lu', 'Luba-Katanga');
GO
INSERT INTO "languages" ("id", "uuid", "code", "name") VALUES (100, '84e29d8d-c53e-520d-b4b7-4789a830bfc7', 'lv', 'Latvian');
GO
INSERT INTO "languages" ("id", "uuid", "code", "name") VALUES (101, 'af362851-7d7e-5479-8fa4-53cf9bc604f2', 'mg', 'Malagasy');
GO
INSERT INTO "languages" ("id", "uuid", "code", "name") VALUES (102, '5fe25cda-0f07-5176-8ec6-b06e0354b6c6', 'mh', 'Marshallese');
GO
INSERT INTO "languages" ("id", "uuid", "code", "name") VALUES (103, '18bba415-5701-59f5-beea-c1a2ca327a46', 'mi', 'Maori');
GO
INSERT INTO "languages" ("id", "uuid", "code", "name") VALUES (104, '273a6d08-a5a1-5744-add9-9e0b78cd3899', 'mk', 'Macedonian');
GO
INSERT INTO "languages" ("id", "uuid", "code", "name") VALUES (105, 'df61afbe-ea4a-5cd2-b9ff-c2a89f52c8e1', 'ml', 'Malayalam');
GO
INSERT INTO "languages" ("id", "uuid", "code", "name") VALUES (106, 'cb0621ca-580d-551a-9a66-a1ce277e9f7d', 'mn', 'Mongolian');
GO
INSERT INTO "languages" ("id", "uuid", "code", "name") VALUES (107, 'aafc5127-8e04-551d-88ef-80beb44b7d74', 'mr', 'Marathi');
GO
INSERT INTO "languages" ("id", "uuid", "code", "name") VALUES (108, 'd6c66abb-f79c-5be7-9e8e-bd42f5f7ddf1', 'ms', 'Malay');
GO
INSERT INTO "languages" ("id", "uuid", "code", "name") VALUES (109, '59026eef-5bad-5a34-b932-1a8afa97c300', 'mt', 'Maltese');
GO
INSERT INTO "languages" ("id", "uuid", "code", "name") VALUES (110, '62a7ce45-f495-5bf5-8130-8c29959d797e', 'my', 'Burmese');
GO
INSERT INTO "languages" ("id", "uuid", "code", "name") VALUES (111, 'a5b870c4-1f2c-5241-a629-c3255266c101', 'na', 'Nauru');
GO
INSERT INTO "languages" ("id", "uuid", "code", "name") VALUES (112, '2ed7b96c-c7a4-52ea-8ee1-5533f47eb953', 'nb', 'Norwegian Bokmål');
GO
INSERT INTO "languages" ("id", "uuid", "code", "name") VALUES (113, 'a4a6e681-e56c-5197-9b03-988c9f56280a', 'nd', 'North Ndebele');
GO
INSERT INTO "languages" ("id", "uuid", "code", "name") VALUES (114, '7b14c100-4ba4-5075-af31-7c213657cc00', 'ne', 'Nepali');
GO
INSERT INTO "languages" ("id", "uuid", "code", "name") VALUES (115, 'b8c6a9a9-4ab1-542d-a3cc-c8512c776bd8', 'ng', 'Ndonga');
GO
INSERT INTO "languages" ("id", "uuid", "code", "name") VALUES (116, 'e4b27e57-bea5-585f-8d0a-97cc5091e531', 'nl', 'Dutch');
GO
INSERT INTO "languages" ("id", "uuid", "code", "name") VALUES (117, 'b7395360-8dfd-5ba6-beee-6a19413bcc40', 'nn', 'Norwegian Nynorsk');
GO
INSERT INTO "languages" ("id", "uuid", "code", "name") VALUES (118, '18c28a9e-cb4c-5482-bb43-c2f0c8642d53', 'no', 'Norwegian');
GO
INSERT INTO "languages" ("id", "uuid", "code", "name") VALUES (119, '09905f3a-132e-50cb-bb06-cc3b42c13db0', 'nr', 'South Ndebele');
GO
INSERT INTO "languages" ("id", "uuid", "code", "name") VALUES (120, 'ee45ad31-3656-58f9-b36d-86883d4c2ec8', 'nv', 'Navajo');
GO
INSERT INTO "languages" ("id", "uuid", "code", "name") VALUES (121, '91ee1455-d114-5d66-8eec-dc4576bee734', 'ny', 'Chichewa');
GO
INSERT INTO "languages" ("id", "uuid", "code", "name") VALUES (122, 'a9dc9f56-67b5-5e63-a8e6-52cae883167f', 'oc', 'Occitan');
GO
INSERT INTO "languages" ("id", "uuid", "code", "name") VALUES (123, '557224f8-6dcb-55f1-a8dd-a1ae5813b24c', 'oj', 'Ojibwa');
GO
INSERT INTO "languages" ("id", "uuid", "code", "name") VALUES (124, '8777330b-57b1-577f-b519-d77d29959213', 'om', 'Oromo');
GO
INSERT INTO "languages" ("id", "uuid", "code", "name") VALUES (125, '120cf292-92bf-51f7-b995-a0c82c7593c1', 'or', 'Odia');
GO
INSERT INTO "languages" ("id", "uuid", "code", "name") VALUES (126, '8540fd09-515e-5004-888d-e972e2a64023', 'os', 'Ossetian');
GO
INSERT INTO "languages" ("id", "uuid", "code", "name") VALUES (127, 'ef7caf82-239e-56ff-ba65-6b00d02ac30a', 'pa', 'Punjabi');
GO
INSERT INTO "languages" ("id", "uuid", "code", "name") VALUES (128, 'fa61ffae-f4d1-57b3-b8ba-96521421ef98', 'pi', 'Pali');
GO
INSERT INTO "languages" ("id", "uuid", "code", "name") VALUES (129, 'bc571ef9-50b6-5df4-9cb7-f947dd4a442f', 'pl', 'Polish');
GO
INSERT INTO "languages" ("id", "uuid", "code", "name") VALUES (130, '8610dc50-7831-52bc-83a2-c33638d9bade', 'ps', 'Pashto');
GO
INSERT INTO "languages" ("id", "uuid", "code", "name") VALUES (131, '233221ff-95f9-5679-8bb3-804fade8bf07', 'pt', 'Portuguese');
GO
INSERT INTO "languages" ("id", "uuid", "code", "name") VALUES (132, '896396ec-7a37-5fae-b251-886e8a691a9e', 'qu', 'Quechua');
GO
INSERT INTO "languages" ("id", "uuid", "code", "name") VALUES (133, '1ce321d1-84d1-58d2-a476-4c60ebf645d1', 'rm', 'Romansh');
GO
INSERT INTO "languages" ("id", "uuid", "code", "name") VALUES (134, 'fa71820a-dc6f-5694-a285-000c189ca295', 'rn', 'Kirundi');
GO
INSERT INTO "languages" ("id", "uuid", "code", "name") VALUES (135, '62fb5d9f-1be7-5e57-9031-25fd0e1fdf3f', 'ro', 'Romanian');
GO
INSERT INTO "languages" ("id", "uuid", "code", "name") VALUES (136, '8cb4f509-2da6-57a7-8d59-0d135ef45b32', 'ru', 'Russian');
GO
INSERT INTO "languages" ("id", "uuid", "code", "name") VALUES (137, '5c51652a-ca12-57f5-b8ef-b2c85285b111', 'rw', 'Kinyarwanda');
GO
INSERT INTO "languages" ("id", "uuid", "code", "name") VALUES (138, 'a6e22fee-05cd-5311-a599-095034e3c927', 'sa', 'Sanskrit');
GO
INSERT INTO "languages" ("id", "uuid", "code", "name") VALUES (139, 'acfb6a5f-a9f7-53f6-8c46-07e35d78b406', 'sc', 'Sardinian');
GO
INSERT INTO "languages" ("id", "uuid", "code", "name") VALUES (140, 'd5a4f34b-91bc-5149-a19d-953b852cc0f0', 'sd', 'Sindhi');
GO
INSERT INTO "languages" ("id", "uuid", "code", "name") VALUES (141, '68bbd682-306c-5ee5-a6f0-62ceb109c4e8', 'se', 'Northern Sami');
GO
INSERT INTO "languages" ("id", "uuid", "code", "name") VALUES (142, '8254e45e-7522-525d-8ce2-fb38f024ab72', 'sg', 'Sango');
GO
INSERT INTO "languages" ("id", "uuid", "code", "name") VALUES (143, 'ecb71c18-ee43-554a-b4da-be9a00f35114', 'si', 'Sinhala');
GO
INSERT INTO "languages" ("id", "uuid", "code", "name") VALUES (144, '4638730c-fcfa-5e4a-9789-d7d148957908', 'sk', 'Slovak');
GO
INSERT INTO "languages" ("id", "uuid", "code", "name") VALUES (145, 'cc7dbf2d-f061-557d-ab4d-8a4ea47d3aff', 'sl', 'Slovenian');
GO
INSERT INTO "languages" ("id", "uuid", "code", "name") VALUES (146, '3dc053fa-5a83-5e57-8f36-c28cea466dc3', 'sm', 'Samoan');
GO
INSERT INTO "languages" ("id", "uuid", "code", "name") VALUES (147, 'eb611595-fda2-5769-99a8-2b8faffb6edf', 'sn', 'Shona');
GO
INSERT INTO "languages" ("id", "uuid", "code", "name") VALUES (148, '1419a4b4-bfd3-59dc-951c-7a520f848694', 'so', 'Somali');
GO
INSERT INTO "languages" ("id", "uuid", "code", "name") VALUES (149, '1c833834-5dd6-59ed-a897-8648f2103faf', 'sq', 'Albanian');
GO
INSERT INTO "languages" ("id", "uuid", "code", "name") VALUES (150, '8be529fc-4ef7-5178-a8a6-513634bd76f6', 'sr', 'Serbian');
GO
INSERT INTO "languages" ("id", "uuid", "code", "name") VALUES (151, '3caae47b-b4ec-5a66-b0f5-7cb00cb690ce', 'ss', 'Swati');
GO
INSERT INTO "languages" ("id", "uuid", "code", "name") VALUES (152, '61a0fbc5-b6b4-58c9-a04f-5187e35a619d', 'st', 'Southern Sotho');
GO
INSERT INTO "languages" ("id", "uuid", "code", "name") VALUES (153, '64ddd7b1-a3aa-55de-9c82-10b12f6c33b0', 'su', 'Sundanese');
GO
INSERT INTO "languages" ("id", "uuid", "code", "name") VALUES (154, 'dfd15477-8b02-567d-bfc7-70bb958f2d5d', 'sv', 'Swedish');
GO
INSERT INTO "languages" ("id", "uuid", "code", "name") VALUES (155, '4e88304b-0704-55ce-85d0-0590600a2f95', 'sw', 'Swahili');
GO
INSERT INTO "languages" ("id", "uuid", "code", "name") VALUES (156, 'd127dc8a-a047-5e7e-89c0-6950fc78c93e', 'ta', 'Tamil');
GO
INSERT INTO "languages" ("id", "uuid", "code", "name") VALUES (157, '71c0bfdb-e0d8-5e63-b4f0-8b12529f6a2f', 'te', 'Telugu');
GO
INSERT INTO "languages" ("id", "uuid", "code", "name") VALUES (158, '6e42abf7-1dff-55b5-8d8a-c74bfb489d1c', 'tg', 'Tajik');
GO
INSERT INTO "languages" ("id", "uuid", "code", "name") VALUES (159, 'e21b94f1-da2e-5c68-81e6-bbada0ffd171', 'th', 'Thai');
GO
INSERT INTO "languages" ("id", "uuid", "code", "name") VALUES (160, 'ce14e880-2211-5cc9-803f-a12a6b6b5fa1', 'ti', 'Tigrinya');
GO
INSERT INTO "languages" ("id", "uuid", "code", "name") VALUES (161, '125dc634-9faa-5530-972d-15cfe8cfd2de', 'tk', 'Turkmen');
GO
INSERT INTO "languages" ("id", "uuid", "code", "name") VALUES (162, '0cda9d4d-ade6-5ac3-a5b5-53c7299cac06', 'tl', 'Tagalog');
GO
INSERT INTO "languages" ("id", "uuid", "code", "name") VALUES (163, 'df4c93a9-14d6-5bae-b314-7f9e7ff678d4', 'tn', 'Tswana');
GO
INSERT INTO "languages" ("id", "uuid", "code", "name") VALUES (164, '0179ec1c-363f-5ab8-9165-cdea9427c819', 'to', 'Tonga');
GO
INSERT INTO "languages" ("id", "uuid", "code", "name") VALUES (165, 'd4eb1174-e426-59bb-8e80-21e74e4409ee', 'tr', 'Turkish');
GO
INSERT INTO "languages" ("id", "uuid", "code", "name") VALUES (166, 'a490a111-3917-5187-9a69-c055ee8ce553', 'ts', 'Tsonga');
GO
INSERT INTO "languages" ("id", "uuid", "code", "name") VALUES (167, 'c1fd33c1-0b0c-5dfb-aac3-6a6d5b7f640d', 'tt', 'Tatar');
GO
INSERT INTO "languages" ("id", "uuid", "code", "name") VALUES (168, '0b6ff768-6843-5088-aff9-42b7342cdf2d', 'tw', 'Twi');
GO
INSERT INTO "languages" ("id", "uuid", "code", "name") VALUES (169, '2f8a9b43-00e1-52b1-a245-4fd1d6eb3d4a', 'ty', 'Tahitian');
GO
INSERT INTO "languages" ("id", "uuid", "code", "name") VALUES (170, 'c873075a-79b5-5d4a-9894-e644d629b0cb', 'ug', 'Uyghur');
GO
INSERT INTO "languages" ("id", "uuid", "code", "name") VALUES (171, '17a3fec2-a0b0-5539-b946-a990b20a94c7', 'uk', 'Ukrainian');
GO
INSERT INTO "languages" ("id", "uuid", "code", "name") VALUES (172, '633b5f0c-4041-5e25-9d18-b4b38bd75908', 'ur', 'Urdu');
GO
INSERT INTO "languages" ("id", "uuid", "code", "name") VALUES (173, '6f74afcb-ebfd-51f5-887c-94c7240578ae', 'uz', 'Uzbek');
GO
INSERT INTO "languages" ("id", "uuid", "code", "name") VALUES (174, '7f4bab8b-3c79-5386-b6e4-ecfd3b1b72e8', 've', 'Venda');
GO
INSERT INTO "languages" ("id", "uuid", "code", "name") VALUES (175, 'f2082521-8798-50bd-8ab7-04d9f856e731', 'vi', 'Vietnamese');
GO
INSERT INTO "languages" ("id", "uuid", "code", "name") VALUES (176, '3f60e6b9-1a2b-5bf9-bcab-e88babf33a89', 'vo', 'Volapük');
GO
INSERT INTO "languages" ("id", "uuid", "code", "name") VALUES (177, 'e95c3123-7869-59b4-adb7-3347ca755720', 'wa', 'Walloon');
GO
INSERT INTO "languages" ("id", "uuid", "code", "name") VALUES (178, '5d064426-1e15-56da-8082-704882e28937', 'wo', 'Wolof');
GO
INSERT INTO "languages" ("id", "uuid", "code", "name") VALUES (179, '15f282af-1a27-5765-9334-1af2dab119f6', 'xh', 'Xhosa');
GO
INSERT INTO "languages" ("id", "uuid", "code", "name") VALUES (180, '078e2a4a-c205-5786-a1ff-dc7d266e2b3e', 'yi', 'Yiddish');
GO
INSERT INTO "languages" ("id", "uuid", "code", "name") VALUES (181, 'd449527d-d2c4-598d-bd2c-43d75c8d7bca', 'yo', 'Yoruba');
GO
INSERT INTO "languages" ("id", "uuid", "code", "name") VALUES (182, 'f24b2d44-6d61-5cba-8d4c-831e012828c9', 'za', 'Zhuang');
GO
INSERT INTO "languages" ("id", "uuid", "code", "name") VALUES (183, 'b089f4d9-37fa-5b8e-a03b-a2e5ff02492a', 'zh', 'Chinese');
GO
INSERT INTO "languages" ("id", "uuid", "code", "name") VALUES (184, 'd9b92130-6142-5315-b634-81dfc92b8fce', 'zu', 'Zulu');
GO
-- Seeds: mime_types
GO
INSERT INTO "mime_types" ("id", "uuid", "name", "description") VALUES (1, 'c314036d-1636-599c-8f07-873b287dfaf8', 'text/plain', 'Plain text');
GO
INSERT INTO "mime_types" ("id", "uuid", "name", "description") VALUES (2, 'a2d56a1d-e6a9-5f75-a8f9-f561ec9f1c1e', 'text/html', 'HTML document');
GO
INSERT INTO "mime_types" ("id", "uuid", "name", "description") VALUES (3, 'eff17426-2427-58c4-a20b-9161f71f3318', 'text/css', 'Cascading Style Sheets');
GO
INSERT INTO "mime_types" ("id", "uuid", "name", "description") VALUES (4, '6f44322f-e2d0-52d6-bd95-a65fccaa4eac', 'text/csv', 'Comma-separated values');
GO
INSERT INTO "mime_types" ("id", "uuid", "name", "description") VALUES (5, '2e7c1c3a-760a-5cb5-bd6d-727222793ea2', 'text/markdown', 'Markdown document');
GO
INSERT INTO "mime_types" ("id", "uuid", "name", "description") VALUES (6, 'b020a6fc-91c2-5201-b826-aa230bd31583', 'text/javascript', 'JavaScript');
GO
INSERT INTO "mime_types" ("id", "uuid", "name", "description") VALUES (7, '40bd465e-0bf4-5c79-8134-2ca7e7c92068', 'text/calendar', 'iCalendar');
GO
INSERT INTO "mime_types" ("id", "uuid", "name", "description") VALUES (8, '6fc1eb1b-2946-5cc1-9926-53def72bb068', 'text/xml', 'XML (text)');
GO
INSERT INTO "mime_types" ("id", "uuid", "name", "description") VALUES (9, '26df0145-760a-5c51-9264-b029e825c359', 'application/json', 'JSON');
GO
INSERT INTO "mime_types" ("id", "uuid", "name", "description") VALUES (10, '688f7089-bad3-5e42-aa40-4eac057cd163', 'application/xml', 'XML');
GO
INSERT INTO "mime_types" ("id", "uuid", "name", "description") VALUES (11, 'd8e3a307-19bb-5daf-a240-2971745bd709', 'application/pdf', 'Adobe PDF document');
GO
INSERT INTO "mime_types" ("id", "uuid", "name", "description") VALUES (12, 'e544b14e-e5e2-558d-bdae-d29ccd2dc08c', 'application/zip', 'ZIP archive');
GO
INSERT INTO "mime_types" ("id", "uuid", "name", "description") VALUES (13, 'dd5af9fc-5ef5-5681-a333-aa98d8c4b293', 'application/gzip', 'GZip archive');
GO
INSERT INTO "mime_types" ("id", "uuid", "name", "description") VALUES (14, '270f2e24-9bc8-56a7-8dcf-d597c676d2ae', 'application/x-tar', 'Tape archive (tar)');
GO
INSERT INTO "mime_types" ("id", "uuid", "name", "description") VALUES (15, '968dadca-46a2-55e6-ac77-4b554743474d', 'application/x-7z-compressed', '7-Zip archive');
GO
INSERT INTO "mime_types" ("id", "uuid", "name", "description") VALUES (16, 'b8a266ef-7c5a-56c9-a754-19cd543f56e0', 'application/x-rar-compressed', 'RAR archive');
GO
INSERT INTO "mime_types" ("id", "uuid", "name", "description") VALUES (17, 'a78bd65e-83c2-5093-8d8b-e5ef9b671b01', 'application/octet-stream', 'Arbitrary binary data');
GO
INSERT INTO "mime_types" ("id", "uuid", "name", "description") VALUES (18, 'cd6eee64-ae2d-5187-997d-a73bd20e61c2', 'application/javascript', 'JavaScript');
GO
INSERT INTO "mime_types" ("id", "uuid", "name", "description") VALUES (19, 'dad44d80-0812-50ee-ae2c-2b9e035ce0b6', 'application/x-www-form-urlencoded', 'URL-encoded form data');
GO
INSERT INTO "mime_types" ("id", "uuid", "name", "description") VALUES (20, '9fad4d69-b6c1-52c5-9ba0-c24fa2624ca8', 'application/yaml', 'YAML');
GO
INSERT INTO "mime_types" ("id", "uuid", "name", "description") VALUES (21, '0dccdd96-8da6-5d7b-9d46-6642948cc4b7', 'application/sql', 'SQL');
GO
INSERT INTO "mime_types" ("id", "uuid", "name", "description") VALUES (22, 'a8e2777d-21d8-5969-9f10-cce3eb5df587', 'application/rtf', 'Rich Text Format');
GO
INSERT INTO "mime_types" ("id", "uuid", "name", "description") VALUES (23, '9abba6b8-3582-5efc-be74-4125f283d7d7', 'application/msword', 'Microsoft Word (.doc)');
GO
INSERT INTO "mime_types" ("id", "uuid", "name", "description") VALUES (24, 'bbb21ad8-bf70-5e13-91aa-e322f750a854', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'Microsoft Word (.docx)');
GO
INSERT INTO "mime_types" ("id", "uuid", "name", "description") VALUES (25, '3b8c0d22-f538-544a-b4ce-413efa011ff2', 'application/vnd.ms-excel', 'Microsoft Excel (.xls)');
GO
INSERT INTO "mime_types" ("id", "uuid", "name", "description") VALUES (26, '0d3c9367-795c-52cc-a47a-f362165097e3', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'Microsoft Excel (.xlsx)');
GO
INSERT INTO "mime_types" ("id", "uuid", "name", "description") VALUES (27, '3e898c1e-3e24-5e58-b6c2-146cbda9c09c', 'application/vnd.ms-powerpoint', 'Microsoft PowerPoint (.ppt)');
GO
INSERT INTO "mime_types" ("id", "uuid", "name", "description") VALUES (28, '48c6edfb-2d65-5151-9059-a97a53a78664', 'application/vnd.openxmlformats-officedocument.presentationml.presentation', 'Microsoft PowerPoint (.pptx)');
GO
INSERT INTO "mime_types" ("id", "uuid", "name", "description") VALUES (29, '9073ed4a-5368-5ca7-8132-01e1145e78d5', 'application/vnd.oasis.opendocument.text', 'OpenDocument text');
GO
INSERT INTO "mime_types" ("id", "uuid", "name", "description") VALUES (30, 'b7cca9d2-cdd3-5baa-8719-72fcd3ec7afc', 'application/vnd.oasis.opendocument.spreadsheet', 'OpenDocument spreadsheet');
GO
INSERT INTO "mime_types" ("id", "uuid", "name", "description") VALUES (31, '0148db5e-c81a-5615-adfb-9b7b67f37a0d', 'application/wasm', 'WebAssembly');
GO
INSERT INTO "mime_types" ("id", "uuid", "name", "description") VALUES (32, 'be65518c-1f0a-50bb-8f22-43da72edb01b', 'image/jpeg', 'JPEG image');
GO
INSERT INTO "mime_types" ("id", "uuid", "name", "description") VALUES (33, 'fab62806-2bc1-5dfb-b84f-3182042fbf00', 'image/png', 'PNG image');
GO
INSERT INTO "mime_types" ("id", "uuid", "name", "description") VALUES (34, '1562a470-e867-5721-b81c-cc9cd82ef940', 'image/gif', 'GIF image');
GO
INSERT INTO "mime_types" ("id", "uuid", "name", "description") VALUES (35, 'fbc1747b-f259-5e42-ac96-971b45786c76', 'image/webp', 'WebP image');
GO
INSERT INTO "mime_types" ("id", "uuid", "name", "description") VALUES (36, '974a5247-d5ef-51aa-b1b7-dfefa01ae2c1', 'image/svg+xml', 'SVG image');
GO
INSERT INTO "mime_types" ("id", "uuid", "name", "description") VALUES (37, 'fb647af9-b1c5-57bd-a2ea-cba9ee76b9aa', 'image/bmp', 'Bitmap image');
GO
INSERT INTO "mime_types" ("id", "uuid", "name", "description") VALUES (38, '9f6a882e-1cc2-519f-b704-05565ed047ac', 'image/tiff', 'TIFF image');
GO
INSERT INTO "mime_types" ("id", "uuid", "name", "description") VALUES (39, 'b0749282-ea19-59b0-8eef-96683832ec7a', 'image/x-icon', 'Icon image');
GO
INSERT INTO "mime_types" ("id", "uuid", "name", "description") VALUES (40, '53be37ed-8b02-5d97-ae86-0cf071639288', 'image/avif', 'AVIF image');
GO
INSERT INTO "mime_types" ("id", "uuid", "name", "description") VALUES (41, '8bf77392-4627-5928-9e4f-c7537064a618', 'audio/mpeg', 'MP3 audio');
GO
INSERT INTO "mime_types" ("id", "uuid", "name", "description") VALUES (42, 'ef25cb4f-02f6-5901-a09f-7c099f89f1b5', 'audio/ogg', 'Ogg audio');
GO
INSERT INTO "mime_types" ("id", "uuid", "name", "description") VALUES (43, '9942c2d6-5dee-5837-9922-f94d0a5e9083', 'audio/wav', 'WAV audio');
GO
INSERT INTO "mime_types" ("id", "uuid", "name", "description") VALUES (44, '81a9751d-2a08-586a-9efe-3ebadc61faee', 'audio/webm', 'WebM audio');
GO
INSERT INTO "mime_types" ("id", "uuid", "name", "description") VALUES (45, '24be6b58-a801-5b67-8ae4-221ba95218b5', 'audio/aac', 'AAC audio');
GO
INSERT INTO "mime_types" ("id", "uuid", "name", "description") VALUES (46, 'c35fa815-9810-556d-a409-fa6be290732e', 'audio/flac', 'FLAC audio');
GO
INSERT INTO "mime_types" ("id", "uuid", "name", "description") VALUES (47, 'd74a455f-c8d1-5506-a78c-dd1b5c16c6ee', 'video/mp4', 'MP4 video');
GO
INSERT INTO "mime_types" ("id", "uuid", "name", "description") VALUES (48, 'adbb7e18-8861-56a2-b4e4-a94126b444a5', 'video/mpeg', 'MPEG video');
GO
INSERT INTO "mime_types" ("id", "uuid", "name", "description") VALUES (49, '206c181c-dcbe-5573-9c71-22e8b03693dd', 'video/ogg', 'Ogg video');
GO
INSERT INTO "mime_types" ("id", "uuid", "name", "description") VALUES (50, 'a2a36e34-7180-5a6b-8b5d-49930b40ce92', 'video/webm', 'WebM video');
GO
INSERT INTO "mime_types" ("id", "uuid", "name", "description") VALUES (51, '4c2b4eeb-f34a-5bdd-b7ef-38f7006595ee', 'video/quicktime', 'QuickTime video');
GO
INSERT INTO "mime_types" ("id", "uuid", "name", "description") VALUES (52, 'b0e0d96e-b80e-54ac-80f1-d9130c1a53c6', 'video/x-msvideo', 'AVI video');
GO
INSERT INTO "mime_types" ("id", "uuid", "name", "description") VALUES (53, 'db703a8a-a881-596e-abd6-5eef447db7b1', 'font/woff', 'Web Open Font Format');
GO
INSERT INTO "mime_types" ("id", "uuid", "name", "description") VALUES (54, 'a24f44b7-b6e2-5954-bd4e-36f1c35027af', 'font/woff2', 'Web Open Font Format 2');
GO
INSERT INTO "mime_types" ("id", "uuid", "name", "description") VALUES (55, 'cf4dcb66-76ee-5b92-a8dc-9fd853452303', 'font/ttf', 'TrueType font');
GO
INSERT INTO "mime_types" ("id", "uuid", "name", "description") VALUES (56, 'e41fdd8d-b4de-5114-b7bf-af1da0d12fd0', 'font/otf', 'OpenType font');
GO
INSERT INTO "mime_types" ("id", "uuid", "name", "description") VALUES (57, 'c6e1daa8-d09a-5bd9-815b-bc8c82e57c52', 'multipart/form-data', 'Multipart form data');
GO
-- Seeds: template_types
GO
INSERT INTO "template_types" ("id", "uuid", "name", "description") VALUES (1, '88ba1ed1-69f1-54cf-9b1f-0273aaa19012', 'jigsaw', 'Jigsaw template settings');
GO
INSERT INTO "template_types" ("id", "uuid", "name", "description") VALUES (2, '43a56bfd-aeb1-572e-bc9e-018e6683d1d4', 'confirm_email', 'Email sent to confirm an address; content is JSON with subject, text and html using {{username}} and {{confirm_url}}');
GO
-- Seeds: log_types
GO
INSERT INTO "log_types" ("id", "uuid", "name", "description") VALUES (1, '9dc1e5ea-d634-5435-8f1e-7c58310febd5', 'Error', 'Something failed');
GO
INSERT INTO "log_types" ("id", "uuid", "name", "description") VALUES (2, '12ea9485-c369-5713-b623-9b89abdb72e3', 'Information', 'A normal event worth recording');
GO
INSERT INTO "log_types" ("id", "uuid", "name", "description") VALUES (3, '16a659b1-a267-5c63-8056-f8f683f0c8dd', 'Verbose', 'Detailed information for troubleshooting');
GO
INSERT INTO "log_types" ("id", "uuid", "name", "description") VALUES (4, 'f947062f-9593-5e29-98e4-e6b57a1d84a1', 'Trace', 'Step-by-step tracing of a code path');
GO
-- Seeds: oauth_grant_types
GO
INSERT INTO "oauth_grant_types" ("id", "uuid", "name", "description") VALUES (1, '28ac257b-2eb0-544f-ad7a-059baa8a0022', 'authorization_code', 'The Authorization Code grant type lets confidential and public clients exchange an authorization code for an access token after the user is redirected back to the client.');
GO
INSERT INTO "oauth_grant_types" ("id", "uuid", "name", "description") VALUES (2, '87dcd7de-44c1-5a22-8842-b102df36e651', 'refresh_token', 'The Refresh Token grant type lets clients exchange a refresh token for a new access token once the original has expired, allowing them to maintain valid access without requiring further user interaction.');
GO
INSERT INTO "oauth_grant_types" ("id", "uuid", "name", "description") VALUES (3, '202c534d-968d-58b1-a5e3-40a0ccfd0100', 'urn:ietf:params:oauth:grant-type:device_code', 'The Device Code grant type enables browserless or input-constrained devices to exchange a previously obtained device code for an access token.');
GO
INSERT INTO "oauth_grant_types" ("id", "uuid", "name", "description") VALUES (4, '9ede56b9-bf7e-582f-acf4-4e72d91fe9cd', 'client_credentials', 'To authenticate this request, the client can either include client_id and client_secret as additional request parameters, or pass them via the HTTP Basic auth header.');
GO
INSERT INTO "oauth_grant_types" ("id", "uuid", "name", "description", "is_legacy") VALUES (5, '88ea1e58-c478-53a1-b7ad-2992705a254c', 'implicit', 'The Implicit flow was a simplified OAuth flow previously recommended for native and JavaScript apps that returned an access token immediately, bypassing the authorization code exchange step.', 1);
GO
INSERT INTO "oauth_grant_types" ("id", "uuid", "name", "description", "is_legacy") VALUES (6, '21f39a2d-5223-53fe-9133-aff10c0feb20', 'password', 'The Password grant type is a legacy method for exchanging a user''s credentials directly for an access token. Since this requires the client to collect and transmit the user''s password to the authorization server, it is no longer recommended.', 1);
GO
-- Seeds: secret_types
GO
INSERT INTO "secret_types" ("id", "uuid", "name") VALUES (1, '8848a159-86a5-519f-8289-e7493c905cc1', 'password_argon2id');
GO
INSERT INTO "secret_types" ("id", "uuid", "name") VALUES (2, 'bb4eb707-a148-5a99-bcd3-0e978f80bc23', 'password_bcrypt');
GO
INSERT INTO "secret_types" ("id", "uuid", "name") VALUES (3, 'c475da12-370e-5cef-bf85-e513866bb62a', 'pin_argon2id');
GO
INSERT INTO "secret_types" ("id", "uuid", "name") VALUES (4, '2c0035c5-3510-5c56-87a8-689a0326e356', 'pin_bcrypt');
GO
-- Seeds: token_types
GO
INSERT INTO "token_types" ("id", "uuid", "name", "description") VALUES (1, '8b7ad845-911a-5d50-b42c-2c7462c2ad59', 'text', 'Opaque text token');
GO
INSERT INTO "token_types" ("id", "uuid", "name", "description") VALUES (2, '75a005dc-5ddb-51e2-8bcc-3000f324d2ef', 'guid', 'GUID token');
GO
INSERT INTO "token_types" ("id", "uuid", "name", "description") VALUES (3, 'aca707e1-3734-5144-9672-81729882b595', 'jwt_access_token', 'Short-lived JWT access token');
GO
INSERT INTO "token_types" ("id", "uuid", "name", "description") VALUES (4, 'cd47f747-f368-5287-881a-8d7a030984f0', 'jwt_refresh_token', 'Long-lived JWT refresh token');
GO
INSERT INTO "token_types" ("id", "uuid", "name", "description") VALUES (5, '0ee8e7da-925d-5595-b865-77c620798be9', 'signin_token', 'Single-use signin token exchanged for access and refresh tokens');
GO
INSERT INTO "token_types" ("id", "uuid", "name", "description") VALUES (6, '261afadc-f047-5793-aca9-f1a1d97df437', 'email_confirmation', 'Short-lived single-use code emailed to confirm an email address');
GO
-- Seeds: identity_provider_types
GO
INSERT INTO "identity_provider_types" ("id", "uuid", "name", "description") VALUES (1, '98c8fb88-c868-5b82-ab5c-719f5220c55b', 'oidc', 'OpenID Connect provider (Google, Apple, Microsoft); identity comes from the id_token');
GO
INSERT INTO "identity_provider_types" ("id", "uuid", "name", "description") VALUES (2, '3f1582a8-db5c-5103-89fe-95d3bc7a1ed9', 'oauth2', 'Plain OAuth 2.0 provider (Facebook, GitHub); identity comes from the userinfo endpoint');
GO
-- Seeds: identity_provider_linked_user_field_types
GO
INSERT INTO "identity_provider_linked_user_field_types" ("id", "uuid", "name") VALUES (1, '0f4dcbc7-2eca-5ace-8e81-df63f50c6685', 'subject');
GO
INSERT INTO "identity_provider_linked_user_field_types" ("id", "uuid", "name") VALUES (2, '06f33c03-9290-58f9-b11d-f570adce6d2f', 'email');
GO
INSERT INTO "identity_provider_linked_user_field_types" ("id", "uuid", "name") VALUES (3, 'b63ee1b1-6192-5e26-b3cc-a239c392daf7', 'email_verified');
GO
INSERT INTO "identity_provider_linked_user_field_types" ("id", "uuid", "name") VALUES (4, 'e9f9739b-5551-5ee4-9d91-a9daa1182df5', 'first_name');
GO
INSERT INTO "identity_provider_linked_user_field_types" ("id", "uuid", "name") VALUES (5, 'f1a00e4b-ca94-5aef-86d8-854826d0592d', 'last_name');
GO
INSERT INTO "identity_provider_linked_user_field_types" ("id", "uuid", "name") VALUES (6, '85375f6d-a5d7-5f6c-aa9e-076dd7a592f1', 'avatar_url');
GO
-- Seeds: session_types
GO
INSERT INTO "session_types" ("id", "uuid", "name") VALUES (1, 'c188cb23-ccea-5a69-b437-43e991dd8230', 'Signin');
GO
INSERT INTO "session_types" ("id", "uuid", "name") VALUES (2, '58e7aafa-edc0-5f83-8255-9807e133a93a', 'LocalApplication');
