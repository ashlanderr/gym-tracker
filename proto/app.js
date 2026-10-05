'use strict';

/* =========================================================
   helpers
   ========================================================= */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const r2 = n => Math.round(n * 100) / 100;
const fw = n => (n == null ? '?' : String(r2(n)));
const f1 = n => (Math.round(n * 10) / 10).toFixed(1);
const e1 = (w, r) => (r <= 1 ? w : w * (1 + r / 30)); // Эпли, разовый максимум равен весу
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const rng = ([a, b]) => (a === b ? `${a}` : `${a}–${b}`);
const thin = n => Math.round(n).toLocaleString('ru-RU');
const clone = o => JSON.parse(JSON.stringify(o));
const clock = s => {
  s = Math.max(0, Math.floor(s));
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), x = s % 60;
  return (h ? h + ':' + String(m).padStart(2, '0') : m) + ':' + String(x).padStart(2, '0');
};
const go = h => { location.hash = h; };

/* =========================================================
   icons
   ========================================================= */
const IC = {
  back: '<path d="M15 5l-7 7 7 7"/>',
  right: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  close: '<path d="M6 6l12 12M18 6L6 18"/>',
  check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  minus: '<path d="M5 12h14"/>',
  dots: '<circle cx="5" cy="12" r="1.4"/><circle cx="12" cy="12" r="1.4"/><circle cx="19" cy="12" r="1.4"/>',
  up: '<path d="M12 19V5M6 11l6-6 6 6"/>',
  down: '<path d="M12 5v14M6 13l6 6 6-6"/>',
  levelup: '<path d="M6 12l6-6 6 6M6 19l6-6 6 6"/>',
  target: '<circle cx="12" cy="12" r="7"/><circle cx="12" cy="12" r="2.5"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/>',
  wrench: '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>',
  question: '<circle cx="12" cy="12" r="9"/><path d="M9.3 9.2a2.8 2.8 0 0 1 5.4 1c0 1.9-2.7 2.4-2.7 4"/><path d="M12 17.5h.01"/>',
  timer: '<circle cx="12" cy="13" r="8"/><path d="M12 9v4l2.5 2.5M9.5 2.5h5"/>',
  trash: '<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>',
  swap: '<path d="M7 4L3 8l4 4M3 8h14M17 20l4-4-4-4M21 16H7"/>',
  trophy: '<path d="M8 4h8v6a4 4 0 0 1-8 0zM8 6H4.5v1.5A3.5 3.5 0 0 0 8 11M16 6h3.5v1.5A3.5 3.5 0 0 1 16 11M12 14v3M8 21h8M9 21v-2h6v2"/>',
  dumbbell: '<path d="M6.5 6.5v11M3.5 9v6M17.5 6.5v11M20.5 9v6M6.5 12h11"/>',
  barbell: '<path d="M2 12h20M5.5 7.5v9M8.5 5.5v13M15.5 5.5v13M18.5 7.5v9"/>',
  stack: '<rect x="6" y="3" width="12" height="4" rx="1"/><rect x="6" y="10" width="12" height="4" rx="1"/><rect x="6" y="17" width="12" height="4" rx="1"/><path d="M18 12h3"/>',
  flame: '<path d="M12 3c.8 3.6 5 5.2 5 10a5 5 0 0 1-10 0c0-2.4 1.3-3.9 2.5-5 .2 2 1 3 2 3.3C11 8.6 10.9 5.6 12 3z"/>',
  bolt: '<path d="M13 2L4 14h7l-1 8 9-12h-7z"/>',
  star: '<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/>',
  crown: '<path d="M3 8l4.5 4L12 5l4.5 7L21 8l-2 11H5z"/>',
  pencil: '<path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>',
  sliders: '<path d="M4 6h9M17 6h3M4 12h3M11 12h9M4 18h11M19 18h1"/><circle cx="15" cy="6" r="2"/><circle cx="9" cy="12" r="2"/><circle cx="17" cy="18" r="2"/>',
  reset: '<path d="M4 12a8 8 0 1 0 2.3-5.6M4 4v4h4"/>',
  map: '<path d="M9 4L3 6v14l6-2 6 2 6-2V4l-6 2zM9 4v14M15 6v14"/>',
  shield: '<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/>',
  lock: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
  repeat: '<path d="M17 2l4 4-4 4M3 11V9a3 3 0 0 1 3-3h15M7 22l-4-4 4-4M21 13v2a3 3 0 0 1-3 3H3"/>',
};
const icon = (n, c = '') => `<svg class="ic ${c}" viewBox="0 0 24 24" aria-hidden="true">${IC[n] || ''}</svg>`;

function frame() {
  return `<svg class="frame" viewBox="0 0 100 100"><polygon points="50,3 94,27 94,73 50,97 6,73 6,27" fill="rgba(0,0,0,.55)" stroke="var(--tone)" stroke-width="2.5"/><polygon points="50,13 85,32 85,68 50,87 15,68 15,32" fill="none" stroke="var(--tone)" stroke-width="1.2" opacity=".45" stroke-dasharray="5 3"/></svg>`;
}

const FLAV = { enc: 'Событие', win: 'Уровень пройден', ach: 'Достижение', winSub: 'Данные сохранены' };
const FL = () => FLAV;

/* =========================================================
   data
   ========================================================= */
const DEF_INV = {
  kind: 'stack', configured: true,
  bar: 20, plates: [1.25, 2.5, 5, 10, 20],
  first: 5, step: 5, last: 100, micro: 'none', knob: 2.5, pegs: [1.25, 2.5],
  dmin: 2, dmax: 40, dstep: 2,
};
const mkInv = o => ({ ...clone(DEF_INV), ...o });
const INV0 = {
  gymBar: mkInv({ kind: 'barbell', bar: 20 }),
  curlBar: mkInv({ kind: 'barbell', bar: 10 }),
  pulldownStack: mkInv({ kind: 'stack', first: 5, step: 5, last: 100 }),
  chestStack: mkInv({ kind: 'stack', first: 5, step: 5, last: 100 }),
  rowStack: mkInv({ kind: 'stack', configured: false }),
  crunchStack: mkInv({ kind: 'stack', first: 5, step: 5, last: 80 }),
  tricepsStack: mkInv({ kind: 'stack', configured: false }),
  dumbbells: mkInv({ kind: 'dumbbells', dmin: 2, dmax: 40, dstep: 2 }),
};

const W_ = (w, r) => ({ type: 'W', w, r });
const N_ = (w, r) => ({ type: 'N', w, r });

const EX = {
  bench: {
    name: 'Жим штанги лёжа', move: 'push', img: 'img/bench.webp?v=10', cut: true, inv: 'gymBar', range: [6, 8], sets: 3, weight: 80, rest: 150,
    mods: ['newWeight'],
    last: { date: '28 сентября', sets: [W_(40, 12), W_(67.5, 6), N_(80, 8), N_(80, 8), N_(80, 8)] },
    best: { e1: 101.3, vol: 640, score: 101.3 },
  },
  pulldown: {
    name: 'Тяга верхнего блока к груди', move: 'pull', img: 'img/pulldown.webp?v=10', cut: true, inv: 'pulldownStack', range: [6, 8], sets: 4, weight: 65, rest: 120,
    mods: ['deload'],
    last: { date: '28 сентября', sets: [W_(30, 12), W_(55, 6), N_(65, 8), N_(65, 6), N_(65, 4), N_(65, 4)] },
    older: [{ date: '14 сентября', sets: [N_(60, 8), N_(60, 7), N_(60, 7), N_(60, 6)] }],
    best: { e1: 82.3, vol: 520, score: 79.4 },
  },
  chest: {
    name: 'Жим от груди в тренажёре', move: 'push', img: 'img/chestpress.webp?v=10', cut: true, inv: 'chestStack', range: [10, 12], sets: 3, weight: 100, rest: 120,
    mods: ['upgrade'],
    last: { date: '28 сентября', sets: [W_(50, 12), W_(85, 6), N_(100, 12), N_(100, 12), N_(100, 12)] },
    best: { e1: 140, vol: 1200, score: 140 },
    alts: [
      { ex: 'chestOne', short: 'Тот же тренажёр, весь стек на одну руку', text: 'Тот же тренажёр, но каждая рука работает отдельно. Весь стек на одну руку, запаса хватит надолго.' },
      { ex: 'incline', short: 'Штанга, вес посчитаю от жима лёжа', text: 'Со штангой расти можно почти бесконечно. Стартовый вес посчитаю от твоего жима лёжа.' },
    ],
  },
  row: {
    name: 'Горизонтальная тяга узким хватом в блочном тренажёре', move: 'pull', img: 'img/row.webp?v=10', cut: true, inv: 'rowStack', range: [8, 10], sets: 3, weight: null, rest: 120,
    mods: ['inventory', 'calibration'], calibrating: true,
    alts: [
      { ex: 'bbRow', text: 'Ты уже делал её. Рабочий вес известен, можно сразу в бой.' },
      { ex: 'dbRow', text: 'Проще по технике, спина работает так же. Вес тоже известен.' },
    ],
  },
  curl: {
    name: 'Подъём штанги на бицепс стоя', move: 'pull', img: 'img/curl.webp?v=10', cut: true, inv: 'curlBar', range: [8, 12], sets: 3, weight: 25, rest: 90,
    mods: ['calibration'], calibrating: true, lastCalib: true,
    last: { date: '28 сентября', sets: [W_(12.5, 12), W_(22.5, 6), N_(27.5, 9), N_(27.5, 7), N_(25, 8)] },
    best: { e1: 35.8, vol: 247.5, score: 0 },
  },
  crunch: {
    name: 'Скручивания в тренажёре', move: 'core', img: 'img/crunch.webp?v=10', cut: true, inv: 'crunchStack', range: [12, 15], sets: 3, weight: 40, rest: 60,
    mods: [],
    last: { date: '28 сентября', sets: [W_(20, 12), W_(30, 6), N_(40, 15), N_(40, 14), N_(40, 13)] },
    best: { e1: 60, vol: 600, score: 58.7 },
  },
  // замены и каталог
  incline: { name: 'Жим штанги на наклонной скамье', move: 'push', inv: 'gymBar', range: [6, 8], sets: 3, weight: null, rest: 150, mods: ['calibration'], calibrating: true },
  chestOne: { name: 'Жим в тренажёре одной рукой', move: 'push', img: 'img/chestpress.webp?v=10', cut: true, inv: 'chestStack', range: [10, 12], sets: 3, weight: 55, rest: 90, mods: ['calibration'], calibrating: true },
  bbRow: {
    name: 'Тяга штанги в наклоне', move: 'pull', inv: 'gymBar', range: [8, 10], sets: 3, weight: 60, rest: 120, mods: [],
    last: { date: '24 сентября', sets: [W_(30, 12), W_(50, 6), N_(60, 10), N_(60, 10), N_(60, 9)] },
    best: { e1: 80, vol: 600, score: 79.3 },
  },
  dbRow: {
    name: 'Тяга гантели одной рукой', move: 'pull', inv: 'dumbbells', range: [8, 12], sets: 3, weight: 24, rest: 90, mods: [],
    last: { date: '24 сентября', sets: [N_(24, 12), N_(24, 11), N_(24, 10)] },
    best: { e1: 33.6, vol: 288, score: 32.8 },
  },
  triceps: { name: 'Разгибания рук на блоке с канатом', move: 'push', inv: 'tricepsStack', range: [10, 12], sets: 3, weight: null, rest: 75, mods: ['inventory', 'calibration'], calibrating: true },
  flyes: { name: 'Разведения гантелей лёжа', move: 'push', inv: 'dumbbells', range: [10, 12], sets: 3, weight: null, rest: 75, mods: ['calibration'], calibrating: true },
};
const CATALOG = ['triceps', 'flyes', 'bbRow', 'dbRow', 'incline'];

