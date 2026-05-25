// PeerJS multiplayer + battle mode + DOMContentLoaded
// ═══════════════════════════════════════════════════════════════
//  PEERJS P2P MULTIPLAYER  (no server required)
// ═══════════════════════════════════════════════════════════════
let mpUser = null;          // {username}
let mpPeer = null;          // PeerJS Peer instance
let mpConn = null;          // guest→host connection
let mpConns = [];           // host: array of guest connections
let mpIsHost = false;
let mpRoom = null;          // 6-char room code
let mpMode = 'coop';        // 'coop' | 'battle'
let mpRemotePlayers = new Map(); // username → {mesh, pos, yaw}
let mpStateTimer = 0;
const MP_TICK = 0.05;
// Coop leaderboard stats
let mpLocalStats={missiles:0,soldiers:0};
let mpRemoteStats={}; // username→{missiles,soldiers}

function _updateCoopLb(){
  const el=document.getElementById('coopLeaderboard');
  const rows=document.getElementById('coopLbRows');
  if(!el||!rows) return;
  if(!mpRoom||mpMode!=='coop'||!gameActive){ el.style.display='none'; return; }
  el.style.display='block';
  const myName=mpUser?.username||'YOU';
  let html=`<div style="display:flex;justify-content:space-between;gap:14px;margin:1px 0">
    <span style="color:var(--green-ok)">${myName}</span>
    <span>${mpLocalStats.missiles} <span style="color:#888">msl</span> ${mpLocalStats.soldiers} <span style="color:#888">kll</span></span></div>`;
  Object.entries(mpRemoteStats).forEach(([name,s])=>{
    html+=`<div style="display:flex;justify-content:space-between;gap:14px;margin:1px 0">
      <span style="color:#4ADFF0">${name}</span>
      <span>${s.missiles} <span style="color:#888">msl</span> ${s.soldiers} <span style="color:#888">kll</span></span></div>`;
  });
  rows.innerHTML=html;
}

// ── Code generation ─────────────────────────────────────────────
function mpGenCode(){
  const chars='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let c='';
  for(let i=0;i<6;i++) c+=chars[Math.floor(Math.random()*chars.length)];
  return c;
}

// ── Mode toggle ─────────────────────────────────────────────────
function mpSetMode(mode){
  mpMode=mode;
  document.getElementById('mpTabCoop').classList.toggle('active',mode==='coop');
  document.getElementById('mpTabBattle').classList.toggle('active',mode==='battle');
}

// ── Username setup ──────────────────────────────────────────────
function mpSetUsername(){
  const raw=(document.getElementById('mpUsername').value||'').trim();
  const name=raw.toUpperCase().replace(/[^A-Z0-9_]/g,'');
  if(name.length<2){ document.getElementById('mpUsernameErr').textContent='Min 2 characters.'; return; }
  mpUser={username:name};
  localStorage.setItem('raj_callsign',name);
  document.getElementById('lobbyUser').textContent='Callsign: '+name;
  showScreen('lobbyScreen');
}

// ── Create room (host) ──────────────────────────────────────────
function mpCreateRoom(){
  if(!mpUser){ showScreen('accountScreen'); return; }
  if(mpPeer&&!mpPeer.destroyed) mpPeer.destroy();
  const code=mpGenCode();
  mpRoom=code; mpIsHost=true;
  mpPeer=new Peer('raj-'+code.toLowerCase(),{debug:0});
  mpPeer.on('open',()=>{
    document.getElementById('waitingCode').textContent=code;
    document.getElementById('waitingTitle').textContent='Waiting Room';
    document.getElementById('waitingMode').textContent='Mode: '+(mpMode==='battle'?'⚔️ Battle':'🤝 Coop');
    document.getElementById('btnStartMp').style.display='';
    mpRenderWaiting();
    showScreen('waitingScreen');
  });
  mpPeer.on('connection',conn=>{
    if(mpConns.length>=1){ conn.close(); return; }
    mpConns.push(conn);
    conn.on('open',()=>{
      conn.send({type:'welcome',code,mode:mpMode,hostName:mpUser.username});
    });
    conn.on('data',d=>mpHandleData(d,conn));
    conn.on('close',()=>{
      if(conn._mpName) removeRemotePlayer(conn._mpName);
      mpConns=mpConns.filter(c=>c!==conn);
      mpRenderWaiting();
    });
  });
  mpPeer.on('error',e=>{ mpShowErr('lobbyErr','PeerJS: '+e.type+' — try again'); });
}

