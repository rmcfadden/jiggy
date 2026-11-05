// schema-version: 1.0
using System.Collections.Generic;

namespace Backend.Types.View;

/** View Address. */
public class Address : Backend.Types.Datasource.AddressBase
{
    public string AddressTypeName { get; set; } = "";
    public string Description { get; set; } = "";
    public Dictionary<string, string> Attributes { get; set; } = [];
    public List<Backend.Types.Datasource.Label> Labels { get; set; } = [];
}
