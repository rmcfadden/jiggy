// schema-version: 1.0
namespace Backend.Types.Datasource;

/** Type TemplateBase. */
public class TemplateBase : Base
{
    public long TemplateTypeId { get; set; }
    public string Name { get; set; } = "";
    public string Content { get; set; } = "";
}
