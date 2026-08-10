import { useState, useMemo } from 'react';
import { useStore } from '../store.jsx';
import { gradesFor, ordinalOf, STYLE_LABELS, resolveGrade } from '../data/grades.js';
import GradeLogSheet from './GradeLogSheet.jsx';
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import { fmtDate, parseDate } from '../utils/dates.js';

// Grades tab — the primary motivation surface for a top-rope climber.
//
// Layout (user is TR-primary, boulder secondary):
//   1. Top rope card (big, main) — flash / project / sent numbers,
//      weekly trend chart, per-grade breakdown, project picker.
//   2. Boulder strip (compact) — one-line summary with flash + project
//      + sent, tap to expand.
//   3. Recent climbs — flat list of the last 20 climbs across both styles.
//
// Grade + result + name saved via GradeLogSheet (used ONLY from this tab).
// In-session climbs are logged via ClimbLogSheet from SessionSheet.
export default function GradesView() {
  const { data, actions } = useStore();
  const [logStyle, setLogStyle] = useState(null);
  const [boulderOpen, setBoulderOpen] = useState(false);

  if (!data) return null;

  const tr = data.grades.toprope;
  const bo = data.grades.boulder;

  // Recent 20 climbs across both styles, newest first.
  const recent = useMemo(() => {
    const all = [];
    for (const s of ['toprope', 'boulder']) {
      for (const a of (data.grades[s]?.attempts || [])) {
        all.push({ ...a, style: s });
      }
    }
    all.sort((a, b) => (b.date || '').localeCompare(a.date || '') || (b.id || '').localeCompare(a.id || ''));
    return all.slice(0, 20);
  }, [data.grades]);

  return (
    <div className="px-4 pt-3 pb-24 max-w-xl mx-auto fade-in">
      <div className="flex items-center justify-between mb-3">
        <h1 className="text-xl font-bold text-zinc-100">Grades</h1>
        <div className="text-[11px] text-zinc-500">Flash · project · send</div>
      </div>

      {/* TR — primary card, full detail */}
      <StyleCard
        style="toprope"
        data={tr}
        currentFlash={data.flashTR}
        onSetFlash={(g) => actions.setFlashGrade('toprope', g)}
        onLog={() => setLogStyle('toprope')}
        onSetProject={(g) => actions.setGradeLevel('toprope', 'project', g)}
      />

      {/* Boulder — compact strip */}
      <BoulderStrip
        data={bo}
        currentFlash={data.flashBoulder}
        onSetFlash={(g) => actions.setFlashGrade('boulder', g)}
        expanded={boulderOpen}
        onExpand={() => setBoulderOpen((s) => !s)}
        onLog={() => setLogStyle('boulder')}
        onSetProject={(g) => actions.setGradeLevel('boulder', 'project', g)}
      />

      {/* Recent climbs — flat list */}
      <RecentClimbs climbs={recent} onRemove={(style, id) => actions.removeGradeAttempt(style, id)} />

      <GradeLogSheet
        open={!!logStyle}
        style={logStyle}
        onClose={() => setLogStyle(null)}
      />
    </div>
  );
}

