// Minimap + physics + soldier system
// ═══════════════════════════════════════════════════════════════
//  MINIMAP
// ═══════════════════════════════════════════════════════════════
function updateMinimap(){
  const canvas=document.getElementById('minimap');
  if(!canvas) return;
  const ctx=canvas.getContext('2d');
  const W=canvas.width,H=canvas.height;
  const RANGE=100; // world-unit radius shown on map

  ctx.clearRect(0,0,W,H);
  ctx.fillStyle='rgba(0,16,8,0.88)';
  ctx.fillRect(0,0,W,H);

  // Clip to canvas interior
  ctx.save();
  ctx.beginPath();ctx.rect(2,2,W-4,H-4);ctx.clip();

  function w2m(wx,wz){
    return{x:(wx-px)/RANGE*(W/2)+W/2, y:(wz-pz)/RANGE*(H/2)+H/2};
  }

  // Buildings
  for(const b of buildings){
    if(b.isDestroyed) continue;
    const{x,y}=w2m(b.pos.x,b.pos.z);
    const bw=(b.w||8)/RANGE*(W/2);
    const bd=(b.d||8)/RANGE*(H/2);
    ctx.fillStyle='#4A5E4A';
    ctx.fillRect(x-bw/2,y-bd/2,bw,bd);
    ctx.strokeStyle='#6A8A6A';
    ctx.lineWidth=0.5;
    ctx.strokeRect(x-bw/2,y-bd/2,bw,bd);
  }

  // Helicopters
  for(const h of helicopters){
    const{x,y}=w2m(h.pos.x,h.pos.z);
    ctx.fillStyle='#FFCC44';
    ctx.beginPath();ctx.arc(x,y,3.5,0,Math.PI*2);ctx.fill();
  }

  // Soldiers
  for(const s of soldiers){
    const{x,y}=w2m(s.pos.x,s.pos.z);
    const col=s.locId==='sweden'?'#4A8ACC':'#88AA33';
    ctx.fillStyle=col;
    ctx.beginPath();ctx.arc(x,y,2.5,0,Math.PI*2);ctx.fill();
  }

  // Missiles
  for(const m of missiles){
    if(m.isDestroyed) continue;
    const dx=m.pos.x-px,dz=m.pos.z-pz;
    const close=Math.sqrt(dx*dx+dz*dz)<30;
    ctx.fillStyle=close?'#FF3333':'#44FF44';
    const{x,y}=w2m(m.pos.x,m.pos.z);
    ctx.beginPath();ctx.arc(x,y,3,0,Math.PI*2);ctx.fill();
    // Pulse ring for close missiles
    if(close){
      ctx.strokeStyle='rgba(255,50,50,0.55)';
      ctx.lineWidth=1;
      ctx.beginPath();ctx.arc(x,y,6,0,Math.PI*2);ctx.stroke();
    }
  }

  ctx.restore();

  // Player dot (always center)
  ctx.fillStyle='#FFFFFF';
  ctx.beginPath();ctx.arc(W/2,H/2,4,0,Math.PI*2);ctx.fill();

  // Direction arrow
  const yaw=camera.rotation.y;
  const arrowLen=10;
  const ax=W/2-Math.sin(yaw)*arrowLen;
  const ay=H/2-Math.cos(yaw)*arrowLen; // -z = forward in Three.js
  ctx.strokeStyle='#FFFFFF';
  ctx.lineWidth=1.5;
  ctx.beginPath();ctx.moveTo(W/2,H/2);ctx.lineTo(ax,ay);ctx.stroke();

  // Label
  ctx.fillStyle='rgba(68,255,136,0.8)';
  ctx.font='bold 9px monospace';
  ctx.textAlign='center';
  ctx.fillText('RADAR',W/2,H-4);
}

