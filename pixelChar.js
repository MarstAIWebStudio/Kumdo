// ============================================================
// PIXEL CHARACTER SYSTEM v2 — 30x36 grid, 더 선명한 고화질
// ============================================================

const PC = {
  _:'',
  skin:'#f0c090', skin_sh:'#d4965a', skin_hi:'#ffd8a8',
  hair:'#1c1008', hair_hi:'#2e1a0e',
  men:'#2a2a35',  men_sh:'#18181f', men_hi:'#3d3d4f', men_grill:'#3a3a48', men_grill_sh:'#28283a',
  gi:'#1a3060',   gi_sh:'#0d1e3f',  gi_hi:'#2a4a90',  gi_acc:'#3060b0',
  hakama:'#130d1e',hakama_sh:'#0a0712',
  obi:'#6a1515',  obi_hi:'#8a2020',
  // 죽도 - 더 길고 선명하게
  shin:'#c8a040', shin_sh:'#8a6a20', shin_hi:'#e8c060', shin_tip:'#f0e0a0', shin_guard:'#7a5010',
  outline:'#080608',
};
const _=PC._;

// ─── 32x38 IDLE ──────────────────────────────────────────
const IDLE=[
[_,_,_,_,_,_,_,_,_,PC.hair,PC.hair,PC.hair,PC.hair,PC.hair,PC.hair,PC.hair,PC.hair,PC.hair,_,_,_,_,_,_,_,_,_,_,_,_],
[_,_,_,_,_,_,_,PC.hair,PC.hair,PC.hair,PC.hair_hi,PC.hair,PC.hair,PC.hair,PC.hair,PC.hair_hi,PC.hair,PC.hair,PC.hair,_,_,_,_,_,_,_,_,_,_,_],
[_,_,_,_,_,_,PC.hair,PC.hair,PC.men,PC.men,PC.men,PC.men,PC.men,PC.men,PC.men,PC.men,PC.men,PC.men,PC.hair,PC.hair,_,_,_,_,_,_,_,_,_,_],
[_,_,_,_,_,PC.men,PC.men,PC.men_sh,PC.men_grill,PC.men_grill,PC.men_grill,PC.men_grill,PC.men_grill,PC.men_grill,PC.men_grill,PC.men_grill,PC.men_grill,PC.men_sh,PC.men,PC.men,PC.men,_,_,_,_,_,_,_,_,_],
[_,_,_,_,PC.men,PC.men,PC.skin,PC.men_grill,PC.men_grill,PC.men_grill,PC.men_grill,PC.men_grill,PC.men_grill,PC.men_grill,PC.men_grill,PC.men_grill,PC.men_grill,PC.men_grill,PC.skin,PC.men,PC.men,_,_,_,_,_,_,_,_,_],
[_,_,_,_,PC.men,PC.skin,PC.skin,PC.skin,PC.men_grill,PC.men_grill,PC.men_grill,PC.men_grill,PC.men_grill,PC.men_grill,PC.men_grill,PC.men_grill,PC.men_grill,PC.skin,PC.skin,PC.skin,PC.men,_,_,_,_,_,_,_,_,_],
[_,_,_,_,PC.men,PC.skin,PC.skin,PC.skin,PC.skin,PC.skin,PC.skin,PC.skin,PC.skin,PC.skin,PC.skin,PC.skin,PC.skin,PC.skin,PC.skin,PC.skin,PC.men,_,_,_,_,_,_,_,_,_],
[_,_,_,_,PC.men_sh,PC.skin_sh,PC.skin,PC.skin,PC.skin,PC.skin,PC.skin,PC.skin,PC.skin,PC.skin,PC.skin,PC.skin,PC.skin,PC.skin,PC.skin,PC.skin_sh,PC.men_sh,_,_,_,_,_,_,_,_,_],
[_,_,_,_,_,PC.men,PC.men,PC.men,PC.skin_sh,PC.skin_sh,_,_,_,_,PC.skin_sh,PC.skin_sh,PC.men,PC.men,PC.men,_,_,_,_,_,_,_,_,_,_,_],
[_,_,_,_,_,_,PC.men,PC.men,PC.men,PC.men,PC.men,PC.men,PC.men,PC.men,PC.men,PC.men,PC.men,PC.men,_,_,_,_,_,_,_,_,_,_,_,_],
[_,_,_,_,_,_,PC.gi,PC.gi,PC.gi,PC.gi,PC.gi,PC.gi,PC.gi,PC.gi,PC.gi,PC.gi,PC.gi,PC.gi,_,_,_,_,_,_,_,_,_,_,_,_],
[_,_,_,_,_,PC.gi,PC.gi,PC.gi_hi,PC.gi,PC.gi,PC.gi,PC.gi,PC.gi,PC.gi,PC.gi,PC.gi,PC.gi_hi,PC.gi,PC.gi,_,_,_,_,_,_,_,_,_,_,_],
[_,_,_,_,PC.gi,PC.gi,PC.gi,PC.gi,PC.gi,PC.obi,PC.obi,PC.obi,PC.obi,PC.obi,PC.obi,PC.gi,PC.gi,PC.gi,PC.gi,PC.gi,_,_,_,_,_,_,_,_,_,_],
[_,_,_,PC.shin,PC.gi,PC.gi,PC.gi_sh,PC.gi,PC.obi,PC.obi_hi,PC.obi,PC.obi,PC.obi,PC.obi,PC.obi_hi,PC.obi,PC.gi,PC.gi_sh,PC.gi,PC.gi,_,_,_,_,_,_,_,_,_,_],
[_,_,PC.shin,PC.shin,PC.gi,PC.gi,PC.gi,PC.gi,PC.gi,PC.gi,PC.gi,PC.gi,PC.gi,PC.gi,PC.gi,PC.gi,PC.gi,PC.gi,PC.gi,_,_,_,_,_,_,_,_,_,_,_],
[_,PC.shin,PC.shin,_,PC.hakama,PC.hakama,PC.hakama,PC.hakama,PC.hakama,PC.hakama,PC.hakama,PC.hakama,PC.hakama,PC.hakama,PC.hakama,PC.hakama,PC.hakama,PC.hakama,PC.hakama,_,_,_,_,_,_,_,_,_,_,_],
[PC.shin_tip,PC.shin,_,_,PC.hakama,PC.hakama,PC.hakama,PC.hakama,PC.hakama,PC.hakama,PC.hakama,PC.hakama,PC.hakama,PC.hakama,PC.hakama,PC.hakama,PC.hakama,PC.hakama,PC.hakama,_,_,_,_,_,_,_,_,_,_,_],
[_,PC.shin_guard,_,_,_,PC.hakama,PC.hakama,PC.hakama_sh,PC.hakama,PC.hakama,PC.hakama,PC.hakama,PC.hakama,PC.hakama,PC.hakama,PC.hakama_sh,PC.hakama,PC.hakama,_,_,_,_,_,_,_,_,_,_,_,_],
[_,_,_,_,_,PC.hakama,PC.hakama,PC.hakama,PC.hakama,PC.hakama,PC.hakama,_,_,_,PC.hakama,PC.hakama,PC.hakama,PC.hakama,_,_,_,_,_,_,_,_,_,_,_,_],
[_,_,_,_,_,PC.hakama,PC.hakama,PC.hakama,PC.hakama,PC.hakama,_,_,_,_,_,PC.hakama,PC.hakama,PC.hakama,_,_,_,_,_,_,_,_,_,_,_,_],
[_,_,_,_,_,PC.hakama,PC.hakama,PC.hakama,PC.hakama,_,_,_,_,_,_,_,PC.hakama,PC.hakama,_,_,_,_,_,_,_,_,_,_,_,_],
[_,_,_,_,_,PC.hakama_sh,PC.hakama,PC.hakama,_,_,_,_,_,_,_,_,PC.hakama,PC.hakama_sh,_,_,_,_,_,_,_,_,_,_,_,_],
[_,_,_,_,_,PC.hakama_sh,PC.hakama_sh,_,_,_,_,_,_,_,_,_,_,PC.hakama_sh,_,_,_,_,_,_,_,_,_,_,_,_],
[_,_,_,_,_,PC.outline,PC.outline,_,_,_,_,_,_,_,_,_,_,PC.outline,_,_,_,_,_,_,_,_,_,_,_,_],
];

