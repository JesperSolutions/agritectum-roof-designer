import React, { useRef, useEffect } from 'react';
import { Stage, Layer, Rect, Text } from 'react-konva';
import { ZoneBlock } from '../types';

interface Canvas2DProps {
  blocks: ZoneBlock[];
  onBlocksChange: (blocks: ZoneBlock[]) => void;
}

const ZONE_COLORS = {
  GREEN: '#22c55e',
  SOLAR: '#f59e0b',
  WATER: '#3b82f6',
  SOCIAL: '#a855f7',
};

const ZONE_LABELS = {
  GREEN: 'Green Roof',
  SOLAR: 'Solar Panels',
  WATER: 'Water Management',
  SOCIAL: 'Social Space',
};

export function Canvas2D({ blocks, onBlocksChange }: Canvas2DProps) {
  const stageRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleBlockDrag = (blockId: string, newPos: { x: number; y: number }) => {
    const updatedBlocks = blocks.map(block =>
      block.id === blockId ? { ...block, x: newPos.x, y: newPos.y } : block
    );
    onBlocksChange(updatedBlocks);
  };

  return (
    <div ref={containerRef} className="w-full h-96 border rounded-lg bg-gray-50">
      <Stage
        ref={stageRef}
        width={800}
        height={400}
        className="cursor-move"
      >
        <Layer>
          {/* Roof outline */}
          <Rect
            x={50}
            y={50}
            width={700}
            height={300}
            stroke="#374151"
            strokeWidth={2}
            fill="transparent"
            dash={[5, 5]}
          />
          
          {/* Zone blocks */}
          {blocks.map((block) => (
            <React.Fragment key={block.id}>
              <Rect
                x={50 + block.x}
                y={50 + block.y}
                width={block.width * 3} // Scale for visualization
                height={block.height * 2}
                fill={ZONE_COLORS[block.type]}
                opacity={0.7}
                stroke={ZONE_COLORS[block.type]}
                strokeWidth={2}
                draggable={!block.locked}
                onDragEnd={(e) => {
                  handleBlockDrag(block.id, {
                    x: (e.target.x() - 50),
                    y: (e.target.y() - 50),
                  });
                }}
              />
              <Text
                x={50 + block.x + 10}
                y={50 + block.y + 10}
                text={ZONE_LABELS[block.type]}
                fontSize={12}
                fill="white"
                fontStyle="bold"
              />
              <Text
                x={50 + block.x + 10}
                y={50 + block.y + 25}
                text={`${Math.round(block.width * block.height)} m²`}
                fontSize={10}
                fill="white"
              />
            </React.Fragment>
          ))}
        </Layer>
      </Stage>
    </div>
  );
}