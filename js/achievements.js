'use strict';
// ═══════════════════════════════════════════════════════════════
//  ACHIEVEMENTS — solo / co-op / multiplayer, 3 tiers each
//  (bronze → silver → gold). Rewards are EXCLUSIVE cosmetics that
//  exist nowhere else (registered below, never pushed to the shop).
//  Claims persist through the existing save path.
// ═══════════════════════════════════════════════════════════════

// ── Exclusive reward registration (after shop IIFEs ran — these
//    never enter SHOP_CATALOG or the summon pool) ───────────────
(function(){
  if(typeof PROFILE_ICONS!=='undefined'){
    PROFILE_ICONS.push(
      ['achi_marksman','Ace Marksman','🎯','#1E3A1E','epic'],
      ['achi_warden','City Warden','🏛️','#2A3346','epic'],
      ['achi_bossbane','Boss Bane','👹','#3A1414','legendary'],
      ['achi_wavemaster','Wave Master','🌊','#14333A','epic'],
      ['achi_summoner','Grand Summoner','🔮','#2A1038','legendary'],
      ['achi_squad','Squad Leader','🛡️','#1E2E46','epic'],
      ['achi_duelist','Duelist','⚔️','#3A2A10','legendary'],
      ['achi_fist','Fist Bump','👊','#3A2210','legendary']);
  }
  if(typeof PROFILE_TITLES!=='undefined'){
    PROFILE_TITLES.push(
      ['acht_missile_wall','Missile Wall','epic'],
      ['acht_soldier_bane','Soldier Bane','epic'],
      ['acht_untouchable','Untouchable','legendary'],
      ['acht_summon_lord','Summon Lord','legendary'],
      ['acht_squad_anchor','Squad Anchor','epic'],
      ['acht_duel_king','Duel King','legendary'],
      ['acht_hook_lord','Hook Lord','epic'],
      ['acht_overdrive','Overdrive','legendary']);
  }
  if(typeof PROFILE_BADGES!=='undefined'){
    PROFILE_BADGES.push(
      ['achb_bronze_op','Bronze Operator','🟤','rare'],
      ['achb_wave_crest','Wave Crest','🌊','epic'],
      ['achb_skull_gold','Gold Skull','💀','legendary'],
      ['achb_fist','RAJPN Knuckle','👊','epic'],
      ['achb_engine','V8 Engine','🏎️','epic'],
      ['achb_chain','Hook Chain','⛓️','rare']);
  }
  if(typeof WEAPON_CAMOS!=='undefined'){
    const add=(w,c)=>{ if(WEAPON_CAMOS[w]&&!WEAPON_CAMOS[w].find(x=>x.id===c.id)) WEAPON_CAMOS[w].push(Object.assign({weaponId:w,source:'achievement',price:0},c)); };
    add('sniper', {id:'ach_goldlock', name:'Gold Lock',    hexStr:'#D8B040',accentStr:'#3A2A08',rarity:'legendary',pattern:'goldplate',materialStyle:'metallic'});
    add('smg',    {id:'ach_warden',   name:'Warden',       hexStr:'#3A4A5E',accentStr:'#C8D8E8',rarity:'epic',     pattern:'digital',  materialStyle:'matte'});
    add('launcher',{id:'ach_bossbane',name:'Boss Bane',    hexStr:'#5A1010',accentStr:'#FF8A30',rarity:'legendary',pattern:'fracture', materialStyle:'cracked',emissiveStr:'#FF6020'});
    add('shotgun',{id:'ach_hooklord', name:'Hook Lord',    hexStr:'#2E2418',accentStr:'#FFB040',rarity:'epic',     pattern:'stripe',   materialStyle:'worn'});
    add('railgun',{id:'ach_duelist',  name:'Duelist',      hexStr:'#1A2E40',accentStr:'#FF4040',rarity:'legendary',pattern:'circuit',  materialStyle:'tech',emissiveStr:'#FF4040'});
    add('pistol', {id:'ach_centurion',name:'Centurion',    hexStr:'#B8923A',accentStr:'#2A1E08',rarity:'epic',     pattern:'goldtrim', materialStyle:'metallic'});
  }
  if(typeof RICHARD_SKINS!=='undefined'){
    const addSkin=s=>{ if(!RICHARD_SKINS.find(x=>x.id===s.id)) RICHARD_SKINS.push(s); };
    addSkin({id:'richard_ach_vanguard', name:'Wave Vanguard',  tagline:'Achievement exclusive', price:0, rarity:'legendary', source:'achievement',
      custo:{outfitColor:'#1E3A50',visorColor:'#70D0FF',skinTone:'#E8C49A',armorStyle:'heavy',helmet:true,backpack:'missile',gear:'elite'}});
    addSkin({id:'richard_ach_centurion',name:'Duel Centurion', tagline:'Achievement exclusive', price:0, rarity:'legendary', source:'achievement',
      custo:{outfitColor:'#B8923A',visorColor:'#FF4040',skinTone:'#C8A070',armorStyle:'heavy',helmet:true,backpack:'none',gear:'officer'}});
    addSkin({id:'richard_ach_overdrive',name:'Cyber Overdrive',tagline:'Achievement exclusive', price:0, rarity:'legendary', source:'achievement',
      custo:{outfitColor:'#181030',visorColor:'#40C8FF',skinTone:'#E8C49A',armorStyle:'stealth',helmet:true,backpack:'none',gear:'elite'}});
    addSkin({id:'richard_fat_paul',     name:'Fat Paul',       tagline:'RAJPN gold achievement — the legend himself', price:0, rarity:'mythic', source:'achievement',
      custo:{outfitColor:'#F2F2F2',visorColor:'#D02020',skinTone:'#E8C49A',armorStyle:'light',helmet:false,backpack:'none',gear:'fatpaul'}});
  }
})();

