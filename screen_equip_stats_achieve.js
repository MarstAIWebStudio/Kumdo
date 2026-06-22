// ============================================================
// SCREEN: 스탯 / 장비 / 업적
// ============================================================

// ─── 스탯 ─────────────────────────────────────────────────
function renderStatsScreen(container) {
  const p = getPlayer(); if (!p) return;
  const eq = getEquipBonus();
  const prog = getDanProgress();
  const total = statTotal();

  container.innerHTML = `
    <div class="card" style="text-align:center;margin-bottom:12px;">
      <div style="font-size:42px;margin-bottom:8px;">🥋</div>
      <div style="font-size:16px;font-weight:800;color:var(--accent2);margin-bottom:3px;">${p.name}</div>
      <div style="font-size:11px;color:var(--text3);">${_getTitleName(p)}</div>
      <div style="margin:14px 0 8px;">
        <div style="display:flex;justify-content:space-between;font-size:10px;color:var(--text3);margin-bottom:5px;">
          <span>${prog.current.title_ko}</span><span>${prog.next?prog.next.title_ko:'MAX'}</span>
        </div>
        <div class="dan-bar-wrap"><div class="dan-bar" style="width:${Math.round(prog.progress*100)}%"></div></div>
        <div style="font-size:9px;color:var(--text3);text-align:right;margin-top:4px;">${Math.round(prog.statTotal)} / ${prog.next?prog.next.req.total:'MAX'}</div>
      </div>
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;">
        <div class="stat-kpi"><div class="kpi-val" style="color:var(--accent2);">${p.dan}</div><div class="kpi-l">단</div></div>
        <div class="stat-kpi"><div class="kpi-val" style="color:var(--gold);">${p.tournament_wins}</div><div class="kpi-l">대회 우승</div></div>
        <div class="stat-kpi"><div class="kpi-val" style="color:var(--spd);">${Math.round(total)}</div><div class="kpi-l">스탯 합</div></div>
      </div>
    </div>

    <!-- 현재 무기 -->
    <div class="card" style="margin-bottom:12px;border-color:${getCurrentWeapon().color}44;">
      <div class="card-title" style="margin-bottom:8px;">현재 무기</div>
      <div style="display:flex;gap:10px;align-items:center;">
        <div style="font-size:28px;">${getCurrentWeapon().icon}</div>
        <div>
          <div style="font-size:13px;font-weight:700;color:${getCurrentWeapon().color};">${getCurrentWeapon().ko}</div>
          <div style="font-size:10px;color:var(--text3);">${getCurrentWeapon().desc}</div>
        </div>
      </div>
    </div>

    ${p.stat_points>0?`
    <div class="card" style="border-color:var(--gold);margin-bottom:12px;">
      <div class="card-header"><span class="card-title">포인트 배분</span><span style="font-size:11px;color:var(--gold);">+${p.stat_points} P</span></div>
      ${Object.keys(STATS).map(s=>`
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">
          <div class="stat-label" style="color:${STATS[s].color};">${STATS[s].ko}</div>
          <div style="flex:1;font-size:11px;font-family:'Courier New',monospace;">${Math.floor(p.stats[s])}</div>
          <button class="btn btn-sm btn-gold" data-alloc="${s}" style="padding:4px 10px;">+5</button>
        </div>`).join('')}
    </div>`:''}

    <div class="card" style="margin-bottom:12px;">
      <div class="card-title" style="margin-bottom:10px;">스탯 현황 <span style="font-size:9px;font-weight:400;color:var(--text3);">(장비 포함)</span></div>
      ${Object.keys(STATS).map(s=>{
        const base=p.stats[s]||0, bonus=eq[s]||0, val=base+bonus;
        const pct=Math.min(100,(val/800)*100);
        return `<div class="stat-row">
          <div class="stat-label" style="color:${STATS[s].color};">${STATS[s].ko}</div>
          <div class="stat-bar-wrap"><div class="stat-bar" style="width:${pct}%;background:${STATS[s].color};"></div></div>
          <div class="stat-val">${Math.floor(val)}${bonus?`<span style="color:var(--gold);font-size:8px;"> +${Math.floor(bonus)}</span>`:''}</div>
        </div>`;
      }).join('')}
    </div>

    <div class="card" style="margin-bottom:12px;">
      <div class="card-title" style="margin-bottom:10px;">스탯 레이더</div>
      <div style="display:flex;justify-content:center;"><svg id="radar" width="200" height="200" viewBox="0 0 200 200"></svg></div>
    </div>

    <div class="card" style="margin-bottom:12px;">
      <div class="card-title" style="margin-bottom:8px;">부위별 수련 횟수</div>
      <div style="display:flex;justify-content:space-around;align-items:flex-end;height:80px;" id="bar-chart"></div>
    </div>

    <div class="section-title">해금된 무기</div>
    <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:14px;">
      ${WEAPON_LIST.map(w=>{
        const unlocked=p.unlocked_weapons.includes(w.id);
        return `<div style="display:flex;flex-direction:column;align-items:center;gap:4px;padding:10px 14px;background:var(--surface);border:1px solid ${unlocked?w.color+'66':'var(--border)'};border-radius:8px;opacity:${unlocked?1:0.4};">
          <div style="font-size:24px;">${w.icon}</div>
          <div style="font-size:10px;font-weight:700;color:${unlocked?w.color:'var(--text3)'};">${w.ko}</div>
          <div style="font-size:8px;color:var(--text3);">${unlocked?'해금':'단 '+w.unlock?.dan}</div>
        </div>`;
      }).join('')}
    </div>
  `;

  container.querySelectorAll('[data-alloc]').forEach(btn=>{
    btn.addEventListener('click',()=>{
      if(allocateStat(btn.dataset.alloc,5)){ playSound('button'); renderStatsScreen(container); }
    });
  });
  _drawRadar(container);
  _drawBarChart(container);
}

