using Datasources;

public sealed class PhoneAttributesRepository : CRUDRepository<Backend.Types.Datasource.PhoneAttribute>
{
    public PhoneAttributesRepository(IConnection connection) : base(connection, Options(connection)) { }

    public static IReadonlyRepository<Backend.Types.Datasource.PhoneAttribute> CreateReadonly(IConnection connection) =>
        new ReadonlyRepository<Backend.Types.Datasource.PhoneAttribute>(connection, Options(connection));

    static CRUDRepositoryOptions<Backend.Types.Datasource.PhoneAttribute> Options(IConnection connection) =>
        new CRUDRepositoryBuilder<Backend.Types.Datasource.PhoneAttribute>()
            .Add(new()
            {
                Entity = "PhoneAttribute",
                EntityMapper = new DictionaryMapper<string>(new Dictionary<string, string> { ["PhoneAttribute"] = "phone_attributes" }),
                PropertyMappings = new DictionaryMapper<string>(new Dictionary<string, string>
                {
                    ["Id"] = "id",
                    ["Uuid"] = "uuid",
                    ["Created"] = "created",
                    ["Updated"] = "updated",
                    ["Version"] = "version",
                    ["PhoneId"] = "phone_id",
                    ["Name"] = "name",
                    ["Value"] = "value",
                }),
                Ids = ["Id"],
                ReadProperties = ["Id", "Uuid", "Created", "Updated", "Version", "PhoneId", "Name", "Value"],
                CreateProperties = ["PhoneId", "Name", "Value"],
                UpdateProperties = ["Uuid", "PhoneId", "Name", "Value"],
                Schema = new(new Dictionary<string, SchemaColumn>
                {
                    ["Id"] = new("biginteger", false, false, true),
                    ["Uuid"] = new("uuid", false, true),
                    ["Created"] = new("datetime", false, true),
                    ["Updated"] = new("datetime", false, true),
                    ["Version"] = new("binary", false, true),
                    ["PhoneId"] = new("biginteger", false, false),
                    ["Name"] = new("string", false, false),
                    ["Value"] = new("string", false, false),
                }),
            })
            .Add("sqlite", new()
            {
                Entity = "PhoneAttribute",
                EntityMapper = new DictionaryMapper<string>(new Dictionary<string, string> { ["PhoneAttribute"] = "phone_attributes" }),
                PropertyMappings = new DictionaryMapper<string>(new Dictionary<string, string>
                {
                    ["Id"] = "id",
                    ["Uuid"] = "uuid",
                    ["Created"] = "created",
                    ["Updated"] = "updated",
                    ["Version"] = "version",
                    ["PhoneId"] = "phone_id",
                    ["Name"] = "name",
                    ["Value"] = "value",
                }),
                Ids = ["Id"],
                ReadProperties = ["Id", "Uuid", "Created", "Updated", "Version", "PhoneId", "Name", "Value"],
                CreateProperties = ["Uuid", "Created", "Version", "PhoneId", "Name", "Value"],
                UpdateProperties = ["Uuid", "Created", "Version", "PhoneId", "Name", "Value"],
                Schema = new(new Dictionary<string, SchemaColumn>
                {
                    ["Id"] = new("biginteger", false, false, true),
                    ["Uuid"] = new("uuid", false, true),
                    ["Created"] = new("datetime", false, true),
                    ["Updated"] = new("datetime", false, true),
                    ["Version"] = new("binary", false, true),
                    ["PhoneId"] = new("biginteger", false, false),
                    ["Name"] = new("string", false, false),
                    ["Value"] = new("string", false, false),
                }),
            })
            .For(connection);
}
