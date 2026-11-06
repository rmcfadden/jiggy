using Datasources;

public sealed class StringsRepository : CRUDRepository<Backend.Types.View.String>
{
    public LanguagesRepository Languages { get; }

    public StringsRepository(IConnection connection) : base(connection, Options(connection))
    {
        Languages = new LanguagesRepository(connection);
        AddEnriched(new("LanguageName", "LanguageId", "Id", "Name"), Languages);
    }

    public static IReadonlyRepository<Backend.Types.View.String> CreateReadonly(IConnection connection)
    {
        var repo = new ReadonlyRepository<Backend.Types.View.String>(connection, Options(connection));
        var Languages = new LanguagesRepository(connection);
        repo.AddEnriched(new("LanguageName", "LanguageId", "Id", "Name"), Languages);
        return repo;
    }

    static CRUDRepositoryOptions<Backend.Types.View.String> Options(IConnection connection) =>
        new CRUDRepositoryBuilder<Backend.Types.View.String>()
            .Add(new()
            {
                Entity = "String",
                EntityMapper = new DictionaryMapper<string>(new Dictionary<string, string> { ["String"] = "string_bases" }),
                PropertyMappings = new DictionaryMapper<string>(new Dictionary<string, string>
                {
                    ["Id"] = "id",
                    ["Uuid"] = "uuid",
                    ["Created"] = "created",
                    ["Updated"] = "updated",
                    ["Version"] = "version",
                    ["StringNameId"] = "string_name_id",
                    ["LanguageId"] = "language_id",
                    ["Value"] = "value",
                    ["IsEnabled"] = "is_enabled",
                    ["IsDeleted"] = "is_deleted",
                }),
                Ids = ["Id"],
                ReadProperties = ["Id", "Uuid", "Created", "Updated", "Version", "StringNameId", "LanguageId", "Value", "IsEnabled", "IsDeleted"],
                CreateProperties = ["StringNameId", "LanguageId", "Value", "IsEnabled", "IsDeleted"],
                UpdateProperties = ["Uuid", "StringNameId", "LanguageId", "Value", "IsEnabled", "IsDeleted"],
                Schema = new(new Dictionary<string, SchemaColumn>
                {
                    ["Id"] = new("biginteger", false, false, true),
                    ["Uuid"] = new("uuid", false, true),
                    ["Created"] = new("datetime", false, true),
                    ["Updated"] = new("datetime", false, true),
                    ["Version"] = new("binary", false, true),
                    ["StringNameId"] = new("biginteger", false, false),
                    ["LanguageId"] = new("biginteger", false, false),
                    ["Value"] = new("string", false, false),
                    ["IsEnabled"] = new("boolean", false, true),
                    ["IsDeleted"] = new("boolean", false, true),
                }),
            })
            .Add("sqlite", new()
            {
                Entity = "String",
                EntityMapper = new DictionaryMapper<string>(new Dictionary<string, string> { ["String"] = "string_bases" }),
                PropertyMappings = new DictionaryMapper<string>(new Dictionary<string, string>
                {
                    ["Id"] = "id",
                    ["Uuid"] = "uuid",
                    ["Created"] = "created",
                    ["Updated"] = "updated",
                    ["Version"] = "version",
                    ["StringNameId"] = "string_name_id",
                    ["LanguageId"] = "language_id",
                    ["Value"] = "value",
                    ["IsEnabled"] = "is_enabled",
                    ["IsDeleted"] = "is_deleted",
                }),
                Ids = ["Id"],
                ReadProperties = ["Id", "Uuid", "Created", "Updated", "Version", "StringNameId", "LanguageId", "Value", "IsEnabled", "IsDeleted"],
                CreateProperties = ["Uuid", "Created", "Version", "StringNameId", "LanguageId", "Value", "IsEnabled", "IsDeleted"],
                UpdateProperties = ["Uuid", "Created", "Version", "StringNameId", "LanguageId", "Value", "IsEnabled", "IsDeleted"],
                Schema = new(new Dictionary<string, SchemaColumn>
                {
                    ["Id"] = new("biginteger", false, false, true),
                    ["Uuid"] = new("uuid", false, true),
                    ["Created"] = new("datetime", false, true),
                    ["Updated"] = new("datetime", false, true),
                    ["Version"] = new("binary", false, true),
                    ["StringNameId"] = new("biginteger", false, false),
                    ["LanguageId"] = new("biginteger", false, false),
                    ["Value"] = new("string", false, false),
                    ["IsEnabled"] = new("boolean", false, true),
                    ["IsDeleted"] = new("boolean", false, true),
                }),
            })
            .For(connection);
}
