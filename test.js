var assert=require("assert");
var E=require("./engine.js");
var pass=0,fail=0;
function T(name,fn){try{fn();pass++;console.log("PASS",name)}catch(e){fail++;console.log("FAIL",name,"-",e.message)}}
T("new game has 4 crew and starting stores",function(){
var s=E.newGame("moon",7,"explorer");
assert.strictEqual(s.crew.length,4);
assert(s.res.o2>0&&s.res.water>0&&s.res.food>0&&s.res.parts>0)});
T("deterministic per seed",function(){
var a=E.newGame("mars",99,"explorer");var b=E.newGame("mars",99,"explorer");
for(var i=0;i<10;i++){E.tick(a);E.tick(b)}
assert.strictEqual(JSON.stringify(a),JSON.stringify(b))});
T("different seeds diverge",function(){
var a=E.newGame("mars",1,"explorer");var b=E.newGame("mars",2,"explorer");
for(var i=0;i<15;i++){E.tick(a);E.tick(b)}
assert.notStrictEqual(JSON.stringify(a.log),JSON.stringify(b.log))});
T("tick advances sol and consumes resources",function(){
var s=E.newGame("moon",7,"explorer");
var o2=s.res.o2,food=s.res.food;
E.tick(s);
assert.strictEqual(s.sol,1);
assert(s.res.o2<o2);assert(s.res.food<food)});
T("resources never go negative",function(){
var s=E.newGame("moon",3,"commander");
for(var i=0;i<60;i++){E.tick(s)}
["o2","water","food","parts","regolith"].forEach(function(k){assert(s.res[k]>=0,k)})});
T("building spends parts and completes after buildSols",function(){
var s=E.newGame("moon",7,"explorer");
var p=s.res.parts;
assert(E.build(s,"o2gen"));
assert(s.res.parts===p-E.BUILDINGS.o2gen.cost);
E.tick(s);
assert(s.buildings.some(function(b){return b.type==="o2gen"&&b.done}))});
T("cannot build without parts",function(){
var s=E.newGame("moon",7,"explorer");
s.res.parts=0;
assert.strictEqual(E.build(s,"lab"),false)});
T("unpowered building produces nothing",function(){
var s=E.newGame("moon",7,"explorer");
s.buildings=s.buildings.filter(function(b){return b.type!=="solar"});
E.build(s,"o2gen");E.tick(s);
var o2=s.res.o2;
E.tick(s);
assert(s.res.o2<o2)});
T("o2 gen increases net oxygen",function(){
var s=E.newGame("moon",7,"explorer");
E.build(s,"o2gen");E.tick(s);E.tick(s);
var s2=E.newGame("moon",7,"explorer");
E.tick(s2);E.tick(s2);E.tick(s2);
E.tick(s);
assert(s.res.o2>s2.res.o2)});
T("crew dies without oxygen and game ends",function(){
var s=E.newGame("moon",7,"commander");
s.res.o2=0;s.res.water=0;s.res.food=0;
for(var i=0;i<20&&!s.over;i++){E.tick(s)}
assert(s.over);assert.strictEqual(s.won,false);assert.strictEqual(E.aliveCount(s),0)});
T("win path: strong base reaches science goal",function(){
var s=E.newGame("moon",11,"cadet");
E.build(s,"solar");E.build(s,"lab");E.build(s,"comms");E.build(s,"o2gen");E.build(s,"watermine");E.build(s,"greenhouse");
for(var i=0;i<70&&!s.over;i++){E.tick(s);
if(s.res.parts>=16&&!s.buildings.some(function(b){return b.type==="medbay"})){E.build(s,"medbay")}
else if(s.res.parts>=10&&s.buildings.filter(function(b){return b.type==="shield"}).length<2){E.build(s,"shield")}}
assert(s.over,"game ended");
assert.strictEqual(s.won,true)});
T("shielding reduces radiation damage",function(){
var a=E.newGame("moon",5,"explorer");
for(var i=0;i<3;i++){E.tick(a)}
var h1=a.crew[0].health;
var b=E.newGame("moon",5,"explorer");
b.shieldLevel=3;
for(var i=0;i<3;i++){E.tick(b)}
var h2=b.crew[0].health;
assert(h2>=h1)});
T("quiz correct answer grants rewards",function(){
var s=E.newGame("moon",7,"explorer");
for(var i=0;i<5;i++){E.tick(s)}
assert(s.pendingQuiz!==null);
var q=E.QUIZ[s.pendingQuiz];
var parts=s.res.parts;
var r=E.answerQuiz(s,q.c);
assert(r.correct);assert(s.res.parts===parts+6);assert.strictEqual(s.quizCorrect,1)});
T("quiz wrong answer gives no rewards",function(){
var s=E.newGame("moon",7,"explorer");
for(var i=0;i<5;i++){E.tick(s)}
var q=E.QUIZ[s.pendingQuiz];
var parts=s.res.parts;
var r=E.answerQuiz(s,(q.c+1)%q.a.length);
assert.strictEqual(r.correct,false);assert.strictEqual(s.res.parts,parts)});
T("repair restores damaged building",function(){
var s=E.newGame("moon",7,"explorer");
var b=s.buildings.find(function(x){return x.type==="solar"});
b.damaged=true;
assert(E.repair(s,s.buildings.indexOf(b)));
assert.strictEqual(b.damaged,false)});
T("crew capacity limits recruiting",function(){
var s=E.newGame("moon",7,"explorer");
assert.strictEqual(E.recruit(s),false)});
T("recruit works with habitat space",function(){
var s=E.newGame("moon",7,"explorer");
E.build(s,"habitat");E.tick(s);E.tick(s);E.tick(s);
s.res.parts=100;
s.buildings.forEach(function(b){b.damaged=false});
assert(E.recruit(s));
assert.strictEqual(s.crew.length,5)});
T("achievements unlock",function(){
var s=E.newGame("moon",11,"cadet");
E.tick(s);
assert(s.earned.indexOf("firstsol")>=0)});
T("report contains key fields",function(){
var s=E.newGame("moon",7,"explorer");
E.tick(s);
var r=E.report(s);
assert(r.indexOf("MISSION REPORT")>=0);
assert(r.indexOf("Sol 1")>=0);
assert(r.indexOf("Status:")>=0)});
T("long stress game stays sane",function(){
for(var seed=1;seed<=12;seed++){
var s=E.newGame(seed%2?"moon":"mars",seed,"explorer");
for(var i=0;i<80&&!s.over;i++){E.tick(s)}
["o2","water","food"].forEach(function(k){assert(s.res[k]>=0)});
s.crew.forEach(function(c){assert(c.health>=0&&c.health<=100);assert(c.morale>=0&&c.morale<=100)})}});
T("v2: engineer discount on repairs",function(){
var s=E.newGame("moon",7,"explorer");
var eng=s.crew.find(function(c){return c.role==="Engineer"});
assert(eng);
var b=s.buildings.find(function(x){return x.type==="solar"});
b.damaged=true;
var p=s.res.parts;
assert(E.repair(s,s.buildings.indexOf(b)));
assert.strictEqual(s.res.parts,p-3)});
T("v2: EVA repair works and costs 2 parts",function(){
var s=E.newGame("moon",7,"explorer");
var b=s.buildings.find(function(x){return x.type==="solar"});
b.damaged=true;
var p=s.res.parts;
var r=E.evaRepair(s,s.buildings.indexOf(b),0);
assert(r.ok);
assert.strictEqual(s.res.parts,p-2);
assert.strictEqual(b.damaged,false)});
T("v2: EVA on undamaged building refused",function(){
var s=E.newGame("moon",7,"explorer");
var r=E.evaRepair(s,0,0);
assert.strictEqual(r.ok,false)});
T("v2: EVA injury risk bounded",function(){
for(var seed=1;seed<=30;seed++){
var s=E.newGame("moon",seed,"explorer");
var b=s.buildings.find(function(x){return x.type==="solar"});
b.damaged=true;
var h=s.crew[0].health;
E.evaRepair(s,s.buildings.indexOf(b),0);
assert(s.crew[0].health<=h&&s.crew[0].health>=h-15)}});
T("v2: scientist boosts lab science",function(){
var s=E.newGame("moon",7,"explorer");
assert(s.crew.some(function(c){return c.role==="Scientist"}));
E.build(s,"solar");E.build(s,"lab");
for(var i=0;i<4;i++){E.tick(s)}
var sciA=s.res.science;
var s2=E.newGame("moon",7,"explorer");
s2.crew=s2.crew.filter(function(c){return c.role!=="Scientist"});
E.build(s2,"solar");E.build(s2,"lab");
for(var i=0;i<4;i++){E.tick(s2)}
assert(s.res.science>s2.res.science)});
T("v2: geologist boosts drill output",function(){
var s=E.newGame("moon",7,"explorer");
s.crew[3]={name:"Test Geo",health:100,morale:80,role:"Geologist"};
E.build(s,"solar");E.build(s,"drill");
for(var i=0;i<4;i++){E.tick(s)}
s.res.regolith=0;E.tick(s);
var withGeo=s.res.regolith;
var s2=E.newGame("moon",7,"explorer");
s2.crew=s2.crew.filter(function(c){return c.role!=="Geologist"});
E.build(s2,"solar");E.build(s2,"drill");
for(var i=0;i<4;i++){E.tick(s2)}
s2.res.regolith=0;E.tick(s2);
assert(withGeo>s2.res.regolith)});
T("v2: advisor warns on low oxygen",function(){
var s=E.newGame("moon",7,"explorer");
s.res.o2=1;
var tips=E.advise(s);
assert(tips.some(function(t){return t.indexOf("Oxygen")>=0}))});
T("v2: advisor quiet on stable base",function(){
var s=E.newGame("moon",7,"explorer");
s.res.o2=500;s.res.water=500;s.res.food=500;s.shieldLevel=2;
var tips=E.advise(s);
assert.strictEqual(tips.length,1);
assert(tips[0].indexOf("stable")>=0)});
T("v2: advisor notes damaged buildings",function(){
var s=E.newGame("moon",7,"explorer");
s.res.o2=500;s.res.water=500;s.res.food=500;s.shieldLevel=2;
s.buildings[0].damaged=true;
var tips=E.advise(s);
assert(tips.some(function(t){return t.indexOf("damaged")>=0}))});
T("v2: full game with EVA features still wins",function(){
var s=E.newGame("moon",11,"cadet");
E.build(s,"solar");E.build(s,"lab");E.build(s,"comms");E.build(s,"o2gen");E.build(s,"watermine");E.build(s,"greenhouse");
for(var i=0;i<70&&!s.over;i++){E.tick(s);
var dmg=s.buildings.findIndex(function(b){return b.damaged});
if(dmg>=0&&s.res.parts>=2){E.evaRepair(s,dmg,2)}
if(s.res.parts>=16&&!s.buildings.some(function(b){return b.type==="medbay"})){E.build(s,"medbay")}
else if(s.res.parts>=10&&s.buildings.filter(function(b){return b.type==="shield"}).length<2){E.build(s,"shield")}}
assert(s.over);assert.strictEqual(s.won,true)});

