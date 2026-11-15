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
var cost=TrainerEngine.researchCost(s,k);
var ok=!has&&s.res.science>=cost;
tl+='<div class="bld"><div><strong>'+t.name+'</strong> ('+cost+' science)<small>'+t.desc+"</small></div>"+(has?'<span class="chip on">researched</span>':'<button data-tech="'+k+'"'+(ok?"":" disabled")+">Research</button>")+"</div>"});
$("techList").innerHTML=tl;
Array.prototype.forEach.call(document.querySelectorAll("[data-tech]"),function(btn){
btn.onclick=function(){TrainerEngine.research(s,btn.getAttribute("data-tech"));render()}});
var cl="";
s.crew.forEach(function(c,i){
var lvl=TrainerEngine.cLevel(c);
var st=c.health<=0?"DECEASED":(c.away>0?"ON EXPEDITION ("+c.away+" sol)":("H "+Math.round(c.health)+" / M "+Math.round(c.morale)+" / F "+Math.round(c.fatigue||0)+" / Lv"+lvl));
cl+='<div class="crew"><span>'+c.name+" <small>("+c.role+")</small></span>"+'<button data-rest="'+i+'"'+(c.health<=0||c.away>0?" disabled":"")+">Rest</button>"+'<span class="h'+(c.health<40?" low":"")+'">'+st+"</span>"+'<select data-retrain="'+i+'"><option value="">retrain…</option>'+TrainerEngine.ROLES.map(function(r){return '<option value="'+r+'"'+(r===c.role?" disabled":"")+">"+r+"</option>"}).join("")+"</select></div>"});
$("crewList").innerHTML=cl;
Array.prototype.forEach.call(document.querySelectorAll("[data-retrain]"),function(sel){
sel.onchange=function(){if(sel.value){TrainerEngine.retrain(s,parseInt(sel.getAttribute("data-retrain"),10),sel.value);render()}}});
Array.prototype.forEach.call(document.querySelectorAll("[data-rest]"),function(btn){
btn.onclick=function(){TrainerEngine.rest(s,parseInt(btn.getAttribute("data-rest"),10));render()}});
$("recruitBtn").disabled=!(s.res.parts>=25&&s.crew.length<TrainerEngine.crewCapacity(s));
$("rationSel").value=String(s.rations);
$("manifestSel").value=s.manifest;
var el="";
Object.keys(TrainerEngine.EXPEDITIONS).forEach(function(k){
var x=TrainerEngine.EXPEDITIONS[k];
var yieldTxt=[x.science?"+"+x.science+" science":null,x.water?"+"+x.water+" water":null,x.parts?"+"+x.parts+" parts":null,x.relay?"relay buff":null].filter(Boolean).join(", ");
el+='<div class="bld"><div><strong>'+x.name+'</strong> ('+x.cost+" parts, "+x.sols+' sols)<small>'+yieldTxt+", tiring, 10% breakdown risk</small></div>"+'<button data-exped="'+k+'">Send 2 crew</button></div>'});
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
var r=TrainerEngine.answerQuiz(s,parseInt(btn.getAttribute("data-quiz"),10));
$("quizFact").textContent=(r.correct?"Correct! +6 parts, +5 science. ":"Not quite. ")+r.fact+(s.quizStreak>1?" Streak: "+s.quizStreak+".":"");
$("quizOpts").innerHTML="";
setTimeout(function(){qp.hidden=true;render()},4200);
render()}});
}else{qp.hidden=true}
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
var eb=$("endBanner");
if(s.over){
saveHighScore();
eb.hidden=false;
eb.className=s.won?"win":"lose";
var pm=TrainerEngine.postMortem(s);
eb.innerHTML=(s.won?"MISSION SUCCESS — review complete. ":"MISSION FAILED — review the log and try a new strategy. ")+"Final score: "+TrainerEngine.score(s)+" (grade "+TrainerEngine.letterGrade(s)+"). "+(s.won?"":pm.join(" "));
$("solBtn").disabled=true;
}else{eb.hidden=true;$("solBtn").disabled=false}}
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
if(ws){h+="<p>Last 7 sols: science "+(ws.scienceDelta>=0?"+":"")+ws.scienceDelta+", food "+(ws.foodDelta>=0?"+":"")+ws.foodDelta+", water "+(ws.waterDelta>=0?"+":"")+ws.waterDelta+", parts "+(ws.partsDelta>=0?"+":"")+ws.partsDelta+".</p>"}
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
Object.keys(TrainerEngine.BUILDINGS).forEach(function(t){
$("drySel").innerHTML+='<option value="'+t+'">'+TrainerEngine.BUILDINGS[t].name+"</option>"});
$("drySel").onchange=function(){
if(!s){return}
var d=TrainerEngine.dryRunBuild(s,this.value);
$("dryOut").innerHTML=d?'<p class="hint">'+d.name+": "+d.cost+" parts, "+d.buildSols+" sol(s) to build. Power: "+(d.powerDelta>=0?"+":"")+d.powerDelta+" generated, "+d.powerUse+" draw. "+d.note+"</p>":""};
$("cleanBtn").onclick=function(){$("opsMsg").textContent=TrainerEngine.cleanSolar(s)?"Panels cleaned: +20% solar for 3 sols.":"Needs 2 parts and an online array.";render()};
$("suitBtn").onclick=function(){$("opsMsg").textContent=TrainerEngine.suitMaintenance(s)?"Suits serviced: next EVA is safer.":"Needs 3 parts.";render()};
$("repAllBtn").onclick=function(){var n=TrainerEngine.repairAll(s);$("opsMsg").textContent=n?("Repaired "+n+" building(s)."):"Nothing affordable to repair.";render()};
$("shelterBtn").onclick=function(){TrainerEngine.shelterMode(s);$("opsMsg").textContent="Shelter mode set for next sol.";render()};
$("histSel").onchange=drawHistory;
$("histCsvBtn").onclick=function(){download("resource-history.csv",TrainerEngine.historyCSV(s),"text/csv")};
$("briefBtn").onclick=function(){
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
var ph="<p>Science pace: "+p.plan.perSol+"/sol, ETA "+p.plan.etaSols+" sols ("+p.plan.note+"). Shield L"+p.plan.shieldNext+" next. Difficulty: "+p.difficulty+".</p>";
ph+="<p>Storm checklist: "+E.stormPrepChecklist(s).join("; ")+"</p>";
$("projOut").innerHTML=ph;
var gh="<h4>Night prep</h4><p>"+E.nightPrepChecklist(s).join("; ")+"</p>";
gh+="<h4>Glossary</h4><p>"+E.glossaryTerms().map(function(g){return g.term+": "+g.def}).join("<br>")+"</p>";
gh+="<h4>FAQ</h4><p>"+E.faqList().map(function(f){return f.q+" - "+f.a}).join("<br>")+"</p>";
gh+="<h4>Quiz bank</h4><p>"+E.quizBankStats().questions+" questions across "+E.quizBankStats().categories.join(", ")+"</p>";
$("guideOut").innerHTML=gh};
$("summaryBtn").onclick=function(){
var t=TrainerEngine.summaryEmailText(s);
if(navigator.clipboard){navigator.clipboard.writeText(t)}else{download("mission-summary.txt",t)}
$("briefOut").innerHTML="<p>Summary copied: "+t+"</p>"};
$("mdLogBtn").onclick=function(){download("mission-log.md",TrainerEngine.markdownLog(s),"text/markdown")};
$("statsBtn").onclick=function(){download("mission-stats.json",TrainerEngine.statsJSON(s),"application/json")};
$("buildCsvBtn").onclick=function(){download("build-plan.csv",TrainerEngine.buildPlanCSV(s),"text/csv")};
$("techCsvBtn").onclick=function(){download("tech-tree.csv",TrainerEngine.techTreeCSV(),"text/csv")};
$("sitesCsvBtn").onclick=function(){download("site-comparison.csv",TrainerEngine.siteComparisonCSV(),"text/csv")};
$("stateCheckBtn").onclick=function(){
var errs=TrainerEngine.validateState(s);
$("briefOut").innerHTML=errs.length?("<p>Issues: "+errs.join("; ")+"</p>"):"<p>State integrity OK (hash "+TrainerEngine.stateHash(s)+").</p>"};
$("crewCsvBtn").onclick=function(){download("crew-roster.csv",TrainerEngine.crewCSV(s),"text/csv")};
$("shareBtn").onclick=function(){
var t=TrainerEngine.shareText(s);
if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(t)}
$("opsMsg").textContent="Share text: "+t};
document.addEventListener("keydown",function(e){
if(!s||$("game").hidden){return}
if(e.key===" "&&!s.over){e.preventDefault();TrainerEngine.tick(s);render()}
if(e.key==="s"){$("saveBtn").click()}});
showSiteCompare();
})();
