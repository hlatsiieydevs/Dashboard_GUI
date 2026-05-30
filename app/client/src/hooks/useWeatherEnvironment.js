import { useState, useEffect } from 'react';

// Pre-defined Accent Map based on weather conditions mapping
const ACCENT_MAP = {
    ClearDay: '#0EA5E9',   // Sky Blue
    ClearNight: '#6366F1', // Deep Indigo
    Cloudy: '#64748B',     // Soft Slate
    CloudyNight: '#334155', // Dark Slate
    Rain: '#64748B',       // Soft Slate
    Sunset: '#F59E0B',     // Warm Amber
};

// Pre-defined Image Map for Backgrounds
const IMAGE_MAP = {
    ClearDay: 'https://images.unsplash.com/photo-1601297183305-6df142704ea2?q=80&w=1920&auto=format&fit=crop', // Clear blue sky
    ClearNight: 'https://images.unsplash.com/photo-1503264116251-35a269479413?q=80&w=1920&auto=format&fit=crop', // Starry night
    Cloudy: 'https://images.unsplash.com/photo-1501630834273-4b5604d2ee31?q=80&w=1920&auto=format&fit=crop', // Cloudy overcast
    CloudyNight: 'https://images.unsplash.com/photo-1534088568595-a066f410bcda?q=80&w=1920&auto=format&fit=crop', // Dark/Cloudy night
    Rain: 'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?q=80&w=1920&auto=format&fit=crop', // Rain on glass
    Sunset: 'https://images.unsplash.com/photo-1472141521881-9b503f8a0ff1?q=80&w=1920&auto=format&fit=crop', // Warm sunset
};

// Dynamic Accent Algorithm (Gets high contrast, complementary pastel color from Unsplash dominant color)
const getContrastAccent = (hexColor) => {
    // Basic fallback if unparseable
    if (!hexColor || hexColor.length < 6) return '#64748B'; 
    let r = parseInt(hexColor.slice(1, 3), 16) / 255;
    let g = parseInt(hexColor.slice(3, 5), 16) / 255;
    let b = parseInt(hexColor.slice(5, 7), 16) / 255;
    
    let max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;
    if (max === min) {
        h = s = 0; 
    } else {
        let d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }
    // Rotate hue by 180 degrees for complementary pop
    const targetHue = (Math.round(h * 360) + 180) % 360;
    // Force lightness to ~70% and saturation high so it remains bright/visible against tinted glass
    return `hsl(${targetHue}, 85%, 70%)`;
};

export const useWeatherEnvironment = () => {
    const [accentColor, setAccentColor] = useState(ACCENT_MAP.ClearDay);
    const [weatherCode, setWeatherCode] = useState('Clear');
    const [timeOfDay, setTimeOfDay] = useState('Day');
    const [bgImage, setBgImage] = useState(IMAGE_MAP.ClearDay);
    const [weatherData, setWeatherData] = useState(null);

    useEffect(() => {
        const fetchWithCoords = async (position) => {
            try {
                let url = '/api/weather';
                if (position) {
                    url += `?lat=${position.coords.latitude}&lon=${position.coords.longitude}`;
                }
                const res = await fetch(url);
                if (res.ok) {
                    const data = await res.json();
                    setWeatherData(data);
                    
                    const current = data.current;
                    if (!current) return;
                    
                    const mainCondition = current.weather[0]?.main || 'Clear'; // Clear, Clouds, Rain
                    const dt = current.dt;
                    const sys = current.sys;
                    
                    let isNight = false;
                    let isSunset = false;

                    if (sys && dt) {
                        isNight = dt < sys.sunrise || dt > sys.sunset;
                        // Rough sunset approximation: within 1 hour of sunset
                        if (dt >= sys.sunset - 3600 && dt <= sys.sunset + 3600) {
                            isSunset = true;
                        }
                    }

                    // Map to Accents & Images
                    let newAccent = ACCENT_MAP.ClearDay;
                    let newImage = IMAGE_MAP.ClearDay;
                    
                    if (isSunset) {
                        newAccent = ACCENT_MAP.Sunset;
                        newImage = IMAGE_MAP.Sunset;
                    } else if (mainCondition === 'Rain' || mainCondition === 'Drizzle' || mainCondition === 'Thunderstorm') {
                        newAccent = ACCENT_MAP.Rain;
                        newImage = IMAGE_MAP.Rain;
                    } else if (mainCondition === 'Clouds' || mainCondition === 'Mist' || mainCondition === 'Fog' || mainCondition === 'Snow') {
                        newAccent = isNight ? ACCENT_MAP.CloudyNight : ACCENT_MAP.Cloudy;
                        newImage = isNight ? IMAGE_MAP.CloudyNight : IMAGE_MAP.Cloudy;
                    } else if (isNight) {
                        newAccent = ACCENT_MAP.ClearNight;
                        newImage = IMAGE_MAP.ClearNight;
                    }

                    setAccentColor(newAccent);
                    setWeatherCode(mainCondition);
                    setTimeOfDay(isNight ? 'Night' : 'Day');
                    
                    // Generate dynamic image query
                    let ns = 'nature,sky,minimalist,';
                    let query = ns + 'clear,blue';
                    if (isSunset) query = ns + 'sunset,golden-hour';
                    else if (mainCondition === 'Rain' || mainCondition === 'Drizzle') query = ns + 'rain,dark,moody';
                    else if (mainCondition === 'Thunderstorm') query = ns + 'lightning,storm';
                    else if (mainCondition === 'Clouds' || mainCondition === 'Mist') query = isNight ? ns + 'cloudy,night,dark' : ns + 'cloudy,overcast';
                    else if (isNight) query = ns + 'night,stars,dark';

                    try {
                        const bgRes = await fetch(`/api/background?query=${encodeURIComponent(query)}`);
                        if (bgRes.ok) {
                            const bgData = await bgRes.json();
                            if (bgData.image) {
                                setBgImage(bgData.image);
                                // The new contrasting hue!
                                setAccentColor(getContrastAccent(bgData.color || '#64748B'));
                                return; // Success, gracefully exit without hitting fallbacks
                            }
                        }
                    } catch (unsplashErr) {
                        console.warn("Unsplash API bypassed or failed. Falling back to static maps.", unsplashErr);
                    }

                    // Fallback to static if Unsplash is unauthenticated or fails
                    setAccentColor(newAccent);
                    setBgImage(newImage);
                }
            } catch (err) {
                console.error("Failed to fetch weather environment for styling");
            }
        };

        const getLocationAndFetch = () => {
            if ("geolocation" in navigator) {
                navigator.geolocation.getCurrentPosition(
                    (position) => fetchWithCoords(position),
                    (error) => {
                        console.warn("Geolocation denied or failed, using Cape Town fallback.");
                        // Fallback to Cape Town coordinates
                        fetchWithCoords({ coords: { latitude: -33.9249, longitude: 18.4241 } });
                    }
                );
            } else {
                // Fallback to Cape Town coordinates
                fetchWithCoords({ coords: { latitude: -33.9249, longitude: 18.4241 } });
            }
        };

        getLocationAndFetch();
        const interval = setInterval(getLocationAndFetch, 15 * 60 * 1000); // 15 mins
        return () => clearInterval(interval);
    }, []);

    return { accentColor, weatherCode, timeOfDay, bgImage, weatherData };
};
