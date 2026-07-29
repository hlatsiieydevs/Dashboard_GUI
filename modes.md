# 🔌 ProdBoard Modes & MQTT Integration Manual

This manual explains how to control dashboard **Modes** (*Normal*, *Sleep*, *Grind*) and configure **Pomodoro Focus Timer** parameters via **MQTT** (`home/modes`), HTTP REST APIs, and the **Mobile Remote Control Web UI** (Port `12346`).

---

## 🌟 Dashboard Modes Overview

| Mode | Description | Background Behavior | Primary Focus |
|---|---|---|---|
| **`Normal`** | Default full-featured dashboard grid with customizable tiles. | Dynamic weather background + accent color vignette. | All active widgets (Weather, Calendar, Upcoming, System, etc.) |
| **`Sleep`** | Ultra-clean OLED/AMOLED dark display for night stand / bedtime. | Pitch-black background (`#000000`). | Isolated **Hero Clock** in the center foreground. |
| **`Grind`** | Work & study focus mode with Pomodoro timer. | **Focus**: Plain black (`#000000`).<br>**Short Break**: Light blue gradient.<br>**Long Break**: Lush green gradient. | **Hero Clock** + **Pomodoro Focus Timer** side by side. |

---

## 📡 1. MQTT Integration (`home/modes`)

The dashboard proxy server listens on MQTT broker topic **`home/modes`**. Messages published to this topic trigger real-time UI transitions on all connected dashboard screens in **< 50ms**.

### **Configuration in `.env`**
```env
MQTT_BROKER_URL=mqtt://localhost:1883
MQTT_TOPIC=home/modes
```

---

### **A. String Payload Examples**
Publish a simple string to `home/modes` to activate a mode:

```bash
# Switch to Sleep Mode (AMOLED Pitch Black + Clock)
mosquitto_pub -h localhost -t "home/modes" -m "sleep"

# Switch to Grind Mode (Work / Pomodoro Timer)
mosquitto_pub -h localhost -t "home/modes" -m "grind"

# Switch to Normal Mode (Default Weather Dashboard)
mosquitto_pub -h localhost -t "home/modes" -m "normal"
```

---

### **B. JSON Payload Examples (Mode + Pomodoro Parameters)**
Publish a JSON object to update both mode and Pomodoro durations simultaneously:

#### **Activate Grind Mode with Custom Durations (25m Work / 5m Short / 15m Long)**:
```bash
mosquitto_pub -h localhost -t "home/modes" -m '{
  "mode": "grind",
  "pomodoro": {
    "workDuration": 25,
    "shortBreakDuration": 5,
    "longBreakDuration": 15,
    "longBreakInterval": 4
  }
}'
```

#### **Update Durations Only (Without Changing Mode)**:
```bash
mosquitto_pub -h localhost -t "home/modes" -m '{
  "pomodoro": {
    "workDuration": 50,
    "shortBreakDuration": 10
  }
}'
```

---

### **C. Home Assistant Integration Example**
Add an MQTT action button to your Home Assistant `configuration.yaml`:

```yaml
mqtt:
  button:
    - name: "Dashboard - Sleep Mode"
      command_topic: "home/modes"
      payload_press: "sleep"

    - name: "Dashboard - Grind Mode"
      command_topic: "home/modes"
      payload_press: '{"mode":"grind","pomodoro":{"workDuration":25,"shortBreakDuration":5}}'

    - name: "Dashboard - Normal Mode"
      command_topic: "home/modes"
      payload_press: "normal"
```

---

## 📱 2. Mobile Remote Control Web UI (Port `12346`)

The Mobile Remote Web UI allows you to control modes and parameters from any smartphone, tablet, or secondary browser without opening the main dashboard.

### **Accessing the Control Panel**:
- **Option 1 (Dedicated Port)**: `http://<DASHBOARD_IP>:12346`
- **Option 2 (Sub-route)**: `http://<DASHBOARD_IP>:12345/remote`

### **Mobile Features**:
1. **Mode Cards**: Single-tap buttons to switch between **🌙 Sleep Mode**, **🔥 Grind Mode**, and **🌿 Normal Mode**.
2. **Pomodoro Timer Display & Controls**:
   - Real-time `MM:SS` timer playback.
   - **Start / Pause** button.
   - **Skip Phase** button (advance from Focus to Short Break / Long Break).
   - **Reset** button.
3. **Parameter Form**:
   - Adjust **Work Duration**, **Short Break**, and **Long Break** minutes directly from your phone.

---

## 🌐 3. REST HTTP API Endpoints

You can also trigger mode updates using standard HTTP requests:

### **GET Current Mode State**
```http
GET /api/modes
```
**Response**:
```json
{
  "mode": "grind",
  "pomodoro": {
    "workDuration": 25,
    "shortBreakDuration": 5,
    "longBreakDuration": 15,
    "longBreakInterval": 4,
    "state": "focus",
    "timeRemaining": 1500,
    "completedSessions": 0
  }
}
```

### **POST Update Mode / Parameters**
```http
POST /api/modes
Content-Type: application/json

{
  "mode": "sleep"
}
```
