// schema-version: 1.0
namespace Backend.Types.Datasource;

/** Type IdentityProviderSigninAttemptsBase. */
public class IdentityProviderSigninAttemptsBase : Base
{
    public long IdentityProviderId { get; set; }
    public long SessionId { get; set; }
    public long AuthenticationMethodId { get; set; }
    public bool IsSuccess { get; set; }
}
