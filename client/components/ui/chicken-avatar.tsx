import { cn } from "@/lib/utils";
import { getChickenSrc } from "@/assets/chicken-sprites";
import { getRacerSrc } from "@/assets/race-sprites";
import { racerOptions } from "@/assets/race-sprites";
import { ChickenJockey, CharacterPresets } from "@/components/html-sprites/chicken-jockey";
import { ChickenSprite } from "@/components/html-sprites/chicken-sprite";
import { ChocoboSprite } from "@/components/html-sprites/chocobo-sprite-small";
import { isHtmlSprite, getHtmlSpriteId, getHtmlSpritePreset } from "@/config/html-sprite-options";

interface ChickenAvatarProps {
  className?: string;
  chickenType: string;
  jockeyType: string;
  size?: "xs" | "sm" | "md" | "lg";
  animation?: "idle" | "run";
  flipped?: boolean;
  showName?: boolean;
}

export function ChickenAvatar({
  className,
  chickenType,
  jockeyType,
  size = "md",
  animation = "idle",
  flipped = false,
  showName = false,
}: ChickenAvatarProps) {
  // Safety check and normalize chickenType to handle case insensitivity
  const safeChickenType = chickenType || "steve";
  const normalizedChickenType = safeChickenType.toLowerCase();
  
  console.log(`🐔 ChickenAvatar rendering: chicken=${chickenType}, jockey=${jockeyType}, normalized=${normalizedChickenType}`);
  
  // Check for html_ prefix or if it's one of our special sprite types
  const hasHtmlPrefix = normalizedChickenType.startsWith("html_");
  const isUndeadType = normalizedChickenType.includes("undeadcj");
  const isIndusKnightType = normalizedChickenType.includes("indusknightcj");
  const isColorType = ['white', 'black', 'brown', 'gold', 'blue', 'red', 'green', 'cyan', 'purple', 'pink', 'indigo', 'orange', 'zombie'].includes(normalizedChickenType);
  
  // Always ensure html_ prefix for consistent rendering
  let formattedChickenType = hasHtmlPrefix ? chickenType : `html_${normalizedChickenType}`;
  
  // Fallback for basic color types to default character
  if (isColorType && !hasHtmlPrefix) {
    formattedChickenType = "html_steve";
  }
  
  // Force HTML sprites for ALL cases to avoid missing image file errors
  const useHtmlSprites = true;
  
  // Special handling for chocobo-only mode (no jockey) - especially for SOLDIER campaign
  const isChocoboOnly = jockeyType === "none" || jockeyType === "" || 
    (hasHtmlPrefix && (normalizedChickenType.includes('blue') || normalizedChickenType.includes('red') || 
     normalizedChickenType.includes('silver') || normalizedChickenType.includes('black')));
  
  // Use the shared getRacerSrc function for sprite sources
  const getSpriteSource = (type: string) => {
    // Use the centralized function from race-sprites.tsx
    return getRacerSrc(type);
  };
  
  // Get the display name for the current racer or NPC
  const getDisplayName = (type: string) => {
    const normalizedType = type.toLowerCase();
    
    // For player racers, use the predefined names
    if (normalizedType.startsWith("racer")) {
      const option = racerOptions.find(opt => opt.id === type);
      return option ? option.name : "Chicken Jockey";
    }
    
    // For HTML sprites, remove the html_ prefix if present
    if (normalizedType.startsWith("html_")) {
      return normalizedType.substring(5).charAt(0).toUpperCase() + normalizedType.substring(5).slice(1);
    }
    
    // For NPC-specific sprites (case insensitive)
    if (normalizedType.includes("undeadcj")) {
      const num = normalizedType.match(/\d+/)?.[0] || "";
      return `Undead Jockey ${num}`;
    }
    
    if (normalizedType.includes("indusknightcj")) {
      const num = normalizedType.match(/\d+/)?.[0] || "";
      return `Knight Rider ${num}`;
    }
    
    // For any other types
    return type.charAt(0).toUpperCase() + type.slice(1);
  };
  
  // Map chickenType to HTML sprite configuration using our helper function
  const getHtmlSpriteConfig = (type: string) => {
    // For basic color types, create a sprite configuration
    if (isColorType) {
      const colorMap = {
        'white': { chicken: { variant: 'normal' as const, colorScheme: '#F5F5DC' }, jockey: getJockeyConfig() },
        'black': { chicken: { variant: 'normal' as const, colorScheme: '#333333' }, jockey: getJockeyConfig() },
        'brown': { chicken: { variant: 'normal' as const, colorScheme: '#8B4513' }, jockey: getJockeyConfig() },
        'gold': { chicken: { variant: 'legendary' as const, colorScheme: '#FFD700' }, jockey: getJockeyConfig() },
        'blue': { chicken: { variant: 'rare' as const, colorScheme: '#4169E1' }, jockey: getJockeyConfig() },
        'red': { chicken: { variant: 'normal' as const, colorScheme: '#DC143C' }, jockey: getJockeyConfig() },
        'green': { chicken: { variant: 'special' as const, colorScheme: '#228B22' }, jockey: getJockeyConfig() },
        'cyan': { chicken: { variant: 'rare' as const, colorScheme: '#00CED1' }, jockey: getJockeyConfig() },
        'purple': { chicken: { variant: 'epic' as const, colorScheme: '#8A2BE2' }, jockey: getJockeyConfig() },
        'pink': { chicken: { variant: 'epic' as const, colorScheme: '#FF69B4' }, jockey: getJockeyConfig() },
        'indigo': { chicken: { variant: 'rare' as const, colorScheme: '#4B0082' }, jockey: getJockeyConfig() },
        'orange': { chicken: { variant: 'legendary' as const, colorScheme: '#FF8C00' }, jockey: getJockeyConfig() },
        'zombie': { chicken: { variant: 'normal' as const, colorScheme: '#333333' }, jockey: getJockeyConfig() } // Zombie runner
      };
      return colorMap[normalizedChickenType as keyof typeof colorMap] || colorMap.white;
    }
    return getHtmlSpritePreset(type);
  };

  // Helper function to get jockey configuration based on jockeyType
  const getJockeyConfig = () => {
    console.log(`🎭 ChickenAvatar jockey config for: ${jockeyType}`);
    
    if (jockeyType === 'steve') return { character: 'steve' as const };
    if (jockeyType === 'auto') return { character: 'auto' as const };
    if (jockeyType === 'matikah') return { character: 'matikah' as const };
    if (jockeyType === 'iam') return { character: 'iam' as const };
    if (jockeyType === 'html_teacherguru' || jockeyType === 'teacherguru') return { character: 'teacherGuru' as const };
    if (jockeyType === 'zombie' || jockeyType === 'generic') return { character: 'zombie' as const };
    if (jockeyType === 'golden_champion') return { character: 'custom' as const, outfitColor: '#FFD700', skinColor: '#FFA726' };
    if (jockeyType === 'peacock_champion') return { character: 'custom' as const, outfitColor: '#4A148C', skinColor: '#1A237E', hairColor: '#000000' };
    
    // For faction jockeys, use custom character with appropriate colors
    const factionColors = {
      'coin_jockey': { character: 'custom' as const, outfitColor: '#FFD700' },
      'fire_jockey': { character: 'custom' as const, outfitColor: '#FF4500' },
      'earth_jockey': { character: 'custom' as const, outfitColor: '#8B4513' },
      'air_jockey': { character: 'custom' as const, outfitColor: '#87CEEB' },
      'chaos_jockey': { character: 'custom' as const, outfitColor: '#8B008B' },
      'ether_jockey': { character: 'custom' as const, outfitColor: '#DDA0DD' },
      'water_jockey': { character: 'custom' as const, outfitColor: '#4682B4' },
      'order_jockey': { character: 'custom' as const, outfitColor: '#F5F5F5' }
    };
    
    const config = factionColors[jockeyType as keyof typeof factionColors] || { character: 'steve' as const };
    console.log(`🎭 Jockey config result:`, config);
    return config;
  };
  
  // Special handling for zombie runner (on foot) and "none" type for guests
  if (normalizedChickenType === 'zombie' || normalizedChickenType === 'none') {
    return (
      <div className={cn(
        "flex flex-col items-center justify-center",
        className
      )}>
        <div
          className={cn(
            "relative flex items-center justify-center",
            size === "xs" && "w-12 h-12", // Bigger for zombie
            size === "sm" && "w-16 h-16",
            size === "md" && "w-24 h-24",
            size === "lg" && "w-32 h-32",
            animation === "run" && "animate-bounce"
          )}
        >
          {/* Zombie pixel character - simple colored blocks */}
          <div className="relative w-full h-full flex items-center justify-center">
            <div className="relative" style={{ transform: 'scale(2)' }}>
              {/* Zombie head */}
              <div className="w-3 h-3 bg-green-300 border border-green-600 absolute top-0 left-1"></div>
              {/* Zombie body */}
              <div className="w-3 h-4 bg-gray-600 border border-gray-800 absolute top-3 left-1"></div>
              {/* Zombie arms */}
              <div className="w-1 h-2 bg-green-300 border border-green-600 absolute top-4 left-0"></div>
              <div className="w-1 h-2 bg-green-300 border border-green-600 absolute top-4 right-0"></div>
              {/* Zombie legs */}
              <div className="w-1 h-3 bg-gray-700 border border-gray-900 absolute top-7 left-1"></div>
              <div className="w-1 h-3 bg-gray-700 border border-gray-900 absolute top-7 left-2"></div>
              {/* Zombie eyes */}
              <div className="w-1 h-1 bg-red-500 absolute top-1 left-1.5"></div>
              <div className="w-1 h-1 bg-red-500 absolute top-1 left-2.5"></div>
            </div>
          </div>
        </div>
        
        {showName && (
          <div className="text-center mt-2 font-pixel text-white text-sm max-w-full truncate">
            {normalizedChickenType === 'none' ? 'Guest Zombie' : 'Zombie Runner'}
          </div>
        )}
      </div>
    );
  }

  // Render HTML sprites if needed
  if (useHtmlSprites) {
    try {
      const spriteConfig = getHtmlSpriteConfig(formattedChickenType);
      const pixelSizeMap = { xs: 1, sm: 1.5, md: 2, lg: 3 };
      
      return (
        <div className={cn(
          "flex flex-col items-center justify-center",
          className
        )}>
          <div
            className={cn(
              "relative flex items-center justify-center",
              size === "xs" && "w-6 h-6",
              size === "sm" && "w-10 h-10",
              size === "md" && "w-16 h-16",
              size === "lg" && "w-28 h-28",
              animation === "run" && "chicken-hop animate-bounce"
            )}
          >
            <div className={cn("relative")}>
              {isChocoboOnly ? (
                // ONLY chocobo sprite - no jockey, longer legs, no saddle!
                <ChocoboSprite
                  variant="chocobo"
                  colorScheme={
                    normalizedChickenType.includes('blue') ? 'blue' :
                    normalizedChickenType.includes('red') ? 'red' :
                    normalizedChickenType.includes('silver') ? 'silver' :
                    normalizedChickenType.includes('black') ? 'black' :
                    'yellow'
                  }
                  size={size}
                  animation={animation}
                  direction={flipped ? "left" : "right"}
                  pixelSize={pixelSizeMap[size]}
                  showName={false}
                />
              ) : (
                <ChickenJockey
                  chicken={spriteConfig.chicken}
                  jockey={spriteConfig.jockey}
                  size={size}
                  animation={animation}
                  direction={flipped ? "left" : "right"}
                  pixelSize={pixelSizeMap[size]}
                  showName={false}
                />
              )}
            </div>
          </div>
          
          {showName && (
            <div className="text-center mt-2 font-pixel text-white text-sm max-w-full truncate">
              {getDisplayName(chickenType)}
            </div>
          )}
        </div>
      );
    } catch (error) {
      console.error(`Error rendering HTML sprite for ${formattedChickenType}:`, error);
      // Fall back to image-based sprites on error
    }
  }
  
  // Original image-based rendering for non-HTML sprites
  return (
    <div className={cn(
      "flex flex-col items-center justify-center",
      className
    )}>
      <div
        className={cn(
          "relative flex items-center justify-center",
          size === "xs" && "w-6 h-6",
          size === "sm" && "w-10 h-10",
          size === "md" && "w-16 h-16",
          size === "lg" && "w-28 h-28",
          animation === "run" && "chicken-hop animate-bounce"
        )}
      >
        <div
          className={cn(
            "relative w-full h-full transition-transform",
            animation === "run" && "animate-chicken-run",
            flipped && "scale-x-[-1]"
          )}
        >
          <img
            src={getSpriteSource(chickenType)}
            alt={`${getDisplayName(chickenType)}`}
            className="w-full h-full object-contain image-rendering-pixelated"
            onError={(e) => {
              console.error(`Failed to load sprite: ${chickenType} at path ${getSpriteSource(chickenType)}`);
              // Use a colored pixel sprite as fallback to match the chicken type
              const colorMap = {
                white: "#f5f5dc",
                black: "#333333",
                brown: "#8B4513",
                golden: "#FFD700",
                red: "#FF0000",
                speckled: "#A52A2A"
              };
              
              const colorKey = Object.keys(colorMap).find(key => chickenType.includes(key)) || "white";
              const fallbackColor = colorMap[colorKey as keyof typeof colorMap];
              
              e.currentTarget.src = `data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16'%3E%3Crect width='16' height='16' fill='${fallbackColor}'/%3E%3C/svg%3E`;
            }}
          />
        </div>
      </div>
      
      {showName && (
        <div className="text-center mt-2 font-pixel text-white text-sm max-w-full truncate">
          {getDisplayName(chickenType)}
        </div>
      )}
    </div>
  );
}
