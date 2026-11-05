using Datasources;

public sealed class AddressAttributesRepository : CRUDRepository<Backend.Types.Datasource.AddressAttribute>
{
    public AddressAttributesRepository(IConnection connection) : base(connection, Options(connection)) { }

    public static IReadonlyRepository<Backend.Types.Datasource.AddressAttribute> CreateReadonly(IConnection connection) =>
        new ReadonlyRepository<Backend.Types.Datasource.AddressAttribute>(connection, Options(connection));

    static CRUDRepositoryOptions<Backend.Types.Datasource.AddressAttribute> Options(IConnection connection) =>
        new CRUDRepositoryBuilder<Backend.Types.Datasource.AddressAttribute>()
            .Add(new()
            {
                Entity = "AddressAttribute",
                EntityMapper = new DictionaryMapper<string>(new Dictionary<string, string> { ["AddressAttribute"] = "address_attributes" }),
                PropertyMappings = new DictionaryMapper<string>(new Dictionary<string, string>
                {
                    ["Id"] = "id",
                    ["Uuid"] = "uuid",
                    ["Created"] = "created",
                    ["Updated"] = "updated",
                    ["Version"] = "version",
                    ["AddressId"] = "address_id",
                    ["Name"] = "name",
                    ["Value"] = "value",
                }),
                Ids = ["Id"],
                ReadProperties = ["Id", "Uuid", "Created", "Updated", "Version", "AddressId", "Name", "Value"],
                CreateProperties = ["AddressId", "Name", "Value"],
                UpdateProperties = ["Uuid", "AddressId", "Name", "Value"],
                Schema = new(new Dictionary<string, SchemaColumn>
                {
                    ["Id"] = new("biginteger", false, false, true),
                    ["Uuid"] = new("uuid", false, true),
                    ["Created"] = new("datetime", false, true),
                    ["Updated"] = new("datetime", false, true),
                    ["Version"] = new("binary", false, true),
                    ["AddressId"] = new("biginteger", false, false),
                    ["Name"] = new("string", false, false),
                    ["Value"] = new("string", false, false),
                }),
            })
            .Add("sqlite", new()
            {
                Entity = "AddressAttribute",
                EntityMapper = new DictionaryMapper<string>(new Dictionary<string, string> { ["AddressAttribute"] = "address_attributes" }),
                PropertyMappings = new DictionaryMapper<string>(new Dictionary<string, string>
                {
                    ["Id"] = "id",
                    ["Uuid"] = "uuid",
                    ["Created"] = "created",
                    ["Updated"] = "updated",
                    ["Version"] = "version",
                    ["AddressId"] = "address_id",
                    ["Name"] = "name",
                    ["Value"] = "value",
                }),
                Ids = ["Id"],
                ReadProperties = ["Id", "Uuid", "Created", "Updated", "Version", "AddressId", "Name", "Value"],
                CreateProperties = ["Uuid", "Created", "Version", "AddressId", "Name", "Value"],
                UpdateProperties = ["Uuid", "Created", "Version", "AddressId", "Name", "Value"],
                Schema = new(new Dictionary<string, SchemaColumn>
                {
                    ["Id"] = new("biginteger", false, false, true),
                    ["Uuid"] = new("uuid", false, true),
                    ["Created"] = new("datetime", false, true),
                    ["Updated"] = new("datetime", false, true),
                    ["Version"] = new("binary", false, true),
                    ["AddressId"] = new("biginteger", false, false),
                    ["Name"] = new("string", false, false),
                    ["Value"] = new("string", false, false),
                }),
            })
            .For(connection);
}
