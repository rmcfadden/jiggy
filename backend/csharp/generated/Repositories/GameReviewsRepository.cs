using Datasources;

public sealed class GameReviewsRepository : CRUDRepository<Backend.Types.Datasource.GameReview>
{
    public GameReviewsRepository(IConnection connection) : base(connection, Options(connection)) { }

    public static IReadonlyRepository<Backend.Types.Datasource.GameReview> CreateReadonly(IConnection connection) =>
        new ReadonlyRepository<Backend.Types.Datasource.GameReview>(connection, Options(connection));

    static CRUDRepositoryOptions<Backend.Types.Datasource.GameReview> Options(IConnection connection) =>
        new CRUDRepositoryBuilder<Backend.Types.Datasource.GameReview>()
            .Add(new()
            {
                Entity = "GameReview",
                EntityMapper = new DictionaryMapper<string>(new Dictionary<string, string> { ["GameReview"] = "game_reviews" }),
                PropertyMappings = new DictionaryMapper<string>(new Dictionary<string, string>
                {
                    ["Id"] = "id",
                    ["Uuid"] = "uuid",
                    ["Created"] = "created",
                    ["Updated"] = "updated",
                    ["Version"] = "version",
                    ["GameId"] = "game_id",
                    ["ReviewId"] = "review_id",
                }),
                Ids = ["Id"],
                ReadProperties = ["Id", "Uuid", "Created", "Updated", "Version", "GameId", "ReviewId"],
                CreateProperties = ["GameId", "ReviewId"],
                UpdateProperties = ["Uuid", "GameId", "ReviewId"],
                Schema = new(new Dictionary<string, SchemaColumn>
                {
                    ["Id"] = new("biginteger", false, false, true),
                    ["Uuid"] = new("uuid", false, true),
                    ["Created"] = new("datetime", false, true),
                    ["Updated"] = new("datetime", false, true),
                    ["Version"] = new("binary", false, true),
                    ["GameId"] = new("biginteger", false, false),
                    ["ReviewId"] = new("biginteger", false, false),
                }),
            })
            .Add("sqlite", new()
            {
                Entity = "GameReview",
                EntityMapper = new DictionaryMapper<string>(new Dictionary<string, string> { ["GameReview"] = "game_reviews" }),
                PropertyMappings = new DictionaryMapper<string>(new Dictionary<string, string>
                {
                    ["Id"] = "id",
                    ["Uuid"] = "uuid",
                    ["Created"] = "created",
                    ["Updated"] = "updated",
                    ["Version"] = "version",
                    ["GameId"] = "game_id",
                    ["ReviewId"] = "review_id",
                }),
                Ids = ["Id"],
                ReadProperties = ["Id", "Uuid", "Created", "Updated", "Version", "GameId", "ReviewId"],
                CreateProperties = ["Uuid", "Created", "Version", "GameId", "ReviewId"],
                UpdateProperties = ["Uuid", "Created", "Version", "GameId", "ReviewId"],
                Schema = new(new Dictionary<string, SchemaColumn>
                {
                    ["Id"] = new("biginteger", false, false, true),
                    ["Uuid"] = new("uuid", false, true),
                    ["Created"] = new("datetime", false, true),
                    ["Updated"] = new("datetime", false, true),
                    ["Version"] = new("binary", false, true),
                    ["GameId"] = new("biginteger", false, false),
                    ["ReviewId"] = new("biginteger", false, false),
                }),
            })
            .For(connection);
}
