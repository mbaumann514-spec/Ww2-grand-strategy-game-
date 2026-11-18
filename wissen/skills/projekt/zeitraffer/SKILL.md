---
name: zeitraffer
description: Make a time-lapse or gameplay video of the map for the author (60 fps, 1080x2400) — real history sped up or a staged conquest. Use when the author asks for a video, a Zeitraffer, or a clip of realms growing.
---

# Videos for the author

A tool for the assistant, not part of the game. The author asked (12 October
2026) for time-lapses of the map alone, "nicht zum Spiel, nur für dich". Nothing
here ships: the harness flags live in `lwjgl3/`, and the one hook in
`CampaignScreen` (`filmMapOnly`) is never set by the game itself.

## The one command

```bash
tools/zeitraffer.sh --help
# real history, 30 years in 15 s, camera on Constantinople
tools/zeitraffer.sh --years 30 --on constantinople --zoom 3,3.8 --out byz.mp4
# staged: Byzantium takes Anatolia province by province
tools/zeitraffer.sh --conquer byz:bithynia,marmara_bursa,ionia,phrygia,ankara --on phrygia --zoom 4.2,5.2
```

About 4 minutes for 15 seconds. Frames go to a temporary folder; the video is
written where `--out` says (use the scratchpad, then `SendUserFile`).

## Captions and voice

`--captions "0.3-3.6:First line.|3.8-7.6:Second line."` burns captions into the
film in the game's own heading face, on a dark plate with gilt rules, fading
in and out. `--voice FILE` lays a spoken track under the video.

Voice, as it stood on 12 October 2026: the neural voices are out of reach
here -- the Hugging Face speech Space is disabled for the session
(`gradio=none`), model downloads from Hugging Face and GitHub are blocked, and
the auto-mode check refuses model weights repackaged on npm. What works is
eSpeak NG from PyPI (`espeakng-loader`, in a venv in the scratchpad) driven by
`tools/sprecher.py`, one line per caption, then made graver in ffmpeg:

```bash
python -I tools/sprecher.py l1.wav en-gb+m3 135 28 "Thirteen thirty-seven. ..."
ffmpeg -i l1.wav -af "asetrate=22050*0.9,aresample=44100,atempo=1.111,equalizer=f=150:t=q:w=1:g=5,lowpass=f=6000,aecho=0.8:0.6:70|140:0.25|0.15,volume=1.6" -ac 2 p1.wav
```

Place the lines with `adelay` at the captions' start times (fit the captions
to the spoken lengths, not the other way round), lay *The Britons* (CC0,
`data/music/`) under them at about 0.2, and pass the mix as `--voice`. It
still sounds synthetic; say so. Never clone a real person's voice -- the
Chatterbox Space's default reference is a game actor's voice.

## Rules

- **Staged is staged.** `--conquer` hands provinces over by script; the video
  is named `…-inszeniert.mp4` and the author is told it is not gameplay. Never
  offer it as a store video or say it was played.
- Before staging, check what the real game does (`--years`, or
  `./gradlew :sim:headless --args="--years 30 --seed 1"`) and tell him.
- Read a few frames back as images before sending (`ffmpeg -ss T -frames:v 1`).
- Videos stay private, like everything made from the repository.
- Province ids: `data/scenarios/1335_europe/provinces.json` (`owner` field).

## The harness flags underneath

`--film 1 --film-fps 60` (every frame a sixtieth of a second, whatever the
machine took), `--film-zoom A,B` with `--film-on PROVINCE`, `--film-map-only`
(no interface; a clock dial with day, month and year in a corner), `--film-days N` (N real days a frame),
`--film-conquer R:words` -- the words in order: province ids; `@cultures=a+b` (every county of those peoples not yet listed, nearest first, outward from what the realm has); `!prefix` (leave such counties out); `#Name` (rename the realm there); `war:id` (go to war with a realm there, whose hosts then fight on the map) -- with `--film-color "#34343c"` (staged: the realm declares war on the owners, raises its levies and marches its hosts on each place before it changes hands), `--press` for taps (`auto_deploy;confirm`
plays a battle staged with `--battle`). Without `--film-map-only` the full
screen is filmed, as in the battle clip of 12 October.
