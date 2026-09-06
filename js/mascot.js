// Matty. En gul labrador tegnet i ren SVG, så han kan reagere på hvert svar.

export const MOODS = ['idle', 'happy', 'excited', 'sad', 'sleepy', 'think', 'wow', 'proud'];

export const ACCESSORIES = {
  none:      { name: 'Ingenting' },
  bandana:   { name: 'Bandana' },
  cap:       { name: 'Kasket' },
  party:     { name: 'Festhat' },
  shades:    { name: 'Solbriller' },
  crown:     { name: 'Krone' },
  scarf:     { name: 'Halstørklæde' },
  bow:       { name: 'Sløjfe' },
};

const C = {
  // Farverne er taget efter familiens egen labrador: dyb, varm gylden pels.
  coat: '#dda560', coatLight: '#f0d3a2', coatDark: '#c68b45', coatDeep: '#a5702c',
  line: '#8f5f22', nose: '#4a342a', eye: '#2f2118', tongue: '#f4788c',
  collar: '#c2352b', tag: '#d9dee4',
};

/** Returnerer SVG-markup for hele hvalpen. */
export function mascotSvg() {
  return `
<svg class="matty" viewBox="0 0 200 210" role="img" aria-label="Matty, en gul labradorhvalp" data-mood="idle" data-acc="none">
  <defs>
    <radialGradient id="mCoat" cx="40%" cy="30%">
      <stop offset="0%" stop-color="${C.coatLight}"/>
      <stop offset="100%" stop-color="${C.coat}"/>
    </radialGradient>
    <radialGradient id="mBody" cx="45%" cy="25%">
      <stop offset="0%" stop-color="${C.coat}"/>
      <stop offset="100%" stop-color="${C.coatDark}"/>
    </radialGradient>
    <clipPath id="mHeadClip"><ellipse cx="100" cy="86" rx="47" ry="43"/></clipPath>
  </defs>

  <ellipse class="m-shadow" cx="100" cy="199" rx="52" ry="8"/>

  <!-- hale -->
  <g class="m-tail">
    <path d="M143 168 C 172 168 182 148 176 128" fill="none" stroke="${C.coatDark}" stroke-width="15" stroke-linecap="round"/>
    <path d="M143 168 C 172 168 182 148 176 128" fill="none" stroke="${C.coat}" stroke-width="8" stroke-linecap="round"/>
  </g>

  <!-- krop -->
  <g class="m-body">
    <ellipse cx="100" cy="160" rx="46" ry="42" fill="url(#mBody)"/>
    <ellipse cx="100" cy="168" rx="27" ry="30" fill="${C.coatLight}" opacity=".85"/>
    <!-- forben -->
    <g class="m-legs">
      <rect x="70" y="158" width="21" height="42" rx="10" fill="${C.coat}"/>
      <rect x="109" y="158" width="21" height="42" rx="10" fill="${C.coat}"/>
      <ellipse cx="80.5" cy="196" rx="12" ry="7" fill="${C.coatLight}"/>
      <ellipse cx="119.5" cy="196" rx="12" ry="7" fill="${C.coatLight}"/>
      <g stroke="${C.coatDeep}" stroke-width="1.6" stroke-linecap="round" opacity=".55">
        <path d="M76 194v4M80.5 193v5M85 194v4"/><path d="M115 194v4M119.5 193v5M124 194v4"/>
      </g>
    </g>
    <!-- halsbånd -->
    <g class="m-collar">
      <path d="M64 132 Q100 152 136 132 L136 142 Q100 162 64 142 Z" fill="${C.collar}"/>
      <circle cx="100" cy="152" r="8" fill="${C.tag}" stroke="#9aa3ad" stroke-width="1.5"/>
      <path d="M100 148.5v7M97 152h6" stroke="#7d868f" stroke-width="1.6" stroke-linecap="round"/>
    </g>
  </g>

  <!-- hoved -->
  <g class="m-head">
    <!-- ører -->
    <path class="m-ear m-ear-l" d="M60 62 C 34 62 26 96 32 124 C 36 142 58 140 62 122 C 66 104 68 78 60 62 Z" fill="${C.coatDark}"/>
    <path class="m-ear m-ear-r" d="M140 62 C 166 62 174 96 168 124 C 164 142 142 140 138 122 C 134 104 132 78 140 62 Z" fill="${C.coatDark}"/>

    <ellipse cx="100" cy="86" rx="47" ry="43" fill="url(#mCoat)"/>
    <g clip-path="url(#mHeadClip)">
      <ellipse cx="100" cy="52" rx="30" ry="16" fill="${C.coatLight}" opacity=".6"/>
    </g>

    <!-- øjenbryn -->
    <g class="m-brows" stroke="${C.coatDeep}" stroke-width="3.4" stroke-linecap="round" fill="none">
      <path class="brow brow-l" d="M70 64 q9 -5 18 -1"/>
      <path class="brow brow-r" d="M112 63 q9 -4 18 1"/>
    </g>

    <!-- øjne -->
    <g class="m-eyes">
      <g class="e e-open">
        <ellipse cx="81" cy="80" rx="8" ry="9" fill="${C.eye}"/>
        <ellipse cx="119" cy="80" rx="8" ry="9" fill="${C.eye}"/>
        <circle cx="84" cy="76.5" r="2.9" fill="#fff"/><circle cx="122" cy="76.5" r="2.9" fill="#fff"/>
        <circle cx="78.5" cy="84" r="1.4" fill="#fff" opacity=".8"/><circle cx="116.5" cy="84" r="1.4" fill="#fff" opacity=".8"/>
      </g>
      <g class="e e-happy" stroke="${C.eye}" stroke-width="5" fill="none" stroke-linecap="round">
        <path d="M73 83 q8 -11 16 0"/><path d="M111 83 q8 -11 16 0"/>
      </g>
      <g class="e e-closed" stroke="${C.eye}" stroke-width="4.5" fill="none" stroke-linecap="round">
        <path d="M73 80 q8 6 16 0"/><path d="M111 80 q8 6 16 0"/>
      </g>
      <g class="e e-wide">
        <ellipse cx="81" cy="79" rx="11" ry="12" fill="#fff" stroke="${C.eye}" stroke-width="2"/>
        <ellipse cx="119" cy="79" rx="11" ry="12" fill="#fff" stroke="${C.eye}" stroke-width="2"/>
        <circle cx="82" cy="80" r="6.5" fill="${C.eye}"/><circle cx="120" cy="80" r="6.5" fill="${C.eye}"/>
        <circle cx="84.5" cy="77" r="2.4" fill="#fff"/><circle cx="122.5" cy="77" r="2.4" fill="#fff"/>
      </g>
      <g class="e e-sad">
        <ellipse cx="81" cy="82" rx="8" ry="8" fill="${C.eye}"/>
        <ellipse cx="119" cy="82" rx="8" ry="8" fill="${C.eye}"/>
        <circle cx="83" cy="79" r="2.6" fill="#fff"/><circle cx="121" cy="79" r="2.6" fill="#fff"/>
        <path d="M71 72 q10 -3 19 3M110 75 q9 -6 19 -3" stroke="${C.coatDeep}" stroke-width="3.4" fill="none" stroke-linecap="round"/>
      </g>
      <g class="e e-look">
        <ellipse cx="81" cy="80" rx="8" ry="9" fill="${C.eye}"/>
        <ellipse cx="119" cy="80" rx="8" ry="9" fill="${C.eye}"/>
        <circle cx="81" cy="75" r="3" fill="#fff"/><circle cx="119" cy="75" r="3" fill="#fff"/>
      </g>
    </g>

    <!-- snude -->
    <ellipse cx="100" cy="108" rx="28" ry="21" fill="${C.coatLight}"/>
    <g class="m-mouth">
      <path class="mo mo-smile" d="M86 112 q14 14 28 0" fill="none" stroke="${C.nose}" stroke-width="3.4" stroke-linecap="round"/>
      <g class="mo mo-open">
        <path d="M82 108 q18 26 36 0 z" fill="${C.nose}"/>
        <path d="M92 120 q8 16 16 0 z" fill="${C.tongue}"/>
      </g>
      <g class="mo mo-tongue">
        <path d="M86 112 q14 12 28 0" fill="none" stroke="${C.nose}" stroke-width="3.4" stroke-linecap="round"/>
        <path d="M96 118 q4 14 10 2 z" fill="${C.tongue}"/>
      </g>
      <path class="mo mo-flat" d="M88 116 h24" fill="none" stroke="${C.nose}" stroke-width="3.4" stroke-linecap="round"/>
      <path class="mo mo-frown" d="M87 119 q13 -12 26 0" fill="none" stroke="${C.nose}" stroke-width="3.4" stroke-linecap="round"/>
      <ellipse class="mo mo-o" cx="100" cy="116" rx="7" ry="9" fill="${C.nose}"/>
    </g>
    <path class="m-nose" d="M100 88 c 11 0 15 5 15 9 c 0 6 -8 10 -15 10 c -7 0 -15 -4 -15 -10 c 0 -4 4 -9 15 -9 z" fill="${C.nose}"/>
    <ellipse cx="95" cy="92" rx="4" ry="2.5" fill="#6b5347" opacity=".8"/>

    <!-- tilbehør -->
    <g class="acc acc-bandana">
      <path d="M62 118 L100 150 L138 118 L134 132 Q100 158 66 132 Z" fill="#e8543f"/>
      <circle cx="86" cy="132" r="3" fill="#fff" opacity=".8"/><circle cx="112" cy="130" r="3" fill="#fff" opacity=".8"/>
    </g>
    <g class="acc acc-cap">
      <path d="M56 56 Q100 16 144 56 Z" fill="#3f7ee8"/>
      <path d="M52 56 h96 v9 h-96 z" rx="4" fill="#2f65c4"/>
      <path d="M144 56 q26 4 24 16 q-14 4 -26 -6 z" fill="#2f65c4"/>
      <circle cx="100" cy="26" r="5" fill="#ffd34d"/>
    </g>
    <g class="acc acc-party">
      <path d="M100 6 L124 62 L76 62 Z" fill="#ff6fae"/>
      <path d="M100 6 L112 34 L88 34 Z" fill="#ffd34d" opacity=".9"/>
      <circle cx="100" cy="6" r="7" fill="#6ee7f0"/>
      <circle cx="90" cy="50" r="3.5" fill="#fff"/><circle cx="110" cy="52" r="3.5" fill="#fff"/>
    </g>
    <g class="acc acc-shades">
      <path d="M62 74 h76 v4 h-76 z" fill="#2b2b33"/>
      <rect x="62" y="66" width="34" height="24" rx="10" fill="#2b2b33"/>
      <rect x="104" y="66" width="34" height="24" rx="10" fill="#2b2b33"/>
      <path d="M68 71 l10 0 -12 12 z" fill="#fff" opacity=".28"/>
      <path d="M110 71 l10 0 -12 12 z" fill="#fff" opacity=".28"/>
    </g>
    <g class="acc acc-crown">
      <path d="M64 52 L64 22 L82 40 L100 14 L118 40 L136 22 L136 52 Z" fill="#ffcf3f" stroke="#e0a800" stroke-width="2.5" stroke-linejoin="round"/>
      <circle cx="100" cy="34" r="4.5" fill="#ff5a7a"/>
      <circle cx="74" cy="44" r="3.5" fill="#6ee7f0"/><circle cx="126" cy="44" r="3.5" fill="#6ee7f0"/>
    </g>
    <g class="acc acc-bow">
      <path d="M128 44 q-16 -14 -22 2 q16 12 22 -2 z" fill="#ff6fae"/>
      <path d="M128 44 q16 -14 22 2 q-16 12 -22 -2 z" fill="#ff6fae"/>
      <circle cx="128" cy="45" r="5" fill="#ff4d95"/>
    </g>
  </g>

  <g class="acc acc-scarf">
    <path d="M60 130 Q100 156 140 130 L142 146 Q100 172 58 146 Z" fill="#7c5cff"/>
    <path d="M118 152 l16 34 -16 4 -8 -30 z" fill="#6a48f0"/>
  </g>

  <g class="m-zzz">
    <text x="150" y="52" font-size="20" fill="#9aa5b1">z</text>
    <text x="164" y="36" font-size="15" fill="#9aa5b1">z</text>
  </g>
</svg>`;
}

/** Skift humør. Alt det visuelle styres af CSS ud fra data-mood. */
export function setMood(root, mood, ms = 0) {
  const svg = root?.querySelector?.('.matty') || root;
  if (!svg) return;
  clearTimeout(svg._moodTimer);
  const prev = svg.dataset.mood;
  svg.dataset.mood = mood;
  if (ms) svg._moodTimer = setTimeout(() => { svg.dataset.mood = prev === mood ? 'idle' : (prev || 'idle'); }, ms);
}

export function setAccessory(root, acc) {
  const svg = root?.querySelector?.('.matty') || root;
  if (svg) svg.dataset.acc = acc || 'none';
}
