// ============================================================
// FIREBASE v2 - ID 기반 친구, 랭킹 수정
// ============================================================

const FIREBASE_CONFIG = {
  apiKey: "AIzaSyCncrxS84VJS8o5NU-pgpVgM_vAR5Cpm-8",
  authDomain: "kumdo-32463.firebaseapp.com",
  databaseURL: "https://kumdo-32463-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "kumdo-32463",
  storageBucket: "kumdo-32463.firebasestorage.app",
  messagingSenderId: "817524170731",
  appId: "1:817524170731:web:88f076c6fb515ee49543ae",
};

const FB_CDN = "https://www.gstatic.com/firebasejs/10.12.0";
let _fb = null, _currentUser = null, _authReady = false, _authCbs = [], _saveTimer = null;

async function fbInit() {
  if (_fb) return _fb;
  const [appMod, authMod, dbMod] = await Promise.all([
    import(`${FB_CDN}/firebase-app.js`),
    import(`${FB_CDN}/firebase-auth.js`),
    import(`${FB_CDN}/firebase-database.js`),
  ]);
  const app = appMod.initializeApp(FIREBASE_CONFIG);
  const auth = authMod.getAuth(app);
  const db   = dbMod.getDatabase(app);
  _fb = { auth, db, authMod, dbMod };
  authMod.onAuthStateChanged(auth, user => {
    _currentUser = user;
    _authReady = true;
    _authCbs.forEach(cb=>cb(user));
    _authCbs = [];
  });
  return _fb;
}

function onAuthReady(cb) { if (_authReady) cb(_currentUser); else _authCbs.push(cb); }
function getCurrentUser() { return _currentUser; }
function isGuest() { return _currentUser?.isAnonymous||false; }
function isLoggedIn() { return !!_currentUser; }

async function signUp(email, password, name) {
  const { auth, authMod } = await fbInit();
  const cred = await authMod.createUserWithEmailAndPassword(auth, email, password);
  await authMod.updateProfile(cred.user, { displayName: name||email.split('@')[0] });
  // 닉네임 → ID 인덱스 저장 (친구 검색용)
  const { db, dbMod } = _fb;
  const safeName = (name||email.split('@')[0]).toLowerCase().replace(/[^a-z0-9가-힣]/g,'_');
  await dbMod.set(dbMod.ref(db, `name_index/${safeName}`), cred.user.uid);
  return cred.user;
}

async function signIn(email, password) {
  const { auth, authMod } = await fbInit();
  const cred = await authMod.signInWithEmailAndPassword(auth, email, password);
  return cred.user;
}

async function signInGuest() {
  const { auth, authMod } = await fbInit();
  const cred = await authMod.signInAnonymously(auth);
  if (!localStorage.getItem('kendo_guest_uid')) localStorage.setItem('kendo_guest_uid', cred.user.uid);
  return cred.user;
}

async function signOut() {
  const { auth, authMod } = await fbInit();
  await authMod.signOut(auth);
  _currentUser = null;
}

async function resetPassword(email) {
  const { auth, authMod } = await fbInit();
  await authMod.sendPasswordResetEmail(auth, email);
}

// ─── 저장/로드 ────────────────────────────────────────────
function _sanitize(obj) {
  if (obj===null||obj===undefined) return null;
  if (typeof obj!=='object') return obj;
  if (Array.isArray(obj)) return obj.map(_sanitize);
  const out={};
  for (const [k,v] of Object.entries(obj)) { if (v!==undefined) out[k]=_sanitize(v); }
  return out;
}

async function saveGame(playerData) {
  if (!playerData) return;
  // 로컬 항상 저장
  try { localStorage.setItem('kendo_save_v2', JSON.stringify(playerData)); } catch(e){}
  if (!_currentUser) return;
  if (_saveTimer) clearTimeout(_saveTimer);
  _saveTimer = setTimeout(async()=>{
    try {
      const { db, dbMod } = await fbInit();
      await dbMod.set(dbMod.ref(db, `users/${_currentUser.uid}`), _sanitize(playerData));
      await _updateLeaderboard(playerData);
    } catch(e){ console.error('save error',e); }
  }, 2000);
}

async function loadGame() {
  // 로컬 먼저 시도
  const local = localStorage.getItem('kendo_save_v2');
  if (!_currentUser) return local ? JSON.parse(local) : null;
  try {
    const { db, dbMod } = await fbInit();
    const snap = await dbMod.get(dbMod.ref(db, `users/${_currentUser.uid}`));
    if (snap.exists()) return snap.val();
    return local ? JSON.parse(local) : null;
  } catch(e) {
    return local ? JSON.parse(local) : null;
  }
}

