using Datasources;

public sealed class SessionsRepository : CRUDRepository<Backend.Types.View.Session>
{
    public SessionTypesRepository SessionType { get; }

    public SessionsRepository(IConnection connection) : base(connection, Options(connection))
    {
        SessionType = new SessionTypesRepository(connection);
        AddEnriched(new("SessionTypeName", "SessionTypeId", "Id", "Name"), SessionType);
    }

    public static IReadonlyRepository<Backend.Types.View.Session> CreateReadonly(IConnection connection)
    {
        var repo = new ReadonlyRepository<Backend.Types.View.Session>(connection, Options(connection));
        var SessionType = new SessionTypesRepository(connection);
        repo.AddEnriched(new("SessionTypeName", "SessionTypeId", "Id", "Name"), SessionType);
        return repo;
    }

    static CRUDRepositoryOptions<Backend.Types.View.Session> Options(IConnection connection) =>
        new CRUDRepositoryBuilder<Backend.Types.View.Session>()
            .Add(new()
            {
                Entity = "Session",
                EntityMapper = new DictionaryMapper<string>(new Dictionary<string, string> { ["Session"] = "sessions_bases" }),
                PropertyMappings = new DictionaryMapper<string>(new Dictionary<string, string>
                {
                    ["Id"] = "id",
                    ["Uuid"] = "uuid",
                    ["Created"] = "created",
                    ["Updated"] = "updated",
                    ["Version"] = "version",
                    ["SessionTypeId"] = "session_type_id",
                    ["UserId"] = "user_id",
                    ["RelativeExpiration"] = "relative_expiration",
                    ["AbsoluteExpiration"] = "absolute_expiration",
                    ["Revoked"] = "revoked",
                    ["Expired"] = "expired",
                    ["IsEnabled"] = "is_enabled",
                }),
                Ids = ["Id"],
                ReadProperties = ["Id", "Uuid", "Created", "Updated", "Version", "SessionTypeId", "UserId", "RelativeExpiration", "AbsoluteExpiration", "Revoked", "Expired", "IsEnabled"],
                CreateProperties = ["SessionTypeId", "UserId", "RelativeExpiration", "AbsoluteExpiration", "Revoked", "Expired", "IsEnabled"],
                UpdateProperties = ["Uuid", "SessionTypeId", "UserId", "RelativeExpiration", "AbsoluteExpiration", "Revoked", "Expired", "IsEnabled"],
                Schema = new(new Dictionary<string, SchemaColumn>
                {
                    ["Id"] = new("biginteger", false, false, true),
                    ["Uuid"] = new("uuid", false, true),
                    ["Created"] = new("datetime", false, true),
                    ["Updated"] = new("datetime", false, true),
                    ["Version"] = new("binary", false, true),
                    ["SessionTypeId"] = new("biginteger", false, false),
                    ["UserId"] = new("biginteger", true, false),
                    ["RelativeExpiration"] = new("integer", true, false),
                    ["AbsoluteExpiration"] = new("datetime", true, false),
                    ["Revoked"] = new("datetime", true, false),
                    ["Expired"] = new("datetime", true, false),
                    ["IsEnabled"] = new("boolean", false, true),
                    ["SessionTypeName"] = new("string", false, false),
                }),
            })
            .Add("sqlite", new()
            {
                Entity = "Session",
                EntityMapper = new DictionaryMapper<string>(new Dictionary<string, string> { ["Session"] = "sessions_bases" }),
                PropertyMappings = new DictionaryMapper<string>(new Dictionary<string, string>
                {
                    ["Id"] = "id",
                    ["Uuid"] = "uuid",
                    ["Created"] = "created",
                    ["Updated"] = "updated",
                    ["Version"] = "version",
                    ["SessionTypeId"] = "session_type_id",
                    ["UserId"] = "user_id",
                    ["RelativeExpiration"] = "relative_expiration",
                    ["AbsoluteExpiration"] = "absolute_expiration",
                    ["Revoked"] = "revoked",
                    ["Expired"] = "expired",
                    ["IsEnabled"] = "is_enabled",
                }),
                Ids = ["Id"],
                ReadProperties = ["Id", "Uuid", "Created", "Updated", "Version", "SessionTypeId", "UserId", "RelativeExpiration", "AbsoluteExpiration", "Revoked", "Expired", "IsEnabled"],
                CreateProperties = ["Uuid", "Created", "Version", "SessionTypeId", "UserId", "RelativeExpiration", "AbsoluteExpiration", "Revoked", "Expired", "IsEnabled"],
                UpdateProperties = ["Uuid", "Created", "Version", "SessionTypeId", "UserId", "RelativeExpiration", "AbsoluteExpiration", "Revoked", "Expired", "IsEnabled"],
                Schema = new(new Dictionary<string, SchemaColumn>
                {
                    ["Id"] = new("biginteger", false, false, true),
                    ["Uuid"] = new("uuid", false, true),
                    ["Created"] = new("datetime", false, true),
                    ["Updated"] = new("datetime", false, true),
                    ["Version"] = new("binary", false, true),
                    ["SessionTypeId"] = new("biginteger", false, false),
                    ["UserId"] = new("biginteger", true, false),
                    ["RelativeExpiration"] = new("integer", true, false),
                    ["AbsoluteExpiration"] = new("datetime", true, false),
                    ["Revoked"] = new("datetime", true, false),
                    ["Expired"] = new("datetime", true, false),
                    ["IsEnabled"] = new("boolean", false, true),
                    ["SessionTypeName"] = new("string", false, false),
                }),
            })
            .For(connection);
}
