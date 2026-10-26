import React from 'react';
import { NavTab } from './Sidebar';
import {
  LayoutDashboard,
  Timer,
  BookOpen,
  CheckSquare,
  BarChart3,
  History,
  Settings,
} from 'lucide-react';

interface MobileNavProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ activeTab, onSelectTab }) => {
  const items = [
    { id: 'dashboard' as NavTab, label: 'Home', icon: LayoutDashboard },
    { id: 'timer' as NavTab, label: 'Timer', icon: Timer },
    { id: 'subjects' as NavTab, label: 'Subjects', icon: BookOpen },
    { id: 'tasks' as NavTab, label: 'Tasks', icon: CheckSquare },
    { id: 'analytics' as NavTab, label: 'Stats', icon: BarChart3 },
    { id: 'history' as NavTab, label: 'History', icon: History },
    { id: 'settings' as NavTab, label: 'Settings', icon: Settings },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-espresso/15 px-2 py-2 flex items-center justify-around shadow-lg">
      {items.map(({ id, label, icon: Icon }) => {
        const isActive = activeTab === id;
        return (
          <button
            key={id}
            onClick={() => onSelectTab(id)}
            className={`flex flex-col items-center gap-1 py-1 px-2 rounded-xl transition ${isActive ? 'text-cherry font-bold' : 'text-espresso/50 hover:text-espresso'
              }`}
          >
            <Icon className="w-5 h-5" />
            <span className="text-[10px] tracking-tight">{label}</span>
          </button>
        );
      })}
    </nav>
  );
};
