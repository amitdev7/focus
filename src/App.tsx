import React, { useState, useEffect, useCallback } from 'react';
import type { StoredData, StudySession, ThemeId, UserSettings, TimerMode } from './types';
import { StorageService } from './services/storage';
import { useTimer } from './hooks/useTimer';
import { Sidebar, NavTab } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { MobileNav } from './components/layout/MobileNav';
import { DashboardOverview } from './components/dashboard/DashboardOverview';
import { MainTimerCard } from './components/timer/MainTimerCard';
import { BreakTimerCard } from './components/break/BreakTimerCard';
import { AnalyticsDashboard } from './components/analytics/AnalyticsDashboard';
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
    setDurationMinutes,
    switchMode,
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
  const analytics = computeAnalytics(data.sessions, data.userSettings);

  // Global Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
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

  // Settings Actions
  const handleUpdateSettings = (newSettings: UserSettings) => {
    updateData({
      ...data,
      userSettings: newSettings,
    });
    setActiveTheme(newSettings.theme);
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
      {/* Distraction-Free Focus Mode Overlay: EVERYTHING not showing and ONLY timer area shows */}
      {isFocusMode && (
        <DistractionFreeView
          timerState={timerState}
          activeTheme={activeTheme}
          onStart={startTimer}
          onPause={pauseTimer}
          onResume={resumeTimer}
          onReset={resetTimer}
          onExit={() => setIsFocusMode(false)}
        />
      )}

      {/* Desktop Sidebar Navigation (No subjects, tasks, or study history) */}
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
              sessions={data.sessions}
              settings={data.userSettings}
              activeTheme={activeTheme}
              onThemeChange={handleThemeChange}
              onStart={startTimer}
              onPause={pauseTimer}
              onResume={resumeTimer}
              onReset={resetTimer}
              onSwitchMode={switchMode}
              onSetDuration={setDurationMinutes}
              onEnterFocusMode={() => setIsFocusMode(true)}
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
                settings={data.userSettings}
                activeTheme={activeTheme}
                onThemeChange={handleThemeChange}
                onStart={startTimer}
                onPause={pauseTimer}
                onResume={resumeTimer}
                onReset={resetTimer}
                onSwitchMode={switchMode}
                onSetDuration={setDurationMinutes}
                onEnterFocusMode={() => setIsFocusMode(true)}
              />
            </div>
          )}

          {/* TAB 3: BREAK (Only Breaks of Time) */}
          {activeTab === 'break' && (
            <BreakTimerCard
              timerState={timerState}
              settings={data.userSettings}
              activeTheme={activeTheme}
              onStart={startTimer}
              onPause={pauseTimer}
              onResume={resumeTimer}
              onReset={resetTimer}
              onSetBreakDuration={(min) => setDurationMinutes(min, 'break')}
            />
          )}

          {/* TAB 4: STUDY ANALYTICS */}
          {activeTab === 'analytics' && (
            <AnalyticsDashboard
              sessions={data.sessions}
              settings={data.userSettings}
            />
          )}

          {/* TAB 5: SETTINGS */}
          {activeTab === 'settings' && (
            <SettingsPage
              settings={data.userSettings}
              onUpdateSettings={handleUpdateSettings}
              onResetTimer={resetTimer}
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

