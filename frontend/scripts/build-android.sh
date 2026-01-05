#!/bin/bash

set -e

echo "Building Android APK..."

# Ensure dependencies are installed
npm install

# Option 1: Using EAS Build (recommended)
if command -v eas &> /dev/null; then
  echo "Using EAS Build..."
  echo "Building APK with EAS..."
  eas build --platform android --profile preview --local
  echo "APK built successfully!"
  echo "Find APK in current directory or EAS build output"
  exit 0
fi

# Option 2: Local build (requires Android SDK)
echo "EAS CLI not found. Using local Gradle build..."
echo "Note: This requires Android SDK to be installed"

# Generate native projects if not present
if [ ! -d "android" ]; then
  echo "Generating native Android project..."
  npx expo prebuild --platform android
fi

# Build release APK
echo "Building APK with Gradle..."
cd android
./gradlew assembleRelease

echo "APK built successfully!"
echo "Find APK at: android/app/build/outputs/apk/release/app-release.apk"
