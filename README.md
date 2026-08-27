# Anti-Doomscroll Journal

[![Stable Release](https://img.shields.io/badge/Release-Stable-green.svg)](https://github.com/AaqibhafeezKhan/Anti-Doomscroll-SDK)

## Project Overview

Anti-Doomscroll Journal is a high-performance React Native application engineered to decouple the habit of mindless scrolling on social media. Utilizing native Android and iOS APIs, the app monitors real-time screen usage and proactively interrupts identified "doomscrolling" behavioral loops with a "Gratitude Blocker."

The blocker is not a simple dismissal; it is a mindful intervention that requires users to spend time breathing and composing a structured gratitude entry. By converting compulsive digital consumption into active reflection, users build sustainable mental health habits, tracked via advanced insights and gamified streaks.

## Features

- **Native Screen Time Monitoring**: Real-time tracking of foreground application usage using `UsageStatsManager` (Android) and `DeviceActivity` (iOS).
- **Intelligent Gratitude Blocker**: A premium, full-screen UI requiring structured reflections (minimum word counts and timed sessions) to ensure genuine engagement.
- **Biometric & Haptic Feedback**: Integrated haptic responses for a tactile, grounded user experience during reflection.
- **Advanced Gamification**: Robust streak tracking system with historical logging to encourage long-term habit formation.
- **Privacy-First Architecture**: 100% on-device data sovereignty. All journal entries are stored locally via a high-performance SQLite engine (MMKV for state, Quick-SQLite for journals).
- **Data Visualization**: Comprehensive "Insights" dashboard featuring mood distribution, trigger app analysis, and a 90-day activity map.
- **Universal Theming**: Dynamic support for Light, Dark, and System-adaptive design systems.

## Tech Stack

- Framework: React Native 0.73.x
- Navigation: React Navigation v6
- State Management: Zustand
- Storage: MMKV (app state) & SQLite via react-native-quick-sqlite (journals)
- UI/Animations: StyleSheet, react-native-reanimated v3, Lottie, react-native-svg
- Background Processing: react-native-background-fetch
- Local Notifications: @notifee/react-native

## Prerequisites

- Node.js >= 18
- JDK 17 (for Android)
- Android SDK & Android Studio
- Xcode >= 15 (for iOS)
- CocoaPods

## Installation

1. Clone the repository
2. Run installation script:
```bash
./scripts/setup.sh
```
3. Set up environment variables: Use `.env.example` to create your local `.env`.

## Running the App

Start the Metro bundler:
```bash
npm start
```

Run on Android:
```bash
npm run android
```

Run on iOS:
```bash
npm run ios
```

## Building for Production

Use the provided build scripts for easier generation of debug and release builds:

Android:
```bash
npm run build:android:release
```

iOS:
```bash
npm run build:ios:release
```

## Release Process

Full release scripts handle bumping, signing, and verification.

Android (AAB + APK):
```bash
npm run release:android
```

iOS (Archive + IPA):
```bash
npm run release:ios
```

## Landing Page Deployment

The project includes a vanilla HTML/CSS landing page under `landing/`.

Deploy via script (supports github-pages, netlify, vercel, s3):
```bash
npm run deploy:landing -- --target s3
```

## Environment Variables Reference

| Variable | Description | Required | Default |
| -------- | ----------- | -------- | ------- |
| KEYSTORE_PATH | Path to Android keystore | No | ./android/app/release.keystore |
| KEYSTORE_ALIAS | Alias for keystore | No | antidoomscroll |
| KEYSTORE_PASSWORD | Keystore password | No |  |
| KEY_PASSWORD | Key password | No |  |
| APPLE_ID | Apple ID for App Store Connect | No | |
| APP_SPECIFIC_PASSWORD | App-specific password | No | |
| TEAM_ID | Apple Developer Team ID | No | |
| BUNDLE_ID | iOS Bundle Identifier | No | com.antidoomscroll.journal |
| S3_BUCKET | S3 Bucket name for landing page | No | |
| CF_DISTRIBUTION_ID| CloudFront Distribution ID | No | |
| APP_VERSION | Current App Version | Yes | 1.0.0 |
| APP_BUILD_NUMBER | Current Build Number | Yes | 1 |

## Architecture Overview

- `src/components`: Reusable UI components.
- `src/screens`: Top-level navigational screens.
- `src/hooks`: Custom React hooks connecting UI to services and stores.
- `src/store`: Zustand state management (Settings, Journal, Streaks).
- `src/services`: Singleton logic (SQLite Database, Background Tasks, Notifications, Analytics).
- `src/theme`: Centralized styling and color palettes.
- `src/utils`: Helpers and constant values.


