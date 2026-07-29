import { useState, useEffect } from 'react';
import { useWeatherEnvironment } from './hooks/useWeatherEnvironment';
import { useTileLayout } from './hooks/useTileLayout';
import StatusBar from './components/StatusBar';
import {
    HeroClock,
    CalendarWidget,
    UpcomingWidget,
    WeatherWidgetsCluster,
    SystemHealthWidget
} from './components/widgets';
import DashboardGrid from './components/grid/DashboardGrid';
import DashboardTile from './components/grid/DashboardTile';
import WidgetDrawer from './components/grid/WidgetDrawer';

const App = () => {
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

    const renderWidget = (tile) => {
        const type = tile.widgetType || tile.id;
        if (type.startsWith('hero_clock')) {
            return (
                <div className="flex justify-center items-center h-full w-full">
                    <HeroClock isEditMode={isEditMode} />
                </div>
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

    return (
        <div className="relative w-screen h-screen flex flex-col p-4 transition-colors duration-1000 bg-black overflow-hidden select-none">
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
            <StatusBar
                isEditMode={isEditMode}
                isAutoFlow={isAutoFlow}
                onToggleEditMode={toggleEditMode}
                onToggleAutoFlow={toggleAutoFlow}
                onAddSpacer={() => addCatalogWidget('spacer')}
                onResetLayout={resetLayout}
            />

            {/* Main Content Grid Area */}
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

            {/* Collapsible Floating Widget Drawer */}
            <WidgetDrawer
                isEditMode={isEditMode}
                activeTiles={tiles}
                onAddWidget={addCatalogWidget}
            />
        </div>
    );
};

export default App;
