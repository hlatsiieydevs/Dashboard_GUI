# Dashi_QuickView
## The "Tinted Glass" Experience

### Overview
This project is a high-fidelity, single-screen dashboard. It merges the aesthetics of iOS 18 widgets and macOS status bars while retaining extremely tight performance optimizations suitable for low-power hardware like an Intel Celeron N3350 processor. Every widget on this continuous single-pane is monochromatic, generating its CSS "Accent Color" from a backend-managed environmental weather state. 

### Key Features
* **Dynamic Monochromatic UI:** Generates its CSS "Accent Color" based on backend-managed environmental weather conditions.
* **Multi-Calendar Integration & Filtering:** 
  * Support for adding **multiple calendars** (iCal feeds or Google Calendar IDs).
  * Color-coded event badges for distinct calendar sources (e.g., Work, Personal, Family).
  * Interactive **Calendar Filter Legend** to toggle specific calendars on/off.
  * "Today's Schedule" for immediate events.
  * "In the next few days" widget with a 7-day chronological forecast and custom physics-based auto-scrolling.
  * Native merging of custom calendars seamlessly with **South African Public Holidays**.
* **Resilient Parallel Fetching:** Backend fetches all configured calendar feeds concurrently with individual 6-second timeouts and automatic deduplication.
* **Real-time System Health:** Dynamically polls host OS telemetry to track CPU details and memory load (shifting to "High Load" alert boundaries if utilization exceeds 90%).
* **Optimized Networking:** Automatically resolves common IPv6 Docker fetch timeouts dynamically via IPv4 bindings.

### Architecture & Project Structure
* **Frontend:** React 19 + Tailwind CSS 3.4 (Modular Component Architecture)
  * `src/components/StatusBar.jsx`: Top macOS-style status header with live clock, date, and latency ping.
  * `src/components/HeroClock.jsx`: Large digital hero clock widget.
  * `src/components/CalendarWidget.jsx`: Today's schedule with multi-calendar tags.
  * `src/components/UpcomingWidget.jsx`: Auto-scrolling 7-day forecast widget.
  * `src/components/CalendarFilterLegend.jsx`: Active calendar filter pills.
  * `src/components/WeatherWidgetsCluster.jsx`: Weather telemetry, wind compass, moon phase, and 24-hr forecast marquee.
  * `src/components/SystemHealthWidget.jsx`: CPU model and memory utilization monitor.
  * `src/utils/moonUtils.js`: Astronomical calculations for lunar phases.
* **Backend:** Express.js Proxy Server with `googleapis`, `node-ical`, and `axios`.
* **Docker:** Multi-stage `Dockerfile` and `docker-compose.yml` for isolated deployment.

### Configuration

1. **Environment Variables:**
   A template file `.env.example` is provided at the root containing the layout. Copy it to create your active `.env` file:
   ```bash
   cp .env.example .env
   ```

2. **Multi-Calendar Setup:**
   You can configure multiple iCal feeds or Google Calendar IDs in `.env`.

   **Option A: Multiple iCal Feeds (Public `.ics` URLs)**
   ```env
   CALENDAR_MODE=ical
   
   # Format: Name|URL|#HexColor (comma-separated for multiple calendars)
   CALENDAR_ICAL_URLS=Work|https://example.com/work.ics|#3b82f6, Personal|https://example.com/personal.ics|#10b981
   
   # Legacy single feed also supported:
   # CALENDAR_ICAL_URL=https://example.com/calendar.ics
   ```

   **Option B: Google Calendar Service Account**
   ```env
   CALENDAR_MODE=service_account
   
   # Format: Name|Calendar_ID|#HexColor (comma-separated for multiple calendars)
   CALENDAR_IDS=Work|work@group.calendar.google.com|#3b82f6, Personal|personal@gmail.com|#10b981
   SERVICE_ACCOUNT_PATH=./path/to/service-account.json
   ```

3. **General Environment Config:**
   ```env
   WEATHER_KEY=your_openweather_api_key_here
   PING_TARGET=8.8.8.8
   PORT=3000
   TZ=Africa/Johannesburg
   ```

### Execution & Deployment

**Build & Run with Docker Compose:**
```bash
docker compose up --build -d
```
Once the container is running, navigate to `http://localhost:12345` to view the dashboard!

---

### Documentation
See [CHANGELOG.md](file:///home/hlatsiieydevs/Dashboard_GUI/CHANGELOG.md) for full version history.
