using Backend.Routes;
using Amazon.S3;
using Backend.Services;
using Backend.Services.Images;
using Backend.Types.View;
using Datasources;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddSingleton(Datasource.Default!);
builder.Services.AddSingleton(sp => new CategoriesService(sp.GetRequiredService<IDatasource>().CreateRepository<Category>("Categories")));
builder.Services.AddSingleton(sp => new GameParentsService(sp.GetRequiredService<IDatasource>().CreateRepository<GameParent>("GameParents")));
builder.Services.AddSingleton(sp =>
{
    var ds = sp.GetRequiredService<IDatasource>();
    return new TemplatesService(ds.CreateRepository<Backend.Types.View.Template>("Templates"), ds.CreateReadonlyRepository<Backend.Types.Datasource.TemplateType>("TemplateTypes"));
});
builder.Services.AddSingleton<IImageStorage>(sp =>
{
    var config = sp.GetRequiredService<IConfiguration>().GetSection("Images");
    if (config["Provider"]?.ToLowerInvariant() != "s3")
        return new LocalImageStorage(config["LocalPath"] ?? "uploads", config["PublicBaseUrl"] ?? "http://localhost:5000");
    var region = config["S3:Region"] ?? throw new InvalidOperationException("Images:S3:Region is required");
    var bucket = config["S3:Bucket"] ?? throw new InvalidOperationException("Images:S3:Bucket is required");
    return new S3ImageStorage(new AmazonS3Client(Amazon.RegionEndpoint.GetBySystemName(region)), bucket, region, config["S3:PublicBaseUrl"]);
});
builder.Services.AddSingleton(sp =>
{
    var ds = sp.GetRequiredService<IDatasource>();
    return new ImagesService(ds.CreateRepository<Backend.Types.View.Resource>("Resources"), ds.CreateReadonlyRepository<Backend.Types.Datasource.MimeType>("MimeTypes"), sp.GetRequiredService<IImageStorage>());
});
builder.Services.AddSingleton(sp =>
{
    var ds = sp.GetRequiredService<IDatasource>();
    return new GamesService(
        ds.CreateRepository<Backend.Types.View.Game>("Games"),
        ds.CreateRepository<Backend.Types.Datasource.GameCategory>("GameCategories"),
        sp.GetRequiredService<CategoriesService>(),
        sp.GetRequiredService<GameParentsService>(),
        sp.GetRequiredService<TemplatesService>(),
        sp.GetRequiredService<ImagesService>());
});
builder.Services.AddSingleton(sp =>
{
    var ds = sp.GetRequiredService<IDatasource>();
    return new UserService(
        ds.CreateRepository<User>("Users"),
        ds.CreateRepository<Backend.Types.Datasource.Role>("Roles"),
        ds.CreateRepository<Backend.Types.Datasource.Group>("Groups"),
        ds.CreateRepository<Secret>("Secrets"),
        ds.CreateReadonlyRepository<Backend.Types.Datasource.SecretType>("SecretTypes"),
        ds.CreateRepository<Backend.Types.Datasource.UserSecret>("UserSecrets"));
});
builder.Services.AddSingleton(sp =>
{
    var ds = sp.GetRequiredService<IDatasource>();
    return new SetupService(ds.CreateRepository<Backend.Types.Datasource.Role>("Roles"), ds.CreateRepository<Backend.Types.Datasource.Group>("Groups"), sp.GetRequiredService<UserService>());
});
builder.Services.AddSingleton(sp => TokenSettings.From(sp.GetRequiredService<IConfiguration>()));
builder.Services.AddSingleton(sp =>
{
    var ds = sp.GetRequiredService<IDatasource>();
    return new TokenService(
        ds.CreateRepository<Backend.Types.View.Token>("Tokens"),
        ds.CreateRepository<Backend.Types.Datasource.UserToken>("UserTokens"),
        ds.CreateReadonlyRepository<Backend.Types.Datasource.TokenType>("TokenTypes"),
        sp.GetRequiredService<TokenSettings>());
});
builder.Services.AddSingleton(sp =>
{
    var ds = sp.GetRequiredService<IDatasource>();
    return new SessionService(
        ds.CreateRepository<Backend.Types.View.Session>("Sessions"),
        ds.CreateRepository<Backend.Types.View.SessionHit>("SessionHits"),
        ds.CreateReadonlyRepository<Backend.Types.Datasource.SessionType>("SessionTypes"),
        sp.GetRequiredService<TokenService>());
});
builder.Services.AddSingleton(sp =>
{
    var ds = sp.GetRequiredService<IDatasource>();
    return new SigninService(
        sp.GetRequiredService<UserService>(),
        sp.GetRequiredService<TokenService>(),
        ds.CreateRepository<Backend.Types.View.Contact>("Contacts"),
        ds.CreateRepository<Backend.Types.View.Email>("Emails"));
});
builder.Services.AddSingleton(sp =>
{
    var ds = sp.GetRequiredService<IDatasource>();
    return new SignupService(
        sp.GetRequiredService<UserService>(),
        sp.GetRequiredService<TokenService>(),
        ds.CreateRepository<Backend.Types.View.Contact>("Contacts"),
        ds.CreateRepository<Backend.Types.View.Email>("Emails"),
        ds.CreateReadonlyRepository<Backend.Types.Datasource.EmailType>("EmailTypes"),
        ds.CreateReadonlyRepository<Backend.Types.Datasource.Gender>("Genders"));
});
builder.Services.AddSingleton(sp => new OAuthService(
    sp.GetRequiredService<UserService>(), sp.GetRequiredService<TokenService>(), sp.GetRequiredService<SessionService>(), sp.GetRequiredService<TokenSettings>()));
