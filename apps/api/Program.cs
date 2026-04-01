using System.Text.Json;
using EcommerceApi.Models;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

var seedDataPath = Path.Combine(AppContext.BaseDirectory, "data", "seed-data.json");
var jsonContent = File.ReadAllText(seedDataPath);
var products = JsonSerializer.Deserialize<List<Product>>(jsonContent, new JsonSerializerOptions
{
    PropertyNameCaseInsensitive = true
}) ?? new List<Product>();

builder.Services.AddSingleton(products);

var app = builder.Build();

app.UseRouting();
app.MapControllers();

app.Run();