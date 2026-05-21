// Missiles + building damage + projectiles + particles
// ═══════════════════════════════════════════════════════════════
//  MISSILE SYSTEM
// ═══════════════════════════════════════════════════════════════
function spawnMissile(isBoss){
  if(window._allBoss) isBoss=true;
  const loc=LOCS[selectedLoc];
  // Spawn from the correct direction per location (beirut=from south/+Z, others=from north/-Z)
  const baseA=selectedLoc==='beirut'?Math.PI/2:3*Math.PI/2;
  const angle=baseA+(Math.random()-.5)*(Math.PI/1.5);
  const dist=SPAWN_RANGE*.4+Math.random()*SPAWN_RANGE*.6;
  const sx=Math.cos(angle)*dist;
  const sz=Math.sin(angle)*dist;

  // Target: random building
  let target=null;
  const aliveBlds=buildings.filter(b=>!b.isDestroyed);
  if(aliveBlds.length>0) target=aliveBlds[Math.floor(Math.random()*aliveBlds.length)];
  const tx=target?target.pos.x:(Math.random()-.5)*60;
  const tz=target?target.pos.z:(Math.random()-.5)*60;

  const speedBase=4+waveNum*.7;
  const speedRand=speedBase+Math.random()*3;
  const finalSpeed=isBoss?speedRand*.7:speedRand;

  const dy=0-SPAWN_H;
  const dx=tx-sx,dz=tz-sz;
  const len=Math.sqrt(dx*dx+dy*dy+dz*dz);
  const vel=new THREE.Vector3(dx/len*finalSpeed,dy/len*finalSpeed,dz/len*finalSpeed);

  const radius=isBoss?BOSS_RADIUS:MISS_RADIUS;
  const health=isBoss ? 3+Math.floor(waveNum/2) : Math.max(1,Math.floor((waveNum-1)/3)+1);

  // Missile group
  const group=new THREE.Group();
  group.position.set(sx,SPAWN_H,sz);

  const bodyColor=isBoss?0xFF2200:0x445566;
  const bodyM=new THREE.MeshLambertMaterial({color:bodyColor});
  const finM=new THREE.MeshLambertMaterial({color:isBoss?0xCC1100:0x334455});

  // Body
  const bodyGeo=new THREE.CylinderGeometry(radius*.35,radius*.5,radius*3.5,8);
  const bodyMesh=new THREE.Mesh(bodyGeo,bodyM);
  group.add(bodyMesh);

  // Nose cone
  const noseGeo=new THREE.ConeGeometry(radius*.35,radius*1.5,8);
  const nose=new THREE.Mesh(noseGeo,new THREE.MeshLambertMaterial({color:isBoss?0xFF4400:0x778899}));
  nose.position.y=radius*2.5; group.add(nose);

  // Fins
  for(let i=0;i<4;i++){
    const fin=new THREE.Mesh(new THREE.BoxGeometry(.04,radius*1.2,radius*.8),finM);
    fin.position.y=-radius*1.4;
    fin.rotation.y=i*Math.PI/2;
    fin.position.x=Math.sin(i*Math.PI/2)*radius*.4;
    fin.position.z=Math.cos(i*Math.PI/2)*radius*.4;
    group.add(fin);
  }

  // Boss glow
  if(isBoss){
    const glowLight=new THREE.PointLight(0xFF4400,1.5,15);
    group.add(glowLight);
  }

  // Trail
  const trailPts=[];
  for(let i=0;i<30;i++) trailPts.push(new THREE.Vector3(sx,SPAWN_H,sz));
  const trailGeo=new THREE.BufferGeometry().setFromPoints(trailPts);
  const trailMat=new THREE.LineBasicMaterial({
    color:isBoss?0xFF6600:0x88AAFF, transparent:true, opacity:.7
  });
  const trailLine=new THREE.Line(trailGeo,trailMat);
  scene.add(trailLine);

  // Orient missile toward target
  const dir=vel.clone().normalize();
  const up=new THREE.Vector3(0,1,0);
  if(Math.abs(dir.dot(up))<0.999) group.quaternion.setFromUnitVectors(up,dir);
  else group.rotation.x=dir.y<0?Math.PI:0;

  scene.add(group);
  let missileBarEl=null,missileBarFill=null;
  if(health>1){
    missileBarEl=document.createElement('div');
    missileBarEl.className='mb-wrap';
    missileBarEl.innerHTML=`<div class="mb-bg"><div class="mb-fill${isBoss?' boss':''}" style="width:100%"></div></div>`;
    document.getElementById('healthBars').appendChild(missileBarEl);
    missileBarFill=missileBarEl.querySelector('.mb-fill');
  }
  missiles.push({group,bodyMesh,pos:group.position,vel,radius,
    health,maxHealth:health,isBoss,
    trailPts,trailLine,isDestroyed:false,barEl:missileBarEl,fillEl:missileBarFill,
    _id:++_missileIdCounter});

  if(isBoss) sfxAlert();
}

