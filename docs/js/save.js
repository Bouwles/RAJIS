// Save / Load
// ═══════════════════════════════════════════════════════════════
//  SAVE / LOAD
// ═══════════════════════════════════════════════════════════════
const SAVE_KEY = 'raj_interceptor_v2';
const ALL_WEAPON_IDS = ['pistol','launcher','shotgun','sniper','smg','railgun','cluster','shock'];

function defaultSave(){
  const camoDef={}, equippedDef={};
  ALL_WEAPON_IDS.forEach(w=>{camoDef[w]=[];equippedDef[w]='default';});
  return {
    currency:0, totalScore:0, waveRecord:0, totalIntercepted:0, totalShotsFired:0, totalWaves:0, totalBossKills:0,
    pickedCards:[], seenCards:[],
    locId:null,
    unlocks:['outfit_blue','outfit_black','visor_cyan'],
    upgrades:{armor_plate:0, speed_chip:0, hot_rounds:0},
    gadgets:{flashbang:2, airstrike:0, cover:0},
    hasCyberBullet:false,
    hasRajpnFist:false,
    equippedWeapons:['pistol','launcher'],
    bpXP:0, bpLevel:0, bpClaimedTiers:[],
    ownedSkins:['richard_default'], equippedSkin:'richard_default',
    ownedWeaponCamos: camoDef,
    equippedWeaponCamos: equippedDef,
    totalSoldierKills:0, claimedChallenges:[],
    customization:{
      outfitColor:'#1A3A8A', armorStyle:'light',
      helmet:true, visorColor:'#44CCFF', backpack:'missile',
      skinTone:'#E8C49A'
    },
    summonCurrency:{chronoShards:500,summonTickets:3,featuredTickets:0},
    dupeFragments:0,
    gachaPity:{
      standard:{total:0,epicPity:0,legendaryPity:0,mythicPity:0,guaranteedFeatured:false},
      featured:{total:0,epicPity:0,legendaryPity:0,mythicPity:0,guaranteedFeatured:false},
      weapon:  {total:0,epicPity:0,legendaryPity:0,mythicPity:0,guaranteedFeatured:false},
      ultimate:{total:0,epicPity:0,legendaryPity:0,mythicPity:0,guaranteedFeatured:false},
      normal:  {total:0,epicPity:0,legendaryPity:0,mythicPity:0,guaranteedFeatured:false},
    },
    gachaHistory:[],
    redeemedCodes:[],
  };
}

// Ensure all expected fields exist — never wipes existing owned items
function _normalizeInventory(sd){
  if(!sd) return defaultSave();
  if(!Array.isArray(sd.ownedSkins)||!sd.ownedSkins.length) sd.ownedSkins=['richard_default'];
  if(!sd.equippedSkin) sd.equippedSkin='richard_default';
  if(typeof sd.ownedWeaponCamos!=='object'||!sd.ownedWeaponCamos) sd.ownedWeaponCamos={};
  if(typeof sd.equippedWeaponCamos!=='object'||!sd.equippedWeaponCamos) sd.equippedWeaponCamos={};
  ALL_WEAPON_IDS.forEach(w=>{
    if(!Array.isArray(sd.ownedWeaponCamos[w])) sd.ownedWeaponCamos[w]=[];
    if(!sd.equippedWeaponCamos[w]) sd.equippedWeaponCamos[w]='default';
  });
  if(!Array.isArray(sd.bpClaimedTiers)) sd.bpClaimedTiers=[];
  if(!Array.isArray(sd.pickedCards)) sd.pickedCards=[];
  if(!Array.isArray(sd.seenCards)) sd.seenCards=[];
  if(!sd.upgrades) sd.upgrades={armor_plate:0,speed_chip:0,hot_rounds:0};
  if(!sd.gadgets) sd.gadgets={flashbang:2,airstrike:0,cover:0};
  if(!sd.customization) sd.customization={outfitColor:'#1A3A8A',armorStyle:'light',helmet:true,visorColor:'#44CCFF',backpack:'missile',skinTone:'#E8C49A'};
  if(!Array.isArray(sd.equippedWeapons)||!sd.equippedWeapons.length) sd.equippedWeapons=['pistol','launcher'];
  if(!sd.summonCurrency||typeof sd.summonCurrency!=='object') sd.summonCurrency={chronoShards:500,summonTickets:3,featuredTickets:0};
  if(typeof sd.summonCurrency.chronoShards!=='number') sd.summonCurrency.chronoShards=500;
  if(typeof sd.summonCurrency.summonTickets!=='number') sd.summonCurrency.summonTickets=3;
  if(typeof sd.summonCurrency.featuredTickets!=='number') sd.summonCurrency.featuredTickets=0;
  if(typeof sd.dupeFragments!=='number') sd.dupeFragments=0;
  if(!sd.gachaPity||typeof sd.gachaPity!=='object') sd.gachaPity={};
  if(!Array.isArray(sd.redeemedCodes)) sd.redeemedCodes=[];
  ['standard','featured','weapon','ultimate','normal'].forEach(k=>{
    if(!sd.gachaPity[k]||typeof sd.gachaPity[k]!=='object'){
      sd.gachaPity[k]={total:0,epicPity:0,legendaryPity:0,mythicPity:0,guaranteedFeatured:false};
    } else {
      ['total','epicPity','legendaryPity','mythicPity'].forEach(f=>{if(typeof sd.gachaPity[k][f]!=='number')sd.gachaPity[k][f]=0;});
      if(typeof sd.gachaPity[k].guaranteedFeatured!=='boolean') sd.gachaPity[k].guaranteedFeatured=false;
    }
  });
  if(!Array.isArray(sd.gachaHistory)) sd.gachaHistory=[];
  return sd;
}

function loadSave(){
  try{
    const d=localStorage.getItem(SAVE_KEY);
    if(d) return _normalizeInventory(Object.assign(defaultSave(),JSON.parse(d)));
  }catch(e){}
  return defaultSave();
}
function saveSave(){
  try{localStorage.setItem(SAVE_KEY,JSON.stringify(saveData));}catch(e){}
  fbSave(saveData);
}
let saveData = loadSave();
