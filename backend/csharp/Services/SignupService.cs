using System.Security.Cryptography;
using System.Text.RegularExpressions;
using Backend.Types.Datasource;
using Backend.Types.View;
using Datasources;

namespace Backend.Services;

public record SignupInput(string? Username, string? Email, string Password);

public record SignupResult(string Username, IssuedToken Signin);

/// <summary>A rejected signup; <see cref="Status"/> is the HTTP status the route answers with (400 or 409).</summary>
public class SignupException(string message, int status) : Exception(message)
{
    public int Status { get; } = status;
}

/// <summary>Creates a user (and optionally an email contact) and issues the same signin token as /api/signin.</summary>
public partial class SignupService(
    UserService users,
    TokenService tokens,
    ICRUDRepository<Contact> contacts,
    ICRUDRepository<Email> emails,
    IReadonlyRepository<EmailType> emailTypes,
    IReadonlyRepository<Gender> genders)
{
    /// <summary>Name of the email type and gender used for contacts created at signup (looked up by name, not id).</summary>
    public const string SignupEmailType = "Personal";

    public const string SignupGender = "Other";

    const int MaxEmailLength = 320;
    const int MaxGenerateAttempts = 20;
    const string SuffixAlphabet = "abcdefghijklmnopqrstuvwxyz0123456789";

    [GeneratedRegex("^[A-Za-z0-9_.-]{3,32}$")]
    private static partial Regex UsernamePattern();

    public async Task<SignupResult> Signup(SignupInput input)
    {
        var requested = string.IsNullOrWhiteSpace(input.Username) ? null : input.Username.Trim();
        var address = input.Email is null ? null : NormalizeEmail(input.Email);
        if (requested is null && address is null) throw new SignupException("username or email is required", 400);
        if (requested is not null && !UsernamePattern().IsMatch(requested))
            throw new SignupException("username must be 3-32 characters: letters, digits, \"_\", \".\" or \"-\"", 400);

        // Everything that can be checked before touching the database happens first.
        long emailTypeId = 0, genderId = 0;
        if (address is not null)
        {
            emailTypeId = await IdByName(emailTypes, SignupEmailType, "email type", t => t.Name, t => t.Id);
            genderId = await IdByName(genders, SignupGender, "gender", g => g.Name, g => g.Id);
            if (await EmailTaken(address)) throw new SignupException("email is already registered", 409);
        }

        var created = await CreateUser(requested, address, input.Password);
        try
        {
            if (address is not null) await StoreEmail(created, address, emailTypeId, genderId);
            var signin = await tokens.IssueSignin(created.Id);
            return new SignupResult(created.Username, signin);
        }
        catch
        {
            await users.Remove(created); // do not leave an account the caller never learned about
            throw;
        }
    }

    /// <summary>Uses the requested username, or derives one from the email, retrying with a random suffix on collisions.</summary>
    async Task<User> CreateUser(string? requested, string? address, string password)
    {
        try
        {
            if (requested is not null) return await Create(requested);
            var baseName = UsernameFromEmail(address!);
            for (var attempt = 0; attempt < MaxGenerateAttempts; attempt++)
            {
                var username = attempt == 0 ? baseName : $"{baseName[..Math.Min(baseName.Length, 27)]}-{Suffix()}";
                try
                {
                    return await Create(username);
                }
                catch (UserExistsException)
                {
                }
            }
            throw new SignupException("could not generate a unique username; please choose one", 409);
        }
        catch (UserExistsException)
        {
            throw new SignupException("username is already taken", 409);
        }
        catch (UserException error)
        {
            throw new SignupException(error.Message, 400);
        }

        Task<User> Create(string username) => users.Create(new CreateUserInput(username, password, [], [], null));
    }

    async Task StoreEmail(User user, string address, long emailTypeId, long genderId)
    {
        var saved = await contacts.Create(new Contact { Name = user.Username, GivenName = user.Username, GenderTypeId = genderId, UserId = user.Id });
        try
        {
            await emails.Create(new Email { EmailTypeId = emailTypeId, ContactId = saved.Id, Address = address, IsPrimary = true });
        }
        catch
        {
            await contacts.Delete(saved);
            throw;
        }
    }

    async Task<bool> EmailTaken(string address)
    {
        await foreach (var row in emails.Read())
            if (row.Address.ToLowerInvariant() == address) return true;
        return false;
    }

    static async Task<long> IdByName<T>(IReadonlyRepository<T> repo, string name, string kind, Func<T, string> nameOf, Func<T, long> idOf)
    {
        await foreach (var row in repo.Read())
            if (nameOf(row) == name) return idOf(row);
        throw new InvalidOperationException($"{kind} \"{name}\" is missing; run the migrations");
    }

    /// <summary>Trims and lowercases an address and applies basic shape checks (one "@", non-empty parts, a dot in the domain).</summary>
    public static string NormalizeEmail(string raw)
    {
        var address = raw.Trim().ToLowerInvariant();
        var at = address.IndexOf('@');
        var valid = at > 0
            && address.Length <= MaxEmailLength
            && at == address.LastIndexOf('@')
            && !address.Any(char.IsWhiteSpace)
            && address[(at + 1)..] is var domain
            && domain.Contains('.')
            && !domain.StartsWith('.')
            && !domain.EndsWith('.');
        return valid ? address : throw new SignupException("email address is not valid", 400);
    }

    /// <summary>The email's local part reduced to username characters, padded to the minimum length; "user" if nothing is left.</summary>
    public static string UsernameFromEmail(string address)
    {
        var local = address.Split('@')[0].ToLowerInvariant();
        var cleaned = new string(local.Where(c => c is (>= 'a' and <= 'z') or (>= '0' and <= '9') or '_' or '.' or '-').Take(32).ToArray());
        if (cleaned.Length == 0) return "user";
        if (cleaned.Length >= 3) return cleaned;
        var padded = cleaned + Suffix();
        return padded[..Math.Min(padded.Length, 32)];
    }

    static string Suffix() => string.Create(4, 0, (span, _) =>
    {
        for (var i = 0; i < span.Length; i++) span[i] = SuffixAlphabet[RandomNumberGenerator.GetInt32(SuffixAlphabet.Length)];
    });
}
