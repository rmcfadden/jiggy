using Datasources;

public sealed class UsersRepository : CRUDRepository<Backend.Types.View.Users>
{
    public UserSettingsRepository UserSettings { get; }
    public RoleRepository Role { get; }
    public UserRoleRepository UserRole { get; }
    public GroupRepository Group { get; }
    public UserGroupRepository UserGroup { get; }

    public UsersRepository(IConnection connection) : base(connection, Options(connection))
    {
        UserSettings = new UserSettingsRepository(connection);
        Role = new RoleRepository(connection);
        UserRole = new UserRoleRepository(connection);
        Group = new GroupRepository(connection);
        UserGroup = new UserGroupRepository(connection);
        AddEnriched(new("Settings", "Id", "UserId", "Value", Type: EnrichmentPropertyType.Dictionary), UserSettings);
        AddLinked(new("Roles", "Id", "Id", Association: new("UserId", "RoleId")), Role, UserRole);
        AddLinked(new("Groups", "Id", "Id", Association: new("UserId", "GroupId")), Group, UserGroup);
    }

    public static IReadonlyRepository<Backend.Types.View.Users> CreateReadonly(IConnection connection)
    {
        var repo = new ReadonlyRepository<Backend.Types.View.Users>(connection, Options(connection));
        var UserSettings = new UserSettingsRepository(connection);
        var Role = new RoleRepository(connection);
        var UserRole = new UserRoleRepository(connection);
        var Group = new GroupRepository(connection);
        var UserGroup = new UserGroupRepository(connection);
        repo.AddEnriched(new("Settings", "Id", "UserId", "Value", Type: EnrichmentPropertyType.Dictionary), UserSettings);
        repo.AddEnriched(new("Roles", "Id", "Id", Type: EnrichmentPropertyType.List), Role);
        repo.AddEnriched(new("Groups", "Id", "Id", Type: EnrichmentPropertyType.List), Group);
        return repo;
    }

    static CRUDRepositoryOptions<Backend.Types.View.Users> Options(IConnection connection) =>
        new CRUDRepositoryBuilder<Backend.Types.View.Users>()
            .Add(new()
            {
                Entity = "Users",
                EntityMapper = new DictionaryMapper<string>(new Dictionary<string, string> { ["Users"] = "users" }),
                PropertyMappings = new DictionaryMapper<string>(new Dictionary<string, string>
                {
                    ["Id"] = "id",
                    ["Uuid"] = "uuid",
                    ["Created"] = "created",
                    ["Updated"] = "updated",
                    ["Version"] = "version",
                    ["Username"] = "username",
                    ["Password"] = "password",
                    ["IsEnabled"] = "is_enabled",
                }),
                Ids = ["Id"],
                ReadProperties = ["Id", "Uuid", "Created", "Updated", "Version", "Username", "Password", "IsEnabled"],
                CreateProperties = ["Username", "Password", "IsEnabled"],
                UpdateProperties = ["Uuid", "Username", "Password", "IsEnabled"],
                Schema = new(new Dictionary<string, SchemaColumn>
                {
                    ["Id"] = new("biginteger", false, false, true),
                    ["Uuid"] = new("uuid", false, true),
                    ["Created"] = new("datetime", false, true),
                    ["Updated"] = new("datetime", false, true),
                    ["Version"] = new("binary", false, true),
                    ["Username"] = new("string", false, false),
                    ["Password"] = new("string", false, false),
                    ["IsEnabled"] = new("boolean", false, true),
                }),
            })
            .Add("sqlite", new()
            {
                Entity = "Users",
                EntityMapper = new DictionaryMapper<string>(new Dictionary<string, string> { ["Users"] = "users" }),
                PropertyMappings = new DictionaryMapper<string>(new Dictionary<string, string>
                {
                    ["Id"] = "id",
                    ["Uuid"] = "uuid",
                    ["Created"] = "created",
                    ["Updated"] = "updated",
                    ["Version"] = "version",
                    ["Username"] = "username",
                    ["Password"] = "password",
                    ["IsEnabled"] = "is_enabled",
                }),
                Ids = ["Id"],
                ReadProperties = ["Id", "Uuid", "Created", "Updated", "Version", "Username", "Password", "IsEnabled"],
                CreateProperties = ["Uuid", "Created", "Version", "Username", "Password", "IsEnabled"],
                UpdateProperties = ["Uuid", "Created", "Version", "Username", "Password", "IsEnabled"],
                Schema = new(new Dictionary<string, SchemaColumn>
                {
                    ["Id"] = new("biginteger", false, false, true),
                    ["Uuid"] = new("uuid", false, true),
                    ["Created"] = new("datetime", false, true),
                    ["Updated"] = new("datetime", false, true),
                    ["Version"] = new("binary", false, true),
                    ["Username"] = new("string", false, false),
                    ["Password"] = new("string", false, false),
                    ["IsEnabled"] = new("boolean", false, true),
                }),
            })
            .For(connection);
}
