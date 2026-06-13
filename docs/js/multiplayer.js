// PeerJS multiplayer + battle mode + DOMContentLoaded
// ═══════════════════════════════════════════════════════════════
//  PEERJS P2P MULTIPLAYER  (no server required)
// ═══════════════════════════════════════════════════════════════
let mpUser = null;          // {username}
let mpPeer = null;          // PeerJS Peer instance
let mpConn = null;          // guest→host connection
let mpConns = [];           // host: array of guest connections (max 3 = 4 players total)
let mpIsHost = false;
let mpRoom = null;          // 6-char room code
let mpMode = 'coop';        // 'coop' | 'battle'
let mpRemotePlayers = new Map(); // username → {mesh, pos, yaw}
let mpStateTimer = 0;
const MP_TICK = 0.05;
// Coop leaderboard stats
let mpLocalStats={missiles:0,soldiers:0};
let mpRemoteStats={}; // username→{missiles,soldiers}
// 4-player additions
let mpWaitingCustos = new Map(); // username → custo object
let mpMyTeam = null;             // 'A' | 'B' | null (battle mode)
let _mpTeams = null;             // {A:[...names], B:[...names]}
let _aiBotTeam = null;           // which team the AI bot is on
let _aiBot = null;               // {pos, hp, shootTimer}
const AI_BOT_NAME = '__AI_BOT__';
// Shared override so lobbyScene.js can show waiting room players
let _mpOverrideSlots = null;

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
  const tc=document.getElementById('mpTabCoop'); if(tc) tc.classList.toggle('active',mode==='coop');
  const tb=document.getElementById('mpTabBattle'); if(tb) tb.classList.toggle('active',mode==='battle');
  const sub=document.getElementById('lobbyUser');
  if(mode==='convoy'&&sub) sub.textContent='Mode: 🚚 Convoy Crisis — create or join a room';
}
function _mpModeLabel(m){ return m==='battle'?'⚔️ Battle':m==='convoy'?'🚚 Convoy Crisis':'🤝 Coop'; }

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
    document.getElementById('waitingMode').textContent='Mode: '+_mpModeLabel(mpMode);
    document.getElementById('btnStartMp').style.display='';
    mpRenderWaiting();
    _mpUpdateWaitingStage();
    showScreen('waitingScreen');
  });
  mpPeer.on('connection',conn=>{
    if(mpConns.length>=3){ conn.close(); return; } // max 4 players total
    mpConns.push(conn);
    conn.on('open',()=>{
      conn.send({type:'welcome',code,mode:mpMode,hostName:mpUser.username,custo:saveData.customization});
    });
    conn.on('data',d=>mpHandleData(d,conn));
    conn.on('close',()=>{
      const leaving=conn._mpName;
      if(leaving){
        removeRemotePlayer(leaving);
        mpWaitingCustos.delete(leaving);
        mpConns.filter(c=>c!==conn&&c.open).forEach(c=>c.send({type:'player_left',username:leaving}));
      }
      mpConns=mpConns.filter(c=>c!==conn);
      mpRenderWaiting();
      _mpUpdateWaitingStage();
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
    mpConn.on('open',()=>{ mpConn.send({type:'hello',username:mpUser.username,custo:saveData.customization}); });
    mpConn.on('data',d=>mpHandleData(d,mpConn));
    mpConn.on('close',()=>{
      showNotif('Host disconnected.');
      mpRemotePlayers.forEach((_,u)=>removeRemotePlayer(u));
      mpRemotePlayers.clear();
      mpWaitingCustos.clear();
      _mpOverrideSlots=null;
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
      if(data.custo&&data.hostName) mpWaitingCustos.set(data.hostName,data.custo);
      document.getElementById('waitingCode').textContent=data.code||mpRoom;
      document.getElementById('waitingMode').textContent='Mode: '+_mpModeLabel(data.mode);
      document.getElementById('waitingTitle').textContent='Waiting Room';
      document.getElementById('btnStartMp').style.display='none';
      conn._mpName=data.hostName;
      // hello is also sent on 'open', this is the response to welcome
      mpRenderWaiting();
      _mpUpdateWaitingStage();
      showScreen('waitingScreen');
      break;
    case 'hello':
      conn._mpName=data.username;
      if(data.custo) mpWaitingCustos.set(data.username,data.custo);
      if(mpIsHost){
        // Send hello_ok with own info + list of all other players
        const playerList=mpConns
          .filter(c=>c!==conn&&c._mpName)
          .map(c=>({username:c._mpName,custo:mpWaitingCustos.get(c._mpName)||_defaultCusto()}));
        conn.send({type:'hello_ok',username:mpUser.username,custo:saveData.customization,playerList});
        // Tell other connected guests about the new player
        mpConns.filter(c=>c!==conn&&c.open&&c._mpName).forEach(c=>
          c.send({type:'player_joined',username:data.username,custo:data.custo||_defaultCusto()})
        );
      }
      mpRenderWaiting();
      _mpUpdateWaitingStage();
      break;
    case 'hello_ok':
      conn._mpName=data.username;
      if(data.custo) mpWaitingCustos.set(data.username,data.custo);
      if(data.playerList) data.playerList.forEach(p=>{ if(p.username) mpWaitingCustos.set(p.username,p.custo||_defaultCusto()); });
      mpRenderWaiting();
      _mpUpdateWaitingStage();
      break;
    case 'player_joined':
      if(data.username) mpWaitingCustos.set(data.username,data.custo||_defaultCusto());
      mpRenderWaiting();
      _mpUpdateWaitingStage();
      break;
    case 'player_left':
      if(data.username){
        removeRemotePlayer(data.username);
        mpWaitingCustos.delete(data.username);
      }
      mpRenderWaiting();
      _mpUpdateWaitingStage();
      break;
    case 'start':
      mpMode=data.mode;
      mpIsGuest=true;
      if(mpMode==='convoy'){
        selectedLoc=data.locId||'beirut';
        if(typeof startConvoyOnlineGuest==='function') startConvoyOnlineGuest(data);
      } else if(mpMode==='battle'){
        mpMyTeam=data.myTeam||'B';
        _mpTeams=data.teams||null;
        _aiBotTeam=data.aiTeam||null;
        startBattleMode();
      } else {
        const loc=data.locId||saveData.locId||'beirut';
        startGame(loc,1);
        // Create meshes for all other players (host + other guests)
        (data.players||[]).forEach(p=>{
          const name=p.username||p;
          const rp=createRemotePlayerMesh(name);
          mpRemotePlayers.set(name,rp);
        });
      }
      break;
    case 'pos':
      if(data.username) mpApplyRemoteState(data);
      // Host relays pos from one guest to all other guests
      if(mpIsHost){
        mpConns.forEach(c=>{ if(c.open&&c._mpName!==data.username) c.send(data); });
      }
      break;
    case 'cv_state':
      if(typeof cvApplyNetState==='function') cvApplyNetState(data);
      break;
    case 'cv_round':
      if(typeof cvApplyRoundEnd==='function') cvApplyRoundEnd(data);
      break;
    case 'cv_hit':
      if(typeof cvHostApplyHit==='function') cvHostApplyHit(data);
      break;
    case 'game_state':
      if(mpIsGuest) mpApplyGameState(data);
      break;
    case 'state':
      if(data.username) mpApplyRemoteState(data);
      if(mpIsHost){
        mpConns.forEach(c=>{ if(c.open&&c._mpName!==data.username) c.send(data); });
      }
      break;
    case 'battle_hit':
      // Only apply damage if we're the target (undefined target = 1v1 compat)
      if(!data.target||data.target===mpUser.username){
        battleHP.local=Math.max(0,battleHP.local-data.dmg);
        showDamageFlash();
        _updateBattleHud();
        showNotif('HIT! '+battleHP.local+'HP left');
        if(battleHP.local<=0) _battleRoundEnd(false);
      }
      // Host relays targeted hits to the correct guest
      if(mpIsHost&&data.target&&data.target!==mpUser.username){
        const tc=mpConns.find(c=>c._mpName===data.target);
        if(tc?.open) tc.send(data);
      }
      break;
    case 'battle_end':
      endBattleMode(false);
      break;
    case 'kc_skip':
      if(data.username){
        _kcVotes.add(data.username);
        // Host relays the vote to all other guests
        if(mpIsHost) mpConns.forEach(c=>{ if(c.open&&c._mpName!==data.username) c.send(data); });
        if(_kcActive) _kcCheckVotes();
      }
      break;
    case 'battle_weapon':
      if(data.modifier) _applyBattleModifier(data.modifier);
      _applyBattleWeapon(data.weapon);
      break;
    case 'rematch_vote':
      { const el=document.getElementById('beRematchStatus');
        if(_rematchVoted){
          battleRounds={local:0,remote:0}; _rematchVoted=false;
          if(mpIsHost){
            mpConns.forEach(c=>{ if(c.open) c.send({type:'rematch_go'}); });
            startBattleMode();
          }
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
  mpMyTeam=null; _mpTeams=null; _aiBotTeam=null; _aiBot=null;
  mpWaitingCustos.clear();
  _mpOverrideSlots=null;
  mpRemotePlayers.forEach((_,u)=>removeRemotePlayer(u));
  mpRemotePlayers.clear();
  showScreen('lobbyScreen');
}

function mpStartGame(){
  if(!mpIsHost) return;
  if(mpConns.length===0){ showNotif('Need at least 1 more player!'); return; }
  const loc=saveData.locId||'beirut';

  if(mpMode==='convoy'){
    // Auto-assign sides — host defends round 1, guests split, bots fill.
    const guests=mpConns.filter(c=>c._mpName);
    const roster=[mpUser.username,...guests.map(c=>c._mpName)];
    // host defends first; alternate guests between attack/defend
    mpConns.forEach((c,i)=>{
      if(!c.open||!c._mpName) return;
      const gStart=(i%2===0)?'attacker':'defender';
      c.send({type:'start',mode:'convoy',locId:saveData.locId||'beirut',startSide:gStart,
        role:'interceptor',hostName:mpUser.username,roster});
    });
    mpIsGuest=false;
    if(typeof startConvoyOnlineHost==='function') startConvoyOnlineHost(window._cvPendingRole||'interceptor',roster);
    return;
  }
  if(mpMode==='battle'){
    // Assign teams
    const allNames=[mpUser.username,...mpConns.filter(c=>c._mpName).map(c=>c._mpName)];
    const assigned=_assignTeams(allNames);
    _mpTeams=assigned.teams;
    _aiBotTeam=assigned.aiTeam;
    mpMyTeam=_mpTeams.A.includes(mpUser.username)?'A':'B';

    // Send start to each guest with their team assignment
    mpConns.forEach(c=>{
      if(!c.open||!c._mpName) return;
      const gTeam=_mpTeams.A.includes(c._mpName)?'A':'B';
      c.send({type:'start',mode:'battle',teams:_mpTeams,aiTeam:_aiBotTeam,myTeam:gTeam,hostName:mpUser.username});
    });
    startBattleMode();
  } else {
    // Coop: gather all player info
    const allPlayers=[
      {username:mpUser.username,custo:saveData.customization},
      ...mpConns.filter(c=>c._mpName).map(c=>({username:c._mpName,custo:mpWaitingCustos.get(c._mpName)||_defaultCusto()}))
    ];
    // Send to each guest: all OTHER players (not themselves)
    mpConns.forEach(c=>{
      if(!c.open||!c._mpName) return;
      const others=allPlayers.filter(p=>p.username!==c._mpName);
      c.send({type:'start',mode:'coop',hostName:mpUser.username,locId:loc,players:others});
    });
    mpIsGuest=false;
    startGame(loc,1);
    // Create meshes for all guests
    mpConns.forEach(c=>{
      if(!c._mpName) return;
      const rp=createRemotePlayerMesh(c._mpName);
      mpRemotePlayers.set(c._mpName,rp);
    });
  }
}

function mpRenderWaiting(){
  const list=document.getElementById('waitingPlayerList');
  if(!list) return;
  const rows=[];

  if(mpIsHost){
    rows.push(`<div class="mp-player-row self">${mpUser?.username||'You'} <span class="mp-tag">HOST</span></div>`);
    for(let i=0;i<3;i++){
      const c=mpConns[i];
      if(c?._mpName) rows.push(`<div class="mp-player-row">${c._mpName}</div>`);
      else rows.push(`<div class="mp-player-row empty">Waiting for player ${i+2}…</div>`);
    }
  } else {
    // Build the known player set: host + self + other guests
    const hname=mpConn?._mpName;
    if(hname) rows.push(`<div class="mp-player-row">${hname} <span class="mp-tag">HOST</span></div>`);
    else rows.push(`<div class="mp-player-row" style="color:var(--text2)">Connecting to host…</div>`);
    rows.push(`<div class="mp-player-row self">${mpUser?.username||'You'} <span class="mp-tag">YOU</span></div>`);
    // Other guests from mpWaitingCustos (exclude host and self)
    mpWaitingCustos.forEach((_,name)=>{
      if(name===hname||name===mpUser?.username) return;
      rows.push(`<div class="mp-player-row">${name}</div>`);
    });
    // Empty slots
    const filled=1+(hname?1:0)+(mpWaitingCustos.size-((hname&&mpWaitingCustos.has(hname))?1:0)-((mpWaitingCustos.has(mpUser?.username))?1:0));
    for(let i=filled;i<4;i++) rows.push(`<div class="mp-player-row empty">Waiting…</div>`);
  }

  list.innerHTML=rows.join('');
  const startBtn=document.getElementById('btnStartMp');
  if(startBtn) startBtn.style.display=mpIsHost&&mpConns.length>0?'':'none';
}

// Feed waiting room players into the lobby 3D stage
function _mpUpdateWaitingStage(){
  if(!mpRoom||!mpPeer) return;
  const slots=[{
    uid:'__local__',username:mpUser?.username||'PLAYER',
    custo:saveData.customization,ready:false,
    isHost:mpIsHost,isSelf:true,level:saveData.level||1
  }];
  if(mpIsHost){
    mpConns.forEach(c=>{
      if(!c._mpName) return;
      slots.push({uid:c._mpName,username:c._mpName,
        custo:mpWaitingCustos.get(c._mpName)||_defaultCusto(),
        ready:false,isHost:false,isSelf:false,level:1});
    });
  } else {
    const hname=mpConn?._mpName;
    if(hname) slots.push({uid:hname,username:hname,
      custo:mpWaitingCustos.get(hname)||_defaultCusto(),
      ready:false,isHost:true,isSelf:false,level:1});
    mpWaitingCustos.forEach((custo,name)=>{
      if(name===hname||name===mpUser?.username) return;
      slots.push({uid:name,username:name,custo,ready:false,isHost:false,isSelf:false,level:1});
    });
  }
  _mpOverrideSlots=slots;
  if(typeof updateLobbyScene==='function') updateLobbyScene();
}

// ── Remote player rendering ─────────────────────────────────────
function createRemotePlayerMesh(username, isTeammate){
  // isTeammate: true=green, false=red, undefined/null=cyan (coop)
  const outfitColors={true:'#1A5A1A',false:'#5A1A1A'};
  const outfitColor=outfitColors[isTeammate]||'#1A4A8A';
  const charModel=makeCharModel({
    outfitColor, armorStyle:'light', helmet:true,
    visorColor: isTeammate===true?'#44FF88':isTeammate===false?'#FF4444':'#44DDFF',
    backpack:'missile', skinTone:'#C8955A'
  });
  charModel.scale.set(1,1,1);
  const labelColor=isTeammate===true?'#4AE870':isTeammate===false?'#E84A4A':'#4ADFF0';
  const labelDiv=document.createElement('div');
  labelDiv.style.cssText=`position:fixed;pointer-events:none;font-size:.7em;font-family:Rajdhani,sans-serif;color:${labelColor};font-weight:700;letter-spacing:.08em;text-shadow:0 1px 4px #000;z-index:28;display:none`;
  labelDiv.textContent=username===AI_BOT_NAME?'AI ENEMY':username;
  document.body.appendChild(labelDiv);
  scene.add(charModel);
  const startPos=new THREE.Vector3();
  return {mesh:charModel,pos:startPos.clone(),targetPos:startPos.clone(),yaw:0,targetYaw:0,username,label:labelDiv};
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
  // Killcam recorder: snapshot self + opponent each frame during 1v1
  if(battleActive&&!_kcActive){
    let opp=null;
    mpRemotePlayers.forEach(rp=>{ if(!opp) opp=rp; });
    _kcBuf.push({mx:px,my:py,mz:pz,ox:opp?opp.pos.x:px,oy:opp?opp.pos.y:py,oz:opp?opp.pos.z:pz});
    if(_kcBuf.length>_KC_MAX) _kcBuf.shift();
  }
  mpRemotePlayers.forEach(rp=>{
    rp.pos.lerp(rp.targetPos,alpha);
    let dyaw=rp.targetYaw-rp.yaw;
    if(dyaw>Math.PI) dyaw-=2*Math.PI;
    if(dyaw<-Math.PI) dyaw+=2*Math.PI;
    rp.yaw+=dyaw*alpha;
    rp.mesh.position.set(rp.pos.x,rp.pos.y-PLAYER_H,rp.pos.z);
    rp.mesh.rotation.y=rp.yaw+Math.PI;
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
  const pos={type:'pos',username:mpUser.username,px,py,pz,yaw,
    missiles:mpLocalStats.missiles,soldiers:mpLocalStats.soldiers,
    custo:saveData.customization}; // equipped skin visible to everyone
  if(mpIsHost){
    mpConns.forEach(c=>{ if(c.open) c.send(pos); });
    const gs={
      type:'game_state', locId:selectedLoc,
      waveNum,waveActive, cityIntegrity,score,
      missiles:missiles.filter(m=>!m.isDestroyed).map(m=>({
        id:m._id,x:m.pos.x,y:m.pos.y,z:m.pos.z,
        vx:m.vel.x,vy:m.vel.y,vz:m.vel.z,
        health:m.health,maxHealth:m.maxHealth,isBoss:m.isBoss
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
  // Live skin sync: rebuild the remote mesh when their customization changes
  if(rp&&data.custo){
    const key=JSON.stringify(data.custo);
    if(rp._custoKey!==key){
      rp._custoKey=key;
      try{
        const fresh=makeCharModel(data.custo);
        fresh.position.copy(rp.mesh.position);
        fresh.rotation.y=rp.mesh.rotation.y;
        scene.remove(rp.mesh);
        rp.mesh=fresh;
        scene.add(fresh);
      }catch(e){}
    }
  }
  if(data.username&&data.missiles!==undefined){
    mpRemoteStats[data.username]={missiles:data.missiles,soldiers:data.soldiers||0};
    _updateCoopLb();
  }
}

function mpApplyGameState(data){
  if(!gameActive) return;
  if(data.locId&&data.locId!==selectedLoc){ selectedLoc=data.locId; buildWorld(data.locId); }
  waveNum=data.waveNum; waveActive=data.waveActive;
  if(data.cityIntegrity!==undefined) cityIntegrity=data.cityIntegrity;
  if(data.score!==undefined) score=data.score;
  const hostIds=new Set((data.missiles||[]).map(m=>m.id));
  for(let i=missiles.length-1;i>=0;i--){
    if(!hostIds.has(missiles[i]._id)&&!missiles[i].isDestroyed) destroyMissile(missiles[i],false);
  }
  for(const hm of (data.missiles||[])){
    let m=missiles.find(x=>x._id===hm.id);
    if(!m){ spawnMissile(hm.isBoss); m=missiles[missiles.length-1]; m._id=hm.id; }
    m.pos.set(hm.x,hm.y,hm.z); m.vel.set(hm.vx,hm.vy,hm.vz);
    m.health=hm.health; m.group.position.copy(m.pos);
  }
}

// ═══════════════════════════════════════════════════════════════
//  BATTLE MODE  (up to 4 players, team-based)
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

// ── 1v1 round modifiers — host rolls one per round, sent with the
//    round weapon so both clients apply the same rules ──────────
const BATTLE_MODIFIERS=[
  {id:'none',     name:'STANDARD',        apply:()=>{}},
  {id:'pistols',  name:'PISTOLS ONLY',    weapon:'pistol'},
  {id:'launchers',name:'LAUNCHERS ONLY',  weapon:'launcher'},
  {id:'shotguns', name:'SHOTGUN DUEL',    weapon:'shotgun'},
  {id:'oneshot',  name:'ONE-SHOT RAIL',   weapon:'sniper', apply:()=>{battleHP.local=1;}},
  {id:'lowgrav',  name:'LOW GRAVITY',     apply:()=>{window._battleGrav=0.4;}},
  {id:'speed',    name:'DOUBLE SPEED',    apply:()=>{effectiveSpd=PLAYER_SPD*2;effectiveSprint=SPRINT_SPD*1.6;}},
  {id:'random',   name:'RANDOM LOADOUT',  weapon:null},
];
let _battleModifier=null;
function _applyBattleModifier(modId){
  // reset transient modifier state each round
  window._battleGrav=1;
  const m=BATTLE_MODIFIERS.find(x=>x.id===modId)||BATTLE_MODIFIERS[0];
  _battleModifier=m;
  if(m.apply) m.apply();
  if(m.id!=='none') showNotif('⚔ ROUND MODIFIER: '+m.name);
}

// Assign players to teams, AI bot for odd counts
function _assignTeams(players){
  const shuffled=[...players].sort(()=>Math.random()-.5);
  const odd=shuffled.length%2!==0;
  const aSize=Math.ceil(shuffled.length/2);
  const A=shuffled.slice(0,aSize);
  const B=shuffled.slice(aSize);
  // Odd: team B gets AI bot so both sides equal
  const aiTeam=odd?'B':null;
  return {teams:{A,B},aiTeam};
}

// Spawn position for a player in a team
function _getTeamSpawnPos(team,idxInTeam,teamSize){
  const xBase=team==='A'?-20:20;
  const faceYaw=team==='A'?Math.PI/2:-Math.PI/2;
  const zSpreads=[[0],[-4,4],[-6,0,6],[-8,-3,3,8]];
  const spread=zSpreads[Math.min(teamSize-1,3)];
  const z=spread[Math.min(idxInTeam,spread.length-1)];
  return {x:xBase,z,yaw:faceYaw};
}

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
  _gulagLights.forEach(l=>scene.remove(l));
  _gulagLights=[];
  gulagCollidables=[];
  waveActive=false;
  scene.background=new THREE.Color(0x5AABDD);
  scene.fog=null;
  renderer.setClearColor(0x5AABDD);
  const addL=l=>{ scene.add(l); _gulagLights.push(l); return l; };
  addL(new THREE.AmbientLight(0xFFFFFF,.65));
  const sun=addL(new THREE.DirectionalLight(0xFFEECC,.9)); sun.position.set(8,25,5);
  const blueL=addL(new THREE.PointLight(0x4488FF,.5,60)); blueL.position.set(-30,5,0);
  const redL=addL(new THREE.PointLight(0xFF4422,.5,60)); redL.position.set(30,5,0);
  const add=(geo,color,x,y,z)=>{
    const m=new THREE.Mesh(geo,new THREE.MeshLambertMaterial({color}));
    m.position.set(x,y,z); scene.add(m); worldObjects.push(m); return m;
  };
  const addC=(geo,color,x,y,z)=>{ const m=add(geo,color,x,y,z); gulagCollidables.push(m); return m; };
  add(new THREE.BoxGeometry(80,.3,80),0x2E2A24,0,-.15,0);
  for(let i=-38;i<=38;i+=5) add(new THREE.BoxGeometry(.1,.05,80),0x3A3530,i,.05,0);
  addC(new THREE.BoxGeometry(80,8,.5),0x7A7060,0,4,40.25);
  addC(new THREE.BoxGeometry(80,8,.5),0x7A7060,0,4,-40.25);
  addC(new THREE.BoxGeometry(.5,8,80),0x7A7060,40.25,4,0);
  addC(new THREE.BoxGeometry(.5,8,80),0x7A7060,-40.25,4,0);
  addC(new THREE.BoxGeometry(.4,2.5,20),0x5A4A38,0,1.25,0);
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
  [[-32,3,-32],[-32,3,32],[32,3,-32],[32,3,32],[-32,3,0],[32,3,0],[0,3,-32],[0,3,32]].forEach(([x,y,z])=>
    addC(new THREE.BoxGeometry(1.2,6,1.2),0x4A3A2A,x,y,z));
}

function _updateBattleHud(){
  if(!_battleHudEl) return;
  const myLabel=mpUser?.username||'YOU';
  const lPct=Math.round(battleHP.local/BATTLE_MAX_HP*100);
  const rPct=Math.round(battleHP.remote/BATTLE_MAX_HP*100);

  // Show teams if assigned
  const teamA=_mpTeams?.A||[];
  const teamB=_mpTeams?.B||[];
  const myTeamLabel=mpMyTeam?`TEAM ${mpMyTeam}`:'YOU';
  const oppTeamLabel=mpMyTeam?(mpMyTeam==='A'?'TEAM B':'TEAM A'):'ENEMY';
  const oppName=mpIsHost?(mpConns[0]?._mpName||'ENEMY'):(mpConn?._mpName||'ENEMY');
  const oppDisplay=teamA.length>1||teamB.length>1?oppTeamLabel:oppName;

  _battleHudEl.innerHTML=`
    <div style="display:flex;gap:12px;align-items:center;">
      <div style="text-align:right;min-width:80px">
        <div style="font-size:.7em;color:var(--text2);letter-spacing:.1em">${myLabel}</div>
        <div style="width:150px;height:10px;background:#222;border-radius:3px;overflow:hidden;margin-top:2px">
          <div style="width:${lPct}%;height:100%;background:#4AE870;transition:width .15s"></div></div>
        <div style="font-size:.72em;color:#4AE870">${battleHP.local} HP</div>
      </div>
      <div style="font-size:1em;font-weight:700;color:var(--amber);font-family:'Rajdhani',sans-serif;text-align:center">
        ${battleRounds.local} — ${battleRounds.remote}<br>
        <span style="font-size:.6em;color:var(--text2)">BEST OF 3</span>
      </div>
      <div style="min-width:80px">
        <div style="font-size:.7em;color:var(--text2);letter-spacing:.1em">${oppDisplay}</div>
        <div style="width:150px;height:10px;background:#222;border-radius:3px;overflow:hidden;margin-top:2px">
          <div style="width:${rPct}%;height:100%;background:#E84A4A;transition:width .15s"></div></div>
        <div style="font-size:.72em;color:#E84A4A">${battleHP.remote} HP</div>
      </div>
    </div>`;
}

function startBattleMode(){
  battleActive=true;
  battleHP={local:BATTLE_MAX_HP,remote:BATTLE_MAX_HP};
  _buildGulag();
  selectedLoc='beirut';

  // Position local player based on team assignment
  const myTeam=mpMyTeam||(mpIsHost?'A':'B');
  const myTeamArr=_mpTeams?.[myTeam]||[mpUser?.username||''];
  const myIdx=Math.max(0,myTeamArr.indexOf(mpUser?.username||''));
  const sp=_getTeamSpawnPos(myTeam,myIdx,myTeamArr.length);
  px=sp.x; py=PLAYER_H; pz=sp.z;
  vx=0; vy=0; vz=0;
  yaw=sp.yaw; pitch=0;

  currentWeapon='pistol';
  weaponInventory=new Set(['pistol']);
  weaponAmmo={pistol:60,shotgun:0,smg:0,launcher:0,sniper:0};
  ammo=60; isReloading=false; fireCD=0; scoped=false;
  effectiveSpd=PLAYER_SPD*1.1; effectiveSprint=SPRINT_SPD*1.1; dmgMult=1;
  activeGadgets={flashbang:1,airstrike:0,cover:1};

  // Spawn remote player meshes
  mpRemotePlayers.forEach((_,u)=>removeRemotePlayer(u));
  mpRemotePlayers.clear();

  if(_mpTeams){
    const enemyTeam=myTeam==='A'?'B':'A';
    const friendTeam=myTeam;
    // Friendly teammates (green)
    (_mpTeams[friendTeam]||[]).forEach((name,idx)=>{
      if(name===mpUser?.username) return;
      const rp=createRemotePlayerMesh(name,true);
      const tsp=_getTeamSpawnPos(friendTeam,idx,_mpTeams[friendTeam].length);
      rp.pos.set(tsp.x,PLAYER_H,tsp.z); rp.targetPos.copy(rp.pos);
      mpRemotePlayers.set(name,rp);
    });
    // Enemies (red)
    (_mpTeams[enemyTeam]||[]).forEach((name,idx)=>{
      if(name===AI_BOT_NAME) return;
      const rp=createRemotePlayerMesh(name,false);
      const tsp=_getTeamSpawnPos(enemyTeam,idx,_mpTeams[enemyTeam].length);
      rp.pos.set(tsp.x,PLAYER_H,tsp.z); rp.targetPos.copy(rp.pos);
      mpRemotePlayers.set(name,rp);
    });
    // AI bot mesh (for all players to see)
    if(_aiBotTeam){
      const aiIsTeammate=_aiBotTeam===myTeam;
      const aiArr=_mpTeams[_aiBotTeam]||[];
      const aiRp=createRemotePlayerMesh(AI_BOT_NAME,aiIsTeammate);
      const aiSp=_getTeamSpawnPos(_aiBotTeam,aiArr.length,aiArr.length+1);
      aiRp.pos.set(aiSp.x,PLAYER_H,aiSp.z); aiRp.targetPos.copy(aiRp.pos);
      mpRemotePlayers.set(AI_BOT_NAME,aiRp);
      // Host inits AI logic
      if(mpIsHost) _initAiBot(_aiBotTeam);
    }
  } else {
    // Fallback 1v1
    const oppName=mpIsHost?(mpConns[0]?._mpName||'Enemy'):(mpConn?._mpName||'Enemy');
    const rp=createRemotePlayerMesh(oppName,false);
    rp.pos.set(mpIsHost?20:-20,PLAYER_H,0); rp.targetPos.copy(rp.pos);
    mpRemotePlayers.set(oppName,rp);
  }

  // Host picks initial weapon
  if(mpIsHost){
    setTimeout(()=>{
      const mod=BATTLE_MODIFIERS[Math.floor(Math.random()*BATTLE_MODIFIERS.length)];
      let w=mod.weapon!==undefined?mod.weapon:BATTLE_WEAPONS[Math.floor(Math.random()*BATTLE_WEAPONS.length)];
      if(w===null) w=BATTLE_WEAPONS[Math.floor(Math.random()*BATTLE_WEAPONS.length)];
      _applyBattleModifier(mod.id);
      _applyBattleWeapon(w);
      mpConns.forEach(c=>{ if(c.open) c.send({type:'battle_weapon',weapon:w,modifier:mod.id}); });
    },800);
  }

  if(!_battleHudEl){
    _battleHudEl=document.createElement('div');
    _battleHudEl.style.cssText='position:fixed;top:14px;left:50%;transform:translateX(-50%);z-index:35;pointer-events:none;font-family:"Rajdhani",sans-serif;text-align:center;';
    document.body.appendChild(_battleHudEl);
  }
  _battleHudEl.style.display='block';
  _updateBattleHud();

  ['cyberBulletHud','rajpnFistHud','gadgetHud','coopLeaderboard'].forEach(id=>{
    const el=document.getElementById(id); if(el) el.style.display='none';
  });
  if(weaponMesh) camera.remove(weaponMesh);
  weaponMesh=makeWeaponMesh(); camera.add(weaponMesh);

  gameActive=true; gamePaused=false;
  showScreen('hud');
  document.getElementById('crosshair').style.display='block';
  document.getElementById('weaponBar').style.display='flex';
  document.getElementById('minimap').style.display='none';
  document.getElementById('clickNotice').style.display='flex';
  updateWeaponBar();
  const teamMsg=_mpTeams?`GULAG — Team ${myTeam} vs Team ${myTeam==='A'?'B':'A'}! Best of 3!`:'GULAG — 1v1! Best of 3 rounds!';
  showNotif(teamMsg);
}

// ── AI Bot (runs on host only) ──────────────────────────────────
function _initAiBot(team){
  const arr=_mpTeams?.[team]||[];
  const sp=_getTeamSpawnPos(team,arr.length,arr.length+1);
  _aiBot={pos:new THREE.Vector3(sp.x,PLAYER_H,sp.z),team,hp:BATTLE_MAX_HP,shootTimer:0};
}

function _updateAiBot(dt){
  if(!_aiBot||!battleActive||!mpIsHost) return;
  _aiBot.shootTimer-=dt;

  // Find nearest enemy
  let nearestDist=Infinity,nearestName=null;
  const myAiTeam=_aiBot.team;

  // Check local player (host) if enemy
  if(_mpTeams&&!_mpTeams[myAiTeam].includes(mpUser?.username||'')){
    const d=Math.sqrt((px-_aiBot.pos.x)**2+(pz-_aiBot.pos.z)**2);
    if(d<nearestDist){ nearestDist=d; nearestName='__LOCAL__'; }
  }
  mpRemotePlayers.forEach((rp,name)=>{
    if(name===AI_BOT_NAME) return;
    if(_mpTeams&&_mpTeams[myAiTeam].includes(name)) return; // skip teammates
    const d=Math.sqrt((rp.pos.x-_aiBot.pos.x)**2+(rp.pos.z-_aiBot.pos.z)**2);
    if(d<nearestDist){ nearestDist=d; nearestName=name; }
  });

  if(nearestName){
    let tx,tz;
    if(nearestName==='__LOCAL__'){ tx=px; tz=pz; }
    else { const rp=mpRemotePlayers.get(nearestName); tx=rp?.pos.x||0; tz=rp?.pos.z||0; }
    const dx=tx-_aiBot.pos.x, dz=tz-_aiBot.pos.z;
    const d=Math.sqrt(dx*dx+dz*dz);
    if(d>6){ _aiBot.pos.x+=(dx/d)*5.5*dt; _aiBot.pos.z+=(dz/d)*5.5*dt; }
    if(d<18&&_aiBot.shootTimer<=0){
      _aiBot.shootTimer=1.4+(Math.random()*.6);
      const dmg=18+Math.floor(Math.random()*10);
      if(nearestName==='__LOCAL__'){
        battleHP.local=Math.max(0,battleHP.local-dmg);
        showDamageFlash(); _updateBattleHud();
        if(battleHP.local<=0) _battleRoundEnd(false);
      } else {
        const msg={type:'battle_hit',dmg,target:nearestName};
        mpConns.forEach(c=>{ if(c.open) c.send(msg); });
      }
    }
  }

  // Broadcast AI position so guests see it move
  const aiMsg={type:'pos',username:AI_BOT_NAME,px:_aiBot.pos.x,py:_aiBot.pos.y,pz:_aiBot.pos.z,yaw:0};
  mpConns.forEach(c=>{ if(c.open) c.send(aiMsg); });
  const aiRp=mpRemotePlayers.get(AI_BOT_NAME);
  if(aiRp){ aiRp.targetPos.copy(_aiBot.pos); }
}

function mpBattleSendHit(dmg, targetUsername){
  // targetUsername optional — undefined falls back to 1v1 opponent
  const resolvedTarget=targetUsername||(mpIsHost?(mpConns[0]?._mpName):(mpConn?._mpName));
  const msg={type:'battle_hit',dmg,target:resolvedTarget};
  if(mpIsHost){ mpConns.forEach(c=>{ if(c.open) c.send(msg); }); }
  else if(mpConn?.open){ mpConn.send(msg); }
  battleHP.remote=Math.max(0,battleHP.remote-dmg);
  _updateBattleHud();
  if(battleHP.remote<=0) _battleRoundEnd(true);
}

function _battleRoundEnd(won){
  if(won) battleRounds.local++; else battleRounds.remote++;
  if(won){
    if(typeof achInc==='function') achInc('mpKills');
    if(typeof _mpChallProgress==='function'){ _mpChallProgress('duelWins',1); _mpChallProgress('battleKills',1); }
    if(typeof addMpXp==='function') addMpXp(40);
  }
  if(battleRounds.local>=2||battleRounds.remote>=2){
    // Killcam plays first — victory/rematch screen comes after it
    _showKillcam(won,()=>endBattleMode(battleRounds.local>=2));
  } else {
    showNotif(won?'ROUND WIN!':'ROUND LOST!');
    _showKillcam(won,()=>{
      battleHP={local:BATTLE_MAX_HP,remote:BATTLE_MAX_HP};
      // Reposition
      const myTeam=mpMyTeam||(mpIsHost?'A':'B');
      const myTeamArr=_mpTeams?.[myTeam]||[mpUser?.username||''];
      const myIdx=Math.max(0,myTeamArr.indexOf(mpUser?.username||''));
      const sp=_getTeamSpawnPos(myTeam,myIdx,myTeamArr.length);
      px=sp.x; py=PLAYER_H; pz=sp.z;
      vx=0;vy=0;vz=0;
      yaw=sp.yaw; scoped=false; scopeT=0;
      _updateBattleHud();
      if(mpIsHost){
        // Reinit AI bot
        if(_aiBotTeam) _initAiBot(_aiBotTeam);
        const mod=BATTLE_MODIFIERS[Math.floor(Math.random()*BATTLE_MODIFIERS.length)];
        let w=mod.weapon!==undefined?mod.weapon:BATTLE_WEAPONS[Math.floor(Math.random()*BATTLE_WEAPONS.length)];
        if(w===null) w=BATTLE_WEAPONS[Math.floor(Math.random()*BATTLE_WEAPONS.length)];
        _applyBattleModifier(mod.id);
        _applyBattleWeapon(w);
        mpConns.forEach(c=>{ if(c.open) c.send({type:'battle_weapon',weapon:w,modifier:mod.id}); });
      }
    });
  }
}

// ═══════════════════════════════════════════════════════════════
//  1v1 KILLCAM — ghost replay from recorded snapshots
//  Records ~12s of self+opponent positions during battle; on round
//  end the camera replays the kill from the killer's perspective
//  while a calling-card panel and countdown overlay the screen.
// ═══════════════════════════════════════════════════════════════
let _kcActive=false,_kcBuf=[],_kcT=0,_kcDone=null,_kcKiller='o';
let _kcVotes=new Set(),_kcWeapon=null,_kcTracers=[],_kcNextTracer=0,_kcFlash=null;
const _KC_MAX=720;  // ~12s of footage at 60fps
const _KC_DUR=8;    // seconds on screen (replays last ~10s, slow-mo tail)

function _kcPlayerCount(){
  if(mpIsHost) return 1+mpConns.filter(c=>c.open).length;
  let n=1;
  mpRemotePlayers.forEach((rp,name)=>{ if(name!==AI_BOT_NAME) n++; });
  return Math.max(2,n);
}
function _kcVoteSkip(){
  if(!_kcActive) return;
  const u=mpUser?.username||'me';
  if(_kcVotes.has(u)) return;
  _kcVotes.add(u);
  const msg={type:'kc_skip',username:u};
  if(mpIsHost) mpConns.forEach(c=>{ if(c.open) c.send(msg); });
  else if(mpConn?.open) mpConn.send(msg);
  _kcCheckVotes();
}
function _kcCheckVotes(){
  const need=Math.floor(_kcPlayerCount()/2)+1; // majority; 1v1 ⇒ both
  const el=document.getElementById('kcSkip');
  if(el) el.textContent=`SKIP VOTE ${_kcVotes.size}/${need}`;
  if(_kcVotes.size>=need) _endKillcam();
}

function _showKillcam(won,next){
  if(_kcBuf.length<30){setTimeout(next,1500);return;} // not enough data — simple delay
  const oppName=mpIsHost?(mpConns[0]?._mpName||'ENEMY'):(mpConn?._mpName||'ENEMY');
  const killerName=won?(mpUser?.username||'YOU'):oppName;
  let ov=document.getElementById('killcamOverlay');
  if(!ov){
    ov=document.createElement('div');
    ov.id='killcamOverlay';
    document.body.appendChild(ov);
  }
  const cardHtml=won&&typeof renderMyCallingCard==='function'
    ?renderMyCallingCard('ROUND WINNER')
    :typeof renderCallingCard==='function'
      ?renderCallingCard({username:killerName,level:'?',sub:'ROUND WINNER'})
      :`<div class="kc-name-fallback">${killerName}</div>`;
  const wep=WEAPONS[currentWeapon]||{};
  const victimName=won?oppName:(mpUser?.username||'YOU');
  ov.innerHTML=`
    <div class="kc-label">KILLCAM</div>
    <div class="kc-sub">${won?'YOUR ELIMINATION':'ELIMINATED BY '+killerName}</div>
    <button id="kcSkip" class="kc-skip" onclick="_kcVoteSkip()">SKIP VOTE 0/${Math.floor(_kcPlayerCount()/2)+1}</button>
    <div class="kc-versus"><span class="kc-vs-k">${killerName}</span> ▶ <span class="kc-vs-v">${victimName}</span></div>
    <div class="kc-bottom">
      <div class="kc-card">${cardHtml}</div>
      <div class="kc-right">
        <div class="kc-weapon">${wep.icon||'🔫'} ${wep.name||currentWeapon.toUpperCase()}</div>
        <div class="kc-score">ROUND SCORE &nbsp;${battleRounds.local} — ${battleRounds.remote}</div>
        <div class="kc-count" id="kcCount">NEXT ROUND IN ${_KC_DUR}</div>
      </div>
    </div>`;
  ov.style.display='flex';
  if(typeof sfxKillcam==='function') sfxKillcam();
  if(document.pointerLockElement){_suppressPauseLock=true;document.exitPointerLock();}
  const ch=document.getElementById('crosshair'); if(ch) ch.style.display='none';
  if(typeof weaponMesh!=='undefined'&&weaponMesh) weaponMesh.visible=false;
  // First-person killer POV: round weapon mounted on the camera
  try{
    if(_kcWeapon) camera.remove(_kcWeapon);
    _kcWeapon=makeWeaponMesh();
    camera.add(_kcWeapon);
  }catch(e){_kcWeapon=null;}
  _kcTracers=[];_kcNextTracer=0;
  _kcKiller=won?'m':'o';
  _kcVotes=new Set();
  _kcT=0;_kcDone=next;_kcActive=true;
  let n=_KC_DUR;
  const iv=setInterval(()=>{
    if(!_kcActive){clearInterval(iv);return;}
    n--;
    const el=document.getElementById('kcCount');
    if(el) el.textContent=n>0?('NEXT ROUND IN '+n):'GO!';
    if(n<=0){clearInterval(iv);_endKillcam();}
  },1000);
}

function _endKillcam(){
  if(!_kcActive) return;
  _kcActive=false;
  const ov=document.getElementById('killcamOverlay');
  if(ov) ov.style.display='none';
  const ch=document.getElementById('crosshair'); if(ch&&gameActive) ch.style.display='block';
  if(typeof weaponMesh!=='undefined'&&weaponMesh) weaponMesh.visible=true;
  if(_kcWeapon){try{camera.remove(_kcWeapon);}catch(e){}_kcWeapon=null;}
  _kcTracers.forEach(t=>{try{scene.remove(t.m);}catch(e){}});_kcTracers=[];
  if(_kcFlash){try{scene.remove(_kcFlash);}catch(e){}_kcFlash=null;}
  _kcBuf=[];
  const fn=_kcDone;_kcDone=null;
  if(fn) fn();
}

// Called from the main game loop while the killcam is active
function updateKillcam(dt){
  if(!_kcBuf.length) return;
  _kcT+=dt;
  // Replay the last ~10s of footage over the countdown.
  // Time remap: 88% of footage in the first 70% of screen time, the
  // final 12% stretched over the last 30% — dramatic slow-mo ending.
  const span=Math.min(_kcBuf.length-1,600);
  const start=_kcBuf.length-1-span;
  const p=Math.min(1,_kcT/_KC_DUR);
  const u=p<0.7?(p/0.7)*0.88:0.88+((p-0.7)/0.3)*0.12;
  const idx=Math.min(_kcBuf.length-1,start+Math.floor(u*span));
  const s=_kcBuf[idx];
  const killer=_kcKiller==='m'?[s.mx,s.my,s.mz]:[s.ox,s.oy,s.oz];
  const victim=_kcKiller==='m'?[s.ox,s.oy,s.oz]:[s.mx,s.my,s.mz];
  camera.position.set(killer[0],killer[1]+0.45,killer[2]);
  camera.lookAt(victim[0],victim[1]+0.4,victim[2]);

  // Final-second firefight: tracers from the killer's muzzle into the
  // victim, with muzzle flash light — you SEE the shots that landed
  if(p>0.62&&p<0.97){
    _kcNextTracer-=dt;
    if(_kcNextTracer<=0){
      _kcNextTracer=0.16;
      const tm=new THREE.Mesh(new THREE.SphereGeometry(.09,6,6),
        new THREE.MeshBasicMaterial({color:0xFFD060}));
      tm.position.set(killer[0],killer[1]+0.35,killer[2]);
      scene.add(tm);
      _kcTracers.push({m:tm,t:0,fx:killer[0],fy:killer[1]+0.35,fz:killer[2],
        tx:victim[0],ty:victim[1]+0.35,tz:victim[2]});
      if(!_kcFlash){
        _kcFlash=new THREE.PointLight(0xFFC860,0,8);
        scene.add(_kcFlash);
      }
      _kcFlash.position.set(killer[0],killer[1]+0.3,killer[2]);
      _kcFlash.intensity=2.4;
      if(typeof sfxSmgFire==='function') sfxSmgFire();
    }
  }
  if(_kcFlash&&_kcFlash.intensity>0) _kcFlash.intensity=Math.max(0,_kcFlash.intensity-dt*14);
  for(let i=_kcTracers.length-1;i>=0;i--){
    const t=_kcTracers[i];
    t.t+=dt*5;
    if(t.t>=1){
      // impact spark at the victim
      if(typeof spawnExplosion==='function'&&Math.random()>.5)
        spawnExplosion(new THREE.Vector3(t.tx,t.ty,t.tz),.4,0xFF8040);
      scene.remove(t.m);_kcTracers.splice(i,1);
    } else {
      t.m.position.set(t.fx+(t.tx-t.fx)*t.t,t.fy+(t.ty-t.fy)*t.t,t.fz+(t.tz-t.fz)*t.t);
    }
  }
}

function endBattleMode(won){
  battleActive=false; gameActive=false;
  _rematchVoted=false; _aiBot=null;
  if(_battleHudEl) _battleHudEl.style.display='none';
  if(document.pointerLockElement) document.exitPointerLock();
  isLocked=false;
  ['cyberBulletHud','rajpnFistHud','gadgetHud','coopLeaderboard','healthBars'].forEach(id=>{
    const el=document.getElementById(id); if(el) el.style.display='none';
  });
  document.getElementById('crosshair').style.display='none';
  document.getElementById('weaponBar').style.display='none';

  const reward=won?(500+battleRounds.local*100):0;
  if(won){
    if(typeof achInc==='function') achInc('mpMatchWins');
    saveData.currency+=reward; saveSave();
  }
  if(typeof addMpXp==='function') addMpXp(won?180:80);

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
    if(_rematchVoted){ return; }
    _rematchVoted=true;
    const statusEl=document.getElementById('beRematchStatus');
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
    // Context-aware back: pause menu only while actually paused mid-game,
    // otherwise return to the lobby tabs
    if(typeof gameActive!=='undefined'&&gameActive&&typeof gamePaused!=='undefined'&&gamePaused){
      showScreen('pauseMenu');
    } else {
      showScreen('mainMenu');
      if(typeof renderLobby==='function') renderLobby();
    }
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
          if(data?.saveData){
            const fbSd=_normalizeInventory(Object.assign(defaultSave(),data.saveData));
            // Merge with localStorage — localStorage is written synchronously so it's always >= Firebase freshness
            try{
              const lsRaw=localStorage.getItem(SAVE_KEY);
              if(lsRaw){
                const lsSd=JSON.parse(lsRaw);
                // Union-merge owned arrays (items only ever grow)
                if(Array.isArray(lsSd.ownedSkins))
                  fbSd.ownedSkins=[...new Set([...(fbSd.ownedSkins||[]),...lsSd.ownedSkins])];
                if(lsSd.ownedWeaponCamos) ALL_WEAPON_IDS.forEach(w=>{
                  fbSd.ownedWeaponCamos[w]=[...new Set([...(fbSd.ownedWeaponCamos[w]||[]),...(lsSd.ownedWeaponCamos[w]||[])])];
                });
                if(Array.isArray(lsSd.unlocks)) fbSd.unlocks=[...new Set([...(fbSd.unlocks||[]),...lsSd.unlocks])];
                // Prefer local for equipped state (localStorage always written before Firebase)
                if(typeof lsSd.currency==='number') fbSd.currency=Math.max(fbSd.currency||0,lsSd.currency);
                if(lsSd.equippedSkin) fbSd.equippedSkin=lsSd.equippedSkin;
                if(lsSd.equippedWeaponCamos) ALL_WEAPON_IDS.forEach(w=>{
                  if(lsSd.equippedWeaponCamos[w]) fbSd.equippedWeaponCamos[w]=lsSd.equippedWeaponCamos[w];
                });
                if(Array.isArray(lsSd.equippedWeapons)&&lsSd.equippedWeapons.length)
                  fbSd.equippedWeapons=lsSd.equippedWeapons;
                if((lsSd.bpXP||0)>(fbSd.bpXP||0)) fbSd.bpXP=lsSd.bpXP;
                if((lsSd.bpLevel||0)>(fbSd.bpLevel||0)) fbSd.bpLevel=lsSd.bpLevel;
                if(Array.isArray(lsSd.bpClaimedTiers)&&(lsSd.bpClaimedTiers.length||0)>(fbSd.bpClaimedTiers.length||0))
                  fbSd.bpClaimedTiers=lsSd.bpClaimedTiers;
                if(Array.isArray(lsSd.bpClaimedTiersP)&&(lsSd.bpClaimedTiersP.length||0)>((fbSd.bpClaimedTiersP||[]).length||0))
                  fbSd.bpClaimedTiersP=lsSd.bpClaimedTiersP;
                if(lsSd.bpPremium===true) fbSd.bpPremium=true;
              }
            }catch(e){}
            saveData=_normalizeInventory(fbSd);
          }
          try{ localStorage.setItem(SAVE_KEY,JSON.stringify(saveData)); }catch(e){}
          if(typeof _startSaveListener==='function') _startSaveListener(user.uid);
          if(typeof _enforceCodes==='function') setTimeout(_enforceCodes,400);
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
