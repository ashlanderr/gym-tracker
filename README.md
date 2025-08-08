# Gym Tracker

A comprehensive strength and hypertrophy training progress tracker built with React, TypeScript, and real-time collaboration features.

## 🏋️ Features

### Workout Management
- **Create and track workouts** with custom names and timestamps
- **Active workout timer** to monitor session duration
- **Workout completion** with summary statistics
- **Duplicate workouts** to quickly recreate previous training sessions
- **Cancel workouts** with automatic cleanup of all associated data

### Exercise Tracking
- **Comprehensive exercise database** with 17 muscle groups:
  - Abs, Abductors, Adductors, Biceps, Calves, Chest, Forearms
  - Glutes, Hamstrings, Lats, Lower Back, Neck, Quadriceps
  - Shoulders, Traps, Triceps, Upper Back
- **Equipment types**: None, Barbell, Dumbbell, Machine, Plates
- **Exercise history** with detailed performance analytics
- **Exercise replacement** during workouts

### Performance Tracking
- **Set management** with warm-up and working set types
- **Weight and rep tracking** for each set
- **Automatic weight suggestions** based on previous performances
- **Performance reordering** within workouts
- **Set completion status** tracking

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

## 🛠️ Technology Stack

- **Frontend**: React 19, TypeScript, Vite
- **Styling**: SCSS modules
- **State Management**: Yjs for real-time collaboration
- **Authentication**: Firebase Authentication
- **Database**: Yjs with IndexedDB persistence
- **Real-time Sync**: WebSocket server (y-websocket)
- **Charts**: Recharts for data visualization
- **Icons**: React Icons
- **Drag & Drop**: @dnd-kit for performance reordering
- **PWA**: Vite PWA plugin

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

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```env
   VITE_BACKEND_URL=ws://localhost:1234
   ```

4. **Start the development server**
   ```bash
   # For local development
   npm run dev:local
   
   # For production backend
   npm run dev:prod
   ```

5. **Start the WebSocket server** (in a separate terminal)
   ```bash
   npm run y-websocket
   ```

### Building for Production

```bash
npm run build
```

### Running Tests

```bash
npm test
```

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
