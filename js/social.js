// Firebase social layer: presence, friends, party, UI rendering
'use strict';

// ═══════════════════════════════════════════════════════════════
//  SOCIAL STATE
// ═══════════════════════════════════════════════════════════════
let socialState = {
  friends: [],         // [{uid, username}]
  friendRequests: [],  // [{id, fromUid, fromUsername}] incoming
  sentRequests: [],    // [{id, toUid, toUsername}] outgoing
  party: null,         // {id, hostUid, members:[{uid,username,ready}], selectedMap, mode, state}
  partyInvites: [],    // [{id, partyId, fromUid, fromUsername}]
  presence: {},        // {uid: status}
};

let _socialUnsubs = [];
let _friendPresenceUnsubs = [];
let _presenceInterval = null;

// ═══════════════════════════════════════════════════════════════
//  PRESENCE
// ═══════════════════════════════════════════════════════════════
async function setPresence(status){
  if(!_fbUser||!_fbDb) return;
  try{
    await _fbDb.collection('presence').doc(_fbUser.uid).set({
      status, uid:_fbUser.uid,
      username: mpUser?.username||'',
      lastSeen: firebase.firestore.FieldValue.serverTimestamp()
    },{merge:true});
  }catch(e){}
}

function _startPresenceHeartbeat(){
  setPresence('lobby');
  if(_presenceInterval) clearInterval(_presenceInterval);
  _presenceInterval = setInterval(()=>{
    const status = gameActive?'in_match':socialState.party?'in_party':'lobby';
    setPresence(status);
  }, 30000);
  window.addEventListener('beforeunload', _setOffline);
}

function _stopPresenceHeartbeat(){
  if(_presenceInterval){ clearInterval(_presenceInterval); _presenceInterval=null; }
  window.removeEventListener('beforeunload', _setOffline);
  setPresence('offline');
}

function _setOffline(){
  if(!_fbUser||!_fbDb) return;
  _fbDb.collection('presence').doc(_fbUser.uid)
    .set({status:'offline'},{merge:true}).catch(()=>{});
}

// ═══════════════════════════════════════════════════════════════
//  FRIENDS
// ═══════════════════════════════════════════════════════════════
async function fbSearchUser(query){
  if(!_fbDb||!query||query.length<2) return [];
  const q = query.trim().toUpperCase().replace(/[^A-Z0-9_]/g,'').toLowerCase();
  try{
    const snap = await _fbDb.collection('usernames')
      .orderBy(firebase.firestore.FieldPath.documentId())
      .startAt(q).endAt(q+'').limit(10).get();
    const results=[];
    snap.forEach(doc=>{
      if(doc.data().uid!==_fbUser.uid)
        results.push({uid:doc.data().uid, username:doc.id.toUpperCase()});
    });
    return results;
  }catch(e){ return []; }
}

async function fbSendFriendRequest(targetUid, targetUsername){
  if(!_fbDb||!_fbUser) return;
  const myUid=_fbUser.uid, myUsername=mpUser?.username||'';
  if(socialState.friends.some(f=>f.uid===targetUid)){showNotif('Already friends!');return;}
  if(socialState.sentRequests.some(r=>r.toUid===targetUid)){showNotif('Request already sent.');return;}
  try{
    await _fbDb.collection('friendRequests').doc().set({
      fromUid:myUid, fromUsername:myUsername,
      toUid:targetUid, toUsername:targetUsername,
      createdAt:firebase.firestore.FieldValue.serverTimestamp()
    });
    showNotif('Friend request sent to '+targetUsername+'!');
    renderFriendsScreen();
  }catch(e){showNotif('Error sending request.');}
}

async function fbAcceptFriendRequest(reqId, fromUid, fromUsername){
  if(!_fbDb||!_fbUser) return;
  const myUid=_fbUser.uid, myUsername=mpUser?.username||'';
  try{
    const batch=_fbDb.batch();
    batch.set(_fbDb.collection('friends').doc(myUid).collection('list').doc(fromUid),
      {username:fromUsername, addedAt:firebase.firestore.FieldValue.serverTimestamp()});
    batch.set(_fbDb.collection('friends').doc(fromUid).collection('list').doc(myUid),
      {username:myUsername, addedAt:firebase.firestore.FieldValue.serverTimestamp()});
    batch.delete(_fbDb.collection('friendRequests').doc(reqId));
    await batch.commit();
    showNotif('You and '+fromUsername+' are now friends!');
  }catch(e){showNotif('Error accepting request.');}
}

async function fbDeclineFriendRequest(reqId){
  if(!_fbDb) return;
  try{ await _fbDb.collection('friendRequests').doc(reqId).delete(); }catch(e){}
}

