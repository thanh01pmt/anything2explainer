import React from 'react';
import { DuotoneImage } from './MediaEffects';

/**
 * getColBox: Hàm toán học tính toán vị trí và kích thước phần tử theo lưới 12 cột.
 * Giúp mọi khung hình tự động căn đều, tuân thủ tỷ lệ an toàn, không cần tự đoán tọa độ pixel x, y.
 * 
 * @param startCol Cột bắt đầu (1 đến 12)
 * @param spanCols Số cột chiếm (1 đến 12)
 * @param y Tọa độ đỉnh Y
 * @param h Chiều cao H
 * @param gutter Khoảng cách giữa các cột (mặc định 24px)
 * @param margin Lề trái/phải khung hình (mặc định 80px)
 */
export const getColBox = (
  startCol: number,
  spanCols: number,
  y: number,
  h: number,
  gutter = 24,
  margin = 80,
): { position: 'absolute'; left: number; top: number; width: number; height: number } => {
  const contentWidth = 1280 - margin * 2;
  const colWidth = (contentWidth - gutter * 11) / 12;
  const left = margin + (startCol - 1) * (colWidth + gutter);
  const width = spanCols * colWidth + (spanCols - 1) * gutter;
  return {
    position: 'absolute',
    left,
    top: y,
    width,
    height: h,
  };
};

/**
 * SplitCard: Bố cục 2 phần kinh điển cho Explainer Video.
 * Nửa trái: Ảnh tư liệu / B-roll Pexels/Unsplash (đã qua Duotone filter).
 * Nửa phải: Khung phân tích dữ liệu / Sơ đồ luồng SVG / Code infographic.
 */
export const SplitCard: React.FC<{
  imageSrc: string;
  imageColSpan?: number;
  y?: number;
  h?: number;
  shadowColor?: string;
  highlightColor?: string;
  children: React.ReactNode;
}> = ({
  imageSrc,
  imageColSpan = 5,
  y = 140,
  h = 460,
  shadowColor = '#0B0C11',
  highlightColor = '#A175F1',
  children,
}) => {
  const rightStartCol = imageColSpan + 1;
  const rightColSpan = 12 - imageColSpan;

  return (
    <>
      {/* Vùng B-roll tư liệu thực tế (Trái) */}
      <div
        style={{
          ...getColBox(1, imageColSpan, y, h),
          borderRadius: 12,
          overflow: 'hidden',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.6)',
        }}
      >
        <DuotoneImage
          src={imageSrc}
          shadowColor={shadowColor}
          highlightColor={highlightColor}
          style={{ width: '100%', height: '100%' }}
        />
      </div>

      {/* Vùng Phân tích đồ họa / Diagram (Phải) */}
      <div
        style={{
          ...getColBox(rightStartCol, rightColSpan, y, h),
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
        }}
      >
        {children}
      </div>
    </>
  );
};
