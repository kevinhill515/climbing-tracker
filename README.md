# Climb Tracker

A skill-based climbing progression tracker. Same shape as the calisthenics-tracker (dark, mobile-first, GitHub Pages + Supabase-backed) but built around bouldering + top-rope training.

- **Stack**: React 18 + Vite 5 + Tailwind v4 + Recharts + Sharp (icon gen)
- **Backend**: Supabase (free tier), single `climb_users` row for Kevin
- **Hosting**: GitHub Pages, auto-deployed via Actions
- **Phases**: skill-based advancement (V3 → V4 → V5 → V6 → V7+), NOT time-based

## First-time setup (~15 min total)

### 1. Create the GitHub repo

- https://github.com/new → **climbing-tracker**, Public, no README/gitignore/license
- Locally (once):
  ```powershell
  cd Y:\climbing-tracker
  git init
  git add -A
  git commit -m "Initial climbing tracker"
  git branch -M main
  git remote add origin https://github.com/kevinhill515/climbing-tracker.git
  git push -u origin main
  ```

### 2. Set up Supabase

Same Supabase project as calisthenics-tracker (a second table). SQL Editor → New query → paste + run:

```sql
create table if not exists climb_users (
  name        text primary key,
  data        jsonb not null default '{}'::jsonb,
  updated_at  timestamptz not null default now()
);

alter table climb_users enable row level security;

drop policy if exists "anon_read" on climb_users;
create policy "anon_read" on climb_users
  for select using (true);

drop policy if exists "anon_insert" on climb_users;
create policy "anon_insert" on climb_users
  for insert with check (name = 'kevin');

drop policy if exists "anon_update" on climb_users;
create policy "anon_update" on climb_users
  for update using (name = 'kevin');

insert into climb_users (name) values ('kevin')
  on conflict (name) do nothing;
```

### 3. Add GitHub Actions secrets

Repo → Settings → Secrets and variables → Actions → **New repository secret** for each:

- `VITE_SUPABASE_URL` — your Supabase project URL (same as calisthenics-tracker)
- `VITE_SUPABASE_ANON_KEY` — the publishable key (starts with `sb_publishable_`)

### 4. Enable GitHub Pages

Repo → Settings → Pages → **Deploy from a branch** → branch `gh-pages` (created by the first successful Actions run) → **/ (root)** → Save.

After ~1 min the site is live at `https://kevinhill515.github.io/climbing-tracker/`.

## App structure

| Tab | What it does |
|---|---|
| **Week** | Current Sat-Fri week's 3 session cards, phase header + target grades, phase journey progress bar, 28-day activity heatmap. |
| **Grades** | Boulder + top-rope side-by-side. Highest flash, current project, highest send, sparkline of progress over time, per-grade attempt-to-send ratios, first-flash dates. |
| **Health** | Finger check-in log. Auto-prompts before each session. Flags a rest-week alert when 2 consecutive check-ins show 4+/5 soreness. |
| **History** | Every day with logged activity, newest first. Tap to see full detail. |

## The program

5 phases, each with 3 sessions/week:

- **Session 1** (full): dynamic warm-up → no-hands slab → pull-up negatives → grip engagement (3 positions) → 45 min efficiency training → antagonist
- **Session 2** (efficiency): warm-up + 45 min deliberate technique work only
- **Session 3** (dynamic + slab): warm-up → no-hands slab → antagonist

**Antagonist module** (attached to Sessions 1 & 3, 2×/week):
- Push-ups (3×15)
- External rotation (3×15/side)
- Wrist extension (3×15)
- Reverse wrist curl (3×15)

**Phase advancement criteria** (checked in Settings → Check readiness to advance):
- Flashed target grade in 3 consecutive sessions
- No unusual pulley soreness in check-ins for 2 weeks
- Movement on flash grade feels controlled, not desperate

Skill-based, not time-based. There is no auto-advancement.

## Finger health guardrails

- Log a check-in before every session (auto-prompt).
- If soreness ≥ 3/5: skip grip engagement + dynamic climbing that session.
- If soreness ≥ 4/5 two check-ins in a row: rest-week alert on the Health tab, ≥5 days off climbing.

## Local dev

```bash
npm install
cp .env.example .env   # fill in your VITE_SUPABASE_* values
npm run dev
```

Same H:/Y: drive quirk as calisthenics-tracker on this machine — build works from either drive letter now.

`npm run icons` re-renders the PNG icon sizes from `public/icon.svg`.

## License

Private — Kevin only.
