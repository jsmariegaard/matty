// Første gang appen åbnes: navn, dagligt mål og en frivillig niveautest.

import * as S from '../store.js';
import * as E from '../engine.js';
import { h, $, esc } from '../ui.js';
import { mascotSvg, setMood } from '../mascot.js';
import { sfx } from '../audio.js';
import { go } from '../main.js';

export default function onboarding() {
  const root = h('<div class="screen plain"></div>');
  let step = 0;
  let name = S.get().name || '';

  function render() {
    root.innerHTML = '';
    root.appendChild(STEPS[step]());
    setMood(root, step === 0 ? 'happy' : 'idle');
  }

  const wrap = (inner) => h(`<div>
    <div class="hero">${mascotSvg()}</div>
    <div class="card">${inner}</div>
  </div>`);

  const STEPS = [
    () => {
      const el = wrap(`
        <h1>Hej! Jeg hedder Matty 🐶</h1>
        <p>Jeg er en gul labrador, og jeg elsker gangetabeller. Vil du øve dem sammen med mig?</p>
        <label class="row" style="border:0;display:block">
          <span>Hvad hedder du?</span>
          <input type="text" id="ob-name" maxlength="16" placeholder="Dit navn" value="${esc(name)}"
                 autocomplete="off" autocapitalize="words" style="margin-top:8px">
        </label>
        <button class="btn" id="ob-next">Kom i gang</button>`);
      el.querySelector('#ob-next').onclick = () => {
        name = el.querySelector('#ob-name').value.trim().slice(0, 16);
        S.get().name = name;
        S.save(true);
        sfx.bark();
        step = 1; render();
      };
      return el;
    },

    () => {
      const s = S.get();
      const el = wrap(`
        <h1>${name ? esc(name) + ', l' : 'L'}idt hver dag 🔥</h1>
        <p>Det virker bedst med få minutter dagligt. Hver dag du når dit mål, vokser din streak.</p>
        <p class="meta">Hvor mange rigtige svar vil du ramme om dagen?</p>
        <div class="btn-row" style="margin:14px 0">
          ${[10, 20, 30].map((v) => `<button class="btn ghost small goal" data-v="${v}"
            ${s.settings.dailyGoal === v ? 'style="border-color:var(--gold)"' : ''}>${v}</button>`).join('')}
        </div>
        <button class="btn" id="ob-next">Videre</button>`);
      el.querySelectorAll('.goal').forEach((b) => b.onclick = () => {
        S.get().settings.dailyGoal = Number(b.dataset.v);
        S.save(true); sfx.tap(); render();
      });
      el.querySelector('#ob-next').onclick = () => { step = 2; render(); };
      return el;
    },

    () => {
      const el = wrap(`
        <h1>Må jeg se hvad du kan? 🎾</h1>
        <p>12 hurtige spørgsmål. Så ved jeg hvor vi skal starte, og du slipper for det du allerede kan.</p>
        <p class="meta">Der er ingen karakterer. Gæt bare hvis du er i tvivl.</p>
        <button class="btn green" id="ob-test">Ja, lad os teste</button>
        <button class="btn ghost small" id="ob-skip">Spring over</button>`);
      el.querySelector('#ob-test').onclick = () => {
        E.seedTrivial();
        finish(false);
        go('quiz', { mode: 'placement' });
      };
      el.querySelector('#ob-skip').onclick = () => { E.seedTrivial(); finish(true); };
      return el;
    },
  ];

  function finish(navigate) {
    const s = S.get();
    s.onboarded = true;
    S.save(true);
    if (navigate) go('home');
  }

  render();
  return root;
}
