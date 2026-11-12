using Datasources;

public sealed class IdentityProviderTypesRepository : ReadonlyRepository<Backend.Types.Datasource.IdentityProviderType>
{
    public IdentityProviderTypesRepository(IConnection connection) : base(connection, Options(connection)) { }

    public static IReadonlyRepository<Backend.Types.Datasource.IdentityProviderType> CreateReadonly(IConnection connection) =>
        new IdentityProviderTypesRepository(connection);

    static ReadonlyRepositoryMappingOptions<Backend.Types.Datasource.IdentityProviderType> Options(IConnection connection) =>
        new CRUDRepositoryBuilder<Backend.Types.Datasource.IdentityProviderType>()
            .Add(new()
            {
                Entity = "IdentityProviderType",
                EntityMapper = new DictionaryMapper<string>(new Dictionary<string, string> { ["IdentityProviderType"] = "identity_provider_types" }),
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
                Entity = "IdentityProviderType",
                EntityMapper = new DictionaryMapper<string>(new Dictionary<string, string> { ["IdentityProviderType"] = "identity_provider_types" }),
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
