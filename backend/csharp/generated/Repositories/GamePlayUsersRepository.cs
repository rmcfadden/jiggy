using Datasources;

public sealed class GamePlayUsersRepository : CRUDRepository<Backend.Types.Datasource.GamePlayUser>
{
    public GamePlayUsersRepository(IConnection connection) : base(connection, Options(connection)) { }

    public static IReadonlyRepository<Backend.Types.Datasource.GamePlayUser> CreateReadonly(IConnection connection) =>
        new ReadonlyRepository<Backend.Types.Datasource.GamePlayUser>(connection, Options(connection));

    static CRUDRepositoryOptions<Backend.Types.Datasource.GamePlayUser> Options(IConnection connection) =>
        new CRUDRepositoryBuilder<Backend.Types.Datasource.GamePlayUser>()
            .Add(new()
            {
                Entity = "GamePlayUser",
                EntityMapper = new DictionaryMapper<string>(new Dictionary<string, string> { ["GamePlayUser"] = "game_play_users" }),
                PropertyMappings = new DictionaryMapper<string>(new Dictionary<string, string>
                {
                    ["Id"] = "id",
                    ["Uuid"] = "uuid",
                    ["Created"] = "created",
                    ["Updated"] = "updated",
                    ["Version"] = "version",
                    ["GamePlayId"] = "game_play_id",
                    ["UserId"] = "user_id",
                }),
                Ids = ["Id"],
                ReadProperties = ["Id", "Uuid", "Created", "Updated", "Version", "GamePlayId", "UserId"],
                CreateProperties = ["GamePlayId", "UserId"],
                UpdateProperties = ["Uuid", "GamePlayId", "UserId"],
                Schema = new(new Dictionary<string, SchemaColumn>
                {
                    ["Id"] = new("biginteger", false, false, true),
                    ["Uuid"] = new("uuid", false, true),
                    ["Created"] = new("datetime", false, true),
                    ["Updated"] = new("datetime", false, true),
                    ["Version"] = new("binary", false, true),
                    ["GamePlayId"] = new("biginteger", false, false),
                    ["UserId"] = new("biginteger", false, false),
                }),
            })
            .Add("sqlite", new()
            {
                Entity = "GamePlayUser",
                EntityMapper = new DictionaryMapper<string>(new Dictionary<string, string> { ["GamePlayUser"] = "game_play_users" }),
                PropertyMappings = new DictionaryMapper<string>(new Dictionary<string, string>
                {
                    ["Id"] = "id",
                    ["Uuid"] = "uuid",
                    ["Created"] = "created",
                    ["Updated"] = "updated",
                    ["Version"] = "version",
                    ["GamePlayId"] = "game_play_id",
                    ["UserId"] = "user_id",
                }),
                Ids = ["Id"],
                ReadProperties = ["Id", "Uuid", "Created", "Updated", "Version", "GamePlayId", "UserId"],
                CreateProperties = ["Uuid", "Created", "Version", "GamePlayId", "UserId"],
                UpdateProperties = ["Uuid", "Created", "Version", "GamePlayId", "UserId"],
                Schema = new(new Dictionary<string, SchemaColumn>
                {
                    ["Id"] = new("biginteger", false, false, true),
                    ["Uuid"] = new("uuid", false, true),
                    ["Created"] = new("datetime", false, true),
                    ["Updated"] = new("datetime", false, true),
                    ["Version"] = new("binary", false, true),
                    ["GamePlayId"] = new("biginteger", false, false),
                    ["UserId"] = new("biginteger", false, false),
                }),
            })
            .For(connection);
}
