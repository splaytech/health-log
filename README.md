# Health Log

A minimalistic, self-hosted health tracking app for personal use. Track blood pressure, food intake, and water consumption with a simple, privacy-first approach.

**Open Source** • **Single User** • **Self-Hosted** • **React Native**

## Features

- Blood Pressure Tracking (systolic, diastolic, pulse)
- Food Logging with calories
- Water Intake tracking
- Dashboard with daily summary
- Simple charts and trends
- Offline-first mobile app
- Web interface
- Privacy-first - all data stored locally in SQLite

## Tech Stack

- **Frontend**: React Native (Expo) for web and Android
- **Backend**: Node.js, Express, TypeScript, Prisma
- **Database**: SQLite
- **Deployment**: Docker Compose

## Quick Start

### Prerequisites

- Docker and Docker Compose
- For Android APK: Node.js 18+ and npm

### Setup

1. **Clone the repository**
```bash
git clone <repository-url>
cd health-log
```

2. **Copy and configure environment**
```bash
cp .env.example .env
```

3. **Edit `.env` and change the API key**
```bash
nano .env
# Change: API_KEY=your-super-secret-api-key-here
```

4. **Start the application**
```bash
docker compose up -d
```

5. **Access the app**
   - Web: http://localhost:8600
   - API: http://localhost:8601

### Configure Frontend API Connection

On first launch, the app will prompt you to configure:

- **API URL**:
  - For web (via Docker): Already configured (uses relative URLs)
  - For Android: Use your server's IP, e.g., `http://192.168.1.100:8601`

- **API Key**: The same key you set in `.env` file

You can always reconfigure this in the Settings screen.

### Build Android APK

1. **Install dependencies**
```bash
cd frontend
npm install
```

2. **Build APK** (choose one method)

   **Option A - Using build script:**
   ```bash
   ./scripts/build-android.sh
   ```

   **Option B - Using EAS Build:**
   ```bash
   # Install EAS CLI
   npm install -g eas-cli

   # Login to Expo
   eas login

   # Build APK
   eas build --platform android --profile preview
   ```

3. **Download and install**
   - For Option A: APK will be in `frontend/build/`
   - For Option B: Download from the EAS Build dashboard link

4. **On first launch of Android app**
   - Enter your API URL: `http://YOUR_SERVER_IP:8601`
   - Enter your API Key (from `.env` file)

See [frontend/README.md](frontend/README.md) for detailed build instructions.

## Environment Variables

### `.env` (root directory)
```bash
API_KEY=your-super-secret-api-key-here
```

This is the only configuration required. The API key secures your backend API.

## API

All API endpoints require `X-API-KEY` header. See [backend/README.md](backend/README.md) for full API documentation.

**Endpoints:**
- `GET /api/health` - Health check (no auth required)
- `GET|POST /api/blood-pressure` - Blood pressure readings
- `GET|POST /api/food` - Food entries
- `GET|POST /api/water` - Water intake

## Data Backup

```bash
# Backup database
docker compose exec backend cat /data/health.db > backup-$(date +%Y%m%d).db

# Export as JSON
curl -H "X-API-KEY: your-api-key" http://localhost:8601/api/blood-pressure?limit=10000 > bp.json
```

## Development

See individual README files:
- [frontend/README.md](frontend/README.md) - React Native app development
- [backend/README.md](backend/README.md) - Backend API development

## Troubleshooting

```bash
# Check logs
docker compose logs -f backend

# Restart
docker compose restart

# Clean rebuild
docker compose down && docker compose up -d --build
```

## Project Structure

```
health-log/
├── frontend/          # React Native app (web + Android)
├── backend/           # Node.js API server
├── docker-compose.yml # Docker configuration
└── .env              # API key configuration
```

## Security

- Change the default API key immediately
- Keep your API key secret
- For internet access, use HTTPS (reverse proxy) or VPN

## License

MIT - Free to use and modify for personal or commercial projects.