function destroyMissile(missile,intercepted){
  if(missile.isDestroyed) return;
  missile.isDestroyed=true;
  if(missile.barEl) missile.barEl.remove();
  scene.remove(missile.group);
  scene.remove(missile.trailLine);

  const pos=missile.pos.clone();
  spawnExplosion(pos, missile.isBoss?4:2, missile.isBoss?0xFF4400:0xFF8800);

  if(intercepted){
    waveIntercepted++;
    totalInterceptedSession++;
    mpLocalStats.missiles++;
    killStreak++;
    killStreakTimer=4.0;
    const mult=killStreak>=5?2:killStreak>=3?1.5:1;
    const pts=Math.floor((missile.isBoss?500:100)*mult);
    score+=pts;
    waveScore+=pts;
    showScorePop(pts,pos);
    if(killStreak===3) showNotif('HAT TRICK! x1.5 score!');
    else if(killStreak===5) showNotif('ON FIRE! x2 score!');
    else if(killStreak===10) showNotif('UNSTOPPABLE! '+killStreak+' streak!');
    else if(killStreak>10&&killStreak%5===0) showNotif('GODLIKE! '+killStreak+' streak!');
    sfxExplosion();
    if(Math.random()<0.45) spawnInterceptDebris(pos, missile.isBoss);
  } else {
    waveMissed++;
    // Damage buildings in radius
    const blastR=missile.isBoss?18:12;
    sfxExplosion();
    for(const b of buildings){
      if(b.isDestroyed) continue;
      const dx=b.pos.x-pos.x, dz=b.pos.z-pos.z;
      const dist=Math.sqrt(dx*dx+dz*dz);
      if(dist<blastR) damageBuilding(b,missile.isBoss?2:1);
    }
    triggerScreenShake(.55);
    showDamageFlash();
  }
}

// ═══════════════════════════════════════════════════════════════
//  BUILDING DAMAGE
// ═══════════════════════════════════════════════════════════════
function damageBuilding(bld, dmg){
  if(bld.isDestroyed) return;
  bld.health-=dmg;
  if(bld.health<=0){
    bld.health=0;
    bld.isDestroyed=true;
    waveBldDestroyed++;
    collapseBuilding(bld);
    spawnExplosion(new THREE.Vector3(bld.pos.x,bld.h/2,bld.pos.z),3,0xFF5500);
    sfxCollapse();
    recalcCityIntegrity();
    if(cityIntegrity<=0&&!mods.godMode) triggerGameOver();
  } else if(bld.health===2){
    const c=new THREE.Color(bld.originalColor);
    c.lerp(new THREE.Color(0xFF7722),.35);
    bld.bodyMat.color.copy(c);
  } else if(bld.health===1){
    const c=new THREE.Color(bld.originalColor);
    c.lerp(new THREE.Color(0xFF2200),.65);
    bld.bodyMat.color.copy(c);
  }
}

