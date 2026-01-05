# Android APK Build Guide

## Overview

This document explains how to build the Health Log Android APK. There are two methods available:
1. **EAS Build** (Recommended) - Cloud-based builds, no local Android SDK needed
2. **Local Gradle Build** - Requires Android Studio and SDK installed locally

## Prerequisites

### Option 1: EAS Build (Recommended)

1. Install EAS CLI globally:
   ```bash
   npm install -g eas-cli
   ```

2. Login to Expo (create a free account if needed):
   ```bash
   eas login
   ```

3. Configure your project (first time only):
   ```bash
   eas build:configure
   ```

### Option 2: Local Build

1. Install [Android Studio](https://developer.android.com/studio)
2. Install Android SDK (via Android Studio SDK Manager)
3. Set `ANDROID_HOME` environment variable:
   ```bash
   export ANDROID_HOME=$HOME/Android/Sdk
   export PATH=$PATH:$ANDROID_HOME/emulator
   export PATH=$PATH:$ANDROID_HOME/platform-tools
   ```
4. Install Java JDK 17:
   ```bash
   # On Ubuntu/Debian
   sudo apt install openjdk-17-jdk

   # On macOS
   brew install openjdk@17
   ```

## Building the APK

### Quick Start

Run the automated build script:

```bash
./scripts/build-android.sh
```

The script will automatically detect if EAS CLI is available and choose the appropriate build method.

### Manual Build with EAS

1. **Preview Build** (APK for testing):
   ```bash
   eas build --platform android --profile preview
   ```

2. **Local EAS Build** (if you want to build locally):
   ```bash
   eas build --platform android --profile preview --local
   ```

3. **Production Build** (for release):
   ```bash
   eas build --platform android --profile production
   ```

The APK will be available for download from the Expo dashboard or in your current directory (for local builds).

### Manual Local Gradle Build

1. Generate native Android project:
   ```bash
   npx expo prebuild --platform android
   ```

2. Build release APK:
   ```bash
   cd android
   ./gradlew assembleRelease
   ```

3. Find the APK at:
   ```
   android/app/build/outputs/apk/release/app-release.apk
   ```

## APK Signing

### For Development/Testing

The debug APK is automatically signed with a debug keystore. No additional configuration needed.

### For Production Release

#### Generate a Keystore

```bash
keytool -genkeypair -v \
  -storetype PKCS12 \
  -keystore health-log.keystore \
  -alias health-log \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000
```

You'll be prompted to enter:
- Keystore password (remember this!)
- Key password (can be same as keystore password)
- Your name, organization, etc.

#### Configure Signing (Local Builds Only)

1. Create `android/gradle.properties` (if it doesn't exist):
   ```properties
   MYAPP_UPLOAD_STORE_FILE=../health-log.keystore
   MYAPP_UPLOAD_KEY_ALIAS=health-log
   MYAPP_UPLOAD_STORE_PASSWORD=your_keystore_password
   MYAPP_UPLOAD_KEY_PASSWORD=your_key_password
   ```

2. Update `android/app/build.gradle`:
   ```gradle
   android {
     ...
     signingConfigs {
       release {
         if (project.hasProperty('MYAPP_UPLOAD_STORE_FILE')) {
           storeFile file(MYAPP_UPLOAD_STORE_FILE)
           storePassword MYAPP_UPLOAD_STORE_PASSWORD
           keyAlias MYAPP_UPLOAD_KEY_ALIAS
           keyPassword MYAPP_UPLOAD_KEY_PASSWORD
         }
       }
     }
     buildTypes {
       release {
         ...
         signingConfig signingConfigs.release
       }
     }
   }
   ```

#### EAS Build Signing

For EAS builds, signing is handled automatically. For production builds to Google Play:

```bash
eas build --platform android --profile production
```

Follow the prompts to create or use existing credentials.

## Installing the APK

### On Physical Device

1. **Enable USB Debugging**:
   - Go to Settings → About Phone
   - Tap "Build Number" 7 times to enable Developer Options
   - Go to Settings → Developer Options
   - Enable "USB Debugging"

2. **Install via ADB**:
   ```bash
   adb install app-release.apk
   ```

3. **Or transfer APK to device**:
   - Copy APK to device via USB or cloud storage
   - Open Files app on device
   - Tap the APK file
   - Allow installation from unknown sources if prompted

### On Emulator

1. Start Android Emulator from Android Studio
2. Install APK:
   ```bash
   adb install app-release.apk
   ```

## First Launch Configuration

When you first launch the app on Android, you'll see an API configuration screen:

1. **API URL**: Enter your backend URL
   - For local development: `http://192.168.1.100:8601` (replace with your computer's IP)
   - For production: `https://your-domain.com` (with port if needed)

2. **API Key**: Enter your backend API key
   - Default for development: `change-me-in-production`
   - For production: Use the key from your `docker-compose.yml`

3. Tap **"Test & Continue"** to verify the connection

The app will save these settings and sync your data automatically.

## Troubleshooting

### Build Failures

**Problem**: `ANDROID_HOME not set`
```bash
export ANDROID_HOME=$HOME/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/platform-tools
```

**Problem**: `Gradle build failed`
- Clean build: `cd android && ./gradlew clean`
- Delete `android/` folder and run `npx expo prebuild` again

**Problem**: `Permission denied: gradlew`
```bash
chmod +x android/gradlew
```

### Installation Issues

**Problem**: "App not installed" error
- Uninstall any existing version first
- Check if device has enough storage
- Enable "Install from Unknown Sources" in settings

**Problem**: Can't connect to API
- Verify the backend is running: `curl http://your-ip:8601/api/health`
- Check firewall settings on your server
- Make sure you're using the correct IP address (not localhost on Android)
- Try using your computer's actual IP instead of localhost

## Development Workflow

### Testing Changes

1. Make changes to code
2. Rebuild APK:
   ```bash
   ./scripts/build-android.sh
   ```
3. Install on device:
   ```bash
   adb install -r app-release.apk
   ```

### Live Development

For faster iteration during development:

```bash
npm run android
```

This starts Metro bundler and runs the app in development mode with live reload.

## Build Profiles Explained

### Development Profile
```bash
eas build --platform android --profile development
```
- Development client with debugger
- For internal testing only

### Preview Profile
```bash
eas build --platform android --profile preview
```
- **APK** build (recommended for testing)
- Installable on any device
- No Google Play Store required

### Production Profile
```bash
eas build --platform android --profile production
```
- **AAB** (Android App Bundle) or APK
- Optimized for release
- Ready for Google Play Store

## File Size Optimization

The APK size can be reduced by:

1. **Enable Hermes** (already configured in `app.json`):
   ```json
   {
     "expo": {
       "android": {
         "jsEngine": "hermes"
       }
     }
   }
   ```

2. **Enable ProGuard** in `android/app/build.gradle`:
   ```gradle
   buildTypes {
     release {
       minifyEnabled true
       shrinkResources true
       proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
     }
   }
   ```

3. **Split APKs by ABI** (generates separate APKs for different CPU architectures):
   ```gradle
   splits {
     abi {
       enable true
       reset()
       include "armeabi-v7a", "arm64-v8a", "x86", "x86_64"
       universalApk false
     }
   }
   ```

## Next Steps

After building and installing the APK:

1. Configure API connection on first launch
2. Test offline mode by enabling airplane mode
3. Add data entries and verify sync when back online
4. Test all features: Dashboard, Blood Pressure, Food, Water, Settings

## Support

For build issues:
- Check [Expo Documentation](https://docs.expo.dev/build/introduction/)
- Check [EAS Build Documentation](https://docs.expo.dev/build/introduction/)
- Review error logs in terminal output
