require('dotenv').config({ path: '../.env' }); // Load from root in dev, or local in docker
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const path = require('path');
const ping = require('ping');
const { google } = require('googleapis');
const ical = require('node-ical');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Serve static React files (if they exist from multi-stage build)
try {
    app.use(express.static(path.join(__dirname, '../client/dist')));
} catch (e) {
    console.log("Client dist not found, ensure React is built.");
}

// ========================
// API Routes
// ========================

// 1. Latency Ping (Ping Target every request to proxy)
app.get('/api/network/ping', async (req, res) => {
    const target = process.env.PING_TARGET || '8.8.8.8';
    try {
        const resPing = await ping.promise.probe(target, { timeout: 3 });
        // Calculate status category for the Frontend: Green (<50), Amber (50-200), Red (>200 or err)
        let status = 'Red';
        if (resPing.alive) {
            if (resPing.time < 50) status = 'Green';
            else if (resPing.time <= 200) status = 'Amber';
        }
        res.json({
            alive: resPing.alive,
            time: resPing.time,
            target: resPing.host,
            status: status
        });
    } catch (error) {
        res.status(500).json({ error: 'Ping failed', status: 'Red' });
    }
});

// 2. Weather Proxy (OpenWeather API - Current & Forecast)
app.get('/api/weather', async (req, res) => {
    try {
        const { lat = '-33.9249', lon = '18.4241' } = req.query; // Default: Cape Town
        const apiKey = process.env.WEATHER_KEY;
        
        if (!apiKey || apiKey === 'your_openweather_api_key_here') {
            return res.status(400).json({ error: "No WEATHER_KEY specified in .env" });
        }

        // Parallel fetch current and forecast
        const [currentRes, forecastRes] = await Promise.all([
            axios.get(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`),
            axios.get(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`)
        ]);
        
        res.json({ current: currentRes.data, forecast: forecastRes.data });
    } catch (error) {
        console.error('Weather API Error:', error.message);
        res.status(500).json({ error: 'Failed to fetch weather data' });
    }
});

// 3. Google Calendar Proxy (Support for SA, iCal, or None)
app.get('/api/calendar/today', async (req, res) => {
    try {
        const mode = process.env.CALENDAR_MODE || 'service_account';

        if (mode === 'none') {
            return res.json({ disabled: true, items: [] });
        }

        const now = new Date();
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

        // --- iCAL URL MODE ---
        if (mode === 'ical') {
            const url = process.env.CALENDAR_ICAL_URL;
            if (!url || url === 'your_public_ical_url_here') {
                return res.status(400).json({ error: "Missing CALENDAR_ICAL_URL in .env" });
            }

            const events = await ical.async.fromURL(url);
            let todayEvents = [];

            for (const k in events) {
                if (events.hasOwnProperty(k)) {
                    const ev = events[k];
                    if (ev.type === 'VEVENT') {
                        // Check if event starts today
                        const startDate = new Date(ev.start);
                        if (startDate >= startOfDay && startDate <= endOfDay) {
                            todayEvents.push({
                                summary: ev.summary,
                                start: { dateTime: startDate.toISOString() }
                            });
                        }
                    }
                }
            }
            
            // Sort by start time and limit to 5
            todayEvents.sort((a,b) => new Date(a.start.dateTime) - new Date(b.start.dateTime));
            return res.json({ items: todayEvents.slice(0, 5) });
        }

        // --- SERVICE ACCOUNT MODE ---
        const calendarId = process.env.CALENDAR_ID;
        const keyPath = process.env.SERVICE_ACCOUNT_PATH;

        if (!calendarId || calendarId === 'your_google_calendar_id_here') {
             return res.status(400).json({ error: "Missing CALENDAR_ID in .env" });
        }

        // Initialize Google Auth client
        const auth = new google.auth.GoogleAuth({
            keyFile: keyPath,
            scopes: ['https://www.googleapis.com/auth/calendar.readonly'],
        });

        const calendar = google.calendar({ version: 'v3', auth });

        const response = await calendar.events.list({
            calendarId: calendarId,
            timeMin: startOfDay.toISOString(),
            timeMax: endOfDay.toISOString(),
            maxResults: 5,
            singleEvents: true,
            orderBy: 'startTime',
        });

        return res.json({ items: response.data.items || [] });
    } catch (error) {
        console.error('Calendar API Error:', error.message);
        if (error.message.includes('404')) {
             console.error('Hint: A 404 indicates the Calendar URL is incorrect or the calendar is not set to "Public" in Google Calendar settings.');
        }
        res.status(500).json({ error: 'Failed to fetch calendar data. Please verify the URL and ensure the calendar is public.' });
    }
});

// React Router Fallback
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});
