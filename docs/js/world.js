// Locations + state + Three.js + world + characters + weapon mesh
// ═══════════════════════════════════════════════════════════════
//  LOCATION CONFIGS
// ═══════════════════════════════════════════════════════════════
const LOCS = {
  sweden:{
    name:'Sweden', flag:'🇸🇪',
    sky:0x8BBCCC, fogColor:new THREE.Color(0xAAC8DD), fogDensity:.016,
    ground:0xDAE8EF, ambColor:0x6688AA, ambInt:.55,
    sunColor:0xCCDDEE, sunInt:.7, sunPos:[-12,22,8],
    bldColors:[0xDDCCBB,0xCCBBAA,0xBBAA99,0x998877,0xCCCCDD,0xBBCCCC],
    roofColor:0xBB3333, maxH:13,minH:4, bldW:{min:4,max:10},
    hasTrees:true, treeColor:0x2A5A22, snowCaps:true,
  },
  beirut:{
    name:'Beirut', flag:'🇱🇧',
    sky:0x4488BB, fogColor:new THREE.Color(0x88AACC), fogDensity:.007,
    ground:0xC5B586, ambColor:0x995522, ambInt:.75,
    sunColor:0xFFDD77, sunInt:1.2, sunPos:[16,32,-6],
    bldColors:[0xDDB860,0xCC9944,0xBB8833,0xAA7722,0xCCAA66,0xDDCC99],
    roofColor:0xCCAA88, maxH:22,minH:6, bldW:{min:5,max:13},
    hasTrees:false, hasPalms:true,
  },
  dubai:{
    name:'Dubai', flag:'🇦🇪',
    sky:0x7799CC, fogColor:new THREE.Color(0xD4C090), fogDensity:.011,
    ground:0xE5D29A, ambColor:0xAA8822, ambInt:.85,
    sunColor:0xFFEE88, sunInt:1.5, sunPos:[22,45,0],
    bldColors:[0xCCBB88,0xDDCC99,0xBBAA77,0xCCCC99,0xEEDDAA,0x99AACC],
    roofColor:0x88AACC, maxH:55,minH:10, bldW:{min:6,max:16},
    hasSkyscrapers:true,
  },
};

// ═══════════════════════════════════════════════════════════════
//  GLOBAL GAME STATE
// ═══════════════════════════════════════════════════════════════
let renderer,scene,camera;
let previewRenderer,previewScene,previewCamera,previewChar;
let sunLight;

let currentScreen = 'mainMenu';
let selectedLoc    = null;
let gameActive     = false;
let gamePaused     = false;
let isLocked       = false;

// Player
let px=0,py=PLAYER_H,pz=20;
let vx=0,vy=0,vz=0;
let onGround=true;
let yaw=0,pitch=0;
let sprinting=false;
const keys={};
// Upgrade multipliers (recalculated each startGame)
let effectiveSpd=PLAYER_SPD, effectiveSprint=SPRINT_SPD, dmgMult=1;
// Gadgets
let activeGadgets={flashbang:0, airstrike:0, cover:0};
// Cyber Bullet
let cyberBulletOwned=false, cyberBulletCD=0;
let cyberBulletMesh=null;

// Weapon
let currentWeapon='launcher';
let weaponInventory=new Set(['pistol','launcher']);
let weaponAmmo={pistol:15, launcher:6, shotgun:2, sniper:5, smg:30};
let ammo=6, isReloading=false, reloadT=0, fireCD=0;
let scoped=false, scopeT=0;
let mouseHeld=false;
let shockCharging=false, shockChargeT=0;
const SHOCK_CHARGE_DUR=1.5;
let bobT=0, bobX=0, bobY=0;
// Grappling hook
let hookActive=false, hookPulling=false;
let hookPos=null, hookVel=null, hookMesh=null, hookLine=null;
let hookTarget=null; // {type:'soldier'|'missile', ref}
// Helicopters
let helicopters=[];
// Mod menu
const mods={aimbot:false,infAmmo:false,godMode:false};
let modMenuOpen=false;
let lloydBuf='';

// Wave
let waveNum=1, waveActive=false;
let waveMissileTotal=0, waveMissileSpawned=0, waveMissileInterval=0, waveMissileTimer=0;
let waveIntercepted=0, waveMissed=0, waveShotsFired=0, waveBldDestroyed=0;
let waveScore=0;
let totalInterceptedSession=0;
let score=0;
let killStreak=0, killStreakTimer=0;
let hookCD=0;
let playerArmorStyle='light';
let mpIsGuest=false;
let _missileIdCounter=0;

// City / Player
let cityIntegrity=100;
let playerHealth=100;
let totalBuildings=0;

// Objects
let buildings=[];
let missiles=[];
let projectiles=[];
let particles=[];
let soldiers=[];
let soldierBullets=[];
let ammoPacks=[];
let debris=[];
let weaponMesh=null;
let recoilT=0;

// Screen shake
let shakeT=0, shakeStr=0;

// ═══════════════════════════════════════════════════════════════
//  THREE.JS INIT
// ═══════════════════════════════════════════════════════════════
function initThree(){
  const canvas=document.getElementById('gameCanvas');
  renderer=new THREE.WebGLRenderer({canvas,antialias:true,powerPreference:'high-performance'});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));
  renderer.setSize(window.innerWidth,window.innerHeight);
  renderer.shadowMap.enabled=true;
  renderer.shadowMap.type=THREE.PCFSoftShadowMap;

  scene=new THREE.Scene();
  camera=new THREE.PerspectiveCamera(NORMAL_FOV,window.innerWidth/window.innerHeight,.05,800);
  camera.position.set(0,PLAYER_H,0);
  scene.add(camera);

  window.addEventListener('resize',()=>{
    renderer.setSize(window.innerWidth,window.innerHeight);
    camera.aspect=window.innerWidth/window.innerHeight;
    camera.updateProjectionMatrix();
  });
}

