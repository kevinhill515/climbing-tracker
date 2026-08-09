import { fmtDate } from '../utils/dates.js';

// 28-day activity heatmap — Sat-Fri columns. Cell shading counts:
//   - sessions logged
//   - grade attempts logged
// Total count = session activity indicator for that date. Tap a past
// cell to drill into DayDetail.
export default function ActivityHeatmap({ sessions, attempts, onPickDate }) {
  const today = new Date();
  const days = [];
  // Most recent Monday (so columns line up with the Mon–Sun week)
  const todayDay = today.getDay();
  const daysBackToMon = (todayDay - 1 + 7) % 7;
  const startMon = new Date(today);
  startMon.setDate(today.getDate() - daysBackToMon - 21);

  for (let i = 0; i < 28; i++) {
    const d = new Date(startMon);
    d.setDate(startMon.getDate() + i);
    const ds = fmtDate(d);
    const sessCount   = sessions.filter((s) => s.date === ds).length;
    const attCount    = attempts.filter((a) => a.date === ds).length;
    const total       = sessCount + attCount;
    const isFuture = d > today;
    days.push({ date: ds, count: total, isFuture, isToday: ds === fmtDate(today) });
  }

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3 mb-3">
      <div className="flex items-center justify-between mb-2">
        <div className="text-[11px] uppercase tracking-wide text-zinc-500">Activity · last 4 weeks</div>
        <div className="flex items-center gap-1.5 text-[10px] text-zinc-500">
          <span>less</span>
          <div className="w-2 h-2 rounded-sm bg-zinc-800" />
          <div className="w-2 h-2 rounded-sm bg-orange-900" />
          <div className="w-2 h-2 rounded-sm bg-orange-700" />
          <div className="w-2 h-2 rounded-sm bg-orange-400" />
          <span>more</span>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-1.5">
        <DayLabel d="M" /><DayLabel d="T" /><DayLabel d="W" /><DayLabel d="T" />
        <DayLabel d="F" /><DayLabel d="S" /><DayLabel d="S" />
        {days.map((d) => (
          <button
            key={d.date}
            disabled={d.isFuture}
            onClick={() => !d.isFuture && onPickDate && onPickDate(d.date)}
            title={`${d.date} — ${d.count} entr${d.count === 1 ? 'y' : 'ies'}`}
            className={`aspect-square rounded ${cellColor(d)} ${d.isToday ? 'ring-1 ring-orange-300' : ''} ${d.isFuture ? '' : 'hover:ring-1 hover:ring-zinc-500 active:scale-95'}`}
          />
        ))}
      </div>
    </div>
  );
}

function DayLabel({ d }) {
  return <div className="text-[9px] text-zinc-600 text-center">{d}</div>;
}

function cellColor({ count, isFuture }) {
  if (isFuture)    return 'bg-zinc-900 border border-zinc-800';
  if (count === 0) return 'bg-zinc-800';
  if (count < 3)   return 'bg-orange-900';
  if (count < 6)   return 'bg-orange-700';
  return 'bg-orange-400';
}
