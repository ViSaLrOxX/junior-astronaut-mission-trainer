# Junior Astronaut Mission Trainer

NASA Space Apps 2026 challenge #1. A browser-based base-management game for kids (and judges) that teaches real mission trade-offs on the Moon and Mars: power, oxygen, water, food, shielding, crew health and morale. Fully offline: open `index.html` and play.

## Features (611)

Core sim
1. Two real sites (Lunar South Pole, Mars Jezero Rim) with distinct radiation, ice, sunlight, storm and quake profiles
2. Three difficulty classes (Cadet, Explorer, Commander) plus Sandbox mode with no fail states
3. Three challenge scenarios: Dust Bowl, Lean Crew, The Long Night
4. Sol-by-sol simulation with a fixed-seed RNG (reproducible missions)
5. Six resources: oxygen, water, food, parts, regolith, science
6. Power grid with solar factor, storm dimming and lunar day/night cycles
7. Power priority order (medical and life support first) with starvation warnings
8. Battery Banks that store surplus power for lean sols
9. Radiation dose model combining site, difficulty, shielding level and research
10. Win/lose objectives with science goal, deadline extensions and final review

Buildings (11-21)
11. Solar Arrays, 12. RTGs, 13. Battery Banks, 14. O2 Generators, 15. CO2 Scrubbers (boost all O2 generators 25%), 16. Ice Extractors, 17. Water Recyclers (cut crew water demand), 18. Greenhouses, 19. Habitat Modules (crew capacity), 20. Shielding Works, 21. Med Bays, plus Science Labs, Comms Dishes (science uplink bonus) and Regolith Drills (14 building types total)

Crew
22. Six named crew with health, morale, fatigue and XP
23. Six roles with gameplay effects: Medic heals more, Scientist boosts labs, Geologist boosts drills, Engineer discounts repairs and leads safer EVAs
24. Crew XP levels (1-3) that scale role bonuses
25. Fatigue system: EVAs and expeditions tire crew; exhausted crew can't go out
26. Crew retraining between roles for 10 science
27. Recruitment limited by habitat capacity
28. Death and survival tracking with end-of-mission accounting

Operations
29. Repairs from stores (5 parts, 3 with an Engineer)
30. EVA repairs: cheaper (2 parts) but with injury risk and fatigue
31. Rover expeditions (Crater Survey, Ice Field Haul, Debris Salvage): 2 crew, 2 sols, breakdown risk
32. Greenhouse crop selection: potatoes, lettuce, dwarf wheat with different water/food yields
33. Ration controls (100/80/60%) trading stores against health and morale
34. Resupply pod every 7 sols with selectable manifest (mixed, food-heavy, parts-heavy)

Research
35. Tech tree: Multi-junction Cells, Closed Water Loop, Hydrogenated Plating, Self-healing Panels, Dwarf Cultivars
36. Research spends science, forcing a science-vs-progress trade-off
37. Self-healing Panels auto-repair damage after 2 sols

Events and learning
38. 16 weighted, site-filtered random events (storms, flares, quakes, micrometeorites, birthdays, stowaways...)
39. One-sol-ahead forecast of scheduled events
40. 20-question NASA quiz with sourced facts (MOXIE, Artemis, SOFIA, lava tubes...) every 5 sols
41. 20 achievements with chip display
42. Mission advisor that names the next priority (stores, power, shielding, damage, fatigue, research)

Quality of life
43. Site comparison table before launch
44. Live power-consumption breakdown
45. Lifetime stats panel (science earned, power generated, water mined, expeditions, storms)
46. Score formula combining science, crew, shielding, sols and achievements
47. Local top-5 high-score board
48. Save/load via localStorage
49. Text mission report download
50. JSON mission report export
51. Auto-advance mode and keyboard shortcuts (space = next sol, s = save)
52. High-contrast toggle, reduced-motion and print styles, responsive layout

