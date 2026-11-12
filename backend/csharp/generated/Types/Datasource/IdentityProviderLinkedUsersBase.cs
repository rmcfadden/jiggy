// schema-version: 1.0
namespace Backend.Types.Datasource;

/** Type IdentityProviderLinkedUsersBase. */
public class IdentityProviderLinkedUsersBase : Base
{
    public long IdentityProviderId { get; set; }
    public long UserId { get; set; }
    public long IdentityProviderLinkedUserFieldTypeId { get; set; }
    public string Value { get; set; } = "";
}
