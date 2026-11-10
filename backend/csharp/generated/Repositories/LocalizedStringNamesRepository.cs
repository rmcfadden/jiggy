using Datasources;

public sealed class LocalizedStringNamesRepository : CRUDRepository<Backend.Types.View.LocalizedStringName>
{
    public LocalizedStringNamesRepository(IConnection connection) : base(connection, Options(connection)) { }

    public static IReadonlyRepository<Backend.Types.View.LocalizedStringName> CreateReadonly(IConnection connection) =>
        new ReadonlyRepository<Backend.Types.View.LocalizedStringName>(connection, Options(connection));

    static CRUDRepositoryOptions<Backend.Types.View.LocalizedStringName> Options(IConnection connection) =>
        new CRUDRepositoryBuilder<Backend.Types.View.LocalizedStringName>()
            .Add(new()
            {
                Entity = "LocalizedStringName",
                EntityMapper = new DictionaryMapper<string>(new Dictionary<string, string> { ["LocalizedStringName"] = "localized_string_names" }),
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
                    ["Description"] = new("string", false, false),
                }),
            })
            .Add("sqlite", new()
            {
                Entity = "LocalizedStringName",
                EntityMapper = new DictionaryMapper<string>(new Dictionary<string, string> { ["LocalizedStringName"] = "localized_string_names" }),
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
                    ["Description"] = new("string", false, false),
                }),
            })
            .For(connection);
}
