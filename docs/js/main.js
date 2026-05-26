// Events + game loop + init + card system
// ═══════════════════════════════════════════════════════════════
//  EVENTS
// ═══════════════════════════════════════════════════════════════
function toggleModMenu(){
  modMenuOpen=!modMenuOpen;
  const el=document.getElementById('modMenu');
  el.classList.toggle('open',modMenuOpen);
  if(modMenuOpen){
    if(document.pointerLockElement) document.exitPointerLock();
  }
}
function setModToggle(id,val){
  const el=document.getElementById(id);
  if(el) el.classList.toggle('on',val);
}
function applyAimbot(){
  const projSpeed=WEAPONS[currentWeapon].projSpeed;
  const playerPos=new THREE.Vector3(px,py,pz);
  let aimPos=null, closestDist=Infinity;

  for(const m of missiles){
    if(m.isDestroyed) continue;
    const d=m.pos.distanceTo(playerPos);
    if(d<closestDist){
      closestDist=d;
      // Two-iteration lead: predict where missile will be when projectile arrives
      let t=d/projSpeed;
      let lead=m.pos.clone().addScaledVector(m.vel,t);
      t=lead.distanceTo(playerPos)/projSpeed;
      lead=m.pos.clone().addScaledVector(m.vel,t);
      aimPos=lead;
    }
  }
  for(const s of soldiers){
    const th=ENEMY_TYPES[s.type].baseScale;
    const sPos=new THREE.Vector3(s.pos.x,th,s.pos.z);
    const d=sPos.distanceTo(playerPos);
    if(d<closestDist){
      closestDist=d;
      // Soldiers move slowly — small lead based on their patrol direction
      const travelT=d/projSpeed;
      const spd=ENEMY_TYPES[s.type].speed;
      const fwd=new THREE.Vector3(Math.cos(s.patrolT),0,Math.sin(s.patrolT)).normalize();
      aimPos=sPos.clone().addScaledVector(fwd,spd*travelT);
    }
  }

  if(aimPos){
    const dx=aimPos.x-px,dy=aimPos.y-py,dz=aimPos.z-pz;
    const horiz=Math.sqrt(dx*dx+dz*dz)||0.001;
    yaw=Math.atan2(-dx,-dz);
    pitch=Math.atan2(dy,horiz);
    pitch=Math.max(-Math.PI*.45,Math.min(Math.PI*.45,pitch));
  }
}
function setupModMenuButtons(){
  document.getElementById('modOptAimbot').addEventListener('click',()=>{
    mods.aimbot=!mods.aimbot;setModToggle('togAimbot',mods.aimbot);
  });
  document.getElementById('modOptInfAmmo').addEventListener('click',()=>{
    mods.infAmmo=!mods.infAmmo;setModToggle('togInfAmmo',mods.infAmmo);
  });
  document.getElementById('modOptGod').addEventListener('click',()=>{
    mods.godMode=!mods.godMode;setModToggle('togGod',mods.godMode);
  });
  document.getElementById('btnModCurrency').addEventListener('click',()=>{
    saveData.currency+=999999;saveSave();
    showNotif('CREDITS +999,999');
    playTone(880,.1,'sine',.2);
  });
}

