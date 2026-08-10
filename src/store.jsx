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

  // Adaptive grade source-of-truth for session doses (warmup, ARC ladder,
  // stretch attempts). Bumped manually via GradesView "bump flash" when
  // the user consolidates a grade — the whole program updates in one place.
  flashTR: '5.10a',
  flashBoulder: 'V2',
  // Append-only history of flash-grade changes. Used by the Weekly mix
  // view to bucket past weeks against the flash that was CURRENT at
  // week-end (not today's flash). Format: [{ date: 'YYYY-MM-DD', style, grade }]
  // ensureShape() seeds an initial entry dated startDate when empty.
  flashHistory: [],

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

  // Milestones — big picture progression outside of raw grade numbers.
  // Some fields auto-populate (phaseCompletions from advancePhase);
  // others are self-affirmed via the Milestones tab.
  milestones: {
    // Date user completed each phase — set when advancePhase() fires.
    // Format: { 1: '2026-08-01', 2: '2026-10-01', ... }
    phaseCompletions: {},
    // Lead climb certification (unlocks at Phase 3).
    lead: {
      certifiedDate: null,
      subitems: {
        fallsComfortable: false,   // controlled falls at 2-3 bolt-height
        clipMechanicSolid: false,  // fold-back grip, from stance
        gymCertPassed: false,      // gym's practical exam
        gymCardIssued: false,      // physical card / badge
      },
    },
    // Outdoor prep (unlocks at Phase 5).
    outdoor: {
      firstOutdoorClimb:  null,   // date of first outdoor climb
      firstOutdoorLead:   null,   // date of first outdoor lead
      anchorBuildingDone: false,  // drilled ground-level anchor setup
      cleaningDone:       false,  // drilled cleaning at anchors
      firstMultiPitch:    null,
    },
    // Technique drill mastery (self-affirmed after weeks of drilling).
    drills: {
      silentFeet:   false,
      dropKnee:     false,
      flag:         false,
      handFootMatch:false,
      outsideEdge:  false,
    },
  },
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
  d.milestones = { ...DEFAULT_DATA().milestones, ...(data?.milestones || {}) };
  // Seed flashHistory when missing so past weeks have a reference grade —
  // otherwise flashAt() returns null for any week before the first bump.
  if (!Array.isArray(d.flashHistory) || d.flashHistory.length === 0) {
    const seedDate = d.startDate || '2020-01-01';
    d.flashHistory = [
      { date: seedDate, style: 'toprope', grade: d.flashTR },
      { date: seedDate, style: 'boulder', grade: d.flashBoulder },
    ];
  }
  return migrateSessionKeys(d);
}

