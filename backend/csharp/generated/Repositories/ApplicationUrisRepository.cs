using Datasources;

public sealed class ApplicationUrisRepository : CRUDRepository<Backend.Types.Datasource.ApplicationUri>
{
    public ApplicationUrisRepository(IConnection connection) : base(connection, Options(connection)) { }

    public static IReadonlyRepository<Backend.Types.Datasource.ApplicationUri> CreateReadonly(IConnection connection) =>
        new ReadonlyRepository<Backend.Types.Datasource.ApplicationUri>(connection, Options(connection));

    static CRUDRepositoryOptions<Backend.Types.Datasource.ApplicationUri> Options(IConnection connection) =>
        new CRUDRepositoryBuilder<Backend.Types.Datasource.ApplicationUri>()
            .Add(new()
            {
                Entity = "ApplicationUri",
                EntityMapper = new DictionaryMapper<string>(new Dictionary<string, string> { ["ApplicationUri"] = "application_uris" }),
                PropertyMappings = new DictionaryMapper<string>(new Dictionary<string, string>
                {
                    ["Id"] = "id",
                    ["Uuid"] = "uuid",
                    ["Created"] = "created",
                    ["Updated"] = "updated",
                    ["Version"] = "version",
                    ["ApplicationId"] = "application_id",
                    ["UriId"] = "uri_id",
                }),
                Ids = ["Id"],
                ReadProperties = ["Id", "Uuid", "Created", "Updated", "Version", "ApplicationId", "UriId"],
                CreateProperties = ["ApplicationId", "UriId"],
                UpdateProperties = ["Uuid", "ApplicationId", "UriId"],
                Schema = new(new Dictionary<string, SchemaColumn>
                {
                    ["Id"] = new("biginteger", false, false, true),
                    ["Uuid"] = new("uuid", false, true),
                    ["Created"] = new("datetime", false, true),
                    ["Updated"] = new("datetime", false, true),
                    ["Version"] = new("binary", false, true),
                    ["ApplicationId"] = new("biginteger", false, false),
                    ["UriId"] = new("biginteger", false, false),
                }),
            })
            .Add("sqlite", new()
            {
                Entity = "ApplicationUri",
                EntityMapper = new DictionaryMapper<string>(new Dictionary<string, string> { ["ApplicationUri"] = "application_uris" }),
                PropertyMappings = new DictionaryMapper<string>(new Dictionary<string, string>
                {
                    ["Id"] = "id",
                    ["Uuid"] = "uuid",
                    ["Created"] = "created",
                    ["Updated"] = "updated",
                    ["Version"] = "version",
                    ["ApplicationId"] = "application_id",
                    ["UriId"] = "uri_id",
                }),
                Ids = ["Id"],
                ReadProperties = ["Id", "Uuid", "Created", "Updated", "Version", "ApplicationId", "UriId"],
                CreateProperties = ["Uuid", "Created", "Version", "ApplicationId", "UriId"],
                UpdateProperties = ["Uuid", "Created", "Version", "ApplicationId", "UriId"],
                Schema = new(new Dictionary<string, SchemaColumn>
                {
                    ["Id"] = new("biginteger", false, false, true),
                    ["Uuid"] = new("uuid", false, true),
                    ["Created"] = new("datetime", false, true),
                    ["Updated"] = new("datetime", false, true),
                    ["Version"] = new("binary", false, true),
                    ["ApplicationId"] = new("biginteger", false, false),
                    ["UriId"] = new("biginteger", false, false),
                }),
            })
            .For(connection);
}
