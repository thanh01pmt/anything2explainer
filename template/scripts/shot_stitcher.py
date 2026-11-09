#!/usr/bin/env python3
"""
shot_stitcher.py — Modular Shot Renderer & Stream-Copy Concatenator
Inspired by Kiteva (motion-graphics-agent/src/server/rendering/multiplane.ts).

Key Capabilities:
1. Render individual shots independently into `renders/shots/<shot_id>.mp4`.
2. Fast stitch all shots via FFmpeg concat protocol (-c copy) without re-encoding (< 1s).
3. Mux broadcast-normalized narration audio (EBU R128) into the final stitched master.
4. Incremental update: Modify only 1 shot -> Re-render only that shot -> Re-stitch instantly.
"""

import argparse
import json
import os
import re
import subprocess
import sys
from pathlib import Path


def find_browser_executable():
    env_path = os.environ.get("VIDEO_BROWSER_PATH")
    if env_path and os.path.exists(env_path):
        return env_path
    cache_base = Path.home() / "Library" / "Caches" / "ms-playwright"
    if cache_base.exists():
        for p in cache_base.glob("**/chrome-headless-shell"):
            if p.is_file() and os.access(p, os.X_OK):
                return str(p)
    system_chrome = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
    if os.path.exists(system_chrome):
        return system_chrome
    return None


def discover_shots(root: Path):
    """Scan src/shots/G*/index.tsx and resolve shot id + frame bounds."""
    shots_dir = root / "src" / "shots"
    if not shots_dir.exists():
        return []

    shots = []
    shot_pattern = re.compile(r"\{\s*id:\s*['\"]([^'\"]+)['\"],\s*from:\s*(\w+),\s*to:\s*(\w+)")

    for gdir in sorted(shots_dir.glob("G*")):
        idx = gdir / "index.tsx"
        if not idx.exists():
            continue
        content = idx.read_text(encoding="utf-8")
        group_name = gdir.name

        # Parse variables like const F0 = 0, T1 = 280
        vars_map = {}
        for vm in re.finditer(r"(?:const|let)\s+([A-Za-z0-9_]+)\s*=\s*(\d+)", content):
            vars_map[vm.group(1)] = int(vm.group(2))

        for match in shot_pattern.finditer(content):
            sid, f_from_raw, f_to_raw = match.groups()
            f_from = int(f_from_raw) if f_from_raw.isdigit() else vars_map.get(f_from_raw, 0)
            f_to = int(f_to_raw) if f_to_raw.isdigit() else vars_map.get(f_to_raw, 0)

            shots.append({
                "id": sid,
                "group": group_name,
                "from": f_from,
                "to": f_to,
                "duration": f_to - f_from + 1,
                "file": str(idx),
            })

    # Sort shots by start frame
    shots.sort(key=lambda s: s["from"])
    return shots


def find_main_composition(root: Path) -> str:
    root_file = root / "src" / "Root.tsx"
    if root_file.exists():
        content = root_file.read_text(encoding="utf-8")
        if 'id="Video"' in content:
            return "Video"
        if 'id="Main"' in content:
            return "Main"
        m = re.search(r'<Composition\s+id=[\'"]([^\'"]+)[\'"]', content)
        if m:
            return m.group(1)
    return "Video"


def render_single_shot(root: Path, shot: dict, out_dir: Path) -> Path:
    out_dir.mkdir(parents=True, exist_ok=True)
    shot_video = out_dir / f"{shot['id']}.mp4"

    comp_id = find_main_composition(root)
    browser = find_browser_executable()
    cmd = [
        "npx",
        "remotion",
        "render",
        "src/index.ts",
        comp_id,
        f"--frames={shot['from']}-{shot['to']}",
        f"--output={shot_video}",
        "--gl=angle",
        "--pixel-format=yuv420p",
        "--codec=h264",
        "--muted",
        "--log=warn",
    ]
    if browser:
        cmd.append(f"--browser-executable={browser}")

    print(f"🎥 [Render Shot] {shot['id']} (frames {shot['from']}..{shot['to']}, {shot['duration']} frames)...")
    subprocess.run(cmd, cwd=root, check=True)
    return shot_video


