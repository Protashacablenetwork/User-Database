import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  ViewMode, 
  DisplayLayout, 
  MergedUser, 
  MergeStats, 
  SheetConfig 
} from './types';
import { fetchSheetData } from './services/sheetService';
import { mergeDatasets, filterAndSearchUsers } from './services/mergerService';
import { 
  DEFAULT_BANGLA_SHEET_ID, 
  DEFAULT_ENGLISH_SHEET_ID, 
  DEFAULT_BANGLA_CSV, 
  DEFAULT_ENGLISH_CSV 
} from './data/sampleData';

import { Header } from './components/Header';
import { StatsBar } from './components/StatsBar';
import { ViewControls } from './components/ViewControls';
import { UserTable } from './components/UserTable';
import { UserGrid } from './components/UserGrid';
import { SideBySideView } from './components/SideBySideView';
import { UserDetailModal } from './components/UserDetailModal';
import { ImageViewerModal } from './components/ImageViewerModal';
import { ExportModal } from './components/ExportModal';

import { 
  RotateCw, 
  AlertCircle
} from 'lucide-react';

const LOCAL_STORAGE_KEY_USERS = 'user_db_cached_users_v2_live';
const LOCAL_STORAGE_KEY_STATS = 'user_db_cached_stats_v2_live';
const LOCAL_STORAGE_KEY_TIMESTAMP = 'user_db_cached_time_v2_live';
const LOCAL_STORAGE_KEY_THEME = 'user_db_theme_mode';

