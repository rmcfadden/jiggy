using Datasources;

public sealed class GameParentCategoriesRepository : CRUDRepository<Backend.Types.Datasource.GameParentCategory>
{
    public GameParentCategoriesRepository(IConnection connection) : base(connection, Options(connection)) { }

    public static IReadonlyRepository<Backend.Types.Datasource.GameParentCategory> CreateReadonly(IConnection connection) =>
        new ReadonlyRepository<Backend.Types.Datasource.GameParentCategory>(connection, Options(connection));

    static CRUDRepositoryOptions<Backend.Types.Datasource.GameParentCategory> Options(IConnection connection) =>
        new CRUDRepositoryBuilder<Backend.Types.Datasource.GameParentCategory>()
            .Add(new()
            {
                Entity = "GameParentCategory",
                EntityMapper = new DictionaryMapper<string>(new Dictionary<string, string> { ["GameParentCategory"] = "game_parent_categories" }),
                PropertyMappings = new DictionaryMapper<string>(new Dictionary<string, string>
                {
                    ["Id"] = "id",
                    ["Uuid"] = "uuid",
                    ["Created"] = "created",
                    ["Updated"] = "updated",
                    ["Version"] = "version",
                    ["GameParentId"] = "game_parent_id",
                    ["CategoryId"] = "category_id",
                }),
                Ids = ["Id"],
                ReadProperties = ["Id", "Uuid", "Created", "Updated", "Version", "GameParentId", "CategoryId"],
                CreateProperties = ["GameParentId", "CategoryId"],
                UpdateProperties = ["Uuid", "GameParentId", "CategoryId"],
                Schema = new(new Dictionary<string, SchemaColumn>
                {
                    ["Id"] = new("biginteger", false, false, true),
                    ["Uuid"] = new("uuid", false, true),
                    ["Created"] = new("datetime", false, true),
                    ["Updated"] = new("datetime", false, true),
                    ["Version"] = new("binary", false, true),
                    ["GameParentId"] = new("biginteger", false, false),
                    ["CategoryId"] = new("biginteger", false, false),
                }),
            })
            .Add("sqlite", new()
            {
                Entity = "GameParentCategory",
                EntityMapper = new DictionaryMapper<string>(new Dictionary<string, string> { ["GameParentCategory"] = "game_parent_categories" }),
                PropertyMappings = new DictionaryMapper<string>(new Dictionary<string, string>
                {
                    ["Id"] = "id",
                    ["Uuid"] = "uuid",
                    ["Created"] = "created",
                    ["Updated"] = "updated",
                    ["Version"] = "version",
                    ["GameParentId"] = "game_parent_id",
                    ["CategoryId"] = "category_id",
                }),
                Ids = ["Id"],
                ReadProperties = ["Id", "Uuid", "Created", "Updated", "Version", "GameParentId", "CategoryId"],
                CreateProperties = ["Uuid", "Created", "Version", "GameParentId", "CategoryId"],
                UpdateProperties = ["Uuid", "Created", "Version", "GameParentId", "CategoryId"],
                Schema = new(new Dictionary<string, SchemaColumn>
                {
                    ["Id"] = new("biginteger", false, false, true),
                    ["Uuid"] = new("uuid", false, true),
                    ["Created"] = new("datetime", false, true),
                    ["Updated"] = new("datetime", false, true),
                    ["Version"] = new("binary", false, true),
                    ["GameParentId"] = new("biginteger", false, false),
                    ["CategoryId"] = new("biginteger", false, false),
                }),
            })
            .For(connection);
}
