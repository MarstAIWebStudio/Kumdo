// ============================================================
// SCREEN: 대회 (수동 대전) - 전투 파워 버그 수정
// ============================================================

function renderTournamentScreen(container) {
  const p = getPlayer(); if (!p) return;
  container.innerHTML = `
    <div class="card" style="margin-bottom:12px;">
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;text-align:center;">
        <div class="stat-kpi"><div class="kpi-val" style="color:var(--gold);">${p.tournament_wins}</div><div class="kpi-l">총 우승</div></div>
        <div class="stat-kpi"><div class="kpi-val" style="color:var(--accent2);">${p.national_wins||0}</div><div class="kpi-l">전국 우승</div></div>
        <div class="stat-kpi"><div class="kpi-val" style="color:var(--spd);">${p.season_points||0}</div><div class="kpi-l">시즌 P</div></div>
      </div>
    </div>

    <div style="background:var(--surface);border:1px solid var(--border);border-radius:6px;padding:10px 12px;margin-bottom:14px;font-size:10px;color:var(--text3);line-height:1.8;">
      🗓 대회는 <b style="color:var(--accent2);">주 1회</b> 참가 가능합니다.<br>
      ⚔️ 현재 무기: <b style="color:${getCurrentWeapon().color};">${getCurrentWeapon().icon} ${getCurrentWeapon().ko}</b><br>
      💪 전투 파워: <b style="color:var(--gold);">${Math.round(getPlayerPower())}</b>
    </div>

    <div class="section-title">대회 선택</div>
    <div id="stage-list">
      ${TOURNAMENT_STAGES.map(stage=>{
        const danOk = p.dan >= stage.req_dan;
        const cool = getTournamentCooldownInfo(stage.id);
        const canEnter = danOk && cool.available;
        return `
          <div class="stage-card ${canEnter?'clickable':'locked'}" ${canEnter?`data-stage="${stage.id}"`:''}
            style="opacity:${danOk?1:0.4};cursor:${canEnter?'pointer':'default'};">
            <div class="stage-icon">${stage.icon}</div>
            <div style="flex:1;">
              <div class="stage-name">${stage.ko}</div>
              <div class="stage-meta">
                ${!danOk?`🔒 ${stage.req_dan}단 필요 (현재 ${p.dan}단)`:cool.used?`✓ 이번 주 참가 완료`:`상금 ${stage.prize.toLocaleString()}G`}
              </div>
              <div style="font-size:9px;color:var(--text3);margin-top:2px;">${stage.desc}</div>
            </div>
            ${canEnter?`<div style="color:var(--accent2);font-size:18px;">▶</div>`:''}
          </div>`;
      }).join('')}
    </div>

    <div class="section-title">최근 대회 기록</div>
    <div class="card" style="padding:10px;">
      ${(p.tournament_history||[]).slice(0,10).map(h=>{
        const stage=TOURNAMENT_STAGES.find(s=>s.id===h.stage);
        return `<div class="log-entry">
          <div class="log-date">${new Date(h.date).toLocaleString('ko-KR')}</div>
          <div>${stage?.ko||h.stage} — ${h.result==='win'?`<span style="color:var(--spd);">승리 🏆</span>`:`<span style="color:var(--accent);">패배</span>`}</div>
        </div>`;
      }).join('')||'<div class="empty-state"><div class="empty-icon">🏟️</div>대회 기록이 없습니다</div>'}
    </div>
  `;

  container.querySelectorAll('[data-stage]').forEach(card=>{
    card.addEventListener('click',()=>{
      playSound('button');
      _showStageSetup(container, card.dataset.stage);
    });
  });
}

