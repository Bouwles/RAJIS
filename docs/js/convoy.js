'use strict';
// ═══════════════════════════════════════════════════════════════
//  CONVOY CRISIS v2 — escort warfare, 6v6
//  Two ways to play:
//    • ONLINE  — host-authoritative sim over the room mesh, bots fill
//      empty slots, sides auto-assigned (you don't pick), sides SWAP
//      each round (classic escort format: best defensive push wins).
//    • VS AI   — same sim, fully local, bots fill both teams.
//  Self-contained: own loop + entities, never touches wave/battle
//  systems. Host runs the truth; guests render host state + send hits.
// ═══════════════════════════════════════════════════════════════

let convoyActive=false;
let convoy=null;
let _cvBots=[];
let _cvMissiles=[];
let _cvRoadblocks=[];
let _cvRoute=null;
let _cvNet=false;           // online vs AI
let _cvIsHost=true;         // host runs the sim
let _cvPlayer=null;         // per-player runtime
let _cvMatch=null;          // {round, maxRounds, sideThisRound, results:[]}
let _cvTimer=0, _cvRoundTime=200;
let _cvObjT=0,_cvObjActive=false;
let _cvEvents=[],_cvEventT=0,_cvCurEvent=null,_cvEventTimeLeft=0;
let _cvMissileTimer=0,_cvNetTimer=0;
let _cvRoundOver=false,_cvInterT=0,_cvEnded=false;
let _cvArrow=null,_cvBeacon=null;

const CV_ROLES={
  interceptor:{name:'Interceptor',icon:'🎯',desc:'Fast lock-on, +missile damage. Ability: Emergency Intercept',spd:1.0,armor:1.0,abilityCd:20},
  heavy:{name:'Heavy',icon:'🛡️',desc:'More armor, slower. Ability: Rocket Barrage',spd:.85,armor:1.6,abilityCd:24},
  engineer:{name:'Engineer',icon:'🔧',desc:'Faster repairs & roadblock clears. Ability: Deploy Shield',spd:1.0,armor:1.15,abilityCd:22},
  scout:{name:'Scout',icon:'📡',desc:'Faster sprint, marks enemies. Ability: Radar Pulse',spd:1.28,armor:.88,abilityCd:16},
};
const CV_ROUTES={
  dubai:[
    {x:-58,z:0,obj:'roadblock',label:'Clear Roadblock — Boulevard'},
    {x:-28,z:6,obj:'defend',label:'Defend Radar Truck — Tower District'},
    {x:2,z:-4,obj:'jammer',label:'Disable Missile Jammer — Overpass'},
    {x:34,z:4,obj:'barrage',label:'Survive Missile Barrage — Plaza'},
    {x:60,z:0,obj:'extract',label:'Extraction — Skyline'},
  ],
  beirut:[
    {x:-56,z:-6,obj:'roadblock',label:'Clear Roadblock — Old Town'},
    {x:-26,z:8,obj:'hack',label:'Hack Radar Tower — Coast Road'},
    {x:4,z:-6,obj:'defend',label:'Defend Refuel — Market'},
    {x:32,z:6,obj:'barrage',label:'Survive Barrage — Rooftops'},
    {x:58,z:-2,obj:'extract',label:'Extraction — Port'},
  ],
  sweden:[
    {x:-58,z:4,obj:'roadblock',label:'Clear Roadblock — Snow Street'},
    {x:-26,z:-6,obj:'defend',label:'Defend Generator — Town Square'},
    {x:4,z:6,obj:'jammer',label:'Disable Jammer — Bridge'},
    {x:34,z:-4,obj:'hack',label:'Capture Signal Tower — Industrial'},
    {x:60,z:0,obj:'extract',label:'Extraction — Cold Zone'},
  ],
};
const CV_EVENT_POOL=[
  {id:'missilestorm',name:'MISSILE STORM',desc:'Heavy missile wave on the route',dur:24},
  {id:'blackout',name:'RADAR BLACKOUT',desc:'Enemy markers disabled',dur:16},
  {id:'haze',name:'DUST HAZE',desc:'Visibility reduced',dur:20},
  {id:'overdrive',name:'OVERDRIVE',desc:'Convoy speed surge',dur:26},
  {id:'shieldsurge',name:'SHIELD SURGE',desc:'Convoy shield boosted',dur:18},
  {id:'redalert',name:'RED ALERT',desc:'Attacker fire boosted',dur:20},
];
function _cvLoc(){ return (typeof selectedLoc!=='undefined'&&selectedLoc)||saveData.locId||'beirut'; }

// ═══════════════════════════════════════════════════════════════
//  ENTRY POINTS
// ═══════════════════════════════════════════════════════════════
// VS AI — fully local. side is your pick (alternates round 2).
function startConvoyAI(role,side){
  _cvNet=false; _cvIsHost=true;
  _cvBeginMatch({role:role||'interceptor', startSide:side||'defender'});
}
// ONLINE host — sides auto-assigned, alternate each round.
function startConvoyOnlineHost(role,playerNames){
  _cvNet=true; _cvIsHost=true;
  _cvOnlineRoster=playerNames||[];
  _cvBeginMatch({role:role||'interceptor', startSide:'defender'});
}
// ONLINE guest — receives start info from host.
function startConvoyOnlineGuest(data){
  _cvNet=true; _cvIsHost=false;
  _cvBeginMatch({role:data.role||'interceptor', startSide:data.startSide||'attacker', net:data});
}
let _cvOnlineRoster=[];

function _cvBeginMatch(opts){
  if(typeof botMatchActive!=='undefined') botMatchActive=false;
  const loc=_cvLoc(); selectedLoc=loc; saveData.locId=loc;
  if(typeof buildWorld==='function') buildWorld(loc);
  _cvRoute=(CV_ROUTES[loc]||CV_ROUTES.beirut).map(c=>Object.assign({},c));
  _cvMatch={round:1,maxRounds:2,results:[]};
  _cvPlayer={role:opts.role,side:opts.startSide,startSide:opts.startSide,
    score:0,kills:0,intercepts:0,repairs:0,convoyDmg:0,roadblocks:0,abilityCd:0,hp:200,maxHp:200};
  _cvEnded=false;
  convoyActive=true; gameActive=true; gamePaused=false; battleActive=false;
  _cvStartRound();
  _cvLoadout();
  _cvBuildHud();
  showScreen('hud');
  document.getElementById('crosshair').style.display='block';
  document.getElementById('weaponBar').style.display='flex';
  const cn=document.getElementById('clickNotice'); if(cn) cn.style.display='flex';
  document.getElementById('minimap').style.display='none';
  ['cyberBulletHud','rajpnFistHud','gadgetHud','coopLeaderboard'].forEach(id=>{const e=document.getElementById(id);if(e)e.style.display='none';});
  if(typeof updateWeaponBar==='function') updateWeaponBar();
  showNotif('CONVOY CRISIS — ROUND 1: '+(_cvPlayer.side==='defender'?'ESCORT THE CONVOY':'DESTROY THE CONVOY'));
  if(typeof sfxAlert==='function') sfxAlert();
}

