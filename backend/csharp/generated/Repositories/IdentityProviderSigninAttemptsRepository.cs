using Datasources;

public sealed class IdentityProviderSigninAttemptsRepository : CRUDRepository<Backend.Types.View.IdentityProviderSigninAttempt>
{
    public IdentityProviderSigninAttemptsRepository(IConnection connection) : base(connection, Options(connection)) { }

    public static IReadonlyRepository<Backend.Types.View.IdentityProviderSigninAttempt> CreateReadonly(IConnection connection) =>
        new ReadonlyRepository<Backend.Types.View.IdentityProviderSigninAttempt>(connection, Options(connection));

    static CRUDRepositoryOptions<Backend.Types.View.IdentityProviderSigninAttempt> Options(IConnection connection) =>
        new CRUDRepositoryBuilder<Backend.Types.View.IdentityProviderSigninAttempt>()
            .Add(new()
            {
                Entity = "IdentityProviderSigninAttempt",
                EntityMapper = new DictionaryMapper<string>(new Dictionary<string, string> { ["IdentityProviderSigninAttempt"] = "identity_provider_signin_attempts" }),
                PropertyMappings = new DictionaryMapper<string>(new Dictionary<string, string>
                {
                    ["Id"] = "id",
                    ["Uuid"] = "uuid",
                    ["Created"] = "created",
                    ["Updated"] = "updated",
                    ["Version"] = "version",
                    ["IdentityProviderId"] = "identity_provider_id",
                    ["SessionId"] = "session_id",
                    ["AuthenticationMethodId"] = "authentication_method_id",
                    ["IsSuccess"] = "is_success",
                }),
                Ids = ["Id"],
                ReadProperties = ["Id", "Uuid", "Created", "Updated", "Version", "IdentityProviderId", "SessionId", "AuthenticationMethodId", "IsSuccess"],
                CreateProperties = ["IdentityProviderId", "SessionId", "AuthenticationMethodId", "IsSuccess"],
                UpdateProperties = ["Uuid", "IdentityProviderId", "SessionId", "AuthenticationMethodId", "IsSuccess"],
                Schema = new(new Dictionary<string, SchemaColumn>
                {
                    ["Id"] = new("biginteger", false, false, true),
                    ["Uuid"] = new("uuid", false, true),
                    ["Created"] = new("datetime", false, true),
                    ["Updated"] = new("datetime", false, true),
                    ["Version"] = new("binary", false, true),
                    ["IdentityProviderId"] = new("biginteger", false, false),
                    ["SessionId"] = new("biginteger", false, false),
                    ["AuthenticationMethodId"] = new("biginteger", false, false),
                    ["IsSuccess"] = new("boolean", false, false),
                }),
            })
            .Add("sqlite", new()
            {
                Entity = "IdentityProviderSigninAttempt",
                EntityMapper = new DictionaryMapper<string>(new Dictionary<string, string> { ["IdentityProviderSigninAttempt"] = "identity_provider_signin_attempts" }),
                PropertyMappings = new DictionaryMapper<string>(new Dictionary<string, string>
                {
                    ["Id"] = "id",
                    ["Uuid"] = "uuid",
                    ["Created"] = "created",
                    ["Updated"] = "updated",
                    ["Version"] = "version",
                    ["IdentityProviderId"] = "identity_provider_id",
                    ["SessionId"] = "session_id",
                    ["AuthenticationMethodId"] = "authentication_method_id",
                    ["IsSuccess"] = "is_success",
                }),
                Ids = ["Id"],
                ReadProperties = ["Id", "Uuid", "Created", "Updated", "Version", "IdentityProviderId", "SessionId", "AuthenticationMethodId", "IsSuccess"],
                CreateProperties = ["Uuid", "Created", "Version", "IdentityProviderId", "SessionId", "AuthenticationMethodId", "IsSuccess"],
                UpdateProperties = ["Uuid", "Created", "Version", "IdentityProviderId", "SessionId", "AuthenticationMethodId", "IsSuccess"],
                Schema = new(new Dictionary<string, SchemaColumn>
                {
                    ["Id"] = new("biginteger", false, false, true),
                    ["Uuid"] = new("uuid", false, true),
                    ["Created"] = new("datetime", false, true),
                    ["Updated"] = new("datetime", false, true),
                    ["Version"] = new("binary", false, true),
                    ["IdentityProviderId"] = new("biginteger", false, false),
                    ["SessionId"] = new("biginteger", false, false),
                    ["AuthenticationMethodId"] = new("biginteger", false, false),
                    ["IsSuccess"] = new("boolean", false, false),
                }),
            })
            .For(connection);
}
