// HUD + screens + shop + customization + save UI + world map
// ═══════════════════════════════════════════════════════════════
//  SCREEN SHAKE & VFX
// ═══════════════════════════════════════════════════════════════
function triggerScreenShake(intensity){shakeT=.35;shakeStr=intensity;}
function showDamageFlash(){
  const el=document.getElementById('damageFlash');
  el.classList.add('flash');
  setTimeout(()=>el.classList.remove('flash'),200);
}

function updateScreenShake(dt){
  if(shakeT>0){
    shakeT-=dt;
    const s=shakeStr*shakeT/.35;
    renderer.domElement.style.transform=`translate(${(Math.random()-.5)*s*8}px,${(Math.random()-.5)*s*8}px)`;
  } else {
    renderer.domElement.style.transform='';
  }
}

function showScorePop(pts, pos3d){
  const el=document.createElement('div');
  el.className='score-pop';
  el.textContent='+'+pts;
  // Project 3D pos to screen
  const v=pos3d.clone().project(camera);
  const sx=(v.x*.5+.5)*window.innerWidth;
  const sy=(-.5*v.y+.5)*window.innerHeight;
  el.style.left=sx+'px';
  el.style.top=sy+'px';
  document.body.appendChild(el);
  setTimeout(()=>el.remove(),1500);
}

// ═══════════════════════════════════════════════════════════════
//  HUD UPDATE
// ═══════════════════════════════════════════════════════════════
function updateHUD(){
  document.getElementById('hudWave').textContent=waveNum;
  document.getElementById('hudScore').textContent=score;
  document.getElementById('hudCity').textContent=cityIntegrity+'%';
  document.getElementById('cityBar').style.width=cityIntegrity+'%';
  const cityVal=document.getElementById('hudCity');
  cityVal.className='hud-val '+(cityIntegrity>60?'green':cityIntegrity>30?'gold':'red');

  const wep=WEAPONS[currentWeapon];
  const reloading=isReloading?` [RELOAD ${Math.ceil(reloadT)}s]`:'';
  document.getElementById('hudAmmo').textContent=ammo+'/'+wep.maxAmmo+reloading;
  document.getElementById('ammoBar').style.width=(ammo/wep.maxAmmo*100)+'%';
  updateWeaponBar();

  const active=missiles.filter(m=>!m.isDestroyed).length;
  document.getElementById('hudMissiles').textContent=active;

  // Threat indicators for off-screen missiles
  updateThreatIndicators();
}

function updateThreatIndicators(){
  document.querySelectorAll('.threat-arrow').forEach(e=>e.remove());
  const W=window.innerWidth,H=window.innerHeight;
  for(const m of missiles){
    if(m.isDestroyed) continue;
    const v=m.pos.clone().project(camera);
    const sx=(v.x*.5+.5)*W;
    const sy=(-.5*v.y+.5)*H;
    if(sx>=0&&sx<=W&&sy>=0&&sy<=H&&v.z<1) continue;
    // Off-screen — draw indicator at edge
    const cx=W/2,cy=H/2;
    const dx=sx-cx,dy=sy-cy;
    const angle=Math.atan2(dy,dx);
    const margin=30;
    const edgeX=cx+Math.cos(angle)*(cx-margin);
    const edgeY=cy+Math.sin(angle)*(cy-margin);
    const clampedX=Math.max(margin,Math.min(W-margin,edgeX));
    const clampedY=Math.max(margin,Math.min(H-margin,edgeY));
    const el=document.createElement('div');
    el.className='threat-arrow';
    el.textContent='⚠';
    el.style.cssText=`left:${clampedX-11}px;top:${clampedY-11}px;color:#ff4444;font-size:18px;
      text-shadow:0 0 6px rgba(255,68,68,.8);`;
    document.body.appendChild(el);
  }
}

// ═══════════════════════════════════════════════════════════════
//  NOTIFICATIONS
// ═══════════════════════════════════════════════════════════════
let notifTO=null;
function showNotif(msg,duration=2200){
  const el=document.getElementById('notif');
  el.textContent=msg;
  el.style.display='block';
  el.className='show';
  clearTimeout(notifTO);
  notifTO=setTimeout(()=>{el.className='';el.style.display='none';},duration);
}

function showWaveAnnounce(msg){
  const el=document.getElementById('waveAnnounce');
  el.textContent=msg;
  el.style.display='block';
  setTimeout(()=>{el.style.display='none';},3000);
}

// ═══════════════════════════════════════════════════════════════
//  SCREEN MANAGEMENT
// ═══════════════════════════════════════════════════════════════
function showScreen(name){
  document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));
  document.getElementById(name).classList.add('active');
  currentScreen=name;
  if(name==='locationSelect') startMapAnimation();
  else stopMapAnimation();
}