function setupEvents(){
  // Pointer lock
  const canvas=document.getElementById('gameCanvas');
  canvas.addEventListener('click',()=>{
    if(gameActive&&!gamePaused&&currentScreen==='hud'){
      canvas.requestPointerLock();
    }
  });
  document.getElementById('clickNotice').addEventListener('click',()=>{
    canvas.requestPointerLock();
  });
  document.addEventListener('pointerlockchange',()=>{
    isLocked=document.pointerLockElement===canvas;
    if(isLocked){
      document.getElementById('clickNotice').style.display='none';
      document.getElementById('btnSettingsFloat').style.display='none';
    } else if(gameActive&&!gamePaused&&!_suppressPauseLock){
      // Browser swallows Escape keydown while in pointer lock — pause here instead
      pauseGame();
    }
    _suppressPauseLock=false;
  });

  // Mouse look
  document.addEventListener('mousemove',e=>{
    if(!isLocked||!gameActive||gamePaused) return;
    yaw  -=e.movementX*SENSITIVITY;
    pitch-=e.movementY*SENSITIVITY;
    pitch=Math.max(-Math.PI*.45,Math.min(Math.PI*.45,pitch));
  });

  // Easter egg + lloyd mod menu key listener
  let eggBuf='';
  document.addEventListener('keydown',e=>{
    if(currentScreen==='mainMenu'){
      // Chat: Enter focuses/sends
      if(e.key==='Enter'){
        const ci=document.getElementById('rlChatInput');
        if(ci&&document.activeElement!==ci){ e.preventDefault(); ci.focus(); return; }
      }
      eggBuf+=e.key.toLowerCase();
      if(eggBuf.length>14) eggBuf=eggBuf.slice(-14);
      if(eggBuf.includes('richard')){
        document.getElementById('gameTitle').innerHTML=
          'Richard Abou Jamra<br><span>Physics Simulation</span>';
        sfxEasterEgg();eggBuf='';
      }
    }
    if(gameActive&&currentScreen==='hud'){
      lloydBuf+=e.key.toLowerCase();
      if(lloydBuf.length>8) lloydBuf=lloydBuf.slice(-8);
      if(lloydBuf.includes('lloyd')){lloydBuf='';toggleModMenu();}
    }
    if(modMenuOpen&&e.code==='Escape'){e.stopImmediatePropagation();toggleModMenu();}
  });

  // World map canvas — set up once; the rAF loop handles hover/click
  setupMapCanvas();

  // Keyboard
  document.addEventListener('keydown',e=>{
    keys[e.code]=true;
    if(!gameActive) return;
    if(e.code==='Escape'){
      // pointer lock case handled by pointerlockchange; this covers non-locked pause/resume
      if(gamePaused) resumeGame();
      else if(!isLocked) pauseGame();
    }
    if(gamePaused) return;
    if(!isLocked) return;
    if(e.code==='KeyR') startReload();
    if(e.code==='KeyF') fireCyberBullet();
    if(e.code==='KeyV') fireRajpnFist();
    if(e.code==='KeyG') useFlashbang();
    if(e.code==='KeyT') useAirstrike();
    if(e.code==='KeyB') useCover();
    if(e.code==='Digit1') switchWeapon((saveData.equippedWeapons||['pistol','launcher'])[0]);
    if(e.code==='Digit2') switchWeapon((saveData.equippedWeapons||['pistol','launcher'])[1]);
  });
  document.addEventListener('wheel',e=>{
    if(!isLocked||!gameActive||gamePaused) return;
    const ids=saveData.equippedWeapons||['pistol','launcher'];
    const cur=ids.indexOf(currentWeapon);
    const next=ids[(cur+(e.deltaY>0?1:-1)+ids.length)%ids.length];
    switchWeapon(next);
  });
  document.addEventListener('keyup',e=>{keys[e.code]=false;});

  // Mouse fire / scope
  document.addEventListener('mousedown',e=>{
    if(!isLocked||!gameActive||gamePaused) return;
    if(e.button===0){ mouseHeld=true; fireProjectile(); }
    if(e.button===2){
      if(currentWeapon==='shotgun') fireHook();
      else {scoped=true;sfxScope();}
    }
  });
  document.addEventListener('mouseup',e=>{
    if(e.button===0) mouseHeld=false;
    if(e.button===2){if(currentWeapon!=='shotgun') scoped=false;}
  });
  document.addEventListener('contextmenu',e=>e.preventDefault());

  // ── MENU BUTTONS ──
  document.getElementById('btnPlay').addEventListener('click',()=>{
    mapSelected=null;
    document.getElementById('mapLocDetails').style.display='none';
    document.getElementById('mapLocName').textContent='Select a theater';
    document.getElementById('mapLocDesc').textContent='Click a marker on the map to deploy.';
    showScreen('locationSelect');
  });
  document.getElementById('btnDeploy2').addEventListener('click',()=>{
    if(!selectedLoc) return;
    buildCustomizationUI();rebuildCharPreview();showScreen('customization');
  });
  document.getElementById('btnShop').addEventListener('click',()=>{buildShop();showScreen('shopScreen');});
  document.getElementById('btnCredits').addEventListener('click',()=>showScreen('infoScreen'));

  document.getElementById('btnLocBack').addEventListener('click',()=>showScreen('mainMenu'));

  document.getElementById('btnCustomBack').addEventListener('click',()=>showScreen('locationSelect'));
  document.getElementById('btnDeploy').addEventListener('click',()=>{
    if(!selectedLoc) return;
    startGame(selectedLoc,1);
  });

  document.getElementById('btnResume').addEventListener('click',resumeGame);
  document.getElementById('btnPauseMainMenu').addEventListener('click',()=>{
    if(confirm('Return to main menu? Current progress will be lost.')) returnToMenu();
  });

  document.getElementById('btnNextWave').addEventListener('click',()=>_autoNextWave());
  document.getElementById('btnRetry').addEventListener('click',()=>{
    if(selectedLoc) startGame(selectedLoc,1);
  });
  document.getElementById('btnGoMenu').addEventListener('click',returnToMenu);
  document.getElementById('btnShopBack').addEventListener('click',()=>showScreen('mainMenu'));
  document.getElementById('btnInfoBack').addEventListener('click',()=>showScreen('mainMenu'));
  document.getElementById('btnStats').addEventListener('click',()=>{ buildStatsScreen(); showScreen('statsScreen'); });
}

