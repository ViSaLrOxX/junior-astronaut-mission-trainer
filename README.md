# Junior Astronaut Mission Trainer

NASA Space Apps 2026 challenge prototype: an interactive outpost-management game where students run a lunar south-pole or Martian base, balancing power, oxygen, water, food and radiation shielding.

## Run it

Open `index.html` in any modern browser. No server, build step or network needed.

## Play

- Pick a site (Moon or Mars), difficulty (Cadet / Explorer / Commander) and a mission seed.
- Press "Advance one sol" to simulate each day.
- Build solar arrays, RTGs, O2 generators, ice extractors, greenhouses, habitats, shielding works, med bays, labs, comms dishes and drills. Power is allocated by priority each sol; starved buildings go offline.
- Crew consume oxygen, water and food every sol. Radiation erodes health unless you bury habitats under regolith. Med bays heal.
- A resupply pod lands every 7 sols. Every 5 sols Mission Control asks a quiz question drawn from real NASA mission facts; correct answers earn parts and science.
- Random events: dust storms (Mars), micrometeorites, moonquakes, solar particle events, illness, ice finds, relay passes.
- Win by reaching the science goal by the deadline with crew alive. Lose if all crew die.
- Achievements, save/load (localStorage), and a downloadable mission report.

## Tested

`node test.js` — 20 checks over the simulation engine (determinism, resource bounds, build/repair/recruit rules, quiz rewards, win and loss paths, 12-seed stress run). All passing at delivery.

## Honest limits

- Numbers (consumption rates, yields, radiation) are gameplay values inspired by published figures, not engineering data.
- The UI was verified by code-level checks and engine tests; no browser screenshot review was possible in the build environment.
