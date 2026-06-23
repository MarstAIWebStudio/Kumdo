// ============================================================
// KENDO GAME - GAME DATA v3
// ============================================================

// ─── 무기 시스템 ──────────────────────────────────────────
const WEAPONS = {
  shinai: {
    id: 'shinai', ko: '죽도', icon: '⚔️',
    desc: '검도의 기본 수련 도구. 균형잡힌 성장.',
    unlock: null, // 처음부터 사용 가능
    color: '#c8a040',
    strikes: [
      { id:'men',   ko:'머리치기', icon:'⬆️', trainStat:'str', trainFoc:'foc', desc:'머리를 위에서 아래로 내려침. 기술력·집중력 상승.' },
      { id:'kote',  ko:'손목치기', icon:'⬅️', trainStat:'spd', trainFoc:'foc', desc:'상대 손목을 빠르게 노림. 속도·집중력 상승.' },
      { id:'do',    ko:'허리치기', icon:'➡️', trainStat:'hp',  trainFoc:'men', desc:'옆구리를 대각선으로 벰. 체력·정신력 상승.' },
      { id:'tsuki', ko:'찌르기',  icon:'⬇️', trainStat:'foc', trainFoc:'men', desc:'목을 정면으로 찌름. 집중력·정신력 상승.' },
    ],
    skills: ['men_basic','kote_basic','do_basic','tsuki_basic','renzoku','feint','harai','nuki','mushin','zanshin','kiai','hissatsu'],
  },
  bokken: {
    id: 'bokken', ko: '목도', icon: '🪵',
    desc: '나무로 만든 검. 강인한 힘 위주의 수련.',
    unlock: { dan: 2 },
    color: '#8B4513',
    strikes: [
      { id:'kiri_age',  ko:'올려베기',   icon:'↗️', trainStat:'str', trainFoc:'hp',  desc:'아래서 위로 강하게 벰. 기술력·체력 상승.' },
      { id:'kiri_sage', ko:'내려베기',   icon:'↘️', trainStat:'hp',  trainFoc:'str', desc:'위에서 힘껏 내려침. 체력·기술력 상승.' },
      { id:'yoko_men',  ko:'옆머리치기', icon:'↔️', trainStat:'spd', trainFoc:'men', desc:'측면에서 머리를 벰. 속도·정신력 상승.' },
      { id:'uke_gaeshi', ko:'막기반격',  icon:'🔄', trainStat:'men', trainFoc:'foc', desc:'상대 공격을 막고 즉시 반격. 정신력·집중력 상승.' },
    ],
    skills: ['kiri_basic','yoko_basic','uke_basic','pressure','suriage','debana','gyaku','mokuso'],
  },
  katana: {
    id: 'katana', ko: '일본도', icon: '🗡️',
    desc: '날카로운 진검. 빠르고 정확한 베기 특화.',
    unlock: { dan: 4 },
    color: '#e8e8f0',
    strikes: [
      { id:'kesa_giri', ko:'빗베기',     icon:'↗️', trainStat:'str', trainFoc:'spd', desc:'어깨에서 허리로 빗겨 벰. 기술력·속도 상승.' },
      { id:'gyaku_kesa',ko:'역빗베기',   icon:'↙️', trainStat:'spd', trainFoc:'str', desc:'반대 방향 빗베기. 속도·기술력 상승.' },
      { id:'tsuki_jin', ko:'빠른찌르기', icon:'⚡', trainStat:'foc', trainFoc:'spd', desc:'번개같은 찌르기. 집중력·속도 상승.' },
      { id:'nuki_uchi', ko:'역수베기',   icon:'🌀', trainStat:'men', trainFoc:'foc', desc:'역방향 손목으로 베기. 정신력·집중력 상승.' },
    ],
    skills: ['kesa_basic','gyaku_basic','tsuki_jin_basic','nuki_basic','iaijutsu','sen_no_sen','go_no_sen','shinken'],
  },
  nito: {
    id: 'nito', ko: '쌍검', icon: '⚔️⚔️',
    desc: '두 자루 검. 복잡하고 화려한 연속기 특화.',
    unlock: { dan: 6 },
    color: '#9b59b6',
    strikes: [
      { id:'rendo',      ko:'연속베기',   icon:'⚡', trainStat:'spd', trainFoc:'str', desc:'양손으로 연속 공격. 속도·기술력 상승.' },
      { id:'tasuki',     ko:'교차공격',   icon:'✖️', trainStat:'str', trainFoc:'spd', desc:'두 검을 교차해 공격. 기술력·속도 상승.' },
      { id:'kaiten',     ko:'회전베기',   icon:'🌀', trainStat:'men', trainFoc:'hp',  desc:'회전하며 넓게 벰. 정신력·체력 상승.' },
      { id:'nito_tsuki', ko:'이중찌르기', icon:'💥', trainStat:'foc', trainFoc:'men', desc:'양손으로 동시에 찌름. 집중력·정신력 상승.' },
    ],
    skills: ['rendo_basic','tasuki_basic','kaiten_basic','nito_tsuki_basic','musou','enbu','shinpi','tenku'],
  },
};

