-- Rollback initial migration for sqlite

-- DROP tables (reverse dependency order)
DROP TABLE IF EXISTS "reviews";
GO
DROP TABLE IF EXISTS "game_settings";
GO
DROP TABLE IF EXISTS "game_states";
GO
DROP TABLE IF EXISTS "games_categories";
GO
DROP TABLE IF EXISTS "games_bases";
GO
DROP TABLE IF EXISTS "categories";
GO
DROP TABLE IF EXISTS "user_settings";
GO
DROP TABLE IF EXISTS "contact_change_logs";
GO
DROP TABLE IF EXISTS "legacy_contacts";
GO
DROP TABLE IF EXISTS "contact_group_members";
GO
DROP TABLE IF EXISTS "contact_preferences";
GO
DROP TABLE IF EXISTS "contact_settings";
GO
DROP TABLE IF EXISTS "contact_groups_bases";
GO
DROP TABLE IF EXISTS "phone_bases";
GO
DROP TABLE IF EXISTS "address_bases";
GO
DROP TABLE IF EXISTS "contacts_bases";
GO
DROP TABLE IF EXISTS "phone_types";
GO
DROP TABLE IF EXISTS "address_types";
GO
DROP TABLE IF EXISTS "contact_sources";
GO
DROP TABLE IF EXISTS "user_roles";
GO
DROP TABLE IF EXISTS "user_groups";
GO
DROP TABLE IF EXISTS "groups";
GO
DROP TABLE IF EXISTS "roles";
GO
DROP TABLE IF EXISTS "users";