function collapseBuilding(bld){
  scene.remove(bld.group);
  const count=Math.min(14, 8+Math.floor((bld.w*bld.d)/12));
  for(let i=0;i<count;i++){
    const sz=0.4+Math.random()*1.3;
    const geo=new THREE.BoxGeometry(sz, sz*(0.4+Math.random()*.7), sz);
    const mat=new THREE.MeshLambertMaterial({color:bld.originalColor,transparent:true,opacity:1});
    const mesh=new THREE.Mesh(geo,mat);
    mesh.position.set(
      bld.pos.x+(Math.random()-.5)*bld.w,
      Math.random()*bld.h*.5+0.5,
      bld.pos.z+(Math.random()-.5)*bld.d
    );
    const spd=3+Math.random()*7;
    const ang=Math.random()*Math.PI*2;
    const vel=new THREE.Vector3(Math.cos(ang)*spd, 2+Math.random()*6, Math.sin(ang)*spd);
    const rotV=new THREE.Vector3((Math.random()-.5)*5,(Math.random()-.5)*5,(Math.random()-.5)*5);
    scene.add(mesh);
    debris.push({mesh,vel,rotV,life:3.0,maxLife:3.0,mat});
  }
}

function updateDebris(dt){
  for(let i=debris.length-1;i>=0;i--){
    const d=debris[i];
    d.vel.y-=16*dt;
    d.mesh.position.x+=d.vel.x*dt;
    d.mesh.position.y+=d.vel.y*dt;
    d.mesh.position.z+=d.vel.z*dt;
    d.mesh.rotation.x+=d.rotV.x*dt;
    d.mesh.rotation.y+=d.rotV.y*dt;
    d.mesh.rotation.z+=d.rotV.z*dt;
    if(d.mesh.position.y<0){d.mesh.position.y=0;d.vel.y*=-.25;d.vel.x*=.7;d.vel.z*=.7;}
    d.life-=dt;
    d.mat.opacity=Math.max(0,d.life/d.maxLife);
    if(d.damaging&&d.mesh.position.y<12){
      // Hit buildings
      for(const b of buildings){
        if(b.isDestroyed) continue;
        const bdx=d.mesh.position.x-b.pos.x, bdz=d.mesh.position.z-b.pos.z;
        if(Math.abs(bdx)<b.w/2+0.5&&Math.abs(bdz)<b.d/2+0.5&&d.mesh.position.y<b.h+1){
          damageBuilding(b,1);d.damaging=false;break;
        }
      }
      // Hit soldiers
      if(d.damaging) for(let si=soldiers.length-1;si>=0;si--){
        const s=soldiers[si];
        const sdx=d.mesh.position.x-s.pos.x,sdz=d.mesh.position.z-s.pos.z;
        if(Math.sqrt(sdx*sdx+sdz*sdz)<2&&d.mesh.position.y<ENEMY_TYPES[s.type].baseScale*2){
          scene.remove(s.group);s.barEl.remove();spawnAmmoPack(s.pos);soldiers.splice(si,1);
          score+=200;waveScore+=200;showNotif('Debris Kill! +200');
          d.damaging=false;break;
        }
      }
    }
    if(d.life<=0){scene.remove(d.mesh);debris.splice(i,1);}
  }
}

function spawnInterceptDebris(pos, big){
  const count=big?9:5;
  for(let i=0;i<count;i++){
    const sz=0.3+Math.random()*.9;
    const geo=new THREE.BoxGeometry(sz,sz,sz);
    const mat=new THREE.MeshLambertMaterial({color:0x888899,transparent:true,opacity:1});
    const mesh=new THREE.Mesh(geo,mat);
    mesh.position.copy(pos);
    const spd=6+Math.random()*14;
    const ang=Math.random()*Math.PI*2;
    const vel=new THREE.Vector3(Math.cos(ang)*spd,2+Math.random()*5,Math.sin(ang)*spd);
    const rotV=new THREE.Vector3((Math.random()-.5)*7,(Math.random()-.5)*7,(Math.random()-.5)*7);
    scene.add(mesh);
    debris.push({mesh,vel,rotV,life:4,maxLife:4,mat,damaging:true});
  }
}

