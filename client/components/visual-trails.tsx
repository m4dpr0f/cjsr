import { useEffect, useState } from 'react';

interface TrailParticle {
  id: number;
  x: number;
  y: number;
  opacity: number;
  life: number;
}

interface VisualTrailsProps {
  racerElement: HTMLElement | null;
  trailType: 'steve' | 'auto' | 'matikah' | 'iam' | 'none';
  isActive: boolean;
}

export function VisualTrails({ racerElement, trailType, isActive }: VisualTrailsProps) {
  const [particles, setParticles] = useState<TrailParticle[]>([]);

  useEffect(() => {
    if (!isActive || !racerElement || trailType === 'none') {
      setParticles([]);
      return;
    }

    const interval = setInterval(() => {
      const rect = racerElement.getBoundingClientRect();
      const newParticle: TrailParticle = {
        id: Date.now() + Math.random(),
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
        opacity: 1,
        life: 100
      };

      setParticles(prev => {
        // Add new particle and remove old ones
        const updated = [...prev.filter(p => p.life > 0), newParticle];
        return updated.slice(-8); // Limit to 8 particles max for performance
      });
    }, 150); // Create particle every 150ms

    return () => clearInterval(interval);
  }, [isActive, racerElement, trailType]);

  // Update particle life and opacity
  useEffect(() => {
    const animationInterval = setInterval(() => {
      setParticles(prev => 
        prev.map(p => ({
          ...p,
          life: p.life - 5,
          opacity: p.life / 100
        })).filter(p => p.life > 0)
      );
    }, 50);

    return () => clearInterval(animationInterval);
  }, []);

  const getTrailStyle = (particle: TrailParticle) => {
    const baseStyle = {
      position: 'fixed' as const,
      left: particle.x - 4,
      top: particle.y - 4,
      width: 8,
      height: 8,
      opacity: particle.opacity * 0.7,
      pointerEvents: 'none' as const,
      zIndex: 1000
    };

    switch (trailType) {
      case 'steve':
        return {
          ...baseStyle,
          background: 'linear-gradient(45deg, #ffd700, #ff6b35)',
          borderRadius: '50%',
          boxShadow: '0 0 4px #ffd700'
        };
      case 'auto':
        return {
          ...baseStyle,
          background: 'linear-gradient(45deg, #00ffff, #0080ff)',
          width: 6,
          height: 6,
          borderRadius: '2px',
          boxShadow: '0 0 3px #00ffff'
        };
      case 'matikah':
        return {
          ...baseStyle,
          background: 'linear-gradient(45deg, #9d4edd, #c77dff)',
          borderRadius: '50%',
          boxShadow: '0 0 5px #9d4edd'
        };
      case 'iam':
        return {
          ...baseStyle,
          background: 'linear-gradient(45deg, #f72585, #4cc9f0)',
          borderRadius: '20%',
          boxShadow: '0 0 4px #f72585'
        };
      default:
        return baseStyle;
    }
  };

  return (
    <div className="fixed inset-0 pointer-events-none">
      {particles.map(particle => (
        <div
          key={particle.id}
          style={getTrailStyle(particle)}
        />
      ))}
    </div>
  );
}