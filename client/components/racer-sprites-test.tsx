import React from 'react';

// Display each of the racer sprites directly
const RacerSpritesTest = () => {
  return (
    <div className="p-4 bg-dark-800 rounded-lg">
      <h2 className="font-pixel text-xl text-primary mb-4">Racer Sprites Test</h2>
      
      <div className="grid grid-cols-4 gap-4">
        {Array.from({length: 20}).map((_, i) => {
          const spriteName = `CJSRacer${String(i+1).padStart(2, '0')}`;
          return (
            <div key={i} className="bg-gray-800 p-2 rounded-lg text-center">
              <img 
                src={`/images/${spriteName}.png`} 
                alt={`Racer ${i+1}`}
                className="h-20 w-20 mx-auto object-contain image-rendering-pixelated"
              />
              <p className="text-white mt-2 text-sm">Racer {i+1}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RacerSpritesTest;