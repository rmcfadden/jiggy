using Datasources;

public sealed class AuthenticationMethodsRepository : CRUDRepository<Backend.Types.View.AuthenticationMethod>
{
    public AuthenticationMethodsRepository(IConnection connection) : base(connection, Options(connection)) { }

    public static IReadonlyRepository<Backend.Types.View.AuthenticationMethod> CreateReadonly(IConnection connection) =>
        new ReadonlyRepository<Backend.Types.View.AuthenticationMethod>(connection, Options(connection));

    static CRUDRepositoryOptions<Backend.Types.View.AuthenticationMethod> Options(IConnection connection) =>
        new CRUDRepositoryBuilder<Backend.Types.View.AuthenticationMethod>()
            .Add(new()
            {
                Entity = "AuthenticationMethod",
                EntityMapper = new DictionaryMapper<string>(new Dictionary<string, string> { ["AuthenticationMethod"] = "authentication_methods_bases" }),
                PropertyMappings = new DictionaryMapper<string>(new Dictionary<string, string>
                {
                    ["Id"] = "id",
                    ["Uuid"] = "uuid",
                    ["Created"] = "created",
                    ["Updated"] = "updated",
                    ["Version"] = "version",
                    ["Name"] = "name",
                    ["Description"] = "description",
                    ["IsDefault"] = "is_default",
                    ["IsEnabled"] = "is_enabled",
                }),
                Ids = ["Id"],
                ReadProperties = ["Id", "Uuid", "Created", "Updated", "Version", "Name", "Description", "IsDefault", "IsEnabled"],
                CreateProperties = ["Name", "Description", "IsDefault", "IsEnabled"],
                UpdateProperties = ["Uuid", "Name", "Description", "IsDefault", "IsEnabled"],
                Schema = new(new Dictionary<string, SchemaColumn>
                {
                    ["Id"] = new("biginteger", false, false, true),
                    ["Uuid"] = new("uuid", false, true),
                    ["Created"] = new("datetime", false, true),
                    ["Updated"] = new("datetime", false, true),
                    ["Version"] = new("binary", false, true),
                    ["Name"] = new("string", false, false),
                    ["Description"] = new("string", true, false),
                    ["IsDefault"] = new("boolean", false, true),
                    ["IsEnabled"] = new("boolean", false, true),
                }),
            })
            .Add("sqlite", new()
            {
                Entity = "AuthenticationMethod",
                EntityMapper = new DictionaryMapper<string>(new Dictionary<string, string> { ["AuthenticationMethod"] = "authentication_methods_bases" }),
                PropertyMappings = new DictionaryMapper<string>(new Dictionary<string, string>
                {
                    ["Id"] = "id",
                    ["Uuid"] = "uuid",
                    ["Created"] = "created",
                    ["Updated"] = "updated",
                    ["Version"] = "version",
                    ["Name"] = "name",
                    ["Description"] = "description",
                    ["IsDefault"] = "is_default",
                    ["IsEnabled"] = "is_enabled",
                }),
                Ids = ["Id"],
                ReadProperties = ["Id", "Uuid", "Created", "Updated", "Version", "Name", "Description", "IsDefault", "IsEnabled"],
                CreateProperties = ["Uuid", "Created", "Version", "Name", "Description", "IsDefault", "IsEnabled"],
                UpdateProperties = ["Uuid", "Created", "Version", "Name", "Description", "IsDefault", "IsEnabled"],
                Schema = new(new Dictionary<string, SchemaColumn>
                {
                    ["Id"] = new("biginteger", false, false, true),
                    ["Uuid"] = new("uuid", false, true),
                    ["Created"] = new("datetime", false, true),
                    ["Updated"] = new("datetime", false, true),
                    ["Version"] = new("binary", false, true),
                    ["Name"] = new("string", false, false),
                    ["Description"] = new("string", true, false),
                    ["IsDefault"] = new("boolean", false, true),
                    ["IsEnabled"] = new("boolean", false, true),
                }),
            })
            .For(connection);
}
