// ═══════════════════════════════════════════════════════════════
//  GACHA / SUMMON SYSTEM  —  v3 with 3D previews + cinematic
// ═══════════════════════════════════════════════════════════════

// ── Skin pool (with custo configs for 3D rendering) ──────────
const GACHA_SKIN_POOL=[
  {id:'richard_final_override',    name:'FINAL OVERRIDE RICHARD',    rarity:'mythic',    type:'skin'},
  {id:'richard_elite_interceptor', name:'ELITE INTERCEPTOR RICHARD', rarity:'mythic',    type:'skin'},
  {id:'richard_shadow_ops',        name:'SHADOW OPS RICHARD',        rarity:'legendary', type:'skin'},
  {id:'richard_gold_phantom',      name:'GOLD PHANTOM RICHARD',      rarity:'legendary', type:'skin'},
  {id:'richard_cyber_assault',     name:'CYBER ASSAULT RICHARD',     rarity:'legendary', type:'skin'},
  {id:'richard_arctic_storm',      name:'ARCTIC STORM RICHARD',      rarity:'epic',      type:'skin'},
  {id:'richard_neon_striker',      name:'NEON STRIKER RICHARD',      rarity:'epic',      type:'skin'},
  {id:'richard_urban_ghost',       name:'URBAN GHOST RICHARD',       rarity:'epic',      type:'skin'},
  {id:'richard_desert_hawk',       name:'DESERT HAWK RICHARD',       rarity:'rare',      type:'skin'},
  {id:'richard_forest_ranger',     name:'FOREST RANGER RICHARD',     rarity:'rare',      type:'skin'},
  {id:'richard_recon_blue',        name:'RECON BLUE RICHARD',        rarity:'uncommon',  type:'skin'},
  {id:'richard_basic_op',          name:'BASIC OPERATIVE RICHARD',   rarity:'common',    type:'skin'},
];

// Customisation configs for gacha-exclusive skins (used by 3D preview)
const _SG_SKIN_CUSTO={
  richard_final_override:    {outfitColor:'#1A0A1A',visorColor:'#FF2080',skinTone:'#E8C49A',armorStyle:'heavy',  helmet:true, backpack:'missile'},
  richard_elite_interceptor: {outfitColor:'#0A1A3A',visorColor:'#44CCFF',skinTone:'#E8C49A',armorStyle:'heavy',  helmet:true, backpack:'missile'},
  richard_shadow_ops:        {outfitColor:'#0A0A0A',visorColor:'#00FF88',skinTone:'#8A6A5A',armorStyle:'heavy',  helmet:true, backpack:'none'},
  richard_gold_phantom:      {outfitColor:'#AA7700',visorColor:'#FFEE00',skinTone:'#E8C49A',armorStyle:'heavy',  helmet:true, backpack:'missile'},
  richard_cyber_assault:     {outfitColor:'#1A0A30',visorColor:'#DD00FF',skinTone:'#E8C49A',armorStyle:'standard',helmet:true,backpack:'missile'},
  richard_arctic_storm:      {outfitColor:'#88AACC',visorColor:'#CCEEFF',skinTone:'#F0EEF8',armorStyle:'heavy',  helmet:true, backpack:'missile'},
  richard_neon_striker:      {outfitColor:'#0A0020',visorColor:'#FF00FF',skinTone:'#E8C49A',armorStyle:'standard',helmet:true,backpack:'none'},
  richard_urban_ghost:       {outfitColor:'#1A1A1A',visorColor:'#AAAAAA',skinTone:'#E8C49A',armorStyle:'light',  helmet:true, backpack:'none'},
  richard_desert_hawk:       {outfitColor:'#C8A874',visorColor:'#FFAA00',skinTone:'#C8A070',armorStyle:'light',  helmet:true, backpack:'none'},
  richard_forest_ranger:     {outfitColor:'#1A3A1A',visorColor:'#44AA22',skinTone:'#A87060',armorStyle:'light',  helmet:true, backpack:'none'},
  richard_recon_blue:        {outfitColor:'#1A2A5A',visorColor:'#4488FF',skinTone:'#E8C49A',armorStyle:'light',  helmet:true, backpack:'none'},
  richard_basic_op:          {outfitColor:'#2A2A2A',visorColor:'#8888AA',skinTone:'#E8C49A',armorStyle:'light',  helmet:false,backpack:'none'},
};

// Summon-exclusive expansion skins join the pool. Shop skins stay out —
// summon pool and shop catalog are separate inventories.
function _sgExtendPool(){
  if(typeof RICHARD_SKINS==='undefined') return;
  RICHARD_SKINS
    .filter(s=>s.id.startsWith('richard_rx_')&&s.source==='summon')
    .forEach(s=>{
      if(!GACHA_SKIN_POOL.find(p=>p.id===s.id))
        GACHA_SKIN_POOL.push({id:s.id,name:s.name.toUpperCase(),rarity:s.rarity,type:'skin'});
    });
}
_sgExtendPool();

function _sgSkinCusto(skinId){
  if(_SG_SKIN_CUSTO[skinId]) return _SG_SKIN_CUSTO[skinId];
  if(typeof RICHARD_SKINS!=='undefined'){
    const s=RICHARD_SKINS.find(s=>s.id===skinId);
    if(s) return s.custo;
  }
  return{outfitColor:'#1A3A8A',visorColor:'#44CCFF',skinTone:'#E8C49A',armorStyle:'light',helmet:true,backpack:'missile'};
}

// ── Animation profiles per rarity ─────────────────────────────
const _SG_ANIM_PROFILES={
  mythic:   {weapon:'FINAL OVERRIDE CANNON', missile:'RED CORE OMEGA',   map:'FINAL INTERCEPTION ZONE',skyColor:0x030308,groundColor:0x060608,buildColor:0x0C0C18,fogColor:0x0A0810,expCol:'#FF2080',flashCol:'#FF44FF',label:'MYTHIC',   special:true, richardVariant:'richard_final_override'},
  legendary:{weapon:'RAIL CANNON',           missile:'BLACKOUT MISSILE', map:'RED ALERT ZONE',          skyColor:0x1A0404,groundColor:0x200808,buildColor:0x2A1010,fogColor:0x1A0606,expCol:'#F07830',flashCol:'#FFB060',label:'LEGENDARY',special:false,richardVariant:'richard_elite_interceptor'},
  epic:     {weapon:'SNIPER LAUNCHER',       missile:'CLUSTER MISSILE',  map:'NIGHT CITY',              skyColor:0x050A14,groundColor:0x0A1018,buildColor:0x1A2230,fogColor:0x080E18,expCol:'#A855D8',flashCol:'#CC88FF',label:'EPIC',     special:false,richardVariant:'richard_cyber_assault'},
  rare:     {weapon:'STANDARD LAUNCHER',     missile:'ARMORED MISSILE',  map:'BEIRUT',                  skyColor:0x6B8FAD,groundColor:0xC8A870,buildColor:0xB09060,fogColor:0xB0987A,expCol:'#4A9FE8',flashCol:'#88CCFF',label:'RARE',     special:false,richardVariant:'richard_desert_hawk'},
  uncommon: {weapon:'SMG',                   missile:'STANDARD MISSILE', map:'DUBAI',                   skyColor:0x87CEEB,groundColor:0xD4B896,buildColor:0xC4A882,fogColor:0xD0C4A4,expCol:'#4ACFA8',flashCol:'#88FFDD',label:'UNCOMMON', special:false,richardVariant:'richard_recon_blue'},
  common:   {weapon:'PISTOL',                missile:'STANDARD MISSILE', map:'DUBAI',                   skyColor:0x87CEEB,groundColor:0xD4B896,buildColor:0xC4A882,fogColor:0xD0C4A4,expCol:'#8A9BA8',flashCol:'#AABBCC',label:'COMMON',   special:false,richardVariant:'richard_basic_op'},
};

// ── Independent animation variables ───────────────────────────
// Map, weapon, missile, sky, and Richard skin roll separately —
// rarity only controls the explosion/label/impact treatment.
const _SG_MAPS=[
  {map:'DUBAI',                  skyColor:0x87CEEB,groundColor:0xD4B896,buildColor:0xC4A882,fogColor:0xD0C4A4},
  {map:'BEIRUT',                 skyColor:0x6B8FAD,groundColor:0xC8A870,buildColor:0xB09060,fogColor:0xB0987A},
  {map:'SWEDEN',                 skyColor:0x9BB4C8,groundColor:0xC6D0D4,buildColor:0xAFA89A,fogColor:0xAABCC8},
  {map:'NIGHT CITY',             skyColor:0x050A14,groundColor:0x0A1018,buildColor:0x1A2230,fogColor:0x080E18},
  {map:'RED ALERT ZONE',         skyColor:0x1A0404,groundColor:0x200808,buildColor:0x2A1010,fogColor:0x1A0606},
  {map:'STORM FRONT',            skyColor:0x232B36,groundColor:0x2E3640,buildColor:0x3A4450,fogColor:0x2A323C},
  {map:'FINAL INTERCEPTION ZONE',skyColor:0x030308,groundColor:0x060608,buildColor:0x0C0C18,fogColor:0x0A0810},
];
const _SG_WEAPON_NAMES=['STANDARD LAUNCHER','SNIPER LAUNCHER','HEAVY LAUNCHER','RAIL CANNON','SHOCK PROJECTOR','FINAL OVERRIDE CANNON'];
const _SG_MISSILE_NAMES=['STANDARD MISSILE','ARMORED MISSILE','CLUSTER MISSILE','BLACKOUT MISSILE','RED CORE OMEGA'];
function _sgBuildAnimProfile(bestRarity){
  const base=_SG_ANIM_PROFILES[bestRarity]||_SG_ANIM_PROFILES.common;
  const pick=a=>a[Math.floor(Math.random()*a.length)];
  const m=pick(_SG_MAPS);
  const skinPool=GACHA_SKIN_POOL.map(s=>s.id);
  return Object.assign({},base,m,{
    weapon:pick(_SG_WEAPON_NAMES),
    missile:pick(_SG_MISSILE_NAMES),
    richardVariant:pick(skinPool),
  });
}

