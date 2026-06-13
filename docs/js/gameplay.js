// Waves + player + weapon system + hook + ultimates + gadgets
// ═══════════════════════════════════════════════════════════════
//  WAVE SYSTEM
// ═══════════════════════════════════════════════════════════════
let _suppressPauseLock=false;

function startWave(){
  waveActive=true;
  killStreak=0; killStreakTimer=0;
  const isBonusWave=waveNum>0&&waveNum%5===0;
  waveMissileTotal=(isBonusWave?2:1)*(3+waveNum*2+(waveNum>=3?1:0));
  waveMissileSpawned=0;
  waveMissileTimer=1.5;
  waveMissileInterval=Math.max(isBonusWave?.9:1.4, 4-waveNum*.3);
  waveIntercepted=0;
  waveMissed=0;
  waveShotsFired=0;
  waveBldDestroyed=0;
  waveScore=0;

  if(isBonusWave){
    showNotif(`⚡ BONUS WAVE ${waveNum}! Double missiles — double rewards!`);
    showWaveAnnounce(`★ BONUS WAVE ${waveNum} ★ — ${waveMissileTotal} missiles inbound`);
  } else {
    showNotif(`WAVE ${waveNum} — Intercept all missiles!`);
    showWaveAnnounce(`WAVE ${waveNum} — ${waveMissileTotal} missiles inbound`);
  }
  if(selectedLoc) spawnSoldiers(selectedLoc, Math.min(1+Math.floor(waveNum/2), 4));
}

function updateWave(dt){
  if(!waveActive||mpIsGuest||battleActive) return;

  // Spawn interval
  waveMissileTimer-=dt;
  if(waveMissileTimer<=0&&waveMissileSpawned<waveMissileTotal){
    waveMissileTimer=waveMissileInterval;
    const isBoss=waveNum>=3&&waveMissileSpawned===Math.floor(waveMissileTotal/2);
    spawnMissile(isBoss);
    waveMissileSpawned++;
  }

  // Check wave end
  if(waveMissileTotal>0&&waveMissileSpawned>=waveMissileTotal&&missiles.filter(m=>!m.isDestroyed).length===0){
    endWave();
  }
}

function endWave(){
  waveActive=false;
  for(const s of soldiers){scene.remove(s.group);if(s.barEl)s.barEl.remove();}
  soldiers.length=0;
  for(const b of soldierBullets) scene.remove(b.mesh);
  soldierBullets.length=0;
  sfxWaveComplete();
  _suppressPauseLock=true;
  if(document.pointerLockElement) document.exitPointerLock();
  isLocked=false;

  const accuracy=waveShotsFired>0?Math.round(waveIntercepted/waveShotsFired*100):0;
  const baseEarned=waveIntercepted*80+Math.max(0,(waveMissileTotal-waveMissed)*50);
  const cleanBonus=waveMissed===0?200+waveNum*50:0;
  const earned=Math.round((baseEarned+cleanBonus)*(window._creditMult||1));
  saveData.currency+=earned;
  if(typeof _gachaEarnShards==='function') _gachaEarnShards(50+waveNum*10);
  saveData.totalScore+=waveScore;
  saveData.waveRecord=Math.max(saveData.waveRecord,waveNum);
  saveData.totalIntercepted+=waveIntercepted;
  saveData.totalShotsFired=(saveData.totalShotsFired||0)+waveShotsFired;
  saveData.totalWaves=(saveData.totalWaves||0)+1;
  saveSave();

  document.getElementById('wcSub').textContent=`Wave ${waveNum} Complete`;
  document.getElementById('stIntercepted').textContent=waveIntercepted;
  document.getElementById('stMissed').textContent=waveMissed;
  document.getElementById('stBuildings').textContent=waveBldDestroyed;
  document.getElementById('stAccuracy').textContent=accuracy+'%';
  document.getElementById('stWaveScore').textContent=waveScore;
  document.getElementById('wcEarned').textContent=`+${earned} Credits Earned${cleanBonus?` (CLEAN WAVE +${cleanBonus})`:''}`;
  document.getElementById('stCleanBonus').textContent=cleanBonus>0?`+${cleanBonus}`:'—';

  waveNum++;
  if(typeof mpRemotePlayers!=='undefined'&&mpRemotePlayers.size>0&&!battleActive){
    if(typeof achInc==='function') achInc('coopWaves');
    if(typeof _mpChallProgress==='function') _mpChallProgress('coopMissions',1);
    if(typeof addMpXp==='function') addMpXp(25);
  }
  // XP for battle pass
  const xpGained=100+Math.max(0,waveNum-1)*10;
  saveData.bpXP=(saveData.bpXP||0)+xpGained;
  const newLevel=Math.floor(saveData.bpXP/500);
  if(newLevel>(saveData.bpLevel||0)){ saveData.bpLevel=newLevel; showNotif('BATTLE PASS LV '+newLevel+' UNLOCKED!'); }
  saveSave();
  updateSaveUI();
  showScreen('waveComplete');
  if(!battleActive) _pendingCardPick=true;
  // Auto-advance after countdown
  _startWaveCompleteCountdown();
}

function triggerGameOver(){
  waveActive=false;
  saveData.totalScore+=score;
  saveSave();
  document.getElementById('goWaves').textContent=waveNum-1;
  document.getElementById('goScore').textContent=score;
  document.getElementById('goIntercepted').textContent=totalInterceptedSession;
  setTimeout(()=>showScreen('gameOver'),600);
}

// Simple AABB push-out for gulag cover objects
function _resolveGulagCollisions(){
  const R=0.45, box=new THREE.Box3();
  for(const obj of gulagCollidables){
    box.setFromObject(obj);
    // player eye=py, feet=py-PLAYER_H; collide if any vertical slice overlaps
    if(px>box.min.x-R && px<box.max.x+R &&
       pz>box.min.z-R && pz<box.max.z+R &&
       py>box.min.y   && py<box.max.y+PLAYER_H){
      const ox1=px-(box.min.x-R), ox2=(box.max.x+R)-px;
      const oz1=pz-(box.min.z-R), oz2=(box.max.z+R)-pz;
      const mn=Math.min(ox1,ox2,oz1,oz2);
      if(mn===ox1){ px=box.min.x-R; vx=Math.min(0,vx); }
      else if(mn===ox2){ px=box.max.x+R; vx=Math.max(0,vx); }
      else if(mn===oz1){ pz=box.min.z-R; vz=Math.min(0,vz); }
      else             { pz=box.max.z+R; vz=Math.max(0,vz); }
    }
  }
}

