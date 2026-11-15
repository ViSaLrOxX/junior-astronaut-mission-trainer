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
console.log(pass+" passed, "+fail+" failed");
process.exit(fail?1:0);