const MOD = {
  inventory: { name: 'Не настроен инвентарь', icon: 'wrench', tone: 't-bad', block: true },
  upgrade: { name: 'Апгрейд', icon: 'levelup', tone: 't-gold', block: true },
  deload: { name: 'Делоад', icon: 'down', tone: 't-violet', block: true },
  newWeight: { name: 'Новый вес', icon: 'up', tone: 't-good', block: true },
  calibration: { name: 'Подбор веса', icon: 'target', tone: 't-info', block: false },
  order: { name: 'Не по порядку', icon: 'lock', tone: 't-dim', block: true },
};

/* =========================================================
   inventory math
   ========================================================= */
const wCache = new Map();
function microAdds(inv) {
  if (inv.micro === 'knob') return [0, inv.knob];
  if (inv.micro === 'pegs') {
    let sums = [0];
    for (const p of inv.pegs) sums = [...sums, ...sums.map(s => r2(s + p))];
    return [...new Set(sums)].sort((a, b) => a - b);
  }
  return [0];
}
function stackTiles(inv) {
  const t = [];
  for (let w = inv.first, i = 0; w <= inv.last + 1e-9 && i < 300; w = r2(w + inv.step), i++) t.push(r2(w));
  return t;
}
function weights(inv) {
  const key = JSON.stringify(inv);
  if (wCache.has(key)) return wCache.get(key);
  let out = [];
  if (inv.kind === 'barbell') {
    const U = 4, max = 150 * U;
    const ps = inv.plates.map(p => Math.round(p * U));
    const reach = new Uint8Array(max + 1); reach[0] = 1;
    for (let s = 0; s <= max; s++) if (reach[s]) for (const p of ps) if (s + p <= max) reach[s + p] = 1;
    for (let s = 0; s <= max; s++) if (reach[s]) out.push(r2(inv.bar + (2 * s) / U));
  } else if (inv.kind === 'stack') {
    const set = new Set();
    const adds = microAdds(inv);
    stackTiles(inv).forEach(t => adds.forEach(a => set.add(r2(t + a))));
    out = [...set].sort((a, b) => a - b);
  } else {
    for (let w = inv.dmin; w <= inv.dmax + 1e-9; w = r2(w + inv.dstep)) out.push(r2(w));
  }
  if (!out.length) out = [0];
  wCache.set(key, out);
  return out;
}
function roundDown(inv, w) { const ws = weights(inv); let b = ws[0]; for (const x of ws) { if (x <= w + 1e-6) b = x; else break; } return b; }
function roundNear(inv, w) { const ws = weights(inv); return ws.reduce((b, x) => (Math.abs(x - w) < Math.abs(b - w) ? x : b), ws[0]); }
function stepUp(inv, w) { const ws = weights(inv); return ws.find(x => x > w + 1e-6) ?? ws[ws.length - 1]; }
function stepDown(inv, w) { const ws = weights(inv); let b = ws[0]; for (const x of ws) { if (x < w - 1e-6) b = x; else break; } return b; }
function minStep(inv) { const ws = weights(inv); let m = Infinity; for (let i = 1; i < ws.length; i++) m = Math.min(m, r2(ws[i] - ws[i - 1])); return m === Infinity ? 0 : m; }
function platesPerSide(inv, w) {
  let s = r2((w - inv.bar) / 2); const out = [];
  for (const p of [...inv.plates].sort((a, b) => b - a)) while (s >= p - 1e-6) { out.push(p); s = r2(s - p); }
  return out;
}
function stackParts(inv, w) {
  const adds = microAdds(inv); let best = null;
  stackTiles(inv).forEach((t, i) => adds.forEach(a => {
    if (Math.abs(t + a - w) < 1e-6 && (!best || a < best.add)) best = { tile: i + 1, tileW: t, add: a };
  }));
  return best;
}
const nextWeight = (inv, w, [a, b]) => {
  let n = roundDown(inv, e1(w, b) / (1 + a / 30));
  if (n <= w + 1e-6) n = stepUp(inv, w);
  return n <= w + 1e-6 ? null : n;
};

/* =========================================================
   visualisations
   ========================================================= */
const PS = {
  20: { h: 92, w: 13, c: '#2f6fe0', ink: '#fff', d: 62 },
  15: { h: 86, w: 12, c: '#e3c133', ink: '#222', d: 58 },
  10: { h: 78, w: 11, c: '#2fa35a', ink: '#fff', d: 54 },
  5: { h: 58, w: 9, c: '#e9e9e9', ink: '#222', d: 44 },
  2.5: { h: 44, w: 8, c: '#d64545', ink: '#fff', d: 36 },
  1.25: { h: 34, w: 7, c: '#a7adb4', ink: '#222', d: 30 },
};
function barbellSVG(inv, w) {
  const plates = platesPerSide(inv, w);
  const cy = 52, short = inv.bar <= 10;
  const L = short ? 60 : 8, R = short ? 260 : 312;
  const cl = short ? 118 : 108, cr = short ? 202 : 212;
  const total = plates.reduce((s, p) => s + PS[p].w + 1.5, 0);
  const avail = cl - L - 4;
  const k = Math.min(1, avail / Math.max(total, 1));
  let s = `<svg class="viz" viewBox="0 0 320 104">`;
  s += `<rect x="${L}" y="${cy - 4}" width="${R - L}" height="8" rx="2" fill="var(--bar-metal)"/>`;
  s += `<rect x="${cl}" y="${cy - 3}" width="${cr - cl}" height="6" fill="var(--bar-grip)"/>`;
  s += `<rect x="${cl - 6}" y="${cy - 10}" width="6" height="20" rx="1" fill="var(--bar-metal)"/><rect x="${cr}" y="${cy - 10}" width="6" height="20" rx="1" fill="var(--bar-metal)"/>`;
  let xr = cr + 6, xl = cl - 6;
  plates.forEach(p => {
    const st = PS[p], pw = st.w * k, h = st.h;
    s += `<rect x="${xr}" y="${cy - h / 2}" width="${pw}" height="${h}" rx="2" fill="${st.c}" stroke="rgba(0,0,0,.45)" stroke-width="1"/>`;
    s += `<rect x="${xl - pw}" y="${cy - h / 2}" width="${pw}" height="${h}" rx="2" fill="${st.c}" stroke="rgba(0,0,0,.45)" stroke-width="1"/>`;
    xr += pw + 1.5 * k; xl -= pw + 1.5 * k;
  });
  return s + '</svg>';
}
function barOnlySVG(b) {
  const len = b === 20 ? 196 : b === 15 ? 176 : 120;
  const x0 = (200 - len) / 2, sl = b === 10 ? 24 : 40, xa = x0 + sl, xb = x0 + len - sl, xm = (xa + xb) / 2;
  const shaft = b === 10
    ? `<path d="M${xa} 13L${xa + 14} 9L${xa + 26} 17L${xm} 13L${xb - 26} 17L${xb - 14} 9L${xb} 13" fill="none" stroke="var(--bar-grip)" stroke-width="4" stroke-linejoin="round"/>`
    : `<rect x="${xa}" y="11" width="${xb - xa}" height="4" fill="var(--bar-grip)"/>`;
  return `<svg class="viz" viewBox="0 0 200 26"><rect x="${x0}" y="9" width="${sl}" height="8" rx="2" fill="var(--bar-metal)"/><rect x="${xb}" y="9" width="${sl}" height="8" rx="2" fill="var(--bar-metal)"/>${shaft}<rect x="${xa - 3}" y="5" width="3" height="16" fill="var(--bar-metal)"/><rect x="${xb}" y="5" width="3" height="16" fill="var(--bar-metal)"/></svg>`;
}
function stackSVG(inv, w, { annot = false } = {}) {
  const tiles = stackTiles(inv), n = tiles.length;
  const parts = w != null ? stackParts(inv, w) : null;
  const sel = parts ? parts.tile : 0;
  const maxH = annot ? 210 : 176;
  const th = clamp(Math.floor(maxH / n) - 2, 3, 12), gap = th >= 6 ? 2 : 1;
  const top = parts && parts.add ? 30 : 18;
  const H = top + n * (th + gap) + 8;
  const W = annot ? 140 : 300, x0 = annot ? 40 : 96, tw = annot ? 52 : 92;
  const yOf = i => top + i * (th + gap);
  let s = `<svg class="viz" viewBox="0 0 ${W} ${H}" style="max-height:${H * 1.15}px">`;
  s += `<rect x="${x0 - 7}" y="4" width="3" height="${H - 8}" rx="1" fill="var(--bar-grip)"/><rect x="${x0 + tw + 4}" y="4" width="3" height="${H - 8}" rx="1" fill="var(--bar-grip)"/>`;
  s += `<path d="M${x0 + tw / 2} 0V${top}" stroke="var(--bar-metal)" stroke-width="2"/>`;
  if (parts && sel) s += `<path d="M${x0 + tw / 2} ${top}V${yOf(sel - 1) + th}" stroke="var(--bar-metal)" stroke-width="2"/>`;
  tiles.forEach((t, i) => {
    const on = i < sel;
    s += `<rect x="${x0}" y="${yOf(i)}" width="${tw}" height="${th}" rx="1.5" fill="${on ? 'var(--accent)' : 'var(--panel3)'}" stroke="${on ? 'rgba(0,0,0,.35)' : 'var(--line2)'}" stroke-width=".7"/>`;
  });
  const txt = (x, y, t, anchor = 'start', cls = '') => `<text x="${x}" y="${y}" text-anchor="${anchor}" font-size="11" fill="var(--muted)" font-family="var(--font-num)" ${cls}>${t}</text>`;
  if (annot) {
    s += txt(x0 - 12, yOf(0) + th - 1, fw(tiles[0]), 'end');
    s += txt(x0 - 12, yOf(n - 1) + th - 1, fw(tiles[n - 1]), 'end');
    if (n > 1) {
      const y1 = yOf(0) + th / 2, y2 = yOf(1) + th / 2;
      s += `<path d="M${x0 + tw + 12} ${y1}h5V${y2}h-5" fill="none" stroke="var(--accent)" stroke-width="1.2"/>`;
      s += `<text x="${x0 + tw + 21}" y="${(y1 + y2) / 2 + 4}" font-size="11" fill="var(--accent)" font-family="var(--font-num)" font-weight="700">+${fw(inv.step)}</text>`;
    }
  } else {
    s += txt(x0 - 14, yOf(0) + th - 1, `${fw(tiles[0])} кг`, 'end');
    s += txt(x0 - 14, yOf(n - 1) + th - 1, `${fw(tiles[n - 1])} кг`, 'end');
    if (parts) {
      const y = yOf(sel - 1) + th / 2;
      s += `<path d="M${x0 + tw + 8} ${y}H${x0 + tw + 30}" stroke="var(--text)" stroke-width="2"/><circle cx="${x0 + tw + 33}" cy="${y}" r="4" fill="var(--text)"/>`;
      s += `<text x="${x0 + tw + 42}" y="${y + 4}" font-size="13" font-weight="700" fill="var(--text)" font-family="var(--font-num)">${fw(parts.tileW)} кг</text>`;
      if (parts.add) {
        s += `<rect x="${x0 + tw / 2 + 8}" y="3" width="44" height="18" rx="3" fill="var(--gold)"/><text x="${x0 + tw / 2 + 30}" y="16" text-anchor="middle" font-size="11" font-weight="700" fill="#1a1406" font-family="var(--font-num)">+${fw(parts.add)}</text>`;
      }
    }
  }
  return s + '</svg>';
}
function dumbbellSVG(w) {
  const k = clamp(w / 40, 0.15, 1);
  const hh = 26 + 34 * k, hw = 10 + 14 * k;
  const one = cx => `<rect x="${cx - 30}" y="47" width="60" height="6" rx="2" fill="var(--bar-grip)"/>
    <rect x="${cx - 30 - hw}" y="${50 - hh / 2}" width="${hw}" height="${hh}" rx="3" fill="var(--bar-metal)" stroke="rgba(0,0,0,.4)"/>
    <rect x="${cx + 30}" y="${50 - hh / 2}" width="${hw}" height="${hh}" rx="3" fill="var(--bar-metal)" stroke="rgba(0,0,0,.4)"/>
    <text x="${cx}" y="${50 + hh / 2 + 14}" text-anchor="middle" font-size="13" font-weight="700" fill="var(--text)" font-family="var(--font-num)">${fw(w)}</text>`;
  return `<svg class="viz" viewBox="0 0 300 104">${one(80)}${one(220)}</svg>`;
}
const vizFor = (inv, w) => (inv.kind === 'barbell' ? barbellSVG(inv, w) : inv.kind === 'stack' ? stackSVG(inv, w) : dumbbellSVG(w));
function capFor(inv, w) {
  if (inv.kind === 'barbell') {
    const p = platesPerSide(inv, w);
    return `Гриф ${fw(inv.bar)} кг + на каждую сторону: <b>${p.length ? p.map(fw).join(' + ') : 'ничего'}</b>`;
  }
  if (inv.kind === 'stack') {
    const p = stackParts(inv, w); if (!p) return '';
    return `Штифт в плитку <b>${p.tile}</b> из ${stackTiles(inv).length}${p.add ? ` + <b>${fw(p.add)}</b> ${inv.micro === 'knob' ? 'крутилкой' : 'гирьками'}` : ''}`;
  }
  return `Две гантели по <b>${fw(w)} кг</b>`;
}
const kindIcon = k => (k === 'barbell' ? 'barbell' : k === 'stack' ? 'stack' : 'dumbbell');

