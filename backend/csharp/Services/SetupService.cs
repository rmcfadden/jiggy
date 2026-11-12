using Backend.Types.Datasource;
using Datasources;

namespace Backend.Services;

/// <summary>Seeds the identity data <c>setup</c> needs: default roles and groups, and a first admin user.</summary>
public class SetupService(ICRUDRepository<Role> roles, ICRUDRepository<Group> groups, UserService users)
{
    /// <summary>The roles and groups <c>setup</c> creates.</summary>
    static readonly string[] DefaultRoles = ["admin", "editor"];
    static readonly string[] DefaultGroups = ["admin", "support"];
    const string AdminUsername = "admin";
    const string UserUsername = "user";

    /// <summary>Adds the default roles and groups that are missing; returns what it added.</summary>
    public async Task<(List<string> Roles, List<string> Groups)> AddDefaults()
    {
        var haveRoles = new HashSet<string>();
        await foreach (var row in roles.Read()) haveRoles.Add(row.Name);
        var addedRoles = new List<string>();
        foreach (var name in DefaultRoles.Where(n => !haveRoles.Contains(n)))
        {
            await roles.Create(new Role { Name = name });
            addedRoles.Add(name);
        }
        var haveGroups = new HashSet<string>();
        await foreach (var row in groups.Read()) haveGroups.Add(row.Name);
        var addedGroups = new List<string>();
        foreach (var name in DefaultGroups.Where(n => !haveGroups.Contains(n)))
        {
            await groups.Create(new Group { Name = name });
            addedGroups.Add(name);
        }
        return (addedRoles, addedGroups);
    }

    /// <summary>
    /// Creates the <c>admin</c> user (role and group <c>admin</c>) when there are no users at all.
    /// Uses <paramref name="password"/> when given, otherwise a random one that is returned so the caller can show it once.
    /// </summary>
    public async Task<(string Password, bool Generated)?> AddAdmin(string? password)
    {
        if (await users.HasUsers()) return null;
        var generated = string.IsNullOrEmpty(password);
        var chosen = generated ? System.Buffers.Text.Base64Url.EncodeToString(System.Security.Cryptography.RandomNumberGenerator.GetBytes(15)) : password!;
        await users.Create(new CreateUserInput(AdminUsername, chosen, ["admin"], ["admin"], null));
        return (chosen, generated);
    }

    /// <summary>
    /// Creates the plain <c>user</c> account (no roles, no groups) when it does not exist yet.
    /// Uses <paramref name="password"/> when given, otherwise a random one that is returned so the caller can show it once.
    /// </summary>
    public async Task<(string Password, bool Generated)?> AddUser(string? password)
    {
        if (await users.Find(UserUsername) is not null) return null;
        var generated = string.IsNullOrEmpty(password);
        var chosen = generated ? System.Buffers.Text.Base64Url.EncodeToString(System.Security.Cryptography.RandomNumberGenerator.GetBytes(15)) : password!;
        await users.Create(new CreateUserInput(UserUsername, chosen, [], [], null));
        return (chosen, generated);
    }
}
