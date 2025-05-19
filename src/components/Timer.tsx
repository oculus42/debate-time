import { useState, useEffect, useCallback, useRef } from 'react';

interface TimerProps {
  id: string;
  name: string;
  duration: number;
  allowNegative: boolean;
  isActive: boolean;
  reset: boolean;
  initialElapsedTime?: number;
  onStart: (id: string) => void;
  onStop: (id: string) => void;
  onUpdate: (id: string, elapsedTime: number) => void;
  onAudit: (event: { type: 'start' | 'stop'; timestamp: number; elapsedTime: number }) => void;
}

interface TimerState {
  startTime: number | null;
  elapsedTime: number;
}

export function Timer({ id, name, duration, allowNegative, isActive, reset, initialElapsedTime, onStart, onStop, onUpdate, onAudit }: TimerProps) {
  const [state, setState] = useState<TimerState>({ startTime: null, elapsedTime: initialElapsedTime || 0 });
  const intervalRef = useRef<number>();

  const stopTimer = useCallback(() => {
    if (state.startTime) {
      const now = Date.now();
      const elapsed = now - state.startTime;
      const totalElapsed = state.elapsedTime + elapsed;
      setState(prev => ({
        startTime: null,
        elapsedTime: totalElapsed
      }));
      onAudit({ type: 'stop', timestamp: now, elapsedTime: totalElapsed });
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = undefined;
    }
  }, [state.startTime, state.elapsedTime, onAudit]);

  const startTimer = useCallback(() => {
    const now = Date.now();
    setState(prev => ({
      startTime: now,
      elapsedTime: prev.elapsedTime
    }));
    onAudit({ type: 'start', timestamp: now, elapsedTime: state.elapsedTime });
  }, [onAudit, state.elapsedTime]);

  useEffect(() => {
    if (reset) {
      if (state.startTime) {
        stopTimer();
      }
      setState({ startTime: null, elapsedTime: 0 });
    }
  }, [reset]);

  useEffect(() => {
    if (isActive && !state.startTime) {
      startTimer();
    } else if (!isActive && state.startTime) {
      stopTimer();
    }
  }, [isActive, state.startTime, startTimer, stopTimer]);

  useEffect(() => {
    if (state.startTime) {
      intervalRef.current = window.setInterval(() => {
        const now = Date.now();
        const elapsed = now - state.startTime!;
        const totalElapsed = state.elapsedTime + elapsed;
        setState(prev => ({
          ...prev,
          startTime: now,
          elapsedTime: totalElapsed
        }));
        onUpdate(id, totalElapsed);
      }, 10);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [state.startTime, id, onUpdate]);

  useEffect(() => {
    if (initialElapsedTime !== undefined) {
      setState(prev => ({ ...prev, elapsedTime: initialElapsedTime }));
    }
  }, [initialElapsedTime]);

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const milliseconds = Math.floor((ms % 1000) / 10);
    return `${minutes}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(2, '0')}`;
  };

  const getDisplayTime = () => {
    const remaining = duration * 1000 - state.elapsedTime;
    if (remaining < 0 && !allowNegative) {
      return '0:00.00';
    }
    return formatTime(Math.abs(remaining));
  };

  return (
    <button
      className={`p-4 m-2 rounded-lg w-full ${
        isActive
          ? 'bg-blue-500 text-white'
          : 'bg-gray-200 hover:bg-gray-300'
      }`}
      onClick={() => isActive ? onStop(id) : onStart(id)}
    >
      <div className="text-lg font-bold">{name}</div>
      <div className="text-2xl font-mono">{getDisplayTime()}</div>
    </button>
  );
} 