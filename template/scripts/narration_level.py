#!/usr/bin/env python3
"""
narration_level.py — Broadcast-grade voiceover loudness normalization (EBU R128)
Adapted from Kiteva (motion-graphics-agent/src/server/audio/narration-level.ts).

Standard:
- Target integrated loudness: -18 LUFS (standard for web voiceover & video)
- True Peak limit: -1.5 dBTP (prevents clipping across lossy AAC/MP3 codecs)
- Two-pass:
  Pass 1: Measure input_i via loudnorm filter in null sink.
  Pass 2: Apply dynamic linear gain, 192kHz peak limiter, downsample to 48kHz 24-bit PCM.
"""

import argparse
import json
import os
import re
import subprocess
import sys
import tempfile
from pathlib import Path


def measure_loudness(input_wav: Path) -> float:
    cmd = [
        "ffmpeg",
        "-hide_banner",
        "-i",
        str(input_wav),
        "-af",
        "loudnorm=I=-18:TP=-1.5:LRA=11:print_format=json",
        "-f",
        "null",
        "-",
    ]
    res = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
    combined = res.stderr + "\n" + res.stdout
    match = re.search(r"\{[^{}]*\"input_i\"[^{}]*\}", combined, re.DOTALL)
    if not match:
        raise RuntimeError(f"Could not extract loudnorm JSON from FFmpeg output:\n{combined[-500:]}")
    
    data = json.loads(match.group(0))
    val = data.get("input_i")
    if val == "-inf":
        return float("-inf")
    return float(val)


def normalize_voice(input_wav: Path, output_wav: Path, target_lufs: float = -18.0, volume: float = 1.0) -> dict:
    if not input_wav.exists():
        raise FileNotFoundError(f"Input audio file not found: {input_wav}")

    measured_i = measure_loudness(input_wav)
    if measured_i == float("-inf"):
        gain = 0.0
        gain_db = 0.0
    else:
        gain_db = target_lufs - measured_i
        gain = (10 ** (gain_db / 20.0)) * volume

    output_wav.parent.mkdir(parents=True, exist_ok=True)
    temp_out = output_wav.with_suffix(f".tmp_{os.getpid()}.wav")

    # Limit ratio for -1.5 dBTP is 10^(-1.5/20) ~= 0.841395
    limit_val = 0.841395

    filter_chain = (
        f"volume={gain:.6f},"
        f"aresample=192000,"
        f"alimiter=limit={limit_val}:level=false:latency=true,"
        f"aresample=48000"
    )

    cmd = [
        "ffmpeg",
        "-y",
        "-v",
        "error",
        "-i",
        str(input_wav),
        "-af",
        filter_chain,
        "-c:a",
        "pcm_s24le",
        str(temp_out),
    ]
    subprocess.run(cmd, check=True)

    # Get duration
    probe_cmd = [
        "ffprobe",
        "-v",
        "error",
        "-show_entries",
        "format=duration",
        "-of",
        "default=noprint_wrappers=1:nokey=1",
        str(temp_out),
    ]
    dur_str = subprocess.check_output(probe_cmd, text=True).strip()
    duration = float(dur_str) if dur_str else 0.0

    temp_out.replace(output_wav)

    return {
        "ok": True,
        "input": str(input_wav),
        "output": str(output_wav),
        "measured_lufs": measured_i,
        "target_lufs": target_lufs,
        "gain_db": round(gain_db, 2),
        "duration": round(duration, 3),
    }


def main():
    parser = argparse.ArgumentParser(description="Broadcast audio loudness normalization (EBU R128)")
    parser.add_argument("input", help="Path to input audio file (.wav, .mp3, etc.)")
    parser.add_argument("--output", "-o", help="Path to output .wav file (defaults to overwrite input)")
    parser.add_argument("--target", "-t", type=float, default=-18.0, help="Target LUFS (default: -18.0)")
    parser.add_argument("--volume", "-v", type=float, default=1.0, help="Volume multiplier (default: 1.0)")
    parser.add_argument("--json", action="store_true", help="Print JSON result")

    args = parser.parse_args()
    inp = Path(args.input).resolve()
    out = Path(args.output).resolve() if args.output else inp

    res = normalize_voice(inp, out, target_lufs=args.target, volume=args.volume)
    if args.json:
        print(json.dumps(res, indent=2))
    else:
        print(f"✓ Normalized {inp.name} -> {out.name}")
        print(f"  Measured: {res['measured_lufs']} LUFS | Target: {res['target_lufs']} LUFS | Gain: {res['gain_db']:+} dB | Duration: {res['duration']}s")


if __name__ == "__main__":
    main()
