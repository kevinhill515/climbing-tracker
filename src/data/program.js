// Climbing progression program — 6 phases, skill-based advancement.
// Top-rope focused with bouldering as a movement / power supplement.
// End goal: 5.12d, lead-climb certified, prepared for outdoor.

// Session IDs are internal keys; SESSION_META.name is the display label.
// Renamed from "Session 1..4" to descriptive names on 2026-06-24.
export const SESSION_TYPES = ['full-climb', 'endurance', 'movement', 'full-body'];

// Legacy → new id map, used to migrate old data on hydrate.
export const LEGACY_SESSION_MAP = {
  'Session 1': 'full-climb',
  'Session 2': 'endurance',
  'Session 3': 'movement',
  'Session 4': 'full-body',
};

export const SESSION_META = {
  'full-climb': {
    name:  'Full Climb',
    color: 'orange',
    icon:  '◔',
    focus: 'Full protocol — efficiency, ARC, pull + finger work',
    time:  '90–110 min',
  },
  'endurance': {
    name:  'Endurance',
    color: 'amber',
    icon:  '◑',
    focus: 'Power endurance — 4x4s',
    time:  '60–75 min',
  },
  'movement': {
    name:  'Movement',
    color: 'rose',
    icon:  '◕',
    focus: 'Bouldering + skill drills',
    time:  '60–75 min',
  },
  'full-body': {
    name:  'Full Body',
    color: 'violet',
    icon:  '◉',
    focus: 'Antagonist · legs · core · mobility',
    time:  '45–60 min',
  },
};

// Session 4 is the full-body / antagonist / injury-prevention day. Same
// structure across all phases — user progresses load (weight, reps, or
// hold time) as they get stronger. 1-2× per week is the sweet spot.
const SESSION_4_STEPS = [
  // ---- prep ----
  { ex: 'hip-mobility',      dose: '5-7 min hip stretches — start warm' },
  { ex: 'dynamic-warmup',    dose: '5 min — jump rope, arm circles, leg swings, hip openers, cat-cow' },
  // ---- push / straight-arm strength (climbing-specific antagonist) ----
  { ex: 'push-up',                 dose: '3 × 15' },
  { ex: 'pseudo-planche-pushup',   dose: '3 × 8-10 — hands rotated back, lean forward as you lower' },
  { ex: 'pike-pushup',             dose: '3 × 8-12 — bodyweight overhead press' },
  { ex: 'wall-hspu',               dose: '3 × 3-6 (band assist if needed) — full HSPU is a long-term goal' },
  { ex: 'ring-dip',                dose: '3 × 6-10 on rings (or dips if no rings)' },
  { ex: 'handstand-attempts',      dose: '10 kick-up attempts — control > time' },
  // ---- pull / straight-arm strength ----
  { ex: 'adv-tuck-planche',        dose: '5 × 8-15s holds — straight arms, scapulae protracted' },
  { ex: 'tuck-front-lever',        dose: '5 × 5-10s holds — pull with lats, not biceps' },
  { ex: 'ice-cream-makers',        dose: '3 × 5 — top of pull-up → controlled lean back to inverted hang → up' },
  // ---- shoulder + elbow health ----
  { ex: 'ext-rotation',            dose: '3 × 15 each side · 2-5 lb' },
  { ex: 'prone-ytw',               dose: '3 sets of 8 Y + 8 T + 8 W' },
  { ex: 'wrist-ext',               dose: '3 × 15 · 2-5 lb' },
  { ex: 'reverse-wrist-curl',      dose: '3 × 15 · 2-5 lb' },
  // ---- legs ----
  { ex: 'squat',                   dose: '3 × 20 bodyweight (add DBs when trivial)' },
  { ex: 'bulgarian-split-squat',   dose: '3 × 10 each leg' },
  { ex: 'calf-raise',              dose: '3 × 15 on a step edge' },
  // ---- core ----
  { ex: 'hollow-body-hold',        dose: '3 × 30-45s' },
  { ex: 'plank',                   dose: '3 × 45-60s' },
  { ex: 'dead-bug',                dose: '3 × 10 each side' },
  // ---- optional cardio ----
  { ex: 'zone2-cardio',            dose: '15-20 min · optional but great for outdoor approach prep' },
];

