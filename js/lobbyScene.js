'use strict';
// ═══════════════════════════════════════════════════════════════
//  LOBBY 3D CHARACTER STAGE
// ═══════════════════════════════════════════════════════════════
let _lobR=null,_lobScene=null,_lobCam=null,_lobAnimId=null;
let _lobChars=[];
let _lobEnvObjs=[];
let _lobT=0;
const _partyProfiles={};

function _slotXs(n){
  const sets=[[0],[-1.6,1.6],[-2.4,0,2.4],[-3.1,-1.05,1.05,3.1]];
  return sets[Math.max(0,Math.min(n-1,3))];
}

function initLobbyScene(){
  const canvas=document.getElementById('lobbyStageCanvas');
  if(!canvas||_lobR) return;
  const W=canvas.clientWidth||700,H=canvas.clientHeight||280;
  _lobR=new THREE.WebGLRenderer({canvas,antialias:true,alpha:false});
  _lobR.setSize(W,H);
  _lobR.setPixelRatio(Math.min(window.devicePixelRatio,2));
  _lobScene=new THREE.Scene();
  _lobCam=new THREE.PerspectiveCamera(46,W/H,.1,80);
  _lobCam.position.set(0,2.2,8.4);
  _lobCam.lookAt(0,1.1,0);
  _lobScene.add(new THREE.AmbientLight(0xffffff,.48));
  // Key light warm, fill cool, rim from behind for silhouette pop
  const dl=new THREE.DirectionalLight(0xFFF2E0,.95);dl.position.set(3,8,5);_lobScene.add(dl);
  const fl=new THREE.DirectionalLight(0x4466bb,.25);fl.position.set(-3,2,-4);_lobScene.add(fl);
  const rim=new THREE.DirectionalLight(0x8AB8E8,.55);rim.position.set(0,4,-8);_lobScene.add(rim);
  const gr=new THREE.Mesh(new THREE.PlaneGeometry(28,14),new THREE.MeshLambertMaterial({color:0x0D1018}));
  gr.rotation.x=-Math.PI/2;gr.name='lobGround';_lobScene.add(gr);
  _lobScene.fog=new THREE.Fog(0x0A0E14,14,30);
  new ResizeObserver(()=>{
    const c=document.getElementById('lobbyStageCanvas');
    if(!c||!_lobR) return;
    const W=c.clientWidth,H=c.clientHeight;
    if(W<10||H<10) return;
    _lobR.setSize(W,H);_lobCam.aspect=W/H;_lobCam.updateProjectionMatrix();
  }).observe(canvas);
  _lobLoop();
}

function _lobLoop(){
  _lobAnimId=requestAnimationFrame(_lobLoop);
  if(!_lobScene||!_lobR||!_lobCam) return;
  _lobT+=0.016;
  _lobChars.forEach((s,i)=>{
    if(!s?.group) return;
    s.group.position.y=.11+Math.sin(_lobT*1.3+i*1.1)*0.028;
    s.group.rotation.y=Math.sin(_lobT*0.45+i*1.3)*0.05;
  });
  _lobR.render(_lobScene,_lobCam);
}

function _setLobStageMap(locId){
  if(!_lobScene) return;
  const bg={beirut:0x0C0A06,sweden:0x060A12,dubai:0x0E0A06};
  const gc={beirut:0x161208,sweden:0x0A0E18,dubai:0x181208};
  const c=bg[locId]||bg.beirut;
  _lobScene.background=new THREE.Color(c);
  if(_lobScene.fog) _lobScene.fog.color.set(c);
  _lobScene.children.filter(o=>o.name==='lobGround')
    .forEach(o=>o.material.color.set(gc[locId]||gc.beirut));
  _buildLobbyEnv(locId);
}

function _defaultCusto(){
  return{outfitColor:'#2A4A2A',visorColor:'#00FF99',skinTone:'#E8C49A',
         armorStyle:'standard',helmet:true,backpack:'none'};
}

