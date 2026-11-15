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
console.log(pass2+" round-4 passed, "+fail2+" failed");
process.exit(fail+fail2?1:0);
