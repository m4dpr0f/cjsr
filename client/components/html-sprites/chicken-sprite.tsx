import React from 'react';
import { BaseSprite, PixelBlock } from './base-sprite';
import { cn } from '@/lib/utils';

// Specific props for chicken sprites
export interface ChickenSpriteProps {
  variant: 'normal' | 'rare' | 'epic' | 'legendary' | 'special';
  colorScheme: string; // Primary color for the chicken
  secondaryColor?: string; // Secondary color for markings
  accessory?: 'none' | 'bow' | 'hat' | 'glasses' | 'necklace';
  accessoryColor?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  animation?: 'idle' | 'run' | 'jump' | 'attack' | 'none';
  direction?: 'left' | 'right';
  pixelSize?: number;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
  eggType?: string; // The egg this chicken hatched from (influences appearance)
  equipment?: string[]; // Equipment items the chicken is wearing
  name?: string;
  showName?: boolean;
}

// Generate chicken blocks based on props
function generateChickenBlocks(props: ChickenSpriteProps): PixelBlock[] {
  const { 
    variant, 
    colorScheme, 
    secondaryColor = '#FFFFFF', 
    accessory,
    accessoryColor = '#FFC107',
    eggType,
    equipment
  } = props;
  
  // Base colors for different chicken variants
  const variantColors = {
    normal: { primary: colorScheme || '#F5F5DC', secondary: secondaryColor || '#E3E3C7' },
    rare: { primary: colorScheme || '#B3E5FC', secondary: secondaryColor || '#81D4FA' },
    epic: { primary: colorScheme || '#CE93D8', secondary: secondaryColor || '#BA68C8' },
    legendary: { primary: colorScheme || '#FFD54F', secondary: secondaryColor || '#FFCA28' },
    special: { primary: colorScheme || '#81C784', secondary: secondaryColor || '#66BB6A' }
  };
  
  // Get colors based on variant
  const colors = variantColors[variant] || variantColors.normal;
  
  // Base chicken body blocks - profile view facing right
  const blocks: PixelBlock[] = [
    // Chicken body (main shape) - slightly larger for more detail
    { x: 5, y: 8, color: colors.primary, size: 8, layer: 1 }, // Body
    { x: 4, y: 9, color: colors.primary, size: 10, layer: 1 }, // Wider part
    { x: 5, y: 10, color: colors.primary, size: 8, layer: 1 }, // Lower body
    
    // Additional feather details
    { x: 5, y: 7, color: colors.secondary, size: 2, layer: 1, opacity: 0.8 }, // Top feather detail
    { x: 11, y: 8, color: colors.secondary, size: 2, layer: 1, opacity: 0.8 }, // Side feather detail
    
    // Chicken head
    { x: 12, y: 6, color: colors.primary, size: 4, layer: 2 }, // Head
    { x: 11, y: 7, color: colors.primary, size: 5, layer: 2 }, // Neck
    
    // Eye (just one visible from side)
    { x: 14, y: 5, color: '#000000', size: 1, layer: 3 },
    
    // Beak
    { x: 16, y: 6, color: '#FF9800', size: 2, layer: 3 },
    
    // Comb/crest
    { x: 13, y: 3, color: '#F44336', size: 1, layer: 3 },
    { x: 14, y: 2, color: '#F44336', size: 1, layer: 3 },
    { x: 15, y: 3, color: '#F44336', size: 1, layer: 3 },
    
    // Legs with improved details and spacing
    { x: 7, y: 11, color: '#FF9800', size: 1, layer: 2 }, // Front leg
    { x: 11, y: 11, color: '#FF9800', size: 1, layer: 2 }, // Back leg
    
    // Front foot with claws
    { x: 6, y: 12, color: '#FF9800', size: 1, layer: 2 }, // Front foot left side
    { x: 7, y: 12, color: '#FF9800', size: 1, layer: 2 }, // Front foot right side
    { x: 5, y: 13, color: '#E65100', size: 1, layer: 2 }, // Front claw left
    { x: 6, y: 13, color: '#E65100', size: 1, layer: 2 }, // Front claw middle
    { x: 7, y: 13, color: '#E65100', size: 1, layer: 2 }, // Front claw right
    
    // Back foot with claws - set apart from front foot
    { x: 10, y: 12, color: '#FF9800', size: 1, layer: 2 }, // Back foot left side
    { x: 11, y: 12, color: '#FF9800', size: 1, layer: 2 }, // Back foot right side
    { x: 9, y: 13, color: '#E65100', size: 1, layer: 2 }, // Back claw left
    { x: 10, y: 13, color: '#E65100', size: 1, layer: 2 }, // Back claw middle
    { x: 11, y: 13, color: '#E65100', size: 1, layer: 2 }, // Back claw right
    
    // Wing (visible from side)
    { x: 7, y: 7, color: colors.secondary, size: 4, layer: 2 },
    { x: 8, y: 6, color: colors.secondary, size: 3, layer: 2 },
    
    // Tail feathers
    { x: 2, y: 6, color: colors.secondary, size: 3, layer: 2 },
    { x: 1, y: 7, color: colors.secondary, size: 2, layer: 2 },
    { x: 2, y: 8, color: colors.secondary, size: 2, layer: 2 }
  ];
  
  // Add markings based on variant
  if (variant === 'rare' || variant === 'epic' || variant === 'legendary') {
    blocks.push(
      { x: 6, y: 8, color: colors.secondary, size: 1, layer: 2 },
      { x: 9, y: 9, color: colors.secondary, size: 1, layer: 2 },
      { x: 7, y: 11, color: colors.secondary, size: 1, layer: 2 }
    );
  }
  
  // Add special markings for legendary
  if (variant === 'legendary') {
    blocks.push(
      { x: 7, y: 4, color: '#FFD700', size: 1, layer: 4, opacity: 0.8 },
      { x: 11, y: 4, color: '#FFD700', size: 1, layer: 4, opacity: 0.8 },
      { x: 5, y: 6, color: '#FFD700', size: 1, layer: 4, opacity: 0.8 },
      { x: 13, y: 6, color: '#FFD700', size: 1, layer: 4, opacity: 0.8 }
    );
  }
  
  // Add accessory if specified
  if (accessory && accessory !== 'none') {
    switch(accessory) {
      case 'bow':
        blocks.push(
          { x: 10, y: 3, color: accessoryColor, size: 2, layer: 4 },
          { x: 11, y: 2, color: accessoryColor, size: 1, layer: 4 },
          { x: 10, y: 2, color: accessoryColor, size: 1, layer: 4 }
        );
        break;
      case 'hat':
        blocks.push(
          { x: 8, y: 3, color: accessoryColor, size: 4, layer: 4 },
          { x: 9, y: 2, color: accessoryColor, size: 2, layer: 4 },
          { x: 7, y: 4, color: accessoryColor, size: 1, layer: 4 },
          { x: 12, y: 4, color: accessoryColor, size: 1, layer: 4 }
        );
        break;
      case 'glasses':
        blocks.push(
          { x: 7, y: 6, color: accessoryColor, size: 2, layer: 4 },
          { x: 10, y: 6, color: accessoryColor, size: 2, layer: 4 },
          { x: 9, y: 6, color: accessoryColor, size: 1, layer: 4 }
        );
        break;
      case 'necklace':
        blocks.push(
          { x: 8, y: 9, color: accessoryColor, size: 1, layer: 4 },
          { x: 9, y: 9, color: accessoryColor, size: 1, layer: 4 },
          { x: 10, y: 9, color: accessoryColor, size: 1, layer: 4 },
          { x: 11, y: 9, color: accessoryColor, size: 1, layer: 4 }
        );
        break;
    }
  }
  
  // Apply egg-specific modifications if specified
  if (eggType) {
    // Each egg type can influence the chicken's appearance
    if (eggType === 'Lifestream Flare Egg') {
      blocks.push(
        { x: 7, y: 4, color: '#81C784', size: 1, layer: 4, opacity: 0.7 },
        { x: 11, y: 4, color: '#81C784', size: 1, layer: 4, opacity: 0.7 }
      );
    } else if (eggType === 'Crown of Doubt Egg') {
      blocks.push(
        { x: 9, y: 3, color: '#9575CD', size: 2, layer: 4 },
        { x: 8, y: 3, color: '#9575CD', size: 1, layer: 4 },
        { x: 11, y: 3, color: '#9575CD', size: 1, layer: 4 }
      );
    }
  }
  
  // Apply equipment if specified
  if (equipment && equipment.length > 0) {
    equipment.forEach(item => {
      if (item === 'armor') {
        blocks.push(
          { x: 7, y: 10, color: '#78909C', size: 2, layer: 3 },
          { x: 11, y: 10, color: '#78909C', size: 2, layer: 3 },
          { x: 8, y: 11, color: '#78909C', size: 4, layer: 3 }
        );
      } else if (item === 'saddle') {
        blocks.push(
          { x: 7, y: 8, color: '#8D6E63', size: 6, layer: 3 }
        );
      } else if (item === 'boots') {
        blocks.push(
          { x: 7, y: 13, color: '#5D4037', size: 1, layer: 3 },
          { x: 12, y: 13, color: '#5D4037', size: 1, layer: 3 }
        );
      }
    });
  }
  
  return blocks;
}

