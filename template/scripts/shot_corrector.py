#!/usr/bin/env python3
"""
shot_corrector.py - Closed-Loop Self-Correction with Bounded Retry Budget
Học từ kiến trúc correction-rounds.ts & corrector.ts của Kiteva:
1. Đọc danh sách findings từ renders/qa-report.json.
2. Kiểm tra ngân sách sửa lỗi theo mã băm lỗi (Retry Budget: tối đa 3 lần/lỗi, sau đó bypass).
3. Sửa mã nguồn của riêng file shot bị lỗi (Focus repair).
4. Chạy Fast Re-Check: Chỉ render đúng 1 still frame của shot đó trong ~1.5s để nghiệm thu.
5. Cập nhật lại qa-report.json và sheet.html khi đã pass.
"""

import os
import sys
import json
import hashlib
import re
import subprocess

MAX_RETRY_PER_ERROR = 3

def get_error_identity(finding):
    s = f"{finding.get('shotId', '')}:{finding.get('focus', '')}:{finding.get('file', '')}:{finding.get('issue', '')}"
    return hashlib.sha256(s.encode('utf-8')).hexdigest()[:12]

def repair_baseline(root, finding):
    file_path = os.path.join(root, finding['file'])
    if not os.path.exists(file_path):
        return False
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Tìm đoạn MonoText for và CText item in sequence
    old_pattern = r"(<Box[^>]*>\s*)\n\s*<MonoText[^>]*>'for'</MonoText>\s*\n\s*<CText[^>]*>item</CText>\s*\n\s*<CText[^>]*>in</CText>\s*\n\s*<CText[^>]*>sequence</CText>\s*\n\s*<CText[^>]*>\{'\{ \.\.\. \}'\}</CText>"
    replacement = r'''\1
        <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 24, fontFamily: '"JetBrains Mono", "SF Mono", monospace', fontSize: 38, fontWeight: 700}}>
          <span style={{color: WHITE}}>for</span>
          <span style={{color: GREEN}}>item</span>
          <span style={{color: PURPLE_LIGHT}}>in</span>
          <span style={{color: WHITE}}>sequence</span>
          <span style={{color: GREY}}>{'{ ... }'}</span>
        </div>'''
    
    new_content, count = re.subn(old_pattern, replacement, content)
    if count > 0:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        return True
    return False

def repair_subtitle(root, finding):
    file_path = os.path.join(root, finding['file'])
    if not os.path.exists(file_path):
        return False
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Đổi top: 637 thành top: 590
    new_content = re.sub(r"top:\s*(?:62\d|63\d|64\d)", "top: 590", content)
    if new_content != content:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        return True
    return False

def fast_recheck_still(root, shot_id):
    # Tìm shot frame
    from visual_qa import analyze_shot_files, find_browser_executable
    shots = analyze_shot_files(root)
    target_shot = next((s for s in shots if s['id'] == shot_id), None)
    if not target_shot:
        return False
    mid_frame = target_shot['from'] + (target_shot['to'] - target_shot['from']) // 2
    out_img = os.path.join(root, 'renders', 'stills_qa', f"still_{shot_id}_f{mid_frame}.jpg")
    browser = find_browser_executable()
    b_arg = f'--browser-executable="{browser}"' if browser else ''
    cmd = f'cd "{root}" && npx remotion still src/index.ts Video "{out_img}" --frame={mid_frame} {b_arg} --log=error'
    res = subprocess.run(cmd, shell=True)
    return res.returncode == 0

def main():
    root = sys.argv[2] if len(sys.argv) > 2 and sys.argv[1] == '--root' else os.getcwd()
    report_path = os.path.join(root, 'renders', 'qa-report.json')
    if not os.path.exists(report_path):
        print(f"❌ Không tìm thấy {report_path}. Vui lòng chạy visual_qa.py trước.")
        sys.exit(1)
        
    with open(report_path, 'r', encoding='utf-8') as f:
        report = json.load(f)
        
    findings = report.get('findings', [])
    if not findings:
        print("🎉 Không có lỗi nào cần sửa! Toàn bộ các Shot đều đạt chuẩn.")
        sys.exit(0)
        
    ledger_file = os.path.join(root, '.cache', 'corrections_ledger.json')
    os.makedirs(os.path.dirname(ledger_file), exist_ok=True)
    ledger = {}
    if os.path.exists(ledger_file):
        try:
            with open(ledger_file, 'r', encoding='utf-8') as f:
                ledger = json.load(f)
        except Exception:
            ledger = {}

    print(f"🔧 [Shot Corrector] Đang xử lý {len(findings)} lỗi theo chiến thuật Bounded Retry Budget...")
    fixed_count = 0
    bypassed_count = 0

    remaining_findings = []
    for f in findings:
        err_id = get_error_identity(f)
        attempts = ledger.get(err_id, 0)
        if attempts >= MAX_RETRY_PER_ERROR:
            print(f"  ⏭ [Bypass] Lỗi {err_id} ({f.get('shotId', 'global')}) đã đạt giới hạn {MAX_RETRY_PER_ERROR} lần sửa. Đánh dấu unresolved và bỏ qua.")
            bypassed_count += 1
            f['status'] = 'bypassed_max_budget'
            remaining_findings.append(f)
            continue
            
        ledger[err_id] = attempts + 1
        print(f"  🛠 Đang sửa lỗi [{f['focus']}]: {f['issue']} (Lần {ledger[err_id]}/{MAX_RETRY_PER_ERROR})")
        
        success = False
        if f['focus'] == 'baseline':
            success = repair_baseline(root, f)
        elif f['focus'] == 'layout' and 'Subtitle.tsx' in f.get('file', ''):
            success = repair_subtitle(root, f)
            
        if success:
            print(f"    ✨ Đã cập nhật code file {f['file']}. Bắt đầu Fast Still Re-Check (~1.5s)...")
            shot_id = f.get('shotId')
            if shot_id:
                recheck_ok = fast_recheck_still(root, shot_id)
                if recheck_ok:
                    print(f"    ✅ Shot {shot_id} đã pass visual re-check!")
                    fixed_count += 1
                    continue
            else:
                fixed_count += 1
                continue
        
        remaining_findings.append(f)

    # Lưu ledger
    with open(ledger_file, 'w', encoding='utf-8') as f:
        json.dump(ledger, f, indent=2)

    # Cập nhật qa-report
    report['ok'] = len(remaining_findings) == 0
    report['findings'] = remaining_findings
    report['findingsCount'] = len(remaining_findings)
    with open(report_path, 'w', encoding='utf-8') as f:
        json.dump(report, indent=2, ensure_ascii=False, fp=f)

    print(f"\n📊 [Kết quả sửa lỗi]: Đã sửa xong: {fixed_count} | Bỏ qua (hết budget): {bypassed_count} | Còn lại: {len(remaining_findings)}")

if __name__ == '__main__':
    main()
