# The battle

The author, 18 November 2026: *"das Combat soll ähnlich wie Hearts of Iron sein, studier das."*

**Design precedent, named as the house rule asks:** the land combat of the Hearts of Iron series (Paradox). What is
taken is how it works; what is not taken is any name of its invented systems, any text, icon, screen or unit value
(the lawyer's pre-check, §9: mechanics are free, their expression is not; never "an identical row of combat values").
The study behind this page was made from search excerpts of that game's public wiki and from general knowledge: the
wiki itself could not be opened from the build environment, and where the two disagreed the more cautious reading was
taken. The terms and every number here are this game's own, in `data/rules.json` with their reasoning.

## What was taken, as mechanics

1. **Two things wear down: organisation fast, strength slowly.** A battle is won on organisation; the men are lost
   later, or all at once in a pocket.
2. **Fire is of two kinds**, against men and against armour, and a division draws each in proportion to how much of
   it is armour.
3. **A division can take so much under cover**: one figure while it defends, another, much smaller for infantry and
   much larger for armour, while it attacks. Attacks within that are hit seldom; attacks on top of it are hit nearly
   four times as often. So a line breaks where more comes at it than it can take, and cover beyond what comes is wasted.
4. **Plate against guns**: a division whose armour the enemy's guns cannot go through draws less of his fire and
   shakes him more.
5. **Frontage**: the ground has room for so many divisions, more if the attack comes from several sides; the rest
   wait behind and step in fresh. Too many on one side get in each other's way.
6. **Works, rivers, landings, ground, weather, supply, digging in** change how much fire and cover a side has, not
   what a hit does. Each further direction of attack turns one level of a fortified line.
7. **No way back, no division**: a defender with no friendly region behind it fights worse and is lost when it breaks.

## What is this game's own

- **A day at a time**, not an hour: one exchange a day, computed as the expected number of hits with one roll of
  luck for the day (from the seed), so that the same seed makes the same war.
- **The line is chosen anew each day**, the freshest divisions first: tired ones step back by themselves. There is
  no hourly chance to reinforce and no list of tactics drawn by generals.
- **The names**: fire, antiTank, armoured, hold, drive, plate, pierce, front; frontage, stack, focus.
- **The numbers**: every one of them, set from what the arms could do in 1939-41 and tuned on the headless run.
- **What the computer asks before it attacks**: one day of the battle as it would go (`Game.clash`), fought if it
  costs the defender more than the attacker by the odds its generals want.
- Organisation does not lower a division's fire; strength does.

## Where it is

`sim/…/Game.kt`: `clash` (one day, changes nothing; the computer uses it to judge an attack), `volley` (one side's
hits on the other), `fireOn`, `attackerShare`, `defenderShare`, `line`, `fight` (applies the day). Units and ground:
`data/rules.json`, `units` and `terrain`; the battle's rules: `combat`. `SimTest` holds the heart of it: infantry
alone loses more than it costs attacking a held line; armour takes far less going in.

## Not yet

Aircraft over the battle, generals, experience, a planned offensive's preparation, night. Named in `docs/ROADMAP.md`.
