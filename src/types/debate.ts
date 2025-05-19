export interface TimerEvent {
  timestamp: number;
  type: 'start' | 'stop';
  timerId: string;
  side: 'affirmative' | 'negative';
  elapsedTime: number;
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