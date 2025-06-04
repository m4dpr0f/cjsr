import React from 'react';
import { cn } from "@/lib/utils";

// Basic pixel block for constructing sprites
export interface PixelBlock {
  x: number;
  y: number;
  color: string;
  size?: number;
  opacity?: number; // For transparent effects
  layer?: number; // For z-index control (higher numbers appear on top)
  className?: string; // For additional styling
}

// Base sprite component props
export interface BaseSpriteProps {
  width?: number;
  height?: number;
  pixelSize?: number;
  className?: string;
  style?: React.CSSProperties;
  blocks: PixelBlock[];
  animation?: "idle" | "run" | "jump" | "attack" | "none";
  direction?: "left" | "right";
  scale?: number;
  onClick?: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

// The base sprite component that renders individual pixel blocks
export function BaseSprite({
  width = 16,
  height = 24,
  pixelSize = 2,
  className,
  style,
  blocks,
  animation = "none",
  direction = "right",
  scale = 1,
  onClick,
  onMouseEnter,
  onMouseLeave
}: BaseSpriteProps) {
  // Sort blocks by layer (if specified) to control z-index
  const sortedBlocks = [...blocks].sort((a, b) => 
    (a.layer || 0) - (b.layer || 0)
  );
  
  // Get animation class based on animation type
  const getAnimationClass = () => {
    switch(animation) {
      case "run": return "animate-sprite-run";
      case "jump": return "animate-sprite-jump";
      case "attack": return "animate-sprite-attack";
      case "idle": return "animate-sprite-idle";
      default: return "";
    }
  };

  return (
    <div 
      className={cn(
        "relative inline-block",
        className
      )} 
      style={{
        ...style,
        transform: `scale(${scale})`
      }}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div 
        className={cn(
          "relative",
          getAnimationClass(),
          direction === "left" && "scale-x-[-1]"
        )}
        style={{
          width: `${width * pixelSize}px`,
          height: `${height * pixelSize}px`,
          imageRendering: "pixelated"
        }}
      >
        {sortedBlocks.map((block, index) => (
          <div
            key={index}
            className={cn(
              "absolute",
              block.className
            )}
            style={{
              left: `${block.x * pixelSize}px`,
              top: `${block.y * pixelSize}px`,
              width: `${(block.size || 1) * pixelSize}px`,
              height: `${(block.size || 1) * pixelSize}px`,
              backgroundColor: block.color,
              opacity: block.opacity || 1,
              zIndex: block.layer || 0
            }}
          />
        ))}
      </div>
    </div>
  );
}