// ── Join room (guest) ───────────────────────────────────────────
function mpJoinRoom(){
  if(!mpUser){ showScreen('accountScreen'); return; }
  const code=(document.getElementById('joinCode').value||'').trim().toUpperCase().replace(/[^A-Z0-9]/g,'');
  if(code.length!==6){ mpShowErr('lobbyErr','Enter 6-character code.'); return; }
  if(mpPeer&&!mpPeer.destroyed) mpPeer.destroy();
  mpRoom=code; mpIsHost=false;
  mpPeer=new Peer({debug:0});
  mpPeer.on('open',()=>{
    mpConn=mpPeer.connect('raj-'+code.toLowerCase(),{reliable:true});
    mpConn.on('open',()=>{ mpConn.send({type:'hello',username:mpUser.username}); });
    mpConn.on('data',d=>mpHandleData(d,mpConn));
    mpConn.on('close',()=>{
      showNotif('Host disconnected.');
      mpRemotePlayers.forEach((_,u)=>removeRemotePlayer(u));
      mpRemotePlayers.clear();
      showScreen('lobbyScreen');
    });
  });
  mpPeer.on('error',e=>{ mpShowErr('lobbyErr','Cannot connect: '+e.type+'. Check code.'); });
}

// ── Data handler ────────────────────────────────────────────────
function mpHandleData(data, conn){
  switch(data.type){
    case 'welcome':
      mpMode=data.mode;
      document.getElementById('waitingCode').textContent=data.code||mpRoom;
      document.getElementById('waitingMode').textContent='Mode: '+(data.mode==='battle'?'⚔️ Battle':'🤝 Coop');
      document.getElementById('waitingTitle').textContent='Waiting Room';
      document.getElementById('btnStartMp').style.display='none';
      conn._mpName=data.hostName;
      conn.send({type:'hello',username:mpUser.username});
      mpRenderWaiting();
      showScreen('waitingScreen');
      break;
    case 'hello':
      conn._mpName=data.username;
      if(mpIsHost) conn.send({type:'hello_ok',username:mpUser.username});
      mpRenderWaiting();
      break;
    case 'hello_ok':
      conn._mpName=data.username;
      mpRenderWaiting();
      break;
    case 'start':
      mpMode=data.mode;
      if(mpMode==='battle'){
        mpIsGuest=!mpIsHost;
        startBattleMode();
      } else {
        mpIsGuest=true;
        const loc=data.locId||saveData.locId||'beirut';
        startGame(loc,1);
        const rpName=data.hostName||conn._mpName||'Host';
        const rp=createRemotePlayerMesh(rpName);
        mpRemotePlayers.set(rpName,rp);
      }
      break;
    case 'pos':
      if(data.username) mpApplyRemoteState(data);
      break;
    case 'game_state':
      if(mpIsGuest) mpApplyGameState(data);
      break;
    case 'state':
      if(data.username) mpApplyRemoteState(data);
      break;
    case 'battle_hit':
      battleHP.local=Math.max(0,battleHP.local-data.dmg);
      showDamageFlash();
      _updateBattleHud();
      showNotif('HIT! '+battleHP.local+'HP left');
      if(battleHP.local<=0) _battleRoundEnd(false);
      break;
    case 'battle_end':
      endBattleMode(false);
      break;
    case 'battle_weapon':
      _applyBattleWeapon(data.weapon);
      break;
    case 'rematch_vote':
      { const el=document.getElementById('beRematchStatus');
        if(_rematchVoted){
          // Both voted — host kicks it off
          battleRounds={local:0,remote:0}; _rematchVoted=false;
          if(mpIsHost){
            mpConns.forEach(c=>{ if(c.open) c.send({type:'rematch_go'}); });
            startBattleMode();
          }
          // guest waits for rematch_go
        } else {
          if(el) el.textContent='Opponent wants a rematch — click Rematch to confirm!';
        }
      }
      break;
    case 'rematch_go':
      battleRounds={local:0,remote:0}; _rematchVoted=false;
      startBattleMode();
      break;
  }
}

