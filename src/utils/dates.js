// Weeks run Saturday → Friday to match the athlete's training week.

const MS_PER_DAY = 86_400_000;

export function parseDate(s) {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d, 12, 0, 0, 0);
}

export function fmtDate(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** Today's date as YYYY-MM-DD in LOCAL time (never UTC). */
export function today() {
  return fmtDate(new Date());
}

export function weekStartOf(d) {
  const day = d.getDay();
  const diff = (day - 6 + 7) % 7;
  const m = new Date(d);
  m.setHours(12, 0, 0, 0);
  m.setDate(m.getDate() - diff);
  return m;
}

export function weekEndOf(d) {
  const start = weekStartOf(d);
  const e = new Date(start);
  e.setDate(e.getDate() + 6);
  return e;
}

export function weekId(asOf = new Date()) {
  return fmtDate(weekStartOf(asOf));
}

export function weekNumber(startDate, asOf = new Date()) {
  const start = weekStartOf(parseDate(startDate));
  const now = weekStartOf(asOf);
  const diff = Math.floor((now - start) / (MS_PER_DAY * 7));
  return diff + 1;
}

export function fmtWeekRange(asOf = new Date()) {
  const s = weekStartOf(asOf);
  const e = weekEndOf(asOf);
  const fmt = (d) => d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  return `${fmt(s)} – ${fmt(e)}`;
}

export function allWeekIds(startDate, asOf = new Date()) {
  const ids = [];
  let cursor = weekStartOf(parseDate(startDate));
  const end = weekStartOf(asOf);
  while (cursor <= end) {
    ids.push(weekId(cursor));
    cursor = new Date(cursor.getTime() + 7 * MS_PER_DAY);
  }
  return ids;
}
