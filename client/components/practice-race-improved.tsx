import { useState, useEffect, useRef } from "react";
import { PixelButton } from "@/components/ui/pixel-button";
import { Card } from "@/components/ui/card";
import { ChickenAvatar } from "@/components/ui/chicken-avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Flag, Clock3, Trophy, Zap } from "lucide-react";
import { calculateWpm } from "@/lib/wpm-simple";

interface Racer {
  id: number;
  name: string;
  wpm: number;
  faction: string;
  chickenType: string;
  jockeyType: string;
  progress: number;
  finishTime: number | null;
  position: number | null;
  isPlayer: boolean;
  accuracy: number;
}

interface PracticeRaceProps {
  difficulty: 'novice' | 'adept' | 'master';
  playerFaction?: string | null;
  onRaceComplete: (results: { wpm: number; accuracy: number; position: number; time: number }) => void;
  onBackToMenu: () => void;
}

// Clean race prompts for different difficulties
const RACE_PROMPTS = {
  novice: {
    text: "The quick brown fox jumps over the lazy dog. This simple sentence contains every letter of the alphabet.",
    title: "Basic Alphabet Practice",
    difficulty: "Novice Difficulty"
  },
  adept: {
    text: "Beyond the Nether portal, chicken jockeys raced across lava lakes with burning determination. Their mounts squawked defiantly as they navigated treacherous obsidian paths toward victory.",
    title: "Adventure Chronicle",
    difficulty: "Adept Difficulty"
  },
  master: {
    text: "Quintessential expertise requires unwavering dedication to meticulous craftsmanship. Through systematic practice and relentless perseverance, extraordinary achievements become attainable realities that transcend conventional limitations.",
    title: "Mastery Meditation",
    difficulty: "Master Difficulty"
  }
};

// Elemental faction colors for clean display
const FACTION_COLORS = {
  'd2': 'bg-yellow-500',    // Coin
  'd4': 'bg-red-500',       // Fire
  'd6': 'bg-green-500',     // Earth
  'd8': 'bg-blue-500',      // Air
  'd10': 'bg-purple-500',   // Chaos
  'd12': 'bg-pink-500',     // Ether
  'd20': 'bg-cyan-500',     // Water
  'd100': 'bg-orange-500',  // Order
  'none': 'bg-gray-500'     // No faction (on foot)
};

// Fixed WPM assignment for NPCs based on faction and difficulty
function assignNpcWpm(faction: string, difficulty: 'novice' | 'adept' | 'master'): number {
  const baseWpm = {
    'd2': 35, 'd4': 45, 'd6': 40, 'd8': 50, 
    'd10': 60, 'd12': 55, 'd20': 65, 'd100': 70
  };
  
  const difficultyMultiplier = {
    novice: 0.7, adept: 1.0, master: 1.3
  };
  
  return Math.round((baseWpm[faction as keyof typeof baseWpm] || 40) * difficultyMultiplier[difficulty]);
}

