// Kernen i matematikken: hvilke gangestykker findes, hvor svære er de,
// og hvilke svarmuligheder skal vi vise.

export const MIN = 1;
export const MAX = 10;

/** Kanonisk nøgle: 6x7 og 7x6 er det SAMME faktum (kommutativitet). */
export function key(a, b) {
  return a <= b ? `${a}x${b}` : `${b}x${a}`;
}

export function parseKey(k) {
  const [a, b] = k.split('x').map(Number);
  return { a, b };
}

/** Alle 55 unikke gangestykker i 1-10. */
export function allFactKeys() {
  const out = [];
  for (let a = MIN; a <= MAX; a++) for (let b = a; b <= MAX; b++) out.push(`${a}x${b}`);
  return out;
}

/** Alle nøgler der hører til en bestemt tabel. */
export function tableKeys(t) {
  const out = [];
  for (let b = MIN; b <= MAX; b++) out.push(key(t, b));
  return out;
}

// Hvor svært er hvert tal at gange med? (erfaringsbaseret, ikke tilfældigt)
const OPERAND_LOAD = { 1: 0, 2: 1, 3: 3, 4: 3, 5: 1, 6: 4, 7: 5, 8: 4, 9: 2, 10: 0 };

/** 0 = trivielt (1x, 10x), ~9 = værst (6x7, 7x8). */
export function difficulty(a, b) {
  let s = OPERAND_LOAD[a] + OPERAND_LOAD[b];
  if (a === b) s -= 1.5;           // kvadrater er lettere at huske
  return Math.max(0, s);
}

export function difficultyOf(k) {
  const { a, b } = parseKey(k);
  return difficulty(a, b);
}

/** Trivielle stykker vi ikke skal spilde hendes tid på. */
export function isTrivial(k) {
  const { a, b } = parseKey(k);
  return a === 1 || b === 1 || a === 10 || b === 10;
}

// --- Huskeregler ------------------------------------------------------------

const TABLE_STRATEGY = {
  1: 'Alt gange 1 er sig selv.',
  2: 'Gange 2 er bare at lægge tallet til sig selv.',
  3: 'Fordobl og læg tallet til: 3×7 = 14 + 7 = 21.',
  4: 'Fordobl to gange: 4×7 → 14 → 28.',
  5: 'Halvdelen med et 0 bagpå: 5×8 → halvdelen af 8 er 4 → 40.',
  6: 'Tag 5-tabellen og læg tallet til: 6×7 = 35 + 7 = 42.',
  7: 'Del op i 5 + 2: 7×8 = 40 + 16 = 56.',
  8: 'Fordobl tre gange: 8×6 → 12 → 24 → 48.',
  9: 'Gang med 10 og træk tallet fra: 9×7 = 70 − 7 = 63.',
  10: 'Sæt bare et 0 bagpå.',
};

const SPECIAL_HINTS = {
  '7x8': '5, 6, 7, 8 → 56 = 7×8. Tallene kommer i rækkefølge!',
  '6x7': '6×7 = 42. 5×7 er 35, og så én syver mere → 42.',
  '6x8': '3×8 = 24. Fordobl det → 48.',
  '6x6': 'Seks seksere giver 36.',
  '7x7': 'Syv syvere giver 49 – lige under 50.',
  '8x8': 'Otte ottere giver 64.',
  '9x9': '9×9 = 90 − 9 = 81.',
  '4x7': '7 + 7 = 14, og 14 + 14 = 28.',
  '4x6': '6 + 6 = 12, og 12 + 12 = 24.',
  '4x8': '8 + 8 = 16, og 16 + 16 = 32.',
  '4x9': '18 + 18 = 36.',
  '3x7': '2×7 = 14, plus 7 → 21.',
  '3x8': '2×8 = 16, plus 8 → 24.',
  '3x9': '3×10 = 30, minus 3 → 27.',
  '3x6': '2×6 = 12, plus 6 → 18.',
  '3x4': 'Tre firere: 4, 8, 12.',
  '6x9': '6×10 = 60, minus 6 → 54.',
  '7x9': '7×10 = 70, minus 7 → 63.',
  '8x9': '8×10 = 80, minus 8 → 72.',
  '5x7': 'Tæl 5-tabellen: 5, 10, 15, 20, 25, 30, 35.',
  '2x7': '7 + 7 = 14.',
};

export function hintFor(k) {
  if (SPECIAL_HINTS[k]) return SPECIAL_HINTS[k];
  const { a, b } = parseKey(k);
  const t = OPERAND_LOAD[a] >= OPERAND_LOAD[b] ? a : b;
  return TABLE_STRATEGY[t];
}

export function strategyFor(t) {
  return TABLE_STRATEGY[t] || '';
}

// --- Svarmuligheder ---------------------------------------------------------

export function shuffle(arr, rnd = Math.random) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Tre distraktorer der ligner rigtige fejl (nabo-produkter, cifferombytning),
 * ikke bare tilfældige tal. Så træner hun faktisk genkaldelse.
 */
export function choicesFor(a, b) {
  const p = a * b;
  const near = [p + a, p - a, p + b, p - b];
  const swap = p >= 10 && p % 10 !== Math.floor(p / 10)
    ? [Number(String(p).split('').reverse().join(''))] : [];
  const classic = [a + b, p + 1, p - 1, p + 10, p - 10];

  const seen = new Set([p]);
  const pick = [];
  for (const group of [shuffle(near), swap, shuffle(classic)]) {
    for (const v of group) {
      if (v > 0 && v <= 130 && !seen.has(v)) { seen.add(v); pick.push(v); }
      if (pick.length >= 3) break;
    }
    if (pick.length >= 3) break;
  }
  let n = 2;
  while (pick.length < 3) {
    const v = p + n; n++;
    if (!seen.has(v)) { seen.add(v); pick.push(v); }
  }
  return shuffle([p, ...pick.slice(0, 3)]);
}
