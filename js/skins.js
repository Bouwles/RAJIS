'use strict';
// ═══════════════════════════════════════════════════════════════
//  RICHARD SKINS
// ═══════════════════════════════════════════════════════════════
const RICHARD_SKINS=[
  {id:'richard_default',   name:'Richard Operator',      tagline:'Classic military operator',   price:0,
   custo:{outfitColor:'#1A3A8A',visorColor:'#44CCFF',skinTone:'#E8C49A',armorStyle:'light',   helmet:true, backpack:'missile'}},
  {id:'richard_recon',     name:'Richard Recon',         tagline:'Tactical recon specialist',   price:800,
   custo:{outfitColor:'#1A1A1A',visorColor:'#FF4400',skinTone:'#E8C49A',armorStyle:'standard',helmet:true, backpack:'none'}},
  {id:'richard_arctic',    name:'Richard Arctic',        tagline:'Cold weather operator',       price:900,
   custo:{outfitColor:'#C8D8E8',visorColor:'#88DDFF',skinTone:'#F0E0D0',armorStyle:'heavy',   helmet:true, backpack:'missile'}},
  {id:'richard_desert',    name:'Richard Desert Storm',  tagline:'Sand warfare veteran',        price:700,
   custo:{outfitColor:'#C8A874',visorColor:'#FFAA00',skinTone:'#C8A070',armorStyle:'light',   helmet:true, backpack:'none'}},
  {id:'richard_neon',      name:'Richard Neon',          tagline:'Cyberpunk operative',         price:1200,
   custo:{outfitColor:'#1A0A30',visorColor:'#DD00FF',skinTone:'#E8C49A',armorStyle:'standard',helmet:true, backpack:'missile'}},
  {id:'richard_medic',     name:'Richard the Medic',     tagline:'Field medic, frontline hero', price:700,
   custo:{outfitColor:'#DDEEDD',visorColor:'#FF4444',skinTone:'#E8C49A',armorStyle:'light',   helmet:true, backpack:'none'}},
  {id:'richard_shadow',    name:'Richard Shadow',        tagline:'Ghost spec ops unit',         price:1500,
   custo:{outfitColor:'#0A0A0A',visorColor:'#00FF88',skinTone:'#8A6A5A',armorStyle:'heavy',   helmet:true, backpack:'none'}},
  {id:'richard_commander', name:'Richard Commander',     tagline:'High command dress uniform',  price:1000,
   custo:{outfitColor:'#0A1A3A',visorColor:'#DDAA00',skinTone:'#E8C49A',armorStyle:'standard',helmet:true, backpack:'missile'}},
  {id:'richard_sunset',    name:'Richard Sunset',        tagline:'Beach assault veteran',       price:800,
   custo:{outfitColor:'#CC4400',visorColor:'#FFDD00',skinTone:'#C87850',armorStyle:'light',   helmet:false,backpack:'none'}},
  {id:'richard_blizzard',  name:'Richard Blizzard',      tagline:'Arctic blizzard unit',        price:900,
   custo:{outfitColor:'#88AACC',visorColor:'#CCEEFF',skinTone:'#F0EEF8',armorStyle:'heavy',   helmet:true, backpack:'missile'}},
  {id:'richard_veteran',   name:'Richard Veteran',       tagline:'Battle-hardened soldier',     price:500,
   custo:{outfitColor:'#4A5A3A',visorColor:'#AACC66',skinTone:'#A87060',armorStyle:'standard',helmet:true, backpack:'none'}},
  {id:'richard_phantom',   name:'Richard Phantom',       tagline:'Unmarked ghost operative',    price:1800,
   custo:{outfitColor:'#F0F0F0',visorColor:'#AAAAAA',skinTone:'#F0F0F0',armorStyle:'heavy',   helmet:true, backpack:'missile'}},
  {id:'richard_gold',      name:'THE RICHARD',           tagline:'Legendary gold operator',     price:0,
   custo:{outfitColor:'#AA7700',visorColor:'#FFEE00',skinTone:'#E8C49A',armorStyle:'heavy',   helmet:true, backpack:'missile'}},
];