async function fbRemoveFriend(friendUid){
  if(!_fbDb||!_fbUser) return;
  const myUid=_fbUser.uid;
  try{
    const batch=_fbDb.batch();
    batch.delete(_fbDb.collection('friends').doc(myUid).collection('list').doc(friendUid));
    batch.delete(_fbDb.collection('friends').doc(friendUid).collection('list').doc(myUid));
    await batch.commit();
    showNotif('Friend removed.');
  }catch(e){}
}

// ═══════════════════════════════════════════════════════════════
//  PARTY
// ═══════════════════════════════════════════════════════════════
async function _createOrGetParty(){
  if(!_fbDb||!_fbUser) return null;
  if(socialState.party) return socialState.party.id;
  const myUid=_fbUser.uid;
  const partyRef=_fbDb.collection('parties').doc();
  await partyRef.set({
    hostUid:myUid,
    members:[{uid:myUid, username:mpUser?.username||'?', ready:false}],
    selectedMap: saveData.locId||'beirut',
    mode:'coop', state:'lobby',
    createdAt:firebase.firestore.FieldValue.serverTimestamp()
  });
  _listenParty(partyRef.id);
  return partyRef.id;
}

async function fbInviteToParty(friendUid, friendUsername){
  if(!_fbDb||!_fbUser) return;
  const partyId = await _createOrGetParty();
  if(!partyId) return;
  if(socialState.party&&socialState.party.members.some(m=>m.uid===friendUid)){
    showNotif(friendUsername+' is already in your party.'); return;
  }
  try{
    await _fbDb.collection('partyInvites').doc().set({
      partyId, fromUid:_fbUser.uid,
      fromUsername:mpUser?.username||'?',
      toUid:friendUid,
      createdAt:firebase.firestore.FieldValue.serverTimestamp()
    });
    showNotif('Invite sent to '+friendUsername+'!');
  }catch(e){showNotif('Error sending invite.');}
}

async function fbAcceptPartyInvite(inviteId, partyId){
  if(!_fbDb||!_fbUser) return;
  const myUid=_fbUser.uid;
  try{
    const partyRef=_fbDb.collection('parties').doc(partyId);
    const partySnap=await partyRef.get();
    if(!partySnap.exists){showNotif('Party no longer exists.');return;}
    const members=partySnap.data().members||[];
    if(members.length>=4){showNotif('Party is full!');return;}
    if(!members.some(m=>m.uid===myUid)){
      members.push({uid:myUid, username:mpUser?.username||'?', ready:false});
      await partyRef.update({members});
    }
    await _fbDb.collection('partyInvites').doc(inviteId).delete();
    // Hide popup
    const popup=document.getElementById('partyInvitePopup');
    if(popup) popup.style.display='none';
    socialState.partyInvites=socialState.partyInvites.filter(i=>i.id!==inviteId);
    setPresence('in_party');
    _listenParty(partyId);
    showNotif('Joined party!');
    showScreen('mainMenu');
    renderLobby();
  }catch(e){showNotif('Error joining party.');}
}

async function fbDeclinePartyInvite(inviteId){
  if(!_fbDb) return;
  try{ await _fbDb.collection('partyInvites').doc(inviteId).delete(); }catch(e){}
  socialState.partyInvites=socialState.partyInvites.filter(i=>i.id!==inviteId);
  const popup=document.getElementById('partyInvitePopup');
  if(popup) popup.style.display='none';
  if(socialState.partyInvites.length>0) _showPartyInvitePopup();
}

async function fbLeaveParty(){
  if(!_fbDb||!_fbUser||!socialState.party) return;
  const myUid=_fbUser.uid, partyId=socialState.party.id;
  try{
    const partyRef=_fbDb.collection('parties').doc(partyId);
    const snap=await partyRef.get();
    if(!snap.exists){socialState.party=null;renderLobby();return;}
    const members=(snap.data().members||[]).filter(m=>m.uid!==myUid);
    if(members.length===0){
      await partyRef.delete();
    } else {
      await partyRef.update({members, hostUid:members[0].uid});
    }
    socialState.party=null;
    setPresence('lobby');
    renderLobby();
  }catch(e){}
}

async function fbToggleReady(){
  if(!_fbDb||!_fbUser||!socialState.party) return;
  const myUid=_fbUser.uid;
  const partyRef=_fbDb.collection('parties').doc(socialState.party.id);
  const snap=await partyRef.get();
  if(!snap.exists) return;
  const members=snap.data().members.map(m=>
    m.uid===myUid?{...m,ready:!m.ready}:m
  );
  await partyRef.update({members});
}

async function fbSetPartyMap(locId){
  if(!_fbDb||!socialState.party) return;
  await _fbDb.collection('parties').doc(socialState.party.id).update({selectedMap:locId});
}

async function fbSetPartyMode(mode){
  if(!_fbDb||!socialState.party) return;
  await _fbDb.collection('parties').doc(socialState.party.id).update({mode});
}

