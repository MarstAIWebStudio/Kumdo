// ============================================================
// SCREEN: 수련장 v3 - 무기 선택 시스템
// ============================================================

let _trainChar = null;
let _effTimer  = null;

function renderTrainScreen(container) {
  const p = getPlayer(); if (!p) return;
  const weapon = getCurrentWeapon();

  container.innerHTML = `
    <!-- 무기 선택 -->
    <div class="weapon-select-bar">
      ${WEAPON_LIST.map(w => {
        const unlocked = p.unlocked_weapons.includes(w.id);
        const active = p.current_weapon === w.id;
        return `<button class="weapon-btn ${active?'active':''} ${!unlocked?'locked':''}"
          data-weapon="${w.id}" ${!unlocked?'disabled':''}>
          <span style="font-size:18px;">${w.icon}</span>
          <span style="font-size:9px;">${w.ko}</span>
          ${!unlocked?`<span style="font-size:8px;color:var(--text3);">${w.unlock?.dan||0}단</span>`:''}
        </button>`;
      }).join('')}
    </div>

    <!-- 현재 무기 설명 -->
    <div class="master-bubble" id="mb" style="border-color:${weapon.color}22;">
      <div style="font-size:24px;">${weapon.icon}</div>
      <div style="flex:1;">
        <div style="font-size:11px;font-weight:700;color:${weapon.color};">${weapon.ko}</div>
        <div class="master-text" id="mq">${weapon.desc}</div>
      </div>
      <div style="font-size:20px;cursor:pointer;" id="master-icon" title="무사시 선생">🥋</div>
    </div>

    <!-- 단 진행도 -->
    <div class="card" style="border-color:var(--accent2);margin-bottom:12px;">
      <div style="display:flex;justify-content:space-between;font-size:10px;color:var(--text3);margin-bottom:6px;">
        <span id="dt-cur">무단</span><span id="dt-next">초단</span>
      </div>
      <div class="dan-bar-wrap"><div class="dan-bar" id="dan-b" style="width:0%"></div></div>
      <div style="font-size:9px;color:var(--text3);margin-top:4px;display:flex;justify-content:space-between;">
        <span>다음 단수까지</span><span id="dan-req">0/200</span>
      </div>
    </div>

    <!-- 픽셀 캐릭터 -->
    <div id="char-wrap" style="position:relative;height:150px;display:flex;justify-content:center;align-items:flex-end;margin-bottom:14px;">
      <div id="train-char" style="position:relative;"></div>
      <div id="hit-ov" style="position:absolute;inset:0;pointer-events:none;"></div>
    </div>

    <!-- 타격 버튼 (현재 무기 기준) -->
    <div class="strike-buttons" id="strike-btns">
      ${weapon.strikes.map((s,i) => `
        <button class="strike-btn ${i===0?'selected':''}" data-strike="${s.id}">
          <span class="strike-icon">${s.icon}</span>
          <span style="font-size:10px;font-weight:700;">${s.ko}</span>
          <span class="strike-count" id="sc-${s.id}">${(p.hits_by_type[s.id]||0)}회</span>
        </button>`).join('')}
    </div>

    <!-- 수련 버튼 -->
    <button class="train-main-btn" id="train-btn">⚔ 수련!</button>

    <!-- 통계 -->
    <div class="train-stats-row">
      <div class="train-stat-box"><div class="tsb-l">총 수련</div><div class="tsb-v" id="tot-hits">${p.total_hits.toLocaleString()}</div></div>
      <div class="train-stat-box"><div class="tsb-l">오늘 수련</div><div class="tsb-v" id="day-hits">${p.daily_hits.toLocaleString()}</div></div>
    </div>

    <div class="efficiency-bar">
      <span class="eff-label">수련 효율</span>
      <div class="eff-bar-wrap"><div class="eff-bar" id="eff-b" style="width:${Math.min(100,(p.train_efficiency||1)*50)}%"></div></div>
      <span class="eff-val" id="eff-v">x${(p.train_efficiency||1).toFixed(1)}</span>
    </div>

    <!-- 일일 임무 -->
    <div class="section-title">일일 임무</div>
    <div class="card" style="padding:10px;" id="daily-m"></div>

    <!-- 스승 훈련 -->
    <div class="section-title">스승 훈련</div>
    <div class="card">
      <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;">
        <div>
          <div style="font-size:12px;font-weight:600;margin-bottom:4px;">🥋 무사시 선생 특별 훈련</div>
          <div style="font-size:10px;color:var(--text3);">비용 <b style="color:var(--gold);">${MASTER_TRAIN_COST.toLocaleString()}G</b> · 효율 ${MASTER_TRAIN_BOOST}배 (${MASTER_TRAIN_HITS}회)</div>
        </div>
        <button class="btn btn-gold btn-sm" id="master-btn" style="flex-shrink:0;">훈련</button>
      </div>
    </div>

    <button class="btn btn-sm" id="goal-btn" style="width:100%;font-size:11px;color:var(--text3);margin-bottom:6px;">🎯 게임 목표 보기</button>
  `;

  // 선택된 타격 초기화
  container._selectedStrike = weapon.strikes[0]?.id;

  _trainChar = new PixelCharacter(container.querySelector('#train-char'), { pixelSize: 5 });
  _updateDanBar(container);
  _updateDailyMissions(container);
  _attachTrainEvents(container);
  _startEffTimer();
}

