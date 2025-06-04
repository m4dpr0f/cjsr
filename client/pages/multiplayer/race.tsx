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
  const [inputText, setInputText] = useState("");
  const [racePrompt, setRacePrompt] = useState("");
  const [currentWord, setCurrentWord] = useState(0);
  const [typingStats, setTypingStats] = useState({
    wpm: 0,
    accuracy: 0,
    errors: 0,
    correctChars: 0,
    totalChars: 0,
  });
  const [racers, setRacers] = useState<Racer[]>([]);
  const [currentPosition, setCurrentPosition] = useState<number | null>(null);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const promptWords = racePrompt.split(" ");
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
        // Initialize racers
        const initialRacers: Racer[] = [
          {
            id: profile ? profile.id : 999,
            username: profile ? profile.username : "Guest" + Math.floor(Math.random() * 1000),
            level: profile ? profile.level || 1 : 1,
            isYou: true,
            chickenType: profile ? profile.chicken_type || "white" : "white",
            jockeyType: profile ? profile.jockey_type || "steve" : "steve",
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
            chickenType: "black",
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
            chickenType: "white",
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
            chickenType: "brown",
            jockeyType: "steve",
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
  
  // Focus the input field when race starts
  useEffect(() => {
    if (raceStarted && inputRef.current) {
      inputRef.current.focus();
      
      // Start the race timer
      timerRef.current = window.setInterval(() => {
        if (timeStartRef.current) {
          const elapsed = Math.floor((Date.now() - timeStartRef.current) / 1000);
          setElapsedTime(elapsed);
          
          // Update WPM
          const minutes = elapsed / 60;
          if (minutes > 0) {
            const words = typingStats.correctChars / 5; // Approximate words
            const wpm = Math.round(words / minutes);
            setTypingStats(prev => ({ ...prev, wpm }));
            
            // Update player's stats
            setRacers(prev => 
              prev.map(racer => 
                racer.isYou ? { ...racer, wpm } : racer
              )
            );
          }
        }
      }, 1000);
      
      // Simulate other racers' progress
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
  }, [raceStarted, raceFinished, elapsedTime, typingStats.correctChars]);
  
  // Cleanup timer when race finishes
  useEffect(() => {
    if (raceFinished && timerRef.current) {
      clearInterval(timerRef.current);
    }
  }, [raceFinished]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!raceStarted || raceFinished) return;
    
    // Simply update the input text value
    const value = e.target.value;
    setInputText(value);
  };
  
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

      <main className="flex-1 container mx-auto px-4 py-8 max-w-6xl">
        {countdown !== null ? (
          <div className="flex flex-col items-center justify-center h-64">
            <h1 className="text-4xl font-minecraft text-primary mb-8">GET READY TO RACE!</h1>
            <div className="text-8xl font-minecraft text-yellow-400 animate-pulse">
              {countdown}
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Race information and timer */}
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-minecraft text-primary">MULTIPLAYER RACE</h1>
                <p className="text-secondary">Type faster than your opponents to win!</p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="bg-dark-800 p-3 rounded-lg flex items-center">
                  <Clock3 className="w-5 h-5 text-yellow-400 mr-2" />
                  <span className="text-xl font-minecraft text-yellow-400">{formatTime(elapsedTime)}</span>
                </div>
                {currentPosition && (
                  <div className="bg-dark-800 p-3 rounded-lg flex items-center">
                    <Flag className="w-5 h-5 text-primary mr-2" />
                    <span className="text-xl font-minecraft text-primary">
                      Position: {currentPosition}/{racers.length}
                    </span>
                  </div>
                )}
              </div>
            </div>
            
            {/* Race track */}
            <div className="bg-dark-800 p-6 rounded-lg pixel-border">
              <div className="space-y-4">
                {racers.map((racer, index) => (
                  <div key={racer.id} className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center">
                        <div className="mr-2">
                          <ChickenAvatar 
                            chickenType={racer.chickenType} 
                            jockeyType={racer.jockeyType}
                            size="sm"
                          />
                        </div>
                        <div>
                          <div className="flex items-center">
                            <span className="font-medium text-white">{racer.username}</span>
                            {racer.isYou && (
                              <Badge variant="outline" className="ml-2 text-xs bg-blue-900/20 text-blue-300 border-blue-700">
                                You
                              </Badge>
                            )}
                          </div>
                          <div className="text-xs text-gray-400">
                            Level {racer.level} • WPM: {racer.wpm} • Acc: {racer.accuracy}%
                          </div>
                        </div>
                      </div>
                      {racer.position && (
                        <div className="flex items-center">
                          {racer.position === 1 ? (
                            <Badge className="bg-yellow-900/40 text-yellow-300 border-yellow-600 flex items-center">
                              <Award className="w-3 h-3 mr-1" />
                              1st Place - {formatTime(racer.finishTime || 0)}
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-gray-300">
                              {racer.position}{
                                racer.position === 2 ? 'nd' : 
                                racer.position === 3 ? 'rd' : 'th'
                              } Place - {formatTime(racer.finishTime || 0)}
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                    
                    {/* Progress bar */}
                    <div className="relative h-6 bg-dark-900 rounded-lg overflow-hidden">
                      <Progress
                        value={racer.progress}
                        className={`h-full ${
                          racer.isYou ? 'bg-primary' : 
                          index % 3 === 0 ? 'bg-blue-500' : 
                          index % 3 === 1 ? 'bg-green-500' : 'bg-purple-500'
                        }`}
                      />
                      
                      {/* Chicken avatar on the progress bar */}
                      <div 
                        className="absolute top-0 h-full flex items-center transition-all duration-300"
                        style={{ left: `${Math.max(0, Math.min(92, racer.progress))}%` }}
                      >
                        <div className="w-6 h-6 transform -translate-y-1">
                          <ChickenAvatar 
                            chickenType={racer.chickenType} 
                            jockeyType={racer.jockeyType}
                            size="sm"
                          />
                        </div>
                      </div>
                      
                      {/* Finish line */}
                      <div className="absolute right-0 top-0 h-full w-1 bg-white/50 flex items-center justify-center">
                        <Flag className="w-4 h-4 text-white absolute -right-2" />
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
                  <div className="mb-6 bg-dark-900 p-4 rounded-lg">
                    <p className="text-lg leading-relaxed">
                      {promptWords.slice(Math.max(0, currentWord - 3), Math.min(promptWords.length, currentWord + 15)).map((word, idx) => {
                        const wordIndex = Math.max(0, currentWord - 3) + idx;
                        return (
                          <span key={wordIndex} className={`
                            ${wordIndex === currentWord ? 'bg-primary/20 text-primary px-1 py-0.5 rounded' : ''}
                            ${wordIndex < currentWord ? 'text-gray-500' : 'text-white'}
                            mr-1
                          `}>
                            {word}
                          </span>
                        );
                      })}
                    </p>
                  </div>
                  
                  <div className="flex space-x-4">
                    <input
                      ref={inputRef}
                      type="text"
                      className="flex-1 bg-dark-900 text-white p-3 rounded-lg border border-gray-700 focus:border-primary focus:outline-none"
                      placeholder={raceStarted ? "Type here..." : "Waiting for race to start..."}
                      value={inputText}
                      onChange={handleInputChange}
                      onKeyDown={(e) => {
                        // If space is pressed and input is not empty
                        if (e.key === ' ' && inputText.trim() !== '') {
                          e.preventDefault(); // Prevent default space behavior
                          
                          // Process the current word
                          const typedWord = inputText.trim();
                          const targetWord = promptWords[currentWord];
                          
                          // Calculate accuracy for this word
                          const isCorrect = typedWord === targetWord;
                          
                          // Update stats
                          setTypingStats(prev => ({
                            ...prev,
                            correctChars: isCorrect ? prev.correctChars + targetWord.length : prev.correctChars,
                            totalChars: prev.totalChars + targetWord.length,
                            errors: isCorrect ? prev.errors : prev.errors + 1,
                            accuracy: Math.round(((isCorrect ? prev.correctChars + targetWord.length : prev.correctChars) / (prev.totalChars + targetWord.length)) * 100)
                          }));
                          
                          // Move to next word
                          const nextWordIndex = currentWord + 1;
                          setCurrentWord(nextWordIndex);
                          setInputText("");
                          
                          // Update progress
                          const progressPercentage = Math.min(100, (nextWordIndex / promptWords.length) * 100);
                          
                          setRacers(prev => 
                            prev.map(racer => {
                              if (racer.isYou) {
                                // If race is completed
                                if (nextWordIndex >= promptWords.length) {
                                  const finishedRacers = prev.filter(r => r.finishTime !== null).length;
                                  const position = finishedRacers + 1;
                                  setCurrentPosition(position);
                                  setRaceFinished(true);
                                  
                                  return { 
                                    ...racer, 
                                    progress: 100, 
                                    position, 
                                    accuracy: typingStats.accuracy,
                                    finishTime: elapsedTime 
                                  };
                                }
                                
                                return { 
                                  ...racer, 
                                  progress: progressPercentage, 
                                  accuracy: typingStats.accuracy 
                                };
                              }
                              return racer;
                            })
                          );
                        }
                      }}
                      disabled={!raceStarted || raceFinished}
                    />
                    
                    <div className="flex space-x-2">
                      <div className="bg-dark-900 p-3 rounded-lg flex items-center min-w-[100px]">
                        <span className="text-gray-400 mr-2">WPM:</span>
                        <span className="text-primary font-bold">{typingStats.wpm}</span>
                      </div>
                      <div className="bg-dark-900 p-3 rounded-lg flex items-center min-w-[100px]">
                        <span className="text-gray-400 mr-2">Acc:</span>
                        <span className="text-primary font-bold">{typingStats.accuracy}%</span>
                      </div>
                    </div>
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
                      <p className="text-2xl font-minecraft text-blue-400">{typingStats.accuracy}%</p>
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
            
            {/* Race stats */}
            {!raceFinished && (
              <div className="flex justify-between">
                <Button variant="ghost" onClick={handleBackToLobby} className="text-gray-400">
                  <XCircle className="w-4 h-4 mr-2" />
                  Leave Race
                </Button>
              </div>
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}