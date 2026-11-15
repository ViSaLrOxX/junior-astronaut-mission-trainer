/* RIM CAMP: KEEP THE LIGHT ON - story layer for the Junior Astronaut Mission Trainer.
   FICTION: the crew, the storm and the Earth message windows are invented game content.
   Real facts live only in the Sources panel. Loaded after app.js; reads state through window.__S(). */
(function(){
"use strict";
var $=function(id){return document.getElementById(id)};
var CREW=["Ana","Mei","Ravi","Kofi"],ROLE=["engineer","plants","samples","medic"];
var DONE_KEY="story";
function S(){return window.__S?window.__S():null}
function esc(t){return String(t).replace(/[&<>]/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;"}[c]})}
function alive(s){return s.crew.filter(function(c){return c.health>0})}
function chapter(sol){return sol<6?1:sol<16?2:sol<21?3:4}
var CH=["","Chapter 1: Build the camp","Chapter 2: The warning","Chapter 3: The storm","Chapter 4: The handover"];

/* ---------- overlay ---------- */
var ov=document.createElement("div");ov.id="stOv";ov.hidden=true;ov.setAttribute("role","dialog");ov.setAttribute("aria-modal","true");
ov.innerHTML='<div id="stCard"></div>';document.body.appendChild(ov);
var warn=document.createElement("div");warn.id="stWarn";warn.hidden=true;warn.setAttribute("role","status");document.body.appendChild(warn);
var queue=[],open=false;
function say(card){queue.push(card);if(!open){next()}}
function next(){
var c=queue.shift();if(!c){ov.hidden=true;open=false;return}
open=true;ov.hidden=false;
var ab=$("autoBtn");if(ab&&/on/i.test(ab.textContent)){ab.click()}
var h='<div class="who">'+esc(c.who||"")+'</div><h3>'+esc(c.title)+'</h3>';
(c.text||[]).forEach(function(p){h+="<p>"+p+"</p>"});
if(c.rule){h+='<div class="rule">'+c.rule+'</div>'}
var box=document.createElement("div");
var card=$("stCard");card.innerHTML=h;card.appendChild(box);
(c.options||[{label:"Continue"}]).forEach(function(o){
var b=document.createElement("button");b.type="button";
b.innerHTML="<b>"+esc(o.label)+"</b>"+(o.sub?"<small>"+esc(o.sub)+"</small>":"");
if(o.disabled){b.disabled=true;b.style.opacity=".55"}
b.onclick=function(){if(o.fn){o.fn()}var s=S();if(s&&o.log){choose(s,o.log)}next();refresh()};
box.appendChild(b)});
var f=card.querySelector("button:not([disabled])");if(f){f.focus()}
card.scrollTop=0}
function choose(s,txt){s.story.choices.push({sol:s.sol,text:txt})}
function toast(s,m){var w=$("stWarn");w.textContent=m;w.hidden=false;clearTimeout(toast.t);toast.t=setTimeout(function(){w.hidden=true},6500)}
function log(s,m){s.log.unshift({sol:s.sol,msg:m});if(s.log.length>60){s.log.length=60}}


/* ---------- decision-linked learning checks (replace trivia in story mode) ---------- */
function ask(s,q){
s.story.learn=s.story.learn||[];
var opts=q.options.map(function(o,i){return{label:o.t,fn:function(){
var ok=!!o.ok;s.story.learn.push({id:q.id,ok:ok});
say({who:ok?"Kofi: that's right":"Kofi: not quite",title:ok?"Good thinking":"Here is what happened",text:[ok?q.right:q.wrong,q.fact],options:[{label:"Continue",fn:q.after}]})}}});
say({who:"Learning check",title:q.title,text:[q.text],options:opts})}
function realRecord(s,then){
var d=window.DONKI_SAVED;if(!d){then();return}
ask(s,{id:"record",title:"Saved real record: time between two events",
text:"<b>Saved copy of NASA DONKI data, not live.</b> In May 2024 the Sun threw out a cloud of charged gas, called a CME. DONKI logged one on 8 May at 05:36 UTC. Later, a big storm shook Earth's magnetic field. DONKI logged its start on 10 May at 15:00 UTC. How much time passed between those two records?",
options:[{t:"About 57 hours (a bit over two days)",ok:true},{t:"About 5 minutes"},{t:"About three weeks"}],
right:"Yes, about 57 hours. That is the time between the two records. It is not a warning time that astronauts would have had.",
wrong:"It was about 57 hours, from 05:36 UTC on 8 May to 15:00 UTC on 10 May. That is the time between the two records, not a warning time for astronauts.",
fact:"<span style=\"color:#a9bddb\">These records were seen from Earth. Our Moon storm is made up for the game, and Earth's storm scale is not a Moon hazard measure.</span>",
after:then})}
function shieldQ(s,k){
var lv=s.shieldLevel,loss=Math.max(0,6-2*lv);
ask(s,{id:"shield",title:"Why did your shielding choice matter?",
text:"The storm is over. Your shield level was "+lv+". "+(lv?"The storm cost you "+loss+" parts per turn instead of 6.":"You had no shielding, so each storm turn cost 6 parts and hurt the crew."),
options:[{t:"Shielding blocks some radiation, so less reaches people and equipment",ok:true},{t:"Shielding makes a storm end sooner"},{t:"Shielding produces extra power"}],
right:"Right. Shielding and shelter reduce how much radiation reaches people and equipment.",
wrong:"Shielding does not shorten a storm or make power. It reduces how much radiation reaches people and equipment.",
fact:"<span style=\"color:#a9bddb\">Game rule: each shield level saved 2 parts per storm turn. That number is invented for the game.</span>",
after:function(){costQ(s,k)}})}
function costQ(s,k){
var ig=s.story.ignored;
ask(s,{id:"cost",title:"What did keeping the light on cost?",
text:"Look at your choices so far. "+(ig?"You chose research over shielding when the alert came, and paid for it during the storm.":"You spent materials on protection before the storm hit.")+" Which statement fits best?",
options:[{t:"Spending on safety early costs science now, but protects the crew and saves parts later",ok:true},{t:"Safety spending never costs anything"},{t:"Science always matters more than the crew"}],
right:"Yes. Every choice used up time or materials. Planning means deciding what matters most.",
wrong:"Every choice used up time or materials. Safety spending trades some science now for protection and fewer losses later.",
fact:"",after:k})}
function lastQ(s,done){
var e=s.story.ending;
var tips={thriving:"You prepared early and kept the crew healthy. Keep doing that.",hardwon:"You reached the target with a tired crew. Earlier shielding or more rest would help.",safe:"The crew was safe but science fell short. Add labs earlier and watch the science rate.",difficult:"Supplies ran out. Watch the runway warnings and build water, air and power before science."};
ask(s,{id:"diff",title:"What would you do differently?",text:"Pick the change you think matters most.",
options:[{t:"Prepare for the storm earlier",ok:true},{t:"Watch Ana's runway warnings",ok:true},{t:"Build science earlier",ok:true},{t:"Keep more spare parts",ok:true}],
right:"Good choice. For your mission: "+tips[e],wrong:"",fact:"",after:done})}

/* ---------- story cards ---------- */
function mk(s){return{
intro:function(){say({who:"Mission Control, Earth",title:"RIM CAMP: KEEP THE LIGHT ON",text:[
"A small crew has landed on a crater rim near the Moon's south pole. Four people, one habitat, thirty turns.",
"<b>Ana</b> (engineer) keeps the power on. <b>Mei</b> (plants) has brought a tray of seedlings. <b>Ravi</b> (samples) wants science. <b>Kofi</b> (medic) watches everyone's health.",
"Ana's rule: <i>\"Air, water, power first. Science second. The green light stays green.\"</i> The light on the habitat turns amber or red when something is running short.",
"Your target: "+s.objectiveScience+" science points by turn "+s.objectiveSols+", with the whole crew safe."],
rule:"<b>Suggested first builds:</b> Ice Extractor (water), Solar Array (power), O2 Generator (air), then Greenhouse, Science Labs and a Comms Dish. Check the status board each turn.<br>Game note: this is a fictional training mission. Each \"sol\" here is one game turn, not a real lunar day. The crew, the storm and the message windows are invented. See Sources for what is real.",
options:[{label:"Begin the mission",log:"Started the mission"}]})},
e2:function(){say({who:"Ana",title:CH[1]+": first decision",text:["\"We have a little time before the first night shift. Power or water first?\""],options:[
{label:"Power first",sub:"Solar output boosted for 3 turns.",log:"Power first (+solar boost 3 turns)",fn:function(){s.solarBoostSols=Math.max(s.solarBoostSols,3)}},
{label:"Water first",sub:"+15 water now.",log:"Water first (+15 water)",fn:function(){s.res.water+=15}}]})},
e6:function(){say({who:"Mission Control (scheduled message window)",title:"Message from Earth",text:["\"Good progress. Keep your supplies above a five-turn runway. We will check in again in a few turns. Expect more questions about the weather.\""],
rule:"Training-game rule: Earth advice arrives in scheduled windows (turns 6, 14 and 26) so you must plan between messages. This is NOT a claim about real Moon messages, which travel in seconds.",
options:[{label:"Copy that",log:"Read the first Earth message"}]})},
e9:function(){var can=s.res.parts>=10;say({who:"Ravi",title:"Ravi's sample",text:["\"I found a layered rock. If I can borrow some parts to build a better coring rig, we get a real result. But parts are what Ana uses for repairs.\""],options:[
{label:"Build the coring rig",sub:can?"Spend 10 parts, gain 20 science.":"Needs 10 parts (you have "+Math.floor(s.res.parts)+").",disabled:!can,log:"Built Ravi's rig (-10 parts, +20 science)",fn:function(){s.res.parts-=10;s.res.science+=20;s.totals.science+=20}},
{label:"Keep the parts for repairs",sub:"No change. Ana nods.",log:"Kept parts for repairs"}]})},
e12:function(){realRecord(s,function(){mk(s).e12b()})},
e12b:function(){
var big=s.res.parts>=12&&s.res.regolith>=20,small=s.res.parts>=5&&s.res.regolith>=8;
s.story.alertSol=s.sol;
say({who:"Ana",title:CH[2]+": storm alert",text:[
"\"Mission Control's forecast model shows a solar storm reaching us around turn 16. The storm is part of this game, so the timing is a game rule. Shielding wall or more science? I'd wall.\"",
"<b>Real data note:</b> NASA's DONKI database records real space weather seen from Earth, including a busy spell in May 2024. The storm in this story, its timing and its costs are made up for the game."],
options:[
{label:"Build the shield wall",sub:big?"Spend 12 parts and 20 regolith. Shield level +3.":(small?"Not enough for the full wall. Needs 12 parts and 20 regolith.":"Not enough resources."),disabled:!big,log:"Built the shield wall (-12 parts, -20 regolith, shield +3)",fn:function(){s.res.parts-=12;s.res.regolith-=20;s.shieldLevel+=3;s.story.walled=true}},
{label:"Build a smaller berm",sub:small?"Spend 5 parts and 8 regolith. Shield level +1.":"Needs 5 parts and 8 regolith.",disabled:!small||big&&false,log:"Built a small berm (-5 parts, -8 regolith, shield +1)",fn:function(){s.res.parts-=5;s.res.regolith-=8;s.shieldLevel+=1}},
{label:"Keep researching",sub:"+6 science now. The storm will cost you later.",log:"Ignored the storm alert for +6 science",fn:function(){s.res.science+=6;s.totals.science+=6;s.story.ignored=true}}]})},
e14:function(){say({who:"Mission Control (scheduled message window)",title:"Message from Earth",text:["\"We see the storm forecast too. Whatever you decide, keep the crew inside when it arrives. Kofi, check everyone's sleep. Mei says the seedlings look fine.\""],
rule:"Training-game rule: scheduled message window, not real Moon delay.",options:[{label:"Copy that",log:"Read the second Earth message"}]})},
e16:function(){
s.story.storm=true;
say({who:"Ana",title:CH[3]+": the storm arrives",text:["\"It's here. Four turns of it. What is the plan?\"",
"Shield level "+s.shieldLevel+": the storm costs about "+Math.max(0,6-2*s.shieldLevel)+" parts per turn"+(s.shieldLevel===0?" and the crew will be hurt even inside":"")+"."],options:[
{label:"Everyone shelters",sub:"No science during the storm. +2 morale per turn.",log:"Full shelter for the whole storm",fn:function(){s.story.plan="shelter"}},
{label:"Shelter-run: one emergency experiment",sub:"+4 science, -6 parts, -3 morale. Ravi works in short shifts, Kofi watches the clock.",log:"Ran an emergency experiment (+4 science, -6 parts, -3 morale)",fn:function(){s.story.plan="run";s.res.science+=4;s.totals.science+=4;s.res.parts=Math.max(0,s.res.parts-6);s.crew.forEach(function(c){c.morale=Math.max(0,c.morale-3)})}}]})},
e20:function(){shieldQ(s,function(){mk(s).e20b()})},
e20b:function(){
var low=s.res.parts<25;
say({who:"Kofi",title:"The storm has passed",text:["\"Everyone is accounted for. Check the habitat before we go out.\""].concat(low?["Parts are low ("+Math.floor(s.res.parts)+"). Ana wants to know where to find more."]:[]),options:low?[
{label:"Salvage a spare lab panel",sub:"+15 parts, -8 science.",log:"Salvaged a lab panel (+15 parts, -8 science)",fn:function(){s.res.parts+=15;s.res.science=Math.max(0,s.res.science-8)}},
{label:"Ask Earth for resupply guidance",sub:"+8 parts, -8 water (crew rations tighten).",log:"Rationed water for +8 parts",fn:function(){s.res.parts+=8;s.res.water=Math.max(0,s.res.water-8)}},
{label:"Carry on",sub:"No change.",log:"Carried on without extra parts"}]:[{label:"Good",log:"Came through the storm in good shape"}]})},
e21:function(){say({who:"Ana",title:CH[4]+": repair, grow, hand over",text:["\"Let's fix what the storm broke. Then Mei has something to show us.\""],options:[
{label:"Repair damaged modules",sub:"Uses a few parts per damaged module.",log:"Repaired damaged modules",fn:function(){try{TrainerEngine.repairAll(s)}catch(e){}}},
{label:"Skip repairs, keep working",sub:"Keeps parts. Damaged modules stay damaged.",log:"Skipped repairs"}]})},
e22:function(){say({who:"Mei",title:"The first leaf",text:["\"Look. A leaf. In the green light.\" The whole crew crowds round the seedling tray. Morale climbs."],options:[{label:"Watch it grow",log:"Mei's first leaf",fn:function(){s.crew.forEach(function(c){c.morale=Math.min(100,c.morale+6)});s.story.leaf=true}}]})},
e26:function(){say({who:"Mission Control (scheduled message window)",title:"Final message from Earth",text:["\"A new crew arrives soon. Leave the habitat in good shape, brief them on the light, and look after each other until then.\""],
rule:"Training-game rule: scheduled message window.",options:[{label:"Copy that",log:"Read the final Earth message"}]})}
}}
var SCHEDULE=[[0,"intro"],[2,"e2"],[6,"e6"],[9,"e9"],[12,"e12"],[14,"e14"],[16,"e16"],[20,"e20"],[21,"e21"],[22,"e22"],[26,"e26"]];

/* ---------- per-sol rules ---------- */
function perSol(s,sol){
var st=s.story;
if(st.storm&&sol>=16&&sol<=19){
var loss=Math.max(0,6-2*s.shieldLevel);s.res.parts=Math.max(0,s.res.parts-loss);
if(s.shieldLevel===0){s.crew.forEach(function(c){c.health=Math.max(25,c.health-4)})}
if(st.plan==="shelter"){s.crew.forEach(function(c){c.morale=Math.min(100,c.morale+2)})}
log(s,"Storm, turn "+(sol-15)+" of 4: "+(loss?loss+" parts lost. ":"shield held. ")+(st.plan==="shelter"?"Crew sheltering.":"Experiment shift running."));
if(sol===19){st.storm=false;log(s,"The storm passes. The crew is safe.")}}
/* early warnings from observed drain */
var p=st.prev;
if(p){["o2","water","food"].forEach(function(k){
var d=p[k]-s.res[k];
if(d>0&&s.res[k]/d<=5&&sol-(st.warned[k]||-9)>=5&&s.res[k]>0){
st.warned[k]=sol;var runway=Math.max(1,Math.floor(s.res[k]/d));
st.warns.push({sol:sol,res:k,runway:runway});
var nm={o2:"Oxygen",water:"Water",food:"Food"}[k];
log(s,"Ana: "+nm+" runway about "+runway+" turns at this rate.");
toast(s,"Ana: "+nm+" will run out in about "+runway+" turns at this rate.")}})}
st.prev={o2:s.res.o2,water:s.res.water,food:s.res.food};
s.crew.forEach(function(c){if(c.health<20){c.health=20}})}

function afterTick(s){
var st=s.story;
if(st.ending){return}
var dry=s.res.o2<=0||s.res.water<=0||s.res.food<=0;
if(!s.over&&dry){
s.over=true;s.won=false;s.crew.forEach(function(c){c.health=Math.max(30,c.health)});
st.ending="difficult";log(s,"Supplies ran out. Mission Control orders an early evacuation. Everyone is safe.");return}
if(!s.over&&s.sol>=30&&s.objectiveSols>30){
s.objectiveSols=30;s.over=true;s.won=false;st.ending="safe";log(s,"Turn 30: science short of target. The crew returns home safely.");return}
if(s.over){
s.crew.forEach(function(c){if(c.health<30){c.health=30}});
if(s.won){st.ending=alive(s).every(function(c){return c.health>=50})?"thriving":"hardwon"}
else{st.ending=dry?"difficult":"safe"}}}

function schedule(s){
var st=s.story,m=mk(s);
SCHEDULE.forEach(function(e){
if(s.sol>=e[0]&&!st.done[e[1]]&&!s.over){
st.done[e[1]]=1;
if(e[1]==="e2"&&s.sol>6){return}
if(e[1]==="e9"&&s.sol>14){return}
if(e[1]==="e16"&&s.sol>19){st.plan="shelter";return}
m[e[1]]()}})}

function revealUnlocks(s){
var tourOn=$("tour")&&!$("tour").hidden;
var lock={research:3,outpost:5,expeditions:8,ops:12};
document.querySelectorAll(".wbCard").forEach(function(b){
var f=b.dataset.feat,need=lock[f];
var hide=!!(s&&s.story&&!s.over&&need&&s.sol<need&&!tourOn&&s.difficulty!=="commander");
b.classList.toggle("stHide",hide)});
if(s&&s.story){var ch=chapter(s.sol);var cl=$("stChap");if(cl){cl.textContent=CH[ch]}}}

/* ---------- outpost scene ---------- */
function runway(s){var p=s.story.prev,min=99;if(!p){return 99}
["o2","water","food"].forEach(function(k){var d=(s.story.prev0||p)[k]-s.res[k];if(d>0){min=Math.min(min,s.res[k]/d)}});return min}
var lastSig="";
function scene(s){
var box=$("stScene");if(!box){return}
if(!s||!s.story){box.hidden=true;return}
box.hidden=false;
var cnt=function(t){return s.buildings.filter(function(b){return b.type===t&&b.done}).length};
var low=Math.min(s.res.o2,s.res.water,s.res.food);
var hurt=s.crew.some(function(c){return c.health<40});
var light="green";
if(s.res.o2<10||s.res.water<10||s.res.food<8||hurt){light="red"}
else if(s.story.storm||s.res.o2<25||s.res.water<25||s.res.food<20||s.story.warns.length&&s.sol-s.story.warns[s.story.warns.length-1].sol<3){light="amber"}
var sig=[s.sol,light,s.shieldLevel,s.buildings.length,s.story.storm,s.crew.map(function(c){return Math.round(c.health/20)}).join("")].join("|")+cnt("solar")+cnt("habitat")+cnt("lab")+cnt("greenhouse");
if(sig===lastSig){return}lastSig=sig;
var col={green:"#38e08a",amber:"#ffcf6b",red:"#ff6b6b"}[light];
var g='<svg viewBox="0 0 600 170" preserveAspectRatio="xMidYMax slice" role="img" aria-label="Outpost scene: habitat light is '+light+', shield level '+s.shieldLevel+', '+cnt("solar")+' solar arrays">';
g+='<defs><linearGradient id="stSk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#05080f"/><stop offset="1" stop-color="#0f1830"/></linearGradient><radialGradient id="stGl"><stop offset="0" stop-color="'+col+'" stop-opacity=".7"/><stop offset="1" stop-color="'+col+'" stop-opacity="0"/></radialGradient></defs>';
g+='<rect width="600" height="170" fill="url(#stSk)"/>';
for(var i=0;i<30;i++){g+='<circle cx="'+((i*97)%600)+'" cy="'+((i*53)%95)+'" r="'+(i%4?0.8:1.4)+'" fill="#cfe0ff" opacity=".7"/>'}
g+='<circle cx="520" cy="38" r="14" fill="#4d9bff" opacity=".85"/><circle cx="526" cy="34" r="14" fill="#05080f" opacity=".0"/>';
g+='<path d="M0 135 Q150 118 300 130 T600 124 V170 H0Z" fill="#6c7380"/><path d="M0 150 Q200 138 380 148 T600 146 V170 H0Z" fill="#555c68"/>';
/* shield dome */
if(s.shieldLevel>0){g+='<path d="M200 132 A110 80 0 0 1 420 132" fill="none" stroke="#6fd3ff" stroke-width="'+Math.min(5,1+s.shieldLevel)+'" opacity="'+Math.min(.85,.25+s.shieldLevel*.15)+'" stroke-dasharray="'+(s.shieldLevel>=3?'0':'6 5')+'"/>'}
/* habitat */
var hx=270;
g+='<circle cx="'+(hx+30)+'" cy="112" r="46" fill="url(#stGl)"/>';
g+='<path d="M'+hx+' 132 A30 30 0 0 1 '+(hx+60)+' 132Z" fill="#aab4c4" stroke="#e8f2ff"/>';
g+='<rect x="'+(hx+24)+'" y="108" width="12" height="9" fill="'+col+'"><title>Habitat light: '+light+'</title></rect>';
for(var h=1;h<cnt("habitat");h++){g+='<path d="M'+(hx+66+(h-1)*40)+' 132 A18 18 0 0 1 '+(hx+102+(h-1)*40)+' 132Z" fill="#8f99aa" stroke="#e8f2ff"/>'}
/* solars */
for(var a=0;a<Math.min(6,cnt("solar"));a++){var sx=110+a*32;g+='<rect x="'+sx+'" y="116" width="26" height="9" fill="#2a4a8f" stroke="#8fb3ff" transform="skewX(-12)"/><line x1="'+(sx+11)+'" y1="125" x2="'+(sx+11)+'" y2="134" stroke="#8fb3ff" transform="skewX(-12)"/>'}
if(cnt("lab")){g+='<rect x="450" y="118" width="28" height="14" fill="#c8d0dd" stroke="#fff"/><circle cx="464" cy="118" r="5" fill="#6fd3ff"/>'}
if(cnt("greenhouse")){g+='<path d="M490 132 L496 114 H526 L532 132Z" fill="#2fa86a" opacity=".6" stroke="#9af0c0"/>'}
/* seedling */
var gr=Math.min(1,s.sol/24),sh=4+gr*22;
g+='<g transform="translate(250 134)"><line x1="0" y1="0" x2="0" y2="-'+sh+'" stroke="#38e08a" stroke-width="2"/>'+(gr>.25?'<ellipse cx="-5" cy="-'+(sh*.7)+'" rx="5" ry="2.5" fill="#38e08a"/>':'')+(gr>.55?'<ellipse cx="6" cy="-'+(sh*.9)+'" rx="5" ry="2.5" fill="#38e08a"/>':'')+'</g>';
/* crew */
alive(s).forEach(function(c,i){var cc=c.health>=70?"#e8f2ff":c.health>=40?"#ffcf6b":"#ff6b6b";g+='<circle cx="'+(180+i*16)+'" cy="138" r="4" fill="'+cc+'"><title>'+esc(c.name)+' health '+Math.round(c.health)+'</title></circle><rect x="'+(177+i*16)+'" y="142" width="6" height="7" fill="'+cc+'"/>'});
if(s.story.storm){for(var p=0;p<26;p++){g+='<line class="stPart" x1="'+(p*23)+'" y1="-10" x2="'+(p*23-14)+'" y2="14" stroke="#ffd9a0" stroke-width="1.2" opacity=".7" style="animation-delay:'+(-(p%7)*.3)+'s"/>'}}
g+='</svg><div class="cap"><b id="stChap"></b> &middot; Habitat light: <b style="color:'+col+'">'+light.toUpperCase()+'</b> &middot; Shield '+s.shieldLevel+' &middot; Crew '+alive(s).length+'/'+s.crew.length+(s.story.storm?' &middot; STORM (game)':'')+'</div>';
box.innerHTML=g}

/* ---------- ending ---------- */
var ENDS={
thriving:{t:"Ending: A thriving camp",x:"Everyone is healthy, the science target is met, and the green light is still on. Mei's seedling is taller than her hand."},
hardwon:{t:"Ending: Hard-won success",x:"You hit the science target and the crew is safe, though someone needs a few days with Kofi. The light is still on."},
safe:{t:"Ending: Safe return, short of the science target",x:"The new crew arrives and everyone goes home safe. The science fell short of the target, and the next crew will pick up your work."},
difficult:{t:"Ending: A difficult return",x:"Supplies ran out and Mission Control ordered an early evacuation. Everyone is safe. This was not the plan, and there is a lot to learn from it."}};
function debrief(s){
var st=s.story;st.debriefed=true;var e=ENDS[st.ending]||ENDS.safe;
var t=[e.x];
if(st.ending==="difficult"){
var w=st.warns.length?st.warns.map(function(x){return"turn "+x.sol+": "+({o2:"oxygen",water:"water",food:"food"}[x.res])+" runway about "+x.runway+" turns"}).join("; "):"none were shown";
t.push("<b>The missed warning:</b> Ana's early warnings ("+w+"). "+esc(TrainerEngine.postMortem(s).join(" ")));
if(st.ignored){t.push("You also skipped the shield wall when the storm alert came.")}}
else{t.push(esc(TrainerEngine.postMortem(s).join(" ")))}
var ch=st.choices.map(function(c){return"<li>Turn "+c.sol+": "+esc(c.text)+"</li>"}).join("");
t.push("<b>What you chose</b><ul style=\"margin:.3em 0;padding-left:1.2em\">"+ch+"</ul>");
var L=st.learn||[];if(L.length){t.push("<b>Learning checks:</b> "+L.filter(function(x){return x.ok}).length+" of "+L.length+" answered right. Wrong answers cost nothing, they just explain.")}
t.push("Final science "+Math.round(s.res.science)+" of "+s.objectiveScience+". Score "+TrainerEngine.score(s)+" (grade "+TrainerEngine.letterGrade(s)+").");
var ends=ENDS[st.ending];
say({who:"Mission debrief",title:e.t,text:t,rule:"<b>Real vs game rule.</b> Real: NASA DONKI is a real space weather database, and the May 2024 records are Earth-based. Game rules (made up): the storm, its timing, shelter costs, crew, message windows and all numbers. Open Sources for details.",options:[
{label:"Mission Control: \"Your mission wasn't to do everything. It was to decide what mattered, and take care of the people depending on you.\"",sub:"Close debrief, then one last question",fn:function(){lastQ(s,function(){})}},
{label:"Retry the mission",sub:"Start fresh from the setup screen.",fn:function(){location.reload()}}]})}

/* ---------- sources ---------- */
function sources(){
say({who:"Sources",title:"What is real and what is a game rule",text:[
"<b>Real, saved copy (fetched 15 Nov 2026, not live):</b> NASA DONKI (Space Weather Database Of Notifications, Knowledge, Information) recorded, for May 2024: "+(window.DONKI_SAVED?DONKI_SAVED.cmeCount8to9May+" CMEs (clouds of charged gas from the Sun) on 8 and 9 May, the first at 05:36 UTC on 8 May. It recorded "+DONKI_SAVED.sepTotal+" solar energetic particle events from 9 to 13 May. It recorded "+DONKI_SAVED.gstCountMay+" geomagnetic storms (shaking of Earth's magnetic field) in the month. The strongest began on 10 May at 15:00 UTC, about "+Math.round(DONKI_SAVED.hoursFirstCmeToStormStart)+" hours after that first CME was recorded. These are Earth-based records. They are not a Moon forecast.":"a real NASA database of space weather events.")+" The Rim Camp storm is fiction and uses none of these numbers.",
"<a href=\"https://ccmc.gsfc.nasa.gov/tools/DONKI/\" target=\"_blank\" rel=\"noopener\" style=\"color:#6fd3ff\">DONKI (NASA CCMC)</a> &middot; <a href=\"https://api.nasa.gov/\" target=\"_blank\" rel=\"noopener\" style=\"color:#6fd3ff\">NASA Open APIs</a>",
"<b>Game rules, invented:</b> the Rim Camp crew and story, the 30-turn mission, the storm at turns 16 to 19, parts and morale costs, shield effects, the scheduled Earth message windows, every resource number, and the engine's radiation and power model. They are simplified for teaching and are not mission advice. The numbers in the real record are not used as game numbers."],options:[{label:"Close"}]})}
function addUi(){
var f=document.createElement("div");f.style.cssText="text-align:center;padding:6px 0 14px;font-size:.85rem;color:#a9bddb";
f.innerHTML='Story: RIM CAMP (fictional) &middot; <button id="stSrc" type="button">Sources &amp; what is real</button>';
document.body.appendChild(f);$("stSrc").onclick=sources;
var gm=$("game");if(gm){var nt=document.createElement("div");nt.id="stNotes";gm.insertBefore(nt,gm.firstChild);var tt=$("toast");if(tt){nt.appendChild(tt)}nt.appendChild($("stWarn"))}
var sp=$("statusPanel");if(sp){var sc=document.createElement("div");sc.id="stScene";sc.hidden=true;sp.insertBefore(sc,sp.firstChild)}
var su=$("setup");if(su){var n=document.createElement("p");n.className="hint";n.id="stNote";n.innerHTML="<b>Story mode:</b> Moon + Science objective + no scenario + Explorer or Cadet starts the fictional RIM CAMP story. Anything else is plain sandbox.";su.appendChild(n)}
var style=document.createElement("style");style.textContent="@keyframes stFall{from{transform:translate(0,0)}to{transform:translate(-30px,170px)}}.stPart{animation:stFall 1.1s linear infinite}@media (prefers-reduced-motion:reduce){.stPart{animation:none}}";document.head.appendChild(style)}

/* ---------- wiring ---------- */
function begin(){
var s=S();if(!s||s.story){return}
var on=s.site==="moon"&&!s.scenario&&s.objectiveMode==="science"&&s.difficulty!=="commander";
if(!on){return}
s.story={v:1,lastSol:0,done:{},choices:[],warns:[],warned:{},learn:[],prev:null,storm:false,plan:null,ending:null,debriefed:false};
s.crew.forEach(function(c,i){if(CREW[i]){c.name=CREW[i];c.role=c.role}});
s.quizDue=-1;s.res.water+=70;s.res.food+=30;s.res.o2+=25;s.res.parts+=30;
s.story.prev={o2:s.res.o2,water:s.res.water,food:s.res.food};
log(s,"Mission Control pre-positioned extra supplies for this training mission.");
log(s,"RIM CAMP: KEEP THE LIGHT ON (fictional story). Crew: Ana, Mei, Ravi, Kofi.");
schedule(s);refresh()}
var busy=false;
function refresh(){
var s=S();document.body.classList.toggle("storyOn",!!(s&&s.story));
revealUnlocks(s&&s.story?s:null);scene(s&&s.story?s:null);
if(!s||!s.story){return}
if(s.story.ending&&s.over){
var eb=$("endBanner");if(eb){eb.hidden=false;var e=ENDS[s.story.ending];eb.className=(s.story.ending==="thriving"||s.story.ending==="hardwon")?"win":"lose";eb.innerHTML=esc(e.t)+" - "+esc(e.x)}
var sb=$("solBtn");if(sb){sb.disabled=true}}}
function check(){
var s=S();if(!s||!s.story||busy){return}
busy=true;
try{
var st=s.story;
if(s.sol<st.lastSol){return}
while(st.lastSol<s.sol){st.lastSol++;perSol(s,st.lastSol)}
afterTick(s);
if(!st.ending||!s.over){schedule(s)}
if(st.ending&&s.over&&!st.debriefed){debrief(s)}
}finally{busy=false}
refresh()}
function init(){
addUi();
$("startBtn").addEventListener("click",function(){setTimeout(function(){begin();check()},0)});
var lb=$("loadBtn");if(lb){lb.addEventListener("click",function(){setTimeout(function(){var s=S();if(s&&s.story){s.story.prev=s.story.prev||{o2:s.res.o2,water:s.res.water,food:s.res.food};refresh()}},0)})}
$("solBtn").addEventListener("click",function(){setTimeout(check,0)});
setInterval(check,400);
window.__story={check:check,sources:sources,state:function(){var s=S();return s&&s.story}}}
if(document.readyState==="loading"){document.addEventListener("DOMContentLoaded",init)}else{init()}
})();
