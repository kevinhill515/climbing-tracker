import { useState, useMemo } from 'react';
import ProgressRing from './ProgressRing.jsx';
import SessionSheet from './SessionSheet.jsx';
import PhaseJourney from './PhaseJourney.jsx';
import ActivityHeatmap from './ActivityHeatmap.jsx';
import DayDetailSheet from './DayDetailSheet.jsx';
import ExtraSessionSheet from './ExtraSessionSheet.jsx';
import { SESSION_TYPES, SESSION_META, phaseById, isDeloadWeek } from '../data/program.js';
import { resolveGrade, ordinalOf } from '../data/grades.js';
import { useStore } from '../store.jsx';
import { weekId, weekNumber, fmtWeekRange } from '../utils/dates.js';

const COLOR_MAP = {
  orange:  'bg-orange-500/15 text-orange-300 border-orange-500/30',
  amber:   'bg-amber-500/15 text-amber-300 border-amber-500/30',
  rose:    'bg-rose-500/15 text-rose-300 border-rose-500/30',
  violet:  'bg-violet-500/15 text-violet-300 border-violet-500/30',
};

export default function WeekView() {
  const { data } = useStore();
  const [openSession, setOpenSession] = useState(null);
  const [pickedDate, setPickedDate] = useState(null);
  const [extraOpen, setExtraOpen] = useState(false);

  if (!data) return null;

  const wid = weekId();
  const wkNum = weekNumber(data.startDate);
  const phase = phaseById(data.phaseOverride || data.currentPhase);
  const deload = isDeloadWeek(wkNum, phase.id);

  const myWk = data.weeks?.[wid] || {};
  const doneCount = SESSION_TYPES.filter((s) => myWk[s]).length;

  return (
    <div className="px-4 pt-3 pb-24 max-w-xl mx-auto fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="text-xs text-zinc-500">Week {wkNum} · {fmtWeekRange()}</div>
          <h1 className="text-xl font-bold text-zinc-100 mt-0.5">
            Phase {phase.id} — {phase.name}
          </h1>
          <div className="text-[11px] text-zinc-400 mt-1">
            Target: <span className="text-orange-300 font-medium">{phase.targetBoulder}</span> boulder · <span className="text-orange-300 font-medium">{phase.targetTopRope}</span> top rope
          </div>
        </div>
        {deload && (
          <span className="text-[10px] uppercase tracking-wider bg-amber-500/15 text-amber-300 border border-amber-500/30 rounded-full px-2 py-1">
            Deload
          </span>
        )}
      </div>

      <PhaseJourney currentPhase={phase.id} />

      {/* Weekly progress ring */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex items-center gap-4 mb-4">
        <ProgressRing
          value={doneCount / SESSION_TYPES.length}
          label={`${doneCount}/${SESSION_TYPES.length}`}
          sub="this week"
          size={92}
        />
        <div className="flex-1 min-w-0">
          <div className="text-xs text-zinc-500">This week</div>
          <div className="text-sm text-zinc-300 mt-0.5">
            {doneCount === SESSION_TYPES.length
              ? 'All 3 sessions done 🔥'
              : `${SESSION_TYPES.length - doneCount} session${SESSION_TYPES.length - doneCount === 1 ? '' : 's'} left`}
          </div>
          <div className="text-[11px] text-zinc-500 mt-2 leading-relaxed">
            Fingers need 48h between hard sessions — plan a rest day between each.
          </div>
        </div>
      </div>

      <WeeklyScorecard data={data} wid={wid} />

      {/* Session cards — the 3 target protocol sessions per week */}
      <div className="space-y-2.5">
        {SESSION_TYPES.map((s) => {
          const done = !!myWk[s];
          const meta = SESSION_META[s];
          return (
            <button
              key={s}
              onClick={() => setOpenSession(s)}
              className={`w-full text-left bg-zinc-900 border rounded-2xl p-4 flex items-start gap-3 transition active:scale-[0.99] ${
                done ? 'border-orange-500/40' : 'border-zinc-800 hover:border-zinc-700'
              }`}
            >
              <div className={`w-11 h-11 rounded-xl border flex items-center justify-center text-lg flex-shrink-0 ${COLOR_MAP[meta.color]}`}>
                {meta.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <div className="font-semibold text-zinc-100">{meta.name}</div>
                  <div className="text-[10px] text-zinc-500 flex-shrink-0">{meta.time}</div>
                </div>
                <div className="text-xs text-zinc-400 mt-0.5 leading-snug">{meta.focus}</div>
              </div>
              <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition flex-shrink-0 mt-0.5 ${
                done ? 'bg-orange-500 border-orange-500 text-zinc-950' : 'border-zinc-700 text-transparent'
              }`}>
                ✓
              </div>
            </button>
          );
        })}
      </div>

      {/* Extra sessions this week + a button to log a bonus climb day */}
      <ExtraSessionsRow
        sessions={data.sessions || []}
        wid={wid}
        onLog={() => setExtraOpen(true)}
      />

      {/* Activity heatmap — tap a cell to see that day's logs */}
      <div className="mt-4">
        <ActivityHeatmap
          sessions={data.sessions || []}
          attempts={[
            ...(data.grades?.boulder?.attempts || []),
            ...(data.grades?.toprope?.attempts || []),
          ]}
          onPickDate={(d) => setPickedDate(d)}
        />
      </div>

      {/* Phase context */}
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-4 mb-3">
        <div className="text-xs uppercase tracking-wide text-zinc-500 mb-1">Phase goal</div>
        <p className="text-sm text-zinc-300 leading-relaxed">{phase.goal}</p>
      </div>

      {/* Principles / reminders — climbing-specific coaching cues */}
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-4">
        <div className="text-xs uppercase tracking-wide text-zinc-500 mb-2">Principles this phase</div>
        <ul className="space-y-1.5">
          {phase.principles.map((p, i) => (
            <li key={i} className="text-xs text-zinc-400 leading-relaxed flex gap-2">
              <span className="text-orange-400 flex-shrink-0">•</span>
              <span>{p}</span>
            </li>
          ))}
        </ul>
      </div>

      <SessionSheet
        open={!!openSession}
        sessionType={openSession}
        phase={phase}
        onClose={() => setOpenSession(null)}
      />

      <DayDetailSheet
        open={!!pickedDate}
        date={pickedDate}
        onClose={() => setPickedDate(null)}
      />

      <ExtraSessionSheet
        open={extraOpen}
        onClose={() => setExtraOpen(false)}
      />
    </div>
  );
}

// Weekly scorecard — what actually happened this week, broken out by the
// Bechtel/Hörst intensity buckets so you can see the mix at a glance.
//
//   Focus reps    = TR attempts at current flash grade (efficiency work)
//   Moderate      = TR attempts 2-3 grades below flash (ARC + warmup)
//   Stretch       = TR attempts above flash (stretch attempts / real projecting)
//   Boulders      = all boulder attempts this week
//   Drills        = unique drill keys practiced this week (silent-feet, drop-knee, …)
function WeeklyScorecard({ data, wid }) {
  const flashTR = data.flashTR;
  const stats = useMemo(() => {
    const trAttempts = (data.grades?.toprope?.attempts || []).filter((a) => a.weekId === wid);
    const boAttempts = (data.grades?.boulder?.attempts || []).filter((a) => a.weekId === wid);
    const flashOrd = ordinalOf('toprope', flashTR);
    let focus = 0, moderate = 0, stretch = 0;
    const drills = new Set();
    for (const a of trAttempts) {
      const o = ordinalOf('toprope', a.grade);
      if (o < 0) continue;
      if (o === flashOrd) focus++;
      else if (o < flashOrd) moderate++;
      else stretch++;
      if (a.drillFocus) drills.add(a.drillFocus);
    }
    // Bechtel/Hörst target ratios — reference for the UI hint
    const total = focus + moderate + stretch;
    const focusPct    = total ? Math.round((focus    / total) * 100) : 0;
    const moderatePct = total ? Math.round((moderate / total) * 100) : 0;
    const stretchPct  = total ? Math.round((stretch  / total) * 100) : 0;
    return {
      focus, moderate, stretch,
      focusPct, moderatePct, stretchPct,
      total,
      boulders: boAttempts.length,
      drills: drills.size,
    };
  }, [data.grades, wid, flashTR]);

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden mb-4">
      <div className="px-4 py-2.5 border-b border-zinc-800 flex items-center justify-between">
        <div className="text-xs uppercase tracking-wide text-zinc-400 font-medium">This week</div>
        <div className="text-[10px] text-zinc-500">flash: <span className="text-emerald-300 tabular-nums">{flashTR}</span></div>
      </div>
      <div className="p-3 grid grid-cols-3 gap-2">
        <StatBox
          label="Focus reps"
          hint={`@ ${flashTR}`}
          value={stats.focus}
          pct={stats.focusPct}
          targetPct="20-30%"
          accent="orange"
        />
        <StatBox
          label="Moderate"
          hint="below flash"
          value={stats.moderate}
          pct={stats.moderatePct}
          targetPct="60-70%"
          accent="sky"
        />
        <StatBox
          label="Stretch"
          hint="above flash"
          value={stats.stretch}
          pct={stats.stretchPct}
          targetPct="5-10%"
          accent="rose"
        />
      </div>
      <div className="px-3 pb-3 grid grid-cols-2 gap-2">
        <MiniStat label="Boulders" value={stats.boulders} />
        <MiniStat label="Drills practiced" value={stats.drills > 0 ? `${stats.drills} of 5` : '0'} />
      </div>
      {stats.total > 0 && (
        <div className="px-4 pb-3 text-[10px] text-zinc-500 leading-tight">
          Bechtel/Hörst mix: 60-70% moderate · 20-30% flash · 5-10% stretch.{' '}
          {stats.focusPct >= 20 && stats.focusPct <= 35 ? 'On target for focus reps ✓' : stats.focusPct < 20 ? '↑ more focus reps at flash' : '↓ ease the flash volume'}
        </div>
      )}
    </div>
  );
}

function StatBox({ label, hint, value, pct, targetPct, accent }) {
  const accentClass =
    accent === 'orange' ? 'text-orange-300' :
    accent === 'sky'    ? 'text-sky-300'    :
    accent === 'rose'   ? 'text-rose-300'   : 'text-zinc-300';
  return (
    <div className="bg-zinc-800/50 rounded-lg p-2.5 min-w-0">
      <div className="text-[9px] uppercase tracking-wide text-zinc-500 truncate">{label}</div>
      <div className="text-[9px] text-zinc-600 truncate">{hint}</div>
      <div className={`text-lg font-bold tabular-nums ${accentClass} mt-0.5`}>{value}</div>
      <div className="text-[9px] text-zinc-500 tabular-nums">
        {pct}% <span className="text-zinc-600">· goal {targetPct}</span>
      </div>
    </div>
  );
}

function MiniStat({ label, value }) {
  return (
    <div className="bg-zinc-800/30 rounded-lg p-2 flex items-baseline justify-between">
      <span className="text-[10px] uppercase tracking-wide text-zinc-500">{label}</span>
      <span className="text-sm font-bold text-zinc-100 tabular-nums">{value}</span>
    </div>
  );
}

// Small counter + "+ Log extra session" button, sitting below the
// 3 target session cards. Shows count of bonus sessions this week.
function ExtraSessionsRow({ sessions, wid, onLog }) {
  const extraThisWeek = sessions.filter((s) => s.isExtra && s.weekId === wid).length;
  return (
    <div className="mt-2.5">
      {extraThisWeek > 0 && (
        <div className="text-[11px] text-zinc-500 mb-1.5 text-center">
          + <span className="text-orange-300 font-medium">{extraThisWeek}</span> extra session{extraThisWeek === 1 ? '' : 's'} logged this week
        </div>
      )}
      <button
        onClick={onLog}
        className="w-full text-sm text-zinc-400 hover:text-zinc-100 border border-dashed border-zinc-700 hover:border-zinc-500 rounded-2xl py-3"
      >
        + Log extra session
      </button>
    </div>
  );
}