// ═══════════════════════════════════════════════════════════════
//  GAME START / STOP
// ═══════════════════════════════════════════════════════════════
function startGame(locId, wave){
  selectedLoc=locId;
  saveData.locId=locId; saveSave();
  waveNum=wave||1;
  score=0;
  totalInterceptedSession=0;
  mpLocalStats={missiles:0,soldiers:0};
  mpRemoteStats={};
  px=0;py=PLAYER_H;pz=20;
  vx=0;vy=0;vz=0;
  yaw=0;pitch=0;
  currentWeapon='launcher';
  weaponInventory=new Set(['pistol','launcher']);
  ['shotgun','sniper','smg'].forEach(w=>{if(saveData.unlocks.includes(w)) weaponInventory.add(w);});
  weaponAmmo={};
  Object.keys(WEAPONS).forEach(k=>{ weaponAmmo[k]=WEAPONS[k].maxAmmo; });
  ammo=WEAPONS[currentWeapon].maxAmmo;isReloading=false;fireCD=0;scoped=false;scopeT=0;
  // Apply upgrades
  const upg=saveData.upgrades||{};
  effectiveSpd=PLAYER_SPD*(1+0.15*(upg.speed_chip||0));
  effectiveSprint=SPRINT_SPD*(1+0.15*(upg.speed_chip||0));
  dmgMult=1+0.3*(upg.hot_rounds||0);
  // Armor style modifiers
  playerArmorStyle=saveData.customization.armorStyle||'light';
  if(playerArmorStyle==='heavy'){ effectiveSpd*=0.85; effectiveSprint*=0.85; }
  else if(playerArmorStyle==='stealth'){ effectiveSpd*=1.12; effectiveSprint*=1.12; }
  // Gadgets reset per game
  activeGadgets=Object.assign({flashbang:0,airstrike:0,cover:0}, saveData.gadgets||{});
  cyberBulletCD=0;
  cyberBulletOwned=saveData.hasCyberBullet||false;
  rajpnFistOwned=saveData.hasRajpnFist||false;
  rajpnFistCD=0; _rajpnState=null;
  activeCards=[];
  _pendingCardPick=false;
  window._playerDmgMult=1; window._creditMult=1; window._ammoPackMult=1;
  window._killCreditBonus=0; window._reaperHeal=false; window._allBoss=false;
  window._cityBlastMult=1; window._flashRad=1; window._explRadMult=1;

  buildWorld(locId);
  document.getElementById('hudLoc').textContent=LOCS[locId].flag+' '+LOCS[locId].name;
  document.getElementById('hudOrigin').textContent=locId==='sweden'?'NORWAY':locId==='beirut'?'ISRAEL':'IRAN';

  gameActive=true;
  gamePaused=false;
  showScreen('hud');
  document.getElementById('crosshair').style.display='block';
  document.getElementById('clickNotice').style.display='flex';
  document.getElementById('weaponBar').style.display='flex';
  document.getElementById('minimap').style.display='block';
  updateWeaponBar();
  setTimeout(()=>startWave(),1500);
}

function pauseGame(){
  if(!gameActive) return;
  gamePaused=true;
  if(isLocked) document.exitPointerLock();
  showScreen('pauseMenu');
  document.getElementById('crosshair').style.display='none';
  document.getElementById('scopeOverlay').style.display='none';
  document.getElementById('weaponBar').style.display='none';
  document.getElementById('minimap').style.display='none';
}

function resumeGame(){
  gamePaused=false;
  showScreen('hud');
  document.getElementById('weaponBar').style.display='flex';
  if(!battleActive) document.getElementById('minimap').style.display='block';
  updateWeaponBar();
  document.getElementById('crosshair').style.display='block';
}

function returnToMenu(){
  gameActive=false;
  gamePaused=false;
  battleActive=false;
  isLocked=false;
  scoped=false;
  scopeT=0;
  if(document.pointerLockElement) document.exitPointerLock();
  // Remove any gulag lights so they don't bleed into the next game
  _gulagLights.forEach(l=>scene.remove(l)); _gulagLights=[];
  gulagCollidables=[];
  clearWorld();
  scene.background=new THREE.Color(0x000000);
  scene.fog=null;
  document.getElementById('crosshair').style.display='none';
  document.getElementById('scopeOverlay').style.display='none';
  document.getElementById('weaponBar').style.display='none';
  document.getElementById('minimap').style.display='none';
  updateSaveUI();
  showScreen('mainMenu');
}

