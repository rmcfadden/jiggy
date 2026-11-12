using Datasources;

public sealed class ReviewFeedbacksRepository : CRUDRepository<Backend.Types.Datasource.ReviewFeedback>
{
    public ReviewFeedbacksRepository(IConnection connection) : base(connection, Options(connection)) { }

    public static IReadonlyRepository<Backend.Types.Datasource.ReviewFeedback> CreateReadonly(IConnection connection) =>
        new ReadonlyRepository<Backend.Types.Datasource.ReviewFeedback>(connection, Options(connection));

    static CRUDRepositoryOptions<Backend.Types.Datasource.ReviewFeedback> Options(IConnection connection) =>
        new CRUDRepositoryBuilder<Backend.Types.Datasource.ReviewFeedback>()
            .Add(new()
            {
                Entity = "ReviewFeedback",
                EntityMapper = new DictionaryMapper<string>(new Dictionary<string, string> { ["ReviewFeedback"] = "review_feedbacks" }),
                PropertyMappings = new DictionaryMapper<string>(new Dictionary<string, string>
                {
                    ["Id"] = "id",
                    ["Uuid"] = "uuid",
                    ["Created"] = "created",
                    ["Updated"] = "updated",
                    ["Version"] = "version",
                    ["ReviewId"] = "review_id",
                    ["UserId"] = "user_id",
                    ["IsPositive"] = "is_positive",
                }),
                Ids = ["Id"],
                ReadProperties = ["Id", "Uuid", "Created", "Updated", "Version", "ReviewId", "UserId", "IsPositive"],
                CreateProperties = ["ReviewId", "UserId", "IsPositive"],
                UpdateProperties = ["Uuid", "ReviewId", "UserId", "IsPositive"],
                Schema = new(new Dictionary<string, SchemaColumn>
                {
                    ["Id"] = new("biginteger", false, false, true),
                    ["Uuid"] = new("uuid", false, true),
                    ["Created"] = new("datetime", false, true),
                    ["Updated"] = new("datetime", false, true),
                    ["Version"] = new("binary", false, true),
                    ["ReviewId"] = new("biginteger", false, false),
                    ["UserId"] = new("biginteger", false, false),
                    ["IsPositive"] = new("boolean", false, false),
                }),
            })
            .Add("sqlite", new()
            {
                Entity = "ReviewFeedback",
                EntityMapper = new DictionaryMapper<string>(new Dictionary<string, string> { ["ReviewFeedback"] = "review_feedbacks" }),
                PropertyMappings = new DictionaryMapper<string>(new Dictionary<string, string>
                {
                    ["Id"] = "id",
                    ["Uuid"] = "uuid",
                    ["Created"] = "created",
                    ["Updated"] = "updated",
                    ["Version"] = "version",
                    ["ReviewId"] = "review_id",
                    ["UserId"] = "user_id",
                    ["IsPositive"] = "is_positive",
                }),
                Ids = ["Id"],
                ReadProperties = ["Id", "Uuid", "Created", "Updated", "Version", "ReviewId", "UserId", "IsPositive"],
                CreateProperties = ["Uuid", "Created", "Version", "ReviewId", "UserId", "IsPositive"],
                UpdateProperties = ["Uuid", "Created", "Version", "ReviewId", "UserId", "IsPositive"],
                Schema = new(new Dictionary<string, SchemaColumn>
                {
                    ["Id"] = new("biginteger", false, false, true),
                    ["Uuid"] = new("uuid", false, true),
                    ["Created"] = new("datetime", false, true),
                    ["Updated"] = new("datetime", false, true),
                    ["Version"] = new("binary", false, true),
                    ["ReviewId"] = new("biginteger", false, false),
                    ["UserId"] = new("biginteger", false, false),
                    ["IsPositive"] = new("boolean", false, false),
                }),
            })
            .For(connection);
}
