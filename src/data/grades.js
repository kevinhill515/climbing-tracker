// V-scale (bouldering) and Yosemite Decimal (top rope) grade ladders.
//
// Kept as ordered arrays so we can compare "hardest sent" numerically:
// index in the array = ordinal difficulty.

export const V_GRADES = [
  'V0', 'V1', 'V2', 'V3', 'V4', 'V5', 'V6', 'V7',
  'V8', 'V9', 'V10', 'V11', 'V12', 'V13', 'V14', 'V15', 'V16', 'V17',
];

export const YDS_GRADES = [
  '5.7', '5.8', '5.9',
  '5.10a', '5.10b', '5.10c', '5.10d',
  '5.11a', '5.11b', '5.11c', '5.11d',
  '5.12a', '5.12b', '5.12c', '5.12d',
  '5.13a', '5.13b', '5.13c', '5.13d',
  '5.14a', '5.14b', '5.14c', '5.14d',
  '5.15a', '5.15b', '5.15c', '5.15d',
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
    if (i <= 7)  return 'amber';     // V6–V7
    if (i <= 9)  return 'orange';    // V8–V9
    return 'rose';                    // V10+
  }
  // YDS
  if (i <= 2)  return 'emerald';    // 5.7–5.9
  if (i <= 6)  return 'sky';        // 5.10
  if (i <= 10) return 'violet';     // 5.11
  if (i <= 14) return 'amber';      // 5.12
  if (i <= 18) return 'orange';     // 5.13
  return 'rose';                     // 5.14+
}
