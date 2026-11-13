// schema-version: 1.0
namespace Backend.Types.Datasource;

/** Type UrisBase. */
public class UrisBase : Base
{
    public long UriTypeId { get; set; }
    public string Location { get; set; } = "";
    public bool IsPublic { get; set; }
    public bool IsEnabled { get; set; } = true;
    public bool IsDeleted { get; set; }
}
