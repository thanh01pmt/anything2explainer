import React from 'react';
import {FONT_MONO, clamp} from '../lib';

export interface GlitchTypeBuildProps {
  text: string;
  progress: number; // 0.0 -> 1.0
  currentFrame?: number;
  textColor?: string;
  glitchColor?: string;
  fontSize?: number;
  style?: React.CSSProperties;
}

const CYPHER_CHARS = '0123456789ABCDEF_<>{}[]/*&^%$#@!~';

/**
 * GlitchTypeBuild — Hiệu ứng bung chữ giật ký tự ngẫu nhiên (Kiteva motion-028)
 * Các ký tự ở đầu biên tiến độ sẽ hoán đổi mã cypher liên tục trước khi khóa ký tự thật.
 */
export const GlitchTypeBuild: React.FC<GlitchTypeBuildProps> = ({
  text,
  progress,
  currentFrame = 0,
  textColor = '#FFFFFF',
  glitchColor = '#A855F7',
  fontSize = 36,
  style,
}) => {
  const p = clamp(progress, 0, 1);
  const total = text.length;
  const lockedCount = Math.floor(p * total);

  // Build rendered string
  const chars = text.split('').map((realChar, i) => {
    if (i < lockedCount) {
      return {char: realChar, isGlitch: false};
    }
    if (i < lockedCount + 3 && p > 0 && p < 1) {
      // Deterministic cypher scramble based on frame & index
      const seed = (currentFrame * 7 + i * 13) % CYPHER_CHARS.length;
      return {char: CYPHER_CHARS[seed], isGlitch: true};
    }
    return {char: ' ', isGlitch: false};
  });

  return (
    <div
      style={{
        fontFamily: FONT_MONO,
        fontSize,
        lineHeight: 1.2,
        letterSpacing: '1px',
        fontWeight: 700,
        ...style,
      }}
    >
      {chars.map((item, i) => (
        <span
          key={i}
          style={{
            color: item.isGlitch ? glitchColor : textColor,
            textShadow: item.isGlitch ? `0 0 12px ${glitchColor}` : undefined,
            transition: 'none',
          }}
        >
          {item.char}
        </span>
      ))}
    </div>
  );
};
