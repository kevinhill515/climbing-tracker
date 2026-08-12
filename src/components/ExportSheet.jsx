import Sheet from './Sheet.jsx';
import { useEffect, useMemo, useState } from 'react';
import { today, weekStartOf } from '../utils/dates.js';

// Export climbs to CSV for a chosen date range. Default range is the
// start of the current week (Monday) through today. Pulls from
// grades.toprope.attempts + grades.boulder.attempts, filters by date,
// generates CSV, triggers a file download via a blob URL.
export default function ExportSheet({ open, onClose, data }) {
  const [from, setFrom] = useState('');
  const [to, setTo]     = useState('');

  useEffect(() => {
    if (open) {
      const t = today();
      const start = weekStartOf(new Date());
      const startStr = `${start.getFullYear()}-${String(start.getMonth()+1).padStart(2,'0')}-${String(start.getDate()).padStart(2,'0')}`;
      setFrom(startStr);
      setTo(t);
    }
  }, [open]);

  const preview = useMemo(() => {
    if (!open || !data) return { count: 0 };
    const all = [
      ...(data.grades?.toprope?.attempts || []).map((a) => ({ ...a, style: 'toprope' })),
      ...(data.grades?.boulder?.attempts || []).map((a) => ({ ...a, style: 'boulder' })),
    ];
    const inRange = all.filter((a) => a.date >= from && a.date <= to);
    return { count: inRange.length, all: inRange };
  }, [open, data, from, to]);

  const doExport = () => {
    const rows = preview.all || [];
    // CSV escape helper — wrap in quotes when the value contains commas,
    // newlines, or quotes; double any embedded quotes per RFC 4180.
    const esc = (v) => {
      if (v === null || v === undefined) return '';
      const s = String(v);
      if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
      return s;
    };
    const header = ['Date','Style','Grade','Result','Difficulty','Route/Problem','Notes','Drill focus','Session'];
    const lines = [header.join(',')];
    for (const a of rows.sort((x, y) => (x.date || '').localeCompare(y.date || ''))) {
      lines.push([
        a.date,
        a.style === 'toprope' ? 'TR' : 'Boulder',
        a.grade,
        a.result || (a.flash ? 'flash' : a.sent ? 'complete' : 'fail'),
        a.difficulty ?? '',
        a.routeName || '',
        a.notes || '',
        a.drillFocus || '',
        a.sessionType || '',
      ].map(esc).join(','));
    }
    const csv = lines.join('\r\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `climbs_${from}_to_${to}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (!open) return null;

  return (
    <Sheet open={open} onClose={onClose} title="Export climbs">
      <div className="px-5 py-4 space-y-4">
        <p className="text-xs text-zinc-400 leading-relaxed">
          CSV of every climb in the range, one row per attempt. Includes
          date, style, grade, result, difficulty, route name, notes,
          drill focus, and session type.
        </p>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[10px] uppercase tracking-wide text-zinc-500 mb-1 block">From</label>
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100"
            />
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-wide text-zinc-500 mb-1 block">To</label>
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100"
            />
          </div>
        </div>

        <div className="text-xs text-zinc-400 flex items-baseline justify-between">
          <span>Climbs in range</span>
          <span className="tabular-nums text-zinc-100 font-bold text-base">{preview.count}</span>
        </div>

        <button
          onClick={doExport}
          disabled={preview.count === 0}
          className="w-full bg-orange-500 hover:bg-orange-400 disabled:bg-zinc-800 disabled:text-zinc-500 text-zinc-950 font-bold rounded-xl py-3 text-sm"
        >
          {preview.count === 0 ? 'No climbs to export' : `Download CSV · ${preview.count} climb${preview.count === 1 ? '' : 's'}`}
        </button>
      </div>
    </Sheet>
  );
}
