const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.resolve(__dirname, '../../.env'), override: true });
dotenv.config({ path: path.resolve(__dirname, '../.env'), override: true });
dotenv.config({ path: '/app/.env', override: true });

const fs = require('fs');
const http = require('http');
const https = require('https');
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const ping = require('ping');
const { google } = require('googleapis');
const ical = require('node-ical');
const dns = require('dns');
const os = require('os');
const logger = require('./logger');

dns.setDefaultResultOrder('ipv4first');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
    logger.debug('HTTP', `${req.method} ${req.url}`);
    next();
});

// Serve static React files (if they exist from multi-stage build)
try {
    app.use(express.static(path.join(__dirname, '../client/dist')));
} catch (e) {
    logger.warn('Server', 'Client dist not found, ensure React is built.');
}

// ========================
// API Routes
// ========================

// 1. Latency Ping (Ping Target every request to proxy)
app.get('/api/network/ping', async (req, res) => {
    const target = process.env.PING_TARGET || '8.8.8.8';
    try {
        const resPing = await ping.promise.probe(target, { timeout: 3 });
        let status = 'Red';
        if (resPing.alive) {
            if (resPing.time < 50) status = 'Green';
            else if (resPing.time <= 200) status = 'Amber';
        }
        logger.info('Ping', `Probed target ${target}: alive=${resPing.alive}, time=${resPing.time}ms, status=${status}`);
        res.json({
            alive: resPing.alive,
            time: resPing.time,
            target: resPing.host,
            status: status
        });
    } catch (error) {
        logger.error('Ping', `Ping failed for target ${target}`, error);
        res.status(500).json({ error: 'Ping failed', status: 'Red' });
    }
});

// 2. Weather Proxy (OpenWeather API - Current & Forecast)
app.get('/api/weather', async (req, res) => {
    try {
        const { lat = '-33.9249', lon = '18.4241' } = req.query; // Default: Cape Town
        const apiKey = process.env.WEATHER_KEY;
        
        if (!apiKey || apiKey === 'your_openweather_api_key_here') {
            logger.warn('Weather', 'No WEATHER_KEY specified in .env');
            return res.status(400).json({ error: "No WEATHER_KEY specified in .env" });
        }

        logger.info('Weather', `Fetching weather data for lat=${lat}, lon=${lon}`);
        const [currentRes, forecastRes] = await Promise.all([
            axios.get(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`, { timeout: 8000 }),
            axios.get(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`, { timeout: 8000 })
        ]);
        
        logger.info('Weather', `Successfully fetched weather data for ${currentRes.data?.name || 'location'}`);
        res.json({ current: currentRes.data, forecast: forecastRes.data });
    } catch (error) {
        logger.error('Weather', 'Weather API request failed', error);
        res.status(500).json({ error: 'Failed to fetch weather data' });
    }
});

// 2.5 Unsplash Proxy (Dynamic Weather Backgrounds)
app.get('/api/background', async (req, res) => {
    try {
        const query = req.query.query || 'nature,sky';
        const apiKey = process.env.UNSPLASH_KEY;
        
        if (!apiKey || apiKey === 'your_unsplash_api_key_here') {
            logger.warn('Unsplash', 'No UNSPLASH_KEY specified in .env');
            return res.status(400).json({ error: "No UNSPLASH_KEY specified in .env" });
        }

        logger.info('Unsplash', `Fetching background image for query="${query}"`);
        const unsplashRes = await axios.get(`https://api.unsplash.com/photos/random?query=${encodeURIComponent(query)}&client_id=${apiKey}&orientation=landscape`, { timeout: 8000 });
        
        logger.info('Unsplash', `Successfully fetched background image ID=${unsplashRes.data.id}`);
        res.json({
            image: unsplashRes.data.urls.regular,
            color: unsplashRes.data.color
        });
    } catch (error) {
        logger.error('Unsplash', 'Unsplash API request failed', error);
        res.status(500).json({ error: 'Failed to fetch background image' });
    }
});

// --- Multi-Calendar Parsing Helpers ---
const PALETTE = ['#3b82f6', '#10b981', '#a855f7', '#ec4899', '#06b6d4', '#f97316', '#6366f1', '#14b8a6'];

