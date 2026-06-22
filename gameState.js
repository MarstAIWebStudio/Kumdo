// ============================================================
// GAME STATE v3 - 무기 시스템 + 버그 수정
// ============================================================

let player = null;
let _subs = [];

function subscribe(fn) { _subs.push(fn); }
function notify() { _subs.forEach(fn => fn(player)); saveGame(player); }
function getPlayer() { return player; }

function initPlayer(data) {
  const template = freshPlayer(data.name, data.uid);
  for (const k of Object.keys(template)) {
    if (data[k] === undefined) data[k] = template[k];
  }
  // hits_by_type 없으면 초기화
  if (!data.hits_by_type || typeof data.hits_by_type !== 'object') data.hits_by_type = {};
  if (!data.current_weapon) data.current_weapon = 'shinai';
  if (!data.unlocked_weapons) data.unlocked_weapons = ['shinai'];
  player = data;
  checkDailyWeeklyReset();
  checkLoginStreak();
  checkWeaponUnlocks();
}

// ─── 날짜 리셋 ────────────────────────────────────────────
function checkDailyWeeklyReset() {
  const tk = todayKey(), wk = weekKey();
  if (player.last_day_key !== tk) {
    player.daily_hits = 0;
    player.daily_missions_done = [];
    player.daily_missions_progress = {};
    player.last_day_key = tk;
  }
  if (player.last_week_key !== wk) {
    player.weekly_hits = 0;
    player.weekly_done = [];
    player.weekly_skill_unlocked = 0;
    player.last_week_key = wk;
  }
}

function checkLoginStreak() {
  const today = todayKey();
  if (player.last_login_day === today) return;
  const d = new Date(); d.setDate(d.getDate()-1);
  const yesterday = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
  player.login_streak = player.last_login_day === yesterday ? (player.login_streak||0)+1 : 1;
  player.last_login_day = today;
}

// ─── 무기 해금 체크 ───────────────────────────────────────
function checkWeaponUnlocks() {
  for (const w of WEAPON_LIST) {
    if (!w.unlock) continue;
    if (player.unlocked_weapons.includes(w.id)) continue;
    if (w.unlock.dan !== undefined && player.dan >= w.unlock.dan) {
      player.unlocked_weapons.push(w.id);
    }
  }
}

function switchWeapon(weaponId) {
  if (!player.unlocked_weapons.includes(weaponId)) return false;
  player.current_weapon = weaponId;
  notify();
  return true;
}

function getCurrentWeapon() {
  return WEAPONS[player.current_weapon] || WEAPONS.shinai;
}

// ─── 스탯 ─────────────────────────────────────────────────
function statTotal() { return Object.values(player.stats).reduce((a,b)=>a+b,0); }

function getEquipBonus() {
  const bonus = { hp:0, str:0, men:0, spd:0, foc:0 };
  for (const slot of Object.keys(EQUIPMENT_SLOTS)) {
    const id = player.equipped[slot];
    if (!id) continue;
    const item = (EQUIPMENT[slot]||[]).find(i=>i.id===id);
    if (!item) continue;
    const enh = (player.equipment_enhanced[id]||0);
    const mult = 1 + enh * 0.12;
    for (const [k,v] of Object.entries(item.stats||{})) bonus[k] = (bonus[k]||0) + v*mult;
  }
  return bonus;
}

// ─── 단수 ─────────────────────────────────────────────────
function getDanProgress() {
  const cur = DAN_RANKS[player.dan] || DAN_RANKS[0];
  const next = DAN_RANKS[player.dan+1];
  const total = statTotal();
  if (!next) return { current:cur, next:null, progress:1, statTotal:total };
  const prevReq = cur.req.total;
  const progress = Math.min(1, (total-prevReq)/(next.req.total-prevReq));
  return { current:cur, next, progress, statTotal:total };
}

