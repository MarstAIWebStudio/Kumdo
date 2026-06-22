// ============================================================
// SCREEN: 랭킹 + 친구 / 설정
// ============================================================
let _rankTab = 'global';
let _lbSortBy = 'tournament_wins';

async function renderRankScreen(container) {
  const p = getPlayer();
  container.innerHTML = `
    <div class="subtab-bar" style="margin-bottom:14px;">
      <button class="subtab ${_rankTab==='global'?'active':''}" data-rtab="global">🌍 전체 랭킹</button>
      <button class="subtab ${_rankTab==='friends'?'active':''}" data-rtab="friends">👥 친구</button>
    </div>

    ${_rankTab==='global'?`
      <div style="display:flex;gap:6px;margin-bottom:12px;">
        ${[{id:'tournament_wins',ko:'우승'},{id:'stat_total',ko:'스탯'},{id:'total_hits',ko:'수련'}].map(s=>`
          <button class="btn btn-sm ${_lbSortBy===s.id?'btn-primary':''}" data-sort="${s.id}" style="flex:1;">${s.ko}</button>`).join('')}
      </div>
      <div id="lb-list"><div class="empty-state"><div style="font-size:20px;margin-bottom:8px;">⏳</div>불러오는 중...</div></div>
    `:`
      ${!isLoggedIn()||isGuest()?`
        <div class="card" style="text-align:center;padding:20px;">
          <div style="font-size:28px;margin-bottom:8px;">🔒</div>
          <div style="font-size:12px;color:var(--text3);">친구 기능은 회원 로그인이 필요합니다</div>
        </div>
      `:`
        <div class="card" style="margin-bottom:12px;">
          <div class="card-title" style="margin-bottom:10px;">친구 추가</div>
          <div style="display:flex;gap:8px;">
            <input class="auth-input" id="friend-search" placeholder="닉네임으로 검색" style="flex:1;margin:0;">
            <button class="btn btn-primary btn-sm" id="search-friend-btn">검색</button>
          </div>
          <div id="search-result" style="margin-top:10px;"></div>
          <div style="font-size:9px;color:var(--text3);margin-top:8px;">
            내 닉네임: <b style="color:var(--accent2);">${p?.name||'?'}</b>
          </div>
        </div>
      `}
      <div class="section-title">친구 목록</div>
      <div id="friend-list"><div class="empty-state"><div style="font-size:20px;margin-bottom:8px;">⏳</div>불러오는 중...</div></div>
    `}
  `;

  container.querySelectorAll('[data-rtab]').forEach(btn=>btn.addEventListener('click',()=>{ _rankTab=btn.dataset.rtab; renderRankScreen(container); }));
  container.querySelectorAll('[data-sort]').forEach(btn=>btn.addEventListener('click',()=>{ _lbSortBy=btn.dataset.sort; renderRankScreen(container); }));

  if (_rankTab==='global') {
    try {
      const data = await getLeaderboard(_lbSortBy, 50);
      const myUid = getCurrentUser()?.uid;
      const lb = container.querySelector('#lb-list');
      if (!lb) return;
      if (!data.length) {
        lb.innerHTML='<div class="empty-state"><div class="empty-icon">🏆</div>아직 랭킹 데이터가 없습니다<br><span style="font-size:10px;">게임을 저장하면 랭킹에 등록됩니다</span></div>';
        return;
      }
      lb.innerHTML = data.map((entry,i)=>`
        <div class="lb-row ${entry.uid===myUid?'my-row':''}">
          <div class="lb-rank ${i===0?'top1':i===1?'top2':i===2?'top3':''}">${i===0?'🥇':i===1?'🥈':i===2?'🥉':i+1}</div>
          <div style="flex:1;">
            <div class="lb-name">${entry.name||'익명'}${entry.uid===myUid?' <span style="font-size:9px;color:var(--accent2);">(나)</span>':''}</div>
            <div class="lb-dan">${DAN_RANKS[entry.dan||0]?.title_ko||'무단'} · ${WEAPONS[entry.current_weapon||'shinai']?.ko||'죽도'}</div>
          </div>
          <div class="lb-val">${(entry[_lbSortBy]||0).toLocaleString()}</div>
        </div>`).join('');
    } catch(e) {
      const lb=container.querySelector('#lb-list');
      if(lb) lb.innerHTML='<div class="empty-state">랭킹을 불러올 수 없습니다</div>';
    }
  } else {
    // 친구 검색
    const searchBtn = container.querySelector('#search-friend-btn');
    const searchInput = container.querySelector('#friend-search');
    const searchResult = container.querySelector('#search-result');

    searchBtn?.addEventListener('click', async () => {
      const query = searchInput?.value?.trim();
      if (!query) return;
      searchBtn.disabled=true; searchBtn.textContent='검색중...';
      const result = await findUserByName(query);
      searchBtn.disabled=false; searchBtn.textContent='검색';
      if (!searchResult) return;
      if (result.ok) {
        searchResult.innerHTML=`
          <div class="card" style="display:flex;align-items:center;gap:10px;padding:10px;">
            <div style="font-size:24px;">🥋</div>
            <div style="flex:1;">
              <div style="font-size:13px;font-weight:700;">${result.name}</div>
            </div>
            <button class="btn btn-sm btn-primary" id="add-btn">친구 추가</button>
          </div>`;
        searchResult.querySelector('#add-btn')?.addEventListener('click', async()=>{
          const r = await sendFriendRequest(result.uid, result.name);
          showToast(r.msg, r.ok?'var(--spd)':'var(--accent)');
          if(r.ok) renderRankScreen(container);
        });
      } else {
        searchResult.innerHTML=`<div style="font-size:11px;color:var(--accent);padding:8px;">${result.msg}</div>`;
      }
    });
    searchInput?.addEventListener('keydown', e=>{ if(e.key==='Enter') searchBtn?.click(); });

    // 친구 목록
    try {
      const friends = await getFriendList();
      const fl = container.querySelector('#friend-list');
      if (!fl) return;
      if (!friends.length) {
        fl.innerHTML='<div class="empty-state"><div class="empty-icon">👥</div>친구가 없습니다<br><span style="font-size:10px;color:var(--text3);">닉네임으로 친구를 검색해보세요</span></div>';
        return;
      }
      fl.innerHTML = friends.map(f=>`
        <div class="card" style="margin-bottom:10px;">
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;">
            <div style="font-size:28px;">${WEAPONS[f.current_weapon||'shinai']?.icon||'⚔️'}</div>
            <div style="flex:1;">
              <div style="font-size:13px;font-weight:700;">${f.name||'익명'}</div>
              <div style="font-size:10px;color:var(--text3);">${DAN_RANKS[f.dan||0]?.title_ko||'무단'} · ${WEAPONS[f.current_weapon||'shinai']?.ko||'죽도'}</div>
            </div>
            <button class="btn btn-sm btn-danger" data-remove="${f.uid}" style="font-size:9px;">삭제</button>
          </div>
          <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px;text-align:center;font-size:9px;margin-bottom:8px;">
            <div><div style="color:var(--gold);font-weight:700;">${f.tournament_wins||0}</div><div style="color:var(--text3);">우승</div></div>
            <div><div style="color:var(--spd);font-weight:700;">${(f.total_hits||0).toLocaleString()}</div><div style="color:var(--text3);">수련</div></div>
            <div><div style="color:var(--accent2);font-weight:700;">${f.stat_total||0}</div><div style="color:var(--text3);">스탯</div></div>
          </div>
          ${f.stats?`
            <div>
              ${Object.keys(STATS).map(s=>{
                const val=f.stats[s]||0, pct=Math.min(100,(val/600)*100);
                return `<div class="stat-row" style="margin-bottom:5px;">
                  <div class="stat-label" style="color:${STATS[s].color};font-size:9px;">${STATS[s].ko}</div>
                  <div class="stat-bar-wrap" style="height:5px;"><div class="stat-bar" style="width:${pct}%;background:${STATS[s].color};"></div></div>
                  <div class="stat-val" style="font-size:9px;">${Math.floor(val)}</div>
                </div>`;
              }).join('')}
            </div>
          `:''}
        </div>`).join('');

      fl.querySelectorAll('[data-remove]').forEach(btn=>{
        btn.addEventListener('click',()=>{
          showModal('confirm',{message:'친구를 삭제하시겠습니까?',onConfirm:async()=>{ await removeFriend(btn.dataset.remove); renderRankScreen(container); }});
        });
      });
    } catch(e) {
      const fl=container.querySelector('#friend-list');
      if(fl) fl.innerHTML='<div class="empty-state">친구 목록을 불러올 수 없습니다</div>';
    }
  }
}

