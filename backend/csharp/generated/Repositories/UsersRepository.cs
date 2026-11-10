using Datasources;

public sealed class UsersRepository : CRUDRepository<Backend.Types.View.User>
{
    public UserSettingsRepository UserSetting { get; }
    public RolesRepository Role { get; }
    public UserRolesRepository UserRole { get; }
    public GroupsRepository Group { get; }
    public UserGroupsRepository UserGroup { get; }

    public UsersRepository(IConnection connection) : base(connection, Options(connection))
    {
        UserSetting = new UserSettingsRepository(connection);
        Role = new RolesRepository(connection);
        UserRole = new UserRolesRepository(connection);
        Group = new GroupsRepository(connection);
        UserGroup = new UserGroupsRepository(connection);
        AddEnriched(new("Settings", "Id", "UserId", "Value", Type: EnrichmentPropertyType.Dictionary, DictionaryKey: "Name"), UserSetting);
        AddLinked(new("Roles", "Id", "Id", "Name", Association: new("UserId", "RoleId")), Role, UserRole);
        AddLinked(new("Groups", "Id", "Id", "Name", Association: new("UserId", "GroupId")), Group, UserGroup);
    }

    public static IReadonlyRepository<Backend.Types.View.User> CreateReadonly(IConnection connection)
    {
        var repo = new ReadonlyRepository<Backend.Types.View.User>(connection, Options(connection));
        var UserSetting = new UserSettingsRepository(connection);
        var Role = new RolesRepository(connection);
        var UserRole = new UserRolesRepository(connection);
        var Group = new GroupsRepository(connection);
        var UserGroup = new UserGroupsRepository(connection);
        repo.AddEnriched(new("Settings", "Id", "UserId", "Value", Type: EnrichmentPropertyType.Dictionary, DictionaryKey: "Name"), UserSetting);
        repo.AddEnriched(new("Roles", "Id", "Id", "Name", Type: EnrichmentPropertyType.List), Role);
        repo.AddEnriched(new("Groups", "Id", "Id", "Name", Type: EnrichmentPropertyType.List), Group);
        return repo;
    }

    static CRUDRepositoryOptions<Backend.Types.View.User> Options(IConnection connection) =>
        new CRUDRepositoryBuilder<Backend.Types.View.User>()
            .Add(new()
            {
                Entity = "User",
                EntityMapper = new DictionaryMapper<string>(new Dictionary<string, string> { ["User"] = "users" }),
                PropertyMappings = new DictionaryMapper<string>(new Dictionary<string, string>
                {
                    ["Id"] = "id",
                    ["Uuid"] = "uuid",
                    ["Created"] = "created",
                    ["Updated"] = "updated",
                    ["Version"] = "version",
                    ["Username"] = "username",
                    ["IsEnabled"] = "is_enabled",
                }),
                Ids = ["Id"],
                ReadProperties = ["Id", "Uuid", "Created", "Updated", "Version", "Username", "IsEnabled"],
                CreateProperties = ["Username", "IsEnabled"],
                UpdateProperties = ["Uuid", "Username", "IsEnabled"],
                Schema = new(new Dictionary<string, SchemaColumn>
                {
                    ["Id"] = new("biginteger", false, false, true),
                    ["Uuid"] = new("uuid", false, true),
                    ["Created"] = new("datetime", false, true),
                    ["Updated"] = new("datetime", false, true),
                    ["Version"] = new("binary", false, true),
                    ["Username"] = new("string", false, false),
                    ["IsEnabled"] = new("boolean", false, true),
                }),
            })
            .Add("sqlite", new()
            {
                Entity = "User",
                EntityMapper = new DictionaryMapper<string>(new Dictionary<string, string> { ["User"] = "users" }),
                PropertyMappings = new DictionaryMapper<string>(new Dictionary<string, string>
                {
                    ["Id"] = "id",
                    ["Uuid"] = "uuid",
                    ["Created"] = "created",
                    ["Updated"] = "updated",
                    ["Version"] = "version",
                    ["Username"] = "username",
                    ["IsEnabled"] = "is_enabled",
                }),
                Ids = ["Id"],
                ReadProperties = ["Id", "Uuid", "Created", "Updated", "Version", "Username", "IsEnabled"],
                CreateProperties = ["Uuid", "Created", "Version", "Username", "IsEnabled"],
                UpdateProperties = ["Uuid", "Created", "Version", "Username", "IsEnabled"],
                Schema = new(new Dictionary<string, SchemaColumn>
                {
                    ["Id"] = new("biginteger", false, false, true),
                    ["Uuid"] = new("uuid", false, true),
                    ["Created"] = new("datetime", false, true),
                    ["Updated"] = new("datetime", false, true),
                    ["Version"] = new("binary", false, true),
                    ["Username"] = new("string", false, false),
                    ["IsEnabled"] = new("boolean", false, true),
                }),
            })
            .For(connection);
}
