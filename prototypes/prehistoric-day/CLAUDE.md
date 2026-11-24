<!-- router: 3-scene stick-figure prototype, "A day in the life of prehistoric humans" — status: preview rendered 2026-11-24, out/prehistoric-day-preview.mp4 -->
# prehistoric-day — A day in the life of prehistoric humans, ~11,000 years ago

## What it is

A 3-scene animated prototype for the YouTube channel, in the channel's hand-drawn stick-figure
style. English, one voice (the monkey guide), burned-in subtitles, no brand logo.
Scenes: 1) the landscape, the guide walks in (6.4 s); 2) gathering berries and knapping flint,
the guide copies the strike (7.2 s); 3) around the campfire at night (6.4 s).
With the 3 s title card and the 4 s closing slide: 27 s.
Everything is free and offline: the art is SVG drawn in code, the voice is espeak-ng + MBROLA,
the music and the sound effects are synthesised by project scripts.

## Compositions

| Id | Storyboard | Output |
|---|---|---|
| `Full` | `storyboard.json` | `out/prehistoric-day-preview.mp4` (prototype preview) |
| `Body` | `storyboard.json` | audio-only check mix (`work/mix/mix.wav`) |

## Status

- 2026-11-24: preview rendered. `check-audio.py` passes on the mix and on the mp4
  (`--offset 3`), `edge-scan.py` finds 0 runs, `check-layout.py` passes.

## Render

```bash
cd prototypes/prehistoric-day
npm install
# one-time system tools for the free voice
apt-get install -y espeak-ng mbrola mbrola-us2

export GEN_SPEECH="python3 $PWD/scripts/speak-offline.py"
export GEN_SFX="python3 $PWD/scripts/sfx-offline.py"
python3 scripts/regen-voices.py espeak-ng && python3 scripts/level-voices.py && node scripts/gen-envelopes.mjs
python3 scripts/gen-sfx-set.py
python3 scripts/make-music.py 21 assets/music/score.mp3 && python3 scripts/fit-music.py assets/music/score.mp3

npx remotion studio src/index.ts                                   # live preview in a browser
npx remotion render src/index.ts Body work/mix/mix.wav && python3 scripts/check-audio.py work/mix/mix.wav
npx remotion render src/index.ts Full out/prehistoric-day-preview.mp4
python3 scripts/check-audio.py out/prehistoric-day-preview.mp4 --offset 3
```

If Remotion cannot download its headless Chrome (a locked-down network), add
`--browser-executable=<path to a local chrome-headless-shell>` to `still` and `render`.

## Layout

Follows `SCHEMA.md` of the explainer-video skill (layout schema v1).
Check it: `python3 -I ../../explainer-video/scripts/check-layout.py "$PWD"`.

Deviations: none. No `public/characters/` images: the figures are drawn in code
(`src/Stick.tsx`), as SKILL.md suggests for exact poses. `src/Character.tsx` and
`src/NarratorOrb.tsx` from the starter are kept but unused.

## Code map

- `src/Stick.tsx` — the stick figure and the `Monkey` guide (one component, so he never drifts).
- `src/Scenes.tsx` — the three scenes, camera, hand-drawn line boil, props.
- `src/Body.tsx` — beat → scene map, transitions (paper wipe, iris to the fire), sound cues.
- `src/Frame.tsx` — title card and closing slide, with the guide waving.
- `scripts/speak-offline.py`, `scripts/sfx-offline.py`, `scripts/make-music.py` — free, offline
  stand-ins for the speech, sound-effect and music adapters.

## Decisions

- 2026-11-24: free tools only, no paid APIs (user). Art drawn in code instead of an image model.
- 2026-11-24: preview voice espeak-ng + MBROLA `mb-us2`: the free edge-tts host was blocked by the
  build environment's network. Swap in edge-tts or a paid voice for the final by changing
  `voices.guide.voice_id` and `GEN_SPEECH`, then rerun the voice steps.
- 2026-11-24: subtitles burned in, no logo, no URL on the closing slide (assumed for the
  prototype; confirm for the final).
