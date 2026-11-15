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
btn.onclick=function(){if(!s)return;TrainerEngine.build(s,btn.getAttribute("data-build"));render()}});
var tl="";
Object.keys(TrainerEngine.TECHS).forEach(function(k){
var t=TrainerEngine.TECHS[k];
var has=!!s.techs[k];
var cost=TrainerEngine.researchCost(s,k);
var ok=!has&&s.res.science>=cost;
tl+='<div class="bld"><div><strong>'+t.name+'</strong> ('+cost+' science)<small>'+t.desc+"</small></div>"+(has?'<span class="chip on">researched</span>':'<button data-tech="'+k+'"'+(ok?"":" disabled")+">Research</button>")+"</div>"});
$("techList").innerHTML=tl;
Array.prototype.forEach.call(document.querySelectorAll("[data-tech]"),function(btn){
btn.onclick=function(){if(!s)return;TrainerEngine.research(s,btn.getAttribute("data-tech"));render()}});
var cl="";
s.crew.forEach(function(c,i){
var lvl=TrainerEngine.cLevel(c);
var st=c.health<=0?"DECEASED":(c.away>0?"ON EXPEDITION ("+c.away+" sol)":("H "+Math.round(c.health)+" / M "+Math.round(c.morale)+" / F "+Math.round(c.fatigue||0)+" / Lv"+lvl));
cl+='<div class="crew"><span>'+c.name+" <small>("+c.role+")</small></span>"+'<button data-rest="'+i+'"'+(c.health<=0||c.away>0?" disabled":"")+">Rest</button>"+'<span class="h'+(c.health<40?" low":"")+'">'+st+"</span>"+'<select data-retrain="'+i+'"><option value="">retrain…</option>'+TrainerEngine.ROLES.map(function(r){return '<option value="'+r+'"'+(r===c.role?" disabled":"")+">"+r+"</option>"}).join("")+"</select></div>"});
$("crewList").innerHTML=cl;
Array.prototype.forEach.call(document.querySelectorAll("[data-retrain]"),function(sel){
sel.onchange=function(){if(sel.value){TrainerEngine.retrain(s,parseInt(sel.getAttribute("data-retrain"),10),sel.value);render()}}});
Array.prototype.forEach.call(document.querySelectorAll("[data-rest]"),function(btn){
btn.onclick=function(){if(!s)return;TrainerEngine.rest(s,parseInt(btn.getAttribute("data-rest"),10));render()}});
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
btn.onclick=function(){if(!s)return;var r=TrainerEngine.expedition(s,btn.getAttribute("data-exped"));if(!r.ok){alert(r.msg)}render()}});
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
if(!s)return;
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
$("solBtn").onclick=function(){if(!s)return;TrainerEngine.tick(s);render()};
$("autoBtn").onclick=function(){
if(!s)return;
if(autoTimer){clearInterval(autoTimer);autoTimer=null;$("autoBtn").textContent="Auto: off";return}
$("autoBtn").textContent="Auto: on";
autoTimer=setInterval(function(){if(!s||s.over){clearInterval(autoTimer);autoTimer=null;$("autoBtn").textContent="Auto: off";return}TrainerEngine.tick(s);render()},900)};
$("reportBtn").onclick=function(){if(!s)return;download("mission-report-sol"+s.sol+".txt",TrainerEngine.report(s))};
$("reportJsonBtn").onclick=function(){if(!s)return;download("mission-report-sol"+s.sol+".json",JSON.stringify(TrainerEngine.reportJSON(s),null,2),"application/json")};
$("saveBtn").onclick=function(){if(!s)return;localStorage.setItem("jamtrainer",JSON.stringify(s))};
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
$("cleanBtn").onclick=function(){if(!s)return;$("opsMsg").textContent=TrainerEngine.cleanSolar(s)?"Panels cleaned: +20% solar for 3 sols.":"Needs 2 parts and an online array.";render()};
$("suitBtn").onclick=function(){if(!s)return;$("opsMsg").textContent=TrainerEngine.suitMaintenance(s)?"Suits serviced: next EVA is safer.":"Needs 3 parts.";render()};
$("repAllBtn").onclick=function(){if(!s)return;var n=TrainerEngine.repairAll(s);$("opsMsg").textContent=n?("Repaired "+n+" building(s)."):"Nothing affordable to repair.";render()};
$("shelterBtn").onclick=function(){if(!s)return;TrainerEngine.shelterMode(s);$("opsMsg").textContent="Shelter mode set for next sol.";render()};
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
var ph="<p>Science pace: "+p.plan.perSol+"/sol, ETA "+p.plan.etaSols+" sols ("+p.plan.note+"). Shield L"+p.plan.shieldNext+" next. Difficulty: "+p.difficulty+".</p>";
ph+="<p>Storm checklist: "+E.stormPrepChecklist(s).join("; ")+"</p>";
$("projOut").innerHTML=ph;
var gh="<h4>Night prep</h4><p>"+E.nightPrepChecklist(s).join("; ")+"</p>";
gh+="<h4>Glossary</h4><p>"+E.glossaryTerms().map(function(g){return g.term+": "+g.def}).join("<br>")+"</p>";
gh+="<h4>FAQ</h4><p>"+E.faqList().map(function(f){return f.q+" - "+f.a}).join("<br>")+"</p>";
gh+="<h4>Quiz bank</h4><p>"+E.quizBankStats().questions+" questions across "+E.quizBankStats().categories.join(", ")+"</p>";
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
r5Show(r5tbl([["Projected science",p.projected],["Target",p.target],["Will win",p.willWin]]))};
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
document.getElementById("q01r5msg").textContent=(r.correct?" Correct! ":" Not quite. ")+r.fact}})};

