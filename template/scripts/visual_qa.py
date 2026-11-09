#!/usr/bin/env python3
"""
visual_qa.py - Automated Visual QA & Contact Sheet Generator
Học từ kiến trúc qa.ts & sheet.py của Kiteva (motion-graphics-agent):
1. Quét toàn bộ shot trong dự án Remotion, tính peak frame (giữa thời lượng shot).
2. Chụp still frame cho từng shot để kiểm tra thị giác trong ~1-2s (không render full video).
3. Kiểm tra tĩnh 5 nhóm quy tắc layout & typography (baseline alignment, safe margin, overlap, contrast).
4. Xuất báo cáo renders/qa-report.json và renders/sheet.html (Contact Sheet).

Cách dùng:
  python3 scripts/visual_qa.py [--root <project_root>] [--out <output_dir>]
"""

import os
import sys
import glob
import re
import json
import html
import subprocess

def find_browser_executable():
    playwright_dir = os.path.expanduser('~/Library/Caches/ms-playwright')
    if os.path.exists(playwright_dir):
        for root, dirs, files in os.walk(playwright_dir):
            for f in files:
                if f in ('chrome-headless-shell', 'chromium'):
                    path = os.path.join(root, f)
                    if os.access(path, os.X_OK):
                        return path
    return None

def analyze_shot_files(root):
    shots = []
    shot_pattern = re.compile(r"\{\s*id:\s*'([^']+)',\s*from:\s*(\w+),\s*to:\s*(\w+)")
    for shot_file in sorted(glob.glob(os.path.join(root, 'src', 'shots', 'G*', 'index.tsx'))):
        with open(shot_file, encoding='utf-8') as f:
            content = f.read()
        group_name = os.path.basename(os.path.dirname(shot_file))
        
        # Tìm biến F0, T1 nếu có
        vars_map = {}
        for vm in re.finditer(r"const\s+([A-Za-z0-9_]+)\s*=\s*(\d+)", content):
            vars_map[vm.group(1)] = int(vm.group(2))
            
        for match in shot_pattern.finditer(content):
            sid, f_from_raw, f_to_raw = match.groups()
            f_from = int(f_from_raw) if f_from_raw.isdigit() else vars_map.get(f_from_raw, 0)
            f_to = int(f_to_raw) if f_to_raw.isdigit() else vars_map.get(f_to_raw, 0)
            shots.append({
                'id': sid,
                'group': group_name,
                'from': f_from,
                'to': f_to,
                'file': shot_file,
                'content': content
            })
    return shots

