# Health Log - Backend API

Minimalistic REST API for health tracking. Single-user design with API key authentication.

## Overview

- **Framework**: Express.js with TypeScript
- **Database**: SQLite with Prisma ORM
- **Auth**: API key via `X-API-KEY` header
- **Port**: 3000 (internal), 8601 (external via Docker)

## Quick Start

### Via Docker (Recommended)

```bash
# From project root
docker compose up -d
```

Backend will be available at `http://localhost:8601`

### Local Development

```bash
cd backend
npm install

# Copy environment file
cp .env.example .env

# Set up database
npx prisma generate
npx prisma db push

# Start dev server
npm run dev
```

## Environment Variables

```bash
DATABASE_URL=file:/data/health.db  # SQLite database path
API_KEY=your-super-secret-api-key  # Authentication key
PORT=3000                          # Server port
```

## API Endpoints

All endpoints require `X-API-KEY` header except health check.

### Health Check

```bash
GET /api/health
```

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-01-05T10:00:00.000Z"
}
```

### Blood Pressure

**Create Reading:**
```bash
POST /api/blood-pressure
Content-Type: application/json
X-API-KEY: your-api-key

{
  "timestamp": "2025-01-05T10:30:00.000Z",
  "systolic": 120,
  "diastolic": 80,
  "pulse": 72,
  "note": "Morning reading",
  "source": "manual"
}
```

**Get Readings:**
```bash
GET /api/blood-pressure?limit=100&offset=0
X-API-KEY: your-api-key
```

**Query Parameters:**
- `limit` - Number of records (default: 100)
- `offset` - Skip records (default: 0)
- `startDate` - Filter by start date (ISO 8601)
- `endDate` - Filter by end date (ISO 8601)

### Food Log

**Create Entry:**
```bash
POST /api/food
Content-Type: application/json
X-API-KEY: your-api-key

{
  "timestamp": "2025-01-05T12:00:00.000Z",
  "description": "Lunch: Chicken salad",
  "calories": 450,
  "source": "manual"
}
```

**Get Entries:**
```bash
GET /api/food?limit=100&offset=0
X-API-KEY: your-api-key
```

### Water Intake

**Create Entry:**
```bash
POST /api/water
Content-Type: application/json
X-API-KEY: your-api-key

{
  "timestamp": "2025-01-05T14:00:00.000Z",
  "amountMl": 500,
  "type": "water",
  "source": "manual"
}
```

**Valid types:** `water`, `tea`, `coffee`, `juice`, `other`

**Get Entries:**
```bash
GET /api/water?limit=100&offset=0&startDate=2025-01-05T00:00:00.000Z
X-API-KEY: your-api-key
```

## Database Schema

```prisma
model BloodPressure {
  id        Int      @id @default(autoincrement())
  timestamp DateTime
  systolic  Int
  diastolic Int
  pulse     Int?
  note      String?
  source    String   @default("manual")
  createdAt DateTime @default(now())
}

model Food {
  id          Int      @id @default(autoincrement())
  timestamp   DateTime
  description String
  calories    Int?
  source      String   @default("manual")
  createdAt   DateTime @default(now())
}

model Water {
  id        Int      @id @default(autoincrement())
  timestamp DateTime
  amountMl  Int
  type      String   @default("water")
  source    String   @default("manual")
  createdAt DateTime @default(now())
}
```

## Project Structure

```
backend/
├── src/
│   ├── index.ts         # Express server setup
│   ├── routes/          # API route handlers
│   │   ├── bloodPressure.ts
│   │   ├── food.ts
│   │   └── water.ts
│   ├── middleware/      # Auth middleware
│   │   └── auth.ts
│   └── services/        # Business logic
├── prisma/
│   └── schema.prisma    # Database schema
├── Dockerfile
├── package.json
└── tsconfig.json
```

## Development

### Database Changes

After modifying `prisma/schema.prisma`:

```bash
npx prisma generate  # Regenerate Prisma Client
npx prisma db push   # Apply schema to database
```

### View Database

```bash
npx prisma studio
# Opens at http://localhost:5555
```

### Build

```bash
npm run build  # Compiles TypeScript to dist/
```

## Features

- **Idempotent Inserts**: Duplicate entries (same timestamp + values + source) return existing record
- **CORS**: Enabled for all origins
- **Timestamps**: All dates stored as ISO 8601 UTC
- **Validation**: Basic input validation on all endpoints

## Troubleshooting

```bash
# Check logs
docker compose logs -f backend

# Access container
docker compose exec backend sh

# View database
docker compose exec backend npx prisma studio
```

## Security

- Always use HTTPS in production (reverse proxy)
- Change default API key immediately
- Keep API key secret
- No rate limiting built-in (add reverse proxy)

## License

MIT - Free to use and modify.
