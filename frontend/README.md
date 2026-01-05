# Health Log - Frontend

React Native app for web and Android. Minimalistic health tracker with offline-first sync.

## Overview

- **Platform**: React Native (Expo SDK 54)
- **Runs on**: Web (via Docker) and Android APK
- **UI**: React Native Paper (Material Design)
- **Offline**: Local database with automatic sync to backend
- **Charts**: Victory Native for data visualization

## Quick Start

### Web (via Docker)

The web version is automatically built and served when you run `docker compose up` from the project root.

### Android Development

```bash
npm install
npm run android  # Requires Android emulator or device
```

### Configure API Connection

On first launch, the app prompts for:

1. **API URL**
   - Web: Auto-configured (uses relative URLs via nginx)
   - Android: Your server IP, e.g., `http://192.168.1.100:8601`

2. **API Key**
   - Same key from your `.env` file in the project root

You can reconfigure anytime in Settings.

## Build Android APK

### Option A: Build Script (Recommended)

```bash
./scripts/build-android.sh
```

APK will be in `build/` directory.

### Option B: EAS Build

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Build APK
eas build --platform android --profile preview

# Download from EAS dashboard
```

See [docs/ANDROID_BUILD.md](./docs/ANDROID_BUILD.md) for detailed instructions.

## Tech Stack

- **Expo SDK 54**: React Native framework
- **React Native Paper**: Material Design UI
- **React Navigation 6**: Tab navigation
- **Victory Native**: Charts
- **WatermelonDB**: Offline database (SQLite on Android, IndexedDB on web)
- **TypeScript**: Type-safe development

## Offline Sync

1. **Local-First**: All data saved locally in WatermelonDB
2. **Auto Sync**: Syncs when network available or app returns to foreground
3. **Manual Sync**: Available in Settings screen

## Project Structure

```
frontend/
├── src/
│   ├── screens/       # Dashboard, BloodPressure, Food, Water, Settings
│   ├── database/      # WatermelonDB models & schema
│   ├── services/      # API client, storage, sync
│   └── navigation/    # React Navigation setup
├── scripts/
│   ├── build-web.sh
│   └── build-android.sh
└── docs/
    └── ANDROID_BUILD.md
```

## Development

```bash
# Run web
npm run web

# Run on Android emulator
npm run android
```

## Troubleshooting

### Android APK won't install
- Uninstall existing version first
- Enable "Unknown Sources" in device settings

### Can't connect to API
- Use server IP (e.g., `http://192.168.1.100:8601`), not `localhost`
- Verify backend is running: `curl http://your-ip:8601/api/health`
- Check firewall settings

### Data not syncing
- Check network connection
- Verify API URL and key in Settings
- Try manual sync from Settings

## License

MIT - Free to use and modify.