// 현재 선택된 무기 (gameState에서 관리)
const WEAPON_LIST = Object.values(WEAPONS);

// 전체 스킬 풀 (무기별로 분리)
const SKILLS_BY_WEAPON = {
  shinai: [
    { id:'men_basic',   tier:'basic',    ko:'머리치기',      icon:'⬆️', unlock:{ men_hits:20 },    effect_ko:'머리 공격력 +15%',     how_ko:'수련장에서 머리치기 선택 후 수련. 대회에서 머리 공격으로 사용.' },
    { id:'kote_basic',  tier:'basic',    ko:'손목치기',      icon:'⬅️', unlock:{ kote_hits:20 },   effect_ko:'속도 +15%',            how_ko:'수련장에서 손목치기 선택 후 수련. 대회에서 손목 공격으로 사용.' },
    { id:'do_basic',    tier:'basic',    ko:'허리치기',      icon:'➡️', unlock:{ do_hits:20 },     effect_ko:'체력 +15%',            how_ko:'수련장에서 몸통치기 선택 후 수련. 대회에서 측면 공격으로 사용.' },
    { id:'tsuki_basic', tier:'basic',    ko:'찌르기',        icon:'⬇️', unlock:{ tsuki_hits:20 },  effect_ko:'집중력 +15%',          how_ko:'수련장에서 찌르기 선택 후 수련. 대회에서 빠른 찌르기로 사용.' },
    { id:'renzoku',     tier:'advanced', ko:'연속 공격',     icon:'⚡', unlock:{ men_hits:100, kote_hits:100 }, effect_ko:'대회에서 2연속 공격', how_ko:'대회 전투 스킬 슬롯에서 사용. 2회 연속 타격.' },
    { id:'feint',       tier:'advanced', ko:'속임 동작',     icon:'👁️', unlock:{ foc:150 },         effect_ko:'상대 방어 무력화 확률 +30%', how_ko:'대회 전투에서 방어 직후 사용.' },
    { id:'harai',       tier:'advanced', ko:'죽도 쳐내기',   icon:'💥', unlock:{ str:200 },         effect_ko:'상대 공격 튕겨내고 카운터', how_ko:'상대 공격 타이밍에 사용.' },
    { id:'nuki',        tier:'advanced', ko:'피한 후 반격',  icon:'🌀', unlock:{ spd:200 },         effect_ko:'회피 후 데미지 +50%',  how_ko:'이동 후 즉시 사용.' },
    { id:'mushin',      tier:'special',  ko:'무아지경',      icon:'☯️', unlock:{ total_train:600 }, effect_ko:'모든 스탯 +50% (10초)', how_ko:'체력 20% 이하 시 자동 발동.' },
    { id:'zanshin',     tier:'special',  ko:'잔상 베기',     icon:'🌑', unlock:{ tournament_wins:3 }, effect_ko:'타격 후 추가 데미지', how_ko:'머리치기 성공 후 자동 발동.' },
    { id:'kiai',        tier:'special',  ko:'기합 일격',     icon:'🔊', unlock:{ dan:5 },            effect_ko:'한판 확률 2배',        how_ko:'스킬 슬롯에서 선택. 3라운드당 1회.' },
    { id:'hissatsu',    tier:'special',  ko:'필살의 한 칼',  icon:'💫', unlock:{ master_training:5 }, effect_ko:'즉시 한판 승', how_ko:'경기당 1회만 사용 가능.', secret:true },
  ],
  bokken: [
    { id:'kiri_basic',  tier:'basic',    ko:'올려베기',      icon:'↗️', unlock:{ kiri_age_hits:20 },  effect_ko:'체력·기술력 +15%',    how_ko:'목도 수련 시 올려베기 선택 후 수련.' },
    { id:'yoko_basic',  tier:'basic',    ko:'옆머리치기',    icon:'↔️', unlock:{ yoko_men_hits:20 },  effect_ko:'속도 +15%',           how_ko:'목도 수련 시 옆머리치기 선택 후 수련.' },
    { id:'uke_basic',   tier:'basic',    ko:'막기반격',      icon:'🔄', unlock:{ uke_gaeshi_hits:20 }, effect_ko:'방어력 +20%',         how_ko:'목도 수련 시 막기반격 선택 후 수련.' },
    { id:'pressure',    tier:'advanced', ko:'압박 공격',     icon:'⚖️', unlock:{ kiri_age_hits:80, yoko_men_hits:80 }, effect_ko:'상대 회피 불가 1라운드', how_ko:'대회에서 연속 공격 후 사용.' },
    { id:'suriage',     tier:'advanced', ko:'미끄러져 올리기',icon:'🌊', unlock:{ men:150 },          effect_ko:'상대 무기 들어올리고 공격', how_ko:'상대 방어 중 사용하면 방어 무력화.' },
    { id:'debana',      tier:'advanced', ko:'선제 타격',     icon:'⚡', unlock:{ spd:180 },           effect_ko:'상대 공격 직전 선제 반격', how_ko:'상대가 공격 시작하는 순간 자동 발동.' },
    { id:'gyaku',       tier:'special',  ko:'역타격',        icon:'🔁', unlock:{ total_train:500 },   effect_ko:'역방향 강타, 데미지 2배', how_ko:'막기반격 직후 사용 시 발동.' },
    { id:'mokuso',      tier:'special',  ko:'묵상',          icon:'🧘', unlock:{ dan:4 },             effect_ko:'HP 30% 회복',          how_ko:'경기 중 1회 사용 가능.' },
  ],
  katana: [
    { id:'kesa_basic',     tier:'basic',    ko:'빗베기',       icon:'↗️', unlock:{ kesa_giri_hits:20 },  effect_ko:'기술력·속도 +15%',   how_ko:'일본도 수련 시 빗베기 선택 후 수련.' },
    { id:'gyaku_basic',    tier:'basic',    ko:'역빗베기',     icon:'↙️', unlock:{ gyaku_kesa_hits:20 }, effect_ko:'속도 +20%',          how_ko:'일본도 수련 시 역빗베기 선택 후 수련.' },
    { id:'tsuki_jin_basic',tier:'basic',    ko:'빠른찌르기',   icon:'⚡', unlock:{ tsuki_jin_hits:20 },  effect_ko:'집중력 +20%',        how_ko:'일본도 수련 시 빠른찌르기 선택 후 수련.' },
    { id:'nuki_basic',     tier:'basic',    ko:'역수베기',     icon:'🌀', unlock:{ nuki_uchi_hits:20 },  effect_ko:'정신력 +15%',        how_ko:'일본도 수련 시 역수베기 선택 후 수련.' },
    { id:'iaijutsu',       tier:'advanced', ko:'거합술',       icon:'⚔️', unlock:{ tsuki_jin_hits:80, kesa_giri_hits:80 }, effect_ko:'선빵 공격, 명중 시 즉시 1점', how_ko:'라운드 시작 직후 사용하면 발동.' },
    { id:'sen_no_sen',     tier:'advanced', ko:'선의 선',      icon:'🎯', unlock:{ foc:200 },           effect_ko:'상대 공격 예측 후 선제 반격', how_ko:'상대 공격 타이밍 직전 자동 감지.' },
    { id:'go_no_sen',      tier:'advanced', ko:'후의 선',      icon:'🛡️', unlock:{ men:180 },           effect_ko:'받은 후 강력 반격 데미지 2배', how_ko:'피격 후 1라운드 안에 사용.' },
    { id:'shinken',        tier:'special',  ko:'진검승부',     icon:'💎', unlock:{ dan:6, tournament_wins:8 }, effect_ko:'모든 공격 치명타 확률 100%', how_ko:'경기당 1회. 다음 공격 반드시 급소.' },
  ],
  nito: [
    { id:'rendo_basic',      tier:'basic',    ko:'연속베기',    icon:'⚡', unlock:{ rendo_hits:20 },     effect_ko:'속도·기술력 +15%',   how_ko:'쌍검 수련 시 연속베기 선택 후 수련.' },
    { id:'tasuki_basic',     tier:'basic',    ko:'교차공격',    icon:'✖️', unlock:{ tasuki_hits:20 },    effect_ko:'기술력 +20%',        how_ko:'쌍검 수련 시 교차공격 선택 후 수련.' },
    { id:'kaiten_basic',     tier:'basic',    ko:'회전베기',    icon:'🌀', unlock:{ kaiten_hits:20 },    effect_ko:'정신력·체력 +15%',   how_ko:'쌍검 수련 시 회전베기 선택 후 수련.' },
    { id:'nito_tsuki_basic', tier:'basic',    ko:'이중찌르기',  icon:'💥', unlock:{ nito_tsuki_hits:20 },effect_ko:'집중력·정신력 +15%', how_ko:'쌍검 수련 시 이중찌르기 선택 후 수련.' },
    { id:'musou',            tier:'advanced', ko:'무쌍난무',    icon:'🌪️', unlock:{ rendo_hits:100, tasuki_hits:100 }, effect_ko:'5연속 공격', how_ko:'스킬 슬롯에서 선택. 5회 연속 타격.' },
    { id:'enbu',             tier:'advanced', ko:'원무',        icon:'💫', unlock:{ spd:220 },           effect_ko:'360도 회전 전체 공격', how_ko:'사용 시 상대 방어 무시하고 공격.' },
    { id:'shinpi',           tier:'special',  ko:'신비의 검무', icon:'✨', unlock:{ total_train:800 },  effect_ko:'아군 HP 완전 회복 + 공격력 2배', how_ko:'HP 10% 이하 시 자동 발동. 경기당 1회.' },
    { id:'tenku',            tier:'special',  ko:'천공검',      icon:'🌌', unlock:{ dan:8 },             effect_ko:'하늘에서 내려치는 필살기. 즉시 3점', how_ko:'경기당 1회. 단 8 이상만 사용 가능.', secret:true },
  ],
};