function _getTitleName(p) {
  const titles = [
    { id:'beginner', ko:'검도 입문자', req:{dan:0} },
    { id:'swordsman',ko:'검사',        req:{dan:2} },
    { id:'master',   ko:'검의 달인',   req:{dan:5} },
    { id:'champion', ko:'전국 챔피언', req:{national_wins:1} },
    { id:'god',      ko:'검의 신',     req:{tournament_wins:30} },
  ];
  const t = [...titles].reverse().find(t=>{
    if(t.req.dan!==undefined && p.dan<t.req.dan) return false;
    if(t.req.national_wins!==undefined && (p.national_wins||0)<t.req.national_wins) return false;
    if(t.req.tournament_wins!==undefined && p.tournament_wins<t.req.tournament_wins) return false;
    return true;
  });
  return t?.ko||'검도 입문자';
}

function _drawRadar(container) {
  const p=getPlayer(), svg=container.querySelector('#radar'); if(!svg||!p) return;
  const eq=getEquipBonus();
  const keys=['str','men','foc','spd','hp'], labels=['기술력','정신력','집중력','속도','체력'], colors=['#3498db','#9b59b6','#f39c12','#2ecc71','#e74c3c'];
  const vals=keys.map(k=>p.stats[k]+(eq[k]||0));
  const cx=100,cy=100,r=72,n=keys.length,max=Math.max(...vals,100);
  let h='';
  [.25,.5,.75,1].forEach(f=>{
    const pts=Array.from({length:n},(_,i)=>{const a=(i/n)*Math.PI*2-Math.PI/2;return `${cx+r*f*Math.cos(a)},${cy+r*f*Math.sin(a)}`;}).join(' ');
    h+=`<polygon points="${pts}" fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="1"/>`;
  });
  for(let i=0;i<n;i++){
    const a=(i/n)*Math.PI*2-Math.PI/2,x=cx+r*Math.cos(a),y=cy+r*Math.sin(a);
    h+=`<line x1="${cx}" y1="${cy}" x2="${x}" y2="${y}" stroke="rgba(255,255,255,0.07)"/>`;
    h+=`<text x="${cx+(r+15)*Math.cos(a)}" y="${cy+(r+15)*Math.sin(a)}" text-anchor="middle" dominant-baseline="middle" fill="${colors[i]}" font-size="9">${labels[i]}</text>`;
  }
  const pts=vals.map((v,i)=>{const a=(i/n)*Math.PI*2-Math.PI/2,pct=Math.min(1,v/max);return `${cx+r*pct*Math.cos(a)},${cy+r*pct*Math.sin(a)}`;}).join(' ');
  h+=`<polygon points="${pts}" fill="rgba(232,196,104,0.12)" stroke="rgba(232,196,104,0.7)" stroke-width="2"/>`;
  vals.forEach((v,i)=>{const a=(i/n)*Math.PI*2-Math.PI/2,pct=Math.min(1,v/max),x=cx+r*pct*Math.cos(a),y=cy+r*pct*Math.sin(a);h+=`<circle cx="${x}" cy="${y}" r="3.5" fill="${colors[i]}"/>`;});
  svg.innerHTML=h;
}

