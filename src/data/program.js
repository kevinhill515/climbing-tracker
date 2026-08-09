// Climbing progression program — 5 phases, skill-based advancement
// (not time-based, unlike the calisthenics program). Each phase has 3
// sessions per week and a set of antagonist exercises done 2x/week
// (attach to Sessions 1 and 3 in the UI).
//
// Advancement criteria appear on the Week tab; user self-marks "ready
// to advance" when they meet all three.

export const SESSION_TYPES = ['Session 1', 'Session 2', 'Session 3'];

export const SESSION_META = {
  'Session 1': {
    color: 'orange',
    icon: '◔',
    focus: 'Full protocol — warm-up, technique, pull strength, grip health, efficiency + antagonist',
    time: '90–110 min',
  },
  'Session 2': {
    color: 'amber',
    icon: '◑',
    focus: 'Efficiency training only — deliberate technique work',
    time: '45 min',
  },
  'Session 3': {
    color: 'rose',
    icon: '◕',
    focus: 'Dynamic climbing + slab + antagonist',
    time: '60 min',
  },
};

// Antagonist training — separate weekly module, done alongside Sessions 1 and 3.
export const ANTAGONIST_ITEMS = [
  { ex: 'push-up',           dose: '3 × 15' },
  { ex: 'ext-rotation',      dose: '3 × 15 each side' },
  { ex: 'wrist-ext',         dose: '3 × 15' },
  { ex: 'reverse-wrist-curl',dose: '3 × 15' },
];

// Base session structure — Phase 1's protocol. Later phases override
// specific items (harder grades, more sets, higher hangs). See phaseFor().
const PHASE1_SESSIONS = {
  'Session 1': {
    steps: [
      { ex: 'dyno-warmup',      dose: '3 boulders (V0), rest 2–5 min between' },
      { ex: 'no-hands-slab',    dose: '6 reps, rest 1–2 min' },
      { ex: 'pullup-negative',  dose: '3 sets × 5 reps (3–5s lower), rest 2 min' },
      { ex: 'grip-half-crimp',  dose: '5× 5s on / 5s off — low intensity' },
      { ex: 'grip-open-drag',   dose: '5× 5s on / 5s off — low intensity' },
      { ex: 'grip-sloper',      dose: '5× 5s on / 5s off — low intensity' },
      { ex: 'efficiency-work',  dose: '3–5 boulders at flash grade, 45 min, one improvement per attempt' },
    ],
    antagonist: true,
  },
  'Session 2': {
    steps: [
      { ex: 'dyno-warmup',      dose: '2 boulders (V0), light — you\'re warming up for technique work only' },
      { ex: 'efficiency-work',  dose: '3–5 boulders at flash grade, 45 min, one improvement per attempt' },
    ],
    antagonist: false,
  },
  'Session 3': {
    steps: [
      { ex: 'dyno-warmup',      dose: '3 boulders (V0), rest 2–5 min between' },
      { ex: 'no-hands-slab',    dose: '6 reps, rest 1–2 min' },
    ],
    antagonist: true,
  },
};

