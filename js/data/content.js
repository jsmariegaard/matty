// Alt indhold på dansk: ros, hvalpekort, medaljer.

export const PRAISE_OK = [
  'Sådan!', 'Flot!', 'Perfekt!', 'Ja!', 'Nemlig!', 'Super!', 'Dygtig!',
  'Lige i skabet!', 'Wuf! Rigtigt!', 'Den sad!', 'Du kan det jo!',
];
export const PRAISE_FAST = ['Lynhurtigt!', 'Wow, hvor hurtigt!', 'Du fløj igennem den!', 'Rekordfart!'];
export const PRAISE_COMBO = [
  'Matty logrer vildt!', 'Du er i gang nu!', 'Hold den kørende!', 'Uovervindelig!',
];
export const CONSOLE_MSG = [
  'Tæt på! Prøv igen om lidt.', 'Den er svær – vi tager den igen.',
  'Ikke helt. Matty tror stadig på dig.', 'Sådan lærer man. Videre!',
  'Ingen ballade – den kommer.',
];

export const SESSION_END = [
  { min: 1.0, msg: 'FEJLFRIT! Matty er helt vild!', mood: 'excited' },
  { min: 0.9, msg: 'Rigtig flot klaret!', mood: 'proud' },
  { min: 0.7, msg: 'Godt gået – du rykker!', mood: 'happy' },
  { min: 0.5, msg: 'Fint arbejde. Vi øver videre.', mood: 'happy' },
  { min: 0.0, msg: 'Svær runde. Men du gav ikke op!', mood: 'idle' },
];

export const HOME_LINES = {
  firstEver: (n) => `Hej ${n}! Skal vi lære gangetabeller sammen?`,
  goalDone: (n) => `${n}, du har klaret dagens mål! 🎉`,
  streakRisk: () => 'Din streak mangler dagens træning!',
  morning: (n) => `Godmorgen, ${n}! Klar til fem minutter?`,
  evening: (n) => `${n}, vi når lige en runde inden i seng?`,
  normal: (n) => `Hej ${n}! Matty vil gerne lege med tal.`,
  longStreak: (d) => `${d} dage i træk! Du er sej.`,
};

// --- Hvalpealbum ------------------------------------------------------------
// Billeder er valgfrie: læg <id>.jpg i assets/puppies/ så vises de automatisk.

export const ALBUM = [
  // Familiens egen hund. Står først og er der fra dag ét.
  { id: 'chili', name: 'Chili', req: { t: 'level', v: 1 }, own: true, coat: 2, collar: '#c2352b',
    fact: 'Det er jeres egen labrador. Hun holder med dig hele vejen gennem gangetabellen.' },
  { id: 'bella',  name: 'Bella',  req: { t: 'level', v: 1 },  fact: 'Labradoren stammer fra Newfoundland i Canada – ikke fra Labrador.' },
  { id: 'sofus',  name: 'Sofus',  req: { t: 'level', v: 2 },  fact: 'Labradorer har svømmehud mellem tæerne. Derfor svømmer de så godt.' },
  { id: 'luna',   name: 'Luna',   req: { t: 'streak', v: 3 }, fact: 'Halen kaldes en odderhale – den virker som et ror i vandet.' },
  { id: 'molly',  name: 'Molly',  req: { t: 'level', v: 3 },  fact: 'Gule labradorer går fra næsten hvid til rævrød.' },
  { id: 'balder', name: 'Balder', req: { t: 'gold', v: 5 },   fact: 'En labrador kan lære over 100 ord.' },
  { id: 'frida',  name: 'Frida',  req: { t: 'level', v: 4 },  fact: 'Hvalpe sover 16-20 timer i døgnet.' },
  { id: 'buster', name: 'Buster', req: { t: 'streak', v: 7 }, fact: 'Labradorer bliver tit førerhunde, fordi de er rolige og kloge.' },
  { id: 'nala',   name: 'Nala',   req: { t: 'level', v: 5 },  fact: 'En hundenæse har over 200 millioner lugteceller. Din har cirka 5 millioner.' },
  { id: 'otto',   name: 'Otto',   req: { t: 'gold', v: 15 },  fact: 'Labradorpelsen har to lag og er næsten vandtæt.' },
  { id: 'vega',   name: 'Vega',   req: { t: 'level', v: 6 },  fact: 'Labradorer elsker at bære ting i munden – helt blidt.' },
  { id: 'milo',   name: 'Milo',   req: { t: 'level', v: 7 },  fact: 'En voksen labrador vejer typisk mellem 25 og 36 kilo.' },
  { id: 'karla',  name: 'Karla',  req: { t: 'streak', v: 14 },fact: 'Hvalpe fødes blinde og døve og åbner øjnene efter cirka to uger.' },
  { id: 'ronja',  name: 'Ronja',  req: { t: 'gold', v: 30 },  fact: 'Labradorer kan svømme i timevis uden at blive trætte.' },
  { id: 'aske',   name: 'Aske',   req: { t: 'level', v: 9 },  fact: 'De taler med dig med hale, ører og øjne.' },
  { id: 'maggie', name: 'Maggie', req: { t: 'level', v: 11 }, fact: 'En labrador bliver typisk 10-12 år.' },
  { id: 'sigurd', name: 'Sigurd', req: { t: 'gold', v: 55 },  fact: 'Du kan alle 55 gangestykker på guld. Sigurd bukker for dig.' },
];

export function reqText(req) {
  if (req.t === 'level') return `Niveau ${req.v}`;
  if (req.t === 'streak') return `${req.v} dages streak`;
  if (req.t === 'gold') return `${req.v} guldstykker`;
  return '';
}

// --- Medaljer ---------------------------------------------------------------

