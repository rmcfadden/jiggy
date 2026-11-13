// schema-version: 1.0
namespace Backend.Types.View;

/** View Uri. */
public class Uri : Backend.Types.Datasource.UrisBase
{
    public string UriTypeName { get; set; } = "";
    public string? Description { get; set; }
}
