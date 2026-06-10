// Locations + state + Three.js + world + characters + weapon mesh
// ═══════════════════════════════════════════════════════════════
//  LOCATION CONFIGS
// ═══════════════════════════════════════════════════════════════
const LOCS = {
  sweden:{
    name:'Sweden', flag:'🇸🇪',
    sky:0x6E8FA8,
    fogColor:new THREE.Color(0x8AAABB), fogDensity:.022,
    ground:0xC6D0D4,
    ambColor:0x4A6888, ambInt:.52,
    sunColor:0xB8CCDE, sunInt:.60, sunPos:[-10,18,14],
    bldColors:[0xBEB09A,0xB2A48C,0xCEC0AE,0x9E8C76,0xBEC2C2,0xB0B8B8,0x8A3A2C,0x963C30,0x7A4E38,0xC8BCA8],
    roofColor:0x881C1C,
    maxH:14,minH:5,bldW:{min:5,max:11},
    hasTrees:true, treeColor:0x254A1C, snowCaps:true,
    roadColor:0x46484C, sidewalkColor:0x84888C,
  },
  beirut:{
    name:'Beirut', flag:'🇱🇧',
    sky:0x3582C4,
    fogColor:new THREE.Color(0x74A0BC), fogDensity:.006,
    ground:0xB8A478,
    ambColor:0xA86010, ambInt:.82,
    sunColor:0xFFD04A, sunInt:1.40, sunPos:[22,42,-4],
    bldColors:[0xCCAE60,0xC09A48,0xB88C36,0xD2B67C,0xC8AC6C,0xDCC488,0xA28850,0xB09464,0xD8C080,0xBCA86A],
    roofColor:0xBC9E60,
    maxH:24,minH:6,bldW:{min:6,max:14},
    hasPalms:true,
    roadColor:0x36342C, sidewalkColor:0x6E665C,
  },
  dubai:{
    name:'Dubai', flag:'🇦🇪',
    sky:0x4080CC,
    fogColor:new THREE.Color(0xBEA86E), fogDensity:.009,
    ground:0xD4C07C,
    ambColor:0xA88210, ambInt:.92,
    sunColor:0xFFEC62, sunInt:1.72, sunPos:[28,56,0],
    bldColors:[0xBEB09A,0xD0C8B4,0xACA49A,0x90A6B8,0x9EB4C8,0xC2C2C2,0xDCD0BC,0xCAC0AC,0xE0D8C8,0x8899AA],
    roofColor:0x7EA4B6,
    maxH:62,minH:12,bldW:{min:8,max:18},
    hasSkyscrapers:true,
    roadColor:0x28261E, sidewalkColor:0xACA49A,
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
let propColliders=[];
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

  // Ground detail
  if(locId==='sweden') buildSnowGround();
  if(locId==='dubai') buildSandDetails();

  // Roads + sidewalks
  buildRoads(locId);

  // Buildings (hand-laid layouts)
  buildBuildings(loc,locId);

  // Background skyline depth
  buildBackgroundSkyline(loc,locId);

  // Street props + cars
  buildStreetlights(locId);
  buildStreetCars(locId);
  buildStreetProps(locId);

  // Vegetation
  if(loc.hasTrees) buildPineTrees(loc,locId);
  if(loc.hasPalms) buildPalmTrees(loc,locId);
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
  // Snow patches near curbs and open areas
  const mat=new THREE.MeshLambertMaterial({color:0xE8EEF2});
  const snowPositions=[
    [-36,14],[-22,13],[12,15],[38,16],[46,13],
    [-38,-14],[-24,-13],[14,-16],[36,-14],[44,-15],
    [-50,0],[50,0],[-12,48],[12,-48],[-60,30],[60,-30],
    [-55,-50],[55,50],[-40,60],[40,-60],
  ];
  snowPositions.forEach(([x,z])=>{
    const r=2+Math.random()*4;
    const m=new THREE.Mesh(new THREE.CylinderGeometry(r,r+0.8,.18,8),mat);
    m.position.set(x+(Math.random()-.5)*4,-.05,z+(Math.random()-.5)*4);
    addToWorld(m);
  });
  // Thin snow layer over whole ground
  const coverMat=new THREE.MeshLambertMaterial({color:0xD8E0E4,transparent:true,opacity:.55});
  const cover=new THREE.Mesh(new THREE.PlaneGeometry(400,400),coverMat);
  cover.rotation.x=-Math.PI/2;cover.position.y=.005;
  addToWorld(cover);
}
function buildSandDetails(){
  // Desert sand ripples and dunes at map edges
  const mat=new THREE.MeshLambertMaterial({color:0xC8AA6A});
  for(let i=0;i<16;i++){
    const angle=Math.random()*Math.PI*2;
    const dist=80+Math.random()*60;
    const r=6+Math.random()*12;
    const m=new THREE.Mesh(new THREE.ConeGeometry(r,.6+Math.random()*.5,8),mat);
    m.position.set(Math.cos(angle)*dist,.05,Math.sin(angle)*dist);
    addToWorld(m);
  }
  // Subtle sand tone overlay on ground near edges
  const edgeMat=new THREE.MeshLambertMaterial({color:0xD8BB80,transparent:true,opacity:.4});
  const edge=new THREE.Mesh(new THREE.PlaneGeometry(400,400),edgeMat);
  edge.rotation.x=-Math.PI/2;edge.position.y=.004;
  addToWorld(edge);
}

function buildBuildings(loc,locId){
  if(locId==='sweden') buildSwedenLayout(loc);
  else if(locId==='beirut') buildBeirutLayout(loc);
  else buildDubaiLayout(loc);
}

function _mkB(loc,locId,plots){
  plots.forEach(([x,z,w,d,hMin,hMax])=>{
    const h=hMin+Math.random()*(hMax-hMin);
    const col=loc.bldColors[Math.floor(Math.random()*loc.bldColors.length)];
    buildings.push(makeBuilding(x,z,w,d,h,col,loc,locId));
  });
}

function buildSwedenLayout(loc){
  _mkB(loc,'sweden',[
    // NW block — brick apartments
    [-42,18,10,8,10,13],[-30,15,9,7,7,10],[-20,17,8,9,9,12],
    [-43,30,11,8,6,9], [-30,32,9,10,11,14],[-20,30,7,7,5,8],
    [-42,44,9,8,7,10], [-28,44,10,9,8,11],
    // NE block
    [20,18,9,8,8,11],  [33,16,8,9,11,14], [45,18,10,7,6,9],
    [21,31,8,8,8,11],  [35,33,11,9,10,13],[47,29,7,7,5,8],
    [22,44,9,8,7,10],  [38,44,8,9,6,9],
    // SW block
    [-42,-18,10,8,8,11],[-30,-16,8,7,6,9],[-19,-19,7,8,10,13],
    [-42,-32,9,9,5,8], [-30,-33,10,8,7,10],[-19,-31,8,7,9,12],
    [-41,-44,9,8,6,9], [-27,-44,8,9,8,11],
    // SE block
    [20,-18,9,8,8,10], [33,-18,8,9,9,12], [45,-20,10,7,6,9],
    [21,-33,7,8,7,10], [35,-32,11,9,11,14],[47,-34,8,8,5,8],
    [22,-44,9,8,6,9],  [38,-44,8,9,7,10],
    // Outer depth
    [-65,0,13,10,8,11],[65,0,12,10,9,12],
    [0,-62,11,12,7,10],[0,62,12,11,10,13],
    [-58,-50,9,8,6,9], [58,-50,8,9,7,10],
    [-58,50,10,9,8,11],[58,50,9,8,6,9],
  ]);
  // Civic landmark — church/town hall silhouette at north edge
  _buildSwedenLandmark();
}

function _buildSwedenLandmark(){
  const g=new THREE.Group();
  const mat=new THREE.MeshLambertMaterial({color:0xCCBBAA});
  const stoneMat=new THREE.MeshLambertMaterial({color:0xA89880});
  const roofMat=new THREE.MeshLambertMaterial({color:0x3A1010});
  // Main nave
  const nave=new THREE.Mesh(new THREE.BoxGeometry(14,10,22),mat);
  nave.position.y=5;g.add(nave);
  // Tower
  const tower=new THREE.Mesh(new THREE.BoxGeometry(7,16,7),stoneMat);
  tower.position.set(0,8,13);g.add(tower);
  // Spire
  const spire=new THREE.Mesh(new THREE.ConeGeometry(3.5,10,4),roofMat);
  spire.position.set(0,21,13);spire.rotation.y=Math.PI/4;g.add(spire);
  // Pitched nave roof
  const naveRoof=new THREE.Mesh(new THREE.ConeGeometry(8,5,4),roofMat);
  naveRoof.position.set(0,12.5,-2);naveRoof.rotation.y=Math.PI/4;
  naveRoof.scale.set(1,1,2.4);g.add(naveRoof);
  // Windows
  const winMat=new THREE.MeshLambertMaterial({color:0xFFEEAA,emissive:new THREE.Color(0xFFCC66),emissiveIntensity:.4});
  [-4,0,4].forEach(wx=>{
    const w=new THREE.Mesh(new THREE.BoxGeometry(.6,2.4,.1),winMat);
    w.position.set(wx,5.5,11.1);g.add(w);
  });
  g.position.set(-2,0,-68);
  addToWorld(g);
}

function buildBeirutLayout(loc){
  _mkB(loc,'beirut',[
    // NW dense block
    [-40,18,12,9,12,18],[-26,15,10,8,8,14],[-14,17,9,11,14,20],
    [-40,32,11,10,10,16],[-26,34,12,9,14,22],[-14,32,8,12,8,13],
    [-38,46,13,8,7,11], [-24,46,9,11,12,18],
    // NE dense block
    [14,17,9,11,14,22], [28,15,10,8,8,14], [42,18,12,9,10,16],
    [14,32,8,12,8,13],  [28,34,12,9,14,22],[42,32,11,10,10,16],
    [26,46,9,11,12,18], [40,46,13,8,7,11],
    // SW dense block
    [-40,-18,12,9,10,16],[-26,-15,10,8,8,14],[-14,-17,9,11,14,22],
    [-40,-32,11,10,8,12],[-26,-34,12,9,14,22],[-14,-32,8,12,8,14],
    [-38,-46,13,8,6,10],[-24,-46,9,11,11,18],
    // SE dense block
    [14,-17,9,11,14,22],[28,-15,10,8,8,14],[42,-18,12,9,10,16],
    [14,-32,8,12,8,14], [28,-34,12,9,14,22],[42,-32,11,10,8,12],
    [26,-46,9,11,11,18],[40,-46,13,8,6,10],
    // Outer depth
    [-68,0,14,11,10,16],[68,0,14,11,10,16],
    [0,-65,12,14,8,14], [0,65,13,12,12,18],
    [-60,-55,11,9,8,13],[60,-55,9,11,9,14],
    [-60,55,10,10,10,16],[60,55,10,10,8,13],
  ]);
}

function buildDubaiLayout(loc){
  _mkB(loc,'dubai',[
    // Central tower cluster
    [-8,-34,14,14,48,62],  [12,-24,12,12,38,52],
    [-6,-50,10,10,32,46],  [22,-44,11,11,28,40],
    [-20,-44,10,10,25,38],
    // Mid-rise luxury ring
    [-38,-18,14,12,18,26],[38,-18,14,12,18,26],
    [-38,-40,12,12,16,24],[38,-40,12,12,16,24],
    [-20,-62,16,13,14,20],[22,-62,16,13,14,20],
    [0,-66,18,14,12,18],
    // North side
    [-38,18,14,12,16,24],[38,18,14,12,16,24],
    [-20,30,12,11,20,32],[20,30,12,11,20,32],
    [-38,40,11,12,14,20],[38,40,11,12,14,20],
    [0,44,14,14,22,35],
    // Outer depth
    [-66,-20,12,10,20,35],[66,-20,12,10,20,35],
    [-66,20,11,11,18,28],[66,20,11,11,18,28],
    [0,-82,16,14,15,25],
    [-55,-56,10,10,18,30],[55,-56,10,10,18,30],
    [-55,56,10,10,15,25],[55,56,10,10,15,25],
  ]);
}

function makeBuilding(x,z,w,d,h,colorHex,loc,locId){
  const g=new THREE.Group();
  g.position.set(x,0,z);

  const bodyMat=new THREE.MeshLambertMaterial({color:colorHex});

  // Dubai tall towers: glass tint
  if(locId==='dubai'&&h>28){
    bodyMat.color.setHex(0x9AB4C8);
    bodyMat.emissive=new THREE.Color(0x001830);
    bodyMat.emissiveIntensity=.18;
  }

  // Main body
  const bodyMesh=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),bodyMat);
  bodyMesh.position.y=h/2;
  bodyMesh.castShadow=true;bodyMesh.receiveShadow=true;
  g.add(bodyMesh);

  // Horizontal floor-band trim
  const trimC=new THREE.Color(colorHex).offsetHSL(0,0,-.09);
  const trimMat=new THREE.MeshLambertMaterial({color:trimC});
  const floors=Math.max(1,Math.floor(h/3.0));
  for(let f=1;f<floors;f++){
    const trim=new THREE.Mesh(new THREE.BoxGeometry(w+.12,.1,d+.12),trimMat);
    trim.position.y=f*3.0;g.add(trim);
  }

  // Windows — front, back, left, right
  const wLitMat=new THREE.MeshLambertMaterial({color:0xFFEE99,emissive:new THREE.Color(0xFFCC44),emissiveIntensity:.28});
  const wDarkMat=new THREE.MeshLambertMaterial({color:0x1A2C3A});
  const wpcX=Math.max(1,Math.floor(w/2.8));
  const wpcZ=Math.max(1,Math.floor(d/2.8));
  for(let f=0;f<floors;f++){
    const y=1.5+f*3.0;
    // Front + back
    for(let wi=0;wi<wpcX;wi++){
      const wx=-w/2+(wi+.5)*(w/wpcX);
      const lit=Math.random()>.3;
      const wg=new THREE.BoxGeometry(.72,.9,.07);
      const mf=new THREE.Mesh(wg,lit?wLitMat:wDarkMat);
      mf.position.set(wx,y,d/2+.04);g.add(mf);
      const mb=mf.clone();mb.position.z=-(d/2+.04);g.add(mb);
    }
    // Left + right
    for(let wi=0;wi<wpcZ;wi++){
      const wz=-d/2+(wi+.5)*(d/wpcZ);
      const lit=Math.random()>.3;
      const wg=new THREE.BoxGeometry(.07,.9,.72);
      const ml=new THREE.Mesh(wg,lit?wLitMat:wDarkMat);
      ml.position.set(w/2+.04,y,wz);g.add(ml);
      const mr=ml.clone();mr.position.x=-(w/2+.04);g.add(mr);
    }
  }

  // Parapet walls around rooftop
  const parMat=new THREE.MeshLambertMaterial({color:locId==='sweden'?loc.roofColor:new THREE.Color(colorHex).offsetHSL(0,0,-.06)});
  const parH=.55;
  [[w,.3,0,d/2+.15],[w,.3,0,-(d/2+.15)],[.3,d,w/2+.15,0],[.3,d,-(w/2+.15),0]].forEach(([pw,pd,px,pz])=>{
    const p=new THREE.Mesh(new THREE.BoxGeometry(pw,parH,pd),parMat);
    p.position.set(px,h+parH/2,pz);g.add(p);
  });

  // === SWEDEN roof + detail ===
  if(locId==='sweden'){
    const roofMat=new THREE.MeshLambertMaterial({color:loc.roofColor});
    if(Math.random()>.38){
      // Pitched roof
      const cone=new THREE.ConeGeometry(Math.min(w,d)*.62,h*.36,4);
      const tip=new THREE.Mesh(cone,roofMat);
      tip.position.y=h+h*.18;tip.rotation.y=Math.PI/4;g.add(tip);
      // Chimney
      const chiM=new THREE.MeshLambertMaterial({color:0x7A3220});
      const ch=new THREE.Mesh(new THREE.BoxGeometry(.52,1.6,.52),chiM);
      ch.position.set((Math.random()-.5)*w*.3,h+h*.28,(Math.random()-.5)*d*.3);g.add(ch);
      // Chimney cap
      const cap=new THREE.Mesh(new THREE.BoxGeometry(.78,.15,.78),chiM);
      cap.position.set(ch.position.x,ch.position.y+.85,ch.position.z);g.add(cap);
    } else {
      const flat=new THREE.Mesh(new THREE.BoxGeometry(w+.18,.22,d+.18),roofMat);
      flat.position.y=h+.11;g.add(flat);
    }
    if(loc.snowCaps){
      const snowM=new THREE.MeshLambertMaterial({color:0xE8EEF2});
      const snow=new THREE.Mesh(new THREE.BoxGeometry(w+.1,.16,d+.1),snowM);
      snow.position.y=h+.32;g.add(snow);
    }
  } else {
    // Flat roof slab
    const flatM=new THREE.MeshLambertMaterial({color:loc.roofColor});
    const flat=new THREE.Mesh(new THREE.BoxGeometry(w+.16,.28,d+.16),flatM);
    flat.position.y=h+.14;g.add(flat);
  }

  // === BEIRUT rooftop detail ===
  if(locId==='beirut'){
    // Water tank (50% chance)
    if(Math.random()>.45){
      const tkM=new THREE.MeshLambertMaterial({color:0x8A6840});
      const tank=new THREE.Mesh(new THREE.CylinderGeometry(.72,.72,1.5,8),tkM);
      const tx=(Math.random()-.5)*(w-2),tz=(Math.random()-.5)*(d-2);
      tank.position.set(tx,h+1.1,tz);g.add(tank);
      const legM=new THREE.MeshLambertMaterial({color:0x505050});
      for(let ti=0;ti<4;ti++){
        const lx=Math.cos(ti*Math.PI/2)*.5,lz=Math.sin(ti*Math.PI/2)*.5;
        const leg=new THREE.Mesh(new THREE.BoxGeometry(.08,.55,.08),legM);
        leg.position.set(tx+lx,h+.4,tz+lz);g.add(leg);
      }
    }
    // Satellite dish (40% chance)
    if(Math.random()>.55){
      const dishM=new THREE.MeshLambertMaterial({color:0xCCCCCC});
      const dish=new THREE.Mesh(new THREE.CylinderGeometry(.6,.6,.06,10),dishM);
      dish.rotation.x=Math.PI/4;
      dish.position.set((Math.random()-.5)*(w-1.5),h+.6,(Math.random()-.5)*(d-1.5));g.add(dish);
    }
    // Balconies
    if(h>10){
      const balM=new THREE.MeshLambertMaterial({color:new THREE.Color(colorHex).offsetHSL(0,0,-.04)});
      const railM=new THREE.MeshLambertMaterial({color:0x777777});
      const nbBal=Math.floor(Math.random()*3)+1;
      for(let bi=0;bi<nbBal;bi++){
        const bf=Math.floor(1+Math.random()*(floors-1));
        const slab=new THREE.Mesh(new THREE.BoxGeometry(w*.48,.14,1.3),balM);
        slab.position.set(0,bf*3.0+.07,d/2+.65);g.add(slab);
        const rail=new THREE.Mesh(new THREE.BoxGeometry(w*.48,.75,.06),railM);
        rail.position.set(0,bf*3.0+.45,d/2+1.3);g.add(rail);
      }
    }
  }

  // === DUBAI rooftop detail ===
  if(locId==='dubai'){
    if(h>30){
      // Tower setback near top
      const sbH=h*.14;
      const sbMat=bodyMat.clone();sbMat.color.offsetHSL(0,0,.06);
      const sb=new THREE.Mesh(new THREE.BoxGeometry(w*.72,sbH,d*.72),sbMat);
      sb.position.y=h-sbH/2;g.add(sb);
      // Antenna spire
      const antM=new THREE.MeshLambertMaterial({color:0xCCCCCC});
      const ant=new THREE.Mesh(new THREE.CylinderGeometry(.1,.25,h*.18,6),antM);
      ant.position.y=h+h*.09;g.add(ant);
    }
    // Balconies on mid-high floors
    if(h>16&&Math.random()>.38){
      const balM=new THREE.MeshLambertMaterial({color:0x7A9488});
      const nbBal=Math.floor(Math.random()*4)+2;
      for(let bi=0;bi<nbBal;bi++){
        const bf=2+bi*Math.floor((floors-2)/(nbBal));
        const slab=new THREE.Mesh(new THREE.BoxGeometry(w*.62,.18,1.4),balM);
        slab.position.set(0,bf*3.0+.09,d/2+.7);g.add(slab);
      }
    }
  }

  // AC units (all maps)
  if(Math.random()>.44){
    const acM=new THREE.MeshLambertMaterial({color:0x848484});
    const nAC=Math.floor(Math.random()*3)+1;
    for(let ai=0;ai<nAC;ai++){
      const ac=new THREE.Mesh(new THREE.BoxGeometry(.95,.52,.62),acM);
      ac.position.set((Math.random()-.5)*(w-1.8),h+.56,(Math.random()-.5)*(d-1.8));g.add(ac);
    }
  }

  // Street-level entrance: recessed door + frame + canopy (front face)
  {
    const doorM=new THREE.MeshLambertMaterial({color:locId==='dubai'?0x223844:0x2A1E12});
    const frameM=new THREE.MeshLambertMaterial({color:new THREE.Color(colorHex).offsetHSL(0,0,-.14)});
    const dx=(Math.random()-.5)*(w*.4);
    const frame=new THREE.Mesh(new THREE.BoxGeometry(1.7,2.5,.14),frameM);
    frame.position.set(dx,1.25,d/2+.06);g.add(frame);
    const door=new THREE.Mesh(new THREE.BoxGeometry(1.25,2.2,.08),doorM);
    door.position.set(dx,1.1,d/2+.13);g.add(door);
    // canopy slab over entrance
    const can=new THREE.Mesh(new THREE.BoxGeometry(2.2,.12,1.0),frameM);
    can.position.set(dx,2.62,d/2+.5);g.add(can);
    // step
    const step=new THREE.Mesh(new THREE.BoxGeometry(2.0,.14,.7),frameM);
    step.position.set(dx,.07,d/2+.35);g.add(step);
  }

  addToWorld(g);
  return{group:g,bodyMesh,bodyMat,health:3,maxHealth:3,isDestroyed:false,
    h,pos:{x,z},originalColor:colorHex,w,d};
}

