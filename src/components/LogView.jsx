import { useStore } from '../store.jsx';
import { useMemo, useState } from 'react';
import DayDetailSheet from './DayDetailSheet.jsx';
import { gradesFor, ordinalOf, STYLE_LABELS } from '../data/grades.js';

// Log tab — everything logged, two views:
//   Sessions: day-by-day list (was the old HistoryView)
//   Climbs:   flat, filterable, sortable list of every climb attempt
// Also surfaces recent PRs at the top of the Climbs view.
export default function LogView() {
  const { data, actions } = useStore();
  const [view, setView] = useState('sessions'); // 'sessions' | 'climbs'
  const [pickedDate, setPickedDate] = useState(null);
  if (!data) return null;

  return (
    <div className="px-4 pt-3 pb-24 max-w-xl mx-auto fade-in">
      <h1 className="text-xl font-bold text-zinc-100 mb-3">Log</h1>

      <div className="grid grid-cols-2 gap-2 mb-4">
        <TabBtn active={view === 'sessions'} onClick={() => setView('sessions')} label="Sessions" />
        <TabBtn active={view === 'climbs'}   onClick={() => setView('climbs')}   label="All climbs" />
      </div>

      {view === 'sessions'
        ? <SessionsList data={data} onPickDate={setPickedDate} />
        : <ClimbsList data={data} onRemove={(style, id) => actions.removeGradeAttempt(style, id)} />}

      <DayDetailSheet open={!!pickedDate} date={pickedDate} onClose={() => setPickedDate(null)} />
    </div>
  );
}

function TabBtn({ active, onClick, label }) {
  return (
    <button
      onClick={onClick}
      className={`py-2 rounded-xl text-sm font-medium border ${
        active ? 'bg-zinc-100 text-zinc-950 border-zinc-100' : 'bg-zinc-800 border-zinc-700 text-zinc-300'
      }`}
    >{label}</button>
  );
}

// -------- Sessions list (day-based) --------
function SessionsList({ data, onPickDate }) {
  const days = useMemo(() => aggregateActivity(data), [data]);
  if (days.length === 0) {
    return (
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl px-4 py-8 text-center text-sm text-zinc-400">
        Nothing logged yet. Complete a session on the Week tab.
      </div>
    );
  }
  return (
    <ul className="space-y-2">
      {days.map((d) => (
        <li key={d.date}>
          <button
            onClick={() => onPickDate(d.date)}
            className="w-full text-left bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-2xl px-4 py-3"
          >
            <div className="flex items-baseline justify-between">
              <div className="text-sm font-medium text-zinc-100">{fmtDatePretty(d.date)}</div>
              <div className="text-[11px] text-zinc-500">{d.date}</div>
            </div>
            <div className="mt-1 text-xs text-zinc-400 flex flex-wrap gap-x-3 gap-y-0.5">
              {d.attempts > 0 && <span>{d.attempts} climb{d.attempts === 1 ? '' : 's'}</span>}
              {d.logs > 0 && <span>{d.logs} exercise log{d.logs === 1 ? '' : 's'}</span>}
              {d.flashes > 0 && <span className="text-emerald-400">⚡ {d.flashes} flash{d.flashes === 1 ? '' : 'es'}</span>}
            </div>
          </button>
        </li>
      ))}
    </ul>
  );
}

