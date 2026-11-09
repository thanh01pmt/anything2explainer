import React from 'react';
import {FONT_HEAVY, FONT_MONO, clamp} from '../lib';

export interface BarRaceItem {
  id: string;
  label: string;
  value: number; // raw value
  color?: string;
  unit?: string;
}

export interface RankedBarRaceProps {
  items: BarRaceItem[];
  progress?: number; // 0.0 -> 1.0 (bar growth progress)
  width?: number;
  barHeight?: number;
  gap?: number;
  maxValue?: number;
  accentColor?: string;
  style?: React.CSSProperties;
}

/**
 * RankedBarRace — Biểu đồ thanh ngang so sánh thứ hạng hiệu năng (Kiteva motion-047)
 * Tự động sắp xếp các thanh theo thứ tự giảm dần và diễn hoạt độ dài thanh mượt mà.
 */
export const RankedBarRace: React.FC<RankedBarRaceProps> = ({
  items,
  progress = 1.0,
  width = 680,
  barHeight = 44,
  gap = 14,
  maxValue,
  accentColor = '#A855F7',
  style,
}) => {
  const p = clamp(progress, 0, 1);
  const ease = 1 - Math.pow(1 - p, 3);

  // Compute maximum value for scaling
  const maxVal = maxValue || Math.max(...items.map((it) => it.value), 1);

  // Sort descending by value
  const sorted = [...items].sort((a, b) => b.value - a.value);

  const labelWidth = 140;
  const barMaxWidth = width - labelWidth - 90;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap,
        width,
        ...style,
      }}
    >
      {sorted.map((item, rank) => {
        const barWidth = (item.value / maxVal) * barMaxWidth * ease;
        const color = item.color || (rank === 0 ? accentColor : '#64748B');
        const isLeader = rank === 0;

        return (
          <div
            key={item.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              height: barHeight,
              gap: 12,
            }}
          >
            {/* Label */}
            <div
              style={{
                width: labelWidth,
                textAlign: 'right',
                fontFamily: FONT_HEAVY,
                fontSize: 16,
                fontWeight: isLeader ? 800 : 600,
                color: isLeader ? '#FFFFFF' : '#94A3B8',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {item.label}
            </div>

            {/* Bar */}
            <div
              style={{
                position: 'relative',
                flex: 1,
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <div
                style={{
                  width: Math.max(12, barWidth),
                  height: barHeight * 0.72,
                  backgroundColor: color,
                  borderRadius: 6,
                  boxShadow: isLeader ? `0 0 16px ${color}55` : 'none',
                  transition: 'none',
                }}
              />

              {/* Value Badge */}
              <span
                style={{
                  marginLeft: 12,
                  fontFamily: FONT_MONO,
                  fontSize: 14,
                  fontWeight: 700,
                  color: isLeader ? '#FFFFFF' : '#94A3B8',
                }}
              >
                {Math.round(item.value * ease)}
                {item.unit || ''}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
