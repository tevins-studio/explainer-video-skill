#!/usr/bin/env python3
"""Shorten long pauses in the levelled voice lines and record where each phrase starts.

    python3 scripts/tighten-pauses.py        (run from the project root, after level-voices.py)

The free voice leaves about one second between sentences: too slow for a 30 s cut. Every pause
longer than MAX_PAUSE is cut down to it at its middle (pauses are found by level, 20 ms windows
below -38 dB of the peak, as SKILL.md asks). Lead-in and tail silence are trimmed too.
Rewrites assets/voice-norm and public/voice-norm, updates voice_s and frames in storyboard.json,
and writes src/cues.json: per beat, the frame (inside the beat) where each phrase starts.
Scenes key their actions to these cues, so a new take moves the action with the words.
"""
import json
import math
import shutil
import subprocess

import numpy as np

SR = 44100
WIN = int(0.02 * SR)
MAX_PAUSE = 0.45
LEAD = 0.06
TAIL = 0.18
MIN_GAP = 0.18  # a pause at least this long starts a new phrase (cue)
FPS = 30

sb = json.load(open("storyboard.json", encoding="utf-8"))
cues = {}
for b in sb["beats"]:
    path = f"assets/voice-norm/{b['id']}.wav"
    x = np.frombuffer(subprocess.run(["ffmpeg", "-nostdin", "-v", "error", "-i", path, "-f", "f32le", "-ac", "1", "-ar", str(SR), "-"],
                                     capture_output=True, check=True).stdout, np.float32).copy()
    n = len(x) // WIN
    db = 20 * np.log10(np.sqrt(np.mean(x[: n * WIN].reshape(n, WIN) ** 2, axis=1)) + 1e-9)
    loud = db > db.max() - 38
    idx = np.flatnonzero(loud)
    first, last = idx[0], idx[-1]
    # runs of silence between first and last
    runs, k = [], first
    while k <= last:
        if not loud[k]:
            j = k
            while j <= last and not loud[j]:
                j += 1
            runs.append((k, j))
            k = j
        else:
            k += 1
    out, starts, t_out = [], [], 0.0
    a0 = max(0, first * WIN - int(LEAD * SR))
    seg_start = first * WIN
    out.append(x[a0:seg_start]); t_out += (seg_start - a0) / SR
    starts.append(t_out)
    for (s, e) in runs:
        dur = (e - s) * WIN / SR
        out.append(x[seg_start:s * WIN]); t_out += (s * WIN - seg_start) / SR
        keep = min(dur, MAX_PAUSE)
        mid = (s + e) * WIN // 2
        half = int(keep * SR / 2)
        out.append(x[mid - half:mid + half]); t_out += 2 * half / SR
        seg_start = e * WIN
        if dur >= MIN_GAP:
            starts.append(t_out)
    end = min(len(x), (last + 1) * WIN + int(TAIL * SR))
    out.append(x[seg_start:end])
    y = np.concatenate(out)
    tmp = f"/tmp/tight-{b['id']}.f32"
    y.astype(np.float32).tofile(tmp)
    subprocess.run(["ffmpeg", "-nostdin", "-v", "error", "-y", "-f", "f32le", "-ar", str(SR), "-ac", "1", "-i", tmp,
                    "-c:a", "pcm_s16le", path], check=True)
    shutil.copy(path, f"public/voice-norm/{b['id']}.wav")
    b["voice_s"] = round(len(y) / SR, 3)
    b["frames"] = math.ceil(len(y) / SR * FPS)
    cues[b["id"]] = [round(s * FPS) for s in starts]
    print(f"{b['id']}: {b['voice_s']:.2f}s  phrases at frames {cues[b['id']]}")
json.dump(sb, open("storyboard.json", "w", encoding="utf-8"), indent=1, ensure_ascii=False)
json.dump(cues, open("src/cues.json", "w"), indent=1)
