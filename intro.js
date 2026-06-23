// ============================================================
// INTRO / GOAL SCREEN
// ============================================================

function showIntroScreen(onDone) {
  const el = document.createElement('div');
  el.id = 'intro-screen';
  el.style.cssText = `position:fixed;inset:0;z-index:900;background:#08060e;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:32px 24px;text-align:center;overflow:hidden;`;

  el.innerHTML = `
    <div id="intro-particles" style="position:absolute;inset:0;pointer-events:none;overflow:hidden;"></div>

    <div style="position:relative;z-index:2;">
      <div class="intro-sword" style="font-size:56px;margin-bottom:10px;animation:introSword 1.2s ease-out;">⚔️</div>
      <div style="font-family:'Courier New',monospace;font-size:36px;font-weight:900;letter-spacing:8px;color:var(--accent2);margin-bottom:4px;animation:fadeInUp .8s .3s both;">KENDO</div>
      <div style="font-size:14px;letter-spacing:6px;color:var(--text3);margin-bottom:6px;animation:fadeInUp .8s .5s both;">剣 の 道</div>
      <div style="font-size:13px;color:var(--text2);margin-bottom:28px;animation:fadeInUp .8s .7s both;">검의 길을 걷다</div>

      <div class="intro-goal-card" style="animation:fadeInUp .8s .9s both;">
        <div style="font-size:11px;color:var(--accent2);font-weight:700;letter-spacing:2px;margin-bottom:10px;">🎯 목 표</div>
        <div class="goal-item"><span class="goal-num">01</span><span>수련을 반복해 스탯을 올려라</span></div>
        <div class="goal-item"><span class="goal-num">02</span><span>스킬을 해금하고 기술을 연마하라</span></div>
        <div class="goal-item"><span class="goal-num">03</span><span>단수를 올려 대회 참가 자격을 얻어라</span></div>
        <div class="goal-item"><span class="goal-num">04</span><span>지역 → 시 → 도 → 전국대회 → <span style="color:var(--accent2);font-weight:700;">세계대회</span> 우승!</span></div>
        <div class="goal-item"><span class="goal-num">05</span><span>세계 최강 <span style="color:var(--accent);">???</span>를 쓰러뜨려라</span></div>
      </div>

      <div style="animation:fadeInUp .8s 1.3s both;">
        <button class="btn btn-primary intro-start-btn" id="intro-start" style="width:220px;padding:16px;font-size:14px;font-weight:800;letter-spacing:2px;margin-top:20px;box-shadow:0 0 30px rgba(192,57,43,0.4);">
          시작하기
        </button>
        <div style="font-size:9px;color:var(--text3);margin-top:10px;">한국어 · English · 日本語</div>
      </div>
    </div>
  `;

  document.body.appendChild(el);

  // 배경 파티클
  const pt = el.querySelector('#intro-particles');
  for (let i = 0; i < 30; i++) {
    const p = document.createElement('div');
    const size = 1 + Math.random() * 2;
    p.style.cssText = `
      position:absolute;
      left:${Math.random()*100}%;top:${Math.random()*100}%;
      width:${size}px;height:${size}px;
      background:rgba(232,196,104,${0.1+Math.random()*0.3});
      border-radius:50%;
      animation:twinkle ${2+Math.random()*3}s ease-in-out ${Math.random()*2}s infinite;
    `;
    pt.appendChild(p);
  }

  el.querySelector('#intro-start').addEventListener('click', () => {
    el.style.animation = 'fadeOut .4s ease forwards';
    setTimeout(() => { el.remove(); onDone(); }, 380);
  });
}

function showGoalScreen() {
  const el = document.createElement('div');
  el.className = 'modal-overlay';
  el.innerHTML = `
    <div class="modal" style="max-width:340px;border-color:var(--accent2);">
      <div class="modal-title">🎯 게임 목표</div>
      <div style="font-size:12px;color:var(--text2);line-height:1.9;">
        <div style="margin-bottom:10px;padding:10px;background:var(--bg3);border-radius:6px;">
          <div style="color:var(--accent2);font-weight:700;margin-bottom:6px;">🥋 수련</div>
          수련장에서 면·코테·도·츠키 타격을 반복해<br>
          <b style="color:var(--text);">스탯을 올리고 스킬을 해금</b>하세요.<br>
          스탯 총합이 오를수록 <b style="color:var(--gold);">단(段)</b>이 올라갑니다.
        </div>
        <div style="margin-bottom:10px;padding:10px;background:var(--bg3);border-radius:6px;">
          <div style="color:var(--accent2);font-weight:700;margin-bottom:6px;">🏆 대회</div>
          단수 조건을 채우면 <b style="color:var(--text);">주 1회</b> 대회에 참가할 수 있습니다.<br>
          직접 조작하는 <b style="color:var(--text);">수동 전투</b>로 3점 선취 시 승리!<br>
          지역 → 시 → 도 → <b style="color:var(--gold);">전국대회</b> 순서로 진행됩니다.
        </div>
        <div style="padding:10px;background:var(--bg3);border-radius:6px;">
          <div style="color:var(--accent2);font-weight:700;margin-bottom:6px;">⚔️ 최종 목표</div>
          <b style="color:var(--accent);">미야모토 켄</b>을 쓰러뜨리고<br>
          전국대회 우승을 차지하세요!
        </div>
      </div>
      <div class="modal-actions"><button class="btn btn-primary" id="goal-ok">확인</button></div>
    </div>
  `;
  document.body.appendChild(el);
  el.querySelector('#goal-ok').onclick = () => el.remove();
  el.onclick = e => { if(e.target===el) el.remove(); };
}
