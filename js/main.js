// App-skal: router, bundnavigation og opstart.

import * as S from './store.js';
import * as audio from './audio.js';
import { $, h } from './ui.js';

import home from './screens/home.js';
import quiz from './screens/quiz.js';
import tables from './screens/tables.js';
import album from './screens/album.js';
import stats from './screens/stats.js';
import settings from './screens/settings.js';
import onboarding from './screens/onboarding.js';

const ROUTES = { home, quiz, tables, album, stats, settings, onboarding };

const NAV = [
  { id: 'home', ico: '🐶', label: 'Træn' },
  { id: 'tables', ico: '🔢', label: 'Tabeller' },
  { id: 'album', ico: '📖', label: 'Album' },
  { id: 'stats', ico: '📈', label: 'Fremgang' },
];

let current = null;

export function go(name, params = {}) {
  const render = ROUTES[name];
  if (!render) return go('home');
  current = name;
  const app = $('#app');
  app.innerHTML = '';
  const node = render(params);
  app.appendChild(node);
  if (!['quiz', 'onboarding'].includes(name)) app.appendChild(navBar(name));
  window.scrollTo(0, 0);
}

export function refresh() { go(current || 'home'); }

function navBar(active) {
  const nav = h(`<nav class="nav">${NAV.map((n) => `
    <button data-go="${n.id}" class="${n.id === active ? 'on' : ''}">
      <span class="ico">${n.ico}</span><span>${n.label}</span>
    </button>`).join('')}</nav>`);
  nav.addEventListener('click', (e) => {
    const b = e.target.closest('button[data-go]');
    if (b) { audio.sfx.tap(); go(b.dataset.go); }
  });
  return nav;
}

function boot() {
  const s = S.load();
  audio.setEnabled(s.settings.sound);
  document.body.classList.toggle('big', !!s.settings.bigText);

  // Lås lyden op ved første tryk (krav på iOS).
  const unlock = () => { audio.unlock(); document.removeEventListener('pointerdown', unlock); };
  document.addEventListener('pointerdown', unlock);

  go(s.onboarded ? 'home' : 'onboarding');

  if ('serviceWorker' in navigator && location.protocol === 'https:') {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  }
  // Gem altid inden appen lukkes.
  addEventListener('visibilitychange', () => { if (document.hidden) S.save(true); });
  addEventListener('pagehide', () => S.save(true));
}

boot();
