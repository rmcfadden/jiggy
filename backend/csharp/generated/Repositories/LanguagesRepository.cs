using Datasources;

public sealed class LanguagesRepository : CRUDRepository<Backend.Types.View.Language>
{
    public LanguagesRepository(IConnection connection) : base(connection, Options(connection)) { }

    public static IReadonlyRepository<Backend.Types.View.Language> CreateReadonly(IConnection connection) =>
        new ReadonlyRepository<Backend.Types.View.Language>(connection, Options(connection));

    static CRUDRepositoryOptions<Backend.Types.View.Language> Options(IConnection connection) =>
        new CRUDRepositoryBuilder<Backend.Types.View.Language>()
            .Add(new()
            {
                Entity = "Language",
                EntityMapper = new DictionaryMapper<string>(new Dictionary<string, string> { ["Language"] = "languages" }),
                PropertyMappings = new DictionaryMapper<string>(new Dictionary<string, string>
                {
                    ["Id"] = "id",
                    ["Uuid"] = "uuid",
                    ["Created"] = "created",
                    ["Updated"] = "updated",
                    ["Version"] = "version",
                    ["Code"] = "code",
                    ["Name"] = "name",
                    ["IsEnabled"] = "is_enabled",
                    ["IsDeleted"] = "is_deleted",
                }),
                Ids = ["Id"],
                ReadProperties = ["Id", "Uuid", "Created", "Updated", "Version", "Code", "Name", "IsEnabled", "IsDeleted"],
                CreateProperties = ["Code", "Name", "IsEnabled", "IsDeleted"],
                UpdateProperties = ["Uuid", "Code", "Name", "IsEnabled", "IsDeleted"],
                Schema = new(new Dictionary<string, SchemaColumn>
                {
                    ["Id"] = new("biginteger", false, false, true),
                    ["Uuid"] = new("uuid", false, true),
                    ["Created"] = new("datetime", false, true),
                    ["Updated"] = new("datetime", false, true),
                    ["Version"] = new("binary", false, true),
                }),
            })
            .Add("sqlite", new()
            {
                Entity = "Language",
                EntityMapper = new DictionaryMapper<string>(new Dictionary<string, string> { ["Language"] = "languages" }),
                PropertyMappings = new DictionaryMapper<string>(new Dictionary<string, string>
                {
                    ["Id"] = "id",
                    ["Uuid"] = "uuid",
                    ["Created"] = "created",
                    ["Updated"] = "updated",
                    ["Version"] = "version",
                    ["Code"] = "code",
                    ["Name"] = "name",
                    ["IsEnabled"] = "is_enabled",
                    ["IsDeleted"] = "is_deleted",
                }),
                Ids = ["Id"],
                ReadProperties = ["Id", "Uuid", "Created", "Updated", "Version", "Code", "Name", "IsEnabled", "IsDeleted"],
                CreateProperties = ["Uuid", "Created", "Version", "Code", "Name", "IsEnabled", "IsDeleted"],
                UpdateProperties = ["Uuid", "Created", "Version", "Code", "Name", "IsEnabled", "IsDeleted"],
                Schema = new(new Dictionary<string, SchemaColumn>
                {
                    ["Id"] = new("biginteger", false, false, true),
                    ["Uuid"] = new("uuid", false, true),
                    ["Created"] = new("datetime", false, true),
                    ["Updated"] = new("datetime", false, true),
                    ["Version"] = new("binary", false, true),
                }),
            })
            .For(connection);
}