function _esc(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;');}

function _buildLobSlots(){
  // MP waiting room takes priority over Firebase party
  if(typeof _mpOverrideSlots!=='undefined'&&_mpOverrideSlots) return _mpOverrideSlots;
  const myUid=_fbUser?.uid;
  const party=socialState.party;
  if(!party){
    return [{uid:myUid,username:mpUser?.username||'RICHARD',
      custo:saveData.customization,ready:false,isHost:true,isSelf:true,
      level:saveData.level||1}];
  }
  const members=party.members||[];
  const out=[];
  const meSrc=members.find(m=>m.uid===myUid);
  out.push({uid:myUid,username:mpUser?.username||'RICHARD',
    custo:saveData.customization,ready:meSrc?.ready||false,
    isHost:party.hostUid===myUid,isSelf:true,level:saveData.level||1});
  members.filter(m=>m.uid!==myUid).forEach(m=>{
    const p=_partyProfiles[m.uid];
    out.push({uid:m.uid,username:m.username||'?',custo:p?.custo||_defaultCusto(),
      ready:m.ready||false,isHost:party.hostUid===m.uid,isSelf:false,
      level:p?.level||1,loading:!p});
  });
  return out;
}

function _addLobChar(slot,x,idx,total,scale){
  const charGrp=makeCharModel(slot.custo);
  charGrp.position.set(x,0,0);
  charGrp.scale.setScalar(scale);
  _lobScene.add(charGrp);

  // Glow ring — green when ready, amber idle edge
  const glowMat=new THREE.MeshLambertMaterial({
    color:slot.ready?0x00AA44:0x2A3242,
    emissive:slot.ready?new THREE.Color(0x00642A):new THREE.Color(0x18202E),
    emissiveIntensity:slot.ready?.65:.35
  });
  const glow=new THREE.Mesh(new THREE.CylinderGeometry(.56,.56,.022,32),glowMat);
  glow.position.set(x,-.01,0);_lobScene.add(glow);

  // Platform: beveled pedestal + dark top + emissive edge ring
  const pedMat=new THREE.MeshLambertMaterial({color:0x161C26});
  const ped=new THREE.Mesh(new THREE.CylinderGeometry(.46,.52,.09,24),pedMat);
  ped.position.set(x,.045,0);_lobScene.add(ped);
  const topMat=new THREE.MeshLambertMaterial({color:0x0E1218});
  const platform=new THREE.Mesh(new THREE.CylinderGeometry(.42,.42,.025,24),topMat);
  platform.position.set(x,.10,0);_lobScene.add(platform);
  const edgeMat=new THREE.MeshLambertMaterial({color:0x3A4A66,emissive:new THREE.Color(0x2A3A56),emissiveIntensity:.5});
  const edge=new THREE.Mesh(new THREE.TorusGeometry(.44,.012,6,32),edgeMat);
  edge.rotation.x=Math.PI/2;edge.position.set(x,.105,0);_lobScene.add(edge);

  // HTML label
  const lc=document.getElementById('lobbyStageLabels');
  if(lc){
    const lbl=document.createElement('div');
    lbl.className='lob-char-lbl';
    lbl.innerHTML=`
      <div class="lcl-name">${slot.isHost?'<span class="lcl-crown">♛</span>':''} ${slot.loading?'<span class="lcl-spin">…</span>':_esc(slot.username)}</div>
      <div class="lcl-lv">LVL ${slot.level}</div>
      <div class="lcl-rdy ${slot.ready?'is-rdy':'no-rdy'}">${slot.ready?'✓ READY':'NOT READY'}</div>`;
    lc.appendChild(lbl);
  }
  _lobChars.push({group:charGrp,platform,glow,ped,edge});
}

function updateLobbyScene(){
  if(!document.getElementById('lobbyStageCanvas')) return;
  if(!_lobR) initLobbyScene();
  if(!_lobScene) return;
  _lobChars.forEach(s=>{
    if(s?.group)    _lobScene.remove(s.group);
    if(s?.platform) _lobScene.remove(s.platform);
    if(s?.glow)     _lobScene.remove(s.glow);
    if(s?.ped)      _lobScene.remove(s.ped);
    if(s?.edge)     _lobScene.remove(s.edge);
  });
  _lobChars=[];
  const lc=document.getElementById('lobbyStageLabels');
  if(lc) lc.innerHTML='';
  _setLobStageMap((socialState.party?.selectedMap)||saveData.locId||'beirut');
  const slots=_buildLobSlots();
  const xs=_slotXs(slots.length);
  const scale=slots.length<=2?1.0:slots.length===3?.88:.78;
  slots.forEach((sl,i)=>_addLobChar(sl,xs[i],i,slots.length,scale));
}

// ─────────────────────────────────────────────────────────────────
//  FIREBASE PROFILE FETCH
// ─────────────────────────────────────────────────────────────────
async function fetchPartyMemberProfile(uid){
  if(!uid||!_fbUser||!_fbDb) return null;
  try{
    const snap=await _fbDb.collection('users').doc(uid).get();
    if(snap.exists){
      const d=snap.data();
      _partyProfiles[uid]={custo:d.customization||_defaultCusto(),level:d.level||1};
    }
  }catch(e){console.warn('lobbyProfile',uid,e);}
  return _partyProfiles[uid]||null;
}

async function syncPartyProfiles(){
  const party=socialState.party;
  if(!party){ updateLobbyScene(); return; }
  const myUid=_fbUser?.uid;
  const others=(party.members||[]).filter(m=>m.uid!==myUid&&!_partyProfiles[m.uid]);
  if(others.length===0){ updateLobbyScene(); return; }
  updateLobbyScene(); // show loading placeholders immediately
  await Promise.all(others.map(m=>fetchPartyMemberProfile(m.uid)));
  updateLobbyScene(); // refresh with real profiles
}

// Write local customization to Firestore so party members can see it
function saveCustomizationToFirebase(){
  if(!_fbUser||!_fbDb) return;
  _fbDb.collection('users').doc(_fbUser.uid).set(
    {customization:saveData.customization},{merge:true}
  ).catch(()=>{});
}

// ─────────────────────────────────────────────────────────────────
//  LOBBY MAP ENVIRONMENT
// ─────────────────────────────────────────────────────────────────
function _clearLobEnv(){
  _lobEnvObjs.forEach(o=>{ if(_lobScene) _lobScene.remove(o); });
  _lobEnvObjs=[];
}

function _buildLobbyEnv(locId){
  _clearLobEnv();
  if(locId==='sweden') _buildSwedenLobEnv();
  else if(locId==='dubai') _buildDubaiLobEnv();
  else _buildBeirutLobEnv();
}

function _buildBeirutLobEnv(){
  const winMat=new THREE.MeshLambertMaterial({color:0xFFCC44,emissive:new THREE.Color(0xFFAA00),emissiveIntensity:.55});
  const tankMat=new THREE.MeshLambertMaterial({color:0x3A3228});
  const parMat=new THREE.MeshLambertMaterial({color:0x6A5E50});
  // Dense Mediterranean apartment cluster — tan/ochre stone, varied heights
  [
    [-8.5,-5.2, 2.2,4.4,1.8, 0x5A4E3C],
    [-6.0,-4.6, 1.8,6.8,1.5, 0x50463A],
    [-3.5,-5.6, 2.4,3.8,2.0, 0x5C5044],
    [-1.0,-4.8, 2.0,7.6,1.6, 0x483E34],
    [1.8, -5.4, 2.2,5.0,1.9, 0x544840],
    [4.5, -4.6, 1.8,8.2,1.5, 0x4E4438],
    [7.0, -5.2, 2.4,4.2,2.0, 0x5A4E3E],
    [9.5, -4.8, 1.8,5.8,1.6, 0x484038],
  ].forEach(([x,z,w,h,d,col])=>{
    const mat=new THREE.MeshLambertMaterial({color:col});
    const bld=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat);
    bld.position.set(x,h/2,z);
    _lobScene.add(bld); _lobEnvObjs.push(bld);
    // Rooftop parapet
    const par=new THREE.Mesh(new THREE.BoxGeometry(w+.12,.3,d+.12),parMat);
    par.position.set(x,h+.15,z);
    _lobScene.add(par); _lobEnvObjs.push(par);
    // Window strips per floor
    const floors=Math.max(1,Math.floor(h/1.28));
    for(let f=0;f<floors;f++){
      const ww=new THREE.Mesh(new THREE.BoxGeometry(w*.7,.2,.05),winMat);
      ww.position.set(x,.65+f*1.28,z+d/2+.03);
      _lobScene.add(ww); _lobEnvObjs.push(ww);
    }
    // Water tank on taller buildings
    if(h>5){
      const tank=new THREE.Mesh(new THREE.CylinderGeometry(.22,.22,.55,8),tankMat);
      tank.position.set(x+w*.22,h+.43,z);
      _lobScene.add(tank); _lobEnvObjs.push(tank);
    }
  });
  // Warm stone ground
  const gndMat=new THREE.MeshLambertMaterial({color:0x8A7860});
  const gnd=new THREE.Mesh(new THREE.PlaneGeometry(40,18),gndMat);
  gnd.rotation.x=-Math.PI/2; gnd.position.set(0,.002,-1.5);
  _lobScene.add(gnd); _lobEnvObjs.push(gnd);
  const pl=new THREE.PointLight(0xFF9944,.9,30);
  pl.position.set(0,5,-4);
  _lobScene.add(pl); _lobEnvObjs.push(pl);
}

