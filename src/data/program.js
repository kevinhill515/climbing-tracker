// Climbing progression program — 6 phases, skill-based advancement.
// Top-rope focused with bouldering as a movement / power supplement.
// End goal: 5.12d, lead-climb certified, prepared for outdoor.

export const SESSION_TYPES = ['Session 1', 'Session 2', 'Session 3'];

export const SESSION_META = {
  'Session 1': {
    color: 'orange',
    icon: '◔',
    focus: 'Full — technique + strength + endurance + antagonist',
    time: '90–120 min',
  },
  'Session 2': {
    color: 'amber',
    icon: '◑',
    focus: 'Power endurance — 4x4s + route repeats',
    time: '75–90 min',
  },
  'Session 3': {
    color: 'rose',
    icon: '◕',
    focus: 'Movement + power — bouldering + skill drills',
    time: '60–75 min',
  },
};

// Antagonist set — attached to Sessions 1 and 3 (2x/week is the sweet spot).
export const ANTAGONIST_ITEMS = [
  { ex: 'push-up',            dose: '3 × 15' },
  { ex: 'ext-rotation',       dose: '3 × 15 each side' },
  { ex: 'wrist-ext',          dose: '3 × 15' },
  { ex: 'reverse-wrist-curl', dose: '3 × 15' },
];

// Session ORDER within a session matters. The rule: fresh energy for
// hardest neural / technical work first, endurance last.
//   1. Warm-up
//   2. Efficiency / skill (fresh mind & body)
//   3. Power / strength (still recovered)
//   4. Endurance / volume (grinds you down safely)
//   5. Antagonist (opposing muscles, low intensity)

// Helpers to build phase-specific session step lists — each phase
// substitutes its target grade + intensity.
function fullSessionSteps({ efficiencyGrade, arcGrade, pullSets, gripSecs, hangboard = false }) {
  const steps = [
    { ex: 'warmup-routes', dose: '2–3 easy routes (5.7–5.8), flow continuously · 10–15 min' },
    { ex: 'joint-prep',    dose: '5 min — wrists, shoulders, scap' },
    { ex: 'efficiency-work', dose: `3–5 routes at ${efficiencyGrade}, ONE focus per attempt · 30–40 min` },
    { ex: 'pullup-negative', dose: `${pullSets} sets × 5 reps (3–5s lower) · rest 2 min` },
    { ex: 'grip-half-crimp', dose: `5× ${gripSecs}s on / ${gripSecs}s off — low intensity` },
    { ex: 'grip-open-drag',  dose: `5× ${gripSecs}s on / ${gripSecs}s off — low intensity` },
    { ex: 'grip-sloper',     dose: `5× ${gripSecs}s on / ${gripSecs}s off — low intensity` },
  ];
  if (hangboard) {
    steps.push({ ex: 'hangboard-repeaters', dose: '7s on / 3s off × 6 reps × 6 sets (3 min rest between sets)' });
  }
  steps.push({ ex: 'arc-training', dose: `20–30 min continuous on ${arcGrade}, stay below the pump` });
  return steps;
}

function enduranceSessionSteps({ fourByFourGrade, repeatGrade }) {
  return [
    { ex: 'warmup-routes',  dose: '2–3 easy routes, flow continuously · 10 min' },
    { ex: 'joint-prep',     dose: '5 min' },
    { ex: 'four-by-four',   dose: `4 routes at ${fourByFourGrade}, back-to-back · 4 rounds, 3–5 min rest between rounds` },
    { ex: 'route-repeats',  dose: `2 routes at ${repeatGrade}, each climbed 3× · 3–5 min rest between attempts` },
  ];
}

