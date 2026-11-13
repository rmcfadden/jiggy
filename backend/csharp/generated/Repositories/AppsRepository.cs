using Datasources;

public sealed class AppsRepository : CRUDRepository<Backend.Types.View.App>
{
    public SettingsRepository Setting { get; }

    public AppsRepository(IConnection connection) : base(connection, Options(connection))
    {
        Setting = new SettingsRepository(connection);
        AddEnriched(new("Settings", "Id", "AppId", "Value", Type: EnrichmentPropertyType.Dictionary, DictionaryKey: "Name"), Setting);
    }

    public static IReadonlyRepository<Backend.Types.View.App> CreateReadonly(IConnection connection)
    {
        var repo = new ReadonlyRepository<Backend.Types.View.App>(connection, Options(connection));
        var Setting = new SettingsRepository(connection);
        repo.AddEnriched(new("Settings", "Id", "AppId", "Value", Type: EnrichmentPropertyType.Dictionary, DictionaryKey: "Name"), Setting);
        return repo;
    }

    static CRUDRepositoryOptions<Backend.Types.View.App> Options(IConnection connection) =>
        new CRUDRepositoryBuilder<Backend.Types.View.App>()
            .Add(new()
            {
                Entity = "App",
                EntityMapper = new DictionaryMapper<string>(new Dictionary<string, string> { ["App"] = "apps" }),
                PropertyMappings = new DictionaryMapper<string>(new Dictionary<string, string>
                {
                    ["Id"] = "id",
                    ["Uuid"] = "uuid",
                    ["Created"] = "created",
                    ["Updated"] = "updated",
                    ["Version"] = "version",
                    ["Name"] = "name",
                }),
                Ids = ["Id"],
                ReadProperties = ["Id", "Uuid", "Created", "Updated", "Version", "Name"],
                CreateProperties = ["Name"],
                UpdateProperties = ["Uuid", "Name"],
                Schema = new(new Dictionary<string, SchemaColumn>
                {
                    ["Id"] = new("biginteger", false, false, true),
                    ["Uuid"] = new("uuid", false, true),
                    ["Created"] = new("datetime", false, true),
                    ["Updated"] = new("datetime", false, true),
                    ["Version"] = new("binary", false, true),
                    ["Name"] = new("string", false, false),
                }),
            })
            .Add("sqlite", new()
            {
                Entity = "App",
                EntityMapper = new DictionaryMapper<string>(new Dictionary<string, string> { ["App"] = "apps" }),
                PropertyMappings = new DictionaryMapper<string>(new Dictionary<string, string>
                {
                    ["Id"] = "id",
                    ["Uuid"] = "uuid",
                    ["Created"] = "created",
                    ["Updated"] = "updated",
                    ["Version"] = "version",
                    ["Name"] = "name",
                }),
                Ids = ["Id"],
                ReadProperties = ["Id", "Uuid", "Created", "Updated", "Version", "Name"],
                CreateProperties = ["Uuid", "Created", "Version", "Name"],
                UpdateProperties = ["Uuid", "Created", "Version", "Name"],
                Schema = new(new Dictionary<string, SchemaColumn>
                {
                    ["Id"] = new("biginteger", false, false, true),
                    ["Uuid"] = new("uuid", false, true),
                    ["Created"] = new("datetime", false, true),
                    ["Updated"] = new("datetime", false, true),
                    ["Version"] = new("binary", false, true),
                    ["Name"] = new("string", false, false),
                }),
            })
            .For(connection);
}
