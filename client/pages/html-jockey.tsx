import React, { useState } from 'react';
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ChickenSprite, ChickenPresets } from "@/components/html-sprites/chicken-sprite";
import { JockeySprite } from "@/components/html-sprites/jockey-sprite";
import { ChickenJockey, CharacterPresets } from "@/components/html-sprites/chicken-jockey";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";

export default function HTMLJockeyPage() {
  const [pixelSize, setPixelSize] = useState(2);
  const [animate, setAnimate] = useState(false);
  const [activeTab, setActiveTab] = useState("combined");
  
  // Chicken customization state
  const [chickenVariant, setChickenVariant] = useState<'normal' | 'rare' | 'epic' | 'legendary' | 'special'>('normal');
  const [chickenColor, setChickenColor] = useState('#F5F5DC');
  const [chickenSecondaryColor, setChickenSecondaryColor] = useState('#E3E3C7');
  const [chickenAccessory, setChickenAccessory] = useState<'none' | 'bow' | 'hat' | 'glasses' | 'necklace'>('none');
  
  // Jockey customization state
  const [jockeyCharacter, setJockeyCharacter] = useState<'matikah' | 'death' | 'auto' | 'iam' | 'steve' | 'custom'>('matikah');
  const [jockeySkinColor, setJockeySkinColor] = useState('#FFA726');
  const [jockeyHairColor, setJockeyHairColor] = useState('#5D4037');
  const [jockeyOutfitColor, setJockeyOutfitColor] = useState('#1976D2');
  const [jockeyAccessory, setJockeyAccessory] = useState<'none' | 'sword' | 'hat' | 'cape' | 'glasses' | 'shield'>('none');
  
  // Combined state
  const [selectedPreset, setSelectedPreset] = useState('Matikah');
  
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
          <h1 className="text-2xl font-minecraft text-primary mb-6 text-center">HTML CHICKEN JOCKEY SPRITES</h1>
          
          <p className="text-center mb-8 text-light font-pixel">
            Fully customizable HTML/CSS sprites for chickens and jockeys - no image files needed!
            Mix and match components, colors, and accessories for endless combinations.
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
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="combined">Combined Sprites</TabsTrigger>
              <TabsTrigger value="chicken">Chicken Sprites</TabsTrigger>
              <TabsTrigger value="jockey">Jockey Sprites</TabsTrigger>
            </TabsList>
            
            {/* Combined Sprites Tab */}
            <TabsContent value="combined">
              <Card>
                <CardHeader>
                  <CardTitle>Character Presets</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-6">
                    {Object.entries(CharacterPresets).map(([name, _]) => (
                      <Button 
                        key={name}
                        variant={selectedPreset === name ? "default" : "outline"}
                        onClick={() => setSelectedPreset(name)}
                        className="h-auto py-2"
                      >
                        {name}
                      </Button>
                    ))}
                  </div>
                  
                  <div className="flex justify-center my-8">
                    <ChickenJockey
                      chicken={CharacterPresets[selectedPreset as keyof typeof CharacterPresets].chicken}
                      jockey={CharacterPresets[selectedPreset as keyof typeof CharacterPresets].jockey}
                      name={selectedPreset}
                      showName={true}
                      size="lg"
                      animation={animate ? "run" : "idle"}
                      pixelSize={pixelSize}
                    />
                  </div>
                  
                  <div className="bg-dark-800 p-4 rounded-lg mt-4">
                    <h3 className="font-minecraft text-secondary mb-2">How This Works</h3>
                    <p className="text-sm">
                      The combined sprite is created by layering the jockey on top of the chicken. 
                      Each component can be individually customized and will work together seamlessly.
                      This approach allows for mix-and-match customization with egg-hatched chickens,
                      special jockeys, and equipment from gameplay rewards.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Chicken Sprites Tab */}
            <TabsContent value="chicken">
              <Card>
                <CardHeader>
                  <CardTitle>Chicken Customization</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <Label>Variant</Label>
                        <RadioGroup 
                          defaultValue="normal"
                          value={chickenVariant}
                          onValueChange={(value) => setChickenVariant(value as any)}
                          className="grid grid-cols-2 gap-2 mt-2"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="normal" id="variant-normal" />
                            <Label htmlFor="variant-normal">Normal</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="rare" id="variant-rare" />
                            <Label htmlFor="variant-rare">Rare</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="epic" id="variant-epic" />
                            <Label htmlFor="variant-epic">Epic</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="legendary" id="variant-legendary" />
                            <Label htmlFor="variant-legendary">Legendary</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="special" id="variant-special" />
                            <Label htmlFor="variant-special">Special</Label>
                          </div>
                        </RadioGroup>
                      </div>
                      
                      <div>
                        <Label>Accessory</Label>
                        <Select 
                          value={chickenAccessory}
                          onValueChange={(value) => setChickenAccessory(value as any)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select accessory" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">None</SelectItem>
                            <SelectItem value="bow">Bow</SelectItem>
                            <SelectItem value="hat">Hat</SelectItem>
                            <SelectItem value="glasses">Glasses</SelectItem>
                            <SelectItem value="necklace">Necklace</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label htmlFor="primary-color">Primary Color</Label>
                        <div className="flex gap-2 items-center mt-2 mb-4">
                          <Input 
                            id="primary-color"
                            type="color" 
                            value={chickenColor} 
                            onChange={(e) => setChickenColor(e.target.value)} 
                            className="w-12 h-12 p-1 cursor-pointer"
                          />
                          <span className="text-sm font-mono">{chickenColor}</span>
                        </div>
                      </div>
                      
                      <div>
                        <Label htmlFor="secondary-color">Secondary Color</Label>
                        <div className="flex gap-2 items-center mt-2">
                          <Input 
                            id="secondary-color"
                            type="color" 
                            value={chickenSecondaryColor} 
                            onChange={(e) => setChickenSecondaryColor(e.target.value)} 
                            className="w-12 h-12 p-1 cursor-pointer"
                          />
                          <span className="text-sm font-mono">{chickenSecondaryColor}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-center justify-center bg-dark-800 p-4 rounded-lg">
                      <div className="mb-6">
                        <ChickenSprite
                          variant={chickenVariant}
                          colorScheme={chickenColor}
                          secondaryColor={chickenSecondaryColor}
                          accessory={chickenAccessory}
                          size="lg"
                          animation={animate ? "run" : "idle"}
                          pixelSize={pixelSize}
                          name="Custom Chicken"
                          showName={true}
                        />
                      </div>
                      
                      <div>
                        <h3 className="font-minecraft text-secondary mb-2">Egg System Integration</h3>
                        <p className="text-sm">
                          This chicken component is designed to work with the egg hatching system.
                          When an egg hatches, it can pass properties like variant, colors, and
                          special markings to the chicken. Equipment and accessories can be added
                          later through gameplay rewards.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Jockey Sprites Tab */}
            <TabsContent value="jockey">
              <Card>
                <CardHeader>
                  <CardTitle>Jockey Customization</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <Label>Character</Label>
                        <RadioGroup 
                          defaultValue="matikah"
                          value={jockeyCharacter}
                          onValueChange={(value) => setJockeyCharacter(value as any)}
                          className="grid grid-cols-2 gap-2 mt-2"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="matikah" id="character-matikah" />
                            <Label htmlFor="character-matikah">Matikah</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="death" id="character-death" />
                            <Label htmlFor="character-death">Death</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="auto" id="character-auto" />
                            <Label htmlFor="character-auto">Auto</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="iam" id="character-iam" />
                            <Label htmlFor="character-iam">Iam</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="steve" id="character-steve" />
                            <Label htmlFor="character-steve">Steve</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="custom" id="character-custom" />
                            <Label htmlFor="character-custom">Custom</Label>
                          </div>
                        </RadioGroup>
                      </div>
                      
                      {jockeyCharacter === 'custom' && (
                        <>
                          <div>
                            <Label htmlFor="skin-color">Skin Color</Label>
                            <div className="flex gap-2 items-center mt-2 mb-4">
                              <Input 
                                id="skin-color"
                                type="color" 
                                value={jockeySkinColor} 
                                onChange={(e) => setJockeySkinColor(e.target.value)} 
                                className="w-12 h-12 p-1 cursor-pointer"
                              />
                              <span className="text-sm font-mono">{jockeySkinColor}</span>
                            </div>
                          </div>
                          
                          <div>
                            <Label htmlFor="hair-color">Hair Color</Label>
                            <div className="flex gap-2 items-center mt-2 mb-4">
                              <Input 
                                id="hair-color"
                                type="color" 
                                value={jockeyHairColor} 
                                onChange={(e) => setJockeyHairColor(e.target.value)} 
                                className="w-12 h-12 p-1 cursor-pointer"
                              />
                              <span className="text-sm font-mono">{jockeyHairColor}</span>
                            </div>
                          </div>
                          
                          <div>
                            <Label htmlFor="outfit-color">Outfit Color</Label>
                            <div className="flex gap-2 items-center mt-2">
                              <Input 
                                id="outfit-color"
                                type="color" 
                                value={jockeyOutfitColor} 
                                onChange={(e) => setJockeyOutfitColor(e.target.value)} 
                                className="w-12 h-12 p-1 cursor-pointer"
                              />
                              <span className="text-sm font-mono">{jockeyOutfitColor}</span>
                            </div>
                          </div>
                        </>
                      )}
                      
                      <div>
                        <Label>Accessory</Label>
                        <Select 
                          value={jockeyAccessory}
                          onValueChange={(value) => setJockeyAccessory(value as any)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select accessory" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">None</SelectItem>
                            <SelectItem value="sword">Sword</SelectItem>
                            <SelectItem value="hat">Hat</SelectItem>
                            <SelectItem value="cape">Cape</SelectItem>
                            <SelectItem value="glasses">Glasses</SelectItem>
                            <SelectItem value="shield">Shield</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-center justify-center bg-dark-800 p-4 rounded-lg">
                      <div className="mb-6">
                        <JockeySprite
                          character={jockeyCharacter}
                          skinColor={jockeySkinColor}
                          hairColor={jockeyHairColor}
                          outfitColor={jockeyOutfitColor}
                          accessory={jockeyAccessory}
                          size="lg"
                          animation={animate ? "idle" : "idle"}
                          pixelSize={pixelSize}
                          name={jockeyCharacter === 'custom' ? "Custom Jockey" : jockeyCharacter}
                          showName={true}
                        />
                      </div>
                      
                      <div>
                        <h3 className="font-minecraft text-secondary mb-2">Fork Campaign Integration</h3>
                        <p className="text-sm">
                          These jockey characters represent the main protagonists in the fork campaign.
                          Each character has unique abilities and storylines. The custom option allows
                          players to create their own characters with personalized appearance.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
          
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>HTML Sprite System Benefits</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-minecraft text-secondary">Game Development</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>No external assets needed - reduces loading time and bandwidth</li>
                    <li>Fully scalable without quality loss - perfect for responsive design</li>
                    <li>Easy to modify colors and details programmatically</li>
                    <li>Can be animated with CSS for smooth transitions</li>
                    <li>Works offline and in low-bandwidth situations</li>
                  </ul>
                </div>
                <div className="space-y-4">
                  <h3 className="font-minecraft text-secondary">Egg & Equipment System</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Perfect for dynamic content - generated chickens from eggs</li>
                    <li>Equipment can be added as layers with proper z-index</li>
                    <li>Color inheritance from parent chickens is trivial to implement</li>
                    <li>Special effects can be added with CSS animations</li>
                    <li>Easily store character data as JSON in your database</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}