namespace Backend.Services;

/// <summary><c>add-user</c> and <c>update-user</c>: argument parsing and output around <see cref="UserService"/>.</summary>
public static class UserCommands
{
    const string AddUsage = "add-user <username> --password=<pw> [--groups=a,b] [--roles=a,b] [--is_enabled=true|false]";
    const string UpdateUsage = "update-user <username> [--password=<pw>] [--is_enabled=true|false]";

    /// <summary>Runs the command (<paramref name="args"/> starts with its name); returns the process exit code.</summary>
    public static async Task<int> Run(UserService service, string[] args)
    {
        try
        {
            Console.WriteLine(args[0] == "add-user" ? await Add(service, args[1..]) : await Update(service, args[1..]));
            return 0;
        }
        catch (UserException error)
        {
            Console.Error.WriteLine(error.Message);
            return 1;
        }
    }

    static async Task<string> Add(UserService service, string[] args)
    {
        var (username, options) = Parse(args, AddUsage);
        if (!options.TryGetValue("password", out var password)) throw new UserException("--password is required");
        var created = await service.Create(new CreateUserInput(username, password, List(options, "roles"), List(options, "groups"), Bool(options)));
        return $"added user {created.Username} (id {created.Id})";
    }

    static async Task<string> Update(UserService service, string[] args)
    {
        var (username, options) = Parse(args, UpdateUsage);
        if (options.ContainsKey("groups") || options.ContainsKey("roles")) throw new UserException("update-user only changes --password and --is_enabled");
        var updated = await service.Update(username, new UpdateUserInput(options.GetValueOrDefault("password"), Bool(options)));
        return $"updated user {updated.Username}";
    }

    /// <summary>The username and the <c>--name=value</c> / <c>--name value</c> options of one command line.</summary>
    static (string Username, Dictionary<string, string> Options) Parse(string[] args, string usage)
    {
        var options = new Dictionary<string, string>();
        var positionals = new List<string>();
        for (var i = 0; i < args.Length; i++)
        {
            if (!args[i].StartsWith("--")) { positionals.Add(args[i]); continue; }
            var option = args[i][2..];
            string name, value;
            var eq = option.IndexOf('=');
            if (eq >= 0) (name, value) = (option[..eq], option[(eq + 1)..]);
            else if (i + 1 < args.Length) (name, value) = (option, args[++i]);
            else throw new UserException($"option --{option} needs a value\nusage: {usage}");
            if (name is not ("password" or "groups" or "roles" or "is_enabled")) throw new UserException($"unknown option --{name}\nusage: {usage}");
            options[name] = value;
        }
        if (positionals.Count != 1) throw new UserException($"usage: {usage}");
        return (positionals[0], options);
    }

    static List<string> List(Dictionary<string, string> options, string name) =>
        options.GetValueOrDefault(name, "").Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries).ToList();

    static bool? Bool(Dictionary<string, string> options) => options.GetValueOrDefault("is_enabled") switch
    {
        null => null,
        "true" => true,
        "false" => false,
        var other => throw new UserException($"--is_enabled must be true or false, got \"{other}\""),
    };
}
