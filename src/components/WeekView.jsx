import { useState } from 'react';
import ProgressRing from './ProgressRing.jsx';
import SessionSheet from './SessionSheet.jsx';
import PhaseJourney from './PhaseJourney.jsx';
import ActivityHeatmap from './ActivityHeatmap.jsx';
import DayDetailSheet from './DayDetailSheet.jsx';
import ExtraSessionSheet from './ExtraSessionSheet.jsx';
import { SESSION_TYPES, SESSION_META, phaseById, isDeloadWeek } from '../data/program.js';
import { useStore } from '../store.jsx';
import { weekId, weekNumber, fmtWeekRange } from '../utils/dates.js';

const COLOR_MAP = {
  orange:  'bg-orange-500/15 text-orange-300 border-orange-500/30',
  amber:   'bg-amber-500/15 text-amber-300 border-amber-500/30',
  rose:    'bg-rose-500/15 text-rose-300 border-rose-500/30',
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
                  <div className="font-semibold text-zinc-100">{s}</div>
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