function r16Show(x){$("r16Out").textContent=typeof x==="object"?JSON.stringify(x):String(x)}
function r16need(){if(!s){r16Show("Start a mission first.");return true}return false}
$("r16a").onclick=function(){if(!s)return;if(r16need())return;r16Show(E().a7a(s))};
$("r16b").onclick=function(){if(!s)return;if(r16need())return;r16Show(E().a7b(s))};
$("r16c").onclick=function(){if(!s)return;if(r16need())return;r16Show(E().a7c(s))};
$("r16d").onclick=function(){if(!s)return;if(r16need())return;r16Show(E().a7d(s))};
$("r16e").onclick=function(){if(!s)return;if(r16need())return;r16Show(E().a7e(s))};
$("r16f").onclick=function(){if(!s)return;if(r16need())return;r16Show(E().a7f(s))};
$("r16g").onclick=function(){if(!s)return;if(r16need())return;r16Show(E().a7g(s))};
$("r16h").onclick=function(){if(!s)return;if(r16need())return;r16Show(E().a7h(s))};
$("r16i").onclick=function(){if(!s)return;if(r16need())return;r16Show(E().a7i(s))};
$("r16j").onclick=function(){if(!s)return;if(r16need())return;r16Show(E().a7j(s))};
$("r16k").onclick=function(){if(!s)return;if(r16need())return;r16Show(E().a7k(s))};
$("r16l").onclick=function(){if(!s)return;if(r16need())return;r16Show(E().a7l(s,"habitat"))};
$("r16m").onclick=function(){if(!s)return;if(r16need())return;r16Show(E().a7m(s))};
$("r16n").onclick=function(){if(!s)return;if(r16need())return;r16Show(E().a7n(s))};
$("r16o").onclick=function(){if(!s)return;if(r16need())return;r16Show(E().a7o(s))};
$("r16p").onclick=function(){if(!s)return;if(r16need())return;r16Show(E().a7p(s))};
$("r16q").onclick=function(){if(!s)return;if(r16need())return;r16Show(E().a7q(s))};
$("r16r").onclick=function(){if(!s)return;if(r16need())return;r16Show(E().a7r(s))};
$("r16s").onclick=function(){if(!s)return;if(r16need())return;r16Show(E().a7s(s))};
$("r16t").onclick=function(){if(!s)return;if(r16need())return;r16Show(E().a7t(s))};
$("r16u").onclick=function(){if(!s)return;if(r16need())return;r16Show(E().a7u(s))};
$("r16v").onclick=function(){if(!s)return;if(r16need())return;r16Show(E().a7v(s))};
$("r16w").onclick=function(){if(!s)return;if(r16need())return;r16Show(E().a7w(s))};
$("r16x").onclick=function(){if(!s)return;if(r16need())return;r16Show(E().a7x(s))};
$("r16y").onclick=function(){if(!s)return;if(r16need())return;r16Show(E().a7y(s))};
$("r16z").onclick=function(){if(!s)return;if(r16need())return;r16Show(E().a7z(s))};
$("r16aa").onclick=function(){if(!s)return;if(r16need())return;r16Show(E().a7ba(s))};
$("r16ab").onclick=function(){if(!s)return;if(r16need())return;r16Show(E().a7bb(s))};
$("r16ac").onclick=function(){if(!s)return;if(r16need())return;r16Show(E().a7bc(s))};
$("r16ad").onclick=function(){if(!s)return;if(r16need())return;r16Show(E().a7bd(s))};
$("r16ae").onclick=function(){if(!s)return;if(r16need())return;r16Show(E().a7be(s))};
$("r16af").onclick=function(){if(!s)return;if(r16need())return;r16Show(E().a7bf(s))};
$("r16ag").onclick=function(){if(!s)return;if(r16need())return;r16Show(E().a7bg(s))};
$("r16ah").onclick=function(){if(!s)return;if(r16need())return;r16Show(E().a7bh(s))};
$("r16ai").onclick=function(){if(!s)return;if(r16need())return;r16Show(E().a7bi(s))};
$("r16aj").onclick=function(){if(!s)return;if(r16need())return;r16Show(E().a7bj(s))};
$("r16ak").onclick=function(){if(!s)return;if(r16need())return;r16Show(E().a7bk(s))};
$("r16al").onclick=function(){if(!s)return;if(r16need())return;r16Show(E().a7bl(s))};
$("r16am").onclick=function(){if(!s)return;if(r16need())return;r16Show(E().a7bm(s))};
$("r16an").onclick=function(){if(!s)return;if(r16need())return;r16Show(E().a7bn(s))};
function r156Set(x){$("r156Out").textContent=String(x)}
var r156h={"a":"TrainerEngine.o7a(S)","b":"TrainerEngine.o7b(S)","c":"TrainerEngine.o7c(S)","d":"TrainerEngine.o7d(S)","e":"TrainerEngine.o7e(S)","f":"TrainerEngine.o7f(S)","g":"TrainerEngine.o7g(S)","h":"TrainerEngine.o7h(S)","i":"TrainerEngine.o7i(S)","j":"TrainerEngine.o7j(S)","k":"TrainerEngine.o7k(S)","l":"TrainerEngine.o7l(S)","m":"TrainerEngine.o7m(S)","n":"TrainerEngine.o7n(S)","o":"TrainerEngine.o7o(S)","p":"TrainerEngine.o7p(S)","q":"TrainerEngine.o7q(S)","r":"TrainerEngine.o7r(S)","s":"TrainerEngine.o7s(S)","t":"TrainerEngine.o7t(S)","u":"TrainerEngine.o7u(S)","v":"TrainerEngine.o7v(S)","w":"TrainerEngine.o7w(S)","x":"JSON.stringify(TrainerEngine.o7x(S))","y":"TrainerEngine.o7y(S)","z":"TrainerEngine.o7z(S)","ba":"TrainerEngine.o7bb(S)","bb":"TrainerEngine.o7bc(S)","bc":"TrainerEngine.o7bd(S)","bd":"TrainerEngine.o7be(S)","be":"JSON.stringify(TrainerEngine.o7bf(S))","bf":"TrainerEngine.o7bh(S)","bg":"TrainerEngine.o7bi(S)","bh":"TrainerEngine.o7bl(S)","bi":"TrainerEngine.o7bn(S)","bj":"TrainerEngine.o7bq(S)","bk":"TrainerEngine.o7bw(S)","bl":"TrainerEngine.o7bx(S)","bm":"TrainerEngine.o7by(S)","bn":"TrainerEngine.o7bz(S)","bo":"TrainerEngine.o7ca(S)","bp":"TrainerEngine.o7cb(S)","bq":"TrainerEngine.o7ce(S)","br":"TrainerEngine.o7ch(S)","bs":"TrainerEngine.o7ck(S)","bt":"TrainerEngine.o7cv(S)","bu":"TrainerEngine.o7cw(S)","bv":"TrainerEngine.o7da(S)","bw":"TrainerEngine.o7de()","bx":"TrainerEngine.o7dj()","by":"TrainerEngine.o7dk()","bz":"TrainerEngine.o7dl()","ca":"TrainerEngine.o7dn(S)","cb":"TrainerEngine.o7dq(S)","cc":"TrainerEngine.o7ds(S)","cd":"TrainerEngine.o7du(S)","ce":"TrainerEngine.o7dv(S)","cf":"TrainerEngine.o7dx(S)","cg":"TrainerEngine.o7dy(S)","ch":"TrainerEngine.o7dz(S)","ci":"TrainerEngine.o7ea(S)","cj":"TrainerEngine.o7ex(S)","ck":"TrainerEngine.o7ey(S)","cl":"TrainerEngine.o7fb(S)","cm":"TrainerEngine.o7fk(S)"}
for(var key in r156h){(function(k){var el=$("r156"+k);if(el){el.onclick=function(){var S=s||TrainerEngine.newGame("moon",7,"standard");try{r156Set(eval(r156h[k]))}catch(err){r156Set("error: "+err.message)}}}})(key)}
function r300Set(x){$("r300Out").textContent=String(x)}
var r300h={"a":"JSON.stringify(TrainerEngine.ba8_storm_id())","b":"JSON.stringify(TrainerEngine.ba8_storm_w())","c":"JSON.stringify(TrainerEngine.ba8_storm_sites_n())","d":"JSON.stringify(TrainerEngine.ba8_storm_sites_first())","e":"JSON.stringify(TrainerEngine.ba8_storm_text_wc())","f":"JSON.stringify(TrainerEngine.ba8_micro_id())","g":"JSON.stringify(TrainerEngine.ba8_micro_w())","h":"JSON.stringify(TrainerEngine.ba8_micro_sites_n())","i":"JSON.stringify(TrainerEngine.ba8_micro_sites_first())","j":"JSON.stringify(TrainerEngine.ba8_micro_text_wc())","k":"JSON.stringify(TrainerEngine.ba8_illness_id())","l":"JSON.stringify(TrainerEngine.ba8_illness_w())","m":"JSON.stringify(TrainerEngine.ba8_illness_sites_n())","n":"JSON.stringify(TrainerEngine.ba8_illness_sites_first())","o":"JSON.stringify(TrainerEngine.ba8_illness_text_wc())","p":"JSON.stringify(TrainerEngine.ba8_aurora_id())","q":"JSON.stringify(TrainerEngine.ba8_aurora_w())","r":"JSON.stringify(TrainerEngine.ba8_aurora_sites_n())","s":"JSON.stringify(TrainerEngine.ba8_aurora_sites_first())","t":"JSON.stringify(TrainerEngine.ba8_aurora_text_wc())","u":"JSON.stringify(TrainerEngine.ba8_quake_id())","v":"JSON.stringify(TrainerEngine.ba8_quake_w())","w":"JSON.stringify(TrainerEngine.ba8_quake_sites_n())","x":"JSON.stringify(TrainerEngine.ba8_quake_sites_first())","y":"JSON.stringify(TrainerEngine.ba8_quake_text_wc())","z":"JSON.stringify(TrainerEngine.ba8_find_id())","aa":"JSON.stringify(TrainerEngine.ba8_find_w())","ab":"JSON.stringify(TrainerEngine.ba8_find_sites_n())","ac":"JSON.stringify(TrainerEngine.ba8_find_sites_first())","ad":"JSON.stringify(TrainerEngine.ba8_find_text_wc())","ae":"JSON.stringify(TrainerEngine.ba8_relay_id())","af":"JSON.stringify(TrainerEngine.ba8_relay_w())","ag":"JSON.stringify(TrainerEngine.ba8_relay_sites_n())","ah":"JSON.stringify(TrainerEngine.ba8_relay_sites_first())","ai":"JSON.stringify(TrainerEngine.ba8_relay_text_wc())","aj":"JSON.stringify(TrainerEngine.ba8_calm_id())","ak":"JSON.stringify(TrainerEngine.ba8_calm_text())","al":"JSON.stringify(TrainerEngine.ba8_calm_w())","am":"JSON.stringify(TrainerEngine.ba8_calm_sites_n())","an":"JSON.stringify(TrainerEngine.ba8_calm_sites_first())","ao":"JSON.stringify(TrainerEngine.ba8_calm_text_wc())","ap":"JSON.stringify(TrainerEngine.ba8_flare_id())","aq":"JSON.stringify(TrainerEngine.ba8_flare_text())","ar":"JSON.stringify(TrainerEngine.ba8_flare_w())","as":"JSON.stringify(TrainerEngine.ba8_flare_sites_n())","at":"JSON.stringify(TrainerEngine.ba8_flare_sites_first())","au":"JSON.stringify(TrainerEngine.ba8_flare_text_wc())","av":"JSON.stringify(TrainerEngine.ba8_birthday_id())","aw":"JSON.stringify(TrainerEngine.ba8_birthday_text())","ax":"JSON.stringify(TrainerEngine.ba8_birthday_w())","ay":"JSON.stringify(TrainerEngine.ba8_birthday_sites_n())","az":"JSON.stringify(TrainerEngine.ba8_birthday_sites_first())","ba":"JSON.stringify(TrainerEngine.ba8_birthday_text_wc())","bb":"JSON.stringify(TrainerEngine.ba8_stowaway_id())","bc":"JSON.stringify(TrainerEngine.ba8_stowaway_w())","bd":"JSON.stringify(TrainerEngine.ba8_stowaway_sites_n())","be":"JSON.stringify(TrainerEngine.ba8_stowaway_sites_first())","bf":"JSON.stringify(TrainerEngine.ba8_stowaway_text_wc())","bg":"JSON.stringify(TrainerEngine.ba8_coolant_id())","bh":"JSON.stringify(TrainerEngine.ba8_coolant_w())","bi":"JSON.stringify(TrainerEngine.ba8_coolant_sites_n())","bj":"JSON.stringify(TrainerEngine.ba8_coolant_sites_first())","bk":"JSON.stringify(TrainerEngine.ba8_coolant_text_wc())","bl":"JSON.stringify(TrainerEngine.ba8_podbonus_id())","bm":"JSON.stringify(TrainerEngine.ba8_podbonus_w())","bn":"JSON.stringify(TrainerEngine.ba8_podbonus_sites_n())","bo":"JSON.stringify(TrainerEngine.ba8_podbonus_sites_first())","bp":"JSON.stringify(TrainerEngine.ba8_podbonus_text_wc())","bq":"JSON.stringify(TrainerEngine.ba8_breakthrough_id())","br":"JSON.stringify(TrainerEngine.ba8_breakthrough_w())","bs":"JSON.stringify(TrainerEngine.ba8_breakthrough_sites_n())","bt":"JSON.stringify(TrainerEngine.ba8_breakthrough_sites_first())","bu":"JSON.stringify(TrainerEngine.ba8_breakthrough_text_wc())","bv":"JSON.stringify(TrainerEngine.ba8_homesick_id())","bw":"JSON.stringify(TrainerEngine.ba8_homesick_text())","bx":"JSON.stringify(TrainerEngine.ba8_homesick_w())","by":"JSON.stringify(TrainerEngine.ba8_homesick_sites_n())","bz":"JSON.stringify(TrainerEngine.ba8_homesick_sites_first())","ca":"JSON.stringify(TrainerEngine.ba8_homesick_text_wc())","cb":"JSON.stringify(TrainerEngine.ba8_meteorshower_id())","cc":"JSON.stringify(TrainerEngine.ba8_meteorshower_w())","cd":"JSON.stringify(TrainerEngine.ba8_meteorshower_sites_n())","ce":"JSON.stringify(TrainerEngine.ba8_meteorshower_sites_first())","cf":"JSON.stringify(TrainerEngine.ba8_meteorshower_text_wc())","cg":"JSON.stringify(TrainerEngine.ba8_o2leak_id())","ch":"JSON.stringify(TrainerEngine.ba8_o2leak_w())","ci":"JSON.stringify(TrainerEngine.ba8_o2leak_sites_n())","cj":"JSON.stringify(TrainerEngine.ba8_o2leak_sites_first())","ck":"JSON.stringify(TrainerEngine.ba8_o2leak_text_wc())","cl":"JSON.stringify(TrainerEngine.ba8_blight_id())","cm":"JSON.stringify(TrainerEngine.ba8_blight_w())","cn":"JSON.stringify(TrainerEngine.ba8_blight_sites_n())","co":"JSON.stringify(TrainerEngine.ba8_blight_sites_first())","cp":"JSON.stringify(TrainerEngine.ba8_blight_text_wc())","cq":"JSON.stringify(TrainerEngine.ba8_argument_id())","cr":"JSON.stringify(TrainerEngine.ba8_argument_w())","cs":"JSON.stringify(TrainerEngine.ba8_argument_sites_n())","ct":"JSON.stringify(TrainerEngine.ba8_argument_sites_first())","cu":"JSON.stringify(TrainerEngine.ba8_argument_text_wc())","cv":"JSON.stringify(TrainerEngine.ba8_dustdevil_id())","cw":"JSON.stringify(TrainerEngine.ba8_dustdevil_w())","cx":"JSON.stringify(TrainerEngine.ba8_dustdevil_sites_n())","cy":"JSON.stringify(TrainerEngine.ba8_dustdevil_sites_first())","cz":"JSON.stringify(TrainerEngine.ba8_dustdevil_text_wc())","da":"JSON.stringify(TrainerEngine.ba8_suitpuncture_id())","db":"JSON.stringify(TrainerEngine.ba8_suitpuncture_w())","dc":"JSON.stringify(TrainerEngine.ba8_suitpuncture_sites_n())","dd":"JSON.stringify(TrainerEngine.ba8_suitpuncture_sites_first())","de":"JSON.stringify(TrainerEngine.ba8_suitpuncture_text_wc())","df":"JSON.stringify(TrainerEngine.ba8_icepocket_id())","dg":"JSON.stringify(TrainerEngine.ba8_icepocket_w())","dh":"JSON.stringify(TrainerEngine.ba8_icepocket_sites_n())","di":"JSON.stringify(TrainerEngine.ba8_icepocket_sites_first())","dj":"JSON.stringify(TrainerEngine.ba8_icepocket_text_wc())","dk":"JSON.stringify(TrainerEngine.ba8_what_did_nasa_s_moxie_experi_c())","dl":"JSON.stringify(TrainerEngine.ba8_what_did_nasa_s_moxie_experi_a_n())","dm":"JSON.stringify(TrainerEngine.ba8_what_did_nasa_s_moxie_experi_a_first())","dn":"JSON.stringify(TrainerEngine.ba8_what_did_nasa_s_moxie_experi_q_wc())","do":"JSON.stringify(TrainerEngine.ba8_what_did_nasa_s_moxie_experi_fact_wc())","dp":"JSON.stringify(TrainerEngine.ba8_why_do_planners_target_the_m_c())"}
for(var key in r300h){(function(k){var el=$("r300"+k);if(el){el.onclick=function(){try{r300Set(eval(r300h[k]))}catch(err){r300Set("error: "+err.message)}}}})(key)}
function r370Set(x){$("r370Out").textContent=String(x)}
var r370h={"a":"JSON.stringify(TrainerEngine.ca9_quiz_has_making())","b":"JSON.stringify(TrainerEngine.ca9_quiz_has_planners())","c":"JSON.stringify(TrainerEngine.ca9_quiz_has_shadowed())","d":"JSON.stringify(TrainerEngine.ca9_quiz_has_light())","e":"JSON.stringify(TrainerEngine.ca9_quiz_has_shielding())","f":"JSON.stringify(TrainerEngine.ca9_quiz_has_night())","g":"JSON.stringify(TrainerEngine.ca9_quiz_has_local())","h":"JSON.stringify(TrainerEngine.ca9_quiz_has_return())","i":"JSON.stringify(TrainerEngine.ca9_quiz_has_sofia())","j":"JSON.stringify(TrainerEngine.ca9_quiz_has_tubes())","k":"JSON.stringify(TrainerEngine.ca9_quiz_has_apollo())","l":"JSON.stringify(TrainerEngine.ca9_quiz_has_experiment())","m":"JSON.stringify(TrainerEngine.ca9_quiz_has_produce())","n":"JSON.stringify(TrainerEngine.ca9_quiz_has_toward())","o":"JSON.stringify(TrainerEngine.ca9_quiz_has_rocket())","p":"JSON.stringify(TrainerEngine.ca9_quiz_has_target())","q":"JSON.stringify(TrainerEngine.ca9_quiz_has_craters())","r":"JSON.stringify(TrainerEngine.ca9_quiz_has_traps())","s":"JSON.stringify(TrainerEngine.ca9_quiz_has_preserve())","t":"JSON.stringify(TrainerEngine.ca9_quiz_has_close())"}
for(var key in r370h){(function(k){var el=$("r370"+k);if(el){el.onclick=function(){try{r370Set(eval(r370h[k]))}catch(err){r370Set("error: "+err.message)}}}})(key)}
function r440Set(x){$("r440Out").textContent=String(x)}
var r440h={"a":"JSON.stringify(TrainerEngine.da0_achievements_scenario_hash())","b":"JSON.stringify(TrainerEngine.da0_achievements_hoarder_hash())","c":"JSON.stringify(TrainerEngine.da0_events_tag_mars())","d":"JSON.stringify(TrainerEngine.da0_events_tag_moon())","e":"JSON.stringify(TrainerEngine.da0_events_sites_distinct())","f":"JSON.stringify(TrainerEngine.da0_quiz_tag_oxygen())","g":"JSON.stringify(TrainerEngine.da0_quiz_tag_water())","h":"JSON.stringify(TrainerEngine.da0_quiz_tag_methane())","i":"JSON.stringify(TrainerEngine.da0_quiz_tag_hydrogen())","j":"JSON.stringify(TrainerEngine.da0_quiz_tag_permanently_shadowed_craters())","k":"JSON.stringify(TrainerEngine.da0_quiz_tag_it_is_the_warmest_region())","l":"JSON.stringify(TrainerEngine.da0_quiz_tag_it_has_the_strongest_gravity())","m":"JSON.stringify(TrainerEngine.da0_quiz_tag_it_is_closest_to_earth())","n":"JSON.stringify(TrainerEngine.da0_quiz_tag_24_hours_37_minutes())","o":"JSON.stringify(TrainerEngine.da0_quiz_tag_12_hours())","p":"JSON.stringify(TrainerEngine.da0_quiz_tag_48_hours())","q":"JSON.stringify(TrainerEngine.da0_quiz_tag_29_5_days())","r":"JSON.stringify(TrainerEngine.da0_quiz_tag_carbon_dioxide())","s":"JSON.stringify(TrainerEngine.da0_quiz_tag_nitrogen())","t":"JSON.stringify(TrainerEngine.da0_quiz_tag_3_to_22_minutes())","u":"JSON.stringify(TrainerEngine.da0_quiz_tag_instant())","v":"JSON.stringify(TrainerEngine.da0_quiz_tag_2_seconds())","w":"JSON.stringify(TrainerEngine.da0_quiz_tag_3_hours())","x":"JSON.stringify(TrainerEngine.da0_quiz_tag_earth_s_magnetosphere())","y":"JSON.stringify(TrainerEngine.da0_quiz_tag_thick_glass())","z":"JSON.stringify(TrainerEngine.da0_quiz_tag_lead_walls())","aa":"JSON.stringify(TrainerEngine.da0_quiz_tag_the_solar_arrays())","ab":"JSON.stringify(TrainerEngine.da0_quiz_tag_about_29_5_earth_days())","ac":"JSON.stringify(TrainerEngine.da0_quiz_tag_24_hours())","ad":"JSON.stringify(TrainerEngine.da0_quiz_tag_7_days())","ae":"JSON.stringify(TrainerEngine.da0_quiz_tag_365_days())","af":"JSON.stringify(TrainerEngine.da0_quiz_tag_heat_from_decaying_plutonium())","ag":"JSON.stringify(TrainerEngine.da0_quiz_tag_burning_methane())","ah":"JSON.stringify(TrainerEngine.da0_quiz_tag_wind_turbines())","ai":"JSON.stringify(TrainerEngine.da0_quiz_tag_coal_cells())","aj":"JSON.stringify(TrainerEngine.da0_quiz_tag_resupply_from_earth_is_slow_())","ak":"JSON.stringify(TrainerEngine.da0_quiz_tag_plants_glow_nicely())","al":"JSON.stringify(TrainerEngine.da0_quiz_tag_soil_is_free_in_space())","am":"JSON.stringify(TrainerEngine.da0_quiz_tag_it_removes_all_co2())","an":"JSON.stringify(TrainerEngine.da0_quiz_tag_dust_blocks_sunlight_and_coa())"}
for(var key in r440h){(function(k){var el=$("r440"+k);if(el){el.onclick=function(){try{r440Set(eval(r440h[k]))}catch(err){r440Set("error: "+err.message)}}}})(key)}
function r510Set(x){$("r510Out").textContent=String(x)}
var r510h={"a":"JSON.stringify(TrainerEngine.ea1_what_did_nasa_s_moxie_experi_has_soil_is_free_in_space())","b":"JSON.stringify(TrainerEngine.ea1_what_did_nasa_s_moxie_experi_has_it_removes_all_co2())","c":"JSON.stringify(TrainerEngine.ea1_what_did_nasa_s_moxie_experi_has_dust_blocks_sunlight_and_coa())","d":"JSON.stringify(TrainerEngine.ea1_what_did_nasa_s_moxie_experi_has_dust_freezes_panels())","e":"JSON.stringify(TrainerEngine.ea1_what_did_nasa_s_moxie_experi_has_dust_conducts_electricity())","f":"JSON.stringify(TrainerEngine.ea1_what_did_nasa_s_moxie_experi_has_no_hazard())","g":"JSON.stringify(TrainerEngine.ea1_what_did_nasa_s_moxie_experi_has_artemis())","h":"JSON.stringify(TrainerEngine.ea1_what_did_nasa_s_moxie_experi_has_apollo())","i":"JSON.stringify(TrainerEngine.ea1_why_do_planners_target_the_m_has_oxygen())","j":"JSON.stringify(TrainerEngine.ea1_why_do_planners_target_the_m_has_methane())","k":"JSON.stringify(TrainerEngine.ea1_why_do_planners_target_the_m_has_water())","l":"JSON.stringify(TrainerEngine.ea1_why_do_planners_target_the_m_has_hydrogen())","m":"JSON.stringify(TrainerEngine.ea1_why_do_planners_target_the_m_has_permanently_shadowed_craters())","n":"JSON.stringify(TrainerEngine.ea1_why_do_planners_target_the_m_has_it_is_the_warmest_region())","o":"JSON.stringify(TrainerEngine.ea1_why_do_planners_target_the_m_has_it_has_the_strongest_gravity())","p":"JSON.stringify(TrainerEngine.ea1_why_do_planners_target_the_m_has_it_is_closest_to_earth())","q":"JSON.stringify(TrainerEngine.ea1_why_do_planners_target_the_m_has_24_hours_37_minutes())","r":"JSON.stringify(TrainerEngine.ea1_why_do_planners_target_the_m_has_12_hours())","s":"JSON.stringify(TrainerEngine.ea1_why_do_planners_target_the_m_has_48_hours())","t":"JSON.stringify(TrainerEngine.ea1_why_do_planners_target_the_m_has_29_5_days())","u":"JSON.stringify(TrainerEngine.ea1_why_do_planners_target_the_m_has_carbon_dioxide())","v":"JSON.stringify(TrainerEngine.ea1_why_do_planners_target_the_m_has_nitrogen())","w":"JSON.stringify(TrainerEngine.ea1_why_do_planners_target_the_m_has_3_to_22_minutes())","x":"JSON.stringify(TrainerEngine.ea1_why_do_planners_target_the_m_has_instant())","y":"JSON.stringify(TrainerEngine.ea1_why_do_planners_target_the_m_has_2_seconds())","z":"JSON.stringify(TrainerEngine.ea1_why_do_planners_target_the_m_has_3_hours())","aa":"JSON.stringify(TrainerEngine.ea1_why_do_planners_target_the_m_has_earth_s_magnetosphere())","ab":"JSON.stringify(TrainerEngine.ea1_why_do_planners_target_the_m_has_thick_glass())","ac":"JSON.stringify(TrainerEngine.ea1_why_do_planners_target_the_m_has_lead_walls())","ad":"JSON.stringify(TrainerEngine.ea1_why_do_planners_target_the_m_has_the_solar_arrays())","ae":"JSON.stringify(TrainerEngine.ea1_why_do_planners_target_the_m_has_about_29_5_earth_days())","af":"JSON.stringify(TrainerEngine.ea1_why_do_planners_target_the_m_has_24_hours())","ag":"JSON.stringify(TrainerEngine.ea1_why_do_planners_target_the_m_has_7_days())","ah":"JSON.stringify(TrainerEngine.ea1_why_do_planners_target_the_m_has_365_days())","ai":"JSON.stringify(TrainerEngine.ea1_why_do_planners_target_the_m_has_heat_from_decaying_plutonium())","aj":"JSON.stringify(TrainerEngine.ea1_why_do_planners_target_the_m_has_burning_methane())","ak":"JSON.stringify(TrainerEngine.ea1_why_do_planners_target_the_m_has_wind_turbines())","al":"JSON.stringify(TrainerEngine.ea1_why_do_planners_target_the_m_has_coal_cells())","am":"JSON.stringify(TrainerEngine.ea1_why_do_planners_target_the_m_has_resupply_from_earth_is_slow_())","an":"JSON.stringify(TrainerEngine.ea1_why_do_planners_target_the_m_has_plants_glow_nicely())","ao":"JSON.stringify(TrainerEngine.ea1_why_do_planners_target_the_m_has_soil_is_free_in_space())","ap":"JSON.stringify(TrainerEngine.ea1_why_do_planners_target_the_m_has_it_removes_all_co2())","aq":"JSON.stringify(TrainerEngine.ea1_why_do_planners_target_the_m_has_dust_blocks_sunlight_and_coa())","ar":"JSON.stringify(TrainerEngine.ea1_why_do_planners_target_the_m_has_dust_freezes_panels())","as":"JSON.stringify(TrainerEngine.ea1_why_do_planners_target_the_m_has_dust_conducts_electricity())","at":"JSON.stringify(TrainerEngine.ea1_why_do_planners_target_the_m_has_no_hazard())","au":"JSON.stringify(TrainerEngine.ea1_why_do_planners_target_the_m_has_artemis())","av":"JSON.stringify(TrainerEngine.ea1_why_do_planners_target_the_m_has_apollo())","aw":"JSON.stringify(TrainerEngine.ea1_about_how_long_is_one_martia_has_oxygen())","ax":"JSON.stringify(TrainerEngine.ea1_about_how_long_is_one_martia_has_methane())","ay":"JSON.stringify(TrainerEngine.ea1_about_how_long_is_one_martia_has_water())","az":"JSON.stringify(TrainerEngine.ea1_about_how_long_is_one_martia_has_hydrogen())","ba":"JSON.stringify(TrainerEngine.ea1_about_how_long_is_one_martia_has_permanently_shadowed_craters())","bb":"JSON.stringify(TrainerEngine.ea1_about_how_long_is_one_martia_has_it_is_the_warmest_region())","bc":"JSON.stringify(TrainerEngine.ea1_about_how_long_is_one_martia_has_it_has_the_strongest_gravity())","bd":"JSON.stringify(TrainerEngine.ea1_about_how_long_is_one_martia_has_it_is_closest_to_earth())","be":"JSON.stringify(TrainerEngine.ea1_about_how_long_is_one_martia_has_24_hours_37_minutes())","bf":"JSON.stringify(TrainerEngine.ea1_about_how_long_is_one_martia_has_12_hours())","bg":"JSON.stringify(TrainerEngine.ea1_about_how_long_is_one_martia_has_48_hours())","bh":"JSON.stringify(TrainerEngine.ea1_about_how_long_is_one_martia_has_29_5_days())","bi":"JSON.stringify(TrainerEngine.ea1_about_how_long_is_one_martia_has_carbon_dioxide())","bj":"JSON.stringify(TrainerEngine.ea1_about_how_long_is_one_martia_has_nitrogen())","bk":"JSON.stringify(TrainerEngine.ea1_about_how_long_is_one_martia_has_3_to_22_minutes())","bl":"JSON.stringify(TrainerEngine.ea1_about_how_long_is_one_martia_has_instant())","bm":"JSON.stringify(TrainerEngine.ea1_about_how_long_is_one_martia_has_2_seconds())","bn":"JSON.stringify(TrainerEngine.ea1_about_how_long_is_one_martia_has_3_hours())","bo":"JSON.stringify(TrainerEngine.ea1_about_how_long_is_one_martia_has_earth_s_magnetosphere())","bp":"JSON.stringify(TrainerEngine.ea1_about_how_long_is_one_martia_has_thick_glass())","bq":"JSON.stringify(TrainerEngine.ea1_about_how_long_is_one_martia_has_lead_walls())","br":"JSON.stringify(TrainerEngine.ea1_about_how_long_is_one_martia_has_the_solar_arrays())","bs":"JSON.stringify(TrainerEngine.ea1_about_how_long_is_one_martia_has_about_29_5_earth_days())","bt":"JSON.stringify(TrainerEngine.ea1_about_how_long_is_one_martia_has_24_hours())","bu":"JSON.stringify(TrainerEngine.ea1_about_how_long_is_one_martia_has_7_days())","bv":"JSON.stringify(TrainerEngine.ea1_about_how_long_is_one_martia_has_365_days())","bw":"JSON.stringify(TrainerEngine.ea1_about_how_long_is_one_martia_has_heat_from_decaying_plutonium())","bx":"JSON.stringify(TrainerEngine.ea1_about_how_long_is_one_martia_has_burning_methane())","by":"JSON.stringify(TrainerEngine.ea1_about_how_long_is_one_martia_has_wind_turbines())","bz":"JSON.stringify(TrainerEngine.ea1_about_how_long_is_one_martia_has_coal_cells())","ca":"JSON.stringify(TrainerEngine.ea1_about_how_long_is_one_martia_has_resupply_from_earth_is_slow_())","cb":"JSON.stringify(TrainerEngine.ea1_about_how_long_is_one_martia_has_plants_glow_nicely())","cc":"JSON.stringify(TrainerEngine.ea1_about_how_long_is_one_martia_has_soil_is_free_in_space())","cd":"JSON.stringify(TrainerEngine.ea1_about_how_long_is_one_martia_has_it_removes_all_co2())","ce":"JSON.stringify(TrainerEngine.ea1_about_how_long_is_one_martia_has_dust_blocks_sunlight_and_coa())","cf":"JSON.stringify(TrainerEngine.ea1_about_how_long_is_one_martia_has_dust_freezes_panels())","cg":"JSON.stringify(TrainerEngine.ea1_about_how_long_is_one_martia_has_dust_conducts_electricity())","ch":"JSON.stringify(TrainerEngine.ea1_about_how_long_is_one_martia_has_no_hazard())","ci":"JSON.stringify(TrainerEngine.ea1_about_how_long_is_one_martia_has_artemis())","cj":"JSON.stringify(TrainerEngine.ea1_about_how_long_is_one_martia_has_apollo())","ck":"JSON.stringify(TrainerEngine.ea1_what_is_the_main_component_o_has_oxygen())","cl":"JSON.stringify(TrainerEngine.ea1_what_is_the_main_component_o_has_methane())","cm":"JSON.stringify(TrainerEngine.ea1_what_is_the_main_component_o_has_water())","cn":"JSON.stringify(TrainerEngine.ea1_what_is_the_main_component_o_has_hydrogen())","co":"JSON.stringify(TrainerEngine.ea1_what_is_the_main_component_o_has_permanently_shadowed_craters())","cp":"JSON.stringify(TrainerEngine.ea1_what_is_the_main_component_o_has_it_is_the_warmest_region())","cq":"JSON.stringify(TrainerEngine.ea1_what_is_the_main_component_o_has_it_has_the_strongest_gravity())","cr":"JSON.stringify(TrainerEngine.ea1_what_is_the_main_component_o_has_it_is_closest_to_earth())","cs":"JSON.stringify(TrainerEngine.ea1_what_is_the_main_component_o_has_24_hours_37_minutes())","ct":"JSON.stringify(TrainerEngine.ea1_what_is_the_main_component_o_has_12_hours())","cu":"JSON.stringify(TrainerEngine.ea1_what_is_the_main_component_o_has_48_hours())","cv":"JSON.stringify(TrainerEngine.ea1_what_is_the_main_component_o_has_29_5_days())"}
for(var key in r510h){(function(k){var el=$("r510"+k);if(el){el.onclick=function(){try{r510Set(eval(r510h[k]))}catch(err){r510Set("error: "+err.message)}}}})(key)}

