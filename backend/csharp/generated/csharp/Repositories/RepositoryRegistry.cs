using System.Runtime.CompilerServices;
using Datasources;

public static class RepositoryRegistry
{
    [ModuleInitializer]
    internal static void Bind() => RepositoryFactory.Bind(Register);

    public static void Register(RepositoryFactory factory)
    {
        factory.Register("Address", "Addresses", connection => new AddressRepository(connection), connection => AddressRepository.CreateReadonly(connection));
        factory.Register("AddressType", "AddressTypes", connection => new AddressTypeRepository(connection), connection => AddressTypeRepository.CreateReadonly(connection));
        factory.Register("Categories", "Categories", connection => new CategoriesRepository(connection), connection => CategoriesRepository.CreateReadonly(connection));
        factory.Register("Contact", "Contacts", connection => new ContactRepository(connection), connection => ContactRepository.CreateReadonly(connection));
        factory.Register("ContactChangeLog", "ContactChangeLogs", connection => new ContactChangeLogRepository(connection), connection => ContactChangeLogRepository.CreateReadonly(connection));
        factory.Register("ContactGroup", "ContactGroups", connection => new ContactGroupRepository(connection), connection => ContactGroupRepository.CreateReadonly(connection));
        factory.Register("ContactGroupMember", "ContactGroupMembers", connection => new ContactGroupMemberRepository(connection), connection => ContactGroupMemberRepository.CreateReadonly(connection));
        factory.Register("ContactPreferences", "ContactPreferences", connection => new ContactPreferencesRepository(connection), connection => ContactPreferencesRepository.CreateReadonly(connection));
        factory.Register("ContactSettings", "ContactSettings", connection => new ContactSettingsRepository(connection), connection => ContactSettingsRepository.CreateReadonly(connection));
        factory.Register("ContactSource", "ContactSources", connection => new ContactSourceRepository(connection), connection => ContactSourceRepository.CreateReadonly(connection));
        factory.Register("GameSettings", "GameSettings", connection => new GameSettingsRepository(connection), connection => GameSettingsRepository.CreateReadonly(connection));
        factory.Register("GameStates", "GameStates", connection => new GameStatesRepository(connection), connection => GameStatesRepository.CreateReadonly(connection));
        factory.Register("Games", "Games", connection => new GamesRepository(connection), connection => GamesRepository.CreateReadonly(connection));
        factory.Register("GamesCategories", "GamesCategories", connection => new GamesCategoriesRepository(connection), connection => GamesCategoriesRepository.CreateReadonly(connection));
        factory.Register("Group", "Groups", connection => new GroupRepository(connection), connection => GroupRepository.CreateReadonly(connection));
        factory.Register("LegacyContact", "LegacyContacts", connection => new LegacyContactRepository(connection), connection => LegacyContactRepository.CreateReadonly(connection));
        factory.Register("Phone", "Phones", connection => new PhoneRepository(connection), connection => PhoneRepository.CreateReadonly(connection));
        factory.Register("PhoneType", "PhoneTypes", connection => new PhoneTypeRepository(connection), connection => PhoneTypeRepository.CreateReadonly(connection));
        factory.Register("Reviews", "Reviews", connection => new ReviewsRepository(connection), connection => ReviewsRepository.CreateReadonly(connection));
        factory.Register("Role", "Roles", connection => new RoleRepository(connection), connection => RoleRepository.CreateReadonly(connection));
        factory.Register("UserGroup", "UserGroups", connection => new UserGroupRepository(connection), connection => UserGroupRepository.CreateReadonly(connection));
        factory.Register("UserRole", "UserRoles", connection => new UserRoleRepository(connection), connection => UserRoleRepository.CreateReadonly(connection));
        factory.Register("UserSettings", "UserSettings", connection => new UserSettingsRepository(connection), connection => UserSettingsRepository.CreateReadonly(connection));
        factory.Register("Users", "Users", connection => new UsersRepository(connection), connection => UsersRepository.CreateReadonly(connection));
    }
}