// ═══════════════════════════════════════════════════════════════
//  SHOP
// ═══════════════════════════════════════════════════════════════
const SHOP_ITEMS=[
  // Weapons
  {id:'shotgun',       name:'Super Shotgun', icon:'SGN', cost:1200, type:'weapon',   value:'shotgun'},
  {id:'sniper',        name:'Sniper Rifle',  icon:'SNP', cost:1800, type:'weapon',   value:'sniper'},
  {id:'smg',           name:'P90 SMG',       icon:'SMG', cost:900,  type:'weapon',   value:'smg'},
  // Gadgets
  {id:'flashbang',     name:'Flashbang',     icon:'FBG', cost:600,  type:'gadget',   value:'flashbang'},
  {id:'airstrike',     name:'Airstrike',     icon:'AIR', cost:2200, type:'gadget',   value:'airstrike'},
  {id:'cover',         name:'Deploy Cover',  icon:'CVR', cost:1400, type:'gadget',   value:'cover'},
  // Ultimates
  {id:'cyber_bullet',  name:'Cyber Bullet',  icon:'🚗', cost:3000, type:'ultimate', value:'cyber_bullet'},
  {id:'rajpn_fist',    name:'RAJPN Fist Bump',icon:'👊', cost:4500, type:'ultimate', value:'rajpn_fist'},
  // Upgrades (stackable x3)
  {id:'armor_plate_1', name:'Armor Plate',   icon:'ARM', cost:700,  type:'upgrade',  value:'armor_plate', stack:'armor_plate', max:3},
  {id:'speed_chip_1',  name:'Speed Chip',    icon:'SPD', cost:600,  type:'upgrade',  value:'speed_chip',  stack:'speed_chip',  max:3},
  {id:'hot_rounds_1',  name:'Hot Rounds',    icon:'HOT', cost:1000, type:'upgrade',  value:'hot_rounds',  stack:'hot_rounds',  max:3},
  // Cosmetics — outfits
  {id:'outfit_red',    name:'Red Strike',    icon:'RED', cost:400,  type:'outfit',   value:'#8B0000'},
  {id:'outfit_green',  name:'Forest Ops',    icon:'GRN', cost:400,  type:'outfit',   value:'#2D5A27'},
  {id:'outfit_orange', name:'Desert Sand',   icon:'ORG', cost:400,  type:'outfit',   value:'#C47A2A'},
  {id:'outfit_purple', name:'Shadow Unit',   icon:'PRP', cost:600,  type:'outfit',   value:'#4A1A6A'},
  {id:'outfit_white',  name:'Arctic Ops',    icon:'WHT', cost:500,  type:'outfit',   value:'#D8DCE8'},
  {id:'outfit_urban',  name:'Urban Camo',    icon:'URB', cost:500,  type:'outfit',   value:'#5A6A5A'},
  {id:'outfit_desert', name:'Desert Camo',   icon:'DST', cost:500,  type:'outfit',   value:'#C4956A'},
  {id:'outfit_jungle', name:'Jungle Camo',   icon:'JGL', cost:500,  type:'outfit',   value:'#3A6A3A'},
  // Cosmetics — visors
  {id:'visor_red',     name:'Red Visor',     icon:'RED', cost:350,  type:'visor',    value:'#FF3333'},
  {id:'visor_gold',    name:'Gold Visor',    icon:'GLD', cost:700,  type:'visor',    value:'#FFD700'},
  {id:'visor_green',   name:'Night Vision',  icon:'NVG', cost:500,  type:'visor',    value:'#00FF44'},
  {id:'visor_orange',  name:'Sunset',        icon:'ORG', cost:400,  type:'visor',    value:'#FF8800'},
  {id:'visor_cyan',    name:'Cyan Visor',    icon:'CYN', cost:300,  type:'visor',    value:'#44CCFF'},
  {id:'visor_white',   name:'White Visor',   icon:'WHT', cost:300,  type:'visor',    value:'#EEEEEE'},
  {id:'visor_black',   name:'Tactical Visor',icon:'TAC', cost:300,  type:'visor',    value:'#111111'},
  // Cosmetics — armor/bp
  {id:'armor_heavy',   name:'Heavy Armor',   icon:'HVY', cost:900,  type:'armor',    value:'heavy'},
  {id:'armor_stealth', name:'Stealth Suit',  icon:'STL', cost:1100, type:'armor',    value:'stealth'},
  {id:'bp_standard',   name:'Std Backpack',  icon:'STD', cost:250,  type:'bp',       value:'standard'},
  {id:'bp_tactical',   name:'Tactical Pack', icon:'TAC', cost:450,  type:'bp',       value:'tactical'},
];

