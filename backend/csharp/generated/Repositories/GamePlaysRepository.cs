using Datasources;

public sealed class GamePlaysRepository : CRUDRepository<Backend.Types.View.GamePlay>
{
    public GamePlayStatesRepository GamePlayState { get; }
    public GamePlayActionsRepository GamePlayAction { get; }
    public UsersRepository User { get; }
    public GamePlayUsersRepository GamePlayUsers { get; }

    public GamePlaysRepository(IConnection connection) : base(connection, Options(connection))
    {
        GamePlayState = new GamePlayStatesRepository(connection);
        GamePlayAction = new GamePlayActionsRepository(connection);
        User = new UsersRepository(connection);
        GamePlayUsers = new GamePlayUsersRepository(connection);
        AddEnriched(new("States", "Id", "GamePlayId", Type: EnrichmentPropertyType.List), GamePlayState);
        AddEnriched(new("Actions", "Id", "GamePlayId", Type: EnrichmentPropertyType.List), GamePlayAction);
        AddLinked(new("Users", "Id", "Id", Association: new("GamePlayId", "UserId")), User, GamePlayUsers);
    }

    public static IReadonlyRepository<Backend.Types.View.GamePlay> CreateReadonly(IConnection connection)
    {
        var repo = new ReadonlyRepository<Backend.Types.View.GamePlay>(connection, Options(connection));
        var GamePlayState = new GamePlayStatesRepository(connection);
        var GamePlayAction = new GamePlayActionsRepository(connection);
        var User = new UsersRepository(connection);
        var GamePlayUsers = new GamePlayUsersRepository(connection);
        repo.AddEnriched(new("States", "Id", "GamePlayId", Type: EnrichmentPropertyType.List), GamePlayState);
        repo.AddEnriched(new("Actions", "Id", "GamePlayId", Type: EnrichmentPropertyType.List), GamePlayAction);
        repo.AddEnriched(new("Users", "Id", "Id", Type: EnrichmentPropertyType.List), User);
        return repo;
    }

    static CRUDRepositoryOptions<Backend.Types.View.GamePlay> Options(IConnection connection) =>
        new CRUDRepositoryBuilder<Backend.Types.View.GamePlay>()
            .Add(new()
            {
                Entity = "GamePlay",
                EntityMapper = new DictionaryMapper<string>(new Dictionary<string, string> { ["GamePlay"] = "game_plays" }),
                PropertyMappings = new DictionaryMapper<string>(new Dictionary<string, string>
                {
                    ["Id"] = "id",
                    ["Uuid"] = "uuid",
                    ["Created"] = "created",
                    ["Updated"] = "updated",
                    ["Version"] = "version",
                    ["GameId"] = "game_id",
                    ["UserId"] = "user_id",
                    ["Finished"] = "finished",
                }),
                Ids = ["Id"],
                ReadProperties = ["Id", "Uuid", "Created", "Updated", "Version", "GameId", "UserId", "Finished"],
                CreateProperties = ["GameId", "UserId", "Finished"],
                UpdateProperties = ["Uuid", "GameId", "UserId", "Finished"],
                Schema = new(new Dictionary<string, SchemaColumn>
                {
                    ["Id"] = new("biginteger", false, false, true),
                    ["Uuid"] = new("uuid", false, true),
                    ["Created"] = new("datetime", false, true),
                    ["Updated"] = new("datetime", false, true),
                    ["Version"] = new("binary", false, true),
                    ["GameId"] = new("biginteger", false, false),
                    ["UserId"] = new("biginteger", false, false),
                    ["Finished"] = new("datetime", true, false),
                }),
            })
            .Add("sqlite", new()
            {
                Entity = "GamePlay",
                EntityMapper = new DictionaryMapper<string>(new Dictionary<string, string> { ["GamePlay"] = "game_plays" }),
                PropertyMappings = new DictionaryMapper<string>(new Dictionary<string, string>
                {
                    ["Id"] = "id",
                    ["Uuid"] = "uuid",
                    ["Created"] = "created",
                    ["Updated"] = "updated",
                    ["Version"] = "version",
                    ["GameId"] = "game_id",
                    ["UserId"] = "user_id",
                    ["Finished"] = "finished",
                }),
                Ids = ["Id"],
                ReadProperties = ["Id", "Uuid", "Created", "Updated", "Version", "GameId", "UserId", "Finished"],
                CreateProperties = ["Uuid", "Created", "Version", "GameId", "UserId", "Finished"],
                UpdateProperties = ["Uuid", "Created", "Version", "GameId", "UserId", "Finished"],
                Schema = new(new Dictionary<string, SchemaColumn>
                {
                    ["Id"] = new("biginteger", false, false, true),
                    ["Uuid"] = new("uuid", false, true),
                    ["Created"] = new("datetime", false, true),
                    ["Updated"] = new("datetime", false, true),
                    ["Version"] = new("binary", false, true),
                    ["GameId"] = new("biginteger", false, false),
                    ["UserId"] = new("biginteger", false, false),
                    ["Finished"] = new("datetime", true, false),
                }),
            })
            .For(connection);
}