// ═══════════════════════════════════════════════════════════════
//  PLAYER CONTROLLER
// ═══════════════════════════════════════════════════════════════
function updatePlayer(dt){
  // While being pulled by grapple — surrender ground control entirely
  if(hookPulling){
    if(hookTarget){
      const _hp=hookTarget.type==='static'?hookTarget.pos:new THREE.Vector3(hookTarget.ref.pos.x,ENEMY_TYPES[hookTarget.ref.type].baseScale,hookTarget.ref.pos.z);
      if(_hp.distanceTo(new THREE.Vector3(px,py,pz))<1.6){ releaseHook(); return; }
    }
    px+=vx*dt; py+=vy*dt; pz+=vz*dt;
    const _b=battleActive?39:MAP_BOUND;
    px=Math.max(-_b,Math.min(_b,px));
    pz=Math.max(-_b,Math.min(_b,pz));
    if(py<=PLAYER_H){py=PLAYER_H;vy=0;onGround=true;}
    camera.position.set(px,py,pz);
    camera.rotation.order='YXZ';
    camera.rotation.y=yaw;
    camera.rotation.x=pitch;
    bobX*=.85;bobY*=.85;
    if(recoilT>0) recoilT=Math.max(0,recoilT-dt);
    const recoilY=recoilT>0?recoilT/.12*.04:0;
    const recoilZ=recoilT>0?recoilT/.12*.06:0;
    if(weaponMesh) weaponMesh.position.set(.25+bobX,-.22-bobY+recoilY,-.42+recoilZ);
    return;
  }

  const fw=new THREE.Vector3(-Math.sin(yaw),0,-Math.cos(yaw));
  const rt=new THREE.Vector3(Math.cos(yaw),0,-Math.sin(yaw));
  sprinting=!!keys['ShiftLeft']||!!keys['ShiftRight'];
  const spd=sprinting?effectiveSprint:effectiveSpd;
  let mx=0,mz=0;
  if(keys['KeyW']){mx+=fw.x;mz+=fw.z;}
  if(keys['KeyS']){mx-=fw.x;mz-=fw.z;}
  if(keys['KeyA']){mx-=rt.x;mz-=rt.z;}
  if(keys['KeyD']){mx+=rt.x;mz+=rt.z;}
  const ml=Math.sqrt(mx*mx+mz*mz);
  if(ml>0){vx=mx/ml*spd;vz=mz/ml*spd;}
  else{vx*=.82;vz*=.82;}

  if((keys['Space'])&&onGround){vy=JUMP_VEL;onGround=false;}
  if(!onGround) vy+=GRAVITY*(window._battleGrav||1)*dt;

  px+=vx*dt; py+=vy*dt; pz+=vz*dt;

  if(py<=PLAYER_H){py=PLAYER_H;vy=0;onGround=true;}
  const bound=battleActive?39:MAP_BOUND;
  px=Math.max(-bound,Math.min(bound,px));
  pz=Math.max(-bound,Math.min(bound,pz));
  // Building collision (normal mode)
  if(!battleActive){
    const R=0.45;
    for(const b of buildings){
      if(b.isDestroyed) continue;
      const hw=b.w/2+R, hd=b.d/2+R;
      const bdx=px-b.pos.x, bdz=pz-b.pos.z;
      if(Math.abs(bdx)<hw&&Math.abs(bdz)<hd&&py<b.h+PLAYER_H){
        const ox=hw-Math.abs(bdx), oz=hd-Math.abs(bdz);
        if(ox<oz){px=b.pos.x+(bdx>=0?hw:-hw);vx=0;}
        else{pz=b.pos.z+(bdz>=0?hd:-hd);vz=0;}
      }
    }
    // Prop collision (cars, barriers, dividers)
    for(const p of propColliders){
      const hw=p.w/2+R, hd=p.d/2+R;
      const pdx=px-p.x, pdz=pz-p.z;
      if(Math.abs(pdx)<hw&&Math.abs(pdz)<hd){
        const ox=hw-Math.abs(pdx), oz=hd-Math.abs(pdz);
        if(ox<oz){px=p.x+(pdx>=0?hw:-hw);vx=0;}
        else{pz=p.z+(pdz>=0?hd:-hd);vz=0;}
      }
    }
  }
  // Gulag: push player out of cover objects
  if(battleActive) _resolveGulagCollisions();

  camera.position.set(px,py,pz);
  camera.rotation.order='YXZ';
  camera.rotation.y=yaw;
  camera.rotation.x=pitch;

  checkAmmoPack();

  // Weapon bob + recoil
  const moving=(Math.abs(vx)>0.5||Math.abs(vz)>0.5)&&onGround;
  if(moving){bobT+=dt*(sprinting?13:8);bobX=Math.sin(bobT*.5)*.012;bobY=Math.abs(Math.sin(bobT))*.009;}
  else{bobX*=.88;bobY*=.88;}
  if(recoilT>0) recoilT=Math.max(0,recoilT-dt);
  const recoilY=recoilT>0?recoilT/.12*.04:0;
  const recoilZ=recoilT>0?recoilT/.12*.06:0;
  if(weaponMesh){
    weaponMesh.position.set(.25+bobX,-.22-bobY+recoilY,-.42+recoilZ);
  }
}

