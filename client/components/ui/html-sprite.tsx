import React from 'react';
import { cn } from "@/lib/utils";

interface PixelBlock {
  x: number;
  y: number;
  color: string;
  size?: number;
}

interface HTMLSpriteProps {
  width?: number;
  height?: number;
  pixelSize?: number;
  className?: string;
  style?: React.CSSProperties;
  blocks: PixelBlock[];
  name: string;
  pixelated?: boolean;
  animation?: "idle" | "run" | "none";
}

export function HTMLSprite({
  width = 16,
  height = 24,
  pixelSize = 2,
  className,
  style,
  blocks,
  name,
  pixelated = true,
  animation = "none"
}: HTMLSpriteProps) {
  return (
    <div className={cn("relative", className)} style={style}>
      <div 
        className={cn(
          "relative flex flex-wrap content-start",
          animation === "run" && "animate-sprite-bounce",
          pixelated && "image-rendering-pixelated"
        )}
        style={{
          width: `${width * pixelSize}px`,
          height: `${height * pixelSize}px`
        }}
      >
        {blocks.map((block, index) => (
          <div
            key={index}
            className="absolute"
            style={{
              left: `${block.x * pixelSize}px`,
              top: `${block.y * pixelSize}px`,
              width: `${(block.size || 1) * pixelSize}px`,
              height: `${(block.size || 1) * pixelSize}px`,
              backgroundColor: block.color,
            }}
          />
        ))}
      </div>
      {name && (
        <div className="text-xs text-center mt-1 font-minecraft">{name}</div>
      )}
    </div>
  );
}

// Character definitions

// Matikah character (green/nature themed)
export const MatikahBlocks: PixelBlock[] = [
  // Head - green with leaf accents
  { x: 6, y: 1, color: '#4CAF50', size: 4 }, // Head base
  
  // Facial features
  { x: 7, y: 2, color: '#263238', size: 1 }, // Left eye
  { x: 8, y: 2, color: '#263238', size: 1 }, // Right eye
  { x: 7, y: 4, color: '#3E2723', size: 2 }, // Mouth
  
  // Leafy hair/headdress
  { x: 5, y: 0, color: '#81C784', size: 1 },
  { x: 6, y: 0, color: '#81C784', size: 1 },
  { x: 7, y: 0, color: '#388E3C', size: 2 },
  { x: 9, y: 0, color: '#81C784', size: 1 },
  { x: 10, y: 0, color: '#81C784', size: 1 },
  { x: 4, y: 1, color: '#388E3C', size: 2 },
  { x: 10, y: 1, color: '#388E3C', size: 2 },
  { x: 4, y: 2, color: '#81C784', size: 1 },
  { x: 11, y: 2, color: '#81C784', size: 1 },
  
  // Body
  { x: 6, y: 5, color: '#33691E', size: 4 }, // Upper body
  { x: 5, y: 7, color: '#558B2F', size: 6 }, // Lower body
  
  // Arms
  { x: 4, y: 5, color: '#33691E', size: 2 }, // Left arm
  { x: 10, y: 5, color: '#33691E', size: 2 }, // Right arm
  { x: 3, y: 6, color: '#558B2F', size: 2 }, // Left forearm
  { x: 11, y: 6, color: '#558B2F', size: 2 }, // Right forearm
  
  // Legs
  { x: 6, y: 9, color: '#33691E', size: 2 }, // Left leg
  { x: 8, y: 9, color: '#33691E', size: 2 }, // Right leg
  { x: 6, y: 11, color: '#558B2F', size: 2 }, // Left foot
  { x: 8, y: 11, color: '#558B2F', size: 2 }, // Right foot
];

// Death character (dark/spectral themed)
export const DeathBlocks: PixelBlock[] = [
  // Hooded head
  { x: 6, y: 1, color: '#212121', size: 4 }, // Hood
  
  // Facial features - glowing eyes
  { x: 7, y: 3, color: '#F44336', size: 1 }, // Left eye
  { x: 8, y: 3, color: '#F44336', size: 1 }, // Right eye
  
  // Robe body
  { x: 5, y: 5, color: '#424242', size: 6 }, // Upper robe
  { x: 4, y: 8, color: '#212121', size: 8 }, // Lower robe
  
  // Arms
  { x: 3, y: 6, color: '#212121', size: 2 }, // Left arm
  { x: 11, y: 6, color: '#212121', size: 2 }, // Right arm
  { x: 2, y: 7, color: '#424242', size: 2 }, // Left hand
  { x: 12, y: 7, color: '#424242', size: 2 }, // Right hand
  
  // Scythe (optional)
  { x: 14, y: 4, color: '#795548', size: 1 }, // Handle top
  { x: 14, y: 5, color: '#795548', size: 1 }, // Handle
  { x: 14, y: 6, color: '#795548', size: 1 }, // Handle
  { x: 14, y: 7, color: '#795548', size: 1 }, // Handle
  { x: 14, y: 8, color: '#795548', size: 1 }, // Handle
  { x: 13, y: 3, color: '#BDBDBD', size: 1 }, // Blade
  { x: 14, y: 2, color: '#BDBDBD', size: 1 }, // Blade
  { x: 15, y: 2, color: '#BDBDBD', size: 1 }, // Blade
  { x: 15, y: 3, color: '#BDBDBD', size: 1 }, // Blade
];

