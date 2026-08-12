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

      {/* This week — same shape as PhaseJourney above (thin bar-row card).
          Four segments, one per session; orange when done, dim otherwise.
          Full session name below each bar, tightly sized to fit. */}
      <ThisWeekTile
        myWk={myWk}
        doneCount={doneCount}
        drillCount={weekDrillCount(data, wid)}
      />

      {/* Session cards go BEFORE the analytics scorecards — the primary
          action (which session to do next) should be the first thing
          visible without scrolling. Scorecards follow below.
          Tightened so all 4 fit on screen: smaller padding, single-line
          focus text, smaller icon + check circle. */}
      <div className="space-y-2">
        {SESSION_TYPES.map((s) => {
          const done = !!myWk[s];
          const meta = SESSION_META[s];
          return (
            <button
              key={s}
              onClick={() => setOpenSession(s)}
              className={`w-full text-left bg-zinc-900 border rounded-xl px-3 py-2.5 flex items-center gap-3 transition active:scale-[0.99] ${
                done ? 'border-orange-500/40' : 'border-zinc-800 hover:border-zinc-700'
              }`}
            >
              <div className={`w-9 h-9 rounded-lg border flex items-center justify-center text-base flex-shrink-0 ${COLOR_MAP[meta.color]}`}>
                {meta.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline justify-between gap-2">
                  <div className="font-semibold text-zinc-100 text-sm">{meta.name}</div>
                  <div className="text-[10px] text-zinc-500 flex-shrink-0 tabular-nums">{meta.time}</div>
                </div>
                <div className="text-[11px] text-zinc-400 leading-tight truncate">{meta.focus}</div>
              </div>
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition flex-shrink-0 text-xs ${
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

      {/* Weekly scorecards — below sessions so scroll gets you to
          analytics without hiding the primary action. */}
      <div className="mt-4">
        <WeeklyScorecard data={data} wid={wid} style="toprope" />
        <WeeklyScorecard data={data} wid={wid} style="boulder" />
      </div>

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

// Slim "This week" tile — matches PhaseJourney's shape (bar + label row),
// one segment per session with the full session name. Drill count sits
// in the header on the right — one authoritative number, no per-style
// duplication.
function ThisWeekTile({ myWk, doneCount, drillCount }) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3 mb-3">
      <div className="flex items-center justify-between mb-2">
        <div className="text-[11px] uppercase tracking-wide text-zinc-500">This week</div>
        <div className="flex items-center gap-3 text-[11px] text-zinc-400">
          <span>{doneCount} of {SESSION_TYPES.length}</span>
          <span className="text-zinc-600">·</span>
          <span>drills <span className="tabular-nums text-zinc-300">{drillCount}/5</span></span>
        </div>
      </div>
      <div className="flex gap-1">
        {SESSION_TYPES.map((s) => {
          const done = !!myWk[s];
          const meta = SESSION_META[s];
          return (
            <div key={s} className="flex-1 min-w-0">
              <div className={`h-1.5 rounded overflow-hidden ${done ? 'bg-orange-400' : 'bg-zinc-800'}`} />
              <div className={`text-[9px] mt-1 text-center truncate ${done ? 'text-orange-300' : 'text-zinc-600'}`}>
                {meta.name}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Unique drills practiced this week, aggregated across TR + boulder —
// used by ThisWeekTile so the number lives in ONE place, not repeated
// on both scorecards.
function weekDrillCount(data, wid) {
  const drills = new Set();
  for (const style of ['toprope', 'boulder']) {
    for (const a of (data.grades?.[style]?.attempts || [])) {
      if (a.weekId === wid && a.drillFocus) drills.add(a.drillFocus);
    }
  }
  return drills.size;
}

// Weekly scorecard — what actually happened this week, broken out by the
// Bechtel/Hörst intensity buckets so you can see the mix at a glance.
// Runs per-style (toprope / boulder) — one card each.
//
//   Focus reps    = attempts at current flash grade (efficiency / limit work)
//   Moderate      = attempts below flash (ARC + warmup + volume)
//   Stretch       = attempts above flash (stretch attempts / real projecting)
//   Drills        = unique drill keys practiced this week (both styles combined —
//                   drills carry over, only shown on the TR card to avoid
//                   double-counting)
function WeeklyScorecard({ data, wid, style }) {
  const isTR = style === 'toprope';
  const flash = isTR ? data.flashTR : data.flashBoulder;
  const label = isTR ? 'Top rope' : 'Boulder';
  const styleAccent = isTR ? 'sky' : 'fuchsia';

  const stats = useMemo(() => {
    const attempts = (data.grades?.[style]?.attempts || []).filter((a) => a.weekId === wid);
    const flashOrd = ordinalOf(style, flash);
    let focus = 0, moderate = 0, stretch = 0;
    // Success at the FOCUS grade specifically — the metric that actually
    // tells you whether the flash grade is set right. High success rate
    // at flash = the bump signal.
    let focusFlashes = 0, focusCompletes = 0;
    for (const a of attempts) {
      const o = ordinalOf(style, a.grade);
      if (o < 0) continue;
      if (o === flashOrd) {
        focus++;
        if (a.flash && a.sent) focusFlashes++;
        else if (a.sent) focusCompletes++;
      }
      else if (o < flashOrd) moderate++;
      else stretch++;
    }
    const total = focus + moderate + stretch;
    const focusPct    = total ? Math.round((focus    / total) * 100) : 0;
    const moderatePct = total ? Math.round((moderate / total) * 100) : 0;
    const stretchPct  = total ? Math.round((stretch  / total) * 100) : 0;
    return {
      focus, moderate, stretch,
      focusPct, moderatePct, stretchPct,
      focusFlashes, focusCompletes,
      total,
    };
  }, [data.grades, wid, style, flash]);

  const styleChipClass =
    styleAccent === 'sky' ? 'text-sky-300 bg-sky-500/15 border-sky-500/30'
                          : 'text-fuchsia-300 bg-fuchsia-500/15 border-fuchsia-500/30';

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden mb-4">
      <div className="px-4 py-2.5 border-b border-zinc-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded border ${styleChipClass}`}>{label}</span>
          <div className="text-xs uppercase tracking-wide text-zinc-400 font-medium">This week</div>
        </div>
        <div className="text-[10px] text-zinc-500">flash: <span className="text-emerald-300 tabular-nums">{flash}</span></div>
      </div>
      <div className="p-3 grid grid-cols-3 gap-2">
        <StatBox
          label="Focus reps"
          hint={`@ ${flash}`}
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
      <ScorecardHint stats={stats} flash={flash} />
    </div>
  );
}

// Hint reflects your ACTUAL performance, not just volume distribution.
// Flashing most of your focus routes is a bump signal, NOT a "too much at
// limit" signal — if you're flashing it, it's not at your limit.
function ScorecardHint({ stats, flash }) {
  if (stats.total < 3) return null; // too little data to hint yet
  const { focus, focusFlashes, focusPct } = stats;
  const flashRate = focus > 0 ? focusFlashes / focus : 0;

  // Strong bump signal: 3+ flashes AT flash grade AND majority flashed
  if (focusFlashes >= 3 && flashRate >= 0.5) {
    return (
      <div className="px-4 pb-3 text-[10px] leading-tight text-emerald-400">
        ↑ You flashed {focusFlashes} at {flash} — try bumping your flash grade
      </div>
    );
  }
  // Not enough focus reps — user needs to test themselves at flash
  if (focusPct < 20) {
    return (
      <div className="px-4 pb-3 text-[10px] leading-tight text-amber-400">
        ↑ Add more attempts at {flash} — you're mostly climbing below flash
      </div>
    );
  }
  // Focus reps present but not flashing them — good hard work, no bump yet
  if (focus > 0 && flashRate < 0.3) {
    return (
      <div className="px-4 pb-3 text-[10px] leading-tight text-zinc-400">
        Focus routes are challenging you — keep drilling before bumping
      </div>
    );
  }
  return (
    <div className="px-4 pb-3 text-[10px] leading-tight text-emerald-400">
      ✓ Good balance of hard vs easy climbs this week
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