// ═══════════════════════════════════════════════════════════════
//  PHYSICS UPDATE
// ═══════════════════════════════════════════════════════════════
function updateProjectiles(dt){
  for(let i=projectiles.length-1;i>=0;i--){
    const p=projectiles[i];
    if(!p.mesh) continue;

    p.pos.x+=p.vel.x*dt;
    p.pos.y+=p.vel.y*dt;
    p.pos.z+=p.vel.z*dt;
    p.mesh.position.copy(p.pos);
    p.life-=dt;

    // Update trail
    p.trailPts.unshift(p.pos.clone());
    if(p.trailPts.length>12) p.trailPts.pop();
    p.trailLine.geometry.setFromPoints(p.trailPts);
    p.trailLine.geometry.attributes.position.needsUpdate=true;

    // Check hits
    let hit=false;
    for(const m of missiles){
      if(m.isDestroyed) continue;
      const dx=m.pos.x-p.pos.x, dy=m.pos.y-p.pos.y, dz=m.pos.z-p.pos.z;
      const dist=Math.sqrt(dx*dx+dy*dy+dz*dz);
      if(dist<((p.projRadius||PROJ_RADIUS)+m.radius)){
        m.health-=Math.max(1,Math.round((p.dmg/10)*dmgMult));
        if(m.health<=0){
          destroyMissile(m,true);
          // RPG splash damage to nearby missiles
          if(p.weapon==='launcher'){
            const wep=WEAPONS.launcher;
            const splashR=wep.splashRadius||10;
            const splashMult=wep.splashDmgMult||0.5;
            for(let si=missiles.length-1;si>=0;si--){
              const sm=missiles[si];
              if(sm.isDestroyed||sm===m) continue;
              const sd=sm.pos.distanceTo(p.pos);
              if(sd<splashR){
                const falloff=1-(sd/splashR);
                sm.health-=Math.max(1,Math.round((p.dmg/10)*dmgMult*splashMult*falloff));
                if(sm.health<=0) destroyMissile(sm,true);
              }
            }
            triggerScreenShake(0.7);
          }
        } else {
          m.bodyMesh.material.emissive.set(0xFF4400);
          m.bodyMesh.material.emissiveIntensity=1;
          setTimeout(()=>{ if(!m.isDestroyed){m.bodyMesh.material.emissiveIntensity=0;} },150);
          spawnExplosion(p.pos.clone(),.8,0xFF8800);
        }
        hit=true; break;
      }
    }

    if(!hit) hit=checkSoldierHits(p.pos,p.dmg);
    // Building wall impact
    if(!hit){
      for(const b of buildings){
        if(b.isDestroyed) continue;
        const hx=b.w/2,hz=b.d/2;
        if(Math.abs(p.pos.x-b.pos.x)<hx&&Math.abs(p.pos.z-b.pos.z)<hz&&p.pos.y>=0&&p.pos.y<b.h){
          const isRpg=p.weapon==='launcher';
          spawnExplosion(p.pos.clone(),isRpg?2.2:0.35,isRpg?0xFF6600:0xFFEEAA);
          if(isRpg) triggerScreenShake(0.3);
          hit=true; break;
        }
      }
    }
    // Floor impact — rocket jump if near player
    if(!hit&&p.pos.y<=0.15){
      const isRpg=p.weapon==='launcher';
      spawnExplosion(p.pos.clone(),isRpg?2.8:0.28,isRpg?0xFF6600:0xDDDDDD);
      if(isRpg){
        triggerScreenShake(0.4);
        const pdx=p.pos.x-px,pdz=p.pos.z-pz;
        const distToPlayer=Math.sqrt(pdx*pdx+pdz*pdz);
        if(distToPlayer<9){
          const impulse=(1-(distToPlayer/9))*22;
          vy=Math.max(vy,impulse);
          onGround=false;
          showNotif('ROCKET JUMP!');
        }
      }
      hit=true;
    }
    // Battle mode: check hits on remote players
    if(!hit&&battleActive&&mpRoom){
      mpRemotePlayers.forEach(rp=>{
        if(hit) return;
        const dx=rp.pos.x-p.pos.x, dy=rp.pos.y-p.pos.y, dz=rp.pos.z-p.pos.z;
        if(dx*dx+dy*dy+dz*dz<1.8){
          const dmg=Math.max(5,Math.round((p.dmg||10)*dmgMult));
          mpBattleSendHit(dmg);
          spawnExplosion(p.pos.clone(),.6,0xFF4400);
          hit=true;
        }
      });
    }
    // Gulag: projectiles stopped by arena walls
    const pArena=battleActive&&(Math.abs(p.pos.x)>41||Math.abs(p.pos.z)>41||p.pos.y<0||p.pos.y>9);
    if(hit||p.life<=0||p.pos.y<-2||Math.abs(p.pos.x)>200||Math.abs(p.pos.z)>200||pArena){
      scene.remove(p.mesh);
      scene.remove(p.trailLine);
      projectiles.splice(i,1);
    }
  }
}