function buildPineTrees(loc,locId){
  const trunkMat=new THREE.MeshLambertMaterial({color:0x4E3018});
  const leafMat=new THREE.MeshLambertMaterial({color:loc.treeColor});
  const snowMat=new THREE.MeshLambertMaterial({color:0xE4EAF0});
  // Street-side positions + scattered
  const treePos=[
    // Along main E-W road sides
    [-60,9],[-48,9],[-36,9],[-24,9],[24,9],[36,9],[48,9],[60,9],
    [-60,-9],[-48,-9],[-36,-9],[-24,-9],[24,-9],[36,-9],[48,-9],[60,-9],
    // Along N-S road
    [9,40],[9,22],[-9,40],[-9,22],[9,-40],[9,-22],[-9,-40],[-9,-22],
    // Outer areas
    [-52,52],[-38,52],[38,52],[52,52],
    [-52,-52],[-38,-52],[38,-52],[52,-52],
    [-70,20],[-70,-20],[70,20],[70,-20],
    [-35,66],[35,66],[-35,-66],[35,-66],
  ];
  treePos.forEach(([tx,tz])=>{
    const g=new THREE.Group();
    const trunk=new THREE.Mesh(new THREE.CylinderGeometry(.16,.2,1.9,6),trunkMat);
    trunk.position.y=.95;g.add(trunk);
    const tiers=3;
    for(let t=0;t<tiers;t++){
      const r=(tiers-t)*.82;
      const cone=new THREE.Mesh(new THREE.ConeGeometry(r,r*1.15,7),leafMat);
      cone.position.y=1.8+t*r*.62;g.add(cone);
      if(loc.snowCaps){
        const scr=(tiers-t)*.22;
        const sc=new THREE.Mesh(new THREE.ConeGeometry(scr,.7,7),snowMat);
        sc.position.y=1.8+t*r*.62+r*.5;g.add(sc);
      }
    }
    g.position.set(tx+(Math.random()-.5)*1.5,0,tz+(Math.random()-.5)*1.5);
    addToWorld(g);
  });
}