function _buildSwedenLobEnv(){
  const trunkMat=new THREE.MeshLambertMaterial({color:0x5A3A1A});
  const leafMat=new THREE.MeshLambertMaterial({color:0x1E5A2A});
  const snowMat=new THREE.MeshLambertMaterial({color:0xDDE6EC});
  const roofMat=new THREE.MeshLambertMaterial({color:0x7A3A2A});
  const winMat=new THREE.MeshLambertMaterial({color:0xFFDD88,emissive:new THREE.Color(0xFFAA33),emissiveIntensity:.45});
  // Nordic stone buildings with pitched roofs + snow
  [
    [-8.5,-5.5, 2.4,3.2,2.0, 0x5E5A54],
    [-5.5,-5.0, 1.8,4.8,1.6, 0x4E4A44],
    [-2.5,-5.8, 2.6,2.8,2.2, 0x5A5650],
    [0.8, -5.2, 2.0,6.0,1.8, 0x484440],
    [4.0, -5.6, 2.4,3.8,2.0, 0x545048],
    [7.0, -5.0, 1.8,5.2,1.6, 0x4E4A44],
    [10.0,-5.5, 2.2,3.0,1.8, 0x585450],
  ].forEach(([x,z,w,h,d,col])=>{
    const mat=new THREE.MeshLambertMaterial({color:col});
    const bld=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat);
    bld.position.set(x,h/2,z);
    _lobScene.add(bld); _lobEnvObjs.push(bld);
    // Pitched roof (cone scaled to box footprint)
    const roof=new THREE.Mesh(new THREE.ConeGeometry(w*.62,h*.24,4),roofMat);
    roof.scale.set(1,.72,d/(w*.62*2)*1.05);
    roof.rotation.y=Math.PI/4;
    roof.position.set(x,h+h*.24*.72*.5,z);
    _lobScene.add(roof); _lobEnvObjs.push(roof);
    // Snow lip on roof edge
    const snowLip=new THREE.Mesh(new THREE.BoxGeometry(w+.16,.1,d+.16),snowMat);
    snowLip.position.set(x,h+.05,z);
    _lobScene.add(snowLip); _lobEnvObjs.push(snowLip);
    // Lit window strips
    const floors=Math.max(1,Math.floor(h/1.4));
    for(let f=0;f<floors;f++){
      const ww=new THREE.Mesh(new THREE.BoxGeometry(w*.65,.18,.05),winMat);
      ww.position.set(x,.7+f*1.35,z+d/2+.03);
      _lobScene.add(ww); _lobEnvObjs.push(ww);
    }
  });
  // Pine trees flanking buildings
  [[-10.5,-4.5],[-9,-5.8],[11.5,-4.8],[12.5,-5.5],[-11.8,-3.8],[13,-3.5]].forEach(([x,z])=>{
    const g=new THREE.Group();
    const tr=new THREE.Mesh(new THREE.CylinderGeometry(.07,.13,1.2,5),trunkMat);
    tr.position.y=.6; g.add(tr);
    [[.36,0],[.24,1],[.15,2]].forEach(([r,t])=>{
      const cone=new THREE.Mesh(new THREE.ConeGeometry(r,r*1.5,6),leafMat);
      cone.position.y=1.2+t*r*1.3; g.add(cone);
      const sc=new THREE.Mesh(new THREE.ConeGeometry(r*.52,.38,6),snowMat);
      sc.position.y=cone.position.y+r*.55; g.add(sc);
    });
    g.position.set(x,0,z);
    _lobScene.add(g); _lobEnvObjs.push(g);
  });
  // Snow ground
  const snowFloor=new THREE.Mesh(new THREE.PlaneGeometry(42,18),snowMat);
  snowFloor.rotation.x=-Math.PI/2; snowFloor.position.set(0,.005,-1.5);
  _lobScene.add(snowFloor); _lobEnvObjs.push(snowFloor);
  // Snow piles at base
  [[-9.2,-4.8],[10.5,-5.2],[0.5,-2.8],[-4,-2.5],[5,-3.2]].forEach(([x,z])=>{
    const pile=new THREE.Mesh(new THREE.SphereGeometry(.7,6,4),snowMat);
    pile.scale.y=.32; pile.position.set(x,.02,z);
    _lobScene.add(pile); _lobEnvObjs.push(pile);
  });
  const pl=new THREE.PointLight(0x8899CC,.6,30);
  pl.position.set(0,6,-4);
  _lobScene.add(pl); _lobEnvObjs.push(pl);
}

