// Exercise dictionary for the climbing program — a real coach's toolkit
// oriented for a top-rope climber with 5.12d as the north star.
//
// Categories:
//   - warm-ups           (easy climbing, joint prep)
//   - technique          (efficiency, route reading, movement drills)
//   - endurance          (ARC, power endurance, route repeats)
//   - strength           (pull negatives, grip engagement, bouldering)
//   - lead-specific      (clipping, fall practice — phase 3+)
//   - outdoor prep       (anchors, cleaning, rope management — phase 5+)
//   - antagonist         (push-ups, external rotation, wrist ext/flex)

export const EXERCISES = {
  // ============ WARM-UPS ============
  'warmup-routes': {
    name: 'Warm-up routes',
    cue:
      'Two to three easy routes (5.7–5.8 or 3+ grades below flash), flowed continuously with brief rest. Slow, controlled, big breaths. Every muscle wakes up before you demand anything of it.',
    why:
      "Warm-up isn't optional in climbing — cold fingers and cold shoulders are the two most reliable ways to end a session with an injury. 10-15 min of easy climbing raises tissue temperature, opens capillaries, and rehearses movement patterns.",
  },
  'warmup-boulder': {
    name: 'Warm-up bouldering',
    cue:
      'Traverse or climb 2–3 V0 boulders, flowing between them, no rest. Fingers and shoulders come up to temperature; you scan for stiff spots BEFORE you load them.',
    why:
      'When bouldering is the focus session, warming up on the wall lets you find the movement patterns your body needs today.',
  },
  'joint-prep': {
    name: 'Wrist + shoulder prep',
    cue:
      "5 min of light joint work before hard climbing: wrist circles both directions, prayer stretch, reverse prayer, band pull-aparts, and 5-10 scapular pull-ups. Should feel like your joints wake up, not like a workout.",
    why:
      "Fingers get 90% of the attention in climbing prep, but shoulders and wrists get loaded just as hard. Neglecting them = impingement + wrist tendinitis over years.",
  },

  // ============ TECHNIQUE / EFFICIENCY ============
  'efficiency-work': {
    name: 'Efficiency training',
    cue:
      'Pick a route (top-rope) or boulder at your flash grade. Climb it once. Identify ONE thing to improve — foot placement, hip rotation, breath timing, a specific move. Rest 2–5 min. Climb the same route again with that single focus. Repeat 3× per route, then move to 3–5 more routes.',
    why:
      "This is the workout. Technique is your #1 limiter until at least 5.11a, and even at 5.12 it accounts for more of your ceiling than strength does. Repeating a route with a fresh focus is how you actually rewire movement — cycling through routes mindlessly is not.",
  },
  'route-reading': {
    name: 'Route reading',
    cue:
      "Before pulling on, trace the whole route with your eyes. Identify: (1) the crux moves, (2) potential rest positions, (3) hand-foot sequences. Commit to the plan in your head, THEN start.",
    why:
      "Reading a route on the ground costs zero energy but saves 30% of it during the climb. Bad reading = redundant moves, missed rests, and a pump you didn't need.",
  },
  'silent-feet': {
    name: 'Silent feet drill',
    cue:
      "Climb an easy route with one rule: not a single foot placement makes noise. If you scrape, you stop, look, and place it correctly.",
    why:
      "Sloppy footwork is the difference between V3 and V5 for most climbers. Force-training precision at low grades builds it into your default.",
  },
  'movement-drill': {
    name: 'Movement drills',
    cue:
      "Pick ONE technique per session and drill it on 2–3 easy routes: outside-edge / hip-in on side pulls, drop knee, flag placements, hand-foot match, straight-arm rests. Slow, deliberate, correct.",
    why:
      "Named movement patterns become 'moves in your vocabulary.' The more you drill, the more your body picks them without conscious thought when a route calls for them.",
  },
  'no-hands-slab': {
    name: 'No-hands slab',
    cue:
      "On a slab (up to ~85°), climb using ONLY your feet — hands touch the wall for balance only, never grip. Watch every foot placement, trust the rubber, weight the feet.",
    why:
      "The single biggest V3-to-V5 or 5.10-to-5.11 unlock is trusting your feet. Removing hands forces the trust; you can't fake it.",
  },

  // ============ ENDURANCE ============
  'arc-training': {
    name: 'ARC training',
    cue:
      "Aerobic Restoration and Capillarity: 20-30 min of CONTINUOUS climbing at a grade 4-6 letters below your flash (usually 5.7-5.8 for you). You should be able to hold a conversation. If you get pumped, you're going too hard — slow down. Traverse if you run out of route.",
    why:
      "ARC builds capillary density in the forearms — the physiological basis for climbing endurance. It doesn't feel like training when you do it, but it's what separates a 5.11 climber who pumps out at bolt 4 from one who cruises to the anchors.",
  },
  'four-by-four': {
    name: '4x4 workout',
    cue:
      "Pick 4 routes (or boulders) at 2 grades below your flash. Climb all 4 back-to-back with minimal rest between climbs (~30-60s down + straight back on). After the 4th, rest 3-5 min. That's 1 round. Complete 4 rounds. Brutal but transformative for power endurance.",
    why:
      "Power endurance = ability to keep pulling hard when pumped. This is the workout that turns 'I can do the moves' into 'I can send the route.' Absolutely central to breaking into the 5.11s and beyond.",
  },
  'route-repeats': {
    name: 'Route repeats / laps',
    cue:
      "Pick 2 routes at or below flash grade. Climb each one 3 times with 3-5 min rest between attempts. Same route = same moves = increasing efficiency each attempt as you optimize sequence, breathing, and rest positions.",
    why:
      "Route repeats are efficiency training's older sibling — you dial the movement AND train sustained pulling capacity in the same block. Also builds route-length endurance without the intensity of a 4x4.",
  },

  // ============ STRENGTH ============
  'pullup-negative': {
    name: 'Pull-up negatives',
    cue:
      "Start at the top of a pull-up (chin over bar). Lower yourself for 3-5 seconds, arms fully extended at the bottom. Reset (step or jump back to top) and repeat. 5 reps per set, 3 sets, 2 min rest between sets.",
    why:
      "Eccentric-focused pull work builds pulling strength and shoulder stability without loading fingers to failure. Key for lock-offs and controlled clip stances on lead.",
  },
  'weighted-pullup': {
    name: 'Weighted pull-ups',
    cue:
      "Once bodyweight pull-ups are trivial (10+ clean): add weight via belt or pack. 4 sets × 5 reps, 3 min rest. Start light (5-10 lb), progress ~5 lb per 2 weeks. Focus on full range, no kip.",
    why:
      "Absolute pulling strength lets you generate on hard moves and rest in body positions others fall out of. Phase 2+.",
  },
  'grip-half-crimp': {
    name: 'Half-crimp engagement',
    cue:
      "On a fingerboard: index/middle/ring on a 15-20mm edge, first knuckle bent ~90°, thumb relaxed, pinky follows the ring. Light engagement (NOT max hang). 5s on, 5s off, 5 reps. In later phases: 7s on / 7s off, or 10s on / 10s off.",
    why:
      "Half crimp is climbing's most versatile grip — and the most vulnerable to injury at high load. Building tendon capacity gradually at low intensity is how you avoid a career-ending A2 pulley tear years from now.",
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
      "On a sloping hold or the wider part of a fingerboard, all four fingers relaxed and spread, palm engaged. Squeeze like a doorknob. 5s on / 5s off, 5 reps.",
    why:
      "Modern gym setting is volume-heavy — slopers everywhere. Also trains grip through the whole hand/forearm rather than isolated pulleys.",
  },
  'boulder-block': {
    name: 'Bouldering block',
    cue:
      "30-45 min of focused bouldering on problems at or slightly above your flash boulder grade (V2-V4 for you). Rest generously between attempts (3-5 min). This is POWER work, not volume — quality attempts, not many.",
    why:
      "Bouldering trains max power in a way top rope can't. Short intense pulls = better recruitment. This is where the strength for hard moves on routes actually comes from.",
  },
  'hangboard-repeaters': {
    name: 'Hangboard repeaters (Phase 3+)',
    cue:
      "Advanced only. 7 seconds on / 3 seconds off × 6 reps = 1 set. Rest 3 min between sets. 6 sets total. Use an edge you can hold for 10-12s max effort — no more. Warm up thoroughly first.",
    why:
      "Repeaters build max finger strength and power endurance in the tendons. Skip until Phase 3 (~5.11a fluent) — earlier is a fast track to injury.",
  },

  // ============ LEAD-SPECIFIC (Phase 3+) ============
  'clip-practice': {
    name: 'Clip practice',
    cue:
      "On a top rope, at each clip position: pause, find a rest stance, practice the clip motion (both directions — under-clip and over-clip). Repeat 10x on the ground first with a quickdraw in your hand until muscle memory is automatic.",
    why:
      "Clean, fast clips separate stressed leaders from confident ones. Fumbling a clip is the #1 preventable cause of taking a whipper. Ground drill until it's boring.",
  },
  'mock-lead': {
    name: 'Mock lead',
    cue:
      "Climb top rope on a route while trailing a lead rope. At each bolt, clip the trailing rope through as if leading. Get comfortable with the extra rope, the drag, the clip stances — all with a top rope catching you.",
    why:
      "Bridge between top rope and lead. Removes the fall consequence but rehearses everything else. Critical before your first real lead.",
  },
  'fall-practice': {
    name: 'Fall practice',
    cue:
      "On lead, above a bolt (start with feet at bolt height, progress to 1-2 ft above): let go. Fall. Do this INTENTIONALLY in a controlled setting with an experienced belayer. Start small, build up. 5-10 falls per session, well below your redpoint grade.",
    why:
      "The fear of falling is what caps most climbers below their physical potential. Deliberate, controlled fall practice desensitizes the fear response. You'll climb harder because you'll try harder.",
  },
  'lead-cert-drill': {
    name: 'Lead certification drill',
    cue:
      "Simulate the gym's lead cert exam: lead-climb 5.9, clip cleanly at every bolt, don't back-clip, don't Z-clip, handle rope smoothly, take a small controlled fall above bolt 3. Do this repeatedly until you pass a mock cert with a partner watching.",
    why:
      "The lead cert is your gateway to hard route climbing. Passing it fluently means the mechanics are automatic — you'll then trust yourself to try hard on real leads.",
  },

  // ============ OUTDOOR PREP (Phase 5+) ============
  'anchor-building': {
    name: 'Anchor building',
    cue:
      "Practice at ground level or on a beginner outdoor top-rope setup: 2-piece equalized anchor with SRENE principles (Solid, Redundant, Equalized, No Extension). Alternate top-rope and lead anchors. Build until it takes <5 min.",
    why:
      "The single biggest gap between gym and outdoor climbing. You can be a strong climber and still get hurt with a sloppy anchor. Practice with an experienced partner or in a class.",
  },
  'cleaning-anchor': {
    name: 'Cleaning an anchor',
    cue:
      "Practice threading the rope through the chains and lowering off safely. On the ground first with anchor materials, then on an easy outdoor route with a partner supervising.",
    why:
      "The most common outdoor climbing accident: mistakes during cleaning. Practice on the ground until it's mechanical. Never learn on your first hard route.",
  },
  'rope-management': {
    name: 'Rope management',
    cue:
      "Coiling (mountaineer's / butterfly), flaking before a climb, back-clipping prevention, stacking below a lead climber. Practice each until automatic.",
    why:
      "Bad rope management on outdoor climbs = tangles, delays, and safety issues. Save it for after you're comfortable with basics.",
  },

  // ============ ANTAGONIST (2x/week module) ============
  'push-up': {
    name: 'Push-ups',
    cue:
      "Standard: hands shoulder-width, body straight, chest to the ground, full lockout. 3 sets of 15. When 15 is easy, add reps or elevate feet.",
    why:
      "Climbers build massive pull capacity and neglected push. The imbalance rounds shoulders forward and sets up impingement / rotator cuff issues by 40. Nonnegotiable.",
  },
  'ext-rotation': {
    name: 'External rotation',
    cue:
      "Dumbbell (2-5 lb) or resistance band. Elbow tucked to side at 90°, forearm parallel to ground. Rotate outward keeping the elbow pinned. Slow. 3 sets of 15 each side.",
    why:
      "Directly targets the rotator cuff muscles climbing under-trains. This one exercise prevents the impingement pattern that ends most climbing careers.",
  },
  'wrist-ext': {
    name: 'Wrist extension',
    cue:
      "Light dumbbell (2-5 lb). Forearm on your thigh, palm down, dumbbell off the edge. Curl the wrist up, slow. 3 sets of 15.",
    why:
      "Balances the constant flexor loading climbing does. Prevents the medial epicondylitis (climber's elbow) that plagues everyone eventually.",
  },
  'reverse-wrist-curl': {
    name: 'Reverse wrist curl',
    cue:
      "Palm-up variation of wrist extension, or use a light barbell. Slow tempo. 3 sets of 15.",
    why:
      "Trains wrist flexors in an unfamiliar range. Combined with wrist extensions, dramatically reduces elbow pain risk.",
  },
};

export function getExercise(id) {
  return EXERCISES[id] || { name: id, cue: '', why: '' };
}
