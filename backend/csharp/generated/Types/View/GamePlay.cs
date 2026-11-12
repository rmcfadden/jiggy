// schema-version: 1.0
using System.Collections.Generic;

namespace Backend.Types.View;

/** View GamePlay. */
public class GamePlay : Backend.Types.Datasource.GamePlayBase
{
    public List<Backend.Types.Datasource.GamePlayState> States { get; set; } = [];
    public List<Backend.Types.Datasource.GamePlayAction> Actions { get; set; } = [];
    public List<User> Users { get; set; } = [];
}
