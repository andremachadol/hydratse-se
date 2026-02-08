# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Hidrate-Se is a React Native/Expo mobile app for water intake tracking with smart goal calculation based on user weight (35ml/kg formula) and configurable reminder schedules.

## Development Commands

```bash
# Start development server
npx expo start

# Platform-specific
npx expo start --android
npx expo start --ios
npx expo start --web

# Build (EAS)
eas build --platform android --profile preview  # APK for testing
eas build --platform android --profile production
```

## Architecture

### State Management
All app state is centralized in the `useWaterTracker` custom hook (`src/hooks/useWaterTracker.ts`). This hook:
- Manages user config and daily progress
- Persists data to AsyncStorage (`@config` and `@progress` keys)
- Dynamically calculates drink sizes based on remaining goal and time slots
- Handles streak tracking across days

### Data Flow
```
App.tsx → HomeScreen → useWaterTracker (state)
                     ├─ SplashAnimation (loading screen with sound)
                     ├─ ProgressRing (display)
                     ├─ DrinkControls (actions)
                     ├─ SettingsModal (config)
                     └─ HydrationTips (static)
```

### Key Patterns
- **ISO date strings** (`YYYY-MM-DD`) for date comparisons to avoid timezone issues
- **Drink size algorithm**: `dailyGoalMl / (totalMinutes / intervalMinutes)`, rounded to nearest 10ml
- **Streak logic**: Increments on first drink of day if previous day had drinks; decrements on undo/reset only if emptying all today's drinks

### Type Definitions
All TypeScript interfaces are in `src/types/index.ts`:
- `UserConfig`: weight, startTime, endTime, intervalMinutes, dailyGoalMl
- `DayProgress`: consumedMl, drinks[], streak, lastDrinkDate
- `Drink`: id (timestamp), amount, timestamp

### Theme
Colors and tips defined in `src/constants/theme.ts`. Background uses a cyan gradient (`#F0F9FF` → `#D1F0FC` → `#A5E6FD`).

## Key Files

- `src/hooks/useWaterTracker.ts` - Core business logic and state
- `src/screens/HomeScreen.tsx` - Main UI with manual spacing constants (ESPACO_*)
- `src/utils/notifications.js` - Expo notification scheduling (5 hourly reminders)
- `src/components/ProgressRing.tsx` - SVG circular progress using stroke-dashoffset
- `src/components/SplashAnimation.tsx` - Animated splash with water fill, sound (expo-av), and smart duration

## Build Configuration

- Android package: `com.andremachadolsorganization.hidratese`
- EAS project configured in `eas.json` with development, preview (APK), and production profiles
