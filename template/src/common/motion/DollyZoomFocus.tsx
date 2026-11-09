import React from 'react';
import {W, H, clamp} from '../lib';

export interface DollyZoomFocusProps {
  progress: number; // 0.0 -> 1.0 (dolly zoom intensity)
  targetScale?: number; // target object scale up (e.g. 1.25)
  bgScale?: number; // background scale down (e.g. 0.85)
  bgBlur?: number; // background max blur px (e.g. 8)
  children: React.ReactNode;
  background?: React.ReactNode;
  style?: React.CSSProperties;
}

/**
 * DollyZoomFocus — Hiệu ứng Vertigo phóng gần chủ thể và đẩy lùi hậu cảnh (Kiteva motion-013)
 * Tập trung tối đa ánh nhìn của khán giả vào linh kiện hoặc đoạn code cốt lõi.
 */
export const DollyZoomFocus: React.FC<DollyZoomFocusProps> = ({
  progress,
  targetScale = 1.25,
  bgScale = 0.88,
  bgBlur = 6,
  children,
  background,
  style,
}) => {
  const p = clamp(progress, 0, 1);

  // Smooth ease curve
  const ease = Math.sin((p * Math.PI) / 2);

  const currentTargetScale = 1.0 + (targetScale - 1.0) * ease;
  const currentBgScale = 1.0 - (1.0 - bgScale) * ease;
  const currentBlur = bgBlur * ease;

  return (
    <div
      style={{
        position: 'relative',
        width: W,
        height: H,
        overflow: 'hidden',
        ...style,
      }}
    >
      {/* Receding Background */}
      {background && (
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            width: W,
            height: H,
            transform: `scale(${currentBgScale})`,
            filter: currentBlur > 0.5 ? `blur(${currentBlur}px)` : undefined,
            transition: 'none',
          }}
        >
          {background}
        </div>
      )}

      {/* Advancing Target Subject */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: W,
          height: H,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transform: `scale(${currentTargetScale})`,
          transition: 'none',
        }}
      >
        {children}
      </div>
    </div>
  );
};
