use datasources::{CRUDRepository, Datasource, ICRUDRepository, IReadonlyRepository, RepositoryFactory};
use super::super::Address;
use super::super::AddressType;
use super::super::Categories;
use super::super::Contact;
use super::super::ContactChangeLog;
use super::super::ContactGroup;
use super::super::ContactGroupMember;
use super::super::ContactPreferences;
use super::super::ContactSettings;
use super::super::ContactSource;
use super::super::GameSettings;
use super::super::GameStates;
use super::super::Games;
use super::super::GamesCategories;
use super::super::Group;
use super::super::LegacyContact;
use super::super::Phone;
use super::super::PhoneType;
use super::super::Reviews;
use super::super::Role;
use super::super::UserGroup;
use super::super::UserRole;
use super::super::UserSettings;
use super::super::Users;
use std::sync::Arc;

pub fn register(factory: &RepositoryFactory) {
    factory.register_named(
        "Address",
        "addresses",
        |connection| Arc::new(super::addressRepository::address_repository(connection).expect("repository")) as Arc<dyn ICRUDRepository<Address>>,
        |connection| Arc::new(super::addressRepository::address_readonly_repository(connection).expect("repository")) as Arc<dyn IReadonlyRepository<Address>>,
    );
    factory.register_named(
        "AddressType",
        "address_types",
        |connection| Arc::new(super::addressTypeRepository::address_type_repository(connection).expect("repository")) as Arc<dyn ICRUDRepository<AddressType>>,
        |connection| Arc::new(super::addressTypeRepository::address_type_readonly_repository(connection).expect("repository")) as Arc<dyn IReadonlyRepository<AddressType>>,
    );
    factory.register_named(
        "Categories",
        "categories",
        |connection| Arc::new(super::categoriesRepository::categories_repository(connection).expect("repository")) as Arc<dyn ICRUDRepository<Categories>>,
        |connection| Arc::new(super::categoriesRepository::categories_readonly_repository(connection).expect("repository")) as Arc<dyn IReadonlyRepository<Categories>>,
    );
    factory.register_named(
        "Contact",
        "contacts",
        |connection| Arc::new(super::contactRepository::contact_repository(connection).expect("repository")) as Arc<dyn ICRUDRepository<Contact>>,
        |connection| Arc::new(super::contactRepository::contact_readonly_repository(connection).expect("repository")) as Arc<dyn IReadonlyRepository<Contact>>,
    );
    factory.register_named(
        "ContactChangeLog",
        "contact_change_logs",
        |connection| Arc::new(super::contactChangeLogRepository::contact_change_log_repository(connection).expect("repository")) as Arc<dyn ICRUDRepository<ContactChangeLog>>,
        |connection| Arc::new(super::contactChangeLogRepository::contact_change_log_readonly_repository(connection).expect("repository")) as Arc<dyn IReadonlyRepository<ContactChangeLog>>,
    );
    factory.register_named(
        "ContactGroup",
        "contact_groups",
        |connection| Arc::new(super::contactGroupRepository::contact_group_repository(connection).expect("repository")) as Arc<dyn ICRUDRepository<ContactGroup>>,
        |connection| Arc::new(super::contactGroupRepository::contact_group_readonly_repository(connection).expect("repository")) as Arc<dyn IReadonlyRepository<ContactGroup>>,
    );
    factory.register_named(
        "ContactGroupMember",
        "contact_group_members",
        |connection| Arc::new(super::contactGroupMemberRepository::contact_group_member_repository(connection).expect("repository")) as Arc<dyn ICRUDRepository<ContactGroupMember>>,
        |connection| Arc::new(super::contactGroupMemberRepository::contact_group_member_readonly_repository(connection).expect("repository")) as Arc<dyn IReadonlyRepository<ContactGroupMember>>,
    );
    factory.register_named(
        "ContactPreferences",
        "contact_preferences",
        |connection| Arc::new(super::contactPreferencesRepository::contact_preferences_repository(connection).expect("repository")) as Arc<dyn ICRUDRepository<ContactPreferences>>,
        |connection| Arc::new(super::contactPreferencesRepository::contact_preferences_readonly_repository(connection).expect("repository")) as Arc<dyn IReadonlyRepository<ContactPreferences>>,
    );
    factory.register_named(
        "ContactSettings",
        "contact_settings",
        |connection| Arc::new(super::contactSettingsRepository::contact_settings_repository(connection).expect("repository")) as Arc<dyn ICRUDRepository<ContactSettings>>,
        |connection| Arc::new(super::contactSettingsRepository::contact_settings_readonly_repository(connection).expect("repository")) as Arc<dyn IReadonlyRepository<ContactSettings>>,
    );
    factory.register_named(
        "ContactSource",
        "contact_sources",
        |connection| Arc::new(super::contactSourceRepository::contact_source_repository(connection).expect("repository")) as Arc<dyn ICRUDRepository<ContactSource>>,
        |connection| Arc::new(super::contactSourceRepository::contact_source_readonly_repository(connection).expect("repository")) as Arc<dyn IReadonlyRepository<ContactSource>>,
    );
    factory.register_named(
        "GameSettings",
        "game_settings",
        |connection| Arc::new(super::gameSettingsRepository::game_settings_repository(connection).expect("repository")) as Arc<dyn ICRUDRepository<GameSettings>>,
        |connection| Arc::new(super::gameSettingsRepository::game_settings_readonly_repository(connection).expect("repository")) as Arc<dyn IReadonlyRepository<GameSettings>>,
    );
    factory.register_named(
        "GameStates",
        "game_states",
        |connection| Arc::new(super::gameStatesRepository::game_states_repository(connection).expect("repository")) as Arc<dyn ICRUDRepository<GameStates>>,
        |connection| Arc::new(super::gameStatesRepository::game_states_readonly_repository(connection).expect("repository")) as Arc<dyn IReadonlyRepository<GameStates>>,
    );
    factory.register_named(
        "Games",
        "games",
        |connection| Arc::new(super::gamesRepository::games_repository(connection).expect("repository")) as Arc<dyn ICRUDRepository<Games>>,
        |connection| Arc::new(super::gamesRepository::games_readonly_repository(connection).expect("repository")) as Arc<dyn IReadonlyRepository<Games>>,
    );
    factory.register_named(
        "GamesCategories",
        "games_categories",
        |connection| Arc::new(super::gamesCategoriesRepository::games_categories_repository(connection).expect("repository")) as Arc<dyn ICRUDRepository<GamesCategories>>,
        |connection| Arc::new(super::gamesCategoriesRepository::games_categories_readonly_repository(connection).expect("repository")) as Arc<dyn IReadonlyRepository<GamesCategories>>,
    );
    factory.register_named(
        "Group",
        "groups",
        |connection| Arc::new(super::groupRepository::group_repository(connection).expect("repository")) as Arc<dyn ICRUDRepository<Group>>,
        |connection| Arc::new(super::groupRepository::group_readonly_repository(connection).expect("repository")) as Arc<dyn IReadonlyRepository<Group>>,
    );
    factory.register_named(
        "LegacyContact",
        "legacy_contacts",
        |connection| Arc::new(super::legacyContactRepository::legacy_contact_repository(connection).expect("repository")) as Arc<dyn ICRUDRepository<LegacyContact>>,
        |connection| Arc::new(super::legacyContactRepository::legacy_contact_readonly_repository(connection).expect("repository")) as Arc<dyn IReadonlyRepository<LegacyContact>>,
    );
    factory.register_named(
        "Phone",
        "phones",
        |connection| Arc::new(super::phoneRepository::phone_repository(connection).expect("repository")) as Arc<dyn ICRUDRepository<Phone>>,
        |connection| Arc::new(super::phoneRepository::phone_readonly_repository(connection).expect("repository")) as Arc<dyn IReadonlyRepository<Phone>>,
    );
    factory.register_named(
        "PhoneType",
        "phone_types",
        |connection| Arc::new(super::phoneTypeRepository::phone_type_repository(connection).expect("repository")) as Arc<dyn ICRUDRepository<PhoneType>>,
        |connection| Arc::new(super::phoneTypeRepository::phone_type_readonly_repository(connection).expect("repository")) as Arc<dyn IReadonlyRepository<PhoneType>>,
    );
    factory.register_named(
        "Reviews",
        "reviews",
        |connection| Arc::new(super::reviewsRepository::reviews_repository(connection).expect("repository")) as Arc<dyn ICRUDRepository<Reviews>>,
        |connection| Arc::new(super::reviewsRepository::reviews_readonly_repository(connection).expect("repository")) as Arc<dyn IReadonlyRepository<Reviews>>,
    );
    factory.register_named(
        "Role",
        "roles",
        |connection| Arc::new(super::roleRepository::role_repository(connection).expect("repository")) as Arc<dyn ICRUDRepository<Role>>,
        |connection| Arc::new(super::roleRepository::role_readonly_repository(connection).expect("repository")) as Arc<dyn IReadonlyRepository<Role>>,
    );
    factory.register_named(
        "UserGroup",
        "user_groups",
        |connection| Arc::new(super::userGroupRepository::user_group_repository(connection).expect("repository")) as Arc<dyn ICRUDRepository<UserGroup>>,
        |connection| Arc::new(super::userGroupRepository::user_group_readonly_repository(connection).expect("repository")) as Arc<dyn IReadonlyRepository<UserGroup>>,
    );
    factory.register_named(
        "UserRole",
        "user_roles",
        |connection| Arc::new(super::userRoleRepository::user_role_repository(connection).expect("repository")) as Arc<dyn ICRUDRepository<UserRole>>,
        |connection| Arc::new(super::userRoleRepository::user_role_readonly_repository(connection).expect("repository")) as Arc<dyn IReadonlyRepository<UserRole>>,
    );
    factory.register_named(
        "UserSettings",
        "user_settings",
        |connection| Arc::new(super::userSettingsRepository::user_settings_repository(connection).expect("repository")) as Arc<dyn ICRUDRepository<UserSettings>>,
        |connection| Arc::new(super::userSettingsRepository::user_settings_readonly_repository(connection).expect("repository")) as Arc<dyn IReadonlyRepository<UserSettings>>,
    );
    factory.register_named(
        "Users",
        "users",
        |connection| Arc::new(super::usersRepository::users_repository(connection).expect("repository")) as Arc<dyn ICRUDRepository<Users>>,
        |connection| Arc::new(super::usersRepository::users_readonly_repository(connection).expect("repository")) as Arc<dyn IReadonlyRepository<Users>>,
    );
}

