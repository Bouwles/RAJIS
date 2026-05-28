// Firebase config + auth + constants
'use strict';

// ═══════════════════════════════════════════════════════════════
//  FIREBASE — replace config with YOUR project credentials
//  Setup guide:
//    1. Go to firebase.google.com, create a project
//    2. Authentication → Sign-in method → enable Email/Password
//    3. Firestore Database → Create database (start in test mode)
//    4. Project Settings → Your apps → Add web app → copy config
// ═══════════════════════════════════════════════════════════════
const FIREBASE_CONFIG = {
  apiKey:            "AIzaSyCQp2TpN4VpPcVGI8a8dPXIQM_G4JYQQLA",
  authDomain:        "rajis-73b43.firebaseapp.com",
  projectId:         "rajis-73b43",
  storageBucket:     "rajis-73b43.firebasestorage.app",
  messagingSenderId: "767111161348",
  appId:             "1:767111161348:web:8e7a16fc6291e3201bb751"
};

let _fbAuth = null, _fbDb = null, _fbUser = null;
try {
  firebase.initializeApp(FIREBASE_CONFIG);
  _fbAuth = firebase.auth();
  _fbDb   = firebase.firestore();
} catch(e) { console.warn('Firebase init:', e.message); }

async function fbRegister(username, password){
  if(!_fbDb) throw new Error('Firebase not configured — see code comments at the top of the script.');
  username = username.trim().toUpperCase().replace(/[^A-Z0-9_]/g,'');
  if(username.length < 3) throw new Error('Username: min 3 characters (letters, numbers, underscore).');
  if(password.length < 6) throw new Error('Password must be at least 6 characters.');
  if(!/\d/.test(password)) throw new Error('Password must contain at least one number.');
  const snap = await _fbDb.collection('usernames').doc(username.toLowerCase()).get();
  if(snap.exists) throw new Error('Username already taken — choose another.');
  const email = username.toLowerCase()+'@rajintercept.game';
  const cred  = await _fbAuth.createUserWithEmailAndPassword(email, password);
  await cred.user.updateProfile({displayName: username});
  await _fbDb.collection('usernames').doc(username.toLowerCase()).set({uid: cred.user.uid});
  let sd = null;
  try{ const d=localStorage.getItem(SAVE_KEY); if(d) sd=JSON.parse(d); }catch(e){}
  if(!sd) sd = defaultSave();
  sd.username = username;
  await _fbDb.collection('users').doc(cred.user.uid).set({username, saveData: sd});
  return {user: cred.user, username, saveData: sd};
}

async function fbLogin(username, password){
  if(!_fbDb) throw new Error('Firebase not configured — see code comments at the top of the script.');
  username = username.trim().toUpperCase().replace(/[^A-Z0-9_]/g,'');
  const snap = await _fbDb.collection('usernames').doc(username.toLowerCase()).get();
  if(!snap.exists) throw new Error('Account not found — check username or register.');
  const email = username.toLowerCase()+'@rajintercept.game';
  const cred  = await _fbAuth.signInWithEmailAndPassword(email, password);
  const doc   = await _fbDb.collection('users').doc(cred.user.uid).get();
  const data  = doc.data();
  const sd    = data?.saveData ? Object.assign(defaultSave(), data.saveData) : defaultSave();
  return {user: cred.user, username: data?.username||username, saveData: sd};
}

let _pendingGoogleUser = null;

async function fbGoogleSignIn(){
  if(!_fbAuth||!_fbDb){
    document.getElementById('loginErr').textContent='Firebase not configured.'; return;
  }
  _acctSetBusy(true);
  document.getElementById('acctStatus').textContent='Opening Google sign-in…';
  try{
    const provider = new firebase.auth.GoogleAuthProvider();
    const cred = await _fbAuth.signInWithPopup(provider);
    const user = cred.user;
    _fbUser = user;
    const docRef = _fbDb.collection('users').doc(user.uid);
    const snap = await docRef.get();
    if(snap.exists && snap.data()?.username){
      const username = snap.data().username;
      const sd = Object.assign(defaultSave(), snap.data().saveData||{});
      _acctFinishLogin({user, username, saveData: sd});
    } else {
      // New Google user — show username picker
      _pendingGoogleUser = user;
      const suggested = (user.displayName||'PLAYER').toUpperCase().replace(/[^A-Z0-9_]/g,'').slice(0,20)||'PLAYER';
      document.getElementById('pickUsername').value = suggested;
      document.getElementById('pickUsernameErr').textContent = '';
      document.getElementById('acctStatus').textContent='';
      _acctSetBusy(false);
      document.getElementById('usernamePickerModal').style.display='flex';
    }
  }catch(e){
    const msg = e.code==='auth/popup-closed-by-user'?'Sign-in cancelled.':(e.message||'Google sign-in failed.');
    document.getElementById('loginErr').textContent = msg;
    document.getElementById('acctStatus').textContent='';
    _acctSetBusy(false);
  }
}

