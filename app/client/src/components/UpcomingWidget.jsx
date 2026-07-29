import { useState, useEffect, useRef } from 'react';

const UpcomingWidget = ({ calendars, setCalendars, hiddenCalendars }) => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [disabled, setDisabled] = useState(false);
    const scrollContainerRef = useRef(null);

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const res = await fetch('/api/calendar/upcoming');
                if (res.ok) {
                    const data = await res.json();
                    if (data.disabled) {
                        setDisabled(true);
                    } else {
                        setEvents(Array.isArray(data.items) ? data.items : []);
                        if (Array.isArray(data.calendars) && data.calendars.length > 0 && setCalendars) {
                            setCalendars(prev => {
                                const existingNames = new Set(prev.map(c => c.name));
                                const updated = [...prev];
                                data.calendars.forEach(c => {
                                    if (!existingNames.has(c.name)) updated.push(c);
                                });
                                return updated;
                            });
                        }
                    }
                }
            } catch (err) {
                console.error('Upcoming calendar error:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchEvents();
        const interval = setInterval(fetchEvents, 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, [setCalendars]);

    useEffect(() => {
        if (!scrollContainerRef.current || events.length === 0) return;
        let animationId;
        let scrollPos = 0;
        let direction = 1;

        const animateScroll = () => {
            const el = scrollContainerRef.current;
            if (!el) return;
            const maxScroll = el.scrollHeight - el.clientHeight;
            if (maxScroll > 0) {
                scrollPos += direction * 0.3;
                if (scrollPos >= maxScroll + 50) {
                    scrollPos = maxScroll + 50;
                    direction = -1;
                } else if (scrollPos <= -50) {
                    scrollPos = -50;
                    direction = 1;
                }
                el.scrollTop = Math.max(0, Math.min(scrollPos, maxScroll));
            }
            animationId = requestAnimationFrame(animateScroll);
        };
        const timer = setTimeout(() => { animationId = requestAnimationFrame(animateScroll); }, 2000);
        return () => {
            clearTimeout(timer);
            cancelAnimationFrame(animationId);
        };
    }, [events]);

    if (disabled) return null;

    const visibleEvents = events.filter(evt => !evt.calendarName || !hiddenCalendars.includes(evt.calendarName));

    return (
        <div className="glass-panel p-6 flex flex-col flex-1 overflow-hidden min-h-[300px]">
            <div className="flex justify-between items-center mb-4 border-b border-white/10 pb-3 shrink-0">
                <h2 className="text-lg font-semibold text-white/80">In the next few days</h2>
                <span className="text-xs font-mono text-white/40">{visibleEvents.length} events</span>
            </div>
            <div className="flex-1 overflow-hidden relative w-full h-full mask-edges-vertical">
                <div ref={scrollContainerRef} className="h-full overflow-y-auto hidden-scrollbar pb-6 space-y-3">
                    {loading ? (
                        <p className="text-white/40 text-sm">Loading upcoming...</p>
                    ) : visibleEvents.length === 0 ? (
                        <p className="text-white/40 text-sm">No upcoming events this week.</p>
                    ) : (
                        visibleEvents.map((evt, i) => {
                            const startInfo = evt.start?.dateTime || evt.start?.date;
                            const startDate = new Date(startInfo);
                            const isDateOnly = !evt.start?.dateTime;

                            const dayStr = startDate.toLocaleDateString('en-ZA', { weekday: 'short', month: 'short', day: 'numeric' });
                            let timeStr = 'All Day';

                            if (!isDateOnly && evt.start?.dateTime) {
                                const endInfo = evt.end?.dateTime || evt.end?.date;
                                const startT = startDate.toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit', hour12: false });
                                const endT = endInfo ? new Date(endInfo).toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit', hour12: false }) : '';
                                timeStr = `${startT}${endT ? ` - ${endT}` : ''}`;
                            }

                            const borderColor = evt.isHoliday ? '#f59e0b' : (evt.calendarColor || 'var(--accent-color)');

                            return (
                                <div key={i} className="flex flex-col p-3 bg-white/5 rounded-xl border-l-4 shrink-0 relative transition-all duration-200" style={{ borderColor }}>
                                    <div className="flex justify-between items-center gap-2">
                                        <span className="font-bold text-sm text-white/90 truncate">{evt.summary}</span>
                                        {evt.calendarName && (
                                            <span className="text-[10px] px-2 py-0.5 rounded-full font-medium shrink-0 bg-white/10 text-white/70" style={{ color: borderColor }}>
                                                {evt.calendarName}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex justify-between mt-1 items-center">
                                        <span className="text-white/50 text-xs">{dayStr}</span>
                                        <span className="text-white/40 text-xs">{timeStr}</span>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
};

export default UpcomingWidget;
