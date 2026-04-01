# Feature 2: Shopping Cart

## Business Requirement

As a customer, I want to add products to a cart so I can collect items before purchasing.

## Frontend Acceptance Criteria

- Cart page displaying all items with image, name, price, quantity
- Quantity controls (+/- buttons or input)
- Remove item button for each item
- Subtotal per item (price × quantity)
- Cart total at bottom of page
- "Continue Shopping" button to go back to products
- "Proceed to Checkout" button when cart has items
- Cart icon in header showing item count (optional)

## API Contract

```yaml
GET /api/cart
Response: {
  "items": [
    {
      "productId": 1,
      "name": "Product Name",
      "price": 99.99,
      "quantity": 2,
      "subtotal": 199.98
    }
  ],
  "total": 199.98
}

POST /api/cart/items
Body: { "productId": 1, "quantity": 1 }
Response: { "items": [...], "total": ... }

PUT /api/cart/items/{productId}
Body: { "quantity": 3 }
Response: { "items": [...], "total": ... }

DELETE /api/cart/items/{productId}
Response: { "items": [...], "total": ... }
```

## Verification Test

```typescript
// test: cart operations
await fetch("/api/cart/items", {
  method: "POST",
  body: JSON.stringify({ productId: 1, quantity: 1 }),
});
const cart = await (await fetch("/api/cart")).json();
expect(cart.items.length).toBe(1);
expect(cart.total).toBeGreaterThan(0);

await fetch("/api/cart/items/1", {
  method: "PUT",
  body: JSON.stringify({ quantity: 2 }),
});
const updated = await (await fetch("/api/cart")).json();
expect(updated.items[0].quantity).toBe(2);

await fetch("/api/cart/items/1", { method: "DELETE" });
const empty = await (await fetch("/api/cart")).json();
expect(empty.items.length).toBe(0);
```
