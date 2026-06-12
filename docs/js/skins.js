'use strict';
// ═══════════════════════════════════════════════════════════════
//  RICHARD SKINS
// ═══════════════════════════════════════════════════════════════
const RICHARD_SKINS=[
  {id:'richard_default',   name:'Richard Operator',      tagline:'Classic military operator',   price:0,
   custo:{outfitColor:'#1A3A8A',visorColor:'#44CCFF',skinTone:'#E8C49A',armorStyle:'light',   helmet:true, backpack:'missile',gear:'none'}},
  {id:'richard_recon',     name:'Richard Recon',         tagline:'Tactical recon specialist',   price:800,
   custo:{outfitColor:'#1A1A1A',visorColor:'#FF4400',skinTone:'#E8C49A',armorStyle:'standard',helmet:true, backpack:'none',   gear:'bandolier'}},
  {id:'richard_arctic',    name:'Richard Arctic',        tagline:'Cold weather operator',       price:900,
   custo:{outfitColor:'#C8D8E8',visorColor:'#88DDFF',skinTone:'#F0E0D0',armorStyle:'heavy',   helmet:true, backpack:'missile',gear:'goggles'}},
  {id:'richard_desert',    name:'Richard Desert Storm',  tagline:'Sand warfare veteran',        price:700,
   custo:{outfitColor:'#C8A874',visorColor:'#FFAA00',skinTone:'#C8A070',armorStyle:'light',   helmet:true, backpack:'none',   gear:'scarf'}},
  {id:'richard_neon',      name:'Richard Neon',          tagline:'Cyberpunk operative',         price:1200,
   custo:{outfitColor:'#1A0A30',visorColor:'#DD00FF',skinTone:'#E8C49A',armorStyle:'standard',helmet:true, backpack:'missile',gear:'elite'}},
  {id:'richard_medic',     name:'Richard the Medic',     tagline:'Field medic, frontline hero', price:700,
   custo:{outfitColor:'#DDEEDD',visorColor:'#FF4444',skinTone:'#E8C49A',armorStyle:'light',   helmet:true, backpack:'none',   gear:'medic'}},
  {id:'richard_shadow',    name:'Richard Shadow',        tagline:'Ghost spec ops unit',         price:1500,
   custo:{outfitColor:'#0A0A0A',visorColor:'#00FF88',skinTone:'#8A6A5A',armorStyle:'heavy',   helmet:true, backpack:'none',   gear:'cape'}},
  {id:'richard_commander', name:'Richard Commander',     tagline:'High command dress uniform',  price:1000,
   custo:{outfitColor:'#0A1A3A',visorColor:'#DDAA00',skinTone:'#E8C49A',armorStyle:'standard',helmet:true, backpack:'missile',gear:'officer'}},
  {id:'richard_sunset',    name:'Richard Sunset',        tagline:'Beach assault veteran',       price:800,
   custo:{outfitColor:'#CC4400',visorColor:'#FFDD00',skinTone:'#C87850',armorStyle:'light',   helmet:false,backpack:'none',   gear:'scarf'}},
  {id:'richard_blizzard',  name:'Richard Blizzard',      tagline:'Arctic blizzard unit',        price:900,
   custo:{outfitColor:'#88AACC',visorColor:'#CCEEFF',skinTone:'#F0EEF8',armorStyle:'heavy',   helmet:true, backpack:'missile',gear:'goggles'}},
  {id:'richard_veteran',   name:'Richard Veteran',       tagline:'Battle-hardened soldier',     price:500,
   custo:{outfitColor:'#4A5A3A',visorColor:'#AACC66',skinTone:'#A87060',armorStyle:'standard',helmet:true, backpack:'none',   gear:'bandolier'}},
  {id:'richard_phantom',   name:'Richard Phantom',       tagline:'Unmarked ghost operative',    price:1800,
   custo:{outfitColor:'#F0F0F0',visorColor:'#AAAAAA',skinTone:'#F0F0F0',armorStyle:'heavy',   helmet:true, backpack:'missile',gear:'cape'}},
  {id:'richard_gold',      name:'THE RICHARD',           tagline:'Legendary gold operator',     price:0,
   custo:{outfitColor:'#AA7700',visorColor:'#FFEE00',skinTone:'#E8C49A',armorStyle:'heavy',   helmet:true, backpack:'missile',gear:'elite'}},
  // ── Gacha-exclusive skins (summon rewards) — registered here so the
  //    Locker can render/equip them. IDs must match GACHA_SKIN_POOL.
  {id:'richard_final_override',   name:'Final Override Richard',   tagline:'Summon — mythic override unit', price:0, rarity:'mythic',
   custo:{outfitColor:'#1A0A1A',visorColor:'#FF2080',skinTone:'#E8C49A',armorStyle:'heavy',   helmet:true, backpack:'missile',gear:'elite'}},
  {id:'richard_elite_interceptor',name:'Elite Interceptor Richard',tagline:'Summon — mythic interceptor',   price:0, rarity:'mythic',
   custo:{outfitColor:'#0A1A3A',visorColor:'#44CCFF',skinTone:'#E8C49A',armorStyle:'heavy',   helmet:true, backpack:'missile',gear:'elite'}},
  {id:'richard_shadow_ops',       name:'Shadow Ops Richard',       tagline:'Summon — legendary spectre',    price:0, rarity:'legendary',
   custo:{outfitColor:'#0A0A0A',visorColor:'#00FF88',skinTone:'#8A6A5A',armorStyle:'heavy',   helmet:true, backpack:'none',   gear:'cape'}},
  {id:'richard_gold_phantom',     name:'Gold Phantom Richard',     tagline:'Summon — legendary phantom',    price:0, rarity:'legendary',
   custo:{outfitColor:'#AA7700',visorColor:'#FFEE00',skinTone:'#E8C49A',armorStyle:'heavy',   helmet:true, backpack:'missile',gear:'elite'}},
  {id:'richard_cyber_assault',    name:'Cyber Assault Richard',    tagline:'Summon — legendary cyber unit', price:0, rarity:'legendary',
   custo:{outfitColor:'#1A0A30',visorColor:'#DD00FF',skinTone:'#E8C49A',armorStyle:'standard',helmet:true, backpack:'missile',gear:'bandolier'}},
  {id:'richard_arctic_storm',     name:'Arctic Storm Richard',     tagline:'Summon — epic cold front',      price:0, rarity:'epic',
   custo:{outfitColor:'#88AACC',visorColor:'#CCEEFF',skinTone:'#F0EEF8',armorStyle:'heavy',   helmet:true, backpack:'missile',gear:'goggles'}},
  {id:'richard_neon_striker',     name:'Neon Striker Richard',     tagline:'Summon — epic night striker',   price:0, rarity:'epic',
   custo:{outfitColor:'#0A0020',visorColor:'#FF00FF',skinTone:'#E8C49A',armorStyle:'standard',helmet:true, backpack:'none',   gear:'elite'}},
  {id:'richard_urban_ghost',      name:'Urban Ghost Richard',      tagline:'Summon — epic urban phantom',   price:0, rarity:'epic',
   custo:{outfitColor:'#1A1A1A',visorColor:'#AAAAAA',skinTone:'#E8C49A',armorStyle:'light',   helmet:true, backpack:'none',   gear:'cape'}},
  {id:'richard_desert_hawk',      name:'Desert Hawk Richard',      tagline:'Summon — rare sand raptor',     price:0, rarity:'rare',
   custo:{outfitColor:'#C8A874',visorColor:'#FFAA00',skinTone:'#C8A070',armorStyle:'light',   helmet:true, backpack:'none',   gear:'scarf'}},
  {id:'richard_forest_ranger',    name:'Forest Ranger Richard',    tagline:'Summon — rare woodland unit',   price:0, rarity:'rare',
   custo:{outfitColor:'#1A3A1A',visorColor:'#44AA22',skinTone:'#A87060',armorStyle:'light',   helmet:true, backpack:'none',   gear:'bandolier'}},
  {id:'richard_recon_blue',       name:'Recon Blue Richard',       tagline:'Summon — uncommon recon unit',  price:0, rarity:'uncommon',
   custo:{outfitColor:'#1A2A5A',visorColor:'#4488FF',skinTone:'#E8C49A',armorStyle:'light',   helmet:true, backpack:'none',   gear:'none'}},
  {id:'richard_basic_op',         name:'Basic Operative Richard',  tagline:'Summon — common operative',     price:0, rarity:'common',
   custo:{outfitColor:'#2A2A2A',visorColor:'#8888AA',skinTone:'#E8C49A',armorStyle:'light',   helmet:false,backpack:'none',   gear:'none'}},
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

// ── Camo expansion: 12 themed camos added to EVERY weapon ────────
// Stored per-weapon (weapon-specific IDs in saveData.ownedWeaponCamos),
// rendered through the existing two-tone hexStr/accentStr pipeline.
// emissiveStr marks mythic/energy camos — accent zones get a soft glow.
(function(){
  const EX=[
    {id:'snowdust',  name:'Snow Dust',        hexStr:'#E4E8EC',accentStr:'#9AA8B4',price:400, rarity:'uncommon', pattern:'snow',     materialStyle:'matte'},
    {id:'stormveil', name:'Storm Veil',       hexStr:'#4A5A6E',accentStr:'#1E2630',price:550, rarity:'rare',     pattern:'storm',    materialStyle:'matte'},
    {id:'burntmetal',name:'Burnt Metal',      hexStr:'#5A3A28',accentStr:'#2A180E',price:550, rarity:'rare',     pattern:'burnt',    materialStyle:'worn'},
    {id:'chromeshift',name:'Chrome Shift',    hexStr:'#A8B0BC',accentStr:'#4A525E',price:650, rarity:'rare',     pattern:'chrome',   materialStyle:'metallic'},
    {id:'carbon',    name:'Carbon',           hexStr:'#23262C',accentStr:'#3A4250',price:750, rarity:'epic',     pattern:'carbon',   materialStyle:'fiber'},
    {id:'hazline',   name:'Hazard Stripe',    hexStr:'#E8A020',accentStr:'#16161A',price:750, rarity:'epic',     pattern:'hazard',   materialStyle:'matte'},
    {id:'digistorm', name:'Digital Storm',    hexStr:'#3A5A7A',accentStr:'#182838',price:800, rarity:'epic',     pattern:'digital',  materialStyle:'matte'},
    {id:'circuit',   name:'Blue Circuit',     hexStr:'#1A3A5A',accentStr:'#44AAFF',price:900, rarity:'epic',     pattern:'circuit',  materialStyle:'tech',    emissiveStr:'#44AAFF'},
    {id:'goldline',  name:'Goldline',         hexStr:'#D8B040',accentStr:'#6A4A14',price:1400,rarity:'legendary',pattern:'goldplate',materialStyle:'metallic'},
    {id:'obsidian',  name:'Obsidian',         hexStr:'#15151C',accentStr:'#2A2A3A',price:1400,rarity:'legendary',pattern:'gloss',    materialStyle:'gloss'},
    {id:'crimfrac',  name:'Crimson Fracture', hexStr:'#A02030',accentStr:'#2A0608',price:1500,rarity:'legendary',pattern:'fracture', materialStyle:'cracked', emissiveStr:'#FF3040'},
    {id:'mythcore',  name:'Mythic Core',      hexStr:'#2A0A1A',accentStr:'#FF2080',price:2500,rarity:'mythic',   pattern:'energy',   materialStyle:'energy',  emissiveStr:'#FF2080'},
    {id:'tigerstripe',name:'Tiger Stripe',    hexStr:'#8A5A20',accentStr:'#1A1208',price:600, rarity:'rare',     pattern:'stripe',   materialStyle:'matte'},
    {id:'urbanfog',  name:'Urban Fog',        hexStr:'#7A828E',accentStr:'#3A4048',price:450, rarity:'uncommon', pattern:'digital',  materialStyle:'matte'},
    {id:'toxic',     name:'Toxic Surge',      hexStr:'#7AC820',accentStr:'#1A3008',price:900, rarity:'epic',     pattern:'energy',   materialStyle:'tech',    emissiveStr:'#7AC820'},
    {id:'royal',     name:'Royal Guard',      hexStr:'#3A2A8A',accentStr:'#C8A030',price:1500,rarity:'legendary',pattern:'goldtrim', materialStyle:'metallic'},
    {id:'magma',     name:'Magma Vein',       hexStr:'#3A1408',accentStr:'#FF6020',price:1000,rarity:'epic',     pattern:'fracture', materialStyle:'cracked', emissiveStr:'#FF6020'},
    {id:'whitegold', name:'White Gold',       hexStr:'#E8E4D8',accentStr:'#C8A030',price:1600,rarity:'legendary',pattern:'goldtrim', materialStyle:'metallic'},
  ];
  Object.keys(WEAPON_CAMOS).forEach(w=>{
    EX.forEach(c=>{
      if(!WEAPON_CAMOS[w].find(x=>x.id===c.id))
        WEAPON_CAMOS[w].push(Object.assign({weaponId:w,source:'shop'},c));
    });
  });
})();

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

// ── Skin expansion: 60 outfits ───────────────────────────────────
// [id, name, outfit, visor, armorStyle, helmet, backpack, gear, rarity, price]
(function(){
  const X=[
    ['sandstorm_raider','Sandstorm Raider','#B89860','#FFB030','light',1,'none','scarf','rare',900],
    ['frostline_defender','Frostline Defender','#C2D6E4','#7ACCFF','standard',1,'missile','goggles','rare',950],
    ['night_ops','Night Ops Richard','#10141C','#3A86FF','stealth',1,'none','none','epic',1200],
    ['crimson_breach','Crimson Breach','#7A1620','#FF5040','heavy',1,'missile','bandolier','epic',1250],
    ['blue_steel','Blue Steel Operator','#2A4A6E','#9CC8FF','standard',1,'none','none','uncommon',650],
    ['golden_intercept','Golden Interceptor','#C29A2E','#FFE066','heavy',1,'missile','elite','legendary',1900],
    ['obsidian_tact','Obsidian Tactical','#16161E','#8A92B0','standard',1,'none','bandolier','epic',1200],
    ['arctic_ghost','Arctic Ghost','#E2ECF2','#A8E4FF','stealth',1,'none','cape','epic',1300],
    ['desert_cmdr','Desert Commander','#A88A50','#FFC050','standard',1,'missile','officer','rare',1000],
    ['urban_riot','Urban Riot','#3A3E46','#FF7030','heavy',1,'none','none','rare',950],
    ['heavy_plated','Heavy Plated Richard','#4A505C','#C2CCDA','heavy',1,'missile','none','rare',1000],
    ['recon_shadow','Recon Shadow','#1E242E','#50FFB0','stealth',1,'none','none','rare',950],
    ['cyber_runner','Cyber Runner','#241038','#FF40C8','stealth',1,'none','elite','epic',1350],
    ['coastline_def','Coastline Defender','#3A6A7A','#7AE2D8','light',1,'none','none','uncommon',650],
    ['dubai_elite','Dubai Elite Guard','#9A8348','#FFE9A0','standard',1,'missile','officer','epic',1300],
    ['beirut_street','Beirut Street Operator','#8A7458','#FFA868','light',1,'none','scarf','uncommon',700],
    ['sweden_snow','Sweden Snow Patrol','#D2DCE6','#9CC2E8','standard',1,'none','goggles','uncommon',700],
    ['red_alert','Red Alert Richard','#8A1218','#FF3030','heavy',1,'missile','none','epic',1300],
    ['black_chrome','Black Chrome Richard','#1A1C22','#C8D2E0','heavy',1,'none','elite','legendary',1800],
    ['storm_chaser','Storm Chaser','#3E4A5E','#9CB8FF','light',1,'none','none','rare',850],
    ['rail_division','Rail Division','#1E2A3E','#00E8FF','standard',1,'missile','bandolier','epic',1250],
    ['missile_lead','Missile Squad Leader','#3A4A3A','#FFD040','standard',1,'missile','officer','rare',1000],
    ['tact_engineer','Tactical Engineer','#5A5240','#FFB838','light',1,'none','none','uncommon',600],
    ['hazard_resp','Hazard Response','#C2861A','#FFE040','heavy',1,'none','none','rare',950],
    ['whiteout','Whiteout Armor','#EAEFF4','#C8E8FF','heavy',1,'missile','none','epic',1250],
    ['carbon_assault','Carbon Assault','#22262E','#6A7890','standard',1,'none','bandolier','rare',900],
    ['bronze_vet','Bronze Veteran','#7A5A34','#E8A860','standard',1,'none','none','uncommon',600],
    ['silver_sentinel','Silver Sentinel','#9AA4B2','#E2ECF8','heavy',1,'none','none','rare',1000],
    ['gold_vanguard','Gold Vanguard','#B8923A','#FFE070','heavy',1,'missile','officer','legendary',1850],
    ['mythic_overdrive','Mythic Overdrive','#30081E','#FF2080','heavy',1,'missile','elite','mythic',2600],
    ['skyline_def','Skyline Defender','#2E4258','#8AC8FF','standard',1,'missile','none','rare',900],
    ['smoke_jumper','Smoke Jumper','#4E4A46','#D8D0C8','light',1,'none','scarf','uncommon',650],
    ['arctic_cmdr','Arctic Commander','#AFC4D4','#DFF2FF','heavy',1,'missile','officer','epic',1350],
    ['desert_phantom','Desert Phantom','#C4A678','#FFF0C0','stealth',1,'none','cape','epic',1300],
    ['urban_phantom','Urban Phantom','#2A2E36','#B8C4D8','stealth',1,'none','cape','epic',1300],
    ['crimson_scope','Crimson Scope','#5E1A22','#FF6050','light',1,'none','none','rare',900],
    ['midnight_launcher','Midnight Launcher','#141A2E','#5070FF','standard',1,'missile','none','rare',950],
    ['riot_shield','Riot Shield Operator','#3A424E','#FFC830','heavy',1,'none','none','rare',1000],
    ['warden','Warden Richard','#2E3A2E','#A0D080','heavy',1,'none','officer','rare',1000],
    ['elite_city','Elite City Guard','#1E3046','#70B8FF','standard',1,'missile','officer','epic',1300],
    ['thunder_resp','Thunder Response','#3A3A12','#FFF040','standard',1,'none','none','rare',900],
    ['ember_tact','Ember Tactical','#6E3018','#FF8040','light',1,'none','none','uncommon',700],
    ['glacier_strike','Glacier Strike','#BCD8E8','#70E0FF','heavy',1,'missile','goggles','epic',1300],
    ['deep_navy','Deep Navy Operator','#101E36','#4080D0','standard',1,'none','none','uncommon',650],
    ['orange_hazard','Orange Hazard Suit','#C2641A','#FFC040','heavy',1,'none','none','rare',900],
    ['green_field','Green Field Specialist','#3A5A2E','#90E060','light',1,'none','none','common',450],
    ['red_core','Red Core Armor','#48101A','#FF2040','heavy',1,'missile','elite','legendary',1900],
    ['omega_intercept','Omega Interceptor','#1A2440','#40FFE0','heavy',1,'missile','elite','mythic',2600],
    ['final_override_suit','Final Override Suit','#22081A','#FF40A0','heavy',1,'missile','elite','mythic',2800],
    ['cyber_driver','Cyber Bullet Driver','#181030','#40C8FF','light',1,'none','bandolier','epic',1250],
    ['rajpn_champion','RAJPN Champion','#7A2A12','#FFD040','standard',1,'none','officer','legendary',1800],
    ['gulag_champion','Gulag Champion','#4A3A2E','#FF9040','heavy',1,'none','bandolier','legendary',1750],
    ['drone_hunter','Drone Hunter','#2A323A','#60FFD0','light',1,'none','goggles','rare',900],
    ['boss_slayer','Boss Slayer','#501818','#FFAA30','heavy',1,'missile','bandolier','legendary',1800],
    ['smoke_trail','Smoke Trail Specialist','#56504A','#C0D0E0','light',1,'none','scarf','uncommon',650],
    ['neonless_blackout','Neonless Blackout','#0C0C10','#3A3A44','stealth',1,'none','none','epic',1250],
    ['dustline_recon','Dustline Recon','#9A8662','#E8D0A0','light',1,'none','scarf','uncommon',650],
    ['ironclad','Ironclad Defender','#3E444E','#A8B8CC','heavy',1,'none','none','rare',1000],
    ['prime_intercept','Prime Interceptor','#1A3050','#70D0FF','heavy',1,'missile','elite','legendary',1900],
    ['founder','Founder Richard','#3A2A5A','#C8A0FF','standard',1,'missile','elite','legendary',2000],
  ];
  X.forEach(a=>{
    const[id,name,outfit,visor,armor,helmet,backpack,gear,rarity,price]=a;
    const skinId='richard_rx_'+id;
    const summonOnly=rarity==='legendary'||rarity==='mythic';
    RICHARD_SKINS.push({id:skinId,name,tagline:(summonOnly?'Summon exclusive — ':'Expansion outfit — ')+rarity,price,rarity,
      source:summonOnly?'summon':'shop',
      custo:{outfitColor:outfit,visorColor:visor,skinTone:'#E8C49A',armorStyle:armor,helmet:!!helmet,backpack,gear}});
    // Legendary/mythic expansion skins are SUMMON-EXCLUSIVE — not sold in shop
    if(!summonOnly)
      SHOP_CATALOG.push({id:skinId,name,itemType:'Outfit',section:'featured',rewardType:'skin',rarity,price});
  });
  // Expansion camos join the daily shop rotation pool
  const _WLBL={pistol:'Pistol',launcher:'Launcher',sniper:'Sniper',smg:'SMG',shotgun:'Shotgun',railgun:'Railgun',cluster:'Cluster',shock:'Shock'};
  Object.entries(WEAPON_CAMOS).forEach(([wid,camos])=>{
    camos.filter(c=>c.source==='shop').forEach(c=>{
      SHOP_CATALOG.push({id:`shop_xc_${wid}_${c.id}`,name:c.name+' '+(_WLBL[wid]||wid),
        itemType:(_WLBL[wid]||wid)+' Camo',section:'daily',rewardType:'weaponCamo',
        weaponId:wid,camoId:c.id,rarity:c.rarity||'rare',price:c.price||600});
    });
  });
})();


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
  if(item.rewardType==='profileIcon') return(saveData.ownedProfileIcons||[]).includes(item.refId);
  if(item.rewardType==='callingCard') return(saveData.ownedCallingCards||[]).includes(item.refId);
  if(item.rewardType==='title')       return(saveData.ownedTitles||[]).includes(item.refId);
  if(item.rewardType==='badge')       return(saveData.ownedBadges||[]).includes(item.refId);
  return false;
}
function _isEquipped(item){
  const pc=saveData.profileCustomization||{};
  if(item.rewardType==='skin') return(saveData.equippedSkin||'richard_default')===item.id;
  if(item.rewardType==='weaponCamo') return((saveData.equippedWeaponCamos||{})[item.weaponId]||'default')===item.camoId;
  if(item.rewardType==='profileIcon') return pc.icon===item.refId;
  if(item.rewardType==='callingCard') return pc.callingCard===item.refId;
  if(item.rewardType==='title')       return pc.title===item.refId;
  if(item.rewardType==='badge')       return pc.badge===item.refId;
  return false;
}
const _PC_REWARD_KIND={profileIcon:'icon',callingCard:'callingCard',title:'title',badge:'badge'};

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

  const builtDate=_getUAEDate();
  const tick=()=>{
    // Midnight rollover: rotate the shop in place, no manual refresh needed
    if(_getUAEDate()!==builtDate){buildItemShop();return;}
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
    } else if(item.rewardType==='callingCard'&&typeof renderCallingCard==='function'){
      const me=(typeof mpUser!=='undefined'&&mpUser?.username)||'RICHARD';
      const mine=saveData.profileCustomization||{};
      prev.innerHTML=`<div style="width:100%;height:100%;background:${r.bg};display:flex;align-items:center;justify-content:center;padding:14px;">
        ${renderCallingCard({username:me,level:saveData.bpLevel||0,icon:mine.icon,callingCard:item.refId,title:mine.title,badge:mine.badge})}
      </div>`;
    } else {
      prev.innerHTML=`<div style="width:100%;height:100%;background:${r.bg};display:flex;align-items:center;justify-content:center;font-size:4em;">${item.icon||'✦'}</div>`;
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
        :item.rewardType==='weaponCamo'
          ?`equipWeaponCamo('${item.weaponId}','${item.camoId}');closeShopModal();buildItemShop()`
          :`equipProfileItem('${_PC_REWARD_KIND[item.rewardType]}','${item.refId}');closeShopModal();buildItemShop()`;
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
      } else if(_PC_REWARD_KIND[item.rewardType]){
        const kind=_PC_REWARD_KIND[item.rewardType];
        upd['saveData.'+_PC_KINDS[kind].owned]=firebase.firestore.FieldValue.arrayUnion(item.refId);
        upd['saveData.profileCustomization.'+_PC_KINDS[kind].key]=item.refId;
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
  } else if(_PC_REWARD_KIND[item.rewardType]){
    const kind=_PC_REWARD_KIND[item.rewardType];
    const k=_PC_KINDS[kind];
    if(!Array.isArray(saveData[k.owned])) saveData[k.owned]=[];
    if(!saveData[k.owned].includes(item.refId)) saveData[k.owned].push(item.refId);
    if(!saveData.profileCustomization) saveData.profileCustomization={icon:'icon_default',callingCard:'card_default',title:'title_rookie',badge:null};
    saveData.profileCustomization[k.key]=item.refId;
  }
  // Sync localStorage (Firebase already updated above)
  try{localStorage.setItem(SAVE_KEY,JSON.stringify(saveData));}catch(e){}
  if(typeof updateSaveUI==='function') updateSaveUI();
  if(typeof sfxPurchase==='function') sfxPurchase();
  showNotif(item.name+' purchased!');
  openShopModal(itemId);
  buildItemShop();
}

