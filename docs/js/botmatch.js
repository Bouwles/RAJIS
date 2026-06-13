'use strict';
// ═══════════════════════════════════════════════════════════════
//  BOT ARENA — practice deathmatch vs AI in the gulag arena.
//  Self-contained (own loop + entities), never sets battleActive,
//  so it can't touch real multiplayer/networking. Gives a little MP
//  XP on win but NO challenge/achievement progress.
//  Bots are DECENT: range management, strafe-dodge, cover use,
//  line-of-sight gating, retreat-when-low, weapon-aware fire.
// ═══════════════════════════════════════════════════════════════

let botMatchActive=false;
let _bmBots=[];
let _bmPlayerHp=200, _bmPlayerMax=200;
let _bmRound=1, _bmWins={you:0,bots:0};
let _bmEnded=false, _bmRoundOver=false, _bmRespawnT=0;
let _bmHud=null;

const BM_WEAPONS={
  pistol :{range:13, cd:.50, dmg:13, hit:.60, color:'#FFCC44'},
  smg    :{range:11, cd:.13, dmg:9,  hit:.55, color:'#FFFF44'},
  shotgun:{range:6,  cd:1.0, dmg:32, hit:.70, color:'#FF5522'},
  sniper :{range:21, cd:1.6, dmg:46, hit:.55, color:'#88FFCC'},
};
const BM_WLIST=['pistol','smg','shotgun','sniper'];

function startBotMatch(){
  if(typeof convoyActive!=='undefined') convoyActive=false;
  if(typeof _buildGulag==='function') _buildGulag();
  selectedLoc='beirut';
  _bmRound=1; _bmWins={you:0,bots:0}; _bmEnded=false; _bmRoundOver=false;
  botMatchActive=true; battleActive=false;
  gameActive=true; gamePaused=false;
  _bmStartRound();
  // player loadout: real equipped weapons
  const equip=(saveData.equippedWeapons&&saveData.equippedWeapons.length>=2)?saveData.equippedWeapons:['pistol','launcher'];
  weaponInventory=new Set(equip); currentWeapon=equip[0];
  weaponAmmo={}; Object.keys(WEAPONS).forEach(k=>weaponAmmo[k]=WEAPONS[k].maxAmmo);
  ammo=WEAPONS[currentWeapon].maxAmmo; isReloading=false; fireCD=0; scoped=false;
  effectiveSpd=PLAYER_SPD*1.1; effectiveSprint=SPRINT_SPD*1.1; dmgMult=1;
  if(weaponMesh) camera.remove(weaponMesh);
  weaponMesh=makeWeaponMesh(); camera.add(weaponMesh);
  _bmBuildHud();
  showScreen('hud');
  document.getElementById('crosshair').style.display='block';
  document.getElementById('weaponBar').style.display='flex';
  const cn=document.getElementById('clickNotice'); if(cn) cn.style.display='flex';
  document.getElementById('minimap').style.display='none';
  ['cyberBulletHud','rajpnFistHud','gadgetHud','coopLeaderboard'].forEach(id=>{const e=document.getElementById(id);if(e)e.style.display='none';});
  if(typeof updateWeaponBar==='function') updateWeaponBar();
  showNotif('BOT ARENA — eliminate the squad! Best of 3.');
  if(typeof sfxAlert==='function') sfxAlert();
}

function _bmStartRound(){
  _bmRoundOver=false; _bmRespawnT=0;
  _bmPlayerHp=_bmPlayerMax;
  // player spawn
  px=-22; py=PLAYER_H; pz=0; vx=vy=vz=0; yaw=Math.PI/2; pitch=0;
  isReloading=false; fireCD=0;
  // clear old bots
  _bmBots.forEach(b=>{if(b.group)scene.remove(b.group);if(b.bar)b.bar.remove();});
  _bmBots=[];
  const count=2+Math.min(_bmRound,2);   // round1:3 .. up to 4
  for(let i=0;i<count;i++) _bmSpawnBot(i,count);
  showNotif('ROUND '+_bmRound+' — '+count+' BOTS');
}

