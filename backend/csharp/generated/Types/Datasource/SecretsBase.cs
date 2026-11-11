// schema-version: 1.0
namespace Backend.Types.Datasource;

/** Type SecretsBase. */
public class SecretsBase : Base
{
    public long SecretTypeId { get; set; }
    public string Value { get; set; } = "";
    public System.DateTime? Expires { get; set; }
    public bool IsEnabled { get; set; } = true;
    public bool IsDeleted { get; set; }
}
