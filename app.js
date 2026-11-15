(function(){
var s=null;
var autoTimer=null;
var $=function(id){return document.getElementById(id)};
var E=function(){return TrainerEngine};
var RES=[["o2","Oxygen","#6fd3ff",160],["water","Water","#4d9bff",160],["food","Food","#8be08b",120],["parts","Parts","#ffd166",100],["regolith","Regolith","#c9a27a",120],["science","Science","#d79bff",250]];
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
function applySnd(){$("sndBtn").textContent="Sound: "+(sndOn?"on":"off")}

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
btn.classList.add(r.correct?"ok":"no");
if(!r.correct){var cb=document.querySelector('[data-quiz="'+q.c+'"]');if(cb){cb.classList.add("ok")}}
if(r.correct){sndRight(s.quizStreak)}else{sndWrong()}
Array.prototype.forEach.call(document.querySelectorAll("[data-quiz]"),function(x){x.disabled=true});
$("quizFact").textContent=(r.correct?"Correct! +6 parts, +5 science. ":"Not quite. ")+r.fact+(s.quizStreak>1?" Streak: "+s.quizStreak+".":"");
setTimeout(function(){qp.hidden=true;if(window.__closeFeat){window.__closeFeat()}render()},4200)}});
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
$("setup").hidden=true;$("game").hidden=false;render();if(window.__tourEvent){window.__tourEvent("launch")}};
$("solBtn").onclick=function(){if(!s)return;TrainerEngine.tick(s);render();if(window.__openFeat&&!window.__quizWas){window.__openFeat("status")}var sp=$("statusPanel");sp.classList.remove("pulse");void sp.offsetWidth;sp.classList.add("pulse")};
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
$("setup").hidden=true;$("game").hidden=false;render();if(window.__tourEvent){window.__tourEvent("launch")}};
$("contrastBtn").onclick=function(){document.body.classList.toggle("hc")};
$("recruitBtn").onclick=function(){if(!s)return;TrainerEngine.recruit(s);render()};
$("sndBtn").onclick=function(){sndOn=!sndOn;try{localStorage.setItem("sndOn",sndOn?"1":"0")}catch(e){};applySnd();if(sndOn){tone(660,.1,"sine",.06)}};
applySnd();
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
if(right){sndRight(0)}else{sndWrong()}
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
if(right){sndRight(0)}else{sndWrong();var cb=card.querySelectorAll("button")[q.c];if(cb){cb.classList.add("ok")}}
Array.prototype.forEach.call(card.querySelectorAll("button"),function(x){x.disabled=true});
var f=document.createElement("div");f.className="passFact";
f.textContent=right?q.fact:("Not quite - the right answer is: "+q.a[q.c]+". "+q.fact);
card.appendChild(f);
if(right){
if(done.indexOf(idx)<0){done.push(idx);localStorage.setItem("r580pass",JSON.stringify(done))}
$("r580PassBar").textContent=TrainerEngine.fa2PassportPct(done)+"% mastered ("+done.length+"/"+TrainerEngine.fa2PassportTotal()+")";
setTimeout(r580Pass,2600)}
else{setTimeout(r580Pass,4200)}};
card.appendChild(b)});
ll.appendChild(card)})}
$("r580PassExport").onclick=function(){var done=[];try{done=JSON.parse(localStorage.getItem("r580pass")||"[]")}catch(e){}$("r580PassBar").textContent=TrainerEngine.fa2PassportText(done).slice(0,200)};
window.__featRefresh={passport:r580Pass,hunt:function(){var u=[];try{u=JSON.parse(localStorage.getItem("ach-unlocked")||"[]")}catch(e){}$("r650HuntOut").textContent=TrainerEngine.fa3HuntText(u)}};
r580Drill();r580Pass();

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
if(r.right){sndRight(mar.streak);if(mar.streak>=3){$("r650Q").classList.add("streakPop")}}else{sndWrong()}
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
{text:"Hi, future commander! This is your mission control. Let me show you around - it takes about a minute."},
{target:"setup",text:"First, set up your mission: give it a name, pick the Moon or Mars, and choose how hard it should be. The table shows what each site is like."},
{target:"startBtn",text:"When it looks good, press Launch and the tour continues inside your base.",wait:"launch"},
{target:"menuMission",menu:true,text:"Your base is a set of workbenches. Each card opens one; the Back to menu button returns here. The tour will open a few for you."},
{target:"statusPanel",feat:"status",text:"These are your gauges: oxygen, water, food, parts and science. If air, water or food hits zero, your crew is in real trouble."},
{target:"buildList",feat:"build",text:"Spend parts to build. A Solar Array for power and an O2 Generator for air are great first choices."},
{target:"techList",feat:"research",text:"Research spends science points on upgrades that last the whole mission."},
{target:"crewList",feat:"crew",text:"This is your crew. Keep them healthy, rested and cheerful - tired or sad astronauts work worse."},
{target:"solBtn",menu:true,text:"Now live one sol (one day) at a time. Press this and the status board opens so you can watch your gauges move."},
{target:"log",feat:"log",text:"The log writes down everything that happens, sol by sol."},
{target:"viewNav",menu:true,text:"Up here you switch rooms: Mission to run the base, Learn & play for quizzes and drills, Reports for charts and downloads."},
{text:"You are ready, commander! Press How to play any time you want this tour again. Good luck!"}
];
var cur=0,active=false;
function clearGlow(){document.querySelectorAll(".tourGlow").forEach(function(x){x.classList.remove("tourGlow")})}
function openFeat(f){
var m=G("game");
m.classList.add("wb-open");
m.dataset.feat=f;
if(window.__featRefresh&&window.__featRefresh[f]){window.__featRefresh[f]()}
if(f==="quiz"&&G("quizPanel").hidden){G("quizPanel").hidden=false;if(!G("quizQ").textContent){G("quizQ").textContent="Mission Control will call with a quiz when something interesting happens."}}
m.classList.remove("anim");void m.offsetWidth;m.classList.add("anim")}
function closeFeat(){var m=G("game");m.classList.remove("wb-open");delete m.dataset.feat;m.classList.remove("anim");void m.offsetWidth;m.classList.add("anim")}
window.__openFeat=openFeat;
window.__closeFeat=closeFeat;
function showStep(){
clearGlow();
var st=steps[cur];
if(st.feat){openFeat(st.feat)}else if(st.menu){closeFeat()}
G("tourText").textContent="Step "+(cur+1)+" of "+steps.length+": "+st.text;
G("tourNext").textContent=cur===steps.length-1?"Done":"Next";
if(st.target){var el=G(st.target);if(el){el.classList.add("tourGlow");try{el.scrollIntoView({block:"center",behavior:"smooth"})}catch(e){el.scrollIntoView()}}}
}
function tourStart(){active=true;cur=0;G("tour").hidden=false;showStep()}
function tourEnd(){active=false;G("tour").hidden=true;clearGlow();try{localStorage.setItem("tourDone","1")}catch(e){}}
G("tourNext").onclick=function(){
var st=steps[cur];
if(st.wait==="launch"&&G("game").hidden){G("tourText").textContent="Press the Launch button above and we will keep going inside your base.";return}
cur++;
if(cur>=steps.length){tourEnd();return}
showStep()};
G("tourSkip").onclick=tourEnd;
window.__tourEvent=function(name){if(active&&steps[cur].wait===name){cur++;showStep()}};
G("helpBtn").onclick=tourStart;
G("helpSetup").onclick=tourStart;
document.querySelectorAll(".wbCard").forEach(function(b){b.onclick=function(){openFeat(b.dataset.feat)}});
G("wbBack").onclick=closeFeat;
try{if(!localStorage.getItem("tourDone")){tourStart()}}catch(e){tourStart()}
var navBtns=document.querySelectorAll(".navBtn");
navBtns.forEach(function(b){b.onclick=function(){
var m=G("game");
m.classList.remove("wb-open");delete m.dataset.feat;
m.dataset.view=b.dataset.view;
navBtns.forEach(function(x){x.classList.toggle("on",x===b)});
m.classList.remove("anim");void m.offsetWidth;m.classList.add("anim")}});
var cmd=false;
try{cmd=localStorage.getItem("cmdMode")==="1"}catch(e){}
function applyCmd(){document.body.classList.toggle("kid",!cmd);G("cmdBtn").textContent="Commander mode: "+(cmd?"on":"off");closeFeat()}
G("cmdBtn").onclick=function(){cmd=!cmd;try{localStorage.setItem("cmdMode",cmd?"1":"0")}catch(e){};applyCmd()};
applyCmd();
var tips={"r5CrewBtn":"Table of your astronauts: role, level, health and morale","r5HealthBtn":"Average health, fatigue and morale","r5RolesBtn":"Who does what job, and their levels","r5ExhBtn":"Who is exhausted or away from base","r5MoraleBtn":"Highest, lowest and average morale","r5ResBtn":"Resource levels and how much each astronaut has","r5PaceBtn":"Science earned per sol versus the goal","r5ProjBtn":"Predicted final science and whether you win","r5RunwayBtn":"How many sols each resource will last","r5ShortBtn":"The resource that runs out first","r5DangerBtn":"Overall danger score from 0 to 100","r5OddsBtn":"Your chances of winning, in words","r5BldBtn":"Building types, damage and construction progress","r5CropBtn":"What your greenhouses are growing","r5PowBtn":"Power made, used and stored","r5ShieldBtn":"Radiation shield level and next upgrade cost","r5TechBtn":"Researched tech and the cheapest next one","r5Res2Btn":"Upgrades you can afford right now","r5AffordBtn":"Buildings you can afford right now","r5HistBtn":"How oxygen, water and food changed over time","r5BestBtn":"Your best and worst sol for oxygen","r5DeltaBtn":"Oxygen change since sol 1","r5UpBtn":"Events coming up soon","r5HazBtn":"The next danger on the calendar","r5CheckBtn":"Suggested next actions","r5StatusBtn":"One-line mission summary","r5QuizBtn":"Your quiz record","r5AchBtn":"How many badges you have earned","r5CrewCsvBtn":"Download the crew table as CSV","r5BldCsvBtn":"Download the buildings table as CSV","r5TechCsvBtn":"Download the tech table as CSV","r5SchedCsvBtn":"Download the event schedule as CSV","r5SnapBtn":"Download the full mission state as JSON","r5MdBtn":"Download the mission as a markdown document","r5AuditBtn":"Check the mission state for mistakes","r5GlossBtn":"Words a commander should know","r5FaqBtn":"Common questions and answers","r5TriviaBtn":"A fun space fact","r5Quiz2Btn":"Try one quiz question right now"};
Object.keys(tips).forEach(function(id){var el=G(id);if(el){el.title=tips[id]}})
})();
