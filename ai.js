// ============================================================
// AI SYSTEM - 대전 AI + 성장 AI
// ============================================================

// ─── 대전 AI ──────────────────────────────────────────────
// 상대별 고유 스타일 정의
const AI_STYLES = {
  // 공격형: 방어 거의 안 함, 연속 공격
  aggressive: {
    id: 'aggressive',
    ko: '공격형',
    attack_rate: 0.85,      // 공격 선택 확률
    guard_rate:  0.08,
    dodge_rate:  0.07,
    counter_boost: 0,       // 카운터 데미지 보너스
    pattern_read: 0.1,      // 플레이어 패턴 파악 확률
    preferred_attacks: ['attack_1','attack_2'], // 선호 공격
    desc: '쉬지 않고 몰아붙이는 스타일',
  },
  // 수비형: 방어/회피 위주, 카운터
  defensive: {
    id: 'defensive',
    ko: '수비형',
    attack_rate: 0.45,
    guard_rate:  0.35,
    dodge_rate:  0.20,
    counter_boost: 0.5,     // 카운터 시 데미지 +50%
    pattern_read: 0.25,
    preferred_attacks: ['attack_3'],
    desc: '막고 반격하는 스타일',
  },
  // 패턴형: 플레이어 행동 분석, 약점 공략
  pattern: {
    id: 'pattern',
    ko: '패턴형',
    attack_rate: 0.60,
    guard_rate:  0.25,
    dodge_rate:  0.15,
    counter_boost: 0.3,
    pattern_read: 0.65,     // 높은 패턴 파악률
    preferred_attacks: ['attack_1','attack_3','attack_4'],
    desc: '상대 패턴을 읽고 공략하는 스타일',
  },
  // 균형형: 중반 상대
  balanced: {
    id: 'balanced',
    ko: '균형형',
    attack_rate: 0.60,
    guard_rate:  0.22,
    dodge_rate:  0.18,
    counter_boost: 0.15,
    pattern_read: 0.35,
    preferred_attacks: ['attack_1','attack_2','attack_3','attack_4'],
    desc: '공격과 수비를 균형있게 사용',
  },
  // 적응형: 실시간으로 플레이어 패턴 읽고 변화 (최종보스)
  adaptive: {
    id: 'adaptive',
    ko: '적응형',
    attack_rate: 0.65,
    guard_rate:  0.20,
    dodge_rate:  0.15,
    counter_boost: 0.4,
    pattern_read: 0.92,     // 거의 완벽한 패턴 파악
    preferred_attacks: ['attack_1','attack_2','attack_3','attack_4'],
    desc: '실시간으로 학습하며 약점을 파고드는 스타일',
    adaptive: true,         // 매 라운드 스타일 조정
  },
};

// 상대별 AI 스타일 매핑
const OPPONENT_AI_STYLE = {
  // 지역 대회
  '박민수':     'aggressive',
  '이수진':     'aggressive',
  '최강준':     'balanced',
  // 시 대회
  '한무도':     'balanced',
  '강검사':     'defensive',
  '오달인':     'defensive',
  // 도 대회
  '도 챔피언 윤': 'pattern',
  '철의 검사 문': 'defensive',
  '흑룡 서':     'pattern',
  // 전국 대회
  '전국 강자 정': 'pattern',
  '검성 이도':   'pattern',
  '미야모토 켄': 'adaptive',
};

// ─── 플레이어 패턴 분석기 ────────────────────────────────
class PlayerAnalyzer {
  constructor() {
    this.history = [];       // 최근 행동 기록
    this.maxHistory = 15;
  }

  record(action) {
    this.history.push(action);
    if (this.history.length > this.maxHistory) this.history.shift();
  }

  // 가장 많이 쓰는 행동
  getMostUsed() {
    if (!this.history.length) return null;
    const counts = {};
    this.history.forEach(a => counts[a] = (counts[a]||0)+1);
    return Object.entries(counts).sort((a,b)=>b[1]-a[1])[0][0];
  }

  // 공격/방어/회피 비율
  getRatios() {
    if (!this.history.length) return { attack:0.6, guard:0.2, dodge:0.2 };
    const total = this.history.length;
    const attacks = this.history.filter(a=>a.startsWith('attack')).length;
    const guards  = this.history.filter(a=>a==='guard').length;
    const dodges  = this.history.filter(a=>a==='dodge').length;
    return {
      attack: attacks/total,
      guard:  guards/total,
      dodge:  dodges/total,
    };
  }

