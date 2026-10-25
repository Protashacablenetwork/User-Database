import React, { useState } from 'react';
import { MergedUser } from '../types';
import { 
  ArrowRightLeft, 
  CheckCircle2, 
  AlertTriangle, 
  Eye, 
  Sparkles,
  Database
} from 'lucide-react';
import { toBengaliNumber } from '../services/sheetService';

interface SideBySideViewProps {
  users: MergedUser[];
  onSelectUser: (user: MergedUser) => void;
  onOpenImage: (url: string) => void;
  copiedId: string | null;
  onCopy: (text: string, id: string) => void;
}

export const SideBySideView: React.FC<SideBySideViewProps> = React.memo(({
  users,
  onSelectUser,
}) => {
  const [filterCompare, setFilterCompare] = useState<'all' | 'matched_only' | 'unmatched_only'>('all');

  const filteredUsers = users.filter(u => {
    if (filterCompare === 'matched_only') return u.matchType === 'merged';
    if (filterCompare === 'unmatched_only') return u.matchType !== 'merged';
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Comparator Sub-Header */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-400 flex items-center justify-center">
            <ArrowRightLeft className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">বাংলা ও ইংরেজি ডেটা দ্বিমুখী তুলনা (Side-by-Side Comparator)</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">উভয় শিটের প্রতিটি রেকর্ড পাশাপাশি রেখে ফিল্ড বাই ফিল্ড মিল পরীক্ষা করুন</p>
          </div>
        </div>

        {/* Filter buttons */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-medium">
          <button
            onClick={() => setFilterCompare('all')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              filterCompare === 'all'
                ? 'bg-white dark:bg-slate-700 text-teal-800 dark:text-teal-300 shadow-2xs font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            সব ({toBengaliNumber(users.length)})
          </button>
          <button
            onClick={() => setFilterCompare('matched_only')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              filterCompare === 'matched_only'
                ? 'bg-white dark:bg-slate-700 text-emerald-800 dark:text-emerald-300 shadow-2xs font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            ✅ মার্জড মিল ({toBengaliNumber(users.filter(u => u.matchType === 'merged').length)})
          </button>
          <button
            onClick={() => setFilterCompare('unmatched_only')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              filterCompare === 'unmatched_only'
                ? 'bg-white dark:bg-slate-700 text-amber-800 dark:text-amber-300 shadow-2xs font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            ⚠️ অমিল / এক শিটের ডেটা ({toBengaliNumber(users.filter(u => u.matchType !== 'merged').length)})
          </button>
        </div>
      </div>

      {/* Comparison List */}
      <div className="space-y-3.5">
        {filteredUsers.map((user) => {
          const isMerged = user.matchType === 'merged';
          const hasBn = !!user.bnRaw;
          const hasEn = !!user.enRaw;

          return (
            <div
              key={`side-row-${user.serial}-${user.username}`}
              className={`bg-white dark:bg-slate-900 rounded-2xl border shadow-2xs hover:shadow-xs p-4 ${
                isMerged ? 'border-emerald-200/90 dark:border-emerald-800/80' : 'border-amber-200/90 dark:border-amber-800/80'
              }`}
            >
              {/* Header Bar of Row */}
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 dark:border-slate-800 flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                    #{toBengaliNumber(user.serial)}
                  </span>
                  <span className="font-mono text-xs font-semibold bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 px-2.5 py-0.5 rounded-full border border-teal-200/60 dark:border-teal-800">
                    @{user.username || 'unknown'}
                  </span>
                  {user.nid && (
                    <span className="text-xs font-mono text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                      NID: {user.nid}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {isMerged ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      উভয় শিট সংযুক্ত ও মার্জড
                    </span>
                  ) : hasBn ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
                      <AlertTriangle className="w-3.5 h-3.5 text-sky-500" />
                      শুধুমাত্র বাংলা শিটে প্রাপ্ত
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                      Only in English Sheet
                    </span>
                  )}

                  <button
                    onClick={() => onSelectUser(user)}
                    className="text-xs font-semibold text-teal-700 dark:text-teal-400 hover:text-teal-800 bg-teal-50 dark:bg-teal-950/60 hover:bg-teal-100 dark:hover:bg-teal-900/60 px-2.5 py-1 rounded-lg border border-teal-200 dark:border-teal-800 flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>কার্ড দেখুন</span>
                  </button>
                </div>
              </div>

              {/* 2-Column Split: Left (Bangla) vs Right (English) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                
                {/* Bangla Column */}
                <div className={`p-3.5 rounded-xl border ${
                  hasBn 
                    ? 'bg-sky-50/40 dark:bg-sky-950/20 border-sky-200/80 dark:border-sky-900/50' 
                    : 'bg-slate-50 dark:bg-slate-900/50 border-dashed border-slate-200 dark:border-slate-800 opacity-60'
                }`}>
                  <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-sky-200/60 dark:border-sky-900/60">
                    <span className="text-xs font-bold text-sky-900 dark:text-sky-300 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                      বাংলা গুগল শিট (Bangla Record)
                    </span>
                    {hasBn && user.bnRaw?.id && (
                      <span className="text-[11px] font-mono text-sky-700 dark:text-sky-400">
                        আইডি: {user.bnRaw.id}
                      </span>
                    )}
                  </div>

                  {hasBn ? (
                    <div className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 dark:text-slate-400 font-medium">নাম:</span>
                        <span className="font-bold text-slate-900 dark:text-white text-sm">{user.nameBn || '—'}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 dark:text-slate-400 font-medium">মোবাইল:</span>
                        <span className="font-mono font-semibold text-teal-800 dark:text-teal-400">{user.mobileBn || '—'}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 dark:text-slate-400 font-medium">NID:</span>
                        <span className="font-mono text-slate-800 dark:text-slate-200">{user.bnRaw?.nid || '—'}</span>
                      </div>
                      <div className="flex items-start justify-between pt-1 border-t border-sky-100 dark:border-sky-900/40">
                        <span className="text-slate-500 dark:text-slate-400 font-medium shrink-0">ঠিকানা:</span>
                        <span className="text-right text-slate-800 dark:text-slate-200">{user.addressBn || '—'}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="py-4 text-center text-xs text-slate-400 italic">
                      বাংলা শিটে এই ইউজারের ডেটা পাওয়া যায়নি
                    </div>
                  )}
                </div>

                {/* English Column */}
                <div className={`p-3.5 rounded-xl border ${
                  hasEn 
                    ? 'bg-amber-50/40 dark:bg-amber-950/20 border-amber-200/80 dark:border-amber-900/50' 
                    : 'bg-slate-50 dark:bg-slate-900/50 border-dashed border-slate-200 dark:border-slate-800 opacity-60'
                }`}>
                  <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-amber-200/60 dark:border-amber-900/60">
                    <span className="text-xs font-bold text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
                      <Database className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                      English Google Sheet (English Record)
                    </span>
                    {hasEn && (
                      <span className="text-[11px] font-mono text-amber-700 dark:text-amber-400">
                        {user.custId ? `Cust ID: ${user.custId}` : user.enRaw?.id ? `ID: ${user.enRaw.id}` : ''}
                      </span>
                    )}
                  </div>

                  {hasEn ? (
                    <div className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 dark:text-slate-400 font-medium">Name:</span>
                        <span className="font-bold text-slate-900 dark:text-white text-sm">{user.nameEn || '—'}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 dark:text-slate-400 font-medium">Mobile:</span>
                        <span className="font-mono font-semibold text-teal-800 dark:text-teal-400">{user.mobileEn || '—'}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 dark:text-slate-400 font-medium">NID:</span>
                        <span className="font-mono font-semibold text-slate-900 dark:text-white">{user.enRaw?.nid || '—'}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 dark:text-slate-400 font-medium">Customer ID / SN:</span>
                        <span className="font-mono text-slate-800 dark:text-slate-200">{user.custId || user.sn || '—'}</span>
                      </div>
                      <div className="flex items-start justify-between pt-1 border-t border-amber-100 dark:border-amber-900/40">
                        <span className="text-slate-500 dark:text-slate-400 font-medium shrink-0">Address:</span>
                        <span className="text-right text-slate-800 dark:text-slate-200">{user.addressEn || '—'}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="py-4 text-center text-xs text-slate-400 italic">
                      No matching record in English Google Sheet
                    </div>
                  )}
                </div>

              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
});
SideBySideView.displayName = 'SideBySideView';
