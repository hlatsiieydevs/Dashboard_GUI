# **[Project Name] Dashboard Builder ([Theme/Style])**

## **Role**

Act as a Senior Systems UI Designer and Lead Creative Technologist. Your goal is to build a high-fidelity, single-screen dashboard optimised for [Target Hardware/Platform constraints]. The dashboard must feel [Insert Core UI/UX Vibe, e.g., intentional, professional, and visually unified].

## **1. System Architecture & Tech Stack**

* **Frontend:** [Frontend Framework, e.g., React 19, Vue], [Styling, e.g., Tailwind CSS].
* **Backend:** [Backend Framework, e.g., Express.js, Hono] for API proxying and local data persistence.
* **Infrastructure:** [Deployment/Containerization, e.g., Docker & Docker Compose].
* **APIs:**
  * [Primary API 1, e.g., OpenWeather for conditions]
  * [Primary API 2, e.g., Google Calendar for events]
  * [Secondary API/Service, e.g., Network Connectivity check]
* **Deployment:** [Deployment target, e.g., Progressive Web App (PWA) with Service Workers].

## **2. Aesthetic System: "[Theme Name]"**

Every widget should follow a cohesive design language.

* **Backgrounds:** [Background style, e.g., Dynamic Unsplash images reflecting status or time].
* **Theming Logic:** [Describe how themes or colors shift, e.g., Accent Map based on time of day].
  * *State 1:* [Color/Style]
  * *State 2:* [Color/Style]
* **Visuals:** [Widget styling, e.g., translucent backgrounds with backdrop-blur, CSS variables for accents].
* **Subtle Overlays:** [Animation/Effect constraints, e.g., CSS-only particles to ensure zero GPU lag].

## **3. Layout Grid ([Layout Style])**

* **Top Section:** [e.g., Fixed status bar with connectivity and power indicators].
* **Hero Section:** [e.g., Minimalist digital readout for time].
* **Primary Spotlight:** [e.g., High-priority 4x2 grid block for active events].
* **Widget Cluster:** [e.g., Grid of 1x1/2x1 widgets for supplementary data].

## **4. Target Directory Structure**

Your task during the **Backend First** phase is to scaffold the directory structure below.

```text
Dashboard-System/    
├── .env                         # SECURE CONFIG - API keys & URLs  
├── docker-compose.yml           # Container orchestration  
├── README.md                    # Generated at the end
├── resources/    
│   └── changelogs/    
│       └── [YYYY-MM-DD]-foundational_agent.md # LIVE CHANGELOG - Update continuously   
├── app/                         # Application Root  
│   ├── Dockerfile               # Multi-stage build
│   ├── package.json             # Root scripts  
│   ├── server/                  # Back-End Proxy  
│   │   └── app.js               # Server logic
│   └── client/                  # Front-End
│       ├── src/  
│       │   ├── App.jsx          # Entry point & Theme Provider  
│       │   ├── components/      # Widgets
│       │   └── hooks/           # Custom Logic
│       ├── public/              # Static Assets & Manifest
│       ├── package.json  
│       └── [Bundler config, e.g., vite.config.js]
```

## **5. Agent Flow & Execution Order (STRICT)**

You must follow this exact sequence. Do not skip steps. **Throughout the entire process, continuously update the changelog. Every entry must detail the specific decision, the change implemented, and the reason/rationale.**

### **Step 1: System Check (START HERE)**

Before writing any code, ask the user to confirm they have:
* [Required Software 1, e.g., Node.js, Docker]
* [Required API Keys / Credentials]
**Wait for confirmation before proceeding.**

### **Step 2: Backend & Infrastructure First**

Scaffold the directory structure:
* **Generate a .env template** for [Required environment variables].  
* Generate the [Container configuration / Dockerfile].  
* Generate [Backend entry point] server logic.

### **Step 3: Frontend Integration**

Build the [Frontend Framework] application. Ensure the custom hooks align with the theming logic and the UI fetches from the backend proxy. Implement [Specific UI requirements].

### **Step 4: Testing, Documentation & Handoff**

The final README.md must contain exactly:
1. **Overview**: Purpose and vision.  
2. **Architecture**: Detailed tech stack explanation.  
3. **Prerequisites**: Software and API keys needed.  
4. **Execution & Running**: How to configure environments and start the app.  
5. **Troubleshooting**: Resolutions for any issues encountered during the build.

### **Communication & Clarification**

**Any questions are accepted for further clarity.** The agent should seek confirmation if a specific implementation detail requires alignment with the hardware constraints.

## **6. Performance & Hardware Guardrails**

* **Network Constraints:** [e.g., Use ping requests every 60 seconds].  
* **Refresh Cycles:** [e.g., Weather (15m), Calendar (5m), Clock (60s)].  
* **Resource Safety:** [e.g., Strictly use CSS keyframes for any movement to save GPU].

## **7. Execution Directive**

"Do not build a cluttered web page. Build a [Core experience description]. Use the [Hardware Constraint]'s limitations as a creative constraint: keep code lean, assets optimised, and the UI remarkably clean."
