import Sheet from './Sheet.jsx';
import { useEffect, useMemo, useState } from 'react';
import { today, weekStartOf } from '../utils/dates.js';
import { SESSION_META, phaseById } from '../data/program.js';
import { flashAt, ordinalOf } from '../data/grades.js';

// Export a human-readable text log of climbs in a date range. Optimized
// for pasting into an LLM chat (Claude, etc.) as coaching context —
// grouped by day + session, includes goals, phase, and per-session
// bucket totals so the model has the full picture in one message.
export default function ExportSheet({ open, onClose, data }) {
  const [from, setFrom] = useState('');
  const [to, setTo]     = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (open) {
      const t = today();
      const start = weekStartOf(new Date());
      const startStr = `${start.getFullYear()}-${String(start.getMonth()+1).padStart(2,'0')}-${String(start.getDate()).padStart(2,'0')}`;
      setFrom(startStr);
      setTo(t);
      setCopied(false);
    }
  }, [open]);

  const { text, count } = useMemo(() => {
    if (!open || !data) return { text: '', count: 0 };
    return { ...buildLogText(data, from, to) };
  }, [open, data, from, to]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API unavailable (e.g., insecure context) — select the
      // textarea so the user can copy manually.
      const el = document.getElementById('export-log-textarea');
      if (el) { el.focus(); el.select(); }
    }
  };

  if (!open) return null;

  return (
    <Sheet open={open} onClose={onClose} title="Export climbs" fullHeight>
      <div className="px-5 py-4 space-y-4">
        <p className="text-xs text-zinc-400 leading-relaxed">
          Human-readable log for pasting into a Claude / LLM chat as coaching
          context. Grouped by day &amp; session, includes goals + bucket
          breakdowns per session.
        </p>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[10px] uppercase tracking-wide text-zinc-500 mb-1 block">From</label>
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100"
            />
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-wide text-zinc-500 mb-1 block">To</label>
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100"
            />
          </div>
        </div>

        <div className="text-xs text-zinc-400 flex items-baseline justify-between">
          <span>Climbs in range</span>
          <span className="tabular-nums text-zinc-100 font-bold text-base">{count}</span>
        </div>

        <button
          onClick={copy}
          disabled={count === 0}
          className="w-full bg-orange-500 hover:bg-orange-400 disabled:bg-zinc-800 disabled:text-zinc-500 text-zinc-950 font-bold rounded-xl py-3 text-sm"
        >
          {count === 0
            ? 'Nothing in range to copy'
            : copied
              ? '✓ Copied to clipboard'
              : `Copy to clipboard · ${count} climb${count === 1 ? '' : 's'}`}
        </button>

        <div>
          <div className="text-[10px] uppercase tracking-wide text-zinc-500 mb-1">Preview</div>
          <textarea
            id="export-log-textarea"
            readOnly
            value={text}
            className="w-full h-72 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-[11px] font-mono text-zinc-200 leading-relaxed resize-y"
          />
          <div className="text-[10px] text-zinc-500 mt-1 leading-tight">
            If the Copy button doesn't work, tap the textarea, select all, and copy manually.
          </div>
        </div>
      </div>
    </Sheet>
  );
}

// Build the text log. Groups attempts by date, then by session type.
// Sorts newest first (recent context matters most to a coach). Adds a
// header with athlete state + goals + phase, and per-day bucket totals.
function buildLogText(data, from, to) {
  const trAtt = (data.grades?.toprope?.attempts || []).map((a) => ({ ...a, style: 'toprope' }));
  const boAtt = (data.grades?.boulder?.attempts || []).map((a) => ({ ...a, style: 'boulder' }));
  const all = [...trAtt, ...boAtt].filter((a) => a.date >= from && a.date <= to);
  if (all.length === 0) {
    return { text: `No climbs logged between ${from} and ${to}.`, count: 0 };
  }

  const currentPhase = data.phaseOverride || data.currentPhase;
  const phase = phaseById(currentPhase);
  const history = data.flashHistory || [];

  // Group: day → sessionType (or 'other') → attempts[]
  const byDay = {};
  for (const a of all) {
    if (!byDay[a.date]) byDay[a.date] = {};
    const key = a.sessionType || 'other';
    if (!byDay[a.date][key]) byDay[a.date][key] = [];
    byDay[a.date][key].push(a);
  }
  const days = Object.keys(byDay).sort((x, y) => y.localeCompare(x)); // newest first

  const lines = [];
  lines.push(`Climbing log · ${from} → ${to}`);
  lines.push('');
  lines.push(`Athlete state (as of ${today()}):`);
  lines.push(`  · TR flash: ${data.flashTR}`);
  lines.push(`  · Boulder flash: ${data.flashBoulder}`);
  lines.push(`  · Phase ${phase.id} (${phase.name}) — target ${phase.targetTopRope} TR / ${phase.targetBoulder} boulder`);
  lines.push(`  · Phase goal: ${phase.goal}`);
  lines.push('');
  lines.push(`Bechtel/Hörst training mix targets: 60-70% moderate (below flash) · 20-30% focus (at flash) · 5-10% stretch (above flash).`);
  lines.push('');

  for (const day of days) {
    const dayBuckets = byDay[day];
    // Historical flash for this day — what the athlete was climbing at then
    const dayFlashTR = flashAt(history, 'toprope', day) || data.flashTR;
    const dayFlashBo = flashAt(history, 'boulder', day) || data.flashBoulder;
    const sessionKeys = Object.keys(dayBuckets);
    for (const sk of sessionKeys) {
      const sessionLabel = SESSION_META[sk]?.name || (sk === 'other' ? 'Loose logs' : sk);
      const attempts = dayBuckets[sk];

      // Per-session bucket count (against day's historical flash)
      const buckets = { focus: 0, moderate: 0, stretch: 0 };
      for (const a of attempts) {
        const flashG = a.style === 'toprope' ? dayFlashTR : dayFlashBo;
        const fo = ordinalOf(a.style, flashG);
        const o = ordinalOf(a.style, a.grade);
        if (o < 0 || fo < 0) continue;
        if (o === fo) buckets.focus++;
        else if (o < fo) buckets.moderate++;
        else buckets.stretch++;
      }

      lines.push(`── ${day} · ${sessionLabel} ──`);
      lines.push(`  ${attempts.length} climb${attempts.length === 1 ? '' : 's'} · focus ${buckets.focus} · moderate ${buckets.moderate} · stretch ${buckets.stretch} · (flash then: ${dayFlashTR} TR / ${dayFlashBo} B)`);
      for (const a of attempts) {
        const result = a.result || (a.flash ? 'flash' : a.sent ? 'complete' : 'fail');
        const marker = result === 'flash' ? '⚡ flash' : result === 'complete' ? '✓ complete' : '✗ fail';
        const styleLabel = a.style === 'toprope' ? 'TR' : 'boulder';
        const routeName = a.routeName ? ` "${a.routeName}"` : '';
        const diff = a.difficulty ? ` · ${a.difficulty}/10` : '';
        lines.push(`  • ${a.grade} ${styleLabel}${routeName} · ${marker}${diff}`);
        if (a.drillFocus) lines.push(`      drill: ${a.drillFocus}`);
        if (a.notes) lines.push(`      notes: ${a.notes}`);
      }
      lines.push('');
    }
  }

  lines.push('---');
  lines.push('Coach me: what should I focus on next? Anything concerning in the mix, difficulty ratings, or drill balance?');

  return { text: lines.join('\n'), count: all.length };
}
