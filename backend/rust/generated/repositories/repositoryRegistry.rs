use datasources::{CRUDRepository, Datasource, ICRUDRepository, IReadonlyRepository, RepositoryFactory};
use super::super::Address;
use super::super::AddressType;
use super::super::Category;
use super::super::Contact;
use super::super::ContactChangeLog;
use super::super::ContactGroup;
use super::super::ContactGroupMember;
use super::super::ContactPreference;
use super::super::ContactSetting;
use super::super::ContactSource;
use super::super::Game;
use super::super::GameCategory;
use super::super::GameSetting;
use super::super::GameState;
use super::super::Group;
use super::super::LegacyContact;
use super::super::Phone;
use super::super::PhoneType;
use super::super::Review;
use super::super::Role;
use super::super::User;
use super::super::UserGroup;
use super::super::UserRole;
use super::super::UserSetting;
use std::sync::Arc;

pub fn register(factory: &RepositoryFactory) {
    factory.register_named(
        "Address",
        "addresses",
        |connection| Arc::new(super::addressesRepository::addresses_repository(connection).expect("repository")) as Arc<dyn ICRUDRepository<Address>>,
        |connection| Arc::new(super::addressesRepository::addresses_readonly_repository(connection).expect("repository")) as Arc<dyn IReadonlyRepository<Address>>,
    );
    factory.register_named(
        "AddressType",
        "address_types",
        |connection| Arc::new(super::addressTypesRepository::address_types_repository(connection).expect("repository")) as Arc<dyn ICRUDRepository<AddressType>>,
        |connection| Arc::new(super::addressTypesRepository::address_types_readonly_repository(connection).expect("repository")) as Arc<dyn IReadonlyRepository<AddressType>>,
    );
    factory.register_named(
        "Category",
        "categories",
        |connection| Arc::new(super::categoriesRepository::categories_repository(connection).expect("repository")) as Arc<dyn ICRUDRepository<Category>>,
        |connection| Arc::new(super::categoriesRepository::categories_readonly_repository(connection).expect("repository")) as Arc<dyn IReadonlyRepository<Category>>,
    );
    factory.register_named(
        "Contact",
        "contacts",
        |connection| Arc::new(super::contactsRepository::contacts_repository(connection).expect("repository")) as Arc<dyn ICRUDRepository<Contact>>,
        |connection| Arc::new(super::contactsRepository::contacts_readonly_repository(connection).expect("repository")) as Arc<dyn IReadonlyRepository<Contact>>,
    );
    factory.register_named(
        "ContactChangeLog",
        "contact_change_logs",
        |connection| Arc::new(super::contactChangeLogsRepository::contact_change_logs_repository(connection).expect("repository")) as Arc<dyn ICRUDRepository<ContactChangeLog>>,
        |connection| Arc::new(super::contactChangeLogsRepository::contact_change_logs_readonly_repository(connection).expect("repository")) as Arc<dyn IReadonlyRepository<ContactChangeLog>>,
    );
    factory.register_named(
        "ContactGroup",
        "contact_groups",
        |connection| Arc::new(super::contactGroupsRepository::contact_groups_repository(connection).expect("repository")) as Arc<dyn ICRUDRepository<ContactGroup>>,
        |connection| Arc::new(super::contactGroupsRepository::contact_groups_readonly_repository(connection).expect("repository")) as Arc<dyn IReadonlyRepository<ContactGroup>>,
    );
    factory.register_named(
        "ContactGroupMember",
        "contact_group_members",
        |connection| Arc::new(super::contactGroupMembersRepository::contact_group_members_repository(connection).expect("repository")) as Arc<dyn ICRUDRepository<ContactGroupMember>>,
        |connection| Arc::new(super::contactGroupMembersRepository::contact_group_members_readonly_repository(connection).expect("repository")) as Arc<dyn IReadonlyRepository<ContactGroupMember>>,
    );
    factory.register_named(
        "ContactPreference",
        "contact_preferences",
        |connection| Arc::new(super::contactPreferencesRepository::contact_preferences_repository(connection).expect("repository")) as Arc<dyn ICRUDRepository<ContactPreference>>,
        |connection| Arc::new(super::contactPreferencesRepository::contact_preferences_readonly_repository(connection).expect("repository")) as Arc<dyn IReadonlyRepository<ContactPreference>>,
    );
    factory.register_named(
        "ContactSetting",
        "contact_settings",
        |connection| Arc::new(super::contactSettingsRepository::contact_settings_repository(connection).expect("repository")) as Arc<dyn ICRUDRepository<ContactSetting>>,
        |connection| Arc::new(super::contactSettingsRepository::contact_settings_readonly_repository(connection).expect("repository")) as Arc<dyn IReadonlyRepository<ContactSetting>>,
    );
    factory.register_named(
        "ContactSource",
        "contact_sources",
        |connection| Arc::new(super::contactSourcesRepository::contact_sources_repository(connection).expect("repository")) as Arc<dyn ICRUDRepository<ContactSource>>,
        |connection| Arc::new(super::contactSourcesRepository::contact_sources_readonly_repository(connection).expect("repository")) as Arc<dyn IReadonlyRepository<ContactSource>>,
    );
    factory.register_named(
        "Game",
        "games",
        |connection| Arc::new(super::gamesRepository::games_repository(connection).expect("repository")) as Arc<dyn ICRUDRepository<Game>>,
        |connection| Arc::new(super::gamesRepository::games_readonly_repository(connection).expect("repository")) as Arc<dyn IReadonlyRepository<Game>>,
    );
    factory.register_named(
        "GameCategory",
        "game_categories",
        |connection| Arc::new(super::gameCategoriesRepository::game_categories_repository(connection).expect("repository")) as Arc<dyn ICRUDRepository<GameCategory>>,
        |connection| Arc::new(super::gameCategoriesRepository::game_categories_readonly_repository(connection).expect("repository")) as Arc<dyn IReadonlyRepository<GameCategory>>,
    );
    factory.register_named(
        "GameSetting",
        "game_settings",
        |connection| Arc::new(super::gameSettingsRepository::game_settings_repository(connection).expect("repository")) as Arc<dyn ICRUDRepository<GameSetting>>,
        |connection| Arc::new(super::gameSettingsRepository::game_settings_readonly_repository(connection).expect("repository")) as Arc<dyn IReadonlyRepository<GameSetting>>,
    );
    factory.register_named(
        "GameState",
        "game_states",
        |connection| Arc::new(super::gameStatesRepository::game_states_repository(connection).expect("repository")) as Arc<dyn ICRUDRepository<GameState>>,
        |connection| Arc::new(super::gameStatesRepository::game_states_readonly_repository(connection).expect("repository")) as Arc<dyn IReadonlyRepository<GameState>>,
    );
    factory.register_named(
        "Group",
        "groups",
        |connection| Arc::new(super::groupsRepository::groups_repository(connection).expect("repository")) as Arc<dyn ICRUDRepository<Group>>,
        |connection| Arc::new(super::groupsRepository::groups_readonly_repository(connection).expect("repository")) as Arc<dyn IReadonlyRepository<Group>>,
    );
    factory.register_named(
        "LegacyContact",
        "legacy_contacts",
        |connection| Arc::new(super::legacyContactsRepository::legacy_contacts_repository(connection).expect("repository")) as Arc<dyn ICRUDRepository<LegacyContact>>,
        |connection| Arc::new(super::legacyContactsRepository::legacy_contacts_readonly_repository(connection).expect("repository")) as Arc<dyn IReadonlyRepository<LegacyContact>>,
    );
    factory.register_named(
        "Phone",
        "phones",
        |connection| Arc::new(super::phonesRepository::phones_repository(connection).expect("repository")) as Arc<dyn ICRUDRepository<Phone>>,
        |connection| Arc::new(super::phonesRepository::phones_readonly_repository(connection).expect("repository")) as Arc<dyn IReadonlyRepository<Phone>>,
    );
    factory.register_named(
        "PhoneType",
        "phone_types",
        |connection| Arc::new(super::phoneTypesRepository::phone_types_repository(connection).expect("repository")) as Arc<dyn ICRUDRepository<PhoneType>>,
        |connection| Arc::new(super::phoneTypesRepository::phone_types_readonly_repository(connection).expect("repository")) as Arc<dyn IReadonlyRepository<PhoneType>>,
    );
    factory.register_named(
        "Review",
        "reviews",
        |connection| Arc::new(super::reviewsRepository::reviews_repository(connection).expect("repository")) as Arc<dyn ICRUDRepository<Review>>,
        |connection| Arc::new(super::reviewsRepository::reviews_readonly_repository(connection).expect("repository")) as Arc<dyn IReadonlyRepository<Review>>,
    );
    factory.register_named(
        "Role",
        "roles",
        |connection| Arc::new(super::rolesRepository::roles_repository(connection).expect("repository")) as Arc<dyn ICRUDRepository<Role>>,
        |connection| Arc::new(super::rolesRepository::roles_readonly_repository(connection).expect("repository")) as Arc<dyn IReadonlyRepository<Role>>,
    );
    factory.register_named(
        "User",
        "users",
        |connection| Arc::new(super::usersRepository::users_repository(connection).expect("repository")) as Arc<dyn ICRUDRepository<User>>,
        |connection| Arc::new(super::usersRepository::users_readonly_repository(connection).expect("repository")) as Arc<dyn IReadonlyRepository<User>>,
    );
    factory.register_named(
        "UserGroup",
        "user_groups",
        |connection| Arc::new(super::userGroupsRepository::user_groups_repository(connection).expect("repository")) as Arc<dyn ICRUDRepository<UserGroup>>,
        |connection| Arc::new(super::userGroupsRepository::user_groups_readonly_repository(connection).expect("repository")) as Arc<dyn IReadonlyRepository<UserGroup>>,
    );
    factory.register_named(
        "UserRole",
        "user_roles",
        |connection| Arc::new(super::userRolesRepository::user_roles_repository(connection).expect("repository")) as Arc<dyn ICRUDRepository<UserRole>>,
        |connection| Arc::new(super::userRolesRepository::user_roles_readonly_repository(connection).expect("repository")) as Arc<dyn IReadonlyRepository<UserRole>>,
    );
    factory.register_named(
        "UserSetting",
        "user_settings",
        |connection| Arc::new(super::userSettingsRepository::user_settings_repository(connection).expect("repository")) as Arc<dyn ICRUDRepository<UserSetting>>,
        |connection| Arc::new(super::userSettingsRepository::user_settings_readonly_repository(connection).expect("repository")) as Arc<dyn IReadonlyRepository<UserSetting>>,
    );
}

