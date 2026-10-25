import React from 'react';
import { MergedUser, ViewMode } from '../types';
import { 
  Phone, 
  MapPin, 
  Eye, 
  CheckCircle2, 
  Copy, 
  Check, 
  CreditCard, 
  User as UserIcon,
  MessageCircle
} from 'lucide-react';
import { toBengaliNumber } from '../services/sheetService';

interface UserGridProps {
  users: MergedUser[];
  viewMode: ViewMode;
  onSelectUser: (user: MergedUser) => void;
  onOpenImage: (url: string) => void;
  copiedId: string | null;
  onCopy: (text: string, id: string) => void;
}

export const UserGrid: React.FC<UserGridProps> = React.memo(({
  users,
  onSelectUser,
  onOpenImage,
  copiedId,
  onCopy
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5 sm:gap-4">
      {users.map((user) => {
        const hasPhoto = !!user.image;
        const isMerged = user.matchType === 'merged';
        const isBanglaOnly = user.matchType === 'bangla_only';

        return (
          <div
            key={`user-card-${user.serial}-${user.username}`}
            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-4 shadow-2xs hover:shadow-xs flex flex-col justify-between group"
          >
            <div>
              {/* Top Row: Serial, Match Badge, Photo */}
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="relative">
                    {hasPhoto ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenImage(user.image);
                        }}
                        className="cursor-zoom-in"
                        title="বড় ছবি দেখতে ক্লিক করুন"
                      >
                        <img
                          src={user.image}
                          alt={user.name}
                          referrerPolicy="no-referrer"
                          className="w-12 h-12 rounded-xl object-cover border-2 border-teal-100 dark:border-teal-800 group-hover:border-teal-400 shadow-2xs transition-colors"
                        />
                      </button>
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 font-bold text-base">
                        {user.name.charAt(0) || <UserIcon className="w-5 h-5" />}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-mono font-semibold text-slate-400 dark:text-slate-500">
                        #{toBengaliNumber(user.serial)}
                      </span>
                    </div>

                    {user.nameBn ? (
                      <div className="flex items-center gap-1 mt-0.5">
                        <span className="text-[9px] font-bold px-1 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 shrink-0">বাং</span>
                        <h3 className="font-bold text-slate-900 dark:text-white group-hover:text-teal-700 dark:group-hover:text-teal-400 transition-colors leading-snug truncate">
                          {user.nameBn}
                        </h3>
                      </div>
                    ) : null}

                    {user.nameEn ? (
                      <div className="flex items-center gap-1 mt-0.5">
                        <span className="text-[9px] font-bold px-1 py-0.2 rounded bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 shrink-0">EN</span>
                        <p className="text-xs text-slate-600 dark:text-slate-300 font-medium truncate">
                          {user.nameEn}
                        </p>
                      </div>
                    ) : null}

                    {!user.nameBn && !user.nameEn && (
                      <h3 className="font-bold text-slate-900 dark:text-white leading-snug">
                        {user.name || '—'}
                      </h3>
                    )}
                  </div>
                </div>

                {/* Match badge */}
                <div>
                  {isMerged ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                      <CheckCircle2 className="w-3 h-3" />
                      মার্জড
                    </span>
                  ) : isBanglaOnly ? (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
                      বাংলা
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                      English
                    </span>
                  )}
                </div>
              </div>

              {/* Username & Cust ID */}
              <div className="flex flex-wrap items-center gap-1.5 mb-3">
                <span className="px-2 py-0.5 rounded-md text-xs font-mono font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  @{user.username || 'unknown'}
                </span>
                {user.custId && (
                  <span className="px-2 py-0.5 rounded-md text-xs font-mono font-medium bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 border border-teal-200/60 dark:border-teal-800">
                    ID: {user.custId}
                  </span>
                )}
              </div>

              {/* Information Rows */}
              <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300 bg-slate-50/70 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 mb-3">
                {/* NID */}
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                    <CreditCard className="w-3 h-3 text-slate-400" />
                    NID:
                  </span>
                  <div className="flex items-center gap-1">
                    <span className="font-mono font-medium text-slate-800 dark:text-slate-200">
                      {user.nid || '—'}
                    </span>
                    {user.nid && (
                      <button
                        onClick={() => onCopy(user.nid, `grid-nid-${user.serial}`)}
                        className="text-slate-400 hover:text-teal-700 dark:hover:text-teal-400 p-0.5 cursor-pointer"
                        title="কপি করুন"
                      >
                        {copiedId === `grid-nid-${user.serial}` ? (
                          <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {/* Mobile (Bilingual display) */}
                <div className="space-y-1">
                  {user.mobileBn && (
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                        <Phone className="w-3 h-3 text-slate-400" />
                        মোবাইল (বাং):
                      </span>
                      <div className="flex items-center gap-1">
                        <a
                          href={`tel:${user.mobileBn}`}
                          className="font-mono font-medium text-slate-800 dark:text-slate-200 hover:text-teal-600 dark:hover:text-teal-400"
                        >
                          {user.mobileBn}
                        </a>
                        <button
                          onClick={() => onCopy(user.mobileBn!, `grid-mob-bn-${user.serial}`)}
                          className="text-slate-400 hover:text-teal-700 dark:hover:text-teal-400 p-0.5 cursor-pointer"
                          title="কপি করুন"
                        >
                          {copiedId === `grid-mob-bn-${user.serial}` ? (
                            <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                    </div>
                  )}

                  {user.mobileEn && user.mobileEn !== user.mobileBn && (
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1 text-teal-700 dark:text-teal-400">
                        <Phone className="w-3 h-3 text-teal-600 dark:text-teal-400" />
                        Mobile (EN):
                      </span>
                      <div className="flex items-center gap-1">
                        <a
                          href={`tel:${user.mobileEn}`}
                          className="font-mono font-medium text-teal-800 dark:text-teal-300 hover:text-teal-600 dark:hover:text-teal-400"
                        >
                          {user.mobileEn}
                        </a>
                        <button
                          onClick={() => onCopy(user.mobileEn!, `grid-mob-en-${user.serial}`)}
                          className="text-slate-400 hover:text-teal-700 dark:hover:text-teal-400 p-0.5 cursor-pointer"
                          title="কপি করুন"
                        >
                          {copiedId === `grid-mob-en-${user.serial}` ? (
                            <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                    </div>
                  )}

                  {!user.mobileBn && !user.mobileEn && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 dark:text-slate-400">মোবাইল:</span>
                      <span className="text-slate-400 font-mono">—</span>
                    </div>
                  )}
                </div>

                {/* Address (Bilingual display) */}
                <div className="pt-1 border-t border-slate-200/60 dark:border-slate-700 space-y-1">
                  {user.addressBn && (
                    <div className="flex items-start gap-1">
                      <MapPin className="w-3 h-3 text-slate-400 shrink-0 mt-0.5" />
                      <span className="line-clamp-1 text-slate-700 dark:text-slate-300" title={`বাংলা: ${user.addressBn}`}>
                        <strong className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold mr-1">বাংলা:</strong>
                        {user.addressBn}
                      </span>
                    </div>
                  )}

                  {user.addressEn && (
                    <div className="flex items-start gap-1">
                      <MapPin className="w-3 h-3 text-teal-500 shrink-0 mt-0.5" />
                      <span className="line-clamp-1 text-slate-600 dark:text-slate-300" title={`EN: ${user.addressEn}`}>
                        <strong className="text-[10px] text-teal-600 dark:text-teal-400 font-semibold mr-1">EN:</strong>
                        {user.addressEn}
                      </span>
                    </div>
                  )}

                  {!user.addressBn && !user.addressEn && (
                    <div className="flex items-start gap-1">
                      <MapPin className="w-3 h-3 text-slate-400 shrink-0 mt-0.5" />
                      <span className="text-slate-400 italic">ঠিকানা নেই</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center gap-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => onSelectUser(user)}
                className="flex-1 py-1.5 px-3 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>বিস্তারিত দেখুন</span>
              </button>

              {user.mobile && (
                <>
                  <a
                    href={`tel:${user.mobile}`}
                    title="কল করুন"
                    className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-teal-700 dark:hover:text-teal-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5" />
                  </a>
                  <a
                    href={`https://wa.me/88${user.mobile.replace(/^0/, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    title="হোয়াটসঅ্যাপ মেসেজ"
                    className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 transition-colors"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                  </a>
                </>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
});
UserGrid.displayName = 'UserGrid';
