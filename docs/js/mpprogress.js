'use strict';
// ═══════════════════════════════════════════════════════════════
//  MULTIPLAYER PROGRESSION + WEEKLY CHALLENGES
//  Lightweight layer on top of the existing save system. MP XP/level,
//  mode stats, weekly rotating challenges with cosmetic rewards.
// ═══════════════════════════════════════════════════════════════

// Convoy-exclusive cosmetics (registered into the existing catalogs,
// kept out of shop/summon pools — source:'convoy')
(function(){
  if(typeof PROFILE_TITLES!=='undefined'){
    [['title_convoy_def','Convoy Defender','epic'],
     ['title_convoy_break','Convoy Breaker','epic'],
     ['title_escort_elite','Escort Elite','legendary']].forEach(t=>{
      if(!PROFILE_TITLES.find(x=>x[0]===t[0])) PROFILE_TITLES.push(t);
    });
  }
  if(typeof PROFILE_BADGES!=='undefined'){
    [['badge_roadblock','Roadblock Specialist','🚧','epic'],
     ['badge_mp_vet','12-Player Veteran','🎖️','legendary']].forEach(b=>{
      if(!PROFILE_BADGES.find(x=>x[0]===b[0])) PROFILE_BADGES.push(b);
    });
  }
  if(typeof PROFILE_ICONS!=='undefined'){
    [['icon_missile_escort','Missile Escort','🚚','epic'],
     ['icon_convoy','Convoy','🛻','rare']].forEach(i=>{
      if(!PROFILE_ICONS.find(x=>x[0]===i[0])) PROFILE_ICONS.push(i);
    });
  }
  if(typeof CALLING_CARDS!=='undefined'&&!CALLING_CARDS.find(c=>c[0]==='card_escort_elite'))
    CALLING_CARDS.push(['card_escort_elite','Escort Elite','#2A3A14','#0A1206','#FFD060','🚚','legendary']);
  if(typeof WEAPON_CAMOS!=='undefined'){
    const add=(w,c)=>{ if(WEAPON_CAMOS[w]&&!WEAPON_CAMOS[w].find(x=>x.id===c.id)) WEAPON_CAMOS[w].push(Object.assign({weaponId:w,source:'convoy',price:0},c)); };
    add('launcher',{id:'cv_convoy', name:'Convoy Ops', hexStr:'#3A4A2A',accentStr:'#FFB040',rarity:'epic',pattern:'stripe',materialStyle:'matte'});
    add('smg',     {id:'cv_escort', name:'Escort',     hexStr:'#2A3A5A',accentStr:'#FFD060',rarity:'epic',pattern:'digital',materialStyle:'matte'});
  }
  if(typeof RICHARD_SKINS!=='undefined'&&!RICHARD_SKINS.find(s=>s.id==='richard_convoy_vet'))
    RICHARD_SKINS.push({id:'richard_convoy_vet',name:'Convoy Veteran',tagline:'12-player veteran reward',price:0,rarity:'legendary',source:'convoy',
      custo:{outfitColor:'#3A4A2A',visorColor:'#FFD060',skinTone:'#C8A070',armorStyle:'heavy',helmet:true,backpack:'missile',gear:'bandolier'}});
})();

// ── MP XP / level ──────────────────────────────────────────────
function _mpLevelForXp(xp){ return Math.floor((xp||0)/1000); }
function addMpXp(n){
  if(!n) return;
  const before=_mpLevelForXp(saveData.mpXp||0);
  saveData.mpXp=(saveData.mpXp||0)+n;
  const after=_mpLevelForXp(saveData.mpXp);
  saveData.mpLevel=after;
  if(after>before&&typeof showNotif==='function') showNotif('★ MULTIPLAYER LEVEL '+after+'!');
  // MP XP also feeds the battle pass
  if(typeof saveData.bpXP==='number'){
    saveData.bpXP+=Math.round(n*.5);
    const bl=Math.floor(saveData.bpXP/500);
    if(bl>(saveData.bpLevel||0)) saveData.bpLevel=bl;
  }
  try{localStorage.setItem(SAVE_KEY,JSON.stringify(saveData));}catch(e){}
}

