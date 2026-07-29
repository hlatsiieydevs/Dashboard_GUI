import { useState, useEffect } from 'react';

const HeroClock = () => {
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="glass-panel p-10 flex flex-col justify-center items-center pointer-events-auto w-fit mx-auto">
            <h1 className="text-8xl font-black tracking-tighter leading-none" style={{ color: 'var(--accent-color)' }}>
                {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
            </h1>
        </div>
    );
};

export default HeroClock;