function checkDanUp() {
  const next = DAN_RANKS[player.dan+1];
  if (!next) return null;
  if (statTotal() >= next.req.total && player.tournament_wins >= (next.req.tournament||0)) {
    player.dan += 1;
    player.stat_points = (player.stat_points||0) + 5;
    checkWeaponUnlocks();
    return next;
  }
  return null;
}

// ─── 스킬 해금 ────────────────────────────────────────────
function checkSkillUnlocks() {
  const weapon = getCurrentWeapon();
  const weaponSkills = getWeaponSkills(weapon.id);
  const newly = [];
  for (const skill of weaponSkills) {
    if (player.skills_unlocked.includes(skill.id)) continue;
    if (_skillMet(skill, weapon.id)) {
      player.skills_unlocked.push(skill.id);
      player.weekly_skill_unlocked = (player.weekly_skill_unlocked||0)+1;
      newly.push(skill);
    }
  }
  return newly;
}

function _skillMet(skill, weaponId) {
  const req = skill.unlock||{}, p = player;
  const w = WEAPONS[weaponId];
  if (!w) return false;

  // 타격 횟수 체크 (무기별 strike id 기반)
  for (const strike of w.strikes) {
    const key = `${strike.id}_hits`;
    if (req[key] !== undefined && (p.hits_by_type[strike.id]||0) < req[key]) return false;
  }
  // 기존 shinai 키도 호환
  if (req.men_hits   !== undefined && (p.hits_by_type.men  ||0) < req.men_hits)   return false;
  if (req.kote_hits  !== undefined && (p.hits_by_type.kote ||0) < req.kote_hits)  return false;
  if (req.do_hits    !== undefined && (p.hits_by_type.do   ||0) < req.do_hits)    return false;
  if (req.tsuki_hits !== undefined && (p.hits_by_type.tsuki||0) < req.tsuki_hits) return false;

  if (req.total_train !== undefined && p.total_hits < req.total_train)             return false;
  if (req.tournament_wins !== undefined && p.tournament_wins < req.tournament_wins)return false;
  if (req.dan !== undefined && p.dan < req.dan)                                    return false;
  if (req.master_training !== undefined && p.master_training_count < req.master_training) return false;
  if (req.foc !== undefined && p.stats.foc < req.foc)                             return false;
  if (req.str !== undefined && p.stats.str < req.str)                             return false;
  if (req.spd !== undefined && p.stats.spd < req.spd)                             return false;
  if (req.men !== undefined && p.stats.men < req.men)                             return false;
  return true;
}

function getSkillProgress(skill) {
  const weapon = getCurrentWeapon();
  const req = skill.unlock||{}, p = player;
  const rows = [];

  for (const strike of weapon.strikes) {
    const key = `${strike.id}_hits`;
    if (req[key] !== undefined) rows.push({ label:`${strike.ko} 횟수`, cur:Math.floor(p.hits_by_type[strike.id]||0), req:req[key] });
  }
  // shinai 하위호환
  const legacyMap = { men_hits:'머리치기', kote_hits:'손목치기', do_hits:'몸통치기', tsuki_hits:'찌르기' };
  for (const [k,label] of Object.entries(legacyMap)) {
    if (req[k] !== undefined && !rows.find(r=>r.label===label+'횟수')) {
      const hitKey = k.replace('_hits','');
      rows.push({ label:`${label} 횟수`, cur:Math.floor(p.hits_by_type[hitKey]||0), req:req[k] });
    }
  }
  if (req.total_train) rows.push({ label:'총 수련', cur:p.total_hits, req:req.total_train });
  if (req.tournament_wins) rows.push({ label:'대회 우승', cur:p.tournament_wins, req:req.tournament_wins });
  if (req.dan) rows.push({ label:'단', cur:p.dan, req:req.dan });
  if (req.master_training) rows.push({ label:'스승 훈련', cur:p.master_training_count, req:req.master_training });
  if (req.foc) rows.push({ label:'집중력', cur:Math.floor(p.stats.foc), req:req.foc });
  if (req.str) rows.push({ label:'기술력', cur:Math.floor(p.stats.str), req:req.str });
  if (req.spd) rows.push({ label:'속도',   cur:Math.floor(p.stats.spd), req:req.spd });
  if (req.men) rows.push({ label:'정신력', cur:Math.floor(p.stats.men), req:req.men });
  return rows;
}

