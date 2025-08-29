# 📱 Full Guide: Build & Run Capacitor Android App

This is the complete workflow for editing your app, syncing with Capacitor, building, and running it on your Android phone using Android Studio.

---

## 1. Prerequisites

* Node.js installed (LTS recommended)
* Capacitor CLI installed
* Android Studio installed with Android SDK
* USB Debugging enabled on your Android phone
* Capacitor project already initialized

---

## 2. Initial Capacitor Setup (if not done yet)

```bash
npm install @capacitor/core @capacitor/cli
npx cap init
npx cap add android
```

---

## 3. Edit Your Frontend Code

* Make changes in your React/Vue/Angular code.
* Save all files.

---

## 4. Build Frontend and Sync

```bash
# Build frontend assets
npm run build

# Copy changes to Android project
npx cap copy android

# Sync plugins and configuration
npx cap sync android
```

---

## 5. Open Android Studio

```bash
npx cap open android
```

* Open the `android/` folder in Android Studio.
* Wait for Gradle sync to complete.

---

## 6. Connect Your Device

* Connect your phone via USB.
* Allow **USB Debugging** prompt.
* Verify your device is listed in Android Studio's device selector.

---

## Download app to the mobile 
- adb devices
- adb install C:\Users\menae\Desktop\learnify-role-access-98\android\app\build\outputs\apk\debug\app-debug.apk


---


## 7. Build & Run the App

1. Select your device in Android Studio.
2. Make sure `app` module is selected.
3. Click the green **Run ▶** button.

* Android Studio will build the app, install it on your device, and launch it automatically.

---

## 8. Repeat After Every Edit

Whenever you edit code:

1. Build frontend: `npm run build`
2. Copy & sync: `npx cap copy android && npx cap sync android`
3. Open Android Studio (if not already open): `npx cap open android`
4. Click **Run ▶** to see changes on your phone.

---

## 9. Optional: Generate Release APK/AAB

1. In Android Studio: `Build > Generate Signed Bundle / APK`
2. Follow steps to sign with a keystore.
3. Output `.apk` or `.aab` can be shared or uploaded to Play Store.

---

## Summary Quick Commands

```bash
# Add Android platform
npx cap add android

# Build frontend
npm run build

# Copy & sync
npx cap copy android && npx cap sync android

# Open Android Studio
npx cap open android
```

✅ This workflow ensures your Capacitor app is always updated and running on your Android device.
