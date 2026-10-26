import React, { useState } from 'react';
import { Play, Pause, RotateCcw, SkipForward, Sliders, Maximize2, CheckCircle2, BookOpen, CheckSquare } from 'lucide-react';
import { ActiveTimerState, Subject, Task, ThemeId, TimerMode, UserSettings } from '../../types';
import { PixelCherry } from '../common/PixelCherry';
import { CustomTimerModal } from './CustomTimerModal';

interface MainTimerCardProps {
  timerState: ActiveTimerState;
  subjects: Subject[];
  tasks: Task[];
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
}

export const MainTimerCard: React.FC<MainTimerCardProps> = ({
  timerState,
  subjects,
  tasks,
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
}) => {
  const [showCustomModal, setShowCustomModal] = useState(false);

  // Formatting minutes:seconds or hours:minutes:seconds
  const formatTime = (totalSeconds: number) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;

    const pad = (n: number) => String(n).padStart(2, '0');

    if (hrs > 0) {
      return `${pad(hrs)}:${pad(mins)}:${pad(secs)}`;
    }
    return `${pad(mins)}:${pad(secs)}`;
  };

  const currentSubject = subjects.find((s) => s.id === timerState.subjectId) || subjects[0];
  const currentTask = tasks.find((t) => t.id === timerState.taskId);

  // Progress percentage of current session
  const progressPercent = Math.max(
    0,
    Math.min(
      100,
      Math.round(
        ((timerState.totalDurationSec - timerState.remainingSec) /
          Math.max(1, timerState.totalDurationSec)) *
          100
      )
    )
  );

  // Filter tasks for current subject
  const subjectTasks = tasks.filter((t) => t.subjectId === currentSubject?.id);

  // Theme-specific styles
  const isCherryBlossom = activeTheme === 'cherry-blossom';
  const isRetroCrt = activeTheme === 'retro-crt';
  const isPixelCherry = activeTheme === 'pixel-cherry';
  const isMidnight = activeTheme === 'midnight-focus';

  return (
    <div className="w-full">
      {/* Timer Card Container */}
      <div
        className={`relative w-full rounded-3xl overflow-hidden border-2 transition-all duration-500 shadow-editorial ${
          isRetroCrt
            ? 'border-purple-900 bg-zinc-950 text-white crt-screen'
            : isMidnight
            ? 'border-zinc-800 bg-zinc-900 text-white'
            : isCherryBlossom
            ? 'border-espresso/30 text-white'
            : 'border-espresso bg-softwhite text-espresso paper-grid'
        }`}
        style={
          isCherryBlossom
            ? {
                backgroundImage: 'url(/assets/cherry-blossom.png)',
                backgroundSize: 'cover',
                backgroundPosition: 'center 40%',
              }
            : undefined
        }
      >
        {/* Scenery Dimmer Overlay for Cherry Blossom to ensure readable white text */}
        {isCherryBlossom && (
          <div className="absolute inset-0 bg-gradient-to-b from-espresso/40 via-espresso/20 to-espresso/60 backdrop-blur-[1px]" />
        )}

        {/* Retro CRT Rainbow Accent Line */}
        {isRetroCrt && (
          <div className="h-1.5 w-full bg-gradient-to-r from-red-500 via-amber-400 via-green-400 via-cyan-400 to-purple-500" />
        )}

        {/* Card Content */}
        <div className="relative z-10 p-6 sm:p-10 flex flex-col items-center justify-between min-h-[460px]">
          {/* Top Bar: Mode Pills & Theme Quick Picker */}
          <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Mode Selector (Pomodoro / Short Break / Long Break) */}
            <div
              className={`inline-flex p-1.5 rounded-full border backdrop-blur-md transition ${
                isCherryBlossom || isRetroCrt || isMidnight
                  ? 'bg-black/35 border-white/20 text-white'
                  : 'bg-ivory border-espresso/20 text-espresso'
              }`}
            >
              {(
                [
                  { id: 'pomodoro', label: 'Pomodoro', min: settings.timer.pomodoroMinutes },
                  { id: 'shortBreak', label: 'Short Break', min: settings.timer.shortBreakMinutes },
                  { id: 'longBreak', label: 'Long Break', min: settings.timer.longBreakMinutes },
                ] as const
              ).map(({ id, label }) => {
                const isActive = timerState.mode === id;
                return (
                  <button
                    key={id}
                    onClick={() => onSwitchMode(id)}
                    className={`px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition ${
                      isActive
                        ? isCherryBlossom || isRetroCrt || isMidnight
                          ? 'bg-white text-espresso shadow-md'
                          : 'bg-espresso text-ivory shadow-pixel-sm'
                        : 'opacity-70 hover:opacity-100'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>

            {/* Top Right: Theme Picker & Focus Mode Button */}
            <div className="flex items-center gap-2">
              <select
                value={activeTheme}
                onChange={(e) => onThemeChange(e.target.value as ThemeId)}
                aria-label="Theme selector"
                className={`text-xs font-semibold px-3 py-1.5 rounded-full border backdrop-blur-md transition cursor-pointer focus:outline-none ${
                  isCherryBlossom || isRetroCrt || isMidnight
                    ? 'bg-black/40 border-white/20 text-white'
                    : 'bg-ivory border-espresso/20 text-espresso'
                }`}
              >
                <option value="cherry-blossom" className="text-espresso">🌸 Cherry Blossom</option>
                <option value="pixel-cherry" className="text-espresso">🍒 Pixel Cherry</option>
                <option value="retro-crt" className="text-espresso">📺 Retro CRT</option>
                <option value="paper-grid" className="text-espresso">📐 Paper &amp; Grid</option>
                <option value="midnight-focus" className="text-espresso">🌙 Midnight Focus</option>
              </select>

              <button
                onClick={onEnterFocusMode}
                title="Enter Distraction-Free Focus Mode"
                className={`p-2 rounded-full border backdrop-blur-md transition hover:scale-105 ${
                  isCherryBlossom || isRetroCrt || isMidnight
                    ? 'bg-black/40 border-white/20 text-white hover:bg-black/60'
                    : 'bg-ivory border-espresso/20 text-espresso hover:bg-espresso/10'
                }`}
              >
                <Maximize2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Central Hero Countdown Timer */}
          <div className="my-8 sm:my-10 text-center flex flex-col items-center">
            {/* Mode & Subject Pill */}
            <div className="flex items-center gap-2 mb-3">
              <span
                className="w-2.5 h-2.5 rounded-full ring-2 ring-white/50"
                style={{ backgroundColor: currentSubject?.color || '#3B82F6' }}
              />
              <span
                className={`text-xs uppercase tracking-widest font-semibold ${
                  isCherryBlossom || isRetroCrt || isMidnight ? 'text-white/80' : 'text-espresso/70'
                }`}
              >
                {timerState.mode === 'shortBreak' || timerState.mode === 'longBreak'
                  ? 'Recharge Break'
                  : `Focusing on ${currentSubject?.name || 'General'}`}
              </span>
            </div>

            {/* The Big Digits */}
            <div
              className={`text-7xl sm:text-8xl md:text-9xl font-black tracking-tight select-none font-sans drop-shadow-md ${
                isCherryBlossom || isRetroCrt || isMidnight ? 'text-white' : 'text-espresso'
              }`}
            >
              {formatTime(timerState.remainingSec)}
            </div>

            {/* Task Indicator (if selected) */}
            {currentTask && (
              <div
                className={`mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs border backdrop-blur-md ${
                  isCherryBlossom || isRetroCrt || isMidnight
                    ? 'bg-black/30 border-white/20 text-white/90'
                    : 'bg-white border-espresso/20 text-espresso'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-sage" />
                <span className="font-medium truncate max-w-xs">{currentTask.title}</span>
              </div>
            )}

            {/* Session Progress Bar */}
            <div className="w-48 sm:w-64 mt-4 flex flex-col items-center gap-1.5">
              <div
                className={`w-full h-1.5 rounded-full overflow-hidden ${
                  isCherryBlossom || isRetroCrt || isMidnight ? 'bg-white/20' : 'bg-espresso/10'
                }`}
              >
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    isCherryBlossom ? 'bg-white' : isRetroCrt ? 'bg-gradient-to-r from-red-400 via-amber-400 to-purple-400' : 'bg-cherry'
                  }`}
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <span
                className={`text-[11px] font-medium ${
                  isCherryBlossom || isRetroCrt || isMidnight ? 'text-white/70' : 'text-espresso/60'
                }`}
              >
                Session progress: {progressPercent}%
              </span>
            </div>
          </div>

          {/* Primary Controls (Start / Pause / Resume / Reset / Skip) */}
          <div className="w-full flex items-center justify-center gap-4">
            {/* Start / Pause Pill Button */}
            {!timerState.isRunning ? (
              <button
                onClick={timerState.isPaused ? onResume : onStart}
                className={`px-8 sm:px-12 py-4 rounded-full font-bold text-base sm:text-lg flex items-center gap-2.5 transition-all shadow-lg hover:scale-105 active:scale-95 pixel-press ${
                  isCherryBlossom
                    ? 'bg-white text-espresso hover:bg-ivory'
                    : isRetroCrt
                    ? 'bg-gradient-to-r from-rose-500 to-purple-600 text-white shadow-crt-glow'
                    : isMidnight
                    ? 'bg-white text-zinc-950 hover:bg-zinc-200'
                    : 'bg-espresso text-ivory shadow-pixel-sm hover:translate-y-[-1px]'
                }`}
              >
                <Play className="w-5 h-5 fill-current" />
                <span>{timerState.isPaused ? 'Resume' : 'Start Focus'}</span>
              </button>
            ) : (
              <button
                onClick={onPause}
                className={`px-8 sm:px-12 py-4 rounded-full font-bold text-base sm:text-lg flex items-center gap-2.5 transition-all shadow-lg hover:scale-105 active:scale-95 ${
                  isCherryBlossom
                    ? 'bg-white text-espresso'
                    : isRetroCrt
                    ? 'bg-amber-400 text-espresso'
                    : isMidnight
                    ? 'bg-amber-400 text-zinc-950'
                    : 'bg-cherry text-white shadow-pixel-sm'
                }`}
              >
                <Pause className="w-5 h-5 fill-current" />
                <span>Pause</span>
              </button>
            )}

            {/* Reset Circular Button */}
            <button
              onClick={onReset}
              title="Reset Timer"
              aria-label="Reset Timer"
              className={`p-4 rounded-full border backdrop-blur-md transition-all hover:scale-110 active:scale-95 ${
                isCherryBlossom || isRetroCrt || isMidnight
                  ? 'bg-black/40 border-white/20 text-white hover:bg-black/60'
                  : 'bg-ivory border-espresso/20 text-espresso hover:bg-white shadow-sm'
              }`}
            >
              <RotateCcw className="w-5 h-5" />
            </button>

            {/* Skip Button */}
            <button
              onClick={onSkip}
              title="Skip to Next"
              aria-label="Skip to Next Session or Break"
              className={`p-4 rounded-full border backdrop-blur-md transition-all hover:scale-110 active:scale-95 ${
                isCherryBlossom || isRetroCrt || isMidnight
                  ? 'bg-black/40 border-white/20 text-white hover:bg-black/60'
                  : 'bg-ivory border-espresso/20 text-espresso hover:bg-white shadow-sm'
              }`}
            >
              <SkipForward className="w-5 h-5" />
            </button>

            {/* Custom Duration Config Button */}
            <button
              onClick={() => setShowCustomModal(true)}
              title="Configure Duration"
              aria-label="Configure Duration"
              className={`p-4 rounded-full border backdrop-blur-md transition-all hover:scale-110 active:scale-95 ${
                isCherryBlossom || isRetroCrt || isMidnight
                  ? 'bg-black/40 border-white/20 text-white hover:bg-black/60'
                  : 'bg-ivory border-espresso/20 text-espresso hover:bg-white shadow-sm'
              }`}
            >
              <Sliders className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Timer Meta Selector Row: Subject & Task Selectors */}
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Subject Picker Dropdown */}
        <div className="flex items-center gap-3 p-3 bg-white rounded-2xl border border-espresso/15 shadow-sm">
          <BookOpen className="w-4 h-4 text-espresso/50 ml-1 shrink-0" />
          <div className="flex-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-espresso/40 block">
              Current Subject
            </label>
            <select
              value={timerState.subjectId}
              onChange={(e) => onSelectSubject(e.target.value)}
              className="w-full bg-transparent text-sm font-semibold text-espresso focus:outline-none cursor-pointer"
            >
              {subjects.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {sub.name}
                </option>
              ))}
            </select>
          </div>
          <span
            className="w-3.5 h-3.5 rounded-full mr-2 shrink-0 border border-espresso/20"
            style={{ backgroundColor: currentSubject?.color || '#3B82F6' }}
          />
        </div>

        {/* Task Picker Dropdown */}
        <div className="flex items-center gap-3 p-3 bg-white rounded-2xl border border-espresso/15 shadow-sm">
          <CheckSquare className="w-4 h-4 text-espresso/50 ml-1 shrink-0" />
          <div className="flex-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-espresso/40 block">
              Associated Task (Optional)
            </label>
            <select
              value={timerState.taskId || ''}
              onChange={(e) => onSelectTask(e.target.value ? e.target.value : undefined)}
              className="w-full bg-transparent text-sm font-semibold text-espresso focus:outline-none cursor-pointer"
            >
              <option value="">No task selected</option>
              {subjectTasks.map((task) => (
                <option key={task.id} value={task.id}>
                  {task.title} {task.completed ? '(Completed)' : ''}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Quick-Start Presets Row */}
      <div className="mt-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold uppercase tracking-wider text-espresso/50">
            Quick-Start Presets
          </span>
          <span className="text-[11px] text-espresso/40">Instant launch</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
          {[
            { label: '25 min Focus', min: 25, desc: 'Classic Pomodoro' },
            { label: '50 min Deep Work', min: 50, desc: 'Standard Block' },
            { label: '1 Hour Study', min: 60, desc: '60 min Session' },
            { label: '90 min Deep Work', min: 90, desc: 'Flow State' },
          ].map(({ label, min, desc }) => {
            const isCurrent =
              timerState.totalDurationSec === min * 60 &&
              (timerState.mode === 'pomodoro' || timerState.mode === 'custom');

            return (
              <button
                key={min}
                onClick={() => onSetDuration(min, 'custom')}
                className={`p-3 rounded-2xl border text-left transition-all pixel-press ${
                  isCurrent
                    ? 'bg-espresso text-ivory border-espresso shadow-pixel-sm'
                    : 'bg-white hover:bg-ivory text-espresso border-espresso/15 hover:border-espresso/35'
                }`}
              >
                <div className="text-xs font-bold font-pixel tracking-wide">{label}</div>
                <div
                  className={`text-[10px] mt-0.5 ${
                    isCurrent ? 'text-ivory/70' : 'text-espresso/50'
                  }`}
                >
                  {desc}
                </div>
              </button>
            );
          })}

          {/* Custom Timer Preset Button */}
          <button
            onClick={() => setShowCustomModal(true)}
            className="p-3 rounded-2xl border text-left transition-all bg-white hover:bg-ivory text-espresso border-espresso/15 hover:border-espresso/35 pixel-press"
          >
            <div className="text-xs font-bold font-pixel tracking-wide flex items-center justify-between">
              <span>Custom</span>
              <Sliders className="w-3.5 h-3.5 text-cherry" />
            </div>
            <div className="text-[10px] mt-0.5 text-espresso/50">Any minutes</div>
          </button>
        </div>
      </div>

      {/* Custom Duration Modal */}
      <CustomTimerModal
        currentMinutes={Math.round(timerState.totalDurationSec / 60)}
        isOpen={showCustomModal}
        onClose={() => setShowCustomModal(false)}
        onApply={(minutes) => onSetDuration(minutes, 'custom')}
      />
    </div>
  );
};
