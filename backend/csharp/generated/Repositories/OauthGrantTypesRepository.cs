using Datasources;

public sealed class OauthGrantTypesRepository : ReadonlyRepository<Backend.Types.Datasource.OauthGrantType>
{
    public OauthGrantTypesRepository(IConnection connection) : base(connection, Options(connection)) { }

    public static IReadonlyRepository<Backend.Types.Datasource.OauthGrantType> CreateReadonly(IConnection connection) =>
        new OauthGrantTypesRepository(connection);

    static ReadonlyRepositoryMappingOptions<Backend.Types.Datasource.OauthGrantType> Options(IConnection connection) =>
        new CRUDRepositoryBuilder<Backend.Types.Datasource.OauthGrantType>()
            .Add(new()
            {
                Entity = "OauthGrantType",
                EntityMapper = new DictionaryMapper<string>(new Dictionary<string, string> { ["OauthGrantType"] = "oauth_grant_types" }),
                PropertyMappings = new DictionaryMapper<string>(new Dictionary<string, string>
                {
                    ["Id"] = "id",
                    ["Uuid"] = "uuid",
                    ["Created"] = "created",
                    ["Updated"] = "updated",
                    ["Version"] = "version",
                    ["Name"] = "name",
                    ["Description"] = "description",
                    ["IsCustom"] = "is_custom",
                    ["IsEnabled"] = "is_enabled",
                    ["IsLegacy"] = "is_legacy",
                }),
                ReadProperties = ["Id", "Uuid", "Created", "Updated", "Version", "Name", "Description", "IsCustom", "IsEnabled", "IsLegacy"],
                Schema = new(new Dictionary<string, SchemaColumn>
                {
                    ["Id"] = new("biginteger", false, false, true),
                    ["Uuid"] = new("uuid", false, true),
                    ["Created"] = new("datetime", false, true),
                    ["Updated"] = new("datetime", false, true),
                    ["Version"] = new("binary", false, true),
                    ["Name"] = new("string", false, false),
                    ["Description"] = new("string", false, false),
                    ["IsCustom"] = new("boolean", false, true),
                    ["IsEnabled"] = new("boolean", false, true),
                    ["IsLegacy"] = new("boolean", false, true),
                }),
            })
            .Add("sqlite", new()
            {
                Entity = "OauthGrantType",
                EntityMapper = new DictionaryMapper<string>(new Dictionary<string, string> { ["OauthGrantType"] = "oauth_grant_types" }),
                PropertyMappings = new DictionaryMapper<string>(new Dictionary<string, string>
                {
                    ["Id"] = "id",
                    ["Uuid"] = "uuid",
                    ["Created"] = "created",
                    ["Updated"] = "updated",
                    ["Version"] = "version",
                    ["Name"] = "name",
                    ["Description"] = "description",
                    ["IsCustom"] = "is_custom",
                    ["IsEnabled"] = "is_enabled",
                    ["IsLegacy"] = "is_legacy",
                }),
                ReadProperties = ["Id", "Uuid", "Created", "Updated", "Version", "Name", "Description", "IsCustom", "IsEnabled", "IsLegacy"],
                Schema = new(new Dictionary<string, SchemaColumn>
                {
                    ["Id"] = new("biginteger", false, false, true),
                    ["Uuid"] = new("uuid", false, true),
                    ["Created"] = new("datetime", false, true),
                    ["Updated"] = new("datetime", false, true),
                    ["Version"] = new("binary", false, true),
                    ["Name"] = new("string", false, false),
                    ["Description"] = new("string", false, false),
                    ["IsCustom"] = new("boolean", false, true),
                    ["IsEnabled"] = new("boolean", false, true),
                    ["IsLegacy"] = new("boolean", false, true),
                }),
            })
            .For(connection);
}
