import { useState, useEffect, useRef, useCallback } from 'react';
import { ActiveTimerState, TimerMode, StudySession, UserSettings } from '../types';
import { StorageService } from '../services/storage';
import { soundService } from '../services/sound';
import { NotificationService } from '../services/notification';

interface UseTimerProps {
  settings: UserSettings;
  onSessionComplete: (session: StudySession) => void;
  onPartialSessionSave?: (session: StudySession) => void;
}

export function useTimer({ settings, onSessionComplete, onPartialSessionSave }: UseTimerProps) {
  // Load initial state or defaults
  const [timerState, setTimerState] = useState<ActiveTimerState>(() => {
    const saved = StorageService.loadActiveTimer();
    if (saved) {
      // Re-hydrate state from targetEndTime if it was running
      if (saved.isRunning && !saved.isPaused && saved.targetEndTime) {
        const now = Date.now();
        const diffMs = saved.targetEndTime - now;
        if (diffMs <= 0) {
          // Timer expired while away! Will trigger zero check
          return {
            ...saved,
            remainingSec: 0,
            isRunning: false,
            isPaused: false,
          };
        } else {
          return {
            ...saved,
            remainingSec: Math.ceil(diffMs / 1000),
          };
        }
      }
      return saved;
    }

    const defaultDurationSec = (settings.timer?.pomodoroMinutes || 25) * 60;
    return {
      mode: 'pomodoro',
      isRunning: false,
      isPaused: false,
      totalDurationSec: defaultDurationSec,
      remainingSec: defaultDurationSec,
      targetEndTime: null,
      accumulatedActiveSec: 0,
      pausedAt: null,
      subjectId: settings.defaultSubjectId || 'subj-math',
      pomodoroCount: 0,
      startedAt: null,
    };
  });

  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [completedSessionData, setCompletedSessionData] = useState<StudySession | null>(null);
  const [showManualStopPrompt, setShowManualStopPrompt] = useState(false);

  // Prevent duplicate completion saves
  const isCompletingRef = useRef(false);
  const animFrameRef = useRef<number | null>(null);

  // Sync to localStorage whenever timerState changes
  useEffect(() => {
    StorageService.saveActiveTimer(timerState);
  }, [timerState]);

  // Handle completion
  const handleTimerComplete = useCallback(() => {
    if (isCompletingRef.current) return;
    isCompletingRef.current = true;

    const now = Date.now();
    const finalActual = timerState.totalDurationSec;
    const isFocusSession = timerState.mode === 'pomodoro' || timerState.mode === 'custom';

    const newSession: StudySession = {
      id: `sess-${now}-${Math.random().toString(36).substring(2, 7)}`,
      startTime: timerState.startedAt || now - finalActual * 1000,
      endTime: now,
      plannedDuration: timerState.totalDurationSec,
      actualDuration: finalActual,
      subjectId: timerState.subjectId,
      taskId: timerState.taskId,
      mode: timerState.mode,
      status: 'completed',
    };

    // Play celebration audio if enabled
    if (settings.timer.soundEnabled) {
      if (isFocusSession) {
        soundService.playCompletionChime(settings.timer.soundVolume);
      } else {
        soundService.playGentleBell(settings.timer.soundVolume);
      }
    }

    // Trigger browser notification if enabled
    if (settings.timer.notificationsEnabled) {
      const title = isFocusSession ? '🎉 Focus Session Complete!' : '☕ Break Finished!';
      const body = isFocusSession
        ? `Great work! You focused for ${Math.round(finalActual / 60)} minutes. Time for a well-deserved break.`
        : 'Break is over. Ready to dive into the next session?';
      NotificationService.show(title, { body });
    }

    // Save session in data store if it's a focus session
    if (isFocusSession) {
      onSessionComplete(newSession);
    }

    setCompletedSessionData(newSession);
    setShowCompletionModal(true);

    // Prepare next mode
    const nextPomodoroCount = isFocusSession ? timerState.pomodoroCount + 1 : timerState.pomodoroCount;
    let nextMode: TimerMode = 'pomodoro';
    let nextDurationSec = (settings.timer.pomodoroMinutes || 25) * 60;

    if (isFocusSession) {
      if (nextPomodoroCount % (settings.timer.longBreakInterval || 4) === 0) {
        nextMode = 'longBreak';
        nextDurationSec = (settings.timer.longBreakMinutes || 15) * 60;
      } else {
        nextMode = 'shortBreak';
        nextDurationSec = (settings.timer.shortBreakMinutes || 5) * 60;
      }
    }

    setTimerState((prev) => ({
      ...prev,
      mode: nextMode,
      isRunning: settings.timer.autoStartBreaks && !isFocusSession ? true : false,
      isPaused: false,
      totalDurationSec: nextDurationSec,
      remainingSec: nextDurationSec,
      targetEndTime: null,
      accumulatedActiveSec: 0,
      pausedAt: null,
      startedAt: null,
      pomodoroCount: nextPomodoroCount,
    }));

    setTimeout(() => {
      isCompletingRef.current = false;
    }, 1000);
  }, [timerState, settings, onSessionComplete]);

  // Main countdown loop using requestAnimationFrame + Date.now() timestamp math
  useEffect(() => {
    if (!timerState.isRunning || timerState.isPaused || !timerState.targetEndTime) {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
      return;
    }

    let lastSec = timerState.remainingSec;

    const tick = () => {
      const now = Date.now();
      const remainingMs = timerState.targetEndTime! - now;
      const currentRemainingSec = Math.max(0, Math.ceil(remainingMs / 1000));

      if (currentRemainingSec !== lastSec) {
        lastSec = currentRemainingSec;
        setTimerState((prev) => ({
          ...prev,
          remainingSec: currentRemainingSec,
        }));
      }

      if (remainingMs <= 0) {
        handleTimerComplete();
        return;
      }

      animFrameRef.current = requestAnimationFrame(tick);
    };

    animFrameRef.current = requestAnimationFrame(tick);

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [timerState.isRunning, timerState.isPaused, timerState.targetEndTime, handleTimerComplete]);

  // Recalculate accurately when user returns to tab (visibility change / wake from sleep)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && timerState.isRunning && !timerState.isPaused && timerState.targetEndTime) {
        const now = Date.now();
        const diffMs = timerState.targetEndTime - now;
        if (diffMs <= 0) {
          handleTimerComplete();
        } else {
          setTimerState((prev) => ({
            ...prev,
            remainingSec: Math.ceil(diffMs / 1000),
          }));
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [timerState.isRunning, timerState.isPaused, timerState.targetEndTime, handleTimerComplete]);

  // ACTIONS
  const startTimer = useCallback(() => {
    if (settings.timer.soundEnabled) soundService.playClick(settings.timer.soundVolume);

    const now = Date.now();
    const targetEndTime = now + timerState.remainingSec * 1000;

    setTimerState((prev) => ({
      ...prev,
      isRunning: true,
      isPaused: false,
      targetEndTime,
      pausedAt: null,
      startedAt: prev.startedAt || now,
    }));
  }, [timerState.remainingSec, settings.timer]);

  const pauseTimer = useCallback(() => {
    if (settings.timer.soundEnabled) soundService.playClick(settings.timer.soundVolume);

    const now = Date.now();
    let calculatedRemaining = timerState.remainingSec;
    if (timerState.targetEndTime) {
      calculatedRemaining = Math.max(0, Math.ceil((timerState.targetEndTime - now) / 1000));
    }

    const elapsedInSegment = timerState.totalDurationSec - calculatedRemaining - timerState.accumulatedActiveSec;
    const newAccumulated = timerState.accumulatedActiveSec + Math.max(0, elapsedInSegment);

    setTimerState((prev) => ({
      ...prev,
      isRunning: false,
      isPaused: true,
      remainingSec: calculatedRemaining,
      targetEndTime: null,
      pausedAt: now,
      accumulatedActiveSec: newAccumulated,
    }));
  }, [timerState, settings.timer]);

  const resumeTimer = useCallback(() => {
    if (settings.timer.soundEnabled) soundService.playClick(settings.timer.soundVolume);

    const now = Date.now();
    const targetEndTime = now + timerState.remainingSec * 1000;

    setTimerState((prev) => ({
      ...prev,
      isRunning: true,
      isPaused: false,
      targetEndTime,
      pausedAt: null,
    }));
  }, [timerState.remainingSec, settings.timer]);

  // Stop / Reset with partial session prompt if active study time occurred
  const resetTimer = useCallback(() => {
    if (settings.timer.soundEnabled) soundService.playClick(settings.timer.soundVolume);

    // Calculate active focused time spent
    const now = Date.now();
    let currentRemaining = timerState.remainingSec;
    if (timerState.isRunning && timerState.targetEndTime) {
      currentRemaining = Math.max(0, Math.ceil((timerState.targetEndTime - now) / 1000));
    }
    const totalElapsedSoFar = timerState.totalDurationSec - currentRemaining;

    const isFocus = timerState.mode === 'pomodoro' || timerState.mode === 'custom';

    // If user spent more than 60 seconds studying in this session, ask if they want to save partial progress
    if (isFocus && totalElapsedSoFar >= 60 && (timerState.isRunning || timerState.isPaused)) {
      setShowManualStopPrompt(true);
      return;
    }

    // Direct clean reset without false session saving
    setTimerState((prev) => ({
      ...prev,
      isRunning: false,
      isPaused: false,
      remainingSec: prev.totalDurationSec,
      targetEndTime: null,
      accumulatedActiveSec: 0,
      pausedAt: null,
      startedAt: null,
    }));
  }, [timerState, settings.timer]);

  const confirmSavePartialSession = useCallback(() => {
    const now = Date.now();
    let currentRemaining = timerState.remainingSec;
    if (timerState.isRunning && timerState.targetEndTime) {
      currentRemaining = Math.max(0, Math.ceil((timerState.targetEndTime - now) / 1000));
    }
    const actualElapsed = Math.max(1, timerState.totalDurationSec - currentRemaining);

    const partialSession: StudySession = {
      id: `sess-partial-${now}`,
      startTime: timerState.startedAt || now - actualElapsed * 1000,
      endTime: now,
      plannedDuration: timerState.totalDurationSec,
      actualDuration: actualElapsed,
      subjectId: timerState.subjectId,
      taskId: timerState.taskId,
      mode: timerState.mode,
      status: 'manual_stop',
      notes: 'Manually stopped session',
    };

    if (onPartialSessionSave) {
      onPartialSessionSave(partialSession);
    }

    setShowManualStopPrompt(false);
    setTimerState((prev) => ({
      ...prev,
      isRunning: false,
      isPaused: false,
      remainingSec: prev.totalDurationSec,
      targetEndTime: null,
      accumulatedActiveSec: 0,
      pausedAt: null,
      startedAt: null,
    }));
  }, [timerState, onPartialSessionSave]);

  const discardPartialSession = useCallback(() => {
    setShowManualStopPrompt(false);
    setTimerState((prev) => ({
      ...prev,
      isRunning: false,
      isPaused: false,
      remainingSec: prev.totalDurationSec,
      targetEndTime: null,
      accumulatedActiveSec: 0,
      pausedAt: null,
      startedAt: null,
    }));
  }, []);

  const skipToNext = useCallback(() => {
    if (settings.timer.soundEnabled) soundService.playClick(settings.timer.soundVolume);

    const isFocus = timerState.mode === 'pomodoro' || timerState.mode === 'custom';
    let nextMode: TimerMode = 'pomodoro';
    let nextDurationSec = (settings.timer.pomodoroMinutes || 25) * 60;

    if (isFocus) {
      const nextCount = timerState.pomodoroCount + 1;
      if (nextCount % (settings.timer.longBreakInterval || 4) === 0) {
        nextMode = 'longBreak';
        nextDurationSec = (settings.timer.longBreakMinutes || 15) * 60;
      } else {
        nextMode = 'shortBreak';
        nextDurationSec = (settings.timer.shortBreakMinutes || 5) * 60;
      }
    }

    setTimerState((prev) => ({
      ...prev,
      mode: nextMode,
      isRunning: false,
      isPaused: false,
      totalDurationSec: nextDurationSec,
      remainingSec: nextDurationSec,
      targetEndTime: null,
      accumulatedActiveSec: 0,
      pausedAt: null,
      startedAt: null,
    }));
  }, [timerState, settings.timer]);

  const setDurationMinutes = useCallback((minutes: number, mode: TimerMode = 'custom') => {
    const validMinutes = Math.max(1, Math.min(720, minutes));
    const sec = validMinutes * 60;

    setTimerState((prev) => ({
      ...prev,
      mode,
      isRunning: false,
      isPaused: false,
      totalDurationSec: sec,
      remainingSec: sec,
      targetEndTime: null,
      accumulatedActiveSec: 0,
      pausedAt: null,
      startedAt: null,
    }));
  }, []);

  const switchMode = useCallback((mode: TimerMode) => {
    let minutes = settings.timer.pomodoroMinutes || 25;
    if (mode === 'shortBreak') minutes = settings.timer.shortBreakMinutes || 5;
    if (mode === 'longBreak') minutes = settings.timer.longBreakMinutes || 15;

    const sec = minutes * 60;
    setTimerState((prev) => ({
      ...prev,
      mode,
      isRunning: false,
      isPaused: false,
      totalDurationSec: sec,
      remainingSec: sec,
      targetEndTime: null,
      accumulatedActiveSec: 0,
      pausedAt: null,
      startedAt: null,
    }));
  }, [settings.timer]);

  const setSubjectId = useCallback((subjectId: string) => {
    setTimerState((prev) => ({ ...prev, subjectId }));
  }, []);

  const setTaskId = useCallback((taskId?: string) => {
    setTimerState((prev) => ({ ...prev, taskId }));
  }, []);

  return {
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
  };
}
