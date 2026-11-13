using Datasources;

public sealed class LocalizedStringsRepository : CRUDRepository<Backend.Types.View.LocalizedString>
{
    public LocalizedStringNamesRepository LocalizedStringName { get; }
    public LanguagesRepository Language { get; }

    public LocalizedStringsRepository(IConnection connection) : base(connection, Options(connection))
    {
        LocalizedStringName = new LocalizedStringNamesRepository(connection);
        Language = new LanguagesRepository(connection);
        AddEnriched(new("Name", "LocalizedStringNameId", "Id", "Name"), LocalizedStringName);
        AddEnriched(new("LanguageName", "LanguageId", "Id", "Name"), Language);
    }

    public static IReadonlyRepository<Backend.Types.View.LocalizedString> CreateReadonly(IConnection connection)
    {
        var repo = new ReadonlyRepository<Backend.Types.View.LocalizedString>(connection, Options(connection));
        var LocalizedStringName = new LocalizedStringNamesRepository(connection);
        var Language = new LanguagesRepository(connection);
        repo.AddEnriched(new("Name", "LocalizedStringNameId", "Id", "Name"), LocalizedStringName);
        repo.AddEnriched(new("LanguageName", "LanguageId", "Id", "Name"), Language);
        return repo;
    }

    static CRUDRepositoryOptions<Backend.Types.View.LocalizedString> Options(IConnection connection) =>
        new CRUDRepositoryBuilder<Backend.Types.View.LocalizedString>()
            .Add(new()
            {
                Entity = "LocalizedString",
                EntityMapper = new DictionaryMapper<string>(new Dictionary<string, string> { ["LocalizedString"] = "localized_strings" }),
                PropertyMappings = new DictionaryMapper<string>(new Dictionary<string, string>
                {
                    ["Id"] = "id",
                    ["Uuid"] = "uuid",
                    ["Created"] = "created",
                    ["Updated"] = "updated",
                    ["Version"] = "version",
                    ["Value"] = "value",
                    ["IsEnabled"] = "is_enabled",
                    ["IsDeleted"] = "is_deleted",
                    ["LocalizedStringNameId"] = "localized_string_name_id",
                    ["LanguageId"] = "language_id",
                }),
                Ids = ["Id"],
                ReadProperties = ["Id", "Uuid", "Created", "Updated", "Version", "Value", "IsEnabled", "IsDeleted", "LocalizedStringNameId", "LanguageId"],
                CreateProperties = ["Value", "IsEnabled", "IsDeleted"],
                UpdateProperties = ["Uuid", "Value", "IsEnabled", "IsDeleted"],
                Schema = new(new Dictionary<string, SchemaColumn>
                {
                    ["Id"] = new("biginteger", false, false, true),
                    ["Uuid"] = new("uuid", false, true),
                    ["Created"] = new("datetime", false, true),
                    ["Updated"] = new("datetime", false, true),
                    ["Version"] = new("binary", false, true),
                    ["Value"] = new("string", false, false),
                    ["IsEnabled"] = new("boolean", false, true),
                    ["IsDeleted"] = new("boolean", false, true),
                    ["Name"] = new("string", false, false),
                    ["LanguageName"] = new("string", false, false),
                }),
            })
            .Add("sqlite", new()
            {
                Entity = "LocalizedString",
                EntityMapper = new DictionaryMapper<string>(new Dictionary<string, string> { ["LocalizedString"] = "localized_strings" }),
                PropertyMappings = new DictionaryMapper<string>(new Dictionary<string, string>
                {
                    ["Id"] = "id",
                    ["Uuid"] = "uuid",
                    ["Created"] = "created",
                    ["Updated"] = "updated",
                    ["Version"] = "version",
                    ["Value"] = "value",
                    ["IsEnabled"] = "is_enabled",
                    ["IsDeleted"] = "is_deleted",
                    ["LocalizedStringNameId"] = "localized_string_name_id",
                    ["LanguageId"] = "language_id",
                }),
                Ids = ["Id"],
                ReadProperties = ["Id", "Uuid", "Created", "Updated", "Version", "Value", "IsEnabled", "IsDeleted", "LocalizedStringNameId", "LanguageId"],
                CreateProperties = ["Uuid", "Created", "Version", "Value", "IsEnabled", "IsDeleted"],
                UpdateProperties = ["Uuid", "Created", "Version", "Value", "IsEnabled", "IsDeleted"],
                Schema = new(new Dictionary<string, SchemaColumn>
                {
                    ["Id"] = new("biginteger", false, false, true),
                    ["Uuid"] = new("uuid", false, true),
                    ["Created"] = new("datetime", false, true),
                    ["Updated"] = new("datetime", false, true),
                    ["Version"] = new("binary", false, true),
                    ["Value"] = new("string", false, false),
                    ["IsEnabled"] = new("boolean", false, true),
                    ["IsDeleted"] = new("boolean", false, true),
                    ["Name"] = new("string", false, false),
                    ["LanguageName"] = new("string", false, false),
                }),
            })
            .For(connection);
}
