using Datasources;

public sealed class ResourcesRepository : CRUDRepository<Backend.Types.View.Resource>
{
    public MimeTypesRepository MimeType { get; }

    public ResourcesRepository(IConnection connection) : base(connection, Options(connection))
    {
        MimeType = new MimeTypesRepository(connection);
        AddEnriched(new("MimeTypeName", "MimeTypeId", "Id", "Name"), MimeType);
    }

    public static IReadonlyRepository<Backend.Types.View.Resource> CreateReadonly(IConnection connection)
    {
        var repo = new ReadonlyRepository<Backend.Types.View.Resource>(connection, Options(connection));
        var MimeType = new MimeTypesRepository(connection);
        repo.AddEnriched(new("MimeTypeName", "MimeTypeId", "Id", "Name"), MimeType);
        return repo;
    }

    static CRUDRepositoryOptions<Backend.Types.View.Resource> Options(IConnection connection) =>
        new CRUDRepositoryBuilder<Backend.Types.View.Resource>()
            .Add(new()
            {
                Entity = "Resource",
                EntityMapper = new DictionaryMapper<string>(new Dictionary<string, string> { ["Resource"] = "resource_bases" }),
                PropertyMappings = new DictionaryMapper<string>(new Dictionary<string, string>
                {
                    ["Id"] = "id",
                    ["Uuid"] = "uuid",
                    ["Created"] = "created",
                    ["Updated"] = "updated",
                    ["Version"] = "version",
                    ["ResourceName"] = "resource_name",
                    ["MimeTypeId"] = "mime_type_id",
                    ["Description"] = "description",
                    ["Location"] = "location",
                    ["IsEnabled"] = "is_enabled",
                    ["IsDeleted"] = "is_deleted",
                }),
                Ids = ["Id"],
                ReadProperties = ["Id", "Uuid", "Created", "Updated", "Version", "ResourceName", "MimeTypeId", "Description", "Location", "IsEnabled", "IsDeleted"],
                CreateProperties = ["ResourceName", "MimeTypeId", "Description", "Location", "IsEnabled", "IsDeleted"],
                UpdateProperties = ["Uuid", "ResourceName", "MimeTypeId", "Description", "Location", "IsEnabled", "IsDeleted"],
                Schema = new(new Dictionary<string, SchemaColumn>
                {
                    ["Id"] = new("biginteger", false, false, true),
                    ["Uuid"] = new("uuid", false, true),
                    ["Created"] = new("datetime", false, true),
                    ["Updated"] = new("datetime", false, true),
                    ["Version"] = new("binary", false, true),
                    ["ResourceName"] = new("string", false, false),
                    ["MimeTypeId"] = new("biginteger", false, false),
                    ["Description"] = new("string", false, false),
                    ["Location"] = new("string", false, false),
                    ["IsEnabled"] = new("boolean", false, true),
                    ["IsDeleted"] = new("boolean", false, true),
                }),
            })
            .Add("sqlite", new()
            {
                Entity = "Resource",
                EntityMapper = new DictionaryMapper<string>(new Dictionary<string, string> { ["Resource"] = "resource_bases" }),
                PropertyMappings = new DictionaryMapper<string>(new Dictionary<string, string>
                {
                    ["Id"] = "id",
                    ["Uuid"] = "uuid",
                    ["Created"] = "created",
                    ["Updated"] = "updated",
                    ["Version"] = "version",
                    ["ResourceName"] = "resource_name",
                    ["MimeTypeId"] = "mime_type_id",
                    ["Description"] = "description",
                    ["Location"] = "location",
                    ["IsEnabled"] = "is_enabled",
                    ["IsDeleted"] = "is_deleted",
                }),
                Ids = ["Id"],
                ReadProperties = ["Id", "Uuid", "Created", "Updated", "Version", "ResourceName", "MimeTypeId", "Description", "Location", "IsEnabled", "IsDeleted"],
                CreateProperties = ["Uuid", "Created", "Version", "ResourceName", "MimeTypeId", "Description", "Location", "IsEnabled", "IsDeleted"],
                UpdateProperties = ["Uuid", "Created", "Version", "ResourceName", "MimeTypeId", "Description", "Location", "IsEnabled", "IsDeleted"],
                Schema = new(new Dictionary<string, SchemaColumn>
                {
                    ["Id"] = new("biginteger", false, false, true),
                    ["Uuid"] = new("uuid", false, true),
                    ["Created"] = new("datetime", false, true),
                    ["Updated"] = new("datetime", false, true),
                    ["Version"] = new("binary", false, true),
                    ["ResourceName"] = new("string", false, false),
                    ["MimeTypeId"] = new("biginteger", false, false),
                    ["Description"] = new("string", false, false),
                    ["Location"] = new("string", false, false),
                    ["IsEnabled"] = new("boolean", false, true),
                    ["IsDeleted"] = new("boolean", false, true),
                }),
            })
            .For(connection);
}
