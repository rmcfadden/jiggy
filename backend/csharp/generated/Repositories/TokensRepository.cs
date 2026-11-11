using Datasources;

public sealed class TokensRepository : CRUDRepository<Backend.Types.View.Token>
{
    public TokenTypesRepository TokenType { get; }

    public TokensRepository(IConnection connection) : base(connection, Options(connection))
    {
        TokenType = new TokenTypesRepository(connection);
        AddEnriched(new("TokenTypeName", "TokenTypeId", "Id", "Name"), TokenType);
    }

    public static IReadonlyRepository<Backend.Types.View.Token> CreateReadonly(IConnection connection)
    {
        var repo = new ReadonlyRepository<Backend.Types.View.Token>(connection, Options(connection));
        var TokenType = new TokenTypesRepository(connection);
        repo.AddEnriched(new("TokenTypeName", "TokenTypeId", "Id", "Name"), TokenType);
        return repo;
    }

    static CRUDRepositoryOptions<Backend.Types.View.Token> Options(IConnection connection) =>
        new CRUDRepositoryBuilder<Backend.Types.View.Token>()
            .Add(new()
            {
                Entity = "Token",
                EntityMapper = new DictionaryMapper<string>(new Dictionary<string, string> { ["Token"] = "tokens_bases" }),
                PropertyMappings = new DictionaryMapper<string>(new Dictionary<string, string>
                {
                    ["Id"] = "id",
                    ["Uuid"] = "uuid",
                    ["Created"] = "created",
                    ["Updated"] = "updated",
                    ["Version"] = "version",
                    ["TokenTypeId"] = "token_type_id",
                    ["Name"] = "name",
                    ["Secret"] = "secret",
                    ["IsEnabled"] = "is_enabled",
                    ["Expires"] = "expires",
                    ["Revoked"] = "revoked",
                    ["IsDeleted"] = "is_deleted",
                    ["Description"] = "description",
                }),
                Ids = ["Id"],
                ReadProperties = ["Id", "Uuid", "Created", "Updated", "Version", "TokenTypeId", "Name", "Secret", "IsEnabled", "Expires", "Revoked", "IsDeleted", "Description"],
                CreateProperties = ["TokenTypeId", "Name", "Secret", "IsEnabled", "Expires", "Revoked", "IsDeleted", "Description"],
                UpdateProperties = ["Uuid", "TokenTypeId", "Name", "Secret", "IsEnabled", "Expires", "Revoked", "IsDeleted", "Description"],
                Schema = new(new Dictionary<string, SchemaColumn>
                {
                    ["Id"] = new("biginteger", false, false, true),
                    ["Uuid"] = new("uuid", false, true),
                    ["Created"] = new("datetime", false, true),
                    ["Updated"] = new("datetime", false, true),
                    ["Version"] = new("binary", false, true),
                    ["TokenTypeId"] = new("biginteger", false, false),
                    ["Name"] = new("string", false, false),
                    ["Secret"] = new("string", false, false),
                    ["IsEnabled"] = new("boolean", false, true),
                    ["Expires"] = new("datetime", false, false),
                    ["Revoked"] = new("datetime", true, false),
                    ["IsDeleted"] = new("boolean", false, true),
                    ["TokenTypeName"] = new("string", false, false),
                    ["Description"] = new("string", false, false),
                }),
            })
            .Add("sqlite", new()
            {
                Entity = "Token",
                EntityMapper = new DictionaryMapper<string>(new Dictionary<string, string> { ["Token"] = "tokens_bases" }),
                PropertyMappings = new DictionaryMapper<string>(new Dictionary<string, string>
                {
                    ["Id"] = "id",
                    ["Uuid"] = "uuid",
                    ["Created"] = "created",
                    ["Updated"] = "updated",
                    ["Version"] = "version",
                    ["TokenTypeId"] = "token_type_id",
                    ["Name"] = "name",
                    ["Secret"] = "secret",
                    ["IsEnabled"] = "is_enabled",
                    ["Expires"] = "expires",
                    ["Revoked"] = "revoked",
                    ["IsDeleted"] = "is_deleted",
                    ["Description"] = "description",
                }),
                Ids = ["Id"],
                ReadProperties = ["Id", "Uuid", "Created", "Updated", "Version", "TokenTypeId", "Name", "Secret", "IsEnabled", "Expires", "Revoked", "IsDeleted", "Description"],
                CreateProperties = ["Uuid", "Created", "Version", "TokenTypeId", "Name", "Secret", "IsEnabled", "Expires", "Revoked", "IsDeleted", "Description"],
                UpdateProperties = ["Uuid", "Created", "Version", "TokenTypeId", "Name", "Secret", "IsEnabled", "Expires", "Revoked", "IsDeleted", "Description"],
                Schema = new(new Dictionary<string, SchemaColumn>
                {
                    ["Id"] = new("biginteger", false, false, true),
                    ["Uuid"] = new("uuid", false, true),
                    ["Created"] = new("datetime", false, true),
                    ["Updated"] = new("datetime", false, true),
                    ["Version"] = new("binary", false, true),
                    ["TokenTypeId"] = new("biginteger", false, false),
                    ["Name"] = new("string", false, false),
                    ["Secret"] = new("string", false, false),
                    ["IsEnabled"] = new("boolean", false, true),
                    ["Expires"] = new("datetime", false, false),
                    ["Revoked"] = new("datetime", true, false),
                    ["IsDeleted"] = new("boolean", false, true),
                    ["TokenTypeName"] = new("string", false, false),
                    ["Description"] = new("string", false, false),
                }),
            })
            .For(connection);
}
