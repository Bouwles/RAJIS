'use strict';
// ═══════════════════════════════════════════════════════════════
//  PROFILE CUSTOMIZATION — icons, calling cards, titles, badges
//  Persists through the existing working save path (saveSave +
//  atomic Firebase field updates). No separate save system.
// ═══════════════════════════════════════════════════════════════

// ── Profile icons (40) — [id, name, emoji, bg, rarity] ─────────
const PROFILE_ICONS=[
  ['icon_default','Recruit','🪖','#2A3A4E','common'],
  ['icon_helmet','Richard Helmet','⛑️','#1E3046','common'],
  ['icon_warning','Missile Warning','⚠️','#5A3A10','common'],
  ['icon_cyber_car','Cyber Bullet Car','🏎️','#241038','epic'],
  ['icon_scope','Sniper Scope','🎯','#1A2E1A','rare'],
  ['icon_red_core','Red Core Missile','🚀','#48101A','legendary'],
  ['icon_gold_exp','Gold Explosion','💥','#5A4210','legendary'],
  ['icon_drone_skull','Drone Skull','💀','#26262E','epic'],
  ['icon_launcher','Launcher','🛡️','#2A3242','common'],
  ['icon_hook','Hookbreaker','🪝','#36302A','rare'],
  ['icon_dubai','Dubai Tower','🏙️','#4A3A1E','rare'],
  ['icon_beirut','Beirut Palm','🌴','#2E4A36','rare'],
  ['icon_pine','Sweden Pine','🌲','#1E3A2E','rare'],
  ['icon_arctic','Arctic Mask','❄️','#2A4A5E','rare'],
  ['icon_desert','Desert Visor','🏜️','#5A4A2A','uncommon'],
  ['icon_elite','Elite Badge','🎖️','#4A2A10','epic'],
  ['icon_radar','Radar Sweep','📡','#1A323A','uncommon'],
  ['icon_satellite','Satellite','🛰️','#26303E','uncommon'],
  ['icon_bullet','Cyber Bullet','🔋','#103246','epic'],
  ['icon_crosshair','Crosshair','✛','#2E2E36','common'],
  ['icon_shield','City Shield','🛡','#1E3A50','uncommon'],
  ['icon_skull','Gulag Skull','☠️','#33272A','epic'],
  ['icon_star','Rank Star','⭐','#4A3E14','uncommon'],
  ['icon_bolt','Shock Bolt','⚡','#3A2A56','rare'],
  ['icon_flame','Inferno','🔥','#4E2210','rare'],
  ['icon_snow','Snowstorm','🌨️','#33424E','uncommon'],
  ['icon_wave','Coastline','🌊','#16384A','uncommon'],
  ['icon_city','City Defender','🏢','#2A3240','common'],
  ['icon_crown','Champion Crown','👑','#56430E','legendary'],
  ['icon_target','Lock-On','🔒','#3A1E1E','rare'],
  ['icon_rocket','Interceptor','🚀','#23364E','common'],
  ['icon_bomb','Cluster Bomb','💣','#3A2E1A','rare'],
  ['icon_medal','First Win','🏅','#4A3A12','uncommon'],
  ['icon_wing','Air Wing','🪽','#2E3A4E','rare'],
  ['icon_eye','Recon Eye','👁️','#26303A','uncommon'],
  ['icon_gear','Engineer','⚙️','#33363E','common'],
  ['icon_lock_myth','Mythic Seal','🔮','#34102A','mythic'],
  ['icon_radio','Comms','📻','#2E3326','common'],
  ['icon_storm','Storm Front','🌩️','#26334A','epic'],
  ['icon_gem','Chrono Shard','💎','#15303E','legendary'],
];