// ── Achievement catalog ────────────────────────────────────────
// reward shapes match BP grants: {credits}{chronoShards}{skin}{camo:[w,id]}
// {pcIcon}{card}{title}{badge}
const ACHIEVEMENTS=[
  // SOLO
  {id:'intercept', cat:'solo', name:'Sky Shield',      desc:'Intercept missiles',            stat:'totalIntercepted',  tiers:[75,500,2500],
   rewards:[{pcIcon:'achi_marksman'},{title:'acht_missile_wall'},{camo:['sniper','ach_goldlock']}]},
  {id:'soldiers',  cat:'solo', name:'Ground Control',  desc:'Eliminate enemy soldiers',      stat:'totalSoldierKills', tiers:[100,750,3000],
   rewards:[{badge:'achb_bronze_op'},{title:'acht_soldier_bane'},{camo:['smg','ach_warden']}]},
  {id:'bosses',    cat:'solo', name:'Giant Slayer',    desc:'Destroy bosses',                stat:'totalBossKills',    tiers:[5,30,100],
   rewards:[{pcIcon:'achi_bossbane'},{chronoShards:800},{camo:['launcher','ach_bossbane']}]},
  {id:'waves',     cat:'solo', name:'Tide Turner',     desc:'Complete waves',                stat:'totalWaves',        tiers:[25,150,600],
   rewards:[{pcIcon:'achi_wavemaster'},{badge:'achb_wave_crest'},{skin:'richard_ach_vanguard'}]},
  {id:'bestwave',  cat:'solo', name:'Untouchable',     desc:'Reach wave (single run)',       stat:'waveRecord',        tiers:[10,20,35],
   rewards:[{credits:3000},{title:'acht_untouchable'},{badge:'achb_skull_gold'}]},
  {id:'summons',   cat:'solo', name:'Grand Summoner',  desc:'Perform summons',               statFn:()=> (saveData.gachaHistory||[]).length, tiers:[10,80,300],
   rewards:[{pcIcon:'achi_summoner'},{title:'acht_summon_lord'},{chronoShards:2500}]},
  {id:'rajpn',     cat:'solo', name:'Fist Bump',       desc:'Use RAJPN Fist Bump',           stat:'rajpnUses',         tiers:[5,25,100],
   rewards:[{pcIcon:'achi_fist'},{badge:'achb_fist'},{skin:'richard_fat_paul'}]},
  {id:'cyber',     cat:'solo', name:'Street Racer',    desc:'Call in the Cyber Bullet',      stat:'cyberUses',         tiers:[5,30,120],
   rewards:[{badge:'achb_engine'},{title:'acht_overdrive'},{skin:'richard_ach_overdrive'}]},
  {id:'hook',      cat:'solo', name:'Hook Lord',       desc:'Fire the Hookbreaker hook',     stat:'hookUses',          tiers:[20,150,600],
   rewards:[{badge:'achb_chain'},{title:'acht_hook_lord'},{camo:['shotgun','ach_hooklord']}]},
  // CO-OP
  {id:'coopwaves', cat:'coop', name:'Squad Anchor',    desc:'Complete waves in co-op',       stat:'coopWaves',         tiers:[10,60,250],
   rewards:[{pcIcon:'achi_squad'},{title:'acht_squad_anchor'},{camo:['pistol','ach_centurion']}]},
  // MULTIPLAYER
  {id:'mpkills',   cat:'multiplayer', name:'Gulag Reaper', desc:'Win 1v1 rounds',            stat:'mpKills',           tiers:[3,20,75],
   rewards:[{pcIcon:'achi_duelist'},{credits:8000},{camo:['railgun','ach_duelist']}]},
  {id:'mpwins',    cat:'multiplayer', name:'Duel King',    desc:'Win battle matches',        stat:'mpMatchWins',       tiers:[1,10,40],
   rewards:[{badge:'achb_skull_gold'},{title:'acht_duel_king'},{skin:'richard_ach_centurion'}]},
];
const ACH_TIER_NAMES=['BRONZE','SILVER','GOLD'];
const ACH_TIER_COLORS=['#B07040','#B8C0CC','#E8C040'];

