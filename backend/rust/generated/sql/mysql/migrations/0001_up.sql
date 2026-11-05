-- Generated migration for mysql
CREATE TABLE users (id BIGINT AUTO_INCREMENT NOT NULL, uuid CHAR(36) DEFAULT (UUID()) NOT NULL, created DATETIME(3) DEFAULT (UTC_TIMESTAMP(3)) NOT NULL, updated DATETIME(3) DEFAULT (UTC_TIMESTAMP(3)) NOT NULL, version BLOB DEFAULT (X'00') NOT NULL, username TEXT NOT NULL, is_enabled TINYINT(1) DEFAULT 1 NOT NULL, CONSTRAINT users_primary_key PRIMARY KEY (id), CONSTRAINT users_uuid_unique_constraint UNIQUE (uuid));
GO
CREATE TRIGGER trg_users_updated_at BEFORE UPDATE ON users
FOR EACH ROW SET NEW.updated = (UTC_TIMESTAMP(3));
GO
CREATE TABLE roles (id BIGINT AUTO_INCREMENT NOT NULL, uuid CHAR(36) DEFAULT (UUID()) NOT NULL, created DATETIME(3) DEFAULT (UTC_TIMESTAMP(3)) NOT NULL, updated DATETIME(3) DEFAULT (UTC_TIMESTAMP(3)) NOT NULL, version BLOB DEFAULT (X'00') NOT NULL, name TEXT NOT NULL, description TEXT DEFAULT ('') NOT NULL, is_enabled TINYINT(1) DEFAULT 1 NOT NULL, CONSTRAINT roles_primary_key PRIMARY KEY (id), CONSTRAINT roles_uuid_unique_constraint UNIQUE (uuid));
GO
CREATE TRIGGER trg_roles_updated_at BEFORE UPDATE ON roles
FOR EACH ROW SET NEW.updated = (UTC_TIMESTAMP(3));
GO
CREATE TABLE `groups` (id BIGINT AUTO_INCREMENT NOT NULL, uuid CHAR(36) DEFAULT (UUID()) NOT NULL, created DATETIME(3) DEFAULT (UTC_TIMESTAMP(3)) NOT NULL, updated DATETIME(3) DEFAULT (UTC_TIMESTAMP(3)) NOT NULL, version BLOB DEFAULT (X'00') NOT NULL, name TEXT NOT NULL, description TEXT DEFAULT ('') NOT NULL, is_enabled TINYINT(1) DEFAULT 1 NOT NULL, CONSTRAINT groups_primary_key PRIMARY KEY (id), CONSTRAINT groups_uuid_unique_constraint UNIQUE (uuid));
GO
CREATE TRIGGER trg_groups_updated_at BEFORE UPDATE ON `groups`
FOR EACH ROW SET NEW.updated = (UTC_TIMESTAMP(3));
GO
CREATE TABLE user_groups (id BIGINT AUTO_INCREMENT NOT NULL, uuid CHAR(36) DEFAULT (UUID()) NOT NULL, created DATETIME(3) DEFAULT (UTC_TIMESTAMP(3)) NOT NULL, updated DATETIME(3) DEFAULT (UTC_TIMESTAMP(3)) NOT NULL, version BLOB DEFAULT (X'00') NOT NULL, user_id BIGINT NOT NULL, group_id BIGINT NOT NULL, CONSTRAINT user_groups_primary_key PRIMARY KEY (id), CONSTRAINT user_groups_uuid_unique_constraint UNIQUE (uuid), CONSTRAINT user_groups_user_id_foreign_key FOREIGN KEY (user_id) REFERENCES users (id), CONSTRAINT user_groups_group_id_foreign_key FOREIGN KEY (group_id) REFERENCES `groups` (id));
GO
CREATE TRIGGER trg_user_groups_updated_at BEFORE UPDATE ON user_groups
FOR EACH ROW SET NEW.updated = (UTC_TIMESTAMP(3));
GO
CREATE TABLE user_roles (id BIGINT AUTO_INCREMENT NOT NULL, uuid CHAR(36) DEFAULT (UUID()) NOT NULL, created DATETIME(3) DEFAULT (UTC_TIMESTAMP(3)) NOT NULL, updated DATETIME(3) DEFAULT (UTC_TIMESTAMP(3)) NOT NULL, version BLOB DEFAULT (X'00') NOT NULL, user_id BIGINT NOT NULL, role_id BIGINT NOT NULL, CONSTRAINT user_roles_primary_key PRIMARY KEY (id), CONSTRAINT user_roles_uuid_unique_constraint UNIQUE (uuid), CONSTRAINT user_roles_user_id_foreign_key FOREIGN KEY (user_id) REFERENCES users (id), CONSTRAINT user_roles_role_id_foreign_key FOREIGN KEY (role_id) REFERENCES roles (id));
GO
CREATE TRIGGER trg_user_roles_updated_at BEFORE UPDATE ON user_roles
FOR EACH ROW SET NEW.updated = (UTC_TIMESTAMP(3));
GO
CREATE TABLE user_settings (id BIGINT AUTO_INCREMENT NOT NULL, uuid CHAR(36) DEFAULT (UUID()) NOT NULL, created DATETIME(3) DEFAULT (UTC_TIMESTAMP(3)) NOT NULL, updated DATETIME(3) DEFAULT (UTC_TIMESTAMP(3)) NOT NULL, version BLOB DEFAULT (X'00') NOT NULL, user_id BIGINT NOT NULL, name VARCHAR(128) NOT NULL, value TEXT NOT NULL, CONSTRAINT user_settings_primary_key PRIMARY KEY (id), CONSTRAINT user_settings_uuid_unique_constraint UNIQUE (uuid), CONSTRAINT user_settings_user_id_foreign_key FOREIGN KEY (user_id) REFERENCES users (id));
GO
CREATE UNIQUE INDEX user_settings_user_setting_user_id_name_index ON user_settings (user_id, name);
GO
CREATE TRIGGER trg_user_settings_updated_at BEFORE UPDATE ON user_settings
FOR EACH ROW SET NEW.updated = (UTC_TIMESTAMP(3));
GO
CREATE TABLE contact_sources (id BIGINT AUTO_INCREMENT NOT NULL, uuid CHAR(36) DEFAULT (UUID()) NOT NULL, created DATETIME(3) DEFAULT (UTC_TIMESTAMP(3)) NOT NULL, updated DATETIME(3) DEFAULT (UTC_TIMESTAMP(3)) NOT NULL, version BLOB DEFAULT (X'00') NOT NULL, name VARCHAR(64) NOT NULL, description TEXT, CONSTRAINT contact_sources_primary_key PRIMARY KEY (id), CONSTRAINT contact_sources_uuid_unique_constraint UNIQUE (uuid));
GO
CREATE TRIGGER trg_contact_sources_updated_at BEFORE UPDATE ON contact_sources
FOR EACH ROW SET NEW.updated = (UTC_TIMESTAMP(3));
GO
CREATE TABLE address_types (id BIGINT AUTO_INCREMENT NOT NULL, uuid CHAR(36) DEFAULT (UUID()) NOT NULL, created DATETIME(3) DEFAULT (UTC_TIMESTAMP(3)) NOT NULL, updated DATETIME(3) DEFAULT (UTC_TIMESTAMP(3)) NOT NULL, version BLOB DEFAULT (X'00') NOT NULL, name VARCHAR(64) NOT NULL, description TEXT, CONSTRAINT address_types_primary_key PRIMARY KEY (id), CONSTRAINT address_types_uuid_unique_constraint UNIQUE (uuid));
GO
CREATE TRIGGER trg_address_types_updated_at BEFORE UPDATE ON address_types
FOR EACH ROW SET NEW.updated = (UTC_TIMESTAMP(3));
GO
CREATE TABLE phone_types (id BIGINT AUTO_INCREMENT NOT NULL, uuid CHAR(36) DEFAULT (UUID()) NOT NULL, created DATETIME(3) DEFAULT (UTC_TIMESTAMP(3)) NOT NULL, updated DATETIME(3) DEFAULT (UTC_TIMESTAMP(3)) NOT NULL, version BLOB DEFAULT (X'00') NOT NULL, name VARCHAR(64) NOT NULL, description TEXT, CONSTRAINT phone_types_primary_key PRIMARY KEY (id), CONSTRAINT phone_types_uuid_unique_constraint UNIQUE (uuid));
GO
CREATE TRIGGER trg_phone_types_updated_at BEFORE UPDATE ON phone_types
FOR EACH ROW SET NEW.updated = (UTC_TIMESTAMP(3));
GO
CREATE TABLE contact_bases (id BIGINT AUTO_INCREMENT NOT NULL, uuid CHAR(36) DEFAULT (UUID()) NOT NULL, created DATETIME(3) DEFAULT (UTC_TIMESTAMP(3)) NOT NULL, updated DATETIME(3) DEFAULT (UTC_TIMESTAMP(3)) NOT NULL, version BLOB DEFAULT (X'00') NOT NULL, contact_source_id BIGINT NOT NULL, first_name VARCHAR(128) NOT NULL, last_name VARCHAR(128) NOT NULL, email VARCHAR(256), notes TEXT, user_id BIGINT NOT NULL, CONSTRAINT contact_bases_primary_key PRIMARY KEY (id), CONSTRAINT contact_bases_uuid_unique_constraint UNIQUE (uuid), CONSTRAINT contact_bases_contact_source_id_foreign_key FOREIGN KEY (contact_source_id) REFERENCES contact_sources (id), CONSTRAINT contact_bases_user_id_foreign_key FOREIGN KEY (user_id) REFERENCES users (id));
GO
CREATE TRIGGER trg_contact_bases_updated_at BEFORE UPDATE ON contact_bases
FOR EACH ROW SET NEW.updated = (UTC_TIMESTAMP(3));
GO
CREATE TABLE address_bases (id BIGINT AUTO_INCREMENT NOT NULL, uuid CHAR(36) DEFAULT (UUID()) NOT NULL, created DATETIME(3) DEFAULT (UTC_TIMESTAMP(3)) NOT NULL, updated DATETIME(3) DEFAULT (UTC_TIMESTAMP(3)) NOT NULL, version BLOB DEFAULT (X'00') NOT NULL, latitude INT, label_note VARCHAR(128), floor INT UNSIGNED, score DECIMAL(10, 2), external_id CHAR(36), is_verified TINYINT(1), verified_at DATETIME(3), stamp BLOB, contact_id BIGINT NOT NULL, address_type_id BIGINT NOT NULL, line1 VARCHAR(256) NOT NULL, line2 VARCHAR(256), city VARCHAR(128) NOT NULL, region VARCHAR(128), postal_code VARCHAR(32), country VARCHAR(64), CONSTRAINT address_bases_primary_key PRIMARY KEY (id), CONSTRAINT address_bases_uuid_unique_constraint UNIQUE (uuid), CONSTRAINT address_bases_contact_id_foreign_key FOREIGN KEY (contact_id) REFERENCES contact_bases (id), CONSTRAINT address_bases_address_type_id_foreign_key FOREIGN KEY (address_type_id) REFERENCES address_types (id));
GO
CREATE TRIGGER trg_address_bases_updated_at BEFORE UPDATE ON address_bases
FOR EACH ROW SET NEW.updated = (UTC_TIMESTAMP(3));
GO
CREATE TABLE phone_bases (id BIGINT AUTO_INCREMENT NOT NULL, uuid CHAR(36) DEFAULT (UUID()) NOT NULL, created DATETIME(3) DEFAULT (UTC_TIMESTAMP(3)) NOT NULL, updated DATETIME(3) DEFAULT (UTC_TIMESTAMP(3)) NOT NULL, version BLOB DEFAULT (X'00') NOT NULL, contact_id BIGINT NOT NULL, phone_type_id BIGINT NOT NULL, number VARCHAR(32) NOT NULL, label VARCHAR(32), CONSTRAINT phone_bases_primary_key PRIMARY KEY (id), CONSTRAINT phone_bases_uuid_unique_constraint UNIQUE (uuid), CONSTRAINT phone_bases_contact_id_foreign_key FOREIGN KEY (contact_id) REFERENCES contact_bases (id), CONSTRAINT phone_bases_phone_type_id_foreign_key FOREIGN KEY (phone_type_id) REFERENCES phone_types (id));
GO
CREATE TRIGGER trg_phone_bases_updated_at BEFORE UPDATE ON phone_bases
FOR EACH ROW SET NEW.updated = (UTC_TIMESTAMP(3));
GO
CREATE TABLE contact_group_bases (id BIGINT AUTO_INCREMENT NOT NULL, uuid CHAR(36) DEFAULT (UUID()) NOT NULL, created DATETIME(3) DEFAULT (UTC_TIMESTAMP(3)) NOT NULL, updated DATETIME(3) DEFAULT (UTC_TIMESTAMP(3)) NOT NULL, version BLOB DEFAULT (X'00') NOT NULL, name VARCHAR(128) NOT NULL, description TEXT, CONSTRAINT contact_group_bases_primary_key PRIMARY KEY (id), CONSTRAINT contact_group_bases_uuid_unique_constraint UNIQUE (uuid));
GO
CREATE TRIGGER trg_contact_group_bases_updated_at BEFORE UPDATE ON contact_group_bases
FOR EACH ROW SET NEW.updated = (UTC_TIMESTAMP(3));
GO
CREATE TABLE contact_settings (id BIGINT AUTO_INCREMENT NOT NULL, uuid CHAR(36) DEFAULT (UUID()) NOT NULL, created DATETIME(3) DEFAULT (UTC_TIMESTAMP(3)) NOT NULL, updated DATETIME(3) DEFAULT (UTC_TIMESTAMP(3)) NOT NULL, version BLOB DEFAULT (X'00') NOT NULL, contact_id BIGINT NOT NULL, `key` VARCHAR(64) NOT NULL, value TEXT NOT NULL, CONSTRAINT contact_settings_primary_key PRIMARY KEY (id), CONSTRAINT contact_settings_uuid_unique_constraint UNIQUE (uuid), CONSTRAINT contact_settings_contact_id_foreign_key FOREIGN KEY (contact_id) REFERENCES contact_bases (id));
GO
CREATE UNIQUE INDEX contact_settings_owner_key_index ON contact_settings (contact_id, `key`);
GO
CREATE TRIGGER trg_contact_settings_updated_at BEFORE UPDATE ON contact_settings
FOR EACH ROW SET NEW.updated = (UTC_TIMESTAMP(3));
GO
CREATE TABLE contact_preferences (id BIGINT AUTO_INCREMENT NOT NULL, uuid CHAR(36) DEFAULT (UUID()) NOT NULL, created DATETIME(3) DEFAULT (UTC_TIMESTAMP(3)) NOT NULL, updated DATETIME(3) DEFAULT (UTC_TIMESTAMP(3)) NOT NULL, version BLOB DEFAULT (X'00') NOT NULL, contact_id BIGINT NOT NULL, `key` VARCHAR(64) NOT NULL, locale VARCHAR(16) NOT NULL, timezone VARCHAR(64) NOT NULL, CONSTRAINT contact_preferences_primary_key PRIMARY KEY (id), CONSTRAINT contact_preferences_uuid_unique_constraint UNIQUE (uuid), CONSTRAINT contact_preferences_contact_id_foreign_key FOREIGN KEY (contact_id) REFERENCES contact_bases (id));
GO
CREATE UNIQUE INDEX contact_preferences_owner_key_index ON contact_preferences (contact_id, `key`);
GO
CREATE TRIGGER trg_contact_preferences_updated_at BEFORE UPDATE ON contact_preferences
FOR EACH ROW SET NEW.updated = (UTC_TIMESTAMP(3));
GO
CREATE TABLE contact_group_members (id BIGINT AUTO_INCREMENT NOT NULL, uuid CHAR(36) DEFAULT (UUID()) NOT NULL, created DATETIME(3) DEFAULT (UTC_TIMESTAMP(3)) NOT NULL, updated DATETIME(3) DEFAULT (UTC_TIMESTAMP(3)) NOT NULL, version BLOB DEFAULT (X'00') NOT NULL, contact_id BIGINT NOT NULL, contact_group_id BIGINT NOT NULL, CONSTRAINT contact_group_members_primary_key PRIMARY KEY (id), CONSTRAINT contact_group_members_uuid_unique_constraint UNIQUE (uuid), CONSTRAINT contact_group_members_contact_id_foreign_key FOREIGN KEY (contact_id) REFERENCES contact_bases (id), CONSTRAINT contact_group_members_contact_group_id_foreign_key FOREIGN KEY (contact_group_id) REFERENCES contact_group_bases (id));
GO
CREATE TRIGGER trg_contact_group_members_updated_at BEFORE UPDATE ON contact_group_members
FOR EACH ROW SET NEW.updated = (UTC_TIMESTAMP(3));
GO
CREATE TABLE legacy_contacts (`key` VARCHAR(64) NOT NULL, first_name VARCHAR(128) NOT NULL, last_name VARCHAR(128) NOT NULL, email VARCHAR(256), imported_at DATETIME(3));
GO
CREATE TABLE contact_change_logs (id INT NOT NULL, occurred_at DATETIME(3) NOT NULL, contact_id BIGINT NOT NULL, changed_by VARCHAR(128) NOT NULL, change_summary TEXT NOT NULL, CONSTRAINT contact_change_logs_primary_key PRIMARY KEY (id));
GO
CREATE TABLE categories (id BIGINT AUTO_INCREMENT NOT NULL, uuid CHAR(36) DEFAULT (UUID()) NOT NULL, created DATETIME(3) DEFAULT (UTC_TIMESTAMP(3)) NOT NULL, updated DATETIME(3) DEFAULT (UTC_TIMESTAMP(3)) NOT NULL, version BLOB DEFAULT (X'00') NOT NULL, category_id BIGINT, name VARCHAR(128) NOT NULL, description TEXT NOT NULL, is_enabled TINYINT(1) DEFAULT 1 NOT NULL, is_deleted TINYINT(1) DEFAULT 0 NOT NULL, CONSTRAINT categories_primary_key PRIMARY KEY (id), CONSTRAINT categories_uuid_unique_constraint UNIQUE (uuid), CONSTRAINT categories_category_id_foreign_key FOREIGN KEY (category_id) REFERENCES categories (id));
GO
CREATE TRIGGER trg_categories_updated_at BEFORE UPDATE ON categories
FOR EACH ROW SET NEW.updated = (UTC_TIMESTAMP(3));
GO
CREATE TABLE game_bases (id BIGINT AUTO_INCREMENT NOT NULL, uuid CHAR(36) DEFAULT (UUID()) NOT NULL, created DATETIME(3) DEFAULT (UTC_TIMESTAMP(3)) NOT NULL, updated DATETIME(3) DEFAULT (UTC_TIMESTAMP(3)) NOT NULL, version BLOB DEFAULT (X'00') NOT NULL, name VARCHAR(128) NOT NULL, description TEXT NOT NULL, location VARCHAR(256) NOT NULL, is_enabled TINYINT(1) DEFAULT 1 NOT NULL, is_deleted TINYINT(1) DEFAULT 0 NOT NULL, CONSTRAINT game_bases_primary_key PRIMARY KEY (id), CONSTRAINT game_bases_uuid_unique_constraint UNIQUE (uuid));
GO
CREATE TRIGGER trg_game_bases_updated_at BEFORE UPDATE ON game_bases
FOR EACH ROW SET NEW.updated = (UTC_TIMESTAMP(3));
GO
CREATE TABLE game_categories (id BIGINT AUTO_INCREMENT NOT NULL, uuid CHAR(36) DEFAULT (UUID()) NOT NULL, created DATETIME(3) DEFAULT (UTC_TIMESTAMP(3)) NOT NULL, updated DATETIME(3) DEFAULT (UTC_TIMESTAMP(3)) NOT NULL, version BLOB DEFAULT (X'00') NOT NULL, game_id BIGINT NOT NULL, category_id BIGINT NOT NULL, CONSTRAINT game_categories_primary_key PRIMARY KEY (id), CONSTRAINT game_categories_uuid_unique_constraint UNIQUE (uuid), CONSTRAINT game_categories_game_id_foreign_key FOREIGN KEY (game_id) REFERENCES game_bases (id), CONSTRAINT game_categories_category_id_foreign_key FOREIGN KEY (category_id) REFERENCES categories (id));
GO
CREATE UNIQUE INDEX game_categories_game_category_game_id_category_id_index ON game_categories (game_id, category_id);
GO
CREATE TRIGGER trg_game_categories_updated_at BEFORE UPDATE ON game_categories
FOR EACH ROW SET NEW.updated = (UTC_TIMESTAMP(3));
GO
CREATE TABLE game_states (id BIGINT AUTO_INCREMENT NOT NULL, uuid CHAR(36) DEFAULT (UUID()) NOT NULL, created DATETIME(3) DEFAULT (UTC_TIMESTAMP(3)) NOT NULL, updated DATETIME(3) DEFAULT (UTC_TIMESTAMP(3)) NOT NULL, version BLOB DEFAULT (X'00') NOT NULL, game_id BIGINT NOT NULL, user_id BIGINT NOT NULL, state VARCHAR(256) NOT NULL, CONSTRAINT game_states_primary_key PRIMARY KEY (id), CONSTRAINT game_states_uuid_unique_constraint UNIQUE (uuid), CONSTRAINT game_states_game_id_foreign_key FOREIGN KEY (game_id) REFERENCES game_bases (id), CONSTRAINT game_states_user_id_foreign_key FOREIGN KEY (user_id) REFERENCES users (id));
GO
CREATE TRIGGER trg_game_states_updated_at BEFORE UPDATE ON game_states
FOR EACH ROW SET NEW.updated = (UTC_TIMESTAMP(3));
GO
CREATE TABLE game_settings (id BIGINT AUTO_INCREMENT NOT NULL, uuid CHAR(36) DEFAULT (UUID()) NOT NULL, created DATETIME(3) DEFAULT (UTC_TIMESTAMP(3)) NOT NULL, updated DATETIME(3) DEFAULT (UTC_TIMESTAMP(3)) NOT NULL, version BLOB DEFAULT (X'00') NOT NULL, game_id BIGINT NOT NULL, name VARCHAR(128) NOT NULL, value TEXT NOT NULL, CONSTRAINT game_settings_primary_key PRIMARY KEY (id), CONSTRAINT game_settings_uuid_unique_constraint UNIQUE (uuid), CONSTRAINT game_settings_game_id_foreign_key FOREIGN KEY (game_id) REFERENCES game_bases (id));
GO
CREATE UNIQUE INDEX game_settings_game_setting_game_id_name_index ON game_settings (game_id, name);
GO
CREATE TRIGGER trg_game_settings_updated_at BEFORE UPDATE ON game_settings
FOR EACH ROW SET NEW.updated = (UTC_TIMESTAMP(3));
GO
CREATE TABLE reviews (id BIGINT AUTO_INCREMENT NOT NULL, uuid CHAR(36) DEFAULT (UUID()) NOT NULL, created DATETIME(3) DEFAULT (UTC_TIMESTAMP(3)) NOT NULL, updated DATETIME(3) DEFAULT (UTC_TIMESTAMP(3)) NOT NULL, version BLOB DEFAULT (X'00') NOT NULL, game_id BIGINT NOT NULL, user_id BIGINT NOT NULL, description TEXT NOT NULL, rating DECIMAL(10, 2) NOT NULL, is_approved TINYINT(1) DEFAULT 0 NOT NULL, CONSTRAINT reviews_primary_key PRIMARY KEY (id), CONSTRAINT reviews_uuid_unique_constraint UNIQUE (uuid), CONSTRAINT reviews_game_id_foreign_key FOREIGN KEY (game_id) REFERENCES game_bases (id), CONSTRAINT reviews_user_id_foreign_key FOREIGN KEY (user_id) REFERENCES users (id));
GO
CREATE TRIGGER trg_reviews_updated_at BEFORE UPDATE ON reviews
FOR EACH ROW SET NEW.updated = (UTC_TIMESTAMP(3));
