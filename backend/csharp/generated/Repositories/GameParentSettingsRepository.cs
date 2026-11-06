using Datasources;

public sealed class GameParentSettingsRepository : CRUDRepository<Backend.Types.Datasource.GameParentSetting>
{
    public GameParentSettingsRepository(IConnection connection) : base(connection, Options(connection)) { }

    public static IReadonlyRepository<Backend.Types.Datasource.GameParentSetting> CreateReadonly(IConnection connection) =>
        new ReadonlyRepository<Backend.Types.Datasource.GameParentSetting>(connection, Options(connection));

    static CRUDRepositoryOptions<Backend.Types.Datasource.GameParentSetting> Options(IConnection connection) =>
        new CRUDRepositoryBuilder<Backend.Types.Datasource.GameParentSetting>()
            .Add(new()
            {
                Entity = "GameParentSetting",
                EntityMapper = new DictionaryMapper<string>(new Dictionary<string, string> { ["GameParentSetting"] = "game_parent_settings" }),
                PropertyMappings = new DictionaryMapper<string>(new Dictionary<string, string>
                {
                    ["Id"] = "id",
                    ["Uuid"] = "uuid",
                    ["Created"] = "created",
                    ["Updated"] = "updated",
                    ["Version"] = "version",
                    ["GameParentId"] = "game_parent_id",
                    ["Name"] = "name",
                    ["Value"] = "value",
                }),
                Ids = ["Id"],
                ReadProperties = ["Id", "Uuid", "Created", "Updated", "Version", "GameParentId", "Name", "Value"],
                CreateProperties = ["GameParentId", "Name", "Value"],
                UpdateProperties = ["Uuid", "GameParentId", "Name", "Value"],
                Schema = new(new Dictionary<string, SchemaColumn>
                {
                    ["Id"] = new("biginteger", false, false, true),
                    ["Uuid"] = new("uuid", false, true),
                    ["Created"] = new("datetime", false, true),
                    ["Updated"] = new("datetime", false, true),
                    ["Version"] = new("binary", false, true),
                    ["GameParentId"] = new("biginteger", false, false),
                    ["Name"] = new("string", false, false),
                    ["Value"] = new("string", false, false),
                }),
            })
            .Add("sqlite", new()
            {
                Entity = "GameParentSetting",
                EntityMapper = new DictionaryMapper<string>(new Dictionary<string, string> { ["GameParentSetting"] = "game_parent_settings" }),
                PropertyMappings = new DictionaryMapper<string>(new Dictionary<string, string>
                {
                    ["Id"] = "id",
                    ["Uuid"] = "uuid",
                    ["Created"] = "created",
                    ["Updated"] = "updated",
                    ["Version"] = "version",
                    ["GameParentId"] = "game_parent_id",
                    ["Name"] = "name",
                    ["Value"] = "value",
                }),
                Ids = ["Id"],
                ReadProperties = ["Id", "Uuid", "Created", "Updated", "Version", "GameParentId", "Name", "Value"],
                CreateProperties = ["Uuid", "Created", "Version", "GameParentId", "Name", "Value"],
                UpdateProperties = ["Uuid", "Created", "Version", "GameParentId", "Name", "Value"],
                Schema = new(new Dictionary<string, SchemaColumn>
                {
                    ["Id"] = new("biginteger", false, false, true),
                    ["Uuid"] = new("uuid", false, true),
                    ["Created"] = new("datetime", false, true),
                    ["Updated"] = new("datetime", false, true),
                    ["Version"] = new("binary", false, true),
                    ["GameParentId"] = new("biginteger", false, false),
                    ["Name"] = new("string", false, false),
                    ["Value"] = new("string", false, false),
                }),
            })
            .For(connection);
}
