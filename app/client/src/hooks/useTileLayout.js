import { useState, useEffect } from 'react';

export const CATALOG_WIDGETS = [
    { id: 'hero_clock', title: 'Hero Clock', defaultColSpan: 4, defaultRowSpan: 1, minColSpan: 4, minRowSpan: 1, icon: 'Clock' },
    { id: 'pomodoro', title: 'Pomodoro Timer', defaultColSpan: 3, defaultRowSpan: 3, minColSpan: 3, minRowSpan: 3, icon: 'Timer' },
    { id: 'calendar', title: 'Calendar Focus', defaultColSpan: 3, defaultRowSpan: 3, minColSpan: 3, minRowSpan: 3, icon: 'Calendar' },
    { id: 'upcoming', title: 'Upcoming Events', defaultColSpan: 3, defaultRowSpan: 3, minColSpan: 3, minRowSpan: 3, icon: 'List' },
    { id: 'weather_cluster', title: 'Weather Cluster', defaultColSpan: 3, defaultRowSpan: 3, minColSpan: 3, minRowSpan: 3, icon: 'CloudSun' },
    { id: 'system_health', title: 'System Health', defaultColSpan: 3, defaultRowSpan: 2, minColSpan: 3, minRowSpan: 2, icon: 'Activity' },
    { id: 'spacer', title: 'Blank Spacer', defaultColSpan: 1, defaultRowSpan: 1, minColSpan: 1, minRowSpan: 1, isSpacer: true, icon: 'Square' }
];

const DEFAULT_LAYOUT = [
    { id: 'hero_clock', widgetType: 'hero_clock', title: 'Hero Clock', colSpan: 4, rowSpan: 1, colStart: 5, rowStart: 1, minColSpan: 4, minRowSpan: 1 },
    { id: 'calendar', widgetType: 'calendar', title: 'Calendar Focus', colSpan: 3, rowSpan: 3, colStart: 1, rowStart: 2, minColSpan: 3, minRowSpan: 3 },
    { id: 'upcoming', widgetType: 'upcoming', title: 'Upcoming Events', colSpan: 3, rowSpan: 3, colStart: 1, rowStart: 5, minColSpan: 3, minRowSpan: 3 },
    { id: 'weather_cluster', widgetType: 'weather_cluster', title: 'Weather Cluster', colSpan: 3, rowSpan: 3, colStart: 10, rowStart: 2, minColSpan: 3, minRowSpan: 3 },
    { id: 'system_health', widgetType: 'system_health', title: 'System Health', colSpan: 3, rowSpan: 2, colStart: 10, rowStart: 5, minColSpan: 3, minRowSpan: 2 }
];

const LAYOUT_STORAGE_KEY = 'dashboard_tile_layout_v5';
const AUTOFLOW_STORAGE_KEY = 'dashboard_autoflow_v5';

// Check if target coordinate space overlaps with ANY other tile
export const checkTileCollision = (targetTileId, targetCol, targetRow, colSpan, rowSpan, allTiles) => {
    if (targetCol < 1 || (targetCol + colSpan - 1) > 12 || targetRow < 1) {
        return true;
    }

    const targetColEnd = targetCol + colSpan - 1;
    const targetRowEnd = targetRow + rowSpan - 1;

    for (const tile of allTiles) {
        if (tile.id === targetTileId) continue;

        const tileCol = tile.colStart || 1;
        const tileRow = tile.rowStart || 1;
        const tileColEnd = tileCol + tile.colSpan - 1;
        const tileRowEnd = tileRow + tile.rowSpan - 1;

        const overlapsCol = Math.max(targetCol, tileCol) <= Math.min(targetColEnd, tileColEnd);
        const overlapsRow = Math.max(targetRow, tileRow) <= Math.min(targetRowEnd, tileRowEnd);

        if (overlapsCol && overlapsRow) {
            return true;
        }
    }
    return false;
};

