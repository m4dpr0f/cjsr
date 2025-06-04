import { useMemo } from 'react';
import garuEggsSprite from '../../assets/eggs/GaruEggs.png';

interface ElementalEggProps {
  type: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  hatched?: boolean;
  className?: string;
}

export function ElementalEgg({ type, size = 'md', hatched = false, className = '' }: ElementalEggProps) {
  // Map egg types to their position in the sprite sheet (row, column)
  const eggPositions = useMemo(() => ({
    'FireGaru': [0, 0],    // Top row, first egg (red)
    'WaterGaru': [0, 1],   // Top row, second egg (blue)
    'EarthGaru': [0, 2],   // Top row, third egg (brown/green)
    'AirGaru': [0, 3],     // Top row, fourth egg (white/gray)
    'EtherGaru': [1, 0],   // Middle row, first egg (gray)
    'Goldstone': [1, 2],   // Use the gold/yellow egg for Goldstone (D100)
    'Silver': [1, 1],      // Use the bright green egg for Silver (D2) - will override color to silver
    'ChaosGaru': [1, 3],   // Middle row, fourth egg (purple/black)
  }), []);

  // Calculate size based on the prop
  const sizeClasses = {
    'sm': 'w-8 h-10',
    'md': 'w-12 h-16',
    'lg': 'w-20 h-24',
    'xl': 'w-32 h-40'
  };
  
  // If we don't have this egg type in our mapping, default to a random one
  const [row, col] = eggPositions[type as keyof typeof eggPositions] || [
    Math.floor(Math.random() * 2),
    Math.floor(Math.random() * 4)
  ];
  
  // Calculate the background position for the sprite
  const bgPositionX = -col * 100;  // Each egg is 100% width of its container
  const bgPositionY = -row * 100;  // Each egg is 100% height of its container
  
  return (
    <div 
      className={`relative ${sizeClasses[size]} ${className}`} 
      style={{
        backgroundImage: `url(${garuEggsSprite})`,
        backgroundSize: '400% 300%', // 4 columns, 3 rows
        backgroundPosition: `${bgPositionX}% ${bgPositionY}%`,
        imageRendering: 'pixelated'
      }}
      aria-label={`${type} egg${hatched ? ' (hatched)' : ''}`}
    >
      {hatched && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="absolute inset-0 bg-white opacity-10 animate-pulse"></div>
          <span className="text-xs font-minecraft text-white drop-shadow-lg">HATCHED</span>
        </div>
      )}
    </div>
  );
}