function _showStageSetup(container, stageId) {
  const stage = TOURNAMENT_STAGES.find(s=>s.id===stageId);
  const opponents = TOURNAMENT_OPPONENTS[stageId];
  const weapon = getCurrentWeapon();

  container.innerHTML = `
    <div class="card" style="border-color:var(--accent2);margin-bottom:12px;">
      <div style="font-size:18px;margin-bottom:6px;">${stage.icon} ${stage.ko}</div>
      <div style="font-size:11px;color:var(--text3);">${stage.desc}</div>
      <div style="font-size:11px;color:var(--gold);margin-top:6px;">상금: ${stage.prize.toLocaleString()}G</div>
    </div>

    <div class="card" style="border-color:${weapon.color}44;margin-bottom:12px;">
      <div style="display:flex;gap:10px;align-items:center;">
        <div style="font-size:24px;">${weapon.icon}</div>
        <div>
          <div style="font-size:12px;font-weight:700;color:${weapon.color};">${weapon.ko}로 참가</div>
          <div style="font-size:10px;color:var(--text3);">전투 파워: ${Math.round(getPlayerPower())}</div>
        </div>
      </div>
    </div>

    <div class="section-title">대전 상대 (3명 순서대로 격파)</div>
    ${opponents.map((opp,i)=>`
      <div class="card" style="display:flex;align-items:center;gap:12px;margin-bottom:8px;">
        <div style="font-size:28px;">${opp.is_final_boss?'👹':'🥋'}</div>
        <div style="flex:1;">
          <div style="font-size:13px;font-weight:700;">${i+1}. ${opp.name_ko} <span style="font-size:10px;color:var(--text3);">(${opp.dan}단)</span></div>
          <div style="font-size:10px;color:var(--text3);font-style:italic;margin-top:2px;">"${opp.quote_ko}"</div>
        </div>
      </div>`).join('')}

    <div class="card" style="background:var(--bg3);margin-bottom:14px;font-size:10px;color:var(--text3);line-height:1.9;">
      ⬆️ 머리치기 · ⬅️ 손목치기 · ➡️ 몸통치기 · ⬇️ 찌르기<br>
      🛡 방어: 다음 피해 50% 감소 · 💨 회피: 55% 확률 완전 회피<br>
      🌟 스킬: 해금된 전투 스킬 사용 가능<br>
      <b style="color:var(--accent2);">3점 선취 승!</b>
    </div>

    <div style="display:flex;gap:8px;">
      <button class="btn btn-full" id="cancel-t">취소</button>
      <button class="btn btn-primary btn-full" id="start-t">대련 시작!</button>
    </div>
  `;

  container.querySelector('#cancel-t').onclick = ()=>renderTournamentScreen(container);
  container.querySelector('#start-t').onclick = ()=>{
    playSound('button');
    _runTournament(container, stageId, opponents);
  };
}

function _runTournament(container, stageId, opponents) {
  let oppIdx = 0;

  function fightNext() {
    if (oppIdx >= opponents.length) { _showResult(true); return; }
    const opp = opponents[oppIdx];
    startBattle(container, stageId, opp, (won) => {
      if (won) {
        oppIdx++;
        if (oppIdx >= opponents.length) {
          _showResult(true);
        } else {
          showModal('info', {
            title: `${opp.name_ko} 격파!`,
            message: `다음 상대:\n${opponents[oppIdx].name_ko} (${opponents[oppIdx].dan}단)\n"${opponents[oppIdx].quote_ko}"`,
            okLabel: '계속',
            onConfirm: fightNext,
          });
        }
      } else {
        _showResult(false);
      }
    });
  }

  function _showResult(won) {
    const stage = TOURNAMENT_STAGES.find(s=>s.id===stageId);
    const extras = recordTournamentResult(stageId, won);

    container.innerHTML = `
      <div style="text-align:center;padding:50px 20px;">
        <div style="font-size:60px;margin-bottom:16px;animation:popIn .5s ease;">${won?'🏆':'😔'}</div>
        <div style="font-size:20px;font-weight:900;margin-bottom:10px;color:${won?'var(--gold)':'var(--text2)'};">${won?'대회 우승!':'대회 탈락'}</div>
        ${won?`<div style="font-size:14px;color:var(--text2);margin-bottom:6px;">+${stage.prize.toLocaleString()}G 획득</div>`:''}
        ${won&&stage.is_final?`<div style="font-size:14px;color:var(--gold);margin-bottom:6px;">🎉 세계대회 우승!</div>`:''}
        <div style="font-size:11px;color:var(--text3);margin-bottom:30px;">${opponents.length}명의 상대와 겨뤘습니다</div>
        <button class="btn btn-primary btn-full" id="result-ok">확인</button>
      </div>
    `;

    container.querySelector('#result-ok').onclick = ()=>{
      if (extras.newDan) showLevelUpScreen(extras.newDan);
      if (extras.newSkills?.length) setTimeout(()=>showEventBanner('🌟','기술 해금!',extras.newSkills.map(s=>s.ko).join(', ')), extras.newDan?700:0);
      extras.newAchieve?.forEach((a,i)=>setTimeout(()=>showAchievementPopup(a),400+i*1400));
      renderTournamentScreen(container);
    };
  }

  fightNext();
}
