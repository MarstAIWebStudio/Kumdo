// ============================================================
// UI HELPERS v2
// ============================================================

// ─── 사운드 ───────────────────────────────────────────────
let _actx = null;
function _ctx() {
  if (!_actx) _actx = new (window.AudioContext||window.webkitAudioContext)();
  return _actx;
}
function playSound(key) {
  if (!isSoundEnabled()) return;
  try {
    const ctx = _ctx();
    if (ctx.state==='suspended') ctx.resume();
    const osc=ctx.createOscillator(), g=ctx.createGain();
    osc.connect(g); g.connect(ctx.destination);
    const c = {
      swing:     {f:340,t:'sawtooth',d:.09,v:.18},
      hit:       {f:190,t:'square',  d:.07,v:.25},
      hit_men:   {f:600,t:'square',  d:.09,v:.30},
      hit_kote:  {f:800,t:'square',  d:.07,v:.25},
      hit_do:    {f:290,t:'square',  d:.11,v:.30},
      hit_tsuki: {f:880,t:'triangle',d:.06,v:.25},
      levelup:   {f:880,t:'sine',    d:.45,v:.35},
      skill:     {f:660,t:'sine',    d:.28,v:.30},
      win:       {f:1046,t:'sine',   d:.55,v:.35},
      lose:      {f:200,t:'sawtooth',d:.45,v:.22},
      button:    {f:440,t:'sine',    d:.04,v:.12},
      equip:     {f:520,t:'sine',    d:.14,v:.22},
      gacha:     {f:730,t:'sine',    d:.32,v:.28},
      achieve:   {f:990,t:'sine',    d:.42,v:.35},
      error:     {f:180,t:'square',  d:.18,v:.20},
    }[key] || {f:440,t:'sine',d:.06,v:.12};
    osc.type=c.t; osc.frequency.setValueAtTime(c.f, ctx.currentTime);
    if (key==='levelup'||key==='win') osc.frequency.exponentialRampToValueAtTime(c.f*1.6, ctx.currentTime+c.d);
    g.gain.setValueAtTime(c.v, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime+c.d);
    osc.start(); osc.stop(ctx.currentTime+c.d);
  } catch(e){}
}

// ─── 모달 ─────────────────────────────────────────────────
function showModal(type, opts={}) {
  document.querySelector('#modal-overlay')?.remove();
  const ov = document.createElement('div');
  ov.id='modal-overlay'; ov.className='modal-overlay';
  ov.innerHTML=`
    <div class="modal" style="${opts.borderColor?`border-color:${opts.borderColor};`:''}">
      ${opts.title?`<div class="modal-title">${opts.title}</div>`:''}
      <div class="modal-body">${(opts.message||'').replace(/\n/g,'<br>')}</div>
      <div class="modal-actions">
        ${type==='confirm'?`<button class="btn" id="m-cancel">취소</button>`:''}
        <button class="btn btn-primary" id="m-ok">${opts.okLabel||'확인'}</button>
      </div>
    </div>`;
  document.body.appendChild(ov);
  playSound('button');
  ov.querySelector('#m-ok').onclick = () => { ov.remove(); opts.onConfirm?.(); };
  ov.querySelector('#m-cancel')?.addEventListener('click', () => { ov.remove(); opts.onCancel?.(); });
  ov.onclick = e => { if(e.target===ov){ ov.remove(); opts.onCancel?.(); } };
}

// ─── 업적 팝업 큐 ─────────────────────────────────────────
let _achQ=[], _achBusy=false;
function showAchievementPopup(ach) { _achQ.push(ach); if(!_achBusy) _nextAch(); }
function _nextAch() {
  if (!_achQ.length) { _achBusy=false; return; }
  _achBusy=true;
  const a=_achQ.shift();
  const el=document.createElement('div');
  el.className='achieve-popup';
  el.innerHTML=`<div class="ap-icon">${a.icon}</div><div><div class="ap-title">업적 달성!</div><div class="ap-name">${a.ko}</div>${a.reward?.gold?`<div class="ap-reward">+${a.reward.gold}G</div>`:''}</div>`;
  document.body.appendChild(el);
  requestAnimationFrame(()=>requestAnimationFrame(()=>el.classList.add('show')));
  setTimeout(()=>{ el.classList.remove('show'); setTimeout(()=>{ el.remove(); _nextAch(); },380); },2400);
}

