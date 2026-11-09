import React from 'react';
import {W, H, FONT_MONO} from '../lib';

export interface BlueprintGridBgProps {
  majorStep?: number;
  minorStep?: number;
  backgroundColor?: string;
  cyanColor?: string;
  amberColor?: string;
  label?: string;
}

/**
 * BlueprintGridBg — Phong cách Technical Blueprint (Kiteva style-051)
 * Bản vẽ kỹ thuật kiến trúc/CAD với hệ lưới 2 tầng, vạch đo tỷ lệ và thông số tọa độ.
 */
export const BlueprintGridBg: React.FC<BlueprintGridBgProps> = ({
  majorStep = 80,
  minorStep = 20,
  backgroundColor = '#0A192F',
  cyanColor = '#64FFDA',
  amberColor = '#F59E0B',
  label = 'SYS_ARCH // CAD-SPEC 1080P // REV-04',
}) => {
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
        <defs>
          {/* Minor Grid Pattern */}
          <pattern id="bp-minor-grid" width={minorStep} height={minorStep} patternUnits="userSpaceOnUse">
            <path
              d={`M ${minorStep} 0 L 0 0 0 ${minorStep}`}
              fill="none"
              stroke={cyanColor}
              strokeWidth={0.5}
              strokeOpacity={0.08}
            />
          </pattern>

          {/* Major Grid Pattern */}
          <pattern id="bp-major-grid" width={majorStep} height={majorStep} patternUnits="userSpaceOnUse">
            <rect width={majorStep} height={majorStep} fill="url(#bp-minor-grid)" />
            <path
              d={`M ${majorStep} 0 L 0 0 0 ${majorStep}`}
              fill="none"
              stroke={cyanColor}
              strokeWidth={1}
              strokeOpacity={0.2}
            />
            {/* Corner dot mark */}
            <circle cx={0} cy={0} r={1.5} fill={cyanColor} fillOpacity={0.4} />
          </pattern>
        </defs>

        {/* Base Grid Pattern */}
        <rect width={W} height={H} fill="url(#bp-major-grid)" />

        {/* Outer CAD Border */}
        <rect
          x={16}
          y={16}
          width={W - 32}
          height={H - 32}
          fill="none"
          stroke={cyanColor}
          strokeWidth={1.5}
          strokeOpacity={0.4}
          strokeDasharray="8 4"
        />

        {/* Center Origin Target */}
        <g stroke={cyanColor} strokeWidth={1} strokeOpacity={0.3}>
          <line x1={W / 2 - 20} y1={H / 2} x2={W / 2 + 20} y2={H / 2} />
          <line x1={W / 2} y1={H / 2 - 20} x2={W / 2} y2={H / 2 + 20} />
          <circle cx={W / 2} cy={H / 2} r={10} fill="none" />
        </g>

        {/* Corner Dimension Labels */}
        <text
          x={28}
          y={H - 24}
          fontFamily={FONT_MONO}
          fontSize={11}
          fill={cyanColor}
          fillOpacity={0.6}
          letterSpacing="1px"
        >
          {label}
        </text>

        <text
          x={W - 28}
          y={H - 24}
          textAnchor="end"
          fontFamily={FONT_MONO}
          fontSize={11}
          fill={amberColor}
          fillOpacity={0.7}
          letterSpacing="1px"
        >
          SCALE: 1:1 // 30 FPS
        </text>
      </svg>
    </div>
  );
};
