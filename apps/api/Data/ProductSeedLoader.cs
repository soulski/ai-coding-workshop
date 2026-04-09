using System.Text.Json;
using Api.Models;
using Microsoft.EntityFrameworkCore;

namespace Api.Data;

public sealed class ProductSeedLoader(ApplicationDbContext dbContext, IHostEnvironment hostEnvironment)
{
    public async Task SeedAsync(CancellationToken cancellationToken = default)
    {
        await dbContext.Database.EnsureCreatedAsync(cancellationToken);

        if (await dbContext.Products.AnyAsync(cancellationToken))
        {
            return;
        }

        var seedFilePath = Path.GetFullPath(Path.Combine(hostEnvironment.ContentRootPath, "..", "..", "docs", "workshop", "seed-data.json"));

        await using var seedFile = File.OpenRead(seedFilePath);
        var products = await JsonSerializer.DeserializeAsync<List<Product>>(
            seedFile,
            new JsonSerializerOptions { PropertyNameCaseInsensitive = true },
            cancellationToken);

        if (products is null || products.Count == 0)
        {
            return;
        }

        await dbContext.Products.AddRangeAsync(products, cancellationToken);
        await dbContext.SaveChangesAsync(cancellationToken);
    }
}
