import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ChickenAvatar } from "@/components/ui/chicken-avatar";
import { Clock, Trophy, Target, Zap } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface Racer {
  id: string;
  name: string;
  position: number;
  wpm: number;
  progress: number;
  isPlayer: boolean;
  chickenType: string;
  jockeyType: string;
  targetEmoji: string;
}

interface PracticeRaceNewProps {
  onRaceComplete: (results: {
    wpm: number;
    accuracy: number;
    time: number;
    position: number;
    xpGained: number;
  }) => void;
  onBackToMenu: () => void;
  playerProfile?: {
    chicken_type?: string;
    jockey_type?: string;
    username?: string;
  };
}

export default function PracticeRaceNew({ onRaceComplete, onBackToMenu, playerProfile }: PracticeRaceNewProps) {
  const [raceText] = useState("The mystical eggs of the elemental realms await those brave enough to seek them. Ancient legends speak of eight sacred elements, each guarded by powerful spirits who test the worthiness of aspiring racers through trials of speed and precision.");
  const [typedText, setTypedText] = useState("");
  const [raceStarted, setRaceStarted] = useState(false);
  const [raceFinished, setRaceFinished] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [countdown, setCountdown] = useState(3);
  const [showCountdown, setShowCountdown] = useState(false);
  const [currentWpm, setCurrentWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [errors, setErrors] = useState(0);
  const textInputRef = useRef<HTMLInputElement>(null);

  // Initialize racers with player's actual skin and TeacherGuru NPC
  const [racers, setRacers] = useState<Racer[]>([
    {
      id: "player",
      name: "You", 
      position: 1,
      wpm: 0,
      progress: 0,
      isPlayer: true,
      // Default to generic HTML jockey for guests (no mount earned yet)
      chickenType: "html_generic",
      jockeyType: "html_generic", 
      targetEmoji: "🏁"
    },
    {
      id: "teacherguru",
      name: "TeacherGuru",
      position: 2,
      wpm: 0,
      progress: 0,
      isPlayer: false,
      chickenType: "html_teacherGuru",
      jockeyType: "html_teacherGuru",
      targetEmoji: "🥚💰" // Coin Dynasty egg
    }
  ]);

  // Update player racer when profile data loads
  useEffect(() => {
    setRacers(prevRacers => 
      prevRacers.map(racer => 
        racer.id === "player" 
          ? {
              ...racer,
              name: playerProfile?.username || "Guest",
              chickenType: playerProfile?.chicken_type || "html_generic",
              jockeyType: playerProfile?.jockey_type || "html_generic"
            }
          : racer
      )
    );
  }, [playerProfile]);

  // NPC movement with variable speed
  useEffect(() => {
    if (!raceStarted || raceFinished) return;

    const npcInterval = setInterval(() => {
      setRacers(prev => prev.map(racer => {
        if (racer.isPlayer || racer.progress >= 100) return racer;
        
        // TeacherGuru moves at 45-55 WPM equivalent speed
        const baseSpeed = 0.15; // Base progress per second
        const variation = (Math.random() - 0.5) * 0.1; // Random variation
        const increment = baseSpeed + variation;
        
        const newProgress = Math.min(racer.progress + increment, 100);
        const newWpm = Math.floor(45 + (Math.random() * 10)); // 45-55 WPM range
        
        return {
          ...racer,
          progress: newProgress,
          wpm: newWpm
        };
      }));
    }, 100);

    return () => clearInterval(npcInterval);
  }, [raceStarted, raceFinished]);

  // Calculate player progress and WPM
  useEffect(() => {
    if (!raceStarted || !startTime) return;

    const currentTime = Date.now();
    const elapsedMinutes = (currentTime - startTime) / 60000;
    const charactersTyped = typedText.length;
    const wordsTyped = charactersTyped / 5;
    const calculatedWpm = elapsedMinutes > 0 ? Math.round(wordsTyped / elapsedMinutes) : 0;
    
    const progressPercentage = (typedText.length / raceText.length) * 100;
    
    setCurrentWpm(calculatedWpm);
    
    setRacers(prev => prev.map(racer => 
      racer.isPlayer 
        ? { ...racer, progress: progressPercentage, wpm: calculatedWpm }
        : racer
    ));

    // Check if race is complete
    if (typedText === raceText) {
      setRaceFinished(true);
      const finalTime = (currentTime - startTime) / 1000;
      const finalAccuracy = Math.round(((raceText.length - errors) / raceText.length) * 100);
      
      // Determine position based on progress
      const sortedRacers = [...racers].sort((a, b) => b.progress - a.progress);
      const playerPosition = sortedRacers.findIndex(r => r.isPlayer) + 1;
      
      // Calculate XP based on your exact formula: points per character typed based on position
      const charactersTyped = raceText.length;
      const positionMultipliers: { [key: number]: number } = { 1: 1.0, 2: 0.5, 3: 0.33 };
      const multiplier = positionMultipliers[playerPosition] || 0.25; // 4th-8th place = 0.25
      const totalXP = Math.max(1, Math.floor(charactersTyped * multiplier));

      onRaceComplete({
        wpm: calculatedWpm,
        accuracy: finalAccuracy,
        time: finalTime,
        position: playerPosition,
        xpGained: totalXP
      });

      // Update player stats in database for quick races (using exact same approach as campaign races)
      setTimeout(async () => {
        try {
          await apiRequest('POST', '/api/stats/update-race', {
            wpm: Math.round(calculatedWpm),
            accuracy: Math.round(finalAccuracy),
            position: playerPosition,
            totalPlayers: 8, // Match what worked before (your history shows "Position: X/8")
            faction: 'd4', // Default faction for quick races
            xpGained: totalXP,
            raceType: 'Practice',
            promptText: raceText,
            raceTime: (Date.now() - startTime) / 1000 // Convert to seconds
          });
          console.log('✅ Quick race stats updated successfully!');
        } catch (error) {
          console.error('Failed to update quick race stats:', error);
        }
      }, 1000); // Same delay as campaign races
    }
  }, [typedText, raceStarted, startTime, raceText, errors, racers, onRaceComplete]);

  // Handle countdown and race start
  const startRace = () => {
    setShowCountdown(true);
    setCountdown(3);
    
    const countdownInterval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          setShowCountdown(false);
          setRaceStarted(true);
          setStartTime(Date.now());
          // Focus input after countdown
          setTimeout(() => textInputRef.current?.focus(), 100);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Handle typing input
  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!raceStarted || raceFinished) return;
    
    const newText = e.target.value;
    const lastChar = newText[newText.length - 1];
    const expectedChar = raceText[newText.length - 1];
    
    // Count errors
    if (lastChar && lastChar !== expectedChar) {
      setErrors(prev => prev + 1);
    }
    
    // Only allow correct progression
    if (raceText.startsWith(newText)) {
      setTypedText(newText);
      
      // Update accuracy
      const totalTyped = newText.length;
      if (totalTyped > 0) {
        setAccuracy(Math.round(((totalTyped - errors) / totalTyped) * 100));
      }
    }
  };

  // Update racer positions based on progress
  useEffect(() => {
    setRacers(prev => {
      const sorted = [...prev].sort((a, b) => b.progress - a.progress);
      return sorted.map((racer, index) => ({
        ...racer,
        position: index + 1
      }));
    });
  }, [racers]);

  if (showCountdown) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="text-6xl font-bold text-blue-600 mb-4">{countdown}</div>
            <div className="text-xl">Get ready to race for the elemental eggs!</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4">
      {/* Compact Race Header */}
      <div className="bg-gradient-to-r from-amber-900 to-amber-700 border-2 border-amber-500 rounded-lg p-4">
        <div className="flex items-center justify-between text-amber-100">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            <span className="font-bold">PRACTICE RACE: ELEMENTAL EGG HUNT</span>
          </div>
          <div className="flex gap-4 text-sm">
            <span className="flex items-center gap-1">
              <Zap className="w-4 h-4" /> WPM: {currentWpm}
            </span>
            <span className="flex items-center gap-1">
              <Trophy className="w-4 h-4" /> Accuracy: {accuracy}%
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" /> Progress: {Math.round((typedText.length / raceText.length) * 100)}%
            </span>
          </div>
        </div>
      </div>

      {/* Race Track with Moving Sprites */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 border-2 border-amber-500 rounded-lg p-4">
        <div className="text-amber-300 font-bold mb-3 text-center">RACE TRACK - REACH THE ELEMENTAL EGGS!</div>
        <div className="space-y-3">
          {racers.map((racer) => (
            <div key={racer.id} className="relative bg-amber-900/30 border border-amber-600 rounded p-2">
              <div className="flex items-center gap-3">
                {/* Racer Info */}
                <div className="flex items-center gap-2 min-w-[140px]">
                  <ChickenAvatar 
                    chickenType={racer.chickenType} 
                    jockeyType={racer.jockeyType}
                    size="sm"
                    animation="run"
                  />
                  <div className="text-white">
                    <div className="font-semibold text-sm">{racer.name}</div>
                    <div className="text-xs text-gray-400">Progress</div>
                  </div>
                </div>
                
                {/* Progress Track with Moving Position */}
                <div className="flex-1 relative bg-amber-950 rounded-full h-8 border border-amber-600">
                  {/* Track markers */}
                  <div className="absolute inset-0 flex justify-between items-center px-2 text-xs text-amber-400">
                    <span>START</span>
                    <span>25%</span>
                    <span>50%</span>
                    <span>75%</span>
                    <span>FINISH</span>
                  </div>
                  
                  {/* Moving racer sprite */}
                  <div 
                    className="absolute top-0 h-full flex items-center transition-all duration-200 ease-out"
                    style={{ 
                      left: `${Math.max(0, Math.min(racer.progress, 100))}%`,
                      transform: 'translateX(-50%)'
                    }}
                  >
                    <div className="w-8 h-8 flex items-center justify-center">
                      <ChickenAvatar 
                        chickenType={racer.chickenType} 
                        jockeyType={racer.jockeyType}
                        size="xs"
                        animation="run"
                      />
                    </div>
                  </div>
                  
                  {/* Progress bar background */}
                  <div 
                    className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-200"
                    style={{ width: `${racer.progress}%` }}
                  />
                </div>
                
                {/* Stats and Target */}
                <div className="flex items-center gap-2 min-w-[120px]">
                  <div className="text-right">
                    <div className="text-amber-300 font-bold text-sm">{Math.round(racer.progress)}%</div>
                    <div className="text-cyan-300 text-xs">{racer.wpm} WPM</div>
                  </div>
                  <div className="text-2xl">{racer.targetEmoji}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Compact Typing Area */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 border-2 border-amber-500 rounded-lg p-4">
        <div className="text-amber-300 font-bold mb-3 text-center">TYPE THE TEXT BELOW</div>
        
        <div className="bg-black border border-amber-600 rounded p-3 mb-3 text-lg leading-relaxed font-mono">
          <span className="text-green-400">{typedText}</span>
          <span className="bg-cyan-500 text-black">{raceText[typedText.length] || ""}</span>
          <span className="text-gray-400">{raceText.slice(typedText.length + 1)}</span>
        </div>
        
        {!raceStarted && !raceFinished ? (
          <Button onClick={startRace} className="w-full bg-amber-600 hover:bg-amber-700 text-black font-bold" size="lg">
            START PRACTICE RACE
          </Button>
        ) : raceFinished ? (
          <div className="text-center space-y-3">
            <div className="text-2xl font-bold text-green-400">🏆 RACE COMPLETE! 🏆</div>
            <Button onClick={onBackToMenu} className="bg-amber-600 hover:bg-amber-700 text-black font-bold" size="lg">
              Back to Practice Menu
            </Button>
          </div>
        ) : (
          <input
            ref={textInputRef}
            type="text"
            value={typedText}
            onChange={handleTextChange}
            className="w-full p-3 text-lg border-2 border-cyan-500 bg-black text-white rounded font-mono focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400"
            placeholder="Start typing..."
            autoComplete="off"
            spellCheck="false"
          />
        )}
      </div>
    </div>
  );
}