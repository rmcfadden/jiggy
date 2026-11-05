using System.Runtime.CompilerServices;
using Datasources;

public static class RepositoryRegistry
{
    [ModuleInitializer]
    internal static void Bind() => RepositoryFactory.Bind(Register);

    public static void Register(RepositoryFactory factory)
    {
        factory.Register("Address", "Addresses", connection => new AddressesRepository(connection), connection => AddressesRepository.CreateReadonly(connection));
        factory.Register("AddressAttribute", "AddressAttributes", connection => new AddressAttributesRepository(connection), connection => AddressAttributesRepository.CreateReadonly(connection));
        factory.Register("AddressLabel", "AddressLabels", connection => new AddressLabelsRepository(connection), connection => AddressLabelsRepository.CreateReadonly(connection));
        factory.Register("AddressType", "AddressTypes", connection => new AddressTypesRepository(connection), connection => AddressTypesRepository.CreateReadonly(connection));
        factory.Register("Category", "Categories", connection => new CategoriesRepository(connection), connection => CategoriesRepository.CreateReadonly(connection));
        factory.Register("Contact", "Contacts", connection => new ContactsRepository(connection), connection => ContactsRepository.CreateReadonly(connection));
        factory.Register("ContactAttribute", "ContactAttributes", connection => new ContactAttributesRepository(connection), connection => ContactAttributesRepository.CreateReadonly(connection));
        factory.Register("ContactLabel", "ContactLabels", connection => new ContactLabelsRepository(connection), connection => ContactLabelsRepository.CreateReadonly(connection));
        factory.Register("Email", "Emails", connection => new EmailsRepository(connection), connection => EmailsRepository.CreateReadonly(connection));
        factory.Register("EmailAttribute", "EmailAttributes", connection => new EmailAttributesRepository(connection), connection => EmailAttributesRepository.CreateReadonly(connection));
        factory.Register("EmailLabel", "EmailLabels", connection => new EmailLabelsRepository(connection), connection => EmailLabelsRepository.CreateReadonly(connection));
        factory.Register("EmailType", "EmailTypes", connection => new EmailTypesRepository(connection), connection => EmailTypesRepository.CreateReadonly(connection));
        factory.Register("Game", "Games", connection => new GamesRepository(connection), connection => GamesRepository.CreateReadonly(connection));
        factory.Register("GameConfig", "GameConfigs", connection => new GameConfigsRepository(connection), connection => GameConfigsRepository.CreateReadonly(connection));
        factory.Register("GameInstance", "GameInstances", connection => new GameInstancesRepository(connection), connection => GameInstancesRepository.CreateReadonly(connection));
        factory.Register("GameInstanceCategory", "GameInstanceCategories", connection => new GameInstanceCategoriesRepository(connection), connection => GameInstanceCategoriesRepository.CreateReadonly(connection));
        factory.Register("GameInstanceSetting", "GameInstanceSettings", connection => new GameInstanceSettingsRepository(connection), connection => GameInstanceSettingsRepository.CreateReadonly(connection));
        factory.Register("GameInstanceState", "GameInstanceStates", connection => new GameInstanceStatesRepository(connection), connection => GameInstanceStatesRepository.CreateReadonly(connection));
        factory.Register("GameSetting", "GameSettings", connection => new GameSettingsRepository(connection), connection => GameSettingsRepository.CreateReadonly(connection));
        factory.Register("Gender", "Genders", connection => new GendersRepository(connection), connection => GendersRepository.CreateReadonly(connection));
        factory.Register("Group", "Groups", connection => new GroupsRepository(connection), connection => GroupsRepository.CreateReadonly(connection));
        factory.Register("Label", "Labels", connection => new LabelsRepository(connection), connection => LabelsRepository.CreateReadonly(connection));
        factory.Register("Phone", "Phones", connection => new PhonesRepository(connection), connection => PhonesRepository.CreateReadonly(connection));
        factory.Register("PhoneAttribute", "PhoneAttributes", connection => new PhoneAttributesRepository(connection), connection => PhoneAttributesRepository.CreateReadonly(connection));
        factory.Register("PhoneLabel", "PhoneLabels", connection => new PhoneLabelsRepository(connection), connection => PhoneLabelsRepository.CreateReadonly(connection));
        factory.Register("PhoneType", "PhoneTypes", connection => new PhoneTypesRepository(connection), connection => PhoneTypesRepository.CreateReadonly(connection));
        factory.Register("Review", "Reviews", connection => new ReviewsRepository(connection), connection => ReviewsRepository.CreateReadonly(connection));
        factory.Register("Role", "Roles", connection => new RolesRepository(connection), connection => RolesRepository.CreateReadonly(connection));
        factory.Register("User", "Users", connection => new UsersRepository(connection), connection => UsersRepository.CreateReadonly(connection));
        factory.Register("UserGroup", "UserGroups", connection => new UserGroupsRepository(connection), connection => UserGroupsRepository.CreateReadonly(connection));
        factory.Register("UserRole", "UserRoles", connection => new UserRolesRepository(connection), connection => UserRolesRepository.CreateReadonly(connection));
        factory.Register("UserSetting", "UserSettings", connection => new UserSettingsRepository(connection), connection => UserSettingsRepository.CreateReadonly(connection));
    }
}
