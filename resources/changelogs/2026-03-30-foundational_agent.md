# Changelog

## 2026-03-30: Backend & Infrastructure First

**Decision**: Implemented the foundational backend structure and container orchestration.
**Change**: 
*   Created a `.env` template for keys and configuration.
*   Added `docker-compose.yml` and a multi-stage `app/Dockerfile` for React application construction and backend proxying.
*   Generated `app/package.json` for Express deployment.
*   Created `app/server/app.js` serving as the backend wrapper.
**Rationale**: Before doing React builds, we must respect the Intel Celeron constraint. We proxy OpenWeather and the Google Calendar API through an Express Node backend to stop the client's low-power hardware from processing complex fetches, CORS policies, or Auth. We also localized the latency ping into Express so it simply evaluates the response time without impacting frontend React thread performance.
## 2026-03-30: Frontend Integration & Optimization

**Decision**: Replaced generic boilerplate with strict Cinematic UI Glass Components.
**Change**: 
*   Generated `tailwind.config.js` tracking CSS styling definitions along with an `index.css` leveraging advanced keyframes rather than complex JS updates. 
*   Added `useWeatherEnvironment.js` custom React hook.
*   Updated `App.jsx` to parse responsive API endpoints offload tasks.
**Rationale**: Adhering to the Intel Celeron hardware guardrails, offloading styling to CSS prevents UI lag and dropping frames. The hook runs every 15 minutes mapping environmental color configurations locally without blocking the CPU thread.


## 2026-03-30: Calendar Settings Additions

**Decision**: Added multi-mode support for the Calendar Integration (Service Account, Public iCal, or None). 
**Change**: 
*   Added `CALENDAR_MODE` and `CALENDAR_ICAL_URL` environments.
*   Updated Express backend (`app.js`) to parse `node-ical` events if set to `ical`.
*   Handled the empty/disabled state dynamically in the React frontend (`App.jsx`) to hide the widget entirely if `CALENDAR_MODE=none`.
**Rationale**: Providing a public URL option circumvents tedious Google Cloud Console service account setups for users who just have a public generic calendar URL. Permitting an off switch ensures UI cleanliness if calendar tracking isn't required.

## 2026-03-30: Refinements & Geo-Location Support

**Decision**: Replaced gradient background with dynamic Unsplash images, grabbed localized weather info via `navigator.geolocation`, forced local clocks to 24-hour mode, and re-branded layout to ProdBoard v0.1.
**Change**: 
*   Expanded `useWeatherEnvironment.js` to return `weatherData` alongside the parsed Unsplash image URI based on the weather conditions. It now invokes the browser tracking API so `/api/weather` proxies coordinates precisely.
*   Updated `App.jsx` time formatting to `hour12: false`.
*   Mapped UI structure background utilizing absolute z-indexes over standard CSS radial gradients to preserve the visibility over shifting background patterns.
**Rationale**: Adhering to the original cinematic instructions, utilizing full-bleed hardware-accelerated static background URLs with reduced brightness overlays keeps it looking like an expensive, tinted glass pane while adding true geographic customization instead of defaulting out to London coordinates.

## 2026-03-30: Cape Town GPS Fallback

**Decision**: Added a fallback for Cape Town coordinates if geographic tracking fails natively.
**Change**: 
*   Updated `getLocationAndFetch()` within `useWeatherEnvironment.js` to default to `({ latitude: -33.9249, longitude: 18.4241 })`. 
**Rationale**: In scenarios where the hardware block the prompt, or the browser has strict location settings forced denying default tracker queries, it will no longer display the previous `null` London coordinate standard, pointing directly to Cape Town (-33.92, 18.42) instead. 
