import React from 'react';
import {FONT_HEAVY, FONT_MONO, clamp} from '../lib';

export interface ExplodedLayer {
  id?: string;
  title: string;
  desc?: string;
  color?: string;
  height?: number;
}

export interface ExplodedNodeViewProps {
  layers: ExplodedLayer[];
  progress: number; // 0.0 = compact solid box -> 1.0 = fully exploded layers
  width?: number;
  maxSpread?: number; // total vertical spread in px (default: 260)
  accentColor?: string;
  style?: React.CSSProperties;
}

/**
 * ExplodedNodeView — Bóc tách linh kiện kiến trúc / Frame dữ liệu (Kiteva motion-024)
 * Tách một khối hộp thành các lớp phân rã lơ lửng trong không gian với các đường gióng liên kết.
 */
export const ExplodedNodeView: React.FC<ExplodedNodeViewProps> = ({
  layers,
  progress,
  width = 540,
  maxSpread = 240,
  accentColor = '#A855F7',
  style,
}) => {
  const p = clamp(progress, 0, 1);
  const total = layers.length;
  const ease = 1 - Math.pow(1 - p, 3); // smooth cubic out

  return (
    <div
      style={{
        position: 'relative',
        width,
        height: maxSpread + 120,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        ...style,
      }}
    >
      {layers.map((layer, i) => {
        // Calculate vertical spread offset from center
        const centerIndex = (total - 1) / 2;
        const offsetMultiplier = (i - centerIndex) / Math.max(1, centerIndex);
        const offsetY = offsetMultiplier * (maxSpread / 2) * ease;

        const layerColor = layer.color || accentColor;
        const layerHeight = layer.height || 54;

        return (
          <div
            key={layer.id || i}
            style={{
              position: 'absolute',
              width: '100%',
              height: layerHeight,
              transform: `translateY(${offsetY}px)`,
              backgroundColor: 'rgba(15, 18, 28, 0.92)',
              border: `1.5px solid ${layerColor}`,
              borderRadius: 10,
              boxShadow: `0 8px 24px rgba(0,0,0,0.5), 0 0 16px ${layerColor}22`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0 24px',
              boxSizing: 'border-box',
              transition: 'none',
              zIndex: i + 1,
            }}
          >
            {/* Title & Desc */}
            <div style={{display: 'flex', alignItems: 'center', gap: 14}}>
              <span
                style={{
                  fontFamily: FONT_MONO,
                  fontSize: 12,
                  color: layerColor,
                  fontWeight: 700,
                  backgroundColor: `${layerColor}22`,
                  padding: '2px 8px',
                  borderRadius: 4,
                }}
              >
                LAYER 0{i + 1}
              </span>
              <span
                style={{
                  fontFamily: FONT_HEAVY,
                  fontSize: 18,
                  fontWeight: 700,
                  color: '#FFFFFF',
                }}
              >
                {layer.title}
              </span>
            </div>

            {layer.desc && (
              <span
                style={{
                  fontFamily: FONT_MONO,
                  fontSize: 13,
                  color: '#94A3B8',
                }}
              >
                {layer.desc}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
};
