using Datasources;

public sealed class GameParentsRepository : CRUDRepository<Backend.Types.View.GameParent>
{
    public GameParentSettingsRepository GameParentSetting { get; }

    public GameParentsRepository(IConnection connection) : base(connection, Options(connection))
    {
        GameParentSetting = new GameParentSettingsRepository(connection);
        AddEnriched(new("Settings", "Id", "GameParentId", "Value", Type: EnrichmentPropertyType.Dictionary), GameParentSetting);
    }

    public static IReadonlyRepository<Backend.Types.View.GameParent> CreateReadonly(IConnection connection)
    {
        var repo = new ReadonlyRepository<Backend.Types.View.GameParent>(connection, Options(connection));
        var GameParentSetting = new GameParentSettingsRepository(connection);
        repo.AddEnriched(new("Settings", "Id", "GameParentId", "Value", Type: EnrichmentPropertyType.Dictionary), GameParentSetting);
        return repo;
    }

    static CRUDRepositoryOptions<Backend.Types.View.GameParent> Options(IConnection connection) =>
        new CRUDRepositoryBuilder<Backend.Types.View.GameParent>()
            .Add(new()
            {
                Entity = "GameParent",
                EntityMapper = new DictionaryMapper<string>(new Dictionary<string, string> { ["GameParent"] = "game_parent_bases" }),
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
                Entity = "GameParent",
                EntityMapper = new DictionaryMapper<string>(new Dictionary<string, string> { ["GameParent"] = "game_parent_bases" }),
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
