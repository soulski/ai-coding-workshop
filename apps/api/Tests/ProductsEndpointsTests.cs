using System.Net;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc.Testing;

public class ProductsEndpointsTests(WebApplicationFactory<Program> factory) : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly HttpClient _client = factory.CreateClient();

    [Fact]
    public async Task GetProducts_EndpointExists()
    {
        var response = await _client.GetAsync("/api/products");
        response.StatusCode.Should().NotBe(HttpStatusCode.NotFound);
    }
}