function buildPalmTrees(loc,locId){
  const trunkMat=new THREE.MeshLambertMaterial({color:0x8C6C1E});
  const leafMat=new THREE.MeshLambertMaterial({color:0x3CA42E});
  // Positioned along boulevards and plazas
  let palmPos=[];
  if(locId==='beirut'){
    // Along main roads
    for(let x=-65;x<=65;x+=14) palmPos.push([x,8.5],[x,-8.5]);
    // Scattered in blocks
    [[-48,24],[-34,28],[-20,46],[20,46],[34,28],[48,24],
     [-48,-24],[-34,-28],[20,-46],[34,-28],[48,-24],[-20,-46],
     [-68,14],[68,14],[-68,-14],[68,-14]].forEach(p=>palmPos.push(p));
  } else { // dubai
    // Along central boulevard median
    for(let x=-78;x<=78;x+=16) palmPos.push([x,1.5],[x,-1.5]);
    // Along side roads
    for(let z=-70;z<=70;z+=18) palmPos.push([11.5,z],[-11.5,z]);
    // Plazas
    [[-30,44],[0,44],[30,44],[-30,-65],[0,-66],[30,-65],
     [-55,0],[55,0]].forEach(p=>palmPos.push(p));
  }
  palmPos.forEach(([tx,tz])=>{
    const g=new THREE.Group();
    const ph=5+Math.random()*3.5;
    const lean=new THREE.Group();
    const trunk=new THREE.Mesh(new THREE.CylinderGeometry(.16,.26,ph,7),trunkMat);
    trunk.position.y=ph/2;lean.add(trunk);
    // Fronds
    for(let l=0;l<7;l++){
      const angle=l/7*Math.PI*2;
      const frond=new THREE.Mesh(new THREE.BoxGeometry(.14,1.6,.05),leafMat);
      frond.position.set(Math.cos(angle)*1.2,ph+.2,Math.sin(angle)*1.2);
      frond.rotation.z=Math.cos(angle)*.55;frond.rotation.x=Math.sin(angle)*.55;
      lean.add(frond);
      // Secondary frond tip
      const tip=new THREE.Mesh(new THREE.BoxGeometry(.08,1.0,.04),leafMat);
      tip.position.set(Math.cos(angle)*2.1,ph-.4,Math.sin(angle)*2.1);
      tip.rotation.z=Math.cos(angle)*.8;tip.rotation.x=Math.sin(angle)*.8;
      lean.add(tip);
    }
    lean.rotation.z=(Math.random()-.5)*.12;
    g.add(lean);
    g.position.set(tx+(Math.random()-.5)*1.8,0,tz+(Math.random()-.5)*1.8);
    addToWorld(g);
  });
}

