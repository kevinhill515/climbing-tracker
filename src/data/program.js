// Climbing progression program — 6 phases, skill-based advancement.
// Top-rope focused with bouldering as a movement / power supplement.
// End goal: 5.12d, lead-climb certified, prepared for outdoor.

export const SESSION_TYPES = ['Session 1', 'Session 2', 'Session 3', 'Session 4'];

export const SESSION_META = {
  'Session 1': {
    color: 'orange',
    icon: '◔',
    focus: 'Full — efficiency, ARC, then pull + finger work',
    time: '90–110 min',
  },
  'Session 2': {
    color: 'amber',
    icon: '◑',
    focus: 'Power endurance — 4x4s',
    time: '60–75 min',
  },
  'Session 3': {
    color: 'rose',
    icon: '◕',
    focus: 'Movement + power — bouldering + skill drills',
    time: '60–75 min',
  },
  'Session 4': {
    color: 'violet',
    icon: '◉',
    focus: 'Full body — antagonist, legs, core, mobility',
    time: '45–60 min',
  },
};

// Session 4 is the full-body / antagonist / injury-prevention day. Same
// structure across all phases — user progresses load (weight, reps, or
// hold time) as they get stronger. 1-2× per week is the sweet spot.
const SESSION_4_STEPS = [
  // ---- prep ----
  { ex: 'dynamic-warmup',    dose: '5 min — jumping jacks, arm circles, leg swings, hip openers, cat-cow' },
  // ---- push ----
  { ex: 'push-up',           dose: '3 × 15' },
  { ex: 'pike-pushup',       dose: '3 × 8-12 — overhead pressing balance' },
  // ---- shoulder health ----
  { ex: 'ext-rotation',      dose: '3 × 15 each side · 2-5 lb dumbbell or band' },
  { ex: 'prone-ytw',         dose: '3 sets of 8 Y + 8 T + 8 W' },
  // ---- wrist / elbow ----
  { ex: 'wrist-ext',         dose: '3 × 15 · 2-5 lb' },
  { ex: 'reverse-wrist-curl',dose: '3 × 15 · 2-5 lb' },
  // ---- legs ----
  { ex: 'squat',             dose: '3 × 20 bodyweight (add DBs when trivial)' },
  { ex: 'bulgarian-split-squat', dose: '3 × 10 each leg' },
  { ex: 'calf-raise',        dose: '3 × 15 on a step edge' },
  // ---- core ----
  { ex: 'hollow-body-hold',  dose: '3 × 30-45s' },
  { ex: 'plank',             dose: '3 × 45-60s' },
  { ex: 'dead-bug',          dose: '3 × 10 each side' },
  // ---- mobility ----
  { ex: 'hip-mobility',      dose: '3 min routine' },
  // ---- optional cardio ----
  { ex: 'zone2-cardio',      dose: '15-20 min · optional but valuable for outdoor prep' },
];