function _bmSpawnBot(i,total){
  const ang=(i/total)*Math.PI*1.2 - Math.PI*.6;
  const pos=new THREE.Vector3(20+Math.cos(ang)*4,0,Math.sin(ang)*14);
  let g;
  try{ g=makeCharModel({outfitColor:'#5A1A1A',visorColor:'#FF4444',skinTone:'#C8955A',
    armorStyle:i%3===0?'heavy':'light',helmet:true,backpack:'missile'}); }
  catch(e){ g=new THREE.Group(); const m=new THREE.Mesh(new THREE.BoxGeometry(.6,1.7,.4),new THREE.MeshLambertMaterial({color:0x5A1A1A})); m.position.y=.85; g.add(m); }
  g.position.copy(pos); scene.add(g);
  const wpn=BM_WLIST[Math.floor(Math.random()*BM_WLIST.length)];
  const bar=document.createElement('div'); bar.className='bm-bot-bar';
  bar.innerHTML='<div class="bm-bot-fill" style="width:100%"></div>';
  const hb=document.getElementById('healthBars'); if(hb) hb.appendChild(bar);
  _bmBots.push({group:g,pos,hp:120,maxHp:120,weapon:wpn,
    state:'engage',strafeDir:Math.random()<.5?1:-1,strafeT:.4+Math.random()*.8,
    shootTimer:.4+Math.random()*.4,acquireT:.3,jumpVy:0,y:0,
    bar,fill:bar.querySelector('.bm-bot-fill'),dead:false,coverPt:null});
}

// ── Line of sight (cover blocks shots) ──────────────────────────
function _bmBlocked(ax,az,bx,bz){
  const cols=(typeof gulagCollidables!=='undefined')?gulagCollidables:[];
  if(!cols.length) return false;
  for(let t=0.2;t<=0.85;t+=0.18){
    const x=ax+(bx-ax)*t, z=az+(bz-az)*t;
    for(const c of cols){
      const cw=(c.geometry?.parameters?.width||1)/2+.3;
      const cd=(c.geometry?.parameters?.depth||1)/2+.3;
      const ch=(c.geometry?.parameters?.height||1);
      if(ch<1.2) continue; // low cover doesn't block standing shots much
      if(Math.abs(x-c.position.x)<cw&&Math.abs(z-c.position.z)<cd) return true;
    }
  }
  return false;
}
function _bmNearestCover(bx,bz,awayX,awayZ){
  const cols=(typeof gulagCollidables!=='undefined')?gulagCollidables:[];
  let best=null,bd=1e9;
  for(const c of cols){
    const ch=(c.geometry?.parameters?.height||1); if(ch<1.2) continue;
    // pick a point on the far side of the block relative to the player
    const px2=c.position.x+(c.position.x-awayX>0?1.4:-1.4);
    const pz2=c.position.z+(c.position.z-awayZ>0?1.4:-1.4);
    const d=(bx-c.position.x)**2+(bz-c.position.z)**2;
    if(d<bd){bd=d;best={x:px2,z:pz2};}
  }
  return best;
}

// ── Update (from gameLoop) ──────────────────────────────────────
function updateBotMatch(dt){
  if(!botMatchActive||_bmEnded) return;
  if(_bmRoundOver){
    _bmRespawnT-=dt;
    if(_bmRespawnT<=0){
      if(_bmWins.you>=2||_bmWins.bots>=2){ _bmEnd(_bmWins.you>=2); return; }
      _bmRound++; _bmStartRound();
    }
    return;
  }
  const pPos=new THREE.Vector3(px,0,pz);
  let alive=0;
  for(const b of _bmBots){
    if(b.dead) continue; alive++;
    _bmUpdateBot(b,dt,pPos);
    if(b.fill) b.fill.style.width=Math.max(0,Math.round(b.hp/b.maxHp*100))+'%';
    _bmBar(b);
  }
  // player projectile hits on bots
  _bmCheckHits();
  // round resolution
  if(alive===0){ _bmWins.you++; _bmRoundOver=true; _bmRespawnT=2.6;
    showNotif('ROUND WON! '+_bmWins.you+' — '+_bmWins.bots);
    if(typeof sfxWaveComplete==='function') sfxWaveComplete(); }
  else if(_bmPlayerHp<=0){ _bmWins.bots++; _bmRoundOver=true; _bmRespawnT=2.6;
    showNotif('ROUND LOST! '+_bmWins.you+' — '+_bmWins.bots);
    if(typeof showDamageFlash==='function') showDamageFlash(); }
  _bmUpdateHud(alive);
}

