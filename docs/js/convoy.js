'use strict';
// ═══════════════════════════════════════════════════════════════
//  CONVOY CRISIS — 12-player escort warfare (6 Defenders v 6 Attackers)
//  Host-authoritative sim. Real players join via the existing mesh;
//  empty slots fill with bots so a match always reaches 6v6. Fully
//  self-contained — its own entity arrays + loop, never touches the
//  wave/soldier systems, so nothing else can break.
// ═══════════════════════════════════════════════════════════════

let convoyActive=false;
let convoy=null;           // {health,shield,maxHealth,maxShield,speed,progress,cp,disabled,underAttack,group,pos}
let _cvBots=[];            // {group,pos,team,role,hp,maxHp,fireCd,target,dead,bar}
let _cvMissiles=[];        // missiles aimed at the convoy
let _cvRoadblocks=[];      // {group,pos,hp}
let _cvRoute=null;         // [{x,z,obj,label}]
let _cvPlayer={team:'defender',role:'interceptor',score:0,kills:0,intercepts:0,repairs:0,convoyDmg:0,roadblocks:0,abilityCd:0};
let _cvTimer=0,_cvMatchTime=420; // 7-minute hard cap
let _cvObjT=0,_cvObjActive=false;
let _cvEvents=[],_cvEventT=0,_cvCurEvent=null,_cvEventTimeLeft=0;
let _cvMissileTimer=0;
let _cvEnded=false;

// ── Roles ──────────────────────────────────────────────────────
const CV_ROLES={
  interceptor:{name:'Interceptor',icon:'🎯',desc:'Fast lock-on, +missile damage. Ability: Emergency Intercept',
    spd:1.0,armor:1.0,ability:'Emergency Intercept',abilityCd:22},
  heavy:{name:'Heavy',icon:'🛡️',desc:'More armor, slower. Ability: Rocket Barrage',
    spd:.82,armor:1.6,ability:'Rocket Barrage',abilityCd:26},
  engineer:{name:'Engineer',icon:'🔧',desc:'Faster repairs & roadblock clears. Ability: Deploy Shield',
    spd:1.0,armor:1.1,ability:'Deploy Shield',abilityCd:24},
  scout:{name:'Scout',icon:'📡',desc:'Faster sprint, marks enemies. Ability: Radar Pulse',
    spd:1.25,armor:.85,ability:'Radar Pulse',abilityCd:18},
};

// ── Routes per map — checkpoint waypoints with mini-objectives ──
const CV_ROUTES={
  dubai:[
    {x:-58,z:0,  obj:'roadblock', label:'Clear Roadblock — Boulevard'},
    {x:-28,z:6,  obj:'defend',    label:'Defend Radar Truck — Tower District'},
    {x:2,  z:-4, obj:'jammer',    label:'Disable Missile Jammer — Overpass'},
    {x:34, z:4,  obj:'barrage',   label:'Survive Missile Barrage — Plaza'},
    {x:60, z:0,  obj:'extract',   label:'Extraction — Skyline'},
  ],
  beirut:[
    {x:-56,z:-6, obj:'roadblock', label:'Clear Roadblock — Old Town'},
    {x:-26,z:8,  obj:'hack',      label:'Hack Radar Tower — Coast Road'},
    {x:4,  z:-6, obj:'defend',    label:'Defend Refuel — Market'},
    {x:32, z:6,  obj:'barrage',   label:'Survive Barrage — Rooftops'},
    {x:58, z:-2, obj:'extract',   label:'Extraction — Port'},
  ],
  sweden:[
    {x:-58,z:4,  obj:'roadblock', label:'Clear Roadblock — Snow Street'},
    {x:-26,z:-6, obj:'defend',    label:'Defend Generator — Town Square'},
    {x:4,  z:6,  obj:'jammer',    label:'Disable Jammer — Bridge'},
    {x:34, z:-4, obj:'hack',      label:'Capture Signal Tower — Industrial'},
    {x:60, z:0,  obj:'extract',   label:'Extraction — Cold Zone'},
  ],
};

const CV_EVENT_POOL=[
  {id:'missilestorm',name:'MISSILE STORM',desc:'Heavy missile wave on the convoy route',dur:25},
  {id:'blackout',    name:'RADAR BLACKOUT',desc:'Markers disabled',dur:18},
  {id:'haze',        name:'DUST HAZE',     desc:'Visibility reduced',dur:22},
  {id:'drones',      name:'DRONE SWARM',   desc:'AI drones attack both teams',dur:24},
  {id:'shieldsurge', name:'SHIELD SURGE',  desc:'Convoy shield boosted',dur:20},
  {id:'overdrive',   name:'OVERDRIVE',     desc:'Convoy speed +60%',dur:30},
  {id:'redalert',    name:'RED ALERT',     desc:'Attacker missile strikes boosted',dur:22},
];

