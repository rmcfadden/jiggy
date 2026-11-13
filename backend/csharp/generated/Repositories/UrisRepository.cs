using Datasources;

public sealed class UrisRepository : CRUDRepository<Backend.Types.View.Uri>
{
    public UriTypesRepository UriType { get; }

    public UrisRepository(IConnection connection) : base(connection, Options(connection))
    {
        UriType = new UriTypesRepository(connection);
        AddEnriched(new("UriTypeName", "UriTypeId", "Id", "Name"), UriType);
    }

    public static IReadonlyRepository<Backend.Types.View.Uri> CreateReadonly(IConnection connection)
    {
        var repo = new ReadonlyRepository<Backend.Types.View.Uri>(connection, Options(connection));
        var UriType = new UriTypesRepository(connection);
        repo.AddEnriched(new("UriTypeName", "UriTypeId", "Id", "Name"), UriType);
        return repo;
    }

    static CRUDRepositoryOptions<Backend.Types.View.Uri> Options(IConnection connection) =>
        new CRUDRepositoryBuilder<Backend.Types.View.Uri>()
            .Add(new()
            {
                Entity = "Uri",
                EntityMapper = new DictionaryMapper<string>(new Dictionary<string, string> { ["Uri"] = "uris_bases" }),
                PropertyMappings = new DictionaryMapper<string>(new Dictionary<string, string>
                {
                    ["Id"] = "id",
                    ["Uuid"] = "uuid",
                    ["Created"] = "created",
                    ["Updated"] = "updated",
                    ["Version"] = "version",
                    ["UriTypeId"] = "uri_type_id",
                    ["Location"] = "location",
                    ["IsPublic"] = "is_public",
                    ["IsEnabled"] = "is_enabled",
                    ["IsDeleted"] = "is_deleted",
                    ["Description"] = "description",
                }),
                Ids = ["Id"],
                ReadProperties = ["Id", "Uuid", "Created", "Updated", "Version", "UriTypeId", "Location", "IsPublic", "IsEnabled", "IsDeleted", "Description"],
                CreateProperties = ["UriTypeId", "Location", "IsPublic", "IsEnabled", "IsDeleted", "Description"],
                UpdateProperties = ["Uuid", "UriTypeId", "Location", "IsPublic", "IsEnabled", "IsDeleted", "Description"],
                Schema = new(new Dictionary<string, SchemaColumn>
                {
                    ["Id"] = new("biginteger", false, false, true),
                    ["Uuid"] = new("uuid", false, true),
                    ["Created"] = new("datetime", false, true),
                    ["Updated"] = new("datetime", false, true),
                    ["Version"] = new("binary", false, true),
                    ["UriTypeId"] = new("biginteger", false, false),
                    ["Location"] = new("string", false, false),
                    ["IsPublic"] = new("boolean", false, true),
                    ["IsEnabled"] = new("boolean", false, true),
                    ["IsDeleted"] = new("boolean", false, true),
                    ["UriTypeName"] = new("string", false, false),
                    ["Description"] = new("string", true, false),
                }),
            })
            .Add("sqlite", new()
            {
                Entity = "Uri",
                EntityMapper = new DictionaryMapper<string>(new Dictionary<string, string> { ["Uri"] = "uris_bases" }),
                PropertyMappings = new DictionaryMapper<string>(new Dictionary<string, string>
                {
                    ["Id"] = "id",
                    ["Uuid"] = "uuid",
                    ["Created"] = "created",
                    ["Updated"] = "updated",
                    ["Version"] = "version",
                    ["UriTypeId"] = "uri_type_id",
                    ["Location"] = "location",
                    ["IsPublic"] = "is_public",
                    ["IsEnabled"] = "is_enabled",
                    ["IsDeleted"] = "is_deleted",
                    ["Description"] = "description",
                }),
                Ids = ["Id"],
                ReadProperties = ["Id", "Uuid", "Created", "Updated", "Version", "UriTypeId", "Location", "IsPublic", "IsEnabled", "IsDeleted", "Description"],
                CreateProperties = ["Uuid", "Created", "Version", "UriTypeId", "Location", "IsPublic", "IsEnabled", "IsDeleted", "Description"],
                UpdateProperties = ["Uuid", "Created", "Version", "UriTypeId", "Location", "IsPublic", "IsEnabled", "IsDeleted", "Description"],
                Schema = new(new Dictionary<string, SchemaColumn>
                {
                    ["Id"] = new("biginteger", false, false, true),
                    ["Uuid"] = new("uuid", false, true),
                    ["Created"] = new("datetime", false, true),
                    ["Updated"] = new("datetime", false, true),
                    ["Version"] = new("binary", false, true),
                    ["UriTypeId"] = new("biginteger", false, false),
                    ["Location"] = new("string", false, false),
                    ["IsPublic"] = new("boolean", false, true),
                    ["IsEnabled"] = new("boolean", false, true),
                    ["IsDeleted"] = new("boolean", false, true),
                    ["UriTypeName"] = new("string", false, false),
                    ["Description"] = new("string", true, false),
                }),
            })
            .For(connection);
}
