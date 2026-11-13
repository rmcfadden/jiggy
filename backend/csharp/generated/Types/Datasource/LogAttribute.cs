// schema-version: 1.0
namespace Backend.Types.Datasource;

/** Type LogAttribute. */
public class LogAttribute : Base
{
    public long LogId { get; set; }
    public string Name { get; set; } = "";
    public string Value { get; set; } = "";
}
