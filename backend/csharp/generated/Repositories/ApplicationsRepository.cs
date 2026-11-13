using Datasources;

public sealed class ApplicationsRepository : CRUDRepository<Backend.Types.View.Application>
{
    public ApplicationsRepository(IConnection connection) : base(connection, Options(connection)) { }

    public static IReadonlyRepository<Backend.Types.View.Application> CreateReadonly(IConnection connection) =>
        new ReadonlyRepository<Backend.Types.View.Application>(connection, Options(connection));

    static CRUDRepositoryOptions<Backend.Types.View.Application> Options(IConnection connection) =>
        new CRUDRepositoryBuilder<Backend.Types.View.Application>()
            .Add(new()
            {
                Entity = "Application",
                EntityMapper = new DictionaryMapper<string>(new Dictionary<string, string> { ["Application"] = "applications" }),
                PropertyMappings = new DictionaryMapper<string>(new Dictionary<string, string>
                {
                    ["Id"] = "id",
                    ["Uuid"] = "uuid",
                    ["Created"] = "created",
                    ["Updated"] = "updated",
                    ["Version"] = "version",
                    ["Name"] = "name",
                    ["ApplicationTypeId"] = "application_type_id",
                    ["ApplicationVisibilityId"] = "application_visibility_id",
                    ["ClientId"] = "client_id",
                    ["Description"] = "description",
                    ["IsEnabled"] = "is_enabled",
                    ["IsDeleted"] = "is_deleted",
                    ["IsBuiltin"] = "is_builtin",
                }),
                Ids = ["Id"],
                ReadProperties = ["Id", "Uuid", "Created", "Updated", "Version", "Name", "ApplicationTypeId", "ApplicationVisibilityId", "ClientId", "Description", "IsEnabled", "IsDeleted", "IsBuiltin"],
                CreateProperties = ["Name", "ApplicationTypeId", "ApplicationVisibilityId", "ClientId", "Description", "IsEnabled", "IsDeleted", "IsBuiltin"],
                UpdateProperties = ["Uuid", "Name", "ApplicationTypeId", "ApplicationVisibilityId", "ClientId", "Description", "IsEnabled", "IsDeleted", "IsBuiltin"],
                Schema = new(new Dictionary<string, SchemaColumn>
                {
                    ["Id"] = new("biginteger", false, false, true),
                    ["Uuid"] = new("uuid", false, true),
                    ["Created"] = new("datetime", false, true),
                    ["Updated"] = new("datetime", false, true),
                    ["Version"] = new("binary", false, true),
                    ["Name"] = new("string", false, false),
                    ["ApplicationTypeId"] = new("biginteger", false, false),
                    ["ApplicationVisibilityId"] = new("biginteger", false, false),
                    ["ClientId"] = new("string", false, false),
                    ["Description"] = new("string", true, false),
                    ["IsEnabled"] = new("boolean", false, true),
                    ["IsDeleted"] = new("boolean", false, true),
                    ["IsBuiltin"] = new("boolean", false, true),
                }),
            })
            .Add("sqlite", new()
            {
                Entity = "Application",
                EntityMapper = new DictionaryMapper<string>(new Dictionary<string, string> { ["Application"] = "applications" }),
                PropertyMappings = new DictionaryMapper<string>(new Dictionary<string, string>
                {
                    ["Id"] = "id",
                    ["Uuid"] = "uuid",
                    ["Created"] = "created",
                    ["Updated"] = "updated",
                    ["Version"] = "version",
                    ["Name"] = "name",
                    ["ApplicationTypeId"] = "application_type_id",
                    ["ApplicationVisibilityId"] = "application_visibility_id",
                    ["ClientId"] = "client_id",
                    ["Description"] = "description",
                    ["IsEnabled"] = "is_enabled",
                    ["IsDeleted"] = "is_deleted",
                    ["IsBuiltin"] = "is_builtin",
                }),
                Ids = ["Id"],
                ReadProperties = ["Id", "Uuid", "Created", "Updated", "Version", "Name", "ApplicationTypeId", "ApplicationVisibilityId", "ClientId", "Description", "IsEnabled", "IsDeleted", "IsBuiltin"],
                CreateProperties = ["Uuid", "Created", "Version", "Name", "ApplicationTypeId", "ApplicationVisibilityId", "ClientId", "Description", "IsEnabled", "IsDeleted", "IsBuiltin"],
                UpdateProperties = ["Uuid", "Created", "Version", "Name", "ApplicationTypeId", "ApplicationVisibilityId", "ClientId", "Description", "IsEnabled", "IsDeleted", "IsBuiltin"],
                Schema = new(new Dictionary<string, SchemaColumn>
                {
                    ["Id"] = new("biginteger", false, false, true),
                    ["Uuid"] = new("uuid", false, true),
                    ["Created"] = new("datetime", false, true),
                    ["Updated"] = new("datetime", false, true),
                    ["Version"] = new("binary", false, true),
                    ["Name"] = new("string", false, false),
                    ["ApplicationTypeId"] = new("biginteger", false, false),
                    ["ApplicationVisibilityId"] = new("biginteger", false, false),
                    ["ClientId"] = new("string", false, false),
                    ["Description"] = new("string", true, false),
                    ["IsEnabled"] = new("boolean", false, true),
                    ["IsDeleted"] = new("boolean", false, true),
                    ["IsBuiltin"] = new("boolean", false, true),
                }),
            })
            .For(connection);
}
