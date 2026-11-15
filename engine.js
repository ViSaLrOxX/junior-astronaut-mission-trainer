(function(root,factory){var m=factory();if(typeof module!=="undefined"&&module.exports){module.exports=m}else{root.TrainerEngine=m}})(typeof self!=="undefined"?self:globalThis,function(){
function rand(s){s.rngState|=0;s.rngState=s.rngState+0x6D2B79F5|0;var t=Math.imul(s.rngState^s.rngState>>>15,1|s.rngState);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}
var SITES={
moon:{name:"Lunar South Pole",solName:"Sol",ice:1.0,radiation:1.0,nightLength:4,dayLength:10,stormChance:0.0,quakeChance:0.04,solarFactor:1.0,startParts:70,foodStart:80,waterStart:120,o2Start:120},
mars:{name:"Mars, Jezero Rim",solName:"Sol",ice:0.7,radiation:0.8,nightLength:0,dayLength:1,stormChance:0.18,quakeChance:0.01,solarFactor:0.59,startParts:75,foodStart:90,waterStart:110,o2Start:60}
};
var BUILDINGS={
solar:{name:"Solar Array",cost:12,buildSols:1,power:45,desc:"Generates power in sunlight. Dust storms and long nights cut output."},
rtg:{name:"RTG",cost:30,buildSols:2,power:22,constant:true,desc:"Nuclear battery, steady power day and night like Voyager's."},
o2gen:{name:"O2 Generator",cost:14,buildSols:1,powerUse:10,o2:12,desc:"Splits oxides into breathable oxygen, the job MOXIE proved on Mars."},
watermine:{name:"Ice Extractor",cost:14,buildSols:1,powerUse:8,water:12,desc:"Mines water ice from shadowed regolith."},
greenhouse:{name:"Greenhouse",cost:18,buildSols:2,powerUse:12,waterUse:4,food:9,desc:"Grows crops under LEDs using water and power."},
habitat:{name:"Habitat Module",cost:20,buildSols:2,crewCap:2,desc:"Living space. Each module houses 2 more crew."},
shield:{name:"Shielding Works",cost:10,buildSols:1,regolithUse:15,shield:1,desc:"Buries habitats under regolith to block radiation."},
medbay:{name:"Med Bay",cost:16,buildSols:2,powerUse:6,heal:6,desc:"Treats injuries and radiation exposure."},
lab:{name:"Science Lab",cost:18,buildSols:2,powerUse:8,science:7,desc:"Runs experiments and produces science points."},
comms:{name:"Comms Dish",cost:12,buildSols:1,powerUse:4,uplink:true,desc:"Radios results home. Doubles reported science."},
drill:{name:"Regolith Drill",cost:10,buildSols:1,powerUse:6,regolith:20,desc:"Digs regolith used for shielding."}
};
var PRIORITY=["medbay","o2gen","watermine","greenhouse","lab","comms","drill"];
var CREW_NAMES=["Cmdr. Araya","Dr. Okafor","Lt. Novak","Spec. Ito","Dr. Farah","Lt. Becker"];
var EVENTS=[
{id:"storm",sites:["mars"],text:"Dust storm! Solar output cut by 80% this sol.",w:3},
{id:"micro",sites:["moon","mars"],text:"Micrometeorite strike damages a random building.",w:2},
{id:"illness",sites:["moon","mars"],text:"A crew member falls ill and loses health.",w:2},
{id:"aurora",sites:["moon"],text:"Solar particle event! Unshielded crew take radiation.",w:2},
{id:"quake",sites:["moon"],text:"Moonquake rattles the base, damaging one building.",w:1},
{id:"find",sites:["moon","mars"],text:"Surveyors find a rich ice pocket: +20 water.",w:2},
{id:"relay",sites:["moon","mars"],text:"A satellite relay passes overhead: +15 science if a comms dish is online.",w:1},
{id:"calm",sites:["moon","mars"],text:"A calm sol. Crew morale improves.",w:3}
];
var QUIZ=[
{q:"What did NASA's MOXIE experiment produce from the Martian atmosphere?",a:["Oxygen","Water","Methane","Hydrogen"],c:0,fact:"MOXIE made oxygen from Mars's CO2 atmosphere, a first step toward making air and rocket fuel off Earth."},
{q:"Why do planners target the Moon's south pole?",a:["Permanently shadowed craters may hold water ice","It is the warmest region","It has the strongest gravity","It is closest to Earth"],c:0,fact:"Shadowed craters near the lunar south pole are cold traps that can preserve water ice for drinking, oxygen, and fuel."},
{q:"About how long is one Martian sol?",a:["24 hours 37 minutes","12 hours","48 hours","29.5 days"],c:0,fact:"A sol is about 24h 37m, close to an Earth day, which is why rover teams once lived on Mars time."},
{q:"What is the main component of the Martian atmosphere?",a:["Carbon dioxide","Oxygen","Nitrogen","Methane"],c:0,fact:"Mars's thin atmosphere is about 95% carbon dioxide."},
{q:"How long can a one-way radio signal take between Earth and Mars?",a:["3 to 22 minutes","Instant","2 seconds","3 hours"],c:0,fact:"Light-time to Mars ranges from about 3 to 22 minutes one way, so crews must solve problems without live help."},
{q:"What protects crews on the ISS from most radiation?",a:["Earth's magnetosphere","Thick glass","Lead walls","The solar arrays"],c:0,fact:"The ISS orbits inside Earth's magnetosphere. Deep-space crews need shielding such as regolith or water walls."},
{q:"Roughly how long is a full lunar day-night cycle?",a:["About 29.5 Earth days","24 hours","7 days","365 days"],c:0,fact:"The Moon spins once in about 29.5 Earth days, so solar bases face long nights away from polar peaks."},
{q:"What do RTGs use to make electricity?",a:["Heat from decaying plutonium","Burning methane","Wind turbines","Coal cells"],c:0,fact:"RTGs convert heat from plutonium-238 decay into steady power, working through night and dust storms."},
{q:"Why is growing food on a mission valuable?",a:["Resupply from Earth is slow and costly","Plants glow nicely","Soil is free in space","It removes all CO2"],c:0,fact:"Resupply to the Moon takes days and to Mars months, so local food, water, and oxygen make missions resilient."},
{q:"What hazard do lunar dust storms on Mars pose to solar power?",a:["Dust blocks sunlight and coats panels","Dust freezes panels","Dust conducts electricity","No hazard"],c:0,fact:"Martian dust storms can slash sunlight for weeks and coat panels, as ended the Opportunity rover's mission."}
];
var ACHIEVEMENTS=[
{id:"firstsol",name:"Boots Down",check:function(s){return s.sol>=1}},
{id:"power50",name:"Grid Operator",check:function(s){return s.lastPowerGen>=50}},
{id:"science100",name:"Lab Rat",check:function(s){return s.res.science>=100}},
{id:"shield3",name:"Deep Shelter",check:function(s){return s.shieldLevel>=3}},
{id:"sol15",name:"Two Weeks Out",check:function(s){return s.sol>=15}},
{id:"sol30",name:"Mission Complete",check:function(s){return s.sol>=30&&aliveCount(s)===s.crew.length}},
{id:"fullhouse",name:"Full House",check:function(s){return s.crew.length>=6}},
{id:"quiz5",name:"Honor Roll",check:function(s){return s.quizCorrect>=5}},
{id:"selfsufficient",name:"Closed Loop",check:function(s){return s.selfSufficientStreak>=5}},
{id:"survivor",name:"Through the Storm",check:function(s){return s.stormsSurvived>=2}}
];
function aliveCount(s){return s.crew.filter(function(c){return c.health>0}).length}
function newGame(site,seed,difficulty){
var d=difficulty||"explorer";
var doseMult=d==="cadet"?0.55:(d==="commander"?1.3:1);
var siteDef=SITES[site]||SITES.moon;
var mult=d==="cadet"?1.35:(d==="commander"?0.8:1);
var s={site:site,difficulty:d,sol:0,phase:"day",seed:seed||1,rngState:(seed||1)|0,
res:{o2:Math.round(siteDef.o2Start*mult),water:Math.round(siteDef.waterStart*mult),food:Math.round(siteDef.foodStart*mult),parts:Math.round(siteDef.startParts*mult),regolith:20,science:0},
crew:[],buildings:[],shieldLevel:0,log:[],over:false,won:false,doseMult:doseMult,quizIndex:0,quizCorrect:0,quizDue:5,pendingQuiz:null,
stormsSurvived:0,selfSufficientStreak:0,lastPowerGen:0,lastPowerUse:0,earned:[],objectiveScience:d==="cadet"?120:200,objectiveSols:d==="commander"?40:30,damageQueue:[]};
var n=4;
for(var i=0;i<n;i++){s.crew.push({name:CREW_NAMES[i],health:100,morale:80,role:["Commander","Scientist","Engineer","Medic","Geologist","Pilot"][i]})}
s.buildings.push({type:"habitat",done:true,solsLeft:0,damaged:false});
s.buildings.push({type:"habitat",done:true,solsLeft:0,damaged:false});
s.buildings.push({type:"solar",done:true,solsLeft:0,damaged:false});
addLog(s,"Mission start at "+siteDef.name+". Keep the crew alive, reach "+s.objectiveScience+" science by sol "+s.objectiveSols+".");
return s}
function addLog(s,msg){s.log.unshift({sol:s.sol,msg:msg});if(s.log.length>60){s.log.length=60}}
function crewCapacity(s){var cap=0;for(var i=0;i<s.buildings.length;i++){var b=s.buildings[i];if(b.done&&!b.damaged&&BUILDINGS[b.type].crewCap){cap+=BUILDINGS[b.type].crewCap}}return cap}
function canBuild(s,type){var def=BUILDINGS[type];if(!def){return false}if(s.res.parts<def.cost){return false}return true}
function build(s,type){if(!canBuild(s,type)){return false}var def=BUILDINGS[type];s.res.parts-=def.cost;s.buildings.push({type:type,done:false,solsLeft:def.buildSols,damaged:false});addLog(s,"Construction started: "+def.name+".");return true}
function repair(s,idx){var b=s.buildings[idx];if(!b||!b.damaged){return false}if(s.res.parts<5){return false}s.res.parts-=5;b.damaged=false;addLog(s,"Repaired "+BUILDINGS[b.type].name+".");return true}
function toggleDayPhase(s){}
function computePower(s){
var siteDef=SITES[s.site];
var gen=0;
for(var i=0;i<s.buildings.length;i++){var b=s.buildings[i];if(!b.done||b.damaged){continue}var def=BUILDINGS[b.type];if(!def.power){continue}
if(def.constant){gen+=def.power}else{
var f=siteDef.solarFactor;
if(s.stormActive){f*=0.2}
if(s.site==="moon"){f*=siteDef.dayLength/(siteDef.dayLength+siteDef.nightLength)}
gen+=def.power*f}}
return Math.round(gen)}
function tick(s){
if(s.over){return s}
s.sol+=1;
s.stormActive=false;
var siteDef=SITES[s.site];
var events=[];
if(siteDef.stormChance>0&&rand(s)<siteDef.stormChance){s.stormActive=true;s.stormsSurvived+=1;events.push(EVENTS[0])}
var gen=computePower(s);s.lastPowerGen=gen;
var avail=gen;var use=0;
function powered(def){if(!def.powerUse){return true}if(avail>=def.powerUse){avail-=def.powerUse;use+=def.powerUse;return true}return false}
var bmap={};
for(var i=0;i<s.buildings.length;i++){var b=s.buildings[i];
if(!b.done){b.solsLeft-=1;if(b.solsLeft<=0){b.done=true;addLog(s,BUILDINGS[b.type].name+" is online.")}continue}
if(b.damaged){continue}
bmap[b.type]=(bmap[b.type]||0)+1}
s.lastPowerUse=0;
for(var p=0;p<PRIORITY.length;p++){var t=PRIORITY[p];var def=BUILDINGS[t];var count=bmap[t]||0;
for(var k=0;k<count;k++){
if(!powered(def)){addLog(s,def.name+" starved of power.");continue}
if(def.o2){s.res.o2+=def.o2}
if(def.water){s.res.water+=Math.round(def.water*siteDef.ice)}
if(def.food){if(s.res.water>=def.waterUse){s.res.water-=def.waterUse;s.res.food+=def.food}else{addLog(s,"Greenhouse lacks water.")}}
if(def.heal){for(var c=0;c<s.crew.length;c++){if(s.crew[c].health>0){s.crew[c].health=Math.min(100,s.crew[c].health+def.heal)}}}
if(def.science){s.res.science+=def.science}
if(def.regolith){s.res.regolith+=def.regolith}
if(def.shield){if(s.res.regolith>=def.regolithUse){s.res.regolith-=def.regolithUse;s.shieldLevel+=1;addLog(s,"Shielding level up: "+s.shieldLevel+".")}else{addLog(s,"Shielding works lacks regolith.")}}
}}
var online=bmap;
if(online.comms&&s.res.science>0){var bonus=Math.min(5,Math.floor(s.res.science*0.02));if(bonus>0){s.res.science+=bonus}}
s.lastPowerUse=use;
var alive=s.crew.filter(function(c){return c.health>0});
for(var j=0;j<alive.length;j++){var cr=alive[j];
s.res.o2-=0.84;s.res.water-=3.0;s.res.food-=1.6;
var deficit=0;
if(s.res.o2<0){deficit+=30;s.res.o2=0}
if(s.res.water<0){deficit+=18;s.res.water=0}
if(s.res.food<0){deficit+=10;s.res.food=0}
var dose=Math.max(0,(siteDef.radiation*3*s.doseMult)-(s.shieldLevel*1.2));
cr.health-=dose+deficit;
cr.health=Math.max(0,Math.round(cr.health*10)/10);
if(deficit>0){cr.morale=Math.max(0,cr.morale-12)}else{cr.morale=Math.min(100,cr.morale+2)}
if(cr.health<=0){addLog(s,cr.name+" has died. The mission cannot recover from that.")}
}
if(s.res.o2>0&&s.res.water>0&&s.res.food>0){s.selfSufficientStreak+=1}else{s.selfSufficientStreak=0}
var ev=rollEvent(s,events);
for(var e=0;e<events.length;e++){applyEvent(s,events[e])}
if(s.sol%7===0){var pod=s.difficulty==="cadet"?1.35:1;s.res.parts+=Math.round(12*pod);s.res.food+=Math.round(20*pod);addLog(s,"Resupply pod landed: +"+Math.round(12*pod)+" parts, +"+Math.round(20*pod)+" food.")}
if(s.sol===s.quizDue){s.pendingQuiz=s.quizIndex%QUIZ.length}
checkAchievements(s);
var aliveNow=aliveCount(s);
if(aliveNow===0){s.over=true;s.won=false;addLog(s,"All crew lost. Mission failed.")}
else if(s.sol>=s.objectiveSols){
if(s.res.science>=s.objectiveScience){s.over=true;s.won=true;addLog(s,"Mission complete! Science goal reached with the crew alive.")}
else if(aliveNow>0){s.objectiveSols+=10;addLog(s,"Science shortfall. Extension granted to sol "+s.objectiveSols+".")}
if(s.objectiveSols>60&&!s.over){s.over=true;s.won=s.res.science>=s.objectiveScience;addLog(s,s.won?"Mission complete!":"Mission review failed: not enough science.")}
}
return s}
function rollEvent(s,pre){
var bag=[];
for(var i=0;i<EVENTS.length;i++){var ev=EVENTS[i];
if(ev.sites.indexOf(s.site)<0){continue}
if(ev.id==="storm"){continue}
if(ev.id==="quake"&&rand(s)>SITES[s.site].quakeChance*10){continue}
for(var w=0;w<ev.w;w++){bag.push(ev)}}
if(bag.length===0){return null}
if(rand(s)<0.55){var pick=bag[Math.floor(rand(s)*bag.length)];if(pre.indexOf(pick)<0){pre.push(pick)}}
return null}
function applyEvent(s,ev){
switch(ev.id){
case"storm":addLog(s,ev.text);break;
case"micro":case"quake":
var done=s.buildings.filter(function(b){return b.done&&!b.damaged});
if(done.length){var b=done[Math.floor(rand(s)*done.length)];b.damaged=true;addLog(s,ev.text+" ("+BUILDINGS[b.type].name+" damaged, repair costs 5 parts.)")}else{addLog(s,ev.text)}
break;
case"illness":
var alive=s.crew.filter(function(c){return c.health>0});
if(alive.length){var c=alive[Math.floor(rand(s)*alive.length)];c.health=Math.max(0,c.health-20);addLog(s,ev.text+" ("+c.name+")")}
break;
case"aurora":
var alive2=s.crew.filter(function(c){return c.health>0});
var dmg=Math.max(0,15-s.shieldLevel*5);
for(var i=0;i<alive2.length;i++){alive2[i].health=Math.max(0,alive2[i].health-dmg)}
addLog(s,ev.text+(dmg===0?" Shielding held, no injuries.":" Crew took "+dmg+" exposure damage."));
break;
case"find":s.res.water+=20;addLog(s,ev.text);break;
case"relay":
var hasComms=s.buildings.some(function(b){return b.type==="comms"&&b.done&&!b.damaged});
if(hasComms){s.res.science+=15;addLog(s,ev.text)}else{addLog(s,"A relay passed, but no comms dish is online to use it.")}
break;
case"calm":
s.crew.forEach(function(c){if(c.health>0){c.morale=Math.min(100,c.morale+8)}});
addLog(s,ev.text);break}}
function answerQuiz(s,choice){
if(s.pendingQuiz===null){return null}
var q=QUIZ[s.pendingQuiz];
var ok=choice===q.c;
if(ok){s.quizCorrect+=1;s.res.parts+=6;s.res.science+=5}
s.pendingQuiz=null;s.quizIndex+=1;s.quizDue=s.sol+5;
return{correct:ok,fact:q.fact}}
function checkAchievements(s){
for(var i=0;i<ACHIEVEMENTS.length;i++){var a=ACHIEVEMENTS[i];
if(s.earned.indexOf(a.id)<0&&a.check(s)){s.earned.push(a.id);addLog(s,"Achievement: "+a.name+".")}}}
function recruit(s){
var cost=25;
if(s.res.parts<cost){return false}
if(s.crew.length>=crewCapacity(s)){return false}
var idx=s.crew.length;
s.crew.push({name:CREW_NAMES[idx%CREW_NAMES.length],health:100,morale:70,role:["Commander","Scientist","Engineer","Medic","Geologist","Pilot"][idx%6]});
s.res.parts-=cost;addLog(s,"New crew arrived: "+s.crew[s.crew.length-1].name+".");return true}
function report(s){
var lines=[];
lines.push("MISSION REPORT — "+SITES[s.site].name);
lines.push("Sol "+s.sol+" | Crew alive "+aliveCount(s)+"/"+s.crew.length+" | Science "+Math.floor(s.res.science)+"/"+s.objectiveScience);
lines.push("Stores: O2 "+Math.floor(s.res.o2)+", water "+Math.floor(s.res.water)+", food "+Math.floor(s.res.food)+", parts "+s.res.parts+", regolith "+s.res.regolith);
lines.push("Power: "+s.lastPowerGen+" generated, "+s.lastPowerUse+" used. Shielding level "+s.shieldLevel+".");
lines.push("Buildings: "+s.buildings.map(function(b){return BUILDINGS[b.type].name+(b.done?(b.damaged?" (damaged)":""):" (building)")}).join(", "));
lines.push("Achievements: "+(s.earned.length?s.earned.join(", "):"none"));
lines.push("Status: "+(s.over?(s.won?"SUCCESS":"FAILED"):"IN PROGRESS"));
return lines.join("\n")}
return{SITES:SITES,BUILDINGS:BUILDINGS,QUIZ:QUIZ,ACHIEVEMENTS:ACHIEVEMENTS,newGame:newGame,tick:tick,build:build,repair:repair,recruit:recruit,answerQuiz:answerQuiz,report:report,aliveCount:aliveCount,crewCapacity:crewCapacity,computePower:computePower,canBuild:canBuild}});
