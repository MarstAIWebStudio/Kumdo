// ============================================================
// SCREEN: 도장 선택 + 훈련 시스템
// ============================================================

let _dojoMode = null;       // null = 선택화면, 'normal'|'auto'|'hard'
let _trainChar = null;
let _effTimer  = null;
let _hardTimer = null;
let _hardTimeLeft = 30;
let _autoInterval = null;
let _autoSpeed = 3;         // 초당 횟수
let _sessionHits = 0;
let _sessionStartTime = 0;

// ─── 도장 선택 화면 ───────────────────────────────────────
function renderTrainScreen(container) {
  if (_dojoMode) {
    _renderDojoTraining(container);
    return;
  }
  _renderDojoSelect(container);
}

function _renderDojoSelect(container) {
  const p = getPlayer();
  const weapon = getCurrentWeapon();
  const aiResult = growthAI.analyze(p);

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
          ${!unlocked?`<span style="font-size:8px;color:var(--text3);">${w.unlock?.dan||0}단 해금</span>`:''}
        </button>`;
      }).join('')}
    </div>

    <!-- 단 진행도 -->
    <div class="card" style="border-color:var(--accent2);margin-bottom:14px;">
      <div style="display:flex;justify-content:space-between;font-size:10px;color:var(--text3);margin-bottom:6px;">
        <span id="dt-cur">${getDanProgress().current.title_ko}</span>
        <span id="dt-next">${getDanProgress().next?.title_ko||'MAX'}</span>
      </div>
      <div class="dan-bar-wrap"><div class="dan-bar" id="dan-b" style="width:${Math.round(getDanProgress().progress*100)}%"></div></div>
      <div style="font-size:9px;color:var(--text3);margin-top:4px;text-align:right;" id="dan-req">
        ${getDanProgress().next?`${Math.round(getDanProgress().statTotal)}/${getDanProgress().next.req.total}`:'MAX'}
      </div>
    </div>

    <!-- 도장 선택 -->
    <div class="section-title">도장 선택</div>

    <div class="dojo-card" data-dojo="normal">
      <div class="dojo-icon">🏯</div>
      <div style="flex:1;">
        <div class="dojo-name">일반 도장</div>
        <div class="dojo-desc">시간제한 없음. 화면의 버튼을 눌러 수련합니다.</div>
        <div class="dojo-tags">
          <span class="dojo-tag">⏱ 무제한</span>
          <span class="dojo-tag">XP x1</span>
        </div>
      </div>
      <div style="color:var(--accent2);font-size:18px;">▶</div>
    </div>

    <div class="dojo-card" data-dojo="auto">
      <div class="dojo-icon">🤖</div>
      <div style="flex:1;">
        <div class="dojo-name">수련 도장 <span style="font-size:9px;color:var(--text3);">(자동)</span></div>
        <div class="dojo-desc">설정한 속도로 자동 수련합니다.</div>
        <div class="dojo-tags">
          <span class="dojo-tag">⚡ 자동</span>
          <span class="dojo-tag">XP x1</span>
        </div>
        <div style="margin-top:8px;display:flex;align-items:center;gap:8px;" onclick="event.stopPropagation()">
          <span style="font-size:10px;color:var(--text3);">속도</span>
          <input type="range" id="auto-speed" min="1" max="8" value="${_autoSpeed}" style="flex:1;">
          <span id="auto-speed-val" style="font-size:10px;color:var(--accent2);width:40px;">${_autoSpeed}회/초</span>
        </div>
      </div>
      <div style="color:var(--accent2);font-size:18px;">▶</div>
    </div>

    <div class="dojo-card hard" data-dojo="hard">
      <div class="dojo-icon">🔥</div>
      <div style="flex:1;">
        <div class="dojo-name" style="color:var(--accent);">혹독한 도장</div>
        <div class="dojo-desc">30초 안에 최대한 많이! 버튼이 빠르게 이동합니다.</div>
        <div class="dojo-tags">
          <span class="dojo-tag" style="border-color:var(--accent);color:var(--accent);">⏰ 30초</span>
          <span class="dojo-tag" style="border-color:var(--gold);color:var(--gold);">XP x2</span>
        </div>
      </div>
      <div style="color:var(--accent);font-size:18px;">▶</div>
    </div>

    <!-- AI 코치 패널 -->
    <div class="section-title">🧠 AI 코치</div>
    ${buildGrowthAIPanel(p)}

    <!-- 일일 임무 -->
    <div class="section-title">일일 임무</div>
    <div class="card" style="padding:10px;" id="daily-m"></div>
  `;

  // 속도 슬라이더
  const speedSlider = container.querySelector('#auto-speed');
  const speedVal = container.querySelector('#auto-speed-val');
  speedSlider?.addEventListener('input', () => {
    _autoSpeed = parseInt(speedSlider.value);
    if (speedVal) speedVal.textContent = `${_autoSpeed}회/초`;
  });

  // 무기 선택
  container.querySelectorAll('[data-weapon]').forEach(btn => {
    btn.addEventListener('click', () => {
      if (btn.disabled) return;
      if (switchWeapon(btn.dataset.weapon)) { playSound('equip'); renderTrainScreen(container); }
    });
  });

  // 도장 입장
  container.querySelectorAll('[data-dojo]').forEach(card => {
    card.addEventListener('click', () => {
      _dojoMode = card.dataset.dojo;
      _sessionHits = 0;
      _sessionStartTime = Date.now();
      playSound('button');
      _renderDojoTraining(container);
    });
  });

  // AI 추천 클릭
  container.querySelectorAll('[data-rec-strike]').forEach(el => {
    el.addEventListener('click', () => {
      _dojoMode = 'normal';
      _sessionHits = 0;
      _sessionStartTime = Date.now();
      _renderDojoTraining(container, el.dataset.recStrike);
    });
  });

  // 일일 임무
  _updateDailyMissions(container);
}