function _cvLoc(){ return (typeof selectedLoc!=='undefined'&&selectedLoc)||saveData.locId||'beirut'; }

// ── Entry ──────────────────────────────────────────────────────
function startConvoyCrisis(team,role){
  _cvPlayer={team:team||'defender',role:role||'interceptor',score:0,kills:0,intercepts:0,
    repairs:0,convoyDmg:0,roadblocks:0,abilityCd:0};
  if(typeof botMatchActive!=='undefined') botMatchActive=false;
  const loc=_cvLoc();
  selectedLoc=loc; saveData.locId=loc;
  if(typeof buildWorld==='function') buildWorld(loc);
  _cvRoute=(CV_ROUTES[loc]||CV_ROUTES.beirut).map(c=>Object.assign({},c));
  _cvBuildConvoy();
  _cvSpawnTeams();
  _cvPickEvents();
  convoy.cp=0; _cvObjActive=false; _cvObjT=0;
  _cvTimer=_cvMatchTime; _cvMissileTimer=4; _cvEventT=40; _cvCurEvent=null; _cvEnded=false;
  convoyActive=true;
  // player spawn near convoy / ambush point
  const sp=_cvRoute[0];
  if(_cvPlayer.team==='defender'){ px=convoy.pos.x-6; pz=convoy.pos.z+3; }
  else { px=sp.x+10; pz=sp.z-8; }
  py=PLAYER_H; vx=vy=vz=0; yaw=0;
  // role movement
  const r=CV_ROLES[_cvPlayer.role];
  effectiveSpd=PLAYER_SPD*r.spd; effectiveSprint=SPRINT_SPD*r.spd;
  gameActive=true; gamePaused=false; battleActive=false;
  if(typeof showScreen==='function') showScreen('hud');
  document.getElementById('crosshair').style.display='block';
  const cn=document.getElementById('clickNotice'); if(cn) cn.style.display='flex';
  document.getElementById('weaponBar').style.display='flex';
  // give player a real loadout
  const equip=(saveData.equippedWeapons&&saveData.equippedWeapons.length>=2)?saveData.equippedWeapons:['pistol','launcher'];
  weaponInventory=new Set(equip); currentWeapon=equip[0];
  weaponAmmo={}; Object.keys(WEAPONS).forEach(k=>weaponAmmo[k]=WEAPONS[k].maxAmmo);
  ammo=WEAPONS[currentWeapon].maxAmmo; isReloading=false; fireCD=0;
  if(typeof switchWeapon==='function'){ /* mesh */ }
  if(weaponMesh){camera.remove(weaponMesh);} weaponMesh=makeWeaponMesh(); camera.add(weaponMesh);
  if(typeof updateWeaponBar==='function') updateWeaponBar();
  _cvBuildHud();
  showNotif('CONVOY CRISIS — '+(_cvPlayer.team==='defender'?'ESCORT THE CONVOY':'DESTROY THE CONVOY')+'!');
  if(typeof sfxAlert==='function') sfxAlert();
}

// ── Convoy vehicles ────────────────────────────────────────────
function _cvBuildConvoy(){
  const g=new THREE.Group();
  // command truck
  const truck=_cvVehicle(0x3A4A38,2.4,2.0,5.0,true);
  truck.position.set(0,0,0); g.add(truck);
  // armored carrier (behind)
  const carrier=_cvVehicle(0x2E3A4A,2.2,1.8,4.2,false);
  carrier.position.set(0,0,5.6); g.add(carrier);
  // radar support
  const radar=_cvVehicle(0x4A3A2A,2.0,1.6,3.6,false);
  const dish=new THREE.Mesh(new THREE.CylinderGeometry(.9,.9,.12,12),
    new THREE.MeshLambertMaterial({color:0xCCCCCC}));
  dish.rotation.x=Math.PI/3; dish.position.set(0,1.9,0); radar.add(dish);
  radar.position.set(0,0,-5.2); g.add(radar);
  const start=(CV_ROUTES[_cvLoc()]||CV_ROUTES.beirut)[0];
  g.position.set(start.x-6,0,start.z);
  g.rotation.y=Math.PI/2;
  if(typeof addToWorld==='function') addToWorld(g); else scene.add(g);
  convoy={health:1000,maxHealth:1000,shield:300,maxShield:300,speed:2.6,progress:0,cp:0,
    disabled:false,underAttack:false,group:g,pos:new THREE.Vector3(start.x-6,0,start.z),
    truck,carrier,radar,carrierAlive:true,radarAlive:true};
}
function _cvVehicle(col,w,h,d,cab){
  const v=new THREE.Group();
  const body=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),new THREE.MeshLambertMaterial({color:col}));
  body.position.y=h/2+.5; v.add(body);
  if(cab){
    const cabM=new THREE.Mesh(new THREE.BoxGeometry(w*.9,h*.7,d*.32),new THREE.MeshLambertMaterial({color:0x1A2230}));
    cabM.position.set(0,h+.5,d*.3); v.add(cabM);
  }
  // wheels
  [[-w/2,d*.32],[w/2,d*.32],[-w/2,-d*.32],[w/2,-d*.32]].forEach(([x,z])=>{
    const wh=new THREE.Mesh(new THREE.CylinderGeometry(.5,.5,.4,10),new THREE.MeshLambertMaterial({color:0x0E0E10}));
    wh.rotation.z=Math.PI/2; wh.position.set(x,.5,z); v.add(wh);
  });
  return v;
}

