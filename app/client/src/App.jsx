import { useState, useEffect } from 'react';
import { useWeatherEnvironment } from './hooks/useWeatherEnvironment';
import { useTileLayout } from './hooks/useTileLayout';
import { useDashboardModes } from './hooks/useDashboardModes';
import StatusBar from './components/StatusBar';
import {
    HeroClock,
    CalendarWidget,
    UpcomingWidget,
    WeatherWidgetsCluster,
    SystemHealthWidget,
    PomodoroWidget
} from './components/widgets';
import DashboardGrid from './components/grid/DashboardGrid';
import DashboardTile from './components/grid/DashboardTile';
import WidgetDrawer from './components/grid/WidgetDrawer';
import MobileRemoteUI from './components/remote/MobileRemoteUI';

const App = () => {
    const isRemoteRoute = window.location.pathname === '/remote' || window.location.port === '12346';

    const { accentColor, weatherCode, bgImage, weatherData } = useWeatherEnvironment();
    const {
        tiles,
        isEditMode,
        isAutoFlow,
        toggleEditMode,
        toggleAutoFlow,
        updateTileSpan,
        moveTile,
        addCatalogWidget,
        removeTile,
        resetLayout
    } = useTileLayout();

    const {
        mode,
        pomodoro,
        changeMode,
        startPomodoro,
        pausePomodoro,
        resetPomodoro,
        skipPomodoroPhase,
        updatePomodoroParams
    } = useDashboardModes();

    const [calendars, setCalendars] = useState([]);
    const [hiddenCalendars, setHiddenCalendars] = useState([]);

    useEffect(() => {
        document.documentElement.style.setProperty('--accent-color', accentColor);
    }, [accentColor]);

    // If viewing Remote Control UI (via /remote or Port 12346)
    if (isRemoteRoute) {
        const handleAction = (action) => {
            if (action === 'start') startPomodoro();
            if (action === 'pause') pausePomodoro();
            if (action === 'reset') resetPomodoro();
            if (action === 'skip') skipPomodoroPhase();
        };

        return (
            <MobileRemoteUI
                modeState={{ mode, pomodoro }}
                onModeChange={changeMode}
                onPomodoroAction={handleAction}
                onUpdateParams={updatePomodoroParams}
            />
        );
    }

    const handleToggleCalendar = (calendarName) => {
        setHiddenCalendars(prev =>
            prev.includes(calendarName)
                ? prev.filter(name => name !== calendarName)
                : [...prev, calendarName]
        );
    };

    const renderWidget = (tile) => {
        const type = tile.widgetType || tile.id;
        if (type.startsWith('hero_clock')) {
            return (
                <div className="flex justify-center items-center h-full w-full">
                    <HeroClock isEditMode={isEditMode} />
                </div>
            );
        }
        if (type.startsWith('pomodoro')) {
            return (
                <PomodoroWidget
                    pomodoro={pomodoro}
                    onStart={startPomodoro}
                    onPause={pausePomodoro}
                    onReset={resetPomodoro}
                    onSkip={skipPomodoroPhase}
                    isEditMode={isEditMode}
                />
            );
        }
        if (type.startsWith('calendar')) {
            return (
                <CalendarWidget
                    calendars={calendars}
                    setCalendars={setCalendars}
                    hiddenCalendars={hiddenCalendars}
                    onToggleCalendar={handleToggleCalendar}
                />
            );
        }
        if (type.startsWith('upcoming')) {
            return (
                <UpcomingWidget
                    calendars={calendars}
                    setCalendars={setCalendars}
                    hiddenCalendars={hiddenCalendars}
                />
            );
        }
        if (type.startsWith('weather_cluster')) {
            return <WeatherWidgetsCluster accentColor={accentColor} weatherData={weatherData} />;
        }
        if (type.startsWith('system_health')) {
            return <SystemHealthWidget />;
        }
        return null;
    };

    // Calculate background styling based on active mode & Pomodoro state
    let bgStyle = {};
    let bgClass = "transition-all duration-1000 bg-black";

    if (mode === 'sleep') {
        // OLED Pitch-Black background for sleep mode
        bgStyle = { backgroundColor: '#000000' };
    } else if (mode === 'grind') {
        // Dynamic background colors in Grind Mode
        if (pomodoro.state === 'short_break') {
            // Light blue background for short break
            bgStyle = { background: 'radial-gradient(circle at center, #0284c7 0%, #0369a1 40%, #0c4a6e 100%)' };
        } else if (pomodoro.state === 'long_break') {
            // Lush green background for long break
            bgStyle = { background: 'radial-gradient(circle at center, #10b981 0%, #047857 40%, #064e3b 100%)' };
        } else {
            // Plain black for zero-distraction focus session
            bgStyle = { backgroundColor: '#000000' };
        }
    }

    return (
        <div className={`relative w-screen h-screen flex flex-col p-4 overflow-hidden select-none ${bgClass}`} style={bgStyle}>
            {/* Dynamic Weather Background Image (Only active in Normal Mode) */}
            {mode === 'normal' && (
                <>
                    <div
                        className="absolute inset-0 z-0 bg-cover bg-center transition-opacity duration-1000 opacity-60 pointer-events-none"
                        style={{ backgroundImage: `url(${bgImage})` }}
                    />
                    <div
                        className="absolute inset-0 z-0 pointer-events-none"
                        style={{
                            background: `radial-gradient(circle at top right, ${accentColor}44, transparent 70%), radial-gradient(circle at bottom left, ${accentColor}22, transparent 60%), radial-gradient(circle at center, transparent 30%, #000000ee 100%)`
                        }}
                    />
                </>
            )}

            {/* CSS Weather Overlays (Only active in Normal Mode) */}
            {mode === 'normal' && weatherCode === 'Rain' && (
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
            <StatusBar
                isEditMode={isEditMode}
                isAutoFlow={isAutoFlow}
                onToggleEditMode={toggleEditMode}
                onToggleAutoFlow={toggleAutoFlow}
                onAddSpacer={() => addCatalogWidget('spacer')}
                onResetLayout={resetLayout}
            />

            {/* 🌙 SLEEP MODE: OLED Pitch Black + Isolated Hero Clock */}
            {mode === 'sleep' ? (
                <main className="flex-1 z-10 relative h-full flex items-center justify-center">
                    <div className="w-full max-w-xl aspect-video flex items-center justify-center p-6 bg-black/80 rounded-3xl border border-white/10 shadow-2xl">
                        <HeroClock isEditMode={false} />
                    </div>
                </main>
            ) : mode === 'grind' ? (
                /* 🔥 GRIND MODE: Hero Clock + Pomodoro Timer Viewframe */
                <main className="flex-1 z-10 relative h-full flex items-center justify-center p-4">
                    <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                        <div className="w-full aspect-video flex items-center justify-center p-4">
                            <HeroClock isEditMode={false} />
                        </div>
                        <div className="w-full aspect-square max-h-[380px] flex items-center justify-center">
                            <PomodoroWidget
                                pomodoro={pomodoro}
                                onStart={startPomodoro}
                                onPause={pausePomodoro}
                                onReset={resetPomodoro}
                                onSkip={skipPomodoroPhase}
                                isEditMode={false}
                            />
                        </div>
                    </div>
                </main>
            ) : (
                /* 🌿 NORMAL MODE: Standard Dashboard Grid */
                <main className="flex-1 z-10 relative h-full flex flex-col overflow-hidden pb-12">
                    <DashboardGrid isEditMode={isEditMode} isAutoFlow={isAutoFlow} tiles={tiles} onMoveTile={moveTile}>
                        {tiles.map((tile) => (
                            <DashboardTile
                                key={tile.id}
                                tile={tile}
                                isEditMode={isEditMode}
                                isAutoFlow={isAutoFlow}
                                onMoveTile={moveTile}
                                onUpdateSpan={updateTileSpan}
                                onRemoveTile={removeTile}
                            >
                                {renderWidget(tile)}
                            </DashboardTile>
                        ))}
                    </DashboardGrid>
                </main>
            )}

            {/* Collapsible Floating Widget Drawer (Normal Mode) */}
            {mode === 'normal' && (
                <WidgetDrawer
                    isEditMode={isEditMode}
                    activeTiles={tiles}
                    onAddWidget={addCatalogWidget}
                />
            )}
        </div>
    );
};

export default App;
