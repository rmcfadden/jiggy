// schema-version: 1.0
namespace Backend.Types.Datasource;

/** Type AddressAttribute. */
public class AddressAttribute : Base
{
    public long AddressId { get; set; }
    public string Name { get; set; } = "";
    public string Value { get; set; } = "";
}