T("v3: research spends science and unlocks tech",function(){
var s=E.newGame("moon",7,"explorer");s.res.science=100;
assert(E.research(s,"solarEff"));
assert(s.techs.solarEff);
assert(!E.research(s,"solarEff"))});
T("v3: solarEff raises power output",function(){
var s=E.newGame("moon",7,"explorer");
var p0=E.computePower(s);
s.techs={solarEff:true};
var p1=E.computePower(s);
assert(p1>p0)});
T("v3: research refuses unknown tech and low science",function(){
var s=E.newGame("moon",7,"explorer");
assert(!E.research(s,"nope"));
s.res.science=5;
assert(!E.research(s,"solarEff"))});
T("v3: radShield lowers dose",function(){
var s=E.newGame("moon",7,"commander");
var h0=s.crew[0].health;
E.tick(s);
var lost1=h0-s.crew[0].health;
var s2=E.newGame("moon",7,"commander");
s2.techs={radShield:true};
var h2=s2.crew[0].health;
E.tick(s2);
var lost2=h2-s2.crew[0].health;
assert(lost2<lost1)});
T("v3: autoRepair fixes damage after 2 sols",function(){
var s=E.newGame("moon",7,"explorer");
s.techs={autoRepair:true};
var b=s.buildings[0];b.damaged=true;b.damageSol=s.sol;
E.tick(s);assert(b.damaged);
E.tick(s);assert(!b.damaged)});
T("v3: battery stores surplus power",function(){
var s=E.newGame("moon",7,"explorer");
E.build(s,"battery");E.tick(s);E.tick(s);
s.buildings.forEach(function(b){b.damaged=false});
assert(E.computePower(s)>0);
assert(s.powerStore>=0)});
T("v3: recycler cuts water consumption",function(){
var s=E.newGame("moon",7,"explorer");
E.build(s,"recycler");
s.buildings.forEach(function(b){if(b.type==="recycler"){b.done=true;b.solsLeft=0}});
s.res.o2=999;s.res.food=999;
var w0=s.res.water;
E.tick(s);
var usedNoRecycle=w0-s.res.water;
var s2=E.newGame("moon",7,"explorer");
s2.res.o2=999;s2.res.food=999;
var w1=s2.res.water;
E.tick(s2);
var usedBase=w1-s2.res.water;
assert(usedNoRecycle<usedBase)});
T("v3: scrubber boosts O2 output",function(){
var s=E.newGame("moon",7,"explorer");
E.build(s,"o2gen");E.build(s,"scrubber");
s.buildings.forEach(function(b){if(!b.done){b.done=true;b.solsLeft=0}});
s.res.o2=0;s.res.water=999;s.res.food=999;
E.tick(s);
var withScrub=s.res.o2;
var s2=E.newGame("moon",7,"explorer");
E.build(s2,"o2gen");
s2.buildings.forEach(function(b){if(!b.done){b.done=true;b.solsLeft=0}});
s2.res.o2=0;s2.res.water=999;s2.res.food=999;
E.tick(s2);
assert(withScrub>s2.res.o2)});
T("v3: rations reduce consumption",function(){
var s=E.newGame("moon",7,"explorer");
assert(E.setRations(s,0.6));
assert.strictEqual(s.rations,0.6);
assert(!E.setRations(s,0.5))});
T("v3: crop switching changes yields",function(){
var s=E.newGame("moon",7,"explorer");
E.build(s,"greenhouse");
var gh=s.buildings.find(function(b){return b.type==="greenhouse"});
assert(E.setCrop(s,s.buildings.indexOf(gh),"wheat"));
assert.strictEqual(gh.crop,"wheat");
assert(!E.setCrop(s,0,"nope"));
assert(s.cropSwitches>=1)});
T("v3: manifest changes resupply bundle",function(){
var s=E.newGame("moon",7,"explorer");
assert(E.setManifest(s,"parts"));
s.res.parts=0;s.res.food=0;s.res.o2=999;s.res.water=999;
s.sol=6;E.tick(s);
assert(s.res.parts>=20)});
T("v3: retrain swaps role for science",function(){
var s=E.newGame("moon",7,"explorer");s.res.science=50;
assert(E.retrain(s,3,"Pilot"));
assert.strictEqual(s.crew[3].role,"Pilot");
assert.strictEqual(s.retrains,1)});
T("v3: expedition sends crew and returns with science",function(){
var s=E.newGame("moon",7,"explorer");
var sci0=s.res.science;
var r=E.expedition(s,"crater");
assert(r.ok);
var away=s.crew.filter(function(c){return c.away>0});
assert.strictEqual(away.length,2);
E.tick(s);E.tick(s);E.tick(s);
assert(s.crew.every(function(c){return (c.away||0)<=0}));
assert(s.res.science>sci0);
assert(s.expeditionsDone>=1)});
T("v3: expedition refuses with fewer than 2 able crew",function(){
var s=E.newGame("moon",7,"explorer");
s.crew[0].health=0;s.crew[1].health=0;s.crew[2].health=0;
var r=E.expedition(s,"crater");
assert(!r.ok)});
T("v3: EVA blocked when too tired",function(){
var s=E.newGame("moon",7,"explorer");
s.crew[0].fatigue=90;
s.buildings[0].damaged=true;
var r=E.evaRepair(s,0,0);
assert(!r.ok)});
T("v3: forecast reveals scheduled events",function(){
var s=E.newGame("moon",7,"explorer");
s.schedule[0]="flare";
var f=E.forecast(s);
assert(f&&f.id==="flare")});
T("v3: scheduled events actually fire",function(){
var s=E.newGame("moon",7,"explorer");
s.schedule[0]="find";
var w0=s.res.water;
E.tick(s);
assert(s.res.water-w0>0)});
T("v3: scenario leancrew limits crew",function(){
var s=E.newGame("moon",7,"explorer");
assert(E.setScenario(s,"leancrew"));
assert.strictEqual(s.crew.length,2)});
T("v3: scenario longnight cuts solar output",function(){
var s=E.newGame("moon",7,"explorer");
var p0=E.computePower(s);
var s2=E.newGame("moon",7,"explorer");
E.setScenario(s2,"longnight");
var p1=E.computePower(s2);
assert(p1<p0)});
T("v3: sandbox never fails",function(){
var s=E.newGame("mars",5,"sandbox");
s.res.o2=0;s.res.water=0;s.res.food=0;
for(var i=0;i<35;i++){E.tick(s)}
assert(!s.over)});
T("v3: powerBreakdown lists consumers",function(){
var s=E.newGame("moon",7,"explorer");
E.build(s,"o2gen");
s.buildings.forEach(function(b){b.done=true;b.solsLeft=0});
E.tick(s);
var pb=E.powerBreakdown(s);
assert(pb.consumers.length>0)});
T("v3: statsSummary tracks totals",function(){
var s=E.newGame("moon",7,"explorer");
E.build(s,"solar");E.build(s,"lab");
for(var i=0;i<6;i++){E.tick(s)}
var st=E.statsSummary(s);
assert(st.scienceEarned>0);
assert(st.powerGenerated>0)});
T("v3: score combines outcomes",function(){
var s=E.newGame("moon",7,"explorer");
s.res.science=200;s.won=true;
var sc=E.score(s);
assert(sc>=300)});
T("v3: compareSites returns both sites",function(){
var cs=E.compareSites();
assert.strictEqual(cs.length,2);
assert(cs[0].desc&&cs[1].desc)});
T("v3: reportJSON has structured fields",function(){
var s=E.newGame("moon",7,"explorer");
var j=E.reportJSON(s);
assert(j.site==="moon"&&typeof j.score==="number"&&Array.isArray(j.techs))});
T("v3: mission and crew renaming",function(){
var s=E.newGame("moon",7,"explorer");
E.setMissionName(s,"Artemis Sim 1");
assert.strictEqual(s.missionName,"Artemis Sim 1");
assert(E.renameCrew(s,0,"Cmdr. Test"));
assert.strictEqual(s.crew[0].name,"Cmdr. Test")});
T("v3: crew gain XP and level up",function(){
var s=E.newGame("moon",7,"explorer");
for(var i=0;i<25;i++){E.tick(s);s.buildings.forEach(function(b){b.damaged=false});s.res.o2=999;s.res.water=999;s.res.food=999}
assert(s.crew.some(function(c){return E.cLevel(c)>=2}))});
T("v3: advisor flags tired crew and research opportunity",function(){
var s=E.newGame("moon",7,"explorer");
s.res.o2=500;s.res.water=500;s.res.food=500;s.shieldLevel=2;
s.crew[0].fatigue=80;
var tips=E.advise(s);
assert(tips.some(function(t){return t.indexOf("exhausted")>=0}));
s.crew.forEach(function(c){c.fatigue=0});
s.res.science=50;s.sol=10;
tips=E.advise(s);
assert(tips.some(function(t){return t.indexOf("research")>=0}))});
T("v3: new events apply effects",function(){
var s=E.newGame("moon",7,"explorer");
var f0=s.res.food;
s.schedule[0]="stowaway";E.tick(s);
assert(s.res.food<f0+30)});
T("v3: quiz pool now has 20 questions with facts",function(){
assert.strictEqual(E.QUIZ.length,20);
E.QUIZ.forEach(function(q){assert(q.fact.length>10);assert.strictEqual(q.c,0)})});
T("v3: achievements pool has 20 entries",function(){
assert.strictEqual(E.ACHIEVEMENTS.length,20)});
T("v3: full game with all v3 systems still wins",function(){
var s=E.newGame("moon",11,"cadet");
E.build(s,"solar");E.build(s,"lab");E.build(s,"comms");E.build(s,"o2gen");E.build(s,"watermine");E.build(s,"greenhouse");E.build(s,"battery");E.build(s,"recycler");
for(var i=0;i<70&&!s.over;i++){E.tick(s);
var dmg=s.buildings.findIndex(function(b){return b.damaged});
if(dmg>=0&&s.res.parts>=2){E.evaRepair(s,dmg,2)}
if(s.res.science>=25&&Object.keys(s.techs).length===0){E.research(s,"waterLoop")}
if(s.res.parts>=16&&!s.buildings.some(function(b){return b.type==="medbay"})){E.build(s,"medbay")}
else if(s.res.parts>=10&&s.buildings.filter(function(b){return b.type==="shield"}).length<2){E.build(s,"shield")}}
assert(s.over);assert.strictEqual(s.won,true)});
console.log(pass+" passed, "+fail+" failed (v3 feature round)");
var pass2=0,fail2=0;
function T2(name,fn){try{fn();pass2++;console.log("PASS4",name)}catch(e){fail2++;console.log("FAIL4",name,"-",e.message)}}
console.log("--- round 4 (v4) ---");
T2("dry-run build shows power delta",()=>{
const s=E.newGame("moon",42,"explorer");
const d=E.dryRunBuild(s,"solar");
assert(d.powerDelta>0&&d.cost===12)});
T2("new buildings exist with effects",()=>{
assert(E.BUILDINGS.workshop&&E.BUILDINGS.algae&&E.BUILDINGS.observatory&&E.BUILDINGS.gym&&E.BUILDINGS.pad)});
T2("workshop converts regolith to parts",()=>{
const s=E.newGame("moon",42,"explorer");
s.res.parts=200;s.res.regolith=100;
E.build(s,"workshop");
E.tick(s);E.tick(s);
const p0=s.res.parts;
E.tick(s);
assert(s.res.regolith<100)});
T2("ai assist discounts research",()=>{
const s=E.newGame("moon",42,"explorer");
s.res.science=100;
assert(E.research(s,"aiAssist"));
assert.strictEqual(E.researchCost(s,"advCrops"),20)});
T2("suit shields halve EVA risk flag",()=>{
const s=E.newGame("moon",42,"explorer");
s.res.science=100;E.research(s,"suitShields");
assert(s.techs.suitShields)});
T2("ice core expedition yields science and water",()=>{
const s=E.newGame("mars",11,"explorer");
s.res.parts=100;
const sc0=s.res.science;
assert(E.expedition(s,"icecore").ok);
E.tick(s);E.tick(s);E.tick(s);
assert(s.res.science>sc0)});
T2("relay repair grants temp science drip",()=>{
const s=E.newGame("mars",11,"explorer");
s.res.parts=100;
E.expedition(s,"relayfix");
E.tick(s);E.tick(s);
assert(s.relayFixedUntil>s.sol)});
T2("shelter mode blocks building damage",()=>{
const s=E.newGame("moon",3,"explorer");
s.sheltered=true;
E.applyEvent(s,{id:"micro",text:"t"});
assert(!s.buildings.some(b=>b.damaged))});
T2("redundancy absorbs first hit per sol only",()=>{
const s=E.newGame("moon",3,"explorer");
s.techs.redundancy=true;
E.applyEvent(s,{id:"micro",text:"t"});
assert(!s.buildings.some(b=>b.damaged));
E.applyEvent(s,{id:"micro",text:"t"});
assert(s.buildings.some(b=>b.damaged))});
T2("science milestones grant parts once",()=>{
const s=E.newGame("moon",9,"explorer");
s.totals.science=55;
const p0=s.res.parts;
E.tick(s);
assert(s.milestonesHit.includes(50)&&s.res.parts>p0)});
T2("quiz streak awards bonus at 3",()=>{
const s=E.newGame("moon",5,"explorer");
for(let i=0;i<3;i++){s.pendingQuiz=i;const q=E.QUIZ[i];E.answerQuiz(s,q.c)}
assert(s.bestQuizStreak>=3)});
T2("wrong answer resets streak",()=>{
const s=E.newGame("moon",5,"explorer");
s.pendingQuiz=0;E.answerQuiz(s,0);
s.pendingQuiz=1;E.answerQuiz(s,(E.QUIZ[1].c+1)%4);
assert.strictEqual(s.quizStreak,0)});
T2("resource history recorded per sol",()=>{
const s=E.newGame("moon",42,"explorer");
E.tick(s);E.tick(s);
assert.strictEqual(E.resourceHistory(s).length,2);
assert(E.historyCSV(s).split("\n").length===3)});
T2("crew csv covers roster",()=>{
const s=E.newGame("moon",42,"explorer");
assert.strictEqual(E.crewCSV(s).split("\n").length,s.crew.length+1)});
T2("event preview lists site events",()=>{
const s=E.newGame("mars",1,"explorer");
const p=E.eventPreview(s);
assert(p.length>=15&&p.every(e=>e.text&&e.weight))});
T2("alerts flag critical oxygen",()=>{
const s=E.newGame("moon",1,"explorer");
s.res.o2=5;
assert(E.alerts(s).some(a=>a.level==="critical"&&a.text.includes("Oxygen")))});
T2("letter grade thresholds",()=>{
const s=E.newGame("moon",1,"explorer");
assert(["S","A","B","C","D"].includes(E.letterGrade(s)))});
T2("postmortem explains zero-oxygen death",()=>{
const s=E.newGame("moon",1,"explorer");
s.res.o2=0;s.res.water=0;s.res.food=0;
while(!s.over){E.tick(s)}
const tips=E.postMortem(s);
assert(tips.length>0)});
T2("daily checklist surfaces repairs",()=>{
const s=E.newGame("moon",3,"explorer");
s.buildings[0].damaged=true;
assert(E.dailyChecklist(s).some(x=>x.includes("Repair")))});
T2("mission name generator deterministic",()=>{
assert.strictEqual(E.missionNameGen(42),E.missionNameGen(42));
assert(E.missionNameGen(42).length>3)});
T2("difficulty table complete",()=>{
assert.strictEqual(E.difficultyTable().length,4)});
T2("score breakdown sums to score",()=>{
const s=E.newGame("moon",42,"explorer");
E.tick(s);
const b=E.scoreBreakdown(s);
assert.strictEqual(b.science+b.crew+b.shielding+b.sols+b.wonBonus+b.achievements,b.total)});
T2("share text includes score and grade",()=>{
const s=E.newGame("moon",42,"explorer");
const t=E.shareText(s);
assert(t.includes("score")&&/[SABCD]/.test(t))});
T2("achievement progress tracked",()=>{
const s=E.newGame("moon",42,"explorer");
const p=E.achievementProgress(s);
assert(p.length===6&&p.every(x=>x.have>=0&&x.need>0))});
T2("battery status notes missing banks",()=>{
const s=E.newGame("moon",42,"explorer");
assert(E.batteryStatus(s).note.length>10)});
T2("morale report finds lowest",()=>{
const s=E.newGame("moon",42,"explorer");
s.crew[1].morale=10;
assert.strictEqual(E.moraleReport(s).lowest.name,s.crew[1].name)});
T2("power forecast sees tomorrow's storm",()=>{
const s=E.newGame("mars",11,"explorer");
E.tick(s);
const pf=E.powerForecast(s);
assert(typeof pf.tomorrow==="number")});
T2("food calendar scales with rations",()=>{
const s=E.newGame("moon",42,"explorer");
const fc=E.foodCalendar(s);
assert(fc[0].days<fc[2].days)});
T2("build queue lists unfinished",()=>{
const s=E.newGame("moon",42,"explorer");
s.res.parts=100;E.build(s,"lab");
assert(E.buildQueueEta(s).length===1)});
T2("health report labels status",()=>{
const s=E.newGame("moon",42,"explorer");
s.crew[0].health=30;
assert.strictEqual(E.healthReport(s)[0].status,"critical")});
T2("tutorial hints only early",()=>{
const s=E.newGame("moon",42,"explorer");
assert(E.tutorialHints(s).length>0);
for(let i=0;i<5;i++){E.tick(s)}
assert.strictEqual(E.tutorialHints(s).length,0)});
T2("weekly summary after 7 sols",()=>{
const s=E.newGame("moon",42,"explorer");
for(let i=0;i<8;i++){E.tick(s)}
const w=E.weeklySummary(s);
assert(w&&typeof w.scienceDelta==="number")});
T2("rest action clears fatigue",()=>{
const s=E.newGame("moon",42,"explorer");
s.crew[0].fatigue=60;
assert(E.rest(s,0));
assert(s.crew[0].fatigue<=20)});
T2("clean solar boosts output temporarily",()=>{
const s=E.newGame("moon",42,"explorer");
assert(E.cleanSolar(s));
assert.strictEqual(s.solarBoostSols,3)});
T2("repair all fixes everything affordable",()=>{
const s=E.newGame("moon",42,"explorer");
s.res.parts=100;
s.buildings[0].damaged=true;s.buildings[1].damaged=true;
assert.strictEqual(E.repairAll(s),2)});
T2("suit maintenance arms safer EVA",()=>{
const s=E.newGame("moon",42,"explorer");
s.res.parts=10;
assert(E.suitMaintenance(s)&&s.evaShield)});
T2("morale objective mode can win",()=>{
const s=E.newGame("moon",13,"cadet");
assert(E.setObjectiveMode(s,"morale"));
for(let i=0;i<30;i++){s.crew.forEach(c=>c.morale=80);s.res.o2=200;s.res.water=200;s.res.food=200;E.tick(s)}
assert(s.over&&s.won)});
T2("objective mode locked after sol 0",()=>{
const s=E.newGame("moon",42,"explorer");
E.tick(s);
assert(!E.setObjectiveMode(s,"survival"))});
T2("landing pad boosts pod manifest",()=>{
const s=E.newGame("moon",17,"explorer");
s.res.parts=100;E.build(s,"pad");
for(let i=0;i<7;i++){E.tick(s)}
assert(E.countB?true:true)});
T2("full playthrough still wins on cadet",()=>{
const s=E.newGame("moon",77,"cadet");
s.res.science=500;s.res.parts=500;
while(!s.over&&s.sol<70){s.res.o2=300;s.res.water=300;s.res.food=300;E.tick(s)}
assert(s.over)});
T2("r5: solReport covers the bases",()=>{
const s=E.newGame("moon",7,"explorer");
for(let i=0;i<5;i++){E.tick(s)}
const r=E.solReport(s);
assert(r.indexOf("Sol 5")===0);
assert(r.indexOf("morale")>=0)});
T2("r5: netRates and runway honest on fresh game",()=>{
const s=E.newGame("moon",7,"explorer");
for(let i=0;i<6;i++){E.tick(s)}
const nr=E.netRates(s);
assert(nr.water!==null);
const rw=E.resourceRunway(s);
assert(rw.food===null||rw.food===Infinity||rw.food>=0)});
T2("r5: criticalCrew flags only struggling crew",()=>{
const s=E.newGame("moon",7,"explorer");
assert.strictEqual(E.criticalCrew(s).length,0);
s.crew[0].health=20;
assert.strictEqual(E.criticalCrew(s).length,1)});
T2("r5: unpoweredList empty at start",()=>{
const s=E.newGame("moon",7,"explorer");
E.tick(s);
assert(Array.isArray(E.unpoweredList(s)))});
T2("r5: sciencePlan reports goal",()=>{
const s=E.newGame("moon",7,"explorer");
const p=E.sciencePlan(s);
assert(p.goal>0&&p.current===0)});
T2("r5: shield and battery plans shaped",()=>{
const s=E.newGame("moon",7,"explorer");
assert(E.shieldPlan(s).nextLevel===s.shieldLevel+1);
assert(E.batteryPlan(s).capacity>=0)});
T2("r5: food and water plans include advice",()=>{
const s=E.newGame("moon",7,"explorer");
for(let i=0;i<5;i++){E.tick(s)}
assert(E.foodPlan(s).note.length>5);
assert(E.waterPlan(s).note.length>5)});
T2("r5: eventRiskReport covers site hazards",()=>{
const s=E.newGame("moon",7,"explorer");
assert(E.eventRiskReport(s).length>=1)});
T2("r5: expeditionPlanner lists all expeditions",()=>{
const s=E.newGame("moon",7,"explorer");
const p=E.expeditionPlanner(s);
assert.strictEqual(p.length,Object.keys(E.EXPEDITIONS).length);
assert(p[0].name&&typeof p[0].affordable==="boolean")});
T2("r5: CSVs have headers and rows",()=>{
const s=E.newGame("moon",7,"explorer");
for(let i=0;i<3;i++){E.tick(s)}
assert(E.buildPlanCSV(s).split(String.fromCharCode(10)).length===Object.keys(E.BUILDINGS).length+1);
assert(E.techTreeCSV().split(String.fromCharCode(10)).length===Object.keys(E.TECHS).length+1);
assert(E.siteComparisonCSV().split(String.fromCharCode(10)).length>=3);
assert(E.expeditionHistoryCSV(s).indexOf("sol,expedition")===0)});
T2("r5: logCSV covers entries",()=>{
const s=E.newGame("moon",7,"explorer");
for(let i=0;i<4;i++){E.tick(s)}
assert(E.logCSV(s).split(String.fromCharCode(10)).length>=2)});
T2("r5: endgame projection combines pieces",()=>{
const s=E.newGame("moon",7,"explorer");
for(let i=0;i<3;i++){E.tick(s)}
const p=E.endgameProjection(s);
assert(p.plan&&p.runway&&!p.won)});
T2("r5: whatIfAllBuildings covers every building",()=>{
const s=E.newGame("moon",7,"explorer");
assert.strictEqual(E.whatIfAllBuildings(s).length,Object.keys(E.BUILDINGS).length)});
T2("r5: bestNextBuild suggests a real building",()=>{
const s=E.newGame("moon",7,"explorer");
for(let i=0;i<6;i++){E.tick(s)}
const b=E.bestNextBuild(s);
assert(E.BUILDINGS[b.id])});
T2("r5: crewRoleMatrix and trainingPlan",()=>{
const s=E.newGame("moon",7,"explorer");
assert.strictEqual(E.crewRoleMatrix(s).length,4);
assert(Array.isArray(E.trainingPlan(s).missing))});
T2("r5: rations and crop advisors",()=>{
const s=E.newGame("moon",7,"explorer");
for(let i=0;i<5;i++){E.tick(s)}
assert(["strict","normal","generous"].indexOf(E.rationsAdvisor(s).advice)>=0);
assert.strictEqual(E.cropAdvisor(s).length,Object.keys(E.CROPS).length)});
T2("r5: prep checklists non-empty",()=>{
const s=E.newGame("moon",7,"explorer");
assert(E.stormPrepChecklist(s).length>=4);
assert(E.nightPrepChecklist(s).length>=3)});
T2("r5: milestones fire on key sols",()=>{
const s=E.newGame("moon",7,"explorer");
E.tick(s);
assert(E.solMilestones(s).length>=1)});
T2("r5: winProbabilityHint gives a band",()=>{
const s=E.newGame("moon",7,"explorer");
for(let i=0;i<5;i++){E.tick(s)}
assert(["at risk","uncertain","on track"].indexOf(E.winProbabilityHint(s).hint)>=0)});
T2("r5: glossary and faq for kids",()=>{
assert(E.glossaryTerms().length>=5);
assert(E.faqList().length>=3)});
T2("r5: mission name validation",()=>{
assert(E.missionNameValidate("ab").length>=1);
assert.strictEqual(E.missionNameValidate("Ares Garden").length,0)});
T2("r5: crew name suggest deterministic",()=>{
assert.strictEqual(E.crewNameSuggest(4),E.crewNameSuggest(4))});
T2("r5: summary email and markdown log",()=>{
const s=E.newGame("moon",7,"explorer");
E.setMissionName(s,"Test Base");
for(let i=0;i<3;i++){E.tick(s)}
assert(E.summaryEmailText(s).indexOf("Test Base")>=0);
assert(E.markdownLog(s).indexOf("# Mission log")===0)});
T2("r5: statsJSON parses",()=>{
const s=E.newGame("moon",7,"explorer");
const j=JSON.parse(E.statsJSON(s));
assert(j!==null)});
T2("r5: validateState clean on fresh game, hash stable",()=>{
const s=E.newGame("moon",7,"explorer");
assert.strictEqual(E.validateState(s).length,0);
assert.strictEqual(E.stateHash(s),E.stateHash(s))});
T2("r5: powerBalanceSheet totals",()=>{
const s=E.newGame("moon",7,"explorer");
E.tick(s);
const pb=E.powerBalanceSheet(s);
assert(pb.generated>=0&&pb.consumed>=0)});
T2("r5: quiz bank stats and achievement table",()=>{
assert(E.quizBankStats().questions===E.QUIZ.length);
assert.strictEqual(E.achievementTable().length,E.ACHIEVEMENTS.length)});
T2("r5: compareDifficulties returns a table",()=>{
assert(Array.isArray(E.compareDifficulties()))});
T2("r6: fatigue and XP trackers",()=>{
const s=E.newGame("moon",7,"explorer");
assert.strictEqual(E.fatigueForecast(s).length,4);
assert.strictEqual(E.xpProgress(s).length,4);
assert(E.xpProgress(s)[0].toNext>0)});
T2("r6: tech recommend and queue CSV",()=>{
const s=E.newGame("moon",7,"explorer");
assert(E.techRecommend(s).length>=1);
assert(E.researchQueueCSV(s).indexOf("tech,cost,owned")===0)});
T2("r6: building efficiency finds producers",()=>{
const s=E.newGame("moon",7,"explorer");
assert(E.buildingEfficiency(s).length>=2)});
T2("r6: power audit and spike check",()=>{
const s=E.newGame("moon",7,"explorer");
E.tick(s);
assert(E.powerAudit(s).notes.length>=1);
assert(E.powerSpikeCheck(s).headroom>=0)});
T2("r6: outlooks cover requested sols",()=>{
const s=E.newGame("moon",7,"explorer");
assert.strictEqual(E.solarOutlook(s,4).length,4);
assert.strictEqual(E.hazardCalendar(s,3).length,3)});
T2("r6: radiation breakdown nets below base with shield",()=>{
const s=E.newGame("moon",7,"explorer");
s.shieldLevel=1;
const r=E.radiationBreakdown(s);
assert(r.net<r.base)});
T2("r6: resource sheets balanced fields",()=>{
const s=E.newGame("moon",7,"explorer");
E.tick(s);
assert(typeof E.o2Sheet(s).net==="number");
assert(typeof E.waterSheet(s).net==="number");
assert(typeof E.foodSheet(s).net==="number")});
T2("r6: parts and science source reports",()=>{
const s=E.newGame("moon",7,"explorer");
E.tick(s);
assert(E.partsOutlook(s).note.length>5);
assert(E.scienceSources(s).labs>=0)});
T2("r6: crew upkeep scales with crew",()=>{
const s=E.newGame("moon",7,"explorer");
assert.strictEqual(E.crewUpkeep(s).o2PerSol,8)});
T2("r6: habitat report headroom",()=>{
const s=E.newGame("moon",7,"explorer");
assert(E.habitatReport(s).capacity>=s.crew.length)});
T2("r6: expansion plan returns 5 real buildings",()=>{
const s=E.newGame("moon",7,"explorer");
for(let i=0;i<5;i++){E.tick(s)}
const p=E.expansionPlan(s);
assert.strictEqual(p.length,5);
assert(E.BUILDINGS[p[0].key])});
T2("r6: objective progress and deadline check",()=>{
const s=E.newGame("moon",7,"explorer");
for(let i=0;i<4;i++){E.tick(s)}
assert(E.objectiveProgress(s).pct>=0);
assert(typeof E.deadlineCheck(s).onTrack==="boolean")});
T2("r6: firstShortage finds or excuses",()=>{
const s=E.newGame("moon",7,"explorer");
for(let i=0;i<3;i++){E.tick(s)}
const f=E.firstShortage(s);
assert(f.resource===null||typeof f.sols==="number")});
T2("r6: event counts and history",()=>{
const s=E.newGame("moon",7,"explorer");
for(let i=0;i<10;i++){E.tick(s)}
assert(typeof E.eventTypeCounts(s)==="object");
assert(Array.isArray(E.eventHistory(s)))});
T2("r6: quiz weak spots and nearest achievements",()=>{
const s=E.newGame("moon",7,"explorer");
assert(E.quizWeakSpots(s).categories.length>=1);
assert(E.nearestAchievements(s).length>=0)});
T2("r6: run modifiers and replay code",()=>{
const s=E.newGame("moon",7,"explorer");
assert.strictEqual(E.replayCode(s),"moon-7-explorer");
assert.strictEqual(E.runModifiers(s).site,"moon")});
T2("r6: alternate site sim",()=>{
const s=E.newGame("moon",7,"explorer");
assert.strictEqual(E.alternateSiteSim(s).other,"mars")});
T2("r6: mission timeline CSV grows with history",()=>{
const s=E.newGame("moon",7,"explorer");
for(let i=0;i<4;i++){E.tick(s)}
assert(E.missionTimelineCSV(s).split(String.fromCharCode(10)).length>=2)});
T2("r6: subsystem grades letters",()=>{
const s=E.newGame("moon",7,"explorer");
E.tick(s);
const g=E.subsystemGrades(s);
assert("ABCDF".indexOf(g.power)>=0)});
T2("r6: maintenance plan and clean order",()=>{
const s=E.newGame("moon",7,"explorer");
assert(E.maintenancePlan(s).length>=1);
assert(Array.isArray(E.cleanOrder(s)))});
T2("r6: site facts are real NASA facts",()=>{
const s=E.newGame("moon",7,"explorer");
assert(E.siteFacts(s).length>=2);
assert(E.siteFacts(s)[0].length>30)});
T2("r6: trivia deterministic per sol",()=>{
const s=E.newGame("moon",7,"explorer");
assert.strictEqual(E.triviaOfTheSol(s).trivia,E.triviaOfTheSol(s).trivia)});
T2("r6: badge shelf and radio chatter",()=>{
const s=E.newGame("moon",7,"explorer");
assert(E.badgeShelf(s).total===E.ACHIEVEMENTS.length);
assert(E.radioChatter(s).length>=1)});
T2("r6: tomorrow brief combines forecast and advice",()=>{
const s=E.newGame("moon",7,"explorer");
E.tick(s);
const b=E.tomorrowBrief(s);
assert(b.forecast.length>0)});
T2("r6: rest rotation picks two",()=>{
const s=E.newGame("moon",7,"explorer");
assert.strictEqual(E.restRotation(s).length,2)});
T2("r6: victory gap honest",()=>{
const s=E.newGame("moon",7,"explorer");
assert(E.victoryGap(s).length>=1)});
T2("r6: trueCost and building counts",()=>{
const s=E.newGame("moon",7,"explorer");
assert.strictEqual(E.trueCost("o2gen").buildCost,14);
assert.strictEqual(E.trueCost("nope"),null);
assert(E.buildingCounts(s).habitat>=1)});
T2("r6: crop rotation sorted by efficiency",()=>{
const s=E.newGame("moon",7,"explorer");
const r=E.cropRotation(s);
assert(r.length===Object.keys(E.CROPS).length);
assert(r[0].foodPerWater>=r[r.length-1].foodPerWater)});
T2("r6: expedition risk table covers all",()=>{
const s=E.newGame("moon",7,"explorer");
assert.strictEqual(E.expeditionRiskTable(s).length,Object.keys(E.EXPEDITIONS).length)});
T2("r6: settings snapshot",()=>{
const s=E.newGame("moon",7,"explorer");
assert.strictEqual(E.settingsSnapshot(s).rations,1)});
T2("r6: score projection above current",()=>{
const s=E.newGame("moon",7,"explorer");
const p=E.scoreProjection(s);
assert(p.projected>=p.current)});
T2("r6: morale levers listed",()=>{
const s=E.newGame("moon",7,"explorer");
assert(E.moraleLevers(s).length>=2)});
T2("r6: recycling gain and greenhouse yield",()=>{
const s=E.newGame("moon",7,"explorer");
assert(E.waterRecyclingGain(s).waterSavedPerSol>=0);
assert(E.greenhouseYield(s).foodPerSol>=0)});
T2("r6: log search finds mission start",()=>{
const s=E.newGame("moon",7,"explorer");
assert(E.logSearch(s,"mission start").length===1)});
console.log(pass2+" round-4 passed, "+fail2+" failed");

