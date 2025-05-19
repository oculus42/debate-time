import { TimerEvent, DebateSession } from '../types/debate';
import { format } from 'date-fns';

interface AuditHistoryProps {
  events: TimerEvent[];
  roundLabel: string;
  affCode: string;
  negCode: string;
  timers: {
    id: string;
    name: string;
    elapsedTime: number;
  }[];
  sessionId: string;
  onImport: (data: DebateSession) => void;
}

export function AuditHistory({ events, roundLabel, affCode, negCode, timers, sessionId, onImport }: AuditHistoryProps) {
  const formatTimestamp = (timestamp: number) => {
    return format(new Date(timestamp), 'MMM d, yyyy HH:mm:ss.SSS');
  };

  const formatElapsedTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const milliseconds = Math.floor((ms % 1000) / 10);
    return `${minutes}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(2, '0')}`;
  };

  const handleExport = () => {
    const exportData: DebateSession = {
      id: sessionId,
      round: roundLabel,
      teams: {
        affirmative: affCode,
        negative: negCode
      },
      timers: timers.map(timer => ({
        id: timer.id,
        name: timer.name,
        currentTime: timer.elapsedTime
      })),
      auditLog: events
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `debate-${roundLabel}-${sessionId}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        onImport(data);
      } catch (error) {
        console.error('Error parsing JSON file:', error);
        alert('Error loading file. Please make sure it\'s a valid debate export file.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Audit History</h2>
        <div className="flex space-x-2">
          <label className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 cursor-pointer">
            Import JSON
            <input
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
            />
          </label>
          <button
            onClick={handleExport}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Export JSON
          </button>
        </div>
      </div>
      <div className="space-y-2">
        {events.map((event, index) => (
          <div
            key={index}
            className="flex flex-col p-2 bg-gray-50 rounded"
          >
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center space-x-4">
                <span className={`px-2 py-1 rounded text-sm ${
                  event.type === 'start' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {event.type.toUpperCase()}
                </span>
                <span className="font-medium">{event.timerId}</span>
                <span className="text-gray-500">({event.side})</span>
                <span className="font-mono text-sm">
                  {formatElapsedTime(event.elapsedTime)}
                </span>
              </div>
              <span className="text-sm text-gray-500 font-mono">
                {formatTimestamp(event.timestamp)}
              </span>
            </div>
            <div className="text-sm text-gray-600">
              {event.roundLabel && <span className="mr-4">Round: {event.roundLabel}</span>}
              {event.affCode && <span className="mr-4">Aff: {event.affCode}</span>}
              {event.negCode && <span>Neg: {event.negCode}</span>}
            </div>
          </div>
        ))}
        {events.length === 0 && (
          <div className="text-center text-gray-500 py-4">
            No events recorded yet
          </div>
        )}
      </div>
    </div>
  );
} 