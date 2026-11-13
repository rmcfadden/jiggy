// schema-version: 1.0
namespace Backend.Types.Datasource;

/** Type LogBase. */
public class LogBase : Base
{
    public long LogTypeId { get; set; }
    public string Message { get; set; } = "";
}
