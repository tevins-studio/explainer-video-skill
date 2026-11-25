#!/usr/bin/env python3
"""Free Edge TTS speech adapter (GEN_SPEECH contract, ADAPTERS.md) for this project.

    speak-edge.py "<text>" <out.mp3> --voice en-GB-RyanNeural --model edge-tts

Routes through HTTPS_PROXY when one is set (a locked-down network). EDGE_RATE sets the pace,
e.g. "-4%". Paid-only flags are rejected, as the contract asks of the free model.
"""
import argparse
import asyncio
import os
import sys
from pathlib import Path

p = argparse.ArgumentParser()
p.add_argument("text")
p.add_argument("out")
p.add_argument("--voice", default="en-GB-RyanNeural")
p.add_argument("--model", default="edge-tts")
for f in ("--language", "--stability", "--similarity", "--style", "--speed", "--previous-text", "--next-text"):
    p.add_argument(f, default=None)
a = p.parse_args()
if a.model != "edge-tts":
    sys.exit("this adapter speaks only edge-tts")
paid = [f for f in ("stability", "similarity", "style") if getattr(a, f) is not None]
if paid:
    sys.exit(f"edge-tts does not take {', '.join(paid)}")
import edge_tts  # noqa: E402

tmp = Path(a.out).with_suffix(".part.mp3")
comm = edge_tts.Communicate(a.text, a.voice, rate=os.environ.get("EDGE_RATE", "-4%"), proxy=os.environ.get("HTTPS_PROXY"))
asyncio.run(comm.save(str(tmp)))
if tmp.stat().st_size < 2000:
    sys.exit("edge-tts returned no audio")
tmp.replace(a.out)