// -------------------------- Top rope card --------------------------
function StyleCard({ style, data, currentFlash, onSetFlash, onLog, onSetProject }) {
  const list = gradesFor(style);
  const attempts = data.attempts || [];

  const highestFlash = useMemo(() => hardestBy(attempts, style, (a) => a.flash && a.sent), [attempts, style]);
  const highestSent  = useMemo(() => hardestBy(attempts, style, (a) => a.sent), [attempts, style]);

  // Trend chart: hardest sent grade ordinal per week (last 12 weeks).
  const trend = useMemo(() => buildWeeklyTrend(attempts, style, 12), [attempts, style]);

  const stats = useMemo(() => perGradeStats(attempts, style), [attempts, style]);

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden mb-3">
      <div className="px-4 py-3 flex items-center justify-between border-b border-zinc-800">
        <div>
          <div className="text-[11px] uppercase tracking-wide text-zinc-500">{STYLE_LABELS[style]}</div>
          <div className="mt-1 flex items-baseline gap-3">
            <BigGrade label="Flash" grade={highestFlash} accent="emerald" />
            <BigGrade label="Project" grade={data.project || null} accent="orange" />
            <BigGrade label="Sent" grade={highestSent} accent="zinc" />
          </div>
        </div>
        <button
          onClick={onLog}
          className="bg-orange-500 hover:bg-orange-400 text-zinc-950 font-bold rounded-xl px-4 py-2 text-sm"
        >
          + Log
        </button>
      </div>

      {trend.length > 1 && (
        <div className="px-4 pt-3">
          <div className="text-[10px] uppercase tracking-wide text-zinc-500 mb-1">Hardest sent per week</div>
          <div className="h-24">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trend} margin={{ top: 4, right: 4, bottom: 0, left: 4 }}>
                <YAxis hide domain={['dataMin', 'dataMax']} />
                <XAxis dataKey="label" tick={{ fill: '#71717a', fontSize: 9 }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
                <Tooltip cursor={{ stroke: '#71717a', strokeDasharray: '3 3' }} contentStyle={{ background: '#18181b', border: '1px solid #27272a', fontSize: 11 }} formatter={(v) => list[v] || '—'} labelFormatter={(l) => `Week of ${l}`} />
                <Line type="monotone" dataKey="v" stroke="#fb923c" strokeWidth={2} dot={{ r: 3, fill: '#fb923c' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Current flash — powers session grades */}
      <FlashBumper
        style={style}
        current={currentFlash}
        onSet={onSetFlash}
      />

      {/* Project picker */}
      <div className="px-4 py-3 border-t border-zinc-800/70">
        <div className="text-[10px] uppercase tracking-wide text-zinc-500 mb-1.5">Current project</div>
        <div className="flex flex-wrap gap-1">
          {relevantGrades(list, highestFlash, style).map((g) => (
            <button
              key={g}
              onClick={() => onSetProject(g)}
              className={`px-2 py-1 rounded-md text-[11px] font-medium border tabular-nums ${
                data.project === g
                  ? 'bg-orange-500 text-zinc-950 border-orange-500'
                  : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-zinc-200'
              }`}
            >{g}</button>
          ))}
        </div>
      </div>

      {/* Per-grade breakdown */}
      {stats.length > 0 && (
        <div className="px-4 py-3 border-t border-zinc-800/70">
          <div className="text-[10px] uppercase tracking-wide text-zinc-500 mb-1.5">Per-grade breakdown</div>
          <ul className="space-y-1">
            {stats.map((row) => (
              <li key={row.grade} className="flex items-center justify-between text-xs">
                <span className="w-14 text-zinc-100 font-medium tabular-nums">{row.grade}</span>
                <span className="flex-1 text-zinc-400">
                  {row.total} attempt{row.total === 1 ? '' : 's'} · {row.sends} sent · {row.flashes} flash{row.flashes === 1 ? '' : 'es'}
                </span>
                <span className={`tabular-nums ${row.ratio >= 0.7 ? 'text-emerald-400' : row.ratio >= 0.3 ? 'text-amber-400' : 'text-zinc-500'}`}>
                  {Math.round(row.ratio * 100)}%
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// -------------------------- Flash bumper --------------------------
// Prominent chip at the top of each style card. `current` is the
// user-set flash grade that drives session doses (warmup, ARC, stretch).
// Distinct from the auto-derived "highest ever flashed" — this is what
// they're comfortably flashing NOW, and they own the update.
function FlashBumper({ style, current, onSet }) {
  const down = resolveGrade(style, current, -1);
  const up   = resolveGrade(style, current, +1);
  const canDown = down !== current;
  const canUp   = up !== current;
  return (
    <div className="px-4 py-3 border-t border-zinc-800/70 bg-emerald-500/5">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="text-[10px] uppercase tracking-wide text-emerald-400/80">
            Current flash · powers session grades
          </div>
          <div className="text-lg font-bold text-emerald-300 tabular-nums mt-0.5">
            {current || '—'}
          </div>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <button
            onClick={() => canDown && onSet(down)}
            disabled={!canDown}
            className="w-9 h-9 rounded-lg border border-zinc-700 text-zinc-300 disabled:text-zinc-600 disabled:border-zinc-800 hover:border-zinc-500 text-lg font-bold"
            aria-label="Bump flash down"
          >−</button>
          <button
            onClick={() => canUp && onSet(up)}
            disabled={!canUp}
            className="px-3 h-9 rounded-lg bg-emerald-500 text-zinc-950 disabled:bg-zinc-800 disabled:text-zinc-600 font-bold text-sm"
            aria-label="Bump flash up"
          >Bump ↑</button>
        </div>
      </div>
      <div className="mt-1.5 text-[10px] text-zinc-500 leading-tight">
        Bump when this grade feels easy 3 sessions in a row. Warmup + ARC + stretch attempts all shift with it.
      </div>
    </div>
  );
}

// -------------------------- Boulder compact strip --------------------------
function BoulderStrip({ data, currentFlash, onSetFlash, expanded, onExpand, onLog, onSetProject }) {
  const list = gradesFor('boulder');
  const attempts = data.attempts || [];
  const highestFlash = useMemo(() => hardestBy(attempts, 'boulder', (a) => a.flash && a.sent), [attempts]);
  const highestSent  = useMemo(() => hardestBy(attempts, 'boulder', (a) => a.sent), [attempts]);
  const stats = useMemo(() => perGradeStats(attempts, 'boulder'), [attempts]);

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden mb-3">
      <button
        onClick={onExpand}
        className="w-full px-4 py-3 flex items-center gap-3 hover:bg-zinc-800/40"
      >
        <div className="flex-1 flex items-center gap-3 min-w-0">
          <div className="text-[11px] uppercase tracking-wide text-zinc-500 w-16 text-left">Boulder</div>
          <div className="flex items-baseline gap-2 tabular-nums">
            <SmallGrade grade={highestFlash} accent="emerald" prefix="⚡" />
            <SmallGrade grade={data.project || null} accent="orange" prefix="◎" />
            <SmallGrade grade={highestSent} accent="zinc" prefix="✓" />
          </div>
        </div>
        <span className="text-zinc-500 text-xs">{expanded ? '▲' : '▼'}</span>
      </button>

      {expanded && (
        <div className="border-t border-zinc-800/70">
          <FlashBumper style="boulder" current={currentFlash} onSet={onSetFlash} />
          <div className="px-4 pb-3 pt-3 border-t border-zinc-800/70">
          <div className="flex items-center justify-between mb-2">
            <div className="text-[10px] uppercase tracking-wide text-zinc-500">Current project</div>
            <button onClick={onLog} className="bg-orange-500 hover:bg-orange-400 text-zinc-950 font-bold rounded-lg px-3 py-1 text-xs">+ Log</button>
          </div>
          <div className="flex flex-wrap gap-1 mb-3">
            {relevantGrades(list, highestFlash, 'boulder').map((g) => (
              <button
                key={g}
                onClick={() => onSetProject(g)}
                className={`px-2 py-1 rounded-md text-[11px] font-medium border tabular-nums ${
                  data.project === g
                    ? 'bg-orange-500 text-zinc-950 border-orange-500'
                    : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-zinc-200'
                }`}
              >{g}</button>
            ))}
          </div>
          {stats.length > 0 && (
            <ul className="space-y-1">
              {stats.map((row) => (
                <li key={row.grade} className="flex items-center justify-between text-xs">
                  <span className="w-10 text-zinc-100 font-medium tabular-nums">{row.grade}</span>
                  <span className="flex-1 text-zinc-400">
                    {row.total} attempt{row.total === 1 ? '' : 's'} · {row.sends} sent · {row.flashes} flash{row.flashes === 1 ? '' : 'es'}
                  </span>
                  <span className={`tabular-nums ${row.ratio >= 0.7 ? 'text-emerald-400' : row.ratio >= 0.3 ? 'text-amber-400' : 'text-zinc-500'}`}>
                    {Math.round(row.ratio * 100)}%
                  </span>
                </li>
              ))}
            </ul>
          )}
          </div>
        </div>
      )}
    </div>
  );
}

function SmallGrade({ grade, accent, prefix }) {
  const c = accent === 'emerald' ? 'text-emerald-400' : accent === 'orange' ? 'text-orange-400' : 'text-zinc-300';
  return (
    <div className={`text-sm font-bold ${c}`}>
      <span className="text-[10px] mr-0.5 opacity-70">{prefix}</span>
      {grade || '—'}
    </div>
  );
}

// -------------------------- Recent climbs list --------------------------
function RecentClimbs({ climbs, onRemove }) {
  if (climbs.length === 0) return null;
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
      <div className="px-4 py-2 border-b border-zinc-800 text-xs uppercase tracking-wide text-zinc-500">
        Recent · last {climbs.length}
      </div>
      <ul className="divide-y divide-zinc-800/70">
        {climbs.map((c) => (
          <li key={c.id} className="px-4 py-2 flex items-center gap-2 text-xs">
            <span className="text-[10px] text-zinc-500 w-16 tabular-nums">{c.date}</span>
            <span className={`text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded ${
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
            </div>
            <ResultChip result={c.result} />
            {c.difficulty && <span className="text-[10px] text-zinc-500 tabular-nums flex-shrink-0">{c.difficulty}/10</span>}
            <button
              onClick={() => onRemove(c.style, c.id)}
              className="text-zinc-600 hover:text-rose-400 px-1 flex-shrink-0"
            >×</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ResultChip({ result }) {
  const cfg =
    result === 'flash'    ? { c: 'text-emerald-400', i: '⚡' } :
    result === 'complete' ? { c: 'text-orange-400',  i: '✓' } :
                            { c: 'text-zinc-500',    i: '✗' };
  return <span className={`text-sm ${cfg.c} flex-shrink-0`} title={result}>{cfg.i}</span>;
}

// -------------------------- helpers --------------------------
function BigGrade({ label, grade, accent }) {
  const c =
    accent === 'emerald' ? 'text-emerald-400' :
    accent === 'orange'  ? 'text-orange-400'  :
                           'text-zinc-300';
  return (
    <div>
      <div className="text-[9px] uppercase tracking-wide text-zinc-500">{label}</div>
      <div className={`text-2xl font-bold tabular-nums ${c}`}>{grade || '—'}</div>
    </div>
  );
}

function hardestBy(attempts, style, filterFn) {
  let best = null;
  let bestIdx = -1;
  for (const a of attempts) {
    if (!filterFn(a)) continue;
    const i = ordinalOf(style, a.grade);
    if (i > bestIdx) { bestIdx = i; best = a.grade; }
  }
  return best;
}

function relevantGrades(list, flash, style) {
  const i = ordinalOf(style, flash);
  const start = Math.max(0, (i < 0 ? 0 : i) - 1);
  const end = Math.min(list.length, start + 6);
  return list.slice(start, end);
}

function perGradeStats(attempts, style) {
  const byGrade = {};
  for (const a of attempts) {
    if (!byGrade[a.grade]) byGrade[a.grade] = { total: 0, sends: 0, flashes: 0 };
    byGrade[a.grade].total += 1;
    if (a.sent) byGrade[a.grade].sends += 1;
    if (a.flash && a.sent) byGrade[a.grade].flashes += 1;
  }
  return Object.entries(byGrade)
    .map(([grade, s]) => ({ grade, ...s, ratio: s.total ? s.sends / s.total : 0 }))
    .sort((a, b) => ordinalOf(style, a.grade) - ordinalOf(style, b.grade));
}

// Hardest sent grade ordinal per calendar week, last N weeks including
// the current one. Skips weeks with no sends (linear interp not needed —
// the chart just draws the points we have).
function buildWeeklyTrend(attempts, style, weeks) {
  const byWeek = new Map(); // weekStart (YYYY-MM-DD, Monday) → max ordinal
  for (const a of attempts) {
    if (!a.sent) continue;
    if (!a.date) continue;
    const d = parseDate(a.date);
    const day = d.getDay();
    const diff = (day - 1 + 7) % 7;
    const mon = new Date(d);
    mon.setHours(12, 0, 0, 0);
    mon.setDate(mon.getDate() - diff);
    const key = fmtDate(mon);
    const ord = ordinalOf(style, a.grade);
    const cur = byWeek.get(key);
    if (cur == null || ord > cur) byWeek.set(key, ord);
  }
  return [...byWeek.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-weeks)
    .map(([label, v]) => ({ label, v }));
}