async function fbDeployParty(){
  if(!_fbDb||!_fbUser||!socialState.party) return;
  const party=socialState.party;
  if(party.hostUid!==_fbUser.uid){showNotif('Only the host can deploy.');return;}
  const nonHostReady=party.members.filter(m=>m.uid!==party.hostUid).every(m=>m.ready);
  if(party.members.length>1&&!nonHostReady){showNotif('Not all members are ready!');return;}
  await _fbDb.collection('parties').doc(party.id).update({state:'deploying'});
  startGame(party.selectedMap||saveData.locId||'beirut',1);
}

// ═══════════════════════════════════════════════════════════════
//  LISTENERS
// ═══════════════════════════════════════════════════════════════
function _listenFriends(){
  if(!_fbDb||!_fbUser) return;
  const uid=_fbUser.uid;
  const unsub=_fbDb.collection('friends').doc(uid).collection('list')
    .onSnapshot(snap=>{
      socialState.friends=[];
      snap.forEach(doc=>socialState.friends.push({uid:doc.id, username:doc.data().username}));
      _listenFriendPresence();
      renderLobby();
      if(currentScreen==='friendsScreen') renderFriendsScreen();
    },e=>{});
  _socialUnsubs.push(unsub);
}

function _listenFriendPresence(){
  _friendPresenceUnsubs.forEach(u=>u());
  _friendPresenceUnsubs=[];
  socialState.friends.forEach(f=>{
    const u=_fbDb.collection('presence').doc(f.uid)
      .onSnapshot(snap=>{
        socialState.presence[f.uid]=snap.exists?(snap.data().status||'offline'):'offline';
        renderLobby();
        if(currentScreen==='friendsScreen') renderFriendsScreen();
      },e=>{});
    _friendPresenceUnsubs.push(u);
  });
}

function _listenFriendRequests(){
  if(!_fbDb||!_fbUser) return;
  const uid=_fbUser.uid;
  // Incoming
  const u1=_fbDb.collection('friendRequests').where('toUid','==',uid)
    .onSnapshot(snap=>{
      socialState.friendRequests=[];
      snap.forEach(doc=>socialState.friendRequests.push({
        id:doc.id, fromUid:doc.data().fromUid, fromUsername:doc.data().fromUsername
      }));
      updateFriendRequestBadge();
      if(currentScreen==='friendsScreen') renderFriendsScreen();
    },e=>{});
  _socialUnsubs.push(u1);
  // Outgoing
  const u2=_fbDb.collection('friendRequests').where('fromUid','==',uid)
    .onSnapshot(snap=>{
      socialState.sentRequests=[];
      snap.forEach(doc=>socialState.sentRequests.push({
        id:doc.id, toUid:doc.data().toUid, toUsername:doc.data().toUsername
      }));
      if(currentScreen==='friendsScreen') renderFriendsScreen();
    },e=>{});
  _socialUnsubs.push(u2);
}

function _listenParty(partyId){
  if(!_fbDb) return;
  const unsub=_fbDb.collection('parties').doc(partyId)
    .onSnapshot(snap=>{
      if(!snap.exists){
        socialState.party=null;
        setPresence('lobby');
        renderLobby();
        return;
      }
      const d=snap.data();
      socialState.party={id:partyId,...d};
      renderLobby();
      // Non-host gets game-start signal
      if(d.state==='deploying'&&d.hostUid!==_fbUser?.uid){
        const loc=d.selectedMap||'beirut';
        const sz=(d.members||[]).length;
        showDeployOverlay(loc,d.mode||'coop',sz,()=>startGame(loc,1));
      }
    },e=>{ socialState.party=null; });
  _socialUnsubs.push(unsub);
}

function _listenPartyInvites(){
  if(!_fbDb||!_fbUser) return;
  const uid=_fbUser.uid;
  const unsub=_fbDb.collection('partyInvites').where('toUid','==',uid)
    .onSnapshot(snap=>{
      socialState.partyInvites=[];
      snap.forEach(doc=>socialState.partyInvites.push({id:doc.id,...doc.data()}));
      if(socialState.partyInvites.length>0) _showPartyInvitePopup();
      renderLobby();
    },e=>{});
  _socialUnsubs.push(unsub);
}

function startSocialListeners(){
  if(!_fbUser||!_fbDb) return;
  stopSocialListeners();
  _listenFriends();
  _listenFriendRequests();
  _listenPartyInvites();
  _startPresenceHeartbeat();
  if(typeof initLobbyScene==='function') initLobbyScene();
  initLobbyChat();
  renderLobby();
  updateNavUser();
}

function stopSocialListeners(){
  _socialUnsubs.forEach(u=>u());
  _socialUnsubs=[];
  _friendPresenceUnsubs.forEach(u=>u());
  _friendPresenceUnsubs=[];
  _stopPresenceHeartbeat();
}

