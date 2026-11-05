using Datasources;

public sealed class GamesRepository : CRUDRepository<Backend.Types.View.Game>
{
    public GameSettingsRepository GameSetting { get; }

    public GamesRepository(IConnection connection) : base(connection, Options(connection))
    {
        GameSetting = new GameSettingsRepository(connection);
        AddEnriched(new("Settings", "Id", "GameId", "Value", Type: EnrichmentPropertyType.Dictionary), GameSetting);
    }

    public static IReadonlyRepository<Backend.Types.View.Game> CreateReadonly(IConnection connection)
    {
        var repo = new ReadonlyRepository<Backend.Types.View.Game>(connection, Options(connection));
        var GameSetting = new GameSettingsRepository(connection);
        repo.AddEnriched(new("Settings", "Id", "GameId", "Value", Type: EnrichmentPropertyType.Dictionary), GameSetting);
        return repo;
    }

    static CRUDRepositoryOptions<Backend.Types.View.Game> Options(IConnection connection) =>
        new CRUDRepositoryBuilder<Backend.Types.View.Game>()
            .Add(new()
            {
                Entity = "Game",
                EntityMapper = new DictionaryMapper<string>(new Dictionary<string, string> { ["Game"] = "game_bases" }),
                PropertyMappings = new DictionaryMapper<string>(new Dictionary<string, string>
                {
                    ["Id"] = "id",
                    ["Uuid"] = "uuid",
                    ["Created"] = "created",
                    ["Updated"] = "updated",
                    ["Version"] = "version",
                    ["Name"] = "name",
                    ["Description"] = "description",
                    ["Location"] = "location",
                    ["IsEnabled"] = "is_enabled",
                    ["IsDeleted"] = "is_deleted",
                }),
                Ids = ["Id"],
                ReadProperties = ["Id", "Uuid", "Created", "Updated", "Version", "Name", "Description", "Location", "IsEnabled", "IsDeleted"],
                CreateProperties = ["Name", "Description", "Location", "IsEnabled", "IsDeleted"],
                UpdateProperties = ["Uuid", "Name", "Description", "Location", "IsEnabled", "IsDeleted"],
                Schema = new(new Dictionary<string, SchemaColumn>
                {
                    ["Id"] = new("biginteger", false, false, true),
                    ["Uuid"] = new("uuid", false, true),
                    ["Created"] = new("datetime", false, true),
                    ["Updated"] = new("datetime", false, true),
                    ["Version"] = new("binary", false, true),
                    ["Name"] = new("string", false, false),
                    ["Description"] = new("string", false, false),
                    ["Location"] = new("string", false, false),
                    ["IsEnabled"] = new("boolean", false, true),
                    ["IsDeleted"] = new("boolean", false, true),
                }),
            })
            .Add("sqlite", new()
            {
                Entity = "Game",
                EntityMapper = new DictionaryMapper<string>(new Dictionary<string, string> { ["Game"] = "game_bases" }),
                PropertyMappings = new DictionaryMapper<string>(new Dictionary<string, string>
                {
                    ["Id"] = "id",
                    ["Uuid"] = "uuid",
                    ["Created"] = "created",
                    ["Updated"] = "updated",
                    ["Version"] = "version",
                    ["Name"] = "name",
                    ["Description"] = "description",
                    ["Location"] = "location",
                    ["IsEnabled"] = "is_enabled",
                    ["IsDeleted"] = "is_deleted",
                }),
                Ids = ["Id"],
                ReadProperties = ["Id", "Uuid", "Created", "Updated", "Version", "Name", "Description", "Location", "IsEnabled", "IsDeleted"],
                CreateProperties = ["Uuid", "Created", "Version", "Name", "Description", "Location", "IsEnabled", "IsDeleted"],
                UpdateProperties = ["Uuid", "Created", "Version", "Name", "Description", "Location", "IsEnabled", "IsDeleted"],
                Schema = new(new Dictionary<string, SchemaColumn>
                {
                    ["Id"] = new("biginteger", false, false, true),
                    ["Uuid"] = new("uuid", false, true),
                    ["Created"] = new("datetime", false, true),
                    ["Updated"] = new("datetime", false, true),
                    ["Version"] = new("binary", false, true),
                    ["Name"] = new("string", false, false),
                    ["Description"] = new("string", false, false),
                    ["Location"] = new("string", false, false),
                    ["IsEnabled"] = new("boolean", false, true),
                    ["IsDeleted"] = new("boolean", false, true),
                }),
            })
            .For(connection);
}
