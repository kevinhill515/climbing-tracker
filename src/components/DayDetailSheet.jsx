import Sheet from './Sheet.jsx';
import { useStore } from '../store.jsx';
import { getExercise } from '../data/exercises.js';
import { parseDate, weekId } from '../utils/dates.js';
import { SESSION_TYPES, SESSION_META } from '../data/program.js';

// Read-only view of everything logged on a single date. Tapping a
// heatmap cell opens this sheet.
export default function DayDetailSheet({ open, date, onClose }) {
  const { data, actions } = useStore();
  if (!open || !date) return null;

  const wid = weekId(parseDate(date));
  const weekFlags = data?.weeks?.[wid] || {};

  const dayLogs = (data?.logs || []).filter((l) => l.date === date);
  const dayAttempts = [
    ...((data.grades?.boulder?.attempts || []).map((a) => ({ ...a, style: 'boulder' }))),
    ...((data.grades?.toprope?.attempts || []).map((a) => ({ ...a, style: 'toprope' }))),
  ].filter((a) => a.date === date);
  const dayHealth = (data?.fingerHealth || []).filter((h) => h.date === date);

  const byType = groupBySessionType(dayLogs);
  const totalCount = dayLogs.length + dayAttempts.length + dayHealth.length;

  return (
    <Sheet open={open} onClose={onClose} title={fmtPretty(date)} fullHeight>
      <div className="px-5 py-4 space-y-4">
        {totalCount === 0 ? (
          <div className="text-sm text-zinc-400 bg-zinc-900 border border-zinc-800 rounded-2xl px-4 py-8 text-center">
            Nothing logged on this day.
          </div>
        ) : (
          <>
            <div className="text-xs text-zinc-500">
              {dayLogs.length} log{dayLogs.length === 1 ? '' : 's'} · {dayAttempts.length} grade attempt{dayAttempts.length === 1 ? '' : 's'} · {dayHealth.length} check-in{dayHealth.length === 1 ? '' : 's'}
            </div>

            {/* Finger health check-ins for this day */}
            {dayHealth.map((h) => (
              <div key={h.id} className={`rounded-xl px-3 py-2 text-xs ${h.soreness ? 'bg-amber-500/10 border border-amber-500/30 text-amber-200' : 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-200'}`}>
                <div className="font-medium">Finger check-in</div>
                {h.soreness
                  ? <div className="mt-0.5">Soreness: {h.soreness.finger} · {h.soreness.area} · level {h.soreness.level}/5</div>
                  : <div className="mt-0.5">Clean — no soreness reported</div>}
                {h.notes && <div className="mt-0.5 text-zinc-400">"{h.notes}"</div>}
              </div>
            ))}

            {/* Grade attempts */}
            {dayAttempts.length > 0 && (
              <div>
                <div className="text-[11px] uppercase tracking-wide text-zinc-400 mb-1.5">Grade attempts</div>
                <ul className="bg-zinc-900 border border-zinc-800 rounded-2xl divide-y divide-zinc-800">
                  {dayAttempts.map((a) => (
                    <li key={a.id} className="px-4 py-3 flex items-center justify-between text-sm">
                      <div>
                        <span className="font-medium text-zinc-100">{a.grade}</span>
                        <span className="text-zinc-500 text-xs ml-2">{a.style === 'boulder' ? 'boulder' : 'top rope'}</span>
                      </div>
                      <div className="text-right text-xs">
                        {a.sent
                          ? <span className={`font-bold ${a.flash ? 'text-emerald-400' : 'text-orange-300'}`}>{a.flash ? '⚡ FLASH' : `✓ complete · ${a.attempts || 1} tries`}</span>
                          : <span className="text-zinc-400">✗ fail · {a.attempts || 1} tries</span>
                        }
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Session-grouped workout logs */}
            {SESSION_TYPES.concat(['Other']).map((type) => {
              const group = byType[type];
              if (!group || group.length === 0) return null;
              const isComplete = type !== 'Other' && !!weekFlags[type];
              return (
                <SessionGroup
                  key={type}
                  type={type}
                  logs={group}
                  isComplete={isComplete}
                  onToggle={type !== 'Other' ? () => actions.toggleSession(wid, type) : null}
                />
              );
            })}
          </>
        )}
      </div>
    </Sheet>
  );
}

function SessionGroup({ type, logs, isComplete, onToggle }) {
  const byExercise = {};
  for (const l of logs) (byExercise[l.exerciseId] ||= []).push(l);
  const exerciseCount = Object.keys(byExercise).length;

  return (
    <div>
      <div className="flex items-baseline justify-between mb-1.5">
        <div className="text-[11px] uppercase tracking-wide text-zinc-400">{SESSION_META[type]?.name || type}</div>
        <div className="text-[10px] text-zinc-600">
          {logs.length} log{logs.length === 1 ? '' : 's'} · {exerciseCount} exercise{exerciseCount === 1 ? '' : 's'}
        </div>
      </div>

      {onToggle && (
        <button
          onClick={onToggle}
          className={`w-full text-left text-xs rounded-xl px-3 py-2 mb-2 transition border ${
            isComplete
              ? 'bg-orange-500/15 border-orange-500/40 text-orange-300'
              : 'bg-zinc-800/60 border-dashed border-zinc-600 text-zinc-300'
          }`}
        >
          {isComplete
            ? `✓ ${SESSION_META[type]?.name || type} marked complete for this week · tap to undo`
            : `Mark this week's ${SESSION_META[type]?.name || type} complete →`}
        </button>
      )}

      <ul className="bg-zinc-900 border border-zinc-800 rounded-2xl divide-y divide-zinc-800">
        {Object.entries(byExercise).map(([exId, entries]) => {
          const ex = getExercise(exId);
          return (
            <li key={exId} className="px-4 py-3">
              <div className="text-sm font-medium text-zinc-100">{ex.name}</div>
              <ul className="mt-1 space-y-0.5">
                {entries.map((e) => (
                  <li key={e.id} className="text-xs text-zinc-400 flex items-center gap-2">
                    <span className="text-zinc-300">{summarize(e)}</span>
                    {e.notes && <span className="text-zinc-500 truncate">· {e.notes}</span>}
                  </li>
                ))}
              </ul>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function summarize(l) {
  return [
    l.sets && `${l.sets}×`,
    l.reps && `${l.reps} reps`,
    l.hold && `${l.hold}s`,
    l.load && `+${l.load}lb`,
  ].filter(Boolean).join(' · ') || '—';
}

function groupBySessionType(logs) {
  const out = {};
  for (const l of logs) {
    const k = l.sessionType || 'Other';
    (out[k] ||= []).push(l);
  }
  return out;
}

function fmtPretty(d) {
  const dt = parseDate(d);
  return dt.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
}
