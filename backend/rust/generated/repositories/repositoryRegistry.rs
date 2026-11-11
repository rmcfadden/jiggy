use datasources::{Datasource, DatasourceError, ICRUDRepository, IReadonlyRepository, RepositoryFactory};
use super::super::Address;
use super::super::AddressAttribute;
use super::super::AddressLabel;
use super::super::Category;
use super::super::Contact;
use super::super::ContactAttribute;
use super::super::ContactLabel;
use super::super::Email;
use super::super::EmailAttribute;
use super::super::EmailLabel;
use super::super::EmailType;
use super::super::Game;
use super::super::GameAttribute;
use super::super::GameCategory;
use super::super::GameParent;
use super::super::GameParentCategory;
use super::super::GameParentConfig;
use super::super::GameParentSetting;
use super::super::GameSetting;
use super::super::GameState;
use super::super::Gender;
use super::super::Group;
use super::super::Label;
use super::super::Language;
use super::super::LocalizedString;
use super::super::LocalizedStringName;
use super::super::MimeType;
use super::super::Phone;
use super::super::PhoneAttribute;
use super::super::PhoneLabel;
use super::super::PhoneType;
use super::super::Resource;
use super::super::Review;
use super::super::Role;
use super::super::Secret;
use super::super::SecretType;
use super::super::Session;
use super::super::SessionHit;
use super::super::SessionStatesBase;
use super::super::SessionType;
use super::super::Template;
use super::super::TemplateType;
use super::super::Token;
use super::super::TokenType;
use super::super::User;
use super::super::UserGroup;
use super::super::UserRole;
use super::super::UserSecret;
use super::super::UserSetting;
use super::super::UserToken;
use std::sync::Arc;

