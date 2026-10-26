import React from 'react';
import type { ThemeId, TimerMode, UserSettings, ActiveTimerState, StudySession } from '../../types';
import { MainTimerCard } from '../timer/MainTimerCard';
import { computeAnalytics, formatHoursMinutes } from '../../services/analytics';
import { Clock, Trophy, Target, Coffee, Flame, ArrowRight } from 'lucide-react';

interface DashboardOverviewProps {
  timerState: ActiveTimerState;
  sessions: StudySession[];
  settings: UserSettings;
  activeTheme: ThemeId;
  onThemeChange: (theme: ThemeId) => void;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onReset: () => void;
  onSwitchMode: (mode: TimerMode) => void;
  onSetDuration: (minutes: number, mode?: TimerMode) => void;
  onEnterFocusMode: () => void;
  onNavigateTab: (tab: any) => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  timerState,
  sessions,
  settings,
  activeTheme,
  onThemeChange,
  onStart,
  onPause,
  onResume,
  onReset,
  onSwitchMode,
  onSetDuration,
  onEnterFocusMode,
  onNavigateTab,
}) => {
  const analytics = computeAnalytics(sessions, settings);

  return (
    <div className="space-y-8">
      {/* 1. HERO TIMER CARD */}
      <section>
        <MainTimerCard
          timerState={timerState}
          settings={settings}
          activeTheme={activeTheme}
          onThemeChange={onThemeChange}
          onStart={onStart}
          onPause={onPause}
          onResume={onResume}
          onReset={onReset}
          onSwitchMode={onSwitchMode}
          onSetDuration={onSetDuration}
          onEnterFocusMode={onEnterFocusMode}
        />
      </section>

      {/* 2. TODAY'S PROGRESS STATS */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        {/* Studied Today */}
        <div className="bg-white rounded-3xl p-5 border border-espresso/15 shadow-sm">
          <div className="flex items-center justify-between text-espresso/40 mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider">Studied Today</span>
            <Clock className="w-4 h-4 text-cherry" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-espresso font-pixel">
            {formatHoursMinutes(analytics.todayDurationSec)}
          </div>
          <div className="text-xs text-espresso/50 mt-1">
            {analytics.todayCompletedCount} focus sessions completed
          </div>
        </div>

        {/* Daily Goal Status */}
        <div className="bg-white rounded-3xl p-5 border border-espresso/15 shadow-sm">
          <div className="flex items-center justify-between text-espresso/40 mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider">Daily Goal</span>
            <Target className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-espresso font-pixel">
            {analytics.todayGoalPercent}%
          </div>
          <div className="w-full bg-espresso/5 rounded-full h-1.5 overflow-hidden mt-2">
            <div
              className="bg-cherry h-full rounded-full transition-all duration-300"
              style={{ width: `${analytics.todayGoalPercent}%` }}
            />
          </div>
        </div>

        {/* This Week */}
        <div className="bg-white rounded-3xl p-5 border border-espresso/15 shadow-sm">
          <div className="flex items-center justify-between text-espresso/40 mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider">This Week</span>
            <Trophy className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-espresso font-pixel">
            {formatHoursMinutes(analytics.weekDurationSec)}
          </div>
          <div className="text-xs text-espresso/50 mt-1">
            {analytics.weeklyGoalPercent}% of {settings.weeklyGoalHours}h goal
          </div>
        </div>

        {/* Daily Streak */}
        <div className="bg-white rounded-3xl p-5 border border-espresso/15 shadow-sm">
          <div className="flex items-center justify-between text-espresso/40 mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider">Consistency</span>
            <Flame className="w-4 h-4 text-amber-600 fill-amber-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-espresso font-pixel">
            {analytics.currentStreakDays} {analytics.currentStreakDays === 1 ? 'Day' : 'Days'}
          </div>
          <div className="text-xs text-espresso/50 mt-1">
            Current study streak
          </div>
        </div>
      </section>

      {/* 3. QUICK BREAK ACTION CARD */}
      <section className="bg-white rounded-3xl p-6 border border-espresso/15 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4 text-left">
          <div className="w-12 h-12 rounded-2xl bg-blossom/40 text-espresso flex items-center justify-center shrink-0">
            <Coffee className="w-6 h-6 text-cherry" />
          </div>
          <div>
            <h3 className="font-bold text-base text-espresso">Need to step away and relax?</h3>
            <p className="text-xs text-espresso/60 mt-0.5">
              Jump into the dedicated Break Area to take a scheduled 5, 10, or 15-minute mental recharge.
            </p>
          </div>
        </div>

        <button
          onClick={() => onNavigateTab('break')}
          className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-espresso text-ivory text-xs font-semibold shadow-pixel-sm hover:translate-y-[-1px] transition pixel-press shrink-0"
        >
          <span>Open Break Timer</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </section>
    </div>
  );
};
