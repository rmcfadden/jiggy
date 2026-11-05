using Datasources;

public sealed class AddressLabelsRepository : CRUDRepository<Backend.Types.Datasource.AddressLabel>
{
    public AddressLabelsRepository(IConnection connection) : base(connection, Options(connection)) { }

    public static IReadonlyRepository<Backend.Types.Datasource.AddressLabel> CreateReadonly(IConnection connection) =>
        new ReadonlyRepository<Backend.Types.Datasource.AddressLabel>(connection, Options(connection));

    static CRUDRepositoryOptions<Backend.Types.Datasource.AddressLabel> Options(IConnection connection) =>
        new CRUDRepositoryBuilder<Backend.Types.Datasource.AddressLabel>()
            .Add(new()
            {
                Entity = "AddressLabel",
                EntityMapper = new DictionaryMapper<string>(new Dictionary<string, string> { ["AddressLabel"] = "address_labels" }),
                PropertyMappings = new DictionaryMapper<string>(new Dictionary<string, string>
                {
                    ["Id"] = "id",
                    ["Uuid"] = "uuid",
                    ["Created"] = "created",
                    ["Updated"] = "updated",
                    ["Version"] = "version",
                    ["AddressId"] = "address_id",
                    ["LabelId"] = "label_id",
                }),
                Ids = ["Id"],
                ReadProperties = ["Id", "Uuid", "Created", "Updated", "Version", "AddressId", "LabelId"],
                CreateProperties = ["AddressId", "LabelId"],
                UpdateProperties = ["Uuid", "AddressId", "LabelId"],
                Schema = new(new Dictionary<string, SchemaColumn>
                {
                    ["Id"] = new("biginteger", false, false, true),
                    ["Uuid"] = new("uuid", false, true),
                    ["Created"] = new("datetime", false, true),
                    ["Updated"] = new("datetime", false, true),
                    ["Version"] = new("binary", false, true),
                    ["AddressId"] = new("biginteger", false, false),
                    ["LabelId"] = new("biginteger", false, false),
                }),
            })
            .Add("sqlite", new()
            {
                Entity = "AddressLabel",
                EntityMapper = new DictionaryMapper<string>(new Dictionary<string, string> { ["AddressLabel"] = "address_labels" }),
                PropertyMappings = new DictionaryMapper<string>(new Dictionary<string, string>
                {
                    ["Id"] = "id",
                    ["Uuid"] = "uuid",
                    ["Created"] = "created",
                    ["Updated"] = "updated",
                    ["Version"] = "version",
                    ["AddressId"] = "address_id",
                    ["LabelId"] = "label_id",
                }),
                Ids = ["Id"],
                ReadProperties = ["Id", "Uuid", "Created", "Updated", "Version", "AddressId", "LabelId"],
                CreateProperties = ["Uuid", "Created", "Version", "AddressId", "LabelId"],
                UpdateProperties = ["Uuid", "Created", "Version", "AddressId", "LabelId"],
                Schema = new(new Dictionary<string, SchemaColumn>
                {
                    ["Id"] = new("biginteger", false, false, true),
                    ["Uuid"] = new("uuid", false, true),
                    ["Created"] = new("datetime", false, true),
                    ["Updated"] = new("datetime", false, true),
                    ["Version"] = new("binary", false, true),
                    ["AddressId"] = new("biginteger", false, false),
                    ["LabelId"] = new("biginteger", false, false),
                }),
            })
            .For(connection);
}
