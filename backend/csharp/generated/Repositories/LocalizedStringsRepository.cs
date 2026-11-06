using Datasources;

public sealed class LocalizedStringsRepository : CRUDRepository<Backend.Types.View.LocalizedString>
{
    public LanguagesRepository Languages { get; }

    public LocalizedStringsRepository(IConnection connection) : base(connection, Options(connection))
    {
        Languages = new LanguagesRepository(connection);
        AddEnriched(new("LanguageName", "LanguageId", "Id", "Name"), Languages);
    }

    public static IReadonlyRepository<Backend.Types.View.LocalizedString> CreateReadonly(IConnection connection)
    {
        var repo = new ReadonlyRepository<Backend.Types.View.LocalizedString>(connection, Options(connection));
        var Languages = new LanguagesRepository(connection);
        repo.AddEnriched(new("LanguageName", "LanguageId", "Id", "Name"), Languages);
        return repo;
    }

    static CRUDRepositoryOptions<Backend.Types.View.LocalizedString> Options(IConnection connection) =>
        new CRUDRepositoryBuilder<Backend.Types.View.LocalizedString>()
            .Add(new()
            {
                Entity = "LocalizedString",
                EntityMapper = new DictionaryMapper<string>(new Dictionary<string, string> { ["LocalizedString"] = "localized_string_bases" }),
                PropertyMappings = new DictionaryMapper<string>(new Dictionary<string, string>
                {
                    ["Id"] = "id",
                    ["Uuid"] = "uuid",
                    ["Created"] = "created",
                    ["Updated"] = "updated",
                    ["Version"] = "version",
                    ["LocalizedStringNameId"] = "localized_string_name_id",
                    ["LanguageId"] = "language_id",
                    ["Value"] = "value",
                    ["IsEnabled"] = "is_enabled",
                    ["IsDeleted"] = "is_deleted",
                }),
                Ids = ["Id"],
                ReadProperties = ["Id", "Uuid", "Created", "Updated", "Version", "LocalizedStringNameId", "LanguageId", "Value", "IsEnabled", "IsDeleted"],
                CreateProperties = ["LocalizedStringNameId", "LanguageId", "Value", "IsEnabled", "IsDeleted"],
                UpdateProperties = ["Uuid", "LocalizedStringNameId", "LanguageId", "Value", "IsEnabled", "IsDeleted"],
                Schema = new(new Dictionary<string, SchemaColumn>
                {
                    ["Id"] = new("biginteger", false, false, true),
                    ["Uuid"] = new("uuid", false, true),
                    ["Created"] = new("datetime", false, true),
                    ["Updated"] = new("datetime", false, true),
                    ["Version"] = new("binary", false, true),
                    ["LocalizedStringNameId"] = new("biginteger", false, false),
                    ["LanguageId"] = new("biginteger", false, false),
                    ["Value"] = new("string", false, false),
                    ["IsEnabled"] = new("boolean", false, true),
                    ["IsDeleted"] = new("boolean", false, true),
                }),
            })
            .Add("sqlite", new()
            {
                Entity = "LocalizedString",
                EntityMapper = new DictionaryMapper<string>(new Dictionary<string, string> { ["LocalizedString"] = "localized_string_bases" }),
                PropertyMappings = new DictionaryMapper<string>(new Dictionary<string, string>
                {
                    ["Id"] = "id",
                    ["Uuid"] = "uuid",
                    ["Created"] = "created",
                    ["Updated"] = "updated",
                    ["Version"] = "version",
                    ["LocalizedStringNameId"] = "localized_string_name_id",
                    ["LanguageId"] = "language_id",
                    ["Value"] = "value",
                    ["IsEnabled"] = "is_enabled",
                    ["IsDeleted"] = "is_deleted",
                }),
                Ids = ["Id"],
                ReadProperties = ["Id", "Uuid", "Created", "Updated", "Version", "LocalizedStringNameId", "LanguageId", "Value", "IsEnabled", "IsDeleted"],
                CreateProperties = ["Uuid", "Created", "Version", "LocalizedStringNameId", "LanguageId", "Value", "IsEnabled", "IsDeleted"],
                UpdateProperties = ["Uuid", "Created", "Version", "LocalizedStringNameId", "LanguageId", "Value", "IsEnabled", "IsDeleted"],
                Schema = new(new Dictionary<string, SchemaColumn>
                {
                    ["Id"] = new("biginteger", false, false, true),
                    ["Uuid"] = new("uuid", false, true),
                    ["Created"] = new("datetime", false, true),
                    ["Updated"] = new("datetime", false, true),
                    ["Version"] = new("binary", false, true),
                    ["LocalizedStringNameId"] = new("biginteger", false, false),
                    ["LanguageId"] = new("biginteger", false, false),
                    ["Value"] = new("string", false, false),
                    ["IsEnabled"] = new("boolean", false, true),
                    ["IsDeleted"] = new("boolean", false, true),
                }),
            })
            .For(connection);
}
