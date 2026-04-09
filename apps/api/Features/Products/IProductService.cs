using Api.Models;

namespace Api.Features.Products;

public interface IProductService
{
    Task<IReadOnlyList<Product>> GetProductsAsync(ProductFilters filters, CancellationToken cancellationToken);

    Task<Product?> GetProductByIdAsync(int id, CancellationToken cancellationToken);
}
