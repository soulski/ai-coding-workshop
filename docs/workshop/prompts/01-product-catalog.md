# Feature 1: Product Catalog

## Business Requirement

As a customer, I want to browse products so I can see what's available for purchase.

## Acceptance Criteria

- Load products from seed file: `docs/workshop/seed-data.json` (100 products)
- Each product shows: name, price, image, description, category
- Products organized in a grid or list view
- Filter products by category (optional)
- Search products by name (optional)

## API Contract

```yaml
GET /api/products
Response: [
  {
    "id": 1,
    "name": "Product Name",
    "price": 99.99,
    "imageUrl": "https://example.com/image.jpg",
    "description": "Product description"
  }
]
```

## Verification Test

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
```