// ═══════════════════════════════════════════════════════════════
//  GUN CAMOS
// ═══════════════════════════════════════════════════════════════
const GUN_CAMOS=[
  {id:'camo_default',  name:'Default',       price:0,    hexStr:'#303030'},
  {id:'camo_gold',     name:'Gold',          price:2000, hexStr:'#DDB040'},
  {id:'camo_arctic',   name:'Arctic White',  price:800,  hexStr:'#F0F0EE'},
  {id:'camo_woodland', name:'Woodland',      price:600,  hexStr:'#3A4A2A'},
  {id:'camo_digital',  name:'Digital',       price:900,  hexStr:'#4A5A6A'},
  {id:'camo_tiger',    name:'Tiger Stripe',  price:1100, hexStr:'#8A4A1A'},
  {id:'camo_urban',    name:'Urban Gray',    price:700,  hexStr:'#5A5A5A'},
  {id:'camo_desert',   name:'Desert Sand',   price:600,  hexStr:'#C8A874'},
  {id:'camo_neon',     name:'Neon Green',    price:1200, hexStr:'#00CC44'},
  {id:'camo_midnight', name:'Midnight Blue', price:800,  hexStr:'#0A1A3A'},
  {id:'camo_crimson',  name:'Crimson',       price:1000, hexStr:'#8A0A0A'},
  {id:'camo_carbon',   name:'Carbon',        price:1500, hexStr:'#141414'},
];

// ═══════════════════════════════════════════════════════════════
//  BATTLE PASS TIERS
// ═══════════════════════════════════════════════════════════════
const BP_TIERS=[
  {tier:1,  label:'100 CR',         icon:'💰', credits:100},
  {tier:2,  label:'Recon',          icon:'🪖', skin:'richard_recon'},
  {tier:3,  label:'200 CR',         icon:'💰', credits:200},
  {tier:4,  label:'Flashbang ×2',   icon:'💥'},
  {tier:5,  label:'Arctic',         icon:'🪖', skin:'richard_arctic'},
  {tier:6,  label:'300 CR',         icon:'💰', credits:300},
  {tier:7,  label:'Desert Storm',   icon:'🪖', skin:'richard_desert'},
  {tier:8,  label:'400 CR',         icon:'💰', credits:400},
  {tier:9,  label:'The Medic',      icon:'🪖', skin:'richard_medic'},
  {tier:10, label:'500 CR',         icon:'💰', credits:500},
  {tier:11, label:'Veteran',        icon:'🪖', skin:'richard_veteran'},
  {tier:12, label:'600 CR',         icon:'💰', credits:600},
  {tier:13, label:'Commander',      icon:'🪖', skin:'richard_commander'},
  {tier:14, label:'700 CR',         icon:'💰', credits:700},
  {tier:15, label:'Neon',           icon:'🪖', skin:'richard_neon'},
  {tier:16, label:'800 CR',         icon:'💰', credits:800},
  {tier:17, label:'Blizzard',       icon:'🪖', skin:'richard_blizzard'},
  {tier:18, label:'900 CR',         icon:'💰', credits:900},
  {tier:19, label:'Sunset',         icon:'🪖', skin:'richard_sunset'},
  {tier:20, label:'1000 CR',        icon:'💰', credits:1000},
  {tier:21, label:'Shadow',         icon:'🪖', skin:'richard_shadow'},
  {tier:22, label:'1100 CR',        icon:'💰', credits:1100},
  {tier:23, label:'Phantom',        icon:'🪖', skin:'richard_phantom'},
  {tier:24, label:'1200 CR',        icon:'💰', credits:1200},
  {tier:25, label:'THE RICHARD',    icon:'🏆', skin:'richard_gold'},
];

// ─────────────────────────────────────────────────────────────────
//  HELPERS
// ─────────────────────────────────────────────────────────────────
function _getUAEDate(){
  const d=new Date(Date.now()+4*3600000);
  return d.toISOString().slice(0,10);
}

function _seededShuffle(arr,seedStr){
  let s=seedStr.split('').reduce((a,c)=>a*31+c.charCodeAt(0),1);
  const out=arr.slice();
  for(let i=out.length-1;i>0;i--){
    s=(s*1664525+1013904223)>>>0;
    const j=s%(i+1);
    [out[i],out[j]]=[out[j],out[i]];
  }
  return out;
}

function getDailyShopItems(){
  const date=_getUAEDate();
  const skins=_seededShuffle(RICHARD_SKINS.filter(s=>s.price>0&&s.id!=='richard_gold'),date+'_sk').slice(0,2);
  const camos=_seededShuffle(GUN_CAMOS.filter(c=>c.price>0),date+'_cm').slice(0,4);
  return{skins,camos};
}

function _msToRefresh(){
  const now=Date.now();
  const uaeNow=new Date(now+4*3600000);
  const midnight=Date.UTC(uaeNow.getUTCFullYear(),uaeNow.getUTCMonth(),uaeNow.getUTCDate()+1)-4*3600000;
  const diff=midnight-now;
  const h=Math.floor(diff/3600000);
  const m=Math.floor((diff%3600000)/60000);
  return`${h}h ${m}m`;
}