// ── Teams (player + bots, fill to 6v6) ─────────────────────────
function _cvSpawnTeams(){
  _cvBots.forEach(b=>{if(b.group)scene.remove(b.group);if(b.bar)b.bar.remove();});
  _cvBots=[];
  const loc=_cvLoc();
  const roles=['interceptor','heavy','engineer','scout'];
  // count real players already in the mesh (host perspective); fill rest with bots
  const realDef=1, realAtk=0; // local player on chosen team; networking adds more later
  for(let i=0;i<6;i++){
    if(_cvPlayer.team==='defender'&&i<realDef) continue; // player slot
    _cvSpawnBot('defender',roles[i%4]);
  }
  for(let i=0;i<6;i++){
    if(_cvPlayer.team==='attacker'&&i<realAtk) continue;
    _cvSpawnBot('attacker',roles[i%4]);
  }
}
function _cvSpawnBot(team,role){
  const isDef=team==='defender';
  const col=isDef?0x2A4A8A:0x8A2A2A;
  const vis=isDef?'#44CCFF':'#FF4444';
  let g;
  try{ g=makeCharModel({outfitColor:'#'+col.toString(16).padStart(6,'0'),visorColor:vis,
    skinTone:'#C8955A',armorStyle:role==='heavy'?'heavy':'light',helmet:true,backpack:'missile'}); }
  catch(e){ g=new THREE.Group(); const m=new THREE.Mesh(new THREE.BoxGeometry(.6,1.7,.4),
    new THREE.MeshLambertMaterial({color:col})); m.position.y=.85; g.add(m); }
  const base=isDef?convoy.pos.clone():new THREE.Vector3(_cvRoute[Math.min(convoy.cp+1,_cvRoute.length-1)].x,0,_cvRoute[0].z);
  const ang=Math.random()*Math.PI*2, rad=isDef?5+Math.random()*6:14+Math.random()*8;
  const pos=new THREE.Vector3(base.x+Math.cos(ang)*rad,0,base.z+Math.sin(ang)*rad);
  g.position.copy(pos); scene.add(g);
  const hp=role==='heavy'?160:role==='scout'?80:110;
  const bar=document.createElement('div'); bar.className='cv-bot-bar';
  bar.innerHTML=`<div class="cv-bot-fill ${team}" style="width:100%"></div>`;
  const hbHost=document.getElementById('healthBars'); if(hbHost) hbHost.appendChild(bar);
  _cvBots.push({group:g,pos,team,role,hp,maxHp:hp,fireCd:1+Math.random()*2,target:null,dead:false,
    bar,fill:bar.querySelector('.cv-bot-fill')});
}

// ── Events ─────────────────────────────────────────────────────
function _cvPickEvents(){
  const pool=CV_EVENT_POOL.slice().sort(()=>Math.random()-.5);
  const n=2+Math.floor(Math.random()*3); // 2-4
  _cvEvents=pool.slice(0,n);
}
function _cvTriggerEvent(){
  if(!_cvEvents.length) return;
  _cvCurEvent=_cvEvents.shift();
  _cvEventTimeLeft=_cvCurEvent.dur;
  showNotif('⚡ EVENT: '+_cvCurEvent.name+' — '+_cvCurEvent.desc);
  if(typeof sfxAlert==='function') sfxAlert();
  if(_cvCurEvent.id==='shieldsurge') convoy.shield=Math.min(convoy.maxShield*1.8,convoy.shield+200);
  if(_cvCurEvent.id==='overdrive') convoy.speed*=1.6;
  if(_cvCurEvent.id==='haze'&&scene.fog) scene.fog.density=(scene.fog.density||.01)*2.4;
}
function _cvEndEvent(){
  if(_cvCurEvent){
    if(_cvCurEvent.id==='overdrive') convoy.speed/=1.6;
    if(_cvCurEvent.id==='haze'&&scene.fog) scene.fog.density=(scene.fog.density||.02)/2.4;
  }
  _cvCurEvent=null;
}

