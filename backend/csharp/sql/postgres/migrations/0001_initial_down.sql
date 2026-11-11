-- Rollback initial migration for postgres

-- DROP tables (reverse dependency order)
DROP TABLE IF EXISTS "session_states_bases";
GO
DROP TABLE IF EXISTS "session_hits_bases";
GO
DROP TABLE IF EXISTS "sessions_bases";
GO
DROP TABLE IF EXISTS "session_types";
GO
DROP TABLE IF EXISTS "user_tokens";
GO
DROP TABLE IF EXISTS "tokens_bases";
GO
DROP TABLE IF EXISTS "token_types";
GO
DROP TABLE IF EXISTS "user_secrets";
GO
DROP TABLE IF EXISTS "secrets_bases";
GO
DROP TABLE IF EXISTS "secret_types";
GO
DROP TABLE IF EXISTS "reviews";
GO
DROP TABLE IF EXISTS "game_attributes";
GO
DROP TABLE IF EXISTS "game_settings";
GO
DROP TABLE IF EXISTS "game_parent_settings";
GO
DROP TABLE IF EXISTS "game_states";
GO
DROP TABLE IF EXISTS "game_parent_categories";
GO
DROP TABLE IF EXISTS "game_categories";
GO
DROP TABLE IF EXISTS "games";
GO
DROP TABLE IF EXISTS "game_parent_configs";
GO
DROP TABLE IF EXISTS "game_parents";
GO
DROP TABLE IF EXISTS "categories";
GO
DROP TABLE IF EXISTS "templates";
GO
DROP TABLE IF EXISTS "template_types";
GO
DROP TABLE IF EXISTS "resources";
GO
DROP TABLE IF EXISTS "mime_types";
GO
DROP TABLE IF EXISTS "localized_strings";
GO
DROP TABLE IF EXISTS "localized_string_names";
GO
DROP TABLE IF EXISTS "languages";
GO
DROP TABLE IF EXISTS "phone_labels";
GO
DROP TABLE IF EXISTS "email_labels";
GO
DROP TABLE IF EXISTS "address_labels";
GO
DROP TABLE IF EXISTS "contact_labels";
GO
DROP TABLE IF EXISTS "labels";
GO
DROP TABLE IF EXISTS "phone_attributes";
GO
DROP TABLE IF EXISTS "email_attributes";
GO
DROP TABLE IF EXISTS "address_attributes";
GO
DROP TABLE IF EXISTS "contact_attributes";
GO
DROP TABLE IF EXISTS "addresses";
GO
DROP TABLE IF EXISTS "phones";
GO
DROP TABLE IF EXISTS "phone_types";
GO
DROP TABLE IF EXISTS "emails";
GO
DROP TABLE IF EXISTS "email_types";
GO
DROP TABLE IF EXISTS "contacts";
GO
DROP TABLE IF EXISTS "genders";
GO
DROP TABLE IF EXISTS "user_settings";
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
