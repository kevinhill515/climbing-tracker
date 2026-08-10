import Sheet from './Sheet.jsx';
import { useStore } from '../store.jsx';
import { useEffect, useState } from 'react';
import { getExercise } from '../data/exercises.js';
import { gradesFor, STYLE_LABELS } from '../data/grades.js';
import { today } from '../utils/dates.js';

// Log a single climb attempt within a session (an efficiency route, a
// 4x4 climb, a warmup route, a boulder, etc.). Grade + Result + Difficulty
// instead of the strength-flavored Sets/Reps/Hold form.
//
// Save records to grades.[style].attempts (drives the Grades tab) AND
// includes sessionType + exerciseId so SessionSheet's "logged today"
// count picks it up on the right row.
export default function ClimbLogSheet({
  open, onClose, exerciseId, prescription, sessionType,
  defaultStyle = 'toprope',
}) {
  const { actions } = useStore();
  const [style, setStyle]           = useState(defaultStyle);
  const [routeName, setRouteName]   = useState('');
  const [grade, setGrade]           = useState('');
  const [result, setResult]         = useState('flash'); // 'flash' | 'complete' | 'fail'
  const [difficulty, setDifficulty] = useState(5);
  const [notes, setNotes]           = useState('');
  const [saveMsg, setSaveMsg]       = useState('');

  // Reset state each time the sheet opens on a fresh exercise
  useEffect(() => {
    if (open) {
      setStyle(defaultStyle);
      setRouteName('');
      setGrade('');
      setResult('flash');
      setDifficulty(5);
      setNotes('');
      setSaveMsg('');
    }
  }, [open, exerciseId, defaultStyle]);

  if (!open || !exerciseId) return null;
  const ex = getExercise(exerciseId);
  const list = gradesFor(style);

  // Core save logic — shared between "Save" (closes) and "Save & log another".
  const saveAttempt = () => {
    if (!grade) return false;
    actions.logGradeAttempt(style, {
      grade,
      routeName: routeName.trim() || undefined,
      sent: result !== 'fail',
      flash: result === 'flash',
      result,
      difficulty,
      attempts: 1,
      notes: notes.trim(),
      date: today(),
      sessionType,
      exerciseId,
    });
    return true;
  };

  const submitAndClose = () => {
    if (saveAttempt()) onClose();
  };

  const submitAndContinue = () => {
    if (!saveAttempt()) return;
    // Keep style; reset the per-climb fields
    setRouteName('');
    setGrade('');
    setResult('flash');
    setDifficulty(5);
    setNotes('');
    setSaveMsg(`Logged. Enter next climb.`);
    // Clear the message after a couple seconds
    setTimeout(() => setSaveMsg(''), 2500);
  };

  return (
    <Sheet open={open} onClose={onClose} title={ex.name} fullHeight>
      <div className="px-5 py-4 space-y-4">
        {prescription && (
          <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl px-3 py-2 flex items-baseline gap-2">
            <span className="text-[10px] uppercase tracking-wide text-orange-400/70">Today</span>
            <span className="text-sm text-orange-200 font-medium">{prescription}</span>
          </div>
        )}

        {ex.cue && (
          <div>
            <div className="text-xs uppercase tracking-wide text-zinc-500 mb-1">How-to</div>
            <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-line">{ex.cue}</p>
          </div>
        )}

        {ex.why && (
          <div>
            <div className="text-xs uppercase tracking-wide text-zinc-500 mb-1">Why</div>
            <p className="text-xs text-zinc-400 leading-relaxed italic">{ex.why}</p>
          </div>
        )}

        {/* Style toggle */}
        <div>
          <div className="text-xs uppercase tracking-wide text-zinc-500 mb-2">Log a climb</div>
          <div className="grid grid-cols-2 gap-2 mb-3">
            <button
              onClick={() => { setStyle('toprope'); setGrade(''); }}
              className={`py-2 rounded-lg text-sm font-medium border ${
                style === 'toprope'
                  ? 'bg-orange-500 text-zinc-950 border-orange-500'
                  : 'bg-zinc-800 border-zinc-700 text-zinc-300'
              }`}
            >{STYLE_LABELS.toprope}</button>
            <button
              onClick={() => { setStyle('boulder'); setGrade(''); }}
              className={`py-2 rounded-lg text-sm font-medium border ${
                style === 'boulder'
                  ? 'bg-orange-500 text-zinc-950 border-orange-500'
                  : 'bg-zinc-800 border-zinc-700 text-zinc-300'
              }`}
            >{STYLE_LABELS.boulder}</button>
          </div>

          {/* Route / problem name */}
          <div className="text-[10px] uppercase tracking-wide text-zinc-500 mb-1">Route or problem name</div>
          <input
            type="text"
            value={routeName}
            onChange={(e) => setRouteName(e.target.value)}
            placeholder="e.g. Yellow overhang, The Prow, unnamed pink"
            className="mb-3 w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500"
          />

          {/* Grade grid */}
          <div className="text-[10px] uppercase tracking-wide text-zinc-500 mb-1">Scale</div>
          <div className="flex flex-wrap gap-1.5 mb-3">
            {list.map((g) => (
              <button
                key={g}
                onClick={() => setGrade(g)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border tabular-nums ${
                  grade === g
                    ? 'bg-orange-500 text-zinc-950 border-orange-500'
                    : 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:border-zinc-600'
                }`}
              >
                {g}
              </button>
            ))}
          </div>

          {/* Result */}
          <div className="text-[10px] uppercase tracking-wide text-zinc-500 mb-1">Result</div>
          <div className="grid grid-cols-3 gap-2 mb-3">
            <button
              onClick={() => setResult('flash')}
              className={`py-3 rounded-xl text-sm font-bold border ${
                result === 'flash'
                  ? 'bg-emerald-500 text-zinc-950 border-emerald-500'
                  : 'bg-zinc-800 border-zinc-700 text-zinc-300'
              }`}
            >⚡ Flash</button>
            <button
              onClick={() => setResult('complete')}
              className={`py-3 rounded-xl text-sm font-bold border ${
                result === 'complete'
                  ? 'bg-orange-500 text-zinc-950 border-orange-500'
                  : 'bg-zinc-800 border-zinc-700 text-zinc-300'
              }`}
            >✓ Complete</button>
            <button
              onClick={() => setResult('fail')}
              className={`py-3 rounded-xl text-sm font-bold border ${
                result === 'fail'
                  ? 'bg-zinc-100 text-zinc-950 border-zinc-100'
                  : 'bg-zinc-800 border-zinc-700 text-zinc-300'
              }`}
            >✗ Fail</button>
          </div>
          <div className="text-[11px] text-zinc-500 leading-relaxed mb-3">
            Flash = clean first try, no beta. Complete = sent, may have taken tries. Fail = didn't send.
          </div>

          {/* Difficulty */}
          <div className="text-[10px] uppercase tracking-wide text-zinc-500 mb-1">
            Difficulty (1 = felt easy, 10 = at your limit)
          </div>
          <div className="grid grid-cols-10 gap-1 mb-2">
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

          {/* Notes */}
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Notes: beta, crux move, technique focus"
            rows={2}
            className="mt-2 w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500"
          />

          {saveMsg && (
            <div className="mt-2 text-xs text-emerald-300 bg-emerald-500/10 border border-emerald-500/30 rounded-lg px-3 py-2">
              ✓ {saveMsg}
            </div>
          )}

          <div className="mt-3 grid grid-cols-2 gap-2">
            <button
              onClick={submitAndClose}
              disabled={!grade}
              className="bg-zinc-800 hover:bg-zinc-700 disabled:bg-zinc-900 disabled:text-zinc-600 text-zinc-100 font-bold rounded-2xl py-3 text-sm"
            >
              Save & close
            </button>
            <button
              onClick={submitAndContinue}
              disabled={!grade}
              className="bg-orange-500 hover:bg-orange-400 disabled:bg-zinc-700 disabled:text-zinc-500 text-zinc-950 font-bold rounded-2xl py-3 text-sm"
            >
              Save & log another →
            </button>
          </div>
          <div className="mt-1 text-[10px] text-zinc-500 text-center">
            Log each climb one at a time. "Save & log another" clears the form for the next route.
          </div>
        </div>
      </div>
    </Sheet>
  );
}
