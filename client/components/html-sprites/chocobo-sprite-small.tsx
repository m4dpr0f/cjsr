import React from 'react';
import { cn } from '@/lib/utils';

export interface ChocoboSpriteProps {
  variant: string;
  colorScheme: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  animation?: 'idle' | 'run' | 'jump' | 'attack' | 'none';
  direction?: 'left' | 'right';
  pixelSize?: number;
  showName?: boolean;
  name?: string;
  className?: string;
  style?: React.CSSProperties;
}

// Chocobo color schemes
const getChocoboColors = (colorScheme: string) => {
  switch (colorScheme.toLowerCase()) {
    case 'blue':
    case 'darkblue':
      return {
        body: '#1E3A8A', // Dark blue
        accent: '#3B82F6', // Lighter blue
        wing: '#1D4ED8', // Medium blue
        beak: '#F59E0B', // Orange
        legs: '#EA580C', // Orange-red
        eyes: '#10B981' // Mako green
      };
    case 'red':
      return {
        body: '#DC2626', // Red
        accent: '#EF4444', // Lighter red
        wing: '#B91C1C', // Darker red
        beak: '#F59E0B', // Orange
        legs: '#EA580C', // Orange-red
        eyes: '#10B981' // Mako green
      };
    case 'silver':
      return {
        body: '#6B7280', // Gray
        accent: '#9CA3AF', // Lighter gray
        wing: '#4B5563', // Darker gray
        beak: '#F59E0B', // Orange
        legs: '#EA580C', // Orange-red
        eyes: '#10B981' // Mako green
      };
    case 'black':
      return {
        body: '#1F2937', // Dark gray/black
        accent: '#374151', // Lighter black
        wing: '#111827', // True black
        beak: '#F59E0B', // Orange
        legs: '#EA580C', // Orange-red
        eyes: '#10B981' // Mako green
      };
    default:
      return {
        body: '#FCD34D', // Golden yellow
        accent: '#FEF3C7', // Light yellow
        wing: '#F59E0B', // Orange-yellow
        beak: '#F59E0B', // Orange
        legs: '#EA580C', // Orange-red
        eyes: '#10B981' // Mako green
      };
  }
};