// ═══════════════════════════════════════════════════════════════
//  MAIN GAME LOOP
// ═══════════════════════════════════════════════════════════════
let lastT=0;
let previewT=0;

function gameLoop(t){
  requestAnimationFrame(gameLoop);
  const dt=Math.min((t-lastT)/1000,.05);
  lastT=t;

  if(gameActive&&!gamePaused){
    if(mods.aimbot&&isLocked) applyAimbot();
    if(mods.infAmmo){ammo=WEAPONS[currentWeapon].maxAmmo;weaponAmmo[currentWeapon]=ammo;isReloading=false;}
    if(isLocked) updatePlayer(dt);
    updateWeapon(dt);
    updateHelicopters(dt);
    updateProjectiles(dt);
    updateMissiles(dt);
    updateParticles(dt);
    updateDebris(dt);
    updateSoldiers(dt);
    updateHook(dt);
    if(hookCD>0) hookCD=Math.max(0,hookCD-dt);
    if(killStreakTimer>0){ killStreakTimer-=dt; if(killStreakTimer<=0&&killStreak>0){ killStreak=0; } }
    updateCyberBullet(dt);
    updateRajpnFist(dt);
    updateGadgetHud();
    updateWave(dt);
    updateScreenShake(dt);
    updateHUD();
    updateMinimap();
    updateRemotePlayers();
    mpStateTimer+=dt;
    if(mpStateTimer>=MP_TICK){ mpStateTimer=0; mpBroadcastState(); _updateCoopLb(); }
  }

  // Preview renderer
  if(currentScreen==='customization'&&previewRenderer){
    previewT+=dt;
    if(previewChar) previewChar.rotation.y=previewT*.5;
    previewRenderer.render(previewScene,previewCamera);
  }

  if(!gamePaused) renderer.render(scene,camera);
}

// ═══════════════════════════════════════════════════════════════
//  INIT
// ═══════════════════════════════════════════════════════════════
function init(){
  initThree();
  initPreviewRenderer();
  // Restore unlocked weapons from save
  weaponInventory=new Set(['pistol','launcher']);
  ['shotgun','sniper','smg'].forEach(w=>{ if(saveData.unlocks.includes(w)) weaponInventory.add(w); });
  setupEvents();
  setupModMenuButtons();
  updateSaveUI();
  updateWeaponBar();
  if(_fbUser&&typeof startSocialListeners==='function') startSocialListeners();
  document.getElementById('weaponBar').style.display='none';
  setTimeout(()=>{
    document.getElementById('loadScreen').style.display='none';
  },1200);
  requestAnimationFrame(gameLoop);
}

window.addEventListener('load',init);

// ═══════════════════════════════════════════════════════════════
//  CARD SYSTEM
// ═══════════════════════════════════════════════════════════════
let _pendingCardPick=false;
let _wcCountdownId=null;

function _autoNextWave(){
  if(_wcCountdownId){ clearInterval(_wcCountdownId); _wcCountdownId=null; }
  const btn=document.getElementById('btnNextWave');
  if(btn) btn.textContent='Next Wave →';
  if(_pendingCardPick){ _pendingCardPick=false; showCardPick(); }
  else{
    showScreen('hud');
    if(isLocked) document.exitPointerLock();
    document.getElementById('clickNotice').style.display='flex';
    scoped=false; scopeT=0;
    setTimeout(()=>startWave(),800);
  }
}

