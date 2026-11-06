// schema-version: 1.0
namespace Backend.Types.Datasource;

/** Type StringBase. */
public class StringBase : Base
{
    public long StringNameId { get; set; }
    public long LanguageId { get; set; }
    public string Value { get; set; } = "";
    public bool IsEnabled { get; set; } = true;
    public bool IsDeleted { get; set; }
}
