using Datasources;

public sealed class SessionHitsRepository : CRUDRepository<Backend.Types.View.SessionHit>
{
    public SessionHitsRepository(IConnection connection) : base(connection, Options(connection)) { }

    public static IReadonlyRepository<Backend.Types.View.SessionHit> CreateReadonly(IConnection connection) =>
        new ReadonlyRepository<Backend.Types.View.SessionHit>(connection, Options(connection));

    static CRUDRepositoryOptions<Backend.Types.View.SessionHit> Options(IConnection connection) =>
        new CRUDRepositoryBuilder<Backend.Types.View.SessionHit>()
            .Add(new()
            {
                Entity = "SessionHit",
                EntityMapper = new DictionaryMapper<string>(new Dictionary<string, string> { ["SessionHit"] = "session_hits_bases" }),
                PropertyMappings = new DictionaryMapper<string>(new Dictionary<string, string>
                {
                    ["Id"] = "id",
                    ["Uuid"] = "uuid",
                    ["Created"] = "created",
                    ["Updated"] = "updated",
                    ["Version"] = "version",
                    ["SessionId"] = "session_id",
                    ["IpAddress"] = "ip_address",
                }),
                Ids = ["Id"],
                ReadProperties = ["Id", "Uuid", "Created", "Updated", "Version", "SessionId", "IpAddress"],
                CreateProperties = ["SessionId", "IpAddress"],
                UpdateProperties = ["Uuid", "SessionId", "IpAddress"],
                Schema = new(new Dictionary<string, SchemaColumn>
                {
                    ["Id"] = new("biginteger", false, false, true),
                    ["Uuid"] = new("uuid", false, true),
                    ["Created"] = new("datetime", false, true),
                    ["Updated"] = new("datetime", false, true),
                    ["Version"] = new("binary", false, true),
                    ["SessionId"] = new("biginteger", false, false),
                    ["IpAddress"] = new("binary", false, false),
                }),
            })
            .Add("sqlite", new()
            {
                Entity = "SessionHit",
                EntityMapper = new DictionaryMapper<string>(new Dictionary<string, string> { ["SessionHit"] = "session_hits_bases" }),
                PropertyMappings = new DictionaryMapper<string>(new Dictionary<string, string>
                {
                    ["Id"] = "id",
                    ["Uuid"] = "uuid",
                    ["Created"] = "created",
                    ["Updated"] = "updated",
                    ["Version"] = "version",
                    ["SessionId"] = "session_id",
                    ["IpAddress"] = "ip_address",
                }),
                Ids = ["Id"],
                ReadProperties = ["Id", "Uuid", "Created", "Updated", "Version", "SessionId", "IpAddress"],
                CreateProperties = ["Uuid", "Created", "Version", "SessionId", "IpAddress"],
                UpdateProperties = ["Uuid", "Created", "Version", "SessionId", "IpAddress"],
                Schema = new(new Dictionary<string, SchemaColumn>
                {
                    ["Id"] = new("biginteger", false, false, true),
                    ["Uuid"] = new("uuid", false, true),
                    ["Created"] = new("datetime", false, true),
                    ["Updated"] = new("datetime", false, true),
                    ["Version"] = new("binary", false, true),
                    ["SessionId"] = new("biginteger", false, false),
                    ["IpAddress"] = new("binary", false, false),
                }),
            })
            .For(connection);
}