function _startWaveCompleteCountdown(){
  if(_wcCountdownId) clearInterval(_wcCountdownId);
  let secs=5;
  const btn=document.getElementById('btnNextWave');
  if(btn) btn.textContent=`Next Wave → (${secs})`;
  _wcCountdownId=setInterval(()=>{
    secs--;
    if(btn) btn.textContent=secs>0?`Next Wave → (${secs})`:'Next Wave →';
    if(secs<=0){ clearInterval(_wcCountdownId); _wcCountdownId=null; _autoNextWave(); }
  },1000);
}
let activeCards=[];

const RARITY_COLORS={C:'#888',U:'#4A90D9',R:'#B066E8',E:'#F0C040',L:'#FF5544',M:'#FF44FF'};
const RARITY_NAMES={C:'Common',U:'Uncommon',R:'Rare',E:'Epic',L:'Legendary',M:'Mythic'};
const RARITY_WEIGHTS={C:400,U:300,R:150,E:100,L:40,M:10};

// Card pool — Common: mostly beneficial. Uncommon: mixed. Rare+: mostly detrimental (give credits).
// creditReward = credits given for picking the card (harder cards pay more)
const CARD_POOL=[
  // ── COMMON (beneficial) ─────────────────────────────────────
  {id:'c01',r:'C',icon:'⚡',name:'Adrenaline Rush',    desc:'+8% move speed.',         fx:()=>{ effectiveSpd*=1.08; effectiveSprint*=1.08; }},
  {id:'c02',r:'C',icon:'M+', name:'Extended Mag',      desc:'+25% max ammo.',          fx:()=>{ Object.keys(WEAPONS).forEach(k=>{ WEAPONS[k].maxAmmo=Math.ceil(WEAPONS[k].maxAmmo*1.25); weaponAmmo[k]=WEAPONS[k].maxAmmo; }); ammo=WEAPONS[currentWeapon].maxAmmo; }},
  {id:'c03',r:'C',icon:'RL', name:'Quick Hands',       desc:'-15% reload time.',       fx:()=>{ Object.keys(WEAPONS).forEach(k=>WEAPONS[k].reloadTime*=0.85); }},
  {id:'c04',r:'C',icon:'CR', name:'Salvage Crew',      desc:'+100 credits.',           fx:()=>{ saveData.currency+=100; saveSave(); }},
  {id:'c05',r:'C',icon:'AIM',name:'Steady Aim',        desc:'-20% weapon spread.',     fx:()=>{ Object.keys(WEAPONS).forEach(k=>{ if(WEAPONS[k].spread>0) WEAPONS[k].spread*=0.80; }); }},
  {id:'c06',r:'C',icon:'VS', name:'Padded Vest',       desc:'+20% bullet resist.',     fx:()=>{ window._playerDmgMult=(window._playerDmgMult||1)*0.80; }},
  {id:'c07',r:'C',icon:'DMG',name:'Hot Tip',           desc:'+10% projectile damage.', fx:()=>{ dmgMult*=1.10; }},
  {id:'c08',r:'C',icon:'SPD',name:'Rangefinder',       desc:'+12% projectile speed.',  fx:()=>{ Object.keys(WEAPONS).forEach(k=>WEAPONS[k].projSpeed=Math.ceil(WEAPONS[k].projSpeed*1.12)); }},
  {id:'c09',r:'C',icon:'SP', name:'Combat Stims',      desc:'+5% sprint speed.',       fx:()=>{ effectiveSprint*=1.05; }},
  {id:'c10',r:'C',icon:'AMO',name:'Ammo Magnet',       desc:'Ammo packs +50% more.',   fx:()=>{ window._ammoPackMult=(window._ammoPackMult||1)*1.5; }},
  // ── UNCOMMON (mixed) ────────────────────────────────────────
  {id:'u01',r:'U',icon:'INC',name:'Incendiary',        desc:'+20% damage, +5% fire rate.',fx:()=>{ dmgMult*=1.20; Object.keys(WEAPONS).forEach(k=>WEAPONS[k].fireCD*=0.95); }},
  {id:'u02',r:'U',icon:'RL', name:'Auto-Loader',       desc:'-25% reload time.',       fx:()=>{ Object.keys(WEAPONS).forEach(k=>WEAPONS[k].reloadTime*=0.75); }},
  {id:'u03',r:'U',icon:'MVS',name:'Afterburner',       desc:'+18% all movement.',      fx:()=>{ effectiveSpd*=1.18; effectiveSprint*=1.18; }},
  {id:'u04',r:'U',icon:'CR', name:'War Profiteer',     desc:'+50% credits per wave.',  fx:()=>{ window._creditMult=(window._creditMult||1)*1.5; }},
  // Detrimental uncommons
  {id:'u05',r:'U',icon:'HVY',name:'Weighted Boots',    desc:'HARDER: -15% move speed.  +80 credits', creditReward:80, fx:()=>{ effectiveSpd*=0.85; effectiveSprint*=0.85; }},
  {id:'u06',r:'U',icon:'FOG',name:'Fog of War',        desc:'HARDER: Minimap disabled this game.  +60 credits', creditReward:60, fx:()=>{ const mm=document.getElementById('minimap'); if(mm) mm.style.visibility='hidden'; }},
  {id:'u07',r:'U',icon:'SLP',name:'Slippery Boots',    desc:'HARDER: +25% player acceleration lag.  +70 credits', creditReward:70, fx:()=>{ effectiveSpd*=0.90; }},
  {id:'u08',r:'U',icon:'FBG',name:'Tactical Eye',      desc:'+1 flashbang charge.',    fx:()=>{ activeGadgets.flashbang=(activeGadgets.flashbang||0)+1; }},
  {id:'u09',r:'U',icon:'FLH',name:'Concussion Expert', desc:'Flashbang radius +30%.',  fx:()=>{ window._flashRad=(window._flashRad||1)*1.3; }},
  {id:'u10',r:'U',icon:'CR', name:'Supply Drop',       desc:'+300 credits.',           fx:()=>{ saveData.currency+=300; saveSave(); }},
  // ── RARE (mostly detrimental + credit reward) ────────────────
  {id:'r01',r:'R',icon:'OC', name:'Overclocked',       desc:'+30% fire rate.',         fx:()=>{ Object.keys(WEAPONS).forEach(k=>WEAPONS[k].fireCD*=0.70); }},
  {id:'r02',r:'R',icon:'HLF',name:'Half Health City',  desc:'HARDER: City integrity -20% now.  +150 credits', creditReward:150, fx:()=>{ cityIntegrity=Math.max(10,cityIntegrity-20); }},
  {id:'r03',r:'R',icon:'BLT',name:'Bullet Sponge',     desc:'HARDER: Soldiers take +50% shots to kill.  +180 credits', creditReward:180, fx:()=>{ soldiers.forEach(s=>s.health=Math.ceil(s.health*1.5)); }},
  {id:'r04',r:'R',icon:'SLW',name:'Molasses Rounds',   desc:'HARDER: -30% projectile speed.  +160 credits', creditReward:160, fx:()=>{ Object.keys(WEAPONS).forEach(k=>WEAPONS[k].projSpeed=Math.max(10,Math.ceil(WEAPONS[k].projSpeed*0.70))); }},
  {id:'r05',r:'R',icon:'MSL',name:'Missile Surge',     desc:'HARDER: +3 extra missiles this wave.  +140 credits', creditReward:140, fx:()=>{ waveMissileTotal+=3; showNotif('3 more missiles incoming!'); }},
  {id:'r06',r:'R',icon:'SPD',name:'Rocket Fuel',       desc:'+40% projectile speed.',  fx:()=>{ Object.keys(WEAPONS).forEach(k=>WEAPONS[k].projSpeed=Math.ceil(WEAPONS[k].projSpeed*1.40)); }},
  {id:'r07',r:'R',icon:'AMO',name:'Drought',           desc:'HARDER: All weapon ammo halved.  +200 credits', creditReward:200, fx:()=>{ Object.keys(WEAPONS).forEach(k=>{ WEAPONS[k].maxAmmo=Math.max(1,Math.floor(WEAPONS[k].maxAmmo/2)); weaponAmmo[k]=WEAPONS[k].maxAmmo; }); ammo=WEAPONS[currentWeapon].maxAmmo; }},
  {id:'r08',r:'R',icon:'NOH',name:'No Gadgets',        desc:'HARDER: All gadget charges set to 0.  +180 credits', creditReward:180, fx:()=>{ activeGadgets={flashbang:0,airstrike:0,cover:0}; showNotif('Gadgets disabled!'); }},
  {id:'r09',r:'R',icon:'SPS',name:'Speed Missiles',    desc:'HARDER: Missiles +35% faster.  +220 credits', creditReward:220, fx:()=>{ missiles.forEach(m=>{ m.vel.x*=1.35;m.vel.y*=1.35;m.vel.z*=1.35; }); }},
  {id:'r10',r:'R',icon:'RAR',name:'Rare Find',         desc:'+500 credits.',           fx:()=>{ saveData.currency+=500; saveSave(); }},
  // ── EPIC (mostly detrimental, higher credits) ────────────────
  {id:'e01',r:'E',icon:'ANN',name:'Annihilator',       desc:'+60% damage to all targets.',fx:()=>{ dmgMult*=1.60; }},
  {id:'e02',r:'E',icon:'SMK',name:'Smoke Screen',      desc:'HARDER: Crosshair removed for remainder of game.  +300 credits', creditReward:300, fx:()=>{ const ch=document.getElementById('crosshair'); if(ch) ch.style.display='none'; }},
  {id:'e03',r:'E',icon:'BOS',name:'Boss Upgrade',      desc:'HARDER: All remaining missiles get +50% HP.  +350 credits', creditReward:350, fx:()=>{ missiles.forEach(m=>{ m.maxHealth=Math.ceil(m.maxHealth*1.5);m.health=Math.ceil(m.health*1.5); }); }},
  {id:'e04',r:'E',icon:'ELT',name:'Elite Squad',       desc:'HARDER: Spawns 3 sniper soldiers now.  +280 credits', creditReward:280, fx:()=>{ if(selectedLoc) for(let i=0;i<3;i++) setTimeout(()=>spawnSoldiers(selectedLoc,1,'sniper'),i*600); showNotif('SNIPERS DEPLOYED!'); }},
  {id:'e05',r:'E',icon:'BLT',name:'Fragile City',      desc:'HARDER: City blast damage ×2 this game.  +400 credits', creditReward:400, fx:()=>{ window._cityBlastMult=(window._cityBlastMult||1)*2; showNotif('City is fragile!'); }},
  {id:'e06',r:'E',icon:'CRD',name:'Tactical HUD',      desc:'All streaks give ×3 score.',fx:()=>{ window._streakScoreMult=(window._streakScoreMult||1)*3; }},
  {id:'e07',r:'E',icon:'AIR',name:'Air Superiority',   desc:'+2 airstrike charges.',    fx:()=>{ activeGadgets.airstrike=(activeGadgets.airstrike||0)+2; }},
  {id:'e08',r:'E',icon:'DRK',name:'Darkness Falls',    desc:'HARDER: Fog distance halved.  +320 credits', creditReward:320, fx:()=>{ if(scene.fog){scene.fog.near*=0.5;scene.fog.far*=0.5;} }},
  {id:'e09',r:'E',icon:'CRD',name:'Credit Matrix',     desc:'+1000 credits + ×2 future.',fx:()=>{ saveData.currency+=1000; window._creditMult=(window._creditMult||1)*2; saveSave(); }},
  {id:'e10',r:'E',icon:'WV', name:'Wave Surge',        desc:'HARDER: Next wave has 2× missiles.  +450 credits', creditReward:450, fx:()=>{ waveMissileTotal+=Math.ceil(waveMissileTotal); showNotif('WAVE SURGE — double missiles!'); }},
  // ── LEGENDARY (all detrimental, big credit rewards) ──────────
  {id:'l01',r:'L',icon:'HRD',name:'Hard Mode',         desc:'HARDER: City integrity -35%. Missiles +50% HP.  +600 credits', creditReward:600, fx:()=>{ cityIntegrity=Math.max(5,cityIntegrity-35); missiles.forEach(m=>{m.maxHealth=Math.ceil(m.maxHealth*1.5);m.health=Math.ceil(m.health*1.5);}); }},
  {id:'l02',r:'L',icon:'BLK',name:'Blackout',          desc:'HARDER: No HUD for 30 seconds.  +700 credits', creditReward:700, fx:()=>{ const hud=document.getElementById('hud'); if(hud){const e=hud.querySelectorAll('.hud-panel,.hud-row');e.forEach(el=>el.style.opacity='0');setTimeout(()=>e.forEach(el=>el.style.opacity=''),30000);} showNotif('HUD OFFLINE 30s!'); }},
  {id:'l03',r:'L',icon:'INV',name:'Invaders',          desc:'HARDER: +5 elite soldiers + boss missile now.  +750 credits', creditReward:750, fx:()=>{ spawnMissile(true); if(selectedLoc) for(let i=0;i<5;i++) setTimeout(()=>spawnSoldiers(selectedLoc,1,'heavy'),i*300); showNotif('INVASION!'); }},
  {id:'l04',r:'L',icon:'SPD',name:'Hypersonic Threat', desc:'HARDER: Missiles move 2× faster.  +800 credits', creditReward:800, fx:()=>{ missiles.forEach(m=>{m.vel.x*=2;m.vel.y*=2;m.vel.z*=2;}); showNotif('HYPERSONIC MISSILES!'); }},
  {id:'l05',r:'L',icon:'AMO',name:'Empty Arsenal',     desc:'HARDER: Ammo reduced to 1 per weapon. City -10%.  +900 credits', creditReward:900, fx:()=>{ Object.keys(WEAPONS).forEach(k=>{WEAPONS[k].maxAmmo=1;weaponAmmo[k]=1;}); ammo=1; cityIntegrity=Math.max(5,cityIntegrity-10); showNotif('ARSENAL DRAINED!'); }},
  // ── MYTHIC (chaos — all extreme) ────────────────────────────
  {id:'m01',r:'M',icon:'BOS',name:'BOSS MISSILE',      desc:'HARDER: Spawns an extra boss missile! +1000 credits', creditReward:1000, fx:()=>{ spawnMissile(true); showNotif('A BOSS MISSILE WAS SUMMONED!'); }},
  {id:'m02',r:'M',icon:'BN', name:'ENEMY BATTALION',   desc:'HARDER: Spawns 5 elite soldiers! +1200 credits',  creditReward:1200, fx:()=>{ if(selectedLoc) for(let i=0;i<5;i++) setTimeout(()=>spawnSoldiers(selectedLoc,1,'heavy'),i*400); showNotif('ENEMY BATTALION DEPLOYED!'); }},
  {id:'m03',r:'M',icon:'STM',name:'MISSILE STORM',     desc:'HARDER: Doubles missiles this wave! +1500 credits', creditReward:1500, fx:()=>{ waveMissileTotal+=Math.ceil(waveMissileTotal*0.8); showNotif('MISSILE STORM INCOMING!'); }},
  {id:'m04',r:'M',icon:'NUK',name:'NUCLEAR THREAT',    desc:'HARDER: All missiles become boss class! +2000 credits', creditReward:2000, fx:()=>{ window._allBoss=true; showNotif('ALL MISSILES ARE NOW BOSS CLASS!'); }},
  {id:'m05',r:'M',icon:'CRX',name:'CHAIN REACTION',    desc:'City takes ×3 blast damage BUT you deal ×4. +1800 credits', creditReward:1800, fx:()=>{ dmgMult*=4; window._cityBlastMult=(window._cityBlastMult||1)*3; showNotif('CHAIN REACTION — High risk, high reward!'); }},
];