// ============================================================
// SCREEN: 설정
// ============================================================
function renderSettingsScreen(container) {
  const p=getPlayer(); if(!p) return;
  const user=getCurrentUser();

  container.innerHTML=`
    <!-- 계정 -->
    <div class="card">
      <div class="card-title" style="margin-bottom:12px;">계정</div>
      ${user?`
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px;">
          <div style="font-size:28px;">${isGuest()?'👤':'👑'}</div>
          <div>
            <div style="font-size:13px;font-weight:700;">${user.displayName||p.name}</div>
            <div style="font-size:10px;color:var(--text3);">${isGuest()?'게스트 계정':(user.email||'')}</div>
            ${isGuest()?`<div style="font-size:9px;color:var(--text3);margin-top:2px;">💡 회원가입하면 데이터가 클라우드에 저장됩니다</div>`:''}
          </div>
        </div>
        <button class="btn btn-danger btn-sm" id="logout-btn">로그아웃</button>
      `:`<div style="font-size:12px;color:var(--text3);">로그인되지 않았습니다</div>`}
    </div>

    <!-- 효과음 -->
    <div class="card">
      <div class="card-header">
        <span class="card-title">효과음</span>
        <button class="btn btn-sm ${isSoundEnabled()?'btn-primary':''}" id="sound-toggle">${isSoundEnabled()?'🔊 ON':'🔇 OFF'}</button>
      </div>
    </div>

    <!-- 배경 -->
    <div class="card">
      <div class="card-title" style="margin-bottom:10px;">배경 테마</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
        ${BACKGROUNDS.map(bg=>`
          <button class="btn btn-sm ${p.background===bg.id?'btn-primary':''}" data-bg="${bg.id}">${bg.ko}</button>`).join('')}
      </div>
    </div>

    <!-- 강조색 -->
    <div class="card">
      <div class="card-title" style="margin-bottom:10px;">강조색</div>
      <div style="display:flex;gap:10px;flex-wrap:wrap;">
        ${['#e8c468','#e74c3c','#3498db','#2ecc71','#9b59b6','#f39c12','#e91e63','#00bcd4'].map(c=>`
          <button class="color-swatch ${p.accent_color===c?'active':''}" data-color="${c}" style="background:${c};width:32px;height:32px;border-radius:50%;border:2px solid ${p.accent_color===c?'#fff':'transparent'};cursor:pointer;"></button>`).join('')}
      </div>
    </div>

    <!-- 수련 메모 -->
    <div class="card">
      <div class="card-title" style="margin-bottom:10px;">📖 수련 메모</div>
      <textarea class="memo-input" id="memo-txt" placeholder="오늘의 수련 메모..."></textarea>
      <button class="btn btn-primary btn-sm btn-full" id="add-memo" style="margin-top:8px;">추가</button>
      <div style="margin-top:10px;">
        ${(p.memo||[]).slice(0,8).map(m=>`
          <div class="log-entry">
            <div class="log-date">${new Date(m.date).toLocaleString('ko-KR')}</div>
            <div>${m.text}</div>
          </div>`).join('')||'<div style="font-size:11px;color:var(--text3);">메모 없음</div>'}
      </div>
    </div>

    <!-- 시즌 -->
    <div class="card">
      <div class="card-header">
        <span class="card-title">🏅 시즌 포인트</span>
        <span style="font-size:16px;font-weight:800;color:var(--gold);">${p.season_points||0}</span>
      </div>
    </div>

    <!-- 데이터 초기화 -->
    <div class="card" style="border-color:#8a3030;margin-bottom:6px;">
      <div class="card-title" style="color:#e89b9b;margin-bottom:8px;">⚠️ 데이터 초기화</div>
      <div style="font-size:10px;color:var(--text3);margin-bottom:10px;">모든 진행 상황이 삭제됩니다. 되돌릴 수 없습니다.</div>
      <button class="btn btn-danger btn-full" id="reset-btn">게임 데이터 전체 초기화</button>
    </div>
  `;

  container.querySelector('#logout-btn')?.addEventListener('click',()=>{
    showModal('confirm',{message:'로그아웃 하시겠습니까?',onConfirm:async()=>{ await signOut(); location.reload(); }});
  });
  container.querySelector('#sound-toggle')?.addEventListener('click',()=>{ setSoundEnabled(!isSoundEnabled()); renderSettingsScreen(container); });
  container.querySelectorAll('[data-bg]').forEach(btn=>btn.addEventListener('click',()=>{ setBackground(btn.dataset.bg); applyBodyBg(); renderSettingsScreen(container); }));
  container.querySelectorAll('[data-color]').forEach(btn=>btn.addEventListener('click',()=>{ setAccentColor(btn.dataset.color); renderSettingsScreen(container); }));
  container.querySelector('#add-memo')?.addEventListener('click',()=>{
    const txt=container.querySelector('#memo-txt')?.value;
    if(txt?.trim()){ addMemo(txt); container.querySelector('#memo-txt').value=''; renderSettingsScreen(container); }
  });
  container.querySelector('#reset-btn')?.addEventListener('click',()=>{
    showModal('confirm',{
      title:'⚠️ 정말 초기화?',
      message:'모든 진행 상황이 삭제됩니다.\n이 작업은 되돌릴 수 없습니다.',
      onConfirm:()=>resetGame()
    });
  });
}
