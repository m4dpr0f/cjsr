import React, { useState, useEffect } from 'react';

export function SpriteTest() {
  const [sprites, setSprites] = useState<string[]>([]);

  useEffect(() => {
    // List of sprite types to test with their correct paths
    const spriteTypes = [
      'images/sprites/pc/CJSRacer01.png',
      'images/sprites/pc/CJSRacer02.png',
      'images/sprites/npc/UndeadCJ01.png',
      'images/sprites/npc/UndeadCJ02.png',
      'images/sprites/npc/IndusKnightCJ01.png',
      'images/sprites/npc/IndusKnightCJ02.png'
    ];

    setSprites(spriteTypes);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center p-4 bg-gray-800 rounded-lg">
      <h2 className="text-xl font-bold text-cyan-500 mb-4">Sprite Test Component</h2>
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {sprites.map((sprite, index) => (
          <div key={index} className="flex flex-col items-center bg-gray-700 p-2 rounded">
            <div className="mb-2">
              <img 
                src={`/${sprite}`} 
                alt={`Sprite ${sprite}`}
                className="w-24 h-24 object-contain"
                onError={(e) => {
                  console.error(`Failed to load sprite: ${sprite}`);
                  e.currentTarget.src = '/images/sprites/pc/CJSRacer01.png'; // Fallback
                }}
              />
            </div>
            <div className="text-sm text-gray-300">{sprite}</div>
            <div className="text-xs text-gray-400 mt-1">Path: /{sprite}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default SpriteTest;