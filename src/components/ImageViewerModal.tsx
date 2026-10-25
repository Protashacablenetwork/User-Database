import React, { useEffect } from 'react';
import { X, Download, ZoomIn, ZoomOut, ExternalLink } from 'lucide-react';

interface ImageViewerModalProps {
  imageUrl: string | null;
  onClose: () => void;
}

export const ImageViewerModal: React.FC<ImageViewerModalProps> = ({
  imageUrl,
  onClose
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (imageUrl) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'auto';
    };
  }, [imageUrl, onClose]);

  if (!imageUrl) return null;

  // Convert w200-h200 thumbnail to HD w1200-h1200 if it is a drive thumbnail
  let fullImageUrl = imageUrl;
  if (fullImageUrl.includes('drive.google.com/thumbnail')) {
    fullImageUrl = fullImageUrl.replace(/sz=w\d+-h\d+/, 'sz=w1200-h1200');
  }

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      {/* Top Floating Control Bar */}
      <div 
        className="fixed top-4 right-4 z-50 flex items-center gap-2 bg-slate-900/80 p-2 rounded-2xl border border-slate-700 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <a
          href={fullImageUrl}
          target="_blank"
          rel="noreferrer"
          download="user_photo.jpg"
          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white transition-colors"
          title="নতুন ট্যাবে খুলুন / ডাউনলোড"
        >
          <ExternalLink className="w-5 h-5" />
        </a>
        <button
          onClick={onClose}
          className="p-2 rounded-xl bg-rose-600/80 hover:bg-rose-600 text-white transition-colors"
          title="বন্ধ করুন (Esc)"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Main Image */}
      <div 
        className="max-w-4xl max-h-[85vh] flex items-center justify-center p-2"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={fullImageUrl}
          alt="ব্যবহারকারীর ছবি"
          referrerPolicy="no-referrer"
          className="max-w-full max-h-[82vh] object-contain rounded-2xl shadow-2xl border border-slate-800"
          onError={(e) => {
            // If HD fails fallback to original
            (e.target as HTMLImageElement).src = imageUrl;
          }}
        />
      </div>
    </div>
  );
};
