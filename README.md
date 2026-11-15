# Junior Astronaut Mission Trainer

NASA Space Apps 2026 challenge #1. A browser-based base-management game for kids (and judges) that teaches real mission trade-offs on the Moon and Mars: power, oxygen, water, food, shielding, crew health and morale. Fully offline: open `index.html` and play.

## Features (1211)

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
612. Engine: round-8 catalog export ba8_storm_id
613. Engine: round-8 catalog export ba8_storm_text
614. Engine: round-8 catalog export ba8_storm_w
615. Engine: round-8 catalog export ba8_storm_sites_n
616. Engine: round-8 catalog export ba8_storm_sites_first
617. Engine: round-8 catalog export ba8_storm_text_wc
618. Engine: round-8 catalog export ba8_micro_id
619. Engine: round-8 catalog export ba8_micro_text
620. Engine: round-8 catalog export ba8_micro_w
621. Engine: round-8 catalog export ba8_micro_sites_n
622. Engine: round-8 catalog export ba8_micro_sites_first
623. Engine: round-8 catalog export ba8_micro_text_wc
624. Engine: round-8 catalog export ba8_illness_id
625. Engine: round-8 catalog export ba8_illness_text
626. Engine: round-8 catalog export ba8_illness_w
627. Engine: round-8 catalog export ba8_illness_sites_n
628. Engine: round-8 catalog export ba8_illness_sites_first
629. Engine: round-8 catalog export ba8_illness_text_wc
630. Engine: round-8 catalog export ba8_aurora_id
631. Engine: round-8 catalog export ba8_aurora_text
632. Engine: round-8 catalog export ba8_aurora_w
633. Engine: round-8 catalog export ba8_aurora_sites_n
634. Engine: round-8 catalog export ba8_aurora_sites_first
635. Engine: round-8 catalog export ba8_aurora_text_wc
636. Engine: round-8 catalog export ba8_quake_id
637. Engine: round-8 catalog export ba8_quake_text
638. Engine: round-8 catalog export ba8_quake_w
639. Engine: round-8 catalog export ba8_quake_sites_n
640. Engine: round-8 catalog export ba8_quake_sites_first
641. Engine: round-8 catalog export ba8_quake_text_wc
642. Engine: round-8 catalog export ba8_find_id
643. Engine: round-8 catalog export ba8_find_text
644. Engine: round-8 catalog export ba8_find_w
645. Engine: round-8 catalog export ba8_find_sites_n
646. Engine: round-8 catalog export ba8_find_sites_first
647. Engine: round-8 catalog export ba8_find_text_wc
648. Engine: round-8 catalog export ba8_relay_id
649. Engine: round-8 catalog export ba8_relay_text
650. Engine: round-8 catalog export ba8_relay_w
651. Engine: round-8 catalog export ba8_relay_sites_n
652. Engine: round-8 catalog export ba8_relay_sites_first
653. Engine: round-8 catalog export ba8_relay_text_wc
654. Engine: round-8 catalog export ba8_calm_id
655. Engine: round-8 catalog export ba8_calm_text
656. Engine: round-8 catalog export ba8_calm_w
657. Engine: round-8 catalog export ba8_calm_sites_n
658. Engine: round-8 catalog export ba8_calm_sites_first
659. Engine: round-8 catalog export ba8_calm_text_wc
660. Engine: round-8 catalog export ba8_flare_id
661. Engine: round-8 catalog export ba8_flare_text
662. Engine: round-8 catalog export ba8_flare_w
663. Engine: round-8 catalog export ba8_flare_sites_n
664. Engine: round-8 catalog export ba8_flare_sites_first
665. Engine: round-8 catalog export ba8_flare_text_wc
666. Engine: round-8 catalog export ba8_birthday_id
667. Engine: round-8 catalog export ba8_birthday_text
668. Engine: round-8 catalog export ba8_birthday_w
669. Engine: round-8 catalog export ba8_birthday_sites_n
670. Engine: round-8 catalog export ba8_birthday_sites_first
671. Engine: round-8 catalog export ba8_birthday_text_wc
672. Engine: round-8 catalog export ba8_stowaway_id
673. Engine: round-8 catalog export ba8_stowaway_text
674. Engine: round-8 catalog export ba8_stowaway_w
675. Engine: round-8 catalog export ba8_stowaway_sites_n
676. Engine: round-8 catalog export ba8_stowaway_sites_first
677. Engine: round-8 catalog export ba8_stowaway_text_wc
678. Engine: round-8 catalog export ba8_coolant_id
679. Engine: round-8 catalog export ba8_coolant_text
680. Engine: round-8 catalog export ba8_coolant_w
681. Engine: round-8 catalog export ba8_coolant_sites_n
682. Engine: round-8 catalog export ba8_coolant_sites_first
683. Engine: round-8 catalog export ba8_coolant_text_wc
684. Engine: round-8 catalog export ba8_podbonus_id
685. Engine: round-8 catalog export ba8_podbonus_text
686. Engine: round-8 catalog export ba8_podbonus_w
687. Engine: round-8 catalog export ba8_podbonus_sites_n
688. Engine: round-8 catalog export ba8_podbonus_sites_first
689. Engine: round-8 catalog export ba8_podbonus_text_wc
690. Engine: round-8 catalog export ba8_breakthrough_id
691. Engine: round-8 catalog export ba8_breakthrough_text
692. Engine: round-8 catalog export ba8_breakthrough_w
693. Engine: round-8 catalog export ba8_breakthrough_sites_n
694. Engine: round-8 catalog export ba8_breakthrough_sites_first
695. Engine: round-8 catalog export ba8_breakthrough_text_wc
696. Engine: round-8 catalog export ba8_homesick_id
697. Engine: round-8 catalog export ba8_homesick_text
698. Engine: round-8 catalog export ba8_homesick_w
699. Engine: round-8 catalog export ba8_homesick_sites_n
700. Engine: round-8 catalog export ba8_homesick_sites_first
701. Engine: round-8 catalog export ba8_homesick_text_wc
702. Engine: round-8 catalog export ba8_meteorshower_id
703. Engine: round-8 catalog export ba8_meteorshower_text
704. Engine: round-8 catalog export ba8_meteorshower_w
705. Engine: round-8 catalog export ba8_meteorshower_sites_n
706. Engine: round-8 catalog export ba8_meteorshower_sites_first
707. Engine: round-8 catalog export ba8_meteorshower_text_wc
708. Engine: round-8 catalog export ba8_o2leak_id
709. Engine: round-8 catalog export ba8_o2leak_text
710. Engine: round-8 catalog export ba8_o2leak_w
711. Engine: round-8 catalog export ba8_o2leak_sites_n
712. Engine: round-8 catalog export ba8_o2leak_sites_first
713. Engine: round-8 catalog export ba8_o2leak_text_wc
714. Engine: round-8 catalog export ba8_blight_id
715. Engine: round-8 catalog export ba8_blight_text
716. Engine: round-8 catalog export ba8_blight_w
717. Engine: round-8 catalog export ba8_blight_sites_n
718. Engine: round-8 catalog export ba8_blight_sites_first
719. Engine: round-8 catalog export ba8_blight_text_wc
720. Engine: round-8 catalog export ba8_argument_id
721. Engine: round-8 catalog export ba8_argument_text
722. Engine: round-8 catalog export ba8_argument_w
723. Engine: round-8 catalog export ba8_argument_sites_n
724. Engine: round-8 catalog export ba8_argument_sites_first
725. Engine: round-8 catalog export ba8_argument_text_wc
726. Engine: round-8 catalog export ba8_dustdevil_id
727. Engine: round-8 catalog export ba8_dustdevil_text
728. Engine: round-8 catalog export ba8_dustdevil_w
729. Engine: round-8 catalog export ba8_dustdevil_sites_n
730. Engine: round-8 catalog export ba8_dustdevil_sites_first
731. Engine: round-8 catalog export ba8_dustdevil_text_wc
732. Engine: round-8 catalog export ba8_suitpuncture_id
733. Engine: round-8 catalog export ba8_suitpuncture_text
734. Engine: round-8 catalog export ba8_suitpuncture_w
735. Engine: round-8 catalog export ba8_suitpuncture_sites_n
736. Engine: round-8 catalog export ba8_suitpuncture_sites_first
737. Engine: round-8 catalog export ba8_suitpuncture_text_wc
738. Engine: round-8 catalog export ba8_icepocket_id
739. Engine: round-8 catalog export ba8_icepocket_text
740. Engine: round-8 catalog export ba8_icepocket_w
741. Engine: round-8 catalog export ba8_icepocket_sites_n
742. Engine: round-8 catalog export ba8_icepocket_sites_first
743. Engine: round-8 catalog export ba8_icepocket_text_wc
744. Engine: round-8 catalog export ba8_what_did_nasa_s_moxie_experi_q
745. Engine: round-8 catalog export ba8_what_did_nasa_s_moxie_experi_c
746. Engine: round-8 catalog export ba8_what_did_nasa_s_moxie_experi_fact
747. Engine: round-8 catalog export ba8_what_did_nasa_s_moxie_experi_a_n
748. Engine: round-8 catalog export ba8_what_did_nasa_s_moxie_experi_a_first
749. Engine: round-8 catalog export ba8_what_did_nasa_s_moxie_experi_q_wc
750. Engine: round-8 catalog export ba8_what_did_nasa_s_moxie_experi_fact_wc
751. Engine: round-8 catalog export ba8_why_do_planners_target_the_m_q
752. Engine: round-8 catalog export ba8_why_do_planners_target_the_m_c
753. Engine: round-8 catalog export ba8_why_do_planners_target_the_m_fact
754. Engine: round-8 catalog export ba8_why_do_planners_target_the_m_a_n
755. Engine: round-8 catalog export ba8_why_do_planners_target_the_m_a_first
756. Engine: round-8 catalog export ba8_why_do_planners_target_the_m_q_wc
757. Engine: round-8 catalog export ba8_why_do_planners_target_the_m_fact_wc
758. Engine: round-8 catalog export ba8_about_how_long_is_one_martia_q
759. Engine: round-8 catalog export ba8_about_how_long_is_one_martia_c
760. Engine: round-8 catalog export ba8_about_how_long_is_one_martia_fact
761. Engine: round-8 catalog export ba8_about_how_long_is_one_martia_a_n
762. Engine: round-8 catalog export ba8_about_how_long_is_one_martia_a_first
763. Engine: round-8 catalog export ba8_about_how_long_is_one_martia_q_wc
764. Engine: round-8 catalog export ba8_about_how_long_is_one_martia_fact_wc
765. Engine: round-8 catalog export ba8_what_is_the_main_component_o_q
766. Engine: round-8 catalog export ba8_what_is_the_main_component_o_c
767. Engine: round-8 catalog export ba8_what_is_the_main_component_o_fact
768. Engine: round-8 catalog export ba8_what_is_the_main_component_o_a_n
769. Engine: round-8 catalog export ba8_what_is_the_main_component_o_a_first
770. Engine: round-8 catalog export ba8_what_is_the_main_component_o_q_wc
771. Engine: round-8 catalog export ba8_what_is_the_main_component_o_fact_wc
772. Engine: round-8 catalog export ba8_how_long_can_a_one_way_radio_q
773. Engine: round-8 catalog export ba8_how_long_can_a_one_way_radio_c
774. Engine: round-8 catalog export ba8_how_long_can_a_one_way_radio_fact
775. Engine: round-8 catalog export ba8_how_long_can_a_one_way_radio_a_n
776. Engine: round-8 catalog export ba8_how_long_can_a_one_way_radio_a_first
777. Engine: round-8 catalog export ba8_how_long_can_a_one_way_radio_q_wc
778. Engine: round-8 catalog export ba8_how_long_can_a_one_way_radio_fact_wc
779. Engine: round-8 catalog export ba8_what_protects_crews_on_the_i_q
780. Engine: round-8 catalog export ba8_what_protects_crews_on_the_i_c
781. Engine: round-8 catalog export ba8_what_protects_crews_on_the_i_fact
782. Engine: round-8 catalog export ba8_what_protects_crews_on_the_i_a_n
783. Engine: round-8 catalog export ba8_what_protects_crews_on_the_i_a_first
784. Engine: round-8 catalog export ba8_what_protects_crews_on_the_i_q_wc
785. Engine: round-8 catalog export ba8_what_protects_crews_on_the_i_fact_wc
786. Engine: round-8 catalog export ba8_roughly_how_long_is_a_full_l_q
787. Engine: round-8 catalog export ba8_roughly_how_long_is_a_full_l_c
788. Engine: round-8 catalog export ba8_roughly_how_long_is_a_full_l_fact
789. Engine: round-8 catalog export ba8_roughly_how_long_is_a_full_l_a_n
790. Engine: round-8 catalog export ba8_roughly_how_long_is_a_full_l_a_first
791. Engine: round-8 catalog export ba8_roughly_how_long_is_a_full_l_q_wc
792. Engine: round-8 catalog export ba8_roughly_how_long_is_a_full_l_fact_wc
793. Engine: round-8 catalog export ba8_what_do_rtgs_use_to_make_ele_q
794. Engine: round-8 catalog export ba8_what_do_rtgs_use_to_make_ele_c
795. Engine: round-8 catalog export ba8_what_do_rtgs_use_to_make_ele_fact
796. Engine: round-8 catalog export ba8_what_do_rtgs_use_to_make_ele_a_n
797. Engine: round-8 catalog export ba8_what_do_rtgs_use_to_make_ele_a_first
798. Engine: round-8 catalog export ba8_what_do_rtgs_use_to_make_ele_q_wc
799. Engine: round-8 catalog export ba8_what_do_rtgs_use_to_make_ele_fact_wc
800. Engine: round-8 catalog export ba8_why_is_growing_food_on_a_mis_q
801. Engine: round-8 catalog export ba8_why_is_growing_food_on_a_mis_c
802. Engine: round-8 catalog export ba8_why_is_growing_food_on_a_mis_fact
803. Engine: round-8 catalog export ba8_why_is_growing_food_on_a_mis_a_n
804. Engine: round-8 catalog export ba8_why_is_growing_food_on_a_mis_a_first
805. Engine: round-8 catalog export ba8_why_is_growing_food_on_a_mis_q_wc
806. Engine: round-8 catalog export ba8_why_is_growing_food_on_a_mis_fact_wc
807. Engine: round-8 catalog export ba8_what_hazard_do_dust_storms_o_q
808. Engine: round-8 catalog export ba8_what_hazard_do_dust_storms_o_c
809. Engine: round-8 catalog export ba8_what_hazard_do_dust_storms_o_fact
810. Engine: round-8 catalog export ba8_what_hazard_do_dust_storms_o_a_n
811. Engine: round-8 catalog export ba8_what_hazard_do_dust_storms_o_a_first
812. Engine: round-8 catalog export ba8_what_hazard_do_dust_storms_o_q_wc
813. Engine: round-8 catalog export ba8_what_hazard_do_dust_storms_o_fact_wc
814. Engine: round-8 catalog export ba8_which_program_aims_to_return_q
815. Engine: round-8 catalog export ba8_which_program_aims_to_return_c
816. Engine: round-8 catalog export ba8_which_program_aims_to_return_fact
817. Engine: round-8 catalog export ba8_which_program_aims_to_return_a_n
818. Engine: round-8 catalog export ba8_which_program_aims_to_return_a_first
819. Engine: round-8 catalog export ba8_which_program_aims_to_return_q_wc
820. Engine: round-8 catalog export ba8_which_program_aims_to_return_fact_wc
821. Engine: round-8 catalog export ba8_which_telescope_launched_in__q
822. Engine: round-8 catalog export ba8_which_telescope_launched_in__c
823. Engine: round-8 catalog export ba8_which_telescope_launched_in__fact
824. Engine: round-8 catalog export ba8_which_telescope_launched_in__a_n
825. Engine: round-8 catalog export ba8_which_telescope_launched_in__a_first
826. Engine: round-8 catalog export ba8_which_telescope_launched_in__q_wc
827. Engine: round-8 catalog export ba8_which_telescope_launched_in__fact_wc
828. Engine: round-8 catalog export ba8_what_makes_lunar_regolith_us_q
829. Engine: round-8 catalog export ba8_what_makes_lunar_regolith_us_c
830. Engine: round-8 catalog export ba8_what_makes_lunar_regolith_us_fact
831. Engine: round-8 catalog export ba8_what_makes_lunar_regolith_us_a_n
832. Engine: round-8 catalog export ba8_what_makes_lunar_regolith_us_a_first
833. Engine: round-8 catalog export ba8_what_makes_lunar_regolith_us_q_wc
834. Engine: round-8 catalog export ba8_what_makes_lunar_regolith_us_fact_wc
835. Engine: round-8 catalog export ba8_what_did_the_sofia_observato_q
836. Engine: round-8 catalog export ba8_what_did_the_sofia_observato_c
837. Engine: round-8 catalog export ba8_what_did_the_sofia_observato_fact
838. Engine: round-8 catalog export ba8_what_did_the_sofia_observato_a_n
839. Engine: round-8 catalog export ba8_what_did_the_sofia_observato_a_first
840. Engine: round-8 catalog export ba8_what_did_the_sofia_observato_q_wc
841. Engine: round-8 catalog export ba8_what_did_the_sofia_observato_fact_wc
842. Engine: round-8 catalog export ba8_why_are_lava_tubes_interesti_q
843. Engine: round-8 catalog export ba8_why_are_lava_tubes_interesti_c
844. Engine: round-8 catalog export ba8_why_are_lava_tubes_interesti_fact
845. Engine: round-8 catalog export ba8_why_are_lava_tubes_interesti_a_n
846. Engine: round-8 catalog export ba8_why_are_lava_tubes_interesti_a_first
847. Engine: round-8 catalog export ba8_why_are_lava_tubes_interesti_q_wc
848. Engine: round-8 catalog export ba8_why_are_lava_tubes_interesti_fact_wc
849. Engine: round-8 catalog export ba8_what_is_isru_q
850. Engine: round-8 catalog export ba8_what_is_isru_c
851. Engine: round-8 catalog export ba8_what_is_isru_fact
852. Engine: round-8 catalog export ba8_what_is_isru_a_n
853. Engine: round-8 catalog export ba8_what_is_isru_a_first
854. Engine: round-8 catalog export ba8_what_is_isru_fact_wc
855. Engine: round-8 catalog export ba8_perchlorate_salts_in_martian_q
856. Engine: round-8 catalog export ba8_perchlorate_salts_in_martian_c
857. Engine: round-8 catalog export ba8_perchlorate_salts_in_martian_fact
858. Engine: round-8 catalog export ba8_perchlorate_salts_in_martian_a_n
859. Engine: round-8 catalog export ba8_perchlorate_salts_in_martian_a_first
860. Engine: round-8 catalog export ba8_perchlorate_salts_in_martian_q_wc
861. Engine: round-8 catalog export ba8_perchlorate_salts_in_martian_fact_wc
862. Engine: round-8 catalog export ba8_which_apollo_mission_turned__q
863. Engine: round-8 catalog export ba8_which_apollo_mission_turned__c
864. Engine: round-8 catalog export ba8_which_apollo_mission_turned__fact
865. Engine: round-8 catalog export ba8_which_apollo_mission_turned__a_n
866. Engine: round-8 catalog export ba8_which_apollo_mission_turned__a_first
867. Engine: round-8 catalog export ba8_which_apollo_mission_turned__q_wc
868. Engine: round-8 catalog export ba8_which_apollo_mission_turned__fact_wc
869. Engine: round-8 catalog export ba8_why_does_a_greenhouse_on_mar_q
870. Engine: round-8 catalog export ba8_why_does_a_greenhouse_on_mar_c
871. Engine: round-8 catalog export ba8_why_does_a_greenhouse_on_mar_fact
872. Engine: round-8 catalog export ba8_why_does_a_greenhouse_on_mar_a_n
873. Engine: round-8 catalog export ba8_why_does_a_greenhouse_on_mar_a_first
874. Engine: round-8 catalog export ba8_why_does_a_greenhouse_on_mar_q_wc
875. Engine: round-8 catalog export ba8_why_does_a_greenhouse_on_mar_fact_wc
876. Engine: round-8 catalog export ba8_what_is_a_fair_first_power_s_q
877. Engine: round-8 catalog export ba8_what_is_a_fair_first_power_s_c
878. Engine: round-8 catalog export ba8_what_is_a_fair_first_power_s_fact
879. Engine: round-8 catalog export ba8_what_is_a_fair_first_power_s_a_n
880. Engine: round-8 catalog export ba8_what_is_a_fair_first_power_s_a_first
881. Engine: round-8 catalog export ba8_what_is_a_fair_first_power_s_q_wc
882. Engine: round-8 catalog export ba8_what_is_a_fair_first_power_s_fact_wc
883. Engine: round-8 catalog export ba8_firstsol_id
884. Engine: round-8 catalog export ba8_firstsol_name
885. Engine: round-8 catalog export ba8_power50_id
886. Engine: round-8 catalog export ba8_power50_name
887. Engine: round-8 catalog export ba8_science100_id
888. Engine: round-8 catalog export ba8_science100_name
889. Engine: round-8 catalog export ba8_shield3_id
890. Engine: round-8 catalog export ba8_shield3_name
891. Engine: round-8 catalog export ba8_sol15_id
892. Engine: round-8 catalog export ba8_sol15_name
893. Engine: round-8 catalog export ba8_sol30_id
894. Engine: round-8 catalog export ba8_sol30_name
895. Engine: round-8 catalog export ba8_fullhouse_id
896. Engine: round-8 catalog export ba8_fullhouse_name
897. Engine: round-8 catalog export ba8_quiz5_id
898. Engine: round-8 catalog export ba8_quiz5_name
899. Engine: round-8 catalog export ba8_selfsufficient_id
900. Engine: round-8 catalog export ba8_selfsufficient_name
901. Engine: round-8 catalog export ba8_survivor_id
902. Engine: round-8 catalog export ba8_survivor_name
903. Engine: round-8 catalog export ba8_researcher_id
904. Engine: round-8 catalog export ba8_researcher_name
905. Engine: round-8 catalog export ba8_awayteam_id
906. Engine: round-8 catalog export ba8_awayteam_name
907. Engine: round-8 catalog export ba8_veteran_id
908. Engine: round-8 catalog export ba8_veteran_name
909. Engine: round-8 catalog export ba8_nightowl_id
910. Engine: round-8 catalog export ba8_nightowl_name
911. Engine: round-8 catalog export ba8_closedloop2_id
912. Engine: round-8 catalog export ba8_closedloop2_name
913. Engine: round-8 catalog export ba8_highscore_id
914. Engine: round-8 catalog export ba8_highscore_name
915. Engine: round-8 catalog export ba8_crosstrained_id
916. Engine: round-8 catalog export ba8_crosstrained_name
917. Engine: round-8 catalog export ba8_farmer_id
918. Engine: round-8 catalog export ba8_farmer_name
919. Engine: round-8 catalog export ba8_scenario_id
920. Engine: round-8 catalog export ba8_scenario_name
921. Engine: round-8 catalog export ba8_hoarder_id
922. Engine: round-8 catalog export ba8_hoarder_name
923. Engine: round-8 catalog export ba8_events_count
924. Engine: round-8 catalog export ba8_events_w_min
925. Engine: round-8 catalog export ba8_events_w_max
926. Engine: round-8 catalog export ba8_events_w_sum
927. Engine: round-8 catalog export ba8_quiz_count
928. Engine: round-8 catalog export ba8_quiz_c_min
929. Engine: round-8 catalog export ba8_quiz_c_max
930. Engine: round-8 catalog export ba8_quiz_c_sum
931. Engine: round-8 catalog export ba8_achievements_count
932. Engine: round-8 catalog export ba8_events_has_solar
933. Engine: round-8 catalog export ba8_events_has_building
934. Engine: round-8 catalog export ba8_events_has_morale
935. Engine: round-8 catalog export ba8_events_has_member
936. Engine: round-8 catalog export ba8_events_has_radiation
937. Engine: round-8 catalog export ba8_events_has_damaging
938. Engine: round-8 catalog export ba8_events_has_pocket
939. Engine: round-8 catalog export ba8_events_has_science
940. Engine: round-8 catalog export ba8_events_has_online
941. Engine: round-8 catalog export ba8_events_has_drops
942. Engine: round-8 catalog export ba8_events_has_oxygen
943. Engine: round-8 catalog export ba8_events_has_storm
944. Engine: round-8 catalog export ba8_events_has_output
945. Engine: round-8 catalog export ba8_events_has_micrometeorite
946. Engine: round-8 catalog export ba8_events_has_strike
947. Engine: round-8 catalog export ba8_events_has_damages
948. Engine: round-8 catalog export ba8_events_has_random
949. Engine: round-8 catalog export ba8_events_has_falls
950. Engine: round-8 catalog export ba8_events_has_loses
951. Engine: round-8 catalog export ba8_events_has_health
952. Engine: round-8 catalog export ba8_events_has_particle
953. Engine: round-8 catalog export ba8_events_has_event
954. Engine: round-8 catalog export ba8_events_has_unshielded
955. Engine: round-8 catalog export ba8_events_has_moonquake
956. Engine: round-8 catalog export ba8_events_has_rattles
957. Engine: round-8 catalog export ba8_events_has_surveyors
958. Engine: round-8 catalog export ba8_events_has_water
959. Engine: round-8 catalog export ba8_events_has_satellite
960. Engine: round-8 catalog export ba8_events_has_relay
961. Engine: round-8 catalog export ba8_events_has_passes
962. Engine: round-8 catalog export ba8_events_has_overhead
963. Engine: round-8 catalog export ba8_events_has_comms
964. Engine: round-8 catalog export ba8_events_has_improves
965. Engine: round-8 catalog export ba8_events_has_flare
966. Engine: round-8 catalog export ba8_events_has_extra
967. Engine: round-8 catalog export ba8_events_has_birthday
968. Engine: round-8 catalog export ba8_events_has_lifts
969. Engine: round-8 catalog export ba8_events_has_everyone
970. Engine: round-8 catalog export ba8_events_has_stowaway
971. Engine: round-8 catalog export ba8_events_has_stores
972. Engine: round-8 catalog export ba8_quiz_has_earth
973. Engine: round-8 catalog export ba8_quiz_has_lunar
974. Engine: round-8 catalog export ba8_quiz_has_martian
975. Engine: round-8 catalog export ba8_quiz_has_atmosphere
976. Engine: round-8 catalog export ba8_quiz_has_water
977. Engine: round-8 catalog export ba8_quiz_has_about
978. Engine: round-8 catalog export ba8_quiz_has_oxygen
979. Engine: round-8 catalog export ba8_quiz_has_crews
980. Engine: round-8 catalog export ba8_quiz_has_south
981. Engine: round-8 catalog export ba8_quiz_has_radiation
982. Engine: round-8 catalog export ba8_quiz_has_regolith
983. Engine: round-8 catalog export ba8_quiz_has_solar
984. Engine: round-8 catalog export ba8_quiz_has_polar
985. Engine: round-8 catalog export ba8_quiz_has_power
986. Engine: round-8 catalog export ba8_quiz_has_storms
987. Engine: round-8 catalog export ba8_quiz_has_mission
988. Engine: round-8 catalog export ba8_quiz_has_sunlight
989. Engine: round-8 catalog export ba8_quiz_has_which
990. Engine: round-8 catalog export ba8_quiz_has_moxie
991. Engine: round-8 catalog export ba8_quiz_has_first
992. Feature deck button r300a
993. Feature deck button r300b
994. Feature deck button r300c
995. Feature deck button r300d
996. Feature deck button r300e
997. Feature deck button r300f
998. Feature deck button r300g
999. Feature deck button r300h
1000. Feature deck button r300i
1001. Feature deck button r300j
1002. Feature deck button r300k
1003. Feature deck button r300l
1004. Feature deck button r300m
1005. Feature deck button r300n
1006. Feature deck button r300o
1007. Feature deck button r300p
1008. Feature deck button r300q
1009. Feature deck button r300r
1010. Feature deck button r300s
1011. Feature deck button r300t
1012. Feature deck button r300u
1013. Feature deck button r300v
1014. Feature deck button r300w
1015. Feature deck button r300x
1016. Feature deck button r300y
1017. Feature deck button r300z
1018. Feature deck button r300aa
1019. Feature deck button r300ab
1020. Feature deck button r300ac
1021. Feature deck button r300ad
1022. Feature deck button r300ae
1023. Feature deck button r300af
1024. Feature deck button r300ag
1025. Feature deck button r300ah
1026. Feature deck button r300ai
1027. Feature deck button r300aj
1028. Feature deck button r300ak
1029. Feature deck button r300al
1030. Feature deck button r300am
1031. Feature deck button r300an
1032. Feature deck button r300ao
1033. Feature deck button r300ap
1034. Feature deck button r300aq
1035. Feature deck button r300ar
1036. Feature deck button r300as
1037. Feature deck button r300at
1038. Feature deck button r300au
1039. Feature deck button r300av
1040. Feature deck button r300aw
1041. Feature deck button r300ax
1042. Feature deck button r300ay
1043. Feature deck button r300az
1044. Feature deck button r300ba
1045. Feature deck button r300bb
1046. Feature deck button r300bc
1047. Feature deck button r300bd
1048. Feature deck button r300be
1049. Feature deck button r300bf
1050. Feature deck button r300bg
1051. Feature deck button r300bh
1052. Feature deck button r300bi
1053. Feature deck button r300bj
1054. Feature deck button r300bk
1055. Feature deck button r300bl
1056. Feature deck button r300bm
1057. Feature deck button r300bn
1058. Feature deck button r300bo
1059. Feature deck button r300bp
1060. Feature deck button r300bq
1061. Feature deck button r300br
1062. Feature deck button r300bs
1063. Feature deck button r300bt
1064. Feature deck button r300bu
1065. Feature deck button r300bv
1066. Feature deck button r300bw
1067. Feature deck button r300bx
1068. Feature deck button r300by
1069. Feature deck button r300bz
1070. Feature deck button r300ca
1071. Feature deck button r300cb
1072. Feature deck button r300cc
1073. Feature deck button r300cd
1074. Feature deck button r300ce
1075. Feature deck button r300cf
1076. Feature deck button r300cg
1077. Feature deck button r300ch
1078. Feature deck button r300ci
1079. Feature deck button r300cj
1080. Feature deck button r300ck
1081. Feature deck button r300cl
1082. Feature deck button r300cm
1083. Feature deck button r300cn
1084. Feature deck button r300co
1085. Feature deck button r300cp
1086. Feature deck button r300cq
1087. Feature deck button r300cr
1088. Feature deck button r300cs
1089. Feature deck button r300ct
1090. Feature deck button r300cu
1091. Feature deck button r300cv
1092. Feature deck button r300cw
1093. Feature deck button r300cx
1094. Feature deck button r300cy
1095. Feature deck button r300cz
1096. Feature deck button r300da
1097. Feature deck button r300db
1098. Feature deck button r300dc
1099. Feature deck button r300dd
1100. Feature deck button r300de
1101. Feature deck button r300df
1102. Feature deck button r300dg
1103. Feature deck button r300dh
1104. Feature deck button r300di
1105. Feature deck button r300dj
1106. Feature deck button r300dk
1107. Feature deck button r300dl
1108. Feature deck button r300dm
1109. Feature deck button r300dn
1110. Feature deck button r300do
1111. Feature deck button r300dp
1112. Engine: round-8 catalog export ca9_quiz_has_making
1113. Engine: round-8 catalog export ca9_quiz_has_planners
1114. Engine: round-8 catalog export ca9_quiz_has_shadowed
1115. Engine: round-8 catalog export ca9_quiz_has_light
1116. Engine: round-8 catalog export ca9_quiz_has_shielding
1117. Engine: round-8 catalog export ca9_quiz_has_night
1118. Engine: round-8 catalog export ca9_quiz_has_local
1119. Engine: round-8 catalog export ca9_quiz_has_return
1120. Engine: round-8 catalog export ca9_quiz_has_sofia
1121. Engine: round-8 catalog export ca9_quiz_has_tubes
1122. Engine: round-8 catalog export ca9_quiz_has_apollo
1123. Engine: round-8 catalog export ca9_quiz_has_experiment
1124. Engine: round-8 catalog export ca9_quiz_has_produce
1125. Engine: round-8 catalog export ca9_quiz_has_toward
1126. Engine: round-8 catalog export ca9_quiz_has_rocket
1127. Engine: round-8 catalog export ca9_quiz_has_target
1128. Engine: round-8 catalog export ca9_quiz_has_craters
1129. Engine: round-8 catalog export ca9_quiz_has_traps
1130. Engine: round-8 catalog export ca9_quiz_has_preserve
1131. Engine: round-8 catalog export ca9_quiz_has_close
1132. Engine: round-8 catalog export ca9_events_storm_hash
1133. Engine: round-8 catalog export ca9_events_micro_hash
1134. Engine: round-8 catalog export ca9_events_illness_hash
1135. Engine: round-8 catalog export ca9_events_aurora_hash
1136. Engine: round-8 catalog export ca9_events_quake_hash
1137. Engine: round-8 catalog export ca9_events_find_hash
1138. Engine: round-8 catalog export ca9_events_relay_hash
1139. Engine: round-8 catalog export ca9_events_calm_hash
1140. Engine: round-8 catalog export ca9_events_flare_hash
1141. Engine: round-8 catalog export ca9_events_birthday_hash
1142. Engine: round-8 catalog export ca9_events_stowaway_hash
1143. Engine: round-8 catalog export ca9_events_coolant_hash
1144. Engine: round-8 catalog export ca9_events_podbonus_hash
1145. Engine: round-8 catalog export ca9_events_breakthrough_hash
1146. Engine: round-8 catalog export ca9_events_homesick_hash
1147. Engine: round-8 catalog export ca9_events_meteorshower_hash
1148. Engine: round-8 catalog export ca9_events_o2leak_hash
1149. Engine: round-8 catalog export ca9_events_blight_hash
1150. Engine: round-8 catalog export ca9_events_argument_hash
1151. Engine: round-8 catalog export ca9_events_dustdevil_hash
1152. Engine: round-8 catalog export ca9_events_suitpuncture_hash
1153. Engine: round-8 catalog export ca9_events_icepocket_hash
1154. Engine: round-8 catalog export ca9_quiz_what_did_nasa_s_moxie_experi_hash
1155. Engine: round-8 catalog export ca9_quiz_why_do_planners_target_the_m_hash
1156. Engine: round-8 catalog export ca9_quiz_about_how_long_is_one_martia_hash
1157. Engine: round-8 catalog export ca9_quiz_what_is_the_main_component_o_hash
1158. Engine: round-8 catalog export ca9_quiz_how_long_can_a_one_way_radio_hash
1159. Engine: round-8 catalog export ca9_quiz_what_protects_crews_on_the_i_hash
1160. Engine: round-8 catalog export ca9_quiz_roughly_how_long_is_a_full_l_hash
1161. Engine: round-8 catalog export ca9_quiz_what_do_rtgs_use_to_make_ele_hash
1162. Engine: round-8 catalog export ca9_quiz_why_is_growing_food_on_a_mis_hash
1163. Engine: round-8 catalog export ca9_quiz_what_hazard_do_dust_storms_o_hash
1164. Engine: round-8 catalog export ca9_quiz_which_program_aims_to_return_hash
1165. Engine: round-8 catalog export ca9_quiz_which_telescope_launched_in__hash
1166. Engine: round-8 catalog export ca9_quiz_what_makes_lunar_regolith_us_hash
1167. Engine: round-8 catalog export ca9_quiz_what_did_the_sofia_observato_hash
1168. Engine: round-8 catalog export ca9_quiz_why_are_lava_tubes_interesti_hash
1169. Engine: round-8 catalog export ca9_quiz_what_is_isru_hash
1170. Engine: round-8 catalog export ca9_quiz_perchlorate_salts_in_martian_hash
1171. Engine: round-8 catalog export ca9_quiz_which_apollo_mission_turned__hash
1172. Engine: round-8 catalog export ca9_quiz_why_does_a_greenhouse_on_mar_hash
1173. Engine: round-8 catalog export ca9_quiz_what_is_a_fair_first_power_s_hash
1174. Engine: round-8 catalog export ca9_achievements_firstsol_hash
1175. Engine: round-8 catalog export ca9_achievements_power50_hash
1176. Engine: round-8 catalog export ca9_achievements_science100_hash
1177. Engine: round-8 catalog export ca9_achievements_shield3_hash
1178. Engine: round-8 catalog export ca9_achievements_sol15_hash
1179. Engine: round-8 catalog export ca9_achievements_sol30_hash
1180. Engine: round-8 catalog export ca9_achievements_fullhouse_hash
1181. Engine: round-8 catalog export ca9_achievements_quiz5_hash
1182. Engine: round-8 catalog export ca9_achievements_selfsufficient_hash
1183. Engine: round-8 catalog export ca9_achievements_survivor_hash
1184. Engine: round-8 catalog export ca9_achievements_researcher_hash
1185. Engine: round-8 catalog export ca9_achievements_awayteam_hash
1186. Engine: round-8 catalog export ca9_achievements_veteran_hash
1187. Engine: round-8 catalog export ca9_achievements_nightowl_hash
1188. Engine: round-8 catalog export ca9_achievements_closedloop2_hash
1189. Engine: round-8 catalog export ca9_achievements_highscore_hash
1190. Engine: round-8 catalog export ca9_achievements_crosstrained_hash
1191. Engine: round-8 catalog export ca9_achievements_farmer_hash
1192. Feature deck button r370a
1193. Feature deck button r370b
1194. Feature deck button r370c
1195. Feature deck button r370d
1196. Feature deck button r370e
1197. Feature deck button r370f
1198. Feature deck button r370g
1199. Feature deck button r370h
1200. Feature deck button r370i
1201. Feature deck button r370j
1202. Feature deck button r370k
1203. Feature deck button r370l
1204. Feature deck button r370m
1205. Feature deck button r370n
1206. Feature deck button r370o
1207. Feature deck button r370p
1208. Feature deck button r370q
1209. Feature deck button r370r
1210. Feature deck button r370s
1211. Feature deck button r370t

## Data and sources

Challenge statement: nasaspaceapps.ae/challenges (Junior Astronaut Mission Trainer). All science facts in the quiz are from well-known NASA mission records (MOXIE, SOFIA, Artemis, JWST, ISS, Apollo 13, Opportunity). No external data calls; the game runs fully offline.

## Tested

`node test.js` — 875 checks (62 original + 102 round-4 + 66 round-5 + 61 round-6 + 124 round-7 + 380 round-8 + 80 round-9) covering engine rules, resource math, role effects, tech effects, expeditions, scenarios, sandbox behavior, advisor triggers, forecast correctness and a full playthrough that wins. All pass on Node 22. Round-4 tests cover the new buildings, techs, expeditions, events, ops actions, analytics functions, objective modes, grading and exports. Round-5 tests cover the briefing, runway, plans, advisors, checklists, CSV/JSON/markdown exports, integrity checker and state hash. Round-6 tests cover the new mission-analytics engine functions: resource aggregates, crew metrics, building and tech counters, objective progress, reserve warnings and per-crew ratios.

## Untested

Browser UI interactions (rendered DOM, buttons, localStorage) were checked by code review and syntax validation only, not in a live browser. Sound is not implemented.
