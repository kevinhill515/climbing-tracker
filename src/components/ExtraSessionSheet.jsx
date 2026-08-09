import Sheet from './Sheet.jsx';
import { useStore } from '../store.jsx';
import { SESSION_TYPES } from '../data/program.js';
import { useState } from 'react';
import { today } from '../utils/dates.js';

// Log a bonus / extra climbing session — the 3 session cards on Week
// are TARGET protocol sessions; this captures the reality of going more
// often (4th, 5th visits) without pretending they were a specific
// protocol. Saves to data.sessions[] and shows up in History.
export default function ExtraSessionSheet({ open, onClose }) {
  const { actions } = useStore();
  const [date, setDate]     = useState(today());
  const [type, setType]     = useState('Freeform');
  const [location, setLocation] = useState('gym');
  const [energy, setEnergy] = useState(3);
  const [notes, setNotes]   = useState('');

  const save = () => {
    actions.addSession({
      date,
      type,
      location,
      energy,
      note: notes.trim(),
      isExtra: true,
    });
    setDate(today()); setType('Freeform'); setLocation('gym'); setEnergy(3); setNotes('');
    onClose();
  };

  return (
    <Sheet open={open} onClose={onClose} title="Log extra session" fullHeight>
      <div className="px-5 py-4 space-y-4">
        <div className="text-xs text-zinc-500 leading-relaxed">
          The 3 session cards on the Week tab are your <em>target</em> protocol sessions. This is for logging bonus visits — an extra day at the gym, a spontaneous outdoor day, a session that doesn't fit a specific template. It appears in your History but doesn't affect the weekly target ring.
        </div>

        {/* Date */}
        <label className="block">
          <span className="text-[10px] uppercase tracking-wide text-zinc-500">Date</span>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="mt-1 w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2.5 text-sm text-zinc-100"
          />
        </label>

        {/* Template used */}
        <div>
          <div className="text-[10px] uppercase tracking-wide text-zinc-500 mb-1.5">What did it look like?</div>
          <div className="grid grid-cols-2 gap-1.5">
            {['Freeform', ...SESSION_TYPES].map((t) => (
              <button
                key={t}
                onClick={() => setType(t)}
                className={`py-2 rounded-lg text-xs font-medium border ${
                  type === t
                    ? 'bg-orange-500 text-zinc-950 border-orange-500'
                    : 'bg-zinc-800 border-zinc-700 text-zinc-300'
                }`}
              >
                {t === 'Freeform' ? 'Freeform / just climbed' : t}
              </button>
            ))}
          </div>
        </div>

        {/* Location */}
        <div>
          <div className="text-[10px] uppercase tracking-wide text-zinc-500 mb-1.5">Where</div>
          <div className="grid grid-cols-4 gap-1.5">
            {['gym', 'board', 'outdoor', 'other'].map((l) => (
              <button
                key={l}
                onClick={() => setLocation(l)}
                className={`py-2 rounded-lg text-xs font-medium border capitalize ${
                  location === l
                    ? 'bg-zinc-100 text-zinc-950 border-zinc-100'
                    : 'bg-zinc-800 border-zinc-700 text-zinc-300'
                }`}
              >
                {l}
              </button>
            ))}
          </div>
        </div>

        {/* Energy */}
        <div>
          <div className="text-[10px] uppercase tracking-wide text-zinc-500 mb-1.5">Energy coming in (1–5)</div>
          <div className="grid grid-cols-5 gap-1.5">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                onClick={() => setEnergy(n)}
                className={`py-2 rounded-lg text-sm font-bold border ${
                  energy === n
                    ? 'bg-orange-500 text-zinc-950 border-orange-500'
                    : 'bg-zinc-800 border-zinc-700 text-zinc-300'
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        {/* Notes */}
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="What did you work on? What went well? What technique note?"
          rows={3}
          className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500"
        />

        <button
          onClick={save}
          className="w-full bg-orange-500 hover:bg-orange-400 text-zinc-950 font-bold rounded-2xl py-4 text-lg"
        >
          Save extra session
        </button>
      </div>
    </Sheet>
  );
}
