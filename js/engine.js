// Læringsmotoren: hvad skal hun spørges om nu, og hvad betyder svaret.

import * as F from './facts.js';
import * as S from './store.js';

// Skalaen skal kunne læses som en stige: lys → mørk → guld.
export const MASTERY = [
  { name: 'Ny',     color: '#ddd7d0', ink: '#6b5b4a' },
  { name: 'Set',    color: '#f6e0b6', ink: '#6b5b4a' },
  { name: 'Øver',   color: '#f7c979', ink: '#6b5b4a' },
  { name: 'Sikker', color: '#9ad36a', ink: '#2c4a1a' },
  { name: 'Hurtig', color: '#3aa64a', ink: '#ffffff' },
  { name: 'Guld',   color: '#e8a300', ink: '#ffffff', ring: '#a86f00' },
];

// Hvor længe et faktum må hvile, alt efter hvor godt hun kan det (dage).
const REST_DAYS = [0, 0.02, 0.5, 1.5, 4, 9];

// Rækkefølgen vi introducerer nye stykker i: lette først.
export const INTRO_ORDER = F.allFactKeys()
  .map((k) => ({ k, d: F.difficultyOf(k) }))
  .sort((x, y) => x.d - y.d || x.k.localeCompare(y.k))
  .map((o) => o.k);

const MAX_NEW_PER_SESSION = 4;

export function factState(k) {
  const s = S.get();
  return s.facts[k] || null;
}

export function ensureFact(k) {
  const s = S.get();
  if (!s.facts[k]) s.facts[k] = { l: 0, seen: 0, ok: 0, err: 0, run: 0, last: 0, due: 0, bestMs: null, avgMs: null };
  return s.facts[k];
}

export function masteryOf(k) {
  const f = factState(k);
  return f ? f.l : 0;
}

function overdueScore(f, now) {
  if (!f || !f.due) return 1;
  const over = (now - f.due) / 86400000;
  return over <= 0 ? 0 : Math.min(3, 0.5 + over);
}

/** Hvor meget trænger dette stykke til at blive øvet lige nu? */
function priority(k, now) {
  const f = factState(k);
  const diff = F.difficultyOf(k);
  if (!f) return 0;
  const weakness = (5 - f.l) * 1.6;
  const recentErrors = Math.min(3, f.err - f.ok * 0.2) * 0.8;
  return weakness + overdueScore(f, now) * 2 + diff * 0.25 + Math.max(0, recentErrors);
}

function weightedPick(keys, weights, count) {
  const chosen = [];
  const ks = keys.slice(), ws = weights.slice();
  while (chosen.length < count && ks.length) {
    const total = ws.reduce((a, b) => a + b, 0);
    if (total <= 0) { chosen.push(...F.shuffle(ks).slice(0, count - chosen.length)); break; }
    let r = Math.random() * total, i = 0;
    while (r > ws[i] && i < ws.length - 1) { r -= ws[i]; i++; }
    chosen.push(ks[i]); ks.splice(i, 1); ws.splice(i, 1);
  }
  return chosen;
}

/**
 * Byg en runde.
 * mode: 'daily' | 'table' | 'hard' | 'test' | 'sprint'
 */
export function buildSession({ mode = 'daily', table = null, length = 15 } = {}) {
  const now = Date.now();
  const s = S.get();
  const introduced = Object.keys(s.facts);

  if (mode === 'test') {
    const keys = table ? F.tableKeys(table) : F.allFactKeys();
    return F.shuffle(keys).map((k) => makeQuestion(k, { forceChoice: false }));
  }

  if (mode === 'table') {
    const keys = F.tableKeys(table);
    const w = keys.map((k) => 1 + (5 - masteryOf(k)) * 0.8 + F.difficultyOf(k) * 0.2);
    const picked = [];
    while (picked.length < length) picked.push(...weightedPick(keys, w, Math.min(length - picked.length, keys.length)));
    return picked.slice(0, length).map((k) => makeQuestion(k));
  }

  if (mode === 'hard') {
    const keys = introduced
      .filter((k) => s.facts[k].err > 0 || s.facts[k].l < 3)
      .sort((a, b) => priority(b, now) - priority(a, now))
      .slice(0, 20);
    const pool = keys.length ? keys : INTRO_ORDER.slice(0, 20);
    const picked = [];
    while (picked.length < length) picked.push(...F.shuffle(pool).slice(0, length - picked.length));
    return picked.slice(0, length).map((k) => makeQuestion(k));
  }

  if (mode === 'sprint') {
    const pool = introduced.length ? introduced : INTRO_ORDER.slice(0, 12);
    const w = pool.map((k) => 1 + (5 - masteryOf(k)) * 0.5);
    return () => makeQuestion(weightedPick(pool, w, 1)[0], { forceChoice: true });
  }

  // --- daglig træning ---
  const fresh = INTRO_ORDER.filter((k) => !s.facts[k]).slice(0, MAX_NEW_PER_SESSION);
  const newCount = introduced.length === 0 ? Math.min(6, INTRO_ORDER.length) : fresh.length;
  const newKeys = INTRO_ORDER.filter((k) => !s.facts[k]).slice(0, newCount);

  const reviewCount = Math.max(0, length - newKeys.length);
  const pool = introduced.length ? introduced : [];
  const w = pool.map((k) => 0.2 + priority(k, now));
  const review = weightedPick(pool, w, Math.min(reviewCount, pool.length));

  let keys = [...review];
  // Hvis hun er helt ny, fylder vi op med de næste lette stykker.
  let extra = 0;
  while (keys.length + newKeys.length < length) {
    const k = INTRO_ORDER.filter((x) => !s.facts[x] && !newKeys.includes(x))[extra++];
    if (!k) break;
    newKeys.push(k);
  }

  // Nye stykker spredes ud, men aldrig som allerførste spørgsmål.
  const list = F.shuffle(keys);
  newKeys.forEach((k, i) => {
    const pos = Math.min(list.length, 1 + i * 3 + Math.floor(Math.random() * 2));
    list.splice(pos, 0, k);
  });
  return list.slice(0, length).map((k) => makeQuestion(k));
}