export default function App() {
  // Theme state (Dark / Light mode)
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    try {
      const savedTheme = localStorage.getItem(LOCAL_STORAGE_KEY_THEME);
      if (savedTheme) {
        return savedTheme === 'dark';
      }
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    } catch {
      return false;
    }
  });

  // Apply dark mode class to document element
  useEffect(() => {
    try {
      const root = document.documentElement;
      if (darkMode) {
        root.classList.add('dark');
        root.style.colorScheme = 'dark';
        localStorage.setItem(LOCAL_STORAGE_KEY_THEME, 'dark');
      } else {
        root.classList.remove('dark');
        root.style.colorScheme = 'light';
        localStorage.setItem(LOCAL_STORAGE_KEY_THEME, 'light');
      }
    } catch (e) {
      console.warn('Theme storage error:', e);
    }
  }, [darkMode]);

  const toggleDarkMode = useCallback(() => {
    setDarkMode((prev) => !prev);
  }, []);

  // Fixed Google Sheet config (never exposed or editable in UI)
  const config = useMemo<SheetConfig>(() => ({
    banglaSheetId: DEFAULT_BANGLA_SHEET_ID,
    englishSheetId: DEFAULT_ENGLISH_SHEET_ID,
    banglaCsvUrl: DEFAULT_BANGLA_CSV,
    englishCsvUrl: DEFAULT_ENGLISH_CSV,
    sheetName: 'Sheet1'
  }), []);

  // Main UI State
  const [viewMode, setViewMode] = useState<ViewMode>('merged');
  const [displayLayout, setDisplayLayout] = useState<DisplayLayout>('table');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [matchFilter, setMatchFilter] = useState<'all' | 'merged_only' | 'bangla_only' | 'english_only' | 'has_bangla' | 'has_english' | 'has_nid' | 'has_photo'>('all');
  const [sortBy, setSortBy] = useState<'serial' | 'name' | 'match' | 'nid' | 'mobile'>('serial');

  // Loaded data state
  const [mergedUsers, setMergedUsers] = useState<MergedUser[]>([]);
  const [stats, setStats] = useState<MergeStats>({
    totalMerged: 0,
    totalBangla: 0,
    totalEnglish: 0,
    matchedCount: 0,
    banglaOnlyCount: 0,
    englishOnlyCount: 0,
    withPhotoCount: 0,
    withNidCount: 0,
    matchRatePercentage: 0
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [dataSourceText, setDataSourceText] = useState<string>('লোড হচ্ছে...');
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [errorNotice, setErrorNotice] = useState<string | null>(null);

  // Modals state
  const [selectedUser, setSelectedUser] = useState<MergedUser | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isExportOpen, setIsExportOpen] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Copy handler with visual feedback
  const handleCopy = useCallback((text: string, id: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => {
      setCopiedId((prev) => (prev === id ? null : prev));
    }, 1800);
  }, []);

  // Main data loader
  const loadData = useCallback(async () => {
    setIsLoading(true);
    setErrorNotice(null);

    try {
      // Parallel fetch of Bangla and English Google sheets
      const [banglaResult, englishResult] = await Promise.all([
        fetchSheetData(config.banglaSheetId, config.banglaCsvUrl, 'bangla'),
        fetchSheetData(config.englishSheetId, config.englishCsvUrl, 'english')
      ]);

      const { mergedUsers: combined, stats: calculatedStats } = mergeDatasets(
        banglaResult.data,
        englishResult.data
      );

      if (combined.length > 0) {
        setMergedUsers(combined);
        setStats(calculatedStats);

        const sourceInfo = `${banglaResult.source} + ${englishResult.source}`;
        setDataSourceText(sourceInfo);

        const now = new Date();
        const timeStr = now.toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' });
        setLastUpdated(timeStr);

        // Save to cache
        try {
          localStorage.setItem(LOCAL_STORAGE_KEY_USERS, JSON.stringify(combined));
          localStorage.setItem(LOCAL_STORAGE_KEY_STATS, JSON.stringify(calculatedStats));
          localStorage.setItem(LOCAL_STORAGE_KEY_TIMESTAMP, timeStr);
        } catch (cacheErr) {
          console.warn('LocalStorage save failed:', cacheErr);
        }
      } else {
        setErrorNotice('Google Sheets থেকে ডেটা রিফ্রেশ করা যায়নি। লোকাল ব্যাকআপ ডেটা সক্রিয় রয়েছে।');
      }

    } catch (err: any) {
      console.error('Data load error:', err);
      setErrorNotice('Google Sheets থেকে ডেটা লোড করার সময় সমস্যা হয়েছে। অনুগ্রহ করে ইন্টারনেট সংযোগ চেক করে আবার চেষ্টা করুন।');
    } finally {
      setIsLoading(false);
    }
  }, [config]);

  // Initial mount load
  useEffect(() => {
    // Attempt instant load from cache first
    try {
      const cachedUsers = localStorage.getItem(LOCAL_STORAGE_KEY_USERS);
      const cachedStats = localStorage.getItem(LOCAL_STORAGE_KEY_STATS);
      const cachedTime = localStorage.getItem(LOCAL_STORAGE_KEY_TIMESTAMP);

      if (cachedUsers && cachedStats) {
        setMergedUsers(JSON.parse(cachedUsers));
        setStats(JSON.parse(cachedStats));
        if (cachedTime) setLastUpdated(cachedTime);
        setDataSourceText('ক্যাশ করা ডেটাবেস');
        setIsLoading(false);
      }
    } catch (e) {
      console.error('Cache read error:', e);
    }

    // Then trigger background/live sync
    loadData();
  }, [loadData]);

  // Stable handlers for maximum rendering performance
  const handleSelectUser = useCallback((user: MergedUser) => {
    setSelectedUser(user);
  }, []);

  const handleCloseUser = useCallback(() => {
    setSelectedUser(null);
  }, []);

  const handleOpenImage = useCallback((url: string) => {
    setSelectedImage(url);
  }, []);

  const handleCloseImage = useCallback(() => {
    setSelectedImage(null);
  }, []);

  const handleOpenExport = useCallback(() => {
    setIsExportOpen(true);
  }, []);

  const handleCloseExport = useCallback(() => {
    setIsExportOpen(false);
  }, []);

  const handleSelectFilter = useCallback((filter: any) => {
    setMatchFilter(filter);
  }, []);

  const handleResetFilters = useCallback(() => {
    setSearchQuery('');
    setMatchFilter('all');
    setSortBy('serial');
  }, []);

  const handleSetViewMode = useCallback((mode: ViewMode) => {
    setViewMode(mode);
    setMatchFilter('all');
  }, []);

  // Filtered and searched data computation
  const filteredUsers = useMemo(() => {
    return filterAndSearchUsers(
      mergedUsers,
      searchQuery,
      viewMode,
      matchFilter,
      sortBy
    );
  }, [mergedUsers, searchQuery, viewMode, matchFilter, sortBy]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col selection:bg-teal-500 selection:text-white">
      {/* Top Navigation Header */}
      <Header
        viewMode={viewMode}
        setViewMode={handleSetViewMode}
        isLoading={isLoading}
        onRefresh={loadData}
        onOpenExport={handleOpenExport}
        darkMode={darkMode}
        onToggleDarkMode={toggleDarkMode}
        dataSourceText={dataSourceText}
        lastUpdated={lastUpdated}
      />

      {/* Main Container */}
      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-6 flex-1">
        
        {/* Error / Offline Alert banner if any */}
        {errorNotice && (
          <div className="mb-4 bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 px-4 py-3 rounded-2xl flex items-center justify-between text-xs sm:text-sm">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
              <span>{errorNotice}</span>
            </div>
            <button
              onClick={loadData}
              className="font-bold underline ml-2 text-amber-800 dark:text-amber-300 hover:text-amber-950"
            >
              আবার চেষ্টা করুন
            </button>
          </div>
        )}

        {/* Dynamic Statistics Bar */}
        <StatsBar
          stats={stats}
          currentFilter={matchFilter}
          onSelectFilter={handleSelectFilter}
        />

        {/* Search, Filter & View Controls */}
        <ViewControls
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          matchFilter={matchFilter}
          setMatchFilter={setMatchFilter}
          sortBy={sortBy}
          setSortBy={setSortBy}
          displayLayout={displayLayout}
          setDisplayLayout={setDisplayLayout}
          totalFilteredCount={filteredUsers.length}
          totalCount={mergedUsers.length}
          onResetFilters={handleResetFilters}
        />

        {/* View Mode Content Renderer */}
        {isLoading && mergedUsers.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-16 text-center shadow-xs">
            <RotateCw className="w-8 h-8 text-teal-600 dark:text-teal-400 animate-spin mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">Google Sheets থেকে ডেটা মার্জ করা হচ্ছে...</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              বাংলা ও ইংরেজি শিট স্ক্যান এবং এনআইডি/ইউজারনেম ম্যাপিং চলছে
            </p>
          </div>
        ) : viewMode === 'side-by-side' ? (
          /* Side by Side Comparative View */
          <SideBySideView
            users={filteredUsers}
            onSelectUser={handleSelectUser}
            onOpenImage={handleOpenImage}
            copiedId={copiedId}
            onCopy={handleCopy}
          />
        ) : displayLayout === 'table' ? (
          /* Table View */
          <UserTable
            users={filteredUsers}
            viewMode={viewMode}
            onSelectUser={handleSelectUser}
            onOpenImage={handleOpenImage}
            copiedId={copiedId}
            onCopy={handleCopy}
          />
        ) : (
          /* Card Grid View */
          <UserGrid
            users={filteredUsers}
            viewMode={viewMode}
            onSelectUser={handleSelectUser}
            onOpenImage={handleOpenImage}
            copiedId={copiedId}
            onCopy={handleCopy}
          />
        )}

      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-900 border-t border-slate-200/80 dark:border-slate-800 py-4 mt-8 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2.5 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700 dark:text-slate-200">ইউজার ডাটাবেস</span>
            <span>•</span>
            <span>Google Sheets & Google Drive ইন্টিগ্রেশন</span>
          </div>

          <div className="flex items-center gap-4">
            <span>সারি বা কার্ড ক্লিক → সম্পূর্ণ বিস্তারিত</span>
            <button 
              onClick={handleOpenExport}
              className="text-teal-700 dark:text-teal-400 hover:underline font-medium cursor-pointer"
            >
              এক্সপোর্ট / রিপোর্ট
            </button>
          </div>
        </div>
      </footer>

      {/* Modals & Dialogs */}
      <UserDetailModal
        user={selectedUser}
        onClose={handleCloseUser}
        onOpenImage={handleOpenImage}
        copiedId={copiedId}
        onCopy={handleCopy}
      />

      <ImageViewerModal
        imageUrl={selectedImage}
        onClose={handleCloseImage}
      />

      <ExportModal
        isOpen={isExportOpen}
        onClose={handleCloseExport}
        users={mergedUsers}
        filteredUsers={filteredUsers}
        currentViewMode={viewMode}
      />

    </div>
  );
}