function buildSkyscraperDetails(loc){
  // Dubai landmark tower cluster — signature tall tower
  const cx=-8,cz=-34;
  const h=loc.maxH;
  const g=new THREE.Group();
  const mat=new THREE.MeshLambertMaterial({color:0x8AAABB,emissive:new THREE.Color(0x001A33),emissiveIntensity:.22});
  // Base podium
  const pod=new THREE.Mesh(new THREE.BoxGeometry(20,8,20),
    new THREE.MeshLambertMaterial({color:0xCCBBA0}));
  pod.position.y=4;pod.castShadow=true;g.add(pod);
  // Main tower
  const body=new THREE.Mesh(new THREE.BoxGeometry(14,h,14),mat);
  body.position.y=h/2+8;body.castShadow=true;g.add(body);
  // Mid setback
  const mid=new THREE.Mesh(new THREE.BoxGeometry(10,h*.3,10),mat.clone());
  mid.position.y=h*.7+8;g.add(mid);
  // Spire
  const spire=new THREE.Mesh(new THREE.CylinderGeometry(.22,1.1,h*.28,8),
    new THREE.MeshLambertMaterial({color:0xDDEEFF,emissive:new THREE.Color(0x4488AA),emissiveIntensity:.3}));
  spire.position.y=h*1.14+8;g.add(spire);
  // Beacon light
  const tl=new THREE.PointLight(0xFF4444,.9,35);tl.position.y=h*1.3+8;g.add(tl);
  // Horizontal band details
  const bandM=new THREE.MeshLambertMaterial({color:0xCCDDEE});
  for(let f=2;f<Math.floor(h/4);f++){
    const band=new THREE.Mesh(new THREE.BoxGeometry(14.3,.15,14.3),bandM);
    band.position.y=f*4+8;g.add(band);
  }
  g.position.set(cx,0,cz);
  addToWorld(g);
  buildings.push({group:g,bodyMesh:body,bodyMat:mat,health:5,maxHealth:5,
    isDestroyed:false,h:h+8,pos:{x:cx,z:cz},originalColor:0x8AAABB,w:14,d:14});
}


// ═══════════════════════════════════════════════════════════════
//  STREETS & PROPS
// ═══════════════════════════════════════════════════════════════
function buildRoads(locId){
  const loc=LOCS[locId];
  const roadMat=new THREE.MeshLambertMaterial({color:loc.roadColor||0x484848});
  const swMat=new THREE.MeshLambertMaterial({color:loc.sidewalkColor||0x888888});
  const lineM=new THREE.MeshLambertMaterial({color:0xEEEE77});
  const crossM=new THREE.MeshLambertMaterial({color:0xDDDDCC});

  function road(x,z,w,d){
    const m=new THREE.Mesh(new THREE.PlaneGeometry(w,d),roadMat);
    m.rotation.x=-Math.PI/2;m.position.set(x,.01,z);addToWorld(m);
  }
  function sidewalk(x,z,w,d){
    const m=new THREE.Mesh(new THREE.BoxGeometry(w,.13,d),swMat);
    m.position.set(x,.065,z);addToWorld(m);
  }
  function dashLine(x,z,rot){
    const m=new THREE.Mesh(new THREE.PlaneGeometry(.45,3.8),lineM);
    m.rotation.x=-Math.PI/2;m.rotation.z=rot||0;m.position.set(x,.02,z);addToWorld(m);
  }

  if(locId==='sweden'){
    road(0,0,160,10);road(0,0,10,140);
    road(-31,24,26,7);road(31,24,26,7);
    road(-31,-24,26,7);road(31,-24,26,7);
    sidewalk(0,6.5,160,2.2);sidewalk(0,-6.5,160,2.2);
    sidewalk(6.5,0,2.2,140);sidewalk(-6.5,0,2.2,140);
    // Lane dashes on main roads
    for(let lx=-72;lx<=72;lx+=10) dashLine(lx,0,0);
    for(let lz=-64;lz<=64;lz+=10) dashLine(0,lz,Math.PI/2);
  } else if(locId==='beirut'){
    road(0,0,160,10);road(0,0,8,120);
    road(-28,20,36,6);road(28,20,36,6);
    road(-28,-20,36,6);road(28,-20,36,6);
    road(-28,0,8,40);road(28,0,8,40);
    sidewalk(0,6.5,160,2.2);sidewalk(0,-6.5,160,2.2);
    sidewalk(6,0,2.2,120);sidewalk(-6,0,2.2,120);
    for(let lx=-72;lx<=72;lx+=10) dashLine(lx,0,0);
    for(let lz=-55;lz<=55;lz+=10) dashLine(0,lz,Math.PI/2);
  } else { // dubai
    road(0,0,180,16);road(0,0,16,160);
    road(0,26,180,8);road(0,-26,180,8);
    road(-40,0,8,55);road(40,0,8,55);
    // Landscaped median strips
    const medMat=new THREE.MeshLambertMaterial({color:0x527A3A});
    [[0,2.8,180,.14,3],[0,-2.8,180,.14,3]].forEach(([x,z,w,h,d])=>{
      const med=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),medMat);
      med.position.set(x,h/2,z);addToWorld(med);
    });
    sidewalk(0,11,180,3.5);sidewalk(0,-11,180,3.5);
    sidewalk(11,0,3.5,160);sidewalk(-11,0,3.5,160);
    for(let lx=-85;lx<=85;lx+=12) dashLine(lx,0,0);
    for(let lz=-75;lz<=75;lz+=12) dashLine(0,lz,Math.PI/2);
  }
}