datasources::bind_repositories!(register);

pub trait Repositories {
    fn addresses(&self) -> Arc<CRUDRepository<Address>>;
    fn address_types(&self) -> Arc<CRUDRepository<AddressType>>;
    fn categories(&self) -> Arc<CRUDRepository<Category>>;
    fn contacts(&self) -> Arc<CRUDRepository<Contact>>;
    fn contact_change_logs(&self) -> Arc<CRUDRepository<ContactChangeLog>>;
    fn contact_groups(&self) -> Arc<CRUDRepository<ContactGroup>>;
    fn contact_group_members(&self) -> Arc<CRUDRepository<ContactGroupMember>>;
    fn contact_preferences(&self) -> Arc<CRUDRepository<ContactPreference>>;
    fn contact_settings(&self) -> Arc<CRUDRepository<ContactSetting>>;
    fn contact_sources(&self) -> Arc<CRUDRepository<ContactSource>>;
    fn games(&self) -> Arc<CRUDRepository<Game>>;
    fn game_categories(&self) -> Arc<CRUDRepository<GameCategory>>;
    fn game_settings(&self) -> Arc<CRUDRepository<GameSetting>>;
    fn game_states(&self) -> Arc<CRUDRepository<GameState>>;
    fn groups(&self) -> Arc<CRUDRepository<Group>>;
    fn legacy_contacts(&self) -> Arc<CRUDRepository<LegacyContact>>;
    fn phones(&self) -> Arc<CRUDRepository<Phone>>;
    fn phone_types(&self) -> Arc<CRUDRepository<PhoneType>>;
    fn reviews(&self) -> Arc<CRUDRepository<Review>>;
    fn roles(&self) -> Arc<CRUDRepository<Role>>;
    fn users(&self) -> Arc<CRUDRepository<User>>;
    fn user_groups(&self) -> Arc<CRUDRepository<UserGroup>>;
    fn user_roles(&self) -> Arc<CRUDRepository<UserRole>>;
    fn user_settings(&self) -> Arc<CRUDRepository<UserSetting>>;
}

