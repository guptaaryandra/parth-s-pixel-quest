# Building the offline Android APK

The game is fully client-side, so it can be packaged into a real Android app with
Capacitor. Everything (code, sounds, pixel font) is bundled — no internet needed
after install.

## What's in the repo

- `android-shell/` — static entry (index.html + main.tsx) that mounts the game without SSR
- `vite.android.config.ts` — builds that entry into `dist-android/`
- `capacitor.config.ts` — app id `com.parth.animequest`, name "Parth's Anime Quest"
- `android/` — native Android project (already generated, locked to landscape)

## One-time setup on your machine

1. Install [Android Studio](https://developer.android.com/studio) (includes the SDK + Gradle).
2. Install a JDK 21 (Android Studio ships one).
3. Clone/pull this project and run `npm install`.

## Build the APK

```bash
npm run android:sync     # builds the web bundle + copies it into android/
npm run android:open     # opens the project in Android Studio
```

In Android Studio: **Build → Build Bundle(s)/APK(s) → Build APK(s)**.
The file lands at:

```
android/app/build/outputs/apk/debug/app-debug.apk
```

Copy that to your phone and install it (allow "install from unknown sources").

### Command line alternative (no Android Studio UI)

```bash
npm run build:android
npx cap sync android
cd android && ./gradlew assembleDebug
```

### Release (signed) build

```bash
keytool -genkey -v -keystore quest.keystore -alias quest -keyalg RSA -keysize 2048 -validity 10000
cd android && ./gradlew assembleRelease
```

Then sign/align with the keystore (or configure `signingConfigs` in
`android/app/build.gradle`) before publishing.

## Notes

- The activity is locked to `sensorLandscape`, matching the game's horizontal-only design.
- App icons live in `android/app/src/main/res/mipmap-*`; replace them to customise.
- Re-run `npm run android:sync` after any change to the game code.
