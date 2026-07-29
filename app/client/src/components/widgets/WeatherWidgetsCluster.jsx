import React from 'react';
import { Sun, Cloud, CloudRain, CloudLightning, Snowflake, Umbrella, Moon as MoonIcon, Sunrise, Sunset } from 'lucide-react';
import { getMoonPhase, MOON_PATHS, getMoonEventColor } from '../../utils/moonUtils';

export const BaseWidget = ({ children }) => (
    <div className="glass-panel p-2 aspect-square flex flex-col items-center justify-center relative overflow-hidden">
        {children}
    </div>
);

export const TempGaugeWidget = ({ current, min, max, accentColor }) => {
    const range = (max - min) || 1;
    const progress = Math.max(0, Math.min(1, (current - min) / range));

    const r = 38;
    const c = 2 * Math.PI * r;
    const arcLength = c * 0.666;

    const angleRange = 240;
    const markerAngle = 150 + (progress * angleRange);
    const markerRad = (markerAngle * Math.PI) / 180;
    const markerX = 50 + r * Math.cos(markerRad);
    const markerY = 50 + r * Math.sin(markerRad);

    return (
        <div className="flex flex-col items-center justify-center w-full h-full relative">
            <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full pointer-events-none" style={{ transform: 'rotate(150deg)' }}>
                <circle cx="50" cy="50" r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" strokeDasharray={`${arcLength} ${c}`} strokeLinecap="round" />
                <circle cx="50" cy="50" r={r} fill="none" stroke={accentColor} strokeWidth="8" strokeDasharray={`${progress * arcLength} ${c}`} strokeLinecap="round" className="transition-all duration-1000 origin-center" />
            </svg>

            <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full pointer-events-none overflow-visible">
                <circle cx={markerX} cy={markerY} r="3" fill="white" className="drop-shadow-md transition-all duration-1000" />
            </svg>

            <div className="flex flex-col items-center z-10">
                <span className="font-black tracking-tighter leading-none" style={{ color: accentColor, fontSize: '3rem' }}>{current}°</span>
            </div>

            <div className="absolute bottom-3 left-0 right-0 flex justify-between px-[1.25rem] font-medium z-10 w-full pointer-events-none text-[15px]">
                <span className="text-blue-400">{min}°</span>
                <span className="text-red-400">{max}°</span>
            </div>
        </div>
    );
};

export const WindCompassWidget = ({ speed, deg, accentColor }) => {
    return (
        <div className="flex flex-col items-center justify-center w-full h-full relative">
            <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full text-white/20">
                <circle cx="50" cy="50" r="38" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="1 5" />
                <text x="50" y="22" fill="white" fontSize="9" textAnchor="middle" opacity="0.6">N</text>
                <text x="50" y="85" fill="white" fontSize="9" textAnchor="middle" opacity="0.6">S</text>
                <text x="15" y="53" fill="white" fontSize="9" textAnchor="middle" opacity="0.6">W</text>
                <text x="85" y="53" fill="white" fontSize="9" textAnchor="middle" opacity="0.6">E</text>
            </svg>
            <div className="absolute inset-0 w-full h-full transition-transform duration-1000 z-10" style={{ transform: `rotate(${deg}deg)` }}>
                <div className="absolute top-1 left-1/2 -translate-x-1/2 pt-0.5 drop-shadow-[0_0_5px_rgba(255,255,255,0.4)]">
                    <svg width="14" height="15" viewBox="0 0 14 15">
                        <path d="M7 0 L14 15 L7 11 L0 15 Z" fill={accentColor} />
                    </svg>
                </div>
            </div>
            <div className="flex flex-col items-center justify-center rounded-full w-14 h-14 bg-black/50 border border-white/10 z-20 shadow-xl backdrop-blur-md">
                <span className="font-bold text-lg leading-none">{speed}</span>
                <span className="text-[8px] text-white/50 leading-tight uppercase font-medium mt-0.5">km/h</span>
            </div>
        </div>
    );
};

