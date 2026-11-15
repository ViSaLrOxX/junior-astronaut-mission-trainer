# Junior Astronaut Mission Trainer

NASA Space Apps 2026 challenge #1. A browser-based base-management game for kids (and judges) that teaches real mission trade-offs on the Moon and Mars: power, oxygen, water, food, shielding, crew health and morale. Fully offline: open `index.html` and play.

## Features (152)

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

Winner-inspired patterns (verified 2025 global winners, per NASA's announcement): design-then-validate simulation like PureFlow's habitat validator; best-window/risk guidance like SkySense; mini-game teaching real constraints like Zumorroda-X; kid-facing storytelling like HerCode.

## Data and sources

Challenge statement: nasaspaceapps.ae/challenges (Junior Astronaut Mission Trainer). All science facts in the quiz are from well-known NASA mission records (MOXIE, SOFIA, Artemis, JWST, ISS, Apollo 13, Opportunity). No external data calls; the game runs fully offline.

## Tested

`node test.js` — 130 checks (62 original + 40 round-4 + 28 round-5) covering engine rules, resource math, role effects, tech effects, expeditions, scenarios, sandbox behavior, advisor triggers, forecast correctness and a full playthrough that wins. All pass on Node 22. Round-4 tests cover the new buildings, techs, expeditions, events, ops actions, analytics functions, objective modes, grading and exports. Round-5 tests cover the briefing, runway, plans, advisors, checklists, CSV/JSON/markdown exports, integrity checker and state hash.

## Untested

Browser UI interactions (rendered DOM, buttons, localStorage) were checked by code review and syntax validation only, not in a live browser. Sound is not implemented.
