// ============================================================
// BATTLE SYSTEM v2 - AI 스타일 시스템 연동
// ============================================================

let _bState = null;
let _bContainer = null;
let _pChar = null, _oChar = null;
let _onBattleEnd = null;
let _battleAI = null;

function startBattle(container, stageId, opponentDef, onEnd) {
  _bContainer = container;
  _onBattleEnd = onEnd;
  const p = getPlayer();
  const eq = getEquipBonus();
  const playerMaxHp = Math.round((p.stats.hp + (eq.hp||0)) * 3 + 80);
  const oppMaxHp = opponentDef.hp || 100;

  // AI 생성
  const stage = TOURNAMENT_STAGES.find(s=>s.id===stageId);
  _battleAI = new BattleAI(opponentDef, stage?.ai_power||0.5);

  _bState = {
    stageId, opponent: opponentDef,
    playerHp: playerMaxHp, playerMaxHp,
    oppHp: oppMaxHp, oppMaxHp,
    playerScore: 0, oppScore: 0,
    round: 1, log: [],
    guarding: false, dodging: false,
    skillUsed: {}, over: false,
  };

  _renderBattle();
}

function _renderBattle() {
  const st = _bState;
  const p = getPlayer();
  const opp = st.opponent;
  const aiStyle = _battleAI.getStyleDesc();
  const unlocked = p.skills_unlocked;
  const weapon = getCurrentWeapon();

  _bContainer.innerHTML = `
    <div class="battle-arena" id="ba">
      <div class="battle-header">
        <div style="font-size:10px;color:var(--text3);">라운드 <span id="br">${st.round}</span></div>
        <div class="battle-score-big" id="bscore">${st.playerScore} : ${st.oppScore}</div>
        <div style="font-size:9px;color:var(--text3);">3점 선취 승</div>
      </div>

      <div class="battle-vs-row">
        <div class="battle-fighter">
          <div id="p-char" style="height:110px;display:flex;align-items:flex-end;justify-content:center;"></div>
          <div class="bf-name">${p.name}</div>
          <div class="battle-hp-wrap"><div class="battle-hp-bar" id="p-hp" style="width:100%;background:var(--spd);"></div></div>
          <div style="font-size:9px;color:var(--text3);margin-top:2px;" id="p-hp-txt">${st.playerHp}/${st.playerMaxHp}</div>
        </div>

        <div style="display:flex;flex-direction:column;align-items:center;gap:4px;padding-top:10px;">
          <div style="font-size:10px;color:var(--text3);">VS</div>
          <div id="bstatus" style="font-size:10px;color:var(--accent2);font-weight:700;text-align:center;min-height:28px;max-width:80px;word-break:keep-all;"></div>
        </div>

        <div class="battle-fighter" style="align-items:flex-end;">
          <div id="o-char" style="height:110px;display:flex;align-items:flex-end;justify-content:center;"></div>
          <div class="bf-name">${opp.name_ko}</div>
          <div class="battle-hp-wrap"><div class="battle-hp-bar" id="o-hp" style="width:100%;background:var(--accent);"></div></div>
          <div style="font-size:9px;color:var(--text3);margin-top:2px;" id="o-hp-txt">${st.oppHp}/${st.oppMaxHp}</div>
        </div>
      </div>

      <!-- AI 스타일 표시 -->
      <div style="display:flex;align-items:center;justify-content:center;gap:6px;margin:4px 0 6px;">
        <span style="font-size:12px;">${aiStyle.icon}</span>
        <span style="font-size:9px;color:var(--text3);">${opp.name_ko} — ${aiStyle.name} · ${aiStyle.desc}</span>
      </div>

      <div style="font-size:10px;color:var(--text3);font-style:italic;text-align:center;min-height:16px;" id="opp-q">"${opp.quote_ko}"</div>
      <div id="b-spark" style="position:absolute;inset:0;pointer-events:none;overflow:hidden;"></div>
    </div>

    <div class="battle-log" id="b-log"></div>

    <!-- 공격 -->
    <div style="margin-bottom:10px;">
      <div style="font-size:10px;color:var(--text3);margin-bottom:6px;">⚔ 공격 <span style="font-size:9px;">(${weapon.ko})</span></div>
      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:6px;">
        ${BATTLE_ACTIONS.filter(a=>a.type==='attack').map(a=>`
          <button class="battle-action-btn" data-action="${a.id}">
            <span style="font-size:18px;">${a.icon}</span>
            <span style="font-size:9px;">${a.ko}</span>
            <span style="font-size:8px;color:var(--text3);">${Math.round(a.hit_rate*100)}%</span>
          </button>`).join('')}
      </div>
    </div>

    <!-- 방어/회피 -->
    <div style="margin-bottom:10px;">
      <div style="font-size:10px;color:var(--text3);margin-bottom:6px;">🛡 방어 / 회피</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;">
        ${BATTLE_ACTIONS.filter(a=>a.type!=='attack').map(a=>`
          <button class="battle-action-btn" data-action="${a.id}">
            <span style="font-size:18px;">${a.icon}</span>
            <span style="font-size:9px;">${a.ko}</span>
            <span style="font-size:8px;color:var(--text3);">${a.type==='guard'?'피해 50%↓':'55% 완전 회피'}</span>
          </button>`).join('')}
      </div>
    </div>

    <!-- 스킬 -->
    ${unlocked.filter(id=>['renzoku','feint','harai','nuki','mushin','kiai','hissatsu','iaijutsu','musou','tenku','shinken','shinpi','mokuso','gyaku'].includes(id)).length?`
    <div>
      <div style="font-size:10px;color:var(--text3);margin-bottom:6px;">🌟 스킬</div>
      <div style="display:flex;gap:6px;overflow-x:auto;padding-bottom:4px;">
        ${unlocked.filter(id=>['renzoku','feint','harai','nuki','mushin','kiai','hissatsu','iaijutsu','musou','tenku','shinken','shinpi','mokuso','gyaku'].includes(id)).map(id=>{
          const sk = ALL_SKILLS.find(s=>s.id===id);
          if (!sk) return '';
          const used = _bState.skillUsed[id];
          return `<button class="battle-skill-btn ${used?'used':''}" data-skill="${id}" ${used?'disabled':''}>
            <span style="font-size:20px;">${sk.icon}</span>
            <span style="font-size:9px;">${sk.ko}</span>
          </button>`;
        }).join('')}
      </div>
    </div>`:''}
  `;

  _pChar = new PixelCharacter(document.getElementById('p-char'), { pixelSize: 4 });
  _oChar = new PixelCharacter(document.getElementById('o-char'), { pixelSize: 4, flipped: true, opponent: true });

  _attachBattleEvents();
  _bLog(`⚔ ${opp.name_ko}(${aiStyle.name})와(과) 대전 시작!`);
}

