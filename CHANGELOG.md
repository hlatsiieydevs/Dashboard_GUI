# Changelog

All notable changes to the **Dashi_QuickView** project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.1.0] - 2026-07-29

### Added
- **Multi-Calendar Support**:
  - Support for multiple iCal feeds via `CALENDAR_ICAL_URLS` in `.env`.
  - Support for multiple Google Calendar IDs via `CALENDAR_IDS` in `.env`.
  - Custom calendar labeling and color formatting syntax (`Name|URL_or_ID|#Color`).
  - Color-coded badges displayed on events in "Today's Schedule" and "In the next few days" widgets.
  - Interactive `CalendarFilterLegend` widget allowing users to toggle individual calendar sources on/off.
- **Resilient Parallel Fetching**:
  - Backend calendar proxy now queries external calendar feeds concurrently using `Promise.allSettled` with individual request timeouts (6s). Offline or broken calendar links will no longer break the dashboard.
  - Automatic event deduplication across multiple merged calendar sources.

### Changed
- **Frontend Architecture & Modularization**:
  - Refactored monolithic `App.jsx` (640+ lines) into clean, maintainable React components under `app/client/src/components/`:
    - `StatusBar.jsx`: Header bar displaying system version, live clock, current date, and latency ping.
    - `HeroClock.jsx`: Main digital hero clock component.
    - `CalendarWidget.jsx`: Today's schedule with color-coded event source tags.
    - `UpcomingWidget.jsx`: 7-day chronological forecast list with physics-based auto-scroll and holiday indicators.
    - `CalendarFilterLegend.jsx`: Interactive filter pills for toggling active calendar visibility.
    - `WeatherWidgetsCluster.jsx`: Grouping temperature gauge, precipitation bar, wind compass, moon phase, and 24-hour forecast marquee.
    - `SystemHealthWidget.jsx`: Real-time system load and memory utilization tracker.
  - Extracted moon phase astronomical calculations into `src/utils/moonUtils.js`.

### Removed
- Cleaned up legacy temporary patch files (`patch_file.diff`, `patch_ui_tweaks.diff`, `patch_widget.diff`, `patch_widget2.diff`, `update_app.patch`, `App.jsx.orig`, `App.jsx.rej`).

---

## [1.0.0] - 2026-07-29

### Added
- Initial release of Dashi_QuickView ("Tinted Glass" single-screen dashboard).
- Weather-reactive CSS accent color engine using OpenWeather API.
- Native Google Calendar & South African Public Holidays iCal integration.
- Hardware-optimized physics scrolling animations and low-overhead widgets.
