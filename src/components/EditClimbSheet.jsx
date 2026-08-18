import Sheet from './Sheet.jsx';
import { useStore } from '../store.jsx';
import { useEffect, useMemo, useState } from 'react';
import { weekId, parseDate, today } from '../utils/dates.js';

// Edit a logged climb after the fact — route name, notes, difficulty,
// and result. Grade + date are frozen (change those by deleting and
// re-logging). Delete lives at the bottom.
export default function EditClimbSheet({ open, onClose, climb }) {
  const { data, actions } = useStore();
  const [routeName, setRouteName]   = useState('');
  const [notes, setNotes]           = useState('');
  const [difficulty, setDifficulty] = useState(5);
  const [result, setResult]         = useState('flash');
  const [date, setDate]             = useState('');

  // Route suggestions from prior attempts at THIS climb's style + grade.
  // Excludes the current climb's own contribution so the count reflects
  // "other times you climbed this route".
  const routeSuggestions = useMemo(() => {
    if (!climb) return [];
    const attempts = data?.grades?.[climb.style]?.attempts || [];
    const filtered = attempts.filter((a) => a.grade === climb.grade && a.id !== climb.id);
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
    return Array.from(byKey.values()).sort((a, b) => b.lastAt - a.lastAt).slice(0, 8);
  }, [data?.grades, climb]);

  useEffect(() => {
    if (open && climb) {
      setRouteName(climb.routeName || '');
      setNotes(climb.notes || '');
      setDifficulty(climb.difficulty || 5);
      setResult(climb.result || (climb.flash ? 'flash' : climb.sent ? 'complete' : 'fail'));
      setDate(climb.date || today());
    }
  }, [open, climb]);

  if (!open || !climb) return null;

  const save = () => {
    // Same canonical-name logic as ClimbLogSheet so casing merges.
    const typed = routeName.trim();
    const canonical = typed
      ? (routeSuggestions.find((r) => r.name.toLowerCase() === typed.toLowerCase())?.name || typed)
      : undefined;
    // Changing the date also updates weekId so weekly bucketing follows.
    const dateChanged = date && date !== climb.date;
    const updates = {
      routeName: canonical,
      notes: notes.trim(),
      difficulty,
      result,
      sent: result !== 'fail',
      flash: result === 'flash',
    };
    if (dateChanged) {
      updates.date = date;
      updates.weekId = weekId(parseDate(date));
    }
    actions.updateGradeAttempt(climb.style, climb.id, updates);
    onClose();
  };

  const del = () => {
    actions.removeGradeAttempt(climb.style, climb.id);
    onClose();
  };

  return (
    <Sheet open={open} onClose={onClose} title="Edit climb" fullHeight>
      <div className="px-5 py-4 space-y-4">

        {/* Style + grade are frozen (change those by deleting + re-logging).
            Date is editable — for backdating climbs that got logged on the
            wrong day. */}
        <div className="flex items-center gap-2 text-xs">
          <span className={`text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded ${
            climb.style === 'toprope' ? 'bg-sky-500/20 text-sky-300' : 'bg-fuchsia-500/20 text-fuchsia-300'
          }`}>
            {climb.style === 'toprope' ? 'Top rope' : 'Boulder'}
          </span>
          <span className="text-orange-300 font-bold tabular-nums">{climb.grade}</span>
        </div>

        <div>
          <label className="text-[10px] uppercase tracking-wide text-zinc-500 mb-1 block">Date</label>
          <input
            type="date"
            value={date}
            max={today()}
            onChange={(e) => e.target.value && setDate(e.target.value)}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100"
          />
          {date && date !== climb.date && (
            <div className="text-[10px] text-amber-400 mt-1">
              Was {climb.date} — saving will move this climb (and its week bucket).
            </div>
          )}
        </div>

        <div>
          <label className="text-[10px] uppercase tracking-wide text-zinc-500 mb-1 block">Route / problem name</label>
          <input
            type="text"
            value={routeName}
            onChange={(e) => setRouteName(e.target.value)}
            placeholder="(unnamed)"
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
                    title={`${r.count} other attempt${r.count === 1 ? '' : 's'} at this grade`}
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
        </div>

        <div>
          <div className="text-[10px] uppercase tracking-wide text-zinc-500 mb-1">Difficulty (1 = easy, 10 = at limit)</div>
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

        <div>
          <label className="text-[10px] uppercase tracking-wide text-zinc-500 mb-1 block">Notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Beta, crux, feeling…"
            rows={3}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-2 pt-2">
          <button
            onClick={onClose}
            className="bg-zinc-800 hover:bg-zinc-700 text-zinc-100 font-bold rounded-xl py-3 text-sm"
          >Cancel</button>
          <button
            onClick={save}
            className="bg-orange-500 hover:bg-orange-400 text-zinc-950 font-bold rounded-xl py-3 text-sm"
          >Save</button>
        </div>

        <button
          onClick={del}
          className="w-full text-rose-400 hover:text-rose-300 text-xs py-2"
        >Delete this climb</button>
      </div>
    </Sheet>
  );
}
