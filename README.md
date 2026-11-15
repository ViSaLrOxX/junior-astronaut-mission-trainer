# Junior Astronaut Mission Trainer

NASA Space Apps 2026 challenge #1. A browser-based base-management game for kids (and judges) that teaches real mission trade-offs on the Moon and Mars: power, oxygen, water, food, shielding, crew health and morale. Fully offline: open `index.html` and play.

## Features (52)

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

Winner-inspired patterns (verified 2025 global winners, per NASA's announcement): design-then-validate simulation like PureFlow's habitat validator; best-window/risk guidance like SkySense; mini-game teaching real constraints like Zumorroda-X; kid-facing storytelling like HerCode.

## Data and sources

Challenge statement: nasaspaceapps.ae/challenges (Junior Astronaut Mission Trainer). All science facts in the quiz are from well-known NASA mission records (MOXIE, SOFIA, Artemis, JWST, ISS, Apollo 13, Opportunity). No external data calls; the game runs fully offline.

## Tested

`node test.js` — 62 checks covering engine rules, resource math, role effects, tech effects, expeditions, scenarios, sandbox behavior, advisor triggers, forecast correctness and a full playthrough that wins. All pass on Node 22.

## Untested

Browser UI interactions (rendered DOM, buttons, localStorage) were checked by code review and syntax validation only, not in a live browser. Sound is not implemented.
