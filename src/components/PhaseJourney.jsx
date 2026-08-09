import { PHASES } from '../data/program.js';

// Skill-based (not time-based!) phase-progress indicator. Fills the
// current-phase segment fully — user manually advances via Settings
// when they meet the criteria. Segments before the current one show
// as complete; segments after are dim.
export default function PhaseJourney({ currentPhase }) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3 mb-3">
      <div className="flex items-center justify-between mb-2">
        <div className="text-[11px] uppercase tracking-wide text-zinc-500">Journey</div>
        <div className="text-[11px] text-zinc-400">
          Phase {currentPhase} of {PHASES.length}
        </div>
      </div>
      <div className="flex gap-1">
        {PHASES.map((p) => {
          const done = p.id < currentPhase;
          const active = p.id === currentPhase;
          return (
            <div key={p.id} className="flex-1 min-w-0">
              <div className={`h-1.5 rounded overflow-hidden ${done ? 'bg-orange-700' : active ? 'bg-orange-400' : 'bg-zinc-800'}`} />
              <div className={`text-[9px] mt-1 text-center truncate ${active ? 'text-orange-300' : done ? 'text-zinc-400' : 'text-zinc-600'}`}>
                P{p.id}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
