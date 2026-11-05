// schema-version: 1.0
using System.Collections.Generic;

namespace Backend.Types.View;

/** View Phone. */
public class Phone : Backend.Types.Datasource.PhoneBase
{
    public string PhoneTypeName { get; set; } = "";
    public string Description { get; set; } = "";
    public Dictionary<string, string> Attributes { get; set; } = [];
    public List<Backend.Types.Datasource.Label> Labels { get; set; } = [];
}
