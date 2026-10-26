import { StoredData, UserSettings, Subject, Task, StudySession, ActiveTimerState } from '../types';

const STORAGE_KEY = 'focusflow_app_data_v1';
const TIMER_KEY = 'focusflow_active_timer_v1';

export const DEFAULT_SUBJECTS: Subject[] = [
  { id: 'subj-math', name: 'Mathematics', color: '#3B82F6', weeklyGoalHours: 6, createdAt: Date.now() - 86400000 * 14 },
  { id: 'subj-sci', name: 'Science', color: '#10B981', weeklyGoalHours: 5, createdAt: Date.now() - 86400000 * 14 },
  { id: 'subj-eng', name: 'English', color: '#F59E0B', weeklyGoalHours: 3, createdAt: Date.now() - 86400000 * 14 },
  { id: 'subj-soc', name: 'Social Science', color: '#8B5CF6', weeklyGoalHours: 4, createdAt: Date.now() - 86400000 * 14 },
  { id: 'subj-hin', name: 'Hindi', color: '#EC4899', weeklyGoalHours: 2, createdAt: Date.now() - 86400000 * 14 },
  { id: 'subj-cs', name: 'Computer', color: '#06B6D4', weeklyGoalHours: 4, createdAt: Date.now() - 86400000 * 14 },
  { id: 'subj-oth', name: 'Other', color: '#6B7280', weeklyGoalHours: 2, createdAt: Date.now() - 86400000 * 14 },
];

export const DEFAULT_TASKS: Task[] = [
  { id: 'task-1', title: 'Complete NCERT Exercise 3.2', subjectId: 'subj-math', targetDurationMinutes: 50, completed: false, createdAt: Date.now() - 86400000 },
  { id: 'task-2', title: 'Revise quadratic equations', subjectId: 'subj-math', targetDurationMinutes: 45, completed: false, createdAt: Date.now() - 86400000 },
  { id: 'task-3', title: 'Revise chemical reactions & equations', subjectId: 'subj-sci', targetDurationMinutes: 60, completed: true, createdAt: Date.now() - 86400000 * 2, completedAt: Date.now() - 86400000 },
  { id: 'task-4', title: 'Practice 15 important MCQs', subjectId: 'subj-sci', targetDurationMinutes: 30, completed: false, createdAt: Date.now() - 86400000 },
  { id: 'task-5', title: 'Data structures review & practice', subjectId: 'subj-cs', targetDurationMinutes: 60, completed: false, createdAt: Date.now() - 86400000 },
];

export const DEFAULT_SETTINGS: UserSettings = {
  displayName: 'Alex',
  dailyGoalHours: 3,
  weeklyGoalHours: 18,
  theme: 'cherry-blossom',
  reducedMotion: false,
  lowDistractionBackground: false,
  defaultSubjectId: 'subj-math',
  timer: {
    pomodoroMinutes: 25,
    shortBreakMinutes: 5,
    longBreakMinutes: 15,
    longBreakInterval: 4,
    autoStartBreaks: false,
    autoStartPomodoros: false,
    soundEnabled: true,
    soundVolume: 0.6,
    notificationsEnabled: false,
  },
};

// Generate initial sample sessions so the dashboard immediately answers the 5 student questions
function generateInitialSessions(): StudySession[] {
  const now = Date.now();
  const dayMs = 86400000;
  const sessions: StudySession[] = [];

  // Today sessions (e.g. 50 min Math, 25 min Science)
  sessions.push({
    id: 'seed-sess-1',
    startTime: now - 3600000 * 3,
    endTime: now - 3600000 * 3 + 3000000,
    plannedDuration: 3000, // 50 mins
    actualDuration: 3000,
    subjectId: 'subj-math',
    taskId: 'task-1',
    mode: 'pomodoro',
    status: 'completed',
    notes: 'Covered linear equations part 1',
  });

  sessions.push({
    id: 'seed-sess-2',
    startTime: now - 3600000,
    endTime: now - 3600000 + 1500000,
    plannedDuration: 1500, // 25 mins
    actualDuration: 1500,
    subjectId: 'subj-sci',
    taskId: 'task-4',
    mode: 'pomodoro',
    status: 'completed',
    notes: 'MCQ practice test',
  });

  // Yesterday sessions
  sessions.push({
    id: 'seed-sess-3',
    startTime: now - dayMs - 3600000 * 5,
    endTime: now - dayMs - 3600000 * 5 + 3600000,
    plannedDuration: 3600, // 60 mins
    actualDuration: 3600,
    subjectId: 'subj-cs',
    taskId: 'task-5',
    mode: 'custom',
    status: 'completed',
    notes: 'Algorithm complexity deep dive',
  });

  sessions.push({
    id: 'seed-sess-4',
    startTime: now - dayMs - 3600000 * 3,
    endTime: now - dayMs - 3600000 * 3 + 3000000,
    plannedDuration: 3000,
    actualDuration: 3000,
    subjectId: 'subj-math',
    mode: 'pomodoro',
    status: 'completed',
  });

  // 2 days ago
  sessions.push({
    id: 'seed-sess-5',
    startTime: now - dayMs * 2 - 3600000 * 4,
    endTime: now - dayMs * 2 - 3600000 * 4 + 3600000,
    plannedDuration: 3600,
    actualDuration: 3600,
    subjectId: 'subj-sci',
    taskId: 'task-3',
    mode: 'custom',
    status: 'completed',
  });

  // 3 days ago
  sessions.push({
    id: 'seed-sess-6',
    startTime: now - dayMs * 3 - 3600000 * 2,
    endTime: now - dayMs * 3 - 3600000 * 2 + 1500000,
    plannedDuration: 1500,
    actualDuration: 1500,
    subjectId: 'subj-eng',
    mode: 'pomodoro',
    status: 'completed',
  });

  // 4 days ago
  sessions.push({
    id: 'seed-sess-7',
    startTime: now - dayMs * 4 - 3600000 * 4,
    endTime: now - dayMs * 4 - 3600000 * 4 + 4800000,
    plannedDuration: 5400,
    actualDuration: 4800,
    subjectId: 'subj-soc',
    mode: 'custom',
    status: 'manual_stop',
    notes: 'Stopped 10m early for dinner',
  });

  return sessions;
}

