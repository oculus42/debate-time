import { TimerEvent } from '../types/debate';
import { format } from 'date-fns';

interface AuditHistoryProps {
  events: TimerEvent[];
}

export function AuditHistory({ events }: AuditHistoryProps) {
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

  return (
    <div className="bg-white rounded-lg shadow-lg p-4">
      <h2 className="text-xl font-bold mb-4">Audit History</h2>
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