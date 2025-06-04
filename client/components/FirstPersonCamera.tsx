import React from 'react';

export default function FirstPersonCamera({ progress }: { progress: number }) {
  return (
    <div className="w-full h-screen bg-gradient-to-b from-sky-600 to-green-500 relative overflow-hidden">
      {/* Racing track with perspective */}
      <div className="absolute inset-0">
        {/* Road surface */}
        <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gray-700">
          {/* Lane markings that create depth */}
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute bg-yellow-300"
              style={{
                left: '48%',
                width: '4%',
                height: '8px',
                bottom: `${i * 25}px`,
                transform: `perspective(500px) rotateX(75deg) translateY(-${progress % 500}px)`,
                opacity: Math.max(0.3, 1 - (i * 0.05)),
              }}
            />
          ))}
        </div>
        
        {/* Horizon and sky */}
        <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-blue-400 to-blue-600" />
        
        {/* Side barriers creating tunnel effect */}
        <div className="absolute left-0 top-0 bottom-0 w-1/4 bg-gradient-to-r from-green-800 to-transparent opacity-60" />
        <div className="absolute right-0 top-0 bottom-0 w-1/4 bg-gradient-to-l from-green-800 to-transparent opacity-60" />
      </div>
      
      {/* Moving elements based on progress */}
      <div 
        className="absolute w-full h-full animate-track" 
        style={{ transform: `translateY(-${progress * 0.1}px)` }}
      >
        {/* Scenery elements that scroll past */}
        {[...Array(10)].map((_, i) => (
          <div
            key={i}
            className="absolute text-green-600 text-4xl"
            style={{
              left: `${20 + (i % 3) * 30}%`,
              top: `${20 + (i * 100)}px`,
              transform: `translateY(-${progress * 0.2}px)`,
            }}
          >
            🌳
          </div>
        ))}
      </div>
    </div>
  );
}