// Main Chicken Sprite Component
export function ChickenSprite(props: ChickenSpriteProps) {
  const {
    size = 'md',
    animation = 'idle',
    direction = 'right',
    pixelSize = 2,
    className,
    style,
    onClick,
    name,
    showName = false
  } = props;
  
  // Get chicken blocks based on props
  const chickenBlocks = generateChickenBlocks(props);
  
  // Set size based on prop
  const sizeMap = {
    xs: { width: 12, height: 12, pixelSize: pixelSize * 0.5 },
    sm: { width: 16, height: 16, pixelSize: pixelSize * 0.75 },
    md: { width: 20, height: 20, pixelSize },
    lg: { width: 24, height: 24, pixelSize: pixelSize * 1.25 }
  };
  
  const { width, height, pixelSize: adjustedPixelSize } = sizeMap[size];
  
  return (
    <div className={cn("flex flex-col items-center", className)}>
      <BaseSprite
        blocks={chickenBlocks}
        width={width}
        height={height}
        pixelSize={adjustedPixelSize}
        animation={animation}
        direction={direction}
        style={style}
        onClick={onClick}
      />
      
      {showName && name && (
        <div className="text-xs font-minecraft mt-1 text-center bg-black/50 px-1 rounded text-white">
          {name}
        </div>
      )}
    </div>
  );
}

