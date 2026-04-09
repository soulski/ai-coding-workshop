using System.Net;
using System.Net.Http.Json;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc.Testing;

public class ProductsEndpointsTests(WebApplicationFactory<Program> factory) : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly HttpClient _client = factory.CreateClient();

    [Fact]
    public async Task GetProducts_ReturnsProductsWithRequiredFields()
    {
        var response = await _client.GetAsync("/api/products");
        response.StatusCode.Should().Be(HttpStatusCode.OK);

        var products = await response.Content.ReadFromJsonAsync<List<ProductResponse>>();
        products.Should().NotBeNullOrEmpty();
        products![0].Id.Should().BePositive();
        products[0].Name.Should().NotBeNullOrWhiteSpace();
        products[0].Price.Should().BePositive();
        products[0].ImageUrl.Should().NotBeNullOrWhiteSpace();
        products[0].Description.Should().NotBeNullOrWhiteSpace();
        products![0].Category.Should().NotBeNullOrWhiteSpace();
    }

    [Fact]
    public async Task GetProducts_WhenFilteringByCategory_ReturnsMatchingProducts()
    {
        var response = await _client.GetAsync("/api/products?category=Electronics");
        response.StatusCode.Should().Be(HttpStatusCode.OK);

        var products = await response.Content.ReadFromJsonAsync<List<ProductResponse>>();
        products.Should().NotBeNullOrEmpty();
        products!.Should().OnlyContain(product => product.Category == "Electronics");
    }

    [Fact]
    public async Task GetProducts_WhenFilteringByPriceRange_ReturnsProductsWithinRange()
    {
        var response = await _client.GetAsync("/api/products?minPrice=10&maxPrice=50");
        response.StatusCode.Should().Be(HttpStatusCode.OK);

        var products = await response.Content.ReadFromJsonAsync<List<ProductResponse>>();
        products.Should().NotBeNullOrEmpty();
        products!.Should().OnlyContain(product => product.Price >= 10m && product.Price <= 50m);
    }

    [Fact]
    public async Task GetProductById_ReturnsProductWithRequiredFields()
    {
        var response = await _client.GetAsync("/api/products/1");
        response.StatusCode.Should().Be(HttpStatusCode.OK);

        var product = await response.Content.ReadFromJsonAsync<ProductResponse>();
        product.Should().NotBeNull();
        product!.Id.Should().Be(1);
        product.Name.Should().NotBeNullOrWhiteSpace();
        product.Price.Should().BePositive();
        product.ImageUrl.Should().NotBeNullOrWhiteSpace();
        product.Description.Should().NotBeNullOrWhiteSpace();
        product.Category.Should().NotBeNullOrWhiteSpace();
    }

    [Fact]
    public async Task GetProductById_WhenMissing_ReturnsNotFoundError()
    {
        var response = await _client.GetAsync("/api/products/999999");
        response.StatusCode.Should().Be(HttpStatusCode.NotFound);

        var error = await response.Content.ReadFromJsonAsync<ErrorResponse>();
        error.Should().NotBeNull();
        error!.Error.Should().Be("Product not found");
    }

    private sealed record ProductResponse(
        int Id,
        string Name,
        decimal Price,
        string ImageUrl,
        string Description,
        string Category);

    private sealed record ErrorResponse(string Error);
}