function initPreviewRenderer(){
  const canvas=document.getElementById('charPreviewCanvas');
  previewRenderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true});
  previewRenderer.setSize(180,280);
  previewScene=new THREE.Scene();
  previewScene.background=new THREE.Color(0x111125);
  previewCamera=new THREE.PerspectiveCamera(42,180/280,.1,100);
  previewCamera.position.set(0,1.6,3.2);
  previewCamera.lookAt(0,1.1,0);
  previewScene.add(new THREE.AmbientLight(0xffffff,.55));
  const dl=new THREE.DirectionalLight(0xffffff,1);
  dl.position.set(2,5,3);
  previewScene.add(dl);
  const fl=new THREE.DirectionalLight(0x4488ff,.3);
  fl.position.set(-2,1,-2);
  previewScene.add(fl);
}

// ═══════════════════════════════════════════════════════════════
//  WORLD BUILDER
// ═══════════════════════════════════════════════════════════════
let worldObjects=[];

function clearWorld(){
  for(const o of worldObjects) scene.remove(o);
  worldObjects=[];
  buildings=[];
  missiles.forEach(m=>{if(m.group)scene.remove(m.group);if(m.trailLine)scene.remove(m.trailLine);});
  missiles=[];
  projectiles.forEach(p=>{if(p.mesh)scene.remove(p.mesh);if(p.trailLine)scene.remove(p.trailLine);});
  projectiles=[];
  particles.forEach(p=>{if(p.mesh)scene.remove(p.mesh);});
  particles=[];
  soldiers.forEach(s=>{if(s.group)scene.remove(s.group);if(s.barEl)s.barEl.remove();});
  soldiers=[];
  const hb=document.getElementById('healthBars');if(hb)hb.innerHTML='';
  helicopters.forEach(h=>{if(h.group)scene.remove(h.group);});
  helicopters=[];
  soldierBullets.forEach(b=>{if(b.mesh)scene.remove(b.mesh);});
  soldierBullets=[];
  ammoPacks.forEach(a=>{if(a.mesh)scene.remove(a.mesh);});
  ammoPacks=[];
  debris.forEach(d=>{if(d.mesh)scene.remove(d.mesh);});
  debris=[];
  releaseHook();
  if(weaponMesh){camera.remove(weaponMesh);weaponMesh=null;}
}

function addToWorld(obj){scene.add(obj);worldObjects.push(obj);return obj;}

function makeHelicopterMesh(locId){
  const g=new THREE.Group();
  const bodyC=locId==='sweden'?0x2A3A5A:0x2A3A1A;
  const bodyM=new THREE.MeshLambertMaterial({color:bodyC});
  const darkM=new THREE.MeshLambertMaterial({color:0x111111});
  const glassM=new THREE.MeshLambertMaterial({color:0x3A6A88,transparent:true,opacity:.55});
  const rotorM=new THREE.MeshLambertMaterial({color:0x0A0F0A});
  // Body
  const body=new THREE.Mesh(new THREE.BoxGeometry(5.5,2.2,2.2),bodyM);body.position.y=2.8;g.add(body);
  // Nose bubble
  const nose=new THREE.Mesh(new THREE.SphereGeometry(1.05,8,6),glassM);nose.scale.set(1,.8,1);nose.position.set(-3,2.8,0);g.add(nose);
  // Tail boom
  const tail=new THREE.Mesh(new THREE.BoxGeometry(5,.7,.7),bodyM);tail.position.set(3.5,3,0);g.add(tail);
  // Tail rotor
  const tRotorGroup=new THREE.Group();tRotorGroup.position.set(5.8,3.3,0);
  const tBlade=new THREE.Mesh(new THREE.BoxGeometry(.08,2.2,.1),rotorM);tRotorGroup.add(tBlade);
  g.add(tRotorGroup);
  // Main rotor group (animated)
  const rotorHub=new THREE.Group();rotorHub.position.y=4.1;
  const b1=new THREE.Mesh(new THREE.BoxGeometry(9,.08,.38),rotorM);rotorHub.add(b1);
  const b2=new THREE.Mesh(new THREE.BoxGeometry(.38,.08,9),rotorM);rotorHub.add(b2);
  g.add(rotorHub);
  // Skids
  [-1,1].forEach(s=>{
    const sk=new THREE.Mesh(new THREE.BoxGeometry(4.5,.12,.12),bodyM);sk.position.set(0,1.5,s*1.2);g.add(sk);
    const st=new THREE.Mesh(new THREE.BoxGeometry(.12,1.2,.12),bodyM);st.position.set(-1,2.1,s*1.2);g.add(st);
    const st2=new THREE.Mesh(new THREE.BoxGeometry(.12,1.2,.12),bodyM);st2.position.set(1.4,2.1,s*1.2);g.add(st2);
  });
  // Door (open)
  const door=new THREE.Mesh(new THREE.BoxGeometry(.08,1.4,1.8),darkM);door.position.set(-1.5,2.4,1.2);g.add(door);
  return {group:g, rotorHub, tRotorGroup};
}

function spawnHelicopters(locId){
  const positions=[];
  if(locId==='sweden') positions.push([-42,0,-22],[42,0,22]);
  else if(locId==='beirut') positions.push([-44,0,-44],[44,0,-38]);
  else positions.push([0,0,-50],[40,0,-36]);
  positions.forEach(([x,y,z])=>{
    const h=makeHelicopterMesh(locId);
    h.group.position.set(x,0,z);
    // Face inward toward city center
    h.group.rotation.y=Math.atan2(-x,-z);
    scene.add(h.group);
    // Beacon light so helicopter is easy to spot
    const beacon=new THREE.PointLight(0xFF4400,1.2,20);
    beacon.position.set(0,5,0);
    h.group.add(beacon);
    helicopters.push({group:h.group,rotorHub:h.rotorHub,tRotorGroup:h.tRotorGroup,pos:new THREE.Vector3(x,0,z),health:8});
  });
}

function updateHelicopters(dt){
  helicopters.forEach(h=>{
    h.rotorHub.rotation.y+=dt*12;
    h.tRotorGroup.rotation.x+=dt*20;
  });
}