function _cvLoadout(){
  const equip=(saveData.equippedWeapons&&saveData.equippedWeapons.length>=2)?saveData.equippedWeapons:['pistol','launcher'];
  weaponInventory=new Set(equip); currentWeapon=equip[0];
  weaponAmmo={}; Object.keys(WEAPONS).forEach(k=>weaponAmmo[k]=WEAPONS[k].maxAmmo);
  ammo=WEAPONS[currentWeapon].maxAmmo; isReloading=false; fireCD=0;
  const r=CV_ROLES[_cvPlayer.role];
  effectiveSpd=PLAYER_SPD*r.spd; effectiveSprint=SPRINT_SPD*r.spd;
  if(weaponMesh) camera.remove(weaponMesh);
  weaponMesh=makeWeaponMesh(); camera.add(weaponMesh);
}

// ═══════════════════════════════════════════════════════════════
//  ROUND SETUP
// ═══════════════════════════════════════════════════════════════
function _cvStartRound(){
  _cvRoundOver=false; _cvInterT=0;
  _cvObjActive=false; _cvObjT=0;
  _cvTimer=_cvRoundTime; _cvMissileTimer=4; _cvEventT=34; _cvCurEvent=null;
  _cvMissiles.forEach(m=>scene.remove(m.group)); _cvMissiles=[];
  _cvRoadblocks.forEach(r=>scene.remove(r.group)); _cvRoadblocks=[];
  _cvPlayer.hp=_cvPlayer.maxHp;
  _cvBuildConvoy();
  if(_cvIsHost){ _cvSpawnTeams(); _cvPickEvents(); }   // guest renders host's bots via cv_state
  else { _cvBots.forEach(b=>{if(b.group)scene.remove(b.group);if(b.bar)b.bar.remove();}); _cvBots=[]; }
  _cvBuildWorldHelpers();
  // player spawn relative to side
  const sp=_cvRoute[0];
  if(_cvPlayer.side==='defender'){ px=convoy.pos.x-7; pz=convoy.pos.z+3; }
  else { px=sp.x+12; pz=sp.z-9; }
  py=PLAYER_H; vx=vy=vz=0; yaw=0; pitch=0;
}

function _cvBuildConvoy(){
  if(convoy&&convoy.group) scene.remove(convoy.group);
  const g=new THREE.Group();
  g.add(_cvVehicle(0x3A4A38,2.4,2.0,5.0,true));                  // command truck
  const carrier=_cvVehicle(0x2E3A4A,2.2,1.8,4.2,false); carrier.position.z=5.6; g.add(carrier);
  const radar=_cvVehicle(0x4A3A2A,2.0,1.6,3.6,false);
  const dish=new THREE.Mesh(new THREE.CylinderGeometry(.9,.9,.12,12),new THREE.MeshLambertMaterial({color:0xCCCCCC}));
  dish.rotation.x=Math.PI/3; dish.position.set(0,1.9,0); radar.add(dish);
  radar.position.z=-5.2; g.add(radar);
  const start=_cvRoute[0];
  g.position.set(start.x-6,0,start.z); g.rotation.y=Math.PI/2;
  if(typeof addToWorld==='function') addToWorld(g); else scene.add(g);
  convoy={health:1200,maxHealth:1200,shield:350,maxShield:350,speed:3.0,progress:0,cp:0,
    disabled:false,underAttack:false,group:g,pos:new THREE.Vector3(start.x-6,0,start.z),extracted:false};
}
function _cvVehicle(col,w,h,d,cab){
  const v=new THREE.Group();
  const body=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),new THREE.MeshLambertMaterial({color:col}));
  body.position.y=h/2+.5; v.add(body);
  if(cab){ const c=new THREE.Mesh(new THREE.BoxGeometry(w*.9,h*.7,d*.32),new THREE.MeshLambertMaterial({color:0x1A2230})); c.position.set(0,h+.5,d*.3); v.add(c);
    const beac=new THREE.Mesh(new THREE.SphereGeometry(.18,8,8),new THREE.MeshBasicMaterial({color:0x44CCFF})); beac.position.set(0,h+1.0,d*.3); v.add(beac); }
  [[-w/2,d*.32],[w/2,d*.32],[-w/2,-d*.32],[w/2,-d*.32]].forEach(([x,z])=>{
    const wh=new THREE.Mesh(new THREE.CylinderGeometry(.5,.5,.4,10),new THREE.MeshLambertMaterial({color:0x0E0E10}));
    wh.rotation.z=Math.PI/2; wh.position.set(x,.5,z); v.add(wh);
  });
  return v;
}

// world helpers: objective arrow on screen + waypoint beacon beam
function _cvBuildWorldHelpers(){
  if(_cvBeacon) scene.remove(_cvBeacon);
  _cvBeacon=new THREE.Mesh(new THREE.CylinderGeometry(.4,.4,40,8),
    new THREE.MeshBasicMaterial({color:0x44CCFF,transparent:true,opacity:.22}));
  _cvBeacon.position.set(_cvRoute[0].x,20,_cvRoute[0].z);
  scene.add(_cvBeacon);
}

