import { useState, useEffect, useRef } from 'react';

export const useDashboardModes = () => {
    const [modeState, setModeState] = useState({
        mode: 'normal',
        pomodoro: {
            workDuration: 25,
            shortBreakDuration: 5,
            longBreakDuration: 15,
            longBreakInterval: 4,
            state: 'idle', // 'idle' | 'focus' | 'short_break' | 'long_break' | 'paused'
            timeRemaining: 25 * 60,
            completedSessions: 0
        }
    });

    const [timerActive, setTimerActive] = useState(false);
    const timerRef = useRef(null);

    // 1. Subscribe to SSE Server Real-Time Stream
    useEffect(() => {
        let eventSource = null;
        try {
            eventSource = new EventSource('/api/modes/events');
            eventSource.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    setModeState(prev => ({
                        ...data,
                        pomodoro: { ...prev.pomodoro, ...data.pomodoro }
                    }));
                } catch (e) {}
            };
        } catch (e) {
            console.error('SSE Modes Stream Connection Error:', e);
        }
        return () => {
            if (eventSource) eventSource.close();
        };
    }, []);

    // 2. Pomodoro Ticker Countdown
    useEffect(() => {
        if (timerActive) {
            timerRef.current = setInterval(() => {
                setModeState(prev => {
                    const pom = prev.pomodoro;
                    if (pom.state !== 'focus' && pom.state !== 'short_break' && pom.state !== 'long_break') {
                        return prev;
                    }

                    if (pom.timeRemaining <= 1) {
                        // Phase completed transition
                        let nextState = 'focus';
                        let nextSessions = pom.completedSessions;
                        let nextDuration = pom.workDuration * 60;

                        if (pom.state === 'focus') {
                            nextSessions += 1;
                            if (nextSessions % pom.longBreakInterval === 0) {
                                nextState = 'long_break';
                                nextDuration = pom.longBreakDuration * 60;
                            } else {
                                nextState = 'short_break';
                                nextDuration = pom.shortBreakDuration * 60;
                            }
                        } else {
                            // Break completed -> return to focus
                            nextState = 'focus';
                            nextDuration = pom.workDuration * 60;
                        }

                        // Play alert chime
                        try {
                            const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
                            const osc = audioCtx.createOscillator();
                            const gain = audioCtx.createGain();
                            osc.connect(gain);
                            gain.connect(audioCtx.destination);
                            osc.frequency.value = nextState === 'focus' ? 880 : 523.25;
                            gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
                            osc.start();
                            osc.stop(audioCtx.currentTime + 0.4);
                        } catch (e) {}

                        return {
                            ...prev,
                            pomodoro: {
                                ...pom,
                                state: nextState,
                                timeRemaining: nextDuration,
                                completedSessions: nextSessions
                            }
                        };
                    }

                    return {
                        ...prev,
                        pomodoro: {
                            ...pom,
                            timeRemaining: pom.timeRemaining - 1
                        }
                    };
                });
            }, 1000);
        } else {
            if (timerRef.current) clearInterval(timerRef.current);
        }

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [timerActive]);

    // Send Mode / Pomodoro updates to backend API
    const syncStateToBackend = async (payload) => {
        try {
            await fetch('/api/modes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
        } catch (e) {
            console.error('Failed to sync mode state to server:', e);
        }
    };

    const changeMode = (newMode) => {
        const clean = newMode.toLowerCase();
        setModeState(prev => {
            let nextPomState = prev.pomodoro.state;
            if (clean === 'grind' && prev.pomodoro.state === 'idle') {
                nextPomState = 'focus';
                setTimerActive(true);
            }
            const updated = {
                ...prev,
                mode: clean,
                pomodoro: {
                    ...prev.pomodoro,
                    state: nextPomState
                }
            };
            syncStateToBackend({ mode: clean, pomodoro: { state: nextPomState } });
            return updated;
        });
    };

    const startPomodoro = () => {
        setTimerActive(true);
        setModeState(prev => {
            const nextState = prev.pomodoro.state === 'idle' || prev.pomodoro.state === 'paused' ? 'focus' : prev.pomodoro.state;
            const updated = {
                ...prev,
                mode: 'grind',
                pomodoro: { ...prev.pomodoro, state: nextState }
            };
            syncStateToBackend({ mode: 'grind', pomodoro: { state: nextState } });
            return updated;
        });
    };

    const pausePomodoro = () => {
        setTimerActive(false);
        setModeState(prev => {
            const updated = {
                ...prev,
                pomodoro: { ...prev.pomodoro, state: 'paused' }
            };
            syncStateToBackend({ pomodoro: { state: 'paused' } });
            return updated;
        });
    };

    const resetPomodoro = () => {
        setTimerActive(false);
        setModeState(prev => {
            const updated = {
                ...prev,
                pomodoro: {
                    ...prev.pomodoro,
                    state: 'idle',
                    timeRemaining: prev.pomodoro.workDuration * 60,
                    completedSessions: 0
                }
            };
            syncStateToBackend(updated);
            return updated;
        });
    };

    const skipPomodoroPhase = () => {
        setModeState(prev => {
            const pom = prev.pomodoro;
            let nextState = 'focus';
            let nextDuration = pom.workDuration * 60;
            let nextSessions = pom.completedSessions;

            if (pom.state === 'focus' || pom.state === 'idle') {
                nextSessions += 1;
                if (nextSessions % pom.longBreakInterval === 0) {
                    nextState = 'long_break';
                    nextDuration = pom.longBreakDuration * 60;
                } else {
                    nextState = 'short_break';
                    nextDuration = pom.shortBreakDuration * 60;
                }
            } else {
                nextState = 'focus';
                nextDuration = pom.workDuration * 60;
            }

            const updated = {
                ...prev,
                pomodoro: {
                    ...pom,
                    state: nextState,
                    timeRemaining: nextDuration,
                    completedSessions: nextSessions
                }
            };
            syncStateToBackend(updated);
            return updated;
        });
    };

    const updatePomodoroParams = (params) => {
        setModeState(prev => {
            const updatedPom = { ...prev.pomodoro, ...params };
            if (prev.pomodoro.state === 'idle') {
                updatedPom.timeRemaining = (params.workDuration || prev.pomodoro.workDuration) * 60;
            }
            const updated = { ...prev, pomodoro: updatedPom };
            syncStateToBackend({ pomodoro: updatedPom });
            return updated;
        });
    };

    return {
        mode: modeState.mode,
        pomodoro: modeState.pomodoro,
        timerActive,
        changeMode,
        startPomodoro,
        pausePomodoro,
        resetPomodoro,
        skipPomodoroPhase,
        updatePomodoroParams
    };
};