function _bmUpdateBot(b,dt,pPos){
  const W=BM_WEAPONS[b.weapon];
  const dx=px-b.pos.x, dz=pz-b.pos.z;
  const dist=Math.hypot(dx,dz)||1;
  const nx=dx/dist, nz=dz/dist;
  b.acquireT-=dt; b.strafeT-=dt; b.shootTimer-=dt;
  const los=!_bmBlocked(b.pos.x,b.pos.z,px,pz);

  // decide state
  if(b.hp<b.maxHp*.35&&b.state!=='retreat'&&Math.random()<.5){ b.state='retreat'; b.coverPt=_bmNearestCover(b.pos.x,b.pos.z,px,pz); }
  if(b.state==='retreat'&&b.hp>b.maxHp*.55) b.state='engage';

  let mvx=0,mvz=0;
  if(b.state==='retreat'&&b.coverPt){
    const cdx=b.coverPt.x-b.pos.x, cdz=b.coverPt.z-b.pos.z, cd=Math.hypot(cdx,cdz)||1;
    mvx=cdx/cd; mvz=cdz/cd;
    if(cd<1.5){ b.state='peek'; b.strafeT=1.0; }
  } else {
    // range management: push to optimal range, strafe perpendicular
    const want=W.range;
    if(dist>want+2){ mvx+=nx; mvz+=nz; }          // close in
    else if(dist<want-2){ mvx-=nx; mvz-=nz; }     // back off
    // strafe (perpendicular) — flip direction periodically to dodge
    if(b.strafeT<=0){ b.strafeDir*=(Math.random()<.7?-1:1); b.strafeT=.5+Math.random()*.8; }
    mvx+=(-nz)*b.strafeDir*.9; mvz+=(nx)*b.strafeDir*.9;
  }
  // normalize + move (decent speed, heavies slower)
  const ml=Math.hypot(mvx,mvz)||1;
  const spd=(b.weapon==='shotgun'?5.2:4.6)*dt;
  let nxp=b.pos.x+mvx/ml*spd, nzp=b.pos.z+mvz/ml*spd;
  // keep inside arena, bounce strafe off walls
  if(Math.abs(nxp)>38){ nxp=Math.sign(nxp)*38; b.strafeDir*=-1; }
  if(Math.abs(nzp)>38){ nzp=Math.sign(nzp)*38; b.strafeDir*=-1; }
  // avoid stacking into cover blocks
  if(!_bmInsideCover(nxp,nzp)){ b.pos.x=nxp; b.pos.z=nzp; }
  else { b.strafeDir*=-1; }
  // hop occasionally to dodge
  b.jumpVy-=24*dt; b.y=Math.max(0,b.y+b.jumpVy*dt);
  if(b.y<=0&&b.state==='engage'&&Math.random()<.012){ b.jumpVy=7; }
  b.group.position.set(b.pos.x,b.y,b.pos.z);
  b.group.rotation.y=Math.atan2(dx,dz);

  // shoot — only facing+range+LOS, after a short reaction delay
  if(b.acquireT<=0&&b.shootTimer<=0&&los&&dist<W.range+5){
    b.shootTimer=W.cd*(.85+Math.random()*.4);
    let hit=Math.random()<W.hit;
    if(b.weapon==='shotgun') hit=hit&&dist<10;          // shotgun useless far
    if(b.weapon==='sniper'&&dist<6) hit=hit&&Math.random()<.5; // bad up close
    // muzzle tracer toward player
    _bmTracer(b.pos.x,b.y+1.2,b.pos.z,px,py-0.4,pz,W.color);
    if(hit){
      _bmHurtPlayer(W.dmg+Math.floor(Math.random()*6));
    }
    if(typeof sfxSoldierFire==='function') sfxSoldierFire();
  }
}

function _bmInsideCover(x,z){
  const cols=(typeof gulagCollidables!=='undefined')?gulagCollidables:[];
  for(const c of cols){
    const cw=(c.geometry?.parameters?.width||1)/2+.4;
    const cd=(c.geometry?.parameters?.depth||1)/2+.4;
    if(Math.abs(x-c.position.x)<cw&&Math.abs(z-c.position.z)<cd) return true;
  }
  return false;
}
function _bmHurtPlayer(dmg){
  _bmPlayerHp=Math.max(0,_bmPlayerHp-dmg);
  if(typeof showDamageFlash==='function') showDamageFlash();
}

// ── Player projectiles damage bots ──────────────────────────────
function _bmCheckHits(){
  if(typeof projectiles==='undefined') return;
  for(let i=projectiles.length-1;i>=0;i--){
    const p=projectiles[i]; if(!p.pos) continue;
    for(const b of _bmBots){ if(b.dead) continue;
      const bp=new THREE.Vector3(b.pos.x,b.y+1,b.pos.z);
      if(p.pos.distanceTo(bp)<1.4){
        b.hp-=Math.max(8,Math.round((p.dmg||20)*dmgMult));
        spawnExplosion(p.pos.clone(),.5,0xFF6040);
        if(b.hp<=0){ _bmKillBot(b); }
        if(p.mesh) scene.remove(p.mesh);
        if(p.trailLine) scene.remove(p.trailLine);
        projectiles.splice(i,1); break;
      }
    }
  }
}
function _bmKillBot(b){
  if(b.dead) return; b.dead=true;
  spawnExplosion(b.pos.clone(),1.0,0xFF6040);
  if(b.group) scene.remove(b.group);
  if(b.bar) b.bar.remove();
  showNotif('BOT DOWN');
}
function _bmTracer(ax,ay,az,bx,by,bz,col){
  try{
    const m=new THREE.Mesh(new THREE.SphereGeometry(.08,5,5),new THREE.MeshBasicMaterial({color:col}));
    m.position.set(ax,ay,az); scene.add(m);
    let t=0; const dur=.18;
    const iv=setInterval(()=>{ t+=.016/dur; if(t>=1){clearInterval(iv);scene.remove(m);return;}
      m.position.set(ax+(bx-ax)*t,ay+(by-ay)*t,az+(bz-az)*t); },16);
  }catch(e){}
}
function _bmBar(b){
  if(!b.bar||typeof camera==='undefined') return;
  const v=new THREE.Vector3(b.pos.x,b.y+2.0,b.pos.z).project(camera);
  if(v.z>1){b.bar.style.display='none';return;}
  b.bar.style.display='block';
  b.bar.style.left=((v.x*.5+.5)*window.innerWidth)+'px';
  b.bar.style.top=((-v.y*.5+.5)*window.innerHeight)+'px';
}

