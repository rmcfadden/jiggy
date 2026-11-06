using Datasources;

public sealed class StringNamesRepository : CRUDRepository<Backend.Types.View.StringName>
{
    public StringNamesRepository(IConnection connection) : base(connection, Options(connection)) { }

    public static IReadonlyRepository<Backend.Types.View.StringName> CreateReadonly(IConnection connection) =>
        new ReadonlyRepository<Backend.Types.View.StringName>(connection, Options(connection));

    static CRUDRepositoryOptions<Backend.Types.View.StringName> Options(IConnection connection) =>
        new CRUDRepositoryBuilder<Backend.Types.View.StringName>()
            .Add(new()
            {
                Entity = "StringName",
                EntityMapper = new DictionaryMapper<string>(new Dictionary<string, string> { ["StringName"] = "string_names" }),
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
                }),
            })
            .Add("sqlite", new()
            {
                Entity = "StringName",
                EntityMapper = new DictionaryMapper<string>(new Dictionary<string, string> { ["StringName"] = "string_names" }),
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
                }),
            })
            .For(connection);
}
