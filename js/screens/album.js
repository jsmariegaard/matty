// Hvalpealbummet, medaljer og Mattys tilbehør.

import * as S from '../store.js';
import { h, esc, overlay, closeOverlay } from '../ui.js';
import { albumStatus, badgeStatus, unlockedAccessories } from '../progress.js';
import { portrait, reqText, ACC_UNLOCKS } from '../data/content.js';
import { mascotSvg, setMood, setAccessory } from '../mascot.js';
import { sfx } from '../audio.js';
import { go } from '../main.js';

const photoUrl = (id) => `./assets/puppies/${id}.jpg`;

/** Prøv at hente et rigtigt foto; ellers bliver den tegnede hvalp stående. */
function hookPhotos(root) {
  root.querySelectorAll('img[data-photo]').forEach((img) => {
    img.onload = () => {
      img.style.display = 'block';
      const svg = img.parentElement.querySelector('svg');
      if (svg) svg.style.display = 'none';
    };
    img.onerror = () => img.remove();
    img.src = photoUrl(img.dataset.photo);
  });
}

export default function album() {
  const s = S.get();
  const cards = albumStatus();
  const badges = badgeStatus();
  const unlockedAcc = unlockedAccessories();
  const got = cards.filter((c) => c.unlocked).length;

  const root = h(`<div class="screen">
    <div class="topbar"><h1 style="margin:0">Album</h1><span class="grow"></span>
      <span class="chip">📸 ${got}/${cards.length}</span></div>

    <div class="card tight">
      <h2 style="margin-bottom:10px">🎽 Mattys garderobe</h2>
      <div class="acc-grid">
        <button class="chip acc-pick" data-acc="none">Ingenting</button>
        ${ACC_UNLOCKS.map((a) => {
          const on = unlockedAcc.some((u) => u.acc === a.acc);
          return `<button class="chip acc-pick" data-acc="${a.acc}" ${on ? '' : 'disabled style="opacity:.45"'}>
            ${on ? '' : '🔒 '}${esc(a.name)}${on ? '' : `<br><small style="font-weight:600;opacity:.8">${esc(reqText(a.req))}</small>`}</button>`;
        }).join('')}
      </div>
      <div style="margin-top:6px">${mascotSvg()}</div>
    </div>

    <h2 style="margin-top:20px">🐕 Hvalpekort</h2>
    <div class="album">
      ${cards.map((c, i) => `
        <div class="pcard ${c.unlocked ? '' : 'locked'}" data-card="${c.id}">
          <div class="pic">${c.unlocked ? portrait(i) : ''}
            ${c.unlocked ? `<img data-photo="${c.id}" alt="${esc(c.name)}" style="display:none">` : ''}</div>
          <div class="cap">${c.unlocked ? esc(c.name) : '???'}
            <small>${c.unlocked ? 'Låst op' : esc(reqText(c.req))}</small></div>
        </div>`).join('')}
    </div>

    <h2 style="margin-top:22px">🏅 Medaljer</h2>
    <div class="badges">
      ${badges.map((b) => `<div class="badge ${b.earned ? 'on' : 'off'}" data-badge="${b.id}">
        <div class="b">${b.icon}</div>${esc(b.name)}</div>`).join('')}
    </div>
  </div>`);

  setMood(root, 'happy');
  setAccessory(root, s.accessory);
  hookPhotos(root);

  root.querySelectorAll('.acc-pick').forEach((b) => {
    b.onclick = () => {
      if (b.disabled) return;
      s.accessory = b.dataset.acc === 'none' ? null : b.dataset.acc;
      S.save(true); sfx.bark();
      setAccessory(root, s.accessory);
      setMood(root, 'excited', 900);
    };
  });

  root.querySelectorAll('.pcard').forEach((el) => {
    el.onclick = () => {
      const c = cards.find((x) => x.id === el.dataset.card);
      sfx.tap();
      if (!c.unlocked) {
        overlay(`<div style="font-size:3rem">🔒</div><h2>Ikke låst op endnu</h2>
          <p>Du får dette kort ved: <b>${esc(reqText(c.req))}</b></p>
          <button class="btn ghost" onclick="void 0" data-close>Luk</button>`)
          .el.querySelector('[data-close]').onclick = closeOverlay;
        return;
      }
      const i = cards.indexOf(c);
      const o = overlay(`
        <div class="pic" style="aspect-ratio:1;border-radius:18px;overflow:hidden;background:var(--bg2);display:grid;place-items:center">
          ${portrait(i)}<img data-photo="${c.id}" alt="${esc(c.name)}" style="display:none;width:100%;height:100%;object-fit:cover">
        </div>
        <h2 style="margin-top:14px">${esc(c.name)}</h2>
        <p>${esc(c.fact)}</p>
        <button class="btn ghost" data-close>Luk</button>`);
      hookPhotos(o.el);
      o.el.querySelector('[data-close]').onclick = closeOverlay;
    };
  });

  root.querySelectorAll('.badge').forEach((el) => {
    el.onclick = () => {
      const b = badges.find((x) => x.id === el.dataset.badge);
      sfx.tap();
      const o = overlay(`<div style="font-size:3.4rem">${b.icon}</div><h2>${esc(b.name)}</h2>
        <p>${esc(b.desc)}</p>
        <p class="meta">${b.earned ? 'Optjent ' + (S.get().badges[b.id] || '') : 'Ikke optjent endnu'}</p>
        <button class="btn ghost" data-close>Luk</button>`);
      o.el.querySelector('[data-close]').onclick = closeOverlay;
    };
  });

  return root;
}
