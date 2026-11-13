using Datasources;

public sealed class IdentityProvidersRepository : CRUDRepository<Backend.Types.View.IdentityProvider>
{
    public IdentityProviderSettingsRepository IdentityProviderSetting { get; }
    public IdentityProviderTypesRepository IdentityProviderType { get; }

    public IdentityProvidersRepository(IConnection connection) : base(connection, Options(connection))
    {
        IdentityProviderSetting = new IdentityProviderSettingsRepository(connection);
        IdentityProviderType = new IdentityProviderTypesRepository(connection);
        AddEnriched(new("Settings", "Id", "IdentityProviderId", "Value", Type: EnrichmentPropertyType.Dictionary, DictionaryKey: "Name"), IdentityProviderSetting);
        AddEnriched(new("IdentityProviderTypeName", "IdentityProviderTypeId", "Id", "Name"), IdentityProviderType);
    }

    public static IReadonlyRepository<Backend.Types.View.IdentityProvider> CreateReadonly(IConnection connection)
    {
        var repo = new ReadonlyRepository<Backend.Types.View.IdentityProvider>(connection, Options(connection));
        var IdentityProviderSetting = new IdentityProviderSettingsRepository(connection);
        var IdentityProviderType = new IdentityProviderTypesRepository(connection);
        repo.AddEnriched(new("Settings", "Id", "IdentityProviderId", "Value", Type: EnrichmentPropertyType.Dictionary, DictionaryKey: "Name"), IdentityProviderSetting);
        repo.AddEnriched(new("IdentityProviderTypeName", "IdentityProviderTypeId", "Id", "Name"), IdentityProviderType);
        return repo;
    }

    static CRUDRepositoryOptions<Backend.Types.View.IdentityProvider> Options(IConnection connection) =>
        new CRUDRepositoryBuilder<Backend.Types.View.IdentityProvider>()
            .Add(new()
            {
                Entity = "IdentityProvider",
                EntityMapper = new DictionaryMapper<string>(new Dictionary<string, string> { ["IdentityProvider"] = "identity_providers" }),
                PropertyMappings = new DictionaryMapper<string>(new Dictionary<string, string>
                {
                    ["Id"] = "id",
                    ["Uuid"] = "uuid",
                    ["Created"] = "created",
                    ["Updated"] = "updated",
                    ["Version"] = "version",
                    ["Name"] = "name",
                    ["Description"] = "description",
                    ["IsEnabled"] = "is_enabled",
                    ["IsBuiltin"] = "is_builtin",
                    ["IsDeleted"] = "is_deleted",
                    ["IdentityProviderTypeId"] = "identity_provider_type_id",
                }),
                Ids = ["Id"],
                ReadProperties = ["Id", "Uuid", "Created", "Updated", "Version", "Name", "Description", "IsEnabled", "IsBuiltin", "IsDeleted", "IdentityProviderTypeId"],
                CreateProperties = ["Name", "Description", "IsEnabled", "IsBuiltin", "IsDeleted"],
                UpdateProperties = ["Uuid", "Name", "Description", "IsEnabled", "IsBuiltin", "IsDeleted"],
                Schema = new(new Dictionary<string, SchemaColumn>
                {
                    ["Id"] = new("biginteger", false, false, true),
                    ["Uuid"] = new("uuid", false, true),
                    ["Created"] = new("datetime", false, true),
                    ["Updated"] = new("datetime", false, true),
                    ["Version"] = new("binary", false, true),
                    ["Name"] = new("string", false, false),
                    ["Description"] = new("string", true, false),
                    ["IsEnabled"] = new("boolean", false, true),
                    ["IsBuiltin"] = new("boolean", false, true),
                    ["IsDeleted"] = new("boolean", false, true),
                    ["IdentityProviderTypeName"] = new("string", false, false),
                }),
            })
            .Add("sqlite", new()
            {
                Entity = "IdentityProvider",
                EntityMapper = new DictionaryMapper<string>(new Dictionary<string, string> { ["IdentityProvider"] = "identity_providers" }),
                PropertyMappings = new DictionaryMapper<string>(new Dictionary<string, string>
                {
                    ["Id"] = "id",
                    ["Uuid"] = "uuid",
                    ["Created"] = "created",
                    ["Updated"] = "updated",
                    ["Version"] = "version",
                    ["Name"] = "name",
                    ["Description"] = "description",
                    ["IsEnabled"] = "is_enabled",
                    ["IsBuiltin"] = "is_builtin",
                    ["IsDeleted"] = "is_deleted",
                    ["IdentityProviderTypeId"] = "identity_provider_type_id",
                }),
                Ids = ["Id"],
                ReadProperties = ["Id", "Uuid", "Created", "Updated", "Version", "Name", "Description", "IsEnabled", "IsBuiltin", "IsDeleted", "IdentityProviderTypeId"],
                CreateProperties = ["Uuid", "Created", "Version", "Name", "Description", "IsEnabled", "IsBuiltin", "IsDeleted"],
                UpdateProperties = ["Uuid", "Created", "Version", "Name", "Description", "IsEnabled", "IsBuiltin", "IsDeleted"],
                Schema = new(new Dictionary<string, SchemaColumn>
                {
                    ["Id"] = new("biginteger", false, false, true),
                    ["Uuid"] = new("uuid", false, true),
                    ["Created"] = new("datetime", false, true),
                    ["Updated"] = new("datetime", false, true),
                    ["Version"] = new("binary", false, true),
                    ["Name"] = new("string", false, false),
                    ["Description"] = new("string", true, false),
                    ["IsEnabled"] = new("boolean", false, true),
                    ["IsBuiltin"] = new("boolean", false, true),
                    ["IsDeleted"] = new("boolean", false, true),
                    ["IdentityProviderTypeName"] = new("string", false, false),
                }),
            })
            .For(connection);
}
