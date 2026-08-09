import { useStore } from '../store.jsx';
import { useState } from 'react';
import DayDetailSheet from './DayDetailSheet.jsx';

// History tab — chronological session list. Tapping opens the day
// detail sheet for that date.
export default function HistoryView() {
  const { data } = useStore();
  const [pickedDate, setPickedDate] = useState(null);

  if (!data) return null;

  // Aggregate all "activity" dates (logs, sessions, grade attempts,
  // health check-ins) and show them newest first with counts.
  const days = aggregateActivity(data);

  return (
    <div className="px-4 pt-3 pb-24 max-w-xl mx-auto fade-in">
      <h1 className="text-xl font-bold text-zinc-100 mb-1">History</h1>
      <p className="text-xs text-zinc-500 mb-4">
        Every day with logged activity. Tap to see the full detail.
      </p>

      {days.length === 0 ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl px-4 py-8 text-center text-sm text-zinc-400">
          Nothing logged yet. Complete a session on the Week tab to get started.
        </div>
      ) : (
        <ul className="space-y-2">
          {days.map((d) => (
            <li key={d.date}>
              <button
                onClick={() => setPickedDate(d.date)}
                className="w-full text-left bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-2xl px-4 py-3"
              >
                <div className="flex items-baseline justify-between">
                  <div className="text-sm font-medium text-zinc-100">{fmtDate(d.date)}</div>
                  <div className="text-[11px] text-zinc-500">{d.date}</div>
                </div>
                <div className="mt-1 text-xs text-zinc-400 flex flex-wrap gap-x-3 gap-y-0.5">
                  {d.logs > 0 && <span>{d.logs} exercise log{d.logs === 1 ? '' : 's'}</span>}
                  {d.attempts > 0 && <span>{d.attempts} grade attempt{d.attempts === 1 ? '' : 's'}</span>}
                  {d.flashes > 0 && <span className="text-emerald-400">⚡ {d.flashes} flash{d.flashes === 1 ? '' : 'es'}</span>}
                  {d.hasHealthCheck && <span className="text-emerald-500">♡ health check</span>}
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}

      <DayDetailSheet
        open={!!pickedDate}
        date={pickedDate}
        onClose={() => setPickedDate(null)}
      />
    </div>
  );
}

function aggregateActivity(data) {
  const map = {};
  for (const l of data.logs || []) {
    if (!map[l.date]) map[l.date] = init();
    map[l.date].logs++;
  }
  for (const a of (data.grades?.boulder?.attempts || []).concat(data.grades?.toprope?.attempts || [])) {
    if (!map[a.date]) map[a.date] = init();
    map[a.date].attempts++;
    if (a.flash && a.sent) map[a.date].flashes++;
  }
  for (const h of data.fingerHealth || []) {
    if (!map[h.date]) map[h.date] = init();
    map[h.date].hasHealthCheck = true;
  }
  return Object.entries(map)
    .map(([date, v]) => ({ date, ...v }))
    .sort((a, b) => b.date.localeCompare(a.date));
}

function init() { return { logs: 0, attempts: 0, flashes: 0, hasHealthCheck: false }; }

function fmtDate(d) {
  const [y, m, day] = d.split('-').map(Number);
  return new Date(y, m - 1, day, 12).toLocaleDateString(undefined, {
    weekday: 'short', month: 'short', day: 'numeric',
  });
}