  // 플레이어 스타일 분류
  getStyle() {
    const r = this.getRatios();
    if (r.attack > 0.7) return 'aggressive';
    if (r.guard  > 0.35) return 'defensive';
    if (r.dodge  > 0.30) return 'evasive';
    return 'balanced';
  }

  // 약점: 자주 쓰는 공격에 대한 대응
  getWeakPoint() {
    const most = this.getMostUsed();
    if (!most) return null;
    // 자주 쓰는 공격을 AI가 방어
    if (most.startsWith('attack')) return { type:'predict_attack', action:most };
    if (most === 'guard') return { type:'predict_guard', desc:'방어 많이 함 → 페인트 사용' };
    if (most === 'dodge') return { type:'predict_dodge', desc:'회피 많이 함 → 광역기 사용' };
    return null;
  }

  // 최근 3턴 패턴
  getRecentPattern() {
    return this.history.slice(-3);
  }
}

// ─── 대전 AI 의사결정 ────────────────────────────────────
class BattleAI {
  constructor(opponent, stageAiPower) {
    this.opponent = opponent;
    this.aiPower = stageAiPower;
    this.styleName = OPPONENT_AI_STYLE[opponent.name_ko] || 'balanced';
    this.style = AI_STYLES[this.styleName];
    this.playerAnalyzer = new PlayerAnalyzer();
    this.roundCount = 0;
    this.adaptHistory = []; // 적응형 전용
  }

  // 플레이어 행동 기록
  recordPlayerAction(actionId) {
    this.playerAnalyzer.record(actionId);
  }

  // AI 다음 행동 결정
  decide() {
    this.roundCount++;
    const style = this.style;
    const patternRead = style.pattern_read;
    const playerStyle = this.playerAnalyzer.getStyle();
    const weakPoint = this.playerAnalyzer.getWeakPoint();
    const ratios = this.playerAnalyzer.getRatios();

    // 적응형: 매 라운드 전략 조정
    if (style.adaptive && this.roundCount > 2) {
      return this._adaptiveDecide(playerStyle, weakPoint, ratios);
    }

    // 패턴 읽기 성공 여부
    const readSuccess = Math.random() < patternRead;

    if (readSuccess && weakPoint) {
      // 약점 공략
      if (weakPoint.type === 'predict_attack') {
        // 플레이어 공격 예측 → 방어 또는 카운터
        return Math.random() < 0.6 ? 'guard' : 'dodge';
      }
      if (weakPoint.type === 'predict_guard') {
        // 플레이어 방어 예측 → 페인트 후 공격
        return this._pickAttack('feint');
      }
      if (weakPoint.type === 'predict_dodge') {
        // 플레이어 회피 예측 → 광역 공격
        return 'attack_3'; // 몸통치기 (느리지만 광역)
      }
    }

    // 기본 스타일 기반 행동
    const roll = Math.random();
    const aRate = style.attack_rate + (this.aiPower - 0.5) * 0.2;

    if (roll < aRate) {
      return this._pickAttack();
    } else if (roll < aRate + style.guard_rate) {
      return 'guard';
    } else {
      return 'dodge';
    }
  }

  _adaptiveDecide(playerStyle, weakPoint, ratios) {
    // 플레이어가 공격형이면 → 수비 강화
    if (playerStyle === 'aggressive') {
      return Math.random() < 0.5 ? 'guard' : this._pickAttack();
    }
    // 플레이어가 수비형이면 → 연속 공격
    if (playerStyle === 'defensive') {
      return this._pickAttack('pressure');
    }
    // 플레이어가 회피형이면 → 빠른 공격
    if (playerStyle === 'evasive') {
      return Math.random() < 0.7 ? 'attack_2' : 'attack_4'; // 빠른 공격
    }
    // 기본: 패턴 공략
    if (weakPoint && Math.random() < 0.75) {
      if (weakPoint.type === 'predict_attack') return 'guard';
      if (weakPoint.type === 'predict_guard') return 'attack_3';
    }
    return this._pickAttack();
  }

