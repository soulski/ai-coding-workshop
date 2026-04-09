using Api.Data;
using Api.Models;
using Microsoft.EntityFrameworkCore;

namespace Api.Features.Products;

public sealed class ProductService(ApplicationDbContext dbContext) : IProductService
{
    public async Task<IReadOnlyList<Product>> GetProductsAsync(ProductFilters filters, CancellationToken cancellationToken)
    {
        var query = dbContext.Products.AsNoTracking().AsQueryable();

        if (!string.IsNullOrWhiteSpace(filters.Category))
        {
            query = query.Where(product => product.Category == filters.Category);
        }

        if (filters.MinPrice is not null)
        {
            query = query.Where(product => product.Price >= filters.MinPrice.Value);
        }

        if (filters.MaxPrice is not null)
        {
            query = query.Where(product => product.Price <= filters.MaxPrice.Value);
        }

        return await query.OrderBy(product => product.Id).ToListAsync(cancellationToken);
    }

    public Task<Product?> GetProductByIdAsync(int id, CancellationToken cancellationToken)
        => dbContext.Products.AsNoTracking().FirstOrDefaultAsync(product => product.Id == id, cancellationToken);
}