function _rollRarity(){
  const total=Object.values(RARITY_WEIGHTS).reduce((a,b)=>a+b,0);
  let r=Math.random()*total;
  for(const [k,w] of Object.entries(RARITY_WEIGHTS)){
    r-=w; if(r<=0) return k;
  }
  return 'C';
}

function _drawCards(n){
  // Try to give variety — no immediate duplicates
  const used=new Set();
  const result=[];
  let attempts=0;
  while(result.length<n && attempts<200){
    attempts++;
    const rarity=_rollRarity();
    const pool=CARD_POOL.filter(c=>c.r===rarity&&!used.has(c.id));
    if(!pool.length) continue;
    const card=pool[Math.floor(Math.random()*pool.length)];
    used.add(card.id);
    result.push(card);
  }
  return result;
}

function showCardPick(){
  const cards=_drawCards(3);
  const wrap=document.getElementById('cardChoices');
  document.getElementById('cardPickSub').textContent=`Wave ${waveNum-1} Complete — Pick 1 Enhancement`;
  wrap.innerHTML='';
  cards.forEach(card=>{
    const seen=saveData.seenCards.includes(card.id);
    saveData.seenCards.push(card.id);
    const el=document.createElement('div');
    el.className=`card r-${card.r}`;
    el.innerHTML=`<div class="card-icon">${card.icon}</div>
      <div class="card-rarity" style="color:${RARITY_COLORS[card.r]}">${RARITY_NAMES[card.r]}</div>
      <div class="card-name">${card.name}</div>
      <div class="card-desc">${card.desc}</div>`;
    el.onclick=()=>pickCard(card);
    wrap.appendChild(el);
  });
  saveSave();
  showScreen('cardScreen');
}