  _pickAttack(hint) {
    const preferred = this.style.preferred_attacks;
    if (hint === 'feint') {
      // 페인트 후 약한 빠른 공격
      return Math.random() < 0.5 ? 'attack_2' : 'attack_4';
    }
    if (hint === 'pressure') {
      return Math.random() < 0.6 ? 'attack_1' : 'attack_2';
    }
    // 선호 공격 중 랜덤
    return preferred[Math.floor(Math.random()*preferred.length)];
  }

  // 카운터 보너스
  getCounterBoost() {
    return this.style.counter_boost;
  }

  // 스타일 설명 (대전 전 표시용)
  getStyleDesc() {
    return {
      name: this.style.ko,
      desc: this.style.desc,
      icon: this.styleName === 'aggressive' ? '⚔️' :
            this.styleName === 'defensive'  ? '🛡️' :
            this.styleName === 'pattern'    ? '👁️' :
            this.styleName === 'adaptive'   ? '🧠' : '⚖️',
    };
  }
}

// ─── 성장 AI (플레이어 코치) ─────────────────────────────
class GrowthAI {
  constructor() {}

  analyze(player) {
    const weapon = getCurrentWeapon();
    const hits = player.hits_by_type || {};
    const stats = player.stats || {};
    const skills = player.skills_unlocked || [];
    const weaponSkills = getWeaponSkills(weapon.id);

    // 1. 플레이어 스타일 분석
    const style = this._analyzeStyle(hits, weapon);

    // 2. 부족한 스탯 감지
    const weakStat = this._findWeakStat(stats);

    // 3. 다음 해금 스킬까지 최단 경로
    const nextSkill = this._findNextSkill(player, weaponSkills);

    // 4. 맞춤 훈련 추천
    const recommendation = this._recommend(style, weakStat, nextSkill, weapon, hits);

    // 5. 대회 준비 여부
    const battleReady = this._checkBattleReady(player);

    return { style, weakStat, nextSkill, recommendation, battleReady };
  }

  _analyzeStyle(hits, weapon) {
    const totals = weapon.strikes.map(s => hits[s.id]||0);
    const total = totals.reduce((a,b)=>a+b,0);
    if (total === 0) return { type:'beginner', ko:'입문자', desc:'아직 수련이 부족합니다' };

    const maxIdx = totals.indexOf(Math.max(...totals));
    const dominant = weapon.strikes[maxIdx];
    const domRate = totals[maxIdx]/total;

    if (domRate > 0.6) {
      return {
        type: 'specialist',
        ko: `${dominant.ko} 특화형`,
        desc: `${dominant.ko}에 집중하는 스타일. 다른 부위도 수련해보세요.`,
        dominant: dominant.id,
      };
    }
    const balanced = totals.every(v => v > total*0.15);
    if (balanced) return { type:'balanced', ko:'균형형', desc:'모든 부위를 고르게 수련합니다. 이상적인 스타일!' };
    return { type:'developing', ko:'성장형', desc:'특정 부위에 집중하며 성장 중입니다.' };
  }

  _findWeakStat(stats) {
    const entries = Object.entries(stats);
    const min = entries.reduce((a,b) => a[1]<b[1]?a:b);
    const max = entries.reduce((a,b) => a[1]>b[1]?a:b);
    const gap = max[1] - min[1];
    if (gap < 20) return null; // 균형잡힘
    return {
      stat: min[0],
      ko: STATS[min[0]]?.ko || min[0],
      value: Math.floor(min[1]),
      gap: Math.floor(gap),
    };
  }

  _findNextSkill(player, weaponSkills) {
    const locked = weaponSkills.filter(s => !player.skills_unlocked.includes(s.id) && !s.secret);
    if (!locked.length) return null;

    // 가장 가까운 스킬 (조건 달성률 높은 것)
    const withProgress = locked.map(skill => {
      const progs = getSkillProgress(skill);
      if (!progs.length) return { skill, rate: 1 };
      const rate = progs.reduce((sum,p) => sum + Math.min(1,p.cur/p.req), 0) / progs.length;
      return { skill, rate, progs };
    });
    withProgress.sort((a,b) => b.rate - a.rate);
    return withProgress[0];
  }

