using Datasources;

public sealed class TemplatesRepository : CRUDRepository<Backend.Types.View.Template>
{
    public TemplateTypesRepository TemplateType { get; }
    public LanguagesRepository Language { get; }

    public TemplatesRepository(IConnection connection) : base(connection, Options(connection))
    {
        TemplateType = new TemplateTypesRepository(connection);
        Language = new LanguagesRepository(connection);
        AddEnriched(new("TemplateTypeName", "TemplateTypeId", "Id", "Name"), TemplateType);
        AddEnriched(new("LanguageCode", "LanguageId", "Id", "Code"), Language);
    }

    public static IReadonlyRepository<Backend.Types.View.Template> CreateReadonly(IConnection connection)
    {
        var repo = new ReadonlyRepository<Backend.Types.View.Template>(connection, Options(connection));
        var TemplateType = new TemplateTypesRepository(connection);
        var Language = new LanguagesRepository(connection);
        repo.AddEnriched(new("TemplateTypeName", "TemplateTypeId", "Id", "Name"), TemplateType);
        repo.AddEnriched(new("LanguageCode", "LanguageId", "Id", "Code"), Language);
        return repo;
    }

    static CRUDRepositoryOptions<Backend.Types.View.Template> Options(IConnection connection) =>
        new CRUDRepositoryBuilder<Backend.Types.View.Template>()
            .Add(new()
            {
                Entity = "Template",
                EntityMapper = new DictionaryMapper<string>(new Dictionary<string, string> { ["Template"] = "templates" }),
                PropertyMappings = new DictionaryMapper<string>(new Dictionary<string, string>
                {
                    ["Id"] = "id",
                    ["Uuid"] = "uuid",
                    ["Created"] = "created",
                    ["Updated"] = "updated",
                    ["Version"] = "version",
                    ["Name"] = "name",
                    ["Content"] = "content",
                    ["TemplateTypeId"] = "template_type_id",
                    ["LanguageId"] = "language_id",
                }),
                Ids = ["Id"],
                ReadProperties = ["Id", "Uuid", "Created", "Updated", "Version", "Name", "Content", "TemplateTypeId", "LanguageId"],
                CreateProperties = ["Name", "Content"],
                UpdateProperties = ["Uuid", "Name", "Content"],
                Schema = new(new Dictionary<string, SchemaColumn>
                {
                    ["Id"] = new("biginteger", false, false, true),
                    ["Uuid"] = new("uuid", false, true),
                    ["Created"] = new("datetime", false, true),
                    ["Updated"] = new("datetime", false, true),
                    ["Version"] = new("binary", false, true),
                    ["Name"] = new("string", false, false),
                    ["Content"] = new("string", false, false),
                    ["TemplateTypeName"] = new("string", false, false),
                    ["LanguageCode"] = new("string", false, false),
                }),
            })
            .Add("sqlite", new()
            {
                Entity = "Template",
                EntityMapper = new DictionaryMapper<string>(new Dictionary<string, string> { ["Template"] = "templates" }),
                PropertyMappings = new DictionaryMapper<string>(new Dictionary<string, string>
                {
                    ["Id"] = "id",
                    ["Uuid"] = "uuid",
                    ["Created"] = "created",
                    ["Updated"] = "updated",
                    ["Version"] = "version",
                    ["Name"] = "name",
                    ["Content"] = "content",
                    ["TemplateTypeId"] = "template_type_id",
                    ["LanguageId"] = "language_id",
                }),
                Ids = ["Id"],
                ReadProperties = ["Id", "Uuid", "Created", "Updated", "Version", "Name", "Content", "TemplateTypeId", "LanguageId"],
                CreateProperties = ["Uuid", "Created", "Version", "Name", "Content"],
                UpdateProperties = ["Uuid", "Created", "Version", "Name", "Content"],
                Schema = new(new Dictionary<string, SchemaColumn>
                {
                    ["Id"] = new("biginteger", false, false, true),
                    ["Uuid"] = new("uuid", false, true),
                    ["Created"] = new("datetime", false, true),
                    ["Updated"] = new("datetime", false, true),
                    ["Version"] = new("binary", false, true),
                    ["Name"] = new("string", false, false),
                    ["Content"] = new("string", false, false),
                    ["TemplateTypeName"] = new("string", false, false),
                    ["LanguageCode"] = new("string", false, false),
                }),
            })
            .For(connection);
}