function _cvSpawnTeams(){
  _cvBots.forEach(b=>{if(b.group)scene.remove(b.group);if(b.bar)b.bar.remove();});
  _cvBots=[];
  const roles=['interceptor','heavy','engineer','scout'];
  // online: real players occupy slots, bots fill to 6 each. AI: 1 human slot (you).
  const humanDef=_cvPlayer.side==='defender'?1:0;
  const humanAtk=_cvPlayer.side==='attacker'?1:0;
  // in online, remote players also take slots — approximate via roster size split
  let extraDef=0,extraAtk=0;
  if(_cvNet&&_cvOnlineRoster.length){
    const half=Math.ceil(_cvOnlineRoster.length/2);
    extraDef=Math.max(0,half-humanDef);
    extraAtk=Math.max(0,(_cvOnlineRoster.length-half)-humanAtk);
  }
  for(let i=humanDef+extraDef;i<6;i++) _cvSpawnBot('defender',roles[i%4]);
  for(let i=humanAtk+extraAtk;i<6;i++) _cvSpawnBot('attacker',roles[i%4]);
}
function _cvSpawnBot(side,role){
  const isDef=side==='defender';
  const col=isDef?'#2A4A8A':'#8A2A2A', vis=isDef?'#44CCFF':'#FF4444';
  let g;
  try{ g=makeCharModel({outfitColor:col,visorColor:vis,skinTone:'#C8955A',armorStyle:role==='heavy'?'heavy':'light',helmet:true,backpack:'missile'}); }
  catch(e){ g=new THREE.Group(); const m=new THREE.Mesh(new THREE.BoxGeometry(.6,1.7,.4),new THREE.MeshLambertMaterial({color:isDef?0x2A4A8A:0x8A2A2A})); m.position.y=.85; g.add(m); }
  const base=isDef?convoy.pos.clone():new THREE.Vector3(_cvRoute[Math.min(convoy.cp+1,_cvRoute.length-1)].x,0,_cvRoute[0].z);
  const ang=Math.random()*Math.PI*2, rad=isDef?5+Math.random()*6:13+Math.random()*9;
  const pos=new THREE.Vector3(base.x+Math.cos(ang)*rad,0,base.z+Math.sin(ang)*rad);
  g.position.copy(pos); scene.add(g);
  const hp=role==='heavy'?170:role==='scout'?90:120;
  const bar=document.createElement('div'); bar.className='cv-bot-bar';
  bar.innerHTML=`<div class="cv-bot-fill ${side}" style="width:100%"></div>`;
  const hb=document.getElementById('healthBars'); if(hb) hb.appendChild(bar);
  _cvBots.push({group:g,pos,y:0,jumpVy:0,side,role,hp,maxHp:hp,weapon:['pistol','smg','shotgun','sniper'][Math.floor(Math.random()*4)],
    fireCd:1+Math.random()*1.5,strafeDir:Math.random()<.5?1:-1,strafeT:.5+Math.random()*.6,
    dead:false,bar,fill:bar.querySelector('.cv-bot-fill'),coverPt:null,state:'engage'});
}