function updateMissiles(dt){
  for(let i=missiles.length-1;i>=0;i--){
    const m=missiles[i];
    if(m.isDestroyed){missiles.splice(i,1);continue;}

    if(!mpIsGuest){
      m.pos.x+=m.vel.x*dt;
      m.pos.y+=m.vel.y*dt;
      m.pos.z+=m.vel.z*dt;
    }
    m.group.position.copy(m.pos);

    // Missile health bar position
    if(m.barEl&&m.fillEl){
      const mv=m.pos.clone();
      const mp=mv.project(camera);
      const msx=(mp.x*.5+.5)*window.innerWidth;
      const msy=(-.5*mp.y+.5)*window.innerHeight;
      if(mp.z<1&&msx>0&&msx<window.innerWidth&&msy>0&&msy<window.innerHeight){
        m.barEl.style.display='flex';
        m.barEl.style.left=msx+'px';
        m.barEl.style.top=(msy-18)+'px';
        m.fillEl.style.width=(m.health/m.maxHealth*100)+'%';
      } else { m.barEl.style.display='none'; }
    }

    // Update trail
    m.trailPts.unshift(m.pos.clone());
    if(m.trailPts.length>30) m.trailPts.pop();
    m.trailLine.geometry.setFromPoints(m.trailPts);
    m.trailLine.geometry.attributes.position.needsUpdate=true;

    // Near-miss: missile passes within 9 units of player heading downward
    if(!m._nearMissed && gameActive && m.vel.y<0){
      const dx=m.pos.x-px, dy=m.pos.y-py, dz=m.pos.z-pz;
      if(dx*dx+dy*dy+dz*dz<81){
        m._nearMissed=true;
        score+=50; waveScore+=50;
        showNotif('CLOSE CALL! +50');
      }
    }

    // Building collision
    if(!mpIsGuest){
      let bldHit=false;
      for(const b of buildings){
        if(b.isDestroyed) continue;
        const hw=b.w/2+m.radius, hd=b.d/2+m.radius;
        if(Math.abs(m.pos.x-b.pos.x)<hw&&Math.abs(m.pos.z-b.pos.z)<hd&&m.pos.y<b.h+m.radius&&m.pos.y>0){
          destroyMissile(m,false);
          missiles.splice(i,1);
          bldHit=true; break;
        }
      }
      if(bldHit) continue;
    }

    // Ground collision — only host/solo runs destruction
    if(!mpIsGuest && m.pos.y<=.8){
      destroyMissile(m,false);
      missiles.splice(i,1);
    }
  }
}

function updateParticles(dt){
  for(let i=particles.length-1;i>=0;i--){
    const p=particles[i];
    p.vel.y-=8*dt;
    p.mesh.position.x+=p.vel.x*dt;
    p.mesh.position.y+=p.vel.y*dt;
    p.mesh.position.z+=p.vel.z*dt;
    p.life-=dt;
    p.mat.opacity=Math.max(0,p.life/p.maxLife);
    if(p.life<=0){scene.remove(p.mesh);particles.splice(i,1);}
  }
}

// ═══════════════════════════════════════════════════════════════
//  SOLDIER SYSTEM
// ═══════════════════════════════════════════════════════════════
const ENEMY_TYPES = {
  grunt:  { hp:3,  speed:3.2, baseScale:1.15, fireRate:2.0, dmg:2,  label:'GRUNT',  engageR:55, retreatR:70 },
  heavy:  { hp:10, speed:1.8, baseScale:1.8,  fireRate:3.5, dmg:4,  label:'HEAVY',  engageR:50, retreatR:65 },
  sniper: { hp:2,  speed:1.4, baseScale:1.1,  fireRate:3.8, dmg:5,  label:'SNIPER', engageR:70, retreatR:80, stayBack:true },
};

