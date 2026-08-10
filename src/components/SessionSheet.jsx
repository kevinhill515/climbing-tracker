import Sheet from './Sheet.jsx';
import ExerciseSheet from './ExerciseSheet.jsx';
import PrepSheet from './PrepSheet.jsx';
import ClimbLogSheet from './ClimbLogSheet.jsx';
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
  const [exerciseOpen, setExerciseOpen] = useState(null);   // { id, prescription } — strength/accessory
  const [prepOpen, setPrepOpen] = useState(null);           // exerciseId — prep checklist
  const [climbOpen, setClimbOpen] = useState(null);         // { id, prescription } — on-wall attempt

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
              const kind = ex.on_wall ? 'wall' : ex.checklist ? 'prep' : 'off';
              const badgeStyle =
                kind === 'wall' ? 'bg-orange-500/25 text-orange-200' :
                kind === 'prep' ? 'bg-violet-500/25 text-violet-200' :
                'bg-zinc-700 text-zinc-300';
              return (
                <button
                  key={i}
                  onClick={() => {
                    if (ex.checklist) {
                      setPrepOpen({ id: step.ex });
                    } else if (ex.on_wall) {
                      setClimbOpen({ id: step.ex, prescription: step.dose });
                    } else {
                      setExerciseOpen({ id: step.ex, prescription: step.dose });
                    }
                  }}
                  className={`w-full text-left bg-zinc-800/50 hover:bg-zinc-800 border rounded-xl p-3 transition active:scale-[0.99] ${count > 0 ? 'border-orange-500/40' : 'border-zinc-800'}`}
                >
                  <div className="flex items-start gap-3">
                    <span className={`mt-0.5 inline-flex w-6 h-6 rounded-full ${badgeStyle} text-[11px] items-center justify-center flex-shrink-0 font-bold`}>
                      {i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-medium text-zinc-100">{ex.name}</span>
                        {kind === 'wall' && (
                          <span className="text-[9px] uppercase tracking-wider bg-orange-500/20 text-orange-300 px-1.5 py-0.5 rounded">
                            On wall
                          </span>
                        )}
                        {kind === 'prep' && (
                          <span className="text-[9px] uppercase tracking-wider bg-violet-500/20 text-violet-300 px-1.5 py-0.5 rounded">
                            Prep
                          </span>
                        )}
                      </div>
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
        defaultStyle={sessionType === 'Session 3' ? 'boulder' : 'toprope'}
        onClose={() => setClimbOpen(null)}
      />
    </>
  );
}

// tiny helper (kept for future — currently the id is just the ex.id we
// already have, but this makes the intent obvious in the callers)
function getIdForCurrentStep(_session, _ex) { return null; }
