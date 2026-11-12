using Datasources;

public sealed class ReviewsRepository : CRUDRepository<Backend.Types.Datasource.Review>
{
    public ReviewsRepository(IConnection connection) : base(connection, Options(connection)) { }

    public static IReadonlyRepository<Backend.Types.Datasource.Review> CreateReadonly(IConnection connection) =>
        new ReadonlyRepository<Backend.Types.Datasource.Review>(connection, Options(connection));

    static CRUDRepositoryOptions<Backend.Types.Datasource.Review> Options(IConnection connection) =>
        new CRUDRepositoryBuilder<Backend.Types.Datasource.Review>()
            .Add(new()
            {
                Entity = "Review",
                EntityMapper = new DictionaryMapper<string>(new Dictionary<string, string> { ["Review"] = "reviews" }),
                PropertyMappings = new DictionaryMapper<string>(new Dictionary<string, string>
                {
                    ["Id"] = "id",
                    ["Uuid"] = "uuid",
                    ["Created"] = "created",
                    ["Updated"] = "updated",
                    ["Version"] = "version",
                    ["UserId"] = "user_id",
                    ["Comment"] = "comment",
                    ["Rating"] = "rating",
                    ["IsModerated"] = "is_moderated",
                }),
                Ids = ["Id"],
                ReadProperties = ["Id", "Uuid", "Created", "Updated", "Version", "UserId", "Comment", "Rating", "IsModerated"],
                CreateProperties = ["UserId", "Comment", "Rating", "IsModerated"],
                UpdateProperties = ["Uuid", "UserId", "Comment", "Rating", "IsModerated"],
                Schema = new(new Dictionary<string, SchemaColumn>
                {
                    ["Id"] = new("biginteger", false, false, true),
                    ["Uuid"] = new("uuid", false, true),
                    ["Created"] = new("datetime", false, true),
                    ["Updated"] = new("datetime", false, true),
                    ["Version"] = new("binary", false, true),
                    ["UserId"] = new("biginteger", false, false),
                    ["Comment"] = new("string", false, false),
                    ["Rating"] = new("decimal", false, false),
                    ["IsModerated"] = new("boolean", false, true),
                }),
            })
            .Add("sqlite", new()
            {
                Entity = "Review",
                EntityMapper = new DictionaryMapper<string>(new Dictionary<string, string> { ["Review"] = "reviews" }),
                PropertyMappings = new DictionaryMapper<string>(new Dictionary<string, string>
                {
                    ["Id"] = "id",
                    ["Uuid"] = "uuid",
                    ["Created"] = "created",
                    ["Updated"] = "updated",
                    ["Version"] = "version",
                    ["UserId"] = "user_id",
                    ["Comment"] = "comment",
                    ["Rating"] = "rating",
                    ["IsModerated"] = "is_moderated",
                }),
                Ids = ["Id"],
                ReadProperties = ["Id", "Uuid", "Created", "Updated", "Version", "UserId", "Comment", "Rating", "IsModerated"],
                CreateProperties = ["Uuid", "Created", "Version", "UserId", "Comment", "Rating", "IsModerated"],
                UpdateProperties = ["Uuid", "Created", "Version", "UserId", "Comment", "Rating", "IsModerated"],
                Schema = new(new Dictionary<string, SchemaColumn>
                {
                    ["Id"] = new("biginteger", false, false, true),
                    ["Uuid"] = new("uuid", false, true),
                    ["Created"] = new("datetime", false, true),
                    ["Updated"] = new("datetime", false, true),
                    ["Version"] = new("binary", false, true),
                    ["UserId"] = new("biginteger", false, false),
                    ["Comment"] = new("string", false, false),
                    ["Rating"] = new("decimal", false, false),
                    ["IsModerated"] = new("boolean", false, true),
                }),
            })
            .For(connection);
}
