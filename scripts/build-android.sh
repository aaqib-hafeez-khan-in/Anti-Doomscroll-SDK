#!/bin/bash
set -e

VARIANT="release"
OUTPUT_DIR="dist/android"

while [[ "$#" -gt 0 ]]; do
    case $1 in
        --variant) VARIANT="$2"; shift ;;
        --output-dir) OUTPUT_DIR="$2"; shift ;;
        *) echo "Unknown parameter passed: $1"; exit 1 ;;
    esac
    shift
done

echo "Building Android for variant: $VARIANT"
mkdir -p "$OUTPUT_DIR"

if [ -f .env.production ]; then
    export $(cat .env.production | xargs)
fi

cd android

if [ "$VARIANT" = "release" ]; then
    ./gradlew assembleRelease
    APK_BASE="app/build/outputs/apk/release/app-release.apk"
else
    ./gradlew assembleDebug
    APK_BASE="app/build/outputs/apk/debug/app-debug.apk"
fi

cd ..

TIMESTAMP=$(date +%s)
DEST_APK="$OUTPUT_DIR/antidoomscroll-${VARIANT}-${TIMESTAMP}.apk"

cp "android/$APK_BASE" "$DEST_APK"

echo "Build complete!"
echo "APK Path: $DEST_APK"
ls -lh "$DEST_APK"
