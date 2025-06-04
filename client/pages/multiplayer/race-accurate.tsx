import { useEffect, useState, useRef } from "react";
import { useLocation } from "wouter";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { PixelButton } from "@/components/ui/pixel-button";
import { ChickenAvatar } from "@/components/ui/chicken-avatar";
import { apiRequest } from "@/lib/queryClient";
import { useQuery } from "@tanstack/react-query";
import { Flag, Clock3 } from "lucide-react";
import { cn } from "@/lib/utils";
import { calculateWpm, getElapsedTime } from "@/lib/wpm-simple";
import { getCustomMultiplayerPrompt } from "@/lib/custom-multiplayer-prompts";
import { getRandomMultiplayerPrompt } from "@/lib/multiplayer-prompts";
import { simpleAudio } from "@/lib/simple-audio";

// Simple faction-based WPM assignment for NPCs
function randBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function assignNpcWpm(faction: string): number {
  switch (faction) {
    case 'd4': // Fire
      return randBetween(75, 90);
    case 'd20': // Water  
      return randBetween(65, 80);
    case 'd8': // Air
      return randBetween(70, 85);
    case 'd6': // Earth
      return randBetween(55, 70);
    case 'd12': // Ether
      return randBetween(85, 100);
    case 'd10': // Chaos
      return randBetween(40, 110); // wider range
    case 'd2': // Coin
      return randBetween(60, 85);
    case 'd100': // Order
      return 88; // Always fixed
    default:
      return randBetween(55, 75); // Default fallback
  }
}

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
  faction: string; // d1-d8 elemental factions
  factionColor: string; // hex color for faction
  xpEarned: number; // XP earned this race
  xpGained?: number; // XP gained from this race
}

// Elemental faction system based on D-sided dice and eggs
const ELEMENTAL_FACTIONS = {
  d2: { name: "Coin", color: "#C0C0C0", element: "Coin", egg: "silver egg" }, // Default faction
  d4: { name: "Fire", color: "#FF4444", element: "Fire", egg: "flameheart egg" },
  d6: { name: "Earth", color: "#22C55E", element: "Earth", egg: "terraverde egg" },
  d8: { name: "Air", color: "#FFFFFF", element: "Air", egg: "skywisp egg" },
  d10: { name: "Chaos", color: "#4F46E5", element: "Chaos", egg: "voidmyst egg" },
  d12: { name: "Ether", color: "#000000", element: "Ether", egg: "ethereal egg" },
  d20: { name: "Water", color: "#3B82F6", element: "Water", egg: "aquafrost egg" },
  d100: { name: "Order", color: "#FFD700", element: "Order", egg: "goldstone egg" }
};