// ─── 훈련 ─────────────────────────────────────────────────
let _lastTrainTime = 0;
const TRAIN_COOLDOWN_MS = 500;

function doTrain(strikeId, xpMult) {
  const now = Date.now();
  if (now - _lastTrainTime < TRAIN_COOLDOWN_MS) return null;
  _lastTrainTime = now;
  if (!player) return null;

  const weapon = getCurrentWeapon();
  const st = weapon.strikes.find(s=>s.id===strikeId);
  if (!st) return null;

  const eff = (player.train_efficiency||1.0) * (xpMult||1.0);
  const baseMain = (1.5 + Math.random()*0.8)*eff;
  const baseSub  = (0.5 + Math.random()*0.4)*eff;
  const gains = {};
  if (st.trainStat === st.trainFoc) {
    gains[st.trainStat] = +(baseMain+baseSub).toFixed(2);
  } else {
    gains[st.trainStat] = +baseMain.toFixed(2);
    gains[st.trainFoc]  = +baseSub.toFixed(2);
  }
  for (const [k,v] of Object.entries(gains)) player.stats[k] = +((player.stats[k]||0)+v).toFixed(2);

  player.total_hits += 1;
  player.daily_hits += 1;
  player.weekly_hits += 1;
  player.hits_by_type[strikeId] = (player.hits_by_type[strikeId]||0)+1;

  const goldGain = Math.random()<TRAIN_GOLD_CHANCE
    ? Math.floor(Math.random()*(TRAIN_GOLD_AMOUNT[1]-TRAIN_GOLD_AMOUNT[0]+1))+TRAIN_GOLD_AMOUNT[0] : 0;
  if (goldGain) player.gold += goldGain;

  player.train_log.unshift({ date:Date.now(), type:strikeId, weapon:weapon.id, gains, gold:goldGain });
  if (player.train_log.length>50) player.train_log.length=50;

  if (player.eff_boost_remaining>0) {
    player.eff_boost_remaining -= 1;
    if (player.eff_boost_remaining===0) player.train_efficiency=1.0;
  }

  const newSkills  = checkSkillUnlocks();
  const newDan     = checkDanUp();
  const newAchieve = checkAchievements();
  notify();
  return { gains, goldGain, newSkills, newDan, newAchieve };
}

function doMasterTraining() {
  if (!player||player.gold<MASTER_TRAIN_COST) return false;
  player.gold -= MASTER_TRAIN_COST;
  player.train_efficiency = MASTER_TRAIN_BOOST;
  player.eff_boost_remaining = MASTER_TRAIN_HITS;
  player.master_training_count = (player.master_training_count||0)+1;
  const newSkills  = checkSkillUnlocks();
  const newAchieve = checkAchievements();
  notify();
  return { newSkills, newAchieve };
}

function tickEfficiency() {
  if (!player||player.eff_boost_remaining>0) return;
  if (player.train_efficiency!==1.0) { player.train_efficiency=1.0; notify(); }
}

function allocateStat(stat, amount) {
  if (!player||(player.stat_points||0)<amount) return false;
  player.stats[stat] = +((player.stats[stat]||0)+amount).toFixed(2);
  player.stat_points -= amount;
  checkSkillUnlocks();
  checkDanUp();
  notify();
  return true;
}

function addMemo(text) {
  if (!player||!text?.trim()) return;
  player.memo.unshift({ date:Date.now(), text:text.trim() });
  if (player.memo.length>50) player.memo.length=50;
  notify();
}

// ─── 장비 ─────────────────────────────────────────────────
function getItemById(id) {
  for (const slot of Object.keys(EQUIPMENT)) {
    const item = EQUIPMENT[slot].find(i=>i.id===id);
    if (item) return item;
  }
  return null;
}