pub fn register(factory: &RepositoryFactory) {
    factory.register_named(
        "Address",
        "addresses",
        |connection| Ok(Arc::new(super::addressesRepository::AddressesRepository::new(connection).expect("repository")) as Arc<dyn ICRUDRepository<Address>>),
        |connection| Arc::new(super::addressesRepository::AddressesRepository::create_readonly(connection).expect("repository")) as Arc<dyn IReadonlyRepository<Address>>,
    );
    factory.register_named(
        "AddressAttribute",
        "address_attributes",
        |connection| Ok(Arc::new(super::addressAttributesRepository::AddressAttributesRepository::new(connection).expect("repository")) as Arc<dyn ICRUDRepository<AddressAttribute>>),
        |connection| Arc::new(super::addressAttributesRepository::AddressAttributesRepository::create_readonly(connection).expect("repository")) as Arc<dyn IReadonlyRepository<AddressAttribute>>,
    );
    factory.register_named(
        "AddressLabel",
        "address_labels",
        |connection| Ok(Arc::new(super::addressLabelsRepository::AddressLabelsRepository::new(connection).expect("repository")) as Arc<dyn ICRUDRepository<AddressLabel>>),
        |connection| Arc::new(super::addressLabelsRepository::AddressLabelsRepository::create_readonly(connection).expect("repository")) as Arc<dyn IReadonlyRepository<AddressLabel>>,
    );
    factory.register_named(
        "Category",
        "categories",
        |connection| Ok(Arc::new(super::categoriesRepository::CategoriesRepository::new(connection).expect("repository")) as Arc<dyn ICRUDRepository<Category>>),
        |connection| Arc::new(super::categoriesRepository::CategoriesRepository::create_readonly(connection).expect("repository")) as Arc<dyn IReadonlyRepository<Category>>,
    );
    factory.register_named(
        "Contact",
        "contacts",
        |connection| Ok(Arc::new(super::contactsRepository::ContactsRepository::new(connection).expect("repository")) as Arc<dyn ICRUDRepository<Contact>>),
        |connection| Arc::new(super::contactsRepository::ContactsRepository::create_readonly(connection).expect("repository")) as Arc<dyn IReadonlyRepository<Contact>>,
    );
    factory.register_named(
        "ContactAttribute",
        "contact_attributes",
        |connection| Ok(Arc::new(super::contactAttributesRepository::ContactAttributesRepository::new(connection).expect("repository")) as Arc<dyn ICRUDRepository<ContactAttribute>>),
        |connection| Arc::new(super::contactAttributesRepository::ContactAttributesRepository::create_readonly(connection).expect("repository")) as Arc<dyn IReadonlyRepository<ContactAttribute>>,
    );
    factory.register_named(
        "ContactLabel",
        "contact_labels",
        |connection| Ok(Arc::new(super::contactLabelsRepository::ContactLabelsRepository::new(connection).expect("repository")) as Arc<dyn ICRUDRepository<ContactLabel>>),
        |connection| Arc::new(super::contactLabelsRepository::ContactLabelsRepository::create_readonly(connection).expect("repository")) as Arc<dyn IReadonlyRepository<ContactLabel>>,
    );
    factory.register_named(
        "Email",
        "emails",
        |connection| Ok(Arc::new(super::emailsRepository::EmailsRepository::new(connection).expect("repository")) as Arc<dyn ICRUDRepository<Email>>),
        |connection| Arc::new(super::emailsRepository::EmailsRepository::create_readonly(connection).expect("repository")) as Arc<dyn IReadonlyRepository<Email>>,
    );
    factory.register_named(
        "EmailAttribute",
        "email_attributes",
        |connection| Ok(Arc::new(super::emailAttributesRepository::EmailAttributesRepository::new(connection).expect("repository")) as Arc<dyn ICRUDRepository<EmailAttribute>>),
        |connection| Arc::new(super::emailAttributesRepository::EmailAttributesRepository::create_readonly(connection).expect("repository")) as Arc<dyn IReadonlyRepository<EmailAttribute>>,
    );
    factory.register_named(
        "EmailLabel",
        "email_labels",
        |connection| Ok(Arc::new(super::emailLabelsRepository::EmailLabelsRepository::new(connection).expect("repository")) as Arc<dyn ICRUDRepository<EmailLabel>>),
        |connection| Arc::new(super::emailLabelsRepository::EmailLabelsRepository::create_readonly(connection).expect("repository")) as Arc<dyn IReadonlyRepository<EmailLabel>>,
    );
    factory.register_named(
        "EmailType",
        "email_types",
        |_connection| Err(DatasourceError::message("EmailType is a readonly lookup")),
        |connection| Arc::new(super::emailTypesRepository::EmailTypesRepository::create_readonly(connection).expect("repository")) as Arc<dyn IReadonlyRepository<EmailType>>,
    );
    factory.register_named(
        "Game",
        "games",
        |connection| Ok(Arc::new(super::gamesRepository::GamesRepository::new(connection).expect("repository")) as Arc<dyn ICRUDRepository<Game>>),
        |connection| Arc::new(super::gamesRepository::GamesRepository::create_readonly(connection).expect("repository")) as Arc<dyn IReadonlyRepository<Game>>,
    );
    factory.register_named(
        "GameAttribute",
        "game_attributes",
        |connection| Ok(Arc::new(super::gameAttributesRepository::GameAttributesRepository::new(connection).expect("repository")) as Arc<dyn ICRUDRepository<GameAttribute>>),
        |connection| Arc::new(super::gameAttributesRepository::GameAttributesRepository::create_readonly(connection).expect("repository")) as Arc<dyn IReadonlyRepository<GameAttribute>>,
    );
    factory.register_named(
        "GameCategory",
        "game_categories",
        |connection| Ok(Arc::new(super::gameCategoriesRepository::GameCategoriesRepository::new(connection).expect("repository")) as Arc<dyn ICRUDRepository<GameCategory>>),
        |connection| Arc::new(super::gameCategoriesRepository::GameCategoriesRepository::create_readonly(connection).expect("repository")) as Arc<dyn IReadonlyRepository<GameCategory>>,
    );
    factory.register_named(
        "GameParent",
        "game_parents",
        |connection| Ok(Arc::new(super::gameParentsRepository::GameParentsRepository::new(connection).expect("repository")) as Arc<dyn ICRUDRepository<GameParent>>),
        |connection| Arc::new(super::gameParentsRepository::GameParentsRepository::create_readonly(connection).expect("repository")) as Arc<dyn IReadonlyRepository<GameParent>>,
    );
    factory.register_named(
        "GameParentCategory",
        "game_parent_categories",
        |connection| Ok(Arc::new(super::gameParentCategoriesRepository::GameParentCategoriesRepository::new(connection).expect("repository")) as Arc<dyn ICRUDRepository<GameParentCategory>>),
        |connection| Arc::new(super::gameParentCategoriesRepository::GameParentCategoriesRepository::create_readonly(connection).expect("repository")) as Arc<dyn IReadonlyRepository<GameParentCategory>>,
    );
    factory.register_named(
        "GameParentConfig",
        "game_parent_configs",
        |connection| Ok(Arc::new(super::gameParentConfigsRepository::GameParentConfigsRepository::new(connection).expect("repository")) as Arc<dyn ICRUDRepository<GameParentConfig>>),
        |connection| Arc::new(super::gameParentConfigsRepository::GameParentConfigsRepository::create_readonly(connection).expect("repository")) as Arc<dyn IReadonlyRepository<GameParentConfig>>,
    );
    factory.register_named(
        "GameParentSetting",
        "game_parent_settings",
        |connection| Ok(Arc::new(super::gameParentSettingsRepository::GameParentSettingsRepository::new(connection).expect("repository")) as Arc<dyn ICRUDRepository<GameParentSetting>>),
        |connection| Arc::new(super::gameParentSettingsRepository::GameParentSettingsRepository::create_readonly(connection).expect("repository")) as Arc<dyn IReadonlyRepository<GameParentSetting>>,
    );
    factory.register_named(
        "GameSetting",
        "game_settings",
        |connection| Ok(Arc::new(super::gameSettingsRepository::GameSettingsRepository::new(connection).expect("repository")) as Arc<dyn ICRUDRepository<GameSetting>>),
        |connection| Arc::new(super::gameSettingsRepository::GameSettingsRepository::create_readonly(connection).expect("repository")) as Arc<dyn IReadonlyRepository<GameSetting>>,
    );
    factory.register_named(
        "GameState",
        "game_states",
        |connection| Ok(Arc::new(super::gameStatesRepository::GameStatesRepository::new(connection).expect("repository")) as Arc<dyn ICRUDRepository<GameState>>),
        |connection| Arc::new(super::gameStatesRepository::GameStatesRepository::create_readonly(connection).expect("repository")) as Arc<dyn IReadonlyRepository<GameState>>,
    );
    factory.register_named(
        "Gender",
        "genders",
        |_connection| Err(DatasourceError::message("Gender is a readonly lookup")),
        |connection| Arc::new(super::gendersRepository::GendersRepository::create_readonly(connection).expect("repository")) as Arc<dyn IReadonlyRepository<Gender>>,
    );
    factory.register_named(
        "Group",
        "groups",
        |connection| Ok(Arc::new(super::groupsRepository::GroupsRepository::new(connection).expect("repository")) as Arc<dyn ICRUDRepository<Group>>),
        |connection| Arc::new(super::groupsRepository::GroupsRepository::create_readonly(connection).expect("repository")) as Arc<dyn IReadonlyRepository<Group>>,
    );
    factory.register_named(
        "Label",
        "labels",
        |connection| Ok(Arc::new(super::labelsRepository::LabelsRepository::new(connection).expect("repository")) as Arc<dyn ICRUDRepository<Label>>),
        |connection| Arc::new(super::labelsRepository::LabelsRepository::create_readonly(connection).expect("repository")) as Arc<dyn IReadonlyRepository<Label>>,
    );
    factory.register_named(
        "Language",
        "languages",
        |connection| Ok(Arc::new(super::languagesRepository::LanguagesRepository::new(connection).expect("repository")) as Arc<dyn ICRUDRepository<Language>>),
        |connection| Arc::new(super::languagesRepository::LanguagesRepository::create_readonly(connection).expect("repository")) as Arc<dyn IReadonlyRepository<Language>>,
    );
    factory.register_named(
        "LocalizedString",
        "localized_strings",
        |connection| Ok(Arc::new(super::localizedStringsRepository::LocalizedStringsRepository::new(connection).expect("repository")) as Arc<dyn ICRUDRepository<LocalizedString>>),
        |connection| Arc::new(super::localizedStringsRepository::LocalizedStringsRepository::create_readonly(connection).expect("repository")) as Arc<dyn IReadonlyRepository<LocalizedString>>,
    );
    factory.register_named(
        "LocalizedStringName",
        "localized_string_names",
        |connection| Ok(Arc::new(super::localizedStringNamesRepository::LocalizedStringNamesRepository::new(connection).expect("repository")) as Arc<dyn ICRUDRepository<LocalizedStringName>>),
        |connection| Arc::new(super::localizedStringNamesRepository::LocalizedStringNamesRepository::create_readonly(connection).expect("repository")) as Arc<dyn IReadonlyRepository<LocalizedStringName>>,
    );
    factory.register_named(
        "MimeType",
        "mime_types",
        |_connection| Err(DatasourceError::message("MimeType is a readonly lookup")),
        |connection| Arc::new(super::mimeTypesRepository::MimeTypesRepository::create_readonly(connection).expect("repository")) as Arc<dyn IReadonlyRepository<MimeType>>,
    );
    factory.register_named(
        "Phone",
        "phones",
        |connection| Ok(Arc::new(super::phonesRepository::PhonesRepository::new(connection).expect("repository")) as Arc<dyn ICRUDRepository<Phone>>),
        |connection| Arc::new(super::phonesRepository::PhonesRepository::create_readonly(connection).expect("repository")) as Arc<dyn IReadonlyRepository<Phone>>,
    );
    factory.register_named(
        "PhoneAttribute",
        "phone_attributes",
        |connection| Ok(Arc::new(super::phoneAttributesRepository::PhoneAttributesRepository::new(connection).expect("repository")) as Arc<dyn ICRUDRepository<PhoneAttribute>>),
        |connection| Arc::new(super::phoneAttributesRepository::PhoneAttributesRepository::create_readonly(connection).expect("repository")) as Arc<dyn IReadonlyRepository<PhoneAttribute>>,
    );
    factory.register_named(
        "PhoneLabel",
        "phone_labels",
        |connection| Ok(Arc::new(super::phoneLabelsRepository::PhoneLabelsRepository::new(connection).expect("repository")) as Arc<dyn ICRUDRepository<PhoneLabel>>),
        |connection| Arc::new(super::phoneLabelsRepository::PhoneLabelsRepository::create_readonly(connection).expect("repository")) as Arc<dyn IReadonlyRepository<PhoneLabel>>,
    );
    factory.register_named(
        "PhoneType",
        "phone_types",
        |_connection| Err(DatasourceError::message("PhoneType is a readonly lookup")),
        |connection| Arc::new(super::phoneTypesRepository::PhoneTypesRepository::create_readonly(connection).expect("repository")) as Arc<dyn IReadonlyRepository<PhoneType>>,
    );
    factory.register_named(
        "Resource",
        "resources",
        |connection| Ok(Arc::new(super::resourcesRepository::ResourcesRepository::new(connection).expect("repository")) as Arc<dyn ICRUDRepository<Resource>>),
        |connection| Arc::new(super::resourcesRepository::ResourcesRepository::create_readonly(connection).expect("repository")) as Arc<dyn IReadonlyRepository<Resource>>,
    );
    factory.register_named(
        "Review",
        "reviews",
        |connection| Ok(Arc::new(super::reviewsRepository::ReviewsRepository::new(connection).expect("repository")) as Arc<dyn ICRUDRepository<Review>>),
        |connection| Arc::new(super::reviewsRepository::ReviewsRepository::create_readonly(connection).expect("repository")) as Arc<dyn IReadonlyRepository<Review>>,
    );
    factory.register_named(
        "Role",
        "roles",
        |connection| Ok(Arc::new(super::rolesRepository::RolesRepository::new(connection).expect("repository")) as Arc<dyn ICRUDRepository<Role>>),
        |connection| Arc::new(super::rolesRepository::RolesRepository::create_readonly(connection).expect("repository")) as Arc<dyn IReadonlyRepository<Role>>,
    );
    factory.register_named(
        "Secret",
        "secrets",
        |connection| Ok(Arc::new(super::secretsRepository::SecretsRepository::new(connection).expect("repository")) as Arc<dyn ICRUDRepository<Secret>>),
        |connection| Arc::new(super::secretsRepository::SecretsRepository::create_readonly(connection).expect("repository")) as Arc<dyn IReadonlyRepository<Secret>>,
    );
    factory.register_named(
        "SecretType",
        "secret_types",
        |_connection| Err(DatasourceError::message("SecretType is a readonly lookup")),
        |connection| Arc::new(super::secretTypesRepository::SecretTypesRepository::create_readonly(connection).expect("repository")) as Arc<dyn IReadonlyRepository<SecretType>>,
    );
    factory.register_named(
        "Session",
        "sessions",
        |connection| Ok(Arc::new(super::sessionsRepository::SessionsRepository::new(connection).expect("repository")) as Arc<dyn ICRUDRepository<Session>>),
        |connection| Arc::new(super::sessionsRepository::SessionsRepository::create_readonly(connection).expect("repository")) as Arc<dyn IReadonlyRepository<Session>>,
    );
    factory.register_named(
        "SessionHit",
        "session_hits",
        |connection| Ok(Arc::new(super::sessionHitsRepository::SessionHitsRepository::new(connection).expect("repository")) as Arc<dyn ICRUDRepository<SessionHit>>),
        |connection| Arc::new(super::sessionHitsRepository::SessionHitsRepository::create_readonly(connection).expect("repository")) as Arc<dyn IReadonlyRepository<SessionHit>>,
    );
    factory.register_named(
        "SessionStatesBase",
        "session_states_bases",
        |connection| Ok(Arc::new(super::sessionStatesBasesRepository::SessionStatesBasesRepository::new(connection).expect("repository")) as Arc<dyn ICRUDRepository<SessionStatesBase>>),
        |connection| Arc::new(super::sessionStatesBasesRepository::SessionStatesBasesRepository::create_readonly(connection).expect("repository")) as Arc<dyn IReadonlyRepository<SessionStatesBase>>,
    );
    factory.register_named(
        "SessionType",
        "session_types",
        |_connection| Err(DatasourceError::message("SessionType is a readonly lookup")),
        |connection| Arc::new(super::sessionTypesRepository::SessionTypesRepository::create_readonly(connection).expect("repository")) as Arc<dyn IReadonlyRepository<SessionType>>,
    );
    factory.register_named(
        "Template",
        "templates",
        |connection| Ok(Arc::new(super::templatesRepository::TemplatesRepository::new(connection).expect("repository")) as Arc<dyn ICRUDRepository<Template>>),
        |connection| Arc::new(super::templatesRepository::TemplatesRepository::create_readonly(connection).expect("repository")) as Arc<dyn IReadonlyRepository<Template>>,
    );
    factory.register_named(
        "TemplateType",
        "template_types",
        |_connection| Err(DatasourceError::message("TemplateType is a readonly lookup")),
        |connection| Arc::new(super::templateTypesRepository::TemplateTypesRepository::create_readonly(connection).expect("repository")) as Arc<dyn IReadonlyRepository<TemplateType>>,
    );
    factory.register_named(
        "Token",
        "tokens",
        |connection| Ok(Arc::new(super::tokensRepository::TokensRepository::new(connection).expect("repository")) as Arc<dyn ICRUDRepository<Token>>),
        |connection| Arc::new(super::tokensRepository::TokensRepository::create_readonly(connection).expect("repository")) as Arc<dyn IReadonlyRepository<Token>>,
    );
    factory.register_named(
        "TokenType",
        "token_types",
        |_connection| Err(DatasourceError::message("TokenType is a readonly lookup")),
        |connection| Arc::new(super::tokenTypesRepository::TokenTypesRepository::create_readonly(connection).expect("repository")) as Arc<dyn IReadonlyRepository<TokenType>>,
    );
    factory.register_named(
        "User",
        "users",
        |connection| Ok(Arc::new(super::usersRepository::UsersRepository::new(connection).expect("repository")) as Arc<dyn ICRUDRepository<User>>),
        |connection| Arc::new(super::usersRepository::UsersRepository::create_readonly(connection).expect("repository")) as Arc<dyn IReadonlyRepository<User>>,
    );
    factory.register_named(
        "UserGroup",
        "user_groups",
        |connection| Ok(Arc::new(super::userGroupsRepository::UserGroupsRepository::new(connection).expect("repository")) as Arc<dyn ICRUDRepository<UserGroup>>),
        |connection| Arc::new(super::userGroupsRepository::UserGroupsRepository::create_readonly(connection).expect("repository")) as Arc<dyn IReadonlyRepository<UserGroup>>,
    );
    factory.register_named(
        "UserRole",
        "user_roles",
        |connection| Ok(Arc::new(super::userRolesRepository::UserRolesRepository::new(connection).expect("repository")) as Arc<dyn ICRUDRepository<UserRole>>),
        |connection| Arc::new(super::userRolesRepository::UserRolesRepository::create_readonly(connection).expect("repository")) as Arc<dyn IReadonlyRepository<UserRole>>,
    );
    factory.register_named(
        "UserSecret",
        "user_secrets",
        |connection| Ok(Arc::new(super::userSecretsRepository::UserSecretsRepository::new(connection).expect("repository")) as Arc<dyn ICRUDRepository<UserSecret>>),
        |connection| Arc::new(super::userSecretsRepository::UserSecretsRepository::create_readonly(connection).expect("repository")) as Arc<dyn IReadonlyRepository<UserSecret>>,
    );
    factory.register_named(
        "UserSetting",
        "user_settings",
        |connection| Ok(Arc::new(super::userSettingsRepository::UserSettingsRepository::new(connection).expect("repository")) as Arc<dyn ICRUDRepository<UserSetting>>),
        |connection| Arc::new(super::userSettingsRepository::UserSettingsRepository::create_readonly(connection).expect("repository")) as Arc<dyn IReadonlyRepository<UserSetting>>,
    );
    factory.register_named(
        "UserToken",
        "user_tokens",
        |connection| Ok(Arc::new(super::userTokensRepository::UserTokensRepository::new(connection).expect("repository")) as Arc<dyn ICRUDRepository<UserToken>>),
        |connection| Arc::new(super::userTokensRepository::UserTokensRepository::create_readonly(connection).expect("repository")) as Arc<dyn IReadonlyRepository<UserToken>>,
    );
}

