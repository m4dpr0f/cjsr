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
// Import simplified race engine utilities
import {
  calculateRaceWPM,
  getElapsedTime,
  calculateRaceProgress,
  moveNPC,
  getNpcWPM
} from "@/lib/race-engine";

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
  const [, setLocation] = useLocation();
  const [countdown, setCountdown] = useState<number | null>(3);
  const [raceStarted, setRaceStarted] = useState(false);
  const [raceFinished, setRaceFinished] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [typed, setTyped] = useState("");
  const [racePrompt, setRacePrompt] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [error, setError] = useState(false);
  const [errorCount, setErrorCount] = useState(0);
  const [totalKeypresses, setTotalKeypresses] = useState(0);
  const [typingStats, setTypingStats] = useState({
    wpm: 30, // Start with a default WPM value that looks reasonable
    accuracy: 0,
  });
  const [racers, setRacers] = useState<Racer[]>([]);
  const [currentPosition, setCurrentPosition] = useState<number | null>(null);
  
  const inputRef = useRef<HTMLDivElement>(null);
  const textAreaRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<number | null>(null);
  const timeStartRef = useRef<number | null>(null);

  // Initialize the race
  useEffect(() => {
    document.title = "Multiplayer Race - Chicken Jockey Scribe Racer";
    
    // Fetch race prompt
    const samplePrompts = [
      "The quick brown fox jumps over the lazy dog. While the five boxing wizards jump quickly, a quaint village tavern hosts jovial miners.",
      "As the sun sets over the mountain range, a flock of birds takes flight across the amber sky, creating a mesmerizing pattern.",
      "Programming is the art of telling a computer what to do. Good programmers write code that humans can understand.",
      "The ancient scrolls revealed the secret path through the enchanted forest, where magical creatures guarded the crystal fountain.",
      "In the garden of digital delights, programmers plant seeds of innovation that blossom into technological wonders.",
    ];
    
    setRacePrompt(samplePrompts[Math.floor(Math.random() * samplePrompts.length)]);
    
    // Get the current user's profile
    apiRequest("GET", "/api/profile")
      .then(response => {
        if (response.ok) {
          return response.json();
        }
        return null;
      })
      .then(profile => {
        // Initialize racers - 8 racers total including the player with unique HTML sprites
        const initialRacers: Racer[] = [
          {
            id: profile ? profile.id : 999,
            username: profile ? profile.username : "Guest" + Math.floor(Math.random() * 1000),
            level: profile ? profile.level || 1 : 1,
            isYou: true,
            chickenType: profile?.chicken_type || "html_steve", // Use HTML sprite for player
            jockeyType: profile?.jockey_type || "steve",
            progress: 0,
            position: null,
            wpm: 0,
            accuracy: 0,
            finishTime: null
          },
          {
            id: 101,
            username: "SpeedTyper",
            level: 15,
            isYou: false,
            chickenType: "html_auto", // Using HTML sprite
            jockeyType: "auto", 
            progress: 0,
            position: null,
            wpm: 0,
            accuracy: 0,
            finishTime: null
          },
          {
            id: 102,
            username: "TypeRacer2000",
            level: 8,
            isYou: false,
            chickenType: "html_matikah", // Using HTML sprite
            jockeyType: "matikah",
            progress: 0,
            position: null,
            wpm: 0,
            accuracy: 0,
            finishTime: null
          },
          {
            id: 103,
            username: "QwertySmashеr",
            level: 12,
            isYou: false,
            chickenType: "html_iam", // Using HTML sprite
            jockeyType: "iam",
            progress: 0,
            position: null,
            wpm: 0,
            accuracy: 0,
            finishTime: null
          },
          {
            id: 104,
            username: "CodeNinja",
            level: 20,
            isYou: false,
            chickenType: "html_undeadCJ01", // Using HTML sprite
            jockeyType: "undeadCJ01",
            progress: 0,
            position: null,
            wpm: 0,
            accuracy: 0,
            finishTime: null
          },
          {
            id: 105,
            username: "FastFingers",
            level: 18,
            isYou: false,
            chickenType: "html_indusKnightCJ01", // Using HTML sprite
            jockeyType: "indusKnightCJ01",
            progress: 0,
            position: null,
            wpm: 0,
            accuracy: 0,
            finishTime: null
          },
          {
            id: 106,
            username: "KeyboardKing",
            level: 25,
            isYou: false,
            chickenType: "html_fireGaru", // Using HTML sprite
            jockeyType: "fireGaru",
            progress: 0,
            position: null,
            wpm: 0,
            accuracy: 0,
            finishTime: null
          },
          {
            id: 107,
            username: "WordWizard",
            level: 10,
            isYou: false,
            chickenType: "html_death", // Using HTML sprite
            jockeyType: "death",
            progress: 0,
            position: null,
            wpm: 0,
            accuracy: 0,
            finishTime: null
          }
        ];
        
        setRacers(initialRacers);
      });
    
    // Countdown timer before race starts
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
  
  // Dedicated useEffect for NPC initialization - runs exactly once when race starts
  useEffect(() => {
    if (raceStarted) {
      // Initialize NPCs with a small head start right when race begins
      setRacers(prevRacers => {
        return prevRacers.map(racer => {
          if (!racer.isYou) {
            // Simple initialization - small random progress and default WPM
            const initialProgress = Math.random() * 3; // 0-3% head start
            const initialWpm = 30 + Math.floor(Math.random() * 20); // 30-50 WPM
            
            return { 
              ...racer, 
              progress: initialProgress,
              wpm: initialWpm
            };
          }
          return racer;
        });
      });
    }
  }, [raceStarted]); // Only depend on raceStarted to ensure this runs exactly once
  
  // Focus the input area when race starts
  useEffect(() => {
    if (raceStarted && inputRef.current) {
      inputRef.current.focus();
      
      // Start the race timer with high-precision timing
      timerRef.current = window.setInterval(() => {
        if (timeStartRef.current) {
          // Use high-precision timing from race engine
          const preciseElapsed = getElapsedTime(timeStartRef.current);
          setElapsedTime(Math.floor(preciseElapsed));
          
          // Calculate WPM only if user has typed something
          if (currentIndex > 0) {
            // Calculate WPM using the race engine utility
            const calculatedWpm = calculateRaceWPM(currentIndex, preciseElapsed);
            
            // Update local typing stats
            setTypingStats(prev => ({ 
              ...prev, 
              wpm: calculatedWpm,
              progress: calculateRaceProgress(currentIndex, racePrompt.length)
            }));
            
            // Update player's progress and WPM in the racers list
            setRacers(prev => 
              prev.map(racer => 
                racer.isYou ? { 
                  ...racer, 
                  wpm: calculatedWpm,
                  // Use race engine progress calculation
                  progress: calculateRaceProgress(currentIndex, racePrompt.length)
                } : racer
              )
            );
          }
        }
      }, 200); // Update more frequently for smoother display
      
      // NPC progress simulation with more frequent updates (200ms intervals)
      const racerSimulation = setInterval(() => {
        if (!raceFinished) {
          setRacers(prevRacers => {
            const updatedRacers = prevRacers.map(racer => {
              if (!racer.isYou && racer.progress < 100 && racer.position === null) {
                // Use simplified race engine to move NPC
                const newProgress = moveNPC(racer.id, racer.progress);
                
                // Get WPM for this NPC
                const newWpm = getNpcWPM(racer.id, newProgress);
                
                // Check if racer finished
                if (newProgress >= 99 && racer.finishTime === null) {
                  const finishedRacers = prevRacers.filter(r => r.finishTime !== null).length;
                  return {
                    ...racer,
                    progress: 100,
                    position: finishedRacers + 1,
                    finishTime: elapsedTime,
                    wpm: newWpm,
                    accuracy: 85 + Math.floor(Math.random() * 15)
                  };
                }
                
                return { 
                  ...racer, 
                  progress: newProgress, 
                  wpm: newWpm
                };
              }
              return racer;
            });
            
            // Update positions
            const nonFinishedRacers = updatedRacers.filter(r => r.position === null);
            const sortedByProgress = [...nonFinishedRacers].sort((a, b) => b.progress - a.progress);
            
            sortedByProgress.forEach((racer, idx) => {
              const position = updatedRacers.filter(r => r.position !== null).length + idx + 1;
              if (racer.isYou) {
                setCurrentPosition(position);
              }
            });
            
            // Check if all racers finished
            const allFinished = updatedRacers.every(racer => racer.progress === 100);
            if (allFinished) {
              clearInterval(racerSimulation);
              setRaceFinished(true);
            }
            
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

  // Keyboard input handler
  useEffect(() => {
    if (!raceStarted || raceFinished) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent browser quick find when typing apostrophe (') or slash (/)
      if (e.key === "'" || e.key === "/" || e.key === "Tab" || e.key === "Enter") {
        e.preventDefault();
        
        // If it's apostrophe or slash, we still want to process the character for typing
        if (e.key === "'" || e.key === "/") {
          // Continue with normal character processing
        } else {
          return; // For Tab and Enter, just prevent default and return
        }
      }

      if (e.key === "Backspace") {
        if (typed.length > 0) {
          // Remove the last character from typed text
          setTyped(prev => prev.slice(0, -1));
          
          // Only update the current index if we're removing the last correctly typed character
          // This forces the user to backspace each error individually
          if (currentIndex > 0 && typed.length - 1 <= currentIndex) {
            setCurrentIndex(prev => prev - 1);
          }
          
          // Check if we're still in error state after backspacing
          setError(typed.length - 1 > currentIndex);
          
          // Calculate progress based on how many correct characters are typed
          const correctProgress = Math.max(0, currentIndex / racePrompt.length * 100);
          
          // Update player progress
          setRacers(prev => 
            prev.map(racer => 
              racer.isYou ? { ...racer, progress: correctProgress } : racer
            )
          );
        }
        return;
      }

      if (e.key.length === 1) {
        // Always add the character to typed text
        const newTyped = typed + e.key;
        setTyped(newTyped);
        
        // Increment total keypress count for accuracy tracking
        setTotalKeypresses(prev => prev + 1);
        
        const expectedChar = racePrompt[currentIndex];
        const isCorrect = e.key === expectedChar;

        if (isCorrect) {
          // Character is correct
          setError(false);
          
          // Increment current index since we've correctly typed this character
          const newIndex = currentIndex + 1;
          setCurrentIndex(newIndex);
          
          // Calculate progress based on correct characters
          const progress = Math.min(100, newIndex / racePrompt.length * 100);
          
          // Update player progress
          setRacers(prev => 
            prev.map(racer => {
              if (racer.isYou) {
                // Calculate accuracy
                const accuracy = totalKeypresses > 0 
                  ? Math.round(((totalKeypresses - errorCount) / totalKeypresses) * 100) 
                  : 100;
                
                // Check if race is completed
                if (newIndex >= racePrompt.length) {
                  const finishedRacers = prev.filter(r => r.finishTime !== null).length;
                  const position = finishedRacers + 1;
                  setCurrentPosition(position);
                  setRaceFinished(true);
                  
                  return { 
                    ...racer, 
                    progress: 100, 
                    position, 
                    accuracy,
                    finishTime: elapsedTime 
                  };
                }
                
                return { 
                  ...racer, 
                  progress, 
                  accuracy
                };
              }
              return racer;
            })
          );
        } else {
          // Character is incorrect
          setError(true);
          setErrorCount(prev => prev + 1);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [raceStarted, raceFinished, typed, racePrompt, elapsedTime, totalKeypresses, errorCount]);
  
  const handleBackToLobby = () => {
    setLocation("/multiplayer-lobby");
  };
  
  const handleBackToHome = () => {
    setLocation("/");
  };
  
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };
  
  return (
    <div className="min-h-screen bg-dark text-white flex flex-col">
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
                      <div className="flex items-center w-36 pr-1">
                        <div className="w-7 h-7 mr-1 flex-shrink-0">
                          <ChickenAvatar 
                            chickenType={racer.chickenType} 
                            jockeyType={racer.jockeyType}
                            size="sm"
                          />
                        </div>
                        <div className="truncate">
                          <span className="text-xs text-white">
                            {racer.username}
                            {racer.isYou && <span className="text-blue-400 ml-1">(You)</span>}
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
            
            {/* Typing area */}
            <div className="bg-dark-800 p-6 rounded-lg pixel-border">
              {!raceFinished ? (
                <>
                  {/* Prompt display area with highlighted text */}
                  <div 
                    ref={textAreaRef}
                    className="bg-dark-900 p-4 rounded-lg mb-6 text-lg leading-relaxed h-32 overflow-y-auto"
                    style={{ fontFamily: "'Courier New', monospace" }}
                  >
                    {/* Correctly typed text */}
                    <span className="bg-green-500/30 text-green-400">
                      {racePrompt.substring(0, currentIndex)}
                    </span>
                    
                    {/* Current character (or error) */}
                    {error && typed.length > currentIndex ? (
                      <span className="bg-red-500/50 text-red-300">
                        {typed.substring(currentIndex, typed.length)}
                      </span>
                    ) : (
                      <span className="bg-primary/30 text-primary">
                        {currentIndex < racePrompt.length ? racePrompt.charAt(currentIndex) : ''}
                      </span>
                    )}
                    
                    {/* Remaining text */}
                    <span className="text-white">
                      {racePrompt.substring(Math.min(currentIndex + 1, racePrompt.length))}
                    </span>
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
                    
                    <Button 
                      variant="ghost" 
                      className="text-gray-400"
                      onClick={handleBackToLobby}
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Leave Race
                    </Button>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <h2 className="text-3xl font-minecraft text-primary mb-6">RACE COMPLETE!</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-dark-900 p-4 rounded-lg">
                      <p className="text-gray-400 mb-1">TIME</p>
                      <p className="text-2xl font-minecraft text-yellow-400">{formatTime(elapsedTime)}</p>
                    </div>
                    <div className="bg-dark-900 p-4 rounded-lg">
                      <p className="text-gray-400 mb-1">WPM</p>
                      <p className="text-2xl font-minecraft text-green-400">{typingStats.wpm}</p>
                    </div>
                    <div className="bg-dark-900 p-4 rounded-lg">
                      <p className="text-gray-400 mb-1">ACCURACY</p>
                      <p className="text-2xl font-minecraft text-blue-400">
                        {totalKeypresses > 0 
                          ? Math.round(((totalKeypresses - errorCount) / totalKeypresses) * 100) 
                          : 100}%
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex space-x-4 justify-center">
                    <PixelButton onClick={handleBackToLobby}>
                      BACK TO LOBBY
                    </PixelButton>
                    <PixelButton variant="outline" onClick={handleBackToHome}>
                      BACK TO HOME
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