function makeSoldierMesh(locId, type){
  const g=new THREE.Group();
  const isNorway=locId==='sweden';
  const isIsrael=locId==='beirut';
  // Norway: steel blue. Israel: tan/olive IDF. Iran: dark olive-khaki.
  const uniC  = isNorway ? 0x4A6A8A : isIsrael ? 0xB8A878 : 0x6B7A2A;
  const helmC = isNorway ? 0x1E3A58 : isIsrael ? 0x8A8050 : 0x3A4A10;
  const vestC = isNorway ? 0x2A4A6A : isIsrael ? 0x9A9060 : 0x4A5A18;
  const skinM =new THREE.MeshLambertMaterial({color:0xC8955A});
  const uniM  =new THREE.MeshLambertMaterial({color:uniC});
  const helmM =new THREE.MeshLambertMaterial({color:helmC});
  const vestM =new THREE.MeshLambertMaterial({color:vestC});
  const rifleM=new THREE.MeshLambertMaterial({color:0x111111});
  const s=type==='heavy'?1.6:type==='sniper'?1.05:1.0;
  // Legs
  [-1,1].forEach(side=>{
    const leg=new THREE.Mesh(new THREE.BoxGeometry(.15*s,.6*s,.16*s),uniM);
    leg.position.set(side*.12*s,.3*s,0);g.add(leg);
  });
  // Torso
  const torso=new THREE.Mesh(new THREE.BoxGeometry(.42*s,.52*s,.24*s),uniM);
  torso.position.y=.9*s;g.add(torso);
  // Vest
  const vest=new THREE.Mesh(new THREE.BoxGeometry(.44*s,.35*s,.08*s),vestM);
  vest.position.set(0,.95*s,.12*s);g.add(vest);
  // Arms
  [-1,1].forEach(side=>{
    const arm=new THREE.Mesh(new THREE.BoxGeometry(.13*s,.48*s,.13*s),uniM);
    arm.position.set(side*.32*s,.88*s,0);g.add(arm);
  });
  // Head
  const head=new THREE.Mesh(new THREE.BoxGeometry(.25*s,.26*s,.25*s),skinM);
  head.position.y=1.35*s;g.add(head);
  // Helmet
  const helm=new THREE.Mesh(new THREE.BoxGeometry(.30*s,.18*s,.30*s),helmM);
  helm.position.y=1.49*s;g.add(helm);
  // Heavy shoulder pads
  if(type==='heavy'){
    [-1,1].forEach(side=>{
      const pad=new THREE.Mesh(new THREE.BoxGeometry(.14,.12,.28),vestM);
      pad.position.set(side*.38,.98*s,0);g.add(pad);
    });
  }
  // Rifle / sniper rifle
  const rLen=type==='sniper'?.56:.38;
  const rifle=new THREE.Mesh(new THREE.BoxGeometry(.046,.046,rLen),rifleM);
  rifle.position.set(.32*s,.88*s,-(rLen/2));g.add(rifle);
  return g;
}

function spawnSoldiers(locId, count){
  for(let i=0;i<count;i++){
    const roll=Math.random();
    const type=roll<.65?'grunt':roll<.88?'heavy':'sniper';
    const tData=ENEMY_TYPES[type];
    let x,z,patrolCX=0,patrolCZ=0,patrolR;
    if(helicopters.length>0){
      const h=helicopters[i%helicopters.length];
      const angle=Math.random()*Math.PI*2;
      const r=2+Math.random()*5;
      x=h.pos.x+Math.cos(angle)*r;
      z=h.pos.z+Math.sin(angle)*r;
      patrolCX=h.pos.x; patrolCZ=h.pos.z;
      patrolR=6+Math.random()*8;
    } else {
      const dist=14+Math.random()*14;
      const angle=Math.random()*Math.PI*2;
      x=Math.cos(angle)*dist; z=Math.sin(angle)*dist;
      patrolR=dist;
    }
    const group=makeSoldierMesh(locId, type);
    group.position.set(x,0,z);
    scene.add(group);
    const barEl=document.createElement('div');
    barEl.className='eb-wrap';
    barEl.innerHTML=`<div class="eb-type">${tData.label}</div>`+
      `<div class="eb-bg"><div class="eb-fill ${type}" id="ebf-${soldiers.length}" style="width:100%"></div></div>`;
    document.getElementById('healthBars').appendChild(barEl);
    const fillEl=barEl.querySelector('.eb-fill');
    soldiers.push({group,pos:new THREE.Vector3(x,0,z),locId,type,
      health:tData.hp,maxHealth:tData.hp,
      state:'patrol',fireCooldown:1+Math.random()*2,
      patrolR,patrolCX,patrolCZ,patrolT:Math.random()*Math.PI*2,barEl,fillEl});
  }
}

