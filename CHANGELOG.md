# Changelog

All notable changes to the **Dashi_QuickView / ProdBoard** project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.3.0] - 2026-07-30

### Added
- **🔌 MQTT Modes Engine (`home/modes`)**:
  - Subscribes to MQTT broker topic `home/modes` with support for string mode names (`"sleep"`, `"grind"`, `"normal"`) and JSON parameter payloads (`{"mode":"grind","pomodoro":{"workDuration":25}}`).
  - Added Server-Sent Events (SSE) stream `/api/modes/events` to broadcast real-time mode transitions to all client screens in **< 50ms**.
- **🍅 Pomodoro Focus Timer Widget (`PomodoroWidget.jsx`)**:
  - Circular SVG progress ring, phase indicator (*Focus Session*, *Short Break*, *Long Break*), session cycle counter, and Play/Pause/Reset/Skip playback controls.
  - Integrated into central widget catalog.
- **🌙 OLED / AMOLED Sleep Mode**:
  - Pitch-black background (`#000000`) for zero power draw on OLED displays, isolating the **Hero Clock** in the center foreground with ultra-crisp AMOLED time text.
- **🔥 Grind / Work Mode**:
  - Combines **Hero Clock** and **Pomodoro Focus Timer** side-by-side in a unified viewframe.
  - **Dynamic Background Colors**:
    - **Focus Session**: Plain pitch-black (`#000000`) for zero distractions.
    - **Short Break**: Refreshing light blue ambient gradient.
    - **Long Break**: Relaxing lush green ambient gradient.
- **📱 Mobile Remote Control Web UI (Port `12346` & `/remote`)**:
  - Touch-optimized control panel Web UI accessible on port `12346` or `/remote`.
  - Single-tap mode selection cards (*Normal*, *Sleep*, *Grind*), real-time Pomodoro timer controls, and form inputs to adjust work/break durations from any smartphone or tablet.
- **📘 `modes.md` Documentation Manual**:
  - Created complete specification guide for MQTT payloads, CLI examples (`mosquitto_pub`), Home Assistant buttons, REST APIs, and Mobile Remote Web UI guide.

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
- **Hero Clock Enhancements**:
  - Added togglable date display in 3-line format (`HH:MM`, `<Day of the week>`, `<Day No.> <Month> <Year>`).
  - Added font family selector (`Sans`, `Mono`, `Serif`, `Display`) and font size scaling in Edit Mode.

---

## [1.1.0] - 2026-07-29

### Added
- **Multi-Calendar Support**:
  - Support for multiple iCal feeds via `CALENDAR_ICAL_URLS` in `.env`.
  - Support for multiple Google Calendar IDs via `CALENDAR_IDS` in `.env`.
  - Color-coded badges displayed on events in "Today's Schedule" and "In the next few days" widgets.

---

## [1.0.0] - 2026-07-29

### Added
- Initial release of Dashi_QuickView ("Tinted Glass" single-screen dashboard).
