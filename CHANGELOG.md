# Changelog

All notable changes to the **Dashi_QuickView / ProdBoard** project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.2.0] - 2026-07-30

### Added
- **Native Custom 2D Grid Engine**:
  - Replaced legacy rigid column flow with a native 12-column x 12-row blueprint grid system.
  - Added **Auto-Flow ON / OFF (Free Placement)** toggle in the top status bar.
  - Added live mouse pointer cell snapping with viewport boundary clamping.
  - Added glowing placement target indicators (**Green `✅ Clear Space`**, **Amber `🔄 Swap Positions`**).
  - Added full coordinate range badges (**`R1-R3:C1-C3`**) to tile headers in Edit Mode.
- **Collapsible Floating Widget Drawer**:
  - Added a floating catalog drawer fixed at the bottom of the viewport during Edit Mode.
  - Minimizable into a slim tab with a single click.
  - Allows adding and removing any catalog widget (**Hero Clock**, **Calendar Focus**, **Upcoming Events**, **Weather Cluster**, **System Health**, **Blank Spacer**) dynamically.
- **Hero Clock Enhancements**:
  - Added togglable date display in 3-line format:
    - Line 1: `HH:MM`
    - Line 2: `<Day of the week>`
    - Line 3: `<Day No.> <Month of the year> <Year>`
  - Implemented vector SVG width-justification: all three lines stretch to the exact same visual width!
  - Added font family selector (`Sans`, `Mono`, `Serif`, `Display`) and font size scaling in Edit Mode with `localStorage` persistence.
- **Server Logging & HTTPS / SSL Support**:
  - Added file logger in `app/server/logger.js` outputting timestamped logs to `./logs/dashboard-YYYY-MM-DD.log`.
  - Added local HTTPS / SSL certificate loader (`certs/key.pem`, `certs/cert.pem`).

### Changed
- **Modular Widget Architecture**:
  - Reorganized all dashboard widgets into `app/client/src/components/widgets/` with a centralized exporter registry (`index.js`).
  - Set default widget placement sizes to their minimum compact W & H dimensions.
  - Optimized internal paddings and scrollable flex containers (`min-h-0`) across all widgets to prevent text clipping.
  - Removed date display from status bar header for a minimalist aesthetic.

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
  - Backend calendar proxy queries external calendar feeds concurrently using `Promise.allSettled` with individual request timeouts.

---

## [1.0.0] - 2026-07-29

### Added
- Initial release of Dashi_QuickView ("Tinted Glass" single-screen dashboard).
- Weather-reactive CSS accent color engine using OpenWeather API.
- Native Google Calendar & South African Public Holidays iCal integration.
