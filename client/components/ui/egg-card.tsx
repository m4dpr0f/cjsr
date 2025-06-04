import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { GaruEgg } from "@/components/html-sprites/garu-egg";

interface EggCardProps {
  egg: {
    id: number;
    name: string;
    type: string;
    elemental_affinity: string;
    color: string;
    rarity: string;
    hatched: number;
    level: number;
    xp: number;
    stats: {
      speed: number;
      endurance: number;
      luck: number;
      intellect: number;
    };
    created_at: string;
    source: string;
  };
}

// Map egg types to positions in the sprite sheet (row, column)
const eggTypeToPosition = {
  'flameheart': { row: 0, col: 0 },  // red/orange - top left
  'aquafrost': { row: 0, col: 1 },   // blue - top 2nd from left
  'terraverde': { row: 0, col: 2 },  // green/brown - top 3rd from left
  'skywisp': { row: 0, col: 3 },     // silver/white - top right
  'stonehide': { row: 1, col: 0 },   // gray - middle left
  'leafshade': { row: 1, col: 1 },   // bright green - middle 2nd from left
  'sunglow': { row: 1, col: 2 },     // yellow/gold - middle 3rd from left
  'voidmyst': { row: 1, col: 3 },    // purple/dark - middle right
  'naturevine': { row: 2, col: 0 },  // lime green - bottom left
  'ironclad': { row: 2, col: 1 },    // dark gray - bottom 2nd from left
  'shadowrift': { row: 2, col: 2 },  // purple/swirl - bottom 3rd from left
  'ethereal': { row: 2, col: 3 },    // opal/rainbow - bottom right
};

// Map rarity to colors
const rarityColors = {
  'common': 'bg-gray-400 text-gray-900',
  'uncommon': 'bg-green-400 text-green-900',
  'rare': 'bg-blue-400 text-blue-900',
  'epic': 'bg-purple-400 text-purple-900',
  'legendary': 'bg-amber-400 text-amber-900',
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  }).format(date);
};

export const EggCard: React.FC<EggCardProps> = ({ egg }) => {
  return (
    <Card className="bg-dark/80 pixel-border border-primary/50 overflow-hidden hover:border-primary transition-all">
      <CardHeader className="p-4 pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg font-minecraft text-primary">{egg.name}</CardTitle>
            <CardDescription className="text-xs mt-1">
              Found {formatDate(egg.created_at)}
            </CardDescription>
          </div>
          <Badge className={cn("font-minecraft uppercase text-xs", rarityColors[egg.rarity as keyof typeof rarityColors])}>
            {egg.rarity}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-2">
        <div className="flex gap-4">
          <div className="flex-shrink-0 w-16 h-16 rounded-md border border-primary/30 bg-black/30 flex items-center justify-center overflow-hidden">
            <GaruEgg 
              type={egg.type} 
              size="md"
            />
          </div>
          <div className="flex-1 space-y-2">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span>Type: <span className="text-primary">{egg.type}</span></span>
                <span>Element: <span className="text-primary">{egg.elemental_affinity}</span></span>
              </div>
              
              <div className="flex justify-between text-xs mb-2">
                <span>Level: <span className="text-primary">{egg.level}</span></span>
                <span>{egg.hatched ? "Hatched" : "Unhatched"}</span>
              </div>
            </div>
            
            <div className="space-y-1">
              <TooltipProvider>
                <div className="flex items-center justify-between text-xs">
                  <span>XP</span>
                  <span>{egg.xp}/{egg.level * 100}</span>
                </div>
                <Progress value={(egg.xp % 100)} className="h-2" />

                <div className="grid grid-cols-2 gap-x-2 gap-y-1 mt-2">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex justify-between text-xs">
                        <span>SPD</span>
                        <span>{egg.stats.speed}</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs">Speed: Affects typing speed bonus</p>
                    </TooltipContent>
                  </Tooltip>
                  
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex justify-between text-xs">
                        <span>END</span>
                        <span>{egg.stats.endurance}</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs">Endurance: Affects stamina in long races</p>
                    </TooltipContent>
                  </Tooltip>
                  
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex justify-between text-xs">
                        <span>LCK</span>
                        <span>{egg.stats.luck}</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs">Luck: Affects rare drop chance</p>
                    </TooltipContent>
                  </Tooltip>
                  
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex justify-between text-xs">
                        <span>INT</span>
                        <span>{egg.stats.intellect}</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs">Intellect: Affects accuracy bonus</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </TooltipProvider>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};