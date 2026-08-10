import { useStore } from '../store.jsx';
import { PHASES, phaseById } from '../data/program.js';
import { gradesFor, ordinalOf } from '../data/grades.js';
import { useMemo } from 'react';

// Milestones tab — big-picture progression outside of raw grade numbers.
// Some items auto-populate (first flash per grade, phase completion dates,
// counters). Others are self-affirmed (lead cert, outdoor prep, drill
// mastery). Locked sections show a hint until the relevant phase.
export default function MilestonesView() {
  const { data, actions } = useStore();
  if (!data) return null;

  const currentPhase = data.phaseOverride || data.currentPhase;

  // ---- auto-tracked: first flash / first send per grade ----
  const trFirsts = useMemo(() => computeFirsts(data.grades.toprope.attempts, 'toprope'), [data.grades.toprope]);
  const boFirsts = useMemo(() => computeFirsts(data.grades.boulder.attempts, 'boulder'), [data.grades.boulder]);

  // ---- counters ----
  const arcCount = data.logs.filter((l) => l.exerciseId === 'arc-training').length;
  const fourByFourCount = data.logs.filter((l) => l.exerciseId === 'four-by-four').length;
  const totalClimbsLogged =
    (data.grades.toprope.attempts?.length || 0) + (data.grades.boulder.attempts?.length || 0);

  const lead = data.milestones?.lead || {};
  const outdoor = data.milestones?.outdoor || {};
  const drills = data.milestones?.drills || {};

  // Drill session counts from logged drillFocus on grade attempts.
  // Counts UNIQUE date+sessionType combos, not raw attempts — 5 attempts of
  // silent-feet in one session count as 1 drilled session, not 5.
  const drillCounts = useMemo(() => {
    // exercise kebab-key → milestones camel key
    const drillKeyMap = {
      'silent-feet':      'silentFeet',
      'drop-knee':        'dropKnee',
      'flag':             'flag',
      'hand-foot-match':  'handFootMatch',
      'outside-edge':     'outsideEdge',
    };
    const seen = { silentFeet: new Set(), dropKnee: new Set(), flag: new Set(), handFootMatch: new Set(), outsideEdge: new Set() };
    const allAttempts = [
      ...(data.grades.toprope.attempts || []),
      ...(data.grades.boulder.attempts || []),
    ];
    for (const a of allAttempts) {
      const key = drillKeyMap[a.drillFocus];
      if (!key) continue;
      const sessionKey = `${a.date}|${a.sessionType || '-'}`;
      seen[key].add(sessionKey);
    }
    return Object.fromEntries(Object.entries(seen).map(([k, s]) => [k, s.size]));
  }, [data.grades]);

  // Threshold for auto-mastery suggestion — 8 unique drilled sessions is
  // roughly 2 months of weekly drilling on Movement day.
  const MASTERY_THRESHOLD = 8;

  return (
    <div className="px-4 pt-3 pb-24 max-w-xl mx-auto fade-in">
      <h1 className="text-xl font-bold text-zinc-100 mb-1">Milestones</h1>
      <p className="text-xs text-zinc-500 mb-4">The wins that live outside of grade numbers.</p>

      {/* Phase timeline */}
      <Card title="Phase timeline">
        <ol className="space-y-1.5">
          {PHASES.map((p) => {
            const done = p.id < currentPhase;
            const active = p.id === currentPhase;
            const doneDate = data.milestones?.phaseCompletions?.[p.id];
            return (
              <li key={p.id} className="flex items-center gap-3 text-xs">
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 ${
                  done ? 'bg-emerald-500 text-zinc-950' :
                  active ? 'bg-orange-500 text-zinc-950' :
                  'bg-zinc-800 text-zinc-500 border border-zinc-700'
                }`}>
                  {done ? '✓' : p.id}
                </span>
                <div className="flex-1 min-w-0">
                  <div className={`${active ? 'text-orange-300 font-medium' : done ? 'text-zinc-100' : 'text-zinc-500'}`}>
                    Phase {p.id} — {p.name}
                  </div>
                  <div className="text-[10px] text-zinc-500">Target: {p.targetTopRope} · {p.targetBoulder}</div>
                </div>
                {doneDate && <span className="text-[10px] text-zinc-400 tabular-nums flex-shrink-0">{doneDate}</span>}
              </li>
            );
          })}
        </ol>
      </Card>

      {/* First flash per grade — TR */}
      <Card title="First flash — Top rope">
        <FirstsGrid firsts={trFirsts.firstFlash} style="toprope" tint="emerald" placeholder="Log a flash on the Grades tab" />
      </Card>

      {/* First flash per grade — Boulder (compact) */}
      <Card title="First flash — Boulder">
        <FirstsGrid firsts={boFirsts.firstFlash} style="boulder" tint="emerald" placeholder="Log a flash on the Grades tab" />
      </Card>

      {/* Lead cert — locked until Phase 3 */}
      <Card
        title="Lead climb certification"
        locked={currentPhase < 3}
        lockedNote="Unlocks at Phase 3 — Lead Introduction."
        badge={lead.certifiedDate ? { text: `✓ ${lead.certifiedDate}`, tint: 'emerald' } : null}
      >
        <ul className="space-y-2">
          {[
            { key: 'fallsComfortable',   label: 'Controlled falls comfortable at 2–3 bolts up' },
            { key: 'clipMechanicSolid',  label: 'Clip mechanic solid (fold-back grip, clean stances)' },
            { key: 'gymCertPassed',      label: 'Gym practical exam passed' },
            { key: 'gymCardIssued',      label: 'Physical lead card / badge issued' },
          ].map((row) => (
            <Checkbox
              key={row.key}
              checked={!!lead.subitems?.[row.key]}
              label={row.label}
              onToggle={() => actions.toggleLeadSubitem(row.key)}
            />
          ))}
        </ul>
      </Card>

      {/* Outdoor prep — locked until Phase 5 */}
      <Card
        title="Outdoor prep"
        locked={currentPhase < 5}
        lockedNote="Unlocks at Phase 5 — Outdoor Prep."
      >
        <ul className="space-y-2">
          <Checkbox
            checked={outdoor.anchorBuildingDone}
            label="Anchor building drilled (SERENE anchor from a ground rehearsal)"
            onToggle={() => actions.toggleOutdoorFlag('anchorBuildingDone')}
          />
          <Checkbox
            checked={outdoor.cleaningDone}
            label="Cleaning drilled (rappel + top-rope-solo cleaning)"
            onToggle={() => actions.toggleOutdoorFlag('cleaningDone')}
          />
          <DateRow
            label="First outdoor climb"
            date={outdoor.firstOutdoorClimb}
            onChange={(d) => actions.setOutdoorDate('firstOutdoorClimb', d)}
          />
          <DateRow
            label="First outdoor lead"
            date={outdoor.firstOutdoorLead}
            onChange={(d) => actions.setOutdoorDate('firstOutdoorLead', d)}
          />
          <DateRow
            label="First multi-pitch"
            date={outdoor.firstMultiPitch}
            onChange={(d) => actions.setOutdoorDate('firstMultiPitch', d)}
          />
        </ul>
      </Card>

      {/* Technique drills — self-affirmed mastery with auto session counter */}
      <Card title="Technique drills mastered">
        <p className="text-[10px] text-zinc-500 mb-2 leading-tight">
          Count = unique sessions where you drilled it. Mark mastered when the pattern feels automatic under load — {MASTERY_THRESHOLD}+ sessions is the rough threshold.
        </p>
        <ul className="space-y-2">
          {[
            { key: 'silentFeet',    label: 'Silent feet' },
            { key: 'dropKnee',      label: 'Drop knee' },
            { key: 'flag',          label: 'Flag' },
            { key: 'handFootMatch', label: 'Hand-foot match' },
            { key: 'outsideEdge',   label: 'Outside edge / hip-in' },
          ].map((row) => {
            const count = drillCounts[row.key] || 0;
            const readyForMastery = count >= MASTERY_THRESHOLD && !drills[row.key];
            return (
              <li key={row.key} className="flex items-center gap-2">
                <div className="flex-1 min-w-0">
                  <Checkbox
                    checked={!!drills[row.key]}
                    label={row.label}
                    onToggle={() => actions.toggleDrillMastery(row.key)}
                  />
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <span className={`text-[10px] tabular-nums font-semibold rounded px-1.5 py-0.5 ${
                    count === 0 ? 'text-zinc-600 bg-zinc-800/50' :
                    readyForMastery ? 'text-emerald-300 bg-emerald-500/20 border border-emerald-500/40' :
                    'text-orange-300 bg-orange-500/15'
                  }`}>
                    {count}× drilled
                  </span>
                  {readyForMastery && (
                    <span className="text-[10px] text-emerald-400" title="Ready to mark mastered">→</span>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </Card>

      {/* Counters — the little stats */}
      <Card title="Counters">
        <div className="grid grid-cols-3 gap-2">
          <Counter n={totalClimbsLogged} label="climbs logged" />
          <Counter n={arcCount} label="ARC sessions" />
          <Counter n={fourByFourCount} label="4x4 workouts" />
        </div>
      </Card>
    </div>
  );
}

function Card({ title, badge, children, locked, lockedNote }) {
  return (
    <div className={`bg-zinc-900 border border-zinc-800 rounded-2xl mb-3 ${locked ? 'opacity-60' : ''}`}>
      <div className="px-4 py-2.5 border-b border-zinc-800 flex items-center justify-between">
        <div className="text-xs uppercase tracking-wide text-zinc-400 font-medium">{title}</div>
        {badge && (
          <span className={`text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded ${
            badge.tint === 'emerald' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-zinc-800 text-zinc-400'
          }`}>{badge.text}</span>
        )}
      </div>
      <div className="p-4">
        {locked ? (
          <div className="text-xs text-zinc-500 italic">🔒 {lockedNote}</div>
        ) : children}
      </div>
    </div>
  );
}

function FirstsGrid({ firsts, style, tint = 'emerald', placeholder }) {
  const list = gradesFor(style);
  const entries = list
    .map((g) => ({ g, date: firsts[g] }))
    .filter((e) => e.date);
  if (entries.length === 0) {
    return <div className="text-xs text-zinc-500 italic">{placeholder}</div>;
  }
  return (
    <ul className="space-y-1">
      {entries.map((e) => (
        <li key={e.g} className="flex items-center justify-between text-xs">
          <span className={`w-16 tabular-nums font-medium ${tint === 'emerald' ? 'text-emerald-400' : 'text-zinc-300'}`}>{e.g}</span>
          <span className="text-[10px] uppercase tracking-wide text-zinc-500">first ⚡</span>
          <span className="tabular-nums text-zinc-400 flex-1 text-right">{e.date}</span>
        </li>
      ))}
    </ul>
  );
}

function Checkbox({ checked, label, onToggle }) {
  return (
    <li>
      <button
        onClick={onToggle}
        className={`w-full text-left flex items-start gap-3 px-3 py-2 rounded-xl border transition ${
          checked
            ? 'bg-orange-500/15 border-orange-500/40 text-orange-200'
            : 'bg-zinc-800/50 border-zinc-700 text-zinc-300 hover:bg-zinc-800'
        }`}
      >
        <span className={`w-5 h-5 rounded border-2 flex-shrink-0 flex items-center justify-center text-xs mt-0.5 ${
          checked ? 'bg-orange-500 border-orange-500 text-zinc-950' : 'border-zinc-600'
        }`}>{checked ? '✓' : ''}</span>
        <span className="text-sm leading-relaxed">{label}</span>
      </button>
    </li>
  );
}

function DateRow({ label, date, onChange }) {
  return (
    <li className="flex items-center gap-2 text-sm">
      <span className="flex-1 text-zinc-300">{label}</span>
      <input
        type="date"
        value={date || ''}
        onChange={(e) => onChange(e.target.value || null)}
        className="bg-zinc-800 border border-zinc-700 rounded-md px-2 py-1 text-xs text-zinc-100"
      />
      {date && (
        <button onClick={() => onChange(null)} className="text-zinc-600 hover:text-rose-400 text-xs">×</button>
      )}
    </li>
  );
}

function Counter({ n, label }) {
  return (
    <div className="rounded-xl bg-zinc-800/60 border border-zinc-700 p-2 text-center">
      <div className="text-xl font-bold text-orange-300 tabular-nums">{n}</div>
      <div className="text-[10px] uppercase tracking-wide text-zinc-500">{label}</div>
    </div>
  );
}

function computeFirsts(attempts, style) {
  const firstFlash = {};
  const firstSend = {};
  for (const a of attempts || []) {
    if (a.sent && a.flash && a.grade) {
      if (!firstFlash[a.grade] || a.date < firstFlash[a.grade]) firstFlash[a.grade] = a.date;
    }
    if (a.sent && a.grade) {
      if (!firstSend[a.grade] || a.date < firstSend[a.grade]) firstSend[a.grade] = a.date;
    }
  }
  return { firstFlash, firstSend };
}
