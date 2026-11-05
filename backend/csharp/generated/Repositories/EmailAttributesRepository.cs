using Datasources;

public sealed class EmailAttributesRepository : CRUDRepository<Backend.Types.Datasource.EmailAttribute>
{
    public EmailAttributesRepository(IConnection connection) : base(connection, Options(connection)) { }

    public static IReadonlyRepository<Backend.Types.Datasource.EmailAttribute> CreateReadonly(IConnection connection) =>
        new ReadonlyRepository<Backend.Types.Datasource.EmailAttribute>(connection, Options(connection));

    static CRUDRepositoryOptions<Backend.Types.Datasource.EmailAttribute> Options(IConnection connection) =>
        new CRUDRepositoryBuilder<Backend.Types.Datasource.EmailAttribute>()
            .Add(new()
            {
                Entity = "EmailAttribute",
                EntityMapper = new DictionaryMapper<string>(new Dictionary<string, string> { ["EmailAttribute"] = "email_attributes" }),
                PropertyMappings = new DictionaryMapper<string>(new Dictionary<string, string>
                {
                    ["Id"] = "id",
                    ["Uuid"] = "uuid",
                    ["Created"] = "created",
                    ["Updated"] = "updated",
                    ["Version"] = "version",
                    ["EmailId"] = "email_id",
                    ["Name"] = "name",
                    ["Value"] = "value",
                }),
                Ids = ["Id"],
                ReadProperties = ["Id", "Uuid", "Created", "Updated", "Version", "EmailId", "Name", "Value"],
                CreateProperties = ["EmailId", "Name", "Value"],
                UpdateProperties = ["Uuid", "EmailId", "Name", "Value"],
                Schema = new(new Dictionary<string, SchemaColumn>
                {
                    ["Id"] = new("biginteger", false, false, true),
                    ["Uuid"] = new("uuid", false, true),
                    ["Created"] = new("datetime", false, true),
                    ["Updated"] = new("datetime", false, true),
                    ["Version"] = new("binary", false, true),
                    ["EmailId"] = new("biginteger", false, false),
                    ["Name"] = new("string", false, false),
                    ["Value"] = new("string", false, false),
                }),
            })
            .Add("sqlite", new()
            {
                Entity = "EmailAttribute",
                EntityMapper = new DictionaryMapper<string>(new Dictionary<string, string> { ["EmailAttribute"] = "email_attributes" }),
                PropertyMappings = new DictionaryMapper<string>(new Dictionary<string, string>
                {
                    ["Id"] = "id",
                    ["Uuid"] = "uuid",
                    ["Created"] = "created",
                    ["Updated"] = "updated",
                    ["Version"] = "version",
                    ["EmailId"] = "email_id",
                    ["Name"] = "name",
                    ["Value"] = "value",
                }),
                Ids = ["Id"],
                ReadProperties = ["Id", "Uuid", "Created", "Updated", "Version", "EmailId", "Name", "Value"],
                CreateProperties = ["Uuid", "Created", "Version", "EmailId", "Name", "Value"],
                UpdateProperties = ["Uuid", "Created", "Version", "EmailId", "Name", "Value"],
                Schema = new(new Dictionary<string, SchemaColumn>
                {
                    ["Id"] = new("biginteger", false, false, true),
                    ["Uuid"] = new("uuid", false, true),
                    ["Created"] = new("datetime", false, true),
                    ["Updated"] = new("datetime", false, true),
                    ["Version"] = new("binary", false, true),
                    ["EmailId"] = new("biginteger", false, false),
                    ["Name"] = new("string", false, false),
                    ["Value"] = new("string", false, false),
                }),
            })
            .For(connection);
}
