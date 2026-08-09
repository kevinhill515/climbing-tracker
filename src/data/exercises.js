// Exercise dictionary for the climbing program — each entry has a
// name, a "why", and a detailed how-to cue. No YouTube links (per user
// preference on calisthenics-tracker; descriptions do the work).

export const EXERCISES = {
  // ---------- SESSION 1: DYNAMIC WARM-UP ----------
  'dyno-warmup': {
    name: 'Dynamic climbing warm-up',
    cue:
      'On a 0–20° overhang wall, climb through 3 easy boulders (V0 or well below flash) back-to-back with minimal stopping. The point is fluid movement, not sending — flow, breathe, feel your hands and feet wake up. Rest 2–5 min between each boulder.',
    why:
      'Warms up movement patterns and the joints that finger-heavy climbing punishes. Never touch the fingerboard cold.',
  },

  // ---------- SESSION 1: TECHNIQUE ----------
  'no-hands-slab': {
    name: 'No-hands slab',
    cue:
      'On a slab or gently inclined wall, climb using ONLY your feet — hands touch the wall for balance only, no gripping. Move slow, watch your feet the whole way, focus on trusting the outside edge and precise placement. 6 reps with 1–2 min rest.',
    why:
      "Footwork is the #1 technique limiter at V2–V3. Removing your hands forces you to actually see and trust your feet — which is how everything above V3 gets easier without needing more finger strength.",
  },

  // ---------- SESSION 1: PULLING STRENGTH ----------
  'pullup-negative': {
    name: 'Pull-up negatives',
    cue:
      'Start at the top of a pull-up (chin over bar, controlled). Lower yourself down for 3–5 seconds, arms fully extended at the bottom. Reset (jump/step back up) and repeat. 5 reps per set, 3 sets, 2 min rest between sets.',
    why:
      "Builds pulling strength and shoulder stability without loading fingers to failure. Eccentric-focused so your shoulders learn to control tension through the full range — key for lock-offs.",
  },

  // ---------- SESSION 1: FINGER HEALTH FOUNDATION ----------
  'grip-half-crimp': {
    name: 'Half-crimp engagement',
    cue:
      'On a fingerboard or hangboard: index/middle/ring fingers on a medium edge (15–20mm), first knuckle bent ~90°, thumb relaxed, pinky follows the ring. Engage lightly — this is not a max hang. Hold 5s, rest 5s, repeat 5 times. Low intensity throughout.',
    why:
      'Half crimp is the most versatile grip position and the most vulnerable to injury at high load. Building tendon capacity slowly at low intensity is how you avoid a career-ending A2 pulley tear later.',
  },
  'grip-open-drag': {
    name: 'Open-hand 3-finger drag',
    cue:
      'Same edge, but only index/middle/ring engaged, fingers straight (not crimped), thumb off. Pull down like you\'re dragging your fingers off a shelf. 5s on, 5s off, 5 reps.',
    why:
      'Open-hand loads the fingers differently than crimp — recruits more of the finger flexors, less of the pulleys. Prevents overuse of a single grip pattern.',
  },
  'grip-sloper': {
    name: 'Sloper / full open hand',
    cue:
      'On a sloping hold or the wider part of the fingerboard, all four fingers relaxed and spread, palm engaged. Squeeze the hold like it\'s a doorknob. 5s on, 5s off, 5 reps.',
    why:
      'Slopers train grip strength through the whole hand and forearm rather than isolated tendons. Also the grip pattern you\'ll most need at gyms with modern volume-heavy setting.',
  },

  // ---------- SESSION 1 & 2: EFFICIENCY TRAINING ----------
  'efficiency-work': {
    name: 'Efficiency training',
    cue:
      'Pick a boulder at your current flash grade (V2–V3). Climb it once. Identify ONE specific thing to improve — foot placement on move 3, hip turn on the crux, silent hand placements, breathing pattern. Rest 2–5 min. Climb it again with only that focus. Repeat 3× per boulder. Move to 3–5 more boulders using the same protocol. 45 min total.',
    why:
      "This is the training. Technique is the primary limiter at your level, not strength. Deliberate repetition on ONE variable at a time is how you actually rewire movement — mindlessly re-attempting the same boulder is not.",
  },

  // ---------- SESSION 3: (repeats warmup + slab) ----------

  // ---------- ADVANCED — introduced in later phases ----------
  'oneam-hang-prog': {
    name: 'One-arm hang progression',
    cue:
      'Two-hand jug hang → shift 70/30 to one arm → 80/20 → 90/10 → assisted one-arm hang (feet on stool). Never full one-arm at Phase 3; that\'s Phase 4+ territory. Low intensity, 10s holds, 5 reps per side.',
    why:
      'Introduces one-arm loading gradually. Doing full one-arm hangs too early is the single most reliable way to blow a pulley on a young climber.',
  },
  'campus-training': {
    name: 'Campus board (basics)',
    cue:
      'Large rungs only for Phase 3. Ladder pattern: both hands on bottom rung, deadhang, then move one hand to the next rung, feet stay off. 3–5 rungs up. Contact strength focus, not fatigue.',
    why:
      "Contact strength for dynamic moves. Skip entirely until Phase 3 — campus board on soft tendons is how careers end.",
  },

  // ---------- ANTAGONIST TRAINING (2x/week module) ----------
  'push-up': {
    name: 'Push-ups',
    cue:
      'Standard push-up form: hands shoulder-width, body straight, chest to the ground, full lockout. 3 sets of 15.',
    why:
      "Climbers develop massive pulling capacity and neglected pushing capacity. The imbalance rounds shoulders forward and sets up impingement / rotator cuff issues.",
  },
  'ext-rotation': {
    name: 'External rotation',
    cue:
      'Dumbbell or resistance band. Elbow tucked to your side at 90°, forearm parallel to the ground. Rotate outward, keeping elbow pinned. 3 sets of 15 each side.',
    why:
      "Directly targets the rotator cuff muscles that climbing under-trains. Prevents the impingement pattern that ends most climbing careers by 40.",
  },
  'wrist-ext': {
    name: 'Wrist extension',
    cue:
      'Light dumbbell (2–5 lb). Forearm on your thigh, palm down, dumbbell hanging off the edge. Curl the wrist up. Slow. 3 sets of 15.',
    why:
      'Balances the massive flexor training climbing does. Prevents tennis-elbow-style medial epicondylitis (the climber\'s elbow).',
  },
  'reverse-wrist-curl': {
    name: 'Reverse wrist curl',
    cue:
      'Same setup as wrist extension but palm up, or use a light barbell. Curl the wrist upward. Slow tempo. 3 sets of 15.',
    why:
      "Trains the wrist flexors in an unfamiliar range and reinforces forearm balance. Combined with extensions, dramatically reduces elbow pain risk.",
  },
};

export function getExercise(id) {
  return EXERCISES[id] || { name: id, cue: '', why: '' };
}