// 현재 무기의 스킬 가져오기
function getWeaponSkills(weaponId) {
  return SKILLS_BY_WEAPON[weaponId] || SKILLS_BY_WEAPON.shinai;
}

// 전체 스킬 (모든 무기)
const ALL_SKILLS = Object.values(SKILLS_BY_WEAPON).flat();

// 하위 호환용
const SKILLS = SKILLS_BY_WEAPON.shinai;

const STATS = {
  hp:  { id:'hp',  ko:'체력',   color:'#e74c3c' },
  str: { id:'str', ko:'기술력', color:'#3498db' },
  men: { id:'men', ko:'정신력', color:'#9b59b6' },
  spd: { id:'spd', ko:'속도',   color:'#2ecc71' },
  foc: { id:'foc', ko:'집중력', color:'#f39c12' },
};

const DAN_RANKS = [
  { dan:0, title_ko:'무단',  req:{ total:0 } },
  { dan:1, title_ko:'초단',  req:{ total:200,  tournament:0 } },
  { dan:2, title_ko:'이단',  req:{ total:500,  tournament:1 } },
  { dan:3, title_ko:'삼단',  req:{ total:1000, tournament:2 } },
  { dan:4, title_ko:'사단',  req:{ total:2000, tournament:4 } },
  { dan:5, title_ko:'오단',  req:{ total:3500, tournament:6 } },
  { dan:6, title_ko:'육단',  req:{ total:5500, tournament:9 } },
  { dan:7, title_ko:'칠단',  req:{ total:8000, tournament:13 } },
  { dan:8, title_ko:'팔단',  req:{ total:11500,tournament:18 } },
  { dan:9, title_ko:'구단',  req:{ total:16000,tournament:24 } },
];