datasources::bind_repositories!(register);

pub trait Repositories {
    fn addresses(&self) -> Arc<super::addressesRepository::AddressesRepository>;
    fn address_attributes(&self) -> Arc<super::addressAttributesRepository::AddressAttributesRepository>;
    fn address_labels(&self) -> Arc<super::addressLabelsRepository::AddressLabelsRepository>;
    fn categories(&self) -> Arc<super::categoriesRepository::CategoriesRepository>;
    fn contacts(&self) -> Arc<super::contactsRepository::ContactsRepository>;
    fn contact_attributes(&self) -> Arc<super::contactAttributesRepository::ContactAttributesRepository>;
    fn contact_labels(&self) -> Arc<super::contactLabelsRepository::ContactLabelsRepository>;
    fn emails(&self) -> Arc<super::emailsRepository::EmailsRepository>;
    fn email_attributes(&self) -> Arc<super::emailAttributesRepository::EmailAttributesRepository>;
    fn email_labels(&self) -> Arc<super::emailLabelsRepository::EmailLabelsRepository>;
    fn email_types(&self) -> Arc<super::emailTypesRepository::EmailTypesRepository>;
    fn games(&self) -> Arc<super::gamesRepository::GamesRepository>;
    fn game_attributes(&self) -> Arc<super::gameAttributesRepository::GameAttributesRepository>;
    fn game_categories(&self) -> Arc<super::gameCategoriesRepository::GameCategoriesRepository>;
    fn game_parents(&self) -> Arc<super::gameParentsRepository::GameParentsRepository>;
    fn game_parent_categories(&self) -> Arc<super::gameParentCategoriesRepository::GameParentCategoriesRepository>;
    fn game_parent_configs(&self) -> Arc<super::gameParentConfigsRepository::GameParentConfigsRepository>;
    fn game_parent_settings(&self) -> Arc<super::gameParentSettingsRepository::GameParentSettingsRepository>;
    fn game_settings(&self) -> Arc<super::gameSettingsRepository::GameSettingsRepository>;
    fn game_states(&self) -> Arc<super::gameStatesRepository::GameStatesRepository>;
    fn genders(&self) -> Arc<super::gendersRepository::GendersRepository>;
    fn groups(&self) -> Arc<super::groupsRepository::GroupsRepository>;
    fn labels(&self) -> Arc<super::labelsRepository::LabelsRepository>;
    fn languages(&self) -> Arc<super::languagesRepository::LanguagesRepository>;
    fn localized_strings(&self) -> Arc<super::localizedStringsRepository::LocalizedStringsRepository>;
    fn localized_string_names(&self) -> Arc<super::localizedStringNamesRepository::LocalizedStringNamesRepository>;
    fn mime_types(&self) -> Arc<super::mimeTypesRepository::MimeTypesRepository>;
    fn phones(&self) -> Arc<super::phonesRepository::PhonesRepository>;
    fn phone_attributes(&self) -> Arc<super::phoneAttributesRepository::PhoneAttributesRepository>;
    fn phone_labels(&self) -> Arc<super::phoneLabelsRepository::PhoneLabelsRepository>;
    fn phone_types(&self) -> Arc<super::phoneTypesRepository::PhoneTypesRepository>;
    fn resources(&self) -> Arc<super::resourcesRepository::ResourcesRepository>;
    fn reviews(&self) -> Arc<super::reviewsRepository::ReviewsRepository>;
    fn roles(&self) -> Arc<super::rolesRepository::RolesRepository>;
    fn secrets(&self) -> Arc<super::secretsRepository::SecretsRepository>;
    fn secret_types(&self) -> Arc<super::secretTypesRepository::SecretTypesRepository>;
    fn sessions(&self) -> Arc<super::sessionsRepository::SessionsRepository>;
    fn session_hits(&self) -> Arc<super::sessionHitsRepository::SessionHitsRepository>;
    fn session_states_bases(&self) -> Arc<super::sessionStatesBasesRepository::SessionStatesBasesRepository>;
    fn session_types(&self) -> Arc<super::sessionTypesRepository::SessionTypesRepository>;
    fn templates(&self) -> Arc<super::templatesRepository::TemplatesRepository>;
    fn template_types(&self) -> Arc<super::templateTypesRepository::TemplateTypesRepository>;
    fn tokens(&self) -> Arc<super::tokensRepository::TokensRepository>;
    fn token_types(&self) -> Arc<super::tokenTypesRepository::TokenTypesRepository>;
    fn users(&self) -> Arc<super::usersRepository::UsersRepository>;
    fn user_groups(&self) -> Arc<super::userGroupsRepository::UserGroupsRepository>;
    fn user_roles(&self) -> Arc<super::userRolesRepository::UserRolesRepository>;
    fn user_secrets(&self) -> Arc<super::userSecretsRepository::UserSecretsRepository>;
    fn user_settings(&self) -> Arc<super::userSettingsRepository::UserSettingsRepository>;
    fn user_tokens(&self) -> Arc<super::userTokensRepository::UserTokensRepository>;
}