// ═══════════════════════════════════════════════════════════════
//  WEAPON UPDATE
// ═══════════════════════════════════════════════════════════════
function updateWeapon(dt){
  // Cooldown
  if(fireCD>0) fireCD-=dt;

  // Auto-fire for weapons with autoFire flag (e.g. P90 SMG)
  if(mouseHeld&&isLocked&&gameActive&&!gamePaused&&WEAPONS[currentWeapon]?.autoFire) fireProjectile();

  // Shock rifle charge-up tick
  if(shockCharging){
    if(currentWeapon!=='shock'){
      shockCharging=false;shockChargeT=0;
      const w=document.getElementById('shockChargeWrap');if(w) w.style.display='none';
    } else if(isLocked&&gameActive&&!gamePaused){
      shockChargeT=Math.min(shockChargeT+dt,SHOCK_CHARGE_DUR);
      const bar=document.getElementById('shockChargeBar');
      if(bar) bar.style.width=(shockChargeT/SHOCK_CHARGE_DUR*100)+'%';
    }
  }

  // Reload
  if(isReloading){
    reloadT-=dt;
    if(reloadT<=0){isReloading=false;ammo=WEAPONS[currentWeapon].maxAmmo;weaponAmmo[currentWeapon]=ammo;}
  } else if(ammo===0&&!isReloading){
    startReload();
  }

  // Scope transition
  const targetT=scoped?1:0;
  scopeT+=(targetT-scopeT)*dt*9;
  camera.fov=NORMAL_FOV+(SCOPE_FOV-NORMAL_FOV)*scopeT;
  camera.updateProjectionMatrix();

  const scopeEl=document.getElementById('scopeOverlay');
  const crosshairEl=document.getElementById('crosshair');
  if(scopeT>.08){
    scopeEl.style.display='block';
    crosshairEl.style.opacity=String(1-scopeT);
  } else {
    scopeEl.style.display='none';
    crosshairEl.style.opacity='1';
  }
}

function startReload(){
  const wep=WEAPONS[currentWeapon];
  if(isReloading||ammo===wep.maxAmmo) return;
  isReloading=true;reloadT=wep.reloadTime;
  sfxReload();showNotif('Reloading '+wep.name+'…');
}

function switchWeapon(id){
  if(!weaponInventory.has(id)||id===currentWeapon) return;
  weaponAmmo[currentWeapon]=ammo;
  currentWeapon=id;
  ammo=weaponAmmo[id];
  isReloading=false;reloadT=0;fireCD=0;
  scoped=false;scopeT=0;
  if(weaponMesh){camera.remove(weaponMesh);}
  weaponMesh=makeWeaponMesh();camera.add(weaponMesh);
  console.log('[Weapon] Rendering',id,'with camo:',saveData?.equippedWeaponCamos?.[id]||'default');
  showNotif(WEAPONS[id].name);
  updateWeaponBar();
}
// Force-rebuilds the FPS weapon mesh in place — used after equipping a camo from the Locker
function refreshWeaponMesh(){
  if(!gameActive||!currentWeapon) return;
  if(weaponMesh) camera.remove(weaponMesh);
  weaponMesh=makeWeaponMesh();
  camera.add(weaponMesh);
  console.log('[Weapon] refreshWeaponMesh → applied camo:',saveData?.equippedWeaponCamos?.[currentWeapon]||'default');
}

function updateWeaponBar(){
  const bar=document.getElementById('weaponBar');
  if(!bar) return;
  bar.innerHTML='';
  [...weaponInventory].forEach((wid,i)=>{
    const w=WEAPONS[wid];
    if(!w) return;
    const active=wid===currentWeapon;
    const div=document.createElement('div');
    div.className='wslot'+(active?' active':'');
    div.innerHTML=`<div class="ws-num">${i+1}</div><div class="ws-icon">${w.icon}</div>`+
      `<div class="ws-name">${w.name}</div><div class="ws-ammo">${(wid===currentWeapon?ammo:weaponAmmo[wid])+'/'+w.maxAmmo}</div>`;
    bar.appendChild(div);
  });
}

// ═══════════════════════════════════════════════════════════════
//  GRAPPLING HOOK
// ═══════════════════════════════════════════════════════════════
function _makeHookMesh(){
  const g=new THREE.Group();
  const metal=new THREE.MeshLambertMaterial({color:0x909090});
  const dark =new THREE.MeshLambertMaterial({color:0x444444});
  // Shaft
  const shaft=new THREE.Mesh(new THREE.CylinderGeometry(.022,.022,.28,8),metal);
  shaft.rotation.x=Math.PI/2; g.add(shaft);
  // Ring at back (rope attachment)
  const ring=new THREE.Mesh(new THREE.TorusGeometry(.032,.008,6,10),dark);
  ring.position.z=.14; g.add(ring);
  // 3 curved prongs at the front, spread 120° apart
  for(let i=0;i<3;i++){
    const angle=i*(Math.PI*2/3);
    const prong=new THREE.Mesh(new THREE.CylinderGeometry(.009,.004,.13,4),dark);
    // Base at tip of shaft
    prong.position.set(Math.cos(angle)*.028, Math.sin(angle)*.028, -.12);
    // Angle each prong outward and curve it backward
    prong.rotation.z=angle;
    prong.rotation.x=-0.55;
    g.add(prong);
    // Small barb tip on each prong
    const barb=new THREE.Mesh(new THREE.ConeGeometry(.008,.04,4),dark);
    barb.position.set(Math.cos(angle)*.038, Math.sin(angle)*.038, -.185);
    barb.rotation.z=angle;
    barb.rotation.x=-0.55;
    g.add(barb);
  }
  return g;
}

function _ropePoints(from, to, segs){
  const pts=[];
  const dist=from.distanceTo(to);
  const sag=dist*0.07;
  for(let i=0;i<=segs;i++){
    const t=i/segs;
    const p=from.clone().lerp(to,t);
    p.y-=Math.sin(t*Math.PI)*sag;
    pts.push(p);
  }
  return pts;
}

function fireHook(){
  if(hookActive||hookPulling||hookCD>0) return;
  sfxHookFire();
  if(typeof achInc==='function') achInc('hookUses');
  const dir=new THREE.Vector3(); camera.getWorldDirection(dir);
  hookPos=new THREE.Vector3(px,py,pz).add(dir.clone().multiplyScalar(.6));
  hookVel=dir.clone().multiplyScalar(100);

  hookMesh=_makeHookMesh();
  // Orient so the prong-end (-Z) faces the travel direction
  hookMesh.quaternion.setFromUnitVectors(new THREE.Vector3(0,0,-1), dir.clone().normalize());
  hookMesh.position.copy(hookPos);
  scene.add(hookMesh);

  // Rope: dark braided-looking line
  const lGeo=new THREE.BufferGeometry().setFromPoints([hookPos.clone(),hookPos.clone()]);
  hookLine=new THREE.Line(lGeo, new THREE.LineBasicMaterial({color:0x5C3A1A,transparent:true,opacity:.92}));
  scene.add(hookLine);
  hookActive=true;
}

