import React from 'react';
import { ViewMode } from '../types';
import { 
  Database, 
  Layers, 
  RotateCw, 
  Download, 
  Columns, 
  CheckCircle2, 
  Sparkles,
  Sun,
  Moon
} from 'lucide-react';

interface HeaderProps {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  isLoading: boolean;
  onRefresh: () => void;
  onOpenExport: () => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  dataSourceText: string;
  lastUpdated: string;
}

export const Header: React.FC<HeaderProps> = React.memo(({
  viewMode,
  setViewMode,
  isLoading,
  onRefresh,
  onOpenExport,
  darkMode,
  onToggleDarkMode,
  dataSourceText,
  lastUpdated
}) => {
  const tabs: { id: ViewMode; labelBn: string; labelEn: string; icon: any }[] = [
    { id: 'merged', labelBn: 'মার্জড ডেটা', labelEn: 'Merged View', icon: Layers },
    { id: 'bangla', labelBn: 'শুধুমাত্র বাংলা', labelEn: 'Bangla Only', icon: Sparkles },
    { id: 'english', labelBn: 'Only English', labelEn: 'English Only', icon: Database },
    { id: 'side-by-side', labelBn: 'পাশাপাশি তুলনা', labelEn: 'Split View', icon: Columns }
  ];

  return (
    <header className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3.5">
          
          {/* Logo & Info */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-teal-600 to-cyan-700 flex items-center justify-center text-white shadow-md shadow-teal-500/20 shrink-0">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-1.5">
                    ইউজার ডাটাবেস
                  </h1>
                  <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60">
                    <CheckCircle2 className="w-3 h-3" />
                    লাইভ সিঙ্ক
                  </span>
                </div>
                {lastUpdated && (
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    <span>সর্বশেষ আপডেট: {lastUpdated}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Mobile Actions: Refresh, Export, Dark/Light Mode */}
            <div className="flex md:hidden items-center gap-1.5">
              <button
                id="btn-refresh-mobile"
                onClick={onRefresh}
                disabled={isLoading}
                title="রিফ্রেশ"
                className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:text-teal-700 dark:hover:text-teal-400 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50 transition-colors"
              >
                <RotateCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-teal-600' : ''}`} />
              </button>
              <button
                id="btn-export-mobile"
                onClick={onOpenExport}
                title="এক্সপোর্ট"
                className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:text-teal-700 dark:hover:text-teal-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <Download className="w-4 h-4" />
              </button>
              <button
                id="btn-theme-mobile"
                onClick={onToggleDarkMode}
                title={darkMode ? 'লাইট মোডে পরিবর্তন' : 'ডার্ক মোডে পরিবর্তন'}
                className="p-2 rounded-lg text-slate-600 dark:text-amber-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Center Tabs: Bangla / English / Merged / Side-by-Side */}
          <div className="flex items-center bg-slate-100/90 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200/90 dark:border-slate-700/80 overflow-x-auto no-scrollbar">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = viewMode === tab.id;
              return (
                <button
                  key={tab.id}
                  id={`tab-view-${tab.id}`}
                  onClick={() => setViewMode(tab.id)}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${
                    isActive
                      ? 'bg-white dark:bg-slate-700 text-teal-800 dark:text-teal-300 shadow-xs shadow-slate-300 dark:shadow-slate-900 font-bold border border-slate-200/60 dark:border-slate-600'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-700/50'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-teal-600 dark:text-teal-400' : 'text-slate-400 dark:text-slate-500'}`} />
                  <span>{tab.labelBn}</span>
                </button>
              );
            })}
          </div>

          {/* Desktop Right Action Buttons: Refresh, Export, Dark/Light Mode */}
          <div className="hidden md:flex items-center gap-2">
            <button
              id="btn-refresh"
              onClick={onRefresh}
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/80 hover:text-teal-700 dark:hover:text-teal-300 text-sm font-medium transition-colors shadow-2xs disabled:opacity-50"
            >
              <RotateCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-teal-600 dark:text-teal-400' : ''}`} />
              <span>রিফ্রেশ</span>
            </button>

            <button
              id="btn-export"
              onClick={onOpenExport}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium transition-colors shadow-xs shadow-teal-600/20"
            >
              <Download className="w-4 h-4" />
              <span>এক্সপোর্ট / প্রিন্ট</span>
            </button>

            {/* Dark / Light Mode Toggle Button */}
            <button
              id="btn-toggle-theme"
              onClick={onToggleDarkMode}
              title={darkMode ? 'লাইট মোডে পরিবর্তন করুন' : 'ডার্ক মোডে পরিবর্তন করুন'}
              className="inline-flex items-center justify-center p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-amber-400 hover:bg-slate-50 dark:hover:bg-slate-700/80 transition-colors shadow-2xs cursor-pointer"
            >
              {darkMode ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-slate-600" />
              )}
            </button>
          </div>

        </div>
      </div>
    </header>
  );
});
Header.displayName = 'Header';