const TIERS = {
  normal:   { ko:'노멀',        color:'#9a97a3', glow:'rgba(154,151,163,0.3)', mult:1.0  },
  genuine:  { ko:'정품',        color:'#4caf50', glow:'rgba(76,175,80,0.4)',   mult:1.8  },
  delicate: { ko:'섬세한 손길', color:'#3498db', glow:'rgba(52,152,219,0.4)', mult:3.0  },
  artisan:  { ko:'장인의 손길', color:'#9b59b6', glow:'rgba(155,89,182,0.45)',mult:5.0  },
  legend:   { ko:'레전드',      color:'#e8c468', glow:'rgba(232,196,104,0.6)',mult:8.5  },
};

const EQUIPMENT_SLOTS = {
  weapon: { ko:'무기', icon:'⚔️' },
  helm:   { ko:'투구', icon:'⛑️' },
  armor:  { ko:'갑옷', icon:'🛡️' },
  gi:     { ko:'도복', icon:'👘' },
  gloves: { ko:'장갑', icon:'🧤' },
  boots:  { ko:'신발', icon:'👢' },
};

function makeItems(slot, baseStats, basePrices) {
  return Object.entries(TIERS).map(([tier, tdata]) => ({
    id: `${slot}_${tier}`,
    slot, tier,
    ko: `${tdata.ko} ${EQUIPMENT_SLOTS[slot].ko}`,
    icon: EQUIPMENT_SLOTS[slot].icon,
    stats: Object.fromEntries(Object.entries(baseStats).map(([k,v])=>[k, Math.round(v * tdata.mult)])),
    price: basePrices[tier],
    box_price: Math.round(basePrices[tier] * 0.65),
  }));
}

