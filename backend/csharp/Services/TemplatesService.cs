using System.Text.Json;
using Backend.Types.Datasource;
using Datasources;
using TemplateView = Backend.Types.View.Template;

namespace Backend.Services;

/// <summary>What the API exchanges: <c>Content</c> is the template's settings as JSON, stored as text.</summary>
public record TemplateDto(long Id, string Uuid, string Type, string Name, JsonElement Content, DateTime Created, DateTime Updated);

/// <summary>A template as the list returns it: without <c>Content</c>, which <c>Get</c> loads for the one that is selected.</summary>
public record TemplateListItem(long Id, string Uuid, string Type, string Name, DateTime Created, DateTime Updated);

public record TemplateInput(string? Type, string? Name, JsonElement? Content);

/// <summary>One entry of the templates seed file (<c>backend/data/templates.json</c>).</summary>
public record TemplateSeed(string Type, string Name, JsonElement Content);

public class UnknownTemplateTypeException(string type) : Exception($"unknown template type: {type}");

public class TemplatesService(ICRUDRepository<TemplateView> repo, ICRUDRepository<TemplateType> types)
{
    /// <summary>Templates of <paramref name="type"/> (a template type name such as "jigsaw"), or all of them when null.</summary>
    public async Task<List<TemplateListItem>> List(string? type = null)
    {
        var rows = new List<TemplateListItem>();
        await foreach (var row in repo.Read())
            if (type is null || row.TemplateTypeName == type) rows.Add(new TemplateListItem(row.Id, row.Uuid.ToString(), row.TemplateTypeName, row.Name, row.Created, row.Updated));
        return rows;
    }

    public async Task<TemplateDto?> Get(long id)
    {
        var row = await repo.ReadSingleById(id);
        return row is null ? null : ToDto(row);
    }

    public async Task<TemplateDto> Create(TemplateInput input)
    {
        var type = TypeName(await TypeNames(), input.Type ?? "");
        var created = await repo.Create(new TemplateView { TemplateTypeName = type, Name = input.Name ?? "", Content = Json(input.Content) });
        return ToDto(await repo.ReadSingleById(created.Id) ?? created);
    }

    /// <summary>Merges the fields present in <paramref name="input"/> into the stored row; null when it does not exist.</summary>
    public async Task<TemplateDto?> Update(long id, TemplateInput input)
    {
        var row = await repo.ReadSingleById(id);
        if (row is null) return null;
        if (input.Type is not null) row.TemplateTypeName = TypeName(await TypeNames(), input.Type);
        row.Name = input.Name ?? row.Name;
        if (input.Content is not null) row.Content = Json(input.Content);
        await repo.Update(row);
        return ToDto(row);
    }

    public async Task<bool> Delete(long id)
    {
        var row = await repo.ReadSingleById(id);
        if (row is null) return false;
        await repo.Delete(row);
        return true;
    }

    /// <summary>
    /// Creates the templates in the seed file at <paramref name="path"/> that are missing, matching on (type, name);
    /// existing rows are never changed. Returns the names added.
    /// </summary>
    static readonly (string Name, string Description)[] TemplateTypes = [("jigsaw", "Jigsaw template settings")];

    /// <summary>Adds the built-in template types that are not there yet; returns the names it added.</summary>
    public async Task<List<string>> AddTypes()
    {
        var have = (await TypeNames()).Values.ToHashSet();
        var added = new List<string>();
        foreach (var (name, description) in TemplateTypes)
        {
            if (have.Contains(name)) continue;
            await types.Create(new TemplateType { Name = name, Description = description });
            added.Add(name);
        }
        return added;
    }

    public async Task<List<string>> AddTemplates(string path)
    {
        var seeds = JsonSerializer.Deserialize<List<TemplateSeed>>(await File.ReadAllTextAsync(path), new JsonSerializerOptions(JsonSerializerDefaults.Web)) ?? [];
        var present = (await List()).Select(t => (t.Type, t.Name)).ToHashSet();
        var added = new List<string>();
        foreach (var seed in seeds)
        {
            if (!present.Add((seed.Type, seed.Name))) continue;
            await Create(new TemplateInput(seed.Type, seed.Name, seed.Content));
            added.Add(seed.Name);
        }
        return added;
    }

    async Task<Dictionary<long, string>> TypeNames()
    {
        var names = new Dictionary<long, string>();
        await foreach (var t in types.Read()) names[t.Id] = t.Name;
        return names;
    }

    static string TypeName(Dictionary<long, string> names, string type) =>
        names.ContainsValue(type) ? type : throw new UnknownTemplateTypeException(type);

    static string Json(JsonElement? content) => content?.GetRawText() ?? "{}";

    static TemplateDto ToDto(TemplateView row) =>
        new(row.Id, row.Uuid.ToString(), row.TemplateTypeName, row.Name, JsonDocument.Parse(row.Content).RootElement.Clone(), row.Created, row.Updated);
}
