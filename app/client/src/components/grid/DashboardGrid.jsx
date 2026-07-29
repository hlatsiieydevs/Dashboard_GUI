import React, { useState, useRef } from 'react';
import { checkTileCollision } from '../../hooks/useTileLayout';

const DashboardGrid = ({ children, isEditMode, isAutoFlow, tiles, onMoveTile }) => {
    const gridRows = 12;
    const gridCols = 12;
    const gridRef = useRef(null);

    const [dragHoverTarget, setDragHoverTarget] = useState(null);

    const getActiveDraggedId = (e) => {
        return e.dataTransfer.getData('text/plain') || window.__ACTIVE_DRAGGED_TILE_ID__;
    };

    // Calculate Grid Cell (col, row) directly from mouse client coordinates
    const calculateGridCellFromPointer = (clientX, clientY) => {
        if (!gridRef.current) return { colStart: 1, rowStart: 1 };
        const rect = gridRef.current.getBoundingClientRect();
        const relativeX = clientX - rect.left;
        const relativeY = clientY - rect.top;

        const colWidth = rect.width / 12;
        const rowHeight = 96; // 80px cell + 16px gap

        const col = Math.max(1, Math.min(12, Math.floor(relativeX / colWidth) + 1));
        const row = Math.max(1, Math.min(20, Math.floor(relativeY / rowHeight) + 1));

        return { colStart: col, rowStart: row };
    };

    const handleGridDrop = (e) => {
        if (isAutoFlow || !isEditMode) return;
        e.preventDefault();
        setDragHoverTarget(null);

        const draggedId = getActiveDraggedId(e);
        if (!draggedId) return;

        const cell = calculateGridCellFromPointer(e.clientX, e.clientY);
        onMoveTile(draggedId, null, { colStart: cell.colStart, rowStart: cell.rowStart });
    };

    const handleGridDragOver = (e) => {
        if (!isAutoFlow && isEditMode) {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';

            const draggedId = getActiveDraggedId(e);
            const draggedTile = tiles.find(t => t.id === draggedId);
            
            const colSpan = draggedTile ? draggedTile.colSpan : 3;
            const rowSpan = draggedTile ? draggedTile.rowSpan : 3;

            const cell = calculateGridCellFromPointer(e.clientX, e.clientY);
            const colStart = Math.max(1, Math.min(12 - colSpan + 1, cell.colStart));
            const rowStart = Math.max(1, cell.rowStart);

            const isColliding = checkTileCollision(draggedId, colStart, rowStart, colSpan, rowSpan, tiles);

            setDragHoverTarget({
                colStart,
                rowStart,
                colSpan,
                rowSpan,
                isColliding
            });
        }
    };

    const handleDragLeaveGrid = () => {
        setDragHoverTarget(null);
    };

    return (
        <div
            ref={gridRef}
            onDragOver={handleGridDragOver}
            onDrop={handleGridDrop}
            onDragLeave={handleDragLeaveGrid}
            className="relative w-full flex-1 overflow-y-auto hidden-scrollbar p-2 select-none"
        >
            {/* 2D Blueprint Grid Matrix Overlay when in Edit Mode */}
            {isEditMode && (
                <div className="absolute inset-0 grid grid-cols-12 auto-rows-[80px] gap-4 pointer-events-none z-0 p-2 opacity-30">
                    {[...Array(gridRows)].map((_, rIdx) => {
                        const rowNum = rIdx + 1;
                        return [...Array(gridCols)].map((_, cIdx) => {
                            const colNum = cIdx + 1;
                            return (
                                <div
                                    key={`cell_${rowNum}_${colNum}`}
                                    className="border border-dashed border-cyan-400/30 rounded-xl bg-cyan-950/10 flex flex-col justify-between p-1.5 transition-colors"
                                >
                                    <div className="flex justify-between items-center text-[9px] font-mono text-cyan-300/60 select-none">
                                        <span>R{rowNum}</span>
                                        <span>C{colNum}</span>
                                    </div>
                                    <div className="text-center text-[8px] font-mono text-white/30">
                                        {rowNum}x{colNum}
                                    </div>
                                </div>
                            );
                        });
                    })}
                </div>
            )}

            {/* Live Placement Target Box (Green if clear, Amber if swapping) */}
            {isEditMode && !isAutoFlow && dragHoverTarget && (
                <div
                    style={{
                        gridColumn: `${dragHoverTarget.colStart} / span ${dragHoverTarget.colSpan}`,
                        gridRow: `${dragHoverTarget.rowStart} / span ${dragHoverTarget.rowSpan}`
                    }}
                    className={`pointer-events-none z-20 rounded-2xl transition-all duration-100 border-4 border-dashed animate-pulse ${
                        dragHoverTarget.isColliding
                            ? 'border-amber-400 bg-amber-500/20 shadow-xl shadow-amber-500/40 ring-4 ring-amber-400/50'
                            : 'border-emerald-400 bg-emerald-500/20 shadow-xl shadow-emerald-500/40 ring-4 ring-emerald-400/50'
                    }`}
                >
                    <div className="w-full h-full flex items-center justify-center font-bold text-xs uppercase tracking-widest text-white shadow-sm">
                        {dragHoverTarget.isColliding ? '🔄 Swap Positions' : '✅ Clear Space'}
                    </div>
                </div>
            )}

            {/* Main 12-Column Responsive Grid Container */}
            <div
                className={`grid grid-cols-12 auto-rows-[80px] gap-4 w-full h-full relative z-10 ${
                    isAutoFlow ? 'grid-flow-row-dense' : ''
                }`}
            >
                {children}
            </div>
        </div>
    );
};

export default DashboardGrid;