// ── Rarity helpers ────────────────────────────────────────────
function _rarityColor(r){
  return{mythic:'#FF2080',legendary:'#F07830',epic:'#A855D8',rare:'#4A9FE8',uncommon:'#4ACFA8',common:'#8A9BA8'}[r]||'#8A9BA8';
}
function _sgRollRarity(rates){
  const total=Object.values(rates).reduce((a,b)=>a+b,0);
  let r=Math.random()*total;
  for(const k of['mythic','legendary','epic','rare','uncommon','common']){r-=(rates[k]||0);if(r<=0)return k;}
  return'common';
}

// ── Banner definitions ────────────────────────────────────────
function _getGachaBanners(){
  return[
    {id:'normal',   name:'STANDARD INTEL',    subtitle:'BASIC CLEARANCE',           active:true,currency:'credits',        cost1:2500, cost10:20000,color:'#8A9BA8',normalOnly:true, description:'Standard equipment pool. Common to Legendary. No Mythic.'},
    {id:'standard', name:'INTERCEPTOR CACHE', subtitle:'STANDARD POOL',             active:true,currency:'chronoShards',   cost1:160,  cost10:1400, color:'#4A9FE8',description:'Full pool access. Pity at 10 / 50 / 120 pulls.'},
    {id:'featured', name:'ELITE OPERATIVE',   subtitle:'LIMITED — ENHANCED RATES',  active:true,currency:'summonTickets',  cost1:1,    cost10:10,   color:'#F07830',featured:true,description:'Boosted Legend/Mythic rates. 50/50 featured guarantee.'},
    {id:'weapon',   name:'ARMS CACHE',        subtitle:'WEAPON CAMOS ONLY',         active:true,currency:'chronoShards',   cost1:120,  cost10:1000, color:'#A855D8',description:'Exclusive weapon camos for all weapons.'},
    {id:'ultimate', name:'FINAL OVERRIDE',    subtitle:'MYTHIC GUARANTEED',         active:true,currency:'featuredTickets',cost1:1,    cost10:10,   color:'#FF2080',featured:true,description:'Every pull is MYTHIC. Final Override skins only.'},
  ];
}

// ── Currency helpers ──────────────────────────────────────────
function _sgCurVal(key){
  if(key==='credits') return saveData.currency||0;
  return(saveData.summonCurrency&&saveData.summonCurrency[key])||0;
}
function _sgCurFmt(key,val){
  const v=(val!==undefined)?val:_sgCurVal(key);
  if(key==='credits')        return v.toLocaleString()+' CR';
  if(key==='chronoShards')   return v.toLocaleString()+' ◈';
  if(key==='summonTickets')  return v+' TICKET'+(v!==1?'S':'');
  if(key==='featuredTickets')return v+' FEAT.'+(v!==1?'TICKETS':'TICKET');
  return String(v);
}
function _sgCanAfford(banner,count){
  return _sgCurVal(banner.currency)>=(count===10?(banner.cost10||banner.cost1*10):banner.cost1);
}
function _sgSpendCurrency(banner,count){
  const cost=count===10?(banner.cost10||banner.cost1*10):banner.cost1;
  if(banner.currency==='credits') saveData.currency=Math.max(0,(saveData.currency||0)-cost);
  else{
    if(!saveData.summonCurrency)saveData.summonCurrency={chronoShards:0,summonTickets:0,featuredTickets:0};
    saveData.summonCurrency[banner.currency]=Math.max(0,_sgCurVal(banner.currency)-cost);
  }
}

// ── Pools ─────────────────────────────────────────────────────
function _getSgCamoPool(){
  if(typeof WEAPON_CAMOS==='undefined') return[];
  const seq=['legendary','epic','rare','uncommon','common'];
  const pool=[];
  Object.entries(WEAPON_CAMOS).forEach(([weapon,camos])=>{
    (camos||[]).forEach((c,i)=>{
      if(c.source==='achievement') return; // achievement camos are exclusive
      pool.push({...c,weapon,type:'camo',rarity:c.rarity||seq[Math.min(i,4)]});
    });
  });
  return pool;
}
function _sgGetFullPool(banner){
  if(banner.id==='weapon') return _getSgCamoPool();
  if(banner.id==='ultimate') return GACHA_SKIN_POOL.filter(s=>s.rarity==='mythic');
  if(banner.id==='normal') return[...GACHA_SKIN_POOL.filter(s=>s.rarity!=='mythic'),..._getSgCamoPool().filter(c=>c.rarity!=='mythic')];
  return GACHA_SKIN_POOL;
}
function _sgGetFeaturedItems(banner){
  const owned=saveData.ownedSkins||[];
  if(banner.id==='ultimate') return GACHA_SKIN_POOL.filter(s=>s.rarity==='mythic').map(s=>({...s,owned:owned.includes(s.id),limited:true}));
  if(banner.id==='featured') return GACHA_SKIN_POOL.filter(s=>s.rarity==='legendary'||s.rarity==='mythic').slice(0,3).map(s=>({...s,owned:owned.includes(s.id),limited:true}));
  if(banner.id==='weapon')   return _getSgCamoPool().filter(c=>c.rarity==='legendary'||c.rarity==='epic').slice(0,3).map(c=>({...c,owned:((saveData.ownedWeaponCamos||{})[c.weapon]||[]).includes(c.id)}));
  return GACHA_SKIN_POOL.filter(s=>s.rarity==='legendary').slice(0,2).map(s=>({...s,owned:owned.includes(s.id)}));
}
function _gachaIsDupe(item){
  if(!item) return false;
  if(item.type==='skin'||!item.type) return(saveData.ownedSkins||[]).includes(item.id);
  if(item.type==='camo') return((saveData.ownedWeaponCamos||{})[item.weapon]||[]).includes(item.id);
  return false;
}

// ── Rates tables ──────────────────────────────────────────────
function _sgGetRates(banner){
  if(banner.id==='ultimate') return[{rarity:'mythic',label:'MYTHIC',pct:100}];
  if(banner.id==='normal')   return[{rarity:'legendary',label:'LEGENDARY',pct:1},{rarity:'epic',label:'EPIC',pct:6},{rarity:'rare',label:'RARE',pct:15},{rarity:'uncommon',label:'UNCOMMON',pct:28},{rarity:'common',label:'COMMON',pct:50}];
  if(banner.id==='featured') return[{rarity:'mythic',label:'MYTHIC',pct:5},{rarity:'legendary',label:'LEGENDARY',pct:10},{rarity:'epic',label:'EPIC',pct:25},{rarity:'rare',label:'RARE',pct:20},{rarity:'uncommon',label:'UNCOMMON',pct:20},{rarity:'common',label:'COMMON',pct:20}];
  if(banner.id==='weapon')   return[{rarity:'mythic',label:'MYTHIC',pct:1},{rarity:'legendary',label:'LEGENDARY',pct:4},{rarity:'epic',label:'EPIC',pct:15},{rarity:'rare',label:'RARE',pct:25},{rarity:'uncommon',label:'UNCOMMON',pct:25},{rarity:'common',label:'COMMON',pct:30}];
  return[{rarity:'mythic',label:'MYTHIC',pct:2},{rarity:'legendary',label:'LEGENDARY',pct:6},{rarity:'epic',label:'EPIC',pct:12},{rarity:'rare',label:'RARE',pct:20},{rarity:'uncommon',label:'UNCOMMON',pct:25},{rarity:'common',label:'COMMON',pct:35}];
}

// ── Core roll ─────────────────────────────────────────────────
function _sgPickItem(bannerId,rarity){
  let pool;
  if(bannerId==='weapon'){ pool=_getSgCamoPool().filter(c=>c.rarity===rarity); if(!pool.length)pool=_getSgCamoPool(); }
  else if(bannerId==='ultimate'){ pool=GACHA_SKIN_POOL.filter(s=>s.rarity==='mythic'); if(!pool.length)pool=GACHA_SKIN_POOL; }
  else if(bannerId==='normal'){ pool=[...GACHA_SKIN_POOL,..._getSgCamoPool()].filter(i=>i.rarity===rarity&&i.rarity!=='mythic'); if(!pool.length)pool=GACHA_SKIN_POOL.filter(s=>s.rarity!=='mythic'); }
  else{ pool=GACHA_SKIN_POOL.filter(s=>s.rarity===rarity); if(!pool.length)pool=GACHA_SKIN_POOL; }
  return pool[Math.floor(Math.random()*pool.length)];
}

