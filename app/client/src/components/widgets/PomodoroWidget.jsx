import React from 'react';
import { Play, Pause, RotateCcw, SkipForward, Flame, Coffee, Sparkles } from 'lucide-react';

const PomodoroWidget = ({ pomodoro, onStart, onPause, onReset, onSkip, isEditMode }) => {
    const {
        workDuration = 25,
        shortBreakDuration = 5,
        longBreakDuration = 15,
        state = 'idle',
        timeRemaining = 25 * 60,
        completedSessions = 0,
        longBreakInterval = 4
    } = pomodoro || {};

    // Determine current total duration for progress ring
    let totalSecs = workDuration * 60;
    if (state === 'short_break') totalSecs = shortBreakDuration * 60;
    if (state === 'long_break') totalSecs = longBreakDuration * 60;

    const progress = Math.max(0, Math.min(1, 1 - (timeRemaining / (totalSecs || 1))));

    // Format MM:SS
    const mins = Math.floor(timeRemaining / 60);
    const secs = timeRemaining % 60;
    const timeDisplay = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

    // SVG Ring Math
    const r = 42;
    const circ = 2 * Math.PI * r;
    const strokeDashoffset = circ * (1 - progress);

    // Color Theme based on Pomodoro State
    let stateTitle = 'Focus Session';
    let stateColor = '#3b82f6'; // Blue
    let Icon = Flame;

    if (state === 'short_break') {
        stateTitle = 'Short Break';
        stateColor = '#0ea5e9'; // Sky Blue
        Icon = Coffee;
    } else if (state === 'long_break') {
        stateTitle = 'Long Break';
        stateColor = '#10b981'; // Emerald Green
        Icon = Sparkles;
    } else if (state === 'paused') {
        stateTitle = 'Paused';
        stateColor = '#f59e0b'; // Amber
        Icon = Flame;
    } else if (state === 'idle') {
        stateTitle = 'Ready to Focus';
        stateColor = 'var(--accent-color)';
        Icon = Flame;
    }

    const isRunning = state === 'focus' || state === 'short_break' || state === 'long_break';

    return (
        <div className="glass-panel p-4 flex flex-col justify-between items-center w-full h-full min-h-0 overflow-hidden relative select-none">
            {/* Header Badge */}
            <div className="flex items-center justify-between w-full border-b border-white/10 pb-2 mb-1">
                <div className="flex items-center gap-1.5">
                    <Icon className="w-4 h-4" style={{ color: stateColor }} />
                    <span className="text-xs font-bold uppercase tracking-wider text-white/90">{stateTitle}</span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/10 text-white/60">
                    Session {(completedSessions % longBreakInterval) + 1}/{longBreakInterval}
                </span>
            </div>

            {/* Circular Progress & MM:SS Timer */}
            <div className="relative w-36 h-36 flex items-center justify-center my-1">
                <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90 pointer-events-none">
                    <circle cx="50" cy="50" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="6" />
                    <circle
                        cx="50"
                        cy="50"
                        r={r}
                        fill="none"
                        stroke={stateColor}
                        strokeWidth="6"
                        strokeDasharray={circ}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                        className="transition-all duration-1000 origin-center"
                        style={{ filter: `drop-shadow(0 0 6px ${stateColor})` }}
                    />
                </svg>

                <div className="absolute flex flex-col items-center justify-center text-center">
                    <span className="text-3xl font-black font-mono tracking-tight text-white drop-shadow-md">
                        {timeDisplay}
                    </span>
                    <span className="text-[9px] uppercase tracking-widest text-white/50 font-semibold mt-0.5">
                        {isRunning ? 'Running' : state.toUpperCase()}
                    </span>
                </div>
            </div>

            {/* Timer Controls Bar */}
            <div className="flex items-center justify-center gap-3 w-full pt-1 border-t border-white/10">
                {/* Play / Pause Toggle */}
                {isRunning ? (
                    <button
                        type="button"
                        onClick={onPause}
                        className="p-2 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/40 transition-all shadow-md"
                        title="Pause Timer"
                    >
                        <Pause className="w-4 h-4" />
                    </button>
                ) : (
                    <button
                        type="button"
                        onClick={onStart}
                        className="p-2 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/40 transition-all shadow-md"
                        title="Start Pomodoro"
                    >
                        <Play className="w-4 h-4 ml-0.5" />
                    </button>
                )}

                {/* Skip Phase */}
                <button
                    type="button"
                    onClick={onSkip}
                    className="p-2 rounded-full bg-white/10 text-white/80 border border-white/10 hover:bg-white/20 transition-all"
                    title="Skip to Next Phase"
                >
                    <SkipForward className="w-4 h-4" />
                </button>

                {/* Reset Timer */}
                <button
                    type="button"
                    onClick={onReset}
                    className="p-2 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/30 transition-all"
                    title="Reset Session"
                >
                    <RotateCcw className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
};

export default PomodoroWidget;
