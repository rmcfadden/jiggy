// schema-version: 1.0
namespace Backend.Types.Datasource;

/** Type Setting. */
public class Setting : Base
{
    public long AppId { get; set; }
    public string Name { get; set; } = "";
    public string Value { get; set; } = "";
}
