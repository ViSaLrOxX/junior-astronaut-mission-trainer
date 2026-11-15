# Junior Astronaut Mission Trainer

A small browser game about running a Moon or Mars base. You pick a site and a difficulty, then keep a crew alive sol by sol: power, oxygen, water, food, shielding and morale all pull against each other.

## Running it

Open index.html in any browser. No build step, no server, no network.

First-timers get a short guided tour that walks through setup, launch, the gauges, building, research and living sol by sol. It can be skipped and reopened any time with the How to play button.

The game is split into three rooms, switched from the top: Mission, Learn & play, and Reports. Each room opens as a menu of cards, and each card opens one dedicated workbench: the status board, the build yard, research, crew, expeditions, the log, quizzes, drills, the daily briefing, the passport, charts, briefings and downloads. One thing fills the screen at a time, and a Back to menu button returns to the cards. Pressing Advance one sol brings up the status board so you can watch the gauges move, and when Mission Control calls with a quiz, it opens on its own. Workbenches and rooms fade in gently, bars ease as values change, and motion stays off for anyone with reduced-motion turned on. The dense analysis panels stay hidden until Commander mode is switched on. To run the logic tests: node test.js.

## What's inside

Two real sites (lunar south pole, Jezero rim) with different radiation, ice and storm profiles. Fourteen building types, six named crew with roles and XP, random mission events drawn from a fixed-seed deck so runs are reproducible, and twenty achievements.

A workbench panel turns the live mission into readable tables: crew shape, resource runways, science pace, power margin, danger score and win odds, plus CSV and markdown exports of the whole run.

Alongside the sim there is a quiz deck about the Moon and Mars, a drill mode that tests you on the event deck, a daily briefing card with a streak counter, a knowledge passport that tracks which facts you have mastered, a twenty-question quiz marathon with lives, an event timeline you can filter by site, and an achievement checklist that reads your unlocked set from local storage.

## Data

Site parameters, events and quiz facts are baked into engine.js as plain data tables. Nothing is fetched at runtime.
