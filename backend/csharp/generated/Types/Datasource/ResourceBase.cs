// schema-version: 1.0
namespace Backend.Types.Datasource;

/** Type ResourceBase. */
public class ResourceBase : Base
{
    public string ResourceName { get; set; } = "";
    public long MimeTypeId { get; set; }
    public string Description { get; set; } = "";
    public string Location { get; set; } = "";
    public bool IsEnabled { get; set; } = true;
    public bool IsDeleted { get; set; }
}