// ── Lobby/waiting UI ────────────────────────────────────────────
function mpShowErr(id, msg){
  const el=document.getElementById(id);
  if(el){ el.textContent=msg; setTimeout(()=>{ if(el.textContent===msg) el.textContent=''; },4000); }
}
function mpLeaveRoom(){
  if(mpConn) mpConn.close();
  mpConns.forEach(c=>c.close());
  if(mpPeer&&!mpPeer.destroyed) mpPeer.destroy();
  mpPeer=null; mpConn=null; mpConns=[];
  mpIsHost=false; mpIsGuest=false; mpRoom=null;
  mpRemotePlayers.forEach((_,u)=>removeRemotePlayer(u));
  mpRemotePlayers.clear();
  showScreen('lobbyScreen');
}
function mpStartGame(){
  if(!mpIsHost) return;
  const guestConn=mpConns[0];
  if(!guestConn){ showNotif('Need 1 more player!'); return; }
  const guestName=guestConn._mpName||'Guest';
  const loc=saveData.locId||'beirut';
  guestConn.send({type:'start',mode:mpMode,hostName:mpUser.username,locId:loc});
  mpIsGuest=false;
  if(mpMode==='battle'){
    startBattleMode();
  } else {
    startGame(loc,1);
    const rp=createRemotePlayerMesh(guestName);
    mpRemotePlayers.set(guestName,rp);
  }
}
function mpRenderWaiting(){
  const list=document.getElementById('waitingPlayerList');
  const rows=[];
  rows.push(`<div class="mp-player-row">${mpUser?.username||'You'}${mpIsHost?' <span>HOST</span>':''}</div>`);
  mpConns.forEach(c=>{ if(c._mpName) rows.push(`<div class="mp-player-row">${c._mpName}</div>`); });
  if(!mpIsHost){
    const hname=mpConn?._mpName;
    if(hname) rows.push(`<div class="mp-player-row">${hname} <span>HOST</span></div>`);
    else rows.push(`<div class="mp-player-row" style="color:var(--text2)">Connecting to host…</div>`);
  }
  list.innerHTML=rows.join('');
  const startBtn=document.getElementById('btnStartMp');
  if(startBtn) startBtn.style.display=mpIsHost&&mpConns.length>0?'':'none';
}

// ── Remote player rendering ─────────────────────────────────────
function createRemotePlayerMesh(username){
  // Use actual character model with distinct blue-tinted outfit
  const charModel=makeCharModel({
    outfitColor:'#1A4A8A', armorStyle:'light', helmet:true,
    visorColor:'#44DDFF', backpack:'missile', skinTone:'#C8955A'
  });
  charModel.scale.set(1,1,1);
  // Add username label
  const labelDiv=document.createElement('div');
  labelDiv.style.cssText='position:fixed;pointer-events:none;font-size:.7em;font-family:Rajdhani,sans-serif;color:#4ADFF0;font-weight:700;letter-spacing:.08em;text-shadow:0 1px 4px #000;z-index:28;display:none';
  labelDiv.textContent=username;
  document.body.appendChild(labelDiv);
  scene.add(charModel);
  const startPos=new THREE.Vector3();
  return {mesh:charModel, pos:startPos.clone(), targetPos:startPos.clone(), yaw:0, targetYaw:0, username, label:labelDiv};
}
function removeRemotePlayer(username){
  const rp=mpRemotePlayers.get(username);
  if(rp){ scene.remove(rp.mesh); if(rp.label) rp.label.remove(); }
  mpRemotePlayers.delete(username);
}
function updateRemotePlayers(){
  const lastDt=Math.min((performance.now()-_rpLastT)/1000,.05);
  _rpLastT=performance.now();
  const alpha=Math.min(1,lastDt*30);
  mpRemotePlayers.forEach(rp=>{
    // Smooth interpolation toward received position
    rp.pos.lerp(rp.targetPos,alpha);
    // Shortest-path yaw lerp
    let dyaw=rp.targetYaw-rp.yaw;
    if(dyaw>Math.PI) dyaw-=2*Math.PI;
    if(dyaw<-Math.PI) dyaw+=2*Math.PI;
    rp.yaw+=dyaw*alpha;

    rp.mesh.position.set(rp.pos.x, rp.pos.y-PLAYER_H, rp.pos.z);
    rp.mesh.rotation.y=rp.yaw+Math.PI;
    // Project label
    if(rp.label){
      const lp=new THREE.Vector3(rp.pos.x,rp.pos.y+0.5,rp.pos.z).project(camera);
      if(lp.z<1){
        const lx=(lp.x*.5+.5)*window.innerWidth;
        const ly=(-.5*lp.y+.5)*window.innerHeight;
        rp.label.style.display='block';
        rp.label.style.left=(lx-rp.label.offsetWidth/2)+'px';
        rp.label.style.top=(ly-32)+'px';
      } else { rp.label.style.display='none'; }
    }
  });
}
let _rpLastT=performance.now();

