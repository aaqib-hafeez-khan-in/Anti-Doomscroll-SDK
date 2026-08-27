#!/bin/bash
set -e

echo "Starting Android Release Pipeline..."

if [ -z "$KEYSTORE_PATH" ] || [ -z "$KEYSTORE_PASSWORD" ] || [ -z "$KEY_ALIAS" ] || [ -z "$KEY_PASSWORD" ]; then
    echo "WARNING: Keystore environment variables not fully set. Proceeding without signing if debug."
fi

# Bump version roughly by incrementing the versionCode in build.gradle
# This is a naive implementation; ideally you would use a tool like standard-version
sed -i.bak -e 's/versionCode \([0-9]*\)/versionCode \n\1+1\n/' android/app/build.gradle
# We revert the naive sed and do it properly later or assume it's manually set for now
mv android/app/build.gradle.bak android/app/build.gradle

cd android
./gradlew bundleRelease
cd ..

AAB_PATH="android/app/build/outputs/bundle/release/app-release.aab"

if command -v bundletool &> /dev/null; then
    echo "Verifying AAB..."
    bundletool validate --bundle "$AAB_PATH"
fi

if command -v sha256sum &> /dev/null; then
    echo "Generating SHA-256 hash..."
    sha256sum "$AAB_PATH" > "${AAB_PATH}.sha256"
fi

echo "Release build successful."
echo "AAB Path: $AAB_PATH"
ls -lh "$AAB_PATH"
