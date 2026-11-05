// schema-version: 1.0
using System.Collections.Generic;

namespace Backend.Types.View;

/** View Email. */
public class Email : Backend.Types.Datasource.EmailBase
{
    public string EmailTypeName { get; set; } = "";
    public string Description { get; set; } = "";
    public Dictionary<string, string> Attributes { get; set; } = [];
    public List<Backend.Types.Datasource.Label> Labels { get; set; } = [];
}