// ── State broadcast @20Hz ───────────────────────────────────────
function mpBroadcastState(){
  if(!mpRoom||!mpUser) return;
  // Always send own position + coop stats
  const pos={type:'pos',username:mpUser.username,px,py,pz,yaw,
    missiles:mpLocalStats.missiles,soldiers:mpLocalStats.soldiers};
  if(mpIsHost){
    mpConns.forEach(c=>{ if(c.open) c.send(pos); });
    // Host also broadcasts full game state
    const gs={
      type:'game_state',
      locId:selectedLoc,
      waveNum, waveActive,
      cityIntegrity, score,
      missiles:missiles.filter(m=>!m.isDestroyed).map(m=>({
        id:m._id, x:m.pos.x, y:m.pos.y, z:m.pos.z,
        vx:m.vel.x, vy:m.vel.y, vz:m.vel.z,
        health:m.health, maxHealth:m.maxHealth, isBoss:m.isBoss
      })),
      soldiers:soldiers.map(s=>({id:s._id||0,x:s.pos.x,z:s.pos.z,hp:s.health,type:s.type}))
    };
    mpConns.forEach(c=>{ if(c.open) c.send(gs); });
  } else if(mpConn?.open){
    mpConn.send(pos);
  }
}
function mpApplyRemoteState(data){
  let rp=mpRemotePlayers.get(data.username);
  if(rp){ rp.targetPos.set(data.px,data.py,data.pz); rp.targetYaw=data.yaw; }
  if(data.username&&data.missiles!==undefined){
    mpRemoteStats[data.username]={missiles:data.missiles,soldiers:data.soldiers||0};
    _updateCoopLb();
  }
}
function mpApplyGameState(data){
  if(!gameActive) return;
  // Sync loc — rebuild world if different
  if(data.locId&&data.locId!==selectedLoc){ selectedLoc=data.locId; buildWorld(data.locId); }
  waveNum=data.waveNum;
  waveActive=data.waveActive;
  if(data.cityIntegrity!==undefined) cityIntegrity=data.cityIntegrity;
  if(data.score!==undefined) score=data.score;

  // Sync missiles — create/move/remove to match host
  const hostIds=new Set((data.missiles||[]).map(m=>m.id));
  // Remove missiles not in host state
  for(let i=missiles.length-1;i>=0;i--){
    if(!hostIds.has(missiles[i]._id)&&!missiles[i].isDestroyed){
      destroyMissile(missiles[i],false);
    }
  }
  // Update or create missiles
  for(const hm of (data.missiles||[])){
    let m=missiles.find(x=>x._id===hm.id);
    if(!m){
      spawnMissile(hm.isBoss);
      m=missiles[missiles.length-1];
      m._id=hm.id;
    }
    m.pos.set(hm.x,hm.y,hm.z);
    m.vel.set(hm.vx,hm.vy,hm.vz);
    m.health=hm.health;
    m.group.position.copy(m.pos);
  }
}