// ─── MEN 스트라이크 WIND-UP ───────────────────────────────
const MEN_UP=[
[_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,PC.shin_tip,_,_,_,_,_,_,_,_,_,_],
[_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,PC.shin,PC.shin,_,_,_,_,_,_,_,_,_,_],
[_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,PC.shin,PC.shin,_,_,_,_,_,_,_,_,_,_,_,_],
[_,_,_,_,_,_,_,_,_,PC.hair,PC.hair,PC.hair,PC.hair,PC.hair,PC.hair,PC.shin,PC.hair,PC.hair,_,_,_,_,_,_,_,_,_,_,_,_],
[_,_,_,_,_,_,_,PC.hair,PC.hair,PC.hair,PC.hair,PC.hair,PC.hair,PC.hair,PC.hair,PC.shin_guard,PC.hair,PC.hair,PC.hair,_,_,_,_,_,_,_,_,_,_,_],
[_,_,_,_,_,_,PC.hair,PC.hair,PC.men,PC.men,PC.men,PC.men,PC.men,PC.men,PC.men,PC.men,PC.men,PC.men,PC.hair,PC.hair,_,_,_,_,_,_,_,_,_,_],
[_,_,_,_,_,PC.men,PC.men,PC.men_sh,PC.men_grill,PC.men_grill,PC.men_grill,PC.men_grill,PC.men_grill,PC.men_grill,PC.men_grill,PC.men_grill,PC.men_grill,PC.men_sh,PC.men,PC.men,PC.men,_,_,_,_,_,_,_,_,_],
[_,_,_,_,PC.men,PC.men,PC.skin,PC.men_grill,PC.men_grill,PC.men_grill,PC.men_grill,PC.men_grill,PC.men_grill,PC.men_grill,PC.men_grill,PC.men_grill,PC.men_grill,PC.men_grill,PC.skin,PC.men,PC.men,_,_,_,_,_,_,_,_,_],
[_,_,_,_,PC.men,PC.skin,PC.skin,PC.skin,PC.men_grill,PC.men_grill,PC.men_grill,PC.men_grill,PC.men_grill,PC.men_grill,PC.men_grill,PC.men_grill,PC.men_grill,PC.skin,PC.skin,PC.skin,PC.men,_,_,_,_,_,_,_,_,_],
[_,_,_,_,PC.men_sh,PC.skin_sh,PC.skin,PC.skin,PC.skin,PC.skin,PC.skin,PC.skin,PC.skin,PC.skin,PC.skin,PC.skin,PC.skin,PC.skin,PC.skin,PC.skin_sh,PC.men_sh,_,_,_,_,_,_,_,_,_],
[_,_,_,_,_,PC.men,PC.men,PC.men,PC.skin_sh,_,_,_,_,_,_,PC.skin_sh,PC.men,PC.men,PC.men,_,_,_,_,_,_,_,_,_,_,_],
[_,_,_,_,_,_,PC.men,PC.men,PC.men,PC.men,PC.men,PC.men,PC.men,PC.men,PC.men,PC.men,PC.men,PC.men,_,_,_,_,_,_,_,_,_,_,_,_],
[_,_,_,_,_,_,PC.gi,PC.gi,PC.gi,PC.gi,PC.gi,PC.gi,PC.gi,PC.gi,PC.gi,PC.gi,PC.gi,PC.gi,_,_,_,_,_,_,_,_,_,_,_,_],
[_,_,_,_,_,PC.gi_hi,PC.gi,PC.gi,PC.gi_hi,PC.gi,PC.gi,PC.gi,PC.gi,PC.gi,PC.gi,PC.gi_hi,PC.gi,PC.gi,PC.gi_hi,_,_,_,_,_,_,_,_,_,_,_],
[_,_,_,_,PC.gi,PC.gi,PC.gi,PC.gi,PC.gi,PC.obi,PC.obi,PC.obi,PC.obi,PC.obi,PC.obi,PC.gi,PC.gi,PC.gi,PC.gi,PC.gi,_,_,_,_,_,_,_,_,_,_],
[_,_,_,PC.gi,PC.gi,PC.gi_sh,PC.gi,PC.obi,PC.obi,PC.obi_hi,PC.obi,PC.obi,PC.obi,PC.obi,PC.obi_hi,PC.obi,PC.gi,PC.gi_sh,PC.gi,PC.gi,_,_,_,_,_,_,_,_,_,_],
[_,_,PC.gi,PC.gi,PC.gi,PC.gi,PC.gi,PC.gi,PC.gi,PC.gi,PC.gi,PC.gi,PC.gi,PC.gi,PC.gi,PC.gi,PC.gi,PC.gi,PC.gi,_,_,_,_,_,_,_,_,_,_,_],
[_,_,PC.hakama,PC.hakama,PC.hakama,PC.hakama,PC.hakama,PC.hakama,PC.hakama,PC.hakama,PC.hakama,PC.hakama,PC.hakama,PC.hakama,PC.hakama,PC.hakama,PC.hakama,PC.hakama,_,_,_,_,_,_,_,_,_,_,_,_],
[_,_,PC.hakama,PC.hakama,PC.hakama,PC.hakama,PC.hakama,PC.hakama,PC.hakama,PC.hakama,PC.hakama,PC.hakama,PC.hakama,PC.hakama,PC.hakama,PC.hakama,PC.hakama,PC.hakama,_,_,_,_,_,_,_,_,_,_,_,_],
[_,_,_,PC.hakama,PC.hakama,PC.hakama_sh,PC.hakama,PC.hakama,PC.hakama,PC.hakama,PC.hakama,PC.hakama,PC.hakama,PC.hakama,PC.hakama_sh,PC.hakama,PC.hakama,_,_,_,_,_,_,_,_,_,_,_,_,_],
[_,_,_,PC.hakama,PC.hakama,PC.hakama,PC.hakama,_,_,_,_,PC.hakama,PC.hakama,PC.hakama,PC.hakama,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
[_,_,_,PC.hakama,PC.hakama,PC.hakama,_,_,_,_,_,_,PC.hakama,PC.hakama,PC.hakama,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
[_,_,_,PC.hakama_sh,PC.hakama,_,_,_,_,_,_,_,_,PC.hakama,PC.hakama_sh,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
[_,_,_,PC.outline,_,_,_,_,_,_,_,_,_,_,PC.outline,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
];

// ─── MEN HIT ─────────────────────────────────────────────
const MEN_HIT=[
[_,_,_,_,_,_,_,_,PC.shin_tip,PC.shin,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
[_,_,_,_,_,_,_,_,_,PC.shin,PC.shin,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
[_,_,_,_,_,_,_,_,_,PC.hair,PC.hair,PC.hair,PC.hair,PC.hair,PC.hair,PC.hair,PC.hair,PC.hair,_,_,_,_,_,_,_,_,_,_,_,_],
[_,_,_,_,_,_,_,PC.hair,PC.hair,PC.hair,PC.hair,PC.hair,PC.hair,PC.hair,PC.hair,PC.hair,PC.hair,PC.hair,PC.hair,_,_,_,_,_,_,_,_,_,_,_],
[_,_,_,_,_,_,PC.hair,PC.hair,PC.men,PC.men,PC.men,PC.men,PC.men,PC.men,PC.men,PC.men,PC.men,PC.men,PC.hair,PC.hair,_,_,_,_,_,_,_,_,_,_],
[_,_,_,_,_,PC.men,PC.men,PC.men_sh,PC.men_grill,PC.men_grill,PC.men_grill,PC.men_grill,PC.men_grill,PC.men_grill,PC.men_grill,PC.men_grill,PC.men_grill,PC.men_sh,PC.men,PC.men,PC.men,_,_,_,_,_,_,_,_,_],
[_,_,_,_,PC.men,PC.men,PC.skin,PC.men_grill,PC.men_grill,PC.men_grill,PC.men_grill,PC.men_grill,PC.men_grill,PC.men_grill,PC.men_grill,PC.men_grill,PC.men_grill,PC.men_grill,PC.skin,PC.men,PC.men,_,_,_,_,_,_,_,_,_],
[_,_,_,_,PC.men,PC.skin,PC.skin,PC.skin,PC.men_grill,PC.men_grill,PC.men_grill,PC.men_grill,PC.men_grill,PC.men_grill,PC.men_grill,PC.men_grill,PC.men_grill,PC.skin,PC.skin,PC.skin,PC.men,_,_,_,_,_,_,_,_,_],
[_,_,_,_,PC.men_sh,PC.skin_sh,PC.skin,PC.skin,PC.skin,PC.skin,PC.skin,PC.skin,PC.skin,PC.skin,PC.skin,PC.skin,PC.skin,PC.skin,PC.skin,PC.skin_sh,PC.men_sh,_,_,_,_,_,_,_,_,_],
[_,_,_,_,_,PC.men,PC.men,PC.men,PC.skin_sh,_,_,_,_,_,_,PC.skin_sh,PC.men,PC.men,PC.men,_,_,_,_,_,_,_,_,_,_,_],
[_,_,_,_,_,_,PC.men,PC.men,PC.men,PC.men,PC.men,PC.men,PC.men,PC.men,PC.men,PC.men,PC.men,PC.men,_,_,_,_,_,_,_,_,_,_,_,_],
[_,_,_,_,_,_,PC.gi,PC.gi,PC.gi,PC.gi,PC.gi,PC.gi,PC.gi,PC.gi,PC.gi,PC.gi,PC.gi,PC.gi,_,_,_,_,_,_,_,_,_,_,_,_],
[_,_,_,_,_,PC.gi_hi,PC.gi,PC.gi,PC.gi_hi,PC.gi,PC.gi,PC.gi,PC.gi,PC.gi,PC.gi,PC.gi_hi,PC.gi,PC.gi,PC.gi_hi,_,_,_,_,_,_,_,_,_,_,_],
[_,_,_,_,PC.gi,PC.gi,PC.gi,PC.gi,PC.gi,PC.obi,PC.obi,PC.obi,PC.obi,PC.obi,PC.obi,PC.gi,PC.gi,PC.gi,PC.gi,PC.gi,_,_,_,_,_,_,_,_,_,_],
[_,_,_,PC.gi,PC.gi,PC.gi_sh,PC.gi,PC.obi,PC.obi,PC.obi_hi,PC.obi,PC.obi,PC.obi,PC.obi,PC.obi_hi,PC.obi,PC.gi,PC.gi_sh,PC.gi,PC.gi,_,_,_,_,_,_,_,_,_,_],
[_,_,PC.gi,PC.gi,PC.gi,PC.gi,PC.gi,PC.gi,PC.gi,PC.gi,PC.gi,PC.gi,PC.gi,PC.gi,PC.gi,PC.gi,PC.gi,PC.gi,PC.gi,_,_,_,_,_,_,_,_,_,_,_],
[_,_,PC.hakama,PC.hakama,PC.hakama,PC.hakama,PC.hakama,PC.hakama,PC.hakama,PC.hakama,PC.hakama,PC.hakama,PC.hakama,PC.hakama,PC.hakama,PC.hakama,PC.hakama,PC.hakama,_,_,_,_,_,_,_,_,_,_,_,_],
[_,_,PC.hakama,PC.hakama,PC.hakama,PC.hakama,PC.hakama,PC.hakama,PC.hakama,PC.hakama,PC.hakama,PC.hakama,PC.hakama,PC.hakama,PC.hakama,PC.hakama,PC.hakama,PC.hakama,_,_,_,_,_,_,_,_,_,_,_,_],
[_,_,_,PC.hakama,PC.hakama,PC.hakama_sh,PC.hakama,PC.hakama,PC.hakama,PC.hakama,PC.hakama,PC.hakama,PC.hakama,PC.hakama,PC.hakama_sh,PC.hakama,PC.hakama,_,_,_,_,_,_,_,_,_,_,_,_,_],
[_,_,_,PC.hakama,PC.hakama,PC.hakama,PC.hakama,_,_,_,_,PC.hakama,PC.hakama,PC.hakama,PC.hakama,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
[_,_,_,PC.hakama,PC.hakama,PC.hakama,_,_,_,_,_,_,PC.hakama,PC.hakama,PC.hakama,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
[_,_,_,PC.hakama_sh,PC.hakama,_,_,_,_,_,_,_,_,PC.hakama,PC.hakama_sh,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
[_,_,_,PC.outline,_,_,_,_,_,_,_,_,_,_,PC.outline,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
];

// 나머지 타격들은 MEN 기반으로 파생 (죽도 위치만 다르게)
const KOTE_UP = MEN_UP;   // 코테: scaleX(-1) CSS로 반전
const KOTE_HIT = MEN_HIT;
const DO_UP   = MEN_HIT;  // 도: 조금 기울어진 느낌
const DO_HIT  = IDLE;
const TSUKI_UP = MEN_UP;
const TSUKI_HIT = MEN_HIT;

// ─── 상대방 스프라이트 (붉은 도복) ───────────────────────
function buildOppGrid() {
  // IDLE 그대로 복사 후 색만 교체
  return IDLE.map(row => row.map(c => {
    if (c === PC.gi)    return '#5a1010';
    if (c === PC.gi_sh) return '#3a0808';
    if (c === PC.gi_hi) return '#7a1818';
    if (c === PC.obi)   return '#1a5a20';
    if (c === PC.obi_hi)return '#2a8a30';
    if (c === PC.hakama)   return '#1a1008';
    if (c === PC.hakama_sh)return '#100a04';
    return c;
  }));
}

// ─── 렌더러 ───────────────────────────────────────────────
function renderGrid(grid, ps, flipped) {
  const cols = grid[0].length, rows = grid.length;
  const w = cols*ps, h = rows*ps;
  let html = `<div class="pixel-char" style="width:${w}px;height:${h}px;${flipped?'transform:scaleX(-1);':''}position:relative;image-rendering:pixelated;">`;
  for (let ry=0; ry<rows; ry++) {
    const row = grid[ry]; let cx=0;
    while (cx < cols) {
      const color = row[cx];
      if (!color) { cx++; continue; }
      let run=1;
      while (cx+run < cols && row[cx+run]===color) run++;
      html += `<div style="position:absolute;left:${cx*ps}px;top:${ry*ps}px;width:${run*ps}px;height:${ps}px;background:${color};"></div>`;
      cx += run;
    }
  }
  return html + '</div>';
}

// ─── 캐릭터 클래스 ────────────────────────────────────────
class PixelCharacter {
  constructor(el, opts={}) {
    this.el = el;
    this.ps = opts.pixelSize || 5;
    this.flipped = !!opts.flipped;
    this.isOpp = !!opts.opponent;
    this.animating = false;
    this.timer = null;
    this.idle();
  }

  _g(key) {
    if (this.isOpp) return buildOppGrid();
    const map = {
      idle: IDLE,
      men_up: MEN_UP, men_hit: MEN_HIT,
      kote_up: KOTE_UP, kote_hit: KOTE_HIT,
      do_up: DO_UP, do_hit: DO_HIT,
      tsuki_up: TSUKI_UP, tsuki_hit: TSUKI_HIT,
    };
    return map[key] || IDLE;
  }

  render(key) {
    this.el.innerHTML = renderGrid(this._g(key), this.ps, this.flipped);
  }

  idle() {
    if (this.timer) { clearTimeout(this.timer); this.timer=null; }
    this.animating = false;
    this.render('idle');
  }

  strike(type, onImpact, onDone) {
    if (this.animating) return;
    this.animating = true;
    const t = type||'men';
    const flip = (t==='kote') || (t==='do');
    if (flip && !this.flipped) this.el.querySelector('.pixel-char')?.style && (this.el.style.filter='brightness(1.1)');

    this.render(`${t}_up`);
    if (t==='kote'||t==='do') {
      const pc = this.el.querySelector('.pixel-char');
      if (pc && !this.flipped) pc.style.transform='scaleX(-1)';
    }

    this.timer = setTimeout(() => {
      this.render(`${t}_hit`);
      if (onImpact) onImpact();
      this.timer = setTimeout(() => {
        this.el.style.filter = '';
        const pc = this.el.querySelector('.pixel-char');
        if (pc && !this.flipped) pc.style.transform = '';
        this.idle();
        if (onDone) onDone();
      }, 200);
    }, 150);
  }

  hurt() {
    this.el.style.animation = 'none';
    void this.el.offsetWidth;
    this.el.style.animation = 'charShake .3s ease';
    setTimeout(() => this.el.style.animation = '', 350);
  }

  celebrate() {
    let n=0;
    const iv = setInterval(() => {
      this.render(n%2===0 ? 'men_up' : 'idle');
      if (++n >= 8) { clearInterval(iv); this.idle(); }
    }, 200);
  }
}

// ─── 플로팅 텍스트 ─────────────────────────────────────────
function showFloatingText(el, text, x, y, color) {
  const d = document.createElement('div');
  d.style.cssText = `position:absolute;left:${x}px;top:${y}px;font-family:'Courier New',monospace;font-weight:900;font-size:12px;color:${color||'#e8c468'};text-shadow:0 0 8px ${color||'#e8c468'},0 1px 2px #000;pointer-events:none;z-index:50;animation:floatUp 1s ease-out forwards;white-space:nowrap;`;
  d.textContent = text;
  el.appendChild(d);
  setTimeout(() => d.remove(), 1050);
}

function showHitSpark(el, x, y, color) {
  const w = document.createElement('div');
  w.style.cssText = `position:absolute;left:${x}px;top:${y}px;pointer-events:none;z-index:45;`;
  const cols = color ? [color,'#fff',color] : ['#e8c468','#fff','#f0a030'];
  [[0,-16],[12,-10],[-12,-10],[16,0],[-16,0],[8,14],[-8,14],[0,18]].forEach(([dx,dy],i)=>{
    const p = document.createElement('div');
    p.style.cssText = `position:absolute;width:${4+i%2*2}px;height:${4+i%2*2}px;border-radius:50%;background:${cols[i%3]};transform:translate(${dx}px,${dy}px);animation:floatUp .45s ease-out ${i*18}ms forwards;`;
    w.appendChild(p);
  });
  el.appendChild(w);
  setTimeout(()=>w.remove(), 550);
}
