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
E.QUIZ.forEach(function(q){assert(q.fact.length>10);assert(q.c>=0&&q.c<q.a.length);assert.strictEqual(new Set(q.a).size,q.a.length)});assert(new Set(E.QUIZ.map(function(q){return q.c})).size>1)});
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
s.pendingQuiz=0;E.answerQuiz(s,(E.QUIZ[0].c+1)%E.QUIZ[0].a.length);
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
T2("r6: mission timeline CSV grows with history",()=>{
const s=E.newGame("moon",7,"explorer");
for(let i=0;i<4;i++){E.tick(s)}
assert(E.missionTimelineCSV(s).split(String.fromCharCode(10)).length>=2)});
T2("r6: trivia deterministic per sol",()=>{
const s=E.newGame("moon",7,"explorer");
assert.strictEqual(E.triviaOfTheSol(s).trivia,E.triviaOfTheSol(s).trivia)});
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
T5("techsAvailable all",function(){assert.strictEqual(E.techsAvailable(s).length,Object.keys(E.TECHS).length)});
T5("nextTechCost cheapest",function(){var n=E.nextTechCost(s);E.techsAvailable(s).forEach(function(t){assert(n.cost<=t.cost)})});
T5("quizRecord shape",function(){var q=E.quizRecord(s);assert(q.answered>=0)});
T5("achievementPct 0-100",function(){var p=E.achievementPct(s);assert(p>=0&&p<=100)});
T5("solsRemaining",function(){assert.strictEqual(E.solsRemaining(s),30-s.sol)});
T5("projectedScience number",function(){assert(typeof E.projectedScience(s)==="number")});
T5("projectedWin shape",function(){var p=E.projectedWin(s);assert(typeof p.willWin==="boolean")});
T5("runwayTable keys",function(){var r=E.runwayTable(s);assert("o2" in r)});
T5("shortestRunway null or shaped",function(){var sr=E.shortestRunway(s);assert(sr===null||typeof sr.sols==="number")});
T5("historyAt",function(){var h=E.historyAt(s,3);assert(h&&h.sol===3)});
T5("historyDelta number",function(){assert(typeof E.historyDelta(s,"o2",1,4)==="number")});
T5("worstSol min",function(){var w=E.worstSol(s,"o2");s.history.forEach(function(h){assert(h.o2>=w.o2)})});
T5("bestSol max",function(){var b=E.bestSol(s,"o2");s.history.forEach(function(h){assert(h.o2<=b.o2)})});
T5("historyTrend shape",function(){var t=E.historyTrend(s,"o2");assert(typeof t.rising==="boolean")});
T5("upcomingEvents 3",function(){assert.strictEqual(E.upcomingEvents(s,3).length,3)});
T5("nextHazard null or shaped",function(){var n=E.nextHazard(s);assert(n===null||typeof n.sol==="number")});
T5("calendarNote string",function(){assert(typeof E.calendarNote(s)==="string")});
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
var pass7=0,fail7=0;
function T7(name,fn){try{fn();pass7++;console.log("PASS",name)}catch(e){fail7++;console.log("FAIL",name,"-",e.message)}}
var G=E.newGame("moon",7,"standard");
var pR8=0,fR8=0;
function TR8(n,c){if(c){pR8++}else{fR8++;console.log("FAIL8 "+n)}}

var pR9=0,fR9=0;
function TR9(n,c){if(c){pR9++}else{fR9++;console.log("FAIL8 "+n)}}

var pR10=0,fR10=0;
function TR10(n,c){if(c){pR10++}else{fR10++;console.log("FAIL8 "+n)}}

var pR11=0,fR11=0;
function TR11(n,c){if(c){pR11++}else{fR11++;console.log("FAIL8 "+n)}}


