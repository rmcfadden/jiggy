// schema-version: 1.0
using System.Collections.Generic;

namespace Backend.Types.View;

/** View UserDetail. */
public class UserDetail : Backend.Types.Datasource.User
{
    public Dictionary<string, string> Settings { get; set; } = [];
    public List<Backend.Types.Datasource.Role> Roles { get; set; } = [];
    public List<Backend.Types.Datasource.Group> Groups { get; set; } = [];
}
