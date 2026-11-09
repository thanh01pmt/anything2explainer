import React from 'react';
import {clamp} from '../lib';

export interface SmartArrowProps {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  progress: number; // 0.0 -> 1.0 (shaft drawing progress)
  strokeColor?: string;
  strokeWidth?: number;
  headSize?: number;
  curved?: boolean;
  curveOffset?: number; // perpendicular curvature offset
  dashArray?: string;
  style?: React.CSSProperties;
}

/**
 * SmartArrow — Quy tắc vi chuyển động từ Kiteva (motion-graphics-agent/src/server/motion/arrow-drawing.ts):
 * "When drawing any arrow, hide its arrowhead until the shaft reaches that endpoint.
 *  Never leave a static arrowhead visible while the shaft draws."
 */
export const SmartArrow: React.FC<SmartArrowProps> = ({
  x1,
  y1,
  x2,
  y2,
  progress,
  strokeColor = '#A855F7', // default purple
  strokeWidth = 3,
  headSize = 12,
  curved = false,
  curveOffset = 30,
  dashArray,
  style,
}) => {
  const p = clamp(progress, 0, 1);

  // Compute control points
  const dx = x2 - x1;
  const dy = y2 - y1;
  const dist = Math.sqrt(dx * dx + dy * dy);
  const angle = Math.atan2(dy, dx);

  let pathD = `M ${x1} ${y1} L ${x2} ${y2}`;
  let endAngle = angle;

  if (curved && dist > 1) {
    const mx = (x1 + x2) / 2;
    const my = (y1 + y2) / 2;
    const nx = -dy / dist;
    const ny = dx / dist;
    const cx = mx + nx * curveOffset;
    const cy = my + ny * curveOffset;
    pathD = `M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}`;
    // Approximate tangent angle at end of quadratic bezier
    endAngle = Math.atan2(y2 - cy, x2 - cx);
  }

  // Kiteva Arrow Drawing Rule:
  // Arrowhead stays completely hidden (opacity 0, scale 0) until shaft >= 0.92
  const headThreshold = 0.92;
  const headProgress = clamp((p - headThreshold) / (1 - headThreshold), 0, 1);
  const headOpacity = headProgress;
  const headScale = Math.sin((headProgress * Math.PI) / 2); // snappy ease-out

  const strokeDash = dist;
  const strokeOffset = dist * (1 - p);

  return (
    <svg
      style={{
        position: 'absolute',
        left: 0,
        top: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        overflow: 'visible',
        ...style,
      }}
    >
      {/* Shaft */}
      <path
        d={pathD}
        fill="none"
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={dashArray || strokeDash}
        strokeDashoffset={strokeOffset}
      />

      {/* Arrowhead (Only rendered and visible when shaft touches endpoint) */}
      {headProgress > 0 && (
        <g
          transform={`translate(${x2}, ${y2}) rotate(${(endAngle * 180) / Math.PI}) scale(${headScale})`}
          style={{
            opacity: headOpacity,
            transformOrigin: '0px 0px',
            transition: 'none',
          }}
        >
          <polygon
            points={`0,0 -${headSize},-${headSize * 0.55} -${headSize * 0.7},0 -${headSize},${headSize * 0.55}`}
            fill={strokeColor}
          />
        </g>
      )}
    </svg>
  );
};
