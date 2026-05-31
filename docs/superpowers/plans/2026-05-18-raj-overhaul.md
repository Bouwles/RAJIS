# Richard Abou Jamra Intercept Simulation — Full Overhaul Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix 2 bugs, overhaul shop UI, add unique weapon meshes, missile HP scaling, better Richard model, fun gameplay improvements, and working P2P multiplayer via PeerJS — all in `index.html`.

**Architecture:** Single-file browser game (3939 lines). All edits go to `index.html`. PeerJS CDN handles WebRTC P2P signaling with no backend. Multiplayer host broadcasts game state; clients send input back.

**Tech Stack:** Three.js 0.128, PeerJS 1.5.4 (CDN), Web Audio API, localStorage for saves/username.

---

### Task 1: Fix cyber bullet screen freeze

**Files:**
- Modify: `index.html:2194`

- [ ] Replace undefined `spawnParticle` call with `spawnExplosion`

```js
// Line 2194 — OLD:
for(let i=0;i<40;i++) spawnParticle(cb.pos,0xFF6600,0.6+Math.random()*.4,8+Math.random()*6);
// NEW:
spawnExplosion(cb.pos, 3, 0xFF6600);
```

- [ ] Verify: fire cyber bullet (F key), wait for it to hit — game must not freeze

---

### Task 2: Fix hookshot launch bug

**Files:**
- Modify: `index.html:2119` (`releaseHook` function)

- [ ] Cap `vy` on release so player can't rocket upward

```js
// OLD:
function releaseHook(){
  if(hookMesh){ scene.remove(hookMesh); hookMesh=null; }
  if(hookLine){ scene.remove(hookLine); hookLine=null; }
  hookActive=false; hookPulling=false; hookPos=null; hookVel=null; hookTarget=null;
}
// NEW:
function releaseHook(){
  if(hookPulling) vy = Math.min(vy, 8); // cap upward launch
  if(hookMesh){ scene.remove(hookMesh); hookMesh=null; }
  if(hookLine){ scene.remove(hookLine); hookLine=null; }
  hookActive=false; hookPulling=false; hookPos=null; hookVel=null; hookTarget=null;
}
```

---

### Task 3: Shop/Armory tabbed UI

**Files:**
- Modify: `index.html` — CSS section, shop HTML, `buildShop()` JS

- [ ] Add CSS for shop tabs (after existing `.shop-item` styles ~line 220)

```css
/* ── SHOP TABS ── */
.shop-tab-row{display:flex;gap:6px;margin-bottom:18px;flex-wrap:wrap;justify-content:center;}
.shop-tab-btn{padding:7px 16px;font-size:.75em;font-weight:700;letter-spacing:.09em;text-transform:uppercase;
  cursor:pointer;background:transparent;border:1px solid var(--border);border-radius:3px;
  color:var(--text2);font-family:'Rajdhani',sans-serif;transition:all .12s;}
.shop-tab-btn:hover{border-color:var(--text2);color:var(--text);}
.shop-tab-btn.active{background:var(--red);color:#fff;border-color:var(--red);}
.shop-item-desc{font-size:.66em;color:var(--text2);margin:2px 0 4px;line-height:1.4;letter-spacing:.03em;font-family:'Rajdhani',sans-serif;}
```

- [ ] Update shopScreen HTML to include tab bar (replace existing shop div contents ~line 597)

```html
<div id="shopScreen" class="screen">
  <div style="text-align:center;width:100%;padding:20px 16px;">
    <div class="screen-title">Armory &amp; Shop</div>
    <div class="credits-badge" id="shopCreds" style="margin:8px 0 14px;">💰 Credits: 0</div>
    <div class="shop-tab-row">
      <button class="shop-tab-btn active" data-tab="weapons" onclick="setShopTab('weapons')">⚔️ Weapons</button>
      <button class="shop-tab-btn" data-tab="upgrades" onclick="setShopTab('upgrades')">⚡ Upgrades</button>
      <button class="shop-tab-btn" data-tab="gadgets" onclick="setShopTab('gadgets')">🎒 Gadgets</button>
      <button class="shop-tab-btn" data-tab="ultimate" onclick="setShopTab('ultimate')">🚗 Ultimate</button>
      <button class="shop-tab-btn" data-tab="cosmetics" onclick="setShopTab('cosmetics')">🎨 Cosmetics</button>
    </div>
    <div class="shop-grid" id="shopGrid"></div>
    <button class="back-btn" id="btnShopBack" style="margin-top:20px;">← Back</button>
  </div>
</div>
```

- [ ] Add tab variable and `setShopTab()` + update `buildShop()` in JS

```js
let activeShopTab = 'weapons';
function setShopTab(tab){
  activeShopTab = tab;
  document.querySelectorAll('.shop-tab-btn').forEach(b=>b.classList.toggle('active', b.dataset.tab===tab));
  buildShop();
}
```

- [ ] Update `buildShop()` to filter by tab and add descriptions

