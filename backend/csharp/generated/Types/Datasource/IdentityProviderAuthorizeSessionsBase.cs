// schema-version: 1.0
namespace Backend.Types.Datasource;

/** Type IdentityProviderAuthorizeSessionsBase. */
public class IdentityProviderAuthorizeSessionsBase : Base
{
    public long IdentityProviderId { get; set; }
    public long SessionId { get; set; }
    public string RedirectUri { get; set; } = "";
    public string State { get; set; } = "";
    public string CodeChallenge { get; set; } = "";
    public string CodeChallengeMethod { get; set; } = "";
    public System.DateTime? Revoked { get; set; }
    public System.DateTime? Finished { get; set; }
    public bool IsDeleted { get; set; }
}