impl Repositories for Arc<dyn Datasource> {
    fn addresses(&self) -> Arc<super::addressesRepository::AddressesRepository> {
        Arc::new(super::addressesRepository::AddressesRepository::new(self.bind_connection(None)).expect("addresses"))
    }
    fn address_attributes(&self) -> Arc<super::addressAttributesRepository::AddressAttributesRepository> {
        Arc::new(super::addressAttributesRepository::AddressAttributesRepository::new(self.bind_connection(None)).expect("address_attributes"))
    }
    fn address_labels(&self) -> Arc<super::addressLabelsRepository::AddressLabelsRepository> {
        Arc::new(super::addressLabelsRepository::AddressLabelsRepository::new(self.bind_connection(None)).expect("address_labels"))
    }
    fn categories(&self) -> Arc<super::categoriesRepository::CategoriesRepository> {
        Arc::new(super::categoriesRepository::CategoriesRepository::new(self.bind_connection(None)).expect("categories"))
    }
    fn contacts(&self) -> Arc<super::contactsRepository::ContactsRepository> {
        Arc::new(super::contactsRepository::ContactsRepository::new(self.bind_connection(None)).expect("contacts"))
    }
    fn contact_attributes(&self) -> Arc<super::contactAttributesRepository::ContactAttributesRepository> {
        Arc::new(super::contactAttributesRepository::ContactAttributesRepository::new(self.bind_connection(None)).expect("contact_attributes"))
    }
    fn contact_labels(&self) -> Arc<super::contactLabelsRepository::ContactLabelsRepository> {
        Arc::new(super::contactLabelsRepository::ContactLabelsRepository::new(self.bind_connection(None)).expect("contact_labels"))
    }
    fn emails(&self) -> Arc<super::emailsRepository::EmailsRepository> {
        Arc::new(super::emailsRepository::EmailsRepository::new(self.bind_connection(None)).expect("emails"))
    }
    fn email_attributes(&self) -> Arc<super::emailAttributesRepository::EmailAttributesRepository> {
        Arc::new(super::emailAttributesRepository::EmailAttributesRepository::new(self.bind_connection(None)).expect("email_attributes"))
    }
    fn email_labels(&self) -> Arc<super::emailLabelsRepository::EmailLabelsRepository> {
        Arc::new(super::emailLabelsRepository::EmailLabelsRepository::new(self.bind_connection(None)).expect("email_labels"))
    }
    fn email_types(&self) -> Arc<super::emailTypesRepository::EmailTypesRepository> {
        Arc::new(super::emailTypesRepository::EmailTypesRepository::new(self.bind_connection(None)).expect("email_types"))
    }
    fn games(&self) -> Arc<super::gamesRepository::GamesRepository> {
        Arc::new(super::gamesRepository::GamesRepository::new(self.bind_connection(None)).expect("games"))
    }
    fn game_attributes(&self) -> Arc<super::gameAttributesRepository::GameAttributesRepository> {
        Arc::new(super::gameAttributesRepository::GameAttributesRepository::new(self.bind_connection(None)).expect("game_attributes"))
    }
    fn game_categories(&self) -> Arc<super::gameCategoriesRepository::GameCategoriesRepository> {
        Arc::new(super::gameCategoriesRepository::GameCategoriesRepository::new(self.bind_connection(None)).expect("game_categories"))
    }
    fn game_parents(&self) -> Arc<super::gameParentsRepository::GameParentsRepository> {
        Arc::new(super::gameParentsRepository::GameParentsRepository::new(self.bind_connection(None)).expect("game_parents"))
    }
    fn game_parent_categories(&self) -> Arc<super::gameParentCategoriesRepository::GameParentCategoriesRepository> {
        Arc::new(super::gameParentCategoriesRepository::GameParentCategoriesRepository::new(self.bind_connection(None)).expect("game_parent_categories"))
    }
    fn game_parent_configs(&self) -> Arc<super::gameParentConfigsRepository::GameParentConfigsRepository> {
        Arc::new(super::gameParentConfigsRepository::GameParentConfigsRepository::new(self.bind_connection(None)).expect("game_parent_configs"))
    }
    fn game_parent_settings(&self) -> Arc<super::gameParentSettingsRepository::GameParentSettingsRepository> {
        Arc::new(super::gameParentSettingsRepository::GameParentSettingsRepository::new(self.bind_connection(None)).expect("game_parent_settings"))
    }
    fn game_settings(&self) -> Arc<super::gameSettingsRepository::GameSettingsRepository> {
        Arc::new(super::gameSettingsRepository::GameSettingsRepository::new(self.bind_connection(None)).expect("game_settings"))
    }
    fn game_states(&self) -> Arc<super::gameStatesRepository::GameStatesRepository> {
        Arc::new(super::gameStatesRepository::GameStatesRepository::new(self.bind_connection(None)).expect("game_states"))
    }
    fn genders(&self) -> Arc<super::gendersRepository::GendersRepository> {
        Arc::new(super::gendersRepository::GendersRepository::new(self.bind_connection(None)).expect("genders"))
    }
    fn groups(&self) -> Arc<super::groupsRepository::GroupsRepository> {
        Arc::new(super::groupsRepository::GroupsRepository::new(self.bind_connection(None)).expect("groups"))
    }
    fn labels(&self) -> Arc<super::labelsRepository::LabelsRepository> {
        Arc::new(super::labelsRepository::LabelsRepository::new(self.bind_connection(None)).expect("labels"))
    }
    fn languages(&self) -> Arc<super::languagesRepository::LanguagesRepository> {
        Arc::new(super::languagesRepository::LanguagesRepository::new(self.bind_connection(None)).expect("languages"))
    }
    fn localized_strings(&self) -> Arc<super::localizedStringsRepository::LocalizedStringsRepository> {
        Arc::new(super::localizedStringsRepository::LocalizedStringsRepository::new(self.bind_connection(None)).expect("localized_strings"))
    }
    fn localized_string_names(&self) -> Arc<super::localizedStringNamesRepository::LocalizedStringNamesRepository> {
        Arc::new(super::localizedStringNamesRepository::LocalizedStringNamesRepository::new(self.bind_connection(None)).expect("localized_string_names"))
    }
    fn mime_types(&self) -> Arc<super::mimeTypesRepository::MimeTypesRepository> {
        Arc::new(super::mimeTypesRepository::MimeTypesRepository::new(self.bind_connection(None)).expect("mime_types"))
    }
    fn phones(&self) -> Arc<super::phonesRepository::PhonesRepository> {
        Arc::new(super::phonesRepository::PhonesRepository::new(self.bind_connection(None)).expect("phones"))
    }
    fn phone_attributes(&self) -> Arc<super::phoneAttributesRepository::PhoneAttributesRepository> {
        Arc::new(super::phoneAttributesRepository::PhoneAttributesRepository::new(self.bind_connection(None)).expect("phone_attributes"))
    }
    fn phone_labels(&self) -> Arc<super::phoneLabelsRepository::PhoneLabelsRepository> {
        Arc::new(super::phoneLabelsRepository::PhoneLabelsRepository::new(self.bind_connection(None)).expect("phone_labels"))
    }
    fn phone_types(&self) -> Arc<super::phoneTypesRepository::PhoneTypesRepository> {
        Arc::new(super::phoneTypesRepository::PhoneTypesRepository::new(self.bind_connection(None)).expect("phone_types"))
    }
    fn resources(&self) -> Arc<super::resourcesRepository::ResourcesRepository> {
        Arc::new(super::resourcesRepository::ResourcesRepository::new(self.bind_connection(None)).expect("resources"))
    }
    fn reviews(&self) -> Arc<super::reviewsRepository::ReviewsRepository> {
        Arc::new(super::reviewsRepository::ReviewsRepository::new(self.bind_connection(None)).expect("reviews"))
    }
    fn roles(&self) -> Arc<super::rolesRepository::RolesRepository> {
        Arc::new(super::rolesRepository::RolesRepository::new(self.bind_connection(None)).expect("roles"))
    }
    fn secrets(&self) -> Arc<super::secretsRepository::SecretsRepository> {
        Arc::new(super::secretsRepository::SecretsRepository::new(self.bind_connection(None)).expect("secrets"))
    }
    fn secret_types(&self) -> Arc<super::secretTypesRepository::SecretTypesRepository> {
        Arc::new(super::secretTypesRepository::SecretTypesRepository::new(self.bind_connection(None)).expect("secret_types"))
    }
    fn sessions(&self) -> Arc<super::sessionsRepository::SessionsRepository> {
        Arc::new(super::sessionsRepository::SessionsRepository::new(self.bind_connection(None)).expect("sessions"))
    }
    fn session_hits(&self) -> Arc<super::sessionHitsRepository::SessionHitsRepository> {
        Arc::new(super::sessionHitsRepository::SessionHitsRepository::new(self.bind_connection(None)).expect("session_hits"))
    }
    fn session_states_bases(&self) -> Arc<super::sessionStatesBasesRepository::SessionStatesBasesRepository> {
        Arc::new(super::sessionStatesBasesRepository::SessionStatesBasesRepository::new(self.bind_connection(None)).expect("session_states_bases"))
    }
    fn session_types(&self) -> Arc<super::sessionTypesRepository::SessionTypesRepository> {
        Arc::new(super::sessionTypesRepository::SessionTypesRepository::new(self.bind_connection(None)).expect("session_types"))
    }
    fn templates(&self) -> Arc<super::templatesRepository::TemplatesRepository> {
        Arc::new(super::templatesRepository::TemplatesRepository::new(self.bind_connection(None)).expect("templates"))
    }
    fn template_types(&self) -> Arc<super::templateTypesRepository::TemplateTypesRepository> {
        Arc::new(super::templateTypesRepository::TemplateTypesRepository::new(self.bind_connection(None)).expect("template_types"))
    }
    fn tokens(&self) -> Arc<super::tokensRepository::TokensRepository> {
        Arc::new(super::tokensRepository::TokensRepository::new(self.bind_connection(None)).expect("tokens"))
    }
    fn token_types(&self) -> Arc<super::tokenTypesRepository::TokenTypesRepository> {
        Arc::new(super::tokenTypesRepository::TokenTypesRepository::new(self.bind_connection(None)).expect("token_types"))
    }
    fn users(&self) -> Arc<super::usersRepository::UsersRepository> {
        Arc::new(super::usersRepository::UsersRepository::new(self.bind_connection(None)).expect("users"))
    }
    fn user_groups(&self) -> Arc<super::userGroupsRepository::UserGroupsRepository> {
        Arc::new(super::userGroupsRepository::UserGroupsRepository::new(self.bind_connection(None)).expect("user_groups"))
    }
    fn user_roles(&self) -> Arc<super::userRolesRepository::UserRolesRepository> {
        Arc::new(super::userRolesRepository::UserRolesRepository::new(self.bind_connection(None)).expect("user_roles"))
    }
    fn user_secrets(&self) -> Arc<super::userSecretsRepository::UserSecretsRepository> {
        Arc::new(super::userSecretsRepository::UserSecretsRepository::new(self.bind_connection(None)).expect("user_secrets"))
    }
    fn user_settings(&self) -> Arc<super::userSettingsRepository::UserSettingsRepository> {
        Arc::new(super::userSettingsRepository::UserSettingsRepository::new(self.bind_connection(None)).expect("user_settings"))
    }
    fn user_tokens(&self) -> Arc<super::userTokensRepository::UserTokensRepository> {
        Arc::new(super::userTokensRepository::UserTokensRepository::new(self.bind_connection(None)).expect("user_tokens"))
    }
}