async function doPickUsername(){
  const errEl = document.getElementById('pickUsernameErr');
  const raw = document.getElementById('pickUsername').value.trim().toUpperCase().replace(/[^A-Z0-9_]/g,'');
  if(raw.length < 3){ errEl.textContent='Min 3 characters.'; return; }
  if(!_pendingGoogleUser && !_fbUser){ errEl.textContent='Session lost — please sign in again.'; return; }
  const user = _pendingGoogleUser || _fbUser;
  const btn = document.querySelector('#usernamePickerModal .menu-btn');
  btn.disabled = true; errEl.textContent='Checking…';
  try{
    const snap = await _fbDb.collection('usernames').doc(raw.toLowerCase()).get();
    if(snap.exists && snap.data().uid !== user.uid){
      errEl.textContent='Username taken — choose another.'; btn.disabled=false; return;
    }
    const sd = defaultSave(); sd.username = raw;
    const docRef = _fbDb.collection('users').doc(user.uid);
    const existing = await docRef.get();
    const mergedSd = existing.exists && existing.data()?.saveData
      ? Object.assign(sd, existing.data().saveData, {username: raw})
      : sd;
    await docRef.set({username: raw, saveData: mergedSd});
    await _fbDb.collection('usernames').doc(raw.toLowerCase()).set({uid: user.uid});
    document.getElementById('usernamePickerModal').style.display='none';
    _pendingGoogleUser = null;
    _acctFinishLogin({user, username: raw, saveData: mergedSd});
  }catch(e){ errEl.textContent = e.message||'Error saving username.'; btn.disabled=false; }
}

async function showUsernamePickerForChange(){
  if(!_fbUser){ return; }
  const errEl = document.getElementById('pickUsernameErr');
  errEl.textContent='';
  document.getElementById('pickUsername').value = mpUser?.username||'';
  _pendingGoogleUser = null;
  document.getElementById('usernamePickerModal').style.display='flex';
}

async function fbSave(sd){
  if(!_fbUser||!_fbDb) return;
  try{ await _fbDb.collection('users').doc(_fbUser.uid).set({saveData: sd},{merge:true}); }catch(e){}
}

function fbLogout(){
  if(typeof stopSocialListeners==='function') stopSocialListeners();
  if(_fbAuth) _fbAuth.signOut();
  _fbUser = null; mpUser = null;
  localStorage.removeItem('raj_callsign');
  gameActive=false; gamePaused=false; battleActive=false;
  if(mpPeer&&!mpPeer.destroyed) mpPeer.destroy();
  mpPeer=null; mpConn=null; mpConns=[];
  mpIsHost=false; mpIsGuest=false; mpRoom=null;
  showScreen('accountScreen');
}

function acctShowTab(tab){
  document.getElementById('acctLoginForm').style.display = tab==='login'?'':'none';
  document.getElementById('acctRegForm').style.display   = tab==='register'?'':'none';
  document.getElementById('tabLogin').classList.toggle('active', tab==='login');
  document.getElementById('tabRegister').classList.toggle('active', tab==='register');
  document.getElementById('loginErr').textContent='';
  document.getElementById('registerErr').textContent='';
  document.getElementById('acctStatus').textContent='';
}

function _acctSetBusy(busy){
  document.querySelectorAll('#accountScreen button').forEach(b=>{ b.disabled=busy; });
}

function _acctFinishLogin(result){
  _fbUser = result.user;
  saveData = result.saveData;
  try{ localStorage.setItem(SAVE_KEY,JSON.stringify(saveData)); }catch(e){}
  mpUser = {username: result.username};
  localStorage.setItem('raj_callsign', result.username);
  document.getElementById('lobbyUser').textContent = 'Callsign: '+result.username;
  const ub = document.getElementById('menuUserBadge');
  if(ub) ub.textContent = result.username;
  updateSaveUI();
  showScreen('mainMenu');
  if(typeof startSocialListeners==='function') startSocialListeners();
}

async function doLogin(){
  const username = document.getElementById('loginUsername').value.trim();
  const password = document.getElementById('loginPassword').value;
  const errEl    = document.getElementById('loginErr');
  if(!username){ errEl.textContent='Enter your username.'; return; }
  if(!password){ errEl.textContent='Enter your password.'; return; }
  errEl.textContent='';
  document.getElementById('acctStatus').textContent='Logging in…';
  _acctSetBusy(true);
  try{
    const r = await fbLogin(username, password);
    _acctFinishLogin(r);
  }catch(e){ errEl.textContent = e.message||'Login failed.'; }
  document.getElementById('acctStatus').textContent='';
  _acctSetBusy(false);
}