// Helper: standard Session 1 structure per phase's grade progression.
// ORDER matters (user preference):
//   1. Wrist + shoulder prep    (non-climbing)
//   2. 1 warmup route            (climbing on)
//   3. Efficiency training       (fresh energy — this is the skill work)
//   4. ARC training              (endurance base)
//   5. Pull-up negatives         (strength — after warmup and hard route work)
//   6. 3 grip positions          (finger tendon capacity — low intensity finisher)
function session1Steps({ warmupGrade, effGradeFlash, effGradeSub, arcGrade, pullSets, pullVariant = 'pullup-negative', gripSecs, hangboard = false }) {
  const steps = [
    // Prep block (hip mobility first, then joint prep — both before climbing)
    { ex: 'hip-mobility',    dose: '5-7 min hip stretches — start warm' },
    { ex: 'joint-prep',      dose: '5 min wrist + shoulder routine' },
    // Climbing block
    { ex: 'warmup-route',    dose: `1 easy route at ${warmupGrade}` },
    { ex: 'efficiency-work', dose: `TR: 3 routes at ${effGradeFlash} + 3 routes at ${effGradeSub}, 1-2 attempts each, ONE focus per attempt · 45 min` },
    { ex: 'arc-training',    dose: `20-30 min continuous on ${arcGrade}, conversation pace` },
    // Strength / finger tendon block (after climbing so climbing is fresh work)
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

// Session 2 — Power Endurance. Simple structure:
//   1. Wrist + shoulder prep
//   2. 1 warmup route
//   3. 4x4 workout (the main event)
//   4. ARC cool-down (10-15 min easy climbing)
function session2Steps({ warmupGrade, fourByFourGrade, cooldownGrade }) {
  return [
    // Prep block
    { ex: 'hip-mobility',  dose: '5-7 min hip stretches — start warm' },
    { ex: 'joint-prep',    dose: '5 min wrist + shoulder routine' },
    // Climbing block
    { ex: 'warmup-route',  dose: `1 easy route at ${warmupGrade}` },
    { ex: 'route-reading', dose: 'Read the 4 routes you\'ll do before starting the 4x4' },
    { ex: 'four-by-four',  dose: `4 routes at ${fourByFourGrade}, back-to-back · 4 rounds, 3-5 min rest between rounds` },
    { ex: 'arc-cooldown',  dose: `10-15 min easy on ${cooldownGrade} — flush the pump` },
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
    goal: "Consolidate 5.10a-b top rope. Establish movement fundamentals, tendon capacity, and the antagonist habit that keeps you climbing at 40.",
    principles: [
      "Technique is your ceiling until 5.11a — every session, name ONE thing you're working on.",
      "Warm up like it's the workout. Cold fingers + hard grips = torn pulleys.",
      "48 hours between hard climbing sessions. Session 4 (full body) can go on rest days.",
      "Log every attempt — flash / send / worked. This is your motivation over months.",
    ],
    sessions: {
      'Session 1': {
        steps: session1Steps({
          warmupGrade: '5.7',
          effGradeFlash: '5.10a-b',
          effGradeSub:   '5.9-5.10a',
          arcGrade: '5.7',
          pullSets: 3,
          gripSecs: 5,
        }),
      },
      'Session 2': {
        steps: session2Steps({
          warmupGrade: '5.7',
          fourByFourGrade: '5.8-5.9 (achievable — you should finish all 16 climbs)',
          cooldownGrade: '5.7',
        }),
      },
      'Session 3': {
        steps: session3Steps({
          boulderGrade: 'V2-V3',
          driveGrade: '5.7-5.8',
        }),
      },
      'Session 4': { steps: SESSION_4_STEPS },
    },
    criteria: [
      'Flashed 5.10b top-rope in 3 consecutive sessions',
      'ARC sessions feel sustainable (no forearm burnout at 20 min)',
      'Session 4 (full body) is happening at least 1× per week consistently',
      'Movement on flash-grade routes feels controlled, not desperate',
    ],
  },

  // ---------- Phase 2 ----------
  {
    id: 2,
    name: 'Consolidation',
    targetTopRope: '5.10d',
    targetBoulder: 'V4',
    goal: "Flashing 5.10c-d, projecting 5.11a. Weighted pull-ups enter. ARC volume increases. This is where efficiency becomes visible under pump.",
    principles: [
      "Grade tick-ups come from movement economy, not just strength. Time each rest position on the wall.",
      "Weighted pull-ups replace negatives — 4 sets × 5, add ~5 lb every 2 weeks.",
      "Grip holds bump to 7s on/off. Still low intensity.",
      "Route-reading habitual — 60 sec on the ground before every climb.",
    ],
    sessions: {
      'Session 1': {
        steps: [
          ...session1Steps({
            warmupGrade: '5.7-5.8',
            effGradeFlash: '5.10c-d',
            effGradeSub:   '5.10a-b',
            arcGrade: '5.8',
            pullSets: 4,
            pullVariant: 'weighted-pullup',
            gripSecs: 7,
          }),
          { ex: 'route-reading', dose: 'Explicit ground-read before every efficiency attempt (60s min)' },
        ],
      },
      'Session 2': {
        steps: session2Steps({
          warmupGrade: '5.7-5.8',
          fourByFourGrade: '5.9-5.10a',
          cooldownGrade: '5.7-5.8',
        }),
      },
      'Session 3': {
        steps: session3Steps({
          boulderGrade: 'V3-V4',
          driveGrade: '5.8-5.9',
        }),
      },
      'Session 4': { steps: SESSION_4_STEPS },
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
    goal: "LEAD CLIMB CERTIFICATION. Onsight 5.11a on lead, project 5.11b. Success this phase = the moment you can hook in for the rest of your climbing life.",
    principles: [
      "Lead certification is THIS phase's mission. Get certified within 6-8 weeks.",
      "Mock lead for 2 weeks before real lead. Clip mechanics automatic first.",
      "Fall practice is mandatory — small controlled falls, twice a week. Head game matters more than strength here.",
      "Hangboard repeaters ENTER (Phase 3+). Advanced tool — build slow. Skip if any elbow / finger tenderness.",
    ],
    sessions: {
      'Session 1': {
        steps: session1Steps({
          warmupGrade: '5.8',
          effGradeFlash: '5.11a-b',
          effGradeSub:   '5.10c-d',
          arcGrade: '5.9',
          pullSets: 4,
          pullVariant: 'weighted-pullup',
          gripSecs: 7,
          hangboard: true,
        }),
      },
      'Session 2': {
        steps: [
          { ex: 'joint-prep',    dose: '5 min routine' },
          { ex: 'warmup-route',  dose: '1 easy route at 5.8' },
          { ex: 'clip-practice', dose: 'On TR at each bolt, practice clip mechanics · 1 route' },
          { ex: 'mock-lead',     dose: 'On TR trailing a lead rope, mock-clip each bolt · 1-2 routes' },
          { ex: 'four-by-four',  dose: '4 routes at 5.10a-b · 4 rounds' },
          { ex: 'arc-cooldown',  dose: '10 min easy on 5.7-5.8' },
        ],
      },
      'Session 3': {
        steps: [
          { ex: 'joint-prep',      dose: '5 min routine' },
          { ex: 'warmup-boulder',  dose: '1 easy V0 boulder or short traverse' },
          { ex: 'boulder-block',   dose: '30 min at V4-V5, quality over volume' },
          { ex: 'movement-drill',  dose: 'Pick ONE drill and go deep · 2-3 routes at 5.9-5.10a' },
          { ex: 'fall-practice',   dose: '5-10 controlled falls on lead, well below redpoint · with experienced belayer' },
          { ex: 'lead-cert-drill', dose: 'Mock lead-cert exam on 5.9 · until it passes cleanly' },
        ],
      },
      'Session 4': { steps: SESSION_4_STEPS },
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
    goal: "Onsight 5.11c, project 5.12a. Serious power endurance work — this is where the 5.11-to-5.12 gap gets closed.",
    principles: [
      "Projects enter — dedicated sessions to WORK a single hard route over weeks.",
      "Power endurance is the limiter now. 4x4s become non-negotiable.",
      "Outdoor practice starts appearing when weather allows — a session/month.",
      "Bouldering V4-V5 supports movement power for route cruxes.",
    ],
    sessions: {
      'Session 1': {
        steps: session1Steps({
          warmupGrade: '5.8-5.9',
          effGradeFlash: '5.11b-c',
          effGradeSub:   '5.11a',
          arcGrade: '5.9-5.10a',
          pullSets: 4,
          pullVariant: 'weighted-pullup',
          gripSecs: 10,
          hangboard: true,
        }),
      },
      'Session 2': {
        steps: [
          { ex: 'joint-prep',    dose: '5 min routine' },
          { ex: 'warmup-route',  dose: '1 easy route at 5.8-5.9' },
          { ex: 'four-by-four',  dose: '4 routes at 5.10c-d · 4 rounds' },
          { ex: 'route-repeats', dose: '2 routes at 5.11a-b · 3 laps each · project moves on last lap' },
          { ex: 'fall-practice', dose: '3-5 falls above bolt 4, working comfort' },
          { ex: 'arc-cooldown',  dose: '10 min easy' },
        ],
      },
      'Session 3': {
        steps: [
          { ex: 'joint-prep',      dose: '5 min routine' },
          { ex: 'warmup-boulder',  dose: '1 easy V0 boulder' },
          { ex: 'boulder-block',   dose: '30-45 min at V4-V5' },
          { ex: 'movement-drill',  dose: 'Pick ONE drill · drop knees + flags on 3 routes at 5.10' },
          { ex: 'clip-practice',   dose: 'On lead when possible — automate clip stance under fatigue' },
        ],
      },
      'Session 4': { steps: SESSION_4_STEPS },
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
    goal: "Onsight 5.11d, project 5.12b. Outdoor toolkit becomes routine — anchor building, cleaning, rope management. Multi-pitch basics.",
    principles: [
      "Outdoor skills trained ON THE GROUND until automatic. Rehearse in the gym / beginner outdoor first.",
      "Projects run 4-8 weeks. Have TWO: one at redpoint level, one a grade above.",
      "Recovery matters more than volume now. Every 5th week is 50% volume.",
      "Video every project attempt — you'll spot beta refinements from watching that you never notice in the moment.",
    ],
    sessions: {
      'Session 1': {
        steps: session1Steps({
          warmupGrade: '5.9',
          effGradeFlash: '5.11d-5.12a',
          effGradeSub:   '5.11b-c',
          arcGrade: '5.10',
          pullSets: 4,
          pullVariant: 'weighted-pullup',
          gripSecs: 10,
          hangboard: true,
        }),
      },
      'Session 2': {
        steps: [
          { ex: 'joint-prep',      dose: '5 min routine' },
          { ex: 'warmup-route',    dose: '1 easy route at 5.9' },
          { ex: 'four-by-four',    dose: '4 routes at 5.11a-b · 4 rounds' },
          { ex: 'route-repeats',   dose: '2 routes at 5.11c-d · 3 laps each' },
          { ex: 'anchor-building', dose: '10 min ground practice — SRENE anchor, 2 setups' },
          { ex: 'cleaning-anchor', dose: 'Practice threading + lowering on ground setup' },
          { ex: 'arc-cooldown',    dose: '10 min easy' },
        ],
      },
      'Session 3': {
        steps: [
          { ex: 'joint-prep',      dose: '5 min routine' },
          { ex: 'warmup-boulder',  dose: '1 easy V0 boulder' },
          { ex: 'boulder-block',   dose: '30 min at V5-V6, focus on crux-move patterns' },
          { ex: 'movement-drill',  dose: 'Pick ONE drill · drill deep on 3 routes' },
          { ex: 'rope-management', dose: 'Coiling, flaking, back-clipping prevention · 10 min' },
          { ex: 'fall-practice',   dose: 'Increasing height above bolt — building outdoor whipper comfort' },
        ],
      },
      'Session 4': { steps: SESSION_4_STEPS },
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
    goal: "SEND 5.12d. Whether outdoor or indoor. This phase is individualized — you know your body now. Project cycles, peaking, dedicated rest.",
    principles: [
      "Structure is your own now. Match training to what the project demands.",
      "Peak periodization: 3-week hard training block → 1 week light → project attempts.",
      "Mental game is 50% of the send. Visualization, breathwork, fall commitment.",
      "Outdoor > indoor for this grade — real rock rewards efficient movement in a way plastic doesn't.",
    ],
    sessions: {
      'Session 1': {
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
      'Session 2': {
        steps: [
          { ex: 'joint-prep',    dose: '5 min routine' },
          { ex: 'warmup-route',  dose: '1 easy route' },
          { ex: 'four-by-four',  dose: '4 routes at 5.11c-d · 4 rounds' },
          { ex: 'route-repeats', dose: 'Project laps — climb the project in sections, work each crux' },
          { ex: 'fall-practice', dose: 'Big-air whippers — where the project demands commitment' },
        ],
      },
      'Session 3': {
        steps: [
          { ex: 'joint-prep',      dose: '5 min routine' },
          { ex: 'warmup-boulder',  dose: '1 easy V0 boulder' },
          { ex: 'boulder-block',   dose: '30 min at V6-V7, matching crux difficulty' },
          { ex: 'movement-drill',  dose: 'Specific to project weakness — micro-drilling crux beta' },
        ],
      },
      'Session 4': { steps: SESSION_4_STEPS },
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
