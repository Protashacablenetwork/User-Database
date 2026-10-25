import React, { useState } from 'react';
import { MergedUser, ViewMode } from '../types';
import { 
  X, 
  Download, 
  FileSpreadsheet, 
  FileText, 
  Printer, 
  Check, 
  FileCode
} from 'lucide-react';
import { toBengaliNumber } from '../services/sheetService';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  users: MergedUser[];
  filteredUsers: MergedUser[];
  currentViewMode: ViewMode;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  users,
  filteredUsers
}) => {
  const [exportScope, setExportScope] = useState<'filtered' | 'all'>('filtered');
  const [downloadedFormat, setDownloadedFormat] = useState<string | null>(null);

  if (!isOpen) return null;

  const targetList = exportScope === 'filtered' ? filteredUsers : users;

  const exportCSV = (type: 'merged' | 'bangla' | 'english') => {
    let headers: string[] = [];
    let rows: (string | number)[][] = [];
    let filename = `users_export_${type}_${new Date().toISOString().slice(0, 10)}.csv`;

    if (type === 'merged') {
      headers = [
        'ক্রমিক',
        'ইউজারনেম',
        'গ্রাহকের নাম (বাংলা)',
        'Customer Name (English)',
        'NID নম্বর',
        'মোবাইল (বাংলা)',
        'Mobile (English)',
        'ঠিকানা (বাংলা)',
        'Address (English)',
        'Customer ID',
        'সিরিয়াল (SN)',
        'মার্জ স্ট্যাটাস',
        'ছবি লিংক (Image URL)'
      ];

      rows = targetList.map((u) => [
        u.serial,
        u.username || '',
        u.nameBn || '',
        u.nameEn || '',
        u.nid || '',
        u.mobileBn || '',
        u.mobileEn || '',
        u.addressBn || '',
        u.addressEn || '',
        u.custId || '',
        u.sn || '',
        u.matchType === 'merged' ? 'মার্জড (উভয় শিট)' : u.matchType === 'bangla_only' ? 'শুধু বাংলা' : 'শুধু ইংরেজি',
        u.image || ''
      ]);
    } else if (type === 'bangla') {
      headers = [
        'ক্রমিক',
        'ইউজারনেম',
        'গ্রাহকের নাম',
        'NID',
        'মোবাইল নম্বর',
        'ঠিকানা',
        'ছবি URL'
      ];

      rows = targetList
        .filter(u => !!u.bnRaw)
        .map((u) => [
          u.serial,
          u.username || '',
          u.nameBn || u.name || '',
          u.bnRaw?.nid || u.nid || '',
          u.mobileBn || u.mobile || '',
          u.addressBn || u.address || '',
          u.bnRaw?.image || u.image || ''
        ]);
      filename = `bangla_sheet_users_${new Date().toISOString().slice(0, 10)}.csv`;
    } else {
      headers = [
        'SL',
        'Username',
        'Customer Name',
        'NID',
        'Mobile',
        'Address',
        'Cust ID',
        'SN',
        'Photo URL'
      ];

      rows = targetList
        .filter(u => !!u.enRaw)
        .map((u) => [
          u.serial,
          u.username || '',
          u.nameEn || u.name || '',
          u.enRaw?.nid || u.nid || '',
          u.mobileEn || u.mobile || '',
          u.addressEn || u.address || '',
          u.custId || '',
          u.sn || '',
          u.enRaw?.image || u.image || ''
        ]);
      filename = `english_sheet_users_${new Date().toISOString().slice(0, 10)}.csv`;
    }

    let csvContent = headers.join(',') + '\n';
    rows.forEach(row => {
      const escaped = row.map(cell => {
        if (cell === null || cell === undefined) return '""';
        const str = String(cell);
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
          return `"${str.replace(/"/g, '""')}"`;
        }
        return `"${str}"`;
      });
      csvContent += escaped.join(',') + '\n';
    });

    // UTF-8 BOM for Microsoft Excel Bengali compatibility
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setDownloadedFormat(type);
    setTimeout(() => setDownloadedFormat(null), 2000);
  };

  const exportJSON = () => {
    const jsonStr = JSON.stringify(targetList, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `user_database_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setDownloadedFormat('json');
    setTimeout(() => setDownloadedFormat(null), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 dark:bg-black/70 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-lg w-full p-5 sm:p-6 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-400 flex items-center justify-center">
              <Download className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">এক্সপোর্ট ও রিপোর্ট জেনারেটর</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">CSV, JSON ও প্রিন্ট ফরম্যাটে ডাউনলোড করুন</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scope Selector */}
        <div className="mb-4 bg-slate-50 dark:bg-slate-800/80 p-3 rounded-2xl border border-slate-200/80 dark:border-slate-700">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
            এক্সপোর্ট করার আওতা নির্বাচন করুন:
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setExportScope('filtered')}
              className={`py-2 px-3 rounded-xl text-xs font-semibold text-center border transition-all cursor-pointer ${
                exportScope === 'filtered'
                  ? 'bg-teal-600 text-white border-teal-600 shadow-xs'
                  : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-600'
              }`}
            >
              বর্তমান ফিল্টার ({toBengaliNumber(filteredUsers.length)} জন)
            </button>
            <button
              onClick={() => setExportScope('all')}
              className={`py-2 px-3 rounded-xl text-xs font-semibold text-center border transition-all cursor-pointer ${
                exportScope === 'all'
                  ? 'bg-teal-600 text-white border-teal-600 shadow-xs'
                  : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-600'
              }`}
            >
              সম্পূর্ণ ডাটাবেস ({toBengaliNumber(users.length)} জন)
            </button>
          </div>
        </div>

        {/* Action Buttons Grid */}
        <div className="space-y-2.5 mb-5">
          {/* Complete Merged CSV */}
          <button
            onClick={() => exportCSV('merged')}
            className="w-full flex items-center justify-between p-3.5 rounded-2xl border border-teal-200 dark:border-teal-800 bg-teal-50/50 dark:bg-teal-950/30 hover:bg-teal-50 dark:hover:bg-teal-950/60 text-slate-800 dark:text-slate-200 transition-all text-left group cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-teal-800 dark:group-hover:text-teal-300">
                  মার্জড এক্সেল / CSV ফাইল
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  বাংলা ও ইংরেজি উভয় কলামসহ সম্পূর্ণ একত্রিত ডাটাবেস
                </p>
              </div>
            </div>
            {downloadedFormat === 'merged' ? (
              <Check className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <Download className="w-4 h-4 text-slate-400 group-hover:text-teal-700 dark:group-hover:text-teal-300" />
            )}
          </button>

          {/* Bangla CSV */}
          <button
            onClick={() => exportCSV('bangla')}
            className="w-full flex items-center justify-between p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-800 dark:text-slate-200 transition-all text-left group cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-sky-600 text-white flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-sky-800 dark:group-hover:text-sky-300">
                  শুধুমাত্র বাংলা শিট CSV
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  বাংলা ফরম্যাটে গ্রাহকের নাম, NID ও ঠিকানা
                </p>
              </div>
            </div>
            {downloadedFormat === 'bangla' ? (
              <Check className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <Download className="w-4 h-4 text-slate-400 group-hover:text-sky-700 dark:group-hover:text-sky-300" />
            )}
          </button>

          {/* English CSV */}
          <button
            onClick={() => exportCSV('english')}
            className="w-full flex items-center justify-between p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-800 dark:text-slate-200 transition-all text-left group cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-amber-800 dark:group-hover:text-amber-300">
                  English Sheet CSV Only
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  With Customer ID, SN & English attributes
                </p>
              </div>
            </div>
            {downloadedFormat === 'english' ? (
              <Check className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <Download className="w-4 h-4 text-slate-400 group-hover:text-amber-700 dark:group-hover:text-amber-300" />
            )}
          </button>

          {/* JSON & Print Grid */}
          <div className="grid grid-cols-2 gap-2.5 pt-1">
            <button
              onClick={exportJSON}
              className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
            >
              <FileCode className="w-4 h-4 text-slate-500 dark:text-slate-400" />
              <span>JSON ডেটা</span>
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4 text-slate-500 dark:text-slate-400" />
              <span>প্রিন্ট রিপোর্ট</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-3 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
          >
            বন্ধ করুন
          </button>
        </div>

      </div>
    </div>
  );
};
