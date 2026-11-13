using Datasources;

public sealed class ServiceUrisRepository : CRUDRepository<Backend.Types.Datasource.ServiceUri>
{
    public ServiceUrisRepository(IConnection connection) : base(connection, Options(connection)) { }

    public static IReadonlyRepository<Backend.Types.Datasource.ServiceUri> CreateReadonly(IConnection connection) =>
        new ReadonlyRepository<Backend.Types.Datasource.ServiceUri>(connection, Options(connection));

    static CRUDRepositoryOptions<Backend.Types.Datasource.ServiceUri> Options(IConnection connection) =>
        new CRUDRepositoryBuilder<Backend.Types.Datasource.ServiceUri>()
            .Add(new()
            {
                Entity = "ServiceUri",
                EntityMapper = new DictionaryMapper<string>(new Dictionary<string, string> { ["ServiceUri"] = "service_uris" }),
                PropertyMappings = new DictionaryMapper<string>(new Dictionary<string, string>
                {
                    ["Id"] = "id",
                    ["Uuid"] = "uuid",
                    ["Created"] = "created",
                    ["Updated"] = "updated",
                    ["Version"] = "version",
                    ["ServiceId"] = "service_id",
                    ["UriId"] = "uri_id",
                }),
                Ids = ["Id"],
                ReadProperties = ["Id", "Uuid", "Created", "Updated", "Version", "ServiceId", "UriId"],
                CreateProperties = ["ServiceId", "UriId"],
                UpdateProperties = ["Uuid", "ServiceId", "UriId"],
                Schema = new(new Dictionary<string, SchemaColumn>
                {
                    ["Id"] = new("biginteger", false, false, true),
                    ["Uuid"] = new("uuid", false, true),
                    ["Created"] = new("datetime", false, true),
                    ["Updated"] = new("datetime", false, true),
                    ["Version"] = new("binary", false, true),
                    ["ServiceId"] = new("biginteger", false, false),
                    ["UriId"] = new("biginteger", false, false),
                }),
            })
            .Add("sqlite", new()
            {
                Entity = "ServiceUri",
                EntityMapper = new DictionaryMapper<string>(new Dictionary<string, string> { ["ServiceUri"] = "service_uris" }),
                PropertyMappings = new DictionaryMapper<string>(new Dictionary<string, string>
                {
                    ["Id"] = "id",
                    ["Uuid"] = "uuid",
                    ["Created"] = "created",
                    ["Updated"] = "updated",
                    ["Version"] = "version",
                    ["ServiceId"] = "service_id",
                    ["UriId"] = "uri_id",
                }),
                Ids = ["Id"],
                ReadProperties = ["Id", "Uuid", "Created", "Updated", "Version", "ServiceId", "UriId"],
                CreateProperties = ["Uuid", "Created", "Version", "ServiceId", "UriId"],
                UpdateProperties = ["Uuid", "Created", "Version", "ServiceId", "UriId"],
                Schema = new(new Dictionary<string, SchemaColumn>
                {
                    ["Id"] = new("biginteger", false, false, true),
                    ["Uuid"] = new("uuid", false, true),
                    ["Created"] = new("datetime", false, true),
                    ["Updated"] = new("datetime", false, true),
                    ["Version"] = new("binary", false, true),
                    ["ServiceId"] = new("biginteger", false, false),
                    ["UriId"] = new("biginteger", false, false),
                }),
            })
            .For(connection);
}
