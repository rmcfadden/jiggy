using Datasources;

public sealed class TemplatesRepository : CRUDRepository<Backend.Types.Datasource.Template>
{
    public TemplatesRepository(IConnection connection) : base(connection, Options(connection)) { }

    public static IReadonlyRepository<Backend.Types.Datasource.Template> CreateReadonly(IConnection connection) =>
        new ReadonlyRepository<Backend.Types.Datasource.Template>(connection, Options(connection));

    static CRUDRepositoryOptions<Backend.Types.Datasource.Template> Options(IConnection connection) =>
        new CRUDRepositoryBuilder<Backend.Types.Datasource.Template>()
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
                    ["TemplateTypeId"] = "template_type_id",
                    ["Name"] = "name",
                    ["Content"] = "content",
                }),
                Ids = ["Id"],
                ReadProperties = ["Id", "Uuid", "Created", "Updated", "Version", "TemplateTypeId", "Name", "Content"],
                CreateProperties = ["TemplateTypeId", "Name", "Content"],
                UpdateProperties = ["Uuid", "TemplateTypeId", "Name", "Content"],
                Schema = new(new Dictionary<string, SchemaColumn>
                {
                    ["Id"] = new("biginteger", false, false, true),
                    ["Uuid"] = new("uuid", false, true),
                    ["Created"] = new("datetime", false, true),
                    ["Updated"] = new("datetime", false, true),
                    ["Version"] = new("binary", false, true),
                    ["TemplateTypeId"] = new("biginteger", false, false),
                    ["Name"] = new("string", false, false),
                    ["Content"] = new("string", false, false),
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
                    ["TemplateTypeId"] = "template_type_id",
                    ["Name"] = "name",
                    ["Content"] = "content",
                }),
                Ids = ["Id"],
                ReadProperties = ["Id", "Uuid", "Created", "Updated", "Version", "TemplateTypeId", "Name", "Content"],
                CreateProperties = ["Uuid", "Created", "Version", "TemplateTypeId", "Name", "Content"],
                UpdateProperties = ["Uuid", "Created", "Version", "TemplateTypeId", "Name", "Content"],
                Schema = new(new Dictionary<string, SchemaColumn>
                {
                    ["Id"] = new("biginteger", false, false, true),
                    ["Uuid"] = new("uuid", false, true),
                    ["Created"] = new("datetime", false, true),
                    ["Updated"] = new("datetime", false, true),
                    ["Version"] = new("binary", false, true),
                    ["TemplateTypeId"] = new("biginteger", false, false),
                    ["Name"] = new("string", false, false),
                    ["Content"] = new("string", false, false),
                }),
            })
            .For(connection);
}