function _attachBattleEvents() {
  document.querySelectorAll('[data-action]').forEach(btn => {
    btn.addEventListener('click', () => {
      if (_bState.over) return;
      const action = BATTLE_ACTIONS.find(a=>a.id===btn.dataset.action);
      if (!action) return;
      _disableButtons();
      // AI에게 플레이어 행동 기록
      _battleAI.recordPlayerAction(action.id);
      _playerTurn(action);
    });
  });
  document.querySelectorAll('[data-skill]').forEach(btn => {
    btn.addEventListener('click', () => {
      if (_bState.over || btn.disabled) return;
      _disableButtons();
      _battleAI.recordPlayerAction('skill_'+btn.dataset.skill);
      _useSkill(btn.dataset.skill);
    });
  });
}

function _disableButtons() { document.querySelectorAll('[data-action],[data-skill]').forEach(b=>b.disabled=true); }
function _enableButtons() {
  if (_bState.over) return;
  document.querySelectorAll('[data-action]').forEach(b=>b.disabled=false);
  document.querySelectorAll('[data-skill]').forEach(b=>{ if(!_bState.skillUsed[b.dataset.skill]) b.disabled=false; });
}

function _bLog(msg) {
  const log=document.getElementById('b-log'); if(!log) return;
  const d=document.createElement('div'); d.className='b-log-entry'; d.textContent=msg;
  log.appendChild(d); log.scrollTop=log.scrollHeight;
}
function _setStatus(msg, color) {
  const el=document.getElementById('bstatus');
  if(el){ el.textContent=msg; el.style.color=color||'var(--accent2)'; }
}

function _calcPlayerDmg(action) {
  const p=getPlayer(), eq=getEquipBonus();
  const power=(p.stats.str+p.stats.foc+(eq.str||0)+(eq.foc||0))*0.08;
  return Math.max(5, Math.round(power*action.dmg_mult*(0.85+Math.random()*0.3)));
}

function _calcOppDmg() {
  const st=_bState;
  const base=st.playerMaxHp*0.12*st.opponent.power;
  return Math.max(3, Math.round(base*(0.8+Math.random()*0.4)));
}