const EQUIPMENT = {
  weapon: makeItems('weapon', { str:8, spd:4 }, { normal:800, genuine:2500, delicate:7000, artisan:18000, legend:55000 }),
  helm:   makeItems('helm',   { hp:10, men:5 }, { normal:600, genuine:2000, delicate:5500, artisan:15000, legend:45000 }),
  armor:  makeItems('armor',  { hp:15, men:8 }, { normal:1000,genuine:3000, delicate:8500, artisan:22000, legend:65000 }),
  gi:     makeItems('gi',     { men:6, foc:4 }, { normal:500, genuine:1800, delicate:5000, artisan:13000, legend:40000 }),
  gloves: makeItems('gloves', { spd:6, foc:5 }, { normal:400, genuine:1500, delicate:4000, artisan:11000, legend:35000 }),
  boots:  makeItems('boots',  { spd:8, hp:5  }, { normal:450, genuine:1600, delicate:4500, artisan:12000, legend:38000 }),
};

const BOXES = Object.entries(TIERS).map(([tier, tdata]) => ({
  id: `box_${tier}`, tier,
  ko: `${tdata.ko} 장비 상자`, icon: '📦',
  price: Math.round(Object.values(EQUIPMENT).flat().find(i=>i.tier===tier)?.box_price || 500),
}));

