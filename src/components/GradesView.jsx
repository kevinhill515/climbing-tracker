import { useState, useMemo } from 'react';
import { useStore } from '../store.jsx';
import { gradesFor, ordinalOf, STYLE_LABELS } from '../data/grades.js';
import GradeLogSheet from './GradeLogSheet.jsx';
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis } from 'recharts';

// Grades tab — the primary motivation metric. Boulder and top rope
// side-by-side. Each shows: highest flash, current project (user-set),
// attempt-to-send ratio at current-flash-adjacent grades, and a
// progression sparkline.
export default function GradesView() {
  const { data, actions } = useStore();
  const [logStyle, setLogStyle] = useState(null);

  if (!data) return null;

  return (
    <div className="px-4 pt-3 pb-24 max-w-xl mx-auto fade-in">
      <div className="flex items-center justify-between mb-3">
        <h1 className="text-xl font-bold text-zinc-100">Grades</h1>
        <div className="text-[11px] text-zinc-500">Flash vs project · attempt-to-send</div>
      </div>

      <StyleCard
        style="boulder"
        data={data.grades.boulder}
        onLog={() => setLogStyle('boulder')}
        onSetProject={(g) => actions.setGradeLevel('boulder', 'project', g)}
      />

      <div className="h-4" />

      <StyleCard
        style="toprope"
        data={data.grades.toprope}
        onLog={() => setLogStyle('toprope')}
        onSetProject={(g) => actions.setGradeLevel('toprope', 'project', g)}
      />

      <GradeLogSheet
        open={!!logStyle}
        style={logStyle}
        onClose={() => setLogStyle(null)}
      />
    </div>
  );
}

function StyleCard({ style, data, onLog, onSetProject }) {
  const list = gradesFor(style);
  const attempts = data.attempts || [];

  // Highest flashed grade — used as the "flash" chip
  const highestFlash = useMemo(() => {
    let best = null;
    let bestIdx = -1;
    for (const a of attempts) {
      if (!a.flash || !a.sent) continue;
      const i = ordinalOf(style, a.grade);
      if (i > bestIdx) { bestIdx = i; best = a.grade; }
    }
    return best;
  }, [attempts, style]);

  // Highest sent (project completion)
  const highestSent = useMemo(() => {
    let best = null;
    let bestIdx = -1;
    for (const a of attempts) {
      if (!a.sent) continue;
      const i = ordinalOf(style, a.grade);
      if (i > bestIdx) { bestIdx = i; best = a.grade; }
    }
    return best;
  }, [attempts, style]);

  // Chart data — for the top ordinal grade attempted, plot best (min tries to send) per date
  const sparkline = useMemo(() => buildProgressSpark(attempts, style), [attempts, style]);

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
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

      {sparkline.length > 1 && (
        <div className="px-4 pt-3 h-24">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={sparkline} margin={{ top: 2, right: 2, bottom: 2, left: 2 }}>
              <YAxis hide domain={['dataMin', 'dataMax']} />
              <XAxis dataKey="date" hide />
              <Line type="monotone" dataKey="v" stroke="#fb923c" strokeWidth={2} dot={{ r: 2, fill: '#fb923c' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Set current project — a small grade-picker */}
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
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      {/* Per-grade breakdown — attempt-to-send ratio + first flash date */}
      {attempts.length > 0 && (
        <div className="px-4 py-3 border-t border-zinc-800/70">
          <div className="text-[10px] uppercase tracking-wide text-zinc-500 mb-1.5">Per-grade history</div>
          <ul className="space-y-1">
            {perGradeStats(attempts, style).map((row) => (
              <li key={row.grade} className="flex items-center justify-between text-xs">
                <span className="w-14 text-zinc-100 font-medium tabular-nums">{row.grade}</span>
                <span className="flex-1 text-zinc-400">
                  {row.sends}/{row.total} sent · {row.flashes} flash{row.flashes === 1 ? '' : 'es'}
                  {row.firstFlashDate && <span className="text-emerald-400"> · first ⚡ {row.firstFlashDate}</span>}
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

function BigGrade({ label, grade, accent }) {
  const colorClass =
    accent === 'emerald' ? 'text-emerald-400' :
    accent === 'orange' ? 'text-orange-400' :
    'text-zinc-300';
  return (
    <div>
      <div className="text-[9px] uppercase tracking-wide text-zinc-500">{label}</div>
      <div className={`text-2xl font-bold tabular-nums ${colorClass}`}>
        {grade || '—'}
      </div>
    </div>
  );
}

// Show grades near the user's current level — flash-adjacent range.
function relevantGrades(list, flash, style) {
  const i = ordinalOf(style, flash);
  const start = Math.max(0, (i < 0 ? 0 : i) - 1);
  const end = Math.min(list.length, start + 6);
  return list.slice(start, end);
}

// Build per-grade rows sorted by ordinal (easiest first)
function perGradeStats(attempts, style) {
  const byGrade = {};
  for (const a of attempts) {
    const g = a.grade;
    if (!byGrade[g]) byGrade[g] = { total: 0, sends: 0, flashes: 0, firstFlashDate: null };
    byGrade[g].total += 1;
    if (a.sent) byGrade[g].sends += 1;
    if (a.flash && a.sent) {
      byGrade[g].flashes += 1;
      if (!byGrade[g].firstFlashDate || a.date < byGrade[g].firstFlashDate) {
        byGrade[g].firstFlashDate = a.date;
      }
    }
  }
  return Object.entries(byGrade)
    .map(([grade, s]) => ({ grade, ...s, ratio: s.total ? s.sends / s.total : 0 }))
    .sort((a, b) => ordinalOf(style, a.grade) - ordinalOf(style, b.grade));
}

// Build a rough progress sparkline — highest sent grade ordinal per day.
function buildProgressSpark(attempts, style) {
  const byDate = new Map();
  for (const a of attempts) {
    if (!a.sent) continue;
    const i = ordinalOf(style, a.grade);
    const cur = byDate.get(a.date);
    if (cur == null || i > cur) byDate.set(a.date, i);
  }
  return [...byDate.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, v]) => ({ date, v }));
}
