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
    {id:'default', name:'Default',  hexStr:'#303030', accentStr:'#1A1A1E', price:0},
    {id:'sand',    name:'Sandline', hexStr:'#C8A874', accentStr:'#6B4F2A', price:500,  rarity:'rare'},
    {id:'black',   name:'Blackout', hexStr:'#0E0E10', accentStr:'#34363C', price:800,  rarity:'epic'},
    {id:'arctic',  name:'Arctic',   hexStr:'#D0E8F0', accentStr:'#4A88B0', price:400,  rarity:'uncommon'},
    {id:'neon',    name:'Neon',     hexStr:'#00CC44', accentStr:'#0A2A14', price:900,  rarity:'epic'},
  ],
  launcher:[
    {id:'default', name:'Default',  hexStr:'#303030', accentStr:'#1A1A1E', price:0},
    {id:'desert',  name:'Desert',   hexStr:'#C8A874', accentStr:'#7A5A30', price:500,  rarity:'rare'},
    {id:'redline', name:'Redline',  hexStr:'#1A1A1E', accentStr:'#C2342A', price:1200, rarity:'legendary'},
    {id:'arctic',  name:'Arctic',   hexStr:'#D0E8F0', accentStr:'#4A88B0', price:800,  rarity:'epic'},
    {id:'gold',    name:'Gold',     hexStr:'#DDB040', accentStr:'#6A4A14', price:2000, rarity:'legendary'},
  ],
  sniper:[
    {id:'default',  name:'Default',  hexStr:'#303030', accentStr:'#1A1A1E', price:0},
    {id:'midnight', name:'Midnight', hexStr:'#0A1A3A', accentStr:'#2A4A7A', price:600, rarity:'rare'},
    {id:'ember',    name:'Ember',    hexStr:'#CC4400', accentStr:'#3A1208', price:900, rarity:'epic'},
    {id:'chrome',   name:'Chrome',   hexStr:'#B0B0B0', accentStr:'#50525A', price:700, rarity:'rare'},
  ],
  smg:[
    {id:'default', name:'Default',  hexStr:'#303030', accentStr:'#1A1A1E', price:0},
    {id:'neon',    name:'Neon',     hexStr:'#00CC44', accentStr:'#0A2A14', price:500, rarity:'uncommon'},
    {id:'frost',   name:'Frost',    hexStr:'#8888CC', accentStr:'#3A3A6E', price:600, rarity:'rare'},
    {id:'tiger',   name:'Tiger',    hexStr:'#8A4A1A', accentStr:'#1A1208', price:800, rarity:'rare'},
  ],
  shotgun:[
    {id:'default',  name:'Default',  hexStr:'#303030', accentStr:'#1A1A1E', price:0},
    {id:'woodland', name:'Woodland', hexStr:'#3A4A2A', accentStr:'#1C2414', price:600, rarity:'rare'},
    {id:'urban',    name:'Urban',    hexStr:'#5A5A5A', accentStr:'#2A2A2E', price:500, rarity:'uncommon'},
  ],
  railgun:[
    {id:'default', name:'Default', hexStr:'#303030', accentStr:'#1A1A1E', price:0},
    {id:'plasma',  name:'Plasma',  hexStr:'#00FFCC', accentStr:'#045A4A', price:800,  rarity:'epic'},
    {id:'void',    name:'Void',    hexStr:'#220044', accentStr:'#6A22CC', price:1000, rarity:'legendary'},
    {id:'solar',   name:'Solar',   hexStr:'#FFCC00', accentStr:'#7A5200', price:700,  rarity:'rare'},
  ],
  cluster:[
    {id:'default', name:'Default', hexStr:'#303030', accentStr:'#1A1A1E', price:0},
    {id:'hazard',  name:'Hazard',  hexStr:'#FF6600', accentStr:'#16161A', price:600,  rarity:'rare'},
    {id:'olive',   name:'Olive',   hexStr:'#4A5A1A', accentStr:'#23290D', price:500,  rarity:'uncommon'},
    {id:'inferno', name:'Inferno', hexStr:'#CC2200', accentStr:'#2A0A04', price:900,  rarity:'epic'},
  ],
  shock:[
    {id:'default', name:'Default', hexStr:'#303030', accentStr:'#1A1A1E', price:0},
    {id:'violet',  name:'Violet',  hexStr:'#8833FF', accentStr:'#2A0A5A', price:700,  rarity:'rare'},
    {id:'thunder', name:'Thunder', hexStr:'#FFFF00', accentStr:'#2A2A04', price:800,  rarity:'epic'},
    {id:'ghost',   name:'Ghost',   hexStr:'#CCCCFF', accentStr:'#5A5A8A', price:600,  rarity:'uncommon'},
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
  // RAILGUN CAMOS — daily
  {id:'shop_camo_rail_plasma',name:'Plasma Railgun',      itemType:'Railgun Camo',     section:'daily', rewardType:'weaponCamo', weaponId:'railgun',     camoId:'plasma',  rarity:'epic',      price:800, isNew:true},
  {id:'shop_camo_rail_void',  name:'Void Railgun',        itemType:'Railgun Camo',     section:'daily', rewardType:'weaponCamo', weaponId:'railgun',     camoId:'void',    rarity:'legendary', price:1000},
  {id:'shop_camo_rail_solar', name:'Solar Railgun',       itemType:'Railgun Camo',     section:'daily', rewardType:'weaponCamo', weaponId:'railgun',     camoId:'solar',   rarity:'rare',      price:700},
  // CLUSTER CAMOS — daily
  {id:'shop_camo_clus_hazard',name:'Hazard Cluster',      itemType:'Cluster Camo',     section:'daily', rewardType:'weaponCamo', weaponId:'cluster',     camoId:'hazard',  rarity:'rare',      price:600},
  {id:'shop_camo_clus_olive', name:'Olive Cluster',       itemType:'Cluster Camo',     section:'daily', rewardType:'weaponCamo', weaponId:'cluster',     camoId:'olive',   rarity:'uncommon',  price:500},
  {id:'shop_camo_clus_inf',   name:'Inferno Cluster',     itemType:'Cluster Camo',     section:'daily', rewardType:'weaponCamo', weaponId:'cluster',     camoId:'inferno', rarity:'epic',      price:900, isNew:true},
  // SHOCK CAMOS — daily
  {id:'shop_camo_shk_violet', name:'Violet Shock',        itemType:'Shock Camo',       section:'daily', rewardType:'weaponCamo', weaponId:'shock',       camoId:'violet',  rarity:'rare',      price:700},
  {id:'shop_camo_shk_thunder',name:'Thunder Shock',       itemType:'Shock Camo',       section:'daily', rewardType:'weaponCamo', weaponId:'shock',       camoId:'thunder', rarity:'epic',      price:800, isNew:true},
  {id:'shop_camo_shk_ghost',  name:'Ghost Shock',         itemType:'Shock Camo',       section:'daily', rewardType:'weaponCamo', weaponId:'shock',       camoId:'ghost',   rarity:'uncommon',  price:600},
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
function _skinVisorColor(skinId){
  const s=RICHARD_SKINS.find(s=>s.id===skinId);
  return s?s.custo.visorColor:'#44CCFF';
}
function _skinTone(skinId){
  const s=RICHARD_SKINS.find(s=>s.id===skinId);
  return s&&s.custo.skinTone?s.custo.skinTone:'#E8C49A';
}
function _skinCharPreview(skinId){
  return`<canvas class="is2-skin-canvas" data-skin="${skinId}" width="110" height="160" style="display:block;width:110px;height:160px;"></canvas>`;
}
function _camoGunPreview(hex,accent){
  const acc=accent||'rgba(0,0,0,.55)';
  return`<div style="position:relative;width:130px;height:80px;margin:4px auto;">
    <div style="position:absolute;top:18px;left:4px;width:122px;height:14px;background:${hex};border-radius:3px 6px 6px 2px;box-shadow:0 0 12px ${hex}66,inset 0 2px 4px rgba(255,255,255,.15);"></div>
    <div style="position:absolute;top:10px;left:8px;width:30px;height:10px;background:${acc};border-radius:3px 3px 0 0;box-shadow:inset 0 2px 3px rgba(0,0,0,.4);"></div>
    <div style="position:absolute;top:8px;left:14px;width:18px;height:4px;background:rgba(0,0,0,.5);border-radius:1px;"></div>
    <div style="position:absolute;top:32px;left:50px;width:24px;height:22px;background:${acc};border-radius:2px 2px 5px 5px;box-shadow:inset 0 -3px 6px rgba(0,0,0,.5);"></div>
    <div style="position:absolute;top:32px;left:28px;width:18px;height:6px;background:${hex};opacity:.6;border-radius:1px;"></div>
    <div style="position:absolute;top:24px;right:2px;width:10px;height:8px;background:${acc};border-radius:0 4px 4px 0;"></div>
    <div style="position:absolute;top:26px;left:50%;margin-left:-22px;width:44px;height:2px;background:rgba(255,255,255,.18);border-radius:1px;"></div>
  </div>`;
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
//  SHOP 3D PREVIEW RENDERING
// ═══════════════════════════════════════════════════════════════
let _shopPrevRdr=null;

function _buildShopScene(){
  const sc=new THREE.Scene();
  sc.add(new THREE.AmbientLight(0xffffff,0.7));
  const dl=new THREE.DirectionalLight(0xffffff,0.9);dl.position.set(2,4,2);sc.add(dl);
  const dl2=new THREE.DirectionalLight(0x4488ff,0.3);dl2.position.set(-2,1,-3);sc.add(dl2);
  return sc;
}

function _renderShopPreviews(){
  if(typeof makeCharModel!=='function') return;
  const canvases=document.querySelectorAll('.is2-skin-canvas');
  if(!canvases.length) return;
  if(!_shopPrevRdr){
    const oc=document.createElement('canvas');
    oc.width=110;oc.height=160;
    _shopPrevRdr=new THREE.WebGLRenderer({canvas:oc,antialias:true,alpha:true});
    _shopPrevRdr.setSize(110,160,false);
    _shopPrevRdr.setClearColor(0x000000,0);
  }
  const sc=_buildShopScene();
  const cam=new THREE.PerspectiveCamera(42,110/160,0.1,50);
  cam.position.set(0,1.1,4.2);cam.lookAt(0,0.9,0);
  canvases.forEach(cv=>{
    const skin=RICHARD_SKINS.find(s=>s.id===cv.dataset.skin);
    if(!skin) return;
    const char=makeCharModel(skin.custo);
    char.rotation.y=0.4;
    sc.add(char);
    _shopPrevRdr.render(sc,cam);
    sc.remove(char);
    cv.getContext('2d').drawImage(_shopPrevRdr.domElement,0,0,110,160);
  });
}

let _shopModalRdr=null,_shopModalSc=null,_shopModalCam=null,_shopModalChar=null,_shopModalRaf=null,_shopModalT=0;

function _startShopModalPreview(skinId){
  if(typeof makeCharModel!=='function') return;
  const cv=document.getElementById('is2ModalCanvas');
  if(!cv) return;
  if(_shopModalRaf){cancelAnimationFrame(_shopModalRaf);_shopModalRaf=null;}
  const w=320,h=220;
  cv.width=w;cv.height=h;
  if(!_shopModalRdr){
    _shopModalRdr=new THREE.WebGLRenderer({canvas:cv,antialias:true,alpha:true});
    _shopModalSc=_buildShopScene();
    _shopModalCam=new THREE.PerspectiveCamera(42,w/h,0.1,50);
    _shopModalCam.position.set(0,1.1,3.8);_shopModalCam.lookAt(0,0.9,0);
  }
  _shopModalRdr.setSize(w,h,false);
  _shopModalCam.aspect=w/h;_shopModalCam.updateProjectionMatrix();
  if(_shopModalChar){_shopModalSc.remove(_shopModalChar);_shopModalChar=null;}
  const skin=RICHARD_SKINS.find(s=>s.id===skinId);
  if(skin){_shopModalChar=makeCharModel(skin.custo);_shopModalSc.add(_shopModalChar);}
  _shopModalT=0;
  (function _loop(){
    _shopModalT+=0.016;
    if(_shopModalChar) _shopModalChar.rotation.y=_shopModalT*0.6;
    _shopModalRdr.render(_shopModalSc,_shopModalCam);
    const m=document.getElementById('is2Modal');
    if(!m||m.style.display==='none'){_shopModalRaf=null;return;}
    _shopModalRaf=requestAnimationFrame(_loop);
  })();
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
  requestAnimationFrame(_renderShopPreviews);

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
      ${item.rewardType==='skin'?_skinCharPreview(item.id):_camoGunPreview(_camoHex(item))}
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
      prev.innerHTML=`<canvas id="is2ModalCanvas" style="display:block;width:100%;height:100%;background:linear-gradient(180deg,${col}44,${r.bg});"></canvas>`;
      requestAnimationFrame(()=>_startShopModalPreview(item.id));
    } else if(item.rewardType==='weaponCamo'){
      const hex=_camoHex(item);
      prev.innerHTML=`<div style="width:100%;height:100%;background:${r.bg};display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;">
        <div style="transform:scale(1.4);transform-origin:center center;">${_camoGunPreview(hex)}</div>
        <div style="font-size:.58em;font-family:var(--font-ui);letter-spacing:.12em;color:var(--text3);text-transform:uppercase;margin-top:12px;">${item.weaponId.toUpperCase()} CAMO</div>
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
  if(_shopModalRaf){cancelAnimationFrame(_shopModalRaf);_shopModalRaf=null;}
}

// ─────────────────────────────────────────────────────────────────
//  PURCHASE
// ─────────────────────────────────────────────────────────────────
async function buyShopItem(itemId){
  const item=SHOP_CATALOG.find(i=>i.id===itemId);
  if(!item) return;
  if((saveData.currency||0)<item.price){showNotif('Not enough credits!');return;}
  if(_isOwned(item)){showNotif('Already owned!');return;}

  // Build Firebase update with atomic arrayUnion — committed BEFORE local state changes
  if(_fbUser&&_fbDb){
    try{
      const upd={'saveData.currency': saveData.currency-item.price};
      if(item.rewardType==='skin'){
        upd['saveData.ownedSkins']=firebase.firestore.FieldValue.arrayUnion(item.id);
        upd['saveData.equippedSkin']=item.id;
        const sk=RICHARD_SKINS.find(s=>s.id===item.id);
        if(sk) upd['saveData.customization']=Object.assign({},saveData.customization,sk.custo);
      } else if(item.rewardType==='weaponCamo'){
        upd[`saveData.ownedWeaponCamos.${item.weaponId}`]=firebase.firestore.FieldValue.arrayUnion(item.camoId);
        upd[`saveData.equippedWeaponCamos.${item.weaponId}`]=item.camoId;
      }
      await _fbDb.collection('users').doc(_fbUser.uid).update(upd);
      console.log('[Shop] Purchase committed to Firebase:', item.id);
    }catch(e){
      console.warn('[Shop] Firebase write failed, saving locally:', e.message);
    }
  }

  // Update in-memory state
  saveData.currency-=item.price;
  if(item.rewardType==='skin'){
    if(!saveData.ownedSkins) saveData.ownedSkins=['richard_default'];
    if(!saveData.ownedSkins.includes(item.id)) saveData.ownedSkins.push(item.id);
    saveData.equippedSkin=item.id;
    const skin=RICHARD_SKINS.find(s=>s.id===item.id);
    if(skin) Object.assign(saveData.customization,skin.custo);
    if(typeof saveCustomizationToFirebase==='function') saveCustomizationToFirebase();
    if(typeof updateLobbyScene==='function') updateLobbyScene();
  } else if(item.rewardType==='weaponCamo'){
    if(!saveData.ownedWeaponCamos) saveData.ownedWeaponCamos={};
    if(!saveData.ownedWeaponCamos[item.weaponId]) saveData.ownedWeaponCamos[item.weaponId]=[];
    if(!saveData.ownedWeaponCamos[item.weaponId].includes(item.camoId))
      saveData.ownedWeaponCamos[item.weaponId].push(item.camoId);
    if(!saveData.equippedWeaponCamos) saveData.equippedWeaponCamos={};
    saveData.equippedWeaponCamos[item.weaponId]=item.camoId;
  }
  // Sync localStorage (Firebase already updated above)
  try{localStorage.setItem(SAVE_KEY,JSON.stringify(saveData));}catch(e){}
  if(typeof updateSaveUI==='function') updateSaveUI();
  showNotif(item.name+' purchased!');
  openShopModal(itemId);
  buildItemShop();
}

function equipWeaponCamo(weaponId,camoId){
  if(!saveData.equippedWeaponCamos) saveData.equippedWeaponCamos={};
  saveData.equippedWeaponCamos[weaponId]=camoId;
  saveSave();
  showNotif(camoId+' camo equipped!');
  if(typeof refreshWeaponMesh==='function'&&typeof gameActive!=='undefined'&&gameActive&&
     typeof currentWeapon!=='undefined'&&currentWeapon===weaponId) refreshWeaponMesh();
  if(typeof currentScreen!=='undefined'&&currentScreen==='lockerScreen') buildLockerScreen();
}

// ═══════════════════════════════════════════════════════════════
//  LOCKER — two-column layout + Three.js preview
// ═══════════════════════════════════════════════════════════════
let _lockerTab='skins';
let _lkrSel=null;
let _lkrRenderer=null,_lkrScene=null,_lkrCamera=null,_lkrChar=null,_lkrT=0,_lkrRafId=null;
let _lkrCamoWeapon='pistol';
let _lkrCamoSel=null;
const _LKR_WEAPON_LABELS={pistol:'PISTOL',launcher:'LAUNCHER',sniper:'SNIPER',smg:'SMG',shotgun:'SHOTGUN',railgun:'RAILGUN',cluster:'CLUSTER',shock:'SHOCK'};

function _initLkrRenderer(){
  const canvas=document.getElementById('lockerPreviewCanvas');
  if(!canvas) return;
  const area=canvas.parentElement;
  const w=area?area.clientWidth||340:340;
  const h=area?area.clientHeight||500:500;
  if(!_lkrRenderer){
    _lkrRenderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true});
    _lkrScene=new THREE.Scene();
    _lkrCamera=new THREE.PerspectiveCamera(42,w/h,0.1,50);
    _lkrCamera.position.set(0,1.1,4.2);
    _lkrCamera.lookAt(0,0.9,0);
    _lkrScene.add(new THREE.AmbientLight(0xffffff,0.65));
    const dl=new THREE.DirectionalLight(0xffffff,0.9);dl.position.set(2,4,2);_lkrScene.add(dl);
    const dl2=new THREE.DirectionalLight(0x4488ff,0.3);dl2.position.set(-2,1,-3);_lkrScene.add(dl2);
  }
  if(w>0&&h>0){
    _lkrRenderer.setSize(w,h,false);
    _lkrCamera.aspect=w/h;
    _lkrCamera.updateProjectionMatrix();
  }
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
  if(_lockerTab==='camos'){
    if(!_lkrCamoSel) return;
    const owned=(saveData.ownedWeaponCamos||{})[_lkrCamoWeapon]||[];
    if(_lkrCamoSel!=='default'&&!owned.includes(_lkrCamoSel)) return;
    equipWeaponCamo(_lkrCamoWeapon,_lkrCamoSel);
  } else {
    if(!_lkrSel) return;
    equipSkin(_lkrSel.id);
  }
}

function _lkrSetCamoWeapon(wid){
  _lkrCamoWeapon=wid;
  _lkrCamoSel=null;
  buildLockerScreen();
}
function _lkrCamoPvUpdate(camoId){
  const pv=document.getElementById('lkrCamoPv');
  const btn=document.getElementById('lkrEquipBtn');
  const nameEl=document.getElementById('lkrInfoName');
  const subEl=document.getElementById('lkrInfoSub');
  const rarEl=document.getElementById('lkrInfoRarity');
  const camos=WEAPON_CAMOS[_lkrCamoWeapon]||[];
  const cm=camos.find(c=>c.id===camoId);
  if(!cm) return;
  const owned=(saveData.ownedWeaponCamos||{})[_lkrCamoWeapon]||[];
  const locked=cm.id!=='default'&&!owned.includes(cm.id);
  const curEq=(saveData.equippedWeaponCamos||{})[_lkrCamoWeapon]||'default';
  const equipped=curEq===cm.id;
  if(nameEl) nameEl.textContent=cm.name;
  if(subEl) subEl.textContent=(_LKR_WEAPON_LABELS[_lkrCamoWeapon]||_lkrCamoWeapon)+' CAMO'+(locked?' — NOT OWNED':'');
  if(rarEl){const rc=_rarity(cm.rarity||'common');rarEl.textContent=rc.label;rarEl.style.color=rc.color;}
  if(btn){btn.textContent=equipped?'EQUIPPED':locked?'LOCKED':'EQUIP';btn.disabled=equipped||locked;}
  if(pv) pv.innerHTML=`<div class="lkr-cpv-gun">${_camoGunPreview(cm.hexStr||'#303030',cm.accentStr)}</div><div class="lkr-cpv-swatch" style="background:linear-gradient(135deg,${cm.hexStr||'#303030'} 55%,${cm.accentStr||'#1A1A1E'} 55%);box-shadow:0 0 18px ${cm.hexStr||'#303030'}88;"></div>`;
}
function _lkrSelectCamo(camoId,el){
  _lkrCamoSel=camoId;
  document.querySelectorAll('.lkr-camo-tile').forEach(t=>t.classList.remove('lkr-camo-selected'));
  if(el) el.classList.add('lkr-camo-selected');
  _lkrCamoPvUpdate(camoId);
}

function buildLockerScreen(tab){
  if(tab) _lockerTab=tab;
  // Defer init to next frame so screen is visible and has real dimensions
  requestAnimationFrame(()=>{
    _initLkrRenderer();
    _lkrStartLoop();
    _lkrShowChar(saveData.customization||{});
  });
  const ts=document.getElementById('lkrTabSkins');
  const tc=document.getElementById('lkrTabCamos');
  if(ts) ts.className='lkr-cat-tab'+(_lockerTab==='skins'?' lkr-cat-active':'');
  if(tc) tc.className='lkr-cat-tab'+(_lockerTab==='camos'?' lkr-cat-active':'');
  const grid=document.getElementById('lockerGrid');
  if(!grid) return;
  grid.innerHTML='';
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
    const cvs=document.getElementById('lockerPreviewCanvas');
    const pv=document.getElementById('lkrCamoPv');
    if(cvs) cvs.style.display='';
    if(pv) pv.style.display='none';
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
      const vc=sk.custo.visorColor||'#44CCFF';
      div.innerHTML=`<div class="lkr-item-preview" style="background:linear-gradient(180deg,${col}28 0%,${col}06 100%);">
        <div class="lkr-char-mini">
          <div class="lkr-cm-head" style="background:${col};border-bottom:2px solid ${vc};box-shadow:0 0 6px ${vc}55;"></div>
          <div class="lkr-cm-body" style="background:${col};box-shadow:inset 0 -3px 6px rgba(0,0,0,.4);"></div>
          <div class="lkr-cm-legs" style="background:${col};opacity:.75;"></div>
        </div>
      </div>
      ${isEq?'<div class="lkr-item-eq-badge">ON</div>':''}
      <div class="lkr-rarity-bar" style="background:${_rarity(sk.rarity||'uncommon').color};"></div>
      <div class="lkr-item-footer">${sk.name}</div>`;
      div.onclick=()=>_lkrSelectItem(item,div);
      grid.appendChild(div);
    });
  } else {
    const cvs=document.getElementById('lockerPreviewCanvas');
    const pv=document.getElementById('lkrCamoPv');
    if(cvs) cvs.style.display='none';
    if(pv) pv.style.display='flex';
    // Weapon filter bar
    const wfRow=document.createElement('div');
    wfRow.className='lkr-wf-row';
    const weaponOrder=['pistol','launcher','shotgun','sniper','smg','railgun','cluster','shock'];
    weaponOrder.forEach(wid=>{
      const b=document.createElement('button');
      b.className='lkr-wf-btn'+(wid===_lkrCamoWeapon?' lkr-wf-active':'');
      b.textContent=_LKR_WEAPON_LABELS[wid]||wid.toUpperCase();
      b.onclick=()=>_lkrSetCamoWeapon(wid);
      wfRow.appendChild(b);
    });
    grid.appendChild(wfRow);
    // Camo tiles for selected weapon — ALL camos shown, locked ones dimmed
    const camos=WEAPON_CAMOS[_lkrCamoWeapon]||[];
    const ownedList=(saveData.ownedWeaponCamos||{})[_lkrCamoWeapon]||[];
    const equippedId=(saveData.equippedWeaponCamos||{})[_lkrCamoWeapon]||'default';
    const inner=document.createElement('div');
    inner.className='lkr-camo-grid-inner';
    camos.forEach(cm=>{
      const locked=cm.id!=='default'&&!ownedList.includes(cm.id);
      const equipped=equippedId===cm.id;
      const tile=document.createElement('div');
      tile.className='lkr-camo-tile'+(equipped?' lkr-camo-equipped':'')+(locked?' lkr-camo-locked':' lkr-camo-owned');
      tile.innerHTML=`<div class="lkr-camo-swatch" style="background:linear-gradient(135deg,${cm.hexStr||'#303030'} 55%,${cm.accentStr||'#1A1A1E'} 55%);${locked?'filter:grayscale(.7) brightness(.45);':''}"></div>
        <div class="lkr-camo-name">${cm.name}</div>
        <div class="lkr-camo-rar" style="color:${locked?'#555':_rarity(cm.rarity||'common').color}">${_rarity(cm.rarity||'common').label}</div>
        ${equipped?'<div class="lkr-camo-eq-badge">ON</div>':''}
        ${locked?'<div class="lkr-camo-lock-ico">🔒</div>':''}`;
      if(!locked) tile.onclick=()=>_lkrSelectCamo(cm.id,tile);
      inner.appendChild(tile);
    });
    grid.appendChild(inner);
    // Auto-select equipped camo (or keep prior selection if still valid)
    const autoId=(_lkrCamoSel&&camos.find(c=>c.id===_lkrCamoSel))?_lkrCamoSel:equippedId;
    _lkrCamoSel=autoId;
    const tiles=inner.querySelectorAll('.lkr-camo-tile');
    camos.forEach((cm,i)=>{if(cm.id===autoId&&tiles[i]) tiles[i].classList.add('lkr-camo-selected');});
    _lkrCamoPvUpdate(autoId);
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
  {tier:3,  label:'200 CR + 100 Shards', icon:'💰', credits:200, chronoShards:100},
  {tier:4,  label:'Flashbang ×2',       icon:'💥'},
  {tier:5,  label:'Arctic',             icon:'🪖', skin:'richard_arctic'},
  {tier:6,  label:'300 CR',             icon:'💰', credits:300},
  {tier:7,  label:'Desert Storm + 1 Ticket', icon:'🪖', skin:'richard_desert', summonTickets:1},
  {tier:8,  label:'400 CR',             icon:'💰', credits:400},
  {tier:9,  label:'The Medic',          icon:'🪖', skin:'richard_medic'},
  {tier:10, label:'500 CR',             icon:'💰', credits:500},
  {tier:11, label:'Veteran',            icon:'🪖', skin:'richard_veteran'},
  {tier:12, label:'600 CR + 200 Shards',icon:'💰', credits:600, chronoShards:200},
  {tier:13, label:'Commander',          icon:'🪖', skin:'richard_commander'},
  {tier:14, label:'700 CR',             icon:'💰', credits:700},
  {tier:15, label:'Neon',               icon:'🪖', skin:'richard_neon'},
  {tier:16, label:'800 CR',             icon:'💰', credits:800},
  {tier:17, label:'Blizzard',           icon:'🪖', skin:'richard_blizzard'},
  {tier:18, label:'900 CR + Featured Ticket', icon:'💰', credits:900, featuredTickets:1},
  {tier:19, label:'Sunset',             icon:'🪖', skin:'richard_sunset'},
  {tier:20, label:'1000 CR',            icon:'💰', credits:1000},
  {tier:21, label:'Shadow',             icon:'🪖', skin:'richard_shadow'},
  {tier:22, label:'1100 CR',            icon:'💰', credits:1100},
  {tier:23, label:'Phantom',            icon:'🪖', skin:'richard_phantom'},
  {tier:24, label:'1200 CR + 3 Tickets',icon:'💰', credits:1200, summonTickets:3},
  {tier:25, label:'THE RICHARD + 5 Featured', icon:'🏆', skin:'richard_gold', featuredTickets:5},
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
      }
      if(!saveData.summonCurrency) saveData.summonCurrency={chronoShards:0,summonTickets:0,featuredTickets:0};
      if(t.chronoShards){saveData.summonCurrency.chronoShards=(saveData.summonCurrency.chronoShards||0)+t.chronoShards;showNotif('BP Tier '+t.tier+': +'+t.chronoShards+' Chrono Shards!');}
      if(t.summonTickets){saveData.summonCurrency.summonTickets=(saveData.summonCurrency.summonTickets||0)+t.summonTickets;showNotif('BP Tier '+t.tier+': +'+t.summonTickets+' Summon Ticket(s)!');}
      if(t.featuredTickets){saveData.summonCurrency.featuredTickets=(saveData.summonCurrency.featuredTickets||0)+t.featuredTickets;showNotif('BP Tier '+t.tier+': +'+t.featuredTickets+' Featured Ticket(s)!');}
      // Atomic Firebase write for BP rewards
      if(_fbUser&&_fbDb){
        const _bpUpd={'saveData.bpClaimedTiers':firebase.firestore.FieldValue.arrayUnion(t.tier)};
        if(t.skin) _bpUpd['saveData.ownedSkins']=firebase.firestore.FieldValue.arrayUnion(t.skin);
        if(t.credits) _bpUpd['saveData.currency']=firebase.firestore.FieldValue.increment(t.credits);
        if(t.chronoShards) _bpUpd['saveData.summonCurrency.chronoShards']=firebase.firestore.FieldValue.increment(t.chronoShards);
        if(t.summonTickets) _bpUpd['saveData.summonCurrency.summonTickets']=firebase.firestore.FieldValue.increment(t.summonTickets);
        if(t.featuredTickets) _bpUpd['saveData.summonCurrency.featuredTickets']=firebase.firestore.FieldValue.increment(t.featuredTickets);
        _fbDb.collection('users').doc(_fbUser.uid).update(_bpUpd).catch(e=>console.warn('[BP] Firebase write failed:',e.message));
      }
      if(t.skin) showNotif('BP Tier '+t.tier+': '+t.label+' unlocked!');
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