const SET_BONUSES = [
  { set:['weapon_legend','armor_legend','gi_legend'], name_ko:'전설의 검사 세트', bonus:{ all:2.0 } },
  { set:['weapon_artisan','armor_artisan','gi_artisan'], name_ko:'장인 세트', bonus:{ str:1.5, hp:1.5 } },
];

const NPC_MASTERS = [{
  id:'master_1', name_ko:'무사시 선생',
  quotes_ko:['검도는 마음의 수련이다.','속도보다 정확함이 먼저다.','오늘도 열심히 하거라.','그것이 바로 검의 길이다.','천 번의 수련이 검을 만든다.','두려움을 없애는 것이 수련이다.','무기가 달라도 마음은 하나다.'],
}];

const TOURNAMENT_STAGES = [
  { id:'local',    ko:'지역 대회',  req_dan:1, ai_power:0.28, prize:1500,  icon:'🏯', desc:'첫 번째 관문. 지역 검도인들과 겨룹니다.' },
  { id:'city',     ko:'시 대회',    req_dan:2, ai_power:0.45, prize:4000,  icon:'🏟️', desc:'시를 대표하는 강자들이 모입니다.' },
  { id:'regional', ko:'도 대회',    req_dan:4, ai_power:0.62, prize:12000, icon:'⛩️', desc:'도 최강을 가리는 대회입니다.' },
  { id:'national', ko:'전국 대회',  req_dan:6, ai_power:0.82, prize:50000, icon:'👑', desc:'전국 최강자를 가리는 최후의 무대입니다.' },
  { id:'world', ko:'전국 대회',  req_dan:6, ai_power:0.82, prize:50000, icon:'👑', desc:'전국 최강자를 가리는 최후의 무대입니다.', is_final:true },
];

const TOURNAMENT_OPPONENTS = {
  local:    [
    { name_ko:'박민수', power:0.22, dan:1, quote_ko:'열심히 해봐!',     hp:400 },
    { name_ko:'이수진', power:0.28, dan:1, quote_ko:'질 수 없어!',      hp:450 },
    { name_ko:'최강준', power:0.34, dan:2, quote_ko:'자신 있나?',       hp:510 },
  ],
  city: [
    { name_ko:'한무도', power:0.42, dan:2, quote_ko:'시 대표다!',        hp:620 },
    { name_ko:'강검사', power:0.48, dan:3, quote_ko:'검도는 내 인생.',   hp:705 },
    { name_ko:'오달인', power:0.54, dan:3, quote_ko:'가볍게 보지 마라.', hp:800 },
  ],
  regional: [
    { name_ko:'김승후', power:0.60, dan:5, quote_ko:'도 최강이다.',    hp:820 },
    { name_ko:'도 챔피언 윤', power:0.67, dan:6, quote_ko:'철의 의지!',      hp:860 },
    { name_ko:'흑룡 서',      power:0.74, dan:6, quote_ko:'흑룡의 검!',      hp:900 },
  ],
  national: [
    { name_ko:'전국 강자 정', power:0.80, dan:7, quote_ko:'전국 최강을 꿈꾸나?',      hp:930 },
    { name_ko:'검성 이도',    power:0.88, dan:8, quote_ko:'검성의 경지를 보여주마.',  hp:990 },
    { name_ko:'미야모토 켄',  power:0.96, dan:9, quote_ko:'나를 넘을 수 있겠느냐.',  hp:1100 },
  ],
  world: [
    { name_ko:'켄지', power:0.80, dan:7, quote_ko:'미안한데, 내가 우승해줄게.',      hp:1300 },
    { name_ko:'레이',    power:0.88, dan:8, quote_ko:'you cannot win',  hp:1800 },
    { name_ko:'???',  power:0.96, dan:9, quote_ko:'이길 수 있겠어?',  hp:2200, is_final_boss:true },
  ],
};