// ═══════════════════════════════════════════════════════════════
//  BATTLE MODE  (1v1 Gulag)
// ═══════════════════════════════════════════════════════════════
let battleActive=false;
let battleHP={local:200,remote:200};
let battleRounds={local:0,remote:0}; // best of 3
let _battleHudEl=null;
let _gulagLights=[];
let gulagCollidables=[];
let _rematchVoted=false;
const BATTLE_MAX_HP=200;
const BATTLE_WEAPONS=['pistol','shotgun','smg','sniper'];

function _applyBattleWeapon(w){
  const ammos={pistol:60,shotgun:24,smg:270,sniper:15};
  weaponInventory=new Set([w]);
  currentWeapon=w;
  weaponAmmo={pistol:0,shotgun:0,smg:0,launcher:0,sniper:0};
  weaponAmmo[w]=ammos[w]||30;
  ammo=weaponAmmo[w];
  isReloading=false; fireCD=0;
  scoped=false; scopeT=0;
  if(weaponMesh) camera.remove(weaponMesh);
  weaponMesh=makeWeaponMesh(); camera.add(weaponMesh);
  updateWeaponBar();
  showNotif('Round weapon: '+(WEAPONS[w]?.name||w)+'!');
}

function _buildGulag(){
  clearWorld();
  // Remove previous gulag lights
  _gulagLights.forEach(l=>scene.remove(l));
  _gulagLights=[];
  gulagCollidables=[];

  waveActive=false;

  scene.background=new THREE.Color(0x5AABDD);
  scene.fog=null;
  renderer.setClearColor(0x5AABDD);

  // Track lights so they don't accumulate across rounds
  const addL=l=>{ scene.add(l); _gulagLights.push(l); return l; };
  addL(new THREE.AmbientLight(0xFFFFFF,.65));
  const sun=addL(new THREE.DirectionalLight(0xFFEECC,.9)); sun.position.set(8,25,5);
  const blueL=addL(new THREE.PointLight(0x4488FF,.5,60)); blueL.position.set(-30,5,0);
  const redL=addL(new THREE.PointLight(0xFF4422,.5,60)); redL.position.set(30,5,0);

  // add=visual only | addC=visual+collision
  const add=(geo,color,x,y,z)=>{
    const m=new THREE.Mesh(geo,new THREE.MeshLambertMaterial({color}));
    m.position.set(x,y,z); scene.add(m); worldObjects.push(m); return m;
  };
  const addC=(geo,color,x,y,z)=>{ const m=add(geo,color,x,y,z); gulagCollidables.push(m); return m; };

  // Floor — 80×80 concrete
  add(new THREE.BoxGeometry(80,.3,80),0x2E2A24,0,-.15,0);
  // Grate stripes (visual only — no collision)
  for(let i=-38;i<=38;i+=5) add(new THREE.BoxGeometry(.1,.05,80),0x3A3530,i,.05,0);

  // Outer walls — 8 units tall, open sky
  addC(new THREE.BoxGeometry(80,8,.5),0x7A7060,0,4,40.25);
  addC(new THREE.BoxGeometry(80,8,.5),0x7A7060,0,4,-40.25);
  addC(new THREE.BoxGeometry(.5,8,80),0x7A7060,40.25,4,0);
  addC(new THREE.BoxGeometry(.5,8,80),0x7A7060,-40.25,4,0);

  // Center divider
  addC(new THREE.BoxGeometry(.4,2.5,20),0x5A4A38,0,1.25,0);

  // Scattered cover (collidable)
  const cov=[
    [-15,.75,-15,3,1.5,2],[15,.75,15,3,1.5,2],[-15,.75,15,2,1.5,3],[15,.75,-15,2,1.5,3],
    [0,.5,-22,5,1,1.5],   [0,.5,22,5,1,1.5],
    [-24,1,0,1.5,2,5],    [24,1,0,1.5,2,5],
    [-10,.5,-12,2,.9,2],  [10,.5,12,2,.9,2],[-10,.5,12,2,.9,2],[10,.5,-12,2,.9,2],
    [0,1.2,-14,1,2.4,1],  [0,1.2,14,1,2.4,1],
    [-30,.9,-20,2,1.8,3], [30,.9,20,2,1.8,3],[-30,.9,20,2,1.8,3],[30,.9,-20,2,1.8,3],
    [-22,.5,0,1,1.2,7],   [22,.5,0,1,1.2,7],
    [-8,.5,-25,3,1,2],    [8,.5,25,3,1,2],[-8,.5,25,3,1,2],[8,.5,-25,3,1,2],
    [-35,.5,-10,2,1.5,3], [35,.5,10,2,1.5,3],
    [0,.5,-35,4,1,2],     [0,.5,35,4,1,2],
  ];
  cov.forEach(([x,y,z,w,h,d])=>addC(new THREE.BoxGeometry(w,h,d),0x6A5A48,x,y,z));

  // Pillars (collidable)
  [[-32,3,-32],[-32,3,32],[32,3,-32],[32,3,32],[-32,3,0],[32,3,0],[0,3,-32],[0,3,32]].forEach(([x,y,z])=>
    addC(new THREE.BoxGeometry(1.2,6,1.2),0x4A3A2A,x,y,z));
}