// ── Tracking helper — local-only write, full save happens at the
//    usual checkpoints (wave end, menu return) ──────────────────
function achInc(key,n){
  saveData[key]=(saveData[key]||0)+(n||1);
  try{localStorage.setItem(SAVE_KEY,JSON.stringify(saveData));}catch(e){}
}

function _achVal(a){return a.statFn?a.statFn():(saveData[a.stat]||0);}
function _achClaimed(a){return (saveData.achClaimed||{})[a.id]||0;}

// ── Claim ──────────────────────────────────────────────────────
function achClaim(achId){
  const a=ACHIEVEMENTS.find(x=>x.id===achId);
  if(!a) return;
  const done=_achClaimed(a);
  if(done>=3) return;
  if(_achVal(a)<a.tiers[done]){showNotif('Milestone not reached yet!');return;}
  const r=a.rewards[done];
  const upd=typeof _bpGrant==='function'?_bpGrant(r):{};
  if(!saveData.achClaimed) saveData.achClaimed={};
  saveData.achClaimed[a.id]=done+1;
  upd['saveData.achClaimed.'+a.id]=done+1;
  if(_fbUser&&_fbDb) _fbDb.collection('users').doc(_fbUser.uid).update(upd).catch(e=>console.warn('[Ach] write failed:',e.message));
  try{localStorage.setItem(SAVE_KEY,JSON.stringify(saveData));}catch(e){}
  const info=typeof _bpRewardInfo==='function'?_bpRewardInfo(r):{label:'Reward'};
  if(typeof sfxPurchase==='function') sfxPurchase();
  showNotif(ACH_TIER_NAMES[done]+' · '+a.name+': '+info.label+' claimed!');
  if(typeof updateSaveUI==='function') updateSaveUI();
  buildAchievements();
}

// ── UI ─────────────────────────────────────────────────────────
let _achCat='solo';
function buildAchievements(){
  const host=document.getElementById('achievementsTabContent');
  if(!host) return;
  const cats=[['solo','SOLO'],['coop','CO-OP'],['multiplayer','MULTIPLAYER']];
  const rows=ACHIEVEMENTS.filter(a=>a.cat===_achCat).map(a=>{
    const v=_achVal(a),done=_achClaimed(a);
    const nextTier=done<3?a.tiers[done]:null;
    const pct=nextTier?Math.min(100,Math.round(v/nextTier*100)):100;
    const chips=a.tiers.map((t,i)=>{
      const claimed=done>i;
      const reached=v>=t;
      const claimable=reached&&done===i;
      const info=typeof _bpRewardInfo==='function'?_bpRewardInfo(a.rewards[i]):{icon:'?',label:''};
      return`<div class="ach-chip ${claimed?'ach-chip-done':claimable?'ach-chip-ready':'ach-chip-locked'}" style="--tc:${ACH_TIER_COLORS[i]}">
        <div class="ach-chip-tier">${ACH_TIER_NAMES[i]}</div>
        <div class="ach-chip-req">${t.toLocaleString()}</div>
        <div class="ach-chip-rw" title="${info.label}">${info.icon}</div>
        ${claimed?'<div class="ach-chip-check">✓</div>'
          :claimable?`<button class="ach-claim-btn" onclick="achClaim('${a.id}')">CLAIM</button>`:''}
      </div>`;
    }).join('');
    return`<div class="ach-row">
      <div class="ach-info">
        <div class="ach-name">${a.name}</div>
        <div class="ach-desc">${a.desc}</div>
        <div class="ach-bar"><div class="ach-fill" style="width:${pct}%"></div></div>
        <div class="ach-prog">${v.toLocaleString()}${nextTier?' / '+nextTier.toLocaleString():' — COMPLETE'}</div>
      </div>
      <div class="ach-chips">${chips}</div>
    </div>`;
  }).join('');
  host.innerHTML=`
    <div class="ach-cats">${cats.map(([id,lbl])=>
      `<button class="ach-cat${_achCat===id?' ach-cat-on':''}" onclick="_achCat='${id}';buildAchievements()">${lbl}</button>`).join('')}
    </div>
    <div class="ach-list">${rows||'<div class="pc-empty">No achievements in this category.</div>'}</div>`;
}
