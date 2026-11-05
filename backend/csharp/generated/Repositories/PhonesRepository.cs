using Datasources;

public sealed class PhonesRepository : CRUDRepository<Backend.Types.View.Phone>
{
    public PhoneAttributesRepository PhoneAttribute { get; }
    public LabelsRepository Label { get; }
    public PhoneLabelsRepository PhoneLabel { get; }
    public PhoneTypesRepository PhoneType { get; }

    public PhonesRepository(IConnection connection) : base(connection, Options(connection))
    {
        PhoneAttribute = new PhoneAttributesRepository(connection);
        Label = new LabelsRepository(connection);
        PhoneLabel = new PhoneLabelsRepository(connection);
        PhoneType = new PhoneTypesRepository(connection);
        AddEnriched(new("Attributes", "Id", "PhoneId", "Value", Type: EnrichmentPropertyType.Dictionary), PhoneAttribute);
        AddLinked(new("Labels", "Id", "Id", "Name", Association: new("PhoneId", "LabelId")), Label, PhoneLabel);
        AddEnriched(new("PhoneTypeName", "PhoneTypeId", "Id", "Name"), PhoneType);
    }

    public static IReadonlyRepository<Backend.Types.View.Phone> CreateReadonly(IConnection connection)
    {
        var repo = new ReadonlyRepository<Backend.Types.View.Phone>(connection, Options(connection));
        var PhoneAttribute = new PhoneAttributesRepository(connection);
        var Label = new LabelsRepository(connection);
        var PhoneLabel = new PhoneLabelsRepository(connection);
        var PhoneType = new PhoneTypesRepository(connection);
        repo.AddEnriched(new("Attributes", "Id", "PhoneId", "Value", Type: EnrichmentPropertyType.Dictionary), PhoneAttribute);
        repo.AddEnriched(new("Labels", "Id", "Id", "Name", Type: EnrichmentPropertyType.List), Label);
        repo.AddEnriched(new("PhoneTypeName", "PhoneTypeId", "Id", "Name"), PhoneType);
        return repo;
    }

    static CRUDRepositoryOptions<Backend.Types.View.Phone> Options(IConnection connection) =>
        new CRUDRepositoryBuilder<Backend.Types.View.Phone>()
            .Add(new()
            {
                Entity = "Phone",
                EntityMapper = new DictionaryMapper<string>(new Dictionary<string, string> { ["Phone"] = "phones" }),
                PropertyMappings = new DictionaryMapper<string>(new Dictionary<string, string>
                {
                    ["Id"] = "id",
                    ["Uuid"] = "uuid",
                    ["Created"] = "created",
                    ["Updated"] = "updated",
                    ["Version"] = "version",
                    ["PhoneTypeId"] = "phone_type_id",
                    ["ContactId"] = "contact_id",
                    ["Number"] = "number",
                    ["DisplayName"] = "display_name",
                    ["Extention"] = "extention",
                    ["IsPrimary"] = "is_primary",
                    ["IsVerified"] = "is_verified",
                }),
                Ids = ["Id"],
                ReadProperties = ["Id", "Uuid", "Created", "Updated", "Version", "PhoneTypeId", "ContactId", "Number", "DisplayName", "Extention", "IsPrimary", "IsVerified"],
                CreateProperties = ["PhoneTypeId", "ContactId", "Number", "DisplayName", "Extention", "IsPrimary", "IsVerified"],
                UpdateProperties = ["Uuid", "PhoneTypeId", "ContactId", "Number", "DisplayName", "Extention", "IsPrimary", "IsVerified"],
                Schema = new(new Dictionary<string, SchemaColumn>
                {
                    ["Id"] = new("biginteger", false, false, true),
                    ["Uuid"] = new("uuid", false, true),
                    ["Created"] = new("datetime", false, true),
                    ["Updated"] = new("datetime", false, true),
                    ["Version"] = new("binary", false, true),
                    ["PhoneTypeId"] = new("biginteger", false, false),
                    ["ContactId"] = new("biginteger", false, false),
                    ["Number"] = new("string", false, false),
                    ["DisplayName"] = new("string", false, false),
                    ["Extention"] = new("string", false, false),
                    ["IsPrimary"] = new("boolean", false, false),
                    ["IsVerified"] = new("boolean", false, true),
                }),
            })
            .Add("sqlite", new()
            {
                Entity = "Phone",
                EntityMapper = new DictionaryMapper<string>(new Dictionary<string, string> { ["Phone"] = "phone_bases" }),
                PropertyMappings = new DictionaryMapper<string>(new Dictionary<string, string>
                {
                    ["Id"] = "id",
                    ["Uuid"] = "uuid",
                    ["Created"] = "created",
                    ["Updated"] = "updated",
                    ["Version"] = "version",
                    ["PhoneTypeId"] = "phone_type_id",
                    ["ContactId"] = "contact_id",
                    ["Number"] = "number",
                    ["DisplayName"] = "display_name",
                    ["Extention"] = "extention",
                    ["IsPrimary"] = "is_primary",
                    ["IsVerified"] = "is_verified",
                }),
                Ids = ["Id"],
                ReadProperties = ["Id", "Uuid", "Created", "Updated", "Version", "PhoneTypeId", "ContactId", "Number", "DisplayName", "Extention", "IsPrimary", "IsVerified"],
                CreateProperties = ["Uuid", "Created", "Version", "PhoneTypeId", "ContactId", "Number", "DisplayName", "Extention", "IsPrimary", "IsVerified"],
                UpdateProperties = ["Uuid", "Created", "Version", "PhoneTypeId", "ContactId", "Number", "DisplayName", "Extention", "IsPrimary", "IsVerified"],
                Schema = new(new Dictionary<string, SchemaColumn>
                {
                    ["Id"] = new("biginteger", false, false, true),
                    ["Uuid"] = new("uuid", false, true),
                    ["Created"] = new("datetime", false, true),
                    ["Updated"] = new("datetime", false, true),
                    ["Version"] = new("binary", false, true),
                    ["PhoneTypeId"] = new("biginteger", false, false),
                    ["ContactId"] = new("biginteger", false, false),
                    ["Number"] = new("string", false, false),
                    ["DisplayName"] = new("string", false, false),
                    ["Extention"] = new("string", false, false),
                    ["IsPrimary"] = new("boolean", false, false),
                    ["IsVerified"] = new("boolean", false, true),
                }),
            })
            .For(connection);
}