function _updateBattleHud(){
  if(!_battleHudEl) return;
  const lPct=Math.round(battleHP.local/BATTLE_MAX_HP*100);
  const rPct=Math.round(battleHP.remote/BATTLE_MAX_HP*100);
  _battleHudEl.innerHTML=`
    <div style="display:flex;gap:12px;align-items:center;">
      <div style="text-align:right;min-width:80px">
        <div style="font-size:.7em;color:var(--text2);letter-spacing:.1em">${mpUser?.username||'YOU'}</div>
        <div style="width:150px;height:10px;background:#222;border-radius:3px;overflow:hidden;margin-top:2px">
          <div style="width:${lPct}%;height:100%;background:#4AE870;transition:width .15s"></div></div>
        <div style="font-size:.72em;color:#4AE870">${battleHP.local} HP</div>
      </div>
      <div style="font-size:1em;font-weight:700;color:var(--amber);font-family:'Rajdhani',sans-serif">
        ${battleRounds.local} — ${battleRounds.remote}<br>
        <span style="font-size:.6em;color:var(--text2)">BEST OF 3</span>
      </div>
      <div style="min-width:80px">
        <div style="font-size:.7em;color:var(--text2);letter-spacing:.1em">${mpIsHost?(mpConns[0]?._mpName||'ENEMY'):(mpConn?._mpName||'ENEMY')}</div>
        <div style="width:150px;height:10px;background:#222;border-radius:3px;overflow:hidden;margin-top:2px">
          <div style="width:${rPct}%;height:100%;background:#E84A4A;transition:width .15s"></div></div>
        <div style="font-size:.72em;color:#E84A4A">${battleHP.remote} HP</div>
      </div>
    </div>`;
}

