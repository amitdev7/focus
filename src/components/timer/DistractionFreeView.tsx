import React, { useEffect } from 'react';
import { Play, Pause, RotateCcw, X } from 'lucide-react';
import type { ActiveTimerState, ThemeId } from '../../types';

interface DistractionFreeViewProps {
  timerState: ActiveTimerState;
  activeTheme: ThemeId;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onReset: () => void;
  onExit: () => void;
}

export const DistractionFreeView: React.FC<DistractionFreeViewProps> = ({
  timerState,
  activeTheme,
  onStart,
  onPause,
  onResume,
  onReset,
  onExit,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onExit();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onExit]);

  const formatTime = (totalSeconds: number) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    const pad = (n: number) => String(n).padStart(2, '0');
    if (hrs > 0) return `${pad(hrs)}:${pad(mins)}:${pad(secs)}`;
    return `${pad(mins)}:${pad(secs)}`;
  };

  const isCherryBlossom = activeTheme === 'cherry-blossom';
  const isRetroCrt = activeTheme === 'retro-crt';
  const isMidnight = activeTheme === 'midnight-focus';

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-6 select-none transition-all duration-700 ${
        isRetroCrt
          ? 'bg-zinc-950 text-white crt-screen'
          : isMidnight
          ? 'bg-zinc-950 text-white'
          : isCherryBlossom
          ? 'text-white'
          : 'bg-ivory text-espresso paper-grid'
      }`}
      style={
        isCherryBlossom
          ? {
              backgroundImage: 'url(/assets/cherry-blossom.png)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }
          : undefined
      }
    >
      {/* Dimmer overlay for scenic theme */}
      {isCherryBlossom && (
        <div className="absolute inset-0 bg-espresso/45 backdrop-blur-[0.5px] pointer-events-none" />
      )}

      {/* Discrete Exit button at top right */}
      <button
        onClick={onExit}
        title="Exit Focus Mode (Esc)"
        className={`absolute top-6 right-6 z-20 p-3 rounded-full border backdrop-blur-md transition-all hover:scale-105 active:scale-95 ${
          isCherryBlossom || isRetroCrt || isMidnight
            ? 'bg-black/40 border-white/20 text-white/80 hover:text-white hover:bg-black/60'
            : 'bg-white/80 border-espresso/20 text-espresso/70 hover:text-espresso hover:bg-white shadow-sm'
        }`}
      >
        <X className="w-5 h-5" />
      </button>

      {/* ONLY THE TIMER AREA */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center">
        {/* Countdown Digits */}
        <div
          className={`text-8xl sm:text-9xl md:text-[13rem] lg:text-[16rem] font-black tracking-tight leading-none drop-shadow-2xl font-sans select-none ${
            isCherryBlossom || isRetroCrt || isMidnight ? 'text-white' : 'text-espresso'
          }`}
        >
          {formatTime(timerState.remainingSec)}
        </div>

        {/* Minimal Controls: Start/Pause and Reset */}
        <div className="mt-8 sm:mt-12 flex items-center justify-center gap-4">
          {!timerState.isRunning ? (
            <button
              onClick={timerState.isPaused ? onResume : onStart}
              className={`px-12 sm:px-16 py-4 sm:py-5 rounded-full font-bold text-lg sm:text-xl flex items-center gap-3 transition-all shadow-2xl hover:scale-105 active:scale-95 ${
                isCherryBlossom
                  ? 'bg-white text-espresso hover:bg-ivory'
                  : isRetroCrt
                  ? 'bg-gradient-to-r from-red-500 via-amber-400 to-purple-600 text-white'
                  : isMidnight
                  ? 'bg-white text-zinc-950'
                  : 'bg-espresso text-ivory shadow-pixel'
              }`}
            >
              <Play className="w-6 h-6 fill-current" />
              <span>{timerState.isPaused ? 'Resume' : 'Start'}</span>
            </button>
          ) : (
            <button
              onClick={onPause}
              className={`px-12 sm:px-16 py-4 sm:py-5 rounded-full font-bold text-lg sm:text-xl flex items-center gap-3 transition-all shadow-2xl hover:scale-105 active:scale-95 ${
                isCherryBlossom
                  ? 'bg-white text-espresso'
                  : isRetroCrt
                  ? 'bg-amber-400 text-espresso'
                  : isMidnight
                  ? 'bg-amber-400 text-zinc-950'
                  : 'bg-cherry text-white shadow-pixel'
              }`}
            >
              <Pause className="w-6 h-6 fill-current" />
              <span>Pause</span>
            </button>
          )}

          {/* Reset button */}
          <button
            onClick={onReset}
            title="Reset Timer"
            className={`p-4 sm:p-5 rounded-full border backdrop-blur-md transition-all hover:scale-110 active:scale-95 ${
              isCherryBlossom || isRetroCrt || isMidnight
                ? 'bg-black/40 border-white/20 text-white hover:bg-black/60'
                : 'bg-white/80 border-espresso/20 text-espresso hover:bg-white shadow-sm'
            }`}
          >
            <RotateCcw className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
};
