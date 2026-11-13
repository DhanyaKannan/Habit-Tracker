# HabitFlow – Offline Habit Tracker Android App 🌿

HabitFlow is a modern, premium, 100% offline-first Android habit tracker built with React Native and Expo. It uses **Expo SQLite** for local permanent data storage and **Expo Notifications** for scheduled device reminders without requiring any backend server, cloud database, login, or internet connectivity.

---

## 🎨 Design Philosophy & Color Palette

HabitFlow uses an intentional aesthetic designed for daily calm and clarity:
- **Background**: Soft Cream (`#FAF7F2` in Light Mode, `#13131A` in Dark Mode)
- **Primary Accent**: Lavender (`#7E69AB` in Light, `#9F8DE3` in Dark)
- **Progress & Success**: Sage Green (`#5E9C76` in Light, `#6DB889` in Dark)
- **Card Backgrounds**: Pure White (`#FFFFFF` in Light, `#1C1C26` in Dark)
- **Typography**: Charcoal (`#232326` in Light, `#F6F5FA` in Dark)

---

## 📱 Application Screens & Features

### 1. Welcome Screen
- HabitFlow branding with vector icon badge and typography.
- Overview of key offline value propositions.
- "Get Started" onboarding action that persists the user's setup.

### 2. Dashboard
- Personalized greeting based on time of day (Morning/Afternoon/Evening).
- Current date and visual circular progress ring (`ProgressRing`).
- 4 Quick Stat Cards: Total Habits, Completed Habits, Remaining Habits, Current Streak.
- Curated offline daily motivational quote (automatically rotating).
- Today's habit checklist with interactive toggle buttons and instant status filters (`All`, `Pending`, `Done`).
- Quick actions to open Achievements, toggle Light/Dark mode, or create a new habit.

### 3. My Habits
- Categorized habit management: **Health**, **Fitness**, **Learning**, **Productivity**, **Personal Growth**, **Lifestyle**.
- Category filter pills and live search bar.
- Add / Edit habit modal:
  - Custom name and optional description/motto.
  - Category selector.
  - Frequency: Everyday, Weekdays, Weekends.
  - Color palette selection (12 aesthetic colors).
  - Icon selection (24 vector icons).
  - Daily offline reminder toggle with quick time presets.
- Delete habit with confirmation.

### 4. Interactive Monthly Calendar
- Month-by-month interactive calendar grid with previous/next month navigation.
- Color-coded daily statuses: Sage Green (all completed), tinted green (partially completed), tinted red (missed past days).
- Select any date to inspect historical habits or backfill forgotten check-ins with automatic streak recalculation.
- "Today" shortcut button to jump directly back to current day.

### 5. Progress & Analytics
- Today's completion rate with progress bar.
- Lifetime metrics: Total check-ins, active streak, longest streak, active habits.
- **Last 7 Days Activity Bar Chart**: Native React Native View-based vertical bar chart displaying daily completion percentages.
- Habit-by-habit breakdown with individual completion counts and streaks.

### 6. Achievements & Badges
- Milestone badges with Bronze, Silver, Gold, and Platinum tiers:
  - **Pioneer**: First habit created.
  - **First Step**: First completion.
  - **Spark**: 3-day streak.
  - **7-Day Champion**: 7-day streak.
  - **14-Day Fortitude**: 14-day streak.
  - **30-Day Master**: 30-day streak.
  - **Perfect Day**: 100% habits completed in a day.
  - **Consistent Mover**: 25 total check-ins.
  - **Century Club**: 100 total check-ins.
  - **Renaissance**: Active habits in 3+ categories.
- Longest streak showcase banner.
- Tap any badge to open detailed status modal showing current vs target progress.

### 7. Profile & Settings
- Editable user profile (name, custom avatar emoji picker, personal goal).
- Instant Light/Dark theme toggle with SQLite persistence.
- Local notification master switch and "Test Local Reminder Now" instant trigger.
- **Export Backup (JSON)**: Saves complete database and completion history to a JSON file and opens native Android share dialog (`expo-sharing`).
- **Import Backup (JSON)**: Restores previously exported backup using native document picker (`expo-document-picker`) with validation and atomic transactions.
- **Reset All Data**: Safe reset modal to wipe history and restore starter habits.

---

## 🏗️ Technical Architecture & Offline Storage

- **SQLite Database**: `habitflow.db`
  - `habits` table: Stores habit configurations, categories, icons, colors, and reminder times.
  - `habit_logs` table: Stores historical daily completions `(habit_id, date, completed, completed_at)`.
  - `settings` table: Key-value store for user profile, theme preference, and notification settings.
- **Local Notifications**: `expo-notifications` configured with Android high-importance channel `habitflow-reminders`. Operates offline with local device alarms (`SchedulableTriggerInputTypes.DAILY`).
- **Zero Network Requirement**: No HTTP/fetch/Axios calls, no cloud authentication, no third-party CDN images. All fonts and icons bundled locally.

---

## 🚀 How to Run Locally in Expo

```bash
# 1. Install dependencies (already resolved and verified)
npx expo install

# 2. Start the development server
npx expo start

# 3. Press 'a' for Android emulator or scan the QR code with Expo Go / Dev Client
```

---

## 📦 How to Build the Standalone Android APK

HabitFlow is pre-configured with `eas.json` to generate an installable standalone `.apk` directly (not an `.aab`).

### Step 1: Install & Authenticate EAS CLI
```bash
# Log in to your free Expo account
npx eas-cli login
```

### Step 2: Configure EAS Project (First time only)
```bash
npx eas-cli project:init
```

### Step 3: Trigger the Android APK Build
Run the following command to build the standalone `.apk` using EAS cloud build:

```bash
npx eas-cli build --platform android --profile preview
```

> **Why `--profile preview`?**  
> In `eas.json`, the `preview` profile has `"buildType": "apk"`. EAS Build will compile the native Android code and output an installable `.apk` file instead of an App Bundle.

### Alternative: Local APK Build (if Android SDK & Java are installed locally)
```bash
npx eas-cli build --platform android --profile preview --local
```

---

## 📲 How to Download & Install the APK on Android

1. Once the EAS build completes, the terminal will print a download link (e.g., `https://expo.dev/artifacts/eas/...apk`) and a QR code.
2. Open the link or scan the QR code on your Android device to download the `.apk`.
3. Open the downloaded file in your device's **Files** or **Downloads** app.
4. If prompted with *"For your security, your phone is not allowed to install unknown apps from this source"*:
   - Tap **Settings**.
   - Toggle **Allow from this source**.
   - Tap **Back** and select **Install**.
5. Tap **Open** to launch **HabitFlow**.
6. Switch your phone into **Airplane Mode** and verify that all screens, habit check-ins, calendar history, analytics, theme toggles, and data export work seamlessly offline!