// ═══════════════════════════════════════════════════════════════
//  NAV USER
// ═══════════════════════════════════════════════════════════════
function updateNavUser(){
  const name=mpUser?.username||'—';
  const credits='💰 '+(saveData.currency||0);
  // Top nav (other hub screens)
  const nu=document.getElementById('navUsername');
  const nc=document.getElementById('navCredits');
  if(nu) nu.textContent=name;
  if(nc) nc.textContent=credits;
  // Lobby embedded nav
  const ru=document.getElementById('rlCallsign');
  const rc=document.getElementById('rlCredits');
  if(ru) ru.textContent=name;
  if(rc) rc.textContent=credits;
  // Bottom bar
  const ub=document.getElementById('menuUserBadge');
  if(ub&&name!=='—') ub.textContent=name;
}

// ═══════════════════════════════════════════════════════════════
//  FRIEND REQUEST BADGE
// ═══════════════════════════════════════════════════════════════
function updateFriendRequestBadge(){
  const count=socialState.friendRequests.length;
  ['navFriendBadge','rlFriendBadge'].forEach(id=>{
    const b=document.getElementById(id);
    if(!b) return;
    b.textContent=count>0?count:'';
    b.style.display=count>0?'inline-flex':'none';
  });
}

// ═══════════════════════════════════════════════════════════════
//  PARTY INVITE POPUP
// ═══════════════════════════════════════════════════════════════
function _showPartyInvitePopup(){
  const inv=socialState.partyInvites[0];
  if(!inv) return;
  let popup=document.getElementById('partyInvitePopup');
  if(!popup){
    popup=document.createElement('div');
    popup.id='partyInvitePopup';
    popup.className='party-invite-popup';
    document.body.appendChild(popup);
  }
  popup.innerHTML=`
    <div class="pip-title">Party Invite</div>
    <div class="pip-from">${inv.fromUsername} invited you</div>
    <div class="pip-actions">
      <button class="menu-btn btn-primary" style="width:90px;font-size:.76em;margin:0 6px 0 0;"
        onclick="fbAcceptPartyInvite('${inv.id}','${inv.partyId}')">Accept</button>
      <button class="menu-btn btn-secondary" style="width:80px;font-size:.76em;margin:0;"
        onclick="fbDeclinePartyInvite('${inv.id}')">Decline</button>
    </div>`;
  popup.style.display='block';
}

// ═══════════════════════════════════════════════════════════════
//  LOBBY HUB RENDER
// ═══════════════════════════════════════════════════════════════
function renderLobby(){
  updateNavUser();
  updateFriendRequestBadge();
  if(currentScreen!=='mainMenu') return;
  _renderPartySlots();
  _renderPlayPanel();
  _renderSeasonPanel();
  syncPartyProfiles();
}

function _renderPartySlots(){
  const el=document.getElementById('lobbyPartySlots');
  if(!el) return;
  const party=socialState.party;
  const myUid=_fbUser?.uid;

  if(!party){
    el.innerHTML=`
      <div class="party-slot self">
        <div class="party-slot-av">${_initial(mpUser?.username)}</div>
        <div class="party-slot-info">
          <div class="party-slot-name">${mpUser?.username||'—'}</div>
          <div class="party-slot-status s-online">Online</div>
        </div>
        <div class="party-slot-badges"><span class="ps-badge host">HOST</span></div>
      </div>
      ${[1,2,3].map(()=>`
      <div class="party-slot empty" onclick="renderFriendsScreen();showScreen('friendsScreen')">
        <div class="party-slot-plus">+</div>
        <div class="party-slot-addlbl">Invite Friend</div>
      </div>`).join('')}`;
  } else {
    const members=party.members||[];
    const me=members.find(m=>m.uid===myUid)||{uid:myUid,username:mpUser?.username||'?',ready:false};
    let html=_partySlotHTML(me,party.hostUid,true);
    members.filter(m=>m.uid!==myUid).forEach(m=>{html+=_partySlotHTML(m,party.hostUid,false);});
    for(let i=members.length;i<4;i++)
      html+=`<div class="party-slot empty" onclick="renderFriendsScreen();showScreen('friendsScreen')"><div class="party-slot-plus">+</div><div class="party-slot-addlbl">Invite Friend</div></div>`;
    el.innerHTML=html;
  }

  const actEl=document.getElementById('lobbyPartyActions');
  if(actEl){
    actEl.innerHTML=party?`<button class="rl-sm-btn" style="margin-top:4px;" onclick="fbLeaveParty()">↩ LEAVE PARTY</button>`:'';
  }
}

function _initial(name){ return (name||'?').charAt(0).toUpperCase(); }

