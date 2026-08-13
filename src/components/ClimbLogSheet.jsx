import Sheet from './Sheet.jsx';
import EditClimbSheet from './EditClimbSheet.jsx';
import { useStore } from '../store.jsx';
import { useEffect, useMemo, useState } from 'react';
import { getExercise, DRILL_EXPLANATIONS } from '../data/exercises.js';
import { gradesFor } from '../data/grades.js';
import { today } from '../utils/dates.js';

// Multi-climb log sheet for on-wall session steps. Style is FIXED per
// exercise (ex.style === 'toprope' | 'boulder').
//
// Layout — logging up top, explainers at bottom (user preference):
//   1. Style badge
//   2. Optional drill picker (for movement-drill — pick which drill)
//   3. List of climbs already logged for THIS session step today
//   4. Add-a-climb form (name, grade, result, difficulty, notes)
//   5. "+ Add this climb" appends and clears form
//   6. "Done" closes
//   7. How-to + why AT THE BOTTOM (reference material, not the main event)
export default function ClimbLogSheet({
  open, onClose, exerciseId, sessionType,
}) {
  const { data, actions } = useStore();

  const [routeName, setRouteName]   = useState('');
  const [grade, setGrade]           = useState('');
  const [result, setResult]         = useState('flash'); // flash | complete | fail
  const [difficulty, setDifficulty] = useState(5);
  const [notes, setNotes]           = useState('');
  const [drillFocus, setDrillFocus] = useState(null);    // key of selected drill (if applicable)
  const [editClimb, setEditClimb] = useState(null);      // { id, style, … } — tap a logged row

  // Route-name suggestions: unique names previously used on this style,
  // optionally narrowed to matching grade when one is picked. Two climbs
  // that share (style, grade, name) are considered the same route — the
  // chip UX ensures the user picks the canonical spelling so the linkage
  // holds without needing explicit route IDs.
  const routeSuggestions = useMemo(() => {
    const styleAttempts = data?.grades?.[getExercise(exerciseId)?.style || 'toprope']?.attempts || [];
    const filtered = grade
      ? styleAttempts.filter((a) => a.grade === grade)
      : styleAttempts;
    // Group case-insensitively so "Blue slab" and "blue slab" don't
    // appear as separate chips. Keep the first-seen casing as canonical.
    const byKey = new Map();
    for (const a of filtered) {
      const name = (a.routeName || '').trim();
      if (!name) continue;
      const key = name.toLowerCase();
      const existing = byKey.get(key);
      if (!existing) byKey.set(key, { name, count: 1, lastAt: a.loggedAt || 0 });
      else {
        existing.count++;
        if ((a.loggedAt || 0) > existing.lastAt) existing.lastAt = a.loggedAt || 0;
      }
    }
    return Array.from(byKey.values())
      .sort((a, b) => b.lastAt - a.lastAt)
      .slice(0, 8);
  }, [data?.grades, exerciseId, grade]);

  const todayStr = today();

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

  useEffect(() => {
    if (open) {
      setRouteName(''); setGrade(''); setResult('flash'); setDifficulty(5); setNotes('');
      setDrillFocus(null);
    }
  }, [open, exerciseId]);

  if (!open || !exerciseId) return null;
  const ex = getExercise(exerciseId);
  const style = ex.style || 'toprope';
  const list = gradesFor(style);
  const cue = ex.cueByStyle?.[style] || ex.cue;
  const drillOptions = ex.drillOptions;

  const addClimb = () => {
    if (!grade) return;
    // Normalize route name against existing entries: if the typed name
    // matches an existing one case-insensitively, save with the existing
    // casing so 'Blue slab' and 'blue slab' collapse to one route.
    const typed = routeName.trim();
    const canonical = typed
      ? (routeSuggestions.find((r) => r.name.toLowerCase() === typed.toLowerCase())?.name || typed)
      : undefined;
    actions.logGradeAttempt(style, {
      grade,
      routeName: canonical,
      sent: result !== 'fail',
      flash: result === 'flash',
      result,
      difficulty,
      attempts: 1,
      notes: notes.trim(),
      date: todayStr,
      sessionType,
      exerciseId,
      ...(drillFocus ? { drillFocus } : {}),
    });
    setRouteName(''); setGrade(''); setResult('flash'); setDifficulty(5); setNotes('');
    // Keep drillFocus — user drills ONE thing per session, don't force
    // them to re-pick after every logged attempt.
  };

  return (
    <>
    <Sheet open={open} onClose={onClose} title={ex.name} fullHeight>
      <div className="px-5 py-4 space-y-4">

        {/* Style badge */}
        <div className="flex items-center gap-2">
          <span className={`text-[10px] uppercase tracking-wider px-2 py-1 rounded font-semibold ${
            style === 'toprope' ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40' :
            'bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/40'
          }`}>
            {style === 'toprope' ? 'Top rope' : 'Boulder'}
          </span>
        </div>

        {/* Drill picker — shown for any exercise exposing drillOptions.
            Primary on movement-drill (must pick), optional on boulder
            exercises (boulder-cooldown, boulder-block). */}
        {drillOptions && drillOptions.length > 0 && (
          <div className="bg-zinc-800/60 border border-zinc-700 rounded-xl p-3">
            <div className="text-[10px] uppercase tracking-wide text-zinc-500 mb-1.5">
              Drill focus {exerciseId === 'movement-drill' ? '— pick ONE' : '(optional)'}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {drillOptions.map((d) => (
                <button
                  key={d.key}
                  onClick={() => setDrillFocus(d.key === drillFocus ? null : d.key)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border ${
                    drillFocus === d.key
                      ? 'bg-orange-500 text-zinc-950 border-orange-500'
                      : 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:border-zinc-600'
                  }`}
                >{d.label}</button>
              ))}
            </div>
            <div className="mt-2 text-[10px] text-zinc-500">
              Locked in on each logged climb. Full drill breakdowns at the bottom.
            </div>
          </div>
        )}

        {/* Climbs logged this session */}
        {climbsThisSession.length > 0 && (
          <div>
            <div className="text-xs uppercase tracking-wide text-zinc-500 mb-1.5">
              This session · {climbsThisSession.length} climb{climbsThisSession.length === 1 ? '' : 's'}
            </div>
            <ul className="space-y-1.5">
              {climbsThisSession.map((c) => {
                const drillLabel = c.drillFocus
                  ? drillOptions?.find((d) => d.key === c.drillFocus)?.label
                  : null;
                return (
                  <li key={c.id}>
                    <button
                      onClick={() => setEditClimb(c)}
                      className="w-full text-left bg-zinc-800/60 border border-zinc-800 rounded-lg px-3 py-2 flex items-center gap-2 text-xs hover:bg-zinc-800 active:bg-zinc-800/90"
                    >
                      <span className="tabular-nums text-orange-300 text-sm font-bold w-14 flex-shrink-0">{c.grade}</span>
                      <div className="flex-1 min-w-0">
                        {c.routeName
                          ? <div className="text-zinc-100 truncate">{c.routeName}</div>
                          : <div className="text-orange-400/80 italic underline decoration-dotted">+ name this route</div>}
                        {drillLabel && (
                          <div className="text-[10px] text-orange-300/80 mt-0.5">drill: {drillLabel}</div>
                        )}
                        {c.notes && <div className="text-zinc-500 truncate text-[10px] mt-0.5">{c.notes}</div>}
                      </div>
                      <ResultChip result={c.result} />
                      <span className="text-[10px] text-zinc-400 tabular-nums flex-shrink-0">
                        {c.difficulty}/10
                      </span>
                      <span className="text-zinc-500 text-xs flex-shrink-0" title="Edit">✎</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {/* Add-a-climb form */}
        <div className="pt-3 border-t border-zinc-800 space-y-3">
          <div className="text-xs uppercase tracking-wide text-zinc-500">Add a climb</div>

          <div>
            <input
              type="text"
              value={routeName}
              onChange={(e) => setRouteName(e.target.value)}
              placeholder="Route / problem name (optional)"
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500"
            />
            {routeSuggestions.length > 0 && (
              <div className="mt-1.5 flex flex-wrap gap-1">
                {routeSuggestions.map((r) => {
                  const active = routeName.trim().toLowerCase() === r.name.toLowerCase();
                  return (
                    <button
                      key={r.name}
                      onClick={() => setRouteName(r.name)}
                      className={`px-2 py-1 rounded text-[11px] border transition ${
                        active
                          ? 'bg-orange-500 text-zinc-950 border-orange-500'
                          : 'bg-zinc-800/60 border-zinc-700 text-zinc-300 hover:border-zinc-500'
                      }`}
                      title={`${r.count} previous attempt${r.count === 1 ? '' : 's'}`}
                    >
                      {r.name}
                      <span className={active ? 'text-zinc-800/80' : 'text-zinc-500'}> · {r.count}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

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

        {/* Explainers at the bottom — reference material, not the main event.
            When drillOptions is present, also append the shared drill
            breakdowns so users can look up the pattern they're drilling. */}
        {(cue || ex.why || drillOptions) && (
          <details className="pt-2 border-t border-zinc-800">
            <summary className="text-xs uppercase tracking-wide text-zinc-500 cursor-pointer py-2">
              How-to {drillOptions ? '+ drill breakdowns ' : ''}· tap to expand
            </summary>
            <div className="space-y-3 pt-2">
              {cue && (
                <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-line">{cue}</p>
              )}
              {ex.why && (
                <p className="text-xs text-zinc-400 italic leading-relaxed">{ex.why}</p>
              )}
              {drillOptions && drillOptions.length > 0 && (
                <div className="pt-2 border-t border-zinc-800">
                  <div className="text-[10px] uppercase tracking-wide text-zinc-500 mb-2">
                    Drill breakdowns
                  </div>
                  <pre className="text-[11px] text-zinc-300 leading-relaxed whitespace-pre-wrap font-sans">
{DRILL_EXPLANATIONS}
                  </pre>
                </div>
              )}
            </div>
          </details>
        )}
      </div>
    </Sheet>

    <EditClimbSheet
      open={!!editClimb}
      climb={editClimb ? { ...editClimb, style: editClimb.style } : null}
      onClose={() => setEditClimb(null)}
    />
    </>
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
