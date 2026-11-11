using Datasources;

public sealed class SecretsRepository : CRUDRepository<Backend.Types.View.Secret>
{
    public SecretTypesRepository SecretType { get; }

    public SecretsRepository(IConnection connection) : base(connection, Options(connection))
    {
        SecretType = new SecretTypesRepository(connection);
        AddEnriched(new("SecretTypeName", "SecretTypeId", "Id", "Name"), SecretType);
        AddEnriched(new("Description", "SecretTypeId", "Id", "Description"), SecretType);
    }

    public static IReadonlyRepository<Backend.Types.View.Secret> CreateReadonly(IConnection connection)
    {
        var repo = new ReadonlyRepository<Backend.Types.View.Secret>(connection, Options(connection));
        var SecretType = new SecretTypesRepository(connection);
        repo.AddEnriched(new("SecretTypeName", "SecretTypeId", "Id", "Name"), SecretType);
        repo.AddEnriched(new("Description", "SecretTypeId", "Id", "Description"), SecretType);
        return repo;
    }

    static CRUDRepositoryOptions<Backend.Types.View.Secret> Options(IConnection connection) =>
        new CRUDRepositoryBuilder<Backend.Types.View.Secret>()
            .Add(new()
            {
                Entity = "Secret",
                EntityMapper = new DictionaryMapper<string>(new Dictionary<string, string> { ["Secret"] = "secrets_bases" }),
                PropertyMappings = new DictionaryMapper<string>(new Dictionary<string, string>
                {
                    ["Id"] = "id",
                    ["Uuid"] = "uuid",
                    ["Created"] = "created",
                    ["Updated"] = "updated",
                    ["Version"] = "version",
                    ["SecretTypeId"] = "secret_type_id",
                    ["Value"] = "value",
                    ["Expires"] = "expires",
                    ["IsEnabled"] = "is_enabled",
                    ["IsDeleted"] = "is_deleted",
                }),
                Ids = ["Id"],
                ReadProperties = ["Id", "Uuid", "Created", "Updated", "Version", "SecretTypeId", "Value", "Expires", "IsEnabled", "IsDeleted"],
                CreateProperties = ["SecretTypeId", "Value", "Expires", "IsEnabled", "IsDeleted"],
                UpdateProperties = ["Uuid", "SecretTypeId", "Value", "Expires", "IsEnabled", "IsDeleted"],
                Schema = new(new Dictionary<string, SchemaColumn>
                {
                    ["Id"] = new("biginteger", false, false, true),
                    ["Uuid"] = new("uuid", false, true),
                    ["Created"] = new("datetime", false, true),
                    ["Updated"] = new("datetime", false, true),
                    ["Version"] = new("binary", false, true),
                    ["SecretTypeId"] = new("biginteger", false, false),
                    ["Value"] = new("string", false, false),
                    ["Expires"] = new("datetime", true, false),
                    ["IsEnabled"] = new("boolean", false, true),
                    ["IsDeleted"] = new("boolean", false, true),
                    ["SecretTypeName"] = new("string", false, false),
                    ["Description"] = new("string", true, false),
                }),
            })
            .Add("sqlite", new()
            {
                Entity = "Secret",
                EntityMapper = new DictionaryMapper<string>(new Dictionary<string, string> { ["Secret"] = "secrets_bases" }),
                PropertyMappings = new DictionaryMapper<string>(new Dictionary<string, string>
                {
                    ["Id"] = "id",
                    ["Uuid"] = "uuid",
                    ["Created"] = "created",
                    ["Updated"] = "updated",
                    ["Version"] = "version",
                    ["SecretTypeId"] = "secret_type_id",
                    ["Value"] = "value",
                    ["Expires"] = "expires",
                    ["IsEnabled"] = "is_enabled",
                    ["IsDeleted"] = "is_deleted",
                }),
                Ids = ["Id"],
                ReadProperties = ["Id", "Uuid", "Created", "Updated", "Version", "SecretTypeId", "Value", "Expires", "IsEnabled", "IsDeleted"],
                CreateProperties = ["Uuid", "Created", "Version", "SecretTypeId", "Value", "Expires", "IsEnabled", "IsDeleted"],
                UpdateProperties = ["Uuid", "Created", "Version", "SecretTypeId", "Value", "Expires", "IsEnabled", "IsDeleted"],
                Schema = new(new Dictionary<string, SchemaColumn>
                {
                    ["Id"] = new("biginteger", false, false, true),
                    ["Uuid"] = new("uuid", false, true),
                    ["Created"] = new("datetime", false, true),
                    ["Updated"] = new("datetime", false, true),
                    ["Version"] = new("binary", false, true),
                    ["SecretTypeId"] = new("biginteger", false, false),
                    ["Value"] = new("string", false, false),
                    ["Expires"] = new("datetime", true, false),
                    ["IsEnabled"] = new("boolean", false, true),
                    ["IsDeleted"] = new("boolean", false, true),
                    ["SecretTypeName"] = new("string", false, false),
                    ["Description"] = new("string", true, false),
                }),
            })
            .For(connection);
}
