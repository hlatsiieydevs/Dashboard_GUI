require('dotenv').config({ path: '../.env' }); // Load from root in dev, or local in docker
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const path = require('path');
const ping = require('ping');
const { google } = require('googleapis');
const ical = require('node-ical');
const dns = require('dns');
const os = require('os');
dns.setDefaultResultOrder('ipv4first');

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

// 2.5 Unsplash Proxy (Dynamic Weather Backgrounds)
app.get('/api/background', async (req, res) => {
    try {
        const query = req.query.query || 'nature,sky';
        const apiKey = process.env.UNSPLASH_KEY;
        
        if (!apiKey || apiKey === 'your_unsplash_api_key_here') {
            return res.status(400).json({ error: "No UNSPLASH_KEY specified in .env" });
        }

        const unsplashRes = await axios.get(`https://api.unsplash.com/photos/random?query=${encodeURIComponent(query)}&client_id=${apiKey}&orientation=landscape`);
        
        res.json({
            image: unsplashRes.data.urls.regular, // Standard 1080p width
            color: unsplashRes.data.color // Hex dominant color (#AABBCC)
        });
    } catch (error) {
        console.error('Unsplash API Error:', error.message);
        res.status(500).json({ error: 'Failed to fetch background image' });
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

            // Using axios because native fetch in Node 18+ (which node-ical's fromURL uses internally)
            // fails trying to use IPv6 in some docker configurations.
            const response = await axios.get(url, { responseType: 'text' });
            const events = await ical.async.parseICS(response.data);
            let todayEvents = [];

            for (const k in events) {
                if (events.hasOwnProperty(k)) {
                    const ev = events[k];
                    if (ev.type === 'VEVENT') {
                        // Check if event starts today
                        const startDate = new Date(ev.start);
                        const endDate = ev.end ? new Date(ev.end) : startDate;
                        if (startDate >= startOfDay && startDate <= endOfDay) {
                            todayEvents.push({
                                summary: ev.summary,
                                start: { dateTime: startDate.toISOString() },
                                end: { dateTime: endDate.toISOString() }
                            });
                        }
                    }
                }
            }
            
            // Sort by start time and limit to 5
            todayEvents.sort((a,b) => new Date(a.start.dateTime) - new Date(b.start.dateTime));
            return res.json({ items: todayEvents });
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
            maxResults: 100,
            singleEvents: true,
            orderBy: 'startTime',
        });

        return res.json({ items: response.data.items || [] });
    } catch (error) {
        console.error('Calendar API Error:', error.stack || error.message);
        if (error.message && error.message.includes('404')) {
             console.error('Hint: A 404 indicates the Calendar URL is incorrect or the calendar is not set to "Public" in Google Calendar settings.');
        }
        res.status(500).json({ error: 'Failed to fetch calendar data. Please verify the URL and ensure the calendar is public.' });
    }
});

// 4. Google Calendar Proxy - Upcoming 7 Days (Includes SA Public Holidays)
app.get('/api/calendar/upcoming', async (req, res) => {
    try {
        const mode = process.env.CALENDAR_MODE || 'service_account';

        if (mode === 'none') {
            return res.json({ disabled: true, items: [] });
        }

        const now = new Date();
        const startOfTomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
        const endOfPeriod = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 7, 23, 59, 59);

        let upcomingEvents = [];

        // 1. Fetch SA Public Holidays
        try {
            const holidayUrl = 'https://calendar.google.com/calendar/ical/en.sa%23holiday%40group.v.calendar.google.com/public/basic.ics';
            const holidayRes = await axios.get(holidayUrl, { responseType: 'text' });
            const holidayEvents = await ical.async.parseICS(holidayRes.data);
            
            for (const k in holidayEvents) {
                if (holidayEvents[k].type === 'VEVENT') {
                    const ev = holidayEvents[k];
                    const startDate = new Date(ev.start);
                    // Include holidays from tomorrow up to endOfPeriod
                    if (startDate >= startOfTomorrow && startDate <= endOfPeriod) {
                        upcomingEvents.push({
                            summary: ev.summary,
                            start: { date: startDate.toISOString().split('T')[0] }, // Emulate full-day format
                            isHoliday: true
                        });
                    }
                }
            }
        } catch (err) {
            console.error('Failed to fetch SA Holidays:', err.message);
        }

        // --- iCAL URL MODE ---
        if (mode === 'ical') {
            const url = process.env.CALENDAR_ICAL_URL;
            if (url && url !== 'your_public_ical_url_here') {
                const response = await axios.get(url, { responseType: 'text' });
                const events = await ical.async.parseICS(response.data);

                for (const k in events) {
                    if (events.hasOwnProperty(k)) {
                        const ev = events[k];
                        if (ev.type === 'VEVENT') {
                            const startDate = new Date(ev.start);
                            const endDate = ev.end ? new Date(ev.end) : startDate;
                            const isDateOnly = ev.start.dateOnly;
                            // Only include events starting from tomorrow up to the 7-day period
                            if (startDate >= startOfTomorrow && startDate <= endOfPeriod) {
                                upcomingEvents.push({
                                    summary: ev.summary,
                                    start: isDateOnly ? { date: startDate.toISOString().split('T')[0] } : { dateTime: startDate.toISOString() },
                                    end: isDateOnly ? { date: endDate.toISOString().split('T')[0] } : { dateTime: endDate.toISOString() }
                                });
                            }
                        }
                    }
                }
            }
        } else {
             // --- SERVICE ACCOUNT MODE ---
             const calendarId = process.env.CALENDAR_ID;
             const keyPath = process.env.SERVICE_ACCOUNT_PATH;
             if (calendarId && calendarId !== 'your_google_calendar_id_here') {
                 const auth = new google.auth.GoogleAuth({
                     keyFile: keyPath,
                     scopes: ['https://www.googleapis.com/auth/calendar.readonly'],
                 });
         
                 const calendar = google.calendar({ version: 'v3', auth });
                 const response = await calendar.events.list({
                     calendarId: calendarId,
                     timeMin: startOfTomorrow.toISOString(),
                     timeMax: endOfPeriod.toISOString(),
                     maxResults: 100,
                     singleEvents: true,
                     orderBy: 'startTime',
                 });
                 if (response.data.items) {
                    upcomingEvents = upcomingEvents.concat(response.data.items);
                 }
             }
        }

        // Sort by start time chronologically
        upcomingEvents.sort((a,b) => {
            const dateA = new Date(a.start?.dateTime || a.start?.date);
            const dateB = new Date(b.start?.dateTime || b.start?.date);
            return dateA - dateB;
        });

        return res.json({ items: upcomingEvents });

    } catch (error) {
        console.error('Calendar Upcoming API Error:', error.stack || error.message);
        res.status(500).json({ error: 'Failed to fetch upcoming calendar data.' });
    }
});

// 5. System Info
app.get('/api/system', (req, res) => {
    try {
        const cpus = os.cpus();
        const cpuModel = cpus.length > 0 ? cpus[0].model.trim() : 'Unknown CPU';
        const totalMem = os.totalmem();
        const freeMem = os.freemem();
        res.json({
            cpu: cpuModel,
            memory: {
                total: totalMem,
                free: freeMem,
                usagePercent: ((totalMem - freeMem) / totalMem) * 100
            },
            uptime: os.uptime(),
            platform: os.platform()
        });
    } catch (error) {
        console.error('System API Error:', error.message);
        res.status(500).json({ error: 'Failed to fetch system info' });
    }
});

// React Router Fallback
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});
