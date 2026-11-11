using Datasources;

public sealed class TemplateTypesRepository : ReadonlyRepository<Backend.Types.Datasource.TemplateType>
{
    public TemplateTypesRepository(IConnection connection) : base(connection, Options(connection)) { }

    public static IReadonlyRepository<Backend.Types.Datasource.TemplateType> CreateReadonly(IConnection connection) =>
        new TemplateTypesRepository(connection);

    static ReadonlyRepositoryMappingOptions<Backend.Types.Datasource.TemplateType> Options(IConnection connection) =>
        new CRUDRepositoryBuilder<Backend.Types.Datasource.TemplateType>()
            .Add(new()
            {
                Entity = "TemplateType",
                EntityMapper = new DictionaryMapper<string>(new Dictionary<string, string> { ["TemplateType"] = "template_types" }),
                PropertyMappings = new DictionaryMapper<string>(new Dictionary<string, string>
                {
                    ["Id"] = "id",
                    ["Uuid"] = "uuid",
                    ["Created"] = "created",
                    ["Updated"] = "updated",
                    ["Version"] = "version",
                    ["Name"] = "name",
                    ["Description"] = "description",
                }),
                ReadProperties = ["Id", "Uuid", "Created", "Updated", "Version", "Name", "Description"],
                Schema = new(new Dictionary<string, SchemaColumn>
                {
                    ["Id"] = new("biginteger", false, false, true),
                    ["Uuid"] = new("uuid", false, true),
                    ["Created"] = new("datetime", false, true),
                    ["Updated"] = new("datetime", false, true),
                    ["Version"] = new("binary", false, true),
                    ["Name"] = new("string", false, false),
                    ["Description"] = new("string", false, true),
                }),
            })
            .Add("sqlite", new()
            {
                Entity = "TemplateType",
                EntityMapper = new DictionaryMapper<string>(new Dictionary<string, string> { ["TemplateType"] = "template_types" }),
                PropertyMappings = new DictionaryMapper<string>(new Dictionary<string, string>
                {
                    ["Id"] = "id",
                    ["Uuid"] = "uuid",
                    ["Created"] = "created",
                    ["Updated"] = "updated",
                    ["Version"] = "version",
                    ["Name"] = "name",
                    ["Description"] = "description",
                }),
                ReadProperties = ["Id", "Uuid", "Created", "Updated", "Version", "Name", "Description"],
                Schema = new(new Dictionary<string, SchemaColumn>
                {
                    ["Id"] = new("biginteger", false, false, true),
                    ["Uuid"] = new("uuid", false, true),
                    ["Created"] = new("datetime", false, true),
                    ["Updated"] = new("datetime", false, true),
                    ["Version"] = new("binary", false, true),
                    ["Name"] = new("string", false, false),
                    ["Description"] = new("string", false, true),
                }),
            })
            .For(connection);
}
