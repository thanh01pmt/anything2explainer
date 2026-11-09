import React from 'react';
import { clamp01 } from '../common';

/**
 * DrawPath: Tự động vẽ đường nét vector SVG theo tiến độ (progress 0 -> 1)
 * dùng stroke-dashoffset toán học, không cần tải thư viện ngoài.
 */
export const DrawPath: React.FC<{
  d: string;
  progress: number;
  stroke?: string;
  strokeWidth?: number;
  totalLength?: number;
  dashed?: boolean;
}> = ({
  d,
  progress,
  stroke = '#FFFFFF',
  strokeWidth = 2,
  totalLength = 1200,
  dashed = false,
}) => {
  const p = clamp01(progress);
  return (
    <path
      d={d}
      fill="none"
      stroke={stroke}
      strokeWidth={strokeWidth}
      strokeDasharray={dashed ? '8 6' : totalLength}
      strokeDashoffset={totalLength * (1 - p)}
      style={{
        transition: 'stroke-dashoffset 0.05s linear',
      }}
    />
  );
};

/**
 * ScanlineOverlay: Hiệu ứng quét dòng CRT / Terminal dành cho chủ đề hacker, cyber, devops.
 */
export const ScanlineOverlay: React.FC<{
  opacity?: number;
  lineSpacing?: number;
}> = ({ opacity = 0.12, lineSpacing = 4 }) => (
  <div
    style={{
      position: 'absolute',
      inset: 0,
      pointerEvents: 'none',
      opacity,
      backgroundImage: `repeating-linear-gradient(0deg, rgba(0, 0, 0, 0.9) 0px, rgba(0, 0, 0, 0.9) 1px, transparent 1px, transparent ${lineSpacing}px)`,
      zIndex: 40,
    }}
  />
);

/**
 * BoundingBoxTracker: Khung định vị mục tiêu phong cách máy học / thị giác máy tính
 * Đặt lên trên ảnh stock để tạo cảm giác "hệ thống AI đang phân tích dữ liệu".
 */
export const BoundingBoxTracker: React.FC<{
  x: number;
  y: number;
  w: number;
  h: number;
  label?: string;
  confidence?: string;
  accentColor?: string;
  cornerSize?: number;
}> = ({
  x,
  y,
  w,
  h,
  label = 'TARGET',
  confidence = '99.4%',
  accentColor = '#00F0FF',
  cornerSize = 14,
}) => (
  <div
    style={{
      position: 'absolute',
      left: x,
      top: y,
      width: w,
      height: h,
      border: `1px dashed ${accentColor}66`,
      pointerEvents: 'none',
    }}
  >
    {/* 4 góc nhọn công nghệ */}
    <div style={{ position: 'absolute', left: -1, top: -1, width: cornerSize, height: cornerSize, borderLeft: `2px solid ${accentColor}`, borderTop: `2px solid ${accentColor}` }} />
    <div style={{ position: 'absolute', right: -1, top: -1, width: cornerSize, height: cornerSize, borderRight: `2px solid ${accentColor}`, borderTop: `2px solid ${accentColor}` }} />
    <div style={{ position: 'absolute', left: -1, bottom: -1, width: cornerSize, height: cornerSize, borderLeft: `2px solid ${accentColor}`, borderBottom: `2px solid ${accentColor}` }} />
    <div style={{ position: 'absolute', right: -1, bottom: -1, width: cornerSize, height: cornerSize, borderRight: `2px solid ${accentColor}`, borderBottom: `2px solid ${accentColor}` }} />

    {/* Nhãn tag hiển thị thông số */}
    <div
      style={{
        position: 'absolute',
        top: -24,
        left: -1,
        backgroundColor: accentColor,
        color: '#000',
        padding: '2px 8px',
        fontSize: 12,
        fontWeight: 800,
        fontFamily: 'monospace',
        borderRadius: 2,
        display: 'flex',
        gap: 6,
      }}
    >
      <span>{label}</span>
      <span>{confidence}</span>
    </div>
  </div>
);

/**
 * BlueprintGrid: Lưới kỹ thuật CAD toán học với các dấu cộng (+), rất hợp với Technical Blueprint Preset.
 */
export const BlueprintGrid: React.FC<{
  gridSize?: number;
  color?: string;
  opacity?: number;
}> = ({ gridSize = 64, color = 'rgba(0, 240, 255, 0.15)', opacity = 1.0 }) => (
  <div
    style={{
      position: 'absolute',
      inset: 0,
      opacity,
      pointerEvents: 'none',
      backgroundImage: `
        linear-gradient(to right, ${color} 1px, transparent 1px),
        linear-gradient(to bottom, ${color} 1px, transparent 1px)
      `,
      backgroundSize: `${gridSize}px ${gridSize}px`,
    }}
  />
);