// ═══════════════════════════════════════════════════════════════
//  ITEM SHOP (buy)
// ═══════════════════════════════════════════════════════════════
function buildItemShop(){
  const{skins,camos}=getDailyShopItems();
  const owned=saveData.ownedSkins||['richard_default'];
  const ownedC=saveData.ownedCamos||['camo_default'];
  const equipped=saveData.equippedSkin||'richard_default';
  const equippedC=saveData.equippedCamo||'camo_default';
  const grid=document.getElementById('itemShopGrid');
  if(!grid) return;
  const creds=document.getElementById('isCredits');
  if(creds) creds.textContent='💰 '+saveData.currency;
  const ref=document.getElementById('isRefreshDate');
  if(ref) ref.textContent='Refreshes in '+_msToRefresh();

  const skinHtml=skins.map(sk=>{
    const isOwned=owned.includes(sk.id);
    const isEq=equipped===sk.id;
    return`<div class="is-card${isEq?' is-eq':''}">
      <div class="is-skin-name">${sk.name}</div>
      <div class="is-skin-tag">${sk.tagline}</div>
      <div class="is-skin-price">${isOwned?'<span class="is-owned">OWNED</span>':'💰 '+sk.price}</div>
      <button class="is-btn${isEq?' is-btn-eq':isOwned?' is-btn-equip':' is-btn-buy'}"${isEq?' disabled':''}
        onclick="buySkin('${sk.id}',${sk.price})">${isEq?'EQUIPPED':isOwned?'EQUIP':'BUY'}</button>
    </div>`;
  }).join('');

  const camoHtml=camos.map(cm=>{
    const isOwned=ownedC.includes(cm.id);
    const isEq=equippedC===cm.id;
    return`<div class="is-camo-card${isEq?' is-eq':''}">
      <div class="is-camo-swatch" style="background:${cm.hexStr}"></div>
      <div class="is-camo-name">${cm.name}</div>
      <div class="is-skin-price">${isOwned?'<span class="is-owned">OWNED</span>':'💰 '+cm.price}</div>
      <button class="is-btn${isEq?' is-btn-eq':isOwned?' is-btn-equip':' is-btn-buy'}"${isEq?' disabled':''}
        onclick="buyCamo('${cm.id}',${cm.price})">${isEq?'EQUIPPED':isOwned?'EQUIP':'BUY'}</button>
    </div>`;
  }).join('');

  grid.innerHTML=`
    <div class="is-section-hd">TODAY'S OPERATORS</div>
    <div class="is-skin-row">${skinHtml}</div>
    <div class="is-section-hd">TODAY'S WEAPON CAMOS</div>
    <div class="is-camo-row">${camoHtml}</div>`;
}

function buySkin(skinId,price){
  const skin=RICHARD_SKINS.find(s=>s.id===skinId);
  if(!skin) return;
  if(!saveData.ownedSkins) saveData.ownedSkins=['richard_default'];
  if(!saveData.ownedSkins.includes(skinId)){
    if(saveData.currency<price){showNotif('Not enough credits!');return;}
    saveData.currency-=price;
    saveData.ownedSkins.push(skinId);
  }
  saveData.equippedSkin=skinId;
  Object.assign(saveData.customization,skin.custo);
  saveSave();
  if(typeof saveCustomizationToFirebase==='function') saveCustomizationToFirebase();
  if(typeof updateLobbyScene==='function') updateLobbyScene();
  buildItemShop();
  showNotif(skin.name+' equipped!');
}

function buyCamo(camoId,price){
  const camo=GUN_CAMOS.find(c=>c.id===camoId);
  if(!camo) return;
  if(!saveData.ownedCamos) saveData.ownedCamos=['camo_default'];
  if(!saveData.ownedCamos.includes(camoId)){
    if(saveData.currency<price){showNotif('Not enough credits!');return;}
    saveData.currency-=price;
    saveData.ownedCamos.push(camoId);
  }
  saveData.equippedCamo=camoId;
  saveSave();
  buildItemShop();
  showNotif(camo.name+' equipped!');
}

// ═══════════════════════════════════════════════════════════════
//  LOCKER (view & equip owned)
// ═══════════════════════════════════════════════════════════════
let _lockerTab='skins';