function buyEquipment(itemId) {
  const item = getItemById(itemId);
  if (!item||player.gold<item.price) return false;
  if (player.equipment_owned.includes(itemId)) return false;
  player.gold -= item.price;
  player.equipment_owned.push(itemId);
  player.equip_bought = (player.equip_bought||0)+1;
  checkAchievements();
  notify();
  return true;
}

function openBox(tier) {
  const box = BOXES.find(b=>b.tier===tier);
  if (!box||player.gold<box.price) return null;
  player.gold -= box.price;
  const slots = Object.keys(EQUIPMENT);
  const slot = slots[Math.floor(Math.random()*slots.length)];
  const item = EQUIPMENT[slot].find(i=>i.tier===tier);
  if (!item) return null;
  if (!player.equipment_owned.includes(item.id)) {
    player.equipment_owned.push(item.id);
    player.equip_bought = (player.equip_bought||0)+1;
  }
  checkAchievements();
  notify();
  return item;
}

function equipItem(itemId, slot) {
  if (!player.equipment_owned.includes(itemId)) return false;
  player.equipped[slot] = itemId;
  notify();
  return true;
}

function enhanceEquipment(itemId) {
  const level = player.equipment_enhanced[itemId]||0;
  if (level>=10) return false;
  const cost = getEnhanceCost(itemId);
  if (!cost||player.gold<cost) return false;
  player.gold -= cost;
  player.equipment_enhanced[itemId] = level+1;
  notify();
  return { newLevel:level+1, cost };
}

function getEnhanceCost(itemId) {
  const level = player.equipment_enhanced[itemId]||0;
  if (level>=10) return null;
  return Math.round((level+1)*500*(1+level*0.3));
}

// ─── 전투 파워 (훈련 능력치와 동일하게) ──────────────────
function getPlayerPower() {
  const eq = getEquipBonus();
  return Object.keys(player.stats).reduce((sum,k)=>sum+player.stats[k]+(eq[k]||0),0);
}

// ─── 대회 ─────────────────────────────────────────────────
function canEnterStage(stageId) {
  const stage = TOURNAMENT_STAGES.find(s=>s.id===stageId);
  if (!stage) return false;
  if (player.dan<stage.req_dan) return false;
  const wk = weekKey();
  if ((player.last_tournament_week||{})[stageId]===wk) return false;
  return true;
}

function getTournamentCooldownInfo(stageId) {
  const wk = weekKey();
  const used = (player.last_tournament_week||{})[stageId]===wk;
  return { available:!used, used };
}

// 버그 수정: dan을 건드리지 않음
function recordTournamentResult(stageId, won) {
  if (!player.last_tournament_week) player.last_tournament_week = {};
  player.last_tournament_week[stageId] = weekKey();
  if (!player.daily_missions_progress) player.daily_missions_progress = {};
  player.daily_missions_progress.tournament = 1;

  if (won) {
    player.tournament_wins = (player.tournament_wins||0)+1;
    const stage = TOURNAMENT_STAGES.find(s=>s.id===stageId);
    if (stage) {
      player.gold = (player.gold||0)+stage.prize;
      player.season_points = (player.season_points||0)+Math.round(stage.prize/100);
      if (stage.is_final) player.national_wins = (player.national_wins||0)+1;
    }
    player.tournament_history = player.tournament_history||[];
    player.tournament_history.unshift({ date:Date.now(), stage:stageId, result:'win' });
  } else {
    player.tournament_history = player.tournament_history||[];
    player.tournament_history.unshift({ date:Date.now(), stage:stageId, result:'lose' });
  }
  if (player.tournament_history.length>30) player.tournament_history.length=30;

  // dan은 절대 건드리지 않음 — checkDanUp만 호출
  const newDan     = checkDanUp();
  const newSkills  = checkSkillUnlocks();
  const newAchieve = checkAchievements();
  notify();
  return { newDan, newSkills, newAchieve };
}

