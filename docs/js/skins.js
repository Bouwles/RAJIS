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
//  RARITY
// ═══════════════════════════════════════════════════════════════
function _rarity(r){
  const T={
    common:    {label:'Common',    color:'#8A9BA8',border:'rgba(138,155,168,.45)',bg:'rgba(26,30,36,.96)'},
    uncommon:  {label:'Uncommon',  color:'#2ECC71',border:'rgba(46,204,113,.5)',  bg:'rgba(10,36,20,.96)'},
    rare:      {label:'Rare',      color:'#4A9FE8',border:'rgba(74,159,232,.55)', bg:'rgba(6,20,50,.96)'},
    epic:      {label:'Epic',      color:'#A855D8',border:'rgba(168,85,216,.55)', bg:'rgba(22,8,46,.96)'},
    legendary: {label:'Legendary', color:'#F07830',border:'rgba(240,120,48,.55)', bg:'rgba(46,14,4,.96)'},
    mythic:    {label:'Mythic',    color:'#F04050',border:'rgba(240,64,80,.6)',   bg:'rgba(46,4,8,.96)'},
  };
  return T[r]||T.common;
}

// ═══════════════════════════════════════════════════════════════
//  PER-WEAPON CAMOS
// ═══════════════════════════════════════════════════════════════
const WEAPON_CAMOS={
  pistol:[
    {id:'default', name:'Default',  hexStr:'#303030', price:0},
    {id:'sand',    name:'Sandline', hexStr:'#C8A874', price:500,  rarity:'rare'},
    {id:'black',   name:'Blackout', hexStr:'#0A0A0A', price:800,  rarity:'epic'},
    {id:'arctic',  name:'Arctic',   hexStr:'#D0E8F0', price:400,  rarity:'uncommon'},
    {id:'neon',    name:'Neon',     hexStr:'#00CC44', price:900,  rarity:'epic'},
  ],
  launcher:[
    {id:'default', name:'Default',  hexStr:'#303030', price:0},
    {id:'desert',  name:'Desert',   hexStr:'#C8A874', price:500,  rarity:'rare'},
    {id:'redline', name:'Redline',  hexStr:'#8A0A0A', price:1200, rarity:'legendary'},
    {id:'arctic',  name:'Arctic',   hexStr:'#D0E8F0', price:800,  rarity:'epic'},
    {id:'gold',    name:'Gold',     hexStr:'#DDB040', price:2000, rarity:'legendary'},
  ],
  sniper:[
    {id:'default',  name:'Default',  hexStr:'#303030', price:0},
    {id:'midnight', name:'Midnight', hexStr:'#0A1A3A', price:600, rarity:'rare'},
    {id:'ember',    name:'Ember',    hexStr:'#CC4400', price:900, rarity:'epic'},
    {id:'chrome',   name:'Chrome',   hexStr:'#B0B0B0', price:700, rarity:'rare'},
  ],
  smg:[
    {id:'default', name:'Default',  hexStr:'#303030', price:0},
    {id:'neon',    name:'Neon',     hexStr:'#00CC44', price:500, rarity:'uncommon'},
    {id:'frost',   name:'Frost',    hexStr:'#8888CC', price:600, rarity:'rare'},
    {id:'tiger',   name:'Tiger',    hexStr:'#8A4A1A', price:800, rarity:'rare'},
  ],
  shotgun:[
    {id:'default',  name:'Default',  hexStr:'#303030', price:0},
    {id:'woodland', name:'Woodland', hexStr:'#3A4A2A', price:600, rarity:'rare'},
    {id:'urban',    name:'Urban',    hexStr:'#5A5A5A', price:500, rarity:'uncommon'},
  ],
};

