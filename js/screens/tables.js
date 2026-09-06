// Overblik over de ti tabeller + prøver med tid og fejl.

import * as S from '../store.js';
import * as E from '../engine.js';
import * as F from '../facts.js';
import { h, esc, pct, fmtTime, overlay, closeOverlay } from '../ui.js';
import { sfx } from '../audio.js';
import { go } from '../main.js';

function medal(p) {
  if (p.gold === 10) return '🥇';
  if (p.ratio >= 0.7) return '🥈';
  if (p.ratio >= 0.4) return '🥉';
  return '';
}

export default function tables() {
  const s = S.get();
  const rows = [...Array(10)].map((_, i) => E.tableProgress(i + 1));
  const all = s.records.all;

  const root = h(`<div class="screen">
    <div class="topbar"><h1 style="margin:0">Tabeller</h1></div>
    <p class="meta">Vælg en tabel for at træne den – eller tag en prøve på tid.</p>

    <div class="table-list">
      ${rows.map((p) => `
        <button class="table-row ${p.gold === 10 ? 'done' : ''}" data-t="${p.table}">
          <span class="num">${p.table}</span>
          <span class="info">
            <b>${p.table}-tabellen ${medal(p)}</b>
            <span class="bar ${p.gold === 10 ? 'gold' : ''}"><i style="width:${pct(p.ratio)}"></i></span>
          </span>
          <span class="meta">${p.gold}/10</span>
        </button>`).join('')}
    </div>

    <div class="card" style="margin-top:16px">
      <h2>🏁 Den store prøve</h2>
      <p class="meta">Alle 55 stykker på tid. Hvor hurtigt kan du med færrest fejl?</p>
      ${all ? `<p><b>Din rekord:</b> ${fmtTime(all.ms)} med ${all.wrong} fejl</p>` : '<p class="meta">Du har ikke prøvet endnu.</p>'}
      <button class="btn blue small" data-bigtest>Tag den store prøve</button>
    </div>
  </div>`);

  root.querySelectorAll('.table-row').forEach((b) => {
    b.onclick = () => { sfx.tap(); openTable(Number(b.dataset.t)); };
  });
  root.querySelector('[data-bigtest]').onclick = () => go('quiz', { mode: 'test' });
  return root;
}

function openTable(t) {
  const s = S.get();
  const p = E.tableProgress(t);
  const rec = s.records[`table:${t}`];
  const facts = F.tableKeys(t);

  const o = overlay(`
    <h2>${t}-tabellen</h2>
    <p class="meta">${esc(F.strategyFor(t))}</p>
    <div class="grid10" style="grid-template-columns:repeat(5,1fr);margin:14px 0">
      ${facts.map((k, i) => {
        const m = E.MASTERY[E.masteryOf(k)];
        return `<div style="aspect-ratio:auto;padding:8px 2px;background:${m.color};color:${m.ink};font-size:.72rem${
          m.ring ? `;box-shadow:inset 0 0 0 2px ${m.ring}` : ''}">
          ${t}×${i + 1}<br><b>${t * (i + 1)}</b></div>`;
      }).join('')}
    </div>
    ${rec ? `<p><b>Prøverekord:</b> ${fmtTime(rec.ms)} · ${rec.wrong} fejl</p>`
          : '<p class="meta">Ingen prøve taget endnu.</p>'}
    <button class="btn green" data-go="table">Træn ${t}-tabellen</button>
    <button class="btn blue small" data-go="test">Tag prøven (10 stk. på tid)</button>
    <button class="btn ghost small" data-close>Luk</button>`);

  o.el.querySelector('[data-go="table"]').onclick = () => { closeOverlay(); go('quiz', { mode: 'table', table: t, length: 12 }); };
  o.el.querySelector('[data-go="test"]').onclick = () => { closeOverlay(); go('quiz', { mode: 'test', table: t }); };
  o.el.querySelector('[data-close]').onclick = closeOverlay;
}
