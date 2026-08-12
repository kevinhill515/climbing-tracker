import Sheet from './Sheet.jsx';
import { useStore } from '../store.jsx';
import { useState } from 'react';
import { gradesFor, STYLE_LABELS } from '../data/grades.js';
import { today } from '../utils/dates.js';

// Log a single attempt or send at a grade. Records style, grade, flash vs
// worked, attempts count, and optional notes. Powers the attempt-to-send
// ratio and first-flash history on the Grades tab.
export default function GradeLogSheet({ open, onClose, style }) {
  const { actions } = useStore();
  const [grade, setGrade] = useState('');
  const [attempts, setAttempts] = useState('1');
  const [sent, setSent] = useState(true);
  const [flash, setFlash] = useState(true);
  const [notes, setNotes] = useState('');
  const [logDate, setLogDate] = useState(today());

  const list = style ? gradesFor(style) : [];

  const submit = () => {
    if (!grade) return;
    actions.logGradeAttempt(style, {
      grade,
      sent,
      flash: sent && flash,
      attempts: parseInt(attempts, 10) || 1,
      notes: notes.trim(),
      date: logDate,
    });
    setGrade(''); setAttempts('1'); setSent(true); setFlash(true); setNotes('');
    setLogDate(today());
    onClose();
  };

  if (!open || !style) return null;

  return (
    <Sheet open={open} onClose={onClose} title={`Log ${STYLE_LABELS[style]} attempt`} fullHeight>
      <div className="px-5 py-4 space-y-4">
        {/* Grade grid */}
        <div>
          <div className="text-xs uppercase tracking-wide text-zinc-500 mb-2">Grade</div>
          <div className="flex flex-wrap gap-1.5">
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
        </div>

        {/* Result */}
        <div>
          <div className="text-xs uppercase tracking-wide text-zinc-500 mb-2">Result</div>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => { setSent(true); setFlash(true); }}
              className={`py-3 rounded-xl text-sm font-bold border ${sent && flash ? 'bg-emerald-500 text-zinc-950 border-emerald-500' : 'bg-zinc-800 border-zinc-700 text-zinc-300'}`}
            >⚡ Flash</button>
            <button
              onClick={() => { setSent(true); setFlash(false); }}
              className={`py-3 rounded-xl text-sm font-bold border ${sent && !flash ? 'bg-orange-500 text-zinc-950 border-orange-500' : 'bg-zinc-800 border-zinc-700 text-zinc-300'}`}
            >✓ Complete</button>
            <button
              onClick={() => { setSent(false); setFlash(false); }}
              className={`py-3 rounded-xl text-sm font-bold border ${!sent ? 'bg-zinc-100 text-zinc-950 border-zinc-100' : 'bg-zinc-800 border-zinc-700 text-zinc-300'}`}
            >✗ Fail</button>
          </div>
          <div className="mt-1 text-[11px] text-zinc-500 leading-relaxed">
            Flash = clean first try, no beta. Complete = sent (may have taken multiple tries). Fail = didn't send.
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <label className="block">
            <span className="text-[10px] uppercase tracking-wide text-zinc-500">Attempts</span>
            <input
              type="number"
              inputMode="numeric"
              value={attempts}
              onChange={(e) => setAttempts(e.target.value)}
              className="mt-1 w-full bg-zinc-800 border border-zinc-700 rounded-lg px-2 py-2 text-sm text-zinc-100"
            />
          </label>
          <label className="block">
            <span className="text-[10px] uppercase tracking-wide text-zinc-500">Date</span>
            <input
              type="date"
              value={logDate}
              onChange={(e) => setLogDate(e.target.value)}
              className="mt-1 w-full bg-zinc-800 border border-zinc-700 rounded-lg px-2 py-2 text-sm text-zinc-100"
            />
          </label>
        </div>

        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Notes (optional): beta, crux move, what worked, what didn't"
          rows={3}
          className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500"
        />

        <button
          onClick={submit}
          disabled={!grade}
          className="w-full bg-orange-500 hover:bg-orange-400 disabled:bg-zinc-700 disabled:text-zinc-500 text-zinc-950 font-bold rounded-2xl py-4 text-lg"
        >
          Save attempt
        </button>
      </div>
    </Sheet>
  );
}
