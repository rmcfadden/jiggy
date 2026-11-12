using Datasources;

public sealed class IdentityProviderLinkedUserFieldTypesRepository : ReadonlyRepository<Backend.Types.Datasource.IdentityProviderLinkedUserFieldType>
{
    public IdentityProviderLinkedUserFieldTypesRepository(IConnection connection) : base(connection, Options(connection)) { }

    public static IReadonlyRepository<Backend.Types.Datasource.IdentityProviderLinkedUserFieldType> CreateReadonly(IConnection connection) =>
        new IdentityProviderLinkedUserFieldTypesRepository(connection);

    static ReadonlyRepositoryMappingOptions<Backend.Types.Datasource.IdentityProviderLinkedUserFieldType> Options(IConnection connection) =>
        new CRUDRepositoryBuilder<Backend.Types.Datasource.IdentityProviderLinkedUserFieldType>()
            .Add(new()
            {
                Entity = "IdentityProviderLinkedUserFieldType",
                EntityMapper = new DictionaryMapper<string>(new Dictionary<string, string> { ["IdentityProviderLinkedUserFieldType"] = "identity_provider_linked_user_field_types" }),
                PropertyMappings = new DictionaryMapper<string>(new Dictionary<string, string>
                {
                    ["Id"] = "id",
                    ["Uuid"] = "uuid",
                    ["Created"] = "created",
                    ["Updated"] = "updated",
                    ["Version"] = "version",
                    ["Name"] = "name",
                }),
                ReadProperties = ["Id", "Uuid", "Created", "Updated", "Version", "Name"],
                Schema = new(new Dictionary<string, SchemaColumn>
                {
                    ["Id"] = new("biginteger", false, false, true),
                    ["Uuid"] = new("uuid", false, true),
                    ["Created"] = new("datetime", false, true),
                    ["Updated"] = new("datetime", false, true),
                    ["Version"] = new("binary", false, true),
                    ["Name"] = new("string", false, false),
                }),
            })
            .Add("sqlite", new()
            {
                Entity = "IdentityProviderLinkedUserFieldType",
                EntityMapper = new DictionaryMapper<string>(new Dictionary<string, string> { ["IdentityProviderLinkedUserFieldType"] = "identity_provider_linked_user_field_types" }),
                PropertyMappings = new DictionaryMapper<string>(new Dictionary<string, string>
                {
                    ["Id"] = "id",
                    ["Uuid"] = "uuid",
                    ["Created"] = "created",
                    ["Updated"] = "updated",
                    ["Version"] = "version",
                    ["Name"] = "name",
                }),
                ReadProperties = ["Id", "Uuid", "Created", "Updated", "Version", "Name"],
                Schema = new(new Dictionary<string, SchemaColumn>
                {
                    ["Id"] = new("biginteger", false, false, true),
                    ["Uuid"] = new("uuid", false, true),
                    ["Created"] = new("datetime", false, true),
                    ["Updated"] = new("datetime", false, true),
                    ["Version"] = new("binary", false, true),
                    ["Name"] = new("string", false, false),
                }),
            })
            .For(connection);
}