function _partySlotHTML(member, hostUid, isSelf){
  const status=isSelf?'online':(socialState.presence[member.uid]||'offline');
  const statusClass='s-'+(status==='in_match'?'match':status==='in_party'?'party':status==='offline'?'offline':'online');
  const statusLabel=status==='in_match'?'In Match':status==='in_party'?'In Party':status==='offline'?'Offline':'Online';
  const isHost=member.uid===hostUid;
  return `<div class="party-slot${isSelf?' self':''}">
    <div class="party-slot-av">${_initial(member.username)}</div>
    <div class="party-slot-info">
      <div class="party-slot-name">${member.username}</div>
      <div class="party-slot-status ${statusClass}">${statusLabel}</div>
    </div>
    <div class="party-slot-badges">
      ${isHost?'<span class="ps-badge host">HOST</span>':''}
      ${isSelf?`<span class="ps-badge ${member.ready?'ready':'notready'}" onclick="fbToggleReady()" style="cursor:pointer">${member.ready?'READY':'NOT READY'}</span>`:`<span class="ps-badge ${member.ready?'ready':'notready'}">${member.ready?'READY':'...'}</span>`}
    </div>
  </div>`;
}

function _renderPlayPanel(){
  const el=document.getElementById('rlModePanel');
  if(!el) return;
  const party=socialState.party;
  const myUid=_fbUser?.uid;
  const isHost=!party||party.hostUid===myUid;
  const selMap=(party?party.selectedMap:saveData.locId)||'beirut';
  const mode=party?(party.mode||'coop'):'solo';
  const maps=[
    {id:'beirut',label:'BEIRUT',sub:'Urban'},
    {id:'sweden',label:'SWEDEN',sub:'Arctic'},
    {id:'dubai', label:'DUBAI', sub:'Desert'},
  ];
  const allReady=!party||(party.members||[]).every(m=>m.ready);
  const myMember=party?(party.members||[]).find(m=>m.uid===myUid):null;
  const imReady=myMember?.ready||false;
  let deployHtml='';
  if(!party){
    deployHtml=`<button class="rl-deploy-btn btn-ready" onclick="deployFromLobby()">▶ DEPLOY</button>`;
  } else if(isHost){
    if(allReady){
      deployHtml=`<div class="rl-squad-status all-ready">SQUAD READY</div>
        <button class="rl-deploy-btn btn-deploy" onclick="deployFromLobby()">▶ DEPLOY SQUAD</button>`;
    } else {
      deployHtml=`<div class="rl-squad-status">WAITING FOR SQUAD</div>
        <button class="rl-deploy-btn" disabled>WAITING…</button>`;
    }
  } else {
    deployHtml=imReady
      ?`<div class="rl-waiting-lbl">READY ✓ — WAITING FOR LEADER</div>`
      :`<button class="rl-deploy-btn btn-ready" onclick="fbToggleReady()">✓ READY UP</button>`;
  }
  el.innerHTML=`
    <div class="rl-section-hd">GAME MODE</div>
    ${party?`<div class="rl-mode-btns">
      <button class="rl-mode-toggle${mode==='coop'?' active':''}" onclick="${isHost?`fbSetPartyMode('coop');renderLobby()`:''}" ${!isHost?'disabled':''}>SQUAD</button>
      <button class="rl-mode-toggle${mode==='solo'?' active':''}" onclick="${isHost?`fbSetPartyMode('solo');renderLobby()`:''}" ${!isHost?'disabled':''}>SOLO</button>
    </div>`:''}
    <div class="rl-mode-selected">
      <div class="rl-mode-name">${mode==='coop'?'SQUAD DEFENSE':'SOLO DEFENSE'}</div>
    </div>
    <div class="rl-section-hd" style="margin-top:10px;">MISSION ZONE</div>
    <div class="rl-map-row">
      ${maps.map(m=>`<button class="rl-map-btn${selMap===m.id?' active':''}"
        onclick="${isHost?`_setLobbyMap('${m.id}')`:''}" ${!isHost?'disabled':''}>
        ${m.label}<span class="rl-map-sub">${m.sub}</span>
      </button>`).join('')}
    </div>
    <div class="rl-threat-row">
      <span class="rl-threat-lbl">THREAT LEVEL</span>
      <span class="rl-threat-val">HIGH</span>
    </div>
    <div class="rl-deploy-wrap">${deployHtml}</div>`;
}

function _setLobbyMap(locId){
  saveData.locId=locId; saveSave();
  if(socialState.party) fbSetPartyMap(locId);
  renderLobby();
}

function deployFromLobby(){
  if(socialState.party){
    fbDeployParty();
  } else {
    const loc=saveData.locId||'beirut';
    showDeployOverlay(loc,'solo',1,()=>{
      saveData.locId=loc;
      saveSave();
      startGame(loc,1);
    });
  }
}