```js
const SHOP_DESCS = {
  shotgun:'Double-barrel + grappling hook. RMB to fire hook.',
  sniper:'High zoom, extreme range. RMB for scope.',
  smg:'Full-auto, 30-round drum. Fast TTK on soldiers.',
  flashbang:'Stuns all soldiers in 18m radius for 3.5s.',
  airstrike:'Destroys all missiles in 12m radius after 3s delay.',
  cover:'Deploys a barrier 4m ahead for 20s.',
  cyber_bullet:'Guided car missile locks onto nearest threat.',
  armor_plate:'Reduces building damage received. Stack x3.',
  speed_chip:'Increases move + sprint speed by 15%. Stack x3.',
  hot_rounds:'Increases projectile damage by 30%. Stack x3.',
  outfit_red:'Red Strike — crimson ops colorway.',
  outfit_green:'Forest Ops — woodland camo.',
  outfit_orange:'Desert Sand — arid terrain blend.',
  outfit_purple:'Shadow Unit — covert operations.',
  outfit_white:'Arctic Ops — snow environment.',
  outfit_urban:'Urban Camo — city combat.',
  outfit_desert:'Desert Camo — sand dunes.',
  outfit_jungle:'Jungle Camo — rainforest ops.',
  visor_red:'Red Visor',visor_gold:'Gold Visor',visor_green:'Night Vision',
  visor_orange:'Sunset Visor',visor_cyan:'Cyan Visor',visor_white:'White Visor',visor_black:'Tactical',
  armor_heavy:'Heavy Armor — wider, more protected silhouette.',
  armor_stealth:'Stealth Suit — slim profile with glowing lines.',
  bp_standard:'Standard backpack.',
  bp_tactical:'Tactical frame pack.',
};
const SHOP_TAB_MAP = {
  weapons:  ['shotgun','sniper','smg'],
  upgrades: ['armor_plate_1','speed_chip_1','hot_rounds_1'],
  gadgets:  ['flashbang','airstrike','cover'],
  ultimate: ['cyber_bullet'],
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
      costLabel=saveData.hasCyberBullet?'OWNED':'💰 '+item.cost;
    } else if(owned){
      costLabel=item.type==='weapon'?'UNLOCKED':'Equipped';
    }
    const isOwned=owned||(item.type==='ultimate'&&saveData.hasCyberBullet)||
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
```

---

### Task 4: Unique sniper + SMG weapon meshes

**Files:**
- Modify: `index.html` — add `makeSniperMesh()`, `makeSmgMesh()`, update `makeWeaponMesh()`

- [ ] Add `makeSniperMesh()` after `makeShotgunMesh()` (~line 1460)

```js
function makeSniperMesh(){
  const g=new THREE.Group();
  const metalM=new THREE.MeshLambertMaterial({color:0x1A1A1A});
  const darkM =new THREE.MeshLambertMaterial({color:0x0A0A0A});
  const woodM =new THREE.MeshLambertMaterial({color:0x2A1A0A});
  const glassM=new THREE.MeshLambertMaterial({color:0x112233,emissive:new THREE.Color(0x001122),emissiveIntensity:.4});
  // Long barrel
  const barrel=new THREE.Mesh(new THREE.CylinderGeometry(.018,.018,.82,8),metalM);
  barrel.rotation.x=Math.PI/2;barrel.position.z=-.28;g.add(barrel);
  // Suppressor
  const supp=new THREE.Mesh(new THREE.CylinderGeometry(.028,.028,.12,8),darkM);
  supp.rotation.x=Math.PI/2;supp.position.z=-.74;g.add(supp);
  // Receiver
  const recv=new THREE.Mesh(new THREE.BoxGeometry(.078,.088,.34),metalM);
  recv.position.set(0,-.004,.06);g.add(recv);
  // Stock + cheek rest
  const stock=new THREE.Mesh(new THREE.BoxGeometry(.06,.072,.3),woodM);
  stock.position.set(0,-.01,.32);g.add(stock);
  const cheek=new THREE.Mesh(new THREE.BoxGeometry(.06,.04,.12),woodM);
  cheek.position.set(0,.042,.28);g.add(cheek);
  // Big scope tube
  const scopeTube=new THREE.Mesh(new THREE.CylinderGeometry(.032,.032,.3,10),darkM);
  scopeTube.rotation.x=Math.PI/2;scopeTube.position.set(0,.088,-.04);g.add(scopeTube);
  // Scope lenses
  const lensF=new THREE.Mesh(new THREE.CircleGeometry(.028,10),glassM);
  lensF.position.set(0,.088,-.2);g.add(lensF);
  const lensB=new THREE.Mesh(new THREE.CircleGeometry(.022,10),glassM);
  lensB.position.set(0,.088,.12);lensB.rotation.y=Math.PI;g.add(lensB);
  // Bipod legs
  [-1,1].forEach(s=>{
    const leg=new THREE.Mesh(new THREE.BoxGeometry(.008,.18,.008),metalM);
    leg.position.set(s*.04,-.13,-.3);leg.rotation.z=s*.28;g.add(leg);
  });
  // Grip
  const grip=new THREE.Mesh(new THREE.BoxGeometry(.052,.12,.064),woodM);
  grip.rotation.x=.2;grip.position.set(0,-.1,0);g.add(grip);
  g.position.set(.24,-.21,-.44);return g;
}
function makeSmgMesh(){
  const g=new THREE.Group();
  const metalM=new THREE.MeshLambertMaterial({color:0x1C1C1C});
  const darkM =new THREE.MeshLambertMaterial({color:0x0E0E0E});
  const polyM =new THREE.MeshLambertMaterial({color:0x2A2A2A});
  // Short barrel
  const barrel=new THREE.Mesh(new THREE.CylinderGeometry(.022,.022,.28,8),metalM);
  barrel.rotation.x=Math.PI/2;barrel.position.z=-.1;g.add(barrel);
  // Muzzle device
  const muzzle=new THREE.Mesh(new THREE.CylinderGeometry(.03,.022,.06,6),darkM);
  muzzle.rotation.x=Math.PI/2;muzzle.position.z=-.27;g.add(muzzle);
  // Receiver
  const recv=new THREE.Mesh(new THREE.BoxGeometry(.09,.1,.38),metalM);
  recv.position.set(0,0,.04);g.add(recv);
  // Drum magazine
  const drum=new THREE.Mesh(new THREE.CylinderGeometry(.08,.08,.12,12),polyM);
  drum.rotation.x=Math.PI/2;drum.position.set(0,-.09,.08);g.add(drum);
  // Foregrip
  const fg=new THREE.Mesh(new THREE.BoxGeometry(.048,.14,.052),polyM);
  fg.rotation.x=.15;fg.position.set(0,-.1,-.12);g.add(fg);
  // Folded stock (short)
  const stock=new THREE.Mesh(new THREE.BoxGeometry(.06,.048,.18),metalM);
  stock.position.set(0,.018,.28);g.add(stock);
  // Charging handle
  const ch=new THREE.Mesh(new THREE.BoxGeometry(.012,.04,.04),darkM);
  ch.position.set(.05,.038,.06);g.add(ch);
  // Grip
  const grip=new THREE.Mesh(new THREE.BoxGeometry(.054,.12,.06),polyM);
  grip.rotation.x=.18;grip.position.set(0,-.1,.1);g.add(grip);
  g.position.set(.22,-.19,-.42);return g;
}
```

