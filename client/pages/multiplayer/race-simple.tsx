import { useEffect, useState, useRef } from "react";
import { useLocation } from "wouter";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { PixelButton } from "@/components/ui/pixel-button";
import { ChickenAvatar } from "@/components/ui/chicken-avatar";
import { apiRequest } from "@/lib/queryClient";
import { Flag, Clock3 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Racer {
  id: number;
  username: string;
  level: number;
  isYou: boolean;
  chickenType: string;
  jockeyType: string;
  progress: number;
  position: number | null;
  wpm: number;
  accuracy: number;
  finishTime: number | null;
}

export default function MultiplayerRace() {
  // Routing
  const [_, setLocation] = useLocation();
  
  // Race state
  const [countdown, setCountdown] = useState<number | null>(3);
  const [raceStarted, setRaceStarted] = useState(false);
  const [raceFinished, setRaceFinished] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [currentPosition, setCurrentPosition] = useState<number | null>(null);
  
  // Typing state
  const [racePrompt, setRacePrompt] = useState<string>(
    "As the sun sets over the mountain range, a flock of birds takes flight across the amber sky, creating a mesmerizing pattern."
  );
  const [typed, setTyped] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [error, setError] = useState(false);
  const [errorCount, setErrorCount] = useState(0);
  const [totalKeypresses, setTotalKeypresses] = useState(0);
  
  // Simple stats tracking - cleaner approach
  const [currentWpm, setCurrentWpm] = useState(0);
  
  // Refs
  const inputRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<number | null>(null);
  const timeStartRef = useRef<number | null>(null);
  const typingStartTimeRef = useRef<number | null>(null); // Time when first character was typed
  
  // Racing participants
  const [racers, setRacers] = useState<Racer[]>([
    { 
      id: 100, 
      username: "You", 
      level: 1, 
      isYou: true, 
      chickenType: "html_steve", 
      jockeyType: "steve",
      progress: 0, 
      position: null, 
      wpm: 0, 
      accuracy: 100, 
      finishTime: null 
    },
    { 
      id: 101, 
      username: "SpeedTyper", 
      level: 7, 
      isYou: false, 
      chickenType: "html_auto",
      jockeyType: "auto", 
      progress: 0, 
      position: null, 
      wpm: 0, 
      accuracy: 100, 
      finishTime: null 
    },
    { 
      id: 102, 
      username: "TypeRacer2000", 
      level: 5, 
      isYou: false, 
      chickenType: "html_matikah",
      jockeyType: "matikah", 
      progress: 0, 
      position: null, 
      wpm: 0, 
      accuracy: 100, 
      finishTime: null 
    },
    { 
      id: 103, 
      username: "QwertySmashter", 
      level: 3, 
      isYou: false, 
      chickenType: "html_death",
      jockeyType: "death", 
      progress: 0, 
      position: null, 
      wpm: 0, 
      accuracy: 100, 
      finishTime: null 
    },
    { 
      id: 104, 
      username: "CodeNinja", 
      level: 8, 
      isYou: false, 
      chickenType: "html_steve",
      jockeyType: "steve", 
      progress: 0, 
      position: null, 
      wpm: 0, 
      accuracy: 100, 
      finishTime: null 
    },
    { 
      id: 105, 
      username: "FastFingers", 
      level: 6, 
      isYou: false, 
      chickenType: "html_auto",
      jockeyType: "auto", 
      progress: 0, 
      position: null, 
      wpm: 0, 
      accuracy: 100, 
      finishTime: null 
    },
    { 
      id: 106, 
      username: "KeyboardKing", 
      level: 4, 
      isYou: false, 
      chickenType: "html_matikah",
      jockeyType: "matikah", 
      progress: 0, 
      position: null, 
      wpm: 0, 
      accuracy: 100, 
      finishTime: null 
    },
    { 
      id: 107, 
      username: "WordWizard", 
      level: 2, 
      isYou: false, 
      chickenType: "html_death",
      jockeyType: "death", 
      progress: 0, 
      position: null, 
      wpm: 0, 
      accuracy: 100, 
      finishTime: null 
    }
  ]);
  
  // Format time display
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };
  
  // Basic WPM calculation - with realistic limits
  const calculateWpm = (chars: number, seconds: number): number => {
    if (seconds === 0) return 0;
    // Standard WPM formula: (characters / 5) / minutes
    const raw = (chars / 5) / (seconds / 60);
    // Ensure result is in a realistic range
    return Math.round(Math.min(200, Math.max(0, raw)));
  };
  
  // Initialize race countdown
  useEffect(() => {
    const countdownInterval = setInterval(() => {
      setCountdown(prevCountdown => {
        if (prevCountdown === null) return null;
        if (prevCountdown <= 1) {
          clearInterval(countdownInterval);
          setRaceStarted(true);
          timeStartRef.current = Date.now();
          return null;
        }
        return prevCountdown - 1;
      });
    }, 1000);
    
    return () => {
      clearInterval(countdownInterval);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);
  
  // Main race loop - runs when race starts
  useEffect(() => {
    if (raceStarted && inputRef.current) {
      inputRef.current.focus();
      
      // Start the race timer
      timerRef.current = window.setInterval(() => {
        if (timeStartRef.current) {
          const now = Date.now();
          const elapsed = Math.floor((now - timeStartRef.current) / 1000);
          setElapsedTime(elapsed);
          
          // Update player position and progress regardless of WPM
          // Progress is purely based on how far you are in typing the text
          const progress = Math.min(100, Math.round((currentIndex / racePrompt.length) * 100));
          
          // Update player progress in the race - this affects visual representation
          setRacers(prev => prev.map(racer => 
            racer.isYou ? {
              ...racer,
              progress: progress
            } : racer
          ));
          
          // Calculate WPM only if the player has started typing
          if (typingStartTimeRef.current && currentIndex > 0) {
            // Calculate WPM based on actual typing time, not race time
            const typingElapsed = (Date.now() - typingStartTimeRef.current) / 1000;
            
            if (typingElapsed > 0) {
              // Standard WPM formula: (characters / 5) / minutes
              const words = currentIndex / 5;
              const minutes = typingElapsed / 60;
              const calculatedWpm = Math.round(words / minutes);
              
              // Ensure WPM is a reasonable value
              const wpm = Math.min(250, Math.max(0, calculatedWpm));
              setCurrentWpm(wpm);
              
              // Update WPM stat only, without affecting position/movement
              setRacers(prev => prev.map(racer => 
                racer.isYou ? {
                  ...racer,
                  wpm: wpm
                } : racer
              ));
            }
          }
        }
      }, 1000);
      
      // NPC movement - based on realistic typing speeds
      const npcInterval = setInterval(() => {
        if (!raceFinished) {
          setRacers(prev => {
            const updatedRacers = prev.map(racer => {
              if (!racer.isYou && racer.progress < 100) {
                // Assign realistic WPM values to NPCs based on their level/difficulty
                let baseWpm = 0;
                if (racer.id % 4 === 0) baseWpm = 70; // Fast typist (~70 WPM)
                if (racer.id % 4 === 1) baseWpm = 55; // Good typist (~55 WPM)
                if (racer.id % 4 === 2) baseWpm = 40; // Average typist (~40 WPM)
                if (racer.id % 4 === 3) baseWpm = 30; // Slow typist (~30 WPM)
                
                // Add some natural variation (±15%)
                const variation = (Math.random() * 0.3) - 0.15; // -15% to +15%
                const typingWpm = baseWpm * (1 + variation);
                
                // Calculate how many characters they'd type in 500ms at this WPM
                // WPM = (chars / 5) / minutes, so chars = WPM * 5 * minutes
                const minutes = 0.5 / 60; // 500ms in minutes
                const charsTyped = typingWpm * 5 * minutes;
                
                // Convert characters to progress percentage (based on prompt length)
                const progressIncrement = (charsTyped / racePrompt.length) * 100;
                const newProgress = Math.min(100, racer.progress + progressIncrement);
                
                // Update NPC's WPM stat for display
                const displayWpm = Math.round(typingWpm);
                
                // Check if NPC finished
                if (newProgress >= 100 && racer.finishTime === null) {
                  const finishedCount = prev.filter(r => r.finishTime !== null).length;
                  return {
                    ...racer,
                    progress: 100,
                    position: finishedCount + 1,
                    finishTime: elapsedTime,
                    wpm: displayWpm
                  };
                }
                
                return {
                  ...racer,
                  progress: newProgress,
                  wpm: displayWpm
                };
              }
              return racer;
            });
            
            // Sort racers by progress for display
            updatedRacers.sort((a, b) => {
              // Finished racers come first, sorted by position
              if (a.position !== null && b.position !== null) {
                return a.position - b.position;
              }
              // Finished racers come before unfinished
              if (a.position !== null) return -1;
              if (b.position !== null) return 1;
              // Sort unfinished racers by progress (descending)
              return b.progress - a.progress;
            });
            
            return updatedRacers;
          });
        }
      }, 500);
      
      return () => {
        clearInterval(npcInterval);
      };
    }
  }, [raceStarted, raceFinished, elapsedTime]);
  
  // Cleanup timer when component unmounts
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);
  
  // Handle keyboard input
  const handleKeyDown = (e: KeyboardEvent) => {
    if (!raceStarted || raceFinished) return;
    
    // Handle special keys
    if (e.key === 'Tab' || e.key === 'Enter') {
      e.preventDefault();
      return;
    }
    
    // Handle backspace
    if (e.key === 'Backspace') {
      if (typed.length > 0) {
        setTyped(prev => prev.slice(0, -1));
        if (currentIndex > 0) {
          setCurrentIndex(prev => prev - 1);
        }
        setError(false);
      }
      return;
    }
    
    // Handle regular typing
    if (e.key.length === 1) {
      // Start timing on first keypress
      if (currentIndex === 0 && typingStartTimeRef.current === null) {
        typingStartTimeRef.current = Date.now();
      }
      
      setTotalKeypresses(prev => prev + 1);
      
      // Check if character matches expected
      if (currentIndex < racePrompt.length && e.key === racePrompt[currentIndex]) {
        // Correct character
        setTyped(prev => prev + e.key);
        setCurrentIndex(prev => prev + 1);
        setError(false);
        
        // Check if race completed
        if (currentIndex + 1 === racePrompt.length) {
          // Race finished!
          const finishedCount = racers.filter(r => r.finishTime !== null).length;
          const position = finishedCount + 1;
          setCurrentPosition(position);
          setRaceFinished(true);
          
          // Calculate final WPM based on characters typed and time taken
          const finalWpm = calculateWpm(racePrompt.length, elapsedTime);
          
          // Update player's final stats and ensure proper sorting
          const updatedRacers = [...racers].map(racer => 
            racer.isYou ? {
              ...racer,
              progress: 100,
              position: position,
              finishTime: elapsedTime,
              wpm: finalWpm, // Use the final WPM calculation
              accuracy: totalKeypresses > 0 
                ? Math.round(((totalKeypresses - errorCount) / totalKeypresses) * 100)
                : 100
            } : racer
          );
          
          // Re-sort racers to ensure proper display order
          updatedRacers.sort((a, b) => {
            // Finished racers come first, sorted by position
            if (a.position !== null && b.position !== null) {
              return a.position - b.position;
            }
            // Finished racers come before unfinished
            if (a.position !== null) return -1;
            if (b.position !== null) return 1;
            // Sort unfinished racers by progress
            return b.progress - a.progress;
          });
          
          setRacers(updatedRacers);
        }
      } else {
        // Wrong character
        setError(true);
        setErrorCount(prev => prev + 1);
      }
    }
  };
  
  // Add keyboard event listener
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [raceStarted, raceFinished, typed, currentIndex, elapsedTime, errorCount, totalKeypresses, racers]);
  
  // Handle navigation buttons
  const handleBack = () => {
    setLocation('/multiplayer');
  };
  
  const handleRestart = () => {
    setLocation('/multiplayer');
  };
  
  return (
    <div className="flex flex-col min-h-screen bg-dark-950">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 pt-2 pb-6 max-w-6xl">
        {countdown !== null ? (
          <div className="flex flex-col items-center justify-center h-64">
            <h1 className="text-4xl font-minecraft text-primary mb-8">GET READY TO RACE!</h1>
            <div className="text-8xl font-minecraft text-yellow-400 animate-pulse">
              {countdown}
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Race header */}
            <div className="flex justify-between items-center h-10">
              <div className="flex items-center">
                <h1 className="text-xl font-minecraft text-primary mr-2">MULTIPLAYER RACE</h1>
                <div className="bg-dark-800 px-2 py-1 rounded-lg flex items-center">
                  <Clock3 className="w-4 h-4 text-yellow-400 mr-1" />
                  <span className="text-md font-minecraft text-yellow-400">{formatTime(elapsedTime)}</span>
                </div>
              </div>
              {currentPosition && (
                <div className="bg-dark-800 px-2 py-1 rounded-lg flex items-center">
                  <Flag className="w-4 h-4 text-primary mr-1" />
                  <span className="text-md font-minecraft text-primary">
                    Position: {currentPosition}/{racers.length}
                  </span>
                </div>
              )}
            </div>
            
            {/* Race track */}
            <div className="bg-dark-800 p-3 rounded-lg pixel-border mb-3">
              <div className="space-y-0.5">
                {racers.map((racer, index) => (
                  <div key={racer.id} className="mb-0.5">
                    <div className="flex items-center h-8">
                      {/* Racer identity */}
                      <div className="w-24 flex items-center mr-1">
                        <div className="w-4 mr-1 text-center">
                          <span className="text-xs text-gray-500">{index + 1}</span>
                        </div>
                        <div className="w-5 h-5 mr-1">
                          {racer.isYou ? (
                            <span className="text-xs text-primary font-bold">(You)</span>
                          ) : null}
                        </div>
                        <div className="truncate text-xs">
                          <span className={racer.isYou ? 'text-primary' : 'text-gray-400'}>
                            {racer.username}
                          </span>
                        </div>
                      </div>
                      
                      {/* Race track */}
                      <div className="flex-1 relative h-8 bg-dark-900 rounded overflow-hidden flex mx-1">
                        {/* Track design */}
                        <div className="absolute left-0 top-1/2 w-full border-b border-dashed border-gray-800 opacity-30"></div>
                        <div className="absolute right-[5%] top-0 bottom-0 border-r-2 border-dashed border-gray-300 opacity-50"></div>
                        
                        {/* Racer avatar */}
                        <div 
                          className="absolute top-0 h-full flex items-center justify-center transition-all duration-300 z-10"
                          style={{ 
                            left: `${Math.max(0, Math.min(95, racer.progress))}%`,
                            zIndex: 100 - (racer.position || 99) // Higher positions (1st place) get higher z-index
                          }}
                        >
                          <div className="transform -translate-y-1">
                            <ChickenAvatar 
                              chickenType={racer.chickenType || "html_steve"}
                              jockeyType={racer.jockeyType || "steve"}
                              size="xs"
                              animation={raceFinished ? "idle" : "run"}
                              flipped={false}
                            />
                          </div>
                        </div>
                      </div>
                      
                      {/* Stats */}
                      <div className="flex items-center w-20 text-right space-x-1">
                        <div className="w-9 text-right">
                          <span className={`text-xs ${racer.isYou ? 'text-primary font-bold' : 'text-gray-400'}`}>
                            {racer.wpm > 0 ? Math.round(racer.wpm) : '0'}
                          </span>
                        </div>
                        
                        {/* Position or progress */}
                        {racer.position ? (
                          <div className="w-9 text-right">
                            <span className={`text-xs font-medium ${
                              racer.position === 1 ? 'text-yellow-300' : 
                              racer.position === 2 ? 'text-gray-300' : 
                              racer.position === 3 ? 'text-amber-600' : 'text-gray-400'
                            }`}>
                              {racer.position}{
                                racer.position === 1 ? 'st' : 
                                racer.position === 2 ? 'nd' : 
                                racer.position === 3 ? 'rd' : 'th'
                              }
                            </span>
                          </div>
                        ) : (
                          <div className="w-9 text-right">
                            <span className="text-xs text-gray-400">{Math.round(racer.progress)}%</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Typing interface */}
            <div className="bg-dark-800 p-4 rounded-lg pixel-border">
              {raceFinished ? (
                <div className="space-y-4">
                  <h2 className="text-2xl font-minecraft text-primary text-center">RACE COMPLETE!</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-dark-950 p-3 rounded flex flex-col items-center justify-center">
                      <span className="text-gray-400 text-xs mb-1">YOUR POSITION</span>
                      <span className={`text-2xl font-minecraft ${
                        currentPosition === 1 ? 'text-yellow-300' : 
                        currentPosition === 2 ? 'text-gray-300' : 
                        currentPosition === 3 ? 'text-amber-600' : 'text-white'
                      }`}>
                        {currentPosition}{
                          currentPosition === 1 ? 'ST' : 
                          currentPosition === 2 ? 'ND' : 
                          currentPosition === 3 ? 'RD' : 'TH'
                        }
                      </span>
                    </div>
                    
                    <div className="bg-dark-950 p-3 rounded flex flex-col items-center justify-center">
                      <span className="text-gray-400 text-xs mb-1">WPM</span>
                      <span className="text-2xl font-minecraft text-primary">
                        {racers.find(r => r.isYou)?.wpm || currentWpm}
                      </span>
                    </div>
                    
                    <div className="bg-dark-950 p-3 rounded flex flex-col items-center justify-center">
                      <span className="text-gray-400 text-xs mb-1">ACCURACY</span>
                      <span className="text-2xl font-minecraft text-primary">
                        {totalKeypresses > 0 
                          ? Math.round(((totalKeypresses - errorCount) / totalKeypresses) * 100) 
                          : 100}%
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex justify-center mt-4 space-x-4">
                    <PixelButton onClick={handleRestart} className="w-48">
                      Race Again
                    </PixelButton>
                    
                    <PixelButton onClick={handleBack} className="w-48" variant="outline">
                      Back to Menu
                    </PixelButton>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-dark-950 p-3 rounded">
                    {/* Text display with current character highlighted */}
                    <div className="font-mono text-lg leading-relaxed">
                      {/* Typed text */}
                      <span className="text-green-400">
                        {racePrompt.substring(0, currentIndex)}
                      </span>
                      
                      {/* Current character */}
                      {currentIndex < racePrompt.length && (
                        <span className="bg-primary/30 text-primary">
                          {racePrompt.charAt(currentIndex)}
                        </span>
                      )}
                      
                      {/* Remaining text */}
                      <span className="text-white">
                        {racePrompt.substring(Math.min(currentIndex + 1, racePrompt.length))}
                      </span>
                    </div>
                  </div>
                  
                  {/* Typing input area */}
                  <div 
                    ref={inputRef}
                    tabIndex={0}
                    className={cn(
                      "bg-dark-950 p-3 rounded-lg border-2 min-h-[50px]",
                      error ? "border-red-500 animate-pulse" : "border-primary",
                      "focus:outline-none cursor-text"
                    )}
                  >
                    <span>{typed}</span>
                    <span className="inline-block w-2 h-4 bg-primary ml-1 animate-pulse"></span>
                  </div>
                  
                  <div className="flex justify-between mt-4">
                    <div className="flex space-x-4">
                      <div className="bg-dark-900 p-2 rounded-lg flex items-center min-w-[100px]">
                        <span className="text-gray-400 mr-2">WPM:</span>
                        <span className="text-primary font-bold">{currentWpm}</span>
                      </div>
                      <div className="bg-dark-900 p-2 rounded-lg flex items-center min-w-[100px]">
                        <span className="text-gray-400 mr-2">Acc:</span>
                        <span className="text-primary font-bold">
                          {totalKeypresses > 0 
                            ? Math.round(((totalKeypresses - errorCount) / totalKeypresses) * 100) 
                            : 100}%
                        </span>
                      </div>
                    </div>
                    <PixelButton onClick={handleBack} size="sm" variant="outline">
                      Leave Race
                    </PixelButton>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
}