// ── Weekly challenges — deterministic weekly rotation ──────────
const MP_WEEKLY_POOL=[
  {id:'convoyWins',  name:'Escort Master',      desc:'Win Convoy Crisis matches',     target:3,    reward:{summonTickets:2}},
  {id:'convoyDamage',name:'Convoy Breaker',     desc:'Deal convoy damage',            target:5000, reward:{credits:3000}},
  {id:'convoyRepair',name:'Field Engineer',     desc:'Repair convoy health',          target:3000, reward:{card:'card_escort_elite'}},
  {id:'mpIntercepts',name:'Sky Shield Online',  desc:'Intercept missiles in MP',      target:100,  reward:{pcIcon:'icon_missile_escort'}},
  {id:'duelWins',    name:'Duelist',            desc:'Win 1v1 rounds',                target:10,   reward:{chronoShards:600}},
  {id:'battleKills', name:'Battle Hardened',    desc:'Get kills in Battle Mode',      target:50,   reward:{badge:'badge_mp_vet'}},
  {id:'coopMissions',name:'Co-op Operative',    desc:'Complete co-op waves',          target:24,   reward:{credits:2000}},
  {id:'rolesUsed',   name:'All-Rounder',        desc:'Use every Convoy role once',    target:4,    reward:{title:'title_escort_elite'}},
];
// Week key = the date of the most recent Monday (UAE time). Changes
// every Monday 00:00 UAE, matching the displayed "resets in" countdown.
function _mpWeekKey(){
  const now=new Date(Date.now()+4*3600000);
  const day=now.getUTCDay();            // 0 Sun .. 6 Sat
  const back=(day+6)%7;                 // days since Monday
  const mon=new Date(Date.UTC(now.getUTCFullYear(),now.getUTCMonth(),now.getUTCDate()-back));
  return 'W'+mon.toISOString().slice(0,10);
}
function _mpWeeklyChallenges(){
  const key=_mpWeekKey();
  // seeded pick of 4 from pool
  let seed=0; for(const c of key) seed=(seed*31+c.charCodeAt(0))>>>0;
  const pool=MP_WEEKLY_POOL.slice();
  const out=[];
  for(let i=0;i<4&&pool.length;i++){ seed=(seed*1664525+1013904223)>>>0; out.push(pool.splice(seed%pool.length,1)[0]); }
  return{key,list:out};
}
function _mpChallState(){
  const wk=_mpWeeklyChallenges();
  if(saveData.mpWeekKey!==wk.key){
    saveData.mpWeekKey=wk.key;
    saveData.mpChallProg={};
    saveData.mpChallClaimed={};
    try{localStorage.setItem(SAVE_KEY,JSON.stringify(saveData));}catch(e){}
  }
  return wk;
}
function _mpChallProgress(stat,n){
  if(!n) return;
  _mpChallState();
  if(!saveData.mpChallProg) saveData.mpChallProg={};
  const wk=_mpWeeklyChallenges();
  wk.list.forEach(c=>{ if(c.id===stat) saveData.mpChallProg[c.id]=(saveData.mpChallProg[c.id]||0)+n; });
  try{localStorage.setItem(SAVE_KEY,JSON.stringify(saveData));}catch(e){}
}
function mpClaimChallenge(id){
  const wk=_mpWeeklyChallenges();
  const c=wk.list.find(x=>x.id===id); if(!c) return;
  if((saveData.mpChallClaimed||{})[id]) return;
  if((saveData.mpChallProg||{})[id]<c.target){ showNotif('Challenge not complete yet!'); return; }
  const upd=typeof _bpGrant==='function'?_bpGrant(c.reward):{};
  if(!saveData.mpChallClaimed) saveData.mpChallClaimed={};
  saveData.mpChallClaimed[id]=true; upd['saveData.mpChallClaimed.'+id]=true;
  if(_fbUser&&_fbDb) _fbDb.collection('users').doc(_fbUser.uid).update(upd).catch(()=>{});
  saveSave();
  const info=typeof _bpRewardInfo==='function'?_bpRewardInfo(c.reward):{label:'Reward'};
  if(typeof sfxPurchase==='function') sfxPurchase();
  showNotif(c.name+': '+info.label+' claimed!');
  if(typeof updateSaveUI==='function') updateSaveUI();
  buildMpHubScreen();
}