- [ ] Update `makeWeaponMesh()` to use new functions

```js
function makeWeaponMesh(){
  if(currentWeapon==='pistol')  return makePistolMesh();
  if(currentWeapon==='shotgun') return makeShotgunMesh();
  if(currentWeapon==='sniper')  return makeSniperMesh();
  if(currentWeapon==='smg')     return makeSmgMesh();
  return makeLauncherMesh();
}
```

---

### Task 5: Missile HP scaling + health bars

**Files:**
- Modify: `index.html` — CSS, `spawnMissile()`, `updateMissiles()`, `destroyMissile()`

- [ ] Add missile health bar CSS (after `.eb-fill.sniper` ~line 315)

```css
.mb-wrap{position:absolute;transform:translateX(-50%);display:flex;flex-direction:column;align-items:center;gap:1px;pointer-events:none;}
.mb-bg{width:36px;height:3px;background:rgba(192,57,43,.18);border-radius:1px;overflow:hidden;}
.mb-fill{height:100%;background:#FF4400;border-radius:1px;transition:width .1s;}
.mb-fill.boss{background:#FF8800;}
```

- [ ] Update health formula in `spawnMissile()` (~line 1489)

```js
// OLD:
const health=isBoss?3:1;
// NEW:
const health=isBoss ? 3+Math.floor(waveNum/2) : Math.max(1,Math.floor((waveNum-1)/3)+1);
```

- [ ] Add DOM health bar creation in `spawnMissile()` (after `scene.add(group)` ~line 1541)

```js
// After scene.add(group):
let barEl=null, fillEl=null;
if(health>1){
  barEl=document.createElement('div');
  barEl.className='mb-wrap';
  barEl.innerHTML=`<div class="mb-bg"><div class="mb-fill${isBoss?' boss':''}" style="width:100%"></div></div>`;
  document.getElementById('healthBars').appendChild(barEl);
  fillEl=barEl.querySelector('.mb-fill');
}
missiles.push({group,bodyMesh,pos:group.position,vel,radius,
  health,maxHealth:health,isBoss,
  trailPts,trailLine,isDestroyed:false,barEl,fillEl});
```

- [ ] Update missile health bar in `updateMissiles()` (after `m.group.position.copy(m.pos)` ~line 2449)

```js
// After m.group.position.copy(m.pos):
if(m.barEl && m.fillEl){
  const v3=m.pos.clone();
  const proj=v3.project(camera);
  const sx=(proj.x*.5+.5)*window.innerWidth;
  const sy=(-.5*proj.y+.5)*window.innerHeight;
  if(proj.z<1&&sx>0&&sx<window.innerWidth&&sy>0&&sy<window.innerHeight){
    m.barEl.style.display='flex';
    m.barEl.style.left=sx+'px';
    m.barEl.style.top=(sy-18)+'px';
    m.fillEl.style.width=(m.health/m.maxHealth*100)+'%';
  } else {
    m.barEl.style.display='none';
  }
}
```

