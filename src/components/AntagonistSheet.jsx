import Sheet from './Sheet.jsx';
import ExerciseSheet from './ExerciseSheet.jsx';
import { getExercise } from '../data/exercises.js';
import { ANTAGONIST_ITEMS } from '../data/program.js';
import { useStore } from '../store.jsx';
import { today } from '../utils/dates.js';
import { useMemo, useState } from 'react';

// Antagonist module — the 4-exercise counter-strain set climbers need
// to keep from tearing their shoulder / elbow apart. Attached to
// Sessions 1 and 3 in the main SessionSheet flow.
export default function AntagonistSheet({ open, onClose, sessionType }) {
  const { data } = useStore();
  const [exerciseOpen, setExerciseOpen] = useState(null);

  const todayStr = today();
  const todayCounts = useMemo(() => {
    const m = {};
    for (const l of data?.logs || []) {
      if (l.date !== todayStr) continue;
      m[l.exerciseId] = (m[l.exerciseId] || 0) + 1;
    }
    return m;
  }, [data?.logs, todayStr]);

  return (
    <>
      <Sheet open={open} onClose={onClose} title="Antagonist training" fullHeight>
        <div className="px-5 py-4 space-y-4">
          <div className="bg-violet-500/10 border border-violet-500/20 text-violet-200 rounded-xl px-3 py-2 text-xs leading-relaxed">
            Climbers overtrain pull and neglect push, which rounds shoulders forward and sets up impingement.
            This 4-exercise set is 15 minutes and probably the single most important thing you'll do to still be climbing in 20 years.
            <br/><br/>
            <strong>Frequency:</strong> 2×/week — never on the same day as hard finger training.
            Attach to Sessions 1 and 3 (they don't heavily load fingers).
          </div>

          <ul className="space-y-2">
            {ANTAGONIST_ITEMS.map((item, i) => {
              const ex = getExercise(item.ex);
              const count = todayCounts[item.ex] || 0;
              return (
                <li key={i}>
                  <button
                    onClick={() => setExerciseOpen({ id: item.ex, prescription: item.dose })}
                    className={`w-full text-left bg-zinc-800/50 hover:bg-zinc-800 border rounded-xl p-3 transition ${count > 0 ? 'border-orange-500/40' : 'border-zinc-800'}`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="mt-0.5 inline-flex w-6 h-6 rounded-full bg-violet-500/20 text-violet-300 text-[11px] items-center justify-center flex-shrink-0">
                        {i + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-zinc-100">{ex.name}</div>
                        <div className="text-xs text-zinc-400 mt-0.5">{item.dose}</div>
                      </div>
                      {count > 0 && (
                        <span className="text-xs text-orange-300 bg-orange-500/15 border border-orange-500/30 rounded-full px-2 py-0.5 flex-shrink-0">
                          ✓ {count}×
                        </span>
                      )}
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </Sheet>

      <ExerciseSheet
        open={!!exerciseOpen}
        exerciseId={exerciseOpen?.id}
        prescription={exerciseOpen?.prescription}
        sessionType={sessionType}
        onClose={() => setExerciseOpen(null)}
      />
    </>
  );
}
