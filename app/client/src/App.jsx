import { useState, useEffect } from 'react';
import { useWeatherEnvironment } from './hooks/useWeatherEnvironment';
import StatusBar from './components/StatusBar';
import HeroClock from './components/HeroClock';
import CalendarWidget from './components/CalendarWidget';
import UpcomingWidget from './components/UpcomingWidget';
import WeatherWidgetsCluster from './components/WeatherWidgetsCluster';
import SystemHealthWidget from './components/SystemHealthWidget';

const App = () => {
    const { accentColor, weatherCode, bgImage, weatherData } = useWeatherEnvironment();
    const [calendars, setCalendars] = useState([]);
    const [hiddenCalendars, setHiddenCalendars] = useState([]);

    useEffect(() => {
        document.documentElement.style.setProperty('--accent-color', accentColor);
    }, [accentColor]);

    const handleToggleCalendar = (calendarName) => {
        setHiddenCalendars(prev =>
            prev.includes(calendarName)
                ? prev.filter(name => name !== calendarName)
                : [...prev, calendarName]
        );
    };

    return (
        <div className="relative w-screen h-screen flex flex-col p-6 transition-colors duration-1000 bg-black overflow-hidden">
            {/* Dynamic Background Image */}
            <div
                className="absolute inset-0 z-0 bg-cover bg-center transition-opacity duration-1000 opacity-60 pointer-events-none"
                style={{ backgroundImage: `url(${bgImage})` }}
            />
            {/* Moody Vignette Gradient */}
            <div
                className="absolute inset-0 z-0 pointer-events-none"
                style={{
                    background: `radial-gradient(circle at top right, ${accentColor}44, transparent 70%), radial-gradient(circle at bottom left, ${accentColor}22, transparent 60%), radial-gradient(circle at center, transparent 30%, #000000ee 100%)`
                }}
            />

            {/* CSS Weather Overlays */}
            {weatherCode === 'Rain' && (
                <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-40">
                    {[...Array(20)].map((_, i) => (
                        <div key={i} className="particle-rain" style={{
                            left: `${Math.random() * 100}vw`,
                            animationDelay: `${Math.random() * 2}s`,
                            opacity: Math.random() * 0.5 + 0.1
                        }} />
                    ))}
                </div>
            )}

            {/* macOS Style Status Bar */}
            <StatusBar />

            {/* Main Content Area */}
            <main className="flex-1 flex justify-between z-10 relative h-full">

                {/* Vertically Top-Aligned Hero Clock */}
                <div className="absolute inset-x-0 top-0 pointer-events-none flex justify-center z-0">
                    <HeroClock />
                </div>

                {/* Left Side: Multi-Calendar Focus */}
                <div className="w-[30%] min-w-[320px] flex flex-col gap-6 h-full pb-2">
                    <CalendarWidget
                        calendars={calendars}
                        setCalendars={setCalendars}
                        hiddenCalendars={hiddenCalendars}
                        onToggleCalendar={handleToggleCalendar}
                    />
                    <UpcomingWidget
                        calendars={calendars}
                        setCalendars={setCalendars}
                        hiddenCalendars={hiddenCalendars}
                    />
                </div>

                {/* Right Side: iOS Widget Clusters */}
                <div className="w-[30%] min-w-[320px] max-w-[400px] flex flex-col gap-6 h-full pb-2 overflow-y-auto hidden-scrollbar pr-2">
                    <WeatherWidgetsCluster accentColor={accentColor} weatherData={weatherData} />
                    <SystemHealthWidget />
                </div>
            </main>
        </div>
    );
};

export default App;