datasources::bind_repositories!(register);

pub trait Repositories {
    fn addresses(&self) -> Arc<CRUDRepository<Address>>;
    fn address_types(&self) -> Arc<CRUDRepository<AddressType>>;
    fn categories(&self) -> Arc<CRUDRepository<Categories>>;
    fn contacts(&self) -> Arc<CRUDRepository<Contact>>;
    fn contact_change_logs(&self) -> Arc<CRUDRepository<ContactChangeLog>>;
    fn contact_groups(&self) -> Arc<CRUDRepository<ContactGroup>>;
    fn contact_group_members(&self) -> Arc<CRUDRepository<ContactGroupMember>>;
    fn contact_preferences(&self) -> Arc<CRUDRepository<ContactPreferences>>;
    fn contact_settings(&self) -> Arc<CRUDRepository<ContactSettings>>;
    fn contact_sources(&self) -> Arc<CRUDRepository<ContactSource>>;
    fn game_settings(&self) -> Arc<CRUDRepository<GameSettings>>;
    fn game_states(&self) -> Arc<CRUDRepository<GameStates>>;
    fn games(&self) -> Arc<CRUDRepository<Games>>;
    fn games_categories(&self) -> Arc<CRUDRepository<GamesCategories>>;
    fn groups(&self) -> Arc<CRUDRepository<Group>>;
    fn legacy_contacts(&self) -> Arc<CRUDRepository<LegacyContact>>;
    fn phones(&self) -> Arc<CRUDRepository<Phone>>;
    fn phone_types(&self) -> Arc<CRUDRepository<PhoneType>>;
    fn reviews(&self) -> Arc<CRUDRepository<Reviews>>;
    fn roles(&self) -> Arc<CRUDRepository<Role>>;
    fn user_groups(&self) -> Arc<CRUDRepository<UserGroup>>;
    fn user_roles(&self) -> Arc<CRUDRepository<UserRole>>;
    fn user_settings(&self) -> Arc<CRUDRepository<UserSettings>>;
    fn users(&self) -> Arc<CRUDRepository<Users>>;
}

