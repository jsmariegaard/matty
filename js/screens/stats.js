// Fremgang: varmekort over alle 55 stykker, historik, fart og rekorder.

import * as S from '../store.js';
import * as E from '../engine.js';
import * as F from '../facts.js';
import { h, esc, pct, fmtTime, fmtSec, toast, overlay, closeOverlay } from '../ui.js';
import { sfx } from '../audio.js';

function last14() {
  const out = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000);
    const k = S.todayKey(d);
    out.push({ k, label: ['S', 'M', 'T', 'O', 'T', 'F', 'L'][d.getDay()], ...(S.get().days[k] || { correct: 0, wrong: 0 }) });
  }
  return out;
}

function heatmap() {
  let html = '<div class="grid10"><div class="hd">×</div>';
  for (let b = 1; b <= 10; b++) html += `<div class="hd">${b}</div>`;
  for (let a = 1; a <= 10; a++) {
    html += `<div class="hd">${a}</div>`;
    for (let b = 1; b <= 10; b++) {
      const m = E.MASTERY[E.masteryOf(F.key(a, b))];
      html += `<div style="background:${m.color};color:${m.ink}${
        m.ring ? `;box-shadow:inset 0 0 0 2px ${m.ring}` : ''}"
        title="${a}×${b} – ${m.name}">${a * b}</div>`;
    }
  }
  return html + '</div>';
}

function speedTrend(sessions) {
  const pts = sessions.filter((x) => x.total >= 5).slice(0, 12).reverse()
    .map((x) => x.ms / x.total / 1000);
  if (pts.length < 2) return '';
  const max = Math.max(...pts), min = Math.min(...pts);
  const span = Math.max(0.4, max - min);
  const w = 300, hh = 70;
  const d = pts.map((p, i) => {
    const x = (i / (pts.length - 1)) * w;
    const y = hh - ((max - p) / span) * (hh - 12) - 6;
    return `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`;
  }).join(' ');
  return `<svg viewBox="0 0 ${w} ${hh}" style="width:100%;height:80px;overflow:visible">
      <path d="${d}" fill="none" stroke="var(--blue)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
      ${pts.map((p, i) => `<circle cx="${((i / (pts.length - 1)) * w).toFixed(1)}"
        cy="${(hh - ((max - p) / span) * (hh - 12) - 6).toFixed(1)}" r="3.5" fill="var(--blue)"/>`).join('')}
    </svg>
    <div class="meta" style="display:flex;justify-content:space-between">
      <span>Ældst</span><span>Hurtigst: ${fmtSec(min * 1000)} pr. stykke</span><span>Nyest</span></div>`;
}

