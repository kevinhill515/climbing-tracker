import Sheet from './Sheet.jsx';
import { getExercise } from '../data/exercises.js';
import { useStore } from '../store.jsx';
import { useEffect, useRef, useState } from 'react';

// Quick-log sheet for a single exercise inside a session. Includes an
// inline hold timer for seconds-based moves and a rest timer that
// auto-starts on stop of the hold timer.
export default function ExerciseSheet({ exerciseId, prescription, sessionType, open, onClose }) {
  const { actions } = useStore();
  const ex = getExercise(exerciseId);

  const [sets, setSets] = useState('');
  const [reps, setReps] = useState('');
  const [hold, setHold] = useState('');
  const [load, setLoad] = useState('');
  const [notes, setNotes] = useState('');

  // Hold timer
  const [holdRunning, setHoldRunning] = useState(false);
  const holdStartRef = useRef(0);
  useEffect(() => {
    if (!holdRunning) return;
    holdStartRef.current = Date.now();
    setHold('0');
    const id = setInterval(() => {
      setHold(String(Math.floor((Date.now() - holdStartRef.current) / 1000)));
    }, 200);
    return () => clearInterval(id);
  }, [holdRunning]);

  // Rest timer
  const [restRemaining, setRestRemaining] = useState(0);
  useEffect(() => {
    if (restRemaining <= 0) return;
    const id = setInterval(() => {
      setRestRemaining((r) => {
        if (r <= 1) {
          if (typeof navigator !== 'undefined' && 'vibrate' in navigator) navigator.vibrate(250);
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [restRemaining]);

  useEffect(() => {
    if (!open) { setHoldRunning(false); setRestRemaining(0); }
  }, [open]);

  const toggleHold = () => {
    if (holdRunning) {
      setHoldRunning(false);
      setRestRemaining(90);
    } else {
      setRestRemaining(0);
      setHoldRunning(true);
    }
  };

  const log = () => {
    actions.addLog({
      exerciseId,
      sessionType: sessionType || null,
      sets:  num(sets),
      reps:  num(reps),
      hold:  num(hold),
      load:  num(load),
      notes: notes.trim(),
    });
    setSets(''); setReps(''); setHold(''); setLoad(''); setNotes('');
    setHoldRunning(false);
    onClose();
  };

  return (
    <Sheet open={open} onClose={onClose} title={ex.name}>
      <div className="px-5 py-4 space-y-5">
        {prescription && (
          <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl px-3 py-2 flex items-baseline gap-2">
            <span className="text-[10px] uppercase tracking-wide text-orange-400/70">Today</span>
            <span className="text-sm text-orange-200 font-medium">{prescription}</span>
          </div>
        )}

        {ex.cue && (
          <div>
            <div className="text-xs uppercase tracking-wide text-zinc-500 mb-1">How-to</div>
            <p className="text-sm text-zinc-300 leading-relaxed">{ex.cue}</p>
          </div>
        )}

        {ex.why && (
          <div>
            <div className="text-xs uppercase tracking-wide text-zinc-500 mb-1">Why</div>
            <p className="text-xs text-zinc-400 leading-relaxed italic">{ex.why}</p>
          </div>
        )}

        <div>
          <div className="text-xs uppercase tracking-wide text-zinc-500 mb-2">Quick log</div>
          <div className="grid grid-cols-3 gap-2">
            <Field label="Sets" value={sets} onChange={setSets} />
            <Field label="Reps" value={reps} onChange={setReps} />
            <label className="block">
              <span className="text-[10px] uppercase tracking-wide text-zinc-500">Hold (s)</span>
              <div className="relative mt-1">
                <input
                  type="number" inputMode="decimal"
                  value={hold} placeholder="–"
                  onChange={(e) => { setHold(e.target.value); setHoldRunning(false); }}
                  className={`w-full pr-9 bg-zinc-800 border rounded-lg px-2 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 ${holdRunning ? 'border-amber-500/60 text-amber-200' : 'border-zinc-700'}`}
                />
                <button
                  onClick={toggleHold}
                  className={`absolute right-1 top-1/2 -translate-y-1/2 w-7 h-7 rounded flex items-center justify-center text-sm ${holdRunning ? 'text-amber-300 bg-amber-500/20' : 'text-zinc-300 bg-zinc-700 hover:bg-zinc-600'}`}
                  type="button"
                >{holdRunning ? '■' : '▶'}</button>
              </div>
            </label>
            <Field label="Load (lb)" value={load} onChange={setLoad} />
            <label className="block col-span-2">
              <span className="text-[10px] uppercase tracking-wide text-zinc-500">Rest</span>
              <div className={`mt-1 rounded-lg px-2 py-2 text-sm tabular-nums border flex items-center justify-between ${
                restRemaining > 0
                  ? 'bg-amber-500/15 border-amber-500/30 text-amber-200 font-bold'
                  : 'bg-zinc-800 border-zinc-700 text-zinc-500'
              }`}>
                <span>{restRemaining > 0 ? formatMSS(restRemaining) : '—'}</span>
                {restRemaining > 0 && (
                  <div className="flex items-center gap-1">
                    <button onClick={() => setRestRemaining((r) => Math.max(15, r - 15))} className="text-xs text-amber-300/80 px-1">−15</button>
                    <button onClick={() => setRestRemaining((r) => r + 30)} className="text-xs text-amber-300/80 px-1">+30</button>
                    <button onClick={() => setRestRemaining(0)} className="text-amber-300/70 hover:text-amber-200 text-xs">×</button>
                  </div>
                )}
              </div>
            </label>
          </div>

          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Notes (optional)"
            rows={2}
            className="mt-2 w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500"
          />
          <button
            onClick={log}
            className="mt-3 w-full bg-orange-500 hover:bg-orange-400 text-zinc-950 font-bold rounded-xl py-3"
          >
            Log
          </button>
        </div>
      </div>
    </Sheet>
  );
}

function Field({ label, value, onChange }) {
  return (
    <label className="block">
      <span className="text-[10px] uppercase tracking-wide text-zinc-500">{label}</span>
      <input
        type="number" inputMode="decimal"
        value={value} placeholder="–"
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full bg-zinc-800 border border-zinc-700 rounded-lg px-2 py-2 text-sm text-zinc-100 placeholder:text-zinc-500"
      />
    </label>
  );
}

function num(s) { const n = parseFloat(s); return isFinite(n) ? n : null; }

function formatMSS(secs) {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}