function buildLockerScreen(tab){
  if(tab) _lockerTab=tab;
  document.getElementById('lkrTabSkins')?.classList.toggle('lkr-tab-active',_lockerTab==='skins');
  document.getElementById('lkrTabCamos')?.classList.toggle('lkr-tab-active',_lockerTab==='camos');
  const grid=document.getElementById('lockerGrid');
  if(!grid) return;
  if(_lockerTab==='skins'){
    const owned=saveData.ownedSkins||['richard_default'];
    const equipped=saveData.equippedSkin||'richard_default';
    grid.innerHTML=RICHARD_SKINS.filter(s=>owned.includes(s.id)).map(sk=>{
      const isEq=equipped===sk.id;
      return`<div class="lkr-card${isEq?' lkr-eq':''}" onclick="equipSkin('${sk.id}')">
        <div class="lkr-card-name">${sk.name}</div>
        <div class="lkr-card-tag">${sk.tagline}</div>
        ${isEq?'<div class="lkr-card-badge">✓ EQUIPPED</div>':'<div class="lkr-card-equip">TAP TO EQUIP</div>'}
      </div>`;
    }).join('')||'<div style="color:var(--text3);padding:20px;font-family:var(--font-ui);font-size:.7em;letter-spacing:.1em">NO SKINS OWNED — visit Item Shop</div>';
  } else {
    const ownedC=saveData.ownedCamos||['camo_default'];
    const equippedC=saveData.equippedCamo||'camo_default';
    grid.innerHTML=GUN_CAMOS.filter(c=>ownedC.includes(c.id)).map(cm=>{
      const isEq=equippedC===cm.id;
      return`<div class="lkr-card${isEq?' lkr-eq':''}" onclick="equipCamo('${cm.id}')">
        <div class="lkr-camo-swatch" style="background:${cm.hexStr}"></div>
        <div class="lkr-card-name">${cm.name}</div>
        ${isEq?'<div class="lkr-card-badge">✓ EQUIPPED</div>':'<div class="lkr-card-equip">TAP TO EQUIP</div>'}
      </div>`;
    }).join('')||'<div style="color:var(--text3);padding:20px;font-family:var(--font-ui);font-size:.7em;letter-spacing:.1em">NO CAMOS OWNED — visit Item Shop</div>';
  }
}

function equipSkin(skinId){
  const skin=RICHARD_SKINS.find(s=>s.id===skinId);
  if(!skin) return;
  saveData.equippedSkin=skinId;
  Object.assign(saveData.customization,skin.custo);
  saveSave();
  if(typeof saveCustomizationToFirebase==='function') saveCustomizationToFirebase();
  if(typeof updateLobbyScene==='function') updateLobbyScene();
  buildLockerScreen();
  showNotif(skin.name+' equipped!');
}

function equipCamo(camoId){
  saveData.equippedCamo=camoId;
  saveSave();
  buildLockerScreen();
  showNotif('Camo equipped!');
}

// ═══════════════════════════════════════════════════════════════
//  BATTLE PASS
// ═══════════════════════════════════════════════════════════════
function buildBPScreen(){
  const tier=saveData.bpLevel||0;
  const xp=saveData.bpXP||0;
  const nextXP=(tier+1)*500;
  const pct=Math.min(100,Math.round((xp%500)/500*100));
  const cTier=document.getElementById('bpCurrentTier');
  const xpBar=document.getElementById('bpXPBar');
  const xpText=document.getElementById('bpXPText');
  if(cTier) cTier.textContent='TIER '+tier;
  if(xpBar) xpBar.style.width=pct+'%';
  if(xpText) xpText.textContent=xp+' XP — '+Math.max(0,nextXP-xp)+' XP to Tier '+(tier+1);

  if(!saveData.bpClaimedTiers) saveData.bpClaimedTiers=[];
  let claimed=false;
  BP_TIERS.forEach(t=>{
    if(tier>=t.tier&&!saveData.bpClaimedTiers.includes(t.tier)){
      saveData.bpClaimedTiers.push(t.tier);
      if(t.credits){saveData.currency+=t.credits;showNotif('BP Tier '+t.tier+': +'+t.credits+' CR!');}
      if(t.skin){
        if(!saveData.ownedSkins) saveData.ownedSkins=['richard_default'];
        if(!saveData.ownedSkins.includes(t.skin)) saveData.ownedSkins.push(t.skin);
        showNotif('BP Tier '+t.tier+': '+t.label+' unlocked!');
      }
      claimed=true;
    }
  });
  if(claimed) saveSave();

  const el=document.getElementById('bpTierList');
  if(!el) return;
  el.innerHTML=BP_TIERS.map(t=>{
    const done=tier>=t.tier;
    const cur=tier===t.tier-1;
    return`<div class="bp-tile${done?' bp-tile-done':cur?' bp-tile-cur':''}">
      <div class="bp-tile-num">${t.tier}</div>
      <div class="bp-tile-icon">${t.icon}</div>
      <div class="bp-tile-label">${t.label}</div>
      ${done?'<div class="bp-tile-check">✓</div>':''}
    </div>`;
  }).join('');
  const cur=el.querySelector('.bp-tile-cur');
  if(cur) setTimeout(()=>cur.scrollIntoView({behavior:'smooth',block:'nearest',inline:'center'}),120);
}
