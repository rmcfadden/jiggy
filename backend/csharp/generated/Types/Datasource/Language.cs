// schema-version: 1.0
namespace Backend.Types.Datasource;

/** Type Language. */
public class Language : Base
{
    public string Code { get; set; } = "";
    public string Name { get; set; } = "";
    public bool IsEnabled { get; set; } = true;
    public bool IsDeleted { get; set; }
}
