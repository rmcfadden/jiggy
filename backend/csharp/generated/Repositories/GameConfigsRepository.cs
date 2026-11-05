using Datasources;

public sealed class GameConfigsRepository : CRUDRepository<Backend.Types.Datasource.GameConfig>
{
    public GameConfigsRepository(IConnection connection) : base(connection, Options(connection)) { }

    public static IReadonlyRepository<Backend.Types.Datasource.GameConfig> CreateReadonly(IConnection connection) =>
        new ReadonlyRepository<Backend.Types.Datasource.GameConfig>(connection, Options(connection));

    static CRUDRepositoryOptions<Backend.Types.Datasource.GameConfig> Options(IConnection connection) =>
        new CRUDRepositoryBuilder<Backend.Types.Datasource.GameConfig>()
            .Add(new()
            {
                Entity = "GameConfig",
                EntityMapper = new DictionaryMapper<string>(new Dictionary<string, string> { ["GameConfig"] = "game_configs" }),
                PropertyMappings = new DictionaryMapper<string>(new Dictionary<string, string>
                {
                    ["Id"] = "id",
                    ["Uuid"] = "uuid",
                    ["Created"] = "created",
                    ["Updated"] = "updated",
                    ["Version"] = "version",
                    ["GameId"] = "game_id",
                    ["Name"] = "name",
                    ["Value"] = "value",
                }),
                Ids = ["Id"],
                ReadProperties = ["Id", "Uuid", "Created", "Updated", "Version", "GameId", "Name", "Value"],
                CreateProperties = ["GameId", "Name", "Value"],
                UpdateProperties = ["Uuid", "GameId", "Name", "Value"],
                Schema = new(new Dictionary<string, SchemaColumn>
                {
                    ["Id"] = new("biginteger", false, false, true),
                    ["Uuid"] = new("uuid", false, true),
                    ["Created"] = new("datetime", false, true),
                    ["Updated"] = new("datetime", false, true),
                    ["Version"] = new("binary", false, true),
                    ["GameId"] = new("biginteger", false, false),
                    ["Name"] = new("string", false, false),
                    ["Value"] = new("string", false, false),
                }),
            })
            .Add("sqlite", new()
            {
                Entity = "GameConfig",
                EntityMapper = new DictionaryMapper<string>(new Dictionary<string, string> { ["GameConfig"] = "game_configs" }),
                PropertyMappings = new DictionaryMapper<string>(new Dictionary<string, string>
                {
                    ["Id"] = "id",
                    ["Uuid"] = "uuid",
                    ["Created"] = "created",
                    ["Updated"] = "updated",
                    ["Version"] = "version",
                    ["GameId"] = "game_id",
                    ["Name"] = "name",
                    ["Value"] = "value",
                }),
                Ids = ["Id"],
                ReadProperties = ["Id", "Uuid", "Created", "Updated", "Version", "GameId", "Name", "Value"],
                CreateProperties = ["Uuid", "Created", "Version", "GameId", "Name", "Value"],
                UpdateProperties = ["Uuid", "Created", "Version", "GameId", "Name", "Value"],
                Schema = new(new Dictionary<string, SchemaColumn>
                {
                    ["Id"] = new("biginteger", false, false, true),
                    ["Uuid"] = new("uuid", false, true),
                    ["Created"] = new("datetime", false, true),
                    ["Updated"] = new("datetime", false, true),
                    ["Version"] = new("binary", false, true),
                    ["GameId"] = new("biginteger", false, false),
                    ["Name"] = new("string", false, false),
                    ["Value"] = new("string", false, false),
                }),
            })
            .For(connection);
}
