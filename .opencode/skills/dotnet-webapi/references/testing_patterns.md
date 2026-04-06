# Testing Patterns for .NET 10 Web APIs

Comprehensive guide to testing ASP.NET Core Web APIs with xUnit, FluentAssertions, and best practices.

## Table of Contents

1. [Test Project Setup](#test-project-setup)
2. [Unit Testing](#unit-testing)
3. [Integration Testing](#integration-testing)
4. [Mocking](#mocking)
5. [Test Data Builders](#test-data-builders)
6. [Common Patterns](#common-patterns)

---

## Test Project Setup

### Required Packages

```bash
dotnet add package xunit
dotnet add package xunit.runner.visualstudio
dotnet add package Microsoft.NET.Test.Sdk
dotnet add package FluentAssertions
dotnet add package Microsoft.AspNetCore.Mvc.Testing
dotnet add package Moq
```

### Project Structure

```
MyApi.Tests/
├── Controllers/
│   └── ProductsControllerTests.cs
├── Services/
│   └── ProductServiceTests.cs
├── Integration/
│   ├── ApiWebApplicationFactory.cs
│   └── ProductsEndpointTests.cs
├── Builders/
│   └── ProductBuilder.cs
└── Fixtures/
    └── DatabaseFixture.cs
```

---

## Unit Testing

### Service Tests

```csharp
using FluentAssertions;
using Xunit;

public class ProductServiceTests
{
    private readonly ProductService _sut; // System Under Test

    public ProductServiceTests()
    {
        _sut = new ProductService();
    }

    [Fact]
    public async Task GetAllAsync_WhenEmpty_ReturnsEmptyList()
    {
        // Act
        var result = await _sut.GetAllAsync();

        // Assert
        result.Should().BeEmpty();
    }

    [Fact]
    public async Task CreateAsync_ValidProduct_ReturnsCreatedProduct()
    {
        // Arrange
        var product = new Product { Name = "Test Product" };

        // Act
        var result = await _sut.CreateAsync(product);

        // Assert
        result.Should().NotBeNull();
        result.Id.Should().BeGreaterThan(0);
        result.Name.Should().Be("Test Product");
        result.CreatedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(1));
    }

    [Fact]
    public async Task GetByIdAsync_ExistingId_ReturnsProduct()
    {
        // Arrange
        var created = await _sut.CreateAsync(new Product { Name = "Test" });

        // Act
        var result = await _sut.GetByIdAsync(created.Id);

        // Assert
        result.Should().NotBeNull();
        result!.Id.Should().Be(created.Id);
    }

    [Fact]
    public async Task GetByIdAsync_NonExistingId_ReturnsNull()
    {
        // Act
        var result = await _sut.GetByIdAsync(999);

        // Assert
        result.Should().BeNull();
    }

    [Fact]
    public async Task UpdateAsync_ExistingProduct_UpdatesSuccessfully()
    {
        // Arrange
        var created = await _sut.CreateAsync(new Product { Name = "Original" });
        var updated = new Product { Name = "Updated" };

        // Act
        var result = await _sut.UpdateAsync(created.Id, updated);

        // Assert
        result.Should().NotBeNull();
        result!.Name.Should().Be("Updated");
        result.UpdatedAt.Should().NotBeNull();
    }

    [Fact]
    public async Task DeleteAsync_ExistingProduct_ReturnsTrue()
    {
        // Arrange
        var created = await _sut.CreateAsync(new Product { Name = "To Delete" });

        // Act
        var result = await _sut.DeleteAsync(created.Id);

        // Assert
        result.Should().BeTrue();
        var deleted = await _sut.GetByIdAsync(created.Id);
        deleted.Should().BeNull();
    }
}
```

### Controller Tests with Mocking

```csharp
using FluentAssertions;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Moq;
using Xunit;

public class ProductsControllerTests
{
    private readonly Mock<IProductService> _mockService;
    private readonly Mock<ILogger<ProductsController>> _mockLogger;
    private readonly ProductsController _controller;

    public ProductsControllerTests()
    {
        _mockService = new Mock<IProductService>();
        _mockLogger = new Mock<ILogger<ProductsController>>();
        _controller = new ProductsController(_mockService.Object, _mockLogger.Object);
    }

    [Fact]
    public async Task GetAll_ReturnsOkWithProducts()
    {
        // Arrange
        var products = new List<Product>
        {
            new() { Id = 1, Name = "Product 1" },
            new() { Id = 2, Name = "Product 2" }
        };
        _mockService.Setup(s => s.GetAllAsync()).ReturnsAsync(products);

        // Act
        var result = await _controller.GetAll();

        // Assert
        var okResult = result.Result.Should().BeOfType<OkObjectResult>().Subject;
        var returnedProducts = okResult.Value.Should().BeAssignableTo<IEnumerable<Product>>().Subject;
        returnedProducts.Should().HaveCount(2);
    }

    [Fact]
    public async Task GetById_ExistingId_ReturnsOkWithProduct()
    {
        // Arrange
        var product = new Product { Id = 1, Name = "Test Product" };
        _mockService.Setup(s => s.GetByIdAsync(1)).ReturnsAsync(product);

        // Act
        var result = await _controller.GetById(1);

        // Assert
        var okResult = result.Result.Should().BeOfType<OkObjectResult>().Subject;
        var returnedProduct = okResult.Value.Should().BeOfType<Product>().Subject;
        returnedProduct.Name.Should().Be("Test Product");
    }

    [Fact]
    public async Task GetById_NonExistingId_ReturnsNotFound()
    {
        // Arrange
        _mockService.Setup(s => s.GetByIdAsync(999)).ReturnsAsync((Product?)null);

        // Act
        var result = await _controller.GetById(999);

        // Assert
        result.Result.Should().BeOfType<NotFoundResult>();
    }

    [Fact]
    public async Task Create_ValidProduct_ReturnsCreatedAtAction()
    {
        // Arrange
        var product = new Product { Name = "New Product" };
        var created = new Product { Id = 1, Name = "New Product" };
        _mockService.Setup(s => s.CreateAsync(product)).ReturnsAsync(created);

        // Act
        var result = await _controller.Create(product);

        // Assert
        var createdResult = result.Result.Should().BeOfType<CreatedAtActionResult>().Subject;
        createdResult.ActionName.Should().Be(nameof(ProductsController.GetById));
        createdResult.RouteValues!["id"].Should().Be(1);
        var returnedProduct = createdResult.Value.Should().BeOfType<Product>().Subject;
        returnedProduct.Id.Should().Be(1);
    }

    [Fact]
    public async Task Delete_ExistingId_ReturnsNoContent()
    {
        // Arrange
        _mockService.Setup(s => s.DeleteAsync(1)).ReturnsAsync(true);

        // Act
        var result = await _controller.Delete(1);

        // Assert
        result.Should().BeOfType<NoContentResult>();
    }

    [Fact]
    public async Task Delete_NonExistingId_ReturnsNotFound()
    {
        // Arrange
        _mockService.Setup(s => s.DeleteAsync(999)).ReturnsAsync(false);

        // Act
        var result = await _controller.Delete(999);

        // Assert
        result.Should().BeOfType<NotFoundResult>();
    }
}
```

---

## Integration Testing

### Web Application Factory

```csharp
public class ApiWebApplicationFactory : WebApplicationFactory<Program>
{
    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.ConfigureServices(services =>
        {
            // Remove the app's database context registration
            var descriptor = services.SingleOrDefault(
                d => d.ServiceType == typeof(DbContextOptions<ApplicationDbContext>));

            if (descriptor != null)
                services.Remove(descriptor);

            // Add in-memory database for testing
            services.AddDbContext<ApplicationDbContext>(options =>
            {
                options.UseInMemoryDatabase("TestDb");
            });
        });
    }
}
```

### Integration Tests

```csharp
public class ProductsEndpointTests : IClassFixture<ApiWebApplicationFactory>
{
    private readonly HttpClient _client;

    public ProductsEndpointTests(ApiWebApplicationFactory factory)
    {
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task GetAll_ReturnsSuccessAndCorrectContentType()
    {
        // Act
        var response = await _client.GetAsync("/api/products");

        // Assert
        response.EnsureSuccessStatusCode();
        response.Content.Headers.ContentType?.ToString()
            .Should().Be("application/json; charset=utf-8");
    }

    [Fact]
    public async Task Create_ValidProduct_ReturnsCreated()
    {
        // Arrange
        var product = new { Name = "Integration Test Product" };
        var content = new StringContent(
            JsonSerializer.Serialize(product),
            Encoding.UTF8,
            "application/json");

        // Act
        var response = await _client.PostAsync("/api/products", content);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Created);
        response.Headers.Location.Should().NotBeNull();
    }

    [Fact]
    public async Task GetById_NonExistingId_ReturnsNotFound()
    {
        // Act
        var response = await _client.GetAsync("/api/products/999");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task FullCrudWorkflow_WorksCorrectly()
    {
        // Create
        var createContent = new StringContent(
            JsonSerializer.Serialize(new { Name = "CRUD Test" }),
            Encoding.UTF8,
            "application/json");
        var createResponse = await _client.PostAsync("/api/products", createContent);
        createResponse.StatusCode.Should().Be(HttpStatusCode.Created);

        var locationHeader = createResponse.Headers.Location!.ToString();
        var productId = int.Parse(locationHeader.Split('/').Last());

        // Read
        var getResponse = await _client.GetAsync($"/api/products/{productId}");
        getResponse.EnsureSuccessStatusCode();

        // Update
        var updateContent = new StringContent(
            JsonSerializer.Serialize(new { Name = "Updated Name" }),
            Encoding.UTF8,
            "application/json");
        var updateResponse = await _client.PutAsync($"/api/products/{productId}", updateContent);
        updateResponse.EnsureSuccessStatusCode();

        // Delete
        var deleteResponse = await _client.DeleteAsync($"/api/products/{productId}");
        deleteResponse.StatusCode.Should().Be(HttpStatusCode.NoContent);

        // Verify deletion
        var verifyResponse = await _client.GetAsync($"/api/products/{productId}");
        verifyResponse.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }
}
```

---

## Mocking

### Moq Basics

```csharp
// Setup method to return a value
_mockService.Setup(s => s.GetByIdAsync(1))
    .ReturnsAsync(new Product { Id = 1, Name = "Test" });

// Setup method to throw exception
_mockService.Setup(s => s.CreateAsync(It.IsAny<Product>()))
    .ThrowsAsync(new InvalidOperationException("Test exception"));

// Verify method was called
_mockService.Verify(s => s.GetByIdAsync(1), Times.Once);

// Verify with specific argument
_mockService.Verify(
    s => s.CreateAsync(It.Is<Product>(p => p.Name == "Test")),
    Times.Once);

// Setup with callback
_mockService.Setup(s => s.CreateAsync(It.IsAny<Product>()))
    .Callback<Product>(p => p.Id = 1)
    .ReturnsAsync((Product p) => p);
```

---

## Test Data Builders

### Product Builder Pattern

```csharp
public class ProductBuilder
{
    private int _id = 1;
    private string _name = "Default Product";
    private decimal _price = 9.99m;
    private DateTime _createdAt = DateTime.UtcNow;

    public ProductBuilder WithId(int id)
    {
        _id = id;
        return this;
    }

    public ProductBuilder WithName(string name)
    {
        _name = name;
        return this;
    }

    public ProductBuilder WithPrice(decimal price)
    {
        _price = price;
        return this;
    }

    public Product Build()
    {
        return new Product
        {
            Id = _id,
            Name = _name,
            Price = _price,
            CreatedAt = _createdAt
        };
    }
}

// Usage
[Fact]
public async Task Example_UsingBuilder()
{
    // Arrange
    var product = new ProductBuilder()
        .WithName("Test Product")
        .WithPrice(19.99m)
        .Build();

    // Act & Assert
    // ...
}
```

---

## Common Patterns

### Theory and InlineData

```csharp
[Theory]
[InlineData("")]
[InlineData(" ")]
[InlineData(null)]
public async Task Create_InvalidName_ThrowsException(string invalidName)
{
    // Arrange
    var product = new Product { Name = invalidName };

    // Act & Assert
    await Assert.ThrowsAsync<ValidationException>(
        () => _sut.CreateAsync(product));
}

[Theory]
[InlineData(1, true)]
[InlineData(999, false)]
public async Task Delete_VariousIds_ReturnsExpectedResult(int id, bool expected)
{
    // Arrange
    if (expected)
        await _sut.CreateAsync(new Product { Name = "Test" });

    // Act
    var result = await _sut.DeleteAsync(id);

    // Assert
    result.Should().Be(expected);
}
```

### Fixture for Setup

```csharp
public class ProductServiceFixture : IDisposable
{
    public ProductService Service { get; }

    public ProductServiceFixture()
    {
        Service = new ProductService();
        // Setup test data
        Service.CreateAsync(new Product { Name = "Fixture Product" }).Wait();
    }

    public void Dispose()
    {
        // Cleanup
    }
}

public class ProductServiceTestsWithFixture : IClassFixture<ProductServiceFixture>
{
    private readonly ProductService _service;

    public ProductServiceTestsWithFixture(ProductServiceFixture fixture)
    {
        _service = fixture.Service;
    }

    [Fact]
    public async Task Test_UsesFixtureData()
    {
        var products = await _service.GetAllAsync();
        products.Should().NotBeEmpty();
    }
}
```

### Async Testing Best Practices

```csharp
// Good - Use async/await
[Fact]
public async Task Test_GoodAsync()
{
    var result = await _service.GetAllAsync();
    result.Should().NotBeNull();
}

// Bad - Don't use .Result
[Fact]
public void Test_BadSync()
{
    var result = _service.GetAllAsync().Result; // Don't do this
    result.Should().NotBeNull();
}
```

---

## Summary

Key testing practices:

1. ✅ Use xUnit with FluentAssertions for readable tests
2. ✅ Separate unit tests from integration tests
3. ✅ Mock dependencies with Moq
4. ✅ Use WebApplicationFactory for integration tests
5. ✅ Create test data builders for complex objects
6. ✅ Follow AAA pattern (Arrange, Act, Assert)
7. ✅ Write async tests properly
8. ✅ Use Theory for parameterized tests
9. ✅ Test both success and error scenarios
10. ✅ Keep tests focused and independent
