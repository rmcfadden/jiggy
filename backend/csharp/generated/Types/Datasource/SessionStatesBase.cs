// schema-version: 1.0
namespace Backend.Types.Datasource;

/** Type SessionStatesBase. */
public class SessionStatesBase : Base
{
    public long SessionId { get; set; }
    public string State { get; set; } = "";
    public string? CodeChallenge { get; set; }
    public string? CodeChallengeMethod { get; set; }
    public System.DateTime? Revoked { get; set; }
    public bool IsEnabled { get; set; } = true;
}
