import { useState, useEffect } from 'react';
import CalendarFilterLegend from './CalendarFilterLegend';

const CalendarWidget = ({ calendars, setCalendars, hiddenCalendars, onToggleCalendar }) => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [disabled, setDisabled] = useState(false);

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const res = await fetch('/api/calendar/today');
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
                console.error('Calendar error:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchEvents();
        const interval = setInterval(fetchEvents, 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, [setCalendars]);

    if (disabled) return null;

    const visibleEvents = events.filter(evt => !evt.calendarName || !hiddenCalendars.includes(evt.calendarName));

    return (
        <div className="glass-panel p-4 flex flex-col h-full w-full min-h-0 overflow-hidden">
            <div className="flex justify-between items-center mb-1.5 border-b border-white/10 pb-2 shrink-0">
                <h2 className="text-base font-semibold text-white/80">Today's Schedule</h2>
                <span className="text-xs font-mono text-white/40">{visibleEvents.length} events</span>
            </div>

            <div className="shrink-0 mb-1">
                <CalendarFilterLegend calendars={calendars} hiddenCalendars={hiddenCalendars} onToggleCalendar={onToggleCalendar} />
            </div>

            <div className="space-y-2 overflow-y-auto flex-1 min-h-0 hidden-scrollbar rounded-xl pr-1">
                {loading ? (
                    <p className="text-white/40 text-xs">Loading schedule...</p>
                ) : visibleEvents.length === 0 ? (
                    <p className="text-white/40 text-xs">No upcoming events today.</p>
                ) : (
                    visibleEvents.map((evt, i) => {
                        const startInfo = evt.start?.dateTime || evt.start?.date;
                        const endInfo = evt.end?.dateTime || evt.end?.date;
                        const isDateOnly = !evt.start?.dateTime;
                        const startStr = startInfo ? new Date(startInfo).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }) : '';
                        const endStr = endInfo && !isDateOnly ? new Date(endInfo).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }) : '';
                        const badgeColor = evt.calendarColor || 'var(--accent-color)';

                        return (
                            <div key={i} className="flex flex-col p-2.5 bg-white/5 rounded-xl border-l-4 transition-all duration-200" style={{ borderColor: badgeColor }}>
                                <div className="flex justify-between items-center gap-2">
                                    <span className="font-bold text-xs text-white/90 truncate">{evt.summary}</span>
                                    {evt.calendarName && (
                                        <span className="text-[9px] px-1.5 py-0.5 rounded-full font-medium shrink-0 bg-white/10 text-white/70" style={{ color: badgeColor }}>
                                            {evt.calendarName}
                                        </span>
                                    )}
                                </div>
                                <span className="text-white/50 text-[11px] mt-0.5">
                                    {isDateOnly ? 'All Day' : `${startStr}${endStr ? ` - ${endStr}` : ''}`}
                                </span>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default CalendarWidget;
