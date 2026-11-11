using Datasources;

public sealed class UserTokensRepository : CRUDRepository<Backend.Types.Datasource.UserToken>
{
    public UserTokensRepository(IConnection connection) : base(connection, Options(connection)) { }

    public static IReadonlyRepository<Backend.Types.Datasource.UserToken> CreateReadonly(IConnection connection) =>
        new ReadonlyRepository<Backend.Types.Datasource.UserToken>(connection, Options(connection));

    static CRUDRepositoryOptions<Backend.Types.Datasource.UserToken> Options(IConnection connection) =>
        new CRUDRepositoryBuilder<Backend.Types.Datasource.UserToken>()
            .Add(new()
            {
                Entity = "UserToken",
                EntityMapper = new DictionaryMapper<string>(new Dictionary<string, string> { ["UserToken"] = "user_tokens" }),
                PropertyMappings = new DictionaryMapper<string>(new Dictionary<string, string>
                {
                    ["Id"] = "id",
                    ["Uuid"] = "uuid",
                    ["Created"] = "created",
                    ["Updated"] = "updated",
                    ["Version"] = "version",
                    ["UserId"] = "user_id",
                    ["TokenId"] = "token_id",
                }),
                Ids = ["Id"],
                ReadProperties = ["Id", "Uuid", "Created", "Updated", "Version", "UserId", "TokenId"],
                CreateProperties = ["UserId", "TokenId"],
                UpdateProperties = ["Uuid", "UserId", "TokenId"],
                Schema = new(new Dictionary<string, SchemaColumn>
                {
                    ["Id"] = new("biginteger", false, false, true),
                    ["Uuid"] = new("uuid", false, true),
                    ["Created"] = new("datetime", false, true),
                    ["Updated"] = new("datetime", false, true),
                    ["Version"] = new("binary", false, true),
                    ["UserId"] = new("biginteger", false, false),
                    ["TokenId"] = new("biginteger", false, false),
                }),
            })
            .Add("sqlite", new()
            {
                Entity = "UserToken",
                EntityMapper = new DictionaryMapper<string>(new Dictionary<string, string> { ["UserToken"] = "user_tokens" }),
                PropertyMappings = new DictionaryMapper<string>(new Dictionary<string, string>
                {
                    ["Id"] = "id",
                    ["Uuid"] = "uuid",
                    ["Created"] = "created",
                    ["Updated"] = "updated",
                    ["Version"] = "version",
                    ["UserId"] = "user_id",
                    ["TokenId"] = "token_id",
                }),
                Ids = ["Id"],
                ReadProperties = ["Id", "Uuid", "Created", "Updated", "Version", "UserId", "TokenId"],
                CreateProperties = ["Uuid", "Created", "Version", "UserId", "TokenId"],
                UpdateProperties = ["Uuid", "Created", "Version", "UserId", "TokenId"],
                Schema = new(new Dictionary<string, SchemaColumn>
                {
                    ["Id"] = new("biginteger", false, false, true),
                    ["Uuid"] = new("uuid", false, true),
                    ["Created"] = new("datetime", false, true),
                    ["Updated"] = new("datetime", false, true),
                    ["Version"] = new("binary", false, true),
                    ["UserId"] = new("biginteger", false, false),
                    ["TokenId"] = new("biginteger", false, false),
                }),
            })
            .For(connection);
}