function _updateHpBars() {
  const st=_bState;
  const php=Math.max(0,(st.playerHp/st.playerMaxHp)*100);
  const ohp=Math.max(0,(st.oppHp/st.oppMaxHp)*100);
  const pb=document.getElementById('p-hp'), ob=document.getElementById('o-hp');
  const pt=document.getElementById('p-hp-txt'), ot=document.getElementById('o-hp-txt');
  if(pb) pb.style.width=php+'%';
  if(ob) ob.style.width=ohp+'%';
  if(pt) pt.textContent=`${Math.max(0,st.playerHp)}/${st.playerMaxHp}`;
  if(ot) ot.textContent=`${Math.max(0,st.oppHp)}/${st.oppMaxHp}`;
}

function _playerTurn(action) {
  const st=_bState;
  playSound('swing');

  if (action.type==='guard') {
    st.guarding=true; st.dodging=false;
    _setStatus('🛡 방어!','var(--spd)');
    _bLog('🛡 방어 자세를 취했습니다.');
    _pChar.render('idle');
    setTimeout(()=>_oppTurn(),700);
    return;
  }
  if (action.type==='dodge') {
    st.guarding=false;
    const ok=Math.random()<action.hit_rate;
    st.dodging=ok;
    _setStatus(ok?'💨 회피!':'💨 회피 실패', ok?'var(--spd)':'var(--accent)');
    _bLog(ok?'💨 재빠르게 피했습니다!':'💨 회피 실패...');
    setTimeout(()=>_oppTurn(),700);
    return;
  }

  // 공격
  const strikeKey = action.id.replace('attack_','');
  const strikeMap = { '1':'men','2':'kote','3':'do','4':'tsuki' };
  const animKey = strikeMap[strikeKey]||'men';
  const hit=Math.random()<action.hit_rate;

  _pChar.strike(animKey, ()=>{
    playSound('hit');
    const spark=document.getElementById('b-spark');
    if(spark) showHitSpark(spark,110,60,getCurrentWeapon().color);
  });

  setTimeout(()=>{
    if(hit){
      const dmg=_calcPlayerDmg(action);
      st.oppHp-=dmg;
      _oChar.hurt();
      _updateHpBars();
      _bLog(`✓ ${action.ko} 성공! ${dmg} 데미지`);
      _setStatus('✓ 한판!','var(--spd)');

      if(st.oppHp<=0){
        st.playerScore++;
        document.getElementById('bscore').textContent=`${st.playerScore} : ${st.oppScore}`;
        _bLog(`🏅 한판! (${st.playerScore}:${st.oppScore})`);
        if(st.playerScore>=3){ _endMatch(true); return; }
        st.oppHp=st.oppMaxHp; _updateHpBars();
        setTimeout(()=>{ st.guarding=false; st.dodging=false; _enableButtons(); },600);
        return;
      }
    } else {
      _bLog(`✗ ${action.ko} 빗나감...`);
      _setStatus('✗ 빗나감','var(--accent)');
    }
    st.guarding=false; st.dodging=false;
    setTimeout(()=>_oppTurn(),600);
  },400);
}

function _oppTurn() {
  const st=_bState;

  // AI 의사결정
  const aiAction = _battleAI.decide();
  const counterBoost = _battleAI.getCounterBoost();

  if (aiAction==='guard') {
    _bLog(`🛡 ${st.opponent.name_ko}이(가) 방어합니다.`);
    setTimeout(()=>{ st.round++; const br=document.getElementById('br'); if(br) br.textContent=st.round; _enableButtons(); },500);
    return;
  }
  if (aiAction==='dodge') {
    const ok=Math.random()<0.55;
    _bLog(ok?`💨 ${st.opponent.name_ko}이(가) 회피했습니다.`:`💨 ${st.opponent.name_ko}의 회피 실패.`);
    if(!ok){
      // 회피 실패 → 플레이어 카운터 찬스
      _setStatus('🎯 카운터 찬스!','var(--gold)');
    }
    setTimeout(()=>_finishOppTurn(),500);
    return;
  }

  // AI 공격
  const action = BATTLE_ACTIONS.find(a=>a.id===aiAction) || BATTLE_ACTIONS[0];
  const aiHitRate = action.hit_rate*(0.7+(_bState.opponent.power||0.5)*0.5);
  const hit=Math.random()<aiHitRate;

  _oChar.strike('men', ()=>{
    const spark=document.getElementById('b-spark');
    if(spark) showHitSpark(spark,60,60,'#e74c3c');
  });

  setTimeout(()=>{
    if(hit){
      if(st.dodging){ _bLog('💨 회피 성공!'); st.dodging=false; setTimeout(()=>_finishOppTurn(),400); return; }
      let dmg=_calcOppDmg();
      if(st.guarding) dmg=Math.round(dmg*0.5);
      // 카운터 보너스 적용
      if(counterBoost>0 && st.guarding) dmg=Math.round(dmg*(1+counterBoost));
      st.playerHp-=dmg;
      _pChar.hurt();
      _updateHpBars();
      _bLog(`✗ ${st.opponent.name_ko}의 ${action.ko}! ${st.guarding?'(방어됨) ':''}${dmg} 피해`);

      if(st.playerHp<=0){
        st.oppScore++;
        document.getElementById('bscore').textContent=`${st.playerScore} : ${st.oppScore}`;
        _bLog(`💀 한판 빼앗김! (${st.playerScore}:${st.oppScore})`);
        if(st.oppScore>=3){ _endMatch(false); return; }
        st.playerHp=st.playerMaxHp; _updateHpBars();
        setTimeout(()=>_finishOppTurn(),600);
        return;
      }
    } else {
      _bLog('상대 공격이 빗나갔습니다.');
    }
    _finishOppTurn();
  },450);
}