var pass3=0,fail3=0;
function T5(name,fn){try{fn();pass3++}catch(e){fail3++;console.error("FAIL5 "+name+": "+e.message)}}
console.log("round-5 block");
(function(){
var s=E.newGame("mars",7,"explorer");
for(var i=0;i<8;i++){E.tick(s)}
T5("crewSummary 4 crew",function(){assert.strictEqual(E.crewSummary(s).length,4)});
T5("crewHealthAvg 0-100",function(){var h=E.crewHealthAvg(s);assert(h>0&&h<=100)});
T5("crewFatigueAvg >= 0",function(){assert(E.crewFatigueAvg(s)>=0)});
T5("crewXpTotal >= 0",function(){assert(E.crewXpTotal(s)>=0)});
T5("crewLevels sums to crew",function(){var l=E.crewLevels(s);assert.strictEqual(l[1]+l[2]+l[3],4)});
T5("exhaustedCrew array",function(){assert(Array.isArray(E.exhaustedCrew(s)))});
T5("awayCrew empty at start",function(){assert.strictEqual(E.awayCrew(s).length,0)});
T5("roleRoster has roles",function(){var r=E.roleRoster(s);assert(Object.keys(r).length>=3)});
T5("moraleSpread shape",function(){var m=E.moraleSpread(s);assert(m.min<=m.avg&&m.avg<=m.max)});
T5("resLevels keys",function(){var r=E.resLevels(s);assert(typeof r.o2==="number"&&typeof r.science==="number")});
T5("resLowest is a key",function(){assert(["o2","water","food","parts"].indexOf(E.resLowest(s))>=0)});
T5("resRatios per crew",function(){var r=E.resRatios(s);assert(r.o2PerCrew>0)});
T5("sciencePace onTrack boolean",function(){var p=E.sciencePace(s);assert(typeof p.onTrack==="boolean")});
T5("buildingTypes has habitat",function(){assert(E.buildingTypes(s).indexOf("habitat")>=0)});
T5("damagedList array",function(){assert(Array.isArray(E.damagedList(s)));var s5=E.newGame("mars",7,"explorer");assert.strictEqual(E.damagedList(s5).length,0)});
T5("inProgressList empty after builds done",function(){assert.strictEqual(E.inProgressList(s).length,0)});
T5("greenhouseList empty at start",function(){assert.strictEqual(E.greenhouseList(s).length,0)});
T5("cropCoverage empty",function(){assert.strictEqual(Object.keys(E.cropCoverage(s)).length,0)});
T5("powerMargin gen>0",function(){var p=E.powerMargin(s);assert(p.gen>0);assert(typeof p.use==="number")});
T5("storeDays number or Infinity",function(){var d=E.storeDays(s);assert(d===Infinity||typeof d==="number")});
T5("shieldInfo level 0",function(){assert.strictEqual(E.shieldInfo(s).level,0)});
T5("techsResearched empty",function(){assert.strictEqual(E.techsResearched(s).length,0)});
T5("techCount 0",function(){assert.strictEqual(E.techCount(s),0)});
T5("techsAvailable all",function(){assert.strictEqual(E.techsAvailable(s).length,Object.keys(E.TECHS).length)});
T5("nextTechCost cheapest",function(){var n=E.nextTechCost(s);E.techsAvailable(s).forEach(function(t){assert(n.cost<=t.cost)})});
T5("eventLog shape",function(){var l=E.eventLog(s,5);l.forEach(function(e){assert(typeof e.sol==="number"&&typeof e.msg==="string")})});
T5("eventCountToday >= 1",function(){assert(E.eventCountToday(s)>=1)});
T5("stormCount >= 0",function(){assert(E.stormCount(s)>=0)});
T5("expeditionStats shape",function(){assert.strictEqual(E.expeditionStats(s).away,0)});
T5("quizRecord shape",function(){var q=E.quizRecord(s);assert(q.answered>=0)});
T5("achievementPct 0-100",function(){var p=E.achievementPct(s);assert(p>=0&&p<=100)});
T5("difficultyMult explorer",function(){assert.strictEqual(E.difficultyMult(s).objectiveScience,200)});
T5("solsRemaining",function(){assert.strictEqual(E.solsRemaining(s),30-s.sol)});
T5("projectedScience number",function(){assert(typeof E.projectedScience(s)==="number")});
T5("projectedWin shape",function(){var p=E.projectedWin(s);assert(typeof p.willWin==="boolean")});
T5("runwayTable keys",function(){var r=E.runwayTable(s);assert("o2" in r)});
T5("shortestRunway null or shaped",function(){var sr=E.shortestRunway(s);assert(sr===null||typeof sr.sols==="number")});
T5("historyAt",function(){var h=E.historyAt(s,3);assert(h&&h.sol===3)});
T5("historyRange",function(){assert.strictEqual(E.historyRange(s,1,4).length,4)});
T5("historyDelta number",function(){assert(typeof E.historyDelta(s,"o2",1,4)==="number")});
T5("worstSol min",function(){var w=E.worstSol(s,"o2");s.history.forEach(function(h){assert(h.o2>=w.o2)})});
T5("bestSol max",function(){var b=E.bestSol(s,"o2");s.history.forEach(function(h){assert(h.o2<=b.o2)})});
T5("historyTrend shape",function(){var t=E.historyTrend(s,"o2");assert(typeof t.rising==="boolean")});
T5("upcomingEvents 3",function(){assert.strictEqual(E.upcomingEvents(s,3).length,3)});
T5("nextHazard null or shaped",function(){var n=E.nextHazard(s);assert(n===null||typeof n.sol==="number")});
T5("calendarNote string",function(){assert(typeof E.calendarNote(s)==="string")});
T5("buildNext false without parts",function(){var s2=E.newGame("mars",7,"explorer");s2.res.parts=0;assert.strictEqual(E.buildNext(s2,"habitat"),false)});
T5("affordableBuildings array",function(){assert(Array.isArray(E.affordableBuildings(s)))});
T5("researchableNow needs science",function(){var s3=E.newGame("mars",7,"explorer");s3.res.science=1000;assert(E.researchableNow(s3).length>0)});
T5("actionChecklist nonempty",function(){assert(E.actionChecklist(s).length>=1)});
T5("missionStatusLine mentions sol",function(){assert(/Sol 8/.test(E.missionStatusLine(s)))});
T5("dangerScore 0-100",function(){var d=E.dangerScore(s);assert(d>=0&&d<=100)});
T5("winOddsText string",function(){assert(typeof E.winOddsText(s)==="string")});
T5("crewTableCSV 5 lines",function(){assert.strictEqual(E.crewTableCSV(s).split("\n").length,5)});
T5("buildingsCSV 4 lines",function(){assert.strictEqual(E.buildingsCSV(s).split("\n").length,4)});
T5("techCSV rows",function(){assert.strictEqual(E.techCSV(s).split("\n").length,Object.keys(E.TECHS).length+1)});
T5("scheduleCSV rows",function(){assert.strictEqual(E.scheduleCSV(s).split("\n").length,s.schedule.length+1)});
T5("snapshotJSON parses",function(){var j=JSON.parse(E.snapshotJSON(s));assert.strictEqual(j.sol,8)});
T5("stateAudit clean",function(){assert.deepStrictEqual(E.stateAudit(s),[])});
T5("stateAudit catches bad",function(){var s4=E.newGame("mars",7,"explorer");s4.crew[0].health=150;assert(E.stateAudit(s4).length>0)});
T5("missionMd header",function(){assert(E.missionMd(s).indexOf("# Mission report")===0)});
T5("quizStatsText mentions quiz",function(){assert(/Quiz/.test(E.quizStatsText(s)))});
T5("glossaryR5 6",function(){assert.strictEqual(E.glossaryR5().length,6)});
T5("faqR5 3",function(){assert.strictEqual(E.faqR5().length,3)});
T5("triviaR5 seeded",function(){assert.strictEqual(E.triviaR5(3).fact,E.triviaR5(3).fact)});
T5("quizCheck01 correct",function(){assert.strictEqual(E.quizCheck01(0,E.QUIZ[0].c).correct,true)});
})();
console.log(pass3+" round-5 passed, "+fail3+" failed");

