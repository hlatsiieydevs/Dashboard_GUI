# Dashi_QuickView
## The "Tinted Glass" Experience

### Overview
This project is a high-fidelity, single-screen dashboard. It merges the aesthetics of iOS 18 widgets and macOS status bars while retaining extremely tight performance optimizations suitable for low-power hardware like an Intel Celeron N3350 processor. Every widget on this continuous single-pane is monochromatic, generating its CSS "Accent Color" from a backend-managed environmental weather state. 

### Key Features
* **Dynamic Monochromatic UI:** Generates its CSS "Accent Color" based on backend-managed environmental weather conditions.
* **Intelligent Calendar Integration:** 
  * "Today's Schedule" for immediate events.
  * "In the next few days" widget with a 7-day chronological forecast and a custom physics-based auto-scrolling animation.
  * Native merging of custom Google Calendar data seamlessly with **South African Public Holidays**.
* **Real-time System Health:** Dynamically polls the host OS via Node.js to display accurate CPU architecture details and actively tracks RAM load (shifting to "High Load" alerts boundaries visually if memory utilization exceeds 90%).
* **Optimized Networking:** Automatically resolves common IPv6 Docker fetch timeouts dynamically via IPv4 bindings.

### Architecture
* **Frontend:** React 19 + Tailwind CSS 3.4
* **Backend:** Express.js Proxy Server
* **Docker:** Multi-stage `Dockerfile` and `docker-compose.yml` to orchestrate isolated environments.

### Configuration

1. **Environment Variables:**
   A template file `.env.example` is provided at the root containing the layout. Copy it to create your active `.env` file!
   ```bash
   cp .env.example .env
   ```
   Then fill in your unique configuration parameters:
   ```env
   # SECURE CONFIG - API keys & URLs
   WEATHER_KEY=your_openweather_api_key_here
   PING_TARGET=8.8.8.8
   PORT=3000
   
   # Calendar Config (Timezone required for accurate "Today" boundary parsing)
   TZ=Africa/Johannesburg
   # CALENDAR_MODE options: 'service_account', 'ical', or 'none'
   CALENDAR_MODE=ical
   CALENDAR_ID=your_google_calendar_id_here
   SERVICE_ACCOUNT_PATH=./path/to/service-account.json
   CALENDAR_ICAL_URL=your_public_ical_url_here
   ```

### Execution & Deployment

**Option A: Precompiled Docker Image (x86_64 Architecture)**
For maximum simplicity on standard Intel/AMD hardware (x86_64), you can utilize a precompiled Docker image `.tar` archive.
1. Load the precompiled image into your host's Docker daemon:
   ```bash
   docker load -i dashboard_gui_x86_64.tar
   ```
2. Start the container stack using Docker Compose:
   ```bash
   docker compose up -d
   ```

**Option B: Build from Source (ARM / Apple Silicon / Custom Tweaks)**
If you are running on ARM architecture (like a Raspberry Pi or Apple M-Series hardware), or if you are making active code modifications, you must build the image locally:
1. Trigger the Docker Compose build from the root directory:
   ```bash
   docker compose up --build -d
   ```
2. Wait for Vite to compile the React client and the Express backend server to launch.

Once the container is actively running, navigate to `http://localhost:12345` to view the dashboard!

### Troubleshooting
* **Missing Calendar Data:** Ensure your Google Calendar feed matches your `.env`. If using `ical`, the calendar must be publicly accessible via the secret `.ics` feed URL.
* **White Screen/No UI:** Check that the React client compiled. Monitor docker output via `docker compose logs -f` to see if Vite failed to build the `dist` folder.
* **Hardware Warning:** If the ambient background particles are glitching on older Intel hardware, confirm your host browser has CSS Hardware Acceleration enabled.