// ── Main update (called from gameLoop) ─────────────────────────
function updateConvoy(dt){
  if(!convoyActive||!convoy||_cvEnded) return;
  _cvTimer-=dt;
  _cvPlayer.abilityCd=Math.max(0,_cvPlayer.abilityCd-dt);

  // Events
  _cvEventT-=dt;
  if(_cvEventTimeLeft>0){ _cvEventTimeLeft-=dt; if(_cvEventTimeLeft<=0) _cvEndEvent(); }
  if(_cvEventT<=0&&!_cvCurEvent&&_cvEvents.length){ _cvEventT=45+Math.random()*30; _cvTriggerEvent(); }

  // Convoy movement
  const wp=_cvRoute[convoy.cp];
  const blocked=_cvRoadblocks.length>0||convoy.disabled||_cvObjActive;
  if(wp&&!blocked&&wp.obj!=='extract'){
    const dx=wp.x-convoy.pos.x, dz=wp.z-convoy.pos.z;
    const dist=Math.hypot(dx,dz);
    if(dist>1.2){
      const sp=convoy.speed*(convoy.health<convoy.maxHealth*.4?.6:1)*dt;
      convoy.pos.x+=dx/dist*sp; convoy.pos.z+=dz/dist*sp;
      convoy.group.position.set(convoy.pos.x,0,convoy.pos.z);
      convoy.group.rotation.y=Math.atan2(dx,dz);
      convoy.progress=Math.min(1,(convoy.cp+1-dist/40)/_cvRoute.length);
    } else {
      _cvStartObjective(wp);
    }
  } else if(wp&&wp.obj==='extract'&&!blocked){
    const dx=wp.x-convoy.pos.x, dz=wp.z-convoy.pos.z, dist=Math.hypot(dx,dz);
    if(dist>1.2){
      const sp=convoy.speed*dt; convoy.pos.x+=dx/dist*sp; convoy.pos.z+=dz/dist*sp;
      convoy.group.position.set(convoy.pos.x,0,convoy.pos.z);
      convoy.group.rotation.y=Math.atan2(dx,dz);
    } else { _cvEnd(true,'CONVOY REACHED EXTRACTION'); return; }
  }

  // Checkpoint objective timer
  if(_cvObjActive){
    _cvObjT-=dt;
    if(_cvObjT<=0){
      _cvObjActive=false; convoy.cp++; convoy.progress=convoy.cp/_cvRoute.length;
      if(_cvPlayer.team==='defender'){_cvPlayer.score+=300;}
      showNotif('CHECKPOINT '+convoy.cp+'/'+_cvRoute.length+' CLEARED');
      if(convoy.speed<3) convoy.speed=Math.min(3.4,convoy.speed+.2); // defenders speed up convoy
    }
  }

  // Missiles vs convoy
  _cvMissileTimer-=dt;
  const stormMul=_cvCurEvent?.id==='missilestorm'?.4:_cvCurEvent?.id==='redalert'?.55:1;
  if(_cvMissileTimer<=0){
    _cvMissileTimer=(3.5+Math.random()*3)*stormMul;
    _cvSpawnConvoyMissile();
  }
  _cvUpdateMissiles(dt);

  // Bots + roadblocks + player-projectile hits
  _cvUpdateBots(dt);
  _cvUpdateRoadblocks(dt);
  _cvCheckPlayerHits();

  // Convoy destroyed?
  if(convoy.health<=0){ _cvEnd(false,'CONVOY DESTROYED'); return; }
  // Time out → progress-based winner
  if(_cvTimer<=0){
    const defWin=convoy.progress>=.5||convoy.health>convoy.maxHealth*.5;
    _cvEnd(_cvPlayer.team==='defender'?defWin:!defWin, defWin?'TIME — DEFENDERS HOLD':'TIME — ATTACKERS STOP CONVOY');
    return;
  }
  _cvUpdateHud();
}

function _cvStartObjective(wp){
  if(wp.obj==='extract') return;
  if(_cvObjActive) return;
  _cvObjActive=true;
  _cvObjT={roadblock:14,defend:16,jammer:14,barrage:18,hack:15}[wp.obj]||14;
  showNotif('OBJECTIVE: '+wp.label);
  if(wp.obj==='roadblock') _cvSpawnRoadblock(wp);
  // reinforce attacker bots near the checkpoint
  if(_cvBots.filter(b=>b.team==='attacker'&&!b.dead).length<5){
    for(let i=0;i<2;i++) _cvSpawnBot('attacker','heavy');
  }
}