/* =========================================================
   state
   ========================================================= */
const KEY = 'gym-rpg-proto', VER = 6;
let state;
const ui = { editRow: null, sel: {}, encSub: null, invDraft: null, flash: null, routeKey: '', justDragged: false };

function freshState(theme) {
  state = { v: VER, theme: theme || 'cyber', started: Date.now(), inv: clone(INV0), items: [], rest: null, seq: 1 };
  ['bench', 'pulldown', 'chest', 'row', 'curl', 'crunch'].forEach(id => state.items.push(makeItem(id)));
  const by = id => state.items.find(x => x.exId === id).uid;
  const DEPS = { chest: ['bench'], row: ['pulldown'], curl: ['row'], crunch: ['chest', 'curl'] };
  state.items.forEach(x => { x.deps = (DEPS[x.exId] || []).map(by); });
  save();
}
function save() { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* прототип */ } }
function load() {
  try { const s = JSON.parse(localStorage.getItem(KEY)); if (s && s.v === VER) { state = s; return; } } catch (e) { /* пусто */ }
  freshState();
}

const invOf = it => state.inv[EX[it.exId].inv];
const newSet = type => ({ id: state.seq++, type, w: null, r: null, done: false });
function makeItem(exId, over = {}) {
  const d = EX[exId];
  const it = {
    uid: 'u' + state.seq++, exId, range: [...d.range], weight: d.weight ?? null,
    calibrating: !!d.calibrating, finished: false, ach: [], sets: [],
    mods: (d.mods || []).map(t => ({ t, done: false, seen: false })),
    ...over,
  };
  const configured = state.inv[d.inv].configured;
  it.mods = it.mods.filter(m => m.t !== 'inventory' || !configured);
  if (!configured && !it.mods.some(m => m.t === 'inventory')) it.mods.unshift({ t: 'inventory', done: false, seen: false });
  it.sets = Array.from({ length: d.sets }, () => newSet('N'));
  regenWarmups(it);
  return it;
}
const workSets = it => it.sets.filter(s => s.type === 'N');
const pendingMods = it => it.mods.filter(m => !m.done && (MOD[m.t].block || !m.seen || (m.t === 'calibration' && it.weight == null)));

/* дерево тренировки: упражнение доступно, когда пройдены все, от которых оно зависит */
const isDone = it => status(it) === 'done';
const lockedBy = it => (it.deps || []).map(findItem).filter(x => x && !isDone(x));
const isOpen = it => !isDone(it) && !lockedBy(it).length;
// очередь встреч перед упражнением: сначала предупреждение о порядке, потом модификаторы
function encQueue(it) {
  const q = pendingMods(it);
  return lockedBy(it).length && !it.orderOk ? [{ t: 'order' }, ...q] : q;
}
const activeMods = it => it.mods.filter(m => !m.done);
function status(it) {
  if (it.sets.length && it.sets.every(s => s.done)) return 'done';
  return it.sets.some(s => s.done) ? 'go' : 'new';
}
const findItem = uid => state.items.find(x => x.uid === uid);

function regenWarmups(it) {
  const inv = invOf(it), move = EX[it.exId].move;
  if (workSets(it).some(s => s.done)) return; // после первого рабочего разминка застывает
  it.sets = it.sets.filter(s => !s.auto);
  if (move === 'core') return;
  const warmedBy = state.items.some(x => x !== it && EX[x.exId].move === move && workSets(x).some(s => s.done));
  if (warmedBy) return; // группа мышц уже размята другим упражнением
  const first = it.sets.find(s => s.type === 'N');
  const base = first ? first.w ?? it.weight : it.weight;
  if (base == null || !inv.configured) return;
  const warm = [];
  for (const [p, r] of [[0.5, 12], [0.85, 6]]) {
    const raw = base * p;
    if (raw < weights(inv)[0] - 1e-6) continue; // не собрать
    const w = roundDown(inv, raw);
    if (w >= base - 1e-6 || warm.some(x => x.wr === w)) continue;
    warm.push({ ...newSet('W'), auto: true, wr: w, rr: r });
  }
  it.sets = [...warm, ...it.sets];
}
const recW = (it, s) => (s.type === 'W' ? s.wr ?? null : it.weight);
function prevFor(it, s) {
  const ls = EX[it.exId].last?.sets; if (!ls) return null;
  const i = it.sets.filter(x => x.type === s.type).indexOf(s);
  return ls.filter(x => x.type === s.type)[i] || null;
}
function targetReps(it, s) {
  if (s.type === 'W') return s.rr ?? 10;
  const [a, b] = it.range, p = prevFor(it, s), w = s.w ?? it.weight;
  if (!p || it.calibrating) return a;
  if (p.w < w - 1e-6) return Math.ceil((a + b) / 2);
  if (p.w > w + 1e-6) return b;
  return clamp(p.r + 1, a, b);
}
const setLabel = (it, s) => (s.type === 'W' ? 'W' : workSets(it).indexOf(s) + 1);

/* strength */
function scoreOf(sets) {
  const ws = sets.filter(s => s.type === 'N' && s.done && s.w != null && s.r);
  return ws.length ? ws.reduce((a, s) => a + e1(s.w, s.r), 0) / ws.length : null;
}
function lastScore(d) {
  if (d.lastCalib) return null;
  const ws = (d.last?.sets || []).filter(s => s.type === 'N');
  return ws.length ? ws.reduce((a, s) => a + e1(s.w, s.r), 0) / ws.length : null;
}
// якорь шкалы: последняя тренировка на том же рабочем весе. Делоад определять не нужно:
// после смены веса якоря просто нет, и шкала начинается с нуля как новый уровень
function anchorScore(it) {
  const d = EX[it.exId];
  const sessions = [...(d.last && !d.lastCalib ? [d.last] : []), ...(d.older || [])];
  for (const ses of sessions) {
    const ws = ses.sets.filter(s => s.type === 'N');
    if (ws.length && ws.every(s => Math.abs(s.w - it.weight) < 1e-6)) return ws.reduce((a, s) => a + e1(s.w, s.r), 0) / ws.length;
  }
  return null;
}

function strength(it) {
  const inv = invOf(it);
  if (it.weight == null || !inv.configured) return null;
  const [a, b] = it.range, w = it.weight;
  return { w, a, b, lo: e1(w, a), hi: e1(w, b), next: nextWeight(inv, w, it.range), prev: anchorScore(it), last: lastScore(EX[it.exId]), now: scoreOf(it.sets) };
}
const spos = (st, v) => (v - st.lo) / (st.hi - st.lo);

function totals() {
  let done = 0, total = 0, vol = 0, exDone = 0;
  for (const it of state.items) {
    for (const s of workSets(it)) { total++; if (s.done) { done++; vol += (s.w || 0) * (s.r || 0); } }
    if (status(it) === 'done') exDone++;
  }
  return { done, total, vol, exDone };
}

/* =========================================================
   MAP
   ========================================================= */
const pic = (it, d = EX[it.exId]) => (d.img ? `<img src="${d.img}" alt="" class="${d.cut ? 'cut' : ''}">` : `<div class="gen">${icon(kindIcon(state.inv[d.inv].kind))}</div>`);

// полоска силы: синим прошлый раз, зелёным прирост сегодня
function strBar(it) {
  const st = it.calibrating ? null : strength(it);
  if (!st) {
    const w = it.weight;
    return `<div class="mini"><span class="num">${w == null ? '?' : fw(w)}</span><div class="mbar striped"></div><span>${it.calibrating ? 'подбор' : '?'}</span></div>`;
  }
  // синим якорь (прошлый раз на этом весе), зелёным прирост сегодня. Без якоря весь сегодняшний результат — прирост
  const p0 = st.prev != null ? clamp(spos(st, st.prev), 0, 1) : 0;
  const p1 = st.now != null ? clamp(spos(st, st.now), 0, 1) : null;
  const blue = p1 == null ? p0 : Math.min(p0, p1);
  const green = p1 != null && p1 > p0 ? p1 - p0 : 0;
  return `<div class="mini"><span class="num">${fw(st.w)}</span><div class="mbar"><i class="old" style="width:${blue * 100}%"></i><i class="gain" style="left:${blue * 100}%;width:${green * 100}%"></i></div><span class="num">${st.next ? fw(st.next) : 'макс'}</span></div>`;
}

function cardHTML(it) {
  const d = EX[it.exId], st = status(it), ws = workSets(it), dn = ws.filter(s => s.done).length;
  const pend = pendingMods(it);
  const state_ = st === 'done' ? 'st-done' : lockedBy(it).length ? 'st-lock' : 'st-open';
  const mods = activeMods(it).map(m => `<span class="mod ${MOD[m.t].tone} ${pend.includes(m) ? 'pending' : ''}" title="${MOD[m.t].name}">${icon(MOD[m.t].icon)}</span>`).join('');
  const cnt = st === 'done' ? `<span class="cnt done">${icon('check')}</span>`
    : lockedBy(it).length ? `<span class="cnt lock">${icon('lock')}</span>`
    : `<span class="cnt ${dn ? 'go' : ''} num">${dn}/${ws.length}</span>`;
  const just = ui.justDone === it.uid ? 'just-done' : (ui.justOpen || []).includes(it.uid) ? 'just-open' : '';
  return `<div class="lvl ${state_} ${just}" data-uid="${it.uid}">
    <div class="card panel" data-act="open" data-uid="${it.uid}">
      <div class="cname">${d.name}</div>
      ${cnt}
      <div class="portrait"><div class="pic">${pic(it)}</div></div>
      <div class="cbody">
        <div class="cspec"><span class="num"><b>${ws.length} × ${rng(it.range)}</b> @ <b>${fw(it.weight)}</b> кг</span>${mods}</div>
        ${strBar(it)}
      </div>
    </div>
  </div>`;
}

function renderMap() {
  const t = totals();
  const segs = state.items.map(it => workSets(it).map(s => `<i class="${s.done ? 'on' : ''}"></i>`).join('')).join('<i class="warm-gap"></i>');
  return `
  <header class="top">
    <div class="toprow">
      <button class="iconbtn" data-act="exit" aria-label="Назад">${icon('back')}</button>
      <div class="ttl"><div class="kick">Тренировка</div><div class="h t1">Верх тела · А</div></div>
      <button class="iconbtn" data-act="menu" aria-label="Меню">${icon('dots')}</button>
    </div>
    <div class="xp">
      <div class="xpl"><span>Рабочие подходы</span><b class="num">${t.done} / ${t.total}</b></div>
      <div class="xpbar">${segs}</div>
    </div>
    <div class="stats">
      <div class="stat"><small>Время</small><b class="num" data-clock>${clock((Date.now() - state.started) / 1000)}</b></div>
      <div class="stat"><small>Объём</small><b class="num">${thin(t.vol)} кг</b></div>
      <div class="stat"><small>Упражнения</small><b class="num">${t.exDone} / ${state.items.length}</b></div>
    </div>
  </header>
  <div class="track" id="track">
    ${state.items.map(cardHTML).join('')}
    <div class="add-lvl"><button class="btn btn-ghost" data-act="add-ex">${icon('plus')} Добавить упражнение</button></div>
    <p class="dnd-hint">Зажми карточку и перетащи, чтобы поменять порядок</p>
  </div>`;
}

