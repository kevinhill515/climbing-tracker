import Sheet from './Sheet.jsx';
import { useStore } from '../store.jsx';
import { getExercise } from '../data/exercises.js';
import { useEffect, useState } from 'react';

// Checklist sheet for prep routines (joint-prep, hip-mobility). Each
// item in `ex.checklist` renders as a tap-to-toggle row — no set/rep
// form. Closing the sheet with any items ticked logs a single entry
// so the session card ticks the step complete.
export default function PrepSheet({ open, onClose, exerciseId, sessionType }) {
  const { actions } = useStore();
  const [ticked, setTicked] = useState({});

  // Reset local ticks whenever the sheet opens for a different exercise
  useEffect(() => {
    if (open) setTicked({});
  }, [open, exerciseId]);

  if (!open || !exerciseId) return null;
  const ex = getExercise(exerciseId);
  if (!ex.checklist) return null;

  const items = ex.checklist;
  const tickedCount = Object.values(ticked).filter(Boolean).length;
  const allTicked = tickedCount === items.length;

  const handleClose = () => {
    // If the user ticked anything, log a single entry so the session
    // card ticks off the step. No log if they closed without touching.
    if (tickedCount > 0) {
      actions.addLog({
        exerciseId,
        sessionType: sessionType || null,
        sets: tickedCount,
        notes: `Prep checklist · ${tickedCount}/${items.length} items`,
      });
    }
    onClose();
  };

  return (
    <Sheet open={open} onClose={handleClose} title={ex.name} fullHeight>
      <div className="px-5 py-4 space-y-4">
        {ex.cue && (
          <p className="text-sm text-zinc-300 leading-relaxed">{ex.cue}</p>
        )}
        {ex.why && (
          <div className="text-xs bg-violet-500/10 border border-violet-500/20 text-violet-200 rounded-lg px-3 py-2 leading-relaxed">
            <strong>Why: </strong>{ex.why}
          </div>
        )}

        <div className="text-xs uppercase tracking-wide text-zinc-500">
          Tap each as you do it
        </div>

        <ul className="space-y-2">
          {items.map((it, i) => {
            const isOn = !!ticked[i];
            return (
              <li key={i}>
                <button
                  onClick={() => setTicked((s) => ({ ...s, [i]: !s[i] }))}
                  className={`w-full text-left rounded-xl border p-3 transition ${
                    isOn
                      ? 'bg-orange-500/15 border-orange-500/40'
                      : 'bg-zinc-800/60 border-zinc-700'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className={`mt-0.5 w-6 h-6 rounded-md border-2 flex items-center justify-center text-xs flex-shrink-0 ${
                      isOn ? 'bg-orange-500 border-orange-500 text-zinc-950' : 'border-zinc-600'
                    }`}>
                      {isOn ? '✓' : ''}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline justify-between gap-2">
                        <div className={`text-sm font-medium ${isOn ? 'text-orange-100' : 'text-zinc-100'}`}>{it.name}</div>
                        {it.dose && (
                          <div className="text-[11px] text-zinc-400 flex-shrink-0">{it.dose}</div>
                        )}
                      </div>
                      {it.detail && (
                        <div className="text-[11px] text-zinc-400 mt-1 leading-relaxed">{it.detail}</div>
                      )}
                    </div>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>

        <button
          onClick={handleClose}
          className={`w-full font-bold rounded-2xl py-4 text-lg transition ${
            tickedCount > 0
              ? 'bg-orange-500 hover:bg-orange-400 text-zinc-950'
              : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200'
          }`}
        >
          {allTicked ? 'All done — close' : tickedCount > 0 ? `Done · ${tickedCount}/${items.length} ticked` : 'Close (nothing logged)'}
        </button>
      </div>
    </Sheet>
  );
}