function _renderSidebarFriends(){
  const el=document.getElementById('lobbySidebarFriends');
  if(!el) return;
  const online=socialState.friends.filter(f=>{
    const s=socialState.presence[f.uid];
    return s&&s!=='offline';
  });
  if(online.length===0){
    el.innerHTML=`<div class="sidebar-no-friends">No friends online.<br>
      <a href="#" onclick="renderFriendsScreen();showScreen('friendsScreen');return false"
        style="color:var(--blue-light);font-size:.82em;">Add friends →</a></div>`;
    return;
  }
  el.innerHTML=online.map(f=>{
    const status=socialState.presence[f.uid]||'online';
    const lbl=status==='in_match'?'In Match':status==='in_party'?'In Party':'Online';
    return `<div class="sidebar-friend">
      <div class="sidebar-friend-av">${_initial(f.username)}</div>
      <div class="sidebar-friend-info">
        <div class="sidebar-friend-name">${f.username}</div>
        <div class="sidebar-friend-status s-${status==='in_match'?'match':status==='in_party'?'party':'online'}">${lbl}</div>
      </div>
      ${socialState.party||status==='online'?`<button class="sidebar-invite-btn" onclick="fbInviteToParty('${f.uid}','${f.username}')">Invite</button>`:''}
    </div>`;
  }).join('');
}

// ═══════════════════════════════════════════════════════════════
//  FRIENDS SCREEN
// ═══════════════════════════════════════════════════════════════
function renderFriendsScreen(){
  updateNavUser();
  updateFriendRequestBadge();

  const reqEl=document.getElementById('friendRequestsList');
  if(reqEl){
    reqEl.innerHTML=socialState.friendRequests.length===0
      ?'<div class="friends-empty">No pending requests.</div>'
      :socialState.friendRequests.map(r=>`
        <div class="friend-row">
          <div class="friend-av">${_initial(r.fromUsername)}</div>
          <div class="friend-info">
            <div class="friend-name">${r.fromUsername}</div>
            <div class="friend-sub">Wants to be friends</div>
          </div>
          <div class="friend-btns">
            <button class="friend-btn accept" onclick="fbAcceptFriendRequest('${r.id}','${r.fromUid}','${r.fromUsername}')">Accept</button>
            <button class="friend-btn decline" onclick="fbDeclineFriendRequest('${r.id}')">Decline</button>
          </div>
        </div>`).join('');
  }

  const listEl=document.getElementById('friendsList');
  if(listEl){
    listEl.innerHTML=socialState.friends.length===0
      ?'<div class="friends-empty">No friends yet. Search above!</div>'
      :socialState.friends.map(f=>{
        const status=socialState.presence[f.uid]||'offline';
        const lbl={in_match:'In Match',in_party:'In Party',lobby:'Online',online:'Online',offline:'Offline'}[status]||status;
        return `<div class="friend-row">
          <div class="friend-av">${_initial(f.username)}</div>
          <div class="friend-info">
            <div class="friend-name">${f.username}</div>
            <div class="friend-sub s-${status==='in_match'?'match':status==='in_party'?'party':status==='offline'?'offline':'online'}">${lbl}</div>
          </div>
          <div class="friend-btns">
            ${status!=='offline'?`<button class="friend-btn invite" onclick="fbInviteToParty('${f.uid}','${f.username}')">Invite</button>`:''}
            <button class="friend-btn remove" onclick="if(confirm('Remove ${f.username}?'))fbRemoveFriend('${f.uid}')">Remove</button>
          </div>
        </div>`;
      }).join('');
  }
}

async function doFriendSearch(){
  const input=document.getElementById('friendSearchInput');
  const resultsEl=document.getElementById('friendSearchResults');
  if(!input||!resultsEl) return;
  const q=input.value.trim();
  if(q.length<2){resultsEl.innerHTML='<div class="friends-empty">Enter at least 2 characters.</div>';return;}
  resultsEl.innerHTML='<div class="friends-empty">Searching…</div>';
  const results=await fbSearchUser(q);
  if(results.length===0){resultsEl.innerHTML='<div class="friends-empty">No users found.</div>';return;}
  resultsEl.innerHTML=results.map(r=>{
    const isFriend=socialState.friends.some(f=>f.uid===r.uid);
    const sent=socialState.sentRequests.some(s=>s.toUid===r.uid);
    return `<div class="friend-row">
      <div class="friend-av">${_initial(r.username)}</div>
      <div class="friend-info">
        <div class="friend-name">${r.username}</div>
        <div class="friend-sub">${isFriend?'Already friends':sent?'Request sent':'Player'}</div>
      </div>
      <div class="friend-btns">
        ${!isFriend&&!sent?`<button class="friend-btn add" onclick="fbSendFriendRequest('${r.uid}','${r.username}')">Add</button>`:''}
      </div>
    </div>`;
  }).join('');
}

// ═══════════════════════════════════════════════════════════════
//  LOCKER SCREEN (reuses #customization)
// ═══════════════════════════════════════════════════════════════
function showLockerScreen(){
  buildCustomizationUI();
  rebuildCharPreview();
  const backBtn=document.getElementById('btnCustomBack');
  if(backBtn) backBtn.onclick=()=>showScreen('mainMenu');
  const deployBtn=document.getElementById('btnDeploy');
  if(deployBtn){
    deployBtn.textContent='Save & Back';
    deployBtn.onclick=()=>{saveSave();showScreen('mainMenu');};
  }
  showScreen('customization');
}

