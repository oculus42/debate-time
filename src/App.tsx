import { useState, useRef, useEffect } from 'react';
import { DebateFormat, TimerEvent, DebateSession } from './types/debate';
import { defaultFormats } from './data/defaultFormats';
import { Timer } from './components/Timer';
import { AuditHistory } from './components/AuditHistory';
import { RecentSessions, RecentSessionsRef } from './components/RecentSessions';
import { FormatSettings } from './components/FormatSettings';
import { v7 as uuidv7 } from 'uuid';

type ViewMode = 'timers' | 'audit' | 'history' | 'settings';

function App() {
  const [selectedFormat, setSelectedFormat] = useState<DebateFormat>(() => {
    const storedDefault = localStorage.getItem('debateTimerDefaultFormat');
    if (storedDefault) {
      const defaultFormat = defaultFormats.find(f => f.name === storedDefault);
      if (defaultFormat) return defaultFormat;
    }
    return defaultFormats[0];
  });
  const [availableFormats, setAvailableFormats] = useState<DebateFormat[]>(defaultFormats);
  const [currentTimer, setCurrentTimer] = useState<string | null>(null);
  const [events, setEvents] = useState<TimerEvent[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('timers');
  const [resetTrigger, setResetTrigger] = useState(0);
  const [affCode, setAffCode] = useState('');
  const [negCode, setNegCode] = useState('');
  const [roundLabel, setRoundLabel] = useState('');
  const [timerStates, setTimerStates] = useState<{ [key: string]: number }>({});
  const [sessionId, setSessionId] = useState(uuidv7());
  const recentSessionsRef = useRef<RecentSessionsRef>(null);

  const handleTimerStart = (timerId: string) => {
    if (currentTimer) {
      handleTimerStop();
    }
    setCurrentTimer(timerId);
  };

  const handleTimerStop = () => {
    setCurrentTimer(null);
  };

  const handleAudit = (timerId: string, event: { type: 'start' | 'stop'; timestamp: number; elapsedTime: number }) => {
    setEvents(prev => [...prev, {
      timestamp: event.timestamp,
      type: event.type,
      timerId,
      side: timerId.startsWith('aff') ? 'affirmative' : 'negative',
      elapsedTime: event.elapsedTime,
      affCode,
      negCode,
      roundLabel,
      sessionId
    }]);
  };

  const handleNewTimer = () => {
    // Save current session if there are any events
    if (events.length > 0) {
      const currentSession: DebateSession = {
        id: sessionId,
        round: roundLabel,
        teams: {
          affirmative: affCode,
          negative: negCode
        },
        timers: [
          ...selectedFormat.affirmative.map(timer => ({
            id: timer.id,
            name: timer.name,
            currentTime: timerStates[timer.id] || 0
          })),
          ...selectedFormat.negative.map(timer => ({
            id: timer.id,
            name: timer.name,
            currentTime: timerStates[timer.id] || 0
          }))
        ],
        auditLog: events
      };
      recentSessionsRef.current?.addSession(currentSession);
    }

    // Reset everything
    setCurrentTimer(null);
    setEvents([]);
    setResetTrigger(prev => prev + 1);
    setSessionId(uuidv7());
    setRoundLabel('');
    setAffCode('');
    setNegCode('');
  };

  const handleImport = (data: DebateSession) => {
    // Stop any running timer
    setCurrentTimer(null);
    
    // Update basic info
    setRoundLabel(data.round);
    setAffCode(data.teams.affirmative);
    setNegCode(data.teams.negative);
    setEvents(data.auditLog);
    setSessionId(data.id);
    
    // Update timer states
    const newTimerStates: { [key: string]: number } = {};
    data.timers.forEach(timer => {
      newTimerStates[timer.id] = timer.currentTime;
    });
    setTimerStates(newTimerStates);

    // Trigger a reset to ensure timers update
    setResetTrigger(prev => prev + 1);
  };

  const handleTimerUpdate = (timerId: string, elapsedTime: number) => {
    setTimerStates(prev => ({
      ...prev,
      [timerId]: elapsedTime
    }));
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-md mx-auto">
        <h1 className="text-3xl font-bold text-center mb-6">Debate Time</h1>
        
        <div className="border-b border-gray-200 mb-4">
          <nav className="-mb-px flex space-x-8">
            <button
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                viewMode === 'timers'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setViewMode('timers')}
            >
              Timers
            </button>
            <button
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                viewMode === 'audit'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setViewMode('audit')}
            >
              Audit
            </button>
            <button
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                viewMode === 'history'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setViewMode('history')}
            >
              History
            </button>
            <button
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                viewMode === 'settings'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setViewMode('settings')}
            >
              Settings
            </button>
          </nav>
        </div>

        <div className={`${viewMode === 'timers' ? 'block' : 'hidden'}`}>
          <div className="mb-6 flex justify-between items-center">
            <select
              className="p-2 rounded-lg border border-gray-300"
              value={selectedFormat.name}
              onChange={(e) => {
                const format = availableFormats.find(f => f.name === e.target.value);
                if (format) setSelectedFormat(format);
              }}
            >
              {availableFormats.map(format => (
                <option key={format.name} value={format.name}>
                  {format.name}
                </option>
              ))}
            </select>

            <button
              className="px-4 py-2 rounded-lg bg-green-500 text-white hover:bg-green-600"
              onClick={handleNewTimer}
            >
              New Timer
            </button>
          </div>

          <div className="mb-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Round</label>
              <input
                type="text"
                value={roundLabel}
                onChange={(e) => setRoundLabel(e.target.value)}
                placeholder="Round Label (e.g., 'Round 1', 'Finals')"
                className="w-full p-2 rounded-lg border border-gray-300"
              />
            </div>
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Affirmative</label>
                <input
                  type="text"
                  value={affCode}
                  onChange={(e) => setAffCode(e.target.value)}
                  placeholder="Team Code"
                  className="w-full p-2 rounded-lg border border-gray-300"
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Negative</label>
                <input
                  type="text"
                  value={negCode}
                  onChange={(e) => setNegCode(e.target.value)}
                  placeholder="Team Code"
                  className="w-full p-2 rounded-lg border border-gray-300"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h2 className="text-xl font-bold mb-2">Affirmative</h2>
              {selectedFormat.affirmative.map(timer => (
                <Timer
                  key={timer.id}
                  id={timer.id}
                  name={timer.name}
                  duration={timer.duration}
                  allowNegative={timer.allowNegative}
                  isActive={currentTimer === timer.id}
                  reset={resetTrigger > 0}
                  initialElapsedTime={timerStates[timer.id]}
                  onStart={handleTimerStart}
                  onStop={handleTimerStop}
                  onUpdate={handleTimerUpdate}
                  onAudit={(event) => handleAudit(timer.id, event)}
                />
              ))}
            </div>
            <div>
              <h2 className="text-xl font-bold mb-2">Negative</h2>
              {selectedFormat.negative.map(timer => (
                <Timer
                  key={timer.id}
                  id={timer.id}
                  name={timer.name}
                  duration={timer.duration}
                  allowNegative={timer.allowNegative}
                  isActive={currentTimer === timer.id}
                  reset={resetTrigger > 0}
                  initialElapsedTime={timerStates[timer.id]}
                  onStart={handleTimerStart}
                  onStop={handleTimerStop}
                  onUpdate={handleTimerUpdate}
                  onAudit={(event) => handleAudit(timer.id, event)}
                />
              ))}
            </div>
          </div>
        </div>

        <div className={`${viewMode === 'audit' ? 'block' : 'hidden'}`}>
          <AuditHistory 
            events={events} 
            roundLabel={roundLabel}
            affCode={affCode}
            negCode={negCode}
            sessionId={sessionId}
            timers={[
              ...selectedFormat.affirmative.map(timer => ({
                id: timer.id,
                name: timer.name,
                elapsedTime: timerStates[timer.id] || 0
              })),
              ...selectedFormat.negative.map(timer => ({
                id: timer.id,
                name: timer.name,
                elapsedTime: timerStates[timer.id] || 0
              }))
            ]}
            onImport={handleImport}
          />
        </div>

        <div className={`${viewMode === 'history' ? 'block' : 'hidden'}`}>
          <RecentSessions
            ref={recentSessionsRef}
            onImport={handleImport}
          />
        </div>

        <div className={`${viewMode === 'settings' ? 'block' : 'hidden'}`}>
          <FormatSettings
            formats={defaultFormats}
            defaultFormat={selectedFormat}
            onFormatsChange={setAvailableFormats}
            onDefaultFormatChange={setSelectedFormat}
          />
        </div>
      </div>
    </div>
  );
}

export default App; 