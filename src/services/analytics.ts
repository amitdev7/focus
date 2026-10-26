import type { StudySession, UserSettings } from '../types';

export interface DayActivity {
  dateStr: string;
  dayLabel: string;
  dayNumber: number;
  durationSec: number;
  durationMinutes: number;
  sessionCount: number;
  isToday: boolean;
}

export interface AnalyticsSummary {
  todayDurationSec: number;
  todayCompletedCount: number;
  todayAvgDurationMinutes: number;
  todayGoalPercent: number;

  weekDurationSec: number;
  weekDailyAvgSec: number;
  lastWeekDurationSec: number;
  weekComparisonPercent: number;
  weeklyDays: DayActivity[];

  monthDurationSec: number;
  monthActiveDaysCount: number;
  monthTotalDays: number;
  monthHeatmapDays: DayActivity[];
  currentStreakDays: number;
  longestStreakDays: number;
  monthlyTrend: 'increasing' | 'steady' | 'decreasing';

  dailyGoalHours: number;
  weeklyGoalHours: number;
  weeklyGoalPercent: number;
}

function formatDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function computeAnalytics(
  sessions: StudySession[],
  settings: UserSettings
): AnalyticsSummary {
  const now = new Date();
  const todayKey = formatDateKey(now);

  const validSessions = sessions.filter(
    (s) => s.actualDuration > 0 && s.mode !== 'shortBreak' && s.mode !== 'longBreak' && s.mode !== 'break'
  );

  const sessionsByDate = new Map<string, StudySession[]>();
  validSessions.forEach((s) => {
    const dKey = formatDateKey(new Date(s.startTime));
    const list = sessionsByDate.get(dKey) || [];
    list.push(s);
    sessionsByDate.set(dKey, list);
  });

  const todaySessions = sessionsByDate.get(todayKey) || [];
  const todayDurationSec = todaySessions.reduce((acc, s) => acc + s.actualDuration, 0);
  const todayCompletedCount = todaySessions.filter((s) => s.status === 'completed').length;
  const todayAvgDurationMinutes =
    todayCompletedCount > 0 ? Math.round(todayDurationSec / todayCompletedCount / 60) : 0;

  const dailyGoalSec = (settings.dailyGoalHours || 3) * 3600;
  const todayGoalPercent = Math.min(100, Math.round((todayDurationSec / dailyGoalSec) * 100));

  const currentDayOfWeek = now.getDay();
  const distanceToMonday = (currentDayOfWeek + 6) % 7;
  const monday = new Date(now);
  monday.setDate(now.getDate() - distanceToMonday);
  monday.setHours(0, 0, 0, 0);

  const weeklyDays: DayActivity[] = [];
  let weekDurationSec = 0;

  for (let i = 0; i < 7; i++) {
    const day = new Date(monday);
    day.setDate(monday.getDate() + i);
    const dKey = formatDateKey(day);
    const daySessions = sessionsByDate.get(dKey) || [];
    const durSec = daySessions.reduce((acc, s) => acc + s.actualDuration, 0);
    weekDurationSec += durSec;

    weeklyDays.push({
      dateStr: dKey,
      dayLabel: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i],
      dayNumber: day.getDate(),
      durationSec: durSec,
      durationMinutes: Math.round(durSec / 60),
      sessionCount: daySessions.length,
      isToday: dKey === todayKey,
    });
  }

  const daysElapsedThisWeek = distanceToMonday + 1;
  const weekDailyAvgSec = Math.round(weekDurationSec / daysElapsedThisWeek);

  let lastWeekDurationSec = 0;
  for (let i = 7; i > 0; i--) {
    const day = new Date(monday);
    day.setDate(monday.getDate() - i);
    const dKey = formatDateKey(day);
    const daySessions = sessionsByDate.get(dKey) || [];
    lastWeekDurationSec += daySessions.reduce((acc, s) => acc + s.actualDuration, 0);
  }

  const weekComparisonPercent =
    lastWeekDurationSec > 0
      ? Math.round(((weekDurationSec - lastWeekDurationSec) / lastWeekDurationSec) * 100)
      : weekDurationSec > 0
        ? 100
        : 0;

  const year = now.getFullYear();
  const month = now.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const monthHeatmapDays: DayActivity[] = [];
  let monthDurationSec = 0;
  let monthActiveDaysCount = 0;

  for (let d = 1; d <= daysInMonth; d++) {
    const day = new Date(year, month, d);
    const dKey = formatDateKey(day);
    const daySessions = sessionsByDate.get(dKey) || [];
    const durSec = daySessions.reduce((acc, s) => acc + s.actualDuration, 0);
    monthDurationSec += durSec;
    if (durSec > 0) {
      monthActiveDaysCount += 1;
    }

    monthHeatmapDays.push({
      dateStr: dKey,
      dayLabel: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][day.getDay()],
      dayNumber: d,
      durationSec: durSec,
      durationMinutes: Math.round(durSec / 60),
      sessionCount: daySessions.length,
      isToday: dKey === todayKey,
    });
  }

  let currentStreakDays = 0;
  const checkDay = new Date(now);
  const todayHasActivity = (sessionsByDate.get(todayKey) || []).length > 0;
  if (!todayHasActivity) {
    checkDay.setDate(checkDay.getDate() - 1);
  }

  while (true) {
    const k = formatDateKey(checkDay);
    const list = sessionsByDate.get(k) || [];
    if (list.length > 0) {
      currentStreakDays += 1;
      checkDay.setDate(checkDay.getDate() - 1);
    } else {
      break;
    }
  }

  const allDateKeys = Array.from(sessionsByDate.keys()).sort();
  let longestStreakDays = 0;
  let tempStreak = 0;
  let prevDate: Date | null = null;

  allDateKeys.forEach((k) => {
    const parts = k.split('-').map(Number);
    const d = new Date(parts[0], parts[1] - 1, parts[2]);
    if (!prevDate) {
      tempStreak = 1;
    } else {
      const diffTime = d.getTime() - prevDate.getTime();
      const diffDays = Math.round(diffTime / 86400000);
      if (diffDays === 1) {
        tempStreak += 1;
      } else if (diffDays > 1) {
        tempStreak = 1;
      }
    }
    prevDate = d;
    if (tempStreak > longestStreakDays) {
      longestStreakDays = tempStreak;
    }
  });

  const monthlyTrend: 'increasing' | 'steady' | 'decreasing' =
    weekDurationSec > lastWeekDurationSec * 1.1
      ? 'increasing'
      : weekDurationSec < lastWeekDurationSec * 0.9
        ? 'decreasing'
        : 'steady';

  const weeklyGoalSec = (settings.weeklyGoalHours || 18) * 3600;
  const weeklyGoalPercent = Math.min(100, Math.round((weekDurationSec / weeklyGoalSec) * 100));

  return {
    todayDurationSec,
    todayCompletedCount,
    todayAvgDurationMinutes,
    todayGoalPercent,

    weekDurationSec,
    weekDailyAvgSec,
    lastWeekDurationSec,
    weekComparisonPercent,
    weeklyDays,

    monthDurationSec,
    monthActiveDaysCount,
    monthTotalDays: daysInMonth,
    monthHeatmapDays,
    currentStreakDays,
    longestStreakDays,
    monthlyTrend,

    dailyGoalHours: settings.dailyGoalHours,
    weeklyGoalHours: settings.weeklyGoalHours,
    weeklyGoalPercent,
  };
}

export function formatDuration(seconds: number): string {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hrs > 0) {
    return `${hrs}h ${mins}m`;
  }
  if (mins > 0) {
    return `${mins}m ${secs}s`;
  }
  return `${secs}s`;
}

export function formatHoursMinutes(seconds: number): string {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  if (hrs === 0) return `${mins}m`;
  return `${hrs}h ${mins > 0 ? `${mins}m` : ''}`.trim();
}