// ── Calling cards (40) — [id, name, g1, g2, accent, motif, rarity]
const CALLING_CARDS=[
  ['card_default','Standard Issue','#15202E','#0A1018','#3D6F9E','🪖','common'],
  ['card_red_alert','Red Alert Skyline','#4A0E12','#16080A','#FF3030','🏙️','epic'],
  ['card_cyber_pursuit','Cyber Bullet Pursuit','#160A2E','#06041A','#40C8FF','🏎️','legendary'],
  ['card_dubai_night','Dubai Night Defense','#2E2410','#0E0A04','#FFD060','🌃','epic'],
  ['card_arctic_int','Arctic Interceptor','#1E3A4E','#0A1620','#A0E0FF','❄️','rare'],
  ['card_beirut_strike','Beirut Coastal Strike','#3A2A14','#140E06','#FFAA50','🌴','rare'],
  ['card_gold_lockon','Golden Lock-On','#4A3A10','#1A1204','#FFD840','🎯','legendary'],
  ['card_blackout','Blackout Arsenal','#16161C','#060608','#5A6478','🔫','epic'],
  ['card_omega','Omega Missile Breaker','#23103A','#0A0414','#B060FF','🚀','legendary'],
  ['card_final_override','Final Override','#33081E','#10020A','#FF2080','⚡','mythic'],
  ['card_city_savior','City Savior','#143246','#06141E','#50B8FF','🏢','rare'],
  ['card_stormline','Stormline Operator','#26334A','#0C1018','#8AB8E8','🌩️','rare'],
  ['card_rail_spec','Rail Cannon Specialist','#0E2E33','#040F12','#00E8FF','⚡','epic'],
  ['card_hook_elite','Hookbreaker Elite','#2E2418','#120E06','#FF8A30','🪝','epic'],
  ['card_missile_hunter','Missile Hunter','#1E2E1A','#0A1206','#90E060','🎯','uncommon'],
  ['card_mythic_pull','Mythic Pull','#2E0A22','#12030C','#FF44AA','🔮','mythic'],
  ['card_gulag_victor','Gulag Victor','#33271E','#120D08','#FFB060','☠️','legendary'],
  ['card_crimson_impact','Crimson Impact','#3E0E16','#160408','#FF5040','💥','epic'],
  ['card_tactical_dawn','Tactical Dawn','#3A2A2E','#140C0E','#FF9A70','🌅','uncommon'],
  ['card_blue_grid','Blue Scope Grid','#10283E','#040E18','#4090E0','📐','uncommon'],
  ['card_obsidian_def','Obsidian Defense','#1A1A23','#08080C','#8A92B0','🛡️','epic'],
  ['card_sand_run','Sandline Run','#46361C','#1A1208','#E8C070','🏜️','common'],
  ['card_pine_watch','Pinewatch','#14301E','#060F0A','#60C080','🌲','common'],
  ['card_drone_down','Drone Down','#222A33','#0A0E12','#70D0E0','💀','rare'],
  ['card_boss_breaker','Boss Breaker','#3A1414','#140505','#FF6040','👹','legendary'],
  ['card_first_blood','First Win','#2E2A14','#100E06','#FFE060','🏅','uncommon'],
  ['card_bp_elite','Battle Pass Elite','#231036','#0C0414','#C080FF','★','epic'],
  ['card_skyfracture','Sky Fracture','#2A1A3E','#0E0616','#A060FF','🌌','mythic'],
  ['card_coast_guard','Coastline Guard','#143A42','#051418','#50D0C8','🌊','uncommon'],
  ['card_night_ops','Night Ops','#10141E','#040608','#3A86FF','🌙','rare'],
  ['card_ember_field','Ember Field','#3A1E0E','#160A04','#FF8040','🔥','rare'],
  ['card_whiteout','Whiteout','#3E4A54','#161C22','#E0F0FF','🌨️','rare'],
  ['card_chrono','Chrono Cache','#0E2E3A','#041014','#40E0D0','💎','legendary'],
  ['card_rajpn','RAJPN Fist Bump','#3A1E10','#140A04','#FFAA40','🤜','legendary'],
  ['card_summit','Skyline Summit','#1E2A3E','#0A0E16','#90B8E8','🏔️','uncommon'],
  ['card_smoke_trail','Smoke Trail','#2E2E2A','#0E0E0C','#C0C8D0','💨','common'],
  ['card_green_zone','Green Zone','#1E3318','#0A1206','#80C850','🟩','common'],
  ['card_red_core_ban','Red Core Containment','#3A0E1E','#14040A','#FF3060','☢️','legendary'],
  ['card_founders','Founder','#2A1E42','#0E0818','#C8A0FF','🜲','legendary'],
  ['card_interceptor_ace','Interceptor Ace','#16324A','#06121E','#60C0FF','✈️','epic'],
];

