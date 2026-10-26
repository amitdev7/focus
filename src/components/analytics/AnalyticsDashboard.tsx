import React from 'react';
import type { StudySession, UserSettings } from '../../types';
import { computeAnalytics, formatHoursMinutes } from '../../services/analytics';
import { Flame, Clock, Trophy, Calendar, Target, Award, ArrowUpRight, ArrowDownRight, Minus, Zap } from 'lucide-react';

interface AnalyticsDashboardProps {
  sessions: StudySession[];
  settings: UserSettings;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  sessions,
  settings,
}) => {
  const analytics = computeAnalytics(sessions, settings);

  const maxWeekDurationSec = Math.max(
    3600,
    ...analytics.weeklyDays.map((d) => d.durationSec)
  );

  return (
    <div className="space-y-8">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-espresso tracking-tight">
            Study Analytics
          </h2>
          <p className="text-sm text-espresso/60 mt-1">
            Real insights into your study habits, goal momentum, and focus streaks.
          </p>
        </div>

        {/* Current Streak Badge */}
        <div className="flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-amber-50 border border-amber-200/80 text-amber-900 shadow-sm">
          <Flame className="w-5 h-5 text-amber-600 fill-amber-500" />
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-amber-700/70">
              Study Streak
            </div>
            <div className="text-sm font-black font-pixel">
              {analytics.currentStreakDays} {analytics.currentStreakDays === 1 ? 'Day' : 'Days'} In A Row!
            </div>
          </div>
        </div>
      </div>

      {/* TODAY'S METRICS SECTION */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-espresso/50 mb-3">
          Today's Focus Performance
        </h3>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {/* Card 1: Today Study Time */}
          <div className="bg-white rounded-3xl p-5 border border-espresso/15 shadow-sm">
            <div className="flex items-center justify-between text-espresso/50 mb-2">
              <span className="text-xs font-semibold uppercase">Total Today</span>
              <Clock className="w-4 h-4 text-cherry" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-espresso font-pixel">
              {formatHoursMinutes(analytics.todayDurationSec)}
            </div>
            <div className="mt-2 text-xs text-espresso/60 flex items-center gap-1">
              <span>Goal: {settings.dailyGoalHours}h</span>
              <span>•</span>
              <span className="font-semibold text-cherry">{analytics.todayGoalPercent}%</span>
            </div>
          </div>

          {/* Card 2: Completed Sessions */}
          <div className="bg-white rounded-3xl p-5 border border-espresso/15 shadow-sm">
            <div className="flex items-center justify-between text-espresso/50 mb-2">
              <span className="text-xs font-semibold uppercase">Sessions</span>
              <Trophy className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-espresso font-pixel">
              {analytics.todayCompletedCount}
            </div>
            <div className="mt-2 text-xs text-espresso/60">
              Completed focus blocks
            </div>
          </div>

          {/* Card 3: Average Session Duration */}
          <div className="bg-white rounded-3xl p-5 border border-espresso/15 shadow-sm">
            <div className="flex items-center justify-between text-espresso/50 mb-2">
              <span className="text-xs font-semibold uppercase">Avg Duration</span>
              <Award className="w-4 h-4 text-sage" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-espresso font-pixel">
              {analytics.todayAvgDurationMinutes}m
            </div>
            <div className="mt-2 text-xs text-espresso/60">
              Per completed session
            </div>
          </div>

          {/* Card 4: Daily Goal Status */}
          <div className="bg-white rounded-3xl p-5 border border-espresso/15 shadow-sm">
            <div className="flex items-center justify-between text-espresso/50 mb-2">
              <span className="text-xs font-semibold uppercase">Daily Goal</span>
              <Target className="w-4 h-4 text-purple-500" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-espresso font-pixel truncate">
              {formatHoursMinutes(analytics.todayDurationSec)} / {settings.dailyGoalHours}h
            </div>
            <div className="w-full bg-espresso/5 rounded-full h-2 overflow-hidden mt-3">
              <div
                className="bg-cherry h-full rounded-full transition-all duration-500"
                style={{ width: `${analytics.todayGoalPercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* WEEKLY 7-DAY BAR CHART & GOAL SUMMARY */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Chart (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-espresso/15 shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-6">
            <div>
              <h3 className="font-bold text-lg text-espresso">Focused Study Time This Week</h3>
              <p className="text-xs text-espresso/50">Daily breakdown for Monday through Sunday</p>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-ivory border border-espresso/10">
                {analytics.monthlyTrend === 'increasing' ? (
                  <ArrowUpRight className="w-3.5 h-3.5 text-emerald-600" />
                ) : analytics.monthlyTrend === 'decreasing' ? (
                  <ArrowDownRight className="w-3.5 h-3.5 text-rose-500" />
                ) : (
                  <Minus className="w-3.5 h-3.5 text-amber-500" />
                )}
                <span className="capitalize">{analytics.monthlyTrend} Trend</span>
              </div>
            </div>
          </div>

          {/* SVG 7-Day Bar Chart */}
          <div className="h-56 sm:h-64 w-full flex items-end justify-between gap-2 sm:gap-4 pt-6 pb-2 px-2 border-b border-espresso/10">
            {analytics.weeklyDays.map((day) => {
              const heightPercent = Math.max(
                4,
                Math.round((day.durationSec / maxWeekDurationSec) * 100)
              );
              return (
                <div key={day.dateStr} className="flex-1 flex flex-col items-center h-full justify-end group relative">
                  <div className="opacity-0 group-hover:opacity-100 transition pointer-events-none absolute -top-10 bg-espresso text-ivory text-[10px] font-semibold py-1 px-2 rounded-lg whitespace-nowrap shadow-md z-20">
                    {day.dayLabel}: {formatHoursMinutes(day.durationSec)} ({day.sessionCount} sessions)
                  </div>

                  {day.durationSec > 0 && (
                    <span className="text-[10px] font-bold text-espresso/60 mb-1 hidden sm:block font-pixel">
                      {formatHoursMinutes(day.durationSec)}
                    </span>
                  )}

                  <div className="w-full max-w-[42px] bg-espresso/5 rounded-t-xl overflow-hidden flex flex-col justify-end h-full">
                    <div
                      className={`w-full rounded-t-xl transition-all duration-500 group-hover:brightness-95 ${
                        day.isToday
                          ? 'bg-cherry'
                          : day.durationSec > 0
                          ? 'bg-sage'
                          : 'bg-transparent'
                      }`}
                      style={{ height: `${heightPercent}%` }}
                    />
                  </div>

                  <div className="mt-2 text-center">
                    <div
                      className={`text-xs font-semibold ${
                        day.isToday ? 'text-cherry font-black' : 'text-espresso/70'
                      }`}
                    >
                      {day.dayLabel}
                    </div>
                    <div className="text-[10px] text-espresso/40">{day.dayNumber}</div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Weekly Summary Row */}
          <div className="grid grid-cols-3 gap-2 mt-5 text-center pt-2">
            <div>
              <div className="text-[11px] text-espresso/50 uppercase font-semibold">Total Week</div>
              <div className="text-base sm:text-lg font-bold font-pixel text-espresso mt-0.5">
                {formatHoursMinutes(analytics.weekDurationSec)}
              </div>
            </div>
            <div>
              <div className="text-[11px] text-espresso/50 uppercase font-semibold">Daily Average</div>
              <div className="text-base sm:text-lg font-bold font-pixel text-espresso mt-0.5">
                {formatHoursMinutes(analytics.weekDailyAvgSec)}
              </div>
            </div>
            <div>
              <div className="text-[11px] text-espresso/50 uppercase font-semibold">Weekly Goal</div>
              <div className="text-base sm:text-lg font-bold font-pixel text-espresso mt-0.5">
                {analytics.weeklyGoalPercent}%
              </div>
            </div>
          </div>
        </div>

        {/* Weekly Progress & Focus Highlights */}
        <div className="bg-white rounded-3xl p-6 border border-espresso/15 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-lg text-espresso mb-1">Weekly Momentum</h3>
            <p className="text-xs text-espresso/50 mb-4">Goal tracking &amp; compounding focus</p>

            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-ivory/60 border border-espresso/10">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-espresso/60 font-semibold">Weekly Target</span>
                  <span className="font-pixel text-espresso font-bold">
                    {formatHoursMinutes(analytics.weekDurationSec)} / {settings.weeklyGoalHours}h
                  </span>
                </div>
                <div className="w-full bg-espresso/5 rounded-full h-2 overflow-hidden mt-2">
                  <div
                    className="bg-cherry h-full rounded-full transition-all duration-500"
                    style={{ width: `${analytics.weeklyGoalPercent}%` }}
                  />
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-ivory/60 border border-espresso/10">
                <div className="text-[10px] uppercase font-bold text-espresso/50 tracking-wider">
                  Consistency Rate
                </div>
                <div className="text-2xl font-black font-pixel text-espresso mt-1">
                  {Math.round((analytics.monthActiveDaysCount / Math.max(1, new Date().getDate())) * 100)}%
                </div>
                <p className="text-[11px] text-espresso/60 mt-1">
                  Active study on {analytics.monthActiveDaysCount} days this month
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-ivory/60 border border-espresso/10 flex items-center gap-3">
                <Zap className="w-6 h-6 text-amber-500 shrink-0" />
                <div>
                  <div className="text-xs font-bold text-espresso">Compound Growth</div>
                  <div className="text-[11px] text-espresso/60">
                    Daily consistency creates exponential cognitive retention.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MONTHLY ACTIVITY CALENDAR HEATMAP */}
      <div className="bg-white rounded-3xl p-6 border border-espresso/15 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
          <div>
            <h3 className="font-bold text-lg text-espresso flex items-center gap-2">
              <Calendar className="w-5 h-5 text-cherry" />
              Monthly Consistency Heatmap
            </h3>
            <p className="text-xs text-espresso/50">
              {analytics.monthActiveDaysCount} active study days out of {analytics.monthTotalDays} days this month
            </p>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-2 text-[11px] text-espresso/60">
            <span>Less</span>
            <span className="w-3 h-3 rounded-sm bg-espresso/5 border border-espresso/10" />
            <span className="w-3 h-3 rounded-sm bg-sage/40" />
            <span className="w-3 h-3 rounded-sm bg-sage/80" />
            <span className="w-3 h-3 rounded-sm bg-cherry" />
            <span>More</span>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 sm:grid-cols-10 md:grid-cols-14 gap-2">
          {analytics.monthHeatmapDays.map((day) => {
            let heatClass = 'bg-espresso/5 text-espresso/50 border-espresso/10';
            if (day.durationSec > 0 && day.durationSec < 1800) {
              heatClass = 'bg-sage/30 text-espresso font-semibold border-sage/40';
            } else if (day.durationSec >= 1800 && day.durationSec < 5400) {
              heatClass = 'bg-sage/75 text-white font-semibold border-sage';
            } else if (day.durationSec >= 5400) {
              heatClass = 'bg-cherry text-white font-bold border-cherry-dark';
            }

            return (
              <div
                key={day.dateStr}
                title={`${day.dateStr}: ${formatHoursMinutes(day.durationSec)} (${day.sessionCount} sessions)`}
                className={`relative aspect-square rounded-xl border flex flex-col items-center justify-center p-1 cursor-default transition-transform hover:scale-110 shadow-xs ${heatClass} ${
                  day.isToday ? 'ring-2 ring-espresso ring-offset-1' : ''
                }`}
              >
                <span className="text-xs font-pixel">{day.dayNumber}</span>
                {day.durationSec > 0 && (
                  <span className="text-[9px] opacity-80 leading-none mt-0.5 hidden sm:block">
                    {Math.round(day.durationSec / 60)}m
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Heatmap Footer Stats */}
        <div className="mt-6 pt-4 border-t border-espresso/10 flex flex-wrap items-center justify-between gap-4 text-xs text-espresso/70">
          <div>
            Total Month Study Time: <strong className="text-espresso font-pixel">{formatHoursMinutes(analytics.monthDurationSec)}</strong>
          </div>
          <div>
            Longest Streak: <strong className="text-espresso font-pixel">{analytics.longestStreakDays} days</strong>
          </div>
          <div>
            Consistency Rate: <strong className="text-espresso font-pixel">{Math.round((analytics.monthActiveDaysCount / Math.max(1, new Date().getDate())) * 100)}%</strong>
          </div>
        </div>
      </div>
    </div>
  );
};