/* drag & drop: долгий тап, потом тащим */
function setupDnD(list) {
  if (!list) return;
  let timer = null, drag = null, sx = 0, sy = 0, raf = 0;
  const GAP = 12;
  const begin = (lvl, y) => {
    timer = null;
    const items = $$('.lvl', list);
    drag = { lvl, items, rects: items.map(el => el.getBoundingClientRect()), from: items.indexOf(lvl), to: items.indexOf(lvl), y0: y, y, sc0: scrollY };
    lvl.classList.add('lifted'); list.classList.add('dragging');
    navigator.vibrate?.(15);
    loop();
  };
  const update = () => {
    const dy = drag.y - drag.y0 + (scrollY - drag.sc0);
    drag.lvl.style.transform = `translateY(${dy}px) scale(1.02)`;
    const r = drag.rects[drag.from], center = r.top + r.height / 2 + dy;
    const to = drag.rects.filter((rr, i) => i !== drag.from && rr.top + rr.height / 2 < center).length;
    const h = r.height + GAP;
    drag.items.forEach((el, i) => {
      if (i === drag.from) return;
      let off = 0;
      if (drag.from < to && i > drag.from && i <= to) off = -h;
      if (drag.from > to && i < drag.from && i >= to) off = h;
      el.style.transform = off ? `translateY(${off}px)` : '';
    });
    drag.to = to;
  };
  const loop = () => {
    if (!drag) return;
    if (drag.y < 80) scrollBy(0, -7); else if (drag.y > innerHeight - 80) scrollBy(0, 7);
    update();
    raf = requestAnimationFrame(loop);
  };
  const down = (x, y, target) => {
    const lvl = target.closest('.lvl'); if (!lvl) return;
    sx = x; sy = y; timer = setTimeout(() => begin(lvl, y), 420);
  };
  const move = (x, y, e) => {
    if (timer) { if (Math.abs(y - sy) > 8 || Math.abs(x - sx) > 8) { clearTimeout(timer); timer = null; } return; }
    if (!drag) return;
    if (e.cancelable) e.preventDefault();
    drag.y = y;
  };
  const up = () => {
    if (timer) { clearTimeout(timer); timer = null; }
    if (!drag) return;
    cancelAnimationFrame(raf);
    const { from, to } = drag; drag = null;
    ui.justDragged = true; setTimeout(() => { ui.justDragged = false; }, 350);
    if (from !== to) { const [m] = state.items.splice(from, 1); state.items.splice(to, 0, m); save(); }
    render();
  };
  list.addEventListener('touchstart', e => down(e.touches[0].clientX, e.touches[0].clientY, e.target), { passive: true });
  list.addEventListener('touchmove', e => move(e.touches[0].clientX, e.touches[0].clientY, e), { passive: false });
  list.addEventListener('touchend', up);
  list.addEventListener('touchcancel', up);
  list.addEventListener('mousedown', e => { if (e.button === 0 && !('ontouchstart' in window)) down(e.clientX, e.clientY, e.target); });
  list.addEventListener('contextmenu', e => e.preventDefault());
  window.onmousemove = e => move(e.clientX, e.clientY, e);
  window.onmouseup = () => up();
}

/* =========================================================
   EXERCISE
   ========================================================= */
function strPanel(it) {
  if (it.calibrating) {
    return `<div class="str panel">
      <div class="str-head"><span class="kick">Сила</span><span class="sub">появится после подбора веса</span><button class="q" data-act="str-info">?</button></div>
      <div class="sbar striped"></div>
      <p class="hint">Пока ищем рабочий вес, силу не считаю: вес скачет, цифры будут врать.</p>
    </div>`;
  }
  const st = strength(it); if (!st) return '';
  const ws = workSets(it);
  const pf = st.now != null ? clamp(spos(st, st.now), 0, 1) : 0;
  const pp = st.prev != null ? spos(st, st.prev) : null;
  const v = st.now ?? st.prev;
  let dl = '';
  if (st.now != null && st.prev != null) { const x = st.now - st.prev; dl = `<span class="delta ${x < 0 ? 'neg' : ''}">${x >= 0 ? '+' : ''}${f1(x)}</span>`; }
  let hint;
  if (!st.next) hint = 'Это потолок тренажёра. Дальше растём только повторами.';
  else if (st.now != null && pf >= 1 && ws.every(s => s.done)) hint = `<b>Правый край взят!</b> В следующий раз берём <b>${fw(st.next)} кг</b>.`;
  else if (st.now != null && pf >= 1) hint = `Пока все подходы на максимуме. Удержи до конца, и в следующий раз будет <b>${fw(st.next)} кг</b>.`;
  else {
    const top = ws.filter(s => s.done && s.r >= st.b).length;
    hint = `Сделай <b>${st.b} повторов</b> во всех подходах, и откроется <b>${fw(st.next)} кг</b>.` + (ws.some(s => s.done) ? ` Верх взяли <b>${top} из ${ws.length}</b>.` : '');
  }
  return `<div class="str panel">
    <div class="str-head"><span class="kick">Сила</span><b class="val num">${v != null ? f1(v) : '·'}</b><span class="sub">${st.now != null ? 'сегодня' : st.prev != null ? 'в прошлый раз' : ''}</span>${dl}<button class="q" data-act="str-info" aria-label="Что это">?</button></div>
    <div class="sbar"><div class="fill ${pf >= 1 ? 'full' : ''}" style="width:${pf * 100}%"></div>${pp != null ? `<div class="tick" style="left:${clamp(pp, 0, 1) * 100}%"></div>` : ''}</div>
    <div class="sedges"><div><small>${fw(st.w)} кг</small><br><b class="num">${f1(st.lo)}</b></div><div class="r"><small>${st.next ? `→ ${fw(st.next)} кг` : 'потолок'}</small><br><b class="num">${f1(st.hi)}</b></div></div>
    ${pp != null ? `<div class="legend"><span><i></i>прошлый раз</span><span><i class="now"></i>сегодня</span></div>` : ''}
    <p class="hint">${hint}</p>
  </div>`;
}

function rowHTML(it, s) {
  const isW = s.type === 'W';
  if (ui.editRow === s.id) {
    return `<div class="srow edit" data-sid="${s.id}">
      <button class="act ${isW ? 'on' : ''}" data-act="set-type" data-v="W"><b>W</b> Разминка</button>
      <button class="act ${!isW ? 'on' : ''}" data-act="set-type" data-v="N"><b>#</b> Рабочий</button>
      <button class="act del" data-act="set-del">${icon('trash')} Удалить</button>
      <button class="act" data-act="edit-close" aria-label="Закрыть">${icon('close')}</button>
    </div>`;
  }
  const p = prevFor(it, s), w = s.w ?? recW(it, s);
  const rTxt = s.r != null ? s.r : isW ? s.rr ?? '·' : rng(it.range);
  return `<div class="srow ${isW ? 'warm' : ''} ${s.done ? 'done' : ''} ${ui.flash === s.id ? 'flash' : ''}" data-sid="${s.id}">
    <button class="c-type num" data-act="type">${setLabel(it, s)}</button>
    <div class="c-prev num">${p ? `${fw(p.w)} × ${p.r}` : '–'}</div>
    <button class="cell num ${s.w == null ? 'rec' : ''}" data-act="w">${w == null ? '·' : fw(w)}</button>
    <button class="cell num ${s.r == null ? 'rec' : ''}" data-act="r">${rTxt}</button>
    <button class="c-chk" data-act="chk" aria-label="Готово">${icon('check')}</button>
  </div>`;
}

function renderEx(it) {
  const d = EX[it.exId], ws = workSets(it);
  const left = it.sets.filter(s => !s.done).length;
  const mods = activeMods(it).map(m => `<span class="mod ${MOD[m.t].tone}" data-act="mod-info" data-t="${m.t}">${icon(MOD[m.t].icon)}</span>`).join('');
  return `
  <div class="hero">
    ${d.img ? `<img src="${d.img}" alt="" class="${d.cut ? 'cut' : ''}">` : `<div class="gen">${icon(kindIcon(invOf(it).kind))}</div>`}
    <div class="scan"></div>
    <div class="hero-bar">
      <button class="back-pill" data-act="to-map">${icon('back')} Карта</button>
      <button class="iconbtn" data-act="ex-menu" aria-label="Меню">${icon('dots')}</button>
    </div>
  </div>
  <div class="ex-head">
    <h1 class="h ex-name">${d.name}</h1>
    <div class="ex-meta"><span class="num"><b>${ws.length} × ${rng(it.range)}</b> @ <b>${fw(it.weight)}</b> кг</span><span>· отдых ${clock(d.rest)}</span>${mods}</div>
  </div>
  ${it.calibrating ? `<div class="calib-note">${icon('target')}<span>Подбираем вес. После каждого рабочего подхода спрошу, как он прошёл.</span></div>` : ''}
  ${strPanel(it)}
  <div class="sets">
    <div class="shead">
      <span><span class="lng">Подход</span><span class="sht">Подх.</span></span>
      <span><span class="lng">Предыдущее</span><span class="sht">Пред.</span></span>
      <span>KG</span>
      <span><span class="lng">Повторы</span><span class="sht">Повт.</span></span>
      <span>${icon('check')}</span>
    </div>
    ${it.sets.map(s => rowHTML(it, s)).join('')}
  </div>
  <div class="ex-actions">
    <button class="btn btn-ghost" data-act="add-set">${icon('plus')} Добавить подход</button>
    <button class="btn btn-main" data-act="finish" ${left ? 'disabled' : ''}>${left ? `Осталось подходов: ${left}` : 'Завершить упражнение'}</button>
  </div>`;
}

/* =========================================================
   ENCOUNTERS
   ========================================================= */
const repsPills = (sets, [a, b]) =>
  `<div class="pills"><span>Прошлый раз</span>${sets.map(s => `<b class="num ${s.r < a ? 'low' : s.r >= b ? 'max' : ''}">${s.r}</b>`).join('')}<span>цель ${a}–${b}</span></div>`;

const calibThree = () => `<div class="three">
  <div class="t-good">${icon('up')}<b>Легко</b><small>тяжелее</small></div>
  <div class="t-info">${icon('check')}<b>Норм</b><small>вес найден</small></div>
  <div class="t-bad">${icon('down')}<b>Тяжело</b><small>легче</small></div></div>`;

