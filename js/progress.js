// Holder styr på hvad der er låst op: medaljer, hvalpekort og tilbehør.

import * as S from './store.js';
import * as E from './engine.js';
import { BADGES, ALBUM, ACC_UNLOCKS } from './data/content.js';

function context() {
  const s = S.get();
  const o = E.overallProgress();
  const anyGoldTable = [...Array(10)].some((_, i) => E.tableProgress(i + 1).gold === 10);
  return { mastered: o.mastered, gold: o.gold, anyGoldTable, level: S.levelInfo().level };
}

export function meetsReq(req, ctx = context()) {
  const s = S.get();
  if (req.t === 'level') return ctx.level >= req.v;
  if (req.t === 'streak') return Math.max(s.streak.count, s.streak.best) >= req.v;
  if (req.t === 'gold') return ctx.gold >= req.v;
  return false;
}

export function albumStatus() {
  const ctx = context();
  const s = S.get();
  return ALBUM.map((c) => ({ ...c, unlocked: s.album.includes(c.id) || meetsReq(c.req, ctx) }));
}

export function unlockedAccessories() {
  const ctx = context();
  return ACC_UNLOCKS.filter((a) => meetsReq(a.req, ctx));
}

export function badgeStatus() {
  const s = S.get();
  const ctx = context();
  return BADGES.map((b) => ({ ...b, earned: !!s.badges[b.id] || b.check(s, ctx) }));
}

/**
 * Kaldes efter hver runde. Returnerer alt nyt der skal fejres.
 */
export function checkUnlocks() {
  const s = S.get();
  const ctx = context();
  const news = { badges: [], cards: [], accessories: [] };

  for (const b of BADGES) {
    if (!s.badges[b.id] && b.check(s, ctx)) {
      s.badges[b.id] = S.todayKey();
      news.badges.push(b);
    }
  }
  for (const c of ALBUM) {
    if (!s.album.includes(c.id) && meetsReq(c.req, ctx)) {
      s.album.push(c.id);
      news.cards.push(c);
    }
  }
  for (const a of ACC_UNLOCKS) {
    if (meetsReq(a.req, ctx) && !s.badges['acc:' + a.acc]) {
      s.badges['acc:' + a.acc] = S.todayKey();
      news.accessories.push(a);
    }
  }
  if (news.badges.length || news.cards.length || news.accessories.length) S.save(true);
  return news;
}

/** Registrerer en gennemført runde og returnerer nyt niveau hvis der er et. */
export function finishSession(summary) {
  const s = S.get();
  const beforeLevel = S.levelInfo().level;
  s.sessions.unshift({ t: Date.now(), ...summary });
  if (s.sessions.length > 300) s.sessions.length = 300;
  S.day().sessions++;

  if (summary.mode === 'hard') s.counters.hardRuns++;
  if (summary.mode === 'test') s.counters.testRuns++;
  if (summary.wrong === 0 && summary.total >= 8) s.counters.perfect++;
  s.counters.bestCombo = Math.max(s.counters.bestCombo, summary.bestCombo || 0);
  s.counters.fast += summary.fast || 0;

  // Rekorder: hurtigst med færrest fejl
  if (summary.mode === 'test') {
    const id = summary.table ? `table:${summary.table}` : 'all';
    const old = s.records[id];
    const better = !old || summary.wrong < old.wrong || (summary.wrong === old.wrong && summary.ms < old.ms);
    if (better) { s.records[id] = { ms: summary.ms, wrong: summary.wrong, date: S.todayKey() }; summary.newRecord = true; }
  }
  if (summary.mode === 'sprint') {
    const old = s.records.sprint;
    if (!old || summary.correct > old.score) { s.records.sprint = { score: summary.correct, date: S.todayKey() }; summary.newRecord = true; }
  }

  const goalJustMet = S.checkGoalCompletion();
  const unlocks = checkUnlocks();
  const afterLevel = S.levelInfo().level;
  S.save(true);
  return { goalJustMet, unlocks, leveledUp: afterLevel > beforeLevel ? afterLevel : 0 };
}