// Full phase list — each phase carries `sessions`, target grades, and
// the criteria the user must self-affirm to advance.
export const PHASES = [
  {
    id: 1,
    name: 'Foundation',
    targetBoulder: 'V3',
    targetTopRope: '5.10a',
    goal: 'Consistent V2–V3 flashes and 5.10a top rope. Build the movement base and finger tendon capacity.',
    principles: [
      'Technique is your limiter — not strength. Every session, name ONE thing you\'re working on.',
      'Fingers rebuild slower than everything else. If a pulley aches 3/5 or higher, skip grip engagement AND dynamic climbing.',
      'Never touch the fingerboard cold. Warm-up is training, not optional.',
    ],
    sessions: PHASE1_SESSIONS,
    criteria: [
      'Flashed the target boulder grade in 3 consecutive sessions',
      'No unusual pulley soreness during finger health check-ins for 2 weeks',
      'Movement on flash grade feels controlled, not desperate',
    ],
  },
  {
    id: 2,
    name: 'Progression',
    targetBoulder: 'V4',
    targetTopRope: '5.10c',
    goal: 'Flashing V4 boulders and 5.10c top rope. More volume in warm-up, more pull strength, slightly longer grip holds.',
    principles: [
      'Slightly harder warm-up grades — 5 boulders including one at your flash level.',
      'Pull-up negatives bump to 4 sets. Grip holds bump to 7s on / 7s off.',
      'Still one improvement per efficiency attempt. Don\'t skip the deliberate part.',
    ],
    sessions: {
      ...PHASE1_SESSIONS,
      'Session 1': {
        steps: [
          { ex: 'dyno-warmup',      dose: '5 boulders (V0–V2), rest 2–5 min between' },
          { ex: 'no-hands-slab',    dose: '6 reps, rest 1–2 min' },
          { ex: 'pullup-negative',  dose: '4 sets × 5 reps (3–5s lower), rest 2 min' },
          { ex: 'grip-half-crimp',  dose: '5× 7s on / 7s off — moderate intensity' },
          { ex: 'grip-open-drag',   dose: '5× 7s on / 7s off — moderate intensity' },
          { ex: 'grip-sloper',      dose: '5× 7s on / 7s off — moderate intensity' },
          { ex: 'efficiency-work',  dose: '3–5 boulders at flash grade (V3–V4), 45 min' },
        ],
        antagonist: true,
      },
    },
    criteria: [
      'Flashed V4 (or 5.10c) in 3 consecutive sessions',
      'Finger health clean for 2 weeks',
      'Flash-level movement feels controlled',
    ],
  },
  {
    id: 3,
    name: 'Development',
    targetBoulder: 'V5',
    targetTopRope: '5.11a',
    goal: 'Efficiency targets one grade above flash. Introduce one-arm hang progressions at low intensity.',
    principles: [
      'Dynamic warm-up runs V3–V4. Efficiency targets one grade above current flash.',
      'One-arm hang progression enters (assisted only — feet stay near the ground).',
      'This is where climbers rush and get hurt. Do NOT skip the progression steps.',
    ],
    sessions: {
      ...PHASE1_SESSIONS,
      'Session 1': {
        steps: [
          { ex: 'dyno-warmup',      dose: '5 boulders (V3–V4), rest 2–5 min between' },
          { ex: 'no-hands-slab',    dose: '6 reps, rest 1–2 min' },
          { ex: 'pullup-negative',  dose: '4 sets × 5 reps (3–5s lower), rest 2 min' },
          { ex: 'oneam-hang-prog', dose: '5 × 10s per side, assisted only' },
          { ex: 'grip-half-crimp',  dose: '5× 7s on / 7s off — moderate' },
          { ex: 'grip-open-drag',   dose: '5× 7s on / 7s off — moderate' },
          { ex: 'grip-sloper',      dose: '5× 7s on / 7s off — moderate' },
          { ex: 'efficiency-work',  dose: '3–5 boulders one grade above flash (V5), 45 min' },
        ],
        antagonist: true,
      },
    },
    criteria: [
      'Flashed V5 (or 5.11a) in 3 consecutive sessions',
      '2 weeks of clean finger health',
      'Comfortable in assisted one-arm hangs at 90/10 weight distribution',
    ],
  },
  {
    id: 4,
    name: 'Consolidation',
    targetBoulder: 'V6',
    targetTopRope: '5.11c',
    goal: 'Introduce campus board basics. Flash V6 / 5.11c. This is where power endurance separates from just strength.',
    principles: [
      'Campus board joins the toolkit — LARGE RUNGS ONLY. No small edges, no skipping rungs, no lock-offs.',
      'Session 2 gets a focused power-endurance block: 4×4 style (4 climbs, 4 rounds).',
      'Recovery days are training days.',
    ],
    sessions: PHASE1_SESSIONS,
    criteria: [
      'Flashed V6 (or 5.11c) in 3 consecutive sessions',
      'Campus board basics feel controlled — no elbow discomfort',
      'Finger health check-ins clean for 3 weeks',
    ],
  },
  {
    id: 5,
    name: 'Advanced',
    targetBoulder: 'V7+',
    targetTopRope: '5.11d+',
    goal: 'Individualized power / endurance / projecting cycles. Structure becomes your own.',
    principles: [
      'Cycle a priority skill every 6–8 weeks. Everything else maintenance.',
      'Outdoor projecting starts here — indoor V7 flash ≈ outdoor V5 send, adjust expectations.',
      'Rest weeks non-negotiable. Every 5th week now, not 4th.',
    ],
    sessions: PHASE1_SESSIONS,
    criteria: [
      'This phase is open-ended — advance criteria are self-defined by your projects.',
    ],
  },
];

/** Return the phase matching a phase id, defaulting to Phase 1. */
export function phaseById(id) {
  return PHASES.find((p) => p.id === id) || PHASES[0];
}

/** Deload week detector — every 4th week in phases 1–4, every 5th in phase 5. */
export function isDeloadWeek(weekNumber, phaseId) {
  if (weekNumber <= 0) return false;
  const modulus = phaseId >= 5 ? 5 : 4;
  return weekNumber % modulus === 0;
}
