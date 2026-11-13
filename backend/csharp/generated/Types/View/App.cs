// schema-version: 1.0
using System.Collections.Generic;

namespace Backend.Types.View;

/** View App. */
public class App : Backend.Types.Datasource.AppBase
{
    public Dictionary<string, string> Settings { get; set; } = [];
}
