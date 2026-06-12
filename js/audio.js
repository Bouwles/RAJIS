// Audio
// ═══════════════════════════════════════════════════════════════
//  AUDIO ENGINE v2 (Web Audio API)
//  Layered synth SFX: every sound is transient + body + tail through
//  a master compressor with a shared echo send. No audio assets.
// ═══════════════════════════════════════════════════════════════
let audioCtx=null,_aMaster=null,_aComp=null,_aEchoSend=null;

function getAudioCtx(){
  if(!audioCtx){
    audioCtx=new (window.AudioContext||window.webkitAudioContext)();
    // master chain: master gain → compressor → destination
    _aComp=audioCtx.createDynamicsCompressor();
    _aComp.threshold.value=-18;_aComp.knee.value=12;
    _aComp.ratio.value=5;_aComp.attack.value=.004;_aComp.release.value=.18;
    _aMaster=audioCtx.createGain();
    _aMaster.gain.value=.9;
    _aMaster.connect(_aComp);_aComp.connect(audioCtx.destination);
    // shared echo send: short slap delay w/ filtered feedback — adds space
    _aEchoSend=audioCtx.createGain();_aEchoSend.gain.value=.22;
    const dl=audioCtx.createDelay(1);dl.delayTime.value=.16;
    const fb=audioCtx.createGain();fb.gain.value=.32;
    const lp=audioCtx.createBiquadFilter();lp.type='lowpass';lp.frequency.value=1600;
    _aEchoSend.connect(dl);dl.connect(lp);lp.connect(fb);fb.connect(dl);
    lp.connect(_aMaster);
  }
  return audioCtx;
}
function _aOut(){getAudioCtx();return _aMaster;}

// ── Building blocks ────────────────────────────────────────────
// Tone: oscillator with pitch + amp envelopes. echo: send amount 0-1.
function _tone({freq=440,to=null,dur=.2,type='sine',vol=.2,at=0,detune=0,echo=0,curve='exp'}={}){
  try{
    const ctx=getAudioCtx(),t0=ctx.currentTime+at;
    const o=ctx.createOscillator(),g=ctx.createGain();
    o.type=type;o.detune.value=detune;
    o.frequency.setValueAtTime(Math.max(1,freq),t0);
    if(to) o.frequency.exponentialRampToValueAtTime(Math.max(1,to),t0+dur);
    g.gain.setValueAtTime(vol,t0);
    if(curve==='exp') g.gain.exponentialRampToValueAtTime(.0008,t0+dur);
    else g.gain.linearRampToValueAtTime(0,t0+dur);
    o.connect(g);g.connect(_aOut());
    if(echo>0){const e=ctx.createGain();e.gain.value=echo;g.connect(e);e.connect(_aEchoSend);}
    o.start(t0);o.stop(t0+dur+.02);
  }catch(e){}
}
// Noise burst through a filter. kind: lowpass|bandpass|highpass.
function _noise({dur=.1,kind='lowpass',freq=2000,to=null,q=1,vol=.2,at=0,echo=0}={}){
  try{
    const ctx=getAudioCtx(),t0=ctx.currentTime+at;
    const len=Math.max(1,Math.ceil(ctx.sampleRate*dur));
    const buf=ctx.createBuffer(1,len,ctx.sampleRate);
    const d=buf.getChannelData(0);
    for(let i=0;i<len;i++)d[i]=Math.random()*2-1;
    const src=ctx.createBufferSource();src.buffer=buf;
    const f=ctx.createBiquadFilter();f.type=kind;f.Q.value=q;
    f.frequency.setValueAtTime(freq,t0);
    if(to) f.frequency.exponentialRampToValueAtTime(Math.max(20,to),t0+dur);
    const g=ctx.createGain();
    g.gain.setValueAtTime(vol,t0);
    g.gain.exponentialRampToValueAtTime(.0008,t0+dur);
    src.connect(f);f.connect(g);g.connect(_aOut());
    if(echo>0){const e=ctx.createGain();e.gain.value=echo;g.connect(e);e.connect(_aEchoSend);}
    src.start(t0);src.stop(t0+dur+.02);
  }catch(e){}
}
// Sub-bass thump with fast pitch drop — the "weight" of a shot
function _thump(freq,to,dur,vol,at=0){_tone({freq,to,dur,type:'sine',vol,at});}
// Metallic ping: two detuned squares through a bandpass feel
function _ping(freq,dur,vol,at=0){
  _tone({freq,dur,type:'square',vol:vol*.5,at,detune:6});
  _tone({freq:freq*1.51,dur:dur*.7,type:'square',vol:vol*.3,at,detune:-8});
}

