using Datasources;

public sealed class SettingsRepository : CRUDRepository<Backend.Types.Datasource.Setting>
{
    public SettingsRepository(IConnection connection) : base(connection, Options(connection)) { }

    public static IReadonlyRepository<Backend.Types.Datasource.Setting> CreateReadonly(IConnection connection) =>
        new ReadonlyRepository<Backend.Types.Datasource.Setting>(connection, Options(connection));

    static CRUDRepositoryOptions<Backend.Types.Datasource.Setting> Options(IConnection connection) =>
        new CRUDRepositoryBuilder<Backend.Types.Datasource.Setting>()
            .Add(new()
            {
                Entity = "Setting",
                EntityMapper = new DictionaryMapper<string>(new Dictionary<string, string> { ["Setting"] = "settings" }),
                PropertyMappings = new DictionaryMapper<string>(new Dictionary<string, string>
                {
                    ["Id"] = "id",
                    ["Uuid"] = "uuid",
                    ["Created"] = "created",
                    ["Updated"] = "updated",
                    ["Version"] = "version",
                    ["AppId"] = "app_id",
                    ["Name"] = "name",
                    ["Value"] = "value",
                }),
                Ids = ["Id"],
                ReadProperties = ["Id", "Uuid", "Created", "Updated", "Version", "AppId", "Name", "Value"],
                CreateProperties = ["AppId", "Name", "Value"],
                UpdateProperties = ["Uuid", "AppId", "Name", "Value"],
                Schema = new(new Dictionary<string, SchemaColumn>
                {
                    ["Id"] = new("biginteger", false, false, true),
                    ["Uuid"] = new("uuid", false, true),
                    ["Created"] = new("datetime", false, true),
                    ["Updated"] = new("datetime", false, true),
                    ["Version"] = new("binary", false, true),
                    ["AppId"] = new("biginteger", false, false),
                    ["Name"] = new("string", false, false),
                    ["Value"] = new("string", false, false),
                }),
            })
            .Add("sqlite", new()
            {
                Entity = "Setting",
                EntityMapper = new DictionaryMapper<string>(new Dictionary<string, string> { ["Setting"] = "settings" }),
                PropertyMappings = new DictionaryMapper<string>(new Dictionary<string, string>
                {
                    ["Id"] = "id",
                    ["Uuid"] = "uuid",
                    ["Created"] = "created",
                    ["Updated"] = "updated",
                    ["Version"] = "version",
                    ["AppId"] = "app_id",
                    ["Name"] = "name",
                    ["Value"] = "value",
                }),
                Ids = ["Id"],
                ReadProperties = ["Id", "Uuid", "Created", "Updated", "Version", "AppId", "Name", "Value"],
                CreateProperties = ["Uuid", "Created", "Version", "AppId", "Name", "Value"],
                UpdateProperties = ["Uuid", "Created", "Version", "AppId", "Name", "Value"],
                Schema = new(new Dictionary<string, SchemaColumn>
                {
                    ["Id"] = new("biginteger", false, false, true),
                    ["Uuid"] = new("uuid", false, true),
                    ["Created"] = new("datetime", false, true),
                    ["Updated"] = new("datetime", false, true),
                    ["Version"] = new("binary", false, true),
                    ["AppId"] = new("biginteger", false, false),
                    ["Name"] = new("string", false, false),
                    ["Value"] = new("string", false, false),
                }),
            })
            .For(connection);
}