function updateSoldiers(dt){
  for(let i=soldiers.length-1;i>=0;i--){
    const s=soldiers[i];
    // Flashbang stun
    if(s._stunT>0){
      s._stunT-=dt;
      s.group.rotation.y+=dt*8; // spin while stunned
      continue;
    }
    const tData=ENEMY_TYPES[s.type];
    const dx=px-s.pos.x, dz=pz-s.pos.z;
    const distToPlayer=Math.sqrt(dx*dx+dz*dz);
    if(s.state==='patrol'){
      s.patrolT+=dt*.4;
      const tx=(s.patrolCX||0)+Math.cos(s.patrolT)*s.patrolR;
      const tz=(s.patrolCZ||0)+Math.sin(s.patrolT)*s.patrolR;
      const mx=tx-s.pos.x, mz=tz-s.pos.z;
      const ml=Math.sqrt(mx*mx+mz*mz)||1;
      s.pos.x+=mx/ml*tData.speed*dt;s.pos.z+=mz/ml*tData.speed*dt;
      const effectiveEngageR=tData.engageR*(playerArmorStyle==='stealth'?0.60:1);
      if(distToPlayer<effectiveEngageR) s.state='attack';
    } else {
      const effectiveEngageR=tData.engageR*(playerArmorStyle==='stealth'?0.60:1);
      if(distToPlayer>tData.retreatR){s.state='patrol';}
      else {
        const ml=Math.sqrt(dx*dx+dz*dz)||1;
        const idealDist=tData.stayBack?20:6;
        if(distToPlayer>idealDist+2){s.pos.x+=dx/ml*tData.speed*dt;s.pos.z+=dz/ml*tData.speed*dt;}
        else if(distToPlayer<idealDist-2){s.pos.x-=dx/ml*tData.speed*.5*dt;s.pos.z-=dz/ml*tData.speed*.5*dt;}
        s.fireCooldown-=dt;
        if(s.fireCooldown<=0&&distToPlayer<effectiveEngageR){
          s.fireCooldown=tData.fireRate*(0.7+Math.random()*.6);
          fireSoldierBullet(s);
        }
      }
    }
    // Building collision push-out
    for(const b of buildings){
      if(b.isDestroyed) continue;
      const hw=b.w/2+1.0, hd=b.d/2+1.0;
      const bdx=s.pos.x-b.pos.x, bdz=s.pos.z-b.pos.z;
      if(Math.abs(bdx)<hw&&Math.abs(bdz)<hd){
        const ox=hw-Math.abs(bdx), oz=hd-Math.abs(bdz);
        if(ox<oz) s.pos.x=b.pos.x+(bdx>=0?hw:-hw);
        else s.pos.z=b.pos.z+(bdz>=0?hd:-hd);
      }
    }
    s.group.position.copy(s.pos);
    if(dx!==0||dz!==0) s.group.rotation.y=Math.atan2(dx,dz);
    // Health bar screen projection
    const v3=s.pos.clone();v3.y=tData.baseScale*1.8;
    const proj=v3.project(camera);
    const sx=(proj.x*.5+.5)*window.innerWidth;
    const sy=(-.5*proj.y+.5)*window.innerHeight;
    if(proj.z<1&&sx>0&&sx<window.innerWidth&&sy>20&&sy<window.innerHeight-20){
      s.barEl.style.display='flex';
      s.barEl.style.left=sx+'px';
      s.barEl.style.top=(sy-36)+'px';
      s.fillEl.style.width=(s.health/s.maxHealth*100)+'%';
    } else {
      s.barEl.style.display='none';
    }
  }
  updateSoldierBullets(dt);
}

