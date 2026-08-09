import { useState } from 'react';
import { StoreProvider, useStore } from './store.jsx';
import BottomNav from './components/BottomNav.jsx';
import WeekView from './components/WeekView.jsx';
import GradesView from './components/GradesView.jsx';
import HealthView from './components/HealthView.jsx';
import HistoryView from './components/HistoryView.jsx';
import SettingsSheet from './components/SettingsSheet.jsx';

export default function App() {
  return (
    <StoreProvider>
      <Shell />
    </StoreProvider>
  );
}

function Shell() {
  const { hydrated } = useStore();
  const [tab, setTab] = useState('week');
  const [settings, setSettings] = useState(false);

  if (!hydrated) {
    return <div className="h-full flex items-center justify-center text-zinc-500">…</div>;
  }

  return (
    <div className="min-h-full flex flex-col bg-zinc-950">
      <TopBar onSettings={() => setSettings(true)} />
      <main className="flex-1">
        {tab === 'week'    && <WeekView />}
        {tab === 'grades'  && <GradesView />}
        {tab === 'health'  && <HealthView />}
        {tab === 'history' && <HistoryView />}
      </main>
      <BottomNav tab={tab} setTab={setTab} />
      <SettingsSheet open={settings} onClose={() => setSettings(false)} />
    </div>
  );
}

function TopBar({ onSettings }) {
  return (
    <header className="safe-top sticky top-0 bg-zinc-950/90 backdrop-blur z-30 border-b border-zinc-900">
      <div className="max-w-xl mx-auto flex items-center justify-between px-4 py-2.5">
        <div className="flex items-center gap-2">
          <span className="w-7 h-7 rounded-lg bg-orange-500/15 border border-orange-500/30 flex items-center justify-center text-orange-400 text-sm">▲</span>
          <span className="text-sm font-semibold text-zinc-200">Climb Tracker</span>
        </div>
        <button
          onClick={onSettings}
          className="w-9 h-9 rounded-full bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 flex items-center justify-center text-zinc-400"
          aria-label="Settings"
        >
          <span className="text-base">⚙</span>
        </button>
      </div>
    </header>
  );
}
