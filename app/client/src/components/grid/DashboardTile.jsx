import React, { useState } from 'react';
import { GripVertical, Plus, Minus, Trash2, BoxSelect } from 'lucide-react';

const DashboardTile = ({ tile, isEditMode, isAutoFlow, onMoveTile, onUpdateSpan, onRemoveTile, children }) => {
    const [isDragging, setIsDragging] = useState(false);
    const [isDragOver, setIsDragOver] = useState(false);

    // HTML5 Drag Handlers
    const handleDragStart = (e) => {
        if (!isEditMode) return;
        setIsDragging(true);
        window.__ACTIVE_DRAGGED_TILE_ID__ = tile.id;
        e.dataTransfer.setData('text/plain', tile.id);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragEnd = () => {
        setIsDragging(false);
        setIsDragOver(false);
        window.__ACTIVE_DRAGGED_TILE_ID__ = null;
    };

    const handleColSpanChange = (delta) => {
        onUpdateSpan(tile.id, tile.colSpan + delta, tile.rowSpan);
    };

    const handleRowSpanChange = (delta) => {
        onUpdateSpan(tile.id, tile.colSpan, tile.rowSpan + delta);
    };

    // Calculate tile coordinate range badge: e.g. R2-R5:C1-C3
    const rowStart = tile.rowStart || 1;
    const rowEnd = rowStart + tile.rowSpan - 1;
    const colStart = tile.colStart || 1;
    const colEnd = colStart + tile.colSpan - 1;

    const rowRangeStr = rowStart === rowEnd ? `R${rowStart}` : `R${rowStart}-R${rowEnd}`;
    const colRangeStr = colStart === colEnd ? `C${colStart}` : `C${colStart}-C${colEnd}`;
    const rangeBadge = `${rowRangeStr}:${colRangeStr}`;

    const gridStyle = isAutoFlow
        ? {
            gridColumn: `span ${tile.colSpan}`,
            gridRow: `span ${tile.rowSpan}`
          }
        : {
            gridColumn: `${tile.colStart || 'auto'} / span ${tile.colSpan}`,
            gridRow: `${tile.rowStart || 'auto'} / span ${tile.rowSpan}`
          };

    // Invisible placeholder in Live Mode for spacer blocks
    if (tile.isSpacer && !isEditMode) {
        return (
            <div
                style={gridStyle}
                className="pointer-events-none bg-transparent"
            />
        );
    }

    return (
        <div
            style={gridStyle}
            draggable={isEditMode}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            className={`group relative flex flex-col rounded-2xl transition-all duration-300 ${
                isEditMode
                    ? tile.isSpacer
                        ? 'border-2 border-dashed border-purple-500/60 bg-purple-950/20 shadow-lg shadow-purple-500/10 cursor-grab active:cursor-grabbing'
                        : 'border-2 border-dashed border-cyan-500/60 bg-black/50 shadow-lg shadow-cyan-500/10 cursor-grab active:cursor-grabbing'
                    : 'bg-transparent'
            } ${isDragging ? 'opacity-40 scale-95' : 'opacity-100'}`}
        >
            {/* Edit Mode Header Overlay */}
            {isEditMode && (
                <div className="absolute top-2 left-2 right-2 z-30 flex items-center justify-between px-3 py-1.5 rounded-xl bg-black/90 backdrop-blur-md border border-white/20 text-white text-xs font-semibold select-none shadow-md">
                    <div className="flex items-center gap-2">
                        <GripVertical className={`w-4 h-4 cursor-grab ${tile.isSpacer ? 'text-purple-400' : 'text-cyan-400'}`} />
                        <span className="truncate max-w-[100px]">{tile.title}</span>
                        {!isAutoFlow && (
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                                {rangeBadge}
                            </span>
                        )}
                    </div>

                    {/* Span Adjuster & Action Controls */}
                    <div className="flex items-center gap-2">
                        {/* Width Controls */}
                        <div className="flex items-center gap-1 bg-white/10 px-1.5 py-0.5 rounded-lg" title="Width (Columns)">
                            <span className="text-[10px] text-gray-400 uppercase">W</span>
                            <button
                                type="button"
                                onClick={() => handleColSpanChange(-1)}
                                disabled={tile.colSpan <= (tile.minColSpan || 1)}
                                className="p-0.5 hover:bg-white/20 rounded disabled:opacity-30"
                            >
                                <Minus className="w-3 h-3" />
                            </button>
                            <span className="w-4 text-center font-mono text-cyan-300">{tile.colSpan}</span>
                            <button
                                type="button"
                                onClick={() => handleColSpanChange(1)}
                                disabled={tile.colSpan >= 12}
                                className="p-0.5 hover:bg-white/20 rounded disabled:opacity-30"
                            >
                                <Plus className="w-3 h-3" />
                            </button>
                        </div>

                        {/* Height Controls */}
                        <div className="flex items-center gap-1 bg-white/10 px-1.5 py-0.5 rounded-lg" title="Height (Rows)">
                            <span className="text-[10px] text-gray-400 uppercase">H</span>
                            <button
                                type="button"
                                onClick={() => handleRowSpanChange(-1)}
                                disabled={tile.rowSpan <= (tile.minRowSpan || 1)}
                                className="p-0.5 hover:bg-white/20 rounded disabled:opacity-30"
                            >
                                <Minus className="w-3 h-3" />
                            </button>
                            <span className="w-4 text-center font-mono text-cyan-300">{tile.rowSpan}</span>
                            <button
                                type="button"
                                onClick={() => handleRowSpanChange(1)}
                                disabled={tile.rowSpan >= 12}
                                className="p-0.5 hover:bg-white/20 rounded disabled:opacity-30"
                            >
                                <Plus className="w-3 h-3" />
                            </button>
                        </div>

                        {/* Delete Tile Button */}
                        {onRemoveTile && (
                            <button
                                type="button"
                                onClick={() => onRemoveTile(tile.id)}
                                className="p-1 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors ml-1"
                                title="Remove Block"
                            >
                                <Trash2 className="w-3.5 h-3.5" />
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* Tile Content Wrapper / Spacer Preview */}
            {tile.isSpacer ? (
                <div className="w-full h-full flex flex-col justify-center items-center text-purple-300/60 p-4 border border-dashed border-purple-500/20 rounded-xl m-1">
                    <BoxSelect className="w-6 h-6 mb-1 opacity-60" />
                    <span className="text-xs font-mono">Blank Spacer Block</span>
                </div>
            ) : (
                <div className={`w-full h-full flex flex-col min-h-0 overflow-hidden ${isEditMode ? 'pt-10 pointer-events-none' : ''}`}>
                    {children}
                </div>
            )}
        </div>
    );
};

export default DashboardTile;
