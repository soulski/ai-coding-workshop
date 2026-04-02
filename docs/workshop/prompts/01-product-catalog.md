# Feature 1: Product Catalog

## Business Requirement

As a customer, I want to browse products with filters and view product details in a separate page so I can find what I'm looking for and see all information about a specific product.

## Guardrails

### API Contract

```yaml
GET /api/products
Query Parameters:
  - category (optional): Filter by category
  - minPrice (optional): Minimum price
  - maxPrice (optional): Maximum price
Response: [
  {
    "id": 1,
    "name": "Product Name",
    "price": 99.99,
    "imageUrl": "https://example.com/image.jpg",
    "description": "Product description",
    "category": "Electronics"
  }
]

GET /api/products/{id}
Response: {
  "id": 1,
  "name": "Product Name",
  "price": 99.99,
  "imageUrl": "https://example.com/image.jpg",
  "description": "Product description",
  "category": "Electronics"
}
```

### Verification Test

```typescript
// test: products endpoint returns array with required fields
const response = await fetch("/api/products");
const products = await response.json();
expect(products.length).toBeGreaterThan(0);
expect(products[0]).toHaveProperty("id");
expect(products[0]).toHaveProperty("name");
expect(products[0]).toHaveProperty("price");
expect(products[0]).toHaveProperty("imageUrl");
expect(products[0]).toHaveProperty("description");
expect(products[0]).toHaveProperty("category");

// test: filter by category
const categoryResponse = await fetch("/api/products?category=Electronics");
const filteredProducts = await categoryResponse.json();
expect(filteredProducts.every((p) => p.category === "Electronics")).toBe(true);

// test: filter by price range
const priceResponse = await fetch("/api/products?minPrice=10&maxPrice=50");
const pricedProducts = await priceResponse.json();
expect(pricedProducts.every((p) => p.price >= 10 && p.price <= 50)).toBe(true);

// test: product detail endpoint returns single product with all required fields
const detailResponse = await fetch("/api/products/1");
const product = await detailResponse.json();
expect(product).toHaveProperty("id");
expect(product).toHaveProperty("name");
expect(product).toHaveProperty("price");
expect(product).toHaveProperty("imageUrl");
expect(product).toHaveProperty("description");
expect(product).toHaveProperty("category");
```

### Implementation Guidance

- **Website**: Use UI/UX Pro Max skill to design the product listing page
- **API**: Implement RESTful endpoints following the API Contract
- **Both**: Website AND API must be implemented for the feature to be complete

### Data Setup

- Load products from seed file: `docs/workshop/seed-data.json`
- Seed file contains 100 products across 6 categories
