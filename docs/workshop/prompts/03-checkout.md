# Feature 3: Checkout

## Business Requirement

As a customer, I want to complete my purchase by providing shipping and payment information.

## Frontend Acceptance Criteria

- Checkout form with the following sections:
  - **Shipping Address**: Street, City, State/Province, Zip/Postal Code, Country
  - **Payment Method**: Radio buttons or dropdown (card, paypal, bank_transfer)
  - **Order Summary**: List of items being purchased with quantities and prices
- Form validation for required fields
- Submit Order button
- On success: show order confirmation with order ID
- After successful checkout: cart should be cleared

## API Contract

```yaml
POST /api/checkout
Body: {
  "shippingAddress": "123 Main St, City, Country",
  "paymentMethod": "card"
}
Response: {
  "orderId": 1,
  "total": 199.99,
  "status": "pending"
}
```

## Verification Test

```typescript
// test: checkout creates order and clears cart
// First add item to cart
await fetch("/api/cart/items", {
  method: "POST",
  body: JSON.stringify({ productId: 1, quantity: 1 }),
});

// Then checkout
const order = await (
  await fetch("/api/checkout", {
    method: "POST",
    body: JSON.stringify({
      shippingAddress: "123 Main St",
      paymentMethod: "card",
    }),
  })
).json();

expect(order.orderId).toBeDefined();
expect(order.total).toBeGreaterThan(0);
expect(order.status).toBe("pending");

// Cart should be empty after checkout
const cart = await (await fetch("/api/cart")).json();
expect(cart.items.length).toBe(0);
```
