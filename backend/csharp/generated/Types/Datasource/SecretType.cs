// schema-version: 1.0
namespace Backend.Types.Datasource;

/** Type SecretType. */
public class SecretType : Base
{
    public string Name { get; set; } = "";
    public string? Description { get; set; }
}
