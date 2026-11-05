using Datasources;

public sealed class EmailTypesRepository : CRUDRepository<Backend.Types.Datasource.EmailType>
{
    public EmailTypesRepository(IConnection connection) : base(connection, Options(connection)) { }

    public static IReadonlyRepository<Backend.Types.Datasource.EmailType> CreateReadonly(IConnection connection) =>
        new ReadonlyRepository<Backend.Types.Datasource.EmailType>(connection, Options(connection));

    static CRUDRepositoryOptions<Backend.Types.Datasource.EmailType> Options(IConnection connection) =>
        new CRUDRepositoryBuilder<Backend.Types.Datasource.EmailType>()
            .Add(new()
            {
                Entity = "EmailType",
                EntityMapper = new DictionaryMapper<string>(new Dictionary<string, string> { ["EmailType"] = "email_types" }),
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
                Entity = "EmailType",
                EntityMapper = new DictionaryMapper<string>(new Dictionary<string, string> { ["EmailType"] = "email_types" }),
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
