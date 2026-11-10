using Datasources;

public sealed class GamesRepository : CRUDRepository<Backend.Types.View.Game>
{
    public GameSettingsRepository GameSetting { get; }
    public CategoriesRepository Category { get; }
    public GameCategoriesRepository GameCategory { get; }

    public GamesRepository(IConnection connection) : base(connection, Options(connection))
    {
        GameSetting = new GameSettingsRepository(connection);
        Category = new CategoriesRepository(connection);
        GameCategory = new GameCategoriesRepository(connection);
        AddEnriched(new("Settings", "Id", "GameId", "Value", Type: EnrichmentPropertyType.Dictionary, DictionaryKey: "Name"), GameSetting);
        AddLinked(new("Categories", "Id", "Id", "Name", Association: new("GameId", "CategoryId")), Category, GameCategory);
    }

    public static IReadonlyRepository<Backend.Types.View.Game> CreateReadonly(IConnection connection)
    {
        var repo = new ReadonlyRepository<Backend.Types.View.Game>(connection, Options(connection));
        var GameSetting = new GameSettingsRepository(connection);
        var Category = new CategoriesRepository(connection);
        var GameCategory = new GameCategoriesRepository(connection);
        repo.AddEnriched(new("Settings", "Id", "GameId", "Value", Type: EnrichmentPropertyType.Dictionary, DictionaryKey: "Name"), GameSetting);
        repo.AddEnriched(new("Categories", "Id", "Id", "Name", Type: EnrichmentPropertyType.List), Category);
        return repo;
    }

    static CRUDRepositoryOptions<Backend.Types.View.Game> Options(IConnection connection) =>
        new CRUDRepositoryBuilder<Backend.Types.View.Game>()
            .Add(new()
            {
                Entity = "Game",
                EntityMapper = new DictionaryMapper<string>(new Dictionary<string, string> { ["Game"] = "games" }),
                PropertyMappings = new DictionaryMapper<string>(new Dictionary<string, string>
                {
                    ["Id"] = "id",
                    ["Uuid"] = "uuid",
                    ["Created"] = "created",
                    ["Updated"] = "updated",
                    ["Version"] = "version",
                    ["Name"] = "name",
                    ["Description"] = "description",
                    ["GameParentId"] = "game_parent_id",
                    ["GameConfigId"] = "game_config_id",
                    ["IsDeleted"] = "is_deleted",
                    ["IsEnabled"] = "is_enabled",
                }),
                Ids = ["Id"],
                ReadProperties = ["Id", "Uuid", "Created", "Updated", "Version", "Name", "Description", "GameParentId", "GameConfigId", "IsDeleted", "IsEnabled"],
                CreateProperties = ["Name", "Description", "GameParentId", "GameConfigId", "IsDeleted", "IsEnabled"],
                UpdateProperties = ["Uuid", "Name", "Description", "GameParentId", "GameConfigId", "IsDeleted", "IsEnabled"],
                Schema = new(new Dictionary<string, SchemaColumn>
                {
                    ["Id"] = new("biginteger", false, false, true),
                    ["Uuid"] = new("uuid", false, true),
                    ["Created"] = new("datetime", false, true),
                    ["Updated"] = new("datetime", false, true),
                    ["Version"] = new("binary", false, true),
                    ["Name"] = new("string", false, false),
                    ["Description"] = new("string", false, false),
                    ["GameParentId"] = new("biginteger", false, false),
                    ["GameConfigId"] = new("biginteger", false, false),
                    ["IsDeleted"] = new("boolean", false, true),
                    ["IsEnabled"] = new("boolean", false, true),
                }),
            })
            .Add("sqlite", new()
            {
                Entity = "Game",
                EntityMapper = new DictionaryMapper<string>(new Dictionary<string, string> { ["Game"] = "games" }),
                PropertyMappings = new DictionaryMapper<string>(new Dictionary<string, string>
                {
                    ["Id"] = "id",
                    ["Uuid"] = "uuid",
                    ["Created"] = "created",
                    ["Updated"] = "updated",
                    ["Version"] = "version",
                    ["Name"] = "name",
                    ["Description"] = "description",
                    ["GameParentId"] = "game_parent_id",
                    ["GameConfigId"] = "game_config_id",
                    ["IsDeleted"] = "is_deleted",
                    ["IsEnabled"] = "is_enabled",
                }),
                Ids = ["Id"],
                ReadProperties = ["Id", "Uuid", "Created", "Updated", "Version", "Name", "Description", "GameParentId", "GameConfigId", "IsDeleted", "IsEnabled"],
                CreateProperties = ["Uuid", "Created", "Version", "Name", "Description", "GameParentId", "GameConfigId", "IsDeleted", "IsEnabled"],
                UpdateProperties = ["Uuid", "Created", "Version", "Name", "Description", "GameParentId", "GameConfigId", "IsDeleted", "IsEnabled"],
                Schema = new(new Dictionary<string, SchemaColumn>
                {
                    ["Id"] = new("biginteger", false, false, true),
                    ["Uuid"] = new("uuid", false, true),
                    ["Created"] = new("datetime", false, true),
                    ["Updated"] = new("datetime", false, true),
                    ["Version"] = new("binary", false, true),
                    ["Name"] = new("string", false, false),
                    ["Description"] = new("string", false, false),
                    ["GameParentId"] = new("biginteger", false, false),
                    ["GameConfigId"] = new("biginteger", false, false),
                    ["IsDeleted"] = new("boolean", false, true),
                    ["IsEnabled"] = new("boolean", false, true),
                }),
            })
            .For(connection);
}
