export type TimerMode = 'pomodoro' | 'shortBreak' | 'longBreak' | 'custom';

export type SessionStatus = 'completed' | 'interrupted' | 'manual_stop';

export type ThemeId = 'cherry-blossom' | 'pixel-cherry' | 'retro-crt' | 'paper-grid' | 'midnight-focus';

export interface Subject {
  id: string;
  name: string;
  color: string; // Hex color code
  weeklyGoalHours?: number; // Optional weekly goal in hours
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
  startTime: number;       // epoch ms
  endTime: number;         // epoch ms
  plannedDuration: number; // in seconds
  actualDuration: number;  // actual focused seconds (excluding pauses)
  subjectId: string;
  taskId?: string;
  mode: TimerMode;
  status: SessionStatus;
  notes?: string;
}

export interface TimerSettings {
  pomodoroMinutes: number;
  shortBreakMinutes: number;
  longBreakMinutes: number;
  longBreakInterval: number; // every N pomodoros
  autoStartBreaks: boolean;
  autoStartPomodoros: boolean;
  soundEnabled: boolean;
  soundVolume: number; // 0 to 1
  notificationsEnabled: boolean;
}

export interface UserSettings {
  displayName: string;
  dailyGoalHours: number;
  weeklyGoalHours: number;
  theme: ThemeId;
  reducedMotion: boolean;
  lowDistractionBackground: boolean;
  defaultSubjectId: string;
  timer: TimerSettings;
}

export interface StoredData {
  version: number;
  userSettings: UserSettings;
  subjects: Subject[];
  tasks: Task[];
  sessions: StudySession[];
}

export interface ActiveTimerState {
  mode: TimerMode;
  isRunning: boolean;
  isPaused: boolean;
  totalDurationSec: number;
  remainingSec: number;
  targetEndTime: number | null; // epoch ms when running
  accumulatedActiveSec: number;  // active seconds counted so far
  pausedAt: number | null;
  subjectId: string;
  taskId?: string;
  pomodoroCount: number;
  startedAt: number | null;
}