// -------- All climbs (flat, filterable, sortable) --------
function ClimbsList({ data, onRemove }) {
  const [styleFilter, setStyleFilter]   = useState('all'); // all | toprope | boulder
  const [resultFilter, setResultFilter] = useState('all'); // all | flash | complete | fail
  const [sort, setSort]                 = useState('date-desc'); // date-desc | date-asc | grade-desc | grade-asc

  const all = useMemo(() => {
    const list = [];
    for (const s of ['toprope', 'boulder']) {
      for (const a of (data.grades[s]?.attempts || [])) {
        list.push({ ...a, style: s });
      }
    }
    return list;
  }, [data.grades]);

  const prs = useMemo(() => computeRecentPRs(all), [all]);

  const filtered = useMemo(() => {
    let arr = all;
    if (styleFilter !== 'all') arr = arr.filter((a) => a.style === styleFilter);
    if (resultFilter !== 'all') arr = arr.filter((a) => a.result === resultFilter);
    arr = [...arr];
    if (sort === 'date-desc')  arr.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
    if (sort === 'date-asc')   arr.sort((a, b) => (a.date || '').localeCompare(b.date || ''));
    if (sort === 'grade-desc') arr.sort((a, b) => ordinalOf(b.style, b.grade) - ordinalOf(a.style, a.grade));
    if (sort === 'grade-asc')  arr.sort((a, b) => ordinalOf(a.style, a.grade) - ordinalOf(b.style, b.grade));
    return arr;
  }, [all, styleFilter, resultFilter, sort]);

  return (
    <div>
      {/* Recent PRs */}
      {prs.length > 0 && (
        <div className="bg-emerald-500/10 border border-emerald-500/40 rounded-2xl p-3 mb-3">
          <div className="text-[10px] uppercase tracking-wide text-emerald-300 mb-1.5 font-semibold">
            🔥 Recent PRs (last 30 days)
          </div>
          <ul className="space-y-1">
            {prs.map((p, i) => (
              <li key={i} className="text-xs text-emerald-200 flex items-center gap-2">
                <span className="tabular-nums text-emerald-300 font-bold w-14">{p.grade}</span>
                <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/20">
                  {p.style === 'toprope' ? 'TR' : 'V'}
                </span>
                <span>{p.type === 'flash' ? 'first flash' : 'first send'}</span>
                <span className="ml-auto text-[10px] tabular-nums text-emerald-300/70">{p.date}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Filters */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 mb-3 space-y-2">
        <div>
          <div className="text-[10px] uppercase tracking-wide text-zinc-500 mb-1">Style</div>
          <div className="grid grid-cols-3 gap-1">
            <ChipBtn v="all"     current={styleFilter} set={setStyleFilter} label="All" />
            <ChipBtn v="toprope" current={styleFilter} set={setStyleFilter} label="Top rope" />
            <ChipBtn v="boulder" current={styleFilter} set={setStyleFilter} label="Boulder" />
          </div>
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-wide text-zinc-500 mb-1">Result</div>
          <div className="grid grid-cols-4 gap-1">
            <ChipBtn v="all"      current={resultFilter} set={setResultFilter} label="All" />
            <ChipBtn v="flash"    current={resultFilter} set={setResultFilter} label="⚡ Flash" />
            <ChipBtn v="complete" current={resultFilter} set={setResultFilter} label="✓ Complete" />
            <ChipBtn v="fail"     current={resultFilter} set={setResultFilter} label="✗ Fail" />
          </div>
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-wide text-zinc-500 mb-1">Sort</div>
          <div className="grid grid-cols-2 gap-1">
            <ChipBtn v="date-desc"  current={sort} set={setSort} label="Newest first" />
            <ChipBtn v="date-asc"   current={sort} set={setSort} label="Oldest first" />
            <ChipBtn v="grade-desc" current={sort} set={setSort} label="Hardest first" />
            <ChipBtn v="grade-asc"  current={sort} set={setSort} label="Easiest first" />
          </div>
        </div>
      </div>

      {/* Results */}
      {filtered.length === 0 ? (
        <div className="text-sm text-zinc-500 text-center py-8">No climbs match your filters.</div>
      ) : (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
          <div className="px-4 py-2 border-b border-zinc-800 text-[11px] uppercase tracking-wide text-zinc-500">
            {filtered.length} climb{filtered.length === 1 ? '' : 's'}
          </div>
          <ul className="divide-y divide-zinc-800/70">
            {filtered.map((c) => (
              <li key={c.id} className="px-3 py-2 flex items-center gap-2 text-xs">
                <span className="text-[10px] text-zinc-500 w-16 tabular-nums flex-shrink-0">{c.date}</span>
                <span className={`text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded flex-shrink-0 ${
                  c.style === 'toprope' ? 'bg-sky-500/15 text-sky-300' : 'bg-fuchsia-500/15 text-fuchsia-300'
                }`}>
                  {c.style === 'toprope' ? 'TR' : 'V'}
                </span>
                <span className="text-orange-300 font-bold tabular-nums w-14 flex-shrink-0">{c.grade}</span>
                <div className="flex-1 min-w-0">
                  {c.routeName ? (
                    <div className="text-zinc-100 truncate">{c.routeName}</div>
                  ) : (
                    <div className="text-zinc-500 italic">(unnamed)</div>
                  )}
                  {c.notes && <div className="text-zinc-500 truncate text-[10px]">{c.notes}</div>}
                </div>
                <ResultChip result={c.result} />
                {c.difficulty && <span className="text-[10px] text-zinc-500 tabular-nums flex-shrink-0">{c.difficulty}/10</span>}
                <button onClick={() => onRemove(c.style, c.id)} className="text-zinc-600 hover:text-rose-400 px-1 flex-shrink-0">×</button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function ChipBtn({ v, current, set, label }) {
  return (
    <button
      onClick={() => set(v)}
      className={`py-1.5 rounded-md text-[11px] font-medium border ${
        current === v ? 'bg-orange-500 text-zinc-950 border-orange-500' : 'bg-zinc-800 border-zinc-700 text-zinc-300'
      }`}
    >{label}</button>
  );
}

function ResultChip({ result }) {
  const cfg =
    result === 'flash'    ? { c: 'text-emerald-400', i: '⚡' } :
    result === 'complete' ? { c: 'text-orange-400',  i: '✓' } :
                            { c: 'text-zinc-500',    i: '✗' };
  return <span className={`text-sm ${cfg.c} flex-shrink-0`}>{cfg.i}</span>;
}

// --------- helpers ---------
function aggregateActivity(data) {
  const map = {};
  const init = () => ({ logs: 0, attempts: 0, flashes: 0 });
  for (const l of data.logs || []) {
    if (!map[l.date]) map[l.date] = init();
    map[l.date].logs++;
  }
  for (const a of (data.grades?.boulder?.attempts || []).concat(data.grades?.toprope?.attempts || [])) {
    if (!map[a.date]) map[a.date] = init();
    map[a.date].attempts++;
    if (a.flash && a.sent) map[a.date].flashes++;
  }
  return Object.entries(map)
    .map(([date, v]) => ({ date, ...v }))
    .sort((a, b) => b.date.localeCompare(a.date));
}

function fmtDatePretty(d) {
  const [y, m, day] = d.split('-').map(Number);
  return new Date(y, m - 1, day, 12).toLocaleDateString(undefined, {
    weekday: 'short', month: 'short', day: 'numeric',
  });
}

// Recent PRs = first flash and first send at each grade, restricted to
// events in the last 30 days.
function computeRecentPRs(all) {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 30);
  const cutoffStr = cutoff.toISOString().slice(0, 10);
  const firstFlash = {}; // key = style|grade
  const firstSend = {};
  for (const a of all) {
    if (!a.date || !a.grade || !a.sent) continue;
    const k = `${a.style}|${a.grade}`;
    if (a.flash) {
      if (!firstFlash[k] || a.date < firstFlash[k].date) firstFlash[k] = a;
    }
    if (!firstSend[k] || a.date < firstSend[k].date) firstSend[k] = a;
  }
  const prs = [];
  for (const [k, a] of Object.entries(firstFlash)) {
    if (a.date >= cutoffStr) prs.push({ type: 'flash', grade: a.grade, style: a.style, date: a.date });
  }
  for (const [k, a] of Object.entries(firstSend)) {
    if (a.date >= cutoffStr && !firstFlash[k]) prs.push({ type: 'send', grade: a.grade, style: a.style, date: a.date });
  }
  return prs.sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5);
}