// ── Titles (20) ────────────────────────────────────────────────
const PROFILE_TITLES=[
  ['title_rookie','Rookie','common'],
  ['title_interceptor','Interceptor','common'],
  ['title_city_defender','City Defender','uncommon'],
  ['title_missile_hunter','Missile Hunter','uncommon'],
  ['title_drone_hunter','Drone Hunter','uncommon'],
  ['title_red_alert','Red Alert','rare'],
  ['title_cyber_driver','Cyber Driver','rare'],
  ['title_storm_chaser','Storm Chaser','rare'],
  ['title_gulag_winner','Gulag Winner','epic'],
  ['title_boss_breaker','Boss Breaker','epic'],
  ['title_rail_spec','Rail Specialist','epic'],
  ['title_hook_master','Hook Master','epic'],
  ['title_elite_defender','Elite Defender','legendary'],
  ['title_final_override','Final Override','mythic'],
  ['title_mythic_op','Mythic Operator','mythic'],
  ['title_city_savior','City Savior','legendary'],
  ['title_ace','Interceptor Ace','legendary'],
  ['title_founder','Founder','legendary'],
  ['title_champion','Champion','legendary'],
  ['title_warden','Warden','rare'],
];

// ── Badges (15) ────────────────────────────────────────────────
const PROFILE_BADGES=[
  ['badge_star1','Bronze Star','🥉','uncommon'],
  ['badge_star2','Silver Star','🥈','rare'],
  ['badge_star3','Gold Star','🥇','epic'],
  ['badge_crown','Champion Crown','👑','legendary'],
  ['badge_skull','Gulag Skull','💀','epic'],
  ['badge_bolt','Shock Unit','⚡','rare'],
  ['badge_flame','Inferno Unit','🔥','rare'],
  ['badge_snow','Frost Unit','❄️','rare'],
  ['badge_target','Marksman','🎯','uncommon'],
  ['badge_rocket','Launch Crew','🚀','uncommon'],
  ['badge_shield','City Guard','🛡️','uncommon'],
  ['badge_gem','Chrono Elite','💎','legendary'],
  ['badge_eye','Recon','👁️','uncommon'],
  ['badge_myth','Mythic Seal','🔮','mythic'],
  ['badge_medal','Decorated','🏅','rare'],
];

function _pcIcon(id){const a=PROFILE_ICONS.find(x=>x[0]===id)||PROFILE_ICONS[0];return{id:a[0],name:a[1],emoji:a[2],bg:a[3],rarity:a[4]};}
function _pcCard(id){const a=CALLING_CARDS.find(x=>x[0]===id)||CALLING_CARDS[0];return{id:a[0],name:a[1],g1:a[2],g2:a[3],accent:a[4],motif:a[5],rarity:a[6]};}
function _pcTitle(id){const a=PROFILE_TITLES.find(x=>x[0]===id)||PROFILE_TITLES[0];return{id:a[0],name:a[1],rarity:a[2]};}
function _pcBadge(id){if(!id)return null;const a=PROFILE_BADGES.find(x=>x[0]===id);return a?{id:a[0],name:a[1],emoji:a[2],rarity:a[3]}:null;}

function _pcMine(){
  const pc=saveData.profileCustomization||{};
  return{icon:pc.icon||'icon_default',callingCard:pc.callingCard||'card_default',
         title:pc.title||'title_rookie',badge:pc.badge||null};
}

// ── Reusable calling card banner component ─────────────────────
// opts: {username, level, icon, callingCard, title, badge, sub}
function renderCallingCard(opts){
  const o=opts||{};
  const card=_pcCard(o.callingCard);
  const icon=_pcIcon(o.icon);
  const title=_pcTitle(o.title);
  const badge=_pcBadge(o.badge);
  return`<div class="cc-banner" style="background:linear-gradient(115deg,${card.g1},${card.g2});border-color:${card.accent}66;">
    <div class="cc-motif" style="color:${card.accent}">${card.motif}</div>
    <div class="cc-icon" style="background:${icon.bg};border-color:${card.accent}88;">${icon.emoji}</div>
    <div class="cc-mid">
      <div class="cc-name">${o.username||'RICHARD'}</div>
      <div class="cc-title" style="color:${card.accent}">${title.name.toUpperCase()}${o.sub?' · '+o.sub:''}</div>
    </div>
    <div class="cc-right">
      ${badge?`<div class="cc-badge" title="${badge.name}">${badge.emoji}</div>`:''}
      <div class="cc-level">LV ${o.level!=null?o.level:(saveData.bpLevel||0)}</div>
    </div>
  </div>`;
}