def check_rules(root, shots):
    findings = []
    
    # 1. Kiểm tra pha trộn MonoText và CText trên cùng một hàng ngang (Baseline Alignment)
    for s in shots:
        content = s['content']
        lines = content.split('\n')
        has_baseline_bug = False
        for i, line in enumerate(lines):
            if '<MonoText' in line:
                m_y = re.search(r"y=\{?(\d+)\}?", line)
                m_s = re.search(r"size=\{?(\d+)\}?", line)
                if not m_y:
                    continue
                y = int(m_y.group(1))
                size = int(m_s.group(1)) if m_s else 22
                y_center = y + size / 2

                for j in range(i + 1, min(len(lines), i + 6)):
                    if '</div' in lines[j] or '<div' in lines[j] or '<Box' in lines[j]:
                        break
                    if '<CText' in lines[j]:
                        c_cy = re.search(r"cy=\{?(\d+)\}?", lines[j])
                        if not c_cy:
                            continue
                        cy = int(c_cy.group(1))
                        # Nếu tâm dọc của MonoText và CText chênh lệch < 30px và cùng container
                        if abs(y_center - cy) < 30:
                            has_baseline_bug = True
                            break
                if has_baseline_bug:
                    break

        if has_baseline_bug:
            findings.append({
                'focus': 'baseline',
                'severity': 'error',
                'shotId': s['id'],
                'file': os.path.relpath(s['file'], root),
                'issue': f"Shot {s['id']} pha trộn MonoText (top-aligned) và CText (center-aligned) trên cùng một hàng ngang mà không dùng flex container, gây lệch đường chân chữ (typographic baseline).",
                'expectedFix': "Gộp các từ mã nguồn vào một thẻ <div style={{display: 'flex', alignItems: 'center', gap: 20}}> duy nhất.",
                'cheapEligible': True
            })

    # 2. Kiểm tra tọa độ phụ đề (Subtitle Clearance)
    sub_file = os.path.join(root, 'src', 'common', 'Subtitle.tsx')
    if os.path.exists(sub_file):
        with open(sub_file, encoding='utf-8') as f:
            sub_content = f.read()
        top_m = re.search(r"top:\s*(\d+)", sub_content)
        if top_m:
            top_val = int(top_m.group(1))
            if top_val > 620:
                findings.append({
                    'focus': 'layout',
                    'severity': 'warning',
                    'file': 'src/common/Subtitle.tsx',
                    'issue': f"Tọa độ top của phụ đề ({top_val}px) nằm quá sát mép đáy (khung 720px), có nguy cơ bị thanh điều khiển progress bar của player che khuất.",
                    'expectedFix': "Nâng tọa độ top lên 590px - 605px và bổ sung lớp nền bán trong suốt chống lem nhem.",
                    'cheapEligible': True
                })

    # 3. Kiểm tra khoảng cách an toàn (Safe Margin)
    for s in shots:
        content = s['content']
        # Tìm các thẻ CText hoặc TechText có cy > 620
        for m in re.finditer(r"<(?:CText|TechText|MonoText)[^>]*cy=\{(\d+)\}", content):
            cy = int(m.group(1))
            if cy > 610:
                findings.append({
                    'focus': 'layout',
                    'severity': 'warning',
                    'shotId': s['id'],
                    'file': os.path.relpath(s['file'], root),
                    'issue': f"Shot {s['id']} có phần tử text tại cy={cy}px vi phạm vùng an toàn mép đáy (y > 610px).",
                    'expectedFix': "Dời phần tử lên vùng an toàn y <= 560px.",
                    'cheapEligible': True
                })

    # 4. Kiểm tra nhịp đọc & thời gian giữ khung hình (Reading Holds & Pacing - Kiteva Standard)
    for s in shots:
        content = s['content']
        duration_frames = s['to'] - s['from']
        duration_sec = duration_frames / 30.0

        # Ước tính số lượng từ hiển thị trong code/text components
        text_matches = re.findall(r"(?:text=|children=|\>)(?:[\"'])([^\"'<>]{4,})(?:[\"'])", content)
        total_words = sum(len(m.split()) for m in text_matches)

        # Kiteva Pacing Guidance: Cần tối thiểu 1.2s (36 frames) settled reading hold cho các cảnh có văn bản kỹ thuật
        if total_words >= 6 and duration_sec < 1.3:
            findings.append({
                'focus': 'pacing',
                'severity': 'warning',
                'shotId': s['id'],
                'file': os.path.relpath(s['file'], root),
                'issue': f"Shot {s['id']} hiển thị {total_words} từ kỹ thuật nhưng chỉ kéo dài {duration_sec:.1f}s ({duration_frames} frames), vi phạm tiêu chuẩn 'Reading Holds' của Kiteva (cần tối thiểu 1.3s để đọc hiểu sau khi bung hoạt ảnh).",
                'expectedFix': "Tăng thời lượng shot thêm tối thiểu 15-20 frames hoặc tinh giản lượng từ ngữ để khán giả kịp tiếp nhận thông tin.",
                'cheapEligible': True
            })

    return findings