function _updateDanBar(container) {
  const prog = getDanProgress();
  const danB = container.querySelector('#dan-b');
  if (danB) danB.style.width = Math.round(prog.progress*100)+'%';
  const c = container.querySelector('#dt-cur');
  const n = container.querySelector('#dt-next');
  const r = container.querySelector('#dan-req');
  if (c) c.textContent = prog.current.title_ko;
  if (n) n.textContent = prog.next ? prog.next.title_ko : 'MAX';
  if (r) r.textContent = prog.next ? `${Math.round(prog.statTotal)}/${prog.next.req.total}` : 'MAX';
}

function _updateTrainDisplay(container) {
  const p = getPlayer(); if (!p) return;
  const tot = container.querySelector('#tot-hits');
  const day = container.querySelector('#day-hits');
  const effB = container.querySelector('#eff-b');
  const effV = container.querySelector('#eff-v');
  if (tot) tot.textContent = p.total_hits.toLocaleString();
  if (day) day.textContent = p.daily_hits.toLocaleString();
  if (effB) effB.style.width = Math.min(100,(p.train_efficiency||1)*50)+'%';
  if (effV) effV.textContent = 'x'+(p.train_efficiency||1).toFixed(1);
  const weapon = getCurrentWeapon();
  weapon.strikes.forEach(s => {
    const el = container.querySelector(`#sc-${s.id}`);
    if (el) el.textContent = (p.hits_by_type[s.id]||0).toLocaleString()+'회';
  });
  _updateDanBar(container);
  updateHeader(p);
  updateTabBadges(p);
}

function _updateDailyMissions(container) {
  const p = getPlayer();
  const el = container.querySelector('#daily-m'); if (!el) return;
  el.innerHTML = DAILY_MISSIONS.map(m => {
    const done = p.daily_missions_done.includes(m.id);
    const prog = getDailyMissionProgress(m);
    const pct = Math.min(100,(prog.cur/prog.req)*100);
    const claimable = !done && prog.cur>=prog.req;
    return `
      <div style="margin-bottom:10px;">
        <div style="display:flex;justify-content:space-between;margin-bottom:4px;">
          <span style="font-size:11px;color:${done?'var(--text3)':'var(--text)'};">${m.ko}</span>
          <span style="font-size:9px;color:var(--gold);">+${m.reward.gold}G</span>
        </div>
        <div class="progress-bar-wrap"><div class="progress-bar" style="width:${pct}%;background:${done?'var(--text3)':'var(--spd)'}"></div></div>
        <div style="display:flex;justify-content:space-between;align-items:center;margin-top:3px;">
          <span style="font-size:9px;color:var(--text3);">${prog.cur}/${prog.req}${done?' ✓':''}</span>
          ${claimable?`<button class="btn btn-sm btn-gold" data-claim="${m.id}" style="padding:2px 8px;font-size:9px;">수령</button>`:''}
        </div>
      </div>`;
  }).join('');
}