function updateHook(dt){
  if(!hookActive&&!hookPulling) return;
  const playerPos=new THREE.Vector3(px,py,pz);

  if(hookActive&&hookPos&&hookVel){
    hookPos.addScaledVector(hookVel, dt);
    if(hookMesh){
      hookMesh.position.copy(hookPos);
      // Keep claw oriented along travel direction
      if(hookVel.lengthSq()>0.01)
        hookMesh.quaternion.setFromUnitVectors(new THREE.Vector3(0,0,-1), hookVel.clone().normalize());
    }
    hookLine.geometry.setFromPoints(_ropePoints(playerPos, hookPos, 10));
    hookLine.geometry.attributes.position.needsUpdate=true;

    const distToPlayer=hookPos.distanceTo(playerPos);
    let latched=false;

    // Soldiers
    for(const s of soldiers){
      if(hookPos.distanceTo(new THREE.Vector3(s.pos.x,ENEMY_TYPES[s.type].baseScale,s.pos.z))<2.0){
        hookTarget={type:'soldier',ref:s}; sfxHookLatch(); hookActive=false; hookPulling=true; latched=true; break;
      }
    }
    // Buildings — NOT missiles (moving targets cause infinite-pull bug)
    if(!latched) for(const b of buildings){
      if(b.isDestroyed) continue;
      const dx=hookPos.x-b.pos.x, dz=hookPos.z-b.pos.z;
      if(Math.abs(dx)<b.w/2+.5 && Math.abs(dz)<b.d/2+.5 && hookPos.y>0 && hookPos.y<b.h+1){
        hookTarget={type:'static',pos:hookPos.clone()}; sfxHookLatch(); hookActive=false; hookPulling=true; latched=true; break;
      }
    }
    // Ground
    if(!latched&&hookPos.y<=0.3){
      hookPos.y=0.3;
      hookTarget={type:'static',pos:hookPos.clone()}; sfxHookLatch(); hookActive=false; hookPulling=true; latched=true;
    }
    // Max range — missed everything
    if(!latched&&distToPlayer>60) releaseHook();

  } else if(hookPulling){
    if(!hookTarget){ releaseHook(); return; }

    // Update anchor for moving targets (soldiers only — missiles removed)
    if(hookTarget.type==='soldier'){
      if(!soldiers.includes(hookTarget.ref)){ releaseHook(); return; }
      hookPos=new THREE.Vector3(hookTarget.ref.pos.x, ENEMY_TYPES[hookTarget.ref.type].baseScale, hookTarget.ref.pos.z);
    } else {
      hookPos=hookTarget.pos.clone();
    }

    if(hookMesh) hookMesh.position.copy(hookPos);
    hookLine.geometry.setFromPoints(_ropePoints(playerPos, hookPos, 10));
    hookLine.geometry.attributes.position.needsUpdate=true;

    const toHook=hookPos.clone().sub(playerPos);
    const dist=toHook.length();

    if(dist<1.6){
      if(hookTarget.type==='soldier'){
        const s=hookTarget.ref; const si=soldiers.indexOf(s);
        if(si>=0){
          s.health-=3;
          if(s.health<=0){
            scene.remove(s.group); s.barEl.remove(); spawnAmmoPack(s.pos); soldiers.splice(si,1);
            score+=200; waveScore+=200; showNotif('MEATHOOK KILL! +200');
          } else {
            showNotif('Meathook hit! -3HP');
          }
        }
      }
      hookCD=1.4;
      releaseHook(); return;
    }

    // Pull speed ramps up with distance so far shots feel snappy, close shots ease in
    const pullSpd=Math.min(36, dist*10+6);
    toHook.normalize();
    vx=toHook.x*pullSpd;
    vy=Math.min(toHook.y*pullSpd, 4);
    vz=toHook.z*pullSpd;
  }
}

function releaseHook(){
  if(hookPulling){ vy=Math.min(vy,4); vx=0; vz=0; }
  if(hookMesh){ scene.remove(hookMesh); hookMesh=null; }
  if(hookLine){ scene.remove(hookLine); hookLine=null; }
  hookActive=false; hookPulling=false; hookPos=null; hookVel=null; hookTarget=null;
}

// ═══════════════════════════════════════════════════════════════
//  CYBER BULLET ULTIMATE
// ═══════════════════════════════════════════════════════════════
let _cyberBulletState=null; // {mesh, pos, vel, target, t}

