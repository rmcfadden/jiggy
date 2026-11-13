using Datasources;

public sealed class LogsRepository : CRUDRepository<Backend.Types.View.Log>
{
    public LogAttributesRepository LogAttribute { get; }
    public LogTypesRepository LogType { get; }

    public LogsRepository(IConnection connection) : base(connection, Options(connection))
    {
        LogAttribute = new LogAttributesRepository(connection);
        LogType = new LogTypesRepository(connection);
        AddEnriched(new("Attributes", "Id", "LogId", "Value", Type: EnrichmentPropertyType.Dictionary, DictionaryKey: "Name"), LogAttribute);
        AddEnriched(new("LogTypeName", "LogTypeId", "Id", "Name"), LogType);
    }

    public static IReadonlyRepository<Backend.Types.View.Log> CreateReadonly(IConnection connection)
    {
        var repo = new ReadonlyRepository<Backend.Types.View.Log>(connection, Options(connection));
        var LogAttribute = new LogAttributesRepository(connection);
        var LogType = new LogTypesRepository(connection);
        repo.AddEnriched(new("Attributes", "Id", "LogId", "Value", Type: EnrichmentPropertyType.Dictionary, DictionaryKey: "Name"), LogAttribute);
        repo.AddEnriched(new("LogTypeName", "LogTypeId", "Id", "Name"), LogType);
        return repo;
    }

    static CRUDRepositoryOptions<Backend.Types.View.Log> Options(IConnection connection) =>
        new CRUDRepositoryBuilder<Backend.Types.View.Log>()
            .Add(new()
            {
                Entity = "Log",
                EntityMapper = new DictionaryMapper<string>(new Dictionary<string, string> { ["Log"] = "logs" }),
                PropertyMappings = new DictionaryMapper<string>(new Dictionary<string, string>
                {
                    ["Id"] = "id",
                    ["Uuid"] = "uuid",
                    ["Created"] = "created",
                    ["Updated"] = "updated",
                    ["Version"] = "version",
                    ["Message"] = "message",
                    ["LogTypeId"] = "log_type_id",
                }),
                Ids = ["Id"],
                ReadProperties = ["Id", "Uuid", "Created", "Updated", "Version", "Message", "LogTypeId"],
                CreateProperties = ["Message"],
                UpdateProperties = ["Uuid", "Message"],
                Schema = new(new Dictionary<string, SchemaColumn>
                {
                    ["Id"] = new("biginteger", false, false, true),
                    ["Uuid"] = new("uuid", false, true),
                    ["Created"] = new("datetime", false, true),
                    ["Updated"] = new("datetime", false, true),
                    ["Version"] = new("binary", false, true),
                    ["Message"] = new("string", false, false),
                    ["LogTypeName"] = new("string", false, false),
                }),
            })
            .Add("sqlite", new()
            {
                Entity = "Log",
                EntityMapper = new DictionaryMapper<string>(new Dictionary<string, string> { ["Log"] = "logs" }),
                PropertyMappings = new DictionaryMapper<string>(new Dictionary<string, string>
                {
                    ["Id"] = "id",
                    ["Uuid"] = "uuid",
                    ["Created"] = "created",
                    ["Updated"] = "updated",
                    ["Version"] = "version",
                    ["Message"] = "message",
                    ["LogTypeId"] = "log_type_id",
                }),
                Ids = ["Id"],
                ReadProperties = ["Id", "Uuid", "Created", "Updated", "Version", "Message", "LogTypeId"],
                CreateProperties = ["Uuid", "Created", "Version", "Message"],
                UpdateProperties = ["Uuid", "Created", "Version", "Message"],
                Schema = new(new Dictionary<string, SchemaColumn>
                {
                    ["Id"] = new("biginteger", false, false, true),
                    ["Uuid"] = new("uuid", false, true),
                    ["Created"] = new("datetime", false, true),
                    ["Updated"] = new("datetime", false, true),
                    ["Version"] = new("binary", false, true),
                    ["Message"] = new("string", false, false),
                    ["LogTypeName"] = new("string", false, false),
                }),
            })
            .For(connection);
}
