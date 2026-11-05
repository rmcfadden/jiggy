using Datasources;

public sealed class GameInstanceSettingsRepository : CRUDRepository<Backend.Types.Datasource.GameInstanceSetting>
{
    public GameInstanceSettingsRepository(IConnection connection) : base(connection, Options(connection)) { }

    public static IReadonlyRepository<Backend.Types.Datasource.GameInstanceSetting> CreateReadonly(IConnection connection) =>
        new ReadonlyRepository<Backend.Types.Datasource.GameInstanceSetting>(connection, Options(connection));

    static CRUDRepositoryOptions<Backend.Types.Datasource.GameInstanceSetting> Options(IConnection connection) =>
        new CRUDRepositoryBuilder<Backend.Types.Datasource.GameInstanceSetting>()
            .Add(new()
            {
                Entity = "GameInstanceSetting",
                EntityMapper = new DictionaryMapper<string>(new Dictionary<string, string> { ["GameInstanceSetting"] = "game_instance_settings" }),
                PropertyMappings = new DictionaryMapper<string>(new Dictionary<string, string>
                {
                    ["Id"] = "id",
                    ["Uuid"] = "uuid",
                    ["Created"] = "created",
                    ["Updated"] = "updated",
                    ["Version"] = "version",
                    ["GameInstanceId"] = "game_instance_id",
                    ["Name"] = "name",
                    ["Value"] = "value",
                }),
                Ids = ["Id"],
                ReadProperties = ["Id", "Uuid", "Created", "Updated", "Version", "GameInstanceId", "Name", "Value"],
                CreateProperties = ["GameInstanceId", "Name", "Value"],
                UpdateProperties = ["Uuid", "GameInstanceId", "Name", "Value"],
                Schema = new(new Dictionary<string, SchemaColumn>
                {
                    ["Id"] = new("biginteger", false, false, true),
                    ["Uuid"] = new("uuid", false, true),
                    ["Created"] = new("datetime", false, true),
                    ["Updated"] = new("datetime", false, true),
                    ["Version"] = new("binary", false, true),
                    ["GameInstanceId"] = new("biginteger", false, false),
                    ["Name"] = new("string", false, false),
                    ["Value"] = new("string", false, false),
                }),
            })
            .Add("sqlite", new()
            {
                Entity = "GameInstanceSetting",
                EntityMapper = new DictionaryMapper<string>(new Dictionary<string, string> { ["GameInstanceSetting"] = "game_instance_settings" }),
                PropertyMappings = new DictionaryMapper<string>(new Dictionary<string, string>
                {
                    ["Id"] = "id",
                    ["Uuid"] = "uuid",
                    ["Created"] = "created",
                    ["Updated"] = "updated",
                    ["Version"] = "version",
                    ["GameInstanceId"] = "game_instance_id",
                    ["Name"] = "name",
                    ["Value"] = "value",
                }),
                Ids = ["Id"],
                ReadProperties = ["Id", "Uuid", "Created", "Updated", "Version", "GameInstanceId", "Name", "Value"],
                CreateProperties = ["Uuid", "Created", "Version", "GameInstanceId", "Name", "Value"],
                UpdateProperties = ["Uuid", "Created", "Version", "GameInstanceId", "Name", "Value"],
                Schema = new(new Dictionary<string, SchemaColumn>
                {
                    ["Id"] = new("biginteger", false, false, true),
                    ["Uuid"] = new("uuid", false, true),
                    ["Created"] = new("datetime", false, true),
                    ["Updated"] = new("datetime", false, true),
                    ["Version"] = new("binary", false, true),
                    ["GameInstanceId"] = new("biginteger", false, false),
                    ["Name"] = new("string", false, false),
                    ["Value"] = new("string", false, false),
                }),
            })
            .For(connection);
}
