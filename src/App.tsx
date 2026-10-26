import React, { useState, useEffect, useCallback } from 'react';
import { StoredData, StudySession, Subject, Task, ThemeId, UserSettings, TimerMode } from './types';
import { StorageService } from './services/storage';
import { useTimer } from './hooks/useTimer';
import { Sidebar, NavTab } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { MobileNav } from './components/layout/MobileNav';
import { DashboardOverview } from './components/dashboard/DashboardOverview';
import { MainTimerCard } from './components/timer/MainTimerCard';
import { SubjectManager } from './components/subjects/SubjectManager';
import { TaskManager } from './components/tasks/TaskManager';
import { AnalyticsDashboard } from './components/analytics/AnalyticsDashboard';
import { StudyHistory } from './components/history/StudyHistory';
import { SettingsPage } from './components/settings/SettingsPage';
import { CompletionModal } from './components/timer/CompletionModal';
import { ManualStopModal } from './components/timer/ManualStopModal';
import { DistractionFreeView } from './components/timer/DistractionFreeView';
import { computeAnalytics } from './services/analytics';

export function App() {
  // 1. Core Persistent State
  const [data, setData] = useState<StoredData>(() => StorageService.loadData());
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [activeTheme, setActiveTheme] = useState<ThemeId>(data.userSettings.theme || 'cherry-blossom');
  const [isFocusMode, setIsFocusMode] = useState(false);

  // Sync data to localStorage
  const updateData = useCallback((newData: StoredData) => {
    setData(newData);
    StorageService.saveData(newData);
  }, []);

  // Save session handler
  const handleSaveSession = useCallback(
    (newSession: StudySession) => {
      setData((prev) => {
        const updatedSessions = [newSession, ...prev.sessions];
        const nextData = { ...prev, sessions: updatedSessions };
        StorageService.saveData(nextData);
        return nextData;
      });
    },
    []
  );

  // 2. Timer Engine
  const {
    timerState,
    startTimer,
    pauseTimer,
    resumeTimer,
    resetTimer,
    skipToNext,
    setDurationMinutes,
    switchMode,
    setSubjectId,
    setTaskId,
    showCompletionModal,
    setShowCompletionModal,
    completedSessionData,
    showManualStopPrompt,
    confirmSavePartialSession,
    discardPartialSession,
  } = useTimer({
    settings: data.userSettings,
    onSessionComplete: handleSaveSession,
    onPartialSessionSave: handleSaveSession,
  });

  // Calculate streak days
  const analytics = computeAnalytics(data.sessions, data.subjects, data.userSettings);

  // Global Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if user is typing in an input or textarea
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT') {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        if (timerState.isRunning) {
          pauseTimer();
        } else if (timerState.isPaused) {
          resumeTimer();
        } else {
          startTimer();
        }
      } else if (e.key === 'r' || e.key === 'R') {
        resetTimer();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [timerState, startTimer, pauseTimer, resumeTimer, resetTimer]);

  // Handle Theme switching
  const handleThemeChange = (newTheme: ThemeId) => {
    setActiveTheme(newTheme);
    const updatedSettings = { ...data.userSettings, theme: newTheme };
    const updatedData = { ...data, userSettings: updatedSettings };
    updateData(updatedData);
  };

  // Subject Actions
  const handleAddSubject = (subject: Omit<Subject, 'id' | 'createdAt'>) => {
    const newSubject: Subject = {
      ...subject,
      id: `subj-${Date.now()}`,
      createdAt: Date.now(),
    };
    updateData({
      ...data,
      subjects: [...data.subjects, newSubject],
    });
  };

  const handleEditSubject = (subject: Subject) => {
    updateData({
      ...data,
      subjects: data.subjects.map((s) => (s.id === subject.id ? subject : s)),
    });
  };

  const handleDeleteSubject = (subjectId: string) => {
    updateData({
      ...data,
      subjects: data.subjects.filter((s) => s.id !== subjectId),
    });
    if (timerState.subjectId === subjectId) {
      const remaining = data.subjects.filter((s) => s.id !== subjectId);
      if (remaining.length > 0) {
        setSubjectId(remaining[0].id);
      }
    }
  };

  // Task Actions
  const handleAddTask = (task: Omit<Task, 'id' | 'createdAt'>) => {
    const newTask: Task = {
      ...task,
      id: `task-${Date.now()}`,
      createdAt: Date.now(),
    };
    updateData({
      ...data,
      tasks: [newTask, ...data.tasks],
    });
  };

  const handleToggleTask = (taskId: string) => {
    updateData({
      ...data,
      tasks: data.tasks.map((t) =>
        t.id === taskId
          ? { ...t, completed: !t.completed, completedAt: !t.completed ? Date.now() : undefined }
          : t
      ),
    });
  };

  const handleDeleteTask = (taskId: string) => {
    updateData({
      ...data,
      tasks: data.tasks.filter((t) => t.id !== taskId),
    });
    if (timerState.taskId === taskId) {
      setTaskId(undefined);
    }
  };

  const handleStartTaskTimer = (taskId: string, subjectId: string, durationMinutes?: number) => {
    setSubjectId(subjectId);
    setTaskId(taskId);
    if (durationMinutes) {
      setDurationMinutes(durationMinutes, 'custom');
    }
    setActiveTab('timer');
  };

  // Session History Actions
  const handleDeleteSession = (sessionId: string) => {
    updateData({
      ...data,
      sessions: data.sessions.filter((s) => s.id !== sessionId),
    });
  };

  const handleEditSession = (session: StudySession) => {
    updateData({
      ...data,
      sessions: data.sessions.map((s) => (s.id === session.id ? session : s)),
    });
  };

  // Settings Actions
  const handleUpdateSettings = (newSettings: UserSettings) => {
    updateData({
      ...data,
      userSettings: newSettings,
    });
    setActiveTheme(newSettings.theme);
  };

  const handleResetAllData = () => {
    const clean = StorageService.resetAllData();
    setData(clean);
    setActiveTheme(clean.userSettings.theme);
    setActiveTab('dashboard');
  };

  const handleDataImported = () => {
    const reloaded = StorageService.loadData();
    setData(reloaded);
    setActiveTheme(reloaded.userSettings.theme);
  };

  // Handle Break & Next Session Start from Completion Modal
  const handleStartBreak = (minutes: number) => {
    setDurationMinutes(minutes, minutes > 10 ? 'longBreak' : 'shortBreak');
    startTimer();
  };

  const handleStartNextFocus = () => {
    setDurationMinutes(data.userSettings.timer.pomodoroMinutes || 25, 'pomodoro');
    startTimer();
  };

  return (
    <div className={`min-h-screen flex ${activeTheme === 'midnight-focus' ? 'dark bg-zinc-950 text-white' : 'bg-ivory text-espresso'}`}>
      {/* Distraction-Free Focus Mode Overlay */}
      {isFocusMode && (
        <DistractionFreeView
          timerState={timerState}
          subjects={data.subjects}
          tasks={data.tasks}
          settings={data.userSettings}
          activeTheme={activeTheme}
          onThemeChange={handleThemeChange}
          onStart={startTimer}
          onPause={pauseTimer}
          onResume={resumeTimer}
          onReset={resetTimer}
          onSkip={skipToNext}
          onExit={() => setIsFocusMode(false)}
        />
      )}

      {/* Desktop Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        streakDays={analytics.currentStreakDays}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen overflow-x-hidden pb-20 lg:pb-12">
        <div className="max-w-6xl w-full mx-auto px-4 sm:px-8 py-6 sm:py-8 space-y-6">
          {/* Header */}
          <Header
            settings={data.userSettings}
            todayDurationSec={analytics.todayDurationSec}
            onEnterFocusMode={() => setIsFocusMode(true)}
          />

          {/* TAB 1: DASHBOARD */}
          {activeTab === 'dashboard' && (
            <DashboardOverview
              timerState={timerState}
              subjects={data.subjects}
              tasks={data.tasks}
              sessions={data.sessions}
              settings={data.userSettings}
              activeTheme={activeTheme}
              onThemeChange={handleThemeChange}
              onStart={startTimer}
              onPause={pauseTimer}
              onResume={resumeTimer}
              onReset={resetTimer}
              onSkip={skipToNext}
              onSwitchMode={switchMode}
              onSetDuration={setDurationMinutes}
              onSelectSubject={setSubjectId}
              onSelectTask={setTaskId}
              onEnterFocusMode={() => setIsFocusMode(true)}
              onToggleTask={handleToggleTask}
              onNavigateTab={setActiveTab}
            />
          )}

          {/* TAB 2: DEDICATED FOCUS TIMER */}
          {activeTab === 'timer' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-black text-espresso tracking-tight">
                    Focus Timer
                  </h2>
                  <p className="text-sm text-espresso/60 mt-1">
                    Configure your deep work blocks, customize ambient themes, and stay in flow.
                  </p>
                </div>
              </div>

              <MainTimerCard
                timerState={timerState}
                subjects={data.subjects}
                tasks={data.tasks}
                settings={data.userSettings}
                activeTheme={activeTheme}
                onThemeChange={handleThemeChange}
                onStart={startTimer}
                onPause={pauseTimer}
                onResume={resumeTimer}
                onReset={resetTimer}
                onSkip={skipToNext}
                onSwitchMode={switchMode}
                onSetDuration={setDurationMinutes}
                onSelectSubject={setSubjectId}
                onSelectTask={setTaskId}
                onEnterFocusMode={() => setIsFocusMode(true)}
              />
            </div>
          )}

          {/* TAB 3: SUBJECTS */}
          {activeTab === 'subjects' && (
            <SubjectManager
              subjects={data.subjects}
              sessions={data.sessions}
              onAddSubject={handleAddSubject}
              onEditSubject={handleEditSubject}
              onDeleteSubject={handleDeleteSubject}
              onSelectForTimer={(subId) => {
                setSubjectId(subId);
                setActiveTab('timer');
              }}
            />
          )}

          {/* TAB 4: TASKS */}
          {activeTab === 'tasks' && (
            <TaskManager
              tasks={data.tasks}
              subjects={data.subjects}
              sessions={data.sessions}
              onAddTask={handleAddTask}
              onToggleTask={handleToggleTask}
              onDeleteTask={handleDeleteTask}
              onStartTaskTimer={handleStartTaskTimer}
            />
          )}

          {/* TAB 5: STUDY ANALYTICS */}
          {activeTab === 'analytics' && (
            <AnalyticsDashboard
              sessions={data.sessions}
              subjects={data.subjects}
              settings={data.userSettings}
            />
          )}

          {/* TAB 6: STUDY HISTORY */}
          {activeTab === 'history' && (
            <StudyHistory
              sessions={data.sessions}
              subjects={data.subjects}
              tasks={data.tasks}
              onDeleteSession={handleDeleteSession}
              onEditSession={handleEditSession}
            />
          )}

          {/* TAB 7: SETTINGS */}
          {activeTab === 'settings' && (
            <SettingsPage
              settings={data.userSettings}
              subjects={data.subjects}
              onUpdateSettings={handleUpdateSettings}
              onResetAllData={handleResetAllData}
              onDataImported={handleDataImported}
            />
          )}
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileNav activeTab={activeTab} onSelectTab={setActiveTab} />

      {/* Completion Modal Celebration */}
      {showCompletionModal && (
        <CompletionModal
          session={completedSessionData}
          subjects={data.subjects}
          onClose={() => setShowCompletionModal(false)}
          onStartBreak={handleStartBreak}
          onStartNextFocus={handleStartNextFocus}
        />
      )}

      {/* Manual Stop Partial Session Modal */}
      {showManualStopPrompt && (
        <ManualStopModal
          elapsedSec={timerState.totalDurationSec - timerState.remainingSec}
          plannedSec={timerState.totalDurationSec}
          onSave={confirmSavePartialSession}
          onDiscard={discardPartialSession}
          onCancel={() => discardPartialSession()}
        />
      )}
    </div>
  );
}

export default App;
