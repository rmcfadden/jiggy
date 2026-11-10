use datasources::{Datasource, ICRUDRepository, IReadonlyRepository, RepositoryFactory};
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
use super::super::PuzzleGame;
use super::super::Resource;
use super::super::Review;
use super::super::Role;
use super::super::Template;
use super::super::TemplateType;
use super::super::User;
use super::super::UserGroup;
use super::super::UserRole;
use super::super::UserSetting;
use std::sync::Arc;

pub fn register(factory: &RepositoryFactory) {
    factory.register_named(
        "Address",
        "addresses",
        |connection| Arc::new(super::addressesRepository::AddressesRepository::new(connection).expect("repository")) as Arc<dyn ICRUDRepository<Address>>,
        |connection| Arc::new(super::addressesRepository::AddressesRepository::create_readonly(connection).expect("repository")) as Arc<dyn IReadonlyRepository<Address>>,
    );
    factory.register_named(
        "AddressAttribute",
        "address_attributes",
        |connection| Arc::new(super::addressAttributesRepository::AddressAttributesRepository::new(connection).expect("repository")) as Arc<dyn ICRUDRepository<AddressAttribute>>,
        |connection| Arc::new(super::addressAttributesRepository::AddressAttributesRepository::create_readonly(connection).expect("repository")) as Arc<dyn IReadonlyRepository<AddressAttribute>>,
    );
    factory.register_named(
        "AddressLabel",
        "address_labels",
        |connection| Arc::new(super::addressLabelsRepository::AddressLabelsRepository::new(connection).expect("repository")) as Arc<dyn ICRUDRepository<AddressLabel>>,
        |connection| Arc::new(super::addressLabelsRepository::AddressLabelsRepository::create_readonly(connection).expect("repository")) as Arc<dyn IReadonlyRepository<AddressLabel>>,
    );
    factory.register_named(
        "Category",
        "categories",
        |connection| Arc::new(super::categoriesRepository::CategoriesRepository::new(connection).expect("repository")) as Arc<dyn ICRUDRepository<Category>>,
        |connection| Arc::new(super::categoriesRepository::CategoriesRepository::create_readonly(connection).expect("repository")) as Arc<dyn IReadonlyRepository<Category>>,
    );
    factory.register_named(
        "Contact",
        "contacts",
        |connection| Arc::new(super::contactsRepository::ContactsRepository::new(connection).expect("repository")) as Arc<dyn ICRUDRepository<Contact>>,
        |connection| Arc::new(super::contactsRepository::ContactsRepository::create_readonly(connection).expect("repository")) as Arc<dyn IReadonlyRepository<Contact>>,
    );
    factory.register_named(
        "ContactAttribute",
        "contact_attributes",
        |connection| Arc::new(super::contactAttributesRepository::ContactAttributesRepository::new(connection).expect("repository")) as Arc<dyn ICRUDRepository<ContactAttribute>>,
        |connection| Arc::new(super::contactAttributesRepository::ContactAttributesRepository::create_readonly(connection).expect("repository")) as Arc<dyn IReadonlyRepository<ContactAttribute>>,
    );
    factory.register_named(
        "ContactLabel",
        "contact_labels",
        |connection| Arc::new(super::contactLabelsRepository::ContactLabelsRepository::new(connection).expect("repository")) as Arc<dyn ICRUDRepository<ContactLabel>>,
        |connection| Arc::new(super::contactLabelsRepository::ContactLabelsRepository::create_readonly(connection).expect("repository")) as Arc<dyn IReadonlyRepository<ContactLabel>>,
    );
    factory.register_named(
        "Email",
        "emails",
        |connection| Arc::new(super::emailsRepository::EmailsRepository::new(connection).expect("repository")) as Arc<dyn ICRUDRepository<Email>>,
        |connection| Arc::new(super::emailsRepository::EmailsRepository::create_readonly(connection).expect("repository")) as Arc<dyn IReadonlyRepository<Email>>,
    );
    factory.register_named(
        "EmailAttribute",
        "email_attributes",
        |connection| Arc::new(super::emailAttributesRepository::EmailAttributesRepository::new(connection).expect("repository")) as Arc<dyn ICRUDRepository<EmailAttribute>>,
        |connection| Arc::new(super::emailAttributesRepository::EmailAttributesRepository::create_readonly(connection).expect("repository")) as Arc<dyn IReadonlyRepository<EmailAttribute>>,
    );
    factory.register_named(
        "EmailLabel",
        "email_labels",
        |connection| Arc::new(super::emailLabelsRepository::EmailLabelsRepository::new(connection).expect("repository")) as Arc<dyn ICRUDRepository<EmailLabel>>,
        |connection| Arc::new(super::emailLabelsRepository::EmailLabelsRepository::create_readonly(connection).expect("repository")) as Arc<dyn IReadonlyRepository<EmailLabel>>,
    );
    factory.register_named(
        "EmailType",
        "email_types",
        |connection| Arc::new(super::emailTypesRepository::EmailTypesRepository::new(connection).expect("repository")) as Arc<dyn ICRUDRepository<EmailType>>,
        |connection| Arc::new(super::emailTypesRepository::EmailTypesRepository::create_readonly(connection).expect("repository")) as Arc<dyn IReadonlyRepository<EmailType>>,
    );
    factory.register_named(
        "Game",
        "games",
        |connection| Arc::new(super::gamesRepository::GamesRepository::new(connection).expect("repository")) as Arc<dyn ICRUDRepository<Game>>,
        |connection| Arc::new(super::gamesRepository::GamesRepository::create_readonly(connection).expect("repository")) as Arc<dyn IReadonlyRepository<Game>>,
    );
    factory.register_named(
        "GameCategory",
        "game_categories",
        |connection| Arc::new(super::gameCategoriesRepository::GameCategoriesRepository::new(connection).expect("repository")) as Arc<dyn ICRUDRepository<GameCategory>>,
        |connection| Arc::new(super::gameCategoriesRepository::GameCategoriesRepository::create_readonly(connection).expect("repository")) as Arc<dyn IReadonlyRepository<GameCategory>>,
    );
    factory.register_named(
        "GameParent",
        "game_parents",
        |connection| Arc::new(super::gameParentsRepository::GameParentsRepository::new(connection).expect("repository")) as Arc<dyn ICRUDRepository<GameParent>>,
        |connection| Arc::new(super::gameParentsRepository::GameParentsRepository::create_readonly(connection).expect("repository")) as Arc<dyn IReadonlyRepository<GameParent>>,
    );
    factory.register_named(
        "GameParentCategory",
        "game_parent_categories",
        |connection| Arc::new(super::gameParentCategoriesRepository::GameParentCategoriesRepository::new(connection).expect("repository")) as Arc<dyn ICRUDRepository<GameParentCategory>>,
        |connection| Arc::new(super::gameParentCategoriesRepository::GameParentCategoriesRepository::create_readonly(connection).expect("repository")) as Arc<dyn IReadonlyRepository<GameParentCategory>>,
    );
    factory.register_named(
        "GameParentConfig",
        "game_parent_configs",
        |connection| Arc::new(super::gameParentConfigsRepository::GameParentConfigsRepository::new(connection).expect("repository")) as Arc<dyn ICRUDRepository<GameParentConfig>>,
        |connection| Arc::new(super::gameParentConfigsRepository::GameParentConfigsRepository::create_readonly(connection).expect("repository")) as Arc<dyn IReadonlyRepository<GameParentConfig>>,
    );
    factory.register_named(
        "GameParentSetting",
        "game_parent_settings",
        |connection| Arc::new(super::gameParentSettingsRepository::GameParentSettingsRepository::new(connection).expect("repository")) as Arc<dyn ICRUDRepository<GameParentSetting>>,
        |connection| Arc::new(super::gameParentSettingsRepository::GameParentSettingsRepository::create_readonly(connection).expect("repository")) as Arc<dyn IReadonlyRepository<GameParentSetting>>,
    );
    factory.register_named(
        "GameSetting",
        "game_settings",
        |connection| Arc::new(super::gameSettingsRepository::GameSettingsRepository::new(connection).expect("repository")) as Arc<dyn ICRUDRepository<GameSetting>>,
        |connection| Arc::new(super::gameSettingsRepository::GameSettingsRepository::create_readonly(connection).expect("repository")) as Arc<dyn IReadonlyRepository<GameSetting>>,
    );
    factory.register_named(
        "GameState",
        "game_states",
        |connection| Arc::new(super::gameStatesRepository::GameStatesRepository::new(connection).expect("repository")) as Arc<dyn ICRUDRepository<GameState>>,
        |connection| Arc::new(super::gameStatesRepository::GameStatesRepository::create_readonly(connection).expect("repository")) as Arc<dyn IReadonlyRepository<GameState>>,
    );
    factory.register_named(
        "Gender",
        "genders",
        |connection| Arc::new(super::gendersRepository::GendersRepository::new(connection).expect("repository")) as Arc<dyn ICRUDRepository<Gender>>,
        |connection| Arc::new(super::gendersRepository::GendersRepository::create_readonly(connection).expect("repository")) as Arc<dyn IReadonlyRepository<Gender>>,
    );
    factory.register_named(
        "Group",
        "groups",
        |connection| Arc::new(super::groupsRepository::GroupsRepository::new(connection).expect("repository")) as Arc<dyn ICRUDRepository<Group>>,
        |connection| Arc::new(super::groupsRepository::GroupsRepository::create_readonly(connection).expect("repository")) as Arc<dyn IReadonlyRepository<Group>>,
    );
    factory.register_named(
        "Label",
        "labels",
        |connection| Arc::new(super::labelsRepository::LabelsRepository::new(connection).expect("repository")) as Arc<dyn ICRUDRepository<Label>>,
        |connection| Arc::new(super::labelsRepository::LabelsRepository::create_readonly(connection).expect("repository")) as Arc<dyn IReadonlyRepository<Label>>,
    );
    factory.register_named(
        "Language",
        "languages",
        |connection| Arc::new(super::languagesRepository::LanguagesRepository::new(connection).expect("repository")) as Arc<dyn ICRUDRepository<Language>>,
        |connection| Arc::new(super::languagesRepository::LanguagesRepository::create_readonly(connection).expect("repository")) as Arc<dyn IReadonlyRepository<Language>>,
    );
    factory.register_named(
        "LocalizedString",
        "localized_strings",
        |connection| Arc::new(super::localizedStringsRepository::LocalizedStringsRepository::new(connection).expect("repository")) as Arc<dyn ICRUDRepository<LocalizedString>>,
        |connection| Arc::new(super::localizedStringsRepository::LocalizedStringsRepository::create_readonly(connection).expect("repository")) as Arc<dyn IReadonlyRepository<LocalizedString>>,
    );
    factory.register_named(
        "LocalizedStringName",
        "localized_string_names",
        |connection| Arc::new(super::localizedStringNamesRepository::LocalizedStringNamesRepository::new(connection).expect("repository")) as Arc<dyn ICRUDRepository<LocalizedStringName>>,
        |connection| Arc::new(super::localizedStringNamesRepository::LocalizedStringNamesRepository::create_readonly(connection).expect("repository")) as Arc<dyn IReadonlyRepository<LocalizedStringName>>,
    );
    factory.register_named(
        "MimeType",
        "mime_types",
        |connection| Arc::new(super::mimeTypesRepository::MimeTypesRepository::new(connection).expect("repository")) as Arc<dyn ICRUDRepository<MimeType>>,
        |connection| Arc::new(super::mimeTypesRepository::MimeTypesRepository::create_readonly(connection).expect("repository")) as Arc<dyn IReadonlyRepository<MimeType>>,
    );
    factory.register_named(
        "Phone",
        "phones",
        |connection| Arc::new(super::phonesRepository::PhonesRepository::new(connection).expect("repository")) as Arc<dyn ICRUDRepository<Phone>>,
        |connection| Arc::new(super::phonesRepository::PhonesRepository::create_readonly(connection).expect("repository")) as Arc<dyn IReadonlyRepository<Phone>>,
    );
    factory.register_named(
        "PhoneAttribute",
        "phone_attributes",
        |connection| Arc::new(super::phoneAttributesRepository::PhoneAttributesRepository::new(connection).expect("repository")) as Arc<dyn ICRUDRepository<PhoneAttribute>>,
        |connection| Arc::new(super::phoneAttributesRepository::PhoneAttributesRepository::create_readonly(connection).expect("repository")) as Arc<dyn IReadonlyRepository<PhoneAttribute>>,
    );
    factory.register_named(
        "PhoneLabel",
        "phone_labels",
        |connection| Arc::new(super::phoneLabelsRepository::PhoneLabelsRepository::new(connection).expect("repository")) as Arc<dyn ICRUDRepository<PhoneLabel>>,
        |connection| Arc::new(super::phoneLabelsRepository::PhoneLabelsRepository::create_readonly(connection).expect("repository")) as Arc<dyn IReadonlyRepository<PhoneLabel>>,
    );
    factory.register_named(
        "PhoneType",
        "phone_types",
        |connection| Arc::new(super::phoneTypesRepository::PhoneTypesRepository::new(connection).expect("repository")) as Arc<dyn ICRUDRepository<PhoneType>>,
        |connection| Arc::new(super::phoneTypesRepository::PhoneTypesRepository::create_readonly(connection).expect("repository")) as Arc<dyn IReadonlyRepository<PhoneType>>,
    );
    factory.register_named(
        "PuzzleGame",
        "puzzle_games",
        |connection| Arc::new(super::puzzleGamesRepository::PuzzleGamesRepository::new(connection).expect("repository")) as Arc<dyn ICRUDRepository<PuzzleGame>>,
        |connection| Arc::new(super::puzzleGamesRepository::PuzzleGamesRepository::create_readonly(connection).expect("repository")) as Arc<dyn IReadonlyRepository<PuzzleGame>>,
    );
    factory.register_named(
        "Resource",
        "resources",
        |connection| Arc::new(super::resourcesRepository::ResourcesRepository::new(connection).expect("repository")) as Arc<dyn ICRUDRepository<Resource>>,
        |connection| Arc::new(super::resourcesRepository::ResourcesRepository::create_readonly(connection).expect("repository")) as Arc<dyn IReadonlyRepository<Resource>>,
    );
    factory.register_named(
        "Review",
        "reviews",
        |connection| Arc::new(super::reviewsRepository::ReviewsRepository::new(connection).expect("repository")) as Arc<dyn ICRUDRepository<Review>>,
        |connection| Arc::new(super::reviewsRepository::ReviewsRepository::create_readonly(connection).expect("repository")) as Arc<dyn IReadonlyRepository<Review>>,
    );
    factory.register_named(
        "Role",
        "roles",
        |connection| Arc::new(super::rolesRepository::RolesRepository::new(connection).expect("repository")) as Arc<dyn ICRUDRepository<Role>>,
        |connection| Arc::new(super::rolesRepository::RolesRepository::create_readonly(connection).expect("repository")) as Arc<dyn IReadonlyRepository<Role>>,
    );
    factory.register_named(
        "Template",
        "templates",
        |connection| Arc::new(super::templatesRepository::TemplatesRepository::new(connection).expect("repository")) as Arc<dyn ICRUDRepository<Template>>,
        |connection| Arc::new(super::templatesRepository::TemplatesRepository::create_readonly(connection).expect("repository")) as Arc<dyn IReadonlyRepository<Template>>,
    );
    factory.register_named(
        "TemplateType",
        "template_types",
        |connection| Arc::new(super::templateTypesRepository::TemplateTypesRepository::new(connection).expect("repository")) as Arc<dyn ICRUDRepository<TemplateType>>,
        |connection| Arc::new(super::templateTypesRepository::TemplateTypesRepository::create_readonly(connection).expect("repository")) as Arc<dyn IReadonlyRepository<TemplateType>>,
    );
    factory.register_named(
        "User",
        "users",
        |connection| Arc::new(super::usersRepository::UsersRepository::new(connection).expect("repository")) as Arc<dyn ICRUDRepository<User>>,
        |connection| Arc::new(super::usersRepository::UsersRepository::create_readonly(connection).expect("repository")) as Arc<dyn IReadonlyRepository<User>>,
    );
    factory.register_named(
        "UserGroup",
        "user_groups",
        |connection| Arc::new(super::userGroupsRepository::UserGroupsRepository::new(connection).expect("repository")) as Arc<dyn ICRUDRepository<UserGroup>>,
        |connection| Arc::new(super::userGroupsRepository::UserGroupsRepository::create_readonly(connection).expect("repository")) as Arc<dyn IReadonlyRepository<UserGroup>>,
    );
    factory.register_named(
        "UserRole",
        "user_roles",
        |connection| Arc::new(super::userRolesRepository::UserRolesRepository::new(connection).expect("repository")) as Arc<dyn ICRUDRepository<UserRole>>,
        |connection| Arc::new(super::userRolesRepository::UserRolesRepository::create_readonly(connection).expect("repository")) as Arc<dyn IReadonlyRepository<UserRole>>,
    );
    factory.register_named(
        "UserSetting",
        "user_settings",
        |connection| Arc::new(super::userSettingsRepository::UserSettingsRepository::new(connection).expect("repository")) as Arc<dyn ICRUDRepository<UserSetting>>,
        |connection| Arc::new(super::userSettingsRepository::UserSettingsRepository::create_readonly(connection).expect("repository")) as Arc<dyn IReadonlyRepository<UserSetting>>,
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
    fn puzzle_games(&self) -> Arc<super::puzzleGamesRepository::PuzzleGamesRepository>;
    fn resources(&self) -> Arc<super::resourcesRepository::ResourcesRepository>;
    fn reviews(&self) -> Arc<super::reviewsRepository::ReviewsRepository>;
    fn roles(&self) -> Arc<super::rolesRepository::RolesRepository>;
    fn templates(&self) -> Arc<super::templatesRepository::TemplatesRepository>;
    fn template_types(&self) -> Arc<super::templateTypesRepository::TemplateTypesRepository>;
    fn users(&self) -> Arc<super::usersRepository::UsersRepository>;
    fn user_groups(&self) -> Arc<super::userGroupsRepository::UserGroupsRepository>;
    fn user_roles(&self) -> Arc<super::userRolesRepository::UserRolesRepository>;
    fn user_settings(&self) -> Arc<super::userSettingsRepository::UserSettingsRepository>;
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
    fn puzzle_games(&self) -> Arc<super::puzzleGamesRepository::PuzzleGamesRepository> {
        Arc::new(super::puzzleGamesRepository::PuzzleGamesRepository::new(self.bind_connection(None)).expect("puzzle_games"))
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
    fn templates(&self) -> Arc<super::templatesRepository::TemplatesRepository> {
        Arc::new(super::templatesRepository::TemplatesRepository::new(self.bind_connection(None)).expect("templates"))
    }
    fn template_types(&self) -> Arc<super::templateTypesRepository::TemplateTypesRepository> {
        Arc::new(super::templateTypesRepository::TemplateTypesRepository::new(self.bind_connection(None)).expect("template_types"))
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
    fn user_settings(&self) -> Arc<super::userSettingsRepository::UserSettingsRepository> {
        Arc::new(super::userSettingsRepository::UserSettingsRepository::new(self.bind_connection(None)).expect("user_settings"))
    }
}