function makeCyberCarMesh(){
  const carG=new THREE.Group();

  const blk=new THREE.MeshLambertMaterial({color:0xAEB6BE,emissive:0x30343A,emissiveIntensity:.22}); // silver SS body
  const drk=new THREE.MeshLambertMaterial({color:0x050505});
  const chr=new THREE.MeshLambertMaterial({color:0x707070});
  const gls=new THREE.MeshLambertMaterial({color:0x1A2030,transparent:true,opacity:.65});
  const whl=new THREE.MeshLambertMaterial({color:0x0B0B0B});
  const rim=new THREE.MeshLambertMaterial({color:0x191919});
  const hl=new THREE.MeshLambertMaterial({color:0xEEEECC,emissive:0xFFFF88,emissiveIntensity:.7});
  const tl=new THREE.MeshLambertMaterial({color:0xCC1100,emissive:0xFF2200,emissiveIntensity:.65});
  // Lower sill (widest)
  const sill=new THREE.Mesh(new THREE.BoxGeometry(2.62,0.3,5.0),blk);
  sill.position.set(0,.15,-.1);carG.add(sill);
  // Main body
  const bd=new THREE.Mesh(new THREE.BoxGeometry(2.5,.52,4.9),blk);
  bd.position.set(0,.56,-.1);carG.add(bd);
  // Long hood
  const hood=new THREE.Mesh(new THREE.BoxGeometry(2.36,.1,2.0),blk);
  hood.position.set(0,.85,1.15);carG.add(hood);
  const ridge=new THREE.Mesh(new THREE.BoxGeometry(.26,.055,1.78),drk);
  ridge.position.set(0,.92,1.1);carG.add(ridge);
  // SS rally stripes — twin black stripes over hood + roof
  [-0.42,0.42].forEach(x=>{
    const st1=new THREE.Mesh(new THREE.BoxGeometry(.34,.045,2.0),drk);
    st1.position.set(x,.915,1.15);carG.add(st1);
    const st2=new THREE.Mesh(new THREE.BoxGeometry(.34,.045,2.2),drk);
    st2.position.set(x,1.47,-.2);carG.add(st2);
  });
  // Front fender flares
  [-1,1].forEach(s=>{
    const f=new THREE.Mesh(new THREE.BoxGeometry(.13,.42,1.38),blk);
    f.position.set(s*1.33,.56,1.1);carG.add(f);
  });
  // Rear fender haunches (wider)
  [-1,1].forEach(s=>{
    const f=new THREE.Mesh(new THREE.BoxGeometry(.17,.44,1.28),blk);
    f.position.set(s*1.35,.56,-1.38);carG.add(f);
  });
  // Compact cabin / coupe roof
  const cab=new THREE.Mesh(new THREE.BoxGeometry(1.9,.58,2.2),blk);
  cab.position.set(0,1.17,-.2);carG.add(cab);
  // Windshield
  const ws=new THREE.Mesh(new THREE.BoxGeometry(1.8,.5,.08),gls);
  ws.rotation.x=.5;ws.position.set(0,1.36,.88);carG.add(ws);
  // Side windows
  [-1,1].forEach(s=>{
    const sw=new THREE.Mesh(new THREE.BoxGeometry(.06,.38,.86),gls);
    sw.position.set(s*.98,1.24,.28);carG.add(sw);
  });
  // Rear window
  const rw=new THREE.Mesh(new THREE.BoxGeometry(1.76,.44,.08),gls);
  rw.rotation.x=-.52;rw.position.set(0,1.28,-1.27);carG.add(rw);
  // Thin angry headlights + DRL
  [-1,1].forEach(s=>{
    const h=new THREE.Mesh(new THREE.BoxGeometry(.56,.1,.09),hl);
    h.position.set(s*.83,.84,2.52);carG.add(h);
    const d=new THREE.Mesh(new THREE.BoxGeometry(.5,.038,.07),hl);
    d.position.set(s*.83,.74,2.53);carG.add(d);
  });
  // Upper grille slot
  const ug=new THREE.Mesh(new THREE.BoxGeometry(2.02,.11,.11),drk);
  ug.position.set(0,.8,2.53);carG.add(ug);
  // Lower wide grille
  const lg=new THREE.Mesh(new THREE.BoxGeometry(2.18,.26,.15),drk);
  lg.position.set(0,.38,2.54);carG.add(lg);
  for(let i=0;i<3;i++){
    const sl=new THREE.Mesh(new THREE.BoxGeometry(2.16,.024,.05),drk);
    sl.position.set(0,.28+i*.074,2.56);carG.add(sl);
  }
  // Front splitter
  const sp=new THREE.Mesh(new THREE.BoxGeometry(2.44,.05,.22),drk);
  sp.position.set(0,.04,2.56);carG.add(sp);
  const nc=new THREE.Mesh(new THREE.BoxGeometry(2.44,.03,.08),chr);
  nc.position.set(0,.91,2.53);carG.add(nc);
  // Side skirts
  [-1,1].forEach(s=>{
    const sk=new THREE.Mesh(new THREE.BoxGeometry(.07,.13,4.1),drk);
    sk.position.set(s*1.3,.1,-.1);carG.add(sk);
  });
  // Rear taillights strip + corner
  const tlb=new THREE.Mesh(new THREE.BoxGeometry(2.18,.055,.07),tl);
  tlb.position.set(0,.74,-2.57);carG.add(tlb);
  [-1,1].forEach(s=>{
    const tc=new THREE.Mesh(new THREE.BoxGeometry(.6,.1,.08),tl);
    tc.position.set(s*.78,.76,-2.57);carG.add(tc);
  });
  // Rear fascia
  const rf=new THREE.Mesh(new THREE.BoxGeometry(2.42,.58,.11),blk);
  rf.position.set(0,.52,-2.57);carG.add(rf);
  // Spoiler lip
  const spo=new THREE.Mesh(new THREE.BoxGeometry(2.2,.09,.26),drk);
  spo.position.set(0,1.12,-2.47);carG.add(spo);
  // Diffuser + exhausts
  const dif=new THREE.Mesh(new THREE.BoxGeometry(2.08,.13,.18),drk);
  dif.position.set(0,.09,-2.59);carG.add(dif);
  [-.46,.46].forEach(x=>{
    const ex=new THREE.Mesh(new THREE.CylinderGeometry(.07,.07,.16,8),chr);
    ex.rotation.x=Math.PI/2;ex.position.set(x,.12,-2.66);carG.add(ex);
  });
  // Wheels x4
  [[-1.28,.3,1.6],[1.28,.3,1.6],[-1.28,.3,-1.6],[1.28,.3,-1.6]].forEach(([x,y,z])=>{
    const ti=new THREE.Mesh(new THREE.CylinderGeometry(.34,.34,.26,12),whl);
    ti.rotation.z=Math.PI/2;ti.position.set(x,y,z);carG.add(ti);
    const ri=new THREE.Mesh(new THREE.CylinderGeometry(.26,.26,.22,10),rim);
    ri.rotation.z=Math.PI/2;ri.position.set(x,y,z);carG.add(ri);
    const cp=new THREE.Mesh(new THREE.CylinderGeometry(.07,.07,.24,8),drk);
    cp.rotation.z=Math.PI/2;cp.position.set(x,y,z);carG.add(cp);
  });
  // Flame thruster (rear)
  const flame=new THREE.Mesh(new THREE.ConeGeometry(.44,1.8,8),new THREE.MeshLambertMaterial({color:0xFF8800,emissive:0xFF5500,emissiveIntensity:1,transparent:true,opacity:.8}));
  flame.rotation.x=Math.PI/2;flame.position.z=3.2;carG.add(flame);

  return carG;
}