// Auto character (mechanical/tech themed)
export const AutoBlocks: PixelBlock[] = [
  // Mechanical head
  { x: 6, y: 1, color: '#2196F3', size: 4 }, // Head base
  
  // Face elements
  { x: 7, y: 2, color: '#FFEB3B', size: 1 }, // Left eye/sensor
  { x: 8, y: 2, color: '#FFEB3B', size: 1 }, // Right eye/sensor
  { x: 7, y: 4, color: '#90CAF9', size: 2 }, // Mouth/speaker
  
  // Antenna
  { x: 7, y: 0, color: '#1565C0', size: 2 },
  { x: 8, y: -1, color: '#F44336', size: 1 }, // Red light
  
  // Robotic body
  { x: 6, y: 5, color: '#1976D2', size: 4 }, // Torso
  { x: 7, y: 6, color: '#90CAF9', size: 2 }, // Control panel
  
  // Arms
  { x: 4, y: 5, color: '#0D47A1', size: 2 }, // Left arm
  { x: 10, y: 5, color: '#0D47A1', size: 2 }, // Right arm
  { x: 3, y: 6, color: '#1565C0', size: 2 }, // Left forearm
  { x: 11, y: 6, color: '#1565C0', size: 2 }, // Right forearm
  
  // Legs
  { x: 6, y: 9, color: '#0D47A1', size: 2 }, // Left leg
  { x: 8, y: 9, color: '#0D47A1', size: 2 }, // Right leg
  { x: 6, y: 11, color: '#1565C0', size: 2 }, // Left foot
  { x: 8, y: 11, color: '#1565C0', size: 2 }, // Right foot
  
  // Tech details
  { x: 5, y: 7, color: '#90CAF9', size: 1 }, // Left light
  { x: 10, y: 7, color: '#90CAF9', size: 1 }, // Right light
];

// Iam character (mysterious/shadowy themed)
export const IamBlocks: PixelBlock[] = [
  // Hooded/masked head
  { x: 6, y: 1, color: '#9C27B0', size: 4 }, // Head base
  
  // Face - mostly concealed
  { x: 7, y: 2, color: '#E1BEE7', size: 1 }, // Left eye glow
  { x: 8, y: 2, color: '#E1BEE7', size: 1 }, // Right eye glow
  
  // Cloaked body
  { x: 5, y: 5, color: '#7B1FA2', size: 6 }, // Upper body
  { x: 4, y: 8, color: '#6A1B9A', size: 8 }, // Lower cloak
  
  // Arms - slightly transparent/ghostly
  { x: 3, y: 6, color: '#9C27B0', size: 2 }, // Left arm
  { x: 11, y: 6, color: '#9C27B0', size: 2 }, // Right arm
  
  // Mystical effects
  { x: 3, y: 3, color: '#CE93D8', size: 1 }, // Left side wisp
  { x: 12, y: 3, color: '#CE93D8', size: 1 }, // Right side wisp
  { x: 4, y: 4, color: '#CE93D8', size: 1 }, // Left wisp
  { x: 11, y: 4, color: '#CE93D8', size: 1 }, // Right wisp
  { x: 2, y: 9, color: '#CE93D8', size: 1 }, // Bottom left wisp
  { x: 13, y: 9, color: '#CE93D8', size: 1 }, // Bottom right wisp
];

// Steve character (blocky/classic themed)
export const SteveBlocks: PixelBlock[] = [
  // Blocky head
  { x: 6, y: 1, color: '#FFA726', size: 4 }, // Head
  
  // Face
  { x: 7, y: 2, color: '#3E2723', size: 1 }, // Left eye
  { x: 8, y: 2, color: '#3E2723', size: 1 }, // Right eye
  { x: 7, y: 3, color: '#5D4037', size: 2 }, // Nose
  { x: 7, y: 4, color: '#3E2723', size: 2 }, // Mouth/beard
  
  // Hair
  { x: 6, y: 1, color: '#5D4037', size: 4 }, // Hair line
  
  // Body
  { x: 6, y: 5, color: '#1976D2', size: 4 }, // Blue shirt
  { x: 6, y: 9, color: '#795548', size: 4 }, // Brown pants
  
  // Arms
  { x: 4, y: 5, color: '#1976D2', size: 2 }, // Left arm
  { x: 10, y: 5, color: '#1976D2', size: 2 }, // Right arm
  { x: 4, y: 7, color: '#FFA726', size: 2 }, // Left hand
  { x: 10, y: 7, color: '#FFA726', size: 2 }, // Right hand
  
  // Legs
  { x: 6, y: 13, color: '#5D4037', size: 2 }, // Left boot
  { x: 8, y: 13, color: '#5D4037', size: 2 }, // Right boot
];

// Character mapping for easy lookup
export const characterSprites: Record<string, PixelBlock[]> = {
  "matikah": MatikahBlocks,
  "death": DeathBlocks,
  "auto": AutoBlocks,
  "iam": IamBlocks,
  "steve": SteveBlocks
};