function _gachaRoll(bannerId,count){
  if(!saveData.gachaPity)saveData.gachaPity={};
  if(!saveData.gachaPity[bannerId])saveData.gachaPity[bannerId]={total:0,epicPity:0,legendaryPity:0,mythicPity:0,guaranteedFeatured:false};
  const pity=saveData.gachaPity[bannerId];
  const isNormal=bannerId==='normal',isUltimate=bannerId==='ultimate';
  const rates=_sgGetRates({id:bannerId}).reduce((o,r)=>{o[r.rarity]=r.pct;return o;},{});
  const results=[];
  for(let i=0;i<count;i++){
    pity.total++;pity.epicPity++;pity.legendaryPity++;
    if(!isNormal)pity.mythicPity++;
    let rarity;
    if(isUltimate){rarity='mythic';pity.mythicPity=0;pity.legendaryPity=0;pity.epicPity=0;}
    else if(!isNormal&&pity.mythicPity>=120){rarity='mythic';pity.mythicPity=0;pity.legendaryPity=0;pity.epicPity=0;}
    else if(pity.legendaryPity>=50){rarity='legendary';pity.legendaryPity=0;pity.epicPity=0;}
    else if(pity.epicPity>=10){rarity='epic';pity.epicPity=0;}
    else{
      rarity=_sgRollRarity(rates);
      if(rarity==='mythic'){pity.mythicPity=0;pity.legendaryPity=0;pity.epicPity=0;}
      else if(rarity==='legendary'){pity.legendaryPity=0;pity.epicPity=0;}
      else if(rarity==='epic')pity.epicPity=0;
    }
    if(isNormal&&rarity==='mythic')rarity='legendary';
    const item=_sgPickItem(bannerId,rarity);
    const isDupe=_gachaIsDupe(item);
    if(isDupe)saveData.dupeFragments=(saveData.dupeFragments||0)+5;
    results.push({...item,isDupe,isNew:!isDupe,bannerId,date:new Date().toISOString().slice(0,10)});
  }
  return results;
}

async function _gachaApplyResults(results,bannerId){
  for(const res of results){
    if(!res.isDupe){
      if(res.type==='skin'||!res.type){
        if(!saveData.ownedSkins)saveData.ownedSkins=['richard_default'];
        if(!saveData.ownedSkins.includes(res.id))saveData.ownedSkins.push(res.id);
      }else if(res.type==='camo'&&res.weapon){
        if(!saveData.ownedWeaponCamos)saveData.ownedWeaponCamos={};
        if(!Array.isArray(saveData.ownedWeaponCamos[res.weapon]))saveData.ownedWeaponCamos[res.weapon]=[];
        if(!saveData.ownedWeaponCamos[res.weapon].includes(res.id))saveData.ownedWeaponCamos[res.weapon].push(res.id);
      }
    }
  }
  if(!Array.isArray(saveData.gachaHistory))saveData.gachaHistory=[];
  saveData.gachaHistory.push(...results.map(r=>({name:r.name,rarity:r.rarity,type:r.type,bannerId,date:r.date})));
  if(saveData.gachaHistory.length>200)saveData.gachaHistory=saveData.gachaHistory.slice(-200);
  saveSave();
  if(typeof _fbUser!=='undefined'&&_fbUser&&typeof _fbDb!=='undefined'&&_fbDb){
    try{
      const upd={[`saveData.gachaPity.${bannerId}`]:saveData.gachaPity[bannerId],'saveData.gachaHistory':saveData.gachaHistory.slice(-50),'saveData.dupeFragments':saveData.dupeFragments||0};
      const newSkins=results.filter(r=>!r.isDupe&&(r.type==='skin'||!r.type));
      if(newSkins.length)upd['saveData.ownedSkins']=firebase.firestore.FieldValue.arrayUnion(...newSkins.map(s=>s.id));
      const newCamos=results.filter(r=>!r.isDupe&&r.type==='camo');
      for(const w of[...new Set(newCamos.map(c=>c.weapon))]){
        upd[`saveData.ownedWeaponCamos.${w}`]=firebase.firestore.FieldValue.arrayUnion(...newCamos.filter(c=>c.weapon===w).map(c=>c.id));
      }
      await _fbDb.collection('users').doc(_fbUser.uid).update(upd).catch(()=>{});
    }catch(e){}
  }
}

function _gachaEarnShards(amount){
  if(!saveData.summonCurrency)saveData.summonCurrency={chronoShards:0,summonTickets:0,featuredTickets:0};
  saveData.summonCurrency.chronoShards=(saveData.summonCurrency.chronoShards||0)+amount;
  saveSave();
}

// ── Currencies bar ────────────────────────────────────────────
function _sgUpdateCurrencies(){
  const el=document.getElementById('sgCurrencies');if(!el)return;
  const sc=saveData.summonCurrency||{};
  el.innerHTML=`
    <div class="sg-cur-chip"><span class="sg-cur-icon">💰</span><span class="sg-cur-val">${(saveData.currency||0).toLocaleString()}</span></div>
    <div class="sg-cur-chip sg-cur-shards"><span class="sg-cur-icon">◈</span><span class="sg-cur-val">${(sc.chronoShards||0).toLocaleString()}</span></div>
    <div class="sg-cur-chip sg-cur-ticket"><span class="sg-cur-icon">🎫</span><span class="sg-cur-val">${sc.summonTickets||0}</span></div>
    <div class="sg-cur-chip sg-cur-featured"><span class="sg-cur-icon">⭐</span><span class="sg-cur-val">${sc.featuredTickets||0}</span></div>
    <div class="sg-cur-chip sg-cur-frags"><span class="sg-cur-icon">◇</span><span class="sg-cur-val">${saveData.dupeFragments||0}</span></div>`;
}

// ══════════════════════════════════════════════════════════════
//  3D PREVIEW SYSTEM
//  One offscreen renderer (like _shopPrevRdr). Render once, copy
//  via drawImage. For animated previews: rAF loop copies each frame.
// ══════════════════════════════════════════════════════════════
let _sgPvRdr=null, _sgPvRaf=null;

function _sgGetPvRenderer(){
  if(_sgPvRdr) return _sgPvRdr;
  if(typeof THREE==='undefined') return null;
  try{
    const oc=document.createElement('canvas');
    oc.width=300;oc.height=400;
    _sgPvRdr=new THREE.WebGLRenderer({canvas:oc,antialias:true,alpha:true});
    _sgPvRdr.setSize(300,400,false);
    _sgPvRdr.setClearColor(0x000000,0);
    return _sgPvRdr;
  }catch(e){return null;}
}

function _sgMakePvScene(){
  const sc=new THREE.Scene();
  sc.add(new THREE.AmbientLight(0xffffff,0.75));
  const dl=new THREE.DirectionalLight(0xffffff,1.0);dl.position.set(2,4,2);sc.add(dl);
  const dl2=new THREE.DirectionalLight(0x4488ff,0.35);dl2.position.set(-2,1,-3);sc.add(dl2);
  return sc;
}

// Stop any running preview animation
function _sgStopPvAnim(){
  if(_sgPvRaf){cancelAnimationFrame(_sgPvRaf);_sgPvRaf=null;}
}

// Render a Richard skin to a canvas element (animated rotating preview)
function _sgAnimateSkinToCanvas(canvas,skinId){
  if(typeof THREE==='undefined'||typeof makeCharModel==='undefined') return _sgFallbackCanvas(canvas,'#4A9FE8');
  const rdr=_sgGetPvRenderer();
  if(!rdr) return _sgFallbackCanvas(canvas,'#4A9FE8');
  _sgStopPvAnim();
  const w=canvas.width||240,h=canvas.height||320;
  rdr.setSize(w,h,false);
  const sc=_sgMakePvScene();
  const cam=new THREE.PerspectiveCamera(42,w/h,0.1,50);
  cam.position.set(0,1.1,4.0);cam.lookAt(0,0.9,0);
  const custo=_sgSkinCusto(skinId);
  let char;
  try{char=makeCharModel(custo);}catch(e){return _sgFallbackCanvas(canvas,_rarityColor('epic'));}
  sc.add(char);
  let t=0;
  function tick(){
    t+=0.016;char.rotation.y=t*0.7;
    rdr.render(sc,cam);
    const ctx=canvas.getContext('2d');
    if(ctx){ctx.clearRect(0,0,w,h);ctx.drawImage(rdr.domElement,0,0,w,h);}
    if(canvas.isConnected)_sgPvRaf=requestAnimationFrame(tick);
    else{_sgPvRaf=null;sc.remove(char);}
  }
  tick();
}

// Render a camo preview — reuses the proper two-tone gun silhouette
function _sgCamoPreviewHTML(camoHex,camoName,weaponName,accentHex){
  const gun=typeof _camoGunPreview==='function'
    ?_camoGunPreview(camoHex,accentHex)
    :`<div style="width:140px;height:46px;background:${camoHex};border-radius:4px;"></div>`;
  return`<div style="display:flex;flex-direction:column;align-items:center;gap:14px;padding:18px;">
    <div style="transform:scale(1.7);transform-origin:center;">${gun}</div>
    <div style="font-family:var(--font-ui);font-size:.8em;font-weight:800;letter-spacing:.16em;
      color:var(--text);text-transform:uppercase;text-align:center;margin-top:18px;">
      ${weaponName}<br><span style="color:${camoHex};font-size:1.15em;">${camoName}</span></div>
  </div>`;
}

