using Datasources;

public sealed class UserSettingsRepository : CRUDRepository<Backend.Types.Datasource.UserSettings>
{
    public UserSettingsRepository(IConnection connection) : base(connection, Options(connection)) { }

    public static IReadonlyRepository<Backend.Types.Datasource.UserSettings> CreateReadonly(IConnection connection) =>
        new ReadonlyRepository<Backend.Types.Datasource.UserSettings>(connection, Options(connection));

    static CRUDRepositoryOptions<Backend.Types.Datasource.UserSettings> Options(IConnection connection) =>
        new CRUDRepositoryBuilder<Backend.Types.Datasource.UserSettings>()
            .Add(new()
            {
                Entity = "UserSettings",
                EntityMapper = new DictionaryMapper<string>(new Dictionary<string, string> { ["UserSettings"] = "user_settings" }),
                PropertyMappings = new DictionaryMapper<string>(new Dictionary<string, string>
                {
                    ["Id"] = "id",
                    ["Uuid"] = "uuid",
                    ["Created"] = "created",
                    ["Updated"] = "updated",
                    ["Version"] = "version",
                    ["UserId"] = "user_id",
                    ["Name"] = "name",
                    ["Value"] = "value",
                }),
                Ids = ["Id"],
                ReadProperties = ["Id", "Uuid", "Created", "Updated", "Version", "UserId", "Name", "Value"],
                CreateProperties = ["UserId", "Name", "Value"],
                UpdateProperties = ["Uuid", "UserId", "Name", "Value"],
                Schema = new(new Dictionary<string, SchemaColumn>
                {
                    ["Id"] = new("biginteger", false, false, true),
                    ["Uuid"] = new("uuid", false, true),
                    ["Created"] = new("datetime", false, true),
                    ["Updated"] = new("datetime", false, true),
                    ["Version"] = new("binary", false, true),
                    ["UserId"] = new("biginteger", false, false),
                    ["Name"] = new("string", false, false),
                    ["Value"] = new("string", false, false),
                }),
            })
            .Add("sqlite", new()
            {
                Entity = "UserSettings",
                EntityMapper = new DictionaryMapper<string>(new Dictionary<string, string> { ["UserSettings"] = "user_settings" }),
                PropertyMappings = new DictionaryMapper<string>(new Dictionary<string, string>
                {
                    ["Id"] = "id",
                    ["Uuid"] = "uuid",
                    ["Created"] = "created",
                    ["Updated"] = "updated",
                    ["Version"] = "version",
                    ["UserId"] = "user_id",
                    ["Name"] = "name",
                    ["Value"] = "value",
                }),
                Ids = ["Id"],
                ReadProperties = ["Id", "Uuid", "Created", "Updated", "Version", "UserId", "Name", "Value"],
                CreateProperties = ["Uuid", "Created", "Version", "UserId", "Name", "Value"],
                UpdateProperties = ["Uuid", "Created", "Version", "UserId", "Name", "Value"],
                Schema = new(new Dictionary<string, SchemaColumn>
                {
                    ["Id"] = new("biginteger", false, false, true),
                    ["Uuid"] = new("uuid", false, true),
                    ["Created"] = new("datetime", false, true),
                    ["Updated"] = new("datetime", false, true),
                    ["Version"] = new("binary", false, true),
                    ["UserId"] = new("biginteger", false, false),
                    ["Name"] = new("string", false, false),
                    ["Value"] = new("string", false, false),
                }),
            })
            .For(connection);
}
