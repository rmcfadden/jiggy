using Datasources;

public sealed class SessionStatesBasesRepository : CRUDRepository<Backend.Types.Datasource.SessionStatesBase>
{
    public SessionStatesBasesRepository(IConnection connection) : base(connection, Options(connection)) { }

    public static IReadonlyRepository<Backend.Types.Datasource.SessionStatesBase> CreateReadonly(IConnection connection) =>
        new ReadonlyRepository<Backend.Types.Datasource.SessionStatesBase>(connection, Options(connection));

    static CRUDRepositoryOptions<Backend.Types.Datasource.SessionStatesBase> Options(IConnection connection) =>
        new CRUDRepositoryBuilder<Backend.Types.Datasource.SessionStatesBase>()
            .Add(new()
            {
                Entity = "SessionStatesBase",
                EntityMapper = new DictionaryMapper<string>(new Dictionary<string, string> { ["SessionStatesBase"] = "session_states" }),
                PropertyMappings = new DictionaryMapper<string>(new Dictionary<string, string>
                {
                    ["Id"] = "id",
                    ["Uuid"] = "uuid",
                    ["Created"] = "created",
                    ["Updated"] = "updated",
                    ["Version"] = "version",
                    ["SessionId"] = "session_id",
                    ["State"] = "state",
                    ["CodeChallenge"] = "code_challenge",
                    ["CodeChallengeMethod"] = "code_challenge_method",
                    ["Revoked"] = "revoked",
                    ["IsEnabled"] = "is_enabled",
                }),
                Ids = ["Id"],
                ReadProperties = ["Id", "Uuid", "Created", "Updated", "Version", "SessionId", "State", "CodeChallenge", "CodeChallengeMethod", "Revoked", "IsEnabled"],
                CreateProperties = ["SessionId", "State", "CodeChallenge", "CodeChallengeMethod", "Revoked", "IsEnabled"],
                UpdateProperties = ["Uuid", "SessionId", "State", "CodeChallenge", "CodeChallengeMethod", "Revoked", "IsEnabled"],
                Schema = new(new Dictionary<string, SchemaColumn>
                {
                    ["Id"] = new("biginteger", false, false, true),
                    ["Uuid"] = new("uuid", false, true),
                    ["Created"] = new("datetime", false, true),
                    ["Updated"] = new("datetime", false, true),
                    ["Version"] = new("binary", false, true),
                    ["SessionId"] = new("biginteger", false, false),
                    ["State"] = new("string", false, false),
                    ["CodeChallenge"] = new("string", true, false),
                    ["CodeChallengeMethod"] = new("string", true, false),
                    ["Revoked"] = new("datetime", true, false),
                    ["IsEnabled"] = new("boolean", false, true),
                }),
            })
            .Add("sqlite", new()
            {
                Entity = "SessionStatesBase",
                EntityMapper = new DictionaryMapper<string>(new Dictionary<string, string> { ["SessionStatesBase"] = "session_states" }),
                PropertyMappings = new DictionaryMapper<string>(new Dictionary<string, string>
                {
                    ["Id"] = "id",
                    ["Uuid"] = "uuid",
                    ["Created"] = "created",
                    ["Updated"] = "updated",
                    ["Version"] = "version",
                    ["SessionId"] = "session_id",
                    ["State"] = "state",
                    ["CodeChallenge"] = "code_challenge",
                    ["CodeChallengeMethod"] = "code_challenge_method",
                    ["Revoked"] = "revoked",
                    ["IsEnabled"] = "is_enabled",
                }),
                Ids = ["Id"],
                ReadProperties = ["Id", "Uuid", "Created", "Updated", "Version", "SessionId", "State", "CodeChallenge", "CodeChallengeMethod", "Revoked", "IsEnabled"],
                CreateProperties = ["Uuid", "Created", "Version", "SessionId", "State", "CodeChallenge", "CodeChallengeMethod", "Revoked", "IsEnabled"],
                UpdateProperties = ["Uuid", "Created", "Version", "SessionId", "State", "CodeChallenge", "CodeChallengeMethod", "Revoked", "IsEnabled"],
                Schema = new(new Dictionary<string, SchemaColumn>
                {
                    ["Id"] = new("biginteger", false, false, true),
                    ["Uuid"] = new("uuid", false, true),
                    ["Created"] = new("datetime", false, true),
                    ["Updated"] = new("datetime", false, true),
                    ["Version"] = new("binary", false, true),
                    ["SessionId"] = new("biginteger", false, false),
                    ["State"] = new("string", false, false),
                    ["CodeChallenge"] = new("string", true, false),
                    ["CodeChallengeMethod"] = new("string", true, false),
                    ["Revoked"] = new("datetime", true, false),
                    ["IsEnabled"] = new("boolean", false, true),
                }),
            })
            .For(connection);
}
