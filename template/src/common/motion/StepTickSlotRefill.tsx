import React from 'react';
import {FONT_HEAVY, FONT_MONO, clamp} from '../lib';

export interface SlotItem {
  id?: string;
  val: string | number;
  label?: string;
}

export interface StepTickSlotRefillProps {
  slots: SlotItem[];
  activeSlotIndex?: number;
  pointerLabel?: string;
  slotSize?: number;
  gap?: number;
  accentColor?: string;
  slotBg?: string;
  slotBorder?: string;
  style?: React.CSSProperties;
}

/**
 * StepTickSlotRefill — Trực quan hóa ô nhớ mảng / buffer duyệt tuần tự (Kiteva motion-041)
 * Hiển thị mảng các ô dữ liệu với con trỏ chỉ số (index pointer) di chuyển theo từng nhịp tick.
 */
export const StepTickSlotRefill: React.FC<StepTickSlotRefillProps> = ({
  slots,
  activeSlotIndex = 0,
  pointerLabel = 'i',
  slotSize = 72,
  gap = 16,
  accentColor = '#10B981', // emerald green pointer
  slotBg = 'rgba(15, 18, 28, 0.88)',
  slotBorder = 'rgba(255, 255, 255, 0.18)',
  style,
}) => {
  const safeIdx = clamp(activeSlotIndex, 0, Math.max(0, slots.length - 1));

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        ...style,
      }}
    >
      {/* Slots Row */}
      <div style={{display: 'flex', alignItems: 'center', gap}}>
        {slots.map((item, i) => {
          const isActive = i === safeIdx;
          const isPassed = i < safeIdx;

          return (
            <div
              key={item.id || i}
              style={{
                width: slotSize,
                height: slotSize,
                borderRadius: 12,
                backgroundColor: isActive
                  ? 'rgba(16, 185, 129, 0.18)'
                  : isPassed
                  ? 'rgba(255, 255, 255, 0.05)'
                  : slotBg,
                border: `2px solid ${isActive ? accentColor : isPassed ? '#10B98188' : slotBorder}`,
                boxShadow: isActive ? `0 0 20px ${accentColor}44` : 'none',
                transform: isActive ? 'scale(1.08)' : 'scale(1.0)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'none',
              }}
            >
              <span
                style={{
                  fontFamily: FONT_MONO,
                  fontSize: Math.round(slotSize * 0.42),
                  fontWeight: 700,
                  color: isActive ? '#FFFFFF' : isPassed ? '#10B981' : '#94A3B8',
                }}
              >
                {item.val}
              </span>
              <span
                style={{
                  fontFamily: FONT_MONO,
                  fontSize: 11,
                  color: 'rgba(255, 255, 255, 0.35)',
                  marginTop: 2,
                }}
              >
                [{i}]
              </span>
            </div>
          );
        })}
      </div>

      {/* Pointer Indicator Arrow & Label */}
      <div
        style={{
          marginTop: 14,
          display: 'flex',
          alignItems: 'center',
          gap,
        }}
      >
        {slots.map((_, i) => (
          <div
            key={i}
            style={{
              width: slotSize,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              visibility: i === safeIdx ? 'visible' : 'hidden',
            }}
          >
            <div
              style={{
                width: 0,
                height: 0,
                borderLeft: '6px solid transparent',
                borderRight: '6px solid transparent',
                borderBottom: `8px solid ${accentColor}`,
              }}
            />
            <span
              style={{
                fontFamily: FONT_MONO,
                fontSize: 14,
                fontWeight: 700,
                color: accentColor,
                marginTop: 4,
              }}
            >
              {pointerLabel}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
