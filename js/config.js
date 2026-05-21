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

async function fbSave(sd){
  if(!_fbUser||!_fbDb) return;
  try{ await _fbDb.collection('users').doc(_fbUser.uid).set({saveData: sd},{merge:true}); }catch(e){}
}

function fbLogout(){
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
  launcher:{ id:'launcher',name:'RPG LAUNCHER',  maxAmmo:6,  fireCD:0.80, reloadTime:2.5, projSpeed:65,  pellets:1, spread:0,    projRadius:0.55, projColor:0xFF8844, icon:'🚀', shopId:'launcher',shopCost:0,    dmg:40 },
  shotgun: { id:'shotgun', name:'SUPER SHOTGUN', maxAmmo:2,  fireCD:1.05, reloadTime:1.7, projSpeed:78,  pellets:8, spread:0.10, projRadius:0.26, projColor:0xFF5522, icon:'💥', shopId:'shotgun', shopCost:1200, hasHook:true, dmg:15 },
  sniper:  { id:'sniper',  name:'SNIPER RIFLE',  maxAmmo:5,  fireCD:1.40, reloadTime:2.8, projSpeed:200, pellets:1, spread:0,    projRadius:0.30, projColor:0x88FFCC, icon:'🎯', shopId:'sniper',  shopCost:1800, hasScope:true, dmg:50 },
  smg:     { id:'smg',     name:'P90 SMG',       maxAmmo:30, fireCD:0.08, reloadTime:1.4, projSpeed:95,  pellets:1, spread:0.04, projRadius:0.20, projColor:0xFFFF44, icon:'🔧', shopId:'smg',     shopCost:900,  dmg:7, autoFire:true  },
};
const MISS_RADIUS  = 0.9;
const BOSS_RADIUS  = 1.6;
const SPAWN_H      = 92;
const SPAWN_RANGE  = 65;
const MAP_BOUND    = 72;