- [ ] Remove bar element in `destroyMissile()` (after `missile.isDestroyed=true` ~line 1551)

```js
if(missile.barEl) missile.barEl.remove();
```

---

### Task 6: Improved Richard character model + skin tone option

**Files:**
- Modify: `index.html` — `makeCharModel()`, customization HTML, `OUTFIT_COLORS`/`buildCustomizationUI()`, `defaultSave()`

- [ ] Add skin tone to `defaultSave()` customization object

```js
customization:{
  outfitColor:'#1A3A8A', armorStyle:'light',
  helmet:true, visorColor:'#44CCFF', backpack:'missile',
  skinTone:'#E8C49A'  // add this
}
```

- [ ] Rewrite `makeCharModel()` with improved proportions, boots, belt, knees, face detail

```js
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

  // Boots (lower leg, dark)
  [-1,1].forEach(s=>{
    const boot=new THREE.Mesh(new THREE.BoxGeometry(.18,.24,.22),bootM);
    boot.position.set(s*.12,.12,0);g.add(boot);
  });
  // Upper legs
  const legM=new THREE.MeshLambertMaterial({color:armorC});
  [-1,1].forEach(s=>{
    const leg=new THREE.Mesh(new THREE.BoxGeometry(.17,.42,.19),legM);
    leg.position.set(s*.12,.58,0);g.add(leg);
    // Knee pad
    const kp=new THREE.Mesh(new THREE.BoxGeometry(.19,.09,.08),darkM);
    kp.position.set(s*.12,.48,.1);g.add(kp);
  });
  // Belt
  const belt=new THREE.Mesh(new THREE.BoxGeometry(tW+.04,.06,.28),beltM);
  belt.position.y=.84;g.add(belt);

  // Torso
  const torso=new THREE.Mesh(new THREE.BoxGeometry(tW,tH,.28),armorM);
  torso.position.y=tH/2+.88;g.add(torso);
  const torsoY=tH/2+.88;

  // Shoulder pads (heavy)
  if(c.armorStyle==='heavy'){
    [-1,1].forEach(s=>{
      const pad=new THREE.Mesh(new THREE.BoxGeometry(.15,.12,.3),armorM);
      pad.position.set(s*(tW/2+.08),torsoY+.12,0);g.add(pad);
    });
  }

  // Arms
  const armM=new THREE.MeshLambertMaterial({color:armorC});
  [-1,1].forEach(s=>{
    const arm=new THREE.Mesh(new THREE.BoxGeometry(.15,.52,.16),armM);
    arm.position.set(s*(tW/2+.1),torsoY-.02,0);g.add(arm);
    // Elbow pad
    const ep=new THREE.Mesh(new THREE.BoxGeometry(.17,.08,.07),darkM);
    ep.position.set(s*(tW/2+.1),torsoY-.2,.06);g.add(ep);
  });

  // Mini weapon in right hand
  const wGrp=new THREE.Group();
  const barrel=new THREE.Mesh(new THREE.BoxGeometry(.05,.05,.4),darkM);
  barrel.position.z=-.2;wGrp.add(barrel);
  const wBody=new THREE.Mesh(new THREE.BoxGeometry(.1,.1,.2),darkM);
  wGrp.add(wBody);
  wGrp.position.set(tW/2+.12,torsoY-.1,-.18);wGrp.rotation.x=.2;g.add(wGrp);

  // Head (slightly bigger)
  const headY=torsoY+tH/2+.16;
  const head=new THREE.Mesh(new THREE.BoxGeometry(.27,.3,.27),skinM);
  head.position.y=headY;g.add(head);

  if(c.helmet){
    const helm=new THREE.Mesh(new THREE.BoxGeometry(.32,.24,.32),armorM);
    helm.position.y=headY+.04;g.add(helm);
    const visor=new THREE.Mesh(new THREE.BoxGeometry(.26,.1,.06),visorM);
    visor.position.set(0,headY-.01,.17);g.add(visor);
    // Helmet strap
    const strap=new THREE.Mesh(new THREE.BoxGeometry(.28,.04,.04),darkM);
    strap.position.set(0,headY-.1,.14);g.add(strap);
  } else {
    // Face detail: eyes
    const eyeM=new THREE.MeshLambertMaterial({color:0x112233});
    [-1,1].forEach(s=>{
      const eye=new THREE.Mesh(new THREE.BoxGeometry(.04,.04,.02),eyeM);
      eye.position.set(s*.07,headY+.04,.135);g.add(eye);
    });
    // Stubble / beard hint
    const beardM=new THREE.MeshLambertMaterial({color:0x4A3010});
    const beard=new THREE.Mesh(new THREE.BoxGeometry(.22,.07,.04),beardM);
    beard.position.set(0,headY-.08,.135);g.add(beard);
    // Hair
    const hairM=new THREE.MeshLambertMaterial({color:0x2A1A08});
    const hair=new THREE.Mesh(new THREE.BoxGeometry(.27,.1,.27),hairM);
    hair.position.set(0,headY+.14,0);g.add(hair);
  }

  // Backpack
  if(c.backpack!=='none'){
    const bpH=c.backpack==='missile'?.48:.32;
    const bp=new THREE.Mesh(new THREE.BoxGeometry(.22,bpH,.14),darkM);
    bp.position.set(0,torsoY+.08,.22);g.add(bp);
    if(c.backpack==='missile'){
      for(let i=-1;i<=1;i++){
        const m=new THREE.Mesh(new THREE.CylinderGeometry(.028,.028,.18,6),
          new THREE.MeshLambertMaterial({color:0x888888}));
        m.position.set(i*.07,torsoY+.26,.22);g.add(m);
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
```