let activeShopTab='weapons';
function setShopTab(tab){
  activeShopTab=tab;
  document.querySelectorAll('.shop-tab-btn').forEach(b=>b.classList.toggle('active',b.dataset.tab===tab));
  buildShop();
}
const SHOP_DESCS={
  shotgun:'Double barrel + grappling hook (RMB).',
  sniper:'High zoom, extreme range. RMB for scope.',
  smg:'Full-auto, 30-round drum mag. Fast TTK.',
  flashbang:'Stuns soldiers in 18m for 3.5s.',
  airstrike:'Destroys missiles in 12m radius after 3s.',
  cover:'Deploys a barrier 4m ahead for 20s.',
  cyber_bullet:'Guided car missile locks nearest threat.',
  rajpn_fist:'Two giant fists shoot inward — fist bump explodes all missiles between them.',
  armor_plate_1:'Reduces city damage. Stack ×3.',
  speed_chip_1:'Move + sprint speed +15%. Stack ×3.',
  hot_rounds_1:'Projectile damage +30%. Stack ×3.',
  outfit_red:'Red Strike colorway.',
  outfit_green:'Forest Ops woodland.',
  outfit_orange:'Desert Sand blend.',
  outfit_purple:'Shadow Unit covert.',
  outfit_white:'Arctic Ops snow.',
  outfit_urban:'Urban Camo.',
  outfit_desert:'Desert Camo.',
  outfit_jungle:'Jungle Camo.',
  visor_red:'Red Visor',visor_gold:'Gold Visor',visor_green:'Night Vision',
  visor_orange:'Sunset',visor_cyan:'Cyan',visor_white:'White',visor_black:'Tactical',
  armor_heavy:'Heavy — wider, plated silhouette.',
  armor_stealth:'Stealth — slim with glowing accents.',
  bp_standard:'Standard backpack.',
  bp_tactical:'Tactical frame pack.',
};
const SHOP_TAB_MAP={
  weapons:  ['shotgun','sniper','smg'],
  upgrades: ['armor_plate_1','speed_chip_1','hot_rounds_1'],
  gadgets:  ['flashbang','airstrike','cover'],
  ultimate: ['cyber_bullet','rajpn_fist'],
  cosmetics:['outfit_red','outfit_green','outfit_orange','outfit_purple','outfit_white','outfit_urban','outfit_desert','outfit_jungle',
             'visor_red','visor_gold','visor_green','visor_orange','visor_cyan','visor_white','visor_black',
             'armor_heavy','armor_stealth','bp_standard','bp_tactical'],
};
function buildShop(){
  const grid=document.getElementById('shopGrid');
  grid.innerHTML='';
  const tabIds=SHOP_TAB_MAP[activeShopTab]||[];
  const items=SHOP_ITEMS.filter(it=>tabIds.includes(it.id));
  items.forEach(item=>{
    const owned=saveData.unlocks.includes(item.id)||(item.type==='weapon'&&weaponInventory.has(item.value));
    const equipped=isEquipped(item);
    let costLabel='💰 '+item.cost;
    if(item.type==='upgrade'){
      const lvl=getUpgradeLevel(item);
      costLabel=lvl>=(item.max||3)?'MAX':lvl>0?'Lv '+lvl+'/'+(item.max||3)+' · 💰'+item.cost:'💰 '+item.cost;
    } else if(item.type==='gadget'){
      const ch=getGadgetCharges(item);
      costLabel=ch>0?ch+'× · +💰'+item.cost:'💰 '+item.cost;
    } else if(item.type==='ultimate'){
      const ownedUlt=item.id==='cyber_bullet'?saveData.hasCyberBullet:saveData.hasRajpnFist;
      costLabel=ownedUlt?'OWNED':'💰 '+item.cost;
    } else if(owned){
      costLabel=item.type==='weapon'?'UNLOCKED':'Equipped';
    }
    const ownedUlt2=item.id==='cyber_bullet'?saveData.hasCyberBullet:(item.id==='rajpn_fist'?saveData.hasRajpnFist:false);
    const isOwned=owned||(item.type==='ultimate'&&ownedUlt2)||
                  (item.type==='upgrade'&&getUpgradeLevel(item)>=(item.max||3));
    const desc=SHOP_DESCS[item.id]||'';
    const div=document.createElement('div');
    div.className='shop-item'+(isOwned?' owned':'')+(equipped?' equipped':'');
    div.innerHTML=`<div class="shop-icon">${item.icon}</div>
      <div class="shop-name">${item.name}</div>
      <div class="shop-item-desc">${desc}</div>
      <div class="shop-cost">${costLabel}</div>`;
    div.addEventListener('click',()=>handleShopClick(item,div));
    grid.appendChild(div);
  });
  document.getElementById('shopCreds').textContent='💰 Credits: '+saveData.currency;
}

function getUpgradeLevel(item){
  if(item.type!=='upgrade') return 0;
  return (saveData.upgrades||{})[item.value]||0;
}
function getGadgetCharges(item){
  if(item.type!=='gadget') return 0;
  return (saveData.gadgets||{})[item.value]||0;
}
function isEquipped(item){
  const c=saveData.customization;
  if(item.type==='weapon')   return weaponInventory.has(item.value);
  if(item.type==='outfit')   return c.outfitColor===item.value;
  if(item.type==='visor')    return c.visorColor===item.value;
  if(item.type==='armor')    return c.armorStyle===item.value;
  if(item.type==='bp')       return c.backpack===item.value;
  if(item.type==='upgrade')  return getUpgradeLevel(item)>0;
  if(item.type==='gadget')   return getGadgetCharges(item)>0;
  if(item.type==='ultimate') return item.id==='rajpn_fist'?(saveData.hasRajpnFist||false):(saveData.hasCyberBullet||false);
  return false;
}