function fireSoldierBullet(s){
  sfxSoldierFire();
  const spread=s.type==='sniper'?0.01:0.06;
  const dir=new THREE.Vector3(px-s.pos.x+(Math.random()-.5)*spread*20, PLAYER_H-1-s.pos.y, pz-s.pos.z+(Math.random()-.5)*spread*20).normalize();
  const speed=s.type==='sniper'?34:22;
  const geo=new THREE.SphereGeometry(s.type==='heavy'?.14:.08,4,4);
  const col=s.locId==='sweden'?0x88CCFF:0xFFAA22;
  const mat=new THREE.MeshLambertMaterial({color:col});
  const mesh=new THREE.Mesh(geo,mat);
  const startPos=s.pos.clone();startPos.y+=ENEMY_TYPES[s.type].baseScale*.9;
  mesh.position.copy(startPos);
  scene.add(mesh);
  soldierBullets.push({mesh,pos:startPos.clone(),vel:dir.multiplyScalar(speed),life:3,dmg:ENEMY_TYPES[s.type].dmg});
}

function updateSoldierBullets(dt){
  for(let i=soldierBullets.length-1;i>=0;i--){
    const b=soldierBullets[i];
    b.pos.x+=b.vel.x*dt;b.pos.y+=b.vel.y*dt;b.pos.z+=b.vel.z*dt;
    b.mesh.position.copy(b.pos);b.life-=dt;
    const dx=b.pos.x-px,dy=b.pos.y-py,dz=b.pos.z-pz;
    if(Math.sqrt(dx*dx+dy*dy+dz*dz)<1.2){
      triggerScreenShake(.3+b.dmg*.05);showDamageFlash();
      if(!mods.godMode){
        const dmgIn=Math.max(1,Math.round((b.dmg||2)*(window._playerDmgMult||1)*(playerArmorStyle==='heavy'?0.5:1)));
        cityIntegrity=Math.max(0,cityIntegrity-dmgIn);
        if(cityIntegrity<=0) triggerGameOver();
      }
      scene.remove(b.mesh);soldierBullets.splice(i,1);continue;
    }
    if(b.life<=0||b.pos.y<-2){scene.remove(b.mesh);soldierBullets.splice(i,1);}
  }
}

function checkSoldierHits(projPos,projDmg){
  for(let i=soldiers.length-1;i>=0;i--){
    const s=soldiers[i];
    const sc=ENEMY_TYPES[s.type].baseScale;
    const hitR=sc*1.1;
    const dx=projPos.x-s.pos.x,dy=projPos.y-sc*.8,dz=projPos.z-s.pos.z;
    if(Math.sqrt(dx*dx+dy*dy+dz*dz)<hitR){
      s.health-=Math.max(1,Math.round(((projDmg||10)/10)*dmgMult));
      if(s.health<=0){
        scene.remove(s.group);
        s.barEl.remove();
        const pts=s.type==='heavy'?400:s.type==='sniper'?350:150;
        spawnAmmoPack(s.pos);
        soldiers.splice(i,1);
        mpLocalStats.soldiers++;
        saveData.totalSoldierKills=(saveData.totalSoldierKills||0)+1;
        score+=pts;waveScore+=pts;
        if(window._killCreditBonus) saveData.currency+=window._killCreditBonus;
        showNotif('Enemy Down +'+pts);
        spawnExplosion(new THREE.Vector3(s.pos.x,sc,s.pos.z),1.2,0xFF5500);
      }
      return true;
    }
  }
  return false;
}

function spawnAmmoPack(pos){
  const geo=new THREE.BoxGeometry(.6,.4,.6);
  const mat=new THREE.MeshLambertMaterial({color:0x22CC44});
  mat.emissive.set(0x114422); mat.emissiveIntensity=.4;
  const mesh=new THREE.Mesh(geo,mat);
  mesh.position.set(pos.x,.2,pos.z);
  scene.add(mesh);
  ammoPacks.push({mesh,pos:new THREE.Vector3(pos.x,.2,pos.z)});
}

function checkAmmoPack(){
  for(let i=ammoPacks.length-1;i>=0;i--){
    const pk=ammoPacks[i];
    const dx=px-pk.pos.x,dz=pz-pk.pos.z;
    if(Math.sqrt(dx*dx+dz*dz)<2.5){
      ammo=Math.floor(WEAPONS[currentWeapon].maxAmmo*(window._ammoPackMult||1));
      isReloading=false;
      weaponAmmo[currentWeapon]=ammo;
      scene.remove(pk.mesh);ammoPacks.splice(i,1);
      showNotif('AMMO PICKED UP');sfxAmmoPick();
    }
  }
}