impl Repositories for Arc<dyn Datasource> {
    fn addresses(&self) -> Arc<CRUDRepository<Address>> {
        Arc::new(super::addressRepository::address_repository(self.bind_connection(None)).expect("addresses"))
    }
    fn address_types(&self) -> Arc<CRUDRepository<AddressType>> {
        Arc::new(super::addressTypeRepository::address_type_repository(self.bind_connection(None)).expect("address_types"))
    }
    fn categories(&self) -> Arc<CRUDRepository<Categories>> {
        Arc::new(super::categoriesRepository::categories_repository(self.bind_connection(None)).expect("categories"))
    }
    fn contacts(&self) -> Arc<CRUDRepository<Contact>> {
        Arc::new(super::contactRepository::contact_repository(self.bind_connection(None)).expect("contacts"))
    }
    fn contact_change_logs(&self) -> Arc<CRUDRepository<ContactChangeLog>> {
        Arc::new(super::contactChangeLogRepository::contact_change_log_repository(self.bind_connection(None)).expect("contact_change_logs"))
    }
    fn contact_groups(&self) -> Arc<CRUDRepository<ContactGroup>> {
        Arc::new(super::contactGroupRepository::contact_group_repository(self.bind_connection(None)).expect("contact_groups"))
    }
    fn contact_group_members(&self) -> Arc<CRUDRepository<ContactGroupMember>> {
        Arc::new(super::contactGroupMemberRepository::contact_group_member_repository(self.bind_connection(None)).expect("contact_group_members"))
    }
    fn contact_preferences(&self) -> Arc<CRUDRepository<ContactPreferences>> {
        Arc::new(super::contactPreferencesRepository::contact_preferences_repository(self.bind_connection(None)).expect("contact_preferences"))
    }
    fn contact_settings(&self) -> Arc<CRUDRepository<ContactSettings>> {
        Arc::new(super::contactSettingsRepository::contact_settings_repository(self.bind_connection(None)).expect("contact_settings"))
    }
    fn contact_sources(&self) -> Arc<CRUDRepository<ContactSource>> {
        Arc::new(super::contactSourceRepository::contact_source_repository(self.bind_connection(None)).expect("contact_sources"))
    }
    fn game_settings(&self) -> Arc<CRUDRepository<GameSettings>> {
        Arc::new(super::gameSettingsRepository::game_settings_repository(self.bind_connection(None)).expect("game_settings"))
    }
    fn game_states(&self) -> Arc<CRUDRepository<GameStates>> {
        Arc::new(super::gameStatesRepository::game_states_repository(self.bind_connection(None)).expect("game_states"))
    }
    fn games(&self) -> Arc<CRUDRepository<Games>> {
        Arc::new(super::gamesRepository::games_repository(self.bind_connection(None)).expect("games"))
    }
    fn games_categories(&self) -> Arc<CRUDRepository<GamesCategories>> {
        Arc::new(super::gamesCategoriesRepository::games_categories_repository(self.bind_connection(None)).expect("games_categories"))
    }
    fn groups(&self) -> Arc<CRUDRepository<Group>> {
        Arc::new(super::groupRepository::group_repository(self.bind_connection(None)).expect("groups"))
    }
    fn legacy_contacts(&self) -> Arc<CRUDRepository<LegacyContact>> {
        Arc::new(super::legacyContactRepository::legacy_contact_repository(self.bind_connection(None)).expect("legacy_contacts"))
    }
    fn phones(&self) -> Arc<CRUDRepository<Phone>> {
        Arc::new(super::phoneRepository::phone_repository(self.bind_connection(None)).expect("phones"))
    }
    fn phone_types(&self) -> Arc<CRUDRepository<PhoneType>> {
        Arc::new(super::phoneTypeRepository::phone_type_repository(self.bind_connection(None)).expect("phone_types"))
    }
    fn reviews(&self) -> Arc<CRUDRepository<Reviews>> {
        Arc::new(super::reviewsRepository::reviews_repository(self.bind_connection(None)).expect("reviews"))
    }
    fn roles(&self) -> Arc<CRUDRepository<Role>> {
        Arc::new(super::roleRepository::role_repository(self.bind_connection(None)).expect("roles"))
    }
    fn user_groups(&self) -> Arc<CRUDRepository<UserGroup>> {
        Arc::new(super::userGroupRepository::user_group_repository(self.bind_connection(None)).expect("user_groups"))
    }
    fn user_roles(&self) -> Arc<CRUDRepository<UserRole>> {
        Arc::new(super::userRoleRepository::user_role_repository(self.bind_connection(None)).expect("user_roles"))
    }
    fn user_settings(&self) -> Arc<CRUDRepository<UserSettings>> {
        Arc::new(super::userSettingsRepository::user_settings_repository(self.bind_connection(None)).expect("user_settings"))
    }
    fn users(&self) -> Arc<CRUDRepository<Users>> {
        Arc::new(super::usersRepository::users_repository(self.bind_connection(None)).expect("users"))
    }
}
