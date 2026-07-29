import React from 'react';

const CalendarFilterLegend = ({ calendars, hiddenCalendars, onToggleCalendar }) => {
    if (!calendars || calendars.length === 0) return null;

    return (
        <div className="flex flex-wrap items-center gap-2 mb-3 px-1">
            <span className="text-[10px] uppercase font-bold text-white/40 tracking-wider mr-1">Calendars:</span>
            {calendars.map((cal, idx) => {
                const isHidden = hiddenCalendars.includes(cal.name);
                return (
                    <button
                        key={idx}
                        onClick={() => onToggleCalendar(cal.name)}
                        className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium transition-all duration-200 border ${
                            isHidden
                                ? 'bg-white/5 border-white/10 text-white/30 line-through opacity-60'
                                : 'bg-white/10 border-white/20 text-white/90 shadow-sm hover:bg-white/20'
                        }`}
                    >
                        <span
                            className="w-2 h-2 rounded-full shrink-0"
                            style={{
                                backgroundColor: isHidden ? '#64748b' : cal.color,
                                boxShadow: isHidden ? 'none' : `0 0 6px ${cal.color}`
                            }}
                        />
                        <span>{cal.name}</span>
                    </button>
                );
            })}
        </div>
    );
};

export default CalendarFilterLegend;