// Fallback canvas — simple gradient with rarity color
function _sgFallbackCanvas(canvas,color){
  const ctx=canvas.getContext('2d');if(!ctx)return;
  const w=canvas.width,h=canvas.height;
  const grd=ctx.createRadialGradient(w/2,h*0.4,10,w/2,h/2,w*0.6);
  grd.addColorStop(0,color+'44');grd.addColorStop(1,'#050810');
  ctx.fillStyle=grd;ctx.fillRect(0,0,w,h);
  ctx.fillStyle=color+'88';ctx.font=`bold ${Math.floor(h*0.22)}px sans-serif`;
  ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('◈',w/2,h/2);
}

// Start 3D preview for a banner's featured item
function _sgStart3DPreview(banner){
  const canvas=document.getElementById('sgBvPv_'+banner.id);
  if(!canvas) return;
  const feats=_sgGetFeaturedItems(banner);
  const main=feats[0];
  if(!main){_sgFallbackCanvas(canvas,banner.color);return;}
  if(main.type==='skin'||!main.type){
    _sgAnimateSkinToCanvas(canvas,main.id);
  }else if(main.type==='camo'){
    _sgStopPvAnim();
    const wrap=document.getElementById('sgBvPvWrap_'+banner.id);
    if(wrap) wrap.innerHTML=_sgCamoPreviewHTML(main.hexStr||banner.color,main.name,(main.weapon||'').toUpperCase()+' CAMO',main.accentStr);
  }else{
    _sgFallbackCanvas(canvas,banner.color);
  }
}

// ── Particles ─────────────────────────────────────────────────
function _sgSpawnParticles(banner){
  const el=document.getElementById('sgPart_'+banner.id);if(!el)return;
  el.innerHTML='';
  for(let i=0;i<14;i++){
    const p=document.createElement('div');p.className='sg-particle';
    p.style.cssText=`left:${Math.random()*100}%;top:${15+Math.random()*65}%;background:${banner.color};width:${2+Math.random()*4}px;height:${2+Math.random()*4}px;animation-delay:${Math.random()*4}s;animation-duration:${2+Math.random()*3}s;opacity:${0.35+Math.random()*0.45}`;
    el.appendChild(p);
  }
}

// ── Banner switcher ───────────────────────────────────────────
let _sgActiveBanner=null;

function _sgRenderSwitcher(banners){
  const el=document.getElementById('sgBannerSwitcher');if(!el)return;
  el.innerHTML=banners.map(b=>`<button class="sg-bsw-tab${b.id===_sgActiveBanner?' sg-bsw-active':''}" style="--bsw-color:${b.color}" onclick="sgSelectBanner('${b.id}')">${b.name}</button>`).join('');
}
function sgSelectBanner(id){
  _sgStopPvAnim();
  _sgActiveBanner=id;
  const banners=_getGachaBanners();
  _sgRenderSwitcher(banners);
  const banner=banners.find(b=>b.id===id);
  if(banner)_sgRenderBannerBody(banner);
}

// ── Full-screen banner body ───────────────────────────────────
function _sgRenderBannerBody(banner){
  const el=document.getElementById('sgBannerBody');if(!el)return;
  _sgStopPvAnim();
  const pity=(saveData.gachaPity&&saveData.gachaPity[banner.id])||{total:0,epicPity:0,legendaryPity:0,mythicPity:0};
  const can1=_sgCanAfford(banner,1),can10=_sgCanAfford(banner,10);
  const feats=_sgGetFeaturedItems(banner);
  const mainFeat=feats[0];
  const isCamo=mainFeat&&mainFeat.type==='camo';

  el.innerHTML=`
    <div class="sg-bv-wrap" style="--bc:${banner.color}">
      <div class="sg-bv-art">
        <div class="sg-bv-glow" style="background:radial-gradient(ellipse at 50% 70%,${banner.color}28 0%,transparent 65%)"></div>
        <div class="sg-bv-particles" id="sgPart_${banner.id}"></div>
        <div class="sg-bv-preview-area" id="sgBvPvWrap_${banner.id}">
          ${isCamo
            ? _sgCamoPreviewHTML(mainFeat.hexStr||banner.color,mainFeat.name,mainFeat.weapon||'')
            : `<canvas class="sg-bv-3d-canvas" id="sgBvPv_${banner.id}" width="240" height="320"></canvas>`}
        </div>
        <div class="sg-bv-center">
          <div class="sg-bv-title" style="color:${banner.color}">${banner.name}</div>
          <div class="sg-bv-subtitle">${banner.subtitle}</div>
          <div class="sg-bv-desc">${banner.description}</div>
          <div class="sg-bv-feats">${feats.map(item=>`
            <div class="sg-bv-feat" style="border-color:${_rarityColor(item.rarity)}50">
              <div class="sg-bv-feat-rar" style="color:${_rarityColor(item.rarity)}">${item.rarity.toUpperCase()}</div>
              <div class="sg-bv-feat-name">${item.name}</div>
              ${item.owned?'<div class="sg-bv-feat-tag sg-bv-owned">OWNED</div>':item.limited?'<div class="sg-bv-feat-tag sg-bv-lim">LIMITED</div>':''}
            </div>`).join('')}
          </div>
        </div>
      </div>
      <div class="sg-bv-footer">
        <div class="sg-bv-pity">
          PULLS: <b>${pity.total||0}</b>&nbsp;·&nbsp;
          EPIC IN: <b>${10-(pity.epicPity||0)%10}</b>&nbsp;·&nbsp;
          LEGEND IN: <b>${50-(pity.legendaryPity||0)%50}</b>
          ${banner.id!=='normal'?`&nbsp;·&nbsp;MYTHIC IN: <b>${120-(pity.mythicPity||0)%120}</b>`:''}
        </div>
        <div class="sg-bv-actions">
          <button class="sg-bv-info-btn" onclick="sgOpenDetails('${banner.id}')">DETAILS</button>
          <button class="sg-bv-info-btn" onclick="sgOpenRates('${banner.id}')">RATES</button>
          <button class="sg-bv-info-btn" onclick="sgOpenHistory()">HISTORY</button>
        </div>
        <div class="sg-bv-summons">
          <button class="sg-bv-summon-btn${can1?'':' sg-bv-disabled'}" onclick="doSummon('${banner.id}',1)">
            <span class="sg-bv-s-label">SUMMON ×1</span>
            <span class="sg-bv-s-cost">${_sgCurFmt(banner.currency,banner.cost1)}</span>
          </button>
          <button class="sg-bv-summon-btn sg-bv-summon10${can10?'':' sg-bv-disabled'}" onclick="doSummon('${banner.id}',10)" style="--bc:${banner.color}">
            <span class="sg-bv-s-label">SUMMON ×10</span>
            <span class="sg-bv-s-cost">${_sgCurFmt(banner.currency,banner.cost10||banner.cost1*10)}</span>
          </button>
        </div>
        <div class="sg-bv-bal">Balance: ${_sgCurFmt(banner.currency)}</div>
      </div>
    </div>`;

  _sgSpawnParticles(banner);
  if(!isCamo) requestAnimationFrame(()=>_sgStart3DPreview(banner));
}

// ── Main entry ────────────────────────────────────────────────
function buildSummonScreen(){
  _sgUpdateCurrencies();
  const banners=_getGachaBanners();
  if(!banners.length){
    document.getElementById('sgBannerSwitcher').innerHTML='';
    document.getElementById('sgBannerBody').innerHTML='<div class="sg-empty">NO ACTIVE BANNERS</div>';
    return;
  }
  if(!_sgActiveBanner||!banners.find(b=>b.id===_sgActiveBanner))_sgActiveBanner=banners[0].id;
  _sgRenderSwitcher(banners);
  _sgRenderBannerBody(banners.find(b=>b.id===_sgActiveBanner));
}

// ── Details modal with 3D preview panel ──────────────────────
let _sgDetPvRaf=null;
function _sgStopDetPv(){if(_sgDetPvRaf){cancelAnimationFrame(_sgDetPvRaf);_sgDetPvRaf=null;}}

