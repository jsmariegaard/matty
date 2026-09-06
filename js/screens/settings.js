// Indstillinger, sikkerhedskopi og nulstilling.

import * as S from '../store.js';
import * as audio from '../audio.js';
import { h, esc, toast, overlay, closeOverlay } from '../ui.js';
import { go, refresh } from '../main.js';

const APP_VERSION = '1.0.0';

export default function settings() {
  const s = S.get();

  const root = h(`<div class="screen">
    <div class="topbar">
      <button class="icon-btn" data-back aria-label="Tilbage">←</button>
      <h1 style="margin:0">Indstillinger</h1>
    </div>

    <div class="card">
      <label class="row" style="display:block;border:0">
        <span>Dit navn</span>
        <input type="text" id="set-name" maxlength="16" value="${esc(s.name)}" style="margin-top:8px">
      </label>
      <label class="row" style="display:block">
        <span>Hvad skal hvalpen hedde?</span>
        <input type="text" id="set-puppy" maxlength="16" value="${esc(s.puppyName)}" style="margin-top:8px">
      </label>
    </div>

    <div class="card">
      <h2>Dagligt mål</h2>
      <p class="meta">Antal rigtige svar for at holde din streak.</p>
      <div class="btn-row">
        ${[10, 15, 20, 30].map((v) => `<button class="btn ghost small goal" data-v="${v}"
          ${s.settings.dailyGoal === v ? 'style="border-color:var(--gold);color:var(--gold-dark)"' : ''}>${v}</button>`).join('')}
      </div>
    </div>

    <div class="card">
      ${toggle('sound', '🔊 Lyd', s.settings.sound)}
      ${toggle('haptics', '📳 Vibration', s.settings.haptics)}
      ${toggle('hints', '💡 Vis hjælpeknap', s.settings.hints)}
      ${toggle('bigText', '🔠 Større tekst', s.settings.bigText)}
    </div>

    <div class="card">
      <h2>💾 Sikkerhedskopi</h2>
      <p class="meta">Alt gemmes kun på denne telefon. Tag en kopi hvis du skifter telefon eller rydder browserdata.</p>
      <button class="btn ghost small" data-export>Lav sikkerhedskopi</button>
      <button class="btn ghost small" data-import>Gendan fra kopi</button>
    </div>

    <div class="card">
      <h2>Om</h2>
      <p class="meta">Matty ${APP_VERSION} · lavet til dig med 🐾<br>
      Streak-frys tilbage: ${s.streak.freezes}</p>
      <button class="btn ghost small" data-reset style="color:var(--red)">Start helt forfra</button>
    </div>
  </div>`);

  root.querySelector('[data-back]').onclick = () => go('home');

  root.querySelector('#set-name').onchange = (e) => { s.name = e.target.value.trim().slice(0, 16); S.save(true); };
  root.querySelector('#set-puppy').onchange = (e) => { s.puppyName = e.target.value.trim().slice(0, 16) || 'Matty'; S.save(true); };

  root.querySelectorAll('.goal').forEach((b) => b.onclick = () => {
    s.settings.dailyGoal = Number(b.dataset.v); S.save(true); refresh();
  });

  root.querySelectorAll('.switch').forEach((sw) => sw.onclick = () => {
    const k = sw.dataset.k;
    s.settings[k] = !s.settings[k];
    sw.classList.toggle('on', s.settings[k]);
    if (k === 'sound') { audio.setEnabled(s.settings[k]); if (s.settings[k]) audio.sfx.bark(); }
    if (k === 'bigText') document.body.classList.toggle('big', s.settings[k]);
    S.save(true);
  });

  root.querySelector('[data-export]').onclick = async () => {
    const code = S.exportBackup();
    const o = overlay(`<h2>Sikkerhedskopi</h2>
      <p class="meta">Gem denne tekst et sikkert sted – fx send den til dig selv.</p>
      <textarea rows="6" readonly style="font-size:.7rem;word-break:break-all">${esc(code)}</textarea>
      <button class="btn green small" data-copy>Kopiér</button>
      <button class="btn ghost small" data-close>Luk</button>`);
    o.el.querySelector('[data-copy]').onclick = async () => {
      try { await navigator.clipboard.writeText(code); toast('Kopieret!', 'gold'); }
      catch { o.el.querySelector('textarea').select(); }
    };
    o.el.querySelector('[data-close]').onclick = closeOverlay;
  };

  root.querySelector('[data-import]').onclick = () => {
    const o = overlay(`<h2>Gendan</h2>
      <p class="meta">Sæt din sikkerhedskopi ind her. Det overskriver det du har nu.</p>
      <textarea rows="6" id="imp" style="font-size:.7rem"></textarea>
      <button class="btn small" data-ok>Gendan</button>
      <button class="btn ghost small" data-close>Fortryd</button>`);
    o.el.querySelector('[data-ok]').onclick = () => {
      try {
        S.importBackup(o.el.querySelector('#imp').value);
        closeOverlay(); toast('Gendannet!', 'gold'); go('home');
      } catch { toast('Koden kunne ikke læses'); }
    };
    o.el.querySelector('[data-close]').onclick = closeOverlay;
  };

  root.querySelector('[data-reset]').onclick = () => {
    const o = overlay(`<div style="font-size:3rem">⚠️</div><h2>Slette alt?</h2>
      <p>Streak, medaljer og hvalpekort forsvinder for altid.</p>
      <button class="btn ghost" data-close>Nej, behold det</button>
      <button class="btn small" data-yes style="background:var(--red);box-shadow:0 5px 0 var(--red-dark)">Ja, slet alt</button>`);
    o.el.querySelector('[data-close]').onclick = closeOverlay;
    o.el.querySelector('[data-yes]').onclick = () => { S.reset(); closeOverlay(); go('onboarding'); };
  };

  return root;
}

function toggle(k, label, on) {
  return `<label class="row"><span>${label}</span>
    <span class="switch ${on ? 'on' : ''}" data-k="${k}" role="switch" aria-checked="${on}"></span></label>`;
}
