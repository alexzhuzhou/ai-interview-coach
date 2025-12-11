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
    <nav className="sticky top-0 z-nav backdrop-blur-md bg-slate-900/95 border-b border-slate-700/50">
      <div className="max-w-6xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => onNavigate('landing')}
            className="flex items-center gap-2 group"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Video className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-semibold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              AI Interview Coach
            </span>
          </button>
          <div className="flex gap-1">
            {navItems.map(({ screen, icon: Icon, label }) => (
              <button
                key={screen}
                onClick={() => onNavigate(screen)}
                className={`relative inline-flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 font-medium ${
                  currentScreen === screen
                    ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-900/30'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{label}</span>
                {currentScreen === screen && (
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-cyan-400 rounded-full"></div>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}
