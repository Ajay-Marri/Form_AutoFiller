import React from 'react';
import { Layers, UserCheck, Download } from 'lucide-react';

interface HeaderProps {
  activeTab: 'sandbox' | 'profile' | 'export';
  setActiveTab: (tab: 'sandbox' | 'profile' | 'export') => void;
  profileCompleteness: number;
  onQuickAutofill?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  profileCompleteness,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Zone 1: Single text wordmark */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-white shadow-sm font-bold text-lg">
            A
          </div>
          <div>
            <span className="text-base font-bold tracking-tight text-white">
              JobAutoFill
            </span>
            <span className="hidden sm:inline text-xs text-slate-400 ml-2 font-mono">
              Chrome Ext v1.0
            </span>
          </div>
        </div>

        {/* Zone 2: Navigation links */}
        <nav className="hidden md:flex items-center gap-1">
          <button
            onClick={() => setActiveTab('sandbox')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'sandbox'
                ? 'bg-slate-800 text-indigo-400 border border-slate-700'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Extension & Sandbox</span>
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'profile'
                ? 'bg-slate-800 text-indigo-400 border border-slate-700'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Profile Data Hub</span>
          </button>
        </nav>

        {/* Zone 3: Primary Actions & Telemetry indicators */}
        <div className="flex items-center gap-3">
          {/* Profile completeness */}
          <div className="hidden lg:flex items-center gap-2 text-xs bg-slate-800/80 px-2.5 py-1 rounded border border-slate-700/60">
            <span className="text-slate-400">Profile:</span>
            <span className="font-semibold text-emerald-400 font-mono">
              {profileCompleteness}%
            </span>
          </div>

          {/* Local-first storage badge */}
          <div
            title="Local-first storage active for Chrome extension"
            className="hidden sm:flex items-center gap-1.5 text-xs px-2 py-1 rounded bg-slate-800/60 border border-slate-700/60 text-slate-300"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="font-mono text-[11px]">Local-First Ready</span>
          </div>

          {/* Export extension */}
          <button
            onClick={() => setActiveTab('export')}
            className="px-3 py-1.5 rounded-md text-xs font-medium bg-indigo-600 hover:bg-indigo-500 text-white transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Get Extension</span>
          </button>
        </div>
      </div>

      {/* Mobile subnav */}
      <div className="md:hidden flex items-center overflow-x-auto px-4 py-2 bg-slate-950 border-t border-slate-800 gap-2">
        <button
          onClick={() => setActiveTab('sandbox')}
          className={`px-2.5 py-1 text-xs whitespace-nowrap rounded ${activeTab === 'sandbox' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}
        >
          Sandbox
        </button>
        <button
          onClick={() => setActiveTab('profile')}
          className={`px-2.5 py-1 text-xs whitespace-nowrap rounded ${activeTab === 'profile' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}
        >
          Profile
        </button>
      </div>
    </header>
  );
};