// ─── 업적 ─────────────────────────────────────────────────
function checkAchievements() {
  const newly = [];
  for (const ach of ACHIEVEMENTS) {
    if (player.achievements_unlocked.includes(ach.id)) continue;
    if (_achMet(ach)) {
      player.achievements_unlocked.push(ach.id);
      player.gold = (player.gold||0)+(ach.reward?.gold||0);
      newly.push(ach);
    }
  }
  return newly;
}

function _achMet(ach) {
  const req=ach.req, p=player;
  if (req.total_hits      !== undefined && p.total_hits < req.total_hits)           return false;
  if (req.stat_total      !== undefined && statTotal()  < req.stat_total)           return false;
  if (req.tournament_wins !== undefined && p.tournament_wins < req.tournament_wins) return false;
  if (req.national_wins   !== undefined && (p.national_wins||0) < req.national_wins)return false;
  if (req.equip_bought    !== undefined && (p.equip_bought||0) < req.equip_bought)  return false;
  if (req.skills_count    !== undefined && p.skills_unlocked.length < req.skills_count) return false;
  if (req.master_training !== undefined && p.master_training_count < req.master_training) return false;
  if (req.dan             !== undefined && p.dan < req.dan)                         return false;
  if (req.login_streak    !== undefined && (p.login_streak||0) < req.login_streak)  return false;
  return true;
}

// ─── 일일/주간 ────────────────────────────────────────────
function getDailyMissionProgress(m) {
  const p = player;
  if (m.req.daily_hits)      return { cur:p.daily_hits||0, req:m.req.daily_hits };
  if (m.req.daily_tournament) return { cur:p.daily_missions_progress?.tournament||0, req:1 };
  if (m.req.all_strikes) {
    const w = getCurrentWeapon();
    const all = w.strikes.every(s=>(p.hits_by_type[s.id]||0)>0) ? 1 : 0;
    return { cur:all, req:1 };
  }
  return { cur:0, req:1 };
}

function claimDailyMission(id) {
  const m = DAILY_MISSIONS.find(x=>x.id===id);
  if (!m||player.daily_missions_done.includes(id)) return false;
  const prog = getDailyMissionProgress(m);
  if (prog.cur<prog.req) return false;
  player.daily_missions_done.push(id);
  player.gold = (player.gold||0)+m.reward.gold;
  notify();
  return true;
}

function getWeeklyProgress(ch) {
  const p = player;
  if (ch.req.weekly_hits)   return { cur:p.weekly_hits||0, req:ch.req.weekly_hits };
  if (ch.req.weekly_wins)   return { cur:p.tournament_wins||0, req:ch.req.weekly_wins };
  if (ch.req.weekly_skills) return { cur:p.weekly_skill_unlocked||0, req:ch.req.weekly_skills };
  return { cur:0, req:1 };
}

function claimWeeklyChallenge(id) {
  const ch = WEEKLY_CHALLENGES.find(x=>x.id===id);
  if (!ch||player.weekly_done.includes(id)) return false;
  const prog = getWeeklyProgress(ch);
  if (prog.cur<prog.req) return false;
  player.weekly_done.push(id);
  player.gold = (player.gold||0)+ch.reward.gold;
  notify();
  return true;
}

// ─── 설정 ─────────────────────────────────────────────────
function setBackground(bg) { player.background=bg; notify(); }
function setAccentColor(hex) { player.accent_color=hex; document.documentElement.style.setProperty('--accent2',hex); notify(); }
function setLanguage(lang) { player.language=lang; notify(); }
function setSoundEnabled(v) { player.sound_enabled=v; notify(); }
function isSoundEnabled() { return player ? player.sound_enabled!==false : true; }

// 버그 수정: resetGame
function resetGame() {
  try {
    localStorage.removeItem('kendo_save_v2');
    localStorage.removeItem('kendo_intro_seen');
    // Firebase 세이브도 삭제 시도
    if (typeof saveGame === 'function') {
      player = null;
    }
  } catch(e) {}
  setTimeout(()=>location.reload(), 200);
}