function fireCyberBullet(){
  if(!cyberBulletOwned||cyberBulletCD>0) return;
  // Find nearest missile
  let target=null, bestDist=9999;
  for(const m of missiles){
    if(m.isDestroyed) continue;
    const d=m.pos.distanceTo(new THREE.Vector3(px,py,pz));
    if(d<bestDist){bestDist=d;target=m;}
  }
  if(!target){showNotif('No missile in range!');return;}
  cyberBulletCD=15;
  if(typeof achInc==='function') achInc('cyberUses');
  const carG=makeCyberCarMesh();
  // Start position: far edge of map behind player
  const angle=yaw+Math.PI+(Math.random()-.5)*.5;
  const startX=px+Math.sin(angle)*80, startZ=pz+Math.cos(angle)*80;
  carG.position.set(startX, 2, startZ);
  scene.add(carG);
  cyberBulletMesh=carG;

  _cyberBulletState={
    mesh:carG,
    pos:new THREE.Vector3(startX,2,startZ),
    target,
    t:0,
    startPos:new THREE.Vector3(startX,2,startZ),
    startTargetPos:target.pos.clone()
  };
  showNotif('CYBER BULLET LAUNCHED!');
  playTone(220,.08,'sawtooth',.3);setTimeout(()=>playTone(440,.1,'sawtooth',.25),120);
}

function updateCyberBullet(dt){
  if(cyberBulletCD>0) cyberBulletCD=Math.max(0,cyberBulletCD-dt);
  // HUD always updates so countdown is visible after animation ends
  const _cbHud=document.getElementById('cyberBulletHud');
  if(_cbHud){ _cbHud.style.display=cyberBulletOwned?'block':'none'; const _l=document.getElementById('cyberBulletLabel'); if(_l){_l.textContent=cyberBulletCD>0?Math.ceil(cyberBulletCD)+'s':'READY';_l.style.color=cyberBulletCD>0?'#888':'#FF4422';} }
  if(!_cyberBulletState) return;
  const cb=_cyberBulletState;
  cb.t+=dt*0.7; // arc speed
  if(cb.t>=1||cb.target.isDestroyed){
    // Detonate
    if(!cb.target.isDestroyed){
      destroyMissile(cb.target,true);
      score+=500; waveScore+=500;
      showNotif('CYBER BULLET HIT! +500');
    }
    triggerScreenShake(1.2);
    spawnExplosion(cb.pos, 3, 0xFF6600);
    scene.remove(cb.mesh);
    cyberBulletMesh=null;
    _cyberBulletState=null;
    return;
  }
  // Parabolic arc toward target
  const t=cb.t;
  const tp=cb.target.pos;
  const sp=cb.startPos;
  const nx=sp.x+(tp.x-sp.x)*t;
  const nz=sp.z+(tp.z-sp.z)*t;
  const ny=sp.y+(tp.y-sp.y)*t + Math.sin(t*Math.PI)*30; // parabola peak=30
  cb.pos.set(nx,ny,nz);
  cb.mesh.position.copy(cb.pos);
  // Orient car nose toward target
  const dir=new THREE.Vector3(tp.x-sp.x, tp.y-sp.y+Math.cos(t*Math.PI)*30, tp.z-sp.z).normalize();
  cb.mesh.lookAt(cb.pos.clone().add(dir));
}

// ═══════════════════════════════════════════════════════════════
//  RAJPN FIST BUMP ULTIMATE
// ═══════════════════════════════════════════════════════════════
let rajpnFistOwned=false, rajpnFistCD=0;
let _rajpnState=null;
const RAJPN_CD=12;

function _makeFistGroup(isLeft){
  // Detailed fist: palm + 4 curled two-segment fingers + wrapped thumb,
  // knuckle ridge, wristband cuff. Knuckles face +x (left) / -x (right).
  const g=new THREE.Group();
  const d=isLeft?1:-1;
  const skinMat=new THREE.MeshLambertMaterial({color:0xC8955A,emissive:0xFF6600,emissiveIntensity:.3});
  const skinDk =new THREE.MeshLambertMaterial({color:0xA87844,emissive:0xCC4400,emissiveIntensity:.22});
  const nailMat=new THREE.MeshLambertMaterial({color:0xE8C898});
  const bandMat=new THREE.MeshLambertMaterial({color:0x18202E,emissive:0x2244AA,emissiveIntensity:.4});
  // Palm block
  const palm=new THREE.Mesh(new THREE.BoxGeometry(2.2,2.1,2.9),skinMat); g.add(palm);
  // Knuckle ridge across punching face
  const ridge=new THREE.Mesh(new THREE.BoxGeometry(.5,.5,2.7),skinDk);
  ridge.position.set(1.05*d,.85,0);g.add(ridge);
  // 4 fingers: upper segment angled forward + folded segment tucked under
  for(let i=0;i<4;i++){
    const z=-1.0+i*0.66;
    const k=new THREE.Mesh(new THREE.BoxGeometry(.62,.62,.56),skinMat);
    k.position.set(1.25*d,.55,z);g.add(k);
    const seg=new THREE.Mesh(new THREE.BoxGeometry(.5,.78,.5),skinDk);
    seg.position.set(1.42*d,-.1,z);g.add(seg);
    const fold=new THREE.Mesh(new THREE.BoxGeometry(.46,.4,.46),skinMat);
    fold.position.set(1.08*d,-.62,z);g.add(fold);
    const n=new THREE.Mesh(new THREE.BoxGeometry(.2,.16,.32),nailMat);
    n.position.set(1.56*d,-.42,z);g.add(n);
  }
  // Thumb wrapping across the front-bottom
  const thumb1=new THREE.Mesh(new THREE.BoxGeometry(.6,.58,1.1),skinMat);
  thumb1.position.set(.7*d,-.95,-.85);thumb1.rotation.y=.35*d;g.add(thumb1);
  const thumb2=new THREE.Mesh(new THREE.BoxGeometry(.5,.5,.7),skinDk);
  thumb2.position.set(1.1*d,-.95,-.25);g.add(thumb2);
  const tn=new THREE.Mesh(new THREE.BoxGeometry(.3,.16,.3),nailMat);
  tn.position.set(1.32*d,-.78,-.2);g.add(tn);
  // Wrist + RAJPN wristband cuff
  const wrist=new THREE.Mesh(new THREE.BoxGeometry(1.7,1.7,2.1),skinMat);
  wrist.position.set(-1.4*d,-.1,0);g.add(wrist);
  const cuff=new THREE.Mesh(new THREE.BoxGeometry(.55,1.95,2.35),bandMat);
  cuff.position.set(-2.2*d,-.1,0);g.add(cuff);
  // Vein detail on top of hand
  const vein=new THREE.Mesh(new THREE.BoxGeometry(1.3,.12,.14),skinDk);
  vein.position.set(.2*d,1.08,.3);vein.rotation.y=.3*d;g.add(vein);
  return g;
}

