using Datasources;

public sealed class GameStatesRepository : CRUDRepository<Backend.Types.Datasource.GameStates>
{
    public GameStatesRepository(IConnection connection) : base(connection, Options(connection)) { }

    public static IReadonlyRepository<Backend.Types.Datasource.GameStates> CreateReadonly(IConnection connection) =>
        new ReadonlyRepository<Backend.Types.Datasource.GameStates>(connection, Options(connection));

    static CRUDRepositoryOptions<Backend.Types.Datasource.GameStates> Options(IConnection connection) =>
        new CRUDRepositoryBuilder<Backend.Types.Datasource.GameStates>()
            .Add(new()
            {
                Entity = "GameStates",
                EntityMapper = new DictionaryMapper<string>(new Dictionary<string, string> { ["GameStates"] = "game_states" }),
                PropertyMappings = new DictionaryMapper<string>(new Dictionary<string, string>
                {
                    ["Id"] = "id",
                    ["Uuid"] = "uuid",
                    ["Created"] = "created",
                    ["Updated"] = "updated",
                    ["Version"] = "version",
                    ["GameId"] = "game_id",
                    ["UserId"] = "user_id",
                    ["State"] = "state",
                }),
                Ids = ["Id"],
                ReadProperties = ["Id", "Uuid", "Created", "Updated", "Version", "GameId", "UserId", "State"],
                CreateProperties = ["GameId", "UserId", "State"],
                UpdateProperties = ["Uuid", "GameId", "UserId", "State"],
                Schema = new(new Dictionary<string, SchemaColumn>
                {
                    ["Id"] = new("biginteger", false, false, true),
                    ["Uuid"] = new("uuid", false, true),
                    ["Created"] = new("datetime", false, true),
                    ["Updated"] = new("datetime", false, true),
                    ["Version"] = new("binary", false, true),
                    ["GameId"] = new("biginteger", false, false),
                    ["UserId"] = new("biginteger", false, false),
                    ["State"] = new("string", false, false),
                }),
            })
            .Add("sqlite", new()
            {
                Entity = "GameStates",
                EntityMapper = new DictionaryMapper<string>(new Dictionary<string, string> { ["GameStates"] = "game_states" }),
                PropertyMappings = new DictionaryMapper<string>(new Dictionary<string, string>
                {
                    ["Id"] = "id",
                    ["Uuid"] = "uuid",
                    ["Created"] = "created",
                    ["Updated"] = "updated",
                    ["Version"] = "version",
                    ["GameId"] = "game_id",
                    ["UserId"] = "user_id",
                    ["State"] = "state",
                }),
                Ids = ["Id"],
                ReadProperties = ["Id", "Uuid", "Created", "Updated", "Version", "GameId", "UserId", "State"],
                CreateProperties = ["Uuid", "Created", "Version", "GameId", "UserId", "State"],
                UpdateProperties = ["Uuid", "Created", "Version", "GameId", "UserId", "State"],
                Schema = new(new Dictionary<string, SchemaColumn>
                {
                    ["Id"] = new("biginteger", false, false, true),
                    ["Uuid"] = new("uuid", false, true),
                    ["Created"] = new("datetime", false, true),
                    ["Updated"] = new("datetime", false, true),
                    ["Version"] = new("binary", false, true),
                    ["GameId"] = new("biginteger", false, false),
                    ["UserId"] = new("biginteger", false, false),
                    ["State"] = new("string", false, false),
                }),
            })
            .For(connection);
}
