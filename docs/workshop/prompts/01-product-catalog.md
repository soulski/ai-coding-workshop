# Feature 1: Product Catalog

## Business Requirement

As a customer, I want to browse products so I can see what's available for purchase.

## Frontend Acceptance Criteria

- Product listing page with grid layout
- Each product card shows: image, name, price, category
- Click on product to view details (modal or separate page)
- Add to Cart button on each product
- Filter products by category (optional)
- Search products by name (optional)

## Data Setup

- Load products from seed file: `docs/workshop/seed-data.json`
- Seed file contains 100 products across 6 categories

## API Contract

```yaml
GET /api/products
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