function buildStreetlights(locId){
  const poleMat=new THREE.MeshLambertMaterial({color:0x828282});
  const bulbMat=new THREE.MeshLambertMaterial({color:0xFFEECC,emissive:new THREE.Color(0xFFDD99),emissiveIntensity:.85});

  function lamp(x,z,armDir){
    const g=new THREE.Group();
    const pole=new THREE.Mesh(new THREE.CylinderGeometry(.09,.11,6.5,6),poleMat);
    pole.position.y=3.25;g.add(pole);
    const arm=new THREE.Mesh(new THREE.BoxGeometry(2,.1,.1),poleMat);
    arm.position.set(armDir*1,6.6,0);g.add(arm);
    const bulb=new THREE.Mesh(new THREE.SphereGeometry(.22,6,4),bulbMat);
    bulb.position.set(armDir*2,6.4,0);g.add(bulb);
    g.position.set(x,0,z);addToWorld(g);
  }

  if(locId==='sweden'){
    for(let x=-70;x<=70;x+=18){lamp(x,7,1);lamp(x,-7,-1);}
    for(let z=-62;z<=62;z+=18){lamp(7,z,1);lamp(-7,z,-1);}
  } else if(locId==='beirut'){
    for(let x=-72;x<=72;x+=16){lamp(x,7,1);lamp(x,-7,-1);}
    for(let z=-56;z<=56;z+=16){lamp(7,z,1);lamp(-7,z,-1);}
  } else {
    for(let x=-82;x<=82;x+=20){lamp(x,12,1);lamp(x,-12,-1);}
    for(let z=-72;z<=72;z+=20){lamp(12,z,1);lamp(-12,z,-1);}
    // Median lights
    for(let x=-80;x<=80;x+=24){lamp(x,0,1);}
  }
}

function buildBackgroundSkyline(loc,locId){
  const count=28;
  for(let i=0;i<count;i++){
    const angle=(i/count)*Math.PI*2+(Math.random()-.5)*.2;
    const dist=82+Math.random()*28;
    const bx=Math.cos(angle)*dist,bz=Math.sin(angle)*dist;
    const bw=10+Math.random()*18,bd=8+Math.random()*14;
    let bh;
    if(locId==='dubai') bh=14+Math.random()*38;
    else if(locId==='beirut') bh=8+Math.random()*18;
    else bh=5+Math.random()*12;
    const silCol=locId==='dubai'?0x4E6070:locId==='beirut'?0x7A6848:0x485258;
    const m=new THREE.MeshLambertMaterial({color:silCol,transparent:true,opacity:.6});
    const mesh=new THREE.Mesh(new THREE.BoxGeometry(bw,bh,bd),m);
    mesh.position.set(bx,bh/2,bz);addToWorld(mesh);
  }
}

function buildStreetCars(locId){
  propColliders=propColliders.filter(p=>!p._isCar&&!p._isProp);
  const palettes={
    sweden:[0x22448A,0xAA2020,0x888888,0xEEEECC,0x336633],
    beirut:[0xBB8833,0x44551E,0x886644,0xCCBB88,0x883333],
    dubai: [0x1E1E1E,0xCCBB99,0xAA8830,0x334455,0xEEEEEE],
  };
  const cols=palettes[locId];

  function car(x,z,ry){
    const transverse=Math.abs(Math.sin(ry))>.7;
    propColliders.push({x,z,w:transverse?5.2:2.8,d:transverse?2.8:5.2,_isCar:true});
    const col=cols[Math.floor(Math.random()*cols.length)];
    const g=new THREE.Group();
    const bM=new THREE.MeshLambertMaterial({color:col});
    const body=new THREE.Mesh(new THREE.BoxGeometry(2.2,.88,4.4),bM);
    body.position.y=.64;g.add(body);
    const top=new THREE.Mesh(new THREE.BoxGeometry(1.8,.68,2.1),bM);
    top.position.set(0,1.22,-.25);g.add(top);
    const wM=new THREE.MeshLambertMaterial({color:0x334455,transparent:true,opacity:.75});
    const winF=new THREE.Mesh(new THREE.BoxGeometry(1.6,.52,.08),wM);
    winF.position.set(0,1.24,.85);g.add(winF);
    const whM=new THREE.MeshLambertMaterial({color:0x181818});
    [[-0.88,1.4],[-0.88,-1.4],[0.88,1.4],[0.88,-1.4]].forEach(([wx,wz])=>{
      const wh=new THREE.Mesh(new THREE.CylinderGeometry(.28,.28,.2,8),whM);
      wh.rotation.z=Math.PI/2;wh.position.set(wx,.28,wz);g.add(wh);
    });
    g.position.set(x,.0,z);g.rotation.y=ry;addToWorld(g);
  }

  const carData={
    sweden:[[-16,7.5,0],[6,7.5,.1],[32,-7.5,Math.PI],[-10,-7.5,Math.PI],
            [22,6.5,0],[-42,6.5,0],[7,22,Math.PI/2],[7,-32,-Math.PI/2],
            [-28,7.5,0],[44,-7.5,Math.PI]],
    beirut:[[-18,6.5,0],[8,6.5,.05],[-5,-7,Math.PI],[28,-7,Math.PI],
            [-30,6.5,0],[15,28,Math.PI/2],[-10,-28,-Math.PI/2],[7,-30,-Math.PI/2],
            [42,6.5,0],[-44,-7,Math.PI]],
    dubai: [[-30,12,0],[0,12,0],[30,12,0],[-15,-12,Math.PI],[15,-12,Math.PI],
            [10,29,Math.PI/2],[-10,-27,-Math.PI/2],[42,12,0],[-42,12,0],
            [0,-27,-Math.PI/2],[55,12,0],[-55,12,0]],
  };
  (carData[locId]||[]).forEach(([x,z,ry])=>car(x,z,ry));
}

