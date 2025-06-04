import React from 'react';
import { ChickenSprite, ChickenSpriteProps, ChickenPresets } from './chicken-sprite';
import { JockeySprite, JockeySpriteProps } from './jockey-sprite';
import { cn } from '@/lib/utils';

// Combined props for the ChickenJockey component
export interface ChickenJockeyProps {
  chicken: Omit<ChickenSpriteProps, 'name' | 'showName'>;
  jockey: Omit<JockeySpriteProps, 'name' | 'showName'>;
  name?: string;
  showName?: boolean;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  animation?: 'idle' | 'run' | 'jump' | 'attack' | 'none';
  direction?: 'left' | 'right';
  pixelSize?: number;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

export function ChickenJockey({
  chicken,
  jockey,
  name,
  showName = false,
  size = 'md',
  animation = 'idle',
  direction = 'right',
  pixelSize = 2,
  className,
  style,
  onClick,
  onMouseEnter,
  onMouseLeave
}: ChickenJockeyProps) {
  // Size adjustments for proper scaling and positioning
  const sizeMap = {
    xs: { scale: 0.8, topOffset: -4, leftOffset: -1 },
    sm: { scale: 1.2, topOffset: -8, leftOffset: -2 },
    md: { scale: 1.5, topOffset: -12, leftOffset: -4 },
    lg: { scale: 1.8, topOffset: -16, leftOffset: -6 }
  };
  
  const { scale, topOffset, leftOffset } = sizeMap[size];
  
  return (
    <div 
      className={cn(
        "relative inline-block",
        className
      )}
      style={style}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {/* Chicken on bottom layer */}
      <div className="relative">
        <ChickenSprite
          {...chicken}
          size={size}
          animation={animation}
          direction={direction}
          pixelSize={pixelSize}
          showName={false}
        />
      </div>
      
      {/* Jockey positioned on top of chicken */}
      <div 
        className="absolute" 
        style={{ 
          top: `${topOffset}px`, 
          left: `${leftOffset}px`,
        }}
      >
        <JockeySprite
          {...jockey}
          size={size}
          animation={animation === 'run' ? 'idle' : animation} // Jockey doesn't run, the chicken does
          direction={direction}
          pixelSize={pixelSize}
          showName={false}
        />
      </div>
      
      {/* Display name if enabled */}
      {showName && name && (
        <div className="text-xs font-minecraft mt-1 text-center bg-black/50 px-1 rounded text-white">
          {name}
        </div>
      )}
    </div>
  );
}

// Predefined character combinations for easy use
export const CharacterPresets = {
  // Main characters
  Matikah: {
    chicken: ChickenPresets.Chalisa, // Chalisa - Matikah's teal and orange chicken from the reference
    jockey: { character: 'matikah' as const }
  },
  Death: {
    chicken: ChickenPresets.Shadow,
    jockey: { character: 'death' as const }
  },
  Auto: {
    chicken: ChickenPresets.Timaru, // Timaru - Auto's red chicken with green eye from the reference
    jockey: { 
      character: 'auto' as const,
      accessory: 'sword' as const, 
      accessoryColor: '#FFD700' // Golden sword
    }
  },
  
  // Auto's early campaign mount - Ember
  AutoEmber: {
    chicken: ChickenPresets.Ember, // Ember - Auto's young fire Garu for early campaign
    jockey: { 
      character: 'auto' as const,
      accessory: 'none' as const
    }
  },
  Iam: {
    chicken: ChickenPresets.Royal,
    jockey: { character: 'iam' as const }
  },
  Steve: {
    chicken: ChickenPresets.Normal,
    jockey: { character: 'steve' as const }
  },
  Golden: {
    chicken: ChickenPresets.Golden,
    jockey: { character: 'custom' as const, outfitColor: '#FFD700', hairColor: '#FFC107', skinColor: '#FFA726' }
  },
  
  // Ultra Mounts
  PeacockMount: {
    chicken: {
      variant: 'legendary' as const,
      colorScheme: '#4A148C', // Deep purple
      secondaryColor: '#6A1B9A', // Lighter purple accent
      eyeColor: '#E1BEE7', // Light purple eyes
      combColor: '#9C27B0', // Purple comb
      accessory: 'crown' as const,
      accessoryColor: '#FFD700' // Golden crown
    },
    jockey: { character: 'custom' as const, outfitColor: '#4A148C', skinColor: '#1A237E', hairColor: '#000000' }
  },
  
  // Special Teacher Guru character
  TeacherGuru: {
    chicken: ChickenPresets.TeacherGuru,
    jockey: { character: 'teacherGuru' as const }
  },
  
  // TEK8 Garu characters
  EtherGaru: {
    chicken: ChickenPresets.EtherGaru,
    jockey: { character: 'custom' as const, outfitColor: '#3F51B5', hairColor: '#C0C0C0', skinColor: '#F5F5F5' }
  },
  AirGaru: {
    chicken: ChickenPresets.AirGaru,
    jockey: { character: 'custom' as const, outfitColor: '#81D4FA', hairColor: '#F0E68C', skinColor: '#FFECB3' }
  },
  
  // New vibrant NPC characters for multiplayer races
  CrystalWing: {
    chicken: ChickenPresets.CrystalWing,
    jockey: { character: 'custom' as const, outfitColor: '#E91E63', hairColor: '#9C27B0', skinColor: '#FCE4EC' }
  },
  ThunderBeak: {
    chicken: ChickenPresets.ThunderBeak,
    jockey: { character: 'custom' as const, outfitColor: '#3F51B5', hairColor: '#FFEB3B', skinColor: '#E8EAF6' }
  },
  ShadowFeather: {
    chicken: ChickenPresets.ShadowFeather,
    jockey: { character: 'custom' as const, outfitColor: '#263238', hairColor: '#607D8B', skinColor: '#ECEFF1' }
  },
  PrismTail: {
    chicken: ChickenPresets.PrismTail,
    jockey: { character: 'custom' as const, outfitColor: '#00BCD4', hairColor: '#E91E63', skinColor: '#E0F2F1' }
  },
  VoidRunner: {
    chicken: ChickenPresets.VoidRunner,
    jockey: { character: 'custom' as const, outfitColor: '#4A148C', hairColor: '#1A237E', skinColor: '#F3E5F5' }
  },
  SolarFlare: {
    chicken: ChickenPresets.SolarFlare,
    jockey: { character: 'custom' as const, outfitColor: '#FF6F00', hairColor: '#FFEB3B', skinColor: '#FFF3E0' }
  },
  FrostWing: {
    chicken: ChickenPresets.FrostWing,
    jockey: { character: 'custom' as const, outfitColor: '#E3F2FD', hairColor: '#81D4FA', skinColor: '#E1F5FE' }
  },
  NeonRush: {
    chicken: ChickenPresets.NeonRush,
    jockey: { character: 'custom' as const, outfitColor: '#76FF03', hairColor: '#FF1744', skinColor: '#F1F8E9' }
  },
  
  FireGaru: {
    chicken: ChickenPresets.FireGaru,
    jockey: { character: 'custom' as const, outfitColor: '#F44336', hairColor: '#FF9800', skinColor: '#FFA726' }
  },
  WaterGaru: {
    chicken: ChickenPresets.WaterGaru,
    jockey: { character: 'custom' as const, outfitColor: '#0D47A1', hairColor: '#CE93D8', skinColor: '#B2EBF2' }
  },
  EarthGaru: {
    chicken: ChickenPresets.EarthGaru,
    jockey: { character: 'custom' as const, outfitColor: '#4CAF50', hairColor: '#795548', skinColor: '#8D6E63' }
  },
  ChaosGaru: {
    chicken: ChickenPresets.ChaosGaru,
    jockey: { character: 'custom' as const, outfitColor: '#212121', hairColor: '#FF4081', skinColor: '#9C27B0' }
  },
  OrderGaru: {
    chicken: ChickenPresets.OrderGaru,
    jockey: { character: 'custom' as const, outfitColor: '#FFFFFF', hairColor: '#2196F3', skinColor: '#E0E0E0' }
  },
  WealthGaru: {
    chicken: ChickenPresets.WealthGaru,
    jockey: { character: 'custom' as const, outfitColor: '#FFD700', hairColor: '#00BFA5', skinColor: '#FFECB3' }
  },
  
  // Undead NPC Profiles (Easy/Normal Difficulty)
  UndeadCJ01: {
    chicken: { ...ChickenPresets.Shadow, bodyColor: '#6D4C41', eyeColor: '#F44336', combColor: '#B71C1C' },
    jockey: { character: 'custom' as const, outfitColor: '#4E342E', hairColor: '#3E2723', skinColor: '#8D6E63' }
  },
  UndeadCJ02: {
    chicken: { ...ChickenPresets.Shadow, bodyColor: '#455A64', eyeColor: '#29B6F6', combColor: '#0288D1' },
    jockey: { character: 'custom' as const, outfitColor: '#263238', hairColor: '#546E7A', skinColor: '#90A4AE' }
  },
  UndeadCJ03: {
    chicken: { ...ChickenPresets.Shadow, bodyColor: '#37474F', eyeColor: '#4CAF50', combColor: '#2E7D32' },
    jockey: { character: 'custom' as const, outfitColor: '#212121', hairColor: '#424242', skinColor: '#9E9E9E' }
  },
  UndeadCJ04: {
    chicken: { ...ChickenPresets.Shadow, bodyColor: '#3E2723', eyeColor: '#FFEB3B', combColor: '#F9A825' },
    jockey: { character: 'custom' as const, outfitColor: '#4E342E', hairColor: '#3E2723', skinColor: '#6D4C41' }
  },
  UndeadCJ05: {
    chicken: { ...ChickenPresets.Shadow, bodyColor: '#212121', eyeColor: '#EC407A', combColor: '#AD1457' },
    jockey: { character: 'custom' as const, outfitColor: '#37474F', hairColor: '#607D8B', skinColor: '#78909C' }
  },
  UndeadCJ06: {
    chicken: { ...ChickenPresets.Shadow, bodyColor: '#1A237E', eyeColor: '#7E57C2', combColor: '#4527A0' },
    jockey: { character: 'custom' as const, outfitColor: '#0D47A1', hairColor: '#303F9F', skinColor: '#7986CB' }
  },
  UndeadCJ07: {
    chicken: { ...ChickenPresets.Shadow, bodyColor: '#311B92', eyeColor: '#26A69A', combColor: '#00796B' },
    jockey: { character: 'custom' as const, outfitColor: '#4527A0', hairColor: '#5E35B1', skinColor: '#9575CD' }
  },
  UndeadCJ08: {
    chicken: { ...ChickenPresets.Shadow, bodyColor: '#1B5E20', eyeColor: '#FFA726', combColor: '#EF6C00' },
    jockey: { character: 'custom' as const, outfitColor: '#2E7D32', hairColor: '#388E3C', skinColor: '#81C784' }
  },
  UndeadCJ09: {
    chicken: { ...ChickenPresets.Shadow, bodyColor: '#B71C1C', eyeColor: '#607D8B', combColor: '#455A64' },
    jockey: { character: 'custom' as const, outfitColor: '#C62828', hairColor: '#D32F2F', skinColor: '#EF9A9A' }
  },
  
  // Indus Knight NPC Profiles (Hard/Insane Difficulty)
  IndusKnightCJ01: {
    chicken: { ...ChickenPresets.Golden, bodyColor: '#BF360C', eyeColor: '#FFEB3B', combColor: '#FFD600' },
    jockey: { 
      character: 'custom' as const, 
      outfitColor: '#D84315', 
      hairColor: '#E65100', 
      skinColor: '#FFAB91',
      accessory: 'sword' as const,
      accessoryColor: '#FFD700'
    }
  },
  IndusKnightCJ02: {
    chicken: { ...ChickenPresets.Golden, bodyColor: '#1A237E', eyeColor: '#64B5F6', combColor: '#42A5F5' },
    jockey: { 
      character: 'custom' as const, 
      outfitColor: '#303F9F', 
      hairColor: '#1A237E', 
      skinColor: '#C5CAE9',
      accessory: 'shield' as const,
      accessoryColor: '#3F51B5'
    }
  },
  IndusKnightCJ03: {
    chicken: { ...ChickenPresets.Golden, bodyColor: '#33691E', eyeColor: '#26A69A', combColor: '#00897B' },
    jockey: { 
      character: 'custom' as const, 
      outfitColor: '#558B2F', 
      hairColor: '#33691E', 
      skinColor: '#C5E1A5',
      accessory: 'bow' as const,
      accessoryColor: '#689F38'
    }
  },
  IndusKnightCJ04: {
    chicken: { ...ChickenPresets.Golden, bodyColor: '#880E4F', eyeColor: '#E91E63', combColor: '#D81B60' },
    jockey: { 
      character: 'custom' as const, 
      outfitColor: '#AD1457', 
      hairColor: '#880E4F', 
      skinColor: '#F8BBD0',
      accessory: 'staff' as const,
      accessoryColor: '#C2185B'
    }
  },
  IndusKnightCJ05: {
    chicken: { ...ChickenPresets.Golden, bodyColor: '#311B92', eyeColor: '#B39DDB', combColor: '#9575CD' },
    jockey: { 
      character: 'custom' as const, 
      outfitColor: '#4527A0', 
      hairColor: '#311B92', 
      skinColor: '#D1C4E9',
      accessory: 'sword' as const,
      accessoryColor: '#673AB7'
    }
  },
  IndusKnightCJ06: {
    chicken: { ...ChickenPresets.Golden, bodyColor: '#004D40', eyeColor: '#80CBC4', combColor: '#4DB6AC' },
    jockey: { 
      character: 'custom' as const, 
      outfitColor: '#00695C', 
      hairColor: '#004D40', 
      skinColor: '#B2DFDB',
      accessory: 'shield' as const,
      accessoryColor: '#00897B'
    }
  },
  IndusKnightCJ07: {
    chicken: { ...ChickenPresets.Golden, bodyColor: '#E65100', eyeColor: '#FFCC80', combColor: '#FFB74D' },
    jockey: { 
      character: 'custom' as const, 
      outfitColor: '#EF6C00', 
      hairColor: '#E65100', 
      skinColor: '#FFE0B2',
      accessory: 'bow' as const,
      accessoryColor: '#FB8C00'
    }
  },
  IndusKnightCJ08: {
    chicken: { ...ChickenPresets.Golden, bodyColor: '#B71C1C', eyeColor: '#EF9A9A', combColor: '#E57373' },
    jockey: { 
      character: 'custom' as const, 
      outfitColor: '#C62828', 
      hairColor: '#B71C1C', 
      skinColor: '#FFCDD2',
      accessory: 'staff' as const,
      accessoryColor: '#D32F2F'
    }
  }
};