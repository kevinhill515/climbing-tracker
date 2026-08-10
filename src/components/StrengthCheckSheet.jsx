import Sheet from './Sheet.jsx';
import { getExercise } from '../data/exercises.js';
import { useStore } from '../store.jsx';
import { today } from '../utils/dates.js';
import { useMemo } from 'react';

// Check-only sheet for off-the-wall exercises (pull-up negatives, grip
// engagement, push-ups, ext rotation, wrist ext, squats, core, etc.).
// Renders the how-to + why, but the log itself is a single-tap check —
// no sets/reps/hold form. User can undo if tapped by mistake.
export default function StrengthCheckSheet({ open, onClose, exerciseId, sessionType }) {
  const { data, actions } = useStore();

  const todayStr = today();
  // Look up whether this exercise has already been checked today for this session
  const existingLog = useMemo(() => {
    if (!exerciseId) return null;
    return (data?.logs || []).find((l) =>
      l.exerciseId === exerciseId &&
      l.date === todayStr &&
      (l.sessionType === sessionType || (!l.sessionType && !sessionType))
    );
  }, [data?.logs, todayStr, sessionType, exerciseId]);

  if (!open || !exerciseId) return null;
  const ex = getExercise(exerciseId);

  const markDone = () => {
    actions.addLog({
      exerciseId,
      sessionType: sessionType || null,
      sets: 1,
      notes: 'Done',
    });
    onClose();
  };

  const undoDone = () => {
    if (existingLog) actions.removeLog(existingLog.id);
    onClose();
  };

  const isDone = !!existingLog;

  return (
    <Sheet open={open} onClose={onClose} title={ex.name}>
      <div className="px-5 py-4 space-y-5">
        {ex.cue && (
          <div>
            <div className="text-xs uppercase tracking-wide text-zinc-500 mb-1">How-to</div>
            <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-line">{ex.cue}</p>
          </div>
        )}

        {ex.why && (
          <div>
            <div className="text-xs uppercase tracking-wide text-zinc-500 mb-1">Why</div>
            <p className="text-xs text-zinc-400 italic leading-relaxed">{ex.why}</p>
          </div>
        )}

        {isDone ? (
          <div className="space-y-2">
            <div className="bg-orange-500/15 border border-orange-500/40 rounded-2xl px-4 py-3 text-center text-orange-200 font-medium">
              ✓ Marked done today
            </div>
            <button
              onClick={undoDone}
              className="w-full text-xs text-zinc-500 hover:text-rose-400 py-1"
            >Undo · remove from today's log</button>
          </div>
        ) : (
          <button
            onClick={markDone}
            className="w-full bg-orange-500 hover:bg-orange-400 text-zinc-950 font-bold rounded-2xl py-4 text-lg"
          >
            ✓ Mark done
          </button>
        )}
      </div>
    </Sheet>
  );
}
