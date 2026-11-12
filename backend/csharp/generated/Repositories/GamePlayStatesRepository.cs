using Datasources;

public sealed class GamePlayStatesRepository : CRUDRepository<Backend.Types.Datasource.GamePlayState>
{
    public GamePlayStatesRepository(IConnection connection) : base(connection, Options(connection)) { }

    public static IReadonlyRepository<Backend.Types.Datasource.GamePlayState> CreateReadonly(IConnection connection) =>
        new ReadonlyRepository<Backend.Types.Datasource.GamePlayState>(connection, Options(connection));

    static CRUDRepositoryOptions<Backend.Types.Datasource.GamePlayState> Options(IConnection connection) =>
        new CRUDRepositoryBuilder<Backend.Types.Datasource.GamePlayState>()
            .Add(new()
            {
                Entity = "GamePlayState",
                EntityMapper = new DictionaryMapper<string>(new Dictionary<string, string> { ["GamePlayState"] = "game_play_states" }),
                PropertyMappings = new DictionaryMapper<string>(new Dictionary<string, string>
                {
                    ["Id"] = "id",
                    ["Uuid"] = "uuid",
                    ["Created"] = "created",
                    ["Updated"] = "updated",
                    ["Version"] = "version",
                    ["GamePlayId"] = "game_play_id",
                    ["StateChange"] = "state_change",
                }),
                Ids = ["Id"],
                ReadProperties = ["Id", "Uuid", "Created", "Updated", "Version", "GamePlayId", "StateChange"],
                CreateProperties = ["GamePlayId", "StateChange"],
                UpdateProperties = ["Uuid", "GamePlayId", "StateChange"],
                Schema = new(new Dictionary<string, SchemaColumn>
                {
                    ["Id"] = new("biginteger", false, false, true),
                    ["Uuid"] = new("uuid", false, true),
                    ["Created"] = new("datetime", false, true),
                    ["Updated"] = new("datetime", false, true),
                    ["Version"] = new("binary", false, true),
                    ["GamePlayId"] = new("biginteger", false, false),
                    ["StateChange"] = new("string", false, false),
                }),
            })
            .Add("sqlite", new()
            {
                Entity = "GamePlayState",
                EntityMapper = new DictionaryMapper<string>(new Dictionary<string, string> { ["GamePlayState"] = "game_play_states" }),
                PropertyMappings = new DictionaryMapper<string>(new Dictionary<string, string>
                {
                    ["Id"] = "id",
                    ["Uuid"] = "uuid",
                    ["Created"] = "created",
                    ["Updated"] = "updated",
                    ["Version"] = "version",
                    ["GamePlayId"] = "game_play_id",
                    ["StateChange"] = "state_change",
                }),
                Ids = ["Id"],
                ReadProperties = ["Id", "Uuid", "Created", "Updated", "Version", "GamePlayId", "StateChange"],
                CreateProperties = ["Uuid", "Created", "Version", "GamePlayId", "StateChange"],
                UpdateProperties = ["Uuid", "Created", "Version", "GamePlayId", "StateChange"],
                Schema = new(new Dictionary<string, SchemaColumn>
                {
                    ["Id"] = new("biginteger", false, false, true),
                    ["Uuid"] = new("uuid", false, true),
                    ["Created"] = new("datetime", false, true),
                    ["Updated"] = new("datetime", false, true),
                    ["Version"] = new("binary", false, true),
                    ["GamePlayId"] = new("biginteger", false, false),
                    ["StateChange"] = new("string", false, false),
                }),
            })
            .For(connection);
}
