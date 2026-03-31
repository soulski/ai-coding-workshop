# Mini Ecommerce Workshop Guide

## Overview

Team builds a mini ecommerce application feature-by-feature using Superpowers (SDD - Skill-Driven Development). Each person implements the same feature independently, then demos and compares results.

## Workflow

```
Browse Products → Add to Cart → Payment → View Order
```

## Features (4 Weeks)

| Week | Feature          | Description                              |
| ---- | ---------------- | ---------------------------------------- |
| 1    | Product Catalog  | Browse products with name, price, image  |
| 2    | Shopping Cart    | Add/remove items, view total             |
| 3    | Checkout         | Shipping address, payment, order summary |
| 4    | Order Management | View order history and details           |

## How It Works

1. **Each week:** Run the prompt for that week's feature
2. **Implementation:** Team implements using Superpowers SDD
3. **Demo:** Present results, discuss differences
4. **Integration:** At the end, all features combine into complete workflow

## Verification

- API must conform to `docs/workshop/verification/openapi.yaml`
- E2E test `docs/workshop/verification/e2e-workflow.spec.ts` validates complete workflow

## Files

```
docs/workshop/
├── workshop-guide.md      # This file
├── prompts/
│   ├── 01-product-catalog.md
│   ├── 02-shopping-cart.md
│   ├── 03-checkout.md
│   └── 04-order-management.md
└── verification/
    ├── openapi.yaml
    └── e2e-workflow.spec.ts
```

## Running Locally

```bash
# Start all services
docker-compose up -d

# Run individually
cd apps/api && dotnet run    # API on port 5000
cd apps/web && npm run dev   # Web on port 3000
```