function _cvPickEvents(){
  const pool=CV_EVENT_POOL.slice().sort(()=>Math.random()-.5);
  _cvEvents=pool.slice(0,2+Math.floor(Math.random()*2));
}
function _cvTriggerEvent(){
  if(!_cvEvents.length) return;
  _cvCurEvent=_cvEvents.shift(); _cvEventTimeLeft=_cvCurEvent.dur;
  showNotif('⚡ '+_cvCurEvent.name+' — '+_cvCurEvent.desc);
  if(typeof sfxAlert==='function') sfxAlert();
  if(_cvCurEvent.id==='shieldsurge') convoy.shield=Math.min(convoy.maxShield*1.8,convoy.shield+220);
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

// ═══════════════════════════════════════════════════════════════
//  MAIN LOOP
// ═══════════════════════════════════════════════════════════════
function updateConvoy(dt){
  if(!convoyActive||!convoy||_cvEnded) return;
  // GUEST: render-only — host owns sim; just position helpers + bars
  if(_cvNet&&!_cvIsHost){ _cvGuestUpdate(dt); return; }

  if(_cvRoundOver){ _cvInterT-=dt; if(_cvInterT<=0) _cvAdvanceRound(); _cvUpdateHud(0); return; }

  _cvTimer-=dt;
  _cvPlayer.abilityCd=Math.max(0,_cvPlayer.abilityCd-dt);
  _cvEventT-=dt;
  if(_cvEventTimeLeft>0){ _cvEventTimeLeft-=dt; if(_cvEventTimeLeft<=0) _cvEndEvent(); }
  if(_cvEventT<=0&&!_cvCurEvent&&_cvEvents.length){ _cvEventT=40+Math.random()*22; _cvTriggerEvent(); }

  _cvMoveConvoy(dt);
  if(_cvObjActive){ _cvObjT-=dt; if(_cvObjT<=0){ _cvObjActive=false; convoy.cp++;
    convoy.progress=convoy.cp/_cvRoute.length; _cvMoveBeacon();
    if(_cvPlayer.side==='defender') _cvPlayer.score+=300;
    showNotif('CHECKPOINT '+convoy.cp+'/'+_cvRoute.length+' CLEARED');
    convoy.speed=Math.min(3.6,convoy.speed+.18);
  } }

  // missiles
  _cvMissileTimer-=dt;
  const mul=_cvCurEvent?.id==='missilestorm'?.4:_cvCurEvent?.id==='redalert'?.6:1;
  if(_cvMissileTimer<=0){ _cvMissileTimer=(3.2+Math.random()*2.6)*mul; _cvSpawnMissile(); }
  _cvUpdateMissiles(dt);

  _cvUpdateBots(dt);
  _cvUpdateRoadblocks(dt);
  _cvCheckPlayerHits();
  _cvSpinBeacon(dt);

  // round resolution
  if(convoy.extracted){ _cvRoundResult('extract'); return; }
  if(convoy.health<=0){ _cvRoundResult('destroyed'); return; }
  if(_cvTimer<=0){ _cvRoundResult('timeout'); return; }

  // broadcast to guests
  if(_cvNet&&_cvIsHost){ _cvNetTimer-=dt; if(_cvNetTimer<=0){ _cvNetTimer=.1; _cvBroadcastState(); } }
  _cvUpdateHud();
}

function _cvMoveConvoy(dt){
  const wp=_cvRoute[convoy.cp];
  const blocked=_cvRoadblocks.length>0||convoy.disabled||_cvObjActive;
  if(!wp) return;
  const dx=wp.x-convoy.pos.x, dz=wp.z-convoy.pos.z, dist=Math.hypot(dx,dz);
  if(wp.obj==='extract'){
    if(blocked) return;
    if(dist>1.4){ const sp=convoy.speed*dt; convoy.pos.x+=dx/dist*sp; convoy.pos.z+=dz/dist*sp;
      convoy.group.position.set(convoy.pos.x,0,convoy.pos.z); convoy.group.rotation.y=Math.atan2(dx,dz); }
    else convoy.extracted=true;
    return;
  }
  if(blocked) return;
  if(dist>1.4){
    const slow=convoy.health<convoy.maxHealth*.4?.6:1;
    const sp=convoy.speed*slow*dt;
    convoy.pos.x+=dx/dist*sp; convoy.pos.z+=dz/dist*sp;
    convoy.group.position.set(convoy.pos.x,0,convoy.pos.z);
    convoy.group.rotation.y=Math.atan2(dx,dz);
    convoy.progress=Math.min(1,(convoy.cp+(1-dist/40))/_cvRoute.length);
  } else _cvStartObjective(wp);
}
function _cvStartObjective(wp){
  if(wp.obj==='extract'||_cvObjActive) return;
  _cvObjActive=true;
  _cvObjT={roadblock:12,defend:14,jammer:13,barrage:16,hack:13}[wp.obj]||13;
  showNotif('OBJECTIVE: '+wp.label);
  if(wp.obj==='roadblock') _cvSpawnRoadblock(wp);
  if(_cvBots.filter(b=>b.side==='attacker'&&!b.dead).length<5){ for(let i=0;i<2;i++) _cvSpawnBot('attacker','heavy'); }
}
function _cvMoveBeacon(){
  const wp=_cvRoute[Math.min(convoy.cp,_cvRoute.length-1)];
  if(_cvBeacon&&wp) _cvBeacon.position.set(wp.x,20,wp.z);
}
function _cvSpinBeacon(dt){
  if(_cvBeacon){ _cvBeacon.material.opacity=.16+Math.sin(performance.now()*.004)*.08; }
}

// ── Missiles ────────────────────────────────────────────────────
function _cvSpawnMissile(){
  const g=new THREE.Group();
  g.add(new THREE.Mesh(new THREE.CylinderGeometry(.18,.18,1.6,8),new THREE.MeshLambertMaterial({color:0x303840})));
  const nose=new THREE.Mesh(new THREE.ConeGeometry(.18,.5,8),new THREE.MeshLambertMaterial({color:0xFF5530,emissive:0xCC2200,emissiveIntensity:.6})); nose.position.y=1.05; g.add(nose);
  g.add(new THREE.PointLight(0xFF5530,1.5,12));
  const tgt=convoy.pos.clone().add(new THREE.Vector3((Math.random()-.5)*4,0,(Math.random()-.5)*6));
  const start=new THREE.Vector3(tgt.x+(Math.random()-.5)*30,55,tgt.z+(Math.random()-.5)*30);
  g.position.copy(start); scene.add(g);
  _cvMissiles.push({group:g,pos:start.clone(),target:tgt,speed:13+Math.random()*6,dead:false});
}
function _cvUpdateMissiles(dt){
  for(let i=_cvMissiles.length-1;i>=0;i--){
    const m=_cvMissiles[i];
    if(m.dead){scene.remove(m.group);_cvMissiles.splice(i,1);continue;}
    const dx=m.target.x-m.pos.x,dy=m.target.y-m.pos.y,dz=m.target.z-m.pos.z,d=Math.hypot(dx,dy,dz);
    if(d<1.6){ _cvDamageConvoy(55); spawnExplosion(m.pos.clone(),2.2,0xFF5530); triggerScreenShake(.5);
      if(typeof sfxExplosion==='function') sfxExplosion(); scene.remove(m.group); _cvMissiles.splice(i,1); continue; }
    const sp=m.speed*dt; m.pos.x+=dx/d*sp; m.pos.y+=dy/d*sp; m.pos.z+=dz/d*sp;
    m.group.position.copy(m.pos); m.group.rotation.x=Math.atan2(dz,dy);
    // defenders auto-intercept a fraction
    if(Math.random()<.18*dt*60/60){ /* handled in bots */ }
  }
}
function _cvDamageConvoy(dmg){
  convoy.underAttack=true;
  if(convoy.shield>0){ const s=Math.min(convoy.shield,dmg); convoy.shield-=s; dmg-=s; }
  if(dmg>0) convoy.health=Math.max(0,convoy.health-dmg);
}

// ── Bots (decent AI) ───────────────────────────────────────────
function _cvUpdateBots(dt){
  const pPos=new THREE.Vector3(px,0,pz);
  for(const b of _cvBots){
    if(b.dead) continue;
    const role=CV_ROLES[b.role]||CV_ROLES.interceptor;
    let goal, isAtkVsConvoy=false;
    if(b.side==='attacker'){ goal=convoy.pos; isAtkVsConvoy=true; }
    else { const e=_cvNearestEnemy(b); goal=e?e.pos:convoy.pos; }
    const dx=goal.x-b.pos.x, dz=goal.z-b.pos.z, d=Math.hypot(dx,dz)||1, nx=dx/d, nz=dz/d;
    const keep=b.side==='attacker'?11:9;
    // range + strafe
    b.strafeT-=dt; if(b.strafeT<=0){ b.strafeDir*=(Math.random()<.7?-1:1); b.strafeT=.5+Math.random()*.7; }
    let mvx=0,mvz=0;
    if(d>keep+2){ mvx+=nx; mvz+=nz; } else if(d<keep-2){ mvx-=nx; mvz-=nz; }
    mvx+=(-nz)*b.strafeDir*.85; mvz+=(nx)*b.strafeDir*.85;
    const ml=Math.hypot(mvx,mvz)||1, spd=PLAYER_SPD*.5*role.spd*dt;
    let nxp=b.pos.x+mvx/ml*spd, nzp=b.pos.z+mvz/ml*spd;
    if(Math.abs(nxp)>74) nxp=Math.sign(nxp)*74;
    if(Math.abs(nzp)>74) nzp=Math.sign(nzp)*74;
    b.pos.x=nxp; b.pos.z=nzp;
    b.jumpVy-=24*dt; b.y=Math.max(0,b.y+b.jumpVy*dt);
    if(b.y<=0&&Math.random()<.008) b.jumpVy=6;
    b.group.position.set(b.pos.x,b.y,b.pos.z); b.group.rotation.y=Math.atan2(dx,dz);
    // fire
    b.fireCd-=dt;
    if(b.fireCd<=0){
      b.fireCd=.8+Math.random()*1.2;
      if(b.side==='attacker'){
        if(d<17) _cvDamageConvoy(13);
        const e=_cvNearestEnemy(b);
        if(e&&b.pos.distanceTo(e.pos)<22) _cvDamageBot(e,18);
        else if(_cvPlayer.side==='defender'&&b.pos.distanceTo(pPos)<19&&Math.random()<.5) _cvHurtPlayer(9);
      } else {
        const e=_cvNearestEnemy(b);
        if(e&&b.pos.distanceTo(e.pos)<23) _cvDamageBot(e,20);
        else if(_cvPlayer.side==='attacker'&&b.pos.distanceTo(pPos)<19&&Math.random()<.45) _cvHurtPlayer(8);
        if(_cvMissiles.length&&Math.random()<.3){ const m=_cvMissiles[0]; m.dead=true; spawnExplosion(m.pos.clone(),1.1,0x44CCFF); }
      }
    }
    if(b.fill) b.fill.style.width=Math.max(0,Math.round(b.hp/b.maxHp*100))+'%';
    _cvBar(b);
  }
}
function _cvNearestEnemy(b){
  let best=null,bd=1e9;
  for(const o of _cvBots){ if(o.dead||o.side===b.side) continue; const d=b.pos.distanceTo(o.pos); if(d<bd){bd=d;best=o;} }
  // include the human if on the opposing side
  if(_cvPlayer.side!==b.side){ const pd=Math.hypot(px-b.pos.x,pz-b.pos.z); if(pd<bd) best={pos:new THREE.Vector3(px,0,pz),_human:true}; }
  return best;
}
function _cvDamageBot(b,dmg){ if(b.dead||b._human) return; b.hp-=dmg; if(b.hp<=0) _cvKillBot(b); }
function _cvKillBot(b){ if(b.dead) return; b.dead=true; spawnExplosion(b.pos.clone(),1.0,b.side==='attacker'?0xFF6040:0x6090FF); scene.remove(b.group); if(b.bar) b.bar.remove(); }
function _cvHurtPlayer(dmg){
  const armor=CV_ROLES[_cvPlayer.role].armor;
  _cvPlayer.hp=Math.max(0,_cvPlayer.hp-dmg/armor);
  if(typeof showDamageFlash==='function') showDamageFlash();
  if(_cvPlayer.hp<=0){ _cvPlayer.hp=_cvPlayer.maxHp; // respawn, small penalty
    const sp=_cvRoute[Math.max(0,convoy.cp)];
    if(_cvPlayer.side==='defender'){ px=convoy.pos.x-8; pz=convoy.pos.z+4; } else { px=sp.x+12; pz=sp.z-9; }
    py=PLAYER_H; vx=vy=vz=0; showNotif('RESPAWNING…'); }
}

// ── Roadblocks ─────────────────────────────────────────────────
function _cvSpawnRoadblock(wp){
  const g=new THREE.Group();
  for(let i=0;i<3;i++){ const b=new THREE.Mesh(new THREE.BoxGeometry(1.4,1.4,1.4),new THREE.MeshLambertMaterial({color:0xC2861A})); b.position.set((i-1)*1.6,.7,0); g.add(b); }
  const pos=new THREE.Vector3(wp.x+3,0,wp.z); g.position.copy(pos); scene.add(g);
  _cvRoadblocks.push({group:g,pos,hp:120});
}
function _cvUpdateRoadblocks(dt){
  const pPos=new THREE.Vector3(px,0,pz);
  const mul=_cvPlayer.role==='engineer'?2.4:1;
  for(let i=_cvRoadblocks.length-1;i>=0;i--){
    const r=_cvRoadblocks[i];
    if(_cvPlayer.side==='defender'&&r.pos.distanceTo(pPos)<5){ r.hp-=40*mul*dt; _cvPlayer.repairs+=dt*10; }
    if(r.hp<=0){ spawnExplosion(r.pos.clone(),1.4,0xFFAA30); scene.remove(r.group); _cvRoadblocks.splice(i,1);
      _cvPlayer.roadblocks++; _cvPlayer.score+=120; showNotif('ROADBLOCK CLEARED'); }
  }
}

// ── Player projectile hits ──────────────────────────────────────
function _cvCheckPlayerHits(){
  if(typeof projectiles==='undefined') return;
  for(let i=projectiles.length-1;i>=0;i--){
    const p=projectiles[i]; if(!p.pos) continue;
    // defender: intercept missiles
    if(_cvPlayer.side==='defender'){
      let done=false;
      for(const m of _cvMissiles){ if(m.dead) continue;
        if(p.pos.distanceTo(m.pos)<1.8){ m.dead=true; _cvPlayer.intercepts++; _cvPlayer.score+=80;
          spawnExplosion(m.pos.clone(),1.3,0x44CCFF); if(p.mesh) scene.remove(p.mesh); projectiles.splice(i,1); done=true; break; } }
      if(done) continue;
    }
    if(i>=projectiles.length) continue;
    const enemySide=_cvPlayer.side==='defender'?'attacker':'defender';
    let hit=false;
    for(const b of _cvBots){ if(b.dead||b.side!==enemySide) continue;
      const bp=new THREE.Vector3(b.pos.x,b.y+1,b.pos.z);
      if(p.pos.distanceTo(bp)<1.4){ _cvDamageBot(b,p.dmg||35);
        if(b.dead){ _cvPlayer.kills++; _cvPlayer.score+=100; }
        if(p.mesh) scene.remove(p.mesh); projectiles.splice(i,1); hit=true; break; } }
    if(hit) continue;
    if(_cvPlayer.side==='attacker'&&p.pos.distanceTo(convoy.pos)<3.6){
      _cvDamageConvoy(p.dmg||35); _cvPlayer.convoyDmg+=(p.dmg||35); _cvPlayer.score+=(p.dmg||35);
      if(p.mesh) scene.remove(p.mesh); projectiles.splice(i,1);
    }
  }
}

// ── Role ability (V key) ───────────────────────────────────────
function cvUseAbility(){
  if(!convoyActive||_cvPlayer.abilityCd>0||(_cvNet&&!_cvIsHost)) return;
  const r=CV_ROLES[_cvPlayer.role]; _cvPlayer.abilityCd=r.abilityCd;
  if(_cvPlayer.role==='interceptor'){ let n=0; _cvMissiles.forEach(m=>{ if(!m.dead&&n<4){m.dead=true;n++;_cvPlayer.intercepts++;spawnExplosion(m.pos.clone(),1.4,0x44CCFF);} }); showNotif('EMERGENCY INTERCEPT — '+n+' down'); }
  else if(_cvPlayer.role==='heavy'){ const es=_cvPlayer.side==='defender'?'attacker':'defender'; let n=0; _cvBots.forEach(b=>{ if(!b.dead&&b.side===es&&n<4){_cvDamageBot(b,95);n++;spawnExplosion(b.pos.clone(),1.6,0xFF6020);} }); if(_cvPlayer.side==='attacker'){_cvDamageConvoy(140);_cvPlayer.convoyDmg+=140;} triggerScreenShake(.6); showNotif('ROCKET BARRAGE'); }
  else if(_cvPlayer.role==='engineer'){ if(_cvPlayer.side==='defender'){ convoy.shield=Math.min(convoy.maxShield,convoy.shield+180); showNotif('SHIELD DEPLOYED +180'); } else { _cvSpawnRoadblock({x:convoy.pos.x+4,z:convoy.pos.z}); showNotif('ROADBLOCK DEPLOYED'); } }
  else { showNotif('RADAR PULSE — ENEMIES MARKED'); _cvBots.forEach(b=>{ if(!b.dead&&b.bar) b.bar.classList.add('cv-marked'); }); setTimeout(()=>_cvBots.forEach(b=>b.bar&&b.bar.classList.remove('cv-marked')),5000); }
  if(typeof sfxShockFire==='function') sfxShockFire();
}

// ═══════════════════════════════════════════════════════════════
//  ROUND / MATCH RESOLUTION  (escort format, side swaps round 2)
// ═══════════════════════════════════════════════════════════════
function _cvRoundResult(how){
  if(_cvRoundOver) return;
  _cvRoundOver=true; _cvInterT=4.5;
  // record how far the convoy got while THIS team defended
  const prog=how==='extract'?1.0:convoy.progress;
  const defenderTeam=_cvPlayer.side==='defender'?'you':'enemy';
  _cvMatch.results.push({round:_cvMatch.round,defender:defenderTeam,progress:prog,how});
  const youWereDef=_cvPlayer.side==='defender';
  let msg;
  if(how==='extract') msg=youWereDef?'CONVOY EXTRACTED — you held!':'CONVOY EXTRACTED — they held';
  else if(how==='destroyed') msg=youWereDef?'CONVOY DESTROYED — you fell':'CONVOY DESTROYED — you broke them!';
  else msg='TIME — convoy reached '+Math.round(prog*100)+'%';
  showNotif('ROUND '+_cvMatch.round+': '+msg);
  if(_cvNet&&_cvIsHost) _cvBroadcastRoundEnd(how,prog);
}
function _cvAdvanceRound(){
  if(_cvMatch.round>=_cvMatch.maxRounds){ _cvFinishMatch(); return; }
  _cvMatch.round++;
  // SWAP sides — superb escort format
  _cvPlayer.side=_cvPlayer.side==='defender'?'attacker':'defender';
  showNotif('ROUND '+_cvMatch.round+' — SIDES SWAP! You are now '+(_cvPlayer.side==='defender'?'DEFENDING':'ATTACKING'));
  _cvStartRound();
  _cvLoadout();
  if(typeof sfxAlert==='function') sfxAlert();
}
function _cvFinishMatch(){
  // escort scoring: compare progress in the round YOU defended vs round ENEMY defended
  const youDef=_cvMatch.results.find(r=>r.defender==='you');
  const enemyDef=_cvMatch.results.find(r=>r.defender==='enemy');
  const youProg=youDef?youDef.progress:0, enemyProg=enemyDef?enemyDef.progress:0;
  // you win if your convoy (when you defended) got further than theirs
  const won=youProg>enemyProg+0.001 || (Math.abs(youProg-enemyProg)<0.001 && Math.random()<.5);
  _cvEnd(won, youProg, enemyProg);
}
function _cvEnd(won,youProg,enemyProg){
  if(_cvEnded) return; _cvEnded=true; convoyActive=false; gameActive=false;
  if(document.pointerLockElement) document.exitPointerLock(); isLocked=false;
  _cvBots.forEach(b=>{if(b.group)scene.remove(b.group);if(b.bar)b.bar.remove();}); _cvBots=[];
  _cvMissiles.forEach(m=>scene.remove(m.group)); _cvMissiles=[];
  _cvRoadblocks.forEach(r=>scene.remove(r.group)); _cvRoadblocks=[];
  if(_cvBeacon) scene.remove(_cvBeacon);
  const h=document.getElementById('convoyHud'); if(h) h.style.display='none';
  document.getElementById('crosshair').style.display='none';
  document.getElementById('weaponBar').style.display='none';
  const credits=won?1000:400, mpxp=won?300:140;
  saveData.currency=(saveData.currency||0)+credits;
  if(typeof addMpXp==='function') addMpXp(mpxp);
  // online matches count toward progression; AI matches give XP only (no challenge/ach)
  if(_cvNet){
    if(typeof achInc==='function'){ if(won) achInc('convoyWins'); }
    if(typeof _mpChallProgress==='function'){ if(won) _mpChallProgress('convoyWins',1); _mpChallProgress('convoyDamage',Math.round(_cvPlayer.convoyDmg)); _mpChallProgress('mpIntercepts',_cvPlayer.intercepts); }
  }
  saveSave();
  _cvShowEnd(won,youProg,enemyProg,credits,mpxp);
  if(typeof sfxWaveComplete==='function'&&won) sfxWaveComplete();
}
function _cvShowEnd(won,youProg,enemyProg,credits,mpxp){
  let s=document.getElementById('convoyEndScreen');
  if(!s){ s=document.createElement('div'); s.id='convoyEndScreen'; s.className='screen'; document.body.appendChild(s); }
  const p=_cvPlayer;
  s.innerHTML=`<div class="cv-end-inner">
    <div class="cv-end-title" style="color:${won?'#4AE870':'#E84A4A'}">${won?'VICTORY':'DEFEAT'}</div>
    <div class="cv-end-sub">ESCORT RESULT · YOUR PUSH ${Math.round(youProg*100)}% vs ${Math.round(enemyProg*100)}%</div>
    <div class="cv-end-grid">
      <div class="cv-end-stat"><span>${p.score}</span><label>Objective Score</label></div>
      <div class="cv-end-stat"><span>${p.kills}</span><label>Kills</label></div>
      <div class="cv-end-stat"><span>${p.intercepts}</span><label>Intercepts</label></div>
      <div class="cv-end-stat"><span>${Math.round(p.convoyDmg)}</span><label>Convoy Damage</label></div>
      <div class="cv-end-stat"><span>${p.roadblocks}</span><label>Roadblocks</label></div>
      <div class="cv-end-stat"><span>${_cvNet?'ONLINE':'VS AI'}</span><label>Mode</label></div>
    </div>
    <div class="cv-end-rewards">+${credits} CREDITS · +${mpxp} MP XP${_cvNet?'':' · (AI — no challenge progress)'}</div>
    <button class="menu-btn btn-primary" style="margin:14px auto 0;" onclick="convoyReturnToMenu()">RETURN TO LOBBY</button>
  </div>`;
  showScreen('convoyEndScreen');
}
function convoyReturnToMenu(){
  if(convoy&&convoy.group) scene.remove(convoy.group);
  if(_cvBeacon){scene.remove(_cvBeacon);_cvBeacon=null;}
  convoy=null; convoyActive=false; _cvEnded=true;
  _cvBots.forEach(b=>{if(b.group)scene.remove(b.group);if(b.bar)b.bar.remove();}); _cvBots=[];
  if(_cvNet&&typeof mpLeaveRoom==='function'){ /* keep room teardown to caller */ }
  if(typeof clearWorld==='function') clearWorld();
  if(typeof returnToMenu==='function') returnToMenu();
  else { gameActive=false; showScreen('mainMenu'); if(typeof renderLobby==='function') renderLobby(); }
}

// ═══════════════════════════════════════════════════════════════
//  NETWORKING (host broadcasts truth; guest renders)
// ═══════════════════════════════════════════════════════════════
function _cvBroadcastState(){
  if(typeof mpConns==='undefined') return;
  const msg={type:'cv_state',
    cx:convoy.pos.x,cz:convoy.pos.z,cy:convoy.group.rotation.y,
    hp:Math.round(convoy.health),sh:Math.round(convoy.shield),cp:convoy.cp,prog:convoy.progress,
    objA:_cvObjActive,objT:Math.ceil(_cvObjT),
    ev:_cvCurEvent?_cvCurEvent.name:'',evt:Math.ceil(_cvEventTimeLeft),
    tmr:Math.ceil(_cvTimer),
    bots:_cvBots.filter(b=>!b.dead).map(b=>({x:Math.round(b.pos.x*10)/10,z:Math.round(b.pos.z*10)/10,y:Math.round(b.y*10)/10,s:b.side,h:Math.round(b.hp/b.maxHp*100)})),
    mis:_cvMissiles.filter(m=>!m.dead).map(m=>({x:Math.round(m.pos.x*10)/10,y:Math.round(m.pos.y*10)/10,z:Math.round(m.pos.z*10)/10})),
  };
  mpConns.forEach(c=>{ if(c.open) c.send(msg); });
}
function _cvBroadcastRoundEnd(how,prog){
  if(typeof mpConns==='undefined') return;
  mpConns.forEach(c=>{ if(c.open) c.send({type:'cv_round',how,prog,round:_cvMatch.round}); });
}
// guest-side state apply
let _cvGuestBots=[],_cvGuestMis=[];
function cvApplyNetState(d){
  if(!convoyActive||_cvIsHost||!convoy) return;
  convoy.pos.set(d.cx,0,d.cz); convoy.group.position.set(d.cx,0,d.cz); convoy.group.rotation.y=d.cy;
  convoy.health=d.hp; convoy.shield=d.sh; convoy.cp=d.cp; convoy.progress=d.prog;
  _cvObjActive=d.objA; _cvObjT=d.objT; _cvTimer=d.tmr;
  _cvCurEvent=d.ev?{name:d.ev}:null; _cvEventTimeLeft=d.evt;
  // reconcile bot meshes
  while(_cvGuestBots.length<d.bots.length){ const m=_cvSpawnGuestBot(); _cvGuestBots.push(m); }
  while(_cvGuestBots.length>d.bots.length){ const m=_cvGuestBots.pop(); scene.remove(m.group); if(m.bar)m.bar.remove(); }
  d.bots.forEach((bb,i)=>{ const m=_cvGuestBots[i]; if(!m) return;
    m.group.position.set(bb.x,bb.y,bb.z);
    if(m.side!==bb.s){ m.side=bb.s; } if(m.fill) m.fill.style.width=bb.h+'%';
    m.pos.set(bb.x,bb.y,bb.z); _cvBar(m); });
  while(_cvGuestMis.length<d.mis.length){ _cvGuestMis.push(_cvSpawnGuestMis()); }
  while(_cvGuestMis.length>d.mis.length){ scene.remove(_cvGuestMis.pop()); }
  d.mis.forEach((mm,i)=>{ const g=_cvGuestMis[i]; if(g) g.position.set(mm.x,mm.y,mm.z); });
}
function _cvSpawnGuestBot(){
  let g; try{ g=makeCharModel({outfitColor:'#8A2A2A',visorColor:'#FF4444',skinTone:'#C8955A',armorStyle:'light',helmet:true,backpack:'missile'}); }catch(e){ g=new THREE.Group(); }
  scene.add(g);
  const bar=document.createElement('div'); bar.className='cv-bot-bar'; bar.innerHTML='<div class="cv-bot-fill attacker" style="width:100%"></div>';
  const hb=document.getElementById('healthBars'); if(hb) hb.appendChild(bar);
  return{group:g,pos:new THREE.Vector3(),side:'attacker',bar,fill:bar.querySelector('.cv-bot-fill')};
}
function _cvSpawnGuestMis(){
  const g=new THREE.Group();
  g.add(new THREE.Mesh(new THREE.CylinderGeometry(.18,.18,1.6,8),new THREE.MeshLambertMaterial({color:0x303840})));
  const nose=new THREE.Mesh(new THREE.ConeGeometry(.18,.5,8),new THREE.MeshLambertMaterial({color:0xFF5530,emissive:0xCC2200,emissiveIntensity:.6})); nose.position.y=1.05; g.add(nose);
  scene.add(g); return g;
}
// guest deals damage → tell host
function _cvGuestSendHit(kind,amount){
  if(typeof mpConn!=='undefined'&&mpConn?.open) mpConn.send({type:'cv_hit',kind,amount});
}
// host receives guest hit
function cvHostApplyHit(d){
  if(!_cvIsHost||!convoy) return;
  if(d.kind==='convoy') _cvDamageConvoy(d.amount||20);
  else if(d.kind==='missile'&&_cvMissiles.length){ _cvMissiles[0].dead=true; }
  else if(d.kind==='bot'){ const b=_cvBots.find(x=>!x.dead); if(b) _cvDamageBot(b,d.amount||30); }
}
// guest-side projectile detection → relay hits to host
function _cvGuestUpdate(dt){
  _cvSpinBeacon(dt);
  if(typeof projectiles==='undefined') return;
  for(let i=projectiles.length-1;i>=0;i--){
    const p=projectiles[i]; if(!p.pos) continue;
    if(_cvPlayer.side==='attacker'&&convoy&&p.pos.distanceTo(convoy.pos)<3.6){
      _cvGuestSendHit('convoy',p.dmg||35); if(p.mesh) scene.remove(p.mesh); projectiles.splice(i,1); continue;
    }
    if(_cvPlayer.side==='defender'){
      for(const g of _cvGuestMis){ if(p.pos.distanceTo(g.position)<1.8){ _cvGuestSendHit('missile',1); if(p.mesh) scene.remove(p.mesh); projectiles.splice(i,1); break; } }
    }
  }
  _cvUpdateHud();
}
function cvApplyRoundEnd(d){
  if(_cvIsHost) return;
  _cvPlayer.side=_cvPlayer.side==='defender'?'attacker':'defender';
  showNotif('ROUND '+(d.round||'')+' — SIDES SWAP');
}

// ── HUD (+ directional objective arrow) ────────────────────────
function _cvBuildHud(){
  let h=document.getElementById('convoyHud');
  if(!h){ h=document.createElement('div'); h.id='convoyHud'; document.body.appendChild(h); }
  h.style.display='block';
  h.innerHTML=`
    <div class="cv-top">
      <span class="cv-team ${_cvPlayer.side==='attacker'?'on':''}">ATTACK</span>
      <div class="cv-center">
        <div class="cv-hpwrap"><div class="cv-hplabel">CONVOY</div>
          <div class="cv-hpbar"><div id="cvHpFill" class="cv-hpfill"></div><div id="cvShFill" class="cv-shfill"></div></div></div>
        <div id="cvCheckpoint" class="cv-cp">CHECKPOINT 1/5</div>
      </div>
      <span class="cv-team ${_cvPlayer.side==='defender'?'on':''}">DEFEND</span>
    </div>
    <div id="cvObjLine" class="cv-obj"></div>
    <div id="cvEventLine" class="cv-event"></div>
    <div class="cv-role">RD <span id="cvRoundN">1</span>/2 · ${CV_ROLES[_cvPlayer.role].icon} ${CV_ROLES[_cvPlayer.role].name} · <span id="cvAbility">[V] ABILITY</span> · <span id="cvTmr"></span></div>
    <div id="cvArrow" class="cv-arrow">▲</div>`;
}
function _cvUpdateHud(){
  if(!convoy) return;
  const hp=document.getElementById('cvHpFill'); if(hp) hp.style.width=Math.max(0,convoy.health/convoy.maxHealth*100)+'%';
  const sh=document.getElementById('cvShFill'); if(sh) sh.style.width=Math.max(0,convoy.shield/convoy.maxShield*100)+'%';
  const cp=document.getElementById('cvCheckpoint'); if(cp) cp.textContent='CHECKPOINT '+(convoy.cp+1)+'/'+_cvRoute.length;
  const ob=document.getElementById('cvObjLine'); if(ob){ const wp=_cvRoute[convoy.cp]; ob.textContent=_cvObjActive?('▶ '+(wp?wp.label:'')+' ('+Math.ceil(_cvObjT)+'s)'):(wp?wp.label:''); }
  const ev=document.getElementById('cvEventLine'); if(ev) ev.textContent=_cvCurEvent?('⚡ '+_cvCurEvent.name+(_cvEventTimeLeft?'  '+Math.ceil(_cvEventTimeLeft)+'s':'')):'';
  const ab=document.getElementById('cvAbility'); if(ab) ab.textContent=_cvPlayer.abilityCd>0?('['+Math.ceil(_cvPlayer.abilityCd)+'s]'):'[V] READY';
  const rn=document.getElementById('cvRoundN'); if(rn&&_cvMatch) rn.textContent=_cvMatch.round;
  const tm=document.getElementById('cvTmr'); if(tm) tm.textContent=Math.max(0,Math.floor(_cvTimer/60))+':'+String(Math.max(0,Math.floor(_cvTimer%60))).padStart(2,'0');
  _cvUpdateArrow();
}
function _cvUpdateArrow(){
  const a=document.getElementById('cvArrow'); if(!a||!convoy||typeof camera==='undefined') return;
  // point toward convoy (defender) or current waypoint (attacker)
  const tgt=convoy.pos;
  const dx=tgt.x-px, dz=tgt.z-pz;
  const camDir=Math.atan2(-Math.sin(yaw),-Math.cos(yaw));
  const ang=Math.atan2(dx,dz)-yaw;
  const dist=Math.hypot(dx,dz);
  if(dist<6){ a.style.display='none'; return; }
  a.style.display='block';
  a.style.transform='translateX(-50%) rotate('+(ang)+'rad)';
}
function _cvBar(b){
  if(!b.bar||typeof camera==='undefined') return;
  const v=new THREE.Vector3(b.pos.x,(b.y||0)+2.0,b.pos.z).project(camera);
  if(v.z>1){b.bar.style.display='none';return;}
  b.bar.style.display='block';
  b.bar.style.left=((v.x*.5+.5)*window.innerWidth)+'px';
  b.bar.style.top=((-v.y*.5+.5)*window.innerHeight)+'px';
}