async function doRegister(){
  const username = document.getElementById('regUsername').value.trim();
  const password = document.getElementById('regPassword').value;
  const confirm  = document.getElementById('regConfirm').value;
  const errEl    = document.getElementById('registerErr');
  if(!username){ errEl.textContent='Enter a username.'; return; }
  if(!password){ errEl.textContent='Enter a password.'; return; }
  if(password!==confirm){ errEl.textContent='Passwords do not match.'; return; }
  errEl.textContent='';
  document.getElementById('acctStatus').textContent='Creating account…';
  _acctSetBusy(true);
  try{
    const r = await fbRegister(username, password);
    _acctFinishLogin(r);
  }catch(e){ errEl.textContent = e.message||'Registration failed.'; }
  document.getElementById('acctStatus').textContent='';
  _acctSetBusy(false);
}

function copyRoomCode(){
  const code = document.getElementById('waitingCode').textContent;
  if(!code||code==='—') return;
  navigator.clipboard.writeText(code)
    .then(()=>showNotif('Room code copied!'))
    .catch(()=>showNotif('Code: '+code+' (copy manually)'));
}

// ═══════════════════════════════════════════════════════════════
//  CONSTANTS
// ═══════════════════════════════════════════════════════════════
const NORMAL_FOV   = 75;
const SCOPE_FOV    = 18;
const PLAYER_H     = 1.75;
const PLAYER_SPD   = 9;
const SPRINT_SPD   = 18;
const JUMP_VEL     = 10;
const GRAVITY      = -24;
const SENSITIVITY  = 0.0022;
const PROJ_RADIUS  = 0.55; // missile hit radius (not projectile)
const WEAPONS = {
  pistol:  { id:'pistol',  name:'M9 PISTOL',     maxAmmo:15, fireCD:0.16, reloadTime:1.2, projSpeed:100, pellets:1, spread:0,    projRadius:0.28, projColor:0xFFCC44, icon:'🔫', shopId:'pistol',  shopCost:0,    dmg:10 },
  launcher:{ id:'launcher',name:'RPG LAUNCHER',  maxAmmo:6,  fireCD:0.80, reloadTime:2.5, projSpeed:65,  pellets:1, spread:0,    projRadius:0.55, projColor:0xFF8844, icon:'🚀', shopId:'launcher',shopCost:0,    dmg:50, splashRadius:10, splashDmgMult:0.5 },
  shotgun:     { id:'shotgun',     name:'SUPER SHOTGUN',  maxAmmo:2,  fireCD:1.05, reloadTime:1.7, projSpeed:78,  pellets:8,  spread:0.10, projRadius:0.26, projColor:0xFF5522, icon:'💥', shopId:'shotgun',     shopCost:1200, hasHook:true,  dmg:18 },
  sniper:      { id:'sniper',      name:'SNIPER RIFLE',   maxAmmo:5,  fireCD:1.40, reloadTime:2.8, projSpeed:200, pellets:1,  spread:0,    projRadius:0.30, projColor:0x88FFCC, icon:'🎯', shopId:'sniper',      shopCost:1800, hasScope:true, dmg:80 },
  smg:         { id:'smg',         name:'P90 SMG',        maxAmmo:30, fireCD:0.08, reloadTime:1.4, projSpeed:95,  pellets:1,  spread:0.04, projRadius:0.20, projColor:0xFFFF44, icon:'🔧', shopId:'smg',         shopCost:900,  dmg:14, autoFire:true },
  railgun:     { id:'railgun',     name:'RAILGUN',        maxAmmo:1,  fireCD:4.0,  reloadTime:3.5, projSpeed:600, pellets:1,  spread:0,    projRadius:1.0,  projColor:0x00FFFF, icon:'⚡', shopId:'railgun',     shopCost:2500, dmg:120, pierce:true },
  cluster:     { id:'cluster',     name:'CLUSTER BOMB',   maxAmmo:3,  fireCD:1.6,  reloadTime:2.2, projSpeed:68,  pellets:1,  spread:0,    projRadius:0.65, projColor:0xFF8800, icon:'💣', shopId:'cluster',     shopCost:2200, dmg:28,  clusterRadius:22 },
  shock:       { id:'shock',       name:'SHOCK RIFLE',    maxAmmo:8,  fireCD:0.9,  reloadTime:2.2, projSpeed:175, pellets:1,  spread:0,    projRadius:0.35, projColor:0xAA44FF, icon:'🌩', shopId:'shock',       shopCost:5500, dmg:45,  chainCount:3, chainDmgMult:0.5 },
};
const MISS_RADIUS  = 0.9;
const BOSS_RADIUS  = 1.6;
const SPAWN_H      = 92;
const SPAWN_RANGE  = 65;
const MAP_BOUND    = 72;

