const TABS = [
  { id: 'week',     label: 'Week',    icon: '◧' },
  { id: 'grades',   label: 'Grades',  icon: '▲' },
  { id: 'health',   label: 'Health',  icon: '♡' },
  { id: 'history',  label: 'History', icon: '⏱' },
];

export default function BottomNav({ tab, setTab }) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-zinc-950/95 backdrop-blur border-t border-zinc-800 safe-bottom z-40">
      <div className="max-w-xl mx-auto grid grid-cols-4">
        {TABS.map((t) => {
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex flex-col items-center gap-0.5 py-2.5 transition ${
                active ? 'text-orange-400' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <span className="text-lg leading-none">{t.icon}</span>
              <span className="text-[10px] font-medium tracking-wide">{t.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