builder.Services.AddSingleton(sp => new GameSummariesService(sp.GetRequiredService<IDatasource>().CreateConnection().GetAwaiter().GetResult(), sp.GetRequiredService<ImagesService>(), sp.GetRequiredService<IDatasource>().CreateRepository<Backend.Types.View.Game>("Games")));
builder.WebHost.ConfigureKestrel(o => o.Limits.MaxRequestBodySize = builder.Configuration.GetValue("Images:MaxBytes", 10L * 1024 * 1024));
var app = builder.Build();

if (args.FirstOrDefault() == "setup")
{
    var added = await app.Services.GetRequiredService<GameParentsService>().AddParentGames();
    Console.WriteLine(added.Count > 0 ? $"added parent games: {string.Join(", ", added)}" : "parent games already present");
    var seedPath = Path.GetFullPath(app.Configuration["Categories:SeedPath"] ?? "../data/categories.json", app.Environment.ContentRootPath);
    var categories = await app.Services.GetRequiredService<CategoriesService>().AddCategories(seedPath);
    Console.WriteLine(categories.Count > 0 ? $"added {categories.Count} categories" : "categories already present");
    var templatesPath = Path.GetFullPath(app.Configuration["Templates:SeedPath"] ?? "../data/templates.json", app.Environment.ContentRootPath);
    var templates = await app.Services.GetRequiredService<TemplatesService>().AddTemplates(templatesPath);
    Console.WriteLine(templates.Count > 0 ? $"added templates: {string.Join(", ", templates)}" : "templates already present");
    var samples = Path.GetFullPath(app.Configuration["Images:SamplesPath"] ?? "../../frontend/apps/web/public/catalog", app.Environment.ContentRootPath);
    var images = await app.Services.GetRequiredService<ImagesService>().AddSamples(samples);
    Console.WriteLine(images.Count > 0 ? $"added sample images: {string.Join(", ", images)}" : "sample images already present");
    var puzzlesPath = Path.GetFullPath(app.Configuration["Puzzles:SeedPath"] ?? "../data/puzzles.json", app.Environment.ContentRootPath);
    var puzzles = await app.Services.GetRequiredService<GamesService>().AddPuzzles(puzzlesPath);
    Console.WriteLine(puzzles.Count > 0 ? $"added {puzzles.Count} puzzles" : "puzzles already present");
    var attributes = await app.Services.GetRequiredService<GamesService>().AddAttributes();
    Console.WriteLine(attributes.Count > 0 ? $"added attributes to {attributes.Count} games" : "game attributes already present");
    var identity = app.Services.GetRequiredService<SetupService>();
    var (roles, groups) = await identity.AddDefaults();
    Console.WriteLine(roles.Count > 0 ? $"added roles: {string.Join(", ", roles)}" : "roles already present");
    Console.WriteLine(groups.Count > 0 ? $"added groups: {string.Join(", ", groups)}" : "groups already present");
    var admin = await identity.AddAdmin(Environment.GetEnvironmentVariable("ADMIN_PASSWORD"));
    if (admin is null) Console.WriteLine("users already present, no admin added");
    else if (admin.Value.Generated) Console.WriteLine($"added user admin with password {admin.Value.Password} (shown once; change it with update-user)");
    else Console.WriteLine("added user admin with the password from ADMIN_PASSWORD");
    return;
}

if (args.FirstOrDefault() is "add-user" or "update-user")
{
    Environment.ExitCode = await UserCommands.Run(app.Services.GetRequiredService<UserService>(), args);
    return;
}

app.Services.GetRequiredService<TokenSettings>(); // fail at startup, not on the first signin, when JWT_SECRET is missing
app.MapGet("/health", () => Results.Ok(new { status = "ok" }));
app.MapCategories();
app.MapGameParents();
app.MapGames();
app.MapGameSummaries();
app.MapTemplates();
app.MapImages();
app.MapSignin();
app.MapSignup();
app.MapOAuth();

app.Run();