export const useTileLayout = () => {
    const [isEditMode, setIsEditMode] = useState(false);
    const [isAutoFlow, setIsAutoFlow] = useState(() => {
        try {
            const saved = localStorage.getItem(AUTOFLOW_STORAGE_KEY);
            return saved !== null ? JSON.parse(saved) : true;
        } catch (e) {
            return true;
        }
    });

    const [tiles, setTiles] = useState(() => {
        try {
            const saved = localStorage.getItem(LAYOUT_STORAGE_KEY);
            if (saved) {
                const parsed = JSON.parse(saved);
                return parsed;
            }
        } catch (e) {
            console.error('Failed to load tile layout from localStorage:', e);
        }
        return DEFAULT_LAYOUT;
    });

    useEffect(() => {
        try {
            localStorage.setItem(LAYOUT_STORAGE_KEY, JSON.stringify(tiles));
        } catch (e) {
            console.error('Failed to save tile layout to localStorage:', e);
        }
    }, [tiles]);

    useEffect(() => {
        try {
            localStorage.setItem(AUTOFLOW_STORAGE_KEY, JSON.stringify(isAutoFlow));
        } catch (e) {
            console.error('Failed to save autoflow setting to localStorage:', e);
        }
    }, [isAutoFlow]);

    const toggleEditMode = () => setIsEditMode(prev => !prev);
    const toggleAutoFlow = () => setIsAutoFlow(prev => !prev);

    const updateTileSpan = (id, newColSpan, newRowSpan) => {
        setTiles(prev =>
            prev.map(tile => {
                if (tile.id === id) {
                    const colSpan = Math.max(tile.minColSpan || 1, Math.min(12, newColSpan));
                    const rowSpan = Math.max(tile.minRowSpan || 1, Math.min(12, newRowSpan));
                    return { ...tile, colSpan, rowSpan };
                }
                return tile;
            })
        );
    };

    const updateTilePosition = (id, colStart, rowStart) => {
        setTiles(prev =>
            prev.map(tile => {
                if (tile.id === id) {
                    const safeColStart = Math.max(1, Math.min(12 - tile.colSpan + 1, colStart));
                    const safeRowStart = Math.max(1, Math.min(20, rowStart));
                    return { ...tile, colStart: safeColStart, rowStart: safeRowStart };
                }
                return tile;
            })
        );
    };

    const moveTile = (draggedId, targetId, dropCell = null) => {
        setTiles(prev => {
            const draggedTile = prev.find(t => t.id === draggedId);
            if (!draggedTile) return prev;

            if (isAutoFlow) {
                const targetTile = prev.find(t => t.id === targetId);
                const draggedIdx = prev.findIndex(t => t.id === draggedId);
                const targetIdx = targetTile ? prev.findIndex(t => t.id === targetId) : -1;
                if (draggedIdx === -1 || targetIdx === -1 || draggedIdx === targetIdx) return prev;

                const updated = [...prev];
                const [movedItem] = updated.splice(draggedIdx, 1);
                updated.splice(targetIdx, 0, movedItem);
                return updated;
            } else {
                // Free placement mode (supports placing on empty grid cell or swapping with occupied tile)
                if (dropCell) {
                    const targetCol = Math.max(1, Math.min(12 - draggedTile.colSpan + 1, dropCell.colStart));
                    const targetRow = Math.max(1, dropCell.rowStart);

                    const targetColEnd = targetCol + draggedTile.colSpan - 1;
                    const targetRowEnd = targetRow + draggedTile.rowSpan - 1;

                    // Find if any other tile overlaps this target bounding box
                    const collidingTile = prev.find(t => {
                        if (t.id === draggedId) return false;
                        const tCol = t.colStart || 1;
                        const tRow = t.rowStart || 1;
                        const tColEnd = tCol + t.colSpan - 1;
                        const tRowEnd = tRow + t.rowSpan - 1;

                        return Math.max(targetCol, tCol) <= Math.min(targetColEnd, tColEnd) &&
                               Math.max(targetRow, tRow) <= Math.min(targetRowEnd, tRowEnd);
                    });

                    if (collidingTile) {
                        // Swap position with colliding tile
                        const oldCol = draggedTile.colStart || 1;
                        const oldRow = draggedTile.rowStart || 1;

                        return prev.map(t => {
                            if (t.id === draggedId) {
                                return { ...t, colStart: targetCol, rowStart: targetRow };
                            }
                            if (t.id === collidingTile.id) {
                                return { ...t, colStart: oldCol, rowStart: oldRow };
                            }
                            return t;
                        });
                    } else {
                        // Move directly to target clear space
                        return prev.map(t => {
                            if (t.id === draggedId) {
                                return { ...t, colStart: targetCol, rowStart: targetRow };
                            }
                            return t;
                        });
                    }
                }

                if (targetId && targetId !== draggedId) {
                    const targetTile = prev.find(t => t.id === targetId);
                    if (targetTile) {
                        const oldCol = draggedTile.colStart || 1;
                        const oldRow = draggedTile.rowStart || 1;
                        const newCol = targetTile.colStart || 1;
                        const newRow = targetTile.rowStart || 1;

                        return prev.map(t => {
                            if (t.id === draggedId) {
                                return { ...t, colStart: newCol, rowStart: newRow };
                            }
                            if (t.id === targetId) {
                                return { ...t, colStart: oldCol, rowStart: oldRow };
                            }
                            return t;
                        });
                    }
                }

                return prev;
            }
        });
    };

    const addCatalogWidget = (widgetType) => {
        const cat = CATALOG_WIDGETS.find(w => w.id === widgetType);
        if (!cat) return;

        const newId = cat.isSpacer ? `spacer_${Date.now()}` : `${widgetType}_${Date.now()}`;
        
        let colStart = 1;
        let rowStart = 1;
        let found = false;

        for (let r = 1; r <= 15; r++) {
            for (let c = 1; c <= (12 - cat.defaultColSpan + 1); c++) {
                if (!checkTileCollision(newId, c, r, cat.defaultColSpan, cat.defaultRowSpan, tiles)) {
                    colStart = c;
                    rowStart = r;
                    found = true;
                    break;
                }
            }
            if (found) break;
        }

        const newTile = {
            id: newId,
            widgetType: cat.id,
            title: cat.title,
            isSpacer: !!cat.isSpacer,
            colSpan: cat.defaultColSpan,
            rowSpan: cat.defaultRowSpan,
            colStart,
            rowStart,
            minColSpan: cat.minColSpan,
            minRowSpan: cat.minRowSpan
        };

        setTiles(prev => [...prev, newTile]);
    };

    const removeTile = (id) => {
        setTiles(prev => prev.filter(t => t.id !== id));
    };

    const resetLayout = () => {
        setTiles(DEFAULT_LAYOUT);
        setIsAutoFlow(true);
        localStorage.removeItem(LAYOUT_STORAGE_KEY);
        localStorage.removeItem(AUTOFLOW_STORAGE_KEY);
    };

    return {
        tiles,
        isEditMode,
        isAutoFlow,
        toggleEditMode,
        toggleAutoFlow,
        updateTileSpan,
        updateTilePosition,
        moveTile,
        addCatalogWidget,
        removeTile,
        resetLayout
    };
};
