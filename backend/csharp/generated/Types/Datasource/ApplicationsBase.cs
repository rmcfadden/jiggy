// schema-version: 1.0
namespace Backend.Types.Datasource;

/** Type ApplicationsBase. */
public class ApplicationsBase : Base
{
    public string Name { get; set; } = "";
    public long ApplicationTypeId { get; set; }
    public long ApplicationVisibilityId { get; set; }
    public string ClientId { get; set; } = "";
    public string? Description { get; set; }
    public bool IsEnabled { get; set; } = true;
    public bool IsDeleted { get; set; }
    public bool IsBuiltin { get; set; }
}
