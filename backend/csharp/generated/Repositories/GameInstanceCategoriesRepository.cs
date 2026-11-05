using Datasources;

public sealed class GameInstanceCategoriesRepository : CRUDRepository<Backend.Types.Datasource.GameInstanceCategory>
{
    public GameInstanceCategoriesRepository(IConnection connection) : base(connection, Options(connection)) { }

    public static IReadonlyRepository<Backend.Types.Datasource.GameInstanceCategory> CreateReadonly(IConnection connection) =>
        new ReadonlyRepository<Backend.Types.Datasource.GameInstanceCategory>(connection, Options(connection));

    static CRUDRepositoryOptions<Backend.Types.Datasource.GameInstanceCategory> Options(IConnection connection) =>
        new CRUDRepositoryBuilder<Backend.Types.Datasource.GameInstanceCategory>()
            .Add(new()
            {
                Entity = "GameInstanceCategory",
                EntityMapper = new DictionaryMapper<string>(new Dictionary<string, string> { ["GameInstanceCategory"] = "game_instance_categories" }),
                PropertyMappings = new DictionaryMapper<string>(new Dictionary<string, string>
                {
                    ["Id"] = "id",
                    ["Uuid"] = "uuid",
                    ["Created"] = "created",
                    ["Updated"] = "updated",
                    ["Version"] = "version",
                    ["GameInstanceId"] = "game_instance_id",
                    ["CategoryId"] = "category_id",
                }),
                Ids = ["Id"],
                ReadProperties = ["Id", "Uuid", "Created", "Updated", "Version", "GameInstanceId", "CategoryId"],
                CreateProperties = ["GameInstanceId", "CategoryId"],
                UpdateProperties = ["Uuid", "GameInstanceId", "CategoryId"],
                Schema = new(new Dictionary<string, SchemaColumn>
                {
                    ["Id"] = new("biginteger", false, false, true),
                    ["Uuid"] = new("uuid", false, true),
                    ["Created"] = new("datetime", false, true),
                    ["Updated"] = new("datetime", false, true),
                    ["Version"] = new("binary", false, true),
                    ["GameInstanceId"] = new("biginteger", false, false),
                    ["CategoryId"] = new("biginteger", false, false),
                }),
            })
            .Add("sqlite", new()
            {
                Entity = "GameInstanceCategory",
                EntityMapper = new DictionaryMapper<string>(new Dictionary<string, string> { ["GameInstanceCategory"] = "game_instance_categories" }),
                PropertyMappings = new DictionaryMapper<string>(new Dictionary<string, string>
                {
                    ["Id"] = "id",
                    ["Uuid"] = "uuid",
                    ["Created"] = "created",
                    ["Updated"] = "updated",
                    ["Version"] = "version",
                    ["GameInstanceId"] = "game_instance_id",
                    ["CategoryId"] = "category_id",
                }),
                Ids = ["Id"],
                ReadProperties = ["Id", "Uuid", "Created", "Updated", "Version", "GameInstanceId", "CategoryId"],
                CreateProperties = ["Uuid", "Created", "Version", "GameInstanceId", "CategoryId"],
                UpdateProperties = ["Uuid", "Created", "Version", "GameInstanceId", "CategoryId"],
                Schema = new(new Dictionary<string, SchemaColumn>
                {
                    ["Id"] = new("biginteger", false, false, true),
                    ["Uuid"] = new("uuid", false, true),
                    ["Created"] = new("datetime", false, true),
                    ["Updated"] = new("datetime", false, true),
                    ["Version"] = new("binary", false, true),
                    ["GameInstanceId"] = new("biginteger", false, false),
                    ["CategoryId"] = new("biginteger", false, false),
                }),
            })
            .For(connection);
}
