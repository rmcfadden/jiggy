using Datasources;

public sealed class EmailsRepository : CRUDRepository<Backend.Types.View.Email>
{
    public EmailAttributesRepository EmailAttribute { get; }
    public LabelsRepository Label { get; }
    public EmailLabelsRepository EmailLabel { get; }
    public EmailTypesRepository EmailType { get; }

    public EmailsRepository(IConnection connection) : base(connection, Options(connection))
    {
        EmailAttribute = new EmailAttributesRepository(connection);
        Label = new LabelsRepository(connection);
        EmailLabel = new EmailLabelsRepository(connection);
        EmailType = new EmailTypesRepository(connection);
        AddEnriched(new("Attributes", "Id", "EmailId", "Value", Type: EnrichmentPropertyType.Dictionary), EmailAttribute);
        AddLinked(new("Labels", "Id", "Id", "Name", Association: new("EmailId", "LabelId")), Label, EmailLabel);
        AddEnriched(new("EmailTypeName", "EmailTypeId", "Id", "Name"), EmailType);
    }

    public static IReadonlyRepository<Backend.Types.View.Email> CreateReadonly(IConnection connection)
    {
        var repo = new ReadonlyRepository<Backend.Types.View.Email>(connection, Options(connection));
        var EmailAttribute = new EmailAttributesRepository(connection);
        var Label = new LabelsRepository(connection);
        var EmailLabel = new EmailLabelsRepository(connection);
        var EmailType = new EmailTypesRepository(connection);
        repo.AddEnriched(new("Attributes", "Id", "EmailId", "Value", Type: EnrichmentPropertyType.Dictionary), EmailAttribute);
        repo.AddEnriched(new("Labels", "Id", "Id", "Name", Type: EnrichmentPropertyType.List), Label);
        repo.AddEnriched(new("EmailTypeName", "EmailTypeId", "Id", "Name"), EmailType);
        return repo;
    }

    static CRUDRepositoryOptions<Backend.Types.View.Email> Options(IConnection connection) =>
        new CRUDRepositoryBuilder<Backend.Types.View.Email>()
            .Add(new()
            {
                Entity = "Email",
                EntityMapper = new DictionaryMapper<string>(new Dictionary<string, string> { ["Email"] = "emails" }),
                PropertyMappings = new DictionaryMapper<string>(new Dictionary<string, string>
                {
                    ["Id"] = "id",
                    ["Uuid"] = "uuid",
                    ["Created"] = "created",
                    ["Updated"] = "updated",
                    ["Version"] = "version",
                    ["EmailTypeId"] = "email_type_id",
                    ["ContactId"] = "contact_id",
                    ["Address"] = "address",
                    ["DisplayName"] = "display_name",
                    ["IsPrimary"] = "is_primary",
                }),
                Ids = ["Id"],
                ReadProperties = ["Id", "Uuid", "Created", "Updated", "Version", "EmailTypeId", "ContactId", "Address", "DisplayName", "IsPrimary"],
                CreateProperties = ["EmailTypeId", "ContactId", "Address", "DisplayName", "IsPrimary"],
                UpdateProperties = ["Uuid", "EmailTypeId", "ContactId", "Address", "DisplayName", "IsPrimary"],
                Schema = new(new Dictionary<string, SchemaColumn>
                {
                    ["Id"] = new("biginteger", false, false, true),
                    ["Uuid"] = new("uuid", false, true),
                    ["Created"] = new("datetime", false, true),
                    ["Updated"] = new("datetime", false, true),
                    ["Version"] = new("binary", false, true),
                    ["EmailTypeId"] = new("biginteger", false, false),
                    ["ContactId"] = new("biginteger", false, false),
                    ["Address"] = new("string", false, false),
                    ["DisplayName"] = new("string", false, true),
                    ["IsPrimary"] = new("boolean", false, false),
                }),
            })
            .Add("sqlite", new()
            {
                Entity = "Email",
                EntityMapper = new DictionaryMapper<string>(new Dictionary<string, string> { ["Email"] = "email_bases" }),
                PropertyMappings = new DictionaryMapper<string>(new Dictionary<string, string>
                {
                    ["Id"] = "id",
                    ["Uuid"] = "uuid",
                    ["Created"] = "created",
                    ["Updated"] = "updated",
                    ["Version"] = "version",
                    ["EmailTypeId"] = "email_type_id",
                    ["ContactId"] = "contact_id",
                    ["Address"] = "address",
                    ["DisplayName"] = "display_name",
                    ["IsPrimary"] = "is_primary",
                }),
                Ids = ["Id"],
                ReadProperties = ["Id", "Uuid", "Created", "Updated", "Version", "EmailTypeId", "ContactId", "Address", "DisplayName", "IsPrimary"],
                CreateProperties = ["Uuid", "Created", "Version", "EmailTypeId", "ContactId", "Address", "DisplayName", "IsPrimary"],
                UpdateProperties = ["Uuid", "Created", "Version", "EmailTypeId", "ContactId", "Address", "DisplayName", "IsPrimary"],
                Schema = new(new Dictionary<string, SchemaColumn>
                {
                    ["Id"] = new("biginteger", false, false, true),
                    ["Uuid"] = new("uuid", false, true),
                    ["Created"] = new("datetime", false, true),
                    ["Updated"] = new("datetime", false, true),
                    ["Version"] = new("binary", false, true),
                    ["EmailTypeId"] = new("biginteger", false, false),
                    ["ContactId"] = new("biginteger", false, false),
                    ["Address"] = new("string", false, false),
                    ["DisplayName"] = new("string", false, true),
                    ["IsPrimary"] = new("boolean", false, false),
                }),
            })
            .For(connection);
}
