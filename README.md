# ProdBoard Dashboard (Dashi_QuickView)
## The "Tinted Glass" Experience

### Overview
ProdBoard is a high-fidelity, single-screen interactive dashboard. It merges the aesthetics of iOS 18 widgets and macOS status bars while retaining tight performance optimizations suitable for low-power hardware like an Intel Celeron N3350 processor. Every widget on this continuous single-pane is monochromatic, generating its CSS "Accent Color" from a backend-managed environmental weather state. 

---

### Key Features
* **🔌 MQTT Modes Engine (`home/modes`):**
  * Subscribes to MQTT broker topic `home/modes` with support for string payload modes (`"sleep"`, `"grind"`, `"normal"`) or JSON parameter allocations.
  * Server-Sent Events (SSE) stream `/api/modes/events` pushes real-time mode transitions to all connected screens in **< 50ms**.
* **🌙 AMOLED Sleep Mode:**
  * Pitch-black background (`#000000`) for zero power consumption on OLED screens, isolating the **Hero Clock** in the center foreground.
* **🔥 Grind / Work Mode & Pomodoro Timer:**
  * Displays **Hero Clock** and **Pomodoro Focus Timer** side by side.
  * **Dynamic Ambient Background Colors**:
    * **Focus Session**: Plain black (`#000000`) for zero distractions.
    * **Short Break**: Refreshing light blue ambient gradient.
    * **Long Break**: Relaxing green ambient gradient.
* **📱 Mobile Remote Control Web UI (Port `12346` & `/remote`):**
  * Touch-optimized control panel UI accessible on port `12346` or `/remote`.
  * Allows switching modes, toggling Pomodoro playback (Play, Pause, Reset, Skip), and adjusting work/break durations from any smartphone or tablet.
* **Native Custom 2D Grid Layout Engine:**
  * Free placement & snapping across a 12-column x 12-row blueprint matrix (`Auto-Flow: OFF`).
  * Live mouse pointer cell snapping with viewport boundary clamping.
  * Glowing placement target indicators (**Green `✅ Clear Space`**, **Amber `🔄 Swap Positions`**).
  * Full span coordinate badges on tile headers (**`R1-R3:C1-C3`**).
* **Collapsible Floating Widget Drawer:**
  * Minimizable floating widget catalog at the bottom of the viewport in Edit Mode.
  * Dynamically add or remove catalog widgets (**Hero Clock**, **Pomodoro Timer**, **Calendar Focus**, **Upcoming Events**, **Weather Cluster**, **System Health**, **Blank Spacer**).
* **Hero Clock & Width-Justified Typography:**
  * Togglable 3-line date format (`HH:MM`, `<Day of the Week>`, `<DD Month CCYY>`).
  * Font style selector (`Sans`, `Mono`, `Serif`, `Display`) and size scale controls in Edit Mode.

---

### Architecture & Project Structure
* **Frontend:** React 19 + Tailwind CSS 3.4
  * `src/components/StatusBar.jsx`: Top status header bar.
  * `src/components/grid/DashboardGrid.jsx`: 2D Blueprint grid matrix.
  * `src/components/grid/DashboardTile.jsx`: Tile wrapper with span controls.
  * `src/components/grid/WidgetDrawer.jsx`: Minimizable floating widget catalog.
  * `src/components/widgets/PomodoroWidget.jsx`: Circular Pomodoro focus timer widget.
  * `src/components/widgets/HeroClock.jsx`: Hero clock widget with width-justified date.
  * `src/components/remote/MobileRemoteUI.jsx`: Touch-optimized mobile remote control panel.
  * `src/hooks/useDashboardModes.js`: Mode state machine and real-time SSE stream subscriber.
  * `src/hooks/useTileLayout.js`: Layout engine managing state and `localStorage`.
* **Backend:** Express.js Proxy Server with `mqtt` client, SSE stream, `googleapis`, `node-ical`, and `axios`.
* **Docker:** Exposes port `12345` (Main Dashboard) and port `12346` (Mobile Remote Control UI).

---

### Execution & Deployment

**Build & Run with Docker Compose:**
```bash
docker compose up --build -d
```
- **Main Dashboard**: Navigate to `https://localhost:12345` (or `http://localhost:12345`)
- **Mobile Remote Control UI**: Navigate to `http://localhost:12346` (or `http://<local-ip>:12346` on smartphone)

---

### Manuals & Documentation
- **[modes.md](file:///home/hlatsiieyhax/DevBlock/personal_projects/Dashboard_GUI/modes.md)**: Full manual for MQTT topics, JSON schemas, Home Assistant buttons, and Mobile Remote UI guide.
- **[CHANGELOG.md](file:///home/hlatsiieyhax/DevBlock/personal_projects/Dashboard_GUI/CHANGELOG.md)**: Version release history.