export const PrecipWidget = ({ pop, accentColor }) => {
    return (
        <div className="flex flex-col items-center justify-center w-full h-full px-4 py-2">
            <Umbrella size={26} color={accentColor} className="mb-2 opacity-90 drop-shadow-md" />
            <div className="text-2xl font-black mb-1 leading-none">{pop}%</div>
            <div className="w-full h-[6px] bg-white/10 rounded-full mt-2 overflow-hidden shrink-0">
                <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${pop}%`, backgroundColor: accentColor, boxShadow: `0 0 8px ${accentColor}` }} />
            </div>
            <div className="text-[10px] text-white/40 uppercase tracking-widest mt-2">{pop > 50 ? 'Likely' : 'Unlikely'}</div>
        </div>
    );
};

export const MoonPhaseWidget = ({ phaseName }) => {
    const p = MOON_PATHS[phaseName] || '';
    const moonTint = getMoonEventColor(phaseName, new Date());

    return (
        <div className="flex flex-col items-center justify-center w-full h-full relative p-2">
            <svg viewBox="0 0 100 100" className="w-[85%] h-[85%] drop-shadow-lg mb-4">
                <defs>
                    <mask id="moonPhaseMask">
                        <circle cx="50" cy="50" r="45" fill="black" />
                        {p && <path d={p} fill="white" />}
                    </mask>

                    <filter id="moonShading">
                        <feColorMatrix type="matrix" values="
                              0.33 0.33 0.33 0 0
                              0.33 0.33 0.33 0 0
                              0.33 0.33 0.33 0 0
                              0    0    0    1 0" />
                        <feComponentTransfer>
                            <feFuncR type="linear" slope="1.05" intercept="0"/>
                            <feFuncG type="linear" slope="1.05" intercept="0"/>
                            <feFuncB type="linear" slope="1.05" intercept="0"/>
                        </feComponentTransfer>
                    </filter>

                    <filter id="moonDark">
                        <feColorMatrix type="matrix" values="
                              0.33 0.33 0.33 0 0
                              0.33 0.33 0.33 0 0
                              0.33 0.33 0.33 0 0
                              0    0    0    1 0" />
                        <feComponentTransfer>
                            <feFuncR type="linear" slope="0.15" intercept="0"/>
                            <feFuncG type="linear" slope="0.15" intercept="0"/>
                            <feFuncB type="linear" slope="0.15" intercept="0"/>
                        </feComponentTransfer>
                    </filter>
                </defs>

                <image
                    href="/realistic_full_moon.png"
                    x="5" y="5"
                    width="90" height="90"
                    filter="url(#moonDark)"
                />

                <g mask="url(#moonPhaseMask)">
                    <image
                        href="/realistic_full_moon.png"
                        x="5" y="5"
                        width="90" height="90"
                        filter="url(#moonShading)"
                    />
                    <rect x="0" y="0" width="100" height="100" fill={moonTint} style={{ mixBlendMode: 'overlay', opacity: 0.6 }} />
                </g>

                <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
            </svg>
            <div className="absolute bottom-3 text-[10px] font-medium text-white/60 text-center w-full px-1 leading-tight whitespace-pre-wrap">{phaseName}</div>
        </div>
    );
};

export const ForecastItem = ({ item, accentColor }) => {
    const time = new Date(item.dt * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    const temp = Math.round(item.main.temp);
    const condition = item.weather[0].main;
    const dt = item.dt;
    const pod = item.sys?.pod || 'd';

    let Icon = Cloud;
    const hour = new Date(dt * 1000).getHours();

    if (hour >= 5 && hour <= 7) {
        Icon = Sunrise;
    } else if (hour >= 17 && hour <= 19) {
        Icon = Sunset;
    } else {
        if (condition === 'Clear') Icon = pod === 'n' ? MoonIcon : Sun;
        else if (condition === 'Rain' || condition === 'Drizzle') Icon = CloudRain;
        else if (condition === 'Thunderstorm') Icon = CloudLightning;
        else if (condition === 'Snow') Icon = Snowflake;
    }

    return (
        <div className="flex flex-col items-center z-10 shrink-0 min-w-[3rem]">
            <span className="text-xs text-white/60 mb-2 truncate">{time}</span>
            <Icon size={20} style={{ color: accentColor }} className="mb-2" />
            <span className="text-sm font-bold">{temp}°</span>
        </div>
    );
};

const WeatherWidgetsCluster = ({ accentColor, weatherData }) => {
    if (!weatherData) return <div className="text-white/40 glass-panel p-4">Fetching Telemetry...</div>;

    const { current, forecast } = weatherData;
    const next24 = forecast && forecast.list ? forecast.list.slice(0, 8) : [];

    const temp = Math.round(current.main.temp);
    const minTemp = Math.round(Math.min(current.main.temp_min, ...next24.map(item => item.main.temp_min)));
    const maxTemp = Math.round(Math.max(current.main.temp_max, ...next24.map(item => item.main.temp_max)));

    const popRaw = next24.length > 0 ? Math.max(...next24.map(item => item.pop || 0)) : 0;
    const pop = Math.round(popRaw * 100);

    const windSpeed = Math.round(current.wind.speed * 3.6);
    const windDeg = current.wind.deg || 0;

    const moonPhaseStr = getMoonPhase(new Date());

    return (
        <div className="flex flex-col gap-2 w-full h-full overflow-y-auto hidden-scrollbar p-1">
            <div className="flex justify-between items-center glass-panel p-2 px-4 border-white/20 shadow-md shrink-0">
                <div className="text-white/90 font-bold text-sm tracking-wider capitalize truncate">{current.name}</div>
                <div className="text-xs font-semibold text-white/60">{current.weather?.[0]?.main}</div>
            </div>

            <div className="grid grid-cols-2 gap-2 flex-1 min-h-[160px]">
                <BaseWidget>
                    <TempGaugeWidget current={temp} min={minTemp} max={maxTemp} accentColor={accentColor} />
                </BaseWidget>

                <BaseWidget>
                    <PrecipWidget pop={pop} accentColor={accentColor} />
                </BaseWidget>

                <BaseWidget>
                    <WindCompassWidget speed={windSpeed} deg={windDeg} accentColor={accentColor} />
                </BaseWidget>

                <BaseWidget>
                    <MoonPhaseWidget phaseName={moonPhaseStr} accentColor={accentColor} />
                </BaseWidget>
            </div>

            <div className="glass-panel p-3 flex flex-col justify-center overflow-hidden shrink-0">
                <div className="text-white/60 font-medium tracking-wide text-[10px] uppercase mb-2 border-b border-white/10 pb-1 shrink-0">24-Hour Forecast</div>
                <div className="flex items-center overflow-hidden relative w-full mask-edges">
                    <div className="flex items-center animate-marquee will-change-transform gap-6 pr-6">
                        {[...next24, ...next24].map((item, i) => (
                            <ForecastItem key={i} item={item} accentColor={accentColor} />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WeatherWidgetsCluster;