export default function PracticeRaceImproved({ difficulty, playerFaction, onRaceComplete, onBackToMenu }: PracticeRaceProps) {
  const [countdown, setCountdown] = useState(3);
  const [raceStarted, setRaceStarted] = useState(false);
  const [raceFinished, setRaceFinished] = useState(false);
  const [racers, setRacers] = useState<Racer[]>([]);
  const [currentWpm, setCurrentWpm] = useState(0);
  const [typed, setTyped] = useState("");
  const [accuracy, setAccuracy] = useState(100);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<number | null>(null);
  
  const prompt = RACE_PROMPTS[difficulty];
  const isPlacementTest = playerFaction === null;

  // Initialize racers
  useEffect(() => {
    const playerRacer: Racer = {
      id: 1,
      name: isPlacementTest ? "Player" : "You",
      wpm: 0,
      faction: playerFaction || 'none',
      chickenType: isPlacementTest ? 'zombie' : 'html_steve',
      jockeyType: isPlacementTest ? 'none' : 'steve',
      progress: 0,
      finishTime: null,
      position: null,
      isPlayer: true,
      accuracy: 100
    };

    const npcRacer: Racer = {
      id: 2,
      name: isPlacementTest ? "TeacherGuru" : "OpponentGuru",
      wpm: assignNpcWpm('d12', difficulty), // TeacherGuru uses Ether faction
      faction: 'd12',
      chickenType: 'html_teacherGuru',
      jockeyType: 'generic',
      progress: 0,
      finishTime: null,
      position: null,
      isPlayer: false,
      accuracy: 95
    };

    setRacers([playerRacer, npcRacer]);
  }, [difficulty, playerFaction, isPlacementTest]);

  // Countdown logic
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(prev => prev - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0 && !raceStarted) {
      setRaceStarted(true);
      setStartTime(Date.now());
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [countdown, raceStarted]);

  // Race timer and simple NPC movement
  useEffect(() => {
    if (raceStarted && !raceFinished) {
      timerRef.current = window.setInterval(() => {
        const now = Date.now();
        if (startTime) {
          const elapsed = (now - startTime) / 1000; // seconds as decimal
          setElapsedTime(Math.floor(elapsed));

          // Simple NPC movement: characters per second = WPM * 5 / 60
          setRacers(prev => prev.map(racer => {
            if (!racer.isPlayer && !racer.finishTime) {
              const charactersPerSecond = (racer.wpm * 5) / 60;
              const expectedChars = charactersPerSecond * elapsed;
              const newProgress = Math.min(100, (expectedChars / prompt.text.length) * 100);
              
              // Check if NPC finished
              if (newProgress >= 100 && !racer.finishTime) {
                return { ...racer, progress: 100, finishTime: Math.floor(elapsed), position: getNextPosition() };
              }
              
              return { ...racer, progress: newProgress };
            }
            return racer;
          }));
        }
      }, 100);

      return () => {
        if (timerRef.current) clearInterval(timerRef.current);
      };
    }
  }, [raceStarted, raceFinished, startTime, prompt.text.length]);

  const getNextPosition = () => {
    const finishedRacers = racers.filter(r => r.finishTime !== null);
    return finishedRacers.length + 1;
  };

  const handleTyping = (value: string) => {
    if (!raceStarted || raceFinished) return;

    setTyped(value);
    const correctChars = value.split('').filter((char, i) => char === prompt.text[i]).length;
    const currentAccuracy = value.length > 0 ? Math.round((correctChars / value.length) * 100) : 100;
    setAccuracy(currentAccuracy);

    if (startTime) {
      const elapsed = Date.now() - startTime;
      const wpm = calculateWpm(correctChars, elapsed);
      setCurrentWpm(wpm);

      const progress = Math.min(100, (correctChars / prompt.text.length) * 100);
      
      // Update player progress
      setRacers(prev => prev.map(racer => 
        racer.isPlayer ? { ...racer, progress, wpm, accuracy: currentAccuracy } : racer
      ));

      // Check if player finished
      if (correctChars >= prompt.text.length && !raceFinished) {
        const finalTime = Math.floor(elapsed / 1000);
        const position = getNextPosition();
        
        setRaceFinished(true);
        setRacers(prev => prev.map(racer => 
          racer.isPlayer ? { ...racer, finishTime: finalTime, position } : racer
        ));

        setTimeout(() => {
          onRaceComplete({
            wpm: Math.round(wpm),
            accuracy: currentAccuracy,
            position,
            time: finalTime
          });
        }, 1500);
      }
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-purple-900 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <Card className="p-6 bg-slate-800/50 border-yellow-500/20">
          <div className="text-center space-y-4">
            <h1 className="text-3xl font-bold text-white">
              {isPlacementTest ? "PLACEMENT TEST" : "PRACTICE RACE"}
            </h1>
            <p className="text-slate-300">
              {isPlacementTest 
                ? "Face TeacherGuru in a 1v1 race to the Elemental Egg Nest. Race on foot while TeacherGuru rides his mount."
                : `Test your skills against OpponentGuru in this ${difficulty} difficulty challenge.`
              }
            </p>
            {isPlacementTest && (
              <p className="text-blue-400">
                Your performance will unlock recommendations from the 8 elemental eggs waiting at the finish line.
              </p>
            )}
          </div>
        </Card>

        {/* Race Info */}
        <Card className="p-4 bg-slate-800/50 border-yellow-500/20">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold text-white">{prompt.title}</h2>
              <p className="text-slate-400">{prompt.difficulty}</p>
            </div>
            <div className="flex items-center space-x-4 text-white">
              <div className="flex items-center space-x-1">
                <Clock3 className="w-4 h-4" />
                <span>{formatTime(elapsedTime)}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Zap className="w-4 h-4 text-yellow-400" />
                <span className="text-yellow-400 font-bold">{Math.round(currentWpm)} WPM</span>
              </div>
              <div className="text-green-400">{accuracy}% ACC</div>
            </div>
          </div>
        </Card>

        {/* Countdown or Race Display */}
        {countdown > 0 ? (
          <Card className="p-12 bg-slate-800/50 border-yellow-500/20 text-center">
            <div className="text-6xl font-bold text-yellow-400 mb-4">{countdown}</div>
            <p className="text-white text-xl">Get Ready!</p>
          </Card>
        ) : (
          <>
            {/* Racers Display */}
            <Card className="p-4 bg-slate-800/50 border-yellow-500/20">
              <div className="space-y-2">
                {racers.map((racer, index) => (
                  <div key={racer.id} className="flex items-center space-x-4 p-3 bg-slate-700/50 rounded-lg">
                    <div className="w-8 h-8 rounded-full bg-slate-600 flex items-center justify-center text-white font-bold">
                      {index + 1}
                    </div>
                    <div className="w-16">
                      <ChickenAvatar 
                        chickenType={racer.chickenType} 
                        jockeyType={racer.jockeyType} 
                        size="md" 
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-white font-medium">{racer.name}</span>
                        <div className={cn("w-3 h-3 rounded-full", FACTION_COLORS[racer.faction])} />
                      </div>
                      <div className="w-full bg-slate-600 rounded-full h-3 mt-1">
                        <div 
                          className="bg-yellow-400 h-3 rounded-full transition-all duration-200"
                          style={{ width: `${racer.progress}%` }}
                        />
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-yellow-400 font-bold">{Math.round(racer.wpm)} WPM</div>
                      {racer.finishTime && (
                        <div className="text-green-400 text-sm">
                          <Trophy className="w-3 h-3 inline mr-1" />
                          {formatTime(racer.finishTime)}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Typing Area */}
            <Card className="p-6 bg-slate-800/50 border-yellow-500/20">
              <div className="space-y-4">
                <div className="text-lg leading-relaxed font-mono p-4 bg-slate-700 rounded-lg">
                  {prompt.text.split('').map((char, index) => (
                    <span
                      key={index}
                      className={cn(
                        index < typed.length
                          ? typed[index] === char
                            ? "text-green-400 bg-green-400/20"
                            : "text-red-400 bg-red-400/20"
                          : index === typed.length
                          ? "text-white bg-yellow-400/30"
                          : "text-slate-400"
                      )}
                    >
                      {char}
                    </span>
                  ))}
                </div>

                <input
                  ref={inputRef}
                  type="text"
                  value={typed}
                  onChange={(e) => handleTyping(e.target.value)}
                  disabled={!raceStarted || raceFinished}
                  className="w-full p-4 bg-slate-700 border border-slate-600 rounded-lg text-white text-lg font-mono focus:outline-none focus:border-yellow-400"
                  placeholder={raceStarted ? "Start typing..." : "Wait for the race to begin..."}
                />
              </div>
            </Card>

            {/* Back Button */}
            <div className="text-center">
              <PixelButton onClick={onBackToMenu} variant="outline">
                Back to Menu
              </PixelButton>
            </div>
          </>
        )}
      </div>
    </div>
  );
}