function movementSessionSteps({ boulderGrade, driveGrade, includeLead = false }) {
  const steps = [
    { ex: 'warmup-boulder', dose: '2–3 V0 boulders / traversing · 10 min' },
    { ex: 'joint-prep',     dose: '5 min' },
    { ex: 'boulder-block',  dose: `30–45 min at ${boulderGrade}, quality over volume, 3–5 min rest between attempts` },
    { ex: 'movement-drill', dose: `Pick ONE drill (silent feet / drop knee / flag / hand-foot match), 2–3 easy routes at ${driveGrade}` },
    { ex: 'no-hands-slab',  dose: '4–6 reps on a slab route, 1–2 min rest' },
  ];
  if (includeLead) {
    steps.push({ ex: 'clip-practice', dose: 'On top rope, practice clipping at each bolt · 1 route' });
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
      "48 hours between hard sessions. Fingers rebuild slower than everything else.",
      "Log every attempt — flash / send / worked. This is your motivation over months.",
    ],
    sessions: {
      'Session 1': {
        steps: fullSessionSteps({
          efficiencyGrade: '5.10a-b (flash grade)',
          arcGrade: '5.7-5.8',
          pullSets: 3,
          gripSecs: 5,
        }),
        antagonist: true,
      },
      'Session 2': {
        steps: enduranceSessionSteps({
          fourByFourGrade: '5.9-5.10a',
          repeatGrade: '5.10a',
        }),
        antagonist: false,
      },
      'Session 3': {
        steps: movementSessionSteps({
          boulderGrade: 'V2-V3',
          driveGrade: '5.9-5.10a',
        }),
        antagonist: true,
      },
    },
    criteria: [
      'Flashed 5.10b top-rope in 3 consecutive sessions',
      'ARC sessions feel sustainable (no forearm burnout at 20 min)',
      'Antagonist training happening 2× per week consistently',
      'Movement on flash-grade routes feels controlled, not desperate',
    ],
  },

  // ---------- Phase 2 ----------
  {
    id: 2,
    name: 'Consolidation',
    targetTopRope: '5.10d',
    targetBoulder: 'V4',
    goal: "Flashing 5.10c-d, projecting 5.11a. Introduce weighted pull-ups. ARC volume increases. This is where efficiency becomes visible under pump.",
    principles: [
      "Grade tick-ups come from movement economy, not just strength. Time each rest position on the wall.",
      "Weighted pull-ups enter — 4 sets × 5, add ~5 lb every 2 weeks.",
      "Grip holds bump to 7 seconds on/off. Still low intensity.",
      "Start route-reading every climb — 60 seconds on the ground before pulling on.",
    ],
    sessions: {
      'Session 1': {
        steps: [
          { ex: 'warmup-routes',   dose: '2–3 easy routes · 10 min' },
          { ex: 'joint-prep',      dose: '5 min' },
          { ex: 'efficiency-work', dose: '3–5 routes at 5.10c-d, ONE focus per attempt · 30–40 min' },
          { ex: 'route-reading',   dose: 'Explicit ground-read before every climb (60s minimum)' },
          { ex: 'weighted-pullup', dose: '4 sets × 5 reps · rest 3 min' },
          { ex: 'grip-half-crimp', dose: '5× 7s on / 7s off' },
          { ex: 'grip-open-drag',  dose: '5× 7s on / 7s off' },
          { ex: 'grip-sloper',     dose: '5× 7s on / 7s off' },
          { ex: 'arc-training',    dose: '25–30 min continuous on 5.8-5.9' },
        ],
        antagonist: true,
      },
      'Session 2': {
        steps: enduranceSessionSteps({
          fourByFourGrade: '5.10a-b',
          repeatGrade: '5.10c',
        }),
        antagonist: false,
      },
      'Session 3': {
        steps: movementSessionSteps({
          boulderGrade: 'V3-V4',
          driveGrade: '5.10a-b',
        }),
        antagonist: true,
      },
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
    goal: "LEAD CLIMB CERTIFICATION. Onsight 5.11a on lead, project 5.11b. This phase's success = the moment you can hook in for the rest of your climbing life.",
    principles: [
      "Lead certification is THIS phase's mission. Get certified within 6–8 weeks.",
      "Mock lead for 2 weeks before real lead. Clip mechanics automatic first.",
      "Fall practice is mandatory — small controlled falls, twice a week. The head-game work matters more than the strength here.",
      "Hangboard repeaters enter (Phase 3+). Advanced tool — build slow. Skip if any elbow / finger tenderness.",
    ],
    sessions: {
      'Session 1': {
        steps: [
          { ex: 'warmup-routes',    dose: '2–3 easy routes · 10 min' },
          { ex: 'joint-prep',       dose: '5 min' },
          { ex: 'efficiency-work',  dose: '3–5 routes at 5.11a-b, ONE focus per attempt · 30–40 min' },
          { ex: 'weighted-pullup',  dose: '4 sets × 5 reps' },
          { ex: 'grip-half-crimp',  dose: '5× 7s on / 7s off — moderate' },
          { ex: 'grip-open-drag',   dose: '5× 7s on / 7s off — moderate' },
          { ex: 'grip-sloper',      dose: '5× 7s on / 7s off — moderate' },
          { ex: 'hangboard-repeaters', dose: '7s on / 3s off × 6 × 3 sets (introduce this phase — light)' },
          { ex: 'arc-training',     dose: '30 min continuous on 5.8-5.9' },
        ],
        antagonist: true,
      },
      'Session 2': {
        steps: [
          { ex: 'warmup-routes',   dose: '10 min' },
          { ex: 'joint-prep',      dose: '5 min' },
          { ex: 'clip-practice',   dose: 'On TR at each bolt, practice clip mechanics · 1 route' },
          { ex: 'mock-lead',       dose: 'On TR trailing a lead rope, mock-clip each bolt · 1–2 routes' },
          { ex: 'four-by-four',    dose: '4 routes at 5.10b-c · 4 rounds' },
          { ex: 'route-repeats',   dose: '2 routes at 5.10d · 3 laps each' },
        ],
        antagonist: false,
      },
      'Session 3': {
        steps: [
          { ex: 'warmup-boulder',  dose: '2–3 V0 boulders · 10 min' },
          { ex: 'joint-prep',      dose: '5 min' },
          { ex: 'boulder-block',   dose: '30 min at V4-V5, quality over volume' },
          { ex: 'fall-practice',   dose: '5–10 controlled falls on lead, well below redpoint · with experienced belayer' },
          { ex: 'lead-cert-drill', dose: 'Mock lead-cert exam on 5.9 · until it passes cleanly' },
          { ex: 'movement-drill',  dose: 'ONE drill on 2 easy routes' },
        ],
        antagonist: true,
      },
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
        steps: [
          { ex: 'warmup-routes',    dose: '2–3 easy routes · 10 min' },
          { ex: 'joint-prep',       dose: '5 min' },
          { ex: 'efficiency-work',  dose: '3–5 routes at 5.11b-c · 30–40 min' },
          { ex: 'weighted-pullup',  dose: '4 sets × 5 reps (bodyweight + 25-30 lb)' },
          { ex: 'grip-half-crimp',  dose: '5× 10s on / 10s off' },
          { ex: 'grip-open-drag',   dose: '5× 10s on / 10s off' },
          { ex: 'grip-sloper',      dose: '5× 10s on / 10s off' },
          { ex: 'hangboard-repeaters', dose: '7s on / 3s off × 6 × 5 sets' },
          { ex: 'arc-training',     dose: '30–40 min on 5.9-5.10a' },
        ],
        antagonist: true,
      },
      'Session 2': {
        steps: [
          { ex: 'warmup-routes', dose: '10 min' },
          { ex: 'joint-prep',    dose: '5 min' },
          { ex: 'four-by-four',  dose: '4 routes at 5.10c-d · 4 rounds' },
          { ex: 'route-repeats', dose: '2 routes at 5.11a-b · 3 laps each · project moves on last lap' },
          { ex: 'fall-practice', dose: '3–5 falls above bolt 4, working comfort' },
        ],
        antagonist: false,
      },
      'Session 3': {
        steps: [
          { ex: 'warmup-boulder', dose: '10 min' },
          { ex: 'joint-prep',     dose: '5 min' },
          { ex: 'boulder-block',  dose: '30–45 min at V4-V5' },
          { ex: 'movement-drill', dose: 'Drop knees + flags on 3 routes at 5.10' },
          { ex: 'clip-practice',  dose: 'On lead when possible — automate clip stance under fatigue' },
        ],
        antagonist: true,
      },
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
      "Outdoor skills are trained ON THE GROUND until they're automatic. Rehearse in the gym / on beginner outdoor first.",
      "Projects run 4-8 weeks. Have TWO projects: one right at redpoint level, one one grade above.",
      "Recovery matters more than volume now. Every 5th week is 50% volume.",
      "Video every project attempt — you'll spot beta refinements from watching that you never notice in the moment.",
    ],
    sessions: {
      'Session 1': {
        steps: [
          { ex: 'warmup-routes',    dose: '2–3 easy routes · 10 min' },
          { ex: 'joint-prep',       dose: '5 min' },
          { ex: 'efficiency-work',  dose: '3–5 routes at 5.11d-5.12a · 30–40 min' },
          { ex: 'weighted-pullup',  dose: '4 sets × 5 reps' },
          { ex: 'grip-half-crimp',  dose: '5× 10s on / 10s off' },
          { ex: 'grip-open-drag',   dose: '5× 10s on / 10s off' },
          { ex: 'grip-sloper',      dose: '5× 10s on / 10s off' },
          { ex: 'hangboard-repeaters', dose: '7s on / 3s off × 6 × 6 sets' },
          { ex: 'arc-training',     dose: '40 min on 5.10' },
        ],
        antagonist: true,
      },
      'Session 2': {
        steps: [
          { ex: 'warmup-routes',   dose: '10 min' },
          { ex: 'joint-prep',      dose: '5 min' },
          { ex: 'four-by-four',    dose: '4 routes at 5.11a-b · 4 rounds' },
          { ex: 'route-repeats',   dose: '2 routes at 5.11c-d · 3 laps each' },
          { ex: 'anchor-building', dose: '10 min ground practice — SRENE anchor, 2 setups' },
          { ex: 'cleaning-anchor', dose: 'Practice threading + lowering on ground setup' },
        ],
        antagonist: false,
      },
      'Session 3': {
        steps: [
          { ex: 'warmup-boulder',  dose: '10 min' },
          { ex: 'joint-prep',      dose: '5 min' },
          { ex: 'boulder-block',   dose: '30 min at V5-V6, focus on crux-move patterns' },
          { ex: 'rope-management', dose: 'Coiling, flaking, back-clipping prevention drills · 10 min' },
          { ex: 'fall-practice',   dose: 'Increasing height above bolt — building for outdoor whipper comfort' },
        ],
        antagonist: true,
      },
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
          { ex: 'warmup-routes',    dose: '2–3 easy routes · 15 min' },
          { ex: 'joint-prep',       dose: '5 min' },
          { ex: 'efficiency-work',  dose: 'Project attempts (5.12c-d) — 3-5 tries with full recovery · 45 min' },
          { ex: 'weighted-pullup',  dose: '4 sets × 3-5 reps at max weight' },
          { ex: 'hangboard-repeaters', dose: '7s/3s × 6 × 6 sets, high intensity' },
          { ex: 'arc-training',     dose: '40 min' },
        ],
        antagonist: true,
      },
      'Session 2': {
        steps: [
          { ex: 'warmup-routes',   dose: '15 min' },
          { ex: 'joint-prep',      dose: '5 min' },
          { ex: 'four-by-four',    dose: '4 routes at 5.11c-d · 4 rounds' },
          { ex: 'route-repeats',   dose: 'Project laps — climb the project in sections, work each crux' },
          { ex: 'fall-practice',   dose: 'Big-air whippers — where the project demands commitment' },
        ],
        antagonist: false,
      },
      'Session 3': {
        steps: [
          { ex: 'warmup-boulder',  dose: '10 min' },
          { ex: 'joint-prep',      dose: '5 min' },
          { ex: 'boulder-block',   dose: '30 min at V6-V7, matching crux difficulty' },
          { ex: 'movement-drill',  dose: 'Specific to project weakness — micro-drilling crux beta' },
        ],
        antagonist: true,
      },
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
