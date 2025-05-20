import { useState, forwardRef, useImperativeHandle } from 'react';
import { DebateSession } from '../types/debate';
import { format } from 'date-fns';

const MAX_SESSIONS = 5;
const STORAGE_KEY = 'debateTimerSessions';

interface RecentSessionsProps {
  onImport: (session: DebateSession) => void;
}

export interface RecentSessionsRef {
  addSession: (session: DebateSession) => void;
}

export const RecentSessions = forwardRef<RecentSessionsRef, RecentSessionsProps>(({ onImport }, ref) => {
  const [sessions, setSessions] = useState<DebateSession[]>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  });

  useImperativeHandle(ref, () => ({
    addSession: (session: DebateSession) => {
      setSessions(prev => {
        const newSessions = [session, ...prev].slice(0, MAX_SESSIONS);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newSessions));
        return newSessions;
      });
    }
  }));

  const clearSessions = () => {
    setSessions([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  const deleteSession = (sessionId: string) => {
    setSessions(prev => {
      const newSessions = prev.filter(session => session.id !== sessionId);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newSessions));
      return newSessions;
    });
  };

  const formatDate = (timestamp: number) => {
    return format(new Date(timestamp), 'MMM d, yyyy HH:mm:ss');
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Recent Sessions</h2>
        {sessions.length > 0 && (
          <button
            onClick={clearSessions}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
          >
            Clear All
          </button>
        )}
      </div>
      <div className="space-y-2">
        {sessions.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            No recent sessions
          </div>
        ) : (
          sessions.map((session: DebateSession) => (
            <div
              key={session.id}
              className="flex items-center justify-between p-2 bg-gray-50 rounded"
            >
              <div className="flex-1">
                <div className="font-medium">{session.round}</div>
                <div className="text-sm text-gray-600">
                  {session.teams.affirmative} vs {session.teams.negative}
                </div>
                <div className="text-sm text-gray-600">
                  Format: {session.format}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {formatDate(session.auditLog[0]?.timestamp || Date.now())}<br/>
                  {formatDate(session.auditLog[session.auditLog.length - 1]?.timestamp || Date.now())}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => onImport(session)}
                  className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Load
                </button>
                <button
                  onClick={() => deleteSession(session.id)}
                  className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
});
