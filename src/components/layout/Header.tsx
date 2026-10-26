import React from 'react';
import { UserSettings } from '../../types';
import { formatHoursMinutes } from '../../services/analytics';
import { Sparkles, Maximize2, Calendar, Target, Menu } from 'lucide-react';
import { PixelCherry } from '../common/PixelCherry';

interface HeaderProps {
  settings: UserSettings;
  todayDurationSec: number;
  onEnterFocusMode: () => void;
  onOpenMobileMenu?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  settings,
  todayDurationSec,
  onEnterFocusMode,
  onOpenMobileMenu,
}) => {
  const now = new Date();
  const dateFormatted = now.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });

  const dailyGoalSec = (settings.dailyGoalHours || 3) * 3600;
  const goalPercent = Math.min(100, Math.round((todayDurationSec / dailyGoalSec) * 100));

  return (
    <header className="w-full flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-espresso/10">
      {/* Mobile Top Brand & Menu Trigger */}
      <div className="w-full md:w-auto flex items-center justify-between md:hidden">
        <div className="flex items-center gap-2">
          <PixelCherry size={28} />
          <span className="font-black text-lg text-espresso">FocusFlow</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onEnterFocusMode}
            className="p-2 rounded-xl border border-espresso/20 text-espresso hover:bg-white"
            title="Focus Mode"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Welcome Greeting & Date */}
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-espresso/50">
          <Calendar className="w-3.5 h-3.5" />
          <span>{dateFormatted}</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-espresso tracking-tight mt-1">
          Ready to focus, {settings.displayName || 'Friend'}?
        </h1>
        <p className="text-xs sm:text-sm text-espresso/60 mt-0.5">
          Small steps. Big progress. Make today count.
        </p>
      </div>

      {/* Goal Progress Pill & Focus Mode Button */}
      <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
        {/* Daily Goal Pill */}
        <div className="flex items-center gap-3 p-2.5 px-4 rounded-2xl bg-white border border-espresso/15 shadow-sm">
          <div className="w-8 h-8 rounded-full bg-cherry-light text-cherry flex items-center justify-center font-pixel text-xs">
            {goalPercent}%
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-espresso/40">
              Daily Goal
            </div>
            <div className="text-xs font-bold text-espresso font-pixel">
              {formatHoursMinutes(todayDurationSec)} / {settings.dailyGoalHours}h
            </div>
          </div>
        </div>

        {/* Enter Focus Mode Button */}
        <button
          onClick={onEnterFocusMode}
          className="hidden md:flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-espresso text-ivory text-xs font-semibold shadow-pixel-sm hover:translate-y-[-1px] transition pixel-press"
        >
          <Maximize2 className="w-3.5 h-3.5 text-cherry" />
          <span>Focus Mode</span>
        </button>
      </div>
    </header>
  );
};
