import React, { useState } from 'react';
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { HTMLSprite, MatikahBlocks, DeathBlocks, AutoBlocks, IamBlocks, SteveBlocks } from "@/components/ui/html-sprite";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export default function HTMLSpritesPage() {
  const [pixelSize, setPixelSize] = useState(2);
  const [animate, setAnimate] = useState(false);
  
  const handleSizeChange = (value: number[]) => {
    setPixelSize(value[0]);
  };
  
  const toggleAnimation = () => {
    setAnimate(!animate);
  };
  
  return (
    <div className="flex flex-col min-h-screen bg-dark">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-8 bg-dark text-light">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-minecraft text-primary mb-6 text-center">HTML SPRITE SHOWCASE</h1>
          
          <p className="text-center mb-8 text-light font-pixel">
            These characters are created entirely with HTML and CSS - no image files needed!
            Each sprite is composed of individual colored div elements positioned to create pixel art.
          </p>
          
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Controls</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="pixel-size">Pixel Size: {pixelSize}px</Label>
                  <Slider 
                    id="pixel-size"
                    min={1} 
                    max={5} 
                    step={0.5} 
                    defaultValue={[2]} 
                    onValueChange={handleSizeChange}
                  />
                </div>
                <div className="flex items-center space-x-4">
                  <Switch 
                    id="animate" 
                    checked={animate} 
                    onCheckedChange={toggleAnimation} 
                  />
                  <Label htmlFor="animate">Animation</Label>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 justify-items-center">
            <div className="flex flex-col items-center">
              <HTMLSprite 
                blocks={MatikahBlocks} 
                name="Matikah" 
                pixelSize={pixelSize}
                animation={animate ? "run" : "none"}
              />
              <p className="mt-2 text-sm text-center">Nature-attuned</p>
            </div>
            
            <div className="flex flex-col items-center">
              <HTMLSprite 
                blocks={DeathBlocks} 
                name="Death" 
                pixelSize={pixelSize}
                animation={animate ? "run" : "none"}
              />
              <p className="mt-2 text-sm text-center">Grim challenger</p>
            </div>
            
            <div className="flex flex-col items-center">
              <HTMLSprite 
                blocks={AutoBlocks} 
                name="Auto" 
                pixelSize={pixelSize}
                animation={animate ? "run" : "none"}
              />
              <p className="mt-2 text-sm text-center">Mechanical genius</p>
            </div>
            
            <div className="flex flex-col items-center">
              <HTMLSprite 
                blocks={IamBlocks} 
                name="Iam" 
                pixelSize={pixelSize}
                animation={animate ? "run" : "none"}
              />
              <p className="mt-2 text-sm text-center">Mysterious figure</p>
            </div>
            
            <div className="flex flex-col items-center">
              <HTMLSprite 
                blocks={SteveBlocks} 
                name="Steve" 
                pixelSize={pixelSize}
                animation={animate ? "run" : "none"}
              />
              <p className="mt-2 text-sm text-center">Blocky adventurer</p>
            </div>
          </div>
          
          <div className="mt-12 bg-dark-800 p-6 rounded-lg">
            <h2 className="text-xl font-minecraft text-primary mb-4">Benefits of HTML Sprites</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>No external assets needed - reduces loading time</li>
              <li>Fully scalable without quality loss</li>
              <li>Easy to modify colors and details</li>
              <li>Can be animated with CSS</li>
              <li>Works offline and in low-bandwidth situations</li>
              <li>Full programmatic control (change colors on events, etc.)</li>
            </ul>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}