function buildWorld(locId){
  clearWorld();
  const loc=LOCS[locId];
  scene.background=new THREE.Color(loc.sky);
  scene.fog=new THREE.FogExp2(loc.fogColor,loc.fogDensity);

  // Lights
  addToWorld(new THREE.AmbientLight(loc.ambColor,loc.ambInt));
  sunLight=new THREE.DirectionalLight(loc.sunColor,loc.sunInt);
  sunLight.position.set(...loc.sunPos);
  sunLight.castShadow=true;
  sunLight.shadow.mapSize.set(2048,2048);
  sunLight.shadow.camera.near=.5;
  sunLight.shadow.camera.far=250;
  sunLight.shadow.camera.left=-120;sunLight.shadow.camera.right=120;
  sunLight.shadow.camera.top=120;sunLight.shadow.camera.bottom=-120;
  addToWorld(sunLight);

  // Ground
  const gGeo=new THREE.PlaneGeometry(400,400);
  const gMat=new THREE.MeshLambertMaterial({color:loc.ground});
  const ground=new THREE.Mesh(gGeo,gMat);
  ground.rotation.x=-Math.PI/2;
  ground.receiveShadow=true;
  addToWorld(ground);

  // Ground detail tiles
  if(locId==='sweden') buildSnowGround();
  if(locId==='dubai') buildSandDetails();

  // Buildings
  buildBuildings(loc,locId);

  // Decoration
  if(loc.hasTrees) buildPineTrees(loc);
  if(loc.hasPalms) buildPalmTrees(loc);
  if(loc.hasSkyscrapers) buildSkyscraperDetails(loc);

  // Weapon in camera
  weaponMesh=makeWeaponMesh();
  camera.add(weaponMesh);

  spawnHelicopters(locId);
  totalBuildings=buildings.length;
  cityIntegrity=100;
  playerHealth=100;
}

function buildSnowGround(){
  const mat=new THREE.MeshLambertMaterial({color:0xEEEEF5});
  for(let i=0;i<30;i++){
    const r=3+Math.random()*6;
    const geo=new THREE.CylinderGeometry(r,r+1,.25,8);
    const m=new THREE.Mesh(geo,mat);
    m.position.set((Math.random()-.5)*180,(-.12),(Math.random()-.5)*180);
    addToWorld(m);
  }
}
function buildSandDetails(){
  const mat=new THREE.MeshLambertMaterial({color:0xD4B87A});
  for(let i=0;i<20;i++){
    const r=4+Math.random()*10;
    const geo=new THREE.ConeGeometry(r,.8+Math.random()*.6,8);
    const m=new THREE.Mesh(geo,mat);
    m.position.set((Math.random()-.5)*180,0,(Math.random()-.5)*180);
    addToWorld(m);
  }
}

function buildBuildings(loc,locId){
  // Grid 5 cols x 4 rows, skip center for player start
  const cols=5, rows=4, sp=22;
  const ox=-(cols-1)*sp/2, oz=-(rows-1)*sp/2;

  for(let c=0;c<cols;c++){
    for(let r=0;r<rows;r++){
      if(c===2&&(r===1||r===2)) continue; // player start area
      const bx=ox+c*sp+(Math.random()-.5)*5;
      const bz=oz+r*sp+(Math.random()-.5)*5;
      const bw=loc.bldW.min+Math.random()*(loc.bldW.max-loc.bldW.min);
      const bd=loc.bldW.min+Math.random()*(loc.bldW.max-loc.bldW.min);
      const bh=loc.minH+Math.random()*(loc.maxH-loc.minH);
      const col=loc.bldColors[Math.floor(Math.random()*loc.bldColors.length)];
      const bld=makeBuilding(bx,bz,bw,bd,bh,col,loc,locId);
      buildings.push(bld);
    }
  }

  // Extra random buildings
  for(let i=0;i<6;i++){
    const bx=(Math.random()-.5)*100;
    const bz=(Math.random()-.5)*100;
    const dist=Math.sqrt(bx*bx+bz*bz);
    if(dist<15||dist>80) continue;
    const bw=loc.bldW.min+Math.random()*(loc.bldW.max-loc.bldW.min);
    const bd=loc.bldW.min+Math.random()*(loc.bldW.max-loc.bldW.min);
    const bh=loc.minH+Math.random()*(loc.maxH-loc.minH);
    const col=loc.bldColors[Math.floor(Math.random()*loc.bldColors.length)];
    buildings.push(makeBuilding(bx,bz,bw,bd,bh,col,loc,locId));
  }
}

function makeBuilding(x,z,w,d,h,colorHex,loc,locId){
  const group=new THREE.Group();
  group.position.set(x,0,z);

  // Main body
  const bodyGeo=new THREE.BoxGeometry(w,h,d);
  const bodyMat=new THREE.MeshLambertMaterial({color:colorHex});
  const bodyMesh=new THREE.Mesh(bodyGeo,bodyMat);
  bodyMesh.position.y=h/2;
  bodyMesh.castShadow=true;
  bodyMesh.receiveShadow=true;
  group.add(bodyMesh);

  // Roof
  const roofGeo=new THREE.BoxGeometry(w+.3,0.4,d+.3);
  const roofMat=new THREE.MeshLambertMaterial({color:loc.roofColor});
  const roofMesh=new THREE.Mesh(roofGeo,roofMat);
  roofMesh.position.y=h+.2;
  group.add(roofMesh);

  // Pointed roof for Sweden
  if(locId==='sweden'){
    const roofTip=new THREE.ConeGeometry(Math.min(w,d)*.6,h*.4,4);
    const tipMesh=new THREE.Mesh(roofTip,roofMat);
    tipMesh.position.y=h+.4+h*.2;
    tipMesh.rotation.y=Math.PI/4;
    group.add(tipMesh);
  }

  // Snow cap for Sweden
  if(locId==='sweden'&&loc.snowCaps){
    const snowGeo=new THREE.BoxGeometry(w+.1,.3,d+.1);
    const snowMat=new THREE.MeshLambertMaterial({color:0xF0F4F8});
    const snow=new THREE.Mesh(snowGeo,snowMat);
    snow.position.y=h+.55;
    group.add(snow);
  }

  // Windows
  if(h>6){
    const winMat=new THREE.MeshLambertMaterial({color:0xFFEE88,emissive:0xFFCC44,emissiveIntensity:.25});
    const floors=Math.floor(h/3.2);
    const wpc=Math.max(1,Math.floor(w/2.5));
    for(let f=1;f<floors;f++){
      for(let ww=0;ww<wpc;ww++){
        if(Math.random()>.65) continue;
        const wGeo=new THREE.BoxGeometry(.35,.5,.08);
        const wMesh=new THREE.Mesh(wGeo,winMat);
        wMesh.position.set(-w/2+.6+ww*(w/wpc),f*3.2+1,d/2+.05);
        group.add(wMesh);
        // back face too
        const wMesh2=wMesh.clone();
        wMesh2.position.z=-(d/2+.05);
        group.add(wMesh2);
      }
    }
  }

  // Dubai glass effect
  if(locId==='dubai'&&h>25){
    bodyMat.color.setHex(0xAABBCC);
    bodyMat.emissive=new THREE.Color(0x002244);
    bodyMat.emissiveIntensity=.15;
  }

  addToWorld(group);
  return{group,bodyMesh,bodyMat,health:3,maxHealth:3,isDestroyed:false,
    h,pos:{x,z},originalColor:colorHex,w,d};
}

