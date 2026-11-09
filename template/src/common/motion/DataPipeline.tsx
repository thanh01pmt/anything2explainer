import React from 'react';
import {FONT_HEAVY, FONT_MONO, clamp} from '../lib';

export interface PipelineNode {
  id: string;
  label: string;
  sub?: string;
  icon?: string;
}

export interface DataPipelineProps {
  nodes: PipelineNode[];
  activeNodeIndex?: number;
  packetProgress?: number; // 0.0 -> 1.0 (packet moving from node i to i+1)
  width?: number;
  height?: number;
  nodeWidth?: number;
  nodeHeight?: number;
  accentColor?: string;
  baseColor?: string;
  style?: React.CSSProperties;
}

/**
 * DataPipeline — Trực quan hóa luồng dữ liệu (Kiteva motion-018)
 * Các Node kiến trúc kết nối bằng đường ống với các gói dữ liệu (data packets) di chuyển mượt mà.
 */
export const DataPipeline: React.FC<DataPipelineProps> = ({
  nodes,
  activeNodeIndex = 0,
  packetProgress = 0,
  width = 960,
  height = 140,
  nodeWidth = 180,
  nodeHeight = 72,
  accentColor = '#A855F7',
  baseColor = 'rgba(255, 255, 255, 0.2)',
  style,
}) => {
  if (nodes.length === 0) return null;

  const totalSteps = nodes.length - 1;
  const spacing = totalSteps > 0 ? (width - nodes.length * nodeWidth) / totalSteps : 0;

  // Node centers
  const nodeCenters = nodes.map((_, i) => ({
    x: i * (nodeWidth + spacing) + nodeWidth / 2,
    y: height / 2,
  }));

  // Packet position calculation
  const safeActive = clamp(activeNodeIndex, 0, Math.max(0, totalSteps));
  const p = clamp(packetProgress, 0, 1);

  let packetX = nodeCenters[safeActive]?.x || 0;
  let packetY = nodeCenters[safeActive]?.y || height / 2;

  if (safeActive < totalSteps) {
    const p1 = nodeCenters[safeActive];
    const p2 = nodeCenters[safeActive + 1];
    packetX = p1.x + (p2.x - p1.x) * p;
    packetY = p1.y + (p2.y - p1.y) * p;
  }

  return (
    <div
      style={{
        position: 'relative',
        width,
        height,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        ...style,
      }}
    >
      {/* SVG Connection Pipes & Traveling Packet */}
      <svg
        width={width}
        height={height}
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          pointerEvents: 'none',
          overflow: 'visible',
        }}
      >
        {/* Base Pipe Line */}
        {totalSteps > 0 && (
          <line
            x1={nodeCenters[0].x}
            y1={height / 2}
            x2={nodeCenters[totalSteps].x}
            y2={height / 2}
            stroke={baseColor}
            strokeWidth={3}
            strokeDasharray="6 6"
          />
        )}

        {/* Active Flow Line */}
        {safeActive > 0 && (
          <line
            x1={nodeCenters[0].x}
            y1={height / 2}
            x2={nodeCenters[safeActive].x}
            y2={height / 2}
            stroke={accentColor}
            strokeWidth={3}
          />
        )}

        {/* Traveling Data Packet (Glow Pulse) */}
        {totalSteps > 0 && safeActive < totalSteps && (
          <g transform={`translate(${packetX}, ${packetY})`}>
            {/* Outer Glow */}
            <circle r={10} fill={accentColor} fillOpacity={0.35} />
            {/* Core Pulse */}
            <circle r={5} fill="#FFFFFF" />
          </g>
        )}
      </svg>

      {/* Render Node Boxes */}
      {nodes.map((node, i) => {
        const isActive = i === activeNodeIndex;
        const isCompleted = i < activeNodeIndex;

        return (
          <div
            key={node.id || i}
            style={{
              zIndex: 2,
              width: nodeWidth,
              height: nodeHeight,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: isActive
                ? 'rgba(168, 85, 247, 0.18)'
                : isCompleted
                ? 'rgba(16, 185, 129, 0.15)'
                : 'rgba(15, 18, 28, 0.85)',
              border: `2px solid ${
                isActive ? accentColor : isCompleted ? '#10B981' : 'rgba(255, 255, 255, 0.15)'
              }`,
              borderRadius: 12,
              boxShadow: isActive ? `0 0 24px ${accentColor}44` : 'none',
              transition: 'none',
              boxSizing: 'border-box',
            }}
          >
            <span
              style={{
                fontFamily: FONT_HEAVY,
                fontSize: 18,
                fontWeight: 700,
                color: isActive ? '#FFFFFF' : isCompleted ? '#10B981' : '#94A3B8',
              }}
            >
              {node.label}
            </span>
            {node.sub && (
              <span
                style={{
                  fontFamily: FONT_MONO,
                  fontSize: 12,
                  color: isActive ? accentColor : 'rgba(255, 255, 255, 0.45)',
                  marginTop: 2,
                }}
              >
                {node.sub}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
};

