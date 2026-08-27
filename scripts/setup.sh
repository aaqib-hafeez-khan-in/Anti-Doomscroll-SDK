#!/bin/bash
set -e

echo "Starting Anti-Doomscroll Journal setup..."

# Check requirements
echo "Checking requirements..."
if ! command -v node &> /dev/null; then
    echo "Node.js could not be found. Please install Node >= 18."
    exit 1
fi

if ! command -v java &> /dev/null; then
    echo "Java could not be found. Please install Java 17."
    exit 1
fi

# NPM Install
echo "Installing NPM dependencies..."
npm install

# iOS Pod Install
if [[ "$OSTYPE" == "darwin"* ]]; then
    echo "Installing iOS Pods..."
    if ! command -v pod &> /dev/null; then
        echo "CocoaPods not found. Please install it."
    else
        cd ios && pod install && cd ..
    fi
fi

# Environment
if [ ! -f .env ]; then
    echo "Copying .env.example to .env..."
    cp .env.example .env
fi

echo "Setup complete! Next steps:"
echo "1. Run 'npm run ios' or 'npm run android' to start the app."
echo "2. Update your .env file if necessary."
