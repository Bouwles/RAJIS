'use strict';
// ═══════════════════════════════════════════════════════════════
//  LOBBY 3D CHARACTER STAGE
// ═══════════════════════════════════════════════════════════════
let _lobR=null,_lobScene=null,_lobCam=null,_lobAnimId=null;
let _lobChars=[];
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
}

function _defaultCusto(){
  return{outfitColor:'#2A4A2A',visorColor:'#00FF99',skinTone:'#E8C49A',
         armorStyle:'standard',helmet:true,backpack:'none'};
}

function _esc(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;');}

function _buildLobSlots(){
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