function _sgUpdateDetPreview(item){
  _sgStopDetPv();
  const canvas=document.getElementById('sgDetPvCanvas');
  if(!canvas) return;
  const label=document.getElementById('sgDetPvLabel');
  if(label) label.innerHTML=`<div class="sg-det-pv-name" style="color:${_rarityColor(item.rarity)}">${item.name}</div><div class="sg-det-pv-rar">${item.rarity.toUpperCase()} · ${(item.type||'SKIN').toUpperCase()}</div>`;

  if(item.type==='skin'||!item.type){
    if(typeof THREE==='undefined'||typeof makeCharModel==='undefined'){_sgFallbackCanvas(canvas,_rarityColor(item.rarity));return;}
    const rdr=_sgGetPvRenderer();if(!rdr){_sgFallbackCanvas(canvas,_rarityColor(item.rarity));return;}
    const w=canvas.width||280,h=canvas.height||340;
    rdr.setSize(w,h,false);
    const sc=_sgMakePvScene();
    const cam=new THREE.PerspectiveCamera(42,w/h,0.1,50);
    cam.position.set(0,1.1,3.8);cam.lookAt(0,0.9,0);
    const custo=_sgSkinCusto(item.id);
    let char;try{char=makeCharModel(custo);}catch(e){_sgFallbackCanvas(canvas,_rarityColor(item.rarity));return;}
    sc.add(char);
    let t=0;
    function loop(){t+=0.016;char.rotation.y=t*0.6;rdr.render(sc,cam);const ctx=canvas.getContext('2d');if(ctx)ctx.drawImage(rdr.domElement,0,0,w,h);if(canvas.isConnected)_sgDetPvRaf=requestAnimationFrame(loop);else{_sgDetPvRaf=null;sc.remove(char);}}
    loop();
  }else if(item.type==='camo'){
    const wrap=document.getElementById('sgDetPvWrap');
    if(wrap) wrap.innerHTML=_sgCamoPreviewHTML(item.hexStr||'#444',item.name,item.weapon||'');
  }else{
    _sgFallbackCanvas(canvas,_rarityColor(item.rarity));
  }
}

function sgOpenDetails(bannerId){
  const banner=_getGachaBanners().find(b=>b.id===bannerId);if(!banner)return;
  const pool=_sgGetFullPool(banner);
  const ownedS=saveData.ownedSkins||[];
  const ownedC=saveData.ownedWeaponCamos||{};
  const firstItem=pool[0];
  document.getElementById('sgDetailsInner').innerHTML=`
    <div class="sg-om-header">
      <div class="sg-om-title" style="color:${banner.color}">${banner.name}</div>
      <button class="sg-om-close" onclick="_sgStopDetPv();document.getElementById('sgDetailsModal').style.display='none'">✕</button>
    </div>
    <div class="sg-om-sub">${banner.subtitle} &nbsp;·&nbsp; ${_sgCurFmt(banner.currency,banner.cost1)} per pull</div>
    <div class="sg-det-two-col">
      <div class="sg-det-item-list">${pool.map((item,i)=>`
        <div class="sg-det-item${i===0?' sg-det-selected':''}" style="border-color:${_rarityColor(item.rarity)}44"
          onclick="document.querySelectorAll('.sg-det-item').forEach(e=>e.classList.remove('sg-det-selected'));this.classList.add('sg-det-selected');_sgUpdateDetPreview(${JSON.stringify({id:item.id,name:item.name,rarity:item.rarity,type:item.type,weapon:item.weapon,hexStr:item.hexStr}).replace(/"/g,'&quot;')})">
          <div class="sg-det-rar" style="color:${_rarityColor(item.rarity)}">${item.rarity.toUpperCase()}</div>
          <div class="sg-det-name">${item.name}</div>
          ${ownedS.includes(item.id)||(ownedC[item.weapon]||[]).includes(item.id)?'<div class="sg-det-badge sg-det-owned">OWNED</div>':''}
        </div>`).join('')}
      </div>
      <div class="sg-det-preview-panel">
        <div id="sgDetPvWrap"><canvas id="sgDetPvCanvas" class="sg-det-pv-canvas" width="240" height="320"></canvas></div>
        <div id="sgDetPvLabel" class="sg-det-pv-label"></div>
      </div>
    </div>`;
  document.getElementById('sgDetailsModal').style.display='flex';
  if(firstItem) requestAnimationFrame(()=>_sgUpdateDetPreview(firstItem));
}

function sgOpenRates(bannerId){
  const banner=_getGachaBanners().find(b=>b.id===bannerId);if(!banner)return;
  const rates=_sgGetRates(banner);
  document.getElementById('sgRatesInner').innerHTML=`
    <div class="sg-om-header">
      <div class="sg-om-title" style="color:${banner.color}">DROP RATES — ${banner.name}</div>
      <button class="sg-om-close" onclick="document.getElementById('sgRatesModal').style.display='none'">✕</button>
    </div>
    <div class="sg-rates-wrap" style="max-width:440px;margin:0 auto">${rates.map(r=>`
      <div class="sg-rates-row">
        <div class="sg-rates-rar" style="color:${_rarityColor(r.rarity)}">${r.label}</div>
        <div class="sg-rates-bar-wrap"><div class="sg-rates-bar" style="width:${r.pct}%;background:${_rarityColor(r.rarity)}"></div></div>
        <div class="sg-rates-pct">${r.pct}%</div>
      </div>`).join('')}
      <div class="sg-rates-pity">Epic pity: 10 · Legend pity: 50 · Mythic pity: 120 (premium only)</div>
    </div>`;
  document.getElementById('sgRatesModal').style.display='flex';
}

function sgOpenHistory(){
  const hist=(saveData.gachaHistory||[]).slice().reverse().slice(0,60);
  document.getElementById('sgHistoryInner').innerHTML=`
    <div class="sg-om-header">
      <div class="sg-om-title">SUMMON HISTORY</div>
      <button class="sg-om-close" onclick="document.getElementById('sgHistoryModal').style.display='none'">✕</button>
    </div>
    ${hist.length?`<div class="sg-hist-list">${hist.map(h=>`
      <div class="sg-hist-row" style="border-color:${_rarityColor(h.rarity)}">
        <div class="sg-hist-name" style="color:${_rarityColor(h.rarity)}">${h.name}</div>
        <div class="sg-hist-meta">${h.bannerId||''}</div>
        <div class="sg-hist-date">${h.date||''}</div>
      </div>`).join('')}</div>`:'<div class="sg-empty">No summon history yet.</div>'}`;
  document.getElementById('sgHistoryModal').style.display='flex';
}

// ══════════════════════════════════════════════════════════════
//  3D CINEMATIC SUMMON ANIMATION
// ══════════════════════════════════════════════════════════════

function _sgEaseInOut(t){const c=Math.max(0,Math.min(1,t));return c<0.5?2*c*c:-1+(4-2*c)*c;}
function _sgEaseIn(t){const c=Math.max(0,Math.min(1,t));return c*c;}
function _sgLerpAngle(a,b,t){let d=b-a;while(d>Math.PI)d-=Math.PI*2;while(d<-Math.PI)d+=Math.PI*2;return a+d*t;}

// Camera keyframes: [{t, pos:[x,y,z], look:[x,y,z]}]
const _SG_CAM_PATH=[
  {t:0,    pos:[0,  18, 28],  look:[0, 5,  0]},
  {t:2.2,  pos:[12, 24, 12],  look:[4, 24,-5]},
  {t:4.2,  pos:[4,  2.5,7],   look:[0, 1.2,0]},
  {t:5.8,  pos:[-1.5,2.2,4],  look:[4, 22,-5]},
  {t:7.2,  pos:[1,  1.5,3.5], look:[3, 14,-4]},
  {t:8.5,  pos:[9,  8, 14],   look:[3, 14,-4]},
  {t:10.5, pos:[0,  6, 12],   look:[0, 2,  0]},
];

function _sgGetCamFrame(elapsed){
  const path=_SG_CAM_PATH;
  let a=path[0],b=path[1];
  for(let i=0;i<path.length-1;i++){
    if(elapsed>=path[i].t&&elapsed<=path[i+1].t){a=path[i];b=path[i+1];break;}
    if(i===path.length-2){a=path[i];b=path[i+1];}
  }
  const dur=b.t-a.t;
  const raw=dur>0?(elapsed-a.t)/dur:1;
  const f=_sgEaseInOut(raw);
  return{
    pos:[a.pos[0]+(b.pos[0]-a.pos[0])*f, a.pos[1]+(b.pos[1]-a.pos[1])*f, a.pos[2]+(b.pos[2]-a.pos[2])*f],
    look:[a.look[0]+(b.look[0]-a.look[0])*f, a.look[1]+(b.look[1]-a.look[1])*f, a.look[2]+(b.look[2]-a.look[2])*f],
  };
}

