using Datasources;

public sealed class AuthorizationCodesRepository : CRUDRepository<Backend.Types.View.AuthorizationCode>
{
    public AuthorizationCodesRepository(IConnection connection) : base(connection, Options(connection)) { }

    public static IReadonlyRepository<Backend.Types.View.AuthorizationCode> CreateReadonly(IConnection connection) =>
        new ReadonlyRepository<Backend.Types.View.AuthorizationCode>(connection, Options(connection));

    static CRUDRepositoryOptions<Backend.Types.View.AuthorizationCode> Options(IConnection connection) =>
        new CRUDRepositoryBuilder<Backend.Types.View.AuthorizationCode>()
            .Add(new()
            {
                Entity = "AuthorizationCode",
                EntityMapper = new DictionaryMapper<string>(new Dictionary<string, string> { ["AuthorizationCode"] = "authorization_codes_bases" }),
                PropertyMappings = new DictionaryMapper<string>(new Dictionary<string, string>
                {
                    ["Id"] = "id",
                    ["Uuid"] = "uuid",
                    ["Created"] = "created",
                    ["Updated"] = "updated",
                    ["Version"] = "version",
                    ["SessionId"] = "session_id",
                    ["Code"] = "code",
                    ["IsUsed"] = "is_used",
                    ["IsDeleted"] = "is_deleted",
                }),
                Ids = ["Id"],
                ReadProperties = ["Id", "Uuid", "Created", "Updated", "Version", "SessionId", "Code", "IsUsed", "IsDeleted"],
                CreateProperties = ["SessionId", "Code", "IsUsed", "IsDeleted"],
                UpdateProperties = ["Uuid", "SessionId", "Code", "IsUsed", "IsDeleted"],
                Schema = new(new Dictionary<string, SchemaColumn>
                {
                    ["Id"] = new("biginteger", false, false, true),
                    ["Uuid"] = new("uuid", false, true),
                    ["Created"] = new("datetime", false, true),
                    ["Updated"] = new("datetime", false, true),
                    ["Version"] = new("binary", false, true),
                    ["SessionId"] = new("biginteger", true, false),
                    ["Code"] = new("string", false, false),
                    ["IsUsed"] = new("boolean", false, true),
                    ["IsDeleted"] = new("boolean", false, true),
                }),
            })
            .Add("sqlite", new()
            {
                Entity = "AuthorizationCode",
                EntityMapper = new DictionaryMapper<string>(new Dictionary<string, string> { ["AuthorizationCode"] = "authorization_codes_bases" }),
                PropertyMappings = new DictionaryMapper<string>(new Dictionary<string, string>
                {
                    ["Id"] = "id",
                    ["Uuid"] = "uuid",
                    ["Created"] = "created",
                    ["Updated"] = "updated",
                    ["Version"] = "version",
                    ["SessionId"] = "session_id",
                    ["Code"] = "code",
                    ["IsUsed"] = "is_used",
                    ["IsDeleted"] = "is_deleted",
                }),
                Ids = ["Id"],
                ReadProperties = ["Id", "Uuid", "Created", "Updated", "Version", "SessionId", "Code", "IsUsed", "IsDeleted"],
                CreateProperties = ["Uuid", "Created", "Version", "SessionId", "Code", "IsUsed", "IsDeleted"],
                UpdateProperties = ["Uuid", "Created", "Version", "SessionId", "Code", "IsUsed", "IsDeleted"],
                Schema = new(new Dictionary<string, SchemaColumn>
                {
                    ["Id"] = new("biginteger", false, false, true),
                    ["Uuid"] = new("uuid", false, true),
                    ["Created"] = new("datetime", false, true),
                    ["Updated"] = new("datetime", false, true),
                    ["Version"] = new("binary", false, true),
                    ["SessionId"] = new("biginteger", true, false),
                    ["Code"] = new("string", false, false),
                    ["IsUsed"] = new("boolean", false, true),
                    ["IsDeleted"] = new("boolean", false, true),
                }),
            })
            .For(connection);
}
