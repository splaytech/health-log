#!/bin/bash

set -e

echo "Building React Native Web..."

# Install dependencies
npm install

# Build for web
npx expo export:web

echo "Web build complete. Output in dist/"
