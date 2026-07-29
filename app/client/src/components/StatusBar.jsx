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

const StatusBar = () => {
    return (
        <header className="flex justify-between items-center px-4 py-2 w-full text-sm font-medium z-10 glass-panel mb-6 rounded-full shrink-0 relative">
            <div className="flex items-center gap-3">
                <span className="text-white/90 font-bold tracking-wider uppercase text-xs">ProdBoard v1.1</span>
            </div>
            <div className="absolute left-1/2 -translate-x-1/2 font-medium text-white/80 text-sm tracking-wide">
                <DateHeader />
            </div>
            <div className="flex items-center gap-4">
                <PingStatus />
                <span className="text-white/80"><ClockHeader /></span>
            </div>
        </header>
    );
};

export default StatusBar;
