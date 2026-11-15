
(function(){
"use strict";
var $=function(id){return document.getElementById(id)};
var reduce=window.matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches;
var DAY=8,STORM_DAY=6;
var COST={chore:1,fix:2,mission:3};
var OUT={solar:1,rtg:1,comms:1,drill:1,observatory:1,pad:1,watermine:1,shield:1};
var COL={solar:"#2f6fd6",rtg:"#c9a23a",battery:"#7a6fd0",o2gen:"#4fc3c9",scrubber:"#6aa5a8",watermine:"#4d9bff",recycler:"#5aa7e6",greenhouse:"#3fae62",habitat:"#9aa7bd",shield:"#8a8f98",medbay:"#e8e8f0",lab:"#b18ae8",comms:"#d0d6e0",drill:"#c98b4a",workshop:"#c9733a",algae:"#58b88a",observatory:"#8fb1ff",gym:"#e09a6a",pad:"#6d7280",mission:"#6fd3ff"};
var JOB={
solar:["Brush dust off the panels","parts",1],rtg:["Read the RTG temperature log","science",1],battery:["Check the battery cells","science",1],
o2gen:["Swap the air filter","o2",4],scrubber:["Empty the CO₂ cartridge","o2",3],watermine:["Empty the ice hopper","water",4],
recycler:["Clean the water filter","water",3],greenhouse:["Water the plants","food",3],habitat:["Tidy the bunks and check in with the crew","morale",3],
shield:["Stack regolith bags on the wall","regolith",3],medbay:["Restock the first-aid shelf","health",2],lab:["Log a rock sample","science",3],
comms:["Align the dish and check the signal","science",2],drill:["Clear the drill bit","regolith",3],workshop:["Sweep up the regolith dust","parts",1],
algae:["Stir the algae tank","food",2],observatory:["Wipe the telescope dome","morale",2],gym:["Do a workout","health",2],pad:["Walk the pad for loose debris","parts",1]};
var NAME={mission:"Mission console"};

var EVA={egress:.25,ingress:.25,speed:2000,reserve:1,cap:8,walkMax:1};
function evaOn(){return !(window.__walkFast&&!window.__evaReal)}
function r1(x){return Math.round(x*10)/10}
function isOut(m){return !!OUT[m.kind]||m.kind==="stake"}
function dmOf(m){return m.dm||Math.max(40,Math.abs(m.wx+12)*3)}
function planOf(s,m,j){var w=W(s),tr=dmOf(m)/EVA.speed,tot=r1(EVA.egress+EVA.ingress+2*tr+j.cost),why="",wc=j.kind==="fix"?1:0;
var alive=s.crew.filter(function(c){return c.health>0&&!(c.away>0)});
if(alive.length<2){why="EVA is done in pairs. You need one more crew member who is home and well."}
else if(tr>EVA.walkMax){why="Too far for this game: the walk back would take "+r1(tr)+" h at 2 km/h. The game caps it at "+EVA.walkMax+" h, an invented conservative rule. NASA plans real EVA range around the walk back, but this 1 h cutoff is not a NASA figure."}
else if(tot+wc+EVA.reserve>EVA.cap){why="This sortie needs "+tot+(wc?" h (plus 1 h if you misdiagnose)":" h")+" plus the "+EVA.reserve+" h reserve, over the suit's "+EVA.cap+" h."}
else if(tot+wc>w.hours){why="The plan needs "+tot+" h"+(wc?" (up to "+(tot+wc)+" h if you misdiagnose)":"")+" but you have "+w.hours+" h left today."}
var su=null;if(!why&&window.__suit){su=window.__suit.project(s,tot+wc,j.kind);if(su.why){why=su.why}}
return{wc:wc,suit:su,total:tot,travel:r1(tr),dm:Math.round(dmOf(m)),task:j.cost,why:why,ok:!why,buddy:null,alive:alive.map(function(c){return c.name})}}
var cv,cx,panel,jobsEl,infoEl,hoursEl,msgEl,warnEl;
var P={x:-12,z:0,yaw:0,tgt:null,auto:false,act:null,prog:0,t:0,step:0,boost:100,jumpY:0,jumpV:0},keys={},npcs=[],lastT=0,wasStorm=false,fx=[],popups=[];
function S(){return window.__S?window.__S():null}
function E(){return window.TrainerEngine}
function W(s){s.flags=s.flags||{};var w=s.flags.walk;if(!w||w.sol!==s.sol){var storm=isStorm(s);w=s.flags.walk={sol:s.sol,hours:storm?STORM_DAY:DAY,done:{},exp:0,total:storm?STORM_DAY:DAY,jobs:(w&&w.jobs)||0}}return w}
function isStorm(s){return !!(s.stormActive||(s.story&&s.story.storm))}
function mods(s){
var out=[{kind:"mission",name:NAME.mission,idx:-1,done:true,damaged:false}];
s.buildings.forEach(function(b,i){var d=E().BUILDINGS?E().BUILDINGS[b.type]:null;out.push({kind:b.type,name:d?d.name:b.type,idx:i,done:b.done,damaged:!!b.damaged,solsLeft:b.solsLeft})});
var cnt={},tot={};out.forEach(function(m){tot[m.kind]=(tot[m.kind]||0)+1});out.forEach(function(m,i){m.x=150+i*150;m.wx=i*16;m.wz=(i%2===0?-9:9);m.rad=({habitat:4.6,medbay:4.6,gym:4.6,greenhouse:4.6,pad:8,shield:4.5,lab:4.5,solar:5.5}[m.kind]||3.5);cnt[m.kind]=(cnt[m.kind]||0)+1;if(tot[m.kind]>1){m.name=m.name+" "+cnt[m.kind]}});return out}
function missionYield(s){return Math.max(4,Math.round((s.objectiveScience/Math.max(1,s.objectiveSols))*0.9))}
function key(m){return m.idx}
function near(s,facing){var ms=mods(s),best=null,bd=99;ms.forEach(function(m){var dx=m.wx-P.x,dz=m.wz-P.z,d=Math.sqrt(dx*dx+dz*dz);if(d>m.rad+9||d>=bd){return}if(facing){var df=Math.atan2(dz,dx)-P.yaw;while(df>Math.PI){df-=6.2832}while(df<-Math.PI){df+=6.2832}if(Math.abs(df)>.8){return}}bd=d;best=m});return best}
function say(t){msgEl.textContent=t}
function jobFor(s,m){
var w=W(s),storm=isStorm(s);
if(m.kind==="mission"){return{kind:"mission",label:"Run a mission experiment (+"+missionYield(s)+" science)",cost:COST.mission,ok:w.exp<2,why:"Two experiments per sol is the most the instruments can do."}}
if(!m.done){return{kind:"none",label:"Under construction ("+m.solsLeft+" sol"+(m.solsLeft===1?"":"s")+" left)",cost:0,ok:false,why:"Not finished yet."}}
if(m.damaged){return{kind:"fix",label:"Patch the fault (3 to 5 parts)",cost:COST.fix,ok:true,why:""}}
var j=JOB[m.kind];if(!j){return{kind:"none",label:"Nothing to do here",cost:0,ok:false,why:""}}
if(w.done[key(m)]){return{kind:"chore",label:j[0],cost:0,ok:false,done:true,why:"Done for this sol."}}
if(storm&&OUT[m.kind]){return{kind:"chore",label:j[0],cost:COST.chore,ok:false,why:"Too dangerous outside during the storm."}}
return{kind:"chore",label:j[0],cost:COST.chore,ok:true,why:""}}
var planEl=null;
function hidePlan(){P.pend=null;if(planEl){planEl.hidden=true}}
function go(buddy){var p=P.pend;if(!p){return}if(p.plan.alive.indexOf(buddy)<0){buddy=p.plan.alive[0]}p.plan.buddy=buddy;P.act={m:p.m,j:p.j,plan:p.plan};P.prog=0;P.tgt=null;P.mini=null;hidePlan();say(p.j.label+"...");if(window.__suit&&p.plan&&!(window.__walkFast&&!window.__evaReal)){window.__suit.begin(P.act)}}
function propose(s,m,j){var pl=planOf(s,m,j);if(!pl.ok){say(pl.why);return}
P.pend={m:m,j:j,plan:pl};
if(window.__walkFast){go(pl.alive[0]);return}
var o="<b>EVA plan: "+esc2(j.label)+"</b> ("+esc2(m.name)+")<br>Egress "+EVA.egress+" h + walk out "+pl.travel+" h ("+pl.dm+" m at 2 km/h) + task "+pl.task+" h + walk back "+pl.travel+" h + ingress "+EVA.ingress+" h = <b>"+pl.total+" h</b> of your "+W(s).hours+" h left.<br>Time reserve kept: "+EVA.reserve+" h (real suits carry a reserve: the ISS suit keeps 30 min and the Artemis suit spec has 1 h of contingency). Walk-back check: on foot it takes "+pl.travel+" h, under this game's invented cap of "+EVA.walkMax+" h (NASA limits real range by the walk back, but the 1 h cap is the game's own rule). You and your buddy each take the full outside dose for every hour out; it is not split."+(window.__suit?window.__suit.planHtml(pl):"")+"<br><label>Your EVA buddy <select id='wkBuddy'>"+pl.alive.map(function(n){return"<option>"+esc2(n)+"</option>"}).join("")+"</select></label> <button type='button' id='wkGo'>Start EVA</button> <button type='button' id='wkNo'>Cancel</button><br><small>Simplified for play: distances are invented, walking is sped up, and the 8 working hours a sol are a game rule. Not a validated EVA timeline.</small>";
planEl.innerHTML=o;planEl.hidden=false;say("Review the EVA plan below, then press Start EVA.");
document.getElementById("wkGo").onclick=function(){go(document.getElementById("wkBuddy").value)};document.getElementById("wkNo").onclick=function(){hidePlan();say("EVA cancelled.")}}
function esc2(t){return String(t).replace(/&/g,"&amp;").replace(/</g,"&lt;")}
function lockMini(){var s=S(),q=P.mini;if(!s||!q){return}var hit=Math.abs(q.x-.5)<((P.act&&P.act.j&&P.act.j.tol)||.13);q.n++;if(hit){q.hits++}q.v+=.35;say((hit?"Good seat":"Missed the mark")+" ("+q.hits+" of "+q.n+").");
if(q.n>=3){var a=P.act;a.j.hits=q.hits;P.act=null;P.mini=null;P.prog=0;apply(s,a.m,a.j,a.plan)}}
function miniStep(dt){var q=P.mini||(P.mini={n:0,hits:0,x:0,d:1,v:reduce?.45:.9});q.x+=q.d*q.v*dt;if(q.x>=1){q.x=1;q.d=-1}if(q.x<=0){q.x=0;q.d=1}}
function start(){
var s=S();if(!s||s.over){return}
if(P.act&&P.mini){lockMini();return}
if(P.act&&P.act.plan){say("Finish this sortie first: answer the question on screen or wait for the task.");return}
if(P.pend){return}
var sv=window.__survey&&window.__survey.find(s,P.x,P.z,P.yaw);
if(sv){if(isStorm(s)){say("Too dangerous outside during the storm.");return}
return propose(s,{name:"fictional survey map",idx:-99,dm:sv.dm,kind:"stake",rad:3},{kind:"survey",label:"Survey reading at "+sv.name,cost:1,spot:sv.id})}
var m=near(s,true);if(!m){say("Walk up to a module and face it first.");return}
var j=jobFor(s,m),w=W(s);
if(!j.ok){say(j.why||"Nothing to do here.");return}
if(isOut(m)&&evaOn()&&(j.kind==="chore"||j.kind==="fix")){return propose(s,m,j)}
if(w.hours<j.cost){say("Not enough hours left today. Press Advance one sol to start a new day.");return}
if(j.kind==="fix"){}
P.act={m:m,j:j};P.prog=0;P.tgt=null;say(j.label+"...")}
function apply(s,m,j,plan){
var w=W(s),cost=(plan&&plan.total!=null)?plan.total:j.cost;w.hours=r1(w.hours-cost);w.jobs++;var E_=E();var msg="";
if(j.kind==="mission"){var y=missionYield(s);s.res.science+=y;s.totals.science=(s.totals.science||0)+y;w.exp++;msg="Experiment finished: +"+y+" science.";if(window.__lab){msg+=" "+window.__lab.reading(s)}}
else if(j.kind==="fix"){var before=s.res.parts;var ok=E_.repair(s,m.idx);if(!ok){w.hours=r1(w.hours+cost);w.jobs--;say("Not enough parts to patch it. Parts: "+Math.floor(s.res.parts));return}msg="Fault patched ("+(before-s.res.parts)+" parts).";if(j.hits!=null){var rf=Math.max(0,j.hits-1);if(rf){s.res.parts+=rf}msg+=" Steady hands: "+j.hits+" of 3 on the mark, "+rf+" part"+(rf===1?"":"s")+" saved."}}
else if(j.kind==="survey"){msg=window.__survey.take(s,j.spot)}
else{var d=JOB[m.kind],amt=d[2],urgent=(d[1]==="o2"||d[1]==="water"||d[1]==="food")&&s.res[d[1]]<40;if(urgent){amt*=2}
w.done[key(m)]=1;
if(d[1]==="morale"){s.crew.forEach(function(c){if(c.health>0){c.morale=Math.min(100,c.morale+amt)}});msg="Crew morale +"+amt+"."}
else if(d[1]==="health"){var lo=s.crew.filter(function(c){return c.health>0}).sort(function(a,b){return a.health-b.health})[0];if(lo){lo.health=Math.min(100,lo.health+amt)}msg="Health +"+amt+" for the crew member who needed it most."}
else if(d[1]==="science"){s.res.science+=amt;s.totals.science=(s.totals.science||0)+amt;msg="+"+amt+" science."}
else{s.res[d[1]]=(s.res[d[1]]||0)+amt;msg="+"+amt+" "+(d[1]==="o2"?"O₂":d[1])+(urgent?" (urgent, doubled).":".")}}
if(plan){var bd=s.crew.filter(function(c){return c.name===plan.buddy})[0];if(bd){bd.fatigue=Math.min(100,(bd.fatigue||0)+Math.round(plan.total*3))}
if(window.__lab&&window.__lab.evaDose){window.__lab.evaDose(s,plan.buddy,plan.total)}
msg+=" EVA "+plan.total+" h with "+(plan.buddy||"your buddy")+".";if(window.__suit&&plan.suit){msg+=window.__suit.finish(s,plan,j,{act:{ev:j.ev}})}}
s.log.unshift({sol:s.sol,msg:"Walk: "+j.label+(msg?" "+msg:"")});
if(window.__render){window.__render()}
say(msg+" "+w.hours+" hour"+(w.hours===1?"":"s")+" left today.");
for(var i=0;i<14;i++){fx.push({x:cv.width/2+(Math.random()*120-60),y:cv.height*.7,vx:Math.random()*4-2,vy:-2-Math.random()*3,l:1,c:j.kind==="fix"?"#ffd166":"#7be0a0"})}
popups.push({txt:msg.split(".")[0],x:cv.width/2,y:cv.height*0.55,l:1.0});
list()}
function abortEva(a,ev){var s=S(),w=W(s),pl=a.plan,tot=r1(EVA.egress+EVA.ingress+2*pl.travel+a.j.cost*.5);
P.act=null;P.mini=null;P.prog=0;w.hours=r1(Math.max(0,w.hours-tot));w.jobs++;
var bd=s.crew.filter(function(c){return c.name===pl.buddy})[0];if(bd){bd.fatigue=Math.min(100,(bd.fatigue||0)+Math.round(tot*3))}
if(window.__lab&&window.__lab.evaDose){window.__lab.evaDose(s,pl.buddy,tot)}
var msg=(ev?"EVA aborted after "+ev.t.charAt(0).toLowerCase()+ev.t.slice(1):"EVA called off because you left the walk view.")+" No task result. "+tot+" h spent with "+(pl.buddy||"your buddy")+".";
if(window.__suit){msg+=window.__suit.finish(s,pl,a.j,{act:a,abort:true,total:tot})}
s.log.unshift({sol:s.sol,msg:"Walk: "+a.j.label+" - "+msg});if(window.__render){window.__render()}
say(msg+" "+w.hours+" hour"+(w.hours===1?"":"s")+" left today.");list()}
function list(){
var s=S();if(!s||!jobsEl){return}if(window.__suit){window.__suit.refresh()}
var w=W(s),ms=mods(s);
hoursEl.innerHTML="<b>Hours left today: "+w.hours+" / "+w.total+"</b> &middot; Return window: sol "+s.sol+" of "+s.objectiveSols+" &middot; Mission science: "+Math.floor(s.res.science)+" / "+s.objectiveScience;
var h="";
ms.forEach(function(m){var j=jobFor(s,m);if(j.kind==="none"){return}
var lab=(j.done?"\u2713 ":"")+m.name+": "+j.label+(j.cost?" ("+j.cost+" h"+(isOut(m)&&evaOn()&&j.kind!=="mission"?" + EVA":"")+")":"");
h+='<button type="button" class="wkJob'+(j.kind==="fix"?" wkFix":"")+(j.kind==="mission"?" wkMis":"")+'" data-i="'+m.idx+'"'+((j.ok&&w.hours>=j.cost)?"":" disabled")+'>'+lab.replace(/&/g,"&amp;").replace(/</g,"&lt;")+'</button>'});
jobsEl.innerHTML=h;
jobsEl.querySelectorAll(".wkJob").forEach(function(b){b.onclick=function(){var i=parseInt(b.dataset.i,10);var m=mods(S()).filter(function(x){return x.idx===i})[0];if(P.act&&P.act.plan){say("Finish this sortie first.");return}if(m){P.tgt=m;P.auto=true;say("Walking to "+m.name+"...")}}});
var fc=E().forecast?E().forecast(s,1):null;
var warn=isStorm(s)?"STORM: outdoor jobs are unsafe and the day is shorter. Stay inside and keep the lights on.":(fc&&fc.id==="storm"?"Storm warning for next sol: finish outdoor jobs now and make sure shielding is ready.":"");
warnEl.textContent=warn;warnEl.hidden=!warn;
var res=s.res,chips=[["O₂",res.o2,60],["Water",res.water,60],["Food",res.food,40],["Parts",res.parts,10]];
infoEl.innerHTML=chips.map(function(c){var v=Math.floor(c[1]),cl=v<c[2]*0.6?"lo":(v<c[2]?"mid":"ok");return'<span class="wkChip '+cl+'">'+c[0]+" "+v+"</span>"}).join("")}

var EYE=1.7,HZ0=.5,SUN=(function(){var v=[-.55,.28,.78],l=Math.sqrt(v[0]*v[0]+v[1]*v[1]+v[2]*v[2]);return[v[0]/l,v[1]/l,v[2]/l]})();
var rocks=null,craters=null,stars=null;
function rng(seed){var s=seed;return function(){s=(s*1664525+1013904223)%4294967296;return s/4294967296}}
function initWorld(){if(rocks){return}var r=rng(7);rocks=[];craters=[];stars=[];
for(var i=0;i<260;i++){rocks.push({x:-40+r()*420,z:-70+r()*140,s:.15+r()*r()*1.1})}
for(var k=0;k<34;k++){craters.push({x:-30+r()*420,z:-60+r()*120,r:2+r()*7})}
for(var q=0;q<90;q++){stars.push({u:r(),v:r()*.9,b:.3+r()*.7})}}
function hex(c){return[parseInt(c.slice(1,3),16),parseInt(c.slice(3,5),16),parseInt(c.slice(5,7),16)]}
var FOGC=[24,32,52];
function fogOf(d,storm){var k=Math.min(1,Math.pow(d/(storm?38:120),1.3));return k}
function shade(rgb,k,fog,sky){var f=sky||FOGC;return"rgb("+Math.round((rgb[0]*k)*(1-fog)+f[0]*fog)+","+Math.round((rgb[1]*k)*(1-fog)+f[1]*fog)+","+Math.round((rgb[2]*k)*(1-fog)+f[2]*fog)+")"}
var cw=640,ch=360,F=500,HZ=180,cosY=1,sinY=0;
function pr(x,y,z){var dx=x-P.x,dz=z-P.z,d=dx*cosY+dz*sinY;if(d<.35){return null}var l=-dx*sinY+dz*cosY;return{x:cw/2+l*F/d,y:HZ-(y-EYE)*F/d,d:d}}
function polyP(pts,fill,alpha){var o=[];for(var i=0;i<pts.length;i++){var p=pr(pts[i][0],pts[i][1],pts[i][2]);if(!p){return null}o.push(p)}
cx.beginPath();cx.moveTo(o[0].x,o[0].y);for(var j=1;j<o.length;j++){cx.lineTo(o[j].x,o[j].y)}cx.closePath();if(alpha!==undefined){cx.globalAlpha=alpha}cx.fillStyle=fill;cx.fill();cx.globalAlpha=1;return o}
function lit(n){return .28+.72*Math.max(0,n[0]*SUN[0]+n[1]*SUN[1]+n[2]*SUN[2])}
function dist(x,z){return Math.sqrt((x-P.x)*(x-P.x)+(z-P.z)*(z-P.z))}
function box(x,y,z,w,dp,h,rgb,storm,al){
var hw=w/2,hd=dp/2,d0=dist(x,z);
var V=[[x-hw,y,z-hd],[x+hw,y,z-hd],[x+hw,y,z+hd],[x-hw,y,z+hd],[x-hw,y+h,z-hd],[x+hw,y+h,z-hd],[x+hw,y+h,z+hd],[x-hw,y+h,z+hd]];
var F6=[[[0,1,5,4],[0,0,-1]],[[1,2,6,5],[1,0,0]],[[2,3,7,6],[0,0,1]],[[3,0,4,7],[-1,0,0]],[[4,5,6,7],[0,1,0]]];
F6.forEach(function(f){var n=f[1];var cxn=x+n[0]*hw,czn=z+n[2]*hd;if((P.x-cxn)*n[0]+(P.z-czn)*n[2]<0&&n[1]===0){return}if(n[1]===1&&P.x===x){}
polyP(f[0].map(function(i){return V[i]}),shade(rgb,lit(n),fogOf(d0,storm)),al)})}
function face(x,y,z,w,h,side,rgb,storm,al){
var d0=dist(x,z),c=rgb;var p;
if(side==="n"){p=[[x-w/2,y,z],[x+w/2,y,z],[x+w/2,y+h,z],[x-w/2,y+h,z]]}else if(side==="s"){p=[[x-w/2,y,z],[x+w/2,y,z],[x+w/2,y+h,z],[x-w/2,y+h,z]]}else if(side==="w"){p=[[x,y,z-w/2],[x,y,z+w/2],[x,y+h,z+w/2],[x,y+h,z-w/2]]}
polyP(p,"rgb("+Math.round(c[0]*(1-fogOf(d0,storm)*.6))+","+Math.round(c[1]*(1-fogOf(d0,storm)*.6))+","+Math.round(c[2]*(1-fogOf(d0,storm)*.6))+")",al)}
function dome(x,z,r,rgb,storm,al,rings){
var d0=dist(x,z),seg=14,rn=rings||5,quads=[];
for(var a=0;a<rn;a++){var t0=a/rn*Math.PI/2,t1=(a+1)/rn*Math.PI/2;
for(var s=0;s<seg;s++){var p0=s/seg*6.2832,p1=(s+1)/seg*6.2832;
var P4=[[x+r*Math.cos(t0)*Math.cos(p0),r*Math.sin(t0),z+r*Math.cos(t0)*Math.sin(p0)],[x+r*Math.cos(t0)*Math.cos(p1),r*Math.sin(t0),z+r*Math.cos(t0)*Math.sin(p1)],[x+r*Math.cos(t1)*Math.cos(p1),r*Math.sin(t1),z+r*Math.cos(t1)*Math.sin(p1)],[x+r*Math.cos(t1)*Math.cos(p0),r*Math.sin(t1),z+r*Math.cos(t1)*Math.sin(p0)]];
var pm=(p0+p1)/2,tm=(t0+t1)/2,n=[Math.cos(tm)*Math.cos(pm),Math.sin(tm),Math.cos(tm)*Math.sin(pm)];
if(n[1]<.95&&(P.x-x)*n[0]+(P.z-z)*n[2]<-r*.2*Math.cos(tm)*0){}
var cxm=x+r*n[0],czm=z+r*n[2];if((P.x-cxm)*n[0]+(P.z-czm)*n[2]<0&&dist(x,z)>r){continue}
quads.push({P:P4,n:n,dd:dist(cxm,czm),a:a,s:s})}}
quads.sort(function(u,v){return v.dd-u.dd});
quads.forEach(function(q){var base=shade(rgb,lit(q.n),fogOf(d0,storm));var o=polyP(q.P,base,al);
if(o&&q.a===1&&(q.s===1||q.s===5||q.s===9)&&!storm){polyP([[q.P[0][0],q.P[0][1]+.1,q.P[0][2]],[q.P[1][0],q.P[1][1]+.1,q.P[1][2]],[q.P[2][0],q.P[2][1]-.1,q.P[2][2]],[q.P[3][0],q.P[3][1]-.1,q.P[3][2]]],"rgb(255,214,120)",1)}})}
function disk(x,y,z,r,tilt,rot,rgb,storm){var d0=dist(x,z),pts=[];for(var i=0;i<16;i++){var a=i/16*6.2832+rot,lx=Math.cos(a)*r,lz=Math.sin(a)*r;pts.push([x+lx,y+Math.sin(tilt)*lz*.6+Math.cos(tilt)*0,z+lz*Math.cos(tilt)])}polyP(pts,shade(rgb,.9,fogOf(d0,storm)))}
function shadow(m,x,z,r,h,storm){
var L=h*2.2,dx=-SUN[0],dz=-SUN[2],n=Math.sqrt(dx*dx+dz*dz);dx/=n;dz/=n;
var seg=10,fp=[],sp=[];for(var i=0;i<seg;i++){var a=i/seg*6.2832;var px=x+Math.cos(a)*r,pz=z+Math.sin(a)*r;fp.push([px,0,pz]);sp.push([px+dx*L,0,pz+dz*L])}
cx.fillStyle="rgba(0,0,0,"+(storm?.18:.38)+")";
for(var j=0;j<seg;j++){var k=(j+1)%seg;polyP([fp[j],fp[k],sp[k],sp[j]],"rgba(0,0,0,"+(storm?.18:.38)+")")}polyP(fp,"rgba(0,0,0,.4)")}
function drawMod(m,s,storm,t){
var x=m.wx,z=m.wz,col=hex(COL[m.kind]||"#999"),k=m.kind,d0=dist(x,z);
if(d0<1.2){return}
var al=m.done?1:.4,h=3;
var big=(k==="habitat"||k==="medbay"||k==="gym"||k==="greenhouse");
if(big){h=4.2;shadow(m,x,z,4.2,4.2,storm)}else if(k==="solar"){shadow(m,x,z,3,3,storm)}else if(k==="comms"||k==="drill"||k==="observatory"){shadow(m,x,z,1.5,6,storm)}else{shadow(m,x,z,2.5,3,storm)}
switch(k){
case"habitat":case"medbay":case"gym":dome(x,z,4.2,col,storm,al);box(x-2.2,0,z+4,2,1.5,2.2,[70,75,90],storm,al);if(k==="medbay"){box(x,4.2,z,.5,.5,1.2,[220,50,50],storm,al)}break;
case"greenhouse":for(var i=-2;i<3;i++){var sw=reduce?0:Math.sin(t*1.4+i)*.12;box(x+i*1.3+sw,0,z+(i%2)*1.2,.35,.35,1.2+((i+3)%3)*.3,[60,170,80],storm,1)}dome(x,z,4.2,[110,215,140],storm,.45);break;
case"solar":box(x,0,z,.3,.3,2.6,[90,90,100],storm,al);var tp=reduce?0:Math.sin(t*.3)*.05;polyP([[x-4,2.2,z-1.8],[x+4,2.2,z-1.8],[x+4,3.7+tp,z+1.8],[x-4,3.7+tp,z+1.8]],shade(hex("#2f6fd6"),.55+.45*Math.max(0,.9-Math.abs(SUN[1]-.3)),fogOf(d0,storm)),al);
for(var g=-3;g<4;g++){polyP([[x+g-.03,2.2,z-1.8],[x+g+.03,2.2,z-1.8],[x+g+.03,3.7,z+1.8],[x+g-.03,3.7,z+1.8]],"rgba(210,225,255,.35)")}break;
case"comms":case"observatory":if(k==="observatory"){dome(x,z,3,col,storm,al,4);polyP([[x-.4,0.2,z-3],[x+.4,.2,z-3],[x+.4,3,z-3],[x-.4,3,z-3]],"rgb(10,14,24)")}else{box(x,0,z,.4,.4,3.2,[110,115,125],storm,al);disk(x,3.4,z,2.4,.9,reduce?0:t*.6,[215,220,230],storm);box(x,3.4,z,.25,.25,1.6,[90,90,95],storm,al)}break;
case"drill":box(x,0,z,.9,.9,7,[110,110,115],storm,al);var dy=reduce?0:Math.abs(Math.sin(t*3))*1.4;box(x,3-dy,z,2.2,2.2,1.6,col,storm,al);box(x,0,z,.25,.25,3-dy,[220,220,225],storm,1);break;
case"rtg":box(x,0,z,1.8,1.8,2.2,[190,160,60],storm,al);for(var f=-1;f<2;f++){box(x+f*.7,2.2,z,.1,2,.9,[150,130,50],storm,al)}break;
case"battery":box(x,0,z,3.5,2.2,1.6,col,storm,al);box(x,1.6,z,2.5,1.2,.3,[150,140,230],storm,al);break;
case"lab":box(x,0,z,6,5,3,col,storm,al);box(x+3.01,.8,z,.1,3,1.4,[10,16,28],storm,1);break;
case"watermine":box(x,0,z,4,3,2.6,col,storm,al);box(x+1,2.6,z,.7,.7,2+(reduce?0:Math.abs(Math.sin(t*2))*1.4),[200,205,220],storm,al);break;
case"o2gen":case"scrubber":case"recycler":case"algae":box(x,0,z,4.5,3,2.8,col,storm,al);box(x-1.2,2.8,z,1.4,1.4,1.6,[215,222,232],storm,al);break;
case"pad":box(x,0,z,12,12,.25,[88,92,102],storm,al);polyP([[x-3,.27,z-.4],[x+3,.27,z-.4],[x+3,.27,z+.4],[x-3,.27,z+.4]],"rgba(240,240,240,.8)");break;
case"shield":for(var b=-2;b<3;b++){box(x+b*1.6,0,z,1.5,1.2,1.2+(b%2?0:.5),[130,134,142],storm,al)}break;
case"workshop":box(x,0,z,5,4,3,col,storm,al);box(x+1.5,3,z,.8,.8,2,[90,90,95],storm,al);break;
case"mission":box(x,0,z,6,4,3,[40,60,95],storm,al);for(var bb=0;bb<6;bb++){var bh=reduce?.6:.3+Math.abs(Math.sin(t*2+bb))*1.0;box(x-2.1+bb*.8,1.6,z-2.05,.5,.1,bh,[111,211,255],storm,1)}polyP([[x-2.8,.9,z-2.04],[x+2.8,.9,z-2.04],[x+2.8,2.6,z-2.04],[x-2.8,2.6,z-2.04]],"rgba(10,30,50,.6)");polyP([[x-3.02,.4,z-2],[x-3.02,.4,z+2],[x-3.02,2.6,z+2],[x-3.02,2.6,z-2]],"rgba(111,211,255,.35)");break;
default:box(x,0,z,4.5,3.5,3,col,storm,al)}
if(!m.done){var top=pr(x,h+1,z);if(top){cx.strokeStyle="#ffd166";cx.setLineDash([4,3]);cx.strokeRect(top.x-60*F/500/ (top.d/10),top.y,120*F/500/(top.d/10),60*F/500/(top.d/10));cx.setLineDash([])}}
var lab=pr(x,h+2.2,z),st=S();
if(m.damaged&&lab){var bk=reduce||Math.sin(t*8)>0;if(bk){var l2=pr(x,h+.8,z);if(l2){cx.fillStyle="rgba(255,70,70,.9)";cx.beginPath();cx.arc(l2.x,l2.y,Math.max(3,60/l2.d),0,6.3);cx.fill()}}
if(!reduce){for(var sp=0;sp<4;sp++){var ph=Math.abs((t*.6+sp*.25)%1),sm=pr(x+(sp-1.5)*.3,h+ph*5,z);if(sm){cx.fillStyle="rgba(150,150,150,"+(.5*(1-ph))+")";cx.beginPath();cx.arc(sm.x,sm.y,(.5+ph*1.4)*F/sm.d/2,0,6.3);cx.fill()}}}}
if(lab&&m.done&&!m.damaged&&st){var avail=(k==="mission"?W(st).exp<2:(JOB[k]&&!W(st).done[key(m)]&&!(isStorm(st)&&OUT[k])));if(avail){var by=reduce?0:Math.sin(t*3)*.25;var mk=pr(x,h+1.6+by,z);if(mk){var sz=Math.max(4,.5*F/mk.d);cx.fillStyle=k==="mission"?"#6fd3ff":"#7be0a0";cx.beginPath();cx.moveTo(mk.x,mk.y);cx.lineTo(mk.x-sz,mk.y-sz*1.6);cx.lineTo(mk.x+sz,mk.y-sz*1.6);cx.fill()}}}
if(lab&&d0<42){cx.fillStyle="rgba(232,242,255,"+(1-d0/42)+")";cx.font=Math.max(10,Math.min(15,220/lab.d*1))+"px Verdana";cx.textAlign="center";cx.fillText(m.name,lab.x,lab.y);cx.textAlign="left"}}
function drawAstro(sx,gy,scale,suit,vis,work){
cx.save();cx.translate(sx,gy);cx.scale(scale,scale);
cx.fillStyle="rgba(0,0,0,.3)";cx.beginPath();cx.ellipse(0,0,14,3,0,0,6.3);cx.fill();
cx.fillStyle="#cfd5e0";cx.fillRect(-7,-18,6,18);cx.fillRect(1,-18,6,18);
cx.fillStyle=suit;cx.fillRect(-10,-42,20,26);cx.fillStyle="#889";cx.fillRect(-13,-40,4,18);cx.fillRect(9,-38,4,16);
cx.beginPath();cx.arc(0,-50,11,0,6.3);cx.fill();cx.fillStyle=vis;cx.beginPath();cx.ellipse(0,-50,7,6,0,0,6.3);cx.fill();cx.restore()}
function drawNpcs(s,ms,dt,storm){
var crew=s.crew.filter(function(c,i){return c.health>0&&i>0});
while(npcs.length<Math.min(3,crew.length)){var i=npcs.length;npcs.push({x:ms[1]?ms[1].wx+3:20,z:ms[1]?ms[1].wz+4:4,tx:null,wait:Math.random()*3,step:0,col:["#ffb49a","#a9e5a2","#ffe27a"][i%3]})}
var out=[];
npcs.forEach(function(n){
if(n.wait>0){n.wait-=dt}else if(n.tx===null){var m=ms[Math.floor(Math.random()*ms.length)];n.tx=m.wx+(Math.random()*6-3);n.tz=m.wz+(Math.random()*6-3)+5;n.wait=0}
else{var dx=n.tx-n.x,dz=n.tz-n.z,d=Math.sqrt(dx*dx+dz*dz);if(d<.5){n.tx=null;n.wait=2+Math.random()*4}else{n.x+=dx/d*1.4*dt;n.z+=dz/d*1.4*dt;n.step+=dt*(reduce?0:8)}}
var p=pr(n.x,0,n.z);if(p&&p.d>1.5){out.push({p:p,n:n})}});
return out}
function drawFP(now){
var s=S();if(!s||!cv||!cv.offsetParent){return}
initWorld();cw=cv.width;ch=cv.height;F=cw*.6;HZ=ch*.5;
var storm=isStorm(s),ms=mods(s);
var dt=lastT?Math.min(.05,(now-lastT)/1000):0;lastT=now;P.t+=dt;
var turn=(keys.r?1:0)-(keys.l?1:0),fwd=(keys.u?1:0)-(keys.d?1:0);
var boosting=keys.boost&&P.boost>5&&(turn||fwd);
if(boosting){P.boost=Math.max(0,P.boost-35*dt)}else{P.boost=Math.min(100,P.boost+22*dt)}
var sp=(storm?2.2:3.4)*(boosting?2.15:1);
if(P.act&&P.act.plan&&(turn||fwd)){turn=0;fwd=0}
if(turn||fwd){P.tgt=null;P.auto=false;P.act=null;P.mini=null;if(P.pend){hidePlan()}}
if(P.tgt){var dx=P.tgt.wx-P.x,dz=P.tgt.wz-P.z,dd=Math.sqrt(dx*dx+dz*dz),want=Math.atan2(dz,dx),df=want-P.yaw;while(df>Math.PI){df-=6.2832}while(df<-Math.PI){df+=6.2832}
P.yaw+=Math.max(-3*dt,Math.min(3*dt,df));
if(Math.abs(df)<.35){if(dd>P.tgt.rad+7){fwd=1}else{P.tgt=null;if(P.auto){P.auto=false;start()}}}}
P.yaw+=turn*1.9*dt;cosY=Math.cos(P.yaw);sinY=Math.sin(P.yaw);
if(fwd){var nx=P.x+cosY*sp*dt*fwd,nz=P.z+sinY*sp*dt*fwd;var ok=true;ms.forEach(function(m){if(dist2(nx,nz,m.wx,m.wz)<m.rad+0.8){ok=false}});if(!ok&&P.tgt){var offs=[.8,-.8,1.4,-1.4,1.9,-1.9];for(var oi=0;oi<offs.length&&!ok;oi++){var ax=P.x+Math.cos(P.yaw+offs[oi])*sp*dt,az=P.z+Math.sin(P.yaw+offs[oi])*sp*dt,ok2=true;ms.forEach(function(m){var dn=dist2(ax,az,m.wx,m.wz);if(dn<m.rad+0.8&&dn<dist2(P.x,P.z,m.wx,m.wz)+0.002){ok2=false}});if(ok2){nx=ax;nz=az;ok=true}}}
if(ok){P.x=nx;P.z=nz}P.step+=dt*(reduce?0:8)}
if(P.act&&P.act.paused){}else if(P.act){if(P.act.j.kind==="fix"&&!window.__walkFast){miniStep(dt)}else{P.prog+=window.__walkFast?1:dt/1.1;if(P.act.plan&&window.__suit&&!P.act.chk&&P.act.j.kind!=="fix"&&(P.prog>=.5||window.__walkFast)&&!(window.__walkFast&&!window.__evaReal)){P.act.chk=1;window.__suit.mid(P.act)}if(P.act&&!P.act.paused&&P.prog>=1){var a=P.act;P.act=null;P.prog=0;apply(s,a.m,a.j,a.plan)}}}
if(storm!==wasStorm){wasStorm=storm;list()}
var grav=(s.site==="mars")?9.2:5.2;if(P.jumpY>0||P.jumpV!==0){P.jumpY+=P.jumpV*dt;if(P.jumpY>0){P.jumpV-=grav*dt}else{P.jumpY=0;P.jumpV=0}}
var bob=((!reduce&&fwd)?Math.sin(P.step)*3:0)+P.jumpY*26;HZ=ch*.5+bob;
var t=P.t;

var sky=cx.createLinearGradient(0,0,0,HZ);var mars=s.site==="mars";
if(storm){sky.addColorStop(0,"#2a1f1c");sky.addColorStop(1,mars?"#8a5236":"#3a3a44")}else{sky.addColorStop(0,mars?"#2a1a2e":"#02040a");sky.addColorStop(1,mars?"#b96a44":"#1d2a48")}
cx.fillStyle=sky;cx.fillRect(0,0,cw,ch);
var base=Math.sin(P.yaw)*.5;
if(!storm){stars.forEach(function(st){var sx=((st.u*cw*3-P.yaw*cw*.55)%(cw*3)+cw*3)%(cw*3);if(sx>cw){return}cx.globalAlpha=st.b*(reduce?1:.6+.4*Math.sin(t*2+st.v*40));cx.fillStyle="#fff";cx.fillRect(sx,st.v*HZ,1.5,1.5)});cx.globalAlpha=1;
var sunx=cw/2+((Math.atan2(SUN[2],SUN[0])-P.yaw+Math.PI*3)%(6.2832)-Math.PI)*F*.9,suny=HZ-HZ*.28;
var sg=cx.createRadialGradient(sunx,suny,2,sunx,suny,90);sg.addColorStop(0,"rgba(255,250,230,.95)");sg.addColorStop(.15,"rgba(255,240,200,.35)");sg.addColorStop(1,"rgba(255,240,200,0)");cx.fillStyle=sg;cx.fillRect(sunx-90,suny-90,180,180);
var ex=((((-.5-P.yaw)+Math.PI*3)%6.2832)-Math.PI)*F*.9+cw/2;cx.fillStyle="rgb(70,120,220)";cx.beginPath();cx.arc(ex,HZ*.45,16,0,6.3);cx.fill();cx.fillStyle="rgba(255,255,255,.3)";cx.beginPath();cx.arc(ex-5,HZ*.45-5,7,0,6.3);cx.fill()}

cx.fillStyle="#2c3044";cx.beginPath();cx.moveTo(0,HZ);for(var rx=0;rx<=cw;rx+=20){cx.lineTo(rx,HZ-6-8*Math.sin(rx*.013+P.yaw*3)-5*Math.sin(rx*.04+1.3))}cx.lineTo(cw,HZ);cx.fill();
var gg=cx.createLinearGradient(0,HZ,0,ch);gg.addColorStop(0,mars?"#6a3b2c":"#3b3f4f");gg.addColorStop(.35,mars?"#7f4631":"#5a5e6c");gg.addColorStop(1,mars?"#93523a":"#6e7280");cx.fillStyle=gg;cx.fillRect(0,HZ,cw,ch-HZ);

craters.forEach(function(c){var ring=[],ok=true;for(var i=0;i<14;i++){var a=i/14*6.2832;var p=pr(c.x+Math.cos(a)*c.r,0,c.z+Math.sin(a)*c.r);if(!p){ok=false;break}ring.push(p)}
if(!ok){return}cx.beginPath();cx.moveTo(ring[0].x,ring[0].y);for(var j=1;j<ring.length;j++){cx.lineTo(ring[j].x,ring[j].y)}cx.closePath();cx.fillStyle="rgba(0,0,0,.16)";cx.fill();cx.strokeStyle="rgba(255,255,255,.07)";cx.lineWidth=1;cx.stroke()});

var items=[];
rocks.forEach(function(r){var d=dist(r.x,r.z);if(d<1.5||d>110){return}var dx=r.x-P.x,dz=r.z-P.z;var dep=dx*cosY+dz*sinY;if(dep<.4){return}items.push({d:d,t:"r",r:r})});
ms.forEach(function(m){var d=dist(m.wx,m.wz);items.push({d:d,t:"m",m:m})});
if(window.__survey){window.__survey.spots(s).forEach(function(o){items.push({d:dist(o.x,o.z),t:"s",o:o})})}
var npcl=drawNpcs(s,ms,dt,storm);npcl.forEach(function(o){items.push({d:o.p.d,t:"n",o:o})});
items.sort(function(a,b){return b.d-a.d});
items.forEach(function(it){
if(it.t==="r"){var p=pr(it.r.x,0,it.r.z);if(!p){return}var rr=Math.max(1,it.r.s*F/p.d),f=fogOf(it.d,storm);cx.fillStyle=shade([70,72,82],1,f);cx.beginPath();cx.ellipse(p.x,p.y-rr*.3,rr,rr*.6,0,0,6.3);cx.fill();cx.fillStyle="rgba(0,0,0,.3)";cx.beginPath();cx.ellipse(p.x+rr*.7,p.y,rr*1.2,rr*.25,0,0,6.3);cx.fill()}
else if(it.t==="m"){drawMod(it.m,s,storm,t)}
else if(it.t==="s"){window.__survey.draw(it.o,cx,pr,F,fogOf,storm,t,s)}
else{var o=it.o,sc=(1.8*F/o.p.d)/72;drawAstro(o.p.x,o.p.y,sc,o.n.col,"#334",false)}});

if(storm){cx.fillStyle="rgba(120,80,50,.22)";cx.fillRect(0,0,cw,ch);if(!reduce){cx.strokeStyle="rgba(235,205,170,.4)";cx.lineWidth=1;for(var d2=0;d2<70;d2++){var px=((d2*71+t*520)%(cw+80))-40,py=(d2*37+t*50)%ch;cx.beginPath();cx.moveTo(cw-px,py);cx.lineTo(cw-px-30-d2%20,py+3);cx.stroke()}}}

for(var q=fx.length-1;q>=0;q--){var f=fx[q];f.x+=f.vx;f.y+=f.vy;f.vy+=.1;f.l-=.025;if(f.l<=0){fx.splice(q,1);continue}cx.globalAlpha=f.l;cx.fillStyle=f.c;cx.fillRect(f.x,f.y,4,4)}cx.globalAlpha=1;

var vg=cx.createRadialGradient(cw/2,ch/2,Math.min(cw,ch)*.34,cw/2,ch/2,Math.max(cw,ch)*.75);vg.addColorStop(0,"rgba(0,0,0,0)");vg.addColorStop(1,"rgba(0,0,0,.72)");cx.fillStyle=vg;cx.fillRect(0,0,cw,ch);
cx.strokeStyle="#0c0f18";cx.lineWidth=24;cx.beginPath();cx.moveTo(18,ch*.78);cx.quadraticCurveTo(-14,ch*.5,18,ch*.2);cx.quadraticCurveTo(cw/2,-ch*.1,cw-18,ch*.2);cx.quadraticCurveTo(cw+14,ch*.5,cw-18,ch*.78);cx.quadraticCurveTo(cw/2,ch*1.12,18,ch*.78);cx.stroke();
cx.lineWidth=3;cx.strokeStyle="rgba(120,200,255,.25)";cx.beginPath();cx.moveTo(44,ch*.74);cx.quadraticCurveTo(14,ch*.5,44,ch*.24);cx.stroke();
var rg=cx.createLinearGradient(0,0,cw,ch);rg.addColorStop(0,"rgba(255,255,255,.07)");rg.addColorStop(.4,"rgba(255,255,255,0)");cx.fillStyle=rg;cx.fillRect(0,0,cw,ch);

var wk=P.act&&!reduce?Math.sin(t*14)*8:0,hy=ch-(P.act?96:62)+bob*2;
function glove(gx,gy){cx.fillStyle="#d9dde6";cx.beginPath();cx.ellipse(gx,gy,30,22,0,0,6.3);cx.fill();cx.fillStyle="#aab0be";cx.fillRect(gx-26,gy+8,52,6);cx.fillStyle="#c4c9d6";cx.beginPath();cx.arc(gx-14,gy-12,6,0,6.3);cx.arc(gx,gy-17,6,0,6.3);cx.arc(gx+14,gy-12,6,0,6.3);cx.fill()}
glove(cw*.28,hy+wk);glove(cw*.72,hy-wk);
if(P.act&&!reduce){cx.save();cx.strokeStyle=P.act.j.kind==="fix"?"rgba(255,209,102,0.85)":"rgba(111,211,255,0.85)";cx.lineWidth=3+Math.sin(t*30)*1.5;cx.beginPath();cx.moveTo(cw*.72-10,hy-wk-10);cx.lineTo(cw/2+Math.sin(t*22)*8,HZ+Math.cos(t*19)*6);cx.stroke();cx.fillStyle="#fff";cx.beginPath();cx.arc(cw/2+Math.sin(t*22)*8,HZ+Math.cos(t*19)*6,4+Math.random()*3,0,6.28);cx.fill();cx.restore()}
for(var pi=popups.length-1;pi>=0;pi--){var pp=popups[pi];pp.y-=42*dt;pp.l-=0.75*dt;if(pp.l<=0){popups.splice(pi,1);continue}cx.save();cx.globalAlpha=Math.min(1,pp.l*1.4);cx.font="bold 16px Verdana";cx.fillStyle="#5eead4";cx.textAlign="center";cx.fillText(pp.txt,pp.x,pp.y);cx.restore()}
cx.fillStyle="rgba(8,16,32,0.65)";cx.fillRect(cw*0.3,10,cw*0.4,20);cx.strokeStyle="rgba(111,211,255,0.4)";cx.strokeRect(cw*0.3,10,cw*0.4,20);
ms.forEach(function(m){var ang=Math.atan2(m.wz-P.z,m.wx-P.x)-P.yaw;while(ang>Math.PI){ang-=6.2832}while(ang<-Math.PI){ang+=6.2832}if(Math.abs(ang)<1.2){var bx=cw*0.5+(ang/1.2)*(cw*0.19);cx.fillStyle=m.damaged?"#ff6b6b":(m.kind==="mission"?"#6fd3ff":"#7be0a0");cx.fillRect(bx-2,14,4,12)}});

var w=W(s);cx.font="bold 13px Verdana";cx.fillStyle="rgba(111,211,255,.9)";cx.fillText("HRS "+w.hours+"/"+w.total,cw*.12,34);cx.fillText("SOL "+s.sol+"/"+s.objectiveSols,cw*.12,52);cx.fillText("BOOST "+Math.round(P.boost)+"%",cw*.12,70);cx.textAlign="right";cx.fillText("SCI "+Math.floor(s.res.science)+"/"+s.objectiveScience,cw*.88,34);cx.fillText("O₂ "+Math.floor(s.res.o2),cw*.88,52);cx.textAlign="left";

cx.strokeStyle="rgba(255,255,255,.5)";cx.lineWidth=1;cx.beginPath();cx.moveTo(cw/2-8,HZ);cx.lineTo(cw/2+8,HZ);cx.moveTo(cw/2,HZ-8);cx.lineTo(cw/2,HZ+8);cx.stroke();
if(P.act&&P.mini){var q=P.mini,bx=cw/2-110,by=ch*.6;cx.fillStyle="rgba(0,0,0,.65)";cx.fillRect(bx-6,by-22,232,52);cx.fillStyle="#2b3350";cx.fillRect(bx,by,220,14);cx.fillStyle="#3fbf7a";cx.fillRect(bx+220*.37,by,220*.26,14);cx.fillStyle="#fff";cx.fillRect(bx+220*q.x-2,by-4,4,22);cx.font="12px Verdana";cx.textAlign="center";cx.fillStyle="#cfe6ff";cx.fillText("Seat the patch: press E when the bar is in the green ("+q.n+"/3)",cw/2,by-8);cx.textAlign="left"}
else if(P.act){cx.fillStyle="rgba(0,0,0,.6)";cx.fillRect(cw/2-70,ch*.62,140,10);cx.fillStyle="#7be0a0";cx.fillRect(cw/2-70,ch*.62,140*Math.min(1,P.prog),10)}
var nm=near(s,true);var txt="";
if(nm&&!P.act){var j=jobFor(s,nm);txt=nm.name+": "+(j.kind==="none"?j.label:(j.ok?j.label+"  [E / Space]":(j.why||j.label)))}else if(!P.act){var any=near(s,false);if(any){txt="Turn to face "+any.name+" (arrow keys or A and D)"}}
if(!txt&&!P.act&&!P.pend&&window.__survey){var svp=window.__survey.prompt(s,P.x,P.z,P.yaw);if(svp){txt=svp}}
if(txt){cx.fillStyle="rgba(0,0,0,.62)";cx.fillRect(cw*.1,ch*.84,cw*.8,24);cx.fillStyle="#fff";cx.font="13px Verdana";cx.textAlign="center";cx.fillText(txt,cw/2,ch*.84+16);cx.textAlign="left"}}
function dist2(a,b,c,d){return Math.sqrt((a-c)*(a-c)+(b-d)*(b-d))}
function loop(now){drawFP(now);requestAnimationFrame(loop)}

function build(){
var g=$("game");if(!g||$("walkPanel")){return}
panel=document.createElement("section");panel.id="walkPanel";panel.className="panel v-mission";panel.setAttribute("data-feat","walk");
panel.innerHTML='<h2>Walk the base</h2><p class="hint">You are the astronaut, seen through your own helmet. Turn with the left and right arrows (or A and D), walk with the up and down arrows (or W and S) or the on-screen buttons, face a module and press E, or tap a job to be walked there. Every job spends hours from a short working day. Everyday jobs keep the base alive. The mission needs hours too: reach the science goal before the return window closes.</p>'+
'<div id="wkHours"></div><div id="wkWarn" class="wkWarn" hidden></div><div id="wkInfo"></div>'+
'<canvas id="wkCv" width="800" height="450" tabindex="0" aria-label="First-person view of the outpost. Left and right arrows turn, up and down arrows walk, E does the job you are facing."></canvas>'+
'<div class="wkPad"><button type="button" id="wkL" aria-label="Turn left">&#8630;</button><button type="button" id="wkU" aria-label="Walk forward">&#9650;</button><button type="button" id="wkD" aria-label="Walk back">&#9660;</button><button type="button" id="wkR" aria-label="Turn right">&#8631;</button><button type="button" id="wkBoost" title="Hold Shift for Jetpack Sprint">Boost (Shift)</button><button type="button" id="wkAct">Do job (E / Space)</button></div>'+
'<div id="wkMsg" role="status" aria-live="polite">Walk to a module to start.</div><div id="wkPlan" class="labBox" hidden></div><h3 class="wkH">Today\'s jobs</h3><div id="wkJobs"></div>'+
'<p class="hint">Small rewards, small costs: jobs are simplified teaching rules. Advance one sol ends the day and unused hours are lost.</p>';
var sp=$("statusPanel");g.insertBefore(panel,sp);
cv=$("wkCv");cx=cv.getContext("2d");jobsEl=$("wkJobs");planEl=$("wkPlan");infoEl=$("wkInfo");hoursEl=$("wkHours");msgEl=$("wkMsg");warnEl=$("wkWarn");
function hold(id,k){var b=$(id);var on=function(e){e.preventDefault();keys[k]=true},off=function(){keys[k]=false};b.addEventListener("pointerdown",on);b.addEventListener("pointerup",off);b.addEventListener("pointerleave",off);b.addEventListener("pointercancel",off)}
hold("wkL","l");hold("wkR","r");hold("wkU","u");hold("wkD","d");hold("wkBoost","boost");$("wkAct").onclick=start;
document.addEventListener("keydown",function(e){var gm=$("game");if(!gm||gm.dataset.feat!=="walk"){return}var t=e.target&&e.target.tagName;if(t==="INPUT"||t==="SELECT"||t==="TEXTAREA"){return}
var k=e.key;if(k==="ArrowLeft"||k==="a"||k==="A"){keys.l=true;e.preventDefault()}else if(k==="ArrowRight"||k==="d"||k==="D"){keys.r=true;e.preventDefault()}else if(k==="ArrowUp"||k==="w"||k==="W"){keys.u=true;e.preventDefault()}else if(k==="ArrowDown"||k==="s"||k==="S"){keys.d=true;e.preventDefault()}else if(k==="Shift"){keys.boost=true}else if(k==="e"||k==="E"){start();e.preventDefault()}else if((k===" "||e.code==="Space")&&e.target===cv){
e.preventDefault();
var sNow=S(),mNow=sNow?near(sNow,true):null;
if(mNow&&jobFor(sNow,mNow).ok){start()}
else if(!P.pend){if(P.jumpY<=0.01){P.jumpV=(sNow&&sNow.site==="mars")?3.4:4.6}say("Low-gravity hop! ("+(sNow&&sNow.site==="mars"?"Mars 0.38g":"Moon 0.16g")+") - walk up to a module and press E or Space to do a job.")}
}});
document.addEventListener("keyup",function(e){var k=e.key;if(k==="ArrowLeft"||k==="a"||k==="A"){keys.l=false}else if(k==="ArrowRight"||k==="d"||k==="D"){keys.r=false}else if(k==="ArrowUp"||k==="w"||k==="W"){keys.u=false}else if(k==="ArrowDown"||k==="s"||k==="S"){keys.d=false}else if(k==="Shift"){keys.boost=false}});
cv.addEventListener("click",function(e){var s=S();if(!s){return}if(P.act&&P.mini){lockMini();return}var r=cv.getBoundingClientRect(),mx=(e.clientX-r.left)*cv.width/r.width,best=null,bd=1e9;mods(s).forEach(function(m){var p=pr(m.wx,2,m.wz);if(p){var d=Math.abs(p.x-mx);if(d<bd&&d<cv.width*.18){bd=d;best=m}}});if(best){P.tgt=best;P.auto=false;P.act=null;say("Walking to "+best.name+"...")}});

var card=document.createElement("button");card.className="wbCard wkCard";card.setAttribute("data-feat","walk");card.innerHTML="<b>Walk the base</b><span>Play the astronaut: daily jobs, faults and the mission clock</span>";
var first=document.querySelector('.wbCard[data-feat="status"]');if(first&&first.parentNode){first.parentNode.insertBefore(card,first)}
card.onclick=function(){window.__openFeat("walk")};
if(window.__featRefresh===undefined){window.__featRefresh={}}
var prev=window.__featRefresh.walk;window.__featRefresh.walk=function(){list();if(prev){prev()}};
setInterval(function(){var gm=$("game");if(gm&&gm.dataset.feat==="walk"){list()}},1500);
window.__walkHome=function(){var t=$("tour");return !(t&&!t.hidden)};
window.__walk={near:function(){return near(S(),true)},state:function(){var s=S();return s?W(s):null},teleport:function(x){var m=mods(S()).filter(function(q){return q.x===x})[0];if(m){P.x=m.wx-m.rad-7;P.z=m.wz;P.yaw=0;P.tgt=null}},pose:function(){return{x:P.x,z:P.z,yaw:P.yaw}},start:start,hours:function(){var s=S();return s?W(s).hours:0},mods:function(){return mods(S())},tick:function(ms){drawFP(performance.now()+ms)}};
window.__walk.goto=function(x,z){if(P.act&&P.act.plan){say("Finish this sortie first.");return}P.tgt={wx:x,wz:z,rad:-4,name:"stake"};P.auto=true;P.act=null;P.mini=null;hidePlan();say("Walking out to the survey stake...")};
window.__walk.teleportXZ=function(x,z,yaw){P.x=x;P.z=z;P.yaw=yaw||0;P.tgt=null};
window.__walk.mini=function(x){if(P.mini&&x!=null){P.mini.x=x}return P.mini};
window.__walk.pend=function(){return P.pend};window.__walk.go=function(b){go(b||(P.pend&&P.pend.plan.alive[0]))};window.__walk.plan=planOf;window.__walk._abort=abortEva;window.__walk.busy=function(){return !!(P.act&&P.act.plan)};window.__walk.callOff=function(){if(P.act&&P.act.plan){var a=P.act;a.paused=false;abortEva(a,null);if(window.__suit){window.__suit.hideCard()}}};
requestAnimationFrame(loop)}
if(document.readyState==="loading"){document.addEventListener("DOMContentLoaded",build)}else{build()}
})();