def stitch_shots(shot_videos: list[Path], output_video: Path, audio_file: Path = None):
    output_video.parent.mkdir(parents=True, exist_ok=True)
    concat_list = output_video.parent / "concat_shots.txt"
    with open(concat_list, "w", encoding="utf-8") as f:
        for sv in shot_videos:
            f.write(f"file '{sv.resolve()}'\n")

    silent_stitched = output_video.with_suffix(".silent.mp4")

    # Fast stream-copy concat
    print("⚡ [Concat] Nối các shot bằng FFmpeg Stream Copy (-c copy) không re-encode...")
    cmd_concat = [
        "ffmpeg",
        "-y",
        "-v",
        "error",
        "-f",
        "concat",
        "-safe",
        "0",
        "-i",
        str(concat_list),
        "-c",
        "copy",
        str(silent_stitched),
    ]
    subprocess.run(cmd_concat, check=True)

    if audio_file and audio_file.exists():
        print(f"🎵 [Muxing] Ghép track âm thanh {audio_file.name}...")
        cmd_mux = [
            "ffmpeg",
            "-y",
            "-v",
            "error",
            "-i",
            str(silent_stitched),
            "-i",
            str(audio_file),
            "-map",
            "0:v:0",
            "-map",
            "1:a:0",
            "-c:v",
            "copy",
            "-c:a",
            "aac",
            "-b:a",
            "192k",
            str(output_video),
        ]
        subprocess.run(cmd_mux, check=True)
        silent_stitched.unlink(missing_ok=True)
    else:
        silent_stitched.replace(output_video)

    concat_list.unlink(missing_ok=True)
    print(f"✅ Hoàn tất video master: {output_video}")


def main():
    parser = argparse.ArgumentParser(description="Modular Shot Renderer & Concat Stitcher")
    parser.add_argument("--shot", help="Render only a specific shot ID (e.g. SC08, SC02)")
    parser.add_argument("--all", action="store_true", help="Render all missing or outdated shots")
    parser.add_argument("--stitch", action="store_true", help="Stitch all rendered shots into final video")
    parser.add_argument("--audio", help="Optional audio file to mux into final video (.wav)")
    parser.add_argument("--output", "-o", default="renders/master_stitched.mp4", help="Output final video path")

    args = parser.parse_args()
    root = Path.cwd()
    shots = discover_shots(root)
    if not shots:
        print("❌ Không tìm thấy shot nào trong src/shots/")
        sys.exit(1)

    shots_dir = root / "renders" / "shots"
    shots_map = {s["id"]: s for s in shots}

    if args.shot:
        target = shots_map.get(args.shot)
        if not target:
            print(f"❌ Shot ID '{args.shot}' không tồn tại. Danh sách có sẵn: {list(shots_map.keys())}")
            sys.exit(1)
        render_single_shot(root, target, shots_dir)

    if args.all:
        for s in shots:
            shot_file = shots_dir / f"{s['id']}.mp4"
            if not shot_file.exists():
                render_single_shot(root, s, shots_dir)

    if args.stitch or (not args.shot and not args.all):
        # Collect ordered shot files
        ordered_files = []
        for s in shots:
            sv = shots_dir / f"{s['id']}.mp4"
            if not sv.exists():
                print(f"⚠️ Shot {s['id']} chưa được render ({sv.name}). Đang tự động render...")
                render_single_shot(root, s, shots_dir)
            ordered_files.append(sv)

        out_path = Path(args.output).resolve()
        audio_path = Path(args.audio).resolve() if args.audio else None
        stitch_shots(ordered_files, out_path, audio_path)


if __name__ == "__main__":
    main()
