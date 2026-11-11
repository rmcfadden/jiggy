// schema-version: 1.0
namespace Backend.Types.View;

/** View Secret. */
public class Secret : Backend.Types.Datasource.SecretsBase
{
    public string SecretTypeName { get; set; } = "";
    public string? Description { get; set; }
}
