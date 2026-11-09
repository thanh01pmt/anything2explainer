import React from 'react';
import {clamp} from '../lib';

export interface ContentContainerProps {
  openProgress: number; // 0.0 -> 1.0 (container unfolding/expansion progress)
  threshold?: number; // threshold when children begin to reveal (default: 0.82)
  width?: number | string;
  height?: number | string;
  backgroundColor?: string;
  borderColor?: string;
  borderWidth?: number;
  borderRadius?: number;
  padding?: number | string;
  boxShadow?: string;
  backdropBlur?: boolean;
  style?: React.CSSProperties;
  children: React.ReactNode;
}

/**
 * ContentContainer — Quy tắc bung mở nội dung từ Kiteva (motion-graphics-agent/src/server/motion/content-reveal.ts):
 * "When a window, card, speech bubble, or diagram frame is drawn or revealed,
 *  keep its internal labels hidden until the container is complete.
 *  Do not leave floating labels visible before their owning object exists."
 */
export const ContentContainer: React.FC<ContentContainerProps> = ({
  openProgress,
  threshold = 0.82,
  width = 'auto',
  height = 'auto',
  backgroundColor = 'rgba(12, 14, 20, 0.88)',
  borderColor = 'rgba(168, 85, 247, 0.4)',
  borderWidth = 1.5,
  borderRadius = 12,
  padding = '18px 24px',
  boxShadow = '0 8px 32px rgba(0,0,0,0.45)',
  backdropBlur = true,
  style,
  children,
}) => {
  const p = clamp(openProgress, 0, 1);

  // Container expansion transform
  const scale = clamp(p, 0.01, 1);
  const containerOpacity = clamp(p * 2, 0, 1);

  // Content reveal calculation
  // Internal copy and labels remain hidden until container reaches threshold
  const childRaw = clamp((p - threshold) / (1 - threshold), 0, 1);
  // Snappy smooth cubic ease for child entrance
  const childProgress = childRaw * childRaw * (3 - 2 * childRaw);
  const childOpacity = childProgress;
  const childTranslateY = (1 - childProgress) * 8; // slight 8px upward settle

  return (
    <div
      style={{
        width,
        height,
        backgroundColor,
        border: `${borderWidth}px solid ${borderColor}`,
        borderRadius,
        padding,
        boxShadow,
        backdropFilter: backdropBlur ? 'blur(16px)' : undefined,
        WebkitBackdropFilter: backdropBlur ? 'blur(16px)' : undefined,
        opacity: containerOpacity,
        transform: `scale(${scale})`,
        transformOrigin: 'center center',
        overflow: 'hidden',
        boxSizing: 'border-box',
        ...style,
      }}
    >
      <div
        style={{
          width: '100%',
          height: '100%',
          opacity: childOpacity,
          transform: `translateY(${childTranslateY}px)`,
          transition: 'none',
          visibility: childProgress > 0.001 ? 'visible' : 'hidden',
        }}
      >
        {children}
      </div>
    </div>
  );
};
