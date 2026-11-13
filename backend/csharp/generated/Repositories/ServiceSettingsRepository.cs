using Datasources;

public sealed class ServiceSettingsRepository : CRUDRepository<Backend.Types.View.ServiceSetting>
{
    public ServiceSettingsRepository(IConnection connection) : base(connection, Options(connection)) { }

    public static IReadonlyRepository<Backend.Types.View.ServiceSetting> CreateReadonly(IConnection connection) =>
        new ReadonlyRepository<Backend.Types.View.ServiceSetting>(connection, Options(connection));

    static CRUDRepositoryOptions<Backend.Types.View.ServiceSetting> Options(IConnection connection) =>
        new CRUDRepositoryBuilder<Backend.Types.View.ServiceSetting>()
            .Add(new()
            {
                Entity = "ServiceSetting",
                EntityMapper = new DictionaryMapper<string>(new Dictionary<string, string> { ["ServiceSetting"] = "service_settings_bases" }),
                PropertyMappings = new DictionaryMapper<string>(new Dictionary<string, string>
                {
                    ["Id"] = "id",
                    ["Uuid"] = "uuid",
                    ["Created"] = "created",
                    ["Updated"] = "updated",
                    ["Version"] = "version",
                    ["ServiceId"] = "service_id",
                    ["Name"] = "name",
                    ["Value"] = "value",
                }),
                Ids = ["Id"],
                ReadProperties = ["Id", "Uuid", "Created", "Updated", "Version", "ServiceId", "Name", "Value"],
                CreateProperties = ["ServiceId", "Name", "Value"],
                UpdateProperties = ["Uuid", "ServiceId", "Name", "Value"],
                Schema = new(new Dictionary<string, SchemaColumn>
                {
                    ["Id"] = new("biginteger", false, false, true),
                    ["Uuid"] = new("uuid", false, true),
                    ["Created"] = new("datetime", false, true),
                    ["Updated"] = new("datetime", false, true),
                    ["Version"] = new("binary", false, true),
                    ["ServiceId"] = new("biginteger", false, false),
                    ["Name"] = new("string", false, false),
                    ["Value"] = new("string", false, false),
                }),
            })
            .Add("sqlite", new()
            {
                Entity = "ServiceSetting",
                EntityMapper = new DictionaryMapper<string>(new Dictionary<string, string> { ["ServiceSetting"] = "service_settings_bases" }),
                PropertyMappings = new DictionaryMapper<string>(new Dictionary<string, string>
                {
                    ["Id"] = "id",
                    ["Uuid"] = "uuid",
                    ["Created"] = "created",
                    ["Updated"] = "updated",
                    ["Version"] = "version",
                    ["ServiceId"] = "service_id",
                    ["Name"] = "name",
                    ["Value"] = "value",
                }),
                Ids = ["Id"],
                ReadProperties = ["Id", "Uuid", "Created", "Updated", "Version", "ServiceId", "Name", "Value"],
                CreateProperties = ["Uuid", "Created", "Version", "ServiceId", "Name", "Value"],
                UpdateProperties = ["Uuid", "Created", "Version", "ServiceId", "Name", "Value"],
                Schema = new(new Dictionary<string, SchemaColumn>
                {
                    ["Id"] = new("biginteger", false, false, true),
                    ["Uuid"] = new("uuid", false, true),
                    ["Created"] = new("datetime", false, true),
                    ["Updated"] = new("datetime", false, true),
                    ["Version"] = new("binary", false, true),
                    ["ServiceId"] = new("biginteger", false, false),
                    ["Name"] = new("string", false, false),
                    ["Value"] = new("string", false, false),
                }),
            })
            .For(connection);
}