// ═══════════════════════════════════════════════════════════════
//  WEAPONS SCREEN
// ═══════════════════════════════════════════════════════════════
function renderWeaponsScreen(){
  updateNavUser();
  const el=document.getElementById('weaponsGrid');
  if(!el) return;
  const equip=saveData.equippedWeapons||['pistol','launcher'];

  el.innerHTML=Object.values(WEAPONS).map(w=>{
    const isBaseOwned=w.id==='pistol'||w.id==='launcher';
    const isUnlocked=isBaseOwned||saveData.unlocks.includes(w.id)||saveData.unlocks.includes(w.shopId);
    const slot0=equip[0]===w.id, slot1=equip[1]===w.id;
    return `<div class="weapon-card${!isUnlocked?' locked':''}${slot0||slot1?' equipped':''}"
      onclick="${isUnlocked?`equipWeapon('${w.id}')`:`showNotif('Buy in Armory & Shop first!')`}">
      <div class="weapon-card-icon">${w.icon}</div>
      <div class="weapon-card-name">${w.name}</div>
      <div class="weapon-card-stats">
        <div>DMG ${w.dmg||'—'}</div>
        <div>AMMO ${w.maxAmmo}</div>
      </div>
      ${slot0?'<div class="wc-slot s1">[1]</div>':''}
      ${slot1?'<div class="wc-slot s2">[2]</div>':''}
      ${!isUnlocked?'<div class="wc-lock">🔒 Shop</div>':''}
    </div>`;
  }).join('');

  const loadEl=document.getElementById('weaponsLoadout');
  if(loadEl){
    const w1=WEAPONS[equip[0]]||WEAPONS.pistol;
    const w2=WEAPONS[equip[1]]||WEAPONS.launcher;
    loadEl.innerHTML=`
      <div class="loadout-slot">
        <div class="loadout-lbl">SLOT 1 — KEY [1]</div>
        <div class="loadout-name">${w1.icon} ${w1.name}</div>
      </div>
      <div class="loadout-sep">+</div>
      <div class="loadout-slot">
        <div class="loadout-lbl">SLOT 2 — KEY [2]</div>
        <div class="loadout-name">${w2.icon} ${w2.name}</div>
      </div>`;
  }
}

function equipWeapon(id){
  if(!WEAPONS[id]) return;
  const equip=[...(saveData.equippedWeapons||['pistol','launcher'])];
  if(equip[0]===id){
    // Already slot 1 → swap to slot 2, old slot 2 goes to slot 1
    equip[0]=equip[1]; equip[1]=id;
    showNotif(WEAPONS[id].name+' swapped to Slot 2');
  } else if(equip[1]===id){
    // Already slot 2 → move to slot 1, old slot 1 goes to slot 2
    equip[1]=equip[0]; equip[0]=id;
    showNotif(WEAPONS[id].name+' → Slot 1');
  } else {
    // Not equipped → replace slot 2
    equip[1]=id;
    showNotif(WEAPONS[id].name+' → Slot 2  |  Click again → Slot 1');
  }
  saveData.equippedWeapons=equip;
  saveSave();
  renderWeaponsScreen();
}

// ═══════════════════════════════════════════════════════════════
//  SEASON / XP / CHALLENGES PANEL
// ═══════════════════════════════════════════════════════════════
// ═══════════════════════════════════════════════════════════════
//  LOBBY CHAT
// ═══════════════════════════════════════════════════════════════
let _chatUnsub=null;

function initLobbyChat(){
  if(!_fbDb||!_fbUser||_chatUnsub) return;
  _chatUnsub=_fbDb.collection('globalChat')
    .orderBy('ts','desc').limit(10)
    .onSnapshot(snap=>{
      const msgs=[];
      snap.forEach(d=>msgs.unshift(d.data()));
      const box=document.getElementById('rlChatMessages');
      if(!box) return;
      box.innerHTML=msgs.map(m=>
        `<div class="rl-chat-msg"><span class="rl-cmn">${_esc(m.user||'?')}</span> ${_esc(m.text||'')}</div>`
      ).join('');
      box.scrollTop=box.scrollHeight;
    },()=>{});
}

function sendChatMsg(text){
  if(!text||!text.trim()) return;
  if(!_fbDb||!_fbUser){ showNotif('Sign in to chat'); return; }
  _fbDb.collection('globalChat').add({
    uid:_fbUser.uid,
    user:mpUser?.username||'RICHARD',
    text:text.trim().slice(0,120),
    ts:firebase.firestore.FieldValue.serverTimestamp()
  }).catch(()=>{});
}

