// Save / Load
// ═══════════════════════════════════════════════════════════════
//  SAVE / LOAD
// ═══════════════════════════════════════════════════════════════
const SAVE_KEY = 'raj_interceptor_v2';
function defaultSave(){
  return {
    currency:0, totalScore:0, waveRecord:0, totalIntercepted:0, totalShotsFired:0, totalWaves:0, totalBossKills:0,
    pickedCards:[], seenCards:[],
    locId:null,
    unlocks:['outfit_blue','outfit_black','visor_cyan'],
    upgrades:{armor_plate:0, speed_chip:0, hot_rounds:0},
    gadgets:{flashbang:2, airstrike:0, cover:0},
    hasCyberBullet:false,
    hasRajpnFist:false,
    bpXP:0, bpLevel:0,
    customization:{
      outfitColor:'#1A3A8A', armorStyle:'light',
      helmet:true, visorColor:'#44CCFF', backpack:'missile',
      skinTone:'#E8C49A'
    }
  };
}
function loadSave(){
  try{const d=localStorage.getItem(SAVE_KEY);if(d)return Object.assign(defaultSave(),JSON.parse(d));}catch(e){}
  return defaultSave();
}
function saveSave(){
  try{localStorage.setItem(SAVE_KEY,JSON.stringify(saveData));}catch(e){}
  fbSave(saveData);
}
let saveData = loadSave();

