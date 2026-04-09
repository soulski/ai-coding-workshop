namespace Api.Features.Products;

public sealed record ProductFilters(string? Category, decimal? MinPrice, decimal? MaxPrice);
