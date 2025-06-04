import { useEffect, useState, useRef } from "react";
import { useLocation } from "wouter";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { PixelButton } from "@/components/ui/pixel-button";
import { Badge } from "@/components/ui/badge";
import { ChickenAvatar } from "@/components/ui/chicken-avatar";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { apiRequest } from "@/lib/queryClient";
import { Flag, Award, XCircle, Clock3 } from "lucide-react";
import { cn } from "@/lib/utils";
import { calculateWPM, calculateAccuracy, calculateProgress } from "@/lib/wpm";

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
  
  // Racing stats
  const [typingStats, setTypingStats] = useState({
    wpm: 0,
    accuracy: 100
  });
  
  // Store starting time for accurate WPM calculation
  const [startTime, setStartTime] = useState<number | null>(null);
  
  // Refs
  const inputRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<number | null>(null);
  const timeStartRef = useRef<number | null>(null);
  
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
  
  // Initialize race countdown
  useEffect(() => {
    const countdownInterval = setInterval(() => {
      setCountdown(prevCountdown => {
        if (prevCountdown === null) return null;
        if (prevCountdown <= 1) {
          clearInterval(countdownInterval);
          setRaceStarted(true);
          const now = Date.now();
          timeStartRef.current = now;
          setStartTime(now);
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
      
      // Start the race timer - simple 1-second interval
      timerRef.current = window.setInterval(() => {
        if (timeStartRef.current) {
          const elapsed = Math.floor((Date.now() - timeStartRef.current) / 1000);
          setElapsedTime(elapsed);
          
          // Only calculate WPM if there's progress and time elapsed
          if (currentIndex > 0 && elapsed > 0) {
            // Use our centralized utility for consistent WPM calculation
            const wpm = calculateWPM(currentIndex, elapsed);
            
            // Update WPM stats
            setTypingStats(prev => ({
              ...prev,
              wpm: wpm
            }));
            
            // Update player's progress and WPM in the racers list
            setRacers(prev => 
              prev.map(racer => 
                racer.isYou ? { 
                  ...racer, 
                  wpm: wpm,
                  progress: calculateProgress(currentIndex, racePrompt.length)
                } : racer
              )
            );
          }
        }
      }, 1000);
      
      // NPC simulation
      const racerSimulation = setInterval(() => {
        if (!raceFinished) {
          setRacers(prevRacers => {
            const updatedRacers = prevRacers.map(racer => {
              if (!racer.isYou && racer.progress < 100 && racer.position === null) {
                // Different racers have different speeds
                let speedFactor = 1;
                if (racer.id === 101) speedFactor = 2.2; // Fast
                if (racer.id === 102) speedFactor = 1.6; // Medium
                if (racer.id === 103) speedFactor = 1.3; // Slow
                
                // Add some randomness
                const randomProgress = (Math.random() * 3) * speedFactor;
                const newProgress = Math.min(100, racer.progress + randomProgress);
                
                // Check if racer finished
                if (newProgress === 100 && racer.finishTime === null) {
                  const finishedRacers = prevRacers.filter(r => r.finishTime !== null).length;
                  return {
                    ...racer,
                    progress: newProgress,
                    position: finishedRacers + 1,
                    finishTime: elapsedTime,
                    wpm: 60 + Math.floor(Math.random() * 50), // Random WPM for NPCs
                    accuracy: 85 + Math.floor(Math.random() * 15) // Random accuracy for NPCs
                  };
                }
                
                return { ...racer, progress: newProgress, wpm: racer.wpm || (30 + Math.floor(randomProgress * 10)) };
              }
              return racer;
            });
            
            return updatedRacers;
          });
        }
      }, 500);
      
      return () => {
        clearInterval(racerSimulation);
      };
    }
  }, [raceStarted, raceFinished, elapsedTime, typed.length]);
  
  // Cleanup timer when race finishes
  useEffect(() => {
    if (raceFinished && timerRef.current) {
      clearInterval(timerRef.current);
    }
  }, [raceFinished]);
  
  // Handle key presses
  const handleKeyDown = (e: KeyboardEvent) => {
    if (!raceStarted || raceFinished) return;
    
    // Prevent default for some keys
    if (e.key === 'Tab' || e.key === 'Enter') {
      e.preventDefault();
      
      // Allow Enter to restart race if finished
      if (e.key === 'Enter' && raceFinished) {
        setLocation('/multiplayer');
        return;
      }
      
      return; // For Tab and Enter, just prevent default and return
    }

    if (e.key === "Backspace") {
      if (typed.length > 0) {
        // Remove the last character from typed text
        setTyped(prev => prev.slice(0, -1));
        
        // Update current index if needed
        if (currentIndex > 0) {
          setCurrentIndex(prev => prev - 1);
        }
        
        // Clear error state
        setError(false);
      }
      return;
    }
    
    // For normal character input
    if (e.key.length === 1) {
      // Increment total keypresses for accuracy calculation
      setTotalKeypresses(prev => prev + 1);
      
      // Check if the typed character matches the expected one
      if (currentIndex < racePrompt.length && e.key === racePrompt[currentIndex]) {
        // Correct character
        setTyped(prev => prev + e.key);
        setCurrentIndex(prev => prev + 1);
        setError(false);
        
        // Update progress for player
        setRacers(prev => 
          prev.map(racer => 
            racer.isYou ? { 
              ...racer, 
              progress: Math.min(100, Math.round((currentIndex + 1) / racePrompt.length * 100)),
              accuracy: totalKeypresses > 0 
                ? Math.round(((totalKeypresses - errorCount) / totalKeypresses) * 100) 
                : 100 
            } : racer
          )
        );
        
        // Check if race completed
        if (currentIndex + 1 === racePrompt.length) {
          const finishedRacers = racers.filter(r => r.finishTime !== null).length;
          
          setCurrentPosition(finishedRacers + 1);
          setRaceFinished(true);
          
          // Set final stats for player
          setRacers(prev => 
            prev.map(racer => 
              racer.isYou ? { 
                ...racer, 
                progress: 100,
                position: finishedRacers + 1,
                finishTime: elapsedTime,
                accuracy: totalKeypresses > 0 
                  ? Math.round(((totalKeypresses - errorCount) / totalKeypresses) * 100) 
                  : 100
              } : racer
            )
          );
        }
      } else {
        // Wrong character - increment error count
        setError(true);
        setErrorCount(prev => prev + 1);
      }
    }
  };
  
  // Add event listener for key presses
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [raceStarted, raceFinished, typed, racePrompt, elapsedTime, totalKeypresses, errorCount]);
  
  // Handle back button
  const handleBack = () => {
    setLocation('/multiplayer');
  };
  
  // Handle restart button
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
            {/* Compact race header with race info and timer */}
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
            
            {/* Ultra-compact race track design */}
            <div className="bg-dark-800 p-3 rounded-lg pixel-border mb-3">
              <div className="space-y-0.5">
                {racers.map((racer, index) => (
                  <div key={racer.id} className="mb-0.5">
                    {/* Ultra-compact race track row */}
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
                        {/* Track design with finish line */}
                        <div className="absolute left-0 top-1/2 w-full border-b border-dashed border-gray-800 opacity-30"></div>
                        <div className="absolute right-[5%] top-0 bottom-0 border-r-2 border-dashed border-gray-300 opacity-50"></div>
                        
                        {/* Racer avatar using HTML sprites */}
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
                      
                      {/* Stats - compact display */}
                      <div className="flex items-center w-20 text-right space-x-1">
                        <div className="w-9 text-right">
                          <span className={`text-xs ${racer.isYou ? 'text-primary font-bold' : 'text-gray-400'}`}>
                            {racer.wpm > 0 ? Math.round(racer.wpm) : '0'}
                          </span>
                        </div>
                        
                        {/* Position indicator */}
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
            
            {/* Race UI - typing area */}
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
                      <span className="text-2xl font-minecraft text-primary">{typingStats.wpm}</span>
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
                          {currentIndex < racePrompt.length ? racePrompt.charAt(currentIndex) : ''}
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
                        <span className="text-primary font-bold">{typingStats.wpm || 0}</span>
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