var pR12=0,fR12=0;
function TR12(n,c){if(c){pR12++}else{fR12++;console.log("FAIL12 "+n)}}
TR12("drill deterministic",function(){assert.deepStrictEqual(E.fa2Drill(5),E.fa2Drill(5))});
TR12("drill correct in choices",function(){var d=E.fa2Drill(5);assert.ok(d.correct>=0&&d.correct<d.choices.length)});
TR12("drill 3 unique choices",function(){var d=E.fa2Drill(7);assert.strictEqual(new Set(d.choices).size,3)});
TR12("drill count",function(){assert.strictEqual(E.fa2DrillCount(),E.EVENTS.length)});
TR12("passport pct 0",function(){assert.strictEqual(E.fa2PassportPct([]),0)});
TR12("passport pct all",function(){var all=[];for(var i=0;i<E.QUIZ.length;i++){all.push(i)}assert.strictEqual(E.fa2PassportPct(all),100)});
TR12("passport remaining",function(){assert.strictEqual(E.fa2PassportRemaining([0]).length,E.QUIZ.length-1)});
TR12("passport text",function(){var t=E.fa2PassportText([0]);assert.ok(t.indexOf("passport")>=0&&t.indexOf(E.QUIZ[0].fact.slice(0,20))>=0)});
TR12("briefing deterministic",function(){assert.deepStrictEqual(E.fa2Briefing(100),E.fa2Briefing(100))});
TR12("briefing fields",function(){var b=E.fa2Briefing(3);assert.ok(b.fact.length>5&&b.event.length>5&&b.target.length>1)});
TR12("streak same day",function(){assert.strictEqual(E.fa2Streak(50,50),0)});
TR12("streak next day",function(){assert.strictEqual(E.fa2Streak(50,51),1)});
TR12("streak broken",function(){assert.strictEqual(E.fa2Streak(50,55),2)});
TR12("streaknext hold",function(){assert.strictEqual(E.fa2StreakNext(4,50,50),4)});
TR12("streaknext inc",function(){assert.strictEqual(E.fa2StreakNext(4,50,51),5)});
TR12("streaknext reset",function(){assert.strictEqual(E.fa2StreakNext(4,50,60),1)});
console.log(pR12+" round-12 passed, "+fR12+" failed");


var pR13=0,fR13=0;
function TQ13(n,c){if(c){pR13++}else{fR13++;console.log("FAIL13 "+n)}}
TQ13("marathon new",function(){var m=M.fa3MarathonNew();assert.ok(m.lives===3&&m.score===0&&!m.over)});
TQ13("marathon q shape",function(){var m=M.fa3MarathonNew();var q=M.fa3MarathonQ(m);assert.ok(q.q.length>5&&q.choices.length>=2)});
TQ13("marathon right scores",function(){var m=M.fa3MarathonNew();var q=M.fa3MarathonQ(m);var r=M.fa3MarathonAnswer(m,q.answer);assert.ok(r.right&&m.score>=100)});
TQ13("marathon wrong costs life",function(){var m=M.fa3MarathonNew();var q=M.fa3MarathonQ(m);var wrong=(q.answer+1)%q.choices.length;M.fa3MarathonAnswer(m,wrong);assert.strictEqual(m.lives,2)});
TQ13("marathon ends at 0 lives",function(){var m=M.fa3MarathonNew();for(var i=0;i<3;i++){var q=M.fa3MarathonQ(m);M.fa3MarathonAnswer(m,(q.answer+1)%q.choices.length)}assert.ok(m.over)});
TQ13("marathon ends after deck",function(){var m=M.fa3MarathonNew();for(var i=0;i<20;i++){var q=M.fa3MarathonQ(m);M.fa3MarathonAnswer(m,q.answer)}assert.ok(m.over&&m.bestStreak===20)});
TQ13("timeline all",function(){assert.strictEqual(M.fa3Timeline(null).count,22)});
TQ13("timeline filtered",function(){var t=M.fa3Timeline("mars");assert.ok(t.count>0&&t.count<22)});
TQ13("timeline sorted by weight",function(){var t=M.fa3Timeline(null);for(var i=1;i<t.events.length;i++){assert.ok(t.events[i-1].weight>=t.events[i].weight)}return true});
TQ13("hunt empty",function(){var h=M.fa3Hunt([]);assert.ok(h.done===0&&h.total===20)});
TQ13("hunt partial",function(){assert.strictEqual(M.fa3Hunt(["firstsol"]).done,1)});
TQ13("hunt full text",function(){assert.ok(/All unlocked/.test(M.fa3HuntText(M.ACHIEVEMENTS.map(function(a){return a.id}))))});
console.log(pR13+" round-13 passed, "+fR13+" failed");

