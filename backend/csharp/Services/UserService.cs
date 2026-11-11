using System.Text;
using Backend.Types.Datasource;
using Backend.Types.View;
using Datasources;

namespace Backend.Services;

public record CreateUserInput(string Username, string Password, IReadOnlyList<string> Roles, IReadOnlyList<string> Groups, bool? IsEnabled);

public record UpdateUserInput(string? Password, bool? IsEnabled);

/// <summary>A bad argument or a missing/duplicate record; the CLI prints the message and exits 1.</summary>
public class UserException(string message) : Exception(message);

public class UserService(
    ICRUDRepository<User> users,
    ICRUDRepository<Role> roles,
    ICRUDRepository<Group> groups,
    ICRUDRepository<Secret> secrets,
    IReadonlyRepository<SecretType> secretTypes,
    ICRUDRepository<UserSecret> userSecrets)
{
    /// <summary>The secret type that holds a bcrypt password hash (looked up by name, not id).</summary>
    public const string PasswordSecretType = "password_bcrypt";

    /// <summary>bcrypt cost factor; a random salt is generated per hash and stored inside the hash string.</summary>
    const int BcryptCost = 12;

    /// <summary>bcrypt only uses the first 72 bytes of the input.</summary>
    const int MaxPasswordBytes = 72;

    public async Task<User> Create(CreateUserInput input)
    {
        var username = input.Username.Trim();
        if (username.Length == 0) throw new UserException("username is required");
        CheckPassword(input.Password);
        if (await Find(username) is not null) throw new UserException($"user \"{username}\" already exists");
        var userRoles = await ByName(roles, input.Roles, "role", r => r.Name);
        var userGroups = await ByName(groups, input.Groups, "group", g => g.Name);
        var secretTypeId = await PasswordTypeId();
        var hash = BCrypt.Net.BCrypt.HashPassword(input.Password, BcryptCost);

        var created = await users.Create(new User { Username = username, IsEnabled = input.IsEnabled ?? true, Roles = userRoles, Groups = userGroups });
        try
        {
            await StorePassword(created.Id, secretTypeId, hash);
        }
        catch
        {
            await users.Delete(created); // do not leave a user nobody can log in as
            throw;
        }
        return created;
    }

    public async Task<User> Update(string username, UpdateUserInput input)
    {
        if (input.Password is null && input.IsEnabled is null) throw new UserException("nothing to update: pass --password and/or --is_enabled");
        if (input.Password is not null) CheckPassword(input.Password);
        var user = await Find(username) ?? throw new UserException($"user \"{username}\" not found");
        var secretTypeId = input.Password is null ? 0 : await PasswordTypeId();
        var hash = input.Password is null ? "" : BCrypt.Net.BCrypt.HashPassword(input.Password, BcryptCost);

        if (input.IsEnabled is { } enabled && enabled != user.IsEnabled)
        {
            user.IsEnabled = enabled;
            await users.Update(user);
        }
        if (input.Password is not null)
        {
            var current = await PasswordSecret(user.Id, secretTypeId);
            if (current is null) await StorePassword(user.Id, secretTypeId, hash);
            else
            {
                current.Value = hash;
                await secrets.Update(current);
            }
        }
        return user;
    }

    /// <summary>True when <paramref name="plain"/> matches the user's stored password hash.</summary>
    public async Task<bool> VerifyPassword(string username, string plain)
    {
        var user = await Find(username);
        if (user is null) return false;
        var current = await PasswordSecret(user.Id, await PasswordTypeId());
        return current is not null && BCrypt.Net.BCrypt.Verify(plain, current.Value);
    }

    public async Task<bool> HasUsers()
    {
        await foreach (var _ in users.Read()) return true;
        return false;
    }

    public async Task<User?> Find(string username)
    {
        await foreach (var row in users.Read())
            if (row.Username == username) return row;
        return null;
    }

    /// <summary>Resolves names to rows; throws listing every unknown name so nothing is half-created.</summary>
    static async Task<List<T>> ByName<T>(IReadonlyRepository<T> repo, IReadOnlyList<string> names, string kind, Func<T, string> nameOf)
    {
        if (names.Count == 0) return [];
        var rows = new Dictionary<string, T>();
        await foreach (var row in repo.Read()) rows[nameOf(row)] = row;
        var unknown = names.Where(n => !rows.ContainsKey(n)).ToList();
        if (unknown.Count > 0)
            throw new UserException($"unknown {kind}{(unknown.Count > 1 ? "s" : "")}: {string.Join(", ", unknown)} (run \"setup\" to add the defaults)");
        return names.Distinct().Select(n => rows[n]).ToList();
    }

    async Task<long> PasswordTypeId()
    {
        await foreach (var row in secretTypes.Read())
            if (row.Name == PasswordSecretType) return row.Id;
        throw new UserException($"secret type \"{PasswordSecretType}\" is missing; run the migrations");
    }

    async Task StorePassword(long userId, long secretTypeId, string hash)
    {
        var saved = await secrets.Create(new Secret { SecretTypeId = secretTypeId, Value = hash });
        try
        {
            await userSecrets.Create(new UserSecret { UserId = userId, SecretId = saved.Id });
        }
        catch
        {
            await secrets.Delete(saved);
            throw;
        }
    }

    /// <summary>The user's live password secret, if there is one.</summary>
    async Task<Secret?> PasswordSecret(long userId, long secretTypeId)
    {
        var ids = new HashSet<long>();
        await foreach (var link in userSecrets.Read())
            if (link.UserId == userId) ids.Add(link.SecretId);
        await foreach (var row in secrets.Read())
            if (ids.Contains(row.Id) && row.SecretTypeId == secretTypeId && !row.IsDeleted) return row;
        return null;
    }

    static void CheckPassword(string password)
    {
        if (password.Length == 0) throw new UserException("password must not be empty");
        if (Encoding.UTF8.GetByteCount(password) > MaxPasswordBytes) throw new UserException($"password is longer than {MaxPasswordBytes} bytes (bcrypt limit)");
    }
}