// ── Missiles aimed at convoy ────────────────────────────────────
function _cvSpawnConvoyMissile(){
  const g=new THREE.Group();
  const body=new THREE.Mesh(new THREE.CylinderGeometry(.18,.18,1.6,8),new THREE.MeshLambertMaterial({color:0x303840}));
  const nose=new THREE.Mesh(new THREE.ConeGeometry(.18,.5,8),new THREE.MeshLambertMaterial({color:0xFF5530,emissive:0xCC2200,emissiveIntensity:.6}));
  nose.position.y=1.05; g.add(body,nose);
  const tgt=convoy.pos.clone().add(new THREE.Vector3((Math.random()-.5)*4,0,(Math.random()-.5)*6));
  const start=new THREE.Vector3(tgt.x+(Math.random()-.5)*30,55,tgt.z+(Math.random()-.5)*30);
  g.position.copy(start); scene.add(g);
  const lt=new THREE.PointLight(0xFF5530,1.5,12); g.add(lt);
  _cvMissiles.push({group:g,pos:start.clone(),target:tgt,speed:14+Math.random()*6,hp:30,dead:false});
}
function _cvUpdateMissiles(dt){
  for(let i=_cvMissiles.length-1;i>=0;i--){
    const m=_cvMissiles[i];
    if(m.dead){scene.remove(m.group);_cvMissiles.splice(i,1);continue;}
    const dx=m.target.x-m.pos.x, dy=m.target.y-m.pos.y, dz=m.target.z-m.pos.z;
    const d=Math.hypot(dx,dy,dz);
    if(d<1.6){
      // hit convoy
      _cvDamageConvoy(60);
      spawnExplosion(m.pos.clone(),2.2,0xFF5530); triggerScreenShake(.5);
      if(typeof sfxExplosion==='function') sfxExplosion();
      scene.remove(m.group); _cvMissiles.splice(i,1); continue;
    }
    const sp=m.speed*dt;
    m.pos.x+=dx/d*sp; m.pos.y+=dy/d*sp; m.pos.z+=dz/d*sp;
    m.group.position.copy(m.pos);
    m.group.rotation.x=Math.atan2(dz,dy);
  }
}
function _cvDamageConvoy(dmg){
  convoy.underAttack=true;
  if(convoy.shield>0){ const s=Math.min(convoy.shield,dmg); convoy.shield-=s; dmg-=s; }
  if(dmg>0) convoy.health=Math.max(0,convoy.health-dmg);
}

// ── Bots ───────────────────────────────────────────────────────
function _cvUpdateBots(dt){
  const pPos=new THREE.Vector3(px,0,pz);
  for(const b of _cvBots){
    if(b.dead) continue;
    const role=CV_ROLES[b.role]||CV_ROLES.interceptor;
    // goal: attackers move to convoy, defenders orbit convoy & shoot attackers
    let goal;
    if(b.team==='attacker'){ goal=convoy.pos; }
    else { const a=_cvNearestEnemyBot(b); goal=a?a.pos:convoy.pos; }
    const dx=goal.x-b.pos.x, dz=goal.z-b.pos.z, d=Math.hypot(dx,dz)||1;
    const keep=b.team==='attacker'?10:8;
    if(d>keep){ const sp=PLAYER_SPD*.45*role.spd*dt; b.pos.x+=dx/d*sp; b.pos.z+=dz/d*sp; }
    b.group.position.set(b.pos.x,0,b.pos.z);
    b.group.rotation.y=Math.atan2(dx,dz);
    // fire
    b.fireCd-=dt;
    if(b.fireCd<=0){
      b.fireCd=1+Math.random()*1.5;
      if(b.team==='attacker'){
        // shoot convoy if close
        if(d<16){ _cvDamageConvoy(14); }
        // shoot defender bots / player
        const e=_cvNearestEnemyBot(b);
        if(e&&b.pos.distanceTo(e.pos)<22) _cvDamageBot(e,20);
        else if(b.pos.distanceTo(pPos)<20&&_cvPlayer.team==='defender'&&Math.random()<.5) _cvHurtPlayer(8);
      } else {
        // defender: shoot attacker bots + intercept handled by player
        const e=_cvNearestEnemyBot(b);
        if(e&&b.pos.distanceTo(e.pos)<24) _cvDamageBot(e,22);
        // defenders auto-intercept a fraction of missiles
        if(_cvMissiles.length&&Math.random()<.25){ const m=_cvMissiles[0]; m.dead=true; spawnExplosion(m.pos.clone(),1.2,0x44CCFF); }
      }
    }
    // hp bar position
    if(b.fill) b.fill.style.width=Math.max(0,Math.round(b.hp/b.maxHp*100))+'%';
    _cvPositionBar(b.bar,b.pos,2.0);
  }
}
function _cvNearestEnemyBot(b){
  let best=null,bd=1e9;
  for(const o of _cvBots){ if(o.dead||o.team===b.team) continue;
    const d=b.pos.distanceTo(o.pos); if(d<bd){bd=d;best=o;} }
  return best;
}
function _cvDamageBot(b,dmg){
  if(b.dead) return;
  b.hp-=dmg;
  if(b.hp<=0){ _cvKillBot(b); }
}
function _cvKillBot(b){
  if(b.dead) return;
  b.dead=true;
  spawnExplosion(b.pos.clone(),1.0,b.team==='attacker'?0xFF6040:0x6090FF);
  scene.remove(b.group); if(b.bar) b.bar.remove();
}
function _cvHurtPlayer(dmg){
  const armor=CV_ROLES[_cvPlayer.role].armor;
  if(typeof playerHealth!=='undefined'){ /* engine may track elsewhere */ }
  if(typeof showDamageFlash==='function') showDamageFlash();
}

