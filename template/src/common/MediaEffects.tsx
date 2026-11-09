import React from 'react';
import { useCurrentFrame } from 'remotion';
import { clamp01, easeOutCubic } from './index';

/**
 * DuotoneImage: Nhuộm màu ảnh stock (Pexels / Unsplash) theo hệ màu của video bằng CSS blend modes.
 * Biến ảnh gốc sang Grayscale tương phản cao, sau đó hòa trộn màu bóng tối (Multiply) và màu sáng (Screen).
 */
export const DuotoneImage: React.FC<{
  src: string;
  shadowColor?: string;
  highlightColor?: string;
  style?: React.CSSProperties;
  className?: string;
}> = ({
  src,
  shadowColor = '#0B0C11',
  highlightColor = '#A175F1',
  style,
  className,
}) => (
  <div
    className={className}
    style={{
      position: 'relative',
      overflow: 'hidden',
      width: '100%',
      height: '100%',
      backgroundColor: shadowColor,
      ...style,
    }}
  >
    <img
      src={src}
      alt="media"
      style={{
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        filter: 'grayscale(100%) contrast(140%) brightness(95%)',
        display: 'block',
      }}
    />
    {/* Shadows layer */}
    <div
      style={{
        position: 'absolute',
        inset: 0,
        backgroundColor: shadowColor,
        mixBlendMode: 'multiply',
        pointerEvents: 'none',
      }}
    />
    {/* Highlights layer */}
    <div
      style={{
        position: 'absolute',
        inset: 0,
        backgroundColor: highlightColor,
        mixBlendMode: 'screen',
        opacity: 0.85,
        pointerEvents: 'none',
      }}
    />
  </div>
);

/**
 * KenBurns: Diễn hoạt chuyển động zoom và pan mượt mà cho ảnh tĩnh tư liệu.
 */
export const KenBurns: React.FC<{
  src: string;
  durationInFrames: number;
  scaleFrom?: number;
  scaleTo?: number;
  panX?: number;
  panY?: number;
  duotone?: boolean;
  shadowColor?: string;
  highlightColor?: string;
  style?: React.CSSProperties;
}> = ({
  src,
  durationInFrames,
  scaleFrom = 1.0,
  scaleTo = 1.1,
  panX = 20,
  panY = 0,
  duotone = false,
  shadowColor,
  highlightColor,
  style,
}) => {
  const frame = useCurrentFrame();
  const progress = clamp01(frame / Math.max(1, durationInFrames));
  const eased = easeOutCubic(progress);

  const currentScale = scaleFrom + (scaleTo - scaleFrom) * eased;
  const currentPanX = panX * eased;
  const currentPanY = panY * eased;

  const content = (
    <img
      src={src}
      alt="ken-burns"
      style={{
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        transform: `scale(${currentScale}) translate(${currentPanX}px, ${currentPanY}px)`,
        transformOrigin: 'center center',
      }}
    />
  );

  if (duotone) {
    return (
      <div style={{ position: 'relative', overflow: 'hidden', width: '100%', height: '100%', ...style }}>
        <DuotoneImage
          src={src}
          shadowColor={shadowColor}
          highlightColor={highlightColor}
          style={{
            transform: `scale(${currentScale}) translate(${currentPanX}px, ${currentPanY}px)`,
            transformOrigin: 'center center',
          }}
        />
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', overflow: 'hidden', width: '100%', height: '100%', ...style }}>
      {content}
    </div>
  );
};

/**
 * DocumentViewer: Hiển thị tài liệu/bài báo thực tế và highlight dòng chữ chính
 */
export const DocumentViewer: React.FC<{
  docSrc: string;
  highlightYPercent?: number;
  highlightHeightPercent?: number;
  highlightProgress?: number;
  highlightColor?: string;
  style?: React.CSSProperties;
}> = ({
  docSrc,
  highlightYPercent = 42,
  highlightHeightPercent = 8,
  highlightProgress = 0,
  highlightColor = 'rgba(255, 235, 59, 0.45)',
  style,
}) => {
  const p = clamp01(highlightProgress);
  return (
    <div
      style={{
        position: 'relative',
        borderRadius: 8,
        overflow: 'hidden',
        boxShadow: '0 8px 30px rgba(0,0,0,0.5)',
        border: '1px solid rgba(255,255,255,0.2)',
        ...style,
      }}
    >
      <img src={docSrc} alt="Document" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      {/* Dynamic Highlight marker line */}
      <div
        style={{
          position: 'absolute',
          top: `${highlightYPercent}%`,
          left: '8%',
          width: `${84 * p}%`,
          height: `${highlightHeightPercent}%`,
          backgroundColor: highlightColor,
          borderRadius: 2,
          mixBlendMode: 'multiply',
          pointerEvents: 'none',
        }}
      />
    </div>
  );
};