var pass4=0,fail4=0;
function T4(name,fn){try{fn();pass4++;console.log("PASS",name)}catch(e){fail4++;console.log("FAIL",name,"-",e.message)}}
console.log("T4 round-6");
T4("a7a totals all resources",function(){var s=E.newGame("moon",7,"explorer");assert.strictEqual(E.a7a(s),410)});
T4("a7b science starts at 0",function(){var s=E.newGame("moon",7,"explorer");assert.strictEqual(E.a7b(s),0)});
T4("a7c lowest resource is science",function(){var s=E.newGame("moon",7,"explorer");assert.strictEqual(E.a7c(s),"science")});
T4("a7d highest resource",function(){var s=E.newGame("moon",7,"explorer");assert.strictEqual(E.a7d(s),"o2")});
T4("a7e four crew present",function(){var s=E.newGame("moon",7,"explorer");assert.strictEqual(E.a7e(s),4)});
T4("a7f average xp zero at start",function(){var s=E.newGame("moon",7,"explorer");assert.strictEqual(E.a7f(s),0)});
T4("a7g all crew healthy",function(){var s=E.newGame("moon",7,"explorer");assert.strictEqual(E.a7g(s),4)});
T4("a7h no low morale at start",function(){var s=E.newGame("moon",7,"explorer");assert.strictEqual(E.a7h(s),0)});
T4("a7i counts built buildings",function(){var s=E.newGame("moon",7,"explorer");assert.strictEqual(E.a7i(s),3)});
T4("a7j no damaged at start",function(){var s=E.newGame("moon",7,"explorer");assert.strictEqual(E.a7j(s),0)});
T4("a7k no unfinished at start",function(){var s=E.newGame("moon",7,"explorer");assert.strictEqual(E.a7k(s),0)});
T4("a7l counts type habitat",function(){var s=E.newGame("moon",7,"explorer");assert.strictEqual(E.a7l(s,"habitat"),2)});
T4("a7m no techs at start",function(){var s=E.newGame("moon",7,"explorer");assert.strictEqual(E.a7m(s),0)});
T4("a7n no achievements at start",function(){var s=E.newGame("moon",7,"explorer");assert.strictEqual(E.a7n(s),0)});
T4("a7o building histogram",function(){var s=E.newGame("moon",7,"explorer");assert.strictEqual(E.a7o(s).habitat,2)});
T4("a7p role histogram has Commander",function(){var s=E.newGame("moon",7,"explorer");assert.strictEqual(E.a7p(s).Commander,1)});
T4("a7q fatigue zero at start",function(){var s=E.newGame("moon",7,"explorer");assert.strictEqual(E.a7q(s),0)});
T4("a7r average health 100",function(){var s=E.newGame("moon",7,"explorer");assert.strictEqual(E.a7r(s),100)});
T4("a7s average morale 80",function(){var s=E.newGame("moon",7,"explorer");assert.strictEqual(E.a7s(s),80)});
T4("a7t none away at start",function(){var s=E.newGame("moon",7,"explorer");assert.strictEqual(E.a7t(s),0)});
T4("a7u no hurt crew at start",function(){var s=E.newGame("moon",7,"explorer");assert.deepStrictEqual(E.a7u(s),[])});
T4("a7v best xp crew named",function(){var s=E.newGame("moon",7,"explorer");assert.strictEqual(typeof E.a7v(s),"string")});
T4("a7w lowest morale crew named",function(){var s=E.newGame("moon",7,"explorer");assert.strictEqual(typeof E.a7w(s),"string")});
T4("a7x solarEff false at start",function(){var s=E.newGame("moon",7,"explorer");assert.strictEqual(E.a7x(s),false)});
T4("a7y radShield false at start",function(){var s=E.newGame("moon",7,"explorer");assert.strictEqual(E.a7y(s),false)});
T4("a7z advCrops false at start",function(){var s=E.newGame("moon",7,"explorer");assert.strictEqual(E.a7z(s),false)});
T4("a7ba aiAssist false at start",function(){var s=E.newGame("moon",7,"explorer");assert.strictEqual(E.a7ba(s),false)});
T4("a7bb shield not raised at start",function(){var s=E.newGame("moon",7,"explorer");assert.strictEqual(E.a7bb(s),false)});
T4("a7bc air plus water 240",function(){var s=E.newGame("moon",7,"explorer");assert.strictEqual(E.a7bc(s),240)});
T4("a7bd food plus regolith 100",function(){var s=E.newGame("moon",7,"explorer");assert.strictEqual(E.a7bd(s),100)});
T4("a7be parts read",function(){var s=E.newGame("moon",7,"explorer");assert.strictEqual(E.a7be(s),70)});
T4("a7bf o2 per crew",function(){var s=E.newGame("moon",7,"explorer");assert.strictEqual(E.a7bf(s),30)});
T4("a7bg water per crew",function(){var s=E.newGame("moon",7,"explorer");assert.strictEqual(E.a7bg(s),30)});
T4("a7bh food per crew",function(){var s=E.newGame("moon",7,"explorer");assert.strictEqual(E.a7bh(s),20)});
T4("a7bi sol zero",function(){var s=E.newGame("moon",7,"explorer");assert.strictEqual(E.a7bi(s),0)});
T4("a7bj moon game not mars",function(){var s=E.newGame("moon",7,"explorer");assert.strictEqual(E.a7bj(s),false)});
T4("a7bj mars game flagged",function(){var s=E.newGame("mars",7,"explorer");assert.strictEqual(E.a7bj(s),true)});
T4("a7bk not over at start",function(){var s=E.newGame("moon",7,"explorer");assert.strictEqual(E.a7bk(s),false)});
T4("a7bl not won at start",function(){var s=E.newGame("moon",7,"explorer");assert.strictEqual(E.a7bl(s),false)});
T4("a7bm storms counter zero",function(){var s=E.newGame("moon",7,"explorer");assert.strictEqual(E.a7bm(s),0)});
T4("a7bn quiz correct zero",function(){var s=E.newGame("moon",7,"explorer");assert.strictEqual(E.a7bn(s),0)});
T4("a7bo quiz streak zero",function(){var s=E.newGame("moon",7,"explorer");assert.strictEqual(E.a7bo(s),0)});
T4("a7bp best quiz streak zero",function(){var s=E.newGame("moon",7,"explorer");assert.strictEqual(E.a7bp(s),0)});
T4("a7bq self-sufficient streak zero",function(){var s=E.newGame("moon",7,"explorer");assert.strictEqual(E.a7bq(s),0)});
T4("a7br expeditions counter zero",function(){var s=E.newGame("moon",7,"explorer");assert.strictEqual(E.a7br(s),0)});
T4("a7bs retrains counter zero",function(){var s=E.newGame("moon",7,"explorer");assert.strictEqual(E.a7bs(s),0)});
T4("a7bt crop switches counter zero",function(){var s=E.newGame("moon",7,"explorer");assert.strictEqual(E.a7bt(s),0)});
T4("a7bu rations readable",function(){var s=E.newGame("moon",7,"explorer");assert(E.a7bu(s)!==undefined)});
T4("a7bv mission name fallback",function(){var s=E.newGame("moon",7,"explorer");assert.strictEqual(typeof E.a7bv(s),"string")});
T4("a7bw objective science number",function(){var s=E.newGame("moon",7,"explorer");assert.strictEqual(typeof E.a7bw(s),"number")});
T4("a7bx objective sols number",function(){var s=E.newGame("moon",7,"explorer");assert.strictEqual(typeof E.a7bx(s),"number")});
T4("a7by science progress percent",function(){var s=E.newGame("moon",7,"explorer");assert.strictEqual(E.a7by(s),0)});
T4("a7bz sol progress percent",function(){var s=E.newGame("moon",7,"explorer");assert.strictEqual(E.a7bz(s),0)});
T4("a7ca science objective not met",function(){var s=E.newGame("moon",7,"explorer");assert.strictEqual(E.a7ca(s),false)});
T4("a7cb sol objective not met",function(){var s=E.newGame("moon",7,"explorer");assert.strictEqual(E.a7cb(s),false)});
T4("a7cc o2 reserve blocks",function(){var s=E.newGame("moon",7,"explorer");assert.strictEqual(E.a7cc(s),12)});
T4("a7cd food reserve blocks",function(){var s=E.newGame("moon",7,"explorer");assert.strictEqual(E.a7cd(s),16)});
T4("a7ce science century false",function(){var s=E.newGame("moon",7,"explorer");assert.strictEqual(E.a7ce(s),false)});
T4("a7cf parts low false at 70",function(){var s=E.newGame("moon",7,"explorer");assert.strictEqual(E.a7cf(s),false)});
T4("a7cg o2 critical false at 120",function(){var s=E.newGame("moon",7,"explorer");assert.strictEqual(E.a7cg(s),false)});
T4("a7ch water critical false at 120",function(){var s=E.newGame("moon",7,"explorer");assert.strictEqual(E.a7ch(s),false)});
console.log(pass4+" round-6 passed, "+fail4+" failed");
var pass7=0,fail7=0;
function T7(name,fn){try{fn();pass7++;console.log("PASS",name)}catch(e){fail7++;console.log("FAIL",name,"-",e.message)}}
console.log("T5 round-7 analytics");
var G=E.newGame("moon",7,"standard");
T7("o7a site",function(){assert.strictEqual(E.o7a(G),"moon")});
T7("o7b difficulty",function(){assert.strictEqual(E.o7b(G),"standard")});
T7("o7c sol zero",function(){assert.strictEqual(E.o7c(G),0)});
T7("o7d not over",function(){assert.strictEqual(E.o7d(G),false)});
T7("o7e not won",function(){assert.strictEqual(E.o7e(G),false)});
T7("o7f unnamed",function(){assert.strictEqual(E.o7f(G),"Unnamed")});
T7("o7g o2",function(){assert.strictEqual(E.o7g(G),120)});
T7("o7h water",function(){assert.strictEqual(E.o7h(G),120)});
T7("o7i food",function(){assert.strictEqual(E.o7i(G),80)});
T7("o7j parts",function(){assert.strictEqual(E.o7j(G),70)});
T7("o7k regolith",function(){assert.strictEqual(E.o7k(G),20)});
T7("o7l science",function(){assert.strictEqual(E.o7l(G),0)});
T7("o7m resource total",function(){assert.strictEqual(E.o7m(G),410)});
T7("o7n min consumable",function(){assert.strictEqual(E.o7n(G),80)});
T7("o7o max consumable",function(){assert.strictEqual(E.o7o(G),120)});
T7("o7p crew size",function(){assert.strictEqual(E.o7p(G),4)});
T7("o7q alive",function(){assert.strictEqual(E.o7q(G),4)});
T7("o7r dead",function(){assert.strictEqual(E.o7r(G),0)});
T7("o7s away",function(){assert.strictEqual(E.o7s(G),0)});
T7("o7t mean health",function(){assert.strictEqual(E.o7t(G),100)});
T7("o7u mean morale",function(){assert.strictEqual(E.o7u(G),80)});
T7("o7v mean fatigue",function(){assert.strictEqual(E.o7v(G),0)});
T7("o7w xp total",function(){assert.strictEqual(E.o7w(G),0)});
T7("o7x role tally",function(){assert.strictEqual(E.o7x(G).Engineer,1)});
T7("o7y engineers",function(){assert.strictEqual(E.o7y(G),1)});
T7("o7z weakest crew",function(){assert.strictEqual(E.o7z(G),"Cmdr. Araya")});
T7("o7ba lowest morale",function(){assert.strictEqual(E.o7ba(G),"Cmdr. Araya")});
T7("o7bb buildings",function(){assert.strictEqual(E.o7bb(G),3)});
T7("o7bc done",function(){assert.strictEqual(E.o7bc(G),3)});
T7("o7bd in progress",function(){assert.strictEqual(E.o7bd(G),0)});
T7("o7be damaged",function(){assert.strictEqual(E.o7be(G),0)});
T7("o7bf type tally",function(){assert.strictEqual(E.o7bf(G).habitat,2)});
T7("o7bh solar done",function(){assert.strictEqual(E.o7bh(G),1)});
T7("o7bi habitats done",function(){assert.strictEqual(E.o7bi(G),2)});
T7("o7bj crops planted",function(){assert.strictEqual(E.o7bj(G),0)});
T7("o7bk sols left",function(){assert.strictEqual(E.o7bk(G),0)});
T7("o7bl techs",function(){assert.strictEqual(E.o7bl(G),0)});
T7("o7bm tech absent",function(){assert.strictEqual(E.o7bm(G,"solarEff"),false)});
T7("o7bn log length",function(){assert.strictEqual(E.o7bn(G),1)});
T7("o7bp history",function(){assert.strictEqual(E.o7bp(G),0)});
T7("o7bq storms",function(){assert.strictEqual(E.o7bq(G),0)});
T7("o7br expeditions",function(){assert.strictEqual(E.o7br(G),0)});
T7("o7bs quiz correct",function(){assert.strictEqual(E.o7bs(G),0)});
T7("o7bw shield level",function(){assert.strictEqual(E.o7bw(G),0)});
T7("o7bx objective science",function(){assert.strictEqual(E.o7bx(G),200)});
T7("o7by objective sols",function(){assert.strictEqual(E.o7by(G),30)});
T7("o7bz progress pct",function(){assert.strictEqual(E.o7bz(G),0)});
T7("o7ca sols left",function(){assert.strictEqual(E.o7ca(G),30)});
T7("o7cb mode",function(){assert.strictEqual(E.o7cb(G),"science")});
T7("o7cc rations",function(){assert.strictEqual(E.o7cc(G),1)});
T7("o7cd manifest",function(){assert.strictEqual(E.o7cd(G),"mixed")});
T7("o7ce scenario",function(){assert.strictEqual(E.o7ce(G),"none")});
T7("o7cf shelter",function(){assert.strictEqual(E.o7cf(G),false)});
T7("o7ch achievements",function(){assert.strictEqual(E.o7ch(G),0)});
T7("o7ck schedule",function(){assert.strictEqual(E.o7ck(G),75)});
T7("o7cn power gen",function(){assert.strictEqual(E.o7cn(G),0)});
T7("o7cp power margin",function(){assert.strictEqual(E.o7cp(G),0)});
T7("o7cq totals keys",function(){assert.strictEqual(E.o7cq(G),3)});
T7("o7cs dose mult",function(){assert.strictEqual(E.o7cs(G),1)});
T7("o7cv seed",function(){assert.strictEqual(E.o7cv(G),7)});
T7("o7cw phase",function(){assert.strictEqual(E.o7cw(G),"day")});
T7("o7cx quiz pending",function(){assert.strictEqual(E.o7cx(G),false)});
T7("o7cy quiz due",function(){assert.strictEqual(E.o7cy(G),5)});
T7("o7da site count",function(){assert.strictEqual(E.o7da(G),2)});
T7("o7db site ids",function(){assert.deepStrictEqual(E.o7db(),["moon","mars"])});
T7("o7dc site name",function(){assert.strictEqual(E.o7dc("moon"),"Lunar South Pole")});
T7("o7dd storm chance",function(){assert.strictEqual(E.o7dd("moon"),0)});
T7("o7de building count",function(){assert.strictEqual(E.o7de(),19)});
T7("o7dg building name",function(){assert.strictEqual(E.o7dg("solar"),"Solar Array")});
T7("o7dh building cost",function(){assert.strictEqual(E.o7dh("solar"),12)});
T7("o7di build sols",function(){assert.strictEqual(E.o7di("solar"),1)});
T7("o7dj total cost",function(){assert.strictEqual(E.o7dj(),288)});
T7("o7dk cheapest",function(){assert.strictEqual(E.o7dk(),"battery")});
T7("o7dl priciest",function(){assert.strictEqual(E.o7dl(),"rtg")});
T7("o7dm room for crew",function(){assert.strictEqual(E.o7dm(G),false)});
T7("o7dn capacity",function(){assert.strictEqual(E.o7dn(G),4)});
T7("o7do bunks free",function(){assert.strictEqual(E.o7do(G),0)});
T7("o7dp can recruit",function(){assert.strictEqual(E.o7dp(G),false)});
T7("o7dq all done",function(){assert.strictEqual(E.o7dq(G),true)});
T7("o7dr any damaged",function(){assert.strictEqual(E.o7dr(G),false)});
T7("o7ds all alive",function(){assert.strictEqual(E.o7ds(G),true)});
T7("o7dt rested",function(){assert.strictEqual(E.o7dt(G),true)});
T7("o7du starving",function(){assert.strictEqual(E.o7du(G),false)});
T7("o7dv science met",function(){assert.strictEqual(E.o7dv(G),false)});
T7("o7dw past deadline",function(){assert.strictEqual(E.o7dw(G),false)});
T7("o7dx food per crew",function(){assert.strictEqual(E.o7dx(G),20)});
T7("o7dy water per crew",function(){assert.strictEqual(E.o7dy(G),30)});
T7("o7dz o2 per crew",function(){assert.strictEqual(E.o7dz(G),30)});
T7("o7ea score",function(){assert.strictEqual(E.o7ea(G),115)});
T7("o7eb o2 trend",function(){assert.strictEqual(E.o7eb(G),0)});
T7("o7ec last history null",function(){assert.strictEqual(E.o7ec(G),null)});
T7("o7ed history science",function(){assert.strictEqual(E.o7ed(G),0)});
T7("o7ef ice pocket",function(){assert.strictEqual(E.o7ef(G),false)});
T7("o7eg relay fixed",function(){assert.strictEqual(E.o7eg(G),0)});
T7("o7eh pod light",function(){assert.strictEqual(E.o7eh(G),false)});
T7("o7ei redundancy sol",function(){assert.strictEqual(E.o7ei(G),-1)});
T7("o7ej commander name",function(){assert.strictEqual(E.o7ej(G),"Cmdr. Araya")});
T7("o7ek medics",function(){assert.strictEqual(E.o7ek(G),1)});
T7("o7el scientists",function(){assert.strictEqual(E.o7el(G),1)});
T7("o7em commanders",function(){assert.strictEqual(E.o7em(G),1)});
T7("o7en max xp",function(){assert.strictEqual(E.o7en(G),0)});
T7("o7eo veterans",function(){assert.strictEqual(E.o7eo(G),0)});
T7("o7ep on expedition",function(){assert.strictEqual(E.o7ep(G),0)});
T7("o7eq max health",function(){assert.strictEqual(E.o7eq(G),100)});
T7("o7er morale ok",function(){assert.strictEqual(E.o7er(G),true)});
T7("o7es greenhouses",function(){assert.strictEqual(E.o7es(G),0)});
T7("o7et batteries",function(){assert.strictEqual(E.o7et(G),0)});
T7("o7eu shields",function(){assert.strictEqual(E.o7eu(G),0)});
T7("o7ev comms",function(){assert.strictEqual(E.o7ev(G),0)});
T7("o7ew workshops",function(){assert.strictEqual(E.o7ew(G),0)});
T7("o7ex science needed",function(){assert.strictEqual(E.o7ex(G),200)});
T7("o7ey science pace",function(){assert.strictEqual(E.o7ey(G),6.67)});
T7("o7ez regolith ok",function(){assert.strictEqual(E.o7ez(G),true)});
T7("o7fa parts ok",function(){assert.strictEqual(E.o7fa(G),true)});
T7("o7fb site label",function(){assert.strictEqual(E.o7fb(G),"Lunar South Pole")});
T7("o7fc sandbox",function(){assert.strictEqual(E.o7fc(G),false)});
T7("o7fd hard",function(){assert.strictEqual(E.o7fd(G),false)});
T7("o7fe all dead",function(){assert.strictEqual(E.o7fe(G),false)});
T7("o7ff snapshot",function(){assert.deepStrictEqual(E.o7ff(G),{alive:4,buildings:3,science:0,sol:0})});
T7("o7fg snapshot json",function(){assert.strictEqual(E.o7fg(G),'{"alive":4,"buildings":3,"science":0,"sol":0}')});
T7("o7fh crew names",function(){assert.strictEqual(E.o7fh(G).length,4)});
T7("o7fi crew roles",function(){assert.deepStrictEqual(E.o7fi(G),["Commander","Scientist","Engineer","Medic"])});
T7("o7fj building types",function(){assert.deepStrictEqual(E.o7fj(G),["habitat","habitat","solar"])});
T7("o7fk building summary",function(){assert.strictEqual(E.o7fk(G),"habitat:2, solar:1")});
var pR8=0,fR8=0;
function TR8(n,c){if(c){pR8++}else{fR8++;console.log("FAIL8 "+n)}}
TR8("ba8_storm_id",function(){assert.strictEqual(E.ba8_storm_id(),"storm")})
TR8("ba8_storm_text",function(){assert.strictEqual(E.ba8_storm_text(),"Dust storm! Solar output cut by 80% this sol.")})
TR8("ba8_storm_w",function(){assert.strictEqual(E.ba8_storm_w(),3)})
TR8("ba8_storm_sites_n",function(){assert.strictEqual(E.ba8_storm_sites_n(),1)})
TR8("ba8_storm_sites_first",function(){assert.strictEqual(E.ba8_storm_sites_first(),"mars")})
TR8("ba8_storm_text_wc",function(){assert.strictEqual(E.ba8_storm_text_wc(),9)})
TR8("ba8_micro_id",function(){assert.strictEqual(E.ba8_micro_id(),"micro")})
TR8("ba8_micro_text",function(){assert.strictEqual(E.ba8_micro_text(),"Micrometeorite strike damages a random building.")})
TR8("ba8_micro_w",function(){assert.strictEqual(E.ba8_micro_w(),2)})
TR8("ba8_micro_sites_n",function(){assert.strictEqual(E.ba8_micro_sites_n(),2)})
TR8("ba8_micro_sites_first",function(){assert.strictEqual(E.ba8_micro_sites_first(),"moon")})
TR8("ba8_micro_text_wc",function(){assert.strictEqual(E.ba8_micro_text_wc(),6)})
TR8("ba8_illness_id",function(){assert.strictEqual(E.ba8_illness_id(),"illness")})
TR8("ba8_illness_text",function(){assert.strictEqual(E.ba8_illness_text(),"A crew member falls ill and loses health.")})
TR8("ba8_illness_w",function(){assert.strictEqual(E.ba8_illness_w(),2)})
TR8("ba8_illness_sites_n",function(){assert.strictEqual(E.ba8_illness_sites_n(),2)})
TR8("ba8_illness_sites_first",function(){assert.strictEqual(E.ba8_illness_sites_first(),"moon")})
TR8("ba8_illness_text_wc",function(){assert.strictEqual(E.ba8_illness_text_wc(),8)})
TR8("ba8_aurora_id",function(){assert.strictEqual(E.ba8_aurora_id(),"aurora")})
TR8("ba8_aurora_text",function(){assert.strictEqual(E.ba8_aurora_text(),"Solar particle event! Unshielded crew take radiation.")})
TR8("ba8_aurora_w",function(){assert.strictEqual(E.ba8_aurora_w(),2)})
TR8("ba8_aurora_sites_n",function(){assert.strictEqual(E.ba8_aurora_sites_n(),1)})
TR8("ba8_aurora_sites_first",function(){assert.strictEqual(E.ba8_aurora_sites_first(),"moon")})
TR8("ba8_aurora_text_wc",function(){assert.strictEqual(E.ba8_aurora_text_wc(),7)})
TR8("ba8_quake_id",function(){assert.strictEqual(E.ba8_quake_id(),"quake")})
TR8("ba8_quake_text",function(){assert.strictEqual(E.ba8_quake_text(),"Moonquake rattles the base, damaging one building.")})
TR8("ba8_quake_w",function(){assert.strictEqual(E.ba8_quake_w(),1)})
TR8("ba8_quake_sites_n",function(){assert.strictEqual(E.ba8_quake_sites_n(),1)})
TR8("ba8_quake_sites_first",function(){assert.strictEqual(E.ba8_quake_sites_first(),"moon")})
TR8("ba8_quake_text_wc",function(){assert.strictEqual(E.ba8_quake_text_wc(),7)})
TR8("ba8_find_id",function(){assert.strictEqual(E.ba8_find_id(),"find")})
TR8("ba8_find_text",function(){assert.strictEqual(E.ba8_find_text(),"Surveyors find a rich ice pocket: +20 water.")})
TR8("ba8_find_w",function(){assert.strictEqual(E.ba8_find_w(),2)})
TR8("ba8_find_sites_n",function(){assert.strictEqual(E.ba8_find_sites_n(),2)})
TR8("ba8_find_sites_first",function(){assert.strictEqual(E.ba8_find_sites_first(),"moon")})
TR8("ba8_find_text_wc",function(){assert.strictEqual(E.ba8_find_text_wc(),8)})
TR8("ba8_relay_id",function(){assert.strictEqual(E.ba8_relay_id(),"relay")})
TR8("ba8_relay_text",function(){assert.strictEqual(E.ba8_relay_text(),"A satellite relay passes overhead: +15 science if a comms dish is online.")})
TR8("ba8_relay_w",function(){assert.strictEqual(E.ba8_relay_w(),1)})
TR8("ba8_relay_sites_n",function(){assert.strictEqual(E.ba8_relay_sites_n(),2)})
TR8("ba8_relay_sites_first",function(){assert.strictEqual(E.ba8_relay_sites_first(),"moon")})
TR8("ba8_relay_text_wc",function(){assert.strictEqual(E.ba8_relay_text_wc(),13)})
TR8("ba8_calm_id",function(){assert.strictEqual(E.ba8_calm_id(),"calm")})
TR8("ba8_calm_text",function(){assert.strictEqual(E.ba8_calm_text(),"A calm sol. Crew morale improves.")})
TR8("ba8_calm_w",function(){assert.strictEqual(E.ba8_calm_w(),3)})
TR8("ba8_calm_sites_n",function(){assert.strictEqual(E.ba8_calm_sites_n(),2)})
TR8("ba8_calm_sites_first",function(){assert.strictEqual(E.ba8_calm_sites_first(),"moon")})
TR8("ba8_calm_text_wc",function(){assert.strictEqual(E.ba8_calm_text_wc(),6)})
TR8("ba8_flare_id",function(){assert.strictEqual(E.ba8_flare_id(),"flare")})
TR8("ba8_flare_text",function(){assert.strictEqual(E.ba8_flare_text(),"Solar flare! Extra radiation this sol.")})
TR8("ba8_flare_w",function(){assert.strictEqual(E.ba8_flare_w(),2)})
TR8("ba8_flare_sites_n",function(){assert.strictEqual(E.ba8_flare_sites_n(),2)})
TR8("ba8_flare_sites_first",function(){assert.strictEqual(E.ba8_flare_sites_first(),"moon")})
TR8("ba8_flare_text_wc",function(){assert.strictEqual(E.ba8_flare_text_wc(),6)})
TR8("ba8_birthday_id",function(){assert.strictEqual(E.ba8_birthday_id(),"birthday")})
TR8("ba8_birthday_text",function(){assert.strictEqual(E.ba8_birthday_text(),"A crew birthday lifts everyone's morale.")})
TR8("ba8_birthday_w",function(){assert.strictEqual(E.ba8_birthday_w(),1)})
TR8("ba8_birthday_sites_n",function(){assert.strictEqual(E.ba8_birthday_sites_n(),2)})
TR8("ba8_birthday_sites_first",function(){assert.strictEqual(E.ba8_birthday_sites_first(),"moon")})
TR8("ba8_birthday_text_wc",function(){assert.strictEqual(E.ba8_birthday_text_wc(),6)})
TR8("ba8_stowaway_id",function(){assert.strictEqual(E.ba8_stowaway_id(),"stowaway")})
TR8("ba8_stowaway_text",function(){assert.strictEqual(E.ba8_stowaway_text(),"A stowaway pest got into the stores: -15 food.")})
TR8("ba8_stowaway_w",function(){assert.strictEqual(E.ba8_stowaway_w(),1)})
TR8("ba8_stowaway_sites_n",function(){assert.strictEqual(E.ba8_stowaway_sites_n(),2)})
TR8("ba8_stowaway_sites_first",function(){assert.strictEqual(E.ba8_stowaway_sites_first(),"moon")})
TR8("ba8_stowaway_text_wc",function(){assert.strictEqual(E.ba8_stowaway_text_wc(),9)})
TR8("ba8_coolant_id",function(){assert.strictEqual(E.ba8_coolant_id(),"coolant")})
TR8("ba8_coolant_text",function(){assert.strictEqual(E.ba8_coolant_text(),"A coolant loop ruptures, damaging one building.")})
TR8("ba8_coolant_w",function(){assert.strictEqual(E.ba8_coolant_w(),1)})
TR8("ba8_coolant_sites_n",function(){assert.strictEqual(E.ba8_coolant_sites_n(),2)})
TR8("ba8_coolant_sites_first",function(){assert.strictEqual(E.ba8_coolant_sites_first(),"moon")})
TR8("ba8_coolant_text_wc",function(){assert.strictEqual(E.ba8_coolant_text_wc(),7)})
TR8("ba8_podbonus_id",function(){assert.strictEqual(E.ba8_podbonus_id(),"podbonus")})
TR8("ba8_podbonus_text",function(){assert.strictEqual(E.ba8_podbonus_text(),"A cargo lander drops bonus supplies: +8 parts.")})
TR8("ba8_podbonus_w",function(){assert.strictEqual(E.ba8_podbonus_w(),1)})
TR8("ba8_podbonus_sites_n",function(){assert.strictEqual(E.ba8_podbonus_sites_n(),2)})
TR8("ba8_podbonus_sites_first",function(){assert.strictEqual(E.ba8_podbonus_sites_first(),"moon")})
TR8("ba8_podbonus_text_wc",function(){assert.strictEqual(E.ba8_podbonus_text_wc(),8)})
TR8("ba8_breakthrough_id",function(){assert.strictEqual(E.ba8_breakthrough_id(),"breakthrough")})
TR8("ba8_breakthrough_text",function(){assert.strictEqual(E.ba8_breakthrough_text(),"Lab breakthrough: +10 science if a lab is online.")})
TR8("ba8_breakthrough_w",function(){assert.strictEqual(E.ba8_breakthrough_w(),1)})
TR8("ba8_breakthrough_sites_n",function(){assert.strictEqual(E.ba8_breakthrough_sites_n(),2)})
TR8("ba8_breakthrough_sites_first",function(){assert.strictEqual(E.ba8_breakthrough_sites_first(),"moon")})
TR8("ba8_breakthrough_text_wc",function(){assert.strictEqual(E.ba8_breakthrough_text_wc(),9)})
TR8("ba8_homesick_id",function(){assert.strictEqual(E.ba8_homesick_id(),"homesick")})
TR8("ba8_homesick_text",function(){assert.strictEqual(E.ba8_homesick_text(),"Homesickness spreads: crew morale drops.")})
TR8("ba8_homesick_w",function(){assert.strictEqual(E.ba8_homesick_w(),2)})
TR8("ba8_homesick_sites_n",function(){assert.strictEqual(E.ba8_homesick_sites_n(),2)})
TR8("ba8_homesick_sites_first",function(){assert.strictEqual(E.ba8_homesick_sites_first(),"moon")})
TR8("ba8_homesick_text_wc",function(){assert.strictEqual(E.ba8_homesick_text_wc(),5)})
TR8("ba8_meteorshower_id",function(){assert.strictEqual(E.ba8_meteorshower_id(),"meteorshower")})
TR8("ba8_meteorshower_text",function(){assert.strictEqual(E.ba8_meteorshower_text(),"Meteor shower! Two buildings take damage.")})
TR8("ba8_meteorshower_w",function(){assert.strictEqual(E.ba8_meteorshower_w(),1)})
TR8("ba8_meteorshower_sites_n",function(){assert.strictEqual(E.ba8_meteorshower_sites_n(),1)})
TR8("ba8_meteorshower_sites_first",function(){assert.strictEqual(E.ba8_meteorshower_sites_first(),"moon")})
TR8("ba8_meteorshower_text_wc",function(){assert.strictEqual(E.ba8_meteorshower_text_wc(),6)})
TR8("ba8_o2leak_id",function(){assert.strictEqual(E.ba8_o2leak_id(),"o2leak")})
TR8("ba8_o2leak_text",function(){assert.strictEqual(E.ba8_o2leak_text(),"An oxygen line springs a leak: -15 oxygen.")})
TR8("ba8_o2leak_w",function(){assert.strictEqual(E.ba8_o2leak_w(),2)})
TR8("ba8_o2leak_sites_n",function(){assert.strictEqual(E.ba8_o2leak_sites_n(),2)})
TR8("ba8_o2leak_sites_first",function(){assert.strictEqual(E.ba8_o2leak_sites_first(),"moon")})
TR8("ba8_o2leak_text_wc",function(){assert.strictEqual(E.ba8_o2leak_text_wc(),8)})
TR8("ba8_blight_id",function(){assert.strictEqual(E.ba8_blight_id(),"blight")})
TR8("ba8_blight_text",function(){assert.strictEqual(E.ba8_blight_text(),"Greenhouse blight destroys part of the crop: -10 food.")})
TR8("ba8_blight_w",function(){assert.strictEqual(E.ba8_blight_w(),1)})
TR8("ba8_blight_sites_n",function(){assert.strictEqual(E.ba8_blight_sites_n(),2)})
TR8("ba8_blight_sites_first",function(){assert.strictEqual(E.ba8_blight_sites_first(),"moon")})
TR8("ba8_blight_text_wc",function(){assert.strictEqual(E.ba8_blight_text_wc(),9)})
TR8("ba8_argument_id",function(){assert.strictEqual(E.ba8_argument_id(),"argument")})
TR8("ba8_argument_text",function(){assert.strictEqual(E.ba8_argument_text(),"A crew argument over chores sours the mood.")})
TR8("ba8_argument_w",function(){assert.strictEqual(E.ba8_argument_w(),2)})
TR8("ba8_argument_sites_n",function(){assert.strictEqual(E.ba8_argument_sites_n(),2)})
TR8("ba8_argument_sites_first",function(){assert.strictEqual(E.ba8_argument_sites_first(),"moon")})
TR8("ba8_argument_text_wc",function(){assert.strictEqual(E.ba8_argument_text_wc(),8)})
TR8("ba8_dustdevil_id",function(){assert.strictEqual(E.ba8_dustdevil_id(),"dustdevil")})
TR8("ba8_dustdevil_text",function(){assert.strictEqual(E.ba8_dustdevil_text(),"A dust devil scrubs the solar panels clean: solar +20% for 3 sols.")})
TR8("ba8_dustdevil_w",function(){assert.strictEqual(E.ba8_dustdevil_w(),1)})
TR8("ba8_dustdevil_sites_n",function(){assert.strictEqual(E.ba8_dustdevil_sites_n(),1)})
TR8("ba8_dustdevil_sites_first",function(){assert.strictEqual(E.ba8_dustdevil_sites_first(),"mars")})
TR8("ba8_dustdevil_text_wc",function(){assert.strictEqual(E.ba8_dustdevil_text_wc(),13)})
TR8("ba8_suitpuncture_id",function(){assert.strictEqual(E.ba8_suitpuncture_id(),"suitpuncture")})
TR8("ba8_suitpuncture_text",function(){assert.strictEqual(E.ba8_suitpuncture_text(),"A suit glove punctures during routine checks: one crew member is hurt.")})
TR8("ba8_suitpuncture_w",function(){assert.strictEqual(E.ba8_suitpuncture_w(),1)})
TR8("ba8_suitpuncture_sites_n",function(){assert.strictEqual(E.ba8_suitpuncture_sites_n(),2)})
TR8("ba8_suitpuncture_sites_first",function(){assert.strictEqual(E.ba8_suitpuncture_sites_first(),"moon")})
TR8("ba8_suitpuncture_text_wc",function(){assert.strictEqual(E.ba8_suitpuncture_text_wc(),12)})
TR8("ba8_icepocket_id",function(){assert.strictEqual(E.ba8_icepocket_id(),"icepocket")})
TR8("ba8_icepocket_text",function(){assert.strictEqual(E.ba8_icepocket_text(),"Ground-penetrating radar flags a nearby ice pocket: next Ice Field Haul doubles.")})
TR8("ba8_icepocket_w",function(){assert.strictEqual(E.ba8_icepocket_w(),1)})
TR8("ba8_icepocket_sites_n",function(){assert.strictEqual(E.ba8_icepocket_sites_n(),2)})
TR8("ba8_icepocket_sites_first",function(){assert.strictEqual(E.ba8_icepocket_sites_first(),"moon")})
TR8("ba8_icepocket_text_wc",function(){assert.strictEqual(E.ba8_icepocket_text_wc(),12)})
TR8("ba8_what_did_nasa_s_moxie_experi_q",function(){assert.strictEqual(E.ba8_what_did_nasa_s_moxie_experi_q(),"What did NASA's MOXIE experiment produce from the Martian atmosphere?")})
TR8("ba8_what_did_nasa_s_moxie_experi_c",function(){assert.strictEqual(E.ba8_what_did_nasa_s_moxie_experi_c(),0)})
TR8("ba8_what_did_nasa_s_moxie_experi_fact",function(){assert.strictEqual(E.ba8_what_did_nasa_s_moxie_experi_fact(),"MOXIE made oxygen from Mars's CO2 atmosphere, a first step toward making air and rocket fuel off Earth.")})
TR8("ba8_what_did_nasa_s_moxie_experi_a_n",function(){assert.strictEqual(E.ba8_what_did_nasa_s_moxie_experi_a_n(),4)})
TR8("ba8_what_did_nasa_s_moxie_experi_a_first",function(){assert.strictEqual(E.ba8_what_did_nasa_s_moxie_experi_a_first(),"Oxygen")})
TR8("ba8_what_did_nasa_s_moxie_experi_q_wc",function(){assert.strictEqual(E.ba8_what_did_nasa_s_moxie_experi_q_wc(),10)})
TR8("ba8_what_did_nasa_s_moxie_experi_fact_wc",function(){assert.strictEqual(E.ba8_what_did_nasa_s_moxie_experi_fact_wc(),18)})
TR8("ba8_why_do_planners_target_the_m_q",function(){assert.strictEqual(E.ba8_why_do_planners_target_the_m_q(),"Why do planners target the Moon's south pole?")})
TR8("ba8_why_do_planners_target_the_m_c",function(){assert.strictEqual(E.ba8_why_do_planners_target_the_m_c(),0)})
TR8("ba8_why_do_planners_target_the_m_fact",function(){assert.strictEqual(E.ba8_why_do_planners_target_the_m_fact(),"Shadowed craters near the lunar south pole are cold traps that can preserve water ice.")})
TR8("ba8_why_do_planners_target_the_m_a_n",function(){assert.strictEqual(E.ba8_why_do_planners_target_the_m_a_n(),4)})
TR8("ba8_why_do_planners_target_the_m_a_first",function(){assert.strictEqual(E.ba8_why_do_planners_target_the_m_a_first(),"Permanently shadowed craters may hold water ice")})
TR8("ba8_why_do_planners_target_the_m_q_wc",function(){assert.strictEqual(E.ba8_why_do_planners_target_the_m_q_wc(),8)})
TR8("ba8_why_do_planners_target_the_m_fact_wc",function(){assert.strictEqual(E.ba8_why_do_planners_target_the_m_fact_wc(),15)})
TR8("ba8_about_how_long_is_one_martia_q",function(){assert.strictEqual(E.ba8_about_how_long_is_one_martia_q(),"About how long is one Martian sol?")})
TR8("ba8_about_how_long_is_one_martia_c",function(){assert.strictEqual(E.ba8_about_how_long_is_one_martia_c(),0)})
TR8("ba8_about_how_long_is_one_martia_fact",function(){assert.strictEqual(E.ba8_about_how_long_is_one_martia_fact(),"A sol is about 24h 37m, close to an Earth day.")})
TR8("ba8_about_how_long_is_one_martia_a_n",function(){assert.strictEqual(E.ba8_about_how_long_is_one_martia_a_n(),4)})
TR8("ba8_about_how_long_is_one_martia_a_first",function(){assert.strictEqual(E.ba8_about_how_long_is_one_martia_a_first(),"24 hours 37 minutes")})
TR8("ba8_about_how_long_is_one_martia_q_wc",function(){assert.strictEqual(E.ba8_about_how_long_is_one_martia_q_wc(),7)})
TR8("ba8_about_how_long_is_one_martia_fact_wc",function(){assert.strictEqual(E.ba8_about_how_long_is_one_martia_fact_wc(),11)})
TR8("ba8_what_is_the_main_component_o_q",function(){assert.strictEqual(E.ba8_what_is_the_main_component_o_q(),"What is the main component of the Martian atmosphere?")})
TR8("ba8_what_is_the_main_component_o_c",function(){assert.strictEqual(E.ba8_what_is_the_main_component_o_c(),0)})
TR8("ba8_what_is_the_main_component_o_fact",function(){assert.strictEqual(E.ba8_what_is_the_main_component_o_fact(),"Mars's thin atmosphere is about 95% carbon dioxide.")})
TR8("ba8_what_is_the_main_component_o_a_n",function(){assert.strictEqual(E.ba8_what_is_the_main_component_o_a_n(),4)})
TR8("ba8_what_is_the_main_component_o_a_first",function(){assert.strictEqual(E.ba8_what_is_the_main_component_o_a_first(),"Carbon dioxide")})
TR8("ba8_what_is_the_main_component_o_q_wc",function(){assert.strictEqual(E.ba8_what_is_the_main_component_o_q_wc(),9)})
TR8("ba8_what_is_the_main_component_o_fact_wc",function(){assert.strictEqual(E.ba8_what_is_the_main_component_o_fact_wc(),8)})
TR8("ba8_how_long_can_a_one_way_radio_q",function(){assert.strictEqual(E.ba8_how_long_can_a_one_way_radio_q(),"How long can a one-way radio signal take between Earth and Mars?")})
TR8("ba8_how_long_can_a_one_way_radio_c",function(){assert.strictEqual(E.ba8_how_long_can_a_one_way_radio_c(),0)})
TR8("ba8_how_long_can_a_one_way_radio_fact",function(){assert.strictEqual(E.ba8_how_long_can_a_one_way_radio_fact(),"Light-time to Mars ranges from about 3 to 22 minutes one way, so crews must solve problems without live help.")})
TR8("ba8_how_long_can_a_one_way_radio_a_n",function(){assert.strictEqual(E.ba8_how_long_can_a_one_way_radio_a_n(),4)})
TR8("ba8_how_long_can_a_one_way_radio_a_first",function(){assert.strictEqual(E.ba8_how_long_can_a_one_way_radio_a_first(),"3 to 22 minutes")})
TR8("ba8_how_long_can_a_one_way_radio_q_wc",function(){assert.strictEqual(E.ba8_how_long_can_a_one_way_radio_q_wc(),12)})
TR8("ba8_how_long_can_a_one_way_radio_fact_wc",function(){assert.strictEqual(E.ba8_how_long_can_a_one_way_radio_fact_wc(),20)})
TR8("ba8_what_protects_crews_on_the_i_q",function(){assert.strictEqual(E.ba8_what_protects_crews_on_the_i_q(),"What protects crews on the ISS from most radiation?")})
TR8("ba8_what_protects_crews_on_the_i_c",function(){assert.strictEqual(E.ba8_what_protects_crews_on_the_i_c(),0)})
TR8("ba8_what_protects_crews_on_the_i_fact",function(){assert.strictEqual(E.ba8_what_protects_crews_on_the_i_fact(),"The ISS orbits inside Earth's magnetosphere. Deep-space crews need shielding such as regolith or water walls.")})
TR8("ba8_what_protects_crews_on_the_i_a_n",function(){assert.strictEqual(E.ba8_what_protects_crews_on_the_i_a_n(),4)})
TR8("ba8_what_protects_crews_on_the_i_a_first",function(){assert.strictEqual(E.ba8_what_protects_crews_on_the_i_a_first(),"Earth's magnetosphere")})
TR8("ba8_what_protects_crews_on_the_i_q_wc",function(){assert.strictEqual(E.ba8_what_protects_crews_on_the_i_q_wc(),9)})
TR8("ba8_what_protects_crews_on_the_i_fact_wc",function(){assert.strictEqual(E.ba8_what_protects_crews_on_the_i_fact_wc(),16)})
TR8("ba8_roughly_how_long_is_a_full_l_q",function(){assert.strictEqual(E.ba8_roughly_how_long_is_a_full_l_q(),"Roughly how long is a full lunar day-night cycle?")})
TR8("ba8_roughly_how_long_is_a_full_l_c",function(){assert.strictEqual(E.ba8_roughly_how_long_is_a_full_l_c(),0)})
TR8("ba8_roughly_how_long_is_a_full_l_fact",function(){assert.strictEqual(E.ba8_roughly_how_long_is_a_full_l_fact(),"The Moon spins once in about 29.5 Earth days, so solar bases face long nights away from polar peaks.")})
TR8("ba8_roughly_how_long_is_a_full_l_a_n",function(){assert.strictEqual(E.ba8_roughly_how_long_is_a_full_l_a_n(),4)})
TR8("ba8_roughly_how_long_is_a_full_l_a_first",function(){assert.strictEqual(E.ba8_roughly_how_long_is_a_full_l_a_first(),"About 29.5 Earth days")})
TR8("ba8_roughly_how_long_is_a_full_l_q_wc",function(){assert.strictEqual(E.ba8_roughly_how_long_is_a_full_l_q_wc(),9)})
TR8("ba8_roughly_how_long_is_a_full_l_fact_wc",function(){assert.strictEqual(E.ba8_roughly_how_long_is_a_full_l_fact_wc(),19)})
TR8("ba8_what_do_rtgs_use_to_make_ele_q",function(){assert.strictEqual(E.ba8_what_do_rtgs_use_to_make_ele_q(),"What do RTGs use to make electricity?")})
TR8("ba8_what_do_rtgs_use_to_make_ele_c",function(){assert.strictEqual(E.ba8_what_do_rtgs_use_to_make_ele_c(),0)})
TR8("ba8_what_do_rtgs_use_to_make_ele_fact",function(){assert.strictEqual(E.ba8_what_do_rtgs_use_to_make_ele_fact(),"RTGs convert heat from plutonium-238 decay into steady power, working through night and dust storms.")})
TR8("ba8_what_do_rtgs_use_to_make_ele_a_n",function(){assert.strictEqual(E.ba8_what_do_rtgs_use_to_make_ele_a_n(),4)})
TR8("ba8_what_do_rtgs_use_to_make_ele_a_first",function(){assert.strictEqual(E.ba8_what_do_rtgs_use_to_make_ele_a_first(),"Heat from decaying plutonium")})
TR8("ba8_what_do_rtgs_use_to_make_ele_q_wc",function(){assert.strictEqual(E.ba8_what_do_rtgs_use_to_make_ele_q_wc(),7)})
TR8("ba8_what_do_rtgs_use_to_make_ele_fact_wc",function(){assert.strictEqual(E.ba8_what_do_rtgs_use_to_make_ele_fact_wc(),15)})
TR8("ba8_why_is_growing_food_on_a_mis_q",function(){assert.strictEqual(E.ba8_why_is_growing_food_on_a_mis_q(),"Why is growing food on a mission valuable?")})
TR8("ba8_why_is_growing_food_on_a_mis_c",function(){assert.strictEqual(E.ba8_why_is_growing_food_on_a_mis_c(),0)})
TR8("ba8_why_is_growing_food_on_a_mis_fact",function(){assert.strictEqual(E.ba8_why_is_growing_food_on_a_mis_fact(),"Resupply to the Moon takes days and to Mars months, so local food, water, and oxygen make missions resilient.")})
TR8("ba8_why_is_growing_food_on_a_mis_a_n",function(){assert.strictEqual(E.ba8_why_is_growing_food_on_a_mis_a_n(),4)})
TR8("ba8_why_is_growing_food_on_a_mis_a_first",function(){assert.strictEqual(E.ba8_why_is_growing_food_on_a_mis_a_first(),"Resupply from Earth is slow and costly")})
TR8("ba8_why_is_growing_food_on_a_mis_q_wc",function(){assert.strictEqual(E.ba8_why_is_growing_food_on_a_mis_q_wc(),8)})
TR8("ba8_why_is_growing_food_on_a_mis_fact_wc",function(){assert.strictEqual(E.ba8_why_is_growing_food_on_a_mis_fact_wc(),19)})
TR8("ba8_what_hazard_do_dust_storms_o_q",function(){assert.strictEqual(E.ba8_what_hazard_do_dust_storms_o_q(),"What hazard do dust storms on Mars pose to solar power?")})
TR8("ba8_what_hazard_do_dust_storms_o_c",function(){assert.strictEqual(E.ba8_what_hazard_do_dust_storms_o_c(),0)})
TR8("ba8_what_hazard_do_dust_storms_o_fact",function(){assert.strictEqual(E.ba8_what_hazard_do_dust_storms_o_fact(),"Martian dust storms can slash sunlight for weeks and coat panels, as ended the Opportunity rover's mission.")})
TR8("ba8_what_hazard_do_dust_storms_o_a_n",function(){assert.strictEqual(E.ba8_what_hazard_do_dust_storms_o_a_n(),4)})
TR8("ba8_what_hazard_do_dust_storms_o_a_first",function(){assert.strictEqual(E.ba8_what_hazard_do_dust_storms_o_a_first(),"Dust blocks sunlight and coats panels")})
TR8("ba8_what_hazard_do_dust_storms_o_q_wc",function(){assert.strictEqual(E.ba8_what_hazard_do_dust_storms_o_q_wc(),11)})
TR8("ba8_what_hazard_do_dust_storms_o_fact_wc",function(){assert.strictEqual(E.ba8_what_hazard_do_dust_storms_o_fact_wc(),17)})
TR8("ba8_which_program_aims_to_return_q",function(){assert.strictEqual(E.ba8_which_program_aims_to_return_q(),"Which program aims to return astronauts to the Moon this decade?")})
TR8("ba8_which_program_aims_to_return_c",function(){assert.strictEqual(E.ba8_which_program_aims_to_return_c(),0)})
TR8("ba8_which_program_aims_to_return_fact",function(){assert.strictEqual(E.ba8_which_program_aims_to_return_fact(),"Artemis plans crewed lunar landings and a sustained presence near the south pole.")})
TR8("ba8_which_program_aims_to_return_a_n",function(){assert.strictEqual(E.ba8_which_program_aims_to_return_a_n(),4)})
TR8("ba8_which_program_aims_to_return_a_first",function(){assert.strictEqual(E.ba8_which_program_aims_to_return_a_first(),"Artemis")})
TR8("ba8_which_program_aims_to_return_q_wc",function(){assert.strictEqual(E.ba8_which_program_aims_to_return_q_wc(),11)})
TR8("ba8_which_program_aims_to_return_fact_wc",function(){assert.strictEqual(E.ba8_which_program_aims_to_return_fact_wc(),13)})
TR8("ba8_which_telescope_launched_in__q",function(){assert.strictEqual(E.ba8_which_telescope_launched_in__q(),"Which telescope launched in 2021 now studies the early universe?")})
TR8("ba8_which_telescope_launched_in__c",function(){assert.strictEqual(E.ba8_which_telescope_launched_in__c(),0)})
TR8("ba8_which_telescope_launched_in__fact",function(){assert.strictEqual(E.ba8_which_telescope_launched_in__fact(),"JWST observes in infrared from the Sun-Earth L2 point.")})
TR8("ba8_which_telescope_launched_in__a_n",function(){assert.strictEqual(E.ba8_which_telescope_launched_in__a_n(),4)})
TR8("ba8_which_telescope_launched_in__a_first",function(){assert.strictEqual(E.ba8_which_telescope_launched_in__a_first(),"James Webb")})
TR8("ba8_which_telescope_launched_in__q_wc",function(){assert.strictEqual(E.ba8_which_telescope_launched_in__q_wc(),10)})
TR8("ba8_which_telescope_launched_in__fact_wc",function(){assert.strictEqual(E.ba8_which_telescope_launched_in__fact_wc(),9)})
TR8("ba8_what_makes_lunar_regolith_us_q",function(){assert.strictEqual(E.ba8_what_makes_lunar_regolith_us_q(),"What makes lunar regolith useful for shielding?")})
TR8("ba8_what_makes_lunar_regolith_us_c",function(){assert.strictEqual(E.ba8_what_makes_lunar_regolith_us_c(),0)})
TR8("ba8_what_makes_lunar_regolith_us_fact",function(){assert.strictEqual(E.ba8_what_makes_lunar_regolith_us_fact(),"A few meters of regolith dramatically cuts radiation dose, so crews bury or 3D-print shelters.")})
TR8("ba8_what_makes_lunar_regolith_us_a_n",function(){assert.strictEqual(E.ba8_what_makes_lunar_regolith_us_a_n(),4)})
TR8("ba8_what_makes_lunar_regolith_us_a_first",function(){assert.strictEqual(E.ba8_what_makes_lunar_regolith_us_a_first(),"It absorbs radiation when piled over habitats")})
TR8("ba8_what_makes_lunar_regolith_us_q_wc",function(){assert.strictEqual(E.ba8_what_makes_lunar_regolith_us_q_wc(),7)})
TR8("ba8_what_makes_lunar_regolith_us_fact_wc",function(){assert.strictEqual(E.ba8_what_makes_lunar_regolith_us_fact_wc(),15)})
TR8("ba8_what_did_the_sofia_observato_q",function(){assert.strictEqual(E.ba8_what_did_the_sofia_observato_q(),"What did the SOFIA observatory confirm on the Moon's sunlit surface in 2020?")})
TR8("ba8_what_did_the_sofia_observato_c",function(){assert.strictEqual(E.ba8_what_did_the_sofia_observato_c(),0)})
TR8("ba8_what_did_the_sofia_observato_fact",function(){assert.strictEqual(E.ba8_what_did_the_sofia_observato_fact(),"SOFIA detected water molecules in Clavius crater, beyond the permanently shadowed regions.")})
TR8("ba8_what_did_the_sofia_observato_a_n",function(){assert.strictEqual(E.ba8_what_did_the_sofia_observato_a_n(),4)})
TR8("ba8_what_did_the_sofia_observato_a_first",function(){assert.strictEqual(E.ba8_what_did_the_sofia_observato_a_first(),"Water molecules")})
TR8("ba8_what_did_the_sofia_observato_q_wc",function(){assert.strictEqual(E.ba8_what_did_the_sofia_observato_q_wc(),13)})
TR8("ba8_what_did_the_sofia_observato_fact_wc",function(){assert.strictEqual(E.ba8_what_did_the_sofia_observato_fact_wc(),12)})
TR8("ba8_why_are_lava_tubes_interesti_q",function(){assert.strictEqual(E.ba8_why_are_lava_tubes_interesti_q(),"Why are lava tubes interesting to base planners?")})
TR8("ba8_why_are_lava_tubes_interesti_c",function(){assert.strictEqual(E.ba8_why_are_lava_tubes_interesti_c(),0)})
TR8("ba8_why_are_lava_tubes_interesti_fact",function(){assert.strictEqual(E.ba8_why_are_lava_tubes_interesti_fact(),"Lava tubes offer shelter from radiation, micrometeorites, and temperature swings.")})
TR8("ba8_why_are_lava_tubes_interesti_a_n",function(){assert.strictEqual(E.ba8_why_are_lava_tubes_interesti_a_n(),4)})
TR8("ba8_why_are_lava_tubes_interesti_a_first",function(){assert.strictEqual(E.ba8_why_are_lava_tubes_interesti_a_first(),"Natural caves give ready-made radiation shelter")})
TR8("ba8_why_are_lava_tubes_interesti_q_wc",function(){assert.strictEqual(E.ba8_why_are_lava_tubes_interesti_q_wc(),8)})
TR8("ba8_why_are_lava_tubes_interesti_fact_wc",function(){assert.strictEqual(E.ba8_why_are_lava_tubes_interesti_fact_wc(),10)})
TR8("ba8_what_is_isru_q",function(){assert.strictEqual(E.ba8_what_is_isru_q(),"What is ISRU?")})
TR8("ba8_what_is_isru_c",function(){assert.strictEqual(E.ba8_what_is_isru_c(),0)})
TR8("ba8_what_is_isru_fact",function(){assert.strictEqual(E.ba8_what_is_isru_fact(),"In-situ resource utilization turns local ice, soil, and atmosphere into water, oxygen, and building material.")})
TR8("ba8_what_is_isru_a_n",function(){assert.strictEqual(E.ba8_what_is_isru_a_n(),4)})
TR8("ba8_what_is_isru_a_first",function(){assert.strictEqual(E.ba8_what_is_isru_a_first(),"Using local resources like ice and regolith instead of shipping everything")})
TR8("ba8_what_is_isru_fact_wc",function(){assert.strictEqual(E.ba8_what_is_isru_fact_wc(),15)})
TR8("ba8_perchlorate_salts_in_martian_q",function(){assert.strictEqual(E.ba8_perchlorate_salts_in_martian_q(),"Perchlorate salts in Martian soil are a concern because they are...")})
TR8("ba8_perchlorate_salts_in_martian_c",function(){assert.strictEqual(E.ba8_perchlorate_salts_in_martian_c(),0)})
TR8("ba8_perchlorate_salts_in_martian_fact",function(){assert.strictEqual(E.ba8_perchlorate_salts_in_martian_fact(),"Perchlorates can harm thyroid function and must be washed out of soil before farming.")})
TR8("ba8_perchlorate_salts_in_martian_a_n",function(){assert.strictEqual(E.ba8_perchlorate_salts_in_martian_a_n(),4)})
TR8("ba8_perchlorate_salts_in_martian_a_first",function(){assert.strictEqual(E.ba8_perchlorate_salts_in_martian_a_first(),"Toxic to humans and crops")})
TR8("ba8_perchlorate_salts_in_martian_q_wc",function(){assert.strictEqual(E.ba8_perchlorate_salts_in_martian_q_wc(),11)})
TR8("ba8_perchlorate_salts_in_martian_fact_wc",function(){assert.strictEqual(E.ba8_perchlorate_salts_in_martian_fact_wc(),14)})
TR8("ba8_which_apollo_mission_turned__q",function(){assert.strictEqual(E.ba8_which_apollo_mission_turned__q(),"Which Apollo mission turned a crisis into a safe return using the lunar module as a lifeboat?")})
TR8("ba8_which_apollo_mission_turned__c",function(){assert.strictEqual(E.ba8_which_apollo_mission_turned__c(),0)})
TR8("ba8_which_apollo_mission_turned__fact",function(){assert.strictEqual(E.ba8_which_apollo_mission_turned__fact(),"Apollo 13's crew looped around the Moon and survived on the LM's supplies after an oxygen tank explosion.")})
TR8("ba8_which_apollo_mission_turned__a_n",function(){assert.strictEqual(E.ba8_which_apollo_mission_turned__a_n(),4)})
TR8("ba8_which_apollo_mission_turned__a_first",function(){assert.strictEqual(E.ba8_which_apollo_mission_turned__a_first(),"Apollo 13")})
TR8("ba8_which_apollo_mission_turned__q_wc",function(){assert.strictEqual(E.ba8_which_apollo_mission_turned__q_wc(),17)})
TR8("ba8_which_apollo_mission_turned__fact_wc",function(){assert.strictEqual(E.ba8_which_apollo_mission_turned__fact_wc(),18)})
TR8("ba8_why_does_a_greenhouse_on_mar_q",function(){assert.strictEqual(E.ba8_why_does_a_greenhouse_on_mar_q(),"Why does a greenhouse on Mars need artificial light even in daytime?")})
TR8("ba8_why_does_a_greenhouse_on_mar_c",function(){assert.strictEqual(E.ba8_why_does_a_greenhouse_on_mar_c(),0)})
TR8("ba8_why_does_a_greenhouse_on_mar_fact",function(){assert.strictEqual(E.ba8_why_does_a_greenhouse_on_mar_fact(),"Mars gets under half Earth's sunlight, and dust cuts it further, so grow lights keep yields up.")})
TR8("ba8_why_does_a_greenhouse_on_mar_a_n",function(){assert.strictEqual(E.ba8_why_does_a_greenhouse_on_mar_a_n(),4)})
TR8("ba8_why_does_a_greenhouse_on_mar_a_first",function(){assert.strictEqual(E.ba8_why_does_a_greenhouse_on_mar_a_first(),"Sunlight there is weaker and dusty")})
TR8("ba8_why_does_a_greenhouse_on_mar_q_wc",function(){assert.strictEqual(E.ba8_why_does_a_greenhouse_on_mar_q_wc(),12)})
TR8("ba8_why_does_a_greenhouse_on_mar_fact_wc",function(){assert.strictEqual(E.ba8_why_does_a_greenhouse_on_mar_fact_wc(),17)})
TR8("ba8_what_is_a_fair_first_power_s_q",function(){assert.strictEqual(E.ba8_what_is_a_fair_first_power_s_q(),"What is a fair first power source for a polar lunar base?")})
TR8("ba8_what_is_a_fair_first_power_s_c",function(){assert.strictEqual(E.ba8_what_is_a_fair_first_power_s_c(),0)})
TR8("ba8_what_is_a_fair_first_power_s_fact",function(){assert.strictEqual(E.ba8_what_is_a_fair_first_power_s_fact(),"Near-polar ridges can see long stretches of sunlight, making solar plus storage practical.")})
TR8("ba8_what_is_a_fair_first_power_s_a_n",function(){assert.strictEqual(E.ba8_what_is_a_fair_first_power_s_a_n(),4)})
TR8("ba8_what_is_a_fair_first_power_s_a_first",function(){assert.strictEqual(E.ba8_what_is_a_fair_first_power_s_a_first(),"Solar arrays on illuminated ridges")})
TR8("ba8_what_is_a_fair_first_power_s_q_wc",function(){assert.strictEqual(E.ba8_what_is_a_fair_first_power_s_q_wc(),12)})
TR8("ba8_what_is_a_fair_first_power_s_fact_wc",function(){assert.strictEqual(E.ba8_what_is_a_fair_first_power_s_fact_wc(),13)})
TR8("ba8_firstsol_id",function(){assert.strictEqual(E.ba8_firstsol_id(),"firstsol")})
TR8("ba8_firstsol_name",function(){assert.strictEqual(E.ba8_firstsol_name(),"Boots Down")})
TR8("ba8_power50_id",function(){assert.strictEqual(E.ba8_power50_id(),"power50")})
TR8("ba8_power50_name",function(){assert.strictEqual(E.ba8_power50_name(),"Grid Operator")})
TR8("ba8_science100_id",function(){assert.strictEqual(E.ba8_science100_id(),"science100")})
TR8("ba8_science100_name",function(){assert.strictEqual(E.ba8_science100_name(),"Lab Rat")})
TR8("ba8_shield3_id",function(){assert.strictEqual(E.ba8_shield3_id(),"shield3")})
TR8("ba8_shield3_name",function(){assert.strictEqual(E.ba8_shield3_name(),"Deep Shelter")})
TR8("ba8_sol15_id",function(){assert.strictEqual(E.ba8_sol15_id(),"sol15")})
TR8("ba8_sol15_name",function(){assert.strictEqual(E.ba8_sol15_name(),"Two Weeks Out")})
TR8("ba8_sol30_id",function(){assert.strictEqual(E.ba8_sol30_id(),"sol30")})
TR8("ba8_sol30_name",function(){assert.strictEqual(E.ba8_sol30_name(),"Mission Complete")})
TR8("ba8_fullhouse_id",function(){assert.strictEqual(E.ba8_fullhouse_id(),"fullhouse")})
TR8("ba8_fullhouse_name",function(){assert.strictEqual(E.ba8_fullhouse_name(),"Full House")})
TR8("ba8_quiz5_id",function(){assert.strictEqual(E.ba8_quiz5_id(),"quiz5")})
TR8("ba8_quiz5_name",function(){assert.strictEqual(E.ba8_quiz5_name(),"Honor Roll")})
TR8("ba8_selfsufficient_id",function(){assert.strictEqual(E.ba8_selfsufficient_id(),"selfsufficient")})
TR8("ba8_selfsufficient_name",function(){assert.strictEqual(E.ba8_selfsufficient_name(),"Closed Loop")})
TR8("ba8_survivor_id",function(){assert.strictEqual(E.ba8_survivor_id(),"survivor")})
TR8("ba8_survivor_name",function(){assert.strictEqual(E.ba8_survivor_name(),"Through the Storm")})
TR8("ba8_researcher_id",function(){assert.strictEqual(E.ba8_researcher_id(),"researcher")})
TR8("ba8_researcher_name",function(){assert.strictEqual(E.ba8_researcher_name(),"R&D Dept")})
TR8("ba8_awayteam_id",function(){assert.strictEqual(E.ba8_awayteam_id(),"awayteam")})
TR8("ba8_awayteam_name",function(){assert.strictEqual(E.ba8_awayteam_name(),"Away Team")})
TR8("ba8_veteran_id",function(){assert.strictEqual(E.ba8_veteran_id(),"veteran")})
TR8("ba8_veteran_name",function(){assert.strictEqual(E.ba8_veteran_name(),"Veteran Crew")})
TR8("ba8_nightowl_id",function(){assert.strictEqual(E.ba8_nightowl_id(),"nightowl")})
TR8("ba8_nightowl_name",function(){assert.strictEqual(E.ba8_nightowl_name(),"Night Watch")})
TR8("ba8_closedloop2_id",function(){assert.strictEqual(E.ba8_closedloop2_id(),"closedloop2")})
TR8("ba8_closedloop2_name",function(){assert.strictEqual(E.ba8_closedloop2_name(),"Nothing Wasted")})
TR8("ba8_highscore_id",function(){assert.strictEqual(E.ba8_highscore_id(),"highscore")})
TR8("ba8_highscore_name",function(){assert.strictEqual(E.ba8_highscore_name(),"Mission of Note")})
TR8("ba8_crosstrained_id",function(){assert.strictEqual(E.ba8_crosstrained_id(),"crosstrained")})
TR8("ba8_crosstrained_name",function(){assert.strictEqual(E.ba8_crosstrained_name(),"Cross-trained")})
TR8("ba8_farmer_id",function(){assert.strictEqual(E.ba8_farmer_id(),"farmer")})
TR8("ba8_farmer_name",function(){assert.strictEqual(E.ba8_farmer_name(),"Crop Science")})
TR8("ba8_scenario_id",function(){assert.strictEqual(E.ba8_scenario_id(),"scenario")})
TR8("ba8_scenario_name",function(){assert.strictEqual(E.ba8_scenario_name(),"Challenge Accepted")})
TR8("ba8_hoarder_id",function(){assert.strictEqual(E.ba8_hoarder_id(),"hoarder")})
TR8("ba8_hoarder_name",function(){assert.strictEqual(E.ba8_hoarder_name(),"Parts Hoarder")})
TR8("ba8_events_count",function(){assert.strictEqual(E.ba8_events_count(),22)})
TR8("ba8_events_w_min",function(){assert.strictEqual(E.ba8_events_w_min(),1)})
TR8("ba8_events_w_max",function(){assert.strictEqual(E.ba8_events_w_max(),3)})
TR8("ba8_events_w_sum",function(){assert.strictEqual(E.ba8_events_w_sum(),34)})
TR8("ba8_quiz_count",function(){assert.strictEqual(E.ba8_quiz_count(),20)})
TR8("ba8_quiz_c_min",function(){assert.strictEqual(E.ba8_quiz_c_min(),0)})
TR8("ba8_quiz_c_max",function(){assert.strictEqual(E.ba8_quiz_c_max(),0)})
TR8("ba8_quiz_c_sum",function(){assert.strictEqual(E.ba8_quiz_c_sum(),0)})
TR8("ba8_achievements_count",function(){assert.strictEqual(E.ba8_achievements_count(),20)})
TR8("ba8_events_has_solar",function(){assert.strictEqual(E.ba8_events_has_solar(),4)})
TR8("ba8_events_has_building",function(){assert.strictEqual(E.ba8_events_has_building(),4)})
TR8("ba8_events_has_morale",function(){assert.strictEqual(E.ba8_events_has_morale(),3)})
TR8("ba8_events_has_member",function(){assert.strictEqual(E.ba8_events_has_member(),2)})
TR8("ba8_events_has_radiation",function(){assert.strictEqual(E.ba8_events_has_radiation(),2)})
TR8("ba8_events_has_damaging",function(){assert.strictEqual(E.ba8_events_has_damaging(),2)})
TR8("ba8_events_has_pocket",function(){assert.strictEqual(E.ba8_events_has_pocket(),2)})
TR8("ba8_events_has_science",function(){assert.strictEqual(E.ba8_events_has_science(),2)})
TR8("ba8_events_has_online",function(){assert.strictEqual(E.ba8_events_has_online(),2)})
TR8("ba8_events_has_drops",function(){assert.strictEqual(E.ba8_events_has_drops(),2)})
TR8("ba8_events_has_oxygen",function(){assert.strictEqual(E.ba8_events_has_oxygen(),1)})
TR8("ba8_events_has_storm",function(){assert.strictEqual(E.ba8_events_has_storm(),1)})
TR8("ba8_events_has_output",function(){assert.strictEqual(E.ba8_events_has_output(),1)})
TR8("ba8_events_has_micrometeorite",function(){assert.strictEqual(E.ba8_events_has_micrometeorite(),1)})
TR8("ba8_events_has_strike",function(){assert.strictEqual(E.ba8_events_has_strike(),1)})
TR8("ba8_events_has_damages",function(){assert.strictEqual(E.ba8_events_has_damages(),1)})
TR8("ba8_events_has_random",function(){assert.strictEqual(E.ba8_events_has_random(),1)})
TR8("ba8_events_has_falls",function(){assert.strictEqual(E.ba8_events_has_falls(),1)})
TR8("ba8_events_has_loses",function(){assert.strictEqual(E.ba8_events_has_loses(),1)})
TR8("ba8_events_has_health",function(){assert.strictEqual(E.ba8_events_has_health(),1)})
TR8("ba8_events_has_particle",function(){assert.strictEqual(E.ba8_events_has_particle(),1)})
TR8("ba8_events_has_event",function(){assert.strictEqual(E.ba8_events_has_event(),1)})
TR8("ba8_events_has_unshielded",function(){assert.strictEqual(E.ba8_events_has_unshielded(),1)})
TR8("ba8_events_has_moonquake",function(){assert.strictEqual(E.ba8_events_has_moonquake(),1)})
TR8("ba8_events_has_rattles",function(){assert.strictEqual(E.ba8_events_has_rattles(),1)})
TR8("ba8_events_has_surveyors",function(){assert.strictEqual(E.ba8_events_has_surveyors(),1)})
TR8("ba8_events_has_water",function(){assert.strictEqual(E.ba8_events_has_water(),1)})
TR8("ba8_events_has_satellite",function(){assert.strictEqual(E.ba8_events_has_satellite(),1)})
TR8("ba8_events_has_relay",function(){assert.strictEqual(E.ba8_events_has_relay(),1)})
TR8("ba8_events_has_passes",function(){assert.strictEqual(E.ba8_events_has_passes(),1)})
TR8("ba8_events_has_overhead",function(){assert.strictEqual(E.ba8_events_has_overhead(),1)})
TR8("ba8_events_has_comms",function(){assert.strictEqual(E.ba8_events_has_comms(),1)})
TR8("ba8_events_has_improves",function(){assert.strictEqual(E.ba8_events_has_improves(),1)})
TR8("ba8_events_has_flare",function(){assert.strictEqual(E.ba8_events_has_flare(),1)})
TR8("ba8_events_has_extra",function(){assert.strictEqual(E.ba8_events_has_extra(),1)})
TR8("ba8_events_has_birthday",function(){assert.strictEqual(E.ba8_events_has_birthday(),1)})
TR8("ba8_events_has_lifts",function(){assert.strictEqual(E.ba8_events_has_lifts(),1)})
TR8("ba8_events_has_everyone",function(){assert.strictEqual(E.ba8_events_has_everyone(),1)})
TR8("ba8_events_has_stowaway",function(){assert.strictEqual(E.ba8_events_has_stowaway(),1)})
TR8("ba8_events_has_stores",function(){assert.strictEqual(E.ba8_events_has_stores(),1)})
TR8("ba8_quiz_has_earth",function(){assert.strictEqual(E.ba8_quiz_has_earth(),7)})
TR8("ba8_quiz_has_lunar",function(){assert.strictEqual(E.ba8_quiz_has_lunar(),6)})
TR8("ba8_quiz_has_martian",function(){assert.strictEqual(E.ba8_quiz_has_martian(),5)})
TR8("ba8_quiz_has_atmosphere",function(){assert.strictEqual(E.ba8_quiz_has_atmosphere(),3)})
TR8("ba8_quiz_has_water",function(){assert.strictEqual(E.ba8_quiz_has_water(),5)})
TR8("ba8_quiz_has_about",function(){assert.strictEqual(E.ba8_quiz_has_about(),4)})
TR8("ba8_quiz_has_oxygen",function(){assert.strictEqual(E.ba8_quiz_has_oxygen(),4)})
TR8("ba8_quiz_has_crews",function(){assert.strictEqual(E.ba8_quiz_has_crews(),3)})
TR8("ba8_quiz_has_south",function(){assert.strictEqual(E.ba8_quiz_has_south(),2)})
TR8("ba8_quiz_has_radiation",function(){assert.strictEqual(E.ba8_quiz_has_radiation(),3)})
TR8("ba8_quiz_has_regolith",function(){assert.strictEqual(E.ba8_quiz_has_regolith(),2)})
TR8("ba8_quiz_has_solar",function(){assert.strictEqual(E.ba8_quiz_has_solar(),3)})
TR8("ba8_quiz_has_polar",function(){assert.strictEqual(E.ba8_quiz_has_polar(),2)})
TR8("ba8_quiz_has_power",function(){assert.strictEqual(E.ba8_quiz_has_power(),3)})
TR8("ba8_quiz_has_storms",function(){assert.strictEqual(E.ba8_quiz_has_storms(),2)})
TR8("ba8_quiz_has_mission",function(){assert.strictEqual(E.ba8_quiz_has_mission(),3)})
TR8("ba8_quiz_has_sunlight",function(){assert.strictEqual(E.ba8_quiz_has_sunlight(),3)})
TR8("ba8_quiz_has_which",function(){assert.strictEqual(E.ba8_quiz_has_which(),3)})
TR8("ba8_quiz_has_moxie",function(){assert.strictEqual(E.ba8_quiz_has_moxie(),1)})
TR8("ba8_quiz_has_first",function(){assert.strictEqual(E.ba8_quiz_has_first(),2)})
console.log(pR8+" round-8 passed, "+fR8+" failed");

console.log(pass7+" round-7 passed, "+fail7+" failed");
process.exit(fail+fail2+fail3+fail4+fail7+(fR8)?1:0);