function startBattleMode(){
  battleActive=true;
  battleHP={local:BATTLE_MAX_HP,remote:BATTLE_MAX_HP};

  // Build gulag arena
  _buildGulag();
  selectedLoc='beirut';

  px=mpIsHost?-20:20; py=PLAYER_H; pz=0;
  vx=0; vy=0; vz=0;
  yaw=mpIsHost?Math.PI/2:-Math.PI/2; pitch=0;
  currentWeapon='pistol';
  weaponInventory=new Set(['pistol']);
  weaponAmmo={pistol:60,shotgun:0,smg:0,launcher:0,sniper:0};
  ammo=60; isReloading=false; fireCD=0; scoped=false;
  effectiveSpd=PLAYER_SPD*1.1; effectiveSprint=SPRINT_SPD*1.1; dmgMult=1;
  activeGadgets={flashbang:1,airstrike:0,cover:1};

  // Spawn opponent mesh
  const oppName=mpIsHost?(mpConns[0]?._mpName||'Enemy'):(mpConn?._mpName||'Enemy');
  const rp=createRemotePlayerMesh(oppName);
  rp.pos.set(mpIsHost?20:-20, PLAYER_H, 0);
  mpRemotePlayers.set(oppName,rp);

  // Host picks initial random weapon and broadcasts
  if(mpIsHost){
    setTimeout(()=>{
      const w=BATTLE_WEAPONS[Math.floor(Math.random()*BATTLE_WEAPONS.length)];
      _applyBattleWeapon(w);
      mpConns.forEach(c=>{ if(c.open) c.send({type:'battle_weapon',weapon:w}); });
    },800);
  }

  // Battle HUD overlay
  if(!_battleHudEl){
    _battleHudEl=document.createElement('div');
    _battleHudEl.style.cssText='position:fixed;top:14px;left:50%;transform:translateX(-50%);z-index:35;pointer-events:none;font-family:"Rajdhani",sans-serif;text-align:center;';
    document.body.appendChild(_battleHudEl);
  }
  _battleHudEl.style.display='block';
  _updateBattleHud();

  // Hide gadget/ultimate HUDs — battle mode doesn't use them
  ['cyberBulletHud','rajpnFistHud','gadgetHud','coopLeaderboard'].forEach(id=>{
    const el=document.getElementById(id); if(el) el.style.display='none';
  });
  // Rebuild weapon mesh (clearWorld stripped it)
  if(weaponMesh) camera.remove(weaponMesh);
  weaponMesh=makeWeaponMesh(); camera.add(weaponMesh);

  gameActive=true; gamePaused=false;
  showScreen('hud');
  document.getElementById('crosshair').style.display='block';
  document.getElementById('weaponBar').style.display='flex';
  document.getElementById('minimap').style.display='none';
  document.getElementById('clickNotice').style.display='flex';
  updateWeaponBar();
  showNotif('GULAG — 1v1! Best of 3 rounds!');
}

function mpBattleSendHit(dmg){
  const msg={type:'battle_hit',dmg};
  if(mpIsHost){ mpConns.forEach(c=>{ if(c.open) c.send(msg); }); }
  else if(mpConn?.open){ mpConn.send(msg); }
  battleHP.remote=Math.max(0,battleHP.remote-dmg);
  _updateBattleHud();
  if(battleHP.remote<=0) _battleRoundEnd(true);
}

function _battleRoundEnd(won){
  if(won) battleRounds.local++; else battleRounds.remote++;
  const totalRounds=battleRounds.local+battleRounds.remote;
  if(battleRounds.local>=2||battleRounds.remote>=2){
    endBattleMode(battleRounds.local>=2);
  } else {
    showNotif(won?'ROUND WIN! Get ready…':'ROUND LOST! Get ready…');
    // Reset HP, reposition
    setTimeout(()=>{
      battleHP={local:BATTLE_MAX_HP,remote:BATTLE_MAX_HP};
      px=mpIsHost?-20:20; py=PLAYER_H; pz=0;
      vx=0;vy=0;vz=0;
      yaw=mpIsHost?Math.PI/2:-Math.PI/2;
      scoped=false; scopeT=0;
      _updateBattleHud();
      if(mpIsHost){
        const w=BATTLE_WEAPONS[Math.floor(Math.random()*BATTLE_WEAPONS.length)];
        _applyBattleWeapon(w);
        mpConns.forEach(c=>{ if(c.open) c.send({type:'battle_weapon',weapon:w}); });
      }
    },1500);
  }
}

function endBattleMode(won){
  battleActive=false; gameActive=false;
  _rematchVoted=false;
  if(_battleHudEl) _battleHudEl.style.display='none';
  if(document.pointerLockElement) document.exitPointerLock();
  isLocked=false;
  // Hide all floating HUDs
  ['cyberBulletHud','rajpnFistHud','gadgetHud','coopLeaderboard','healthBars'].forEach(id=>{
    const el=document.getElementById(id); if(el) el.style.display='none';
  });
  document.getElementById('crosshair').style.display='none';
  document.getElementById('weaponBar').style.display='none';

  const reward=won?(500+battleRounds.local*100):0;
  if(won){ saveData.currency+=reward; saveSave(); }

  // Populate end screen
  const title=document.getElementById('battleEndTitle');
  const sub=document.getElementById('battleEndSub');
  if(title){ title.textContent=won?'VICTORY':'ELIMINATED'; title.style.color=won?'#4AE870':'#E84A4A'; }
  if(sub) sub.textContent=`${battleRounds.local} — ${battleRounds.remote}  ·  Best of 3`;
  const elRW=document.getElementById('beRoundsWon'); if(elRW) elRW.textContent=battleRounds.local;
  const elRL=document.getElementById('beRoundsLost'); if(elRL) elRL.textContent=battleRounds.remote;
  const elCr=document.getElementById('beCredits'); if(elCr){ elCr.textContent=won?'+'+reward+' credits':'—'; elCr.style.color=won?'var(--amber)':'var(--text2)'; }
  const elSt=document.getElementById('beRematchStatus'); if(elSt) elSt.textContent='';
  showScreen('battleEndScreen');
}

