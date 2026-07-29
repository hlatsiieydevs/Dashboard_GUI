import React, { useState, useEffect } from 'react';
import { Type, Calendar, Settings } from 'lucide-react';

const STORAGE_KEY = 'heroclock_settings_v1';

const FONT_CLASSES = {
    sans: 'font-sans',
    mono: 'font-mono',
    serif: 'font-serif',
    display: 'font-extrabold tracking-tight'
};

const FONT_FAMILY_SVG = {
    sans: 'system-ui, -apple-system, sans-serif',
    mono: 'ui-monospace, SFMono-Regular, Menlo, monospace',
    serif: 'Georgia, Cambria, serif',
    display: 'Outfit, Trebuchet MS, sans-serif'
};

const HeroClock = ({ isEditMode }) => {
    const [now, setNow] = useState(new Date());
    const [showDate, setShowDate] = useState(true);
    const [fontStyle, setFontStyle] = useState('sans'); // sans | mono | serif | display
    const [fontSizeScale, setFontSizeScale] = useState(1); // 0.8 | 1 | 1.2
    const [showSettings, setShowSettings] = useState(false);

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

    const svgFontFamily = FONT_FAMILY_SVG[fontStyle] || FONT_FAMILY_SVG.sans;

    return (
        <div className="glass-panel p-4 flex flex-col justify-center items-center pointer-events-auto w-full h-full min-h-0 overflow-hidden relative group">
            {/* Clock Controls Overlay in Edit Mode */}
            {isEditMode && (
                <div className="absolute top-2 right-2 z-40 flex items-center gap-1.5 bg-black/80 backdrop-blur-md p-1 px-2 rounded-lg border border-white/20 text-xs">
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
                            const scales = [0.85, 1, 1.2];
                            const nextScale = scales[(scales.indexOf(fontSizeScale) + 1) % scales.length];
                            saveSettings(showDate, fontStyle, nextScale);
                        }}
                        className="px-1.5 py-0.5 rounded bg-white/10 hover:bg-white/20 text-white/80 text-[10px] font-mono"
                        title="Adjust Size Scale"
                    >
                        {fontSizeScale === 0.85 ? 'Small' : fontSizeScale === 1 ? 'Med' : 'Large'}
                    </button>
                </div>
            )}

            {/* Visual Vector Width Justified SVG Render Container */}
            <div className="w-full h-full flex items-center justify-center p-2" style={{ transform: `scale(${fontSizeScale})` }}>
                <svg
                    viewBox={showDate ? "0 0 320 180" : "0 0 320 90"}
                    className="w-full h-full max-w-full max-h-full overflow-visible"
                    preserveAspectRatio="xMidYMid meet"
                >
                    {/* Line 1: HH:MM */}
                    <text
                        x="0"
                        y={showDate ? "75" : "70"}
                        textLength="320"
                        lengthAdjust="spacingAndGlyphs"
                        fill="var(--accent-color)"
                        fontWeight="900"
                        fontSize={showDate ? "80" : "85"}
                        fontFamily={svgFontFamily}
                        className="drop-shadow-lg"
                    >
                        {timeStr}
                    </text>

                    {showDate && (
                        <>
                            {/* Decorative Separator Line */}
                            <line
                                x1="0"
                                y1="95"
                                x2="320"
                                y2="95"
                                stroke="rgba(255,255,255,0.15)"
                                strokeWidth="1.5"
                                strokeDasharray="4 4"
                            />

                            {/* Line 2: Day of the Week */}
                            <text
                                x="0"
                                y="132"
                                textLength="320"
                                lengthAdjust="spacingAndGlyphs"
                                fill="#ffffff"
                                opacity="0.9"
                                fontWeight="700"
                                fontSize="26"
                                fontFamily={svgFontFamily}
                            >
                                {dayOfWeekStr}
                            </text>

                            {/* Line 3: Day No. Month Year */}
                            <text
                                x="0"
                                y="165"
                                textLength="320"
                                lengthAdjust="spacingAndGlyphs"
                                fill="#ffffff"
                                opacity="0.6"
                                fontWeight="600"
                                fontSize="20"
                                fontFamily={svgFontFamily}
                            >
                                {fullDateStr}
                            </text>
                        </>
                    )}
                </svg>
            </div>
        </div>
    );
};

export default HeroClock;
