import { useState, useEffect, useRef } from "react";
import { PixelButton } from "@/components/ui/pixel-button";
import { Card } from "@/components/ui/card";
import { ChickenAvatar } from "@/components/ui/chicken-avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Flag, Clock3 } from "lucide-react";

interface Racer {
  id: number;
  name: string;
  wpm: number; // Fixed, immutable target WPM
  faction: string;
  chickenType: string;
  jockeyType: string;
  progress: number;
  finishTime: number | null;
  position: number | null;
  isPlayer: boolean;
}

interface PracticeRaceProps {
  difficulty: 'novice' | 'adept' | 'master';
  playerFaction?: string | null; // null means racing on foot
  onRaceComplete: (results: { wpm: number; accuracy: number; position: number; time: number }) => void;
  onBackToMenu: () => void;
}

// Sample race prompts for different difficulties
const RACE_PROMPTS = {
  novice: {
    text: "The quick brown fox jumps over the lazy dog. This simple sentence contains every letter of the alphabet.",
    title: "Basic Alphabet Practice"
  },
  adept: {
    text: "Beyond the Nether portal, chicken jockeys raced across lava lakes with burning determination. Their mounts squawked defiantly as they navigated treacherous obsidian paths toward victory.",
    title: "Adventure Chronicle"
  },
  master: {
    text: "Quintessential expertise requires unwavering dedication to meticulous craftsmanship. Through systematic practice and relentless perseverance, extraordinary achievements become attainable realities that transcend conventional limitations.",
    title: "Mastery Meditation"
  }
};

