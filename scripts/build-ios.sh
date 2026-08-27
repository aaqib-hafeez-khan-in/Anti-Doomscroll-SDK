#!/bin/bash
set -e

SCHEME="Release"
OUTPUT_DIR="dist/ios"

while [[ "$#" -gt 0 ]]; do
    case $1 in
        --scheme) SCHEME="$2"; shift ;;
        --output-dir) OUTPUT_DIR="$2"; shift ;;
        *) echo "Unknown parameter passed: $1"; exit 1 ;;
    esac
    shift
done

echo "Building iOS for scheme: $SCHEME"
mkdir -p "$OUTPUT_DIR"

if [[ "$OSTYPE" != "darwin"* ]]; then
    echo "iOS builds must be run on macOS."
    exit 1
fi

npx react-native bundle --entry-file index.js --platform ios --dev false --bundle-output ios/main.jsbundle --assets-dest ios

cd ios
xcodebuild archive -workspace AntiDoomscrollJournal.xcworkspace -scheme AntiDoomscrollJournal -configuration $SCHEME -archivePath build/AntiDoomscrollJournal.xcarchive

TIMESTAMP=$(date +%s)
DEST_APP="$OUTPUT_DIR/antidoomscroll-${SCHEME}-${TIMESTAMP}.xcarchive"

cp -R "build/AntiDoomscrollJournal.xcarchive" "../$DEST_APP"
cd ..

echo "Build complete!"
echo "Archive Path: $DEST_APP"