impl Repositories for Arc<dyn Datasource> {
    fn addresses(&self) -> Arc<CRUDRepository<Address>> {
        Arc::new(super::addressesRepository::addresses_repository(self.bind_connection(None)).expect("addresses"))
    }
    fn address_types(&self) -> Arc<CRUDRepository<AddressType>> {
        Arc::new(super::addressTypesRepository::address_types_repository(self.bind_connection(None)).expect("address_types"))
    }
    fn categories(&self) -> Arc<CRUDRepository<Category>> {
        Arc::new(super::categoriesRepository::categories_repository(self.bind_connection(None)).expect("categories"))
    }
    fn contacts(&self) -> Arc<CRUDRepository<Contact>> {
        Arc::new(super::contactsRepository::contacts_repository(self.bind_connection(None)).expect("contacts"))
    }
    fn contact_change_logs(&self) -> Arc<CRUDRepository<ContactChangeLog>> {
        Arc::new(super::contactChangeLogsRepository::contact_change_logs_repository(self.bind_connection(None)).expect("contact_change_logs"))
    }
    fn contact_groups(&self) -> Arc<CRUDRepository<ContactGroup>> {
        Arc::new(super::contactGroupsRepository::contact_groups_repository(self.bind_connection(None)).expect("contact_groups"))
    }
    fn contact_group_members(&self) -> Arc<CRUDRepository<ContactGroupMember>> {
        Arc::new(super::contactGroupMembersRepository::contact_group_members_repository(self.bind_connection(None)).expect("contact_group_members"))
    }
    fn contact_preferences(&self) -> Arc<CRUDRepository<ContactPreference>> {
        Arc::new(super::contactPreferencesRepository::contact_preferences_repository(self.bind_connection(None)).expect("contact_preferences"))
    }
    fn contact_settings(&self) -> Arc<CRUDRepository<ContactSetting>> {
        Arc::new(super::contactSettingsRepository::contact_settings_repository(self.bind_connection(None)).expect("contact_settings"))
    }
    fn contact_sources(&self) -> Arc<CRUDRepository<ContactSource>> {
        Arc::new(super::contactSourcesRepository::contact_sources_repository(self.bind_connection(None)).expect("contact_sources"))
    }
    fn games(&self) -> Arc<CRUDRepository<Game>> {
        Arc::new(super::gamesRepository::games_repository(self.bind_connection(None)).expect("games"))
    }
    fn game_categories(&self) -> Arc<CRUDRepository<GameCategory>> {
        Arc::new(super::gameCategoriesRepository::game_categories_repository(self.bind_connection(None)).expect("game_categories"))
    }
    fn game_settings(&self) -> Arc<CRUDRepository<GameSetting>> {
        Arc::new(super::gameSettingsRepository::game_settings_repository(self.bind_connection(None)).expect("game_settings"))
    }
    fn game_states(&self) -> Arc<CRUDRepository<GameState>> {
        Arc::new(super::gameStatesRepository::game_states_repository(self.bind_connection(None)).expect("game_states"))
    }
    fn groups(&self) -> Arc<CRUDRepository<Group>> {
        Arc::new(super::groupsRepository::groups_repository(self.bind_connection(None)).expect("groups"))
    }
    fn legacy_contacts(&self) -> Arc<CRUDRepository<LegacyContact>> {
        Arc::new(super::legacyContactsRepository::legacy_contacts_repository(self.bind_connection(None)).expect("legacy_contacts"))
    }
    fn phones(&self) -> Arc<CRUDRepository<Phone>> {
        Arc::new(super::phonesRepository::phones_repository(self.bind_connection(None)).expect("phones"))
    }
    fn phone_types(&self) -> Arc<CRUDRepository<PhoneType>> {
        Arc::new(super::phoneTypesRepository::phone_types_repository(self.bind_connection(None)).expect("phone_types"))
    }
    fn reviews(&self) -> Arc<CRUDRepository<Review>> {
        Arc::new(super::reviewsRepository::reviews_repository(self.bind_connection(None)).expect("reviews"))
    }
    fn roles(&self) -> Arc<CRUDRepository<Role>> {
        Arc::new(super::rolesRepository::roles_repository(self.bind_connection(None)).expect("roles"))
    }
    fn users(&self) -> Arc<CRUDRepository<User>> {
        Arc::new(super::usersRepository::users_repository(self.bind_connection(None)).expect("users"))
    }
    fn user_groups(&self) -> Arc<CRUDRepository<UserGroup>> {
        Arc::new(super::userGroupsRepository::user_groups_repository(self.bind_connection(None)).expect("user_groups"))
    }
    fn user_roles(&self) -> Arc<CRUDRepository<UserRole>> {
        Arc::new(super::userRolesRepository::user_roles_repository(self.bind_connection(None)).expect("user_roles"))
    }
    fn user_settings(&self) -> Arc<CRUDRepository<UserSetting>> {
        Arc::new(super::userSettingsRepository::user_settings_repository(self.bind_connection(None)).expect("user_settings"))
    }
}