function encDef(it, m) {
  const d = EX[it.exId], inv = invOf(it), [a, b] = it.range;
  const lastW = (d.last?.sets || []).filter(s => s.type === 'N');
  const lw = lastW[0]?.w;
  const custom = value => {
    openWeightSheet({ title: 'Вес на сегодня', inv, uid: it.uid, value, commitOnClose: false, noReset: true, onCommit: v => { it.weight = v; m.done = true; m.seen = true; afterEnc(it); } });
    return 'wait';
  };

  switch (m.t) {
    case 'inventory': {
      const stack = inv.kind === 'stack';
      return {
        title: stack ? 'Какие плитки в стеке?' : 'Что есть в зале?',
        text: 'Тренажёр для меня новый. Опиши его один раз, и я буду предлагать только те веса, которые можно собрать.',
        choices: [
          { id: 'setup', icon: 'wrench', tone: 't-info', title: 'Настроить', text: stack ? 'Три цифры с таблички, минута' : 'Гриф и блины, минута', rec: true },
          { id: 'typical', icon: 'stack', tone: 't-gold', title: stack ? 'Обычный стек' : 'Обычный набор', text: stack ? '5–100 кг, шаг 5. Поправлю потом' : 'Поправлю потом' },
        ],
        apply(c) {
          if (c === 'setup') { go(`#/inv/${it.uid}/enc`); return 'nav'; }
          state.inv[d.inv] = mkInv({ kind: inv.kind });
          invConfigured(d.inv);
        },
      };
    }
    case 'order': {
      const need = lockedBy(it), open = state.items.filter(isOpen);
      return {
        title: `Сначала ${need.map(x => EX[x.exId].name.toLowerCase()).join(' и ')}`,
        text: 'Если сделать это раньше, мышцы придут уставшими, и веса с повторами разойдутся с прошлым разом.',
        choices: [
          { id: 'back', icon: 'map', tone: 't-info', title: 'Вернуться к карте', text: open.length ? `Сейчас можно: ${open.map(x => EX[x.exId].name).join(', ')}` : 'Выбрать другое', rec: true },
          { id: 'go', icon: 'right', tone: 't-dim', title: 'Всё равно начать', text: 'Например, нужный тренажёр занят' },
        ],
        apply(c) { if (c === 'back') { go('#/'); return 'nav'; } },
      };
    }
    case 'upgrade': {
      const choices = (d.alts || []).map(al => ({ id: 'alt:' + al.ex, picHTML: pic(null, EX[al.ex]), tone: 't-gold', title: EX[al.ex].name, text: al.short, rec: al === d.alts[0] }));
      choices.push({ id: 'range', icon: 'repeat', tone: 't-info', title: `Остаться, ${b + 1}–${b + 4} повторов`, text: 'Тот же вес, больше повторов' });
      return {
        title: 'Тренажёр пройден',
        text: `${fw(lw)} кг, это весь стек. Прибавлять больше нечего.`,
        info: repsPills(lastW, it.range),
        choices,
        apply(c) {
          if (c === 'range') { it.range = [b + 1, b + 4]; return; }
          const ex = c.slice(4), over = {};
          if (ex === 'incline') {
            const bench = state.items.find(x => x.exId === 'bench');
            over.weight = roundDown(state.inv.gymBar, (bench?.weight ?? 80) * 0.75);
            over.mods = [{ t: 'calibration', done: false, seen: false }];
          }
          replaceItem(it, ex, over);
          return 'nav';
        },
      };
    }
    case 'deload': {
      const dw = stepDown(inv, lw);
      return {
        title: `Снизим до ${fw(dw)} кг`,
        text: `В прошлый раз на ${fw(lw)} кг не хватило повторов. Наберёшь их на меньшем весе и пойдёшь вверх.`,
        info: repsPills(lastW, it.range),
        choices: [
          { id: 'down', icon: 'down', tone: 't-violet', title: `${fw(dw)} кг`, text: 'Шаг назад, чтобы снова расти', rec: true },
          { id: 'keep', icon: 'shield', tone: 't-gold', title: `Оставить ${fw(lw)} кг`, text: 'Ещё одна попытка' },
          { id: 'custom', icon: 'pencil', tone: 't-info', title: 'Свой вес', text: 'Выберу сам' },
        ],
        apply(c) {
          if (c === 'down') { it.weight = dw; return; }
          if (c === 'keep') { it.weight = lw; return; }
          return custom(dw);
        },
      };
    }
    case 'newWeight': {
      const nw = nextWeight(inv, lw, it.range) ?? lw;
      return {
        title: `Пора прибавить: ${fw(nw)} кг`,
        text: 'В прошлый раз все подходы на максимум. Ты стал сильнее.',
        info: repsPills(lastW, it.range),
        choices: [
          { id: 'up', icon: 'up', tone: 't-good', title: `${fw(nw)} кг`, text: `Хватит сил на ${a}+ повторов`, rec: true },
          { id: 'stay', icon: 'shield', tone: 't-gold', title: `Остаться на ${fw(lw)} кг`, text: 'Если сегодня не в форме' },
          { id: 'custom', icon: 'pencil', tone: 't-info', title: 'Свой вес', text: 'Выберу сам' },
        ],
        apply(c) {
          if (c === 'up') { it.weight = nw; return; }
          if (c === 'stay') { it.weight = lw; return; }
          return custom(nw);
        },
      };
    }
    case 'calibration': {
      const w = it.weight;
      if (w == null) {
        const mw = weights(inv)[0];
        const choices = [
          { id: 'min', icon: 'target', tone: 't-good', title: `С ${fw(mw)} кг`, text: 'Самый лёгкий вес, дальше подберём', rec: true },
          { id: 'enter', icon: 'pencil', tone: 't-info', title: 'Знаю свой вес', text: 'Введу сам' },
        ];
        if (d.alts) choices.push({ id: 'replace', icon: 'swap', tone: 't-gold', title: 'Заменить', text: 'Не уверен в этом упражнении' });
        return {
          title: 'С какого веса начнём?',
          text: 'Это упражнение новое для тебя. Начнём с лёгкого и после каждого подхода поправим вес.',
          info: calibThree(),
          choices,
          apply(c) {
            if (c === 'replace') { ui.encSub = 'replace'; return 'stay'; }
            if (c === 'min') { it.weight = mw; return; }
            const ws = weights(inv);
            openWeightSheet({ title: 'Твой стартовый вес', inv, uid: it.uid, value: ws[Math.floor(ws.length * 0.3)], commitOnClose: false, noReset: true, onCommit: v => { it.weight = v; m.seen = true; afterEnc(it); } });
            return 'wait';
          },
        };
      }
      const why = d.lastCalib ? 'В прошлый раз вес ещё не нашли.' : d.last ? 'Давно не делал, сила могла измениться.' : 'Вес посчитан примерно.';
      const choices = [{ id: 'go', icon: 'target', tone: 't-info', title: 'Понятно', text: `Начинаем с ${fw(w)} кг`, rec: true }];
      choices.push({ id: 'known', icon: 'check', tone: 't-good', title: `Мой вес ${fw(w)} кг`, text: 'Подбор не нужен' });
      return {
        title: 'Подбираем вес',
        text: `${why} После каждого подхода спрошу, как он прошёл, и поправлю вес.`,
        info: calibThree(),
        choices,
        apply(c) { if (c === 'known') { it.calibrating = false; m.done = true; } },
      };
    }
  }
  return null;
}

function replaceDef(it) {
  const d = EX[it.exId];
  return {
    title: 'На что заменим?',
    text: 'Те же мышцы, вес я уже знаю.',
    choices: d.alts.map(al => {
      const x = EX[al.ex];
      return { id: 'alt:' + al.ex, picHTML: pic(null, x), tone: 't-gold', title: x.name, text: `${x.sets} × ${rng(x.range)} @ ${fw(x.weight)} кг` };
    }),
    apply(c) { replaceItem(it, c.slice(4), {}); return 'nav'; },
  };
}

function replaceItem(it, exId, over) {
  const idx = state.items.indexOf(it);
  const ni = makeItem(exId, { ...over, deps: it.deps, orderOk: it.orderOk });
  state.items[idx] = ni;
  state.items.forEach(x => { x.deps = (x.deps || []).map(u => (u === it.uid ? ni.uid : u)); });
  ui.encSub = null;
  save();
  go(encQueue(ni).length ? `#/enc/${ni.uid}` : `#/ex/${ni.uid}`);
}

function invConfigured(key) {
  state.inv[key].configured = true;
  state.items.forEach(x => {
    if (EX[x.exId].inv !== key) return;
    x.mods.forEach(m => { if (m.t === 'inventory') { m.done = true; m.seen = true; } });
    if (x.weight != null) x.weight = roundNear(state.inv[key], x.weight);
    regenWarmups(x);
  });
  save();
}

function afterEnc(it) {
  regenWarmups(it);
  save();
  ui.sel = {};
  if (!encQueue(it).length) go(`#/ex/${it.uid}`);
  else if (parse().page === 'enc') { render(); scrollTo(0, 0); }
  else go(`#/enc/${it.uid}`);
}

function choiceHTML(c, sel) {
  const emb = c.picHTML ? `<div class="pic">${c.picHTML}</div>` : frame() + icon(c.icon);
  return `<button class="choice panel ${c.tone || ''} ${c.rec ? 'rec' : ''} ${sel ? 'sel' : ''}" data-act="enc-pick" data-c="${c.id}">
    <div class="cemb">${emb}</div>
    <div class="ctext"><div class="ctitle">${c.title}</div><div class="cdesc">${c.text}</div></div>
    ${c.rec ? '<span class="recb">совет</span>' : ''}
  </button>`;
}

function renderEnc(it) {
  const pend = encQueue(it);
  if (!pend.length) { location.replace(`#/ex/${it.uid}`); return ''; }
  const m = pend[0], meta = MOD[m.t], d = EX[it.exId];
  const def = ui.encSub === 'replace' ? replaceDef(it) : encDef(it, m);
  const all = m.t === 'order' ? [m, ...it.mods] : it.mods;
  const steps = all.length > 1 ? `<div class="steps">${all.map(x => `<i class="${x === m ? 'on' : x.done || x.seen ? 'done' : ''}"></i>`).join('')}</div>` : '';
  return `<div class="enc ${meta.tone}">
    <div class="enc-top">
      <button class="iconbtn" data-act="${ui.encSub ? 'enc-sub-back' : 'to-map'}" aria-label="Назад">${icon('back')}</button>
      <div class="who"><div class="pic">${pic(it)}</div><span>${d.name}</span></div>
      ${steps}
    </div>
    <div class="enc-hero">
      <div class="emblem">${frame()}${icon(ui.encSub ? 'swap' : meta.icon)}</div>
      <div><div class="kick">${meta.name}</div><h1 class="h enc-title">${def.title}</h1></div>
    </div>
    <p class="enc-text">${def.text}</p>
    ${def.info ? `<div class="enc-info">${def.info}</div>` : ''}
    <div class="choices">${def.choices.map(c => choiceHTML(c, false)).join('')}</div>
  </div>`;
}

function encGo(it, cid) {
  const m = encQueue(it)[0]; if (!m) return;
  const def = ui.encSub === 'replace' ? replaceDef(it) : encDef(it, m);
  const res = def.apply(cid);
  if (res === 'nav' || res === 'wait') return;
  if (res === 'stay') { render(); scrollTo(0, 0); return; }
  if (m.t === 'order') { it.orderOk = true; afterEnc(it); return; }
  if (MOD[m.t].block) m.done = true;
  m.seen = true;
  afterEnc(it);
}

/* =========================================================
   INVENTORY
   ========================================================= */
const BAR_NAME = { 20: 'олимпийский, длинный', 15: 'женский, чуть короче', 10: 'короткий или изогнутый' };
const STEP_OPTS = [1, 1.25, 2, 2.5, 3, 4, 4.5, 5, 6, 7, 7.5, 10];