function _sgBuildCinematic3D(profile){
  if(typeof THREE==='undefined') return null;
  const sc=new THREE.Scene();
  sc.background=new THREE.Color(profile.skyColor||0x050A14);
  sc.fog=new THREE.Fog(profile.fogColor||0x080E18,25,90);

  // Lighting
  sc.add(new THREE.AmbientLight(0x445566,0.9));
  const sun=new THREE.DirectionalLight(0xFFEECC,1.3);sun.position.set(8,12,5);sc.add(sun);
  const rimLight=new THREE.PointLight(new THREE.Color(profile.expCol||'#4A9FE8'),0,20);
  rimLight.position.set(-4,3,0);sc.add(rimLight);

  // Ground
  const ground=new THREE.Mesh(
    new THREE.PlaneGeometry(200,200),
    new THREE.MeshLambertMaterial({color:profile.groundColor||0x1A1A1A})
  );
  ground.rotation.x=-Math.PI/2;sc.add(ground);

  // Platform for Richard
  const platform=new THREE.Mesh(
    new THREE.CylinderGeometry(1.8,1.8,0.25,16),
    new THREE.MeshLambertMaterial({color:0x334455})
  );
  platform.position.set(0,0.125,0);sc.add(platform);

  // Buildings
  const bMat=new THREE.MeshLambertMaterial({color:profile.buildColor||0x1A2230});
  const buildGroup=new THREE.Group();
  for(let i=0;i<18;i++){
    const w=1.5+Math.random()*3.5,h=5+Math.random()*22,d=1.5+Math.random()*3.5;
    const b=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),bMat);
    const angle=(i/18)*Math.PI*2;
    const dist=20+Math.random()*14;
    b.position.set(Math.cos(angle)*dist,h/2,Math.sin(angle)*dist-6);
    buildGroup.add(b);
  }
  sc.add(buildGroup);

  // Richard character
  let richardGroup=null;
  if(typeof makeCharModel==='function'){
    try{
      const custo=_sgSkinCusto(profile.richardVariant||'richard_basic_op');
      richardGroup=makeCharModel(custo);
      richardGroup.position.set(0,16,0); // starts airborne — drops in at stage 2
      sc.add(richardGroup);
    }catch(e){richardGroup=null;}
  }

  // Missile (cone + cylinder body)
  const missileGroup=new THREE.Group();
  const missileColor=profile.expCol||'#4A9FE8';
  const bodyMat=new THREE.MeshLambertMaterial({color:0x303840});
  const noseMat=new THREE.MeshLambertMaterial({color:new THREE.Color(missileColor),emissive:new THREE.Color(missileColor),emissiveIntensity:0.4});
  const mBody=new THREE.Mesh(new THREE.CylinderGeometry(0.15,0.15,1.8,8),bodyMat);
  const mNose=new THREE.Mesh(new THREE.ConeGeometry(0.15,0.5,8),noseMat);
  mNose.position.y=1.15;
  const mFin1=new THREE.Mesh(new THREE.BoxGeometry(0.05,0.5,0.4),bodyMat);mFin1.position.set(0.18,-0.7,0);
  const mFin2=new THREE.Mesh(new THREE.BoxGeometry(0.4,0.5,0.05),bodyMat);mFin2.position.set(0,-0.7,0.18);
  const missilePtLight=new THREE.PointLight(new THREE.Color(missileColor),1.0,5);missilePtLight.position.y=1.4;
  missileGroup.add(mBody,mNose,mFin1,mFin2,missilePtLight);
  missileGroup.position.set(4,42,-8);
  missileGroup.rotation.z=-0.22;
  sc.add(missileGroup);

  // Projectile (fired by Richard)
  const projGroup=new THREE.Group();
  const projColor=new THREE.Color(profile.expCol||'#4A9FE8');
  const projMesh=new THREE.Mesh(new THREE.SphereGeometry(0.14,8,8),new THREE.MeshBasicMaterial({color:projColor}));
  const projLight=new THREE.PointLight(projColor,2,5);
  projGroup.add(projMesh,projLight);
  projGroup.visible=false;
  sc.add(projGroup);

  // Explosion
  const expGroup=new THREE.Group();
  const expColor=new THREE.Color(profile.expCol||'#4A9FE8');
  const expCore=new THREE.Mesh(new THREE.SphereGeometry(0.4,16,16),new THREE.MeshBasicMaterial({color:expColor,transparent:true,opacity:0}));
  const expRing=new THREE.Mesh(new THREE.TorusGeometry(0.5,0.1,8,32),new THREE.MeshBasicMaterial({color:expColor,transparent:true,opacity:0}));
  const expRing2=new THREE.Mesh(new THREE.TorusGeometry(0.5,0.06,8,32),new THREE.MeshBasicMaterial({color:0xFFFFFF,transparent:true,opacity:0}));
  expRing2.rotation.x=Math.PI/2;
  const expLight=new THREE.PointLight(expColor,0,40);
  expGroup.add(expCore,expRing,expRing2,expLight);
  expGroup.position.set(3,20,-5);
  expGroup.visible=false;
  sc.add(expGroup);

  return{sc,rimLight,richardGroup,missileGroup,projGroup,expGroup,expCore,expRing,expRing2,expLight};
}

