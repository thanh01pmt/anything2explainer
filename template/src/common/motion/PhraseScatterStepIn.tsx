import React from 'react';
import {FONT_HEAVY, clamp} from '../lib';

export interface PhraseScatterStepInProps {
  phrase: string;
  progress: number; // 0.0 -> 1.0
  fontSize?: number;
  textColor?: string;
  accentWord?: string;
  accentColor?: string;
  style?: React.CSSProperties;
}

/**
 * PhraseScatterStepIn — Cụm từ tản mát bước vào trục baseline (Kiteva motion-029)
 * Mỗi từ xuất phát từ một góc lệch ngẫu nhiên, trượt vào và neo chặt trên trục hàng ngang.
 */
export const PhraseScatterStepIn: React.FC<PhraseScatterStepInProps> = ({
  phrase,
  progress,
  fontSize = 42,
  textColor = '#FFFFFF',
  accentWord,
  accentColor = '#A855F7',
  style,
}) => {
  const p = clamp(progress, 0, 1);
  const words = phrase.split(' ');
  const total = words.length;

  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'baseline',
        justifyContent: 'center',
        gap: '0.35em',
        fontFamily: FONT_HEAVY,
        fontSize,
        fontWeight: 800,
        ...style,
      }}
    >
      {words.map((w, i) => {
        // Stagger entrance for each word
        const start = (i / total) * 0.45;
        const end = start + 0.55;
        const wp = clamp((p - start) / (end - start), 0, 1);

        // Smooth cubic ease out
        const ease = 1 - Math.pow(1 - wp, 3);

        // Offsets
        const angle = ((i * 73) % 360) * (Math.PI / 180);
        const distance = 40 * (1 - ease);
        const offsetX = Math.cos(angle) * distance;
        const offsetY = Math.sin(angle) * distance * 1.5;
        const rot = (1 - ease) * (i % 2 === 0 ? 8 : -8);

        const isAccent = accentWord && w.toLowerCase().includes(accentWord.toLowerCase());

        return (
          <span
            key={i}
            style={{
              display: 'inline-block',
              transform: `translate(${offsetX}px, ${offsetY}px) rotate(${rot}deg)`,
              opacity: clamp(wp * 2, 0, 1),
              color: isAccent ? accentColor : textColor,
              textShadow: isAccent ? `0 0 16px ${accentColor}88` : undefined,
              transition: 'none',
            }}
          >
            {w}
          </span>
        );
      })}
    </div>
  );
};
