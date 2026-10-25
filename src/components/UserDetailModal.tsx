import React, { useState } from 'react';
import { MergedUser } from '../types';
import { 
  X, 
  Phone, 
  Copy, 
  Check, 
  MessageCircle, 
  Printer, 
  Sparkles, 
  Database, 
  User as UserIcon, 
  CheckCircle2, 
  ShieldCheck,
  Calendar
} from 'lucide-react';
import { toBengaliNumber } from '../services/sheetService';

interface UserDetailModalProps {
  user: MergedUser | null;
  onClose: () => void;
  onOpenImage: (url: string) => void;
  copiedId: string | null;
  onCopy: (text: string, id: string) => void;
}

export const UserDetailModal: React.FC<UserDetailModalProps> = ({
  user,
  onClose,
  onOpenImage,
  copiedId,
  onCopy
}) => {
  const [activeTab, setActiveTab] = useState<'both' | 'bangla' | 'english'>('both');

  if (!user) return null;

  const hasPhoto = !!user.image;
  const isMerged = user.matchType === 'merged';

  const handlePrint = () => {
    window.print();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 dark:bg-black/70 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-2xl max-w-2xl w-full max-h-[92vh] overflow-y-auto overflow-x-hidden relative flex flex-col justify-between"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Sticky Bar */}
        <div className="sticky top-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between z-10">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-teal-800 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/60 px-2.5 py-1 rounded-lg border border-teal-200/60 dark:border-teal-800">
              ক্রমিক: #{toBengaliNumber(user.serial)}
            </span>
            {isMerged ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                <CheckCircle2 className="w-3.5 h-3.5" />
                মার্জড (উভয় শিট মিল)
              </span>
            ) : user.matchType === 'bangla_only' ? (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
                🇧🇩 শুধু বাংলা শিটের ডেটা
              </span>
            ) : (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                🇬🇧 Only English Sheet Data
              </span>
            )}
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-5">
          
          {/* Profile Header */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left bg-gradient-to-br from-slate-50 to-teal-50/40 dark:from-slate-800/80 dark:to-teal-950/30 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
            <div className="relative">
              {hasPhoto ? (
                <button
                  onClick={() => onOpenImage(user.image)}
                  className="cursor-zoom-in group/img relative"
                  title="বড় করে দেখতে ক্লিক করুন"
                >
                  <img
                    src={user.image}
                    alt={user.name}
                    referrerPolicy="no-referrer"
                    className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-3 border-teal-200 dark:border-teal-700 group-hover/img:border-teal-500 shadow-md transition-all"
                  />
                  <div className="absolute inset-0 bg-black/20 rounded-2xl opacity-0 group-hover/img:opacity-100 flex items-center justify-center transition-opacity text-white text-xs font-medium">
                    বড় করুন
                  </div>
                </button>
              ) : (
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 font-bold text-2xl shadow-xs">
                  {user.name.charAt(0) || <UserIcon className="w-8 h-8" />}
                </div>
              )}
            </div>

            <div className="flex-1">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white leading-tight">
                {user.nameBn || user.name || 'নাম পাওয়া যায়নি'}
              </h2>
              {user.nameEn && user.nameEn !== user.nameBn && (
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                  {user.nameEn}
                </p>
              )}

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-2">
                <span className="font-mono text-xs font-medium bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-700 shadow-2xs">
                  @{user.username || 'unknown'}
                </span>
                {user.custId && (
                  <span className="font-mono text-xs font-medium bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 px-2.5 py-1 rounded-md border border-teal-200 dark:border-teal-800">
                    Customer ID: {user.custId}
                  </span>
                )}
                {user.sn && (
                  <span className="font-mono text-xs font-medium bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-1 rounded-md">
                    SN: {user.sn}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Tab Selection */}
          <div className="flex items-center justify-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('both')}
              className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeTab === 'both' ? 'bg-white dark:bg-slate-700 text-teal-800 dark:text-teal-300 shadow-2xs font-bold' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              🔄 উভয় ভাষা (Dual Language)
            </button>
            <button
              onClick={() => setActiveTab('bangla')}
              className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeTab === 'bangla' ? 'bg-white dark:bg-slate-700 text-sky-800 dark:text-sky-300 shadow-2xs font-bold' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              🇧🇩 বাংলা বিবরণ
            </button>
            <button
              onClick={() => setActiveTab('english')}
              className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeTab === 'english' ? 'bg-white dark:bg-slate-700 text-amber-800 dark:text-amber-300 shadow-2xs font-bold' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              🇬🇧 English Details
            </button>
          </div>

          {/* Bilingual Boxes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            
            {/* Bangla Information Card */}
            {(activeTab === 'both' || activeTab === 'bangla') && (
              <div className={`p-4 rounded-2xl border transition-all ${
                activeTab === 'bangla' ? 'md:col-span-2' : ''
              } bg-sky-50/40 dark:bg-sky-950/20 border-sky-200 dark:border-sky-900/60`}>
                <div className="flex items-center justify-between pb-2 mb-3 border-b border-sky-200/80 dark:border-sky-900/60">
                  <span className="text-xs font-bold text-sky-950 dark:text-sky-300 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                    বাংলা গুগল শিট রেকর্ড
                  </span>
                  <span className="text-[11px] font-mono text-sky-700 dark:text-sky-400 bg-sky-100 dark:bg-sky-900/50 px-2 py-0.5 rounded">
                    SL: {user.bnId || '—'}
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div>
                    <span className="text-slate-500 dark:text-slate-400 font-medium block">গ্রাহকের নাম:</span>
                    <span className="text-sm font-bold text-slate-900 dark:text-white">{user.nameBn || '—'}</span>
                  </div>

                  <div>
                    <span className="text-slate-500 dark:text-slate-400 font-medium block">ঠিকানা:</span>
                    <span className="text-slate-800 dark:text-slate-200 font-medium">{user.addressBn || '—'}</span>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-sky-100 dark:border-sky-900/40">
                    <span className="text-slate-500 dark:text-slate-400 font-medium">মোবাইল:</span>
                    <div className="flex items-center gap-1">
                      <span className="font-mono font-semibold text-slate-900 dark:text-white">{user.mobileBn || '—'}</span>
                      {user.mobileBn && (
                        <button
                          onClick={() => onCopy(user.mobileBn, `modal-bn-mob-${user.serial}`)}
                          className="p-0.5 text-slate-400 hover:text-teal-700 dark:hover:text-teal-400 cursor-pointer"
                        >
                          {copiedId === `modal-bn-mob-${user.serial}` ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 dark:text-slate-400 font-medium">NID:</span>
                    <div className="flex items-center gap-1">
                      <span className="font-mono font-semibold text-slate-900 dark:text-white">{user.bnRaw?.nid || '—'}</span>
                      {user.bnRaw?.nid && (
                        <button
                          onClick={() => onCopy(user.bnRaw!.nid!, `modal-bn-nid-${user.serial}`)}
                          className="p-0.5 text-slate-400 hover:text-teal-700 dark:hover:text-teal-400 cursor-pointer"
                        >
                          {copiedId === `modal-bn-nid-${user.serial}` ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* English Information Card */}
            {(activeTab === 'both' || activeTab === 'english') && (
              <div className={`p-4 rounded-2xl border transition-all ${
                activeTab === 'english' ? 'md:col-span-2' : ''
              } bg-amber-50/40 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/60`}>
                <div className="flex items-center justify-between pb-2 mb-3 border-b border-amber-200/80 dark:border-amber-900/60">
                  <span className="text-xs font-bold text-amber-950 dark:text-amber-300 flex items-center gap-1.5">
                    <Database className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    English Sheet Record
                  </span>
                  <span className="text-[11px] font-mono text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/50 px-2 py-0.5 rounded">
                    Cust ID: {user.custId || '—'}
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div>
                    <span className="text-slate-500 dark:text-slate-400 font-medium block">Customer Name:</span>
                    <span className="text-sm font-bold text-slate-900 dark:text-white">{user.nameEn || '—'}</span>
                  </div>

                  <div>
                    <span className="text-slate-500 dark:text-slate-400 font-medium block">Address:</span>
                    <span className="text-slate-800 dark:text-slate-200 font-medium">{user.addressEn || '—'}</span>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-amber-100 dark:border-amber-900/40">
                    <span className="text-slate-500 dark:text-slate-400 font-medium">Mobile:</span>
                    <div className="flex items-center gap-1">
                      <span className="font-mono font-semibold text-slate-900 dark:text-white">{user.mobileEn || '—'}</span>
                      {user.mobileEn && (
                        <button
                          onClick={() => onCopy(user.mobileEn, `modal-en-mob-${user.serial}`)}
                          className="p-0.5 text-slate-400 hover:text-teal-700 dark:hover:text-teal-400 cursor-pointer"
                        >
                          {copiedId === `modal-en-mob-${user.serial}` ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 dark:text-slate-400 font-medium">NID:</span>
                    <div className="flex items-center gap-1">
                      <span className="font-mono font-semibold text-slate-900 dark:text-white">{user.enRaw?.nid || '—'}</span>
                      {user.enRaw?.nid && (
                        <button
                          onClick={() => onCopy(user.enRaw!.nid!, `modal-en-nid-${user.serial}`)}
                          className="p-0.5 text-slate-400 hover:text-teal-700 dark:hover:text-teal-400 cursor-pointer"
                        >
                          {copiedId === `modal-en-nid-${user.serial}` ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 dark:text-slate-400 font-medium">Serial No (SN):</span>
                    <span className="font-mono font-semibold text-slate-900 dark:text-white">{user.sn || '—'}</span>
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* Verification & Meta Badges */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
              এনক্রিপ্টেড ডাটাবেস রেকর্ড
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              স্ট্যাটাস: সক্রিয়
            </span>
          </div>

        </div>

        {/* Modal Footer Actions */}
        <div className="sticky bottom-0 bg-slate-50/95 dark:bg-slate-900/95 backdrop-blur-md px-5 py-3.5 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            {user.mobile && (
              <>
                <a
                  href={`tel:${user.mobile}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold shadow-xs transition-colors"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>কল করুন</span>
                </a>
                <a
                  href={`https://wa.me/88${user.mobile.replace(/^0/, '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-colors"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </a>
              </>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-medium transition-colors shadow-2xs cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-slate-600 dark:text-slate-300" />
              <span>প্রিন্ট স্লিপ</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-100 text-xs font-semibold transition-colors cursor-pointer"
            >
              বন্ধ করুন
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