function renderInv(it, fromEnc) {
  const d = EX[it.exId], key = d.inv;
  if (!ui.invDraft || ui.invDraft.key !== key) ui.invDraft = { key, inv: mkInv(clone(state.inv[key])), pv: null };
  const inv = ui.invDraft.inv;
  let body = '';
  if (inv.kind === 'barbell') {
    body = `<div class="sec"><div class="sec-h"><span class="h">Гриф</span><small>выбери один</small></div>
      <div class="bars">${[20, 15, 10].map(b => `<button class="barpick panel ${inv.bar === b ? 'on' : ''}" data-act="inv-bar" data-v="${b}">${barOnlySVG(b)}<div><b class="num">${b} кг</b><small>${BAR_NAME[b]}</small></div></button>`).join('')}</div></div>
      <div class="sec"><div class="sec-h"><span class="h">Блины</span><small>отметь, какие есть</small></div>
      <p class="sec-p">Считаю, что каждого блина хватит на пару, по одному на сторону.</p>
      <div class="plates panel">${[20, 10, 5, 2.5, 1.25].map(p => {
        const on = inv.plates.includes(p), st = PS[p];
        return `<button class="plate ${on ? 'on' : 'off'}" data-act="inv-plate" data-v="${p}"><div class="disc" style="width:${st.d}px;height:${st.d}px;background:${st.c};color:${st.ink}"><span>${p}</span></div><span class="tg">${on ? icon('check') : ''}</span></button>`;
      }).join('')}</div></div>`;
  } else if (inv.kind === 'stack') {
    const stp = (label, k, val) => `<div class="stp"><label>${label}</label><div class="row"><button data-act="inv-num" data-k="${k}" data-d="-1">${icon('minus')}</button><b class="num">${fw(val)} кг</b><button data-act="inv-num" data-k="${k}" data-d="1">${icon('plus')}</button></div></div>`;
    body = `<div class="sec"><div class="sec-h"><span class="h">Стек плиток</span><small>смотри на табличку сбоку</small></div>
      <div class="stack-ed"><div class="panel" style="padding:10px 4px">${stackSVG(inv, null, { annot: true })}</div>
      <div class="steppers">${stp('Верхняя плитка', 'first', inv.first)}${stp('Шаг между плитками', 'step', inv.step)}${stp('Нижняя плитка', 'last', inv.last)}</div></div></div>
      <div class="sec"><div class="sec-h"><span class="h">Точная настройка</span></div>
      <p class="sec-p">У некоторых тренажёров сбоку есть крутилка или маленькие гирьки. Они добавляют вес между плитками.</p>
      <div class="opts">
        <button class="opt ${inv.micro === 'none' ? 'on' : ''}" data-act="inv-micro" data-v="none">Нет<small>только плитки</small></button>
        <button class="opt ${inv.micro === 'knob' ? 'on' : ''}" data-act="inv-micro" data-v="knob">Крутилка<small>+ полплитки</small></button>
        <button class="opt ${inv.micro === 'pegs' ? 'on' : ''}" data-act="inv-micro" data-v="pegs">Гирьки<small>на штырьке</small></button>
      </div>
      ${inv.micro === 'knob' ? `<div class="pegs">${[1.25, 2.5].map(v => `<button class="opt ${inv.knob === v ? 'on' : ''}" data-act="inv-knob" data-v="${v}">+${v} кг</button>`).join('')}</div>` : ''}
      ${inv.micro === 'pegs' ? `<div class="pegs">${[1.25, 2.5].map(v => `<button class="opt ${inv.pegs.includes(v) ? 'on' : ''}" data-act="inv-peg" data-v="${v}">${v} кг</button>`).join('')}</div>` : ''}
      </div>`;
  } else {
    const stp = (label, k, val) => `<div class="stp"><label>${label}</label><div class="row"><button data-act="inv-num" data-k="${k}" data-d="-1">${icon('minus')}</button><b class="num">${fw(val)} кг</b><button data-act="inv-num" data-k="${k}" data-d="1">${icon('plus')}</button></div></div>`;
    body = `<div class="sec"><div class="sec-h"><span class="h">Гантельный ряд</span></div><div class="steppers">${stp('Самая лёгкая', 'dmin', inv.dmin)}${stp('Самая тяжёлая', 'dmax', inv.dmax)}${stp('Шаг', 'dstep', inv.dstep)}</div></div>`;
  }
  const ws = weights(inv), stepv = minStep(inv);
  if (ui.invDraft.pv == null || ui.invDraft.pv >= ws.length) ui.invDraft.pv = Math.min(ws.length - 1, Math.round(ws.length * (inv.kind === 'barbell' ? 0.15 : 0.5)));
  const pvw = ws[ui.invDraft.pv];
  const rangeTxt = inv.kind === 'barbell'
    ? `Можно собрать от <b>${fw(ws[0])} кг</b> и дальше с шагом <b>${fw(stepv)} кг</b>`
    : `Можно собрать <b>${ws.length}</b> весов: от <b>${fw(ws[0])}</b> до <b>${fw(ws[ws.length - 1])} кг</b>, шаг от <b>${fw(stepv)} кг</b>`;
  const i200 = ws.findIndex(x => x >= 200);
  const max = inv.kind === 'barbell' && i200 > 0 ? i200 : ws.length - 1;
  return `<div class="inv">
    <div class="inv-head"><button class="iconbtn" data-act="inv-back" aria-label="Назад">${icon('back')}</button><div><div class="h t1">Мой инвентарь</div><small>${d.name}</small></div></div>
    <div class="tabs">${['barbell', 'stack', 'dumbbells'].map(k => `<button class="tab ${inv.kind === k ? 'on' : ''}" data-act="inv-kind" data-v="${k}">${icon(kindIcon(k))}${k === 'barbell' ? 'Штанга' : k === 'stack' ? 'Блочный' : 'Гантели'}</button>`).join('')}</div>
    ${body}
    <div class="result panel">
      <div class="big">${rangeTxt}</div>
      <input type="range" min="0" max="${max}" value="${Math.min(ui.invDraft.pv, max)}" data-inp="inv-pv" aria-label="Проверить вес">
      <div class="pv"><small class="muted">Двигай, чтобы проверить</small><b class="num" id="inv-pv-w">${fw(pvw)} кг</b></div>
      <div id="inv-pv-viz">${vizFor(inv, pvw)}</div>
      <div class="viz-cap" id="inv-pv-cap">${capFor(inv, pvw)}</div>
    </div>
    <div class="cta"><button class="btn btn-main" data-act="inv-save" data-enc="${fromEnc ? 1 : 0}">Сохранить</button></div>
  </div>`;
}

function invNum(inv, k, dir) {
  if (k === 'step' || k === 'dstep') {
    const i = STEP_OPTS.findIndex(x => x >= inv[k] - 1e-6);
    inv[k] = STEP_OPTS[clamp((i < 0 ? STEP_OPTS.length - 1 : i) + dir, 0, STEP_OPTS.length - 1)];
  } else if (k === 'first') inv.first = clamp(r2(inv.first + dir * 1.25), 1.25, 50);
  else if (k === 'last') inv.last = r2(inv.last + dir * inv.step);
  else if (k === 'dmin') inv.dmin = clamp(r2(inv.dmin + dir), 0.5, inv.dmax - inv.dstep);
  else if (k === 'dmax') inv.dmax = clamp(r2(inv.dmax + dir * inv.dstep), inv.dmin + inv.dstep, 80);
  if (inv.kind === 'stack') {
    const n = Math.max(1, Math.round((inv.last - inv.first) / inv.step));
    inv.last = clamp(r2(inv.first + n * inv.step), r2(inv.first + inv.step), 300);
  }
}

/* =========================================================
   SHEETS
   ========================================================= */
function openSheet(renderFn, opts = {}) {
  closeSheet(true);
  ui.sheet = { renderFn, onClose: opts.onClose };
  const root = $('#sheet');
  root.innerHTML = `<div class="backdrop" data-act="sheet-close"></div><div class="sheet"></div>`;
  refreshSheet();
  root.classList.add('open');
  requestAnimationFrame(() => requestAnimationFrame(() => root.classList.add('show')));
}
function refreshSheet() {
  const sh = $('#sheet .sheet');
  if (sh && ui.sheet) sh.innerHTML = '<div class="grab"></div>' + ui.sheet.renderFn();
}
function closeSheet(silent) {
  const root = $('#sheet');
  if (!ui.sheet) return;
  const cb = ui.sheet.onClose; ui.sheet = null;
  root.classList.remove('show');
  const el = root.innerHTML;
  setTimeout(() => { if (!ui.sheet && root.innerHTML === el) { root.innerHTML = ''; root.classList.remove('open'); } }, 220);
  root.classList.remove('open');
  if (!silent && cb) cb();
}

/* weight */
function openWeightSheet(o) {
  ui.ws = { ...o, value: o.value ?? weights(o.inv)[0] };
  openSheet(() => {
    const w = ui.ws.value, inv = ui.ws.inv;
    return `<div class="sh-title"><b>${o.title}</b></div>
      <div class="bigrow">
        <button class="pm" data-act="ws-dec" aria-label="Меньше">${icon('minus')}</button>
        <div class="bignum-w"><input class="bignum" id="ws-in" inputmode="decimal" value="${fw(w)}"><small>кг</small></div>
        <button class="pm" data-act="ws-inc" aria-label="Больше">${icon('plus')}</button>
      </div>
      <div class="sh-viz">${vizFor(inv, w)}<div class="viz-cap">${capFor(inv, w)}</div></div>
      <div class="sh-row">
        <button class="btn btn-soft" data-act="ws-inv">${icon('sliders')} Мой инвентарь</button>
        ${o.noReset ? '<span></span>' : `<button class="btn btn-soft" data-act="ws-reset">${icon('reset')} Сбросить</button>`}
      </div>
      <button class="btn btn-main sh-main" data-act="ws-done">Готово</button>`;
  }, { onClose: () => { if (o.commitOnClose !== false) o.onCommit(ui.ws.value); } });
}
function openSetWeight(it, s) {
  const inv = invOf(it);
  openWeightSheet({
    title: s.type === 'W' ? 'Разминка · вес' : `Подход ${setLabel(it, s)} · вес`, inv, uid: it.uid,
    value: s.w ?? recW(it, s) ?? weights(inv)[0],
    onCommit: v => {
      const changed = s.w !== v;
      s.w = v; s.auto = false;
      if (s.type === 'N' && !s.done && changed) it.weight = v;
      regenWarmups(it); save(); render();
    },
    onReset: () => { s.w = null; regenWarmups(it); save(); render(); },
  });
}

/* reps */
function openRepsSheet(it, s) {
  ui.rs = { it, s, value: s.r ?? targetReps(it, s), edit: false, a: it.range[0], b: it.range[1] };
  openSheet(() => {
    const r = ui.rs, [a, b] = [r.a, r.b];
    const lo = Math.max(1, Math.min(a, r.value) - 3), hi = Math.max(b, r.value) + 2;
    const quick = Array.from({ length: hi - lo + 1 }, (_, i) => lo + i)
      .map(n => `<button class="${n === r.value ? 'on' : n >= a && n <= b && s.type === 'N' ? 'in' : ''}" data-act="rs-q" data-v="${n}">${n}</button>`).join('');
    const stp = (label, k) => `<div class="stp"><label>${label}</label><div class="row"><button data-act="rs-ra" data-k="${k}" data-d="-1">${icon('minus')}</button><b class="num">${r[k]}</b><button data-act="rs-ra" data-k="${k}" data-d="1">${icon('plus')}</button></div></div>`;
    return `<div class="sh-title"><b>${s.type === 'W' ? 'Разминка' : `Подход ${setLabel(it, s)}`} · повторы</b>${s.type === 'N' ? ` · цель ${a}–${b}` : ''}</div>
      <div class="bigrow">
        <button class="pm" data-act="rs-dec" aria-label="Меньше">${icon('minus')}</button>
        <div class="bignum-w"><input class="bignum" id="rs-in" inputmode="numeric" value="${r.value}"><small>повторов</small></div>
        <button class="pm" data-act="rs-inc" aria-label="Больше">${icon('plus')}</button>
      </div>
      <div class="quick">${quick}</div>
      ${r.edit ? `<div class="range-ed panel">${stp('Диапазон: от', 'a')}${stp('до', 'b')}</div>` : ''}
      <div class="sh-row">
        <button class="btn btn-soft" data-act="rs-range">${icon('sliders')} Диапазон ${a}–${b}</button>
        <button class="btn btn-soft" data-act="rs-reset">${icon('reset')} Сбросить</button>
      </div>
      <button class="btn btn-main sh-main" data-act="rs-done">Готово</button>`;
  }, {
    onClose: () => {
      const r = ui.rs; r.s.r = r.value; r.s.auto = false;
      if (r.a !== it.range[0] || r.b !== it.range[1]) it.range = [r.a, r.b];
      save(); render();
    },
  });
}