function parseCalendarConfigs() {
    const mode = process.env.CALENDAR_MODE || 'ical';
    if (mode === 'none') {
        logger.info('Calendar', 'CALENDAR_MODE is set to "none"');
        return [];
    }

    let rawEntries = [];
    if (mode === 'ical') {
        let envVal = process.env.CALENDAR_ICAL_URLS || process.env.CALENDAR_ICAL_URL || '';
        if (envVal) {
            // Strip outer quotes if user enclosed value in quotes
            envVal = envVal.replace(/^"|"$/g, '').trim();
            if (envVal && envVal !== 'your_public_ical_url_here') {
                rawEntries = envVal.split(',').map(s => s.trim()).filter(Boolean);
            }
        }
    } else if (mode === 'service_account') {
        let envVal = process.env.CALENDAR_IDS || process.env.CALENDAR_ID || '';
        if (envVal) {
            envVal = envVal.replace(/^"|"$/g, '').trim();
            if (envVal && envVal !== 'your_google_calendar_id_here') {
                rawEntries = envVal.split(',').map(s => s.trim()).filter(Boolean);
            }
        }
    }

    logger.info('Calendar', `Parsed ${rawEntries.length} calendar configuration(s) for mode="${mode}"`);

    return rawEntries.map((entry, idx) => {
        const parts = entry.split('|').map(p => p.trim());
        let name, location, color;
        if (parts.length >= 3) {
            name = parts[0];
            location = parts[1];
            color = parts[2];
        } else if (parts.length === 2) {
            name = parts[0];
            location = parts[1];
            color = PALETTE[idx % PALETTE.length];
        } else {
            location = parts[0];
            name = `Calendar ${idx + 1}`;
            color = PALETTE[idx % PALETTE.length];
        }
        return { id: `cal_${idx}`, name, location, color, mode };
    });
}

async function fetchICalFeed(config, startTime, endTime) {
    logger.info('Calendar', `Fetching iCal feed for [${config.name}]`, { url: config.location });
    try {
        const response = await axios.get(config.location, {
            responseType: 'text',
            timeout: 15000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) DashboardGUI/1.0'
            }
        });

        const events = await ical.async.parseICS(response.data);
        const parsed = [];
        let totalVEvents = 0;

        for (const k in events) {
            if (events.hasOwnProperty(k) && events[k].type === 'VEVENT') {
                totalVEvents++;
                const ev = events[k];
                if (!ev.start) continue;

                const startDate = new Date(ev.start);
                const endDate = ev.end ? new Date(ev.end) : new Date(startDate.getTime() + 3600000);
                const isDateOnly = !!(ev.start && ev.start.dateOnly);

                // Handle RRULE (recurring events)
                if (ev.rrule) {
                    try {
                        const occurrences = ev.rrule.between(startTime, endTime, true);
                        for (const occDate of occurrences) {
                            const duration = endDate.getTime() - startDate.getTime();
                            const occStart = new Date(occDate);
                            const occEnd = new Date(occStart.getTime() + (duration > 0 ? duration : 0));
                            parsed.push({
                                summary: ev.summary || 'Untitled Event',
                                start: isDateOnly ? { date: occStart.toISOString().split('T')[0] } : { dateTime: occStart.toISOString() },
                                end: isDateOnly ? { date: occEnd.toISOString().split('T')[0] } : { dateTime: occEnd.toISOString() },
                                calendarName: config.name,
                                calendarColor: config.color,
                                isHoliday: !!config.isHoliday
                            });
                        }
                    } catch (rruleErr) {
                        logger.warn('Calendar', `RRULE parse error for event "${ev.summary}" in [${config.name}]: ${rruleErr.message}`);
                    }
                }

                // Check range overlap for non-recurring events
                const overlaps = (startDate <= endTime && endDate >= startTime);
                if (overlaps && !ev.rrule) {
                    parsed.push({
                        summary: ev.summary || 'Untitled Event',
                        start: isDateOnly ? { date: startDate.toISOString().split('T')[0] } : { dateTime: startDate.toISOString() },
                        end: isDateOnly ? { date: endDate.toISOString().split('T')[0] } : { dateTime: endDate.toISOString() },
                        calendarName: config.name,
                        calendarColor: config.color,
                        isHoliday: !!config.isHoliday
                    });
                }
            }
        }

        logger.info('Calendar', `[${config.name}] Parsed ${parsed.length} matching events (out of ${totalVEvents} total VEVENTs)`);
        return parsed;
    } catch (err) {
        logger.error('Calendar', `Failed to fetch/parse iCal feed for [${config.name}]`, err);
        throw err;
    }
}

async function fetchGoogleCalendarFeed(config, startTime, endTime) {
    const keyPath = process.env.SERVICE_ACCOUNT_PATH;
    logger.info('Calendar', `Fetching Google Calendar API for [${config.name}] using service account`, { keyPath, calendarId: config.location });
    
    try {
        const auth = new google.auth.GoogleAuth({
            keyFile: keyPath,
            scopes: ['https://www.googleapis.com/auth/calendar.readonly'],
        });

        const calendar = google.calendar({ version: 'v3', auth });
        const response = await calendar.events.list({
            calendarId: config.location,
            timeMin: startTime.toISOString(),
            timeMax: endTime.toISOString(),
            maxResults: 100,
            singleEvents: true,
            orderBy: 'startTime',
        });

        const items = response.data.items || [];
        logger.info('Calendar', `[${config.name}] Fetched ${items.length} Google Calendar events`);
        return items.map(item => ({
            summary: item.summary || 'Untitled Event',
            start: item.start,
            end: item.end,
            calendarName: config.name,
            calendarColor: config.color,
            isHoliday: !!config.isHoliday
        }));
    } catch (err) {
        logger.error('Calendar', `Google Calendar API request failed for [${config.name}]`, err);
        throw err;
    }
}