function r580day(){var d=new Date();return Math.floor((d-new Date(d.getFullYear(),0,0))/864e5)}
$("r580BriefBtn").onclick=function(){var b=TrainerEngine.fa2Briefing(r580day());$("r580Brief").textContent="Fact: "+b.fact+" | Watch for: "+b.event+" | Aim for: "+b.target};
$("r580Trained").onclick=function(){var today=r580day();var last=parseInt(localStorage.getItem("r580last")||"-1",10);var streak=parseInt(localStorage.getItem("r580streak")||"0",10);var ns=TrainerEngine.fa2StreakNext(streak,last,today);localStorage.setItem("r580last",String(today));localStorage.setItem("r580streak",String(ns));$("r580Streak").textContent="Streak: "+ns};
var r580drill=-1;
function r580Drill(){r580drill=(r580drill+1)%TrainerEngine.fa2DrillCount();var d=TrainerEngine.fa2Drill(r580drill);$("r580DrillQ").textContent="Where does this hit? "+d.text;var bb=$("r580DrillBtns");bb.innerHTML="";d.choices.forEach(function(c,idx){var b=document.createElement("button");b.textContent=c;b.onclick=function(){$("r580DrillOut").textContent=idx===d.correct?"Correct - it affects "+c+". (weight "+d.weight+")":"Not quite - the right answer was "+d.choices[d.correct]+".";r580Drill()};bb.appendChild(b)})}
$("r580DrillQ").onclick=function(){};
function r580Pass(){var done=[];try{done=JSON.parse(localStorage.getItem("r580pass")||"[]")}catch(e){}$("r580PassBar").textContent=TrainerEngine.fa2PassportPct(done)+"% mastered ("+done.length+"/"+TrainerEngine.fa2PassportTotal()+")";var ll=$("r580PassList");ll.innerHTML="";var rem=TrainerEngine.fa2PassportRemaining(done);rem.slice(0,6).forEach(function(idx){var b=document.createElement("button");b.textContent="Master fact "+(idx+1);b.onclick=function(){done.push(idx);localStorage.setItem("r580pass",JSON.stringify(done));r580Pass()};ll.appendChild(b)})}
$("r580PassExport").onclick=function(){var done=[];try{done=JSON.parse(localStorage.getItem("r580pass")||"[]")}catch(e){}$("r580PassBar").textContent=TrainerEngine.fa2PassportText(done).slice(0,200)};
r580Drill();r580Pass();