// Wire up rematch + menu buttons (called from DOMContentLoaded)
function _setupBattleEndButtons(){
  document.getElementById('btnBattleRematch').addEventListener('click',()=>{
    if(!mpRoom){ showScreen('mainMenu'); return; }
    const statusEl=document.getElementById('beRematchStatus');
    if(_rematchVoted){ return; } // already voted, waiting
    _rematchVoted=true;
    if(statusEl) statusEl.textContent='Waiting for opponent…';
    const msg={type:'rematch_vote'};
    if(mpIsHost){ mpConns[0]?.send(msg); }
    else         { mpConn?.send(msg); }
  });
  document.getElementById('btnBattleMenu').addEventListener('click',()=>{
    mpLeaveRoom&&mpLeaveRoom();
    returnToMenu();
  });
}

// ── Boot + auth ──────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded',()=>{
  _setupBattleEndButtons();

  document.getElementById('btnLogout')?.addEventListener('click',()=>{
    document.getElementById('settingsLogoutConfirm').style.display='block';
  });
  document.getElementById('btnLogoutConfirm')?.addEventListener('click',()=>{
    showNotif('Logging out…');
    fbLogout();
  });
  document.getElementById('btnLogoutCancel')?.addEventListener('click',()=>{
    document.getElementById('settingsLogoutConfirm').style.display='none';
  });
  document.getElementById('btnSettingsBack')?.addEventListener('click',()=>{
    showScreen('pauseMenu');
  });

  document.getElementById('btnMultiplayer')?.addEventListener('click',()=>{
    if(!mpUser){ showScreen('accountScreen'); return; }
    document.getElementById('lobbyUser').textContent='Callsign: '+mpUser.username;
    showScreen('lobbyScreen');
  });

  const loadEl=document.getElementById('loadingScreen');

  if(_fbAuth){
    _fbAuth.onAuthStateChanged(async user=>{
      if(user){
        _fbUser=user;
        try{
          const doc=await _fbDb.collection('users').doc(user.uid).get();
          const data=doc.data();
          if(data?.saveData) saveData=Object.assign(defaultSave(),data.saveData);
          try{ localStorage.setItem(SAVE_KEY,JSON.stringify(saveData)); }catch(e){}
          const uname=data?.username||user.displayName||'PLAYER';
          mpUser={username:uname};
          localStorage.setItem('raj_callsign',uname);
          document.getElementById('lobbyUser').textContent='Callsign: '+uname;
          const ub=document.getElementById('menuUserBadge');
          if(ub) ub.textContent=uname;
          updateSaveUI();
        }catch(e){ console.warn('Firestore load:',e); }
        if(loadEl) loadEl.classList.remove('active');
        showScreen('mainMenu');
      } else {
        _fbUser=null; mpUser=null;
        if(loadEl) loadEl.classList.remove('active');
        showScreen('accountScreen');
      }
    });
  } else {
    // Firebase not configured — fall back to localStorage callsign
    if(loadEl) loadEl.classList.remove('active');
    const saved=localStorage.getItem('raj_callsign');
    if(saved){
      mpUser={username:saved};
      const ub=document.getElementById('menuUserBadge');
      if(ub) ub.textContent=saved;
      updateSaveUI();
      showScreen('mainMenu');
    } else {
      showScreen('accountScreen');
    }
  }
});
