#!/usr/bin/env python3
"""Free, offline sound-effect adapter (GEN_SFX contract, ADAPTERS.md) for this project.

    sfx-offline.py "<prompt>" <out.wav> --seconds N --seed N

Synthesises a sound from a keyword in the prompt: vortex, whip, thud, drip, trumpet, munch,
pop, knock, bonk, sparkle, crackle, crickets. Deterministic for a prompt and seed.
"""
import argparse
import wave

import numpy as np

p = argparse.ArgumentParser()
p.add_argument("prompt"); p.add_argument("out")
p.add_argument("--seconds", type=float, default=2); p.add_argument("--seed", type=int, default=1)
a = p.parse_args()
SR = 44100
n = int(a.seconds * SR)
t = np.arange(n) / SR
rng = np.random.default_rng(a.seed)
x = np.zeros(n)
q = a.prompt.lower()


def env(at, attack, decay):
    e = np.clip((t - at) / attack, 0, 1) * np.exp(-np.clip(t - at - attack, 0, None) * decay)
    return np.where(t >= at, e, 0)


def tone(f, at, decay, amp, attack=0.002):
    return amp * np.sin(2 * np.pi * f * (t - at)) * env(at, attack, decay)


def noise_band(lo, hi):
    spec = np.fft.rfft(rng.standard_normal(n))
    fr = np.fft.rfftfreq(n, 1 / SR)
    spec[(fr < lo) | (fr > hi)] = 0
    y = np.fft.irfft(spec, n)
    return y / (np.abs(y).max() + 1e-9)


if "vortex" in q:
    f = 200 + 1400 * (t / a.seconds) ** 2
    x = (np.sin(2 * np.pi * np.cumsum(f) / SR) * 0.5 + 0.5 * np.sin(2 * np.pi * np.cumsum(f * 1.5) / SR)) * np.sin(np.pi * np.clip(t / 1.1, 0, 1)) ** 2
    x += 0.25 * noise_band(800, 5000) * np.sin(np.pi * np.clip(t / 1.1, 0, 1)) ** 3
elif "whip" in q:
    x = noise_band(600, 6000) * np.exp(-((t - 0.18) / 0.06) ** 2)
elif "thud" in q:
    x = tone(70, 0.0, 14, 1.0) + 0.5 * noise_band(100, 1200) * env(0, 0.002, 25)
elif "drip" in q:
    for k, at in enumerate([0.0, 0.45]):
        f = 1200 * (1 + 0.8 * np.exp(-np.clip(t - at, 0, None) * 60))
        x += 0.6 * np.sin(2 * np.pi * np.cumsum(f) / SR) * env(at, 0.001, 30)
elif "trumpet" in q:
    # two blasts, a short one and a long one, with a growling flutter
    for at, d, top in [(0.0, 0.28, 300), (0.36, 0.9, 420)]:
        tt = np.clip(t - at, 0, None)
        f = (200 + top * np.sin(np.pi * np.clip(tt / d, 0, 1))) * (1 + 0.03 * np.sin(2 * np.pi * 9 * tt))
        ph = np.cumsum(np.where(t >= at, f, 0)) / SR
        saw = sum(np.sin(2 * np.pi * k * ph) / k for k in range(1, 9))
        flutter = 0.55 + 0.45 * np.sin(2 * np.pi * 23 * tt)
        x += saw * flutter * np.where((t >= at) & (t < at + d), np.clip(tt / 0.02, 0, 1) * np.exp(-tt * 2.2), 0)
elif "munch" in q:
    for at in [0.0, 0.22, 0.44]:
        x += noise_band(1500, 7000) * env(at, 0.003, 30) * 0.8
elif "pop" in q:
    x = tone(650, 0, 40, 0.9) + 0.2 * noise_band(1000, 4000) * env(0, 0.001, 80)
elif "knock" in q:
    x = tone(1900, 0, 70, 0.7) + tone(540, 0, 35, 0.5) + 0.5 * noise_band(2000, 8000) * env(0, 0.001, 90)
elif "bonk" in q:
    f = 520 * np.exp(-t * 3)
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * env(0, 0.002, 7)
elif "sparkle" in q:
    for k, (f, at) in enumerate([(1568, 0), (2093, 0.08), (2637, 0.16), (3136, 0.24)]):
        x += tone(f, at, 6, 0.4)
elif "crackle" in q:
    for _ in range(int(16 * a.seconds)):
        at = rng.uniform(0, a.seconds - 0.05)
        x += noise_band(1500, 6000) * env(at, 0.0005, rng.uniform(150, 400)) * rng.uniform(0.2, 1)
elif "cricket" in q:
    for c in range(int(a.seconds * 2.2)):
        at = c / 2.2 + rng.uniform(0, 0.1)
        for p_ in range(3):
            x += tone(4300, at + p_ * 0.045, 80, 0.5)
x /= np.abs(x).max() + 1e-9
with wave.open(a.out, "wb") as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((x * 0.8 * 32767).astype(np.int16).tobytes())
