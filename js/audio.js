// Audio
// ═══════════════════════════════════════════════════════════════
//  AUDIO (Web Audio API)
// ═══════════════════════════════════════════════════════════════
let audioCtx = null;
function getAudioCtx(){
  if(!audioCtx) audioCtx = new (window.AudioContext||window.webkitAudioContext)();
  return audioCtx;
}
function playTone(freq,dur,type='sine',vol=0.15){
  try{
    const ctx=getAudioCtx();
    const o=ctx.createOscillator();const g=ctx.createGain();
    o.connect(g);g.connect(ctx.destination);
    o.type=type;o.frequency.setValueAtTime(freq,ctx.currentTime);
    g.gain.setValueAtTime(vol,ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001,ctx.currentTime+dur);
    o.start();o.stop(ctx.currentTime+dur);
  }catch(e){}
}
function makeNoise(ctx,dur,lpFreq,vol){
  const len=Math.ceil(ctx.sampleRate*dur);
  const buf=ctx.createBuffer(1,len,ctx.sampleRate);
  const d=buf.getChannelData(0);
  for(let i=0;i<len;i++)d[i]=(Math.random()*2-1);
  const src=ctx.createBufferSource();
  const lp=ctx.createBiquadFilter();lp.type='lowpass';lp.frequency.value=lpFreq;
  const g=ctx.createGain();
  src.buffer=buf;src.connect(lp);lp.connect(g);g.connect(ctx.destination);
  g.gain.setValueAtTime(vol,ctx.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001,ctx.currentTime+dur);
  src.start();src.stop(ctx.currentTime+dur);
}
function sfxFire(){
  try{
    const ctx=getAudioCtx();
    // Thump
    const o=ctx.createOscillator();const g=ctx.createGain();
    o.connect(g);g.connect(ctx.destination);
    o.type='sine';o.frequency.setValueAtTime(140,ctx.currentTime);
    o.frequency.exponentialRampToValueAtTime(40,ctx.currentTime+.12);
    g.gain.setValueAtTime(.5,ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(.001,ctx.currentTime+.18);
    o.start();o.stop(ctx.currentTime+.18);
    makeNoise(ctx,.08,2200,.18);
  }catch(e){}
}
function sfxPistolFire(){
  try{
    const ctx=getAudioCtx();
    const o=ctx.createOscillator();const g=ctx.createGain();
    o.type='triangle';o.frequency.setValueAtTime(900,ctx.currentTime);
    o.frequency.exponentialRampToValueAtTime(200,ctx.currentTime+.06);
    o.connect(g);g.connect(ctx.destination);
    g.gain.setValueAtTime(.35,ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(.001,ctx.currentTime+.08);
    o.start();o.stop(ctx.currentTime+.09);
    makeNoise(ctx,.04,4000,.12);
  }catch(e){}
}
function sfxShotgunFire(){
  try{
    const ctx=getAudioCtx();
    makeNoise(ctx,.14,3000,.55);
    const o=ctx.createOscillator();const g=ctx.createGain();
    o.type='sine';o.frequency.setValueAtTime(80,ctx.currentTime);
    o.frequency.exponentialRampToValueAtTime(30,ctx.currentTime+.18);
    o.connect(g);g.connect(ctx.destination);
    g.gain.setValueAtTime(.6,ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(.001,ctx.currentTime+.22);
    o.start();o.stop(ctx.currentTime+.22);
  }catch(e){}
}
function sfxHookFire(){playTone(800,.06,'sine',.12);playTone(1400,.08,'sine',.08);}
function sfxHookLatch(){makeNoise(getAudioCtx(),.05,1200,.2);playTone(440,.1,'sine',.15);}
function sfxSoldierFire(){
  try{makeNoise(getAudioCtx(),.05,3500,.15);}catch(e){}
}
function sfxAmmoPick(){playTone(660,.07,'sine',.18);setTimeout(()=>playTone(1100,.09,'sine',.18),80);}
function sfxCollapse(){
  try{
    const ctx=getAudioCtx();
    makeNoise(ctx,.45,800,.5);
    const o=ctx.createOscillator();const g=ctx.createGain();
    o.type='sine';o.frequency.setValueAtTime(60,ctx.currentTime);
    o.frequency.exponentialRampToValueAtTime(20,ctx.currentTime+.4);
    o.connect(g);g.connect(ctx.destination);
    g.gain.setValueAtTime(.4,ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(.001,ctx.currentTime+.4);
    o.start();o.stop(ctx.currentTime+.4);
  }catch(e){}
}
function sfxEasterEgg(){[523,659,784,1047].forEach((f,i)=>setTimeout(()=>playTone(f,.22,'sine',.2),i*130));}
function sfxExplosion(){
  try{
    const ctx=getAudioCtx();
    makeNoise(ctx,.5,1800,.5);
    // Low boom
    const o=ctx.createOscillator();const g=ctx.createGain();
    o.type='sine';o.frequency.setValueAtTime(90,ctx.currentTime);
    o.frequency.exponentialRampToValueAtTime(22,ctx.currentTime+.5);
    o.connect(g);g.connect(ctx.destination);
    g.gain.setValueAtTime(.55,ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(.001,ctx.currentTime+.5);
    o.start();o.stop(ctx.currentTime+.5);
  }catch(e){}
}
function sfxReload(){
  try{
    const ctx=getAudioCtx();
    makeNoise(ctx,.06,2000,.1);
    setTimeout(()=>makeNoise(ctx,.04,3000,.12),220);
    setTimeout(()=>playTone(880,.08,'sine',.1),420);
  }catch(e){}
}
function sfxScope(){playTone(1100,.08,'sine',.1);}
function sfxAlert(){playTone(880,.06,'square',.12);setTimeout(()=>playTone(1100,.08,'square',.14),120);}
function sfxWaveComplete(){[440,550,660,880].forEach((f,i)=>setTimeout(()=>playTone(f,.2,'sine',.18),i*110));}

