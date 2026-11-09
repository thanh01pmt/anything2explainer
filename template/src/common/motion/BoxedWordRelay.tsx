import React from 'react';
import {FONT_MONO, clamp} from '../lib';

export interface TokenItem {
  text: string;
  color?: string;
  role?: string;
}

export interface BoxedWordRelayProps {
  tokens: TokenItem[];
  activeIndex?: number; // index of currently active/focused token
  accentColor?: string;
  fontSize?: number;
  gap?: number;
  style?: React.CSSProperties;
}

/**
 * BoxedWordRelay — Hộp viền active nhảy tuần tự qua các từ (Kiteva motion-049)
 * Làm nổi bật từng từ khóa hoặc tham số khi voiceover thuyết minh tới.
 */
export const BoxedWordRelay: React.FC<BoxedWordRelayProps> = ({
  tokens,
  activeIndex = 0,
  accentColor = '#A855F7',
  fontSize = 32,
  gap = 16,
  style,
}) => {
  const safeIndex = clamp(activeIndex, 0, Math.max(0, tokens.length - 1));

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap,
        fontFamily: FONT_MONO,
        fontSize,
        lineHeight: 1.2,
        ...style,
      }}
    >
      {tokens.map((tok, i) => {
        const isActive = i === safeIndex;

        return (
          <div
            key={i}
            style={{
              position: 'relative',
              padding: '8px 16px',
              borderRadius: 8,
              backgroundColor: isActive ? 'rgba(168, 85, 247, 0.16)' : 'transparent',
              border: `1.5px solid ${isActive ? accentColor : 'transparent'}`,
              boxShadow: isActive ? `0 0 20px ${accentColor}33` : 'none',
              transform: isActive ? 'scale(1.05)' : 'scale(1.0)',
              transition: 'none',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <span
              style={{
                color: tok.color || (isActive ? '#FFFFFF' : '#94A3B8'),
                fontWeight: isActive ? 700 : 500,
              }}
            >
              {tok.text}
            </span>

            {/* Optional role / subtitle badge under active token */}
            {tok.role && isActive && (
              <span
                style={{
                  position: 'absolute',
                  top: '100%',
                  marginTop: 6,
                  fontSize: 12,
                  letterSpacing: '0.5px',
                  color: accentColor,
                  whiteSpace: 'nowrap',
                  fontWeight: 600,
                }}
              >
                {tok.role}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
};
