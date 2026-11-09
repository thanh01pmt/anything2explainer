import React from 'react';
import {FONT_HEAVY, clamp} from '../lib';

export interface WordSmashCutProps {
  word: string;
  progress: number; // 0.0 -> 1.0 (smash animation progress)
  color?: string;
  accentColor?: string;
  fontSize?: number;
  subText?: string;
  style?: React.CSSProperties;
}

/**
 * WordSmashCut — Cắt cảnh chữ đập mạnh vào tâm màn hình (Kiteva motion-030)
 * Chữ phóng to cực đại rồi đập xuống mặt phẳng với rung động và sóng chấn động.
 */
export const WordSmashCut: React.FC<WordSmashCutProps> = ({
  word,
  progress,
  color = '#FFFFFF',
  accentColor = '#A855F7',
  fontSize = 72,
  subText,
  style,
}) => {
  const p = clamp(progress, 0, 1);

  // Impact phase (0.0 -> 0.35)
  // Scale from 2.6 down to 1.0 with a snappy bounce
  let scale = 1.0;
  let opacity = 1.0;
  let blur = 0;

  if (p < 0.35) {
    const t = p / 0.35;
    scale = 2.6 - 1.6 * Math.sin((t * Math.PI) / 2);
    opacity = clamp(t * 3, 0, 1);
    blur = (1 - t) * 12;
  } else {
    // Settled with tiny breathing
    scale = 1.0;
    opacity = 1.0;
    blur = 0;
  }

  // Shockwave ring expansion after impact (p >= 0.35)
  const shockProgress = clamp((p - 0.35) / 0.5, 0, 1);
  const shockScale = 1.0 + shockProgress * 1.8;
  const shockOpacity = (1 - shockProgress) * 0.7;

  return (
    <div
      style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        ...style,
      }}
    >
      {/* Shockwave expanding ring */}
      {p >= 0.35 && shockProgress < 1 && (
        <div
          style={{
            position: 'absolute',
            width: fontSize * 4,
            height: fontSize * 1.8,
            borderRadius: '50%',
            border: `2px solid ${accentColor}`,
            opacity: shockOpacity,
            transform: `scale(${shockScale})`,
            pointerEvents: 'none',
          }}
        />
      )}

      {/* Main Word */}
      <div
        style={{
          fontFamily: FONT_HEAVY,
          fontSize,
          fontWeight: 900,
          color,
          transform: `scale(${scale})`,
          opacity,
          filter: blur > 0 ? `blur(${blur}px)` : undefined,
          textShadow: `0 8px 32px rgba(0,0,0,0.8), 0 0 24px ${accentColor}66`,
          letterSpacing: '-1px',
          lineHeight: 1.1,
          textAlign: 'center',
        }}
      >
        {word}
      </div>

      {/* Optional Subtitle */}
      {subText && (
        <div
          style={{
            marginTop: 12,
            fontSize: Math.round(fontSize * 0.32),
            fontFamily: FONT_HEAVY,
            color: accentColor,
            fontWeight: 600,
            letterSpacing: '2px',
            textTransform: 'uppercase',
            opacity: clamp((p - 0.4) * 3, 0, 1),
          }}
        >
          {subText}
        </div>
      )}
    </div>
  );
};
