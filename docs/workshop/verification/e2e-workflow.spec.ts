import { test, expect } from '@playwright/test';

test('complete ecommerce workflow', async ({ request }) => {
  // 1. Browse products
  const products = await request.get('/api/products');
  expect(products.ok()).toBeTruthy();
  const productList = await products.json();
  expect(productList.length).toBeGreaterThan(0);

  // 2. Add to cart
  await request.post('/api/cart/items', {
    data: { productId: 1, quantity: 1 }
  });
  const cart = await request.get('/api/cart');
  const cartData = await cart.json();
  expect(cartData.items.length).toBe(1);

  // 3. Checkout
  const order = await request.post('/api/checkout', {
    data: { shippingAddress: '123 Main St', paymentMethod: 'card' }
  });
  expect(order.ok()).toBeTruthy();
  const orderData = await order.json();
  expect(orderData.orderId).toBeDefined();
  expect(orderData.status).toBe('pending');

  // 4. View order
  const orders = await request.get('/api/orders');
  expect(orders.ok()).toBeTruthy();
  const orderList = await orders.json();
  expect(orderList.find((o: any) => o.orderId === orderData.orderId)).toBeDefined();
});