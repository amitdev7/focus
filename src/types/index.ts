export type TimerMode = 'pomodoro' | 'shortBreak' | 'longBreak' | 'custom' | 'break';

export type SessionStatus = 'completed' | 'interrupted' | 'manual_stop';

export type ThemeId = 'cherry-blossom' | 'pixel-cherry' | 'retro-crt' | 'paper-grid' | 'midnight-focus';

export interface Subject {
  id: string;
  name: string;
  color: string;
  weeklyGoalHours?: number;
  createdAt: number;
}

export interface Task {
  id: string;
  title: string;
  subjectId: string;
  targetDurationMinutes?: number;
  completed: boolean;
  createdAt: number;
  completedAt?: number;
}

export interface StudySession {
  id: string;
  startTime: number;
  endTime: number;
  plannedDuration: number;
  actualDuration: number;
  subjectId?: string;
  taskId?: string;
  mode: TimerMode;
  status: SessionStatus;
  notes?: string;
}

export interface TimerSettings {
  pomodoroMinutes: number;
  shortBreakMinutes: number;
  coffeeBreakMinutes: number;
  longBreakMinutes: number;
  longBreakInterval: number;
  autoStartBreaks: boolean;
  autoStartPomodoros: boolean;
  soundEnabled: boolean;
  soundVolume: number;
  notificationsEnabled: boolean;
}

export interface UserSettings {
  displayName: string;
  dailyGoalHours: number;
  weeklyGoalHours: number;
  theme: ThemeId;
  reducedMotion: boolean;
  lowDistractionBackground: boolean;
  defaultSubjectId?: string;
  timer: TimerSettings;
}

export interface StoredData {
  version: number;
  userSettings: UserSettings;
  subjects?: Subject[];
  tasks?: Task[];
  sessions: StudySession[];
}

export interface ActiveTimerState {
  mode: TimerMode;
  isRunning: boolean;
  isPaused: boolean;
  totalDurationSec: number;
  remainingSec: number;
  targetEndTime: number | null;
  accumulatedActiveSec: number;
  pausedAt: number | null;
  subjectId?: string;
  taskId?: string;
  pomodoroCount: number;
  startedAt: number | null;
}