function fireRajpnFist(){
  if(!rajpnFistOwned||rajpnFistCD>0||_rajpnState) return;
  // Find nearest missile
  let target=null, bestDist=9999;
  for(const m of missiles){
    if(m.isDestroyed) continue;
    const d=m.pos.distanceTo(new THREE.Vector3(px,py,pz));
    if(d<bestDist){bestDist=d;target=m;}
  }
  if(!target){showNotif('No missile to target!');return;}
  rajpnFistCD=RAJPN_CD;
  if(typeof achInc==='function') achInc('rajpnUses');
  // Compute perpendicular to player→missile — fists always clap from both sides of target
  const toMx=target.pos.x-px, toMz=target.pos.z-pz;
  const toML=Math.sqrt(toMx*toMx+toMz*toMz)||1;
  const perpX=toMz/toML, perpZ=-toMx/toML;
  const ARM=34;
  const ty=target.pos.y;
  const lFist=_makeFistGroup(true);
  const rFist=_makeFistGroup(false);
  lFist.position.set(target.pos.x+perpX*ARM, ty+2, target.pos.z+perpZ*ARM);
  rFist.position.set(target.pos.x-perpX*ARM, ty+2, target.pos.z-perpZ*ARM);
  const fa=Math.atan2(-perpX,-perpZ);
  lFist.rotation.y=fa; rFist.rotation.y=fa+Math.PI;
  scene.add(lFist); scene.add(rFist);
  _rajpnState={
    lFist,rFist,t:0,done:false,target,
    startL:lFist.position.clone(),
    startR:rFist.position.clone()
  };
  showNotif('RAJPN FIST BUMP — TARGET LOCKED!');
  playTone(220,.08,'sawtooth',.5);
}

function updateRajpnFist(dt){
  if(rajpnFistCD>0) rajpnFistCD=Math.max(0,rajpnFistCD-dt);
  const _rfHud=document.getElementById('rajpnFistHud');
  if(_rfHud){ _rfHud.style.display=rajpnFistOwned?'block':'none'; const _l=document.getElementById('rajpnFistLabel'); if(_l){_l.textContent=rajpnFistCD>0?Math.ceil(rajpnFistCD)+'s':'READY';_l.style.color=rajpnFistCD>0?'#888':'#FF8833';} }
  if(!_rajpnState) return;
  const s=_rajpnState;
  s.t+=dt*1.4;
  // Target position: track missile while alive, freeze on death
  const tp=(!s.target.isDestroyed)?s.target.pos.clone():s.startL.clone().lerp(s.startR,0.5);
  const tClamped=Math.min(s.t,1);
  s.lFist.position.lerpVectors(s.startL,tp,tClamped);
  s.rFist.position.lerpVectors(s.startR,tp,tClamped);
  if(!s.done&&s.t>=1){
    s.done=true;
    playTone(120,.14,'sawtooth',.8);
    playTone(440,.08,'sine',.5);
    triggerScreenShake(1.5);
    for(let i=missiles.length-1;i>=0;i--){
      const m=missiles[i];
      if(m.isDestroyed) continue;
      const dist=m.pos.distanceTo(tp);
      if(dist<14){
        spawnExplosion(m.pos.clone(),m.isBoss?2:1.4,0xFF6600);
        destroyMissile(m,true);
        const pts=m.isBoss?600:150; score+=pts; waveScore+=pts;
        showNotif('FIST BUMP INTERCEPT! +'+pts);
      }
    }
    spawnExplosion(tp,4,0xFF4400);
  }
  if(s.t>2.5||(s.done&&s.t>1.6)){
    scene.remove(s.lFist); scene.remove(s.rFist);
    _rajpnState=null;
  }
}

// ═══════════════════════════════════════════════════════════════
//  GADGETS
// ═══════════════════════════════════════════════════════════════
function _gadgetKillSoldier(i){
  const s=soldiers[i];
  scene.remove(s.group);
  if(s.barEl) s.barEl.remove();
  spawnAmmoPack(s.pos);
  soldiers.splice(i,1);
  score+=150; waveScore+=150;
  saveData.totalSoldierKills=(saveData.totalSoldierKills||0)+1;
}

function useFlashbang(){
  if((activeGadgets.flashbang||0)<1){showNotif('No flashbangs!');return;}
  activeGadgets.flashbang--;
  // Concussion blast: stuns 5s, damages soldiers, knocks them back
  let hit=0,killed=0;
  const fbRadius=24*(window._flashRad||1);
  for(let i=soldiers.length-1;i>=0;i--){
    const s=soldiers[i];
    const dx=s.pos.x-px,dz=s.pos.z-pz;
    const d=Math.sqrt(dx*dx+dz*dz);
    if(d<fbRadius){
      s.health-=35;
      if(s.health<=0){_gadgetKillSoldier(i);killed++;continue;}
      s._stunT=5;hit++;
      // knockback away from blast
      const kl=Math.max(.5,d);
      s.pos.x+=dx/kl*4; s.pos.z+=dz/kl*4;
      if(s.fillEl) s.fillEl.style.width=Math.max(0,Math.round(s.health/s.maxHealth*100))+'%';
    }
  }
  // expanding white shock ring on the ground
  const ring=new THREE.Mesh(new THREE.TorusGeometry(1,.18,8,32),
    new THREE.MeshBasicMaterial({color:0xFFFFEE,transparent:true,opacity:.9}));
  ring.rotation.x=Math.PI/2;ring.position.set(px,.4,pz);scene.add(ring);
  let rt=0;
  const riv=setInterval(()=>{
    rt+=0.04;ring.scale.setScalar(1+rt*fbRadius*.9);
    ring.material.opacity=Math.max(0,.9-rt*1.4);
    if(rt>=.7){clearInterval(riv);scene.remove(ring);}
  },16);
  triggerScreenShake(.5);
  showNotif('CONCUSSION BLAST! '+hit+' stunned'+(killed?', '+killed+' down':'')+'!');
  const fl=document.getElementById('damageFlash');
  if(fl){fl.style.background='rgba(255,255,220,.85)';fl.classList.add('flash');
    setTimeout(()=>{fl.style.background='';fl.classList.remove('flash');},400);}
  playTone(3200,.25,'sine',.3);
  sfxExplosion();
  updateGadgetHud();
}