(function(){
var mar=null;
function showQ(){if(!mar){return}var q=TrainerEngine.fa3MarathonQ(mar);
if(!q){$("r650Q").textContent="Marathon over. Final score "+mar.score+", best streak "+mar.bestStreak+".";$("r650Opts").innerHTML="";return}
$("r650Q").textContent="Q"+q.n+"/"+q.total+" (lives "+q.lives+", score "+q.score+"): "+q.q;
var box=$("r650Opts");box.innerHTML="";
q.choices.forEach(function(c,idx){var b=document.createElement("button");b.textContent=c;b.onclick=function(){var r=TrainerEngine.fa3MarathonAnswer(mar,idx);$("r650MarOut").textContent=(r.right?"Correct! ":"Wrong - the answer was: "+r.correctAnswer+". ")+r.fact;showQ()};box.appendChild(b)})}
$("r650Start").onclick=function(){mar=TrainerEngine.fa3MarathonNew();$("r650MarOut").textContent="";showQ()};
$("r650Tl").onclick=function(){$("r650TlOut").textContent=TrainerEngine.fa3TimelineText($("r650Site").value||null)};
var unlocked=[];
try{unlocked=JSON.parse(localStorage.getItem("ach-unlocked")||"[]")}catch(e){unlocked=[]}
$("r650HuntOut").textContent=TrainerEngine.fa3HuntText(unlocked);
})();
})();
