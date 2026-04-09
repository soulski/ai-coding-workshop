using Api.Data;
using Api.Features.Products;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));
builder.Services.AddScoped<ProductSeedLoader>();
builder.Services.AddScoped<IProductService, ProductService>();

var app = builder.Build();

await using (var scope = app.Services.CreateAsyncScope())
{
    var productSeedLoader = scope.ServiceProvider.GetRequiredService<ProductSeedLoader>();
    await productSeedLoader.SeedAsync();
}

app.MapControllers();
app.Run();

public partial class Program;
