import React from 'react';
import { MergedUser, ViewMode } from '../types';
import { 
  Phone, 
  MapPin, 
  Eye, 
  CheckCircle2, 
  AlertCircle, 
  Copy, 
  Check, 
  User as UserIcon
} from 'lucide-react';
import { toBengaliNumber } from '../services/sheetService';

interface UserTableProps {
  users: MergedUser[];
  viewMode: ViewMode;
  onSelectUser: (user: MergedUser) => void;
  onOpenImage: (url: string) => void;
  copiedId: string | null;
  onCopy: (text: string, id: string) => void;
}

export const UserTable: React.FC<UserTableProps> = React.memo(({
  users,
  viewMode,
  onSelectUser,
  onOpenImage,
  copiedId,
  onCopy
}) => {
  if (users.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-12 text-center shadow-xs">
        <div className="w-14 h-14 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-3.5 text-slate-400">
          <AlertCircle className="w-7 h-7" />
        </div>
        <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200 mb-1">কোনো ইউজার ডেটা পাওয়া যায়নি</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
          অনুসন্ধানের সাথে কোনো রেকর্ড মিলছে না। অনুগ্রহ করে সার্চ ফিল্টার পরিবর্তন করুন অথবা রিসেট বাটনে ক্লিক করুন।
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/90 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
              <th className="py-3 px-3.5 text-center w-14">ক্রমিক</th>
              <th className="py-3 px-3 text-center w-16">ছবি</th>
              <th className="py-3 px-3.5 min-w-[150px]">ইউজারনেম</th>
              <th className="py-3 px-4 min-w-[200px]">
                {viewMode === 'bangla' ? 'গ্রাহকের নাম (বাংলা)' : viewMode === 'english' ? 'Customer Name (EN)' : 'নাম (বাংলা ও ইংরেজি)'}
              </th>
              <th className="py-3 px-3.5 min-w-[160px]">NID নম্বর</th>
              <th className="py-3 px-3.5 min-w-[150px]">মোবাইল</th>
              <th className="py-3 px-4 min-w-[200px]">ঠিকানা</th>
              {viewMode === 'merged' && (
                <th className="py-3 px-3.5 text-center min-w-[140px]">মার্জ স্ট্যাটাস</th>
              )}
              <th className="py-3 px-3.5 text-center w-20">অ্যাকশন</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-sm text-slate-800 dark:text-slate-200">
            {users.map((user) => {
              const hasPhoto = !!user.image;
              const isMerged = user.matchType === 'merged';
              const isBanglaOnly = user.matchType === 'bangla_only';

              return (
                <tr
                  key={`user-row-${user.serial}-${user.username}`}
                  onClick={() => onSelectUser(user)}
                  className="hover:bg-slate-50/80 dark:hover:bg-slate-800/60 transition-colors cursor-pointer group"
                >
                  {/* Serial */}
                  <td className="py-3 px-3.5 text-center font-bold text-slate-500 dark:text-slate-400 text-xs">
                    {toBengaliNumber(user.serial)}
                  </td>

                  {/* Avatar */}
                  <td className="py-3 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                    <div className="relative inline-block">
                      {hasPhoto ? (
                        <button
                          onClick={() => onOpenImage(user.image)}
                          title="বড় ছবি দেখতে ক্লিক করুন"
                          className="relative group/avatar cursor-zoom-in"
                        >
                          <img
                            src={user.image}
                            alt={user.name}
                            referrerPolicy="no-referrer"
                            className="w-10 h-10 rounded-full object-cover border-2 border-teal-200 dark:border-teal-800 group-hover/avatar:border-teal-500 shadow-2xs transition-transform duration-200 group-hover/avatar:scale-105"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                        </button>
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 font-semibold text-xs">
                          {user.name.charAt(0) || <UserIcon className="w-4 h-4" />}
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Username */}
                  <td className="py-3 px-3.5">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono border border-slate-200/60 dark:border-slate-700">
                      @{user.username || 'unknown'}
                    </span>
                    {user.custId && (
                      <span className="block text-[11px] text-teal-700 dark:text-teal-400 font-mono mt-0.5">
                        ID: {user.custId}
                      </span>
                    )}
                  </td>

                  {/* Name (Bilingual preview) */}
                  <td className="py-3 px-4">
                    {user.nameBn ? (
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                          বাংলা
                        </span>
                        <span className="font-semibold text-slate-900 dark:text-white group-hover:text-teal-700 dark:group-hover:text-teal-400 transition-colors">
                          {user.nameBn}
                        </span>
                      </div>
                    ) : null}
                    
                    {user.nameEn ? (
                      <div className={`flex items-center gap-1.5 ${user.nameBn ? 'mt-1' : ''}`}>
                        <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200/70 dark:border-teal-800/70">
                          EN
                        </span>
                        <span className="text-xs font-medium text-slate-700 dark:text-slate-300 group-hover:text-teal-800 dark:group-hover:text-teal-300 transition-colors">
                          {user.nameEn}
                        </span>
                      </div>
                    ) : null}

                    {!user.nameBn && !user.nameEn && (
                      <span className="text-slate-400 italic text-xs">—</span>
                    )}
                  </td>

                  {/* NID */}
                  <td className="py-3 px-3.5" onClick={(e) => e.stopPropagation()}>
                    {user.nid ? (
                      <div className="flex items-center gap-1.5">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-mono font-medium bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                          {user.nid}
                        </span>
                        <button
                          onClick={() => onCopy(user.nid, `nid-${user.serial}`)}
                          title="NID কপি করুন"
                          className="p-1 text-slate-400 hover:text-teal-700 dark:hover:text-teal-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors cursor-pointer"
                        >
                          {copiedId === `nid-${user.serial}` ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400 italic">—</span>
                    )}
                  </td>

                  {/* Mobile (Bilingual / Multi-phone display) */}
                  <td className="py-3 px-3.5" onClick={(e) => e.stopPropagation()}>
                    {user.mobileBn || user.mobileEn || user.mobile ? (
                      <div className="space-y-1">
                        {/* Primary / Bangla Mobile */}
                        {user.mobileBn && (
                          <div className="flex items-center gap-1.5">
                            {user.mobileEn && user.mobileEn !== user.mobileBn && (
                              <span className="text-[9px] font-bold px-1 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">বাং</span>
                            )}
                            <a
                              href={`tel:${user.mobileBn}`}
                              className="inline-flex items-center gap-1 text-xs font-mono font-medium text-slate-800 dark:text-slate-200 hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
                            >
                              <Phone className="w-3 h-3 text-teal-600 dark:text-teal-400" />
                              {user.mobileBn}
                            </a>
                            <button
                              onClick={() => onCopy(user.mobileBn!, `mob-bn-${user.serial}`)}
                              title="বাংলা শিটের মোবাইল কপি"
                              className="p-0.5 text-slate-400 hover:text-teal-700 dark:hover:text-teal-400 rounded cursor-pointer"
                            >
                              {copiedId === `mob-bn-${user.serial}` ? (
                                <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          </div>
                        )}

                        {/* English sheet mobile if different or if no Bangla mobile */}
                        {user.mobileEn && user.mobileEn !== user.mobileBn && (
                          <div className="flex items-center gap-1.5">
                            <span className="text-[9px] font-bold px-1 py-0.2 rounded bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300">EN</span>
                            <a
                              href={`tel:${user.mobileEn}`}
                              className="inline-flex items-center gap-1 text-xs font-mono font-medium text-teal-800 dark:text-teal-300 hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
                            >
                              <Phone className="w-3 h-3 text-teal-600 dark:text-teal-400" />
                              {user.mobileEn}
                            </a>
                            <button
                              onClick={() => onCopy(user.mobileEn!, `mob-en-${user.serial}`)}
                              title="ইংরেজি শিটের মোবাইল কপি"
                              className="p-0.5 text-slate-400 hover:text-teal-700 dark:hover:text-teal-400 rounded cursor-pointer"
                            >
                              {copiedId === `mob-en-${user.serial}` ? (
                                <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          </div>
                        )}

                        {/* Fallback to user.mobile if neither mobileBn nor mobileEn was set */}
                        {!user.mobileBn && !user.mobileEn && user.mobile && (
                          <div className="flex items-center gap-1.5">
                            <a
                              href={`tel:${user.mobile}`}
                              className="inline-flex items-center gap-1 text-xs font-mono font-medium text-slate-800 dark:text-slate-200 hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
                            >
                              <Phone className="w-3 h-3 text-teal-600 dark:text-teal-400" />
                              {user.mobile}
                            </a>
                            <button
                              onClick={() => onCopy(user.mobile, `mob-${user.serial}`)}
                              className="p-0.5 text-slate-400 hover:text-teal-700 dark:hover:text-teal-400 rounded cursor-pointer"
                            >
                              {copiedId === `mob-${user.serial}` ? (
                                <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400 italic">—</span>
                    )}
                  </td>

                  {/* Address (Bilingual display) */}
                  <td className="py-3 px-4 max-w-[280px]">
                    <div className="space-y-1">
                      {user.addressBn && (
                        <div className="flex items-start gap-1.5 text-xs text-slate-800 dark:text-slate-200" title={`বাংলা ঠিকানা: ${user.addressBn}`}>
                          <span className="text-[10px] font-bold px-1 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 shrink-0 mt-0.5">
                            বাংলা
                          </span>
                          <span className="truncate">{user.addressBn}</span>
                        </div>
                      )}
                      
                      {user.addressEn && (
                        <div className="flex items-start gap-1.5 text-xs text-slate-600 dark:text-slate-300" title={`English Address: ${user.addressEn}`}>
                          <span className="text-[10px] font-bold px-1 py-0.2 rounded bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200/70 dark:border-teal-800/70 shrink-0 mt-0.5">
                            EN
                          </span>
                          <span className="truncate">{user.addressEn}</span>
                        </div>
                      )}

                      {!user.addressBn && !user.addressEn && (
                        <div className="text-xs text-slate-400 italic">
                          {user.address || '—'}
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Match Status (Merged view only) */}
                  {viewMode === 'merged' && (
                    <td className="py-3 px-3.5 text-center">
                      {isMerged ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                          <CheckCircle2 className="w-3 h-3" />
                          উভয় মিল
                        </span>
                      ) : isBanglaOnly ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
                          🇧🇩 শুধু বাংলা
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                          🇬🇧 Only English
                        </span>
                      )}
                    </td>
                  )}

                  {/* Action Button */}
                  <td className="py-3 px-3.5 text-center">
                    <button
                      onClick={() => onSelectUser(user)}
                      className="inline-flex items-center justify-center p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-teal-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 hover:text-teal-700 dark:hover:text-teal-400 border border-slate-200 dark:border-slate-700 transition-colors shadow-2xs cursor-pointer"
                      title="বিস্তারিত দেখুন"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
});
UserTable.displayName = 'UserTable';
