using Datasources;

public sealed class EmailLabelsRepository : CRUDRepository<Backend.Types.Datasource.EmailLabel>
{
    public EmailLabelsRepository(IConnection connection) : base(connection, Options(connection)) { }

    public static IReadonlyRepository<Backend.Types.Datasource.EmailLabel> CreateReadonly(IConnection connection) =>
        new ReadonlyRepository<Backend.Types.Datasource.EmailLabel>(connection, Options(connection));

    static CRUDRepositoryOptions<Backend.Types.Datasource.EmailLabel> Options(IConnection connection) =>
        new CRUDRepositoryBuilder<Backend.Types.Datasource.EmailLabel>()
            .Add(new()
            {
                Entity = "EmailLabel",
                EntityMapper = new DictionaryMapper<string>(new Dictionary<string, string> { ["EmailLabel"] = "email_labels" }),
                PropertyMappings = new DictionaryMapper<string>(new Dictionary<string, string>
                {
                    ["Id"] = "id",
                    ["Uuid"] = "uuid",
                    ["Created"] = "created",
                    ["Updated"] = "updated",
                    ["Version"] = "version",
                    ["EmailId"] = "email_id",
                    ["LabelId"] = "label_id",
                }),
                Ids = ["Id"],
                ReadProperties = ["Id", "Uuid", "Created", "Updated", "Version", "EmailId", "LabelId"],
                CreateProperties = ["EmailId", "LabelId"],
                UpdateProperties = ["Uuid", "EmailId", "LabelId"],
                Schema = new(new Dictionary<string, SchemaColumn>
                {
                    ["Id"] = new("biginteger", false, false, true),
                    ["Uuid"] = new("uuid", false, true),
                    ["Created"] = new("datetime", false, true),
                    ["Updated"] = new("datetime", false, true),
                    ["Version"] = new("binary", false, true),
                    ["EmailId"] = new("biginteger", false, false),
                    ["LabelId"] = new("biginteger", false, false),
                }),
            })
            .Add("sqlite", new()
            {
                Entity = "EmailLabel",
                EntityMapper = new DictionaryMapper<string>(new Dictionary<string, string> { ["EmailLabel"] = "email_labels" }),
                PropertyMappings = new DictionaryMapper<string>(new Dictionary<string, string>
                {
                    ["Id"] = "id",
                    ["Uuid"] = "uuid",
                    ["Created"] = "created",
                    ["Updated"] = "updated",
                    ["Version"] = "version",
                    ["EmailId"] = "email_id",
                    ["LabelId"] = "label_id",
                }),
                Ids = ["Id"],
                ReadProperties = ["Id", "Uuid", "Created", "Updated", "Version", "EmailId", "LabelId"],
                CreateProperties = ["Uuid", "Created", "Version", "EmailId", "LabelId"],
                UpdateProperties = ["Uuid", "Created", "Version", "EmailId", "LabelId"],
                Schema = new(new Dictionary<string, SchemaColumn>
                {
                    ["Id"] = new("biginteger", false, false, true),
                    ["Uuid"] = new("uuid", false, true),
                    ["Created"] = new("datetime", false, true),
                    ["Updated"] = new("datetime", false, true),
                    ["Version"] = new("binary", false, true),
                    ["EmailId"] = new("biginteger", false, false),
                    ["LabelId"] = new("biginteger", false, false),
                }),
            })
            .For(connection);
}
