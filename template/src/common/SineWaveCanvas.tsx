import React from 'react';

/**
 * SineWaveCanvas: Nền sóng toán học động (Procedural Sine Waves) chạy bằng HTML5 Canvas.
 * Hoàn toàn tạo bằng code (Zero raster image), 60fps mượt mà và tiêu tốn cực ít bộ nhớ.
 * Rất phù hợp với Preset 'cyber-dark', 'technical-blueprint' và 'terminal-system'.
 */
export const SineWaveCanvas: React.FC<{
  frame: number;
  color?: string;
  wavesCount?: number;
  opacity?: number;
  amplitude?: number;
}> = ({
  frame,
  color = 'rgba(102, 48, 248, 0.22)',
  wavesCount = 4,
  opacity = 1.0,
  amplitude = 50,
}) => (
  <canvas
    width={1280}
    height={720}
    style={{
      position: 'absolute',
      inset: 0,
      pointerEvents: 'none',
      opacity,
    }}
    ref={(canvas) => {
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.clearRect(0, 0, 1280, 720);
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.5;

      for (let i = 0; i < wavesCount; i++) {
        ctx.beginPath();
        for (let x = 0; x <= 1280; x += 12) {
          const y =
            360 +
            Math.sin(x * 0.0035 + frame * 0.025 + i * 0.8) * amplitude +
            Math.cos(x * 0.007 - frame * 0.015 + i) * (amplitude * 0.4);
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
    }}
  />
);
