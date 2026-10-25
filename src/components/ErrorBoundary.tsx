import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in React tree:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xl text-center">
            <div className="w-14 h-14 bg-red-100 dark:bg-red-950/50 rounded-2xl flex items-center justify-center text-red-600 dark:text-red-400 mx-auto mb-4">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
              অ্যাপ্লিকেশনে ত্রুটি ঘটেছে
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
              {this.state.error?.message || 'একটি অপ্রত্যাশিত সমস্যা দেখা দিয়েছে।'}
            </p>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => {
                  try {
                    localStorage.clear();
                  } catch (e) {}
                  window.location.reload();
                }}
                className="w-full inline-flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-medium py-2.5 px-4 rounded-xl transition-colors cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                ক্যাশ মুছে রিলোড করুন
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
