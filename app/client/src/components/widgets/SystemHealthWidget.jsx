import { useState, useEffect } from 'react';

const SystemHealthWidget = () => {
    const [sysInfo, setSysInfo] = useState({ cpu: 'Loading...', status: 'Checking' });

    useEffect(() => {
        const fetchSys = async () => {
            try {
                const res = await fetch('/api/system');
                if (res.ok) {
                    const data = await res.json();
                    let status = 'Nominal';
                    if (data.memory && data.memory.usagePercent > 90) status = 'High Load';
                    setSysInfo({ cpu: data.cpu, status: status });
                } else {
                    setSysInfo({ cpu: 'Unknown', status: 'Offline' });
                }
            } catch (err) {
                setSysInfo({ cpu: 'Unknown', status: 'Error' });
            }
        };
        fetchSys();
        const interval = setInterval(fetchSys, 60 * 1000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="glass-panel p-5 flex flex-col justify-between w-full h-full">
            <h3 className="text-white/60 font-medium tracking-wide text-xs uppercase">System</h3>
            <div className="text-xl font-bold mt-2 truncate" style={{ color: 'var(--accent-color)' }}>{sysInfo.status}</div>
            <p className="text-xs text-white/40 mt-1 truncate">{sysInfo.cpu}</p>
        </div>
    );
};

export default SystemHealthWidget;
