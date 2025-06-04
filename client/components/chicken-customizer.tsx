import { PixelButton } from "@/components/ui/pixel-button";
import { ChickenAvatar } from "@/components/ui/chicken-avatar";
import { Select } from "@/components/ui/select";
import { SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { getChickenSrc } from "@/assets/chicken-sprites";
import { getJockeySrc } from "@/assets/jockey-sprites";
import { getRacerSrc } from "@/assets/race-sprites";
import { htmlSpriteOptions } from "@/config/html-sprite-options";

interface CustomizationOption {
  id: string;
  name: string;
  locked?: boolean;
  requiredLevel?: number;
}

interface ChickenCustomizerProps {
  chickenName: string;
  selectedChicken: string;
  selectedJockey: string;
  selectedTrail: string;
  chickenOptions: CustomizationOption[];
  jockeyOptions: CustomizationOption[];
  trailOptions: CustomizationOption[];
  playerLevel: number;
  onSave: (customization: { 
    chickenType: string; 
    jockeyType: string; 
    trailType: string;
    chickenName: string;
  }) => void;
}

export function ChickenCustomizer({
  chickenName,
  selectedChicken,
  selectedJockey,
  selectedTrail,
  chickenOptions,
  jockeyOptions,
  trailOptions,
  playerLevel,
  onSave
}: ChickenCustomizerProps) {
  const [name, setName] = useState(chickenName);
  const [chickenType, setChickenType] = useState(selectedChicken);
  const [jockeyType, setJockeyType] = useState(selectedJockey);
  const [trailType, setTrailType] = useState(selectedTrail);
  
  const handleSave = () => {
    // Save the customization through the provided callback
    onSave({
      chickenType,
      jockeyType,
      trailType,
      chickenName: name
    });
    
    // Log selection for debugging
    console.log(`Saved customization: ${chickenType} chicken with ${jockeyType} jockey`);
  };
  
  return (
    <div className="bg-dark p-4 pixel-border">
      <h2 className="font-pixel text-sm text-secondary mb-4">YOUR MOUNT</h2>
      
      <div className="flex flex-col items-center mb-4">
        <ChickenAvatar
          chickenType={chickenType}
          jockeyType={jockeyType}
          size="lg"
          className="mb-2"
          showName={true}
        />
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="bg-dark text-white font-bold text-center border-b border-primary/30 focus:outline-none focus:border-primary w-full"
          maxLength={20}
          placeholder="Enter chicken name"
        />
      </div>
      
      <div className="space-y-6">
        <div>
          <Label className="text-secondary text-sm font-minecraft block mb-2">CHICKEN JOCKEY</Label>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {chickenOptions.map(option => (
              <div 
                key={option.id} 
                className={`p-3 border-2 rounded ${option.locked && playerLevel < (option.requiredLevel || 0) ? 'border-gray-700 opacity-50 bg-dark/50' : option.id === chickenType ? 'border-primary bg-primary/20' : 'border-primary/30 hover:border-primary/60 hover:bg-primary/10'} text-center transition-all cursor-pointer`}
                onClick={() => {
                  if (!(option.locked && playerLevel < (option.requiredLevel || 0))) {
                    setChickenType(option.id);
                    // Set jockey type appropriately depending on if HTML or not
                    setJockeyType(option.id.startsWith("html_") ? option.id : "combined");
                  }
                }}
              >
                <div className="flex justify-center mb-2">
                  {option.id.startsWith('html_') ? (
                    <div className="h-16 w-16 flex items-center justify-center">
                      <ChickenAvatar
                        chickenType={option.id}
                        jockeyType={option.id}
                        size="sm"
                      />
                    </div>
                  ) : (
                    <img 
                      src={option.id.startsWith('racer') ? getRacerSrc(option.id) : getChickenSrc(option.id)} 
                      alt={option.name}
                      className="h-16 w-16 object-contain image-rendering-pixelated"
                    />
                  )}
                </div>
                <div className="font-minecraft text-xs mb-1 truncate">{option.name}</div>
                {option.locked && playerLevel < (option.requiredLevel || 0) && (
                  <div className="text-xs text-accent">Lv {option.requiredLevel}</div>
                )}
              </div>
            ))}
          </div>
        </div>
        
        {/* Temporarily hiding jockey selection since we're using combined sprites
        <div>
          <Label className="text-secondary text-sm font-minecraft block mb-2">JOCKEY SKIN</Label>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {jockeyOptions.map(option => (
              <div 
                key={option.id} 
                className={`p-3 border-2 rounded ${option.locked && playerLevel < (option.requiredLevel || 0) ? 'border-gray-700 opacity-50 bg-dark/50' : option.id === jockeyType ? 'border-primary bg-primary/20' : 'border-primary/30 hover:border-primary/60 hover:bg-primary/10'} text-center transition-all cursor-pointer`}
                onClick={() => {
                  if (!(option.locked && playerLevel < (option.requiredLevel || 0))) {
                    setJockeyType(option.id);
                  }
                }}
              >
                <div className="flex justify-center mb-2">
                  <img 
                    src={getJockeySrc(option.id)} 
                    alt={option.name}
                    className="h-16 w-16 object-contain image-rendering-pixelated"
                  />
                </div>
                <div className="font-minecraft text-xs mb-1 truncate">{option.name}</div>
                {option.locked && playerLevel < (option.requiredLevel || 0) && (
                  <div className="text-xs text-accent">Lv {option.requiredLevel}</div>
                )}
              </div>
            ))}
          </div>
        </div>
        */}
        
        {/* Trail effect removed to simplify interface */}
        
        <PixelButton 
          fullWidth 
          onClick={handleSave}
          className="mt-2"
        >
          SAVE CHANGES
        </PixelButton>
      </div>
    </div>
  );
}
