using Datasources;

public sealed class GendersRepository : CRUDRepository<Backend.Types.Datasource.Gender>
{
    public GendersRepository(IConnection connection) : base(connection, Options(connection)) { }

    public static IReadonlyRepository<Backend.Types.Datasource.Gender> CreateReadonly(IConnection connection) =>
        new ReadonlyRepository<Backend.Types.Datasource.Gender>(connection, Options(connection));

    static CRUDRepositoryOptions<Backend.Types.Datasource.Gender> Options(IConnection connection) =>
        new CRUDRepositoryBuilder<Backend.Types.Datasource.Gender>()
            .Add(new()
            {
                Entity = "Gender",
                EntityMapper = new DictionaryMapper<string>(new Dictionary<string, string> { ["Gender"] = "genders" }),
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
                Entity = "Gender",
                EntityMapper = new DictionaryMapper<string>(new Dictionary<string, string> { ["Gender"] = "genders" }),
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
