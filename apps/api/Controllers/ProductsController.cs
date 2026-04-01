using Microsoft.AspNetCore.Mvc;
using EcommerceApi.Models;

namespace EcommerceApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProductsController : ControllerBase
{
    private readonly List<Product> _products;

    public ProductsController(List<Product> products)
    {
        _products = products;
    }

    [HttpGet]
    public ActionResult<List<Product>> GetProducts()
    {
        return Ok(_products);
    }
}