const BATTLE_ACTIONS = [
  { id:'attack_1', ko:'머리치기',  icon:'⬆️', hit_rate:0.72, dmg_mult:1.0,  type:'attack' },
  { id:'attack_2', ko:'손목치기',  icon:'⬅️', hit_rate:0.80, dmg_mult:0.8,  type:'attack' },
  { id:'attack_3', ko:'허리치기',  icon:'➡️', hit_rate:0.60, dmg_mult:1.4,  type:'attack' },
  { id:'attack_4', ko:'찌르기',   icon:'⬇️', hit_rate:0.85, dmg_mult:0.7,  type:'attack' },
  { id:'guard',    ko:'방어',      icon:'🛡️', hit_rate:1.0,  dmg_mult:0,    type:'guard'  },
  { id:'dodge',    ko:'회피',      icon:'💨', hit_rate:0.55, dmg_mult:0,    type:'dodge'  },
];

const ACHIEVEMENTS = [
  { id:'first_strike',   ko:'첫 수련',        icon:'⚔️', req:{ total_hits:1 },        reward:{ gold:50 } },
  { id:'train_100',      ko:'백 번 수련',      icon:'💪', req:{ total_hits:100 },      reward:{ gold:300 } },
  { id:'train_1000',     ko:'천 번 수련',      icon:'🔥', req:{ total_hits:1000 },     reward:{ gold:1500 } },
  { id:'train_10000',    ko:'만 번 수련',      icon:'⭐', req:{ total_hits:10000 },    reward:{ gold:8000 } },
  { id:'stat_500',       ko:'스탯 500 돌파',   icon:'📊', req:{ stat_total:500 },      reward:{ gold:800 } },
  { id:'stat_2000',      ko:'스탯 2000 돌파',  icon:'📈', req:{ stat_total:2000 },     reward:{ gold:3000 } },
  { id:'first_win',      ko:'첫 승리',         icon:'🏆', req:{ tournament_wins:1 },   reward:{ gold:800 } },
  { id:'win_10',         ko:'대회 10승',        icon:'👑', req:{ tournament_wins:10 },  reward:{ gold:5000 } },
  { id:'national_champ', ko:'전국 챔피언',      icon:'🌏', req:{ national_wins:1 },     reward:{ gold:30000 } },
  { id:'first_equip',    ko:'첫 장비 구매',    icon:'🛡️', req:{ equip_bought:1 },      reward:{ gold:200 } },
  { id:'first_skill',    ko:'첫 기술 해금',    icon:'🌟', req:{ skills_count:1 },      reward:{ gold:500 } },
  { id:'all_basics',     ko:'기본기 완성',      icon:'✅', req:{ skills_count:4 },      reward:{ gold:2000 } },
  { id:'weapon_bokken',  ko:'목도 해금',        icon:'🪵', req:{ dan:2 },               reward:{ gold:1000 } },
  { id:'weapon_katana',  ko:'일본도 해금',      icon:'🗡️', req:{ dan:4 },               reward:{ gold:3000 } },
  { id:'weapon_nito',    ko:'쌍검 해금',        icon:'⚔️', req:{ dan:6 },               reward:{ gold:8000 } },
  { id:'master_5',       ko:'스승 훈련 5회',   icon:'🥋', req:{ master_training:5 },   reward:{ gold:1000 } },
  { id:'first_dan',      ko:'초단 달성',        icon:'🥋', req:{ dan:1 },               reward:{ gold:1000 } },
  { id:'fifth_dan',      ko:'오단 달성',        icon:'🥋', req:{ dan:5 },               reward:{ gold:5000 } },
  { id:'ninth_dan',      ko:'구단 달성',        icon:'👑', req:{ dan:9 },               reward:{ gold:50000 } },
];