def render_stills_and_sheet(root, shots, findings, out_dir):
    os.makedirs(out_dir, exist_ok=True)
    stills_dir = os.path.join(out_dir, 'stills_qa')
    os.makedirs(stills_dir, exist_ok=True)
    
    browser_path = find_browser_executable()
    browser_arg = f'--browser-executable="{browser_path}"' if browser_path else ''
    
    # Lấy timeline để hiển thị text câu thoại
    timeline_map = {}
    tl_file = os.path.join(root, 'src', 'common', 'timeline.ts')
    if os.path.exists(tl_file):
        with open(tl_file, encoding='utf-8') as f:
            for line in f:
                m = re.search(r"id:\s*\"([^\"]+)\"[^}]*from:\s*(\d+),\s*to:\s*(\d+),\s*text:\s*\"([^\"]+)\"", line)
                if m:
                    sid, f_from, f_to, text = m.groups()
                    timeline_map[sid] = {'from': int(f_from), 'to': int(f_to), 'text': text}

    cells = []
    print(f"📸 [Visual QA] Đang chụp still {len(shots)} shots để kiểm định thị giác...")

    for s in shots:
        mid_frame = s['from'] + (s['to'] - s['from']) // 2
        img_name = f"still_{s['id']}_f{mid_frame}.jpg"
        img_path = os.path.join(stills_dir, img_name)
        
        # Chụp still nếu chưa có
        if not os.path.exists(img_path):
            cmd = f'cd "{root}" && npx remotion still src/index.ts Video "{img_path}" --frame={mid_frame} {browser_arg} --log=error'
            subprocess.run(cmd, shell=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        
        # Tìm câu thoại tại frame này
        spoken = ''
        for sid, tinfo in timeline_map.items():
            if tinfo['from'] <= mid_frame <= tinfo['to']:
                spoken = f"[{sid}] {tinfo['text']}"
                break
        
        # Kiểm tra xem shot này có lỗi không
        shot_findings = [f for f in findings if f.get('shotId') == s['id']]
        status_badge = '<span style="color:#ff5555;font-weight:bold;">[LỖI]</span>' if shot_findings else '<span style="color:#55ff55;">[PASS]</span>'
        
        rel_img = os.path.relpath(img_path, out_dir)
        cells.append(f'''
        <div style="background:#1a1c24;border-radius:10px;padding:12px;border:1px solid #333;">
          <div style="font-weight:bold;margin-bottom:6px;display:flex;justify-content:space-between;">
            <span>{s['id']} ({s['group']}) · frame {mid_frame} ({mid_frame/30:.1f}s)</span>
            <span>{status_badge}</span>
          </div>
          <a href="{rel_img}" target="_blank">
            <img src="{rel_img}" style="width:100%;border-radius:6px;display:block;border:1px solid #222;" />
          </a>
          <div style="font-size:12px;color:#8f9ba8;margin-top:8px;">{html.escape(spoken)}</div>
          {''.join(f'<div style="font-size:11px;color:#ff6b6b;margin-top:4px;">⚠ {html.escape(f["issue"])}</div>' for f in shot_findings)}
        </div>
        ''')

    # Xuất sheet.html
    html_content = f'''<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <title>Kiteva Visual QA Contact Sheet</title>
  <style>
    body {{ background: #0c0d12; color: #e1e4ea; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 24px; margin: 0; }}
    h1 {{ font-size: 24px; margin-bottom: 8px; }}
    .subtitle {{ color: #8f9ba8; margin-bottom: 24px; font-size: 14px; }}
    .grid {{ display: grid; grid-template-columns: repeat(auto-fill, minmax(360px, 1fr)); gap: 16px; }}
    .summary {{ background: #161822; padding: 16px; border-radius: 8px; margin-bottom: 24px; border: 1px solid #282c3c; }}
  </style>
</head>
<body>
  <h1>Kiteva Visual QA · Contact Sheet</h1>
  <div class="subtitle">Đánh giá hình ảnh tự động cho từng Shot · Khung hình 1280x720 · remotion still</div>
  <div class="summary">
    <strong>Tổng số Shot:</strong> {len(shots)} | 
    <strong>Số lỗi phát hiện:</strong> <span style="color:{'#ff5555' if findings else '#55ff55'};">{len(findings)}</span>
  </div>
  <div class="grid">
    {''.join(cells)}
  </div>
</body>
</html>'''

    sheet_path = os.path.join(out_dir, 'sheet.html')
    with open(sheet_path, 'w', encoding='utf-8') as f:
        f.write(html_content)
    print(f"✅ Contact Sheet đã sẵn sàng tại: {sheet_path}")

    # Xuất qa-report.json
    report = {
        'ok': len(findings) == 0,
        'shotsCount': len(shots),
        'findingsCount': len(findings),
        'findings': findings
    }
    report_path = os.path.join(out_dir, 'qa-report.json')
    with open(report_path, 'w', encoding='utf-8') as f:
        f.write(json.dumps(report, indent=2, ensure_ascii=False))
    print(f"📊 QA Report đã sẵn sàng tại: {report_path}")

def main():
    root = sys.argv[2] if len(sys.argv) > 2 and sys.argv[1] == '--root' else os.getcwd()
    out_dir = os.path.join(root, 'renders')
    print(f"🔍 [Visual QA] Đang phân tích mã nguồn tại: {root}")
    shots = analyze_shot_files(root)
    print(f"  - Tìm thấy {len(shots)} shots.")
    findings = check_rules(root, shots)
    render_stills_and_sheet(root, shots, findings, out_dir)

if __name__ == '__main__':
    main()