function buildPineTrees(loc){
  const trunkMat=new THREE.MeshLambertMaterial({color:0x5A3A1A});
  const leafMat=new THREE.MeshLambertMaterial({color:loc.treeColor});
  const snowMat=new THREE.MeshLambertMaterial({color:0xEEF2F6});
  for(let i=0;i<28;i++){
    const tx=(Math.random()-.5)*150;
    const tz=(Math.random()-.5)*150;
    if(Math.sqrt(tx*tx+tz*tz)<20) continue;
    const g=new THREE.Group();
    const trunk=new THREE.Mesh(new THREE.CylinderGeometry(.18,.22,1.8,6),trunkMat);
    trunk.position.y=.9; g.add(trunk);
    const h=3+Math.random()*3;
    for(let t=0;t<3;t++){
      const r=(3-t)*.7;
      const cone=new THREE.Mesh(new THREE.ConeGeometry(r,r*1.1,7),leafMat);
      cone.position.y=1.6+t*r*.6; g.add(cone);
    }
    // Snow on top
    const sc=new THREE.Mesh(new THREE.ConeGeometry(.4,1.2,7),snowMat);
    sc.position.y=1.6+3*.7*2+.6; g.add(sc);
    g.position.set(tx,0,tz);
    addToWorld(g);
  }
}

function buildPalmTrees(loc){
  const trunkMat=new THREE.MeshLambertMaterial({color:0x8B6914});
  const leafMat=new THREE.MeshLambertMaterial({color:0x44AA33});
  for(let i=0;i<18;i++){
    const tx=(Math.random()-.5)*130;
    const tz=(Math.random()-.5)*130;
    if(Math.sqrt(tx*tx+tz*tz)<18) continue;
    const g=new THREE.Group();
    const h=4+Math.random()*3;
    const trunk=new THREE.Mesh(new THREE.CylinderGeometry(.18,.28,h,6),trunkMat);
    trunk.position.y=h/2; g.add(trunk);
    for(let l=0;l<6;l++){
      const leaf=new THREE.Mesh(new THREE.BoxGeometry(.18,1.4,.06),leafMat);
      const angle=l/6*Math.PI*2;
      leaf.position.set(Math.cos(angle)*1.1,h+.1,Math.sin(angle)*1.1);
      leaf.rotation.z=Math.cos(angle)*.6;
      leaf.rotation.x=Math.sin(angle)*.6;
      g.add(leaf);
    }
    g.position.set(tx,0,tz);
    addToWorld(g);
  }
}

function buildSkyscraperDetails(loc){
  // Extra tall landmark skyscraper
  const cx=30,cz=-20;
  const h=loc.maxH;
  const g=new THREE.Group();
  const mat=new THREE.MeshLambertMaterial({color:0x99BBDD,emissive:0x002266,emissiveIntensity:.2});
  const body=new THREE.Mesh(new THREE.BoxGeometry(14,h,14),mat);
  body.position.y=h/2; body.castShadow=true;
  g.add(body);
  // Spire
  const spire=new THREE.Mesh(new THREE.CylinderGeometry(.3,1.2,h*.25,8),
    new THREE.MeshLambertMaterial({color:0xCCEEFF}));
  spire.position.y=h+h*.125; g.add(spire);
  // Top light
  const tl=new THREE.PointLight(0xFF4444,.8,30);
  tl.position.y=h+h*.28; g.add(tl);
  g.position.set(cx,0,cz);
  addToWorld(g);
  // Register as building
  buildings.push({group:g,bodyMesh:body,bodyMat:mat,health:5,maxHealth:5,
    isDestroyed:false,h,pos:{x:cx,z:cz},originalColor:0x99BBDD,w:14,d:14});
}