/* feel (калибровка) */
function openFeel(it, s) {
  const inv = invOf(it), w = s.w;
  let up = roundNear(inv, Math.min(w * 1.25, w + 20)); if (up <= w) up = stepUp(inv, w);
  let dn = roundNear(inv, w * 0.85); if (dn >= w) dn = stepDown(inv, w);
  ui.feel = { it, s, up, dn };
  const ch = (c) => choiceHTML(c, false).replace('enc-pick', 'feel');
  $('#modal').innerHTML = `<div class="feel-win panel">
    <div class="kick" style="text-align:center;color:var(--info)">Подбор веса</div>
    <h2 class="h">Как прошёл подход?</h2>
    <p class="sub num">${fw(w)} кг × ${s.r}</p>
    <div class="choices">
      ${ch({ id: 'easy', icon: 'up', tone: 't-good', title: 'Легко', text: `Дальше ${fw(up)} кг` })}
      ${ch({ id: 'ok', icon: 'check', tone: 't-info', title: 'Нормально', text: `Мой вес, оставляем ${fw(w)} кг` })}
      ${ch({ id: 'hard', icon: 'down', tone: 't-bad', title: 'Тяжело', text: dn < w ? `Дальше ${fw(dn)} кг` : `Это минимум, легче некуда` })}
    </div>
    <button class="skip" data-act="feel-skip">Пропустить, вес не менять</button>
  </div>`;
  $('#modal').classList.add('on');
}
function applyFeel(c) {
  const { it, up, dn } = ui.feel; closeModal();
  if (c === 'easy') { it.weight = up; note(`Следующий подход: ${fw(up)} кг`); }
  if (c === 'hard') { it.weight = dn; note(`Следующий подход: ${fw(dn)} кг`); }
  if (c === 'ok') {
    it.calibrating = false;
    it.mods.forEach(m => { if (m.t === 'calibration') m.done = true; });
    achieve({ icon: 'target', tone: 't-info', title: 'Рабочий вес найден', sub: `${fw(it.weight)} кг на ${rng(it.range)} повторов. Дальше прогресс посчитаю сам.` }, it);
  }
  workSets(it).forEach(s => { if (!s.done && s.auto !== false) s.w = null; });
  save(); render();
}

/* =========================================================
   actions: done, rest, records, finish
   ========================================================= */
function toggleDone(it, s) {
  if (s.done) { s.done = false; save(); render(); return; }
  if (s.w == null) s.w = recW(it, s);
  if (s.w == null) { openSetWeight(it, s); return; }
  if (s.r == null) s.r = targetReps(it, s);
  s.done = true;
  state.lastUid = it.uid;
  ui.flash = s.id;
  let recs = 0;
  if (s.type === 'N') { recs = checkRecords(it, s); failDrop(it, s); }
  const i = it.sets.indexOf(s), nxt = it.sets.slice(i + 1).find(x => !x.done);
  if (!(s.type === 'W' && nxt && nxt.type === 'W')) startRest(it);
  save(); render();
  setTimeout(() => { ui.flash = null; }, 800);
  if (s.type === 'N' && it.calibrating) setTimeout(() => openFeel(it, s), recs ? 1900 : 250); // сначала рекорд, потом вопрос
}

// провал: подход не добрал до низа диапазона 2+ повтора. Вниз вес двигается всегда.
function failDrop(it, s) {
  const [a, b] = it.range;
  if (it.calibrating || s.r > a - 2) return;
  const rest = workSets(it).filter(x => !x.done);
  if (!rest.length) return;
  const inv = invOf(it);
  const nw = roundNear(inv, (e1(s.w, s.r) * 0.975) / (1 + b / 30));
  if (nw >= s.w) return;
  it.weight = nw;
  rest.forEach(x => { x.w = null; });
  toast(`<b>Вес снижен до ${fw(nw)} кг</b><small>Подход не добрал до ${a} повторов. Дальше легче, чтобы снова попасть в диапазон.</small>`, 'plain t-violet', 4200);
}

function checkRecords(it, s) {
  const d = EX[it.exId];
  if (!d.best) return 0;
  let n = 0;
  const b = it.best || (it.best = { ...d.best });
  const v1 = e1(s.w, s.r), vol = s.w * s.r;
  if (v1 > b.e1 + 0.05) {
    achieve({ icon: 'bolt', title: 'Рекорд силы в подходе', sub: `${fw(s.w)} × ${s.r}: это примерно ${f1(v1)} кг на один раз. Было ${f1(b.e1)}.` }, it);
    b.e1 = v1; n++;
  }
  if (vol > b.vol + 0.05) {
    achieve({ icon: 'flame', title: 'Рекорд объёма в подходе', sub: `${fw(s.w)} × ${s.r} = ${thin(vol)} кг за подход. Было ${thin(b.vol)}.` }, it);
    b.vol = vol; n++;
  }
  return n;
}

function startRest(it) { state.rest = { uid: it.uid, start: Date.now(), dur: EX[it.exId].rest * 1000, buzz: false }; }
let restKey = '';
function tickRest() {
  const el = $('#rest'), r = state.rest;
  const it = r && findItem(r.uid);
  if (!r || !it) {
    if (restKey) { el.className = 'rest'; el.innerHTML = ''; restKey = ''; document.documentElement.style.setProperty('--rest-h', '0px'); }
    return;
  }
  const k = r.uid + r.start;
  if (restKey !== k) {
    restKey = k;
    el.className = 'rest on';
    el.innerHTML = `<div class="rest-in"><div class="rest-bar"></div>
      <div class="rest-main" data-act="rest-go"><b class="rest-time num"></b><div class="rest-txt"><b></b><small></small></div></div>
      <div class="rest-btns"><button data-act="rest-adj" data-v="-15">−15</button><button data-act="rest-adj" data-v="15">+15</button><button data-act="rest-skip" aria-label="Закрыть">${icon('close')}</button></div></div>`;
    requestAnimationFrame(() => document.documentElement.style.setProperty('--rest-h', el.offsetHeight + 'px'));
  }
  const left = (r.start + r.dur - Date.now()) / 1000, over = left < 0;
  el.classList.toggle('over', over);
  $('.rest-time', el).textContent = over ? '+' + clock(-left) : clock(Math.ceil(left));
  $('.rest-bar', el).style.width = (over ? 100 : (1 - left / (r.dur / 1000)) * 100) + '%';
  const next = it.sets.find(s => !s.done);
  $('.rest-txt b', el).textContent = over ? 'Пора! Отдых окончен' : 'Отдых';
  $('.rest-txt small', el).textContent = next
    ? `Дальше: ${next.type === 'W' ? 'разминка' : 'подход ' + setLabel(it, next)}, ${fw(next.w ?? recW(it, next))} кг × ${next.r ?? (next.type === 'W' ? next.rr : rng(it.range))}`
    : 'Упражнение пройдено. Выбирай следующее на карте';
  if (over && !r.buzz) { r.buzz = true; navigator.vibrate?.([200, 100, 200]); }
}

function achieve(a, it) {
  if (it) it.ach.push(a);
  toast(`<div class="medal">${frame()}${icon(a.icon)}</div><div><div class="k">${FL().ach}</div><b>${a.title}</b><small>${a.sub}</small></div>`, a.tone || 't-gold', 4200);
}
function toast(html, cls = '', ms = 2600) {
  const el = document.createElement('div');
  el.className = 'toast ' + cls; el.innerHTML = html;
  el.onclick = () => el.remove();
  $('#toasts').appendChild(el);
  setTimeout(() => { el.classList.add('out'); setTimeout(() => el.remove(), 300); }, ms);
}
const note = txt => toast(`<b>${txt}</b>`, 'plain', 2200);

function closeModal() { $('#modal').classList.remove('on'); $('#modal').innerHTML = ''; }

function finishEx(it) {
  const d = EX[it.exId], ws = workSets(it), [a, b] = it.range;
  const now = scoreOf(it.sets), prev = lastScore(d), best = d.best?.score;
  const vol = ws.reduce((x, s) => x + (s.w || 0) * (s.r || 0), 0);
  const lvlUp = !it.calibrating && now != null && best != null && now > best + 0.05;
  const inv = invOf(it);
  let plan;
  if (it.calibrating) plan = `Подбор продолжим в следующий раз, начнём с <b>${fw(it.weight)} кг</b>.`;
  else if (ws.every(s => s.r >= b)) { const n = nextWeight(inv, it.weight, it.range); plan = n ? `Все подходы на максимум. В следующий раз: <b>${fw(n)} кг</b>.` : 'Все подходы на максимум, а вес уже потолок. Предложу замену.'; }
  else if (ws.filter(s => s.r < a).length >= 2) plan = 'Пара подходов не дотянула до цели. Если повторится, чуть снизим вес.';
  else plan = `В следующий раз снова <b>${fw(it.weight)} кг</b>, добираем повторы до ${b}.`;
  if (lvlUp) it.ach.push({ icon: 'crown', title: 'Новый уровень силы', sub: `Было ${f1(best)}, стало ${f1(now)}` });
  it.finished = true; save();
  const tone = lvlUp ? 't-gold' : 't-good';
  const rays = Array.from({ length: 14 }, (_, i) => `<i style="--a:${i * (360 / 14)}deg;animation-delay:${0.1 + (i % 3) * 0.05}s"></i>`).join('');
  $('#modal').innerHTML = `<div class="win panel ${tone}">
    <div class="emblem"><div class="burst">${rays}</div>${frame()}${icon(lvlUp ? 'crown' : 'trophy')}</div>
    <div class="kick" style="color:var(--tone)">${FL().winSub}</div>
    <h2 class="h">${lvlUp ? 'Новый уровень силы!' : FL().win}</h2>
    <p class="sub">${d.name}</p>
    <div class="win-stats">
      <div><small>Подходы</small><b class="num">${ws.filter(s => s.done).length}/${ws.length}</b></div>
      <div><small>Объём</small><b class="num">${thin(vol)}</b></div>
      <div><small>Сила</small><b class="num ${now != null && prev != null && now > prev ? 'up' : ''}">${now != null && !it.calibrating ? f1(now) : '·'}</b>${now != null && prev != null && !it.calibrating ? `<small class="num">было ${f1(prev)}</small>` : ''}</div>
    </div>
    ${it.ach.length ? `<div class="ach-list">${it.ach.map(x => `<div>${icon(x.icon)}<div><b>${x.title}</b>${x.sub}</div></div>`).join('')}</div>` : ''}
    <p class="sh-text" style="margin:0 0 16px">${plan}</p>
    <button class="btn btn-main" data-act="win-ok" data-uid="${it.uid}">${icon('map')} На карту</button>
  </div>`;
  $('#modal').classList.add('on');
}

/* menus */
function openMenu() {
  openSheet(() => `<div class="sh-title"><b>Прототип</b></div>
    <div class="sh-row" style="grid-template-columns:1fr"><button class="btn btn-soft" data-act="reset-proto">${icon('reset')} Начать тренировку заново</button></div>
    <p class="sh-text" style="text-align:center">Сброс вернёт все встречи и подходы в начальное состояние.</p>`);
}
function openAddSheet() {
  const list = CATALOG.filter(id => !state.items.some(x => x.exId === id));
  openSheet(() => `<div class="sh-title"><b>Добавить упражнение</b></div>
    <div class="pick-list">${list.map(id => {
      const x = EX[id];
      return `<button class="pick panel" data-act="pick-add" data-ex="${id}"><div class="pic">${pic(null, x)}</div><div><b>${x.name}</b><small class="num">${x.sets} × ${rng(x.range)} @ ${fw(x.weight)} кг${x.last ? '' : ' · впервые'}</small></div></button>`;
    }).join('') || '<p class="sh-text">Каталог закончился</p>'}</div>`);
}
function openExMenu(it) {
  const d = EX[it.exId];
  openSheet(() => `<div class="sh-title"><b>${d.name}</b></div>
    <div class="pick-list">
      <button class="btn btn-soft" data-act="exm-inv">${icon('sliders')} Мой инвентарь</button>
      ${d.alts ? `<button class="btn btn-soft" data-act="exm-replace">${icon('swap')} Заменить упражнение</button>` : ''}
      <button class="btn btn-soft" data-act="exm-remove" style="color:var(--bad)">${icon('trash')} Убрать из тренировки</button>
    </div>`);
}
function openReplaceSheet(it) {
  const d = EX[it.exId];
  openSheet(() => `<div class="sh-title"><b>Заменить на</b></div><div class="pick-list">${d.alts.map(al => {
    const x = EX[al.ex];
    return `<button class="pick panel" data-act="pick-replace" data-ex="${al.ex}"><div class="pic">${pic(null, x)}</div><div><b>${x.name}</b><small>${al.text}</small></div></button>`;
  }).join('')}</div>`);
}
function strInfo() {
  openSheet(() => `<div class="sh-title"><b>Что такое сила</b></div>
    <p class="sh-text"><b>Сила</b> показывает, сколько ты примерно поднял бы на один раз. Считаю её по всем рабочим подходам за тренировку.</p>
    <p class="sh-text">Она растёт и когда ты добавляешь повторы, и когда берёшь больший вес. Поэтому прогресс виден каждую тренировку, даже если вес не менялся.</p>
    <div class="info panel" style="margin-top:14px">
      <div class="sbar" style="margin-top:4px"><div class="fill" style="width:55%"></div><div class="tick" style="left:30%"></div></div>
      <div class="sedges"><div><small>Левый край</small><br><b>вес на минимум повторов</b></div><div class="r"><small>Правый край</small><br><b>вес на максимум</b></div></div>
    </div>
    <p class="sh-text">Дошёл до правого края, значит сделал все подходы на максимум. В следующий раз вес вырастет, и шкала начнётся заново, но уже с более высокой отметки.</p>`);
}
function modInfo(it, t) {
  const tx = {
    calibration: 'Я ещё ищу твой рабочий вес. После каждого рабочего подхода спрошу, как он прошёл: легко, нормально или тяжело. Ответ «нормально» закончит подбор.',
  }[t] || 'Это событие уже решено.';
  openSheet(() => `<div class="sh-title"><b>${MOD[t].name}</b></div><p class="sh-text">${tx}</p>
    ${t === 'calibration' ? `<div class="three" style="margin-top:14px"><div class="t-good">${icon('up')}<b>Легко</b><small>следующий тяжелее</small></div><div class="t-info">${icon('check')}<b>Норм</b><small>вес найден</small></div><div class="t-bad">${icon('down')}<b>Тяжело</b><small>следующий легче</small></div></div>` : ''}
    <button class="btn btn-main sh-main" data-act="sheet-close" style="margin-top:16px">Понятно</button>`);
}

