using Datasources;

public sealed class ApplicationSettingsRepository : CRUDRepository<Backend.Types.View.ApplicationSetting>
{
    public ApplicationSettingsRepository(IConnection connection) : base(connection, Options(connection)) { }

    public static IReadonlyRepository<Backend.Types.View.ApplicationSetting> CreateReadonly(IConnection connection) =>
        new ReadonlyRepository<Backend.Types.View.ApplicationSetting>(connection, Options(connection));

    static CRUDRepositoryOptions<Backend.Types.View.ApplicationSetting> Options(IConnection connection) =>
        new CRUDRepositoryBuilder<Backend.Types.View.ApplicationSetting>()
            .Add(new()
            {
                Entity = "ApplicationSetting",
                EntityMapper = new DictionaryMapper<string>(new Dictionary<string, string> { ["ApplicationSetting"] = "application_settings_bases" }),
                PropertyMappings = new DictionaryMapper<string>(new Dictionary<string, string>
                {
                    ["Id"] = "id",
                    ["Uuid"] = "uuid",
                    ["Created"] = "created",
                    ["Updated"] = "updated",
                    ["Version"] = "version",
                    ["ApplicationId"] = "application_id",
                    ["Name"] = "name",
                    ["Value"] = "value",
                }),
                Ids = ["Id"],
                ReadProperties = ["Id", "Uuid", "Created", "Updated", "Version", "ApplicationId", "Name", "Value"],
                CreateProperties = ["ApplicationId", "Name", "Value"],
                UpdateProperties = ["Uuid", "ApplicationId", "Name", "Value"],
                Schema = new(new Dictionary<string, SchemaColumn>
                {
                    ["Id"] = new("biginteger", false, false, true),
                    ["Uuid"] = new("uuid", false, true),
                    ["Created"] = new("datetime", false, true),
                    ["Updated"] = new("datetime", false, true),
                    ["Version"] = new("binary", false, true),
                    ["ApplicationId"] = new("biginteger", false, false),
                    ["Name"] = new("string", false, false),
                    ["Value"] = new("string", false, false),
                }),
            })
            .Add("sqlite", new()
            {
                Entity = "ApplicationSetting",
                EntityMapper = new DictionaryMapper<string>(new Dictionary<string, string> { ["ApplicationSetting"] = "application_settings_bases" }),
                PropertyMappings = new DictionaryMapper<string>(new Dictionary<string, string>
                {
                    ["Id"] = "id",
                    ["Uuid"] = "uuid",
                    ["Created"] = "created",
                    ["Updated"] = "updated",
                    ["Version"] = "version",
                    ["ApplicationId"] = "application_id",
                    ["Name"] = "name",
                    ["Value"] = "value",
                }),
                Ids = ["Id"],
                ReadProperties = ["Id", "Uuid", "Created", "Updated", "Version", "ApplicationId", "Name", "Value"],
                CreateProperties = ["Uuid", "Created", "Version", "ApplicationId", "Name", "Value"],
                UpdateProperties = ["Uuid", "Created", "Version", "ApplicationId", "Name", "Value"],
                Schema = new(new Dictionary<string, SchemaColumn>
                {
                    ["Id"] = new("biginteger", false, false, true),
                    ["Uuid"] = new("uuid", false, true),
                    ["Created"] = new("datetime", false, true),
                    ["Updated"] = new("datetime", false, true),
                    ["Version"] = new("binary", false, true),
                    ["ApplicationId"] = new("biginteger", false, false),
                    ["Name"] = new("string", false, false),
                    ["Value"] = new("string", false, false),
                }),
            })
            .For(connection);
}