function handleShopClick(item,div){
  // Upgrades: stackable
  if(item.type==='upgrade'){
    const lvl=getUpgradeLevel(item);
    if(lvl>=(item.max||3)){showNotif('Max level reached!');return;}
    if(saveData.currency<item.cost){showNotif('Not enough credits!');playTone(180,.12,'sine',.14);return;}
    saveData.currency-=item.cost;
    if(!saveData.upgrades) saveData.upgrades={};
    saveData.upgrades[item.value]=(saveData.upgrades[item.value]||0)+1;
    saveSave();buildShop();
    showNotif(item.name+' Lv '+(lvl+1)+'!');playTone(660,.15,'sine',.18);
    return;
  }
  // Gadgets: buy charges
  if(item.type==='gadget'){
    if(saveData.currency<item.cost){showNotif('Not enough credits!');playTone(180,.12,'sine',.14);return;}
    saveData.currency-=item.cost;
    if(!saveData.gadgets) saveData.gadgets={};
    saveData.gadgets[item.value]=(saveData.gadgets[item.value]||0)+1;
    saveSave();buildShop();
    showNotif(item.name+' (+1 charge)!');playTone(660,.15,'sine',.18);
    return;
  }
  // Ultimate
  if(item.type==='ultimate'){
    const ownedUlt=item.id==='cyber_bullet'?saveData.hasCyberBullet:saveData.hasRajpnFist;
    if(ownedUlt){showNotif('Already owned!');return;}
    if(saveData.currency<item.cost){showNotif('Not enough credits!');playTone(180,.12,'sine',.14);return;}
    saveData.currency-=item.cost;
    if(item.id==='cyber_bullet') saveData.hasCyberBullet=true;
    else saveData.hasRajpnFist=true;
    saveSave();buildShop();
    showNotif(item.name+' UNLOCKED!');playTone(880,.2,'sine',.22);
    return;
  }
  const owned=saveData.unlocks.includes(item.id)||(item.type==='weapon'&&weaponInventory.has(item.value));
  if(owned){
    if(item.type!=='weapon'){equipItem(item);rebuildCharPreview();}
    buildShop();return;
  }
  if(saveData.currency>=item.cost){
    saveData.currency-=item.cost;
    saveData.unlocks.push(item.id);
    equipItem(item);
    saveSave();buildShop();rebuildCharPreview();
    showNotif('Unlocked: '+item.name+'!');
    playTone(660,.15,'sine',.18);
  } else {
    showNotif('Not enough credits!');
    playTone(180,.12,'sine',.14);
  }
}

function equipItem(item){
  const c=saveData.customization;
  if(item.type==='weapon'){ weaponInventory.add(item.value); return; }
  if(item.type==='outfit') c.outfitColor=item.value;
  if(item.type==='visor')  c.visorColor=item.value;
  if(item.type==='armor')  c.armorStyle=item.value;
  if(item.type==='bp')     c.backpack=item.value;
  saveSave();
}

// ═══════════════════════════════════════════════════════════════
//  CUSTOMIZATION UI
// ═══════════════════════════════════════════════════════════════
const OUTFIT_COLORS=[
  {hex:'#1A3A8A',label:'Navy'},{hex:'#1A1A2A',label:'Black'},{hex:'#4A4A4A',label:'Gray'},
  {hex:'#2D5A27',label:'Forest'},{hex:'#8B0000',label:'Red'},{hex:'#C47A2A',label:'Sand'},
  {hex:'#4A1A6A',label:'Purple'},{hex:'#D8DCE8',label:'White'},{hex:'#1A5A5A',label:'Teal'},
  {hex:'#5A6A5A',label:'Urban'},{hex:'#C4956A',label:'Desert Camo'},{hex:'#3A6A3A',label:'Jungle'},
];
const SKIN_TONES=[
  {hex:'#F5D5B0',label:'Fair'},{hex:'#E8C49A',label:'Light'},
  {hex:'#D4A574',label:'Medium'},{hex:'#C17A3A',label:'Tan'},
  {hex:'#8B5E3C',label:'Brown'},{hex:'#5C3A1E',label:'Dark'},
];
const VISOR_COLORS=[
  {hex:'#44CCFF',label:'Cyan'},{hex:'#FF3333',label:'Red'},
  {hex:'#FFD700',label:'Gold'},{hex:'#00FF44',label:'Green'},
  {hex:'#FF8800',label:'Orange'},{hex:'#FF44FF',label:'Pink'},
  {hex:'#EEEEEE',label:'White'},{hex:'#111111',label:'Tactical'},
];

