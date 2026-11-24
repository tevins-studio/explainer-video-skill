#!/usr/bin/env python3
"""Free, offline sound-effect adapter (GEN_SFX contract, ADAPTERS.md) for this project.

    sfx-offline.py "<prompt>" <out.wav> --seconds N --seed N

Synthesises a few simple sounds from a keyword in the prompt: knock, whoosh, crackle, pop, step.
"""
import argparse
import wave

import numpy as np

p = argparse.ArgumentParser()
p.add_argument("prompt")
p.add_argument("out")
p.add_argument("--seconds", type=float, default=2)
p.add_argument("--seed", type=int, default=1)
a = p.parse_args()
SR = 44100
n = int(a.seconds * SR)
t = np.arange(n) / SR
rng = np.random.default_rng(a.seed)
x = np.zeros(n)
q = a.prompt.lower()


def hit(at, f, decay, amp, noise=0.3):
    i = int(at * SR)
    m = min(n - i, int(0.4 * SR))
    tt = np.arange(m) / SR
    s = np.sin(2 * np.pi * f * tt) + noise * rng.standard_normal(m)
    x[i:i + m] += amp * s * np.exp(-tt * decay)


if "knock" in q or "stone" in q:
    hit(0.0, 1800, 60, 0.9, 0.8)
    hit(0.0, 520, 35, 0.5, 0.2)
elif "whoosh" in q:
    env = np.exp(-((t - 0.25) / 0.12) ** 2)
    f = 300 + 900 * np.clip(t / 0.5, 0, 1)
    x = env * (np.sin(2 * np.pi * np.cumsum(f) / SR) * 0.4 + 0.25 * rng.standard_normal(n))
elif "crackle" in q or "fire" in q:
    for _ in range(int(14 * a.seconds)):
        hit(rng.uniform(0, a.seconds - 0.05), rng.uniform(1500, 4000), rng.uniform(120, 300),
            rng.uniform(0.2, 0.9), 1.5)
elif "pop" in q:
    hit(0.0, 700, 40, 0.8, 0.05)
else:  # step
    hit(0.0, 160, 40, 0.8, 0.6)

x /= np.max(np.abs(x)) + 1e-9
pcm = (x * 0.8 * 32767).astype(np.int16)
with wave.open(a.out, "wb") as w:
    w.setnchannels(1)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes(pcm.tobytes())
