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
      <div className={`relative mt-auto bg-zinc-900 rounded-t-3xl border-t border-zinc-800 sheet-enter flex flex-col ${fullHeight ? 'h-[92vh]' : 'max-h-[92vh]'}`}>
        <div className="flex items-center justify-between px-5 pt-4 pb-2 border-b border-zinc-800">
          <h2 className="text-lg font-bold text-zinc-100">{title}</h2>
          <button onClick={onClose} className="w-9 h-9 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 flex items-center justify-center" aria-label="Close">×</button>
        </div>
        <div className="flex-1 overflow-y-auto overscroll-contain pb-8">{children}</div>
      </div>
    </div>
  );
}
