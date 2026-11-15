/* Radiation survey: fictional survey stakes you walk to in first person, a detector reading at each,
   and a choice of where to put an emergency shelter. The map and every spot value are INVENTED for the game.
   They are not a map of the Moon or Mars. Reading scale: see lab.js. */
(function(){
"use strict";
function $(i){return document.getElementById(i)}
function S(){return window.__S?window.__S():null}
function esc(t){return String(t==null?"":t).replace(/[&<>"]/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]})}
/* x,z: position in the walk world. dm: invented distance from the airlock in metres. f: hidden game factor on the dose scale. */
var SPOTS=[
 {id:"plain",name:"Open plain stake",x:30,z:-30,dm:350,f:1.0},
 {id:"rim",name:"Crater rim stake",x:70,z:32,dm:700,f:1.15},
 {id:"ridge",name:"Ridge shadow stake",x:110,z:-34,dm:1100,f:0.85},
 {id:"hollow",name:"Hollow stake",x:150,z:30,dm:1500,f:0.7},
 {id:"far",name:"Far ridge stake",x:215,z:-26,dm:2400,f:0.6}
];
var SHELTER_COST=6,NEED_SPOTS=3;
function lab(s){var l=window.__lab&&window.__lab.state();if(!l){return null}if(!l.survey){l.survey={r:{},shelter:null,n:0}}return l.survey}
function spot(id){return SPOTS.filter(function(p){return p.id===id})[0]}
function mean(a){var m=0;a.forEach(function(v){m+=v});return a.length?m/a.length:0}
function find(s,x,z,yaw){var best=null,bd=99;SPOTS.forEach(function(p){var dx=p.x-x,dz=p.z-z,d=Math.sqrt(dx*dx+dz*dz);if(d>6||d>=bd){return}var df=Math.atan2(dz,dx)-yaw;while(df>Math.PI){df-=6.2832}while(df<-Math.PI){df+=6.2832}if(Math.abs(df)>.9&&d>2.5){return}bd=d;best=p});return best}
function prompt(s,x,z,yaw){var p=find(s,x,z,yaw);if(!p){return""}var sv=lab(s),n=(sv.r[p.id]||[]).length;return p.name+": take a detector reading  [E]"+(n?"  ("+n+" so far)":"")}
function take(s,id){var p=spot(id),sv=lab(s),L=window.__lab;var n=sv.n++;var base=L.base();
var v=base*p.f*(1+L.sd*L.gauss((s.seed||7)+11,n+s.sol*5));v=Math.max(0.05,Math.round(v*100)/100);
(sv.r[id]=sv.r[id]||[]).push(v);if(window.__lab.draw){setTimeout(function(){L.draw()},0)}
return "Detector reading at "+p.name+": "+v.toFixed(2)+" mSv/day (simulated, on the game's dose scale)."}
function spots(s){var sv=lab(s);if(!sv){return[]}return SPOTS.map(function(p){return{id:p.id,name:p.name,x:p.x,z:p.z,n:(sv.r[p.id]||[]).length,shelter:sv.shelter===p.id,far:p.dm/2000>1}})}
function draw(o,cx,pr,F,fogOf,storm,t,s){
var base=pr(o.x,0,o.z),top=pr(o.x,3.2,o.z);if(!base||!top||!(base.d>0.5)){return}
var f=fogOf(base.d,storm),k=1-f*.8,col=o.shelter?"#6bd4ff":(o.n?"#7be0a0":(o.far?"#ff7a7a":"#ffc861"));
cx.globalAlpha=Math.max(.25,k);cx.strokeStyle="#cfd3dc";cx.lineWidth=Math.max(1,F*.12/base.d);cx.beginPath();cx.moveTo(base.x,base.y);cx.lineTo(top.x,top.y);cx.stroke();
var r=Math.max(2,F*.35/base.d);cx.fillStyle=col;cx.beginPath();cx.arc(top.x,top.y,r*(.8+.2*Math.sin(t*3)),0,6.3);cx.fill();
if(o.shelter){cx.fillStyle="rgba(107,212,255,.35)";cx.beginPath();cx.ellipse(base.x,base.y,r*5,r*1.6,0,0,6.3);cx.fill()}
if(base.d<45){cx.font="bold "+Math.min(22,Math.max(10,Math.round(F*1.6/base.d)))+"px Verdana";cx.textAlign="center";cx.fillStyle="#fff";cx.fillText(o.name.replace(" stake",""),top.x,top.y-r-5);cx.textAlign="left"}
cx.globalAlpha=1}
/* ---- notebook section ---- */
function eligible(s,p,sv){var rs=sv.r[p.id]||[];var kinds=Object.keys(sv.r).filter(function(k){return sv.r[k].length}).length;return !sv.shelter&&rs.length>0&&kinds>=NEED_SPOTS&&s.res.parts>=SHELTER_COST}
function html(s){var sv=lab(s);if(!sv){return""}
var h="<div class='labBox'><b>Radiation survey (fictional map)</b><p class='hint'>Five survey stakes stand out on the plain. You can see them in the walk view. Walk to one, face it and press E to take a detector reading. Each reading is a 1 h task inside a planned EVA, with a buddy, a walk out and back, and the suit reserve. The map, the distances and each spot's dose are invented for the game. They are not a map of the Moon or Mars, and real shelter sites are chosen very differently.</p>";
h+="<table class='labTb'><tr><th>Spot</th><th>Distance</th><th>Readings (mean mSv/day)</th><th></th></tr>";
SPOTS.forEach(function(p){var rs=sv.r[p.id]||[],far=p.dm/2000>1;
h+="<tr><td>"+esc(p.name)+(sv.shelter===p.id?" (shelter)":"")+"</td><td>"+p.dm+" m"+(far?" (walk-back too long)":"")+"</td><td>"+(rs.length?mean(rs).toFixed(2)+" over "+rs.length:"none yet")+"</td><td>"+
(far?"":"<button type='button' class='svGo' data-id='"+p.id+"'>Walk there</button> ")+(eligible(s,p,sv)?"<button type='button' class='svSh' data-id='"+p.id+"'>Shelter here ("+SHELTER_COST+" parts)</button>":"")+"</td></tr>"});
h+="</table><p class='hint'>An emergency shelter needs readings from at least "+NEED_SPOTS+" different spots and "+SHELTER_COST+" parts, and can be placed once. In the game, a shelter at a lower-reading spot cuts crew radiation damage a little on storm sols and solar-event sols (up to about 1 health per crew member). The better the spot, the bigger the cut. One reading is noisy, so a second visit can change your mind before you commit.</p>";
if(sv.shelter){var p=spot(sv.shelter);h+="<p>Shelter placed at <b>"+esc(p.name)+"</b>.</p>"}
return h+"</div>"}
function bind(el){el.querySelectorAll(".svGo").forEach(function(b){b.onclick=function(){var p=spot(b.dataset.id);window.__openFeat("walk");window.__walk.goto(p.x,p.z)}});
el.querySelectorAll(".svSh").forEach(function(b){b.onclick=function(){var s=S(),sv=lab(s),p=spot(b.dataset.id);if(!s||!eligible(s,p,sv)){return}s.res.parts-=SHELTER_COST;sv.shelter=p.id;sv.shelterSol=s.sol;s.log.unshift({sol:s.sol,msg:"Survey: emergency shelter placed at "+p.name+"."});if(window.__render){window.__render()}window.__lab.draw()}})}
function summary(s){var sv=lab(s);if(!sv){return""}var kinds=Object.keys(sv.r).filter(function(k){return sv.r[k].length});if(!kinds.length){return""}
var out="I surveyed "+kinds.length+" spot"+(kinds.length===1?"":"s")+" with the detector. ";
if(sv.shelter){var p=spot(sv.shelter),m=mean(sv.r[p.id]),reach=SPOTS.filter(function(q){return q.dm/2000<=1}).sort(function(a,b){return a.f-b.f})[0];
out+="I put the emergency shelter at the "+p.name.replace(" stake","")+", where my readings averaged "+m.toFixed(2)+" mSv/day. The game's hidden value there is "+(p.f).toFixed(2)+" times the scale"+(reach.id===p.id?", the best spot within walk-back range.":", and the best spot within walk-back range was the "+reach.name.replace(" stake","")+" at "+reach.f.toFixed(2)+".")}
else{out+="I never placed a shelter."}return out}
function tickWrap(){var E=window.TrainerEngine;if(!E||E.__svWrapped){return}var orig=E.tick;E.tick=function(s){
var top=s.log&&s.log[0];var r=orig.apply(this,arguments);
try{var sv=lab(s);if(sv&&sv.shelter){var p=spot(sv.shelter),storm=!!(s.stormActive||(s.story&&s.story.storm)),spe=false;
for(var i=0;i<(s.log||[]).length;i++){if(s.log[i]===top){break}if(/Solar (particle event|flare)/i.test(s.log[i].msg||"")){spe=true;break}}
if(storm||spe){var q=Math.max(0,1-p.f),rf=Math.round(3*q*100)/100;if(rf>0){s.crew.forEach(function(c){if(c.health>0){c.health=Math.min(100,Math.round((c.health+rf)*100)/100)}});s.log.unshift({sol:s.sol,msg:"Shelter at "+p.name.replace(" stake","")+" eased the dose: +"+rf.toFixed(2)+" health per crew member."})}}}}catch(e){}
return r};E.__svWrapped=true}
tickWrap();
window.__survey={find:find,prompt:prompt,take:take,spots:spots,draw:draw,html:html,bind:bind,summary:summary,spotList:function(){return SPOTS}};
})();
