using Datasources;

public sealed class PhoneLabelsRepository : CRUDRepository<Backend.Types.Datasource.PhoneLabel>
{
    public PhoneLabelsRepository(IConnection connection) : base(connection, Options(connection)) { }

    public static IReadonlyRepository<Backend.Types.Datasource.PhoneLabel> CreateReadonly(IConnection connection) =>
        new ReadonlyRepository<Backend.Types.Datasource.PhoneLabel>(connection, Options(connection));

    static CRUDRepositoryOptions<Backend.Types.Datasource.PhoneLabel> Options(IConnection connection) =>
        new CRUDRepositoryBuilder<Backend.Types.Datasource.PhoneLabel>()
            .Add(new()
            {
                Entity = "PhoneLabel",
                EntityMapper = new DictionaryMapper<string>(new Dictionary<string, string> { ["PhoneLabel"] = "phone_labels" }),
                PropertyMappings = new DictionaryMapper<string>(new Dictionary<string, string>
                {
                    ["Id"] = "id",
                    ["Uuid"] = "uuid",
                    ["Created"] = "created",
                    ["Updated"] = "updated",
                    ["Version"] = "version",
                    ["PhoneId"] = "phone_id",
                    ["LabelId"] = "label_id",
                }),
                Ids = ["Id"],
                ReadProperties = ["Id", "Uuid", "Created", "Updated", "Version", "PhoneId", "LabelId"],
                CreateProperties = ["PhoneId", "LabelId"],
                UpdateProperties = ["Uuid", "PhoneId", "LabelId"],
                Schema = new(new Dictionary<string, SchemaColumn>
                {
                    ["Id"] = new("biginteger", false, false, true),
                    ["Uuid"] = new("uuid", false, true),
                    ["Created"] = new("datetime", false, true),
                    ["Updated"] = new("datetime", false, true),
                    ["Version"] = new("binary", false, true),
                    ["PhoneId"] = new("biginteger", false, false),
                    ["LabelId"] = new("biginteger", false, false),
                }),
            })
            .Add("sqlite", new()
            {
                Entity = "PhoneLabel",
                EntityMapper = new DictionaryMapper<string>(new Dictionary<string, string> { ["PhoneLabel"] = "phone_labels" }),
                PropertyMappings = new DictionaryMapper<string>(new Dictionary<string, string>
                {
                    ["Id"] = "id",
                    ["Uuid"] = "uuid",
                    ["Created"] = "created",
                    ["Updated"] = "updated",
                    ["Version"] = "version",
                    ["PhoneId"] = "phone_id",
                    ["LabelId"] = "label_id",
                }),
                Ids = ["Id"],
                ReadProperties = ["Id", "Uuid", "Created", "Updated", "Version", "PhoneId", "LabelId"],
                CreateProperties = ["Uuid", "Created", "Version", "PhoneId", "LabelId"],
                UpdateProperties = ["Uuid", "Created", "Version", "PhoneId", "LabelId"],
                Schema = new(new Dictionary<string, SchemaColumn>
                {
                    ["Id"] = new("biginteger", false, false, true),
                    ["Uuid"] = new("uuid", false, true),
                    ["Created"] = new("datetime", false, true),
                    ["Updated"] = new("datetime", false, true),
                    ["Version"] = new("binary", false, true),
                    ["PhoneId"] = new("biginteger", false, false),
                    ["LabelId"] = new("biginteger", false, false),
                }),
            })
            .For(connection);
}