function _drawBarChart(container) {
  const p=getPlayer(),el=container.querySelector('#bar-chart'); if(!el||!p) return;
  const weapon=getCurrentWeapon();
  const data=weapon.strikes.map(s=>({ label:s.ko, val:p.hits_by_type[s.id]||0, color:STATS[s.trainStat]?.color||'#fff' }));
  const max=Math.max(...data.map(d=>d.val),1);
  el.innerHTML=data.map(d=>`
    <div style="display:flex;flex-direction:column;align-items:center;gap:4px;">
      <div style="font-size:8px;color:var(--text3);">${d.val}</div>
      <div style="width:${Math.floor(60/data.length)+4}px;height:${Math.max(4,Math.round((d.val/max)*60))}px;background:${d.color};border-radius:3px 3px 0 0;"></div>
      <div style="font-size:9px;color:var(--text3);">${d.label}</div>
    </div>`).join('');
}

// ─── 장비 ─────────────────────────────────────────────────
let _equipTab = 'equip';

function renderEquipScreen(container) {
  const p=getPlayer(); if(!p) return;
  container.innerHTML=`
    <div class="subtab-bar" style="margin-bottom:14px;">
      ${['equip','skills','shop'].map(t=>`
        <button class="subtab ${_equipTab===t?'active':''}" data-tab="${t}">
          ${t==='equip'?'⚔️ 장비':t==='skills'?'🌟 기술':'🛒 상점'}
        </button>`).join('')}
    </div>
    <div id="equip-content">
      ${_equipTab==='equip'?_buildEquipTab(p):_equipTab==='skills'?_buildSkillsTab(p):_buildShopTab(p)}
    </div>
  `;
  container.querySelectorAll('.subtab').forEach(btn=>{
    btn.addEventListener('click',()=>{ _equipTab=btn.dataset.tab; playSound('button'); renderEquipScreen(container); });
  });
  _attachEquipEvents(container);
}

function _buildEquipTab(p) {
  if (!p||!EQUIPMENT) return '<div class="empty-state">장비 데이터 로드 중...</div>';
  const slots=Object.keys(EQUIPMENT_SLOTS);
  const equippedIds=Object.values(p.equipped||{});
  const activeSet=SET_BONUSES?.find(sb=>sb.set.every(id=>equippedIds.includes(id)));
  return `
    ${activeSet?`<div class="event-banner" style="border-color:var(--gold);"><div class="ev-icon">✨</div><div><div class="ev-title" style="color:var(--gold);">세트 보너스</div><div>${activeSet.name_ko} 활성화!</div></div></div>`:''}
    ${slots.map(slot=>{
      const items=EQUIPMENT[slot]||[];
      const equipped=p.equipped?.[slot];
      return `
        <div class="section-title">${EQUIPMENT_SLOTS[slot].icon} ${EQUIPMENT_SLOTS[slot].ko}</div>
        <div class="equip-scroll">
          ${items.map(item=>{
            const owned=(p.equipment_owned||[]).includes(item.id);
            const isEquipped=equipped===item.id;
            const enh=(p.equipment_enhanced||{})[item.id]||0;
            const tier=TIERS[item.tier];
            if(!tier) return '';
            return `
              <div class="equip-card ${isEquipped?'equipped':''}" style="${isEquipped?`border-color:${tier.color};box-shadow:0 0 12px ${tier.glow};`:''}">
                ${enh>0?`<div class="equip-enhance">+${enh}</div>`:''}
                <div class="equip-icon">${item.icon}</div>
                <div class="equip-name" style="font-size:9px;">${item.ko}</div>
                <div style="font-size:8px;color:${tier.color};margin:2px 0;">◆ ${tier.ko}</div>
                <div class="equip-stats">${Object.entries(item.stats||{}).map(([k,v])=>`${STATS[k]?.ko||k}+${v}`).join(' ')}</div>
                ${owned?`
                  <div style="display:flex;flex-direction:column;gap:3px;margin-top:6px;">
                    ${!isEquipped?`<button class="btn btn-sm btn-primary" data-equip="${item.id}" data-slot="${slot}" style="font-size:9px;">장착</button>`:`<div style="font-size:9px;color:${tier.color};text-align:center;">✓ 장착중</div>`}
                    ${enh<10?`<button class="btn btn-sm" data-enhance="${item.id}" style="font-size:8px;">강화 ${(getEnhanceCost(item.id)||0).toLocaleString()}G</button>`:`<div style="font-size:9px;color:var(--gold);text-align:center;">MAX</div>`}
                  </div>`:`
                  <button class="btn btn-sm btn-gold" data-buy="${item.id}" style="width:100%;margin-top:6px;font-size:9px;">${item.price.toLocaleString()}G</button>`}
              </div>`;
          }).join('')}
        </div>`;
    }).join('')}
  `;
}

