using Datasources;

public sealed class GamePlayActionsRepository : CRUDRepository<Backend.Types.Datasource.GamePlayAction>
{
    public GamePlayActionsRepository(IConnection connection) : base(connection, Options(connection)) { }

    public static IReadonlyRepository<Backend.Types.Datasource.GamePlayAction> CreateReadonly(IConnection connection) =>
        new ReadonlyRepository<Backend.Types.Datasource.GamePlayAction>(connection, Options(connection));

    static CRUDRepositoryOptions<Backend.Types.Datasource.GamePlayAction> Options(IConnection connection) =>
        new CRUDRepositoryBuilder<Backend.Types.Datasource.GamePlayAction>()
            .Add(new()
            {
                Entity = "GamePlayAction",
                EntityMapper = new DictionaryMapper<string>(new Dictionary<string, string> { ["GamePlayAction"] = "game_play_actions" }),
                PropertyMappings = new DictionaryMapper<string>(new Dictionary<string, string>
                {
                    ["Id"] = "id",
                    ["Uuid"] = "uuid",
                    ["Created"] = "created",
                    ["Updated"] = "updated",
                    ["Version"] = "version",
                    ["GamePlayId"] = "game_play_id",
                    ["UserId"] = "user_id",
                    ["Action"] = "action",
                }),
                Ids = ["Id"],
                ReadProperties = ["Id", "Uuid", "Created", "Updated", "Version", "GamePlayId", "UserId", "Action"],
                CreateProperties = ["GamePlayId", "UserId", "Action"],
                UpdateProperties = ["Uuid", "GamePlayId", "UserId", "Action"],
                Schema = new(new Dictionary<string, SchemaColumn>
                {
                    ["Id"] = new("biginteger", false, false, true),
                    ["Uuid"] = new("uuid", false, true),
                    ["Created"] = new("datetime", false, true),
                    ["Updated"] = new("datetime", false, true),
                    ["Version"] = new("binary", false, true),
                    ["GamePlayId"] = new("biginteger", false, false),
                    ["UserId"] = new("biginteger", false, false),
                    ["Action"] = new("string", false, false),
                }),
            })
            .Add("sqlite", new()
            {
                Entity = "GamePlayAction",
                EntityMapper = new DictionaryMapper<string>(new Dictionary<string, string> { ["GamePlayAction"] = "game_play_actions" }),
                PropertyMappings = new DictionaryMapper<string>(new Dictionary<string, string>
                {
                    ["Id"] = "id",
                    ["Uuid"] = "uuid",
                    ["Created"] = "created",
                    ["Updated"] = "updated",
                    ["Version"] = "version",
                    ["GamePlayId"] = "game_play_id",
                    ["UserId"] = "user_id",
                    ["Action"] = "action",
                }),
                Ids = ["Id"],
                ReadProperties = ["Id", "Uuid", "Created", "Updated", "Version", "GamePlayId", "UserId", "Action"],
                CreateProperties = ["Uuid", "Created", "Version", "GamePlayId", "UserId", "Action"],
                UpdateProperties = ["Uuid", "Created", "Version", "GamePlayId", "UserId", "Action"],
                Schema = new(new Dictionary<string, SchemaColumn>
                {
                    ["Id"] = new("biginteger", false, false, true),
                    ["Uuid"] = new("uuid", false, true),
                    ["Created"] = new("datetime", false, true),
                    ["Updated"] = new("datetime", false, true),
                    ["Version"] = new("binary", false, true),
                    ["GamePlayId"] = new("biginteger", false, false),
                    ["UserId"] = new("biginteger", false, false),
                    ["Action"] = new("string", false, false),
                }),
            })
            .For(connection);
}
