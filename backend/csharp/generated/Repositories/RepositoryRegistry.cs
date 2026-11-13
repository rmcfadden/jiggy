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
        factory.Register("App", "Apps", connection => new AppsRepository(connection), connection => AppsRepository.CreateReadonly(connection));
        factory.Register("Application", "Applications", connection => new ApplicationsRepository(connection), connection => ApplicationsRepository.CreateReadonly(connection));
        factory.Register("ApplicationService", "ApplicationServices", connection => new ApplicationServicesRepository(connection), connection => ApplicationServicesRepository.CreateReadonly(connection));
        factory.Register("ApplicationSetting", "ApplicationSettings", connection => new ApplicationSettingsRepository(connection), connection => ApplicationSettingsRepository.CreateReadonly(connection));
        factory.Register("ApplicationType", "ApplicationTypes", connection => new ApplicationTypesRepository(connection), connection => ApplicationTypesRepository.CreateReadonly(connection));
        factory.Register("ApplicationUri", "ApplicationUris", connection => new ApplicationUrisRepository(connection), connection => ApplicationUrisRepository.CreateReadonly(connection));
        factory.Register("ApplicationUser", "ApplicationUsers", connection => new ApplicationUsersRepository(connection), connection => ApplicationUsersRepository.CreateReadonly(connection));
        factory.Register("ApplicationVisibility", "ApplicationVisibilities", connection => new ApplicationVisibilitiesRepository(connection), connection => ApplicationVisibilitiesRepository.CreateReadonly(connection));
        factory.Register("AuthenticationMethod", "AuthenticationMethods", connection => new AuthenticationMethodsRepository(connection), connection => AuthenticationMethodsRepository.CreateReadonly(connection));
        factory.Register("AuthorizationCode", "AuthorizationCodes", connection => new AuthorizationCodesRepository(connection), connection => AuthorizationCodesRepository.CreateReadonly(connection));
        factory.Register("Category", "Categories", connection => new CategoriesRepository(connection), connection => CategoriesRepository.CreateReadonly(connection));
        factory.Register("Contact", "Contacts", connection => new ContactsRepository(connection), connection => ContactsRepository.CreateReadonly(connection));
        factory.Register("ContactAttribute", "ContactAttributes", connection => new ContactAttributesRepository(connection), connection => ContactAttributesRepository.CreateReadonly(connection));
        factory.Register("ContactLabel", "ContactLabels", connection => new ContactLabelsRepository(connection), connection => ContactLabelsRepository.CreateReadonly(connection));
        factory.Register("Email", "Emails", connection => new EmailsRepository(connection), connection => EmailsRepository.CreateReadonly(connection));
        factory.Register("EmailAttribute", "EmailAttributes", connection => new EmailAttributesRepository(connection), connection => EmailAttributesRepository.CreateReadonly(connection));
        factory.Register("EmailLabel", "EmailLabels", connection => new EmailLabelsRepository(connection), connection => EmailLabelsRepository.CreateReadonly(connection));
        factory.Register("EmailToken", "EmailTokens", connection => new EmailTokensRepository(connection), connection => EmailTokensRepository.CreateReadonly(connection));
        factory.Register("EmailType", "EmailTypes", connection => new EmailTypesRepository(connection), connection => EmailTypesRepository.CreateReadonly(connection));
        factory.Register("Game", "Games", connection => new GamesRepository(connection), connection => GamesRepository.CreateReadonly(connection));
        factory.Register("GameAttribute", "GameAttributes", connection => new GameAttributesRepository(connection), connection => GameAttributesRepository.CreateReadonly(connection));
        factory.Register("GameCategory", "GameCategories", connection => new GameCategoriesRepository(connection), connection => GameCategoriesRepository.CreateReadonly(connection));
        factory.Register("GameParent", "GameParents", connection => new GameParentsRepository(connection), connection => GameParentsRepository.CreateReadonly(connection));
        factory.Register("GameParentCategory", "GameParentCategories", connection => new GameParentCategoriesRepository(connection), connection => GameParentCategoriesRepository.CreateReadonly(connection));
        factory.Register("GameParentConfig", "GameParentConfigs", connection => new GameParentConfigsRepository(connection), connection => GameParentConfigsRepository.CreateReadonly(connection));
        factory.Register("GameParentSetting", "GameParentSettings", connection => new GameParentSettingsRepository(connection), connection => GameParentSettingsRepository.CreateReadonly(connection));
        factory.Register("GamePlay", "GamePlays", connection => new GamePlaysRepository(connection), connection => GamePlaysRepository.CreateReadonly(connection));
        factory.Register("GamePlayAction", "GamePlayActions", connection => new GamePlayActionsRepository(connection), connection => GamePlayActionsRepository.CreateReadonly(connection));
        factory.Register("GamePlayState", "GamePlayStates", connection => new GamePlayStatesRepository(connection), connection => GamePlayStatesRepository.CreateReadonly(connection));
        factory.Register("GamePlayUser", "GamePlayUsers", connection => new GamePlayUsersRepository(connection), connection => GamePlayUsersRepository.CreateReadonly(connection));
        factory.Register("GameReview", "GameReviews", connection => new GameReviewsRepository(connection), connection => GameReviewsRepository.CreateReadonly(connection));
        factory.Register("GameSetting", "GameSettings", connection => new GameSettingsRepository(connection), connection => GameSettingsRepository.CreateReadonly(connection));
        factory.Register("Gender", "Genders", connection => new GendersRepository(connection), connection => GendersRepository.CreateReadonly(connection));
        factory.Register("Group", "Groups", connection => new GroupsRepository(connection), connection => GroupsRepository.CreateReadonly(connection));
        factory.Register("IdentityProvider", "IdentityProviders", connection => new IdentityProvidersRepository(connection), connection => IdentityProvidersRepository.CreateReadonly(connection));
        factory.Register("IdentityProviderAuthorizeSession", "IdentityProviderAuthorizeSessions", connection => new IdentityProviderAuthorizeSessionsRepository(connection), connection => IdentityProviderAuthorizeSessionsRepository.CreateReadonly(connection));
        factory.Register("IdentityProviderLinkedUser", "IdentityProviderLinkedUsers", connection => new IdentityProviderLinkedUsersRepository(connection), connection => IdentityProviderLinkedUsersRepository.CreateReadonly(connection));
        factory.Register("IdentityProviderLinkedUserFieldType", "IdentityProviderLinkedUserFieldTypes", connection => new IdentityProviderLinkedUserFieldTypesRepository(connection), connection => IdentityProviderLinkedUserFieldTypesRepository.CreateReadonly(connection));
        factory.Register("IdentityProviderSetting", "IdentityProviderSettings", connection => new IdentityProviderSettingsRepository(connection), connection => IdentityProviderSettingsRepository.CreateReadonly(connection));
        factory.Register("IdentityProviderSigninAttempt", "IdentityProviderSigninAttempts", connection => new IdentityProviderSigninAttemptsRepository(connection), connection => IdentityProviderSigninAttemptsRepository.CreateReadonly(connection));
        factory.Register("IdentityProviderType", "IdentityProviderTypes", connection => new IdentityProviderTypesRepository(connection), connection => IdentityProviderTypesRepository.CreateReadonly(connection));
        factory.Register("Label", "Labels", connection => new LabelsRepository(connection), connection => LabelsRepository.CreateReadonly(connection));
        factory.Register("Language", "Languages", connection => new LanguagesRepository(connection), connection => LanguagesRepository.CreateReadonly(connection));
        factory.Register("LocalizedString", "LocalizedStrings", connection => new LocalizedStringsRepository(connection), connection => LocalizedStringsRepository.CreateReadonly(connection));
        factory.Register("LocalizedStringName", "LocalizedStringNames", connection => new LocalizedStringNamesRepository(connection), connection => LocalizedStringNamesRepository.CreateReadonly(connection));
        factory.Register("Log", "Logs", connection => new LogsRepository(connection), connection => LogsRepository.CreateReadonly(connection));
        factory.Register("LogAttribute", "LogAttributes", connection => new LogAttributesRepository(connection), connection => LogAttributesRepository.CreateReadonly(connection));
        factory.Register("LogType", "LogTypes", connection => new LogTypesRepository(connection), connection => LogTypesRepository.CreateReadonly(connection));
        factory.Register("MimeType", "MimeTypes", connection => new MimeTypesRepository(connection), connection => MimeTypesRepository.CreateReadonly(connection));
        factory.Register("OauthGrantType", "OauthGrantTypes", connection => new OauthGrantTypesRepository(connection), connection => OauthGrantTypesRepository.CreateReadonly(connection));
        factory.Register("Phone", "Phones", connection => new PhonesRepository(connection), connection => PhonesRepository.CreateReadonly(connection));
        factory.Register("PhoneAttribute", "PhoneAttributes", connection => new PhoneAttributesRepository(connection), connection => PhoneAttributesRepository.CreateReadonly(connection));
        factory.Register("PhoneLabel", "PhoneLabels", connection => new PhoneLabelsRepository(connection), connection => PhoneLabelsRepository.CreateReadonly(connection));
        factory.Register("PhoneType", "PhoneTypes", connection => new PhoneTypesRepository(connection), connection => PhoneTypesRepository.CreateReadonly(connection));
        factory.Register("Resource", "Resources", connection => new ResourcesRepository(connection), connection => ResourcesRepository.CreateReadonly(connection));
        factory.Register("Review", "Reviews", connection => new ReviewsRepository(connection), connection => ReviewsRepository.CreateReadonly(connection));
        factory.Register("ReviewFeedback", "ReviewFeedbacks", connection => new ReviewFeedbacksRepository(connection), connection => ReviewFeedbacksRepository.CreateReadonly(connection));
        factory.Register("Role", "Roles", connection => new RolesRepository(connection), connection => RolesRepository.CreateReadonly(connection));
        factory.Register("Secret", "Secrets", connection => new SecretsRepository(connection), connection => SecretsRepository.CreateReadonly(connection));
        factory.Register("SecretType", "SecretTypes", connection => new SecretTypesRepository(connection), connection => SecretTypesRepository.CreateReadonly(connection));
        factory.Register("Service", "Services", connection => new ServicesRepository(connection), connection => ServicesRepository.CreateReadonly(connection));
        factory.Register("ServiceSetting", "ServiceSettings", connection => new ServiceSettingsRepository(connection), connection => ServiceSettingsRepository.CreateReadonly(connection));
        factory.Register("ServiceUri", "ServiceUris", connection => new ServiceUrisRepository(connection), connection => ServiceUrisRepository.CreateReadonly(connection));
        factory.Register("Session", "Sessions", connection => new SessionsRepository(connection), connection => SessionsRepository.CreateReadonly(connection));
        factory.Register("SessionHit", "SessionHits", connection => new SessionHitsRepository(connection), connection => SessionHitsRepository.CreateReadonly(connection));
        factory.Register("SessionStatesBase", "SessionStatesBases", connection => new SessionStatesBasesRepository(connection), connection => SessionStatesBasesRepository.CreateReadonly(connection));
        factory.Register("SessionType", "SessionTypes", connection => new SessionTypesRepository(connection), connection => SessionTypesRepository.CreateReadonly(connection));
        factory.Register("Setting", "Settings", connection => new SettingsRepository(connection), connection => SettingsRepository.CreateReadonly(connection));
        factory.Register("Template", "Templates", connection => new TemplatesRepository(connection), connection => TemplatesRepository.CreateReadonly(connection));
        factory.Register("TemplateType", "TemplateTypes", connection => new TemplateTypesRepository(connection), connection => TemplateTypesRepository.CreateReadonly(connection));
        factory.Register("Token", "Tokens", connection => new TokensRepository(connection), connection => TokensRepository.CreateReadonly(connection));
        factory.Register("TokenType", "TokenTypes", connection => new TokenTypesRepository(connection), connection => TokenTypesRepository.CreateReadonly(connection));
        factory.Register("Uri", "Uris", connection => new UrisRepository(connection), connection => UrisRepository.CreateReadonly(connection));
        factory.Register("UriType", "UriTypes", connection => new UriTypesRepository(connection), connection => UriTypesRepository.CreateReadonly(connection));
        factory.Register("User", "Users", connection => new UsersRepository(connection), connection => UsersRepository.CreateReadonly(connection));
        factory.Register("UserGroup", "UserGroups", connection => new UserGroupsRepository(connection), connection => UserGroupsRepository.CreateReadonly(connection));
        factory.Register("UserRole", "UserRoles", connection => new UserRolesRepository(connection), connection => UserRolesRepository.CreateReadonly(connection));
        factory.Register("UserSecret", "UserSecrets", connection => new UserSecretsRepository(connection), connection => UserSecretsRepository.CreateReadonly(connection));
        factory.Register("UserSetting", "UserSettings", connection => new UserSettingsRepository(connection), connection => UserSettingsRepository.CreateReadonly(connection));
        factory.Register("UserToken", "UserTokens", connection => new UserTokensRepository(connection), connection => UserTokensRepository.CreateReadonly(connection));
    }
}
