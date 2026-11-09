import React from 'react';
import {W, H} from '../lib';

export interface CameraOrbitRigProps {
  orbitY?: number; // degrees horizontal rotation (-45 to 45)
  orbitX?: number; // degrees vertical tilt (-30 to 30)
  zoom?: number; // camera zoom multiplier (e.g. 1.0 to 1.5)
  panX?: number; // camera horizontal translation (px)
  panY?: number; // camera vertical translation (px)
  perspective?: number; // viewport perspective in px (default: 1000)
  style?: React.CSSProperties;
  children: React.ReactNode;
}

/**
 * CameraOrbitRig — Khung camera 3D mô phỏng xoay và phóng thu (Kiteva motion-014)
 * Bao bọc các phần tử đồ họa 2D/3D trong không gian phối cảnh 3 chiều với chuyển động mượt mà.
 */
export const CameraOrbitRig: React.FC<CameraOrbitRigProps> = ({
  orbitY = 0,
  orbitX = 0,
  zoom = 1.0,
  panX = 0,
  panY = 0,
  perspective = 1100,
  style,
  children,
}) => {
  return (
    <div
      style={{
        position: 'relative',
        width: W,
        height: H,
        perspective,
        overflow: 'hidden',
        transformStyle: 'preserve-3d',
        ...style,
      }}
    >
      <div
        style={{
          width: '100%',
          height: '100%',
          transformStyle: 'preserve-3d',
          transform: `translate3d(${panX}px, ${panY}px, 0) scale(${zoom}) rotateX(${orbitX}deg) rotateY(${orbitY}deg)`,
          transformOrigin: 'center center',
          transition: 'none',
        }}
      >
        {children}
      </div>
    </div>
  );
};