// ── Roadblocks ─────────────────────────────────────────────────
function _cvSpawnRoadblock(wp){
  const g=new THREE.Group();
  for(let i=0;i<3;i++){
    const b=new THREE.Mesh(new THREE.BoxGeometry(1.4,1.4,1.4),new THREE.MeshLambertMaterial({color:0xC2861A}));
    b.position.set((i-1)*1.6,.7,0); g.add(b);
  }
  const pos=new THREE.Vector3(wp.x+3,0,wp.z);
  g.position.copy(pos); scene.add(g);
  _cvRoadblocks.push({group:g,pos,hp:120});
}
function _cvUpdateRoadblocks(dt){
  // engineer clears faster when near
  const pPos=new THREE.Vector3(px,0,pz);
  const clearMul=_cvPlayer.role==='engineer'?2.4:1;
  for(let i=_cvRoadblocks.length-1;i>=0;i--){
    const r=_cvRoadblocks[i];
    if(_cvPlayer.team==='defender'&&r.pos.distanceTo(pPos)<5){
      r.hp-=40*clearMul*dt; _cvPlayer.repairs+=1;
    }
    if(r.hp<=0){
      spawnExplosion(r.pos.clone(),1.4,0xFFAA30);
      scene.remove(r.group); _cvRoadblocks.splice(i,1);
      _cvPlayer.roadblocks++; _cvPlayer.score+=120;
      showNotif('ROADBLOCK CLEARED');
    }
  }
}

// ── Player projectile hits on bots / convoy / missiles ─────────
function _cvCheckPlayerHits(){
  if(typeof projectiles==='undefined') return;
  for(let i=projectiles.length-1;i>=0;i--){
    const p=projectiles[i]; if(!p.pos) continue;
    // missiles (defender intercept)
    if(_cvPlayer.team==='defender'){
      for(const m of _cvMissiles){ if(m.dead) continue;
        if(p.pos.distanceTo(m.pos)<1.8){
          m.dead=true; _cvPlayer.intercepts++; _cvPlayer.score+=80;
          spawnExplosion(m.pos.clone(),1.3,0x44CCFF);
          if(p.mesh) scene.remove(p.mesh); projectiles.splice(i,1);
          break;
        }
      }
    }
    if(i>=projectiles.length) continue;
    // enemy bots (player's opposing team)
    const enemyTeam=_cvPlayer.team==='defender'?'attacker':'defender';
    let hit=false;
    for(const b of _cvBots){ if(b.dead||b.team!==enemyTeam) continue;
      const bp=new THREE.Vector3(b.pos.x,1,b.pos.z);
      if(p.pos.distanceTo(bp)<1.3){
        _cvDamageBot(b,p.dmg||35);
        if(b.dead){ _cvPlayer.kills++; _cvPlayer.score+=100; }
        if(p.mesh) scene.remove(p.mesh); projectiles.splice(i,1); hit=true; break;
      }
    }
    if(hit) continue;
    // attacker hits convoy
    if(_cvPlayer.team==='attacker'){
      if(p.pos.distanceTo(convoy.pos)<3.5){
        _cvDamageConvoy(p.dmg||35); _cvPlayer.convoyDmg+=(p.dmg||35); _cvPlayer.score+=(p.dmg||35);
        if(p.mesh) scene.remove(p.mesh); projectiles.splice(i,1);
      }
    }
  }
}