export default function MultiplayerRaceAccurate() {
  // Navigation
  const [_, setLocation] = useLocation();
  
  // Get user profile to access current faction
  const { data: profile } = useQuery({
    queryKey: ['/api/profile'],
    retry: false,
  });
  
  // Race state
  const [countdownSeconds, setCountdownSeconds] = useState<number>(3);
  const [raceStarted, setRaceStarted] = useState<boolean>(false);
  const [raceFinished, setRaceFinished] = useState<boolean>(false);
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [currentWpm, setCurrentWpm] = useState<number>(0);
  const [errorCount, setErrorCount] = useState<number>(0);
  const [totalKeypresses, setTotalKeypresses] = useState<number>(0);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [typed, setTyped] = useState<string>("");
  const [error, setError] = useState<boolean>(false);
  const [racePrompt, setRacePrompt] = useState<{text: string, difficulty: string}>({
    text: getRandomMultiplayerPrompt(3), // Use 3 combined prompts for longer races
    difficulty: "medium"
  });
  
  // Refs to track time
  const timeStartRef = useRef<number | null>(null);
  const typingStartTimeRef = useRef<number | null>(null);
  const timerRef = useRef<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Racers state
  const [racers, setRacers] = useState<Racer[]>([]);
  const [isWaitingForPlayers, setIsWaitingForPlayers] = useState<boolean>(false);
  const [lobbyRoom, setLobbyRoom] = useState<number>(1);
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [connectedPlayers, setConnectedPlayers] = useState<number>(0);
  
  // Setup initial race data when component mounts
  useEffect(() => {
    // Set the timer for when the race starts
    timeStartRef.current = null;
    typingStartTimeRef.current = null;
    
    // Reset all race states
    setRaceStarted(false);
    setRaceFinished(false);
    setCountdownSeconds(3);
    setCurrentWpm(0);
    
    // Set the race prompt using custom prompts from CSV
    setRacePrompt(getCustomMultiplayerPrompt());
    
    // Focus the input when ready
    if (inputRef.current) {
      inputRef.current.focus();
    }
    
    // Use actual profile data instead of localStorage
    const playerName = profile?.username || 'You';
    const playerChicken = profile?.chicken_type || 'html_steve';
    const playerJockey = profile?.jockey_type || 'steve';
    
    // Get selected faction from profile
    const selectedFaction = profile?.faction || 'd2';
    
    // Check race mode from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const raceMode = urlParams.get('mode') || 'quickrace';
    
    // For Player Only mode, don't add NPCs - wait for real players
    if (raceMode === 'playeronly' || raceMode === 'multiplayer-only') {
      const playerRacer: Racer = {
        id: 1,
        username: playerName,
        level: 1,
        isYou: true,
        chickenType: playerChicken,
        jockeyType: playerJockey,
        progress: 0,
        position: null,
        wpm: 0,
        accuracy: 100,
        finishTime: null,
        faction: selectedFaction,
        factionColor: ELEMENTAL_FACTIONS[selectedFaction as keyof typeof ELEMENTAL_FACTIONS]?.color || '#666666',
        xpEarned: 0
      };
      
      setRacers([playerRacer]);
      setCountdownSeconds(-1); // No countdown, wait for more players
      setIsWaitingForPlayers(true);
      
      // Connect to WebSocket for real multiplayer
      connectToMultiplayerLobby(playerRacer);
      
      return; // Don't add NPCs for player-only mode
    }
    
    // For Quick Race mode, create 8 racers with different elemental factions and unique sprites
    const factionKeys = Object.keys(ELEMENTAL_FACTIONS);
    const npcNames = ["FireWing", "CoinMaster", "EarthShaker", "WindRider", "VoidLord", "EtherSage", "WaveBreaker", "GoldHeart"];
    
    // Use vibrant new NPC sprites - no campaign characters allowed
    const availableNPCSprites = [
      { chicken: "html_crystalWing", jockey: "generic" },
      { chicken: "html_thunderBeak", jockey: "generic" },
      { chicken: "html_shadowFeather", jockey: "generic" },
      { chicken: "html_prismTail", jockey: "generic" },
      { chicken: "html_voidRunner", jockey: "generic" },
      { chicken: "html_solarFlare", jockey: "generic" },
      { chicken: "html_frostWing", jockey: "generic" },
      { chicken: "html_neonRush", jockey: "generic" }
    ];
    
    const newRacers: Racer[] = factionKeys.map((faction, index) => {
      const factionData = ELEMENTAL_FACTIONS[faction as keyof typeof ELEMENTAL_FACTIONS];
      const isPlayer = faction === selectedFaction;
      const spriteCombo = availableNPCSprites[index];
      
      // Generate consistent WPM for each NPC at race start
      const npcWpm = isPlayer ? 0 : assignNpcWpm(faction);
      
      return {
        id: 101 + index,
        username: isPlayer ? playerName : npcNames[index],
        level: isPlayer ? 1 : Math.floor(Math.random() * 5) + 1,
        isYou: isPlayer,
        chickenType: isPlayer ? playerChicken : spriteCombo.chicken,
        jockeyType: isPlayer ? playerJockey : spriteCombo.jockey,
        progress: 0,
        position: null,
        wpm: npcWpm, // Set consistent WPM for NPCs
        accuracy: 100,
        finishTime: null,
        faction: faction,
        factionColor: factionData.color,
        xpEarned: 0
      };
    });
    
    setRacers(newRacers);
  }, []);
  
  // Format time display
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Start the countdown when the component mounts
  useEffect(() => {
    // Start the countdown
    const countdownInterval = setInterval(() => {
      setCountdownSeconds(prev => {
        // Play countdown beeps
        if (prev > 1) {
          simpleAudio.playRaceCountdown();
        } else if (prev === 1) {
          simpleAudio.playRaceCountdown();
        }
        
        // When countdown reaches 0, start the race
        if (prev <= 1) {
          clearInterval(countdownInterval);
          setRaceStarted(true);
          timeStartRef.current = Date.now();
          // Start multiplayer race music based on prompt content
          simpleAudio.playMultiplayerTheme(racePrompt.text);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    // Clean up the interval
    return () => {
      clearInterval(countdownInterval);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // WebSocket connection for real multiplayer
  const connectToMultiplayerLobby = (playerRacer: Racer) => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    const ws = new WebSocket(wsUrl);
    
    ws.onopen = () => {
      console.log("🔗 Connected to multiplayer lobby!");
      setSocket(ws);
      
      // Join the multiplayer-only lobby
      ws.send(JSON.stringify({
        type: 'join_lobby',
        mode: 'multiplayer-only',
        player: playerRacer
      }));
    };
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      switch (data.type) {
        case 'lobby_update':
          // Update the racers list with all connected players
          setRacers(data.players);
          setConnectedPlayers(data.players.length);
          
          // Start countdown when we have 2+ players
          if (data.players.length >= 2 && countdownSeconds === -1) {
            setCountdownSeconds(5);
            console.log(`🏁 Starting race with ${data.players.length} players!`);
          }
          break;
          
        case 'race_start':
          setRaceStarted(true);
          setIsWaitingForPlayers(false);
          setCountdownSeconds(0);
          break;
          
        case 'player_progress':
          // Update other players' progress in real-time
          setRacers(prev => prev.map(racer => 
            racer.id === data.playerId 
              ? { ...racer, progress: data.progress, wpm: data.wpm }
              : racer
          ));
          break;
      }
    };
    
    ws.onclose = () => {
      console.log("🔌 Disconnected from multiplayer lobby");
      setSocket(null);
    };
  };
  
  // Main race loop - runs when race starts
  useEffect(() => {
    if (raceStarted && inputRef.current) {
      // Focus input only once when race starts
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 100);
      
      // Start the race timer (reduced frequency for performance)
      timerRef.current = window.setInterval(() => {
        if (timeStartRef.current) {
          const now = Date.now();
          const elapsed = Math.floor((now - timeStartRef.current) / 1000);
          setElapsedTime(elapsed);
          
          // Update player position and progress based on correctly typed characters
          const progress = Math.min(100, Math.round((typed.length / racePrompt.text.length) * 100));
          
          // Calculate WPM only if the player has started typing
          let wpm = 0;
          if (typingStartTimeRef.current && currentIndex > 0) {
            const typingElapsedMs = now - typingStartTimeRef.current;
            if (typingElapsedMs > 0) {
              wpm = calculateWpm(currentIndex, typingElapsedMs);
              setCurrentWpm(wpm);
            }
          }
          
          // Update player progress and WPM in the race (single update)
          setRacers(prev => prev.map(racer => 
            racer.isYou ? {
              ...racer,
              progress: progress / 100,
              wpm: wpm
            } : racer
          ));
        }
      }, 500);
      
      // NPC movement - based on dice-rolled WPM and actual text length
      const npcInterval = setInterval(() => {
        if (!raceFinished) {
          setRacers(prev => {
            const updatedRacers = prev.map(racer => {
              if (racer.isYou) return racer; // Skip the player
              
              // If NPC already finished, don't update
              if (racer.finishTime !== null) return racer;
              
              // Precise NPC movement: exactly match their WPM to text progress
              const targetWPM = racer.wpm || 50;
              const elapsedMs = Date.now() - (timeStartRef.current || Date.now());
              const elapsedSeconds = elapsedMs / 1000;
              
              // Convert WPM to characters typed (assuming 5 chars per word)
              const charactersPerSecond = (targetWPM * 5) / 60;
              const totalCharactersTyped = charactersPerSecond * elapsedSeconds;
              const newProgress = Math.min(100, (totalCharactersTyped / racePrompt.text.length) * 100);
              
              // If NPC reached 100%, mark as finished with proper position
              if (newProgress >= 100 && racer.finishTime === null) {
                // Calculate position based on who has already finished
                const finishedRacers = prev.filter(r => r.finishTime !== null);
                const position = finishedRacers.length + 1;
                
                const updatedRacer = {
                  ...racer,
                  progress: 100,
                  finishTime: elapsedTime,
                  position: position,
                  wpm: racer.wpm // Keep the WPM assigned at race start
                };
                
                // Skip NPC stats tracking to avoid database errors
                console.log(`NPC ${racer.username} finished in position ${position}`);
                
                // Check if all racers have finished
                setTimeout(() => {
                  setRacers(currentRacers => {
                    const allFinished = currentRacers.every(r => r.finishTime !== null || r.progress >= 100);
                    if (allFinished && !raceFinished) {
                      setRaceFinished(true);
                    }
                    return currentRacers;
                  });
                }, 100);
                
                return updatedRacer;
              }
              
              // Keep WPM display consistent - show the racer's true assigned racing speed
              const displayWpm = racer.wpm || targetWPM;
              
              // Return updated racer
              return {
                ...racer,
                progress: newProgress,
                wpm: displayWpm
              };
            });
            
            // Fix NPC positions - assign sequential finishing positions
            const finishedRacers = updatedRacers.filter(r => r.finishTime !== null);
            finishedRacers.sort((a, b) => a.finishTime! - b.finishTime!);
            
            // Assign correct positions to finished racers
            const finalRacers = updatedRacers.map(racer => {
              if (racer.finishTime !== null) {
                const correctPosition = finishedRacers.findIndex(r => r.id === racer.id) + 1;
                return { ...racer, position: correctPosition };
              }
              return racer;
            });
            
            return finalRacers;
          });
        }
      }, 50); // Much faster updates for precise NPC movement
      
      // Clean up intervals
      return () => {
        if (timerRef.current) clearInterval(timerRef.current);
        clearInterval(npcInterval);
      };
    }
  }, [raceStarted, raceFinished, currentIndex, racePrompt.text.length]);
  
  // Handle typing
  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Only process keys for active race
    if (raceStarted && !raceFinished) {
      // Record typing start time on first keypress
      if (typingStartTimeRef.current === null) {
        typingStartTimeRef.current = Date.now();
      }
      
      // Handle special keys
      if (e.key === 'Backspace') {
        if (typed.length > 0) {
          setTyped(prev => prev.slice(0, -1));
          setError(false);
        }
        e.preventDefault();
        return;
      }
      
      // Allow typing through errors - no backspace requirement
      
      // Count keypresses for accuracy
      if (e.key.length === 1) {
        setTotalKeypresses(prev => prev + 1);
        
        // Check if the typed character matches the expected one at the current position
        const expectedChar = racePrompt.text[typed.length]; // Use typed.length instead of currentIndex
        
        if (e.key === expectedChar) {
          // Correct character
          const newTyped = typed + e.key;
          setTyped(newTyped);
          setError(false);
          
          // Update currentIndex to match the correct position
          setCurrentIndex(newTyped.length);
          
          // Update player progress in real-time based on characters typed
          const progressPercentage = (newTyped.length / racePrompt.text.length) * 100;
          setRacers(prev => prev.map(racer => 
            racer.isYou ? { 
              ...racer, 
              progress: progressPercentage, 
              wpm: currentWpm 
            } : racer
          ));
          
          // Check if race is completed
          if (newTyped.length === racePrompt.text.length) {
            // Player completed the race!
            // Calculate final WPM and timing
            const playerFinishTime = Date.now();
            const totalRaceTime = playerFinishTime - (timeStartRef.current || playerFinishTime);
            const finalWpm = typingStartTimeRef.current ? 
              calculateWpm(newTyped.length, playerFinishTime - typingStartTimeRef.current) : 
              currentWpm;
            
            // Update current WPM to final calculated value
            setCurrentWpm(finalWpm);
            
            // Count how many NPCs have already finished (progress >= 100)
            const npcsAlreadyFinished = racers.filter(r => 
              !r.isYou && r.progress >= 100
            ).length;
            
            // Player's position is simply 1 + number of NPCs who finished before them
            const playerPosition = npcsAlreadyFinished + 1;
            
            console.log('Position calculation:', {
              currentWpm,
              npcsAlreadyFinished,
              playerProgress: 100,
              finalPosition: playerPosition,
              racerStates: racers.map(r => ({ 
                name: r.name, 
                progress: r.progress, 
                isYou: r.isYou,
                finished: r.progress >= 100 
              }))
            });
            
            // End the race immediately when player finishes
            setRaceFinished(true);
            
            // Play victory or defeat music based on position
            setTimeout(() => {
              const isWinner = playerPosition <= 3; // Top 3 get victory music
              simpleAudio.playRaceResult(isWinner, playerPosition);
            }, 1000); // Small delay to let race finish visually
            
            // Use consistent elapsed time from race timer for final stats
            const finishTime = Math.max(1, elapsedTime); // Use the race timer's elapsed time
            const accuracy = Math.max(0, Math.min(100, 100 - (errorCount / Math.max(1, totalKeypresses)) * 100));
            
            // Stop all timers to end the race
            if (timerRef.current) {
              clearInterval(timerRef.current);
              timerRef.current = null;
            }
            
            // Calculate XP based on characters typed with position multipliers
            const charactersTyped = Math.max(1, newTyped.length || racePrompt.text.length || 1);
            const baseXP = charactersTyped; // 1 XP per character typed
            
            // Position-based multipliers
            const positionMultipliers = {
              1: 1.0,    // 1st place gets full value
              2: 0.5,    // 2nd gets half value  
              3: 0.33,   // 3rd gets one third
              4: 0.25,   // 4th-8th get 25%
              5: 0.25,
              6: 0.25,
              7: 0.25,
              8: 0.25
            };
            
            const safePosition = Math.max(1, Math.min(8, playerPosition || 8));
            const multiplier = positionMultipliers[safePosition as keyof typeof positionMultipliers] || 0.25;
            const calculatedXP = baseXP * multiplier;
            const totalXP = Math.max(1, Math.floor(Number.isFinite(calculatedXP) ? calculatedXP : charactersTyped * 0.25));
            
            console.log('XP Calculation Debug:', {
              charactersTyped,
              baseXP,
              playerPosition,
              safePosition,
              multiplier,
              calculatedXP,
              totalXP
            });
            
            // Update player in the racers list with final stats
            setRacers(prev => prev.map(racer => {
              if (racer.isYou) {
                return {
                  ...racer,
                  progress: 100,
                  finishTime,
                  position: playerPosition,
                  wpm: finalWpm, // Use the final calculated WPM
                  accuracy,
                  xpGained: totalXP
                };
              }
              return racer;
            }));
            
            // Play victory sound based on finishing position
            try {
              if (simpleAudio && typeof simpleAudio.playVictorySound === 'function') {
                simpleAudio.playVictorySound(playerPosition, currentWpm);
              }
            } catch (error) {
              console.warn('Audio playback failed:', error);
            }
            
            // Update player stats to profile with robust validation
            setTimeout(async () => {
              try {
                const validWpm = Number.isFinite(finalWpm) ? Math.round(finalWpm) : 0;
                const validAccuracy = Number.isFinite(accuracy) ? Math.round(accuracy) : 0;
                const validPosition = Number.isFinite(playerPosition) && playerPosition > 0 ? playerPosition : 8;
                const validXP = Number.isFinite(totalXP) && totalXP > 0 ? totalXP : 1;
                
                console.log('Sending XP update:', { wpm: validWpm, accuracy: validAccuracy, position: validPosition, xp: validXP });
                console.log('WPM Calculation Check:', { currentWpm, finalWpm, usedWpm: validWpm });
                
                await apiRequest('POST', '/api/stats/update-race', {
                  userId: null, // Let server use session userId for authenticated users
                  username: 'Player',
                  wpm: validWpm,
                  accuracy: validAccuracy,
                  position: validPosition,
                  totalPlayers: 8,
                  faction: profile?.current_faction || 'd4', // Use player's current faction
                  charactersTyped: charactersTyped,
                  xpGained: validXP, // Pass the calculated XP amount
                  isNPC: false
                });
                console.log('✅ Player stats updated successfully!');
              } catch (error) {
                console.error('Failed to update player stats:', error);
              }
            }, 1000);

            // Store race results for future use
            console.log('Race completed:', {
              position: playerPosition,
              wpm: currentWpm,
              accuracy,
              xpGained: totalXP
            });
          }
        } else {
          // Wrong character - don't add to typed, just set error state
          setError(true);
          setErrorCount(prev => prev + 1);
          // Keep currentIndex at typed.length to show error at correct position
          setCurrentIndex(typed.length);
          // Play error sound for mistakes
          simpleAudio.playErrorSound();
        }
      }
    }
  };
  
  // Add keyboard event listener
  useEffect(() => {
    const keyDownHandler = (e: KeyboardEvent) => {
      handleKeyDown(e as any);
    };
    
    window.addEventListener('keydown', keyDownHandler);
    return () => {
      window.removeEventListener('keydown', keyDownHandler);
    };
  }, [raceStarted, raceFinished, typed, currentIndex, elapsedTime, errorCount, totalKeypresses, racers]);
  
  // Handle navigation buttons
  const handleRestart = () => {
    // Preserve current race mode and reset game state
    const urlParams = new URLSearchParams(window.location.search);
    const currentMode = urlParams.get('mode') || 'quickrace';
    setLocation(`/multiplayer/race?mode=${currentMode}`);
  };
  
  const handleBackToLobby = () => {
    setLocation('/race');
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-dark-900 to-black text-white">
      <Header />
      
      <main className="flex-1 container mx-auto px-2 sm:px-4 pt-2 pb-6">
        <div className="flex justify-between items-center mb-2 sm:mb-4">
          <h1 className="text-xl sm:text-2xl font-minecraft text-primary">MULTIPLAYER RACE</h1>
          
          <div className="flex items-center space-x-2 sm:space-x-4">
            <div className="flex items-center text-gray-300">
              <Clock3 className="w-3 h-3 sm:w-4 sm:h-4 mr-1 text-primary" />
              <span className="text-sm sm:text-lg font-minecraft">{formatTime(elapsedTime)}</span>
            </div>
            
            <div className="bg-black px-2 sm:px-3 py-1 rounded-md border border-primary">
              <span className="text-primary font-bold text-sm sm:text-base">{Math.round(currentWpm)}</span>
              <span className="text-gray-400 ml-1 text-xs sm:text-sm">WPM</span>
            </div>
          </div>
        </div>
        
        {!raceStarted && countdownSeconds > 0 && (
          <div className="flex flex-col items-center justify-center h-24 sm:h-32 mb-2 sm:mb-4">
            <div className="text-4xl sm:text-6xl font-minecraft text-primary animate-pulse">
              {countdownSeconds}
            </div>
            <div className="text-sm sm:text-lg text-gray-400 mt-1 sm:mt-2">Race starts in...</div>
          </div>
        )}
        
        {isWaitingForPlayers && (
          <div className="flex flex-col items-center justify-center h-24 sm:h-32 mb-2 sm:mb-4">
            <div className="text-2xl sm:text-4xl font-minecraft text-yellow-500 animate-pulse mb-2">
              WAITING FOR PLAYERS
            </div>
            <div className="text-sm sm:text-lg text-gray-400">
              {connectedPlayers}/8 players connected • Need 2+ to start
            </div>
            <div className="flex items-center mt-2">
              <div className="animate-spin w-4 h-4 border-2 border-primary border-t-transparent rounded-full mr-2"></div>
              <span className="text-xs text-gray-500">Searching for opponents...</span>
            </div>
          </div>
        )}

        {!raceStarted && countdownSeconds === 0 && !isWaitingForPlayers && (
          <div className="flex flex-col items-center justify-center h-24 sm:h-32 mb-2 sm:mb-4">
            <div className="text-4xl sm:text-6xl font-minecraft text-green-500 animate-pulse">GO!</div>
          </div>
        )}
        
        {/* Race Tracks - Compact Mobile View */}
        <div className="mb-2 sm:mb-4">
          {racers.sort((a, b) => {
            // Sort by position first (if available)
            if (a.finishTime !== null && b.finishTime !== null) {
              return (a.finishTime === b.finishTime) 
                ? 0 
                : (a.finishTime < b.finishTime ? -1 : 1);
            }
            if (a.finishTime !== null) return -1;
            if (b.finishTime !== null) return 1;
            
            // Then by progress
            return b.progress - a.progress;
          }).map((racer, index) => {
            // Use stored position if available, otherwise calculate dynamically
            let position = racer.position || (index + 1);
            if (!racer.position) {
              if (racer.finishTime !== null) {
                position = racers.filter(r => 
                  r.finishTime !== null && 
                  r.finishTime <= racer.finishTime
                ).length;
              } else {
                position = racers.filter(r => r.progress > racer.progress).length + 1;
              }
            }
            
            return (
              <div 
                key={racer.id} 
                className={cn(
                  "mb-1 sm:mb-2 rounded-md", 
                  racer.isYou ? "bg-dark-800 border border-primary" : "bg-black"
                )}
              >
                {/* Compact Race Row */}
                <div className="flex items-center p-1 space-x-1 sm:space-x-2">
                  {/* Position */}
                  <div className="flex items-center justify-center w-4 h-4 rounded-full bg-dark-900 flex-shrink-0">
                    <span className="text-primary font-bold text-xs">{position}</span>
                  </div>
                  
                  {/* Avatar */}
                  <ChickenAvatar 
                    chickenType={racer.chickenType} 
                    jockeyType={racer.jockeyType} 
                    size="xs" 
                    animation={racer.finishTime !== null ? "idle" : "run"}
                    className="flex-shrink-0"
                  />
                  
                  {/* Faction Badge */}
                  <span 
                    className={`px-1 py-0.5 rounded text-xs font-bold flex-shrink-0 ${
                      racer.faction === 'd8' ? 'text-black' : 'text-white'
                    }`}
                    style={{ backgroundColor: racer.factionColor }}
                  >
                    {racer.faction.toUpperCase()}
                  </span>
                  
                  {/* Race Track - Takes up most space */}
                  <div className="relative flex-1 h-2 bg-dark-900 rounded-sm">
                    {/* Finish Line */}
                    <div className="absolute right-0 top-0 h-full w-0.5 bg-yellow-400 rounded-r-sm"></div>
                    
                    {/* Progress Bar */}
                    <div 
                      className={`h-full transition-all duration-200 ease-out rounded-sm ${
                        racer.faction === 'd12' || racer.faction === 'd8' ? 'border border-gray-400' : ''
                      }`}
                      style={{ 
                        width: `${racer.progress}%`,
                        backgroundColor: racer.factionColor,
                        boxSizing: 'border-box'
                      }}
                    ></div>
                    
                    {/* Racing Sprite at Front of Progress Bar */}
                    <div 
                      className="absolute top-0 h-full transform -translate-x-1/2 transition-all duration-200 z-10"
                      style={{ left: `${racer.progress}%` }}
                    >
                      <div className="transform scale-[3.3] -translate-y-2">
                        <ChickenAvatar 
                          chickenType={racer.chickenType} 
                          jockeyType={racer.jockeyType} 
                          size="xs" 
                          animation={racer.finishTime !== null ? "idle" : "run"}
                          className="flex-shrink-0"
                        />
                      </div>
                    </div>
                  </div>
                  
                  {/* WPM */}
                  <div className="text-xs text-gray-400 flex-shrink-0 w-8 text-right">
                    {Math.round(racer.wpm)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Typing Area - Prioritized for Mobile */}
        {raceStarted && !raceFinished && (
          <div className="mt-2 sm:mt-4 order-first">
            <div className={cn(
              "w-full p-2 sm:p-4 text-base sm:text-lg rounded-md mb-2 sm:mb-3 bg-dark-900 border-2", 
              error ? "border-red-500" : "border-primary"
            )}>
              <div className="relative text-gray-300 font-mono text-sm sm:text-base leading-relaxed">
                {(() => {
                  // Show focused window: 20 chars before current position + current + 40 chars after
                  const windowStart = Math.max(0, currentIndex - 20);
                  const windowEnd = Math.min(racePrompt.text.length, currentIndex + 40);
                  const visibleText = racePrompt.text.slice(windowStart, windowEnd);
                  
                  return (
                    <>
                      {windowStart > 0 && <span className="text-gray-500">...</span>}
                      {visibleText.split('').map((char, localIndex) => {
                        const globalIndex = windowStart + localIndex;
                        const typedChar = globalIndex < typed.length ? typed[globalIndex] : null;
                        const isCurrentPos = globalIndex === currentIndex;
                        const isTyped = globalIndex < typed.length;
                        const isCorrect = typedChar === char;
                        
                        return (
                          <span 
                            key={globalIndex} 
                            className={cn(
                              // Current position with error
                              isCurrentPos && error ? "bg-red-500 text-white animate-pulse" : 
                              // Current position no error
                              isCurrentPos ? "bg-primary text-black animate-pulse" : 
                              // Already typed correctly
                              isTyped && isCorrect ? "text-green-400" :
                              // Already typed incorrectly
                              isTyped && !isCorrect ? "text-red-400 underline" :
                              // Not yet typed
                              ""
                            )}
                          >
                            {char}
                          </span>
                        );
                      })}
                      {windowEnd < racePrompt.text.length && <span className="text-gray-500">...</span>}
                    </>
                  );
                })()}
              </div>
            </div>
            
            {/* Mobile-friendly input approach */}
            <div 
              className="w-full relative" 
              onClick={() => {
                if (inputRef.current && raceStarted) inputRef.current.focus();
              }}
            >
              <input
                ref={inputRef}
                type="text"
                className="w-full p-2 rounded-md bg-black border border-primary text-white mb-2 sm:opacity-0 sm:absolute sm:left-[-9999px]"
                value={typed}
                onChange={() => {}} // Controlled input
                autoComplete="off"
                autoCapitalize="off"
                autoCorrect="off"
                spellCheck="false"
                inputMode="text"
                placeholder="Tap here to start typing on mobile"
              />
            </div>
            
            <div className="text-center mt-1 sm:mt-2 text-xs sm:text-sm text-gray-400">
              {error 
                ? "Error! Press backspace to continue" 
                : "Type the text above - press any key to start"}
            </div>
          </div>
        )}
        
        {/* Race Results */}
        {raceFinished && (
          <div className="mt-8 bg-dark-900 border border-primary rounded-md p-6 text-center">
            <h2 className="text-2xl font-minecraft text-primary mb-4">Race Complete!</h2>
            
            <div className="mb-6">
              <div className="text-3xl font-minecraft text-yellow-400 mb-2">
                {(() => {
                  const playerRacer = racers.find(r => r.isYou);
                  const position = playerRacer?.position || 1;
                  
                  if (position === 1) return "VICTORY!";
                  if (position === 2) return "2ND PLACE!";
                  if (position === 3) return "3RD PLACE!";
                  return `${position}TH PLACE!`;
                })()}
              </div>
              
              <div className="grid grid-cols-4 gap-4 mb-4">
                <div className="bg-dark-800 p-3 rounded-md">
                  <div className="text-2xl font-minecraft text-primary">
                    {Math.round(currentWpm)}
                  </div>
                  <div className="text-sm text-gray-400">WPM</div>
                </div>
                
                <div className="bg-dark-800 p-3 rounded-md">
                  <div className="text-2xl font-minecraft text-primary">
                    {Math.round(100 - (errorCount / Math.max(1, totalKeypresses) * 100))}%
                  </div>
                  <div className="text-sm text-gray-400">Accuracy</div>
                </div>
                
                <div className="bg-dark-800 p-3 rounded-md">
                  <div className="text-2xl font-minecraft text-primary">
                    {(() => {
                      const playerRacer = racers.find(r => r.isYou);
                      return formatTime(playerRacer?.finishTime || elapsedTime);
                    })()}
                  </div>
                  <div className="text-sm text-gray-400">Time</div>
                </div>
                
                <div className="bg-dark-800 p-3 rounded-md">
                  <div className="text-2xl font-minecraft text-yellow-400">
                    {(() => {
                      const playerRacer = racers.find(r => r.isYou);
                      return `+${playerRacer?.xpGained || 0}`;
                    })()}
                  </div>
                  <div className="text-sm text-gray-400">XP</div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-center space-x-4">
              <PixelButton onClick={handleRestart}>
                Race Again
              </PixelButton>
              
              <PixelButton onClick={handleBackToLobby} variant="secondary">
                Back to Lobby
              </PixelButton>
            </div>
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
}