// ============================================================
// MAIN - 진입점, 탭 라우팅
// ============================================================

let _currentTab = 'train';
const RENDERERS = {
  train:      renderTrainScreen,
  stats:      renderStatsScreen,
  equip:      renderEquipScreen,
  tournament: renderTournamentScreen,
  achieve:    renderAchieveScreen,
  rank:       renderRankScreen,
  settings:   renderSettingsScreen,
};

function switchTab(name) {
  if (name === _currentTab) {
    // 같은 탭 다시 눌러도 새로고침
    const el = document.querySelector(`#screen-${name}`);
    if (el && RENDERERS[name]) RENDERERS[name](el);
    return;
  }
  const prev = _currentTab;
  _currentTab = name;

  document.querySelectorAll('.tab-btn').forEach(b => b.classList.toggle('active', b.dataset.screen === name));

  const prevEl = document.querySelector(`#screen-${prev}`);
  if (prevEl) prevEl.classList.remove('active');

  const target = document.querySelector(`#screen-${name}`);
  if (target) {
    target.classList.add('active');
    if (RENDERERS[name]) RENDERERS[name](target);
  }
}

async function startGame(user, nameHint) {
  // 로딩 표시
  document.getElementById('loading-screen').style.display = 'flex';

  try {
    let data = await loadGame();
    if (!data) {
      data = freshPlayer(nameHint || user?.displayName || '검도인', user?.uid);
    } else {
      // 기존 세이브에 빠진 필드 보완
      const tpl = freshPlayer(data.name, data.uid);
      for (const k of Object.keys(tpl)) {
        if (data[k] === undefined) data[k] = tpl[k];
      }
      if (nameHint && !data.name) data.name = nameHint;
    }

    initPlayer(data);
    subscribe(p => { updateHeader(p); updateTabBadges(p); });
    updateHeader(data);
    updateTabBadges(data);
    applyBodyBg();

    // 강조색 적용
    if (data.accent_color) {
      document.documentElement.style.setProperty('--accent2', data.accent_color);
    }

    document.getElementById('loading-screen').style.display = 'none';
    document.getElementById('auth-screen').style.display = 'none';
    document.getElementById('main-app').style.display = 'flex';

    // 첫 탭 렌더
    const trainEl = document.querySelector('#screen-train');
    trainEl.classList.add('active');
    renderTrainScreen(trainEl);

  } catch(e) {
    console.error('startGame error', e);
    document.getElementById('loading-screen').style.display = 'none';
    showModal('error', { message: '게임 로드 중 오류가 발생했습니다.\n다시 시도해주세요.' });
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  // 탭 이벤트
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.dataset.screen));
  });

  // Firebase 초기화
  await fbInit();

  // 로딩 화면 표시
  document.getElementById('loading-screen').style.display = 'flex';

  // 인트로를 처음 한 번만 보여줌
  const hasSeenIntro = localStorage.getItem('kendo_intro_seen');

  onAuthReady(async user => {
    document.getElementById('loading-screen').style.display = 'none';

    if (user) {
      // 이미 로그인된 상태 → 바로 게임
      if (!hasSeenIntro) {
        localStorage.setItem('kendo_intro_seen', '1');
        showIntroScreen(() => startGame(user, null));
      } else {
        startGame(user, null);
      }
    } else {
      // 로그인 필요 → 인트로 → 로그인 화면
      if (!hasSeenIntro) {
        localStorage.setItem('kendo_intro_seen', '1');
        showIntroScreen(() => _showAuth());
      } else {
        _showAuth();
      }
    }
  });
});

function _showAuth() {
  const authScreen = document.getElementById('auth-screen');
  authScreen.style.display = 'block';
  renderAuthScreen(authScreen, (user, name) => {
    startGame(user, name);
  });
}
