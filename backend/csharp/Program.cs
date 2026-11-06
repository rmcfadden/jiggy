using Backend.Routes;
using Backend.Services;
using Backend.Types.View;
using Datasources;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddSingleton(Datasource.Default!);
builder.Services.AddSingleton(sp => new CategoriesService(sp.GetRequiredService<IDatasource>().CreateRepository<Category>("Categories")));
builder.Services.AddSingleton(sp => new GameParentsService(sp.GetRequiredService<IDatasource>().CreateRepository<GameParent>("GameParents")));
builder.Services.AddSingleton(sp =>
{
    var ds = sp.GetRequiredService<IDatasource>();
    return new TemplatesService(ds.CreateRepository<Backend.Types.Datasource.Template>("Templates"), ds.CreateRepository<Backend.Types.Datasource.TemplateType>("TemplateTypes"));
});
var app = builder.Build();

if (args.FirstOrDefault() == "setup")
{
    var added = await app.Services.GetRequiredService<GameParentsService>().AddParentGames();
    Console.WriteLine(added.Count > 0 ? $"added parent games: {string.Join(", ", added)}" : "parent games already present");
    return;
}

app.MapGet("/health", () => Results.Ok(new { status = "ok" }));
app.MapCategories();
app.MapGameParents();
app.MapTemplates();

app.Run();
