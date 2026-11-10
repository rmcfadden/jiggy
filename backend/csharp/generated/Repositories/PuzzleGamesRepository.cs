using Datasources;

public sealed class PuzzleGamesRepository : CRUDRepository<Backend.Types.Datasource.PuzzleGame>
{
    public PuzzleGamesRepository(IConnection connection) : base(connection, Options(connection)) { }

    public static IReadonlyRepository<Backend.Types.Datasource.PuzzleGame> CreateReadonly(IConnection connection) =>
        new ReadonlyRepository<Backend.Types.Datasource.PuzzleGame>(connection, Options(connection));

    static CRUDRepositoryOptions<Backend.Types.Datasource.PuzzleGame> Options(IConnection connection) =>
        new CRUDRepositoryBuilder<Backend.Types.Datasource.PuzzleGame>()
            .Add(new()
            {
                Entity = "PuzzleGame",
                EntityMapper = new DictionaryMapper<string>(new Dictionary<string, string> { ["PuzzleGame"] = "puzzle_games" }),
                PropertyMappings = new DictionaryMapper<string>(new Dictionary<string, string>
                {
                    ["Id"] = "id",
                    ["Uuid"] = "uuid",
                    ["Created"] = "created",
                    ["Updated"] = "updated",
                    ["Version"] = "version",
                    ["GameId"] = "game_id",
                    ["TemplateId"] = "template_id",
                    ["ImageId"] = "image_id",
                }),
                Ids = ["Id"],
                ReadProperties = ["Id", "Uuid", "Created", "Updated", "Version", "GameId", "TemplateId", "ImageId"],
                CreateProperties = ["GameId", "TemplateId", "ImageId"],
                UpdateProperties = ["Uuid", "GameId", "TemplateId", "ImageId"],
                Schema = new(new Dictionary<string, SchemaColumn>
                {
                    ["Id"] = new("biginteger", false, false, true),
                    ["Uuid"] = new("uuid", false, true),
                    ["Created"] = new("datetime", false, true),
                    ["Updated"] = new("datetime", false, true),
                    ["Version"] = new("binary", false, true),
                    ["GameId"] = new("biginteger", false, false),
                    ["TemplateId"] = new("biginteger", false, false),
                    ["ImageId"] = new("biginteger", true, false),
                }),
            })
            .Add("sqlite", new()
            {
                Entity = "PuzzleGame",
                EntityMapper = new DictionaryMapper<string>(new Dictionary<string, string> { ["PuzzleGame"] = "puzzle_games" }),
                PropertyMappings = new DictionaryMapper<string>(new Dictionary<string, string>
                {
                    ["Id"] = "id",
                    ["Uuid"] = "uuid",
                    ["Created"] = "created",
                    ["Updated"] = "updated",
                    ["Version"] = "version",
                    ["GameId"] = "game_id",
                    ["TemplateId"] = "template_id",
                    ["ImageId"] = "image_id",
                }),
                Ids = ["Id"],
                ReadProperties = ["Id", "Uuid", "Created", "Updated", "Version", "GameId", "TemplateId", "ImageId"],
                CreateProperties = ["Uuid", "Created", "Version", "GameId", "TemplateId", "ImageId"],
                UpdateProperties = ["Uuid", "Created", "Version", "GameId", "TemplateId", "ImageId"],
                Schema = new(new Dictionary<string, SchemaColumn>
                {
                    ["Id"] = new("biginteger", false, false, true),
                    ["Uuid"] = new("uuid", false, true),
                    ["Created"] = new("datetime", false, true),
                    ["Updated"] = new("datetime", false, true),
                    ["Version"] = new("binary", false, true),
                    ["GameId"] = new("biginteger", false, false),
                    ["TemplateId"] = new("biginteger", false, false),
                    ["ImageId"] = new("biginteger", true, false),
                }),
            })
            .For(connection);
}