function _buildDubaiLobEnv(){
  const bandMat=new THREE.MeshLambertMaterial({color:0x335577});
  // Glass tower cluster — mirror the ingame Dubai map silhouette
  [
    [-9.0,-6.2, 1.4, 7,  0x88AACC],
    [-6.5,-5.6, 1.2,14,  0x99BBDD],
    [-3.5,-6.5, 1.8,10,  0x8AAABB],
    [-0.5,-5.8, 1.6,24,  0xAABBCC],  // central landmark tower
    [2.5, -6.2, 1.4,16,  0x8899BB],
    [5.5, -5.6, 1.2,11,  0x99AACC],
    [8.5, -6.0, 1.5, 8,  0x8AABBB],
    [11.0,-5.8, 1.2,13,  0x7898AA],
  ].forEach(([x,z,w,h,col])=>{
    const mat=new THREE.MeshLambertMaterial({color:col,emissive:new THREE.Color(0x001133),emissiveIntensity:.22});
    const bld=new THREE.Mesh(new THREE.BoxGeometry(w,h,w),mat);
    bld.position.set(x,h/2,z);
    _lobScene.add(bld); _lobEnvObjs.push(bld);
    // Horizontal glass bands every 3 units
    for(let fy=2;fy<h;fy+=3){
      const band=new THREE.Mesh(new THREE.BoxGeometry(w+.18,.09,w+.18),bandMat);
      band.position.set(x,fy,z);
      _lobScene.add(band); _lobEnvObjs.push(band);
    }
    // Spire
    const sp=new THREE.Mesh(new THREE.ConeGeometry(w*.15,h*.26,4),mat);
    sp.position.set(x,h+h*.13,z);
    _lobScene.add(sp); _lobEnvObjs.push(sp);
    // Lit window rows
    const winM=new THREE.MeshLambertMaterial({color:0x88CCFF,emissive:new THREE.Color(0x4488CC),emissiveIntensity:.3,transparent:true,opacity:.85});
    const floors=Math.floor(h/1.5);
    for(let f=1;f<floors;f+=2){
      const ww=new THREE.Mesh(new THREE.BoxGeometry(w*.72,.26,.04),winM);
      ww.position.set(x,.8+f*1.5,z+w*.5+.04);
      _lobScene.add(ww); _lobEnvObjs.push(ww);
    }
  });
  // Sand ground
  const sandMat=new THREE.MeshLambertMaterial({color:0xC8A870});
  const gnd=new THREE.Mesh(new THREE.PlaneGeometry(44,18),sandMat);
  gnd.rotation.x=-Math.PI/2; gnd.position.set(0,.002,-1.5);
  _lobScene.add(gnd); _lobEnvObjs.push(gnd);
  // Sand dune mounds
  [[-10,-3.5],[9.5,-3.2],[0,-2.0],[5,-3.8],[-5,-2.8]].forEach(([x,z])=>{
    const d=new THREE.Mesh(new THREE.SphereGeometry(1.0+Math.random()*.4,8,5),sandMat);
    d.scale.y=.28; d.position.set(x,.05,z);
    _lobScene.add(d); _lobEnvObjs.push(d);
  });
  // Palm trees near edges
  const palmTrunk=new THREE.MeshLambertMaterial({color:0x8A6A3A});
  const frondMat=new THREE.MeshLambertMaterial({color:0x3A6A28});
  [[-8,-2.5],[10,-2.8]].forEach(([x,z])=>{
    const g=new THREE.Group();
    const tr=new THREE.Mesh(new THREE.CylinderGeometry(.1,.16,3.8,6),palmTrunk);
    tr.position.y=1.9; g.add(tr);
    for(let i=0;i<7;i++){
      const fa=i/7*Math.PI*2;
      const f=new THREE.Mesh(new THREE.BoxGeometry(.1,.05,2.0),frondMat);
      f.position.set(Math.cos(fa)*.3,3.8,Math.sin(fa)*.3);
      f.rotation.set(.5,fa,0); g.add(f);
    }
    g.position.set(x,0,z);
    _lobScene.add(g); _lobEnvObjs.push(g);
  });
  const pl=new THREE.PointLight(0xFFBB55,1.0,32);
  pl.position.set(2,8,-4);
  _lobScene.add(pl); _lobEnvObjs.push(pl);
}

// ─────────────────────────────────────────────────────────────────
//  DEPLOY TRANSITION OVERLAY
// ─────────────────────────────────────────────────────────────────
function showDeployOverlay(locId,mode,partySize,onDone){
  if(document.getElementById('deployOverlay')){ onDone(); return; }
  const locNames={beirut:'BEIRUT',sweden:'SWEDEN',dubai:'DUBAI'};
  const ov=document.createElement('div');
  ov.id='deployOverlay';
  ov.innerHTML=`<div class="deploy-inner">
    <div class="deploy-title">DEPLOYING TO ${locNames[locId]||locId.toUpperCase()}</div>
    <div class="deploy-sub">MODE: ${(mode||'SOLO').toUpperCase()} DEFENSE</div>
    ${partySize>1?`<div class="deploy-squad">SQUAD: ${partySize} OPERATORS</div>`:''}
    <div class="deploy-loader"><div class="deploy-bar"></div></div>
  </div>`;
  document.body.appendChild(ov);
  requestAnimationFrame(()=>ov.classList.add('visible'));
  setTimeout(()=>{ov.remove();onDone();},1800);
}