- [ ] Add skin tone swatches to customization HTML (after visor swatches section ~line 461)

```html
<div class="custom-sec">
  <label>Skin Tone</label>
  <div class="swatch-row" id="skinSwatches"></div>
</div>
```

- [ ] Add skin tone builder in `buildCustomizationUI()` (after visor section)

```js
const SKIN_TONES=[
  {hex:'#F5D5B0',label:'Fair'},{hex:'#E8C49A',label:'Light'},
  {hex:'#D4A574',label:'Medium'},{hex:'#C17A3A',label:'Tan'},
  {hex:'#8B5E3C',label:'Brown'},{hex:'#5C3A1E',label:'Dark'},
];
const skinEl=document.getElementById('skinSwatches');
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
```

---

### Task 7: Fun gameplay improvements

**Files:**
- Modify: `index.html` — game state vars, `destroyMissile()`, `checkSoldierHits()`, `updateMissiles()`, `endWave()`, `startWave()`, `gameLoop()`

- [ ] Add kill streak + wave multiplier state variables (after `let score=0` ~line 893)

```js
let killStreak=0, killStreakTimer=0;
let waveScoringMult=1;
```

- [ ] Update kill streak in `destroyMissile()` (after `waveIntercepted++` ~line 1559)

```js
// after waveIntercepted++:
killStreak++;killStreakTimer=0;
if(killStreak===3){showNotif('TRIPLE KILL! +100');score+=100;waveScore+=100;showScorePop(100,pos);}
else if(killStreak===5){showNotif('RAMPAGE! +250');score+=250;waveScore+=250;showScorePop(250,pos);}
else if(killStreak===10){showNotif('MASSACRE!! +500');score+=500;waveScore+=500;showScorePop(500,pos);}
else if(killStreak>10&&killStreak%5===0){showNotif('UNSTOPPABLE! +500');score+=500;waveScore+=500;showScorePop(500,pos);}
```

- [ ] Update kill streak in `checkSoldierHits()` (after `score+=pts` ~line 2683)

```js
killStreak++;killStreakTimer=0;
if(killStreak===3){showNotif('TRIPLE KILL! +100');score+=100;waveScore+=100;}
else if(killStreak===5){showNotif('RAMPAGE! +250');score+=250;waveScore+=250;}
else if(killStreak===10){showNotif('MASSACRE!! +500');score+=500;waveScore+=500;}
```

- [ ] Add streak timer decay in `gameLoop()` (inside `gameActive&&!gamePaused` block, after `updateWave`)

```js
if(killStreak>0){ killStreakTimer+=dt; if(killStreakTimer>3){ killStreak=0; } }
```

- [ ] Add near-miss detection in `updateMissiles()` (inside loop, after ground collision check)

```js
// Near-miss check (only if missile still alive)
if(!m.isDestroyed && !m._nearMissed){
  const ndx=m.pos.x-px,ndy=m.pos.y-py,ndz=m.pos.z-pz;
  const nd=Math.sqrt(ndx*ndx+ndy*ndy+ndz*ndz);
  if(nd<8){
    m._nearMissed=true;
    showNotif('CLOSE CALL!');
    const fl=document.getElementById('damageFlash');
    if(fl){fl.style.background='rgba(255,200,0,.18)';fl.classList.add('flash');
      setTimeout(()=>{fl.style.background='';fl.classList.remove('flash');},150);}
  }
}
```

- [ ] Update `startWave()` to set bonus round multiplier

```js
// At start of startWave():
waveScoringMult = (waveNum % 5 === 0) ? 2 : 1;
if(waveNum % 5 === 0) setTimeout(()=>showNotif('⭐ BONUS ROUND — 2× SCORE! ⭐'),500);
```

- [ ] Apply `waveScoringMult` to score awards in `destroyMissile()` (the intercepted branch)

```js
const pts=(missile.isBoss?500:100)*waveScoringMult;
```

- [ ] Add clean-wave bonus in `endWave()` (after `accuracy` calculation)

