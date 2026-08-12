import { useEffect } from 'react';

// Mobile bottom sheet — tap backdrop or ×  to dismiss.
export default function Sheet({ open, onClose, title, children, fullHeight = false }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col">
      <div className="absolute inset-0 bg-black/60 fade-in" onClick={onClose} />
      {/*
        dvh (dynamic viewport height) instead of vh — on mobile Safari/Chrome,
        vh includes the URL bar so 92vh can push the sheet header ABOVE the
        visible area, making the × unreachable. dvh tracks the actual visible
        area and adjusts when the browser chrome shows/hides.
        env(safe-area-inset-top) inside the header pads for the iOS notch so
        the × sits below hardware overlays.
      */}
      <div className={`relative mt-auto bg-zinc-900 rounded-t-3xl border-t border-zinc-800 sheet-enter flex flex-col ${fullHeight ? 'h-[92dvh]' : 'max-h-[92dvh]'}`}>
        <div
          className="flex items-center justify-between px-5 pb-2 border-b border-zinc-800"
          style={{ paddingTop: 'max(1rem, env(safe-area-inset-top))' }}
        >
          <h2 className="text-lg font-bold text-zinc-100 truncate pr-2">{title}</h2>
          <button
            onClick={onClose}
            className="w-11 h-11 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 flex items-center justify-center text-xl flex-shrink-0"
            aria-label="Close"
          >×</button>
        </div>
        <div className="flex-1 overflow-y-auto overscroll-contain pb-8">{children}</div>
      </div>
    </div>
  );
}