// ─── 레벨업 화면 ──────────────────────────────────────────
function showLevelUpScreen(danInfo) {
  const el=document.createElement('div');
  el.className='levelup-overlay';
  el.innerHTML=`
    <div class="lu-wrap">
      <div class="lu-glow"></div>
      <div class="lu-title">🏆 승단!</div>
      <div class="lu-dan">${danInfo.dan}단 <span>${danInfo.title_ko}</span></div>
      <div class="lu-sub">스탯 포인트 +5 획득!</div>
      <div class="lu-particles" id="lu-pt"></div>
      <button class="btn btn-primary lu-ok" id="lu-ok">계속</button>
    </div>`;
  document.body.appendChild(el);
  const pt=el.querySelector('#lu-pt');
  const cols=['#e8c468','#c0392b','#3498db','#2ecc71','#9b59b6','#f39c12'];
  for(let i=0;i<20;i++){
    const p=document.createElement('div');
    p.className='lu-particle';
    p.style.cssText=`left:${Math.random()*260}px;top:${Math.random()*40}px;background:${cols[Math.floor(Math.random()*cols.length)]};animation-delay:${Math.random()*0.4}s;animation-duration:${0.5+Math.random()*0.6}s;`;
    pt.appendChild(p);
  }
  el.querySelector('#lu-ok').onclick=()=>el.remove();
  setTimeout(()=>el.remove(),5500);
}

// ─── 이벤트 배너 ──────────────────────────────────────────
let _bannerT=null;
function showEventBanner(icon, title, text, color) {
  document.querySelector('#ev-banner')?.remove();
  if(_bannerT) clearTimeout(_bannerT);
  const el=document.createElement('div');
  el.id='ev-banner'; el.className='event-banner';
  el.style.cssText=`position:fixed;top:70px;left:50%;transform:translateX(-50%);z-index:400;max-width:420px;width:calc(100% - 28px);animation:slideDown .3s ease;${color?`border-color:${color};`:''}`;
  el.innerHTML=`<div class="ev-icon">${icon}</div><div class="ev-text"><div class="ev-title"${color?` style="color:${color}"`:''}>${title}</div><div>${text}</div></div>`;
  document.body.appendChild(el);
  _bannerT=setTimeout(()=>el.remove(),2800);
}

// ─── 토스트 ───────────────────────────────────────────────
function showToast(msg, color) {
  const el=document.createElement('div');
  el.className='toast';
  if(color) el.style.borderColor=color;
  el.textContent=msg;
  document.body.appendChild(el);
  setTimeout(()=>el.remove(),2000);
}

// ─── 가챠 결과 모달 ────────────────────────────────────────
function showGachaResult(item, container) {
  const tier = TIERS[item.tier];
  container.innerHTML=`
    <div class="modal-overlay" id="gacha-ov">
      <div class="modal gacha-modal" style="border-color:${tier.color};box-shadow:0 0 40px ${tier.glow};text-align:center;">
        <div class="gacha-anim">
          <div class="gacha-shine" style="background:radial-gradient(circle,${tier.glow},transparent 70%);"></div>
          <div class="gacha-icon-big">${item.icon}</div>
        </div>
        <div style="font-size:11px;color:${tier.color};font-weight:700;margin-bottom:6px;">◆ ${tier.ko}</div>
        <div style="font-size:16px;font-weight:800;margin-bottom:6px;">${item.ko}</div>
        <div style="font-size:10px;color:var(--text3);">${Object.entries(item.stats).map(([k,v])=>`${STATS[k].ko} +${v}`).join(' · ')}</div>
        <button class="btn btn-primary btn-full" id="gacha-ok" style="margin-top:16px;">확인</button>
      </div>
    </div>`;
  const close=()=>{ container.innerHTML=''; };
  container.querySelector('#gacha-ok').onclick=close;
  container.querySelector('#gacha-ov').onclick=e=>{if(e.target.id==='gacha-ov')close();};
}

// ─── 헤더/뱃지 ────────────────────────────────────────────
function updateHeader(p) {
  const g=document.querySelector('#header-gold'),
        gm=document.querySelector('#header-gems'),
        dn=document.querySelector('#header-dan');
  if(g)  g.textContent=(p.gold||0).toLocaleString();
  if(gm) gm.textContent=(p.gems||0).toLocaleString();
  if(dn) dn.textContent=`${(DAN_RANKS[p.dan]||DAN_RANKS[0]).title_ko} · ${p.name}`;
}

function updateTabBadges(p) {
  const b=document.querySelector('#tab-achieve-badge');
  if(!b) return;
  const claimable = DAILY_MISSIONS.some(m=>!p.daily_missions_done.includes(m.id) && getDailyMissionProgress(m).cur>=getDailyMissionProgress(m).req)
    || WEEKLY_CHALLENGES.some(c=>!p.weekly_done.includes(c.id) && getWeeklyProgress(c).cur>=getWeeklyProgress(c).req);
  b.style.display=claimable?'flex':'none';
}

function applyBodyBg() {
  const p=getPlayer(); if(!p) return;
  const bg=BACKGROUNDS.find(b=>b.id===p.background)||BACKGROUNDS[0];
  document.body.style.background=`linear-gradient(155deg,${bg.color1},${bg.color2} 55%,#08060e)`;
}
