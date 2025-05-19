import { useState } from 'react';
import { DebateFormat, TimerEvent } from './types/debate';
import { defaultFormats } from './data/defaultFormats';
import { Timer } from './components/Timer';

function App() {
  const [selectedFormat, setSelectedFormat] = useState<DebateFormat>(defaultFormats[0]);
  const [currentTimer, setCurrentTimer] = useState<string | null>(null);
  const [events, setEvents] = useState<TimerEvent[]>([]);

  const handleTimerStart = (timerId: string) => {
    setCurrentTimer(timerId);
  };

  const handleTimerStop = () => {
    setCurrentTimer(null);
  };

  const handleAudit = (timerId: string, event: { type: 'start' | 'stop'; timestamp: number }) => {
    setEvents(prev => [...prev, {
      timestamp: event.timestamp,
      type: event.type,
      timerId,
      side: timerId.startsWith('aff') ? 'affirmative' : 'negative'
    }]);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-md mx-auto">
        <h1 className="text-3xl font-bold text-center mb-6">Debate Time</h1>
        
        <div className="mb-6">
          <select
            className="w-full p-2 rounded-lg border border-gray-300"
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
                onStart={handleTimerStart}
                onStop={handleTimerStop}
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
                onStart={handleTimerStart}
                onStop={handleTimerStop}
                onAudit={(event) => handleAudit(timer.id, event)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App; 