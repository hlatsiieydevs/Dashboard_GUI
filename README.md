# Cinematic Dashboard Builder
## The "Tinted Glass" Experience

### Overview
This project is a high-fidelity, single-screen dashboard. It merges the aesthetics of iOS 18 widgets and macOS status bars while retaining extremely tight performance optimizations suitable for low-power hardware like an Intel Celeron N3350 processor. Every widget on this continuous single-pane is monochromatic, generating its CSS "Accent Color" from a backend-managed environmental weather state. 

### Architecture
* **Frontend:** React 19 + Tailwind CSS 3.4
* **Backend:** Express.js Proxy Server
* **Docker:** Multi-stage `Dockerfile` and `docker-compose.yml` to orchestrate isolated environments.

### Prerequisites
* Node.js & npm (if running locally without Docker)
* Docker & Docker Compose
* An OpenWeather API Key
* Google Calendar Service Account JSON

### Execution & Running

1. **Configure Environment:**
   Edit the `.env` template file at the root:
   ```env
   WEATHER_KEY=your_openweather_api_key_here
   CALENDAR_ID=your_google_calendar_id_here
   SERVICE_ACCOUNT_PATH=./path/to/service-account.json
   PING_TARGET=8.8.8.8
   ```

2. **Run Containers:**
   Using Docker Compose from the root directory:
   ```bash
   docker compose up --build -d
   ```
   Wait for Vite to build and the node Express server to launch.

3. Navigate to `http://localhost:3000`. 

### Troubleshooting
* **Missing Calendar Data:** Ensure you've shared the specific calendar from your Google account with the Service Account email.
* **White Screen/No UI:** Check that the React client actually compiled its build. You can run `/app/client/npm run build` and let Express map to `dist`.
* **Hardware Warning:** If particles are glitching on older Intel hardware, confirm your browser implies CSS Hardware Acceleration is enabled.

---

Built as per strict Celeron CPU guardrails and Cinematic Systems guidelines.