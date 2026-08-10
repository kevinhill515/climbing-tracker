// Exercise dictionary for the climbing program — a real coach's toolkit
// oriented for a top-rope climber with 5.12d as the north star.

export const EXERCISES = {
  // ============ WARM-UPS ============
  // Category flags:
  //   on_wall: true    → climbing exercise. Session sheet uses ClimbLogSheet
  //                      (grade + result + difficulty) and shows an
  //                      "On wall" chip / orange badge.
  //   checklist: [...] → tick-through prep list. Session sheet uses PrepSheet
  //                      (no set-based logging, just checkoff).
  //   neither          → strength / accessory. Uses standard ExerciseSheet.

  'warmup-route': {
    on_wall: true,
    name: 'Warm-up route',
    cue:
      "One easy route (5.7 for you right now, or ~3 grades below your flash) — flow it slowly, take controlled rest positions, big breaths. This is the ONE route where nothing hard happens. Save your hard climbing for when you're warm.",
    why:
      "Every session starts here. Cold fingers + cold shoulders are the two most reliable ways to end a session with an injury. One easy route wakes up tissue temperature and rehearses movement patterns.",
  },
  'warmup-boulder': {
    on_wall: true,
    name: 'Warm-up boulder',
    cue:
      "One V0 boulder or short traverse (~10 moves). Flow it slowly — the point is to get your fingers and shoulders warm, not to attempt anything.",
    why:
      "When bouldering is the focus session, warming up on the wall lets you find the movement patterns your body needs today.",
  },
  'joint-prep': {
    name: 'Wrist + shoulder prep',
    cue:
      "5-min joint-wake-up before any climbing. Tick items off as you go — no need to log reps or time here.",
    why:
      "Fingers get 90% of climbing-prep attention, but shoulders and wrists get loaded just as hard. Neglecting joint prep is how climbers get shoulder impingement + wrist tendinitis by their 40s. 5 minutes for a career of climbing — worth it.",
    checklist: [
      { name: 'Wrist circles',              dose: '10 each direction, both wrists' },
      { name: 'Prayer stretch',             dose: 'Palms together at chest, lower to waist · hold 30s' },
      { name: 'Reverse prayer',             dose: 'Backs of hands together, raise up · hold 30s' },
      { name: 'Fingers-forward wrist hold', dose: 'Hands on floor, fingers toward knees, rock weight · 30s' },
      { name: 'Band pull-aparts',           dose: '15 reps, hold band wide, squeeze shoulder blades' },
      { name: 'Arm circles',                dose: '10 forward, 10 backward — small then large' },
      { name: 'Scapular pull-ups',          dose: '8 reps on a bar, straight arms, move only the blades' },
    ],
  },

  'hip-mobility': {
    name: 'Hip mobility',
    cue:
      "Hip flexibility drives every drop knee, high step, and heel hook. Do these at the END of a session when the body is warm — 5-7 min total.",
    why:
      "Tight hips force you to compensate with arms — every drop knee becomes a lock-off, every high step becomes a campus-move. Getting to 5.12+ WITHOUT hip mobility is possible but exhausting. Getting there WITH it is a smoother ride.",
    checklist: [
      { name: 'Downward dog → cobra flow',   dose: '5 slow reps (breath-linked)' },
      { name: 'Hip flexor lunge stretch',    dose: '45s each side (front knee 90°, hips forward)' },
      { name: 'Pigeon pose',                 dose: '60s each side (fold over the front shin)' },
      { name: '90/90 hip stretch',           dose: '45s each side (front + back leg at 90°)' },
      { name: 'Deep squat hold',             dose: '60s (heels down if possible, else on a book)' },
      { name: 'Butterfly / seated straddle', dose: '60s (relax knees down)' },
      { name: 'Frog pose',                   dose: '45s (knees wide, hips back)' },
    ],
  },

  // ============ TECHNIQUE / EFFICIENCY ============
  'efficiency-work': {
    on_wall: true,
    name: 'Efficiency training',
    cue:
      "Pick a route at your flash grade. Climb it once. Identify ONE thing to improve — foot placement, hip rotation, breath timing, a specific move. Rest 2-5 min. Climb the same route again with that single focus. Repeat 3× per route, then move to 3-5 more routes.",
    why:
      "This is THE workout for your level. Technique is your #1 limiter until 5.11a, and even at 5.12 it accounts for more of your ceiling than strength. Repeating a route with a fresh focus is how you actually rewire movement — cycling mindlessly through new routes does not.",
  },
  'movement-drill': {
    on_wall: true,
    name: 'Movement drill (pick ONE per session)',
    cue:
      "Pick ONE of these each session and drill it deep for 15-20 min on 2-3 easy routes. Rotate weekly — the goal is to make each pattern automatic.\n\n" +
      "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n" +
      "1. SILENT FEET\n" +
      "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n" +
      "WHAT: Climb without a single audible foot placement. No scraping, no shuffling, no re-adjusting.\n" +
      "HOW: Look at the hold BEFORE moving your foot. Aim for the sweet spot (big toe or outside edge). Place the shoe softly — imagine putting it down without waking a baby.\n" +
      "FEELING: You feel exactly where your foot contacts. If it slips, you know why.\n" +
      "MISTAKE: Rushing. Looking at hands, not feet. Using arch of the shoe (never — use the toe or outside edge).\n" +
      "SUCCESS: 30 seconds of climbing without a single scrape.\n\n" +

      "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n" +
      "2. DROP KNEE\n" +
      "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n" +
      "WHAT: On side-pull holds, rotate your inside knee DOWN and inward toward the floor.\n" +
      "HOW: One foot on a hold. Twist your same-side hip to face the wall. The knee drops toward the ground. Your foot ends up on its outside edge.\n" +
      "FEELING: Hip presses INTO the wall. Weight shifts onto the outside edge. Your arm can now be nearly straight to reach — you're locked off from the hips, not the biceps.\n" +
      "MISTAKE: Rotating from the shoulder instead of the hip. Not committing to the drop (half-drop = no benefit).\n" +
      "SUCCESS: A drop knee extends your reach 6-8 inches without extra strength.\n\n" +

      "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n" +
      "3. FLAG\n" +
      "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n" +
      "WHAT: When one leg has no hold, extend it out (behind, across, or forward) for counterbalance.\n" +
      "HOW: Recognize the barn-door — you're about to swing OUT from the wall because your weight is one-sided. BEFORE swinging, extend the free leg opposite the pulling side.\n" +
      "FEELING: You stay flat against the wall instead of rotating off it. Body is a straight line, foot as counterweight.\n" +
      "MISTAKE: Flagging LATE — after you've already started swinging. Flagging on the wrong side.\n" +
      "SUCCESS: You can pull on a side-hold with NO foot on the same side and stay flush to the wall.\n\n" +

      "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n" +
      "4. HAND-FOOT MATCH\n" +
      "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n" +
      "WHAT: Step your foot on the SAME hold your hand is holding, then move that hand off.\n" +
      "HOW: Recognize when a hand-hold is also big enough for a foot. Weight the hand, place foot next to it, transfer weight to foot, remove hand.\n" +
      "FEELING: Smooth transfer, no wobble. Foot fills the exact space the hand just left.\n" +
      "MISTAKE: Stepping onto the tiny 'nose' of the hold when there's a better spot. Losing balance during the transition.\n" +
      "SUCCESS: You can hand-foot match on any large hold without pause.\n\n" +

      "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n" +
      "5. OUTSIDE EDGE / HIP-IN\n" +
      "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n" +
      "WHAT: On side-pull holds, turn your inside hip toward the wall. Use the OUTSIDE of your foot on the hold.\n" +
      "HOW: Instead of squaring off to the wall (hands on side pulls, chest facing out), rotate 45-90° so your hip is pressing into the wall. Foot rotates with you — outside edge on the hold.\n" +
      "FEELING: Elbow drops. Arm goes straight. Hip and shoulder are in a plane with the wall. Reach comes from the hip rotation, not the arm pull.\n" +
      "MISTAKE: Not committing to the rotation (half-turn = no lock-off). Using inside edge (foot then slips as you rotate).\n" +
      "SUCCESS: Side pulls feel like straight-arm reaches, not pull-ups. Your forearm burn drops noticeably.\n\n" +

      "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n" +
      "BONUS: STRAIGHT-ARM RESTS + BREATHING\n" +
      "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n" +
      "Once the 5 above feel decent, layer these into your climbing:\n" +
      "- Between moves, ACTIVELY straighten your arms — hang on the skeleton, not the muscles.\n" +
      "- Slow steady breaths — exhale on the pull, inhale on the reset. If you catch yourself holding your breath, that's the panic response and it doubles your pump rate.",
    why:
      "Movement drills are the highest-leverage training you can do at your level. Named patterns become 'moves in your vocabulary' — the more you rehearse them deliberately, the more your body picks them automatically when a real climb calls for them.",
  },
  'silent-feet': {
    name: 'Silent feet drill',
    cue:
      "Climb an easy route with ONE rule: not a single foot placement makes noise. If you scrape, you stop, look, and re-place correctly. Look at the hold BEFORE moving. Aim for the toe or outside edge — never the arch. Place softly.",
    why:
      "Sloppy footwork is the difference between 5.10 and 5.11 for most climbers. Force-training precision at low grades builds it into your default.",
  },
  'no-hands-slab': {
    on_wall: true,
    name: 'No-hands slab',
    cue:
      "On a slab (up to ~85°), climb using ONLY your feet — hands touch the wall for balance only, never grip. Watch every foot placement, trust the rubber, weight the feet.",
    why:
      "The single biggest 5.10-to-5.11 or V3-to-V5 unlock is trusting your feet. Removing hands forces the trust — you can't fake it.",
  },
  'route-reading': {
    name: 'Route reading',
    cue:
      "Before pulling on, trace the whole route with your eyes. Identify: (1) the crux moves, (2) potential rest positions, (3) hand-foot sequences. Commit to the plan in your head, THEN start.",
    why:
      "Reading a route on the ground costs zero energy but saves 30% of it during the climb. Bad reading = redundant moves, missed rests, and a pump you didn't need.",
  },

  // ============ ENDURANCE ============
  'arc-training': {
    on_wall: true,
    name: 'ARC training',
    cue:
      "Aerobic Restoration + Capillarity: 20-30 min of CONTINUOUS climbing at a grade 3-4 letters below your flash (usually 5.7 for you now). You should be able to hold a conversation. If you get pumped, you're going too hard — slow down. Traverse if you run out of route. NO stopping.",
    why:
      "ARC builds capillary density in the forearms — the physiological basis for climbing endurance. It doesn't feel like training when you do it, but it's what separates a 5.11 climber who pumps out at bolt 4 from one who cruises to the anchors.",
  },
  'arc-cooldown': {
    on_wall: true,
    name: 'ARC cool-down',
    cue:
      "10-15 min of easy continuous climbing at 5.7 or below. Not for training — for actively flushing out lactic acid and cementing efficient movement in a tired body.",
    why:
      "Ending a hard session on the wall with easy movement helps recovery and reinforces good technique even under fatigue.",
  },
  'four-by-four': {
    on_wall: true,
    name: '4x4 workout',
    cue:
      "Pick 4 routes at ~2 grades below your flash. Climb all 4 back-to-back with minimal rest (~30-60s between). After the 4th, rest 3-5 min. That's 1 round. Complete 4 rounds. Brutal but transformative.",
    why:
      "Power endurance = ability to keep pulling hard when pumped. This is the workout that turns 'I can do the moves' into 'I can send the route.' Central to breaking into the 5.11s.",
  },
  'route-repeats': {
    on_wall: true,
    name: 'Route repeats / laps',
    cue:
      "Pick 1-2 routes at your flash grade. Climb each 2-3 times with 3-5 min rest between attempts. Same route = same moves = increasing efficiency each attempt as you optimize sequence, breathing, rest positions.",
    why:
      "Route repeats train sustained pulling capacity AND movement dial-in in the same block. Best when you have energy — before the 4x4, or on a separate session.",
  },

  // ============ STRENGTH ============
  'pullup-negative': {
    name: 'Pull-up negatives',
    cue:
      "Start at the top of a pull-up (chin over bar). Lower yourself for 3-5 seconds, arms fully extended at the bottom. Reset (step / jump back to top) and repeat. 5 reps per set, 3 sets, 2 min rest between sets.",
    why:
      "Eccentric-focused pull work builds pulling strength and shoulder stability without loading fingers to failure. Key for lock-offs and controlled clip stances on lead.",
  },
  'weighted-pullup': {
    name: 'Weighted pull-ups',
    cue:
      "Once bodyweight pull-ups are trivial (10+ clean): add weight via belt or pack. 4 sets × 5 reps, 3 min rest. Start light (5-10 lb), progress ~5 lb per 2 weeks. Full range, no kip.",
    why:
      "Absolute pulling strength lets you generate on hard moves and rest in body positions others fall out of. Phase 2+.",
  },
  'grip-half-crimp': {
    name: 'Half-crimp engagement',
    cue:
      "On a fingerboard: index/middle/ring on a 15-20mm edge, first knuckle bent ~90°, thumb relaxed. LIGHT engagement (NOT max hang). 5s on / 5s off, 5 reps. In later phases: 7s or 10s on/off.",
    why:
      "Half crimp is climbing's most versatile grip AND the most vulnerable to injury at high load. Building tendon capacity gradually at low intensity is how you avoid an A2 pulley tear years from now.",
  },
  'grip-open-drag': {
    name: 'Open-hand 3-finger drag',
    cue:
      "Same edge, only index/middle/ring, fingers STRAIGHT (not crimped), thumb off. Pull like dragging fingers off a shelf. 5s on / 5s off, 5 reps.",
    why:
      "Different grip patterns load different tendon groups. Rotating open-hand and crimp prevents overuse of any single pattern.",
  },
  'grip-sloper': {
    name: 'Sloper / full open hand',
    cue:
      "On a sloping hold or wider part of a fingerboard: all four fingers relaxed and spread, palm engaged. Squeeze like a doorknob. 5s on / 5s off, 5 reps.",
    why:
      "Modern gym setting is volume-heavy. Slopers also train grip through the whole hand/forearm rather than isolated pulleys.",
  },
  'boulder-block': {
    on_wall: true,
    name: 'Bouldering block',
    cue:
      "30-45 min of focused bouldering on problems at or slightly above your flash boulder grade (V2-V4 for you). Rest generously between attempts (3-5 min). This is POWER work, not volume — quality attempts, not many.",
    why:
      "Bouldering trains max power in a way top rope can't. Short intense pulls = better neural recruitment. This is where the strength for hard route cruxes actually comes from.",
  },
  'hangboard-repeaters': {
    name: 'Hangboard repeaters',
    cue:
      "Phase 3+ only. 7 seconds on / 3 seconds off × 6 reps = 1 set. Rest 3 min between sets. Use an edge you can hold for 10-12s max effort — no more. Warm up thoroughly first.",
    why:
      "Repeaters build max finger strength and PE in the tendons. Skip until Phase 3 (~5.11a fluent) — earlier is a fast track to injury.",
  },

  // ============ LEAD-SPECIFIC (Phase 3+) ============
  'clip-practice': {
    name: 'Clip practice',
    cue:
      "On a top rope, at each clip position: pause, find a rest stance, practice the clip motion both directions (under-clip and over-clip). Ground drill 10x with a quickdraw in your hand first until it's automatic.",
    why:
      "Clean, fast clips separate stressed leaders from confident ones. Fumbling a clip is the #1 preventable cause of taking a whipper. Ground drill until it's boring.",
  },
  'mock-lead': {
    on_wall: true,
    name: 'Mock lead',
    cue:
      "Climb top rope on a route while trailing a lead rope. At each bolt, clip the trailing rope as if leading. Get used to the extra rope, the drag, the clip stances — all with a top rope catching you.",
    why:
      "Bridge between top rope and lead. Removes the fall consequence but rehearses everything else. Critical before your first real lead.",
  },
  'fall-practice': {
    on_wall: true,
    name: 'Fall practice',
    cue:
      "On lead, above a bolt (start with feet at bolt height, progress to 1-2 ft above): let go. Fall. Do this INTENTIONALLY in a controlled setting with an experienced belayer. Start small, build up. 5-10 falls per session, well below your redpoint grade.",
    why:
      "The fear of falling is what caps most climbers below their physical potential. Deliberate controlled fall practice desensitizes the fear response. You'll climb harder because you'll try harder.",
  },
  'lead-cert-drill': {
    on_wall: true,
    name: 'Lead certification drill',
    cue:
      "Simulate the gym's lead cert exam: lead-climb 5.9, clip cleanly at every bolt, don't back-clip, don't Z-clip, handle rope smoothly, take a controlled fall above bolt 3. Do repeatedly until you pass a mock cert with a partner watching.",
    why:
      "The lead cert is your gateway to hard route climbing. Passing it fluently means the mechanics are automatic — you'll then trust yourself to try hard on real leads.",
  },

  // ============ OUTDOOR PREP (Phase 5+) ============
  'anchor-building': {
    name: 'Anchor building',
    cue:
      "At ground level or beginner outdoor top-rope: 2-piece equalized anchor with SRENE principles (Solid, Redundant, Equalized, No Extension). Alternate top-rope and lead anchors. Build until it takes <5 min.",
    why:
      "The single biggest gap between gym and outdoor climbing. You can be a strong climber and still get hurt with a sloppy anchor.",
  },
  'cleaning-anchor': {
    name: 'Cleaning an anchor',
    cue:
      "Practice threading the rope through chains and lowering off safely. Ground first, then on an easy outdoor route with a partner supervising.",
    why:
      "The most common outdoor climbing accident: mistakes during cleaning. Practice on the ground until it's mechanical.",
  },
  'rope-management': {
    name: 'Rope management',
    cue:
      "Coiling (mountaineer's / butterfly), flaking before a climb, back-clipping prevention, stacking below a lead climber. Practice each until automatic.",
    why:
      "Bad rope management on outdoor climbs = tangles, delays, safety issues.",
  },

  // ============ SESSION 4 — FULL BODY / ANTAGONIST ============
  'dynamic-warmup': {
    name: 'Dynamic warm-up (Session 4)',
    cue:
      "5 min to raise heart rate and mobilize joints:\n\n" +
      "- Jumping jacks — 30s\n" +
      "- Arm circles — 10 forward, 10 backward\n" +
      "- Leg swings — 10 per leg, front/back and side/side\n" +
      "- Hip openers — 5 per side (world's greatest stretch)\n" +
      "- Cat-cow — 10 slow reps\n\n" +
      "Just enough to break a light sweat.",
    why:
      "Full-body sessions demand more than climbing-specific prep. This gets your legs, hips, and core online.",
  },
  'push-up': {
    name: 'Push-ups',
    cue:
      "Standard: hands shoulder-width, body straight, chest to floor, full lockout. 3 sets × 15. When trivial, add reps, elevate feet, or move to decline push-ups.",
    why:
      "Climbers build massive pull capacity and neglected push. The imbalance rounds shoulders forward and sets up impingement. Nonnegotiable.",
  },
  'pike-pushup': {
    name: 'Pike push-ups',
    cue:
      "Downward-dog position (hips up, feet planted, hands on ground). Lower head between hands, press back up. Trains overhead pressing. 3 sets × 8-12.",
    why:
      "Overhead pressing is what climbers should be doing to balance the pull-heavy sport. Pike push-ups are the bodyweight version of a shoulder press.",
  },
  'ext-rotation': {
    name: 'External rotation',
    cue:
      "Dumbbell (2-5 lb) or resistance band. Elbow tucked to side at 90°, forearm parallel to ground. Rotate outward keeping the elbow pinned. Slow, controlled. 3 sets × 15 each side.",
    why:
      "Directly targets the rotator cuff muscles climbing under-trains. This one exercise prevents the impingement pattern that ends most climbing careers.",
  },
  'prone-ytw': {
    name: 'Prone Y / T / W raises',
    cue:
      "Lying face-down (or bent over):\n" +
      "- Y — arms in a Y overhead, lift both hands off floor · 8 reps\n" +
      "- T — arms straight out to sides, lift · 8 reps\n" +
      "- W — elbows bent, hands by ears, lift · 8 reps\n" +
      "Squeeze shoulder blades on each rep. Light weight or no weight.\n" +
      "3 sets of the full sequence.",
    why:
      "Trains the mid-back and rear delts — where climbers develop the worst muscular imbalance. Corrects rounded shoulders over time.",
  },
  'wrist-ext': {
    name: 'Wrist extension',
    cue:
      "Light dumbbell (2-5 lb). Forearm on your thigh, palm down, dumbbell off the edge. Curl the wrist UP, slow. 3 sets × 15.",
    why:
      "Balances the constant flexor loading climbing does. Prevents the medial epicondylitis (climber's elbow) that plagues everyone eventually.",
  },
  'reverse-wrist-curl': {
    name: 'Reverse wrist curl',
    cue:
      "Palm-up variation. Forearm on thigh, palm up, dumbbell hanging over the edge. Curl the wrist up. 3 sets × 15. Slow tempo.",
    why:
      "Trains wrist flexors in an unfamiliar range. Combined with wrist extensions, dramatically reduces elbow pain risk.",
  },
  'squat': {
    name: 'Bodyweight squat',
    cue:
      "Feet shoulder-width, toes slightly out. Descend as if sitting in a chair — knees track over toes, chest up. Full depth (thighs parallel or below). Drive through heels. 3 sets × 20.",
    why:
      "Climbers famously neglect legs. Strong legs = more efficient movement on the wall (you push off the feet, not just pull with hands). Also better resilience for outdoor approaches.",
  },
  'bulgarian-split-squat': {
    name: 'Bulgarian split squat',
    cue:
      "Back foot elevated on a bench/chair behind you. Drop into a split squat, front knee tracking over toes. 3 sets × 10 each leg. Add dumbbells when bodyweight is easy.",
    why:
      "Single-leg strength = the movement pattern of high-step rock-overs on the wall. Also identifies + fixes left/right leg imbalances.",
  },
  'calf-raise': {
    name: 'Calf raise',
    cue:
      "Stand on the edge of a step, heels hanging off. Rise onto toes, pause 1 second, lower slowly below step level. 3 sets × 15.",
    why:
      "Foot smearing and small-hold precision start at the calf. Weak calves = wobbly feet.",
  },
  'hollow-body-hold': {
    name: 'Hollow body hold',
    cue:
      "Lying on back: low back pressed to floor, arms overhead, legs straight just off the ground, head/shoulders slightly off floor. Body forms a shallow banana curled upward. 3 sets × 30-45s.",
    why:
      "Owns the midline — the core position you use on every overhang and every roof.",
  },
  'plank': {
    name: 'Plank',
    cue:
      "On forearms, body straight from head to heels, glutes engaged. 3 sets × 45-60s. When easy, progress to side planks or single-arm planks.",
    why:
      "Core endurance for long routes and multi-pitch. Prevents the sag-in-the-middle position that wastes energy.",
  },
  'dead-bug': {
    name: 'Dead bug',
    cue:
      "Lying on back, arms straight up over shoulders, knees bent to 90° over hips. Simultaneously lower one arm overhead and the OPPOSITE leg straight toward the floor. Return, repeat other side. 3 sets × 10 each side. Low back stays PRESSED to floor throughout.",
    why:
      "Anti-rotation core work. The core-to-limb connection that lets you generate force from movement, not just isolate muscles.",
  },
  'hip-mobility': {
    name: 'Hip mobility',
    cue:
      "3-min routine:\n" +
      "- Hip flexor stretch (lunge, back knee down, hips forward) · 30s each side\n" +
      "- Pigeon pose · 45s each side\n" +
      "- Deep squat hold (heels flat, chest up) · 60s\n" +
      "- Cat-cow · 10 slow reps",
    why:
      "Tight hips = high stepping / drop knees are limited. Climbing chronically tightens hip flexors — this counters it.",
  },
  'zone2-cardio': {
    name: 'Zone 2 cardio (optional)',
    cue:
      "15-20 min of steady-state cardio — bike, jog, row, or hike. Effort: you can hold a conversation but breathing is elevated. Heart rate ~60-70% of max.",
    why:
      "Outdoor climbing means outdoor approaches — often long ones. Zone 2 builds the aerobic base that makes 'we hiked 3 hours in' feel routine instead of destroying you for the climb.",
  },
};

export function getExercise(id) {
  return EXERCISES[id] || { name: id, cue: '', why: '' };
}