// Legacy helpers (other modules call these directly) ─────────────
function playTone(freq,dur,type='sine',vol=0.15){_tone({freq,dur,type,vol});}
function makeNoise(ctx,dur,lpFreq,vol){_noise({dur,kind:'lowpass',freq:lpFreq,vol});}

// ── Weapons ────────────────────────────────────────────────────
function sfxPistolFire(){
  _noise({dur:.025,kind:'highpass',freq:5500,vol:.30});            // snap
  _noise({dur:.07,kind:'bandpass',freq:2400,q:1.2,vol:.26,echo:.4});// crack
  _thump(190,70,.10,.34);                                           // body
}
function sfxShotgunFire(){
  _noise({dur:.03,kind:'highpass',freq:4500,vol:.34});
  _noise({dur:.16,kind:'lowpass',freq:3200,to:600,vol:.55,echo:.5});
  _thump(95,28,.24,.6);
  _thump(60,24,.30,.4,.01);
  _ping(1300,.05,.10,.42);                                          // pump clack
  _noise({dur:.05,kind:'bandpass',freq:900,q:2,vol:.16,at:.46});
}
function sfxSniperFire(){
  _noise({dur:.02,kind:'highpass',freq:6500,vol:.36});
  _noise({dur:.12,kind:'bandpass',freq:3000,q:1,vol:.4,echo:.7});
  _thump(150,40,.22,.5);
  _noise({dur:.5,kind:'lowpass',freq:1200,to:200,vol:.14,at:.05,echo:.6}); // long tail
}
function sfxSmgFire(){
  _noise({dur:.02,kind:'highpass',freq:5000,vol:.2});
  _noise({dur:.045,kind:'bandpass',freq:2600,q:1.4,vol:.18});
  _thump(220,90,.05,.2);
}
function sfxRailgunFire(){
  _tone({freq:240,to:2400,dur:.12,type:'sawtooth',vol:.16});        // charge zip
  _noise({dur:.05,kind:'highpass',freq:4000,vol:.3,at:.1});
  _thump(120,30,.3,.55,.1);
  _tone({freq:1800,to:300,dur:.4,type:'sawtooth',vol:.12,at:.1,echo:.7});
}
function sfxClusterFire(){
  _noise({dur:.08,kind:'lowpass',freq:1400,vol:.3});
  _thump(110,45,.18,.5);
  _tone({freq:500,to:900,dur:.35,type:'sine',vol:.07,at:.05});      // shell whistle up
}
function sfxShockFire(){
  _tone({freq:1400,to:300,dur:.16,type:'sawtooth',vol:.2,detune:18,echo:.5});
  _tone({freq:2100,to:500,dur:.12,type:'square',vol:.1,detune:-14});
  _noise({dur:.06,kind:'highpass',freq:3500,vol:.18});
}
function sfxFire(){ // launcher / default heavy shot
  _noise({dur:.05,kind:'highpass',freq:3000,vol:.2});
  _noise({dur:.22,kind:'lowpass',freq:2200,to:500,vol:.3,echo:.5});
  _thump(140,36,.2,.55);
  _noise({dur:.45,kind:'lowpass',freq:700,to:160,vol:.14,at:.06});  // rocket whoosh tail
}
// Per-weapon dispatch — combat.js routes through this
function sfxWeaponFire(w){
  if(w==='pistol') return sfxPistolFire();
  if(w==='shotgun') return sfxShotgunFire();
  if(w==='sniper') return sfxSniperFire();
  if(w==='smg') return sfxSmgFire();
  if(w==='railgun') return sfxRailgunFire();
  if(w==='cluster') return sfxClusterFire();
  if(w==='shock') return sfxShockFire();
  return sfxFire();
}

