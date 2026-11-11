using Datasources;

public sealed class TokenTypesRepository : ReadonlyRepository<Backend.Types.Datasource.TokenType>
{
    public TokenTypesRepository(IConnection connection) : base(connection, Options(connection)) { }

    public static IReadonlyRepository<Backend.Types.Datasource.TokenType> CreateReadonly(IConnection connection) =>
        new TokenTypesRepository(connection);

    static ReadonlyRepositoryMappingOptions<Backend.Types.Datasource.TokenType> Options(IConnection connection) =>
        new CRUDRepositoryBuilder<Backend.Types.Datasource.TokenType>()
            .Add(new()
            {
                Entity = "TokenType",
                EntityMapper = new DictionaryMapper<string>(new Dictionary<string, string> { ["TokenType"] = "token_types" }),
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
                    ["Description"] = new("string", false, false),
                }),
            })
            .Add("sqlite", new()
            {
                Entity = "TokenType",
                EntityMapper = new DictionaryMapper<string>(new Dictionary<string, string> { ["TokenType"] = "token_types" }),
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
                    ["Description"] = new("string", false, false),
                }),
            })
            .For(connection);
}
