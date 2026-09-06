// Al hendes fremgang bor i localStorage på telefonen. Ingen server, ingen konto.

const KEY = 'matty.v1';
const SCHEMA = 3;

export const LEVELS = [
  { xp: 0, name: 'Nyfødt hvalp' },
  { xp: 100, name: 'Nysgerrig hvalp' },
  { xp: 250, name: 'Legesyg hvalp' },
  { xp: 500, name: 'Modig hvalp' },
  { xp: 850, name: 'Klog hvalp' },
  { xp: 1300, name: 'Ung labrador' },
  { xp: 1900, name: 'Kvik labrador' },
  { xp: 2700, name: 'Skarp labrador' },
  { xp: 3700, name: 'Tabeljæger' },
  { xp: 5000, name: 'Tabelekspert' },
  { xp: 6800, name: 'Tabelmester' },
  { xp: 9000, name: 'Gangetabel-legende' },
];

export function todayKey(d = new Date()) {
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

export function daysBetween(aKey, bKey) {
  const a = new Date(aKey + 'T12:00:00');
  const b = new Date(bKey + 'T12:00:00');
  return Math.round((b - a) / 86400000);
}

function freshState() {
  return {
    schema: SCHEMA,
    name: '',
    puppyName: 'Matty',
    createdAt: new Date().toISOString(),
    onboarded: false,
    settings: { sound: true, haptics: true, hints: true, dailyGoal: 20, bigText: false },
    xp: 0,
    facts: {},            // "6x7" -> { l, seen, ok, err, run, last, due, bestMs, avgMs }
    streak: { count: 0, best: 0, lastGoalDay: null, freezes: 1, usedFreeze: null },
    days: {},             // "2026-09-07" -> { correct, wrong, ms, sessions }
    sessions: [],         // seneste 300 runder
    records: {},          // "table:7" / "all" / "sprint" -> bedste resultat
    badges: {},           // id -> dato
    album: [],            // låste hvalpekort der er åbnet
    accessory: null,
    counters: { fast: 0, bestCombo: 0, perfect: 0, hardRuns: 0, testRuns: 0 },
    seenLevel: 0,
  };
}

let state = null;
let saveTimer = null;

export function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      state = migrate(parsed);
    } else {
      state = freshState();
    }
  } catch (e) {
    console.warn('Kunne ikke læse gemt data, starter forfra', e);
    state = freshState();
  }
  refreshStreak();
  return state;
}

function migrate(s) {
  const base = freshState();
  const merged = { ...base, ...s,
    settings: { ...base.settings, ...(s.settings || {}) },
    streak: { ...base.streak, ...(s.streak || {}) },
    counters: { ...base.counters, ...(s.counters || {}) } };
  merged.schema = SCHEMA;
  return merged;
}

export function get() {
  if (!state) load();
  return state;
}

export function save(immediate = false) {
  if (!state) return;
  const write = () => {
    try { localStorage.setItem(KEY, JSON.stringify(state)); }
    catch (e) { console.warn('Kunne ikke gemme', e); }
  };
  if (immediate) { clearTimeout(saveTimer); write(); return; }
  clearTimeout(saveTimer);
  saveTimer = setTimeout(write, 250);
}

export function reset() {
  state = freshState();
  save(true);
  return state;
}

// --- Dage, mål og streak ----------------------------------------------------

export function day(k = todayKey()) {
  const s = get();
  if (!s.days[k]) s.days[k] = { correct: 0, wrong: 0, ms: 0, sessions: 0 };
  return s.days[k];
}

export function goalProgress() {
  const s = get();
  const d = day();
  return { done: d.correct, goal: s.settings.dailyGoal, ratio: Math.min(1, d.correct / s.settings.dailyGoal) };
}

export function goalMet() {
  const { done, goal } = goalProgress();
  return done >= goal;
}

/** Kaldes ved opstart: falder streaken, eller redder en frostknogle den? */
export function refreshStreak() {
  const s = state;
  const st = s.streak;
  if (!st.lastGoalDay || st.count === 0) return;
  const gap = daysBetween(st.lastGoalDay, todayKey());
  if (gap <= 1) return;                    // i går eller i dag: alt vel
  const missed = gap - 1;
  if (missed <= st.freezes) {
    st.freezes -= missed;
    st.usedFreeze = todayKey();
    st.lastGoalDay = todayKey(new Date(Date.now() - 86400000));
  } else {
    st.count = 0;
    st.usedFreeze = null;
  }
  save();
}

/** Returnerer true hvis dagens mål lige er nået (så vi kan fejre det). */
export function checkGoalCompletion() {
  const s = get();
  const st = s.streak;
  const t = todayKey();
  if (!goalMet() || st.lastGoalDay === t) return false;
  const gap = st.lastGoalDay ? daysBetween(st.lastGoalDay, t) : 999;
  st.count = gap === 1 ? st.count + 1 : 1;
  st.lastGoalDay = t;
  st.best = Math.max(st.best, st.count);
  if (st.count % 5 === 0) st.freezes = Math.min(2, st.freezes + 1);
  save(true);
  return true;
}

// --- Niveau -----------------------------------------------------------------

export function levelInfo(xp = get().xp) {
  let i = 0;
  while (i + 1 < LEVELS.length && xp >= LEVELS[i + 1].xp) i++;
  const cur = LEVELS[i];
  const next = LEVELS[i + 1] || null;
  const span = next ? next.xp - cur.xp : 1;
  return {
    level: i + 1,
    name: cur.name,
    xpInLevel: xp - cur.xp,
    xpForLevel: span,
    ratio: next ? Math.min(1, (xp - cur.xp) / span) : 1,
    next,
  };
}

export function addXp(n) {
  const s = get();
  s.xp += n;
  save();
  return s.xp;
}

// --- Backup -----------------------------------------------------------------

export function exportBackup() {
  return btoa(unescape(encodeURIComponent(JSON.stringify(get()))));
}

export function importBackup(code) {
  const obj = JSON.parse(decodeURIComponent(escape(atob(code.trim()))));
  if (!obj || typeof obj !== 'object' || !obj.facts) throw new Error('Ugyldig kode');
  state = migrate(obj);
  save(true);
  return state;
}
