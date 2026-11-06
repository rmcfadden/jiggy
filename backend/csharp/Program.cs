using Backend.Routes;
using Backend.Services;
using Backend.Types.View;
using Datasources;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddSingleton(Datasource.Default);
builder.Services.AddSingleton(sp => new CategoriesService(sp.GetRequiredService<Datasource>().CreateRepository<Category>("Categories")));
var app = builder.Build();

app.MapGet("/health", () => Results.Ok(new { status = "ok" }));
app.MapCategories();

app.Run();
