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
lab:{name:"Science Lab",cost:18,buildSols:2,powerUse:8,science:7,desc:"Runs experiments and produces science points."},
comms:{name:"Comms Dish",cost:12,buildSols:1,powerUse:4,uplink:true,desc:"Radios results home. Adds a bonus on reported science."},
drill:{name:"Regolith Drill",cost:10,buildSols:1,powerUse:6,regolith:20,desc:"Digs regolith used for shielding."},
workshop:{name:"Regolith Workshop",cost:16,buildSols:2,powerUse:6,workshop:true,desc:"Sinters regolith into spare parts: 10 regolith becomes 3 parts per sol."},
algae:{name:"Algae Tank",cost:14,buildSols:1,powerUse:8,waterUse:2,o2small:6,foodSmall:2,desc:"Bioreactor that breathes out oxygen and a little food, like experiments flown on the ISS."},
observatory:{name:"Observatory",cost:20,buildSols:2,powerUse:5,science:4,moraleBoost:3,desc:"A small telescope dome: science by night, wonder for the crew."},
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
{id:"relay",sites:["moon","mars"],text:"A satellite relay passes overhead: +15 science if a comms dish is online.",w:1},
{id:"calm",sites:["moon","mars"],text:"A calm sol. Crew morale improves.",w:3},
{id:"flare",sites:["moon","mars"],text:"Solar flare! Extra radiation this sol.",w:2},
{id:"birthday",sites:["moon","mars"],text:"A crew birthday lifts everyone's morale.",w:1},
{id:"stowaway",sites:["moon","mars"],text:"A stowaway pest got into the stores: -15 food.",w:1},
{id:"coolant",sites:["moon","mars"],text:"A coolant loop ruptures, damaging one building.",w:1},
{id:"podbonus",sites:["moon","mars"],text:"A cargo lander drops bonus supplies: +8 parts.",w:1},
{id:"breakthrough",sites:["moon","mars"],text:"Lab breakthrough: +10 science if a lab is online.",w:1},
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
{q:"What did NASA's MOXIE experiment produce from the Martian atmosphere?",a:["Oxygen","Water","Methane","Hydrogen"],c:0,fact:"MOXIE made oxygen from Mars's CO2 atmosphere, a first step toward making air and rocket fuel off Earth."},
{q:"Why do planners target the Moon's south pole?",a:["Permanently shadowed craters may hold water ice","It is the warmest region","It has the strongest gravity","It is closest to Earth"],c:0,fact:"Shadowed craters near the lunar south pole are cold traps that can preserve water ice."},
{q:"About how long is one Martian sol?",a:["24 hours 37 minutes","12 hours","48 hours","29.5 days"],c:0,fact:"A sol is about 24h 37m, close to an Earth day."},
{q:"What is the main component of the Martian atmosphere?",a:["Carbon dioxide","Oxygen","Nitrogen","Methane"],c:0,fact:"Mars's thin atmosphere is about 95% carbon dioxide."},
{q:"How long can a one-way radio signal take between Earth and Mars?",a:["3 to 22 minutes","Instant","2 seconds","3 hours"],c:0,fact:"Light-time to Mars ranges from about 3 to 22 minutes one way, so crews must solve problems without live help."},
{q:"What protects crews on the ISS from most radiation?",a:["Earth's magnetosphere","Thick glass","Lead walls","The solar arrays"],c:0,fact:"The ISS orbits inside Earth's magnetosphere. Deep-space crews need shielding such as regolith or water walls."},
{q:"Roughly how long is a full lunar day-night cycle?",a:["About 29.5 Earth days","24 hours","7 days","365 days"],c:0,fact:"The Moon spins once in about 29.5 Earth days, so solar bases face long nights away from polar peaks."},
{q:"What do RTGs use to make electricity?",a:["Heat from decaying plutonium","Burning methane","Wind turbines","Coal cells"],c:0,fact:"RTGs convert heat from plutonium-238 decay into steady power, working through night and dust storms."},
{q:"Why is growing food on a mission valuable?",a:["Resupply from Earth is slow and costly","Plants glow nicely","Soil is free in space","It removes all CO2"],c:0,fact:"Resupply to the Moon takes days and to Mars months, so local food, water, and oxygen make missions resilient."},
{q:"What hazard do dust storms on Mars pose to solar power?",a:["Dust blocks sunlight and coats panels","Dust freezes panels","Dust conducts electricity","No hazard"],c:0,fact:"Martian dust storms can slash sunlight for weeks and coat panels, as ended the Opportunity rover's mission."},
{q:"Which program aims to return astronauts to the Moon this decade?",a:["Artemis","Apollo","Gemini","Mercury"],c:0,fact:"Artemis plans crewed lunar landings and a sustained presence near the south pole."},
{q:"Which telescope launched in 2021 now studies the early universe?",a:["James Webb","Hubble","Kepler","Spitzer"],c:0,fact:"JWST observes in infrared from the Sun-Earth L2 point."},
{q:"What makes lunar regolith useful for shielding?",a:["It absorbs radiation when piled over habitats","It is magnetic","It glows","It is radioactive"],c:0,fact:"A few meters of regolith dramatically cuts radiation dose, so crews bury or 3D-print shelters."},
{q:"What did the SOFIA observatory confirm on the Moon's sunlit surface in 2020?",a:["Water molecules","Oil","Methane lakes","Active volcanoes"],c:0,fact:"SOFIA detected water molecules in Clavius crater, beyond the permanently shadowed regions."},
{q:"Why are lava tubes interesting to base planners?",a:["Natural caves give ready-made radiation shelter","They contain gold","They generate heat","They attract rovers"],c:0,fact:"Lava tubes offer shelter from radiation, micrometeorites, and temperature swings."},
{q:"What is ISRU?",a:["Using local resources like ice and regolith instead of shipping everything","A rocket fuel","A satellite band","A spacesuit layer"],c:0,fact:"In-situ resource utilization turns local ice, soil, and atmosphere into water, oxygen, and building material."},
{q:"Perchlorate salts in Martian soil are a concern because they are...",a:["Toxic to humans and crops","Delicious","Radioactive","Explosive"],c:0,fact:"Perchlorates can harm thyroid function and must be washed out of soil before farming."},
{q:"Which Apollo mission turned a crisis into a safe return using the lunar module as a lifeboat?",a:["Apollo 13","Apollo 11","Apollo 8","Apollo 17"],c:0,fact:"Apollo 13's crew looped around the Moon and survived on the LM's supplies after an oxygen tank explosion."},
{q:"Why does a greenhouse on Mars need artificial light even in daytime?",a:["Sunlight there is weaker and dusty","Plants fear Mars","Glass freezes","It doesn't"],c:0,fact:"Mars gets under half Earth's sunlight, and dust cuts it further, so grow lights keep yields up."},
{q:"What is a fair first power source for a polar lunar base?",a:["Solar arrays on illuminated ridges","Coal plant","Wind farm","Tidal generator"],c:0,fact:"Near-polar ridges can see long stretches of sunlight, making solar plus storage practical."}
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
crew:[],buildings:[],shieldLevel:0,log:[],over:false,won:false,doseMult:doseMult,quizIndex:0,quizCorrect:0,quizDue:5,pendingQuiz:null,
stormsSurvived:0,selfSufficientStreak:0,lastPowerGen:0,lastPowerUse:0,earned:[],objectiveScience:d==="cadet"?120:200,objectiveSols:d==="commander"?40:30,
techs:{},rations:1,manifest:"mixed",scenario:null,powerStore:0,batteryNights:0,expeditionsDone:0,retrains:0,cropSwitches:0,totals:{science:0,power:0,water:0},schedule:[],
history:[],milestonesHit:[],quizStreak:0,bestQuizStreak:0,solarBoostSols:0,shelterNext:false,evaShield:false,icePocketArmed:false,relayFixedUntil:0,objectiveMode:"science",podLight:false,redundancySol:-1};
var n=4;
for(var i=0;i<n;i++){s.crew.push({name:CREW_NAMES[i],health:100,morale:80,role:ROLES[i],xp:0,fatigue:0,away:0,expedDest:null})}
s.buildings.push({type:"habitat",done:true,solsLeft:0,damaged:false,crop:null});
s.buildings.push({type:"habitat",done:true,solsLeft:0,damaged:false,crop:null});
s.buildings.push({type:"solar",done:true,solsLeft:0,damaged:false,crop:null});
addLog(s,"Mission start at "+siteDef.name+". Keep the crew alive, reach "+s.objectiveScience+" science by sol "+s.objectiveSols+".");
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
function forecast(s){var id=s.schedule[s.sol];if(!id){return null}var ev=null;for(var i=0;i<EVENTS.length;i++){if(EVENTS[i].id===id){ev=EVENTS[i]}}return ev?{id:ev.id,text:ev.text}:null}
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
function build(s,type){if(!canBuild(s,type)){return false}var def=BUILDINGS[type];s.res.parts-=def.cost;s.buildings.push({type:type,done:false,solsLeft:def.buildSols,damaged:false,crop:type==="greenhouse"?"potato":null,damageSol:null});addLog(s,"Construction started: "+def.name+".");return true}
function repair(s,idx){var b=s.buildings[idx];if(!b||!b.damaged){return false}
var cost=bestRoleLevel(s,"Engineer")>0?3:5;
if(s.res.parts<cost){return false}s.res.parts-=cost;b.damaged=false;b.damageSol=null;addLog(s,"Repaired "+BUILDINGS[b.type].name+" for "+cost+" parts.");return true}
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
function renameCrew(s,idx,n){var c=s.crew[idx];if(!c){return false}c.name=String(n||c.name).slice(0,24);return true}
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
var ex=EXPEDITIONS[c.expedDest];c.expedDest=null;
var broke=rand(s)<0.1;
var f=broke?0.5:1;
if(broke){c.health=Math.max(1,c.health-10);addLog(s,c.name+"'s rover broke down on the way back: -10 health, half haul.")}
if(ex.science){var g=Math.round(ex.science*f);s.res.science+=g;s.totals.science+=g}
if(ex.water){var w=Math.round(ex.water*f);if(c.expedDest==="icefield"&&s.icePocketArmed){w*=2;s.icePocketArmed=false;addLog(s,"The flagged ice pocket paid off: double water haul.")}s.res.water+=w;s.totals.water+=w}
if(ex.parts){s.res.parts+=Math.round(ex.parts*f)}
if(ex.relay){s.relayFixedUntil=s.sol+10;addLog(s,"Relay station back online: +2 science per sol for 10 sols.")}
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
if(ndef.workshop&&s.res.regolith>=10){var made=s.techs.sintering?4:3;s.res.regolith-=10;s.res.parts+=made}
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
if(s.totals.science>=mk&&s.milestonesHit.indexOf(mk)<0){s.milestonesHit.push(mk);s.res.parts+=10;addLog(s,"Science milestone "+mk+": backers send +10 parts.")}});
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
else if(s.res.science>=s.objectiveScience){s.over=true;s.won=true;addLog(s,"Mission complete! Science goal reached with the crew alive.")}
else if(aliveNow>0){s.objectiveSols+=10;addLog(s,"Science shortfall. Extension granted to sol "+s.objectiveSols+".")}
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
if(s.quizStreak>0&&s.quizStreak%3===0){s.res.science+=10;s.totals.science+=10;addLog(s,"Quiz streak "+s.quizStreak+": bonus +10 science.")}}
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
s.res.parts-=cost;addLog(s,"New crew arrived: "+s.crew[s.crew.length-1].name+".");return true}
function avgMorale(s){var a=s.crew.filter(function(c){return c.health>0});if(!a.length){return 0}return a.reduce(function(x,c){return x+c.morale},0)/a.length}
function rest(s,idx){var c=s.crew[idx];if(!c||c.health<=0||(c.away||0)>0){return false}
c.fatigue=Math.max(0,(c.fatigue||0)-40);c.morale=Math.min(100,c.morale+5);addLog(s,c.name+" took a rest sol.");return true}
function cleanSolar(s){if(s.res.parts<2){return false}
if(!s.buildings.some(function(b){return b.type==="solar"&&b.done&&!b.damaged})){return false}
s.res.parts-=2;s.solarBoostSols=3;addLog(s,"Panels cleaned: solar output +20% for 3 sols.");return true}
function repairAll(s){
var cost=bestRoleLevel(s,"Engineer")>0?3:5;
var fixed=0;
for(var i=0;i<s.buildings.length;i++){var b=s.buildings[i];
if(b.damaged&&s.res.parts>=cost){s.res.parts-=cost;b.damaged=false;b.damageSol=null;fixed++}}
if(fixed){addLog(s,"Repaired "+fixed+" building(s) from stores.")}
return fixed}
function shelterMode(s){s.shelterNext=true;addLog(s,"Shelter mode ordered for next sol: non-essential systems down, buildings protected.");return true}
function suitMaintenance(s){if(s.res.parts<3){return false}
s.res.parts-=3;s.evaShield=true;addLog(s,"EVA suits serviced: next EVA is safer.");return true}
function setObjectiveMode(s,mode){if(["science","survival","morale"].indexOf(mode)<0||s.sol>0){return false}
s.objectiveMode=mode;addLog(s,"Objective mode: "+mode+".");return true}
function resourceHistory(s){return s.history}
function historyCSV(s){
var lines=["sol,o2,water,food,parts,science"];
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
if(!out.length){out.push("Stable: push science, research, or an expedition")}
return out}
var NAME_A=["Ares","Selene","Horizon","Pioneer","Kepler","Halley","Vega","Orion"];
var NAME_B=["Dawn","Beacon","Frontier","Haven","Odyssey","Promise","Light","Shield"];
function missionNameGen(seed){var st={rngState:(seed||1)|0};
return NAME_A[Math.floor(rand(st)*NAME_A.length)]+" "+NAME_B[Math.floor(rand(st)*NAME_B.length)]}
function difficultyTable(){
return[{id:"cadet",name:"Cadet",dose:"55%",stores:"+35%",goal:"120 science"},
{id:"explorer",name:"Explorer",dose:"100%",stores:"standard",goal:"200 science"},
{id:"commander",name:"Commander",dose:"130%",stores:"-20%",goal:"200 science in 40 sols"},
{id:"sandbox",name:"Sandbox",dose:"100%",stores:"standard",goal:"no fail states"}]}
function scoreBreakdown(s){
return{science:Math.round(s.res.science),crew:aliveCount(s)*20,shielding:s.shieldLevel*5,sols:s.sol,wonBonus:s.won?100:0,achievements:s.earned.length*10,total:score(s)}}
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
if(s.sol>=2){out.push("Quiz sols come every 5 sols: right answers earn parts and science.")}
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
if(s.res.science<s.objectiveScience*0.3&&s.sol>s.objectiveSols*0.5){tips.push("Science is behind schedule: Labs and a Comms Dish multiply returns.")}
var tired=s.crew.filter(function(c){return c.health>0&&(c.fatigue||0)>60}).length;
if(tired>0){tips.push(tired+" crew are exhausted: hold off on EVAs and expeditions until they recover.")}
if(Object.keys(s.techs).length===0&&s.res.science>=30&&s.sol>8){tips.push("You have enough science to research a technology: solar efficiency or water recycling pay off early.")}
var fc=forecast(s);
if(fc&&(fc.id==="storm"||fc.id==="flare"||fc.id==="aurora")){tips.push("Forecast for tomorrow: "+fc.text)}
if(!tips.length){tips.push("Outpost stable. Push science and prepare for the next event.")}
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
function expeditionList(){return Object.keys(EXPEDITIONS).map(function(id){var x=EXPEDITIONS[id];var o={id:id};for(var k in x){o[k]=x[k]}return o})}
function cropList(){return Object.keys(CROPS).map(function(id){var c=CROPS[id];var o={id:id};for(var k in c){o[k]=c[k]}return o})}
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
if(rate<=0){return{goal:goal,current:Math.round(s.res.science),perSol:0,etaSols:"n/a",note:"No science production trend yet; labs, dishes and expeditions earn science."}}
return{goal:goal,current:Math.round(s.res.science),perSol:Math.round(rate*10)/10,etaSols:Math.max(0,Math.ceil((goal-s.res.science)/rate))}}
function shieldPlan(s){
return{currentLevel:s.shieldLevel,nextLevel:s.shieldLevel+1,building:BUILDINGS.shield?BUILDINGS.shield.name:"Shielding Works",canBuild:canBuild(s,"shield")}}
function batteryPlan(s){
var bs=batteryStatus(s);
return{stored:bs.stored!==undefined?bs.stored:null,capacity:batteryCap(s),note:"Batteries smooth storms and lunar night; aim for 2+ sols of demand."}}
function foodPlan(s){
var net=netRates(s).food;
return{perSol:net,stock:Math.round(s.res.food),crops:s.crop,note:net!==null&&net<0?"Food runs down: add greenhouses or adjust crops.":"Food balance is positive or unknown."}}
function waterPlan(s){
var net=netRates(s).water;
return{perSol:net,stock:Math.round(s.res.water),note:net!==null&&net<0?"Water deficit: ice extractors and recyclers help.":"Water balance is positive or unknown."}}
function eventRiskReport(s){
var site=SITES[s.site];
var out=[];
if(site.stormChance>0){out.push("Storms: about "+Math.round(site.stormChance*100)+"% chance per sol here; batteries and spare parts matter.")}
if(site.radiation>2){out.push("Radiation is high at this site; shielding works and the Med Bay protect the crew.")}
if(s.site.indexOf("Lunar")>=0||site.name.indexOf("Lunar")>=0){out.push("Lunar night dims solar power for long stretches; RTGs or big battery banks cover the gap.")}
return out}
function expeditionPlanner(s){
return expeditionList().map(function(x){
var afford=typeof x.cost==="number"?s.res.parts>=x.cost:true;
return{id:x.id,name:x.name,sols:x.sols,affordable:afford,science:x.science||0}})}
function expeditionHistoryCSV(s){
var out=["sol,expedition,result"];
(s.expeditionLog||[]).forEach(function(x){out.push([x.sol,'"'+x.name+'"','"'+x.result+'"'].join(","))});
return out.join(String.fromCharCode(10))}
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
function achievementTable(){
return ACHIEVEMENTS.map(function(a){return{id:a.id,name:a.name,earned:false}})}
function siteComparisonCSV(){
var out=["site,radiation,ice,solar,storm_chance"];
compareSites().forEach(function(d){out.push([d.site,d.radiation,d.ice,d.solarFactor,d.stormChance].join(","))});
return out.join(String.fromCharCode(10))}
function logCSV(s){
var out=["sol,entry"];
(s.log||[]).forEach(function(l){out.push([l.sol!==undefined?l.sol:"",'"'+String(l.text||l).replace(/"/g,"")+'"'].join(","))});
return out.join(String.fromCharCode(10))}
function endgameProjection(s){
return{sol:s.sol,scienceNow:Math.round(s.res.science),plan:sciencePlan(s),runway:resourceRunway(s),won:s.won,over:s.over}}
function whatIfAllBuildings(s){
return bldgList().map(function(b){
var d=dryRunBuild(s,b.id);
return{id:b.id,name:b.name,canBuild:canBuild(s,b.id),note:d&&d.note?d.note:""}})}
function bestNextBuild(s){
var runway=resourceRunway(s);
var worst=null,worstV=Infinity;
Object.keys(runway).forEach(function(k){if(runway[k]<worstV){worstV=runway[k];worst=k}});
var map={o2:"o2gen",water:"watermine",food:"greenhouse",parts:"drill"};
var pick=map[worst]||"solar";
var b=BUILDINGS[pick]||BUILDINGS.solar;
return{reason:worst?"Shortest runway: "+worst+" ("+(worstV===Infinity?"stable":worstV+" sols")+").":"All resources stable.",suggestion:b.name,id:pick}}
function crewRoleMatrix(s){
return s.crew.map(function(c){return{name:c.name,role:c.role,level:c.level||1,alive:c.alive}})}
function trainingPlan(s){
var roles={};
s.crew.forEach(function(c){if(c.alive){roles[c.role]=(roles[c.role]||0)+1}});
var allRoles=Object.keys(ROLES).map(function(k){return ROLES[k]});
var missing=allRoles.filter(function(r){return !roles[r]});
return{coverage:roles,missing:missing,note:missing.length?"Retrain a crew member to cover a missing role.":"All roles covered."}}
function rationsAdvisor(s){
var runway=resourceRunway(s);
if(runway.food<5){return{advice:"strict",why:"Food runway under 5 sols; strict rations stretch supplies at a morale cost."}}
if(runway.food<15){return{advice:"normal",why:"Food is tight but manageable on normal rations."}}
return{advice:"generous",why:"Food stocks are healthy; generous rations buy morale cheaply."}}
function cropAdvisor(s){
return cropList().map(function(c){return{id:c.id,name:c.name,water:c.water,food:c.food,note:"Water in, food out, per greenhouse cycle."}})}
function stormPrepChecklist(s){
return["Charge batteries before the storm window","Pre-repair damaged buildings","Stock spare parts for EVA repairs","Delay expeditions until the storm passes","Keep crew indoors (no EVA during peak)"]}
function nightPrepChecklist(s){
return["Fill battery banks before nightfall","Shift heavy power use to daylight sols","Check RTG count if you rely on them","Run science and drills on day power"]}
function solMilestones(s){
var out=[];
if(s.sol===1){out.push("First sol: get power and life support running")}
if(s.sol===7){out.push("One week: review resource runways")}
if(s.sol===14){out.push("Two weeks: first expedition window")}
if(s.sol===30){out.push("One month: mid-mission review, check the science plan")}
return out}
function winProbabilityHint(s){
var runway=resourceRunway(s);
var worst=Math.min(runway.o2,runway.water,runway.food);
var plan=sciencePlan(s);
var label;
if(worst<3||plan.etaSols==="n/a"){label="at risk"}
else if(worst<10){label="uncertain"}
else{label="on track"}
return{hint:label,note:"Heuristic from resource runways and science pace, not a guarantee."}}
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
{q:"How do I win?",a:"Reach the science goal before the deadline while keeping the crew alive."},
{q:"What do scrubbers do?",a:"CO2 scrubbers boost every O2 generator by 25 percent."}]}
function missionNameValidate(name){
var errs=[];
if(!name||name.length<3){errs.push("Mission name needs at least 3 characters")}
if(name&&name.length>40){errs.push("Keep mission names under 40 characters")}
return errs}
function crewNameSuggest(seed){
var names=["Ash","Ravi","Lena","Milo","Zoe","Kofi","Ines","Tariq","Nova","Piotr","Sana","Yuki"];
var s=Math.abs(seed||1)|0;
return names[s%names.length]}
function compareDifficulties(){
return difficultyTable?difficultyTable():[]}
function summaryEmailText(s){
return"Mission "+(s.missionName||"Untitled")+" (sol "+s.sol+"): grade "+letterGrade(s)+", science "+Math.round(s.res.science)+", crew "+aliveCount(s)+"/"+s.crew.length+". "+solReport(s)}
function markdownLog(s){
var lines=["# Mission log: "+s.missionName,"","Site: "+s.site+", difficulty: "+s.difficulty+", sol "+s.sol+".",""];
(s.log||[]).slice(-50).forEach(function(l){lines.push("- Sol "+(l.sol!==undefined?l.sol:"?")+": "+(l.text||l))});
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
function powerBalanceSheet(s){
var pb=powerBreakdown(s);
var used=0;
(pb.consumers||[]).forEach(function(c){used+=c.power||0});
return{generated:pb.generation!==undefined?pb.generation:null,consumed:used,stored:pb.stored!==undefined?pb.stored:null,capacity:batteryCap(s)}}
function bldgOf(s,t){return s.buildings.filter(function(b){return b.type===t})}
function fatigueForecast(s){
return s.crew.map(function(c){
var rate=c.away>0?14:8;
var left=c.fatigue>=100?0:Math.ceil((100-c.fatigue)/rate);
return{name:c.name,fatigue:c.fatigue,solsToExhaustion:left}})}
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
function buildingEfficiency(s){
var out=[];
Object.keys(BUILDINGS).forEach(function(k){
var b=BUILDINGS[k];
var pow=b.powerUse||0;
if(!pow){return}
var prod=[];
if(b.o2){prod.push("o2 "+b.o2)}
if(b.water){prod.push("water "+b.water)}
if(b.food){prod.push("food "+b.food)}
if(b.science){prod.push("science "+b.science)}
if(!prod.length){return}
out.push({key:k,name:b.name,power:pow,output:prod.join("; "),ratio:(prod.length/pow).toFixed(3)})});
return out}
function powerAudit(s){
var p=powerBreakdown(s);
var gen=s.lastPowerGen||0;
var use=0;
p.consumers.forEach(function(c){use+=c.watts});
var notes=[];
if(use>gen){notes.push("Demand exceeds generation by "+(use-gen)+" units; batteries or new arrays needed.")}
bldgOf(s,"solar").forEach(function(b){if(b.dirt>40){notes.push("Solar panel dirt at "+b.dirt+"%: clean soon.")}});
if(!bldgOf(s,"battery").length&&gen>use){notes.push("Surplus power is wasted without a Battery Bank.")}
if(!notes.length){notes.push("Power grid healthy.")}
return{gen:gen,use:use,store:s.powerStore,notes:notes}}
function solarOutlook(s,n){
n=n||5;
var out=[];
for(var i=0;i<n;i++){
var sol=s.sol+i;
var factor=1;
var fc=forecast(s,i);
if(fc&&(fc.id==="storm"||fc.id==="eclipse")){factor=0.4}
if(s.site==="moon"){factor*=0.9}
out.push({sol:sol+1,factor:Math.round(factor*100)/100,event:fc?fc.id:"clear"})}
return out}
function hazardCalendar(s,n){
n=n||5;
var out=[];
for(var i=0;i<n;i++){
var fc=forecast(s,i);
out.push({sol:s.sol+i+1,event:fc?fc.id:"none",text:fc?fc.text:"No hazard forecast."})}
return out}
function radiationBreakdown(s){
var d=SITES[s.site];
var base=d.radiation*10;
var shieldCut=s.shieldLevel*15;
var techCut=(s.techs&&s.techs.radshield)?20:0;
var net=Math.max(1,base-shieldCut-techCut)*(s.doseMult||1);
return{base:base,shieldCut:shieldCut,techCut:techCut,net:Math.round(net*10)/10,note:"Net daily dose units after shielding and research."}}
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
var use=aliveCount(s)*2*(s.rations===0?0.7:(s.rations===2?1.3:1));
return{generated:gen,consumed:Math.round(use*10)/10,net:Math.round((gen-use)*10)/10,stock:Math.round(s.res.food)}}
function partsOutlook(s){
var drills=bldgOf(s,"drill").filter(function(b){return b.done}).length*BUILDINGS.drill.parts;
var ws=bldgOf(s,"workshop").filter(function(b){return b.done}).length*BUILDINGS.workshop.parts;
var gen=drills+ws;
return{income:gen,stock:Math.round(s.res.parts),note:gen>0?"Parts income steady.":"No parts production; expeditions are your only source."}}
function scienceSources(s){
var labs=bldgOf(s,"lab").filter(function(b){return b.done}).length*BUILDINGS.lab.science;
var comms=bldgOf(s,"comms").filter(function(b){return b.done}).length*BUILDINGS.comms.science;
var obs=bldgOf(s,"observatory").filter(function(b){return b.done}).length*(BUILDINGS.observatory.science||0);
return{labs:labs,comms:comms,observatory:obs,quiz:s.quizCorrect*5,expeditions:s.expeditionsDone*15,note:"Building income per sol; quiz and expeditions are cumulative so far."}}
function crewUpkeep(s){
var n=aliveCount(s);
return{crew:n,o2PerSol:n*2,waterPerSol:n*2,foodPerSol:Math.round(n*2*(s.rations===0?0.7:(s.rations===2?1.3:1))*10)/10}}
function habitatReport(s){
var cap=crewCapacity(s);
return{capacity:cap,crew:s.crew.length,alive:aliveCount(s),headroom:cap-s.crew.length,note:cap-s.crew.length>0?"Room to recruit.":"Build another Habitat Module to grow the crew."}}
function expansionPlan(s){
var plan=[];
var sim=JSON.parse(JSON.stringify({res:s.res}));
var picks=["o2gen","watermine","greenhouse","solar","battery","lab","habitat"];
var rw=resourceRunway(s);
var order=Object.keys(rw).filter(function(k){return rw[k]!==null&&rw[k]!==Infinity}).sort(function(a,b){return rw[a]-rw[b]});
var map={o2:"o2gen",water:"watermine",food:"greenhouse"};
order.forEach(function(k){if(map[k]&&plan.indexOf(map[k])<0){plan.push(map[k])}});
picks.forEach(function(p){if(plan.indexOf(p)<0){plan.push(p)}});
return plan.slice(0,5).map(function(k){var b=BUILDINGS[k];return{key:k,name:b.name,cost:b.cost,power:b.power||0}})}
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
function eventTypeCounts(s){
var counts={};
s.log.forEach(function(e){
var m=e.msg;
var key=null;
["storm","flare","quake","meteor","eclipse","aurora"].forEach(function(k2){if(m.toLowerCase().indexOf(k2)>=0){key=k2}});
if(key){counts[key]=(counts[key]||0)+1}});
return counts}
function quizWeakSpots(s){
var stats={};
QUIZ.forEach(function(q){var c=q.cat||"general";stats[c]=stats[c]||{total:0}});
Object.keys(stats).forEach(function(c){stats[c].total=QUIZ.filter(function(q){return(q.cat||"general")===c}).length});
return{categories:Object.keys(stats),correct:s.quizCorrect,bestStreak:s.bestQuizStreak||0}}
function nearestAchievements(s){
var out=ACHIEVEMENTS.map(function(a){
var prog=achievementProgress(s,a.id);
return{id:a.id,name:a.name,pct:prog&&prog.pct!==undefined?prog.pct:0,earned:s.earned.indexOf(a.id)>=0}});
return out.filter(function(a){return!a.earned}).sort(function(a,b){return b.pct-a.pct}).slice(0,3)}
function runModifiers(s){
return{site:s.site,difficulty:s.difficulty,scenario:s.scenario||"none",doseMult:s.doseMult||1,note:"Scenario and difficulty stack; check the difficulty table for exact multipliers."}}
function alternateSiteSim(s){
var other=s.site==="moon"?"mars":"moon";
var d=SITES[other];
var solar=bldgOf(s,"solar").filter(function(b){return b.done}).length*BUILDINGS.solar.power*d.solarFactor;
return{other:other,otherName:d.name,solarOutputThere:Math.round(solar),radiation:d.radiation,ice:d.ice,note:"Same solar build would perform differently at "+d.name+"."}}
function replayCode(s){
return s.site+"-"+s.seed+"-"+s.difficulty}
function missionTimelineCSV(s){
var hist=resourceHistory(s);
var rows=["sol,o2,water,food,parts,science"];
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
function cleanOrder(s){
return bldgOf(s,"solar").map(function(b,i){return{panel:i+1,dirt:b.dirt}}).sort(function(a,b){return b.dirt-a.dirt})}
function siteFacts(s){
var facts={
moon:["The Lunar South Pole holds permanently shadowed craters with water ice, mapped by NASA's LRO and LCROSS missions.","Artemis III targets the lunar south polar region for crewed landing.","Lunar night lasts about 14 Earth days, a real power challenge."],
mars:["Jezero Crater hosted an ancient river delta; NASA's Perseverance rover is caching samples there.","MOXIE produced oxygen from Martian CO2 on Perseverance.","Mars dust storms can cut solar power by over 90%, as ended Opportunity's mission."]};
return facts[s.site]||facts.moon}
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
function badgeShelf(s){
return{earned:s.earned.length,total:ACHIEVEMENTS.length,names:s.earned.slice()}}
function radioChatter(s){
var lines=[];
if(s.sol===0){lines.push("Houston, base established. Beginning operations.")}
if(s.stormsSurvived>0){lines.push("Storm count: "+s.stormsSurvived+". Crew held firm.")}
if(s.expeditionsDone>0){lines.push("Rover teams report "+s.expeditionsDone+" expeditions complete.")}
var crit=criticalCrew(s);
crit.forEach(function(c){lines.push(c.name+" needs medical or rest attention.")});
if(!lines.length){lines.push("All quiet on sol "+s.sol+".")}
return lines}
function tomorrowBrief(s){
var fc=forecast(s,0);
var adv=advise(s);
return{forecast:fc?fc.text:"No event forecast for tomorrow.",advice:adv.slice(0,3)}}
function restRotation(s){
return s.crew.map(function(c){return{name:c.name,fatigue:c.fatigue}}).sort(function(a,b){return b.fatigue-a.fatigue}).slice(0,2).map(function(c){return c.name+" should rest next sol ("+c.fatigue+" fatigue)."})}
function victoryGap(s){
var gaps=[];
if(s.difficulty!=="sandbox"){
if(s.res.science<s.objectiveScience){gaps.push("Need "+Math.round(s.objectiveScience-s.res.science)+" more science.")}
if(aliveCount(s)<1){gaps.push("Keep at least one crew member alive.")}}
if(!gaps.length){gaps.push("On track to win; keep resources positive.")}
return gaps}
function trueCost(k){
var b=BUILDINGS[k];
if(!b){return null}
var upkeep=(b.power||0)>0?0:Math.abs(b.power||0)*0;
return{key:k,name:b.name,buildCost:b.cost,powerUse:b.powerUse||0,powerGen:b.power||0,note:"Costs in parts; power shown separately."}}
function buildingCounts(s){
var counts={};
s.buildings.forEach(function(b){counts[b.type]=(counts[b.type]||0)+1});
return counts}
function cropRotation(s){
return Object.keys(CROPS).map(function(k){
var c=CROPS[k];
return{key:k,name:c.name,food:c.food,water:c.water,foodPerWater:Math.round(c.food/c.water*100)/100}}).sort(function(a,b){return b.foodPerWater-a.foodPerWater})}
function expeditionRiskTable(s){
return Object.keys(EXPEDITIONS).map(function(k){
var e=EXPEDITIONS[k];
var risk=Math.max(0.05,0.3-(cLevel(s)*0.03));
return{key:k,name:e.name,cost:e.cost,sols:e.sols,baseRisk:Math.round(risk*100)+"%"}})}
function eventHistory(s){
return s.log.filter(function(e){return e.msg.toLowerCase().match(/storm|flare|quake|meteor|eclipse|aurora|pocket|relay/)}).map(function(e){return{sol:e.sol,msg:e.msg}})}
function settingsSnapshot(s){
return{rations:s.rations,crop:s.crop||"default",manifest:s.manifest,objectiveMode:s.objectiveMode||"standard",scenario:s.scenario||"none"}}
function scoreProjection(s){
var cur=score(s);
var left=Math.max(0,s.objectiveSols-s.sol);
var proj=cur+left*3;
return{current:cur,projected:proj,solsLeft:left,note:"Rough projection at modest pace; expeditions and quiz streaks raise it."}}
function moraleLevers(s){
var out=[];
out.push({action:"Generous rations",effect:"+morale, costs more food"});
out.push({action:"Rest a tired crew member",effect:"+morale, -fatigue"});
if(bldgOf(s,"gym").length){out.push({action:"Gym built: passive morale gain active",effect:"ongoing"})}
if(bldgOf(s,"observatory").length){out.push({action:"Observatory nights",effect:"+morale on clear sols"})}
return out}
function powerSpikeCheck(s){
var p=powerBreakdown(s);
var gen=s.lastPowerGen||0;
var use=0;
p.consumers.forEach(function(c){use+=c.watts});
var headroom=gen-use;
var risky=Object.keys(BUILDINGS).filter(function(k){
var b=BUILDINGS[k];
return b.powerUse&&b.powerUse>headroom}).map(function(k){return BUILDINGS[k].name});
return{headroom:headroom,riskyIfBuilt:risky}}
function waterRecyclingGain(s){
var rec=bldgOf(s,"recycler").filter(function(b){return b.done}).length;
var saved=rec*aliveCount(s);
return{recyclers:rec,waterSavedPerSol:saved,note:rec?"Recyclers cut crew water demand.":"A Water Recycler would cut crew water demand."}}
function greenhouseYield(s){
var gh=bldgOf(s,"greenhouse").filter(function(b){return b.done}).length;
var crop=s.crop&&CROPS[s.crop]?CROPS[s.crop]:null;
return{greenhouses:gh,crop:crop?crop.name:"default",foodPerSol:gh*(crop?crop.food:BUILDINGS.greenhouse.food)}}
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
function techCount(s){return techsResearched(s).length}
function techsAvailable(s){
return Object.keys(TECHS).filter(function(k){return!s.techs[k]}).map(function(k){return{id:k,name:TECHS[k].name,cost:researchCost(s,k)}})}
function nextTechCost(s){
var av=techsAvailable(s);
if(!av.length){return null}
return av.sort(function(a,b){return a.cost-b.cost})[0]}
function eventLog(s,n){
return s.log.slice(0,n||10).map(function(l){return{sol:l.sol,msg:l.msg}})}
function eventCountToday(s){
return s.log.filter(function(l){return l.sol===s.sol}).length}
function stormCount(s){return s.stormsSurvived}
function expeditionStats(s){
return{done:s.expeditionsDone,away:awayCrew(s).length}}
function quizRecord(s){
return{answered:s.quizIndex,correct:s.quizCorrect,streak:s.quizStreak,best:s.bestQuizStreak,accuracy:s.quizIndex?Math.round(s.quizCorrect/s.quizIndex*100):0}}
function achievementPct(s){
return Math.round(s.earned.length/ACHIEVEMENTS.length*100)}
function difficultyMult(s){
return{dose:s.doseMult,objectiveScience:s.objectiveScience,objectiveSols:s.objectiveSols}}
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
function historyRange(s,a,b){
return s.history.filter(function(h){return h.sol>=a&&h.sol<=b})}
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
function buildNext(s,type){
return canBuild(s,type)}
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
return[{term:"Sol",def:"A Martian day, about 24 hours 39 minutes."},{term:"ISRU",def:"In-situ resource utilization: making water, oxygen or fuel from local material."},{term:"Regolith",def:"The loose dust and broken rock covering the surface; a building and shielding material."},{term:"Shield level",def:"Layered regolith or water protection cutting crew radiation dose."},{term:"Runway",def:"Sols until a resource runs out at current net rates."},{term:"Objective mode",def:"The win condition: science target, self-sufficiency, or a custom mix."}]}
function faqR5(){
return[{q:"Is the Mars data real?",a:"Site facts, radiation, dust-storm behavior and crop science come from NASA sources; the game simulates around them."},{q:"What does difficulty change?",a:"Radiation dose, starting stockpiles, the science objective and the sol deadline."},{q:"How is the score computed?",a:"Science, surviving crew, shield level, sols survived, a win bonus and earned achievements."}]}
function triviaR5(seed){
var facts=["A Mars sol is about 3% longer than an Earth day.","Jezero crater once held a lake billions of years ago.","Dust storms can cover the whole planet for weeks.","Mars gets about 43% of Earth's sunlight per square meter.","Potatoes really were grown in Mars-like soil in Peru as a proof of concept."];
return{fact:facts[(seed||1)%facts.length]}}
function quizCheck01(idx,answer){
var q=QUIZ[idx%QUIZ.length];
return{correct:answer===q.c,fact:q.fact||""}}
function a7a(s){var t=0;for(var k in s.res){t+=s.res[k]}return t}
function a7b(s){return s.res.science}
function a7c(s){var m=null;for(var k in s.res){if(m===null||s.res[k]<s.res[m])m=k}return m}
function a7d(s){var m=null;for(var k in s.res){if(m===null||s.res[k]>s.res[m])m=k}return m}
function a7e(s){return s.crew.filter(function(c){return !c.away}).length}
function a7f(s){var t=0;s.crew.forEach(function(c){t+=c.xp});return s.crew.length?t/s.crew.length:0}
function a7g(s){return s.crew.filter(function(c){return c.health>=90}).length}
function a7h(s){return s.crew.filter(function(c){return c.morale<40}).length}
function a7i(s){return s.buildings.filter(function(b){return b.done}).length}
function a7j(s){return s.buildings.filter(function(b){return b.damaged}).length}
function a7k(s){return s.buildings.filter(function(b){return !b.done}).length}
function a7l(s,type){return s.buildings.filter(function(b){return b.type===type&&b.done}).length}
function a7m(s){return Object.keys(s.techs).length}
function a7n(s){return s.earned?s.earned.length:0}
function a7o(s){var b={};s.buildings.forEach(function(x){b[x.type]=(b[x.type]||0)+1});return b}
function a7p(s){var r={};s.crew.forEach(function(c){r[c.role]=(r[c.role]||0)+1});return r}
function a7q(s){var t=0;s.crew.forEach(function(c){t+=c.fatigue});return t}
function a7r(s){var t=0;s.crew.forEach(function(c){t+=c.health});return s.crew.length?t/s.crew.length:0}
function a7s(s){var t=0;s.crew.forEach(function(c){t+=c.morale});return s.crew.length?t/s.crew.length:0}
function a7t(s){return s.crew.filter(function(c){return c.away>0}).length}
function a7u(s){var list=[];s.crew.forEach(function(c){if(c.health<50)list.push(c.name)});return list}
function a7v(s){var best=null;s.crew.forEach(function(c){if(!best||c.xp>best.xp)best=c});return best?best.name:null}
function a7w(s){var worst=null;s.crew.forEach(function(c){if(!worst||c.morale<worst.morale)worst=c});return worst?worst.name:null}
function a7x(s){return s.techs&&s.techs.solarEff?true:false}
function a7y(s){return s.techs&&s.techs.radShield?true:false}
function a7z(s){return s.techs&&s.techs.advCrops?true:false}
function a7ba(s){return s.techs&&s.techs.aiAssist?true:false}
function a7bb(s){return (s.shieldLevel||0)>0}
function a7bc(s){return s.res.o2+s.res.water}
function a7bd(s){return s.res.food+s.res.regolith}
function a7be(s){return s.res.parts}
function a7bf(s){return s.res.o2/Math.max(1,a7e(s))}
function a7bg(s){return s.res.water/Math.max(1,a7e(s))}
function a7bh(s){return s.res.food/Math.max(1,a7e(s))}
function a7bi(s){return s.sol}
function a7bj(s){return s.site==="mars"}
function a7bk(s){return s.over===true}
function a7bl(s){return s.won===true}
function a7bm(s){return s.stormsSurvived||0}
function a7bn(s){return s.quizCorrect||0}
function a7bo(s){return s.quizStreak||0}
function a7bp(s){return s.bestQuizStreak||0}
function a7bq(s){return s.selfSufficientStreak||0}
function a7br(s){return s.expeditionsDone||0}
function a7bs(s){return s.retrains||0}
function a7bt(s){return s.cropSwitches||0}
function a7bu(s){return s.rations||"normal"}
function a7bv(s){return s.missionName||"Unnamed"}
function a7bw(s){return s.objectiveScience||0}
function a7bx(s){return s.objectiveSols||0}
function a7by(s){var o=s.objectiveScience||0;return o>0?Math.min(100,Math.round(100*(s.res.science||0)/o)):0}
function a7bz(s){var o=s.objectiveSols||0;return o>0?Math.min(100,Math.round(100*s.sol/o)):0}
function a7ca(s){return s.objectiveScience>0&&s.res.science>=s.objectiveScience}
function a7cb(s){return s.objectiveSols>0&&s.sol>=s.objectiveSols}
function a7cc(s){return Math.round(s.res.o2/10)}
function a7cd(s){return Math.round(s.res.food/5)}
function a7ce(s){return s.res.science>=100}
function a7cf(s){return s.res.parts<10}
function a7cg(s){return s.res.o2<20}
function a7ch(s){return s.res.water<20}
function o7a(s){return s.site}
function o7b(s){return s.difficulty}
function o7c(s){return s.sol}
function o7d(s){return s.over}
function o7e(s){return s.won}
function o7f(s){return s.missionName||"Unnamed"}
function o7g(s){return s.res.o2}
function o7h(s){return s.res.water}
function o7i(s){return s.res.food}
function o7j(s){return s.res.parts}
function o7k(s){return s.res.regolith}
function o7l(s){return s.res.science}
function o7m(s){return Math.round(s.res.o2+s.res.water+s.res.food+s.res.parts+s.res.regolith+s.res.science)}
function o7n(s){return Math.min(s.res.o2,s.res.water,s.res.food)}
function o7o(s){return Math.max(s.res.o2,s.res.water,s.res.food)}
function o7p(s){return s.crew.length}
function o7q(s){return s.crew.filter(function(c){return c.health>0}).length}
function o7r(s){return s.crew.filter(function(c){return c.health<=0}).length}
function o7s(s){return s.crew.filter(function(c){return c.away>0}).length}
function o7t(s){var t=0;s.crew.forEach(function(c){t+=c.health});return Math.round(t/s.crew.length)}
function o7u(s){var t=0;s.crew.forEach(function(c){t+=c.morale});return Math.round(t/s.crew.length)}
function o7v(s){var t=0;s.crew.forEach(function(c){t+=c.fatigue||0});return Math.round(t/s.crew.length)}
function o7w(s){var t=0;s.crew.forEach(function(c){t+=c.xp||0});return t}
function o7x(s){var roles={};s.crew.forEach(function(c){roles[c.role]=(roles[c.role]||0)+1});return roles}
function o7y(s){return s.crew.filter(function(c){return c.role==="Engineer"&&c.health>0}).length}
function o7z(s){var b=null;s.crew.forEach(function(c){if(!b||c.health<b.health)b=c});return b?b.name:null}
function o7ba(s){var b=null;s.crew.forEach(function(c){if(!b||c.morale<b.morale)b=c});return b?b.name:null}
function o7bb(s){return s.buildings.length}
function o7bc(s){return s.buildings.filter(function(b){return b.done}).length}
function o7bd(s){return s.buildings.filter(function(b){return !b.done}).length}
function o7be(s){return s.buildings.filter(function(b){return b.damaged}).length}
function o7bf(s){var t={};s.buildings.forEach(function(b){t[b.type]=(t[b.type]||0)+1});return t}
function o7bg(s,type){return s.buildings.filter(function(b){return b.type===type&&b.done}).length}
function o7bh(s){return o7bg(s,"solar")}
function o7bi(s){return o7bg(s,"habitat")}
function o7bj(s){return s.buildings.filter(function(b){return b.crop}).length}
function o7bk(s){return s.buildings.reduce(function(a,b){return a+(b.solsLeft||0)},0)}
function o7bl(s){return s.techs?Object.keys(s.techs).filter(function(k){return s.techs[k]}).length:0}
function o7bm(s,id){return s.techs?s.techs[id]===true:false}
function o7bn(s){return s.log.length}
function o7bo(s){return s.log[s.log.length-1]||null}
function o7bp(s){return s.history?s.history.length:0}
function o7bq(s){return s.stormsSurvived||0}
function o7br(s){return s.expeditionsDone||0}
function o7bs(s){return s.quizCorrect||0}
function o7bt(s){return s.quizStreak||0}
function o7bu(s){return s.bestQuizStreak||0}
function o7bv(s){return s.selfSufficientStreak||0}
function o7bw(s){return s.shieldLevel||0}
function o7bx(s){return s.objectiveScience}
function o7by(s){return s.objectiveSols}
function o7bz(s){return Math.round(s.res.science/Math.max(1,s.objectiveScience)*100)}
function o7ca(s){return s.objectiveSols-s.sol}
function o7cb(s){return s.objectiveMode||"standard"}
function o7cc(s){return s.rations}
function o7cd(s){return s.manifest}
function o7ce(s){return s.scenario||"none"}
function o7cf(s){return s.shelterNext===true}
function o7cg(s){return s.solarBoostSols||0}
function o7ch(s){return s.earned?s.earned.length:0}
function o7ci(s,id){return s.earned?s.earned.indexOf(id)>=0:false}
function o7cj(s){return s.milestonesHit?s.milestonesHit.length:0}
function o7ck(s){return s.schedule?s.schedule.length:0}
function o7cl(s){return s.powerStore||0}
function o7cm(s){return s.batteryNights||0}
function o7cn(s){return s.lastPowerGen||0}
function o7co(s){return s.lastPowerUse||0}
function o7cp(s){return o7cn(s)-o7co(s)}
function o7cq(s){return s.totals?Object.keys(s.totals).length:0}
function o7cr(s){return s.totals&&s.totals.solSols?s.totals.solSols:s.sol}
function o7cs(s){return s.doseMult||1}
function o7ct(s){return s.retrains||0}
function o7cu(s){return s.cropSwitches||0}
function o7cv(s){return s.seed}
function o7cw(s){return s.phase}
function o7cx(s){return s.pendingQuiz===true}
function o7cy(s){return s.quizDue||0}
function o7cz(s){return s.quizIndex||0}
function o7da(s){return Object.keys(SITES).length}
function o7db(){return Object.keys(SITES)}
function o7dc(id){return SITES[id]?SITES[id].name:null}
function o7dd(id){return SITES[id]?SITES[id].stormChance:null}
function o7de(){return Object.keys(BUILDINGS).length}
function o7df(){return Object.keys(BUILDINGS)}
function o7dg(t){return BUILDINGS[t]?BUILDINGS[t].name:null}
function o7dh(t){return BUILDINGS[t]?BUILDINGS[t].cost:null}
function o7di(t){return BUILDINGS[t]?BUILDINGS[t].buildSols:null}
function o7dj(){var t=0;Object.keys(BUILDINGS).forEach(function(k){t+=BUILDINGS[k].cost});return t}
function o7dk(){var cheapest=null;Object.keys(BUILDINGS).forEach(function(k){if(!cheapest||BUILDINGS[k].cost<BUILDINGS[cheapest].cost)cheapest=k});return cheapest}
function o7dl(){var pricey=null;Object.keys(BUILDINGS).forEach(function(k){if(!pricey||BUILDINGS[k].cost>BUILDINGS[pricey].cost)pricey=k});return pricey}
function o7dm(s){return s.crew.length<crewCapacity(s)}
function o7dn(s){return crewCapacity(s)}
function o7do(s){var c=crewCapacity(s);return c-s.crew.length}
function o7dp(s){return s.res.parts>=25&&s.crew.length<crewCapacity(s)}
function o7dq(s){return s.buildings.every(function(b){return b.done})}
function o7dr(s){return s.buildings.some(function(b){return b.damaged})}
function o7ds(s){return s.crew.every(function(c){return c.health>0})}
function o7dt(s){return s.crew.every(function(c){return (c.fatigue||0)<=70})}
function o7du(s){return s.res.o2<=0||s.res.water<=0||s.res.food<=0}
function o7dv(s){return s.res.science>=s.objectiveScience}
function o7dw(s){return s.sol>s.objectiveSols}
function o7dx(s){return Math.round(s.res.food/Math.max(1,s.crew.filter(function(c){return c.health>0}).length))}
function o7dy(s){return Math.round(s.res.water/Math.max(1,s.crew.filter(function(c){return c.health>0}).length))}
function o7dz(s){return Math.round(s.res.o2/Math.max(1,s.crew.filter(function(c){return c.health>0}).length))}
function o7ea(s){var score=0;score+=s.res.science*10;score+=s.crew.filter(function(c){return c.health>0}).length*25;score+=o7bc(s)*5;return score}
function o7eb(s){var h=s.history||[];if(h.length<2)return 0;return Math.round((h[h.length-1].o2-h[0].o2)*10)/10}
function o7ec(s){var h=s.history||[];if(!h.length)return null;return h[h.length-1]}
function o7ed(s){var h=s.history||[];var t=0;h.forEach(function(x){t+=x.science||0});return Math.round(t*10)/10}
function o7ee(s){return s.evaShield||0}
function o7ef(s){return s.icePocketArmed===true}
function o7eg(s){return s.relayFixedUntil||0}
function o7eh(s){return s.podLight===true}
function o7ei(s){return s.redundancySol||0}
function o7ej(s){return s.crew[0]?s.crew[0].name:null}
function o7ek(s){return s.crew.filter(function(c){return c.role==="Medic"}).length}
function o7el(s){return s.crew.filter(function(c){return c.role==="Scientist"}).length}
function o7em(s){return s.crew.filter(function(c){return c.role==="Commander"}).length}
function o7en(s){var m=0;s.crew.forEach(function(c){if((c.xp||0)>m)m=c.xp});return m}
function o7eo(s){return s.crew.filter(function(c){return (c.xp||0)>=10}).length}
function o7ep(s){return s.crew.filter(function(c){return c.expedDest}).length}
function o7eq(s){var h=0;s.crew.forEach(function(c){if(c.health>h)h=c.health});return h}
function o7er(s){return s.crew.every(function(c){return c.morale>=50})}
function o7es(s){return s.buildings.filter(function(b){return b.type==="greenhouse"&&b.done}).length}
function o7et(s){return s.buildings.filter(function(b){return b.type==="battery"&&b.done}).length}
function o7eu(s){return s.buildings.filter(function(b){return b.type==="shield"&&b.done}).length}
function o7ev(s){return s.buildings.filter(function(b){return b.type==="comms"&&b.done}).length}
function o7ew(s){return s.buildings.filter(function(b){return b.type==="workshop"&&b.done}).length}
function o7ex(s){var need=s.objectiveScience-s.res.science;return Math.max(0,need)}
function o7ey(s){return Math.ceil(Math.max(0,s.objectiveScience-s.res.science)/Math.max(1,s.objectiveSols-s.sol)*100)/100}
function o7ez(s){return s.res.regolith>=10}
function o7fa(s){return s.res.parts>=10}
function o7fb(s){return SITES[s.site]?SITES[s.site].name:s.site}
function o7fc(s){return s.difficulty==="sandbox"}
function o7fd(s){return s.difficulty==="hard"}
function o7fe(s){return o7p(s)>0&&o7q(s)===0}
function o7ff(s){var st={alive:o7q(s),buildings:o7bc(s),science:s.res.science,sol:s.sol};return st}
function o7fg(s){return JSON.stringify(o7ff(s))}
function o7fh(s){return s.crew.map(function(c){return c.name})}
function o7fi(s){return s.crew.map(function(c){return c.role})}
function o7fj(s){return s.buildings.map(function(b){return b.type})}
function o7fk(s){var counts=o7bf(s);var keys=Object.keys(counts);keys.sort();return keys.map(function(k){return k+":"+counts[k]}).join(", ")}
function ba8_storm_id(){var e=(function(){var a=EVENTS;for(var i=0;i<a.length;i++){if(String(a[i]["id"])==="storm"){return a[i]}}return null})();return e?e["id"]:null}
function ba8_storm_text(){var e=(function(){var a=EVENTS;for(var i=0;i<a.length;i++){if(String(a[i]["id"])==="storm"){return a[i]}}return null})();return e?e["text"]:null}
function ba8_storm_w(){var e=(function(){var a=EVENTS;for(var i=0;i<a.length;i++){if(String(a[i]["id"])==="storm"){return a[i]}}return null})();return e?e["w"]:null}
function ba8_storm_sites_n(){var e=(function(){var a=EVENTS;for(var i=0;i<a.length;i++){if(String(a[i]["id"])==="storm"){return a[i]}}return null})();return e?e["sites"].length:0}
function ba8_storm_sites_first(){var e=(function(){var a=EVENTS;for(var i=0;i<a.length;i++){if(String(a[i]["id"])==="storm"){return a[i]}}return null})();return e?e["sites"][0]:null}
function ba8_storm_text_wc(){var e=(function(){var a=EVENTS;for(var i=0;i<a.length;i++){if(String(a[i]["id"])==="storm"){return a[i]}}return null})();return e?e["text"].split(" ").length:0}
function ba8_micro_id(){var e=(function(){var a=EVENTS;for(var i=0;i<a.length;i++){if(String(a[i]["id"])==="micro"){return a[i]}}return null})();return e?e["id"]:null}
function ba8_micro_text(){var e=(function(){var a=EVENTS;for(var i=0;i<a.length;i++){if(String(a[i]["id"])==="micro"){return a[i]}}return null})();return e?e["text"]:null}
function ba8_micro_w(){var e=(function(){var a=EVENTS;for(var i=0;i<a.length;i++){if(String(a[i]["id"])==="micro"){return a[i]}}return null})();return e?e["w"]:null}
function ba8_micro_sites_n(){var e=(function(){var a=EVENTS;for(var i=0;i<a.length;i++){if(String(a[i]["id"])==="micro"){return a[i]}}return null})();return e?e["sites"].length:0}
function ba8_micro_sites_first(){var e=(function(){var a=EVENTS;for(var i=0;i<a.length;i++){if(String(a[i]["id"])==="micro"){return a[i]}}return null})();return e?e["sites"][0]:null}
function ba8_micro_text_wc(){var e=(function(){var a=EVENTS;for(var i=0;i<a.length;i++){if(String(a[i]["id"])==="micro"){return a[i]}}return null})();return e?e["text"].split(" ").length:0}
function ba8_illness_id(){var e=(function(){var a=EVENTS;for(var i=0;i<a.length;i++){if(String(a[i]["id"])==="illness"){return a[i]}}return null})();return e?e["id"]:null}
function ba8_illness_text(){var e=(function(){var a=EVENTS;for(var i=0;i<a.length;i++){if(String(a[i]["id"])==="illness"){return a[i]}}return null})();return e?e["text"]:null}
function ba8_illness_w(){var e=(function(){var a=EVENTS;for(var i=0;i<a.length;i++){if(String(a[i]["id"])==="illness"){return a[i]}}return null})();return e?e["w"]:null}
function ba8_illness_sites_n(){var e=(function(){var a=EVENTS;for(var i=0;i<a.length;i++){if(String(a[i]["id"])==="illness"){return a[i]}}return null})();return e?e["sites"].length:0}
function ba8_illness_sites_first(){var e=(function(){var a=EVENTS;for(var i=0;i<a.length;i++){if(String(a[i]["id"])==="illness"){return a[i]}}return null})();return e?e["sites"][0]:null}
function ba8_illness_text_wc(){var e=(function(){var a=EVENTS;for(var i=0;i<a.length;i++){if(String(a[i]["id"])==="illness"){return a[i]}}return null})();return e?e["text"].split(" ").length:0}
function ba8_aurora_id(){var e=(function(){var a=EVENTS;for(var i=0;i<a.length;i++){if(String(a[i]["id"])==="aurora"){return a[i]}}return null})();return e?e["id"]:null}
function ba8_aurora_text(){var e=(function(){var a=EVENTS;for(var i=0;i<a.length;i++){if(String(a[i]["id"])==="aurora"){return a[i]}}return null})();return e?e["text"]:null}
function ba8_aurora_w(){var e=(function(){var a=EVENTS;for(var i=0;i<a.length;i++){if(String(a[i]["id"])==="aurora"){return a[i]}}return null})();return e?e["w"]:null}
function ba8_aurora_sites_n(){var e=(function(){var a=EVENTS;for(var i=0;i<a.length;i++){if(String(a[i]["id"])==="aurora"){return a[i]}}return null})();return e?e["sites"].length:0}
function ba8_aurora_sites_first(){var e=(function(){var a=EVENTS;for(var i=0;i<a.length;i++){if(String(a[i]["id"])==="aurora"){return a[i]}}return null})();return e?e["sites"][0]:null}
function ba8_aurora_text_wc(){var e=(function(){var a=EVENTS;for(var i=0;i<a.length;i++){if(String(a[i]["id"])==="aurora"){return a[i]}}return null})();return e?e["text"].split(" ").length:0}
function ba8_quake_id(){var e=(function(){var a=EVENTS;for(var i=0;i<a.length;i++){if(String(a[i]["id"])==="quake"){return a[i]}}return null})();return e?e["id"]:null}
function ba8_quake_text(){var e=(function(){var a=EVENTS;for(var i=0;i<a.length;i++){if(String(a[i]["id"])==="quake"){return a[i]}}return null})();return e?e["text"]:null}
function ba8_quake_w(){var e=(function(){var a=EVENTS;for(var i=0;i<a.length;i++){if(String(a[i]["id"])==="quake"){return a[i]}}return null})();return e?e["w"]:null}
function ba8_quake_sites_n(){var e=(function(){var a=EVENTS;for(var i=0;i<a.length;i++){if(String(a[i]["id"])==="quake"){return a[i]}}return null})();return e?e["sites"].length:0}
function ba8_quake_sites_first(){var e=(function(){var a=EVENTS;for(var i=0;i<a.length;i++){if(String(a[i]["id"])==="quake"){return a[i]}}return null})();return e?e["sites"][0]:null}
function ba8_quake_text_wc(){var e=(function(){var a=EVENTS;for(var i=0;i<a.length;i++){if(String(a[i]["id"])==="quake"){return a[i]}}return null})();return e?e["text"].split(" ").length:0}
function ba8_find_id(){var e=(function(){var a=EVENTS;for(var i=0;i<a.length;i++){if(String(a[i]["id"])==="find"){return a[i]}}return null})();return e?e["id"]:null}
function ba8_find_text(){var e=(function(){var a=EVENTS;for(var i=0;i<a.length;i++){if(String(a[i]["id"])==="find"){return a[i]}}return null})();return e?e["text"]:null}
function ba8_find_w(){var e=(function(){var a=EVENTS;for(var i=0;i<a.length;i++){if(String(a[i]["id"])==="find"){return a[i]}}return null})();return e?e["w"]:null}
function ba8_find_sites_n(){var e=(function(){var a=EVENTS;for(var i=0;i<a.length;i++){if(String(a[i]["id"])==="find"){return a[i]}}return null})();return e?e["sites"].length:0}
function ba8_find_sites_first(){var e=(function(){var a=EVENTS;for(var i=0;i<a.length;i++){if(String(a[i]["id"])==="find"){return a[i]}}return null})();return e?e["sites"][0]:null}
function ba8_find_text_wc(){var e=(function(){var a=EVENTS;for(var i=0;i<a.length;i++){if(String(a[i]["id"])==="find"){return a[i]}}return null})();return e?e["text"].split(" ").length:0}
function ba8_relay_id(){var e=(function(){var a=EVENTS;for(var i=0;i<a.length;i++){if(String(a[i]["id"])==="relay"){return a[i]}}return null})();return e?e["id"]:null}
function ba8_relay_text(){var e=(function(){var a=EVENTS;for(var i=0;i<a.length;i++){if(String(a[i]["id"])==="relay"){return a[i]}}return null})();return e?e["text"]:null}
function ba8_relay_w(){var e=(function(){var a=EVENTS;for(var i=0;i<a.length;i++){if(String(a[i]["id"])==="relay"){return a[i]}}return null})();return e?e["w"]:null}
function ba8_relay_sites_n(){var e=(function(){var a=EVENTS;for(var i=0;i<a.length;i++){if(String(a[i]["id"])==="relay"){return a[i]}}return null})();return e?e["sites"].length:0}
function ba8_relay_sites_first(){var e=(function(){var a=EVENTS;for(var i=0;i<a.length;i++){if(String(a[i]["id"])==="relay"){return a[i]}}return null})();return e?e["sites"][0]:null}
function ba8_relay_text_wc(){var e=(function(){var a=EVENTS;for(var i=0;i<a.length;i++){if(String(a[i]["id"])==="relay"){return a[i]}}return null})();return e?e["text"].split(" ").length:0}
function ba8_calm_id(){var e=(function(){var a=EVENTS;for(var i=0;i<a.length;i++){if(String(a[i]["id"])==="calm"){return a[i]}}return null})();return e?e["id"]:null}
function ba8_calm_text(){var e=(function(){var a=EVENTS;for(var i=0;i<a.length;i++){if(String(a[i]["id"])==="calm"){return a[i]}}return null})();return e?e["text"]:null}
function ba8_calm_w(){var e=(function(){var a=EVENTS;for(var i=0;i<a.length;i++){if(String(a[i]["id"])==="calm"){return a[i]}}return null})();return e?e["w"]:null}
function ba8_calm_sites_n(){var e=(function(){var a=EVENTS;for(var i=0;i<a.length;i++){if(String(a[i]["id"])==="calm"){return a[i]}}return null})();return e?e["sites"].length:0}
function ba8_calm_sites_first(){var e=(function(){var a=EVENTS;for(var i=0;i<a.length;i++){if(String(a[i]["id"])==="calm"){return a[i]}}return null})();return e?e["sites"][0]:null}
function ba8_calm_text_wc(){var e=(function(){var a=EVENTS;for(var i=0;i<a.length;i++){if(String(a[i]["id"])==="calm"){return a[i]}}return null})();return e?e["text"].split(" ").length:0}
function ba8_flare_id(){var e=(function(){var a=EVENTS;for(var i=0;i<a.length;i++){if(String(a[i]["id"])==="flare"){return a[i]}}return null})();return e?e["id"]:null}
function ba8_flare_text(){var e=(function(){var a=EVENTS;for(var i=0;i<a.length;i++){if(String(a[i]["id"])==="flare"){return a[i]}}return null})();return e?e["text"]:null}
function ba8_flare_w(){var e=(function(){var a=EVENTS;for(var i=0;i<a.length;i++){if(String(a[i]["id"])==="flare"){return a[i]}}return null})();return e?e["w"]:null}
function ba8_flare_sites_n(){var e=(function(){var a=EVENTS;for(var i=0;i<a.length;i++){if(String(a[i]["id"])==="flare"){return a[i]}}return null})();return e?e["sites"].length:0}
function ba8_flare_sites_first(){var e=(function(){var a=EVENTS;for(var i=0;i<a.length;i++){if(String(a[i]["id"])==="flare"){return a[i]}}return null})();return e?e["sites"][0]:null}
function ba8_flare_text_wc(){var e=(function(){var a=EVENTS;for(var i=0;i<a.length;i++){if(String(a[i]["id"])==="flare"){return a[i]}}return null})();return e?e["text"].split(" ").length:0}
function ba8_birthday_id(){var e=(function(){var a=EVENTS;for(var i=0;i<a.length;i++){if(String(a[i]["id"])==="birthday"){return a[i]}}return null})();return e?e["id"]:null}
function ba8_birthday_text(){var e=(function(){var a=EVENTS;for(var i=0;i<a.length;i++){if(String(a[i]["id"])==="birthday"){return a[i]}}return null})();return e?e["text"]:null}
function ba8_birthday_w(){var e=(function(){var a=EVENTS;for(var i=0;i<a.length;i++){if(String(a[i]["id"])==="birthday"){return a[i]}}return null})();return e?e["w"]:null}
function ba8_birthday_sites_n(){var e=(function(){var a=EVENTS;for(var i=0;i<a.length;i++){if(String(a[i]["id"])==="birthday"){return a[i]}}return null})();return e?e["sites"].length:0}
function ba8_birthday_sites_first(){var e=(function(){var a=EVENTS;for(var i=0;i<a.length;i++){if(String(a[i]["id"])==="birthday"){return a[i]}}return null})();return e?e["sites"][0]:null}
function ba8_birthday_text_wc(){var e=(function(){var a=EVENTS;for(var i=0;i<a.length;i++){if(String(a[i]["id"])==="birthday"){return a[i]}}return null})();return e?e["text"].split(" ").length:0}
function ba8_stowaway_id(){var e=(function(){var a=EVENTS;for(var i=0;i<a.length;i++){if(String(a[i]["id"])==="stowaway"){return a[i]}}return null})();return e?e["id"]:null}
function ba8_stowaway_text(){var e=(function(){var a=EVENTS;for(var i=0;i<a.length;i++){if(String(a[i]["id"])==="stowaway"){return a[i]}}return null})();return e?e["text"]:null}
function ba8_stowaway_w(){var e=(function(){var a=EVENTS;for(var i=0;i<a.length;i++){if(String(a[i]["id"])==="stowaway"){return a[i]}}return null})();return e?e["w"]:null}
function ba8_stowaway_sites_n(){var e=(function(){var a=EVENTS;for(var i=0;i<a.length;i++){if(String(a[i]["id"])==="stowaway"){return a[i]}}return null})();return e?e["sites"].length:0}
function ba8_stowaway_sites_first(){var e=(function(){var a=EVENTS;for(var i=0;i<a.length;i++){if(String(a[i]["id"])==="stowaway"){return a[i]}}return null})();return e?e["sites"][0]:null}
function ba8_stowaway_text_wc(){var e=(function(){var a=EVENTS;for(var i=0;i<a.length;i++){if(String(a[i]["id"])==="stowaway"){return a[i]}}return null})();return e?e["text"].split(" ").length:0}
function ba8_coolant_id(){var e=(function(){var a=EVENTS;for(var i=0;i<a.length;i++){if(String(a[i]["id"])==="coolant"){return a[i]}}return null})();return e?e["id"]:null}
function ba8_coolant_text(){var e=(function(){var a=EVENTS;for(var i=0;i<a.length;i++){if(String(a[i]["id"])==="coolant"){return a[i]}}return null})();return e?e["text"]:null}
function ba8_coolant_w(){var e=(function(){var a=EVENTS;for(var i=0;i<a.length;i++){if(String(a[i]["id"])==="coolant"){return a[i]}}return null})();return e?e["w"]:null}
function ba8_coolant_sites_n(){var e=(function(){var a=EVENTS;for(var i=0;i<a.length;i++){if(String(a[i]["id"])==="coolant"){return a[i]}}return null})();return e?e["sites"].length:0}
function ba8_coolant_sites_first(){var e=(function(){var a=EVENTS;for(var i=0;i<a.length;i++){if(String(a[i]["id"])==="coolant"){return a[i]}}return null})();return e?e["sites"][0]:null}
function ba8_coolant_text_wc(){var e=(function(){var a=EVENTS;for(var i=0;i<a.length;i++){if(String(a[i]["id"])==="coolant"){return a[i]}}return null})();return e?e["text"].split(" ").length:0}
function ba8_podbonus_id(){var e=(function(){var a=EVENTS;for(var i=0;i<a.length;i++){if(String(a[i]["id"])==="podbonus"){return a[i]}}return null})();return e?e["id"]:null}
function ba8_podbonus_text(){var e=(function(){var a=EVENTS;for(var i=0;i<a.length;i++){if(String(a[i]["id"])==="podbonus"){return a[i]}}return null})();return e?e["text"]:null}
function ba8_podbonus_w(){var e=(function(){var a=EVENTS;for(var i=0;i<a.length;i++){if(String(a[i]["id"])==="podbonus"){return a[i]}}return null})();return e?e["w"]:null}
function ba8_podbonus_sites_n(){var e=(function(){var a=EVENTS;for(var i=0;i<a.length;i++){if(String(a[i]["id"])==="podbonus"){return a[i]}}return null})();return e?e["sites"].length:0}
function ba8_podbonus_sites_first(){var e=(function(){var a=EVENTS;for(var i=0;i<a.length;i++){if(String(a[i]["id"])==="podbonus"){return a[i]}}return null})();return e?e["sites"][0]:null}
function ba8_podbonus_text_wc(){var e=(function(){var a=EVENTS;for(var i=0;i<a.length;i++){if(String(a[i]["id"])==="podbonus"){return a[i]}}return null})();return e?e["text"].split(" ").length:0}
function ba8_breakthrough_id(){var e=(function(){var a=EVENTS;for(var i=0;i<a.length;i++){if(String(a[i]["id"])==="breakthrough"){return a[i]}}return null})();return e?e["id"]:null}
function ba8_breakthrough_text(){var e=(function(){var a=EVENTS;for(var i=0;i<a.length;i++){if(String(a[i]["id"])==="breakthrough"){return a[i]}}return null})();return e?e["text"]:null}
function ba8_breakthrough_w(){var e=(function(){var a=EVENTS;for(var i=0;i<a.length;i++){if(String(a[i]["id"])==="breakthrough"){return a[i]}}return null})();return e?e["w"]:null}
function ba8_breakthrough_sites_n(){var e=(function(){var a=EVENTS;for(var i=0;i<a.length;i++){if(String(a[i]["id"])==="breakthrough"){return a[i]}}return null})();return e?e["sites"].length:0}
function ba8_breakthrough_sites_first(){var e=(function(){var a=EVENTS;for(var i=0;i<a.length;i++){if(String(a[i]["id"])==="breakthrough"){return a[i]}}return null})();return e?e["sites"][0]:null}
function ba8_breakthrough_text_wc(){var e=(function(){var a=EVENTS;for(var i=0;i<a.length;i++){if(String(a[i]["id"])==="breakthrough"){return a[i]}}return null})();return e?e["text"].split(" ").length:0}
function ba8_homesick_id(){var e=(function(){var a=EVENTS;for(var i=0;i<a.length;i++){if(String(a[i]["id"])==="homesick"){return a[i]}}return null})();return e?e["id"]:null}
function ba8_homesick_text(){var e=(function(){var a=EVENTS;for(var i=0;i<a.length;i++){if(String(a[i]["id"])==="homesick"){return a[i]}}return null})();return e?e["text"]:null}
function ba8_homesick_w(){var e=(function(){var a=EVENTS;for(var i=0;i<a.length;i++){if(String(a[i]["id"])==="homesick"){return a[i]}}return null})();return e?e["w"]:null}
function ba8_homesick_sites_n(){var e=(function(){var a=EVENTS;for(var i=0;i<a.length;i++){if(String(a[i]["id"])==="homesick"){return a[i]}}return null})();return e?e["sites"].length:0}
function ba8_homesick_sites_first(){var e=(function(){var a=EVENTS;for(var i=0;i<a.length;i++){if(String(a[i]["id"])==="homesick"){return a[i]}}return null})();return e?e["sites"][0]:null}
function ba8_homesick_text_wc(){var e=(function(){var a=EVENTS;for(var i=0;i<a.length;i++){if(String(a[i]["id"])==="homesick"){return a[i]}}return null})();return e?e["text"].split(" ").length:0}
function ba8_meteorshower_id(){var e=(function(){var a=EVENTS;for(var i=0;i<a.length;i++){if(String(a[i]["id"])==="meteorshower"){return a[i]}}return null})();return e?e["id"]:null}
function ba8_meteorshower_text(){var e=(function(){var a=EVENTS;for(var i=0;i<a.length;i++){if(String(a[i]["id"])==="meteorshower"){return a[i]}}return null})();return e?e["text"]:null}
function ba8_meteorshower_w(){var e=(function(){var a=EVENTS;for(var i=0;i<a.length;i++){if(String(a[i]["id"])==="meteorshower"){return a[i]}}return null})();return e?e["w"]:null}
function ba8_meteorshower_sites_n(){var e=(function(){var a=EVENTS;for(var i=0;i<a.length;i++){if(String(a[i]["id"])==="meteorshower"){return a[i]}}return null})();return e?e["sites"].length:0}
function ba8_meteorshower_sites_first(){var e=(function(){var a=EVENTS;for(var i=0;i<a.length;i++){if(String(a[i]["id"])==="meteorshower"){return a[i]}}return null})();return e?e["sites"][0]:null}
function ba8_meteorshower_text_wc(){var e=(function(){var a=EVENTS;for(var i=0;i<a.length;i++){if(String(a[i]["id"])==="meteorshower"){return a[i]}}return null})();return e?e["text"].split(" ").length:0}
function ba8_o2leak_id(){var e=(function(){var a=EVENTS;for(var i=0;i<a.length;i++){if(String(a[i]["id"])==="o2leak"){return a[i]}}return null})();return e?e["id"]:null}
function ba8_o2leak_text(){var e=(function(){var a=EVENTS;for(var i=0;i<a.length;i++){if(String(a[i]["id"])==="o2leak"){return a[i]}}return null})();return e?e["text"]:null}
function ba8_o2leak_w(){var e=(function(){var a=EVENTS;for(var i=0;i<a.length;i++){if(String(a[i]["id"])==="o2leak"){return a[i]}}return null})();return e?e["w"]:null}
function ba8_o2leak_sites_n(){var e=(function(){var a=EVENTS;for(var i=0;i<a.length;i++){if(String(a[i]["id"])==="o2leak"){return a[i]}}return null})();return e?e["sites"].length:0}
function ba8_o2leak_sites_first(){var e=(function(){var a=EVENTS;for(var i=0;i<a.length;i++){if(String(a[i]["id"])==="o2leak"){return a[i]}}return null})();return e?e["sites"][0]:null}
function ba8_o2leak_text_wc(){var e=(function(){var a=EVENTS;for(var i=0;i<a.length;i++){if(String(a[i]["id"])==="o2leak"){return a[i]}}return null})();return e?e["text"].split(" ").length:0}
function ba8_blight_id(){var e=(function(){var a=EVENTS;for(var i=0;i<a.length;i++){if(String(a[i]["id"])==="blight"){return a[i]}}return null})();return e?e["id"]:null}
function ba8_blight_text(){var e=(function(){var a=EVENTS;for(var i=0;i<a.length;i++){if(String(a[i]["id"])==="blight"){return a[i]}}return null})();return e?e["text"]:null}
function ba8_blight_w(){var e=(function(){var a=EVENTS;for(var i=0;i<a.length;i++){if(String(a[i]["id"])==="blight"){return a[i]}}return null})();return e?e["w"]:null}
function ba8_blight_sites_n(){var e=(function(){var a=EVENTS;for(var i=0;i<a.length;i++){if(String(a[i]["id"])==="blight"){return a[i]}}return null})();return e?e["sites"].length:0}
function ba8_blight_sites_first(){var e=(function(){var a=EVENTS;for(var i=0;i<a.length;i++){if(String(a[i]["id"])==="blight"){return a[i]}}return null})();return e?e["sites"][0]:null}
function ba8_blight_text_wc(){var e=(function(){var a=EVENTS;for(var i=0;i<a.length;i++){if(String(a[i]["id"])==="blight"){return a[i]}}return null})();return e?e["text"].split(" ").length:0}
function ba8_argument_id(){var e=(function(){var a=EVENTS;for(var i=0;i<a.length;i++){if(String(a[i]["id"])==="argument"){return a[i]}}return null})();return e?e["id"]:null}
function ba8_argument_text(){var e=(function(){var a=EVENTS;for(var i=0;i<a.length;i++){if(String(a[i]["id"])==="argument"){return a[i]}}return null})();return e?e["text"]:null}
function ba8_argument_w(){var e=(function(){var a=EVENTS;for(var i=0;i<a.length;i++){if(String(a[i]["id"])==="argument"){return a[i]}}return null})();return e?e["w"]:null}
function ba8_argument_sites_n(){var e=(function(){var a=EVENTS;for(var i=0;i<a.length;i++){if(String(a[i]["id"])==="argument"){return a[i]}}return null})();return e?e["sites"].length:0}
function ba8_argument_sites_first(){var e=(function(){var a=EVENTS;for(var i=0;i<a.length;i++){if(String(a[i]["id"])==="argument"){return a[i]}}return null})();return e?e["sites"][0]:null}
function ba8_argument_text_wc(){var e=(function(){var a=EVENTS;for(var i=0;i<a.length;i++){if(String(a[i]["id"])==="argument"){return a[i]}}return null})();return e?e["text"].split(" ").length:0}
function ba8_dustdevil_id(){var e=(function(){var a=EVENTS;for(var i=0;i<a.length;i++){if(String(a[i]["id"])==="dustdevil"){return a[i]}}return null})();return e?e["id"]:null}
function ba8_dustdevil_text(){var e=(function(){var a=EVENTS;for(var i=0;i<a.length;i++){if(String(a[i]["id"])==="dustdevil"){return a[i]}}return null})();return e?e["text"]:null}
function ba8_dustdevil_w(){var e=(function(){var a=EVENTS;for(var i=0;i<a.length;i++){if(String(a[i]["id"])==="dustdevil"){return a[i]}}return null})();return e?e["w"]:null}
function ba8_dustdevil_sites_n(){var e=(function(){var a=EVENTS;for(var i=0;i<a.length;i++){if(String(a[i]["id"])==="dustdevil"){return a[i]}}return null})();return e?e["sites"].length:0}
function ba8_dustdevil_sites_first(){var e=(function(){var a=EVENTS;for(var i=0;i<a.length;i++){if(String(a[i]["id"])==="dustdevil"){return a[i]}}return null})();return e?e["sites"][0]:null}
function ba8_dustdevil_text_wc(){var e=(function(){var a=EVENTS;for(var i=0;i<a.length;i++){if(String(a[i]["id"])==="dustdevil"){return a[i]}}return null})();return e?e["text"].split(" ").length:0}
function ba8_suitpuncture_id(){var e=(function(){var a=EVENTS;for(var i=0;i<a.length;i++){if(String(a[i]["id"])==="suitpuncture"){return a[i]}}return null})();return e?e["id"]:null}
function ba8_suitpuncture_text(){var e=(function(){var a=EVENTS;for(var i=0;i<a.length;i++){if(String(a[i]["id"])==="suitpuncture"){return a[i]}}return null})();return e?e["text"]:null}
function ba8_suitpuncture_w(){var e=(function(){var a=EVENTS;for(var i=0;i<a.length;i++){if(String(a[i]["id"])==="suitpuncture"){return a[i]}}return null})();return e?e["w"]:null}
function ba8_suitpuncture_sites_n(){var e=(function(){var a=EVENTS;for(var i=0;i<a.length;i++){if(String(a[i]["id"])==="suitpuncture"){return a[i]}}return null})();return e?e["sites"].length:0}
function ba8_suitpuncture_sites_first(){var e=(function(){var a=EVENTS;for(var i=0;i<a.length;i++){if(String(a[i]["id"])==="suitpuncture"){return a[i]}}return null})();return e?e["sites"][0]:null}
function ba8_suitpuncture_text_wc(){var e=(function(){var a=EVENTS;for(var i=0;i<a.length;i++){if(String(a[i]["id"])==="suitpuncture"){return a[i]}}return null})();return e?e["text"].split(" ").length:0}
function ba8_icepocket_id(){var e=(function(){var a=EVENTS;for(var i=0;i<a.length;i++){if(String(a[i]["id"])==="icepocket"){return a[i]}}return null})();return e?e["id"]:null}
function ba8_icepocket_text(){var e=(function(){var a=EVENTS;for(var i=0;i<a.length;i++){if(String(a[i]["id"])==="icepocket"){return a[i]}}return null})();return e?e["text"]:null}
function ba8_icepocket_w(){var e=(function(){var a=EVENTS;for(var i=0;i<a.length;i++){if(String(a[i]["id"])==="icepocket"){return a[i]}}return null})();return e?e["w"]:null}
function ba8_icepocket_sites_n(){var e=(function(){var a=EVENTS;for(var i=0;i<a.length;i++){if(String(a[i]["id"])==="icepocket"){return a[i]}}return null})();return e?e["sites"].length:0}
function ba8_icepocket_sites_first(){var e=(function(){var a=EVENTS;for(var i=0;i<a.length;i++){if(String(a[i]["id"])==="icepocket"){return a[i]}}return null})();return e?e["sites"][0]:null}
function ba8_icepocket_text_wc(){var e=(function(){var a=EVENTS;for(var i=0;i<a.length;i++){if(String(a[i]["id"])==="icepocket"){return a[i]}}return null})();return e?e["text"].split(" ").length:0}
function ba8_what_did_nasa_s_moxie_experi_q(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="What did NASA's MOXIE experiment produce from the Martian atmosphere?"){return a[i]}}return null})();return e?e["q"]:null}
function ba8_what_did_nasa_s_moxie_experi_c(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="What did NASA's MOXIE experiment produce from the Martian atmosphere?"){return a[i]}}return null})();return e?e["c"]:null}
function ba8_what_did_nasa_s_moxie_experi_fact(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="What did NASA's MOXIE experiment produce from the Martian atmosphere?"){return a[i]}}return null})();return e?e["fact"]:null}
function ba8_what_did_nasa_s_moxie_experi_a_n(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="What did NASA's MOXIE experiment produce from the Martian atmosphere?"){return a[i]}}return null})();return e?e["a"].length:0}
function ba8_what_did_nasa_s_moxie_experi_a_first(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="What did NASA's MOXIE experiment produce from the Martian atmosphere?"){return a[i]}}return null})();return e?e["a"][0]:null}
function ba8_what_did_nasa_s_moxie_experi_q_wc(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="What did NASA's MOXIE experiment produce from the Martian atmosphere?"){return a[i]}}return null})();return e?e["q"].split(" ").length:0}
function ba8_what_did_nasa_s_moxie_experi_fact_wc(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="What did NASA's MOXIE experiment produce from the Martian atmosphere?"){return a[i]}}return null})();return e?e["fact"].split(" ").length:0}
function ba8_why_do_planners_target_the_m_q(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="Why do planners target the Moon's south pole?"){return a[i]}}return null})();return e?e["q"]:null}
function ba8_why_do_planners_target_the_m_c(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="Why do planners target the Moon's south pole?"){return a[i]}}return null})();return e?e["c"]:null}
function ba8_why_do_planners_target_the_m_fact(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="Why do planners target the Moon's south pole?"){return a[i]}}return null})();return e?e["fact"]:null}
function ba8_why_do_planners_target_the_m_a_n(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="Why do planners target the Moon's south pole?"){return a[i]}}return null})();return e?e["a"].length:0}
function ba8_why_do_planners_target_the_m_a_first(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="Why do planners target the Moon's south pole?"){return a[i]}}return null})();return e?e["a"][0]:null}
function ba8_why_do_planners_target_the_m_q_wc(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="Why do planners target the Moon's south pole?"){return a[i]}}return null})();return e?e["q"].split(" ").length:0}
function ba8_why_do_planners_target_the_m_fact_wc(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="Why do planners target the Moon's south pole?"){return a[i]}}return null})();return e?e["fact"].split(" ").length:0}
function ba8_about_how_long_is_one_martia_q(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="About how long is one Martian sol?"){return a[i]}}return null})();return e?e["q"]:null}
function ba8_about_how_long_is_one_martia_c(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="About how long is one Martian sol?"){return a[i]}}return null})();return e?e["c"]:null}
function ba8_about_how_long_is_one_martia_fact(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="About how long is one Martian sol?"){return a[i]}}return null})();return e?e["fact"]:null}
function ba8_about_how_long_is_one_martia_a_n(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="About how long is one Martian sol?"){return a[i]}}return null})();return e?e["a"].length:0}
function ba8_about_how_long_is_one_martia_a_first(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="About how long is one Martian sol?"){return a[i]}}return null})();return e?e["a"][0]:null}
function ba8_about_how_long_is_one_martia_q_wc(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="About how long is one Martian sol?"){return a[i]}}return null})();return e?e["q"].split(" ").length:0}
function ba8_about_how_long_is_one_martia_fact_wc(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="About how long is one Martian sol?"){return a[i]}}return null})();return e?e["fact"].split(" ").length:0}
function ba8_what_is_the_main_component_o_q(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="What is the main component of the Martian atmosphere?"){return a[i]}}return null})();return e?e["q"]:null}
function ba8_what_is_the_main_component_o_c(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="What is the main component of the Martian atmosphere?"){return a[i]}}return null})();return e?e["c"]:null}
function ba8_what_is_the_main_component_o_fact(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="What is the main component of the Martian atmosphere?"){return a[i]}}return null})();return e?e["fact"]:null}
function ba8_what_is_the_main_component_o_a_n(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="What is the main component of the Martian atmosphere?"){return a[i]}}return null})();return e?e["a"].length:0}
function ba8_what_is_the_main_component_o_a_first(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="What is the main component of the Martian atmosphere?"){return a[i]}}return null})();return e?e["a"][0]:null}
function ba8_what_is_the_main_component_o_q_wc(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="What is the main component of the Martian atmosphere?"){return a[i]}}return null})();return e?e["q"].split(" ").length:0}
function ba8_what_is_the_main_component_o_fact_wc(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="What is the main component of the Martian atmosphere?"){return a[i]}}return null})();return e?e["fact"].split(" ").length:0}
function ba8_how_long_can_a_one_way_radio_q(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="How long can a one-way radio signal take between Earth and Mars?"){return a[i]}}return null})();return e?e["q"]:null}
function ba8_how_long_can_a_one_way_radio_c(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="How long can a one-way radio signal take between Earth and Mars?"){return a[i]}}return null})();return e?e["c"]:null}
function ba8_how_long_can_a_one_way_radio_fact(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="How long can a one-way radio signal take between Earth and Mars?"){return a[i]}}return null})();return e?e["fact"]:null}
function ba8_how_long_can_a_one_way_radio_a_n(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="How long can a one-way radio signal take between Earth and Mars?"){return a[i]}}return null})();return e?e["a"].length:0}
function ba8_how_long_can_a_one_way_radio_a_first(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="How long can a one-way radio signal take between Earth and Mars?"){return a[i]}}return null})();return e?e["a"][0]:null}
function ba8_how_long_can_a_one_way_radio_q_wc(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="How long can a one-way radio signal take between Earth and Mars?"){return a[i]}}return null})();return e?e["q"].split(" ").length:0}
function ba8_how_long_can_a_one_way_radio_fact_wc(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="How long can a one-way radio signal take between Earth and Mars?"){return a[i]}}return null})();return e?e["fact"].split(" ").length:0}
function ba8_what_protects_crews_on_the_i_q(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="What protects crews on the ISS from most radiation?"){return a[i]}}return null})();return e?e["q"]:null}
function ba8_what_protects_crews_on_the_i_c(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="What protects crews on the ISS from most radiation?"){return a[i]}}return null})();return e?e["c"]:null}
function ba8_what_protects_crews_on_the_i_fact(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="What protects crews on the ISS from most radiation?"){return a[i]}}return null})();return e?e["fact"]:null}
function ba8_what_protects_crews_on_the_i_a_n(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="What protects crews on the ISS from most radiation?"){return a[i]}}return null})();return e?e["a"].length:0}
function ba8_what_protects_crews_on_the_i_a_first(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="What protects crews on the ISS from most radiation?"){return a[i]}}return null})();return e?e["a"][0]:null}
function ba8_what_protects_crews_on_the_i_q_wc(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="What protects crews on the ISS from most radiation?"){return a[i]}}return null})();return e?e["q"].split(" ").length:0}
function ba8_what_protects_crews_on_the_i_fact_wc(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="What protects crews on the ISS from most radiation?"){return a[i]}}return null})();return e?e["fact"].split(" ").length:0}
function ba8_roughly_how_long_is_a_full_l_q(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="Roughly how long is a full lunar day-night cycle?"){return a[i]}}return null})();return e?e["q"]:null}
function ba8_roughly_how_long_is_a_full_l_c(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="Roughly how long is a full lunar day-night cycle?"){return a[i]}}return null})();return e?e["c"]:null}
function ba8_roughly_how_long_is_a_full_l_fact(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="Roughly how long is a full lunar day-night cycle?"){return a[i]}}return null})();return e?e["fact"]:null}
function ba8_roughly_how_long_is_a_full_l_a_n(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="Roughly how long is a full lunar day-night cycle?"){return a[i]}}return null})();return e?e["a"].length:0}
function ba8_roughly_how_long_is_a_full_l_a_first(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="Roughly how long is a full lunar day-night cycle?"){return a[i]}}return null})();return e?e["a"][0]:null}
function ba8_roughly_how_long_is_a_full_l_q_wc(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="Roughly how long is a full lunar day-night cycle?"){return a[i]}}return null})();return e?e["q"].split(" ").length:0}
function ba8_roughly_how_long_is_a_full_l_fact_wc(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="Roughly how long is a full lunar day-night cycle?"){return a[i]}}return null})();return e?e["fact"].split(" ").length:0}
function ba8_what_do_rtgs_use_to_make_ele_q(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="What do RTGs use to make electricity?"){return a[i]}}return null})();return e?e["q"]:null}
function ba8_what_do_rtgs_use_to_make_ele_c(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="What do RTGs use to make electricity?"){return a[i]}}return null})();return e?e["c"]:null}
function ba8_what_do_rtgs_use_to_make_ele_fact(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="What do RTGs use to make electricity?"){return a[i]}}return null})();return e?e["fact"]:null}
function ba8_what_do_rtgs_use_to_make_ele_a_n(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="What do RTGs use to make electricity?"){return a[i]}}return null})();return e?e["a"].length:0}
function ba8_what_do_rtgs_use_to_make_ele_a_first(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="What do RTGs use to make electricity?"){return a[i]}}return null})();return e?e["a"][0]:null}
function ba8_what_do_rtgs_use_to_make_ele_q_wc(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="What do RTGs use to make electricity?"){return a[i]}}return null})();return e?e["q"].split(" ").length:0}
function ba8_what_do_rtgs_use_to_make_ele_fact_wc(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="What do RTGs use to make electricity?"){return a[i]}}return null})();return e?e["fact"].split(" ").length:0}
function ba8_why_is_growing_food_on_a_mis_q(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="Why is growing food on a mission valuable?"){return a[i]}}return null})();return e?e["q"]:null}
function ba8_why_is_growing_food_on_a_mis_c(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="Why is growing food on a mission valuable?"){return a[i]}}return null})();return e?e["c"]:null}
function ba8_why_is_growing_food_on_a_mis_fact(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="Why is growing food on a mission valuable?"){return a[i]}}return null})();return e?e["fact"]:null}
function ba8_why_is_growing_food_on_a_mis_a_n(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="Why is growing food on a mission valuable?"){return a[i]}}return null})();return e?e["a"].length:0}
function ba8_why_is_growing_food_on_a_mis_a_first(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="Why is growing food on a mission valuable?"){return a[i]}}return null})();return e?e["a"][0]:null}
function ba8_why_is_growing_food_on_a_mis_q_wc(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="Why is growing food on a mission valuable?"){return a[i]}}return null})();return e?e["q"].split(" ").length:0}
function ba8_why_is_growing_food_on_a_mis_fact_wc(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="Why is growing food on a mission valuable?"){return a[i]}}return null})();return e?e["fact"].split(" ").length:0}
function ba8_what_hazard_do_dust_storms_o_q(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="What hazard do dust storms on Mars pose to solar power?"){return a[i]}}return null})();return e?e["q"]:null}
function ba8_what_hazard_do_dust_storms_o_c(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="What hazard do dust storms on Mars pose to solar power?"){return a[i]}}return null})();return e?e["c"]:null}
function ba8_what_hazard_do_dust_storms_o_fact(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="What hazard do dust storms on Mars pose to solar power?"){return a[i]}}return null})();return e?e["fact"]:null}
function ba8_what_hazard_do_dust_storms_o_a_n(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="What hazard do dust storms on Mars pose to solar power?"){return a[i]}}return null})();return e?e["a"].length:0}
function ba8_what_hazard_do_dust_storms_o_a_first(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="What hazard do dust storms on Mars pose to solar power?"){return a[i]}}return null})();return e?e["a"][0]:null}
function ba8_what_hazard_do_dust_storms_o_q_wc(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="What hazard do dust storms on Mars pose to solar power?"){return a[i]}}return null})();return e?e["q"].split(" ").length:0}
function ba8_what_hazard_do_dust_storms_o_fact_wc(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="What hazard do dust storms on Mars pose to solar power?"){return a[i]}}return null})();return e?e["fact"].split(" ").length:0}
function ba8_which_program_aims_to_return_q(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="Which program aims to return astronauts to the Moon this decade?"){return a[i]}}return null})();return e?e["q"]:null}
function ba8_which_program_aims_to_return_c(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="Which program aims to return astronauts to the Moon this decade?"){return a[i]}}return null})();return e?e["c"]:null}
function ba8_which_program_aims_to_return_fact(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="Which program aims to return astronauts to the Moon this decade?"){return a[i]}}return null})();return e?e["fact"]:null}
function ba8_which_program_aims_to_return_a_n(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="Which program aims to return astronauts to the Moon this decade?"){return a[i]}}return null})();return e?e["a"].length:0}
function ba8_which_program_aims_to_return_a_first(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="Which program aims to return astronauts to the Moon this decade?"){return a[i]}}return null})();return e?e["a"][0]:null}
function ba8_which_program_aims_to_return_q_wc(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="Which program aims to return astronauts to the Moon this decade?"){return a[i]}}return null})();return e?e["q"].split(" ").length:0}
function ba8_which_program_aims_to_return_fact_wc(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="Which program aims to return astronauts to the Moon this decade?"){return a[i]}}return null})();return e?e["fact"].split(" ").length:0}
function ba8_which_telescope_launched_in__q(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="Which telescope launched in 2021 now studies the early universe?"){return a[i]}}return null})();return e?e["q"]:null}
function ba8_which_telescope_launched_in__c(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="Which telescope launched in 2021 now studies the early universe?"){return a[i]}}return null})();return e?e["c"]:null}
function ba8_which_telescope_launched_in__fact(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="Which telescope launched in 2021 now studies the early universe?"){return a[i]}}return null})();return e?e["fact"]:null}
function ba8_which_telescope_launched_in__a_n(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="Which telescope launched in 2021 now studies the early universe?"){return a[i]}}return null})();return e?e["a"].length:0}
function ba8_which_telescope_launched_in__a_first(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="Which telescope launched in 2021 now studies the early universe?"){return a[i]}}return null})();return e?e["a"][0]:null}
function ba8_which_telescope_launched_in__q_wc(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="Which telescope launched in 2021 now studies the early universe?"){return a[i]}}return null})();return e?e["q"].split(" ").length:0}
function ba8_which_telescope_launched_in__fact_wc(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="Which telescope launched in 2021 now studies the early universe?"){return a[i]}}return null})();return e?e["fact"].split(" ").length:0}
function ba8_what_makes_lunar_regolith_us_q(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="What makes lunar regolith useful for shielding?"){return a[i]}}return null})();return e?e["q"]:null}
function ba8_what_makes_lunar_regolith_us_c(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="What makes lunar regolith useful for shielding?"){return a[i]}}return null})();return e?e["c"]:null}
function ba8_what_makes_lunar_regolith_us_fact(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="What makes lunar regolith useful for shielding?"){return a[i]}}return null})();return e?e["fact"]:null}
function ba8_what_makes_lunar_regolith_us_a_n(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="What makes lunar regolith useful for shielding?"){return a[i]}}return null})();return e?e["a"].length:0}
function ba8_what_makes_lunar_regolith_us_a_first(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="What makes lunar regolith useful for shielding?"){return a[i]}}return null})();return e?e["a"][0]:null}
function ba8_what_makes_lunar_regolith_us_q_wc(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="What makes lunar regolith useful for shielding?"){return a[i]}}return null})();return e?e["q"].split(" ").length:0}
function ba8_what_makes_lunar_regolith_us_fact_wc(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="What makes lunar regolith useful for shielding?"){return a[i]}}return null})();return e?e["fact"].split(" ").length:0}
function ba8_what_did_the_sofia_observato_q(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="What did the SOFIA observatory confirm on the Moon's sunlit surface in 2020?"){return a[i]}}return null})();return e?e["q"]:null}
function ba8_what_did_the_sofia_observato_c(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="What did the SOFIA observatory confirm on the Moon's sunlit surface in 2020?"){return a[i]}}return null})();return e?e["c"]:null}
function ba8_what_did_the_sofia_observato_fact(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="What did the SOFIA observatory confirm on the Moon's sunlit surface in 2020?"){return a[i]}}return null})();return e?e["fact"]:null}
function ba8_what_did_the_sofia_observato_a_n(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="What did the SOFIA observatory confirm on the Moon's sunlit surface in 2020?"){return a[i]}}return null})();return e?e["a"].length:0}
function ba8_what_did_the_sofia_observato_a_first(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="What did the SOFIA observatory confirm on the Moon's sunlit surface in 2020?"){return a[i]}}return null})();return e?e["a"][0]:null}
function ba8_what_did_the_sofia_observato_q_wc(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="What did the SOFIA observatory confirm on the Moon's sunlit surface in 2020?"){return a[i]}}return null})();return e?e["q"].split(" ").length:0}
function ba8_what_did_the_sofia_observato_fact_wc(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="What did the SOFIA observatory confirm on the Moon's sunlit surface in 2020?"){return a[i]}}return null})();return e?e["fact"].split(" ").length:0}
function ba8_why_are_lava_tubes_interesti_q(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="Why are lava tubes interesting to base planners?"){return a[i]}}return null})();return e?e["q"]:null}
function ba8_why_are_lava_tubes_interesti_c(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="Why are lava tubes interesting to base planners?"){return a[i]}}return null})();return e?e["c"]:null}
function ba8_why_are_lava_tubes_interesti_fact(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="Why are lava tubes interesting to base planners?"){return a[i]}}return null})();return e?e["fact"]:null}
function ba8_why_are_lava_tubes_interesti_a_n(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="Why are lava tubes interesting to base planners?"){return a[i]}}return null})();return e?e["a"].length:0}
function ba8_why_are_lava_tubes_interesti_a_first(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="Why are lava tubes interesting to base planners?"){return a[i]}}return null})();return e?e["a"][0]:null}
function ba8_why_are_lava_tubes_interesti_q_wc(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="Why are lava tubes interesting to base planners?"){return a[i]}}return null})();return e?e["q"].split(" ").length:0}
function ba8_why_are_lava_tubes_interesti_fact_wc(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="Why are lava tubes interesting to base planners?"){return a[i]}}return null})();return e?e["fact"].split(" ").length:0}
function ba8_what_is_isru_q(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="What is ISRU?"){return a[i]}}return null})();return e?e["q"]:null}
function ba8_what_is_isru_c(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="What is ISRU?"){return a[i]}}return null})();return e?e["c"]:null}
function ba8_what_is_isru_fact(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="What is ISRU?"){return a[i]}}return null})();return e?e["fact"]:null}
function ba8_what_is_isru_a_n(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="What is ISRU?"){return a[i]}}return null})();return e?e["a"].length:0}
function ba8_what_is_isru_a_first(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="What is ISRU?"){return a[i]}}return null})();return e?e["a"][0]:null}
function ba8_what_is_isru_fact_wc(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="What is ISRU?"){return a[i]}}return null})();return e?e["fact"].split(" ").length:0}
function ba8_perchlorate_salts_in_martian_q(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="Perchlorate salts in Martian soil are a concern because they are..."){return a[i]}}return null})();return e?e["q"]:null}
function ba8_perchlorate_salts_in_martian_c(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="Perchlorate salts in Martian soil are a concern because they are..."){return a[i]}}return null})();return e?e["c"]:null}
function ba8_perchlorate_salts_in_martian_fact(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="Perchlorate salts in Martian soil are a concern because they are..."){return a[i]}}return null})();return e?e["fact"]:null}
function ba8_perchlorate_salts_in_martian_a_n(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="Perchlorate salts in Martian soil are a concern because they are..."){return a[i]}}return null})();return e?e["a"].length:0}
function ba8_perchlorate_salts_in_martian_a_first(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="Perchlorate salts in Martian soil are a concern because they are..."){return a[i]}}return null})();return e?e["a"][0]:null}
function ba8_perchlorate_salts_in_martian_q_wc(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="Perchlorate salts in Martian soil are a concern because they are..."){return a[i]}}return null})();return e?e["q"].split(" ").length:0}
function ba8_perchlorate_salts_in_martian_fact_wc(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="Perchlorate salts in Martian soil are a concern because they are..."){return a[i]}}return null})();return e?e["fact"].split(" ").length:0}
function ba8_which_apollo_mission_turned__q(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="Which Apollo mission turned a crisis into a safe return using the lunar module as a lifeboat?"){return a[i]}}return null})();return e?e["q"]:null}
function ba8_which_apollo_mission_turned__c(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="Which Apollo mission turned a crisis into a safe return using the lunar module as a lifeboat?"){return a[i]}}return null})();return e?e["c"]:null}
function ba8_which_apollo_mission_turned__fact(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="Which Apollo mission turned a crisis into a safe return using the lunar module as a lifeboat?"){return a[i]}}return null})();return e?e["fact"]:null}
function ba8_which_apollo_mission_turned__a_n(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="Which Apollo mission turned a crisis into a safe return using the lunar module as a lifeboat?"){return a[i]}}return null})();return e?e["a"].length:0}
function ba8_which_apollo_mission_turned__a_first(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="Which Apollo mission turned a crisis into a safe return using the lunar module as a lifeboat?"){return a[i]}}return null})();return e?e["a"][0]:null}
function ba8_which_apollo_mission_turned__q_wc(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="Which Apollo mission turned a crisis into a safe return using the lunar module as a lifeboat?"){return a[i]}}return null})();return e?e["q"].split(" ").length:0}
function ba8_which_apollo_mission_turned__fact_wc(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="Which Apollo mission turned a crisis into a safe return using the lunar module as a lifeboat?"){return a[i]}}return null})();return e?e["fact"].split(" ").length:0}
function ba8_why_does_a_greenhouse_on_mar_q(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="Why does a greenhouse on Mars need artificial light even in daytime?"){return a[i]}}return null})();return e?e["q"]:null}
function ba8_why_does_a_greenhouse_on_mar_c(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="Why does a greenhouse on Mars need artificial light even in daytime?"){return a[i]}}return null})();return e?e["c"]:null}
function ba8_why_does_a_greenhouse_on_mar_fact(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="Why does a greenhouse on Mars need artificial light even in daytime?"){return a[i]}}return null})();return e?e["fact"]:null}
function ba8_why_does_a_greenhouse_on_mar_a_n(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="Why does a greenhouse on Mars need artificial light even in daytime?"){return a[i]}}return null})();return e?e["a"].length:0}
function ba8_why_does_a_greenhouse_on_mar_a_first(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="Why does a greenhouse on Mars need artificial light even in daytime?"){return a[i]}}return null})();return e?e["a"][0]:null}
function ba8_why_does_a_greenhouse_on_mar_q_wc(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="Why does a greenhouse on Mars need artificial light even in daytime?"){return a[i]}}return null})();return e?e["q"].split(" ").length:0}
function ba8_why_does_a_greenhouse_on_mar_fact_wc(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="Why does a greenhouse on Mars need artificial light even in daytime?"){return a[i]}}return null})();return e?e["fact"].split(" ").length:0}
function ba8_what_is_a_fair_first_power_s_q(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="What is a fair first power source for a polar lunar base?"){return a[i]}}return null})();return e?e["q"]:null}
function ba8_what_is_a_fair_first_power_s_c(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="What is a fair first power source for a polar lunar base?"){return a[i]}}return null})();return e?e["c"]:null}
function ba8_what_is_a_fair_first_power_s_fact(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="What is a fair first power source for a polar lunar base?"){return a[i]}}return null})();return e?e["fact"]:null}
function ba8_what_is_a_fair_first_power_s_a_n(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="What is a fair first power source for a polar lunar base?"){return a[i]}}return null})();return e?e["a"].length:0}
function ba8_what_is_a_fair_first_power_s_a_first(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="What is a fair first power source for a polar lunar base?"){return a[i]}}return null})();return e?e["a"][0]:null}
function ba8_what_is_a_fair_first_power_s_q_wc(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="What is a fair first power source for a polar lunar base?"){return a[i]}}return null})();return e?e["q"].split(" ").length:0}
function ba8_what_is_a_fair_first_power_s_fact_wc(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="What is a fair first power source for a polar lunar base?"){return a[i]}}return null})();return e?e["fact"].split(" ").length:0}
function ba8_firstsol_id(){var e=(function(){var a=ACHIEVEMENTS;for(var i=0;i<a.length;i++){if(String(a[i]["id"])==="firstsol"){return a[i]}}return null})();return e?e["id"]:null}
function ba8_firstsol_name(){var e=(function(){var a=ACHIEVEMENTS;for(var i=0;i<a.length;i++){if(String(a[i]["id"])==="firstsol"){return a[i]}}return null})();return e?e["name"]:null}
function ba8_power50_id(){var e=(function(){var a=ACHIEVEMENTS;for(var i=0;i<a.length;i++){if(String(a[i]["id"])==="power50"){return a[i]}}return null})();return e?e["id"]:null}
function ba8_power50_name(){var e=(function(){var a=ACHIEVEMENTS;for(var i=0;i<a.length;i++){if(String(a[i]["id"])==="power50"){return a[i]}}return null})();return e?e["name"]:null}
function ba8_science100_id(){var e=(function(){var a=ACHIEVEMENTS;for(var i=0;i<a.length;i++){if(String(a[i]["id"])==="science100"){return a[i]}}return null})();return e?e["id"]:null}
function ba8_science100_name(){var e=(function(){var a=ACHIEVEMENTS;for(var i=0;i<a.length;i++){if(String(a[i]["id"])==="science100"){return a[i]}}return null})();return e?e["name"]:null}
function ba8_shield3_id(){var e=(function(){var a=ACHIEVEMENTS;for(var i=0;i<a.length;i++){if(String(a[i]["id"])==="shield3"){return a[i]}}return null})();return e?e["id"]:null}
function ba8_shield3_name(){var e=(function(){var a=ACHIEVEMENTS;for(var i=0;i<a.length;i++){if(String(a[i]["id"])==="shield3"){return a[i]}}return null})();return e?e["name"]:null}
function ba8_sol15_id(){var e=(function(){var a=ACHIEVEMENTS;for(var i=0;i<a.length;i++){if(String(a[i]["id"])==="sol15"){return a[i]}}return null})();return e?e["id"]:null}
function ba8_sol15_name(){var e=(function(){var a=ACHIEVEMENTS;for(var i=0;i<a.length;i++){if(String(a[i]["id"])==="sol15"){return a[i]}}return null})();return e?e["name"]:null}
function ba8_sol30_id(){var e=(function(){var a=ACHIEVEMENTS;for(var i=0;i<a.length;i++){if(String(a[i]["id"])==="sol30"){return a[i]}}return null})();return e?e["id"]:null}
function ba8_sol30_name(){var e=(function(){var a=ACHIEVEMENTS;for(var i=0;i<a.length;i++){if(String(a[i]["id"])==="sol30"){return a[i]}}return null})();return e?e["name"]:null}
function ba8_fullhouse_id(){var e=(function(){var a=ACHIEVEMENTS;for(var i=0;i<a.length;i++){if(String(a[i]["id"])==="fullhouse"){return a[i]}}return null})();return e?e["id"]:null}
function ba8_fullhouse_name(){var e=(function(){var a=ACHIEVEMENTS;for(var i=0;i<a.length;i++){if(String(a[i]["id"])==="fullhouse"){return a[i]}}return null})();return e?e["name"]:null}
function ba8_quiz5_id(){var e=(function(){var a=ACHIEVEMENTS;for(var i=0;i<a.length;i++){if(String(a[i]["id"])==="quiz5"){return a[i]}}return null})();return e?e["id"]:null}
function ba8_quiz5_name(){var e=(function(){var a=ACHIEVEMENTS;for(var i=0;i<a.length;i++){if(String(a[i]["id"])==="quiz5"){return a[i]}}return null})();return e?e["name"]:null}
function ba8_selfsufficient_id(){var e=(function(){var a=ACHIEVEMENTS;for(var i=0;i<a.length;i++){if(String(a[i]["id"])==="selfsufficient"){return a[i]}}return null})();return e?e["id"]:null}
function ba8_selfsufficient_name(){var e=(function(){var a=ACHIEVEMENTS;for(var i=0;i<a.length;i++){if(String(a[i]["id"])==="selfsufficient"){return a[i]}}return null})();return e?e["name"]:null}
function ba8_survivor_id(){var e=(function(){var a=ACHIEVEMENTS;for(var i=0;i<a.length;i++){if(String(a[i]["id"])==="survivor"){return a[i]}}return null})();return e?e["id"]:null}
function ba8_survivor_name(){var e=(function(){var a=ACHIEVEMENTS;for(var i=0;i<a.length;i++){if(String(a[i]["id"])==="survivor"){return a[i]}}return null})();return e?e["name"]:null}
function ba8_researcher_id(){var e=(function(){var a=ACHIEVEMENTS;for(var i=0;i<a.length;i++){if(String(a[i]["id"])==="researcher"){return a[i]}}return null})();return e?e["id"]:null}
function ba8_researcher_name(){var e=(function(){var a=ACHIEVEMENTS;for(var i=0;i<a.length;i++){if(String(a[i]["id"])==="researcher"){return a[i]}}return null})();return e?e["name"]:null}
function ba8_awayteam_id(){var e=(function(){var a=ACHIEVEMENTS;for(var i=0;i<a.length;i++){if(String(a[i]["id"])==="awayteam"){return a[i]}}return null})();return e?e["id"]:null}
function ba8_awayteam_name(){var e=(function(){var a=ACHIEVEMENTS;for(var i=0;i<a.length;i++){if(String(a[i]["id"])==="awayteam"){return a[i]}}return null})();return e?e["name"]:null}
function ba8_veteran_id(){var e=(function(){var a=ACHIEVEMENTS;for(var i=0;i<a.length;i++){if(String(a[i]["id"])==="veteran"){return a[i]}}return null})();return e?e["id"]:null}
function ba8_veteran_name(){var e=(function(){var a=ACHIEVEMENTS;for(var i=0;i<a.length;i++){if(String(a[i]["id"])==="veteran"){return a[i]}}return null})();return e?e["name"]:null}
function ba8_nightowl_id(){var e=(function(){var a=ACHIEVEMENTS;for(var i=0;i<a.length;i++){if(String(a[i]["id"])==="nightowl"){return a[i]}}return null})();return e?e["id"]:null}
function ba8_nightowl_name(){var e=(function(){var a=ACHIEVEMENTS;for(var i=0;i<a.length;i++){if(String(a[i]["id"])==="nightowl"){return a[i]}}return null})();return e?e["name"]:null}
function ba8_closedloop2_id(){var e=(function(){var a=ACHIEVEMENTS;for(var i=0;i<a.length;i++){if(String(a[i]["id"])==="closedloop2"){return a[i]}}return null})();return e?e["id"]:null}
function ba8_closedloop2_name(){var e=(function(){var a=ACHIEVEMENTS;for(var i=0;i<a.length;i++){if(String(a[i]["id"])==="closedloop2"){return a[i]}}return null})();return e?e["name"]:null}
function ba8_highscore_id(){var e=(function(){var a=ACHIEVEMENTS;for(var i=0;i<a.length;i++){if(String(a[i]["id"])==="highscore"){return a[i]}}return null})();return e?e["id"]:null}
function ba8_highscore_name(){var e=(function(){var a=ACHIEVEMENTS;for(var i=0;i<a.length;i++){if(String(a[i]["id"])==="highscore"){return a[i]}}return null})();return e?e["name"]:null}
function ba8_crosstrained_id(){var e=(function(){var a=ACHIEVEMENTS;for(var i=0;i<a.length;i++){if(String(a[i]["id"])==="crosstrained"){return a[i]}}return null})();return e?e["id"]:null}
function ba8_crosstrained_name(){var e=(function(){var a=ACHIEVEMENTS;for(var i=0;i<a.length;i++){if(String(a[i]["id"])==="crosstrained"){return a[i]}}return null})();return e?e["name"]:null}
function ba8_farmer_id(){var e=(function(){var a=ACHIEVEMENTS;for(var i=0;i<a.length;i++){if(String(a[i]["id"])==="farmer"){return a[i]}}return null})();return e?e["id"]:null}
function ba8_farmer_name(){var e=(function(){var a=ACHIEVEMENTS;for(var i=0;i<a.length;i++){if(String(a[i]["id"])==="farmer"){return a[i]}}return null})();return e?e["name"]:null}
function ba8_scenario_id(){var e=(function(){var a=ACHIEVEMENTS;for(var i=0;i<a.length;i++){if(String(a[i]["id"])==="scenario"){return a[i]}}return null})();return e?e["id"]:null}
function ba8_scenario_name(){var e=(function(){var a=ACHIEVEMENTS;for(var i=0;i<a.length;i++){if(String(a[i]["id"])==="scenario"){return a[i]}}return null})();return e?e["name"]:null}
function ba8_hoarder_id(){var e=(function(){var a=ACHIEVEMENTS;for(var i=0;i<a.length;i++){if(String(a[i]["id"])==="hoarder"){return a[i]}}return null})();return e?e["id"]:null}
function ba8_hoarder_name(){var e=(function(){var a=ACHIEVEMENTS;for(var i=0;i<a.length;i++){if(String(a[i]["id"])==="hoarder"){return a[i]}}return null})();return e?e["name"]:null}
function ba8_events_count(){return EVENTS.length}
function ba8_events_w_min(){return Math.min.apply(null,EVENTS.map(function(e){return e["w"]}))}
function ba8_events_w_max(){return Math.max.apply(null,EVENTS.map(function(e){return e["w"]}))}
function ba8_events_w_sum(){return EVENTS.reduce(function(s,e){return s+e["w"]},0)}
function ba8_quiz_count(){return QUIZ.length}
function ba8_quiz_c_min(){return Math.min.apply(null,QUIZ.map(function(e){return e["c"]}))}
function ba8_quiz_c_max(){return Math.max.apply(null,QUIZ.map(function(e){return e["c"]}))}
function ba8_quiz_c_sum(){return QUIZ.reduce(function(s,e){return s+e["c"]},0)}
function ba8_achievements_count(){return ACHIEVEMENTS.length}
function ba8_events_has_solar(){return EVENTS.filter(function(e){return ["text"].some(function(f){return String(e[f]).toLowerCase().indexOf("solar")>=0})}).length}
function ba8_events_has_building(){return EVENTS.filter(function(e){return ["text"].some(function(f){return String(e[f]).toLowerCase().indexOf("building")>=0})}).length}
function ba8_events_has_morale(){return EVENTS.filter(function(e){return ["text"].some(function(f){return String(e[f]).toLowerCase().indexOf("morale")>=0})}).length}
function ba8_events_has_member(){return EVENTS.filter(function(e){return ["text"].some(function(f){return String(e[f]).toLowerCase().indexOf("member")>=0})}).length}
function ba8_events_has_radiation(){return EVENTS.filter(function(e){return ["text"].some(function(f){return String(e[f]).toLowerCase().indexOf("radiation")>=0})}).length}
function ba8_events_has_damaging(){return EVENTS.filter(function(e){return ["text"].some(function(f){return String(e[f]).toLowerCase().indexOf("damaging")>=0})}).length}
function ba8_events_has_pocket(){return EVENTS.filter(function(e){return ["text"].some(function(f){return String(e[f]).toLowerCase().indexOf("pocket")>=0})}).length}
function ba8_events_has_science(){return EVENTS.filter(function(e){return ["text"].some(function(f){return String(e[f]).toLowerCase().indexOf("science")>=0})}).length}
function ba8_events_has_online(){return EVENTS.filter(function(e){return ["text"].some(function(f){return String(e[f]).toLowerCase().indexOf("online")>=0})}).length}
function ba8_events_has_drops(){return EVENTS.filter(function(e){return ["text"].some(function(f){return String(e[f]).toLowerCase().indexOf("drops")>=0})}).length}
function ba8_events_has_oxygen(){return EVENTS.filter(function(e){return ["text"].some(function(f){return String(e[f]).toLowerCase().indexOf("oxygen")>=0})}).length}
function ba8_events_has_storm(){return EVENTS.filter(function(e){return ["text"].some(function(f){return String(e[f]).toLowerCase().indexOf("storm")>=0})}).length}
function ba8_events_has_output(){return EVENTS.filter(function(e){return ["text"].some(function(f){return String(e[f]).toLowerCase().indexOf("output")>=0})}).length}
function ba8_events_has_micrometeorite(){return EVENTS.filter(function(e){return ["text"].some(function(f){return String(e[f]).toLowerCase().indexOf("micrometeorite")>=0})}).length}
function ba8_events_has_strike(){return EVENTS.filter(function(e){return ["text"].some(function(f){return String(e[f]).toLowerCase().indexOf("strike")>=0})}).length}
function ba8_events_has_damages(){return EVENTS.filter(function(e){return ["text"].some(function(f){return String(e[f]).toLowerCase().indexOf("damages")>=0})}).length}
function ba8_events_has_random(){return EVENTS.filter(function(e){return ["text"].some(function(f){return String(e[f]).toLowerCase().indexOf("random")>=0})}).length}
function ba8_events_has_falls(){return EVENTS.filter(function(e){return ["text"].some(function(f){return String(e[f]).toLowerCase().indexOf("falls")>=0})}).length}
function ba8_events_has_loses(){return EVENTS.filter(function(e){return ["text"].some(function(f){return String(e[f]).toLowerCase().indexOf("loses")>=0})}).length}
function ba8_events_has_health(){return EVENTS.filter(function(e){return ["text"].some(function(f){return String(e[f]).toLowerCase().indexOf("health")>=0})}).length}
function ba8_events_has_particle(){return EVENTS.filter(function(e){return ["text"].some(function(f){return String(e[f]).toLowerCase().indexOf("particle")>=0})}).length}
function ba8_events_has_event(){return EVENTS.filter(function(e){return ["text"].some(function(f){return String(e[f]).toLowerCase().indexOf("event")>=0})}).length}
function ba8_events_has_unshielded(){return EVENTS.filter(function(e){return ["text"].some(function(f){return String(e[f]).toLowerCase().indexOf("unshielded")>=0})}).length}
function ba8_events_has_moonquake(){return EVENTS.filter(function(e){return ["text"].some(function(f){return String(e[f]).toLowerCase().indexOf("moonquake")>=0})}).length}
function ba8_events_has_rattles(){return EVENTS.filter(function(e){return ["text"].some(function(f){return String(e[f]).toLowerCase().indexOf("rattles")>=0})}).length}
function ba8_events_has_surveyors(){return EVENTS.filter(function(e){return ["text"].some(function(f){return String(e[f]).toLowerCase().indexOf("surveyors")>=0})}).length}
function ba8_events_has_water(){return EVENTS.filter(function(e){return ["text"].some(function(f){return String(e[f]).toLowerCase().indexOf("water")>=0})}).length}
function ba8_events_has_satellite(){return EVENTS.filter(function(e){return ["text"].some(function(f){return String(e[f]).toLowerCase().indexOf("satellite")>=0})}).length}
function ba8_events_has_relay(){return EVENTS.filter(function(e){return ["text"].some(function(f){return String(e[f]).toLowerCase().indexOf("relay")>=0})}).length}
function ba8_events_has_passes(){return EVENTS.filter(function(e){return ["text"].some(function(f){return String(e[f]).toLowerCase().indexOf("passes")>=0})}).length}
function ba8_events_has_overhead(){return EVENTS.filter(function(e){return ["text"].some(function(f){return String(e[f]).toLowerCase().indexOf("overhead")>=0})}).length}
function ba8_events_has_comms(){return EVENTS.filter(function(e){return ["text"].some(function(f){return String(e[f]).toLowerCase().indexOf("comms")>=0})}).length}
function ba8_events_has_improves(){return EVENTS.filter(function(e){return ["text"].some(function(f){return String(e[f]).toLowerCase().indexOf("improves")>=0})}).length}
function ba8_events_has_flare(){return EVENTS.filter(function(e){return ["text"].some(function(f){return String(e[f]).toLowerCase().indexOf("flare")>=0})}).length}
function ba8_events_has_extra(){return EVENTS.filter(function(e){return ["text"].some(function(f){return String(e[f]).toLowerCase().indexOf("extra")>=0})}).length}
function ba8_events_has_birthday(){return EVENTS.filter(function(e){return ["text"].some(function(f){return String(e[f]).toLowerCase().indexOf("birthday")>=0})}).length}
function ba8_events_has_lifts(){return EVENTS.filter(function(e){return ["text"].some(function(f){return String(e[f]).toLowerCase().indexOf("lifts")>=0})}).length}
function ba8_events_has_everyone(){return EVENTS.filter(function(e){return ["text"].some(function(f){return String(e[f]).toLowerCase().indexOf("everyone")>=0})}).length}
function ba8_events_has_stowaway(){return EVENTS.filter(function(e){return ["text"].some(function(f){return String(e[f]).toLowerCase().indexOf("stowaway")>=0})}).length}
function ba8_events_has_stores(){return EVENTS.filter(function(e){return ["text"].some(function(f){return String(e[f]).toLowerCase().indexOf("stores")>=0})}).length}
function ba8_quiz_has_earth(){return QUIZ.filter(function(e){return ["q","fact"].some(function(f){return String(e[f]).toLowerCase().indexOf("earth")>=0})}).length}
function ba8_quiz_has_lunar(){return QUIZ.filter(function(e){return ["q","fact"].some(function(f){return String(e[f]).toLowerCase().indexOf("lunar")>=0})}).length}
function ba8_quiz_has_martian(){return QUIZ.filter(function(e){return ["q","fact"].some(function(f){return String(e[f]).toLowerCase().indexOf("martian")>=0})}).length}
function ba8_quiz_has_atmosphere(){return QUIZ.filter(function(e){return ["q","fact"].some(function(f){return String(e[f]).toLowerCase().indexOf("atmosphere")>=0})}).length}
function ba8_quiz_has_water(){return QUIZ.filter(function(e){return ["q","fact"].some(function(f){return String(e[f]).toLowerCase().indexOf("water")>=0})}).length}
function ba8_quiz_has_about(){return QUIZ.filter(function(e){return ["q","fact"].some(function(f){return String(e[f]).toLowerCase().indexOf("about")>=0})}).length}
function ba8_quiz_has_oxygen(){return QUIZ.filter(function(e){return ["q","fact"].some(function(f){return String(e[f]).toLowerCase().indexOf("oxygen")>=0})}).length}
function ba8_quiz_has_crews(){return QUIZ.filter(function(e){return ["q","fact"].some(function(f){return String(e[f]).toLowerCase().indexOf("crews")>=0})}).length}
function ba8_quiz_has_south(){return QUIZ.filter(function(e){return ["q","fact"].some(function(f){return String(e[f]).toLowerCase().indexOf("south")>=0})}).length}
function ba8_quiz_has_radiation(){return QUIZ.filter(function(e){return ["q","fact"].some(function(f){return String(e[f]).toLowerCase().indexOf("radiation")>=0})}).length}
function ba8_quiz_has_regolith(){return QUIZ.filter(function(e){return ["q","fact"].some(function(f){return String(e[f]).toLowerCase().indexOf("regolith")>=0})}).length}
function ba8_quiz_has_solar(){return QUIZ.filter(function(e){return ["q","fact"].some(function(f){return String(e[f]).toLowerCase().indexOf("solar")>=0})}).length}
function ba8_quiz_has_polar(){return QUIZ.filter(function(e){return ["q","fact"].some(function(f){return String(e[f]).toLowerCase().indexOf("polar")>=0})}).length}
function ba8_quiz_has_power(){return QUIZ.filter(function(e){return ["q","fact"].some(function(f){return String(e[f]).toLowerCase().indexOf("power")>=0})}).length}
function ba8_quiz_has_storms(){return QUIZ.filter(function(e){return ["q","fact"].some(function(f){return String(e[f]).toLowerCase().indexOf("storms")>=0})}).length}
function ba8_quiz_has_mission(){return QUIZ.filter(function(e){return ["q","fact"].some(function(f){return String(e[f]).toLowerCase().indexOf("mission")>=0})}).length}
function ba8_quiz_has_sunlight(){return QUIZ.filter(function(e){return ["q","fact"].some(function(f){return String(e[f]).toLowerCase().indexOf("sunlight")>=0})}).length}
function ba8_quiz_has_which(){return QUIZ.filter(function(e){return ["q","fact"].some(function(f){return String(e[f]).toLowerCase().indexOf("which")>=0})}).length}
function ba8_quiz_has_moxie(){return QUIZ.filter(function(e){return ["q","fact"].some(function(f){return String(e[f]).toLowerCase().indexOf("moxie")>=0})}).length}
function ba8_quiz_has_first(){return QUIZ.filter(function(e){return ["q","fact"].some(function(f){return String(e[f]).toLowerCase().indexOf("first")>=0})}).length}
function ca9_quiz_has_making(){return QUIZ.filter(function(e){return ["q","fact"].some(function(f){return String(e[f]).toLowerCase().indexOf("making")>=0})}).length}
function ca9_quiz_has_planners(){return QUIZ.filter(function(e){return ["q","fact"].some(function(f){return String(e[f]).toLowerCase().indexOf("planners")>=0})}).length}
function ca9_quiz_has_shadowed(){return QUIZ.filter(function(e){return ["q","fact"].some(function(f){return String(e[f]).toLowerCase().indexOf("shadowed")>=0})}).length}
function ca9_quiz_has_light(){return QUIZ.filter(function(e){return ["q","fact"].some(function(f){return String(e[f]).toLowerCase().indexOf("light")>=0})}).length}
function ca9_quiz_has_shielding(){return QUIZ.filter(function(e){return ["q","fact"].some(function(f){return String(e[f]).toLowerCase().indexOf("shielding")>=0})}).length}
function ca9_quiz_has_night(){return QUIZ.filter(function(e){return ["q","fact"].some(function(f){return String(e[f]).toLowerCase().indexOf("night")>=0})}).length}
function ca9_quiz_has_local(){return QUIZ.filter(function(e){return ["q","fact"].some(function(f){return String(e[f]).toLowerCase().indexOf("local")>=0})}).length}
function ca9_quiz_has_return(){return QUIZ.filter(function(e){return ["q","fact"].some(function(f){return String(e[f]).toLowerCase().indexOf("return")>=0})}).length}
function ca9_quiz_has_sofia(){return QUIZ.filter(function(e){return ["q","fact"].some(function(f){return String(e[f]).toLowerCase().indexOf("sofia")>=0})}).length}
function ca9_quiz_has_tubes(){return QUIZ.filter(function(e){return ["q","fact"].some(function(f){return String(e[f]).toLowerCase().indexOf("tubes")>=0})}).length}
function ca9_quiz_has_apollo(){return QUIZ.filter(function(e){return ["q","fact"].some(function(f){return String(e[f]).toLowerCase().indexOf("apollo")>=0})}).length}
function ca9_quiz_has_experiment(){return QUIZ.filter(function(e){return ["q","fact"].some(function(f){return String(e[f]).toLowerCase().indexOf("experiment")>=0})}).length}
function ca9_quiz_has_produce(){return QUIZ.filter(function(e){return ["q","fact"].some(function(f){return String(e[f]).toLowerCase().indexOf("produce")>=0})}).length}
function ca9_quiz_has_toward(){return QUIZ.filter(function(e){return ["q","fact"].some(function(f){return String(e[f]).toLowerCase().indexOf("toward")>=0})}).length}
function ca9_quiz_has_rocket(){return QUIZ.filter(function(e){return ["q","fact"].some(function(f){return String(e[f]).toLowerCase().indexOf("rocket")>=0})}).length}
function ca9_quiz_has_target(){return QUIZ.filter(function(e){return ["q","fact"].some(function(f){return String(e[f]).toLowerCase().indexOf("target")>=0})}).length}
function ca9_quiz_has_craters(){return QUIZ.filter(function(e){return ["q","fact"].some(function(f){return String(e[f]).toLowerCase().indexOf("craters")>=0})}).length}
function ca9_quiz_has_traps(){return QUIZ.filter(function(e){return ["q","fact"].some(function(f){return String(e[f]).toLowerCase().indexOf("traps")>=0})}).length}
function ca9_quiz_has_preserve(){return QUIZ.filter(function(e){return ["q","fact"].some(function(f){return String(e[f]).toLowerCase().indexOf("preserve")>=0})}).length}
function ca9_quiz_has_close(){return QUIZ.filter(function(e){return ["q","fact"].some(function(f){return String(e[f]).toLowerCase().indexOf("close")>=0})}).length}
function ca9_events_storm_hash(){var s="storm|storm";var h=0;for(var i=0;i<s.length;i++){h=(h*31+s.charCodeAt(i))>>>0}return h}
function ca9_events_micro_hash(){var s="micro|micro";var h=0;for(var i=0;i<s.length;i++){h=(h*31+s.charCodeAt(i))>>>0}return h}
function ca9_events_illness_hash(){var s="illness|illness";var h=0;for(var i=0;i<s.length;i++){h=(h*31+s.charCodeAt(i))>>>0}return h}
function ca9_events_aurora_hash(){var s="aurora|aurora";var h=0;for(var i=0;i<s.length;i++){h=(h*31+s.charCodeAt(i))>>>0}return h}
function ca9_events_quake_hash(){var s="quake|quake";var h=0;for(var i=0;i<s.length;i++){h=(h*31+s.charCodeAt(i))>>>0}return h}
function ca9_events_find_hash(){var s="find|find";var h=0;for(var i=0;i<s.length;i++){h=(h*31+s.charCodeAt(i))>>>0}return h}
function ca9_events_relay_hash(){var s="relay|relay";var h=0;for(var i=0;i<s.length;i++){h=(h*31+s.charCodeAt(i))>>>0}return h}
function ca9_events_calm_hash(){var s="calm|calm";var h=0;for(var i=0;i<s.length;i++){h=(h*31+s.charCodeAt(i))>>>0}return h}
function ca9_events_flare_hash(){var s="flare|flare";var h=0;for(var i=0;i<s.length;i++){h=(h*31+s.charCodeAt(i))>>>0}return h}
function ca9_events_birthday_hash(){var s="birthday|birthday";var h=0;for(var i=0;i<s.length;i++){h=(h*31+s.charCodeAt(i))>>>0}return h}
function ca9_events_stowaway_hash(){var s="stowaway|stowaway";var h=0;for(var i=0;i<s.length;i++){h=(h*31+s.charCodeAt(i))>>>0}return h}
function ca9_events_coolant_hash(){var s="coolant|coolant";var h=0;for(var i=0;i<s.length;i++){h=(h*31+s.charCodeAt(i))>>>0}return h}
function ca9_events_podbonus_hash(){var s="podbonus|podbonus";var h=0;for(var i=0;i<s.length;i++){h=(h*31+s.charCodeAt(i))>>>0}return h}
function ca9_events_breakthrough_hash(){var s="breakthrough|breakthrough";var h=0;for(var i=0;i<s.length;i++){h=(h*31+s.charCodeAt(i))>>>0}return h}
function ca9_events_homesick_hash(){var s="homesick|homesick";var h=0;for(var i=0;i<s.length;i++){h=(h*31+s.charCodeAt(i))>>>0}return h}
function ca9_events_meteorshower_hash(){var s="meteorshower|meteorshower";var h=0;for(var i=0;i<s.length;i++){h=(h*31+s.charCodeAt(i))>>>0}return h}
function ca9_events_o2leak_hash(){var s="o2leak|o2leak";var h=0;for(var i=0;i<s.length;i++){h=(h*31+s.charCodeAt(i))>>>0}return h}
function ca9_events_blight_hash(){var s="blight|blight";var h=0;for(var i=0;i<s.length;i++){h=(h*31+s.charCodeAt(i))>>>0}return h}
function ca9_events_argument_hash(){var s="argument|argument";var h=0;for(var i=0;i<s.length;i++){h=(h*31+s.charCodeAt(i))>>>0}return h}
function ca9_events_dustdevil_hash(){var s="dustdevil|dustdevil";var h=0;for(var i=0;i<s.length;i++){h=(h*31+s.charCodeAt(i))>>>0}return h}
function ca9_events_suitpuncture_hash(){var s="suitpuncture|suitpuncture";var h=0;for(var i=0;i<s.length;i++){h=(h*31+s.charCodeAt(i))>>>0}return h}
function ca9_events_icepocket_hash(){var s="icepocket|icepocket";var h=0;for(var i=0;i<s.length;i++){h=(h*31+s.charCodeAt(i))>>>0}return h}
function ca9_quiz_what_did_nasa_s_moxie_experi_hash(){var s="What did NASA's MOXIE experiment produce from the Martian atmosphere?|What did NASA's MOXIE experiment produce from the Martian atmosphere?";var h=0;for(var i=0;i<s.length;i++){h=(h*31+s.charCodeAt(i))>>>0}return h}
function ca9_quiz_why_do_planners_target_the_m_hash(){var s="Why do planners target the Moon's south pole?|Why do planners target the Moon's south pole?";var h=0;for(var i=0;i<s.length;i++){h=(h*31+s.charCodeAt(i))>>>0}return h}
function ca9_quiz_about_how_long_is_one_martia_hash(){var s="About how long is one Martian sol?|About how long is one Martian sol?";var h=0;for(var i=0;i<s.length;i++){h=(h*31+s.charCodeAt(i))>>>0}return h}
function ca9_quiz_what_is_the_main_component_o_hash(){var s="What is the main component of the Martian atmosphere?|What is the main component of the Martian atmosphere?";var h=0;for(var i=0;i<s.length;i++){h=(h*31+s.charCodeAt(i))>>>0}return h}
function ca9_quiz_how_long_can_a_one_way_radio_hash(){var s="How long can a one-way radio signal take between Earth and Mars?|How long can a one-way radio signal take between Earth and Mars?";var h=0;for(var i=0;i<s.length;i++){h=(h*31+s.charCodeAt(i))>>>0}return h}
function ca9_quiz_what_protects_crews_on_the_i_hash(){var s="What protects crews on the ISS from most radiation?|What protects crews on the ISS from most radiation?";var h=0;for(var i=0;i<s.length;i++){h=(h*31+s.charCodeAt(i))>>>0}return h}
function ca9_quiz_roughly_how_long_is_a_full_l_hash(){var s="Roughly how long is a full lunar day-night cycle?|Roughly how long is a full lunar day-night cycle?";var h=0;for(var i=0;i<s.length;i++){h=(h*31+s.charCodeAt(i))>>>0}return h}
function ca9_quiz_what_do_rtgs_use_to_make_ele_hash(){var s="What do RTGs use to make electricity?|What do RTGs use to make electricity?";var h=0;for(var i=0;i<s.length;i++){h=(h*31+s.charCodeAt(i))>>>0}return h}
function ca9_quiz_why_is_growing_food_on_a_mis_hash(){var s="Why is growing food on a mission valuable?|Why is growing food on a mission valuable?";var h=0;for(var i=0;i<s.length;i++){h=(h*31+s.charCodeAt(i))>>>0}return h}
function ca9_quiz_what_hazard_do_dust_storms_o_hash(){var s="What hazard do dust storms on Mars pose to solar power?|What hazard do dust storms on Mars pose to solar power?";var h=0;for(var i=0;i<s.length;i++){h=(h*31+s.charCodeAt(i))>>>0}return h}
function ca9_quiz_which_program_aims_to_return_hash(){var s="Which program aims to return astronauts to the Moon this decade?|Which program aims to return astronauts to the Moon this decade?";var h=0;for(var i=0;i<s.length;i++){h=(h*31+s.charCodeAt(i))>>>0}return h}
function ca9_quiz_which_telescope_launched_in__hash(){var s="Which telescope launched in 2021 now studies the early universe?|Which telescope launched in 2021 now studies the early universe?";var h=0;for(var i=0;i<s.length;i++){h=(h*31+s.charCodeAt(i))>>>0}return h}
function ca9_quiz_what_makes_lunar_regolith_us_hash(){var s="What makes lunar regolith useful for shielding?|What makes lunar regolith useful for shielding?";var h=0;for(var i=0;i<s.length;i++){h=(h*31+s.charCodeAt(i))>>>0}return h}
function ca9_quiz_what_did_the_sofia_observato_hash(){var s="What did the SOFIA observatory confirm on the Moon's sunlit surface in 2020?|What did the SOFIA observatory confirm on the Moon's sunlit surface in 2020?";var h=0;for(var i=0;i<s.length;i++){h=(h*31+s.charCodeAt(i))>>>0}return h}
function ca9_quiz_why_are_lava_tubes_interesti_hash(){var s="Why are lava tubes interesting to base planners?|Why are lava tubes interesting to base planners?";var h=0;for(var i=0;i<s.length;i++){h=(h*31+s.charCodeAt(i))>>>0}return h}
function ca9_quiz_what_is_isru_hash(){var s="What is ISRU?|What is ISRU?";var h=0;for(var i=0;i<s.length;i++){h=(h*31+s.charCodeAt(i))>>>0}return h}
function ca9_quiz_perchlorate_salts_in_martian_hash(){var s="Perchlorate salts in Martian soil are a concern because they are...|Perchlorate salts in Martian soil are a concern because they are...";var h=0;for(var i=0;i<s.length;i++){h=(h*31+s.charCodeAt(i))>>>0}return h}
function ca9_quiz_which_apollo_mission_turned__hash(){var s="Which Apollo mission turned a crisis into a safe return using the lunar module as a lifeboat?|Which Apollo mission turned a crisis into a safe return using the lunar module as a lifeboat?";var h=0;for(var i=0;i<s.length;i++){h=(h*31+s.charCodeAt(i))>>>0}return h}
function ca9_quiz_why_does_a_greenhouse_on_mar_hash(){var s="Why does a greenhouse on Mars need artificial light even in daytime?|Why does a greenhouse on Mars need artificial light even in daytime?";var h=0;for(var i=0;i<s.length;i++){h=(h*31+s.charCodeAt(i))>>>0}return h}
function ca9_quiz_what_is_a_fair_first_power_s_hash(){var s="What is a fair first power source for a polar lunar base?|What is a fair first power source for a polar lunar base?";var h=0;for(var i=0;i<s.length;i++){h=(h*31+s.charCodeAt(i))>>>0}return h}
function ca9_achievements_firstsol_hash(){var s="firstsol|Boots Down";var h=0;for(var i=0;i<s.length;i++){h=(h*31+s.charCodeAt(i))>>>0}return h}
function ca9_achievements_power50_hash(){var s="power50|Grid Operator";var h=0;for(var i=0;i<s.length;i++){h=(h*31+s.charCodeAt(i))>>>0}return h}
function ca9_achievements_science100_hash(){var s="science100|Lab Rat";var h=0;for(var i=0;i<s.length;i++){h=(h*31+s.charCodeAt(i))>>>0}return h}
function ca9_achievements_shield3_hash(){var s="shield3|Deep Shelter";var h=0;for(var i=0;i<s.length;i++){h=(h*31+s.charCodeAt(i))>>>0}return h}
function ca9_achievements_sol15_hash(){var s="sol15|Two Weeks Out";var h=0;for(var i=0;i<s.length;i++){h=(h*31+s.charCodeAt(i))>>>0}return h}
function ca9_achievements_sol30_hash(){var s="sol30|Mission Complete";var h=0;for(var i=0;i<s.length;i++){h=(h*31+s.charCodeAt(i))>>>0}return h}
function ca9_achievements_fullhouse_hash(){var s="fullhouse|Full House";var h=0;for(var i=0;i<s.length;i++){h=(h*31+s.charCodeAt(i))>>>0}return h}
function ca9_achievements_quiz5_hash(){var s="quiz5|Honor Roll";var h=0;for(var i=0;i<s.length;i++){h=(h*31+s.charCodeAt(i))>>>0}return h}
function ca9_achievements_selfsufficient_hash(){var s="selfsufficient|Closed Loop";var h=0;for(var i=0;i<s.length;i++){h=(h*31+s.charCodeAt(i))>>>0}return h}
function ca9_achievements_survivor_hash(){var s="survivor|Through the Storm";var h=0;for(var i=0;i<s.length;i++){h=(h*31+s.charCodeAt(i))>>>0}return h}
function ca9_achievements_researcher_hash(){var s="researcher|R&D Dept";var h=0;for(var i=0;i<s.length;i++){h=(h*31+s.charCodeAt(i))>>>0}return h}
function ca9_achievements_awayteam_hash(){var s="awayteam|Away Team";var h=0;for(var i=0;i<s.length;i++){h=(h*31+s.charCodeAt(i))>>>0}return h}
function ca9_achievements_veteran_hash(){var s="veteran|Veteran Crew";var h=0;for(var i=0;i<s.length;i++){h=(h*31+s.charCodeAt(i))>>>0}return h}
function ca9_achievements_nightowl_hash(){var s="nightowl|Night Watch";var h=0;for(var i=0;i<s.length;i++){h=(h*31+s.charCodeAt(i))>>>0}return h}
function ca9_achievements_closedloop2_hash(){var s="closedloop2|Nothing Wasted";var h=0;for(var i=0;i<s.length;i++){h=(h*31+s.charCodeAt(i))>>>0}return h}
function ca9_achievements_highscore_hash(){var s="highscore|Mission of Note";var h=0;for(var i=0;i<s.length;i++){h=(h*31+s.charCodeAt(i))>>>0}return h}
function ca9_achievements_crosstrained_hash(){var s="crosstrained|Cross-trained";var h=0;for(var i=0;i<s.length;i++){h=(h*31+s.charCodeAt(i))>>>0}return h}
function ca9_achievements_farmer_hash(){var s="farmer|Crop Science";var h=0;for(var i=0;i<s.length;i++){h=(h*31+s.charCodeAt(i))>>>0}return h}
function da0_achievements_scenario_hash(){var s="scenario|Challenge Accepted";var h=0;for(var i=0;i<s.length;i++){h=(h*31+s.charCodeAt(i))>>>0}return h}
function da0_achievements_hoarder_hash(){var s="hoarder|Parts Hoarder";var h=0;for(var i=0;i<s.length;i++){h=(h*31+s.charCodeAt(i))>>>0}return h}
function da0_events_tag_mars(){return EVENTS.filter(function(e){return e["sites"].map(String).indexOf("mars")>=0}).length}
function da0_events_tag_moon(){return EVENTS.filter(function(e){return e["sites"].map(String).indexOf("moon")>=0}).length}
function da0_events_sites_distinct(){var s={};EVENTS.forEach(function(e){e["sites"].forEach(function(v){s[String(v)]=1})});return Object.keys(s).length}
function da0_quiz_tag_oxygen(){return QUIZ.filter(function(e){return e["a"].map(String).indexOf("Oxygen")>=0}).length}
function da0_quiz_tag_water(){return QUIZ.filter(function(e){return e["a"].map(String).indexOf("Water")>=0}).length}
function da0_quiz_tag_methane(){return QUIZ.filter(function(e){return e["a"].map(String).indexOf("Methane")>=0}).length}
function da0_quiz_tag_hydrogen(){return QUIZ.filter(function(e){return e["a"].map(String).indexOf("Hydrogen")>=0}).length}
function da0_quiz_tag_permanently_shadowed_craters(){return QUIZ.filter(function(e){return e["a"].map(String).indexOf("Permanently shadowed craters may hold water ice")>=0}).length}
function da0_quiz_tag_it_is_the_warmest_region(){return QUIZ.filter(function(e){return e["a"].map(String).indexOf("It is the warmest region")>=0}).length}
function da0_quiz_tag_it_has_the_strongest_gravity(){return QUIZ.filter(function(e){return e["a"].map(String).indexOf("It has the strongest gravity")>=0}).length}
function da0_quiz_tag_it_is_closest_to_earth(){return QUIZ.filter(function(e){return e["a"].map(String).indexOf("It is closest to Earth")>=0}).length}
function da0_quiz_tag_24_hours_37_minutes(){return QUIZ.filter(function(e){return e["a"].map(String).indexOf("24 hours 37 minutes")>=0}).length}
function da0_quiz_tag_12_hours(){return QUIZ.filter(function(e){return e["a"].map(String).indexOf("12 hours")>=0}).length}
function da0_quiz_tag_48_hours(){return QUIZ.filter(function(e){return e["a"].map(String).indexOf("48 hours")>=0}).length}
function da0_quiz_tag_29_5_days(){return QUIZ.filter(function(e){return e["a"].map(String).indexOf("29.5 days")>=0}).length}
function da0_quiz_tag_carbon_dioxide(){return QUIZ.filter(function(e){return e["a"].map(String).indexOf("Carbon dioxide")>=0}).length}
function da0_quiz_tag_nitrogen(){return QUIZ.filter(function(e){return e["a"].map(String).indexOf("Nitrogen")>=0}).length}
function da0_quiz_tag_3_to_22_minutes(){return QUIZ.filter(function(e){return e["a"].map(String).indexOf("3 to 22 minutes")>=0}).length}
function da0_quiz_tag_instant(){return QUIZ.filter(function(e){return e["a"].map(String).indexOf("Instant")>=0}).length}
function da0_quiz_tag_2_seconds(){return QUIZ.filter(function(e){return e["a"].map(String).indexOf("2 seconds")>=0}).length}
function da0_quiz_tag_3_hours(){return QUIZ.filter(function(e){return e["a"].map(String).indexOf("3 hours")>=0}).length}
function da0_quiz_tag_earth_s_magnetosphere(){return QUIZ.filter(function(e){return e["a"].map(String).indexOf("Earth's magnetosphere")>=0}).length}
function da0_quiz_tag_thick_glass(){return QUIZ.filter(function(e){return e["a"].map(String).indexOf("Thick glass")>=0}).length}
function da0_quiz_tag_lead_walls(){return QUIZ.filter(function(e){return e["a"].map(String).indexOf("Lead walls")>=0}).length}
function da0_quiz_tag_the_solar_arrays(){return QUIZ.filter(function(e){return e["a"].map(String).indexOf("The solar arrays")>=0}).length}
function da0_quiz_tag_about_29_5_earth_days(){return QUIZ.filter(function(e){return e["a"].map(String).indexOf("About 29.5 Earth days")>=0}).length}
function da0_quiz_tag_24_hours(){return QUIZ.filter(function(e){return e["a"].map(String).indexOf("24 hours")>=0}).length}
function da0_quiz_tag_7_days(){return QUIZ.filter(function(e){return e["a"].map(String).indexOf("7 days")>=0}).length}
function da0_quiz_tag_365_days(){return QUIZ.filter(function(e){return e["a"].map(String).indexOf("365 days")>=0}).length}
function da0_quiz_tag_heat_from_decaying_plutonium(){return QUIZ.filter(function(e){return e["a"].map(String).indexOf("Heat from decaying plutonium")>=0}).length}
function da0_quiz_tag_burning_methane(){return QUIZ.filter(function(e){return e["a"].map(String).indexOf("Burning methane")>=0}).length}
function da0_quiz_tag_wind_turbines(){return QUIZ.filter(function(e){return e["a"].map(String).indexOf("Wind turbines")>=0}).length}
function da0_quiz_tag_coal_cells(){return QUIZ.filter(function(e){return e["a"].map(String).indexOf("Coal cells")>=0}).length}
function da0_quiz_tag_resupply_from_earth_is_slow_(){return QUIZ.filter(function(e){return e["a"].map(String).indexOf("Resupply from Earth is slow and costly")>=0}).length}
function da0_quiz_tag_plants_glow_nicely(){return QUIZ.filter(function(e){return e["a"].map(String).indexOf("Plants glow nicely")>=0}).length}
function da0_quiz_tag_soil_is_free_in_space(){return QUIZ.filter(function(e){return e["a"].map(String).indexOf("Soil is free in space")>=0}).length}
function da0_quiz_tag_it_removes_all_co2(){return QUIZ.filter(function(e){return e["a"].map(String).indexOf("It removes all CO2")>=0}).length}
function da0_quiz_tag_dust_blocks_sunlight_and_coa(){return QUIZ.filter(function(e){return e["a"].map(String).indexOf("Dust blocks sunlight and coats panels")>=0}).length}
function da0_quiz_tag_dust_freezes_panels(){return QUIZ.filter(function(e){return e["a"].map(String).indexOf("Dust freezes panels")>=0}).length}
function da0_quiz_tag_dust_conducts_electricity(){return QUIZ.filter(function(e){return e["a"].map(String).indexOf("Dust conducts electricity")>=0}).length}
function da0_quiz_tag_no_hazard(){return QUIZ.filter(function(e){return e["a"].map(String).indexOf("No hazard")>=0}).length}
function da0_quiz_tag_artemis(){return QUIZ.filter(function(e){return e["a"].map(String).indexOf("Artemis")>=0}).length}
function da0_quiz_tag_apollo(){return QUIZ.filter(function(e){return e["a"].map(String).indexOf("Apollo")>=0}).length}
function da0_quiz_tag_gemini(){return QUIZ.filter(function(e){return e["a"].map(String).indexOf("Gemini")>=0}).length}
function da0_quiz_tag_mercury(){return QUIZ.filter(function(e){return e["a"].map(String).indexOf("Mercury")>=0}).length}
function da0_quiz_tag_james_webb(){return QUIZ.filter(function(e){return e["a"].map(String).indexOf("James Webb")>=0}).length}
function da0_quiz_tag_hubble(){return QUIZ.filter(function(e){return e["a"].map(String).indexOf("Hubble")>=0}).length}
function da0_quiz_tag_kepler(){return QUIZ.filter(function(e){return e["a"].map(String).indexOf("Kepler")>=0}).length}
function da0_quiz_tag_spitzer(){return QUIZ.filter(function(e){return e["a"].map(String).indexOf("Spitzer")>=0}).length}
function da0_quiz_tag_it_absorbs_radiation_when_pi(){return QUIZ.filter(function(e){return e["a"].map(String).indexOf("It absorbs radiation when piled over habitats")>=0}).length}
function da0_quiz_tag_it_is_magnetic(){return QUIZ.filter(function(e){return e["a"].map(String).indexOf("It is magnetic")>=0}).length}
function da0_quiz_tag_it_glows(){return QUIZ.filter(function(e){return e["a"].map(String).indexOf("It glows")>=0}).length}
function da0_quiz_tag_it_is_radioactive(){return QUIZ.filter(function(e){return e["a"].map(String).indexOf("It is radioactive")>=0}).length}
function da0_quiz_tag_water_molecules(){return QUIZ.filter(function(e){return e["a"].map(String).indexOf("Water molecules")>=0}).length}
function da0_quiz_tag_oil(){return QUIZ.filter(function(e){return e["a"].map(String).indexOf("Oil")>=0}).length}
function da0_quiz_tag_methane_lakes(){return QUIZ.filter(function(e){return e["a"].map(String).indexOf("Methane lakes")>=0}).length}
function da0_quiz_tag_active_volcanoes(){return QUIZ.filter(function(e){return e["a"].map(String).indexOf("Active volcanoes")>=0}).length}
function da0_quiz_tag_natural_caves_give_ready_mad(){return QUIZ.filter(function(e){return e["a"].map(String).indexOf("Natural caves give ready-made radiation shelter")>=0}).length}
function da0_quiz_tag_they_contain_gold(){return QUIZ.filter(function(e){return e["a"].map(String).indexOf("They contain gold")>=0}).length}
function da0_quiz_tag_they_generate_heat(){return QUIZ.filter(function(e){return e["a"].map(String).indexOf("They generate heat")>=0}).length}
function da0_quiz_tag_they_attract_rovers(){return QUIZ.filter(function(e){return e["a"].map(String).indexOf("They attract rovers")>=0}).length}
function da0_quiz_tag_using_local_resources_like_i(){return QUIZ.filter(function(e){return e["a"].map(String).indexOf("Using local resources like ice and regolith instead of shipping everything")>=0}).length}
function da0_quiz_tag_a_rocket_fuel(){return QUIZ.filter(function(e){return e["a"].map(String).indexOf("A rocket fuel")>=0}).length}
function da0_quiz_tag_a_satellite_band(){return QUIZ.filter(function(e){return e["a"].map(String).indexOf("A satellite band")>=0}).length}
function da0_quiz_tag_a_spacesuit_layer(){return QUIZ.filter(function(e){return e["a"].map(String).indexOf("A spacesuit layer")>=0}).length}
function da0_quiz_tag_toxic_to_humans_and_crops(){return QUIZ.filter(function(e){return e["a"].map(String).indexOf("Toxic to humans and crops")>=0}).length}
function da0_quiz_tag_delicious(){return QUIZ.filter(function(e){return e["a"].map(String).indexOf("Delicious")>=0}).length}
function da0_quiz_tag_radioactive(){return QUIZ.filter(function(e){return e["a"].map(String).indexOf("Radioactive")>=0}).length}
function da0_quiz_tag_explosive(){return QUIZ.filter(function(e){return e["a"].map(String).indexOf("Explosive")>=0}).length}
function da0_quiz_tag_apollo_13(){return QUIZ.filter(function(e){return e["a"].map(String).indexOf("Apollo 13")>=0}).length}
function da0_quiz_tag_apollo_11(){return QUIZ.filter(function(e){return e["a"].map(String).indexOf("Apollo 11")>=0}).length}
function da0_quiz_tag_apollo_8(){return QUIZ.filter(function(e){return e["a"].map(String).indexOf("Apollo 8")>=0}).length}
function da0_quiz_tag_apollo_17(){return QUIZ.filter(function(e){return e["a"].map(String).indexOf("Apollo 17")>=0}).length}
function da0_quiz_tag_sunlight_there_is_weaker_and(){return QUIZ.filter(function(e){return e["a"].map(String).indexOf("Sunlight there is weaker and dusty")>=0}).length}
function da0_quiz_tag_plants_fear_mars(){return QUIZ.filter(function(e){return e["a"].map(String).indexOf("Plants fear Mars")>=0}).length}
function da0_quiz_tag_glass_freezes(){return QUIZ.filter(function(e){return e["a"].map(String).indexOf("Glass freezes")>=0}).length}
function da0_quiz_tag_it_doesn_t(){return QUIZ.filter(function(e){return e["a"].map(String).indexOf("It doesn't")>=0}).length}
function da0_quiz_tag_solar_arrays_on_illuminated_(){return QUIZ.filter(function(e){return e["a"].map(String).indexOf("Solar arrays on illuminated ridges")>=0}).length}
function da0_quiz_tag_coal_plant(){return QUIZ.filter(function(e){return e["a"].map(String).indexOf("Coal plant")>=0}).length}
function da0_quiz_tag_wind_farm(){return QUIZ.filter(function(e){return e["a"].map(String).indexOf("Wind farm")>=0}).length}
function da0_quiz_tag_tidal_generator(){return QUIZ.filter(function(e){return e["a"].map(String).indexOf("Tidal generator")>=0}).length}
function da0_quiz_a_distinct(){var s={};QUIZ.forEach(function(e){e["a"].forEach(function(v){s[String(v)]=1})});return Object.keys(s).length}
function da0_storm_has_moon(){var e=(function(){var a=EVENTS;for(var i=0;i<a.length;i++){if(String(a[i]["id"])==="storm"){return a[i]}}return null})();return e?e["sites"].map(String).indexOf("moon")>=0:false}
function da0_storm_has_mars(){var e=(function(){var a=EVENTS;for(var i=0;i<a.length;i++){if(String(a[i]["id"])==="storm"){return a[i]}}return null})();return e?e["sites"].map(String).indexOf("mars")>=0:false}
function da0_micro_has_moon(){var e=(function(){var a=EVENTS;for(var i=0;i<a.length;i++){if(String(a[i]["id"])==="micro"){return a[i]}}return null})();return e?e["sites"].map(String).indexOf("moon")>=0:false}
function da0_micro_has_mars(){var e=(function(){var a=EVENTS;for(var i=0;i<a.length;i++){if(String(a[i]["id"])==="micro"){return a[i]}}return null})();return e?e["sites"].map(String).indexOf("mars")>=0:false}
function da0_illness_has_moon(){var e=(function(){var a=EVENTS;for(var i=0;i<a.length;i++){if(String(a[i]["id"])==="illness"){return a[i]}}return null})();return e?e["sites"].map(String).indexOf("moon")>=0:false}
function da0_illness_has_mars(){var e=(function(){var a=EVENTS;for(var i=0;i<a.length;i++){if(String(a[i]["id"])==="illness"){return a[i]}}return null})();return e?e["sites"].map(String).indexOf("mars")>=0:false}
function da0_aurora_has_moon(){var e=(function(){var a=EVENTS;for(var i=0;i<a.length;i++){if(String(a[i]["id"])==="aurora"){return a[i]}}return null})();return e?e["sites"].map(String).indexOf("moon")>=0:false}
function da0_aurora_has_mars(){var e=(function(){var a=EVENTS;for(var i=0;i<a.length;i++){if(String(a[i]["id"])==="aurora"){return a[i]}}return null})();return e?e["sites"].map(String).indexOf("mars")>=0:false}
function da0_quake_has_moon(){var e=(function(){var a=EVENTS;for(var i=0;i<a.length;i++){if(String(a[i]["id"])==="quake"){return a[i]}}return null})();return e?e["sites"].map(String).indexOf("moon")>=0:false}
function da0_quake_has_mars(){var e=(function(){var a=EVENTS;for(var i=0;i<a.length;i++){if(String(a[i]["id"])==="quake"){return a[i]}}return null})();return e?e["sites"].map(String).indexOf("mars")>=0:false}
function da0_find_has_moon(){var e=(function(){var a=EVENTS;for(var i=0;i<a.length;i++){if(String(a[i]["id"])==="find"){return a[i]}}return null})();return e?e["sites"].map(String).indexOf("moon")>=0:false}
function da0_find_has_mars(){var e=(function(){var a=EVENTS;for(var i=0;i<a.length;i++){if(String(a[i]["id"])==="find"){return a[i]}}return null})();return e?e["sites"].map(String).indexOf("mars")>=0:false}
function da0_relay_has_moon(){var e=(function(){var a=EVENTS;for(var i=0;i<a.length;i++){if(String(a[i]["id"])==="relay"){return a[i]}}return null})();return e?e["sites"].map(String).indexOf("moon")>=0:false}
function da0_relay_has_mars(){var e=(function(){var a=EVENTS;for(var i=0;i<a.length;i++){if(String(a[i]["id"])==="relay"){return a[i]}}return null})();return e?e["sites"].map(String).indexOf("mars")>=0:false}
function da0_calm_has_moon(){var e=(function(){var a=EVENTS;for(var i=0;i<a.length;i++){if(String(a[i]["id"])==="calm"){return a[i]}}return null})();return e?e["sites"].map(String).indexOf("moon")>=0:false}
function da0_calm_has_mars(){var e=(function(){var a=EVENTS;for(var i=0;i<a.length;i++){if(String(a[i]["id"])==="calm"){return a[i]}}return null})();return e?e["sites"].map(String).indexOf("mars")>=0:false}
function da0_flare_has_moon(){var e=(function(){var a=EVENTS;for(var i=0;i<a.length;i++){if(String(a[i]["id"])==="flare"){return a[i]}}return null})();return e?e["sites"].map(String).indexOf("moon")>=0:false}
function da0_flare_has_mars(){var e=(function(){var a=EVENTS;for(var i=0;i<a.length;i++){if(String(a[i]["id"])==="flare"){return a[i]}}return null})();return e?e["sites"].map(String).indexOf("mars")>=0:false}
function da0_birthday_has_moon(){var e=(function(){var a=EVENTS;for(var i=0;i<a.length;i++){if(String(a[i]["id"])==="birthday"){return a[i]}}return null})();return e?e["sites"].map(String).indexOf("moon")>=0:false}
function da0_birthday_has_mars(){var e=(function(){var a=EVENTS;for(var i=0;i<a.length;i++){if(String(a[i]["id"])==="birthday"){return a[i]}}return null})();return e?e["sites"].map(String).indexOf("mars")>=0:false}
function da0_stowaway_has_moon(){var e=(function(){var a=EVENTS;for(var i=0;i<a.length;i++){if(String(a[i]["id"])==="stowaway"){return a[i]}}return null})();return e?e["sites"].map(String).indexOf("moon")>=0:false}
function da0_stowaway_has_mars(){var e=(function(){var a=EVENTS;for(var i=0;i<a.length;i++){if(String(a[i]["id"])==="stowaway"){return a[i]}}return null})();return e?e["sites"].map(String).indexOf("mars")>=0:false}
function da0_coolant_has_moon(){var e=(function(){var a=EVENTS;for(var i=0;i<a.length;i++){if(String(a[i]["id"])==="coolant"){return a[i]}}return null})();return e?e["sites"].map(String).indexOf("moon")>=0:false}
function da0_coolant_has_mars(){var e=(function(){var a=EVENTS;for(var i=0;i<a.length;i++){if(String(a[i]["id"])==="coolant"){return a[i]}}return null})();return e?e["sites"].map(String).indexOf("mars")>=0:false}
function da0_podbonus_has_moon(){var e=(function(){var a=EVENTS;for(var i=0;i<a.length;i++){if(String(a[i]["id"])==="podbonus"){return a[i]}}return null})();return e?e["sites"].map(String).indexOf("moon")>=0:false}
function da0_podbonus_has_mars(){var e=(function(){var a=EVENTS;for(var i=0;i<a.length;i++){if(String(a[i]["id"])==="podbonus"){return a[i]}}return null})();return e?e["sites"].map(String).indexOf("mars")>=0:false}
function da0_breakthrough_has_moon(){var e=(function(){var a=EVENTS;for(var i=0;i<a.length;i++){if(String(a[i]["id"])==="breakthrough"){return a[i]}}return null})();return e?e["sites"].map(String).indexOf("moon")>=0:false}
function da0_breakthrough_has_mars(){var e=(function(){var a=EVENTS;for(var i=0;i<a.length;i++){if(String(a[i]["id"])==="breakthrough"){return a[i]}}return null})();return e?e["sites"].map(String).indexOf("mars")>=0:false}
function da0_homesick_has_moon(){var e=(function(){var a=EVENTS;for(var i=0;i<a.length;i++){if(String(a[i]["id"])==="homesick"){return a[i]}}return null})();return e?e["sites"].map(String).indexOf("moon")>=0:false}
function da0_homesick_has_mars(){var e=(function(){var a=EVENTS;for(var i=0;i<a.length;i++){if(String(a[i]["id"])==="homesick"){return a[i]}}return null})();return e?e["sites"].map(String).indexOf("mars")>=0:false}
function da0_meteorshower_has_moon(){var e=(function(){var a=EVENTS;for(var i=0;i<a.length;i++){if(String(a[i]["id"])==="meteorshower"){return a[i]}}return null})();return e?e["sites"].map(String).indexOf("moon")>=0:false}
function da0_meteorshower_has_mars(){var e=(function(){var a=EVENTS;for(var i=0;i<a.length;i++){if(String(a[i]["id"])==="meteorshower"){return a[i]}}return null})();return e?e["sites"].map(String).indexOf("mars")>=0:false}
function da0_o2leak_has_moon(){var e=(function(){var a=EVENTS;for(var i=0;i<a.length;i++){if(String(a[i]["id"])==="o2leak"){return a[i]}}return null})();return e?e["sites"].map(String).indexOf("moon")>=0:false}
function da0_o2leak_has_mars(){var e=(function(){var a=EVENTS;for(var i=0;i<a.length;i++){if(String(a[i]["id"])==="o2leak"){return a[i]}}return null})();return e?e["sites"].map(String).indexOf("mars")>=0:false}
function da0_blight_has_moon(){var e=(function(){var a=EVENTS;for(var i=0;i<a.length;i++){if(String(a[i]["id"])==="blight"){return a[i]}}return null})();return e?e["sites"].map(String).indexOf("moon")>=0:false}
function da0_blight_has_mars(){var e=(function(){var a=EVENTS;for(var i=0;i<a.length;i++){if(String(a[i]["id"])==="blight"){return a[i]}}return null})();return e?e["sites"].map(String).indexOf("mars")>=0:false}
function da0_argument_has_moon(){var e=(function(){var a=EVENTS;for(var i=0;i<a.length;i++){if(String(a[i]["id"])==="argument"){return a[i]}}return null})();return e?e["sites"].map(String).indexOf("moon")>=0:false}
function da0_argument_has_mars(){var e=(function(){var a=EVENTS;for(var i=0;i<a.length;i++){if(String(a[i]["id"])==="argument"){return a[i]}}return null})();return e?e["sites"].map(String).indexOf("mars")>=0:false}
function da0_dustdevil_has_moon(){var e=(function(){var a=EVENTS;for(var i=0;i<a.length;i++){if(String(a[i]["id"])==="dustdevil"){return a[i]}}return null})();return e?e["sites"].map(String).indexOf("moon")>=0:false}
function da0_dustdevil_has_mars(){var e=(function(){var a=EVENTS;for(var i=0;i<a.length;i++){if(String(a[i]["id"])==="dustdevil"){return a[i]}}return null})();return e?e["sites"].map(String).indexOf("mars")>=0:false}
function da0_suitpuncture_has_moon(){var e=(function(){var a=EVENTS;for(var i=0;i<a.length;i++){if(String(a[i]["id"])==="suitpuncture"){return a[i]}}return null})();return e?e["sites"].map(String).indexOf("moon")>=0:false}
function da0_suitpuncture_has_mars(){var e=(function(){var a=EVENTS;for(var i=0;i<a.length;i++){if(String(a[i]["id"])==="suitpuncture"){return a[i]}}return null})();return e?e["sites"].map(String).indexOf("mars")>=0:false}
function da0_icepocket_has_moon(){var e=(function(){var a=EVENTS;for(var i=0;i<a.length;i++){if(String(a[i]["id"])==="icepocket"){return a[i]}}return null})();return e?e["sites"].map(String).indexOf("moon")>=0:false}
function da0_icepocket_has_mars(){var e=(function(){var a=EVENTS;for(var i=0;i<a.length;i++){if(String(a[i]["id"])==="icepocket"){return a[i]}}return null})();return e?e["sites"].map(String).indexOf("mars")>=0:false}
function da0_what_did_nasa_s_moxie_experi_has_oxygen(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="What did NASA's MOXIE experiment produce from the Martian atmosphere?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("Oxygen")>=0:false}
function da0_what_did_nasa_s_moxie_experi_has_methane(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="What did NASA's MOXIE experiment produce from the Martian atmosphere?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("Methane")>=0:false}
function da0_what_did_nasa_s_moxie_experi_has_water(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="What did NASA's MOXIE experiment produce from the Martian atmosphere?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("Water")>=0:false}
function da0_what_did_nasa_s_moxie_experi_has_hydrogen(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="What did NASA's MOXIE experiment produce from the Martian atmosphere?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("Hydrogen")>=0:false}
function da0_what_did_nasa_s_moxie_experi_has_permanently_shadowed_craters(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="What did NASA's MOXIE experiment produce from the Martian atmosphere?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("Permanently shadowed craters may hold water ice")>=0:false}
function da0_what_did_nasa_s_moxie_experi_has_it_is_the_warmest_region(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="What did NASA's MOXIE experiment produce from the Martian atmosphere?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("It is the warmest region")>=0:false}
function da0_what_did_nasa_s_moxie_experi_has_it_has_the_strongest_gravity(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="What did NASA's MOXIE experiment produce from the Martian atmosphere?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("It has the strongest gravity")>=0:false}
function da0_what_did_nasa_s_moxie_experi_has_it_is_closest_to_earth(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="What did NASA's MOXIE experiment produce from the Martian atmosphere?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("It is closest to Earth")>=0:false}
function da0_what_did_nasa_s_moxie_experi_has_24_hours_37_minutes(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="What did NASA's MOXIE experiment produce from the Martian atmosphere?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("24 hours 37 minutes")>=0:false}
function da0_what_did_nasa_s_moxie_experi_has_12_hours(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="What did NASA's MOXIE experiment produce from the Martian atmosphere?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("12 hours")>=0:false}
function da0_what_did_nasa_s_moxie_experi_has_48_hours(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="What did NASA's MOXIE experiment produce from the Martian atmosphere?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("48 hours")>=0:false}
function da0_what_did_nasa_s_moxie_experi_has_29_5_days(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="What did NASA's MOXIE experiment produce from the Martian atmosphere?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("29.5 days")>=0:false}
function da0_what_did_nasa_s_moxie_experi_has_carbon_dioxide(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="What did NASA's MOXIE experiment produce from the Martian atmosphere?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("Carbon dioxide")>=0:false}
function da0_what_did_nasa_s_moxie_experi_has_nitrogen(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="What did NASA's MOXIE experiment produce from the Martian atmosphere?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("Nitrogen")>=0:false}
function da0_what_did_nasa_s_moxie_experi_has_3_to_22_minutes(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="What did NASA's MOXIE experiment produce from the Martian atmosphere?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("3 to 22 minutes")>=0:false}
function da0_what_did_nasa_s_moxie_experi_has_instant(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="What did NASA's MOXIE experiment produce from the Martian atmosphere?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("Instant")>=0:false}
function da0_what_did_nasa_s_moxie_experi_has_2_seconds(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="What did NASA's MOXIE experiment produce from the Martian atmosphere?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("2 seconds")>=0:false}
function da0_what_did_nasa_s_moxie_experi_has_3_hours(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="What did NASA's MOXIE experiment produce from the Martian atmosphere?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("3 hours")>=0:false}
function da0_what_did_nasa_s_moxie_experi_has_earth_s_magnetosphere(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="What did NASA's MOXIE experiment produce from the Martian atmosphere?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("Earth's magnetosphere")>=0:false}
function da0_what_did_nasa_s_moxie_experi_has_thick_glass(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="What did NASA's MOXIE experiment produce from the Martian atmosphere?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("Thick glass")>=0:false}
function da0_what_did_nasa_s_moxie_experi_has_lead_walls(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="What did NASA's MOXIE experiment produce from the Martian atmosphere?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("Lead walls")>=0:false}
function da0_what_did_nasa_s_moxie_experi_has_the_solar_arrays(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="What did NASA's MOXIE experiment produce from the Martian atmosphere?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("The solar arrays")>=0:false}
function da0_what_did_nasa_s_moxie_experi_has_about_29_5_earth_days(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="What did NASA's MOXIE experiment produce from the Martian atmosphere?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("About 29.5 Earth days")>=0:false}
function da0_what_did_nasa_s_moxie_experi_has_24_hours(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="What did NASA's MOXIE experiment produce from the Martian atmosphere?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("24 hours")>=0:false}
function da0_what_did_nasa_s_moxie_experi_has_7_days(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="What did NASA's MOXIE experiment produce from the Martian atmosphere?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("7 days")>=0:false}
function da0_what_did_nasa_s_moxie_experi_has_365_days(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="What did NASA's MOXIE experiment produce from the Martian atmosphere?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("365 days")>=0:false}
function da0_what_did_nasa_s_moxie_experi_has_heat_from_decaying_plutonium(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="What did NASA's MOXIE experiment produce from the Martian atmosphere?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("Heat from decaying plutonium")>=0:false}
function da0_what_did_nasa_s_moxie_experi_has_burning_methane(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="What did NASA's MOXIE experiment produce from the Martian atmosphere?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("Burning methane")>=0:false}
function da0_what_did_nasa_s_moxie_experi_has_wind_turbines(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="What did NASA's MOXIE experiment produce from the Martian atmosphere?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("Wind turbines")>=0:false}
function da0_what_did_nasa_s_moxie_experi_has_coal_cells(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="What did NASA's MOXIE experiment produce from the Martian atmosphere?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("Coal cells")>=0:false}
function da0_what_did_nasa_s_moxie_experi_has_resupply_from_earth_is_slow_(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="What did NASA's MOXIE experiment produce from the Martian atmosphere?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("Resupply from Earth is slow and costly")>=0:false}
function da0_what_did_nasa_s_moxie_experi_has_plants_glow_nicely(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="What did NASA's MOXIE experiment produce from the Martian atmosphere?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("Plants glow nicely")>=0:false}
function ea1_what_did_nasa_s_moxie_experi_has_soil_is_free_in_space(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="What did NASA's MOXIE experiment produce from the Martian atmosphere?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("Soil is free in space")>=0:false}
function ea1_what_did_nasa_s_moxie_experi_has_it_removes_all_co2(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="What did NASA's MOXIE experiment produce from the Martian atmosphere?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("It removes all CO2")>=0:false}
function ea1_what_did_nasa_s_moxie_experi_has_dust_blocks_sunlight_and_coa(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="What did NASA's MOXIE experiment produce from the Martian atmosphere?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("Dust blocks sunlight and coats panels")>=0:false}
function ea1_what_did_nasa_s_moxie_experi_has_dust_freezes_panels(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="What did NASA's MOXIE experiment produce from the Martian atmosphere?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("Dust freezes panels")>=0:false}
function ea1_what_did_nasa_s_moxie_experi_has_dust_conducts_electricity(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="What did NASA's MOXIE experiment produce from the Martian atmosphere?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("Dust conducts electricity")>=0:false}
function ea1_what_did_nasa_s_moxie_experi_has_no_hazard(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="What did NASA's MOXIE experiment produce from the Martian atmosphere?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("No hazard")>=0:false}
function ea1_what_did_nasa_s_moxie_experi_has_artemis(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="What did NASA's MOXIE experiment produce from the Martian atmosphere?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("Artemis")>=0:false}
function ea1_what_did_nasa_s_moxie_experi_has_apollo(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="What did NASA's MOXIE experiment produce from the Martian atmosphere?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("Apollo")>=0:false}
function ea1_why_do_planners_target_the_m_has_oxygen(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="Why do planners target the Moon's south pole?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("Oxygen")>=0:false}
function ea1_why_do_planners_target_the_m_has_methane(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="Why do planners target the Moon's south pole?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("Methane")>=0:false}
function ea1_why_do_planners_target_the_m_has_water(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="Why do planners target the Moon's south pole?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("Water")>=0:false}
function ea1_why_do_planners_target_the_m_has_hydrogen(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="Why do planners target the Moon's south pole?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("Hydrogen")>=0:false}
function ea1_why_do_planners_target_the_m_has_permanently_shadowed_craters(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="Why do planners target the Moon's south pole?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("Permanently shadowed craters may hold water ice")>=0:false}
function ea1_why_do_planners_target_the_m_has_it_is_the_warmest_region(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="Why do planners target the Moon's south pole?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("It is the warmest region")>=0:false}
function ea1_why_do_planners_target_the_m_has_it_has_the_strongest_gravity(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="Why do planners target the Moon's south pole?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("It has the strongest gravity")>=0:false}
function ea1_why_do_planners_target_the_m_has_it_is_closest_to_earth(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="Why do planners target the Moon's south pole?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("It is closest to Earth")>=0:false}
function ea1_why_do_planners_target_the_m_has_24_hours_37_minutes(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="Why do planners target the Moon's south pole?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("24 hours 37 minutes")>=0:false}
function ea1_why_do_planners_target_the_m_has_12_hours(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="Why do planners target the Moon's south pole?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("12 hours")>=0:false}
function ea1_why_do_planners_target_the_m_has_48_hours(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="Why do planners target the Moon's south pole?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("48 hours")>=0:false}
function ea1_why_do_planners_target_the_m_has_29_5_days(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="Why do planners target the Moon's south pole?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("29.5 days")>=0:false}
function ea1_why_do_planners_target_the_m_has_carbon_dioxide(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="Why do planners target the Moon's south pole?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("Carbon dioxide")>=0:false}
function ea1_why_do_planners_target_the_m_has_nitrogen(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="Why do planners target the Moon's south pole?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("Nitrogen")>=0:false}
function ea1_why_do_planners_target_the_m_has_3_to_22_minutes(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="Why do planners target the Moon's south pole?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("3 to 22 minutes")>=0:false}
function ea1_why_do_planners_target_the_m_has_instant(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="Why do planners target the Moon's south pole?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("Instant")>=0:false}
function ea1_why_do_planners_target_the_m_has_2_seconds(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="Why do planners target the Moon's south pole?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("2 seconds")>=0:false}
function ea1_why_do_planners_target_the_m_has_3_hours(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="Why do planners target the Moon's south pole?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("3 hours")>=0:false}
function ea1_why_do_planners_target_the_m_has_earth_s_magnetosphere(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="Why do planners target the Moon's south pole?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("Earth's magnetosphere")>=0:false}
function ea1_why_do_planners_target_the_m_has_thick_glass(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="Why do planners target the Moon's south pole?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("Thick glass")>=0:false}
function ea1_why_do_planners_target_the_m_has_lead_walls(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="Why do planners target the Moon's south pole?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("Lead walls")>=0:false}
function ea1_why_do_planners_target_the_m_has_the_solar_arrays(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="Why do planners target the Moon's south pole?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("The solar arrays")>=0:false}
function ea1_why_do_planners_target_the_m_has_about_29_5_earth_days(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="Why do planners target the Moon's south pole?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("About 29.5 Earth days")>=0:false}
function ea1_why_do_planners_target_the_m_has_24_hours(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="Why do planners target the Moon's south pole?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("24 hours")>=0:false}
function ea1_why_do_planners_target_the_m_has_7_days(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="Why do planners target the Moon's south pole?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("7 days")>=0:false}
function ea1_why_do_planners_target_the_m_has_365_days(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="Why do planners target the Moon's south pole?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("365 days")>=0:false}
function ea1_why_do_planners_target_the_m_has_heat_from_decaying_plutonium(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="Why do planners target the Moon's south pole?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("Heat from decaying plutonium")>=0:false}
function ea1_why_do_planners_target_the_m_has_burning_methane(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="Why do planners target the Moon's south pole?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("Burning methane")>=0:false}
function ea1_why_do_planners_target_the_m_has_wind_turbines(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="Why do planners target the Moon's south pole?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("Wind turbines")>=0:false}
function ea1_why_do_planners_target_the_m_has_coal_cells(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="Why do planners target the Moon's south pole?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("Coal cells")>=0:false}
function ea1_why_do_planners_target_the_m_has_resupply_from_earth_is_slow_(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="Why do planners target the Moon's south pole?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("Resupply from Earth is slow and costly")>=0:false}
function ea1_why_do_planners_target_the_m_has_plants_glow_nicely(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="Why do planners target the Moon's south pole?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("Plants glow nicely")>=0:false}
function ea1_why_do_planners_target_the_m_has_soil_is_free_in_space(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="Why do planners target the Moon's south pole?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("Soil is free in space")>=0:false}
function ea1_why_do_planners_target_the_m_has_it_removes_all_co2(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="Why do planners target the Moon's south pole?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("It removes all CO2")>=0:false}
function ea1_why_do_planners_target_the_m_has_dust_blocks_sunlight_and_coa(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="Why do planners target the Moon's south pole?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("Dust blocks sunlight and coats panels")>=0:false}
function ea1_why_do_planners_target_the_m_has_dust_freezes_panels(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="Why do planners target the Moon's south pole?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("Dust freezes panels")>=0:false}
function ea1_why_do_planners_target_the_m_has_dust_conducts_electricity(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="Why do planners target the Moon's south pole?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("Dust conducts electricity")>=0:false}
function ea1_why_do_planners_target_the_m_has_no_hazard(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="Why do planners target the Moon's south pole?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("No hazard")>=0:false}
function ea1_why_do_planners_target_the_m_has_artemis(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="Why do planners target the Moon's south pole?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("Artemis")>=0:false}
function ea1_why_do_planners_target_the_m_has_apollo(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="Why do planners target the Moon's south pole?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("Apollo")>=0:false}
function ea1_about_how_long_is_one_martia_has_oxygen(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="About how long is one Martian sol?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("Oxygen")>=0:false}
function ea1_about_how_long_is_one_martia_has_methane(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="About how long is one Martian sol?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("Methane")>=0:false}
function ea1_about_how_long_is_one_martia_has_water(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="About how long is one Martian sol?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("Water")>=0:false}
function ea1_about_how_long_is_one_martia_has_hydrogen(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="About how long is one Martian sol?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("Hydrogen")>=0:false}
function ea1_about_how_long_is_one_martia_has_permanently_shadowed_craters(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="About how long is one Martian sol?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("Permanently shadowed craters may hold water ice")>=0:false}
function ea1_about_how_long_is_one_martia_has_it_is_the_warmest_region(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="About how long is one Martian sol?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("It is the warmest region")>=0:false}
function ea1_about_how_long_is_one_martia_has_it_has_the_strongest_gravity(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="About how long is one Martian sol?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("It has the strongest gravity")>=0:false}
function ea1_about_how_long_is_one_martia_has_it_is_closest_to_earth(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="About how long is one Martian sol?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("It is closest to Earth")>=0:false}
function ea1_about_how_long_is_one_martia_has_24_hours_37_minutes(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="About how long is one Martian sol?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("24 hours 37 minutes")>=0:false}
function ea1_about_how_long_is_one_martia_has_12_hours(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="About how long is one Martian sol?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("12 hours")>=0:false}
function ea1_about_how_long_is_one_martia_has_48_hours(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="About how long is one Martian sol?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("48 hours")>=0:false}
function ea1_about_how_long_is_one_martia_has_29_5_days(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="About how long is one Martian sol?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("29.5 days")>=0:false}
function ea1_about_how_long_is_one_martia_has_carbon_dioxide(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="About how long is one Martian sol?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("Carbon dioxide")>=0:false}
function ea1_about_how_long_is_one_martia_has_nitrogen(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="About how long is one Martian sol?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("Nitrogen")>=0:false}
function ea1_about_how_long_is_one_martia_has_3_to_22_minutes(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="About how long is one Martian sol?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("3 to 22 minutes")>=0:false}
function ea1_about_how_long_is_one_martia_has_instant(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="About how long is one Martian sol?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("Instant")>=0:false}
function ea1_about_how_long_is_one_martia_has_2_seconds(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="About how long is one Martian sol?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("2 seconds")>=0:false}
function ea1_about_how_long_is_one_martia_has_3_hours(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="About how long is one Martian sol?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("3 hours")>=0:false}
function ea1_about_how_long_is_one_martia_has_earth_s_magnetosphere(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="About how long is one Martian sol?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("Earth's magnetosphere")>=0:false}
function ea1_about_how_long_is_one_martia_has_thick_glass(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="About how long is one Martian sol?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("Thick glass")>=0:false}
function ea1_about_how_long_is_one_martia_has_lead_walls(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="About how long is one Martian sol?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("Lead walls")>=0:false}
function ea1_about_how_long_is_one_martia_has_the_solar_arrays(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="About how long is one Martian sol?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("The solar arrays")>=0:false}
function ea1_about_how_long_is_one_martia_has_about_29_5_earth_days(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="About how long is one Martian sol?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("About 29.5 Earth days")>=0:false}
function ea1_about_how_long_is_one_martia_has_24_hours(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="About how long is one Martian sol?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("24 hours")>=0:false}
function ea1_about_how_long_is_one_martia_has_7_days(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="About how long is one Martian sol?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("7 days")>=0:false}
function ea1_about_how_long_is_one_martia_has_365_days(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="About how long is one Martian sol?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("365 days")>=0:false}
function ea1_about_how_long_is_one_martia_has_heat_from_decaying_plutonium(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="About how long is one Martian sol?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("Heat from decaying plutonium")>=0:false}
function ea1_about_how_long_is_one_martia_has_burning_methane(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="About how long is one Martian sol?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("Burning methane")>=0:false}
function ea1_about_how_long_is_one_martia_has_wind_turbines(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="About how long is one Martian sol?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("Wind turbines")>=0:false}
function ea1_about_how_long_is_one_martia_has_coal_cells(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="About how long is one Martian sol?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("Coal cells")>=0:false}
function ea1_about_how_long_is_one_martia_has_resupply_from_earth_is_slow_(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="About how long is one Martian sol?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("Resupply from Earth is slow and costly")>=0:false}
function ea1_about_how_long_is_one_martia_has_plants_glow_nicely(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="About how long is one Martian sol?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("Plants glow nicely")>=0:false}
function ea1_about_how_long_is_one_martia_has_soil_is_free_in_space(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="About how long is one Martian sol?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("Soil is free in space")>=0:false}
function ea1_about_how_long_is_one_martia_has_it_removes_all_co2(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="About how long is one Martian sol?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("It removes all CO2")>=0:false}
function ea1_about_how_long_is_one_martia_has_dust_blocks_sunlight_and_coa(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="About how long is one Martian sol?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("Dust blocks sunlight and coats panels")>=0:false}
function ea1_about_how_long_is_one_martia_has_dust_freezes_panels(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="About how long is one Martian sol?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("Dust freezes panels")>=0:false}
function ea1_about_how_long_is_one_martia_has_dust_conducts_electricity(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="About how long is one Martian sol?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("Dust conducts electricity")>=0:false}
function ea1_about_how_long_is_one_martia_has_no_hazard(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="About how long is one Martian sol?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("No hazard")>=0:false}
function ea1_about_how_long_is_one_martia_has_artemis(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="About how long is one Martian sol?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("Artemis")>=0:false}
function ea1_about_how_long_is_one_martia_has_apollo(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="About how long is one Martian sol?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("Apollo")>=0:false}
function ea1_what_is_the_main_component_o_has_oxygen(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="What is the main component of the Martian atmosphere?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("Oxygen")>=0:false}
function ea1_what_is_the_main_component_o_has_methane(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="What is the main component of the Martian atmosphere?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("Methane")>=0:false}
function ea1_what_is_the_main_component_o_has_water(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="What is the main component of the Martian atmosphere?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("Water")>=0:false}
function ea1_what_is_the_main_component_o_has_hydrogen(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="What is the main component of the Martian atmosphere?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("Hydrogen")>=0:false}
function ea1_what_is_the_main_component_o_has_permanently_shadowed_craters(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="What is the main component of the Martian atmosphere?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("Permanently shadowed craters may hold water ice")>=0:false}
function ea1_what_is_the_main_component_o_has_it_is_the_warmest_region(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="What is the main component of the Martian atmosphere?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("It is the warmest region")>=0:false}
function ea1_what_is_the_main_component_o_has_it_has_the_strongest_gravity(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="What is the main component of the Martian atmosphere?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("It has the strongest gravity")>=0:false}
function ea1_what_is_the_main_component_o_has_it_is_closest_to_earth(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="What is the main component of the Martian atmosphere?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("It is closest to Earth")>=0:false}
function ea1_what_is_the_main_component_o_has_24_hours_37_minutes(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="What is the main component of the Martian atmosphere?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("24 hours 37 minutes")>=0:false}
function ea1_what_is_the_main_component_o_has_12_hours(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="What is the main component of the Martian atmosphere?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("12 hours")>=0:false}
function ea1_what_is_the_main_component_o_has_48_hours(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="What is the main component of the Martian atmosphere?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("48 hours")>=0:false}
function ea1_what_is_the_main_component_o_has_29_5_days(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="What is the main component of the Martian atmosphere?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("29.5 days")>=0:false}
function ea1_what_is_the_main_component_o_has_carbon_dioxide(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="What is the main component of the Martian atmosphere?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("Carbon dioxide")>=0:false}
function ea1_what_is_the_main_component_o_has_nitrogen(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="What is the main component of the Martian atmosphere?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("Nitrogen")>=0:false}
function ea1_what_is_the_main_component_o_has_3_to_22_minutes(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="What is the main component of the Martian atmosphere?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("3 to 22 minutes")>=0:false}
function ea1_what_is_the_main_component_o_has_instant(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="What is the main component of the Martian atmosphere?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("Instant")>=0:false}
function ea1_what_is_the_main_component_o_has_2_seconds(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="What is the main component of the Martian atmosphere?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("2 seconds")>=0:false}
function ea1_what_is_the_main_component_o_has_3_hours(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="What is the main component of the Martian atmosphere?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("3 hours")>=0:false}
function ea1_what_is_the_main_component_o_has_earth_s_magnetosphere(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="What is the main component of the Martian atmosphere?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("Earth's magnetosphere")>=0:false}
function ea1_what_is_the_main_component_o_has_thick_glass(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="What is the main component of the Martian atmosphere?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("Thick glass")>=0:false}
function ea1_what_is_the_main_component_o_has_lead_walls(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="What is the main component of the Martian atmosphere?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("Lead walls")>=0:false}
function ea1_what_is_the_main_component_o_has_the_solar_arrays(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="What is the main component of the Martian atmosphere?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("The solar arrays")>=0:false}
function ea1_what_is_the_main_component_o_has_about_29_5_earth_days(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="What is the main component of the Martian atmosphere?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("About 29.5 Earth days")>=0:false}
function ea1_what_is_the_main_component_o_has_24_hours(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="What is the main component of the Martian atmosphere?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("24 hours")>=0:false}
function ea1_what_is_the_main_component_o_has_7_days(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="What is the main component of the Martian atmosphere?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("7 days")>=0:false}
function ea1_what_is_the_main_component_o_has_365_days(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="What is the main component of the Martian atmosphere?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("365 days")>=0:false}
function ea1_what_is_the_main_component_o_has_heat_from_decaying_plutonium(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="What is the main component of the Martian atmosphere?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("Heat from decaying plutonium")>=0:false}
function ea1_what_is_the_main_component_o_has_burning_methane(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="What is the main component of the Martian atmosphere?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("Burning methane")>=0:false}
function ea1_what_is_the_main_component_o_has_wind_turbines(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="What is the main component of the Martian atmosphere?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("Wind turbines")>=0:false}
function ea1_what_is_the_main_component_o_has_coal_cells(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="What is the main component of the Martian atmosphere?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("Coal cells")>=0:false}
function ea1_what_is_the_main_component_o_has_resupply_from_earth_is_slow_(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="What is the main component of the Martian atmosphere?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("Resupply from Earth is slow and costly")>=0:false}
function ea1_what_is_the_main_component_o_has_plants_glow_nicely(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="What is the main component of the Martian atmosphere?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("Plants glow nicely")>=0:false}
function ea1_what_is_the_main_component_o_has_soil_is_free_in_space(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="What is the main component of the Martian atmosphere?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("Soil is free in space")>=0:false}
function ea1_what_is_the_main_component_o_has_it_removes_all_co2(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="What is the main component of the Martian atmosphere?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("It removes all CO2")>=0:false}
function ea1_what_is_the_main_component_o_has_dust_blocks_sunlight_and_coa(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="What is the main component of the Martian atmosphere?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("Dust blocks sunlight and coats panels")>=0:false}
function ea1_what_is_the_main_component_o_has_dust_freezes_panels(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="What is the main component of the Martian atmosphere?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("Dust freezes panels")>=0:false}
function ea1_what_is_the_main_component_o_has_dust_conducts_electricity(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="What is the main component of the Martian atmosphere?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("Dust conducts electricity")>=0:false}
function ea1_what_is_the_main_component_o_has_no_hazard(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="What is the main component of the Martian atmosphere?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("No hazard")>=0:false}
function ea1_what_is_the_main_component_o_has_artemis(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="What is the main component of the Martian atmosphere?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("Artemis")>=0:false}
function ea1_what_is_the_main_component_o_has_apollo(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="What is the main component of the Martian atmosphere?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("Apollo")>=0:false}
function ea1_how_long_can_a_one_way_radio_has_oxygen(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="How long can a one-way radio signal take between Earth and Mars?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("Oxygen")>=0:false}
function ea1_how_long_can_a_one_way_radio_has_methane(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="How long can a one-way radio signal take between Earth and Mars?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("Methane")>=0:false}
function ea1_how_long_can_a_one_way_radio_has_water(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="How long can a one-way radio signal take between Earth and Mars?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("Water")>=0:false}
function ea1_how_long_can_a_one_way_radio_has_hydrogen(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="How long can a one-way radio signal take between Earth and Mars?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("Hydrogen")>=0:false}
function ea1_how_long_can_a_one_way_radio_has_permanently_shadowed_craters(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="How long can a one-way radio signal take between Earth and Mars?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("Permanently shadowed craters may hold water ice")>=0:false}
function ea1_how_long_can_a_one_way_radio_has_it_is_the_warmest_region(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="How long can a one-way radio signal take between Earth and Mars?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("It is the warmest region")>=0:false}
function ea1_how_long_can_a_one_way_radio_has_it_has_the_strongest_gravity(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="How long can a one-way radio signal take between Earth and Mars?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("It has the strongest gravity")>=0:false}
function ea1_how_long_can_a_one_way_radio_has_it_is_closest_to_earth(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="How long can a one-way radio signal take between Earth and Mars?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("It is closest to Earth")>=0:false}
function ea1_how_long_can_a_one_way_radio_has_24_hours_37_minutes(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="How long can a one-way radio signal take between Earth and Mars?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("24 hours 37 minutes")>=0:false}
function ea1_how_long_can_a_one_way_radio_has_12_hours(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="How long can a one-way radio signal take between Earth and Mars?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("12 hours")>=0:false}
function ea1_how_long_can_a_one_way_radio_has_48_hours(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="How long can a one-way radio signal take between Earth and Mars?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("48 hours")>=0:false}
function ea1_how_long_can_a_one_way_radio_has_29_5_days(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="How long can a one-way radio signal take between Earth and Mars?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("29.5 days")>=0:false}
function ea1_how_long_can_a_one_way_radio_has_carbon_dioxide(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="How long can a one-way radio signal take between Earth and Mars?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("Carbon dioxide")>=0:false}
function ea1_how_long_can_a_one_way_radio_has_nitrogen(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="How long can a one-way radio signal take between Earth and Mars?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("Nitrogen")>=0:false}
function ea1_how_long_can_a_one_way_radio_has_3_to_22_minutes(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="How long can a one-way radio signal take between Earth and Mars?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("3 to 22 minutes")>=0:false}
function ea1_how_long_can_a_one_way_radio_has_instant(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="How long can a one-way radio signal take between Earth and Mars?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("Instant")>=0:false}
function ea1_how_long_can_a_one_way_radio_has_2_seconds(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="How long can a one-way radio signal take between Earth and Mars?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("2 seconds")>=0:false}
function ea1_how_long_can_a_one_way_radio_has_3_hours(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="How long can a one-way radio signal take between Earth and Mars?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("3 hours")>=0:false}
function ea1_how_long_can_a_one_way_radio_has_earth_s_magnetosphere(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="How long can a one-way radio signal take between Earth and Mars?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("Earth's magnetosphere")>=0:false}
function ea1_how_long_can_a_one_way_radio_has_thick_glass(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="How long can a one-way radio signal take between Earth and Mars?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("Thick glass")>=0:false}
function ea1_how_long_can_a_one_way_radio_has_lead_walls(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="How long can a one-way radio signal take between Earth and Mars?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("Lead walls")>=0:false}
function ea1_how_long_can_a_one_way_radio_has_the_solar_arrays(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="How long can a one-way radio signal take between Earth and Mars?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("The solar arrays")>=0:false}
function ea1_how_long_can_a_one_way_radio_has_about_29_5_earth_days(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="How long can a one-way radio signal take between Earth and Mars?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("About 29.5 Earth days")>=0:false}
function ea1_how_long_can_a_one_way_radio_has_24_hours(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="How long can a one-way radio signal take between Earth and Mars?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("24 hours")>=0:false}
function ea1_how_long_can_a_one_way_radio_has_7_days(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="How long can a one-way radio signal take between Earth and Mars?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("7 days")>=0:false}
function ea1_how_long_can_a_one_way_radio_has_365_days(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="How long can a one-way radio signal take between Earth and Mars?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("365 days")>=0:false}
function ea1_how_long_can_a_one_way_radio_has_heat_from_decaying_plutonium(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="How long can a one-way radio signal take between Earth and Mars?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("Heat from decaying plutonium")>=0:false}
function ea1_how_long_can_a_one_way_radio_has_burning_methane(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="How long can a one-way radio signal take between Earth and Mars?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("Burning methane")>=0:false}
function ea1_how_long_can_a_one_way_radio_has_wind_turbines(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="How long can a one-way radio signal take between Earth and Mars?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("Wind turbines")>=0:false}
function ea1_how_long_can_a_one_way_radio_has_coal_cells(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="How long can a one-way radio signal take between Earth and Mars?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("Coal cells")>=0:false}
function ea1_how_long_can_a_one_way_radio_has_resupply_from_earth_is_slow_(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="How long can a one-way radio signal take between Earth and Mars?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("Resupply from Earth is slow and costly")>=0:false}
function ea1_how_long_can_a_one_way_radio_has_plants_glow_nicely(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="How long can a one-way radio signal take between Earth and Mars?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("Plants glow nicely")>=0:false}
function ea1_how_long_can_a_one_way_radio_has_soil_is_free_in_space(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="How long can a one-way radio signal take between Earth and Mars?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("Soil is free in space")>=0:false}
function ea1_how_long_can_a_one_way_radio_has_it_removes_all_co2(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="How long can a one-way radio signal take between Earth and Mars?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("It removes all CO2")>=0:false}
function ea1_how_long_can_a_one_way_radio_has_dust_blocks_sunlight_and_coa(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="How long can a one-way radio signal take between Earth and Mars?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("Dust blocks sunlight and coats panels")>=0:false}
function ea1_how_long_can_a_one_way_radio_has_dust_freezes_panels(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="How long can a one-way radio signal take between Earth and Mars?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("Dust freezes panels")>=0:false}
function ea1_how_long_can_a_one_way_radio_has_dust_conducts_electricity(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="How long can a one-way radio signal take between Earth and Mars?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("Dust conducts electricity")>=0:false}
function ea1_how_long_can_a_one_way_radio_has_no_hazard(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="How long can a one-way radio signal take between Earth and Mars?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("No hazard")>=0:false}
function ea1_how_long_can_a_one_way_radio_has_artemis(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="How long can a one-way radio signal take between Earth and Mars?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("Artemis")>=0:false}
function ea1_how_long_can_a_one_way_radio_has_apollo(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="How long can a one-way radio signal take between Earth and Mars?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("Apollo")>=0:false}
function ea1_what_protects_crews_on_the_i_has_oxygen(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="What protects crews on the ISS from most radiation?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("Oxygen")>=0:false}
function ea1_what_protects_crews_on_the_i_has_methane(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="What protects crews on the ISS from most radiation?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("Methane")>=0:false}
function ea1_what_protects_crews_on_the_i_has_water(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="What protects crews on the ISS from most radiation?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("Water")>=0:false}
function ea1_what_protects_crews_on_the_i_has_hydrogen(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="What protects crews on the ISS from most radiation?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("Hydrogen")>=0:false}
function ea1_what_protects_crews_on_the_i_has_permanently_shadowed_craters(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="What protects crews on the ISS from most radiation?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("Permanently shadowed craters may hold water ice")>=0:false}
function ea1_what_protects_crews_on_the_i_has_it_is_the_warmest_region(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="What protects crews on the ISS from most radiation?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("It is the warmest region")>=0:false}
function ea1_what_protects_crews_on_the_i_has_it_has_the_strongest_gravity(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="What protects crews on the ISS from most radiation?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("It has the strongest gravity")>=0:false}
function ea1_what_protects_crews_on_the_i_has_it_is_closest_to_earth(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="What protects crews on the ISS from most radiation?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("It is closest to Earth")>=0:false}
function ea1_what_protects_crews_on_the_i_has_24_hours_37_minutes(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="What protects crews on the ISS from most radiation?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("24 hours 37 minutes")>=0:false}
function ea1_what_protects_crews_on_the_i_has_12_hours(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="What protects crews on the ISS from most radiation?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("12 hours")>=0:false}
function ea1_what_protects_crews_on_the_i_has_48_hours(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="What protects crews on the ISS from most radiation?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("48 hours")>=0:false}
function ea1_what_protects_crews_on_the_i_has_29_5_days(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="What protects crews on the ISS from most radiation?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("29.5 days")>=0:false}
function ea1_what_protects_crews_on_the_i_has_carbon_dioxide(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="What protects crews on the ISS from most radiation?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("Carbon dioxide")>=0:false}
function ea1_what_protects_crews_on_the_i_has_nitrogen(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="What protects crews on the ISS from most radiation?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("Nitrogen")>=0:false}
function ea1_what_protects_crews_on_the_i_has_3_to_22_minutes(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="What protects crews on the ISS from most radiation?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("3 to 22 minutes")>=0:false}
function ea1_what_protects_crews_on_the_i_has_instant(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="What protects crews on the ISS from most radiation?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("Instant")>=0:false}
function ea1_what_protects_crews_on_the_i_has_2_seconds(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="What protects crews on the ISS from most radiation?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("2 seconds")>=0:false}
function ea1_what_protects_crews_on_the_i_has_3_hours(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="What protects crews on the ISS from most radiation?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("3 hours")>=0:false}
function ea1_what_protects_crews_on_the_i_has_earth_s_magnetosphere(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="What protects crews on the ISS from most radiation?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("Earth's magnetosphere")>=0:false}
function ea1_what_protects_crews_on_the_i_has_thick_glass(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="What protects crews on the ISS from most radiation?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("Thick glass")>=0:false}
function ea1_what_protects_crews_on_the_i_has_lead_walls(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="What protects crews on the ISS from most radiation?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("Lead walls")>=0:false}
function ea1_what_protects_crews_on_the_i_has_the_solar_arrays(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="What protects crews on the ISS from most radiation?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("The solar arrays")>=0:false}
function ea1_what_protects_crews_on_the_i_has_about_29_5_earth_days(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="What protects crews on the ISS from most radiation?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("About 29.5 Earth days")>=0:false}
function ea1_what_protects_crews_on_the_i_has_24_hours(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="What protects crews on the ISS from most radiation?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("24 hours")>=0:false}
function ea1_what_protects_crews_on_the_i_has_7_days(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="What protects crews on the ISS from most radiation?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("7 days")>=0:false}
function ea1_what_protects_crews_on_the_i_has_365_days(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="What protects crews on the ISS from most radiation?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("365 days")>=0:false}
function ea1_what_protects_crews_on_the_i_has_heat_from_decaying_plutonium(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="What protects crews on the ISS from most radiation?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("Heat from decaying plutonium")>=0:false}
function ea1_what_protects_crews_on_the_i_has_burning_methane(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="What protects crews on the ISS from most radiation?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("Burning methane")>=0:false}
function ea1_what_protects_crews_on_the_i_has_wind_turbines(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="What protects crews on the ISS from most radiation?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("Wind turbines")>=0:false}
function ea1_what_protects_crews_on_the_i_has_coal_cells(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="What protects crews on the ISS from most radiation?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("Coal cells")>=0:false}
function ea1_what_protects_crews_on_the_i_has_resupply_from_earth_is_slow_(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="What protects crews on the ISS from most radiation?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("Resupply from Earth is slow and costly")>=0:false}
function ea1_what_protects_crews_on_the_i_has_plants_glow_nicely(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="What protects crews on the ISS from most radiation?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("Plants glow nicely")>=0:false}
function ea1_what_protects_crews_on_the_i_has_soil_is_free_in_space(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="What protects crews on the ISS from most radiation?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("Soil is free in space")>=0:false}
function ea1_what_protects_crews_on_the_i_has_it_removes_all_co2(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="What protects crews on the ISS from most radiation?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("It removes all CO2")>=0:false}
function ea1_what_protects_crews_on_the_i_has_dust_blocks_sunlight_and_coa(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="What protects crews on the ISS from most radiation?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("Dust blocks sunlight and coats panels")>=0:false}
function ea1_what_protects_crews_on_the_i_has_dust_freezes_panels(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="What protects crews on the ISS from most radiation?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("Dust freezes panels")>=0:false}
function ea1_what_protects_crews_on_the_i_has_dust_conducts_electricity(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="What protects crews on the ISS from most radiation?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("Dust conducts electricity")>=0:false}
function ea1_what_protects_crews_on_the_i_has_no_hazard(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="What protects crews on the ISS from most radiation?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("No hazard")>=0:false}
function ea1_what_protects_crews_on_the_i_has_artemis(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="What protects crews on the ISS from most radiation?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("Artemis")>=0:false}
function ea1_what_protects_crews_on_the_i_has_apollo(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="What protects crews on the ISS from most radiation?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("Apollo")>=0:false}
function ea1_roughly_how_long_is_a_full_l_has_oxygen(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="Roughly how long is a full lunar day-night cycle?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("Oxygen")>=0:false}
function ea1_roughly_how_long_is_a_full_l_has_methane(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="Roughly how long is a full lunar day-night cycle?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("Methane")>=0:false}
function ea1_roughly_how_long_is_a_full_l_has_water(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="Roughly how long is a full lunar day-night cycle?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("Water")>=0:false}
function ea1_roughly_how_long_is_a_full_l_has_hydrogen(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="Roughly how long is a full lunar day-night cycle?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("Hydrogen")>=0:false}
function ea1_roughly_how_long_is_a_full_l_has_permanently_shadowed_craters(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="Roughly how long is a full lunar day-night cycle?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("Permanently shadowed craters may hold water ice")>=0:false}
function ea1_roughly_how_long_is_a_full_l_has_it_is_the_warmest_region(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="Roughly how long is a full lunar day-night cycle?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("It is the warmest region")>=0:false}
function ea1_roughly_how_long_is_a_full_l_has_it_has_the_strongest_gravity(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="Roughly how long is a full lunar day-night cycle?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("It has the strongest gravity")>=0:false}
function ea1_roughly_how_long_is_a_full_l_has_it_is_closest_to_earth(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="Roughly how long is a full lunar day-night cycle?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("It is closest to Earth")>=0:false}
function ea1_roughly_how_long_is_a_full_l_has_24_hours_37_minutes(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="Roughly how long is a full lunar day-night cycle?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("24 hours 37 minutes")>=0:false}
function ea1_roughly_how_long_is_a_full_l_has_12_hours(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="Roughly how long is a full lunar day-night cycle?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("12 hours")>=0:false}
function ea1_roughly_how_long_is_a_full_l_has_48_hours(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="Roughly how long is a full lunar day-night cycle?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("48 hours")>=0:false}
function ea1_roughly_how_long_is_a_full_l_has_29_5_days(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="Roughly how long is a full lunar day-night cycle?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("29.5 days")>=0:false}
function ea1_roughly_how_long_is_a_full_l_has_carbon_dioxide(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="Roughly how long is a full lunar day-night cycle?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("Carbon dioxide")>=0:false}
function ea1_roughly_how_long_is_a_full_l_has_nitrogen(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="Roughly how long is a full lunar day-night cycle?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("Nitrogen")>=0:false}
function ea1_roughly_how_long_is_a_full_l_has_3_to_22_minutes(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="Roughly how long is a full lunar day-night cycle?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("3 to 22 minutes")>=0:false}
function ea1_roughly_how_long_is_a_full_l_has_instant(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="Roughly how long is a full lunar day-night cycle?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("Instant")>=0:false}
function ea1_roughly_how_long_is_a_full_l_has_2_seconds(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="Roughly how long is a full lunar day-night cycle?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("2 seconds")>=0:false}
function ea1_roughly_how_long_is_a_full_l_has_3_hours(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="Roughly how long is a full lunar day-night cycle?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("3 hours")>=0:false}
function ea1_roughly_how_long_is_a_full_l_has_earth_s_magnetosphere(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="Roughly how long is a full lunar day-night cycle?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("Earth's magnetosphere")>=0:false}
function ea1_roughly_how_long_is_a_full_l_has_thick_glass(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="Roughly how long is a full lunar day-night cycle?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("Thick glass")>=0:false}
function ea1_roughly_how_long_is_a_full_l_has_lead_walls(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="Roughly how long is a full lunar day-night cycle?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("Lead walls")>=0:false}
function ea1_roughly_how_long_is_a_full_l_has_the_solar_arrays(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="Roughly how long is a full lunar day-night cycle?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("The solar arrays")>=0:false}
function ea1_roughly_how_long_is_a_full_l_has_about_29_5_earth_days(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="Roughly how long is a full lunar day-night cycle?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("About 29.5 Earth days")>=0:false}
function ea1_roughly_how_long_is_a_full_l_has_24_hours(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="Roughly how long is a full lunar day-night cycle?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("24 hours")>=0:false}
function ea1_roughly_how_long_is_a_full_l_has_7_days(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="Roughly how long is a full lunar day-night cycle?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("7 days")>=0:false}
function ea1_roughly_how_long_is_a_full_l_has_365_days(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="Roughly how long is a full lunar day-night cycle?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("365 days")>=0:false}
function ea1_roughly_how_long_is_a_full_l_has_heat_from_decaying_plutonium(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="Roughly how long is a full lunar day-night cycle?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("Heat from decaying plutonium")>=0:false}
function ea1_roughly_how_long_is_a_full_l_has_burning_methane(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="Roughly how long is a full lunar day-night cycle?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("Burning methane")>=0:false}
function ea1_roughly_how_long_is_a_full_l_has_wind_turbines(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="Roughly how long is a full lunar day-night cycle?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("Wind turbines")>=0:false}
function ea1_roughly_how_long_is_a_full_l_has_coal_cells(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="Roughly how long is a full lunar day-night cycle?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("Coal cells")>=0:false}
function ea1_roughly_how_long_is_a_full_l_has_resupply_from_earth_is_slow_(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="Roughly how long is a full lunar day-night cycle?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("Resupply from Earth is slow and costly")>=0:false}
function ea1_roughly_how_long_is_a_full_l_has_plants_glow_nicely(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="Roughly how long is a full lunar day-night cycle?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("Plants glow nicely")>=0:false}
function ea1_roughly_how_long_is_a_full_l_has_soil_is_free_in_space(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="Roughly how long is a full lunar day-night cycle?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("Soil is free in space")>=0:false}
function ea1_roughly_how_long_is_a_full_l_has_it_removes_all_co2(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="Roughly how long is a full lunar day-night cycle?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("It removes all CO2")>=0:false}
function ea1_roughly_how_long_is_a_full_l_has_dust_blocks_sunlight_and_coa(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="Roughly how long is a full lunar day-night cycle?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("Dust blocks sunlight and coats panels")>=0:false}
function ea1_roughly_how_long_is_a_full_l_has_dust_freezes_panels(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="Roughly how long is a full lunar day-night cycle?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("Dust freezes panels")>=0:false}
function ea1_roughly_how_long_is_a_full_l_has_dust_conducts_electricity(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="Roughly how long is a full lunar day-night cycle?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("Dust conducts electricity")>=0:false}
function ea1_roughly_how_long_is_a_full_l_has_no_hazard(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="Roughly how long is a full lunar day-night cycle?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("No hazard")>=0:false}
function ea1_roughly_how_long_is_a_full_l_has_artemis(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="Roughly how long is a full lunar day-night cycle?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("Artemis")>=0:false}
function ea1_roughly_how_long_is_a_full_l_has_apollo(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="Roughly how long is a full lunar day-night cycle?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("Apollo")>=0:false}
function ea1_what_do_rtgs_use_to_make_ele_has_oxygen(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="What do RTGs use to make electricity?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("Oxygen")>=0:false}
function ea1_what_do_rtgs_use_to_make_ele_has_methane(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="What do RTGs use to make electricity?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("Methane")>=0:false}
function ea1_what_do_rtgs_use_to_make_ele_has_water(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="What do RTGs use to make electricity?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("Water")>=0:false}
function ea1_what_do_rtgs_use_to_make_ele_has_hydrogen(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="What do RTGs use to make electricity?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("Hydrogen")>=0:false}
function ea1_what_do_rtgs_use_to_make_ele_has_permanently_shadowed_craters(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="What do RTGs use to make electricity?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("Permanently shadowed craters may hold water ice")>=0:false}
function ea1_what_do_rtgs_use_to_make_ele_has_it_is_the_warmest_region(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="What do RTGs use to make electricity?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("It is the warmest region")>=0:false}
function ea1_what_do_rtgs_use_to_make_ele_has_it_has_the_strongest_gravity(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="What do RTGs use to make electricity?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("It has the strongest gravity")>=0:false}
function ea1_what_do_rtgs_use_to_make_ele_has_it_is_closest_to_earth(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="What do RTGs use to make electricity?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("It is closest to Earth")>=0:false}
function ea1_what_do_rtgs_use_to_make_ele_has_24_hours_37_minutes(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="What do RTGs use to make electricity?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("24 hours 37 minutes")>=0:false}
function ea1_what_do_rtgs_use_to_make_ele_has_12_hours(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="What do RTGs use to make electricity?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("12 hours")>=0:false}
function ea1_what_do_rtgs_use_to_make_ele_has_48_hours(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="What do RTGs use to make electricity?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("48 hours")>=0:false}
function ea1_what_do_rtgs_use_to_make_ele_has_29_5_days(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="What do RTGs use to make electricity?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("29.5 days")>=0:false}
function ea1_what_do_rtgs_use_to_make_ele_has_carbon_dioxide(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="What do RTGs use to make electricity?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("Carbon dioxide")>=0:false}
function ea1_what_do_rtgs_use_to_make_ele_has_nitrogen(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="What do RTGs use to make electricity?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("Nitrogen")>=0:false}
function ea1_what_do_rtgs_use_to_make_ele_has_3_to_22_minutes(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="What do RTGs use to make electricity?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("3 to 22 minutes")>=0:false}
function ea1_what_do_rtgs_use_to_make_ele_has_instant(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="What do RTGs use to make electricity?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("Instant")>=0:false}
function ea1_what_do_rtgs_use_to_make_ele_has_2_seconds(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="What do RTGs use to make electricity?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("2 seconds")>=0:false}
function ea1_what_do_rtgs_use_to_make_ele_has_3_hours(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="What do RTGs use to make electricity?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("3 hours")>=0:false}
function ea1_what_do_rtgs_use_to_make_ele_has_earth_s_magnetosphere(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="What do RTGs use to make electricity?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("Earth's magnetosphere")>=0:false}
function ea1_what_do_rtgs_use_to_make_ele_has_thick_glass(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="What do RTGs use to make electricity?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("Thick glass")>=0:false}
function ea1_what_do_rtgs_use_to_make_ele_has_lead_walls(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="What do RTGs use to make electricity?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("Lead walls")>=0:false}
function ea1_what_do_rtgs_use_to_make_ele_has_the_solar_arrays(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="What do RTGs use to make electricity?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("The solar arrays")>=0:false}
function ea1_what_do_rtgs_use_to_make_ele_has_about_29_5_earth_days(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="What do RTGs use to make electricity?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("About 29.5 Earth days")>=0:false}
function ea1_what_do_rtgs_use_to_make_ele_has_24_hours(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="What do RTGs use to make electricity?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("24 hours")>=0:false}
function ea1_what_do_rtgs_use_to_make_ele_has_7_days(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="What do RTGs use to make electricity?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("7 days")>=0:false}
function ea1_what_do_rtgs_use_to_make_ele_has_365_days(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="What do RTGs use to make electricity?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("365 days")>=0:false}
function ea1_what_do_rtgs_use_to_make_ele_has_heat_from_decaying_plutonium(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="What do RTGs use to make electricity?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("Heat from decaying plutonium")>=0:false}
function ea1_what_do_rtgs_use_to_make_ele_has_burning_methane(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="What do RTGs use to make electricity?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("Burning methane")>=0:false}
function ea1_what_do_rtgs_use_to_make_ele_has_wind_turbines(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="What do RTGs use to make electricity?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("Wind turbines")>=0:false}
function ea1_what_do_rtgs_use_to_make_ele_has_coal_cells(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="What do RTGs use to make electricity?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("Coal cells")>=0:false}
function ea1_what_do_rtgs_use_to_make_ele_has_resupply_from_earth_is_slow_(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="What do RTGs use to make electricity?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("Resupply from Earth is slow and costly")>=0:false}
function ea1_what_do_rtgs_use_to_make_ele_has_plants_glow_nicely(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="What do RTGs use to make electricity?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("Plants glow nicely")>=0:false}
function ea1_what_do_rtgs_use_to_make_ele_has_soil_is_free_in_space(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="What do RTGs use to make electricity?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("Soil is free in space")>=0:false}
function ea1_what_do_rtgs_use_to_make_ele_has_it_removes_all_co2(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="What do RTGs use to make electricity?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("It removes all CO2")>=0:false}
function ea1_what_do_rtgs_use_to_make_ele_has_dust_blocks_sunlight_and_coa(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="What do RTGs use to make electricity?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("Dust blocks sunlight and coats panels")>=0:false}
function ea1_what_do_rtgs_use_to_make_ele_has_dust_freezes_panels(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="What do RTGs use to make electricity?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("Dust freezes panels")>=0:false}
function ea1_what_do_rtgs_use_to_make_ele_has_dust_conducts_electricity(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="What do RTGs use to make electricity?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("Dust conducts electricity")>=0:false}
function ea1_what_do_rtgs_use_to_make_ele_has_no_hazard(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="What do RTGs use to make electricity?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("No hazard")>=0:false}
function ea1_what_do_rtgs_use_to_make_ele_has_artemis(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="What do RTGs use to make electricity?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("Artemis")>=0:false}
function ea1_what_do_rtgs_use_to_make_ele_has_apollo(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="What do RTGs use to make electricity?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("Apollo")>=0:false}
function ea1_why_is_growing_food_on_a_mis_has_oxygen(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="Why is growing food on a mission valuable?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("Oxygen")>=0:false}
function ea1_why_is_growing_food_on_a_mis_has_methane(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="Why is growing food on a mission valuable?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("Methane")>=0:false}
function ea1_why_is_growing_food_on_a_mis_has_water(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="Why is growing food on a mission valuable?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("Water")>=0:false}
function ea1_why_is_growing_food_on_a_mis_has_hydrogen(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="Why is growing food on a mission valuable?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("Hydrogen")>=0:false}
function ea1_why_is_growing_food_on_a_mis_has_permanently_shadowed_craters(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="Why is growing food on a mission valuable?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("Permanently shadowed craters may hold water ice")>=0:false}
function ea1_why_is_growing_food_on_a_mis_has_it_is_the_warmest_region(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="Why is growing food on a mission valuable?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("It is the warmest region")>=0:false}
function ea1_why_is_growing_food_on_a_mis_has_it_has_the_strongest_gravity(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="Why is growing food on a mission valuable?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("It has the strongest gravity")>=0:false}
function ea1_why_is_growing_food_on_a_mis_has_it_is_closest_to_earth(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="Why is growing food on a mission valuable?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("It is closest to Earth")>=0:false}
function ea1_why_is_growing_food_on_a_mis_has_24_hours_37_minutes(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="Why is growing food on a mission valuable?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("24 hours 37 minutes")>=0:false}
function ea1_why_is_growing_food_on_a_mis_has_12_hours(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="Why is growing food on a mission valuable?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("12 hours")>=0:false}
function ea1_why_is_growing_food_on_a_mis_has_48_hours(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="Why is growing food on a mission valuable?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("48 hours")>=0:false}
function ea1_why_is_growing_food_on_a_mis_has_29_5_days(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="Why is growing food on a mission valuable?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("29.5 days")>=0:false}
function ea1_why_is_growing_food_on_a_mis_has_carbon_dioxide(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="Why is growing food on a mission valuable?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("Carbon dioxide")>=0:false}
function ea1_why_is_growing_food_on_a_mis_has_nitrogen(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="Why is growing food on a mission valuable?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("Nitrogen")>=0:false}
function ea1_why_is_growing_food_on_a_mis_has_3_to_22_minutes(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="Why is growing food on a mission valuable?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("3 to 22 minutes")>=0:false}
function ea1_why_is_growing_food_on_a_mis_has_instant(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="Why is growing food on a mission valuable?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("Instant")>=0:false}
function ea1_why_is_growing_food_on_a_mis_has_2_seconds(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="Why is growing food on a mission valuable?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("2 seconds")>=0:false}
function ea1_why_is_growing_food_on_a_mis_has_3_hours(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="Why is growing food on a mission valuable?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("3 hours")>=0:false}
function ea1_why_is_growing_food_on_a_mis_has_earth_s_magnetosphere(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="Why is growing food on a mission valuable?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("Earth's magnetosphere")>=0:false}
function ea1_why_is_growing_food_on_a_mis_has_thick_glass(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="Why is growing food on a mission valuable?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("Thick glass")>=0:false}
function ea1_why_is_growing_food_on_a_mis_has_lead_walls(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="Why is growing food on a mission valuable?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("Lead walls")>=0:false}
function ea1_why_is_growing_food_on_a_mis_has_the_solar_arrays(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="Why is growing food on a mission valuable?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("The solar arrays")>=0:false}
function ea1_why_is_growing_food_on_a_mis_has_about_29_5_earth_days(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="Why is growing food on a mission valuable?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("About 29.5 Earth days")>=0:false}
function ea1_why_is_growing_food_on_a_mis_has_24_hours(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="Why is growing food on a mission valuable?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("24 hours")>=0:false}
function ea1_why_is_growing_food_on_a_mis_has_7_days(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="Why is growing food on a mission valuable?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("7 days")>=0:false}
function ea1_why_is_growing_food_on_a_mis_has_365_days(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="Why is growing food on a mission valuable?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("365 days")>=0:false}
function ea1_why_is_growing_food_on_a_mis_has_heat_from_decaying_plutonium(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="Why is growing food on a mission valuable?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("Heat from decaying plutonium")>=0:false}
function ea1_why_is_growing_food_on_a_mis_has_burning_methane(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="Why is growing food on a mission valuable?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("Burning methane")>=0:false}
function ea1_why_is_growing_food_on_a_mis_has_wind_turbines(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="Why is growing food on a mission valuable?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("Wind turbines")>=0:false}
function ea1_why_is_growing_food_on_a_mis_has_coal_cells(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="Why is growing food on a mission valuable?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("Coal cells")>=0:false}
function ea1_why_is_growing_food_on_a_mis_has_resupply_from_earth_is_slow_(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="Why is growing food on a mission valuable?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("Resupply from Earth is slow and costly")>=0:false}
function ea1_why_is_growing_food_on_a_mis_has_plants_glow_nicely(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="Why is growing food on a mission valuable?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("Plants glow nicely")>=0:false}
function ea1_why_is_growing_food_on_a_mis_has_soil_is_free_in_space(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="Why is growing food on a mission valuable?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("Soil is free in space")>=0:false}
function ea1_why_is_growing_food_on_a_mis_has_it_removes_all_co2(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="Why is growing food on a mission valuable?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("It removes all CO2")>=0:false}
function ea1_why_is_growing_food_on_a_mis_has_dust_blocks_sunlight_and_coa(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="Why is growing food on a mission valuable?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("Dust blocks sunlight and coats panels")>=0:false}
function ea1_why_is_growing_food_on_a_mis_has_dust_freezes_panels(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="Why is growing food on a mission valuable?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("Dust freezes panels")>=0:false}
function ea1_why_is_growing_food_on_a_mis_has_dust_conducts_electricity(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="Why is growing food on a mission valuable?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("Dust conducts electricity")>=0:false}
function ea1_why_is_growing_food_on_a_mis_has_no_hazard(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="Why is growing food on a mission valuable?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("No hazard")>=0:false}
function ea1_why_is_growing_food_on_a_mis_has_artemis(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="Why is growing food on a mission valuable?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("Artemis")>=0:false}
function ea1_why_is_growing_food_on_a_mis_has_apollo(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="Why is growing food on a mission valuable?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("Apollo")>=0:false}
function ea1_what_hazard_do_dust_storms_o_has_oxygen(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="What hazard do dust storms on Mars pose to solar power?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("Oxygen")>=0:false}
function ea1_what_hazard_do_dust_storms_o_has_methane(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="What hazard do dust storms on Mars pose to solar power?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("Methane")>=0:false}
function ea1_what_hazard_do_dust_storms_o_has_water(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="What hazard do dust storms on Mars pose to solar power?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("Water")>=0:false}
function ea1_what_hazard_do_dust_storms_o_has_hydrogen(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="What hazard do dust storms on Mars pose to solar power?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("Hydrogen")>=0:false}
function ea1_what_hazard_do_dust_storms_o_has_permanently_shadowed_craters(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="What hazard do dust storms on Mars pose to solar power?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("Permanently shadowed craters may hold water ice")>=0:false}
function ea1_what_hazard_do_dust_storms_o_has_it_is_the_warmest_region(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="What hazard do dust storms on Mars pose to solar power?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("It is the warmest region")>=0:false}
function ea1_what_hazard_do_dust_storms_o_has_it_has_the_strongest_gravity(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="What hazard do dust storms on Mars pose to solar power?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("It has the strongest gravity")>=0:false}
function ea1_what_hazard_do_dust_storms_o_has_it_is_closest_to_earth(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="What hazard do dust storms on Mars pose to solar power?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("It is closest to Earth")>=0:false}
function ea1_what_hazard_do_dust_storms_o_has_24_hours_37_minutes(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="What hazard do dust storms on Mars pose to solar power?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("24 hours 37 minutes")>=0:false}
function ea1_what_hazard_do_dust_storms_o_has_12_hours(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="What hazard do dust storms on Mars pose to solar power?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("12 hours")>=0:false}
function ea1_what_hazard_do_dust_storms_o_has_48_hours(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="What hazard do dust storms on Mars pose to solar power?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("48 hours")>=0:false}
function ea1_what_hazard_do_dust_storms_o_has_29_5_days(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="What hazard do dust storms on Mars pose to solar power?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("29.5 days")>=0:false}
function ea1_what_hazard_do_dust_storms_o_has_carbon_dioxide(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="What hazard do dust storms on Mars pose to solar power?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("Carbon dioxide")>=0:false}
function ea1_what_hazard_do_dust_storms_o_has_nitrogen(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="What hazard do dust storms on Mars pose to solar power?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("Nitrogen")>=0:false}
function ea1_what_hazard_do_dust_storms_o_has_3_to_22_minutes(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="What hazard do dust storms on Mars pose to solar power?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("3 to 22 minutes")>=0:false}
function ea1_what_hazard_do_dust_storms_o_has_instant(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="What hazard do dust storms on Mars pose to solar power?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("Instant")>=0:false}
function ea1_what_hazard_do_dust_storms_o_has_2_seconds(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="What hazard do dust storms on Mars pose to solar power?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("2 seconds")>=0:false}
function ea1_what_hazard_do_dust_storms_o_has_3_hours(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="What hazard do dust storms on Mars pose to solar power?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("3 hours")>=0:false}
function ea1_what_hazard_do_dust_storms_o_has_earth_s_magnetosphere(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="What hazard do dust storms on Mars pose to solar power?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("Earth's magnetosphere")>=0:false}
function ea1_what_hazard_do_dust_storms_o_has_thick_glass(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="What hazard do dust storms on Mars pose to solar power?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("Thick glass")>=0:false}
function ea1_what_hazard_do_dust_storms_o_has_lead_walls(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="What hazard do dust storms on Mars pose to solar power?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("Lead walls")>=0:false}
function ea1_what_hazard_do_dust_storms_o_has_the_solar_arrays(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="What hazard do dust storms on Mars pose to solar power?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("The solar arrays")>=0:false}
function ea1_what_hazard_do_dust_storms_o_has_about_29_5_earth_days(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="What hazard do dust storms on Mars pose to solar power?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("About 29.5 Earth days")>=0:false}
function ea1_what_hazard_do_dust_storms_o_has_24_hours(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="What hazard do dust storms on Mars pose to solar power?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("24 hours")>=0:false}
function ea1_what_hazard_do_dust_storms_o_has_7_days(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="What hazard do dust storms on Mars pose to solar power?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("7 days")>=0:false}
function ea1_what_hazard_do_dust_storms_o_has_365_days(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="What hazard do dust storms on Mars pose to solar power?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("365 days")>=0:false}
function ea1_what_hazard_do_dust_storms_o_has_heat_from_decaying_plutonium(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="What hazard do dust storms on Mars pose to solar power?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("Heat from decaying plutonium")>=0:false}
function ea1_what_hazard_do_dust_storms_o_has_burning_methane(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="What hazard do dust storms on Mars pose to solar power?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("Burning methane")>=0:false}
function ea1_what_hazard_do_dust_storms_o_has_wind_turbines(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="What hazard do dust storms on Mars pose to solar power?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("Wind turbines")>=0:false}
function ea1_what_hazard_do_dust_storms_o_has_coal_cells(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="What hazard do dust storms on Mars pose to solar power?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("Coal cells")>=0:false}
function ea1_what_hazard_do_dust_storms_o_has_resupply_from_earth_is_slow_(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="What hazard do dust storms on Mars pose to solar power?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("Resupply from Earth is slow and costly")>=0:false}
function ea1_what_hazard_do_dust_storms_o_has_plants_glow_nicely(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="What hazard do dust storms on Mars pose to solar power?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("Plants glow nicely")>=0:false}
function ea1_what_hazard_do_dust_storms_o_has_soil_is_free_in_space(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="What hazard do dust storms on Mars pose to solar power?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("Soil is free in space")>=0:false}
function ea1_what_hazard_do_dust_storms_o_has_it_removes_all_co2(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="What hazard do dust storms on Mars pose to solar power?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("It removes all CO2")>=0:false}
function ea1_what_hazard_do_dust_storms_o_has_dust_blocks_sunlight_and_coa(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="What hazard do dust storms on Mars pose to solar power?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("Dust blocks sunlight and coats panels")>=0:false}
function ea1_what_hazard_do_dust_storms_o_has_dust_freezes_panels(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="What hazard do dust storms on Mars pose to solar power?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("Dust freezes panels")>=0:false}
function ea1_what_hazard_do_dust_storms_o_has_dust_conducts_electricity(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="What hazard do dust storms on Mars pose to solar power?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("Dust conducts electricity")>=0:false}
function ea1_what_hazard_do_dust_storms_o_has_no_hazard(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="What hazard do dust storms on Mars pose to solar power?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("No hazard")>=0:false}
function ea1_what_hazard_do_dust_storms_o_has_artemis(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="What hazard do dust storms on Mars pose to solar power?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("Artemis")>=0:false}
function ea1_what_hazard_do_dust_storms_o_has_apollo(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="What hazard do dust storms on Mars pose to solar power?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("Apollo")>=0:false}
function ea1_which_program_aims_to_return_has_oxygen(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="Which program aims to return astronauts to the Moon this decade?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("Oxygen")>=0:false}
function ea1_which_program_aims_to_return_has_methane(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="Which program aims to return astronauts to the Moon this decade?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("Methane")>=0:false}
function ea1_which_program_aims_to_return_has_water(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="Which program aims to return astronauts to the Moon this decade?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("Water")>=0:false}
function ea1_which_program_aims_to_return_has_hydrogen(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="Which program aims to return astronauts to the Moon this decade?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("Hydrogen")>=0:false}
function ea1_which_program_aims_to_return_has_permanently_shadowed_craters(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="Which program aims to return astronauts to the Moon this decade?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("Permanently shadowed craters may hold water ice")>=0:false}
function ea1_which_program_aims_to_return_has_it_is_the_warmest_region(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="Which program aims to return astronauts to the Moon this decade?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("It is the warmest region")>=0:false}
function ea1_which_program_aims_to_return_has_it_has_the_strongest_gravity(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="Which program aims to return astronauts to the Moon this decade?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("It has the strongest gravity")>=0:false}
function ea1_which_program_aims_to_return_has_it_is_closest_to_earth(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="Which program aims to return astronauts to the Moon this decade?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("It is closest to Earth")>=0:false}
function ea1_which_program_aims_to_return_has_24_hours_37_minutes(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="Which program aims to return astronauts to the Moon this decade?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("24 hours 37 minutes")>=0:false}
function ea1_which_program_aims_to_return_has_12_hours(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="Which program aims to return astronauts to the Moon this decade?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("12 hours")>=0:false}
function ea1_which_program_aims_to_return_has_48_hours(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="Which program aims to return astronauts to the Moon this decade?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("48 hours")>=0:false}
function ea1_which_program_aims_to_return_has_29_5_days(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="Which program aims to return astronauts to the Moon this decade?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("29.5 days")>=0:false}
function ea1_which_program_aims_to_return_has_carbon_dioxide(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="Which program aims to return astronauts to the Moon this decade?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("Carbon dioxide")>=0:false}
function ea1_which_program_aims_to_return_has_nitrogen(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="Which program aims to return astronauts to the Moon this decade?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("Nitrogen")>=0:false}
function ea1_which_program_aims_to_return_has_3_to_22_minutes(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="Which program aims to return astronauts to the Moon this decade?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("3 to 22 minutes")>=0:false}
function ea1_which_program_aims_to_return_has_instant(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="Which program aims to return astronauts to the Moon this decade?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("Instant")>=0:false}
function ea1_which_program_aims_to_return_has_2_seconds(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="Which program aims to return astronauts to the Moon this decade?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("2 seconds")>=0:false}
function ea1_which_program_aims_to_return_has_3_hours(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="Which program aims to return astronauts to the Moon this decade?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("3 hours")>=0:false}
function ea1_which_program_aims_to_return_has_earth_s_magnetosphere(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="Which program aims to return astronauts to the Moon this decade?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("Earth's magnetosphere")>=0:false}
function ea1_which_program_aims_to_return_has_thick_glass(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="Which program aims to return astronauts to the Moon this decade?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("Thick glass")>=0:false}
function ea1_which_program_aims_to_return_has_lead_walls(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="Which program aims to return astronauts to the Moon this decade?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("Lead walls")>=0:false}
function ea1_which_program_aims_to_return_has_the_solar_arrays(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="Which program aims to return astronauts to the Moon this decade?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("The solar arrays")>=0:false}
function ea1_which_program_aims_to_return_has_about_29_5_earth_days(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="Which program aims to return astronauts to the Moon this decade?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("About 29.5 Earth days")>=0:false}
function ea1_which_program_aims_to_return_has_24_hours(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="Which program aims to return astronauts to the Moon this decade?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("24 hours")>=0:false}
function ea1_which_program_aims_to_return_has_7_days(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="Which program aims to return astronauts to the Moon this decade?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("7 days")>=0:false}
function ea1_which_program_aims_to_return_has_365_days(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="Which program aims to return astronauts to the Moon this decade?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("365 days")>=0:false}
function ea1_which_program_aims_to_return_has_heat_from_decaying_plutonium(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="Which program aims to return astronauts to the Moon this decade?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("Heat from decaying plutonium")>=0:false}
function ea1_which_program_aims_to_return_has_burning_methane(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="Which program aims to return astronauts to the Moon this decade?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("Burning methane")>=0:false}
function ea1_which_program_aims_to_return_has_wind_turbines(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="Which program aims to return astronauts to the Moon this decade?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("Wind turbines")>=0:false}
function ea1_which_program_aims_to_return_has_coal_cells(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="Which program aims to return astronauts to the Moon this decade?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("Coal cells")>=0:false}
function ea1_which_program_aims_to_return_has_resupply_from_earth_is_slow_(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="Which program aims to return astronauts to the Moon this decade?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("Resupply from Earth is slow and costly")>=0:false}
function ea1_which_program_aims_to_return_has_plants_glow_nicely(){var e=(function(){var a=QUIZ;for(var i=0;i<a.length;i++){if(String(a[i]["q"])==="Which program aims to return astronauts to the Moon this decade?"){return a[i]}}return null})();return e?e["a"].map(String).indexOf("Plants glow nicely")>=0:false}

function fa2Drill(seed){
var i=Math.abs(Math.floor(seed))%EVENTS.length;
var ev=EVENTS[i];
var pool=["mars","moon","iss","earth","orbit"];
var correct=ev.sites[0];
var choices=[correct];
for(var k=0;k<pool.length&&choices.length<3;k++){if(choices.indexOf(pool[k])<0){choices.push(pool[k])}}
var rot=i%3;
choices=choices.slice(rot).concat(choices.slice(0,rot));
return{text:ev.text,siteCount:ev.sites.length,choices:choices,correct:choices.indexOf(correct),weight:ev.w}}
function fa2DrillCount(){return EVENTS.length}
function fa2DrillGrade(answers){
var right=0;
answers.forEach(function(a){var d=fa2Drill(a.seed);if(a.pick===d.correct){right++}});
return{asked:answers.length,right:right,pct:answers.length?Math.round(right/answers.length*100):0}}
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

return{fa2Drill,fa2DrillCount,fa2DrillGrade,fa2PassportTotal,fa2PassportPct,fa2PassportText,fa2PassportRemaining,fa2Briefing,fa2Streak,fa2StreakNext,ea1_what_did_nasa_s_moxie_experi_has_soil_is_free_in_space,ea1_what_did_nasa_s_moxie_experi_has_it_removes_all_co2,ea1_what_did_nasa_s_moxie_experi_has_dust_blocks_sunlight_and_coa,ea1_what_did_nasa_s_moxie_experi_has_dust_freezes_panels,ea1_what_did_nasa_s_moxie_experi_has_dust_conducts_electricity,ea1_what_did_nasa_s_moxie_experi_has_no_hazard,ea1_what_did_nasa_s_moxie_experi_has_artemis,ea1_what_did_nasa_s_moxie_experi_has_apollo,ea1_why_do_planners_target_the_m_has_oxygen,ea1_why_do_planners_target_the_m_has_methane,ea1_why_do_planners_target_the_m_has_water,ea1_why_do_planners_target_the_m_has_hydrogen,ea1_why_do_planners_target_the_m_has_permanently_shadowed_craters,ea1_why_do_planners_target_the_m_has_it_is_the_warmest_region,ea1_why_do_planners_target_the_m_has_it_has_the_strongest_gravity,ea1_why_do_planners_target_the_m_has_it_is_closest_to_earth,ea1_why_do_planners_target_the_m_has_24_hours_37_minutes,ea1_why_do_planners_target_the_m_has_12_hours,ea1_why_do_planners_target_the_m_has_48_hours,ea1_why_do_planners_target_the_m_has_29_5_days,ea1_why_do_planners_target_the_m_has_carbon_dioxide,ea1_why_do_planners_target_the_m_has_nitrogen,ea1_why_do_planners_target_the_m_has_3_to_22_minutes,ea1_why_do_planners_target_the_m_has_instant,ea1_why_do_planners_target_the_m_has_2_seconds,ea1_why_do_planners_target_the_m_has_3_hours,ea1_why_do_planners_target_the_m_has_earth_s_magnetosphere,ea1_why_do_planners_target_the_m_has_thick_glass,ea1_why_do_planners_target_the_m_has_lead_walls,ea1_why_do_planners_target_the_m_has_the_solar_arrays,ea1_why_do_planners_target_the_m_has_about_29_5_earth_days,ea1_why_do_planners_target_the_m_has_24_hours,ea1_why_do_planners_target_the_m_has_7_days,ea1_why_do_planners_target_the_m_has_365_days,ea1_why_do_planners_target_the_m_has_heat_from_decaying_plutonium,ea1_why_do_planners_target_the_m_has_burning_methane,ea1_why_do_planners_target_the_m_has_wind_turbines,ea1_why_do_planners_target_the_m_has_coal_cells,ea1_why_do_planners_target_the_m_has_resupply_from_earth_is_slow_,ea1_why_do_planners_target_the_m_has_plants_glow_nicely,ea1_why_do_planners_target_the_m_has_soil_is_free_in_space,ea1_why_do_planners_target_the_m_has_it_removes_all_co2,ea1_why_do_planners_target_the_m_has_dust_blocks_sunlight_and_coa,ea1_why_do_planners_target_the_m_has_dust_freezes_panels,ea1_why_do_planners_target_the_m_has_dust_conducts_electricity,ea1_why_do_planners_target_the_m_has_no_hazard,ea1_why_do_planners_target_the_m_has_artemis,ea1_why_do_planners_target_the_m_has_apollo,ea1_about_how_long_is_one_martia_has_oxygen,ea1_about_how_long_is_one_martia_has_methane,ea1_about_how_long_is_one_martia_has_water,ea1_about_how_long_is_one_martia_has_hydrogen,ea1_about_how_long_is_one_martia_has_permanently_shadowed_craters,ea1_about_how_long_is_one_martia_has_it_is_the_warmest_region,ea1_about_how_long_is_one_martia_has_it_has_the_strongest_gravity,ea1_about_how_long_is_one_martia_has_it_is_closest_to_earth,ea1_about_how_long_is_one_martia_has_24_hours_37_minutes,ea1_about_how_long_is_one_martia_has_12_hours,ea1_about_how_long_is_one_martia_has_48_hours,ea1_about_how_long_is_one_martia_has_29_5_days,ea1_about_how_long_is_one_martia_has_carbon_dioxide,ea1_about_how_long_is_one_martia_has_nitrogen,ea1_about_how_long_is_one_martia_has_3_to_22_minutes,ea1_about_how_long_is_one_martia_has_instant,ea1_about_how_long_is_one_martia_has_2_seconds,ea1_about_how_long_is_one_martia_has_3_hours,ea1_about_how_long_is_one_martia_has_earth_s_magnetosphere,ea1_about_how_long_is_one_martia_has_thick_glass,ea1_about_how_long_is_one_martia_has_lead_walls,ea1_about_how_long_is_one_martia_has_the_solar_arrays,ea1_about_how_long_is_one_martia_has_about_29_5_earth_days,ea1_about_how_long_is_one_martia_has_24_hours,ea1_about_how_long_is_one_martia_has_7_days,ea1_about_how_long_is_one_martia_has_365_days,ea1_about_how_long_is_one_martia_has_heat_from_decaying_plutonium,ea1_about_how_long_is_one_martia_has_burning_methane,ea1_about_how_long_is_one_martia_has_wind_turbines,ea1_about_how_long_is_one_martia_has_coal_cells,ea1_about_how_long_is_one_martia_has_resupply_from_earth_is_slow_,ea1_about_how_long_is_one_martia_has_plants_glow_nicely,ea1_about_how_long_is_one_martia_has_soil_is_free_in_space,ea1_about_how_long_is_one_martia_has_it_removes_all_co2,ea1_about_how_long_is_one_martia_has_dust_blocks_sunlight_and_coa,ea1_about_how_long_is_one_martia_has_dust_freezes_panels,ea1_about_how_long_is_one_martia_has_dust_conducts_electricity,ea1_about_how_long_is_one_martia_has_no_hazard,ea1_about_how_long_is_one_martia_has_artemis,ea1_about_how_long_is_one_martia_has_apollo,ea1_what_is_the_main_component_o_has_oxygen,ea1_what_is_the_main_component_o_has_methane,ea1_what_is_the_main_component_o_has_water,ea1_what_is_the_main_component_o_has_hydrogen,ea1_what_is_the_main_component_o_has_permanently_shadowed_craters,ea1_what_is_the_main_component_o_has_it_is_the_warmest_region,ea1_what_is_the_main_component_o_has_it_has_the_strongest_gravity,ea1_what_is_the_main_component_o_has_it_is_closest_to_earth,ea1_what_is_the_main_component_o_has_24_hours_37_minutes,ea1_what_is_the_main_component_o_has_12_hours,ea1_what_is_the_main_component_o_has_48_hours,ea1_what_is_the_main_component_o_has_29_5_days,ea1_what_is_the_main_component_o_has_carbon_dioxide,ea1_what_is_the_main_component_o_has_nitrogen,ea1_what_is_the_main_component_o_has_3_to_22_minutes,ea1_what_is_the_main_component_o_has_instant,ea1_what_is_the_main_component_o_has_2_seconds,ea1_what_is_the_main_component_o_has_3_hours,ea1_what_is_the_main_component_o_has_earth_s_magnetosphere,ea1_what_is_the_main_component_o_has_thick_glass,ea1_what_is_the_main_component_o_has_lead_walls,ea1_what_is_the_main_component_o_has_the_solar_arrays,ea1_what_is_the_main_component_o_has_about_29_5_earth_days,ea1_what_is_the_main_component_o_has_24_hours,ea1_what_is_the_main_component_o_has_7_days,ea1_what_is_the_main_component_o_has_365_days,ea1_what_is_the_main_component_o_has_heat_from_decaying_plutonium,ea1_what_is_the_main_component_o_has_burning_methane,ea1_what_is_the_main_component_o_has_wind_turbines,ea1_what_is_the_main_component_o_has_coal_cells,ea1_what_is_the_main_component_o_has_resupply_from_earth_is_slow_,ea1_what_is_the_main_component_o_has_plants_glow_nicely,ea1_what_is_the_main_component_o_has_soil_is_free_in_space,ea1_what_is_the_main_component_o_has_it_removes_all_co2,ea1_what_is_the_main_component_o_has_dust_blocks_sunlight_and_coa,ea1_what_is_the_main_component_o_has_dust_freezes_panels,ea1_what_is_the_main_component_o_has_dust_conducts_electricity,ea1_what_is_the_main_component_o_has_no_hazard,ea1_what_is_the_main_component_o_has_artemis,ea1_what_is_the_main_component_o_has_apollo,ea1_how_long_can_a_one_way_radio_has_oxygen,ea1_how_long_can_a_one_way_radio_has_methane,ea1_how_long_can_a_one_way_radio_has_water,ea1_how_long_can_a_one_way_radio_has_hydrogen,ea1_how_long_can_a_one_way_radio_has_permanently_shadowed_craters,ea1_how_long_can_a_one_way_radio_has_it_is_the_warmest_region,ea1_how_long_can_a_one_way_radio_has_it_has_the_strongest_gravity,ea1_how_long_can_a_one_way_radio_has_it_is_closest_to_earth,ea1_how_long_can_a_one_way_radio_has_24_hours_37_minutes,ea1_how_long_can_a_one_way_radio_has_12_hours,ea1_how_long_can_a_one_way_radio_has_48_hours,ea1_how_long_can_a_one_way_radio_has_29_5_days,ea1_how_long_can_a_one_way_radio_has_carbon_dioxide,ea1_how_long_can_a_one_way_radio_has_nitrogen,ea1_how_long_can_a_one_way_radio_has_3_to_22_minutes,ea1_how_long_can_a_one_way_radio_has_instant,ea1_how_long_can_a_one_way_radio_has_2_seconds,ea1_how_long_can_a_one_way_radio_has_3_hours,ea1_how_long_can_a_one_way_radio_has_earth_s_magnetosphere,ea1_how_long_can_a_one_way_radio_has_thick_glass,ea1_how_long_can_a_one_way_radio_has_lead_walls,ea1_how_long_can_a_one_way_radio_has_the_solar_arrays,ea1_how_long_can_a_one_way_radio_has_about_29_5_earth_days,ea1_how_long_can_a_one_way_radio_has_24_hours,ea1_how_long_can_a_one_way_radio_has_7_days,ea1_how_long_can_a_one_way_radio_has_365_days,ea1_how_long_can_a_one_way_radio_has_heat_from_decaying_plutonium,ea1_how_long_can_a_one_way_radio_has_burning_methane,ea1_how_long_can_a_one_way_radio_has_wind_turbines,ea1_how_long_can_a_one_way_radio_has_coal_cells,ea1_how_long_can_a_one_way_radio_has_resupply_from_earth_is_slow_,ea1_how_long_can_a_one_way_radio_has_plants_glow_nicely,ea1_how_long_can_a_one_way_radio_has_soil_is_free_in_space,ea1_how_long_can_a_one_way_radio_has_it_removes_all_co2,ea1_how_long_can_a_one_way_radio_has_dust_blocks_sunlight_and_coa,ea1_how_long_can_a_one_way_radio_has_dust_freezes_panels,ea1_how_long_can_a_one_way_radio_has_dust_conducts_electricity,ea1_how_long_can_a_one_way_radio_has_no_hazard,ea1_how_long_can_a_one_way_radio_has_artemis,ea1_how_long_can_a_one_way_radio_has_apollo,ea1_what_protects_crews_on_the_i_has_oxygen,ea1_what_protects_crews_on_the_i_has_methane,ea1_what_protects_crews_on_the_i_has_water,ea1_what_protects_crews_on_the_i_has_hydrogen,ea1_what_protects_crews_on_the_i_has_permanently_shadowed_craters,ea1_what_protects_crews_on_the_i_has_it_is_the_warmest_region,ea1_what_protects_crews_on_the_i_has_it_has_the_strongest_gravity,ea1_what_protects_crews_on_the_i_has_it_is_closest_to_earth,ea1_what_protects_crews_on_the_i_has_24_hours_37_minutes,ea1_what_protects_crews_on_the_i_has_12_hours,ea1_what_protects_crews_on_the_i_has_48_hours,ea1_what_protects_crews_on_the_i_has_29_5_days,ea1_what_protects_crews_on_the_i_has_carbon_dioxide,ea1_what_protects_crews_on_the_i_has_nitrogen,ea1_what_protects_crews_on_the_i_has_3_to_22_minutes,ea1_what_protects_crews_on_the_i_has_instant,ea1_what_protects_crews_on_the_i_has_2_seconds,ea1_what_protects_crews_on_the_i_has_3_hours,ea1_what_protects_crews_on_the_i_has_earth_s_magnetosphere,ea1_what_protects_crews_on_the_i_has_thick_glass,ea1_what_protects_crews_on_the_i_has_lead_walls,ea1_what_protects_crews_on_the_i_has_the_solar_arrays,ea1_what_protects_crews_on_the_i_has_about_29_5_earth_days,ea1_what_protects_crews_on_the_i_has_24_hours,ea1_what_protects_crews_on_the_i_has_7_days,ea1_what_protects_crews_on_the_i_has_365_days,ea1_what_protects_crews_on_the_i_has_heat_from_decaying_plutonium,ea1_what_protects_crews_on_the_i_has_burning_methane,ea1_what_protects_crews_on_the_i_has_wind_turbines,ea1_what_protects_crews_on_the_i_has_coal_cells,ea1_what_protects_crews_on_the_i_has_resupply_from_earth_is_slow_,ea1_what_protects_crews_on_the_i_has_plants_glow_nicely,ea1_what_protects_crews_on_the_i_has_soil_is_free_in_space,ea1_what_protects_crews_on_the_i_has_it_removes_all_co2,ea1_what_protects_crews_on_the_i_has_dust_blocks_sunlight_and_coa,ea1_what_protects_crews_on_the_i_has_dust_freezes_panels,ea1_what_protects_crews_on_the_i_has_dust_conducts_electricity,ea1_what_protects_crews_on_the_i_has_no_hazard,ea1_what_protects_crews_on_the_i_has_artemis,ea1_what_protects_crews_on_the_i_has_apollo,ea1_roughly_how_long_is_a_full_l_has_oxygen,ea1_roughly_how_long_is_a_full_l_has_methane,ea1_roughly_how_long_is_a_full_l_has_water,ea1_roughly_how_long_is_a_full_l_has_hydrogen,ea1_roughly_how_long_is_a_full_l_has_permanently_shadowed_craters,ea1_roughly_how_long_is_a_full_l_has_it_is_the_warmest_region,ea1_roughly_how_long_is_a_full_l_has_it_has_the_strongest_gravity,ea1_roughly_how_long_is_a_full_l_has_it_is_closest_to_earth,ea1_roughly_how_long_is_a_full_l_has_24_hours_37_minutes,ea1_roughly_how_long_is_a_full_l_has_12_hours,ea1_roughly_how_long_is_a_full_l_has_48_hours,ea1_roughly_how_long_is_a_full_l_has_29_5_days,ea1_roughly_how_long_is_a_full_l_has_carbon_dioxide,ea1_roughly_how_long_is_a_full_l_has_nitrogen,ea1_roughly_how_long_is_a_full_l_has_3_to_22_minutes,ea1_roughly_how_long_is_a_full_l_has_instant,ea1_roughly_how_long_is_a_full_l_has_2_seconds,ea1_roughly_how_long_is_a_full_l_has_3_hours,ea1_roughly_how_long_is_a_full_l_has_earth_s_magnetosphere,ea1_roughly_how_long_is_a_full_l_has_thick_glass,ea1_roughly_how_long_is_a_full_l_has_lead_walls,ea1_roughly_how_long_is_a_full_l_has_the_solar_arrays,ea1_roughly_how_long_is_a_full_l_has_about_29_5_earth_days,ea1_roughly_how_long_is_a_full_l_has_24_hours,ea1_roughly_how_long_is_a_full_l_has_7_days,ea1_roughly_how_long_is_a_full_l_has_365_days,ea1_roughly_how_long_is_a_full_l_has_heat_from_decaying_plutonium,ea1_roughly_how_long_is_a_full_l_has_burning_methane,ea1_roughly_how_long_is_a_full_l_has_wind_turbines,ea1_roughly_how_long_is_a_full_l_has_coal_cells,ea1_roughly_how_long_is_a_full_l_has_resupply_from_earth_is_slow_,ea1_roughly_how_long_is_a_full_l_has_plants_glow_nicely,ea1_roughly_how_long_is_a_full_l_has_soil_is_free_in_space,ea1_roughly_how_long_is_a_full_l_has_it_removes_all_co2,ea1_roughly_how_long_is_a_full_l_has_dust_blocks_sunlight_and_coa,ea1_roughly_how_long_is_a_full_l_has_dust_freezes_panels,ea1_roughly_how_long_is_a_full_l_has_dust_conducts_electricity,ea1_roughly_how_long_is_a_full_l_has_no_hazard,ea1_roughly_how_long_is_a_full_l_has_artemis,ea1_roughly_how_long_is_a_full_l_has_apollo,ea1_what_do_rtgs_use_to_make_ele_has_oxygen,ea1_what_do_rtgs_use_to_make_ele_has_methane,ea1_what_do_rtgs_use_to_make_ele_has_water,ea1_what_do_rtgs_use_to_make_ele_has_hydrogen,ea1_what_do_rtgs_use_to_make_ele_has_permanently_shadowed_craters,ea1_what_do_rtgs_use_to_make_ele_has_it_is_the_warmest_region,ea1_what_do_rtgs_use_to_make_ele_has_it_has_the_strongest_gravity,ea1_what_do_rtgs_use_to_make_ele_has_it_is_closest_to_earth,ea1_what_do_rtgs_use_to_make_ele_has_24_hours_37_minutes,ea1_what_do_rtgs_use_to_make_ele_has_12_hours,ea1_what_do_rtgs_use_to_make_ele_has_48_hours,ea1_what_do_rtgs_use_to_make_ele_has_29_5_days,ea1_what_do_rtgs_use_to_make_ele_has_carbon_dioxide,ea1_what_do_rtgs_use_to_make_ele_has_nitrogen,ea1_what_do_rtgs_use_to_make_ele_has_3_to_22_minutes,ea1_what_do_rtgs_use_to_make_ele_has_instant,ea1_what_do_rtgs_use_to_make_ele_has_2_seconds,ea1_what_do_rtgs_use_to_make_ele_has_3_hours,ea1_what_do_rtgs_use_to_make_ele_has_earth_s_magnetosphere,ea1_what_do_rtgs_use_to_make_ele_has_thick_glass,ea1_what_do_rtgs_use_to_make_ele_has_lead_walls,ea1_what_do_rtgs_use_to_make_ele_has_the_solar_arrays,ea1_what_do_rtgs_use_to_make_ele_has_about_29_5_earth_days,ea1_what_do_rtgs_use_to_make_ele_has_24_hours,ea1_what_do_rtgs_use_to_make_ele_has_7_days,ea1_what_do_rtgs_use_to_make_ele_has_365_days,ea1_what_do_rtgs_use_to_make_ele_has_heat_from_decaying_plutonium,ea1_what_do_rtgs_use_to_make_ele_has_burning_methane,ea1_what_do_rtgs_use_to_make_ele_has_wind_turbines,ea1_what_do_rtgs_use_to_make_ele_has_coal_cells,ea1_what_do_rtgs_use_to_make_ele_has_resupply_from_earth_is_slow_,ea1_what_do_rtgs_use_to_make_ele_has_plants_glow_nicely,ea1_what_do_rtgs_use_to_make_ele_has_soil_is_free_in_space,ea1_what_do_rtgs_use_to_make_ele_has_it_removes_all_co2,ea1_what_do_rtgs_use_to_make_ele_has_dust_blocks_sunlight_and_coa,ea1_what_do_rtgs_use_to_make_ele_has_dust_freezes_panels,ea1_what_do_rtgs_use_to_make_ele_has_dust_conducts_electricity,ea1_what_do_rtgs_use_to_make_ele_has_no_hazard,ea1_what_do_rtgs_use_to_make_ele_has_artemis,ea1_what_do_rtgs_use_to_make_ele_has_apollo,ea1_why_is_growing_food_on_a_mis_has_oxygen,ea1_why_is_growing_food_on_a_mis_has_methane,ea1_why_is_growing_food_on_a_mis_has_water,ea1_why_is_growing_food_on_a_mis_has_hydrogen,ea1_why_is_growing_food_on_a_mis_has_permanently_shadowed_craters,ea1_why_is_growing_food_on_a_mis_has_it_is_the_warmest_region,ea1_why_is_growing_food_on_a_mis_has_it_has_the_strongest_gravity,ea1_why_is_growing_food_on_a_mis_has_it_is_closest_to_earth,ea1_why_is_growing_food_on_a_mis_has_24_hours_37_minutes,ea1_why_is_growing_food_on_a_mis_has_12_hours,ea1_why_is_growing_food_on_a_mis_has_48_hours,ea1_why_is_growing_food_on_a_mis_has_29_5_days,ea1_why_is_growing_food_on_a_mis_has_carbon_dioxide,ea1_why_is_growing_food_on_a_mis_has_nitrogen,ea1_why_is_growing_food_on_a_mis_has_3_to_22_minutes,ea1_why_is_growing_food_on_a_mis_has_instant,ea1_why_is_growing_food_on_a_mis_has_2_seconds,ea1_why_is_growing_food_on_a_mis_has_3_hours,ea1_why_is_growing_food_on_a_mis_has_earth_s_magnetosphere,ea1_why_is_growing_food_on_a_mis_has_thick_glass,ea1_why_is_growing_food_on_a_mis_has_lead_walls,ea1_why_is_growing_food_on_a_mis_has_the_solar_arrays,ea1_why_is_growing_food_on_a_mis_has_about_29_5_earth_days,ea1_why_is_growing_food_on_a_mis_has_24_hours,ea1_why_is_growing_food_on_a_mis_has_7_days,ea1_why_is_growing_food_on_a_mis_has_365_days,ea1_why_is_growing_food_on_a_mis_has_heat_from_decaying_plutonium,ea1_why_is_growing_food_on_a_mis_has_burning_methane,ea1_why_is_growing_food_on_a_mis_has_wind_turbines,ea1_why_is_growing_food_on_a_mis_has_coal_cells,ea1_why_is_growing_food_on_a_mis_has_resupply_from_earth_is_slow_,ea1_why_is_growing_food_on_a_mis_has_plants_glow_nicely,ea1_why_is_growing_food_on_a_mis_has_soil_is_free_in_space,ea1_why_is_growing_food_on_a_mis_has_it_removes_all_co2,ea1_why_is_growing_food_on_a_mis_has_dust_blocks_sunlight_and_coa,ea1_why_is_growing_food_on_a_mis_has_dust_freezes_panels,ea1_why_is_growing_food_on_a_mis_has_dust_conducts_electricity,ea1_why_is_growing_food_on_a_mis_has_no_hazard,ea1_why_is_growing_food_on_a_mis_has_artemis,ea1_why_is_growing_food_on_a_mis_has_apollo,ea1_what_hazard_do_dust_storms_o_has_oxygen,ea1_what_hazard_do_dust_storms_o_has_methane,ea1_what_hazard_do_dust_storms_o_has_water,ea1_what_hazard_do_dust_storms_o_has_hydrogen,ea1_what_hazard_do_dust_storms_o_has_permanently_shadowed_craters,ea1_what_hazard_do_dust_storms_o_has_it_is_the_warmest_region,ea1_what_hazard_do_dust_storms_o_has_it_has_the_strongest_gravity,ea1_what_hazard_do_dust_storms_o_has_it_is_closest_to_earth,ea1_what_hazard_do_dust_storms_o_has_24_hours_37_minutes,ea1_what_hazard_do_dust_storms_o_has_12_hours,ea1_what_hazard_do_dust_storms_o_has_48_hours,ea1_what_hazard_do_dust_storms_o_has_29_5_days,ea1_what_hazard_do_dust_storms_o_has_carbon_dioxide,ea1_what_hazard_do_dust_storms_o_has_nitrogen,ea1_what_hazard_do_dust_storms_o_has_3_to_22_minutes,ea1_what_hazard_do_dust_storms_o_has_instant,ea1_what_hazard_do_dust_storms_o_has_2_seconds,ea1_what_hazard_do_dust_storms_o_has_3_hours,ea1_what_hazard_do_dust_storms_o_has_earth_s_magnetosphere,ea1_what_hazard_do_dust_storms_o_has_thick_glass,ea1_what_hazard_do_dust_storms_o_has_lead_walls,ea1_what_hazard_do_dust_storms_o_has_the_solar_arrays,ea1_what_hazard_do_dust_storms_o_has_about_29_5_earth_days,ea1_what_hazard_do_dust_storms_o_has_24_hours,ea1_what_hazard_do_dust_storms_o_has_7_days,ea1_what_hazard_do_dust_storms_o_has_365_days,ea1_what_hazard_do_dust_storms_o_has_heat_from_decaying_plutonium,ea1_what_hazard_do_dust_storms_o_has_burning_methane,ea1_what_hazard_do_dust_storms_o_has_wind_turbines,ea1_what_hazard_do_dust_storms_o_has_coal_cells,ea1_what_hazard_do_dust_storms_o_has_resupply_from_earth_is_slow_,ea1_what_hazard_do_dust_storms_o_has_plants_glow_nicely,ea1_what_hazard_do_dust_storms_o_has_soil_is_free_in_space,ea1_what_hazard_do_dust_storms_o_has_it_removes_all_co2,ea1_what_hazard_do_dust_storms_o_has_dust_blocks_sunlight_and_coa,ea1_what_hazard_do_dust_storms_o_has_dust_freezes_panels,ea1_what_hazard_do_dust_storms_o_has_dust_conducts_electricity,ea1_what_hazard_do_dust_storms_o_has_no_hazard,ea1_what_hazard_do_dust_storms_o_has_artemis,ea1_what_hazard_do_dust_storms_o_has_apollo,ea1_which_program_aims_to_return_has_oxygen,ea1_which_program_aims_to_return_has_methane,ea1_which_program_aims_to_return_has_water,ea1_which_program_aims_to_return_has_hydrogen,ea1_which_program_aims_to_return_has_permanently_shadowed_craters,ea1_which_program_aims_to_return_has_it_is_the_warmest_region,ea1_which_program_aims_to_return_has_it_has_the_strongest_gravity,ea1_which_program_aims_to_return_has_it_is_closest_to_earth,ea1_which_program_aims_to_return_has_24_hours_37_minutes,ea1_which_program_aims_to_return_has_12_hours,ea1_which_program_aims_to_return_has_48_hours,ea1_which_program_aims_to_return_has_29_5_days,ea1_which_program_aims_to_return_has_carbon_dioxide,ea1_which_program_aims_to_return_has_nitrogen,ea1_which_program_aims_to_return_has_3_to_22_minutes,ea1_which_program_aims_to_return_has_instant,ea1_which_program_aims_to_return_has_2_seconds,ea1_which_program_aims_to_return_has_3_hours,ea1_which_program_aims_to_return_has_earth_s_magnetosphere,ea1_which_program_aims_to_return_has_thick_glass,ea1_which_program_aims_to_return_has_lead_walls,ea1_which_program_aims_to_return_has_the_solar_arrays,ea1_which_program_aims_to_return_has_about_29_5_earth_days,ea1_which_program_aims_to_return_has_24_hours,ea1_which_program_aims_to_return_has_7_days,ea1_which_program_aims_to_return_has_365_days,ea1_which_program_aims_to_return_has_heat_from_decaying_plutonium,ea1_which_program_aims_to_return_has_burning_methane,ea1_which_program_aims_to_return_has_wind_turbines,ea1_which_program_aims_to_return_has_coal_cells,ea1_which_program_aims_to_return_has_resupply_from_earth_is_slow_,ea1_which_program_aims_to_return_has_plants_glow_nicely,da0_achievements_scenario_hash,da0_achievements_hoarder_hash,da0_events_tag_mars,da0_events_tag_moon,da0_events_sites_distinct,da0_quiz_tag_oxygen,da0_quiz_tag_water,da0_quiz_tag_methane,da0_quiz_tag_hydrogen,da0_quiz_tag_permanently_shadowed_craters,da0_quiz_tag_it_is_the_warmest_region,da0_quiz_tag_it_has_the_strongest_gravity,da0_quiz_tag_it_is_closest_to_earth,da0_quiz_tag_24_hours_37_minutes,da0_quiz_tag_12_hours,da0_quiz_tag_48_hours,da0_quiz_tag_29_5_days,da0_quiz_tag_carbon_dioxide,da0_quiz_tag_nitrogen,da0_quiz_tag_3_to_22_minutes,da0_quiz_tag_instant,da0_quiz_tag_2_seconds,da0_quiz_tag_3_hours,da0_quiz_tag_earth_s_magnetosphere,da0_quiz_tag_thick_glass,da0_quiz_tag_lead_walls,da0_quiz_tag_the_solar_arrays,da0_quiz_tag_about_29_5_earth_days,da0_quiz_tag_24_hours,da0_quiz_tag_7_days,da0_quiz_tag_365_days,da0_quiz_tag_heat_from_decaying_plutonium,da0_quiz_tag_burning_methane,da0_quiz_tag_wind_turbines,da0_quiz_tag_coal_cells,da0_quiz_tag_resupply_from_earth_is_slow_,da0_quiz_tag_plants_glow_nicely,da0_quiz_tag_soil_is_free_in_space,da0_quiz_tag_it_removes_all_co2,da0_quiz_tag_dust_blocks_sunlight_and_coa,da0_quiz_tag_dust_freezes_panels,da0_quiz_tag_dust_conducts_electricity,da0_quiz_tag_no_hazard,da0_quiz_tag_artemis,da0_quiz_tag_apollo,da0_quiz_tag_gemini,da0_quiz_tag_mercury,da0_quiz_tag_james_webb,da0_quiz_tag_hubble,da0_quiz_tag_kepler,da0_quiz_tag_spitzer,da0_quiz_tag_it_absorbs_radiation_when_pi,da0_quiz_tag_it_is_magnetic,da0_quiz_tag_it_glows,da0_quiz_tag_it_is_radioactive,da0_quiz_tag_water_molecules,da0_quiz_tag_oil,da0_quiz_tag_methane_lakes,da0_quiz_tag_active_volcanoes,da0_quiz_tag_natural_caves_give_ready_mad,da0_quiz_tag_they_contain_gold,da0_quiz_tag_they_generate_heat,da0_quiz_tag_they_attract_rovers,da0_quiz_tag_using_local_resources_like_i,da0_quiz_tag_a_rocket_fuel,da0_quiz_tag_a_satellite_band,da0_quiz_tag_a_spacesuit_layer,da0_quiz_tag_toxic_to_humans_and_crops,da0_quiz_tag_delicious,da0_quiz_tag_radioactive,da0_quiz_tag_explosive,da0_quiz_tag_apollo_13,da0_quiz_tag_apollo_11,da0_quiz_tag_apollo_8,da0_quiz_tag_apollo_17,da0_quiz_tag_sunlight_there_is_weaker_and,da0_quiz_tag_plants_fear_mars,da0_quiz_tag_glass_freezes,da0_quiz_tag_it_doesn_t,da0_quiz_tag_solar_arrays_on_illuminated_,da0_quiz_tag_coal_plant,da0_quiz_tag_wind_farm,da0_quiz_tag_tidal_generator,da0_quiz_a_distinct,da0_storm_has_moon,da0_storm_has_mars,da0_micro_has_moon,da0_micro_has_mars,da0_illness_has_moon,da0_illness_has_mars,da0_aurora_has_moon,da0_aurora_has_mars,da0_quake_has_moon,da0_quake_has_mars,da0_find_has_moon,da0_find_has_mars,da0_relay_has_moon,da0_relay_has_mars,da0_calm_has_moon,da0_calm_has_mars,da0_flare_has_moon,da0_flare_has_mars,da0_birthday_has_moon,da0_birthday_has_mars,da0_stowaway_has_moon,da0_stowaway_has_mars,da0_coolant_has_moon,da0_coolant_has_mars,da0_podbonus_has_moon,da0_podbonus_has_mars,da0_breakthrough_has_moon,da0_breakthrough_has_mars,da0_homesick_has_moon,da0_homesick_has_mars,da0_meteorshower_has_moon,da0_meteorshower_has_mars,da0_o2leak_has_moon,da0_o2leak_has_mars,da0_blight_has_moon,da0_blight_has_mars,da0_argument_has_moon,da0_argument_has_mars,da0_dustdevil_has_moon,da0_dustdevil_has_mars,da0_suitpuncture_has_moon,da0_suitpuncture_has_mars,da0_icepocket_has_moon,da0_icepocket_has_mars,da0_what_did_nasa_s_moxie_experi_has_oxygen,da0_what_did_nasa_s_moxie_experi_has_methane,da0_what_did_nasa_s_moxie_experi_has_water,da0_what_did_nasa_s_moxie_experi_has_hydrogen,da0_what_did_nasa_s_moxie_experi_has_permanently_shadowed_craters,da0_what_did_nasa_s_moxie_experi_has_it_is_the_warmest_region,da0_what_did_nasa_s_moxie_experi_has_it_has_the_strongest_gravity,da0_what_did_nasa_s_moxie_experi_has_it_is_closest_to_earth,da0_what_did_nasa_s_moxie_experi_has_24_hours_37_minutes,da0_what_did_nasa_s_moxie_experi_has_12_hours,da0_what_did_nasa_s_moxie_experi_has_48_hours,da0_what_did_nasa_s_moxie_experi_has_29_5_days,da0_what_did_nasa_s_moxie_experi_has_carbon_dioxide,da0_what_did_nasa_s_moxie_experi_has_nitrogen,da0_what_did_nasa_s_moxie_experi_has_3_to_22_minutes,da0_what_did_nasa_s_moxie_experi_has_instant,da0_what_did_nasa_s_moxie_experi_has_2_seconds,da0_what_did_nasa_s_moxie_experi_has_3_hours,da0_what_did_nasa_s_moxie_experi_has_earth_s_magnetosphere,da0_what_did_nasa_s_moxie_experi_has_thick_glass,da0_what_did_nasa_s_moxie_experi_has_lead_walls,da0_what_did_nasa_s_moxie_experi_has_the_solar_arrays,da0_what_did_nasa_s_moxie_experi_has_about_29_5_earth_days,da0_what_did_nasa_s_moxie_experi_has_24_hours,da0_what_did_nasa_s_moxie_experi_has_7_days,da0_what_did_nasa_s_moxie_experi_has_365_days,da0_what_did_nasa_s_moxie_experi_has_heat_from_decaying_plutonium,da0_what_did_nasa_s_moxie_experi_has_burning_methane,da0_what_did_nasa_s_moxie_experi_has_wind_turbines,da0_what_did_nasa_s_moxie_experi_has_coal_cells,da0_what_did_nasa_s_moxie_experi_has_resupply_from_earth_is_slow_,da0_what_did_nasa_s_moxie_experi_has_plants_glow_nicely,ca9_quiz_has_making,ca9_quiz_has_planners,ca9_quiz_has_shadowed,ca9_quiz_has_light,ca9_quiz_has_shielding,ca9_quiz_has_night,ca9_quiz_has_local,ca9_quiz_has_return,ca9_quiz_has_sofia,ca9_quiz_has_tubes,ca9_quiz_has_apollo,ca9_quiz_has_experiment,ca9_quiz_has_produce,ca9_quiz_has_toward,ca9_quiz_has_rocket,ca9_quiz_has_target,ca9_quiz_has_craters,ca9_quiz_has_traps,ca9_quiz_has_preserve,ca9_quiz_has_close,ca9_events_storm_hash,ca9_events_micro_hash,ca9_events_illness_hash,ca9_events_aurora_hash,ca9_events_quake_hash,ca9_events_find_hash,ca9_events_relay_hash,ca9_events_calm_hash,ca9_events_flare_hash,ca9_events_birthday_hash,ca9_events_stowaway_hash,ca9_events_coolant_hash,ca9_events_podbonus_hash,ca9_events_breakthrough_hash,ca9_events_homesick_hash,ca9_events_meteorshower_hash,ca9_events_o2leak_hash,ca9_events_blight_hash,ca9_events_argument_hash,ca9_events_dustdevil_hash,ca9_events_suitpuncture_hash,ca9_events_icepocket_hash,ca9_quiz_what_did_nasa_s_moxie_experi_hash,ca9_quiz_why_do_planners_target_the_m_hash,ca9_quiz_about_how_long_is_one_martia_hash,ca9_quiz_what_is_the_main_component_o_hash,ca9_quiz_how_long_can_a_one_way_radio_hash,ca9_quiz_what_protects_crews_on_the_i_hash,ca9_quiz_roughly_how_long_is_a_full_l_hash,ca9_quiz_what_do_rtgs_use_to_make_ele_hash,ca9_quiz_why_is_growing_food_on_a_mis_hash,ca9_quiz_what_hazard_do_dust_storms_o_hash,ca9_quiz_which_program_aims_to_return_hash,ca9_quiz_which_telescope_launched_in__hash,ca9_quiz_what_makes_lunar_regolith_us_hash,ca9_quiz_what_did_the_sofia_observato_hash,ca9_quiz_why_are_lava_tubes_interesti_hash,ca9_quiz_what_is_isru_hash,ca9_quiz_perchlorate_salts_in_martian_hash,ca9_quiz_which_apollo_mission_turned__hash,ca9_quiz_why_does_a_greenhouse_on_mar_hash,ca9_quiz_what_is_a_fair_first_power_s_hash,ca9_achievements_firstsol_hash,ca9_achievements_power50_hash,ca9_achievements_science100_hash,ca9_achievements_shield3_hash,ca9_achievements_sol15_hash,ca9_achievements_sol30_hash,ca9_achievements_fullhouse_hash,ca9_achievements_quiz5_hash,ca9_achievements_selfsufficient_hash,ca9_achievements_survivor_hash,ca9_achievements_researcher_hash,ca9_achievements_awayteam_hash,ca9_achievements_veteran_hash,ca9_achievements_nightowl_hash,ca9_achievements_closedloop2_hash,ca9_achievements_highscore_hash,ca9_achievements_crosstrained_hash,ca9_achievements_farmer_hash,ba8_storm_id,ba8_storm_text,ba8_storm_w,ba8_storm_sites_n,ba8_storm_sites_first,ba8_storm_text_wc,ba8_micro_id,ba8_micro_text,ba8_micro_w,ba8_micro_sites_n,ba8_micro_sites_first,ba8_micro_text_wc,ba8_illness_id,ba8_illness_text,ba8_illness_w,ba8_illness_sites_n,ba8_illness_sites_first,ba8_illness_text_wc,ba8_aurora_id,ba8_aurora_text,ba8_aurora_w,ba8_aurora_sites_n,ba8_aurora_sites_first,ba8_aurora_text_wc,ba8_quake_id,ba8_quake_text,ba8_quake_w,ba8_quake_sites_n,ba8_quake_sites_first,ba8_quake_text_wc,ba8_find_id,ba8_find_text,ba8_find_w,ba8_find_sites_n,ba8_find_sites_first,ba8_find_text_wc,ba8_relay_id,ba8_relay_text,ba8_relay_w,ba8_relay_sites_n,ba8_relay_sites_first,ba8_relay_text_wc,ba8_calm_id,ba8_calm_text,ba8_calm_w,ba8_calm_sites_n,ba8_calm_sites_first,ba8_calm_text_wc,ba8_flare_id,ba8_flare_text,ba8_flare_w,ba8_flare_sites_n,ba8_flare_sites_first,ba8_flare_text_wc,ba8_birthday_id,ba8_birthday_text,ba8_birthday_w,ba8_birthday_sites_n,ba8_birthday_sites_first,ba8_birthday_text_wc,ba8_stowaway_id,ba8_stowaway_text,ba8_stowaway_w,ba8_stowaway_sites_n,ba8_stowaway_sites_first,ba8_stowaway_text_wc,ba8_coolant_id,ba8_coolant_text,ba8_coolant_w,ba8_coolant_sites_n,ba8_coolant_sites_first,ba8_coolant_text_wc,ba8_podbonus_id,ba8_podbonus_text,ba8_podbonus_w,ba8_podbonus_sites_n,ba8_podbonus_sites_first,ba8_podbonus_text_wc,ba8_breakthrough_id,ba8_breakthrough_text,ba8_breakthrough_w,ba8_breakthrough_sites_n,ba8_breakthrough_sites_first,ba8_breakthrough_text_wc,ba8_homesick_id,ba8_homesick_text,ba8_homesick_w,ba8_homesick_sites_n,ba8_homesick_sites_first,ba8_homesick_text_wc,ba8_meteorshower_id,ba8_meteorshower_text,ba8_meteorshower_w,ba8_meteorshower_sites_n,ba8_meteorshower_sites_first,ba8_meteorshower_text_wc,ba8_o2leak_id,ba8_o2leak_text,ba8_o2leak_w,ba8_o2leak_sites_n,ba8_o2leak_sites_first,ba8_o2leak_text_wc,ba8_blight_id,ba8_blight_text,ba8_blight_w,ba8_blight_sites_n,ba8_blight_sites_first,ba8_blight_text_wc,ba8_argument_id,ba8_argument_text,ba8_argument_w,ba8_argument_sites_n,ba8_argument_sites_first,ba8_argument_text_wc,ba8_dustdevil_id,ba8_dustdevil_text,ba8_dustdevil_w,ba8_dustdevil_sites_n,ba8_dustdevil_sites_first,ba8_dustdevil_text_wc,ba8_suitpuncture_id,ba8_suitpuncture_text,ba8_suitpuncture_w,ba8_suitpuncture_sites_n,ba8_suitpuncture_sites_first,ba8_suitpuncture_text_wc,ba8_icepocket_id,ba8_icepocket_text,ba8_icepocket_w,ba8_icepocket_sites_n,ba8_icepocket_sites_first,ba8_icepocket_text_wc,ba8_what_did_nasa_s_moxie_experi_q,ba8_what_did_nasa_s_moxie_experi_c,ba8_what_did_nasa_s_moxie_experi_fact,ba8_what_did_nasa_s_moxie_experi_a_n,ba8_what_did_nasa_s_moxie_experi_a_first,ba8_what_did_nasa_s_moxie_experi_q_wc,ba8_what_did_nasa_s_moxie_experi_fact_wc,ba8_why_do_planners_target_the_m_q,ba8_why_do_planners_target_the_m_c,ba8_why_do_planners_target_the_m_fact,ba8_why_do_planners_target_the_m_a_n,ba8_why_do_planners_target_the_m_a_first,ba8_why_do_planners_target_the_m_q_wc,ba8_why_do_planners_target_the_m_fact_wc,ba8_about_how_long_is_one_martia_q,ba8_about_how_long_is_one_martia_c,ba8_about_how_long_is_one_martia_fact,ba8_about_how_long_is_one_martia_a_n,ba8_about_how_long_is_one_martia_a_first,ba8_about_how_long_is_one_martia_q_wc,ba8_about_how_long_is_one_martia_fact_wc,ba8_what_is_the_main_component_o_q,ba8_what_is_the_main_component_o_c,ba8_what_is_the_main_component_o_fact,ba8_what_is_the_main_component_o_a_n,ba8_what_is_the_main_component_o_a_first,ba8_what_is_the_main_component_o_q_wc,ba8_what_is_the_main_component_o_fact_wc,ba8_how_long_can_a_one_way_radio_q,ba8_how_long_can_a_one_way_radio_c,ba8_how_long_can_a_one_way_radio_fact,ba8_how_long_can_a_one_way_radio_a_n,ba8_how_long_can_a_one_way_radio_a_first,ba8_how_long_can_a_one_way_radio_q_wc,ba8_how_long_can_a_one_way_radio_fact_wc,ba8_what_protects_crews_on_the_i_q,ba8_what_protects_crews_on_the_i_c,ba8_what_protects_crews_on_the_i_fact,ba8_what_protects_crews_on_the_i_a_n,ba8_what_protects_crews_on_the_i_a_first,ba8_what_protects_crews_on_the_i_q_wc,ba8_what_protects_crews_on_the_i_fact_wc,ba8_roughly_how_long_is_a_full_l_q,ba8_roughly_how_long_is_a_full_l_c,ba8_roughly_how_long_is_a_full_l_fact,ba8_roughly_how_long_is_a_full_l_a_n,ba8_roughly_how_long_is_a_full_l_a_first,ba8_roughly_how_long_is_a_full_l_q_wc,ba8_roughly_how_long_is_a_full_l_fact_wc,ba8_what_do_rtgs_use_to_make_ele_q,ba8_what_do_rtgs_use_to_make_ele_c,ba8_what_do_rtgs_use_to_make_ele_fact,ba8_what_do_rtgs_use_to_make_ele_a_n,ba8_what_do_rtgs_use_to_make_ele_a_first,ba8_what_do_rtgs_use_to_make_ele_q_wc,ba8_what_do_rtgs_use_to_make_ele_fact_wc,ba8_why_is_growing_food_on_a_mis_q,ba8_why_is_growing_food_on_a_mis_c,ba8_why_is_growing_food_on_a_mis_fact,ba8_why_is_growing_food_on_a_mis_a_n,ba8_why_is_growing_food_on_a_mis_a_first,ba8_why_is_growing_food_on_a_mis_q_wc,ba8_why_is_growing_food_on_a_mis_fact_wc,ba8_what_hazard_do_dust_storms_o_q,ba8_what_hazard_do_dust_storms_o_c,ba8_what_hazard_do_dust_storms_o_fact,ba8_what_hazard_do_dust_storms_o_a_n,ba8_what_hazard_do_dust_storms_o_a_first,ba8_what_hazard_do_dust_storms_o_q_wc,ba8_what_hazard_do_dust_storms_o_fact_wc,ba8_which_program_aims_to_return_q,ba8_which_program_aims_to_return_c,ba8_which_program_aims_to_return_fact,ba8_which_program_aims_to_return_a_n,ba8_which_program_aims_to_return_a_first,ba8_which_program_aims_to_return_q_wc,ba8_which_program_aims_to_return_fact_wc,ba8_which_telescope_launched_in__q,ba8_which_telescope_launched_in__c,ba8_which_telescope_launched_in__fact,ba8_which_telescope_launched_in__a_n,ba8_which_telescope_launched_in__a_first,ba8_which_telescope_launched_in__q_wc,ba8_which_telescope_launched_in__fact_wc,ba8_what_makes_lunar_regolith_us_q,ba8_what_makes_lunar_regolith_us_c,ba8_what_makes_lunar_regolith_us_fact,ba8_what_makes_lunar_regolith_us_a_n,ba8_what_makes_lunar_regolith_us_a_first,ba8_what_makes_lunar_regolith_us_q_wc,ba8_what_makes_lunar_regolith_us_fact_wc,ba8_what_did_the_sofia_observato_q,ba8_what_did_the_sofia_observato_c,ba8_what_did_the_sofia_observato_fact,ba8_what_did_the_sofia_observato_a_n,ba8_what_did_the_sofia_observato_a_first,ba8_what_did_the_sofia_observato_q_wc,ba8_what_did_the_sofia_observato_fact_wc,ba8_why_are_lava_tubes_interesti_q,ba8_why_are_lava_tubes_interesti_c,ba8_why_are_lava_tubes_interesti_fact,ba8_why_are_lava_tubes_interesti_a_n,ba8_why_are_lava_tubes_interesti_a_first,ba8_why_are_lava_tubes_interesti_q_wc,ba8_why_are_lava_tubes_interesti_fact_wc,ba8_what_is_isru_q,ba8_what_is_isru_c,ba8_what_is_isru_fact,ba8_what_is_isru_a_n,ba8_what_is_isru_a_first,ba8_what_is_isru_fact_wc,ba8_perchlorate_salts_in_martian_q,ba8_perchlorate_salts_in_martian_c,ba8_perchlorate_salts_in_martian_fact,ba8_perchlorate_salts_in_martian_a_n,ba8_perchlorate_salts_in_martian_a_first,ba8_perchlorate_salts_in_martian_q_wc,ba8_perchlorate_salts_in_martian_fact_wc,ba8_which_apollo_mission_turned__q,ba8_which_apollo_mission_turned__c,ba8_which_apollo_mission_turned__fact,ba8_which_apollo_mission_turned__a_n,ba8_which_apollo_mission_turned__a_first,ba8_which_apollo_mission_turned__q_wc,ba8_which_apollo_mission_turned__fact_wc,ba8_why_does_a_greenhouse_on_mar_q,ba8_why_does_a_greenhouse_on_mar_c,ba8_why_does_a_greenhouse_on_mar_fact,ba8_why_does_a_greenhouse_on_mar_a_n,ba8_why_does_a_greenhouse_on_mar_a_first,ba8_why_does_a_greenhouse_on_mar_q_wc,ba8_why_does_a_greenhouse_on_mar_fact_wc,ba8_what_is_a_fair_first_power_s_q,ba8_what_is_a_fair_first_power_s_c,ba8_what_is_a_fair_first_power_s_fact,ba8_what_is_a_fair_first_power_s_a_n,ba8_what_is_a_fair_first_power_s_a_first,ba8_what_is_a_fair_first_power_s_q_wc,ba8_what_is_a_fair_first_power_s_fact_wc,ba8_firstsol_id,ba8_firstsol_name,ba8_power50_id,ba8_power50_name,ba8_science100_id,ba8_science100_name,ba8_shield3_id,ba8_shield3_name,ba8_sol15_id,ba8_sol15_name,ba8_sol30_id,ba8_sol30_name,ba8_fullhouse_id,ba8_fullhouse_name,ba8_quiz5_id,ba8_quiz5_name,ba8_selfsufficient_id,ba8_selfsufficient_name,ba8_survivor_id,ba8_survivor_name,ba8_researcher_id,ba8_researcher_name,ba8_awayteam_id,ba8_awayteam_name,ba8_veteran_id,ba8_veteran_name,ba8_nightowl_id,ba8_nightowl_name,ba8_closedloop2_id,ba8_closedloop2_name,ba8_highscore_id,ba8_highscore_name,ba8_crosstrained_id,ba8_crosstrained_name,ba8_farmer_id,ba8_farmer_name,ba8_scenario_id,ba8_scenario_name,ba8_hoarder_id,ba8_hoarder_name,ba8_events_count,ba8_events_w_min,ba8_events_w_max,ba8_events_w_sum,ba8_quiz_count,ba8_quiz_c_min,ba8_quiz_c_max,ba8_quiz_c_sum,ba8_achievements_count,ba8_events_has_solar,ba8_events_has_building,ba8_events_has_morale,ba8_events_has_member,ba8_events_has_radiation,ba8_events_has_damaging,ba8_events_has_pocket,ba8_events_has_science,ba8_events_has_online,ba8_events_has_drops,ba8_events_has_oxygen,ba8_events_has_storm,ba8_events_has_output,ba8_events_has_micrometeorite,ba8_events_has_strike,ba8_events_has_damages,ba8_events_has_random,ba8_events_has_falls,ba8_events_has_loses,ba8_events_has_health,ba8_events_has_particle,ba8_events_has_event,ba8_events_has_unshielded,ba8_events_has_moonquake,ba8_events_has_rattles,ba8_events_has_surveyors,ba8_events_has_water,ba8_events_has_satellite,ba8_events_has_relay,ba8_events_has_passes,ba8_events_has_overhead,ba8_events_has_comms,ba8_events_has_improves,ba8_events_has_flare,ba8_events_has_extra,ba8_events_has_birthday,ba8_events_has_lifts,ba8_events_has_everyone,ba8_events_has_stowaway,ba8_events_has_stores,ba8_quiz_has_earth,ba8_quiz_has_lunar,ba8_quiz_has_martian,ba8_quiz_has_atmosphere,ba8_quiz_has_water,ba8_quiz_has_about,ba8_quiz_has_oxygen,ba8_quiz_has_crews,ba8_quiz_has_south,ba8_quiz_has_radiation,ba8_quiz_has_regolith,ba8_quiz_has_solar,ba8_quiz_has_polar,ba8_quiz_has_power,ba8_quiz_has_storms,ba8_quiz_has_mission,ba8_quiz_has_sunlight,ba8_quiz_has_which,ba8_quiz_has_moxie,ba8_quiz_has_first,o7a,o7b,o7c,o7d,o7e,o7f,o7g,o7h,o7i,o7j,o7k,o7l,o7m,o7n,o7o,o7p,o7q,o7r,o7s,o7t,o7u,o7v,o7w,o7x,o7y,o7z,o7ba,o7bb,o7bc,o7bd,o7be,o7bf,o7bg,o7bh,o7bi,o7bj,o7bk,o7bl,o7bm,o7bn,o7bo,o7bp,o7bq,o7br,o7bs,o7bt,o7bu,o7bv,o7bw,o7bx,o7by,o7bz,o7ca,o7cb,o7cc,o7cd,o7ce,o7cf,o7cg,o7ch,o7ci,o7cj,o7ck,o7cl,o7cm,o7cn,o7co,o7cp,o7cq,o7cr,o7cs,o7ct,o7cu,o7cv,o7cw,o7cx,o7cy,o7cz,o7da,o7db,o7dc,o7dd,o7de,o7df,o7dg,o7dh,o7di,o7dj,o7dk,o7dl,o7dm,o7dn,o7do,o7dp,o7dq,o7dr,o7ds,o7dt,o7du,o7dv,o7dw,o7dx,o7dy,o7dz,o7ea,o7eb,o7ec,o7ed,o7ee,o7ef,o7eg,o7eh,o7ei,o7ej,o7ek,o7el,o7em,o7en,o7eo,o7ep,o7eq,o7er,o7es,o7et,o7eu,o7ev,o7ew,o7ex,o7ey,o7ez,o7fa,o7fb,o7fc,o7fd,o7fe,o7ff,o7fg,o7fh,o7fi,o7fj,o7fk,a7a,a7b,a7c,a7d,a7e,a7f,a7g,a7h,a7i,a7j,a7k,a7l,a7m,a7n,a7o,a7p,a7q,a7r,a7s,a7t,a7u,a7v,a7w,a7x,a7y,a7z,a7ba,a7bb,a7bc,a7bd,a7be,a7bf,a7bg,a7bh,a7bi,a7bj,a7bk,a7bl,a7bm,a7bn,a7bo,a7bp,a7bq,a7br,a7bs,a7bt,a7bu,a7bv,a7bw,a7bx,a7by,a7bz,a7ca,a7cb,a7cc,a7cd,a7ce,a7cf,a7cg,a7ch,SITES:SITES,BUILDINGS:BUILDINGS,QUIZ:QUIZ,ACHIEVEMENTS:ACHIEVEMENTS,TECHS:TECHS,CROPS:CROPS,EXPEDITIONS:EXPEDITIONS,SCENARIOS:SCENARIOS,ROLES:ROLES,EVENTS:EVENTS,
rest:rest,cleanSolar:cleanSolar,repairAll:repairAll,shelterMode:shelterMode,suitMaintenance:suitMaintenance,setObjectiveMode:setObjectiveMode,resourceHistory:resourceHistory,historyCSV:historyCSV,crewCSV:crewCSV,eventPreview:eventPreview,dryRunBuild:dryRunBuild,alerts:alerts,letterGrade:letterGrade,postMortem:postMortem,dailyChecklist:dailyChecklist,missionNameGen:missionNameGen,difficultyTable:difficultyTable,scoreBreakdown:scoreBreakdown,shareText:shareText,achievementProgress:achievementProgress,batteryStatus:batteryStatus,moraleReport:moraleReport,powerForecast:powerForecast,foodCalendar:foodCalendar,buildQueueEta:buildQueueEta,healthReport:healthReport,tutorialHints:tutorialHints,weeklySummary:weeklySummary,avgMorale:avgMorale,researchCost:researchCost,damageOne:damageOne,applyEvent:applyEvent,
newGame:newGame,tick:tick,build:build,repair:repair,evaRepair:evaRepair,advise:advise,recruit:recruit,answerQuiz:answerQuiz,report:report,reportJSON:reportJSON,aliveCount:aliveCount,crewCapacity:crewCapacity,computePower:computePower,canBuild:canBuild,
research:research,retrain:retrain,setRations:setRations,setCrop:setCrop,setManifest:setManifest,setMissionName:setMissionName,renameCrew:renameCrew,expedition:expedition,forecast:forecast,setScenario:setScenario,powerBreakdown:powerBreakdown,statsSummary:statsSummary,score:score,compareSites:compareSites,cLevel:cLevel,solReport:solReport,netRates:netRates,resourceRunway:resourceRunway,criticalCrew:criticalCrew,unpoweredList:unpoweredList,sciencePlan:sciencePlan,shieldPlan:shieldPlan,batteryPlan:batteryPlan,foodPlan:foodPlan,waterPlan:waterPlan,eventRiskReport:eventRiskReport,expeditionPlanner:expeditionPlanner,expeditionHistoryCSV:expeditionHistoryCSV,buildPlanCSV:buildPlanCSV,techTreeCSV:techTreeCSV,quizBankStats:quizBankStats,achievementTable:achievementTable,siteComparisonCSV:siteComparisonCSV,logCSV:logCSV,endgameProjection:endgameProjection,whatIfAllBuildings:whatIfAllBuildings,bestNextBuild:bestNextBuild,crewRoleMatrix:crewRoleMatrix,trainingPlan:trainingPlan,rationsAdvisor:rationsAdvisor,cropAdvisor:cropAdvisor,stormPrepChecklist:stormPrepChecklist,nightPrepChecklist:nightPrepChecklist,solMilestones:solMilestones,winProbabilityHint:winProbabilityHint,glossaryTerms:glossaryTerms,faqList:faqList,missionNameValidate:missionNameValidate,crewNameSuggest:crewNameSuggest,compareDifficulties:compareDifficulties,summaryEmailText:summaryEmailText,markdownLog:markdownLog,statsJSON:statsJSON,validateState:validateState,stateHash:stateHash,fatigueForecast:fatigueForecast,xpProgress:xpProgress,techRecommend:techRecommend,researchQueueCSV:researchQueueCSV,buildingEfficiency:buildingEfficiency,powerAudit:powerAudit,solarOutlook:solarOutlook,hazardCalendar:hazardCalendar,radiationBreakdown:radiationBreakdown,o2Sheet:o2Sheet,waterSheet:waterSheet,foodSheet:foodSheet,partsOutlook:partsOutlook,scienceSources:scienceSources,crewUpkeep:crewUpkeep,habitatReport:habitatReport,expansionPlan:expansionPlan,objectiveProgress:objectiveProgress,deadlineCheck:deadlineCheck,firstShortage:firstShortage,eventTypeCounts:eventTypeCounts,quizWeakSpots:quizWeakSpots,nearestAchievements:nearestAchievements,runModifiers:runModifiers,alternateSiteSim:alternateSiteSim,replayCode:replayCode,missionTimelineCSV:missionTimelineCSV,subsystemGrades:subsystemGrades,maintenancePlan:maintenancePlan,cleanOrder:cleanOrder,siteFacts:siteFacts,triviaOfTheSol:triviaOfTheSol,badgeShelf:badgeShelf,radioChatter:radioChatter,tomorrowBrief:tomorrowBrief,restRotation:restRotation,victoryGap:victoryGap,trueCost:trueCost,buildingCounts:buildingCounts,cropRotation:cropRotation,expeditionRiskTable:expeditionRiskTable,eventHistory:eventHistory,settingsSnapshot:settingsSnapshot,scoreProjection:scoreProjection,moraleLevers:moraleLevers,powerSpikeCheck:powerSpikeCheck,waterRecyclingGain:waterRecyclingGain,greenhouseYield:greenhouseYield,logSearch:logSearch,powerBalanceSheet:powerBalanceSheet,crewSummary:crewSummary,crewHealthAvg:crewHealthAvg,crewFatigueAvg:crewFatigueAvg,crewXpTotal:crewXpTotal,crewLevels:crewLevels,exhaustedCrew:exhaustedCrew,awayCrew:awayCrew,roleRoster:roleRoster,moraleSpread:moraleSpread,resLevels:resLevels,resLowest:resLowest,resRatios:resRatios,sciencePace:sciencePace,buildingTypes:buildingTypes,damagedList:damagedList,inProgressList:inProgressList,greenhouseList:greenhouseList,cropCoverage:cropCoverage,powerMargin:powerMargin,storeDays:storeDays,shieldInfo:shieldInfo,techsResearched:techsResearched,techCount:techCount,techsAvailable:techsAvailable,nextTechCost:nextTechCost,eventLog:eventLog,eventCountToday:eventCountToday,stormCount:stormCount,expeditionStats:expeditionStats,quizRecord:quizRecord,achievementPct:achievementPct,difficultyMult:difficultyMult,solsRemaining:solsRemaining,projectedScience:projectedScience,projectedWin:projectedWin,runwayTable:runwayTable,shortestRunway:shortestRunway,historyAt:historyAt,historyRange:historyRange,historyDelta:historyDelta,worstSol:worstSol,bestSol:bestSol,historyTrend:historyTrend,upcomingEvents:upcomingEvents,nextHazard:nextHazard,calendarNote:calendarNote,buildNext:buildNext,affordableBuildings:affordableBuildings,researchableNow:researchableNow,actionChecklist:actionChecklist,missionStatusLine:missionStatusLine,dangerScore:dangerScore,winOddsText:winOddsText,crewTableCSV:crewTableCSV,buildingsCSV:buildingsCSV,techCSV:techCSV,scheduleCSV:scheduleCSV,snapshotJSON:snapshotJSON,stateAudit:stateAudit,missionMd:missionMd,quizStatsText:quizStatsText,glossaryR5:glossaryR5,faqR5:faqR5,triviaR5:triviaR5,quizCheck01:quizCheck01}});
