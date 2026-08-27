#!/bin/bash
set -e

echo "Starting iOS Release Pipeline..."

if [[ "$OSTYPE" != "darwin"* ]]; then
    echo "iOS release pipeline must be run on macOS."
    exit 1
fi

cd ios
xcodebuild archive -workspace AntiDoomscrollJournal.xcworkspace -scheme AntiDoomscrollJournal -configuration Release -archivePath build/AntiDoomscrollJournal.xcarchive

# Assuming ExportOptions.plist exists in the ios directory
if [ -f ExportOptions.plist ]; then
    xcodebuild -exportArchive -archivePath build/AntiDoomscrollJournal.xcarchive -exportOptionsPlist ExportOptions.plist -exportPath build/exported
else
    echo "Warning: ExportOptions.plist not found. Skipping IPA export."
fi

if [ -n "$APPLE_ID" ] && [ -n "$APP_SPECIFIC_PASSWORD" ]; then
    echo "Uploading to App Store Connect..."
    xcrun altool --upload-app -f build/exported/AntiDoomscrollJournal.ipa -t ios -u "$APPLE_ID" -p "$APP_SPECIFIC_PASSWORD"
fi

cd ..
echo "iOS Release Pipeline successful."