// Helper: standard Session 1 structure per phase's grade progression.
// ORDER matters (user preference):
//   1. Wrist + shoulder prep    (non-climbing)
//   2. 1 warmup route            (climbing on)
//   3. Efficiency training       (fresh energy — this is the skill work)
//   4. ARC training              (endurance base)
//   5. Pull-up negatives         (strength — after warmup and hard route work)
//   6. 3 grip positions          (finger tendon capacity — low intensity finisher)
function session1Steps({ warmupGrade, effGradeFlash, arcGrade, pullSets, pullVariant = 'pullup-negative', gripSecs, hangboard = false }) {
  const steps = [
    // Prep
    { ex: 'hip-mobility',    dose: '5-7 min hip stretches — start warm' },
    { ex: 'joint-prep',      dose: '5 min wrist + shoulder routine' },
    // Top rope block
    { ex: 'warmup-route',    dose: `1 easy route at ${warmupGrade}` },
    { ex: 'efficiency-work', dose: `2-3 routes at ${effGradeFlash}, 2 attempts each, ONE focus per attempt · ~40 min` },
    { ex: 'arc-training',    dose: `3-4 laps on a ${arcGrade}, minimal rest between (belay swap = your rest)` },
    // Off-the-wall strength
    { ex: pullVariant,       dose: pullVariant === 'weighted-pullup' ? `4 sets × 5 reps · rest 3 min` : `${pullSets} sets × 5 reps (3-5s lower) · rest 2 min` },
    { ex: 'grip-half-crimp', dose: `5× ${gripSecs}s on / ${gripSecs}s off — LIGHT` },
    { ex: 'grip-open-drag',  dose: `5× ${gripSecs}s on / ${gripSecs}s off — LIGHT` },
    { ex: 'grip-sloper',     dose: `5× ${gripSecs}s on / ${gripSecs}s off — LIGHT` },
  ];
  if (hangboard) {
    steps.push({ ex: 'hangboard-repeaters', dose: 'Optional — only when everything above feels easy' });
  }
  return steps;
}

// Session 2 — Endurance / Power Endurance. Bouldering-based 4x4s here —
// gym top-rope doesn't have enough same-grade routes with fast belay
// swaps. 4x4 = 4 boulders × 4 rounds = 16 problems total.
function session2Steps({ fourByFourBoulderGrade }) {
  return [
    { ex: 'hip-mobility',   dose: '5-7 min hip stretches — start warm' },
    { ex: 'joint-prep',     dose: '5 min wrist + shoulder routine' },
    { ex: 'warmup-boulder', dose: '1 easy V0 boulder to warm up' },
    { ex: 'four-by-four',   dose: `4 boulders at ${fourByFourBoulderGrade}, back-to-back · 4 rounds, 3-5 min rest between rounds` },
  ];
}

// Session 3 — Movement + Power. Bouldering block + ONE deep drill.
function session3Steps({ boulderGrade, driveGrade, includeLead = false }) {
  const steps = [
    // Prep block
    { ex: 'hip-mobility',    dose: '5-7 min hip stretches — start warm' },
    { ex: 'joint-prep',      dose: '5 min wrist + shoulder routine' },
    // Climbing block
    { ex: 'warmup-boulder',  dose: '1 easy V0 boulder or short traverse' },
    { ex: 'boulder-block',   dose: `30-45 min at ${boulderGrade}, quality over volume, 3-5 min rest` },
    { ex: 'movement-drill',  dose: `Pick ONE drill and go deep · 2-3 routes at ${driveGrade}` },
    { ex: 'no-hands-slab',   dose: '4-6 reps on a slab route, 1-2 min rest' },
  ];
  if (includeLead) {
    steps.push({ ex: 'clip-practice', dose: 'On top rope, practice clip mechanics at each bolt · 1 route' });
  }
  return steps;
}

