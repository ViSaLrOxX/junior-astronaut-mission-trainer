(function(){
var s=null;
var $=function(id){return document.getElementById(id)};
var RES=[["o2","Oxygen","#6fd3ff",160],["water","Water","#4d9bff",160],["food","Food","#8be08b",120],["parts","Parts","#ffd166",100],["regolith","Regolith","#c9a27a",120],["science","Science","#d79bff",250]];
function render(){
if(!s){return}
$("solLine").textContent=TrainerEngine.SITES[s.site].name+" — Sol "+s.sol;
$("objective").textContent="Goal: "+s.objectiveScience+" science by sol "+s.objectiveSols+". Quiz every 5 sols.";
var bars="";
RES.forEach(function(r){
var v=Math.floor(s.res[r[0]]);
var pct=Math.max(0,Math.min(100,(v/r[3])*100));
var cls=r[0]==="o2"||r[0]==="water"||r[0]==="food"?(v<20?" low":""):"";
bars+='<div class="bar"><div class="lab"><span>'+r[1]+'</span><span class="'+cls.trim()+'">'+v+"</span></div>"+'<div class="track"><div class="fill" style="width:'+pct+"%;background:"+r[2]+'"></div></div></div>'});
$("bars").innerHTML=bars;
$("powerLine").textContent="Power: "+s.lastPowerGen+" generated / "+s.lastPowerUse+" used. Shielding level "+s.shieldLevel+"."+(s.stormActive?" DUST STORM ACTIVE.":"");
var bl="";
Object.keys(TrainerEngine.BUILDINGS).forEach(function(t){
var d=TrainerEngine.BUILDINGS[t];
var ok=TrainerEngine.canBuild(s,t);
bl+='<div class="bld"><div><strong>'+d.name+'</strong> ('+d.cost+' parts)<small>'+d.desc+"</small></div>"+'<button data-build="'+t+'"'+(ok?"":" disabled")+">Build</button></div>"});
$("buildList").innerHTML=bl;
Array.prototype.forEach.call(document.querySelectorAll("[data-build]"),function(btn){
btn.onclick=function(){TrainerEngine.build(s,btn.getAttribute("data-build"));render()}});
var cl="";
s.crew.forEach(function(c){
var st=c.health<=0?"DECEASED":("H "+Math.round(c.health)+" / M "+Math.round(c.morale));
cl+='<div class="crew"><span>'+c.name+" <small>("+c.role+')</small></span><span class="h'+(c.health<40?" low":"")+'">'+st+"</span></div>"});
$("crewList").innerHTML=cl;
$("recruitBtn").disabled=!(s.res.parts>=25&&s.crew.length<TrainerEngine.crewCapacity(s));
var base="";
s.buildings.forEach(function(b,i){
var d=TrainerEngine.BUILDINGS[b.type];
var st=b.done?(b.damaged?"DAMAGED":"online"):("building, "+b.solsLeft+" sol(s)");
base+='<div class="bld"><span>'+d.name+" — "+st+"</span>"+(b.damaged?'<button data-repair="'+i+'">Repair (5)</button>':"")+"</div>"});
$("baseList").innerHTML=base;
Array.prototype.forEach.call(document.querySelectorAll("[data-repair]"),function(btn){
btn.onclick=function(){TrainerEngine.repair(s,parseInt(btn.getAttribute("data-repair"),10));render()}});
var qp=$("quizPanel");
if(s.pendingQuiz!==null&&!s.over){
qp.hidden=false;
var q=TrainerEngine.QUIZ[s.pendingQuiz];
$("quizQ").textContent=q.q;
$("quizFact").textContent="";
var opts="";
q.a.forEach(function(a,i){opts+="<button data-quiz=\""+i+'">'+a+"</button>"});
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
eb.hidden=false;
eb.className=s.won?"win":"lose";
eb.textContent=s.won?"MISSION SUCCESS — science goal reached, crew alive.":"MISSION FAILED — review the log and try a new strategy.";
$("solBtn").disabled=true;
}else{eb.hidden=true;$("solBtn").disabled=false}}
$("startBtn").onclick=function(){
s=TrainerEngine.newGame($("siteSel").value,parseInt($("seedSel").value,10)||1,$("diffSel").value);
$("setup").hidden=true;$("game").hidden=false;render()};
$("solBtn").onclick=function(){TrainerEngine.tick(s);render()};
$("reportBtn").onclick=function(){
var blob=new Blob([TrainerEngine.report(s)],{type:"text/plain"});
var a=document.createElement("a");
a.href=URL.createObjectURL(blob);a.download="mission-report-sol"+s.sol+".txt";a.click();URL.revokeObjectURL(a.href)};
$("saveBtn").onclick=function(){localStorage.setItem("jamtrainer",JSON.stringify(s))};
$("loadBtn").onclick=function(){
var raw=localStorage.getItem("jamtrainer");
if(!raw){return}
s=JSON.parse(raw);
$("setup").hidden=true;$("game").hidden=false;render()};
$("newBtn").onclick=function(){$("setup").hidden=false;$("game").hidden=true;s=null};
})();