function equipWeaponCamo(weaponId,camoId){
  if(!saveData.equippedWeaponCamos) saveData.equippedWeaponCamos={};
  saveData.equippedWeaponCamos[weaponId]=camoId;
  saveSave();
  if(typeof sfxEquip==='function') sfxEquip();
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
    const RAR_ORD={mythic:5,legendary:4,epic:3,rare:2,uncommon:1,common:0};
    // Owned only, tightly packed: rarest → least rare → alphabetical
    const skins=RICHARD_SKINS.filter(s=>owned.includes(s.id))
      .sort((a,b)=>{
        const rd=(RAR_ORD[b.rarity||'uncommon']||0)-(RAR_ORD[a.rarity||'uncommon']||0);
        return rd!==0?rd:a.name.localeCompare(b.name);
      });
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
    // OWNED camos only (Locker is owned customization — locked items live
    // in Shop/BP/Summon). Sorted: default → equipped → rarity desc → alpha.
    const ownedList=(saveData.ownedWeaponCamos||{})[_lkrCamoWeapon]||[];
    const equippedId=(saveData.equippedWeaponCamos||{})[_lkrCamoWeapon]||'default';
    const RAR_ORD={mythic:5,legendary:4,epic:3,rare:2,uncommon:1,common:0};
    const camos=(WEAPON_CAMOS[_lkrCamoWeapon]||[])
      .filter(cm=>cm.id==='default'||ownedList.includes(cm.id))
      .sort((a,b)=>{
        if(a.id==='default') return -1;
        if(b.id==='default') return 1;
        if(a.id===equippedId) return -1;
        if(b.id===equippedId) return 1;
        const rd=(RAR_ORD[b.rarity||'common']||0)-(RAR_ORD[a.rarity||'common']||0);
        return rd!==0?rd:a.name.localeCompare(b.name);
      });
    const inner=document.createElement('div');
    inner.className='lkr-camo-grid-inner';
    camos.forEach(cm=>{
      const equipped=equippedId===cm.id;
      const tile=document.createElement('div');
      tile.className='lkr-camo-tile lkr-camo-owned'+(equipped?' lkr-camo-equipped':'');
      tile.innerHTML=`<div class="lkr-camo-swatch" style="background:linear-gradient(135deg,${cm.hexStr||'#303030'} 55%,${cm.accentStr||'#1A1A1E'} 55%);"></div>
        <div class="lkr-camo-name">${cm.name}</div>
        <div class="lkr-camo-rar" style="color:${_rarity(cm.rarity||'common').color}">${_rarity(cm.rarity||'common').label}</div>
        ${equipped?'<div class="lkr-camo-eq-badge">ON</div>':''}`;
      tile.onclick=()=>_lkrSelectCamo(cm.id,tile);
      inner.appendChild(tile);
    });
    if(camos.length<=1){
      const note=document.createElement('div');
      note.className='lkr-empty';
      note.style.cssText='grid-column:1/-1;padding:14px 0;';
      note.textContent='No extra camos owned for this weapon yet.';
      inner.appendChild(note);
    }
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
//  BATTLE PASS — Season 1: Interceptor Protocol
//  50 tiers, Free + Premium tracks. Premium costs BP_PREMIUM_COST
//  credits. Claims are manual (CLAIM / CLAIM ALL) and write to
//  Firebase atomically through the existing working save path.
// ═══════════════════════════════════════════════════════════════
const BP_SEASON_TITLE='SEASON 1 — INTERCEPTOR PROTOCOL';
const BP_PREMIUM_COST=25000;
// Reward shapes: {credits} {chronoShards} {summonTickets} {featuredTickets}
//                {dupeFragments} {skin:'id'} {camo:['weapon','camoId']}
const BP_TIERS=[
  {tier:1,  free:{credits:200},        prem:{credits:500}},
  {tier:2,  free:{chronoShards:100},   prem:{chronoShards:300}},
  {tier:3,  free:{summonTickets:1},    prem:{summonTickets:2}},
  {tier:4,  free:{credits:300},        prem:{camo:['launcher','redline']}},
  {tier:5,  free:{camo:['pistol','sand']}, prem:{card:'card_bp_elite'}},
  {tier:6,  free:{credits:400},        prem:{featuredTickets:2}},
  {tier:7,  free:{dupeFragments:50},   prem:{chronoShards:400}},
  {tier:8,  free:{chronoShards:150},   prem:{skin:'richard_desert'}},
  {tier:9,  free:{summonTickets:1},    prem:{credits:1000}},
  {tier:10, free:{skin:'richard_veteran'}, prem:{summonTickets:3}},
  {tier:11, free:{credits:500},        prem:{chronoShards:500}},
  {tier:12, free:{chronoShards:200},   prem:{camo:['pistol','black']}},
  {tier:13, free:{card:'card_city_savior'}, prem:{pcIcon:'icon_crown'}},
  {tier:14, free:{summonTickets:2},    prem:{featuredTickets:2}},
  {tier:15, free:{credits:700},        prem:{dupeFragments:100}},
  {tier:16, free:{dupeFragments:100},  prem:{skin:'richard_arctic'}},
  {tier:17, free:{credits:800},        prem:{credits:1400}},
  {tier:18, free:{featuredTickets:1},  prem:{camo:['sniper','midnight']}},
  {tier:19, free:{chronoShards:250},   prem:{chronoShards:600}},
  {tier:20, free:{camo:['launcher','arctic']}, prem:{summonTickets:4}},
  {tier:21, free:{credits:900},        prem:{credits:1600}},
  {tier:22, free:{summonTickets:2},    prem:{camo:['smg','frost']}},
  {tier:23, free:{credits:1000},       prem:{featuredTickets:3}},
  {tier:24, free:{chronoShards:300},   prem:{skin:'richard_recon'}},
  {tier:25, free:{featuredTickets:1},  prem:{credits:2000}},
  {tier:26, free:{pcIcon:'icon_shield'}, prem:{chronoShards:700}},
  {tier:27, free:{dupeFragments:150},  prem:{summonTickets:4}},
  {tier:28, free:{credits:1200},       prem:{camo:['railgun','void']}},
  {tier:29, free:{summonTickets:3},    prem:{credits:1800}},
  {tier:30, free:{skin:'richard_medic'}, prem:{dupeFragments:200}},
  {tier:31, free:{credits:1300},       prem:{featuredTickets:3}},
  {tier:32, free:{chronoShards:350},   prem:{camo:['cluster','inferno']}},
  {tier:33, free:{title:'title_city_defender'}, prem:{card:'card_gold_lockon'}},
  {tier:34, free:{summonTickets:2},    prem:{chronoShards:800}},
  {tier:35, free:{credits:1500},       prem:{summonTickets:5}},
  {tier:36, free:{dupeFragments:200},  prem:{skin:'richard_blizzard'}},
  {tier:37, free:{credits:1600},       prem:{credits:2400}},
  {tier:38, free:{chronoShards:400},   prem:{featuredTickets:4}},
  {tier:39, free:{featuredTickets:2},  prem:{dupeFragments:300}},
  {tier:40, free:{camo:['shotgun','urban']}, prem:{credits:2600}},
  {tier:41, free:{credits:1700},       prem:{chronoShards:900}},
  {tier:42, free:{summonTickets:3},    prem:{camo:['shock','thunder']}},
  {tier:43, free:{card:'card_stormline'}, prem:{title:'title_elite_defender'}},
  {tier:44, free:{chronoShards:450},   prem:{summonTickets:5}},
  {tier:45, free:{credits:1900},       prem:{featuredTickets:5}},
  {tier:46, free:{dupeFragments:250},  prem:{camo:['sniper','ember']}},
  {tier:47, free:{credits:2000},       prem:{credits:3000}},
  {tier:48, free:{chronoShards:500},   prem:{chronoShards:1000}},
  {tier:49, free:{featuredTickets:3},  prem:{dupeFragments:400}},
  {tier:50, free:{credits:2500},       prem:{skin:'richard_gold'}},
];

let _bpSel=null; // {tier, track:'free'|'prem'}

function _bpRewardInfo(r){
  if(!r) return{icon:'—',label:'No reward',rarity:'common'};
  if(r.skin){
    const sk=RICHARD_SKINS.find(s=>s.id===r.skin);
    return{icon:'🪖',label:sk?sk.name:r.skin,rarity:r.skin==='richard_gold'?'mythic':'epic',skin:r.skin};
  }
  if(r.camo){
    const[w,cid]=r.camo;
    const cm=(WEAPON_CAMOS[w]||[]).find(c=>c.id===cid);
    return{icon:'🎨',label:(cm?cm.name:cid)+' '+(_LKR_WEAPON_LABELS[w]||w),rarity:cm?.rarity||'rare',camo:r.camo,camoData:cm};
  }
  if(r.card){const c=typeof _pcCard==='function'?_pcCard(r.card):null;return{icon:c?c.motif:'🎴',label:(c?c.name:r.card)+' Card',rarity:c?c.rarity:'rare',card:r.card};}
  if(r.pcIcon){const c=typeof _pcIcon==='function'?_pcIcon(r.pcIcon):null;return{icon:c?c.emoji:'👤',label:(c?c.name:r.pcIcon)+' Icon',rarity:c?c.rarity:'rare'};}
  if(r.title){const c=typeof _pcTitle==='function'?_pcTitle(r.title):null;return{icon:'🏷️',label:'Title: '+(c?c.name:r.title),rarity:c?c.rarity:'rare'};}
  if(r.credits)        return{icon:'💰',label:r.credits.toLocaleString()+' Credits',rarity:'common'};
  if(r.chronoShards)   return{icon:'◈', label:r.chronoShards+' Chrono Shards',rarity:'uncommon'};
  if(r.summonTickets)  return{icon:'🎟',label:r.summonTickets+' Summon Ticket'+(r.summonTickets>1?'s':''),rarity:'uncommon'};
  if(r.featuredTickets)return{icon:'✦', label:r.featuredTickets+' Featured Ticket'+(r.featuredTickets>1?'s':''),rarity:'rare'};
  if(r.dupeFragments)  return{icon:'◇', label:r.dupeFragments+' Dupe Fragments',rarity:'common'};
  return{icon:'?',label:'Reward',rarity:'common'};
}

// 'claimed' | 'claimable' | 'needPremium' | 'locked'
function _bpState(tier,track){
  const lvl=saveData.bpLevel||0;
  const arr=track==='prem'?(saveData.bpClaimedTiersP||[]):(saveData.bpClaimedTiers||[]);
  if(arr.includes(tier)) return'claimed';
  if(lvl<tier) return'locked';
  if(track==='prem'&&!saveData.bpPremium) return'needPremium';
  return'claimable';
}

function _bpGrant(r){
  // Apply reward to saveData + build atomic Firebase increments
  const upd={};
  if(!saveData.summonCurrency) saveData.summonCurrency={chronoShards:0,summonTickets:0,featuredTickets:0};
  if(r.credits){saveData.currency=(saveData.currency||0)+r.credits;upd['saveData.currency']=firebase.firestore.FieldValue.increment(r.credits);}
  if(r.chronoShards){saveData.summonCurrency.chronoShards=(saveData.summonCurrency.chronoShards||0)+r.chronoShards;upd['saveData.summonCurrency.chronoShards']=firebase.firestore.FieldValue.increment(r.chronoShards);}
  if(r.summonTickets){saveData.summonCurrency.summonTickets=(saveData.summonCurrency.summonTickets||0)+r.summonTickets;upd['saveData.summonCurrency.summonTickets']=firebase.firestore.FieldValue.increment(r.summonTickets);}
  if(r.featuredTickets){saveData.summonCurrency.featuredTickets=(saveData.summonCurrency.featuredTickets||0)+r.featuredTickets;upd['saveData.summonCurrency.featuredTickets']=firebase.firestore.FieldValue.increment(r.featuredTickets);}
  if(r.dupeFragments){saveData.dupeFragments=(saveData.dupeFragments||0)+r.dupeFragments;upd['saveData.dupeFragments']=firebase.firestore.FieldValue.increment(r.dupeFragments);}
  if(r.skin){
    if(!saveData.ownedSkins) saveData.ownedSkins=['richard_default'];
    if(!saveData.ownedSkins.includes(r.skin)) saveData.ownedSkins.push(r.skin);
    upd['saveData.ownedSkins']=firebase.firestore.FieldValue.arrayUnion(r.skin);
  }
  if(r.camo){
    const[w,cid]=r.camo;
    if(!saveData.ownedWeaponCamos) saveData.ownedWeaponCamos={};
    if(!Array.isArray(saveData.ownedWeaponCamos[w])) saveData.ownedWeaponCamos[w]=[];
    if(!saveData.ownedWeaponCamos[w].includes(cid)) saveData.ownedWeaponCamos[w].push(cid);
    upd[`saveData.ownedWeaponCamos.${w}`]=firebase.firestore.FieldValue.arrayUnion(cid);
  }
  if(r.card&&typeof grantProfileItem==='function')   Object.assign(upd,grantProfileItem('callingCard',r.card));
  if(r.pcIcon&&typeof grantProfileItem==='function') Object.assign(upd,grantProfileItem('icon',r.pcIcon));
  if(r.title&&typeof grantProfileItem==='function')  Object.assign(upd,grantProfileItem('title',r.title));
  return upd;
}

function bpClaim(tier,track){
  const t=BP_TIERS.find(x=>x.tier===tier);
  if(!t) return false;
  const r=track==='prem'?t.prem:t.free;
  if(!r||_bpState(tier,track)!=='claimable') return false;
  const upd=_bpGrant(r);
  if(track==='prem'){
    saveData.bpClaimedTiersP.push(tier);
    upd['saveData.bpClaimedTiersP']=firebase.firestore.FieldValue.arrayUnion(tier);
  } else {
    saveData.bpClaimedTiers.push(tier);
    upd['saveData.bpClaimedTiers']=firebase.firestore.FieldValue.arrayUnion(tier);
  }
  if(_fbUser&&_fbDb) _fbDb.collection('users').doc(_fbUser.uid).update(upd).catch(e=>console.warn('[BP] Firebase write failed:',e.message));
  try{localStorage.setItem(SAVE_KEY,JSON.stringify(saveData));}catch(e){}
  const info=_bpRewardInfo(r);
  showNotif('Tier '+tier+': '+info.label+' claimed!');
  return true;
}

function bpClaimSelected(){
  if(!_bpSel) return;
  if(bpClaim(_bpSel.tier,_bpSel.track)){
    if(typeof updateSaveUI==='function') updateSaveUI();
    buildBPScreen();
  }
}

function bpClaimAll(){
  let n=0;
  BP_TIERS.forEach(t=>{
    if(t.free&&_bpState(t.tier,'free')==='claimable'&&bpClaim(t.tier,'free')) n++;
    if(t.prem&&_bpState(t.tier,'prem')==='claimable'&&bpClaim(t.tier,'prem')) n++;
  });
  if(n>0){
    saveSave();
    if(typeof updateSaveUI==='function') updateSaveUI();
    showNotif(n+' reward'+(n>1?'s':'')+' claimed!');
  } else showNotif('Nothing to claim yet.');
  buildBPScreen();
}

function bpBuyPremium(){
  if(saveData.bpPremium){showNotif('Premium already owned!');return;}
  if((saveData.currency||0)<BP_PREMIUM_COST){showNotif('Not enough credits — need '+BP_PREMIUM_COST.toLocaleString()+'!');return;}
  saveData.currency-=BP_PREMIUM_COST;
  saveData.bpPremium=true;
  if(_fbUser&&_fbDb){
    _fbDb.collection('users').doc(_fbUser.uid).update({
      'saveData.currency':firebase.firestore.FieldValue.increment(-BP_PREMIUM_COST),
      'saveData.bpPremium':true,
    }).catch(e=>console.warn('[BP] Premium purchase write failed:',e.message));
  }
  try{localStorage.setItem(SAVE_KEY,JSON.stringify(saveData));}catch(e){}
  if(typeof updateSaveUI==='function') updateSaveUI();
  showNotif('★ PREMIUM BATTLE PASS UNLOCKED! ★');
  buildBPScreen();
}

function bpSelect(tier,track){
  _bpSel={tier,track};
  document.querySelectorAll('.bp-cell-sel').forEach(c=>c.classList.remove('bp-cell-sel'));
  const cell=document.getElementById('bpCell_'+track+'_'+tier);
  if(cell) cell.classList.add('bp-cell-sel');
  _bpRenderPreview();
}

function _bpRenderPreview(){
  const pv=document.getElementById('bpPreview');
  const claimBtn=document.getElementById('bpClaimBtn');
  if(!pv) return;
  if(!_bpSel){pv.innerHTML='<div class="bp-pv-empty">SELECT A REWARD</div>';if(claimBtn)claimBtn.disabled=true;return;}
  const t=BP_TIERS.find(x=>x.tier===_bpSel.tier);
  const r=_bpSel.track==='prem'?t.prem:t.free;
  const info=_bpRewardInfo(r);
  const rc=_rarity(info.rarity);
  const state=_bpState(_bpSel.tier,_bpSel.track);
  let visual='';
  if(info.skin){
    visual=`<canvas id="bpPvCanvas" width="140" height="190" style="width:140px;height:190px;"></canvas>`;
  } else if(info.camoData){
    visual=_camoGunPreview(info.camoData.hexStr||'#303030',info.camoData.accentStr);
  } else if(info.card&&typeof renderCallingCard==='function'){
    const mine=saveData.profileCustomization||{};
    visual=`<div style="transform:scale(.82);transform-origin:center;">${renderCallingCard({username:(typeof mpUser!=='undefined'&&mpUser?.username)||'RICHARD',callingCard:info.card,icon:mine.icon,title:mine.title,badge:mine.badge})}</div>`;
  } else {
    visual=`<div class="bp-pv-icon" style="color:${rc.color}">${info.icon}</div>`;
  }
  const stateTxt={claimed:'✓ CLAIMED',claimable:'READY TO CLAIM',needPremium:'REQUIRES PREMIUM PASS',locked:'REACH TIER '+_bpSel.tier};
  const stateCol={claimed:'#4F7A5E',claimable:'var(--amber)',needPremium:'#A855D8',locked:'var(--text3)'};
  pv.innerHTML=`
    <div class="bp-pv-track ${_bpSel.track==='prem'?'bp-pv-track-prem':''}">${_bpSel.track==='prem'?'★ PREMIUM':'FREE'} · TIER ${_bpSel.tier}</div>
    <div class="bp-pv-visual" style="border-color:${rc.border}">${visual}</div>
    <div class="bp-pv-name">${info.label}</div>
    <div class="bp-pv-rar" style="color:${rc.color}">${rc.label}</div>
    <div class="bp-pv-state" style="color:${stateCol[state]}">${stateTxt[state]}</div>`;
  if(claimBtn) claimBtn.disabled=state!=='claimable';
  // Render 3D skin preview after DOM insert
  if(info.skin){
    requestAnimationFrame(()=>{
      const cv=document.getElementById('bpPvCanvas');
      if(!cv||typeof makeCharModel!=='function') return;
      if(!_shopPrevRdr){
        const oc=document.createElement('canvas');oc.width=110;oc.height=160;
        _shopPrevRdr=new THREE.WebGLRenderer({canvas:oc,antialias:true,alpha:true});
        _shopPrevRdr.setSize(110,160,false);_shopPrevRdr.setClearColor(0x000000,0);
      }
      const sc=_buildShopScene();
      const cam=new THREE.PerspectiveCamera(42,110/160,0.1,50);
      cam.position.set(0,1.1,4.2);cam.lookAt(0,0.9,0);
      const sk=RICHARD_SKINS.find(s=>s.id===info.skin);
      if(!sk) return;
      const char=makeCharModel(sk.custo);
      char.rotation.y=0.4;sc.add(char);
      _shopPrevRdr.render(sc,cam);sc.remove(char);
      cv.getContext('2d').drawImage(_shopPrevRdr.domElement,0,0,140,190);
    });
  }
}

function buildBPScreen(){
  const lvl=saveData.bpLevel||0;
  const xp=saveData.bpXP||0;
  const inLvl=xp-lvl*500;
  const pct=Math.min(100,Math.round(inLvl/500*100));
  const hdr=document.getElementById('bpHdrInfo');
  if(hdr) hdr.innerHTML=`
    <div class="bp-season-title">${BP_SEASON_TITLE}</div>
    <div class="bp-hdr-row">
      <div class="bp-big-tier">TIER ${lvl}</div>
      <div class="bp-xp-wrap">
        <div class="bp-xp-track"><div class="bp-xp-fill" style="width:${pct}%"></div></div>
        <div class="bp-xp-text">${inLvl} / 500 XP to Tier ${lvl+1}</div>
      </div>
      ${saveData.bpPremium
        ?'<div class="bp-prem-owned">★ PREMIUM ACTIVE</div>'
        :`<button class="bp-prem-buy" onclick="bpBuyPremium()">UNLOCK PREMIUM — 💰 ${BP_PREMIUM_COST.toLocaleString()}</button>`}
    </div>`;
  const track=document.getElementById('bpTrack');
  if(!track) return;
  const cellHtml=(t,r,trk)=>{
    if(!r) return`<div class="bp-cell bp-cell-empty"></div>`;
    const info=_bpRewardInfo(r);
    const rc=_rarity(info.rarity);
    const state=_bpState(t.tier,trk);
    const cls={claimed:'bp-cell-claimed',claimable:'bp-cell-ready',needPremium:'bp-cell-prem-lock',locked:'bp-cell-locked'}[state];
    const sel=_bpSel&&_bpSel.tier===t.tier&&_bpSel.track===trk?' bp-cell-sel':'';
    return`<div class="bp-cell ${cls}${sel}" id="bpCell_${trk}_${t.tier}" onclick="bpSelect(${t.tier},'${trk}')" style="--rar:${rc.color}">
      <div class="bp-cell-icon">${info.icon}</div>
      <div class="bp-cell-lbl">${info.label}</div>
      ${state==='claimed'?'<div class="bp-cell-check">✓</div>':''}
      ${state==='claimable'?'<div class="bp-cell-dot"></div>':''}
      ${state==='needPremium'?'<div class="bp-cell-lock">★</div>':''}
      ${state==='locked'?'<div class="bp-cell-lock">🔒</div>':''}
    </div>`;
  };
  track.innerHTML=`
    <div class="bp-track-labels">
      <div class="bp-lane-lbl"></div>
      <div class="bp-lane-lbl">FREE</div>
      <div class="bp-lane-lbl bp-lane-prem">★ PREMIUM</div>
    </div>
    <div class="bp-track-scroll" id="bpTrackScroll">
      ${BP_TIERS.map(t=>{
        const cur=(saveData.bpLevel||0)+1===t.tier;
        return`<div class="bp-col${cur?' bp-col-cur':''}">
          <div class="bp-col-num">${t.tier}</div>
          ${cellHtml(t,t.free,'free')}
          ${cellHtml(t,t.prem,'prem')}
        </div>`;
      }).join('')}
    </div>`;
  const cur=track.querySelector('.bp-col-cur');
  if(cur) setTimeout(()=>cur.scrollIntoView({behavior:'smooth',block:'nearest',inline:'center'}),120);
  _bpRenderPreview();
}
