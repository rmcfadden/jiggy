using Datasources;

public sealed class ApplicationVisibilitiesRepository : ReadonlyRepository<Backend.Types.Datasource.ApplicationVisibility>
{
    public ApplicationVisibilitiesRepository(IConnection connection) : base(connection, Options(connection)) { }

    public static IReadonlyRepository<Backend.Types.Datasource.ApplicationVisibility> CreateReadonly(IConnection connection) =>
        new ApplicationVisibilitiesRepository(connection);

    static ReadonlyRepositoryMappingOptions<Backend.Types.Datasource.ApplicationVisibility> Options(IConnection connection) =>
        new CRUDRepositoryBuilder<Backend.Types.Datasource.ApplicationVisibility>()
            .Add(new()
            {
                Entity = "ApplicationVisibility",
                EntityMapper = new DictionaryMapper<string>(new Dictionary<string, string> { ["ApplicationVisibility"] = "application_visibilities" }),
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
                    ["Description"] = new("string", true, false),
                }),
            })
            .Add("sqlite", new()
            {
                Entity = "ApplicationVisibility",
                EntityMapper = new DictionaryMapper<string>(new Dictionary<string, string> { ["ApplicationVisibility"] = "application_visibilities" }),
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
                    ["Description"] = new("string", true, false),
                }),
            })
            .For(connection);
}
