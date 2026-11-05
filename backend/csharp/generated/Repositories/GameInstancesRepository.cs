using Datasources;

public sealed class GameInstancesRepository : CRUDRepository<Backend.Types.View.GameInstance>
{
    public GameInstanceSettingsRepository GameInstanceSetting { get; }
    public CategoriesRepository Category { get; }
    public GameInstanceCategoriesRepository GameInstanceCategory { get; }

    public GameInstancesRepository(IConnection connection) : base(connection, Options(connection))
    {
        GameInstanceSetting = new GameInstanceSettingsRepository(connection);
        Category = new CategoriesRepository(connection);
        GameInstanceCategory = new GameInstanceCategoriesRepository(connection);
        AddEnriched(new("Settings", "Id", "GameInstanceId", "Value", Type: EnrichmentPropertyType.Dictionary), GameInstanceSetting);
        AddLinked(new("Categories", "Id", "Id", "Name", Association: new("GameInstanceId", "CategoryId")), Category, GameInstanceCategory);
    }

    public static IReadonlyRepository<Backend.Types.View.GameInstance> CreateReadonly(IConnection connection)
    {
        var repo = new ReadonlyRepository<Backend.Types.View.GameInstance>(connection, Options(connection));
        var GameInstanceSetting = new GameInstanceSettingsRepository(connection);
        var Category = new CategoriesRepository(connection);
        var GameInstanceCategory = new GameInstanceCategoriesRepository(connection);
        repo.AddEnriched(new("Settings", "Id", "GameInstanceId", "Value", Type: EnrichmentPropertyType.Dictionary), GameInstanceSetting);
        repo.AddEnriched(new("Categories", "Id", "Id", "Name", Type: EnrichmentPropertyType.List), Category);
        return repo;
    }

    static CRUDRepositoryOptions<Backend.Types.View.GameInstance> Options(IConnection connection) =>
        new CRUDRepositoryBuilder<Backend.Types.View.GameInstance>()
            .Add(new()
            {
                Entity = "GameInstance",
                EntityMapper = new DictionaryMapper<string>(new Dictionary<string, string> { ["GameInstance"] = "game_instances" }),
                PropertyMappings = new DictionaryMapper<string>(new Dictionary<string, string>
                {
                    ["Id"] = "id",
                    ["Uuid"] = "uuid",
                    ["Created"] = "created",
                    ["Updated"] = "updated",
                    ["Version"] = "version",
                    ["Name"] = "name",
                    ["Description"] = "description",
                    ["GameId"] = "game_id",
                    ["GameConfigId"] = "game_config_id",
                    ["IsDeleted"] = "is_deleted",
                    ["IsEnabled"] = "is_enabled",
                }),
                Ids = ["Id"],
                ReadProperties = ["Id", "Uuid", "Created", "Updated", "Version", "Name", "Description", "GameId", "GameConfigId", "IsDeleted", "IsEnabled"],
                CreateProperties = ["Name", "Description", "GameId", "GameConfigId", "IsDeleted", "IsEnabled"],
                UpdateProperties = ["Uuid", "Name", "Description", "GameId", "GameConfigId", "IsDeleted", "IsEnabled"],
                Schema = new(new Dictionary<string, SchemaColumn>
                {
                    ["Id"] = new("biginteger", false, false, true),
                    ["Uuid"] = new("uuid", false, true),
                    ["Created"] = new("datetime", false, true),
                    ["Updated"] = new("datetime", false, true),
                    ["Version"] = new("binary", false, true),
                    ["Name"] = new("string", false, false),
                    ["Description"] = new("string", false, false),
                    ["GameId"] = new("biginteger", false, false),
                    ["GameConfigId"] = new("biginteger", false, false),
                    ["IsDeleted"] = new("boolean", false, true),
                    ["IsEnabled"] = new("boolean", false, true),
                }),
            })
            .Add("sqlite", new()
            {
                Entity = "GameInstance",
                EntityMapper = new DictionaryMapper<string>(new Dictionary<string, string> { ["GameInstance"] = "game_instances" }),
                PropertyMappings = new DictionaryMapper<string>(new Dictionary<string, string>
                {
                    ["Id"] = "id",
                    ["Uuid"] = "uuid",
                    ["Created"] = "created",
                    ["Updated"] = "updated",
                    ["Version"] = "version",
                    ["Name"] = "name",
                    ["Description"] = "description",
                    ["GameId"] = "game_id",
                    ["GameConfigId"] = "game_config_id",
                    ["IsDeleted"] = "is_deleted",
                    ["IsEnabled"] = "is_enabled",
                }),
                Ids = ["Id"],
                ReadProperties = ["Id", "Uuid", "Created", "Updated", "Version", "Name", "Description", "GameId", "GameConfigId", "IsDeleted", "IsEnabled"],
                CreateProperties = ["Uuid", "Created", "Version", "Name", "Description", "GameId", "GameConfigId", "IsDeleted", "IsEnabled"],
                UpdateProperties = ["Uuid", "Created", "Version", "Name", "Description", "GameId", "GameConfigId", "IsDeleted", "IsEnabled"],
                Schema = new(new Dictionary<string, SchemaColumn>
                {
                    ["Id"] = new("biginteger", false, false, true),
                    ["Uuid"] = new("uuid", false, true),
                    ["Created"] = new("datetime", false, true),
                    ["Updated"] = new("datetime", false, true),
                    ["Version"] = new("binary", false, true),
                    ["Name"] = new("string", false, false),
                    ["Description"] = new("string", false, false),
                    ["GameId"] = new("biginteger", false, false),
                    ["GameConfigId"] = new("biginteger", false, false),
                    ["IsDeleted"] = new("boolean", false, true),
                    ["IsEnabled"] = new("boolean", false, true),
                }),
            })
            .For(connection);
}