// ═══════════════════════════════════════════════════════════════
//  CHARACTER MODEL (Preview)
// ═══════════════════════════════════════════════════════════════
function makeCharModel(c){
  const g=new THREE.Group();
  const armorC=new THREE.Color(c.outfitColor);
  const visorC=new THREE.Color(c.visorColor);
  const skinHex=c.skinTone||'#E8C49A';
  const darkM=new THREE.MeshLambertMaterial({color:0x1A1A2A});
  const skinM=new THREE.MeshLambertMaterial({color:new THREE.Color(skinHex)});
  const armorM=new THREE.MeshLambertMaterial({color:armorC});
  const visorM=new THREE.MeshLambertMaterial({color:visorC,emissive:visorC,emissiveIntensity:.3});
  const bootM=new THREE.MeshLambertMaterial({color:0x1A120A});
  const beltM=new THREE.MeshLambertMaterial({color:0x111111});

  const tW=c.armorStyle==='heavy'?.56:c.armorStyle==='stealth'?.38:.46;
  const tH=c.armorStyle==='heavy'?.76:.62;

  // Boots
  [-1,1].forEach(s=>{
    const boot=new THREE.Mesh(new THREE.BoxGeometry(.18,.24,.22),bootM);
    boot.position.set(s*.12,.12,0);g.add(boot);
  });
  // Upper legs + knee pads (lowered so bottom meets boot top at y=0.24)
  const legM=new THREE.MeshLambertMaterial({color:armorC});
  [-1,1].forEach(s=>{
    const leg=new THREE.Mesh(new THREE.BoxGeometry(.17,.42,.19),legM);
    leg.position.set(s*.12,.46,0);g.add(leg);
    const kp=new THREE.Mesh(new THREE.BoxGeometry(.19,.09,.08),darkM);
    kp.position.set(s*.12,.36,.1);g.add(kp);
  });
  // Belt
  const belt=new THREE.Mesh(new THREE.BoxGeometry(tW+.04,.06,.28),beltM);
  belt.position.y=.72;g.add(belt);

  // Torso
  const torso=new THREE.Mesh(new THREE.BoxGeometry(tW,tH,.28),armorM);
  torso.position.y=tH/2+.76;g.add(torso);
  const torsoY=tH/2+.76;

  // Shoulder pads (heavy)
  if(c.armorStyle==='heavy'){
    [-1,1].forEach(s=>{
      const pad=new THREE.Mesh(new THREE.BoxGeometry(.15,.12,.3),armorM);
      pad.position.set(s*(tW/2+.08),torsoY+.12,0);g.add(pad);
    });
  }

  // Arms + elbow pads
  const armM=new THREE.MeshLambertMaterial({color:armorC});
  [-1,1].forEach(s=>{
    const arm=new THREE.Mesh(new THREE.BoxGeometry(.15,.52,.16),armM);
    arm.position.set(s*(tW/2+.1),torsoY-.02,0);g.add(arm);
    const ep=new THREE.Mesh(new THREE.BoxGeometry(.17,.08,.07),darkM);
    ep.position.set(s*(tW/2+.1),torsoY-.2,.06);g.add(ep);
  });

  // Mini weapon
  const wGrp=new THREE.Group();
  const wBarrel=new THREE.Mesh(new THREE.BoxGeometry(.05,.05,.4),darkM);
  wBarrel.position.z=-.2;wGrp.add(wBarrel);
  const wBody=new THREE.Mesh(new THREE.BoxGeometry(.1,.1,.2),darkM);
  wGrp.add(wBody);
  wGrp.position.set(tW/2+.12,torsoY-.1,-.18);wGrp.rotation.x=.2;g.add(wGrp);

  // Head
  const headY=torsoY+tH/2+.16;
  const head=new THREE.Mesh(new THREE.BoxGeometry(.27,.3,.27),skinM);
  head.position.y=headY;g.add(head);

  if(c.helmet){
    const helm=new THREE.Mesh(new THREE.BoxGeometry(.32,.24,.32),armorM);
    helm.position.y=headY+.04;g.add(helm);
    const visor=new THREE.Mesh(new THREE.BoxGeometry(.26,.1,.06),visorM);
    visor.position.set(0,headY-.01,.17);g.add(visor);
    const strap=new THREE.Mesh(new THREE.BoxGeometry(.28,.04,.04),darkM);
    strap.position.set(0,headY-.1,.14);g.add(strap);
  } else {
    // Face detail
    const eyeM=new THREE.MeshLambertMaterial({color:0x112233});
    [-1,1].forEach(s=>{
      const eye=new THREE.Mesh(new THREE.BoxGeometry(.04,.04,.02),eyeM);
      eye.position.set(s*.07,headY+.04,.135);g.add(eye);
    });
    // Mouth (narrow dark strip)
    const mouthM=new THREE.MeshLambertMaterial({color:0x2A0A0A});
    const mouth=new THREE.Mesh(new THREE.BoxGeometry(.09,.03,.02),mouthM);
    mouth.position.set(0,headY-.04,.138);g.add(mouth);
    // Hair cap (sits on top of head, not inside it)
    const hairM=new THREE.MeshLambertMaterial({color:0x2A1A08});
    const hair=new THREE.Mesh(new THREE.BoxGeometry(.29,.09,.29),hairM);
    hair.position.set(0,headY+.20,0);g.add(hair);
  }

  // Backpack
  if(c.backpack!=='none'){
    const bpH=c.backpack==='missile'?.48:.32;
    const bp=new THREE.Mesh(new THREE.BoxGeometry(.22,bpH,.14),darkM);
    bp.position.set(0,torsoY+.08,-.22);g.add(bp);
    if(c.backpack==='missile'){
      for(let i=-1;i<=1;i++){
        const m=new THREE.Mesh(new THREE.CylinderGeometry(.028,.028,.18,6),
          new THREE.MeshLambertMaterial({color:0x888888}));
        m.position.set(i*.07,torsoY+.26,-.22);g.add(m);
      }
    }
  }

  // Stealth lines
  if(c.armorStyle==='stealth'){
    const lineMat=new THREE.MeshLambertMaterial({color:0x0088FF,emissive:0x0044FF,emissiveIntensity:.5});
    const line1=new THREE.Mesh(new THREE.BoxGeometry(tW+.02,.03,.03),lineMat);
    line1.position.y=torsoY;g.add(line1);
    const line2=new THREE.Mesh(new THREE.BoxGeometry(.03,.03,tH*.7),lineMat);
    line2.position.set(0,torsoY,.14);g.add(line2);
  }
  return g;
}

let previewRotT=0;
function rebuildCharPreview(){
  if(previewChar) previewScene.remove(previewChar);
  previewChar=makeCharModel(saveData.customization);
  previewScene.add(previewChar);
  if(typeof saveCustomizationToFirebase==='function') saveCustomizationToFirebase();
  if(typeof updateLobbyScene==='function') updateLobbyScene();
}

