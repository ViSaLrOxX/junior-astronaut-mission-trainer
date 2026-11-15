(function(root,factory){var m=factory();if(typeof module!=="undefined"&&module.exports){module.exports=m}else{root.TrainerEngine=m}})(typeof self!=="undefined"?self:globalThis,function(){
function rand(s){s.rngState|=0;s.rngState=s.rngState+0x6D2B79F5|0;var t=Math.imul(s.rngState^s.rngState>>>15,1|s.rngState);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}
var SITES={
moon:{name:"Lunar South Pole",solName:"Sol",ice:1.0,radiation:1.0,nightLength:4,dayLength:10,stormChance:0.0,quakeChance:0.04,solarFactor:1.0,startParts:70,foodStart:80,waterStart:120,o2Start:120,desc:"Long night cycles, water ice in shadowed craters, steady sunlight on polar ridges."},
mars:{name:"Mars, Jezero Rim",solName:"Sol",ice:0.7,radiation:0.8,nightLength:0,dayLength:1,stormChance:0.18,quakeChance:0.01,solarFactor:0.59,startParts:75,foodStart:90,waterStart:110,o2Start:60,desc:"Weaker sunlight, dust storms, MOXIE-style ISRU territory."}
};
var BUILDINGS={
solar:{name:"Solar Array",cost:12,buildSols:1,power:45,desc:"Generates power in sunlight. Dust storms and long nights cut output."},
rtg:{name:"RTG",cost:30,buildSols:2,power:22,constant:true,desc:"Nuclear battery, steady power day and night like Voyager's."},
battery:{name:"Battery Bank",cost:8,buildSols:1,powerStore:40,desc:"Stores surplus power and discharges it when the grid runs short."},
o2gen:{name:"O2 Generator",cost:14,buildSols:1,powerUse:10,o2:12,desc:"Splits oxides into breathable oxygen, the job MOXIE proved on Mars."},
scrubber:{name:"CO2 Scrubber",cost:12,buildSols:1,powerUse:6,o2boost:0.25,desc:"Boosts every O2 generator's output by 25%."},
watermine:{name:"Ice Extractor",cost:14,buildSols:1,powerUse:8,water:12,desc:"Mines water ice from shadowed regolith."},
recycler:{name:"Water Recycler",cost:14,buildSols:1,powerUse:5,waterRecycle:0.3,desc:"ISS-style loop that cuts crew water use by 30% each, max 60%."},
greenhouse:{name:"Greenhouse",cost:18,buildSols:2,powerUse:12,waterUse:4,food:9,desc:"Grows crops under LEDs. Crop selectable."},
habitat:{name:"Habitat Module",cost:20,buildSols:2,crewCap:2,desc:"Living space. Each module houses 2 more crew."},
shield:{name:"Shielding Works",cost:10,buildSols:1,regolithUse:15,shield:1,desc:"Buries habitats under regolith to block radiation."},
medbay:{name:"Med Bay",cost:16,buildSols:2,powerUse:6,heal:6,desc:"Treats injuries and radiation exposure."},
lab:{name:"Science Lab",cost:18,buildSols:2,powerUse:8,science:7,desc:"Runs experiments and produces data."},
comms:{name:"Comms Dish",cost:12,buildSols:1,powerUse:4,uplink:true,desc:"Radios results home. Adds a bonus on reported data."},
drill:{name:"Regolith Drill",cost:10,buildSols:1,powerUse:6,regolith:20,desc:"Digs regolith used for shielding."},
workshop:{name:"Regolith Workshop",cost:16,buildSols:2,powerUse:6,workshop:true,desc:"Sinters regolith into spare parts: 10 regolith becomes 3 parts per sol."},
algae:{name:"Algae Tank",cost:14,buildSols:1,powerUse:8,waterUse:2,o2small:6,foodSmall:2,desc:"Bioreactor that breathes out oxygen and a little food, like experiments flown on the ISS."},
observatory:{name:"Observatory",cost:20,buildSols:2,powerUse:5,science:4,moraleBoost:3,desc:"A small telescope dome: data by night, wonder for the crew."},
gym:{name:"Exercise Gym",cost:12,buildSols:1,powerUse:4,gymHeal:2,moraleBoost:1,desc:"Treadmills and resistance gear fight bone and muscle loss, lifting health and spirits."},
pad:{name:"Landing Pad",cost:18,buildSols:2,pad:true,desc:"A graded, marked pad: resupply pods land closer and carry 50% more."}
};
var PRIORITY=["medbay","o2gen","scrubber","algae","watermine","recycler","greenhouse","gym","workshop","lab","observatory","comms","drill"];
var CREW_NAMES=["Cmdr. Araya","Dr. Okafor","Lt. Novak","Spec. Ito","Dr. Farah","Lt. Becker"];
var ROLES=["Commander","Scientist","Engineer","Medic","Geologist","Pilot"];
var TECHS={
solarEff:{name:"Multi-junction Cells",cost:30,desc:"Solar arrays produce 50% more power."},
waterLoop:{name:"Closed Water Loop",cost:25,desc:"Crew water consumption drops another 25%."},
radShield:{name:"Hydrogenated Plating",cost:35,desc:"Radiation dose reduced by 40%."},
autoRepair:{name:"Self-healing Panels",cost:40,desc:"Damaged buildings repair themselves after 2 sols."},
advCrops:{name:"Dwarf Cultivars",cost:25,desc:"Greenhouse food output rises 50%."},
aeroponics:{name:"Aeroponics",cost:30,desc:"Mist-grown crops: greenhouse water use halved."},
sintering:{name:"Regolith Sintering",cost:25,desc:"Workshops produce 50% more parts."},
suitShields:{name:"Armored Suits",cost:30,desc:"EVA injury risk halved."},
aiAssist:{name:"AI Research Assistant",cost:20,desc:"All further research costs 20% less."},
redundancy:{name:"Redundant Systems",cost:35,desc:"The first building damage each sol is absorbed by backups."}
};
var CROPS={
potato:{name:"Potatoes",water:4,food:9},
lettuce:{name:"Lettuce",water:2,food:5},
wheat:{name:"Dwarf Wheat",water:6,food:14}
};
var EXPEDITIONS={
crater:{name:"Crater Survey",sols:2,cost:5,fatigue:40,science:25},
icefield:{name:"Ice Field Haul",sols:2,cost:5,fatigue:40,water:40},
debris:{name:"Debris Salvage",sols:2,cost:5,fatigue:40,parts:12},
icecore:{name:"Ice Core Drilling",sols:3,cost:8,fatigue:50,science:30,water:15},
cave:{name:"Lava Tube Survey",sols:3,cost:8,fatigue:50,science:35},
relayfix:{name:"Relay Station Repair",sols:2,cost:6,fatigue:40,relay:true}
};
var SCENARIOS={
dustbowl:{name:"Dust Bowl",site:"mars",desc:"Mars with nearly double the storm frequency."},
leancrew:{name:"Lean Crew",site:null,desc:"Run the whole mission with only 2 crew."},
longnight:{name:"The Long Night",site:"moon",desc:"Lunar night is twice as long; batteries and RTGs matter."}
};
var EVENTS=[
{id:"storm",sites:["mars"],text:"Dust storm! Solar output cut by 80% this sol.",w:3},
{id:"micro",sites:["moon","mars"],text:"Micrometeorite strike damages a random building.",w:2},
{id:"illness",sites:["moon","mars"],text:"A crew member falls ill and loses health.",w:2},
{id:"aurora",sites:["moon"],text:"Solar particle event! Unshielded crew take radiation.",w:2},
{id:"quake",sites:["moon"],text:"Moonquake rattles the base, damaging one building.",w:1},
{id:"find",sites:["moon","mars"],text:"Surveyors find a rich ice pocket: +20 water.",w:2},
{id:"relay",sites:["moon","mars"],text:"A satellite relay passes overhead: +15 data if a comms dish is online.",w:1},
{id:"calm",sites:["moon","mars"],text:"A calm sol. Crew morale improves.",w:3},
{id:"flare",sites:["moon","mars"],text:"Solar flare! Extra radiation this sol.",w:2},
{id:"birthday",sites:["moon","mars"],text:"A crew birthday lifts everyone's morale.",w:1},
{id:"stowaway",sites:["moon","mars"],text:"A stowaway pest got into the stores: -15 food.",w:1},
{id:"coolant",sites:["moon","mars"],text:"A coolant loop ruptures, damaging one building.",w:1},
{id:"podbonus",sites:["moon","mars"],text:"A cargo lander drops bonus supplies: +8 parts.",w:1},
{id:"breakthrough",sites:["moon","mars"],text:"Lab breakthrough: +10 data if a lab is online.",w:1},
{id:"homesick",sites:["moon","mars"],text:"Homesickness spreads: crew morale drops.",w:2},
{id:"meteorshower",sites:["moon"],text:"Meteor shower! Two buildings take damage.",w:1},
{id:"o2leak",sites:["moon","mars"],text:"An oxygen line springs a leak: -15 oxygen.",w:2},
{id:"blight",sites:["moon","mars"],text:"Greenhouse blight destroys part of the crop: -10 food.",w:1},
{id:"argument",sites:["moon","mars"],text:"A crew argument over chores sours the mood.",w:2},
{id:"dustdevil",sites:["mars"],text:"A dust devil scrubs the solar panels clean: solar +20% for 3 sols.",w:1},
{id:"suitpuncture",sites:["moon","mars"],text:"A suit glove punctures during routine checks: one crew member is hurt.",w:1},
{id:"icepocket",sites:["moon","mars"],text:"Ground-penetrating radar flags a nearby ice pocket: next Ice Field Haul doubles.",w:1}
];
var QUIZ=[
{"q":"What did NASA's MOXIE experiment produce from the Martian atmosphere?","a":["Oxygen","Water","Methane","Hydrogen"],"c":0,"fact":"MOXIE made oxygen from Mars's CO2 atmosphere, a first step toward making air and rocket fuel off Earth."},
{"q":"Why do planners target the Moon's south pole?","a":["It is closest to Earth","Permanently shadowed craters may hold water ice","It is the warmest region","It has the strongest gravity"],"c":1,"fact":"Shadowed craters near the lunar south pole are cold traps that can preserve water ice."},
{"q":"About how long is one Martian sol?","a":["48 hours","29.5 days","24 hours 37 minutes","12 hours"],"c":2,"fact":"A sol is about 24h 37m, close to an Earth day."},
{"q":"What is the main component of the Martian atmosphere?","a":["Oxygen","Nitrogen","Methane","Carbon dioxide"],"c":3,"fact":"Mars's thin atmosphere is about 95% carbon dioxide."},
{"q":"How long can a one-way radio signal take between Earth and Mars?","a":["3 to 22 minutes","Instant","2 seconds","3 hours"],"c":0,"fact":"Light-time to Mars ranges from about 3 to 22 minutes one way, so crews must solve problems without live help."},
{"q":"What protects crews on the ISS from most radiation?","a":["The solar arrays","Earth's magnetosphere","Thick glass","Lead walls"],"c":1,"fact":"The ISS orbits inside Earth's magnetosphere. Deep-space crews need shielding such as regolith or water walls."},
{"q":"Roughly how long is a full lunar day-night cycle?","a":["7 days","365 days","About 29.5 Earth days","24 hours"],"c":2,"fact":"The Moon spins once in about 29.5 Earth days, so solar bases face long nights away from polar peaks."},
{"q":"What do RTGs use to make electricity?","a":["Burning methane","Wind turbines","Coal cells","Heat from decaying plutonium"],"c":3,"fact":"RTGs convert heat from plutonium-238 decay into steady power, working through night and dust storms."},
{"q":"Why is growing food on a mission valuable?","a":["Resupply from Earth is slow and costly","Plants glow nicely","Soil is free in space","It removes all CO2"],"c":0,"fact":"Resupply to the Moon takes days and to Mars months, so local food, water, and oxygen make missions resilient."},
{"q":"What hazard do dust storms on Mars pose to solar power?","a":["No hazard","Dust blocks sunlight and coats panels","Dust freezes panels","Dust conducts electricity"],"c":1,"fact":"Martian dust storms can slash sunlight for weeks and coat panels, as ended the Opportunity rover's mission."},
{"q":"Which program aims to return astronauts to the Moon this decade?","a":["Gemini","Mercury","Artemis","Apollo"],"c":2,"fact":"Artemis plans crewed lunar landings and a sustained presence near the south pole."},
{"q":"Which telescope launched in 2021 now studies the early universe?","a":["Hubble","Kepler","Spitzer","James Webb"],"c":3,"fact":"JWST observes in infrared from the Sun-Earth L2 point."},
{"q":"What makes lunar regolith useful for shielding?","a":["It absorbs radiation when piled over habitats","It is magnetic","It glows","It is radioactive"],"c":0,"fact":"A few meters of regolith dramatically cuts radiation dose, so crews bury or 3D-print shelters."},
{"q":"What did the SOFIA observatory confirm on the Moon's sunlit surface in 2020?","a":["Active volcanoes","Water molecules","Oil","Methane lakes"],"c":1,"fact":"SOFIA detected water molecules in Clavius crater, beyond the permanently shadowed regions."},
{"q":"Why are lava tubes interesting to base planners?","a":["They generate heat","They attract rovers","Natural caves give ready-made radiation shelter","They contain gold"],"c":2,"fact":"Lava tubes offer shelter from radiation, micrometeorites, and temperature swings."},
{"q":"What is ISRU?","a":["A rocket fuel","A satellite band","A spacesuit layer","Using local resources like ice and regolith instead of shipping everything"],"c":3,"fact":"In-situ resource utilization turns local ice, soil, and atmosphere into water, oxygen, and building material."},
{"q":"Perchlorate salts in Martian soil are a concern because they are...","a":["Toxic to humans and crops","Delicious","Radioactive","Explosive"],"c":0,"fact":"Perchlorates can harm thyroid function and must be washed out of soil before farming."},
{"q":"Which Apollo mission turned a crisis into a safe return using the lunar module as a lifeboat?","a":["Apollo 17","Apollo 13","Apollo 11","Apollo 8"],"c":1,"fact":"Apollo 13's crew looped around the Moon and survived on the LM's supplies after an oxygen tank explosion."},
{"q":"Why does a greenhouse on Mars need artificial light even in daytime?","a":["Glass freezes","It doesn't","Sunlight there is weaker and dusty","Plants fear Mars"],"c":2,"fact":"Mars gets under half Earth's sunlight, and dust cuts it further, so grow lights keep yields up."},
{"q":"What is a fair first power source for a polar lunar base?","a":["Coal plant","Wind farm","Tidal generator","Solar arrays on illuminated ridges"],"c":3,"fact":"Near-polar ridges can see long stretches of sunlight, making solar plus storage practical."},
];
function shuffleChoices(arr,correctIdx){
var correct=arr[correctIdx];
var out=arr.slice();
for(var i=out.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var t=out[i];out[i]=out[j];out[j]=t}
return{choices:out,correct:out.indexOf(correct)}}
QUIZ.forEach(function(q){var r=shuffleChoices(q.a,q.c);q.a=r.choices;q.c=r.correct});
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
{id:"survivor",name:"Through the Storm",check:function(s){return s.stormsSurvived>=2}},
{id:"researcher",name:"R&D Dept",check:function(s){return Object.keys(s.techs).length>=1}},
{id:"awayteam",name:"Away Team",check:function(s){return s.expeditionsDone>=1}},
{id:"veteran",name:"Veteran Crew",check:function(s){return s.crew.some(function(c){return cLevel(c)>=3})}},
{id:"nightowl",name:"Night Watch",check:function(s){return s.batteryNights>=1}},
{id:"closedloop2",name:"Nothing Wasted",check:function(s){return countB(s,"recycler")>=1&&countB(s,"scrubber")>=1}},
{id:"highscore",name:"Mission of Note",check:function(s){return score(s)>=400}},
{id:"crosstrained",name:"Cross-trained",check:function(s){return s.retrains>=1}},
{id:"farmer",name:"Crop Science",check:function(s){return s.cropSwitches>=1}},
{id:"scenario",name:"Challenge Accepted",check:function(s){return !!s.scenario&&s.won}},
{id:"hoarder",name:"Parts Hoarder",check:function(s){return s.res.parts>=100}}
];
function aliveCount(s){return s.crew.filter(function(c){return c.health>0}).length}
function countB(s,type){return s.buildings.filter(function(b){return b.type===type&&b.done&&!b.damaged}).length}
function cLevel(c){var xp=c.xp||0;return xp>=50?3:(xp>=20?2:1)}
function bestRoleLevel(s,role){var best=0;for(var i=0;i<s.crew.length;i++){var c=s.crew[i];if(c.role===role&&c.health>0&&(c.away||0)<=0&&(c.fatigue||0)<=70){var l=cLevel(c);if(l>best){best=l}}}return best}
function roleBoost(s,role,base){var l=bestRoleLevel(s,role);return l>0?Math.round(base*(1+0.15*(l-1))):0}
function newGame(site,seed,difficulty){
var d=difficulty||"explorer";
var doseMult=d==="cadet"?0.55:(d==="commander"?1.3:1);
var siteDef=SITES[site]||SITES.moon;
var mult=d==="cadet"?1.35:(d==="commander"?0.8:1);
var s={site:site,difficulty:d,sol:0,phase:"day",seed:seed||1,rngState:(seed||1)|0,missionName:"",
res:{o2:Math.round(siteDef.o2Start*mult),water:Math.round(siteDef.waterStart*mult),food:Math.round(siteDef.foodStart*mult),parts:Math.round(siteDef.startParts*mult),regolith:20,science:0},
crew:[],buildings:[],shieldLevel:0,log:[],over:false,won:false,doseMult:doseMult,quizIndex:0,quizCorrect:0,quizDue:5,pendingQuiz:null,partsSpent:0,
stormsSurvived:0,selfSufficientStreak:0,lastPowerGen:0,lastPowerUse:0,earned:[],objectiveScience:d==="cadet"?120:200,objectiveSols:d==="commander"?40:30,
techs:{},rations:1,manifest:"mixed",scenario:null,powerStore:0,batteryNights:0,expeditionsDone:0,retrains:0,cropSwitches:0,totals:{science:0,power:0,water:0},schedule:[],
history:[],milestonesHit:[],quizStreak:0,bestQuizStreak:0,solarBoostSols:0,shelterNext:false,evaShield:false,icePocketArmed:false,relayFixedUntil:0,objectiveMode:"science",podLight:false,redundancySol:-1};
var n=4;
for(var i=0;i<n;i++){s.crew.push({name:CREW_NAMES[i],health:100,morale:80,role:ROLES[i],xp:0,fatigue:0,away:0,expedDest:null})}
s.buildings.push({type:"habitat",done:true,solsLeft:0,damaged:false,crop:null});
s.buildings.push({type:"habitat",done:true,solsLeft:0,damaged:false,crop:null});
s.buildings.push({type:"solar",done:true,solsLeft:0,damaged:false,crop:null});
addLog(s,"Mission start at "+siteDef.name+". Keep the crew alive, reach "+s.objectiveScience+" data by sol "+s.objectiveSols+".");
buildSchedule(s);
return s}
function buildSchedule(s){
var siteDef=SITES[s.site];
var stormBoost=s.scenario==="dustbowl"?1.8:1;
var st={rngState:(s.seed*7919+17)|0};
s.schedule=[];
for(var sol=1;sol<=75;sol++){
var evId=null;
if(siteDef.stormChance>0&&rand(st)<siteDef.stormChance*stormBoost){evId="storm"}
else{
var bag=[];
for(var i=0;i<EVENTS.length;i++){var ev=EVENTS[i];
if(ev.sites.indexOf(s.site)<0){continue}
if(ev.id==="storm"){continue}
if(ev.id==="quake"&&rand(st)>siteDef.quakeChance*10){continue}
for(var w=0;w<ev.w;w++){bag.push(ev.id)}}
if(bag.length&&rand(st)<0.5){evId=bag[Math.floor(rand(st)*bag.length)]}}
s.schedule.push(evId)}}
function forecast(s,offset){var id=s.schedule[s.sol+(offset||0)];if(!id){return null}var ev=null;for(var i=0;i<EVENTS.length;i++){if(EVENTS[i].id===id){ev=EVENTS[i]}}return ev?{id:ev.id,text:ev.text}:null}
function setScenario(s,name){if(!SCENARIOS[name]||s.sol>0){return false}
s.scenario=name;
if(name==="leancrew"){s.crew=s.crew.slice(0,2);addLog(s,"Scenario: Lean Crew. Two people, whole mission.")}
if(name==="longnight"){addLog(s,"Scenario: The Long Night. Lunar nights run twice as long.")}
if(name==="dustbowl"){addLog(s,"Scenario: Dust Bowl. Storms run hot.")}
buildSchedule(s);return true}
function addLog(s,msg){s.log.unshift({sol:s.sol,msg:msg});if(s.log.length>60){s.log.length=60}}
function crewCapacity(s){var cap=0;for(var i=0;i<s.buildings.length;i++){var b=s.buildings[i];if(b.done&&!b.damaged&&BUILDINGS[b.type].crewCap){cap+=BUILDINGS[b.type].crewCap}}return cap}
function canBuild(s,type){var def=BUILDINGS[type];if(!def){return false}if(s.res.parts<def.cost){return false}return true}
function researchCost(s,id){var t=TECHS[id];if(!t){return 0}var c=t.cost;if(s.techs.aiAssist){c=Math.round(c*0.8)}return c}
function build(s,type){if(!canBuild(s,type)){return false}var def=BUILDINGS[type];s.res.parts-=def.cost;s.partsSpent=(s.partsSpent||0)+def.cost;s.buildings.push({type:type,done:false,solsLeft:def.buildSols,damaged:false,crop:type==="greenhouse"?"potato":null,damageSol:null});addLog(s,"Construction started: "+def.name+".");return true}
function repair(s,idx){var b=s.buildings[idx];if(!b||!b.damaged){return false}
var cost=bestRoleLevel(s,"Engineer")>0?3:5;
if(s.res.parts<cost){return false}s.res.parts-=cost;s.partsSpent=(s.partsSpent||0)+cost;b.damaged=false;b.damageSol=null;addLog(s,"Repaired "+BUILDINGS[b.type].name+" for "+cost+" parts.");return true}
function evaRepair(s,idx,crewIdx){
var b=s.buildings[idx];
if(!b||!b.damaged){return{ok:false,msg:"nothing to repair"}}
var c=s.crew[crewIdx];
if(!c||c.health<=0||(c.away||0)>0){return{ok:false,msg:"that crew member cannot go out"}}
if((c.fatigue||0)>70){return{ok:false,msg:c.name+" is too tired for an EVA"}}
if(s.res.parts<2){return{ok:false,msg:"EVA needs 2 parts for patch stock"}}
s.res.parts-=2;
var risk=c.role==="Engineer"?0.15:0.3;
if(s.techs.suitShields){risk*=0.5}
if(s.evaShield){risk=Math.max(0,risk-0.1);s.evaShield=false}
var hurt=false;
if(rand(s)<risk){var dmg=5+Math.floor(rand(s)*11);c.health=Math.max(0,c.health-dmg);hurt=true}
c.fatigue=Math.min(100,(c.fatigue||0)+25);
c.xp=(c.xp||0)+3;
b.damaged=false;b.damageSol=null;
addLog(s,c.name+" repaired "+BUILDINGS[b.type].name+" on an EVA."+(hurt?" Suit snag: -health.":""));
return{ok:true,hurt:hurt}}
function research(s,id){var t=TECHS[id];if(!t||s.techs[id]){return false}
var cost=researchCost(s,id);
if(s.res.science<cost){return false}s.res.science-=cost;s.techs[id]=true;addLog(s,"Research complete: "+t.name+". "+t.desc);return true}
function retrain(s,idx,role){var c=s.crew[idx];if(!c||c.health<=0||ROLES.indexOf(role)<0||c.role===role){return false}
if(s.res.science<10){return false}s.res.science-=10;c.role=role;c.xp=0;s.retrains+=1;addLog(s,c.name+" retrained as "+role+".");return true}
function setRations(s,level){if([0.6,0.8,1].indexOf(level)<0){return false}s.rations=level;addLog(s,"Rations set to "+Math.round(level*100)+"%.");return true}
function setCrop(s,idx,crop){var b=s.buildings[idx];if(!b||b.type!=="greenhouse"||!CROPS[crop]){return false}
if(b.crop!==crop){s.cropSwitches+=1}b.crop=crop;addLog(s,"Greenhouse now grows "+CROPS[crop].name+".");return true}
function setManifest(s,m){if(["mixed","food","parts"].indexOf(m)<0){return false}s.manifest=m;addLog(s,"Resupply manifest set to "+m+".");return true}
function setMissionName(s,n){s.missionName=String(n||"").slice(0,40)}

function expedition(s,dest){var ex=EXPEDITIONS[dest];if(!ex){return{ok:false,msg:"unknown destination"}}
if(s.res.parts<ex.cost){return{ok:false,msg:"expedition needs "+ex.cost+" parts for rover consumables"}}
var able=s.crew.filter(function(c){return c.health>0&&(c.away||0)<=0&&(c.fatigue||0)<=70});
if(able.length<2){return{ok:false,msg:"needs 2 rested crew at base"}}
able.sort(function(a,b){return b.health-a.health});
var team=able.slice(0,2);
s.res.parts-=ex.cost;
team.forEach(function(c){c.away=ex.sols;c.fatigue=Math.min(100,(c.fatigue||0)+ex.fatigue);c.expedDest=dest});
addLog(s,"Expedition launched: "+ex.name+" ("+team.map(function(c){return c.name}).join(", ")+").");
return{ok:true,team:team.map(function(c){return c.name})}}
function resolveExpedition(s,c){
var dest=c.expedDest;
var ex=EXPEDITIONS[dest];c.expedDest=null;
var broke=rand(s)<0.1;
var f=broke?0.5:1;
if(broke){c.health=Math.max(1,c.health-10);addLog(s,c.name+"'s rover broke down on the way back: -10 health, half haul.")}
if(ex.science){var g=Math.round(ex.science*f);s.res.science+=g;s.totals.science+=g}
if(ex.water){var w=Math.round(ex.water*f);if(dest==="icefield"&&s.icePocketArmed){w*=2;s.icePocketArmed=false;addLog(s,"The flagged ice pocket paid off: double water haul.")}s.res.water+=w;s.totals.water+=w}
if(ex.parts){s.res.parts+=Math.round(ex.parts*f)}
if(ex.relay){s.relayFixedUntil=s.sol+10;addLog(s,"Relay station back online: +2 data per sol for 10 sols.")}
c.xp=(c.xp||0)+4;
s.expeditionsDone+=1;
addLog(s,c.name+" returned from "+ex.name+".")}
function computePower(s){
var siteDef=SITES[s.site];
var gen=0;
for(var i=0;i<s.buildings.length;i++){var b=s.buildings[i];if(!b.done||b.damaged){continue}var def=BUILDINGS[b.type];if(!def.power){continue}
if(def.constant){gen+=def.power}else{
var f=siteDef.solarFactor;
if(s.techs.solarEff){f*=1.5}
if(s.solarBoostSols>0){f*=1.2}
if(s.stormActive){f*=0.2}
if(s.site==="moon"){var nl=siteDef.nightLength*(s.scenario==="longnight"?2:1);f*=siteDef.dayLength/(siteDef.dayLength+nl)}
gen+=def.power*f}}
return Math.round(gen)}
function batteryCap(s){var cap=0;s.buildings.forEach(function(b){if(b.type==="battery"&&b.done&&!b.damaged){cap+=BUILDINGS.battery.powerStore}});return cap}
function tick(s){
if(s.over){return s}
s.sol+=1;
s.stormActive=false;
var siteDef=SITES[s.site];
var events=[];
var sched=s.schedule[s.sol-1];
if(sched){if(sched==="storm"){s.stormActive=true;s.stormsSurvived+=1}var evObj=null;for(var i=0;i<EVENTS.length;i++){if(EVENTS[i].id===sched){evObj=EVENTS[i]}}if(evObj){events.push(evObj)}}
var gen=computePower(s);s.lastPowerGen=gen;s.totals.power+=gen;
var avail=gen;var use=0;var cap=batteryCap(s);
avail+=s.powerStore;s.powerStore=0;
function powered(def){if(!def.powerUse){return true}if(avail>=def.powerUse){avail-=def.powerUse;use+=def.powerUse;return true}return false}
var bmap={};
for(var i=0;i<s.buildings.length;i++){var b=s.buildings[i];
if(!b.done){b.solsLeft-=1;if(b.solsLeft<=0){b.done=true;addLog(s,BUILDINGS[b.type].name+" is online.")}continue}
if(b.damaged){if(s.techs.autoRepair&&b.damageSol!==null&&s.sol-b.damageSol>=2){b.damaged=false;b.damageSol=null;addLog(s,BUILDINGS[b.type].name+" self-repaired.")}else{if(b.damaged){continue}}}
bmap[b.type]=(bmap[b.type]||0)+1}
var scrubbers=countB(s,"scrubber");
var o2boost=1+0.25*(scrubbers>0?Math.min(scrubbers,4):0);
s.lastPowerUse=0;
for(var p=0;p<PRIORITY.length;p++){var t=PRIORITY[p];var def=BUILDINGS[t];var count=bmap[t]||0;
for(var k=0;k<count;k++){
if(!powered(def)){addLog(s,def.name+" starved of power.");continue}
if(def.o2){s.res.o2+=Math.round(def.o2*o2boost)}
if(def.water){var wm=Math.round(def.water*siteDef.ice);s.res.water+=wm;s.totals.water+=wm}
if(def.food){var crop=CROPS[s.buildings.filter(function(bb){return bb.type===t&&bb.done&&!bb.damaged})[0]?s.buildings.filter(function(bb){return bb.type===t&&bb.done&&!bb.damaged})[0].crop||"potato":"potato"];
var wu=crop.water;var fo=crop.food;if(s.techs.advCrops){fo=Math.round(fo*1.5)}
if(s.res.water>=wu){s.res.water-=wu;s.res.food+=fo}else{addLog(s,"Greenhouse lacks water.")}}
if(def.heal){var healBoost=roleBoost(s,"Medic",2);for(var c=0;c<s.crew.length;c++){if(s.crew[c].health>0){s.crew[c].health=Math.min(100,s.crew[c].health+def.heal+healBoost)}}}
if(def.science){var sci=def.science+roleBoost(s,"Scientist",2);s.res.science+=sci;s.totals.science+=sci}
if(def.regolith){s.res.regolith+=def.regolith+roleBoost(s,"Geologist",5)}
if(def.shield){if(s.res.regolith>=def.regolithUse){s.res.regolith-=def.regolithUse;s.shieldLevel+=1;addLog(s,"Shielding level up: "+s.shieldLevel+".")}else{addLog(s,"Shielding works lacks regolith.")}}
}}
for(var nb=0;nb<s.buildings.length;nb++){var nbb=s.buildings[nb];
if(!nbb.done||nbb.damaged){continue}
var ndef=BUILDINGS[nbb.type];
if(ndef.workshop&&s.res.regolith>=10){var made=s.techs.sintering?4:3;s.res.regolith-=10;s.res.parts+=made;addLog(s,"Workshop sintered 10 regolith into "+made+" parts.")}
if(ndef.o2small&&s.res.water>=(ndef.waterUse||0)){s.res.water-=(ndef.waterUse||0);s.res.o2+=ndef.o2small;s.res.food+=ndef.foodSmall}
if(ndef.moraleBoost){for(var mc=0;mc<s.crew.length;mc++){if(s.crew[mc].health>0){s.crew[mc].morale=Math.min(100,s.crew[mc].morale+ndef.moraleBoost)}}}
if(ndef.gymHeal){for(var gc=0;gc<s.crew.length;gc++){if(s.crew[gc].health>0){s.crew[gc].health=Math.min(100,s.crew[gc].health+ndef.gymHeal)}}}}
if(s.sol<=s.relayFixedUntil){s.res.science+=2;s.totals.science+=2}
if(s.solarBoostSols>0){s.solarBoostSols-=1}
if(bmap.comms&&s.res.science>0){var bonus=Math.min(5,Math.floor(s.res.science*0.02));if(bonus>0){s.res.science+=bonus}}
if(cap>0){var surplus=Math.max(0,avail);var charge=Math.min(surplus,cap);s.powerStore=charge;if(use>gen){s.batteryNights+=1}}
s.lastPowerUse=use;
var recyc=Math.min(0.6,0.3*countB(s,"recycler"));
if(s.techs.waterLoop){recyc+=0.25}
var waterUsePer=3.0*(1-recyc)*s.rations;
var alive=s.crew.filter(function(c){return c.health>0&&(c.away||0)<=0});
for(var j=0;j<s.crew.length;j++){var cr=s.crew[j];
if(cr.health<=0){continue}
if(cr.away>0){cr.away-=1;if(cr.away<=0){resolveExpedition(s,cr)}
s.res.o2-=0.84;s.res.water-=waterUsePer;s.res.food-=1.6*s.rations;continue}
s.res.o2-=0.84;s.res.water-=waterUsePer;s.res.food-=1.6*s.rations;
var deficit=0;
if(s.res.o2<0){deficit+=30;s.res.o2=0}
if(s.res.water<0){deficit+=18;s.res.water=0}
if(s.res.food<0){deficit+=10;s.res.food=0}
var dose=Math.max(0,(siteDef.radiation*3*s.doseMult)-(s.shieldLevel*1.2));
if(s.techs.radShield){dose*=0.6}
cr.health-=dose+deficit;
cr.health=Math.max(0,Math.round(cr.health*10)/10);
if(s.rations<1){cr.morale=Math.max(0,cr.morale-(s.rations===0.6?6:3));cr.health=Math.max(0,cr.health-(s.rations===0.6?2:0))}
if(deficit>0){cr.morale=Math.max(0,cr.morale-12)}else if(s.rations===1){cr.morale=Math.min(100,cr.morale+2)}
cr.fatigue=Math.max(0,(cr.fatigue||0)-15);
cr.xp=(cr.xp||0)+1;
if((cr.fatigue||0)>85){cr.morale=Math.max(0,cr.morale-4)}
if(cr.health<=0){addLog(s,cr.name+" has died. The mission cannot recover from that.")}
}
if(s.res.o2>0&&s.res.water>0&&s.res.food>0){s.selfSufficientStreak+=1}else{s.selfSufficientStreak=0}
for(var e=0;e<events.length;e++){applyEvent(s,events[e])}
if(s.sol%7===0){var pod=s.difficulty==="cadet"?1.35:1;
if(countB(s,"pad")>0){pod*=1.5;addLog(s,"Landing pad guided the pod in: manifest boosted.")}
if(s.podLight){pod*=0.5;s.podLight=false;addLog(s,"The off-target pod arrived light.")}
if(s.manifest==="food"){s.res.parts+=Math.round(6*pod);s.res.food+=Math.round(40*pod);addLog(s,"Resupply pod (food manifest): +"+Math.round(6*pod)+" parts, +"+Math.round(40*pod)+" food.")}
else if(s.manifest==="parts"){s.res.parts+=Math.round(24*pod);s.res.food+=Math.round(10*pod);addLog(s,"Resupply pod (parts manifest): +"+Math.round(24*pod)+" parts, +"+Math.round(10*pod)+" food.")}
else{s.res.parts+=Math.round(12*pod);s.res.food+=Math.round(20*pod);addLog(s,"Resupply pod landed: +"+Math.round(12*pod)+" parts, +"+Math.round(20*pod)+" food.")}}
if(s.sol===s.quizDue){s.pendingQuiz=s.quizIndex%QUIZ.length}
[50,100,200].forEach(function(mk){
if(s.totals.science>=mk&&s.milestonesHit.indexOf(mk)<0){s.milestonesHit.push(mk);s.res.parts+=10;addLog(s,"Data milestone "+mk+": backers send +10 parts.")}});
s.history.push({sol:s.sol,o2:Math.round(s.res.o2),water:Math.round(s.res.water),food:Math.round(s.res.food),parts:s.res.parts,science:Math.round(s.res.science)});
if(s.history.length>75){s.history.shift()}
s.sheltered=!!s.shelterNext;s.shelterNext=false;
checkAchievements(s);
var aliveNow=aliveCount(s);
if(s.difficulty==="sandbox"){return s}
if(aliveNow===0){s.over=true;s.won=false;addLog(s,"All crew lost. Mission failed.")}
else if(s.sol>=s.objectiveSols){
if(s.objectiveMode==="survival"){s.over=true;s.won=aliveNow===s.crew.length;addLog(s,s.won?"Mission complete: everyone came home.":"Mission ends with losses.")}
else if(s.objectiveMode==="morale"){
var am=avgMorale(s);
if(am>=60){s.over=true;s.won=true;addLog(s,"Mission complete: crew morale held at "+Math.round(am)+".")}
else{s.objectiveSols+=10;addLog(s,"Morale too low for review ("+Math.round(am)+"). Extension to sol "+s.objectiveSols+".")}}
else if(s.res.science>=s.objectiveScience){s.over=true;s.won=true;addLog(s,"Mission complete! Data goal reached with the crew alive.")}
else if(aliveNow>0){s.objectiveSols+=10;addLog(s,"Data shortfall. Extension granted to sol "+s.objectiveSols+".")}
if(s.objectiveSols>60&&!s.over){s.over=true;s.won=s.objectiveMode==="science"?s.res.science>=s.objectiveScience:aliveNow>0;addLog(s,s.won?"Mission complete!":"Mission review failed.")}
}
return s}
function applyEvent(s,ev){
switch(ev.id){
case"storm":addLog(s,ev.text);break;
case"micro":case"quake":case"coolant":
addLog(s,ev.text);damageOne(s,null,1);break;
case"meteorshower":
addLog(s,ev.text);damageOne(s,null,2);break;
case"o2leak":s.res.o2=Math.max(0,s.res.o2-15);addLog(s,ev.text);break;
case"blight":
var hasGh=s.buildings.some(function(b){return b.type==="greenhouse"&&b.done&&!b.damaged});
if(hasGh){s.res.food=Math.max(0,s.res.food-10);addLog(s,ev.text)}else{addLog(s,"Blight spores blew past, but there is no greenhouse to infect.")}break;
case"argument":
var argAlive=s.crew.filter(function(c){return c.health>0});
for(var ag=0;ag<Math.min(2,argAlive.length);ag++){argAlive[ag].morale=Math.max(0,argAlive[ag].morale-8)}
addLog(s,ev.text);break;
case"dustdevil":s.solarBoostSols=3;addLog(s,ev.text);break;
case"suitpuncture":
var spAlive=s.crew.filter(function(c){return c.health>0});
if(spAlive.length){var spc=spAlive[Math.floor(rand(s)*spAlive.length)];spc.health=Math.max(0,spc.health-5);addLog(s,ev.text+" ("+spc.name+" -5 health.)")}break;
case"icepocket":s.icePocketArmed=true;addLog(s,ev.text);break;
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
case"flare":
var alive3=s.crew.filter(function(c){return c.health>0});
var fd=Math.max(0,8-s.shieldLevel*3);
for(var f2=0;f2<alive3.length;f2++){alive3[f2].health=Math.max(0,alive3[f2].health-fd)}
addLog(s,ev.text+(fd===0?" Shielding absorbed it.":" Crew took "+fd+" exposure."));break;
case"find":s.res.water+=20;addLog(s,ev.text);break;
case"relay":
var hasComms=s.buildings.some(function(b){return b.type==="comms"&&b.done&&!b.damaged});
if(hasComms){s.res.science+=15;s.totals.science+=15;addLog(s,ev.text)}else{addLog(s,"A relay passed, but no comms dish is online to use it.")}
break;
case"calm":s.crew.forEach(function(c){if(c.health>0){c.morale=Math.min(100,c.morale+8)}});addLog(s,ev.text);break;
case"birthday":s.crew.forEach(function(c){if(c.health>0){c.morale=Math.min(100,c.morale+12)}});addLog(s,ev.text);break;
case"stowaway":s.res.food=Math.max(0,s.res.food-15);addLog(s,ev.text);break;
case"podbonus":s.res.parts+=8;addLog(s,ev.text);break;
case"breakthrough":var hasLab=s.buildings.some(function(b){return b.type==="lab"&&b.done&&!b.damaged});if(hasLab){s.res.science+=10;s.totals.science+=10;addLog(s,ev.text)}else{addLog(s,"A breakthrough idea came, but no lab is online to run it.")}break;
case"homesick":s.crew.forEach(function(c){if(c.health>0){c.morale=Math.max(0,c.morale-10)}});addLog(s,ev.text);break}}
function answerQuiz(s,choice){
if(s.pendingQuiz===null){return null}
var q=QUIZ[s.pendingQuiz];
var ok=choice===q.c;
if(ok){s.quizCorrect+=1;s.quizStreak=(s.quizStreak||0)+1;s.res.parts+=6;s.res.science+=5;s.totals.science+=5;
if(s.quizStreak>s.bestQuizStreak){s.bestQuizStreak=s.quizStreak}
if(s.quizStreak>0&&s.quizStreak%3===0){s.res.science+=10;s.totals.science+=10;addLog(s,"Quiz streak "+s.quizStreak+": bonus +10 data.")}}
else{s.quizStreak=0}
s.pendingQuiz=null;s.quizIndex+=1;s.quizDue=s.sol+5;
return{correct:ok,fact:q.fact}}
function damageOne(s,ev,count){
var done=s.buildings.filter(function(b){return b.done&&!b.damaged});
for(var m=0;m<(count||1)&&done.length;m++){
var b=done[Math.floor(rand(s)*done.length)];
if(s.techs.redundancy&&s.redundancySol!==s.sol){s.redundancySol=s.sol;addLog(s,"Redundant systems absorbed damage to "+BUILDINGS[b.type].name+".");done=done.filter(function(x){return x!==b});continue}
if(s.sheltered){addLog(s,"Shelter mode protected "+BUILDINGS[b.type].name+".");done=done.filter(function(x){return x!==b});continue}
b.damaged=true;b.damageSol=s.sol;
addLog(s,(ev?ev.text+" ":"")+"("+BUILDINGS[b.type].name+" damaged.)");
done=done.filter(function(x){return x!==b})}}
function checkAchievements(s){
for(var i=0;i<ACHIEVEMENTS.length;i++){var a=ACHIEVEMENTS[i];
if(s.earned.indexOf(a.id)<0&&a.check(s)){s.earned.push(a.id);addLog(s,"Achievement: "+a.name+".")}}}
function recruit(s){
var cost=25;
if(s.res.parts<cost){return false}
if(s.crew.length>=crewCapacity(s)){return false}
var idx=s.crew.length;
s.crew.push({name:CREW_NAMES[idx%CREW_NAMES.length],health:100,morale:70,role:ROLES[idx%6],xp:0,fatigue:0,away:0,expedDest:null});
s.res.parts-=cost;s.partsSpent=(s.partsSpent||0)+cost;addLog(s,"New crew arrived: "+s.crew[s.crew.length-1].name+".");return true}
function avgMorale(s){var a=s.crew.filter(function(c){return c.health>0});if(!a.length){return 0}return a.reduce(function(x,c){return x+c.morale},0)/a.length}
function rest(s,idx){var c=s.crew[idx];if(!c||c.health<=0||(c.away||0)>0){return false}
c.fatigue=Math.max(0,(c.fatigue||0)-40);c.morale=Math.min(100,c.morale+5);addLog(s,c.name+" took a rest sol.");return true}
function cleanSolar(s){if(s.res.parts<2){return false}
if(!s.buildings.some(function(b){return b.type==="solar"&&b.done&&!b.damaged})){return false}
s.res.parts-=2;s.partsSpent=(s.partsSpent||0)+2;s.solarBoostSols=3;addLog(s,"Panels cleaned: solar output +20% for 3 sols.");return true}
function repairAll(s){
var cost=bestRoleLevel(s,"Engineer")>0?3:5;
var fixed=0;
for(var i=0;i<s.buildings.length;i++){var b=s.buildings[i];
if(b.damaged&&s.res.parts>=cost){s.res.parts-=cost;s.partsSpent=(s.partsSpent||0)+cost;b.damaged=false;b.damageSol=null;fixed++}}
if(fixed){addLog(s,"Repaired "+fixed+" building(s) from stores.")}
return fixed}
function shelterMode(s){s.shelterNext=true;addLog(s,"Shelter mode ordered for next sol: non-essential systems down, buildings protected.");return true}
function suitMaintenance(s){if(s.res.parts<3){return false}
s.res.parts-=3;s.partsSpent=(s.partsSpent||0)+3;s.evaShield=true;addLog(s,"EVA suits serviced: next EVA is safer.");return true}
function setObjectiveMode(s,mode){if(["science","survival","morale"].indexOf(mode)<0||s.sol>0){return false}
s.objectiveMode=mode;addLog(s,"Objective mode: "+mode+".");return true}
function resourceHistory(s){return s.history}
function historyCSV(s){
var lines=["sol,o2,water,food,parts,data"];
s.history.forEach(function(h){lines.push([h.sol,h.o2,h.water,h.food,h.parts,h.science].join(","))});
return lines.join(String.fromCharCode(10))}
function crewCSV(s){
var lines=["name,role,level,health,morale,fatigue,xp"];
s.crew.forEach(function(c){lines.push([JSON.stringify(c.name),c.role,cLevel(c),c.health,c.morale,c.fatigue||0,c.xp||0].join(","))});
return lines.join(String.fromCharCode(10))}
function eventPreview(s){
return EVENTS.filter(function(e){return e.sites.indexOf(s.site)>=0}).map(function(e){return{id:e.id,text:e.text,weight:e.w}})}
function dryRunBuild(s,type){
var def=BUILDINGS[type];
if(!def){return null}
var before=computePower(s);
var sim={site:s.site,buildings:s.buildings.concat([{type:type,done:true,damaged:false}]),techs:s.techs,stormActive:s.stormActive,scenario:s.scenario};
var after=computePower(sim);
return{type:type,name:def.name,cost:def.cost,buildSols:def.buildSols,powerDelta:after-before,powerUse:def.powerUse||0,note:def.desc}}
function alerts(s){
var out=[];
var alive=aliveCount(s)||1;
var dO2=s.res.o2/(0.84*alive),dW=s.res.water/(3.0*alive),dF=s.res.food/(1.6*alive);
if(dO2<3){out.push({level:"critical",text:"Oxygen: "+Math.floor(dO2)+" sols left"})}
if(dW<3){out.push({level:"critical",text:"Water: "+Math.floor(dW)+" sols left"})}
if(dF<3){out.push({level:"critical",text:"Food: "+Math.floor(dF)+" sols left"})}
if(s.lastPowerUse>=s.lastPowerGen&&s.lastPowerGen>0){out.push({level:"warn",text:"Grid saturated"})}
var dam=s.buildings.filter(function(b){return b.damaged}).length;
if(dam){out.push({level:"warn",text:dam+" damaged building(s)"})}
var fc=forecast(s);
if(fc&&(fc.id==="storm"||fc.id==="flare"||fc.id==="aurora"||fc.id==="meteorshower")){out.push({level:"info",text:"Tomorrow: "+fc.text})}
return out}
function letterGrade(s){
var sc=score(s);
return sc>=600?"S":(sc>=450?"A":(sc>=350?"B":(sc>=250?"C":"D")))}
function postMortem(s){
var tips=[];
if(!s.over){return tips}
var alive=aliveCount(s);
if(alive<s.crew.length){
if(s.res.o2<=0){tips.push("Oxygen hit zero: O2 generators and scrubbers were too few or unpowered.")}
if(s.res.water<=0){tips.push("Water hit zero: ice extraction and recycling lagged demand.")}
if(s.res.food<=0){tips.push("Food hit zero: greenhouses or food manifests were missing.")}
if(s.shieldLevel<2){tips.push("Low shielding: radiation wore the crew down over time.")}
if(!tips.length){tips.push("Crew losses came from events and fatigue more than stores.")}}
if(s.objectiveMode==="science"&&s.res.science<s.objectiveScience){tips.push("Science shortfall: labs came late; a comms dish multiplies returns.")}
if(!tips.length){tips.push("Solid mission. Try a scenario or Commander difficulty for a harder run.")}
return tips}
function dailyChecklist(s){
var out=[];
var dam=s.buildings.filter(function(b){return b.damaged}).length;
if(dam){out.push("Repair "+dam+" damaged building(s)")}
var al=alerts(s).filter(function(a){return a.level==="critical"});
al.forEach(function(a){out.push("Fix: "+a.text)});
var fc=forecast(s);
if(fc&&(fc.id==="storm"||fc.id==="flare")){out.push("Consider shelter mode ahead of tomorrow's event")}
if(s.crew.some(function(c){return c.health>0&&(c.fatigue||0)>70})){out.push("Rest exhausted crew before EVAs")}
if(!out.length){out.push("Stable: collect data, research tech, or run an expedition")}
return out}





function shareText(s){
return"Mission "+(s.missionName||"unnamed")+" at "+SITES[s.site].name+": sol "+s.sol+", "+aliveCount(s)+"/"+s.crew.length+" crew, science "+Math.round(s.res.science)+", score "+score(s)+" ("+letterGrade(s)+"). "+(s.over?(s.won?"SUCCESS":"FAILED"):"in progress")}
function achievementProgress(s){
var tracked=[{id:"quiz5",have:s.quizCorrect,need:5},{id:"sol15",have:s.sol,need:15},{id:"sol30",have:s.sol,need:30},{id:"science100",have:Math.round(s.res.science),need:100},{id:"shield3",have:s.shieldLevel,need:3},{id:"selfsufficient",have:s.selfSufficientStreak,need:5}];
return tracked.map(function(x){var a=ACHIEVEMENTS.filter(function(q){return q.id===x.id})[0];return{id:x.id,name:a.name,have:Math.min(x.have,x.need),need:x.need,done:s.earned.indexOf(x.id)>=0}})}
function batteryStatus(s){
var cap=batteryCap(s);
return{stored:s.powerStore,capacity:cap,pct:cap?Math.round(s.powerStore/cap*100):0,note:cap===0?"No battery banks: every unpowered night or storm is exposed.":""}}
function moraleReport(s){
var alive=s.crew.filter(function(c){return c.health>0});
var lowest=alive.slice().sort(function(a,b){return a.morale-b.morale})[0];
return{avg:Math.round(avgMorale(s)),lowest:lowest?{name:lowest.name,morale:lowest.morale}:null}}
function powerForecast(s){
var fc=forecast(s);
var sim={site:s.site,buildings:s.buildings,techs:s.techs,stormActive:fc&&fc.id==="storm",scenario:s.scenario,solarBoostSols:s.solarBoostSols};
return{tomorrow:computePower(sim),today:s.lastPowerGen,event:fc?fc.text:null}}
function foodCalendar(s){
var alive=aliveCount(s)||1;
return[1,0.8,0.6].map(function(r){return{rations:r,days:Math.floor(s.res.food/(1.6*r*alive))}})}
function buildQueueEta(s){
return s.buildings.filter(function(b){return !b.done}).map(function(b){return{name:BUILDINGS[b.type].name,solsLeft:b.solsLeft}})}
function healthReport(s){
return s.crew.map(function(c){return{name:c.name,health:c.health,status:c.health<=0?"lost":(c.health<40?"critical":(c.health<70?"hurt":"fit"))}})}
function tutorialHints(s){
if(s.sol>3){return []}
var out=["Sol 1 goal: check stores and power, then build toward water and oxygen."];
if(s.sol>=1){out.push("Watch the forecast line: tomorrow's event is shown one sol ahead.")}
if(s.sol>=2){out.push("Quiz sols come every 5 sols: right answers earn parts and data.")}
return out}
function weeklySummary(s){
var h=s.history;
if(h.length<7){return null}
var a=h[h.length-7],b=h[h.length-1];
return{scienceDelta:b.science-a.science,foodDelta:b.food-a.food,waterDelta:b.water-a.water,partsDelta:b.parts-a.parts}}
function powerBreakdown(s){
var out={generation:s.lastPowerGen,consumers:[],stored:s.powerStore};
PRIORITY.forEach(function(t){var def=BUILDINGS[t];var n=countB(s,t);if(n>0&&def.powerUse){out.consumers.push({name:def.name,count:n,watts:def.powerUse*n})}});
return out}
function statsSummary(s){
return{sols:s.sol,scienceEarned:Math.round(s.totals.science),powerGenerated:s.totals.power,waterMined:s.totals.water,expeditions:s.expeditionsDone,stormsSurvived:s.stormsSurvived,achievements:s.earned.length,quizCorrect:s.quizCorrect}}
function score(s){
return Math.round(s.res.science)+aliveCount(s)*20+s.shieldLevel*5+s.sol+(s.won?100:0)+s.earned.length*10}
function compareSites(){
return Object.keys(SITES).map(function(k){var d=SITES[k];return{site:k,name:d.name,radiation:d.radiation,ice:d.ice,solarFactor:d.solarFactor,stormChance:d.stormChance,desc:d.desc}})}
function advise(s){
var tips=[];
var alive=aliveCount(s);
if(alive===0){return tips}
var daysO2=s.res.o2/(0.84*alive);
var daysWater=s.res.water/(3.0*alive);
var daysFood=s.res.food/(1.6*alive);
if(daysO2<3){tips.push("Oxygen runs out in under 3 sols: build or power an O2 Generator now. A CO2 Scrubber boosts output 25%.")}
if(daysWater<3){tips.push("Water runs low: an Ice Extractor should be next, and Water Recyclers cut demand.")}
if(daysFood<3){tips.push("Food nearly gone: get a Greenhouse online and watered, or set the resupply manifest to food.")}
if(s.lastPowerUse>=s.lastPowerGen&&s.lastPowerGen>0){tips.push("The grid is saturated: more Solar Arrays, an RTG, or a Battery Bank will help.")}
if(s.shieldLevel<1&&s.sol>3){tips.push("No shielding yet: drill regolith and run Shielding Works to slow radiation damage.")}
var damaged=s.buildings.filter(function(b){return b.damaged}).length;
if(damaged>0){tips.push(damaged+" damaged building(s): repair from stores or send an EVA (cheaper but risky).")}
if(s.res.science<s.objectiveScience*0.3&&s.sol>s.objectiveSols*0.5){tips.push("Data collection is behind schedule: Labs and a Comms Dish multiply returns.")}
if(s.res.parts<10){var per=s.techs.sintering?4:3;tips.push("Parts are scarce: a Regolith Drill digs regolith and a Regolith Workshop sinters every 10 regolith into "+per+" parts each sol. Debris Salvage expeditions bring back 12, resupply pods land more, and Mission Control quiz answers pay +6.")}
var tired=s.crew.filter(function(c){return c.health>0&&(c.fatigue||0)>60}).length;
if(tired>0){tips.push(tired+" crew are exhausted: hold off on EVAs and expeditions until they recover.")}
if(Object.keys(s.techs).length===0&&s.res.science>=30&&s.sol>8){tips.push("You have enough science to research a technology: solar efficiency or water recycling pay off early.")}
var fc=forecast(s);
if(fc&&(fc.id==="storm"||fc.id==="flare"||fc.id==="aurora")){tips.push("Forecast for tomorrow: "+fc.text)}
if(!tips.length){tips.push("Outpost stable. Collect data and prepare for the next event.")}
return tips}
function report(s){
var lines=[];
lines.push("MISSION REPORT — "+(s.missionName?s.missionName+" — ":"")+SITES[s.site].name);
lines.push("Sol "+s.sol+" | Crew alive "+aliveCount(s)+"/"+s.crew.length+" | Science "+Math.floor(s.res.science)+"/"+s.objectiveScience+(s.scenario?" | Scenario: "+SCENARIOS[s.scenario].name:""));
lines.push("Stores: O2 "+Math.floor(s.res.o2)+", water "+Math.floor(s.res.water)+", food "+Math.floor(s.res.food)+", parts "+s.res.parts+", regolith "+s.res.regolith);
lines.push("Power: "+s.lastPowerGen+" generated, "+s.lastPowerUse+" used, "+s.powerStore+" stored. Shielding level "+s.shieldLevel+".");
lines.push("Buildings: "+s.buildings.map(function(b){return BUILDINGS[b.type].name+(b.done?(b.damaged?" (damaged)":""):" (building)")}).join(", "));
lines.push("Technologies: "+(Object.keys(s.techs).length?Object.keys(s.techs).map(function(k){return TECHS[k].name}).join(", "):"none"));
lines.push("Achievements: "+(s.earned.length?s.earned.join(", "):"none"));
lines.push("Score: "+score(s));
lines.push("Status: "+(s.over?(s.won?"SUCCESS":"FAILED"):"IN PROGRESS"));
return lines.join("\n")}
function reportJSON(s){
return{site:s.site,difficulty:s.difficulty,scenario:s.scenario,missionName:s.missionName,sol:s.sol,won:s.won,over:s.over,science:Math.round(s.res.science),score:score(s),crewAlive:aliveCount(s),crewTotal:s.crew.length,shieldLevel:s.shieldLevel,techs:Object.keys(s.techs),earned:s.earned,totals:s.totals}}

function solReport(s){
return"Sol "+s.sol+": O2 "+Math.round(s.res.o2)+", water "+Math.round(s.res.water)+", food "+Math.round(s.res.food)+", parts "+Math.round(s.res.parts)+", science "+Math.round(s.res.science)+". Crew "+aliveCount(s)+"/"+s.crew.length+", morale "+Math.round(avgMorale(s))+"."}
function bldgList(){return Object.keys(BUILDINGS).map(function(id){var b=BUILDINGS[id];var o={id:id};for(var k in b){o[k]=b[k]}return o})}
function techList(){return Object.keys(TECHS).map(function(id){var t=TECHS[id];var o={id:id};for(var k in t){o[k]=t[k]}return o})}


function netRates(s){
var hist=resourceHistory(s);
var out={};
["o2","water","food","parts","science"].forEach(function(k){
if(hist.length<2){out[k]=null;return}
var a=hist[Math.max(0,hist.length-4)],b=hist[hist.length-1];
var span=b.sol-a.sol||1;
out[k]=Math.round((b[k]-a[k])/span*10)/10});
return out}
function resourceRunway(s){
var rates=netRates(s);
var out={};
["o2","water","food","parts"].forEach(function(k){
var net=rates[k];
if(net===null){out[k]=null;return}
out[k]=net>=0?Infinity:Math.max(0,Math.floor(s.res[k]/-net))});
return out}
function criticalCrew(s){
return s.crew.filter(function(c){return c.health>0&&(c.health<40||c.morale<30)}).map(function(c){return{name:c.name,health:Math.round(c.health),morale:Math.round(c.morale)}})}
function unpoweredList(s){
var pb=powerBreakdown(s);
return(pb.consumers||[]).filter(function(c){return c.powered===false})}
function sciencePlan(s){
var goal=s.objective&&s.objective.scienceGoal?s.objective.scienceGoal:1000;
var rate=netRates(s).science||0;
if(rate<=0){return{goal:goal,current:Math.round(s.res.science),perSol:0,etaSols:"n/a",note:"No science production trend yet; labs, dishes and expeditions earn data."}}
return{goal:goal,current:Math.round(s.res.science),perSol:Math.round(rate*10)/10,etaSols:Math.max(0,Math.ceil((goal-s.res.science)/rate))}}







function buildPlanCSV(s){
var out=["building,count"];
bldgList().forEach(function(b){
var n=s.buildings.filter(function(x){return x.type===b.id}).length;
out.push(['"'+b.name+'"',n].join(","))});
return out.join(String.fromCharCode(10))}
function techTreeCSV(){
var out=["tech,cost,effect"];
techList().forEach(function(t){out.push(['"'+t.name+'"',t.cost,'"'+(t.desc||"")+'"'].join(","))});
return out.join(String.fromCharCode(10))}
function quizBankStats(){
var diff={};
QUIZ.forEach(function(q){var d=q.difficulty||"mixed";diff[d]=(diff[d]||0)+1});
return{questions:QUIZ.length,byDifficulty:diff}}

function siteComparisonCSV(){
var out=["site,radiation,ice,solar,storm_chance"];
compareSites().forEach(function(d){out.push([d.site,d.radiation,d.ice,d.solarFactor,d.stormChance].join(","))});
return out.join(String.fromCharCode(10))}

function endgameProjection(s){
return{sol:s.sol,scienceNow:Math.round(s.res.science),plan:sciencePlan(s),runway:resourceRunway(s),won:s.won,over:s.over}}

function bestNextBuild(s){
var runway=resourceRunway(s);
var worst=null,worstV=Infinity;
Object.keys(runway).forEach(function(k){if(runway[k]<worstV){worstV=runway[k];worst=k}});
var map={o2:"o2gen",water:"watermine",food:"greenhouse",parts:"drill"};
var pick=map[worst]||"solar";
var b=BUILDINGS[pick]||BUILDINGS.solar;
return{reason:worst?"Shortest runway: "+worst+" ("+(worstV===Infinity?"stable":worstV+" sols")+").":"All resources stable.",suggestion:b.name,id:pick}}




function stormPrepChecklist(s){
return["Charge batteries before the storm window","Pre-repair damaged buildings","Stock spare parts for EVA repairs","Delay expeditions until the storm passes","Keep crew indoors (no EVA during peak)"]}
function nightPrepChecklist(s){
return["Fill battery banks before nightfall","Shift heavy power use to daylight sols","Check RTG count if you rely on them","Run labs and drills on day power"]}
function solMilestones(s){
var out=[];
if(s.sol===1){out.push("First sol: get power and life support running")}
if(s.sol===7){out.push("One week: review resource runways")}
if(s.sol===14){out.push("Two weeks: first expedition window")}
if(s.sol===30){out.push("One month: mid-mission review, check the data plan")}
return out}
function winProbabilityHint(s){
var runway=resourceRunway(s);
var worst=Math.min(runway.o2,runway.water,runway.food);
var plan=sciencePlan(s);
var label;
if(worst<3||plan.etaSols==="n/a"){label="at risk"}
else if(worst<10){label="uncertain"}
else{label="on track"}
return{hint:label,note:"Heuristic from resource runways and data pace, not a guarantee."}}
function glossaryTerms(){
return[{term:"Sol",def:"A day on Mars (24 h 39 min); the game counts time in sols."},
{term:"EVA",def:"Spacewalk: crew going outside in suits to fix or build things."},
{term:"RTG",def:"Radioisotope generator: steady power from decaying plutonium, no sunlight needed."},
{term:"Regolith",def:"Loose soil and dust covering the Moon and Mars; used for building and shielding."},
{term:"Life support",def:"The systems that keep air, water and temperature livable."},
{term:"Shielding",def:"Material that blocks space radiation; water and regolith work well."}]}
function faqList(){
return[{q:"Why did my power go negative?",a:"New buildings draw power; check the power priority list and add solar arrays, RTGs or batteries."},
{q:"Crew morale keeps falling?",a:"Check rations, overcrowding and workload; rest days and generous rations recover morale."},
{q:"How do I win?",a:"Reach the data goal before the deadline while keeping the crew alive."},
{q:"What do scrubbers do?",a:"CO2 scrubbers boost every O2 generator by 25 percent."}]}



function summaryEmailText(s){
return"Mission "+(s.missionName||"Untitled")+" (sol "+s.sol+"): grade "+letterGrade(s)+", science "+Math.round(s.res.science)+", crew "+aliveCount(s)+"/"+s.crew.length+". "+solReport(s)}
function markdownLog(s){
var lines=["# Mission log: "+s.missionName,"","Site: "+s.site+", difficulty: "+s.difficulty+", sol "+s.sol+".",""];
(s.log||[]).slice(-50).forEach(function(l){lines.push("- Sol "+(l.sol!==undefined?l.sol:"?")+": "+(l.msg!==undefined?l.msg:l))});
return lines.join(String.fromCharCode(10))}
function statsJSON(s){
return JSON.stringify(statsSummary(s),null,2)}
function validateState(s){
var errs=[];
if(!s.res){errs.push("missing resources")}
["o2","water","food","parts","science"].forEach(function(k){
if(s.res&&s.res[k]===undefined){errs.push("missing resource "+k)}});
if(!s.crew||!s.crew.length){errs.push("no crew")}
s.crew.forEach(function(c){if(c.health===undefined){errs.push("crew "+c.name+" missing health")}});
return errs}
function stateHash(s){
var str=JSON.stringify({sol:s.sol,res:s.res,crew:s.crew.length,buildings:s.buildings.length});
var h=0;for(var i=0;i<str.length;i++){h=(Math.imul(h,31)+str.charCodeAt(i))|0}
return(h>>>0).toString(36)}

function bldgOf(s,t){return s.buildings.filter(function(b){return b.type===t})}

function xpProgress(s){
return s.crew.map(function(c){
var lvl=1+Math.floor(c.xp/50);
var into=c.xp%50;
return{name:c.name,role:c.role,level:lvl,xp:c.xp,toNext:50-into}})}
function techRecommend(s){
var owned=s.techs||{};
var out=Object.keys(TECHS).filter(function(k){return!owned[k]}).map(function(k){
var t=TECHS[k];
var afford=s.res.science>=t.cost;
var why=t.desc;
return{key:k,name:t.name,cost:t.cost,affordable:afford,why:why}});
out.sort(function(a,b){if(a.affordable!==b.affordable){return a.affordable?-1:1}return a.cost-b.cost});
return out.slice(0,3)}
function researchQueueCSV(s){
var owned=s.techs||{};
var rows=["tech,cost,owned"];
Object.keys(TECHS).forEach(function(k){rows.push('"'+TECHS[k].name+'",'+TECHS[k].cost+","+(owned[k]?"yes":"no"))});
return rows.join("\n")}





function o2Sheet(s){
var gen=bldgOf(s,"o2gen").filter(function(b){return b.done}).length*BUILDINGS.o2gen.o2;
var use=aliveCount(s)*2;
return{generated:gen,consumed:use,net:gen-use,stock:Math.round(s.res.o2)}}
function waterSheet(s){
var gen=bldgOf(s,"watermine").filter(function(b){return b.done}).length*BUILDINGS.watermine.water;
var use=aliveCount(s)*2;
return{generated:gen,consumed:use,net:gen-use,stock:Math.round(s.res.water)}}
function foodSheet(s){
var gh=bldgOf(s,"greenhouse").filter(function(b){return b.done});
var crop=s.crop&&CROPS[s.crop]?CROPS[s.crop]:null;
var gen=gh.length*(crop?crop.food:BUILDINGS.greenhouse.food);
var use=aliveCount(s)*1.6*s.rations;
return{generated:gen,consumed:Math.round(use*10)/10,net:Math.round((gen-use)*10)/10,stock:Math.round(s.res.food)}}





function objectiveProgress(s){
if(s.difficulty==="sandbox"){return{sandbox:true}}
var pct=Math.min(100,Math.round(s.res.science/s.objectiveScience*100));
return{pct:pct,science:Math.round(s.res.science),goal:s.objectiveScience,solUsed:s.sol,solLimit:s.objectiveSols}}
function deadlineCheck(s){
if(s.difficulty==="sandbox"){return{sandbox:true}}
var left=s.objectiveSols-s.sol;
var need=s.objectiveScience-s.res.science;
var hist=resourceHistory(s);
var pace=0;
if(hist.length>1){var d=hist[hist.length-1].science-hist[0].science;pace=d/(hist.length-1)}
var ok=pace>0&&pace*left>=need;
return{solsLeft:left,scienceNeeded:Math.round(need),pacePerSol:Math.round(pace*10)/10,onTrack:ok}}
function firstShortage(s){
var rw=resourceRunway(s);
var worst=null;
Object.keys(rw).forEach(function(k){var v=rw[k];if(v!==null&&v!==Infinity&&(worst===null||v<worst.sols)){worst={resource:k,sols:v}}});
return worst||{resource:null,sols:null,note:"No shortage projected."}}


function nearestAchievements(s){
var tracked=achievementProgress(s);
var out=ACHIEVEMENTS.map(function(a){
var t=tracked.filter(function(x){return x.id===a.id})[0];
var pct=t&&t.need?Math.round(100*Math.min(t.have,t.need)/t.need):0;
return{id:a.id,name:a.name,pct:pct,earned:s.earned.indexOf(a.id)>=0}});
return out.filter(function(a){return!a.earned}).sort(function(a,b){return b.pct-a.pct}).slice(0,3)}



function missionTimelineCSV(s){
var hist=resourceHistory(s);
var rows=["sol,o2,water,food,parts,data"];
hist.forEach(function(h){rows.push(h.sol+","+Math.round(h.o2)+","+Math.round(h.water)+","+Math.round(h.food)+","+Math.round(h.parts)+","+Math.round(h.science))});
return rows.join("\n")}
function subsystemGrades(s){
function g(net){return net>=4?"A":(net>=1?"B":(net>=0?"C":(net>=-3?"D":"F")))}
var o2=o2Sheet(s),w=waterSheet(s),f=foodSheet(s);
var p=powerBreakdown(s);
return{power:g(p.gen-p.use),o2:g(o2.net),water:g(w.net),food:g(f.net),morale:avgMorale(s)>=70?"A":(avgMorale(s)>=50?"B":(avgMorale(s)>=30?"C":"D"))}}
function maintenancePlan(s){
var out=[];
bldgOf(s,"solar").forEach(function(b,i){if(b.dirt>25){out.push({item:"Solar panel "+(i+1),issue:"dirt "+b.dirt+"%",action:"cleanSolar"})}});
s.buildings.forEach(function(b,i){if(b.damaged){out.push({item:b.type+" #"+(i+1),issue:"damaged",action:"repair"})}});
if(s.suitWear&&s.suitWear>50){out.push({item:"EVA suits",issue:"wear "+s.suitWear+"%",action:"suitMaintenance"})}
if(!out.length){out.push({item:"All systems",issue:"none",action:"no maintenance due"})}
return out}


function triviaOfTheSol(s){
var all=[
"NASA's Voyager 1 is the most distant human-made object, over 24 billion km away.",
"The ISS orbits Earth about 16 times a day.",
"Olympus Mons on Mars is about 2.5 times the height of Mount Everest.",
"A day on Venus is longer than its year.",
"NASA's Parker Solar Probe is the fastest spacecraft ever built.",
"Jupiter's moon Europa likely hides a salty ocean under its ice.",
"The Apollo 11 guidance computer had about 74 KB of memory.",
"Neutron stars can spin hundreds of times per second."];
var idx=(s.seed+s.sol)%all.length;
return{sol:s.sol,trivia:all[idx]}}




function victoryGap(s){
var gaps=[];
if(s.difficulty!=="sandbox"){
if(s.res.science<s.objectiveScience){gaps.push("Need "+Math.round(s.objectiveScience-s.res.science)+" more science.")}
if(aliveCount(s)<1){gaps.push("Keep at least one crew member alive.")}}
if(!gaps.length){gaps.push("On track to win; keep resources positive.")}
return gaps}











function logSearch(s,term){
term=String(term||"").toLowerCase();
return s.log.filter(function(e){return e.msg.toLowerCase().indexOf(term)>=0}).map(function(e){return{sol:e.sol,msg:e.msg}})}
function crewSummary(s){
return s.crew.map(function(c){
return{name:c.name,role:c.role,level:cLevel(c),health:c.health,morale:c.morale,fatigue:c.fatigue,away:c.away||0}})}
function crewHealthAvg(s){
var a=s.crew.filter(function(c){return c.health>0});
if(!a.length){return 0}
return Math.round(a.reduce(function(x,c){return x+c.health},0)/a.length*10)/10}
function crewFatigueAvg(s){
var a=s.crew.filter(function(c){return c.health>0});
if(!a.length){return 0}
return Math.round(a.reduce(function(x,c){return x+(c.fatigue||0)},0)/a.length*10)/10}
function crewXpTotal(s){
return s.crew.reduce(function(x,c){return x+(c.xp||0)},0)}
function crewLevels(s){
var out={1:0,2:0,3:0};
s.crew.forEach(function(c){out[cLevel(c)]++});
return out}
function exhaustedCrew(s){
return s.crew.filter(function(c){return c.health>0&&(c.fatigue||0)>=70}).map(function(c){return c.name})}
function awayCrew(s){
return s.crew.filter(function(c){return(c.away||0)>0}).map(function(c){return{name:c.name,dest:c.expedDest,solsLeft:c.away}})}
function roleRoster(s){
var out={};
s.crew.forEach(function(c){
if(!out[c.role]){out[c.role]=[]}
out[c.role].push(c.name)});
return out}
function moraleSpread(s){
var a=s.crew.filter(function(c){return c.health>0}).map(function(c){return c.morale});
if(!a.length){return null}
return{min:Math.min.apply(null,a),max:Math.max.apply(null,a),avg:Math.round(avgMorale(s)*10)/10}}
function resLevels(s){
return{o2:s.res.o2,water:s.res.water,food:s.res.food,parts:s.res.parts,regolith:s.res.regolith,science:s.res.science}}
function resLowest(s){
var r=resLevels(s);
var keys=["o2","water","food","parts"];
return keys.sort(function(a,b){return r[a]-r[b]})[0]}
function resRatios(s){
var r=s.res;
return{o2PerCrew:aliveCount(s)?Math.round(r.o2/aliveCount(s)*10)/10:0,waterPerCrew:aliveCount(s)?Math.round(r.water/aliveCount(s)*10)/10:0,foodPerCrew:aliveCount(s)?Math.round(r.food/aliveCount(s)*10)/10:0}}
function sciencePace(s){
if(!s.sol){return null}
return{perSol:Math.round(s.res.science/s.sol*100)/100,needed:Math.round(s.objectiveScience/s.objectiveSols*100)/100,onTrack:s.res.science/s.sol>=s.objectiveScience/s.objectiveSols}}
function buildingTypes(s){
var seen={};
s.buildings.forEach(function(b){seen[b.type]=true});
return Object.keys(seen)}
function damagedList(s){
return s.buildings.filter(function(b){return b.damaged}).map(function(b){return b.type})}
function inProgressList(s){
return s.buildings.filter(function(b){return!b.done}).map(function(b){return{type:b.type,solsLeft:b.solsLeft}})}
function greenhouseList(s){
return s.buildings.filter(function(b){return b.type==="greenhouse"&&b.done}).map(function(b){return{crop:b.crop,damaged:b.damaged}})}
function cropCoverage(s){
var gh=greenhouseList(s);
var counts={};
gh.forEach(function(g){var c=g.crop||"none";counts[c]=(counts[c]||0)+1});
return counts}
function powerMargin(s){
var p=powerBreakdown(s);
return{gen:p.generation,use:p.consumers.length?p.consumers.reduce(function(a,c){return a+(c.power||0)},0):0,store:s.powerStore}}
function storeDays(s){
var m=powerMargin(s);
var deficit=m.use-m.gen;
if(deficit<=0){return Infinity}
return Math.round(s.powerStore/deficit*10)/10}
function shieldInfo(s){
return{level:s.shieldLevel,nextCost:s.shieldLevel>=3?null:10+s.shieldLevel*10}}
function techsResearched(s){
return Object.keys(s.techs).filter(function(k){return s.techs[k]})}

function techsAvailable(s){
return Object.keys(TECHS).filter(function(k){return!s.techs[k]}).map(function(k){return{id:k,name:TECHS[k].name,cost:researchCost(s,k)}})}
function nextTechCost(s){
var av=techsAvailable(s);
if(!av.length){return null}
return av.sort(function(a,b){return a.cost-b.cost})[0]}




function quizRecord(s){
return{answered:s.quizIndex,correct:s.quizCorrect,streak:s.quizStreak,best:s.bestQuizStreak,accuracy:s.quizIndex?Math.round(s.quizCorrect/s.quizIndex*100):0}}
function achievementPct(s){
return Math.round(s.earned.length/ACHIEVEMENTS.length*100)}

function solsRemaining(s){
return Math.max(0,s.objectiveSols-s.sol)}
function projectedScience(s){
var nr=netRates(s);
if(nr.science===null){return null}
return Math.round(s.res.science+nr.science*solsRemaining(s))}
function projectedWin(s){
var ps=projectedScience(s);
if(ps===null){return null}
return{projected:ps,target:s.objectiveScience,willWin:ps>=s.objectiveScience}}
function runwayTable(s){
var rw=resourceRunway(s);
return rw}
function shortestRunway(s){
var rw=resourceRunway(s);
var best=null;
Object.keys(rw).forEach(function(k){
var v=rw[k];
if(v!==null&&v!==undefined&&typeof v==="number"&&(best===null||v<best.sols)){best={res:k,sols:v}}});
return best}
function historyAt(s,sol){
return s.history.filter(function(h){return h.sol===sol})[0]||null}

function historyDelta(s,k,a,b){
var ha=historyAt(s,a),hb=historyAt(s,b);
if(!ha||!hb){return null}
return Math.round((hb[k]-ha[k])*10)/10}
function worstSol(s,k){
if(!s.history.length){return null}
return s.history.slice().sort(function(a,b){return a[k]-b[k]})[0]}
function bestSol(s,k){
if(!s.history.length){return null}
return s.history.slice().sort(function(a,b){return b[k]-a[k]})[0]}
function historyTrend(s,k){
if(s.history.length<4){return null}
var h=s.history;
var n=h.length;
var first=h.slice(0,Math.floor(n/2)).reduce(function(a,x){return a+x[k]},0)/Math.floor(n/2);
var last=h.slice(Math.floor(n/2)).reduce(function(a,x){return a+x[k]},0)/(n-Math.floor(n/2));
return{first:Math.round(first*10)/10,last:Math.round(last*10)/10,rising:last>first}}
function upcomingEvents(s,n){
return s.schedule.slice(s.sol,s.sol+(n||5)).map(function(id,i){
var ev=EVENTS.filter(function(e){return e.id===id})[0];
return{sol:s.sol+i,id:id,text:ev?ev.text:"?"}})}
function nextHazard(s){
var up=upcomingEvents(s,10);
var haz=up.filter(function(u){return/storm|flare|micrometeorite|quake/i.test(u.text)});
return haz.length?haz[0]:null}
function calendarNote(s){
var nh=nextHazard(s);
return nh?"Next hazard on sol "+nh.sol+": "+nh.text:"No hazard in the next 10 sols."}

function affordableBuildings(s){
return Object.keys(BUILDINGS).filter(function(t){return canBuild(s,t)})}
function researchableNow(s){
return Object.keys(TECHS).filter(function(k){return!s.techs[k]&&s.res.science>=researchCost(s,k)})}
function actionChecklist(s){
var out=[];
if(damagedList(s).length){out.push("Repair: "+damagedList(s).join(", "))}
if(exhaustedCrew(s).length){out.push("Rest: "+exhaustedCrew(s).join(", "))}
var sr=shortestRunway(s);
if(sr&&sr.sols<4){out.push("Watch "+sr.res+": "+sr.sols+" sols of runway")}
var rb=researchableNow(s);
if(rb.length){out.push("Research available: "+rb.join(", "))}
if(!out.length){out.push("All stable. Consider an expedition or a new greenhouse.")}
return out}
function missionStatusLine(s){
return"Sol "+s.sol+"/"+s.objectiveSols+" at "+(SITES[s.site]?SITES[s.site].name:s.site)+": "+aliveCount(s)+" crew, science "+Math.round(s.res.science)+"/"+s.objectiveScience+", score "+score(s)+"."}
function dangerScore(s){
var d=0;
var sr=shortestRunway(s);
if(sr&&sr.sols<4){d+=30}
d+=exhaustedCrew(s).length*10;
d+=damagedList(s).length*15;
if(avgMorale(s)<40){d+=15}
var pm=powerMargin(s);
if(pm.gen-pm.use<0){d+=20}
return Math.min(100,d)}
function winOddsText(s){
var pw=projectedWin(s);
var d=dangerScore(s);
if(pw===null){return"Too early to project."}
return(pw.willWin?"On pace to win":"Behind pace")+" (projected "+pw.projected+" vs "+pw.target+"); danger "+d+"/100."}
function crewTableCSV(s){
var lines=["name,role,level,health,morale,fatigue,xp,away"];
s.crew.forEach(function(c){lines.push([c.name,c.role,cLevel(c),c.health,c.morale,c.fatigue||0,c.xp||0,c.away||0].join(","))});
return lines.join(String.fromCharCode(10))}
function buildingsCSV(s){
var lines=["type,done,damaged,solsLeft,crop"];
s.buildings.forEach(function(b){lines.push([b.type,b.done,b.damaged,b.solsLeft,b.crop||""].join(","))});
return lines.join(String.fromCharCode(10))}
function techCSV(s){
var lines=["tech,researched"];
Object.keys(TECHS).forEach(function(k){lines.push(k+","+(s.techs[k]?1:0))});
return lines.join(String.fromCharCode(10))}
function scheduleCSV(s){
var lines=["sol,event"];
s.schedule.forEach(function(id,i){
var ev=EVENTS.filter(function(e){return e.id===id})[0];
lines.push(i+',"'+(ev?ev.text.replace(/"/g,"'"):id)+'"')});
return lines.join(String.fromCharCode(10))}
function snapshotJSON(s){
return JSON.stringify({sol:s.sol,site:s.site,difficulty:s.difficulty,score:score(s),res:resLevels(s),crew:crewSummary(s),buildings:s.buildings.length,techs:techsResearched(s),earned:s.earned.length},null,1)}
function stateAudit(s){
var errs=[];
if(typeof s.sol!=="number"||s.sol<0){errs.push("bad sol")}
["o2","water","food","parts","regolith","science"].forEach(function(k){
if(typeof s.res[k]!=="number"||isNaN(s.res[k])){errs.push("bad res."+k)}});
s.crew.forEach(function(c,i){
if(c.health<0||c.health>100){errs.push("crew "+i+" health out of range")}
if(c.morale<0||c.morale>100){errs.push("crew "+i+" morale out of range")}});
return errs}
function missionMd(s){
var lines=["# Mission report - sol "+s.sol,"",missionStatusLine(s),"","## Crew",""];
crewSummary(s).forEach(function(c){lines.push("- "+c.name+" ("+c.role+" L"+c.level+"): health "+c.health+", morale "+c.morale+", fatigue "+c.fatigue)});
lines.push("","## Checklist","");
actionChecklist(s).forEach(function(a){lines.push("- "+a)});
lines.push("","## Next events","");
upcomingEvents(s,3).forEach(function(u){lines.push("- Sol "+u.sol+": "+u.text)});
return lines.join(String.fromCharCode(10))}
function quizStatsText(s){
var q=quizRecord(s);
return"Quiz: "+q.correct+"/"+q.answered+" correct ("+q.accuracy+"%), best streak "+q.best+"."}
function glossaryR5(){
return[{term:"Sol",def:"A Martian day, about 24 hours 39 minutes."},{term:"ISRU",def:"In-situ resource utilization: making water, oxygen or fuel from local material."},{term:"Regolith",def:"The loose dust and broken rock covering the surface; a building and shielding material."},{term:"Shield level",def:"Layered regolith or water protection cutting crew radiation dose."},{term:"Runway",def:"Sols until a resource runs out at current net rates."},{term:"Objective mode",def:"The win condition: data target, self-sufficiency, or a custom mix."}]}
function faqR5(){
return[{q:"Is the Mars data real?",a:"Site facts, radiation, dust-storm behavior and crop science come from NASA sources; the game simulates around them."},{q:"What does difficulty change?",a:"Radiation dose, starting stockpiles, the data objective and the sol deadline."},{q:"How is the score computed?",a:"Data, surviving crew, shield level, sols survived, a win bonus and earned achievements."}]}
function triviaR5(seed){
var facts=["A Mars sol is about 3% longer than an Earth day.","Jezero crater once held a lake billions of years ago.","Dust storms can cover the whole planet for weeks.","Mars gets about 43% of Earth's sunlight per square meter.","Potatoes really were grown in Mars-like soil in Peru as a proof of concept."];
return{fact:facts[(seed||1)%facts.length]}}
function quizCheck01(idx,answer){
var q=QUIZ[idx%QUIZ.length];
return{correct:answer===q.c,fact:q.fact||""}}






































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































function fa2Drill(seed){
var i=Math.abs(Math.floor(seed))%EVENTS.length;
var ev=EVENTS[i];
var pool=["mars","moon","iss","earth","orbit"];
var correct=ev.sites[0];
var choices=[correct];
for(var k=0;k<pool.length&&choices.length<3;k++){if(choices.indexOf(pool[k])<0){choices.push(pool[k])}}
var h=(i*2654435761+12345)>>>0;h^=h<<13;h^=h>>>17;h^=h<<5;var rot=(h>>>0)%3;
choices=choices.slice(rot).concat(choices.slice(0,rot));
return{text:ev.text,siteCount:ev.sites.length,choices:choices,correct:choices.indexOf(correct),weight:ev.w}}
function fa2DrillCount(){return EVENTS.length}

function fa2PassportTotal(){return QUIZ.length}
function fa2PassportPct(done){
if(!QUIZ.length){return 0}
var n=0;
QUIZ.forEach(function(q,idx){if(done.indexOf(idx)>=0){n++}});
return Math.round(n/QUIZ.length*100)}
function fa2PassportText(done){
var pct=fa2PassportPct(done);
var lines=["Junior Astronaut knowledge passport: "+pct+"% mastered ("+done.length+"/"+QUIZ.length+")."];
QUIZ.forEach(function(q,idx){if(done.indexOf(idx)>=0){lines.push("- "+q.fact)}});
return lines.join(String.fromCharCode(10))}
function fa2PassportRemaining(done){
var out=[];
QUIZ.forEach(function(q,idx){if(done.indexOf(idx)<0){out.push(idx)}});
return out}
function fa2Briefing(day){
var d=Math.abs(Math.floor(day));
var q=QUIZ[d%QUIZ.length];
var ev=EVENTS[d%EVENTS.length];
var ach=ACHIEVEMENTS[d%ACHIEVEMENTS.length];
return{fact:q.fact,event:ev.text,target:ach.name}}
function fa2Streak(last,cur){
if(cur===last){return 0}
if(cur===last+1){return 1}
return 2}
function fa2StreakNext(streak,last,cur){
var s=fa2Streak(last,cur);
if(s===0){return streak}
if(s===1){return streak+1}
return 1}


function fa3MarathonNew(){return{idx:0,lives:3,score:0,bestStreak:0,streak:0,over:false,answered:0}}
function fa3MarathonQ(m){
if(m.over||m.idx>=QUIZ.length){return null}
var q=QUIZ[m.idx%QUIZ.length];
return{n:m.idx+1,total:QUIZ.length,q:q.q,choices:q.a.slice(),answer:q.c,fact:q.fact,lives:m.lives,score:m.score}}
function fa3MarathonAnswer(m,pick){
var q=QUIZ[m.idx%QUIZ.length];
var right=pick===q.c;
m.answered++;
if(right){m.score+=100+m.streak*25;m.streak++;if(m.streak>m.bestStreak){m.bestStreak=m.streak}}
else{m.lives--;m.streak=0;if(m.lives<=0){m.over=true}}
m.idx++;
if(m.idx>=QUIZ.length){m.over=true}
return{right:right,correctAnswer:q.a[q.c],fact:q.fact,over:m.over,score:m.score,lives:m.lives}}
function fa3Timeline(siteId){
var ev=EVENTS.filter(function(e){return !siteId||e.sites.indexOf(siteId)>=0});
ev=ev.slice().sort(function(a,b){return b.w-a.w});
return{site:siteId||"all",events:ev.map(function(e){return{id:e.id,text:e.text,weight:e.w}}),count:ev.length,heaviest:ev.length?ev[0].id:null}}

function fa3Hunt(unlockedIds){
var got={};
(unlockedIds||[]).forEach(function(id){got[id]=true});
var rows=ACHIEVEMENTS.map(function(a){return{id:a.id,name:a.name,unlocked:!!got[a.id]}});
var done=rows.filter(function(r){return r.unlocked}).length;
return{rows:rows,done:done,total:ACHIEVEMENTS.length,next:rows.filter(function(r){return!r.unlocked}).slice(0,3).map(function(r){return r.name})}}
function fa3HuntText(unlockedIds){
var h=fa3Hunt(unlockedIds);
return"Achievement hunt: "+h.done+"/"+h.total+(h.next.length?". Closest targets: "+h.next.join(", "):". All unlocked!")}

return{fa3MarathonNew:fa3MarathonNew,fa3MarathonQ:fa3MarathonQ,fa3MarathonAnswer:fa3MarathonAnswer,fa3Timeline:fa3Timeline,fa3Hunt:fa3Hunt,fa3HuntText:fa3HuntText,fa2Drill:fa2Drill,fa2DrillCount:fa2DrillCount,fa2PassportTotal:fa2PassportTotal,fa2PassportPct:fa2PassportPct,fa2PassportText:fa2PassportText,fa2PassportRemaining:fa2PassportRemaining,fa2Briefing:fa2Briefing,fa2Streak:fa2Streak,fa2StreakNext:fa2StreakNext,SITES:SITES,BUILDINGS:BUILDINGS,QUIZ:QUIZ,ACHIEVEMENTS:ACHIEVEMENTS,TECHS:TECHS,CROPS:CROPS,EXPEDITIONS:EXPEDITIONS,SCENARIOS:SCENARIOS,ROLES:ROLES,EVENTS:EVENTS,rest:rest,cleanSolar:cleanSolar,repairAll:repairAll,shelterMode:shelterMode,suitMaintenance:suitMaintenance,setObjectiveMode:setObjectiveMode,resourceHistory:resourceHistory,historyCSV:historyCSV,crewCSV:crewCSV,eventPreview:eventPreview,dryRunBuild:dryRunBuild,alerts:alerts,letterGrade:letterGrade,postMortem:postMortem,dailyChecklist:dailyChecklist,shareText:shareText,achievementProgress:achievementProgress,batteryStatus:batteryStatus,moraleReport:moraleReport,powerForecast:powerForecast,foodCalendar:foodCalendar,buildQueueEta:buildQueueEta,healthReport:healthReport,tutorialHints:tutorialHints,weeklySummary:weeklySummary,avgMorale:avgMorale,researchCost:researchCost,damageOne:damageOne,applyEvent:applyEvent,newGame:newGame,tick:tick,build:build,repair:repair,evaRepair:evaRepair,advise:advise,answerQuiz:answerQuiz,report:report,reportJSON:reportJSON,aliveCount:aliveCount,crewCapacity:crewCapacity,recruit:recruit,computePower:computePower,canBuild:canBuild,research:research,retrain:retrain,setRations:setRations,setCrop:setCrop,setManifest:setManifest,setMissionName:setMissionName,expedition:expedition,forecast:forecast,setScenario:setScenario,powerBreakdown:powerBreakdown,statsSummary:statsSummary,score:score,compareSites:compareSites,cLevel:cLevel,solReport:solReport,netRates:netRates,resourceRunway:resourceRunway,criticalCrew:criticalCrew,unpoweredList:unpoweredList,sciencePlan:sciencePlan,buildPlanCSV:buildPlanCSV,techTreeCSV:techTreeCSV,quizBankStats:quizBankStats,siteComparisonCSV:siteComparisonCSV,endgameProjection:endgameProjection,bestNextBuild:bestNextBuild,stormPrepChecklist:stormPrepChecklist,nightPrepChecklist:nightPrepChecklist,solMilestones:solMilestones,winProbabilityHint:winProbabilityHint,glossaryTerms:glossaryTerms,faqList:faqList,summaryEmailText:summaryEmailText,markdownLog:markdownLog,statsJSON:statsJSON,validateState:validateState,stateHash:stateHash,xpProgress:xpProgress,techRecommend:techRecommend,researchQueueCSV:researchQueueCSV,o2Sheet:o2Sheet,waterSheet:waterSheet,foodSheet:foodSheet,objectiveProgress:objectiveProgress,deadlineCheck:deadlineCheck,firstShortage:firstShortage,nearestAchievements:nearestAchievements,missionTimelineCSV:missionTimelineCSV,subsystemGrades:subsystemGrades,maintenancePlan:maintenancePlan,triviaOfTheSol:triviaOfTheSol,victoryGap:victoryGap,logSearch:logSearch,crewSummary:crewSummary,crewHealthAvg:crewHealthAvg,crewFatigueAvg:crewFatigueAvg,crewXpTotal:crewXpTotal,crewLevels:crewLevels,exhaustedCrew:exhaustedCrew,awayCrew:awayCrew,roleRoster:roleRoster,moraleSpread:moraleSpread,resLevels:resLevels,resLowest:resLowest,resRatios:resRatios,sciencePace:sciencePace,buildingTypes:buildingTypes,damagedList:damagedList,inProgressList:inProgressList,greenhouseList:greenhouseList,cropCoverage:cropCoverage,powerMargin:powerMargin,storeDays:storeDays,shieldInfo:shieldInfo,techsResearched:techsResearched,techsAvailable:techsAvailable,nextTechCost:nextTechCost,quizRecord:quizRecord,achievementPct:achievementPct,solsRemaining:solsRemaining,projectedScience:projectedScience,projectedWin:projectedWin,runwayTable:runwayTable,shortestRunway:shortestRunway,historyAt:historyAt,historyDelta:historyDelta,worstSol:worstSol,bestSol:bestSol,historyTrend:historyTrend,upcomingEvents:upcomingEvents,nextHazard:nextHazard,calendarNote:calendarNote,affordableBuildings:affordableBuildings,researchableNow:researchableNow,actionChecklist:actionChecklist,missionStatusLine:missionStatusLine,dangerScore:dangerScore,winOddsText:winOddsText,crewTableCSV:crewTableCSV,buildingsCSV:buildingsCSV,techCSV:techCSV,scheduleCSV:scheduleCSV,snapshotJSON:snapshotJSON,stateAudit:stateAudit,missionMd:missionMd,quizStatsText:quizStatsText,glossaryR5:glossaryR5,faqR5:faqR5,triviaR5:triviaR5,quizCheck01:quizCheck01,shuffleChoices:shuffleChoices}});
