import React from 'react';
import { Kanban, FileText, Users } from 'lucide-react';
import { useStore } from '../store/useStore';
import { AuthButton } from './AuthButton';
import type { ViewType } from '../types';

interface NavItem {
  view: ViewType;
  label: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  { view: 'stories', label: '用户故事', icon: <FileText size={20} /> },
  { view: 'kanban', label: '看板', icon: <Kanban size={20} /> },
  { view: 'team', label: '团队', icon: <Users size={20} /> },
];

export const Navigation: React.FC = () => {
  const { activeView, setActiveView } = useStore();

  return (
    <nav className="bg-white border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <div className="flex space-x-1">
              {navItems.map((item) => (
                <button
                  key={item.view}
                  onClick={() => setActiveView(item.view)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeView === item.view
                      ? 'bg-primary-100 text-primary-800'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center">
            <AuthButton />
          </div>
        </div>
      </div>
    </nav>
  );
};
