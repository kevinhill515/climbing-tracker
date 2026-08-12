import { useStore } from '../store.jsx';
import { useMemo, useState } from 'react';
import DayDetailSheet from './DayDetailSheet.jsx';
import EditClimbSheet from './EditClimbSheet.jsx';
import ExportSheet from './ExportSheet.jsx';
import { gradesFor, ordinalOf, STYLE_LABELS, flashAt } from '../data/grades.js';
import { today, weekStartOf } from '../utils/dates.js';

// Log tab — everything logged, three views:
//   Sessions:    day-by-day list (was the old HistoryView)
//   Climbs:      flat, filterable, sortable list of every climb attempt
//   Weekly mix:  scorecard-style rows, one per week — focus/moderate/stretch
//                buckets for both styles, drills practiced, on-target hint
export default function LogView() {
  const { data, actions } = useStore();
  const [view, setView] = useState('sessions'); // 'sessions' | 'climbs' | 'weekly'
  const [pickedDate, setPickedDate] = useState(null);
  const [editClimb, setEditClimb] = useState(null);
  const [exportOpen, setExportOpen] = useState(false);
  if (!data) return null;

  return (
    <div className="px-4 pt-3 pb-24 max-w-xl mx-auto fade-in">
      <div className="flex items-center justify-between mb-3">
        <h1 className="text-xl font-bold text-zinc-100">Log</h1>
        <button
          onClick={() => setExportOpen(true)}
          className="text-xs text-zinc-400 hover:text-zinc-100 border border-zinc-700 rounded-lg px-3 py-1.5"
        >Export ↓</button>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-4">
        <TabBtn active={view === 'sessions'} onClick={() => setView('sessions')} label="Sessions" />
        <TabBtn active={view === 'climbs'}   onClick={() => setView('climbs')}   label="Climbs" />
        <TabBtn active={view === 'weekly'}   onClick={() => setView('weekly')}   label="Weekly mix" />
      </div>

      {view === 'sessions' && <SessionsList data={data} onPickDate={setPickedDate} />}
      {view === 'climbs'   && <ClimbsList data={data} onEdit={setEditClimb} />}
      {view === 'weekly'   && <WeeklyMixList data={data} />}

      <DayDetailSheet open={!!pickedDate} date={pickedDate} onClose={() => setPickedDate(null)} />
      <EditClimbSheet open={!!editClimb} climb={editClimb} onClose={() => setEditClimb(null)} />
      <ExportSheet open={exportOpen} onClose={() => setExportOpen(false)} data={data} />
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
function ClimbsList({ data, onEdit }) {
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
    // WITHIN A DAY, always preserve logging order (loggedAt ascending) —
    // "in the order I logged it in the session". Between days, the sort
    // direction applies.
    const cmpLogged = (a, b) => (a.loggedAt || 0) - (b.loggedAt || 0);
    if (sort === 'date-desc') {
      arr.sort((a, b) => {
        const d = (b.date || '').localeCompare(a.date || '');
        return d !== 0 ? d : cmpLogged(a, b);
      });
    }
    if (sort === 'date-asc') {
      arr.sort((a, b) => {
        const d = (a.date || '').localeCompare(b.date || '');
        return d !== 0 ? d : cmpLogged(a, b);
      });
    }
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
                <span>{p.type === 'flash' ? 'first flash' : 'first complete'}</span>
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
              <li key={c.id}>
                <button
                  onClick={() => onEdit(c)}
                  className="w-full text-left px-3 py-2 flex items-center gap-2 text-xs hover:bg-zinc-800/50 active:bg-zinc-800/80"
                >
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
                      <div className="text-orange-400/80 italic underline decoration-dotted">+ name this route</div>
                    )}
                    {c.notes && <div className="text-zinc-500 truncate text-[10px]">{c.notes}</div>}
                  </div>
                  <ResultChip result={c.result} />
                  {c.difficulty && <span className="text-[10px] text-zinc-500 tabular-nums flex-shrink-0">{c.difficulty}/10</span>}
                  <span className="text-zinc-500 text-xs flex-shrink-0" title="Edit">✎</span>
                </button>
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

// -------- Weekly mix — one row per week, three-bucket split per style --------
// Weeks are keyed by weekId (Monday date YYYY-MM-DD). Bucketing uses the
// flash grade that was CURRENT at the end of that week (from flashHistory)
// so past weeks reflect the level you were actually at then. Bumping your
// flash today doesn't retroactively re-classify last month's climbs.
function WeeklyMixList({ data }) {
  const weeks = useMemo(() => aggregateWeekly(data), [data]);
  if (weeks.length === 0) {
    return (
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl px-4 py-8 text-center text-sm text-zinc-400">
        No climbs logged yet. Track a few sessions and this fills in.
      </div>
    );
  }
  return (
    <>
      <div className="text-[10px] text-zinc-500 mb-2 leading-tight">
        Buckets scored against the flash grade you had at that week — historical, not retroactive.
        Focus = at flash · Moderate = below · Stretch = above. Target: 60-70 / 20-30 / 5-10%.
      </div>
      <ul className="space-y-2">
        {weeks.map((w) => (
          <li key={w.weekId} className="bg-zinc-900 border border-zinc-800 rounded-2xl px-4 py-3">
            <div className="flex items-baseline justify-between mb-2">
              <div className="text-sm font-medium text-zinc-100">{w.range}</div>
              <div className="text-[10px] text-zinc-500 tabular-nums">
                {w.total} climb{w.total === 1 ? '' : 's'}
                <span className="ml-2 text-zinc-600">
                  · flash <span className="text-emerald-400 tabular-nums">{w.flashTR}</span> / <span className="text-emerald-400 tabular-nums">{w.flashBo}</span>
                </span>
              </div>
            </div>

            <WeeklyRow label="TR" accent="sky" stats={w.tr} />
            <WeeklyRow label="Boulder" accent="fuchsia" stats={w.bo} />

            <div className="mt-2 flex items-center justify-between text-[10px]">
              <span className="text-zinc-500">
                Drills: <span className="tabular-nums text-zinc-300">{w.drillCount}/5</span>
              </span>
              <span className={
                w.hint === 'on-target' ? 'text-emerald-400' :
                w.hint === 'more-focus' ? 'text-amber-400' :
                w.hint === 'ease-focus' ? 'text-rose-400' :
                                          'text-zinc-500'
              }>
                {w.hintText}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}

function WeeklyRow({ label, accent, stats }) {
  const dotClass = accent === 'sky' ? 'bg-sky-400' : 'bg-fuchsia-400';
  return (
    <div className="flex items-center gap-2 text-xs py-0.5">
      <span className={`w-1.5 h-1.5 rounded-full ${dotClass} flex-shrink-0`} />
      <span className="w-14 text-zinc-500 uppercase tracking-wide text-[10px]">{label}</span>
      <div className="flex-1 flex items-center gap-2 tabular-nums text-zinc-300">
        <BucketPill n={stats.focus}    pct={stats.focusPct}    color="orange" />
        <BucketPill n={stats.moderate} pct={stats.moderatePct} color="sky" />
        <BucketPill n={stats.stretch}  pct={stats.stretchPct}  color="rose" />
      </div>
    </div>
  );
}

function BucketPill({ n, pct, color }) {
  const c =
    color === 'orange' ? 'text-orange-300' :
    color === 'sky'    ? 'text-sky-300'    :
                         'text-rose-300';
  return (
    <span className="flex-1 min-w-0">
      <span className={`font-bold ${c}`}>{n}</span>
      <span className="text-[9px] text-zinc-500 ml-1">({pct}%)</span>
    </span>
  );
}

function aggregateWeekly(data) {
  const trAtt = data.grades?.toprope?.attempts || [];
  const boAtt = data.grades?.boulder?.attempts || [];
  const history = data.flashHistory || [];
  // Fallback if history is empty (defensive — ensureShape seeds it, but
  // very old data hydrated before that logic still needs a safe default).
  const fallbackTR = data.flashTR;
  const fallbackBo = data.flashBoulder;

  const weekMap = {};
  const ensureWeek = (weekId) => {
    if (weekMap[weekId]) return weekMap[weekId];
    // Compute week-end (Sunday) to look up historical flash for this week.
    const [y, m, d] = weekId.split('-').map(Number);
    const start = new Date(y, m - 1, d, 12);
    const end = new Date(start); end.setDate(end.getDate() + 6);
    const endStr = `${end.getFullYear()}-${String(end.getMonth()+1).padStart(2,'0')}-${String(end.getDate()).padStart(2,'0')}`;
    const flashTR = flashAt(history, 'toprope', endStr) || fallbackTR;
    const flashBo = flashAt(history, 'boulder', endStr) || fallbackBo;
    weekMap[weekId] = newWeek(weekId, flashTR, flashBo);
    return weekMap[weekId];
  };
  const bucketize = (a, style, weekBucket, weekObj) => {
    const flashGrade = style === 'toprope' ? weekObj.flashTR : weekObj.flashBo;
    const flashOrd = ordinalOf(style, flashGrade);
    const o = ordinalOf(style, a.grade);
    if (o < 0) return;
    if (o === flashOrd) weekBucket.focus++;
    else if (o < flashOrd) weekBucket.moderate++;
    else weekBucket.stretch++;
  };

  for (const a of trAtt) {
    if (!a.weekId) continue;
    const w = ensureWeek(a.weekId);
    bucketize(a, 'toprope', w.tr, w);
    if (a.drillFocus) w.drills.add(a.drillFocus);
  }
  for (const a of boAtt) {
    if (!a.weekId) continue;
    const w = ensureWeek(a.weekId);
    bucketize(a, 'boulder', w.bo, w);
    if (a.drillFocus) w.drills.add(a.drillFocus);
  }

  return Object.values(weekMap)
    .map(finalizeWeek)
    .sort((a, b) => b.weekId.localeCompare(a.weekId));
}

function newWeek(weekId, flashTR, flashBo) {
  return {
    weekId,
    flashTR,
    flashBo,
    tr: { focus: 0, moderate: 0, stretch: 0 },
    bo: { focus: 0, moderate: 0, stretch: 0 },
    drills: new Set(),
  };
}

function finalizeWeek(w) {
  const pct = (s) => {
    const t = s.focus + s.moderate + s.stretch;
    return {
      ...s,
      focusPct:    t ? Math.round(100 * s.focus    / t) : 0,
      moderatePct: t ? Math.round(100 * s.moderate / t) : 0,
      stretchPct:  t ? Math.round(100 * s.stretch  / t) : 0,
    };
  };
  const tr = pct(w.tr);
  const bo = pct(w.bo);
  const total = tr.focus + tr.moderate + tr.stretch + bo.focus + bo.moderate + bo.stretch;
  // Coaching hint uses combined focus %.
  const combinedTotal = total;
  const combinedFocus = tr.focus + bo.focus;
  const focusPct = combinedTotal ? (combinedFocus / combinedTotal) * 100 : 0;
  let hint = 'idle', hintText = '';
  if (combinedTotal > 0) {
    if (focusPct < 15)      { hint = 'more-focus'; hintText = '↑ more focus reps'; }
    else if (focusPct > 40) { hint = 'ease-focus'; hintText = '↓ ease flash volume'; }
    else                    { hint = 'on-target';  hintText = 'On target ✓'; }
  }
  // Human-readable date range for the week
  const [y, m, d] = w.weekId.split('-').map(Number);
  const start = new Date(y, m - 1, d, 12);
  const end = new Date(start); end.setDate(end.getDate() + 6);
  const fmt = (dd) => dd.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  return { ...w, tr, bo, total, drillCount: w.drills.size, hint, hintText, range: `${fmt(start)} – ${fmt(end)}` };
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