const DAILY_MISSIONS = [
  { id:'train_30',    ko:'오늘 30번 수련',       req:{ daily_hits:30 },       reward:{ gold:150 } },
  { id:'train_100',   ko:'오늘 100번 수련',      req:{ daily_hits:100 },      reward:{ gold:500 } },
  { id:'all_strikes', ko:'4가지 부위 모두 치기', req:{ all_strikes:true },    reward:{ gold:300 } },
  { id:'tournament',  ko:'대회 1번 참가',         req:{ daily_tournament:1 },  reward:{ gold:800 } },
];

const WEEKLY_CHALLENGES = [
  { id:'w_train_500', ko:'이번 주 500번 수련',  req:{ weekly_hits:500 }, reward:{ gold:2000 } },
  { id:'w_win_2',     ko:'이번 주 대회 2승',    req:{ weekly_wins:2 },   reward:{ gold:5000 } },
  { id:'w_skill',     ko:'이번 주 기술 해금',   req:{ weekly_skills:1 }, reward:{ gold:3000 } },
];

const BACKGROUNDS = [
  { id:'dojo_day',     ko:'도장 (낮)',    color1:'#1a0f08', color2:'#2d1d10' },
  { id:'dojo_night',   ko:'도장 (밤)',    color1:'#08070f', color2:'#13101f' },
  { id:'outdoor_day',  ko:'야외 (낮)',    color1:'#0c180c', color2:'#163018' },
  { id:'outdoor_night',ko:'야외 (밤)',    color1:'#06080a', color2:'#0a1218' },
  { id:'arena',        ko:'경기장',       color1:'#1a0a08', color2:'#301410' },
  { id:'mountain',     ko:'산속 도장',    color1:'#0a1208', color2:'#162010' },
];

const TRAIN_GOLD_CHANCE  = 0.08;
const TRAIN_GOLD_AMOUNT  = [1, 3];
const MASTER_TRAIN_COST  = 2000;
const MASTER_TRAIN_BOOST = 2.0;
const MASTER_TRAIN_HITS  = 15;

function todayKey(){ const d=new Date(); return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`; }
function weekKey(){ const d=new Date(); const j=new Date(d.getFullYear(),0,1); return `${d.getFullYear()}-${Math.ceil((((d-j)/86400000)+j.getDay()+1)/7)}`; }

function freshPlayer(name, uid) {
  const starter = {};
  Object.keys(EQUIPMENT_SLOTS).forEach(slot => { starter[slot] = `${slot}_normal`; });
  return {
    uid: uid||null, name: name||'검도인',
    title:'beginner', dan:0,
    stats:{ hp:10, str:10, men:10, spd:10, foc:10 },
    stat_points:0, gold:500, gems:5,
    total_hits:0, daily_hits:0, weekly_hits:0,
    hits_by_type:{},          // 무기별로 동적으로 추가됨
    current_weapon:'shinai',  // 현재 선택 무기
    unlocked_weapons:['shinai'],
    skills_unlocked:[],
    equipped: starter,
    equipment_owned: Object.keys(EQUIPMENT_SLOTS).map(s=>`${s}_normal`),
    equipment_enhanced:{},
    achievements_unlocked:[], tournament_wins:0, national_wins:0,
    tournament_history:[], last_tournament_week:{},
    daily_missions_done:[], weekly_done:[], weekly_skill_unlocked:0,
    daily_missions_progress:{}, train_log:[], memo:[],
    train_efficiency:1.0, eff_boost_remaining:0,
    background:'dojo_night', accent_color:'#e8c468', language:'ko',
    season_points:0, created_at:Date.now(),
    last_day_key:todayKey(), last_week_key:weekKey(),
    master_training_count:0, sound_enabled:true,
    login_streak:1, last_login_day:todayKey(), equip_bought:0,
  };
}