function pickCard(card){
  activeCards.push(card.id);
  saveData.pickedCards.push(card.id);
  if(card.creditReward){ saveData.currency+=card.creditReward; showNotif('+'+card.creditReward+' credits for picking hard card!'); }
  saveSave();
  try{ card.fx(); }catch(e){ console.warn('Card fx error:',e); }
  showNotif(`${RARITY_NAMES[card.r]}: ${card.name} activated!`);
  showScreen('hud');
  document.getElementById('clickNotice').style.display='flex';
  scoped=false; scopeT=0;
  setTimeout(()=>startWave(),500);
}

// ─── Statistics screen ──────────────────────────────────────────
function setStatsTab(tab){
  document.getElementById('statsTabContent').style.display=tab==='stats'?'':'none';
  document.getElementById('encyclopediaTabContent').style.display=tab==='encyclopedia'?'':'none';
  document.getElementById('tabStatsBtn').classList.toggle('active',tab==='stats');
  document.getElementById('tabEncyBtn').classList.toggle('active',tab==='encyclopedia');
}

function buildStatsScreen(){
  const s=saveData;
  const lifetimeAcc=s.totalShotsFired>0?Math.round(s.totalIntercepted/s.totalShotsFired*100):0;
  document.getElementById('statsTabContent').innerHTML=`
    <div class="stat-box" style="max-width:400px;margin:0 auto 14px;">
      <div class="stat-row"><span class="stat-lbl">Best Wave</span><span class="stat-val">${s.waveRecord}</span></div>
      <div class="stat-row"><span class="stat-lbl">Total Score</span><span class="stat-val">${s.totalScore.toLocaleString()}</span></div>
      <div class="stat-row"><span class="stat-lbl">Credits</span><span class="stat-val" style="color:var(--amber)">💰 ${s.currency}</span></div>
      <div class="stat-row"><span class="stat-lbl">Missiles Intercepted</span><span class="stat-val">${s.totalIntercepted}</span></div>
      <div class="stat-row"><span class="stat-lbl">Shots Fired</span><span class="stat-val">${s.totalShotsFired||0}</span></div>
      <div class="stat-row"><span class="stat-lbl">Lifetime Accuracy</span><span class="stat-val">${lifetimeAcc}%</span></div>
      <div class="stat-row"><span class="stat-lbl">Waves Completed</span><span class="stat-val">${s.totalWaves||0}</span></div>
      <div class="stat-row"><span class="stat-lbl">Cards Collected</span><span class="stat-val">${(s.pickedCards||[]).length} / ${CARD_POOL.length}</span></div>
      <div class="stat-row"><span class="stat-lbl">Battle Pass Level</span><span class="stat-val" style="color:var(--amber)">${s.bpLevel||0}</span></div>
      <div class="stat-row"><span class="stat-lbl">Total XP</span><span class="stat-val">${s.bpXP||0}</span></div>
    </div>`;
  // Encyclopedia
  const seen=new Set(s.seenCards||[]);
  const picked=new Set(s.pickedCards||[]);
  const grid=document.getElementById('encyclopediaTabContent');
  grid.innerHTML=`<div class="ency-grid">${CARD_POOL.map(card=>{
    const isSeen=seen.has(card.id);
    const isPicked=picked.has(card.id);
    return `<div class="ency-card ${isPicked?'unlocked':isSeen?'':'locked'}">
      <div style="font-size:1.4em">${isSeen?card.icon:'?'}</div>
      <div style="font-size:.62em;font-family:'Rajdhani',sans-serif;color:${isSeen?RARITY_COLORS[card.r]:'#555'};letter-spacing:.1em">${RARITY_NAMES[card.r]}</div>
      <div style="font-size:.68em;font-weight:700;font-family:'Rajdhani',sans-serif;color:${isSeen?'var(--text)':'#444'};margin:3px 0">${isSeen?card.name:'???'}</div>
      ${isPicked?`<div style="font-size:.6em;color:var(--text2)">${card.desc}</div>`:''}
    </div>`;
  }).join('')}</div>`;
}