function buildCustomizationUI(){
  // Outfit swatches
  const outfitEl=document.getElementById('outfitSwatches');
  outfitEl.innerHTML='';
  OUTFIT_COLORS.forEach(c=>{
    const s=document.createElement('div');
    s.className='swatch'+(saveData.customization.outfitColor===c.hex?' sel':'');
    s.style.background=c.hex;
    s.title=c.label;
    s.addEventListener('click',()=>{
      saveData.customization.outfitColor=c.hex;
      saveSave();
      outfitEl.querySelectorAll('.swatch').forEach(x=>x.classList.remove('sel'));
      s.classList.add('sel');
      rebuildCharPreview();
    });
    outfitEl.appendChild(s);
  });

  // Visor swatches
  const visorEl=document.getElementById('visorSwatches');
  visorEl.innerHTML='';
  VISOR_COLORS.forEach(c=>{
    const s=document.createElement('div');
    s.className='swatch'+(saveData.customization.visorColor===c.hex?' sel':'');
    s.style.background=c.hex;
    s.title=c.label;
    s.addEventListener('click',()=>{
      saveData.customization.visorColor=c.hex;
      saveSave();
      visorEl.querySelectorAll('.swatch').forEach(x=>x.classList.remove('sel'));
      s.classList.add('sel');
      rebuildCharPreview();
    });
    visorEl.appendChild(s);
  });

  // Skin tone swatches
  const skinEl=document.getElementById('skinSwatches');
  if(skinEl){
    skinEl.innerHTML='';
    SKIN_TONES.forEach(c=>{
      const s=document.createElement('div');
      s.className='swatch'+((saveData.customization.skinTone||'#E8C49A')===c.hex?' sel':'');
      s.style.background=c.hex;s.title=c.label;
      s.addEventListener('click',()=>{
        saveData.customization.skinTone=c.hex;saveSave();
        skinEl.querySelectorAll('.swatch').forEach(x=>x.classList.remove('sel'));
        s.classList.add('sel');rebuildCharPreview();
      });
      skinEl.appendChild(s);
    });
  }

  // Armor toggles — heavy/stealth require shop unlock
  const armorEl=document.getElementById('armorToggles');
  armorEl.querySelectorAll('.tog-btn').forEach(btn=>{
    const style=btn.dataset.armor;
    const locked=(style==='heavy'&&!saveData.unlocks.includes('armor_heavy'))
               ||(style==='stealth'&&!saveData.unlocks.includes('armor_stealth'));
    btn.classList.toggle('sel',style===saveData.customization.armorStyle);
    if(locked){
      btn.style.opacity='.35'; btn.style.cursor='not-allowed';
      btn.title='Purchase in Armory & Shop';
      btn.onclick=()=>showNotif('Buy '+btn.textContent.trim()+' in the Armory & Shop first!');
    } else {
      btn.style.opacity=''; btn.style.cursor='';
      btn.title='';
      btn.addEventListener('click',()=>{
        saveData.customization.armorStyle=style;
        saveSave();
        armorEl.querySelectorAll('.tog-btn').forEach(b=>b.classList.remove('sel'));
        btn.classList.add('sel');
        rebuildCharPreview();
      });
    }
  });

  // Helmet toggles
  const helmEl=document.getElementById('helmetToggles');
  helmEl.querySelectorAll('.tog-btn').forEach(btn=>{
    const isHelmet=btn.dataset.helmet==='yes';
    btn.classList.toggle('sel',isHelmet===saveData.customization.helmet);
    btn.addEventListener('click',()=>{
      saveData.customization.helmet=(btn.dataset.helmet==='yes');
      saveSave();
      helmEl.querySelectorAll('.tog-btn').forEach(b=>b.classList.remove('sel'));
      btn.classList.add('sel');
      rebuildCharPreview();
    });
  });

  // Backpack toggles
  const bpEl=document.getElementById('bpToggles');
  bpEl.querySelectorAll('.tog-btn').forEach(btn=>{
    btn.classList.toggle('sel',btn.dataset.bp===saveData.customization.backpack);
    btn.addEventListener('click',()=>{
      saveData.customization.backpack=btn.dataset.bp;
      saveSave();
      bpEl.querySelectorAll('.tog-btn').forEach(b=>b.classList.remove('sel'));
      btn.classList.add('sel');
      rebuildCharPreview();
    });
  });

  document.getElementById('creditsDisplay').textContent='💰 Credits: '+saveData.currency;
}

