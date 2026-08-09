import Sheet from './Sheet.jsx';
import ExerciseSheet from './ExerciseSheet.jsx';
import AntagonistSheet from './AntagonistSheet.jsx';
import { getExercise } from '../data/exercises.js';
import { SESSION_META, ANTAGONIST_ITEMS } from '../data/program.js';
import { useStore } from '../store.jsx';
import { weekId, today } from '../utils/dates.js';
import { useMemo, useState } from 'react';

const TODAY = today;

// The main session flow. Lists the phase's session steps in order,
// each with a tap-to-log ExerciseSheet. Also carries antagonist as a
// separate collapsible section on Sessions 1 and 3.
export default function SessionSheet({ open, onClose, sessionType, phase }) {
  const { actions, data } = useStore();
  const [exerciseOpen, setExerciseOpen] = useState(null);   // { id, prescription }
  const [antagOpen, setAntagOpen] = useState(false);

  // ⚠ All hooks must run every render. Compute these unconditionally,
  // THEN early-return. Otherwise the sheet crashes to a black screen the
  // first time it's opened (hook count changes between renders).
  const todayStr = TODAY();
  const todayCounts = useMemo(() => {
    const m = {};
    for (const l of data?.logs || []) {
      if (l.date !== todayStr) continue;
      if (l.sessionType && l.sessionType !== sessionType) continue;
      m[l.exerciseId] = (m[l.exerciseId] || 0) + 1;
    }
    return m;
  }, [data?.logs, todayStr, sessionType]);

  const antagCountToday = useMemo(() => {
    return ANTAGONIST_ITEMS.filter((it) => (todayCounts[it.ex] || 0) > 0).length;
  }, [todayCounts]);

  if (!sessionType || !phase) return null;
  const session = phase.sessions[sessionType];
  if (!session) return null;

  const wid = weekId();
  const isDone = !!data?.weeks?.[wid]?.[sessionType];
  const meta = SESSION_META[sessionType];

  return (
    <>
      <Sheet open={open} onClose={onClose} title={`${sessionType} — Phase ${phase.id}`} fullHeight>
        <div className="px-5 py-4 space-y-4">
          {isDone && (
            <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl px-3 py-2 text-sm text-orange-300 flex items-start gap-2">
              <span className="text-orange-400 leading-none">✓</span>
              <span>
                <span className="font-medium">Session complete.</span>{' '}
                Log more anytime — it stays marked done.
              </span>
            </div>
          )}

          <div>
            <div className="text-xs uppercase tracking-wide text-zinc-500">Focus</div>
            <p className="text-sm text-zinc-300 mt-1">{meta.focus}</p>
            <div className="text-[11px] text-zinc-500 mt-0.5">{meta.time}</div>
          </div>

          <div className="space-y-2">
            {session.steps.map((step, i) => {
              const ex = getExercise(step.ex);
              const count = todayCounts[step.ex] || 0;
              return (
                <button
                  key={i}
                  onClick={() => setExerciseOpen({ id: step.ex, prescription: step.dose })}
                  className={`w-full text-left bg-zinc-800/50 hover:bg-zinc-800 border rounded-xl p-3 transition active:scale-[0.99] ${count > 0 ? 'border-orange-500/40' : 'border-zinc-800'}`}
                >
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 inline-flex w-6 h-6 rounded-full bg-zinc-700 text-zinc-300 text-[11px] items-center justify-center flex-shrink-0 font-bold">
                      {i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-zinc-100 truncate">{ex.name}</div>
                      <div className="text-xs text-zinc-400 mt-0.5">{step.dose}</div>
                    </div>
                    {count > 0 ? (
                      <span className="flex items-center gap-1 text-xs text-orange-300 bg-orange-500/15 border border-orange-500/30 rounded-full px-2 py-0.5 flex-shrink-0">
                        <span className="text-orange-400">✓</span>
                        <span className="tabular-nums">{count}×</span>
                      </span>
                    ) : (
                      <span className="text-zinc-500">›</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Antagonist training — separate module attached to Sessions 1 and 3 */}
          {session.antagonist && (
            <button
              onClick={() => setAntagOpen(true)}
              className={`w-full text-left bg-zinc-800/50 hover:bg-zinc-800 border-2 border-dashed rounded-xl p-3 transition ${antagCountToday >= ANTAGONIST_ITEMS.length ? 'border-orange-500/40' : 'border-zinc-700'}`}
            >
              <div className="flex items-start gap-3">
                <span className="mt-0.5 inline-flex w-6 h-6 rounded-full bg-violet-500/20 text-violet-300 text-[11px] items-center justify-center flex-shrink-0">
                  ⊥
                </span>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-zinc-100">Antagonist training</div>
                  <div className="text-xs text-zinc-400 mt-0.5">
                    Push-ups, external rotation, wrist ext + reverse wrist curl · 2×/week
                  </div>
                </div>
                {antagCountToday > 0 && (
                  <span className="text-xs text-orange-300 bg-orange-500/15 border border-orange-500/30 rounded-full px-2 py-0.5 flex-shrink-0">
                    ✓ {antagCountToday}/{ANTAGONIST_ITEMS.length}
                  </span>
                )}
              </div>
            </button>
          )}

          {/* Bottom action */}
          {!isDone ? (
            <button
              onClick={() => { actions.toggleSession(wid, sessionType); onClose(); }}
              className="w-full font-bold rounded-2xl py-4 text-lg bg-orange-500 hover:bg-orange-400 text-zinc-950 transition"
            >
              Mark session complete
            </button>
          ) : (
            <div className="space-y-2">
              <button onClick={onClose} className="w-full font-bold rounded-2xl py-4 text-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-100 transition">Done</button>
              <button onClick={() => actions.toggleSession(wid, sessionType)} className="w-full text-xs text-zinc-500 hover:text-rose-400 py-1">Undo complete</button>
            </div>
          )}
        </div>
      </Sheet>

      <ExerciseSheet
        open={!!exerciseOpen}
        exerciseId={exerciseOpen?.id}
        prescription={exerciseOpen?.prescription}
        sessionType={sessionType}
        onClose={() => setExerciseOpen(null)}
      />

      <AntagonistSheet
        open={antagOpen}
        onClose={() => setAntagOpen(false)}
        sessionType={sessionType}
      />
    </>
  );
}
