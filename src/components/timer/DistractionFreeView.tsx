import React, { useEffect, useState } from 'react';
import { Play, Pause, RotateCcw, SkipForward, Minimize2, Sparkles, BookOpen } from 'lucide-react';
import { ActiveTimerState, Subject, Task, ThemeId, UserSettings } from '../../types';
import { PixelCherry } from '../common/PixelCherry';

interface DistractionFreeViewProps {
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
  onExit: () => void;
}

const MOTIVATIONAL_QUOTES = [
  "Small steps. Big progress.",
  "Focus on the step in front of you, not the whole staircase.",
  "Deep work creates compounding results.",
  "The secret of getting ahead is getting started.",
  "One focused hour is worth four distracted ones.",
  "Breathe, center yourself, and let the mind flow.",
];

export const DistractionFreeView: React.FC<DistractionFreeViewProps> = ({
  timerState,
  subjects,
  tasks,
  activeTheme,
  onThemeChange,
  onStart,
  onPause,
  onResume,
  onReset,
  onSkip,
  onExit,
}) => {
  const [quoteIdx, setQuoteIdx] = useState(0);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onExit();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onExit]);

  // Rotate motivational quote occasionally
  useEffect(() => {
    const timer = setInterval(() => {
      setQuoteIdx((prev) => (prev + 1) % MOTIVATIONAL_QUOTES.length);
    }, 45000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (totalSeconds: number) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    const pad = (n: number) => String(n).padStart(2, '0');
    if (hrs > 0) return `${pad(hrs)}:${pad(mins)}:${pad(secs)}`;
    return `${pad(mins)}:${pad(secs)}`;
  };

  const currentSubject = subjects.find((s) => s.id === timerState.subjectId) || subjects[0];
  const currentTask = tasks.find((t) => t.id === timerState.taskId);

  const isCherryBlossom = activeTheme === 'cherry-blossom';
  const isRetroCrt = activeTheme === 'retro-crt';
  const isMidnight = activeTheme === 'midnight-focus';

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col justify-between p-6 sm:p-12 transition-all duration-700 select-none ${isRetroCrt
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

      {/* Top Bar: Subject, Theme quick select & Exit button */}
      <div className="relative z-10 w-full flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className={`flex items-center gap-2 px-4 py-1.5 rounded-full backdrop-blur-md border ${isCherryBlossom || isRetroCrt || isMidnight
              ? 'bg-black/40 border-white/20 text-white'
              : 'bg-white border-espresso/20 text-espresso shadow-sm'
              }`}
          >
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: currentSubject?.color || '#3B82F6' }}
            />
            <span className="text-sm font-semibold">{currentSubject?.name || 'General Focus'}</span>
          </div>

          {currentTask && (
            <div
              className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full backdrop-blur-md border text-xs ${isCherryBlossom || isRetroCrt || isMidnight
                ? 'bg-black/30 border-white/20 text-white/80'
                : 'bg-white border-espresso/15 text-espresso/80'
                }`}
            >
              <span>{currentTask.title}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Quick theme switcher */}
          <select
            value={activeTheme}
            onChange={(e) => onThemeChange(e.target.value as ThemeId)}
            className={`text-xs font-semibold px-3 py-1.5 rounded-full border backdrop-blur-md transition cursor-pointer focus:outline-none ${isCherryBlossom || isRetroCrt || isMidnight
              ? 'bg-black/40 border-white/20 text-white'
              : 'bg-white border-espresso/20 text-espresso'
              }`}
          >
            <option value="cherry-blossom" className="text-espresso">🌸 Cherry Blossom</option>
            <option value="pixel-cherry" className="text-espresso">🍒 Pixel Cherry</option>
            <option value="retro-crt" className="text-espresso">📺 Retro CRT</option>
            <option value="paper-grid" className="text-espresso">📐 Paper &amp; Grid</option>
            <option value="midnight-focus" className="text-espresso">🌙 Midnight</option>
          </select>

          {/* Exit Fullscreen Button */}
          <button
            onClick={onExit}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold backdrop-blur-md border transition hover:scale-105 active:scale-95 ${isCherryBlossom || isRetroCrt || isMidnight
              ? 'bg-white/20 hover:bg-white/30 border-white/30 text-white'
              : 'bg-espresso text-ivory hover:bg-espresso/90 border-espresso'
              }`}
          >
            <Minimize2 className="w-3.5 h-3.5" />
            <span>Exit Focus (Esc)</span>
          </button>
        </div>
      </div>

      {/* Center Hero Timer */}
      <div className="relative z-10 my-auto text-center flex flex-col items-center">
        {/* Mode label */}
        <div
          className={`text-xs sm:text-sm uppercase tracking-widest font-semibold px-4 py-1 rounded-full mb-4 border backdrop-blur-md ${isCherryBlossom || isRetroCrt || isMidnight
            ? 'bg-black/30 border-white/20 text-white/80'
            : 'bg-white border-espresso/20 text-espresso/70'
            }`}
        >
          {timerState.mode === 'shortBreak' || timerState.mode === 'longBreak'
            ? 'Mindful Break'
            : 'Uninterrupted Focus'}
        </div>

        {/* Huge Countdown Display */}
        <div
          className={`text-8xl sm:text-9xl md:text-[14rem] font-black tracking-tight leading-none drop-shadow-lg font-sans ${isCherryBlossom || isRetroCrt || isMidnight ? 'text-white' : 'text-espresso'
            }`}
        >
          {formatTime(timerState.remainingSec)}
        </div>

        {/* Motivational Quote */}
        <p
          className={`mt-6 text-sm sm:text-base font-medium max-w-md italic transition-opacity duration-500 ${isCherryBlossom || isRetroCrt || isMidnight ? 'text-white/80' : 'text-espresso/70'
            }`}
        >
          "{MOTIVATIONAL_QUOTES[quoteIdx]}"
        </p>

        {/* Central Controls */}
        <div className="mt-8 flex items-center justify-center gap-4">
          {!timerState.isRunning ? (
            <button
              onClick={timerState.isPaused ? onResume : onStart}
              className={`px-10 py-4 rounded-full font-bold text-lg flex items-center gap-2.5 transition-all shadow-xl hover:scale-105 active:scale-95 ${isCherryBlossom
                ? 'bg-white text-espresso'
                : isRetroCrt
                  ? 'bg-gradient-to-r from-red-500 via-amber-400 to-purple-600 text-white'
                  : isMidnight
                    ? 'bg-white text-zinc-950'
                    : 'bg-espresso text-ivory shadow-pixel'
                }`}
            >
              <Play className="w-5 h-5 fill-current" />
              <span>{timerState.isPaused ? 'Resume' : 'Start Focus'}</span>
            </button>
          ) : (
            <button
              onClick={onPause}
              className={`px-10 py-4 rounded-full font-bold text-lg flex items-center gap-2.5 transition-all shadow-xl hover:scale-105 active:scale-95 ${isCherryBlossom
                ? 'bg-white text-espresso'
                : isRetroCrt
                  ? 'bg-amber-400 text-espresso'
                  : isMidnight
                    ? 'bg-amber-400 text-zinc-950'
                    : 'bg-cherry text-white shadow-pixel'
                }`}
            >
              <Pause className="w-5 h-5 fill-current" />
              <span>Pause</span>
            </button>
          )}

          <button
            onClick={onReset}
            title="Reset"
            className={`p-4 rounded-full border backdrop-blur-md transition-all hover:scale-110 active:scale-95 ${isCherryBlossom || isRetroCrt || isMidnight
              ? 'bg-black/40 border-white/20 text-white hover:bg-black/60'
              : 'bg-white border-espresso/20 text-espresso hover:bg-ivory'
              }`}
          >
            <RotateCcw className="w-5 h-5" />
          </button>

          <button
            onClick={onSkip}
            title="Skip"
            className={`p-4 rounded-full border backdrop-blur-md transition-all hover:scale-110 active:scale-95 ${isCherryBlossom || isRetroCrt || isMidnight
              ? 'bg-black/40 border-white/20 text-white hover:bg-black/60'
              : 'bg-white border-espresso/20 text-espresso hover:bg-ivory'
              }`}
          >
            <SkipForward className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Bottom Subtle Status */}
      <div className="relative z-10 w-full flex items-center justify-between text-xs opacity-60">
        <div className="flex items-center gap-2">
          <PixelCherry size={20} />
          <span>FocusFlow Deep Mode</span>
        </div>
        <div>Press Esc to return to dashboard</div>
      </div>
    </div>
  );
};
