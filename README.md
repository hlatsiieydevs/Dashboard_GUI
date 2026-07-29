# ProdBoard Dashboard (Dashi_QuickView)
## The "Tinted Glass" Experience

### Overview
ProdBoard is a high-fidelity, single-screen interactive dashboard. It merges the aesthetics of iOS 18 widgets and macOS status bars while retaining tight performance optimizations suitable for low-power hardware like an Intel Celeron N3350 processor. Every widget on this continuous single-pane is monochromatic, generating its CSS "Accent Color" from a backend-managed environmental weather state. 

---

### Key Features
* **Native Custom 2D Grid Layout Engine:**
  * Free placement & snapping across a 12-column x 12-row blueprint matrix (`Auto-Flow: OFF`).
  * Live mouse pointer cell snapping with viewport boundary clamping.
  * Glowing placement target indicators (**Green `✅ Clear Space`**, **Amber `🔄 Swap Positions`**).
  * Full span coordinate badges on tile headers (**`R1-R3:C1-C3`**).
  * W & H resize controls with compact minimum placement dimensions.
* **Collapsible Floating Widget Drawer:**
  * Minimizable floating widget catalog at the bottom of the viewport in Edit Mode.
  * Dynamically add or remove catalog widgets (**Hero Clock**, **Calendar Focus**, **Upcoming Events**, **Weather Cluster**, **System Health**, **Blank Spacer**).
* **Hero Clock & Width-Justified Typography:**
  * Togglable 3-line date format (`HH:MM`, `<Day of the Week>`, `<DD Month CCYY>`).
  * Vector SVG width-justified typography where all three lines stretch to the exact same visual width!
  * Font style selector (`Sans`, `Mono`, `Serif`, `Display`) and size scale controls in Edit Mode.
* **Dynamic Monochromatic UI:** Generates its CSS "Accent Color" based on backend-managed environmental weather conditions.
* **Multi-Calendar Integration & Filtering:** 
  * Support for adding **multiple calendars** (iCal feeds or Google Calendar IDs).
  * Color-coded event badges for distinct calendar sources (e.g., Work, Personal, Family).
  * Interactive **Calendar Filter Legend** to toggle specific calendars on/off.
  * "Today's Schedule" for immediate events.
  * "In the next few days" widget with a 7-day chronological forecast and custom physics-based auto-scrolling.
  * Native merging of custom calendars seamlessly with **South African Public Holidays**.
* **HTTPS / SSL & Modular Logger:** Local SSL certificate loader and timestamped server module logger (`./logs`).

---

### Architecture & Project Structure
* **Frontend:** React 19 + Tailwind CSS 3.4
  * `src/components/StatusBar.jsx`: Top status header bar with latency ping and layout controls.
  * `src/components/grid/DashboardGrid.jsx`: 2D Blueprint grid matrix with live target placement outlines.
  * `src/components/grid/DashboardTile.jsx`: Tile wrapper with span controls and coordinate badges.
  * `src/components/grid/WidgetDrawer.jsx`: Minimizable floating widget catalog drawer.
  * `src/components/widgets/index.js`: Centralized exporter registry for all dashboard widgets.
  * `src/components/widgets/HeroClock.jsx`: Hero clock widget with width-justified date typography.
  * `src/components/widgets/CalendarWidget.jsx`: Today's schedule with multi-calendar tags.
  * `src/components/widgets/UpcomingWidget.jsx`: Auto-scrolling 7-day forecast widget.
  * `src/components/widgets/CalendarFilterLegend.jsx`: Active calendar filter pills.
  * `src/components/widgets/WeatherWidgetsCluster.jsx`: Weather telemetry, wind compass, moon phase, and 24-hr forecast marquee.
  * `src/components/widgets/SystemHealthWidget.jsx`: CPU model and memory utilization monitor.
  * `src/hooks/useTileLayout.js`: Layout engine managing state, collisions, and `localStorage`.
* **Backend:** Express.js Proxy Server with `googleapis`, `node-ical`, and `axios`.
* **Docker:** Multi-stage `Dockerfile` and `docker-compose.yml` for isolated deployment.

---

### Execution & Deployment

**Build & Run with Docker Compose:**
```bash
docker compose up --build -d
```
Once the container is running, navigate to `https://localhost:12345` (or `http://localhost:12345`) to view the dashboard!

---

### Documentation
See [CHANGELOG.md](file:///home/hlatsiieyhax/DevBlock/personal_projects/Dashboard_GUI/CHANGELOG.md) for full version history.
