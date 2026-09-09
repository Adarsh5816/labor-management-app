import React from 'react';
import { useApp } from '../context/AppContext';
import { HardHat, LogOut, Settings, WifiOff } from 'lucide-react';

export default function Navbar() {
  const { user, logout, settings, setActiveTab, activeTab } = useApp();

  return (
    <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-30 text-white shadow-sm">
      <div className="max-w-md mx-auto px-4 h-16 flex items-center justify-between">
        
        {/* Brand */}
        <div className="flex items-center space-x-2.5">
          <div className="w-9 h-9 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold shadow-md">
            <HardHat className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold text-base leading-none text-white tracking-tight">{settings.appName || 'Labor Handler'}</h1>
            <div className="flex items-center space-x-1.5 mt-0.5">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-[10px] text-slate-400 font-medium">Offline Storage</span>
            </div>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center space-x-2">
          {user && (
            <div className="hidden sm:flex items-center text-xs bg-slate-800 border border-slate-700 px-2.5 py-1 rounded-full text-slate-300">
              <span>{user.name || user.username}</span>
            </div>
          )}

          <button
            onClick={() => setActiveTab('settings')}
            className={`p-2 rounded-xl border transition-colors ${
              activeTab === 'settings'
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
            }`}
            title="Settings"
          >
            <Settings className="w-5 h-5" />
          </button>

          <button
            onClick={logout}
            className="p-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-400 hover:text-red-400 transition-colors"
            title="Logout"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>

      </div>
    </header>
  );
}