export const BADGES = [
  { id: 'first',    icon: '🐾', name: 'Første tur',   desc: 'Gennemfør din første runde',      check: (s) => s.sessions.length >= 1 },
  { id: 'streak3',  icon: '🔥', name: '3 dage',       desc: '3 dage i træk',                   check: (s) => s.streak.best >= 3 },
  { id: 'streak7',  icon: '🔥', name: 'En hel uge',   desc: '7 dage i træk',                   check: (s) => s.streak.best >= 7 },
  { id: 'streak30', icon: '🏅', name: 'En måned',     desc: '30 dage i træk',                  check: (s) => s.streak.best >= 30 },
  { id: 'perfect',  icon: '⭐', name: 'Fejlfri',      desc: 'En runde helt uden fejl',         check: (s) => s.counters.perfect >= 1 },
  { id: 'perfect10',icon: '🌟', name: '10 fejlfri',   desc: '10 runder helt uden fejl',        check: (s) => s.counters.perfect >= 10 },
  { id: 'combo10',  icon: '⚡', name: '10 i træk',    desc: '10 rigtige i træk',               check: (s) => s.counters.bestCombo >= 10 },
  { id: 'combo25',  icon: '💥', name: '25 i træk',    desc: '25 rigtige i træk',               check: (s) => s.counters.bestCombo >= 25 },
  { id: 'fast50',   icon: '🚀', name: 'Lynhurtig',    desc: '50 svar på under 2 sekunder',     check: (s) => s.counters.fast >= 50 },
  { id: 'sprint40', icon: '⏱️', name: 'Sprinter',     desc: '40 rigtige i et tidsløb',         check: (s) => (s.records.sprint?.score || 0) >= 40 },
  { id: 'goldtab',  icon: '🥇', name: 'Guldtabel',    desc: 'Én hel tabel på guld',            check: (s, x) => x.anyGoldTable },
  { id: 'halfway',  icon: '📗', name: 'Halvvejs',     desc: '28 stykker sidder fast',          check: (s, x) => x.mastered >= 28 },
  { id: 'allgold',  icon: '👑', name: 'Alle 55',      desc: 'Alle stykker på guld',            check: (s, x) => x.gold >= 55 },
  { id: 'brave',    icon: '💪', name: 'Sej',          desc: '5 runder med de svære kort',      check: (s) => s.counters.hardRuns >= 5 },
  { id: 'tester',   icon: '📝', name: 'Prøvetager',   desc: 'Tag 5 tabelprøver',               check: (s) => s.counters.testRuns >= 5 },
  { id: 'loyal',    icon: '💛', name: 'Trofast',      desc: 'Træn 25 forskellige dage',        check: (s) => Object.keys(s.days).length >= 25 },
];

// --- Tilbehør der låses op --------------------------------------------------

export const ACC_UNLOCKS = [
  { acc: 'bandana', name: 'Bandana',        req: { t: 'level', v: 2 } },
  { acc: 'cap',     name: 'Kasket',         req: { t: 'level', v: 4 } },
  { acc: 'shades',  name: 'Solbriller',     req: { t: 'streak', v: 5 } },
  { acc: 'bow',     name: 'Sløjfe',         req: { t: 'gold', v: 10 } },
  { acc: 'scarf',   name: 'Halstørklæde',   req: { t: 'level', v: 6 } },
  { acc: 'party',   name: 'Festhat',        req: { t: 'level', v: 8 } },
  { acc: 'crown',   name: 'Krone',          req: { t: 'gold', v: 40 } },
];

/** Simpelt hvalpeportræt til album-kort uden foto. Kortet kan vælge pels og halsbånd. */
export function portrait(seed = 0, card = {}) {
  const coats = [
    ['#f6e0b4', '#e6c98c'], ['#eec27a', '#d9a45c'], ['#e6b163', '#c9913f'],
    ['#f8ecd2', '#e3d1ad'], ['#dfa15c', '#c98a3c'],
  ];
  const pal = coats[(card.coat ?? seed) % coats.length];
  const collar = card.collar || ['#e8543f', '#4a9bf5', '#8b6df0', '#4ec24e', '#ff6fae'][seed % 5];
  return `<svg viewBox="0 0 120 120" aria-hidden="true">
    <circle cx="60" cy="62" r="52" fill="${pal[1]}" opacity=".25"/>
    <path d="M28 38 C 12 40 10 70 18 88 C 24 100 40 96 42 82 Z" fill="${pal[1]}"/>
    <path d="M92 38 C 108 40 110 70 102 88 C 96 100 80 96 78 82 Z" fill="${pal[1]}"/>
    <ellipse cx="60" cy="58" rx="34" ry="32" fill="${pal[0]}"/>
    <ellipse cx="60" cy="74" rx="20" ry="15" fill="#fff" opacity=".45"/>
    <ellipse cx="48" cy="54" rx="5.5" ry="6.5" fill="#33241c"/>
    <ellipse cx="72" cy="54" rx="5.5" ry="6.5" fill="#33241c"/>
    <circle cx="50" cy="51.5" r="2" fill="#fff"/><circle cx="74" cy="51.5" r="2" fill="#fff"/>
    <path d="M60 64 c 8 0 11 4 11 7 c 0 4 -6 7 -11 7 c -5 0 -11 -3 -11 -7 c 0 -3 3 -7 11 -7 z" fill="#3d2c22"/>
    <path d="M50 82 q10 9 20 0" fill="none" stroke="#3d2c22" stroke-width="2.6" stroke-linecap="round"/>
    <path d="M30 98 Q60 112 90 98 L90 106 Q60 120 30 106 Z" fill="${collar}"/>
  </svg>`;
}