export class StorageService {
  static loadData(): StoredData {
    if (typeof window === 'undefined') {
      return {
        version: 1,
        userSettings: DEFAULT_SETTINGS,
        subjects: DEFAULT_SUBJECTS,
        tasks: DEFAULT_TASKS,
        sessions: generateInitialSessions(),
      };
    }

    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        const initialData: StoredData = {
          version: 1,
          userSettings: DEFAULT_SETTINGS,
          subjects: DEFAULT_SUBJECTS,
          tasks: DEFAULT_TASKS,
          sessions: generateInitialSessions(),
        };
        this.saveData(initialData);
        return initialData;
      }

      const parsed = JSON.parse(raw) as StoredData;
      // Basic schema check & merge defaults if fields are missing
      return {
        version: parsed.version || 1,
        userSettings: { ...DEFAULT_SETTINGS, ...parsed.userSettings },
        subjects: Array.isArray(parsed.subjects) ? parsed.subjects : DEFAULT_SUBJECTS,
        tasks: Array.isArray(parsed.tasks) ? parsed.tasks : DEFAULT_TASKS,
        sessions: Array.isArray(parsed.sessions) ? parsed.sessions : [],
      };
    } catch (e) {
      console.error('Failed to parse localStorage data', e);
      return {
        version: 1,
        userSettings: DEFAULT_SETTINGS,
        subjects: DEFAULT_SUBJECTS,
        tasks: DEFAULT_TASKS,
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

  static resetAllData(): StoredData {
    const emptyData: StoredData = {
      version: 1,
      userSettings: DEFAULT_SETTINGS,
      subjects: DEFAULT_SUBJECTS,
      tasks: [],
      sessions: [],
    };
    this.saveData(emptyData);
    this.saveActiveTimer(null);
    return emptyData;
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

          if (!Array.isArray(parsed.subjects) || !Array.isArray(parsed.sessions)) {
            resolve({ success: false, message: 'Missing subjects or sessions array in imported file.' });
            return;
          }

          const sanitized: StoredData = {
            version: parsed.version || 1,
            userSettings: { ...DEFAULT_SETTINGS, ...parsed.userSettings },
            subjects: parsed.subjects,
            tasks: Array.isArray(parsed.tasks) ? parsed.tasks : [],
            sessions: parsed.sessions,
          };

          this.saveData(sanitized);
          resolve({ success: true, message: `Successfully restored ${sanitized.sessions.length} sessions, ${sanitized.subjects.length} subjects, and ${sanitized.tasks.length} tasks!`, data: sanitized });
        } catch (err) {
          resolve({ success: false, message: 'Failed to read file as valid JSON: ' + (err instanceof Error ? err.message : String(err)) });
        }
      };
      reader.readAsText(file);
    });
  }

  static exportSessionsToCsv(): void {
    const data = this.loadData();
    const subjectsMap = new Map(data.subjects.map(s => [s.id, s.name]));
    const tasksMap = new Map(data.tasks.map(t => [t.id, t.title]));

    const headers = ['ID', 'Date', 'Start Time', 'End Time', 'Duration (Min)', 'Subject', 'Task', 'Mode', 'Status', 'Notes'];
    const rows = data.sessions.map(s => {
      const startDate = new Date(s.startTime);
      const endDate = new Date(s.endTime);
      const durationMin = (s.actualDuration / 60).toFixed(1);
      const subjectName = subjectsMap.get(s.subjectId) || 'Unknown';
      const taskTitle = s.taskId ? (tasksMap.get(s.taskId) || '') : '';
      
      const escape = (str: string) => `"${(str || '').replace(/"/g, '""')}"`;
      return [
        s.id,
        startDate.toISOString().split('T')[0],
        startDate.toLocaleTimeString(),
        endDate.toLocaleTimeString(),
        durationMin,
        escape(subjectName),
        escape(taskTitle),
        s.mode,
        s.status,
        escape(s.notes || ''),
      ].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const dateStr = new Date().toISOString().split('T')[0];
    a.href = url;
    a.download = `focusflow-study-sessions-${dateStr}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }
}
