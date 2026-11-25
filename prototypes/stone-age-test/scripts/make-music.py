#!/usr/bin/env python3
"""Free, offline music bed for the 30 s test: warm, curious documentary underscore.

    python3 scripts/make-music.py assets/music/score.wav

D major, 92 bpm. A soft pad on I-vi-IV-V, a plucked arpeggio, a gentle frame drum and a shaker.
The night scene (from NIGHT_S) drops the drums and thins the arpeggio; the cue ends on a held
tonic chord. Deterministic, so the project renders again identically.
"""
import sys
import wave

import numpy as np

SR = 44100
LEN = 30.4
NIGHT_S = 24.2
n = int(LEN * SR)
mix = np.zeros(n)
rng = np.random.default_rng(11000)
beat = 60 / 92
hz = lambda m: 440 * 2 ** ((m - 69) / 12)
t_all = np.arange(n) / SR


def add(sig, at, gain=1.0):
    i = int(at * SR)
    if i >= n:
        return
    j = min(n, i + len(sig))
    mix[i:j] += gain * sig[: j - i]


def pluck(f, dur=1.4, amp=0.2, bright=4):
    t = np.arange(int(dur * SR)) / SR
    tone = sum((0.55 ** k) * np.sin(2 * np.pi * f * (k + 1) * t) for k in range(bright))
    return amp * tone * np.exp(-t * 3.0) * np.minimum(1, t / 0.004)


def pad(freqs, dur, amp=0.05):
    t = np.arange(int(dur * SR)) / SR
    s = sum(np.sin(2 * np.pi * f * t + 0.3 * np.sin(2 * np.pi * 0.2 * t)) + 0.4 * np.sin(2 * np.pi * f * 2.003 * t) for f in freqs)
    env = np.minimum(1, t / 0.6) * np.minimum(1, (dur - t) / 0.6)
    return amp * s * env


def drum(amp=0.4, f0=80, dur=0.5):
    t = np.arange(int(dur * SR)) / SR
    f = f0 * (1 + 0.8 * np.exp(-t * 25))
    return amp * np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 8)


def shaker(amp=0.05, dur=0.08):
    t = np.arange(int(dur * SR)) / SR
    return amp * rng.standard_normal(len(t)) * np.exp(-t * 60)


chords = [[62, 66, 69], [59, 62, 66], [55, 59, 62], [57, 61, 64]]  # D, Bm, G, A
bar = 4 * beat
t, k = 0.0, 0
while t < LEN - 0.5:
    ch = chords[k % 4]
    night = t >= NIGHT_S
    dur = min(bar + 0.6, LEN - t)
    add(pad([hz(m - 12) for m in ch], dur, 0.045 if not night else 0.05), t)
    add(pluck(hz(ch[0] - 24), 2.4, 0.16, 3), t)  # bass
    for i in range(8):
        if night and i % 2:
            continue
        note = ch[[0, 1, 2, 1, 2, 0, 1, 2][i]] + (12 if i in (3, 6) else 0)
        add(pluck(hz(note), 1.2, 0.09 if not night else 0.07), t + i * beat / 2)
    if not night and t > 1.0:
        for i in range(4):
            add(drum(0.32 if i % 2 == 0 else 0.16, 80 if i % 2 == 0 else 120), t + i * beat)
            add(shaker(), t + i * beat + beat / 2)
    t += bar
    k += 1
# the ending: a held D chord
add(pad([hz(50), hz(57), hz(62), hz(66)], LEN - 27.2, 0.06), 27.2)
mix *= np.minimum(1, t_all / 0.8) * np.clip((LEN - t_all) / 1.2, 0, 1)
mix /= np.abs(mix).max() + 1e-9
mix *= 0.8
with wave.open(sys.argv[1], "wb") as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((mix * 32767).astype(np.int16).tobytes())
print(sys.argv[1])
