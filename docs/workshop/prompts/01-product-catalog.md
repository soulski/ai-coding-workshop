# Feature 1: Product Catalog

## Business Requirement

As a customer, I want to browse products so I can see what's available for purchase.

## Guardrails

### API Contract

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
```

### Implementation Guidance

- **Website**: Use UI/UX Pro Max skill to design the product listing page
- **API**: Implement RESTful endpoints following the API Contract
- **Both**: Website AND API must be implemented for the feature to be complete

### Data Setup

- Load products from seed file: `docs/workshop/seed-data.json`
- Seed file contains 100 products across 6 categories