async function fetchAllCalendarsForRange(startTime, endTime, includeHolidays = true) {
    logger.info('Calendar', `Fetching all calendars for range: ${startTime.toISOString()} to ${endTime.toISOString()}`);
    const configs = parseCalendarConfigs();
    if (includeHolidays) {
        const holidayUrl = process.env.HOLIDAY_ICAL_URL || 'https://calendar.google.com/calendar/ical/en.sa%23holiday%40group.v.calendar.google.com/public/basic.ics';
        configs.push({
            id: 'cal_holiday',
            name: 'SA Holidays',
            location: holidayUrl,
            color: '#f59e0b',
            mode: 'ical',
            isHoliday: true
        });
    }

    const promises = configs.map(config => {
        if (config.mode === 'ical') {
            return fetchICalFeed(config, startTime, endTime);
        } else {
            return fetchGoogleCalendarFeed(config, startTime, endTime);
        }
    });

    const results = await Promise.allSettled(promises);
    let allEvents = [];
    results.forEach((res, idx) => {
        if (res.status === 'fulfilled') {
            allEvents = allEvents.concat(res.value);
        } else {
            logger.error('Calendar', `Calendar fetch failed for [${configs[idx].name}]`, res.reason);
        }
    });

    // Deduplicate by summary + start time
    const seen = new Set();
    const uniqueEvents = [];
    for (const evt of allEvents) {
        const startKey = evt.start?.dateTime || evt.start?.date;
        const dedupeKey = `${evt.summary}_${startKey}`;
        if (!seen.has(dedupeKey)) {
            seen.add(dedupeKey);
            uniqueEvents.push(evt);
        }
    }

    // Chronological sort
    uniqueEvents.sort((a, b) => {
        const dateA = new Date(a.start?.dateTime || a.start?.date);
        const dateB = new Date(b.start?.dateTime || b.start?.date);
        return dateA - dateB;
    });

    const activeCalendars = configs.map(c => ({ name: c.name, color: c.color, isHoliday: !!c.isHoliday }));
    logger.info('Calendar', `Total unique events retrieved: ${uniqueEvents.length} across ${activeCalendars.length} active calendar(s)`);
    return { items: uniqueEvents, calendars: activeCalendars };
}

// 3. Google / iCal Multi-Calendar Proxy - Today's Events
app.get('/api/calendar/today', async (req, res) => {
    try {
        const mode = process.env.CALENDAR_MODE || 'ical';
        if (mode === 'none') {
            return res.json({ disabled: true, items: [], calendars: [] });
        }

        const now = new Date();
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

        const data = await fetchAllCalendarsForRange(startOfDay, endOfDay, false);
        return res.json(data);
    } catch (error) {
        logger.error('Calendar', 'Today API endpoint error', error);
        res.status(500).json({ error: 'Failed to fetch today calendar data.' });
    }
});

// 4. Google / iCal Multi-Calendar Proxy - Upcoming 7 Days
app.get('/api/calendar/upcoming', async (req, res) => {
    try {
        const mode = process.env.CALENDAR_MODE || 'ical';
        if (mode === 'none') {
            return res.json({ disabled: true, items: [], calendars: [] });
        }

        const now = new Date();
        const startOfTomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
        const endOfPeriod = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 7, 23, 59, 59);

        const data = await fetchAllCalendarsForRange(startOfTomorrow, endOfPeriod, true);
        return res.json(data);
    } catch (error) {
        logger.error('Calendar', 'Upcoming API endpoint error', error);
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
        logger.error('System', 'System API Error', error);
        res.status(500).json({ error: 'Failed to fetch system info' });
    }
});

// React Router Fallback
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

// Check for HTTPS certificates (in container /certs or local ./certs)
const certLocations = [
    { key: '/certs/key.pem', cert: '/certs/cert.pem' },
    { key: path.join(__dirname, '../../certs/key.pem'), cert: path.join(__dirname, '../../certs/cert.pem') },
    { key: path.join(__dirname, '../certs/key.pem'), cert: path.join(__dirname, '../certs/cert.pem') }
];

let sslOptions = null;
for (const loc of certLocations) {
    if (fs.existsSync(loc.key) && fs.existsSync(loc.cert)) {
        try {
            sslOptions = {
                key: fs.readFileSync(loc.key),
                cert: fs.readFileSync(loc.cert)
            };
            logger.info('SSL', `Loaded SSL certificates from ${loc.cert}`);
            break;
        } catch (e) {
            logger.error('SSL', `Error reading SSL certs from ${loc.cert}`, e);
        }
    }
}

if (sslOptions) {
    https.createServer(sslOptions, app).listen(PORT, '0.0.0.0', () => {
        logger.info('Server', `🔒 HTTPS Server running on https://0.0.0.0:${PORT}`);
    });
} else {
    http.createServer(app).listen(PORT, '0.0.0.0', () => {
        logger.info('Server', `HTTP Server running on http://0.0.0.0:${PORT}`);
    });
}
