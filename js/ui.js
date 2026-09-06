// Små hjælpere til DOM, lyd-fri effekter og formatering.

export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

/** Byg et element fra en HTML-streng. */
export function h(html) {
  const t = document.createElement('template');
  t.innerHTML = html.trim();
  return t.content.firstElementChild;
}

export function esc(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

export function toast(msg, kind = '') {
  const layer = $('#toast-layer');
  const el = h(`<div class="toast ${kind}">${esc(msg)}</div>`);
  layer.appendChild(el);
  setTimeout(() => { el.style.transition = 'opacity .3s'; el.style.opacity = '0'; }, 1800);
  setTimeout(() => el.remove(), 2200);
}

/** Modal. Returnerer et objekt med close(). */
export function overlay(innerHtml, { dismissable = true } = {}) {
  const layer = $('#overlay-layer');
  layer.innerHTML = '';
  const sheet = h(`<div class="sheet">${innerHtml}</div>`);
  layer.appendChild(sheet);
  const close = () => { layer.innerHTML = ''; };
  if (dismissable) {
    layer.onclick = (e) => { if (e.target === layer) close(); };
  } else {
    layer.onclick = null;
  }
  return { el: sheet, close };
}

export function closeOverlay() { $('#overlay-layer').innerHTML = ''; }

const CONFETTI_COLORS = ['#f5a623', '#4ec24e', '#4a9bf5', '#ff6fae', '#8b6df0', '#ffd34d'];
export function confetti(n = 60) {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const box = h('<div class="confetti"></div>');
  document.body.appendChild(box);
  for (let i = 0; i < n; i++) {
    const p = document.createElement('i');
    p.style.left = Math.random() * 100 + '%';
    p.style.top = -20 - Math.random() * 120 + 'px';
    p.style.background = CONFETTI_COLORS[i % CONFETTI_COLORS.length];
    p.style.animationDuration = 1.6 + Math.random() * 1.6 + 's';
    p.style.animationDelay = Math.random() * 0.5 + 's';
    box.appendChild(p);
  }
  setTimeout(() => box.remove(), 3800);
}

export function vibrate(pattern) {
  try { if (navigator.vibrate) navigator.vibrate(pattern); } catch (_) {}
}

/** Progressring som SVG. */
export function ring(ratio, label, color = 'var(--gold)') {
  const r = 32, c = 2 * Math.PI * r;
  const on = Math.max(0, Math.min(1, ratio)) * c;
  return `<svg class="ring" viewBox="0 0 74 74">
    <circle class="bg" cx="37" cy="37" r="${r}"/>
    <circle class="fg" cx="37" cy="37" r="${r}" style="stroke:${color}"
      stroke-dasharray="${on.toFixed(1)} ${c.toFixed(1)}" transform="rotate(-90 37 37)"/>
    <text class="txt" x="37" y="45" text-anchor="middle">${esc(label)}</text>
  </svg>`;
}

export function fmtTime(ms) {
  if (ms == null) return '–';
  const s = ms / 1000;
  if (s < 60) return s.toFixed(1).replace('.', ',') + ' s';
  const m = Math.floor(s / 60);
  return `${m}:${String(Math.round(s % 60)).padStart(2, '0')}`;
}

export function fmtSec(ms) {
  return ms == null ? '–' : (ms / 1000).toFixed(1).replace('.', ',') + 's';
}

export function pct(x) { return Math.round(x * 100) + '%'; }

export function daName(n) {
  return ['søndag', 'mandag', 'tirsdag', 'onsdag', 'torsdag', 'fredag', 'lørdag'][n];
}