// ─── 리더보드 (저장 시 자동 업데이트) ────────────────────
async function _updateLeaderboard(p) {
  if (!_currentUser||isGuest()) return;
  try {
    const { db, dbMod } = await fbInit();
    const statTotalVal = Object.values(p.stats||{}).reduce((a,b)=>a+b,0);
    const safeName = (p.name||'익명').toLowerCase().replace(/[^a-z0-9가-힣]/g,'_');
    await Promise.all([
      dbMod.set(dbMod.ref(db, `leaderboard/${_currentUser.uid}`), {
        name: p.name||'익명',
        name_lower: safeName,
        dan: p.dan||0,
        total_hits: p.total_hits||0,
        tournament_wins: p.tournament_wins||0,
        national_wins: p.national_wins||0,
        stat_total: Math.round(statTotalVal),
        season_points: p.season_points||0,
        current_weapon: p.current_weapon||'shinai',
        uid: _currentUser.uid,
        updated: Date.now(),
      }),
      // 닉네임 인덱스도 업데이트
      dbMod.set(dbMod.ref(db, `name_index/${safeName}`), _currentUser.uid),
    ]);
  } catch(e){ console.error('lb update error',e); }
}

async function getLeaderboard(sortBy='tournament_wins', limit=50) {
  try {
    const { db, dbMod } = await fbInit();
    const q = dbMod.query(
      dbMod.ref(db,'leaderboard'),
      dbMod.orderByChild(sortBy),
      dbMod.limitToLast(limit)
    );
    const snap = await dbMod.get(q);
    if (!snap.exists()) return [];
    const arr=[];
    snap.forEach(c=>arr.push({ uid:c.key, ...c.val() }));
    return arr.reverse();
  } catch(e){ console.error('lb fetch error',e); return []; }
}

// ─── 친구: 닉네임/ID로 검색 ──────────────────────────────
async function findUserByName(nameQuery) {
  if (!_currentUser||isGuest()) return { ok:false, msg:'로그인이 필요합니다.' };
  try {
    const { db, dbMod } = await fbInit();
    const safeName = nameQuery.toLowerCase().replace(/[^a-z0-9가-힣]/g,'_');

    // 이름 인덱스에서 UID 조회
    const snap = await dbMod.get(dbMod.ref(db, `name_index/${safeName}`));
    if (!snap.exists()) return { ok:false, msg:`'${nameQuery}' 플레이어를 찾을 수 없습니다.` };
    const targetUid = snap.val();
    if (targetUid===_currentUser.uid) return { ok:false, msg:'자기 자신은 추가할 수 없습니다.' };

    const lbSnap = await dbMod.get(dbMod.ref(db, `leaderboard/${targetUid}`));
    const name = lbSnap.exists() ? lbSnap.val().name : nameQuery;
    return { ok:true, uid:targetUid, name };
  } catch(e){ return { ok:false, msg:'검색 중 오류가 발생했습니다.' }; }
}

async function sendFriendRequest(targetUid, targetName) {
  if (!_currentUser||isGuest()) return { ok:false, msg:'로그인이 필요합니다.' };
  try {
    const { db, dbMod } = await fbInit();
    await dbMod.set(dbMod.ref(db,`friends/${_currentUser.uid}/${targetUid}`), true);
    return { ok:true, msg:`${targetName}님을 친구 추가했습니다!` };
  } catch(e){ return { ok:false, msg:'친구 추가 실패.' }; }
}

async function getFriendList() {
  if (!_currentUser) return [];
  try {
    const { db, dbMod } = await fbInit();
    const snap = await dbMod.get(dbMod.ref(db,`friends/${_currentUser.uid}`));
    if (!snap.exists()) return [];
    const uids = Object.keys(snap.val());
    const entries = await Promise.all(uids.map(async uid=>{
      const [lb, statsSnap] = await Promise.all([
        dbMod.get(dbMod.ref(db,`leaderboard/${uid}`)),
        dbMod.get(dbMod.ref(db,`users/${uid}/stats`)),
      ]);
      if (!lb.exists()) return null;
      return { uid, ...lb.val(), stats: statsSnap.exists()?statsSnap.val():null };
    }));
    return entries.filter(Boolean);
  } catch(e){ return []; }
}

async function removeFriend(targetUid) {
  if (!_currentUser) return;
  try {
    const { db, dbMod } = await fbInit();
    await dbMod.remove(dbMod.ref(db,`friends/${_currentUser.uid}/${targetUid}`));
  } catch(e){}
}
