(function(){
var s=null;
var autoTimer=null;
var $=function(id){return document.getElementById(id)};
var E=function(){return TrainerEngine};
var RES=[["o2","Oxygen","#6fd3ff",160],["water","Water","#4d9bff",160],["food","Food","#8be08b",120],["parts","Parts","#ffd166",100],["regolith","Regolith","#c9a27a",120],["science","Science","#d79bff",250]];
function download(name,text,type){
var blob=new Blob([text],{type:type||"text/plain"});
var a=document.createElement("a");
a.href=URL.createObjectURL(blob);a.download=name;a.click();URL.revokeObjectURL(a.href)}
function saveHighScore(){
if(!s||!s.over){return}
var raw=localStorage.getItem("jamt_scores");
var list=raw?JSON.parse(raw):[];
list.push({name:s.missionName||"Unnamed",site:s.site,diff:s.difficulty,score:TrainerEngine.score(s),won:s.won,sol:s.sol});
list.sort(function(a,b){return b.score-a.score});
list=list.slice(0,5);
localStorage.setItem("jamt_scores",JSON.stringify(list))}
function renderHighScores(){
var raw=localStorage.getItem("jamt_scores");
var list=raw?JSON.parse(raw):[];
if(!list.length){$("highScores").innerHTML="";return}
var h="<h3>Best missions</h3>";
list.forEach(function(x,i){h+='<div class="score">'+(i+1)+". "+x.name+" — "+x.score+" pts ("+x.site+", "+x.diff+(x.won?", won":"")+")</div>"});
$("highScores").innerHTML=h}
function render(){
if(!s){return}
$("solLine").textContent=(s.missionName?s.missionName+" — ":"")+TrainerEngine.SITES[s.site].name+" — Sol "+s.sol;
$("objective").textContent=s.difficulty==="sandbox"?"Sandbox: build freely, no fail states.":("Goal: "+s.objectiveScience+" science by sol "+s.objectiveSols+". Quiz every 5 sols. Score now: "+TrainerEngine.score(s));
var bars="";
RES.forEach(function(r){
var v=Math.floor(s.res[r[0]]);
var pct=Math.max(0,Math.min(100,(v/r[3])*100));
var cls=r[0]==="o2"||r[0]==="water"||r[0]==="food"?(v<20?" low":""):"";
bars+='<div class="bar"><div class="lab"><span>'+r[1]+'</span><span class="'+cls.trim()+'">'+v+"</span></div>"+'<div class="track"><div class="fill" style="width:'+pct+"%;background:"+r[2]+'"></div></div></div>'});
$("bars").innerHTML=bars;
var pb=TrainerEngine.powerBreakdown(s);
var pbTxt=pb.consumers.map(function(c){return c.name+" x"+c.count+" ("+c.watts+")"}).join(", ");
$("powerLine").textContent="Power: "+s.lastPowerGen+" generated / "+s.lastPowerUse+" used / "+s.powerStore+" stored. Shielding "+s.shieldLevel+". "+pbTxt+(s.stormActive?" DUST STORM ACTIVE.":"");
var fc=TrainerEngine.forecast(s);
$("forecastLine").textContent=fc?("Tomorrow's forecast: "+fc.text):"Tomorrow's forecast: unclear skies.";
var bl="";
Object.keys(TrainerEngine.BUILDINGS).forEach(function(t){
var d=TrainerEngine.BUILDINGS[t];
var ok=TrainerEngine.canBuild(s,t);
bl+='<div class="bld"><div><strong>'+d.name+'</strong> ('+d.cost+' parts)<small>'+d.desc+"</small></div>"+'<button data-build="'+t+'"'+(ok?"":" disabled")+">Build</button></div>"});
$("buildList").innerHTML=bl;
Array.prototype.forEach.call(document.querySelectorAll("[data-build]"),function(btn){
btn.onclick=function(){TrainerEngine.build(s,btn.getAttribute("data-build"));render()}});
var tl="";
Object.keys(TrainerEngine.TECHS).forEach(function(k){
var t=TrainerEngine.TECHS[k];
var has=!!s.techs[k];
var ok=!has&&s.res.science>=t.cost;
tl+='<div class="bld"><div><strong>'+t.name+'</strong> ('+t.cost+' science)<small>'+t.desc+"</small></div>"+(has?'<span class="chip on">researched</span>':'<button data-tech="'+k+'"'+(ok?"":" disabled")+">Research</button>")+"</div>"});
$("techList").innerHTML=tl;
Array.prototype.forEach.call(document.querySelectorAll("[data-tech]"),function(btn){
btn.onclick=function(){TrainerEngine.research(s,btn.getAttribute("data-tech"));render()}});
var cl="";
s.crew.forEach(function(c,i){
var lvl=TrainerEngine.cLevel(c);
var st=c.health<=0?"DECEASED":(c.away>0?"ON EXPEDITION ("+c.away+" sol)":("H "+Math.round(c.health)+" / M "+Math.round(c.morale)+" / F "+Math.round(c.fatigue||0)+" / Lv"+lvl));
cl+='<div class="crew"><span>'+c.name+" <small>("+c.role+")</small></span>"+'<span class="h'+(c.health<40?" low":"")+'">'+st+"</span>"+'<select data-retrain="'+i+'"><option value="">retrain…</option>'+TrainerEngine.ROLES.map(function(r){return '<option value="'+r+'"'+(r===c.role?" disabled":"")+">"+r+"</option>"}).join("")+"</select></div>"});
$("crewList").innerHTML=cl;
Array.prototype.forEach.call(document.querySelectorAll("[data-retrain]"),function(sel){
sel.onchange=function(){if(sel.value){TrainerEngine.retrain(s,parseInt(sel.getAttribute("data-retrain"),10),sel.value);render()}}});
$("recruitBtn").disabled=!(s.res.parts>=25&&s.crew.length<TrainerEngine.crewCapacity(s));
$("rationSel").value=String(s.rations);
$("manifestSel").value=s.manifest;
var el="";
Object.keys(TrainerEngine.EXPEDITIONS).forEach(function(k){
var x=TrainerEngine.EXPEDITIONS[k];
el+='<div class="bld"><div><strong>'+x.name+'</strong> ('+x.cost+" parts, "+x.sols+' sols)<small>'+(x.science?"+"+x.science+" science":x.water?"+"+x.water+" water":"+"+x.parts+" parts")+", tiring, 10% breakdown risk</small></div>"+'<button data-exped="'+k+'">Send 2 crew</button></div>'});
$("expedList").innerHTML=el;
Array.prototype.forEach.call(document.querySelectorAll("[data-exped]"),function(btn){
btn.onclick=function(){var r=TrainerEngine.expedition(s,btn.getAttribute("data-exped"));if(!r.ok){alert(r.msg)}render()}});
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
btn.onclick=function(){TrainerEngine.repair(s,parseInt(btn.getAttribute("data-repair"),10));render()}});
Array.prototype.forEach.call(document.querySelectorAll("[data-eva]"),function(btn){
btn.onclick=function(){
var idx=parseInt(btn.getAttribute("data-eva"),10);
var best=0,bestH=-1;
s.crew.forEach(function(c,i2){if(c.health>bestH&&(c.away||0)<=0&&(c.fatigue||0)<=70){bestH=c.health;best=i2}});
var eng=s.crew.findIndex(function(c){return c.role==="Engineer"&&c.health>0&&(c.away||0)<=0&&(c.fatigue||0)<=70});
TrainerEngine.evaRepair(s,idx,eng>=0?eng:best);render()}});
Array.prototype.forEach.call(document.querySelectorAll("[data-crop]"),function(sel){
sel.onchange=function(){TrainerEngine.setCrop(s,parseInt(sel.getAttribute("data-crop"),10),sel.value);render()}});
var tips=TrainerEngine.advise(s);
var th="";
tips.forEach(function(t){th+='<div class="alert info">'+t+"</div>"});
$("advice").innerHTML=th;
var st2=TrainerEngine.statsSummary(s);
$("statsPanel").innerHTML='<div class="score">Science earned: '+st2.scienceEarned+" | Power generated: "+st2.powerGenerated+" | Water mined: "+st2.waterMined+"</div>"+'<div class="score">Expeditions: '+st2.expeditions+" | Storms survived: "+st2.stormsSurvived+" | Quiz correct: "+st2.quizCorrect+" | Achievements: "+st2.achievements+"/"+TrainerEngine.ACHIEVEMENTS.length+"</div>";
renderHighScores();
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
var r=TrainerEngine.answerQuiz(s,parseInt(btn.getAttribute("data-quiz"),10));
$("quizFact").textContent=(r.correct?"Correct! +6 parts, +5 science. ":"Not quite. ")+r.fact;
$("quizOpts").innerHTML="";
setTimeout(function(){qp.hidden=true;render()},4200);
render()}});
}else{qp.hidden=true}
var lg="";
s.log.forEach(function(e){lg+='<div><span class="sol">Sol '+e.sol+":</span> "+e.msg+"</div>"});
$("log").innerHTML=lg;
var ach="";
TrainerEngine.ACHIEVEMENTS.forEach(function(a){
var on=s.earned.indexOf(a.id)>=0;
ach+='<span class="chip'+(on?" on":"")+'">'+a.name+"</span>"});
$("ach").innerHTML=ach;
var eb=$("endBanner");
if(s.over){
saveHighScore();
eb.hidden=false;
eb.className=s.won?"win":"lose";
eb.textContent=(s.won?"MISSION SUCCESS — science goal reached, crew alive. ":"MISSION FAILED — review the log and try a new strategy. ")+"Final score: "+TrainerEngine.score(s)+".";
$("solBtn").disabled=true;
}else{eb.hidden=true;$("solBtn").disabled=false}}
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
$("setup").hidden=true;$("game").hidden=false;render()};
$("solBtn").onclick=function(){TrainerEngine.tick(s);render()};
$("autoBtn").onclick=function(){
if(autoTimer){clearInterval(autoTimer);autoTimer=null;$("autoBtn").textContent="Auto: off";return}
$("autoBtn").textContent="Auto: on";
autoTimer=setInterval(function(){if(!s||s.over){clearInterval(autoTimer);autoTimer=null;$("autoBtn").textContent="Auto: off";return}TrainerEngine.tick(s);render()},900)};
$("reportBtn").onclick=function(){download("mission-report-sol"+s.sol+".txt",TrainerEngine.report(s))};
$("reportJsonBtn").onclick=function(){download("mission-report-sol"+s.sol+".json",JSON.stringify(TrainerEngine.reportJSON(s),null,2),"application/json")};
$("saveBtn").onclick=function(){localStorage.setItem("jamtrainer",JSON.stringify(s))};
$("loadBtn").onclick=function(){
var raw=localStorage.getItem("jamtrainer");
if(!raw){return}
s=JSON.parse(raw);
$("setup").hidden=true;$("game").hidden=false;render()};
$("contrastBtn").onclick=function(){document.body.classList.toggle("hc")};
$("rationSel").onchange=function(){if(s){TrainerEngine.setRations(s,parseFloat($("rationSel").value));render()}};
$("manifestSel").onchange=function(){if(s){TrainerEngine.setManifest(s,$("manifestSel").value);render()}};
$("newBtn").onclick=function(){if(autoTimer){clearInterval(autoTimer);autoTimer=null}$("setup").hidden=false;$("game").hidden=true;s=null};
document.addEventListener("keydown",function(e){
if(!s||$("game").hidden){return}
if(e.key===" "&&!s.over){e.preventDefault();TrainerEngine.tick(s);render()}
if(e.key==="s"){$("saveBtn").click()}});
showSiteCompare();
})();