// ── World / combat ─────────────────────────────────────────────
function sfxExplosion(){
  _noise({dur:.04,kind:'highpass',freq:3000,vol:.3});               // initial crack
  _noise({dur:.7,kind:'lowpass',freq:1500,to:160,vol:.5,echo:.6});  // blast wash
  _thump(80,16,.9,.6);                                               // sub boom
  _thump(55,14,1.1,.35,.04);
  for(let i=0;i<4;i++) _noise({dur:.05,kind:'bandpass',freq:1800-(i*250),q:2,vol:.12,at:.12+i*.09}); // crackle
}
function sfxCollapse(){
  _noise({dur:.6,kind:'lowpass',freq:700,to:120,vol:.5});
  _thump(70,18,.6,.45);
  for(let i=0;i<5;i++) _noise({dur:.06,kind:'bandpass',freq:600+Math.random()*900,q:2,vol:.14,at:.08+i*.1});
}
function sfxSoldierFire(){
  _noise({dur:.03,kind:'bandpass',freq:2800,q:1.4,vol:.14});
  _thump(260,120,.04,.1);
}
function sfxReload(){
  _ping(900,.04,.14);                                               // mag out
  _noise({dur:.05,kind:'bandpass',freq:1100,q:2,vol:.14});
  _noise({dur:.05,kind:'bandpass',freq:800,q:2,vol:.16,at:.24});    // mag in
  _ping(700,.04,.12,.25);
  _ping(1400,.06,.16,.48);                                          // bolt release
  _noise({dur:.04,kind:'highpass',freq:3000,vol:.1,at:.49});
}
function sfxHookFire(){
  _noise({dur:.05,kind:'bandpass',freq:1200,q:1.5,vol:.24});        // launch thunk
  _thump(160,70,.08,.3);
  _noise({dur:.3,kind:'bandpass',freq:900,to:2400,q:3,vol:.1});     // cable zip
}
function sfxHookLatch(){
  _ping(1600,.05,.2);
  _noise({dur:.06,kind:'bandpass',freq:1400,q:2,vol:.2});
  _thump(120,60,.1,.25);
}
function sfxScope(){_noise({dur:.16,kind:'bandpass',freq:600,to:2200,q:2,vol:.09});}
function sfxAmmoPick(){
  _ping(880,.07,.16);
  _tone({freq:1320,dur:.1,type:'sine',vol:.14,at:.07,echo:.4});
  _tone({freq:1760,dur:.12,type:'sine',vol:.1,at:.13,echo:.5});
}
function sfxAlert(){
  _tone({freq:740,to:980,dur:.16,type:'square',vol:.1});
  _tone({freq:980,to:740,dur:.2,type:'square',vol:.12,at:.18,echo:.4});
}
function sfxWaveComplete(){
  [262,330,392,523].forEach((f,i)=>{
    _tone({freq:f,dur:.3,type:'sawtooth',vol:.07,at:i*.11,detune:5,echo:.6});
    _tone({freq:f,dur:.3,type:'triangle',vol:.12,at:i*.11});
  });
  _tone({freq:1047,dur:.5,type:'sine',vol:.12,at:.46,echo:.8});
}
function sfxEasterEgg(){
  [523,659,784,1047].forEach((f,i)=>{
    _tone({freq:f,dur:.24,type:'sawtooth',vol:.08,at:i*.13,detune:6,echo:.7});
    _tone({freq:f/2,dur:.24,type:'sine',vol:.1,at:i*.13});
  });
}

// ── UI / meta stingers ─────────────────────────────────────────
function sfxUIClick(){_noise({dur:.02,kind:'highpass',freq:3500,vol:.08});_ping(1800,.03,.06);}
function sfxPurchase(){
  _ping(1320,.06,.14);
  _tone({freq:880,dur:.12,type:'triangle',vol:.14,at:.06});
  _tone({freq:1760,dur:.16,type:'sine',vol:.12,at:.12,echo:.5});
}
function sfxEquip(){_ping(1100,.05,.12);_noise({dur:.04,kind:'bandpass',freq:1500,q:2,vol:.1,at:.04});}
function sfxSummonCharge(){
  _tone({freq:120,to:880,dur:.8,type:'sawtooth',vol:.08,echo:.5});
  _noise({dur:.8,kind:'bandpass',freq:400,to:3200,q:3,vol:.08});
}
function sfxSummonImpact(rarity){
  sfxExplosion();
  const f={mythic:1568,legendary:1318,epic:1175}[rarity]||988;
  _tone({freq:f,dur:.6,type:'sine',vol:.14,at:.15,echo:.8});
  _tone({freq:f*1.5,dur:.8,type:'sine',vol:.1,at:.3,echo:.8});
}
function sfxKillcam(){
  _tone({freq:392,to:196,dur:.5,type:'sawtooth',vol:.1,detune:8,echo:.6});
  _thump(90,30,.4,.3);
}