// ═══════════════════════════════════════════════════════════════
//  SHOP CATALOG
// ═══════════════════════════════════════════════════════════════
const SHOP_CATALOG=[
  // OUTFITS — featured
  {id:'richard_recon',      name:'Recon',           itemType:'Outfit', section:'featured', rewardType:'skin', rarity:'uncommon', price:800},
  {id:'richard_arctic',     name:'Arctic Defense',  itemType:'Outfit', section:'featured', rewardType:'skin', rarity:'uncommon', price:900},
  {id:'richard_desert',     name:'Desert Storm',    itemType:'Outfit', section:'featured', rewardType:'skin', rarity:'rare',     price:1000},
  {id:'richard_neon',       name:'Neon Operative',  itemType:'Outfit', section:'featured', rewardType:'skin', rarity:'epic',     price:1200, isNew:true},
  {id:'richard_medic',      name:'Field Medic',     itemType:'Outfit', section:'featured', rewardType:'skin', rarity:'uncommon', price:700},
  {id:'richard_shadow',     name:'Shadow Ops',      itemType:'Outfit', section:'featured', rewardType:'skin', rarity:'legendary',price:1800, isNew:true},
  {id:'richard_commander',  name:'Commander',       itemType:'Outfit', section:'featured', rewardType:'skin', rarity:'rare',     price:1200},
  {id:'richard_sunset',     name:'Sunset Assault',  itemType:'Outfit', section:'featured', rewardType:'skin', rarity:'uncommon', price:900},
  {id:'richard_blizzard',   name:'Blizzard Unit',   itemType:'Outfit', section:'featured', rewardType:'skin', rarity:'rare',     price:1100},
  {id:'richard_veteran',    name:'Veteran',         itemType:'Outfit', section:'featured', rewardType:'skin', rarity:'common',   price:500},
  {id:'richard_phantom',    name:'Phantom',         itemType:'Outfit', section:'featured', rewardType:'skin', rarity:'legendary',price:1800},
  // PISTOL CAMOS — daily
  {id:'shop_camo_pistol_sand',   name:'Sandline Pistol',  itemType:'Pistol Camo',      section:'daily', rewardType:'weaponCamo', weaponId:'pistol',      camoId:'sand',    rarity:'rare',      price:500},
  {id:'shop_camo_pistol_black',  name:'Blackout Pistol',  itemType:'Pistol Camo',      section:'daily', rewardType:'weaponCamo', weaponId:'pistol',      camoId:'black',   rarity:'epic',      price:800, isNew:true},
  {id:'shop_camo_pistol_arctic', name:'Arctic Pistol',    itemType:'Pistol Camo',      section:'daily', rewardType:'weaponCamo', weaponId:'pistol',      camoId:'arctic',  rarity:'uncommon',  price:400},
  {id:'shop_camo_pistol_neon',   name:'Neon Pistol',      itemType:'Pistol Camo',      section:'daily', rewardType:'weaponCamo', weaponId:'pistol',      camoId:'neon',    rarity:'epic',      price:900},
  // LAUNCHER CAMOS — daily
  {id:'shop_camo_launch_desert', name:'Desert Launcher',  itemType:'Launcher Camo',    section:'daily', rewardType:'weaponCamo', weaponId:'launcher',    camoId:'desert',  rarity:'rare',      price:500},
  {id:'shop_camo_launch_red',    name:'Redline Launcher', itemType:'Launcher Camo',    section:'daily', rewardType:'weaponCamo', weaponId:'launcher',    camoId:'redline', rarity:'legendary', price:1200, isNew:true},
  {id:'shop_camo_launch_arctic', name:'Arctic Launcher',  itemType:'Launcher Camo',    section:'daily', rewardType:'weaponCamo', weaponId:'launcher',    camoId:'arctic',  rarity:'epic',      price:800},
  {id:'shop_camo_launch_gold',   name:'Gold Launcher',    itemType:'Launcher Camo',    section:'daily', rewardType:'weaponCamo', weaponId:'launcher',    camoId:'gold',    rarity:'legendary', price:2000},
  // SNIPER CAMOS — daily
  {id:'shop_camo_snp_mid',   name:'Midnight Sniper',      itemType:'Sniper Camo',      section:'daily', rewardType:'weaponCamo', weaponId:'sniper',      camoId:'midnight',rarity:'rare',      price:600},
  {id:'shop_camo_snp_ember', name:'Ember Sniper',         itemType:'Sniper Camo',      section:'daily', rewardType:'weaponCamo', weaponId:'sniper',      camoId:'ember',   rarity:'epic',      price:900},
  {id:'shop_camo_snp_chrome',name:'Chrome Sniper',        itemType:'Sniper Camo',      section:'daily', rewardType:'weaponCamo', weaponId:'sniper',      camoId:'chrome',  rarity:'rare',      price:700},
  // SMG CAMOS — daily
  {id:'shop_camo_smg_neon',  name:'Neon SMG',             itemType:'SMG Camo',         section:'daily', rewardType:'weaponCamo', weaponId:'smg',         camoId:'neon',    rarity:'uncommon',  price:500},
  {id:'shop_camo_smg_frost', name:'Frost SMG',            itemType:'SMG Camo',         section:'daily', rewardType:'weaponCamo', weaponId:'smg',         camoId:'frost',   rarity:'rare',      price:600},
  {id:'shop_camo_smg_tiger', name:'Tiger SMG',            itemType:'SMG Camo',         section:'daily', rewardType:'weaponCamo', weaponId:'smg',         camoId:'tiger',   rarity:'rare',      price:800},
  // SHOTGUN CAMOS — daily
  {id:'shop_camo_sg_wood',   name:'Woodland Shotgun',     itemType:'Shotgun Camo',     section:'daily', rewardType:'weaponCamo', weaponId:'shotgun',     camoId:'woodland',rarity:'rare',      price:600},
  {id:'shop_camo_sg_urban',  name:'Urban Shotgun',        itemType:'Shotgun Camo',     section:'daily', rewardType:'weaponCamo', weaponId:'shotgun',     camoId:'urban',   rarity:'uncommon',  price:500},
];