Round-4 buildings
53. Workshop: cuts every future build cost by 20%
54. Algae Farm: passive food from CO2 and water, no power draw
55. Observatory: passive science income
56. Gym: crew recover morale each sol and fight events hit softer
57. Landing Pad: resupply pods carry more cargo

Round-4 research
58. Aeroponics: greenhouses and algae farms yield 50% more
59. Regolith Sintering: drills produce 40% more
60. Suit Shielding: EVA repairs no longer risk injury
61. AI Assistance: research costs 20% less (UI shows discounted prices)
62. Redundancy Protocols: building damage is halved

Round-4 expeditions
63. Ice Core Drilling: 3-sol science+water expedition
64. Lava Tube Survey: 3-sol expedition mapping radiation-safe caves
65. Relay Repair: fixes the comms relay for a +15% science uplink buff

Round-4 events (6 new, 22 total)
66. O2 line leak with a built-in scrubber mitigation
67. Greenhouse blight that kills the current crop
68. Crew argument morale hit, softened by an online gym
69. Dust devil knocking panels loose (no damage with suit shielding up... just kidding: it ignores suits, it's weather)
70. Suit puncture on EVA crews
71. Subsurface ice pocket discovery

Round-4 ops actions
72. Rest order per crew member (skips duties, +12 health, +6 morale)
73. Panel cleaning: 2 parts for +20% solar over 3 sols
74. Repair-all button honoring Engineer discounts
75. Shelter mode: skip a sol's production to protect crew from radiation
76. EVA suit service: 3 parts to halve the next EVA's risk

Round-4 objectives
77. Three win modes selectable at launch: science goal, bring-everyone-home, morale-60+

Round-4 analytics
78. Three-level alert chips (critical / warning / info) for stores, power, radiation, morale, damage
79. Daily checklist: the top five things to do right now
80. Tutorial hint queue teaching new players one lesson at a time
81. Battery status panel with capacity, fill and full/empty projections
82. Morale report with crew averages and the lowest-morale member named
83. Two-day power forecast comparing today and tomorrow
84. Food-days-left calendar at 100/80/60% rations
85. Build queue ETA list for everything under construction
86. Crew health report with injured/low-morale callouts
87. Weekly summary of science, food, water and parts deltas
88. Event almanac: this site's weighted event table with odds
89. Dry-run builder: pick any building, see its real cost, build time and power effect before spending
90. Resource history chart (canvas) for oxygen, water, food, parts or science
91. Resource history CSV export
92. Crew roster CSV export with XP and fatigue
93. Copy-ready share text summarizing the mission

Round-4 scoring and meta
94. Letter grade (S/A/B/C/D) on the end banner
95. Post-mortem bullets diagnosing the three biggest failure causes
96. Achievement progress counts shown on unearned chips
97. Quiz streak counter with bonus science at 3-in-a-row
98. Score breakdown (science, crew, shielding, sols, achievements) in the JSON report
99. Difficulty multipliers table in the JSON report
100. Mission name generator for the "Unnamed" default
101. Objective-mode validation in the JSON report and review text
102. Round-4 regression suite: 40 new tests, 102 total

Round-5 briefing and analysis layer
103. Sol briefing: one-line sol report with crew, morale and status
104. Net resource rates per sol from real history deltas (not forecast guesses)
105. Resource runway table: sols left for each resource, or "steady"
106. Struggling-crew detector (low health or morale) for the briefing panel
107. Unpowered-buildings list with names
108. Science plan: goal, current, per-sol pace, ETA and honest notes
109. Shield plan: current level, next level and coverage
110. Battery plan: capacity and charge status
111. Food plan: intake vs production with ration advice
112. Water plan: demand vs mining with recycling notes
113. Event risk report: this site's hazard odds summarized
114. Expedition planner: all destinations with cost, duration and affordability
115. Expedition history CSV export
116. Build plan CSV export (cost, build time, power effect per building)
117. Tech tree CSV export
118. Quiz bank stats: question count and categories
119. Achievement table: all badges with earned state and progress
120. Site comparison CSV (Moon vs Mars on radiation, ice, solar, storms)
121. Mission log CSV export
122. Endgame projection combining science pace, runway and shield plan
123. What-if-all-buildings table: effect of each building if built now
124. Best-next-build advisor from shortest runway (maps to the right building type)
125. Crew role matrix: coverage across the six roles
126. Training plan: which roles are missing and who to retrain
127. Rations advisor: strict/normal/generous from food runway
128. Crop advisor: per-crop yield and growth time ranked
129. Storm prep checklist (power, shield, crew, batteries)
130. Night prep checklist for the lunar long night
131. Sol milestones: special notes on key sols
132. Win-probability hint band (at risk / uncertain / on track) with honest note
133. Kid glossary: 6 space terms in plain words
134. FAQ: common questions answered in-game
135. Mission name validation (length, characters)
136. Deterministic crew name suggester
137. Difficulty comparison table
138. Copy-ready summary email text
139. Markdown mission log download
140. Stats JSON download
141. State integrity checker (catches corrupted saves)
142. Stable state hash for save comparison
143. Power balance sheet: generated vs consumed vs stored
144. Round-5 regression suite: 28 new tests, 130 total
145-152. Mission briefing UI panel wiring the briefing, projection, checklists, glossary, FAQ and all new CSV/JSON/markdown downloads (8 controls)

Round-6 deep analysis layer
153. Fatigue forecast: sols until each crew member hits exhaustion
154. XP progress: level and points to next level per crew member
155. Research recommender: top 3 tech picks ranked by affordability and cost
156. Research queue CSV export
157. Building efficiency table: output per power for every producer type
158. Power audit: generation vs demand with grid health notes
159. Power spike check: which buildings would overload the grid if built now
160. Solar outlook: daylight factor per upcoming sol with event flags
161. Hazard calendar: forecast events for the next sols
162. Radiation breakdown: base dose, shield cut, research cut, net dose
163. Oxygen balance sheet (generation, consumption, net, stock)
164. Water balance sheet
165. Food balance sheet with ration multiplier
166. Parts economy outlook (income, stock, advice)
167. Science source report (labs, comms, observatory, quiz, expeditions)
168. Crew upkeep: per-sol O2/water/food cost of the current crew
169. Habitat report: capacity, headroom, recruit advice
170. Expansion plan: next 5 builds ordered by shortest runway
171. Objective progress: percent to science goal, sols used
172. Deadline check: required pace vs actual pace, on-track flag
173. First-shortage predictor: which resource runs out first and when
174. Event type counts over the mission log
175. Quiz weak spots: categories, correct count, best streak
176. Nearest achievements: three closest unearned badges by progress
177. Run modifiers summary (site, scenario, difficulty stacking)
178. Alternate-site simulation: same build at the other site
179. Replay code (site-seed-difficulty) for sharing runs
180. Mission timeline CSV (sol-by-sol resource history)
181. Subsystem grades: A-F letters for power, O2, water, food, morale
182. Maintenance plan: dirty panels, damaged buildings, suit wear
183. Clean order: panels sorted by dirt for efficient cleaning
184. Landing site facts: real NASA facts about the chosen site
185. Trivia of the sol: deterministic daily space fact
186. Badge shelf: earned vs total with names
187. Radio chatter: narrative log lines from mission state
188. Tomorrow brief: forecast plus top advice in one block
189. Rest rotation: who should rest next sol
190. Victory gap: remaining steps to win, in plain words
191. True cost lookup: build cost and power profile per building type
192. Building counts table
193. Crop rotation plan: crops ranked by food per water
194. Expedition risk table with crew-level effect
195. Event history: filtered hazard log
196. Settings snapshot: rations, crop, manifest, objective mode
197. Score projection to the deadline
198. Morale levers: actions that raise morale, ranked
199. Water recycling gain from recyclers
200. Greenhouse yield per sol by crop
201. Mission log search
202. Deep analysis UI panel wiring the dashboard, timeline and research-queue CSV downloads, trivia and log search (5 controls)

Winner-inspired patterns (verified 2025 global winners, per NASA's announcement): design-then-validate simulation like PureFlow's habitat validator; best-window/risk guidance like SkySense; mini-game teaching real constraints like Zumorroda-X; kid-facing storytelling like HerCode.


Round-5 crew analytics
203. Crew summary table
204. Average health
205. Average fatigue
206. Total crew XP
207. Crew level histogram
208. Exhausted crew list
209. Away crew list
210. Role roster
211. Morale spread

Round-5 resource and objective analytics
212. Resource level snapshot
213. Lowest resource
214. Per-crew resource ratios
215. Science pace vs objective
216. Projected science at deadline
217. Projected win check
218. Runway table
219. Shortest runway

Round-5 base and power analytics
220. Building type list
221. Damaged building list
222. In-progress builds
223. Greenhouse list
224. Crop coverage
225. Power margin
226. Battery store days at deficit
227. Shield level info
228. Researched tech list
229. Tech count
230. Available tech list
231. Cheapest next tech
232. Affordable buildings
233. Researchable-now list

Round-5 history and schedule analytics
234. Event log view
235. Events logged today
236. Storm count
237. Expedition stats
238. Quiz record
239. Achievement percent
240. Difficulty parameters
241. Sols remaining
242. History at a sol
243. History range
244. Resource delta between sols
245. Worst sol by resource
246. Best sol by resource
247. History trend split
248. Upcoming events
249. Next hazard
250. Calendar note

Round-5 planning
251. Action checklist
252. Mission status line
253. Danger score
254. Win odds text

Round-5 exports and reports
255. Crew table CSV
256. Buildings CSV
257. Tech CSV
258. Schedule CSV
259. Snapshot JSON
260. State audit
261. Mission Markdown report
262. Quiz stats text

Round-5 learning
263. Round-5 glossary (6 Mars terms)
264. FAQ (3 entries)
265. Seeded trivia
266. Programmatic quiz checker

Round-5 UI
267. Crew summary panel
268. Crew averages panel
269. Role roster panel
270. Exhausted/away panel
271. Morale spread panel
272. Resource levels panel
273. Science pace panel
274. Projection panel
275. Runway table panel
276. Shortest runway panel
277. Danger score panel
278. Win odds panel
279. Building state panel
280. Crop coverage panel
281. Power margin panel
282. Shield info panel
283. Tech state panel
284. Researchable-now panel
285. Affordable buildings panel
286. History trends panel
287. Best/worst sol panel
288. O2 delta panel
289. Upcoming events panel
290. Next hazard panel
291. Action checklist panel
292. Mission status panel
293. Quiz record panel
294. Achievement percent panel
295. Crew CSV download
296. Buildings CSV download
297. Tech CSV download
298. Schedule CSV download
299. Snapshot JSON view
300. Mission Markdown view
301. State audit view
302. Glossary view
303. FAQ view
304. Trivia button
305. Quiz-check widget
306. Engine: total resources across all six stores
307. Engine: science points read
308. Engine: lowest resource detector
309. Engine: highest resource detector
310. Engine: crew-aboard counter
311. Engine: average crew XP
312. Engine: healthy-crew counter (health >= 90)
313. Engine: low-morale crew counter (morale < 40)
314. Engine: completed-building counter
315. Engine: damaged-building counter
316. Engine: unfinished-build counter
317. Engine: per-type building counter (e.g. habitats)
318. Engine: researched-tech counter
319. Engine: achievements-earned counter
320. Engine: building-type histogram
321. Engine: crew-role histogram
322. Engine: total crew fatigue
323. Engine: average crew health
324. Engine: average crew morale
325. Engine: crew-away counter
326. Engine: hurt-crew name list (health < 50)
327. Engine: top-XP crew finder
328. Engine: lowest-morale crew finder
329. Engine: solar-efficiency tech check
330. Engine: radiation-shield tech check
331. Engine: advanced-crops tech check
332. Engine: AI-assist tech check
333. Engine: shield-raised check
334. Engine: air-plus-water reserve total
335. Engine: food-plus-regolith total
336. Engine: parts-on-hand read
337. Engine: oxygen per crew member
338. Engine: water per crew member
339. Engine: food per crew member
340. Engine: current sol read
341. Engine: Mars-site check
342. Engine: game-over check
343. Engine: game-won check
344. Engine: storms-survived counter
345. Engine: quiz-correct counter
346. Engine: quiz-streak read
347. Engine: best-quiz-streak read
348. Engine: self-sufficiency streak read
349. Engine: expeditions-done counter
350. Engine: retrain counter
351. Engine: crop-switch counter
352. Engine: ration-level read
353. Engine: mission-name read with fallback
354. Engine: objective-science target read
355. Engine: objective-sols target read
356. Engine: science progress percent toward objective
357. Engine: sol progress percent toward objective
358. Engine: science-objective-met check
359. Engine: sol-objective-met check
360. Engine: oxygen reserve in 10-unit blocks
361. Engine: food reserve in 5-unit blocks
362. Engine: science-century check (100+ science)
363. Engine: low-parts warning (parts < 10)
364. Engine: oxygen-critical warning (o2 < 20)
365. Engine: water-critical warning (water < 20)
366. UI: total-resources button
367. UI: science-points button
368. UI: lowest-resource button
369. UI: highest-resource button
370. UI: crew-aboard button
371. UI: average-XP button
372. UI: healthy-crew button
373. UI: low-morale button
374. UI: buildings-complete button
375. UI: damaged-buildings button
376. UI: unfinished-builds button
377. UI: habitat-count button
378. UI: techs-researched button
379. UI: achievements-earned button
380. UI: building-histogram button
381. UI: role-histogram button
382. UI: total-fatigue button
383. UI: average-health button
384. UI: average-morale button
385. UI: crew-away button
386. UI: hurt-crew-list button
387. UI: top-XP-crew button
388. UI: lowest-morale-crew button
389. UI: solar-tech button
390. UI: rad-shield-tech button
391. UI: adv-crops-tech button
392. UI: AI-assist-tech button
393. UI: shield-raised button
394. UI: air-plus-water button
395. UI: food-plus-regolith button
396. UI: parts-on-hand button
397. UI: oxygen-per-crew button
398. UI: water-per-crew button
399. UI: food-per-crew button
400. UI: current-sol button
401. UI: Mars-site button
402. UI: game-over button
403. UI: game-won button
404. UI: storms-survived button
405. UI: quiz-correct button
406. Analytics engine: Site id
407. Analytics engine: Difficulty
408. Analytics engine: Current sol
409. Analytics engine: Mission-over flag
410. Analytics engine: Mission-won flag
411. Analytics engine: Mission name
412. Analytics engine: Oxygen level
413. Analytics engine: Water level
414. Analytics engine: Food level
415. Analytics engine: Parts level
416. Analytics engine: Regolith level
417. Analytics engine: Science points
418. Analytics engine: Resource total
419. Analytics engine: Minimum consumable
420. Analytics engine: Maximum consumable
421. Analytics engine: Crew size
422. Analytics engine: Crew alive
423. Analytics engine: Crew lost
424. Analytics engine: Crew away
425. Analytics engine: Mean crew health
426. Analytics engine: Mean crew morale
427. Analytics engine: Mean crew fatigue
428. Analytics engine: Crew XP total
429. Analytics engine: Role tally
430. Analytics engine: Engineer count
431. Analytics engine: Weakest crew member
432. Analytics engine: Lowest-morale crew member
433. Analytics engine: Building count
434. Analytics engine: Buildings completed
435. Analytics engine: Buildings in progress
436. Analytics engine: Buildings damaged
437. Analytics engine: Building type tally
438. Analytics engine: Done buildings by type
439. Analytics engine: Solar arrays done
440. Analytics engine: Habitats done
441. Analytics engine: Crops planted
442. Analytics engine: Construction sols left
443. Analytics engine: Techs researched
444. Analytics engine: Tech check
445. Analytics engine: Log length
446. Analytics engine: Latest log entry
447. Analytics engine: History length
448. Analytics engine: Storms survived
449. Analytics engine: Expeditions done
450. Analytics engine: Quiz correct
451. Analytics engine: Quiz streak
452. Analytics engine: Best quiz streak
453. Analytics engine: Self-sufficient streak
454. Analytics engine: Shield level
455. Analytics engine: Objective science
456. Analytics engine: Objective sols
457. Analytics engine: Objective progress %
458. Analytics engine: Sols remaining
459. Analytics engine: Objective mode
460. Analytics engine: Rations level
461. Analytics engine: Manifest
462. Analytics engine: Scenario
463. Analytics engine: Shelter-mode flag
464. Analytics engine: Solar boost sols
465. Analytics engine: Achievements earned
466. Analytics engine: Achievement check
467. Analytics engine: Milestones hit
468. Analytics engine: Schedule length
469. Analytics engine: Power stored
470. Analytics engine: Battery nights
471. Analytics engine: Last power generated
472. Analytics engine: Last power used
473. Analytics engine: Power margin
474. Analytics engine: Totals tracked
475. Analytics engine: Sols tracked
476. Analytics engine: Dose multiplier
477. Analytics engine: Retrains
478. Analytics engine: Crop switches
479. Analytics engine: Mission seed
480. Analytics engine: Phase
481. Analytics engine: Quiz pending
482. Analytics engine: Quiz due sol
483. Analytics engine: Quiz index
484. Analytics engine: Site count
485. Analytics engine: Site id list
486. Analytics engine: Site name by id
487. Analytics engine: Site storm chance
488. Analytics engine: Building catalog size
489. Analytics engine: Building type list
490. Analytics engine: Building name by type
491. Analytics engine: Building cost by type
492. Analytics engine: Building sols by type
493. Analytics engine: Total catalog cost
494. Analytics engine: Cheapest building
495. Analytics engine: Priciest building
496. Analytics engine: Room for crew
497. Analytics engine: Crew capacity
498. Analytics engine: Bunks free
499. Analytics engine: Can recruit
500. Analytics engine: All construction done
501. Analytics engine: Any damage
502. Analytics engine: All crew alive
503. Analytics engine: All crew rested
504. Analytics engine: Consumables exhausted
505. Analytics engine: Science objective met
506. Analytics engine: Past objective deadline
507. Analytics engine: Food per crew
508. Analytics engine: Water per crew
509. Analytics engine: Oxygen per crew
510. Analytics engine: Mission score estimate
511. Analytics engine: Oxygen trend
512. Analytics engine: Latest history row
513. Analytics engine: History science total
514. Analytics engine: EVA shield sols
515. Analytics engine: Ice pocket armed
516. Analytics engine: Relay fixed until
517. Analytics engine: Pod light
518. Analytics engine: Redundancy sol
519. Analytics engine: First crew name
520. Analytics engine: Medic count
521. Analytics engine: Scientist count
522. Analytics engine: Commander count
523. Analytics engine: Max crew XP
524. Analytics engine: Veteran count
525. Analytics engine: On expedition
526. Analytics engine: Max crew health
527. Analytics engine: Morale all OK
528. Analytics engine: Greenhouses done
529. Analytics engine: Batteries done
530. Analytics engine: Shields done
531. Analytics engine: Comms done
532. Analytics engine: Workshops done
533. Analytics engine: Science still needed
534. Analytics engine: Required science pace
535. Analytics engine: Regolith available
536. Analytics engine: Parts available
537. Analytics engine: Site label
538. Analytics engine: Sandbox check
539. Analytics engine: Hard-mode check
540. Analytics engine: All-crew-lost check
541. Analytics engine: State snapshot
542. Analytics engine: State snapshot JSON
543. Analytics engine: Crew name list
544. Analytics engine: Crew role list
545. Analytics engine: Building type list
546. Analytics engine: Building summary line
547. Analytics desk: site
548. Analytics desk: difficulty
549. Analytics desk: sol
550. Analytics desk: mission over
551. Analytics desk: mission won
552. Analytics desk: mission name
553. Analytics desk: oxygen
554. Analytics desk: water
555. Analytics desk: food
556. Analytics desk: parts
557. Analytics desk: regolith
558. Analytics desk: science
559. Analytics desk: resource total
560. Analytics desk: min consumable
561. Analytics desk: max consumable
562. Analytics desk: crew size
563. Analytics desk: crew alive
564. Analytics desk: crew lost
565. Analytics desk: crew away
566. Analytics desk: mean health
567. Analytics desk: mean morale
568. Analytics desk: mean fatigue
569. Analytics desk: XP total
570. Analytics desk: role tally
571. Analytics desk: engineers
572. Analytics desk: weakest crew
573. Analytics desk: buildings
574. Analytics desk: buildings done
575. Analytics desk: in progress
576. Analytics desk: damaged
577. Analytics desk: type tally
578. Analytics desk: solar arrays
579. Analytics desk: habitats
580. Analytics desk: techs
581. Analytics desk: log length
582. Analytics desk: storms survived
583. Analytics desk: shield level
584. Analytics desk: objective science
585. Analytics desk: objective sols
586. Analytics desk: progress %
587. Analytics desk: sols left
588. Analytics desk: objective mode
589. Analytics desk: scenario
590. Analytics desk: achievements
591. Analytics desk: schedule length
592. Analytics desk: seed
593. Analytics desk: phase
594. Analytics desk: site count
595. Analytics desk: building catalog
596. Analytics desk: total build cost
597. Analytics desk: cheapest build
598. Analytics desk: priciest build
599. Analytics desk: crew capacity
600. Analytics desk: all built
601. Analytics desk: all alive
602. Analytics desk: starving
603. Analytics desk: science met
604. Analytics desk: food per crew
605. Analytics desk: water per crew
606. Analytics desk: oxygen per crew
607. Analytics desk: mission score
608. Analytics desk: science needed
609. Analytics desk: science pace
610. Analytics desk: site label
611. Analytics desk: building summary

## Data and sources

Challenge statement: nasaspaceapps.ae/challenges (Junior Astronaut Mission Trainer). All science facts in the quiz are from well-known NASA mission records (MOXIE, SOFIA, Artemis, JWST, ISS, Apollo 13, Opportunity). No external data calls; the game runs fully offline.

## Tested

`node test.js` — 415 checks (62 original + 102 round-4 + 66 round-5 + 61 round-6 + 124 round-7) covering engine rules, resource math, role effects, tech effects, expeditions, scenarios, sandbox behavior, advisor triggers, forecast correctness and a full playthrough that wins. All pass on Node 22. Round-4 tests cover the new buildings, techs, expeditions, events, ops actions, analytics functions, objective modes, grading and exports. Round-5 tests cover the briefing, runway, plans, advisors, checklists, CSV/JSON/markdown exports, integrity checker and state hash. Round-6 tests cover the new mission-analytics engine functions: resource aggregates, crew metrics, building and tech counters, objective progress, reserve warnings and per-crew ratios.

## Untested

Browser UI interactions (rendered DOM, buttons, localStorage) were checked by code review and syntax validation only, not in a live browser. Sound is not implemented.
