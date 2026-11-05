-- Rollback migration for postgres
DROP TRIGGER IF EXISTS "trg_reviews_updated_at" ON "reviews";
GO
DROP TABLE IF EXISTS "reviews";
GO
DROP TRIGGER IF EXISTS "trg_game_settings_updated_at" ON "game_settings";
GO
DROP INDEX IF EXISTS "game_settings_game_setting_game_id_name_index";
GO
DROP TABLE IF EXISTS "game_settings";
GO
DROP TRIGGER IF EXISTS "trg_game_states_updated_at" ON "game_states";
GO
DROP TABLE IF EXISTS "game_states";
GO
DROP TRIGGER IF EXISTS "trg_game_categories_updated_at" ON "game_categories";
GO
DROP INDEX IF EXISTS "game_categories_game_category_game_id_category_id_index";
GO
DROP TABLE IF EXISTS "game_categories";
GO
DROP TRIGGER IF EXISTS "trg_game_bases_updated_at" ON "game_bases";
GO
DROP TABLE IF EXISTS "game_bases";
GO
DROP TRIGGER IF EXISTS "trg_categories_updated_at" ON "categories";
GO
DROP TABLE IF EXISTS "categories";
GO
DROP TABLE IF EXISTS "contact_change_logs";
GO
DROP TABLE IF EXISTS "legacy_contacts";
GO
DROP TRIGGER IF EXISTS "trg_contact_group_members_updated_at" ON "contact_group_members";
GO
DROP TABLE IF EXISTS "contact_group_members";
GO
DROP TRIGGER IF EXISTS "trg_contact_preferences_updated_at" ON "contact_preferences";
GO
DROP INDEX IF EXISTS "contact_preferences_owner_key_index";
GO
DROP TABLE IF EXISTS "contact_preferences";
GO
DROP TRIGGER IF EXISTS "trg_contact_settings_updated_at" ON "contact_settings";
GO
DROP INDEX IF EXISTS "contact_settings_owner_key_index";
GO
DROP TABLE IF EXISTS "contact_settings";
GO
DROP TRIGGER IF EXISTS "trg_contact_group_bases_updated_at" ON "contact_group_bases";
GO
DROP TABLE IF EXISTS "contact_group_bases";
GO
DROP TRIGGER IF EXISTS "trg_phone_bases_updated_at" ON "phone_bases";
GO
DROP TABLE IF EXISTS "phone_bases";
GO
DROP TRIGGER IF EXISTS "trg_address_bases_updated_at" ON "address_bases";
GO
DROP TABLE IF EXISTS "address_bases";
GO
DROP TRIGGER IF EXISTS "trg_contact_bases_updated_at" ON "contact_bases";
GO
DROP TABLE IF EXISTS "contact_bases";
GO
DROP TRIGGER IF EXISTS "trg_phone_types_updated_at" ON "phone_types";
GO
DROP TABLE IF EXISTS "phone_types";
GO
DROP TRIGGER IF EXISTS "trg_address_types_updated_at" ON "address_types";
GO
DROP TABLE IF EXISTS "address_types";
GO
DROP TRIGGER IF EXISTS "trg_contact_sources_updated_at" ON "contact_sources";
GO
DROP TABLE IF EXISTS "contact_sources";
GO
DROP TRIGGER IF EXISTS "trg_user_settings_updated_at" ON "user_settings";
GO
DROP INDEX IF EXISTS "user_settings_user_setting_user_id_name_index";
GO
DROP TABLE IF EXISTS "user_settings";
GO
DROP TRIGGER IF EXISTS "trg_user_roles_updated_at" ON "user_roles";
GO
DROP TABLE IF EXISTS "user_roles";
GO
DROP TRIGGER IF EXISTS "trg_user_groups_updated_at" ON "user_groups";
GO
DROP TABLE IF EXISTS "user_groups";
GO
DROP TRIGGER IF EXISTS "trg_groups_updated_at" ON "groups";
GO
DROP TABLE IF EXISTS "groups";
GO
DROP TRIGGER IF EXISTS "trg_roles_updated_at" ON "roles";
GO
DROP TABLE IF EXISTS "roles";
GO
DROP TRIGGER IF EXISTS "trg_users_updated_at" ON "users";
GO
DROP TABLE IF EXISTS "users";