// One-shot data migration for the "Session 1..4" → "full-climb/endurance/..."
// rename. Rewrites keys inside data.weeks and sessionType on each grade
// attempt. Idempotent — running on already-migrated data is a no-op.
function migrateSessionKeys(d) {
  const map = { 'Session 1': 'full-climb', 'Session 2': 'endurance', 'Session 3': 'movement', 'Session 4': 'full-body' };
  const out = { ...d };
  if (d.weeks) {
    const migratedWeeks = {};
    for (const [wid, wk] of Object.entries(d.weeks)) {
      const newWk = {};
      for (const [k, v] of Object.entries(wk)) {
        newWk[map[k] || k] = v;
      }
      migratedWeeks[wid] = newWk;
    }
    out.weeks = migratedWeeks;
  }
  if (d.grades) {
    const remapAttempts = (attempts) =>
      (attempts || []).map((a) =>
        a.sessionType && map[a.sessionType]
          ? { ...a, sessionType: map[a.sessionType] }
          : a
      );
    out.grades = {
      ...d.grades,
      boulder: { ...d.grades.boulder, attempts: remapAttempts(d.grades.boulder?.attempts) },
      toprope: { ...d.grades.toprope, attempts: remapAttempts(d.grades.toprope?.attempts) },
    };
  }
  if (d.logs) {
    out.logs = d.logs.map((l) =>
      l.sessionType && map[l.sessionType]
        ? { ...l, sessionType: map[l.sessionType] }
        : l
    );
  }
  if (d.sessions) {
    out.sessions = d.sessions.map((s) =>
      s.type && map[s.type] ? { ...s, type: map[s.type] } : s
    );
  }
  return out;
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

  // Phase advancement — also stamps a completion date onto the phase we
  // just finished, so the Milestones tab can show a timeline.
  const advancePhase = useCallback(() => {
    patch((d) => {
      const finished = d.currentPhase;
      const next = Math.min(6, finished + 1);
      const phaseCompletions = { ...(d.milestones?.phaseCompletions || {}), [finished]: TODAY() };
      return {
        ...d,
        currentPhase: next,
        phaseOverride: null,
        milestones: { ...d.milestones, phaseCompletions },
      };
    });
  }, [patch]);

  // ---------- milestones actions ----------
  const toggleLeadSubitem = useCallback((key) => {
    patch((d) => {
      const sub = { ...(d.milestones?.lead?.subitems || {}) };
      sub[key] = !sub[key];
      const all = ['fallsComfortable','clipMechanicSolid','gymCertPassed','gymCardIssued']
        .every((k) => sub[k]);
      return {
        ...d,
        milestones: {
          ...d.milestones,
          lead: {
            ...(d.milestones?.lead || {}),
            subitems: sub,
            // Auto-set certifiedDate when all four sub-items check
            certifiedDate: all ? (d.milestones?.lead?.certifiedDate || TODAY()) : null,
          },
        },
      };
    });
  }, [patch]);

  const toggleOutdoorFlag = useCallback((key) => {
    patch((d) => ({
      ...d,
      milestones: {
        ...d.milestones,
        outdoor: {
          ...(d.milestones?.outdoor || {}),
          [key]: !d.milestones?.outdoor?.[key],
        },
      },
    }));
  }, [patch]);

  const setOutdoorDate = useCallback((key, dateStr) => {
    patch((d) => ({
      ...d,
      milestones: {
        ...d.milestones,
        outdoor: {
          ...(d.milestones?.outdoor || {}),
          [key]: dateStr || null,
        },
      },
    }));
  }, [patch]);

  const toggleDrillMastery = useCallback((key) => {
    patch((d) => ({
      ...d,
      milestones: {
        ...d.milestones,
        drills: {
          ...(d.milestones?.drills || {}),
          [key]: !d.milestones?.drills?.[key],
        },
      },
    }));
  }, [patch]);

  const setPhaseOverride = useCallback((phase) => {
    patch((d) => ({ ...d, phaseOverride: phase }));
  }, [patch]);

  const setStartDate = useCallback((iso) => patch((d) => ({ ...d, startDate: iso })), [patch]);

  // Adaptive flash — flows into Phase 1 stepsFor(state) so warmup/ARC/stretch
  // grades update everywhere in one place. Also appends to flashHistory
  // so the Weekly mix view can bucket past weeks against the flash that
  // was current at that time.
  const setFlashGrade = useCallback((style, grade) => {
    patch((d) => {
      const field = style === 'boulder' ? 'flashBoulder' : 'flashTR';
      if (d[field] === grade) return d; // no-op if unchanged
      const history = Array.isArray(d.flashHistory) ? d.flashHistory : [];
      return {
        ...d,
        [field]: grade,
        flashHistory: [...history, { date: TODAY(), style, grade }],
      };
    });
  }, [patch]);

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
      setFlashGrade,
      toggleLeadSubitem,
      toggleOutdoorFlag,
      setOutdoorDate,
      toggleDrillMastery,
      pull,
      forceRestoreFromCloud,
    },
  }), [
    state.hydrated, state.data,
    toggleSession, addLog, removeLog, addSession, removeSession,
    addHealthCheck, removeHealthCheck, addTechniqueNote,
    setGradeLevel, logGradeAttempt, removeGradeAttempt,
    advancePhase, setPhaseOverride, setStartDate, setFlashGrade,
    toggleLeadSubitem, toggleOutdoorFlag, setOutdoorDate, toggleDrillMastery,
    pull, forceRestoreFromCloud,
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
