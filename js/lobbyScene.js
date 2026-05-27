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
  _lobScene.add(new THREE.AmbientLight(0xffffff,.52));
  const dl=new THREE.DirectionalLight(0xffffff,.9);dl.position.set(3,8,5);_lobScene.add(dl);
  const fl=new THREE.DirectionalLight(0x4466bb,.22);fl.position.set(-3,2,-4);_lobScene.add(fl);
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
    s.group.position.y=Math.sin(_lobT*1.3+i*1.1)*0.028;
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

  // Glow ring — green when ready
  const glowMat=new THREE.MeshLambertMaterial({
    color:slot.ready?0x00AA44:0x141C28,
    emissive:slot.ready?new THREE.Color(0x004418):new THREE.Color(0x000000),
    emissiveIntensity:slot.ready?.55:0
  });
  const glow=new THREE.Mesh(new THREE.CylinderGeometry(.56,.56,.022,32),glowMat);
  glow.position.set(x,-.01,0);_lobScene.add(glow);

  // Platform disc
  const platMat=new THREE.MeshLambertMaterial({color:0x111820});
  const platform=new THREE.Mesh(new THREE.CylinderGeometry(.44,.44,.04,24),platMat);
  platform.position.set(x,0,0);_lobScene.add(platform);

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
  _lobChars.push({group:charGrp,platform,glow});
}

function updateLobbyScene(){
  if(!document.getElementById('lobbyStageCanvas')) return;
  if(!_lobR) initLobbyScene();
  if(!_lobScene) return;
  _lobChars.forEach(s=>{
    if(s?.group)    _lobScene.remove(s.group);
    if(s?.platform) _lobScene.remove(s.platform);
    if(s?.glow)     _lobScene.remove(s.glow);
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
  const winMat=new THREE.MeshLambertMaterial({color:0xFFCC44,emissive:new THREE.Color(0xFFAA00),emissiveIntensity:.45});
  const bldDefs=[
    [-7, -5,  2.0, 3.6, 1.8, 0x3A3228],
    [-4.5,-4.5,1.8, 2.4, 1.6, 0x464038],
    [-2,  -5.5,1.4, 5.0, 1.4, 0x504840],
    [1.5, -4.2,2.0, 3.2, 1.6, 0x403830],
    [3.8, -5,  2.4, 4.2, 1.8, 0x383028],
    [6.5, -4.5,1.8, 2.8, 1.6, 0x3C3428],
  ];
  bldDefs.forEach(([x,z,w,h,d,col])=>{
    const mat=new THREE.MeshLambertMaterial({color:col});
    const mesh=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat);
    mesh.position.set(x,h/2,z);
    _lobScene.add(mesh); _lobEnvObjs.push(mesh);
    const floors=Math.floor(h/1.5);
    for(let f=1;f<floors;f++){
      const ww=new THREE.Mesh(new THREE.BoxGeometry(w*.65,.18,.06),winMat);
      ww.position.set(x,f*1.5+.4,z+d/2+.04);
      _lobScene.add(ww); _lobEnvObjs.push(ww);
    }
  });
  const pl=new THREE.PointLight(0xFF9944,.7,20);
  pl.position.set(0,4,-4);
  _lobScene.add(pl); _lobEnvObjs.push(pl);
}

function _buildSwedenLobEnv(){
  const trunkMat=new THREE.MeshLambertMaterial({color:0x5A3A1A});
  const leafMat=new THREE.MeshLambertMaterial({color:0x2A6B3A});
  const snowMat=new THREE.MeshLambertMaterial({color:0xECF2F8});
  const treeXZ=[[-7,-4.5],[-5,-5],[-3,-4.2],[-1,-5.5],[1.5,-4],[4,-5.2],[6.5,-4.5]];
  treeXZ.forEach(([x,z])=>{
    const g=new THREE.Group();
    const tr=new THREE.Mesh(new THREE.CylinderGeometry(.07,.12,1.1,5),trunkMat);
    tr.position.y=.55; g.add(tr);
    [[.32,0],[.22,1],[.14,2]].forEach(([r,t])=>{
      const cone=new THREE.Mesh(new THREE.ConeGeometry(r,r*1.4,6),leafMat);
      cone.position.y=1.1+t*r; g.add(cone);
    });
    const sc=new THREE.Mesh(new THREE.ConeGeometry(.1,.45,6),snowMat);
    sc.position.y=1.1+2*.14+.28; g.add(sc);
    g.position.set(x,0,z);
    _lobScene.add(g); _lobEnvObjs.push(g);
  });
  const snowFloor=new THREE.Mesh(new THREE.PlaneGeometry(26,11),snowMat);
  snowFloor.rotation.x=-Math.PI/2; snowFloor.position.set(0,.005,-1.5);
  _lobScene.add(snowFloor); _lobEnvObjs.push(snowFloor);
  const pl=new THREE.PointLight(0x8899CC,.55,22);
  pl.position.set(0,5,-4);
  _lobScene.add(pl); _lobEnvObjs.push(pl);
}

function _buildDubaiLobEnv(){
  const towerDefs=[
    [-7,  -6,  1.4, 8,  0x88AACC],
    [-4.2,-5.5, 1.2, 13, 0x99BBDD],
    [0,   -7,  1.6, 18, 0xAABBCC],
    [3.5, -5.5, 1.2, 11, 0x99AACC],
    [6.5, -6,  1.4, 8,  0x8899BB],
  ];
  towerDefs.forEach(([x,z,w,h,col])=>{
    const mat=new THREE.MeshLambertMaterial({color:col,emissive:new THREE.Color(0x001133),emissiveIntensity:.18});
    const mesh=new THREE.Mesh(new THREE.BoxGeometry(w,h,w),mat);
    mesh.position.set(x,h/2,z);
    _lobScene.add(mesh); _lobEnvObjs.push(mesh);
    const sp=new THREE.Mesh(new THREE.ConeGeometry(w*.16,h*.22,4),mat);
    sp.position.set(x,h+h*.11,z);
    _lobScene.add(sp); _lobEnvObjs.push(sp);
  });
  const sandMat=new THREE.MeshLambertMaterial({color:0xC8A86A});
  [[-5,-3.2],[3,-3.6],[-1,-2.6],[5.5,-3]].forEach(([x,z])=>{
    const d=new THREE.Mesh(new THREE.ConeGeometry(1.4,.38,8),sandMat);
    d.position.set(x,.19,z);
    _lobScene.add(d); _lobEnvObjs.push(d);
  });
  const pl=new THREE.PointLight(0xFFBB66,.9,24);
  pl.position.set(2,6,-4);
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
