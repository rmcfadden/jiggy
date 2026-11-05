using Datasources;

public sealed class LabelsRepository : CRUDRepository<Backend.Types.Datasource.Label>
{
    public LabelsRepository(IConnection connection) : base(connection, Options(connection)) { }

    public static IReadonlyRepository<Backend.Types.Datasource.Label> CreateReadonly(IConnection connection) =>
        new ReadonlyRepository<Backend.Types.Datasource.Label>(connection, Options(connection));

    static CRUDRepositoryOptions<Backend.Types.Datasource.Label> Options(IConnection connection) =>
        new CRUDRepositoryBuilder<Backend.Types.Datasource.Label>()
            .Add(new()
            {
                Entity = "Label",
                EntityMapper = new DictionaryMapper<string>(new Dictionary<string, string> { ["Label"] = "labels" }),
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
                Ids = ["Id"],
                ReadProperties = ["Id", "Uuid", "Created", "Updated", "Version", "Name", "Description"],
                CreateProperties = ["Name", "Description"],
                UpdateProperties = ["Uuid", "Name", "Description"],
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
                Entity = "Label",
                EntityMapper = new DictionaryMapper<string>(new Dictionary<string, string> { ["Label"] = "labels" }),
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
                Ids = ["Id"],
                ReadProperties = ["Id", "Uuid", "Created", "Updated", "Version", "Name", "Description"],
                CreateProperties = ["Uuid", "Created", "Version", "Name", "Description"],
                UpdateProperties = ["Uuid", "Created", "Version", "Name", "Description"],
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