// ── HUD ─────────────────────────────────────────────────────────
function _bmBuildHud(){
  if(!_bmHud){ _bmHud=document.createElement('div'); _bmHud.id='botMatchHud'; document.body.appendChild(_bmHud); }
  _bmHud.style.display='block';
  _bmHud.innerHTML=`<div class="bm-top">
    <span class="bm-side bm-you">YOU</span>
    <div class="bm-mid"><div class="bm-score" id="bmScore">0 — 0</div><div class="bm-rd" id="bmRd">ROUND 1 · BEST OF 3</div></div>
    <span class="bm-side bm-bots">BOTS</span></div>
    <div class="bm-hpwrap"><span>HP</span><div class="bm-hpbar"><div id="bmHpFill" class="bm-hpfill"></div></div><span id="bmAlive">3 LEFT</span></div>`;
}
function _bmUpdateHud(alive){
  const sc=document.getElementById('bmScore'); if(sc) sc.textContent=_bmWins.you+' — '+_bmWins.bots;
  const rd=document.getElementById('bmRd'); if(rd) rd.textContent='ROUND '+_bmRound+' · BEST OF 3';
  const hp=document.getElementById('bmHpFill'); if(hp) hp.style.width=Math.max(0,_bmPlayerHp/_bmPlayerMax*100)+'%';
  const al=document.getElementById('bmAlive'); if(al) al.textContent=alive+' LEFT';
}

// ── End ─────────────────────────────────────────────────────────
function _bmEnd(won){
  if(_bmEnded) return; _bmEnded=true; botMatchActive=false; gameActive=false;
  if(document.pointerLockElement) document.exitPointerLock(); isLocked=false;
  _bmBots.forEach(b=>{if(b.group)scene.remove(b.group);if(b.bar)b.bar.remove();}); _bmBots=[];
  if(_bmHud) _bmHud.style.display='none';
  document.getElementById('crosshair').style.display='none';
  document.getElementById('weaponBar').style.display='none';
  // practice XP only — NO challenge/achievement progress
  const xp=won?90:40;
  if(typeof addMpXp==='function') addMpXp(xp);
  saveSave();
  let s=document.getElementById('botMatchEndScreen');
  if(!s){ s=document.createElement('div'); s.id='botMatchEndScreen'; s.className='screen'; document.body.appendChild(s); }
  s.innerHTML=`<div class="bm-end-inner">
    <div class="bm-end-title" style="color:${won?'#4AE870':'#E84A4A'}">${won?'YOU WIN':'YOU LOSE'}</div>
    <div class="bm-end-sub">BOT ARENA · ${_bmWins.you} — ${_bmWins.bots}</div>
    <div class="bm-end-note">Practice match — no challenge or achievement progress</div>
    <div class="bm-end-rewards">+${xp} MP XP</div>
    <div style="display:flex;gap:10px;justify-content:center;margin-top:16px;">
      <button class="menu-btn btn-primary" onclick="startBotMatch()">PLAY AGAIN</button>
      <button class="menu-btn btn-secondary" onclick="botMatchReturn()">← LOBBY</button>
    </div></div>`;
  showScreen('botMatchEndScreen');
  if(typeof sfxWaveComplete==='function'&&won) sfxWaveComplete();
}
function botMatchReturn(){
  botMatchActive=false; _bmEnded=true;
  _bmBots.forEach(b=>{if(b.group)scene.remove(b.group);if(b.bar)b.bar.remove();}); _bmBots=[];
  if(typeof clearWorld==='function') clearWorld();
  if(typeof returnToMenu==='function') returnToMenu();
  else { gameActive=false; showScreen('mainMenu'); if(typeof renderLobby==='function') renderLobby(); }
}
