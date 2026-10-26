import React from 'react';
import { Play, Pause, RotateCcw, Coffee, Sparkles } from 'lucide-react';
import type { ActiveTimerState, ThemeId, UserSettings } from '../../types';

interface BreakTimerCardProps {
  timerState: ActiveTimerState;
  settings: UserSettings;
  activeTheme?: ThemeId;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onReset: () => void;
  onSetBreakDuration: (minutes: number) => void;
}

export const BreakTimerCard: React.FC<BreakTimerCardProps> = ({
  timerState,
  settings,
  onStart,
  onPause,
  onResume,
  onReset,
  onSetBreakDuration,
}) => {
  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${pad(mins)}:${pad(secs)}`;
  };

  const isBreakActive = timerState.mode === 'shortBreak' || timerState.mode === 'longBreak' || timerState.mode === 'break';
  const breakMinutes = Math.round(timerState.totalDurationSec / 60);

  const presets = [
    { label: '5 min', name: 'Quick Rest', min: settings.timer.shortBreakMinutes || 5 },
    { label: '10 min', name: 'Coffee Break', min: settings.timer.coffeeBreakMinutes || 10 },
    { label: '15 min', name: 'Walk & Stretch', min: settings.timer.longBreakMinutes || 15 },
    { label: '20 min', name: 'Power Recharge', min: 20 },
    { label: '30 min', name: 'Mind Reset', min: 30 },
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blossom-light text-espresso text-xs font-semibold uppercase tracking-wider mb-2">
            <Coffee className="w-3.5 h-3.5 text-cherry" />
            <span>Dedicated Recovery Area</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-espresso tracking-tight">
            Rest &amp; Recharge Break
          </h2>
          <p className="text-sm text-espresso/60 mt-1">
            Pure downtime for your mind. Break intervals are never counted as study strain.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {presets.map(({ label, name, min }) => {
          const isSelected = isBreakActive && breakMinutes === min;
          return (
            <button
              key={min}
              onClick={() => onSetBreakDuration(min)}
              className={`p-4 rounded-3xl border text-left transition pixel-press ${isSelected
                  ? 'bg-espresso text-ivory border-espresso shadow-pixel-sm'
                  : 'bg-white hover:bg-ivory text-espresso border-espresso/15 hover:border-espresso/35'
                }`}
            >
              <div className="text-sm font-bold font-pixel">{label}</div>
              <div
                className={`text-[11px] mt-1 ${isSelected ? 'text-ivory/70' : 'text-espresso/50'
                  }`}
              >
                {name}
              </div>
            </button>
          );
        })}
      </div>

      <div
        className="relative w-full rounded-3xl overflow-hidden border-2 border-espresso/25 shadow-editorial text-white min-h-[380px] flex flex-col items-center justify-center p-8 text-center"
        style={{
          backgroundImage: 'url(/assets/cherry-blossom.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center 40%',
        }}
      >
        <div className="absolute inset-0 bg-espresso/50 backdrop-blur-[1px]" />

        <div className="relative z-10 flex flex-col items-center">
          <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/40 border border-white/20 text-xs font-semibold uppercase tracking-widest text-white/90 mb-4 backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Rest Mode Active</span>
          </div>

          <div className="text-8xl sm:text-9xl md:text-[10rem] font-black tracking-tight leading-none drop-shadow-xl font-sans select-none my-4">
            {formatTime(timerState.remainingSec)}
          </div>

          <p className="text-sm text-white/80 max-w-sm mb-6">
            Step away from the screen, stretch, drink water, or take slow deep breaths.
          </p>

          <div className="flex items-center justify-center gap-4">
            {!timerState.isRunning ? (
              <button
                onClick={timerState.isPaused ? onResume : onStart}
                className="px-12 py-4 rounded-full font-bold text-lg bg-white text-espresso hover:bg-ivory transition-all shadow-xl hover:scale-105 active:scale-95 flex items-center gap-2.5"
              >
                <Play className="w-5 h-5 fill-current" />
                <span>{timerState.isPaused ? 'Resume Break' : 'Start Break'}</span>
              </button>
            ) : (
              <button
                onClick={onPause}
                className="px-12 py-4 rounded-full font-bold text-lg bg-amber-400 text-espresso transition-all shadow-xl hover:scale-105 active:scale-95 flex items-center gap-2.5"
              >
                <Pause className="w-5 h-5 fill-current" />
                <span>Pause Break</span>
              </button>
            )}

            <button
              onClick={onReset}
              title="Reset Break Timer"
              className="p-4 rounded-full border border-white/25 bg-black/40 hover:bg-black/60 text-white backdrop-blur-md transition-all hover:scale-110 active:scale-95"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
