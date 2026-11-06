-- Rollback migration for sqlite
DROP TRIGGER IF EXISTS "trg_reviews_updated_at";
GO
DROP TABLE IF EXISTS "reviews";
GO
DROP TRIGGER IF EXISTS "trg_game_settings_updated_at";
GO
DROP INDEX IF EXISTS "game_settings_game_setting_game_id_name_index";
GO
DROP TABLE IF EXISTS "game_settings";
GO
DROP TRIGGER IF EXISTS "trg_game_parent_settings_updated_at";
GO
DROP INDEX IF EXISTS "game_parent_settings_game_parent_setting_game_parent_id_name_index";
GO
DROP TABLE IF EXISTS "game_parent_settings";
GO
DROP TRIGGER IF EXISTS "trg_game_states_updated_at";
GO
DROP TABLE IF EXISTS "game_states";
GO
DROP TRIGGER IF EXISTS "trg_game_parent_categories_updated_at";
GO
DROP INDEX IF EXISTS "game_parent_categories_game_parent_category_game_parent_id_category_id_index";
GO
DROP TABLE IF EXISTS "game_parent_categories";
GO
DROP TRIGGER IF EXISTS "trg_game_categories_updated_at";
GO
DROP INDEX IF EXISTS "game_categories_game_category_game_id_category_id_index";
GO
DROP TABLE IF EXISTS "game_categories";
GO
DROP TRIGGER IF EXISTS "trg_games_updated_at";
GO
DROP TABLE IF EXISTS "games";
GO
DROP TRIGGER IF EXISTS "trg_game_parent_configs_updated_at";
GO
DROP TABLE IF EXISTS "game_parent_configs";
GO
DROP TRIGGER IF EXISTS "trg_game_parent_bases_updated_at";
GO
DROP TABLE IF EXISTS "game_parent_bases";
GO
DROP TRIGGER IF EXISTS "trg_categories_updated_at";
GO
DROP TABLE IF EXISTS "categories";
GO
DROP TRIGGER IF EXISTS "trg_resource_bases_updated_at";
GO
DROP TABLE IF EXISTS "resource_bases";
GO
DROP TRIGGER IF EXISTS "trg_mime_types_updated_at";
GO
DROP TABLE IF EXISTS "mime_types";
GO
DROP TRIGGER IF EXISTS "trg_localized_string_bases_updated_at";
GO
DROP TABLE IF EXISTS "localized_string_bases";
GO
DROP TRIGGER IF EXISTS "trg_localized_string_names_updated_at";
GO
DROP TABLE IF EXISTS "localized_string_names";
GO
DROP TRIGGER IF EXISTS "trg_languages_updated_at";
GO
DROP TABLE IF EXISTS "languages";
GO
DROP TRIGGER IF EXISTS "trg_phone_labels_updated_at";
GO
DROP INDEX IF EXISTS "phone_labels_phone_label_phone_id_label_id_index";
GO
DROP TABLE IF EXISTS "phone_labels";
GO
DROP TRIGGER IF EXISTS "trg_email_labels_updated_at";
GO
DROP INDEX IF EXISTS "email_labels_email_label_email_id_label_id_index";
GO
DROP TABLE IF EXISTS "email_labels";
GO
DROP TRIGGER IF EXISTS "trg_address_labels_updated_at";
GO
DROP INDEX IF EXISTS "address_labels_address_label_address_id_label_id_index";
GO
DROP TABLE IF EXISTS "address_labels";
GO
DROP TRIGGER IF EXISTS "trg_contact_labels_updated_at";
GO
DROP INDEX IF EXISTS "contact_labels_contact_label_label_id_index_index";
GO
DROP INDEX IF EXISTS "contact_labels_contact_label_contact_id_label_id_index_index";
GO
DROP TABLE IF EXISTS "contact_labels";
GO
DROP TRIGGER IF EXISTS "trg_labels_updated_at";
GO
DROP TABLE IF EXISTS "labels";
GO
DROP TRIGGER IF EXISTS "trg_phone_attributes_updated_at";
GO
DROP INDEX IF EXISTS "phone_attributes_owner_key_index";
GO
DROP TABLE IF EXISTS "phone_attributes";
GO
DROP TRIGGER IF EXISTS "trg_email_attributes_updated_at";
GO
DROP INDEX IF EXISTS "email_attributes_owner_key_index";
GO
DROP TABLE IF EXISTS "email_attributes";
GO
DROP TRIGGER IF EXISTS "trg_address_attributes_updated_at";
GO
DROP INDEX IF EXISTS "address_attributes_owner_key_index";
GO
DROP INDEX IF EXISTS "address_attributes_address_attribute_address_id_index_index";
GO
DROP TABLE IF EXISTS "address_attributes";
GO
DROP TRIGGER IF EXISTS "trg_contact_attributes_updated_at";
GO
DROP INDEX IF EXISTS "contact_attributes_owner_key_index";
GO
DROP INDEX IF EXISTS "contact_attributes_contact_attribute_contact_id_name_index_index";
GO
DROP TABLE IF EXISTS "contact_attributes";
GO
DROP TRIGGER IF EXISTS "trg_addresses_updated_at";
GO
DROP INDEX IF EXISTS "addresses_address_contact_id_address_type_id_index_index";
GO
DROP TABLE IF EXISTS "addresses";
GO
DROP TRIGGER IF EXISTS "trg_address_types_updated_at";
GO
DROP TABLE IF EXISTS "address_types";
GO
DROP TRIGGER IF EXISTS "trg_phones_updated_at";
GO
DROP INDEX IF EXISTS "phones_contact_id_phone_type_id_index_index";
GO
DROP TABLE IF EXISTS "phones";
GO
DROP TRIGGER IF EXISTS "trg_phone_types_updated_at";
GO
DROP TABLE IF EXISTS "phone_types";
GO
DROP TRIGGER IF EXISTS "trg_emails_updated_at";
GO
DROP INDEX IF EXISTS "emails_contact_id_email_type_id_index_index";
GO
DROP TABLE IF EXISTS "emails";
GO
DROP TRIGGER IF EXISTS "trg_email_types_updated_at";
GO
DROP TABLE IF EXISTS "email_types";
GO
DROP TRIGGER IF EXISTS "trg_contacts_updated_at";
GO
DROP TABLE IF EXISTS "contacts";
GO
DROP TRIGGER IF EXISTS "trg_genders_updated_at";
GO
DROP TABLE IF EXISTS "genders";
GO
DROP TRIGGER IF EXISTS "trg_user_settings_updated_at";
GO
DROP INDEX IF EXISTS "user_settings_user_setting_user_id_name_index";
GO
DROP TABLE IF EXISTS "user_settings";
GO
DROP TRIGGER IF EXISTS "trg_user_roles_updated_at";
GO
DROP TABLE IF EXISTS "user_roles";
GO
DROP TRIGGER IF EXISTS "trg_user_groups_updated_at";
GO
DROP TABLE IF EXISTS "user_groups";
GO
DROP TRIGGER IF EXISTS "trg_groups_updated_at";
GO
DROP TABLE IF EXISTS "groups";
GO
DROP TRIGGER IF EXISTS "trg_roles_updated_at";
GO
DROP TABLE IF EXISTS "roles";
GO
DROP TRIGGER IF EXISTS "trg_users_updated_at";
GO
DROP TABLE IF EXISTS "users";
