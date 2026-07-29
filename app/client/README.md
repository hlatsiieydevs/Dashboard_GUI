# Dashi_QuickView - React Client Frontend

This directory contains the React 19 + Tailwind CSS frontend for **Dashi_QuickView**.

## Project Architecture

The frontend is structured into clean, single-responsibility React components:

```
app/client/src/
├── App.jsx                       # Main orchestrator component
├── index.css                     # Design system tokens and global CSS animations
├── main.jsx                      # Vite entry point
├── components/
│   ├── StatusBar.jsx             # macOS-style status bar (clock, date, latency ping)
│   ├── HeroClock.jsx             # Large central digital clock
│   ├── CalendarWidget.jsx        # "Today's Schedule" widget with calendar badges
│   ├── UpcomingWidget.jsx        # 7-day chronological forecast widget with auto-scroll
│   ├── CalendarFilterLegend.jsx # Interactive filter pills for active calendar sources
│   ├── WeatherWidgetsCluster.jsx # Weather gauge, wind compass, moon phase, 24h forecast
│   └── SystemHealthWidget.jsx    # System load and memory utilization tracker
├── hooks/
│   └── useWeatherEnvironment.js  # Dynamic weather theme & background color engine
└── utils/
    └── moonUtils.js              # Lunar phase astronomical calculations
```

## Development & Build Commands

- **Start Dev Server**:
  ```bash
  npm run dev
  ```

- **Build Production Bundle**:
  ```bash
  npm run build
  ```
