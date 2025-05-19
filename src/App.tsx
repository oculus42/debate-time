import { useState } from 'react';
import { DebateFormat, TimerEvent } from './types/debate';
import { defaultFormats } from './data/defaultFormats';
import { Timer } from './components/Timer';
import { AuditHistory } from './components/AuditHistory';

type ViewMode = 'timers' | 'audit';

function App() {
  const [selectedFormat, setSelectedFormat] = useState<DebateFormat>(defaultFormats[0]);
  const [currentTimer, setCurrentTimer] = useState<string | null>(null);
  const [events, setEvents] = useState<TimerEvent[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('timers');
  const [resetTrigger, setResetTrigger] = useState(0);
  const [affCode, setAffCode] = useState('');
  const [negCode, setNegCode] = useState('');
  const [roundLabel, setRoundLabel] = useState('');
  const [timerStates, setTimerStates] = useState<{ [key: string]: number }>({});

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
      roundLabel
    }]);
  };

  const handleNewTimer = () => {
    setCurrentTimer(null);
    setEvents([]);
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
        
        <div className="mb-6 flex justify-between items-center">
          <select
            className="p-2 rounded-lg border border-gray-300"
            value={selectedFormat.name}
            onChange={(e) => {
              const format = defaultFormats.find(f => f.name === e.target.value);
              if (format) setSelectedFormat(format);
            }}
          >
            {defaultFormats.map(format => (
              <option key={format.name} value={format.name}>
                {format.name}
              </option>
            ))}
          </select>

          <div className="flex space-x-2">
            <button
              className="px-4 py-2 rounded-lg bg-green-500 text-white hover:bg-green-600"
              onClick={handleNewTimer}
            >
              New Timer
            </button>
            <button
              className={`px-4 py-2 rounded-lg ${
                viewMode === 'timers'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 hover:bg-gray-300'
              }`}
              onClick={() => setViewMode('timers')}
            >
              Timers
            </button>
            <button
              className={`px-4 py-2 rounded-lg ${
                viewMode === 'audit'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 hover:bg-gray-300'
              }`}
              onClick={() => setViewMode('audit')}
            >
              Audit
            </button>
          </div>
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

        <div className={`${viewMode === 'timers' ? 'block' : 'hidden'}`}>
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
          />
        </div>
      </div>
    </div>
  );
}

export default App; 