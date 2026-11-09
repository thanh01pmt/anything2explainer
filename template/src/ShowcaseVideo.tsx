import React from 'react';
import { AbsoluteFill, Sequence, useCurrentFrame, staticFile, interpolate } from 'remotion';
import { Fonts, clamp01, easeOutCubic } from './common';
import { DuotoneImage, KenBurns, getColBox, SplitCard, SineWaveCanvas } from './ui';
import { DrawPath, ScanlineOverlay, BoundingBoxTracker, BlueprintGrid } from './fx';

// ==========================================
// SCENE 1: SWISS / MINIMALIST GRID (Frames 0-120)
// ==========================================
const SwissScene: React.FC = () => {
  const frame = useCurrentFrame();
  const enter = clamp01(frame / 20);
  const enterEased = easeOutCubic(enter);

  return (
    <AbsoluteFill style={{ backgroundColor: '#FAF5E9', color: '#1A1A1A', fontFamily: 'sans-serif' }}>
      {/* Top Header Grid */}
      <div style={{ position: 'absolute', left: 80, top: 40, right: 80, display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #1A1A1A', paddingBottom: 12 }}>
        <span style={{ fontSize: 16, fontWeight: 700, letterSpacing: 2 }}>STYLE 01 // SWISS MODERNIST</span>
        <span style={{ fontSize: 16, fontWeight: 700, color: '#D32F2F' }}>12-COLUMN MODULAR GRID</span>
      </div>

      {/* Main Title & Lead */}
      <div style={{ ...getColBox(1, 7, 120, 220), transform: `translateY(${(1 - enterEased) * 30}px)`, opacity: enter }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: '#D32F2F', marginBottom: 8, letterSpacing: 3 }}>
          INTERNATIONAL TYPOGRAPHIC
        </div>
        <div style={{ fontSize: 68, fontWeight: 900, lineHeight: 1.05, letterSpacing: -1 }}>
          Rigor, Clarity, & Pure Code.
        </div>
        <div style={{ marginTop: 24, fontSize: 20, color: '#4A4A4A', lineHeight: 1.5, maxWidth: 540 }}>
          Không dùng ảnh bitmap. Tỷ lệ phân cấp thị giác nghiêm ngặt, vạch kẻ phân đoạn toán học, và 1 màu nhấn duy nhất.
        </div>
      </div>

      {/* Data Infographic Card (Right Side) */}
      <div style={{ ...getColBox(8, 5, 120, 480), backgroundColor: '#FFFFFF', padding: 32, borderRadius: 4, border: '1px solid rgba(0,0,0,0.1)', boxShadow: '0 8px 30px rgba(0,0,0,0.06)' }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#888', letterSpacing: 1.5 }}>EMPIRICAL BENCHMARK</div>
        <div style={{ fontSize: 52, fontWeight: 900, color: '#1A1A1A', marginTop: 8 }}>
          {Math.round(interpolate(frame, [15, 60], [0, 98.4], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }))}%
        </div>
        <div style={{ fontSize: 16, color: '#666', marginTop: 4 }}>Tối ưu bộ nhớ & thời gian render</div>

        {/* Dynamic Chart Bars */}
        <div style={{ marginTop: 40, display: 'flex', flexDirection: 'column', gap: 16 }}>
          {[
            { label: 'SVG Vector Rendering', val: 92, col: '#D32F2F' },
            { label: 'CSS Grid Layout Precision', val: 100, col: '#1A1A1A' },
            { label: 'Bundle Size Reduction', val: 85, col: '#757575' },
          ].map((item, idx) => {
            const barW = interpolate(frame, [30 + idx * 10, 70 + idx * 10], [0, item.val], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
            return (
              <div key={idx}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, fontWeight: 600, marginBottom: 4 }}>
                  <span>{item.label}</span>
                  <span>{Math.round(barW)}%</span>
                </div>
                <div style={{ width: '100%', height: 8, backgroundColor: '#E0DCD1', borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{ width: `${barW}%`, height: '100%', backgroundColor: item.col }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Quote Hold */}
      <div style={{ position: 'absolute', left: 80, bottom: 50, fontSize: 15, color: '#777', fontStyle: 'italic' }}>
        “Perfection is achieved, not when there is nothing more to add, but when there is nothing left to take away.”
      </div>
    </AbsoluteFill>
  );
};

// ==========================================
// SCENE 2: TECHNICAL BLUEPRINT CAD (Frames 120-240)
// ==========================================
const BlueprintScene: React.FC = () => {
  const frame = useCurrentFrame();
  const enter = clamp01(frame / 20);

  return (
    <AbsoluteFill style={{ backgroundColor: '#0A2540', color: '#E6F4FE', fontFamily: 'monospace' }}>
      <BlueprintGrid gridSize={60} color="rgba(0, 240, 255, 0.12)" />

      {/* Top Header */}
      <div style={{ position: 'absolute', left: 80, top: 40, right: 80, display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(0,240,255,0.4)', paddingBottom: 10 }}>
        <span style={{ fontSize: 16, fontWeight: 700, color: '#00F0FF', letterSpacing: 2 }}>STYLE 02 // TECHNICAL BLUEPRINT CAD</span>
        <span style={{ fontSize: 14, color: '#A0C4E2' }}>SCALE: 1:1.0 | COORD: [1280 x 720]</span>
      </div>

      {/* Left Spec Column */}
      <div style={{ ...getColBox(1, 5, 120, 500) }}>
        <div style={{ fontSize: 14, color: '#00F0FF', letterSpacing: 2 }}>SCHEMATIC SPECIFICATION</div>
        <div style={{ fontSize: 44, fontWeight: 800, marginTop: 8, color: '#FFF' }}>
          PROCEDURAL SCHEMATICS
        </div>
        <div style={{ marginTop: 20, fontSize: 16, lineHeight: 1.6, color: '#90B4D2' }}>
          Tự sinh mạch điện tử và sơ đồ phần cứng bằng SVG Path Draw-on toán học. Không cần asset ảnh ngoài.
        </div>

        {/* Technical Callout Box */}
        <div style={{ marginTop: 30, border: '1px solid #00F0FF', padding: 18, backgroundColor: 'rgba(0,240,255,0.05)', borderRadius: 4 }}>
          <div style={{ fontSize: 13, color: '#00F0FF', fontWeight: 700 }}>DIMENSION TOLERANCE</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: '#FFF', marginTop: 4 }}>±0.005 mm CALIBRATED</div>
          <div style={{ fontSize: 13, color: '#A0C4E2', marginTop: 4 }}>Reading hold: &gt;75 frames compliance verified.</div>
        </div>
      </div>

      {/* Right CAD Circuit Drawing via SVG DrawPath */}
      <div style={{ ...getColBox(6, 7, 120, 500), position: 'relative' }}>
        <svg width="640" height="500" viewBox="0 0 640 500" style={{ position: 'absolute', inset: 0 }}>
          {/* Main Board Outline */}
          <DrawPath d="M 40 40 L 600 40 L 600 440 L 40 440 Z" progress={frame / 40} stroke="#00F0FF" strokeWidth={2} />
          {/* Internal Tracks */}
          <DrawPath d="M 80 120 L 240 120 L 300 180 L 520 180" progress={(frame - 15) / 40} stroke="#63F5FF" strokeWidth={2} />
          <DrawPath d="M 80 240 L 200 240 L 260 300 L 520 300" progress={(frame - 25) / 40} stroke="#63F5FF" strokeWidth={2} dashed />
          <DrawPath d="M 320 80 L 320 400" progress={(frame - 20) / 40} stroke="rgba(255,255,255,0.4)" strokeWidth={1} dashed />
          {/* Chip Center */}
          <rect x="220" y="160" width="160" height="140" fill="rgba(10,37,64,0.9)" stroke="#00F0FF" strokeWidth={2} rx={6} opacity={enter} />
          <text x="300" y="235" fill="#00F0FF" fontSize="20" fontWeight="700" textAnchor="middle" fontFamily="monospace">
            NEURAL_CORE
          </text>
          <text x="300" y="260" fill="#A0C4E2" fontSize="12" textAnchor="middle" fontFamily="monospace">
            REV_4.02_OK
          </text>
        </svg>
      </div>
    </AbsoluteFill>
  );
};

// ==========================================
// SCENE 3: TERMINAL & CYBER SYSTEM (Frames 240-360)
// ==========================================
const TerminalScene: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill style={{ backgroundColor: '#070A0F', color: '#00FF66', fontFamily: 'monospace' }}>
      <SineWaveCanvas frame={frame} color="rgba(0, 255, 102, 0.18)" amplitude={45} />
      <ScanlineOverlay opacity={0.15} />

      {/* Terminal Window Header */}
      <div style={{ position: 'absolute', left: 80, top: 40, right: 80, display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(0,255,102,0.3)', paddingBottom: 10 }}>
        <span style={{ fontSize: 16, fontWeight: 700, letterSpacing: 2 }}>STYLE 03 // CYBERNETIC TERMINAL</span>
        <span style={{ fontSize: 14 }}>STATUS: 200 OK | PORT: 18417</span>
      </div>

      {/* Left Code & Log stream */}
      <div style={{ ...getColBox(1, 6, 120, 500) }}>
        <div style={{ fontSize: 38, fontWeight: 900, color: '#FFF' }}>
          SYSTEM DIAGNOSTICS
        </div>
        <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 10, fontSize: 15, color: '#00FF66' }}>
          <div>&gt; initialize_kernel --safe --no-raster-images</div>
          <div>&gt; memory_pool: 64MB allocated [OK]</div>
          <div>&gt; render_pipeline: Remotion + HyperFrames fallback</div>
          <div>&gt; audio_stream: BGM ducking enabled (-22dB)</div>
          <div>&gt; multi_agent_cluster: 8 workers coordinated</div>
          <div style={{ color: '#66FF99', marginTop: 12 }}>
            [SUCCESS] 0 runtime errors detected across all pipelines.
          </div>
        </div>
      </div>

      {/* Right Oscilloscope Frequency Box */}
      <div style={{ ...getColBox(7, 6, 120, 480), border: '1px solid #00FF66', padding: 24, backgroundColor: 'rgba(0,255,102,0.04)', borderRadius: 6 }}>
        <div style={{ fontSize: 14, fontWeight: 700, letterSpacing: 2, color: '#66FF99' }}>LIVE FREQUENCY SPECTRUM</div>
        <div style={{ fontSize: 36, fontWeight: 900, color: '#FFF', marginTop: 8 }}>
          432.08 Hz <span style={{ fontSize: 18, color: '#00FF66' }}>STABLE</span>
        </div>
        <div style={{ marginTop: 24, height: 260, border: '1px dashed rgba(0,255,102,0.4)', position: 'relative', overflow: 'hidden' }}>
          <SineWaveCanvas frame={frame * 2} color="#00FF66" wavesCount={3} amplitude={35} />
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ==========================================
// SCENE 4: MIXED-MEDIA DOCUMENTARY (Frames 360-480)
// ==========================================
const MixedMediaScene: React.FC = () => {
  const frame = useCurrentFrame();
  const chipAssetUrl = staticFile('assets/demo/media/demo_chip.jpg');

  return (
    <AbsoluteFill style={{ backgroundColor: '#0D0E12', color: '#F0F2F5', fontFamily: 'sans-serif' }}>
      {/* Top Header */}
      <div style={{ position: 'absolute', left: 80, top: 40, right: 80, display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.2)', paddingBottom: 10 }}>
        <span style={{ fontSize: 16, fontWeight: 700, color: '#3B82F6', letterSpacing: 2 }}>STYLE 04 // MIXED-MEDIA DOCUMENTARY</span>
        <span style={{ fontSize: 14, color: '#9CA3AF' }}>ASSET HARVESTER: @thanh01.pmt/multimedia-kit</span>
      </div>

      {/* SplitCard: Left = Pexels Duotone Photo + Ken Burns, Right = Analysis */}
      <SplitCard imageSrc={chipAssetUrl} imageColSpan={6} y={120} h={500} shadowColor="#0B0C11" highlightColor="#3B82F6">
        <div style={{ paddingLeft: 40 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#3B82F6', letterSpacing: 2 }}>REAL-WORLD EVIDENCE</div>
          <div style={{ fontSize: 44, fontWeight: 900, lineHeight: 1.15, marginTop: 8 }}>
            Tư Liệu Thật &amp; Đồ Họa Phân Tích
          </div>
          <div style={{ marginTop: 18, fontSize: 18, color: '#9CA3AF', lineHeight: 1.6 }}>
            Khai thác kho ảnh miễn phí (Pexels / Unsplash) qua <code>multimedia-kit</code>, kết hợp lớp hòa trộn Duotone để hình ảnh hoàn toàn tiệp vào tông màu của phim.
          </div>

          <div style={{ marginTop: 32, display: 'flex', gap: 24 }}>
            <div style={{ borderLeft: '3px solid #3B82F6', paddingLeft: 16 }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: '#FFF' }}>0 ₫</div>
              <div style={{ fontSize: 13, color: '#9CA3AF' }}>Chi phí bản quyền ảnh</div>
            </div>
            <div style={{ borderLeft: '3px solid #10B981', paddingLeft: 16 }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: '#FFF' }}>100%</div>
              <div style={{ fontSize: 13, color: '#9CA3AF' }}>Commercial Safe</div>
            </div>
          </div>
        </div>
      </SplitCard>

      {/* AI Computer Vision Tracker Overlay on the Left Card */}
      <BoundingBoxTracker x={140} y={220} w={240} h={180} label="MICROCHIP_CORE" confidence="99.8%" accentColor="#3B82F6" />
    </AbsoluteFill>
  );
};

// ==========================================
// SCENE 5: FINALE & ATTRIBUTION (Frames 480-600)
// ==========================================
const FinaleScene: React.FC = () => {
  const frame = useCurrentFrame();
  const enter = clamp01(frame / 20);

  return (
    <AbsoluteFill style={{ backgroundColor: '#000000', color: '#FFFFFF', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <SineWaveCanvas frame={frame} color="rgba(102, 48, 248, 0.25)" amplitude={60} />

      <div style={{ textAlign: 'center', maxWidth: 900, transform: `scale(${0.95 + 0.05 * enter})`, opacity: enter }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: '#A175F1', letterSpacing: 4, marginBottom: 12 }}>
          ANYTHING2EXPLAINER // UPGRADE COMPLETE
        </div>
        <div style={{ fontSize: 58, fontWeight: 900, lineHeight: 1.1 }}>
          Đa Phong Cách · Không Cần Gen Ảnh · Đồ Họa Lập Trình
        </div>
        <div style={{ marginTop: 24, fontSize: 20, color: '#A0A0A1', lineHeight: 1.6 }}>
          Tích hợp thành công <strong>@thanh01.pmt/multimedia-kit</strong> &amp; <strong>Procedural Graphics</strong>.
          <br />Tự do sáng tạo từ Swiss Minimalist, Technical CAD, Cyberpunk tới Mixed-Media.
        </div>

        {/* Credit Banner */}
        <div style={{ marginTop: 40, padding: '12px 32px', backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 30, display: 'inline-block', border: '1px solid rgba(255,255,255,0.2)' }}>
          <span style={{ fontSize: 14, color: '#CCC' }}>Media provided by Pexels &amp; Pixabay | Built with Remotion &amp; Kiteva Patterns</span>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ==========================================
// MAIN COMPOSITION: SHOWCASE VIDEO
// ==========================================
export const ShowcaseVideo: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: '#000' }}>
      <Fonts />
      {/* 5 Cảnh diễn tả 5 phong cách liên tục, mỗi cảnh 120 frames (4s) */}
      <Sequence from={0} durationInFrames={120}>
        <SwissScene />
      </Sequence>
      <Sequence from={120} durationInFrames={120}>
        <BlueprintScene />
      </Sequence>
      <Sequence from={240} durationInFrames={120}>
        <TerminalScene />
      </Sequence>
      <Sequence from={360} durationInFrames={120}>
        <MixedMediaScene />
      </Sequence>
      <Sequence from={480} durationInFrames={120}>
        <FinaleScene />
      </Sequence>
    </AbsoluteFill>
  );
};
