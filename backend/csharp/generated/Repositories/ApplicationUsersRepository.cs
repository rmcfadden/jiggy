using Datasources;

public sealed class ApplicationUsersRepository : CRUDRepository<Backend.Types.Datasource.ApplicationUser>
{
    public ApplicationUsersRepository(IConnection connection) : base(connection, Options(connection)) { }

    public static IReadonlyRepository<Backend.Types.Datasource.ApplicationUser> CreateReadonly(IConnection connection) =>
        new ReadonlyRepository<Backend.Types.Datasource.ApplicationUser>(connection, Options(connection));

    static CRUDRepositoryOptions<Backend.Types.Datasource.ApplicationUser> Options(IConnection connection) =>
        new CRUDRepositoryBuilder<Backend.Types.Datasource.ApplicationUser>()
            .Add(new()
            {
                Entity = "ApplicationUser",
                EntityMapper = new DictionaryMapper<string>(new Dictionary<string, string> { ["ApplicationUser"] = "application_users" }),
                PropertyMappings = new DictionaryMapper<string>(new Dictionary<string, string>
                {
                    ["Id"] = "id",
                    ["Uuid"] = "uuid",
                    ["Created"] = "created",
                    ["Updated"] = "updated",
                    ["Version"] = "version",
                    ["ApplicationId"] = "application_id",
                    ["UserId"] = "user_id",
                }),
                Ids = ["Id"],
                ReadProperties = ["Id", "Uuid", "Created", "Updated", "Version", "ApplicationId", "UserId"],
                CreateProperties = ["ApplicationId", "UserId"],
                UpdateProperties = ["Uuid", "ApplicationId", "UserId"],
                Schema = new(new Dictionary<string, SchemaColumn>
                {
                    ["Id"] = new("biginteger", false, false, true),
                    ["Uuid"] = new("uuid", false, true),
                    ["Created"] = new("datetime", false, true),
                    ["Updated"] = new("datetime", false, true),
                    ["Version"] = new("binary", false, true),
                    ["ApplicationId"] = new("biginteger", false, false),
                    ["UserId"] = new("biginteger", false, false),
                }),
            })
            .Add("sqlite", new()
            {
                Entity = "ApplicationUser",
                EntityMapper = new DictionaryMapper<string>(new Dictionary<string, string> { ["ApplicationUser"] = "application_users" }),
                PropertyMappings = new DictionaryMapper<string>(new Dictionary<string, string>
                {
                    ["Id"] = "id",
                    ["Uuid"] = "uuid",
                    ["Created"] = "created",
                    ["Updated"] = "updated",
                    ["Version"] = "version",
                    ["ApplicationId"] = "application_id",
                    ["UserId"] = "user_id",
                }),
                Ids = ["Id"],
                ReadProperties = ["Id", "Uuid", "Created", "Updated", "Version", "ApplicationId", "UserId"],
                CreateProperties = ["Uuid", "Created", "Version", "ApplicationId", "UserId"],
                UpdateProperties = ["Uuid", "Created", "Version", "ApplicationId", "UserId"],
                Schema = new(new Dictionary<string, SchemaColumn>
                {
                    ["Id"] = new("biginteger", false, false, true),
                    ["Uuid"] = new("uuid", false, true),
                    ["Created"] = new("datetime", false, true),
                    ["Updated"] = new("datetime", false, true),
                    ["Version"] = new("binary", false, true),
                    ["ApplicationId"] = new("biginteger", false, false),
                    ["UserId"] = new("biginteger", false, false),
                }),
            })
            .For(connection);
}
