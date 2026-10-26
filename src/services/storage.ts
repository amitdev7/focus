import type { StoredData, UserSettings, StudySession, ActiveTimerState } from '../types';

const STORAGE_KEY = 'focusflow_app_data_v1';
const TIMER_KEY = 'focusflow_active_timer_v1';

export const DEFAULT_SETTINGS: UserSettings = {
  displayName: 'Alex',
  dailyGoalHours: 3,
  weeklyGoalHours: 18,
  theme: 'cherry-blossom',
  reducedMotion: false,
  lowDistractionBackground: false,
  timer: {
    pomodoroMinutes: 25,
    shortBreakMinutes: 5,
    coffeeBreakMinutes: 10,
    longBreakMinutes: 15,
    longBreakInterval: 4,
    autoStartBreaks: false,
    autoStartPomodoros: false,
    soundEnabled: true,
    soundVolume: 0.6,
    notificationsEnabled: false,
  },
};

function generateInitialSessions(): StudySession[] {
  const now = Date.now();
  const dayMs = 86400000;
  const sessions: StudySession[] = [];

  sessions.push({
    id: 'seed-sess-1',
    startTime: now - 3600000 * 3,
    endTime: now - 3600000 * 3 + 3000000,
    plannedDuration: 3000,
    actualDuration: 3000,
    mode: 'pomodoro',
    status: 'completed',
  });

  sessions.push({
    id: 'seed-sess-2',
    startTime: now - 3600000,
    endTime: now - 3600000 + 1500000,
    plannedDuration: 1500,
    actualDuration: 1500,
    mode: 'pomodoro',
    status: 'completed',
  });

  sessions.push({
    id: 'seed-sess-3',
    startTime: now - dayMs - 3600000 * 5,
    endTime: now - dayMs - 3600000 * 5 + 3600000,
    plannedDuration: 3600,
    actualDuration: 3600,
    mode: 'custom',
    status: 'completed',
  });

  sessions.push({
    id: 'seed-sess-4',
    startTime: now - dayMs - 3600000 * 3,
    endTime: now - dayMs - 3600000 * 3 + 3000000,
    plannedDuration: 3000,
    actualDuration: 3000,
    mode: 'pomodoro',
    status: 'completed',
  });

  sessions.push({
    id: 'seed-sess-5',
    startTime: now - dayMs * 2 - 3600000 * 4,
    endTime: now - dayMs * 2 - 3600000 * 4 + 3600000,
    plannedDuration: 3600,
    actualDuration: 3600,
    mode: 'custom',
    status: 'completed',
  });

  sessions.push({
    id: 'seed-sess-6',
    startTime: now - dayMs * 3 - 3600000 * 2,
    endTime: now - dayMs * 3 - 3600000 * 2 + 1500000,
    plannedDuration: 1500,
    actualDuration: 1500,
    mode: 'pomodoro',
    status: 'completed',
  });

  return sessions;
}

export class StorageService {
  static loadData(): StoredData {
    if (typeof window === 'undefined') {
      return {
        version: 1,
        userSettings: DEFAULT_SETTINGS,
        sessions: generateInitialSessions(),
      };
    }

    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        const initialData: StoredData = {
          version: 1,
          userSettings: DEFAULT_SETTINGS,
          sessions: generateInitialSessions(),
        };
        this.saveData(initialData);
        return initialData;
      }

      const parsed = JSON.parse(raw) as StoredData;
      return {
        version: parsed.version || 1,
        userSettings: {
          ...DEFAULT_SETTINGS,
          ...parsed.userSettings,
          timer: {
            ...DEFAULT_SETTINGS.timer,
            ...(parsed.userSettings?.timer || {}),
          },
        },
        sessions: Array.isArray(parsed.sessions) ? parsed.sessions : [],
      };
    } catch (e) {
      console.error('Failed to parse localStorage data', e);
      return {
        version: 1,
        userSettings: DEFAULT_SETTINGS,
        sessions: generateInitialSessions(),
      };
    }
  }

  static saveData(data: StoredData): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error('Failed to save data to localStorage', e);
    }
  }

  static loadActiveTimer(): ActiveTimerState | null {
    if (typeof window === 'undefined') return null;
    try {
      const raw = localStorage.getItem(TIMER_KEY);
      if (!raw) return null;
      return JSON.parse(raw) as ActiveTimerState;
    } catch {
      return null;
    }
  }

  static saveActiveTimer(state: ActiveTimerState | null): void {
    if (typeof window === 'undefined') return;
    try {
      if (state === null) {
        localStorage.removeItem(TIMER_KEY);
      } else {
        localStorage.setItem(TIMER_KEY, JSON.stringify(state));
      }
    } catch (e) {
      console.error('Failed to save active timer', e);
    }
  }

  static exportToJson(): void {
    const data = this.loadData();
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const dateStr = new Date().toISOString().split('T')[0];
    a.href = url;
    a.download = `focusflow-backup-${dateStr}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  static async importFromJson(file: File): Promise<{ success: boolean; message: string; data?: StoredData }> {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const parsed = JSON.parse(content) as StoredData;

          if (!parsed || typeof parsed !== 'object') {
            resolve({ success: false, message: 'Invalid JSON file structure.' });
            return;
          }

          const sanitized: StoredData = {
            version: parsed.version || 1,
            userSettings: {
              ...DEFAULT_SETTINGS,
              ...parsed.userSettings,
              timer: {
                ...DEFAULT_SETTINGS.timer,
                ...(parsed.userSettings?.timer || {}),
              },
            },
            sessions: Array.isArray(parsed.sessions) ? parsed.sessions : [],
          };

          this.saveData(sanitized);
          resolve({ success: true, message: `Successfully restored ${sanitized.sessions.length} sessions!`, data: sanitized });
        } catch (err) {
          resolve({ success: false, message: 'Failed to read file as valid JSON: ' + (err instanceof Error ? err.message : String(err)) });
        }
      };
      reader.readAsText(file);
    });
  }
}