/** Multiple choice indtil hun er sikker; derefter skal hun selv skrive tallet. */
export function makeQuestion(k, { forceChoice = false } = {}) {
  const { a, b } = F.parseKey(k);
  const flip = Math.random() < 0.5;
  const x = flip ? b : a, y = flip ? a : b;
  const level = masteryOf(k);
  const isNew = !factState(k);
  const type = (!forceChoice && !isNew && level >= 3) ? 'type' : 'choice';
  return {
    key: k, a: x, b: y, answer: a * b,
    isNew, level, type,
    choices: type === 'choice' ? F.choicesFor(x, y) : null,
    hint: F.hintFor(k),
  };
}

// --- Registrering af svar ---------------------------------------------------

export function xpFor(correct, ms, hintUsed) {
  if (!correct) return 0;
  let xp = 10;
  if (ms < 3000) xp += 5;
  if (ms < 1800) xp += 3;
  if (hintUsed) xp = Math.round(xp / 2);
  return xp;
}

export function recordAnswer(k, correct, ms, { hintUsed = false, count = true } = {}) {
  const s = S.get();
  const f = ensureFact(k);
  const before = f.l;
  f.seen++;
  f.last = Date.now();

  if (correct) {
    f.ok++;
    f.run++;
    f.avgMs = f.avgMs == null ? ms : Math.round(f.avgMs * 0.7 + ms * 0.3);
    if (f.bestMs == null || ms < f.bestMs) f.bestMs = ms;
    if (f.run >= 8 && f.avgMs < 2800) f.l = 5;
    else if (f.run >= 6 && f.avgMs < 4200) f.l = Math.max(f.l, 4);
    else if (f.run >= 4) f.l = Math.max(f.l, 3);
    else if (f.run >= 2) f.l = Math.max(f.l, 2);
    else f.l = Math.max(f.l, 1);
  } else {
    f.err++;
    f.run = 0;
    f.l = Math.max(0, f.l - 1);
  }
  f.due = Date.now() + REST_DAYS[f.l] * 86400000;

  if (count) {
    const d = S.day();
    if (correct) d.correct++; else d.wrong++;
    d.ms += ms;
  }
  const xp = xpFor(correct, ms, hintUsed);
  if (xp) S.addXp(xp);
  S.save();
  return { xp, from: before, to: f.l, leveledUp: f.l > before };
}

// --- Overblik ---------------------------------------------------------------

export function tableProgress(t) {
  const keys = F.tableKeys(t);
  const levels = keys.map(masteryOf);
  const sum = levels.reduce((a, b) => a + b, 0);
  return {
    table: t,
    ratio: sum / (keys.length * 5),
    gold: levels.filter((l) => l === 5).length,
    weak: keys.filter((k) => masteryOf(k) < 3).length,
  };
}

export function overallProgress() {
  const keys = F.allFactKeys();
  const sum = keys.reduce((a, k) => a + masteryOf(k), 0);
  return {
    ratio: sum / (keys.length * 5),
    mastered: keys.filter((k) => masteryOf(k) >= 4).length,
    gold: keys.filter((k) => masteryOf(k) === 5).length,
    total: keys.length,
  };
}

export function weakestFacts(n = 6) {
  const s = S.get();
  return Object.keys(s.facts)
    .filter((k) => s.facts[k].err > 0)
    .sort((a, b) => (s.facts[b].err - s.facts[b].ok * 0.3) - (s.facts[a].err - s.facts[a].ok * 0.3))
    .slice(0, n);
}

// --- Opstart: hvad kan hun allerede? ---------------------------------------

/** 1- og 10-tabellen behøver hun ikke drilles i. */
export function seedTrivial() {
  const now = Date.now();
  for (const k of F.allFactKeys()) {
    if (!F.isTrivial(k)) continue;
    const f = ensureFact(k);
    if (f.seen === 0) { f.l = 3; f.run = 4; f.due = now + 2 * 86400000; }
  }
  S.save(true);
}

/** 12 stykker spredt jævnt over sværhedsgraden – en hurtig niveautest. */
export function placementKeys(n = 12) {
  const pool = INTRO_ORDER.filter((k) => !F.isTrivial(k));
  const step = pool.length / n;
  return F.shuffle([...Array(n)].map((_, i) => pool[Math.floor(i * step + step / 2)]));
}

/** Sætter startniveauer ud fra niveautesten, så hun ikke keder sig. */
export function applyPlacement(results) {
  for (const r of results) {
    const f = ensureFact(r.key);
    if (r.correct) {
      f.l = r.ms < 3500 ? 3 : 2;
      f.run = r.ms < 3500 ? 4 : 2;
      f.ok++;
    } else {
      f.l = 0; f.run = 0; f.err++;
    }
    f.seen++;
    f.last = Date.now();
    f.due = Date.now() + REST_DAYS[f.l] * 86400000;
    if (r.correct) f.avgMs = r.ms;
  }
  // Naboer til det hun kan, får et lille forspring.
  S.save(true);
}
