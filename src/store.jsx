// Single-user store for the climbing tracker. Same offline-first pattern
// as calisthenics-tracker: localStorage is the source of truth, Supabase
// is the sync layer (on-mount + on-focus pull, debounced push). Data key
// is 'kevin' — Bucky-style multi-user isn't needed here.

import { createContext, useContext, useEffect, useMemo, useReducer, useRef, useCallback, useState } from 'react';
import { fetchAllUsers, upsertUser, SUPA_CONFIGURED } from './api/supabase.js';
import { weekId, parseDate, today } from './utils/dates.js';
import { uid } from './utils/ids.js';

const USER = 'kevin';
const LS_DATA = `climb.data.${USER}`;
const TODAY = today;

const DEFAULT_DATA = () => ({
  startDate: TODAY(),
  currentPhase: 1,
  phaseOverride: null,

  // Per-week completion tags — same shape as calisthenics: keyed by
  // Saturday-of-week YYYY-MM-DD. Values map session type → true.
  weeks: {},

  // Session logs — one entry per session-run. Each contains the
  // per-exercise notes/reps and the finger-health check-in captured
  // before the session started.
  sessions: [],

  // Loose per-exercise logs (like the calisthenics store) — used for
  // history + rest-timer PR-style displays.
  logs: [],

  // Grade tracking — flash/project levels + full send history + first-flash dates.
  grades: {
    boulder: {
      flash:   null,      // e.g. 'V3'
      project: null,      // grade currently being worked
      firstFlash: {},     // { 'V0': '2026-06-10', ... }
      attempts: [],       // per-attempt log — see logGradeAttempt()
    },
    toprope: {
      flash:   null,
      project: null,
      firstFlash: {},
      attempts: [],
    },
  },

  // Finger health check-ins — one per session start (plus any manual ones).
  fingerHealth: [
    // { id, date, soreness: false | { finger, area, level }, notes }
  ],

  // Technique notes — one per session (short free-text after finishing).
  techniqueNotes: [
    // { id, date, sessionType, note, worked: boolean }
  ],

  // Progress photos — optional, stored as data URLs (small only) or URLs.
  photos: [
    // { id, date, url, caption }
  ],
});

function reducer(state, action) {
  switch (action.type) {
    case 'hydrate':
      return { ...state, ...action.payload, hydrated: true };
    case 'setUserData':
      return { ...state, data: action.data };
    case 'patch': {
      const next = action.fn(state.data);
      return { ...state, data: next };
    }
    default:
      return state;
  }
}

const StoreCtx = createContext(null);

// Ensure structural defaults after loading old data (adds missing branches
// if we introduce them later without wiping user progress).
function ensureShape(data) {
  const d = { ...DEFAULT_DATA(), ...data };
  d.grades = {
    boulder: { ...DEFAULT_DATA().grades.boulder, ...(data?.grades?.boulder || {}) },
    toprope: { ...DEFAULT_DATA().grades.toprope, ...(data?.grades?.toprope || {}) },
  };
  return d;
}

