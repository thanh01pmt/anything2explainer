import React from 'react';
import {W, H} from '../lib';

export interface SwissGridBgProps {
  columns?: number;
  baselineStep?: number;
  backgroundColor?: string;
  gridColor?: string;
  accentColor?: string;
  showCrosshairs?: boolean;
}

/**
 * SwissGridBg — Phong cách International Typographic Style (Kiteva style-001)
 * Hệ lưới cột đối xứng, đường kẻ baseline thanh mảnh và dấu định vị (crosshairs) chuẩn mực.
 */
export const SwissGridBg: React.FC<SwissGridBgProps> = ({
  columns = 12,
  baselineStep = 40,
  backgroundColor = '#F8F9FA',
  gridColor = 'rgba(15, 23, 42, 0.05)',
  accentColor = '#D32F2F',
  showCrosshairs = true,
}) => {
  const colWidth = W / columns;
  const colLines = Array.from({length: columns + 1}, (_, i) => i * colWidth);
  const rowLines = Array.from({length: Math.floor(H / baselineStep) + 1}, (_, i) => i * baselineStep);

  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        top: 0,
        width: W,
        height: H,
        backgroundColor,
        overflow: 'hidden',
        pointerEvents: 'none',
      }}
    >
      <svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0}}>
        {/* Baseline horizontal rules */}
        {rowLines.map((y, i) => (
          <line
            key={`row-${i}`}
            x1={0}
            y1={y}
            x2={W}
            y2={y}
            stroke={gridColor}
            strokeWidth={1}
          />
        ))}

        {/* Column vertical rules */}
        {colLines.map((x, i) => (
          <line
            key={`col-${i}`}
            x1={x}
            y1={0}
            x2={x}
            y2={H}
            stroke={gridColor}
            strokeWidth={i === 0 || i === columns ? 2 : 1}
          />
        ))}

        {/* Swiss Red Registration Crosshairs */}
        {showCrosshairs && (
          <g stroke={accentColor} strokeWidth={1.5} opacity={0.6}>
            {/* Top Left */}
            <line x1={20} y1={28} x2={36} y2={28} />
            <line x1={28} y1={20} x2={28} y2={36} />

            {/* Top Right */}
            <line x1={W - 36} y1={28} x2={W - 20} y2={28} />
            <line x1={W - 28} y1={20} x2={W - 28} y2={36} />

            {/* Bottom Left */}
            <line x1={20} y1={H - 28} x2={36} y2={H - 28} />
            <line x1={28} y1={H - 36} x2={28} y2={H - 20} />

            {/* Bottom Right */}
            <line x1={W - 36} y1={H - 28} x2={W - 20} y2={H - 28} />
            <line x1={W - 28} y1={H - 36} x2={W - 28} y2={H - 20} />
          </g>
        )}
      </svg>
    </div>
  );
};
