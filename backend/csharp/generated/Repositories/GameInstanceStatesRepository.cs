using Datasources;

public sealed class GameInstanceStatesRepository : CRUDRepository<Backend.Types.Datasource.GameInstanceState>
{
    public GameInstanceStatesRepository(IConnection connection) : base(connection, Options(connection)) { }

    public static IReadonlyRepository<Backend.Types.Datasource.GameInstanceState> CreateReadonly(IConnection connection) =>
        new ReadonlyRepository<Backend.Types.Datasource.GameInstanceState>(connection, Options(connection));

    static CRUDRepositoryOptions<Backend.Types.Datasource.GameInstanceState> Options(IConnection connection) =>
        new CRUDRepositoryBuilder<Backend.Types.Datasource.GameInstanceState>()
            .Add(new()
            {
                Entity = "GameInstanceState",
                EntityMapper = new DictionaryMapper<string>(new Dictionary<string, string> { ["GameInstanceState"] = "game_instance_states" }),
                PropertyMappings = new DictionaryMapper<string>(new Dictionary<string, string>
                {
                    ["Id"] = "id",
                    ["Uuid"] = "uuid",
                    ["Created"] = "created",
                    ["Updated"] = "updated",
                    ["Version"] = "version",
                    ["GameInstanceId"] = "game_instance_id",
                    ["UserId"] = "user_id",
                    ["State"] = "state",
                }),
                Ids = ["Id"],
                ReadProperties = ["Id", "Uuid", "Created", "Updated", "Version", "GameInstanceId", "UserId", "State"],
                CreateProperties = ["GameInstanceId", "UserId", "State"],
                UpdateProperties = ["Uuid", "GameInstanceId", "UserId", "State"],
                Schema = new(new Dictionary<string, SchemaColumn>
                {
                    ["Id"] = new("biginteger", false, false, true),
                    ["Uuid"] = new("uuid", false, true),
                    ["Created"] = new("datetime", false, true),
                    ["Updated"] = new("datetime", false, true),
                    ["Version"] = new("binary", false, true),
                    ["GameInstanceId"] = new("biginteger", false, false),
                    ["UserId"] = new("biginteger", false, false),
                    ["State"] = new("string", false, false),
                }),
            })
            .Add("sqlite", new()
            {
                Entity = "GameInstanceState",
                EntityMapper = new DictionaryMapper<string>(new Dictionary<string, string> { ["GameInstanceState"] = "game_instance_states" }),
                PropertyMappings = new DictionaryMapper<string>(new Dictionary<string, string>
                {
                    ["Id"] = "id",
                    ["Uuid"] = "uuid",
                    ["Created"] = "created",
                    ["Updated"] = "updated",
                    ["Version"] = "version",
                    ["GameInstanceId"] = "game_instance_id",
                    ["UserId"] = "user_id",
                    ["State"] = "state",
                }),
                Ids = ["Id"],
                ReadProperties = ["Id", "Uuid", "Created", "Updated", "Version", "GameInstanceId", "UserId", "State"],
                CreateProperties = ["Uuid", "Created", "Version", "GameInstanceId", "UserId", "State"],
                UpdateProperties = ["Uuid", "Created", "Version", "GameInstanceId", "UserId", "State"],
                Schema = new(new Dictionary<string, SchemaColumn>
                {
                    ["Id"] = new("biginteger", false, false, true),
                    ["Uuid"] = new("uuid", false, true),
                    ["Created"] = new("datetime", false, true),
                    ["Updated"] = new("datetime", false, true),
                    ["Version"] = new("binary", false, true),
                    ["GameInstanceId"] = new("biginteger", false, false),
                    ["UserId"] = new("biginteger", false, false),
                    ["State"] = new("string", false, false),
                }),
            })
            .For(connection);
}
