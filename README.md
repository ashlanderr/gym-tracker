# Gym Tracker

A comprehensive strength and hypertrophy training progress tracker built with React, TypeScript, and real-time collaboration features.

## 🏋️ Features

### Workout Management
- **Create and track workouts** with custom names and timestamps
- **Active workout timer** to monitor session duration
- **Workout completion** with summary statistics
- **Duplicate workouts** to quickly recreate previous training sessions
- **Cancel workouts** with automatic cleanup of all associated data
- **Workout periodization modes** (Light, Medium, Heavy) for systematic training progression

### Exercise Tracking
- **Comprehensive exercise database** with 17 muscle groups:
  - Abs, Abductors, Adductors, Biceps, Calves, Chest, Forearms
  - Glutes, Hamstrings, Lats, Lower Back, Neck, Quadriceps
  - Shoulders, Traps, Triceps, Upper Back
- **Equipment types**: None, Barbell, Dumbbell, Machine, Plates
- **Exercise history** with detailed performance analytics
- **Exercise replacement** during workouts
- **Custom exercise creation** with muscle group targeting and equipment specifications
- **Exercise weight types**: Full weight, Self-weight percentages, and bodyweight exercises

### Performance Tracking
- **Set management** with warm-up and working set types
- **Weight and rep tracking** for each set
- **Automatic weight suggestions** based on previous performances
- **Performance reordering** within workouts using drag & drop
- **Set completion status** tracking
- **Rest timer management** with customizable intervals
- **Active rest timer** with countdown display and manual adjustment

### Progress Analytics
- **Personal records tracking**:
  - One-rep max records
  - Weight records
  - Volume records
- **Exercise history charts** with multiple parameters:
  - One-rep max progression
  - Weight progression
  - Volume progression
- **Visual progress tracking** with line charts
- **Historical performance comparison**

### Advanced Training Features
- **Periodization system** with automatic mode cycling (Light → Medium → Heavy)
- **Intelligent weight recommendations** based on periodization mode:
  - Light: 10-12 reps at 65% 1RM
  - Medium: 6-8 reps at 75% 1RM  
  - Heavy: 4-6 reps at 85% 1RM
- **Warm-up set calculations** with progressive weight increases
- **Weight progression algorithms** for consistent strength gains

### Weights Management
- **Equipment-specific weight configurations**:
  - **Barbell**: Customizable bar weight and available plates
  - **Dumbbell**: Step-based weight increments
  - **Machine**: Stack-based weight systems with multiple blocks
  - **Plates**: Custom plate selection for plate-loaded equipment
- **Automatic weight snapping** to available increments
- **Visual weight representation** showing exact plate/weight combinations
- **Unit conversion** between kg and lbs
- **Self-weight calculations** for bodyweight exercises

### Real-time Collaboration
- **Multi-device synchronization** using Yjs and WebSocket
- **Offline support** with IndexedDB persistence
- **Real-time connection status** indicators
- **Automatic data synchronization** when connection is restored

### User Experience
- **Progressive Web App (PWA)** with offline capabilities
- **Responsive design** optimized for mobile devices
- **Google authentication** for secure user accounts
- **Anonymous sign-in** option for quick access
- **Modern UI** with intuitive navigation and interactions
- **Bottom sheet modals** for mobile-optimized interactions
- **Drag & drop interface** for workout organization
- **Connection status indicators** for real-time sync feedback

## 🛠️ Technology Stack

- **Frontend**: React 19, TypeScript, Vite
- **Styling**: SCSS modules
- **State Management**: Yjs for real-time collaboration, Jotai for local state
- **Authentication**: Firebase Authentication
- **Database**: Yjs with IndexedDB persistence
- **Real-time Sync**: WebSocket server (y-websocket)
- **Charts**: Recharts for data visualization
- **Icons**: React Icons
- **Drag & Drop**: @dnd-kit for performance reordering
- **PWA**: Vite PWA plugin
- **Testing**: Vitest for unit testing
- **Code Quality**: ESLint, Prettier
- **Build Tools**: Vite with PWA assets generation

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd gym-tracker
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Start the WebSocket server** (in a separate terminal)
   ```bash
   npm run y-websocket
   ```

5. **Set WebSocket URL in user settings**
   ```
   ws://localhost:1234
   ```

### Building for Production

```bash
npm run build
```

### Building the Android App

Requires a JDK and the Android SDK. Gradle finds the SDK through
`android/local.properties`, which holds a `sdk.dir` path for this machine and is
not committed — Android Studio writes it on first open, or create it by hand:

```
sdk.dir=C:/Android/Sdk
```

Then build. Both commands rebuild the web bundle, sync it into the native
project, and run Gradle; the APK path is printed at the end.

```bash
npm run apk
```

```bash
npm run apk:release
```

The debug APK lands in `android/app/build/outputs/apk/debug/app-debug.apk`. To
build and launch on a connected device or emulator instead, use `npm run
android`.

### Running Tests

```bash
npm test
```

### Adding an Exercise

The catalog lives in `src/client/db/exercises/catalog/`, one entry per
equipment variation, declared in groups of variations of one movement.

Exercises are illustrated by a pair of frames the app cross-fades between: the
start and the end of the movement. The masters live in `media/`, and
`media/README.md` covers the loop — where each kind of artwork comes from,
building the bundled images, and pointing an exercise at them.

To read the catalog through rather than one exercise at a time, a dev build
serves it at `/#/exercises`, one exercise per screen with back and forward
buttons. It has no entry point in the UI and is not in the production bundle.

### Regenerating Icons

`pwa-assets/logo.png` is the single source for the app's branding. After
changing it, regenerate both sets of icons:

```bash
npm run generate-pwa-assets
npm run generate-app-assets
```

The first writes the web icons into `public/`; the second derives the Android
launcher icons and splash screens into `android/app/src/main/res/`.

## 📱 Usage

### Starting a Workout
1. Sign in with Google or anonymously
2. Click "Start New Workout" on the home screen
3. Add exercises to your workout
4. Track sets, weights, and reps for each exercise
5. Complete the workout when finished

### Tracking Progress
- View exercise history by tapping the chart icon on any exercise
- Monitor personal records that are automatically tracked
- Analyze progress trends with interactive charts
- Compare current performance with previous workouts

### Managing Data
- Duplicate successful workouts for consistent training
- Cancel workouts if needed (all data will be cleaned up)
- View workout statistics including total volume and sets
- Access exercise history and performance analytics

## 🔧 Development

### Project Structure
```
src/
├── components/          # Reusable UI components
├── db/                 # Database operations and data models
├── firebase/           # Firebase configuration and auth
├── pages/              # Main application pages
│   ├── Home/          # Workout overview and management
│   ├── SignIn/        # Authentication page
│   └── Workout/       # Active workout interface
└── main.tsx           # Application entry point
```

### Key Data Models
- **Workout**: Training sessions with metadata
- **Exercise**: Exercise definitions with muscle groups and equipment
- **Performance**: Exercise instances within workouts
- **Set**: Individual sets with weight, reps, and completion status
- **Record**: Personal records and achievements

### Real-time Features
The app uses Yjs for real-time collaboration:
- Shared data (exercises) syncs across all users
- Personal data (workouts, performances, sets) syncs per user
- Offline support with automatic sync when connection is restored
- Connection status indicators for user feedback