// ── Multiplayer hub screen (mode cards + progression + challenges)
function buildMpHubScreen(){
  const host=document.getElementById('mpHubContent');
  if(!host) return;
  const lvl=saveData.mpLevel||0, xp=saveData.mpXp||0, inLvl=xp-lvl*1000;
  const wk=_mpChallState();
  const modes=[
    {id:'convoy', name:'CONVOY CRISIS', players:'12 Players · 6v6', len:'~7 min',
     desc:'Escort or destroy the convoy under missile fire.', rew:'Credits · XP · Calling Cards · Camos', go:'openConvoySetup()'},
    {id:'battle', name:'BATTLE MODE', players:'2-4 Players', len:'~5 min',
     desc:'Team gulag with scorestreaks and missile pressure.', rew:'Credits · XP', go:"mpSetMode('battle');showScreen('lobbyScreen')"},
    {id:'coop',   name:'CO-OP DEFENSE', players:'2-4 Players', len:'~10 min',
     desc:'Survive 12 waves, bosses every 4, side objectives.', rew:'Credits · XP', go:"mpSetMode('coop');showScreen('lobbyScreen')"},
    {id:'duel',   name:'1V1 DUEL', players:'2 Players', len:'~4 min',
     desc:'Best-of with random round modifiers and killcam.', rew:'Credits · XP', go:"mpSetMode('battle');showScreen('lobbyScreen')"},
  ];
  const cards=modes.map(m=>`<div class="mp-mode-card mp-mode-${m.id}" onclick="${m.go}">
    <div class="mp-mode-name">${m.name}</div>
    <div class="mp-mode-players">${m.players} · ${m.len}</div>
    <div class="mp-mode-desc">${m.desc}</div>
    <div class="mp-mode-rew">REWARDS: ${m.rew}</div>
    <div class="mp-mode-go">▶ PLAY</div>
  </div>`).join('');
  const chall=wk.list.map(c=>{
    const prog=Math.min(c.target,(saveData.mpChallProg||{})[c.id]||0);
    const done=prog>=c.target, claimed=(saveData.mpChallClaimed||{})[c.id];
    const info=typeof _bpRewardInfo==='function'?_bpRewardInfo(c.reward):{icon:'?',label:''};
    return `<div class="mp-chall ${claimed?'mp-chall-claimed':done?'mp-chall-ready':''}">
      <div class="mp-chall-info">
        <div class="mp-chall-name">${c.name}</div>
        <div class="mp-chall-desc">${c.desc}</div>
        <div class="mp-chall-bar"><div class="mp-chall-fill" style="width:${prog/c.target*100}%"></div></div>
        <div class="mp-chall-prog">${prog.toLocaleString()} / ${c.target.toLocaleString()}</div>
      </div>
      <div class="mp-chall-rw" title="${info.label}">${info.icon}
        ${claimed?'<div class="mp-chall-done">✓</div>':done?`<button class="mp-chall-claim" onclick="event.stopPropagation();mpClaimChallenge('${c.id}')">CLAIM</button>`:''}
      </div>
    </div>`;
  }).join('');
  host.innerHTML=`
    <div class="mp-hub-head">
      <div class="mp-hub-title">MULTIPLAYER</div>
      <div class="mp-hub-lvl">MP LEVEL ${lvl}
        <div class="mp-hub-xpbar"><div class="mp-hub-xpfill" style="width:${inLvl/1000*100}%"></div></div>
        <span class="mp-hub-xptext">${inLvl} / 1000 XP</span>
      </div>
    </div>
    <div class="mp-mode-grid">${cards}</div>
    <div class="mp-chall-head">WEEKLY CHALLENGES · resets ${_mpWeeklyResetIn()}</div>
    <div class="mp-chall-list">${chall}</div>
    <div class="mp-bot-row">
      <button class="mp-bot-btn" onclick="startBotMatch()">🤖 PLAY VS BOTS — PRACTICE ARENA</button>
      <div class="mp-bot-note">Fight a decent AI squad. Grants a little MP XP. No challenge or achievement progress.</div>
    </div>`;
}

