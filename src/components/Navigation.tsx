import { Home, Video, History, FileText } from 'lucide-react';
import type { AppScreen } from '../types';

interface Props {
  currentScreen: AppScreen;
  onNavigate: (screen: AppScreen) => void;
}

export function Navigation({ currentScreen, onNavigate }: Props) {
  const navItems = [
    { screen: 'landing' as AppScreen, icon: Home, label: 'Home' },
    { screen: 'setup' as AppScreen, icon: Video, label: 'New Interview' },
    { screen: 'documents' as AppScreen, icon: FileText, label: 'Documents' },
    { screen: 'history' as AppScreen, icon: History, label: 'History' },
  ];

  return (
    <nav className="bg-slate-900 border-b border-slate-700/50">
      <div className="max-w-6xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Video className="w-6 h-6 text-blue-400" />
            <span className="text-lg font-semibold text-white">AI Interview Coach</span>
          </div>
          <div className="flex gap-2">
            {navItems.map(({ screen, icon: Icon, label }) => (
              <button
                key={screen}
                onClick={() => onNavigate(screen)}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg transition-colors font-medium ${
                  currentScreen === screen
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}
