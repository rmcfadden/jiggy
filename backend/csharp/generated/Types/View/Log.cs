// schema-version: 1.0
using System.Collections.Generic;

namespace Backend.Types.View;

/** View Log. */
public class Log
{
    public long Id { get; set; }
    public System.Guid Uuid { get; set; } = Guid.NewGuid();
    public System.DateTime Created { get; set; } = DateTime.UtcNow;
    public System.DateTime Updated { get; set; } = DateTime.UtcNow;
    public byte[] Version { get; set; } = new byte[] { 0 };
    public string Message { get; set; } = "";
    public string LogTypeName { get; set; } = "";
    public Dictionary<string, string> Attributes { get; set; } = [];
}
