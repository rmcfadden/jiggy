using Datasources;

public sealed class SessionTypesRepository : ReadonlyRepository<Backend.Types.Datasource.SessionType>
{
    public SessionTypesRepository(IConnection connection) : base(connection, Options(connection)) { }

    public static IReadonlyRepository<Backend.Types.Datasource.SessionType> CreateReadonly(IConnection connection) =>
        new SessionTypesRepository(connection);

    static ReadonlyRepositoryMappingOptions<Backend.Types.Datasource.SessionType> Options(IConnection connection) =>
        new CRUDRepositoryBuilder<Backend.Types.Datasource.SessionType>()
            .Add(new()
            {
                Entity = "SessionType",
                EntityMapper = new DictionaryMapper<string>(new Dictionary<string, string> { ["SessionType"] = "session_types" }),
                PropertyMappings = new DictionaryMapper<string>(new Dictionary<string, string>
                {
                    ["Id"] = "id",
                    ["Uuid"] = "uuid",
                    ["Created"] = "created",
                    ["Updated"] = "updated",
                    ["Version"] = "version",
                    ["Name"] = "name",
                }),
                ReadProperties = ["Id", "Uuid", "Created", "Updated", "Version", "Name"],
                Schema = new(new Dictionary<string, SchemaColumn>
                {
                    ["Id"] = new("biginteger", false, false, true),
                    ["Uuid"] = new("uuid", false, true),
                    ["Created"] = new("datetime", false, true),
                    ["Updated"] = new("datetime", false, true),
                    ["Version"] = new("binary", false, true),
                    ["Name"] = new("string", false, false),
                }),
            })
            .Add("sqlite", new()
            {
                Entity = "SessionType",
                EntityMapper = new DictionaryMapper<string>(new Dictionary<string, string> { ["SessionType"] = "session_types" }),
                PropertyMappings = new DictionaryMapper<string>(new Dictionary<string, string>
                {
                    ["Id"] = "id",
                    ["Uuid"] = "uuid",
                    ["Created"] = "created",
                    ["Updated"] = "updated",
                    ["Version"] = "version",
                    ["Name"] = "name",
                }),
                ReadProperties = ["Id", "Uuid", "Created", "Updated", "Version", "Name"],
                Schema = new(new Dictionary<string, SchemaColumn>
                {
                    ["Id"] = new("biginteger", false, false, true),
                    ["Uuid"] = new("uuid", false, true),
                    ["Created"] = new("datetime", false, true),
                    ["Updated"] = new("datetime", false, true),
                    ["Version"] = new("binary", false, true),
                    ["Name"] = new("string", false, false),
                }),
            })
            .For(connection);
}
