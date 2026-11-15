(function(){
var s=null;
var autoTimer=null;
var $=function(id){return document.getElementById(id)};
var E=function(){return TrainerEngine};
var RES=[["o2","Oxygen","#6fd3ff",160],["water","Water","#4d9bff",160],["food","Food","#8be08b",120],["parts","Parts","#ffd166",100],["regolith","Regolith","#c9a27a",120],["science","Data","#d79bff",250]];
var sndOn=true;try{sndOn=localStorage.getItem("sndOn")!=="0"}catch(e){}
var actx=null;
function tone(f,dur,type,vol,delay){
if(!sndOn){return}
try{
if(!actx){actx=new (window.AudioContext||window.webkitAudioContext)()}
if(actx.state==="suspended"){actx.resume()}
var t=actx.currentTime+(delay||0);
var o=actx.createOscillator(),g=actx.createGain();
o.type=type||"sine";o.frequency.value=f;
g.gain.setValueAtTime(0.0001,t);
g.gain.exponentialRampToValueAtTime(vol||0.07,t+0.015);
g.gain.exponentialRampToValueAtTime(0.0001,t+dur);
o.connect(g);g.connect(actx.destination);o.start(t);o.stop(t+dur+0.03)}catch(e){}}
function sndRight(streak){tone(660,.12,"sine",.07);tone(880,.16,"sine",.07,.09);if(streak>=3){tone(1108,.14,"sine",.06,.2);tone(1318,.18,"sine",.06,.3)}}
function sndWrong(){tone(196,.22,"sawtooth",.05);tone(147,.26,"sawtooth",.045,.08)}

function sndBuild(){tone(392,.1,"triangle",.06);tone(523,.14,"triangle",.06,.08)}
function sndSol(){tone(330,.07,"sine",.045)}
var reduceMotion=false;try{reduceMotion=window.matchMedia("(prefers-reduced-motion: reduce)").matches}catch(e){}
var musOn=true;try{musOn=localStorage.getItem("musOn")!=="0"}catch(e){}
var musNodes=null;
var ROOTS={mission:55,learn:49,reports:41.2,setup:61.7};
var musRoot=ROOTS.setup;
var musVol=.06;try{musVol=Math.max(0,Math.min(.12,parseFloat(localStorage.getItem("musVol")||".06")))}catch(e){}
function musPing(){if(!musNodes){return}var f=520+Math.random()*180;
[[.016,0],[.009,.45],[.005,.1]].forEach(function(p){
var o=actx.createOscillator();o.type="sine";o.frequency.value=p[1]===.1?f*2:f;
var g=actx.createGain();g.gain.value=0;o.connect(g);g.connect(actx.destination);
var t0=actx.currentTime+p[1];
g.gain.setValueAtTime(0,t0);g.gain.linearRampToValueAtTime(p[0],t0+.03);g.gain.exponentialRampToValueAtTime(.0001,t0+1.8);
o.start(t0);o.stop(t0+1.9)})}
var musMode="space";try{musMode=localStorage.getItem("musMode")||"space"}catch(e){}
function noiseSrc(){
var nb=actx.createBuffer(1,actx.sampleRate*2,actx.sampleRate);
var nd=nb.getChannelData(0);for(var i=0;i<nd.length;i++){nd[i]=Math.random()*2-1}
var ns=actx.createBufferSource();ns.buffer=nb;ns.loop=true;ns.start();return ns}
function drone(f,type,vol,dest){
var o=actx.createOscillator();o.type=type||"sine";o.frequency.value=f;
var og=actx.createGain();og.gain.value=vol;o.connect(og);og.connect(dest);o.start();return o}
function lfoTo(freq,depth,param){
var l=actx.createOscillator();l.frequency.value=freq;
var lg=actx.createGain();lg.gain.value=depth;l.connect(lg);lg.connect(param);l.start();return l}
function musStart(){
if(musNodes||!musOn){return}
if(!actx){actx=new (window.AudioContext||window.webkitAudioContext)()}
if(actx.state==="suspended"){actx.resume()}
var g=actx.createGain();g.gain.value=0;g.connect(actx.destination);
var oscs=[],extra=[],ping=null;
if(musMode==="matter"){
oscs.push(drone(musRoot*.5,"sine",.42,g));
oscs.push(drone(musRoot*.75,"sine",.16,g));
oscs.push(drone(musRoot*.25,"triangle",.14,g));
var ns=noiseSrc();
var nf=actx.createBiquadFilter();nf.type="lowpass";nf.frequency.value=90;
var ng=actx.createGain();ng.gain.value=.11;
ns.connect(nf);nf.connect(ng);ng.connect(g);extra.push(ns);
extra.push(lfoTo(.03,.035,ng.gain));
}else if(musMode==="hum"){
oscs.push(drone(musRoot,"sine",.42,g));
oscs.push(drone(musRoot*2,"sine",.1,g));
oscs.push(drone(musRoot*3,"sine",.045,g));
var ns=noiseSrc();
var nf=actx.createBiquadFilter();nf.type="lowpass";nf.frequency.value=120;
var ng=actx.createGain();ng.gain.value=.07;
ns.connect(nf);nf.connect(ng);ng.connect(g);extra.push(ns);
extra.push(lfoTo(.035,.025,ng.gain));
}else{
oscs.push(drone(musRoot*4,"sine",.05,g));
oscs.push(drone(musRoot*6,"sine",.03,g));
oscs.push(drone(musRoot*8,"sine",.02,g));
var ns=noiseSrc();
var bp=actx.createBiquadFilter();bp.type="bandpass";bp.frequency.value=720;bp.Q.value=1.6;
var ng=actx.createGain();ng.gain.value=.035;
ns.connect(bp);bp.connect(ng);ng.connect(g);extra.push(ns);
extra.push(lfoTo(.02,140,bp.frequency));
ping=setTimeout(function tick(){if(!musNodes){return}musPing();musNodes.ping=setTimeout(tick,16000+Math.random()*9000)},12000+Math.random()*6000);
}
g.gain.setTargetAtTime(musVol,actx.currentTime,2.5);
musNodes={g:g,oscs:oscs,extra:extra,ping:ping}}
function musStop(){if(!musNodes){return}var n=musNodes;musNodes=null;if(n.ping){clearTimeout(n.ping)}n.g.gain.setTargetAtTime(0,actx.currentTime,.3);setTimeout(function(){n.oscs.concat(n.extra).forEach(function(o){try{o.stop()}catch(e){}})},1200)}
function setRoom(v){musRoot=ROOTS[v]||ROOTS.mission;if(musNodes){musNodes.oscs.forEach(function(o,i){var f=musMode==="matter"?musRoot*(i===2?.25:(i===1?.75:.5)):(musMode==="hum"?musRoot*(i===2?3:(i===1?2:1)):musRoot*(i===2?8:(i===1?6:4)));o.frequency.setTargetAtTime(f,actx.currentTime,1.2)})}}
function musModeSet(m){musMode=m;try{localStorage.setItem("musMode",m)}catch(e){};if(musNodes){musStop();musStart()}}
function musSetVol(v){musVol=Math.max(0,Math.min(.12,v));try{localStorage.setItem("musVol",String(musVol))}catch(e){}if(musNodes){musNodes.g.gain.setTargetAtTime(musVol,actx.currentTime,.15)}}
var burstP=[];
function burstFrom(el){
if(reduceMotion||!el){return}
var r=el.getBoundingClientRect();
var cx=r.left+r.width/2,cy=r.top+r.height/2;
for(var i=0;i<22;i++){var an=Math.random()*6.283,sp=1.5+Math.random()*3.5;
burstP.push({x:cx,y:cy,vx:Math.cos(an)*sp,vy:Math.sin(an)*sp-1,life:1,col:["#ffd166","#6fd3ff","#8be08b","#ffffff"][i%4]})}}
var bgCv=null,bgX=null,stars=[],shoot=null,shootIn=200;
function bgInit(){
bgCv=document.getElementById("spaceBg");if(!bgCv){return}
bgX=bgCv.getContext("2d");
function size(){bgCv.width=innerWidth;bgCv.height=innerHeight}
size();window.addEventListener("resize",size);
stars=[];for(var i=0;i<160;i++){stars.push({x:Math.random(),y:Math.random(),z:Math.random(),tw:Math.random()*6.28})}
bgTick()}
function planetCol(){if(!s||!s.site){return{m:"#9aa3b2",a:"#7a8494"}}return s.site==="mars"?{m:"#c1683f",a:"#8f4a2e"}:(s.site==="iss"||s.site==="earth")?{m:"#4d9bff",a:"#2f6bb5"}:{m:"#9aa3b2",a:"#7a8494"}}
function drawScene(ctx,W,Hpx,t,limb){
var gr=ctx.createLinearGradient(0,0,0,Hpx);gr.addColorStop(0,"#0a0e1a");gr.addColorStop(1,"#131b33");
ctx.fillStyle=gr;ctx.fillRect(0,0,W,Hpx);
stars.forEach(function(st){
var x=(st.x*W+t*(st.z<.5?6:16)*(st.z<.5?1:1))%W;
var y=st.y*Hpx;
var al=.35+.55*st.z*(0.6+0.4*Math.sin(t*2+st.tw));
ctx.globalAlpha=Math.min(1,al);
ctx.fillStyle=st.z>.8?"#ffffff":"#aebadd";
ctx.fillRect(x,y,st.z>.6?2:1,st.z>.6?2:1)});
ctx.globalAlpha=1;
var pc=planetCol();
var R=limb?Hpx*1.9:Math.min(W,Hpx)*.42;
var px=limb?W*.5:W*.82,py=limb?Hpx+R*.82:Hpx*.3;
ctx.beginPath();ctx.arc(px,py,R,0,6.29);ctx.fillStyle=pc.a;ctx.globalAlpha=limb?.9:.28;ctx.fill();
ctx.beginPath();ctx.arc(px-R*.06,py-R*.06,R,0,6.29);ctx.fillStyle=pc.m;ctx.globalAlpha=limb?1:.4;ctx.fill();
ctx.globalAlpha=1;
if(!limb){
ctx.beginPath();ctx.arc(W*.08,Hpx*.14,26,0,6.29);ctx.fillStyle="rgba(255,240,200,.9)";ctx.fill();
ctx.beginPath();ctx.arc(W*.08,Hpx*.14,44,0,6.29);ctx.fillStyle="rgba(255,240,200,.12)";ctx.fill()}}
function bgTick(){
var t=performance.now()/1000;
var W=bgCv.width,Hpx=bgCv.height;
drawScene(bgX,W,Hpx,t*0.02,false);
if(shootIn--<0&&!shoot){shoot={x:Math.random()*W*.8,y:Math.random()*Hpx*.3,vx:9,vy:4,life:1};shootIn=400+Math.random()*600}
if(shoot){bgX.globalAlpha=shoot.life;bgX.strokeStyle="#fff";bgX.beginPath();bgX.moveTo(shoot.x,shoot.y);bgX.lineTo(shoot.x-30,shoot.y-13);bgX.stroke();bgX.globalAlpha=1;shoot.x+=shoot.vx;shoot.y+=shoot.vy;shoot.life-=.02;if(shoot.life<=0){shoot=null}}
for(var i=burstP.length-1;i>=0;i--){var p=burstP[i];p.x+=p.vx;p.y+=p.vy;p.vy+=.08;p.life-=.025;
if(p.life<=0){burstP.splice(i,1);continue}
bgX.globalAlpha=p.life;bgX.fillStyle=p.col;bgX.fillRect(p.x,p.y,3,3)}
bgX.globalAlpha=1;
var ck=document.getElementById("cockpit");
if(ck&&ck.offsetParent!==null){var cx=ck.getContext("2d");drawScene(cx,ck.width,ck.height,t*.05,true);drawShip(cx,ck.width,ck.height,t);hudFrame(cx,ck.width,ck.height)}
requestAnimationFrame(bgTick)}
function drawShip(ctx,W,H,t){
var bx=W*.62,by=H*.42+Math.sin(t*1.3)*4;
ctx.save();ctx.translate(bx,by);ctx.rotate(Math.sin(t*.9)*.03);
var fl=10+Math.sin(t*23)*4+Math.random()*4;
ctx.beginPath();ctx.moveTo(-34,0);ctx.lineTo(-34-fl,-5);ctx.lineTo(-34-fl*.8,0);ctx.lineTo(-34-fl,5);ctx.closePath();
ctx.fillStyle="rgba(255,180,80,.9)";ctx.fill();
ctx.beginPath();ctx.moveTo(-34,0);ctx.lineTo(-34-fl*.5,-3);ctx.lineTo(-34-fl*.4,0);ctx.lineTo(-34-fl*.5,3);ctx.closePath();
ctx.fillStyle="rgba(255,230,150,.95)";ctx.fill();
ctx.beginPath();ctx.moveTo(30,0);ctx.lineTo(6,-10);ctx.lineTo(-26,-10);ctx.lineTo(-34,-4);ctx.lineTo(-34,4);ctx.lineTo(-26,10);ctx.lineTo(6,10);ctx.closePath();
ctx.fillStyle="#c8d2e4";ctx.fill();ctx.strokeStyle="#5b6b8a";ctx.lineWidth=1.5;ctx.stroke();
ctx.beginPath();ctx.moveTo(12,-10);ctx.lineTo(-2,-22);ctx.lineTo(-12,-10);ctx.closePath();ctx.fillStyle="#9aa8c2";ctx.fill();
ctx.beginPath();ctx.moveTo(12,10);ctx.lineTo(-2,22);ctx.lineTo(-12,10);ctx.closePath();ctx.fillStyle="#9aa8c2";ctx.fill();
ctx.beginPath();ctx.arc(12,0,5,0,6.29);ctx.fillStyle="#6fd3ff";ctx.fill();ctx.strokeStyle="#2c4a6a";ctx.stroke();
ctx.fillStyle="rgba(111,211,255,"+(.4+.3*Math.sin(t*6))+")";
ctx.fillRect(-20,-2,3,3);ctx.fillRect(-14,-2,3,3);ctx.fillRect(-8,-2,3,3);
ctx.restore()}
function hudFrame(ctx,W,H){
ctx.strokeStyle="rgba(111,211,255,.5)";ctx.lineWidth=2;
var m=8,L=18;
[[m,m,1,1],[W-m,m,-1,1],[m,H-m,1,-1],[W-m,H-m,-1,-1]].forEach(function(c){
ctx.beginPath();ctx.moveTo(c[0]+L*c[2],c[1]);ctx.lineTo(c[0],c[1]);ctx.lineTo(c[0],c[1]+L*c[3]);ctx.stroke()});
ctx.fillStyle="rgba(207,224,255,.85)";ctx.font="11px monospace";
ctx.fillText(s?("SOL "+s.sol+" / "+String(s.site||"").toUpperCase()):"STANDBY",m+6,H-m-6);
ctx.fillText(s&&s.stormActive?"STORM WARNING":"SYSTEMS NOMINAL",W-130,H-m-6);
ctx.strokeStyle="rgba(111,211,255,.25)";ctx.beginPath();ctx.moveTo(W/2-14,H/2);ctx.lineTo(W/2+14,H/2);ctx.moveTo(W/2,H/2-14);ctx.lineTo(W/2,H/2+14);ctx.stroke()}
function bgStatic(){
var t=1;
drawScene(bgX,bgCv.width,bgCv.height,t,false);
var ck=document.getElementById("cockpit");
if(ck&&ck.offsetParent!==null){drawScene(ck.getContext("2d"),ck.width,ck.height,t,true);drawShip(ck.getContext("2d"),ck.width,ck.height,1);hudFrame(ck.getContext("2d"),ck.width,ck.height)}}
function sndBadge(){tone(523,.12,"sine",.07);tone(659,.12,"sine",.07,.1);tone(784,.2,"sine",.07,.2)}
function sndRank(){tone(440,.1,"triangle",.07);tone(554,.1,"triangle",.07,.09);tone(659,.1,"triangle",.07,.18);tone(880,.24,"triangle",.07,.27)}
function sndWin(){[523,659,784,1046].forEach(function(f,i){tone(f,.22,"sine",.07,i*.15)})}
function sndLose(){tone(330,.25,"sine",.06);tone(262,.3,"sine",.06,.22);tone(196,.45,"sine",.06,.44)}
function sndExped(){tone(294,.12,"triangle",.06);tone(440,.18,"triangle",.06,.1)}
function showToast(msg){
var t=document.getElementById("toast");if(!t){return}
t.textContent=msg;t.hidden=false;
t.classList.remove("pop");void t.offsetWidth;t.classList.add("pop");
clearTimeout(window.__toastT);window.__toastT=setTimeout(function(){t.hidden=true},3400)}
var RANKS=[[0,"Cadet"],[150,"Pilot"],[350,"Navigator"],[600,"Specialist"],[1000,"Mission Commander"]];
function renderRank(){
var el=document.getElementById("rankLine");if(!el||!s){return}
var sc=TrainerEngine.score(s);
var cur=RANKS[0],next=null;
for(var i=0;i<RANKS.length;i++){if(sc>=RANKS[i][0]){cur=RANKS[i];next=RANKS[i+1]||null}}
var ri=RANKS.indexOf(cur);
if(window.__rankSeen===undefined){window.__rankSeen=ri}
if(ri>window.__rankSeen){window.__rankSeen=ri;sndRank();showToast("Promoted to "+cur[1]+"! Keep going, commander.");burstFrom(el)}
var pct=next?Math.min(100,Math.round(100*(sc-cur[0])/(next[0]-cur[0]))):100;
el.innerHTML="<span>Rank: <b>"+cur[1]+"</b> ("+sc+" XP)"+(next?" &middot; "+(next[0]-sc)+" XP to "+next[1]:" &middot; top rank")+'</span><span class="rankBar"><span class="fill" style="width:'+pct+'%"></span></span>'}
window.__fx={burstFrom:burstFrom,setRoom:setRoom,musSetVol:musSetVol,musVolGet:function(){return musVol},musState:function(){return musOn},musToggle:function(){musOn=!musOn;try{localStorage.setItem("musOn",musOn?"1":"0")}catch(e){}if(musOn){musStart()}else{musStop()}return musOn},armAutoStart:function(){document.addEventListener("pointerdown",function once(){document.removeEventListener("pointerdown",once);if(musOn){musStart()}},{once:true})}}
function applySnd(){$("sndBtn").querySelector(".lb").textContent="Sound: "+(sndOn?"on":"off")}

function download(name,text,type){
var blob=new Blob([text],{type:type||"text/plain"});
var a=document.createElement("a");
a.href=URL.createObjectURL(blob);a.download=name;a.click();URL.revokeObjectURL(a.href)}
function saveHighScore(){
if(!s||!s.over||s.scoreSaved){return}
s.scoreSaved=true;
var raw=localStorage.getItem("jamt_scores");
var list=raw?JSON.parse(raw):[];
list.push({name:s.missionName||"Unnamed",site:s.site,diff:s.difficulty,score:TrainerEngine.score(s),won:s.won,sol:s.sol});
list.sort(function(a,b){return b.score-a.score});
list=list.slice(0,5);
localStorage.setItem("jamt_scores",JSON.stringify(list))}
function esc(t){return String(t).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}
function renderHighScores(){
var raw=localStorage.getItem("jamt_scores");
var list=raw?JSON.parse(raw):[];
if(!list.length){$("highScores").innerHTML="";return}
var h="<h3>Best missions</h3>";
list.forEach(function(x,i){h+='<div class="score">'+(i+1)+". "+esc(x.name)+" — "+x.score+" pts ("+x.site+", "+x.diff+(x.won?", won":"")+")</div>"});
$("highScores").innerHTML=h}
var UNLOCK_SOL={ops:2,research:3,crew:4,exped:6};
var UNLOCK_BLD={rtg:3,scrubber:3,watermine:3,recycler:3,greenhouse:3,habitat:3,shield:3,medbay:3,lab:3,comms:3,drill:3,workshop:3,algae:3,observatory:3,gym:3,pad:3};
var UNLOCK_MSG={2:"New consoles unlocked: Ops fixes, plus your parts and data gauges.",3:"New blueprints at the Build bench, and the Research lab is open.",4:"Crew roster unlocked: rest, retrain and recruit your astronauts.",6:"Expeditions unlocked: send astronauts outside for supplies."};
function featLocked(f){var need=UNLOCK_SOL[f]||0;return s&&s.sol<need?need:0}
window.__fx.featLocked=featLocked;
window.__fx.toast=showToast;
var CQUIZ=[
{q:"The storm cut the base's power. Which upgrade protects buildings from the next one?",a:["Storm Shielding","A bigger habitat","Faster rovers"],c:0,why:"Shielding Works bury habitats under regolith, cutting storm and radiation damage."},
{q:"Solar arrays made less power during the storm. What covered the shortfall?",a:["Battery banks","The greenhouse","The comms dish"],c:0,why:"Batteries store surplus power for dark or dusty sols."},
{q:"Sheltering the crew keeps them safe. What does it cost?",a:["Oxygen and work time","Nothing at all","Rocket fuel"],c:0,why:"Shelter mode uses extra oxygen and pauses outside work."},
{q:"Why can't Mission Control simply tell you what to do in an emergency?",a:["Radio signals take minutes to cross space","They are asleep","The radio only works at night"],c:0,why:"Radio waves move at light speed, and that still takes minutes between planets - crews must decide alone."}
];
function hudFlash(id){var el=$(id);if(!el||!el.parentElement){return}var chip=el.parentElement;chip.classList.remove("hudFlash");void chip.offsetWidth;chip.classList.add("hudFlash")}
function render(){
if(!s){return}
if(!s.flags){s.flags={}}
$("solLine").textContent=(s.missionName?s.missionName+" — ":"")+TrainerEngine.SITES[s.site].name+" — Sol "+s.sol;
$("objective").textContent=s.difficulty==="sandbox"?"Sandbox: build freely, no fail states.":("Goal: "+s.objectiveScience+" science by sol "+s.objectiveSols+". Quiz every 5 sols. Score now: "+TrainerEngine.score(s));
var bars="";
RES.forEach(function(r){
if(s.sol<2&&(r[0]==="parts"||r[0]==="regolith"||r[0]==="science")){return}
var v=Math.floor(s.res[r[0]]);
var pct=Math.max(0,Math.min(100,(v/r[3])*100));
var cls=r[0]==="o2"||r[0]==="water"||r[0]==="food"?(v<20?" low":""):"";
bars+='<div class="bar"><div class="lab"><span>'+r[1]+'</span><span class="'+cls.trim()+'">'+v+"</span></div>"+'<div class="track"><div class="fill" style="width:'+pct+"%;background:"+r[2]+'"></div></div></div>'});
$("bars").innerHTML=bars;
renderRank();
document.querySelectorAll(".wbCard").forEach(function(cd){
var need=featLocked(cd.getAttribute("data-feat"));
cd.classList.toggle("locked",!!need);
var tag=cd.querySelector(".lockTag");
if(need){if(!tag){tag=document.createElement("span");tag.className="lockTag";cd.appendChild(tag)}tag.textContent="sol "+need}
else if(tag){tag.remove()}});
var pb=TrainerEngine.powerBreakdown(s);
var pbTxt=pb.consumers.map(function(c){return c.name+" x"+c.count+" ("+c.watts+")"}).join(", ");
$("powerLine").textContent="Power: "+s.lastPowerGen+" generated / "+s.lastPowerUse+" used / "+s.powerStore+" stored. Shielding "+s.shieldLevel+". "+pbTxt+(s.stormActive?" DUST STORM ACTIVE.":"");
var fc=TrainerEngine.forecast(s);
$("forecastLine").textContent=fc?("Tomorrow's forecast: "+fc.text):"Tomorrow's forecast: unclear skies.";
var scd=$("storyCard");
var sf=s.flags;
scd.hidden=true;
if(!s.over&&sf.storyArmed){
$("storyBtns").innerHTML="";
$("storyNote").hidden=true;
if(!sf.ch1Done){
scd.hidden=false;
$("storyHd").textContent="Chapter 1: A place to stay";
$("storyTx").textContent="Ana, your engineer: \"Build a place people can live in. Then build a place they can discover things.\" The small green light on the habitat means it is keeping your crew alive. Mei's seedling sits by the habitat window. Your first call: another solar array, or the ice drill that keeps water flowing?";
storyBtn("storyCh1a","Solar Array (12 parts)",function(){storyBuild("solar")});
storyBtn("storyCh1b","Ice Extractor (14 parts)",function(){storyBuild("watermine")});
}else if(!sf.ch2Done&&s.sol>=sf.storySol-2&&s.sol<sf.storySol){
scd.hidden=false;
if(!sf.raviPaid){sf.raviPaid=true;s.res.science+=8}
var evWord2=s.site==="mars"?"dust storm":"solar particle storm";
var left2=sf.storySol-s.sol;
$("storyHd").textContent="Chapter 2: Something from the Sun";
$("storyTx").textContent="Ravi brings back a sample worth real data (+8). Then Ana spots the warning: \"Space-weather alert. A "+evWord2+" reaches us in "+left2+" sol"+(left2>1?"s":"")+". We need to prepare the shelter.\" Materials can protect the crew or keep building research gear. You cannot finish both before it hits.";
$("storyNote").textContent="Advice from Earth arrives at scheduled message windows in this training game; sometimes you must act before the next reply. A game rule, not a claim that Moon messages take a day to arrive.";
$("storyNote").hidden=false;
storyBtn("storyShelter","Prepare the shelter (protect the crew)",function(){sf.storyChoice="shelter";sf.ch2Done=true;sndBuild();showToast("Shelter prepared for the storm sol. "+(s.site==="mars"?"Earth won't hear your call for up to 22 minutes":"The next Earth window opens after the storm")+" - you command alone.");render()});
storyBtn("storyWork","Keep building research (risk the crew)",function(){sf.storyChoice="work";sf.ch2Done=true;showToast("Research continues. "+(s.site==="mars"?"Earth won't hear your call for up to 22 minutes":"The next Earth window opens after the storm")+" - you command alone.");render()});
}else if(!sf.ch3Done&&s.sol===sf.storySol&&!sf.storyChoice){
scd.hidden=false;
$("storyHd").textContent="Chapter 3: The quiet camp";
$("storyTx").textContent="The storm is here. Outside work stops and the camp goes dark but for one green light. Kofi, your medic: \"The samples can wait. Let's make sure we're here to study them.\" No shelter was prepared. Emergency reserves can still keep everyone safe - for a price.";
storyBtn("storyEmerg","Burn emergency reserves (-15 parts, -10 data)",function(){sf.storyChoice="emerg";sf.ch3Done=true;s.res.parts=Math.max(0,s.res.parts-15);s.res.science=Math.max(0,s.res.science-10);showToast("Reserves burned. The crew rides it out safely.");render()});
storyBtn("storyRide","Ride it out (-12 health each)",function(){sf.storyChoice="ride";sf.ch3Done=true;applyStoryHit(12,0);showToast("The crew rides out the storm, shaken.");sndWrong();render()});
}else if(!sf.ch4Done&&sf.storyResolved&&s.sol>=sf.storySol+2){
sf.ch4Done=true;
sf.seedling=2;
s.crew.forEach(function(c){if(c.health>0){c.morale=Math.min(100,c.morale+5)}});
showToast("All clear. Mei calls everyone to the greenhouse: the seedling has opened a new leaf. \"Looks like we're not the only ones getting used to this place.\" (+5 morale)");
}
}
var cc=$("ctxCard");
if(sf.ctxPending!==undefined&&!s.over){
var cq=CQUIZ[sf.ctxPending];
var ch='<div class="ctxHd">Debrief question - about what just happened</div><div class="ctxQ">'+cq.q+"</div>";
cq.a.forEach(function(a,i){ch+='<button data-cq="'+i+'">'+a+"</button>"});
if(sf.ctxWhy){ch+='<div class="ctxWhy">'+sf.ctxWhy+"</div>"}
cc.innerHTML=ch;
cc.hidden=false;
Array.prototype.forEach.call(cc.querySelectorAll("[data-cq]"),function(btn){
btn.onclick=function(){
var pick=parseInt(btn.getAttribute("data-cq"),10);
if(pick===cq.c){s.res.science+=5;s.flags.ctxShown=(s.flags.ctxShown||0)+1;s.flags.ctxPending=undefined;s.flags.ctxWhy=undefined;sndRight(1);burstFrom(btn);showToast("Debrief correct: +5 data. "+cq.why);render()}
else{s.flags.ctxWhy="Not quite. "+cq.why+" Try again.";sndWrong();render()}
}});
}else{cc.hidden=true;if(sf){sf.ctxWhy=undefined}}
var pl=$("partsLine");
pl.innerHTML="Parts in store: <b>"+s.res.parts+"</b> &middot; spent this mission: "+(s.partsSpent||0);
var hud=$("hud");if(hud){hud.hidden=false;var hPrev=window.__hudPrev;$("hudSci").textContent=Math.floor(s.res.science);$("hudParts").textContent=s.res.parts;if(hPrev){if(s.res.parts>hPrev.p){hudFlash("hudParts")}if(s.res.science>hPrev.d){hudFlash("hudSci")}}window.__hudPrev={p:s.res.parts,d:s.res.science}}
var ph=$("partsHelp");
if(ph){
var drillN=s.buildings.filter(function(b){return b.type==="drill"&&b.done&&!b.damaged}).length;
var wsN=s.buildings.filter(function(b){return b.type==="workshop"&&b.done&&!b.damaged}).length;
var per=s.techs.sintering?4:3;
var wsTxt=wsN?("online: every 10 regolith becomes "+per+" parts each sol"):(drillN?"drill online, workshop missing - build a Regolith Workshop":"needs a Regolith Drill and a Regolith Workshop");
var rows=[["Drill + Workshop",wsTxt],["Debris Salvage expedition",s.sol>=6?"+12 parts, 2 crew, 2 sols":"unlocks at sol 6"],["Resupply pods","land every few sols; the parts manifest carries the most"],["Mission Control quizzes","+6 parts per correct answer"],["Data milestones","backers send +10 parts at each milestone"]];
ph.innerHTML='<details'+(s.res.parts<12?" open":"")+'><summary>Ways to get more parts</summary>'+rows.map(function(r){return'<div class="psrc"><span>'+r[0]+'</span><small>'+r[1]+'</small></div>'}).join("")+"</details>"}
if(window.__prevParts!==undefined&&window.__prevParts!==s.res.parts){pl.classList.remove("flash");void pl.offsetWidth;pl.classList.add("flash")}
window.__prevParts=s.res.parts;
var bl="";
Object.keys(TrainerEngine.BUILDINGS).forEach(function(t){
var d=TrainerEngine.BUILDINGS[t];
var ok=TrainerEngine.canBuild(s,t);
var bsol=UNLOCK_BLD[t]||0;
var blocked=s.sol<bsol;
var need=blocked?'<span class="need">unlocks at sol '+bsol+"</span>":(!ok&&s.res.parts<d.cost?'<span class="need">need '+(d.cost-s.res.parts)+" more parts</span>":"");
bl+='<div class="bld"><div><strong>'+d.name+'</strong> ('+d.cost+' parts)'+need+'<small>'+d.desc+"</small></div>"+'<button data-build="'+t+'"'+(ok&&!blocked?"":" disabled")+(ok&&!blocked?"":' title="'+(blocked?"Unlocks at sol "+bsol:"Not enough parts")+'"')+">Build</button></div>"});
$("buildList").innerHTML=bl;
Array.prototype.forEach.call(document.querySelectorAll("[data-build]"),function(btn){
btn.onclick=function(){if(!s)return;if(TrainerEngine.build(s,btn.getAttribute("data-build"))){sndBuild()}render()}});
var sh=$("sciHelp");
if(sh){
var labN=s.buildings.filter(function(b){return (b.type==="lab"||b.type==="observatory")&&b.done&&!b.damaged}).length;
var srows=[["Labs and observatories",labN?("online: "+labN+" making data every sol"):("build a Science Lab from the Build yard")],["Survey expeditions","Crater Survey, Ice Core and Lava Tube trips bring data home"],["Mission Control quizzes","+5 data per correct answer, +10 for every 3 in a row"],["Comms Dish","satellite relays beam +15 data when a dish is online"],["Debrief questions","+5 data for each good answer after events"]];
sh.innerHTML='<details'+(s.res.science<20?" open":"")+'><summary>Ways to earn data</summary>'+srows.map(function(r){return'<div class="psrc"><span>'+r[0]+'</span><small>'+r[1]+'</small></div>'}).join("")+"</details>"}
var tl="";
if(s.sol<3){$("techList").innerHTML='<div class="bld"><div><strong>Research unlocks at sol 3.</strong><small>Mission Control opens the lab once the outpost is stable.</small></div></div>'}else{
Object.keys(TrainerEngine.TECHS).forEach(function(k){
var t=TrainerEngine.TECHS[k];
var has=!!s.techs[k];
var cost=TrainerEngine.researchCost(s,k);
var ok=!has&&s.res.science>=cost;
tl+='<div class="bld"><div><strong>'+t.name+'</strong> ('+cost+' data)<small>'+t.desc+"</small></div>"+(has?'<span class="chip on">researched</span>':'<button data-tech="'+k+'"'+(ok?"":" disabled")+">Research</button>")+"</div>"});
$("techList").innerHTML=tl;
Array.prototype.forEach.call(document.querySelectorAll("[data-tech]"),function(btn){
btn.onclick=function(){if(!s)return;if(TrainerEngine.research(s,btn.getAttribute("data-tech"))){sndBuild()}render()}})}
var cl="";
if(s.sol<4){cl='<div class="bld"><div><strong>Crew roster unlocks at sol 4.</strong><small>Your astronauts are settling in; Mission Control handles roster tasks until then.</small></div></div>'}else{
s.crew.forEach(function(c,i){
var lvl=TrainerEngine.cLevel(c);
var st=c.health<=0?"DECEASED":(c.away>0?"ON EXPEDITION ("+c.away+" sol)":("H "+Math.round(c.health)+" / M "+Math.round(c.morale)+" / F "+Math.round(c.fatigue||0)+" / Lv"+lvl));
cl+='<div class="crew"><span>'+c.name+" <small>("+c.role+")</small></span>"+'<button data-rest="'+i+'"'+(c.health<=0||c.away>0?" disabled":"")+">Rest</button>"+'<span class="h'+(c.health<40?" low":"")+'">'+st+"</span>"+'<select data-retrain="'+i+'"><option value="">retrain…</option>'+TrainerEngine.ROLES.map(function(r){return '<option value="'+r+'"'+(r===c.role?" disabled":"")+">"+r+"</option>"}).join("")+"</select></div>"});
$("crewList").innerHTML=cl;
Array.prototype.forEach.call(document.querySelectorAll("[data-retrain]"),function(sel){
sel.onchange=function(){if(sel.value){TrainerEngine.retrain(s,parseInt(sel.getAttribute("data-retrain"),10),sel.value);render()}}});
Array.prototype.forEach.call(document.querySelectorAll("[data-rest]"),function(btn){
btn.onclick=function(){if(!s)return;TrainerEngine.rest(s,parseInt(btn.getAttribute("data-rest"),10));render()}})}
$("recruitBtn").disabled=s.sol<4||!(s.res.parts>=25&&s.crew.length<TrainerEngine.crewCapacity(s));
$("recruitBtn").title=s.res.parts<25?("Need "+(25-s.res.parts)+" more parts"):(s.crew.length>=TrainerEngine.crewCapacity(s)?"Crew quarters full - build a Habitat Module":"");
var opsLocked=s.sol<2;
$("opsParts").textContent=opsLocked?"Ops console unlocks at sol 2 - Mission Control handles fixes while you settle in.":"Parts in store: "+s.res.parts+" (clean 2 - suits 3 - repairs "+(s.crew.some(function(c){return c.role==="Engineer"&&c.health>0})?3:5)+" each)";
$("cleanBtn").disabled=opsLocked||s.res.parts<2;
$("suitBtn").disabled=opsLocked||s.res.parts<3;
$("repAllBtn").disabled=opsLocked||s.res.parts<3;
$("shelterBtn").disabled=opsLocked;
$("rationSel").value=String(s.rations);
$("manifestSel").value=s.manifest;
$("rationSel").disabled=s.sol<4;
$("manifestSel").disabled=s.sol<4;
var el="";
if(s.sol<6){el='<div class="bld"><div><strong>Expeditions unlock at sol 6.</strong><small>Suit checks and rover trials finish first.</small></div></div>'}else{
Object.keys(TrainerEngine.EXPEDITIONS).forEach(function(k){
var x=TrainerEngine.EXPEDITIONS[k];
var yieldTxt=[x.science?"+"+x.science+" science":null,x.water?"+"+x.water+" water":null,x.parts?"+"+x.parts+" parts":null,x.relay?"relay buff":null].filter(Boolean).join(", ");
el+='<div class="bld"><div><strong>'+x.name+'</strong> ('+x.cost+" parts, "+x.sols+' sols)<small>'+yieldTxt+", tiring, 10% breakdown risk</small></div>"+'<button data-exped="'+k+'">Send 2 crew</button></div>'});
$("expedList").innerHTML=el;
Array.prototype.forEach.call(document.querySelectorAll("[data-exped]"),function(btn){
btn.onclick=function(){if(!s)return;var r=TrainerEngine.expedition(s,btn.getAttribute("data-exped"));if(!r.ok){alert(r.msg)}else{sndExped()}render()}})}
var base="";
s.buildings.forEach(function(b,i){
var d=TrainerEngine.BUILDINGS[b.type];
var st=b.done?(b.damaged?"DAMAGED":"online"):("building, "+b.solsLeft+" sol(s)");
var repCost=s.crew.some(function(c){return c.role==="Engineer"&&c.health>0})?3:5;
var extra="";
if(b.type==="greenhouse"&&b.done&&!b.damaged){
extra=' <select data-crop="'+i+'">'+Object.keys(TrainerEngine.CROPS).map(function(k){return '<option value="'+k+'"'+(b.crop===k?" selected":"")+">"+TrainerEngine.CROPS[k].name+"</option>"}).join("")+"</select>"}
base+='<div class="bld"><span>'+d.name+" — "+st+extra+"</span>"+(b.damaged?'<span><button data-repair="'+i+'">Repair ('+repCost+' parts)</button> <button data-eva="'+i+'">EVA repair (2 parts, risky)</button></span>':"")+"</div>"});
$("baseList").innerHTML=base;
Array.prototype.forEach.call(document.querySelectorAll("[data-repair]"),function(btn){
btn.onclick=function(){if(!s)return;TrainerEngine.repair(s,parseInt(btn.getAttribute("data-repair"),10));render()}});
Array.prototype.forEach.call(document.querySelectorAll("[data-eva]"),function(btn){
btn.onclick=function(){
if(!s)return;
var idx=parseInt(btn.getAttribute("data-eva"),10);
var best=0,bestH=-1;
s.crew.forEach(function(c,i2){if(c.health>bestH&&(c.away||0)<=0&&(c.fatigue||0)<=70){bestH=c.health;best=i2}});
var eng=s.crew.findIndex(function(c){return c.role==="Engineer"&&c.health>0&&(c.away||0)<=0&&(c.fatigue||0)<=70});
TrainerEngine.evaRepair(s,idx,eng>=0?eng:best);render()}});
Array.prototype.forEach.call(document.querySelectorAll("[data-crop]"),function(sel){
sel.onchange=function(){TrainerEngine.setCrop(s,parseInt(sel.getAttribute("data-crop"),10),sel.value);render()}});
drawOutpost();
var tips=TrainerEngine.advise(s);
var th="";
tips.forEach(function(t){th+='<div class="alert info">'+t+"</div>"});
$("advice").innerHTML=th;
var st2=TrainerEngine.statsSummary(s);
$("statsPanel").innerHTML='<div class="score">Data collected: '+st2.scienceEarned+" | Power generated: "+st2.powerGenerated+" | Water mined: "+st2.waterMined+"</div>"+'<div class="score">Expeditions: '+st2.expeditions+" | Storms survived: "+st2.stormsSurvived+" | Quiz correct: "+st2.quizCorrect+" | Achievements: "+st2.achievements+"/"+TrainerEngine.ACHIEVEMENTS.length+"</div>";
renderHighScores();
renderAnalytics();
drawHistory();
var qp=$("quizPanel");
if(s.pendingQuiz!==null&&!s.over){
qp.hidden=false;
var q=TrainerEngine.QUIZ[s.pendingQuiz];
$("quizQ").textContent=q.q;
$("quizFact").textContent="";
var opts="";
q.a.forEach(function(a,i){opts+='<button data-quiz="'+i+'">'+a+"</button>"});
$("quizOpts").innerHTML=opts;
Array.prototype.forEach.call(document.querySelectorAll("[data-quiz]"),function(btn){
btn.onclick=function(){
if(!s)return;
var r=TrainerEngine.answerQuiz(s,parseInt(btn.getAttribute("data-quiz"),10));
btn.classList.add(r.correct?"ok":"no");
if(!r.correct){var cb=document.querySelector('[data-quiz="'+q.c+'"]');if(cb){cb.classList.add("ok")}}
if(r.correct){sndRight(s.quizStreak);burstFrom(btn)}else{sndWrong()}
Array.prototype.forEach.call(document.querySelectorAll("[data-quiz]"),function(x){x.disabled=true});
$("quizFact").textContent=(r.correct?"Correct! +6 parts, +5 data. ":"Not quite. ")+r.fact+(s.quizStreak>1?" Streak: "+s.quizStreak+".":"");
if(r.correct){$("hudSci").textContent=Math.floor(s.res.science);$("hudParts").textContent=s.res.parts;hudFlash("hudParts");hudFlash("hudSci");window.__hudPrev={p:s.res.parts,d:s.res.science}}
if(window.__tourEvent){window.__tourEvent(r.correct?"quiz":"quizwrong")}
setTimeout(function(){qp.hidden=true;if(window.__closeFeat){window.__closeFeat()}if(s.flags&&s.flags.ctxPending!==undefined&&window.__openFeat){window.__openFeat("status")}render()},4200)}});
}else{qp.hidden=true}
var quizNow=s.pendingQuiz!==null&&!s.over;
if(quizNow&&!window.__quizWas&&window.__openFeat){window.__openFeat("quiz")}
window.__quizWas=quizNow;
var lg="";
s.log.forEach(function(e){lg+='<div><span class="sol">Sol '+e.sol+":</span> "+e.msg+"</div>"});
$("log").innerHTML=lg;
var ach="";
var prog=TrainerEngine.achievementProgress(s);
TrainerEngine.ACHIEVEMENTS.forEach(function(a){
var on=s.earned.indexOf(a.id)>=0;
var pr=prog.filter(function(x){return x.id===a.id})[0];
ach+='<span class="chip'+(on?" on":"")+'">'+a.name+(pr&&!on?" ("+pr.have+"/"+pr.need+")":"")+"</span>"});
$("ach").innerHTML=ach;
if(window.__earnedSeen===undefined){window.__earnedSeen=s.earned.slice()}
var newBadges=s.earned.filter(function(id){return window.__earnedSeen.indexOf(id)<0});
if(newBadges.length){window.__earnedSeen=s.earned.slice();
var bn=newBadges.map(function(id){var d=TrainerEngine.ACHIEVEMENTS.filter(function(x){return x.id===id})[0];return d?d.name:id});
sndBadge();showToast("Badge earned: "+bn.join(", "));burstFrom(document.getElementById("solLine"))}
if(s.over&&!window.__overSeen){window.__overSeen=true;
if(s.won){sndWin();showToast("MISSION SUCCESS! Final score "+TrainerEngine.score(s));var r0=document.getElementById("cockpit");if(r0){burstFrom(r0);setTimeout(function(){burstFrom(r0)},300)}}
else if(s.crew.some(function(c){return c.health>0})){showToast("Mission complete - a safe return. See the debrief below.")}
else{sndLose();showToast("Mission ended early - the crew evacuated safely. See the debrief below.")}}
if(!s.over){window.__overSeen=false}
var eb=$("endBanner");
if(s.over){
saveHighScore();
eb.hidden=false;
var pm=TrainerEngine.postMortem(s);
var aliveN=s.crew.filter(function(c){return c.health>0}).length;
var onlineN=s.buildings.filter(function(b){return b.done&&!b.damaged}).length;
var kind=s.won?"win":(aliveN>0?"safe":"lose");
eb.className=kind;
var headline=kind==="win"?"A THRIVING CAMP — you met the data goal and brought everyone home. The next crew inherits a working outpost. ":(kind==="safe"?"A SAFE RETURN — you missed the data target but protected your crew. Your notes help the next mission do better. This is a valid ending, not a failure. ":"A DIFFICULT RETURN — a life-support emergency ended the mission early. The crew evacuated safely. ");
var debrief="<div class='learnBox'><b>Mission debrief - what you learned</b><ul>"+
"<li>Storms survived: "+(s.stormsSurvived||0)+" - shielding and shelter mode are what cut storm damage.</li>"+
"<li>Buildings online at the end: "+onlineN+" of "+s.buildings.length+" - damaged buildings stop working until repaired.</li>"+
"<li>Crew home safe: "+aliveN+" of "+s.crew.length+" - rest, rations and a Med Bay keep astronauts alive.</li>"+
"<li>Research completed: "+Object.keys(s.techs).length+" - upgrades multiply everything else.</li></ul>"+
(kind==="win"?"<div class='learnTip'>Journey complete: you built, survived and recovered. Next step - a harder class or the other site.</div>":"<div class='learnTip'>"+(kind==="safe"?"Mission Control's notes: "+pm.join(" "):"The warning you missed: "+(pm[0]||"life support ran short")+" Start a new mission to retry that decision.")+"</div>")+
"<div class='learnTip'>Mission Control: \"Your mission wasn't to do everything. It was to decide what mattered, and take care of the people depending on you.\"</div></div>";
eb.innerHTML=headline+"Final score: "+TrainerEngine.score(s)+" (grade "+TrainerEngine.letterGrade(s)+"). "+debrief;
$("solBtn").disabled=true;
}else{eb.hidden=true;$("solBtn").disabled=false}}
var outpostT=0;
function drawOutpost(){
var cv=$("outpostCv");if(!cv||!s){return}
var ctx=cv.getContext("2d");var W=cv.width,H=cv.height;var t=outpostT;
var mars=s.site==="mars";
var gy=H-34;
if(s.stormActive){
var sg=ctx.createLinearGradient(0,0,0,H);sg.addColorStop(0,"#3a2410");sg.addColorStop(1,"#57330f");ctx.fillStyle=sg;ctx.fillRect(0,0,W,H);
for(var j=0;j<80;j++){var dx=(j*61+t*7)% (W+40)-20,dy=(j*37+t*2.4)%(H*0.85);ctx.fillStyle="rgba(224,176,105,"+(0.25+0.3*Math.abs(Math.sin(j+t*0.3))).toFixed(2)+")";ctx.fillRect(dx,dy,5,2)}
}else{
var sky=ctx.createLinearGradient(0,0,0,gy);if(mars){sky.addColorStop(0,"#1c0f1e");sky.addColorStop(.7,"#4a2430");sky.addColorStop(1,"#7a4632")}else{sky.addColorStop(0,"#050810");sky.addColorStop(.7,"#0d1526");sky.addColorStop(1,"#1d2b45")}
ctx.fillStyle=sky;ctx.fillRect(0,0,W,gy+2);
for(var i=0;i<48;i++){var sx=(i*97)%W,sy=(i*53)%(H*0.5);var tw=0.3+0.7*Math.abs(Math.sin(t*0.15+i));ctx.fillStyle="rgba(255,255,255,"+tw.toFixed(2)+")";ctx.fillRect(sx,sy,2,2)}
if(mars){
ctx.fillStyle="rgba(255,214,160,0.9)";ctx.beginPath();ctx.arc(W-90,42,13,0,Math.PI*2);ctx.fill();
ctx.fillStyle="rgba(255,190,120,0.16)";ctx.beginPath();ctx.arc(W-90,42,26,0,Math.PI*2);ctx.fill();
}else{
ctx.fillStyle="rgba(90,140,230,0.25)";ctx.beginPath();ctx.arc(W-84,44,20,0,Math.PI*2);ctx.fill();
var eg=ctx.createRadialGradient(W-88,40,3,W-84,44,17);eg.addColorStop(0,"#9cc4ff");eg.addColorStop(.6,"#3f74d8");eg.addColorStop(1,"#23408a");
ctx.fillStyle=eg;ctx.beginPath();ctx.arc(W-84,44,16,0,Math.PI*2);ctx.fill();
ctx.fillStyle="rgba(255,255,255,0.5)";ctx.beginPath();ctx.arc(W-90,38,4,0,Math.PI*2);ctx.fill();
}
ctx.fillStyle=mars?"#5a2e1c":"#3c414c";
ctx.beginPath();ctx.moveTo(0,gy);
for(var hx=0;hx<=W;hx+=64){ctx.lineTo(hx,gy-10-((hx*37)%23))}
ctx.lineTo(W,gy);ctx.closePath();ctx.fill();
}
ctx.fillStyle=mars?"#8a4a2a":"#6a6f78";ctx.fillRect(0,gy,W,H-gy);
ctx.fillStyle=mars?"#7a3f24":"#5c616b";
for(var ci=0;ci<7;ci++){var crx=(ci*167+53)%W,cry=gy+8+(ci*29)%(H-gy-12);ctx.beginPath();ctx.ellipse(crx,cry,10+(ci*7)%9,2.6,0,0,Math.PI*2);ctx.fill()}
var alive=s.crew.filter(function(c){return c.health>0});
var powerOk=s.lastPowerGen>=s.lastPowerUse;
var bs=s.buildings;
var n=Math.max(bs.length,1);
var slot=Math.min(74,(W-30)/n);
bs.forEach(function(b,i){
var cx=22+i*slot+slot/2;
var d=TrainerEngine.BUILDINGS[b.type];
var online=b.done&&!b.damaged;
var lit=online&&powerOk&&!s.stormActive;
ctx.fillStyle="rgba(0,0,0,0.35)";ctx.beginPath();ctx.ellipse(cx,gy+3,20,3.4,0,0,Math.PI*2);ctx.fill();
if(b.type==="solar"){
ctx.strokeStyle="#8a93a5";ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(cx,gy);ctx.lineTo(cx,gy-15);ctx.stroke();
var tilt=Math.sin(t*0.05+i)*0.1-0.18;
ctx.save();ctx.translate(cx,gy-19);ctx.rotate(tilt);
ctx.fillStyle=lit?"#2a5fd0":"#33415c";ctx.fillRect(-18,-7,36,13);
ctx.strokeStyle=lit?"#6fa2ff":"#46557a";ctx.lineWidth=1;ctx.strokeRect(-18,-7,36,13);
ctx.beginPath();for(var gl2=-6;gl2<=6;gl2+=12){ctx.moveTo(gl2,-7);ctx.lineTo(gl2,6)}ctx.moveTo(-18,-0.5);ctx.lineTo(18,-0.5);ctx.stroke();
if(lit){var sw2=((t*0.35+i*0.4)%2)-1;ctx.fillStyle="rgba(255,255,255,"+(0.35*Math.max(0,1-Math.abs(sw2)*2)).toFixed(2)+")";ctx.fillRect(-18+((sw2+1)/2)*32,-7,4,13)}
ctx.restore();
}else if(b.type==="battery"){
ctx.fillStyle=lit?"#3f9e57":"#2c5639";ctx.fillRect(cx-11,gy-22,22,22);
ctx.strokeStyle="rgba(255,255,255,0.25)";ctx.lineWidth=1;ctx.strokeRect(cx-11,gy-22,22,22);
ctx.fillStyle="#dff3e2";ctx.font="bold 11px sans-serif";ctx.textAlign="center";ctx.fillText("BAT",cx,gy-8);
if(lit){var bl2=Math.floor(t*1.2+i)%4;ctx.fillStyle="#c8ffd9";ctx.fillRect(cx-8,gy-26+(bl2===0?0:6),2,2)}
}else{
var r=18;
if(b.done){
var dg=ctx.createLinearGradient(cx,gy-r,cx,gy);
if(lit){dg.addColorStop(0,"#f2f6ff");dg.addColorStop(1,"#aab4c6")}else if(online){dg.addColorStop(0,"#98a2b4");dg.addColorStop(1,"#5f6878")}else{dg.addColorStop(0,"#9a5f46");dg.addColorStop(1,"#5f3a2a")}
ctx.fillStyle=dg}else{ctx.fillStyle="#5a6272"}
ctx.beginPath();ctx.arc(cx,gy,r,Math.PI,0);ctx.closePath();ctx.fill();
ctx.strokeStyle="#39414f";ctx.lineWidth=1.5;ctx.stroke();
ctx.strokeStyle="rgba(255,255,255,0.35)";ctx.lineWidth=1;ctx.beginPath();ctx.arc(cx-2,gy,r-4,Math.PI*1.12,Math.PI*1.65);ctx.stroke();
if(b.done){
ctx.fillStyle=lit?"#20293c":"#11151f";ctx.fillRect(cx-4,gy-9,8,9);
ctx.strokeStyle="rgba(255,255,255,0.2)";ctx.strokeRect(cx-4,gy-9,8,9);
if(lit){ctx.fillStyle="#ffe9a3";ctx.fillRect(cx-13,gy-12,5,4);ctx.fillRect(cx+8,gy-12,5,4);if(b.type==="greenhouse"){ctx.fillStyle="rgba(94,196,111,0.85)";ctx.fillRect(cx-13,gy-12,5,4);ctx.fillRect(cx+8,gy-12,5,4)}}
}else{ctx.fillStyle="#f4c542";ctx.font="10px sans-serif";ctx.textAlign="center";ctx.fillText("BUILD",cx,gy-24)}
}
if(b.damaged){
var fl=0.5+0.5*Math.sin(t*0.6+i*2);
ctx.fillStyle="rgba(200,60,40,"+(0.35+0.35*fl).toFixed(2)+")";
ctx.beginPath();ctx.arc(cx,gy-10,14,0,Math.PI*2);ctx.fill();
ctx.fillStyle="rgba(120,120,120,0.7)";
var puff=(t*2+i*13)%26;
ctx.beginPath();ctx.arc(cx-4+Math.sin(t*0.2+i)*3,gy-24-puff,4+puff*0.12,0,Math.PI*2);ctx.fill();
}
if(s.shieldLevel>0&&(b.type==="habitat"||b.type==="medbay")){
ctx.strokeStyle="rgba(120,190,255,"+(0.5+0.3*Math.sin(t*0.4)).toFixed(2)+")";ctx.lineWidth=2;
ctx.beginPath();ctx.arc(cx,gy,23,Math.PI,0);ctx.stroke();
}
ctx.fillStyle="#dfe4ec";ctx.font="9px sans-serif";ctx.textAlign="center";
ctx.fillText(d.name.split(" ")[0].toUpperCase().slice(0,6),cx,gy+12);
});
var habX=0;
for(var hi=0;hi<bs.length;hi++){if(bs[hi].type==="habitat"){habX=22+hi*slot+slot/2;break}}
if(habX){
ctx.strokeStyle="#8a93a5";ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(habX,gy-18);ctx.lineTo(habX,gy-34);ctx.stroke();
var bl3=0.5+0.5*Math.sin(t*0.5);
ctx.fillStyle="rgba(255,80,70,"+(0.4+0.6*bl3).toFixed(2)+")";ctx.beginPath();ctx.arc(habX,gy-36,2.6,0,Math.PI*2);ctx.fill();
ctx.strokeStyle="rgba(140,200,255,"+(0.5*bl3).toFixed(2)+")";ctx.lineWidth=1;
ctx.beginPath();ctx.arc(habX,gy-36,6+bl3*3,-0.9,-0.4);ctx.stroke();
ctx.beginPath();ctx.arc(habX,gy-36,6+bl3*3,Math.PI-0.9,Math.PI-0.4);ctx.stroke();
var pot=habX+24;
ctx.fillStyle="#7a5230";ctx.fillRect(pot-4,gy-6,8,6);
var seedH=4+Math.min(12,s.sol*1.2);
ctx.strokeStyle="#3f9e57";ctx.lineWidth=2;
ctx.beginPath();ctx.moveTo(pot,gy-6);ctx.lineTo(pot,gy-6-seedH);ctx.stroke();
if(s.flags&&s.flags.seedling>=2){ctx.fillStyle="#5ec46f";ctx.beginPath();ctx.ellipse(pot+4,gy-6-seedH,5,2.6,-0.5,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.ellipse(pot-3.4,gy-8-seedH,4,2.2,0.6,0,Math.PI*2);ctx.fill()}
}
ctx.strokeStyle="#aab2c0";ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(14,gy);ctx.lineTo(14,gy-20);ctx.stroke();
ctx.fillStyle="#d8574a";ctx.beginPath();ctx.moveTo(14,gy-20);ctx.lineTo(14+9+Math.sin(t*0.3)*1.5,gy-17);ctx.lineTo(14,gy-14);ctx.closePath();ctx.fill();
alive.forEach(function(c,i){
var px=40+((t*1.1+i*47)%(W-80));
var py=gy+20+(i%2)*6;
var bob=Math.sin(t*0.35+i*1.7)*1.2;
var leg=Math.sin(t*0.5+i*1.7)*2;
ctx.strokeStyle="#cfd6e4";ctx.lineWidth=1.6;
ctx.beginPath();ctx.moveTo(px,py+bob+4);ctx.lineTo(px-leg,py+bob+7);ctx.moveTo(px,py+bob+4);ctx.lineTo(px+leg,py+bob+7);ctx.stroke();
ctx.fillStyle="#f0f3f8";ctx.fillRect(px-2.5,py+bob-2,5,7);
ctx.fillStyle="#c3cad8";ctx.fillRect(px-4.5,py+bob-1,2,5);
ctx.beginPath();ctx.arc(px,py+bob-5,3.2,0,Math.PI*2);ctx.fillStyle="#f0f3f8";ctx.fill();
ctx.fillStyle="#7fb7ff";ctx.fillRect(px-2,py+bob-6.4,4,2.2);
});
if(!s.stormActive){for(var d2=0;d2<5;d2++){var mx=(d2*211+t*0.9)%W,my=gy-6-((d2*67)%26);ctx.fillStyle="rgba(220,220,235,0.18)";ctx.beginPath();ctx.arc(mx,my+Math.sin(t*0.2+d2)*2,1.6,0,Math.PI*2);ctx.fill()}}
if(s.stormActive){ctx.fillStyle="rgba(120,70,30,0.22)";ctx.fillRect(0,0,W,H)}
}
function outpostLoop(){outpostT+=0.12;var cv=document.getElementById("outpostCv");if(cv&&cv.offsetParent){drawOutpost()}requestAnimationFrame(outpostLoop)}
if(!(window.matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches)){requestAnimationFrame(outpostLoop)}
function storyArm(){
if(!s||s.difficulty==="sandbox"){return}
s.flags=s.flags||{};
if(s.flags.storyArmed){return}
var want=s.site==="mars"?"storm":"aurora";
var slot=-1;
for(var i=4;i<=9;i++){if(!s.schedule[i]){slot=i;break}}
if(slot<0){slot=5}
s.schedule[slot]=want;
s.flags.storyArmed=true;
s.flags.storySol=slot+1;
s.flags.storyEv=want;
s.flags.seedling=1;
}
function storyBtn(id,label,fn){var b=document.createElement("button");b.id=id;b.textContent=label;b.onclick=fn;$("storyBtns").appendChild(b)}
function storyBuild(type){
var d=TrainerEngine.BUILDINGS[type];
if(s.res.parts<d.cost){showToast("Need "+(d.cost-s.res.parts)+" more parts for the "+d.name+".");return}
if(TrainerEngine.build(s,type)){s.flags.ch1Done=true;sndBuild();showToast(d.name+" started. Ana approves - living space first, discoveries next.");render()}
}
function applyStoryHit(hp,mo){s.crew.forEach(function(c){if(c.health>0){c.health=Math.max(5,c.health-hp);c.morale=Math.max(5,c.morale-mo)}})}
function storyResolve(){
var f=s.flags;
if(!f||!f.storyArmed||f.storyResolved||s.sol!==f.storySol){return}
f.storyResolved=true;
var evWord=s.site==="mars"?"dust storm":"solar particle storm";
if(f.storyChoice==="shelter"){
s.res.science=Math.max(0,s.res.science-10);
s.crew.forEach(function(c){if(c.health>0){c.morale=Math.min(100,c.morale+4)}});
showToast("Sheltered through the "+evWord+". Everyone safe and grateful, but data work slipped (-10).");
}else if(f.storyChoice==="work"){
s.crew.forEach(function(c){if(c.health>0){c.health=Math.max(5,c.health-18);c.morale=Math.max(5,c.morale-10)}});
s.res.science+=8;
showToast("The crew worked through the "+evWord+": +8 data, but health and morale took a hit.");sndWrong();
}
if((f.ctxShown||0)<CQUIZ.length&&f.ctxPending===undefined){f.ctxPending=f.ctxShown||0}
}
function postTick(){
if(!s){return}
storyArm();
if(s.over){return}
var um=UNLOCK_MSG[s.sol];
if(um&&s.flags["unlock"+s.sol]!==true){s.flags["unlock"+s.sol]=true;showToast(um);sndBadge()}
if(s.flags.storyArmed&&s.flags.storyChoice==="shelter"&&s.sol===s.flags.storySol-1){TrainerEngine.shelterMode(s)}
storyResolve();
if(s.flags.storyArmed&&s.flags.storyResolved&&!s.flags.ch3Done&&s.sol>s.flags.storySol){
s.flags.ch3Done=true;
if(!s.flags.storyChoice){applyStoryHit(12,0);showToast("The storm passed. With no shelter call made, the crew rode it out (-12 health).");sndWrong()}
}
if(s.stormActive&&(s.flags.ctxShown||0)<CQUIZ.length&&s.flags.ctxPending===undefined){s.flags.ctxPending=s.flags.ctxShown||0}
if(s.flags.ctxPending!==undefined&&s.pendingQuiz===null&&window.__openFeat){window.__openFeat("status")}
}
window.__gameState=function(){return s};
function renderAnalytics(){
if(!s){return}
var al=TrainerEngine.alerts(s);
var bat=TrainerEngine.batteryStatus(s);
var mo=TrainerEngine.moraleReport(s);
var pf=TrainerEngine.powerForecast(s);
var fc=TrainerEngine.foodCalendar(s);
var bq=TrainerEngine.buildQueueEta(s);
var hr=TrainerEngine.healthReport(s);
var ws=TrainerEngine.weeklySummary(s);
var hints=TrainerEngine.tutorialHints(s);
var chk=TrainerEngine.dailyChecklist(s);
var h="";
al.forEach(function(a2){h+='<span class="chip" style="border-color:'+(a2.level==="critical"?"#ff8080":(a2.level==="warn"?"#ffd166":"#6fd3ff"))+'">'+a2.text+"</span>"});
h+="<p>Today's checklist: "+chk.join("; ")+".</p>";
hints.forEach(function(x){h+='<p class="hint">'+x+"</p>"});
h+="<p>Battery: "+bat.stored+"/"+bat.capacity+" ("+bat.pct+"%)"+(bat.note?" "+bat.note:"")+" Tomorrow's power: "+pf.tomorrow+" (today "+pf.today+").</p>";
h+="<p>Morale avg "+mo.avg+(mo.lowest?"; lowest: "+mo.lowest.name+" ("+mo.lowest.morale+")":"")+". Food days at 100/80/60% rations: "+fc.map(function(f){return f.days}).join(" / ")+".</p>";
if(bq.length){h+="<p>Under construction: "+bq.map(function(b){return b.name+" ("+b.solsLeft+" sol)"}).join(", ")+".</p>"}
h+="<p>Crew: "+hr.map(function(c){return c.name+" "+c.status}).join(", ")+".</p>";
if(ws){h+="<p>Last 7 sols: data "+(ws.scienceDelta>=0?"+":"")+ws.scienceDelta+", food "+(ws.foodDelta>=0?"+":"")+ws.foodDelta+", water "+(ws.waterDelta>=0?"+":"")+ws.waterDelta+", parts "+(ws.partsDelta>=0?"+":"")+ws.partsDelta+".</p>"}
$("analytics").innerHTML=h;
var ev=TrainerEngine.eventPreview(s);
var eh="";
ev.forEach(function(e){eh+='<span class="chip">'+e.text+"</span>"});
$("evPreview").innerHTML=eh}
function drawHistory(){
if(!s){return}
var cv=$("histCv");var c=cv.getContext("2d");
c.clearRect(0,0,cv.width,cv.height);
var hist=TrainerEngine.resourceHistory(s);
if(hist.length<2){c.fillStyle="#9aa7c7";c.font="13px Verdana";c.fillText("History builds as sols pass.",20,30);return}
var key=$("histSel").value;
var vals=hist.map(function(x){return x[key]});
var mn=Math.min.apply(null,vals),mx=Math.max.apply(null,vals);
if(mx===mn){mx=mn+1}
function X(i){return 40+i/(vals.length-1)*(cv.width-70)}
function Y(v){return 15+(mx-v)/(mx-mn)*(cv.height-50)}
c.strokeStyle="#6fd3ff";c.lineWidth=2;c.beginPath();
vals.forEach(function(v,i){if(i===0){c.moveTo(X(i),Y(v))}else{c.lineTo(X(i),Y(v))}});
c.stroke();
c.fillStyle="#9aa7c7";c.font="11px Verdana";
c.fillText(mx,6,Y(mx)+4);c.fillText(mn,6,Y(mn)+4);
c.fillText("sol "+hist[0].sol,40,cv.height-6);c.fillText("sol "+hist[hist.length-1].sol,cv.width-80,cv.height-6)}
function showSiteCompare(){
var cs=TrainerEngine.compareSites();
var h='<table class="cmp"><tr><th>Site</th><th>Radiation</th><th>Ice</th><th>Solar</th><th>Storms</th></tr>';
cs.forEach(function(c){h+="<tr><td>"+c.name+"</td><td>"+c.radiation+"</td><td>"+c.ice+"</td><td>"+Math.round(c.solarFactor*100)+"%</td><td>"+Math.round(c.stormChance*100)+'%/sol</td></tr><tr><td colspan="5"><small>'+c.desc+"</small></td></tr>"});
$("siteCompare").innerHTML=h+"</table>"}
$("startBtn").onclick=function(){
s=TrainerEngine.newGame($("siteSel").value,parseInt($("seedSel").value,10)||1,$("diffSel").value);
var sc=$("scenSel").value;
if(sc){TrainerEngine.setScenario(s,sc)}
TrainerEngine.setMissionName(s,$("nameSel").value);
TrainerEngine.setObjectiveMode(s,$("objSel").value);
var lv=$("launchVeil");
if(lv&&!(window.matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches)){lv.hidden=false;void lv.offsetWidth;lv.classList.add("go");setTimeout(function(){lv.classList.remove("go");setTimeout(function(){lv.hidden=true},320)},380)}
storyArm();
window.__gameState=function(){return s};
window.__armQuiz=function(){if(s&&s.pendingQuiz===null&&!s.over){s.pendingQuiz=s.quizIndex%TrainerEngine.QUIZ.length;render()}};
window.__fx.setRoom("mission");
$("setup").hidden=true;$("game").hidden=false;render();restoreView();if(window.__applyDiff){window.__applyDiff(s.difficulty)}if(window.__tourEvent){window.__tourEvent("launch")}};
$("solBtn").onclick=function(){if(!s)return;TrainerEngine.tick(s);sndSol();if(window.__tourEvent){window.__tourEvent("sol")}postTick();render();if(window.__openFeat&&!window.__quizWas){window.__openFeat("status")}var sp=$("statusPanel");sp.classList.remove("pulse");void sp.offsetWidth;sp.classList.add("pulse")};
$("autoBtn").onclick=function(){
if(!s)return;
if(autoTimer){clearInterval(autoTimer);autoTimer=null;$("autoBtn").querySelector(".lb").textContent="Auto: off";return}
$("autoBtn").querySelector(".lb").textContent="Auto: on";
autoTimer=setInterval(function(){if(!s||s.over){clearInterval(autoTimer);autoTimer=null;$("autoBtn").querySelector(".lb").textContent="Auto: off";return}TrainerEngine.tick(s);postTick();render()},900)};
$("reportBtn").onclick=function(){if(!s)return;download("mission-report-sol"+s.sol+".txt",TrainerEngine.report(s))};
$("reportJsonBtn").onclick=function(){if(!s)return;download("mission-report-sol"+s.sol+".json",JSON.stringify(TrainerEngine.reportJSON(s),null,2),"application/json")};
$("saveBtn").onclick=function(){if(!s)return;localStorage.setItem("jamtrainer",JSON.stringify(s))};
$("loadBtn").onclick=function(){
var raw=localStorage.getItem("jamtrainer");
if(!raw){return}
s=JSON.parse(raw);
window.__fx.setRoom("mission");
$("setup").hidden=true;$("game").hidden=false;render();restoreView();if(window.__applyDiff){window.__applyDiff(s.difficulty)}if(window.__tourEvent){window.__tourEvent("launch")}};
$("contrastBtn").onclick=function(){document.body.classList.toggle("hc")};
$("recruitBtn").onclick=function(){if(!s)return;TrainerEngine.recruit(s);render()};
$("sndBtn").onclick=function(){sndOn=!sndOn;try{localStorage.setItem("sndOn",sndOn?"1":"0")}catch(e){};applySnd();if(sndOn){tone(660,.1,"sine",.06)}};
applySnd();
function applyTheme(t){if(["teal","amber","violet","crimson"].indexOf(t)<0){t="teal"}document.body.dataset.theme=t;try{localStorage.setItem("btnTheme",t)}catch(e){}}
var initTheme="teal";try{initTheme=localStorage.getItem("btnTheme")||"teal"}catch(e){}
if($("themeSel")){$("themeSel").value=initTheme;$("themeSel").onchange=function(){applyTheme($("themeSel").value)};applyTheme(initTheme)}
if($("musModeSel")){try{$("musModeSel").value=localStorage.getItem("musMode")||"space"}catch(e){}$("musModeSel").onchange=function(){musModeSet($("musModeSel").value)}}
var idleMins=10;try{var im=parseInt(localStorage.getItem("idleMins")||"10",10);if(im===5||im===10||im===0){idleMins=im}}catch(e){}
var idleT=null;
function idleFire(){if(!s){return}var m=$("game");if(m.dataset.feat&&m.dataset.feat!=="quiz"&&window.__closeFeat){window.__closeFeat()}}
function idleReset(){if(idleT){clearTimeout(idleT);idleT=null}if(idleMins>0){idleT=setTimeout(idleFire,idleMins*60000)}}
["pointerdown","keydown","touchstart"].forEach(function(ev){document.addEventListener(ev,idleReset,{passive:true})});
if($("idleSel")){try{$("idleSel").value=String(idleMins)}catch(e){}$("idleSel").onchange=function(){idleMins=parseInt($("idleSel").value,10);try{localStorage.setItem("idleMins",String(idleMins))}catch(e){}idleReset()}}
idleReset();
window.__idleFire=idleFire;
function restoreView(){try{var v=localStorage.getItem("jamt_view");if(v&&window.__fx&&window.__fx.featLocked&&!window.__fx.featLocked(v)&&window.__openFeat){window.__openFeat(v)}}catch(e){}}
$("rationSel").onchange=function(){if(s){TrainerEngine.setRations(s,parseFloat($("rationSel").value));render()}};
$("manifestSel").onchange=function(){if(s){TrainerEngine.setManifest(s,$("manifestSel").value);render()}};
$("newBtn").onclick=function(){if(autoTimer){clearInterval(autoTimer);autoTimer=null}$("setup").hidden=false;$("game").hidden=true;s=null};
Object.keys(TrainerEngine.BUILDINGS).forEach(function(t){
$("drySel").innerHTML+='<option value="'+t+'">'+TrainerEngine.BUILDINGS[t].name+"</option>"});
$("drySel").onchange=function(){
if(!s){return}
var d=TrainerEngine.dryRunBuild(s,this.value);
$("dryOut").innerHTML=d?'<p class="hint">'+d.name+": "+d.cost+" parts, "+d.buildSols+" sol(s) to build. Power: "+(d.powerDelta>=0?"+":"")+d.powerDelta+" generated, "+d.powerUse+" draw. "+d.note+"</p>":""};
$("cleanBtn").onclick=function(){if(!s)return;$("opsMsg").textContent=TrainerEngine.cleanSolar(s)?"Panels cleaned: +20% solar for 3 sols.":"Needs 2 parts and an online array.";render()};
$("suitBtn").onclick=function(){if(!s)return;$("opsMsg").textContent=TrainerEngine.suitMaintenance(s)?"Suits serviced: next EVA is safer.":"Needs 3 parts.";render()};
$("repAllBtn").onclick=function(){if(!s)return;var n=TrainerEngine.repairAll(s);$("opsMsg").textContent=n?("Repaired "+n+" building(s)."):"Nothing affordable to repair.";render()};
$("shelterBtn").onclick=function(){if(!s)return;TrainerEngine.shelterMode(s);$("opsMsg").textContent="Shelter mode set for next sol.";render()};
document.addEventListener("visibilitychange",function(){document.body.classList.toggle("bgpause",document.hidden)});
$("histSel").onchange=drawHistory;
$("histCsvBtn").onclick=function(){if(!s)return;download("resource-history.csv",TrainerEngine.historyCSV(s),"text/csv")};
$("briefBtn").onclick=function(){
if(!s)return;
var E=TrainerEngine;
var rw=E.resourceRunway(s);
var runwayLines=Object.keys(rw).map(function(k){var v=rw[k];return k+": "+(v===null?"steady":(v===Infinity?"untracked":v+" sols"))}).join(", ");
var nr=E.netRates(s);
var rateLines=Object.keys(nr).map(function(k){var v=nr[k];return k+" "+(v===null?"-":(v>=0?"+":"")+v+"/sol")}).join(", ");
var b=E.bestNextBuild(s);
var m=E.solMilestones(s);
var crit=E.criticalCrew(s);
var un=E.unpoweredList(s);
var h="<h3>"+E.solReport(s)+"</h3>";
h+="<p>Nets: "+rateLines+"</p><p>Runways: "+runwayLines+"</p>";
h+="<p>Next build: "+b.suggestion+" ("+b.reason+")</p>";
if(crit.length){h+="<p>Struggling crew: "+crit.map(function(c){return c.name}).join(", ")+"</p>"}
if(un.length){h+="<p>Unpowered: "+un.map(function(u){return u.name}).join(", ")+"</p>"}
if(m.length){h+="<p>Milestones: "+m.join(" | ")+"</p>"}
h+="<p>"+E.winProbabilityHint(s).hint+" - "+E.winProbabilityHint(s).note+"</p>";
$("briefOut").innerHTML=h;
var p=E.endgameProjection(s);
var ph="<p>Data pace: "+p.plan.perSol+"/sol, ETA "+p.plan.etaSols+" sols ("+p.plan.note+"). Shield L"+p.plan.shieldNext+" next. Difficulty: "+p.difficulty+".</p>";
ph+="<p>Storm checklist: "+E.stormPrepChecklist(s).join("; ")+"</p>";
$("projOut").innerHTML=ph;
var gh="<h4>Night prep</h4><p>"+E.nightPrepChecklist(s).join("; ")+"</p>";
gh+="<h4>Glossary</h4><p>"+E.glossaryTerms().map(function(g){return g.term+": "+g.def}).join("<br>")+"</p>";
gh+="<h4>FAQ</h4><p>"+E.faqList().map(function(f){return f.q+" - "+f.a}).join("<br>")+"</p>";
gh+="<h4>Quiz bank</h4><p>"+E.quizBankStats().questions+" questions across "+Object.keys(E.quizBankStats().byDifficulty).join(", ")+"</p>";
$("guideOut").innerHTML=gh};
$("summaryBtn").onclick=function(){
if(!s)return;
var t=TrainerEngine.summaryEmailText(s);
if(navigator.clipboard){navigator.clipboard.writeText(t)}else{download("mission-summary.txt",t)}
$("briefOut").innerHTML="<p>Summary copied: "+t+"</p>"};
$("mdLogBtn").onclick=function(){if(!s)return;download("mission-log.md",TrainerEngine.markdownLog(s),"text/markdown")};
$("statsBtn").onclick=function(){if(!s)return;download("mission-stats.json",TrainerEngine.statsJSON(s),"application/json")};
$("buildCsvBtn").onclick=function(){if(!s)return;download("build-plan.csv",TrainerEngine.buildPlanCSV(s),"text/csv")};
$("techCsvBtn").onclick=function(){download("tech-tree.csv",TrainerEngine.techTreeCSV(),"text/csv")};
$("sitesCsvBtn").onclick=function(){download("site-comparison.csv",TrainerEngine.siteComparisonCSV(),"text/csv")};
$("stateCheckBtn").onclick=function(){
if(!s)return;
var errs=TrainerEngine.validateState(s);
$("briefOut").innerHTML=errs.length?("<p>Issues: "+errs.join("; ")+"</p>"):"<p>State integrity OK (hash "+TrainerEngine.stateHash(s)+").</p>"};
$("dashBtn").onclick=function(){
if(!s)return;
var E=TrainerEngine;
var g=E.subsystemGrades(s);
var p=E.objectiveProgress(s);
var d=E.deadlineCheck(s);
var h="<h3>Subsystem grades</h3><p>Power "+g.power+" | O2 "+g.o2+" | Water "+g.water+" | Food "+g.food+" | Morale "+g.morale+"</p>";
if(!p.sandbox){h+="<p>Objective: "+p.pct+"% ("+p.science+"/"+p.goal+" science, sol "+p.solUsed+"/"+p.solLimit+"). Pace "+d.pacePerSol+"/sol, "+(d.onTrack?"on track":"behind")+".</p>"}
var fs=E.firstShortage(s);
if(fs.resource){h+="<p>First shortage: "+fs.resource+" in "+fs.sols+" sols.</p>"}
var m=E.maintenancePlan(s);
h+="<p>Maintenance: "+m.map(function(x){return x.item+" ("+x.issue+")"}).join("; ")+"</p>";
var tr=E.techRecommend(s);
h+="<p>Research picks: "+tr.map(function(x){return x.name+" ("+x.cost+" sci)"}).join(", ")+"</p>";
var xp=E.xpProgress(s);
h+="<p>XP: "+xp.map(function(x){return x.name+" L"+x.level+" ("+x.toNext+" to next)"}).join(", ")+"</p>";
var na=E.nearestAchievements(s);
if(na.length){h+="<p>Closest badges: "+na.map(function(x){return x.name+" "+Math.round(x.pct)+"%"}).join(", ")+"</p>"}
h+="<p>Victory gap: "+E.victoryGap(s).join(" ")+"</p>";
$("dashOut").innerHTML=h};
$("timelineCsvBtn").onclick=function(){if(!s)return;download("mission-timeline.csv",TrainerEngine.missionTimelineCSV(s),"text/csv")};
$("queueCsvBtn").onclick=function(){if(!s)return;download("research-queue.csv",TrainerEngine.researchQueueCSV(s),"text/csv")};
$("triviaBtn").onclick=function(){
if(!s)return;
var t=TrainerEngine.triviaOfTheSol(s);
$("dashOut").innerHTML="<p>Sol "+t.sol+" trivia: "+t.trivia+"</p>"};
$("logSearchBtn").onclick=function(){
if(!s)return;
var hits=TrainerEngine.logSearch(s,$("logSearchIn").value);
$("dashOut").innerHTML=hits.length?("<p>"+hits.slice(0,8).map(function(x){return "Sol "+x.sol+": "+x.msg}).join("<br>")+"</p>"):"<p>No log lines match.</p>"};
$("crewCsvBtn").onclick=function(){if(!s)return;download("crew-roster.csv",TrainerEngine.crewCSV(s),"text/csv")};
$("shareBtn").onclick=function(){
if(!s)return;
var t=TrainerEngine.shareText(s);
if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(t)}
$("opsMsg").textContent="Share text: "+t};
document.addEventListener("keydown",function(e){
if(!s||$("game").hidden){return}
if(e.key===" "&&!s.over){e.preventDefault();TrainerEngine.tick(s);render()}
if(e.key==="s"){$("saveBtn").click()}});
showSiteCompare();

function r5Show(h){$("r5Out").innerHTML=h}
function r5esc(x){return String(x).replace(/</g,"&lt;")}
function r5tbl(rows){return"<table>"+rows.map(function(r){return"<tr>"+r.map(function(c){return"<td>"+r5esc(c)+"</td>"}).join("")+"</tr>"}).join("")+"</table>"}
function r5need(){if(!s){r5Show("<p>Start a mission first.</p>");return true}return false}
$("r5CrewBtn").onclick=function(){if(r5need())return;
r5Show(r5tbl([["Name","Role","Lvl","Health","Morale","Fatigue","Away"]].concat(E().crewSummary(s).map(function(c){return[c.name,c.role,c.level,c.health,c.morale,c.fatigue,c.away]}))))};
$("r5HealthBtn").onclick=function(){if(r5need())return;
r5Show(r5tbl([["Avg health",E().crewHealthAvg(s)],["Avg fatigue",E().crewFatigueAvg(s)],["Avg morale",Math.round(E().avgMorale(s)*10)/10],["Total XP",E().crewXpTotal(s)]]))};
$("r5RolesBtn").onclick=function(){if(!s)return;if(r5need())return;var r=E().roleRoster(s),l=E().crewLevels(s);
r5Show(r5tbl([["Role","Crew"]].concat(Object.keys(r).map(function(k){return[k,r[k].join(", ")]})).concat([["Level 1 / 2 / 3",l[1]+" / "+l[2]+" / "+l[3]]])))};
$("r5ExhBtn").onclick=function(){if(r5need())return;
r5Show("<p>Exhausted: "+(E().exhaustedCrew(s).join(", ")||"none")+". Away: "+(E().awayCrew(s).map(function(c){return c.name}).join(", ")||"none")+".</p>")};
$("r5MoraleBtn").onclick=function(){if(!s)return;if(r5need())return;var m=E().moraleSpread(s);
r5Show(r5tbl([["Min",m.min],["Avg",m.avg],["Max",m.max]]))};
$("r5ResBtn").onclick=function(){if(!s)return;if(r5need())return;var r=E().resLevels(s),q=E().resRatios(s);
r5Show(r5tbl([["O2",r.o2],["Water",r.water],["Food",r.food],["Parts",r.parts],["Regolith",r.regolith],["Science",r.science],["O2/crew",q.o2PerCrew],["Water/crew",q.waterPerCrew],["Food/crew",q.foodPerCrew],["Lowest",E().resLowest(s)]]))};
$("r5PaceBtn").onclick=function(){if(!s)return;if(r5need())return;var p=E().sciencePace(s);
if(!p){r5Show("<p>Sol 0: no pace yet.</p>");return}
r5Show(r5tbl([["Per sol",p.perSol],["Needed",p.needed],["On track",p.onTrack]]))};
$("r5ProjBtn").onclick=function(){if(!s)return;if(r5need())return;var p=E().projectedWin(s);
if(!p){r5Show("<p>Too early to project.</p>");return}
r5Show(r5tbl([["Projected data",p.projected],["Target",p.target],["Will win",p.willWin]]))};
$("r5RunwayBtn").onclick=function(){if(!s)return;if(r5need())return;var r=E().runwayTable(s);
r5Show(r5tbl([["Resource","Sols"]].concat(Object.keys(r).map(function(k){return[k,r[k]===null?"?":(r[k]===Infinity?"inf":r[k])]}))))};
$("r5ShortBtn").onclick=function(){if(!s)return;if(r5need())return;var x=E().shortestRunway(s);
r5Show("<p>"+(x?x.res+": "+x.sols+" sols of runway.":"No resource trending down.")+"</p>")};
$("r5DangerBtn").onclick=function(){if(r5need())return;
r5Show("<p>Danger score: "+E().dangerScore(s)+"/100.</p>")};
$("r5OddsBtn").onclick=function(){if(r5need())return;
r5Show("<p>"+r5esc(E().winOddsText(s))+"</p>")};
$("r5BldBtn").onclick=function(){if(r5need())return;
r5Show(r5tbl([["Types",E().buildingTypes(s).join(", ")],["Damaged",E().damagedList(s).join(", ")||"none"],["In progress",E().inProgressList(s).map(function(b){return b.type+"("+b.solsLeft+")"}).join(", ")||"none"]]))};
$("r5CropBtn").onclick=function(){if(!s)return;if(r5need())return;var c=E().cropCoverage(s);
r5Show("<p>"+(Object.keys(c).length?Object.keys(c).map(function(k){return k+": "+c[k]}).join(", "):"No greenhouses yet.")+"</p>")};
$("r5PowBtn").onclick=function(){if(!s)return;if(r5need())return;var m=E().powerMargin(s);var d=E().storeDays(s);
r5Show(r5tbl([["Generation",m.gen],["Consumption",m.use],["Stored",m.store],["Store days at deficit",d===Infinity?"inf":d]]))};
$("r5ShieldBtn").onclick=function(){if(!s)return;if(r5need())return;var i=E().shieldInfo(s);
r5Show(r5tbl([["Level",i.level],["Next cost",i.nextCost===null?"maxed":i.nextCost+" parts"]]))};
$("r5TechBtn").onclick=function(){if(!s)return;if(r5need())return;var n=E().nextTechCost(s);
r5Show("<p>Researched: "+(E().techsResearched(s).join(", ")||"none")+". "+(n?"Cheapest next: "+n.name+" ("+n.cost+" sci).":"All researched.")+"</p>")};
$("r5Res2Btn").onclick=function(){if(!s)return;if(r5need())return;var r=E().researchableNow(s);
r5Show("<p>"+(r.length?"Affordable now: "+r.join(", "):"Nothing affordable yet.")+"</p>")};
$("r5AffordBtn").onclick=function(){if(!s)return;if(r5need())return;var a=E().affordableBuildings(s);
r5Show("<p>"+(a.length?"Affordable: "+a.join(", "):"Nothing affordable.")+"</p>")};
$("r5HistBtn").onclick=function(){if(r5need())return;
r5Show(r5tbl([["Resource","First half","Second half","Rising"]].concat(["o2","water","food"].map(function(k){var t=E().historyTrend(s,k);return[k,t?t.first:"-",t?t.last:"-",t?t.rising:"-"]}))))};
$("r5BestBtn").onclick=function(){if(!s)return;if(r5need())return;var w=E().worstSol(s,"o2"),b=E().bestSol(s,"o2");
if(!w){r5Show("<p>No history yet.</p>");return}
r5Show(r5tbl([["Worst O2","Sol "+w.sol+": "+w.o2],["Best O2","Sol "+b.sol+": "+b.o2]]))};
$("r5DeltaBtn").onclick=function(){if(!s)return;if(r5need())return;var d=E().historyDelta(s,"o2",1,s.sol);
r5Show("<p>"+(d===null?"No history yet.":"O2 change since sol 1: "+d)+"</p>")};
$("r5UpBtn").onclick=function(){if(r5need())return;
r5Show(r5tbl([["Sol","Event"]].concat(E().upcomingEvents(s,5).map(function(u){return[u.sol,u.text]}))))};
$("r5HazBtn").onclick=function(){if(r5need())return;
r5Show("<p>"+r5esc(E().calendarNote(s))+"</p>")};
$("r5CheckBtn").onclick=function(){if(r5need())return;
r5Show("<ul>"+E().actionChecklist(s).map(function(a){return"<li>"+r5esc(a)+"</li>"}).join("")+"</ul>")};
$("r5StatusBtn").onclick=function(){if(r5need())return;
r5Show("<p>"+r5esc(E().missionStatusLine(s))+"</p>")};
$("r5QuizBtn").onclick=function(){if(r5need())return;
r5Show("<p>"+r5esc(E().quizStatsText(s))+"</p>")};
$("r5AchBtn").onclick=function(){if(r5need())return;
r5Show("<p>Achievements: "+E().achievementPct(s)+"% earned.</p>")};
function r5dl(name,text){var a=document.createElement("a");
a.href=URL.createObjectURL(new Blob([text],{type:"text/plain"}));a.download=name;a.click()}
$("r5CrewCsvBtn").onclick=function(){if(!s)return;if(r5need())return;r5dl("crew.csv",E().crewTableCSV(s))};
$("r5BldCsvBtn").onclick=function(){if(!s)return;if(r5need())return;r5dl("buildings.csv",E().buildingsCSV(s))};
$("r5TechCsvBtn").onclick=function(){if(!s)return;if(r5need())return;r5dl("techs.csv",E().techCSV(s))};
$("r5SchedCsvBtn").onclick=function(){if(!s)return;if(r5need())return;r5dl("schedule.csv",E().scheduleCSV(s))};
$("r5SnapBtn").onclick=function(){if(r5need())return;
r5Show("<pre>"+r5esc(E().snapshotJSON(s))+"</pre>")};
$("r5MdBtn").onclick=function(){if(r5need())return;
r5Show("<pre>"+r5esc(E().missionMd(s))+"</pre>")};
$("r5AuditBtn").onclick=function(){if(!s)return;if(r5need())return;var e=E().stateAudit(s);
r5Show("<p>"+(e.length?e.join("; "):"State passes audit.")+"</p>")};
$("r5GlossBtn").onclick=function(){
r5Show("<dl>"+E().glossaryR5().map(function(g){return"<dt>"+g.term+"</dt><dd>"+g.def+"</dd>"}).join("")+"</dl>")};
$("r5FaqBtn").onclick=function(){
r5Show(E().faqR5().map(function(f){return"<p><b>"+f.q+"</b><br>"+f.a+"</p>"}).join(""))};
$("r5TriviaBtn").onclick=function(){
r5Show("<p>"+E().triviaR5(Math.floor(Math.random()*97)).fact+"</p>")};
$("r5Quiz2Btn").onclick=function(){var i=Math.floor(Math.random()*E().QUIZ.length),q=E().QUIZ[i];
r5Show("<p><b>"+q.q+"</b></p>"+q.a.map(function(a,j){return'<button data-j="'+j+'" class="q01r5">'+a+"</button>"}).join(" ")+'<span id="q01r5msg"></span>');
Array.prototype.forEach.call(document.querySelectorAll(".q01r5"),function(btn){
btn.onclick=function(){var r=E().quizCheck01(i,+btn.dataset.j);
btn.classList.add(r.correct?"ok":"no");
if(r.correct){sndRight(0)}else{sndWrong()}
document.getElementById("q01r5msg").textContent=(r.correct?" Correct! ":" Not quite. ")+r.fact}})};

function r580day(){var d=new Date();return Math.floor((d-new Date(d.getFullYear(),0,0))/864e5)}
$("r580BriefBtn").onclick=function(){var b=TrainerEngine.fa2Briefing(r580day());$("r580Brief").textContent="Fact: "+b.fact+" | Watch for: "+b.event+" | Aim for: "+b.target};
$("r580Trained").onclick=function(){var today=r580day();var last=parseInt(localStorage.getItem("r580last")||"-1",10);var streak=parseInt(localStorage.getItem("r580streak")||"0",10);var ns=TrainerEngine.fa2StreakNext(streak,last,today);localStorage.setItem("r580last",String(today));localStorage.setItem("r580streak",String(ns));$("r580Streak").textContent="Streak: "+ns};
var r580drill=-1;
function r580Drill(){r580drill=(r580drill+1)%TrainerEngine.fa2DrillCount();var d=TrainerEngine.fa2Drill(r580drill);$("r580DrillQ").textContent="Where does this hit? "+d.text;var bb=$("r580DrillBtns");bb.innerHTML="";d.choices.forEach(function(c,idx){var b=document.createElement("button");b.textContent=c;b.onclick=function(){
var right=idx===d.correct;
b.classList.add(right?"ok":"no");
if(!right){var cb=bb.children[d.correct];if(cb){cb.classList.add("ok")}}
if(right){sndRight(0);burstFrom(b)}else{sndWrong()}
Array.prototype.forEach.call(bb.children,function(x){x.disabled=true});
$("r580DrillOut").textContent=right?"Correct - it affects "+c+". (weight "+d.weight+")":"Not quite - the right answer was "+d.choices[d.correct]+".";
setTimeout(r580Drill,1100)};bb.appendChild(b)})}
$("r580DrillQ").onclick=function(){};
function r580Pass(){
var done=[];try{done=JSON.parse(localStorage.getItem("r580pass")||"[]")}catch(e){}
$("r580PassBar").textContent=TrainerEngine.fa2PassportPct(done)+"% mastered ("+done.length+"/"+TrainerEngine.fa2PassportTotal()+")";
var ll=$("r580PassList");ll.innerHTML="";
var rem=TrainerEngine.fa2PassportRemaining(done);
if(!rem.length){var p=document.createElement("p");p.className="hint";p.textContent="Passport complete - every fact mastered. Well done, commander.";ll.appendChild(p);return}
rem.slice(0,6).forEach(function(idx){
var q=TrainerEngine.QUIZ[idx];
var card=document.createElement("div");card.className="passQ";
var qt=document.createElement("div");qt.className="pq";qt.textContent="Fact "+(idx+1)+": "+q.q;card.appendChild(qt);
q.a.forEach(function(ans,j){
var b=document.createElement("button");b.textContent=ans;
b.onclick=function(){
var right=j===q.c;
b.classList.add(right?"ok":"no");
if(right){sndRight(0);burstFrom(b)}else{sndWrong();var cb=card.querySelectorAll("button")[q.c];if(cb){cb.classList.add("ok")}}
Array.prototype.forEach.call(card.querySelectorAll("button"),function(x){x.disabled=true});
var f=document.createElement("div");f.className="passFact";
f.textContent=right?q.fact:("Not quite - the right answer is: "+q.a[q.c]+". "+q.fact);
card.appendChild(f);
if(right){
try{done=JSON.parse(localStorage.getItem("r580pass")||"[]")}catch(e){}
if(done.indexOf(idx)<0){done.push(idx);localStorage.setItem("r580pass",JSON.stringify(done))}
$("r580PassBar").textContent=TrainerEngine.fa2PassportPct(done)+"% mastered ("+done.length+"/"+TrainerEngine.fa2PassportTotal()+")";
setTimeout(r580Pass,2600)}
else{setTimeout(r580Pass,4200)}};
card.appendChild(b)});
ll.appendChild(card)})}
$("r580PassExport").onclick=function(){var done=[];try{done=JSON.parse(localStorage.getItem("r580pass")||"[]")}catch(e){}$("r580PassBar").textContent=TrainerEngine.fa2PassportText(done).slice(0,200)};
window.__featRefresh={passport:r580Pass,hunt:function(){var u=[];try{u=JSON.parse(localStorage.getItem("ach-unlocked")||"[]")}catch(e){}$("r650HuntOut").textContent=TrainerEngine.fa3HuntText(u)}};
var FEATICONS={status:'<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M2 12a6 6 0 0112 0"/><path d="M8 12l3-5"/></svg>',
build:'<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.3"><path d="M10.5 2.5a3.5 3.5 0 00-4.6 4.2L2.7 10a1.8 1.8 0 002.5 2.5l3.2-3.2a3.5 3.5 0 004.3-4.5l-2.4 2.4-2.4-.6-.6-2.5z"/></svg>',
research:'<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.3"><path d="M6 2h4M7 2v4l-3.4 6a1.5 1.5 0 001.3 2.3h6.2a1.5 1.5 0 001.3-2.3L9 6V2"/></svg>',
crew:'<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.3"><circle cx="8" cy="5" r="2.5"/><path d="M3.5 13.5a4.5 4.5 0 019 0"/></svg>',
exped:'<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.3"><path d="M8 1.5c2 1.6 3 4 3 6.5l-1.5 1.5h-3L5 8C5 5.5 6 3.1 8 1.5z"/><path d="M8 11.5v3"/></svg>',
outpost:'<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.3"><path d="M2.5 12a5.5 5.5 0 0111 0z"/><path d="M1.5 12.5h13"/></svg>',
advisor:'<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.3"><path d="M8 2a3.5 3.5 0 012 6.3c-.6.4-1 1-1 1.7H7c0-.7-.4-1.3-1-1.7A3.5 3.5 0 018 2z"/><path d="M6.8 13h2.4M7.2 14.8h1.6"/></svg>',
ops:'<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.3"><path d="M9 1.5L3.5 9H7l-1 5.5L11.5 7H8z"/></svg>',
log:'<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.3"><path d="M4 1.5h6l2 2v11H4z"/><path d="M6 6h4M6 8.5h4M6 11h3"/></svg>',
stats:'<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.3"><path d="M5 2.5h6V7a3 3 0 01-6 0z"/><path d="M5 4H2.5a2.5 2.5 0 002.6 2.5M11 4h2.5a2.5 2.5 0 01-2.6 2.5M8 10v2.5M5.5 13.5h5"/></svg>',
daily:'<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.3"><rect x="2.5" y="3.5" width="11" height="10" rx="1"/><path d="M2.5 6.5h11M5.5 2v3M10.5 2v3"/></svg>',
drill:'<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.3"><path d="M8 2.5L14.5 13h-13z"/><path d="M8 7v3M8 11.5v.5"/></svg>',
passport:'<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.3"><path d="M3.5 2h9v12h-9A1.5 1.5 0 012 12.5v-9A1.5 1.5 0 013.5 2z"/><path d="M6 5.5h4"/></svg>',
marathon:'<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.3"><path d="M4 14V2.5M4 3h8.5L10.5 6l2 3H4"/></svg>',
timeline:'<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.3"><circle cx="8" cy="8" r="5.5"/><path d="M8 5v3l2 1.5"/></svg>',
ach:'<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.3"><circle cx="8" cy="9.5" r="3.5"/><path d="M5.5 6.5L4 2h3l1 2.5L9 2h3l-1.5 4.5"/></svg>',
hunt:'<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.3"><circle cx="8" cy="8" r="5.5"/><circle cx="8" cy="8" r="2.5"/><circle cx="8" cy="8" r=".5" fill="currentColor"/></svg>',
sources:'<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.3"><path d="M8 4C6.5 2.8 4.5 2.5 2.5 3v10c2-.5 4-.2 5.5 1 1.5-1.2 3.5-1.5 5.5-1V3c-2-.5-4-.2-5.5 1z"/><path d="M8 4v10"/></svg>',
analytics:'<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.3"><path d="M2.5 13.5h11"/><path d="M4.5 13.5V9M8 13.5V5.5M11.5 13.5V7.5"/></svg>',
history:'<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.3"><path d="M2.5 13.5h11M2.5 13.5V2.5"/><path d="M4 11l3-4 2.5 2L13 4.5"/></svg>',
briefing:'<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.3"><path d="M2.5 3.5h11v7h-6l-3 3v-3h-2z"/></svg>',
deep:'<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.3"><path d="M2.5 6.5l8-3 1 2.5-8 3z"/><path d="M6.5 10L5 14M9.5 9l1.5 5M3.5 14h9"/></svg>',
workbench:'<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.3"><path d="M3 13L10 6"/><path d="M9.5 2.5l4 4-2 2-4-4z"/></svg>'};
document.querySelectorAll(".wbCard").forEach(function(cd){var f=cd.getAttribute("data-feat");if(FEATICONS[f]){var ic=document.createElement("span");ic.className="wi";ic.innerHTML=FEATICONS[f];cd.insertBefore(ic,cd.firstChild)}});
r580Drill();r580Pass();
if(reduceMotion){var bg0=document.getElementById("spaceBg");if(bg0){bgCv=bg0;bgX=bg0.getContext("2d");bg0.width=innerWidth;bg0.height=innerHeight;stars=[];for(var si=0;si<160;si++){stars.push({x:Math.random(),y:Math.random(),z:Math.random(),tw:0})}bgStatic()}}
else{bgInit()}

(function(){
var mar=null;
function showQ(){if(!mar){return}var q=TrainerEngine.fa3MarathonQ(mar);
$("r650Q").classList.remove("streakPop");
if(!q){$("r650Q").textContent="Marathon over. Final score "+mar.score+", best streak "+mar.bestStreak+".";$("r650Opts").innerHTML="";return}
$("r650Q").textContent="Q"+q.n+"/"+q.total+" (lives "+q.lives+", score "+q.score+"): "+q.q;
var box=$("r650Opts");box.innerHTML="";
q.choices.forEach(function(c,idx){var b=document.createElement("button");b.textContent=c;b.onclick=function(){
var r=TrainerEngine.fa3MarathonAnswer(mar,idx);
b.classList.add(r.right?"ok":"no");
if(!r.right){var corr=box.children[q.answer];if(corr){corr.classList.add("ok")}}
if(r.right){sndRight(mar.streak);window.__fx.burstFrom(b);if(mar.streak>=3){$("r650Q").classList.add("streakPop")}}else{sndWrong()}
Array.prototype.forEach.call(box.children,function(x){x.disabled=true});
$("r650MarOut").textContent=(r.right?"Correct! ":"Wrong - the answer was: "+r.correctAnswer+". ")+r.fact;
setTimeout(showQ,1200)};box.appendChild(b)})}
$("r650Start").onclick=function(){mar=TrainerEngine.fa3MarathonNew();$("r650MarOut").textContent="";$("r650Start").textContent="Restart marathon";showQ()};
$("r650Tl").onclick=function(){var t=TrainerEngine.fa3Timeline($("r650Site").value||null);
var h="<ol class='tl'>";
t.events.forEach(function(e){h+="<li><span class='tlid'>"+e.id+"</span> "+e.text+"</li>"});
$("r650TlOut").innerHTML=h+"</ol>"};
var unlocked=[];
try{unlocked=JSON.parse(localStorage.getItem("ach-unlocked")||"[]")}catch(e){unlocked=[]}
$("r650HuntOut").textContent=TrainerEngine.fa3HuntText(unlocked);
})();
})();

