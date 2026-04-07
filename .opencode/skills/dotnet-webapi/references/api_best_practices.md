# ASP.NET Core Web API Best Practices (.NET 10)

Essential patterns and practices for building production-ready Web APIs with .NET 10.

## Table of Contents

1. [Project Structure](#project-structure)
2. [API Design](#api-design)
3. [Error Handling](#error-handling)
4. [Validation](#validation)
5. [Authentication & Authorization](#authentication--authorization)
6. [Dependency Injection](#dependency-injection)
7. [Logging](#logging)
8. [Performance](#performance)
9. [Testing](#testing)
10. [OpenAPI/Swagger](#openapiswagger)

---

## Project Structure

### Recommended Folder Structure

```
MyApi/
├── MyApi.Api/
│   ├── Controllers/        # API endpoints
│   ├── Models/            # Domain models, DTOs
│   ├── Services/          # Business logic
│   ├── Data/              # Database context, repositories
│   ├── Middleware/        # Custom middleware
│   ├── Filters/           # Action filters
│   ├── Extensions/        # Extension methods
│   └── Program.cs         # Application entry point
└── MyApi.Tests/
    ├── Controllers/       # Controller tests
    ├── Services/          # Service tests
    └── Integration/       # Integration tests
```

### Separation of Concerns

- **Controllers**: Handle HTTP requests/responses only
- **Services**: Contain business logic
- **Repositories**: Handle data access
- **Models**: Define data structures

---

## API Design

### RESTful Principles

```csharp
[ApiController]
[Route("api/[controller]")]
public class ProductsController : ControllerBase
{
    // GET api/products
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Product>>> GetAll()

    // GET api/products/5
    [HttpGet("{id}")]
    public async Task<ActionResult<Product>> GetById(int id)

    // POST api/products
    [HttpPost]
    public async Task<ActionResult<Product>> Create(Product product)

    // PUT api/products/5
    [HttpPut("{id}")]
    public async Task<ActionResult<Product>> Update(int id, Product product)

    // DELETE api/products/5
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
}
```

### HTTP Status Codes

Use appropriate status codes:

```csharp
// 200 OK - Success with body
return Ok(data);

// 201 Created - Resource created
return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);

// 204 No Content - Success without body
return NoContent();

// 400 Bad Request - Client error
return BadRequest("Invalid input");

// 401 Unauthorized - Authentication required
return Unauthorized();

// 403 Forbidden - Authenticated but not authorized
return Forbid();

// 404 Not Found - Resource not found
return NotFound();

// 500 Internal Server Error - Server error
return StatusCode(500, "Internal error");
```

### Response Types

Document response types with attributes:

```csharp
[HttpGet("{id}")]
[ProducesResponseType(StatusCodes.Status200OK, Type = typeof(Product))]
[ProducesResponseType(StatusCodes.Status404NotFound)]
public async Task<ActionResult<Product>> GetById(int id)
{
    var product = await _service.GetByIdAsync(id);
    if (product == null)
        return NotFound();

    return Ok(product);
}
```

### API Versioning

```csharp
// Option 1: URL-based versioning
[Route("api/v1/[controller]")]
public class ProductsV1Controller : ControllerBase { }

[Route("api/v2/[controller]")]
public class ProductsV2Controller : ControllerBase { }

// Option 2: Query parameter versioning
// GET /api/products?api-version=1.0

// Option 3: Header-based versioning
// Header: X-Api-Version: 1.0
```

---

## Error Handling

### Global Exception Handler (.NET 10)

```csharp
// Program.cs
app.UseExceptionHandler(errorApp =>
{
    errorApp.Run(async context =>
    {
        context.Response.StatusCode = 500;
        context.Response.ContentType = "application/json";

        var error = context.Features.Get<IExceptionHandlerFeature>();
        if (error != null)
        {
            var logger = context.RequestServices
                .GetRequiredService<ILogger<Program>>();

            logger.LogError(error.Error, "Unhandled exception");

            await context.Response.WriteAsJsonAsync(new
            {
                StatusCode = 500,
                Message = "Internal Server Error",
                Detailed = error.Error.Message // Remove in production
            });
        }
    });
});
```

### Problem Details (RFC 7807)

```csharp
[HttpGet("{id}")]
public async Task<ActionResult<Product>> GetById(int id)
{
    var product = await _service.GetByIdAsync(id);
    if (product == null)
    {
        return NotFound(new ProblemDetails
        {
            Status = 404,
            Title = "Product not found",
            Detail = $"Product with ID {id} does not exist",
            Instance = HttpContext.Request.Path
        });
    }

    return Ok(product);
}
```

---

## Validation

### Built-in DataAnnotations

```csharp
public class CreateProductRequest
{
    [Required]
    [StringLength(100, MinimumLength = 3)]
    public string Name { get; set; } = string.Empty;

    [Range(0.01, double.MaxValue)]
    public decimal Price { get; set; }

    [EmailAddress]
    public string? ContactEmail { get; set; }
}
```

### Automatic Validation (.NET 10)

.NET 10 automatically validates DataAnnotations for Minimal APIs and controllers.

### FluentValidation

```csharp
public class CreateProductValidator : AbstractValidator<CreateProductRequest>
{
    public CreateProductValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty()
            .Length(3, 100);

        RuleFor(x => x.Price)
            .GreaterThan(0);
    }
}

// Register in Program.cs
builder.Services.AddValidatorsFromAssemblyContaining<Program>();
```

---

## Authentication & Authorization

### JWT Authentication

```csharp
// Program.cs
builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]))
        };
    });

builder.Services.AddAuthorization();

// Use middleware
app.UseAuthentication();
app.UseAuthorization();
```

### Protect Endpoints

```csharp
[Authorize]
[HttpGet("admin")]
public ActionResult<string> AdminOnly()
{
    return "Admin data";
}

[Authorize(Roles = "Admin")]
[HttpDelete("{id}")]
public async Task<IActionResult> Delete(int id)
{
    // Only admins can delete
}
```

---

## Dependency Injection

### Service Registration

```csharp
// Program.cs

// Transient - New instance per request
builder.Services.AddTransient<IEmailService, EmailService>();

// Scoped - One instance per HTTP request
builder.Services.AddScoped<IProductService, ProductService>();

// Singleton - One instance for application lifetime
builder.Services.AddSingleton<ICacheService, CacheService>();
```

### Constructor Injection

```csharp
public class ProductsController : ControllerBase
{
    private readonly IProductService _productService;
    private readonly ILogger<ProductsController> _logger;

    public ProductsController(
        IProductService productService,
        ILogger<ProductsController> logger)
    {
        _productService = productService;
        _logger = logger;
    }
}
```

---

## Logging

### Structured Logging

```csharp
public class ProductsController : ControllerBase
{
    private readonly ILogger<ProductsController> _logger;

    [HttpGet("{id}")]
    public async Task<ActionResult<Product>> GetById(int id)
    {
        _logger.LogInformation("Fetching product {ProductId}", id);

        var product = await _service.GetByIdAsync(id);

        if (product == null)
        {
            _logger.LogWarning("Product {ProductId} not found", id);
            return NotFound();
        }

        return Ok(product);
    }

    [HttpPost]
    public async Task<ActionResult> Create(Product product)
    {
        try
        {
            var created = await _service.CreateAsync(product);
            _logger.LogInformation(
                "Product created: {ProductId}, {ProductName}",
                created.Id,
                created.Name);
            return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating product");
            throw;
        }
    }
}
```

---

## Performance

### Async/Await

Always use async for I/O operations:

```csharp
// Good
public async Task<ActionResult<Product>> GetById(int id)
{
    var product = await _service.GetByIdAsync(id);
    return Ok(product);
}

// Bad - Blocking
public ActionResult<Product> GetById(int id)
{
    var product = _service.GetByIdAsync(id).Result; // Don't do this
    return Ok(product);
}
```

### Response Caching

```csharp
[HttpGet]
[ResponseCache(Duration = 60)] // Cache for 60 seconds
public async Task<ActionResult<IEnumerable<Product>>> GetAll()
{
    var products = await _service.GetAllAsync();
    return Ok(products);
}
```

### Output Caching (.NET 10)

```csharp
// Program.cs
builder.Services.AddOutputCache(options =>
{
    options.AddBasePolicy(builder => builder.Expire(TimeSpan.FromSeconds(60)));
});

app.UseOutputCache();

// Controller
[HttpGet]
[OutputCache(Duration = 300)] // 5 minutes
public async Task<ActionResult<IEnumerable<Product>>> GetAll()
```

---

## Testing

### Unit Tests

```csharp
public class ProductServiceTests
{
    [Fact]
    public async Task GetById_ExistingId_ReturnsProduct()
    {
        // Arrange
        var service = new ProductService();
        var product = await service.CreateAsync(new Product { Name = "Test" });

        // Act
        var result = await service.GetByIdAsync(product.Id);

        // Assert
        result.Should().NotBeNull();
        result!.Name.Should().Be("Test");
    }
}
```

### Integration Tests

```csharp
public class ProductsControllerTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly HttpClient _client;

    public ProductsControllerTests(WebApplicationFactory<Program> factory)
    {
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task GetAll_ReturnsSuccessStatusCode()
    {
        // Act
        var response = await _client.GetAsync("/api/products");

        // Assert
        response.EnsureSuccessStatusCode();
    }
}
```

---

## OpenAPI/Swagger

### Configure OpenAPI (.NET 10)

```csharp
// Program.cs
builder.Services.AddOpenApi(); // Built-in .NET 10

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi(); // Serves OpenAPI document at /openapi/v1.json

    // Optional: Add Swagger UI
    app.UseSwaggerUI(options =>
    {
        options.SwaggerEndpoint("/openapi/v1.json", "My API V1");
    });
}
```

### Document Operations

```csharp
/// <summary>
/// Get a product by ID
/// </summary>
/// <param name="id">The product ID</param>
/// <returns>The product details</returns>
[HttpGet("{id}")]
[ProducesResponseType(typeof(Product), StatusCodes.Status200OK)]
[ProducesResponseType(StatusCodes.Status404NotFound)]
public async Task<ActionResult<Product>> GetById(int id)
```

---

## Summary

Key takeaways for .NET 10 Web APIs:

1. ✅ Follow RESTful principles
2. ✅ Use proper HTTP status codes
3. ✅ Implement global error handling
4. ✅ Validate inputs with DataAnnotations or FluentValidation
5. ✅ Use JWT for authentication
6. ✅ Leverage dependency injection
7. ✅ Implement structured logging
8. ✅ Write async code for I/O operations
9. ✅ Add comprehensive tests
10. ✅ Document APIs with OpenAPI
