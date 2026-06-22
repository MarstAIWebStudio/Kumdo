// ============================================================
// AUTH SCREEN - 이메일/비번 로그인, 회원가입, 게스트
// ============================================================

function renderAuthScreen(container, onSuccess) {
  let mode = 'login'; // login | register

  function render() {
    container.innerHTML = `
      <div style="min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:32px 24px;background:radial-gradient(circle at 50% 30%,#1a1028,#08060e 70%);">

        <div style="font-size:44px;margin-bottom:8px;filter:drop-shadow(0 0 18px rgba(232,196,104,.4));">⚔️</div>
        <div style="font-family:'Courier New',monospace;font-size:26px;font-weight:900;letter-spacing:6px;color:var(--accent2);margin-bottom:4px;">KENDO</div>
        <div style="font-size:11px;color:var(--text3);letter-spacing:4px;margin-bottom:28px;">剣 の 道</div>

        <div class="auth-card">
          <div style="display:flex;margin-bottom:20px;background:var(--bg2);border-radius:6px;overflow:hidden;">
            <button class="auth-tab ${mode==='login'?'active':''}" id="tab-login">로그인</button>
            <button class="auth-tab ${mode==='register'?'active':''}" id="tab-register">회원가입</button>
          </div>

          ${mode === 'register' ? `
            <input class="auth-input" id="auth-name" type="text" placeholder="닉네임 (최대 10자)" maxlength="10">
          ` : ''}
          <input class="auth-input" id="auth-email" type="email" placeholder="이메일">
          <input class="auth-input" id="auth-pw" type="password" placeholder="비밀번호 (6자 이상)">
          ${mode === 'register' ? `
            <input class="auth-input" id="auth-pw2" type="password" placeholder="비밀번호 확인">
          ` : ''}

          <div id="auth-err" style="font-size:11px;color:var(--accent);min-height:16px;margin-bottom:8px;text-align:center;"></div>

          <button class="btn btn-primary btn-full" id="auth-submit" style="font-size:14px;font-weight:700;padding:14px;">
            ${mode==='login'?'로그인':'회원가입'}
          </button>

          ${mode==='login' ? `
            <button class="btn btn-sm" id="auth-forgot" style="width:100%;margin-top:6px;font-size:11px;color:var(--text3);">비밀번호 찾기</button>
          ` : ''}

          <div style="display:flex;align-items:center;gap:10px;margin:14px 0;">
            <div style="flex:1;height:1px;background:var(--border);"></div>
            <span style="font-size:10px;color:var(--text3);">또는</span>
            <div style="flex:1;height:1px;background:var(--border);"></div>
          </div>

          <button class="btn btn-full guest-btn" id="auth-guest">
            👤 게스트로 시작 <span style="font-size:9px;color:var(--text3);">(같은 기기에서 계속 플레이 가능)</span>
          </button>
        </div>

        <div style="font-size:9px;color:var(--text3);margin-top:18px;text-align:center;line-height:1.6;">
          게스트 데이터는 이 기기에 저장됩니다<br>
          계정 가입 시 클라우드에 저장됩니다
        </div>
      </div>
    `;

    container.querySelector('#tab-login').onclick = () => { mode='login'; render(); };
    container.querySelector('#tab-register').onclick = () => { mode='register'; render(); };

    container.querySelector('#auth-submit').onclick = async () => {
      await handleSubmit();
    };

    container.querySelector('#auth-guest').onclick = async () => {
      await handleGuest();
    };

    container.querySelector('#auth-forgot')?.addEventListener('click', async () => {
      const email = container.querySelector('#auth-email')?.value?.trim();
      if (!email) { showErr('이메일을 먼저 입력해주세요.'); return; }
      try {
        await resetPassword(email);
        showErr('비밀번호 재설정 메일을 보냈습니다.', '#2ecc71');
      } catch(e) { showErr('메일 전송 실패. 이메일을 확인해주세요.'); }
    });

    // Enter키
    container.querySelectorAll('.auth-input').forEach(inp => {
      inp.addEventListener('keydown', e => { if(e.key==='Enter') container.querySelector('#auth-submit')?.click(); });
    });
  }

  function showErr(msg, color) {
    const el = container.querySelector('#auth-err');
    if (el) { el.textContent=msg; el.style.color=color||'var(--accent)'; }
  }

  async function handleSubmit() {
    const btn = container.querySelector('#auth-submit');
    btn.disabled = true; btn.textContent = '처리 중...';
    showErr('');

    const email = container.querySelector('#auth-email')?.value?.trim();
    const pw    = container.querySelector('#auth-pw')?.value;

    if (!email || !pw) { showErr('이메일과 비밀번호를 입력해주세요.'); btn.disabled=false; btn.textContent=mode==='login'?'로그인':'회원가입'; return; }

    try {
      if (mode === 'register') {
        const name = container.querySelector('#auth-name')?.value?.trim() || '검도인';
        const pw2  = container.querySelector('#auth-pw2')?.value;
        if (pw !== pw2) { showErr('비밀번호가 일치하지 않습니다.'); btn.disabled=false; btn.textContent='회원가입'; return; }
        if (pw.length < 6) { showErr('비밀번호는 6자 이상이어야 합니다.'); btn.disabled=false; btn.textContent='회원가입'; return; }
        const user = await signUp(email, pw, name);
        onSuccess(user, name);
      } else {
        const user = await signIn(email, pw);
        onSuccess(user, null);
      }
    } catch(e) {
      const msgs = {
        'auth/user-not-found':    '등록되지 않은 이메일입니다.',
        'auth/wrong-password':    '비밀번호가 틀렸습니다.',
        'auth/email-already-in-use': '이미 사용 중인 이메일입니다.',
        'auth/invalid-email':     '올바른 이메일 형식이 아닙니다.',
        'auth/weak-password':     '비밀번호가 너무 짧습니다.',
        'auth/too-many-requests': '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.',
        'auth/invalid-credential':'이메일 또는 비밀번호가 올바르지 않습니다.',
      };
      showErr(msgs[e.code] || `오류: ${e.message}`);
      btn.disabled=false; btn.textContent=mode==='login'?'로그인':'회원가입';
    }
  }

  async function handleGuest() {
    const btn = container.querySelector('#auth-guest');
    btn.disabled=true; btn.textContent='🔄 게스트 로그인 중...';
    try {
      const user = await signInGuest();
      onSuccess(user, '검도인');
    } catch(e) {
      showErr('게스트 로그인 실패. 다시 시도해주세요.');
      btn.disabled=false; btn.textContent='👤 게스트로 시작';
    }
  }

  render();
}