// Human-readable time until the weekly reset (next UAE Monday 00:00)
function _mpWeeklyResetIn(){
  const now=new Date(Date.now()+4*3600000);
  const day=now.getUTCDay(); // 0 Sun .. 6 Sat
  const daysToMon=((8-day)%7)||7;
  const reset=Date.UTC(now.getUTCFullYear(),now.getUTCMonth(),now.getUTCDate()+daysToMon)-4*3600000;
  const ms=reset-Date.now();
  const d=Math.floor(ms/86400000), h=Math.floor((ms%86400000)/3600000);
  return d>0?('in '+d+'d '+h+'h'):('in '+h+'h');
}

// ── Convoy setup (team + role select) ──────────────────────────
let _cvSetupTeam='defender',_cvSetupRole='interceptor';
function openConvoySetup(){
  _cvSetupTeam='defender'; _cvSetupRole='interceptor';
  if(saveData.mpRolesUsed===undefined) saveData.mpRolesUsed={};
  _renderConvoySetup();
  showScreen('convoySetupScreen');
}
function _renderConvoySetup(){
  const host=document.getElementById('convoySetupContent');
  if(!host) return;
  const roles=['interceptor','heavy','engineer','scout'];
  host.innerHTML=`
    <div class="cvs-title">CONVOY CRISIS</div>
    <div class="cvs-sub">6 ATTACKERS vs 6 DEFENDERS · empty slots filled by bots</div>
    <div class="cvs-section">CHOOSE SIDE</div>
    <div class="cvs-teams">
      <div class="cvs-team ${_cvSetupTeam==='defender'?'on':''}" onclick="_cvSetupTeam='defender';_renderConvoySetup()">
        <div class="cvs-team-name">DEFENDERS</div><div class="cvs-team-desc">Escort & repair the convoy. Intercept missiles.</div></div>
      <div class="cvs-team ${_cvSetupTeam==='attacker'?'on':''}" onclick="_cvSetupTeam='attacker';_renderConvoySetup()">
        <div class="cvs-team-name">ATTACKERS</div><div class="cvs-team-desc">Ambush the convoy. Roadblocks & strikes.</div></div>
    </div>
    <div class="cvs-section">CHOOSE ROLE</div>
    <div class="cvs-roles">${roles.map(r=>{const R=CV_ROLES[r];
      return `<div class="cvs-role ${_cvSetupRole===r?'on':''}" onclick="_cvSetupRole='${r}';_renderConvoySetup()">
        <div class="cvs-role-icon">${R.icon}</div><div class="cvs-role-name">${R.name}</div>
        <div class="cvs-role-desc">${R.desc}</div></div>`;}).join('')}
    </div>
    <div class="cvs-actions">
      <button class="menu-btn btn-secondary" onclick="buildMpHubScreen();showScreen('mpHubScreen')">← Back</button>
      <button class="menu-btn btn-primary" onclick="_cvDeploy()">DEPLOY</button>
    </div>`;
}
function _cvDeploy(){
  if(!saveData.mpRolesUsed) saveData.mpRolesUsed={};
  if(!saveData.mpRolesUsed[_cvSetupRole]){
    saveData.mpRolesUsed[_cvSetupRole]=true;
    _mpChallProgress('rolesUsed',1);
  }
  startConvoyCrisis(_cvSetupTeam,_cvSetupRole);
}