/* =========================================================
   router + render
   ========================================================= */
function parse() {
  const [page = '', uid, extra] = location.hash.replace(/^#\/?/, '').split('/');
  return { page, uid, extra };
}
function render() {
  const r = parse();
  const it = r.uid && findItem(r.uid);
  const key = r.page + (r.uid || '');
  const routeChanged = key !== ui.routeKey;
  if (routeChanged) { ui.editRow = null; if (r.page !== 'inv') ui.invDraft = null; if (r.page !== 'enc') ui.encSub = null; }
  let html;
  if (r.page === 'ex' && it) {
    if (encQueue(it).length) { location.replace(`#/enc/${it.uid}`); return; }
    html = renderEx(it);
  } else if (r.page === 'enc' && it) html = renderEnc(it);
  else if (r.page === 'inv' && it) html = renderInv(it, r.extra === 'enc');
  else html = renderMap();
  if (!html) return;
  $('#app').innerHTML = html;
  if (routeChanged) { ui.routeKey = key; scrollTo(0, 0); }
  if (!r.page) setupDnD($('#track'));
  else { window.onmousemove = null; window.onmouseup = null; }
  tickRest();
}

const curItem = () => findItem(parse().uid);
const ACT = {
  open: ({ el }) => { const it = findItem(el.dataset.uid); regenWarmups(it); save(); go(encQueue(it).length ? `#/enc/${it.uid}` : `#/ex/${it.uid}`); },
  exit: () => note('Здесь будет выход в список тренировок'),
  menu: openMenu,
  'add-ex': openAddSheet,
  'to-map': () => go('#/'),
  'ex-menu': ({ it }) => openExMenu(it),
  'mod-info': ({ it, el }) => modInfo(it, el.dataset.t),
  'str-info': strInfo,
  type: ({ s }) => { ui.editRow = s.id; render(); },
  'edit-close': () => { ui.editRow = null; render(); },
  'set-type': ({ it, s, el }) => {
    const v = el.dataset.v;
    if (v !== s.type) {
      s.type = v; s.auto = false;
      if (v === 'W') { s.wr = s.w ?? roundDown(invOf(it), (it.weight || 0) * 0.5); s.rr = 12; }
    }
    ui.editRow = null; save(); render();
  },
  'set-del': ({ it, s }) => { it.sets = it.sets.filter(x => x !== s); ui.editRow = null; save(); render(); },
  w: ({ it, s }) => openSetWeight(it, s),
  r: ({ it, s }) => openRepsSheet(it, s),
  chk: ({ it, s }) => toggleDone(it, s),
  'add-set': ({ it }) => { it.sets.push(newSet('N')); save(); render(); },
  finish: ({ it }) => finishEx(it),
  'win-ok': ({ el }) => {
    closeModal();
    const uid = el.dataset.uid;
    ui.justDone = uid;
    ui.justOpen = state.items.filter(x => (x.deps || []).includes(uid) && isOpen(x)).map(x => x.uid);
    go('#/');
    setTimeout(() => { ui.justDone = null; ui.justOpen = null; }, 2500);
    setTimeout(() => $(`.lvl[data-uid="${ui.justOpen?.[0] || uid}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 600);
  },
  'enc-pick': ({ it, el }) => {
    if (ui.picking) return;
    ui.picking = true;
    el.classList.add('sel');
    setTimeout(() => { ui.picking = false; encGo(it, el.dataset.c); }, 160);
  },
  'enc-sub-back': () => { ui.encSub = null; render(); },
  'inv-back': ({ it }) => { ui.invDraft = null; go(parse().extra === 'enc' ? `#/enc/${it.uid}` : `#/ex/${it.uid}`); },
  'inv-kind': ({ el }) => { ui.invDraft.inv.kind = el.dataset.v; ui.invDraft.pv = null; render(); },
  'inv-bar': ({ el }) => { ui.invDraft.inv.bar = +el.dataset.v; render(); },
  'inv-plate': ({ el }) => {
    const inv = ui.invDraft.inv, p = +el.dataset.v;
    if (inv.plates.includes(p)) { if (inv.plates.length > 1) inv.plates = inv.plates.filter(x => x !== p); }
    else inv.plates = [...inv.plates, p].sort((a, b) => a - b);
    render();
  },
  'inv-num': ({ el }) => { invNum(ui.invDraft.inv, el.dataset.k, +el.dataset.d); render(); },
  'inv-micro': ({ el }) => { ui.invDraft.inv.micro = el.dataset.v; render(); },
  'inv-knob': ({ el }) => { ui.invDraft.inv.knob = +el.dataset.v; render(); },
  'inv-peg': ({ el }) => {
    const inv = ui.invDraft.inv, p = +el.dataset.v;
    inv.pegs = inv.pegs.includes(p) ? inv.pegs.filter(x => x !== p) : [...inv.pegs, p];
    if (!inv.pegs.length) inv.micro = 'none';
    render();
  },
  'inv-save': ({ it, el }) => {
    const { key, inv } = ui.invDraft;
    state.inv[key] = { ...inv, configured: true };
    ui.invDraft = null;
    invConfigured(key);
    note('Инвентарь сохранён');
    if (el.dataset.enc === '1') afterEnc(it); else go(`#/ex/${it.uid}`);
  },
  'sheet-close': () => closeSheet(),
  'ws-inc': () => { ui.ws.value = stepUp(ui.ws.inv, ui.ws.value); refreshSheet(); },
  'ws-dec': () => { ui.ws.value = stepDown(ui.ws.inv, ui.ws.value); refreshSheet(); },
  'ws-done': () => {
    const ws = ui.ws;
    if (ws.commitOnClose === false) { closeSheet(true); ws.onCommit(ws.value); } else closeSheet();
  },
  'ws-reset': () => { const ws = ui.ws; closeSheet(true); ws.onReset?.(); },
  'ws-inv': () => { const ws = ui.ws; closeSheet(true); go(`#/inv/${ws.uid}${parse().page === 'enc' ? '/enc' : ''}`); },
  'rs-inc': () => { ui.rs.value++; refreshSheet(); },
  'rs-dec': () => { ui.rs.value = Math.max(0, ui.rs.value - 1); refreshSheet(); },
  'rs-q': ({ el }) => { ui.rs.value = +el.dataset.v; refreshSheet(); },
  'rs-range': () => { ui.rs.edit = !ui.rs.edit; refreshSheet(); },
  'rs-ra': ({ el }) => {
    const r = ui.rs, k = el.dataset.k, d = +el.dataset.d;
    if (k === 'a') r.a = clamp(r.a + d, 1, r.b); else r.b = clamp(r.b + d, r.a, 50);
    refreshSheet();
  },
  'rs-reset': () => { const r = ui.rs; closeSheet(true); r.s.r = null; save(); render(); },
  'rs-done': () => closeSheet(),
  feel: ({ el }) => { el.classList.add('sel'); setTimeout(() => applyFeel(el.dataset.c), 150); },
  'feel-skip': () => closeModal(),
  'reset-proto': () => { closeSheet(true); localStorage.removeItem(KEY); freshState(state.theme); ui.sel = {}; go('#/'); render(); note('Тренировка начата заново'); },
  'rest-adj': ({ el }) => { state.rest.dur = Math.max(0, state.rest.dur + +el.dataset.v * 1000); state.rest.buzz = false; save(); tickRest(); },
  'rest-skip': () => { state.rest = null; save(); tickRest(); },
  'rest-go': () => { const r = state.rest; if (r && parse().uid !== r.uid) go(`#/ex/${r.uid}`); },
  'pick-add': ({ el }) => {
    const ni = makeItem(el.dataset.ex); state.items.push(ni); save(); closeSheet(true); render();
    note(`Добавлено: ${EX[ni.exId].name}`);
    setTimeout(() => $(`.lvl[data-uid="${ni.uid}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 50);
  },
  'exm-inv': ({ it }) => { closeSheet(true); go(`#/inv/${it.uid}`); },
  'exm-replace': ({ it }) => { closeSheet(true); openReplaceSheet(it); },
  'pick-replace': ({ it, el }) => { closeSheet(true); replaceItem(it, el.dataset.ex, {}); },
  'exm-remove': ({ it }) => { closeSheet(true); state.items = state.items.filter(x => x !== it); save(); go('#/'); note('Упражнение убрано'); },
};

document.addEventListener('click', e => {
  if (ui.justDragged) { e.preventDefault(); e.stopPropagation(); return; }
  const el = e.target.closest('[data-act]'); if (!el) return;
  const fn = ACT[el.dataset.act]; if (!fn) return;
  const it = curItem();
  const sid = el.closest('[data-sid]')?.dataset.sid;
  const s = sid && it ? it.sets.find(x => String(x.id) === sid) : null;
  fn({ el, it, s, e });
}, true);

document.addEventListener('change', e => {
  if (e.target.id === 'ws-in') {
    const v = parseFloat(e.target.value.replace(',', '.'));
    if (!isNaN(v)) ui.ws.value = roundNear(ui.ws.inv, v);
    refreshSheet();
  }
  if (e.target.id === 'rs-in') {
    const v = parseInt(e.target.value, 10);
    if (!isNaN(v)) ui.rs.value = clamp(v, 0, 100);
    refreshSheet();
  }
});
document.addEventListener('keydown', e => { if (e.key === 'Enter' && e.target.matches('.bignum')) e.target.blur(); });
document.addEventListener('input', e => {
  if (e.target.dataset.inp === 'inv-pv') {
    const inv = ui.invDraft.inv, ws = weights(inv);
    ui.invDraft.pv = +e.target.value;
    const w = ws[ui.invDraft.pv];
    $('#inv-pv-w').textContent = fw(w) + ' кг';
    $('#inv-pv-viz').innerHTML = vizFor(inv, w);
    $('#inv-pv-cap').innerHTML = capFor(inv, w);
  }
});

window.addEventListener('hashchange', () => { closeSheet(true); closeModal(); render(); });
load();
render();
setInterval(() => {
  const t = clock((Date.now() - state.started) / 1000);
  $$('[data-clock]').forEach(el => { el.textContent = t; });
  tickRest();
}, 250);