// Render the local player's card
function renderMyCallingCard(sub){
  const m=_pcMine();
  return renderCallingCard({username:(typeof mpUser!=='undefined'&&mpUser?.username)||'RICHARD',
    level:saveData.bpLevel||0,icon:m.icon,callingCard:m.callingCard,title:m.title,badge:m.badge,sub});
}

// ── Equip + persistence (existing working save pattern) ────────
const _PC_KINDS={
  icon:        {owned:'ownedProfileIcons', key:'icon'},
  callingCard: {owned:'ownedCallingCards', key:'callingCard'},
  title:       {owned:'ownedTitles',       key:'title'},
  badge:       {owned:'ownedBadges',       key:'badge'},
};
function equipProfileItem(kind,id){
  const k=_PC_KINDS[kind];
  if(!k) return;
  const owned=saveData[k.owned]||[];
  if(id!==null&&!owned.includes(id)){showNotif('Not owned yet!');return;}
  if(!saveData.profileCustomization) saveData.profileCustomization={icon:'icon_default',callingCard:'card_default',title:'title_rookie',badge:null};
  saveData.profileCustomization[k.key]=id;
  saveSave();
  if(_fbUser&&_fbDb){
    _fbDb.collection('users').doc(_fbUser.uid)
      .update({['saveData.profileCustomization.'+k.key]:id})
      .catch(e=>console.warn('[Profile] equip write failed:',e.message));
  }
  showNotif('Profile updated!');
  buildProfileCustomization();
}
function grantProfileItem(kind,id){
  // Used by shop/BP claim paths — local + atomic Firebase arrayUnion
  const k=_PC_KINDS[kind];
  if(!k) return {};
  if(!Array.isArray(saveData[k.owned])) saveData[k.owned]=[];
  if(!saveData[k.owned].includes(id)) saveData[k.owned].push(id);
  return{['saveData.'+k.owned]:firebase.firestore.FieldValue.arrayUnion(id)};
}

