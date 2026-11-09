#!/usr/bin/env python3
"""
render_cache.py - Quản lý Render Checkpoint & Incremental Cache theo từng Shot
Học từ kiến trúc Render Cache Recovery của Kiteva (motion-graphics-agent):
- Tính toán mã băm SHA-256 của từng file component shot trong src/shots/
- Lưu trữ trạng thái trong .cache/shot_manifest.json
- Cho phép xác định chính xác shot nào cần render lại, shot nào được tái sử dụng 100% video
"""

import os
import sys
import json
import glob
import hashlib
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CACHE_DIR = ROOT / ".cache"
MANIFEST_FILE = CACHE_DIR / "shot_manifest.json"

def sha256_file(filepath: Path) -> str:
    h = hashlib.sha256()
    with open(filepath, "rb") as f:
        while chunk := f.read(8192):
            h.update(chunk)
    return h.hexdigest()

def scan_shots():
    shots = {}
    pattern = str(ROOT / "src" / "shots" / "G*" / "*.tsx")
    for filepath in glob.glob(pattern):
        p = Path(filepath)
        if p.name.startswith("Preview") or p.name.startswith("index"):
            continue
        shot_id = p.stem  # vd: SC01, SC02
        shots[shot_id] = {
            "path": str(p.relative_to(ROOT)),
            "hash": sha256_file(p),
            "size": p.stat().st_size,
            "mtime": p.stat().st_mtime,
        }
    return shots

def check_cache():
    CACHE_DIR.mkdir(parents=True, exist_ok=True)
    current_shots = scan_shots()
    
    previous_manifest = {}
    if MANIFEST_FILE.is_file():
        try:
            previous_manifest = json.loads(MANIFEST_FILE.read_text(encoding="utf-8"))
        except Exception:
            previous_manifest = {}

    unchanged = []
    modified = []
    new_shots = []

    for shot_id, info in current_shots.items():
        if shot_id not in previous_manifest:
            new_shots.append(shot_id)
        elif previous_manifest[shot_id]["hash"] == info["hash"]:
            unchanged.append(shot_id)
        else:
            modified.append(shot_id)

    deleted = [s for s in previous_manifest if s not in current_shots]

    return {
        "current": current_shots,
        "unchanged": unchanged,
        "modified": modified,
        "new": new_shots,
        "deleted": deleted,
        "cache_hit_rate": (len(unchanged) / len(current_shots) * 100) if current_shots else 0
    }

def record_cache():
    shots = scan_shots()
    CACHE_DIR.mkdir(parents=True, exist_ok=True)
    MANIFEST_FILE.write_text(json.dumps(shots, indent=2), encoding="utf-8")
    print(f"✅ [render_cache] Đã ghi nhận snapshot mã băm cho {len(shots)} shots vào {MANIFEST_FILE}")

def main():
    args = sys.argv[1:]
    if "--record" in args:
        record_cache()
        return

    result = check_cache()
    total = len(result["current"])
    print(f"📊 [render_cache] Trạng thái Cache ({total} shots):")
    print(f"   - Tái sử dụng (Unchanged): {len(result['unchanged'])} shots ({result['cache_hit_rate']:.1f}%)")
    print(f"   - Thay đổi (Modified)    : {len(result['modified'])} shots {result['modified']}")
    print(f"   - Mới tạo (New)          : {len(result['new'])} shots {result['new']}")
    if result["deleted"]:
        print(f"   - Đã xóa (Deleted)       : {len(result['deleted'])} shots {result['deleted']}")

    if len(result["modified"]) == 0 and len(result["new"]) == 0 and total > 0:
        print("⚡️ [CACHE 100% HIT] Toàn bộ shots không thay đổi mã nguồn! Có thể tái sử dụng bản render.")
    else:
        print(f"🔨 Cần re-render: {len(result['modified']) + len(result['new'])} shots.")

if __name__ == "__main__":
    main()
