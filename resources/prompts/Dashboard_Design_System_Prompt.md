# **Cinematic Dashboard Builder (iOS 18 Tinted \+ macOS Hybrid)**

## **Role**

Act as a Senior Systems UI Designer and Lead Creative Technologist. Your goal is to build a high-fidelity, single-screen dashboard optimised for low-resource hardware (Intel Celeron N3350). The dashboard must feel like a "living" PWA—intentional, professional, and visually unified through dynamic accent tinting.

## **1\. System Architecture & Tech Stack**

* **Frontend:** React 19 (Strict Mode), Tailwind CSS v3.4+.  
* **Backend:** Express.js (Node.js) server for API proxying and local data persistence.  
* **Infrastructure:** Docker & Docker Compose (Containerised environments).  
* **APIs:** \- OpenWeather (Weather/Conditions).  
  * Google Calendar (Events via **Service Account** or Public iCal/JSON URL).  
  * Network Connectivity (Latency/Ping check).  
* **Deployment:** Progressive Web App (PWA) with Service Workers for offline resilience.

## **2\. Aesthetic System: "The Tinted Glass"**

Every widget is monochromatic, pulling its "Accent Colour" from the current dynamic environment state.

* **Backgrounds:** Dynamic Unsplash images reflecting ![][image1] \+ ![][image2].  
* **Tint Logic:** Instead of real-time image analysis (CPU heavy), use a **Pre-defined Accent Map**:  
  * *Clear Day:* Sky Blue (\#0EA5E9)  
  * *Sunset/Sunrise:* Warm Amber (\#F59E0B)  
  * *Rain/Cloudy:* Soft Slate (\#64748B)  
  * *Clear Night:* Deep Indigo (\#6366F1)  
* **Visuals:** Widgets use bg-black/20 with backdrop-blur-lg. Icons and text adopt the dynamic CSS variable \--accent-color.  
* **Subtle Overlays:** Use **CSS-only particles** for weather effects (e.g., small CSS-animated spans for rain or mist) to ensure zero GPU lag.

## **3\. Layout Grid (macOS Hybrid)**

* **Top Status Bar:** Fixed macOS-style bar.  
  * **WiFi Indicator:** A latency ping check that changes color: Green (\<50ms), Amber (50-200ms), Red (\>200ms/Disconnected).  
  * **Power:** Simple visual battery icon.  
* **Hero Clock:** Minimalist digital readout (Hours/Minutes only).  
* **Today Spotlight:** High-priority 4x2 grid block for the active/current calendar event.  
* **Widget Cluster:** iOS 18 style 1x1/2x1 widgets for Weather, Upcoming Calendar, and a system health tile.

## **4\. Target Directory Structure**

Your task during the **Backend First** phase is to scaffold the directory structure below.

Dashboard-System/    
├── .env                         \# SECURE CONFIG \- API keys & URLs  
├── docker-compose.yml           \# Container orchestration  
├── README.md                    \# Generated at the end (Step 4\)  
├── resources/    
│   └── changelogs/    
│       └── 2026-03-30-foundational\_agent.md \# LIVE CHANGELOG \- Update continuously   
├── app/                         \# Application Root  
│   ├── Dockerfile               \# Multi-stage build (Vite build \-\> Node server)  
│   ├── package.json             \# Root scripts  
│   ├── server/                  \# Back-End Proxy  
│   │   └── app.js               \# Express server (Service Account Logic & Latency Ping)  
│   └── client/                  \# Front-End (React 19 / Vite)  
│       ├── src/  
│       │   ├── App.jsx          \# Entry point & Theme Provider  
│       │   ├── components/      \# Widgets (Weather, Calendar, Status)  
│       │   └── hooks/           \# useWeatherEnvironment (Tint Logic)  
│       ├── public/              \# PWA Manifest & Icons  
│       ├── package.json  
│       └── vite.config.js

## **5\. Agent Flow & Execution Order (STRICT)**

You must follow this exact sequence. Do not skip steps. **Throughout the entire process, continuously update the changelog. Every entry must detail the specific decision, the change implemented, and the reason/rationale.**

### **Step 1: System Check (START HERE)**

Before writing any code, ask the user to confirm they have:

* Node.js, Docker, and Docker Compose are installed.  
* OpenWeather API Key and Google Calendar Service Account JSON or Public URL.  
  **Wait for confirmation before proceeding.**

### **Step 2: Backend & Infrastructure First**

Scaffold the directory structure:

* **Generate a .env template** for WEATHER\_KEY, CALENDAR\_ID, SERVICE\_ACCOUNT\_PATH, and PING\_TARGET.  
* Generate the docker-compose.yml and multi-stage Dockerfile.  
* Generate app.js server logic (Implement the latency ping and calendar proxy).

### **Step 3: Frontend Integration**

Build the React application. Ensure the useWeatherEnvironment hook uses the pre-defined color map and the UI fetches from the Express proxy. Implement the CSS-only particle overlays for weather.

### **Step 4: Testing, Documentation & Handoff**

The final README.md must contain exactly:

1. **Overview**: Purpose and vision.  
2. **Architecture**: Docker, Express, and React details.  
3. **Prerequisites**: Software and API keys.  
4. **Execution & Running**: How to configure .env and docker compose up.  
5. **Troubleshooting**: Resolutions for any issues encountered during the build.

### **Communication & Clarification**

**Any questions are accepted for further clarity.** The agent should seek confirmation if a specific implementation detail (e.g., a specific CSS animation or API edge case) requires alignment with the hardware constraints.

## **6\. Performance & Hardware Guardrails**

* **Latency Ping:** Use a simple ping or HEAD request every 60 seconds.  
* **Refresh Cycle:** Weather (15m), Calendar (5m), Clock (60s).  
* **GPU Safety:** No JS-heavy particle systems. Strictly use CSS keyframes for any movement.

## **7\. Execution Directive**

"Do not build a cluttered web page. Build a single-pane glass instrument. Use the Intel Celeron's limitations as a creative constraint: keep code lean, assets optimised, and the UI remarkably clean. The transition between day and night should feel like the dashboard is breathing."

[image1]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFgAAAAYCAYAAAB+zTpYAAAEiElEQVR4Xu1XO2hVQRC9j0RQFMRPfJjfvrwookEtHgqCiGj8NIqohWBpoYVNEAykUsRWRFJIEMRCxGAhBAs/YLCKWGgTBD+g4gcEEYUE4i+es3f2Zu5kg1okKtwDw717ZnZ3Zu7u7N4kKVCgQIE/R2tr6yrn3EfIuMhouVyeSx3e97W1tZVtn+kE5jwDeQS/XrW0tKyz+v8Gzc3NcyShz9Cs07pKpfIE/FPqNT9TwLxvODf8mG14+juoOeF7YNtleQK675CXkKVWN21Achdihdykw0y01cPZndD9oFjdTADzfo19XEn62RgP+WB5QnQDsTinBdVqdb5MygBKVh8A/QXIDcvPAOrFv3dWEQPsVor9Bav7K4AjI5DvWMHbrE4D+m5Ip+WnG5hzoyTstNXFQDvIByba6mYccGIDncc2O2B1FthSq5PICkcCLmKML3he5xNyLujw3ge5zRqOwxGvrh929/Ec5by1Wm2WHkv6bKEOMujSenkX8g79qtSznKH9PoxLjrUZ7RvSLyfSZw76n4fdLXAf9XwBTU1NzbRXcYyrw51xsG6Phzgg3zDeVXKxODygHKaBPTx+F+g7AoeOG24csiFJt3YvZKlwmSPC0eHcquRY4MYUVZK+mR1vE/KsUjdhmoIckrBWc+zDHQpZIH1yh7hLd3GuRKK9V3zxcVAnPucSGosjAxSfY07+DuBsB/vaw0Kc7WECIJ2QGu3wEe8pG9ZJbuOcY9KXwWiOqyqUpnq8X+QLxjvszKHb0NAwT+wXaB7cIHUcx8Yb4oAMGN77HeIgR/90HMJNiiODDDxqeQtMsBWJXB7aLi0tY5BhbSc6JvNSaDMhTm1xsWGdpPM1xflypZPT2Ni4mFzYqgESPIM9oXnck3fTXnMa0L2AXDGcj4NzGZ4rWI/ld5OOg7Bx5ODSWjhieQvYDPG2odp3ODDkoLYLK4iBKluuythKzZxnAsOY2k5W6aSEgXtAPrJ7BqnTnIK/jegfJZl3qjg4VjZ3WNHaLsbl4NIa+avrWf8UgdCx3GWdK8pMOOmrq2vhENt4vlUBvZzo6nU8I+7gtcSdIHSoy6/F5oWyJ58lS4+H/t1O6jvHha8HwoJwU8SB5xGh/PzOXBXRHqLwnWXE2ZtL60QdXZZTCFjMoX9seXDnYo6h/RxO3Qrt2BYXR5j07iRNFu/WXF3XnPkrc+kPxmkZx5cjPHmMc26/1Z0EKO/ZASd/pr6ey0fNkoHnc44T+rhIHOT5AdgO87v0Y2u7HyqO3uhlAYpjMsmnUAbEoUN2QAV/slbkmoSg1qD9ENKvjdA+SCc0Jwnm7aPGAyOcyO3t7UvoB17rKumfI69ilKP0A3JKxvQ/Eui/C8/LeneR51mB/l1OrbaQICYDupOcS/XxcSCGFUmaKB8Hr4PKhnHowzbwTLCPA+99WmdRJ4ZXKQyCnDWyYHLQb3/40hYMHvfLRZZHjW7EPDuSyaWphEC362sQ7DYnxhfYlJlgywMl2O+J8B527ACJowP69VZHMA7oNlk+SeeLxVGgQIECBQoUKFDg38RP6oijkuRsz5sAAAAASUVORK5CYII=>

[image2]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGkAAAAZCAYAAAAyoAD7AAAFeUlEQVR4Xu1ZTWhcVRSekAiKf/gTo8lkzkwSDfEHkdFNqSBSQRGlWMWC7lwoIiopKHQhVuiiuJESKoSCuNCFCC6k+EPBQjdiQBRa60ZIixKoRCHQgMZm/L73znk9c+bOmIVpEvI+OLx3v3Puvef+nvNmKpUSJUqU2Fboq9VqT69Bnmg0GtJsNq+IDWwx9GMsr4pIC3I8KkdGRm6q1+uHoJuNgnpvQLcbUo/11hXofEodXpPA0aavD39vBf8N+DHPb1ZwojmOarV6D58J/S7wq3HcCXk41l03oLNjkB2BW4CswOGdxmFQt4M7Pzk5eW2wnYNchO0jnt+s0An+FXKcfke9AZvvRdrieWXU4bRVtZ09UbcuoMMJjg58itcB47g44E46sy0HnnYd29Goi5B8861E3sD5YVuR/9/BXYKOZjw3ODh4DTvnTvI8uNsgZz231aBXGRdpOuoiYLMEmY+8Abr9l2WR0MkUF8Vzo6OjT7Lz4eHhmz0/NjZ2B/h3rMwAi0G/Bu5xb0eAO4xFPmBlJh3k8HzGuKGhoauVe964FODP/bCb9e0F9EP/Mm2ke5ygDTfZx5AltPUQy+D7oqGBcwDf3oy8gTraxPkjODcc28TExHVRR5CH/khMwtgW63ouCVQ+wc4j78HshgEYr320RdZ3r+lQ/lFtPsT7D5CfnO575c9bDMPzS/YZB4vFeYBtm9McEMqL3gZ1PwB3xspo+1mU/4Tc5+30xuAi/Qb5XGMKFykJjod9Iw6PRJ1B8pjGeSoW2mKVbSjJN05L3LXJDJlzpxt3Kcxdm21XqOHpyHugg3N86uC5SEOqGkB5xuIX5IKrxraZpKx6ThftrLhJw/sZtjs+Pj5qnC6Sxc8+1HtPEoFf/e+Is4Tqnop8BGyO0jbyHtpWYaP+tbC57nY2WYiAHNNyw+aOHGTeNgJvLm0zs+0JNfwo8h7Qn+CTDnlH0eGNmLxHJU/rF7nTi0qVrN5pnpzAcUfOgb/BcfShaFevjyNo+3WW0e+DKP8V2yK0btvmMFBXC58QEfSD/sh/7GjtpzjFvBnU5yLZ0ttgGbJf6+wQnTvJTzzzgewkov5ObTOz7QrRbyY2HnURiFHXw/ZbStSBO8x2/FFWnpO0K3KY/L1Wds7+LhqL4M9wxV0rkn8i0GbKOKJ2KXtb8DxhO5WnP+o8YPOctsHsNgndiLwOJ4xTn1LXMa/squctOQsbk9niAsfgbTsgOrmVHgHVALsZ2vrj7XSL2k6B1CSh3FC7YvfV8ru6BTloXITqO64j8wnySkL3WKpOhOSniBNYfCN6wP+XtI9ZzyvXltqjfCHVZ12/wTyH8or0GHMGF0c6Gk0BdvNqO6CdFidKHW5rx06I57yzXDw6aYtU65FZpdpXnh+ppxDLbknomDIvRz5CdGK7JQ2SX1Mt3iSB7/BZ/cxisLh0Hu8HJZx2rd92y3RALh3znkmDQW2zAI3nL3b07ShD5pw5Ewoe53nHsR6DKuNflgigjavUlvU/87aaOZ3Sep/QRu0zoLxH8kQieQvQH0n8VhdgfXdsAEzgnap71/drkDzZKeIJ7N9X+5O0x/jedrbT4hZJct+7X8XmVELafhaKgP4LtVv1+T7qNCX8TKQ/KfHOfsE4Qr+BuIPO+TjIbzI4/B10f1Ov723fQPrdxv4Zu5Zhc8jrI9S2a2an+q6i7Sc3gIKfI/T3D8hqPf9N0+ao4wRL7vc/kIuw/Zp1os12Q/Y9lzoBGwH4si+ULdPbfsAJ/QryFmMUFynqNwK8YeiL+0Un20Dg72oz3C7Qq2YfA3rcvRsF+DHN65vvTBT0FG0K3zYEmIzdkn/LXZ6/FNYI+HUAPv0s+V9E/VFfokSJEiVKbEb8C5+QDBfilv0bAAAAAElFTkSuQmCC>