export function ChocoboSprite({
  variant,
  colorScheme,
  size = 'md',
  animation = 'idle',
  direction = 'right',
  pixelSize = 2,
  showName = false,
  name,
  className,
  style
}: ChocoboSpriteProps) {
  const colors = getChocoboColors(colorScheme);
  const isFlipped = direction === 'left';
  
  // Animation classes
  const animationClass = animation === 'run' ? 'animate-bounce' : '';
  
  // Size scaling
  const sizeScale = {
    xs: 0.6,
    sm: 0.8,
    md: 1.0,
    lg: 1.4
  }[size];
  
  const baseSize = pixelSize;
  const scale = baseSize * sizeScale;
  
  return (
    <div 
      className={cn(
        "relative inline-block",
        animationClass,
        className
      )}
      style={{
        transform: `scale(${scale}) ${isFlipped ? 'scaleX(-1)' : ''}`,
        ...style
      }}
    >
      {/* Chocobo Head - compact */}
      <div
        className="absolute border"
        style={{
          width: '8px',
          height: '6px',
          backgroundColor: colors.body,
          borderColor: colors.accent,
          top: '0px',
          left: '13px'
        }}
      />
      
      {/* Head feathers/crest - small */}
      <div
        className="absolute"
        style={{
          width: '1px',
          height: '3px',
          backgroundColor: colors.wing,
          top: '-1px',
          left: '15px'
        }}
      />
      <div
        className="absolute"
        style={{
          width: '1px',
          height: '4px',
          backgroundColor: colors.wing,
          top: '-2px',
          left: '17px'
        }}
      />
      <div
        className="absolute"
        style={{
          width: '1px',
          height: '3px',
          backgroundColor: colors.wing,
          top: '-1px',
          left: '19px'
        }}
      />
      
      {/* Mako Eyes */}
      <div
        className="absolute"
        style={{
          width: '1px',
          height: '1px',
          backgroundColor: colors.eyes,
          top: '2px',
          left: '17px'
        }}
      />
      
      {/* Beak */}
      <div
        className="absolute"
        style={{
          width: '3px',
          height: '2px',
          backgroundColor: colors.beak,
          top: '4px',
          left: '21px'
        }}
      />
      
      {/* Long Neck */}
      <div
        className="absolute border"
        style={{
          width: '4px',
          height: '8px',
          backgroundColor: colors.body,
          borderColor: colors.accent,
          top: '5px',
          left: '12px'
        }}
      />
      
      {/* Main Body - compact oval */}
      <div
        className="absolute border"
        style={{
          width: '13px',
          height: '11px',
          backgroundColor: colors.body,
          borderColor: colors.accent,
          top: '11px',
          left: '3px'
        }}
      />
      
      {/* Wing feathers on body */}
      <div
        className="absolute"
        style={{
          width: '8px',
          height: '5px',
          backgroundColor: colors.wing,
          top: '12px',
          left: '4px'
        }}
      />
      
      {/* Tail feathers - compact layers */}
      <div
        className="absolute"
        style={{
          width: '2px',
          height: '7px',
          backgroundColor: colors.wing,
          top: '13px',
          left: '-1px'
        }}
      />
      <div
        className="absolute"
        style={{
          width: '2px',
          height: '8px',
          backgroundColor: colors.wing,
          top: '12px',
          left: '0px'
        }}
      />
      <div
        className="absolute"
        style={{
          width: '2px',
          height: '5px',
          backgroundColor: colors.wing,
          top: '15px',
          left: '1px'
        }}
      />
      
      {/* Long Chocobo Legs - proportionally long */}
      <div
        className="absolute"
        style={{
          width: '1px',
          height: '15px',
          backgroundColor: colors.legs,
          top: '22px',
          left: '7px'
        }}
      />
      <div
        className="absolute"
        style={{
          width: '1px',
          height: '15px',
          backgroundColor: colors.legs,
          top: '22px',
          left: '11px'
        }}
      />
      
      {/* Chocobo Feet */}
      <div
        className="absolute"
        style={{
          width: '4px',
          height: '1px',
          backgroundColor: colors.legs,
          top: '37px',
          left: '5px'
        }}
      />
      <div
        className="absolute"
        style={{
          width: '4px',
          height: '1px',
          backgroundColor: colors.legs,
          top: '37px',
          left: '9px'
        }}
      />
      
      {/* Three toes on each foot */}
      <div
        className="absolute"
        style={{
          width: '1px',
          height: '1px',
          backgroundColor: colors.legs,
          top: '38px',
          left: '5px'
        }}
      />
      <div
        className="absolute"
        style={{
          width: '1px',
          height: '1px',
          backgroundColor: colors.legs,
          top: '38px',
          left: '7px'
        }}
      />
      <div
        className="absolute"
        style={{
          width: '1px',
          height: '1px',
          backgroundColor: colors.legs,
          top: '38px',
          left: '9px'
        }}
      />
      <div
        className="absolute"
        style={{
          width: '1px',
          height: '1px',
          backgroundColor: colors.legs,
          top: '38px',
          left: '11px'
        }}
      />
      <div
        className="absolute"
        style={{
          width: '1px',
          height: '1px',
          backgroundColor: colors.legs,
          top: '38px',
          left: '13px'
        }}
      />
      
      {/* Name display */}
      {showName && name && (
        <div className="absolute top-[-20px] left-1/2 transform -translate-x-1/2 text-xs font-pixel text-white bg-black/50 px-1 rounded whitespace-nowrap">
          {name}
        </div>
      )}
    </div>
  );
}