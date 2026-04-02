# AGENTS.md - Mini Ecommerce Workshop

## Tech Stack

- **Frontend:** React (Vite)
- **Backend:** .NET Core 8 (C#)
- **Database:** PostgreSQL
- **Container:** Docker Compose

## Monorepo Structure

```
/
├── apps/
│   ├── api/           # .NET Core Web API
│   └── web/           # React frontend
├── packages/
│   └── shared/        # Shared types, contracts
├── docker-compose.yml
├── AGENTS.md
└── docs/workshop/
```

## Docker Compose Services

- **postgres:** PostgreSQL 15 (port 5432)
- **api:** .NET Core API (port 5000)
- **web:** React Vite dev server (port 3000)

## Database

- Use PostgreSQL in Docker (not in-memory)
- Data persists across restarts
- Initialize with seed data from `docs/workshop/seed-data.json`

## Quality Gates

- ESLint + Prettier must pass on frontend
- API must conform to OpenAPI spec in `docs/workshop/verification/openapi.yaml`
- All unit tests must pass

## Build Commands

```bash
# Start all services
docker-compose up -d

# Start only database
docker-compose up -d postgres

# Run API locally
cd apps/api && dotnet run

# Run Web locally
cd apps/web && npm run dev

# Lint frontend
cd apps/web && npm run lint
```

## API Convention

- All endpoints prefix: `/api`
- Use RESTful patterns
- Response format: JSON
- Error format: `{ "error": "message" }`

## Frontend Convention

- Use functional components with hooks
- Use TypeScript
- CSS: Tailwind CSS or CSS Modules
- State: React Context or local state (no Redux for simplicity)
