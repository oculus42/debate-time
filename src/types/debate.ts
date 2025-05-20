export interface TimerEvent {
  timestamp: number;
  type: 'start' | 'stop' | 'over';
  timerId: string;
  side: 'affirmative' | 'negative';
  elapsedTime: number;
  affCode: string;
  negCode: string;
  roundLabel: string;
  sessionId: string;
}

export interface Timer {
  id: string;
  name: string;
  duration: number;
  allowNegative: boolean;
}

export interface DebateFormat {
  name: string;
  description: string;
  affirmative: Timer[];
  negative: Timer[];
}

export interface DebateState {
  currentTimer: string | null;
  events: TimerEvent[];
  startTime: number | null;
  elapsedTime: number;
}

export interface DebateSession {
  id: string;
  round: string;
  format: string;
  teams: {
    affirmative: string;
    negative: string;
  };
  timers: {
    id: string;
    name: string;
    currentTime: number;
  }[];
  auditLog: TimerEvent[];
  isHistorical: boolean;
} 