// ═══════════════════════════════════════════════════════════════
//  WEAPON MESH (FPS view)
// ═══════════════════════════════════════════════════════════════
function _getWeaponCamoColor(weaponId){
  const def={launcher:0x1E1E1E,pistol:0x222222,shotgun:0x1A1A1A,sniper:0x1A1A1A,smg:0x1C1C1C};
  const camoId=saveData&&saveData.equippedWeaponCamos?saveData.equippedWeaponCamos[weaponId]:'default';
  if(!camoId||camoId==='default') return def[weaponId]||0x1E1E1E;
  const camos=typeof WEAPON_CAMOS!=='undefined'?WEAPON_CAMOS[weaponId]:null;
  if(!camos) return def[weaponId]||0x1E1E1E;
  const camo=camos.find(c=>c.id===camoId);
  return camo?parseInt(camo.hexStr.replace('#',''),16):def[weaponId]||0x1E1E1E;
}
function makeWeaponMesh(){
  if(currentWeapon==='pistol')      return makePistolMesh();
  if(currentWeapon==='shotgun')     return makeShotgunMesh();
  if(currentWeapon==='sniper')      return makeSniperMesh();
  if(currentWeapon==='smg')         return makeSmgMesh();
  if(currentWeapon==='railgun')     return makeRailgunMesh();
  if(currentWeapon==='cluster')     return makeClusterMesh();
  if(currentWeapon==='shock')       return makeShockMesh();
  return makeLauncherMesh();
}
function makeLauncherMesh(){
  const g=new THREE.Group();
  const _lc=_getWeaponCamoColor('launcher');
  const metalM=new THREE.MeshLambertMaterial({color:_lc,emissive:new THREE.Color(_lc),emissiveIntensity:.5});
  const darkM =new THREE.MeshLambertMaterial({color:0x111111});
  const stockM=new THREE.MeshLambertMaterial({color:saveData.customization.outfitColor});
  const tube=new THREE.Mesh(new THREE.CylinderGeometry(.062,.062,.70,8),metalM);
  tube.rotation.x=Math.PI/2;tube.position.z=-.08;g.add(tube);
  const front=new THREE.Mesh(new THREE.ConeGeometry(.062,.13,8),darkM);
  front.rotation.x=Math.PI/2;front.position.z=-.47;g.add(front);
  const back=new THREE.Mesh(new THREE.CylinderGeometry(.072,.038,.09,8),darkM);
  back.rotation.x=Math.PI/2;back.position.z=.32;g.add(back);
  const stock=new THREE.Mesh(new THREE.BoxGeometry(.068,.088,.22),stockM);
  stock.position.set(0,-.08,.15);g.add(stock);
  const scope=new THREE.Mesh(new THREE.CylinderGeometry(.024,.024,.22,8),new THREE.MeshLambertMaterial({color:0x0A120A}));
  scope.rotation.x=Math.PI/2;scope.position.set(0,.098,-.04);g.add(scope);
  const lensM=new THREE.MeshLambertMaterial({color:0x112233});lensM.emissive.set(0x001122);lensM.emissiveIntensity=.4;
  const lens=new THREE.Mesh(new THREE.CircleGeometry(.022,8),lensM);
  lens.position.set(0,.098,-.16);g.add(lens);
  const grip=new THREE.Mesh(new THREE.BoxGeometry(.056,.14,.07),stockM);
  grip.position.set(0,-.11,-.04);g.add(grip);
  g.position.set(.25,-.22,-.42);return g;
}
function makePistolMesh(){
  const g=new THREE.Group();
  const _pc=_getWeaponCamoColor('pistol');
  const metalM=new THREE.MeshLambertMaterial({color:_pc,emissive:new THREE.Color(_pc),emissiveIntensity:.5});
  const darkM =new THREE.MeshLambertMaterial({color:0x111111});
  const gripM =new THREE.MeshLambertMaterial({color:0x2A1A0A});
  const barrel=new THREE.Mesh(new THREE.BoxGeometry(.042,.042,.36),metalM);
  barrel.position.z=-.14;g.add(barrel);
  const muzzle=new THREE.Mesh(new THREE.CylinderGeometry(.026,.032,.04,8),darkM);
  muzzle.rotation.x=Math.PI/2;muzzle.position.z=-.34;g.add(muzzle);
  const body=new THREE.Mesh(new THREE.BoxGeometry(.072,.09,.18),metalM);
  body.position.set(0,-.01,.04);g.add(body);
  const grip=new THREE.Mesh(new THREE.BoxGeometry(.062,.16,.08),gripM);
  grip.rotation.x=.18;grip.position.set(0,-.14,.08);g.add(grip);
  const slide=new THREE.Mesh(new THREE.BoxGeometry(.048,.048,.32),darkM);
  slide.position.set(0,.022,-.04);g.add(slide);
  g.position.set(.22,-.2,-.38);return g;
}
function makeShotgunMesh(){
  const g=new THREE.Group();
  const _sc=_getWeaponCamoColor('shotgun');
  const metalM=new THREE.MeshLambertMaterial({color:_sc,emissive:new THREE.Color(_sc),emissiveIntensity:.5});
  const darkM =new THREE.MeshLambertMaterial({color:0x0D0D0D});
  const woodM =new THREE.MeshLambertMaterial({color:0x3A1A08});
  // Double barrel
  const bL=new THREE.Mesh(new THREE.CylinderGeometry(.028,.028,.58,8),metalM);
  bL.rotation.x=Math.PI/2;bL.position.set(-.038,0,-.14);g.add(bL);
  const bR=new THREE.Mesh(new THREE.CylinderGeometry(.028,.028,.58,8),metalM);
  bR.rotation.x=Math.PI/2;bR.position.set(.038,0,-.14);g.add(bR);
  // Connecting band
  const band=new THREE.Mesh(new THREE.BoxGeometry(.1,.04,.04),darkM);
  band.position.set(0,0,-.08);g.add(band);
  // Receiver
  const recv=new THREE.Mesh(new THREE.BoxGeometry(.12,.1,.24),metalM);
  recv.position.set(0,-.008,.14);g.add(recv);
  // Stock
  const stock=new THREE.Mesh(new THREE.BoxGeometry(.086,.09,.28),woodM);
  stock.position.set(0,-.02,.3);g.add(stock);
  // Hook launcher tube under barrels
  const hookTube=new THREE.Mesh(new THREE.CylinderGeometry(.02,.02,.26,6),darkM);
  hookTube.rotation.x=Math.PI/2;hookTube.position.set(0,-.065,-.02);g.add(hookTube);
  // Hook claw tip (Doom Eternal meathook shape)
  const clawBase=new THREE.Mesh(new THREE.CylinderGeometry(.02,.016,.05,6),metalM);
  clawBase.rotation.x=Math.PI/2;clawBase.position.set(0,-.065,-.16);g.add(clawBase);
  // Three curved claw prongs
  [[-1,0],[1,0],[0,-1]].forEach(([cx,cz])=>{
    const prong=new THREE.Mesh(new THREE.BoxGeometry(.016,.05,.016),metalM);
    prong.position.set(cx*.028+0,-.065-.028,cz*.018-.185);
    prong.rotation.z=cx*0.7;prong.rotation.x=cz*0.5;
    g.add(prong);
  });
  // Chain link visual hint
  const chain=new THREE.Mesh(new THREE.BoxGeometry(.006,.006,.1),new THREE.MeshLambertMaterial({color:0xAAAAAA}));
  chain.position.set(0,-.065,-.08);g.add(chain);
  g.position.set(.26,-.21,-.44);return g;
}
function makeSniperMesh(){
  const g=new THREE.Group();
  const _snc=_getWeaponCamoColor('sniper');
  const metalM=new THREE.MeshLambertMaterial({color:_snc,emissive:new THREE.Color(_snc),emissiveIntensity:.5});
  const darkM =new THREE.MeshLambertMaterial({color:0x0A0A0A});
  const woodM =new THREE.MeshLambertMaterial({color:0x2A1A0A});
  const glassM=new THREE.MeshLambertMaterial({color:0x112233,emissive:new THREE.Color(0x001122),emissiveIntensity:.4});
  const barrel=new THREE.Mesh(new THREE.CylinderGeometry(.018,.018,.82,8),metalM);
  barrel.rotation.x=Math.PI/2;barrel.position.z=-.28;g.add(barrel);
  const supp=new THREE.Mesh(new THREE.CylinderGeometry(.028,.028,.12,8),darkM);
  supp.rotation.x=Math.PI/2;supp.position.z=-.74;g.add(supp);
  const recv=new THREE.Mesh(new THREE.BoxGeometry(.078,.088,.34),metalM);
  recv.position.set(0,-.004,.06);g.add(recv);
  const stock=new THREE.Mesh(new THREE.BoxGeometry(.06,.072,.3),woodM);
  stock.position.set(0,-.01,.32);g.add(stock);
  const cheek=new THREE.Mesh(new THREE.BoxGeometry(.06,.04,.12),woodM);
  cheek.position.set(0,.042,.28);g.add(cheek);
  const scopeTube=new THREE.Mesh(new THREE.CylinderGeometry(.032,.032,.3,10),darkM);
  scopeTube.rotation.x=Math.PI/2;scopeTube.position.set(0,.088,-.04);g.add(scopeTube);
  const lensF=new THREE.Mesh(new THREE.CircleGeometry(.028,10),glassM);
  lensF.position.set(0,.088,-.2);g.add(lensF);
  const lensB=new THREE.Mesh(new THREE.CircleGeometry(.022,10),glassM);
  lensB.position.set(0,.088,.12);lensB.rotation.y=Math.PI;g.add(lensB);
  [-1,1].forEach(s=>{
    const leg=new THREE.Mesh(new THREE.BoxGeometry(.008,.18,.008),metalM);
    leg.position.set(s*.04,-.13,-.3);leg.rotation.z=s*.28;g.add(leg);
  });
  const grip=new THREE.Mesh(new THREE.BoxGeometry(.052,.12,.064),woodM);
  grip.rotation.x=.2;grip.position.set(0,-.1,0);g.add(grip);
  g.position.set(.24,-.21,-.44);return g;
}
function makeSmgMesh(){
  const g=new THREE.Group();
  const _mc=_getWeaponCamoColor('smg');
  const metalM=new THREE.MeshLambertMaterial({color:_mc,emissive:new THREE.Color(_mc),emissiveIntensity:.5});
  const darkM =new THREE.MeshLambertMaterial({color:0x0E0E0E});
  const polyM =new THREE.MeshLambertMaterial({color:0x2A2A2A});
  const barrel=new THREE.Mesh(new THREE.CylinderGeometry(.022,.022,.28,8),metalM);
  barrel.rotation.x=Math.PI/2;barrel.position.z=-.1;g.add(barrel);
  const muzzle=new THREE.Mesh(new THREE.CylinderGeometry(.03,.022,.06,6),darkM);
  muzzle.rotation.x=Math.PI/2;muzzle.position.z=-.27;g.add(muzzle);
  const recv=new THREE.Mesh(new THREE.BoxGeometry(.09,.1,.38),metalM);
  recv.position.set(0,0,.04);g.add(recv);
  const drum=new THREE.Mesh(new THREE.CylinderGeometry(.08,.08,.12,12),polyM);
  drum.rotation.x=Math.PI/2;drum.position.set(0,-.09,.08);g.add(drum);
  const fg=new THREE.Mesh(new THREE.BoxGeometry(.048,.14,.052),polyM);
  fg.rotation.x=.15;fg.position.set(0,-.1,-.12);g.add(fg);
  const stock=new THREE.Mesh(new THREE.BoxGeometry(.06,.048,.18),metalM);
  stock.position.set(0,.018,.28);g.add(stock);
  const ch=new THREE.Mesh(new THREE.BoxGeometry(.012,.04,.04),darkM);
  ch.position.set(.05,.038,.06);g.add(ch);
  const grip=new THREE.Mesh(new THREE.BoxGeometry(.054,.12,.06),polyM);
  grip.rotation.x=.18;grip.position.set(0,-.1,.1);g.add(grip);
  g.position.set(.22,-.19,-.42);return g;
}
function makeRailgunMesh(){
  const g=new THREE.Group();
  const _rc=_getWeaponCamoColor('railgun');
  const metalM=new THREE.MeshLambertMaterial({color:_rc,emissive:new THREE.Color(_rc),emissiveIntensity:.5});
  const darkM =new THREE.MeshLambertMaterial({color:0x080808});
  const glowM =new THREE.MeshLambertMaterial({color:0x00FFFF,emissive:new THREE.Color(0x00FFFF),emissiveIntensity:1.5});
  // long barrel
  const barrel=new THREE.Mesh(new THREE.CylinderGeometry(.016,.016,1.0,8),metalM);
  barrel.rotation.x=Math.PI/2;barrel.position.z=-.3;g.add(barrel);
  // two rail tracks with glowing capacitor beads
  [-1,1].forEach(s=>{
    const rail=new THREE.Mesh(new THREE.BoxGeometry(.008,.028,.9),darkM);
    rail.position.set(s*.022,0,-.3);g.add(rail);
    for(let b=0;b<4;b++){
      const cap=new THREE.Mesh(new THREE.BoxGeometry(.012,.012,.012),glowM);
      cap.position.set(s*.022,0,-.05-b*.18);g.add(cap);
    }
  });
  const recv=new THREE.Mesh(new THREE.BoxGeometry(.08,.07,.28),metalM);
  recv.position.set(0,-.004,.18);g.add(recv);
  const grip=new THREE.Mesh(new THREE.BoxGeometry(.048,.12,.052),darkM);
  grip.rotation.x=.18;grip.position.set(0,-.1,.12);g.add(grip);
  const stock=new THREE.Mesh(new THREE.BoxGeometry(.052,.044,.18),metalM);
  stock.position.set(0,.008,.32);g.add(stock);
  const muzzle=new THREE.Mesh(new THREE.TorusGeometry(.022,.006,6,8),glowM);
  muzzle.rotation.y=Math.PI/2;muzzle.position.z=-.82;g.add(muzzle);
  g.position.set(.22,-.2,-.44);return g;
}
function makeClusterMesh(){
  const g=new THREE.Group();
  const _cc=_getWeaponCamoColor('cluster');
  const metalM=new THREE.MeshLambertMaterial({color:_cc,emissive:new THREE.Color(_cc),emissiveIntensity:.5});
  const darkM =new THREE.MeshLambertMaterial({color:0x1A1A0A});
  const drumM =new THREE.MeshLambertMaterial({color:0x2A2A2A});
  const barrel=new THREE.Mesh(new THREE.CylinderGeometry(.052,.058,.38,8),metalM);
  barrel.rotation.x=Math.PI/2;barrel.position.z=-.08;g.add(barrel);
  const bell=new THREE.Mesh(new THREE.CylinderGeometry(.07,.052,.06,8),darkM);
  bell.rotation.x=Math.PI/2;bell.position.z=-.3;g.add(bell);
  const recv=new THREE.Mesh(new THREE.BoxGeometry(.11,.11,.28),metalM);
  recv.position.set(0,-.004,.16);g.add(recv);
  const drum=new THREE.Mesh(new THREE.CylinderGeometry(.1,.1,.1,12),drumM);
  drum.rotation.x=Math.PI/2;drum.position.set(0,-.04,.18);g.add(drum);
  for(let d=0;d<3;d++){
    const div=new THREE.Mesh(new THREE.BoxGeometry(.005,.19,.005),darkM);
    div.position.set(0,-.04,.18);div.rotation.z=d*(Math.PI/3);g.add(div);
  }
  const grip=new THREE.Mesh(new THREE.BoxGeometry(.062,.14,.064),darkM);
  grip.rotation.x=.15;grip.position.set(0,-.12,.12);g.add(grip);
  const stock=new THREE.Mesh(new THREE.BoxGeometry(.07,.072,.2),metalM);
  stock.position.set(0,-.01,.3);g.add(stock);
  g.position.set(.26,-.22,-.4);return g;
}
function makeShockMesh(){
  const g=new THREE.Group();
  const _shc=_getWeaponCamoColor('shock');
  const metalM=new THREE.MeshLambertMaterial({color:_shc,emissive:new THREE.Color(_shc),emissiveIntensity:.5});
  const darkM =new THREE.MeshLambertMaterial({color:0x0A0A14});
  const glowM =new THREE.MeshLambertMaterial({color:0xAA44FF,emissive:new THREE.Color(0xAA44FF),emissiveIntensity:1.2});
  const body=new THREE.Mesh(new THREE.BoxGeometry(.088,.082,.44),metalM);
  body.position.set(0,0,.04);g.add(body);
  const barrel=new THREE.Mesh(new THREE.CylinderGeometry(.02,.02,.3,8),darkM);
  barrel.rotation.x=Math.PI/2;barrel.position.z=-.24;g.add(barrel);
  [-1,1].forEach(s=>{
    const prong=new THREE.Mesh(new THREE.CylinderGeometry(.008,.008,.1,6),metalM);
    prong.rotation.x=Math.PI/2;prong.position.set(s*.022,0,-.38);g.add(prong);
    const tip=new THREE.Mesh(new THREE.SphereGeometry(.012,6,6),glowM);
    tip.position.set(s*.022,0,-.44);g.add(tip);
  });
  const cell=new THREE.Mesh(new THREE.CylinderGeometry(.036,.036,.1,8),glowM);
  cell.rotation.x=Math.PI/2;cell.position.set(0,-.046,.02);g.add(cell);
  const grip=new THREE.Mesh(new THREE.BoxGeometry(.052,.12,.056),darkM);
  grip.rotation.x=.18;grip.position.set(0,-.1,.08);g.add(grip);
  const stock=new THREE.Mesh(new THREE.BoxGeometry(.06,.05,.18),metalM);
  stock.position.set(0,.01,.3);g.add(stock);
  g.position.set(.24,-.2,-.42);return g;
}

