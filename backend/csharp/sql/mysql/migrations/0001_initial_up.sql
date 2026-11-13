-- Generated initial migration for mysql

-- Create added tables
CREATE TABLE users (
    id BIGINT AUTO_INCREMENT NOT NULL,
    uuid CHAR(36) DEFAULT (UUID()) NOT NULL,
    created DATETIME(3) DEFAULT (UTC_TIMESTAMP(3)) NOT NULL,
    updated DATETIME(3) DEFAULT (UTC_TIMESTAMP(3)) NOT NULL,
    version BLOB DEFAULT (X'00') NOT NULL,
    username TEXT NOT NULL,
    is_enabled TINYINT(1) DEFAULT 1 NOT NULL,
    CONSTRAINT users_primary_key PRIMARY KEY (id),
    CONSTRAINT users_uuid_unique_constraint UNIQUE (uuid)
);
GO
CREATE TRIGGER trg_users_updated_at BEFORE UPDATE ON users
FOR EACH ROW SET NEW.updated = (UTC_TIMESTAMP(3));
GO
CREATE TABLE roles (
    id BIGINT AUTO_INCREMENT NOT NULL,
    uuid CHAR(36) DEFAULT (UUID()) NOT NULL,
    created DATETIME(3) DEFAULT (UTC_TIMESTAMP(3)) NOT NULL,
    updated DATETIME(3) DEFAULT (UTC_TIMESTAMP(3)) NOT NULL,
    version BLOB DEFAULT (X'00') NOT NULL,
    name TEXT NOT NULL,
    description TEXT DEFAULT ('') NOT NULL,
    is_enabled TINYINT(1) DEFAULT 1 NOT NULL,
    CONSTRAINT roles_primary_key PRIMARY KEY (id),
    CONSTRAINT roles_uuid_unique_constraint UNIQUE (uuid)
);
GO
CREATE TRIGGER trg_roles_updated_at BEFORE UPDATE ON roles
FOR EACH ROW SET NEW.updated = (UTC_TIMESTAMP(3));
GO
CREATE TABLE `groups` (
    id BIGINT AUTO_INCREMENT NOT NULL,
    uuid CHAR(36) DEFAULT (UUID()) NOT NULL,
    created DATETIME(3) DEFAULT (UTC_TIMESTAMP(3)) NOT NULL,
    updated DATETIME(3) DEFAULT (UTC_TIMESTAMP(3)) NOT NULL,
    version BLOB DEFAULT (X'00') NOT NULL,
    name TEXT NOT NULL,
    description TEXT DEFAULT ('') NOT NULL,
    is_enabled TINYINT(1) DEFAULT 1 NOT NULL,
    CONSTRAINT groups_primary_key PRIMARY KEY (id),
    CONSTRAINT groups_uuid_unique_constraint UNIQUE (uuid)
);
GO
CREATE TRIGGER trg_groups_updated_at BEFORE UPDATE ON `groups`
FOR EACH ROW SET NEW.updated = (UTC_TIMESTAMP(3));
GO
CREATE TABLE user_groups (
    id BIGINT AUTO_INCREMENT NOT NULL,
    uuid CHAR(36) DEFAULT (UUID()) NOT NULL,
    created DATETIME(3) DEFAULT (UTC_TIMESTAMP(3)) NOT NULL,
    updated DATETIME(3) DEFAULT (UTC_TIMESTAMP(3)) NOT NULL,
    version BLOB DEFAULT (X'00') NOT NULL,
    user_id BIGINT NOT NULL,
    group_id BIGINT NOT NULL,
    CONSTRAINT user_groups_primary_key PRIMARY KEY (id),
    CONSTRAINT user_groups_uuid_unique_constraint UNIQUE (uuid),
    CONSTRAINT user_groups_user_id_foreign_key FOREIGN KEY (user_id) REFERENCES users (id),
    CONSTRAINT user_groups_group_id_foreign_key FOREIGN KEY (group_id) REFERENCES `groups` (id)
);
GO
CREATE TRIGGER trg_user_groups_updated_at BEFORE UPDATE ON user_groups
FOR EACH ROW SET NEW.updated = (UTC_TIMESTAMP(3));
GO
CREATE TABLE user_roles (
    id BIGINT AUTO_INCREMENT NOT NULL,
    uuid CHAR(36) DEFAULT (UUID()) NOT NULL,
    created DATETIME(3) DEFAULT (UTC_TIMESTAMP(3)) NOT NULL,
    updated DATETIME(3) DEFAULT (UTC_TIMESTAMP(3)) NOT NULL,
    version BLOB DEFAULT (X'00') NOT NULL,
    user_id BIGINT NOT NULL,
    role_id BIGINT NOT NULL,
    CONSTRAINT user_roles_primary_key PRIMARY KEY (id),
    CONSTRAINT user_roles_uuid_unique_constraint UNIQUE (uuid),
    CONSTRAINT user_roles_user_id_foreign_key FOREIGN KEY (user_id) REFERENCES users (id),
    CONSTRAINT user_roles_role_id_foreign_key FOREIGN KEY (role_id) REFERENCES roles (id)
);
GO
CREATE TRIGGER trg_user_roles_updated_at BEFORE UPDATE ON user_roles
FOR EACH ROW SET NEW.updated = (UTC_TIMESTAMP(3));
GO
CREATE TABLE user_settings (
    id BIGINT AUTO_INCREMENT NOT NULL,
    uuid CHAR(36) DEFAULT (UUID()) NOT NULL,
    created DATETIME(3) DEFAULT (UTC_TIMESTAMP(3)) NOT NULL,
    updated DATETIME(3) DEFAULT (UTC_TIMESTAMP(3)) NOT NULL,
    version BLOB DEFAULT (X'00') NOT NULL,
    user_id BIGINT NOT NULL,
    name VARCHAR(128) NOT NULL,
    value TEXT NOT NULL,
    CONSTRAINT user_settings_primary_key PRIMARY KEY (id),
    CONSTRAINT user_settings_uuid_unique_constraint UNIQUE (uuid),
    CONSTRAINT user_settings_user_id_foreign_key FOREIGN KEY (user_id) REFERENCES users (id)
);
GO
CREATE UNIQUE INDEX user_settings_user_setting_user_id_name_index ON user_settings (user_id, name);
GO
CREATE TRIGGER trg_user_settings_updated_at BEFORE UPDATE ON user_settings
FOR EACH ROW SET NEW.updated = (UTC_TIMESTAMP(3));
GO
CREATE TABLE reviews (
    id BIGINT AUTO_INCREMENT NOT NULL,
    uuid CHAR(36) DEFAULT (UUID()) NOT NULL,
    created DATETIME(3) DEFAULT (UTC_TIMESTAMP(3)) NOT NULL,
    updated DATETIME(3) DEFAULT (UTC_TIMESTAMP(3)) NOT NULL,
    version BLOB DEFAULT (X'00') NOT NULL,
    user_id BIGINT NOT NULL,
    comment TEXT NOT NULL,
    rating DECIMAL(10, 2) NOT NULL,
    is_moderated TINYINT(1) DEFAULT 0 NOT NULL,
    CONSTRAINT reviews_primary_key PRIMARY KEY (id),
    CONSTRAINT reviews_uuid_unique_constraint UNIQUE (uuid),
    CONSTRAINT reviews_user_id_foreign_key FOREIGN KEY (user_id) REFERENCES users (id)
);
GO
CREATE TRIGGER trg_reviews_updated_at BEFORE UPDATE ON reviews
FOR EACH ROW SET NEW.updated = (UTC_TIMESTAMP(3));
GO
CREATE TABLE review_feedbacks (
    id BIGINT AUTO_INCREMENT NOT NULL,
    uuid CHAR(36) DEFAULT (UUID()) NOT NULL,
    created DATETIME(3) DEFAULT (UTC_TIMESTAMP(3)) NOT NULL,
    updated DATETIME(3) DEFAULT (UTC_TIMESTAMP(3)) NOT NULL,
    version BLOB DEFAULT (X'00') NOT NULL,
    review_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    is_positive TINYINT(1) NOT NULL,
    CONSTRAINT review_feedbacks_primary_key PRIMARY KEY (id),
    CONSTRAINT review_feedbacks_uuid_unique_constraint UNIQUE (uuid),
    CONSTRAINT review_feedbacks_review_id_foreign_key FOREIGN KEY (review_id) REFERENCES reviews (id),
    CONSTRAINT review_feedbacks_user_id_foreign_key FOREIGN KEY (user_id) REFERENCES users (id)
);
GO
CREATE TRIGGER trg_review_feedbacks_updated_at BEFORE UPDATE ON review_feedbacks
FOR EACH ROW SET NEW.updated = (UTC_TIMESTAMP(3));
GO
CREATE TABLE genders (
    id BIGINT AUTO_INCREMENT NOT NULL,
    uuid CHAR(36) DEFAULT (UUID()) NOT NULL,
    created DATETIME(3) DEFAULT (UTC_TIMESTAMP(3)) NOT NULL,
    updated DATETIME(3) DEFAULT (UTC_TIMESTAMP(3)) NOT NULL,
    version BLOB DEFAULT (X'00') NOT NULL,
    name VARCHAR(128) NOT NULL,
    description TEXT DEFAULT ('') NOT NULL,
    CONSTRAINT genders_primary_key PRIMARY KEY (id),
    CONSTRAINT genders_uuid_unique_constraint UNIQUE (uuid),
    CONSTRAINT genders_name_unique_constraint UNIQUE (name)
);
GO
CREATE TRIGGER trg_genders_updated_at BEFORE UPDATE ON genders
FOR EACH ROW SET NEW.updated = (UTC_TIMESTAMP(3));
GO
CREATE TABLE contacts (
    id BIGINT AUTO_INCREMENT NOT NULL,
    uuid CHAR(36) DEFAULT (UUID()) NOT NULL,
    created DATETIME(3) DEFAULT (UTC_TIMESTAMP(3)) NOT NULL,
    updated DATETIME(3) DEFAULT (UTC_TIMESTAMP(3)) NOT NULL,
    version BLOB DEFAULT (X'00') NOT NULL,
    name VARCHAR(512) NOT NULL,
    given_name VARCHAR(512) NOT NULL,
    additional_name VARCHAR(512) DEFAULT ('') NOT NULL,
    pronunciation VARCHAR(512) DEFAULT ('') NOT NULL,
    family_name VARCHAR(512) DEFAULT ('') NOT NULL,
    nick_name VARCHAR(512) DEFAULT ('') NOT NULL,
    job_title VARCHAR(512) DEFAULT ('') NOT NULL,
    gender_type_id BIGINT NOT NULL,
    organization VARCHAR(512) DEFAULT ('') NOT NULL,
    is_starred TINYINT(1) DEFAULT 0 NOT NULL,
    is_favorite TINYINT(1) DEFAULT 0 NOT NULL,
    is_deleted TINYINT(1) DEFAULT 0 NOT NULL,
    user_id BIGINT NOT NULL,
    CONSTRAINT contacts_primary_key PRIMARY KEY (id),
    CONSTRAINT contacts_uuid_unique_constraint UNIQUE (uuid),
    CONSTRAINT contacts_gender_type_id_foreign_key FOREIGN KEY (gender_type_id) REFERENCES genders (id),
    CONSTRAINT contacts_user_id_foreign_key FOREIGN KEY (user_id) REFERENCES users (id)
);
GO
CREATE INDEX contacts_contact_base_gender_type_id_index_index ON contacts (gender_type_id);
GO
CREATE TRIGGER trg_contacts_updated_at BEFORE UPDATE ON contacts
FOR EACH ROW SET NEW.updated = (UTC_TIMESTAMP(3));
GO
CREATE TABLE email_types (
    id BIGINT AUTO_INCREMENT NOT NULL,
    uuid CHAR(36) DEFAULT (UUID()) NOT NULL,
    created DATETIME(3) DEFAULT (UTC_TIMESTAMP(3)) NOT NULL,
    updated DATETIME(3) DEFAULT (UTC_TIMESTAMP(3)) NOT NULL,
    version BLOB DEFAULT (X'00') NOT NULL,
    name VARCHAR(128) NOT NULL,
    description TEXT DEFAULT ('') NOT NULL,
    CONSTRAINT email_types_primary_key PRIMARY KEY (id),
    CONSTRAINT email_types_uuid_unique_constraint UNIQUE (uuid),
    CONSTRAINT email_types_name_unique_constraint UNIQUE (name)
);
GO
CREATE TRIGGER trg_email_types_updated_at BEFORE UPDATE ON email_types
FOR EACH ROW SET NEW.updated = (UTC_TIMESTAMP(3));
GO
CREATE TABLE emails (
    id BIGINT AUTO_INCREMENT NOT NULL,
    uuid CHAR(36) DEFAULT (UUID()) NOT NULL,
    created DATETIME(3) DEFAULT (UTC_TIMESTAMP(3)) NOT NULL,
    updated DATETIME(3) DEFAULT (UTC_TIMESTAMP(3)) NOT NULL,
    version BLOB DEFAULT (X'00') NOT NULL,
    email_type_id BIGINT NOT NULL,
    contact_id BIGINT NOT NULL,
    address VARCHAR(320) NOT NULL,
    display_name VARCHAR(256) DEFAULT ('') NOT NULL,
    is_primary TINYINT(1) NOT NULL,
    CONSTRAINT emails_primary_key PRIMARY KEY (id),
    CONSTRAINT emails_uuid_unique_constraint UNIQUE (uuid),
    CONSTRAINT emails_email_type_id_foreign_key FOREIGN KEY (email_type_id) REFERENCES email_types (id),
    CONSTRAINT emails_contact_id_foreign_key FOREIGN KEY (contact_id) REFERENCES contacts (id)
);
GO
CREATE UNIQUE INDEX emails_contact_id_email_type_id_index_index ON emails (contact_id, email_type_id);
GO
CREATE INDEX emails_email_base_email_type_id_index_index ON emails (email_type_id);
GO
CREATE TRIGGER trg_emails_updated_at BEFORE UPDATE ON emails
FOR EACH ROW SET NEW.updated = (UTC_TIMESTAMP(3));
GO
CREATE TABLE phone_types (
    id BIGINT AUTO_INCREMENT NOT NULL,
    uuid CHAR(36) DEFAULT (UUID()) NOT NULL,
    created DATETIME(3) DEFAULT (UTC_TIMESTAMP(3)) NOT NULL,
    updated DATETIME(3) DEFAULT (UTC_TIMESTAMP(3)) NOT NULL,
    version BLOB DEFAULT (X'00') NOT NULL,
    name VARCHAR(128) NOT NULL,
    description TEXT DEFAULT ('') NOT NULL,
    CONSTRAINT phone_types_primary_key PRIMARY KEY (id),
    CONSTRAINT phone_types_uuid_unique_constraint UNIQUE (uuid),
    CONSTRAINT phone_types_name_unique_constraint UNIQUE (name)
);
GO
CREATE TRIGGER trg_phone_types_updated_at BEFORE UPDATE ON phone_types
FOR EACH ROW SET NEW.updated = (UTC_TIMESTAMP(3));
GO
CREATE TABLE phones (
    id BIGINT AUTO_INCREMENT NOT NULL,
    uuid CHAR(36) DEFAULT (UUID()) NOT NULL,
    created DATETIME(3) DEFAULT (UTC_TIMESTAMP(3)) NOT NULL,
    updated DATETIME(3) DEFAULT (UTC_TIMESTAMP(3)) NOT NULL,
    version BLOB DEFAULT (X'00') NOT NULL,
    phone_type_id BIGINT NOT NULL,
    contact_id BIGINT NOT NULL,
    number VARCHAR(20) NOT NULL,
    display_name VARCHAR(256) NOT NULL,
    extention VARCHAR(10) NOT NULL,
    is_primary TINYINT(1) NOT NULL,
    is_verified TINYINT(1) DEFAULT 0 NOT NULL,
    CONSTRAINT phones_primary_key PRIMARY KEY (id),
    CONSTRAINT phones_uuid_unique_constraint UNIQUE (uuid),
    CONSTRAINT phones_number_unique_constraint UNIQUE (number),
    CONSTRAINT phones_phone_type_id_foreign_key FOREIGN KEY (phone_type_id) REFERENCES phone_types (id),
    CONSTRAINT phones_contact_id_foreign_key FOREIGN KEY (contact_id) REFERENCES contacts (id)
);
GO
CREATE UNIQUE INDEX phones_contact_id_phone_type_id_index_index ON phones (contact_id, phone_type_id);
GO
CREATE INDEX phones_phone_base_phone_type_id_index_index ON phones (phone_type_id);
GO
CREATE TRIGGER trg_phones_updated_at BEFORE UPDATE ON phones
FOR EACH ROW SET NEW.updated = (UTC_TIMESTAMP(3));
GO
CREATE TABLE addresses (
    id BIGINT AUTO_INCREMENT NOT NULL,
    uuid CHAR(36) DEFAULT (UUID()) NOT NULL,
    created DATETIME(3) DEFAULT (UTC_TIMESTAMP(3)) NOT NULL,
    updated DATETIME(3) DEFAULT (UTC_TIMESTAMP(3)) NOT NULL,
    version BLOB DEFAULT (X'00') NOT NULL,
    contact_id BIGINT NOT NULL,
    display_name VARCHAR(255) DEFAULT ('') NOT NULL,
    `line_1` VARCHAR(255) NOT NULL,
    `line_2` VARCHAR(255) DEFAULT ('') NOT NULL,
    `line_3` VARCHAR(255) DEFAULT ('') NOT NULL,
    neighborhood VARCHAR(100) DEFAULT ('') NOT NULL,
    district VARCHAR(100) DEFAULT ('') NOT NULL,
    city VARCHAR(100) NOT NULL,
    state_province VARCHAR(100) DEFAULT ('') NOT NULL,
    postal_code VARCHAR(20) DEFAULT ('') NOT NULL,
    country_code VARCHAR(2) NOT NULL,
    formatted_address TEXT DEFAULT ('') NOT NULL,
    latitude DECIMAL(10, 7),
    longitude DECIMAL(10, 7),
    is_primary TINYINT(1) DEFAULT 0 NOT NULL,
    CONSTRAINT addresses_primary_key PRIMARY KEY (id),
    CONSTRAINT addresses_uuid_unique_constraint UNIQUE (uuid),
    CONSTRAINT addresses_contact_id_foreign_key FOREIGN KEY (contact_id) REFERENCES contacts (id)
);
GO
CREATE INDEX addresses_address_base_contact_id_index_index ON addresses (contact_id);
GO
CREATE TRIGGER trg_addresses_updated_at BEFORE UPDATE ON addresses
FOR EACH ROW SET NEW.updated = (UTC_TIMESTAMP(3));
GO
CREATE TABLE contact_attributes (
    id BIGINT AUTO_INCREMENT NOT NULL,
    uuid CHAR(36) DEFAULT (UUID()) NOT NULL,
    created DATETIME(3) DEFAULT (UTC_TIMESTAMP(3)) NOT NULL,
    updated DATETIME(3) DEFAULT (UTC_TIMESTAMP(3)) NOT NULL,
    version BLOB DEFAULT (X'00') NOT NULL,
    contact_id BIGINT NOT NULL,
    name VARCHAR(255) NOT NULL,
    value TEXT NOT NULL,
    CONSTRAINT contact_attributes_primary_key PRIMARY KEY (id),
    CONSTRAINT contact_attributes_uuid_unique_constraint UNIQUE (uuid),
    CONSTRAINT contact_attributes_contact_id_foreign_key FOREIGN KEY (contact_id) REFERENCES contacts (id)
);
GO
CREATE INDEX contact_attributes_contact_attribute_contact_id_name_index_index ON contact_attributes (contact_id, name);
GO
CREATE UNIQUE INDEX contact_attributes_owner_key_index ON contact_attributes (contact_id, name);
GO
CREATE TRIGGER trg_contact_attributes_updated_at BEFORE UPDATE ON contact_attributes
FOR EACH ROW SET NEW.updated = (UTC_TIMESTAMP(3));
GO
CREATE TABLE address_attributes (
    id BIGINT AUTO_INCREMENT NOT NULL,
    uuid CHAR(36) DEFAULT (UUID()) NOT NULL,
    created DATETIME(3) DEFAULT (UTC_TIMESTAMP(3)) NOT NULL,
    updated DATETIME(3) DEFAULT (UTC_TIMESTAMP(3)) NOT NULL,
    version BLOB DEFAULT (X'00') NOT NULL,
    address_id BIGINT NOT NULL,
    name VARCHAR(255) NOT NULL,
    value TEXT NOT NULL,
    CONSTRAINT address_attributes_primary_key PRIMARY KEY (id),
    CONSTRAINT address_attributes_uuid_unique_constraint UNIQUE (uuid),
    CONSTRAINT address_attributes_address_id_foreign_key FOREIGN KEY (address_id) REFERENCES addresses (id)
);
GO
CREATE INDEX address_attributes_address_attribute_address_id_index_index ON address_attributes (address_id);
GO
CREATE UNIQUE INDEX address_attributes_owner_key_index ON address_attributes (address_id, name);
GO
CREATE TRIGGER trg_address_attributes_updated_at BEFORE UPDATE ON address_attributes
FOR EACH ROW SET NEW.updated = (UTC_TIMESTAMP(3));
GO
CREATE TABLE email_attributes (
    id BIGINT AUTO_INCREMENT NOT NULL,
    uuid CHAR(36) DEFAULT (UUID()) NOT NULL,
    created DATETIME(3) DEFAULT (UTC_TIMESTAMP(3)) NOT NULL,
    updated DATETIME(3) DEFAULT (UTC_TIMESTAMP(3)) NOT NULL,
    version BLOB DEFAULT (X'00') NOT NULL,
    email_id BIGINT NOT NULL,
    name VARCHAR(255) NOT NULL,
    value TEXT NOT NULL,
    CONSTRAINT email_attributes_primary_key PRIMARY KEY (id),
    CONSTRAINT email_attributes_uuid_unique_constraint UNIQUE (uuid),
    CONSTRAINT email_attributes_email_id_foreign_key FOREIGN KEY (email_id) REFERENCES emails (id)
);
GO
CREATE INDEX email_attributes_email_attribute_email_id_index_index ON email_attributes (email_id);
GO
CREATE UNIQUE INDEX email_attributes_owner_key_index ON email_attributes (email_id, name);
GO
CREATE TRIGGER trg_email_attributes_updated_at BEFORE UPDATE ON email_attributes
FOR EACH ROW SET NEW.updated = (UTC_TIMESTAMP(3));
GO
CREATE TABLE phone_attributes (
    id BIGINT AUTO_INCREMENT NOT NULL,
    uuid CHAR(36) DEFAULT (UUID()) NOT NULL,
    created DATETIME(3) DEFAULT (UTC_TIMESTAMP(3)) NOT NULL,
    updated DATETIME(3) DEFAULT (UTC_TIMESTAMP(3)) NOT NULL,
    version BLOB DEFAULT (X'00') NOT NULL,
    phone_id BIGINT NOT NULL,
    name VARCHAR(255) NOT NULL,
    value TEXT NOT NULL,
    CONSTRAINT phone_attributes_primary_key PRIMARY KEY (id),
    CONSTRAINT phone_attributes_uuid_unique_constraint UNIQUE (uuid),
    CONSTRAINT phone_attributes_phone_id_foreign_key FOREIGN KEY (phone_id) REFERENCES phones (id)
);
GO
CREATE INDEX phone_attributes_phone_attribute_phone_id_index_index ON phone_attributes (phone_id);
GO
CREATE UNIQUE INDEX phone_attributes_owner_key_index ON phone_attributes (phone_id, name);
GO
CREATE TRIGGER trg_phone_attributes_updated_at BEFORE UPDATE ON phone_attributes
FOR EACH ROW SET NEW.updated = (UTC_TIMESTAMP(3));
GO
CREATE TABLE labels (
    id BIGINT AUTO_INCREMENT NOT NULL,
    uuid CHAR(36) DEFAULT (UUID()) NOT NULL,
    created DATETIME(3) DEFAULT (UTC_TIMESTAMP(3)) NOT NULL,
    updated DATETIME(3) DEFAULT (UTC_TIMESTAMP(3)) NOT NULL,
    version BLOB DEFAULT (X'00') NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT DEFAULT ('') NOT NULL,
    CONSTRAINT labels_primary_key PRIMARY KEY (id),
    CONSTRAINT labels_uuid_unique_constraint UNIQUE (uuid),
    CONSTRAINT labels_name_unique_constraint UNIQUE (name)
);
GO
CREATE TRIGGER trg_labels_updated_at BEFORE UPDATE ON labels
FOR EACH ROW SET NEW.updated = (UTC_TIMESTAMP(3));
GO
CREATE TABLE contact_labels (
    id BIGINT AUTO_INCREMENT NOT NULL,
    uuid CHAR(36) DEFAULT (UUID()) NOT NULL,
    created DATETIME(3) DEFAULT (UTC_TIMESTAMP(3)) NOT NULL,
    updated DATETIME(3) DEFAULT (UTC_TIMESTAMP(3)) NOT NULL,
    version BLOB DEFAULT (X'00') NOT NULL,
    contact_id BIGINT NOT NULL,
    label_id BIGINT NOT NULL,
    CONSTRAINT contact_labels_primary_key PRIMARY KEY (id),
    CONSTRAINT contact_labels_uuid_unique_constraint UNIQUE (uuid),
    CONSTRAINT contact_labels_contact_id_foreign_key FOREIGN KEY (contact_id) REFERENCES contacts (id),
    CONSTRAINT contact_labels_label_id_foreign_key FOREIGN KEY (label_id) REFERENCES labels (id)
);
GO
CREATE UNIQUE INDEX contact_labels_contact_label_contact_id_label_id_index_index ON contact_labels (contact_id, label_id);
GO
CREATE INDEX contact_labels_contact_label_label_id_index_index ON contact_labels (label_id);
GO
CREATE TRIGGER trg_contact_labels_updated_at BEFORE UPDATE ON contact_labels
FOR EACH ROW SET NEW.updated = (UTC_TIMESTAMP(3));
GO
CREATE TABLE address_labels (
    id BIGINT AUTO_INCREMENT NOT NULL,
    uuid CHAR(36) DEFAULT (UUID()) NOT NULL,
    created DATETIME(3) DEFAULT (UTC_TIMESTAMP(3)) NOT NULL,
    updated DATETIME(3) DEFAULT (UTC_TIMESTAMP(3)) NOT NULL,
    version BLOB DEFAULT (X'00') NOT NULL,
    address_id BIGINT NOT NULL,
    label_id BIGINT NOT NULL,
    CONSTRAINT address_labels_primary_key PRIMARY KEY (id),
    CONSTRAINT address_labels_uuid_unique_constraint UNIQUE (uuid),
    CONSTRAINT address_labels_address_id_foreign_key FOREIGN KEY (address_id) REFERENCES addresses (id),
    CONSTRAINT address_labels_label_id_foreign_key FOREIGN KEY (label_id) REFERENCES labels (id)
);
GO
CREATE UNIQUE INDEX address_labels_address_label_address_id_label_id_index ON address_labels (address_id, label_id);
GO
CREATE INDEX address_labels_address_label_label_id_index_index ON address_labels (label_id);
GO
CREATE TRIGGER trg_address_labels_updated_at BEFORE UPDATE ON address_labels
FOR EACH ROW SET NEW.updated = (UTC_TIMESTAMP(3));
GO
CREATE TABLE email_labels (
    id BIGINT AUTO_INCREMENT NOT NULL,
    uuid CHAR(36) DEFAULT (UUID()) NOT NULL,
    created DATETIME(3) DEFAULT (UTC_TIMESTAMP(3)) NOT NULL,
    updated DATETIME(3) DEFAULT (UTC_TIMESTAMP(3)) NOT NULL,
    version BLOB DEFAULT (X'00') NOT NULL,
    email_id BIGINT NOT NULL,
    label_id BIGINT NOT NULL,
    CONSTRAINT email_labels_primary_key PRIMARY KEY (id),
    CONSTRAINT email_labels_uuid_unique_constraint UNIQUE (uuid),
    CONSTRAINT email_labels_email_id_foreign_key FOREIGN KEY (email_id) REFERENCES emails (id),
    CONSTRAINT email_labels_label_id_foreign_key FOREIGN KEY (label_id) REFERENCES labels (id)
);
GO
CREATE UNIQUE INDEX email_labels_email_label_email_id_label_id_index ON email_labels (email_id, label_id);
GO
CREATE INDEX email_labels_email_label_label_id_index_index ON email_labels (label_id);
GO
CREATE TRIGGER trg_email_labels_updated_at BEFORE UPDATE ON email_labels
FOR EACH ROW SET NEW.updated = (UTC_TIMESTAMP(3));
GO
CREATE TABLE phone_labels (
    id BIGINT AUTO_INCREMENT NOT NULL,
    uuid CHAR(36) DEFAULT (UUID()) NOT NULL,
    created DATETIME(3) DEFAULT (UTC_TIMESTAMP(3)) NOT NULL,
    updated DATETIME(3) DEFAULT (UTC_TIMESTAMP(3)) NOT NULL,
    version BLOB DEFAULT (X'00') NOT NULL,
    phone_id BIGINT NOT NULL,
    label_id BIGINT NOT NULL,
    CONSTRAINT phone_labels_primary_key PRIMARY KEY (id),
    CONSTRAINT phone_labels_uuid_unique_constraint UNIQUE (uuid),
    CONSTRAINT phone_labels_phone_id_foreign_key FOREIGN KEY (phone_id) REFERENCES phones (id),
    CONSTRAINT phone_labels_label_id_foreign_key FOREIGN KEY (label_id) REFERENCES labels (id)
);
GO
CREATE UNIQUE INDEX phone_labels_phone_label_phone_id_label_id_index ON phone_labels (phone_id, label_id);
GO
CREATE INDEX phone_labels_phone_label_label_id_index_index ON phone_labels (label_id);
GO
CREATE TRIGGER trg_phone_labels_updated_at BEFORE UPDATE ON phone_labels
FOR EACH ROW SET NEW.updated = (UTC_TIMESTAMP(3));
GO
CREATE TABLE languages (
    id BIGINT AUTO_INCREMENT NOT NULL,
    uuid CHAR(36) DEFAULT (UUID()) NOT NULL,
    created DATETIME(3) DEFAULT (UTC_TIMESTAMP(3)) NOT NULL,
    updated DATETIME(3) DEFAULT (UTC_TIMESTAMP(3)) NOT NULL,
    version BLOB DEFAULT (X'00') NOT NULL,
    code VARCHAR(2) NOT NULL,
    name VARCHAR(128) NOT NULL,
    is_enabled TINYINT(1) DEFAULT 1 NOT NULL,
    is_deleted TINYINT(1) DEFAULT 0 NOT NULL,
    CONSTRAINT languages_primary_key PRIMARY KEY (id),
    CONSTRAINT languages_uuid_unique_constraint UNIQUE (uuid)
);
GO
CREATE TRIGGER trg_languages_updated_at BEFORE UPDATE ON languages
FOR EACH ROW SET NEW.updated = (UTC_TIMESTAMP(3));
GO
CREATE TABLE localized_string_names (
    id BIGINT AUTO_INCREMENT NOT NULL,
    uuid CHAR(36) DEFAULT (UUID()) NOT NULL,
    created DATETIME(3) DEFAULT (UTC_TIMESTAMP(3)) NOT NULL,
    updated DATETIME(3) DEFAULT (UTC_TIMESTAMP(3)) NOT NULL,
    version BLOB DEFAULT (X'00') NOT NULL,
    name VARCHAR(128) NOT NULL,
    description TEXT NOT NULL,
    CONSTRAINT localized_string_names_primary_key PRIMARY KEY (id),
    CONSTRAINT localized_string_names_uuid_unique_constraint UNIQUE (uuid)
);
GO
CREATE TRIGGER trg_localized_string_names_updated_at BEFORE UPDATE ON localized_string_names
FOR EACH ROW SET NEW.updated = (UTC_TIMESTAMP(3));
GO
CREATE TABLE localized_strings (
    id BIGINT AUTO_INCREMENT NOT NULL,
    uuid CHAR(36) DEFAULT (UUID()) NOT NULL,
    created DATETIME(3) DEFAULT (UTC_TIMESTAMP(3)) NOT NULL,
    updated DATETIME(3) DEFAULT (UTC_TIMESTAMP(3)) NOT NULL,
    version BLOB DEFAULT (X'00') NOT NULL,
    localized_string_name_id BIGINT NOT NULL,
    language_id BIGINT NOT NULL,
    value TEXT NOT NULL,
    is_enabled TINYINT(1) DEFAULT 1 NOT NULL,
    is_deleted TINYINT(1) DEFAULT 0 NOT NULL,
    CONSTRAINT localized_strings_primary_key PRIMARY KEY (id),
    CONSTRAINT localized_strings_uuid_unique_constraint UNIQUE (uuid),
    CONSTRAINT localized_strings_localized_string_name_id_foreign_key FOREIGN KEY (localized_string_name_id) REFERENCES localized_string_names (id),
    CONSTRAINT localized_strings_language_id_foreign_key FOREIGN KEY (language_id) REFERENCES languages (id)
);
GO
CREATE TRIGGER trg_localized_strings_updated_at BEFORE UPDATE ON localized_strings
FOR EACH ROW SET NEW.updated = (UTC_TIMESTAMP(3));
GO
CREATE TABLE mime_types (
    id BIGINT AUTO_INCREMENT NOT NULL,
    uuid CHAR(36) DEFAULT (UUID()) NOT NULL,
    created DATETIME(3) DEFAULT (UTC_TIMESTAMP(3)) NOT NULL,
    updated DATETIME(3) DEFAULT (UTC_TIMESTAMP(3)) NOT NULL,
    version BLOB DEFAULT (X'00') NOT NULL,
    name VARCHAR(128) NOT NULL,
    description TEXT DEFAULT ('') NOT NULL,
    CONSTRAINT mime_types_primary_key PRIMARY KEY (id),
    CONSTRAINT mime_types_uuid_unique_constraint UNIQUE (uuid)
);
GO
CREATE TRIGGER trg_mime_types_updated_at BEFORE UPDATE ON mime_types
FOR EACH ROW SET NEW.updated = (UTC_TIMESTAMP(3));
GO
CREATE TABLE resources (
    id BIGINT AUTO_INCREMENT NOT NULL,
    uuid CHAR(36) DEFAULT (UUID()) NOT NULL,
    created DATETIME(3) DEFAULT (UTC_TIMESTAMP(3)) NOT NULL,
    updated DATETIME(3) DEFAULT (UTC_TIMESTAMP(3)) NOT NULL,
    version BLOB DEFAULT (X'00') NOT NULL,
    resource_name VARCHAR(128) NOT NULL,
    mime_type_id BIGINT NOT NULL,
    description TEXT NOT NULL,
    location VARCHAR(256) NOT NULL,
    is_enabled TINYINT(1) DEFAULT 1 NOT NULL,
    is_deleted TINYINT(1) DEFAULT 0 NOT NULL,
    CONSTRAINT resources_primary_key PRIMARY KEY (id),
    CONSTRAINT resources_uuid_unique_constraint UNIQUE (uuid),
    CONSTRAINT resources_mime_type_id_foreign_key FOREIGN KEY (mime_type_id) REFERENCES mime_types (id)
);
GO
CREATE TRIGGER trg_resources_updated_at BEFORE UPDATE ON resources
FOR EACH ROW SET NEW.updated = (UTC_TIMESTAMP(3));
GO
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
GO
CREATE TABLE categories (
    id BIGINT AUTO_INCREMENT NOT NULL,
    uuid CHAR(36) DEFAULT (UUID()) NOT NULL,
    created DATETIME(3) DEFAULT (UTC_TIMESTAMP(3)) NOT NULL,
    updated DATETIME(3) DEFAULT (UTC_TIMESTAMP(3)) NOT NULL,
    version BLOB DEFAULT (X'00') NOT NULL,
    category_id BIGINT,
    name VARCHAR(128) NOT NULL,
    description TEXT NOT NULL,
    is_enabled TINYINT(1) DEFAULT 1 NOT NULL,
    is_deleted TINYINT(1) DEFAULT 0 NOT NULL,
    CONSTRAINT categories_primary_key PRIMARY KEY (id),
    CONSTRAINT categories_uuid_unique_constraint UNIQUE (uuid),
    CONSTRAINT categories_category_id_foreign_key FOREIGN KEY (category_id) REFERENCES categories (id)
);
GO
CREATE UNIQUE INDEX categories_category_name_index ON categories (name);
GO
CREATE TRIGGER trg_categories_updated_at BEFORE UPDATE ON categories
FOR EACH ROW SET NEW.updated = (UTC_TIMESTAMP(3));
GO
CREATE TABLE game_parents (
    id BIGINT AUTO_INCREMENT NOT NULL,
    uuid CHAR(36) DEFAULT (UUID()) NOT NULL,
    created DATETIME(3) DEFAULT (UTC_TIMESTAMP(3)) NOT NULL,
    updated DATETIME(3) DEFAULT (UTC_TIMESTAMP(3)) NOT NULL,
    version BLOB DEFAULT (X'00') NOT NULL,
    name VARCHAR(128) NOT NULL,
    description TEXT NOT NULL,
    location VARCHAR(256) NOT NULL,
    is_enabled TINYINT(1) DEFAULT 1 NOT NULL,
    is_deleted TINYINT(1) DEFAULT 0 NOT NULL,
    CONSTRAINT game_parents_primary_key PRIMARY KEY (id),
    CONSTRAINT game_parents_uuid_unique_constraint UNIQUE (uuid)
);
GO
CREATE TRIGGER trg_game_parents_updated_at BEFORE UPDATE ON game_parents
FOR EACH ROW SET NEW.updated = (UTC_TIMESTAMP(3));
GO
CREATE TABLE game_parent_configs (
    id BIGINT AUTO_INCREMENT NOT NULL,
    uuid CHAR(36) DEFAULT (UUID()) NOT NULL,
    created DATETIME(3) DEFAULT (UTC_TIMESTAMP(3)) NOT NULL,
    updated DATETIME(3) DEFAULT (UTC_TIMESTAMP(3)) NOT NULL,
    version BLOB DEFAULT (X'00') NOT NULL,
    game_parent_id BIGINT NOT NULL,
    name VARCHAR(128) NOT NULL,
    value TEXT NOT NULL,
    CONSTRAINT game_parent_configs_primary_key PRIMARY KEY (id),
    CONSTRAINT game_parent_configs_uuid_unique_constraint UNIQUE (uuid),
    CONSTRAINT game_parent_configs_game_parent_id_foreign_key FOREIGN KEY (game_parent_id) REFERENCES game_parents (id)
);
GO
CREATE TRIGGER trg_game_parent_configs_updated_at BEFORE UPDATE ON game_parent_configs
FOR EACH ROW SET NEW.updated = (UTC_TIMESTAMP(3));
GO
CREATE TABLE games (
    id BIGINT AUTO_INCREMENT NOT NULL,
    uuid CHAR(36) DEFAULT (UUID()) NOT NULL,
    created DATETIME(3) DEFAULT (UTC_TIMESTAMP(3)) NOT NULL,
    updated DATETIME(3) DEFAULT (UTC_TIMESTAMP(3)) NOT NULL,
    version BLOB DEFAULT (X'00') NOT NULL,
    name VARCHAR(128) NOT NULL,
    description TEXT NOT NULL,
    game_parent_id BIGINT NOT NULL,
    is_deleted TINYINT(1) DEFAULT 0 NOT NULL,
    is_enabled TINYINT(1) DEFAULT 1 NOT NULL,
    CONSTRAINT games_primary_key PRIMARY KEY (id),
    CONSTRAINT games_uuid_unique_constraint UNIQUE (uuid),
    CONSTRAINT games_game_parent_id_foreign_key FOREIGN KEY (game_parent_id) REFERENCES game_parents (id)
);
GO
CREATE UNIQUE INDEX games_game_base_name_index ON games (name);
GO
CREATE TRIGGER trg_games_updated_at BEFORE UPDATE ON games
FOR EACH ROW SET NEW.updated = (UTC_TIMESTAMP(3));
GO
CREATE TABLE game_categories (
    id BIGINT AUTO_INCREMENT NOT NULL,
    uuid CHAR(36) DEFAULT (UUID()) NOT NULL,
    created DATETIME(3) DEFAULT (UTC_TIMESTAMP(3)) NOT NULL,
    updated DATETIME(3) DEFAULT (UTC_TIMESTAMP(3)) NOT NULL,
    version BLOB DEFAULT (X'00') NOT NULL,
    game_id BIGINT NOT NULL,
    category_id BIGINT NOT NULL,
    CONSTRAINT game_categories_primary_key PRIMARY KEY (id),
    CONSTRAINT game_categories_uuid_unique_constraint UNIQUE (uuid),
    CONSTRAINT game_categories_game_id_foreign_key FOREIGN KEY (game_id) REFERENCES games (id),
    CONSTRAINT game_categories_category_id_foreign_key FOREIGN KEY (category_id) REFERENCES categories (id)
);
GO
CREATE UNIQUE INDEX game_categories_game_category_game_id_category_id_index ON game_categories (game_id, category_id);
GO
CREATE TRIGGER trg_game_categories_updated_at BEFORE UPDATE ON game_categories
FOR EACH ROW SET NEW.updated = (UTC_TIMESTAMP(3));
GO
CREATE TABLE game_parent_categories (
    id BIGINT AUTO_INCREMENT NOT NULL,
    uuid CHAR(36) DEFAULT (UUID()) NOT NULL,
    created DATETIME(3) DEFAULT (UTC_TIMESTAMP(3)) NOT NULL,
    updated DATETIME(3) DEFAULT (UTC_TIMESTAMP(3)) NOT NULL,
    version BLOB DEFAULT (X'00') NOT NULL,
    game_parent_id BIGINT NOT NULL,
    category_id BIGINT NOT NULL,
    CONSTRAINT game_parent_categories_primary_key PRIMARY KEY (id),
    CONSTRAINT game_parent_categories_uuid_unique_constraint UNIQUE (uuid),
    CONSTRAINT game_parent_categories_game_parent_id_foreign_key FOREIGN KEY (game_parent_id) REFERENCES game_parents (id),
    CONSTRAINT game_parent_categories_category_id_foreign_key FOREIGN KEY (category_id) REFERENCES categories (id)
);
GO
CREATE UNIQUE INDEX game_parent_categories_game_parent_category_game_parent_id_category_id_index ON game_parent_categories (game_parent_id, category_id);
GO
CREATE TRIGGER trg_game_parent_categories_updated_at BEFORE UPDATE ON game_parent_categories
FOR EACH ROW SET NEW.updated = (UTC_TIMESTAMP(3));
GO
CREATE TABLE game_plays (
    id BIGINT AUTO_INCREMENT NOT NULL,
    uuid CHAR(36) DEFAULT (UUID()) NOT NULL,
    created DATETIME(3) DEFAULT (UTC_TIMESTAMP(3)) NOT NULL,
    updated DATETIME(3) DEFAULT (UTC_TIMESTAMP(3)) NOT NULL,
    version BLOB DEFAULT (X'00') NOT NULL,
    game_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    finished DATETIME(3),
    CONSTRAINT game_plays_primary_key PRIMARY KEY (id),
    CONSTRAINT game_plays_uuid_unique_constraint UNIQUE (uuid),
    CONSTRAINT game_plays_game_id_foreign_key FOREIGN KEY (game_id) REFERENCES games (id),
    CONSTRAINT game_plays_user_id_foreign_key FOREIGN KEY (user_id) REFERENCES users (id)
);
GO
CREATE TRIGGER trg_game_plays_updated_at BEFORE UPDATE ON game_plays
FOR EACH ROW SET NEW.updated = (UTC_TIMESTAMP(3));
GO
CREATE TABLE game_play_users (
    id BIGINT AUTO_INCREMENT NOT NULL,
    uuid CHAR(36) DEFAULT (UUID()) NOT NULL,
    created DATETIME(3) DEFAULT (UTC_TIMESTAMP(3)) NOT NULL,
    updated DATETIME(3) DEFAULT (UTC_TIMESTAMP(3)) NOT NULL,
    version BLOB DEFAULT (X'00') NOT NULL,
    game_play_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    CONSTRAINT game_play_users_primary_key PRIMARY KEY (id),
    CONSTRAINT game_play_users_uuid_unique_constraint UNIQUE (uuid),
    CONSTRAINT game_play_users_game_play_id_foreign_key FOREIGN KEY (game_play_id) REFERENCES game_plays (id),
    CONSTRAINT game_play_users_user_id_foreign_key FOREIGN KEY (user_id) REFERENCES users (id)
);
GO
CREATE UNIQUE INDEX game_play_users_game_play_users_game_play_id_user_id_index ON game_play_users (game_play_id, user_id);
GO
CREATE TRIGGER trg_game_play_users_updated_at BEFORE UPDATE ON game_play_users
FOR EACH ROW SET NEW.updated = (UTC_TIMESTAMP(3));
GO
CREATE TABLE game_play_states (
    id BIGINT AUTO_INCREMENT NOT NULL,
    uuid CHAR(36) DEFAULT (UUID()) NOT NULL,
    created DATETIME(3) DEFAULT (UTC_TIMESTAMP(3)) NOT NULL,
    updated DATETIME(3) DEFAULT (UTC_TIMESTAMP(3)) NOT NULL,
    version BLOB DEFAULT (X'00') NOT NULL,
    game_play_id BIGINT NOT NULL,
    state_change TEXT NOT NULL,
    CONSTRAINT game_play_states_primary_key PRIMARY KEY (id),
    CONSTRAINT game_play_states_uuid_unique_constraint UNIQUE (uuid),
    CONSTRAINT game_play_states_game_play_id_foreign_key FOREIGN KEY (game_play_id) REFERENCES game_plays (id)
);
GO
CREATE INDEX game_play_states_game_play_state_game_play_id_index ON game_play_states (game_play_id);
GO
CREATE TRIGGER trg_game_play_states_updated_at BEFORE UPDATE ON game_play_states
FOR EACH ROW SET NEW.updated = (UTC_TIMESTAMP(3));
GO
CREATE TABLE game_play_actions (
    id BIGINT AUTO_INCREMENT NOT NULL,
    uuid CHAR(36) DEFAULT (UUID()) NOT NULL,
    created DATETIME(3) DEFAULT (UTC_TIMESTAMP(3)) NOT NULL,
    updated DATETIME(3) DEFAULT (UTC_TIMESTAMP(3)) NOT NULL,
    version BLOB DEFAULT (X'00') NOT NULL,
    game_play_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    action TEXT NOT NULL,
    CONSTRAINT game_play_actions_primary_key PRIMARY KEY (id),
    CONSTRAINT game_play_actions_uuid_unique_constraint UNIQUE (uuid),
    CONSTRAINT game_play_actions_game_play_id_foreign_key FOREIGN KEY (game_play_id) REFERENCES game_plays (id),
    CONSTRAINT game_play_actions_user_id_foreign_key FOREIGN KEY (user_id) REFERENCES users (id)
);
GO
CREATE INDEX game_play_actions_game_play_action_game_play_id_index ON game_play_actions (game_play_id);
GO
CREATE TRIGGER trg_game_play_actions_updated_at BEFORE UPDATE ON game_play_actions
FOR EACH ROW SET NEW.updated = (UTC_TIMESTAMP(3));
GO
CREATE TABLE game_parent_settings (
    id BIGINT AUTO_INCREMENT NOT NULL,
    uuid CHAR(36) DEFAULT (UUID()) NOT NULL,
    created DATETIME(3) DEFAULT (UTC_TIMESTAMP(3)) NOT NULL,
    updated DATETIME(3) DEFAULT (UTC_TIMESTAMP(3)) NOT NULL,
    version BLOB DEFAULT (X'00') NOT NULL,
    game_parent_id BIGINT NOT NULL,
    name VARCHAR(128) NOT NULL,
    value TEXT NOT NULL,
    CONSTRAINT game_parent_settings_primary_key PRIMARY KEY (id),
    CONSTRAINT game_parent_settings_uuid_unique_constraint UNIQUE (uuid),
    CONSTRAINT game_parent_settings_game_parent_id_foreign_key FOREIGN KEY (game_parent_id) REFERENCES game_parents (id)
);
GO
CREATE UNIQUE INDEX game_parent_settings_game_parent_setting_game_parent_id_name_index ON game_parent_settings (game_parent_id, name);
GO
CREATE TRIGGER trg_game_parent_settings_updated_at BEFORE UPDATE ON game_parent_settings
FOR EACH ROW SET NEW.updated = (UTC_TIMESTAMP(3));
GO
CREATE TABLE game_settings (
    id BIGINT AUTO_INCREMENT NOT NULL,
    uuid CHAR(36) DEFAULT (UUID()) NOT NULL,
    created DATETIME(3) DEFAULT (UTC_TIMESTAMP(3)) NOT NULL,
    updated DATETIME(3) DEFAULT (UTC_TIMESTAMP(3)) NOT NULL,
    version BLOB DEFAULT (X'00') NOT NULL,
    game_id BIGINT NOT NULL,
    name VARCHAR(128) NOT NULL,
    value TEXT NOT NULL,
    CONSTRAINT game_settings_primary_key PRIMARY KEY (id),
    CONSTRAINT game_settings_uuid_unique_constraint UNIQUE (uuid),
    CONSTRAINT game_settings_game_id_foreign_key FOREIGN KEY (game_id) REFERENCES games (id)
);
GO
CREATE UNIQUE INDEX game_settings_game_setting_game_id_name_index ON game_settings (game_id, name);
GO
CREATE TRIGGER trg_game_settings_updated_at BEFORE UPDATE ON game_settings
FOR EACH ROW SET NEW.updated = (UTC_TIMESTAMP(3));
GO
CREATE TABLE game_attributes (
    id BIGINT AUTO_INCREMENT NOT NULL,
    uuid CHAR(36) DEFAULT (UUID()) NOT NULL,
    created DATETIME(3) DEFAULT (UTC_TIMESTAMP(3)) NOT NULL,
    updated DATETIME(3) DEFAULT (UTC_TIMESTAMP(3)) NOT NULL,
    version BLOB DEFAULT (X'00') NOT NULL,
    game_id BIGINT NOT NULL,
    name VARCHAR(128) NOT NULL,
    value TEXT NOT NULL,
    CONSTRAINT game_attributes_primary_key PRIMARY KEY (id),
    CONSTRAINT game_attributes_uuid_unique_constraint UNIQUE (uuid),
    CONSTRAINT game_attributes_game_id_foreign_key FOREIGN KEY (game_id) REFERENCES games (id)
);
GO
CREATE UNIQUE INDEX game_attributes_game_attribute_game_id_name_index ON game_attributes (game_id, name);
GO
CREATE TRIGGER trg_game_attributes_updated_at BEFORE UPDATE ON game_attributes
FOR EACH ROW SET NEW.updated = (UTC_TIMESTAMP(3));
GO
CREATE TABLE game_reviews (
    id BIGINT AUTO_INCREMENT NOT NULL,
    uuid CHAR(36) DEFAULT (UUID()) NOT NULL,
    created DATETIME(3) DEFAULT (UTC_TIMESTAMP(3)) NOT NULL,
    updated DATETIME(3) DEFAULT (UTC_TIMESTAMP(3)) NOT NULL,
    version BLOB DEFAULT (X'00') NOT NULL,
    game_id BIGINT NOT NULL,
    review_id BIGINT NOT NULL,
    CONSTRAINT game_reviews_primary_key PRIMARY KEY (id),
    CONSTRAINT game_reviews_uuid_unique_constraint UNIQUE (uuid),
    CONSTRAINT game_reviews_game_id_foreign_key FOREIGN KEY (game_id) REFERENCES games (id),
    CONSTRAINT game_reviews_review_id_foreign_key FOREIGN KEY (review_id) REFERENCES reviews (id)
);
GO
CREATE TRIGGER trg_game_reviews_updated_at BEFORE UPDATE ON game_reviews
FOR EACH ROW SET NEW.updated = (UTC_TIMESTAMP(3));
GO
CREATE TABLE uri_types (
    id BIGINT AUTO_INCREMENT NOT NULL,
    uuid CHAR(36) DEFAULT (UUID()) NOT NULL,
    created DATETIME(3) DEFAULT (UTC_TIMESTAMP(3)) NOT NULL,
    updated DATETIME(3) DEFAULT (UTC_TIMESTAMP(3)) NOT NULL,
    version BLOB DEFAULT (X'00') NOT NULL,
    name VARCHAR(256) NOT NULL,
    description TEXT,
    CONSTRAINT uri_types_primary_key PRIMARY KEY (id),
    CONSTRAINT uri_types_uuid_unique_constraint UNIQUE (uuid)
);
GO
CREATE TRIGGER trg_uri_types_updated_at BEFORE UPDATE ON uri_types
FOR EACH ROW SET NEW.updated = (UTC_TIMESTAMP(3));
GO
CREATE TABLE uris_bases (
    id BIGINT AUTO_INCREMENT NOT NULL,
    uuid CHAR(36) DEFAULT (UUID()) NOT NULL,
    created DATETIME(3) DEFAULT (UTC_TIMESTAMP(3)) NOT NULL,
    updated DATETIME(3) DEFAULT (UTC_TIMESTAMP(3)) NOT NULL,
    version BLOB DEFAULT (X'00') NOT NULL,
    uri_type_id BIGINT NOT NULL,
    location TEXT NOT NULL,
    is_public TINYINT(1) DEFAULT 0 NOT NULL,
    is_enabled TINYINT(1) DEFAULT 1 NOT NULL,
    is_deleted TINYINT(1) DEFAULT 0 NOT NULL,
    CONSTRAINT uris_bases_primary_key PRIMARY KEY (id),
    CONSTRAINT uris_bases_uuid_unique_constraint UNIQUE (uuid),
    CONSTRAINT uris_bases_uri_type_id_foreign_key FOREIGN KEY (uri_type_id) REFERENCES uri_types (id)
);
GO
CREATE TRIGGER trg_uris_bases_updated_at BEFORE UPDATE ON uris_bases
FOR EACH ROW SET NEW.updated = (UTC_TIMESTAMP(3));
GO
CREATE TABLE application_types (
    id BIGINT AUTO_INCREMENT NOT NULL,
    uuid CHAR(36) DEFAULT (UUID()) NOT NULL,
    created DATETIME(3) DEFAULT (UTC_TIMESTAMP(3)) NOT NULL,
    updated DATETIME(3) DEFAULT (UTC_TIMESTAMP(3)) NOT NULL,
    version BLOB DEFAULT (X'00') NOT NULL,
    name VARCHAR(256) NOT NULL,
    description TEXT,
    CONSTRAINT application_types_primary_key PRIMARY KEY (id),
    CONSTRAINT application_types_uuid_unique_constraint UNIQUE (uuid)
);
GO
CREATE TRIGGER trg_application_types_updated_at BEFORE UPDATE ON application_types
FOR EACH ROW SET NEW.updated = (UTC_TIMESTAMP(3));
GO
CREATE TABLE application_visibilities (
    id BIGINT AUTO_INCREMENT NOT NULL,
    uuid CHAR(36) DEFAULT (UUID()) NOT NULL,
    created DATETIME(3) DEFAULT (UTC_TIMESTAMP(3)) NOT NULL,
    updated DATETIME(3) DEFAULT (UTC_TIMESTAMP(3)) NOT NULL,
    version BLOB DEFAULT (X'00') NOT NULL,
    name VARCHAR(512) NOT NULL,
    description TEXT,
    CONSTRAINT application_visibilities_primary_key PRIMARY KEY (id),
    CONSTRAINT application_visibilities_uuid_unique_constraint UNIQUE (uuid)
);
GO
CREATE TRIGGER trg_application_visibilities_updated_at BEFORE UPDATE ON application_visibilities
FOR EACH ROW SET NEW.updated = (UTC_TIMESTAMP(3));
GO
CREATE TABLE applications (
    id BIGINT AUTO_INCREMENT NOT NULL,
    uuid CHAR(36) DEFAULT (UUID()) NOT NULL,
    created DATETIME(3) DEFAULT (UTC_TIMESTAMP(3)) NOT NULL,
    updated DATETIME(3) DEFAULT (UTC_TIMESTAMP(3)) NOT NULL,
    version BLOB DEFAULT (X'00') NOT NULL,
    name VARCHAR(512) NOT NULL,
    application_type_id BIGINT NOT NULL,
    application_visibility_id BIGINT NOT NULL,
    client_id VARCHAR(512) NOT NULL,
    description TEXT,
    is_enabled TINYINT(1) DEFAULT 1 NOT NULL,
    is_deleted TINYINT(1) DEFAULT 0 NOT NULL,
    is_builtin TINYINT(1) DEFAULT 0 NOT NULL,
    CONSTRAINT applications_primary_key PRIMARY KEY (id),
    CONSTRAINT applications_uuid_unique_constraint UNIQUE (uuid),
    CONSTRAINT applications_application_type_id_foreign_key FOREIGN KEY (application_type_id) REFERENCES application_types (id),
    CONSTRAINT applications_application_visibility_id_foreign_key FOREIGN KEY (application_visibility_id) REFERENCES application_visibilities (id)
);
GO
CREATE TRIGGER trg_applications_updated_at BEFORE UPDATE ON applications
FOR EACH ROW SET NEW.updated = (UTC_TIMESTAMP(3));
GO
CREATE TABLE application_settings (
    id BIGINT AUTO_INCREMENT NOT NULL,
    uuid CHAR(36) DEFAULT (UUID()) NOT NULL,
    created DATETIME(3) DEFAULT (UTC_TIMESTAMP(3)) NOT NULL,
    updated DATETIME(3) DEFAULT (UTC_TIMESTAMP(3)) NOT NULL,
    version BLOB DEFAULT (X'00') NOT NULL,
    application_id BIGINT NOT NULL,
    name VARCHAR(256) NOT NULL,
    value TEXT NOT NULL,
    CONSTRAINT application_settings_primary_key PRIMARY KEY (id),
    CONSTRAINT application_settings_uuid_unique_constraint UNIQUE (uuid),
    CONSTRAINT application_settings_application_id_foreign_key FOREIGN KEY (application_id) REFERENCES applications (id)
);
GO
CREATE TRIGGER trg_application_settings_updated_at BEFORE UPDATE ON application_settings
FOR EACH ROW SET NEW.updated = (UTC_TIMESTAMP(3));
GO
CREATE TABLE application_uris (
    id BIGINT AUTO_INCREMENT NOT NULL,
    uuid CHAR(36) DEFAULT (UUID()) NOT NULL,
    created DATETIME(3) DEFAULT (UTC_TIMESTAMP(3)) NOT NULL,
    updated DATETIME(3) DEFAULT (UTC_TIMESTAMP(3)) NOT NULL,
    version BLOB DEFAULT (X'00') NOT NULL,
    application_id BIGINT NOT NULL,
    uri_id BIGINT NOT NULL,
    CONSTRAINT application_uris_primary_key PRIMARY KEY (id),
    CONSTRAINT application_uris_uuid_unique_constraint UNIQUE (uuid),
    CONSTRAINT application_uris_application_id_foreign_key FOREIGN KEY (application_id) REFERENCES applications (id),
    CONSTRAINT application_uris_uri_id_foreign_key FOREIGN KEY (uri_id) REFERENCES uris_bases (id)
);
GO
CREATE TRIGGER trg_application_uris_updated_at BEFORE UPDATE ON application_uris
FOR EACH ROW SET NEW.updated = (UTC_TIMESTAMP(3));
GO
CREATE TABLE application_users (
    id BIGINT AUTO_INCREMENT NOT NULL,
    uuid CHAR(36) DEFAULT (UUID()) NOT NULL,
    created DATETIME(3) DEFAULT (UTC_TIMESTAMP(3)) NOT NULL,
    updated DATETIME(3) DEFAULT (UTC_TIMESTAMP(3)) NOT NULL,
    version BLOB DEFAULT (X'00') NOT NULL,
    application_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    CONSTRAINT application_users_primary_key PRIMARY KEY (id),
    CONSTRAINT application_users_uuid_unique_constraint UNIQUE (uuid),
    CONSTRAINT application_users_application_id_foreign_key FOREIGN KEY (application_id) REFERENCES applications (id),
    CONSTRAINT application_users_user_id_foreign_key FOREIGN KEY (user_id) REFERENCES users (id)
);
GO
CREATE TRIGGER trg_application_users_updated_at BEFORE UPDATE ON application_users
FOR EACH ROW SET NEW.updated = (UTC_TIMESTAMP(3));
GO
CREATE TABLE services (
    id BIGINT AUTO_INCREMENT NOT NULL,
    uuid CHAR(36) DEFAULT (UUID()) NOT NULL,
    created DATETIME(3) DEFAULT (UTC_TIMESTAMP(3)) NOT NULL,
    updated DATETIME(3) DEFAULT (UTC_TIMESTAMP(3)) NOT NULL,
    version BLOB DEFAULT (X'00') NOT NULL,
    name VARCHAR(512) NOT NULL,
    description TEXT,
    CONSTRAINT services_primary_key PRIMARY KEY (id),
    CONSTRAINT services_uuid_unique_constraint UNIQUE (uuid)
);
GO
CREATE TRIGGER trg_services_updated_at BEFORE UPDATE ON services
FOR EACH ROW SET NEW.updated = (UTC_TIMESTAMP(3));
GO
CREATE TABLE application_services (
    id BIGINT AUTO_INCREMENT NOT NULL,
    uuid CHAR(36) DEFAULT (UUID()) NOT NULL,
    created DATETIME(3) DEFAULT (UTC_TIMESTAMP(3)) NOT NULL,
    updated DATETIME(3) DEFAULT (UTC_TIMESTAMP(3)) NOT NULL,
    version BLOB DEFAULT (X'00') NOT NULL,
    application_id BIGINT NOT NULL,
    service_id BIGINT NOT NULL,
    CONSTRAINT application_services_primary_key PRIMARY KEY (id),
    CONSTRAINT application_services_uuid_unique_constraint UNIQUE (uuid),
    CONSTRAINT application_services_application_id_foreign_key FOREIGN KEY (application_id) REFERENCES applications (id),
    CONSTRAINT application_services_service_id_foreign_key FOREIGN KEY (service_id) REFERENCES services (id)
);
GO
CREATE TRIGGER trg_application_services_updated_at BEFORE UPDATE ON application_services
FOR EACH ROW SET NEW.updated = (UTC_TIMESTAMP(3));
GO
CREATE TABLE service_uris (
    id BIGINT AUTO_INCREMENT NOT NULL,
    uuid CHAR(36) DEFAULT (UUID()) NOT NULL,
    created DATETIME(3) DEFAULT (UTC_TIMESTAMP(3)) NOT NULL,
    updated DATETIME(3) DEFAULT (UTC_TIMESTAMP(3)) NOT NULL,
    version BLOB DEFAULT (X'00') NOT NULL,
    service_id BIGINT NOT NULL,
    uri_id BIGINT NOT NULL,
    CONSTRAINT service_uris_primary_key PRIMARY KEY (id),
    CONSTRAINT service_uris_uuid_unique_constraint UNIQUE (uuid),
    CONSTRAINT service_uris_service_id_foreign_key FOREIGN KEY (service_id) REFERENCES services (id),
    CONSTRAINT service_uris_uri_id_foreign_key FOREIGN KEY (uri_id) REFERENCES uris_bases (id)
);
GO
CREATE TRIGGER trg_service_uris_updated_at BEFORE UPDATE ON service_uris
FOR EACH ROW SET NEW.updated = (UTC_TIMESTAMP(3));
GO
CREATE TABLE service_settings (
    id BIGINT AUTO_INCREMENT NOT NULL,
    uuid CHAR(36) DEFAULT (UUID()) NOT NULL,
    created DATETIME(3) DEFAULT (UTC_TIMESTAMP(3)) NOT NULL,
    updated DATETIME(3) DEFAULT (UTC_TIMESTAMP(3)) NOT NULL,
    version BLOB DEFAULT (X'00') NOT NULL,
    service_id BIGINT NOT NULL,
    name VARCHAR(512) NOT NULL,
    value TEXT NOT NULL,
    CONSTRAINT service_settings_primary_key PRIMARY KEY (id),
    CONSTRAINT service_settings_uuid_unique_constraint UNIQUE (uuid),
    CONSTRAINT service_settings_service_id_foreign_key FOREIGN KEY (service_id) REFERENCES services (id)
);
GO
CREATE TRIGGER trg_service_settings_updated_at BEFORE UPDATE ON service_settings
FOR EACH ROW SET NEW.updated = (UTC_TIMESTAMP(3));
GO
CREATE TABLE oauth_grant_types (
    id BIGINT AUTO_INCREMENT NOT NULL,
    uuid CHAR(36) DEFAULT (UUID()) NOT NULL,
    created DATETIME(3) DEFAULT (UTC_TIMESTAMP(3)) NOT NULL,
    updated DATETIME(3) DEFAULT (UTC_TIMESTAMP(3)) NOT NULL,
    version BLOB DEFAULT (X'00') NOT NULL,
    name VARCHAR(256) NOT NULL,
    description VARCHAR(512) NOT NULL,
    is_custom TINYINT(1) DEFAULT 0 NOT NULL,
    is_enabled TINYINT(1) DEFAULT 1 NOT NULL,
    is_legacy TINYINT(1) DEFAULT 0 NOT NULL,
    CONSTRAINT oauth_grant_types_primary_key PRIMARY KEY (id),
    CONSTRAINT oauth_grant_types_uuid_unique_constraint UNIQUE (uuid)
);
GO
CREATE TRIGGER trg_oauth_grant_types_updated_at BEFORE UPDATE ON oauth_grant_types
FOR EACH ROW SET NEW.updated = (UTC_TIMESTAMP(3));
GO
CREATE TABLE secret_types (
    id BIGINT AUTO_INCREMENT NOT NULL,
    uuid CHAR(36) DEFAULT (UUID()) NOT NULL,
    created DATETIME(3) DEFAULT (UTC_TIMESTAMP(3)) NOT NULL,
    updated DATETIME(3) DEFAULT (UTC_TIMESTAMP(3)) NOT NULL,
    version BLOB DEFAULT (X'00') NOT NULL,
    name VARCHAR(512) NOT NULL,
    description TEXT,
    CONSTRAINT secret_types_primary_key PRIMARY KEY (id),
    CONSTRAINT secret_types_uuid_unique_constraint UNIQUE (uuid)
);
GO
CREATE TRIGGER trg_secret_types_updated_at BEFORE UPDATE ON secret_types
FOR EACH ROW SET NEW.updated = (UTC_TIMESTAMP(3));
GO
CREATE TABLE secrets (
    id BIGINT AUTO_INCREMENT NOT NULL,
    uuid CHAR(36) DEFAULT (UUID()) NOT NULL,
    created DATETIME(3) DEFAULT (UTC_TIMESTAMP(3)) NOT NULL,
    updated DATETIME(3) DEFAULT (UTC_TIMESTAMP(3)) NOT NULL,
    version BLOB DEFAULT (X'00') NOT NULL,
    secret_type_id BIGINT NOT NULL,
    value VARCHAR(512) NOT NULL,
    expires DATETIME(3),
    is_enabled TINYINT(1) DEFAULT 1 NOT NULL,
    is_deleted TINYINT(1) DEFAULT 0 NOT NULL,
    CONSTRAINT secrets_primary_key PRIMARY KEY (id),
    CONSTRAINT secrets_uuid_unique_constraint UNIQUE (uuid),
    CONSTRAINT secrets_secret_type_id_foreign_key FOREIGN KEY (secret_type_id) REFERENCES secret_types (id)
);
GO
CREATE TRIGGER trg_secrets_updated_at BEFORE UPDATE ON secrets
FOR EACH ROW SET NEW.updated = (UTC_TIMESTAMP(3));
GO
CREATE TABLE user_secrets (
    id BIGINT AUTO_INCREMENT NOT NULL,
    uuid CHAR(36) DEFAULT (UUID()) NOT NULL,
    created DATETIME(3) DEFAULT (UTC_TIMESTAMP(3)) NOT NULL,
    updated DATETIME(3) DEFAULT (UTC_TIMESTAMP(3)) NOT NULL,
    version BLOB DEFAULT (X'00') NOT NULL,
    user_id BIGINT NOT NULL,
    secret_id BIGINT NOT NULL,
    CONSTRAINT user_secrets_primary_key PRIMARY KEY (id),
    CONSTRAINT user_secrets_uuid_unique_constraint UNIQUE (uuid),
    CONSTRAINT user_secrets_user_id_foreign_key FOREIGN KEY (user_id) REFERENCES users (id),
    CONSTRAINT user_secrets_secret_id_foreign_key FOREIGN KEY (secret_id) REFERENCES secrets (id)
);
GO
CREATE TRIGGER trg_user_secrets_updated_at BEFORE UPDATE ON user_secrets
FOR EACH ROW SET NEW.updated = (UTC_TIMESTAMP(3));
GO
CREATE TABLE token_types (
    id BIGINT AUTO_INCREMENT NOT NULL,
    uuid CHAR(36) DEFAULT (UUID()) NOT NULL,
    created DATETIME(3) DEFAULT (UTC_TIMESTAMP(3)) NOT NULL,
    updated DATETIME(3) DEFAULT (UTC_TIMESTAMP(3)) NOT NULL,
    version BLOB DEFAULT (X'00') NOT NULL,
    name VARCHAR(512) NOT NULL,
    description TEXT NOT NULL,
    CONSTRAINT token_types_primary_key PRIMARY KEY (id),
    CONSTRAINT token_types_uuid_unique_constraint UNIQUE (uuid)
);
GO
CREATE TRIGGER trg_token_types_updated_at BEFORE UPDATE ON token_types
FOR EACH ROW SET NEW.updated = (UTC_TIMESTAMP(3));
GO
CREATE TABLE tokens (
    id BIGINT AUTO_INCREMENT NOT NULL,
    uuid CHAR(36) DEFAULT (UUID()) NOT NULL,
    created DATETIME(3) DEFAULT (UTC_TIMESTAMP(3)) NOT NULL,
    updated DATETIME(3) DEFAULT (UTC_TIMESTAMP(3)) NOT NULL,
    version BLOB DEFAULT (X'00') NOT NULL,
    token_type_id BIGINT NOT NULL,
    name VARCHAR(128) NOT NULL,
    secret TEXT NOT NULL,
    is_enabled TINYINT(1) DEFAULT 1 NOT NULL,
    expires DATETIME(3) NOT NULL,
    revoked DATETIME(3),
    is_deleted TINYINT(1) DEFAULT 0 NOT NULL,
    CONSTRAINT tokens_primary_key PRIMARY KEY (id),
    CONSTRAINT tokens_uuid_unique_constraint UNIQUE (uuid),
    CONSTRAINT tokens_token_type_id_foreign_key FOREIGN KEY (token_type_id) REFERENCES token_types (id)
);
GO
CREATE TRIGGER trg_tokens_updated_at BEFORE UPDATE ON tokens
FOR EACH ROW SET NEW.updated = (UTC_TIMESTAMP(3));
GO
CREATE TABLE user_tokens (
    id BIGINT AUTO_INCREMENT NOT NULL,
    uuid CHAR(36) DEFAULT (UUID()) NOT NULL,
    created DATETIME(3) DEFAULT (UTC_TIMESTAMP(3)) NOT NULL,
    updated DATETIME(3) DEFAULT (UTC_TIMESTAMP(3)) NOT NULL,
    version BLOB DEFAULT (X'00') NOT NULL,
    user_id BIGINT NOT NULL,
    token_id BIGINT NOT NULL,
    CONSTRAINT user_tokens_primary_key PRIMARY KEY (id),
    CONSTRAINT user_tokens_uuid_unique_constraint UNIQUE (uuid),
    CONSTRAINT user_tokens_user_id_foreign_key FOREIGN KEY (user_id) REFERENCES users (id),
    CONSTRAINT user_tokens_token_id_foreign_key FOREIGN KEY (token_id) REFERENCES tokens (id)
);
GO
CREATE TRIGGER trg_user_tokens_updated_at BEFORE UPDATE ON user_tokens
FOR EACH ROW SET NEW.updated = (UTC_TIMESTAMP(3));
GO
CREATE TABLE authentication_methods (
    id BIGINT AUTO_INCREMENT NOT NULL,
    uuid CHAR(36) DEFAULT (UUID()) NOT NULL,
    created DATETIME(3) DEFAULT (UTC_TIMESTAMP(3)) NOT NULL,
    updated DATETIME(3) DEFAULT (UTC_TIMESTAMP(3)) NOT NULL,
    version BLOB DEFAULT (X'00') NOT NULL,
    name VARCHAR(256) NOT NULL,
    description VARCHAR(256),
    is_default TINYINT(1) DEFAULT 1 NOT NULL,
    is_enabled TINYINT(1) DEFAULT 1 NOT NULL,
    CONSTRAINT authentication_methods_primary_key PRIMARY KEY (id),
    CONSTRAINT authentication_methods_uuid_unique_constraint UNIQUE (uuid)
);
GO
CREATE TRIGGER trg_authentication_methods_updated_at BEFORE UPDATE ON authentication_methods
FOR EACH ROW SET NEW.updated = (UTC_TIMESTAMP(3));
GO
CREATE TABLE identity_provider_types (
    id BIGINT AUTO_INCREMENT NOT NULL,
    uuid CHAR(36) DEFAULT (UUID()) NOT NULL,
    created DATETIME(3) DEFAULT (UTC_TIMESTAMP(3)) NOT NULL,
    updated DATETIME(3) DEFAULT (UTC_TIMESTAMP(3)) NOT NULL,
    version BLOB DEFAULT (X'00') NOT NULL,
    name VARCHAR(256) NOT NULL,
    description TEXT,
    CONSTRAINT identity_provider_types_primary_key PRIMARY KEY (id),
    CONSTRAINT identity_provider_types_uuid_unique_constraint UNIQUE (uuid)
);
GO
CREATE TRIGGER trg_identity_provider_types_updated_at BEFORE UPDATE ON identity_provider_types
FOR EACH ROW SET NEW.updated = (UTC_TIMESTAMP(3));
GO
CREATE TABLE identity_providers (
    id BIGINT AUTO_INCREMENT NOT NULL,
    uuid CHAR(36) DEFAULT (UUID()) NOT NULL,
    created DATETIME(3) DEFAULT (UTC_TIMESTAMP(3)) NOT NULL,
    updated DATETIME(3) DEFAULT (UTC_TIMESTAMP(3)) NOT NULL,
    version BLOB DEFAULT (X'00') NOT NULL,
    identity_provider_type_id BIGINT NOT NULL,
    name VARCHAR(256) NOT NULL,
    description TEXT,
    is_enabled TINYINT(1) DEFAULT 1 NOT NULL,
    is_builtin TINYINT(1) DEFAULT 0 NOT NULL,
    is_deleted TINYINT(1) DEFAULT 0 NOT NULL,
    CONSTRAINT identity_providers_primary_key PRIMARY KEY (id),
    CONSTRAINT identity_providers_uuid_unique_constraint UNIQUE (uuid),
    CONSTRAINT identity_providers_identity_provider_type_id_foreign_key FOREIGN KEY (identity_provider_type_id) REFERENCES identity_provider_types (id)
);
GO
CREATE UNIQUE INDEX identity_providers_name_index ON identity_providers (name);
GO
CREATE TRIGGER trg_identity_providers_updated_at BEFORE UPDATE ON identity_providers
FOR EACH ROW SET NEW.updated = (UTC_TIMESTAMP(3));
GO
CREATE TABLE identity_provider_settings (
    id BIGINT AUTO_INCREMENT NOT NULL,
    uuid CHAR(36) DEFAULT (UUID()) NOT NULL,
    created DATETIME(3) DEFAULT (UTC_TIMESTAMP(3)) NOT NULL,
    updated DATETIME(3) DEFAULT (UTC_TIMESTAMP(3)) NOT NULL,
    version BLOB DEFAULT (X'00') NOT NULL,
    identity_provider_id BIGINT NOT NULL,
    name VARCHAR(256) NOT NULL,
    value TEXT NOT NULL,
    CONSTRAINT identity_provider_settings_primary_key PRIMARY KEY (id),
    CONSTRAINT identity_provider_settings_uuid_unique_constraint UNIQUE (uuid),
    CONSTRAINT identity_provider_settings_identity_provider_id_foreign_key FOREIGN KEY (identity_provider_id) REFERENCES identity_providers (id)
);
GO
CREATE UNIQUE INDEX identity_provider_settings_provider_id_name_index ON identity_provider_settings (identity_provider_id, name);
GO
CREATE TRIGGER trg_identity_provider_settings_updated_at BEFORE UPDATE ON identity_provider_settings
FOR EACH ROW SET NEW.updated = (UTC_TIMESTAMP(3));
GO
CREATE TABLE identity_provider_linked_user_field_types (
    id BIGINT AUTO_INCREMENT NOT NULL,
    uuid CHAR(36) DEFAULT (UUID()) NOT NULL,
    created DATETIME(3) DEFAULT (UTC_TIMESTAMP(3)) NOT NULL,
    updated DATETIME(3) DEFAULT (UTC_TIMESTAMP(3)) NOT NULL,
    version BLOB DEFAULT (X'00') NOT NULL,
    name VARCHAR(256) NOT NULL,
    CONSTRAINT identity_provider_linked_user_field_types_primary_key PRIMARY KEY (id),
    CONSTRAINT identity_provider_linked_user_field_types_uuid_unique_constraint UNIQUE (uuid)
);
GO
CREATE TRIGGER trg_identity_provider_linked_user_field_types_updated_at BEFORE UPDATE ON identity_provider_linked_user_field_types
FOR EACH ROW SET NEW.updated = (UTC_TIMESTAMP(3));
GO
CREATE TABLE identity_provider_linked_users (
    id BIGINT AUTO_INCREMENT NOT NULL,
    uuid CHAR(36) DEFAULT (UUID()) NOT NULL,
    created DATETIME(3) DEFAULT (UTC_TIMESTAMP(3)) NOT NULL,
    updated DATETIME(3) DEFAULT (UTC_TIMESTAMP(3)) NOT NULL,
    version BLOB DEFAULT (X'00') NOT NULL,
    identity_provider_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    identity_provider_linked_user_field_type_id BIGINT NOT NULL,
    value TEXT NOT NULL,
    CONSTRAINT identity_provider_linked_users_primary_key PRIMARY KEY (id),
    CONSTRAINT identity_provider_linked_users_uuid_unique_constraint UNIQUE (uuid),
    CONSTRAINT identity_provider_linked_users_identity_provider_id_foreign_key FOREIGN KEY (identity_provider_id) REFERENCES identity_providers (id),
    CONSTRAINT identity_provider_linked_users_user_id_foreign_key FOREIGN KEY (user_id) REFERENCES users (id),
    CONSTRAINT identity_provider_linked_users_identity_provider_linked_user_field_type_id_foreign_key FOREIGN KEY (identity_provider_linked_user_field_type_id) REFERENCES identity_provider_linked_user_field_types (id)
);
GO
CREATE TRIGGER trg_identity_provider_linked_users_updated_at BEFORE UPDATE ON identity_provider_linked_users
FOR EACH ROW SET NEW.updated = (UTC_TIMESTAMP(3));
GO
CREATE TABLE session_types (
    id BIGINT AUTO_INCREMENT NOT NULL,
    uuid CHAR(36) DEFAULT (UUID()) NOT NULL,
    created DATETIME(3) DEFAULT (UTC_TIMESTAMP(3)) NOT NULL,
    updated DATETIME(3) DEFAULT (UTC_TIMESTAMP(3)) NOT NULL,
    version BLOB DEFAULT (X'00') NOT NULL,
    name VARCHAR(512) NOT NULL,
    CONSTRAINT session_types_primary_key PRIMARY KEY (id),
    CONSTRAINT session_types_uuid_unique_constraint UNIQUE (uuid)
);
GO
CREATE TRIGGER trg_session_types_updated_at BEFORE UPDATE ON session_types
FOR EACH ROW SET NEW.updated = (UTC_TIMESTAMP(3));
GO
CREATE TABLE sessions (
    id BIGINT AUTO_INCREMENT NOT NULL,
    uuid CHAR(36) DEFAULT (UUID()) NOT NULL,
    created DATETIME(3) DEFAULT (UTC_TIMESTAMP(3)) NOT NULL,
    updated DATETIME(3) DEFAULT (UTC_TIMESTAMP(3)) NOT NULL,
    version BLOB DEFAULT (X'00') NOT NULL,
    session_type_id BIGINT NOT NULL,
    user_id BIGINT,
    relative_expiration INT,
    absolute_expiration DATETIME(3),
    revoked DATETIME(3),
    expired DATETIME(3),
    is_enabled TINYINT(1) DEFAULT 1 NOT NULL,
    CONSTRAINT sessions_primary_key PRIMARY KEY (id),
    CONSTRAINT sessions_uuid_unique_constraint UNIQUE (uuid),
    CONSTRAINT sessions_session_type_id_foreign_key FOREIGN KEY (session_type_id) REFERENCES session_types (id),
    CONSTRAINT sessions_user_id_foreign_key FOREIGN KEY (user_id) REFERENCES users (id)
);
GO
CREATE TRIGGER trg_sessions_updated_at BEFORE UPDATE ON sessions
FOR EACH ROW SET NEW.updated = (UTC_TIMESTAMP(3));
GO
CREATE TABLE authorization_codes (
    id BIGINT AUTO_INCREMENT NOT NULL,
    uuid CHAR(36) DEFAULT (UUID()) NOT NULL,
    created DATETIME(3) DEFAULT (UTC_TIMESTAMP(3)) NOT NULL,
    updated DATETIME(3) DEFAULT (UTC_TIMESTAMP(3)) NOT NULL,
    version BLOB DEFAULT (X'00') NOT NULL,
    session_id BIGINT,
    code VARCHAR(512) NOT NULL,
    is_used TINYINT(1) DEFAULT 1 NOT NULL,
    is_deleted TINYINT(1) DEFAULT 0 NOT NULL,
    CONSTRAINT authorization_codes_primary_key PRIMARY KEY (id),
    CONSTRAINT authorization_codes_uuid_unique_constraint UNIQUE (uuid),
    CONSTRAINT authorization_codes_session_id_foreign_key FOREIGN KEY (session_id) REFERENCES sessions (id)
);
GO
CREATE TRIGGER trg_authorization_codes_updated_at BEFORE UPDATE ON authorization_codes
FOR EACH ROW SET NEW.updated = (UTC_TIMESTAMP(3));
GO
CREATE TABLE identity_provider_authorize_sessions (
    id BIGINT AUTO_INCREMENT NOT NULL,
    uuid CHAR(36) DEFAULT (UUID()) NOT NULL,
    created DATETIME(3) DEFAULT (UTC_TIMESTAMP(3)) NOT NULL,
    updated DATETIME(3) DEFAULT (UTC_TIMESTAMP(3)) NOT NULL,
    version BLOB DEFAULT (X'00') NOT NULL,
    identity_provider_id BIGINT NOT NULL,
    session_id BIGINT NOT NULL,
    redirect_uri TEXT NOT NULL,
    state TEXT NOT NULL,
    code_challenge TEXT NOT NULL,
    code_challenge_method VARCHAR(128) NOT NULL,
    revoked DATETIME(3),
    finished DATETIME(3),
    is_deleted TINYINT(1) DEFAULT 0 NOT NULL,
    CONSTRAINT identity_provider_authorize_sessions_primary_key PRIMARY KEY (id),
    CONSTRAINT identity_provider_authorize_sessions_uuid_unique_constraint UNIQUE (uuid),
    CONSTRAINT identity_provider_authorize_sessions_identity_provider_id_foreign_key FOREIGN KEY (identity_provider_id) REFERENCES identity_providers (id),
    CONSTRAINT identity_provider_authorize_sessions_session_id_foreign_key FOREIGN KEY (session_id) REFERENCES sessions (id)
);
GO
CREATE TRIGGER trg_identity_provider_authorize_sessions_updated_at BEFORE UPDATE ON identity_provider_authorize_sessions
FOR EACH ROW SET NEW.updated = (UTC_TIMESTAMP(3));
GO
CREATE TABLE identity_provider_signin_attempts (
    id BIGINT AUTO_INCREMENT NOT NULL,
    uuid CHAR(36) DEFAULT (UUID()) NOT NULL,
    created DATETIME(3) DEFAULT (UTC_TIMESTAMP(3)) NOT NULL,
    updated DATETIME(3) DEFAULT (UTC_TIMESTAMP(3)) NOT NULL,
    version BLOB DEFAULT (X'00') NOT NULL,
    identity_provider_id BIGINT NOT NULL,
    session_id BIGINT NOT NULL,
    authentication_method_id BIGINT NOT NULL,
    is_success TINYINT(1) NOT NULL,
    CONSTRAINT identity_provider_signin_attempts_primary_key PRIMARY KEY (id),
    CONSTRAINT identity_provider_signin_attempts_uuid_unique_constraint UNIQUE (uuid),
    CONSTRAINT identity_provider_signin_attempts_identity_provider_id_foreign_key FOREIGN KEY (identity_provider_id) REFERENCES identity_providers (id),
    CONSTRAINT identity_provider_signin_attempts_session_id_foreign_key FOREIGN KEY (session_id) REFERENCES sessions (id),
    CONSTRAINT identity_provider_signin_attempts_authentication_method_id_foreign_key FOREIGN KEY (authentication_method_id) REFERENCES authentication_methods (id)
);
GO
CREATE TRIGGER trg_identity_provider_signin_attempts_updated_at BEFORE UPDATE ON identity_provider_signin_attempts
FOR EACH ROW SET NEW.updated = (UTC_TIMESTAMP(3));
GO
CREATE TABLE session_hits (
    id BIGINT AUTO_INCREMENT NOT NULL,
    uuid CHAR(36) DEFAULT (UUID()) NOT NULL,
    created DATETIME(3) DEFAULT (UTC_TIMESTAMP(3)) NOT NULL,
    updated DATETIME(3) DEFAULT (UTC_TIMESTAMP(3)) NOT NULL,
    version BLOB DEFAULT (X'00') NOT NULL,
    session_id BIGINT NOT NULL,
    ip_address VARBINARY(16) NOT NULL,
    CONSTRAINT session_hits_primary_key PRIMARY KEY (id),
    CONSTRAINT session_hits_uuid_unique_constraint UNIQUE (uuid),
    CONSTRAINT session_hits_session_id_foreign_key FOREIGN KEY (session_id) REFERENCES sessions (id)
);
GO
CREATE TRIGGER trg_session_hits_updated_at BEFORE UPDATE ON session_hits
FOR EACH ROW SET NEW.updated = (UTC_TIMESTAMP(3));
GO
CREATE TABLE session_states (
    id BIGINT AUTO_INCREMENT NOT NULL,
    uuid CHAR(36) DEFAULT (UUID()) NOT NULL,
    created DATETIME(3) DEFAULT (UTC_TIMESTAMP(3)) NOT NULL,
    updated DATETIME(3) DEFAULT (UTC_TIMESTAMP(3)) NOT NULL,
    version BLOB DEFAULT (X'00') NOT NULL,
    session_id BIGINT NOT NULL,
    state TEXT NOT NULL,
    code_challenge TEXT,
    code_challenge_method VARCHAR(256),
    revoked DATETIME(3),
    is_enabled TINYINT(1) DEFAULT 1 NOT NULL,
    CONSTRAINT session_states_primary_key PRIMARY KEY (id),
    CONSTRAINT session_states_uuid_unique_constraint UNIQUE (uuid),
    CONSTRAINT session_states_session_id_foreign_key FOREIGN KEY (session_id) REFERENCES sessions (id)
);
GO
CREATE TRIGGER trg_session_states_updated_at BEFORE UPDATE ON session_states
FOR EACH ROW SET NEW.updated = (UTC_TIMESTAMP(3));
GO
CREATE TABLE apps (
    id BIGINT AUTO_INCREMENT NOT NULL,
    uuid CHAR(36) DEFAULT (UUID()) NOT NULL,
    created DATETIME(3) DEFAULT (UTC_TIMESTAMP(3)) NOT NULL,
    updated DATETIME(3) DEFAULT (UTC_TIMESTAMP(3)) NOT NULL,
    version BLOB DEFAULT (X'00') NOT NULL,
    name VARCHAR(128) NOT NULL,
    CONSTRAINT apps_primary_key PRIMARY KEY (id),
    CONSTRAINT apps_uuid_unique_constraint UNIQUE (uuid)
);
GO
CREATE UNIQUE INDEX apps_app_base_name_index ON apps (name);
GO
CREATE TRIGGER trg_apps_updated_at BEFORE UPDATE ON apps
FOR EACH ROW SET NEW.updated = (UTC_TIMESTAMP(3));
GO
CREATE TABLE settings (
    id BIGINT AUTO_INCREMENT NOT NULL,
    uuid CHAR(36) DEFAULT (UUID()) NOT NULL,
    created DATETIME(3) DEFAULT (UTC_TIMESTAMP(3)) NOT NULL,
    updated DATETIME(3) DEFAULT (UTC_TIMESTAMP(3)) NOT NULL,
    version BLOB DEFAULT (X'00') NOT NULL,
    app_id BIGINT NOT NULL,
    name VARCHAR(255) NOT NULL,
    value TEXT NOT NULL,
    CONSTRAINT settings_primary_key PRIMARY KEY (id),
    CONSTRAINT settings_uuid_unique_constraint UNIQUE (uuid),
    CONSTRAINT settings_app_id_foreign_key FOREIGN KEY (app_id) REFERENCES apps (id)
);
GO
CREATE UNIQUE INDEX settings_setting_app_id_name_index ON settings (app_id, name);
GO
CREATE TRIGGER trg_settings_updated_at BEFORE UPDATE ON settings
FOR EACH ROW SET NEW.updated = (UTC_TIMESTAMP(3));
GO
-- Seed data
-- Seeds: genders
GO
INSERT INTO genders (id, uuid, name, description) VALUES (1, '9a81c98b-b74f-55fc-ba2c-02365a89ea86', 'Male', 'Male');
GO
INSERT INTO genders (id, uuid, name, description) VALUES (2, 'e35b9efd-f2e0-5b76-a6df-521469c97c1b', 'Female', 'Female');
GO
INSERT INTO genders (id, uuid, name, description) VALUES (3, '259d0d77-76c9-50f7-a197-f7b0064b161c', 'Other', 'Other');
GO
INSERT INTO genders (id, uuid, name, description) VALUES (4, '7d42e061-bac3-5e43-aa4c-fd0a7924fa5b', 'Agender', 'A person who does not identify themselves with or experience any gender. Also called null-gender, genderless, gendervoid, or neutral gender.');
GO
INSERT INTO genders (id, uuid, name, description) VALUES (5, '6ec4e277-333d-5e40-9695-844289209c2d', 'Abimegender', 'Associated with being profound, deep, and infinite. May be used alone or in combination with other genders.');
GO
INSERT INTO genders (id, uuid, name, description) VALUES (6, '14f0a0f0-2495-5375-9c45-eaca1b180651', 'Adamas gender', 'A gender that is indefinable or indomitable. People identifying with this gender refuse to be categorized in any particular gender identity.');
GO
INSERT INTO genders (id, uuid, name, description) VALUES (7, '91d2c24a-1896-5772-87ce-bee6175cfb1f', 'Aerogender', 'Also called evaisgender, this gender identity changes according to one''s surroundings.');
GO
INSERT INTO genders (id, uuid, name, description) VALUES (8, 'c2970dfe-44be-539c-ab82-cab1c8412fd0', 'Aesthetigender', 'Also called aesthetgender, a type of gender identity derived from aesthetics.');
GO
INSERT INTO genders (id, uuid, name, description) VALUES (9, '7f51ee52-a2fb-5478-abb4-17f2d828ddee', 'Affectugender', 'Based on the person''s mood swings or fluctuations.');
GO
INSERT INTO genders (id, uuid, name, description) VALUES (10, 'af40649a-59ee-5626-8839-4d7fcc4e3bdd', 'Agenderflux', 'Mostly agender with brief shifts of belonging to other gender types.');
GO
INSERT INTO genders (id, uuid, name, description) VALUES (11, 'b3304b19-4885-5647-b486-eff531d360cf', 'Alexigender', 'A fluid gender identity between more than one type of gender although the person cannot name the genders they feel fluid in.');
GO
INSERT INTO genders (id, uuid, name, description) VALUES (12, '551c0b54-2fdb-5027-a583-1943118eda3d', 'Aliusgender', 'Stands apart from existing social gender constructs. A strong specific gender identity that is neither male nor female.');
GO
INSERT INTO genders (id, uuid, name, description) VALUES (13, 'aaf0ed50-15cc-50c5-b0a3-45ad541f77de', 'Amaregender', 'A gender identity that changes depending on the person one is emotionally attached to.');
GO
INSERT INTO genders (id, uuid, name, description) VALUES (14, '262a80da-4a72-54ff-a73a-a8b9d30a3aa4', 'Ambigender', 'Two specific gender identities simultaneously without any fluidity or fluctuations.');
GO
INSERT INTO genders (id, uuid, name, description) VALUES (15, 'df35e5ba-7e81-5b4b-8ead-1c8174011f5a', 'Ambonec', 'The person identifies as both man and woman and yet does not belong to either.');
GO
INSERT INTO genders (id, uuid, name, description) VALUES (16, 'dc3b2bba-09f9-5558-8857-509b7674e77b', 'Amicagender', 'A gender-fluid identity where a person changes their gender depending on the friends they have.');
GO
INSERT INTO genders (id, uuid, name, description) VALUES (17, 'c0529ffa-75e1-5cf4-94ae-e10f530798ba', 'Androgyne', 'A combination of feminine and masculine genders.');
GO
INSERT INTO genders (id, uuid, name, description) VALUES (18, 'e77df1e5-2d00-5e0f-ae9e-6571f62e4cf7', 'Anesigender', 'Feeling close to a specific type of gender despite being more comfortable identifying with another gender.');
GO
INSERT INTO genders (id, uuid, name, description) VALUES (19, '6f9fcd02-935f-57e0-be3b-8a953784ee6f', 'Angenital', 'Desiring to be without any primary sexual characteristics without identifying as genderless.');
GO
INSERT INTO genders (id, uuid, name, description) VALUES (20, 'bd47f1f7-5f2b-5606-bb12-f5661ac577ae', 'Anogender', 'Gender identity fades in and out in intensity but always comes back to the same gendered feeling.');
GO
INSERT INTO genders (id, uuid, name, description) VALUES (21, 'ffcad1cc-18af-5bac-8423-a58071dce22c', 'Anongender', 'Having a gender identity but not labeling it or preferring not to have a label.');
GO
INSERT INTO genders (id, uuid, name, description) VALUES (22, 'd992d30b-6063-56c9-8f3c-9f8e961e471c', 'Antegender', 'A protean gender that can be anything but is formless and motionless.');
GO
INSERT INTO genders (id, uuid, name, description) VALUES (23, '4d6f3cdb-4378-5d98-a885-b3090ebc0c0d', 'Anxiegender', 'A gender identity with anxiety as its prominent characteristic.');
GO
INSERT INTO genders (id, uuid, name, description) VALUES (24, '2f2d2aa4-14b1-58fe-9966-a0612f4913da', 'Apagender', 'Apathy or a lack of feelings toward one''s gender identity.');
GO
INSERT INTO genders (id, uuid, name, description) VALUES (25, 'd8080e89-b7de-52d7-847c-4fcb3a7cc4e2', 'Apconsugender', 'Knowing what are not the characteristics of gender but not knowing what are its characteristics.');
GO
INSERT INTO genders (id, uuid, name, description) VALUES (26, '1f1a5492-361e-5750-9621-d27eb533468d', 'Astergender', 'A bright and celestial gender identity.');
GO
INSERT INTO genders (id, uuid, name, description) VALUES (27, '5b98e88c-592f-5706-a82f-aa5826d6a988', 'Astral gender', 'A gender identity that feels related to space.');
GO
INSERT INTO genders (id, uuid, name, description) VALUES (28, 'e839b579-22ba-589e-8c7f-0a37cf3c635e', 'Autigender', 'A gender identity that feels closely related to being autistic.');
GO
INSERT INTO genders (id, uuid, name, description) VALUES (29, '657e3c23-2fcf-564e-bb00-e1be6e66eb45', 'Autogender', 'A gender experience that is deeply connected and personal to oneself.');
GO
INSERT INTO genders (id, uuid, name, description) VALUES (30, '557017db-086b-5a07-9f31-45c9dbf457cf', 'Axigender', 'Between the two extremes of agender and any other type of gender, experienced one at a time without overlapping.');
GO
INSERT INTO genders (id, uuid, name, description) VALUES (31, '30897e5a-80e4-5cce-b249-b84b59f66262', 'Bigender', 'Two gender identities at the same or different times.');
GO
INSERT INTO genders (id, uuid, name, description) VALUES (32, 'd1ce4717-7367-5ebf-95d7-a201820664ad', 'Biogender', 'A gender closely related to nature.');
GO
INSERT INTO genders (id, uuid, name, description) VALUES (33, 'f7d7aa3a-92e0-5967-bcad-0b95ea95661c', 'Blurgender', 'More than one gender identity that blur into each other so no particular type is clear. Also called gender fuss.');
GO
INSERT INTO genders (id, uuid, name, description) VALUES (34, '8b579b30-90f2-5f6e-a3ea-9e7df80009da', 'Boyflux', 'Identifies as male but experiences varying degrees of male identity, ranging from agender to completely male.');
GO
INSERT INTO genders (id, uuid, name, description) VALUES (35, 'd0de2d1b-8d6f-5c4e-ba3f-f039c1549e8c', 'Burstgender', 'Frequent bursts of intense feelings quickly move to the initial calm stage.');
GO
INSERT INTO genders (id, uuid, name, description) VALUES (36, 'bf99c30c-039c-57d6-94dd-6541349ff5e8', 'Caelgender', 'Shares the qualities or aesthetics of outer space.');
GO
INSERT INTO genders (id, uuid, name, description) VALUES (37, 'a2506b84-21ad-52dc-a6b8-afa02f0f9956', 'Cassgender', 'Associated with considering gender irrelevant or unimportant.');
GO
INSERT INTO genders (id, uuid, name, description) VALUES (38, '332d3550-2054-5c0b-8608-d99690a3e26d', 'Cassflux', 'A fluctuating intensity of irrelevance toward gender.');
GO
INSERT INTO genders (id, uuid, name, description) VALUES (39, 'f6af310c-a362-5bed-8bda-da005c14eece', 'Cavusgender', 'Feeling close to one gender when depressed and to another when not depressed.');
GO
INSERT INTO genders (id, uuid, name, description) VALUES (40, 'ab557c88-9992-5e16-a9ac-4a0be0154cfa', 'Cendgender', 'Gender identity changes from one gender to its opposite.');
GO
INSERT INTO genders (id, uuid, name, description) VALUES (41, 'c13e2aed-f124-529a-82f4-aacfc7893fec', 'Ceterogender', 'A nonbinary gender with specific masculine, feminine, or neutral feelings.');
GO
INSERT INTO genders (id, uuid, name, description) VALUES (42, '5ceb107c-3891-5aae-8af1-47d0c7fbe30f', 'Ceterofluid', 'A ceterogender whose identity keeps fluctuating between different genders.');
GO
INSERT INTO genders (id, uuid, name, description) VALUES (43, '9abd716e-bee3-5df6-807e-83399c02cf17', 'Cisgender', 'Closely related to the gender assigned at birth during the entire life.');
GO
INSERT INTO genders (id, uuid, name, description) VALUES (44, '2614df92-cf09-5fa7-923f-2d38088513cf', 'Cloudgender', 'Gender cannot be comprehended due to depersonalization and derealization disorder.');
GO
INSERT INTO genders (id, uuid, name, description) VALUES (45, '723becfb-3143-556c-8917-efaecdb73876', 'Collgender', 'Various genders present at the same time.');
GO
INSERT INTO genders (id, uuid, name, description) VALUES (46, '2ee58eba-e067-55d0-b2c9-302527efcaef', 'Colorgender', 'Colors are used to describe gender, e.g., pink gender or black gender.');
GO
INSERT INTO genders (id, uuid, name, description) VALUES (47, '8d856103-ee2f-5c70-85b1-9aaedf62c5ff', 'Commogender', 'Knows they are not cisgender yet continues to identify as one for a while.');
GO
INSERT INTO genders (id, uuid, name, description) VALUES (48, '2ef9d325-1df7-531c-b450-7502d3d42e34', 'Condigender', 'Feels their gender only under specific circumstances.');
GO
INSERT INTO genders (id, uuid, name, description) VALUES (49, 'bd129e22-40ff-56e3-92e4-8928f17a69b2', 'Deliciagender', 'Having multiple genders but preferring one over the other.');
GO
INSERT INTO genders (id, uuid, name, description) VALUES (50, '7efeb822-2613-5ebd-b84f-37fb10e630b3', 'Demifluid', 'Multiple genders, some fluid while others are static.');
GO
INSERT INTO genders (id, uuid, name, description) VALUES (51, '3527671a-ce52-52a7-8094-2adb82b3122c', 'Demiflux', 'Multiple genders with some static and others fluctuating in intensity.');
GO
INSERT INTO genders (id, uuid, name, description) VALUES (52, 'b198b34e-58a6-5377-a9d3-a86372cd4a8e', 'Demigender', 'Partial traits of one gender and the rest of the other gender.');
GO
INSERT INTO genders (id, uuid, name, description) VALUES (53, 'e8c75270-9ee0-5b9c-8f93-d70279e979b5', 'Domgender', 'Multiple genders with one dominating over the rest.');
GO
INSERT INTO genders (id, uuid, name, description) VALUES (54, 'cfde6341-f526-5644-93c9-2e3b77ee11f0', 'Duragender', 'More than one gender with one lasting longer than the others.');
GO
INSERT INTO genders (id, uuid, name, description) VALUES (55, '91c662e3-2d01-56c5-8884-25016970f781', 'Egogender', 'A personal type of gender identified by the individual alone, based on experience within the self.');
GO
INSERT INTO genders (id, uuid, name, description) VALUES (56, 'be6dea08-2d97-5480-9066-594280b46778', 'Epicene', 'A strong feeling of not being able to relate to any or both of the binary gender characteristics.');
GO
INSERT INTO genders (id, uuid, name, description) VALUES (57, 'e94171d6-5084-592e-9e5d-19ac857e1d1c', 'Esspigender', 'Gender identity related to spirits.');
GO
INSERT INTO genders (id, uuid, name, description) VALUES (58, '8a217618-a207-506f-9cb8-66a31e90e7da', 'Exgender', 'Denial to identify with any gender on the gender spectrum.');
GO
INSERT INTO genders (id, uuid, name, description) VALUES (59, '02371de9-1693-5415-9066-40ea8dc60f4b', 'Existigender', 'Gender identity exists only when the person makes conscious efforts to realize it.');
GO
INSERT INTO genders (id, uuid, name, description) VALUES (60, '6a38bad5-c61e-5204-b552-86aca7b013ef', 'Femfluid', 'Fluid or fluctuating regarding the feminine genders.');
GO
INSERT INTO genders (id, uuid, name, description) VALUES (61, 'c50e4548-a542-5b35-acc3-284b750b93df', 'Femgender', 'A nonbinary gender identity that is feminine.');
GO
INSERT INTO genders (id, uuid, name, description) VALUES (62, '6d049426-e583-5467-85ea-ed132cc85a1a', 'Fluidflux', 'Fluid between two or more genders with fluctuation in intensity of those genders.');
GO
INSERT INTO genders (id, uuid, name, description) VALUES (63, 'a7991187-ad26-543b-a1b5-0401094e2507', 'Gemigender', 'Two genders that are opposite yet flux and work together.');
GO
INSERT INTO genders (id, uuid, name, description) VALUES (64, 'afeec458-0b85-514d-9f43-1c5cf88f68bb', 'Genderblank', 'Closely related to a blank space.');
GO
INSERT INTO genders (id, uuid, name, description) VALUES (65, '431ebf68-70eb-5d26-8bb7-c0f630a070df', 'Genderflow', 'Gender identity is fluid between infinite feelings.');
GO
INSERT INTO genders (id, uuid, name, description) VALUES (66, '6a745a08-87a1-5ac9-a655-bcc84f4e6a1c', 'Genderfluid', 'Does not consistently adhere to one fixed gender and may have many genders.');
GO
INSERT INTO genders (id, uuid, name, description) VALUES (67, '2b2ccbdf-4e3d-515c-a54e-5c4931968191', 'Genderfuzz', 'More than one gender is blurred together.');
GO
INSERT INTO genders (id, uuid, name, description) VALUES (68, '56237acd-1c7f-59ed-b427-b2bf2c9480b9', 'Genderflux', 'Gender fluctuates in intensity.');
GO
INSERT INTO genders (id, uuid, name, description) VALUES (69, '08c2e05b-222d-57db-9bc7-a171466db27f', 'Genderpuck', 'Resists fitting in societal norms concerning genders.');
GO
INSERT INTO genders (id, uuid, name, description) VALUES (70, 'd7351b7a-097c-5883-9810-ef24e1b135e6', 'Genderqueer', 'Blurs the preconceived boundaries of gender in relation to the gender binary or having just one gender type.');
GO
INSERT INTO genders (id, uuid, name, description) VALUES (71, 'e60a3461-2c40-5b56-96ec-5c94e83ee75a', 'Gender witched', 'Inclined toward having one gender but does not know which.');
GO
INSERT INTO genders (id, uuid, name, description) VALUES (72, 'e03c40fb-a4fb-5a74-9639-9b1753d6a71a', 'Girlflux', 'Identifies as female but with varying intensities of female identity.');
GO
INSERT INTO genders (id, uuid, name, description) VALUES (73, '7d1e424f-540b-5996-bcda-a53f6fd24a0f', 'Healgender', 'A gender identity that gives the person peace, calm, and positivity.');
GO
INSERT INTO genders (id, uuid, name, description) VALUES (74, 'b49fcbb7-82df-5f35-9958-fa942df1ea0a', 'Mirrorgender', 'Changing one''s gender type based on the people surrounding.');
GO
INSERT INTO genders (id, uuid, name, description) VALUES (75, 'd0fbbea2-8e5b-56df-93e8-d6ae49a53219', 'Omnigender', 'Having or experiencing all genders.');
GO
-- Seeds: email_types
GO
INSERT INTO email_types (id, uuid, name, description) VALUES (1, 'ba9d1120-def1-5f64-9481-3d6ffe83e080', 'Work', 'Work');
GO
INSERT INTO email_types (id, uuid, name, description) VALUES (2, '89988ebb-6d06-5558-b58c-fb63bf1cb1b3', 'Personal', 'Personal');
GO
INSERT INTO email_types (id, uuid, name, description) VALUES (3, 'e7696dd3-2a8c-50e7-80ae-50f66c51d085', 'Billing', 'Billing');
GO
INSERT INTO email_types (id, uuid, name, description) VALUES (4, '520c4e2b-1554-5edf-9132-d9906c2e1f0e', 'Admin', 'Admin');
GO
INSERT INTO email_types (id, uuid, name, description) VALUES (5, 'd48b9dfd-dff4-5c95-9c26-86743fa5f93e', 'Temp', 'Temp');
GO
INSERT INTO email_types (id, uuid, name, description) VALUES (6, '059fe89b-9db7-5b0c-9d48-10e1b22a9895', 'Other', 'Other');
GO
-- Seeds: phone_types
GO
INSERT INTO phone_types (id, uuid, name, description) VALUES (1, '775f24d4-e8cb-505c-9671-1d53c44f2780', 'Mobile', 'Mobile');
GO
INSERT INTO phone_types (id, uuid, name, description) VALUES (2, 'f5400d5e-2d9c-5f28-855a-3c893af2e951', 'Work', 'Work');
GO
INSERT INTO phone_types (id, uuid, name, description) VALUES (3, '3341543b-9c7c-5006-9b77-527ea9521221', 'Home', 'Home');
GO
INSERT INTO phone_types (id, uuid, name, description) VALUES (4, 'c86ffd75-2e88-56c0-81a7-a6bf8fbbccf7', 'Fax', 'Fax');
GO
INSERT INTO phone_types (id, uuid, name, description) VALUES (5, '6a107d46-427f-5501-935a-7b2d7a1f7361', 'Other', 'Other');
GO
-- Seeds: labels
GO
INSERT INTO labels (id, uuid, name, description) VALUES (1, '62b21d4c-39ec-585d-8461-9352d97bc56d', 'Family', 'Family members and relatives');
GO
INSERT INTO labels (id, uuid, name, description) VALUES (2, 'ae2f4fca-f8b6-544f-903c-06487fb1aefc', 'Friends', 'Personal friends');
GO
INSERT INTO labels (id, uuid, name, description) VALUES (3, '9bd502c5-a97d-5b2e-9b6e-571e62d814f5', 'Work', 'Work and professional contacts');
GO
-- Seeds: languages
GO
INSERT INTO languages (id, uuid, code, name) VALUES (1, '3588dd76-6f65-5ae8-8188-1e9097f7d333', 'aa', 'Afar');
GO
INSERT INTO languages (id, uuid, code, name) VALUES (2, '86abf6ed-4b32-514e-bc49-ca0704f4b704', 'ab', 'Abkhazian');
GO
INSERT INTO languages (id, uuid, code, name) VALUES (3, '3398867c-f19d-562b-a25d-7503ca435233', 'ae', 'Avestan');
GO
INSERT INTO languages (id, uuid, code, name) VALUES (4, '3c0b28bb-75d4-5430-9c96-4f157584a166', 'af', 'Afrikaans');
GO
INSERT INTO languages (id, uuid, code, name) VALUES (5, '18abf683-733c-5205-8122-3783d0d377d3', 'ak', 'Akan');
GO
INSERT INTO languages (id, uuid, code, name) VALUES (6, '1e6ac3d9-f1e2-5988-a7d3-5df959fe4b8f', 'am', 'Amharic');
GO
INSERT INTO languages (id, uuid, code, name) VALUES (7, '8224b9aa-e649-5d80-915d-9ec5c665ab4d', 'an', 'Aragonese');
GO
INSERT INTO languages (id, uuid, code, name) VALUES (8, '0f3486cd-120e-5fa1-8780-5cecffc9623e', 'ar', 'Arabic');
GO
INSERT INTO languages (id, uuid, code, name) VALUES (9, '43e6d759-4a25-5bb0-ac5d-17332d8aa6fe', 'as', 'Assamese');
GO
INSERT INTO languages (id, uuid, code, name) VALUES (10, '177258fb-6241-5032-ba8c-e60e6497a266', 'av', 'Avaric');
GO
INSERT INTO languages (id, uuid, code, name) VALUES (11, '07825b32-f547-533a-897b-5f20fee5ab31', 'ay', 'Aymara');
GO
INSERT INTO languages (id, uuid, code, name) VALUES (12, '21d827e5-30d9-532f-aa2b-2ad64d6cc65c', 'az', 'Azerbaijani');
GO
INSERT INTO languages (id, uuid, code, name) VALUES (13, '3fc9fc70-5646-5eb1-aa25-e6d5cc1613ae', 'ba', 'Bashkir');
GO
INSERT INTO languages (id, uuid, code, name) VALUES (14, '8e37c1c1-c26b-502b-9bc1-fa8d4dada3d4', 'be', 'Belarusian');
GO
INSERT INTO languages (id, uuid, code, name) VALUES (15, 'ef72833f-05d5-5016-a9ca-2bc081ed5e92', 'bg', 'Bulgarian');
GO
INSERT INTO languages (id, uuid, code, name) VALUES (16, '3324e8c1-7e77-5eca-bd17-022935909c44', 'bh', 'Bihari languages');
GO
INSERT INTO languages (id, uuid, code, name) VALUES (17, '242229c8-521a-51e1-816f-668fc47d3709', 'bi', 'Bislama');
GO
INSERT INTO languages (id, uuid, code, name) VALUES (18, 'bbeff5d2-43b8-5e3b-b594-7b7ff5e2453d', 'bm', 'Bambara');
GO
INSERT INTO languages (id, uuid, code, name) VALUES (19, '7caf21d9-1592-579a-a10b-12ce359b4524', 'bn', 'Bengali');
GO
INSERT INTO languages (id, uuid, code, name) VALUES (20, '3115c467-1ead-540d-9add-d3eff98191ce', 'bo', 'Tibetan');
GO
INSERT INTO languages (id, uuid, code, name) VALUES (21, '59c64be0-3ebb-514e-8ee3-1bd5347314e4', 'br', 'Breton');
GO
INSERT INTO languages (id, uuid, code, name) VALUES (22, '24451616-143a-56ca-96bf-41d22f02cce2', 'bs', 'Bosnian');
GO
INSERT INTO languages (id, uuid, code, name) VALUES (23, '46f9509e-7dc9-5160-96ea-fc42c5054ba8', 'ca', 'Catalan');
GO
INSERT INTO languages (id, uuid, code, name) VALUES (24, '05c73764-4768-518b-ac19-de52edd44c38', 'ce', 'Chechen');
GO
INSERT INTO languages (id, uuid, code, name) VALUES (25, '08c0bfae-795e-57e7-b947-7165d6e9cf18', 'ch', 'Chamorro');
GO
INSERT INTO languages (id, uuid, code, name) VALUES (26, 'b57d9420-5e6e-5d75-9b91-db59b3689247', 'co', 'Corsican');
GO
INSERT INTO languages (id, uuid, code, name) VALUES (27, 'f85415e1-2021-5f31-89a4-d9b4fb81c799', 'cr', 'Cree');
GO
INSERT INTO languages (id, uuid, code, name) VALUES (28, '8a3df0b5-3c71-50c9-84cd-662a48923709', 'cs', 'Czech');
GO
INSERT INTO languages (id, uuid, code, name) VALUES (29, '029668a3-86c2-5a2b-ae5e-7672e78b8813', 'cu', 'Church Slavic');
GO
INSERT INTO languages (id, uuid, code, name) VALUES (30, '12258e06-f956-598c-983c-d69aff9202cb', 'cv', 'Chuvash');
GO
INSERT INTO languages (id, uuid, code, name) VALUES (31, '40edc641-e056-5019-9aa4-656a0febdd1c', 'cy', 'Welsh');
GO
INSERT INTO languages (id, uuid, code, name) VALUES (32, '71f34b93-f822-5f08-8ae8-8e4f29e3dff8', 'da', 'Danish');
GO
INSERT INTO languages (id, uuid, code, name) VALUES (33, 'ae83dcf5-c8f2-5a93-a438-87c99d726685', 'de', 'German');
GO
INSERT INTO languages (id, uuid, code, name) VALUES (34, '193d348c-4202-57e0-a659-3e9e9d4974d4', 'dv', 'Divehi');
GO
INSERT INTO languages (id, uuid, code, name) VALUES (35, 'c30dac90-6eb6-582b-99b9-85af0511e609', 'dz', 'Dzongkha');
GO
INSERT INTO languages (id, uuid, code, name) VALUES (36, '98990674-a333-58a5-914c-7624a39fb611', 'ee', 'Ewe');
GO
INSERT INTO languages (id, uuid, code, name) VALUES (37, '2da2007d-e3d0-5210-a64f-7da632f0c27e', 'el', 'Greek');
GO
INSERT INTO languages (id, uuid, code, name) VALUES (38, '808a00a3-8be0-5f91-a1df-069289b510e7', 'en', 'English');
GO
INSERT INTO languages (id, uuid, code, name) VALUES (39, '8867a148-d7e9-5895-9c9e-c57ba2123148', 'eo', 'Esperanto');
GO
INSERT INTO languages (id, uuid, code, name) VALUES (40, '2d3b25ed-1940-5b70-a37d-7886f6d7821b', 'es', 'Spanish');
GO
INSERT INTO languages (id, uuid, code, name) VALUES (41, '22823f13-6071-51da-809e-b1e0b4ab32b1', 'et', 'Estonian');
GO
INSERT INTO languages (id, uuid, code, name) VALUES (42, '36c5a03e-748c-578d-84a7-68f9d9083f0d', 'eu', 'Basque');
GO
INSERT INTO languages (id, uuid, code, name) VALUES (43, '01e07c44-ad6f-5a75-9925-d8d511af7957', 'fa', 'Persian');
GO
INSERT INTO languages (id, uuid, code, name) VALUES (44, '9db1ba4f-54a4-59ae-8a4f-fdc7f3c63a62', 'ff', 'Fulah');
GO
INSERT INTO languages (id, uuid, code, name) VALUES (45, '7bb87cb1-091c-5817-9029-8322c9d6a5bb', 'fi', 'Finnish');
GO
INSERT INTO languages (id, uuid, code, name) VALUES (46, 'aef8d9d6-168a-5e1d-a8a5-b3bbdef6706c', 'fj', 'Fijian');
GO
INSERT INTO languages (id, uuid, code, name) VALUES (47, 'e360458f-6378-57f2-8908-e26bc732b50d', 'fo', 'Faroese');
GO
INSERT INTO languages (id, uuid, code, name) VALUES (48, '5e75b46d-d800-57cc-ab38-5dc9f363aa45', 'fr', 'French');
GO
INSERT INTO languages (id, uuid, code, name) VALUES (49, 'c304e04a-0e39-5aa8-8c83-906916d893b6', 'fy', 'Western Frisian');
GO
INSERT INTO languages (id, uuid, code, name) VALUES (50, 'e1be3579-6098-5d4a-b2ba-d34a9fac0e03', 'ga', 'Irish');
GO
INSERT INTO languages (id, uuid, code, name) VALUES (51, '3ac26b41-76fe-53aa-9e6e-be432c7cd9f4', 'gd', 'Scottish Gaelic');
GO
INSERT INTO languages (id, uuid, code, name) VALUES (52, '9866b057-bd1f-5810-be70-f2c0d89aa976', 'gl', 'Galician');
GO
INSERT INTO languages (id, uuid, code, name) VALUES (53, 'f715e32c-1ad2-56cf-acb0-3c3988447f25', 'gn', 'Guarani');
GO
INSERT INTO languages (id, uuid, code, name) VALUES (54, '098af0cf-1288-5e83-8d87-7a84b6f6baac', 'gu', 'Gujarati');
GO
INSERT INTO languages (id, uuid, code, name) VALUES (55, '7e506e6c-982f-5477-9795-c427822ad38e', 'gv', 'Manx');
GO
INSERT INTO languages (id, uuid, code, name) VALUES (56, '6bfa60e7-64e8-596d-8a13-6463cff878af', 'ha', 'Hausa');
GO
INSERT INTO languages (id, uuid, code, name) VALUES (57, '441e54aa-86c9-52ad-96de-823213884625', 'he', 'Hebrew');
GO
INSERT INTO languages (id, uuid, code, name) VALUES (58, 'e108667d-a732-5475-84f0-e198b9c10a69', 'hi', 'Hindi');
GO
INSERT INTO languages (id, uuid, code, name) VALUES (59, '423ea542-17c1-5969-ad1a-01e3401042ad', 'ho', 'Hiri Motu');
GO
INSERT INTO languages (id, uuid, code, name) VALUES (60, '118fe3ee-15fb-55c9-ac6a-598f6d219604', 'hr', 'Croatian');
GO
INSERT INTO languages (id, uuid, code, name) VALUES (61, 'f63dde93-1088-59ec-8b60-5b54da7bbd8f', 'ht', 'Haitian Creole');
GO
INSERT INTO languages (id, uuid, code, name) VALUES (62, 'aea98c5e-9465-5605-9870-503023f4ba77', 'hu', 'Hungarian');
GO
INSERT INTO languages (id, uuid, code, name) VALUES (63, '1118fc41-706f-5c57-8dde-a145a144b9b5', 'hy', 'Armenian');
GO
INSERT INTO languages (id, uuid, code, name) VALUES (64, '79356262-b887-5fb9-9ce3-0874d504c596', 'hz', 'Herero');
GO
INSERT INTO languages (id, uuid, code, name) VALUES (65, '83899dbc-831f-5364-8c5c-cc8a9b852eb9', 'ia', 'Interlingua');
GO
INSERT INTO languages (id, uuid, code, name) VALUES (66, 'da046742-ec86-5d08-a66c-d63ff5820470', 'id', 'Indonesian');
GO
INSERT INTO languages (id, uuid, code, name) VALUES (67, '415ba56e-ac8a-5f9d-b18d-b5649848ceb9', 'ie', 'Interlingue');
GO
INSERT INTO languages (id, uuid, code, name) VALUES (68, '0b80fb5f-2dd4-5f76-b8e7-8ba514f9ceb8', 'ig', 'Igbo');
GO
INSERT INTO languages (id, uuid, code, name) VALUES (69, '8dc5228c-4567-5ad4-8c39-7fba7c51d1f9', 'ii', 'Sichuan Yi');
GO
INSERT INTO languages (id, uuid, code, name) VALUES (70, 'e28415d8-68f6-53e3-ac7d-db0badfdb821', 'ik', 'Inupiaq');
GO
INSERT INTO languages (id, uuid, code, name) VALUES (71, 'bca7d620-3d42-55b7-8f19-48693a939dca', 'io', 'Ido');
GO
INSERT INTO languages (id, uuid, code, name) VALUES (72, 'e0b44cc7-e151-5950-97cc-a7552447d029', 'is', 'Icelandic');
GO
INSERT INTO languages (id, uuid, code, name) VALUES (73, '99f44b2a-6357-5806-a4cc-33ca560f0c3b', 'it', 'Italian');
GO
INSERT INTO languages (id, uuid, code, name) VALUES (74, 'fc55baf6-1ba9-5891-b428-86825199cdf7', 'iu', 'Inuktitut');
GO
INSERT INTO languages (id, uuid, code, name) VALUES (75, '656fbcf7-a1c2-500e-93cd-25f77a94b3ec', 'ja', 'Japanese');
GO
INSERT INTO languages (id, uuid, code, name) VALUES (76, 'a3dee40d-6804-5121-ae2d-577928d928f6', 'jv', 'Javanese');
GO
INSERT INTO languages (id, uuid, code, name) VALUES (77, 'a2536373-79a8-551e-b849-23896324d866', 'ka', 'Georgian');
GO
INSERT INTO languages (id, uuid, code, name) VALUES (78, '87d1a977-b16b-59b3-96c5-a63d70953298', 'kg', 'Kongo');
GO
INSERT INTO languages (id, uuid, code, name) VALUES (79, '9a60358a-8636-5efb-a1d7-81d332d9651b', 'ki', 'Kikuyu');
GO
INSERT INTO languages (id, uuid, code, name) VALUES (80, '69b5f594-a537-5c80-837f-80c3322ea379', 'kj', 'Kuanyama');
GO
INSERT INTO languages (id, uuid, code, name) VALUES (81, 'd5f43b99-2cf1-5c8a-b572-2176c99b6620', 'kk', 'Kazakh');
GO
INSERT INTO languages (id, uuid, code, name) VALUES (82, '4912f56f-e742-5dfb-b6a1-3ea26e72e044', 'kl', 'Kalaallisut');
GO
INSERT INTO languages (id, uuid, code, name) VALUES (83, 'c506449e-33ea-5fdf-8653-c03f2dbe73b9', 'km', 'Khmer');
GO
INSERT INTO languages (id, uuid, code, name) VALUES (84, '5f84390e-1bb8-5bbb-b61d-b38324efb801', 'kn', 'Kannada');
GO
INSERT INTO languages (id, uuid, code, name) VALUES (85, '669bcfce-a25f-51ee-98e2-f057943fcfa6', 'ko', 'Korean');
GO
INSERT INTO languages (id, uuid, code, name) VALUES (86, '022dcb88-38c4-5309-a07e-d65a20089ded', 'kr', 'Kanuri');
GO
INSERT INTO languages (id, uuid, code, name) VALUES (87, 'e7e1a1e1-b35c-5a34-9c88-cab66c94da84', 'ks', 'Kashmiri');
GO
INSERT INTO languages (id, uuid, code, name) VALUES (88, 'b796590d-aec2-5b86-8d9f-1b0b25d3ce1f', 'ku', 'Kurdish');
GO
INSERT INTO languages (id, uuid, code, name) VALUES (89, '04156088-8d9e-541b-9f72-3ebb36d70810', 'kv', 'Komi');
GO
INSERT INTO languages (id, uuid, code, name) VALUES (90, '5ce7cc0b-56c4-5116-8757-f65108e56542', 'kw', 'Cornish');
GO
INSERT INTO languages (id, uuid, code, name) VALUES (91, 'cfd6e6c9-c03e-5c55-8cec-759fe504dd87', 'ky', 'Kyrgyz');
GO
INSERT INTO languages (id, uuid, code, name) VALUES (92, 'f136173a-ea8c-5582-803d-81437589ecfe', 'la', 'Latin');
GO
INSERT INTO languages (id, uuid, code, name) VALUES (93, '109d08da-a569-5305-9133-c0bb1f72fd4f', 'lb', 'Luxembourgish');
GO
INSERT INTO languages (id, uuid, code, name) VALUES (94, '88ad6602-0253-5304-9649-08b983e20cfe', 'lg', 'Ganda');
GO
INSERT INTO languages (id, uuid, code, name) VALUES (95, 'ede8e2d6-e345-5d75-b374-070f2c0b6049', 'li', 'Limburgish');
GO
INSERT INTO languages (id, uuid, code, name) VALUES (96, '979c0662-0a24-54c2-a62d-63b2b27a23d6', 'ln', 'Lingala');
GO
INSERT INTO languages (id, uuid, code, name) VALUES (97, '3ab9a2fd-a3e5-5454-a0b7-f142f3ddb54a', 'lo', 'Lao');
GO
INSERT INTO languages (id, uuid, code, name) VALUES (98, 'c618fb52-e61a-5f39-a951-813ddc125a2f', 'lt', 'Lithuanian');
GO
INSERT INTO languages (id, uuid, code, name) VALUES (99, 'c4abf205-27e7-5dec-be7f-dcb6cf83c62e', 'lu', 'Luba-Katanga');
GO
INSERT INTO languages (id, uuid, code, name) VALUES (100, '1415095e-a487-501c-b81e-4c551c56c74b', 'lv', 'Latvian');
GO
INSERT INTO languages (id, uuid, code, name) VALUES (101, 'cb36dc35-2435-597d-9d65-043b40e5342b', 'mg', 'Malagasy');
GO
INSERT INTO languages (id, uuid, code, name) VALUES (102, '7d14a8a0-425d-5998-9fdd-04aaf118ef2f', 'mh', 'Marshallese');
GO
INSERT INTO languages (id, uuid, code, name) VALUES (103, '14611c38-cfb4-5270-b595-685877b9a462', 'mi', 'Maori');
GO
INSERT INTO languages (id, uuid, code, name) VALUES (104, 'f431cae2-604b-5e36-94a8-1842b8cd70ff', 'mk', 'Macedonian');
GO
INSERT INTO languages (id, uuid, code, name) VALUES (105, '4f74ad2c-9e71-5871-a3a8-316cc7139fdf', 'ml', 'Malayalam');
GO
INSERT INTO languages (id, uuid, code, name) VALUES (106, '3763cff0-6063-54bd-94f8-b1f2b1423a41', 'mn', 'Mongolian');
GO
INSERT INTO languages (id, uuid, code, name) VALUES (107, 'f701b9da-feb8-5acd-b5e6-b7923dca8bce', 'mr', 'Marathi');
GO
INSERT INTO languages (id, uuid, code, name) VALUES (108, '5f2c86d3-b1e9-58b2-b086-d33161f482c2', 'ms', 'Malay');
GO
INSERT INTO languages (id, uuid, code, name) VALUES (109, '9d175926-921c-5f64-9748-15dba9194a51', 'mt', 'Maltese');
GO
INSERT INTO languages (id, uuid, code, name) VALUES (110, '5790738a-769f-5b6d-9e85-b8fddb858b68', 'my', 'Burmese');
GO
INSERT INTO languages (id, uuid, code, name) VALUES (111, 'c5ae6122-ca58-5079-a969-9e24ad6c8e18', 'na', 'Nauru');
GO
INSERT INTO languages (id, uuid, code, name) VALUES (112, '192addef-2157-5f4f-af9c-6221b7842238', 'nb', 'Norwegian Bokmål');
GO
INSERT INTO languages (id, uuid, code, name) VALUES (113, '47b7c109-561f-50a4-b061-43d3305bd561', 'nd', 'North Ndebele');
GO
INSERT INTO languages (id, uuid, code, name) VALUES (114, '1d7c28e6-d704-5e8d-ad13-69a1d60fc994', 'ne', 'Nepali');
GO
INSERT INTO languages (id, uuid, code, name) VALUES (115, '7f4da38f-065b-5946-a5cd-6dd48a77f2a8', 'ng', 'Ndonga');
GO
INSERT INTO languages (id, uuid, code, name) VALUES (116, 'b31e93cc-9f61-5b69-84f2-fa10664de606', 'nl', 'Dutch');
GO
INSERT INTO languages (id, uuid, code, name) VALUES (117, '481aad26-5219-53dc-ab5c-1b02aac4afa5', 'nn', 'Norwegian Nynorsk');
GO
INSERT INTO languages (id, uuid, code, name) VALUES (118, '5957c47c-8880-5785-a73c-93dcc623655f', 'no', 'Norwegian');
GO
INSERT INTO languages (id, uuid, code, name) VALUES (119, '032fc4a5-d4e2-5921-8d8b-16000b78cefb', 'nr', 'South Ndebele');
GO
INSERT INTO languages (id, uuid, code, name) VALUES (120, '0d422058-bee8-5b25-82b2-3911067a0178', 'nv', 'Navajo');
GO
INSERT INTO languages (id, uuid, code, name) VALUES (121, 'c04a0e01-effe-5e24-b1b6-6ee819672d99', 'ny', 'Chichewa');
GO
INSERT INTO languages (id, uuid, code, name) VALUES (122, '36056299-cc88-58ed-8bc3-68b4666fb58c', 'oc', 'Occitan');
GO
INSERT INTO languages (id, uuid, code, name) VALUES (123, '1ea0aaf1-e2fd-5ad6-9ecc-7ce45624d28a', 'oj', 'Ojibwa');
GO
INSERT INTO languages (id, uuid, code, name) VALUES (124, '170065ef-0ff9-5d6e-9df3-cae81d22716c', 'om', 'Oromo');
GO
INSERT INTO languages (id, uuid, code, name) VALUES (125, 'c0091168-3095-5c54-b656-bfeb09288092', 'or', 'Odia');
GO
INSERT INTO languages (id, uuid, code, name) VALUES (126, 'f8e85ced-cfd0-5352-99fa-f8be1c5d01a4', 'os', 'Ossetian');
GO
INSERT INTO languages (id, uuid, code, name) VALUES (127, '1e0edb9f-80aa-5dec-b0a9-fdff536c05bc', 'pa', 'Punjabi');
GO
INSERT INTO languages (id, uuid, code, name) VALUES (128, '4246a754-a2b4-538d-9980-a2bc327928a1', 'pi', 'Pali');
GO
INSERT INTO languages (id, uuid, code, name) VALUES (129, '1ebbb3d6-307f-58d2-ab91-9a1552d81419', 'pl', 'Polish');
GO
INSERT INTO languages (id, uuid, code, name) VALUES (130, '216cd728-89a7-58b4-b78a-b7f46e97202a', 'ps', 'Pashto');
GO
INSERT INTO languages (id, uuid, code, name) VALUES (131, '4f8ab6d5-931e-5123-9a87-21306cdfdfa9', 'pt', 'Portuguese');
GO
INSERT INTO languages (id, uuid, code, name) VALUES (132, 'd0de3acf-1535-5bd3-9f46-dbb3131941b4', 'qu', 'Quechua');
GO
INSERT INTO languages (id, uuid, code, name) VALUES (133, '8e31e494-80e6-5e21-99b3-9eaea5c8b642', 'rm', 'Romansh');
GO
INSERT INTO languages (id, uuid, code, name) VALUES (134, '052215d3-0bb9-5d5b-8ec0-6f6703f9f6ce', 'rn', 'Kirundi');
GO
INSERT INTO languages (id, uuid, code, name) VALUES (135, 'f09f2eb3-35a0-5df9-8904-b776e421551a', 'ro', 'Romanian');
GO
INSERT INTO languages (id, uuid, code, name) VALUES (136, '739919bd-4d14-56ef-aee8-67c8f92bc0d4', 'ru', 'Russian');
GO
INSERT INTO languages (id, uuid, code, name) VALUES (137, '27cde54d-cea0-5e2f-b385-bac5e5d74cc5', 'rw', 'Kinyarwanda');
GO
INSERT INTO languages (id, uuid, code, name) VALUES (138, '77d6b26b-f595-5d7f-81d9-8d1e8fa1683a', 'sa', 'Sanskrit');
GO
INSERT INTO languages (id, uuid, code, name) VALUES (139, 'f9bcb24a-8ddd-54c3-8fe8-13dff9979e59', 'sc', 'Sardinian');
GO
INSERT INTO languages (id, uuid, code, name) VALUES (140, '2687ade8-9c6e-5b8d-aa14-272e5557d09b', 'sd', 'Sindhi');
GO
INSERT INTO languages (id, uuid, code, name) VALUES (141, 'cb8abd1a-add8-5dbf-8e80-3535d1e91983', 'se', 'Northern Sami');
GO
INSERT INTO languages (id, uuid, code, name) VALUES (142, 'c49c9a84-0ec3-5c39-a6d3-a97e825e1d11', 'sg', 'Sango');
GO
INSERT INTO languages (id, uuid, code, name) VALUES (143, 'c11538af-3ed3-534b-896a-22c0a46676dd', 'si', 'Sinhala');
GO
INSERT INTO languages (id, uuid, code, name) VALUES (144, '7420e503-2972-5372-8ec7-fd1f23edd02a', 'sk', 'Slovak');
GO
INSERT INTO languages (id, uuid, code, name) VALUES (145, '78460c2a-828d-5312-bb03-a79494ec1d67', 'sl', 'Slovenian');
GO
INSERT INTO languages (id, uuid, code, name) VALUES (146, '16ecd7e9-7db4-5fd6-95f2-7b36c088ab5d', 'sm', 'Samoan');
GO
INSERT INTO languages (id, uuid, code, name) VALUES (147, '978c137b-ae08-5e9f-ac85-8ceb098a1065', 'sn', 'Shona');
GO
INSERT INTO languages (id, uuid, code, name) VALUES (148, '57fab07a-0bf5-5ac7-a0dc-0107d0c9032d', 'so', 'Somali');
GO
INSERT INTO languages (id, uuid, code, name) VALUES (149, 'e5e21b75-327b-57d9-a446-2528a6992a15', 'sq', 'Albanian');
GO
INSERT INTO languages (id, uuid, code, name) VALUES (150, '484ace7d-f811-522a-9f46-a461e208e9f4', 'sr', 'Serbian');
GO
INSERT INTO languages (id, uuid, code, name) VALUES (151, '642b581c-1a6a-574b-a764-d46b9d9e473b', 'ss', 'Swati');
GO
INSERT INTO languages (id, uuid, code, name) VALUES (152, '4e1fda32-3f38-5619-bd36-aed75d9392f5', 'st', 'Southern Sotho');
GO
INSERT INTO languages (id, uuid, code, name) VALUES (153, 'e4bb816e-7072-5f0c-91ce-b15de7e6c68b', 'su', 'Sundanese');
GO
INSERT INTO languages (id, uuid, code, name) VALUES (154, '2a509577-6ac2-5e4b-9dea-f791df7730bf', 'sv', 'Swedish');
GO
INSERT INTO languages (id, uuid, code, name) VALUES (155, 'f85f3030-5e17-5346-9b2b-83b24977a396', 'sw', 'Swahili');
GO
INSERT INTO languages (id, uuid, code, name) VALUES (156, 'de984cef-3048-574e-9310-2b76d3e5bfe9', 'ta', 'Tamil');
GO
INSERT INTO languages (id, uuid, code, name) VALUES (157, 'e0d7b7e1-deaf-572c-84c8-6bc71aa95d7c', 'te', 'Telugu');
GO
INSERT INTO languages (id, uuid, code, name) VALUES (158, '6e13bf27-5f12-5ec5-8cb8-2215acc71c76', 'tg', 'Tajik');
GO
INSERT INTO languages (id, uuid, code, name) VALUES (159, '1d4dd014-563e-56ce-8bda-ab187b5eaf8f', 'th', 'Thai');
GO
INSERT INTO languages (id, uuid, code, name) VALUES (160, '238e0b4a-661b-566d-b30e-b9b0952789c8', 'ti', 'Tigrinya');
GO
INSERT INTO languages (id, uuid, code, name) VALUES (161, 'e52ad6be-4b3c-542a-9226-a5e4597fdfb4', 'tk', 'Turkmen');
GO
INSERT INTO languages (id, uuid, code, name) VALUES (162, '93079df2-a81d-5443-aa33-4932f7e8cc24', 'tl', 'Tagalog');
GO
INSERT INTO languages (id, uuid, code, name) VALUES (163, '8e2bedf8-4842-5b22-bb34-225fd33c39b2', 'tn', 'Tswana');
GO
INSERT INTO languages (id, uuid, code, name) VALUES (164, '9bc3e47c-61da-5441-9dd5-7ec3d484f87e', 'to', 'Tonga');
GO
INSERT INTO languages (id, uuid, code, name) VALUES (165, 'eeb98262-53c3-540c-9921-37e45690814e', 'tr', 'Turkish');
GO
INSERT INTO languages (id, uuid, code, name) VALUES (166, '469c1121-0fc7-59b6-9657-4c4e911b90a2', 'ts', 'Tsonga');
GO
INSERT INTO languages (id, uuid, code, name) VALUES (167, '7ca20f8b-5664-57cc-ace9-0374a2fb4a21', 'tt', 'Tatar');
GO
INSERT INTO languages (id, uuid, code, name) VALUES (168, 'a2dd435a-99e4-57a3-a183-3ca98738a686', 'tw', 'Twi');
GO
INSERT INTO languages (id, uuid, code, name) VALUES (169, '735f5a43-3f87-5bdb-bbaa-a5c6fc5db87c', 'ty', 'Tahitian');
GO
INSERT INTO languages (id, uuid, code, name) VALUES (170, '8c6de9d4-6c45-520c-9165-5405461cf476', 'ug', 'Uyghur');
GO
INSERT INTO languages (id, uuid, code, name) VALUES (171, '2c9cac34-6433-513c-8190-c0e454935e74', 'uk', 'Ukrainian');
GO
INSERT INTO languages (id, uuid, code, name) VALUES (172, 'f0edd6d9-a7bc-530e-b887-115b34dc36aa', 'ur', 'Urdu');
GO
INSERT INTO languages (id, uuid, code, name) VALUES (173, 'a4608fb9-729b-5b1b-a97b-3e98c66d3ad3', 'uz', 'Uzbek');
GO
INSERT INTO languages (id, uuid, code, name) VALUES (174, '721a3c9e-2665-5682-8649-fd5f3bbb0e53', 've', 'Venda');
GO
INSERT INTO languages (id, uuid, code, name) VALUES (175, '2b6bcf5c-8095-5a97-8101-05236d33d816', 'vi', 'Vietnamese');
GO
INSERT INTO languages (id, uuid, code, name) VALUES (176, '47766421-855a-5c1c-8302-e9876e1236b3', 'vo', 'Volapük');
GO
INSERT INTO languages (id, uuid, code, name) VALUES (177, '78a4f133-2db3-520d-96b0-1efec813089b', 'wa', 'Walloon');
GO
INSERT INTO languages (id, uuid, code, name) VALUES (178, 'a6a97a23-0c34-53ea-bb74-1bde7cb6d129', 'wo', 'Wolof');
GO
INSERT INTO languages (id, uuid, code, name) VALUES (179, 'a2423d31-7399-5cb4-b6b1-e25566780c02', 'xh', 'Xhosa');
GO
INSERT INTO languages (id, uuid, code, name) VALUES (180, '30c61d86-b203-5370-b41b-74468ae45c46', 'yi', 'Yiddish');
GO
INSERT INTO languages (id, uuid, code, name) VALUES (181, '5aacffe7-f0fd-5e45-ad74-53afd6c1b4cb', 'yo', 'Yoruba');
GO
INSERT INTO languages (id, uuid, code, name) VALUES (182, '3204c7bf-15c6-5508-88e3-b5d5f4768310', 'za', 'Zhuang');
GO
INSERT INTO languages (id, uuid, code, name) VALUES (183, 'ad3167e0-2e44-565e-9674-175ac3573ebc', 'zh', 'Chinese');
GO
INSERT INTO languages (id, uuid, code, name) VALUES (184, '00f38ad9-a827-5e61-b2f9-fca105399186', 'zu', 'Zulu');
GO
-- Seeds: mime_types
GO
INSERT INTO mime_types (id, uuid, name, description) VALUES (1, 'c314036d-1636-599c-8f07-873b287dfaf8', 'text/plain', 'Plain text');
GO
INSERT INTO mime_types (id, uuid, name, description) VALUES (2, 'a2d56a1d-e6a9-5f75-a8f9-f561ec9f1c1e', 'text/html', 'HTML document');
GO
INSERT INTO mime_types (id, uuid, name, description) VALUES (3, 'eff17426-2427-58c4-a20b-9161f71f3318', 'text/css', 'Cascading Style Sheets');
GO
INSERT INTO mime_types (id, uuid, name, description) VALUES (4, '6f44322f-e2d0-52d6-bd95-a65fccaa4eac', 'text/csv', 'Comma-separated values');
GO
INSERT INTO mime_types (id, uuid, name, description) VALUES (5, '2e7c1c3a-760a-5cb5-bd6d-727222793ea2', 'text/markdown', 'Markdown document');
GO
INSERT INTO mime_types (id, uuid, name, description) VALUES (6, 'b020a6fc-91c2-5201-b826-aa230bd31583', 'text/javascript', 'JavaScript');
GO
INSERT INTO mime_types (id, uuid, name, description) VALUES (7, '40bd465e-0bf4-5c79-8134-2ca7e7c92068', 'text/calendar', 'iCalendar');
GO
INSERT INTO mime_types (id, uuid, name, description) VALUES (8, '6fc1eb1b-2946-5cc1-9926-53def72bb068', 'text/xml', 'XML (text)');
GO
INSERT INTO mime_types (id, uuid, name, description) VALUES (9, '26df0145-760a-5c51-9264-b029e825c359', 'application/json', 'JSON');
GO
INSERT INTO mime_types (id, uuid, name, description) VALUES (10, '688f7089-bad3-5e42-aa40-4eac057cd163', 'application/xml', 'XML');
GO
INSERT INTO mime_types (id, uuid, name, description) VALUES (11, 'd8e3a307-19bb-5daf-a240-2971745bd709', 'application/pdf', 'Adobe PDF document');
GO
INSERT INTO mime_types (id, uuid, name, description) VALUES (12, 'e544b14e-e5e2-558d-bdae-d29ccd2dc08c', 'application/zip', 'ZIP archive');
GO
INSERT INTO mime_types (id, uuid, name, description) VALUES (13, 'dd5af9fc-5ef5-5681-a333-aa98d8c4b293', 'application/gzip', 'GZip archive');
GO
INSERT INTO mime_types (id, uuid, name, description) VALUES (14, '270f2e24-9bc8-56a7-8dcf-d597c676d2ae', 'application/x-tar', 'Tape archive (tar)');
GO
INSERT INTO mime_types (id, uuid, name, description) VALUES (15, '968dadca-46a2-55e6-ac77-4b554743474d', 'application/x-7z-compressed', '7-Zip archive');
GO
INSERT INTO mime_types (id, uuid, name, description) VALUES (16, 'b8a266ef-7c5a-56c9-a754-19cd543f56e0', 'application/x-rar-compressed', 'RAR archive');
GO
INSERT INTO mime_types (id, uuid, name, description) VALUES (17, 'a78bd65e-83c2-5093-8d8b-e5ef9b671b01', 'application/octet-stream', 'Arbitrary binary data');
GO
INSERT INTO mime_types (id, uuid, name, description) VALUES (18, 'cd6eee64-ae2d-5187-997d-a73bd20e61c2', 'application/javascript', 'JavaScript');
GO
INSERT INTO mime_types (id, uuid, name, description) VALUES (19, 'dad44d80-0812-50ee-ae2c-2b9e035ce0b6', 'application/x-www-form-urlencoded', 'URL-encoded form data');
GO
INSERT INTO mime_types (id, uuid, name, description) VALUES (20, '9fad4d69-b6c1-52c5-9ba0-c24fa2624ca8', 'application/yaml', 'YAML');
GO
INSERT INTO mime_types (id, uuid, name, description) VALUES (21, '0dccdd96-8da6-5d7b-9d46-6642948cc4b7', 'application/sql', 'SQL');
GO
INSERT INTO mime_types (id, uuid, name, description) VALUES (22, 'a8e2777d-21d8-5969-9f10-cce3eb5df587', 'application/rtf', 'Rich Text Format');
GO
INSERT INTO mime_types (id, uuid, name, description) VALUES (23, '9abba6b8-3582-5efc-be74-4125f283d7d7', 'application/msword', 'Microsoft Word (.doc)');
GO
INSERT INTO mime_types (id, uuid, name, description) VALUES (24, 'bbb21ad8-bf70-5e13-91aa-e322f750a854', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'Microsoft Word (.docx)');
GO
INSERT INTO mime_types (id, uuid, name, description) VALUES (25, '3b8c0d22-f538-544a-b4ce-413efa011ff2', 'application/vnd.ms-excel', 'Microsoft Excel (.xls)');
GO
INSERT INTO mime_types (id, uuid, name, description) VALUES (26, '0d3c9367-795c-52cc-a47a-f362165097e3', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'Microsoft Excel (.xlsx)');
GO
INSERT INTO mime_types (id, uuid, name, description) VALUES (27, '3e898c1e-3e24-5e58-b6c2-146cbda9c09c', 'application/vnd.ms-powerpoint', 'Microsoft PowerPoint (.ppt)');
GO
INSERT INTO mime_types (id, uuid, name, description) VALUES (28, '48c6edfb-2d65-5151-9059-a97a53a78664', 'application/vnd.openxmlformats-officedocument.presentationml.presentation', 'Microsoft PowerPoint (.pptx)');
GO
INSERT INTO mime_types (id, uuid, name, description) VALUES (29, '9073ed4a-5368-5ca7-8132-01e1145e78d5', 'application/vnd.oasis.opendocument.text', 'OpenDocument text');
GO
INSERT INTO mime_types (id, uuid, name, description) VALUES (30, 'b7cca9d2-cdd3-5baa-8719-72fcd3ec7afc', 'application/vnd.oasis.opendocument.spreadsheet', 'OpenDocument spreadsheet');
GO
INSERT INTO mime_types (id, uuid, name, description) VALUES (31, '0148db5e-c81a-5615-adfb-9b7b67f37a0d', 'application/wasm', 'WebAssembly');
GO
INSERT INTO mime_types (id, uuid, name, description) VALUES (32, 'be65518c-1f0a-50bb-8f22-43da72edb01b', 'image/jpeg', 'JPEG image');
GO
INSERT INTO mime_types (id, uuid, name, description) VALUES (33, 'fab62806-2bc1-5dfb-b84f-3182042fbf00', 'image/png', 'PNG image');
GO
INSERT INTO mime_types (id, uuid, name, description) VALUES (34, '1562a470-e867-5721-b81c-cc9cd82ef940', 'image/gif', 'GIF image');
GO
INSERT INTO mime_types (id, uuid, name, description) VALUES (35, 'fbc1747b-f259-5e42-ac96-971b45786c76', 'image/webp', 'WebP image');
GO
INSERT INTO mime_types (id, uuid, name, description) VALUES (36, '974a5247-d5ef-51aa-b1b7-dfefa01ae2c1', 'image/svg+xml', 'SVG image');
GO
INSERT INTO mime_types (id, uuid, name, description) VALUES (37, 'fb647af9-b1c5-57bd-a2ea-cba9ee76b9aa', 'image/bmp', 'Bitmap image');
GO
INSERT INTO mime_types (id, uuid, name, description) VALUES (38, '9f6a882e-1cc2-519f-b704-05565ed047ac', 'image/tiff', 'TIFF image');
GO
INSERT INTO mime_types (id, uuid, name, description) VALUES (39, 'b0749282-ea19-59b0-8eef-96683832ec7a', 'image/x-icon', 'Icon image');
GO
INSERT INTO mime_types (id, uuid, name, description) VALUES (40, '53be37ed-8b02-5d97-ae86-0cf071639288', 'image/avif', 'AVIF image');
GO
INSERT INTO mime_types (id, uuid, name, description) VALUES (41, '8bf77392-4627-5928-9e4f-c7537064a618', 'audio/mpeg', 'MP3 audio');
GO
INSERT INTO mime_types (id, uuid, name, description) VALUES (42, 'ef25cb4f-02f6-5901-a09f-7c099f89f1b5', 'audio/ogg', 'Ogg audio');
GO
INSERT INTO mime_types (id, uuid, name, description) VALUES (43, '9942c2d6-5dee-5837-9922-f94d0a5e9083', 'audio/wav', 'WAV audio');
GO
INSERT INTO mime_types (id, uuid, name, description) VALUES (44, '81a9751d-2a08-586a-9efe-3ebadc61faee', 'audio/webm', 'WebM audio');
GO
INSERT INTO mime_types (id, uuid, name, description) VALUES (45, '24be6b58-a801-5b67-8ae4-221ba95218b5', 'audio/aac', 'AAC audio');
GO
INSERT INTO mime_types (id, uuid, name, description) VALUES (46, 'c35fa815-9810-556d-a409-fa6be290732e', 'audio/flac', 'FLAC audio');
GO
INSERT INTO mime_types (id, uuid, name, description) VALUES (47, 'd74a455f-c8d1-5506-a78c-dd1b5c16c6ee', 'video/mp4', 'MP4 video');
GO
INSERT INTO mime_types (id, uuid, name, description) VALUES (48, 'adbb7e18-8861-56a2-b4e4-a94126b444a5', 'video/mpeg', 'MPEG video');
GO
INSERT INTO mime_types (id, uuid, name, description) VALUES (49, '206c181c-dcbe-5573-9c71-22e8b03693dd', 'video/ogg', 'Ogg video');
GO
INSERT INTO mime_types (id, uuid, name, description) VALUES (50, 'a2a36e34-7180-5a6b-8b5d-49930b40ce92', 'video/webm', 'WebM video');
GO
INSERT INTO mime_types (id, uuid, name, description) VALUES (51, '4c2b4eeb-f34a-5bdd-b7ef-38f7006595ee', 'video/quicktime', 'QuickTime video');
GO
INSERT INTO mime_types (id, uuid, name, description) VALUES (52, 'b0e0d96e-b80e-54ac-80f1-d9130c1a53c6', 'video/x-msvideo', 'AVI video');
GO
INSERT INTO mime_types (id, uuid, name, description) VALUES (53, 'db703a8a-a881-596e-abd6-5eef447db7b1', 'font/woff', 'Web Open Font Format');
GO
INSERT INTO mime_types (id, uuid, name, description) VALUES (54, 'a24f44b7-b6e2-5954-bd4e-36f1c35027af', 'font/woff2', 'Web Open Font Format 2');
GO
INSERT INTO mime_types (id, uuid, name, description) VALUES (55, 'cf4dcb66-76ee-5b92-a8dc-9fd853452303', 'font/ttf', 'TrueType font');
GO
INSERT INTO mime_types (id, uuid, name, description) VALUES (56, 'e41fdd8d-b4de-5114-b7bf-af1da0d12fd0', 'font/otf', 'OpenType font');
GO
INSERT INTO mime_types (id, uuid, name, description) VALUES (57, 'c6e1daa8-d09a-5bd9-815b-bc8c82e57c52', 'multipart/form-data', 'Multipart form data');
GO
-- Seeds: template_types
GO
INSERT INTO template_types (id, uuid, name, description) VALUES (1, '88ba1ed1-69f1-54cf-9b1f-0273aaa19012', 'jigsaw', 'Jigsaw template settings');
GO
-- Seeds: oauth_grant_types
GO
INSERT INTO oauth_grant_types (id, uuid, name, description) VALUES (1, '28ac257b-2eb0-544f-ad7a-059baa8a0022', 'authorization_code', 'The Authorization Code grant type lets confidential and public clients exchange an authorization code for an access token after the user is redirected back to the client.');
GO
INSERT INTO oauth_grant_types (id, uuid, name, description) VALUES (2, '87dcd7de-44c1-5a22-8842-b102df36e651', 'refresh_token', 'The Refresh Token grant type lets clients exchange a refresh token for a new access token once the original has expired, allowing them to maintain valid access without requiring further user interaction.');
GO
INSERT INTO oauth_grant_types (id, uuid, name, description) VALUES (3, '202c534d-968d-58b1-a5e3-40a0ccfd0100', 'urn:ietf:params:oauth:grant-type:device_code', 'The Device Code grant type enables browserless or input-constrained devices to exchange a previously obtained device code for an access token.');
GO
INSERT INTO oauth_grant_types (id, uuid, name, description) VALUES (4, '9ede56b9-bf7e-582f-acf4-4e72d91fe9cd', 'client_credentials', 'To authenticate this request, the client can either include client_id and client_secret as additional request parameters, or pass them via the HTTP Basic auth header.');
GO
INSERT INTO oauth_grant_types (id, uuid, name, description, is_legacy) VALUES (5, '88ea1e58-c478-53a1-b7ad-2992705a254c', 'implicit', 'The Implicit flow was a simplified OAuth flow previously recommended for native and JavaScript apps that returned an access token immediately, bypassing the authorization code exchange step.', 1);
GO
INSERT INTO oauth_grant_types (id, uuid, name, description, is_legacy) VALUES (6, '21f39a2d-5223-53fe-9133-aff10c0feb20', 'password', 'The Password grant type is a legacy method for exchanging a user''s credentials directly for an access token. Since this requires the client to collect and transmit the user''s password to the authorization server, it is no longer recommended.', 1);
GO
-- Seeds: secret_types
GO
INSERT INTO secret_types (id, uuid, name) VALUES (1, '8848a159-86a5-519f-8289-e7493c905cc1', 'password_argon2id');
GO
INSERT INTO secret_types (id, uuid, name) VALUES (2, 'bb4eb707-a148-5a99-bcd3-0e978f80bc23', 'password_bcrypt');
GO
INSERT INTO secret_types (id, uuid, name) VALUES (3, 'c475da12-370e-5cef-bf85-e513866bb62a', 'pin_argon2id');
GO
INSERT INTO secret_types (id, uuid, name) VALUES (4, '2c0035c5-3510-5c56-87a8-689a0326e356', 'pin_bcrypt');
GO
-- Seeds: token_types
GO
INSERT INTO token_types (id, uuid, name, description) VALUES (1, '8b7ad845-911a-5d50-b42c-2c7462c2ad59', 'text', 'Opaque text token');
GO
INSERT INTO token_types (id, uuid, name, description) VALUES (2, '75a005dc-5ddb-51e2-8bcc-3000f324d2ef', 'guid', 'GUID token');
GO
INSERT INTO token_types (id, uuid, name, description) VALUES (3, 'aca707e1-3734-5144-9672-81729882b595', 'jwt_access_token', 'Short-lived JWT access token');
GO
INSERT INTO token_types (id, uuid, name, description) VALUES (4, 'cd47f747-f368-5287-881a-8d7a030984f0', 'jwt_refresh_token', 'Long-lived JWT refresh token');
GO
INSERT INTO token_types (id, uuid, name, description) VALUES (5, '0ee8e7da-925d-5595-b865-77c620798be9', 'signin_token', 'Single-use signin token exchanged for access and refresh tokens');
GO
-- Seeds: identity_provider_types
GO
INSERT INTO identity_provider_types (id, uuid, name, description) VALUES (1, '98c8fb88-c868-5b82-ab5c-719f5220c55b', 'oidc', 'OpenID Connect provider (Google, Apple, Microsoft); identity comes from the id_token');
GO
INSERT INTO identity_provider_types (id, uuid, name, description) VALUES (2, '3f1582a8-db5c-5103-89fe-95d3bc7a1ed9', 'oauth2', 'Plain OAuth 2.0 provider (Facebook, GitHub); identity comes from the userinfo endpoint');
GO
-- Seeds: identity_provider_linked_user_field_types
GO
INSERT INTO identity_provider_linked_user_field_types (id, uuid, name) VALUES (1, '0f4dcbc7-2eca-5ace-8e81-df63f50c6685', 'subject');
GO
INSERT INTO identity_provider_linked_user_field_types (id, uuid, name) VALUES (2, '06f33c03-9290-58f9-b11d-f570adce6d2f', 'email');
GO
INSERT INTO identity_provider_linked_user_field_types (id, uuid, name) VALUES (3, 'b63ee1b1-6192-5e26-b3cc-a239c392daf7', 'email_verified');
GO
INSERT INTO identity_provider_linked_user_field_types (id, uuid, name) VALUES (4, 'e9f9739b-5551-5ee4-9d91-a9daa1182df5', 'first_name');
GO
INSERT INTO identity_provider_linked_user_field_types (id, uuid, name) VALUES (5, 'f1a00e4b-ca94-5aef-86d8-854826d0592d', 'last_name');
GO
INSERT INTO identity_provider_linked_user_field_types (id, uuid, name) VALUES (6, '85375f6d-a5d7-5f6c-aa9e-076dd7a592f1', 'avatar_url');
GO
-- Seeds: session_types
GO
INSERT INTO session_types (id, uuid, name) VALUES (1, 'c188cb23-ccea-5a69-b437-43e991dd8230', 'Signin');
GO
INSERT INTO session_types (id, uuid, name) VALUES (2, '58e7aafa-edc0-5f83-8255-9807e133a93a', 'LocalApplication');