// ── Role ability (bound to V/B/G via main key handler hook) ────
function cvUseAbility(){
  if(!convoyActive||_cvPlayer.abilityCd>0) return;
  const r=CV_ROLES[_cvPlayer.role];
  _cvPlayer.abilityCd=r.abilityCd;
  if(_cvPlayer.role==='interceptor'){
    // destroy up to 3 incoming missiles
    let n=0; _cvMissiles.forEach(m=>{ if(!m.dead&&n<3){m.dead=true;n++;_cvPlayer.intercepts++;spawnExplosion(m.pos.clone(),1.4,0x44CCFF);} });
    showNotif('EMERGENCY INTERCEPT — '+n+' missiles down');
  } else if(_cvPlayer.role==='heavy'){
    // rocket barrage at nearest enemy cluster
    const enemyTeam=_cvPlayer.team==='defender'?'attacker':'defender';
    let n=0; _cvBots.forEach(b=>{ if(!b.dead&&b.team===enemyTeam&&n<4){ _cvDamageBot(b,90); n++; spawnExplosion(b.pos.clone(),1.6,0xFF6020); } });
    if(_cvPlayer.team==='attacker'){ _cvDamageConvoy(120); _cvPlayer.convoyDmg+=120; }
    triggerScreenShake(.6); showNotif('ROCKET BARRAGE');
  } else if(_cvPlayer.role==='engineer'){
    if(_cvPlayer.team==='defender'){ convoy.shield=Math.min(convoy.maxShield,convoy.shield+150); showNotif('SHIELD DEPLOYED +150'); }
    else { _cvRoadblocks.length&&0; _cvSpawnRoadblock({x:convoy.pos.x+4,z:convoy.pos.z}); showNotif('ROADBLOCK DEPLOYED'); }
  } else if(_cvPlayer.role==='scout'){
    // radar pulse — mark enemies (flash their bars) + small convoy speed help if defender
    showNotif('RADAR PULSE — ENEMIES MARKED');
    _cvBots.forEach(b=>{ if(!b.dead&&b.bar) b.bar.classList.add('cv-marked'); });
    setTimeout(()=>_cvBots.forEach(b=>b.bar&&b.bar.classList.remove('cv-marked')),5000);
  }
  if(typeof sfxShockFire==='function') sfxShockFire();
}

// ── HUD ─────────────────────────────────────────────────────────
function _cvBuildHud(){
  let h=document.getElementById('convoyHud');
  if(!h){ h=document.createElement('div'); h.id='convoyHud'; document.body.appendChild(h); }
  h.style.display='block';
  h.innerHTML=`
    <div class="cv-top">
      <span class="cv-team ${_cvPlayer.team==='attacker'?'on':''}">ATTACKERS</span>
      <div class="cv-center">
        <div class="cv-hpwrap"><div class="cv-hplabel">CONVOY</div>
          <div class="cv-hpbar"><div id="cvHpFill" class="cv-hpfill"></div><div id="cvShFill" class="cv-shfill"></div></div>
        </div>
        <div id="cvCheckpoint" class="cv-cp">CHECKPOINT 1/5</div>
      </div>
      <span class="cv-team ${_cvPlayer.team==='defender'?'on':''}">DEFENDERS</span>
    </div>
    <div id="cvObjLine" class="cv-obj"></div>
    <div id="cvEventLine" class="cv-event"></div>
    <div class="cv-role">${CV_ROLES[_cvPlayer.role].icon} ${CV_ROLES[_cvPlayer.role].name} · <span id="cvAbility">ABILITY [V]</span></div>`;
}
function _cvUpdateHud(){
  const hp=document.getElementById('cvHpFill'); if(hp) hp.style.width=Math.max(0,convoy.health/convoy.maxHealth*100)+'%';
  const sh=document.getElementById('cvShFill'); if(sh) sh.style.width=Math.max(0,convoy.shield/convoy.maxShield*100)+'%';
  const cp=document.getElementById('cvCheckpoint'); if(cp) cp.textContent='CHECKPOINT '+(convoy.cp+1)+'/'+_cvRoute.length;
  const ob=document.getElementById('cvObjLine');
  if(ob){ const wp=_cvRoute[convoy.cp];
    ob.textContent=_cvObjActive?('▶ '+wp.label+'  ('+Math.ceil(_cvObjT)+'s)'):(wp?wp.label:''); }
  const ev=document.getElementById('cvEventLine');
  if(ev) ev.textContent=_cvCurEvent?('⚡ '+_cvCurEvent.name+'  '+Math.ceil(_cvEventTimeLeft)+'s'):'';
  const ab=document.getElementById('cvAbility');
  if(ab) ab.textContent=_cvPlayer.abilityCd>0?('ABILITY '+Math.ceil(_cvPlayer.abilityCd)+'s'):'ABILITY [V] READY';
}
function _cvPositionBar(bar,pos,h){
  if(!bar||typeof camera==='undefined') return;
  const v=new THREE.Vector3(pos.x,h,pos.z).project(camera);
  if(v.z>1){ bar.style.display='none'; return; }
  bar.style.display='block';
  bar.style.left=((v.x*.5+.5)*window.innerWidth)+'px';
  bar.style.top=((-v.y*.5+.5)*window.innerHeight)+'px';
}

