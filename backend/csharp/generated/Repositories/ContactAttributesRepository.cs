using Datasources;

public sealed class ContactAttributesRepository : CRUDRepository<Backend.Types.Datasource.ContactAttribute>
{
    public ContactAttributesRepository(IConnection connection) : base(connection, Options(connection)) { }

    public static IReadonlyRepository<Backend.Types.Datasource.ContactAttribute> CreateReadonly(IConnection connection) =>
        new ReadonlyRepository<Backend.Types.Datasource.ContactAttribute>(connection, Options(connection));

    static CRUDRepositoryOptions<Backend.Types.Datasource.ContactAttribute> Options(IConnection connection) =>
        new CRUDRepositoryBuilder<Backend.Types.Datasource.ContactAttribute>()
            .Add(new()
            {
                Entity = "ContactAttribute",
                EntityMapper = new DictionaryMapper<string>(new Dictionary<string, string> { ["ContactAttribute"] = "contact_attributes" }),
                PropertyMappings = new DictionaryMapper<string>(new Dictionary<string, string>
                {
                    ["Id"] = "id",
                    ["Uuid"] = "uuid",
                    ["Created"] = "created",
                    ["Updated"] = "updated",
                    ["Version"] = "version",
                    ["ContactId"] = "contact_id",
                    ["Name"] = "name",
                    ["Value"] = "value",
                }),
                Ids = ["Id"],
                ReadProperties = ["Id", "Uuid", "Created", "Updated", "Version", "ContactId", "Name", "Value"],
                CreateProperties = ["ContactId", "Name", "Value"],
                UpdateProperties = ["Uuid", "ContactId", "Name", "Value"],
                Schema = new(new Dictionary<string, SchemaColumn>
                {
                    ["Id"] = new("biginteger", false, false, true),
                    ["Uuid"] = new("uuid", false, true),
                    ["Created"] = new("datetime", false, true),
                    ["Updated"] = new("datetime", false, true),
                    ["Version"] = new("binary", false, true),
                    ["ContactId"] = new("biginteger", false, false),
                    ["Name"] = new("string", false, false),
                    ["Value"] = new("string", false, false),
                }),
            })
            .Add("sqlite", new()
            {
                Entity = "ContactAttribute",
                EntityMapper = new DictionaryMapper<string>(new Dictionary<string, string> { ["ContactAttribute"] = "contact_attributes" }),
                PropertyMappings = new DictionaryMapper<string>(new Dictionary<string, string>
                {
                    ["Id"] = "id",
                    ["Uuid"] = "uuid",
                    ["Created"] = "created",
                    ["Updated"] = "updated",
                    ["Version"] = "version",
                    ["ContactId"] = "contact_id",
                    ["Name"] = "name",
                    ["Value"] = "value",
                }),
                Ids = ["Id"],
                ReadProperties = ["Id", "Uuid", "Created", "Updated", "Version", "ContactId", "Name", "Value"],
                CreateProperties = ["Uuid", "Created", "Version", "ContactId", "Name", "Value"],
                UpdateProperties = ["Uuid", "Created", "Version", "ContactId", "Name", "Value"],
                Schema = new(new Dictionary<string, SchemaColumn>
                {
                    ["Id"] = new("biginteger", false, false, true),
                    ["Uuid"] = new("uuid", false, true),
                    ["Created"] = new("datetime", false, true),
                    ["Updated"] = new("datetime", false, true),
                    ["Version"] = new("binary", false, true),
                    ["ContactId"] = new("biginteger", false, false),
                    ["Name"] = new("string", false, false),
                    ["Value"] = new("string", false, false),
                }),
            })
            .For(connection);
}
