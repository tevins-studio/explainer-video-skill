#!/usr/bin/env python3
"""Offline, free speech adapter (GEN_SPEECH contract, ADAPTERS.md) for this project.

    speak-offline.py "<text>" <out.mp3> --voice mb-us2 --model espeak-ng [--speed 1.0]

Uses espeak-ng with an MBROLA diphone voice (apt install espeak-ng mbrola mbrola-us2).
No key, no network. Paid-only flags are rejected, as the contract asks of a free model.
"""
import argparse
import subprocess
import sys
import tempfile
from pathlib import Path

p = argparse.ArgumentParser()
p.add_argument("text")
p.add_argument("out")
p.add_argument("--voice", default="mb-us2")
p.add_argument("--model", default="espeak-ng")
p.add_argument("--speed", type=float, default=None)
for flag in ("--language", "--stability", "--similarity", "--style", "--previous-text", "--next-text"):
    p.add_argument(flag, default=None)
a = p.parse_args()
if a.model != "espeak-ng":
    sys.exit(f"unknown model {a.model}; this adapter speaks only espeak-ng")
paid = [f for f in ("stability", "similarity", "style") if getattr(a, f) is not None]
if paid:
    sys.exit(f"espeak-ng does not take {', '.join(paid)}")

wpm = round(150 * (a.speed or 1.0))
with tempfile.TemporaryDirectory() as d:
    wav = Path(d) / "raw.wav"
    subprocess.run(["espeak-ng", "-v", a.voice, "-s", str(wpm), "-p", "55", "-w", str(wav), a.text], check=True)
    if not wav.exists() or wav.stat().st_size < 2000:
        sys.exit("espeak-ng wrote no audio")
    tmp = Path(a.out).with_suffix(".part.mp3")
    # a touch of warmth: low-cut the rumble, soften the diphone edges
    subprocess.run(["ffmpeg", "-nostdin", "-y", "-v", "error", "-i", str(wav),
                    "-af", "highpass=f=80,lowpass=f=7000,aresample=44100",
                    "-ac", "1", "-b:a", "128k", str(tmp)], check=True)
    tmp.replace(a.out)
