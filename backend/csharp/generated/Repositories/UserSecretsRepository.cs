using Datasources;

public sealed class UserSecretsRepository : CRUDRepository<Backend.Types.Datasource.UserSecret>
{
    public UserSecretsRepository(IConnection connection) : base(connection, Options(connection)) { }

    public static IReadonlyRepository<Backend.Types.Datasource.UserSecret> CreateReadonly(IConnection connection) =>
        new ReadonlyRepository<Backend.Types.Datasource.UserSecret>(connection, Options(connection));

    static CRUDRepositoryOptions<Backend.Types.Datasource.UserSecret> Options(IConnection connection) =>
        new CRUDRepositoryBuilder<Backend.Types.Datasource.UserSecret>()
            .Add(new()
            {
                Entity = "UserSecret",
                EntityMapper = new DictionaryMapper<string>(new Dictionary<string, string> { ["UserSecret"] = "user_secrets" }),
                PropertyMappings = new DictionaryMapper<string>(new Dictionary<string, string>
                {
                    ["Id"] = "id",
                    ["Uuid"] = "uuid",
                    ["Created"] = "created",
                    ["Updated"] = "updated",
                    ["Version"] = "version",
                    ["UserId"] = "user_id",
                    ["SecretId"] = "secret_id",
                }),
                Ids = ["Id"],
                ReadProperties = ["Id", "Uuid", "Created", "Updated", "Version", "UserId", "SecretId"],
                CreateProperties = ["UserId", "SecretId"],
                UpdateProperties = ["Uuid", "UserId", "SecretId"],
                Schema = new(new Dictionary<string, SchemaColumn>
                {
                    ["Id"] = new("biginteger", false, false, true),
                    ["Uuid"] = new("uuid", false, true),
                    ["Created"] = new("datetime", false, true),
                    ["Updated"] = new("datetime", false, true),
                    ["Version"] = new("binary", false, true),
                    ["UserId"] = new("biginteger", false, false),
                    ["SecretId"] = new("biginteger", false, false),
                }),
            })
            .Add("sqlite", new()
            {
                Entity = "UserSecret",
                EntityMapper = new DictionaryMapper<string>(new Dictionary<string, string> { ["UserSecret"] = "user_secrets" }),
                PropertyMappings = new DictionaryMapper<string>(new Dictionary<string, string>
                {
                    ["Id"] = "id",
                    ["Uuid"] = "uuid",
                    ["Created"] = "created",
                    ["Updated"] = "updated",
                    ["Version"] = "version",
                    ["UserId"] = "user_id",
                    ["SecretId"] = "secret_id",
                }),
                Ids = ["Id"],
                ReadProperties = ["Id", "Uuid", "Created", "Updated", "Version", "UserId", "SecretId"],
                CreateProperties = ["Uuid", "Created", "Version", "UserId", "SecretId"],
                UpdateProperties = ["Uuid", "Created", "Version", "UserId", "SecretId"],
                Schema = new(new Dictionary<string, SchemaColumn>
                {
                    ["Id"] = new("biginteger", false, false, true),
                    ["Uuid"] = new("uuid", false, true),
                    ["Created"] = new("datetime", false, true),
                    ["Updated"] = new("datetime", false, true),
                    ["Version"] = new("binary", false, true),
                    ["UserId"] = new("biginteger", false, false),
                    ["SecretId"] = new("biginteger", false, false),
                }),
            })
            .For(connection);
}
