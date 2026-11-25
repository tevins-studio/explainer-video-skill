<!-- router: Stone Age style test — 30 s test rendered 2026-11-25: out/stone-age-test-30s.mp4 (1080p, Edge Ryan); waiting on the user's review before the full documentary -->
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
| `Test30` | `storyboard.json` (5 beats, absolute `start`) | `out/stone-age-test-30s.mp4` — the 30 s test, 1080p |

## Status

- 2026-11-25: 30 s test rendered, `out/stone-age-test-30s.mp4` (1920×1080, 30 fps, 900 frames).
  Edge Ryan narration, offline music and effects. `check-audio.py` passes on the mix and the
  mp4; `edge-scan.py` 0 runs; every cut checked frame by frame. Waiting on the user's review.
- 2026-11-25: corrected direction: white stickman heads and bodies, black outlines and limbs,
  coloured clothing; the monkey in his original colours. New expressive face system
  (`src/stick/Face.tsx`, 18 moods). Sent `work/review-v4/`: monkey sheet, expressions sheet,
  the sample scene in two beats, the cast. No video until approved.
- 2026-11-25: characters made strictly black and white (monkey and cast); backgrounds unchanged.
  Updated monkey sheet and sample scene sent (`work/review-v3/`). Voice chosen: Edge Ryan.
  Next, after approval: the 30 s test at 1080p.
- 2026-11-25: the full-cartoon characters were rejected (too childish). Rebuilt every character
  as a polished stickman (`src/stick/`), backgrounds kept. Sent: the stickman monkey sheet, one
  sample scene (berries), the stick cast and ten voice samples (Edge TTS and Kokoro, British).
  Waiting on approval; no test video until then.
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

The 30 s test, from scratch (free tools only):

```bash
export GEN_SPEECH="python3 $PWD/scripts/speak-edge.py" GEN_SFX="python3 $PWD/scripts/sfx-offline.py" EDGE_RATE="+2%"
python3 scripts/regen-voices.py edge-tts        # Edge Ryan; only changed lines are re-spoken
python3 scripts/level-voices.py
python3 scripts/tighten-pauses.py               # trims long pauses, writes src/cues.json
node scripts/gen-envelopes.mjs
python3 scripts/gen-sfx-set.py                  # sfx.json, synthesised offline
python3 scripts/make-music.py assets/music/score.wav
ffmpeg -y -i assets/music/score.wav -af "acompressor=threshold=-18dB:ratio=3:attack=5:release=80,alimiter=limit=0.7" -b:a 192k public/music.mp3
npx remotion render src/index.ts Test30 work/mix/mix.wav && python3 scripts/check-audio.py work/mix/mix.wav
npx remotion render src/index.ts Test30 out/stone-age-test-30s.mp4
python3 scripts/check-audio.py out/stone-age-test-30s.mp4 && python3 scripts/edge-scan.py out/stone-age-test-30s.mp4
```

Scene slots (frames): s1 0–156, s2 156–336, s3 336–534, s4 534–726, s5 726–900. Each line's
absolute `start` is in `storyboard.json`; actions key to the phrase cues in `src/cues.json`.

Add `--browser-executable=<local chrome-headless-shell>` if Remotion cannot download its Chrome.

Voices: Edge TTS (`pip install edge-tts`; host speech.platform.bing.com; pass the HTTPS proxy to
`Communicate(proxy=...)` behind a proxy) and Kokoro (`pip install kokoro-onnx`; model and voices
from huggingface.co/onnx-community/Kokoro-82M-v1.0-ONNX, kept in `~/.cache/kokoro/`).

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
- `src/stick/Stickman.tsx`, `src/stick/Face.tsx`, `src/stick/stickCast.tsx` — the stickman rig, its expressive face (18 moods) and the cast (current).
- `src/test30/Test30.tsx` — the 30 s test: five scenes, transitions, captions, music ducking, effect cues.
- `src/sheets/StickSheets.tsx` — the stickman approval sheets (`StickMonkey`, `StickScene`, `StickCast`).
- `src/sheets/` — the earlier cartoon sheets and style frames (rejected, kept for the sets).

## Decisions

- 2026-11-25 (supersedes the black-and-white note below): white stickman heads and bodies, black
  outlines, features and limbs, coloured clothing. The monkey keeps his original colours (brown
  head and tail, cream face and muzzle, dark tuft, blue shirt, red tie, black trousers).
  Expressive faces comparable to the reference: eyes that change shape and direction, moving
  brows, real mouth shapes. Colourful backgrounds unchanged. Voice: Edge Ryan. 1080p.
- 2026-11-25: all characters strictly black and white: black outlines, limbs and features, white
  faces and bodies, no colour on any character (the monkey keeps his shapes: ears, muzzle, tuft,
  shirt and tie, black trousers, tail). Colourful backgrounds stay as a separate element. Voice
  for the test: Edge TTS en-GB-RyanNeural. Test video at 1080p after approval. No paid costs.
- 2026-11-25: characters are polished stickmen (round heads, small faces, thin black limbs,
  colour only on clothing and key details); the cartoon rig in `src/toon/Figure.tsx` is retired
  for characters. Backgrounds stay full-colour and layered. A light keyline keeps the figures
  readable. Piper rejected as too robotic; testing Edge TTS and Kokoro for a natural British
  narrator. Free tools only, ask before any cost.
- 2026-11-24: new direction approved: full-colour cartoon, Ink Explainer quality as the bar, own
  artwork. Monkey design kept exactly (brown, cream face, ears, tuft, blue shirt, red tie, dark
  trousers, curling tail). Piper for the voice, never eSpeak. Free tools only. Approval of the
  designs before the test video; approval of the test before the documentary.
