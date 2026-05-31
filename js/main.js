// Events + game loop + init + card system
// ═══════════════════════════════════════════════════════════════
//  EVENTS
// ═══════════════════════════════════════════════════════════════
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
const VALID_CODES={
  'nercessian':{credits:9999999,chronoShards:999999,summonTickets:999999,featuredTickets:999999,message:'NERCESSIAN CODE ACTIVATED — ALL RESOURCES GRANTED'}
};

async function redeemCode(){
  const inp=document.getElementById('settingsCodeInput');
  const fb=document.getElementById('settingsCodeFeedback');
  if(!inp||!fb) return;
  const code=inp.value.trim().toLowerCase();
  if(!code){fb.textContent='Enter a code.';fb.style.color='#888';return;}
  if(!saveData.redeemedCodes) saveData.redeemedCodes=[];
  if(saveData.redeemedCodes.includes(code)){fb.textContent='Already redeemed.';fb.style.color='#F07830';return;}
  const reward=VALID_CODES[code];
  if(!reward){fb.textContent='Invalid code.';fb.style.color='#FF4455';return;}
  if(reward.credits) saveData.currency=(saveData.currency||0)+reward.credits;
  if(!saveData.summonCurrency) saveData.summonCurrency={chronoShards:0,summonTickets:0,featuredTickets:0};
  if(reward.chronoShards) saveData.summonCurrency.chronoShards=(saveData.summonCurrency.chronoShards||0)+reward.chronoShards;
  if(reward.summonTickets) saveData.summonCurrency.summonTickets=(saveData.summonCurrency.summonTickets||0)+reward.summonTickets;
  if(reward.featuredTickets) saveData.summonCurrency.featuredTickets=(saveData.summonCurrency.featuredTickets||0)+reward.featuredTickets;
  saveData.redeemedCodes.push(code);
  if(_fbUser&&_fbDb){
    const _cu={'saveData.redeemedCodes':firebase.firestore.FieldValue.arrayUnion(code)};
    if(reward.credits) _cu['saveData.currency']=firebase.firestore.FieldValue.increment(reward.credits);
    if(reward.chronoShards) _cu['saveData.summonCurrency.chronoShards']=firebase.firestore.FieldValue.increment(reward.chronoShards);
    if(reward.summonTickets) _cu['saveData.summonCurrency.summonTickets']=firebase.firestore.FieldValue.increment(reward.summonTickets);
    if(reward.featuredTickets) _cu['saveData.summonCurrency.featuredTickets']=firebase.firestore.FieldValue.increment(reward.featuredTickets);
    await _fbDb.collection('users').doc(_fbUser.uid).update(_cu).catch(()=>{});
  }
  saveSave();
  inp.value='';
  fb.textContent=reward.message||'Code redeemed!';
  fb.style.color='#44FF88';
  if(typeof showNotif==='function') showNotif(reward.message||'Code redeemed!');
  if(typeof updateSaveUI==='function') updateSaveUI();
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

  // Easter egg key listener
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
    if(e.button===0){
      mouseHeld=true;
      if(currentWeapon==='shock'&&!isReloading&&ammo>0){
        shockCharging=true; shockChargeT=0;
        const w=document.getElementById('shockChargeWrap'); if(w) w.style.display='block';
      } else { fireProjectile(); }
    }
    if(e.button===2){
      if(currentWeapon==='shotgun') fireHook();
      else {scoped=true;sfxScope();}
    }
  });
  document.addEventListener('mouseup',e=>{
    if(e.button===0){
      mouseHeld=false;
      if(shockCharging){
        shockCharging=false;
        const w=document.getElementById('shockChargeWrap'); if(w) w.style.display='none';
        const b=document.getElementById('shockChargeBar'); if(b) b.style.width='0%';
        if(shockChargeT>=SHOCK_CHARGE_DUR) fireProjectile();
        shockChargeT=0;
      }
    }
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
    if(confirm('Return to menu?\n\nCredits and stats from completed waves are already saved.\nOnly the current unfinished wave will not count.')) returnToMenu();
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
    _updateAiBot(dt);
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
  ['shotgun','sniper','smg','railgun','cluster','shock'].forEach(w=>{ if(saveData.unlocks.includes(w)) weaponInventory.add(w); });
  setupEvents();
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
//  SAVE DIAGNOSTICS
// ═══════════════════════════════════════════════════════════════
function updateSaveDiag(){
  if(!document.getElementById('saveDiagPanel')) return;
  const set=(id,v)=>{const el=document.getElementById(id);if(el)el.textContent=v;};
  set('diagFirebase', _fbUser?'✓ Connected ('+(_fbUser.email||'').split('@')[0]+')':'✗ Not logged in');
  set('diagUID', _fbUser?_fbUser.uid.slice(0,14)+'…':'—');
  const outfits=(saveData.ownedSkins||[]).length;
  set('diagOutfits', outfits+' owned');
  const wc=saveData.ownedWeaponCamos||{};
  set('diagCamos', Object.entries(wc).map(([w,c])=>`${w}:${Array.isArray(c)?c.length:0}`).join(' | ')||'none');
  set('diagEquipped', saveData.equippedSkin||'none');
  const ec=saveData.equippedWeaponCamos||{};
  set('diagEquipCamos', Object.entries(ec).map(([w,c])=>`${w}:${c}`).join(' | ')||'none');
}
async function diagRefreshSave(){
  const fb=document.getElementById('saveDiagFeedback');
  if(!_fbUser||!_fbDb){if(fb){fb.textContent='Not logged in.';fb.style.color='#FF4455';}return;}
  if(fb){fb.textContent='Fetching from Firebase…';fb.style.color='#888';}
  try{
    const doc=await _fbDb.collection('users').doc(_fbUser.uid).get();
    if(doc.exists){
      const remote=doc.data()?.saveData;
      if(remote){
        saveData=_normalizeInventory(Object.assign({},saveData,remote));
        try{localStorage.setItem(SAVE_KEY,JSON.stringify(saveData));}catch(e){}
        if(typeof updateSaveUI==='function') updateSaveUI();
        updateSaveDiag();
        if(fb){fb.textContent='Save refreshed from Firebase.';fb.style.color='#44FF88';}
      }
    }
  }catch(e){if(fb){fb.textContent='Error: '+e.message;fb.style.color='#FF4455';}}
}
function diagNormalize(){
  saveData=_normalizeInventory(saveData);
  saveSave();
  updateSaveDiag();
  const fb=document.getElementById('saveDiagFeedback');
  if(fb){fb.textContent='Save normalized and written to Firebase.';fb.style.color='#44FF88';}
}
function diagFeedback(msg){
  const fb=document.getElementById('saveDiagFeedback');
  if(fb){fb.textContent=msg;fb.style.color='#44FF88';}
}

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

// Card pool — ALL chaos & debuffs. Pick a curse, earn credits.
// creditReward = credits given for picking the card (harder = more credits)
const CARD_POOL=[
  // ── COMMON (mostly debuffs + small credit rewards) ──────────────
  {id:'c01',r:'C',icon:'💀',name:'Enemy Rush',      desc:'HARDER: A heavy soldier spawns now. +50 credits',           creditReward:50,  fx:()=>{ if(selectedLoc) spawnSoldiers(selectedLoc,1,'heavy'); showNotif('Enemy reinforcements!'); }},
  {id:'c02',r:'C',icon:'📭',name:'Jammed Mags',     desc:'HARDER: -20% max ammo. +60 credits',                        creditReward:60,  fx:()=>{ Object.keys(WEAPONS).forEach(k=>{WEAPONS[k].maxAmmo=Math.max(1,Math.floor(WEAPONS[k].maxAmmo*.80));weaponAmmo[k]=WEAPONS[k].maxAmmo;}); ammo=WEAPONS[currentWeapon].maxAmmo; }},
  {id:'c03',r:'C',icon:'🪨',name:'Heavy Boots',     desc:'HARDER: -12% move speed. +50 credits',                      creditReward:50,  fx:()=>{ effectiveSpd*=.88; effectiveSprint*=.88; }},
  {id:'c04',r:'C',icon:'💰',name:'Salvage Crew',    desc:'+100 credits.',                                              fx:()=>{ saveData.currency+=100; saveSave(); }},
  {id:'c05',r:'C',icon:'💨',name:'Shaky Hands',     desc:'HARDER: +15% weapon spread. +55 credits',                   creditReward:55,  fx:()=>{ Object.keys(WEAPONS).forEach(k=>{WEAPONS[k].spread=Math.min(.5,(WEAPONS[k].spread||0)+.04);}); }},
  {id:'c06',r:'C',icon:'🩸',name:'Cracked Vest',    desc:'HARDER: You take +25% more damage. +60 credits',            creditReward:60,  fx:()=>{ window._playerDmgMult=(window._playerDmgMult||1)*1.25; }},
  {id:'c07',r:'C',icon:'🪫',name:'Dull Rounds',     desc:'HARDER: -15% projectile damage. +50 credits',               creditReward:50,  fx:()=>{ dmgMult*=.85; }},
  {id:'c08',r:'C',icon:'🚀',name:'Extra Missile',   desc:'HARDER: +1 missile this wave. +80 credits',                 creditReward:80,  fx:()=>{ waveMissileTotal+=1; showNotif('+1 missile incoming!'); }},
  {id:'c09',r:'C',icon:'🐢',name:'Sluggish',        desc:'HARDER: -15% sprint speed. +50 credits',                    creditReward:50,  fx:()=>{ effectiveSprint*=.85; }},
  {id:'c10',r:'C',icon:'⏳',name:'Slow Reload',     desc:'HARDER: +20% reload time. +55 credits',                     creditReward:55,  fx:()=>{ Object.keys(WEAPONS).forEach(k=>WEAPONS[k].reloadTime*=1.20); }},
  // ── UNCOMMON (mostly debuffs + medium credit rewards) ───────────
  {id:'u01',r:'U',icon:'🚀',name:'Missile Salvo',   desc:'HARDER: +3 extra missiles. +130 credits',                   creditReward:130, fx:()=>{ waveMissileTotal+=3; showNotif('3 more missiles incoming!'); }},
  {id:'u02',r:'U',icon:'⏰',name:'Broken Loader',   desc:'HARDER: +35% reload time. +110 credits',                    creditReward:110, fx:()=>{ Object.keys(WEAPONS).forEach(k=>WEAPONS[k].reloadTime*=1.35); }},
  {id:'u03',r:'U',icon:'🪨',name:'Lead Legs',       desc:'HARDER: -20% all movement. +120 credits',                   creditReward:120, fx:()=>{ effectiveSpd*=.80; effectiveSprint*=.80; }},
  {id:'u04',r:'U',icon:'💰',name:'War Profiteer',   desc:'+50% credits per wave.',                                     fx:()=>{ window._creditMult=(window._creditMult||1)*1.5; }},
  {id:'u05',r:'U',icon:'💀',name:'Soldier Squad',   desc:'HARDER: 2 heavy soldiers spawn now. +140 credits',          creditReward:140, fx:()=>{ if(selectedLoc){spawnSoldiers(selectedLoc,1,'heavy');setTimeout(()=>spawnSoldiers(selectedLoc,1,'heavy'),500);} showNotif('Heavies deployed!'); }},
  {id:'u06',r:'U',icon:'🗺',name:'Fog of War',      desc:'HARDER: Minimap disabled. +120 credits',                    creditReward:120, fx:()=>{ const mm=document.getElementById('minimap'); if(mm) mm.style.visibility='hidden'; }},
  {id:'u07',r:'U',icon:'💨',name:'Turbo Missiles',  desc:'HARDER: Missiles +25% faster. +150 credits',                creditReward:150, fx:()=>{ missiles.forEach(m=>{m.vel.x*=1.25;m.vel.y*=1.25;m.vel.z*=1.25;}); }},
  {id:'u08',r:'U',icon:'🏙',name:'City Damage',     desc:'HARDER: City integrity -12% now. +160 credits',             creditReward:160, fx:()=>{ cityIntegrity=Math.max(5,cityIntegrity-12); showNotif('City damaged!'); }},
  {id:'u09',r:'U',icon:'🪫',name:'Weak Rounds',     desc:'HARDER: -35% ammo. +130 credits',                           creditReward:130, fx:()=>{ Object.keys(WEAPONS).forEach(k=>{WEAPONS[k].maxAmmo=Math.max(1,Math.floor(WEAPONS[k].maxAmmo*.65));weaponAmmo[k]=WEAPONS[k].maxAmmo;}); ammo=WEAPONS[currentWeapon].maxAmmo; }},
  {id:'u10',r:'U',icon:'💰',name:'Supply Drop',     desc:'+300 credits.',                                              fx:()=>{ saveData.currency+=300; saveSave(); }},
  // ── RARE (heavy debuffs + good credits) ─────────────────────────
  {id:'r01',r:'R',icon:'👾',name:'Boss Arrival',    desc:'HARDER: A boss missile spawns now! +200 credits',           creditReward:200, fx:()=>{ spawnMissile(true); showNotif('BOSS MISSILE!'); }},
  {id:'r02',r:'R',icon:'🏙',name:'Half Health',     desc:'HARDER: City integrity -20%. +180 credits',                 creditReward:180, fx:()=>{ cityIntegrity=Math.max(5,cityIntegrity-20); }},
  {id:'r03',r:'R',icon:'🦾',name:'Iron Soldiers',   desc:'HARDER: All soldiers +75% HP. +200 credits',                creditReward:200, fx:()=>{ soldiers.forEach(s=>s.health=Math.ceil(s.health*1.75)); }},
  {id:'r04',r:'R',icon:'📭',name:'Drought',         desc:'HARDER: All weapon ammo halved. +220 credits',              creditReward:220, fx:()=>{ Object.keys(WEAPONS).forEach(k=>{WEAPONS[k].maxAmmo=Math.max(1,Math.floor(WEAPONS[k].maxAmmo/2));weaponAmmo[k]=WEAPONS[k].maxAmmo;}); ammo=WEAPONS[currentWeapon].maxAmmo; }},
  {id:'r05',r:'R',icon:'🚀',name:'Missile Storm',   desc:'HARDER: +5 extra missiles. +250 credits',                   creditReward:250, fx:()=>{ waveMissileTotal+=5; showNotif('5 more missiles!'); }},
  {id:'r06',r:'R',icon:'💨',name:'Speed Blitz',     desc:'HARDER: Missiles +35% faster. +220 credits',                creditReward:220, fx:()=>{ missiles.forEach(m=>{m.vel.x*=1.35;m.vel.y*=1.35;m.vel.z*=1.35;}); }},
  {id:'r07',r:'R',icon:'🚫',name:'No Gadgets',      desc:'HARDER: All gadget charges set to 0. +200 credits',         creditReward:200, fx:()=>{ activeGadgets={flashbang:0,airstrike:0,cover:0}; showNotif('Gadgets disabled!'); }},
  {id:'r08',r:'R',icon:'🌫',name:'Thick Fog',       desc:'HARDER: Fog distance halved. +240 credits',                 creditReward:240, fx:()=>{ if(scene.fog){scene.fog.near*=.5;scene.fog.far*=.5;} }},
  {id:'r09',r:'R',icon:'💰',name:'Rare Find',       desc:'+500 credits.',                                              fx:()=>{ saveData.currency+=500; saveSave(); }},
  {id:'r10',r:'R',icon:'🎯',name:'Sniper Ambush',   desc:'HARDER: 3 snipers + 2 heavies spawn now. +280 credits',     creditReward:280, fx:()=>{ if(selectedLoc){for(let i=0;i<3;i++)setTimeout(()=>spawnSoldiers(selectedLoc,1,'sniper'),i*400);setTimeout(()=>spawnSoldiers(selectedLoc,1,'heavy'),300);setTimeout(()=>spawnSoldiers(selectedLoc,1,'heavy'),800);} showNotif('AMBUSH!'); }},
  // ── EPIC (severe debuffs + great credits) ────────────────────────
  {id:'e01',r:'E',icon:'👾',name:'Boss Surge',      desc:'HARDER: 2 boss missiles spawn now! +450 credits',           creditReward:450, fx:()=>{ spawnMissile(true); setTimeout(()=>spawnMissile(true),1200); showNotif('2 BOSS MISSILES!'); }},
  {id:'e02',r:'E',icon:'🎯',name:'Smoke Screen',    desc:'HARDER: Crosshair removed for the rest of the game. +320 credits', creditReward:320, fx:()=>{ const ch=document.getElementById('crosshair'); if(ch) ch.style.display='none'; }},
  {id:'e03',r:'E',icon:'🦾',name:'Armored Missiles',desc:'HARDER: All missiles +60% HP. +380 credits',                creditReward:380, fx:()=>{ missiles.forEach(m=>{m.maxHealth=Math.ceil(m.maxHealth*1.6);m.health=Math.ceil(m.health*1.6);}); }},
  {id:'e04',r:'E',icon:'🎯',name:'Elite Force',     desc:'HARDER: 5 snipers + city -10%. +400 credits',               creditReward:400, fx:()=>{ if(selectedLoc) for(let i=0;i<5;i++) setTimeout(()=>spawnSoldiers(selectedLoc,1,'sniper'),i*300); cityIntegrity=Math.max(5,cityIntegrity-10); showNotif('ELITE SNIPERS!'); }},
  {id:'e05',r:'E',icon:'💥',name:'Fragile City',    desc:'HARDER: City blast damage ×3. +450 credits',                creditReward:450, fx:()=>{ window._cityBlastMult=(window._cityBlastMult||1)*3; showNotif('City is FRAGILE!'); }},
  {id:'e06',r:'E',icon:'📺',name:'HUD Down',        desc:'HARDER: HUD offline for 45 seconds. +400 credits',          creditReward:400, fx:()=>{ const hud=document.getElementById('hud'); if(hud){const e=hud.querySelectorAll('.hud-panel,.hud-row');e.forEach(el=>el.style.opacity='0');setTimeout(()=>e.forEach(el=>el.style.opacity=''),45000);} showNotif('HUD OFFLINE 45s!'); }},
  {id:'e07',r:'E',icon:'💀',name:'Invasion Force',  desc:'HARDER: 7 heavies + boss missile. +550 credits',            creditReward:550, fx:()=>{ spawnMissile(true); if(selectedLoc) for(let i=0;i<7;i++) setTimeout(()=>spawnSoldiers(selectedLoc,1,'heavy'),i*250); showNotif('INVASION!'); }},
  {id:'e08',r:'E',icon:'🌫',name:'Blackout Fog',    desc:'HARDER: Fog halved + minimap gone. +420 credits',           creditReward:420, fx:()=>{ if(scene.fog){scene.fog.near*=.5;scene.fog.far*=.5;} const mm=document.getElementById('minimap'); if(mm) mm.style.visibility='hidden'; }},
  {id:'e09',r:'E',icon:'💰',name:'Credit Matrix',   desc:'+1000 credits + ×2 future credits.',                        fx:()=>{ saveData.currency+=1000; window._creditMult=(window._creditMult||1)*2; saveSave(); }},
  {id:'e10',r:'E',icon:'🚀',name:'Wave Surge',      desc:'HARDER: Missiles doubled + 25% faster. +500 credits',       creditReward:500, fx:()=>{ waveMissileTotal+=Math.ceil(waveMissileTotal); missiles.forEach(m=>{m.vel.x*=1.25;m.vel.y*=1.25;m.vel.z*=1.25;}); showNotif('WAVE SURGE!'); }},
  // ── LEGENDARY (devastating + huge credits) ──────────────────────
  {id:'l01',r:'L',icon:'💀',name:'Hard Mode',       desc:'HARDER: City -40%, missiles +60% HP. +700 credits',          creditReward:700, fx:()=>{ cityIntegrity=Math.max(5,cityIntegrity-40); missiles.forEach(m=>{m.maxHealth=Math.ceil(m.maxHealth*1.6);m.health=Math.ceil(m.health*1.6);}); showNotif('HARD MODE!'); }},
  {id:'l02',r:'L',icon:'📺',name:'Total Blackout',  desc:'HARDER: HUD + crosshair gone 60s. +800 credits',             creditReward:800, fx:()=>{ const hud=document.getElementById('hud'); if(hud){const e=hud.querySelectorAll('.hud-panel,.hud-row');e.forEach(el=>el.style.opacity='0');setTimeout(()=>e.forEach(el=>el.style.opacity=''),60000);} const ch=document.getElementById('crosshair'); if(ch){ch.style.display='none';setTimeout(()=>ch.style.display='',60000);} showNotif('TOTAL BLACKOUT 60s!'); }},
  {id:'l03',r:'L',icon:'💀',name:'Full Invasion',   desc:'HARDER: 8 heavies + 3 boss missiles. +950 credits',          creditReward:950, fx:()=>{ for(let i=0;i<3;i++) setTimeout(()=>spawnMissile(true),i*1000); if(selectedLoc) for(let i=0;i<8;i++) setTimeout(()=>spawnSoldiers(selectedLoc,1,'heavy'),i*200); showNotif('FULL INVASION!'); }},
  {id:'l04',r:'L',icon:'💨',name:'Hypersonic',      desc:'HARDER: All missiles 2.5× faster. +850 credits',             creditReward:850, fx:()=>{ missiles.forEach(m=>{m.vel.x*=2.5;m.vel.y*=2.5;m.vel.z*=2.5;}); showNotif('HYPERSONIC MISSILES!'); }},
  {id:'l05',r:'L',icon:'📭',name:'Empty Arsenal',   desc:'HARDER: Ammo=1, city -15%, missiles +40% HP. +1000 credits', creditReward:1000, fx:()=>{ Object.keys(WEAPONS).forEach(k=>{WEAPONS[k].maxAmmo=1;weaponAmmo[k]=1;}); ammo=1; cityIntegrity=Math.max(5,cityIntegrity-15); missiles.forEach(m=>{m.maxHealth=Math.ceil(m.maxHealth*1.4);m.health=Math.ceil(m.health*1.4);}); showNotif('ARSENAL DRAINED!'); }},
  // ── MYTHIC (apocalyptic — all debuffs, massive rewards) ─────────
  {id:'m01',r:'M',icon:'👾',name:'BOSS MISSILE',    desc:'HARDER: Boss missile spawned! +1200 credits',                creditReward:1200, fx:()=>{ spawnMissile(true); showNotif('A BOSS MISSILE WAS SUMMONED!'); }},
  {id:'m02',r:'M',icon:'💀',name:'ENEMY BATTALION', desc:'HARDER: 8 elite soldiers spawned! +1400 credits',           creditReward:1400, fx:()=>{ if(selectedLoc) for(let i=0;i<8;i++) setTimeout(()=>spawnSoldiers(selectedLoc,1,'heavy'),i*200); showNotif('ENEMY BATTALION!'); }},
  {id:'m03',r:'M',icon:'🚀',name:'MISSILE STORM',   desc:'HARDER: Missiles tripled this wave! +1800 credits',          creditReward:1800, fx:()=>{ waveMissileTotal+=waveMissileTotal*2; showNotif('MISSILE STORM!'); }},
  {id:'m04',r:'M',icon:'☢',name:'NUCLEAR THREAT',   desc:'HARDER: All missiles boss class + 2× speed! +2500 credits', creditReward:2500, fx:()=>{ window._allBoss=true; missiles.forEach(m=>{m.vel.x*=2;m.vel.y*=2;m.vel.z*=2;}); showNotif('ALL MISSILES BOSS CLASS!'); }},
  {id:'m05',r:'M',icon:'🌍',name:'ARMAGEDDON',      desc:'HARDER: City -30%, all boss missiles, 3 boss spawns, fog gone. +3000 credits', creditReward:3000, fx:()=>{ window._allBoss=true; cityIntegrity=Math.max(5,cityIntegrity-30); for(let i=0;i<3;i++) setTimeout(()=>spawnMissile(true),i*800); if(scene.fog){scene.fog.near*=.25;scene.fog.far*=.25;} const mm=document.getElementById('minimap'); if(mm) mm.style.visibility='hidden'; const ch=document.getElementById('crosshair'); if(ch){ch.style.display='none';setTimeout(()=>ch.style.display='',90000);} showNotif('ARMAGEDDON!'); }},
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
    if(!seen) saveData.seenCards.push(card.id);
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

