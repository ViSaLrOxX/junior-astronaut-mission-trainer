/* Science notebook, dose ledger, captain's log and mission patch.
   Additive module: it reads the game state and never changes the engine's own rules,
   apart from one small, once-only reward for a correct conclusion (+6 science, +8 parts). */
(function(){
"use strict";
var BASE={moon:1.44,mars:0.64};             /* mSv per day dose equivalent: Moon about 60 uSv/h x 24 (Chang'e-4 LND), Mars 0.64 (Curiosity RAD). Scale only. */
var SD=0.2;                                  /* INVENTED game scatter (20 percent) so readings are not identical */
var NEED=3;                                  /* readings needed per location before concluding */
var SOURCES=[
 ["Mars: dose equivalent 0.64 +/- 0.12 mSv per day from galactic cosmic rays on the surface, Curiosity rover RAD instrument, Gale crater, 7 Aug 2012 to 1 Jun 2013 (solar maximum). Hassler et al. 2014, Science","https://www.science.org/doi/10.1126/science.1244797"],
 ["Moon: Chang'e-4 lander LND instrument, von Karman crater on the far side, landed 3 Jan 2019. Measured absorbed dose rate in silicon 13.2 +/- 1 microGy per hour. Zhang et al. 2020, Science Advances","https://www.science.org/doi/10.1126/sciadv.aaz1334"],
 ["Moon: equivalent dose rate of about 60 microSv per hour, and the comment on covering a habitat with lunar soil, Kiel University (built the LND instrument)","https://www.uni-kiel.de/en/research/details/news/203-moon-mission"],
 ["NASA's standard for an astronaut's total career radiation dose, 600 mSv, NASA OCHMO technical brief","https://nasa.gov/wp-content/uploads/2023/03/radiation-protection-technical-brief-ochmo.pdf"],
 ["MOXIE on Perseverance: 16 runs, 122 grams of oxygen in total, up to 12 grams per hour, NASA JPL","https://www.jpl.nasa.gov/news/nasas-oxygen-generating-experiment-moxie-completes-mission/"]
];
function $(i){return document.getElementById(i)}
function S(){return window.__S?window.__S():null}
function esc(t){return String(t==null?"":t).replace(/[&<>"]/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]})}
function L(s){s.flags=s.flags||{};if(!s.flags.lab){s.flags.lab={readings:[],loc:"out",concluded:null,paid:false,dose:{},days:0}}return s.flags.lab}
function base(s){return BASE[s.site]||BASE.moon}
function shieldFactor(s){return 1/(1+0.5*(s.shieldLevel||0))}   /* game rule, not a measurement */
function rnd(seed,n){var x=Math.sin(seed*127.1+n*311.7)*43758.5453;return x-Math.floor(x)}
function gauss(seed,n){return (rnd(seed,n)+rnd(seed,n+101)+rnd(seed,n+202)-1.5)*2}
function stats(a){var n=a.length;if(!n){return{n:0,mean:0,se:0}}var m=0;a.forEach(function(v){m+=v});m/=n;var q=0;a.forEach(function(v){q+=(v-m)*(v-m)});var sd=n>1?Math.sqrt(q/(n-1)):0;return{n:n,mean:m,se:sd/Math.sqrt(n)}}
function rng2(a){return a.length?a.reduce(function(m,v){return Math.min(m,v)},1e9).toFixed(2)+" to "+a.reduce(function(m,v){return Math.max(m,v)},-1e9).toFixed(2):"-"}
function groups(lab){var o=[],i=[];lab.readings.forEach(function(r){(r.loc==="in"?i:o).push(r.v)});var go=stats(o),gi=stats(i);go.range=rng2(o);gi.range=rng2(i);return{out:go,inn:gi}}
function verdict(lab){var g=groups(lab);if(g.out.n<NEED||g.inn.n<NEED){return null}
var diff=g.out.mean-g.inn.mean,z=diff/Math.sqrt(g.out.se*g.out.se+g.inn.se*g.inn.se+1e-9);return{supported:diff>0&&z>2,diff:diff,z:z,g:g}}
function scaleNote(s){var mars=s.site==="mars";
var real=mars?"Scale used: 0.64 mSv per day (dose equivalent, galactic cosmic rays), measured by NASA's Curiosity rover in Gale crater between Aug 2012 and Jun 2013. Jezero rim is a different place, so this is only a scale for the game. The +/-0.12 quoted with it is the measurement's uncertainty, not day-to-day variation.":"Scale used: about 1.44 mSv per day (about 60 microSv per hour, dose equivalent), measured by China's Chang'e-4 lander in von Karman crater on the Moon's far side in 2019. That is not the south pole and not a prediction for it. Your base is fictional.";
return "<p class='hint'>"+real+"</p><p class='hint'>Dose equivalent (mSv) is worked out from the absorbed dose (mGy) that instruments measure, using a factor for the type of radiation. Everything below is invented for teaching: the readings scatter by a made-up 20 percent, and shielding cuts the inside reading by a game rule that depends on your shield level ("+(s.shieldLevel||0)+" now). It is not a measurement of real shielding.</p>"}
function reading(s){
var lab=L(s),n=lab.readings.length,loc=lab.loc==="in"?"in":"out";
var v=base(s)*(loc==="in"?shieldFactor(s):1)*(1+SD*gauss(s.seed||7,n+s.sol*7));v=Math.max(0.05,Math.round(v*100)/100);
lab.readings.push({sol:s.sol,loc:loc,v:v});
var h="Dosimeter reading logged ("+(loc==="in"?"inside the shielded habitat":"outside on the surface")+"): "+v.toFixed(2)+" mSv per day.";
if(window.__render){setTimeout(function(){draw()},0)}return h}
function tickWrap(){var E=window.TrainerEngine;if(!E||E.__labWrapped){return}var orig=E.tick;E.tick=function(s){
var pre=null;try{pre=s.crew.filter(function(c){return c.health>0}).map(function(c){return{n:c.name,away:c.away>0}})}catch(e){}
var r=orig.apply(this,arguments);
try{if(pre){var lab=L(s),b=base(s),f=shieldFactor(s);pre.forEach(function(p){lab.dose[p.n]=(lab.dose[p.n]||0)+b*(p.away?1:f)});lab.days++}}catch(e){}
return r};E.__labWrapped=true}
function conclude(kind){var s=S();if(!s){return}var lab=L(s),v=verdict(lab),box=$("labVerdict");if(!v){box.textContent="You need at least "+NEED+" readings in each place first.";return}
var right=(kind==="yes")===v.supported;lab.concluded=kind;
var txt="Outside average "+v.g.out.mean.toFixed(2)+" mSv/day (n="+v.g.out.n+"), inside average "+v.g.inn.mean.toFixed(2)+" (n="+v.g.inn.n+"). The gap is "+v.diff.toFixed(2)+", about "+Math.max(0,v.z).toFixed(1)+" times the combined standard error of your readings. Game rule (a teaching heuristic, not a real statistical test): the gap counts as a drop if it is over 2 times that.";
if(right){txt+=" Your conclusion matches the game rule. ";if(!lab.paid){lab.paid=true;s.res.science+=6;s.totals.science=(s.totals.science||0)+6;s.res.parts+=8;s.log.unshift({sol:s.sol,msg:"Notebook: evidence-backed conclusion accepted. +6 science, +8 parts."});txt+="Mission Control signs it off: +6 science, +8 parts (once)."}else{txt+="(The one-off reward was already paid.)"}}
else{txt+=v.supported?" The game rule says there is a drop. Look at the gap again.":" The gap is inside the scatter, so the game rule sees no drop yet. Take more readings, or build more shielding so there is something to measure."}
lab.lastText=txt;box.textContent=txt;if(window.__render){window.__render()}draw()}
function draw(){var s=S(),el=$("labBody");if(!el||!s){return}var lab=L(s),g=groups(lab),v=verdict(lab);
var left=Math.max(0,(s.objectiveSols||0)-s.sol),hrs=(window.__walk&&window.__walk.hours)?window.__walk.hours():0;
var h="<div class='labBox'><b>Mission brief</b><p>Goal: "+Math.floor(s.res.science)+" of "+(s.objectiveScience||0)+" science. Return window: "+left+" sol"+(left===1?"":"s")+" left of "+(s.objectiveSols||0)+". Each sol you have about 8 working hours (3 for an experiment, 1 for a job). Keep "+s.crew.filter(function(c){return c.health>0}).length+" crew alive and home.</p></div>";
h+="<div class='labBox'><b>Hypothesis</b><p>A shielded habitat gives a lower daily radiation dose than standing outside.</p><p class='hint'>This is a game exercise with simulated readings. Every experiment you run at the Mission console also takes one simulated dosimeter reading. Choose where it is taken:</p>"+
"<label>Reading location <select id='labLoc'><option value='out'"+(lab.loc==="out"?" selected":"")+">Outside on the surface</option><option value='in'"+(lab.loc==="in"?" selected":"")+">Inside the shielded habitat</option></select></label>"+
""+scaleNote(s)+"";
h+="<table class='labTb'><tr><th>Sol</th><th>Where</th><th>mSv/day</th></tr>";
lab.readings.slice(-12).forEach(function(r){h+="<tr><td>"+r.sol+"</td><td>"+(r.loc==="in"?"Inside":"Outside")+"</td><td>"+r.v.toFixed(2)+"</td></tr>"});
if(!lab.readings.length){h+="<tr><td colspan='3'>No readings yet. Walk to the Mission console and run an experiment.</td></tr>"}
h+="</table><p>Outside: "+(g.out.n?g.out.mean.toFixed(2)+" mean over "+g.out.n+" (range "+g.out.range+")":"no readings")+". Inside: "+(g.inn.n?g.inn.mean.toFixed(2)+" mean over "+g.inn.n+" (range "+g.inn.range+")":"no readings")+". Need "+NEED+" of each to conclude.</p>"+
"<div class='btnRow'><button type='button' id='labYes'"+(v?"":" disabled")+">Conclude: shielding lowers the dose</button><button type='button' id='labNo'"+(v?"":" disabled")+">Conclude: no clear drop yet</button></div><p id='labVerdict' role='status' aria-live='polite'></p></div>";
var names=Object.keys(lab.dose);
h+="<div class='labBox'><b>Crew dose ledger (game)</b><p class='hint'>A teaching tally, not a health calculation or medical advice. Each sol every crew member adds the scale dose above, cut by the game's shielding rule. Crew away on expeditions get the unshielded amount. Solar particle events are not counted. For scale only: NASA's standard limits an astronaut's whole-career dose to 600 mSv. This ledger is not a safety meter, and a low number here says nothing about whether a real mission would be safe.</p>";
if(!names.length){h+="<p>No sols logged yet. Advance a sol.</p>"}else{h+="<table class='labTb'><tr><th>Crew</th><th>Game mSv so far</th></tr>";names.forEach(function(n){h+="<tr><td>"+esc(n)+"</td><td>"+lab.dose[n].toFixed(1)+"</td></tr>"});h+="</table>"}
h+="</div><div class='labBox'><b>Real data used here</b><ul>";SOURCES.forEach(function(x){h+="<li>"+esc(x[0])+" <a href='"+x[1]+"' target='_blank' rel='noopener'>"+esc(x[1])+"</a></li>"});
h+="</ul><p class='hint'>The game is a teaching model. These numbers only set its radiation scale, and they come from specific landing sites. The reading scatter, the shielding factor and the conclusion rule are game rules. The saved NASA DONKI record in the Sources card is a real past event, not a live feed and not a lunar storm simulation.</p></div>";
el.innerHTML=h;var sel=$("labLoc");if(sel){sel.onchange=function(){lab.loc=sel.value}}var y=$("labYes"),n=$("labNo");if(y){y.onclick=function(){conclude("yes")}}if(n){n.onclick=function(){conclude("no")}}
if($("labVerdict")&&lab.lastText){$("labVerdict").textContent=lab.lastText}}
function build(){var g=$("game");if(!g||$("labPanel")){return}
var p=document.createElement("section");p.id="labPanel";p.className="panel v-mission";p.setAttribute("data-feat","lab");p.innerHTML="<h2>Science notebook</h2><p class='hint'>Test a hypothesis with simulated readings set on a scale from real instruments: take readings, compare them, and write a conclusion.</p><div id='labBody'></div>";
var sp=$("statusPanel");g.insertBefore(p,sp);
var card=document.createElement("button");card.className="wbCard";card.setAttribute("data-feat","lab");card.innerHTML="<b>Science notebook</b><span>Hypothesis, dosimeter readings, dose ledger and real data sources</span>";
var w=document.querySelector('.wbCard[data-feat="walk"]')||document.querySelector('.wbCard[data-feat="status"]');if(w&&w.parentNode){w.parentNode.insertBefore(card,w.nextSibling)}
card.onclick=function(){window.__openFeat("lab")};
window.__featRefresh=window.__featRefresh||{};var prev=window.__featRefresh.lab;window.__featRefresh.lab=function(){draw();if(prev){prev()}};
setInterval(function(){var gm=$("game");if(gm&&gm.dataset.feat==="lab"&&!(document.activeElement&&document.activeElement.tagName==="SELECT")){draw()}},2000)}
/* ---------- end of mission: captain's log, Earth link, patch ---------- */
function logText(s){var lab=L(s),alive=s.crew.filter(function(c){return c.health>0}),g=groups(lab),v=verdict(lab),site=s.site==="mars"?"Jezero rim":"the lunar south pole";var o=[];
o.push("Sol "+s.sol+". I'm writing this from "+site+". "+(alive.length===s.crew.length?"All "+alive.length:alive.length+" of "+s.crew.length)+" of us are still here"+(s.won?", and the base is alive.":"."));
o.push("We logged "+Math.floor(s.res.science)+" of "+(s.objectiveScience||0)+" science. "+(s.won?"The goal is met before the return window closed.":"We did not reach the goal, but nobody was left behind."));
if((s.stormsSurvived||0)>0){o.push("We rode out "+s.stormsSurvived+" storm"+(s.stormsSurvived===1?"":"s")+" with the lights on and the doors shut.")}
if(lab.readings.length){o.push("My notebook has "+lab.readings.length+" simulated dosimeter readings. "+(v?(v.supported?"Inside the shielded habitat they came out lower than outside, and by the game's rule that counts as a drop.":"The inside and outside readings were too close to claim a difference, so I won't."):"I don't have enough readings in both places to say anything yet."))}
var tot=0,cnt=0;Object.keys(lab.dose).forEach(function(k){tot+=lab.dose[k];cnt++});if(cnt){o.push("Average game dose per crew member over the mission: "+(tot/cnt).toFixed(1)+" mSv (a teaching tally).")}
o.push(s.won?"Next crew: the kettle is on.":"Next crew: here is what we learned.");return o.join(" ")}
function patch(s,cv){var c=cv.getContext("2d"),W=cv.width,H=cv.height,cx=W/2,cy=H/2,mars=s.site==="mars";
c.clearRect(0,0,W,H);c.fillStyle="#0b1330";c.beginPath();c.arc(cx,cy,W*.47,0,6.3);c.fill();c.lineWidth=12;c.strokeStyle=s.won?"#e8c35a":"#8fa3c8";c.stroke();
for(var i=0;i<60;i++){var a=rnd(3,i)*6.283,r=rnd(5,i)*W*.42;c.fillStyle="rgba(255,255,255,"+(.3+.5*rnd(9,i)).toFixed(2)+")";c.fillRect(cx+Math.cos(a)*r,cy+Math.sin(a)*r,2,2)}
var g=c.createRadialGradient(cx-30,cy+10,10,cx,cy+20,W*.24);if(mars){g.addColorStop(0,"#e08a5a");g.addColorStop(1,"#7a3a22")}else{g.addColorStop(0,"#e9e9ee");g.addColorStop(1,"#6d7384")}
c.fillStyle=g;c.beginPath();c.arc(cx,cy+10,W*.19,0,6.3);c.fill();
c.fillStyle="rgba(0,0,0,.18)";[[-40,10,22],[30,50,16],[10,-10,12],[-10,70,10]].forEach(function(q){c.beginPath();c.arc(cx+q[0]*.85,cy+10+(q[1]-20)*.85,q[2]*.85,0,6.3);c.fill()});
c.fillStyle="#fff";c.textAlign="center";var nm=(s.missionName||"Junior Astronaut Mission").slice(0,28).toUpperCase(),fs=26;c.font="bold "+fs+"px sans-serif";while(c.measureText(nm).width>W*.62&&fs>12){fs--;c.font="bold "+fs+"px sans-serif"}c.fillText(nm,cx,cy-W*.30);
c.font="18px sans-serif";c.fillStyle="#cfe1ff";c.fillText((mars?"JEZERO RIM":"LUNAR SOUTH POLE")+" - SOL "+s.sol,cx,cy+W*.30);
c.fillStyle=s.won?"#e8c35a":"#cfe1ff";c.font="bold 16px sans-serif";c.fillText(Math.floor(s.res.science)+" SCIENCE  |  "+s.crew.filter(function(x){return x.health>0}).length+" CREW HOME",cx,cy+W*.36)}
function debrief(){var s=S(),eb=$("endBanner");if(!s||!eb||eb.hidden||!s.over||$("labDebrief")){return}
var d=document.createElement("div");d.id="labDebrief";d.className="learnBox";
d.innerHTML="<b>Captain's log</b><p class='labLog'>"+esc(logText(s))+"</p>"+
"<b>Back on Earth</b><ul><li>The game's dose scale comes from two real instruments: NASA's Curiosity rover in Gale crater on Mars, and the dosimetry instrument on China's Chang'e-4 lander, built at Kiel University in Germany, in von Karman crater on the Moon's far side. Those are different places and times from your fictional bases.</li><li>A member of the Chang'e-4 team said astronauts can and should shield themselves as far as possible on long Moon stays, for example by covering a habitat with a thick layer of lunar soil (Kiel University).</li><li>NASA's MOXIE made 122 grams of oxygen from Mars air over 16 runs, up to 12 grams an hour. It was a test of making air and propellant on site for future crews (NASA JPL).</li></ul>"+
"<b>Mission patch</b><div><canvas id='labPatch' width='420' height='420' aria-label='Your mission patch'></canvas></div><div class='btnRow'><button type='button' id='labPatchBtn'>Download patch (PNG)</button><button type='button' id='labLogBtn'>Copy captain's log</button></div>";
eb.appendChild(d);patch(s,$("labPatch"));
$("labPatchBtn").onclick=function(){$("labPatch").toBlob(function(b){var a=document.createElement("a");a.href=URL.createObjectURL(b);a.download="mission-patch.png";document.body.appendChild(a);a.click();setTimeout(function(){a.remove()},500)})};
$("labLogBtn").onclick=function(){var t=logText(S());if(navigator.clipboard){navigator.clipboard.writeText(t)}$("labLogBtn").textContent="Copied"}}
function boot(){tickWrap();build();var eb=$("endBanner");if(eb&&window.MutationObserver){new MutationObserver(function(){debrief()}).observe(eb,{childList:true,attributes:true,attributeFilter:["hidden"]})}}
if(document.readyState==="loading"){document.addEventListener("DOMContentLoaded",boot)}else{boot()}
window.__lab={reading:reading,state:function(){var s=S();return s?L(s):null},verdict:function(){var s=S();return s?verdict(L(s)):null},draw:draw,conclude:conclude,logText:function(){return logText(S())},base:function(){return base(S())}};
})();
