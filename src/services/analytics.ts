import { StudySession, Subject, UserSettings } from '../types';

export interface DayActivity {
  dateStr: string;        // YYYY-MM-DD
  dayLabel: string;       // Mon, Tue, etc.
  dayNumber: number;      // 1-31
  durationSec: number;    // total focused seconds
  durationMinutes: number;
  sessionCount: number;
  isToday: boolean;
}

export interface SubjectStat {
  subjectId: string;
  subjectName: string;
  color: string;
  durationSec: number;
  sessionCount: number;
  percentage: number;
}

export interface AnalyticsSummary {
  // Today
  todayDurationSec: number;
  todayCompletedCount: number;
  todayAvgDurationMinutes: number;
  todayGoalPercent: number;
  todaySubjectBreakdown: SubjectStat[];

  // Week
  weekDurationSec: number;
  weekDailyAvgSec: number;
  lastWeekDurationSec: number;
  weekComparisonPercent: number; // e.g. +15%
  mostStudiedSubject: SubjectStat | null;
  weeklyDays: DayActivity[]; // 7 days (e.g. Mon -> Sun of current week)

  // Month
  monthDurationSec: number;
  monthActiveDaysCount: number;
  monthTotalDays: number;
  monthHeatmapDays: DayActivity[]; // All days in current month
  currentStreakDays: number;
  longestStreakDays: number;
  monthlyTrend: 'increasing' | 'steady' | 'decreasing';

  // Goals
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
  subjects: Subject[],
  settings: UserSettings
): AnalyticsSummary {
  const now = new Date();
  const todayKey = formatDateKey(now);
  const subjectsMap = new Map(subjects.map((s) => [s.id, s]));

  // Filter to valid focus sessions with actual duration
  const validSessions = sessions.filter(
    (s) => s.actualDuration > 0 && s.mode !== 'shortBreak' && s.mode !== 'longBreak'
  );

  // Group sessions by date
  const sessionsByDate = new Map<string, StudySession[]>();
  validSessions.forEach((s) => {
    const dKey = formatDateKey(new Date(s.startTime));
    const list = sessionsByDate.get(dKey) || [];
    list.push(s);
    sessionsByDate.set(dKey, list);
  });

  // 1. TODAY'S STATS
  const todaySessions = sessionsByDate.get(todayKey) || [];
  const todayDurationSec = todaySessions.reduce((acc, s) => acc + s.actualDuration, 0);
  const todayCompletedCount = todaySessions.filter((s) => s.status === 'completed').length;
  const todayAvgDurationMinutes =
    todayCompletedCount > 0 ? Math.round(todayDurationSec / todayCompletedCount / 60) : 0;

  const dailyGoalSec = (settings.dailyGoalHours || 3) * 3600;
  const todayGoalPercent = Math.min(100, Math.round((todayDurationSec / dailyGoalSec) * 100));

  // Today Subject Breakdown
  const todaySubjMap = new Map<string, { duration: number; count: number }>();
  todaySessions.forEach((s) => {
    const cur = todaySubjMap.get(s.subjectId) || { duration: 0, count: 0 };
    cur.duration += s.actualDuration;
    cur.count += 1;
    todaySubjMap.set(s.subjectId, cur);
  });

  const todaySubjectBreakdown: SubjectStat[] = Array.from(todaySubjMap.entries()).map(
    ([id, { duration, count }]) => {
      const subj = subjectsMap.get(id);
      return {
        subjectId: id,
        subjectName: subj?.name || 'Unknown',
        color: subj?.color || '#92AA7B',
        durationSec: duration,
        sessionCount: count,
        percentage: todayDurationSec > 0 ? Math.round((duration / todayDurationSec) * 100) : 0,
      };
    }
  );

  // 2. WEEKLY ANALYTICS (Current Week: Monday through Sunday)
  const currentDayOfWeek = now.getDay(); // 0 is Sunday, 1 is Monday
  const distanceToMonday = (currentDayOfWeek + 6) % 7; // days since Monday
  const monday = new Date(now);
  monday.setDate(now.getDate() - distanceToMonday);
  monday.setHours(0, 0, 0, 0);

  const weeklyDays: DayActivity[] = [];
  let weekDurationSec = 0;
  const weekSubjMap = new Map<string, { duration: number; count: number }>();

  for (let i = 0; i < 7; i++) {
    const day = new Date(monday);
    day.setDate(monday.getDate() + i);
    const dKey = formatDateKey(day);
    const daySessions = sessionsByDate.get(dKey) || [];
    const durSec = daySessions.reduce((acc, s) => acc + s.actualDuration, 0);
    weekDurationSec += durSec;

    daySessions.forEach((s) => {
      const cur = weekSubjMap.get(s.subjectId) || { duration: 0, count: 0 };
      cur.duration += s.actualDuration;
      cur.count += 1;
      weekSubjMap.set(s.subjectId, cur);
    });

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

  // Days elapsed in current week so far (1 to 7)
  const daysElapsedThisWeek = distanceToMonday + 1;
  const weekDailyAvgSec = Math.round(weekDurationSec / daysElapsedThisWeek);

  // Last Week Duration
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

  // Most Studied Subject This Week
  let mostStudiedSubject: SubjectStat | null = null;
  let maxWeekSubjDur = -1;
  weekSubjMap.forEach(({ duration, count }, id) => {
    if (duration > maxWeekSubjDur) {
      maxWeekSubjDur = duration;
      const subj = subjectsMap.get(id);
      mostStudiedSubject = {
        subjectId: id,
        subjectName: subj?.name || 'Unknown',
        color: subj?.color || '#3B82F6',
        durationSec: duration,
        sessionCount: count,
        percentage: weekDurationSec > 0 ? Math.round((duration / weekDurationSec) * 100) : 0,
      };
    }
  });

  // 3. MONTHLY ANALYTICS (Current Month Heatmap)
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

  // 4. STREAKS
  // Calculate consecutive days studying backwards from today or yesterday
  let currentStreakDays = 0;
  let checkDay = new Date(now);
  const todayHasActivity = (sessionsByDate.get(todayKey) || []).length > 0;
  if (!todayHasActivity) {
    // If not studied today yet, check if studied yesterday
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

  // Calculate longest streak across history
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

  // Monthly trend
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
    todaySubjectBreakdown,

    weekDurationSec,
    weekDailyAvgSec,
    lastWeekDurationSec,
    weekComparisonPercent,
    mostStudiedSubject,
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