// ─────────────────────────────────────────────────────────────────
//  HELPERS
// ─────────────────────────────────────────────────────────────────
function _getUAEDate(){
  return new Date(Date.now()+4*3600000).toISOString().slice(0,10);
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
function _shopCountdown(){
  const now=Date.now();
  const uae=new Date(now+4*3600000);
  const midnight=Date.UTC(uae.getUTCFullYear(),uae.getUTCMonth(),uae.getUTCDate()+1)-4*3600000;
  const d=Math.max(0,midnight-now);
  const h=Math.floor(d/3600000);
  const m=Math.floor((d%3600000)/60000);
  const s=Math.floor((d%60000)/1000);
  return`${h}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
}
function _camoHex(item){
  const wc=WEAPON_CAMOS[item.weaponId];
  if(!wc) return'#303030';
  const c=wc.find(c=>c.id===item.camoId);
  return c?c.hexStr:'#303030';
}
function _skinColor(skinId){
  const s=RICHARD_SKINS.find(s=>s.id===skinId);
  return s?s.custo.outfitColor:'#1A3A8A';
}
function _isOwned(item){
  if(item.rewardType==='skin') return(saveData.ownedSkins||['richard_default']).includes(item.id);
  if(item.rewardType==='weaponCamo') return((saveData.ownedWeaponCamos||{})[item.weaponId]||[]).includes(item.camoId);
  return false;
}
function _isEquipped(item){
  if(item.rewardType==='skin') return(saveData.equippedSkin||'richard_default')===item.id;
  if(item.rewardType==='weaponCamo') return((saveData.equippedWeaponCamos||{})[item.weaponId]||'default')===item.camoId;
  return false;
}

function getDailyShopItems(){
  const date=_getUAEDate();
  const featured=_seededShuffle(SHOP_CATALOG.filter(i=>i.section==='featured'),date+'_feat').slice(0,4);
  const daily=_seededShuffle(SHOP_CATALOG.filter(i=>i.section==='daily'),date+'_daily').slice(0,6);
  return{featured,daily};
}

// ═══════════════════════════════════════════════════════════════
//  ITEM SHOP — Fortnite-style two-column layout
// ═══════════════════════════════════════════════════════════════
let _shopTimerIv=null;

function buildItemShop(){
  if(_shopTimerIv){clearInterval(_shopTimerIv);_shopTimerIv=null;}
  const{featured,daily}=getDailyShopItems();
  const fg=document.getElementById('is2FeatGrid');
  const dg=document.getElementById('is2DailyGrid');
  if(!fg||!dg) return;

  const cr=saveData.currency||0;
  const credStr='💰 '+cr.toLocaleString();
  const top=document.getElementById('is2Credits');
  const foot=document.getElementById('is2CreditsFooter');
  if(top) top.textContent=credStr;
  if(foot) foot.textContent=credStr;

  fg.innerHTML=featured.map(_featCardHtml).join('');
  dg.innerHTML=daily.map(_dailyCardHtml).join('');

  const tick=()=>{
    const t='Resets in '+_shopCountdown();
    const a=document.getElementById('is2FeatTimer');
    const b=document.getElementById('is2DailyTimer');
    if(a) a.textContent=t;
    if(b) b.textContent=t;
  };
  tick();
  _shopTimerIv=setInterval(tick,1000);
}

function _featCardHtml(item){
  const r=_rarity(item.rarity);
  const owned=_isOwned(item);
  const equipped=_isEquipped(item);
  const col=item.rewardType==='skin'?_skinColor(item.id):'#1A3A8A';
  const statusHtml=equipped
    ?`<span class="is2-equipped">✓ EQUIPPED</span>`
    :owned
      ?`<span class="is2-owned">OWNED</span>`
      :`<span class="is2-cr-icon">💰</span><span class="is2-price">${item.price.toLocaleString()}</span>`;
  return`<div class="is2-feat-card${equipped?' is2-card-equipped':''}"
    style="border-color:${r.border};background:${r.bg};"
    onclick="openShopModal('${item.id}')">
    ${item.isNew?'<div class="is2-ribbon">NEW!</div>':''}
    <div class="is2-feat-preview" style="background:linear-gradient(160deg,${col}28 0%,${r.bg} 100%);">
      <div class="is2-feat-char" style="color:${col};text-shadow:0 0 18px ${col}88;">🪖</div>
    </div>
    <div class="is2-card-footer" style="border-top-color:${r.border};">
      <div class="is2-rarity-stripe" style="background:${r.color};"></div>
      <div class="is2-card-name">${item.name}</div>
      <div class="is2-card-type">${item.itemType}</div>
      <div class="is2-card-price-row">${statusHtml}</div>
    </div>
  </div>`;
}

function _dailyCardHtml(item){
  const r=_rarity(item.rarity);
  const owned=_isOwned(item);
  const equipped=_isEquipped(item);
  const statusHtml=equipped
    ?`<span class="is2-equipped">✓ EQUIPPED</span>`
    :owned
      ?`<span class="is2-owned">OWNED</span>`
      :`<span class="is2-cr-icon">💰</span><span class="is2-price">${item.price.toLocaleString()}</span>`;
  const previewHtml=item.rewardType==='weaponCamo'
    ?`<div class="is2-camo-swatch" style="background:${_camoHex(item)};box-shadow:0 0 10px ${_camoHex(item)}55;"></div>`
    :`<div class="is2-cosm-icon">${item.icon||'✦'}</div>`;
  return`<div class="is2-daily-card${equipped?' is2-card-equipped':''}"
    style="border-color:${r.border};background:${r.bg};"
    onclick="openShopModal('${item.id}')">
    ${item.isNew?'<div class="is2-ribbon">NEW!</div>':''}
    <div class="is2-daily-preview">${previewHtml}</div>
    <div class="is2-card-footer" style="border-top-color:${r.border};">
      <div class="is2-rarity-stripe" style="background:${r.color};"></div>
      <div class="is2-card-name">${item.name}</div>
      <div class="is2-card-type">${item.itemType}</div>
      <div class="is2-card-price-row">${statusHtml}</div>
    </div>
  </div>`;
}

// ─────────────────────────────────────────────────────────────────
//  ITEM DETAIL MODAL
// ─────────────────────────────────────────────────────────────────
function openShopModal(itemId){
  const item=SHOP_CATALOG.find(i=>i.id===itemId);
  if(!item) return;
  const modal=document.getElementById('is2Modal');
  if(!modal) return;
  modal.style.display='flex';
  const r=_rarity(item.rarity);
  const owned=_isOwned(item);
  const equipped=_isEquipped(item);

  const prev=document.getElementById('is2ModalPreview');
  if(prev){
    if(item.rewardType==='skin'){
      const col=_skinColor(item.id);
      prev.innerHTML=`<div style="width:100%;height:100%;background:linear-gradient(180deg,${col}44,${r.bg});display:flex;align-items:center;justify-content:center;">
        <div style="font-size:4.5em;filter:drop-shadow(0 4px 16px ${col}88);">🪖</div>
      </div>`;
    } else if(item.rewardType==='weaponCamo'){
      const hex=_camoHex(item);
      prev.innerHTML=`<div style="width:100%;height:100%;background:${r.bg};display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;">
        <div style="width:120px;height:36px;background:${hex};border:1px solid rgba(255,255,255,.18);box-shadow:0 0 16px ${hex}55;"></div>
        <div style="font-size:.58em;font-family:var(--font-ui);letter-spacing:.12em;color:var(--text3);text-transform:uppercase;">Weapon: ${item.weaponId}</div>
      </div>`;
    }
    prev.style.borderBottom=`1px solid ${r.border}`;
  }

  const body=document.getElementById('is2ModalBody');
  if(body){
    let btnHtml='';
    if(equipped){
      btnHtml=`<button class="is2-modal-buy" disabled style="background:rgba(212,149,42,.18);color:var(--amber);">EQUIPPED</button>`;
    } else if(owned){
      const equipFn=item.rewardType==='skin'
        ?`equipSkin('${item.id}');closeShopModal();buildItemShop()`
        :`equipWeaponCamo('${item.weaponId}','${item.camoId}');closeShopModal();buildItemShop()`;
      btnHtml=`<button class="is2-modal-buy" style="background:rgba(74,159,232,.45);" onclick="${equipFn}">EQUIP</button>`;
    } else {
      btnHtml=`<button class="is2-modal-buy" style="background:${r.color};color:#06080F;" onclick="buyShopItem('${item.id}')">BUY — 💰 ${item.price.toLocaleString()}</button>`;
    }
    body.innerHTML=`
      <div class="is2-modal-rarity" style="color:${r.color}">${r.label}</div>
      <div class="is2-modal-name">${item.name}</div>
      <div class="is2-modal-type">${item.itemType}</div>
      ${btnHtml}`;
  }
}

function closeShopModal(){
  const m=document.getElementById('is2Modal');
  if(m) m.style.display='none';
}

// ─────────────────────────────────────────────────────────────────
//  PURCHASE
// ─────────────────────────────────────────────────────────────────
function buyShopItem(itemId){
  const item=SHOP_CATALOG.find(i=>i.id===itemId);
  if(!item) return;
  if((saveData.currency||0)<item.price){showNotif('Not enough credits!');return;}
  if(_isOwned(item)){showNotif('Already owned!');return;}
  saveData.currency-=item.price;
  if(item.rewardType==='skin'){
    if(!saveData.ownedSkins) saveData.ownedSkins=['richard_default'];
    saveData.ownedSkins.push(item.id);
    saveData.equippedSkin=item.id;
    const skin=RICHARD_SKINS.find(s=>s.id===item.id);
    if(skin) Object.assign(saveData.customization,skin.custo);
    if(typeof saveCustomizationToFirebase==='function') saveCustomizationToFirebase();
    if(typeof updateLobbyScene==='function') updateLobbyScene();
  } else if(item.rewardType==='weaponCamo'){
    if(!saveData.ownedWeaponCamos) saveData.ownedWeaponCamos={};
    if(!saveData.ownedWeaponCamos[item.weaponId]) saveData.ownedWeaponCamos[item.weaponId]=[];
    saveData.ownedWeaponCamos[item.weaponId].push(item.camoId);
    if(!saveData.equippedWeaponCamos) saveData.equippedWeaponCamos={};
    saveData.equippedWeaponCamos[item.weaponId]=item.camoId;
  }
  saveSave();
  if(typeof updateSaveUI==='function') updateSaveUI();
  showNotif(item.name+' purchased!');
  openShopModal(itemId);
  buildItemShop();
}

function equipWeaponCamo(weaponId,camoId){
  if(!saveData.equippedWeaponCamos) saveData.equippedWeaponCamos={};
  saveData.equippedWeaponCamos[weaponId]=camoId;
  saveSave();
  showNotif(camoId+' camo equipped for '+weaponId+'!');
}

// ═══════════════════════════════════════════════════════════════
//  LOCKER — two-column layout + Three.js preview
// ═══════════════════════════════════════════════════════════════
let _lockerTab='skins';
let _lkrSel=null;
let _lkrRenderer=null,_lkrScene=null,_lkrCamera=null,_lkrChar=null,_lkrT=0,_lkrRafId=null;

function _initLkrRenderer(){
  const canvas=document.getElementById('lockerPreviewCanvas');
  if(!canvas||_lkrRenderer) return;
  const w=canvas.clientWidth||340, h=canvas.clientHeight||500;
  _lkrRenderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true});
  _lkrRenderer.setSize(w,h,false);
  _lkrScene=new THREE.Scene();
  _lkrCamera=new THREE.PerspectiveCamera(42,w/h,0.1,50);
  _lkrCamera.position.set(0,1.1,4.2);
  _lkrCamera.lookAt(0,0.9,0);
  _lkrScene.add(new THREE.AmbientLight(0xffffff,0.65));
  const dl=new THREE.DirectionalLight(0xffffff,0.9);dl.position.set(2,4,2);_lkrScene.add(dl);
  const dl2=new THREE.DirectionalLight(0x4488ff,0.3);dl2.position.set(-2,1,-3);_lkrScene.add(dl2);
}
function _lkrStartLoop(){
  if(_lkrRafId) return;
  (function _loop(){
    if(typeof currentScreen!=='undefined'&&currentScreen!=='lockerScreen'){_lkrRafId=null;return;}
    _lkrT+=0.016;
    if(_lkrChar) _lkrChar.rotation.y=_lkrT*0.5;
    if(_lkrRenderer&&_lkrScene&&_lkrCamera) _lkrRenderer.render(_lkrScene,_lkrCamera);
    _lkrRafId=requestAnimationFrame(_loop);
  })();
}
function _lkrShowChar(custo){
  if(!_lkrScene) return;
  if(_lkrChar){_lkrScene.remove(_lkrChar);_lkrChar=null;}
  if(typeof makeCharModel!=='function') return;
  _lkrChar=makeCharModel(custo);
  _lkrScene.add(_lkrChar);
}
function _lkrSelectItem(item,el){
  _lkrSel=item;
  document.querySelectorAll('.lkr-item').forEach(c=>c.classList.remove('lkr-item-sel'));
  if(el) el.classList.add('lkr-item-sel');
  const nameEl=document.getElementById('lkrInfoName');
  const subEl=document.getElementById('lkrInfoSub');
  const rarEl=document.getElementById('lkrInfoRarity');
  if(nameEl) nameEl.textContent=item.name||item.id;
  if(subEl) subEl.textContent=item._subtype||'';
  if(rarEl){const rc=_rarity(item.rarity||'common');rarEl.textContent=rc.label;rarEl.style.color=rc.color;}
  const btn=document.getElementById('lkrEquipBtn');
  const eq=item._type==='skin'?(saveData.equippedSkin||'richard_default')===item.id
    :(saveData.equippedWeaponCamos||{})[item.weaponId]===item.camoId;
  if(btn){btn.textContent=eq?'EQUIPPED':'EQUIP';btn.disabled=eq;}
  if(item._type==='skin'){
    const skin=RICHARD_SKINS.find(s=>s.id===item.id);
    if(skin) _lkrShowChar(skin.custo);
  } else {
    _lkrShowChar(saveData.customization||{});
  }
}
function _lkrEquip(){
  if(!_lkrSel) return;
  if(_lkrSel._type==='skin') equipSkin(_lkrSel.id);
  else equipWeaponCamo(_lkrSel.weaponId,_lkrSel.camoId);
}

function buildLockerScreen(tab){
  if(tab) _lockerTab=tab;
  _initLkrRenderer();
  _lkrStartLoop();
  const ts=document.getElementById('lkrTabSkins');
  const tc=document.getElementById('lkrTabCamos');
  if(ts) ts.className='lkr-cat-tab'+(_lockerTab==='skins'?' lkr-cat-active':'');
  if(tc) tc.className='lkr-cat-tab'+(_lockerTab==='camos'?' lkr-cat-active':'');
  const grid=document.getElementById('lockerGrid');
  if(!grid) return;
  grid.innerHTML='';
  _lkrShowChar(saveData.customization||{});
  // reset info + button
  const nameEl=document.getElementById('lkrInfoName');
  const subEl=document.getElementById('lkrInfoSub');
  const rarEl=document.getElementById('lkrInfoRarity');
  const btn=document.getElementById('lkrEquipBtn');
  if(nameEl) nameEl.textContent='— SELECT AN ITEM —';
  if(subEl) subEl.textContent='';
  if(rarEl){rarEl.textContent='';rarEl.style.color='';}
  if(btn){btn.textContent='EQUIP';btn.disabled=true;}
  _lkrSel=null;

  if(_lockerTab==='skins'){
    const owned=saveData.ownedSkins||['richard_default'];
    const equippedSkin=saveData.equippedSkin||'richard_default';
    const skins=RICHARD_SKINS.filter(s=>owned.includes(s.id));
    if(!skins.length){grid.innerHTML='<div class="lkr-empty">No outfits owned — visit Item Shop</div>';return;}
    skins.forEach(sk=>{
      const isEq=equippedSkin===sk.id;
      const col=sk.custo.outfitColor||'#1A3A8A';
      const item={...sk,_type:'skin',_subtype:'OUTFIT'};
      const div=document.createElement('div');
      div.className='lkr-item'+(isEq?' lkr-item-equipped':'');
      div.innerHTML=`<div class="lkr-item-preview" style="background:linear-gradient(180deg,${col}28 0%,${col}06 100%);">
        <div class="lkr-item-icon" style="color:${col};text-shadow:0 0 14px ${col}88;">🪖</div>
      </div>
      ${isEq?'<div class="lkr-item-eq-badge">ON</div>':''}
      <div class="lkr-rarity-bar" style="background:${_rarity(sk.rarity||'uncommon').color};"></div>
      <div class="lkr-item-footer">${sk.name}</div>`;
      div.onclick=()=>_lkrSelectItem(item,div);
      grid.appendChild(div);
    });
  } else {
    const ownedWC=saveData.ownedWeaponCamos||{};
    const equippedWC=saveData.equippedWeaponCamos||{};
    let hasAny=false;
    Object.entries(WEAPON_CAMOS).forEach(([wid,camos])=>{
      const owned=ownedWC[wid]||[];
      const visible=camos.filter(c=>c.id==='default'||owned.includes(c.id));
      if(!visible.length) return;
      hasAny=true;
      const hd=document.createElement('div');
      hd.className='lkr-weapon-section-hd';
      hd.textContent=wid.toUpperCase();
      grid.appendChild(hd);
      visible.forEach(cm=>{
        const isEq=(equippedWC[wid]||'default')===cm.id;
        const item={...cm,_type:'camo',_subtype:wid.toUpperCase()+' CAMO',weaponId:wid,camoId:cm.id};
        const div=document.createElement('div');
        div.className='lkr-item'+(isEq?' lkr-item-equipped':'');
        div.innerHTML=`<div class="lkr-item-preview">
          <div class="lkr-item-camo-swatch" style="background:${cm.hexStr||'#303030'};"></div>
        </div>
        ${isEq?'<div class="lkr-item-eq-badge">ON</div>':''}
        <div class="lkr-rarity-bar" style="background:${_rarity(cm.rarity||'common').color};"></div>
        <div class="lkr-item-footer">${cm.name}</div>`;
        div.onclick=()=>_lkrSelectItem(item,div);
        grid.appendChild(div);
      });
    });
    if(!hasAny) grid.innerHTML='<div class="lkr-empty">No camos owned — visit Item Shop</div>';
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

// ═══════════════════════════════════════════════════════════════
//  BATTLE PASS
// ═══════════════════════════════════════════════════════════════
const BP_TIERS=[
  {tier:1,  label:'100 CR',       icon:'💰', credits:100},
  {tier:2,  label:'Recon',        icon:'🪖', skin:'richard_recon'},
  {tier:3,  label:'200 CR',       icon:'💰', credits:200},
  {tier:4,  label:'Flashbang ×2', icon:'💥'},
  {tier:5,  label:'Arctic',       icon:'🪖', skin:'richard_arctic'},
  {tier:6,  label:'300 CR',       icon:'💰', credits:300},
  {tier:7,  label:'Desert Storm', icon:'🪖', skin:'richard_desert'},
  {tier:8,  label:'400 CR',       icon:'💰', credits:400},
  {tier:9,  label:'The Medic',    icon:'🪖', skin:'richard_medic'},
  {tier:10, label:'500 CR',       icon:'💰', credits:500},
  {tier:11, label:'Veteran',      icon:'🪖', skin:'richard_veteran'},
  {tier:12, label:'600 CR',       icon:'💰', credits:600},
  {tier:13, label:'Commander',    icon:'🪖', skin:'richard_commander'},
  {tier:14, label:'700 CR',       icon:'💰', credits:700},
  {tier:15, label:'Neon',         icon:'🪖', skin:'richard_neon'},
  {tier:16, label:'800 CR',       icon:'💰', credits:800},
  {tier:17, label:'Blizzard',     icon:'🪖', skin:'richard_blizzard'},
  {tier:18, label:'900 CR',       icon:'💰', credits:900},
  {tier:19, label:'Sunset',       icon:'🪖', skin:'richard_sunset'},
  {tier:20, label:'1000 CR',      icon:'💰', credits:1000},
  {tier:21, label:'Shadow',       icon:'🪖', skin:'richard_shadow'},
  {tier:22, label:'1100 CR',      icon:'💰', credits:1100},
  {tier:23, label:'Phantom',      icon:'🪖', skin:'richard_phantom'},
  {tier:24, label:'1200 CR',      icon:'💰', credits:1200},
  {tier:25, label:'THE RICHARD',  icon:'🏆', skin:'richard_gold'},
];

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
