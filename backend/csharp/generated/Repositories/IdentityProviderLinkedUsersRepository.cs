using Datasources;

public sealed class IdentityProviderLinkedUsersRepository : CRUDRepository<Backend.Types.View.IdentityProviderLinkedUser>
{
    public IdentityProviderLinkedUserFieldTypesRepository IdentityProviderLinkedUserFieldType { get; }

    public IdentityProviderLinkedUsersRepository(IConnection connection) : base(connection, Options(connection))
    {
        IdentityProviderLinkedUserFieldType = new IdentityProviderLinkedUserFieldTypesRepository(connection);
        AddEnriched(new("IdentityProviderLinkedUserFieldTypeName", "IdentityProviderLinkedUserFieldTypeId", "Id", "Name"), IdentityProviderLinkedUserFieldType);
    }

    public static IReadonlyRepository<Backend.Types.View.IdentityProviderLinkedUser> CreateReadonly(IConnection connection)
    {
        var repo = new ReadonlyRepository<Backend.Types.View.IdentityProviderLinkedUser>(connection, Options(connection));
        var IdentityProviderLinkedUserFieldType = new IdentityProviderLinkedUserFieldTypesRepository(connection);
        repo.AddEnriched(new("IdentityProviderLinkedUserFieldTypeName", "IdentityProviderLinkedUserFieldTypeId", "Id", "Name"), IdentityProviderLinkedUserFieldType);
        return repo;
    }

    static CRUDRepositoryOptions<Backend.Types.View.IdentityProviderLinkedUser> Options(IConnection connection) =>
        new CRUDRepositoryBuilder<Backend.Types.View.IdentityProviderLinkedUser>()
            .Add(new()
            {
                Entity = "IdentityProviderLinkedUser",
                EntityMapper = new DictionaryMapper<string>(new Dictionary<string, string> { ["IdentityProviderLinkedUser"] = "identity_provider_linked_users_bases" }),
                PropertyMappings = new DictionaryMapper<string>(new Dictionary<string, string>
                {
                    ["Id"] = "id",
                    ["Uuid"] = "uuid",
                    ["Created"] = "created",
                    ["Updated"] = "updated",
                    ["Version"] = "version",
                    ["IdentityProviderId"] = "identity_provider_id",
                    ["UserId"] = "user_id",
                    ["IdentityProviderLinkedUserFieldTypeId"] = "identity_provider_linked_user_field_type_id",
                    ["Value"] = "value",
                }),
                Ids = ["Id"],
                ReadProperties = ["Id", "Uuid", "Created", "Updated", "Version", "IdentityProviderId", "UserId", "IdentityProviderLinkedUserFieldTypeId", "Value"],
                CreateProperties = ["IdentityProviderId", "UserId", "IdentityProviderLinkedUserFieldTypeId", "Value"],
                UpdateProperties = ["Uuid", "IdentityProviderId", "UserId", "IdentityProviderLinkedUserFieldTypeId", "Value"],
                Schema = new(new Dictionary<string, SchemaColumn>
                {
                    ["Id"] = new("biginteger", false, false, true),
                    ["Uuid"] = new("uuid", false, true),
                    ["Created"] = new("datetime", false, true),
                    ["Updated"] = new("datetime", false, true),
                    ["Version"] = new("binary", false, true),
                    ["IdentityProviderId"] = new("biginteger", false, false),
                    ["UserId"] = new("biginteger", false, false),
                    ["IdentityProviderLinkedUserFieldTypeId"] = new("biginteger", false, false),
                    ["Value"] = new("string", false, false),
                    ["IdentityProviderLinkedUserFieldTypeName"] = new("string", false, false),
                }),
            })
            .Add("sqlite", new()
            {
                Entity = "IdentityProviderLinkedUser",
                EntityMapper = new DictionaryMapper<string>(new Dictionary<string, string> { ["IdentityProviderLinkedUser"] = "identity_provider_linked_users_bases" }),
                PropertyMappings = new DictionaryMapper<string>(new Dictionary<string, string>
                {
                    ["Id"] = "id",
                    ["Uuid"] = "uuid",
                    ["Created"] = "created",
                    ["Updated"] = "updated",
                    ["Version"] = "version",
                    ["IdentityProviderId"] = "identity_provider_id",
                    ["UserId"] = "user_id",
                    ["IdentityProviderLinkedUserFieldTypeId"] = "identity_provider_linked_user_field_type_id",
                    ["Value"] = "value",
                }),
                Ids = ["Id"],
                ReadProperties = ["Id", "Uuid", "Created", "Updated", "Version", "IdentityProviderId", "UserId", "IdentityProviderLinkedUserFieldTypeId", "Value"],
                CreateProperties = ["Uuid", "Created", "Version", "IdentityProviderId", "UserId", "IdentityProviderLinkedUserFieldTypeId", "Value"],
                UpdateProperties = ["Uuid", "Created", "Version", "IdentityProviderId", "UserId", "IdentityProviderLinkedUserFieldTypeId", "Value"],
                Schema = new(new Dictionary<string, SchemaColumn>
                {
                    ["Id"] = new("biginteger", false, false, true),
                    ["Uuid"] = new("uuid", false, true),
                    ["Created"] = new("datetime", false, true),
                    ["Updated"] = new("datetime", false, true),
                    ["Version"] = new("binary", false, true),
                    ["IdentityProviderId"] = new("biginteger", false, false),
                    ["UserId"] = new("biginteger", false, false),
                    ["IdentityProviderLinkedUserFieldTypeId"] = new("biginteger", false, false),
                    ["Value"] = new("string", false, false),
                    ["IdentityProviderLinkedUserFieldTypeName"] = new("string", false, false),
                }),
            })
            .For(connection);
}
