using Datasources;

public sealed class LogAttributesRepository : CRUDRepository<Backend.Types.Datasource.LogAttribute>
{
    public LogAttributesRepository(IConnection connection) : base(connection, Options(connection)) { }

    public static IReadonlyRepository<Backend.Types.Datasource.LogAttribute> CreateReadonly(IConnection connection) =>
        new ReadonlyRepository<Backend.Types.Datasource.LogAttribute>(connection, Options(connection));

    static CRUDRepositoryOptions<Backend.Types.Datasource.LogAttribute> Options(IConnection connection) =>
        new CRUDRepositoryBuilder<Backend.Types.Datasource.LogAttribute>()
            .Add(new()
            {
                Entity = "LogAttribute",
                EntityMapper = new DictionaryMapper<string>(new Dictionary<string, string> { ["LogAttribute"] = "log_attributes" }),
                PropertyMappings = new DictionaryMapper<string>(new Dictionary<string, string>
                {
                    ["Id"] = "id",
                    ["Uuid"] = "uuid",
                    ["Created"] = "created",
                    ["Updated"] = "updated",
                    ["Version"] = "version",
                    ["LogId"] = "log_id",
                    ["Name"] = "name",
                    ["Value"] = "value",
                }),
                Ids = ["Id"],
                ReadProperties = ["Id", "Uuid", "Created", "Updated", "Version", "LogId", "Name", "Value"],
                CreateProperties = ["LogId", "Name", "Value"],
                UpdateProperties = ["Uuid", "LogId", "Name", "Value"],
                Schema = new(new Dictionary<string, SchemaColumn>
                {
                    ["Id"] = new("biginteger", false, false, true),
                    ["Uuid"] = new("uuid", false, true),
                    ["Created"] = new("datetime", false, true),
                    ["Updated"] = new("datetime", false, true),
                    ["Version"] = new("binary", false, true),
                    ["LogId"] = new("biginteger", false, false),
                    ["Name"] = new("string", false, false),
                    ["Value"] = new("string", false, false),
                }),
            })
            .Add("sqlite", new()
            {
                Entity = "LogAttribute",
                EntityMapper = new DictionaryMapper<string>(new Dictionary<string, string> { ["LogAttribute"] = "log_attributes" }),
                PropertyMappings = new DictionaryMapper<string>(new Dictionary<string, string>
                {
                    ["Id"] = "id",
                    ["Uuid"] = "uuid",
                    ["Created"] = "created",
                    ["Updated"] = "updated",
                    ["Version"] = "version",
                    ["LogId"] = "log_id",
                    ["Name"] = "name",
                    ["Value"] = "value",
                }),
                Ids = ["Id"],
                ReadProperties = ["Id", "Uuid", "Created", "Updated", "Version", "LogId", "Name", "Value"],
                CreateProperties = ["Uuid", "Created", "Version", "LogId", "Name", "Value"],
                UpdateProperties = ["Uuid", "Created", "Version", "LogId", "Name", "Value"],
                Schema = new(new Dictionary<string, SchemaColumn>
                {
                    ["Id"] = new("biginteger", false, false, true),
                    ["Uuid"] = new("uuid", false, true),
                    ["Created"] = new("datetime", false, true),
                    ["Updated"] = new("datetime", false, true),
                    ["Version"] = new("binary", false, true),
                    ["LogId"] = new("biginteger", false, false),
                    ["Name"] = new("string", false, false),
                    ["Value"] = new("string", false, false),
                }),
            })
            .For(connection);
}
