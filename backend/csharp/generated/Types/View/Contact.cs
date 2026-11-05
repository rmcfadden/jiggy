// schema-version: 1.0
using System.Collections.Generic;

namespace Backend.Types.View;

/** View Contact. */
public class Contact : Backend.Types.Datasource.ContactBase
{
    public List<Address> Addresses { get; set; } = [];
    public List<Email> Emails { get; set; } = [];
    public List<Phone> Phones { get; set; } = [];
    public Dictionary<string, string> Attributes { get; set; } = [];
    public List<Backend.Types.Datasource.Label> Labels { get; set; } = [];
}
