<!-- router: Stone Age style test (5 scenes) — status: design sheets and style frames sent for approval 2026-11-24, no test video yet -->
# stone-age-test — Stone Age style test: 5 scenes, full-colour cartoon, monkey presenter

## What it is

A 30–40 s visual test of the new house style (brief: `in/brief.md`). Full-colour cartoon with
a reusable character rig, the monkey presenter in every scene, layered environments, Piper
narration. English. No brand logo. Five scenes: presenter close-up + time-travel transition,
Ice Age valley, gathering berries, stone tools, campfire.

## Compositions

| Id | Storyboard | Output |
|---|---|---|
| `SheetMonkey`, `SheetFaces`, `SheetCast` | — | design sheets → `work/review/` |
| `Style1` … `Style5` | — | style frames → `work/review/` |
| `Full` | `storyboard.json` | `out/stone-age-test-full.mp4` (after approval) |

## Status

- 2026-11-24: rig, cast, scenery kit and five sets built. Design sheets, five style frames and a
  3 s motion clip sent for approval. Piper voice samples sent. Waiting on approval before the
  storyboard, voices and the test render.

## Render

```bash
cd prototypes/stone-age-test
# node_modules is a symlink to ../prehistoric-day/node_modules (run npm install there, or here)
npx remotion studio src/index.ts                       # browse every sheet and frame live
npx remotion still src/index.ts Style2 work/stills/style2.png --frame=20
npx remotion render src/index.ts SheetMonkey work/review/5-monkey-motion.mp4
```

Add `--browser-executable=<local chrome-headless-shell>` if Remotion cannot download its Chrome.

Piper voices live outside the project, in `~/.cache/piper/` (`pip install piper-tts`; models
from huggingface.co/rhasspy/piper-voices).

## Layout

Follows `SCHEMA.md` of the explainer-video skill (layout schema v1).
Check it: `python3 -I ../../explainer-video/scripts/check-layout.py "$PWD"`.

Deviations: none. No `public/characters/` images: every character is drawn in code by
`src/toon/Figure.tsx` from `src/toon/cast.tsx`, so no pose or face can drift.
`work/review/` holds the approval sheets (scratch: they render again from `src/`).

## Code map

- `src/toon/palette.ts` — the house palette.
- `src/toon/Figure.tsx` — the rig: limbs, clothing, hands, tail, head, 13 expressions, lip-sync.
- `src/toon/cast.tsx` — the cast records (monkey, Ama, Tuk, Oru, Nana, Bek).
- `src/toon/poses.ts` — poses, walk and run cycles.
- `src/toon/props.tsx`, `src/toon/scenery.tsx` — props and scenery pieces.
- `src/toon/sets.tsx` — the five layered sets with a parallax camera.
- `src/sheets/` — the approval sheets and style frames.

## Decisions

- 2026-11-24: new direction approved: full-colour cartoon, Ink Explainer quality as the bar, own
  artwork. Monkey design kept exactly (brown, cream face, ears, tuft, blue shirt, red tie, dark
  trousers, curling tail). Piper for the voice, never eSpeak. Free tools only. Approval of the
  designs before the test video; approval of the test before the documentary.
