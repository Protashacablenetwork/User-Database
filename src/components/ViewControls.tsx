import React, { useRef, useEffect } from 'react';
import { Search, X, ArrowUpDown, LayoutGrid, Table as TableIcon, Filter } from 'lucide-react';
import { DisplayLayout } from '../types';
import { toBengaliNumber } from '../services/sheetService';

interface ViewControlsProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  matchFilter: string;
  setMatchFilter: (f: any) => void;
  sortBy: string;
  setSortBy: (s: any) => void;
  displayLayout: DisplayLayout;
  setDisplayLayout: (layout: DisplayLayout) => void;
  totalFilteredCount: number;
  totalCount: number;
  onResetFilters: () => void;
}

export const ViewControls: React.FC<ViewControlsProps> = React.memo(({
  searchQuery,
  setSearchQuery,
  matchFilter,
  setMatchFilter,
  sortBy,
  setSortBy,
  displayLayout,
  setDisplayLayout,
  totalFilteredCount,
  totalCount,
  onResetFilters
}) => {
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut Ctrl+F or /
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const hasActiveFilters = searchQuery.trim() !== '' || matchFilter !== 'all' || sortBy !== 'serial';

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-3 sm:p-4 shadow-xs mb-4">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        
        {/* Search Bar */}
        <div className="relative flex-1 min-w-[260px]">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4 text-teal-600 dark:text-teal-400" />
          </div>
          <input
            ref={searchInputRef}
            id="search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="NID, নাম (বাংলা বা ইংরেজি), মোবাইল, ইউজারনেম, বা ঠিকানা দিয়ে সার্চ..."
            className="w-full pl-10 pr-20 py-2 bg-slate-50/70 dark:bg-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-800 focus:bg-white dark:focus:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-teal-500 dark:focus:border-teal-400 rounded-xl text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 transition-all"
          />
          {searchQuery ? (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          ) : (
            <div className="hidden sm:flex absolute inset-y-0 right-3 items-center pointer-events-none">
              <kbd className="px-1.5 py-0.5 text-[10px] font-semibold text-slate-400 dark:text-slate-500 bg-slate-200/60 dark:bg-slate-700/60 rounded border border-slate-300 dark:border-slate-600">
                Ctrl+F
              </kbd>
            </div>
          )}
        </div>

        {/* Filter Controls Row */}
        <div className="flex flex-wrap items-center gap-2">
          
          {/* Match Filter Select */}
          <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1 text-sm text-slate-700 dark:text-slate-200">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              id="filter-select"
              value={matchFilter}
              onChange={(e) => setMatchFilter(e.target.value as any)}
              className="bg-transparent border-none text-sm font-medium text-slate-800 dark:text-slate-100 focus:outline-hidden cursor-pointer dark:bg-slate-800"
            >
              <option value="all" className="dark:bg-slate-800 dark:text-white">সব রেকর্ড ({toBengaliNumber(totalCount)})</option>
              <option value="merged_only" className="dark:bg-slate-800 dark:text-white">🔄 উভয় শিটে মিল (১০০% মার্জড)</option>
              <option value="has_bangla" className="dark:bg-slate-800 dark:text-white">🇧🇩 বাংলা শিটের সব ডেটা</option>
              <option value="has_english" className="dark:bg-slate-800 dark:text-white">🇬🇧 ইংরেজি শিটের সব ডেটা</option>
              <option value="english_only" className="dark:bg-slate-800 dark:text-white">🇬🇧 শুধুমাত্র ইংরেজি শিটে (আনমার্জড)</option>
              <option value="has_nid" className="dark:bg-slate-800 dark:text-white">🪪 NID নম্বর যুক্ত</option>
              <option value="has_photo" className="dark:bg-slate-800 dark:text-white">🖼️ ছবি যুক্ত প্রোফাইল</option>
            </select>
          </div>

          {/* Sort Select */}
          <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1 text-sm text-slate-700 dark:text-slate-200">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <select
              id="sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent border-none text-sm font-medium text-slate-800 dark:text-slate-100 focus:outline-hidden cursor-pointer dark:bg-slate-800"
            >
              <option value="serial" className="dark:bg-slate-800 dark:text-white">ক্রমিক নং অনুসারে</option>
              <option value="name" className="dark:bg-slate-800 dark:text-white">নাম (অ-ক্ষর ক্রম)</option>
              <option value="match" className="dark:bg-slate-800 dark:text-white">মার্জ অবস্থা অনুযায়ী</option>
              <option value="nid" className="dark:bg-slate-800 dark:text-white">NID নম্বর অনুযায়ী</option>
              <option value="mobile" className="dark:bg-slate-800 dark:text-white">মোবাইল নম্বর অনুযায়ী</option>
            </select>
          </div>

          {/* Table vs Grid Toggle */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
            <button
              id="btn-layout-table"
              onClick={() => setDisplayLayout('table')}
              title="টেবিল ভিউ"
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                displayLayout === 'table'
                  ? 'bg-white dark:bg-slate-700 text-teal-700 dark:text-teal-300 shadow-2xs font-semibold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <TableIcon className="w-4 h-4" />
            </button>
            <button
              id="btn-layout-cards"
              onClick={() => setDisplayLayout('cards')}
              title="কার্ড গ্রিড ভিউ"
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                displayLayout === 'cards'
                  ? 'bg-white dark:bg-slate-700 text-teal-700 dark:text-teal-300 shadow-2xs font-semibold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>

          {/* Reset Filters button if any active */}
          {hasActiveFilters && (
            <button
              id="btn-reset-filters"
              onClick={onResetFilters}
              className="inline-flex items-center gap-1 text-xs text-rose-600 dark:text-rose-400 hover:text-rose-700 bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 dark:hover:bg-rose-900/60 px-2.5 py-1.5 rounded-lg border border-rose-200 dark:border-rose-800 font-medium transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              <span>রিসেট</span>
            </button>
          )}

        </div>
      </div>

      {/* Result Counter Subtitle */}
      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
        <div>
          প্রদর্শিত হচ্ছে <span className="font-bold text-teal-800 dark:text-teal-400">{toBengaliNumber(totalFilteredCount)}</span> জন ইউজার
          {totalFilteredCount !== totalCount && (
            <span> (মোট {toBengaliNumber(totalCount)} জনের মধ্য থেকে ফিল্টার করা)</span>
          )}
        </div>
        <div className="hidden sm:block text-slate-400 dark:text-slate-500">
          💡 সারিতে ক্লিক করে বিস্তারিত প্রোফাইল ও উভয় ভাষার ডেটা দেখুন
        </div>
      </div>
    </div>
  );
});
ViewControls.displayName = 'ViewControls';
