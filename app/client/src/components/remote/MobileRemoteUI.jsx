import React, { useState } from 'react';
import { Moon, Flame, Layout, Play, Pause, SkipForward, RotateCcw, Sliders, CheckCircle2 } from 'lucide-react';

const MobileRemoteUI = ({ modeState, onModeChange, onPomodoroAction, onUpdateParams }) => {
    const { mode = 'normal', pomodoro = {} } = modeState || {};
    const {
        workDuration = 25,
        shortBreakDuration = 5,
        longBreakDuration = 15,
        longBreakInterval = 4,
        state = 'idle',
        timeRemaining = 25 * 60,
        completedSessions = 0
    } = pomodoro;

    const [workInput, setWorkInput] = useState(workDuration);
    const [shortInput, setShortInput] = useState(shortBreakDuration);
    const [longInput, setLongInput] = useState(longBreakDuration);
    const [savedNotice, setSavedNotice] = useState(false);

    const mins = Math.floor(timeRemaining / 60);
    const secs = timeRemaining % 60;
    const timeDisplay = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

    const handleSaveParams = (e) => {
        e.preventDefault();
        onUpdateParams({
            workDuration: Number(workInput),
            shortBreakDuration: Number(shortInput),
            longBreakDuration: Number(longInput)
        });
        setSavedNotice(true);
        setTimeout(() => setSavedNotice(false), 2000);
    };

    const isRunning = state === 'focus' || state === 'short_break' || state === 'long_break';

    return (
        <div className="min-h-screen w-full bg-slate-950 text-white flex flex-col items-center p-4 select-none font-sans pb-12">
            {/* Header */}
            <header className="w-full max-w-md flex items-center justify-between py-4 border-b border-slate-800 mb-6">
                <div>
                    <h1 className="text-xl font-black tracking-tight text-white flex items-center gap-2">
                        <Sliders className="w-5 h-5 text-cyan-400" />
                        <span>ProdBoard Remote</span>
                    </h1>
                    <p className="text-xs text-slate-400 mt-0.5">Mobile Control Panel</p>
                </div>
                <div className="px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-xs font-mono text-cyan-300">
                    Mode: <span className="uppercase font-bold text-white">{mode}</span>
                </div>
            </header>

            <main className="w-full max-w-md flex flex-col gap-6">
                {/* 1. Mode Selector */}
                <section>
                    <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 px-1">
                        Select Mode
                    </h2>
                    <div className="grid grid-cols-3 gap-3">
                        {/* Normal Mode Card */}
                        <button
                            type="button"
                            onClick={() => onModeChange('normal')}
                            className={`flex flex-col items-center p-4 rounded-2xl border transition-all ${
                                mode === 'normal'
                                    ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200 ring-2 ring-cyan-500/50 shadow-lg shadow-cyan-500/20'
                                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                            }`}
                        >
                            <Layout className="w-6 h-6 mb-2 text-cyan-400" />
                            <span className="text-xs font-bold">Normal</span>
                        </button>

                        {/* Grind / Work Mode Card */}
                        <button
                            type="button"
                            onClick={() => onModeChange('grind')}
                            className={`flex flex-col items-center p-4 rounded-2xl border transition-all ${
                                mode === 'grind'
                                    ? 'bg-amber-500/20 border-amber-400 text-amber-200 ring-2 ring-amber-500/50 shadow-lg shadow-amber-500/20'
                                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                            }`}
                        >
                            <Flame className="w-6 h-6 mb-2 text-amber-400" />
                            <span className="text-xs font-bold">Grind</span>
                        </button>

                        {/* Sleep Mode Card */}
                        <button
                            type="button"
                            onClick={() => onModeChange('sleep')}
                            className={`flex flex-col items-center p-4 rounded-2xl border transition-all ${
                                mode === 'sleep'
                                    ? 'bg-purple-500/20 border-purple-400 text-purple-200 ring-2 ring-purple-500/50 shadow-lg shadow-purple-500/20'
                                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                            }`}
                        >
                            <Moon className="w-6 h-6 mb-2 text-purple-400" />
                            <span className="text-xs font-bold">Sleep</span>
                        </button>
                    </div>
                </section>

                {/* 2. Pomodoro Remote Controls */}
                <section className="bg-slate-900 rounded-3xl p-5 border border-slate-800 shadow-xl flex flex-col items-center">
                    <div className="flex items-center justify-between w-full mb-4 pb-3 border-b border-slate-800">
                        <div className="flex items-center gap-2">
                            <Flame className="w-5 h-5 text-amber-400" />
                            <span className="font-bold text-sm text-slate-200">Pomodoro Focus Timer</span>
                        </div>
                        <span className="text-xs font-mono text-slate-400">
                            {state.toUpperCase()}
                        </span>
                    </div>

                    {/* Timer MM:SS Display */}
                    <div className="text-5xl font-black font-mono tracking-tight text-white mb-4 drop-shadow-md">
                        {timeDisplay}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-center gap-4 w-full">
                        {isRunning ? (
                            <button
                                type="button"
                                onClick={() => onPomodoroAction('pause')}
                                className="flex-1 py-3.5 px-4 rounded-2xl bg-amber-500 text-slate-950 font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/30 active:scale-95 transition-all"
                            >
                                <Pause className="w-4 h-4" />
                                <span>Pause</span>
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={() => onPomodoroAction('start')}
                                className="flex-1 py-3.5 px-4 rounded-2xl bg-emerald-500 text-slate-950 font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/30 active:scale-95 transition-all"
                            >
                                <Play className="w-4 h-4 ml-0.5" />
                                <span>Start Session</span>
                            </button>
                        )}

                        <button
                            type="button"
                            onClick={() => onPomodoroAction('skip')}
                            className="p-3.5 rounded-2xl bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700 active:scale-95 transition-all"
                            title="Skip Phase"
                        >
                            <SkipForward className="w-5 h-5" />
                        </button>

                        <button
                            type="button"
                            onClick={() => onPomodoroAction('reset')}
                            className="p-3.5 rounded-2xl bg-slate-800 border border-slate-700 text-red-400 hover:bg-slate-700 active:scale-95 transition-all"
                            title="Reset Timer"
                        >
                            <RotateCcw className="w-5 h-5" />
                        </button>
                    </div>
                </section>

                {/* 3. Pomodoro Parameter Settings */}
                <section className="bg-slate-900 rounded-3xl p-5 border border-slate-800 shadow-xl">
                    <h3 className="text-sm font-bold text-slate-200 mb-4 pb-2 border-b border-slate-800">
                        Pomodoro Parameters
                    </h3>

                    <form onSubmit={handleSaveParams} className="flex flex-col gap-4">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-semibold text-slate-400">Work Duration (Minutes)</label>
                            <input
                                type="number"
                                min="1"
                                max="120"
                                value={workInput}
                                onChange={(e) => setWorkInput(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm font-mono text-white focus:outline-none focus:border-cyan-500"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-semibold text-slate-400">Short Break (Mins)</label>
                                <input
                                    type="number"
                                    min="1"
                                    max="60"
                                    value={shortInput}
                                    onChange={(e) => setShortInput(e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm font-mono text-white focus:outline-none focus:border-cyan-500"
                                />
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-semibold text-slate-400">Long Break (Mins)</label>
                                <input
                                    type="number"
                                    min="1"
                                    max="60"
                                    value={longInput}
                                    onChange={(e) => setLongInput(e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm font-mono text-white focus:outline-none focus:border-cyan-500"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="mt-2 py-3 rounded-xl bg-cyan-500 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 active:scale-95 transition-all shadow-md shadow-cyan-500/20"
                        >
                            {savedNotice ? <CheckCircle2 className="w-4 h-4" /> : null}
                            <span>{savedNotice ? 'Saved & Applied!' : 'Apply Parameters'}</span>
                        </button>
                    </form>
                </section>
            </main>
        </div>
    );
};

export default MobileRemoteUI;
