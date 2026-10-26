import React from 'react';
import {
  LayoutDashboard,
  Timer,
  Coffee,
  BarChart3,
  Settings,
  Flame,
} from 'lucide-react';
import { PixelCherry } from '../common/PixelCherry';

export type NavTab = 'dashboard' | 'timer' | 'break' | 'analytics' | 'settings';

interface SidebarProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  streakDays: number;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onSelectTab, streakDays }) => {
  const navItems = [
    { id: 'dashboard' as NavTab, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'timer' as NavTab, label: 'Focus Timer', icon: Timer },
    { id: 'break' as NavTab, label: 'Break', icon: Coffee },
    { id: 'analytics' as NavTab, label: 'Study Analytics', icon: BarChart3 },
    { id: 'settings' as NavTab, label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="hidden lg:flex flex-col justify-between w-64 h-screen sticky top-0 bg-white border-r border-espresso/15 p-6 select-none shrink-0">
      <div>
        {/* Brand Logo & Name */}
        <div
          onClick={() => onSelectTab('dashboard')}
          className="flex items-center gap-3 cursor-pointer group mb-8"
        >
          <div className="relative">
            <PixelCherry size={36} />
          </div>
          <div>
            <div className="font-black text-xl text-espresso tracking-tight flex items-center gap-1.5">
              <span>FocusFlow</span>
              <span className="text-[10px] uppercase font-pixel tracking-wider text-cherry px-1.5 py-0.5 rounded bg-cherry-light">
                PRO
              </span>
            </div>
            <div className="text-[11px] text-espresso/50 font-medium">Aesthetic Study Space</div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1.5">
          {navItems.map(({ id, label, icon: Icon }) => {
            const isActive = activeTab === id;
            return (
              <button
                key={id}
                onClick={() => onSelectTab(id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-espresso text-ivory shadow-pixel-sm translate-x-1'
                    : 'text-espresso/70 hover:text-espresso hover:bg-ivory'
                }`}
              >
                <Icon
                  className={`w-4 h-4 transition ${
                    isActive ? 'text-cherry' : 'text-espresso/50 group-hover:text-espresso'
                  }`}
                />
                <span>{label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Aesthetic Streak Card */}
      <div className="p-4 rounded-3xl bg-ivory border border-espresso/15 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <Flame className="w-4 h-4 text-cherry fill-cherry" />
            <span className="text-xs font-bold font-pixel text-espresso">Daily Streak</span>
          </div>
          <span className="text-xs font-bold text-cherry font-pixel">{streakDays}d</span>
        </div>
        <p className="text-[11px] text-espresso/60 leading-relaxed">
          {streakDays > 0
            ? "Keep the focus fire burning bright today!"
            : "Complete a session today to ignite your streak!"}
        </p>
      </div>
    </aside>
  );
};