```js
const cleanBonus = waveBldDestroyed===0 ? 0.3 : 0;
const earned=Math.round((waveIntercepted*80+Math.max(0,(waveMissileTotal-waveMissed)*50))*(1+cleanBonus));
if(cleanBonus>0) document.getElementById('wcEarned').setAttribute('data-bonus','PERFECT DEFENSE +30%');
```

---

### Task 8: PeerJS P2P Multiplayer

**Files:**
- Modify: `index.html` — add PeerJS CDN script, rewrite auth HTML, rewrite all MP JS functions

- [ ] Add PeerJS CDN script tag (after topojson script ~line 633)

```html
<script src="https://unpkg.com/peerjs@1.5.4/dist/peerjs.min.js"></script>
```

- [ ] Rewrite auth screen HTML to simple username form

```html
<div id="authScreen" class="screen">
  <div class="mp-card">
    <div class="mp-title">Multiplayer</div>
    <div class="mp-sub">Choose your callsign</div>
    <input class="mp-input" id="authUser" placeholder="Username (3-16 chars)" autocomplete="username"/>
    <div class="mp-err" id="authErr"></div>
    <button class="menu-btn btn-primary" style="width:100%;margin:0 0 8px;" onclick="mpSetUsername()">Continue →</button>
    <button class="menu-btn btn-secondary" style="width:100%;margin:0;" onclick="showScreen('mainMenu')">← Back</button>
  </div>
</div>
```

- [ ] Remove all WebSocket MP code and replace with PeerJS version

Replace the entire `// MULTIPLAYER CLIENT` section (lines 3678–3935) with:

