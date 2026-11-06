// schema-version: 1.0
namespace Backend.Types.Datasource;

/** Type Template. */
public class Template : Base
{
    public long TemplateTypeId { get; set; }
    public string Name { get; set; } = "";
    public string Content { get; set; } = "";
}
