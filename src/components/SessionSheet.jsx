import Sheet from './Sheet.jsx';
import ExerciseSheet from './ExerciseSheet.jsx';
import PrepSheet from './PrepSheet.jsx';
import ClimbLogSheet from './ClimbLogSheet.jsx';
import StrengthCheckSheet from './StrengthCheckSheet.jsx';
import { getExercise } from '../data/exercises.js';
import { SESSION_META } from '../data/program.js';
import { useStore } from '../store.jsx';
import { weekId, today } from '../utils/dates.js';
import { useMemo, useState } from 'react';

const TODAY = today;

// The main session flow — routes each step to the right sheet based on
// exercise metadata:
//   ex.checklist   → PrepSheet (tick-through, no logging fields)
//   ex.on_wall     → ClimbLogSheet (grade + result + difficulty)
//   otherwise      → ExerciseSheet (sets/reps/hold/load — strength/accessory)
//
// Visual: number badge is color-coded by type — orange for on-wall
// (the main event), violet for prep (get ready), zinc for strength.
export default function SessionSheet({ open, onClose, sessionType, phase }) {
  const { actions, data } = useStore();
  const [exerciseOpen, setExerciseOpen] = useState(null);   // fallback strength log (rare)
  const [prepOpen, setPrepOpen] = useState(null);           // exerciseId — prep checklist
  const [climbOpen, setClimbOpen] = useState(null);         // { id, prescription } — climb attempt
  const [strengthOpen, setStrengthOpen] = useState(null);   // exerciseId — off-wall check-only

  // Combined "logged today" counts — pulls both exercise logs AND grade
  // attempts (which the ClimbLogSheet writes to grades.[style].attempts).
  const todayStr = TODAY();
  const todayCounts = useMemo(() => {
    const m = {};
    // Off-wall exercise logs
    for (const l of data?.logs || []) {
      if (l.date !== todayStr) continue;
      if (l.sessionType && l.sessionType !== sessionType) continue;
      m[l.exerciseId] = (m[l.exerciseId] || 0) + 1;
    }
    // On-wall grade attempts (from ClimbLogSheet saves)
    for (const style of ['toprope', 'boulder']) {
      const attempts = data?.grades?.[style]?.attempts || [];
      for (const a of attempts) {
        if (a.date !== todayStr) continue;
        if (a.sessionType && a.sessionType !== sessionType) continue;
        if (!a.exerciseId) continue;
        m[a.exerciseId] = (m[a.exerciseId] || 0) + 1;
      }
    }
    return m;
  }, [data?.logs, data?.grades, todayStr, sessionType]);

  if (!sessionType || !phase) return null;
  const session = phase.sessions[sessionType];
  if (!session) return null;

  const wid = weekId();
  const isDone = !!data?.weeks?.[wid]?.[sessionType];
  const meta = SESSION_META[sessionType];

  const openStep = (ex, dose) => {
    if (ex.checklist) {
      setPrepOpen({ id: getIdForCurrentStep(session, ex) });
    } else if (ex.on_wall) {
      setClimbOpen({ id: getIdForCurrentStep(session, ex), prescription: dose });
    } else {
      setExerciseOpen({ id: getIdForCurrentStep(session, ex), prescription: dose });
    }
  };

  return (
    <>
      <Sheet open={open} onClose={onClose} title={`${meta?.name || sessionType} · Phase ${phase.id}`} fullHeight>
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

          {/* Steps grouped by kind: Prep / Top rope / Boulder / Off the wall */}
          {(() => {
            const buckets = { prep: [], toprope: [], boulder: [], off: [] };
            session.steps.forEach((step, i) => {
              const ex = getExercise(step.ex);
              const kind = ex.checklist ? 'prep'
                        : ex.style === 'toprope' ? 'toprope'
                        : ex.style === 'boulder' ? 'boulder'
                        : 'off';
              buckets[kind].push({ step, ex, i });
            });
            const groups = [
              { key: 'prep',    label: 'Prep',        color: 'violet',   items: buckets.prep },
              { key: 'toprope', label: 'Top rope',    color: 'sky',      items: buckets.toprope },
              { key: 'boulder', label: 'Boulder',     color: 'fuchsia',  items: buckets.boulder },
              { key: 'off',     label: 'Off the wall',color: 'zinc',     items: buckets.off  },
            ].filter((g) => g.items.length > 0);

            const dotClass = (c) =>
              c === 'sky'     ? 'bg-sky-400' :
              c === 'fuchsia' ? 'bg-fuchsia-400' :
              c === 'violet'  ? 'bg-violet-400' :
                                'bg-zinc-500';
            const headingClass = (c) =>
              c === 'sky'     ? 'text-sky-300' :
              c === 'fuchsia' ? 'text-fuchsia-300' :
              c === 'violet'  ? 'text-violet-300' :
                                'text-zinc-400';
            const badgeClass = (kind) =>
              kind === 'toprope' ? 'bg-sky-500/25 text-sky-200' :
              kind === 'boulder' ? 'bg-fuchsia-500/25 text-fuchsia-200' :
              kind === 'prep'    ? 'bg-violet-500/25 text-violet-200' :
                                   'bg-zinc-700 text-zinc-300';

            return (
              <div className="space-y-4">
                {groups.map((group) => (
                  <div key={group.key} className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className={`h-2.5 w-2.5 rounded-sm ${dotClass(group.color)}`} />
                      <div className={`text-[11px] uppercase tracking-wider font-semibold ${headingClass(group.color)}`}>
                        {group.label}
                      </div>
                      <div className="text-[10px] text-zinc-600">· {group.items.length}</div>
                    </div>
                    {group.items.map(({ step, ex, i }) => {
                      const count = todayCounts[step.ex] || 0;
                      return (
                        <button
                          key={i}
                          onClick={() => {
                            if (ex.checklist) setPrepOpen({ id: step.ex });
                            else if (ex.style === 'toprope' || ex.style === 'boulder') setClimbOpen({ id: step.ex, prescription: step.dose });
                            else if (ex.checkOnly) setStrengthOpen({ id: step.ex });
                            else setExerciseOpen({ id: step.ex, prescription: step.dose });
                          }}
                          className={`w-full text-left bg-zinc-800/50 hover:bg-zinc-800 border rounded-xl p-3 transition active:scale-[0.99] ${count > 0 ? 'border-orange-500/40' : 'border-zinc-800'}`}
                        >
                          <div className="flex items-start gap-3">
                            <span className={`mt-0.5 inline-flex w-6 h-6 rounded-full ${badgeClass(group.key)} text-[11px] items-center justify-center flex-shrink-0 font-bold`}>
                              {i + 1}
                            </span>
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-zinc-100">{ex.name}</div>
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
                ))}
              </div>
            );
          })()}

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

      <PrepSheet
        open={!!prepOpen}
        exerciseId={prepOpen?.id}
        sessionType={sessionType}
        onClose={() => setPrepOpen(null)}
      />

      <ClimbLogSheet
        open={!!climbOpen}
        exerciseId={climbOpen?.id}
        prescription={climbOpen?.prescription}
        sessionType={sessionType}
        onClose={() => setClimbOpen(null)}
      />

      <StrengthCheckSheet
        open={!!strengthOpen}
        exerciseId={strengthOpen?.id}
        sessionType={sessionType}
        onClose={() => setStrengthOpen(null)}
      />
    </>
  );
}