function useAirstrike(){
  if((activeGadgets.airstrike||0)<1){showNotif('No airstrikes!');return;}
  activeGadgets.airstrike--;
  // Real barrage: 5 bombs rain down across the hot zone over ~2.5s
  let tx=px,tz=pz;
  if(missiles.length>0){const m=missiles[0];tx=m.pos.x;tz=m.pos.z;}
  showNotif('AIRSTRIKE INBOUND — DANGER CLOSE!');
  sfxAlert();
  let totalKills=0,totalMissiles=0;
  for(let b=0;b<5;b++){
    setTimeout(()=>{
      const bx=tx+(Math.random()-.5)*18, bz=tz+(Math.random()-.5)*18;
      // falling bomb mesh
      const bomb=new THREE.Group();
      const body=new THREE.Mesh(new THREE.CylinderGeometry(.22,.22,1.4,8),
        new THREE.MeshLambertMaterial({color:0x2A3038}));
      const nose=new THREE.Mesh(new THREE.ConeGeometry(.22,.5,8),
        new THREE.MeshLambertMaterial({color:0xB03020,emissive:0x501008,emissiveIntensity:.5}));
      nose.position.y=-.95;nose.rotation.x=Math.PI;
      bomb.add(body,nose);
      bomb.position.set(bx,46,bz);
      scene.add(bomb);
      let bt=0;
      const biv=setInterval(()=>{
        bt+=0.035;
        bomb.position.y=46-46*bt*bt; // accelerating fall
        if(bt>=1){
          clearInterval(biv);scene.remove(bomb);
          // impact: missiles r10, soldiers r9
          for(let i=missiles.length-1;i>=0;i--){
            const m=missiles[i];
            const d=Math.sqrt((m.pos.x-bx)**2+(m.pos.z-bz)**2);
            if(d<10&&!m.isDestroyed){destroyMissile(m,true);totalMissiles++;}
          }
          for(let i=soldiers.length-1;i>=0;i--){
            const s=soldiers[i];
            const d=Math.sqrt((s.pos.x-bx)**2+(s.pos.z-bz)**2);
            if(d<9){s.health-=120;if(s.health<=0){_gadgetKillSoldier(i);totalKills++;}}
          }
          score+=totalMissiles*200; waveScore+=totalMissiles*200;
          triggerScreenShake(.7);
          spawnExplosion(new THREE.Vector3(bx,2,bz),2.6,0xFF4400);
          sfxExplosion();
        }
      },16);
    },600+b*480);
  }
  setTimeout(()=>showNotif('AIRSTRIKE: '+totalMissiles+' missiles, '+totalKills+' hostiles destroyed!'),3600);
  updateGadgetHud();
}

function useCover(){
  if((activeGadgets.cover||0)<1){showNotif('No cover charges!');return;}
  activeGadgets.cover--;
  // Energy barricade: wide glowing wall + EMP pulse on deploy that
  // wipes incoming enemy bullets and shoves nearby hostiles back
  const fwx=-Math.sin(yaw)*4, fwz=-Math.cos(yaw)*4;
  const wallG=new THREE.Group();
  const frameM=new THREE.MeshLambertMaterial({color:0x1A2430});
  const coreM=new THREE.MeshLambertMaterial({color:0x2A6AC8,emissive:0x1A4A98,emissiveIntensity:.8,transparent:true,opacity:.55});
  const core=new THREE.Mesh(new THREE.BoxGeometry(5.4,2.8,.16),coreM);
  core.position.y=1.5;wallG.add(core);
  [[-2.8,1.5],[2.8,1.5]].forEach(([x,y])=>{
    const post=new THREE.Mesh(new THREE.BoxGeometry(.3,3.1,.3),frameM);
    post.position.set(x,y,0);wallG.add(post);
  });
  const top=new THREE.Mesh(new THREE.BoxGeometry(5.9,.22,.34),frameM);
  top.position.y=3.05;wallG.add(top);
  const base=new THREE.Mesh(new THREE.BoxGeometry(5.9,.3,.8),frameM);
  base.position.y=.15;wallG.add(base);
  wallG.position.set(px+fwx,0,pz+fwz);
  wallG.rotation.y=yaw;
  scene.add(wallG);
  // EMP pulse: clear enemy bullets, push hostiles
  if(typeof soldierBullets!=='undefined'){
    soldierBullets.forEach(b=>{if(b.mesh)scene.remove(b.mesh);});
    soldierBullets.length=0;
  }
  soldiers.forEach(s=>{
    const dx=s.pos.x-px,dz=s.pos.z-pz;
    const d=Math.sqrt(dx*dx+dz*dz);
    if(d<14){const kl=Math.max(.5,d);s.pos.x+=dx/kl*6;s.pos.z+=dz/kl*6;s._stunT=Math.max(s._stunT||0,1.5);}
  });
  // pulse + slow fade-out over 30s
  let wt=0;
  const wiv=setInterval(()=>{
    wt+=0.016;
    coreM.emissiveIntensity=.8+Math.sin(wt*5)*.25;
    if(wt>=30){clearInterval(wiv);scene.remove(wallG);}
    else if(wt>=27) coreM.opacity=.55*(1-(wt-27)/3);
  },16);
  showNotif('ENERGY BARRICADE DEPLOYED — EMP PULSE!');
  sfxShockFire();
  updateGadgetHud();
}

function updateGadgetHud(){
  const fb=document.getElementById('gadgetFlashbang');
  const as=document.getElementById('gadgetAirstrike');
  const cv=document.getElementById('gadgetCover');
  const hud=document.getElementById('gadgetHud');
  if(!hud) return;
  const fb_c=activeGadgets.flashbang||0;
  const as_c=activeGadgets.airstrike||0;
  const cv_c=activeGadgets.cover||0;
  hud.style.display=(fb_c+as_c+cv_c)>0||cyberBulletOwned||rajpnFistOwned?'flex':'none';
  if(fb) fb.textContent=fb_c>0?'[G] Flashbang x'+fb_c:'';
  if(as) as.textContent=as_c>0?'[T] Airstrike x'+as_c:'';
  if(cv) cv.textContent=cv_c>0?'[B] Cover x'+cv_c:'';
}