```js
// ═══════════════════════════════════════════════════════════════
//  MULTIPLAYER CLIENT (PeerJS P2P)
// ═══════════════════════════════════════════════════════════════
let mpPeer = null;
let mpHostConn = null;       // joiner: single DataConnection to host
let mpConnections = [];      // host: DataConnections from joiners
let mpUser = null;
let mpRoom = null;
let mpIsHost = false;
let mpPlayers = [];
let mpRemotePlayers = new Map();
let mpStateTimer = 0;
const MP_TICK = 0.05;

function createRemotePlayerMesh(username){
  const g=new THREE.Group();
  const bodyM=new THREE.MeshLambertMaterial({color:0x336699});
  const body=new THREE.Mesh(new THREE.CapsuleGeometry(.4,1.1,4,8),bodyM);
  body.position.y=1.5;g.add(body);
  const headM=new THREE.MeshLambertMaterial({color:0x225588});
  const head=new THREE.Mesh(new THREE.SphereGeometry(.28,8,6),headM);
  head.position.y=2.5;g.add(head);
  scene.add(g);
  // Name label
  const label=document.createElement('div');
  label.className='mp-namelabel';
  label.textContent=username;
  label.style.cssText='position:fixed;pointer-events:none;z-index:28;font-family:Rajdhani,sans-serif;'+
    'font-size:.72em;letter-spacing:.08em;text-transform:uppercase;color:#6BAEE0;text-align:center;'+
    'background:rgba(0,0,0,.55);padding:1px 6px;border-radius:2px;display:none;';
  document.body.appendChild(label);
  return{mesh:g,pos:new THREE.Vector3(),yaw:0,username,label};
}
function removeRemotePlayer(uid){
  const rp=mpRemotePlayers.get(uid);
  if(rp){scene.remove(rp.mesh);if(rp.label)rp.label.remove();}
  mpRemotePlayers.delete(uid);
}
function updateRemotePlayers(){
  mpRemotePlayers.forEach(rp=>{
    rp.mesh.position.set(rp.pos.x,rp.pos.y-PLAYER_H+.3,rp.pos.z);
    rp.mesh.rotation.y=rp.yaw;
    // Update name label
    if(rp.label&&gameActive){
      const v3=rp.mesh.position.clone();v3.y+=3;
      const proj=v3.project(camera);
      const sx=(proj.x*.5+.5)*window.innerWidth;
      const sy=(-.5*proj.y+.5)*window.innerHeight;
      if(proj.z<1&&sx>0&&sx<window.innerWidth&&sy>0&&sy<window.innerHeight){
        rp.label.style.display='block';
        rp.label.style.left=(sx-40)+'px';
        rp.label.style.top=(sy-14)+'px';
      } else { rp.label.style.display='none'; }
    }
  });
}

function mpSetUsername(){
  const user=document.getElementById('authUser').value.trim();
  if(user.length<3){mpShowErr('authErr','Must be 3+ characters.');return;}
  if(user.length>16){mpShowErr('authErr','Max 16 characters.');return;}
  localStorage.setItem('mp_username',user);
  mpUser={username:user};
  document.getElementById('lobbyUser').textContent='Playing as: '+user;
  showScreen('lobbyScreen');
}
function mpShowErr(id,msg){
  const el=document.getElementById(id);
  if(el){el.textContent=msg;setTimeout(()=>{el.textContent='';},4000);}
}
function mpShowTab(){}  // no-op — tabs removed

function mpCreateRoom(){
  const username=(localStorage.getItem('mp_username')||'').trim();
  if(!username){showScreen('authScreen');return;}
  mpUser={username};
  if(mpPeer){mpPeer.destroy();mpPeer=null;}
  const code=Math.random().toString(36).slice(2,8).toUpperCase();
  mpPeer=new Peer('raj-'+code.toLowerCase(),{debug:0});
  mpPeer.on('open',()=>{
    mpRoom=code; mpIsHost=true;
    mpPlayers=[{username,isHost:true,uid:'host'}];
    mpPeer.on('connection',conn=>{
      const joinName=conn.metadata||'Player';
      mpConnections.push(conn);
      conn.on('open',()=>{
        conn.send({type:'welcome',players:mpPlayers,code:mpRoom});
        mpPlayers.push({username:joinName,isHost:false,uid:conn.peer});
        const rp=createRemotePlayerMesh(joinName);
        mpRemotePlayers.set(conn.peer,rp);
        mpRenderWaiting();
        mpConnections.filter(c=>c!==conn).forEach(c=>c.send({type:'player_joined',username:joinName,uid:conn.peer}));
      });
      conn.on('data',data=>mpHandleMsg(data,conn.peer));
      conn.on('close',()=>{
        mpConnections=mpConnections.filter(c=>c!==conn);
        removeRemotePlayer(conn.peer);
        mpPlayers=mpPlayers.filter(p=>p.uid!==conn.peer);
        mpRenderWaiting();
      });
    });
    mpPeer.on('error',e=>mpShowErr('lobbyErr','PeerJS: '+e.message));
    mpRenderWaiting();
    showScreen('waitingScreen');
  });
  mpPeer.on('error',e=>mpShowErr('lobbyErr','Could not create room: '+e.message));
}

function mpJoinRoom(){
  const code=(document.getElementById('joinCode').value||'').trim().toUpperCase();
  const username=(localStorage.getItem('mp_username')||'').trim();
  if(!username){showScreen('authScreen');return;}
  if(code.length<4){mpShowErr('lobbyErr','Enter room code.');return;}
  mpUser={username};
  if(mpPeer){mpPeer.destroy();mpPeer=null;}
  mpPeer=new Peer({debug:0});
  mpPeer.on('open',()=>{
    mpHostConn=mpPeer.connect('raj-'+code.toLowerCase(),{metadata:username,reliable:true});
    mpHostConn.on('open',()=>{
      mpRoom=code; mpIsHost=false;
    });
    mpHostConn.on('data',data=>mpHandleMsg(data,'host'));
    mpHostConn.on('close',()=>{showNotif('Disconnected from host.');showScreen('lobbyScreen');});
    mpPeer.on('error',e=>mpShowErr('lobbyErr','Cannot connect: '+e.message));
  });
}

function mpHandleMsg(msg, fromUid){
  switch(msg.type){
    case 'welcome':
      mpPlayers=msg.players;
      mpPlayers.forEach(p=>{
        if(p.uid!==mpUser.uid&&p.uid!=='host'){
          if(!mpRemotePlayers.has(p.uid))
            mpRemotePlayers.set(p.uid,createRemotePlayerMesh(p.username));
        }
      });
      mpRenderWaiting();showScreen('waitingScreen');break;
    case 'player_joined':
      if(!mpPlayers.find(p=>p.uid===msg.uid)) mpPlayers.push({username:msg.username,isHost:false,uid:msg.uid});
      if(!mpRemotePlayers.has(msg.uid)) mpRemotePlayers.set(msg.uid,createRemotePlayerMesh(msg.username));
      mpRenderWaiting();break;
    case 'player_left':
      mpPlayers=mpPlayers.filter(p=>p.uid!==msg.uid);
      removeRemotePlayer(msg.uid);mpRenderWaiting();break;
    case 'room_closed':
      showNotif('Host disconnected.');
      mpRemotePlayers.forEach((_,uid)=>removeRemotePlayer(uid));
      mpRemotePlayers.clear();showScreen('lobbyScreen');break;
    case 'game_start':
      mpPlayers=msg.players;
      const loc=saveData.locId||'beirut';
      startGame(loc,1);
      mpPlayers.forEach(p=>{
        if(p.uid&&p.uid!=='host'){
          if(!mpRemotePlayers.has(p.uid))
            mpRemotePlayers.set(p.uid,createRemotePlayerMesh(p.username));
        }
      });break;
    case 'state':
      if(!mpIsHost) mpApplyState(msg.data);break;
    case 'input':
      if(mpIsHost) mpApplyClientInput(fromUid,msg.data);break;
  }
}

function mpLogout(){
  if(mpPeer){mpPeer.destroy();mpPeer=null;}
  mpRemotePlayers.forEach((_,uid)=>removeRemotePlayer(uid));
  mpRemotePlayers.clear();
  mpUser=null;mpRoom=null;mpIsHost=false;mpPlayers=[];
  mpConnections=[];mpHostConn=null;
  showScreen('mainMenu');
}
function mpLeaveRoom(){
  if(mpIsHost){mpConnections.forEach(c=>c.send({type:'room_closed'}));}
  else if(mpHostConn){mpHostConn.close();}
  mpRemotePlayers.forEach((_,uid)=>removeRemotePlayer(uid));
  mpRemotePlayers.clear();
  mpConnections=[];mpHostConn=null;
  mpRoom=null;mpIsHost=false;
  showScreen('lobbyScreen');
}
function mpStartGame(){
  if(!mpIsHost) return;
  const startMsg={type:'game_start',players:mpPlayers};
  mpConnections.forEach(c=>c.send(startMsg));
  mpHandleMsg(startMsg,'self');
}
function mpRenderWaiting(){
  document.getElementById('waitingCode').textContent=mpRoom||'—';
  const list=document.getElementById('waitingPlayerList');
  list.innerHTML=mpPlayers.map(p=>
    `<div class="mp-player-row">${p.username}${p.isHost?' <span>HOST</span>':''}</div>`
  ).join('');
  const startBtn=document.getElementById('btnStartMp');
  if(startBtn) startBtn.style.display=mpIsHost?'':'none';
  document.getElementById('lobbyUser').textContent='Playing as: '+(mpUser?mpUser.username:'—');
}

function mpBroadcastState(){
  if(!mpIsHost||!mpRoom||!mpConnections.length) return;
  const state={
    px,py,pz,yaw,weapon:currentWeapon,
    missiles:missiles.filter(m=>!m.isDestroyed).map(m=>({
      x:m.pos.x,y:m.pos.y,z:m.pos.z,
      vx:m.vel.x,vy:m.vel.y,vz:m.vel.z,isBoss:m.isBoss,h:m.health,mh:m.maxHealth
    })),
    wave:waveNum,score,cityIntegrity
  };
  mpConnections.forEach(c=>{if(c.open) c.send({type:'state',data:state});});
}
function mpApplyState(data){
  if(data.score!==undefined) score=data.score;
  if(data.wave!==undefined) waveNum=data.wave;
  if(data.cityIntegrity!==undefined) cityIntegrity=data.cityIntegrity;
  const hostP=mpPlayers.find(p=>p.isHost);
  if(hostP){
    let rp=mpRemotePlayers.get('host');
    if(!rp){rp=createRemotePlayerMesh(hostP.username);mpRemotePlayers.set('host',rp);}
    rp.pos.set(data.px,data.py,data.pz);rp.yaw=data.yaw;
  }
}
function mpSendInput(){
  if(mpIsHost||!mpRoom||!mpHostConn||!mpHostConn.open) return;
  mpHostConn.send({type:'input',data:{px,py,pz,yaw,pitch,weapon:currentWeapon}});
}
function mpApplyClientInput(uid,data){
  let rp=mpRemotePlayers.get(uid);
  if(!rp){
    const p=mpPlayers.find(p=>p.uid===uid);
    rp=createRemotePlayerMesh(p?p.username:uid);
    mpRemotePlayers.set(uid,rp);
  }
  rp.pos.set(data.px,data.py,data.pz);rp.yaw=data.yaw;
}

// Hook MP tick + remote player update into game loop
// (called at end of gameLoop's active block)
function _mpTick(dt){
  if(!mpRoom) return;
  mpStateTimer-=dt;
  if(mpStateTimer<=0){
    mpStateTimer=MP_TICK;
    if(mpIsHost) mpBroadcastState();
    else mpSendInput();
  }
  updateRemotePlayers();
}

// Multiplayer button
document.addEventListener('DOMContentLoaded',()=>{
  const btn=document.getElementById('btnMultiplayer');
  if(btn) btn.addEventListener('click',()=>{
    const saved=localStorage.getItem('mp_username');
    if(saved&&saved.trim().length>=3){
      mpUser={username:saved.trim()};
      document.getElementById('lobbyUser').textContent='Playing as: '+saved.trim();
      showScreen('lobbyScreen');
    } else {
      const el=document.getElementById('authUser');
      if(el&&saved) el.value=saved;
      showScreen('authScreen');
    }
  });
});
```

- [ ] Call `_mpTick(dt)` inside gameLoop (after `updateMinimap()` ~line 3643)

```js
_mpTick(dt);
```

---

### Self-review

- **Spec coverage:** All 8 items covered. Cyber bullet fix ✓, hookshot ✓, shop tabs ✓, weapon meshes ✓, missile HP ✓, Richard model ✓, fun improvements ✓, PeerJS MP ✓
- **Placeholders:** None — all steps contain full code
- **Type consistency:**
  - `missiles.push()` in Task 5 adds `barEl`/`fillEl` fields — `destroyMissile` accesses `missile.barEl` ✓
  - `waveScoringMult` defined in Task 7, used in same task ✓
  - `_mpTick` defined in Task 8, called in same task ✓
  - `SKIN_TONES` defined inside `buildCustomizationUI` — needs to either be top-level or defined before use. Move to top-level ✓ (fix: define as `const SKIN_TONES=` at module level near OUTFIT_COLORS)
  - `mpSetUsername()` called from authScreen HTML button — function defined in Task 8 JS ✓