// ═══════════════════════════════════════════════════════════════
//  SAVE UI
// ═══════════════════════════════════════════════════════════════
function updateSaveUI(){
  const badge=document.getElementById('saveBadge');
  const menu=document.getElementById('mainMenu');
  if(saveData.totalScore>0){
    badge.textContent=`Best Wave: ${saveData.waveRecord} | Score: ${saveData.totalScore} | Credits: ${saveData.currency}`;
    menu.classList.add('has-save');
  } else {
    badge.textContent='No save found';
    menu.classList.remove('has-save');
  }
  const ub=document.getElementById('menuUserBadge');
  if(ub&&mpUser?.username) ub.textContent=mpUser.username;
  // Battle pass badge
  const bpBadge=document.getElementById('bpBadge');
  const bpLbl=document.getElementById('bpLevelLabel');
  const bpBar=document.getElementById('bpXpBar');
  if(bpBadge){
    const lv=saveData.bpLevel||0;
    const xp=saveData.bpXP||0;
    const xpInLevel=xp%500, xpPct=Math.round(xpInLevel/500*100);
    bpBadge.style.display='block';
    if(bpLbl) bpLbl.textContent='LV '+lv+' ('+xp+' XP)';
    if(bpBar) bpBar.style.width=xpPct+'%';
  }
}


// ═══════════════════════════════════════════════════════════════
//  WORLD MAP CANVAS
// ═══════════════════════════════════════════════════════════════
const MAP_POIS = {
  sweden:{ lon:18.07, lat:59.33, label:'SWEDEN', sub:'Europe'      },
  beirut:{ lon:35.50, lat:33.89, label:'BEIRUT', sub:'Middle East' },
  dubai: { lon:55.30, lat:25.20, label:'DUBAI',  sub:'Gulf'        },
};
const MAP_POI_INFO = {
  sweden:{ env:'Arctic / Snow', diff:'Medium', threat:'HIGH'   },
  beirut:{ env:'Urban / Coastal', diff:'Hard', threat:'SEVERE' },
  dubai: { env:'Desert / Arid',   diff:'Hard', threat:'SEVERE' },
};
let _mapWorldData = null;
let _mapAnimId    = null;
let mapHovered    = null;
let mapSelected   = null;

function _lonToX(lon,w){ return (lon+180)/360*w; }
function _latToY(lat,h){ return (90-lat)/180*h;  }

async function _ensureMapData(){
  if(_mapWorldData) return;
  try{
    const r=await fetch('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json');
    const topo=await r.json();
    _mapWorldData=topojson.feature(topo,topo.objects.countries);
  }catch(e){ console.warn('World atlas load failed:',e); }
}

function _traceRings(ctx,rings,w,h){
  for(const ring of rings){
    let first=true;
    for(const [lon,lat] of ring){
      const x=_lonToX(lon,w), y=_latToY(lat,h);
      first?ctx.moveTo(x,y):ctx.lineTo(x,y);
      first=false;
    }
    ctx.closePath();
  }
}