function buildStreetProps(locId){
  const darkMat=new THREE.MeshLambertMaterial({color:0x222222});

  function barrier(x,z,ry){
    const transverse=Math.abs(Math.sin(ry||0))>.7;
    propColliders.push({x,z,w:transverse?.9:3.2,d:transverse?3.2:.9,_isProp:true});
    const m=new THREE.MeshLambertMaterial({color:locId==='dubai'?0xCCCCCC:0xCC8800});
    const g=new THREE.Group();
    const b=new THREE.Mesh(new THREE.BoxGeometry(2.8,.7,.4),m);
    b.position.y=.35;g.add(b);
    g.position.set(x,0,z);g.rotation.y=ry||0;addToWorld(g);
  }
  function bench(x,z,ry){
    const woodM=new THREE.MeshLambertMaterial({color:0x8B5E2A});
    const metalM=new THREE.MeshLambertMaterial({color:0x445566});
    const g=new THREE.Group();
    const seat=new THREE.Mesh(new THREE.BoxGeometry(2,.12,0.52),woodM);
    seat.position.y=.52;g.add(seat);
    [-0.8,0.8].forEach(lx=>{
      const leg=new THREE.Mesh(new THREE.BoxGeometry(.08,.5,.08),metalM);
      leg.position.set(lx,.25,0);g.add(leg);
    });
    const back=new THREE.Mesh(new THREE.BoxGeometry(2,.55,.08),woodM);
    back.position.set(0,.88,.22);g.add(back);
    g.position.set(x,0,z);g.rotation.y=ry||0;addToWorld(g);
  }
  function trashBin(x,z){
    const m=new THREE.MeshLambertMaterial({color:0x336633});
    const b=new THREE.Mesh(new THREE.CylinderGeometry(.24,.2,.72,8),m);
    b.position.set(x,.36,z);addToWorld(b);
  }
  function bollard(x,z){
    const m=new THREE.MeshLambertMaterial({color:0x333344});
    const b=new THREE.Mesh(new THREE.CylinderGeometry(.15,.18,.8,7),m);
    b.position.set(x,.4,z);addToWorld(b);
  }

  if(locId==='sweden'){
    bench(-8,7.8,0);bench(8,7.8,Math.PI);bench(-8,-7.8,0);bench(8,-7.8,Math.PI);
    trashBin(-14,7.5);trashBin(14,7.5);trashBin(-14,-7.5);trashBin(14,-7.5);
    barrier(-12,6.5,0);barrier(12,-6.5,0);
    [-5,-3,3,5].forEach(x=>bollard(x,6.5));
    [-5,-3,3,5].forEach(x=>bollard(x,-6.5));
    // Snow piles at curbs
    const snowM=new THREE.MeshLambertMaterial({color:0xDEE6EC});
    [[-20,7.5],[20,7.5],[-40,7.5],[40,7.5],[-20,-7.5],[20,-7.5],[-40,-7.5],[40,-7.5]].forEach(([x,z])=>{
      const pile=new THREE.Mesh(new THREE.SphereGeometry(1.2+Math.random()*.5,7,4),snowM);
      pile.scale.y=.38;pile.position.set(x+Math.random()-.5,.05,z);addToWorld(pile);
    });
  } else if(locId==='beirut'){
    bench(-10,7.5,0);bench(10,7.5,Math.PI);bench(-10,-7.5,0);bench(10,-7.5,Math.PI);
    trashBin(-16,7);trashBin(16,7);trashBin(-16,-7);trashBin(16,-7);
    barrier(-8,6.5,0);barrier(8,-6.5,0);barrier(-30,6.5,.1);barrier(30,-6.5,.1);
    [-6,-4,4,6].forEach(x=>bollard(x,6.8));
    [-6,-4,4,6].forEach(x=>bollard(x,-6.8));
    // Concrete dividers
    const concM=new THREE.MeshLambertMaterial({color:0xAA9966});
    [[-22,0],[22,0],[-22,20],[22,20],[-22,-20],[22,-20]].forEach(([x,z])=>{
      propColliders.push({x,z,w:.9,d:4.0,_isProp:true});
      const div=new THREE.Mesh(new THREE.BoxGeometry(.5,1.0,3.5),concM);
      div.position.set(x,.5,z);addToWorld(div);
    });
  } else { // dubai
    bench(-12,12,0);bench(12,12,Math.PI);bench(-12,-12,0);bench(12,-12,Math.PI);
    trashBin(-18,11.5);trashBin(18,11.5);trashBin(-18,-11.5);trashBin(18,-11.5);
    // Luxury bollards along boulevard
    for(let x=-78;x<=78;x+=12){bollard(x,11.5);bollard(x,-11.5);}
    barrier(-45,11,0);barrier(45,-11,0);
    // Open plaza tiles near tower cluster
    const tileM=new THREE.MeshLambertMaterial({color:0xD8D0C0});
    const plaza=new THREE.Mesh(new THREE.PlaneGeometry(28,28),tileM);
    plaza.rotation.x=-Math.PI/2;plaza.position.set(0,-56,.02);addToWorld(plaza);
    // Plaza grid lines
    const lineM2=new THREE.MeshLambertMaterial({color:0xC0B8A8});
    for(let lx=-12;lx<=12;lx+=4){
      const ln=new THREE.Mesh(new THREE.PlaneGeometry(.1,28),lineM2);
      ln.rotation.x=-Math.PI/2;ln.position.set(lx,-56,.03);addToWorld(ln);
    }
  }
}

