/* Suit supplies, mid-EVA return decision, fault diagnosis and Mission Control check-ins.
   Every capacity, rate, fault and reply below is INVENTED for the game. Real suits do track oxygen, power and CO2 removal,
   and real crews do report to a control room, but nothing here is a real procedure or a safety threshold. */
(function(){
"use strict";
function $(i){return document.getElementById(i)}
function S(){return window.__S?window.__S():null}
function esc(t){return String(t==null?"":t).replace(/[&<>"]/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]})}
function lc(t){return t.charAt(0).toLowerCase()+t.slice(1)}
function r1(x){return Math.round(x*10)/10}
var CAP={o2:6,batt:5.5,co2:5},RES=.5;           /* invented: hours of use at the planned rate; invented reserve */
var NAMES={o2:"oxygen",batt:"battery",co2:"CO2 filter"};
var MULT={fix:{o2:1.2,batt:1.3,co2:1.15},survey:{o2:1,batt:1.1,co2:1},chore:{o2:1.1,batt:1,co2:1.1}};
var EVT={co2:{t:"The CO2 filter is loading up faster than planned.",fac:{co2:1.6}},o2:{t:"A slow oxygen leak at a fitting.",fac:{o2:1.5}},batt:{t:"A battery cell dropped out.",loss:{batt:1.2}}};
var FAULTS=[
 {n:"Power fault",sym:["Output reads 0 V at the junction box","Panel surface looks normal and clean","Continuity test on the feed line: open circuit"],opt:["Dust on the cells","Broken cable connector","Failed storage battery"],ok:1},
 {n:"Heat fault",sym:["Radiator temperature far above normal","Pump motor current is very low","Coolant flow reads zero"],opt:["Stuck coolant pump","Dust on the radiator","A faulty temperature sensor"],ok:0},
 {n:"Dish fault",sym:["Signal is fine when tested on the bench","Pointing error creeps up over a few minutes","The motor stalls at one angle"],opt:["Damaged antenna cable","Clock drift in the software","A stuck pointing gear"],ok:2}];
function rnd(a,b){var x=Math.sin(a*127.1+b*311.7)*43758.5453;return x-Math.floor(x)}
function F(s){s.flags=s.flags||{};if(!s.flags.suit){s.flags.suit={f:[],ev:0,diagOk:0,diagBad:0,aborts:0,pushed:0,reserveUsed:0,closeCalls:0,reports:0,rewarded:{},last:null,log:[]}}return s.flags.suit}
function fast(){return !!window.__walkFast}
function mult(kind){return MULT[kind==="fix"?"fix":(kind==="survey"?"survey":"chore")]}
function useOf(plan,kind,hours,ev,abort){var m=mult(kind),u={};["o2","batt","co2"].forEach(function(r){u[r]=hours*m[r]});
if(ev){var rem=abort?(plan.travel+.25):(plan.travel+.25+plan.task/2);if(ev.fac){Object.keys(ev.fac).forEach(function(r){u[r]+=rem*m[r]*(ev.fac[r]-1)})}if(ev.loss){Object.keys(ev.loss).forEach(function(r){u[r]+=ev.loss[r]})}}return u}
function marginOf(u){var mg={},min=99,lim="";["o2","batt","co2"].forEach(function(r){mg[r]=CAP[r]-u[r];if(mg[r]<min){min=mg[r];lim=r}});return{mg:mg,min:min,lim:lim}}
function resup(u){return{o2:Math.ceil(u.o2),parts:Math.ceil(u.co2/2)}}
/* ---- planner hooks ---- */
function project(s,tot,kind){var u=useOf({travel:0,task:0},kind,tot),m=marginOf(u),rs=resup(u),why="";
if(m.min<RES){why="The "+NAMES[m.lim]+" supply would not last: this sortie uses "+r1(u[m.lim])+" h of a "+CAP[m.lim]+" h "+NAMES[m.lim]+" capacity, and the game keeps "+RES+" h in reserve. (Invented suit numbers.)"}
else if(s.res.parts<rs.parts){why="The suit needs "+rs.parts+" part"+(rs.parts===1?"":"s")+" for a fresh CO2 filter afterwards and the base has "+Math.floor(s.res.parts)+"."}
else if(s.res.o2<rs.o2+10){why="Topping up the suit's oxygen afterwards needs "+rs.o2+" O2 and the base would be left too low."}
return{use:u,mg:m.mg,min:m.min,lim:m.lim,rs:rs,why:why}}
function planHtml(pl){var su=pl.suit;if(!su){return""}
var t="<br><b>Suit supplies</b> (invented capacities: oxygen "+CAP.o2+" h, battery "+CAP.batt+" h, CO2 filter "+CAP.co2+" h; real suits track these three things, but these numbers are made up). This sortie"+(pl.wc?" (counting 1 extra hour in case you misdiagnose the fault)":"")+" uses oxygen "+r1(su.use.o2)+" h, battery "+r1(su.use.batt)+" h, CO2 filter "+r1(su.use.co2)+" h, leaving "+r1(su.mg.o2)+" / "+r1(su.mg.batt)+" / "+r1(su.mg.co2)+" h (game reserve "+RES+" h each). Afterwards the suit is refilled from the base: "+su.rs.o2+" O2 and "+su.rs.parts+" part"+(su.rs.parts===1?"":"s")+". Something may go wrong mid-task. The tighter the margin, the harder the call.";
return t}
/* ---- on-screen decision card (reuses the plan box) ---- */
function box(){return $("wkPlan")}
function ui(html,btns){var b=box();if(!b){return}b.hidden=false;b.innerHTML=html+"<div class='wkBtns'></div>";var row=b.querySelector(".wkBtns");btns.forEach(function(x){var e=document.createElement("button");e.type="button";e.className="wkOpt";e.innerHTML=x[0];e.onclick=function(){x[1]()};row.appendChild(e)});try{b.scrollIntoView({block:"nearest",behavior:"smooth"})}catch(e){}}
function hide(){var b=box();if(b){b.hidden=true;b.innerHTML=""}}
function note(a,txt){var f=F(S());f.log.push({sol:S().sol,t:txt})}
/* ---- diagnosis (fix jobs) ---- */
function faultFor(m){var k=m.kind;if(k==='solar'||k==='rtg'||k==='battery'||k==='pad'){return FAULTS[0]}if(k==='comms'||k==='observatory'||k==='drill'){return FAULTS[2]}return FAULTS[1]}
function diagnose(a,done){var s=S(),m=a.m,fd=faultFor(m),f=F(s);
function after(good,pick){a.j.diag=good?"right":"wrong";if(good){f.diagOk++;a.j.tol=.2;note(a,"Diagnosed the "+fd.n.toLowerCase()+" correctly ("+fd.opt[fd.ok]+").");f.f.push({t:"diag",text:"correct diagnosis of the "+fd.n.toLowerCase()+": "+fd.opt[fd.ok]})}
else{f.diagBad++;a.j.extraH=1;a.j.extraParts=1;note(a,"Misdiagnosed the "+fd.n.toLowerCase()+" as "+fd.opt[pick].toLowerCase()+"; it was "+fd.opt[fd.ok].toLowerCase()+".");f.f.push({t:"diag",text:"misdiagnosis: I thought "+fd.opt[pick].toLowerCase()+", it was "+fd.opt[fd.ok].toLowerCase()})}
hide();var msgEl=$("wkMsg");if(msgEl){msgEl.textContent=good?"Right call: "+fd.opt[fd.ok]+". The patch window is wider.":"Wrong cause. It was "+fd.opt[fd.ok].toLowerCase()+". That cost 1 extra hour and 1 part."}done()}
if(fast()){after(true,fd.ok);return}
ui("<b>Diagnose the fault at the "+esc(m.name)+": "+esc(fd.n)+" (invented fault)</b><br>Your instruments say:<ul>"+fd.sym.map(function(x){return"<li>"+esc(x)+"</li>"}).join("")+"</ul>What is the most likely cause? A wrong answer costs 1 hour and 1 part, a right one makes the patch easier.",fd.opt.map(function(o,i){return[esc(o),function(){after(i===fd.ok,i)}]}))}
/* ---- mid-task event and return decision ---- */
function pickEvent(s,a){if(window.__suitForce){return EVT[window.__suitForce]?{id:window.__suitForce,e:EVT[window.__suitForce]}:null}
var long=a.plan.total>=2.5,r=rnd(s.sol*17+(W().jobs||0),a.plan.dm||5);if(r>(long?.55:.35)){return null}
var ids=["co2","o2","batt"],id=ids[Math.floor(rnd(s.sol,a.plan.dm+3)*3)%3];return{id:id,e:EVT[id]}}
function W(){return window.__walk&&window.__walk.state()||{}}
function mid(a,cont){var s=S(),pl=a.plan,k=a.j.kind;if(!pl){cont();return}
var pe=pickEvent(s,a);if(!pe){cont();return}
var ev=pe.e,f=F(s);a.ev=ev;a.j.ev=ev;f.ev++;
var ex=a.j.extraH||0,uc=useOf(pl,k,pl.total+ex,ev,false),ua=useOf(pl,k,(pl.task>0?(pl.total-pl.task/2):pl.total)+ex,ev,true);
var mc=marginOf(uc),ma=marginOf(ua);
function go(){a.paused=false;hide();if(mc.min<0){f.closeCalls++;a.j.outcome="out";note(a,"Pushed on and ran short of "+NAMES[mc.lim]+"; emergency walk back.")}else if(mc.min<RES){f.reserveUsed++;f.pushed++;a.j.outcome="reserve";note(a,"Pushed on and dipped into the "+NAMES[mc.lim]+" reserve.")}else{a.j.outcome="ok";note(a,"Pushed on after "+lc(ev.t))}cont()}
function ab(){a.paused=false;hide();f.aborts++;note(a,"Aborted after "+lc(ev.t));window.__walk._abort(a,ev)}
if(fast()){if(mc.min>=RES){go()}else{ab()}return}
a.paused=true;
function line(m,u){return "O2 "+r1(m.mg.o2)+" h, battery "+r1(m.mg.batt)+" h, CO2 filter "+r1(m.mg.co2)+" h left at the airlock"+(m.min<0?" <b>(short of "+NAMES[m.lim]+")</b>":(m.min<RES?" <b>(inside the reserve)</b>":""))}
ui("<b>Suit warning: "+esc(ev.t)+"</b> (invented event)<br>Halfway through the task. Your readout if you:<ul><li><b>Finish the task</b> and walk back: "+line(mc)+".</li><li><b>Abort now</b> and walk back: "+line(ma)+". You lose the task and spend about "+r1(pl.total-pl.task/2+ex)+" h.</li></ul><small>Your buddy is out here with you. In the game, aborting is the lower-risk option (every supply stays above reserve); it is not a promise about real safety. Running short of a supply means an emergency walk back: the crew member is hurt and the rest of the day is lost. All numbers invented.</small>",[["Finish the task",go],["Abort and return now",ab]])}
function begin(a){var s=S();if(!a.plan||!window.__suit){return}
if(a.j.kind==="fix"){a.paused=true;diagnose(a,function(){mid(a,function(){a.paused=false})})}}
function midNow(a){a.paused=true;mid(a,function(){a.paused=false})}
/* ---- after the EVA: consume, resupply, consequences ---- */
function finish(s,plan,j,o){o=o||{};var f=F(s),a=o.act||{},ev=(a.ev||j.ev)||null,hours=o.total!=null?o.total:plan.total;
var extraH=j.extraH||0;if(extraH){var w=W();w.hours=r1(Math.max(0,w.hours-extraH));hours+=extraH}
var u=useOf(plan,j.kind,hours,ev,!!o.abort),m=marginOf(u),rs=resup(u),out="";
s.res.o2=Math.max(0,s.res.o2-rs.o2);s.res.parts=Math.max(0,s.res.parts-rs.parts-(j.extraParts||0));
out+=" Suit used O2 "+r1(u.o2)+" h, battery "+r1(u.batt)+" h, filter "+r1(u.co2)+" h; refill cost "+rs.o2+" O2 and "+rs.parts+" part"+(rs.parts===1?"":"s")+".";
var bd=s.crew.filter(function(c){return c.name===plan.buddy})[0];
if(m.min<0){var all=[bd].filter(Boolean);all.forEach(function(c){c.health=Math.max(1,c.health-12)});var w2=W();w2.hours=0;out+=" Emergency walk back: "+(bd?bd.name:"your buddy")+" is hurt (-12 health) and the rest of the day is lost."}
else if(m.min<RES){if(bd){bd.fatigue=Math.min(100,(bd.fatigue||0)+12);bd.morale=Math.max(0,bd.morale-6)}out+=" You used the reserve: "+(bd?bd.name:"your buddy")+" is shaken (more fatigue, lower morale)."}
f.last={use:u,mg:m.mg};
if(j.kind==="survey"){var sv=window.__lab&&window.__lab.state().survey,rr=sv&&sv.r[j.spot];if(rr&&rr.length){f.f.push({t:"survey",text:"a reading of "+rr[rr.length-1].toFixed(2)+" mSv/day at "+(window.__survey.spotList().filter(function(p){return p.id===j.spot})[0]||{}).name})}}
if(ev){f.f.push({t:"suit",text:"suit trouble: "+lc(ev.t)+" ("+(o.abort?"I aborted":"I finished")+")"})}
refresh();return out}
/* ---- objectives and check-ins ---- */
function nsp(s){var sv=window.__lab&&window.__lab.state().survey;return sv?Object.keys(sv.r).filter(function(k){return sv.r[k].length}).length:0}
var OBJ=[
 {id:"first",t:"Walk to the Open plain stake, take a detector reading and bring it back",done:function(s){return nsp(s)>=1}},
 {id:"survey3",t:"Survey three different spots with the detector",done:function(s){return nsp(s)>=3}},
 {id:"shelter",t:"Choose the spot you trust most and build an emergency shelter there (6 parts)",done:function(s){var sv=window.__lab&&window.__lab.state().survey;return !!(sv&&sv.shelter)}},
 {id:"diag",t:"Diagnose an outdoor fault correctly, then patch it",done:function(s){return F(s).diagOk>=1}},
 {id:"sci",t:"Finish the science goal before the return window closes",done:function(s){return s.res.science>=s.objectiveScience}}];
function cur(s){for(var i=0;i<OBJ.length;i++){if(!OBJ[i].done(s)){return OBJ[i]}}return OBJ[OBJ.length-1]}
function ensure(){var m=$("wkMsg");if(!m||$("wkCheck")){return}var d=document.createElement("div");d.id="wkCheck";d.className="labBox";
d.innerHTML="<div id='wkObj'></div><div id='wkSuit' class='hint'></div><div><button type='button' id='wkRadio'>Radio Mission Control (0.25 h)</button> <span id='wkRadioNote' class='hint'></span></div>";
m.parentNode.insertBefore(d,$("wkPlan"));$("wkRadio").onclick=checkin}
function refresh(){var s=S();if(!s){return}ensure();var o=$("wkObj");if(!o){return}var f=F(s),c=cur(s);
o.innerHTML="<b>Mission Control objective:</b> "+esc(c.t);
var sd=$("wkSuit");sd.textContent="Suit (invented capacities): oxygen "+CAP.o2+" h, battery "+CAP.batt+" h, CO2 filter "+CAP.co2+" h, refilled from the base after each EVA. "+(f.last?"Last EVA used "+r1(f.last.use.o2)+" / "+r1(f.last.use.batt)+" / "+r1(f.last.use.co2)+" h.":"");
var w=W(),b=$("wkRadio");b.disabled=!(w.hours>=.25);var nt=$("wkRadioNote");nt.textContent=f.f.length?"You have "+f.f.length+" thing"+(f.f.length===1?"":"s")+" to report.":"Nothing new to report yet."}
function checkin(){var s=S(),f=F(s),w=W();if(!s||w.hours<.25){return}if(window.__walk.busy()){var mm=$("wkMsg");if(mm){mm.textContent="Finish this sortie before you radio in."}return}
var opts=f.f.slice(-3).map(function(x,i){return[esc("Lead with: "+x.text),function(){report(x)}]});
opts.push([f.f.length?"Nothing else, just a status check":"Status check",function(){report(null)}]);
ui("<b>Radio Mission Control</b> (fictional crew and control room)<br>Tell them what matters most. Everything you have pending counts as reported.<br><small>Real delays depend on distance (up to about 22 minutes one way at Mars, NASA NTRS). The game answers at once to keep play moving.</small>",opts)}
function report(x){var s=S(),f=F(s),w=W();w.hours=r1(Math.max(0,w.hours-.25));f.reports++;
var before=cur(s),rew="",txt="";
if(x){if(x.t==="survey"){txt="Copy, "+x.text+". One reading is noisy, so we would want a second look before trusting it."}else if(x.t==="suit"){txt="Copy, "+x.text+". Keep your margins wide, the day is long."}else{txt="Copy, "+x.text+". Good, that is the kind of reasoning we want."}}else{txt="Copy. Standing by."}
f.f=[];
OBJ.forEach(function(o){if(o.id!=="sci"&&o.done(s)&&!f.rewarded[o.id]){f.rewarded[o.id]=1;s.res.science+=4;s.totals.science=(s.totals.science||0)+4;rew+=" Objective done: "+o.t.split(",")[0].toLowerCase()+" (+4 science).";s.log.unshift({sol:s.sol,msg:"Mission Control: objective complete, +4 science."})}});
var nx=cur(s);
var full="Mission Control: "+txt+rew+(nx.id==="sci"&&OBJ[OBJ.length-1].done(s)?" Revised objective: bring everyone home.":" Revised objective: "+nx.t+".");
s.log.unshift({sol:s.sol,msg:full});hide();var msgEl=$("wkMsg");if(msgEl){msgEl.textContent=full+" "+w.hours+" hours left today."}
if(window.__render){window.__render()}refresh()}
function summary(s){var f=F(s);if(!(f.ev||f.diagOk||f.diagBad||f.reports)){return""}
var o="Suit and control room: "+f.reports+" check-in"+(f.reports===1?"":"s")+" with Mission Control";
if(f.diagOk||f.diagBad){o+="; "+f.diagOk+" fault"+(f.diagOk===1?"":"s")+" diagnosed right and "+f.diagBad+" wrong"}
if(f.ev){o+="; "+f.ev+" suit warning"+(f.ev===1?"":"s")+" mid-task (I aborted "+f.aborts+" time"+(f.aborts===1?"":"s")+", pushed on "+f.pushed+" into the reserve"+(f.closeCalls?", and ran short "+f.closeCalls+" time"+(f.closeCalls===1?"":"s"):"")+")"}
return o+". All suit numbers and faults are invented game rules."}
document.addEventListener('click',function(e){var t=e.target&&e.target.closest&&e.target.closest('#solBtn,#autoBtn');if(t&&window.__walk&&window.__walk.busy&&window.__walk.busy()){var cvv=$('wkCv');if(!(cvv&&cvv.offsetParent)){window.__walk.callOff();return}e.stopImmediatePropagation();e.preventDefault();var mm=$('wkMsg');if(mm){mm.textContent='Finish the sortie first: you cannot end the day with an EVA under way.'}}},true);
window.__suit={hideCard:hide,cap:CAP,reserve:RES,project:project,planHtml:planHtml,begin:begin,mid:midNow,finish:finish,refresh:refresh,summary:summary,state:function(){var s=S();return s?F(s):null},objective:function(){var s=S();return cur(s)},checkin:checkin,faults:FAULTS,faultFor:faultFor};
})();