function _renderSeasonPanel(){
  const el=document.getElementById('rlSeasonPanel');
  if(!el) return;
  const tier=saveData.bpLevel||0;
  const xp=saveData.bpXP||0;
  const xpInTier=xp%500;
  const xpPct=Math.round(xpInTier/500*100);

  // Daily baseline reset
  const today=new Date().toISOString().slice(0,10);
  if(saveData.challengeBaseDate!==today){
    saveData.challengeBaseDate=today;
    saveData.challengeBase={
      totalIntercepted:saveData.totalIntercepted||0,
      totalWaves:saveData.totalWaves||0,
      totalSoldierKills:saveData.totalSoldierKills||0,
      totalShotsFired:saveData.totalShotsFired||0
    };
    saveData.claimedChallenges=[];
    saveSave();
  }
  const base=saveData.challengeBase||{totalIntercepted:0,totalWaves:0,totalSoldierKills:0,totalShotsFired:0};
  const claimed=saveData.claimedChallenges||[];
  const challenges=[
    {id:0,name:'INTERCEPT 25 MISSILES',prog:Math.min(Math.max(0,(saveData.totalIntercepted||0)-base.totalIntercepted),25),total:25,xp:500},
    {id:1,name:'COMPLETE 3 MISSIONS',prog:Math.min(Math.max(0,(saveData.totalWaves||0)-base.totalWaves),3),total:3,xp:500},
    {id:2,name:'ELIMINATE 10 ENEMIES',prog:Math.min(Math.max(0,(saveData.totalSoldierKills||0)-(base.totalSoldierKills||0)),10),total:10,xp:500},
    {id:3,name:'FIRE 200 SHOTS',prog:Math.min(Math.max(0,(saveData.totalShotsFired||0)-base.totalShotsFired),200),total:200,xp:300},
  ];
  const baseChallengesAllDone=[0,1,2,3].every(cid=>claimed.includes(cid));
  challenges.push({id:4,name:'COMPLETE ALL DAILY CHALLENGES',prog:baseChallengesAllDone?1:0,total:1,xp:0,rewardType:'summonTicket',rewardLabel:'+1 Summon Ticket'});

  // Award XP / bonus for newly completed challenges
  let didSave=false;
  challenges.forEach(c=>{
    if(c.prog>=c.total&&!claimed.includes(c.id)){
      claimed.push(c.id);
      saveData.claimedChallenges=claimed;
      if(c.xp){
        saveData.bpXP=(saveData.bpXP||0)+c.xp;
        const newLevel=Math.floor(saveData.bpXP/500);
        if(newLevel>(saveData.bpLevel||0)){
          saveData.bpLevel=newLevel;
          if(typeof showNotif==='function') showNotif('★ BP TIER '+newLevel+' UNLOCKED!');
        }
        if(typeof showNotif==='function') showNotif(c.name+' COMPLETE! +'+c.xp+' XP');
      }
      if(c.rewardType==='summonTicket'){
        if(!saveData.summonCurrency) saveData.summonCurrency={chronoShards:0,summonTickets:0,featuredTickets:0};
        saveData.summonCurrency.summonTickets=(saveData.summonCurrency.summonTickets||0)+1;
        if(_fbUser&&_fbDb){
          _fbDb.collection('users').doc(_fbUser.uid).update({
            'saveData.summonCurrency.summonTickets':firebase.firestore.FieldValue.increment(1),
            'saveData.claimedChallenges':firebase.firestore.FieldValue.arrayUnion(c.id)
          }).catch(()=>{});
        }
        if(typeof showNotif==='function') showNotif('ALL CHALLENGES COMPLETE! +1 Summon Ticket!');
      }
      didSave=true;
    }
  });
  if(didSave) saveSave();

  el.innerHTML=`
    <div class="rll-season">SEASON 1</div>
    <div class="rll-level-row">
      <div class="rll-lv-label">BP TIER</div>
      <div class="rll-lv-num">${tier}</div>
    </div>
    <div class="rll-xp-track"><div class="rll-xp-fill" style="width:${xpPct}%"></div></div>
    <div class="rll-xp-text">${xpInTier} / 500 XP to next tier</div>
    <div class="rll-bp-row" onclick="buildBPScreen();showScreen('bpScreen')">
      BATTLE PASS <span class="rll-bp-tier">TIER ${tier}</span>
    </div>
    <div class="rll-divider"></div>
    <div class="rll-section-hd">DAILY CHALLENGES</div>
    ${challenges.map(c=>{
      const isClaimed=claimed.includes(c.id);
      return`<div class="rll-challenge${isClaimed?' rll-ch-done':''}">
        <div class="rll-ch-header">
          <div class="rll-ch-name">${c.name}</div>
          <div class="rll-ch-xp">${isClaimed?'✓ CLAIMED':c.rewardLabel||'+'+c.xp+' XP'}</div>
        </div>
        <div class="rll-ch-track">
          <div class="rll-ch-fill" style="width:${Math.round((isClaimed?c.total:c.prog)/c.total*100)}%"></div>
        </div>
        <div class="rll-ch-prog">${isClaimed?c.total:c.prog} / ${c.total}</div>
      </div>`;
    }).join('')}`;
}
