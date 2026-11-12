using Datasources;

public sealed class IdentityProviderAuthorizeSessionsRepository : CRUDRepository<Backend.Types.View.IdentityProviderAuthorizeSession>
{
    public IdentityProviderAuthorizeSessionsRepository(IConnection connection) : base(connection, Options(connection)) { }

    public static IReadonlyRepository<Backend.Types.View.IdentityProviderAuthorizeSession> CreateReadonly(IConnection connection) =>
        new ReadonlyRepository<Backend.Types.View.IdentityProviderAuthorizeSession>(connection, Options(connection));

    static CRUDRepositoryOptions<Backend.Types.View.IdentityProviderAuthorizeSession> Options(IConnection connection) =>
        new CRUDRepositoryBuilder<Backend.Types.View.IdentityProviderAuthorizeSession>()
            .Add(new()
            {
                Entity = "IdentityProviderAuthorizeSession",
                EntityMapper = new DictionaryMapper<string>(new Dictionary<string, string> { ["IdentityProviderAuthorizeSession"] = "identity_provider_authorize_sessions" }),
                PropertyMappings = new DictionaryMapper<string>(new Dictionary<string, string>
                {
                    ["Id"] = "id",
                    ["Uuid"] = "uuid",
                    ["Created"] = "created",
                    ["Updated"] = "updated",
                    ["Version"] = "version",
                    ["IdentityProviderId"] = "identity_provider_id",
                    ["SessionId"] = "session_id",
                    ["RedirectUri"] = "redirect_uri",
                    ["State"] = "state",
                    ["CodeChallenge"] = "code_challenge",
                    ["CodeChallengeMethod"] = "code_challenge_method",
                    ["Revoked"] = "revoked",
                    ["Finished"] = "finished",
                    ["IsDeleted"] = "is_deleted",
                }),
                Ids = ["Id"],
                ReadProperties = ["Id", "Uuid", "Created", "Updated", "Version", "IdentityProviderId", "SessionId", "RedirectUri", "State", "CodeChallenge", "CodeChallengeMethod", "Revoked", "Finished", "IsDeleted"],
                CreateProperties = ["IdentityProviderId", "SessionId", "RedirectUri", "State", "CodeChallenge", "CodeChallengeMethod", "Revoked", "Finished", "IsDeleted"],
                UpdateProperties = ["Uuid", "IdentityProviderId", "SessionId", "RedirectUri", "State", "CodeChallenge", "CodeChallengeMethod", "Revoked", "Finished", "IsDeleted"],
                Schema = new(new Dictionary<string, SchemaColumn>
                {
                    ["Id"] = new("biginteger", false, false, true),
                    ["Uuid"] = new("uuid", false, true),
                    ["Created"] = new("datetime", false, true),
                    ["Updated"] = new("datetime", false, true),
                    ["Version"] = new("binary", false, true),
                    ["IdentityProviderId"] = new("biginteger", false, false),
                    ["SessionId"] = new("biginteger", false, false),
                    ["RedirectUri"] = new("string", false, false),
                    ["State"] = new("string", false, false),
                    ["CodeChallenge"] = new("string", false, false),
                    ["CodeChallengeMethod"] = new("string", false, false),
                    ["Revoked"] = new("datetime", true, false),
                    ["Finished"] = new("datetime", true, false),
                    ["IsDeleted"] = new("boolean", false, true),
                }),
            })
            .Add("sqlite", new()
            {
                Entity = "IdentityProviderAuthorizeSession",
                EntityMapper = new DictionaryMapper<string>(new Dictionary<string, string> { ["IdentityProviderAuthorizeSession"] = "identity_provider_authorize_sessions" }),
                PropertyMappings = new DictionaryMapper<string>(new Dictionary<string, string>
                {
                    ["Id"] = "id",
                    ["Uuid"] = "uuid",
                    ["Created"] = "created",
                    ["Updated"] = "updated",
                    ["Version"] = "version",
                    ["IdentityProviderId"] = "identity_provider_id",
                    ["SessionId"] = "session_id",
                    ["RedirectUri"] = "redirect_uri",
                    ["State"] = "state",
                    ["CodeChallenge"] = "code_challenge",
                    ["CodeChallengeMethod"] = "code_challenge_method",
                    ["Revoked"] = "revoked",
                    ["Finished"] = "finished",
                    ["IsDeleted"] = "is_deleted",
                }),
                Ids = ["Id"],
                ReadProperties = ["Id", "Uuid", "Created", "Updated", "Version", "IdentityProviderId", "SessionId", "RedirectUri", "State", "CodeChallenge", "CodeChallengeMethod", "Revoked", "Finished", "IsDeleted"],
                CreateProperties = ["Uuid", "Created", "Version", "IdentityProviderId", "SessionId", "RedirectUri", "State", "CodeChallenge", "CodeChallengeMethod", "Revoked", "Finished", "IsDeleted"],
                UpdateProperties = ["Uuid", "Created", "Version", "IdentityProviderId", "SessionId", "RedirectUri", "State", "CodeChallenge", "CodeChallengeMethod", "Revoked", "Finished", "IsDeleted"],
                Schema = new(new Dictionary<string, SchemaColumn>
                {
                    ["Id"] = new("biginteger", false, false, true),
                    ["Uuid"] = new("uuid", false, true),
                    ["Created"] = new("datetime", false, true),
                    ["Updated"] = new("datetime", false, true),
                    ["Version"] = new("binary", false, true),
                    ["IdentityProviderId"] = new("biginteger", false, false),
                    ["SessionId"] = new("biginteger", false, false),
                    ["RedirectUri"] = new("string", false, false),
                    ["State"] = new("string", false, false),
                    ["CodeChallenge"] = new("string", false, false),
                    ["CodeChallengeMethod"] = new("string", false, false),
                    ["Revoked"] = new("datetime", true, false),
                    ["Finished"] = new("datetime", true, false),
                    ["IsDeleted"] = new("boolean", false, true),
                }),
            })
            .For(connection);
}
