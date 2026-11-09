import React from 'react';
import {FONT_MONO, clamp} from '../lib';

export interface TerminalTypingProps {
  text: string;
  progress: number; // 0.0 -> 1.0
  prompt?: string;
  textColor?: string;
  promptColor?: string;
  cursorColor?: string;
  fontSize?: number;
  cursorBlinkSpeed?: number; // frames per blink cycle
  currentFrame?: number;
  style?: React.CSSProperties;
}

/**
 * TerminalTyping — Mô phỏng gõ phím Terminal (Kiteva motion-027)
 * Gõ từng ký tự theo tiến độ thời gian với con trỏ nhấp nháy thực tế.
 */
export const TerminalTyping: React.FC<TerminalTypingProps> = ({
  text,
  progress,
  prompt = '$ ',
  textColor = '#E2E8F0',
  promptColor = '#10B981', // emerald prompt
  cursorColor = '#A855F7', // purple cursor
  fontSize = 20,
  cursorBlinkSpeed = 16,
  currentFrame = 0,
  style,
}) => {
  const p = clamp(progress, 0, 1);
  const charCount = Math.floor(p * text.length);
  const visibleText = text.slice(0, charCount);

  // Cursor blink logic (toggle every cursorBlinkSpeed frames)
  const isBlinkVisible = Math.floor(currentFrame / cursorBlinkSpeed) % 2 === 0 || p < 1;

  return (
    <div
      style={{
        fontFamily: FONT_MONO,
        fontSize,
        lineHeight: 1.6,
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
        color: textColor,
        ...style,
      }}
    >
      {prompt && (
        <span style={{color: promptColor, fontWeight: 700, userSelect: 'none'}}>
          {prompt}
        </span>
      )}
      <span>{visibleText}</span>
      <span
        style={{
          display: 'inline-block',
          width: '0.55em',
          height: '1.1em',
          verticalAlign: '-0.15em',
          backgroundColor: isBlinkVisible ? cursorColor : 'transparent',
          marginLeft: 2,
          borderRadius: 2,
        }}
      />
    </div>
  );
};