function _buildSkillsTab(p) {
  const weapon = getCurrentWeapon();
  const weaponSkills = getWeaponSkills(weapon.id);
  const tiers=[{id:'basic',ko:'기본기',icon:'⚔️'},{id:'advanced',ko:'고급기',icon:'🔷'},{id:'special',ko:'특수기',icon:'⭐'}];
  return `
    <div style="display:flex;gap:8px;align-items:center;padding:10px;background:var(--surface);border:1px solid ${weapon.color}44;border-radius:8px;margin-bottom:12px;">
      <div style="font-size:24px;">${weapon.icon}</div>
      <div>
        <div style="font-size:12px;font-weight:700;color:${weapon.color};">${weapon.ko} 기술 목록</div>
        <div style="font-size:10px;color:var(--text3);">수련장에서 무기 선택 후 수련하면 해금됩니다</div>
      </div>
    </div>
    ${tiers.map(tier=>{
      const skills=weaponSkills.filter(s=>s.tier===tier.id);
      if(!skills.length) return '';
      return `
        <div class="section-title">${tier.icon} ${tier.ko}</div>
        ${skills.map(sk=>{
          const unlocked=(p.skills_unlocked||[]).includes(sk.id);
          if(sk.secret&&!unlocked) return `<div class="skill-card locked"><div class="skill-icon">❓</div><div><div class="skill-name" style="color:var(--text3);">???</div><div class="skill-desc">조건을 채우면 드러납니다</div></div></div>`;
          const progs=unlocked?[]:getSkillProgress(sk);
          return `
            <div class="skill-card ${unlocked?'':'locked'}">
              <div class="skill-icon">${sk.icon}</div>
              <div style="flex:1;">
                <div style="display:flex;align-items:center;gap:6px;margin-bottom:3px;">
                  <span class="skill-name">${sk.ko}</span>
                  ${unlocked?`<span style="font-size:8px;color:var(--spd);border:1px solid var(--spd);padding:1px 4px;border-radius:3px;">✓ 해금</span>`:''}
                </div>
                ${unlocked?`
                  <div style="font-size:10px;color:var(--accent2);margin-bottom:2px;">효과: ${sk.effect_ko||''}</div>
                  <div style="font-size:9px;color:var(--text3);">💡 ${sk.how_ko||''}</div>
                `:`
                  ${progs.map(pr=>{
                    const pct=Math.min(100,(pr.cur/pr.req)*100);
                    return `<div style="margin-top:4px;">
                      <div style="display:flex;justify-content:space-between;font-size:9px;color:var(--text3);margin-bottom:2px;"><span>${pr.label}</span><span>${pr.cur}/${pr.req}</span></div>
                      <div class="progress-bar-wrap" style="height:4px;"><div class="progress-bar" style="width:${pct}%;background:${weapon.color||'var(--accent2)'};"></div></div>
                    </div>`;
                  }).join('')}
                `}
              </div>
            </div>`;
        }).join('')}`;
    }).join('')}
  `;
}