// ============ PHASES ============
export const PHASES = [
  // ---------- Phase 1 ----------
  {
    id: 1,
    name: 'Foundation',
    targetTopRope: '5.10b',
    targetBoulder: 'V3',
    goal: "Get to where 5.10a-b feels EASY on top rope. You should flash 5.10b cleanly, 3 sessions in a row. Build the technique base and finger tendon capacity — the two things that matter more than strength at this level.",
    principles: [
      "Technique beats strength until 5.11a. Every session, pick ONE thing to improve (foot placement, hip rotation, breath timing) and drill it.",
      "Warm-up is training, not optional. Cold fingers + hard grips is how pulleys tear.",
      "Give fingers 48 hours between hard sessions. Full Body can go on the rest days.",
      "Log every climb. You won't remember the details in 6 months — the app will.",
    ],
    sessions: {
      'full-climb': {
        steps: session1Steps({
          warmupGrade: '5.7',
          effGradeFlash: '5.10a-b',
          arcGrade: '5.7',
          pullSets: 3,
          gripSecs: 5,
        }),
      },
      'endurance': {
        steps: session2Steps({ fourByFourBoulderGrade: 'V0-V1' }),
      },
      'movement': {
        steps: session3Steps({
          boulderGrade: 'V2-V3',
          driveGrade: '5.7-5.8',
        }),
      },
      'full-body': { steps: SESSION_4_STEPS },
    },
    criteria: [
      'Flashed 5.10b top-rope in 3 consecutive sessions',
      'ARC sessions feel sustainable (no forearm burnout at 20 min)',
      'Full Body session is happening at least 1× per week consistently',
      'Movement on flash-grade routes feels controlled, not desperate',
    ],
  },

  // ---------- Phase 2 ----------
  {
    id: 2,
    name: 'Consolidation',
    targetTopRope: '5.10d',
    targetBoulder: 'V4',
    goal: "Get to where 5.10c-d feels easy. You should flash 5.10d cleanly, 3 sessions in a row. Start projecting 5.11a. Weighted pull-ups enter here.",
    principles: [
      "You get harder grades from movement economy, not just brute strength. Notice the rest positions you can find on every route.",
      "Weighted pull-ups replace negatives. Add ~5 lb every 2 weeks. No kip.",
      "Grip holds bump to 7s on / 7s off. Still low intensity — you're building tendon capacity, not maxing out.",
      "Read every route from the ground for 60s before you climb it. Beta upfront saves pump on the wall.",
    ],
    sessions: {
      'full-climb': {
        steps: [
          ...session1Steps({
            warmupGrade: '5.7-5.8',
            effGradeFlash: '5.10c-d',
            arcGrade: '5.8',
            pullSets: 4,
            pullVariant: 'weighted-pullup',
            gripSecs: 7,
          }),
          { ex: 'route-reading', dose: 'Explicit ground-read before every efficiency attempt (60s min)' },
        ],
      },
      'endurance': {
        steps: session2Steps({ fourByFourBoulderGrade: 'V1-V2' }),
      },
      'movement': {
        steps: session3Steps({
          boulderGrade: 'V3-V4',
          driveGrade: '5.8-5.9',
        }),
      },
      'full-body': { steps: SESSION_4_STEPS },
    },
    criteria: [
      'Flashed 5.10d top-rope in 3 consecutive sessions',
      'Redpointed 5.11a at least once',
      'Weighted pull-ups at bodyweight + 15 lb for 5 reps',
      'Route-reading habitual — you notice when you skip it',
    ],
  },

  // ---------- Phase 3 ----------
  {
    id: 3,
    name: 'Lead Introduction',
    targetTopRope: '5.11a',
    targetBoulder: 'V5',
    goal: "Get lead-climb certified. Onsight 5.11a on lead. Start projecting 5.11b. This is the phase where you become independent — no more waiting for a top-rope to be set for you.",
    principles: [
      "Lead certification is this phase's #1 goal. Aim to pass within 6-8 weeks.",
      "Mock lead (trailing a rope) for 2 weeks before your first real lead. Clip mechanics should be automatic before you leave the ground.",
      "Fall practice is mandatory. Small controlled falls, twice a week. Head game matters more than pull strength here.",
      "Hangboard repeaters enter here. Advanced tool — start light. Any elbow or finger tenderness = skip that day.",
    ],
    sessions: {
      'full-climb': {
        steps: session1Steps({
          warmupGrade: '5.8',
          effGradeFlash: '5.11a-b',
          arcGrade: '5.9',
          pullSets: 4,
          pullVariant: 'weighted-pullup',
          gripSecs: 7,
          hangboard: true,
        }),
      },
      'endurance': {
        steps: [
          { ex: 'joint-prep',    dose: '5 min routine' },
          { ex: 'warmup-route',  dose: '1 easy route at 5.8' },
          { ex: 'clip-practice', dose: 'On TR at each bolt, practice clip mechanics · 1 route' },
          { ex: 'mock-lead',     dose: 'On TR trailing a lead rope, mock-clip each bolt · 1-2 routes' },
          { ex: 'four-by-four',  dose: '4 boulders at V1-V2 · 4 rounds, 3-5 min rest between' },
          { ex: 'arc-cooldown',  dose: '10 min easy on 5.7-5.8' },
        ],
      },
      'movement': {
        steps: [
          { ex: 'joint-prep',      dose: '5 min routine' },
          { ex: 'warmup-boulder',  dose: '1 easy V0 boulder or short traverse' },
          { ex: 'boulder-block',   dose: '30 min at V4-V5, quality over volume' },
          { ex: 'movement-drill',  dose: 'Pick ONE drill and go deep · 2-3 routes at 5.9-5.10a' },
          { ex: 'fall-practice',   dose: '5-10 controlled falls on lead, well below redpoint · with experienced belayer' },
          { ex: 'lead-cert-drill', dose: 'Mock lead-cert exam on 5.9 · until it passes cleanly' },
        ],
      },
      'full-body': { steps: SESSION_4_STEPS },
    },
    criteria: [
      'PASSED LEAD CERTIFICATION at the gym',
      'Comfortable taking controlled lead falls above bolt 3',
      'Onsight 5.11a on lead',
      'Redpoint 5.11b (top rope or lead)',
    ],
  },

  // ---------- Phase 4 ----------
  {
    id: 4,
    name: 'Mid-11s',
    targetTopRope: '5.11c',
    targetBoulder: 'V5',
    goal: "Onsight 5.11c on lead. Project 5.12a. The 5.11-to-5.12 gap gets closed here — mostly through power endurance work.",
    principles: [
      "Projects enter — dedicated sessions to WORK a single hard route over weeks.",
      "Power endurance is the limiter now. 4x4s become non-negotiable.",
      "Outdoor practice starts appearing when weather allows — a session/month.",
      "Bouldering V4-V5 supports movement power for route cruxes.",
    ],
    sessions: {
      'full-climb': {
        steps: session1Steps({
          warmupGrade: '5.8-5.9',
          effGradeFlash: '5.11b-c',
          arcGrade: '5.9-5.10a',
          pullSets: 4,
          pullVariant: 'weighted-pullup',
          gripSecs: 10,
          hangboard: true,
        }),
      },
      'endurance': {
        steps: [
          { ex: 'joint-prep',    dose: '5 min routine' },
          { ex: 'warmup-route',  dose: '1 easy route at 5.8-5.9' },
          { ex: 'four-by-four',  dose: '4 boulders at V2-V3 · 4 rounds, 3-5 min rest between' },
          { ex: 'route-repeats', dose: '2 routes at 5.11a-b · 3 laps each · project moves on last lap' },
          { ex: 'fall-practice', dose: '3-5 falls above bolt 4, working comfort' },
          { ex: 'arc-cooldown',  dose: '10 min easy' },
        ],
      },
      'movement': {
        steps: [
          { ex: 'joint-prep',      dose: '5 min routine' },
          { ex: 'warmup-boulder',  dose: '1 easy V0 boulder' },
          { ex: 'boulder-block',   dose: '30-45 min at V4-V5' },
          { ex: 'movement-drill',  dose: 'Pick ONE drill · drop knees + flags on 3 routes at 5.10' },
          { ex: 'clip-practice',   dose: 'On lead when possible — automate clip stance under fatigue' },
        ],
      },
      'full-body': { steps: SESSION_4_STEPS },
    },
    criteria: [
      'Onsight 5.11c on lead',
      'Redpoint 5.12a',
      'Comfortable lead-falling above bolt 5',
      'One outdoor session logged (top-rope or lead with an experienced partner)',
    ],
  },

  // ---------- Phase 5 ----------
  {
    id: 5,
    name: 'Outdoor Prep + Low 12s',
    targetTopRope: '5.12b',
    targetBoulder: 'V6',
    goal: "Onsight 5.11d on lead. Project 5.12b. Outdoor skills become routine — anchor building, cleaning, rope management, multi-pitch basics.",
    principles: [
      "Outdoor skills trained ON THE GROUND until automatic. Rehearse in the gym / beginner outdoor first.",
      "Projects run 4-8 weeks. Have TWO: one at redpoint level, one a grade above.",
      "Recovery matters more than volume now. Every 5th week is 50% volume.",
      "Video every project attempt — you'll spot beta refinements from watching that you never notice in the moment.",
    ],
    sessions: {
      'full-climb': {
        steps: session1Steps({
          warmupGrade: '5.9',
          effGradeFlash: '5.11d-5.12a',
          arcGrade: '5.10',
          pullSets: 4,
          pullVariant: 'weighted-pullup',
          gripSecs: 10,
          hangboard: true,
        }),
      },
      'endurance': {
        steps: [
          { ex: 'joint-prep',      dose: '5 min routine' },
          { ex: 'warmup-route',    dose: '1 easy route at 5.9' },
          { ex: 'four-by-four',    dose: '4 boulders at V3-V4 · 4 rounds, 3-5 min rest between' },
          { ex: 'route-repeats',   dose: '2 routes at 5.11c-d · 3 laps each' },
          { ex: 'anchor-building', dose: '10 min ground practice — SRENE anchor, 2 setups' },
          { ex: 'cleaning-anchor', dose: 'Practice threading + lowering on ground setup' },
          { ex: 'arc-cooldown',    dose: '10 min easy' },
        ],
      },
      'movement': {
        steps: [
          { ex: 'joint-prep',      dose: '5 min routine' },
          { ex: 'warmup-boulder',  dose: '1 easy V0 boulder' },
          { ex: 'boulder-block',   dose: '30 min at V5-V6, focus on crux-move patterns' },
          { ex: 'movement-drill',  dose: 'Pick ONE drill · drill deep on 3 routes' },
          { ex: 'rope-management', dose: 'Coiling, flaking, back-clipping prevention · 10 min' },
          { ex: 'fall-practice',   dose: 'Increasing height above bolt — building outdoor whipper comfort' },
        ],
      },
      'full-body': { steps: SESSION_4_STEPS },
    },
    criteria: [
      'Onsight 5.11d on lead',
      'Redpoint 5.12b',
      'Can build a SRENE anchor in <5 min unaided',
      'Cleaned an outdoor anchor solo, at least twice',
      'One multi-pitch climb logged',
    ],
  },

  // ---------- Phase 6 ----------
  {
    id: 6,
    name: 'Goal Grade — 5.12d',
    targetTopRope: '5.12d',
    targetBoulder: 'V7',
    goal: "Send 5.12d. Indoor or outdoor. This phase is on you — you know your body, your patterns, your limiters. Project cycles, peaking, dedicated rest weeks.",
    principles: [
      "Structure is your own now. Match training to what the project demands.",
      "Peak periodization: 3-week hard training block → 1 week light → project attempts.",
      "Mental game is 50% of the send. Visualization, breathwork, fall commitment.",
      "Outdoor > indoor for this grade — real rock rewards efficient movement in a way plastic doesn't.",
    ],
    sessions: {
      'full-climb': {
        steps: [
          { ex: 'joint-prep',      dose: '5 min routine' },
          { ex: 'warmup-route',    dose: '1 easy route' },
          { ex: 'efficiency-work', dose: 'Project attempts (5.12c-d) — 3-5 tries with full recovery · 45 min' },
          { ex: 'arc-training',    dose: '30-40 min' },
          { ex: 'weighted-pullup', dose: '4 sets × 3-5 reps at max weight' },
          { ex: 'grip-half-crimp', dose: '5× 10s on / 10s off — moderate-hard' },
          { ex: 'grip-open-drag',  dose: '5× 10s on / 10s off — moderate-hard' },
          { ex: 'grip-sloper',     dose: '5× 10s on / 10s off — moderate-hard' },
          { ex: 'hangboard-repeaters', dose: '7s/3s × 6 × 6 sets, high intensity' },
        ],
      },
      'endurance': {
        steps: [
          { ex: 'joint-prep',    dose: '5 min routine' },
          { ex: 'warmup-route',  dose: '1 easy route' },
          { ex: 'four-by-four',  dose: '4 boulders at V4-V5 · 4 rounds, 3-5 min rest between' },
          { ex: 'route-repeats', dose: 'Project laps — climb the project in sections, work each crux' },
          { ex: 'fall-practice', dose: 'Big-air whippers — where the project demands commitment' },
        ],
      },
      'movement': {
        steps: [
          { ex: 'joint-prep',      dose: '5 min routine' },
          { ex: 'warmup-boulder',  dose: '1 easy V0 boulder' },
          { ex: 'boulder-block',   dose: '30 min at V6-V7, matching crux difficulty' },
          { ex: 'movement-drill',  dose: 'Specific to project weakness — micro-drilling crux beta' },
        ],
      },
      'full-body': { steps: SESSION_4_STEPS },
    },
    criteria: [
      'Sent 5.12d — indoor or outdoor',
    ],
  },
];

export function phaseById(id) {
  return PHASES.find((p) => p.id === id) || PHASES[0];
}

export function isDeloadWeek(weekNumber, phaseId) {
  if (weekNumber <= 0) return false;
  const modulus = phaseId >= 5 ? 5 : 4;
  return weekNumber % modulus === 0;
}
