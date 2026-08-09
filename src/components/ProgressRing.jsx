export default function ProgressRing({ value, size = 96, stroke = 8, label, sub, color = 'orange' }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - Math.max(0, Math.min(1, value)));
  const stroke1 = color === 'orange' ? 'text-orange-400' : 'text-emerald-400';
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} stroke="currentColor" strokeWidth={stroke} fill="none" className="text-zinc-800" />
        <circle cx={size / 2} cy={size / 2} r={r} stroke="currentColor" strokeWidth={stroke} fill="none"
          className={`${stroke1} transition-[stroke-dashoffset] duration-500`}
          strokeDasharray={c} strokeDashoffset={offset} strokeLinecap="round" />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xl font-bold text-zinc-100 leading-none">{label}</span>
        {sub ? <span className="text-[10px] text-zinc-500 mt-0.5">{sub}</span> : null}
      </div>
    </div>
  );
}
