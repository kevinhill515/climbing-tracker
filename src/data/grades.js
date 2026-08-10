// V-scale (bouldering) and Yosemite Decimal (top rope) grade ladders.
//
// Trimmed to the range the athlete will realistically climb in the
// coming years:
//   Top rope: 5.6 → 5.12d (the goal grade)
//   Boulder: V0 → V6
// Extend the arrays if / when the ceiling moves up.
//
// Kept as ordered arrays so we can compare "hardest sent" numerically:
// index in the array = ordinal difficulty.

export const V_GRADES = ['V0', 'V1', 'V2', 'V3', 'V4', 'V5', 'V6'];

export const YDS_GRADES = [
  '5.6', '5.7', '5.8', '5.9',
  '5.10a', '5.10b', '5.10c', '5.10d',
  '5.11a', '5.11b', '5.11c', '5.11d',
  '5.12a', '5.12b', '5.12c', '5.12d',
];

export const STYLE_LABELS = { boulder: 'Boulder', toprope: 'Top rope' };

export function gradesFor(style) {
  return style === 'boulder' ? V_GRADES : YDS_GRADES;
}

/** Numeric ordinal of a grade within its style ladder — for compare / sort.
 *  Returns -1 if the grade isn't in the ladder. */
export function ordinalOf(style, grade) {
  return gradesFor(style).indexOf(grade);
}

/** The next-harder grade above `grade`. Returns null at the top. */
export function nextGrade(style, grade) {
  const arr = gradesFor(style);
  const i = arr.indexOf(grade);
  if (i < 0 || i >= arr.length - 1) return null;
  return arr[i + 1];
}

/** Colour bucket for a grade — used to tint the badge in the UI. Rough
 *  aggregate difficulty so the pill's colour tells you at a glance. */
export function tintFor(style, grade) {
  const i = ordinalOf(style, grade);
  if (i < 0) return 'zinc';
  if (style === 'boulder') {
    if (i <= 1)  return 'emerald';   // V0–V1
    if (i <= 3)  return 'sky';       // V2–V3
    if (i <= 5)  return 'violet';    // V4–V5
    return 'amber';                   // V6
  }
  // YDS
  if (i <= 3)  return 'emerald';    // 5.6–5.9
  if (i <= 7)  return 'sky';        // 5.10
  if (i <= 11) return 'violet';     // 5.11
  return 'amber';                    // 5.12
}
