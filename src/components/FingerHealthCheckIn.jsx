import Sheet from './Sheet.jsx';
import { useStore } from '../store.jsx';
import { useState } from 'react';

// Auto-prompt before starting any session. User can skip ("no soreness")
// in one tap. If they mark soreness, capture finger + area + level so
// the app can flag high-risk sessions to skip grip engagement.
export default function FingerHealthCheckIn({ open, onClose, onProceed, sessionType }) {
  const { actions } = useStore();
  const [step, setStep] = useState('ask');           // 'ask' | 'detail'
  const [finger, setFinger] = useState('index');
  const [area, setArea]     = useState('A2');
  const [level, setLevel]   = useState(2);
  const [notes, setNotes]   = useState('');

  const reset = () => {
    setStep('ask'); setFinger('index'); setArea('A2'); setLevel(2); setNotes('');
  };

  const saveClean = () => {
    actions.addHealthCheck({ soreness: false, notes: '' });
    reset();
    onProceed();
  };

  const saveSore = () => {
    actions.addHealthCheck({
      soreness: { finger, area, level },
      notes: notes.trim(),
    });
    reset();
    onProceed();
  };

  const skipHigh = level >= 3;

  return (
    <Sheet open={open} onClose={onClose} title="Finger health check-in" fullHeight={step === 'detail'}>
      <div className="px-5 py-4 space-y-4">
        <div className="text-sm text-zinc-300">
          Before we start {sessionType || 'this session'}: any soreness in your fingers or pulleys today?
        </div>

        {step === 'ask' ? (
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={saveClean}
              className="py-8 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 font-bold text-lg"
            >
              ✓ No, feels good
            </button>
            <button
              onClick={() => setStep('detail')}
              className="py-8 rounded-2xl bg-amber-500/15 border border-amber-500/40 text-amber-300 font-bold text-lg"
            >
              ⚠ Yes, some soreness
            </button>
          </div>
        ) : (
          <>
            <div>
              <div className="text-xs uppercase tracking-wide text-zinc-500 mb-2">Which finger?</div>
              <div className="grid grid-cols-4 gap-2">
                {['index', 'middle', 'ring', 'pinky'].map((f) => (
                  <button
                    key={f}
                    onClick={() => setFinger(f)}
                    className={`py-2 rounded-lg text-xs border capitalize ${
                      finger === f ? 'bg-zinc-100 text-zinc-950 border-zinc-100' : 'bg-zinc-800 border-zinc-700 text-zinc-300'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="text-xs uppercase tracking-wide text-zinc-500 mb-2">Which pulley/area?</div>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'A2', label: 'A2 · base' },
                  { id: 'A4', label: 'A4 · middle' },
                  { id: 'tendon', label: 'Tendon / other' },
                ].map((a) => (
                  <button
                    key={a.id}
                    onClick={() => setArea(a.id)}
                    className={`py-2 rounded-lg text-xs border ${
                      area === a.id ? 'bg-zinc-100 text-zinc-950 border-zinc-100' : 'bg-zinc-800 border-zinc-700 text-zinc-300'
                    }`}
                  >
                    {a.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="text-xs uppercase tracking-wide text-zinc-500 mb-2">Soreness level (1–5)</div>
              <div className="grid grid-cols-5 gap-2">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    onClick={() => setLevel(n)}
                    className={`py-3 rounded-lg text-sm font-bold border ${
                      level === n
                        ? n >= 4 ? 'bg-rose-500 text-zinc-950 border-rose-500'
                        : n === 3 ? 'bg-amber-500 text-zinc-950 border-amber-500'
                        : 'bg-emerald-500 text-zinc-950 border-emerald-500'
                        : 'bg-zinc-800 border-zinc-700 text-zinc-300'
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>

            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any notes (optional): what triggered it, when it started, etc."
              rows={2}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500"
            />

            {skipHigh && (
              <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl px-3 py-2 text-xs text-rose-300 leading-relaxed">
                <strong>⚠ Skip recommended:</strong> at soreness {level}/5, you should skip grip engagement AND dynamic climbing today.
                Do slab / footwork only, or take the day off. Two 4+ sessions in a row = flag a rest week.
              </div>
            )}

            <div className="flex gap-2 pt-1">
              <button
                onClick={() => setStep('ask')}
                className="flex-1 py-3 rounded-xl bg-zinc-800 text-zinc-300 text-sm"
              >Back</button>
              <button
                onClick={saveSore}
                className="flex-1 py-3 rounded-xl bg-orange-500 hover:bg-orange-400 text-zinc-950 font-bold text-sm"
              >
                {skipHigh ? 'Log & proceed with caution' : 'Log & continue'}
              </button>
            </div>
          </>
        )}
      </div>
    </Sheet>
  );
}