function _finishOppTurn() {
  const st=_bState;
  st.guarding=false; st.dodging=false;
  st.round++;
  const br=document.getElementById('br'); if(br) br.textContent=st.round;
  setTimeout(()=>_enableButtons(),300);
}

function _useSkill(skillId) {
  const st=_bState;
  const sk=ALL_SKILLS.find(s=>s.id===skillId); if(!sk) return;
  st.skillUsed[skillId]=true;
  playSound('skill');

  switch(skillId){
    case 'renzoku': case 'musou': {
      const count = skillId==='musou'?5:2;
      _bLog(`${sk.icon} ${sk.ko} 발동! ${count}연속 공격!`);
      let i=0;
      const atk=()=>{ if(i>=count||st.over) return; _playerTurn(BATTLE_ACTIONS.find(a=>a.id==='attack_1')); i++; setTimeout(atk,800); };
      atk(); return;
    }
    case 'kiai': case 'iaijutsu': {
      const dmg=Math.round(_calcPlayerDmg(BATTLE_ACTIONS.find(a=>a.id==='attack_1'))*2);
      st.oppHp-=dmg; _oChar.hurt(); _updateHpBars();
      _bLog(`${sk.icon} ${sk.ko}! ${dmg} 데미지!`);
      showEventBanner(sk.icon,sk.ko,`${dmg} 데미지!`);
      if(st.oppHp<=0){ st.playerScore++; document.getElementById('bscore').textContent=`${st.playerScore}:${st.oppScore}`; if(st.playerScore>=3){_endMatch(true);return;} st.oppHp=st.oppMaxHp; _updateHpBars(); }
      setTimeout(()=>_oppTurn(),600); return;
    }
    case 'hissatsu': case 'tenku': {
      _bLog(`${sk.icon} ${sk.ko}! 즉시 한판!`);
      showEventBanner(sk.icon, sk.ko, '한판!');
      st.playerScore++; document.getElementById('bscore').textContent=`${st.playerScore}:${st.oppScore}`;
      if(st.playerScore>=3){ _endMatch(true); return; }
      st.oppHp=st.oppMaxHp; _updateHpBars();
      setTimeout(()=>_finishOppTurn(),800); return;
    }
    case 'mokuso': {
      st.playerHp=Math.min(st.playerMaxHp, Math.round(st.playerHp+st.playerMaxHp*0.3));
      _updateHpBars(); _bLog(`${sk.icon} ${sk.ko}! HP 30% 회복!`);
      showToast('HP 회복!','var(--spd)');
      setTimeout(()=>_enableButtons(),400); return;
    }
    case 'shinpi': {
      st.playerHp=st.playerMaxHp; _updateHpBars();
      _bLog(`${sk.icon} ${sk.ko}! HP 완전 회복!`);
      showEventBanner(sk.icon,sk.ko,'HP 완전 회복!');
      setTimeout(()=>_enableButtons(),400); return;
    }
    default:
      _bLog(`🌟 ${sk.ko} 발동! ${sk.effect_ko||''}`);
      showToast(sk.effect_ko||sk.ko);
      setTimeout(()=>_enableButtons(),400);
  }
}

function _endMatch(playerWon) {
  const st=_bState; st.over=true;
  _disableButtons();
  playSound(playerWon?'win':'lose');
  if(playerWon) _pChar.celebrate();
  else _oChar.celebrate();
  setTimeout(()=>{ if(_onBattleEnd) _onBattleEnd(playerWon, st); },1200);
}