export function StoreProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, {
    hydrated: false,
    data: DEFAULT_DATA(),
  });

  // ---------- hydrate from localStorage ----------
  useEffect(() => {
    let parsed = DEFAULT_DATA();
    try {
      const raw = localStorage.getItem(LS_DATA);
      if (raw) parsed = ensureShape(JSON.parse(raw));
    } catch { /* keep defaults */ }
    dispatch({ type: 'hydrate', payload: { data: parsed } });
  }, []);

  // ---------- pull from supabase on mount + focus ----------
  const lastPulled = useRef(0);
  const [readyToPush, setReadyToPush] = useState(false);
  const pull = useCallback(async () => {
    if (!SUPA_CONFIGURED) { setReadyToPush(true); return; }
    const rows = await fetchAllUsers();
    const row = rows.find((r) => (r.name || '').toLowerCase() === USER);
    if (row) {
      const remote = row.data || {};
      const local = JSON.parse(localStorage.getItem(LS_DATA) || '{}');
      const localTs = local._touched || 0;
      const remoteTs = new Date(row.updated_at || 0).getTime();
      const localEmpty = isEssentiallyEmpty(local);
      const remoteHasData = !isEssentiallyEmpty(remote);
      if (remoteTs >= localTs || (localEmpty && remoteHasData)) {
        const merged = ensureShape({ ...remote, _touched: remoteTs });
        localStorage.setItem(LS_DATA, JSON.stringify(merged));
        dispatch({ type: 'setUserData', data: merged });
      }
    }
    lastPulled.current = Date.now();
    setReadyToPush(true);
  }, []);

  useEffect(() => {
    if (!state.hydrated) return;
    pull();
    const onFocus = () => { if (Date.now() - lastPulled.current > 15_000) pull(); };
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [state.hydrated, pull]);

  // ---------- debounced persist ----------
  const pushTimer = useRef(null);
  useEffect(() => {
    if (!state.hydrated || !readyToPush) return;
    const stamped = { ...state.data, _touched: Date.now() };
    localStorage.setItem(LS_DATA, JSON.stringify(stamped));
    if (pushTimer.current) clearTimeout(pushTimer.current);
    pushTimer.current = setTimeout(() => {
      upsertUser(USER, stamped);
    }, 800);
  }, [state.data, state.hydrated, readyToPush]);

  // ---------- actions ----------
  const patch = useCallback((fn) => dispatch({ type: 'patch', fn }), []);

  // Week completion toggles
  const toggleSession = useCallback((wid, sessionType) => {
    patch((d) => {
      const wk = { ...(d.weeks?.[wid] || {}) };
      wk[sessionType] = !wk[sessionType];
      return { ...d, weeks: { ...d.weeks, [wid]: wk } };
    });
  }, [patch]);

  // Per-exercise loose log (rep/set/hold history like calisthenics)
  const addLog = useCallback((entry) => {
    patch((d) => {
      const date = entry.date || TODAY();
      const wid = weekId(parseDate(date));
      return {
        ...d,
        logs: [...d.logs, { id: uid(), sessionType: null, ...entry, date, weekId: wid }],
      };
    });
  }, [patch]);

  const removeLog = useCallback((id) => {
    patch((d) => ({ ...d, logs: d.logs.filter((l) => l.id !== id) }));
  }, [patch]);

  // Session-level record (contains full metadata: energy, technique note, health check-in)
  const addSession = useCallback((entry) => {
    patch((d) => ({
      ...d,
      sessions: [...d.sessions, { id: uid(), date: TODAY(), weekId: weekId(), ...entry }],
    }));
  }, [patch]);

  const removeSession = useCallback((id) => {
    patch((d) => ({ ...d, sessions: d.sessions.filter((s) => s.id !== id) }));
  }, [patch]);

  // Finger health check-ins
  const addHealthCheck = useCallback((entry) => {
    patch((d) => ({
      ...d,
      fingerHealth: [...d.fingerHealth, { id: uid(), date: TODAY(), ...entry }],
    }));
  }, [patch]);

  const removeHealthCheck = useCallback((id) => {
    patch((d) => ({ ...d, fingerHealth: d.fingerHealth.filter((h) => h.id !== id) }));
  }, [patch]);

  // Technique notes
  const addTechniqueNote = useCallback((entry) => {
    patch((d) => ({
      ...d,
      techniqueNotes: [...d.techniqueNotes, { id: uid(), date: TODAY(), ...entry }],
    }));
  }, [patch]);

  // Grade tracking — set current flash/project
  const setGradeLevel = useCallback((style, kind, grade) => {
    patch((d) => ({
      ...d,
      grades: {
        ...d.grades,
        [style]: { ...d.grades[style], [kind]: grade },
      },
    }));
  }, [patch]);

  // Log an attempt — records per-boulder/route effort so we can compute
  // attempt-to-send ratios and flash history.
  const logGradeAttempt = useCallback((style, entry) => {
    // entry = { grade, sent: bool, flash: bool, attempts: number, notes?, date? }
    patch((d) => {
      const date = entry.date || TODAY();
      const wid = weekId(parseDate(date));
      const attempt = { id: uid(), date, weekId: wid, ...entry };
      const styleData = d.grades[style];
      let firstFlash = styleData.firstFlash;
      // Record first flash for a grade the very first time it happens
      if (entry.flash && entry.sent && !firstFlash[entry.grade]) {
        firstFlash = { ...firstFlash, [entry.grade]: date };
      }
      return {
        ...d,
        grades: {
          ...d.grades,
          [style]: {
            ...styleData,
            firstFlash,
            attempts: [...styleData.attempts, attempt],
          },
        },
      };
    });
  }, [patch]);

  const removeGradeAttempt = useCallback((style, id) => {
    patch((d) => ({
      ...d,
      grades: {
        ...d.grades,
        [style]: {
          ...d.grades[style],
          attempts: d.grades[style].attempts.filter((a) => a.id !== id),
        },
      },
    }));
  }, [patch]);

  // Phase advancement
  const advancePhase = useCallback(() => {
    patch((d) => ({
      ...d,
      currentPhase: Math.min(5, d.currentPhase + 1),
      phaseOverride: null,
    }));
  }, [patch]);

  const setPhaseOverride = useCallback((phase) => {
    patch((d) => ({ ...d, phaseOverride: phase }));
  }, [patch]);

  const setStartDate = useCallback((iso) => patch((d) => ({ ...d, startDate: iso })), [patch]);

  const forceRestoreFromCloud = useCallback(async () => {
    if (!SUPA_CONFIGURED) return false;
    const rows = await fetchAllUsers();
    const row = rows.find((r) => (r.name || '').toLowerCase() === USER);
    if (!row) return false;
    const merged = ensureShape({ ...(row.data || {}), _touched: Date.now() });
    localStorage.setItem(LS_DATA, JSON.stringify(merged));
    dispatch({ type: 'setUserData', data: merged });
    setReadyToPush(true);
    return true;
  }, []);

  const value = useMemo(() => ({
    hydrated: state.hydrated,
    data: state.data,
    actions: {
      toggleSession,
      addLog,
      removeLog,
      addSession,
      removeSession,
      addHealthCheck,
      removeHealthCheck,
      addTechniqueNote,
      setGradeLevel,
      logGradeAttempt,
      removeGradeAttempt,
      advancePhase,
      setPhaseOverride,
      setStartDate,
      pull,
      forceRestoreFromCloud,
    },
  }), [
    state.hydrated, state.data,
    toggleSession, addLog, removeLog, addSession, removeSession,
    addHealthCheck, removeHealthCheck, addTechniqueNote,
    setGradeLevel, logGradeAttempt, removeGradeAttempt,
    advancePhase, setPhaseOverride, setStartDate, pull, forceRestoreFromCloud,
  ]);

  return <StoreCtx.Provider value={value}>{children}</StoreCtx.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreCtx);
  if (!ctx) throw new Error('useStore must be used inside <StoreProvider>');
  return ctx;
}

function isEssentiallyEmpty(d) {
  if (!d) return true;
  return Object.keys(d.weeks || {}).length === 0
      && (d.sessions || []).length === 0
      && (d.logs || []).length === 0
      && (d.fingerHealth || []).length === 0
      && (d.grades?.boulder?.attempts || []).length === 0
      && (d.grades?.toprope?.attempts || []).length === 0;
}
