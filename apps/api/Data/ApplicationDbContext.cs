using Api.Models;
using Microsoft.EntityFrameworkCore;

namespace Api.Data;

public sealed class ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : DbContext(options)
{
    public DbSet<Product> Products => Set<Product>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        var product = modelBuilder.Entity<Product>();
        product.HasKey(entity => entity.Id);
        product.Property(entity => entity.Id).ValueGeneratedNever();
        product.Property(entity => entity.Name).IsRequired();
        product.Property(entity => entity.Price).HasPrecision(10, 2);
        product.Property(entity => entity.ImageUrl).IsRequired();
        product.Property(entity => entity.Description).IsRequired();
        product.Property(entity => entity.Category).IsRequired();
    }
}