// Preset chicken variants
export const ChickenPresets = {
  // Basic variants
  Normal: {
    variant: 'normal' as const,
    colorScheme: '#F5F5DC',
    secondaryColor: '#E3E3C7'
  },
  Golden: {
    variant: 'legendary' as const,
    colorScheme: '#FFD700',
    secondaryColor: '#FFC107'
  },
  Shadow: {
    variant: 'epic' as const,
    colorScheme: '#424242',
    secondaryColor: '#212121'
  },
  Azure: {
    variant: 'rare' as const,
    colorScheme: '#B3E5FC',
    secondaryColor: '#81D4FA'
  },
  Forest: {
    variant: 'special' as const,
    colorScheme: '#81C784',
    secondaryColor: '#66BB6A'
  },
  Royal: {
    variant: 'epic' as const,
    colorScheme: '#9575CD',
    secondaryColor: '#673AB7'
  },
  
  // Character-specific mounts
  Timaru: {
    variant: 'legendary' as const,
    colorScheme: '#B71C1C', // Deep red
    secondaryColor: '#D32F2F', // Brighter red accents
    accessory: 'glasses' as const,
    accessoryColor: '#4CAF50' // Green eye
  },
  Chalisa: {
    variant: 'legendary' as const,
    colorScheme: '#00838F', // Teal blue
    secondaryColor: '#FF5722', // Orange accents
    accessory: 'necklace' as const,
    accessoryColor: '#FFC107' // Gold jewelry
  },
  Brutus: {
    variant: 'legendary' as const,
    colorScheme: '#8D6E63', // Brown base
    secondaryColor: '#5D4037', // Darker brown for brindle pattern
    accessory: 'necklace' as const,
    accessoryColor: '#FFC107' // Gold collar
  },
  
  // Special Teacher Guru sprite - wise sage-like chicken
  TeacherGuru: {
    variant: 'special' as const,
    colorScheme: '#8D6E63', // Earthy brown
    secondaryColor: '#5D4037', // Darker brown accents
    accessory: 'hat' as const, // Wise hat
    accessoryColor: '#D4E157' // Sage green
  },
  
  // TEK8 Garu types based on lore
  EtherGaru: {
    variant: 'legendary' as const,
    colorScheme: '#FFFFFF', // Iridescent white
    secondaryColor: '#3F51B5', // Indigo accents
    accessory: 'necklace' as const,
    accessoryColor: '#C0C0C0' // Silver
  },
  AirGaru: {
    variant: 'rare' as const,
    colorScheme: '#81D4FA', // Sky blue
    secondaryColor: '#F0E68C', // Pale gold
    accessory: 'none' as const
  },
  // Auto's mount progression
  Ember: {
    variant: 'epic' as const,
    colorScheme: '#FF5722', // Bright red/orange fire color
    secondaryColor: '#FF9800', // Orange flames
    accessory: 'none' as const,
    eggType: 'fire'
  },
  
  // New vibrant NPC mounts for multiplayer races
  CrystalWing: {
    variant: 'legendary' as const,
    colorScheme: '#E91E63', // Hot pink crystal
    secondaryColor: '#F8BBD9', // Light pink shimmer
    accessory: 'glasses' as const,
    accessoryColor: '#9C27B0' // Purple crystal eye
  },
  ThunderBeak: {
    variant: 'epic' as const,
    colorScheme: '#3F51B5', // Electric blue
    secondaryColor: '#FFEB3B', // Lightning yellow
    accessory: 'necklace' as const,
    accessoryColor: '#FFC107' // Gold lightning collar
  },
  ShadowFeather: {
    variant: 'legendary' as const,
    colorScheme: '#263238', // Dark steel gray
    secondaryColor: '#607D8B', // Silver accents
    accessory: 'hat' as const,
    accessoryColor: '#9E9E9E' // Silver hood
  },
  PrismTail: {
    variant: 'rare' as const,
    colorScheme: '#00BCD4', // Cyan
    secondaryColor: '#E91E63', // Magenta highlights
    accessory: 'bow' as const,
    accessoryColor: '#FF9800' // Orange ribbon
  },
  VoidRunner: {
    variant: 'epic' as const,
    colorScheme: '#4A148C', // Deep purple
    secondaryColor: '#1A237E', // Dark blue void
    accessory: 'glasses' as const,
    accessoryColor: '#E1BEE7' // Light purple mystical eye
  },
  SolarFlare: {
    variant: 'legendary' as const,
    colorScheme: '#FF6F00', // Bright orange
    secondaryColor: '#FFEB3B', // Sun yellow
    accessory: 'necklace' as const,
    accessoryColor: '#F44336' // Red solar core
  },
  FrostWing: {
    variant: 'rare' as const,
    colorScheme: '#E3F2FD', // Ice blue
    secondaryColor: '#B3E5FC', // Lighter ice
    accessory: 'hat' as const,
    accessoryColor: '#81D4FA' // Frost crown
  },
  NeonRush: {
    variant: 'epic' as const,
    colorScheme: '#76FF03', // Electric lime
    secondaryColor: '#FF1744', // Neon red
    accessory: 'bow' as const,
    accessoryColor: '#E040FB' // Neon purple accent
  },
  FireGaru: {
    variant: 'epic' as const,
    colorScheme: '#F44336', // Crimson
    secondaryColor: '#212121', // Charcoal black
    accessory: 'necklace' as const,
    accessoryColor: '#FFC107' // Gold sparks
  },
  WaterGaru: {
    variant: 'rare' as const,
    colorScheme: '#0D47A1', // Deep blue
    secondaryColor: '#FFFFFF', // White
    accessory: 'necklace' as const,
    accessoryColor: '#CE93D8' // Lilac
  },
  EarthGaru: {
    variant: 'special' as const,
    colorScheme: '#4CAF50', // Moss green
    secondaryColor: '#795548', // Soil brown
    accessory: 'none' as const
  },
  ChaosGaru: {
    variant: 'legendary' as const,
    colorScheme: '#212121', // Black
    secondaryColor: '#FF4081', // Neon pink
    accessory: 'glasses' as const,
    accessoryColor: '#7C4DFF' // Glitch purple
  },
  OrderGaru: {
    variant: 'epic' as const,
    colorScheme: '#FFFFFF', // White
    secondaryColor: '#2196F3', // Light blue
    accessory: 'hat' as const,
    accessoryColor: '#C0C0C0' // Steel
  },
  WealthGaru: {
    variant: 'legendary' as const,
    colorScheme: '#FFD700', // Gold
    secondaryColor: '#FFFFFF', // Pearl
    accessory: 'necklace' as const,
    accessoryColor: '#00BFA5' // Green jade
  }
};