function _buildShopTab(p) {
  return `
    <div class="section-title">📦 장비 상자</div>
    <div style="font-size:10px;color:var(--text3);margin-bottom:10px;">같은 등급에서 랜덤 슬롯 장비 지급. 직접 구매보다 35% 저렴!</div>
    ${BOXES.map(box=>{
      const tier=TIERS[box.tier];
      return `
        <div class="card" style="border-color:${tier.color}66;margin-bottom:8px;">
          <div style="display:flex;align-items:center;gap:12px;">
            <div style="font-size:28px;">📦</div>
            <div style="flex:1;">
              <div style="font-size:12px;font-weight:700;color:${tier.color};">${box.ko}</div>
              <div style="font-size:9px;color:var(--text3);margin-top:2px;">${tier.ko} 등급 무작위 슬롯 장비 1개</div>
            </div>
            <button class="btn btn-sm btn-gold" data-box="${box.tier}">${box.price.toLocaleString()}G</button>
          </div>
        </div>`;
    }).join('')}
  `;
}

function _attachEquipEvents(container) {
  const content=container.querySelector('#equip-content');
  if(!content) return;

  content.querySelectorAll('[data-buy]').forEach(btn=>{
    btn.addEventListener('click',()=>{
      const item=Object.values(EQUIPMENT).flat().find(i=>i.id===btn.dataset.buy);
      if(!item) return;
      if(getPlayer().gold<item.price){ playSound('error'); showToast('골드가 부족합니다!'); return; }
      showModal('confirm',{message:`${item.ko}\n구매? (${item.price.toLocaleString()}G)`,onConfirm:()=>{
        if(buyEquipment(item.id)){ playSound('equip'); renderEquipScreen(container); }
        else showToast('골드가 부족합니다!');
      }});
    });
  });

  content.querySelectorAll('[data-equip]').forEach(btn=>{
    btn.addEventListener('click',()=>{
      if(equipItem(btn.dataset.equip,btn.dataset.slot)){ playSound('equip'); renderEquipScreen(container); }
    });
  });

  content.querySelectorAll('[data-enhance]').forEach(btn=>{
    btn.addEventListener('click',()=>{
      const cost=getEnhanceCost(btn.dataset.enhance);
      if(!cost) return;
      showModal('confirm',{message:`강화? (${cost.toLocaleString()}G)`,onConfirm:()=>{
        const r=enhanceEquipment(btn.dataset.enhance);
        if(r){ playSound('equip'); showToast(`+${r.newLevel} 강화 성공!`,'var(--gold)'); renderEquipScreen(container); }
        else showToast('골드가 부족합니다!');
      }});
    });
  });

  content.querySelectorAll('[data-box]').forEach(btn=>{
    btn.addEventListener('click',()=>{
      const tier=btn.dataset.box;
      const box=BOXES.find(b=>b.tier===tier);
      if(!box||getPlayer().gold<box.price){ playSound('error'); showToast('골드가 부족합니다!'); return; }
      showModal('confirm',{message:`${TIERS[tier].ko} 장비 상자\n구매? (${box.price.toLocaleString()}G)`,onConfirm:()=>{
        const item=openBox(tier);
        if(item){
          playSound('gacha');
          const resultDiv=document.createElement('div');
          content.appendChild(resultDiv);
          showGachaResult(item,resultDiv);
        } else showToast('골드가 부족합니다!');
      }});
    });
  });
}

