#!/usr/bin/env python3
"""Free, offline music bed for this project: a gentle plucked pentatonic tune over a soft hand drum.

    python3 scripts/make-music.py <seconds> assets/music/score.mp3

Deterministic (fixed seed), so the project renders again identically. Then run fit-music.py.
"""
import subprocess
import sys
import tempfile
import wave
from pathlib import Path

import numpy as np

SR = 44100
secs, out = float(sys.argv[1]), sys.argv[2]
n = int(secs * SR)
mix = np.zeros(n)
rng = np.random.default_rng(11000)
bpm = 96
beat = 60 / bpm
# D minor pentatonic, low and warm
scale = [146.83, 174.61, 196.00, 220.00, 261.63, 293.66, 349.23]


def pluck(f, dur, amp):
    t = np.arange(int(dur * SR)) / SR
    tone = sum((0.6 ** k) * np.sin(2 * np.pi * f * (k + 1) * t) for k in range(4))
    env = np.exp(-t * 3.2) * np.minimum(1, t / 0.006)
    return amp * tone * env


def drum(dur, amp, f0=95):
    t = np.arange(int(dur * SR)) / SR
    f = f0 * (1 + 0.6 * np.exp(-t * 30))
    return amp * np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 9)


def place(sig, at):
    i = int(at * SR)
    if i >= n:
        return
    j = min(n, i + len(sig))
    mix[i:j] += sig[: j - i]


# a repeating 4-bar phrase with small random variations
phrase = [0, 2, 3, 2, 4, 3, 2, 1, 0, 2, 3, 5, 4, 3, 2, 0]
t, k = 0.0, 0
while t < secs:
    deg = phrase[k % len(phrase)]
    if rng.random() < 0.2:
        deg = min(6, deg + 1)
    place(pluck(scale[deg], 1.6, 0.16), t)
    if k % 4 == 0:
        place(pluck(scale[0] / 2, 3.0, 0.14), t)  # bass drone note
    if k % 2 == 0:
        place(drum(0.6, 0.35), t)
    else:
        place(drum(0.4, 0.15, 140), t)
    t += beat
    k += 1

mix /= np.max(np.abs(mix)) + 1e-9
mix *= 0.7
pcm = (mix * 32767).astype(np.int16)
with tempfile.TemporaryDirectory() as d:
    wav = Path(d) / "m.wav"
    with wave.open(str(wav), "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(pcm.tobytes())
    Path(out).parent.mkdir(parents=True, exist_ok=True)
    subprocess.run(["ffmpeg", "-nostdin", "-y", "-v", "error", "-i", str(wav), "-af", "lowpass=f=5000",
                    "-b:a", "160k", out], check=True)
print(out)