function recalcCityIntegrity(){
  const alive=buildings.filter(b=>!b.isDestroyed).length;
  cityIntegrity=Math.round((alive/Math.max(1,totalBuildings))*100);
}

// ═══════════════════════════════════════════════════════════════
//  PROJECTILE SYSTEM
// ═══════════════════════════════════════════════════════════════
function fireProjectile(){
  if(ammo<=0||isReloading||fireCD>0) return;
  const wep=WEAPONS[currentWeapon];
  ammo--;
  weaponAmmo[currentWeapon]=ammo;
  fireCD=wep.fireCD;
  waveShotsFired++;
  recoilT=0.12;
  if(currentWeapon==='pistol') sfxPistolFire();
  else if(currentWeapon==='shotgun') sfxShotgunFire();
  else sfxFire();

  const dir=new THREE.Vector3();
  camera.getWorldDirection(dir);
  const startPos=new THREE.Vector3(px,py,pz).add(dir.clone().multiplyScalar(.6));

  for(let p=0;p<wep.pellets;p++){
    const spreadDir=dir.clone();
    if(wep.spread>0){
      spreadDir.x+=(Math.random()-.5)*wep.spread*2;
      spreadDir.y+=(Math.random()-.5)*wep.spread;
      spreadDir.z+=(Math.random()-.5)*wep.spread*2;
      spreadDir.normalize();
    }
    const geo=new THREE.SphereGeometry(wep.projRadius*.5,5,5);
    const mat=new THREE.MeshLambertMaterial({color:wep.projColor});
    mat.emissive.set(wep.projColor);mat.emissiveIntensity=.5;
    const mesh=new THREE.Mesh(geo,mat);
    mesh.position.copy(startPos);
    scene.add(mesh);
    const tPts=[startPos.clone(),startPos.clone()];
    const tGeo=new THREE.BufferGeometry().setFromPoints(tPts);
    const tMat=new THREE.LineBasicMaterial({color:wep.projColor,transparent:true,opacity:.5});
    const tLine=new THREE.Line(tGeo,tMat);
    scene.add(tLine);
    projectiles.push({mesh,trailLine:tLine,trailPts:tPts,pos:startPos.clone(),
      vel:spreadDir.clone().multiplyScalar(wep.projSpeed),life:5,projRadius:wep.projRadius,dmg:wep.dmg||10});
  }
  spawnMuzzleFlash(startPos);
}

function spawnMuzzleFlash(pos){
  const light=new THREE.PointLight(0xFF8844,3,8);
  light.position.copy(pos);
  scene.add(light);
  setTimeout(()=>scene.remove(light),100);
}

// ═══════════════════════════════════════════════════════════════
//  PARTICLE / EXPLOSION SYSTEM
// ═══════════════════════════════════════════════════════════════
function spawnExplosion(pos,scale,color){
  const count=18+Math.floor(scale*8);
  for(let i=0;i<count;i++){
    const size=.1+Math.random()*.18*scale;
    const geo=new THREE.SphereGeometry(size,4,4);
    const mat=new THREE.MeshLambertMaterial({
      color:color,emissive:new THREE.Color(color),emissiveIntensity:.6,
      transparent:true,opacity:1
    });
    const mesh=new THREE.Mesh(geo,mat);
    mesh.position.copy(pos);
    const speed=(1+Math.random()*2)*scale;
    const theta=Math.random()*Math.PI*2;
    const phi=Math.random()*Math.PI;
    const vel=new THREE.Vector3(
      Math.sin(phi)*Math.cos(theta)*speed,
      Math.cos(phi)*speed*1.2,
      Math.sin(phi)*Math.sin(theta)*speed
    );
    scene.add(mesh);
    const maxLife=.8+Math.random()*.6;
    particles.push({mesh,vel,life:maxLife,maxLife,mat});
  }
  // Flash light
  const flash=new THREE.PointLight(new THREE.Color(color),.8+scale*.2,scale*15);
  flash.position.copy(pos);
  scene.add(flash);
  setTimeout(()=>scene.remove(flash),200);
}