function _drawFrame(ts){
  const canvas=document.getElementById('mapCanvas');
  if(!canvas) return;
  const ctx=canvas.getContext('2d');
  const w=canvas.width, h=canvas.height;

  // Ocean
  const grad=ctx.createLinearGradient(0,0,0,h);
  grad.addColorStop(0,'#182030');
  grad.addColorStop(1,'#1A2838');
  ctx.fillStyle=grad;
  ctx.fillRect(0,0,w,h);

  // Subtle lat/lon grid
  ctx.save();
  ctx.strokeStyle='rgba(255,255,255,0.035)';
  ctx.lineWidth=0.5;
  for(let lon=-150;lon<=150;lon+=30){
    const x=_lonToX(lon,w);
    ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,h);ctx.stroke();
  }
  for(let lat=-60;lat<=60;lat+=30){
    const y=_latToY(lat,h);
    ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(w,y);ctx.stroke();
  }
  // Equator slightly stronger
  ctx.strokeStyle='rgba(255,255,255,0.07)';
  const eq=_latToY(0,h);
  ctx.beginPath();ctx.moveTo(0,eq);ctx.lineTo(w,eq);ctx.stroke();
  ctx.restore();

  // Countries
  if(_mapWorldData){
    for(const feat of _mapWorldData.features){
      if(!feat.geometry) continue;
      ctx.beginPath();
      const g=feat.geometry;
      if(g.type==='Polygon') _traceRings(ctx,g.coordinates,w,h);
      else if(g.type==='MultiPolygon') for(const p of g.coordinates) _traceRings(ctx,p,w,h);
      ctx.fillStyle='#263C24';
      ctx.strokeStyle='#354E33';
      ctx.lineWidth=0.5;
      ctx.fill();
      ctx.stroke();
    }
  } else {
    // Loading placeholder
    ctx.fillStyle='rgba(255,255,255,0.08)';
    ctx.font='13px Rajdhani,sans-serif';
    ctx.textAlign='center';
    ctx.fillText('Loading map data…',w/2,h/2);
    ctx.textAlign='left';
  }

  // POI markers — sizes relative to canvas height for consistent scale
  const ps=h/54; // scale unit: ~20 on 1080p
  for(const [id,poi] of Object.entries(MAP_POIS)){
    const x=_lonToX(poi.lon,w);
    const y=_latToY(poi.lat,h);
    const active=mapHovered===id||mapSelected===id;
    const phase=ts*0.0014+(id==='sweden'?0:id==='beirut'?2.1:4.2);
    const pulse=(Math.sin(phase)+1)/2;

    // Outer pulse ring
    ctx.beginPath();
    ctx.arc(x,y,ps*(1+pulse*0.8),0,Math.PI*2);
    ctx.strokeStyle=active?`rgba(231,76,60,${0.5+pulse*0.4})`:`rgba(192,57,43,${0.18+pulse*0.22})`;
    ctx.lineWidth=1.5;
    ctx.stroke();

    // Inner ring (selected only)
    if(mapSelected===id){
      ctx.beginPath();
      ctx.arc(x,y,ps*0.65,0,Math.PI*2);
      ctx.strokeStyle='rgba(231,76,60,0.6)';
      ctx.lineWidth=1.5;
      ctx.stroke();
    }

    // Dot
    const dotR=active?ps*0.5:ps*0.38;
    ctx.beginPath();
    ctx.arc(x,y,dotR,0,Math.PI*2);
    ctx.fillStyle=active?'#E74C3C':'#4A8B5E';
    ctx.fill();
    if(active){
      ctx.strokeStyle='rgba(255,255,255,0.45)';
      ctx.lineWidth=1.2;
      ctx.stroke();
    }

    // Label
    const lx=x+ps*0.9, ly=y+ps*0.22;
    const nameSz=Math.round(ps*0.9);
    const subSz =Math.round(ps*0.72);
    ctx.font=`700 ${nameSz}px 'Rajdhani',sans-serif`;
    ctx.fillStyle=active?'#E8EAE6':'rgba(232,234,230,0.75)';
    ctx.fillText(poi.label,lx,ly);
    ctx.font=`${subSz}px 'Rajdhani',sans-serif`;
    ctx.fillStyle=active?'#8ABBA0':'rgba(138,145,153,0.6)';
    ctx.fillText(poi.sub,lx,ly+nameSz*1.15);
  }
}

function _mapLoop(ts){
  _drawFrame(ts);
  _mapAnimId=requestAnimationFrame(_mapLoop);
}

function _resizeMapCanvas(){
  const canvas=document.getElementById('mapCanvas');
  if(!canvas) return;
  canvas.width=window.innerWidth;
  canvas.height=window.innerHeight;
}

function startMapAnimation(){
  if(_mapAnimId) return;
  _resizeMapCanvas();
  _ensureMapData().then(()=>{ /* countries will paint on next frame */ });
  _drawFrame(0);
  _mapAnimId=requestAnimationFrame(_mapLoop);
}

function stopMapAnimation(){
  if(_mapAnimId){ cancelAnimationFrame(_mapAnimId); _mapAnimId=null; }
}

function setupMapCanvas(){
  const canvas=document.getElementById('mapCanvas');
  if(!canvas) return;

  window.addEventListener('resize',()=>{
    if(currentScreen==='locationSelect') _resizeMapCanvas();
  });

  canvas.addEventListener('mousemove',e=>{
    const r=canvas.getBoundingClientRect();
    const sx=canvas.width/r.width, sy=canvas.height/r.height;
    const mx=(e.clientX-r.left)*sx, my=(e.clientY-r.top)*sy;
    const hitR=canvas.height/27; // scales with canvas size
    let hit=null;
    for(const [id,poi] of Object.entries(MAP_POIS)){
      if(Math.hypot(mx-_lonToX(poi.lon,canvas.width), my-_latToY(poi.lat,canvas.height))<hitR){ hit=id; break; }
    }
    mapHovered=hit;
    canvas.style.cursor=hit?'pointer':'default';
  });

  canvas.addEventListener('mouseleave',()=>{ mapHovered=null; });

  canvas.addEventListener('click',()=>{
    if(!mapHovered) return;
    const id=mapHovered;
    mapSelected=id;
    selectedLoc=id;
    const d=MAP_POI_INFO[id];
    document.getElementById('mapLocName').textContent=MAP_POIS[id].label;
    document.getElementById('mapLocDesc').textContent=
      id==='sweden'?'Sweden — Nordic Snow':id==='beirut'?'Beirut — Mediterranean':'Dubai — Desert Gulf';
    document.getElementById('mapEnv').textContent=d.env;
    document.getElementById('mapDiff').textContent=d.diff;
    document.getElementById('mapThreat').textContent=d.threat;
    document.getElementById('mapLocDetails').style.display='block';
  });
}

