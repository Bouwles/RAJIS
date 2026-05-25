'use strict';
// ═══════════════════════════════════════════════════════════════
//  RICHARD SKINS — Daily Item Shop & Battle Pass
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

const BP_TIERS=[
  {tier:1,  label:'100 Credits',          icon:'💰', credits:100},
  {tier:2,  label:'Richard Recon',        icon:'🪖', skin:'richard_recon'},
  {tier:3,  label:'200 Credits',          icon:'💰', credits:200},
  {tier:4,  label:'Flashbang ×2',         icon:'💥'},
  {tier:5,  label:'Richard Arctic',       icon:'🪖', skin:'richard_arctic'},
  {tier:6,  label:'300 Credits',          icon:'💰', credits:300},
  {tier:7,  label:'Richard Desert Storm', icon:'🪖', skin:'richard_desert'},
  {tier:8,  label:'400 Credits',          icon:'💰', credits:400},
  {tier:9,  label:'Richard the Medic',    icon:'🪖', skin:'richard_medic'},
  {tier:10, label:'500 Credits',          icon:'💰', credits:500},
  {tier:11, label:'Richard Veteran',      icon:'🪖', skin:'richard_veteran'},
  {tier:12, label:'600 Credits',          icon:'💰', credits:600},
  {tier:13, label:'Richard Commander',    icon:'🪖', skin:'richard_commander'},
  {tier:14, label:'700 Credits',          icon:'💰', credits:700},
  {tier:15, label:'Richard Neon',         icon:'🪖', skin:'richard_neon'},
  {tier:16, label:'800 Credits',          icon:'💰', credits:800},
  {tier:17, label:'Richard Blizzard',     icon:'🪖', skin:'richard_blizzard'},
  {tier:18, label:'900 Credits',          icon:'💰', credits:900},
  {tier:19, label:'Richard Sunset',       icon:'🪖', skin:'richard_sunset'},
  {tier:20, label:'1000 Credits',         icon:'💰', credits:1000},
  {tier:21, label:'Richard Shadow',       icon:'🪖', skin:'richard_shadow'},
  {tier:22, label:'1100 Credits',         icon:'💰', credits:1100},
  {tier:23, label:'Richard Phantom',      icon:'🪖', skin:'richard_phantom'},
  {tier:24, label:'1200 Credits',         icon:'💰', credits:1200},
  {tier:25, label:'THE RICHARD — Gold',   icon:'🏆', skin:'richard_gold'},
];

// ─────────────────────────────────────────────────────────────────
//  DAILY SHOP
// ─────────────────────────────────────────────────────────────────
function getDailyShopItems(){
  const today=new Date().toISOString().slice(0,10);
  let seed=today.split('-').reduce((a,v)=>a*31+parseInt(v),1);
  const arr=RICHARD_SKINS.filter(s=>s.id!=='richard_gold').slice();
  for(let i=arr.length-1;i>0;i--){
    seed=(seed*1664525+1013904223)>>>0;
    const j=seed%(i+1);
    [arr[i],arr[j]]=[arr[j],arr[i]];
  }
  return arr.slice(0,6);
}

function buildItemShop(){
  const items=getDailyShopItems();
  const owned=saveData.ownedSkins||['richard_default'];
  const equipped=saveData.equippedSkin||'richard_default';
  const grid=document.getElementById('itemShopGrid');
  if(!grid) return;
  const creds=document.getElementById('isCredits');
  if(creds) creds.textContent='💰 '+saveData.currency;
  const today=new Date().toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'});
  const refreshEl=document.getElementById('isRefreshDate');
  if(refreshEl) refreshEl.textContent='Refreshes tomorrow · '+today;
  grid.innerHTML=items.map(skin=>{
    const isOwned=owned.includes(skin.id);
    const isEq=equipped===skin.id;
    return `<div class="is-card${isEq?' is-eq':''}">
      <div class="is-skin-name">${skin.name}</div>
      <div class="is-skin-tag">${skin.tagline}</div>
      <div class="is-skin-price">${isOwned?'<span class="is-owned">OWNED</span>':'💰 '+skin.price}</div>
      <button class="is-btn${isEq?' is-btn-eq':isOwned?' is-btn-equip':' is-btn-buy'}"
        ${isEq?'disabled':''} onclick="buySkin('${skin.id}',${skin.price})">
        ${isEq?'EQUIPPED':isOwned?'EQUIP':'BUY'}
      </button>
    </div>`;
  }).join('');
}

function buySkin(skinId,price){
  const skin=RICHARD_SKINS.find(s=>s.id===skinId);
  if(!skin) return;
  if(!saveData.ownedSkins) saveData.ownedSkins=['richard_default'];
  if(!saveData.ownedSkins.includes(skinId)){
    if(saveData.currency<price){ showNotif('Not enough credits!'); return; }
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

// ─────────────────────────────────────────────────────────────────
//  BATTLE PASS
// ─────────────────────────────────────────────────────────────────
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
  if(xpText) xpText.textContent=xp+' XP total — '+Math.max(0,nextXP-xp)+' XP to Tier '+(tier+1);

  // Auto-claim newly reached rewards
  if(!saveData.bpClaimedTiers) saveData.bpClaimedTiers=[];
  let claimed=false;
  BP_TIERS.forEach(t=>{
    if(tier>=t.tier&&!saveData.bpClaimedTiers.includes(t.tier)){
      saveData.bpClaimedTiers.push(t.tier);
      if(t.credits){ saveData.currency+=t.credits; showNotif('BP Tier '+t.tier+': +'+t.credits+' Credits!'); }
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
    return `<div class="bp-row${done?' bp-row-done':cur?' bp-row-cur':''}">
      <div class="bp-row-num">${t.tier}</div>
      <div class="bp-row-icon">${t.icon}</div>
      <div class="bp-row-label">${t.label}</div>
      <div class="bp-row-check">${done?'✓':cur?'▶':''}</div>
    </div>`;
  }).join('');

  // Scroll current tier into view
  const curRow=document.querySelector('.bp-row-cur');
  if(curRow) setTimeout(()=>curRow.scrollIntoView({behavior:'smooth',block:'center'}),100);
}
