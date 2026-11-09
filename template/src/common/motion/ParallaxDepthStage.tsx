import React from 'react';
import {W, H} from '../lib';

export interface ParallaxDepthStageProps {
  panX?: number; // base pan coordinate (px)
  panY?: number;
  bgFactor?: number; // movement ratio for background (default: 0.25)
  midFactor?: number; // movement ratio for midground/content (default: 1.0)
  fgFactor?: number; // movement ratio for foreground/particles (default: 1.6)
  background?: React.ReactNode;
  midground: React.ReactNode;
  foreground?: React.ReactNode;
  style?: React.CSSProperties;
}

/**
 * ParallaxDepthStage — Sân khấu thị sai 3 tầng đa bình diện Multiplane (Kiteva motion-009)
 * Tách biệt hậu cảnh, trung cảnh và tiền cảnh với các hệ số di chuyển khác nhau để tạo chiều sâu.
 */
export const ParallaxDepthStage: React.FC<ParallaxDepthStageProps> = ({
  panX = 0,
  panY = 0,
  bgFactor = 0.25,
  midFactor = 1.0,
  fgFactor = 1.6,
  background,
  midground,
  foreground,
  style,
}) => {
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
      {/* 1. Background Layer (slow drift) */}
      {background && (
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            width: W,
            height: H,
            transform: `translate3d(${panX * bgFactor}px, ${panY * bgFactor}px, 0)`,
            transition: 'none',
          }}
        >
          {background}
        </div>
      )}

      {/* 2. Midground Layer (content core) */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: W,
          height: H,
          transform: `translate3d(${panX * midFactor}px, ${panY * midFactor}px, 0)`,
          transition: 'none',
        }}
      >
        {midground}
      </div>

      {/* 3. Foreground Layer (floating elements, high speed) */}
      {foreground && (
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            width: W,
            height: H,
            pointerEvents: 'none',
            transform: `translate3d(${panX * fgFactor}px, ${panY * fgFactor}px, 0)`,
            transition: 'none',
          }}
        >
          {foreground}
        </div>
      )}
    </div>
  );
};
