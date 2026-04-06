# Common NuGet Packages for .NET 10 Web APIs

Essential NuGet packages for ASP.NET Core Web API development with .NET 10.

## Table of Contents

1. [Database & ORM](#database--orm)
2. [Authentication & Security](#authentication--security)
3. [Validation](#validation)
4. [Documentation](#documentation)
5. [Testing](#testing)
6. [Logging & Monitoring](#logging--monitoring)
7. [Serialization & Data](#serialization--data)
8. [Utilities](#utilities)

---

## Database & ORM

### Entity Framework Core

**Core Packages:**
```bash
# EF Core with PostgreSQL
dotnet add package Microsoft.EntityFrameworkCore
dotnet add package Microsoft.EntityFrameworkCore.Design
dotnet add package Npgsql.EntityFrameworkCore.PostgreSQL

# EF Core with SQL Server
dotnet add package Microsoft.EntityFrameworkCore.SqlServer

# EF Core with MySQL
dotnet add package Pomelo.EntityFrameworkCore.MySql

# EF Core Tools
dotnet add package Microsoft.EntityFrameworkCore.Tools
```

**Usage:**
```csharp
// DbContext
public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options) { }

    public DbSet<Product> Products => Set<Product>();
}

// Program.cs
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));
```

### Dapper (Micro ORM)

```bash
dotnet add package Dapper
```

**Usage:**
```csharp
using var connection = new NpgsqlConnection(connectionString);
var products = await connection.QueryAsync<Product>(
    "SELECT * FROM Products WHERE Price > @MinPrice",
    new { MinPrice = 10 });
```

---

## Authentication & Security

### JWT Authentication

```bash
dotnet add package Microsoft.AspNetCore.Authentication.JwtBearer
dotnet add package System.IdentityModel.Tokens.Jwt
```

**Usage:**
```csharp
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options => { /* configuration */ });
```

### ASP.NET Core Identity

```bash
dotnet add package Microsoft.AspNetCore.Identity.EntityFrameworkCore
```

**Usage:**
```csharp
builder.Services.AddIdentity<ApplicationUser, IdentityRole>()
    .AddEntityFrameworkStores<ApplicationDbContext>();
```

### OAuth & External Providers

```bash
dotnet add package Microsoft.AspNetCore.Authentication.Google
dotnet add package Microsoft.AspNetCore.Authentication.MicrosoftAccount
```

---

## Validation

### FluentValidation

```bash
dotnet add package FluentValidation
dotnet add package FluentValidation.AspNetCore
```

**Usage:**
```csharp
public class CreateProductValidator : AbstractValidator<CreateProductRequest>
{
    public CreateProductValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Price).GreaterThan(0);
    }
}

// Program.cs
builder.Services.AddValidatorsFromAssemblyContaining<Program>();
```

---

## Documentation

### Swagger/OpenAPI

```bash
# .NET 10 has built-in OpenAPI support
# For Swagger UI
dotnet add package Swashbuckle.AspNetCore
```

**Usage (.NET 10):**
```csharp
// Program.cs
builder.Services.AddOpenApi();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}
```

### API Versioning

```bash
dotnet add package Asp.Versioning.Mvc
dotnet add package Asp.Versioning.Mvc.ApiExplorer
```

**Usage:**
```csharp
builder.Services.AddApiVersioning(options =>
{
    options.DefaultApiVersion = new ApiVersion(1, 0);
    options.AssumeDefaultVersionWhenUnspecified = true;
});
```

---

## Testing

### xUnit & Testing Utilities

```bash
# Test framework
dotnet add package xunit
dotnet add package xunit.runner.visualstudio
dotnet add package Microsoft.NET.Test.Sdk

# Assertions
dotnet add package FluentAssertions

# Integration testing
dotnet add package Microsoft.AspNetCore.Mvc.Testing

# Mocking
dotnet add package Moq
dotnet add package NSubstitute  # Alternative to Moq
```

### Test Data Generation

```bash
dotnet add package Bogus  # Fake data generator
dotnet add package AutoFixture
```

**Usage:**
```csharp
// Bogus
var faker = new Faker<Product>()
    .RuleFor(p => p.Name, f => f.Commerce.ProductName())
    .RuleFor(p => p.Price, f => f.Random.Decimal(1, 1000));

var products = faker.Generate(10);
```

---

## Logging & Monitoring

### Serilog

```bash
dotnet add package Serilog.AspNetCore
dotnet add package Serilog.Sinks.Console
dotnet add package Serilog.Sinks.File
dotnet add package Serilog.Sinks.Seq
```

**Usage:**
```csharp
// Program.cs
builder.Host.UseSerilog((context, configuration) =>
    configuration.ReadFrom.Configuration(context.Configuration));
```

### Application Insights

```bash
dotnet add package Microsoft.ApplicationInsights.AspNetCore
```

**Usage:**
```csharp
builder.Services.AddApplicationInsightsTelemetry();
```

---

## Serialization & Data

### JSON Serialization

```bash
# Built-in System.Text.Json is recommended

# If you need Newtonsoft.Json
dotnet add package Microsoft.AspNetCore.Mvc.NewtonsoftJson
```

**Usage:**
```csharp
// System.Text.Json (built-in)
var json = JsonSerializer.Serialize(product);
var product = JsonSerializer.Deserialize<Product>(json);

// Configure globally
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
        options.JsonSerializerOptions.DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull;
    });
```

### CSV Processing

```bash
dotnet add package CsvHelper
```

**Usage:**
```csharp
using var writer = new StreamWriter("products.csv");
using var csv = new CsvWriter(writer, CultureInfo.InvariantCulture);
csv.WriteRecords(products);
```

---

## Utilities

### AutoMapper

```bash
dotnet add package AutoMapper
dotnet add package AutoMapper.Extensions.Microsoft.DependencyInjection
```

**Usage:**
```csharp
// Profile
public class MappingProfile : Profile
{
    public MappingProfile()
    {
        CreateMap<Product, ProductDto>();
        CreateMap<CreateProductRequest, Product>();
    }
}

// Program.cs
builder.Services.AddAutoMapper(typeof(Program));

// Controller
private readonly IMapper _mapper;

public ProductsController(IMapper mapper)
{
    _mapper = mapper;
}

var dto = _mapper.Map<ProductDto>(product);
```

### MediatR (CQRS Pattern)

```bash
dotnet add package MediatR
```

**Usage:**
```csharp
// Command
public record CreateProductCommand(string Name, decimal Price) : IRequest<int>;

// Handler
public class CreateProductHandler : IRequestHandler<CreateProductCommand, int>
{
    public async Task<int> Handle(CreateProductCommand request, CancellationToken ct)
    {
        // Logic here
        return productId;
    }
}

// Program.cs
builder.Services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(typeof(Program).Assembly));

// Controller
private readonly IMediator _mediator;

[HttpPost]
public async Task<IActionResult> Create(CreateProductRequest request)
{
    var id = await _mediator.Send(new CreateProductCommand(request.Name, request.Price));
    return CreatedAtAction(nameof(GetById), new { id }, id);
}
```

### Polly (Resilience & Retry)

```bash
dotnet add package Microsoft.Extensions.Http.Polly
```

**Usage:**
```csharp
builder.Services.AddHttpClient<IExternalApiClient, ExternalApiClient>()
    .AddTransientHttpErrorPolicy(builder =>
        builder.WaitAndRetryAsync(3, retryAttempt =>
            TimeSpan.FromSeconds(Math.Pow(2, retryAttempt))));
```

### HealthChecks

```bash
dotnet add package Microsoft.Extensions.Diagnostics.HealthChecks
dotnet add package AspNetCore.HealthChecks.NpgSql
dotnet add package AspNetCore.HealthChecks.UI
```

**Usage:**
```csharp
builder.Services.AddHealthChecks()
    .AddNpgSql(builder.Configuration.GetConnectionString("DefaultConnection"));

app.MapHealthChecks("/health");
```

### Rate Limiting (.NET 10)

```csharp
// Built-in .NET 10
using Microsoft.AspNetCore.RateLimiting;

builder.Services.AddRateLimiter(options =>
{
    options.AddFixedWindowLimiter("api", config =>
    {
        config.PermitLimit = 100;
        config.Window = TimeSpan.FromMinutes(1);
    });
});

app.UseRateLimiter();

[EnableRateLimiting("api")]
[HttpGet]
public IActionResult Get() => Ok();
```

### Caching

```bash
# Distributed caching
dotnet add package Microsoft.Extensions.Caching.StackExchangeRedis
```

**Usage:**
```csharp
// Memory cache (built-in)
builder.Services.AddMemoryCache();

// Redis
builder.Services.AddStackExchangeRedisCache(options =>
{
    options.Configuration = builder.Configuration.GetConnectionString("Redis");
});

// Usage
private readonly IDistributedCache _cache;

var cached = await _cache.GetStringAsync("key");
await _cache.SetStringAsync("key", value, new DistributedCacheEntryOptions
{
    AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(10)
});
```

---

## Quick Setup Commands

### Minimal API with PostgreSQL

```bash
dotnet new webapi -n MyApi --use-controllers
cd MyApi
dotnet add package Microsoft.EntityFrameworkCore
dotnet add package Microsoft.EntityFrameworkCore.Design
dotnet add package Npgsql.EntityFrameworkCore.PostgreSQL
dotnet add package FluentValidation.AspNetCore
```

### Full-Featured API

```bash
dotnet new webapi -n MyApi --use-controllers
cd MyApi

# Database
dotnet add package Microsoft.EntityFrameworkCore.Design
dotnet add package Npgsql.EntityFrameworkCore.PostgreSQL

# Authentication
dotnet add package Microsoft.AspNetCore.Authentication.JwtBearer

# Validation
dotnet add package FluentValidation.AspNetCore

# Logging
dotnet add package Serilog.AspNetCore
dotnet add package Serilog.Sinks.Console

# Testing
dotnet new xunit -n MyApi.Tests -o ../MyApi.Tests
cd ../MyApi.Tests
dotnet add package FluentAssertions
dotnet add package Microsoft.AspNetCore.Mvc.Testing
dotnet add package Moq
dotnet add reference ../MyApi/MyApi.csproj
```

---

## Summary

Essential packages by category:

**Must-Have:**
- Entity Framework Core + Database Provider
- FluentValidation
- xUnit + FluentAssertions
- Serilog

**Recommended:**
- AutoMapper
- MediatR
- Polly
- HealthChecks

**As Needed:**
- JWT Authentication
- Swagger/OpenAPI
- Redis Caching
- Application Insights