// Elemental faction WPM assignment - FIXED at race start
function assignNpcWpm(faction: string, difficulty: 'novice' | 'adept' | 'master'): number {
  // Base ranges adjusted by difficulty
  const difficultyMultiplier = {
    novice: 0.6,
    adept: 1.0,
    master: 1.4
  }[difficulty];

  const baseRanges: Record<string, { min: number; max: number }> = {
    'd4': { min: 75, max: 90 }, // Fire Legion
    'd20': { min: 65, max: 80 }, // Water Guardians  
    'd8': { min: 70, max: 85 }, // Air Nomads
    'd6': { min: 55, max: 70 }, // Earth Wardens
    'd12': { min: 85, max: 100 }, // Ether Seekers
    'd10': { min: 40, max: 110 }, // Chaos Riders (wider range)
    'd2': { min: 60, max: 85 }, // Coin Dynasty
    'd100': { min: 88, max: 88 } // Order Ascendant (always fixed)
  };

  const range = baseRanges[faction] || { min: 60, max: 80 };
  const min = Math.round(range.min * difficultyMultiplier);
  const max = Math.round(range.max * difficultyMultiplier);
  
  // Special case for Order Ascendant
  if (faction === 'd100') {
    return Math.round(88 * difficultyMultiplier);
  }
  
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// NPC names and characteristics
const NPC_POOL = [
  { name: "CrystalWing", faction: "d6", chickenType: "crystal", jockeyType: "steve" },
  { name: "ThunderBeak", faction: "d8", chickenType: "electric", jockeyType: "auto" },
  { name: "ShadowFeather", faction: "d12", chickenType: "shadow", jockeyType: "matikah" },
  { name: "PrismTail", faction: "d20", chickenType: "rainbow", jockeyType: "iam" },
  { name: "VoidRunner", faction: "d10", chickenType: "void", jockeyType: "steve" },
  { name: "SolarFlare", faction: "d4", chickenType: "fire", jockeyType: "auto" },
  { name: "FrostWing", faction: "d2", chickenType: "ice", jockeyType: "matikah" },
  { name: "NeonRush", faction: "d100", chickenType: "neon", jockeyType: "iam" }
];

export function PracticeRace({ difficulty, playerFaction = 'd4', onRaceComplete, onBackToMenu }: PracticeRaceProps) {
  const [racePrompt] = useState(RACE_PROMPTS[difficulty]);
  const [racers, setRacers] = useState<Racer[]>([]);
  const [isRaceActive, setIsRaceActive] = useState(false);
  const [raceStartTime, setRaceStartTime] = useState<number | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [typed, setTyped] = useState("");
  const [errors, setErrors] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [countdown, setCountdown] = useState<number | null>(null);
  
  const animationFrameRef = useRef<number>();
  const inputRef = useRef<HTMLInputElement>(null);

  // Check if this is a placement test (player has no faction)
  const isPlacementTest = !playerFaction;

  // Initialize racers
  useEffect(() => {
    const initialRacers: Racer[] = [];
    
    // Add player (racing on foot during placement test)
    initialRacers.push({
      id: 0,
      name: "Player",
      wpm: 0, // Will be calculated dynamically
      faction: playerFaction || "none", // "none" means racing on foot
      chickenType: playerFaction ? "default" : "zombie", // Zombie sprite for on-foot racing
      jockeyType: playerFaction ? "steve" : "zombie", // Zombie jockey when racing on foot
      progress: 0,
      finishTime: null,
      position: null,
      isPlayer: true
    });
    
    if (isPlacementTest) {
      // For placement test: only TeacherGuru as opponent
      initialRacers.push({
        id: 1,
        name: "TeacherGuru",
        wpm: 45, // Moderate challenge for placement
        faction: "d12", // Ether faction for wisdom/teaching
        chickenType: "ether",
        jockeyType: "matikah", // Wise teacher character
        progress: 0,
        finishTime: null,
        position: null,
        isPlayer: false
      });
    } else {
      // For regular practice: add 7 NPCs with FIXED WPM speeds
      for (let i = 1; i <= 7; i++) {
        const npcData = NPC_POOL[i - 1];
        // MECHANICAL ASSIGNMENT: Fixed WPM based on faction and difficulty
        const fixedWPM = assignNpcWpm(npcData.faction, difficulty);
        
        initialRacers.push({
          id: i,
          name: npcData.name,
          wpm: fixedWPM, // FIXED, IMMUTABLE WPM - this is what they display and race at
          faction: npcData.faction,
          chickenType: npcData.chickenType,
          jockeyType: npcData.jockeyType,
          progress: 0,
          finishTime: null,
          position: null,
          isPlayer: false
        });
      }
    }
    
    setRacers(initialRacers);
  }, [difficulty, playerFaction]);

  // Start race countdown
  const startRace = () => {
    let count = 3;
    setCountdown(count);
    
    const countdownInterval = setInterval(() => {
      count--;
      if (count > 0) {
        setCountdown(count);
      } else {
        setCountdown(null);
        setIsRaceActive(true);
        setRaceStartTime(Date.now());
        clearInterval(countdownInterval);
        
        // Focus input for immediate typing
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }
    }, 1000);
  };

  // Mechanical NPC movement using time-based calculations
  useEffect(() => {
    if (!isRaceActive || !raceStartTime || isFinished) return;

    const updateRaceProgress = () => {
      const now = Date.now();
      const elapsedSeconds = (now - raceStartTime) / 1000;
      setElapsedTime(Math.floor(elapsedSeconds));

      setRacers(prev => prev.map(racer => {
        if (racer.isPlayer || racer.finishTime !== null) return racer;

        // MECHANICAL CALCULATION: No randomness, pure math
        const cps = (racer.wpm * 5) / 60; // Characters per second
        const charactersTyped = elapsedSeconds * cps;
        const newProgress = Math.min(100, (charactersTyped / racePrompt.text.length) * 100);

        // Check if NPC finished
        if (newProgress >= 100 && racer.finishTime === null) {
          const finishedCount = prev.filter(r => r.finishTime !== null).length;
          return {
            ...racer,
            progress: 100,
            finishTime: elapsedSeconds,
            position: finishedCount + 1
          };
        }

        return {
          ...racer,
          progress: newProgress
        };
      }));

      if (!isFinished) {
        animationFrameRef.current = requestAnimationFrame(updateRaceProgress);
      }
    };

    animationFrameRef.current = requestAnimationFrame(updateRaceProgress);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isRaceActive, raceStartTime, isFinished, racePrompt.text.length]);

  // Handle player typing
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isRaceActive || isFinished) return;

    const target = e.target as HTMLInputElement;
    const newTyped = target.value;
    
    // Calculate current position in text
    const newIndex = newTyped.length;
    
    // Check for errors
    let errorCount = 0;
    for (let i = 0; i < newTyped.length; i++) {
      if (newTyped[i] !== racePrompt.text[i]) {
        errorCount++;
      }
    }
    
    setTyped(newTyped);
    setCurrentIndex(newIndex);
    setErrors(errorCount);
    
    // Update player progress
    const playerProgress = (newIndex / racePrompt.text.length) * 100;
    
    setRacers(prev => prev.map(racer => {
      if (!racer.isPlayer) return racer;
      
      // Calculate player WPM
      const elapsedMinutes = (Date.now() - (raceStartTime || 0)) / 60000;
      const wordsTyped = newIndex / 5; // 5 characters per word
      const playerWPM = elapsedMinutes > 0 ? Math.round(wordsTyped / elapsedMinutes) : 0;
      
      // Check if player finished
      if (newIndex >= racePrompt.text.length && !isFinished) {
        const finishedCount = prev.filter(r => r.finishTime !== null).length;
        const finalTime = (Date.now() - (raceStartTime || 0)) / 1000;
        const accuracy = Math.round(((newIndex - errorCount) / newIndex) * 100) || 0;
        
        setIsFinished(true);
        
        // Call completion callback
        setTimeout(() => {
          onRaceComplete({
            wpm: playerWPM,
            accuracy,
            position: finishedCount + 1,
            time: finalTime
          });
        }, 1000);
        
        return {
          ...racer,
          wpm: playerWPM,
          progress: 100,
          finishTime: finalTime,
          position: finishedCount + 1
        };
      }
      
      return {
        ...racer,
        wpm: playerWPM,
        progress: playerProgress
      };
    }));
  };

  // Sort racers by progress for display
  const sortedRacers = [...racers].sort((a, b) => {
    if (a.finishTime !== null && b.finishTime !== null) {
      return a.finishTime - b.finishTime;
    }
    if (a.finishTime !== null) return -1;
    if (b.finishTime !== null) return 1;
    return b.progress - a.progress;
  });

  return (
    <div className="space-y-6">
      {/* Race Header */}
      <Card className="minecraft-border p-4 bg-gray-900/80">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-pixel text-yellow-400">{racePrompt.title}</h2>
            <p className="text-sm text-gray-400 capitalize">{difficulty} Difficulty</p>
          </div>
          <div className="flex items-center gap-4">
            {isRaceActive && (
              <div className="flex items-center gap-2">
                <Clock3 className="w-4 h-4 text-blue-400" />
                <span className="text-blue-400 font-pixel">{elapsedTime}s</span>
              </div>
            )}
            {racers.find(r => r.isPlayer) && (
              <div className="text-right">
                <div className="text-lg font-pixel text-green-400">
                  {racers.find(r => r.isPlayer)?.wpm || 0} WPM
                </div>
                <div className="text-xs text-gray-400">
                  {Math.round(((typed.length - errors) / Math.max(1, typed.length)) * 100)}% ACC
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Countdown */}
      {countdown !== null && (
        <div className="text-center">
          <div className="text-6xl font-pixel text-yellow-400 animate-pulse">
            {countdown}
          </div>
        </div>
      )}

      {/* Race Track */}
      <Card className="minecraft-border p-4 bg-gray-900/80">
        <div className="space-y-3">
          {sortedRacers.map((racer, index) => (
            <div key={racer.id} className="relative">
              <div className="flex items-center mb-1">
                <div className="w-8 text-center">
                  <span className="text-sm font-pixel text-gray-400">
                    {racer.position || index + 1}
                  </span>
                </div>
                <div className="flex-grow flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {racer.faction.toUpperCase()}
                    </Badge>
                    <span className={`text-sm font-pixel ${racer.isPlayer ? 'text-yellow-400' : 'text-white'}`}>
                      {racer.name}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm text-gray-300">{racer.wpm} WPM</span>
                    {racer.finishTime && (
                      <span className="text-xs text-green-400 ml-2">✓</span>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Progress Track */}
              <div className="ml-8">
                <div className="h-8 bg-gray-800 rounded-lg relative overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-100 linear ${
                      racer.isPlayer 
                        ? 'bg-gradient-to-r from-yellow-500 to-yellow-400' 
                        : 'bg-gradient-to-r from-blue-600 to-blue-500'
                    }`}
                    style={{ width: `${racer.progress}%` }}
                  />
                  <div 
                    className="absolute top-0 h-full w-8 flex items-center justify-center transition-all duration-100 linear"
                    style={{ left: `calc(${racer.progress}% - 16px)` }}
                  >
                    <ChickenAvatar 
                      chickenType={racer.chickenType} 
                      jockeyType={racer.jockeyType}
                      size="sm"
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Typing Area */}
      {isRaceActive && !isFinished && (
        <Card className="minecraft-border p-4 bg-gray-900/80">
          <div className="space-y-4">
            <div className="text-lg leading-relaxed font-mono">
              <span className="text-green-400">{typed}</span>
              <span className="bg-yellow-400 text-black">
                {racePrompt.text[currentIndex] || ""}
              </span>
              <span className="text-gray-400">
                {racePrompt.text.slice(currentIndex + 1)}
              </span>
            </div>
            
            <input
              ref={inputRef}
              type="text"
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              onKeyUp={handleKeyPress}
              className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white font-mono focus:outline-none focus:border-yellow-400"
              placeholder="Type the text above..."
              disabled={!isRaceActive || isFinished}
            />
          </div>
        </Card>
      )}

      {/* Controls */}
      <div className="flex justify-center gap-4">
        {!isRaceActive && !isFinished && (
          <PixelButton onClick={startRace} size="lg">
            START RACE
          </PixelButton>
        )}
        
        <PixelButton onClick={onBackToMenu} variant="secondary">
          BACK TO ARENA
        </PixelButton>
      </div>
    </div>
  );
}