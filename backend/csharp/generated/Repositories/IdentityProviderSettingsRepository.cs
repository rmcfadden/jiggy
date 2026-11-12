using Datasources;

public sealed class IdentityProviderSettingsRepository : CRUDRepository<Backend.Types.View.IdentityProviderSetting>
{
    public IdentityProviderSettingsRepository(IConnection connection) : base(connection, Options(connection)) { }

    public static IReadonlyRepository<Backend.Types.View.IdentityProviderSetting> CreateReadonly(IConnection connection) =>
        new ReadonlyRepository<Backend.Types.View.IdentityProviderSetting>(connection, Options(connection));

    static CRUDRepositoryOptions<Backend.Types.View.IdentityProviderSetting> Options(IConnection connection) =>
        new CRUDRepositoryBuilder<Backend.Types.View.IdentityProviderSetting>()
            .Add(new()
            {
                Entity = "IdentityProviderSetting",
                EntityMapper = new DictionaryMapper<string>(new Dictionary<string, string> { ["IdentityProviderSetting"] = "identity_provider_settings" }),
                PropertyMappings = new DictionaryMapper<string>(new Dictionary<string, string>
                {
                    ["Id"] = "id",
                    ["Uuid"] = "uuid",
                    ["Created"] = "created",
                    ["Updated"] = "updated",
                    ["Version"] = "version",
                    ["IdentityProviderId"] = "identity_provider_id",
                    ["Name"] = "name",
                    ["Value"] = "value",
                }),
                Ids = ["Id"],
                ReadProperties = ["Id", "Uuid", "Created", "Updated", "Version", "IdentityProviderId", "Name", "Value"],
                CreateProperties = ["IdentityProviderId", "Name", "Value"],
                UpdateProperties = ["Uuid", "IdentityProviderId", "Name", "Value"],
                Schema = new(new Dictionary<string, SchemaColumn>
                {
                    ["Id"] = new("biginteger", false, false, true),
                    ["Uuid"] = new("uuid", false, true),
                    ["Created"] = new("datetime", false, true),
                    ["Updated"] = new("datetime", false, true),
                    ["Version"] = new("binary", false, true),
                    ["IdentityProviderId"] = new("biginteger", false, false),
                    ["Name"] = new("string", false, false),
                    ["Value"] = new("string", false, false),
                }),
            })
            .Add("sqlite", new()
            {
                Entity = "IdentityProviderSetting",
                EntityMapper = new DictionaryMapper<string>(new Dictionary<string, string> { ["IdentityProviderSetting"] = "identity_provider_settings" }),
                PropertyMappings = new DictionaryMapper<string>(new Dictionary<string, string>
                {
                    ["Id"] = "id",
                    ["Uuid"] = "uuid",
                    ["Created"] = "created",
                    ["Updated"] = "updated",
                    ["Version"] = "version",
                    ["IdentityProviderId"] = "identity_provider_id",
                    ["Name"] = "name",
                    ["Value"] = "value",
                }),
                Ids = ["Id"],
                ReadProperties = ["Id", "Uuid", "Created", "Updated", "Version", "IdentityProviderId", "Name", "Value"],
                CreateProperties = ["Uuid", "Created", "Version", "IdentityProviderId", "Name", "Value"],
                UpdateProperties = ["Uuid", "Created", "Version", "IdentityProviderId", "Name", "Value"],
                Schema = new(new Dictionary<string, SchemaColumn>
                {
                    ["Id"] = new("biginteger", false, false, true),
                    ["Uuid"] = new("uuid", false, true),
                    ["Created"] = new("datetime", false, true),
                    ["Updated"] = new("datetime", false, true),
                    ["Version"] = new("binary", false, true),
                    ["IdentityProviderId"] = new("biginteger", false, false),
                    ["Name"] = new("string", false, false),
                    ["Value"] = new("string", false, false),
                }),
            })
            .For(connection);
}