// ─── 훈련 화면 ────────────────────────────────────────────
function _renderDojoTraining(container, forcedStrike) {
  const p = getPlayer();
  const weapon = getCurrentWeapon();
  const mode = _dojoMode;
  const isHard = mode === 'hard';
  const isAuto = mode === 'auto';

  // 현재 선택된 타격 (없으면 첫 번째)
  if (!container._selectedStrike || forcedStrike) {
    container._selectedStrike = forcedStrike || weapon.strikes[0]?.id;
  }

  container.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;">
      <button class="btn btn-sm" id="exit-dojo">← 나가기</button>
      <div style="text-align:center;">
        <div style="font-size:11px;color:${isHard?'var(--accent)':isAuto?'var(--spd)':'var(--accent2)'};">
          ${isHard?'🔥 혹독한 도장':isAuto?'🤖 수련 도장':'🏯 일반 도장'}
        </div>
        ${isHard?`<div style="font-family:'Courier New',monospace;font-size:18px;font-weight:900;color:var(--accent);" id="hard-timer">30</div>`:''}
      </div>
      <div style="font-size:11px;color:var(--gold);">
        ${isHard?'XP x2':isAuto?`${_autoSpeed}회/초`:'자유 수련'}
      </div>
    </div>

    <!-- 세션 카운터 -->
    <div style="text-align:center;margin-bottom:12px;">
      <div style="font-family:'Courier New',monospace;font-size:36px;font-weight:900;color:var(--text);" id="session-hits">0</div>
      <div style="font-size:10px;color:var(--text3);">이번 수련</div>
    </div>

    <!-- 타격 선택 (자동 모드 아닐 때만) -->
    ${!isAuto?`
    <div class="strike-buttons" id="strike-btns" style="margin-bottom:14px;">
      ${weapon.strikes.map(s=>`
        <button class="strike-btn ${s.id===container._selectedStrike?'selected':''}" data-strike="${s.id}">
          <span class="strike-icon">${s.icon}</span>
          <span style="font-size:10px;font-weight:700;">${s.ko}</span>
          <span class="strike-count">${(p.hits_by_type[s.id]||0).toLocaleString()}회</span>
        </button>`).join('')}
    </div>`:''}

    <!-- 픽셀 캐릭터 -->
    <div id="char-wrap" style="position:relative;height:${isAuto?'100px':'120px'};display:flex;justify-content:center;align-items:flex-end;margin-bottom:${isAuto?'10px':'0'};">
      <div id="train-char" style="position:relative;"></div>
      <div id="hit-ov" style="position:absolute;inset:0;pointer-events:none;"></div>
    </div>

    <!-- 랜덤 버튼 영역 (일반/하드 모드) -->
    ${!isAuto?`
    <div id="random-btn-area" style="position:relative;height:120px;margin:10px 0;background:var(--bg3);border:1px solid var(--border);border-radius:10px;overflow:hidden;">
      <!-- 버튼이 JS로 랜덤 위치에 생성됨 -->
    </div>`:''}

    <!-- 효율 바 -->
    <div class="efficiency-bar" style="margin-top:8px;">
      <span class="eff-label">수련 효율</span>
      <div class="eff-bar-wrap"><div class="eff-bar" id="eff-b" style="width:${Math.min(100,(p.train_efficiency||1)*50)}%"></div></div>
      <span class="eff-val" id="eff-v">x${(isHard?2:1)*(p.train_efficiency||1).toFixed(1)}</span>
    </div>

    <!-- 통계 -->
    <div class="train-stats-row" style="margin-top:10px;">
      <div class="train-stat-box"><div class="tsb-l">총 수련</div><div class="tsb-v" id="tot-hits">${p.total_hits.toLocaleString()}</div></div>
      <div class="train-stat-box"><div class="tsb-l">오늘 수련</div><div class="tsb-v" id="day-hits">${p.daily_hits.toLocaleString()}</div></div>
    </div>
  `;

  _trainChar = new PixelCharacter(container.querySelector('#train-char'), { pixelSize: isAuto?4:5 });

  // 나가기
  container.querySelector('#exit-dojo')?.addEventListener('click', () => {
    _stopAllTimers();
    _dojoMode = null;
    renderTrainScreen(container);
  });

  // 타격 선택
  container.querySelectorAll('.strike-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      container._selectedStrike = btn.dataset.strike;
      container.querySelectorAll('.strike-btn').forEach(b=>b.classList.remove('selected'));
      btn.classList.add('selected');
      playSound('button');
      // 랜덤 버튼 업데이트
      _spawnRandomButton(container);
    });
  });

  if (isAuto) {
    _startAutoMode(container);
  } else if (isHard) {
    _startHardMode(container);
  } else {
    _startNormalMode(container);
  }
}

// ─── 랜덤 버튼 생성 ───────────────────────────────────────
function _spawnRandomButton(container) {
  const area = container.querySelector('#random-btn-area');
  if (!area) return;
  area.innerHTML = '';

  const isHard = _dojoMode === 'hard';
  const p = getPlayer();
  const weapon = getCurrentWeapon();
  const strikeId = container._selectedStrike || weapon.strikes[0]?.id;
  const strike = weapon.strikes.find(s=>s.id===strikeId);

  // 버튼 크기
  const bw = isHard ? 58 : 70;
  const bh = isHard ? 36 : 44;
  const maxX = area.offsetWidth - bw - 8;
  const maxY = area.offsetHeight - bh - 8;
  const x = Math.max(4, Math.floor(Math.random()*maxX));
  const y = Math.max(4, Math.floor(Math.random()*maxY));

  const btn = document.createElement('button');
  btn.style.cssText = `
    position:absolute;left:${x}px;top:${y}px;
    width:${bw}px;height:${bh}px;
    background:${isHard?'linear-gradient(180deg,#8a2820,#5c1a14)':'linear-gradient(180deg,#1a3060,#0d1e3f)'};
    border:2px solid ${isHard?'var(--accent)':'var(--accent2)'};
    border-radius:8px;color:#fff;font-size:${isHard?'16px':'18px'};
    cursor:pointer;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;
    box-shadow:0 0 ${isHard?'12px rgba(192,57,43,0.4)':'10px rgba(30,90,180,0.3)'};
    animation:popIn .15s ease;
    transition:transform .08s;
  `;
  btn.innerHTML = `<span>${strike?.icon||'⚔️'}</span><span style="font-size:9px;">${strike?.ko||'수련'}</span>`;

  btn.addEventListener('click', () => {
    btn.style.transform = 'scale(0.9)';
    _handleTrainHit(container, false);
  });
  btn.addEventListener('touchstart', e => {
    e.preventDefault();
    btn.style.transform = 'scale(0.9)';
    _handleTrainHit(container, false);
  }, { passive:false });

  area.appendChild(btn);
}

// ─── 모드별 로직 ──────────────────────────────────────────
function _startNormalMode(container) {
  _spawnRandomButton(container);
}

function _startHardMode(container) {
  _hardTimeLeft = 30;
  const timerEl = container.querySelector('#hard-timer');

  _spawnRandomButton(container);

  _hardTimer = setInterval(() => {
    _hardTimeLeft--;
    if (timerEl) {
      timerEl.textContent = _hardTimeLeft;
      if (_hardTimeLeft <= 10) timerEl.style.color = 'var(--accent)';
      if (_hardTimeLeft <= 5)  timerEl.style.animation = 'pulse 0.5s ease infinite';
    }
    if (_hardTimeLeft <= 0) {
      _stopAllTimers();
      _showHardResult(container);
    }
  }, 1000);
}

function _startAutoMode(container) {
  const intervalMs = Math.round(1000 / _autoSpeed);
  let autoStrikeIdx = 0;
  const weapon = getCurrentWeapon();

  _autoInterval = setInterval(() => {
    const strike = weapon.strikes[autoStrikeIdx % weapon.strikes.length];
    container._selectedStrike = strike.id;
    _handleTrainHit(container, true);
    autoStrikeIdx++;
  }, intervalMs);
}

function _stopAllTimers() {
  if (_hardTimer)    { clearInterval(_hardTimer);    _hardTimer = null; }
  if (_autoInterval) { clearInterval(_autoInterval); _autoInterval = null; }
  if (_effTimer)     { clearInterval(_effTimer);     _effTimer = null; }
}

function _showHardResult(container) {
  const timeSpent = 30;
  const xpMult = 2;

  container.innerHTML = `
    <div style="text-align:center;padding:40px 20px;">
      <div style="font-size:52px;margin-bottom:12px;animation:popIn .4s ease;">🔥</div>
      <div style="font-size:20px;font-weight:900;color:var(--accent);margin-bottom:8px;">혹독한 수련 완료!</div>
      <div style="font-size:32px;font-weight:900;color:var(--gold);font-family:'Courier New',monospace;margin-bottom:8px;">${_sessionHits}회</div>
      <div style="font-size:11px;color:var(--text3);margin-bottom:20px;">30초 동안의 수련 · XP 2배 적용됨</div>
      <div class="train-stats-row" style="margin-bottom:20px;">
        <div class="train-stat-box"><div class="tsb-l">총 수련</div><div class="tsb-v">${getPlayer().total_hits.toLocaleString()}</div></div>
        <div class="train-stat-box"><div class="tsb-l">오늘 수련</div><div class="tsb-v">${getPlayer().daily_hits.toLocaleString()}</div></div>
      </div>
      <div style="display:flex;gap:8px;">
        <button class="btn btn-full" id="back-dojo">도장으로</button>
        <button class="btn btn-primary btn-full" id="retry-hard">다시 도전!</button>
      </div>
    </div>
  `;

  container.querySelector('#back-dojo').onclick = () => { _dojoMode=null; renderTrainScreen(container); };
  container.querySelector('#retry-hard').onclick = () => {
    _sessionHits=0; _sessionStartTime=Date.now();
    _dojoMode='hard'; _renderDojoTraining(container);
  };
}

// ─── 실제 수련 처리 ───────────────────────────────────────
function _handleTrainHit(container, isAuto) {
  const isHard = _dojoMode === 'hard';
  const strikeId = container._selectedStrike || getCurrentWeapon().strikes[0]?.id;

  // 캐릭터 애니메이션 (너무 빠르면 스킵)
  if (_trainChar && !_trainChar.animating) {
    const ov = container.querySelector('#hit-ov');
    playSound('swing');
    _trainChar.strike(strikeId, () => {
      playSound('hit');
      if (ov) showHitSpark(ov, 40+Math.random()*40, 10+Math.random()*20, getCurrentWeapon().color);
    });
  }

  // XP 계산 (하드 2배)
  const result = doTrain(strikeId, isHard ? 2.0 : 1.0);
  if (!result) return;

  _sessionHits++;
  const sessionEl = container.querySelector('#session-hits');
  if (sessionEl) {
    sessionEl.textContent = _sessionHits;
    sessionEl.style.animation = 'none';
    void sessionEl.offsetWidth;
    sessionEl.style.animation = 'popIn .1s ease';
  }

  // 플로팅 텍스트 (하드/빠른 자동은 가끔만)
  const ov = container.querySelector('#hit-ov');
  if (ov && (!isAuto || _sessionHits % 5 === 0)) {
    let yi=0;
    Object.entries(result.gains).forEach(([stat,val])=>{
      if (val > 0) setTimeout(()=>{
        showFloatingText(ov, `+${val.toFixed(1)} ${stat.toUpperCase()}${isHard?' ×2':''}`, 10+Math.random()*60, 8+yi*14, STATS[stat]?.color||'#fff');
        yi++;
      },yi*70);
    });
    if (result.goldGain) setTimeout(()=>showFloatingText(ov,`+${result.goldGain}G`,20+Math.random()*40,65,'#e8c468'),200);
  }

  // 업데이트
  const tot = container.querySelector('#tot-hits');
  const day = container.querySelector('#day-hits');
  if (tot) tot.textContent = getPlayer().total_hits.toLocaleString();
  if (day) day.textContent = getPlayer().daily_hits.toLocaleString();

  // 결과 이벤트
  if (result.newDan) setTimeout(()=>{ playSound('levelup'); showLevelUpScreen(result.newDan); _trainChar?.celebrate(); },450);
  if (result.newSkills?.length) setTimeout(()=>{ playSound('skill'); showEventBanner('🌟','기술 해금!',result.newSkills.map(s=>s.ko).join(', ')); },320);
  result.newAchieve?.forEach((a,i)=>setTimeout(()=>{ playSound('achieve'); showAchievementPopup(a); },650+i*1400));

  // 랜덤 버튼 이동 (일반/하드)
  if (!isAuto) {
    const moveDelay = isHard ? 0 : 100;
    setTimeout(() => _spawnRandomButton(container), moveDelay);
  }

  updateHeader(getPlayer());
  updateTabBadges(getPlayer());
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

  // 이벤트 위임
  el.addEventListener('click', e => {
    const btn = e.target.closest('[data-claim]');
    if (btn && claimDailyMission(btn.dataset.claim)) {
      playSound('achieve');
      const m = DAILY_MISSIONS.find(x=>x.id===btn.dataset.claim);
      showToast(`+${m?.reward.gold||0}G 획득!`,'var(--gold)');
      _updateDailyMissions(container);
    }
  });
}