export default function stats() {
  const s = S.get();
  const o = E.overallProgress();
  const days = last14();
  const maxDay = Math.max(10, ...days.map((d) => d.correct));
  const totalCorrect = Object.values(s.days).reduce((a, d) => a + d.correct, 0);
  const totalWrong = Object.values(s.days).reduce((a, d) => a + d.wrong, 0);
  const acc = totalCorrect + totalWrong ? totalCorrect / (totalCorrect + totalWrong) : 0;
  const recent = s.sessions.filter((x) => x.total >= 5);
  const avgMs = recent.length ? recent.slice(0, 10).reduce((a, x) => a + x.ms / x.total, 0) / Math.min(10, recent.length) : null;

  const root = h(`<div class="screen">
    <div class="topbar"><h1 style="margin:0">Fremgang</h1><span class="grow"></span>
      <button class="icon-btn" data-share aria-label="Del">📤</button></div>

    <div class="stat-grid">
      <div class="stat"><b>${s.streak.count}</b><span>Streak nu</span></div>
      <div class="stat"><b>${s.streak.best}</b><span>Længste streak</span></div>
      <div class="stat"><b>${totalCorrect}</b><span>Rigtige i alt</span></div>
      <div class="stat"><b>${Math.round(acc * 100)}%</b><span>Træfsikkerhed</span></div>
      <div class="stat"><b>${fmtSec(avgMs)}</b><span>Tid pr. stykke</span></div>
      <div class="stat"><b>${Object.keys(s.days).length}</b><span>Dage trænet</span></div>
    </div>

    <div class="card" style="margin-top:14px">
      <h2>📅 De sidste 14 dage</h2>
      <div style="display:flex;align-items:flex-end;gap:4px;height:90px;margin-top:6px">
        ${days.map((d) => `<div style="flex:1;text-align:center">
          <div style="height:${Math.round((d.correct / maxDay) * 70)}px;background:${d.correct >= s.settings.dailyGoal ? 'var(--green)' : d.correct ? 'var(--gold)' : 'var(--card-edge)'};
            border-radius:5px 5px 2px 2px;min-height:3px" title="${d.k}: ${d.correct} rigtige"></div>
          <div class="meta" style="font-size:.62rem;margin-top:3px">${d.label}</div>
        </div>`).join('')}
      </div>
    </div>

    ${recent.length >= 2 ? `<div class="card">
      <h2>⚡ Bliver du hurtigere?</h2>
      <p class="meta" style="margin:0 0 6px">Sekunder pr. stykke. Nedad er bedre.</p>
      ${speedTrend(recent)}
    </div>` : ''}

    <div class="card">
      <h2>🗺️ Hele gangetabellen</h2>
      <p class="meta">${o.gold} af 55 stykker sidder på guld.</p>
      ${heatmap()}
      <div class="legend">
        ${E.MASTERY.map((m) => `<span><i style="background:${m.color}${
          m.ring ? `;box-shadow:inset 0 0 0 2px ${m.ring}` : ''}"></i>${m.name}</span>`).join('')}
      </div>
    </div>

    <div class="card">
      <h2>🏆 Rekorder</h2>
      ${recordRows(s)}
    </div>
  </div>`);

  root.querySelector('[data-share]').onclick = () => { sfx.tap(); share(); };
  return root;
}

function recordRows(s) {
  const rows = [];
  if (s.records.all) rows.push(['Store prøve · alle 55', `${fmtTime(s.records.all.ms)} · ${s.records.all.wrong} fejl`]);
  if (s.records.sprint) rows.push(['Tidsløb 60 sek.', `${s.records.sprint.score} rigtige`]);
  for (let t = 1; t <= 10; t++) {
    const r = s.records[`table:${t}`];
    if (r) rows.push([`${t}-tabellen`, `${fmtTime(r.ms)} · ${r.wrong} fejl`]);
  }
  if (!rows.length) return '<p class="meta">Tag en prøve for at få din første rekord.</p>';
  return rows.map(([a, b]) => `<label class="row"><span>${esc(a)}</span><b>${esc(b)}</b></label>`).join('');
}

/** "Del med far": en kort tekst hun selv kan sende. */
function share() {
  const s = S.get();
  const o = E.overallProgress();
  const totalCorrect = Object.values(s.days).reduce((a, d) => a + d.correct, 0);
  const recent = s.sessions.filter((x) => x.total >= 5).slice(0, 10);
  const avg = recent.length ? recent.reduce((a, x) => a + x.ms / x.total, 0) / recent.length : null;
  const weak = E.weakestFacts(5).map((k) => { const { a, b } = F.parseKey(k); return `${a}×${b}`; });

  const text = [
    `🐶 ${s.name || 'Jeg'} træner gangetabeller med Matty`,
    ``,
    `🔥 Streak: ${s.streak.count} dage (bedste: ${s.streak.best})`,
    `⭐ Niveau ${S.levelInfo().level} – ${S.levelInfo().name}`,
    `✅ ${totalCorrect} rigtige svar i alt`,
    `🥇 ${o.gold} af 55 stykker sidder helt fast`,
    avg ? `⚡ ${fmtSec(avg)} pr. stykke i snit` : null,
    s.records.all ? `🏁 Store prøve: ${fmtTime(s.records.all.ms)} med ${s.records.all.wrong} fejl` : null,
    weak.length ? `💪 Øver stadig: ${weak.join(', ')}` : null,
  ].filter(Boolean).join('\n');

  const done = (msg) => toast(msg, 'gold');
  if (navigator.share) {
    navigator.share({ text }).catch(() => {});
    return;
  }
  const ov = overlay(`<h2>Del din fremgang</h2>
    <textarea rows="10" readonly style="font-size:.9rem">${esc(text)}</textarea>
    <button class="btn green small" data-copy>Kopiér</button>
    <button class="btn ghost small" data-close>Luk</button>`);
  ov.el.querySelector('[data-copy]').onclick = async () => {
    try { await navigator.clipboard.writeText(text); done('Kopieret!'); }
    catch { ov.el.querySelector('textarea').select(); done('Markeret – tryk Kopiér'); }
  };
  ov.el.querySelector('[data-close]').onclick = closeOverlay;
}
