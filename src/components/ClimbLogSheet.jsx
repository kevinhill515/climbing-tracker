import Sheet from './Sheet.jsx';
import { useStore } from '../store.jsx';
import { useEffect, useMemo, useState } from 'react';
import { getExercise } from '../data/exercises.js';
import { gradesFor, STYLE_LABELS } from '../data/grades.js';
import { today } from '../utils/dates.js';

// Multi-climb log sheet for on-wall session steps (efficiency training,
// 4x4, boulder block, movement drill, etc.).
//
// Layout — single screen so you can bang out 5-6 climbs without leaving:
//   1. Style toggle (toprope/boulder) — drives the how-to below AND the
//      grade grid AND the record's style.
//   2. How-to (uses ex.cueByStyle if present, otherwise ex.cue).
//   3. List of climbs already logged for THIS session step today, each
//      with a × to delete.
//   4. Add-a-climb form (name, grade, result, difficulty, notes) with
//      one "+ Add this climb" button that appends and clears fields
//      (keeping style — you're usually on the same style all session).
//   5. "Done" button closes.
export default function ClimbLogSheet({
  open, onClose, exerciseId, sessionType,
  defaultStyle = 'toprope',
}) {
  const { data, actions } = useStore();
  const [style, setStyle] = useState(defaultStyle);

  // Add-a-climb form state
  const [routeName, setRouteName]   = useState('');
  const [grade, setGrade]           = useState('');
  const [result, setResult]         = useState('flash'); // flash | complete | fail
  const [difficulty, setDifficulty] = useState(5);
  const [notes, setNotes]           = useState('');

  const todayStr = today();

  // Climbs already logged for this exercise/session today.
  const climbsThisSession = useMemo(() => {
    if (!exerciseId || !sessionType) return [];
    const climbs = [];
    for (const s of ['toprope', 'boulder']) {
      const attempts = data?.grades?.[s]?.attempts || [];
      for (const a of attempts) {
        if (a.date !== todayStr) continue;
        if (a.sessionType !== sessionType) continue;
        if (a.exerciseId !== exerciseId) continue;
        climbs.push({ ...a, style: s });
      }
    }
    return climbs;
  }, [data?.grades, todayStr, sessionType, exerciseId]);

  // Reset on open
  useEffect(() => {
    if (open) {
      setStyle(defaultStyle);
      setRouteName(''); setGrade(''); setResult('flash'); setDifficulty(5); setNotes('');
    }
  }, [open, exerciseId, defaultStyle]);

  if (!open || !exerciseId) return null;
  const ex = getExercise(exerciseId);
  const list = gradesFor(style);
  const cue = ex.cueByStyle?.[style] || ex.cue;

  const addClimb = () => {
    if (!grade) return;
    actions.logGradeAttempt(style, {
      grade,
      routeName: routeName.trim() || undefined,
      sent: result !== 'fail',
      flash: result === 'flash',
      result,
      difficulty,
      attempts: 1,
      notes: notes.trim(),
      date: todayStr,
      sessionType,
      exerciseId,
    });
    // Clear per-climb fields (keep style — usually on same style all session)
    setRouteName(''); setGrade(''); setResult('flash'); setDifficulty(5); setNotes('');
  };

  return (
    <Sheet open={open} onClose={onClose} title={ex.name} fullHeight>
      <div className="px-5 py-4 space-y-4">

        {/* Style toggle */}
        <div>
          <div className="text-xs uppercase tracking-wide text-zinc-500 mb-1.5">Style</div>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => { setStyle('toprope'); setGrade(''); }}
              className={`py-2 rounded-lg text-sm font-medium border ${
                style === 'toprope' ? 'bg-orange-500 text-zinc-950 border-orange-500' : 'bg-zinc-800 border-zinc-700 text-zinc-300'
              }`}
            >{STYLE_LABELS.toprope}</button>
            <button
              onClick={() => { setStyle('boulder'); setGrade(''); }}
              className={`py-2 rounded-lg text-sm font-medium border ${
                style === 'boulder' ? 'bg-orange-500 text-zinc-950 border-orange-500' : 'bg-zinc-800 border-zinc-700 text-zinc-300'
              }`}
            >{STYLE_LABELS.boulder}</button>
          </div>
        </div>

        {/* How-to (style-specific if available) */}
        {cue && (
          <div>
            <div className="text-xs uppercase tracking-wide text-zinc-500 mb-1">How-to · {STYLE_LABELS[style]}</div>
            <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-line">{cue}</p>
          </div>
        )}

        {ex.why && (
          <div>
            <div className="text-xs uppercase tracking-wide text-zinc-500 mb-1">Why</div>
            <p className="text-xs text-zinc-400 italic leading-relaxed">{ex.why}</p>
          </div>
        )}

        {/* Climbs logged this session */}
        {climbsThisSession.length > 0 && (
          <div>
            <div className="text-xs uppercase tracking-wide text-zinc-500 mb-1.5">
              This session · {climbsThisSession.length} climb{climbsThisSession.length === 1 ? '' : 's'}
            </div>
            <ul className="space-y-1.5">
              {climbsThisSession.map((c) => (
                <li key={c.id} className="bg-zinc-800/60 border border-zinc-800 rounded-lg px-3 py-2 flex items-center gap-2 text-xs">
                  <span className="tabular-nums text-orange-300 text-sm font-bold w-14 flex-shrink-0">{c.grade}</span>
                  <div className="flex-1 min-w-0">
                    {c.routeName
                      ? <div className="text-zinc-100 truncate">{c.routeName}</div>
                      : <div className="text-zinc-500 italic">(unnamed)</div>}
                    {c.notes && <div className="text-zinc-500 truncate text-[10px] mt-0.5">{c.notes}</div>}
                  </div>
                  <ResultChip result={c.result} />
                  <span className="text-[10px] text-zinc-400 tabular-nums flex-shrink-0">
                    {c.difficulty}/10
                  </span>
                  <button
                    onClick={() => actions.removeGradeAttempt(c.style, c.id)}
                    className="text-zinc-500 hover:text-rose-400 text-sm px-1 flex-shrink-0"
                    aria-label="Delete this climb"
                  >×</button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Add-a-climb form */}
        <div className="pt-3 border-t border-zinc-800 space-y-3">
          <div className="text-xs uppercase tracking-wide text-zinc-500">Add a climb</div>

          <input
            type="text"
            value={routeName}
            onChange={(e) => setRouteName(e.target.value)}
            placeholder="Route / problem name (optional)"
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500"
          />

          <div>
            <div className="text-[10px] uppercase tracking-wide text-zinc-500 mb-1">Scale</div>
            <div className="flex flex-wrap gap-1.5">
              {list.map((g) => (
                <button
                  key={g}
                  onClick={() => setGrade(g)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border tabular-nums ${
                    grade === g ? 'bg-orange-500 text-zinc-950 border-orange-500' : 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:border-zinc-600'
                  }`}
                >{g}</button>
              ))}
            </div>
          </div>

          <div>
            <div className="text-[10px] uppercase tracking-wide text-zinc-500 mb-1">Result</div>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setResult('flash')}
                className={`py-3 rounded-xl text-sm font-bold border ${result === 'flash' ? 'bg-emerald-500 text-zinc-950 border-emerald-500' : 'bg-zinc-800 border-zinc-700 text-zinc-300'}`}
              >⚡ Flash</button>
              <button
                onClick={() => setResult('complete')}
                className={`py-3 rounded-xl text-sm font-bold border ${result === 'complete' ? 'bg-orange-500 text-zinc-950 border-orange-500' : 'bg-zinc-800 border-zinc-700 text-zinc-300'}`}
              >✓ Complete</button>
              <button
                onClick={() => setResult('fail')}
                className={`py-3 rounded-xl text-sm font-bold border ${result === 'fail' ? 'bg-zinc-100 text-zinc-950 border-zinc-100' : 'bg-zinc-800 border-zinc-700 text-zinc-300'}`}
              >✗ Fail</button>
            </div>
            <div className="mt-1 text-[10px] text-zinc-500 leading-relaxed">
              Flash = clean 1st try, no beta. Complete = sent (may have taken tries). Fail = didn't send.
            </div>
          </div>

          <div>
            <div className="text-[10px] uppercase tracking-wide text-zinc-500 mb-1">
              Difficulty (1 = felt easy, 10 = at your limit)
            </div>
            <div className="grid grid-cols-10 gap-1">
              {[1,2,3,4,5,6,7,8,9,10].map((n) => (
                <button
                  key={n}
                  onClick={() => setDifficulty(n)}
                  className={`py-2 rounded-md text-xs font-bold border ${
                    difficulty === n
                      ? n >= 8 ? 'bg-rose-500 text-zinc-950 border-rose-500'
                      : n >= 5 ? 'bg-amber-500 text-zinc-950 border-amber-500'
                      : 'bg-emerald-500 text-zinc-950 border-emerald-500'
                      : 'bg-zinc-800 border-zinc-700 text-zinc-300'
                  }`}
                >{n}</button>
              ))}
            </div>
          </div>

          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Notes: beta, crux, technique focus (optional)"
            rows={2}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500"
          />

          <button
            onClick={addClimb}
            disabled={!grade}
            className="w-full bg-orange-500 hover:bg-orange-400 disabled:bg-zinc-700 disabled:text-zinc-500 text-zinc-950 font-bold rounded-xl py-3 text-sm"
          >
            + Add this climb
          </button>
        </div>

        <button
          onClick={onClose}
          className="w-full bg-zinc-800 hover:bg-zinc-700 text-zinc-100 font-bold rounded-2xl py-3 text-sm"
        >
          Done · {climbsThisSession.length} logged
        </button>
      </div>
    </Sheet>
  );
}

function ResultChip({ result }) {
  const style =
    result === 'flash'    ? 'text-emerald-400' :
    result === 'complete' ? 'text-orange-400'  :
                            'text-zinc-500';
  const icon = result === 'flash' ? '⚡' : result === 'complete' ? '✓' : '✗';
  return <span className={`text-sm ${style} flex-shrink-0`} title={result}>{icon}</span>;
}
