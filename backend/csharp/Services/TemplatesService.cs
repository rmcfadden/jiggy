using System.Text.Json;
using Backend.Types.Datasource;
using Datasources;

namespace Backend.Services;

/// <summary>What the API exchanges: <c>Content</c> is the template's settings as JSON, stored as text.</summary>
public record TemplateDto(long Id, string Uuid, string Type, string Name, JsonElement Content, DateTime Created, DateTime Updated);

public record TemplateInput(string? Type, string? Name, JsonElement? Content);

public class UnknownTemplateTypeException(string type) : Exception($"unknown template type: {type}");

public class TemplatesService(ICRUDRepository<Template> repo, ICRUDRepository<TemplateType> types)
{
    /// <summary>Templates of <paramref name="type"/> (a template type name such as "jigsaw"), or all of them when null.</summary>
    public async Task<List<TemplateDto>> List(string? type = null)
    {
        var names = await TypeNames();
        var rows = new List<TemplateDto>();
        await foreach (var row in repo.Read())
            if (type is null || names.GetValueOrDefault(row.TemplateTypeId) == type) rows.Add(ToDto(row, names));
        return rows;
    }

    public async Task<TemplateDto?> Get(long id)
    {
        var row = await repo.ReadSingleById(id);
        return row is null ? null : ToDto(row, await TypeNames());
    }

    public async Task<TemplateDto> Create(TemplateInput input)
    {
        var names = await TypeNames();
        var row = new Template { TemplateTypeId = TypeId(names, input.Type ?? ""), Name = input.Name ?? "", Content = Json(input.Content) };
        var created = await repo.Create(row);
        return ToDto(await repo.ReadSingleById(created.Id) ?? created, names);
    }

    /// <summary>Merges the fields present in <paramref name="input"/> into the stored row; null when it does not exist.</summary>
    public async Task<TemplateDto?> Update(long id, TemplateInput input)
    {
        var row = await repo.ReadSingleById(id);
        if (row is null) return null;
        var names = await TypeNames();
        if (input.Type is not null) row.TemplateTypeId = TypeId(names, input.Type);
        row.Name = input.Name ?? row.Name;
        if (input.Content is not null) row.Content = Json(input.Content);
        await repo.Update(row);
        return ToDto(row, names);
    }

    public async Task<bool> Delete(long id)
    {
        var row = await repo.ReadSingleById(id);
        if (row is null) return false;
        await repo.Delete(row);
        return true;
    }

    async Task<Dictionary<long, string>> TypeNames()
    {
        var names = new Dictionary<long, string>();
        await foreach (var t in types.Read()) names[t.Id] = t.Name;
        return names;
    }

    static long TypeId(Dictionary<long, string> names, string type) =>
        names.FirstOrDefault(n => n.Value == type) is { Value: not null } found
            ? found.Key
            : throw new UnknownTemplateTypeException(type);

    static string Json(JsonElement? content) => content?.GetRawText() ?? "{}";

    static TemplateDto ToDto(Template row, Dictionary<long, string> names) =>
        new(row.Id, row.Uuid, names.GetValueOrDefault(row.TemplateTypeId, ""), row.Name, JsonDocument.Parse(row.Content).RootElement.Clone(), row.Created, row.Updated);
}