function _sgPlayAnimation(profile,results,variant){
  return new Promise(resolve=>{
    const overlay=document.getElementById('sgSummonOverlay');
    overlay.innerHTML='';overlay.style.display='flex';
    let skipped=false;

    // Three.js canvas
    const W=Math.min(overlay.clientWidth||window.innerWidth,1280);
    const H=Math.min(overlay.clientHeight||window.innerHeight,900);
    const canvas=document.createElement('canvas');
    canvas.width=W;canvas.height=H;
    canvas.style.cssText='position:absolute;inset:0;width:100%;height:100%;display:block;';
    overlay.appendChild(canvas);

    // Skip button
    const skipBtn=document.createElement('button');
    skipBtn.className='sg-skip-btn';skipBtn.style.cssText+='pointer-events:all;';
    skipBtn.textContent='SKIP ▶▶';skipBtn.onclick=()=>{skipped=true;};
    overlay.appendChild(skipBtn);

    // Stage label overlay
    const stageLabel=document.createElement('div');
    stageLabel.className='sg-cin-stage-label';
    overlay.appendChild(stageLabel);

    // Lock-on reticle — tracks the missile's screen position
    const lockRet=document.createElement('div');
    lockRet.className='sg-lock-reticle';
    lockRet.style.display='none';
    lockRet.innerHTML=`<div class="sg-lr-c sg-lr-tl"></div><div class="sg-lr-c sg-lr-tr"></div>
      <div class="sg-lr-c sg-lr-bl"></div><div class="sg-lr-c sg-lr-br"></div>
      <div class="sg-lr-txt">TRACKING</div>`;
    overlay.appendChild(lockRet);

    // Try to init Three.js renderer
    let renderer=null,rafId=null;
    let cinObjects=null;
    try{
      renderer=new THREE.WebGLRenderer({canvas,antialias:true});
      renderer.setSize(W,H,false);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio,1.5));
      cinObjects=_sgBuildCinematic3D(profile);
    }catch(e){
      // WebGL unavailable — fall back to CSS animation
      _sgCssFallbackAnim(overlay,profile,results,resolve);
      return;
    }
    if(!cinObjects){_sgCssFallbackAnim(overlay,profile,results,resolve);return;}

    const{sc,rimLight,richardGroup,missileGroup,projGroup,expGroup,expCore,expRing,expRing2,expLight}=cinObjects;
    const camera=new THREE.PerspectiveCamera(60,W/H,0.1,400);
    const camPos=new THREE.Vector3(0,18,28);
    const camLook=new THREE.Vector3(0,5,0);
    const tmpPos=new THREE.Vector3(),tmpLook=new THREE.Vector3();

    let elapsed=0,lastTime=-1;
    let projFired=false,projT=0,missileHit=false,expT=0;
    const PROJ_DUR=0.55;
    const missileStart=new THREE.Vector3(4,42,-8);
    const missileEnd=new THREE.Vector3(3,20,-5);
    const projTarget=missileEnd.clone();   // where the shot is aimed (moves after a clash)
    // Rarity tier flags drive slow-mo, orbit cam, debris count, shake
    const isMyth=!!profile.special;
    const isLeg=profile.label==='LEGENDARY';
    const isEpic=profile.label==='EPIC';
    let landed=false,landT=0;              // Richard drop-in state
    let clashed=false,reShotAt=0;          // high-rarity mid-air clash / second shot
    let labelOverride=null,labelOverrideUntil=0;
    // Featured-save variant state: shot misses, saver flies in
    let varPhase=0,varObjs=[],varT=0,varSpawnAt=0;
    let debris=[];
    function _spawnBurst(pos,colorHex,n,spread,up){
      const dm=new THREE.MeshLambertMaterial({color:new THREE.Color(colorHex),emissive:new THREE.Color(colorHex),emissiveIntensity:.8,transparent:true});
      for(let i=0;i<n;i++){
        const s2=.10+Math.random()*.28;
        const m=new THREE.Mesh(new THREE.BoxGeometry(s2,s2,s2),dm);
        m.position.copy(pos);
        sc.add(m);
        debris.push({m,vx:(Math.random()-.5)*spread,vy:Math.random()*up+2,vz:(Math.random()-.5)*spread,
          rx:Math.random()*6,rz:Math.random()*6});
      }
    }
    function _spawnImpactDebris(){
      _spawnBurst(projTarget,profile.expCol,isMyth?26:isLeg?18:isEpic?12:8,16,13);
    }

    const stageLabels=[
      {t:0,   text:'📍 '+profile.map},
      {t:2.0, text:'⚠ INCOMING — '+profile.missile},
      {t:3.1, text:'◆ RICHARD ON SITE'},
      {t:4.6, text:'◉ TRACKING TARGET'},
      {t:5.8, text:'◉ TARGET LOCKED'},
      {t:6.5, text:'⚡ '+profile.weapon+' CHARGING'},
      {t:7.2, text:'▶ INTERCEPTOR DEPLOYED'},
      {t:8.5, text:''},
    ];

    function tick(time){
      if(skipped){cleanup();showResults();return;}
      rafId=requestAnimationFrame(tick);
      if(lastTime<0)lastTime=time;
      let dt=Math.min((time-lastTime)/1000,0.05);
      lastTime=time;
      // Slow-motion impact for legendary/mythic pulls
      if(missileHit&&expT<0.9&&(isLeg||isMyth)) dt*=isMyth?0.30:0.42;
      elapsed+=dt;

      // Stage label (event overrides beat the timeline)
      if(labelOverride&&elapsed<labelOverrideUntil){
        stageLabel.textContent=labelOverride;
      } else {
        labelOverride=null;
        for(let i=stageLabels.length-1;i>=0;i--){
          if(elapsed>=stageLabels[i].t){stageLabel.textContent=stageLabels[i].text;break;}
        }
      }

      // Camera — mythic gets a slow orbit around the explosion
      if(isMyth&&missileHit){
        const ang=expT*0.9+Math.PI*.3;
        tmpPos.set(projTarget.x+Math.cos(ang)*13,projTarget.y+2.5,projTarget.z+Math.sin(ang)*13);
        camPos.lerp(tmpPos,0.06);camLook.lerp(projTarget,0.10);
      } else {
        const frame=_sgGetCamFrame(elapsed);
        tmpPos.set(...frame.pos);tmpLook.set(...frame.look);
        camPos.lerp(tmpPos,0.05);camLook.lerp(tmpLook,0.05);
      }
      camera.position.copy(camPos);camera.lookAt(camLook);

      // Stage 2 — Richard drop-in: falls from the sky, lands with impact
      if(richardGroup&&!landed){
        if(elapsed<2.4){richardGroup.position.y=16;}
        else{
          const t0=Math.min(1,(elapsed-2.4)/0.55);
          richardGroup.position.y=16-15.75*_sgEaseIn(t0);
          if(t0>=1){
            landed=true;landT=0.3;
            _spawnBurst(new THREE.Vector3(0,0.3,0),'#8A93A0',10,9,4); // landing dust
          }
        }
      }
      if(landT>0){ // landing impact shake
        landT-=dt;
        camera.rotation.z=Math.sin(landT*55)*0.010*Math.max(0,landT);
      }

      // Missile fall (freezes after a mid-air clash deflection)
      if(!missileHit&&!clashed&&elapsed<8.0){
        const mt=_sgEaseIn(Math.max(0,(elapsed-0.3)/7.0));
        missileGroup.position.lerpVectors(missileStart,missileEnd,mt);
        // High-rarity missiles fly evasive
        if((isLeg||isMyth)&&elapsed>3.5) missileGroup.position.x+=Math.sin(elapsed*2.6)*1.1;
        missileGroup.rotation.y+=dt*0.6;
        if(richardGroup&&landed){
          const dir=new THREE.Vector3().subVectors(missileGroup.position,richardGroup.position).normalize();
          richardGroup.rotation.y=_sgLerpAngle(richardGroup.rotation.y,Math.atan2(dir.x,dir.z),0.06);
        }
      }

      // Richard idle bob (only once landed)
      if(richardGroup&&landed&&landT<=0) richardGroup.position.y=0.25+Math.sin(elapsed*1.8)*0.025;

      // Lock-on reticle tracks the missile on screen
      if(elapsed>4.6&&!missileHit&&missileGroup.visible){
        const v=missileGroup.position.clone().project(camera);
        if(v.z<1){
          lockRet.style.display='block';
          lockRet.style.left=((v.x*.5+.5)*100)+'%';
          lockRet.style.top=((-v.y*.5+.5)*100)+'%';
          const locked=elapsed>5.8;
          lockRet.classList.toggle('sg-lr-locked',locked);
          lockRet.querySelector('.sg-lr-txt').textContent=clashed?'RE-LOCK':locked?'LOCKED':'TRACKING';
        }
      } else lockRet.style.display='none';

      // Rim light intensifies as missile approaches; weapon charge pulse before firing
      if(elapsed>3.5&&!missileHit) rimLight.intensity=Math.min(2.5,(elapsed-3.5)*0.6);
      if(elapsed>6.4&&elapsed<7.0&&!projFired){
        rimLight.intensity=2.2+Math.sin(elapsed*32)*1.4;
        if(!tick._charged){tick._charged=true;if(typeof sfxSummonCharge==='function') sfxSummonCharge();}
      }

      // Fire projectile
      if(elapsed>7.0&&!projFired&&!missileHit&&!reShotAt&&varPhase===0){
        projFired=true;projGroup.visible=true;projT=0;
        projTarget.copy(missileGroup.position);
        // Featured-save variant: the shot is aimed wide — it will miss
        if(variant) projTarget.x+=5.5;
        const startPos=richardGroup?richardGroup.position.clone().add(new THREE.Vector3(0,1.5,0)):new THREE.Vector3(0,1.5,0);
        projGroup.position.copy(startPos);
        if(typeof sfxFire==='function') sfxFire();
      }
      // Second (override) shot after a clash
      if(reShotAt&&elapsed>=reShotAt&&!projFired&&!missileHit){
        projFired=true;projGroup.visible=true;projT=0;reShotAt=0;
        projTarget.copy(missileGroup.position);
        projGroup.scale.setScalar(1.8); // stronger shot reads bigger
        const startPos=richardGroup?richardGroup.position.clone().add(new THREE.Vector3(0,1.5,0)):new THREE.Vector3(0,1.5,0);
        projGroup.position.copy(startPos);
        labelOverride='▶ OVERRIDE SHOT';labelOverrideUntil=elapsed+0.8;
      }
      if(projFired&&!missileHit){
        projT+=dt/PROJ_DUR;
        if(projT>=1){
          if(variant&&varPhase===0){
            // Stage MISS — interceptor sails wide, a saver is inbound
            varPhase=1;projFired=false;projGroup.visible=false;
            labelOverride='✖ INTERCEPTOR MISSED';labelOverrideUntil=elapsed+0.6;
            varSpawnAt=elapsed+0.6;
          } else if((isLeg||isMyth)&&!clashed&&!variant){
            // Stage 5 — mid-air clash: missile survives the first hit
            clashed=true;projFired=false;projGroup.visible=false;
            _spawnBurst(missileGroup.position,'#FFFFFF',8,10,6);
            missileGroup.position.x+=2.4;missileGroup.position.y-=1.6; // deflects
            reShotAt=elapsed+0.7;
            labelOverride='⚠ TARGET SURVIVED — RE-ENGAGING';labelOverrideUntil=elapsed+0.7;
          } else {
            missileHit=true;projGroup.visible=false;missileGroup.visible=false;
            expGroup.visible=true;expGroup.position.copy(projTarget);expT=0;
            _spawnImpactDebris();
            lockRet.style.display='none';
            if(typeof sfxSummonImpact==='function') sfxSummonImpact(profile.label.toLowerCase());
          }
        }else{
          const start=richardGroup?richardGroup.position.clone().add(new THREE.Vector3(0,1.5,0)):new THREE.Vector3(0,1.5,0);
          projGroup.position.lerpVectors(start,projTarget,_sgEaseIn(projT));
        }
      }

      // Featured-save variant: RAJPN fists / Cyber Bullet save the intercept
      if(varPhase===1&&elapsed>=varSpawnAt){
        varPhase=2;varT=0;
        const mp=missileGroup.position;
        if(variant==='cyber'&&typeof makeCyberCarMesh==='function'){
          const car=makeCyberCarMesh();
          car.scale.setScalar(1.4);
          car.position.set(mp.x-46,mp.y-2,mp.z+6);
          car.rotation.y=Math.PI/2;
          sc.add(car);varObjs=[car];
          labelOverride='⚡ CYBER BULLET INBOUND';labelOverrideUntil=elapsed+1.2;
        } else if(typeof _makeFistGroup==='function'){
          const lF=_makeFistGroup(true),rF=_makeFistGroup(false);
          lF.scale.setScalar(1.2);rF.scale.setScalar(1.2);
          lF.position.set(mp.x-42,mp.y,mp.z);
          rF.position.set(mp.x+42,mp.y,mp.z);
          sc.add(lF);sc.add(rF);varObjs=[lF,rF];
          labelOverride='👊 RAJPN FIST BUMP INBOUND';labelOverrideUntil=elapsed+1.2;
        } else {varPhase=3;} // builders unavailable — straight to explosion
        if(typeof sfxAlert==='function') sfxAlert();
      }
      if(varPhase===2&&varObjs.length){
        varT+=dt/1.1;
        const mp=missileGroup.position;
        varObjs.forEach((o,i)=>{
          const sx=i===0?(variant==='cyber'?mp.x-46:mp.x-42):mp.x+42;
          o.position.x=sx+(mp.x-sx)*_sgEaseIn(Math.min(1,varT));
          o.position.y+=( mp.y-o.position.y)*0.12;
          o.position.z+=(mp.z-o.position.z)*0.12;
          if(variant==='cyber') o.rotation.z=Math.sin(elapsed*6)*.06;
        });
        if(varT>=1) varPhase=3;
      }
      if(varPhase===3&&!missileHit){
        missileHit=true;projGroup.visible=false;missileGroup.visible=false;
        expGroup.visible=true;expGroup.position.copy(missileGroup.position);
        projTarget.copy(missileGroup.position);expT=0;
        _spawnImpactDebris();
        _spawnBurst(missileGroup.position,'#FFFFFF',12,14,8);
        lockRet.style.display='none';
        labelOverride='✦ FEATURED INTERCEPT — '+(variant==='rajpn'?'RAJPN FIST BUMP':'CYBER BULLET')+' ✦';
        labelOverrideUntil=elapsed+3;
        if(typeof sfxSummonImpact==='function') sfxSummonImpact(profile.label.toLowerCase());
      }
      // Savers fade out with the explosion
      if(missileHit&&varObjs.length&&expT>0.5){
        varObjs.forEach(o=>sc.remove(o));varObjs=[];
      }

      // Explosion
      if(missileHit){
        expT+=dt;
        const es=Math.min(1,expT/1.3);
        expCore.scale.setScalar(1+es*14);
        expCore.material.opacity=Math.max(0,0.85-es*0.9);
        expRing.scale.setScalar(1+es*10);
        expRing.rotation.x=expT*1.8;expRing.rotation.z=expT*1.2;
        expRing.material.opacity=Math.max(0,0.9-es*1.1);
        expRing2.scale.setScalar(1+es*8);
        expRing2.rotation.y=expT*2.0;
        expRing2.material.opacity=Math.max(0,0.7-es*0.9);
        expLight.intensity=Math.max(0,10*(1-es*0.6));
        rimLight.intensity=Math.max(0,4*(1-es));
        // Tiered screen shake — bigger for higher rarity
        const shakeAmp=isMyth?0.016:isLeg?0.010:isEpic?0.005:0.002;
        if(expT<0.8) camera.rotation.z=Math.sin(expT*42)*shakeAmp*(0.8-expT);
        // Debris physics: arc out, tumble, sink
        for(const d of debris){
          d.vy-=22*dt;
          d.m.position.x+=d.vx*dt;d.m.position.y+=d.vy*dt;d.m.position.z+=d.vz*dt;
          d.m.rotation.x+=d.rx*dt;d.m.rotation.z+=d.rz*dt;
          if(d.m.position.y<0.1){d.m.position.y=0.1;d.vy=0;d.vx*=.92;d.vz*=.92;}
          d.m.material.opacity=Math.max(0,1-expT*.45);
        }
        if(debris.length&&!debris[0].m.material.transparent){
          debris.forEach(d=>{d.m.material.transparent=true;});
        }
      }

      if(elapsed>14.5||(missileHit&&expT>2.8)){cleanup();showResults();}
      renderer.render(sc,camera);
    }

    function cleanup(){
      if(rafId){cancelAnimationFrame(rafId);rafId=null;}
      debris.forEach(d=>{try{sc.remove(d.m);}catch(e){}});debris=[];
      varObjs.forEach(o=>{try{sc.remove(o);}catch(e){}});varObjs=[];
      try{renderer.dispose();}catch(e){}
    }

    function showResults(){
      overlay.innerHTML='';overlay.className='sg-summon-overlay';
      const hdr=document.createElement('div');hdr.className='sg-res-hdr';
      hdr.innerHTML=`<div class="sg-res-title">${results.length===1?'SUMMON RESULT':'SUMMON RESULTS — ×'+results.length}</div>`;
      const closeBtn=document.createElement('button');closeBtn.className='sg-results-close-btn';closeBtn.textContent='✕ CLOSE';
      closeBtn.onclick=()=>{overlay.style.display='none';resolve();};
      const grid=document.createElement('div');
      grid.className=results.length===1?'sg-result-single':'sg-result-grid';
      results.forEach((res,i)=>{
        const card=document.createElement('div');
        card.className='sg-result-card sg-flash-'+res.rarity;
        card.style.cssText=`animation-delay:${i*80}ms;border-color:${_rarityColor(res.rarity)}`;
        card.innerHTML=`<div class="sg-rc-rar" style="color:${_rarityColor(res.rarity)}">${res.rarity.toUpperCase()}</div>
          <div class="sg-rc-name">${res.name}</div>
          <div class="sg-rc-type">${(res.type||'SKIN').toUpperCase()}${res.weapon?' · '+res.weapon.toUpperCase():''}</div>
          ${res.isDupe?'<div class="sg-rc-dupe">DUPE +5 ◇</div>':'<div class="sg-rc-new">NEW ✦</div>'}`;
        grid.appendChild(card);
      });
      overlay.appendChild(hdr);overlay.appendChild(closeBtn);overlay.appendChild(grid);
    }

    requestAnimationFrame(tick);
  });
}

