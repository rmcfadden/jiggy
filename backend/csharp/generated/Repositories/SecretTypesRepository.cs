using Datasources;

public sealed class SecretTypesRepository : ReadonlyRepository<Backend.Types.Datasource.SecretType>
{
    public SecretTypesRepository(IConnection connection) : base(connection, Options(connection)) { }

    public static IReadonlyRepository<Backend.Types.Datasource.SecretType> CreateReadonly(IConnection connection) =>
        new SecretTypesRepository(connection);

    static ReadonlyRepositoryMappingOptions<Backend.Types.Datasource.SecretType> Options(IConnection connection) =>
        new CRUDRepositoryBuilder<Backend.Types.Datasource.SecretType>()
            .Add(new()
            {
                Entity = "SecretType",
                EntityMapper = new DictionaryMapper<string>(new Dictionary<string, string> { ["SecretType"] = "secret_types" }),
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
                ReadProperties = ["Id", "Uuid", "Created", "Updated", "Version", "Name", "Description"],
                Schema = new(new Dictionary<string, SchemaColumn>
                {
                    ["Id"] = new("biginteger", false, false, true),
                    ["Uuid"] = new("uuid", false, true),
                    ["Created"] = new("datetime", false, true),
                    ["Updated"] = new("datetime", false, true),
                    ["Version"] = new("binary", false, true),
                    ["Name"] = new("string", false, false),
                    ["Description"] = new("string", true, false),
                }),
            })
            .Add("sqlite", new()
            {
                Entity = "SecretType",
                EntityMapper = new DictionaryMapper<string>(new Dictionary<string, string> { ["SecretType"] = "secret_types" }),
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
                ReadProperties = ["Id", "Uuid", "Created", "Updated", "Version", "Name", "Description"],
                Schema = new(new Dictionary<string, SchemaColumn>
                {
                    ["Id"] = new("biginteger", false, false, true),
                    ["Uuid"] = new("uuid", false, true),
                    ["Created"] = new("datetime", false, true),
                    ["Updated"] = new("datetime", false, true),
                    ["Version"] = new("binary", false, true),
                    ["Name"] = new("string", false, false),
                    ["Description"] = new("string", true, false),
                }),
            })
            .For(connection);
}
