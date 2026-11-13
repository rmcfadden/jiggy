using Datasources;

public sealed class EmailTokensRepository : CRUDRepository<Backend.Types.Datasource.EmailToken>
{
    public EmailTokensRepository(IConnection connection) : base(connection, Options(connection)) { }

    public static IReadonlyRepository<Backend.Types.Datasource.EmailToken> CreateReadonly(IConnection connection) =>
        new ReadonlyRepository<Backend.Types.Datasource.EmailToken>(connection, Options(connection));

    static CRUDRepositoryOptions<Backend.Types.Datasource.EmailToken> Options(IConnection connection) =>
        new CRUDRepositoryBuilder<Backend.Types.Datasource.EmailToken>()
            .Add(new()
            {
                Entity = "EmailToken",
                EntityMapper = new DictionaryMapper<string>(new Dictionary<string, string> { ["EmailToken"] = "email_tokens" }),
                PropertyMappings = new DictionaryMapper<string>(new Dictionary<string, string>
                {
                    ["Id"] = "id",
                    ["Uuid"] = "uuid",
                    ["Created"] = "created",
                    ["Updated"] = "updated",
                    ["Version"] = "version",
                    ["EmailId"] = "email_id",
                    ["TokenId"] = "token_id",
                }),
                Ids = ["Id"],
                ReadProperties = ["Id", "Uuid", "Created", "Updated", "Version", "EmailId", "TokenId"],
                CreateProperties = ["EmailId", "TokenId"],
                UpdateProperties = ["Uuid", "EmailId", "TokenId"],
                Schema = new(new Dictionary<string, SchemaColumn>
                {
                    ["Id"] = new("biginteger", false, false, true),
                    ["Uuid"] = new("uuid", false, true),
                    ["Created"] = new("datetime", false, true),
                    ["Updated"] = new("datetime", false, true),
                    ["Version"] = new("binary", false, true),
                    ["EmailId"] = new("biginteger", false, false),
                    ["TokenId"] = new("biginteger", false, false),
                }),
            })
            .Add("sqlite", new()
            {
                Entity = "EmailToken",
                EntityMapper = new DictionaryMapper<string>(new Dictionary<string, string> { ["EmailToken"] = "email_tokens" }),
                PropertyMappings = new DictionaryMapper<string>(new Dictionary<string, string>
                {
                    ["Id"] = "id",
                    ["Uuid"] = "uuid",
                    ["Created"] = "created",
                    ["Updated"] = "updated",
                    ["Version"] = "version",
                    ["EmailId"] = "email_id",
                    ["TokenId"] = "token_id",
                }),
                Ids = ["Id"],
                ReadProperties = ["Id", "Uuid", "Created", "Updated", "Version", "EmailId", "TokenId"],
                CreateProperties = ["Uuid", "Created", "Version", "EmailId", "TokenId"],
                UpdateProperties = ["Uuid", "Created", "Version", "EmailId", "TokenId"],
                Schema = new(new Dictionary<string, SchemaColumn>
                {
                    ["Id"] = new("biginteger", false, false, true),
                    ["Uuid"] = new("uuid", false, true),
                    ["Created"] = new("datetime", false, true),
                    ["Updated"] = new("datetime", false, true),
                    ["Version"] = new("binary", false, true),
                    ["EmailId"] = new("biginteger", false, false),
                    ["TokenId"] = new("biginteger", false, false),
                }),
            })
            .For(connection);
}
