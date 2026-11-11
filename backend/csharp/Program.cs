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
        ds.CreateRepository<Backend.Types.Datasource.PuzzleGame>("PuzzleGames"),
        ds.CreateRepository<Backend.Types.Datasource.GameCategory>("GameCategories"),
        sp.GetRequiredService<CategoriesService>(),
        sp.GetRequiredService<GameParentsService>(),
        sp.GetRequiredService<TemplatesService>(),
        sp.GetRequiredService<ImagesService>());
});
builder.Services.AddSingleton(sp => new GameSummariesService(sp.GetRequiredService<IDatasource>().CreateConnection().GetAwaiter().GetResult(), sp.GetRequiredService<ImagesService>()));
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
    return;
}

app.MapGet("/health", () => Results.Ok(new { status = "ok" }));
app.MapCategories();
app.MapGameParents();
app.MapGames();
app.MapGameSummaries();
app.MapTemplates();
app.MapImages();

app.Run();
