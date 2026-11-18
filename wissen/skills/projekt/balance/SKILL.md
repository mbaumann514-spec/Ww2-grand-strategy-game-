---
name: balance
description: Run the headless campaign and read it for balance faults — blobbing, runaway treasuries, a static map, collapsing population, cost per simulated day. Use after any change to the rules, the AI or the tunable numbers.
---

# The headless run, and how to read it

```bash
./gradlew :sim:headless --args="--years 125 --seed 1"
```

`--years`, `--turns` and `--seed` are the arguments. Run more than one seed
before believing anything; one seed is an anecdote.

## What the report is read for

- **Blobbing.** One realm swallowing the map is the classic failure. France
  should end the fourteenth century roughly the size it started it. Count the
  realms alive at the end against the 93 that start.
- **A static map.** The opposite failure and the easier one to miss: if almost
  no province changes hands in a century, the war system is not reaching the
  map. Count provinces that changed hands.
- **Treasuries.** Realms hoarding six figures mean the spending rules do not
  bind; realms all past their treasury mean an AI spends without a surplus
  rule. Both have happened here.
- **Population.** The plague should cut it and it should recover. A curve that
  only falls is a bug in the yearly systems.
- **Cost per simulated day.** Printed by the runner in microseconds. A frame is
  16,667 µs; a day should be a small fraction of one, because a player can hold
  the clock at speed 4 while the map is drawn at 60 fps.

## The discipline

- Compare against the last figures recorded in `docs/ROADMAP.md`, and add the
  new ones there when they move.
- A balance change is not finished until the run is read; *"it compiles"* is not
  a result and neither is *"the tests pass"*.
- When the report shows something absurd, chase the cause rather than tuning it
  away. Every anomaly this project has had — the 2891-day levy, the building AI
  ruining 82 of 91 realms, the crossbow beating the longbow at everything — was
  a model fault wearing a number's clothes.
