import React from 'react';
import { MergeStats } from '../types';
import { Users, Link2, FileSpreadsheet, Image as ImageIcon, CreditCard } from 'lucide-react';
import { toBengaliNumber } from '../services/sheetService';

interface StatsBarProps {
  stats: MergeStats;
  currentFilter: string;
  onSelectFilter: (filter: any) => void;
}

export const StatsBar: React.FC<StatsBarProps> = React.memo(({
  stats,
  currentFilter,
  onSelectFilter
}) => {
  const statCards = [
    {
      id: 'all',
      title: 'মোট ইউজার',
      subtitle: 'মার্জড ফলাফল',
      count: stats.totalMerged,
      icon: Users,
      color: 'from-sky-500 to-blue-600',
      activeBorder: 'border-blue-500 ring-2 ring-blue-200 dark:ring-blue-900/60 dark:border-blue-400'
    },
    {
      id: 'merged_only',
      title: 'উভয় শিটে মিল',
      subtitle: '১০০% মার্জড',
      count: stats.matchedCount,
      icon: Link2,
      color: 'from-emerald-500 to-teal-600',
      activeBorder: 'border-emerald-500 ring-2 ring-emerald-200 dark:ring-emerald-900/60 dark:border-emerald-400'
    },
    {
      id: 'has_bangla',
      title: 'বাংলা শিট ডেটা',
      subtitle: 'মোট রেকর্ড',
      count: stats.totalBangla,
      icon: FileSpreadsheet,
      color: 'from-indigo-500 to-violet-600',
      activeBorder: 'border-indigo-500 ring-2 ring-indigo-200 dark:ring-indigo-900/60 dark:border-indigo-400'
    },
    {
      id: 'has_english',
      title: 'ইংরেজি শিট ডেটা',
      subtitle: 'মোট রেকর্ড',
      count: stats.totalEnglish,
      icon: FileSpreadsheet,
      color: 'from-amber-500 to-orange-600',
      activeBorder: 'border-amber-500 ring-2 ring-amber-200 dark:ring-amber-900/60 dark:border-amber-400'
    },
    {
      id: 'has_nid',
      title: 'NID নিবন্ধিত',
      subtitle: 'পরিচয়পত্র সহ',
      count: stats.withNidCount,
      icon: CreditCard,
      color: 'from-teal-500 to-cyan-600',
      activeBorder: 'border-teal-500 ring-2 ring-teal-200 dark:ring-teal-900/60 dark:border-teal-400'
    },
    {
      id: 'has_photo',
      title: 'ছবি যুক্ত ইউজার',
      subtitle: 'ড্রাইভ / ফটো',
      count: stats.withPhotoCount,
      icon: ImageIcon,
      color: 'from-rose-500 to-pink-600',
      activeBorder: 'border-rose-500 ring-2 ring-rose-200 dark:ring-rose-900/60 dark:border-rose-400'
    }
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3.5 mb-5">
      {statCards.map((stat) => {
        const Icon = stat.icon;
        const isSelected = currentFilter === stat.id;
        return (
          <button
            key={stat.id}
            id={`stat-card-${stat.id}`}
            onClick={() => onSelectFilter(isSelected ? 'all' : stat.id)}
            className={`text-left p-3.5 rounded-2xl bg-white dark:bg-slate-900 border shadow-2xs hover:shadow-xs cursor-pointer ${
              isSelected
                ? `${stat.activeBorder} bg-slate-50/80 dark:bg-slate-800/90 shadow-sm`
                : 'border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center text-white shadow-2xs`}>
                <Icon className="w-4 h-4" />
              </div>
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                {stat.subtitle}
              </span>
            </div>

            <div className="flex items-baseline justify-between mt-1">
              <div>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 truncate">{stat.title}</p>
                <p className="text-xl font-bold text-slate-900 dark:text-white tracking-tight mt-0.5">
                  {toBengaliNumber(stat.count)}
                  <span className="text-xs font-normal text-slate-500 dark:text-slate-400 ml-1">জন</span>
                </p>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
});
StatsBar.displayName = 'StatsBar';