// ── Profile customization UI (lives in the Profile screen) ─────
let _pcTab='callingCard';
function buildProfileCustomization(){
  const host=document.getElementById('pfCustomization');
  if(!host) return;
  const m=_pcMine();
  const RAR_ORD={mythic:5,legendary:4,epic:3,rare:2,uncommon:1,common:0};
  const tabs=[['callingCard','CALLING CARDS'],['icon','ICONS'],['title','TITLES'],['badge','BADGES']];
  const k=_PC_KINDS[_pcTab];
  const ownedIds=saveData[k.owned]||[];
  let pool,tileHtml;
  if(_pcTab==='icon'){
    pool=PROFILE_ICONS.filter(a=>ownedIds.includes(a[0]));
    tileHtml=a=>{const eq=m.icon===a[0];const rc=_rarity(a[4]);
      return`<div class="pc-tile${eq?' pc-tile-eq':''}" style="--rar:${rc.color}" onclick="equipProfileItem('icon','${a[0]}')">
        <div class="pc-ico" style="background:${a[3]}">${a[2]}</div><div class="pc-nm">${a[1]}</div>${eq?'<div class="pc-on">ON</div>':''}</div>`;};
  } else if(_pcTab==='callingCard'){
    pool=CALLING_CARDS.filter(a=>ownedIds.includes(a[0]));
    tileHtml=a=>{const eq=m.callingCard===a[0];const rc=_rarity(a[6]);
      return`<div class="pc-tile pc-tile-wide${eq?' pc-tile-eq':''}" style="--rar:${rc.color}" onclick="equipProfileItem('callingCard','${a[0]}')">
        <div class="pc-card-mini" style="background:linear-gradient(115deg,${a[2]},${a[3]});border-color:${a[4]}66;"><span style="color:${a[4]}">${a[5]}</span></div>
        <div class="pc-nm">${a[1]}</div>${eq?'<div class="pc-on">ON</div>':''}</div>`;};
  } else if(_pcTab==='title'){
    pool=PROFILE_TITLES.filter(a=>ownedIds.includes(a[0]));
    tileHtml=a=>{const eq=m.title===a[0];const rc=_rarity(a[2]);
      return`<div class="pc-tile pc-tile-wide${eq?' pc-tile-eq':''}" style="--rar:${rc.color}" onclick="equipProfileItem('title','${a[0]}')">
        <div class="pc-title-tx" style="color:${rc.color}">${a[1].toUpperCase()}</div>${eq?'<div class="pc-on">ON</div>':''}</div>`;};
  } else {
    pool=PROFILE_BADGES.filter(a=>ownedIds.includes(a[0]));
    tileHtml=a=>{const eq=m.badge===a[0];const rc=_rarity(a[3]);
      return`<div class="pc-tile${eq?' pc-tile-eq':''}" style="--rar:${rc.color}" onclick="equipProfileItem('badge','${a[0]}')">
        <div class="pc-ico">${a[2]}</div><div class="pc-nm">${a[1]}</div>${eq?'<div class="pc-on">ON</div>':''}</div>`;};
  }
  pool=pool.slice().sort((a,b)=>{
    const ra=RAR_ORD[a[a.length-1]]||0, rb=RAR_ORD[b[b.length-1]]||0;
    return rb-ra||String(a[1]).localeCompare(String(b[1]));
  });
  host.innerHTML=`
    <div class="pc-hd">PROFILE CUSTOMIZATION</div>
    <div class="pc-preview">${renderMyCallingCard()}</div>
    <div class="pc-tabs">${tabs.map(([id,lbl])=>
      `<button class="pc-tab${_pcTab===id?' pc-tab-on':''}" onclick="_pcTab='${id}';buildProfileCustomization()">${lbl}</button>`).join('')}
      ${_pcTab==='badge'&&m.badge?`<button class="pc-tab" onclick="equipProfileItem('badge',null)">CLEAR BADGE</button>`:''}
    </div>
    <div class="pc-grid">${pool.length?pool.map(tileHtml).join(''):'<div class="pc-empty">Nothing owned in this category yet — check the Item Shop and Battle Pass.</div>'}</div>`;
}

// ── Shop catalog entries — all profile cosmetics are obtainable ─
(function(){
  if(typeof SHOP_CATALOG==='undefined') return;
  const P={common:300,uncommon:450,rare:700,epic:1000,legendary:1500,mythic:2200};
  PROFILE_ICONS.forEach(a=>{ if(a[0]==='icon_default')return;
    SHOP_CATALOG.push({id:'shop_pi_'+a[0],refId:a[0],name:a[1],itemType:'Profile Icon',section:'daily',
      rewardType:'profileIcon',rarity:a[4],price:Math.round((P[a[4]]||500)*.6),icon:a[2]});});
  CALLING_CARDS.forEach(a=>{ if(a[0]==='card_default')return;
    SHOP_CATALOG.push({id:'shop_cc_'+a[0],refId:a[0],name:a[1],itemType:'Calling Card',section:'daily',
      rewardType:'callingCard',rarity:a[6],price:P[a[6]]||700,icon:a[5]});});
  PROFILE_TITLES.forEach(a=>{ if(a[0]==='title_rookie')return;
    SHOP_CATALOG.push({id:'shop_tt_'+a[0],refId:a[0],name:a[1],itemType:'Title',section:'daily',
      rewardType:'title',rarity:a[2],price:Math.round((P[a[2]]||500)*.5),icon:'🏷️'});});
  PROFILE_BADGES.forEach(a=>{
    SHOP_CATALOG.push({id:'shop_bg_'+a[0],refId:a[0],name:a[1],itemType:'Badge',section:'daily',
      rewardType:'badge',rarity:a[3],price:Math.round((P[a[3]]||500)*.5),icon:a[2]});});
})();