// ═══════════════════════════════════════════════════════════════
//  CHARACTER MODEL (Preview)
// ═══════════════════════════════════════════════════════════════
function makeCharModel(c){
  const g=new THREE.Group();
  const armorC=new THREE.Color(c.outfitColor);
  const visorC=new THREE.Color(c.visorColor);
  const skinHex=c.skinTone||'#E8C49A';
  // Derived shades — undersuit is a darkened outfit tone, trim slightly lighter
  const underC=armorC.clone().multiplyScalar(.42);
  const plateC=armorC.clone();
  const trimC =armorC.clone().multiplyScalar(1.25);
  const style=c.armorStyle||'standard';
  const heavy=style==='heavy', stealth=style==='stealth', light=style==='light';

  const darkM =new THREE.MeshLambertMaterial({color:0x14161C});
  const gearM =new THREE.MeshLambertMaterial({color:0x1E222A});
  const skinM =new THREE.MeshLambertMaterial({color:new THREE.Color(skinHex)});
  const underM=new THREE.MeshLambertMaterial({color:underC});
  const plateM=new THREE.MeshLambertMaterial({color:plateC});
  const trimM =new THREE.MeshLambertMaterial({color:trimC});
  const visorM=new THREE.MeshLambertMaterial({color:visorC,emissive:visorC,emissiveIntensity:.45});
  const bootM =new THREE.MeshLambertMaterial({color:0x17130E});
  const strapM=new THREE.MeshLambertMaterial({color:0x101114});

  const tW=heavy?.56:stealth?.36:light?.42:.46;       // torso width
  const tH=heavy?.62:.58;                              // torso height
  const limb=heavy?1.18:stealth?.88:1;                 // limb thickness mult

  // ── Boots: sole + upper + cuff
  [-1,1].forEach(s=>{
    const sole=new THREE.Mesh(new THREE.BoxGeometry(.19*limb,.05,.26),darkM);
    sole.position.set(s*.125,.025,.02);g.add(sole);
    const boot=new THREE.Mesh(new THREE.BoxGeometry(.17*limb,.16,.22),bootM);
    boot.position.set(s*.125,.13,.01);g.add(boot);
    const cuff=new THREE.Mesh(new THREE.BoxGeometry(.18*limb,.06,.21),gearM);
    cuff.position.set(s*.125,.235,0);g.add(cuff);
  });
  // ── Legs: shin (undersuit) + thigh (outfit) + knee pad
  [-1,1].forEach(s=>{
    const shin=new THREE.Mesh(new THREE.BoxGeometry(.145*limb,.26,.16),underM);
    shin.position.set(s*.125,.39,0);g.add(shin);
    const thigh=new THREE.Mesh(new THREE.BoxGeometry(.165*limb,.30,.185),plateM);
    thigh.position.set(s*.125,.66,0);g.add(thigh);
    const kp=new THREE.Mesh(new THREE.BoxGeometry(.15*limb,.10,.06),gearM);
    kp.position.set(s*.125,.515,.095);g.add(kp);
  });
  // ── Pelvis + belt + pouches + holster
  const pelvis=new THREE.Mesh(new THREE.BoxGeometry(tW-.04,.14,.24),underM);
  pelvis.position.y=.835;g.add(pelvis);
  const belt=new THREE.Mesh(new THREE.BoxGeometry(tW+.02,.055,.27),strapM);
  belt.position.y=.895;g.add(belt);
  const buckle=new THREE.Mesh(new THREE.BoxGeometry(.07,.045,.02),trimM);
  buckle.position.set(0,.895,.14);g.add(buckle);
  // belt pouches front-left + back
  const pch1=new THREE.Mesh(new THREE.BoxGeometry(.09,.10,.06),gearM);
  pch1.position.set(-.13,.845,.135);g.add(pch1);
  const pch2=new THREE.Mesh(new THREE.BoxGeometry(.11,.09,.05),gearM);
  pch2.position.set(.04,.85,-.145);g.add(pch2);
  // thigh holster right
  const hol=new THREE.Mesh(new THREE.BoxGeometry(.07,.16,.11),gearM);
  hol.position.set(.215,.64,.03);g.add(hol);
  const holStrap=new THREE.Mesh(new THREE.BoxGeometry(.20,.035,.20),strapM);
  holStrap.position.set(.125,.72,0);g.add(holStrap);

  // ── Torso: undersuit core + chest plate + back plate + webbing straps
  const torsoY=.96+tH/2;
  const core=new THREE.Mesh(new THREE.BoxGeometry(tW-.02,tH,.24),underM);
  core.position.y=torsoY;g.add(core);
  const chest=new THREE.Mesh(new THREE.BoxGeometry(tW,tH*.62,.08),plateM);
  chest.position.set(0,torsoY+tH*.12,.145);g.add(chest);
  const abdo=new THREE.Mesh(new THREE.BoxGeometry(tW-.08,tH*.30,.05),gearM);
  abdo.position.set(0,torsoY-tH*.28,.135);g.add(abdo);
  const back=new THREE.Mesh(new THREE.BoxGeometry(tW-.02,tH*.7,.06),plateM);
  back.position.set(0,torsoY+tH*.08,-.135);g.add(back);
  // X webbing straps over chest
  [-1,1].forEach(s=>{
    const strap=new THREE.Mesh(new THREE.BoxGeometry(.055,tH*.78,.02),strapM);
    strap.position.set(s*tW*.26,torsoY+tH*.06,.185);strap.rotation.z=s*.18;g.add(strap);
  });
  // chest admin pouch + radio
  const cpch=new THREE.Mesh(new THREE.BoxGeometry(.12,.08,.04),gearM);
  cpch.position.set(-.02,torsoY+tH*.05,.20);g.add(cpch);
  const radio=new THREE.Mesh(new THREE.BoxGeometry(.05,.09,.035),darkM);
  radio.position.set(tW*.30,torsoY+tH*.22,.185);g.add(radio);
  // collar
  const collar=new THREE.Mesh(new THREE.BoxGeometry(tW*.62,.06,.20),gearM);
  collar.position.set(0,torsoY+tH/2+.01,0);g.add(collar);

  // ── Shoulders + arms: pauldron(outfit) + upper(under) + forearm guard(outfit) + glove
  const shY=torsoY+tH/2-.05;
  [-1,1].forEach(s=>{
    const padW=heavy?.20:light?.14:stealth?.12:.17;
    const pad=new THREE.Mesh(new THREE.BoxGeometry(padW,heavy?.16:.12,heavy?.30:.24),plateM);
    pad.position.set(s*(tW/2+.075),shY+.03,0);g.add(pad);
    if(heavy){ // layered pauldron rim
      const rim=new THREE.Mesh(new THREE.BoxGeometry(padW+.03,.05,.32),trimM);
      rim.position.set(s*(tW/2+.075),shY+.11,0);g.add(rim);
    }
    const upper=new THREE.Mesh(new THREE.BoxGeometry(.125*limb,.26,.14),underM);
    upper.position.set(s*(tW/2+.085),shY-.18,0);upper.rotation.z=s*.06;g.add(upper);
    const fore=new THREE.Mesh(new THREE.BoxGeometry(.135*limb,.22,.15),plateM);
    fore.position.set(s*(tW/2+.10),shY-.41,.01);fore.rotation.z=s*.08;g.add(fore);
    const glove=new THREE.Mesh(new THREE.BoxGeometry(.11,.10,.12),darkM);
    glove.position.set(s*(tW/2+.115),shY-.55,.02);g.add(glove);
  });
  // left arm armband (squad marker, visor color)
  const band=new THREE.Mesh(new THREE.BoxGeometry(.135*limb+.015,.05,.155),visorM);
  band.position.set(-(tW/2+.085),shY-.10,0);band.rotation.z=-.06;g.add(band);

  // ── Neck + head
  const headY=torsoY+tH/2+.20;
  const neck=new THREE.Mesh(new THREE.BoxGeometry(.10,.10,.10),skinM);
  neck.position.y=torsoY+tH/2+.05;g.add(neck);
  const head=new THREE.Mesh(new THREE.BoxGeometry(.25,.27,.25),skinM);
  head.position.y=headY;g.add(head);

  if(c.helmet){
    // Helmet shell: dome + brim + ear cups + back guard
    const dome=new THREE.Mesh(new THREE.BoxGeometry(.31,.17,.31),plateM);
    dome.position.y=headY+.11;g.add(dome);
    const brim=new THREE.Mesh(new THREE.BoxGeometry(.32,.045,.10),plateM);
    brim.position.set(0,headY+.045,.15);g.add(brim);
    [-1,1].forEach(s=>{
      const ear=new THREE.Mesh(new THREE.BoxGeometry(.045,.12,.14),gearM);
      ear.position.set(s*.15,headY-.01,0);g.add(ear);
    });
    const backG=new THREE.Mesh(new THREE.BoxGeometry(.28,.10,.05),plateM);
    backG.position.set(0,headY+.01,-.145);g.add(backG);
    // Visor band
    const visor=new THREE.Mesh(new THREE.BoxGeometry(.24,.085,.05),visorM);
    visor.position.set(0,headY+.005,.14);g.add(visor);
    // Chin strap
    const strap=new THREE.Mesh(new THREE.BoxGeometry(.26,.035,.035),strapM);
    strap.position.set(0,headY-.105,.10);g.add(strap);
    // NVG mount stub (standard/heavy) or antenna (stealth)
    if(!stealth&&!light){
      const nvg=new THREE.Mesh(new THREE.BoxGeometry(.06,.05,.05),darkM);
      nvg.position.set(0,headY+.13,.16);g.add(nvg);
    }
    const ant=new THREE.Mesh(new THREE.BoxGeometry(.012,.18,.012),darkM);
    ant.position.set(-.14,headY+.24,-.10);g.add(ant);
  } else {
    // Bare head: eyes, brow, mouth, hair, headset
    const eyeM=new THREE.MeshLambertMaterial({color:0x18222E});
    [-1,1].forEach(s=>{
      const eye=new THREE.Mesh(new THREE.BoxGeometry(.04,.035,.02),eyeM);
      eye.position.set(s*.065,headY+.03,.125);g.add(eye);
    });
    const brow=new THREE.Mesh(new THREE.BoxGeometry(.17,.025,.02),new THREE.MeshLambertMaterial({color:0x2A1A08}));
    brow.position.set(0,headY+.065,.125);g.add(brow);
    const mouth=new THREE.Mesh(new THREE.BoxGeometry(.08,.022,.02),new THREE.MeshLambertMaterial({color:0x7A4A3A}));
    mouth.position.set(0,headY-.055,.127);g.add(mouth);
    const hair=new THREE.Mesh(new THREE.BoxGeometry(.27,.08,.27),new THREE.MeshLambertMaterial({color:0x2A1A08}));
    hair.position.set(0,headY+.155,-.01);g.add(hair);
    // comms headset
    const hsBand=new THREE.Mesh(new THREE.BoxGeometry(.28,.02,.02),darkM);
    hsBand.position.set(0,headY+.115,0);g.add(hsBand);
    const hsCup=new THREE.Mesh(new THREE.BoxGeometry(.03,.07,.07),darkM);
    hsCup.position.set(-.135,headY+.01,0);g.add(hsCup);
  }

  // ── Backpack
  if(c.backpack!=='none'){
    const bpH=c.backpack==='missile'?.40:.30;
    const bp=new THREE.Mesh(new THREE.BoxGeometry(.26,bpH,.13),gearM);
    bp.position.set(0,torsoY+.04,-.235);g.add(bp);
    const bpLid=new THREE.Mesh(new THREE.BoxGeometry(.22,.06,.10),darkM);
    bpLid.position.set(0,torsoY+.04+bpH/2,-.235);g.add(bpLid);
    // shoulder straps over the top
    [-1,1].forEach(s=>{
      const st=new THREE.Mesh(new THREE.BoxGeometry(.05,.03,.30),strapM);
      st.position.set(s*tW*.26,torsoY+tH/2-.01,-.06);g.add(st);
    });
    if(c.backpack==='missile'){
      for(let i=-1;i<=1;i++){
        const m=new THREE.Mesh(new THREE.CylinderGeometry(.030,.030,.22,6),
          new THREE.MeshLambertMaterial({color:0x6A7078}));
        m.position.set(i*.075,torsoY+.04+bpH/2+.08,-.235);g.add(m);
        const tip=new THREE.Mesh(new THREE.ConeGeometry(.030,.05,6),
          new THREE.MeshLambertMaterial({color:0xB04038}));
        tip.position.set(i*.075,torsoY+.04+bpH/2+.215,-.235);g.add(tip);
      }
    }
  }

  // ── Stealth energy lines
  if(stealth){
    const lineMat=new THREE.MeshLambertMaterial({color:visorC,emissive:visorC,emissiveIntensity:.6});
    const line1=new THREE.Mesh(new THREE.BoxGeometry(tW+.02,.022,.022),lineMat);
    line1.position.set(0,torsoY+tH*.18,.19);g.add(line1);
    [-1,1].forEach(s=>{
      const line2=new THREE.Mesh(new THREE.BoxGeometry(.022,.34,.022),lineMat);
      line2.position.set(s*.125,.55,.10);g.add(line2);
    });
  }
  // ── Heavy extra plating
  if(heavy){
    const groin=new THREE.Mesh(new THREE.BoxGeometry(.18,.12,.05),plateM);
    groin.position.set(0,.80,.14);g.add(groin);
    const spine=new THREE.Mesh(new THREE.BoxGeometry(.10,tH*.8,.04),trimM);
    spine.position.set(0,torsoY+.02,-.17);g.add(spine);
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
function _getWeaponCamoColors(weaponId){
  const defBase={launcher:0x23262B,pistol:0x26282E,shotgun:0x222428,sniper:0x23262A,smg:0x24262B,railgun:0x222A36,cluster:0x2E2418,shock:0x241E32};
  const defAcc ={launcher:0x14151A,pistol:0x15161B,shotgun:0x131418,sniper:0x141519,smg:0x14151A,railgun:0x121822,cluster:0x1A140C,shock:0x14101E};
  let base=defBase[weaponId]||0x24262B, accent=defAcc[weaponId]||0x14151A;
  const camoId=saveData&&saveData.equippedWeaponCamos?saveData.equippedWeaponCamos[weaponId]:'default';
  if(camoId&&camoId!=='default'&&typeof WEAPON_CAMOS!=='undefined'&&WEAPON_CAMOS[weaponId]){
    const camo=WEAPON_CAMOS[weaponId].find(c=>c.id===camoId);
    if(camo){
      base=parseInt(camo.hexStr.replace('#',''),16);
      accent=camo.accentStr?parseInt(camo.accentStr.replace('#',''),16)
        :new THREE.Color(base).multiplyScalar(.4).getHex();
    }
  }
  return{base,accent};
}
function _getWeaponCamoColor(weaponId){return _getWeaponCamoColors(weaponId).base;}
// Shared weapon material builders — soft emissive lift so camo reads in shadow without glowing
function _wpnBaseMat(hex){return new THREE.MeshLambertMaterial({color:hex,emissive:new THREE.Color(hex),emissiveIntensity:.14});}
function _wpnAccMat(hex){return new THREE.MeshLambertMaterial({color:hex,emissive:new THREE.Color(hex),emissiveIntensity:.10});}
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
  const cc=_getWeaponCamoColors('launcher');
  const metalM=_wpnBaseMat(cc.base);
  const accM  =_wpnAccMat(cc.accent);
  const darkM =new THREE.MeshLambertMaterial({color:0x111111});
  const tube=new THREE.Mesh(new THREE.CylinderGeometry(.062,.062,.70,10),metalM);
  tube.rotation.x=Math.PI/2;tube.position.z=-.08;g.add(tube);
  // accent wrap bands on tube
  [-.32,-.02,.22].forEach(z=>{
    const ring=new THREE.Mesh(new THREE.CylinderGeometry(.066,.066,.035,10),accM);
    ring.rotation.x=Math.PI/2;ring.position.z=z;g.add(ring);
  });
  const front=new THREE.Mesh(new THREE.ConeGeometry(.062,.13,10),accM);
  front.rotation.x=Math.PI/2;front.position.z=-.47;g.add(front);
  const back=new THREE.Mesh(new THREE.CylinderGeometry(.072,.038,.09,10),darkM);
  back.rotation.x=Math.PI/2;back.position.z=.32;g.add(back);
  const stock=new THREE.Mesh(new THREE.BoxGeometry(.068,.088,.22),accM);
  stock.position.set(0,-.08,.15);g.add(stock);
  const scope=new THREE.Mesh(new THREE.CylinderGeometry(.024,.024,.22,8),darkM);
  scope.rotation.x=Math.PI/2;scope.position.set(0,.098,-.04);g.add(scope);
  const lensM=new THREE.MeshLambertMaterial({color:0x112233});lensM.emissive.set(0x001122);lensM.emissiveIntensity=.4;
  const lens=new THREE.Mesh(new THREE.CircleGeometry(.022,8),lensM);
  lens.position.set(0,.098,-.16);g.add(lens);
  const grip=new THREE.Mesh(new THREE.BoxGeometry(.056,.14,.07),accM);
  grip.position.set(0,-.11,-.04);g.add(grip);
  // carry handle
  const handle=new THREE.Mesh(new THREE.BoxGeometry(.02,.05,.16),darkM);
  handle.position.set(0,.075,.12);g.add(handle);
  g.position.set(.25,-.22,-.42);return g;
}
function makePistolMesh(){
  const g=new THREE.Group();
  const cc=_getWeaponCamoColors('pistol');
  const metalM=_wpnBaseMat(cc.base);
  const accM  =_wpnAccMat(cc.accent);
  const darkM =new THREE.MeshLambertMaterial({color:0x111111});
  const barrel=new THREE.Mesh(new THREE.BoxGeometry(.042,.042,.36),metalM);
  barrel.position.z=-.14;g.add(barrel);
  const muzzle=new THREE.Mesh(new THREE.CylinderGeometry(.026,.032,.04,8),accM);
  muzzle.rotation.x=Math.PI/2;muzzle.position.z=-.34;g.add(muzzle);
  const body=new THREE.Mesh(new THREE.BoxGeometry(.072,.09,.18),metalM);
  body.position.set(0,-.01,.04);g.add(body);
  const grip=new THREE.Mesh(new THREE.BoxGeometry(.062,.16,.08),accM);
  grip.rotation.x=.18;grip.position.set(0,-.14,.08);g.add(grip);
  const slide=new THREE.Mesh(new THREE.BoxGeometry(.048,.048,.32),accM);
  slide.position.set(0,.022,-.04);g.add(slide);
  // slide serration + front sight
  const sight=new THREE.Mesh(new THREE.BoxGeometry(.012,.018,.012),darkM);
  sight.position.set(0,.055,-.19);g.add(sight);
  const trig=new THREE.Mesh(new THREE.BoxGeometry(.04,.05,.05),darkM);
  trig.position.set(0,-.065,.02);g.add(trig);
  g.position.set(.22,-.2,-.38);return g;
}
function makeShotgunMesh(){
  const g=new THREE.Group();
  const cc=_getWeaponCamoColors('shotgun');
  const metalM=_wpnBaseMat(cc.base);
  const woodM =_wpnAccMat(cc.accent);
  const darkM =new THREE.MeshLambertMaterial({color:0x0D0D0D});
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
  const cc=_getWeaponCamoColors('sniper');
  const metalM=_wpnBaseMat(cc.base);
  const woodM =_wpnAccMat(cc.accent);
  const darkM =new THREE.MeshLambertMaterial({color:0x0A0A0A});
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
  const cc=_getWeaponCamoColors('smg');
  const metalM=_wpnBaseMat(cc.base);
  const polyM =_wpnAccMat(cc.accent);
  const darkM =new THREE.MeshLambertMaterial({color:0x0E0E0E});
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
  const cc=_getWeaponCamoColors('railgun');
  const metalM=_wpnBaseMat(cc.base);
  const darkM =_wpnAccMat(cc.accent);
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
  const cc=_getWeaponCamoColors('cluster');
  const metalM=_wpnBaseMat(cc.base);
  const drumM =_wpnAccMat(cc.accent);
  const darkM =new THREE.MeshLambertMaterial({color:0x1A1A0A});
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
  const cc=_getWeaponCamoColors('shock');
  const metalM=_wpnBaseMat(cc.base);
  const darkM =_wpnAccMat(cc.accent);
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