// ── End ─────────────────────────────────────────────────────────
function _cvEnd(playerWon,reason){
  if(_cvEnded) return;
  _cvEnded=true; convoyActive=false; gameActive=false;
  if(document.pointerLockElement) document.exitPointerLock();
  isLocked=false;
  _cvBots.forEach(b=>{if(b.bar)b.bar.remove();});
  _cvMissiles.forEach(m=>scene.remove(m.group)); _cvMissiles=[];
  _cvRoadblocks.forEach(r=>scene.remove(r.group)); _cvRoadblocks=[];
  const h=document.getElementById('convoyHud'); if(h) h.style.display='none';
  document.getElementById('crosshair').style.display='none';
  document.getElementById('weaponBar').style.display='none';
  // rewards
  const credits=playerWon?900:350;
  const mpxp=playerWon?260:120;
  saveData.currency=(saveData.currency||0)+credits;
  if(typeof addMpXp==='function') addMpXp(mpxp);
  if(typeof achInc==='function'){ achInc('mpMatchWins',playerWon?1:0); if(playerWon&&_cvPlayer.team==='defender') achInc('convoyWins'); }
  if(typeof _mpChallProgress==='function'){
    if(playerWon) _mpChallProgress('convoyWins',1);
    _mpChallProgress('convoyDamage',Math.round(_cvPlayer.convoyDmg));
    _mpChallProgress('mpIntercepts',_cvPlayer.intercepts);
  }
  saveSave();
  _cvShowEndScreen(playerWon,reason,credits,mpxp);
  if(typeof sfxWaveComplete==='function'&&playerWon) sfxWaveComplete();
}
function _cvShowEndScreen(won,reason,credits,mpxp){
  let s=document.getElementById('convoyEndScreen');
  if(!s){ s=document.createElement('div'); s.id='convoyEndScreen'; s.className='screen'; document.body.appendChild(s); }
  const p=_cvPlayer;
  s.innerHTML=`<div class="cv-end-inner">
    <div class="cv-end-title" style="color:${won?'#4AE870':'#E84A4A'}">${won?'VICTORY':'DEFEAT'}</div>
    <div class="cv-end-sub">${reason} · ${p.team.toUpperCase()}</div>
    <div class="cv-end-grid">
      <div class="cv-end-stat"><span>${p.score}</span><label>Objective Score</label></div>
      <div class="cv-end-stat"><span>${p.kills}</span><label>Kills</label></div>
      <div class="cv-end-stat"><span>${p.intercepts}</span><label>Intercepts</label></div>
      <div class="cv-end-stat"><span>${Math.round(p.convoyDmg)}</span><label>Convoy Damage</label></div>
      <div class="cv-end-stat"><span>${p.roadblocks}</span><label>Roadblocks</label></div>
      <div class="cv-end-stat"><span>${Math.round(convoy.progress*100)}%</span><label>Convoy Progress</label></div>
    </div>
    <div class="cv-end-rewards">+${credits} CREDITS · +${mpxp} MP XP</div>
    <button class="menu-btn btn-primary" style="margin:14px auto 0;" onclick="convoyReturnToMenu()">RETURN TO LOBBY</button>
  </div>`;
  showScreen('convoyEndScreen');
}
function convoyReturnToMenu(){
  if(convoy&&convoy.group) scene.remove(convoy.group);
  convoy=null; convoyActive=false; _cvEnded=true;
  _cvBots.forEach(b=>{if(b.group)scene.remove(b.group);if(b.bar)b.bar.remove();}); _cvBots=[];
  if(typeof clearWorld==='function') clearWorld();
  if(typeof returnToMenu==='function'){ returnToMenu(); }
  else { gameActive=false; showScreen('mainMenu'); if(typeof renderLobby==='function') renderLobby(); }
}