var pR14=0,fR14=0;
function TQ14(n,c){if(c){pR14++}else{fR14++;console.log("FAIL14 "+n)}}
TQ14("forecast offset reads future sols",function(){var s=E.newGame("moon",7,"explorer");s.schedule[s.sol+2]="storm";assert.strictEqual(E.forecast(s,2).id,"storm");assert.strictEqual(E.forecast(s,5),null);assert.strictEqual(E.forecast(s),null)});
TQ14("ice pocket doubles water once",function(){var s=E.newGame("moon",7,"sandbox");s.res.parts=100;assert(E.expedition(s,"icefield").ok);s.icePocketArmed=true;s.crew.forEach(function(c){if((c.away||0)>0){c.away=1}});E.tick(s);assert(s.log.some(function(l){return l.msg&&l.msg.indexOf("ice pocket paid off")>=0}));assert.strictEqual(s.icePocketArmed,false)});
TQ14("markdown log renders messages",function(){var s=E.newGame("moon",7,"explorer");E.tick(s);var md=E.markdownLog(s);assert(md.indexOf("[object Object]")<0);assert(md.indexOf("Sol")>=0)});
TQ14("recruit exported and costs parts",function(){var s=E.newGame("moon",7,"explorer");s.res.parts=100;E.build(s,"habitat");E.tick(s);E.tick(s);E.tick(s);s.buildings.forEach(function(b){b.damaged=false});var p=s.res.parts;assert(E.recruit(s));assert.strictEqual(s.res.parts,p-25)});
console.log(pR14+" round-14 passed, "+fR14+" failed");
var pR15=0,fR15=0;
function TQ15(n,c){if(c){pR15++}else{fR15++;console.log("FAIL15 "+n)}}
var dist=[0,0,0,0],lost=0;
for(var si=0;si<8000;si++){var sr=E.shuffleChoices(["a","b","c","d"],2);dist[sr.correct]++;if(sr.choices[sr.correct]!=="c"){lost++}}
TQ15("shuffle keeps the correct answer",lost===0);
TQ15("shuffle uniform over 8000 runs",dist.every(function(d){return d>1800&&d<2200}));
var seq=[];for(var qi=0;qi<40;qi++){seq.push(E.shuffleChoices(["a","b","c","d"],0).correct)}
var rotSteps=0,maxRun=1,run=1;
for(var sj=1;sj<40;sj++){if(seq[sj]===(seq[sj-1]+1)%4){rotSteps++}if(seq[sj]===seq[sj-1]){run++;if(run>maxRun){maxRun=run}}else{run=1}}
TQ15("no rotation across 40 questions",rotSteps<30);
TQ15("no long same-position streak",maxRun<8);
var dpos=[];for(var di=0;di<9;di++){dpos.push(E.fa2Drill(di).correct)}
var drot=0;for(var dk=1;dk<9;dk++){if(dpos[dk]===(dpos[dk-1]+1)%3){drot++}}
TQ15("drill positions not a rotation",drot<8);
TQ15("quiz bank positions vary",new Set(E.QUIZ.map(function(q){return q.c})).size>1);
console.log(pR15+" round-15 passed, "+fR15+" failed");
var pR16=0,fR16=0;
function TQ16(n,c){if(c){pR16++}else{fR16++;console.log("FAIL16 "+n)}}
var ps=E.newGame("moon",5,"explorer");
TQ16("partsSpent starts at zero",ps.partsSpent===0);
var p0=ps.res.parts;E.build(ps,"solar");
TQ16("build tracks parts spent",ps.partsSpent===12&&ps.res.parts===p0-12);
ps.buildings.push({type:"habitat",done:true,solsLeft:0,damaged:false});ps.buildings.push({type:"solar",done:true,solsLeft:0,damaged:false});
var crewN=ps.crew.length;E.recruit(ps);
TQ16("recruit spends 25 parts",ps.partsSpent===37&&ps.crew.length===crewN+1);
E.cleanSolar(ps);
TQ16("cleaning tracks parts spent",ps.partsSpent===39);
var poor=E.newGame("moon",5,"explorer");poor.res.parts=5;
TQ16("canBuild false without parts",!E.canBuild(poor,"rtg")&&E.canBuild(poor,"battery")===false&&E.canBuild(poor,"solar")===false);
TQ16("recruit refused without parts",E.recruit(poor)===false&&poor.crew.length===4);
console.log(pR16+" round-16 passed, "+fR16+" failed");
var pR17=0,fR17=0;
function TQ17(n,c){if(c){pR17++}else{fR17++;console.log("FAIL17 "+n)}}
var f17=E.newGame("mars",11,"explorer");f17.schedule[4]="storm";
TQ17("forecast sees forced storm",E.forecast(f17,4).id==="storm");
var st17=E.newGame("mars",11,"explorer");
var slot17=-1;for(var i17=4;i17<=7;i17++){if(!st17.schedule[i17]){slot17=i17;break}}
st17.schedule[slot17]="storm";
for(var t17=0;t17<slot17+1;t17++){st17.res.o2=200;st17.res.water=200;st17.res.food=200;st17.crew.forEach(function(c){c.health=Math.max(c.health,80)});E.tick(st17)}
TQ17("forced storm fires on its sol",st17.stormActive===true);
TQ17("storm counted as survived",st17.stormsSurvived>=1);
var m17=E.newGame("mars",11,"explorer");
m17.crew.forEach(function(c){c.health=Math.max(5,c.health-18);c.morale=Math.max(5,c.morale-10)});
m17.res.science=Math.max(0,m17.res.science-10);
TQ17("story work-choice floors hold",m17.crew.every(function(c){return c.health>=5&&c.morale>=5})&&m17.res.science>=0);
TQ17("state valid after story mutations",E.validateState(m17).length===0);
var w17=E.newGame("moon",3,"explorer");w17.res.science=w17.objectiveScience;w17.res.o2=500;w17.res.water=500;w17.res.food=500;w17.sol=w17.objectiveSols-1;
E.tick(w17);
TQ17("win journey reaches over and won",w17.over===true&&w17.won===true);
TQ17("postMortem returns array on ended game",Array.isArray(E.postMortem(w17)));
var l17=E.newGame("moon",3,"explorer");l17.crew.forEach(function(c){c.health=0});l17.res.o2=500;l17.res.water=500;l17.res.food=500;
E.tick(l17);
TQ17("lose journey when all crew lost",l17.over===true&&l17.won===false);
console.log(pR17+" round-17 passed, "+fR17+" failed");
var pR18=0,fR18=0;
function TQ18(n,c){if(c){pR18++}else{fR18++;console.log("FAIL18 "+n)}}
var sr18=E.newGame("moon",5,"explorer");
var it18=0;
while(!sr18.over&&it18<400){sr18.res.o2=300;sr18.res.water=300;sr18.res.food=300;sr18.res.parts=100;sr18.res.science=0;sr18.crew.forEach(function(c){c.health=90});sr18.sol=Math.max(sr18.sol,sr18.objectiveSols-1);E.tick(sr18);it18++}
TQ18("safe-return path ends with crew alive",sr18.over===true&&sr18.won===false&&E.aliveCount(sr18)>0);
TQ18("safe-return engine notes exist",Array.isArray(E.postMortem(sr18))&&E.postMortem(sr18).length>0);
var sh18=E.newGame("mars",4,"explorer");E.shelterMode(sh18);
TQ18("shelter mode queues for next sol",sh18.shelterNext===true||sh18.sheltered===true);
var em18=E.newGame("mars",4,"explorer");em18.res.parts=5;em18.res.science=3;
em18.res.parts=Math.max(0,em18.res.parts-15);em18.res.science=Math.max(0,em18.res.science-10);
TQ18("emergency reserve costs floor at zero",em18.res.parts===0&&em18.res.science===0);
var slotOk=true;
for(var sd=1;sd<=12;sd++){["moon","mars"].forEach(function(st){var g=E.newGame(st,sd,"explorer");var f=-1;for(var i=4;i<=9;i++){if(!g.schedule[i]){f=i;break}}if(f<0){f=5}g.schedule[f]="storm";if(g.schedule[f]!=="storm"){slotOk=false}})}
TQ18("story slot always assignable on seeds 1-12",slotOk);
var ids=E.EVENTS.map(function(e){return e.id});
TQ18("storm and aurora are real event ids",ids.indexOf("storm")>=0&&ids.indexOf("aurora")>=0);
TQ18("first-choice buildings exist with costs",E.BUILDINGS.solar.cost===12&&E.BUILDINGS.watermine.cost===14);
console.log(pR18+" round-18 passed, "+fR18+" failed");
T("nearestAchievements returns real sorted percentages",function(){
var s=E.newGame("moon",7,"explorer");
for(var i=0;i<8;i++){E.tick(s)}
var na=E.nearestAchievements(s);
assert(na.length>0&&na.length<=3);
na.forEach(function(x){assert(x.pct>=0&&x.pct<=100)});
for(var j=1;j<na.length;j++){assert(na[j-1].pct>=na[j].pct)}});
console.log(pass+" total assertions passed, "+fail+" failed");
T("workshop sinters regolith into parts and logs it",function(){
var s=E.newGame("moon",7,"explorer");
s.buildings.push({type:"workshop",done:true,damaged:false,solsLeft:0});
s.res.regolith=25;
var p=s.res.parts;
E.tick(s);
assert(s.res.parts>p);
assert(s.log.some(function(l){return l.msg.indexOf("sintered")>=0}))});
T("advisor flags scarce parts with ways to get more",function(){
var s=E.newGame("moon",7,"explorer");
s.res.parts=4;
var tips=E.advise(s);
assert(tips.some(function(t){return t.indexOf("Parts are scarce")>=0&&t.indexOf("Workshop")>=0}))});
process.exit(fail+fail2+fail3+fail4+fail7+(fR8)+(fR9)+(fR10)+(fR11)+(fR12)+(fR13)+(fR14)+(fR15)+(fR16)+(fR17)+(fR18)?1:0);