  _recommend(style, weakStat, nextSkill, weapon, hits) {
    const recs = [];

    // 스타일 기반 추천
    if (style.type === 'specialist') {
      const other = weapon.strikes.find(s => s.id !== style.dominant);
      if (other) recs.push({
        icon: other.icon,
        title: `${other.ko} 수련 추천`,
        desc: `${other.ko}를 더 수련하면 균형잡힌 전투가 가능합니다.`,
        strike: other.id,
      });
    }

    // 약한 스탯 기반 추천
    if (weakStat) {
      const bestStrike = weapon.strikes.find(s => s.trainStat === weakStat.stat || s.trainFoc === weakStat.stat);
      if (bestStrike) recs.push({
        icon: bestStrike.icon,
        title: `${weakStat.ko} 강화 추천`,
        desc: `${weakStat.ko}이(가) ${weakStat.value}으로 약합니다. ${bestStrike.ko} 수련을 추천합니다.`,
        strike: bestStrike.id,
      });
    }

    // 다음 스킬 추천
    if (nextSkill && nextSkill.rate > 0.4) {
      recs.push({
        icon: '🌟',
        title: `${nextSkill.skill.ko} 해금 임박!`,
        desc: `달성률 ${Math.round(nextSkill.rate*100)}%. ${nextSkill.progs?.[0]?.label||''} ${nextSkill.progs?.[0]?.cur||0}/${nextSkill.progs?.[0]?.req||0}`,
        skill: nextSkill.skill.id,
      });
    }

    return recs.slice(0, 3); // 최대 3개
  }

  _checkBattleReady(player) {
    const nextStage = TOURNAMENT_STAGES.find(s => player.dan >= s.req_dan && canEnterStage(s.id));
    if (!nextStage) return null;
    const power = getPlayerPower();
    const needed = nextStage.ai_power * power;
    return {
      stage: nextStage,
      ready: true,
      power: Math.round(power),
    };
  }
}

// 싱글톤
const growthAI = new GrowthAI();

// 성장 AI 분석 결과를 화면에 표시할 HTML 생성
function buildGrowthAIPanel(player) {
  const result = growthAI.analyze(player);
  const weapon = getCurrentWeapon();

  return `
    <div class="ai-panel">
      <div class="ai-panel-header">
        <span style="font-size:16px;">🧠</span>
        <div>
          <div style="font-size:11px;font-weight:700;color:var(--accent2);">AI 코치 분석</div>
          <div style="font-size:9px;color:var(--text3);">${weapon.ko} 기준</div>
        </div>
      </div>

      <!-- 스타일 -->
      <div class="ai-stat-row">
        <span style="font-size:10px;color:var(--text3);">수련 스타일</span>
        <span style="font-size:10px;font-weight:700;color:var(--accent2);">${result.style.ko}</span>
      </div>
      <div style="font-size:9px;color:var(--text3);margin-bottom:8px;padding-left:4px;">${result.style.desc}</div>

      <!-- 약한 스탯 -->
      ${result.weakStat?`
      <div class="ai-stat-row">
        <span style="font-size:10px;color:var(--text3);">보완 필요</span>
        <span style="font-size:10px;font-weight:700;color:var(--hp);">${result.weakStat.ko} (${result.weakStat.value})</span>
      </div>`:''}

      <!-- 추천 -->
      ${result.recommendation.length?`
      <div style="font-size:10px;color:var(--text3);margin:8px 0 6px;">💡 추천</div>
      ${result.recommendation.map(r=>`
        <div class="ai-rec-item" ${r.strike?`data-rec-strike="${r.strike}"`:''}>
          <span style="font-size:16px;">${r.icon}</span>
          <div>
            <div style="font-size:10px;font-weight:700;">${r.title}</div>
            <div style="font-size:9px;color:var(--text3);">${r.desc}</div>
          </div>
        </div>`).join('')}
      `:''}

      <!-- 대회 준비 -->
      ${result.battleReady?`
      <div class="ai-battle-ready">
        ⚔️ <b style="color:var(--gold);">${result.battleReady.stage.ko}</b> 참가 가능!
        <div style="font-size:9px;margin-top:2px;">전투 파워: ${result.battleReady.power}</div>
      </div>`:''}
    </div>
  `;
}
