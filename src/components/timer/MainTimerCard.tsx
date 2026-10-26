import React, { useState } from 'react';
import { Play, Pause, RotateCcw, Sliders, Maximize2 } from 'lucide-react';
import type { ActiveTimerState, ThemeId, TimerMode, UserSettings } from '../../types';
import { CustomTimerModal } from './CustomTimerModal';

interface MainTimerCardProps {
  timerState: ActiveTimerState;
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
}

export const MainTimerCard: React.FC<MainTimerCardProps> = ({
  timerState,
  activeTheme,
  onThemeChange,
  onStart,
  onPause,
  onResume,
  onReset,
  onSwitchMode,
  onSetDuration,
  onEnterFocusMode,
}) => {
  const [showCustomModal, setShowCustomModal] = useState(false);

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

  const isCherryBlossom = activeTheme === 'cherry-blossom';
  const isRetroCrt = activeTheme === 'retro-crt';
  const isMidnight = activeTheme === 'midnight-focus';

  return (
    <div className="w-full">
      <div
        className={`relative w-full rounded-3xl overflow-hidden border-2 transition-all duration-500 shadow-editorial ${isRetroCrt
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
        {isCherryBlossom && (
          <div className="absolute inset-0 bg-gradient-to-b from-espresso/40 via-espresso/20 to-espresso/60 backdrop-blur-[1px]" />
        )}

        {isRetroCrt && (
          <div className="h-1.5 w-full bg-gradient-to-r from-red-500 via-amber-400 via-green-400 via-cyan-400 to-purple-500" />
        )}

        <div className="relative z-10 p-6 sm:p-10 flex flex-col items-center justify-between min-h-[440px]">
          {/* Top Bar */}
          <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-4">
            <div
              className={`inline-flex p-1.5 rounded-full border backdrop-blur-md transition ${isCherryBlossom || isRetroCrt || isMidnight
                  ? 'bg-black/35 border-white/20 text-white'
                  : 'bg-ivory border-espresso/20 text-espresso'
                }`}
            >
              {(
                [
                  { id: 'pomodoro' as const, label: 'Pomodoro' },
                  { id: 'shortBreak' as const, label: 'Short Break' },
                  { id: 'longBreak' as const, label: 'Long Break' },
                ]
              ).map(({ id, label }) => {
                const isActive = timerState.mode === id;
                return (
                  <button
                    key={id}
                    onClick={() => onSwitchMode(id)}
                    className={`px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition ${isActive
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

            <div className="flex items-center gap-2">
              <select
                value={activeTheme}
                onChange={(e) => onThemeChange(e.target.value as ThemeId)}
                aria-label="Theme selector"
                className={`text-xs font-semibold px-3 py-1.5 rounded-full border backdrop-blur-md transition cursor-pointer focus:outline-none ${isCherryBlossom || isRetroCrt || isMidnight
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
                className={`p-2 rounded-full border backdrop-blur-md transition hover:scale-105 ${isCherryBlossom || isRetroCrt || isMidnight
                    ? 'bg-black/40 border-white/20 text-white hover:bg-black/60'
                    : 'bg-ivory border-espresso/20 text-espresso hover:bg-espresso/10'
                  }`}
              >
                <Maximize2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Central Countdown */}
          <div className="my-8 sm:my-10 text-center flex flex-col items-center">
            <div
              className={`text-xs uppercase tracking-widest font-semibold mb-2 ${isCherryBlossom || isRetroCrt || isMidnight ? 'text-white/80' : 'text-espresso/70'
                }`}
            >
              {timerState.mode === 'shortBreak' || timerState.mode === 'longBreak' || timerState.mode === 'break'
                ? 'Recharge Break'
                : 'Focus Session'}
            </div>

            <div
              className={`text-7xl sm:text-8xl md:text-9xl font-black tracking-tight select-none font-sans drop-shadow-md ${isCherryBlossom || isRetroCrt || isMidnight ? 'text-white' : 'text-espresso'
                }`}
            >
              {formatTime(timerState.remainingSec)}
            </div>

            <div className="w-48 sm:w-64 mt-4 flex flex-col items-center gap-1.5">
              <div
                className={`w-full h-1.5 rounded-full overflow-hidden ${isCherryBlossom || isRetroCrt || isMidnight ? 'bg-white/20' : 'bg-espresso/10'
                  }`}
              >
                <div
                  className={`h-full rounded-full transition-all duration-300 ${isCherryBlossom
                      ? 'bg-white'
                      : isRetroCrt
                        ? 'bg-gradient-to-r from-red-400 via-amber-400 to-purple-400'
                        : 'bg-cherry'
                    }`}
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <span
                className={`text-[11px] font-medium ${isCherryBlossom || isRetroCrt || isMidnight ? 'text-white/70' : 'text-espresso/60'
                  }`}
              >
                Session progress: {progressPercent}%
              </span>
            </div>
          </div>

          {/* Controls: Start/Pause, Reset, Custom Duration (NO SKIP) */}
          <div className="w-full flex items-center justify-center gap-4">
            {!timerState.isRunning ? (
              <button
                onClick={timerState.isPaused ? onResume : onStart}
                className={`px-10 sm:px-14 py-4 rounded-full font-bold text-base sm:text-lg flex items-center gap-2.5 transition-all shadow-lg hover:scale-105 active:scale-95 pixel-press ${isCherryBlossom
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
                className={`px-10 sm:px-14 py-4 rounded-full font-bold text-base sm:text-lg flex items-center gap-2.5 transition-all shadow-lg hover:scale-105 active:scale-95 ${isCherryBlossom
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

            <button
              onClick={onReset}
              title="Reset Timer"
              aria-label="Reset Timer"
              className={`p-4 rounded-full border backdrop-blur-md transition-all hover:scale-110 active:scale-95 ${isCherryBlossom || isRetroCrt || isMidnight
                  ? 'bg-black/40 border-white/20 text-white hover:bg-black/60'
                  : 'bg-ivory border-espresso/20 text-espresso hover:bg-white shadow-sm'
                }`}
            >
              <RotateCcw className="w-5 h-5" />
            </button>

            <button
              onClick={() => setShowCustomModal(true)}
              title="Configure Duration"
              aria-label="Configure Duration"
              className={`p-4 rounded-full border backdrop-blur-md transition-all hover:scale-110 active:scale-95 ${isCherryBlossom || isRetroCrt || isMidnight
                  ? 'bg-black/40 border-white/20 text-white hover:bg-black/60'
                  : 'bg-ivory border-espresso/20 text-espresso hover:bg-white shadow-sm'
                }`}
            >
              <Sliders className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Quick-Start Presets */}
      <div className="mt-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold uppercase tracking-wider text-espresso/50">
            Quick-Start Focus Presets
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
                className={`p-3 rounded-2xl border text-left transition-all pixel-press ${isCurrent
                    ? 'bg-espresso text-ivory border-espresso shadow-pixel-sm'
                    : 'bg-white hover:bg-ivory text-espresso border-espresso/15 hover:border-espresso/35'
                  }`}
              >
                <div className="text-xs font-bold font-pixel tracking-wide">{label}</div>
                <div
                  className={`text-[10px] mt-0.5 ${isCurrent ? 'text-ivory/70' : 'text-espresso/50'
                    }`}
                >
                  {desc}
                </div>
              </button>
            );
          })}

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

      <CustomTimerModal
        currentMinutes={Math.round(timerState.totalDurationSec / 60)}
        isOpen={showCustomModal}
        onClose={() => setShowCustomModal(false)}
        onApply={(minutes: number) => onSetDuration(minutes, 'custom')}
      />
    </div>
  );
};
