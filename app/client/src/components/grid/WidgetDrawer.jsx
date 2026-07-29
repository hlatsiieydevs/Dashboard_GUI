import React, { useState } from 'react';
import { CATALOG_WIDGETS } from '../../hooks/useTileLayout';
import {
    ChevronDown,
    ChevronUp,
    Plus,
    Clock,
    Calendar,
    List,
    CloudSun,
    Activity,
    Square,
    Layers
} from 'lucide-react';

const ICON_MAP = {
    Clock: Clock,
    Calendar: Calendar,
    List: List,
    CloudSun: CloudSun,
    Activity: Activity,
    Square: Square
};

const WidgetDrawer = ({ isEditMode, activeTiles, onAddWidget }) => {
    const [isMinimized, setIsMinimized] = useState(false);

    if (!isEditMode) return null;

    // Helper to count active instances of widget type
    const getActiveCount = (widgetType) => {
        return activeTiles.filter(t => t.widgetType === widgetType || t.id.startsWith(widgetType)).length;
    };

    return (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 select-none max-w-4xl w-[92vw] sm:w-[85vw]">
            <div className="relative rounded-2xl bg-black/80 backdrop-blur-xl border border-white/20 shadow-2xl shadow-cyan-500/20 overflow-hidden">
                {/* Drawer Header Bar */}
                <div className="flex items-center justify-between px-4 py-2.5 bg-white/5 border-b border-white/10">
                    <div className="flex items-center gap-2">
                        <Layers className="w-4 h-4 text-cyan-400" />
                        <span className="text-xs font-bold uppercase tracking-wider text-white">Widget Library & Catalog</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300">
                            {activeTiles.length} Active Tile(s)
                        </span>
                    </div>

                    <button
                        type="button"
                        onClick={() => setIsMinimized(prev => !prev)}
                        className="flex items-center gap-1 text-xs font-medium text-white/70 hover:text-white px-2 py-1 rounded-lg hover:bg-white/10 transition-colors"
                    >
                        <span>{isMinimized ? 'Expand' : 'Minimize'}</span>
                        {isMinimized ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                </div>

                {/* Drawer Body - Widget Cards */}
                {!isMinimized && (
                    <div className="p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 overflow-x-auto max-h-[160px] hidden-scrollbar">
                        {CATALOG_WIDGETS.map((item) => {
                            const IconComponent = ICON_MAP[item.icon] || Square;
                            const activeCount = getActiveCount(item.id);

                            return (
                                <div
                                    key={item.id}
                                    className="flex flex-col justify-between items-center p-2.5 rounded-xl bg-white/5 border border-white/10 hover:border-cyan-500/50 hover:bg-cyan-950/20 transition-all group"
                                >
                                    <div className="flex items-center gap-2 text-white/80 group-hover:text-cyan-300 w-full mb-2">
                                        <IconComponent className="w-4 h-4 shrink-0 text-cyan-400" />
                                        <span className="text-xs font-semibold truncate">{item.title}</span>
                                    </div>

                                    <div className="flex items-center justify-between w-full mt-1">
                                        <span className="text-[10px] text-cyan-300/80 font-mono" title="Minimum Placement Dimensions">
                                            Min: {item.minColSpan}x{item.minRowSpan}
                                        </span>

                                        <button
                                            type="button"
                                            onClick={() => onAddWidget(item.id)}
                                            className="flex items-center gap-1 px-2 py-1 rounded-lg bg-cyan-500/20 hover:bg-cyan-500 text-cyan-300 hover:text-black font-semibold text-[10px] transition-all"
                                        >
                                            <Plus className="w-3 h-3" />
                                            <span>Add</span>
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default WidgetDrawer;
