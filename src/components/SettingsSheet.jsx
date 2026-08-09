import Sheet from './Sheet.jsx';
import { useStore } from '../store.jsx';
import { PHASES, phaseById } from '../data/program.js';
import { SUPA_CONFIGURED } from '../api/supabase.js';
import { useState } from 'react';

// Settings — start date, phase override, phase advancement with
// self-affirmed criteria, sync controls.
export default function SettingsSheet({ open, onClose }) {
  const { data, actions } = useStore();
  const [advanceOpen, setAdvanceOpen] = useState(false);

  if (!data) return null;
  const currentPhase = phaseById(data.phaseOverride || data.currentPhase);

  return (
    <Sheet open={open} onClose={onClose} title="Settings" fullHeight>
      <div className="px-5 py-4 space-y-6">
        {/* Sync status */}
        <Section title="Sync">
          {SUPA_CONFIGURED ? (
            <div className="text-sm text-zinc-300 bg-orange-500/10 border border-orange-500/30 rounded-xl p-3">
              ✓ Connected to Supabase. Changes auto-sync between devices.
            </div>
          ) : (
            <div className="text-sm text-amber-300 bg-amber-500/10 border border-amber-500/30 rounded-xl p-3">
              ⚠ No Supabase credentials. Data is local only.
            </div>
          )}
          <button onClick={() => actions.pull()} className="mt-2 w-full bg-zinc-800 hover:bg-zinc-700 rounded-xl py-2.5 text-sm text-zinc-200">
            Refresh from cloud
          </button>
          <button
            onClick={async () => {
              if (!confirm('Overwrite this device with the cloud copy?')) return;
              const ok = await actions.forceRestoreFromCloud();
              alert(ok ? 'Restored.' : 'Could not reach cloud.');
            }}
            className="mt-2 w-full bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 rounded-xl py-2.5 text-sm"
          >
            Force restore from cloud
          </button>
        </Section>

        {/* Program start */}
        <Section title="Program start" sub="Week counter counts from this date">
          <input
            type="date"
            value={data.startDate}
            onChange={(e) => actions.setStartDate(e.target.value)}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2.5 text-sm text-zinc-100"
          />
        </Section>

        {/* Current phase */}
        <Section title={`Phase ${currentPhase.id} — ${currentPhase.name}`} sub={`Target: ${currentPhase.targetBoulder} boulder · ${currentPhase.targetTopRope} top rope`}>
          <button
            onClick={() => setAdvanceOpen(true)}
            className="w-full bg-orange-500 hover:bg-orange-400 text-zinc-950 font-bold rounded-xl py-3"
          >
            Check readiness to advance →
          </button>
          <div className="text-[11px] text-zinc-500 mt-2 leading-relaxed">
            Phases are skill-based. Only advance when you meet all criteria — this program does NOT run on a clock.
          </div>
        </Section>

        {/* Phase override */}
        <Section title="Manual phase" sub="Override the current phase (for testing or reset)">
          <div className="grid grid-cols-6 gap-2">
            {PHASES.map((p) => (
              <button
                key={p.id}
                onClick={() => actions.setPhaseOverride(p.id === data.currentPhase ? null : p.id)}
                className={`py-2 rounded-lg text-sm border ${
                  (data.phaseOverride || data.currentPhase) === p.id
                    ? 'bg-zinc-100 text-zinc-950 border-zinc-100'
                    : 'bg-zinc-800 border-zinc-700 text-zinc-300'
                }`}
              >
                P{p.id}
              </button>
            ))}
          </div>
        </Section>

        {/* Export data */}
        <Section title="Data">
          <button
            onClick={() => {
              const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `climb-${new Date().toISOString().slice(0,10)}.json`;
              a.click();
              URL.revokeObjectURL(url);
            }}
            className="w-full bg-zinc-800 hover:bg-zinc-700 rounded-xl py-2.5 text-sm text-zinc-200"
          >
            Export JSON
          </button>
        </Section>

        {/* App */}
        <Section title="App">
          <button
            onClick={() => {
              if ('caches' in window) caches.keys().then((ks) => ks.forEach((k) => caches.delete(k)));
              location.reload();
            }}
            className="w-full bg-zinc-800 hover:bg-zinc-700 rounded-xl py-2.5 text-sm text-zinc-200"
          >
            Reload app (clear cache)
          </button>
        </Section>
      </div>

      <AdvanceSheet
        open={advanceOpen}
        onClose={() => setAdvanceOpen(false)}
        phase={currentPhase}
        onAdvance={() => {
          actions.advancePhase();
          setAdvanceOpen(false);
        }}
      />
    </Sheet>
  );
}

function AdvanceSheet({ open, onClose, phase, onAdvance }) {
  const [checked, setChecked] = useState({});
  const nextPhase = PHASES.find((p) => p.id === phase.id + 1);
  const allChecked = phase.criteria.every((_, i) => checked[i]);

  return (
    <Sheet open={open} onClose={onClose} title="Ready to advance?" fullHeight>
      <div className="px-5 py-4 space-y-4">
        <div className="text-sm text-zinc-300">
          To advance from <span className="text-orange-300 font-medium">Phase {phase.id} — {phase.name}</span>
          {nextPhase && (<> to <span className="text-orange-300 font-medium">Phase {nextPhase.id} — {nextPhase.name}</span></>)},
          honestly check off each criterion. If you can't check them all, you're not ready — and there's no shame in another 2 weeks in the current phase.
        </div>

        <ul className="space-y-2">
          {phase.criteria.map((c, i) => (
            <li key={i}>
              <button
                onClick={() => setChecked((s) => ({ ...s, [i]: !s[i] }))}
                className={`w-full text-left flex items-start gap-3 px-4 py-3 rounded-xl border ${
                  checked[i]
                    ? 'bg-orange-500/15 border-orange-500/40 text-orange-200'
                    : 'bg-zinc-800/60 border-zinc-700 text-zinc-300'
                }`}
              >
                <span className={`w-5 h-5 rounded border-2 flex-shrink-0 flex items-center justify-center text-xs mt-0.5 ${
                  checked[i] ? 'bg-orange-500 border-orange-500 text-zinc-950' : 'border-zinc-600'
                }`}>
                  {checked[i] ? '✓' : ''}
                </span>
                <span className="text-sm leading-relaxed">{c}</span>
              </button>
            </li>
          ))}
        </ul>

        {nextPhase && (
          <div className="bg-zinc-800/60 border border-zinc-700 rounded-xl p-3 text-xs">
            <div className="text-zinc-400 mb-1">Next phase targets:</div>
            <div className="text-zinc-100">
              <span className="text-orange-300 font-medium">{nextPhase.targetBoulder}</span> boulder · <span className="text-orange-300 font-medium">{nextPhase.targetTopRope}</span> top rope
            </div>
          </div>
        )}

        <button
          onClick={onAdvance}
          disabled={!allChecked || !nextPhase}
          className="w-full bg-orange-500 hover:bg-orange-400 disabled:bg-zinc-700 disabled:text-zinc-500 text-zinc-950 font-bold rounded-2xl py-4 text-lg"
        >
          {!nextPhase ? 'Already at highest phase' : allChecked ? `Advance to Phase ${nextPhase.id}` : 'Check all boxes to advance'}
        </button>
      </div>
    </Sheet>
  );
}

function Section({ title, sub, children }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wide text-zinc-500">{title}</div>
      {sub && <div className="text-[11px] text-zinc-600 mb-2">{sub}</div>}
      <div className={sub ? '' : 'mt-2'}>{children}</div>
    </div>
  );
}
