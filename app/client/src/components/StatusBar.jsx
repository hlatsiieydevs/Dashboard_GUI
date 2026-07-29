import { useState, useEffect } from 'react';

export const PingStatus = () => {
    const [statusColor, setStatusColor] = useState('#64748B');
    const [ping, setPing] = useState('--');

    useEffect(() => {
        const checkPing = async () => {
            try {
                const res = await fetch('/api/network/ping');
                if (res.ok) {
                    const data = await res.json();
                    switch (data.status) {
                        case 'Green': setStatusColor('#22C55E'); break;
                        case 'Amber': setStatusColor('#F59E0B'); break;
                        case 'Red': setStatusColor('#EF4444'); break;
                        default: setStatusColor('#64748B');
                    }
                    setPing(`${Math.round(data.time)}ms`);
                }
            } catch (e) {}
        };
        checkPing();
        const interval = setInterval(checkPing, 60000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="flex items-center gap-2 text-xs font-mono bg-black/40 px-3 py-1 rounded-full border border-white/5">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: statusColor, boxShadow: `0 0 8px ${statusColor}` }} />
            <span className="text-white/60">{ping}</span>
        </div>
    );
};

export const ClockHeader = () => {
    const [time, setTime] = useState(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }));
    useEffect(() => {
        const timer = setInterval(() => setTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })), 1000);
        return () => clearInterval(timer);
    }, []);
    return <span>{time}</span>;
};

export const DateHeader = () => {
    const [date, setDate] = useState(new Date());
    useEffect(() => {
        const timer = setInterval(() => setDate(new Date()), 60000);
        return () => clearInterval(timer);
    }, []);
    return <span>{date.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>;
};

import { LayoutGrid, Lock, RotateCcw, ArrowDownUp, Plus } from 'lucide-react';

const StatusBar = ({ isEditMode, isAutoFlow, onToggleEditMode, onToggleAutoFlow, onAddSpacer, onResetLayout }) => {
    return (
        <header className="flex justify-between items-center px-4 py-2 w-full text-sm font-medium z-10 glass-panel mb-4 rounded-full shrink-0 relative">
            <div className="flex items-center gap-3">
                <span className="text-white/90 font-bold tracking-wider uppercase text-xs">ProdBoard v1.1</span>
                
                {/* Layout Customize Controls */}
                <button
                    type="button"
                    onClick={onToggleEditMode}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all duration-300 ${
                        isEditMode
                            ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/30'
                            : 'bg-white/10 text-white/80 hover:bg-white/20'
                    }`}
                >
                    {isEditMode ? <LayoutGrid className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                    <span>{isEditMode ? 'Editing Layout' : 'Customize'}</span>
                </button>

                {isEditMode && (
                    <>
                        <button
                            type="button"
                            onClick={onToggleAutoFlow}
                            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                                isAutoFlow
                                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30'
                                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30'
                            }`}
                            title="Toggle Auto-Flow packing vs Free Grid positioning"
                        >
                            <ArrowDownUp className="w-3 h-3" />
                            <span>Auto-Flow: {isAutoFlow ? 'ON' : 'OFF (Free)'}</span>
                        </button>

                        <button
                            type="button"
                            onClick={onAddSpacer}
                            className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-purple-500/20 text-purple-300 border border-purple-500/30 hover:bg-purple-500/40 transition-colors"
                            title="Add a blank spacer block to pad or push widgets"
                        >
                            <Plus className="w-3 h-3" />
                            <span>Spacer</span>
                        </button>

                        <button
                            type="button"
                            onClick={onResetLayout}
                            className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-red-500/20 text-red-300 hover:bg-red-500/40 transition-colors"
                            title="Reset Layout to Default"
                        >
                            <RotateCcw className="w-3 h-3" />
                            <span>Reset</span>
                        </button>
                    </>
                )}
            </div>
            <div className="flex items-center gap-4">
                <PingStatus />
                <span className="text-white/80"><ClockHeader /></span>
            </div>
        </header>
    );
};

export default StatusBar;
