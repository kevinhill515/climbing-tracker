import { useStore } from '../store.jsx';
import { useState, useMemo } from 'react';
import FingerHealthCheckIn from './FingerHealthCheckIn.jsx';

// Finger-health log. Shows recent check-ins, flags high-risk patterns
// (2+ consecutive 4+ soreness = rest-week alert), and lets user log a
// standalone check-in outside of a session.
export default function HealthView() {
  const { data } = useStore();
  const [logOpen, setLogOpen] = useState(false);

  const checks = (data?.fingerHealth || []).slice().reverse(); // newest first

  const restFlag = useMemo(() => {
    const recent = checks.slice(0, 4);
    let streak = 0;
    for (const c of recent) {
      if (c.soreness && c.soreness.level >= 4) streak++;
      else break;
    }
    return streak >= 2;
  }, [checks]);

  return (
    <div className="px-4 pt-3 pb-24 max-w-xl mx-auto fade-in">
      <div className="flex items-center justify-between mb-3">
        <h1 className="text-xl font-bold text-zinc-100">Finger health</h1>
        <button
          onClick={() => setLogOpen(true)}
          className="bg-orange-500 hover:bg-orange-400 text-zinc-950 font-bold rounded-xl px-4 py-2 text-sm"
        >
          + Log check-in
        </button>
      </div>

      {restFlag && (
        <div className="bg-rose-500/10 border border-rose-500/30 rounded-2xl px-4 py-3 mb-4 text-rose-200 text-sm leading-relaxed">
          <div className="font-bold mb-1">⚠ Rest week flag</div>
          Two consecutive sessions with soreness at 4/5 or higher. Take at least 5 days completely off climbing. Continue antagonist training and stretching only.
        </div>
      )}

      <p className="text-xs text-zinc-500 mb-3 leading-relaxed">
        A quick check-in before each session takes 5 seconds and might save your climbing career. Log any pulley soreness by area — A2 is the base of the finger, A4 is the middle — so patterns become visible over time.
      </p>

      {checks.length === 0 ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl px-4 py-8 text-center text-sm text-zinc-400">
          No check-ins yet. Log your first before your next session.
        </div>
      ) : (
        <ul className="space-y-2">
          {checks.map((h) => (
            <li key={h.id} className={`rounded-2xl px-4 py-3 border ${h.soreness ? colorForLevel(h.soreness.level) : 'bg-emerald-500/10 border-emerald-500/30'}`}>
              <div className="flex items-baseline justify-between">
                <div className={`text-sm font-medium ${h.soreness ? '' : 'text-emerald-200'}`}>
                  {h.soreness
                    ? `${cap(h.soreness.finger)} finger · ${h.soreness.area} · ${h.soreness.level}/5`
                    : 'Clean — no soreness'}
                </div>
                <div className="text-[11px] text-zinc-500">{h.date}</div>
              </div>
              {h.notes && (
                <div className="text-xs text-zinc-400 mt-1 italic">"{h.notes}"</div>
              )}
            </li>
          ))}
        </ul>
      )}

      <FingerHealthCheckIn
        open={logOpen}
        onClose={() => setLogOpen(false)}
        onProceed={() => setLogOpen(false)}
        sessionType={null}
      />
    </div>
  );
}

function colorForLevel(n) {
  if (n >= 4) return 'bg-rose-500/10 border-rose-500/30 text-rose-200';
  if (n === 3) return 'bg-amber-500/10 border-amber-500/30 text-amber-200';
  return 'bg-orange-500/10 border-orange-500/30 text-orange-200';
}

function cap(s) { return s ? s[0].toUpperCase() + s.slice(1) : s; }
