# Feature 4: Order Management

## Business Requirement

As a customer, I want to view my order history and order details so I can track my purchases.

## Guardrails

### API Contract

```yaml
GET /api/orders
Response: [
  {
    "orderId": 1,
    "date": "2026-03-31T10:00:00Z",
    "total": 199.99,
    "status": "delivered"
  }
]

GET /api/orders/{orderId}
Response: {
  "orderId": 1,
  "date": "2026-03-31T10:00:00Z",
  "items": [
    {
      "productId": 1,
      "name": "Product Name",
      "price": 99.99,
      "quantity": 2,
      "subtotal": 199.98
    }
  ],
  "total": 199.98,
  "status": "delivered",
  "shippingAddress": "123 Main St, City, Country"
}
```

### Verification Test

```typescript
// test: order history and details
const orders = await (await fetch("/api/orders")).json();
expect(orders.length).toBeGreaterThan(0);
expect(orders[0]).toHaveProperty("orderId");
expect(orders[0]).toHaveProperty("date");
expect(orders[0]).toHaveProperty("total");
expect(orders[0]).toHaveProperty("status");

const details = await (await fetch("/api/orders/1")).json();
expect(details.orderId).toBe(1);
expect(details.items).toBeDefined();
expect(details.shippingAddress).toBeDefined();
```

### Implementation Guidance

- **Website**: Use UI/UX Pro Max skill to design the order management pages (order history and order details)
- **API**: Implement RESTful endpoints following the API Contract
- **Both**: Website AND API must be implemented for the feature to be complete
