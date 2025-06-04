import React from 'react';
import { ChickenAvatar } from './chicken-avatar';
import { Card, CardContent, CardHeader, CardTitle } from './card';

// This component displays a grid of all available sprites for testing
export function SpriteDisplay() {
  // Create arrays of the sprite types we want to display
  const racerSprites = Array.from({ length: 20 }, (_, i) => `racer${i + 1}`);
  const undeadSprites = Array.from({ length: 9 }, (_, i) => `UndeadCJ${i + 1}`);
  const indusKnightSprites = Array.from({ length: 12 }, (_, i) => `IndusKnight${i + 1}`);
  const zjSprites = [
    "zj_bow", "zj_dark", "zj_dark2", "zj_diamond", "zj_diamond2", "zj_ghost", 
    "zj_gold", "zj_helm", "zj_invis_garu", "zj_og", "zj_orb", "zj_shroom", "zj_torch"
  ];

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6 text-center">Sprite Test Page</h1>
      
      {/* Player Character Sprites */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Player Character Sprites (CJSRacer01-20)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {racerSprites.map((sprite) => (
              <div key={sprite} className="flex flex-col items-center">
                <ChickenAvatar chickenType={sprite} jockeyType={sprite} size="lg" showName={true} />
                <span className="mt-2 text-sm">{sprite}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Undead CJ Sprites */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Undead CJ Sprites (Easy/Normal Difficulty NPCs)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {undeadSprites.map((sprite) => (
              <div key={sprite} className="flex flex-col items-center">
                <ChickenAvatar chickenType={sprite} jockeyType={sprite} size="lg" showName={true} />
                <span className="mt-2 text-sm">{sprite}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* IndusKnight Sprites */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>IndusKnight Sprites (Hard/Insane Difficulty NPCs)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {indusKnightSprites.map((sprite) => (
              <div key={sprite} className="flex flex-col items-center">
                <ChickenAvatar chickenType={sprite} jockeyType={sprite} size="lg" showName={true} />
                <span className="mt-2 text-sm">{sprite}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ZJ Special Sprites */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>ZJ Special Sprites</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {zjSprites.map((sprite) => (
              <div key={sprite} className="flex flex-col items-center">
                <ChickenAvatar chickenType={sprite} jockeyType={sprite} size="lg" showName={true} />
                <span className="mt-2 text-sm">{sprite}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}