// ─── 업적 ─────────────────────────────────────────────────
function renderAchieveScreen(container) {
  const p=getPlayer(); if(!p) return;
  const done=p.achievements_unlocked||[];
  container.innerHTML=`
    <div class="card" style="text-align:center;margin-bottom:12px;">
      <div style="font-size:20px;font-weight:800;color:var(--gold);">${done.length} / ${ACHIEVEMENTS.length}</div>
      <div style="font-size:10px;color:var(--text3);margin-bottom:8px;">업적 달성</div>
      <div class="progress-bar-wrap"><div class="progress-bar" style="width:${Math.round((done.length/ACHIEVEMENTS.length)*100)}%;background:var(--gold);"></div></div>
    </div>

    <div class="section-title">일일 임무</div>
    <div class="card" style="padding:10px;margin-bottom:12px;">
      ${DAILY_MISSIONS.map(m=>{
        const isDone=(p.daily_missions_done||[]).includes(m.id);
        const prog=getDailyMissionProgress(m);
        const pct=Math.min(100,(prog.cur/prog.req)*100);
        const claimable=!isDone&&prog.cur>=prog.req;
        return `<div style="margin-bottom:10px;">
          <div style="display:flex;justify-content:space-between;margin-bottom:4px;">
            <span style="font-size:11px;color:${isDone?'var(--text3)':'var(--text)'};">${m.ko}</span>
            <span style="font-size:9px;color:var(--gold);">+${m.reward.gold}G</span>
          </div>
          <div class="progress-bar-wrap"><div class="progress-bar" style="width:${pct}%;background:${isDone?'var(--text3)':'var(--spd)'}"></div></div>
          <div style="display:flex;justify-content:space-between;align-items:center;margin-top:3px;">
            <span style="font-size:9px;color:var(--text3);">${prog.cur}/${prog.req}${isDone?' ✓':''}</span>
            ${claimable?`<button class="btn btn-sm btn-gold" data-claim-daily="${m.id}" style="padding:2px 8px;font-size:9px;">수령</button>`:''}
          </div>
        </div>`;
      }).join('')}
    </div>

    <div class="section-title">주간 도전</div>
    <div class="card" style="padding:10px;margin-bottom:12px;">
      ${WEEKLY_CHALLENGES.map(ch=>{
        const isDone=(p.weekly_done||[]).includes(ch.id);
        const prog=getWeeklyProgress(ch);
        const pct=Math.min(100,(prog.cur/prog.req)*100);
        const claimable=!isDone&&prog.cur>=prog.req;
        return `<div style="margin-bottom:10px;">
          <div style="display:flex;justify-content:space-between;margin-bottom:4px;">
            <span style="font-size:11px;color:${isDone?'var(--text3)':'var(--text)'};">${ch.ko}</span>
            <span style="font-size:9px;color:var(--gold);">+${ch.reward.gold}G</span>
          </div>
          <div class="progress-bar-wrap"><div class="progress-bar" style="width:${pct}%;background:${isDone?'var(--text3)':'var(--legendary)'}"></div></div>
          <div style="display:flex;justify-content:space-between;align-items:center;margin-top:3px;">
            <span style="font-size:9px;color:var(--text3);">${prog.cur}/${prog.req}${isDone?' ✓':''}</span>
            ${claimable?`<button class="btn btn-sm btn-gold" data-claim-weekly="${ch.id}" style="padding:2px 8px;font-size:9px;">수령</button>`:''}
          </div>
        </div>`;
      }).join('')}
    </div>

    <div class="section-title">전체 업적</div>
    ${ACHIEVEMENTS.map(ach=>{
      const isDone=done.includes(ach.id);
      return `<div class="card" style="display:flex;gap:12px;align-items:center;margin-bottom:8px;opacity:${isDone?1:0.5};">
        <div style="font-size:26px;filter:${isDone?'none':'grayscale(1)'};">${ach.icon}</div>
        <div style="flex:1;">
          <div style="font-size:12px;font-weight:700;color:${isDone?'var(--accent2)':'var(--text3)'};">${ach.ko}${isDone?` <span style="font-size:8px;color:var(--spd);border:1px solid var(--spd);padding:1px 4px;border-radius:3px;">✓</span>`:''}</div>
          <div style="font-size:9px;color:var(--text3);">보상: +${ach.reward?.gold||0}G</div>
        </div>
        ${isDone?'<div style="font-size:18px;">🏅</div>':''}
      </div>`;
    }).join('')}
  `;
  container.querySelectorAll('[data-claim-daily]').forEach(btn=>btn.addEventListener('click',()=>{
    if(claimDailyMission(btn.dataset.claimDaily)){ playSound('achieve'); showToast(`+${DAILY_MISSIONS.find(m=>m.id===btn.dataset.claimDaily)?.reward.gold||0}G`,'var(--gold)'); renderAchieveScreen(container); }
  }));
  container.querySelectorAll('[data-claim-weekly]').forEach(btn=>btn.addEventListener('click',()=>{
    if(claimWeeklyChallenge(btn.dataset.claimWeekly)){ playSound('achieve'); showToast('주간 도전 완료!','var(--gold)'); renderAchieveScreen(container); }
  }));
}
