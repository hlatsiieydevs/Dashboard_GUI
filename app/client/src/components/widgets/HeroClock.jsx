import React, { useState, useEffect } from 'react';
import { Type, Calendar } from 'lucide-react';

const STORAGE_KEY = 'heroclock_settings_v2';

const FONT_CLASSES = {
    sans: 'font-sans',
    mono: 'font-mono',
    serif: 'font-serif',
    display: 'font-extrabold tracking-tight font-sans'
};

const HeroClock = ({ isEditMode }) => {
    const [now, setNow] = useState(new Date());
    const [showDate, setShowDate] = useState(true);
    const [fontStyle, setFontStyle] = useState('sans'); // sans | mono | serif | display
    const [fontSizeScale, setFontSizeScale] = useState(1); // 0.85 | 1 | 1.25

    useEffect(() => {
        const timer = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                const parsed = JSON.parse(saved);
                if (typeof parsed.showDate === 'boolean') setShowDate(parsed.showDate);
                if (parsed.fontStyle) setFontStyle(parsed.fontStyle);
                if (parsed.fontSizeScale) setFontSizeScale(parsed.fontSizeScale);
            }
        } catch (e) {}
    }, []);

    const saveSettings = (newShowDate, newFontStyle, newScale) => {
        setShowDate(newShowDate);
        setFontStyle(newFontStyle);
        setFontSizeScale(newScale);
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify({
                showDate: newShowDate,
                fontStyle: newFontStyle,
                fontSizeScale: newScale
            }));
        } catch (e) {}
    };

    // Format strings
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    const dayOfWeekStr = now.toLocaleDateString('en-US', { weekday: 'long' });
    const fullDateStr = `${now.getDate()} ${now.toLocaleDateString('en-US', { month: 'long' })} ${now.getFullYear()}`;

    return (
        <div className="glass-panel p-5 flex flex-col justify-center items-center pointer-events-auto w-full h-full min-h-0 overflow-hidden relative group">
            {/* Clock Controls Overlay in Edit Mode */}
            {isEditMode && (
                <div className="absolute top-2 right-2 z-40 flex items-center gap-1.5 bg-black/90 backdrop-blur-md p-1 px-2 rounded-lg border border-white/20 text-xs shadow-lg">
                    {/* Toggle Date Button */}
                    <button
                        type="button"
                        onClick={() => saveSettings(!showDate, fontStyle, fontSizeScale)}
                        className={`p-1 rounded transition-colors ${showDate ? 'bg-cyan-500/30 text-cyan-300' : 'text-white/40 hover:text-white'}`}
                        title="Toggle Date Display"
                    >
                        <Calendar className="w-3.5 h-3.5" />
                    </button>

                    {/* Cycle Font Style Button */}
                    <button
                        type="button"
                        onClick={() => {
                            const styles = ['sans', 'mono', 'serif', 'display'];
                            const next = styles[(styles.indexOf(fontStyle) + 1) % styles.length];
                            saveSettings(showDate, next, fontSizeScale);
                        }}
                        className="flex items-center gap-1 p-1 px-1.5 rounded bg-white/10 hover:bg-white/20 text-white/80 text-[10px] uppercase font-bold"
                        title="Change Font Family"
                    >
                        <Type className="w-3 h-3 text-cyan-400" />
                        <span>{fontStyle}</span>
                    </button>

                    {/* Scale Size Button */}
                    <button
                        type="button"
                        onClick={() => {
                            const scales = [0.85, 1, 1.25];
                            const nextScale = scales[(scales.indexOf(fontSizeScale) + 1) % scales.length];
                            saveSettings(showDate, nextScale === 0.85 ? 'sans' : fontStyle, nextScale);
                        }}
                        className="px-1.5 py-0.5 rounded bg-white/10 hover:bg-white/20 text-white/80 text-[10px] font-mono"
                        title="Adjust Size Scale"
                    >
                        {fontSizeScale === 0.85 ? 'Small' : fontSizeScale === 1 ? 'Med' : 'Large'}
                    </button>
                </div>
            )}

            {/* Natural Proportional HTML Typography Container */}
            <div className={`w-full h-full flex flex-col items-center justify-center text-center transition-all duration-300 ${FONT_CLASSES[fontStyle] || 'font-sans'}`}>
                {/* Line 1: HH:MM */}
                <div
                    className="font-black tracking-tighter leading-none select-none drop-shadow-lg"
                    style={{
                        color: 'var(--accent-color)',
                        fontSize: `clamp(2.5rem, ${6 * fontSizeScale}vw, ${showDate ? 5 * fontSizeScale : 7 * fontSizeScale}rem)`
                    }}
                >
                    {timeStr}
                </div>

                {showDate && (
                    <div className="w-full flex flex-col items-center justify-center mt-3 pt-2.5 border-t border-white/15 space-y-1">
                        {/* Line 2: Day of the Week */}
                        <div
                            className="font-bold uppercase tracking-[0.3em] text-white/95 text-center w-full leading-snug"
                            style={{
                                fontSize: `clamp(0.9rem, ${1.5 * fontSizeScale}vw, ${1.4 * fontSizeScale}rem)`
                            }}
                        >
                            {dayOfWeekStr}
                        </div>

                        {/* Line 3: Day Month Year */}
                        <div
                            className="font-medium uppercase tracking-[0.2em] text-white/60 text-center w-full leading-snug"
                            style={{
                                fontSize: `clamp(0.75rem, ${1.1 * fontSizeScale}vw, ${1.05 * fontSizeScale}rem)`
                            }}
                        >
                            {fullDateStr}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default HeroClock;
