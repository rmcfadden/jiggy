using Datasources;

public sealed class ApplicationServicesRepository : CRUDRepository<Backend.Types.Datasource.ApplicationService>
{
    public ApplicationServicesRepository(IConnection connection) : base(connection, Options(connection)) { }

    public static IReadonlyRepository<Backend.Types.Datasource.ApplicationService> CreateReadonly(IConnection connection) =>
        new ReadonlyRepository<Backend.Types.Datasource.ApplicationService>(connection, Options(connection));

    static CRUDRepositoryOptions<Backend.Types.Datasource.ApplicationService> Options(IConnection connection) =>
        new CRUDRepositoryBuilder<Backend.Types.Datasource.ApplicationService>()
            .Add(new()
            {
                Entity = "ApplicationService",
                EntityMapper = new DictionaryMapper<string>(new Dictionary<string, string> { ["ApplicationService"] = "application_services" }),
                PropertyMappings = new DictionaryMapper<string>(new Dictionary<string, string>
                {
                    ["Id"] = "id",
                    ["Uuid"] = "uuid",
                    ["Created"] = "created",
                    ["Updated"] = "updated",
                    ["Version"] = "version",
                    ["ApplicationId"] = "application_id",
                    ["ServiceId"] = "service_id",
                }),
                Ids = ["Id"],
                ReadProperties = ["Id", "Uuid", "Created", "Updated", "Version", "ApplicationId", "ServiceId"],
                CreateProperties = ["ApplicationId", "ServiceId"],
                UpdateProperties = ["Uuid", "ApplicationId", "ServiceId"],
                Schema = new(new Dictionary<string, SchemaColumn>
                {
                    ["Id"] = new("biginteger", false, false, true),
                    ["Uuid"] = new("uuid", false, true),
                    ["Created"] = new("datetime", false, true),
                    ["Updated"] = new("datetime", false, true),
                    ["Version"] = new("binary", false, true),
                    ["ApplicationId"] = new("biginteger", false, false),
                    ["ServiceId"] = new("biginteger", false, false),
                }),
            })
            .Add("sqlite", new()
            {
                Entity = "ApplicationService",
                EntityMapper = new DictionaryMapper<string>(new Dictionary<string, string> { ["ApplicationService"] = "application_services" }),
                PropertyMappings = new DictionaryMapper<string>(new Dictionary<string, string>
                {
                    ["Id"] = "id",
                    ["Uuid"] = "uuid",
                    ["Created"] = "created",
                    ["Updated"] = "updated",
                    ["Version"] = "version",
                    ["ApplicationId"] = "application_id",
                    ["ServiceId"] = "service_id",
                }),
                Ids = ["Id"],
                ReadProperties = ["Id", "Uuid", "Created", "Updated", "Version", "ApplicationId", "ServiceId"],
                CreateProperties = ["Uuid", "Created", "Version", "ApplicationId", "ServiceId"],
                UpdateProperties = ["Uuid", "Created", "Version", "ApplicationId", "ServiceId"],
                Schema = new(new Dictionary<string, SchemaColumn>
                {
                    ["Id"] = new("biginteger", false, false, true),
                    ["Uuid"] = new("uuid", false, true),
                    ["Created"] = new("datetime", false, true),
                    ["Updated"] = new("datetime", false, true),
                    ["Version"] = new("binary", false, true),
                    ["ApplicationId"] = new("biginteger", false, false),
                    ["ServiceId"] = new("biginteger", false, false),
                }),
            })
            .For(connection);
}