(function(){
function G(id){return document.getElementById(id)}
var steps=[
{text:"Hi, future commander! This is Mission Control. I will walk you through your first sol, one small step at a time. You do the tapping, I keep score."},
{target:"setup",text:"First, set up your mission: give it a name, pick the Moon or Mars, and choose a class. The table shows what each site is like."},
{target:"startBtn",wait:"launch",text:"Your turn: press Launch to begin."},
{sel:"#menuMission .wbCard[data-feat='status']",menu:true,wait:"feat:status",text:"Your base is a menu of workbenches. Your turn: open the Status board."},
{target:"statusPanel",text:"These gauges keep your crew alive: oxygen, water, food, plus parts and data. If air, water or food runs out, the crew is in real trouble."},
{sel:"#menuMission .wbCard[data-feat='build']",menu:true,wait:"feat:build",text:"Back to the menu. Your turn: open the Build yard."},
{target:"buildList",text:"Spend parts here. A Solar Array and an O2 Generator are smart first builds."},
{target:"solBtn",menu:true,wait:"sol",text:"Your turn: press Advance one sol and live your first day."},
{target:"quizPanel",arm:"quiz",wait:"quiz",top:true,text:"Time to earn for real: Mission Control is calling with a real question. Answer it - a right answer pays +6 parts and +5 data, straight into your counters."},
{target:"hud",text:"See the counters at the top? Your quiz winnings are already in there. Data and parts stay in view, and the + buttons show you how to earn more."},
{target:"hudPartsPlus",wait:"hudparts",text:"Try it now: tap the + next to Parts."},
{target:"partsHelp",text:"There it is: every way to get more parts - drills and workshops, salvage trips, pods, quizzes and milestones."},
{target:"hudSciPlus",menu:true,wait:"hudsci",text:"Now tap the + next to Data."},
{target:"sciHelp",text:"And every way to earn data - labs, survey trips, quizzes and relays. You will never be stuck for either again."},
{sel:"#menuMission .wbCard[data-feat='log']",menu:true,wait:"feat:log",text:"One more. Your turn: open the Log."},
{target:"log",text:"Everything that happens is written down here, sol by sol."},
{target:"viewNav",menu:true,text:"Up here you switch rooms: Mission to run the base, Learn & play for quizzes and drills, Reports for charts and downloads."},
{text:"You've learnt the basics - you're good to go now. Good luck, commander!"}
];
var cur=0,active=false;
function clearGlow(){document.querySelectorAll(".tourGlow").forEach(function(x){x.classList.remove("tourGlow")})}
function openFeat(f){
var m=G("game");
m.classList.add("wb-open");
m.dataset.feat=f;
if(window.__tourEvent){window.__tourEvent("feat:"+f)}
try{localStorage.setItem("jamt_view",f)}catch(e){}
if(window.__featRefresh&&window.__featRefresh[f]){window.__featRefresh[f]()}
if(f==="quiz"&&G("quizPanel").hidden){G("quizPanel").hidden=false;if(!G("quizQ").textContent){G("quizQ").textContent="Mission Control will call with a quiz when something interesting happens."}}
m.classList.remove("anim");void m.offsetWidth;m.classList.add("anim")}
function closeFeat(){var m=G("game");m.classList.remove("wb-open");delete m.dataset.feat;try{localStorage.removeItem("jamt_view")}catch(e){}m.classList.remove("anim");void m.offsetWidth;m.classList.add("anim")}
window.__openFeat=openFeat;
window.__closeFeat=closeFeat;
function showStep(){
clearGlow();
var st=steps[cur];
G("tour").classList.toggle("tourTop",!!st.top);
if(st.feat){openFeat(st.feat)}else if(st.menu){closeFeat()}
if(st.arm==="quiz"&&window.__armQuiz){window.__armQuiz()}
G("tourText").textContent="Step "+(cur+1)+" of "+steps.length+": "+st.text;
var nb=G("tourNext");
nb.textContent=cur===steps.length-1?"Done":"Next";
nb.style.display=st.wait?"none":"";
var el=st.target?G(st.target):(st.sel?document.querySelector(st.sel):null);
if(el){el.classList.add("tourGlow");try{el.scrollIntoView({block:"center",behavior:"smooth"})}catch(e){el.scrollIntoView()}}
}
function tourStart(){active=true;cur=0;G("tour").hidden=false;showStep()}
function tourEnd(){active=false;G("tour").hidden=true;clearGlow();try{localStorage.setItem("tourDone","1")}catch(e){}}
G("tourNext").onclick=function(){
cur++;
if(cur>=steps.length){tourEnd();return}
showStep()};
G("tourSkip").onclick=tourEnd;
window.__tourEvent=function(name){
if(!active){return}
if(name==="quizwrong"&&steps[cur].wait==="quiz"){
if(window.__armQuiz){window.__armQuiz()}
G("tourText").textContent="Step "+(cur+1)+" of "+steps.length+": Not quite - Mission Control has another question for you. Give this one a try!";
return}
if(steps[cur].wait===name){cur++;showStep()}};
G("helpBtn").onclick=tourStart;
G("musBtn").onclick=function(){var on=window.__fx.musToggle();G("musBtn").querySelector(".lb").textContent="Music: "+(on?"on":"off")};
G("musBtn").querySelector(".lb").textContent="Music: "+(window.__fx.musState()?"on":"off");
window.__fx.armAutoStart();
G("volR").value=String(Math.round(window.__fx.musVolGet()/.12*100));
G("volR").oninput=function(){window.__fx.musSetVol(parseInt(G("volR").value,10)/100*.12)};
G("helpSetup").onclick=tourStart;
document.querySelectorAll(".wbCard").forEach(function(b){b.onclick=function(){var need=window.__fx.featLocked(b.dataset.feat);if(need){window.__fx.toast("That console unlocks at sol "+need+". Finish settling in first!");return}openFeat(b.dataset.feat)}});
G("wbBack").onclick=closeFeat;
G("hudPartsPlus").onclick=function(){openFeat("build");var ph=G("partsHelp");var d=ph&&ph.querySelector("details");if(d){d.open=true}if(window.__tourEvent){window.__tourEvent("hudparts")}};
G("hudSciPlus").onclick=function(){openFeat("research");var sh=G("sciHelp");var d2=sh&&sh.querySelector("details");if(d2){d2.open=true}if(window.__tourEvent){window.__tourEvent("hudsci")}};
try{if(!localStorage.getItem("tourDone")){tourStart()}}catch(e){tourStart()}
var navBtns=document.querySelectorAll(".navBtn");
navBtns.forEach(function(b){b.onclick=function(){
var m=G("game");
m.classList.remove("wb-open");delete m.dataset.feat;
m.dataset.view=b.dataset.view;
navBtns.forEach(function(x){x.classList.toggle("on",x===b)});
window.__fx.setRoom(b.getAttribute("data-view"));
m.classList.remove("anim");void m.offsetWidth;m.classList.add("anim")}});
var cmd=false;
try{cmd=localStorage.getItem("cmdMode")==="1"}catch(e){}
function applyCmd(){document.body.classList.toggle("kid",!cmd);G("cmdBtn").querySelector(".lb").textContent="Commander mode: "+(cmd?"on":"off");closeFeat()}
window.__applyDiff=function(diff){var cb=G("cmdBtn");if(diff!=="commander"){cb.style.display="none";if(cmd){cmd=false;try{localStorage.setItem("cmdMode","0")}catch(e){}applyCmd()}}else{cb.style.display=""}}
G("cmdBtn").onclick=function(){cmd=!cmd;try{localStorage.setItem("cmdMode",cmd?"1":"0")}catch(e){};applyCmd()};
applyCmd();
var tips={"r5CrewBtn":"Table of your astronauts: role, level, health and morale","r5HealthBtn":"Average health, fatigue and morale","r5RolesBtn":"Who does what job, and their levels","r5ExhBtn":"Who is exhausted or away from base","r5MoraleBtn":"Highest, lowest and average morale","r5ResBtn":"Resource levels and how much each astronaut has","r5PaceBtn":"Data earned per sol versus the goal","r5ProjBtn":"Predicted final data and whether you win","r5RunwayBtn":"How many sols each resource will last","r5ShortBtn":"The resource that runs out first","r5DangerBtn":"Overall danger score from 0 to 100","r5OddsBtn":"Your chances of winning, in words","r5BldBtn":"Building types, damage and construction progress","r5CropBtn":"What your greenhouses are growing","r5PowBtn":"Power made, used and stored","r5ShieldBtn":"Radiation shield level and next upgrade cost","r5TechBtn":"Researched tech and the cheapest next one","r5Res2Btn":"Upgrades you can afford right now","r5AffordBtn":"Buildings you can afford right now","r5HistBtn":"How oxygen, water and food changed over time","r5BestBtn":"Your best and worst sol for oxygen","r5DeltaBtn":"Oxygen change since sol 1","r5UpBtn":"Events coming up soon","r5HazBtn":"The next danger on the calendar","r5CheckBtn":"Suggested next actions","r5StatusBtn":"One-line mission summary","r5QuizBtn":"Your quiz record","r5AchBtn":"How many badges you have earned","r5CrewCsvBtn":"Download the crew table as CSV","r5BldCsvBtn":"Download the buildings table as CSV","r5TechCsvBtn":"Download the tech table as CSV","r5SchedCsvBtn":"Download the event schedule as CSV","r5SnapBtn":"Download the full mission state as JSON","r5MdBtn":"Download the mission as a markdown document","r5AuditBtn":"Check the mission state for mistakes","r5GlossBtn":"Words a commander should know","r5FaqBtn":"Common questions and answers","r5TriviaBtn":"A fun space fact","r5Quiz2Btn":"Try one quiz question right now"};
Object.keys(tips).forEach(function(id){var el=G(id);if(el){el.title=tips[id]}})
})();