function _attachTrainEvents(container) {
  // 무기 선택
  container.querySelectorAll('[data-weapon]').forEach(btn => {
    btn.addEventListener('click', () => {
      if (btn.disabled) return;
      if (switchWeapon(btn.dataset.weapon)) {
        playSound('equip');
        renderTrainScreen(container);
      }
    });
  });

  // 타격 선택
  container.querySelectorAll('.strike-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      container._selectedStrike = btn.dataset.strike;
      container.querySelectorAll('.strike-btn').forEach(b=>b.classList.remove('selected'));
      btn.classList.add('selected');
      playSound('button');
    });
  });

  // 이벤트 위임 - 수령 버튼
  container.addEventListener('click', e => {
    const claimBtn = e.target.closest('[data-claim]');
    if (claimBtn) {
      const mId = claimBtn.dataset.claim;
      if (claimDailyMission(mId)) {
        playSound('achieve');
        const m = DAILY_MISSIONS.find(x=>x.id===mId);
        showToast(`+${m?.reward.gold||0}G 획득!`, 'var(--gold)');
        _updateDailyMissions(container);
        _updateTrainDisplay(container);
      }
    }
  });

  container.querySelector('#train-btn')?.addEventListener('click', () => _handleTrain(container));

  container.querySelector('#master-btn')?.addEventListener('click', () => {
    const result = doMasterTraining();
    if (result) {
      playSound('levelup');
      showEventBanner('🥋','무사시 선생','수련 효율 2배! (15회)', 'var(--gold)');
      _updateTrainDisplay(container);
      if (result.newSkills?.length) setTimeout(()=>showEventBanner('🌟','기술 해금!',result.newSkills.map(s=>s.ko).join(', ')),800);
      result.newAchieve?.forEach((a,i)=>setTimeout(()=>showAchievementPopup(a),600+i*1400));
    } else {
      playSound('error');
      showModal('error',{message:`스승 훈련에는 ${MASTER_TRAIN_COST.toLocaleString()}G가 필요합니다.\n현재: ${getPlayer().gold.toLocaleString()}G`});
    }
  });

  container.querySelector('#master-icon')?.addEventListener('click', () => {
    const quotes = NPC_MASTERS[0].quotes_ko;
    const el = container.querySelector('#mq');
    if (el) { el.style.opacity='0'; setTimeout(()=>{ el.textContent=quotes[Math.floor(Math.random()*quotes.length)]; el.style.opacity='1'; },120); }
    playSound('button');
  });

  container.querySelector('#goal-btn')?.addEventListener('click', () => showGoalScreen());

  // 키보드 단축키
  const kh = e => {
    if ((e.code==='Space'||e.code==='Enter') && document.querySelector('#screen-train.active')) {
      e.preventDefault();
      _handleTrain(container);
    }
  };
  document.addEventListener('keydown', kh);
  container._cleanupKey = () => document.removeEventListener('keydown', kh);
}

function _handleTrain(container) {
  if (!_trainChar || _trainChar.animating) return;
  const strikeId = container._selectedStrike || getCurrentWeapon().strikes[0]?.id;
  if (!strikeId) return;

  const trainBtn = container.querySelector('#train-btn');
  trainBtn?.classList.add('striking');
  setTimeout(()=>trainBtn?.classList.remove('striking'),200);

  playSound('swing');
  const ov = container.querySelector('#hit-ov');
  _trainChar.strike(strikeId, () => {
    playSound('hit');
    if (ov) showHitSpark(ov, 55+Math.random()*30, 20+Math.random()*20, getCurrentWeapon().color);
  });

  const result = doTrain(strikeId);
  if (!result) return;

  if (ov) {
    let yi=0;
    Object.entries(result.gains).forEach(([stat,val])=>{
      setTimeout(()=>{
        showFloatingText(ov, `+${val.toFixed(1)} ${stat.toUpperCase()}`, 20+Math.random()*60, 8+yi*16, STATS[stat]?.color||'#fff');
        yi++;
      },yi*90);
    });
    if (result.goldGain) setTimeout(()=>showFloatingText(ov,`+${result.goldGain}G`,30+Math.random()*40,72,'#e8c468'),230);
  }

  if (result.newDan) setTimeout(()=>{ playSound('levelup'); showLevelUpScreen(result.newDan); _trainChar?.celebrate(); },450);
  if (result.newSkills?.length) setTimeout(()=>{ playSound('skill'); showEventBanner('🌟','기술 해금!',result.newSkills.map(s=>s.ko).join(', ')); },320);
  result.newAchieve?.forEach((a,i)=>setTimeout(()=>{ playSound('achieve'); showAchievementPopup(a); },650+i*1450));

  _updateTrainDisplay(container);
  _updateDailyMissions(container);
}

function _startEffTimer() {
  if (_effTimer) clearInterval(_effTimer);
  _effTimer = setInterval(()=>{ tickEfficiency(); },5000);
}