// CSS fallback if WebGL fails
function _sgCssFallbackAnim(overlay,profile,results,resolve){
  let skipped=false;
  const skipBtn=document.createElement('button');
  skipBtn.className='sg-skip-btn';skipBtn.textContent='SKIP ▶▶';skipBtn.onclick=()=>{skipped=true;};
  const stage=document.createElement('div');stage.className='sg-anim-stage';
  overlay.appendChild(skipBtn);overlay.appendChild(stage);
  const wait=ms=>new Promise(r=>{if(skipped)r();else setTimeout(r,ms);});
  (async()=>{
    stage.className='sg-anim-stage sg-stage-alert';
    stage.innerHTML=`<div class="sg-anim-alert-ring"></div><div class="sg-anim-alert-txt">⚠ INCOMING THREAT</div><div class="sg-anim-loc">📍 ${profile.map}</div>`;
    await wait(1800);
    stage.className='sg-anim-stage sg-stage-lock';
    stage.innerHTML=`<div class="sg-anim-lock-outer"></div><div class="sg-anim-lock-inner"></div><div class="sg-anim-lock-txt">◉ TARGET LOCKED</div>`;
    await wait(1800);
    stage.className='sg-anim-stage sg-stage-fire';
    stage.innerHTML=`<div class="sg-anim-fire-burst" style="--ec:${profile.expCol}"></div><div class="sg-anim-fire-txt">INTERCEPTOR DEPLOYED</div>`;
    await wait(1400);
    stage.className='sg-anim-stage sg-stage-exp';
    stage.innerHTML=`<div class="sg-anim-exp-ring1" style="--ec:${profile.expCol}"></div><div class="sg-anim-exp-ring2" style="--ec:${profile.expCol}"></div><div class="sg-anim-exp-txt" style="color:${profile.expCol}">INTERCEPT CONFIRMED</div>${profile.special?'<div class="sg-anim-special">✦ ANOMALY DETECTED ✦</div>':''}<div class="sg-anim-rar-flash" style="color:${profile.flashCol}">${profile.label}</div>`;
    await wait(2500);
    // Show results inline
    overlay.innerHTML='';overlay.className='sg-summon-overlay';
    const hdr=document.createElement('div');hdr.className='sg-res-hdr';
    hdr.innerHTML=`<div class="sg-res-title">${results.length===1?'SUMMON RESULT':'SUMMON RESULTS — ×'+results.length}</div>`;
    const closeBtn=document.createElement('button');closeBtn.className='sg-results-close-btn';closeBtn.textContent='✕ CLOSE';
    closeBtn.onclick=()=>{overlay.style.display='none';resolve();};
    const grid=document.createElement('div');grid.className=results.length===1?'sg-result-single':'sg-result-grid';
    results.forEach((res,i)=>{
      const card=document.createElement('div');card.className='sg-result-card sg-flash-'+res.rarity;
      card.style.cssText=`animation-delay:${i*80}ms;border-color:${_rarityColor(res.rarity)}`;
      card.innerHTML=`<div class="sg-rc-rar" style="color:${_rarityColor(res.rarity)}">${res.rarity.toUpperCase()}</div><div class="sg-rc-name">${res.name}</div><div class="sg-rc-type">${(res.type||'SKIN').toUpperCase()}${res.weapon?' · '+res.weapon.toUpperCase():''}</div>${res.isDupe?'<div class="sg-rc-dupe">DUPE +5 ◇</div>':'<div class="sg-rc-new">NEW ✦</div>'}`;
      grid.appendChild(card);
    });
    overlay.appendChild(hdr);overlay.appendChild(closeBtn);overlay.appendChild(grid);
  })();
}

// ── doSummon ──────────────────────────────────────────────────
async function doSummon(bannerId,count){
  const banners=_getGachaBanners();
  const banner=banners.find(b=>b.id===bannerId);
  if(!banner){showNotif('Banner unavailable.');return;}
  if(!_sgCanAfford(banner,count)){showNotif('Not enough '+banner.currency+'!');return;}
  _sgStopPvAnim();
  const results=_gachaRoll(bannerId,count);
  _sgSpendCurrency(banner,count);
  await _gachaApplyResults(results,bannerId);
  _sgUpdateCurrencies();
  const rarOrder=['mythic','legendary','epic','rare','uncommon','common'];
  const best=rarOrder.find(r=>results.some(res=>res.rarity===r))||'common';
  // Featured-save variant: if the pull contains a featured item, the shot
  // can MISS and get saved by RAJPN fists (rarer) or the Cyber Bullet.
  // Seeing either saver on screen = guaranteed featured item.
  let variant=null;
  try{
    const featIds=_sgGetFeaturedItems(banner).map(f=>f.id);
    if(results.some(r=>featIds.includes(r.id))){
      const roll=Math.random();
      if(roll<0.10) variant='rajpn';
      else if(roll<0.28) variant='cyber';
    }
  }catch(e){}
  await _sgPlayAnimation(_sgBuildAnimProfile(best),results,variant);
  _sgRenderBannerBody(banners.find(b=>b.id===bannerId)||banner);
  _sgUpdateCurrencies();
}
