import React from 'react';
import { StudySession, Subject, Task, ThemeId, TimerMode, UserSettings, ActiveTimerState } from '../../types';
import { MainTimerCard } from '../timer/MainTimerCard';
import { computeAnalytics, formatHoursMinutes, formatDuration } from '../../services/analytics';
import { ArrowRight, BookOpen, CheckSquare, Clock, Flame, Plus, Sparkles, Target, Trophy } from 'lucide-react';
import { PixelCherry } from '../common/PixelCherry';
import { RetroCrtSmiley } from '../common/RetroCrtSmiley';

interface DashboardOverviewProps {
  timerState: ActiveTimerState;
  subjects: Subject[];
  tasks: Task[];
  sessions: StudySession[];
  settings: UserSettings;
  activeTheme: ThemeId;
  onThemeChange: (theme: ThemeId) => void;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onReset: () => void;
  onSkip: () => void;
  onSwitchMode: (mode: TimerMode) => void;
  onSetDuration: (minutes: number, mode?: TimerMode) => void;
  onSelectSubject: (subjectId: string) => void;
  onSelectTask: (taskId?: string) => void;
  onEnterFocusMode: () => void;
  onToggleTask: (taskId: string) => void;
  onNavigateTab: (tab: any) => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  timerState,
  subjects,
  tasks,
  sessions,
  settings,
  activeTheme,
  onThemeChange,
  onStart,
  onPause,
  onResume,
  onReset,
  onSkip,
  onSwitchMode,
  onSetDuration,
  onSelectSubject,
  onSelectTask,
  onEnterFocusMode,
  onToggleTask,
  onNavigateTab,
}) => {
  const analytics = computeAnalytics(sessions, subjects, settings);
  const pendingTasks = tasks.filter((t) => !t.completed).slice(0, 4);
  const recentSessions = sessions.slice(0, 4);

  return (
    <div className="space-y-8">
      {/* 1. HERO TIMER CARD */}
      <section>
        <MainTimerCard
          timerState={timerState}
          subjects={subjects}
          tasks={tasks}
          settings={settings}
          activeTheme={activeTheme}
          onThemeChange={onThemeChange}
          onStart={onStart}
          onPause={onPause}
          onResume={onResume}
          onReset={onReset}
          onSkip={onSkip}
          onSwitchMode={onSwitchMode}
          onSetDuration={onSetDuration}
          onSelectSubject={onSelectSubject}
          onSelectTask={onSelectTask}
          onEnterFocusMode={onEnterFocusMode}
        />
      </section>

      {/* 2. TODAY'S QUICK METRICS (Answers the 5 core student questions) */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        {/* Q1: How long have I studied today? */}
        <div className="bg-white rounded-3xl p-5 border border-espresso/15 shadow-sm">
          <div className="flex items-center justify-between text-espresso/40 mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider">Studied Today</span>
            <Clock className="w-4 h-4 text-cherry" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-espresso font-pixel">
            {formatHoursMinutes(analytics.todayDurationSec)}
          </div>
          <div className="text-xs text-espresso/50 mt-1">
            {analytics.todayCompletedCount} focus sessions
          </div>
        </div>

        {/* Q2: Which subject did I study today? */}
        <div className="bg-white rounded-3xl p-5 border border-espresso/15 shadow-sm">
          <div className="flex items-center justify-between text-espresso/40 mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider">Top Subject</span>
            <BookOpen className="w-4 h-4 text-sage" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-espresso truncate">
            {analytics.todaySubjectBreakdown[0]?.subjectName || 'None yet'}
          </div>
          <div className="text-xs text-espresso/50 mt-1 truncate">
            {analytics.todaySubjectBreakdown[0]
              ? `${formatHoursMinutes(analytics.todaySubjectBreakdown[0].durationSec)} logged`
              : 'Start your first session'}
          </div>
        </div>

        {/* Q3: How much focused study time completed this week? */}
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

        {/* Q4 & Q5: Am I achieving daily goal & consistent? */}
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
      </section>

      {/* 3. TWO-COLUMN EDITORIAL SECTION: TASKS & SUBJECT PROGRESS */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Column A: Today's Tasks */}
        <div className="bg-white rounded-3xl p-6 border border-espresso/15 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <CheckSquare className="w-5 h-5 text-cherry" />
                <h3 className="font-bold text-lg text-espresso">Priority Tasks</h3>
              </div>
              <button
                onClick={() => onNavigateTab('tasks')}
                className="text-xs font-semibold text-cherry hover:underline flex items-center gap-1"
              >
                <span>View all ({tasks.length})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {pendingTasks.length === 0 ? (
              <div className="py-8 text-center text-espresso/40 text-xs">
                No active tasks pending. You're all caught up!
              </div>
            ) : (
              <div className="space-y-2.5">
                {pendingTasks.map((task) => {
                  const sub = subjects.find((s) => s.id === task.subjectId);
                  return (
                    <div
                      key={task.id}
                      className="p-3 rounded-2xl bg-ivory/60 border border-espresso/10 flex items-center justify-between gap-3 group"
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={task.completed}
                          onChange={() => onToggleTask(task.id)}
                          className="w-4 h-4 rounded text-cherry focus:ring-cherry cursor-pointer"
                        />
                        <div>
                          <span className="text-xs sm:text-sm font-semibold text-espresso block">
                            {task.title}
                          </span>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: sub?.color || '#3B82F6' }}
                            />
                            <span className="text-[10px] text-espresso/60">{sub?.name}</span>
                            {task.targetDurationMinutes && (
                              <span className="text-[10px] text-espresso/40">
                                • {task.targetDurationMinutes}m target
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          onSelectSubject(task.subjectId);
                          onSelectTask(task.id);
                          if (task.targetDurationMinutes) {
                            onSetDuration(task.targetDurationMinutes, 'custom');
                          }
                          onNavigateTab('timer');
                        }}
                        className="text-[11px] font-semibold px-2.5 py-1 rounded-xl bg-white border border-espresso/15 text-espresso hover:bg-espresso hover:text-ivory transition shrink-0 opacity-80 group-hover:opacity-100"
                      >
                        Focus
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <button
            onClick={() => onNavigateTab('tasks')}
            className="w-full mt-4 py-2.5 rounded-xl border border-dashed border-espresso/20 text-xs font-semibold text-espresso/70 hover:border-espresso/40 hover:text-espresso flex items-center justify-center gap-1.5 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Add Study Task</span>
          </button>
        </div>

        {/* Column B: Subject Focus Balance */}
        <div className="bg-white rounded-3xl p-6 border border-espresso/15 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-sage" />
                <h3 className="font-bold text-lg text-espresso">Courses &amp; Subjects</h3>
              </div>
              <button
                onClick={() => onNavigateTab('subjects')}
                className="text-xs font-semibold text-sage-dark hover:underline flex items-center gap-1"
              >
                <span>Manage</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3.5">
              {subjects.slice(0, 5).map((sub) => {
                const subSessions = sessions.filter(
                  (s) => s.subjectId === sub.id && s.actualDuration > 0
                );
                const subSec = subSessions.reduce((acc, s) => acc + s.actualDuration, 0);
                const goalSec = (sub.weeklyGoalHours || 5) * 3600;
                const progress = Math.min(100, Math.round((subSec / goalSec) * 100));

                return (
                  <div key={sub.id} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: sub.color }}
                        />
                        <span className="font-semibold text-espresso">{sub.name}</span>
                      </div>
                      <span className="font-pixel text-[11px] text-espresso/70">
                        {formatHoursMinutes(subSec)}
                      </span>
                    </div>

                    <div className="w-full bg-espresso/5 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{
                          width: `${progress}%`,
                          backgroundColor: sub.color,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-espresso/10 flex items-center justify-between text-xs text-espresso/60">
            <span>Weekly Target Tracking</span>
            <button
              onClick={() => onNavigateTab('analytics')}
              className="text-cherry font-semibold hover:underline"
            >
              See detailed charts
            </button>
          </div>
        </div>
      </section>

      {/* 4. RECENT SESSIONS FEED */}
      <section className="bg-white rounded-3xl p-6 border border-espresso/15 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-espresso/60" />
            <h3 className="font-bold text-lg text-espresso">Recent Study Sessions</h3>
          </div>
          <button
            onClick={() => onNavigateTab('history')}
            className="text-xs font-semibold text-espresso/70 hover:text-espresso flex items-center gap-1"
          >
            <span>View Full History</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {recentSessions.length === 0 ? (
          <div className="py-6 text-center text-xs text-espresso/40">
            No sessions logged yet. Complete a focus block to see your achievements!
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {recentSessions.map((sess) => {
              const sub = subjects.find((s) => s.id === sess.subjectId);
              const date = new Date(sess.startTime);
              return (
                <div
                  key={sess.id}
                  className="p-3.5 rounded-2xl bg-ivory/50 border border-espresso/10 hover:border-espresso/30 transition"
                >
                  <div className="flex items-center justify-between text-xs mb-1">
                    <div className="flex items-center gap-1.5">
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: sub?.color || '#3B82F6' }}
                      />
                      <span className="font-bold text-espresso">{sub?.name || 'General'}</span>
                    </div>
                    <span className="text-[10px] text-espresso/40">
                      {date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </span>
                  </div>

                  <div className="text-xl font-black font-pixel text-espresso mt-1">
                    {formatDuration(sess.actualDuration)}
                  </div>

                  <div className="text-[10px] text-espresso/50 mt-1 capitalize">
                    {sess.mode} • {sess.status.replace('_', ' ')}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};
