import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Card } from "@/components/ui/card";
import { PixelButton } from "@/components/ui/pixel-button";
import { useWebSocket } from "@/hooks/use-websocket";
import { useToast } from "@/hooks/use-toast";
import { getRandomPrompt } from "@/lib/single-player";
import { MultiplayerRace } from "@/components/multiplayer-race";
import { simpleAudio } from "@/lib/simple-audio";

// Placeholder backgrounds
const RACE_BACKGROUNDS = ["dirt", "grass", "snow", "nether"];

// Max players in race
const MAX_PLAYERS = 8;

// NPC difficulty levels
const NPC_DIFFICULTIES = ["peaceful", "easy", "normal", "hard"];

// Command instruction text
const COMMAND_INSTRUCTIONS = "/ready → claim a slot | /summon npc_(peaceful|easy|normal|hard) → add CPU | Race starts at 8 racers or after timer.";

interface Player {
  id: string;
  username: string;
  isNPC: boolean;
  difficulty?: string;
  status: "waiting" | "ready" | "typing" | "finished";
  progress: number;
  wpm: number;
  chickenType: string;
  jockeyType: string;
  finishTime?: number;
}

export default function Multiplayer() {
  const [, setLocation] = useLocation();
  const [players, setPlayers] = useState<Player[]>([]);
  const [guestId, setGuestId] = useState<string | null>(null);
  const [isRaceActive, setIsRaceActive] = useState(false);
  const [raceStartTime, setRaceStartTime] = useState<number | null>(null);
  const [prompt, setPrompt] = useState("");
  const [playerProgress, setPlayerProgress] = useState(0);
  const [showCountdown, setShowCountdown] = useState(false);
  const [countdownValue, setCountdownValue] = useState(3);
  const [showResults, setShowResults] = useState(false);
  const [raceResults, setRaceResults] = useState<any[]>([]);
  const [raceBackground, setRaceBackground] = useState(RACE_BACKGROUNDS[0]);
  const [command, setCommand] = useState("");
  const [timerSeconds, setTimerSeconds] = useState<number | null>(null);
  const [raceEndTimer, setRaceEndTimer] = useState<number | null>(null);
  const [playerWPM, setPlayerWPM] = useState(0);
  const [playerAccuracy, setPlayerAccuracy] = useState(100);
  
  // Set document title
  useEffect(() => {
    document.title = "Multiplayer Race - Chicken Jockey Scribe Racer";
  }, []);
  
  const commandInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  
  // WebSocket connection
  const { socket, connected, sendMessage } = useWebSocket();
  
  // Get a random HTML sprite for variety
  const getRandomHtmlSprite = (): string => {
    // Array of available HTML sprites for multiplayer (accessible without level requirements)
    const availableSprites = [
      "html_matikah", 
      "html_auto", 
      "html_steve", 
      "html_teacherGuru",
      "html_waterGaru",
      "html_fireGaru",
      "html_earthGaru",
      "html_etherGaru",
      "html_orderGaru",
      "html_airGaru"
    ];
    
    return availableSprites[Math.floor(Math.random() * availableSprites.length)];
  };
  
  // Initialize players
  useEffect(() => {
    // Create 8 empty player slots
    const emptyPlayers: Player[] = Array(MAX_PLAYERS).fill(null).map((_, index) => ({
      id: `empty-${index}`,
      username: "Waiting for player...",
      isNPC: false,
      status: "waiting",
      progress: 0,
      wpm: 0,
      chickenType: "html_generic",
      jockeyType: "html_generic"
    }));
    
    setPlayers(emptyPlayers);
    
    // Choose random background
    const randomBg = RACE_BACKGROUNDS[Math.floor(Math.random() * RACE_BACKGROUNDS.length)];
    setRaceBackground(randomBg);
    
    // Create a guest ID for this session
    const guestNumber = Math.floor(1000 + Math.random() * 9000);
    setGuestId(`Guest${guestNumber}`);
    
    // Get a random prompt
    setPrompt(getRandomPrompt());
    
  }, []);
  
  // Handle command input
  const handleCommandChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCommand(e.target.value);
  };
  
  // Handle command submission
  const handleCommandSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const cmd = command.trim().toLowerCase();
    
    // Process commands
    if (cmd === "/ready") {
      // Claim a slot if not already claimed
      if (!players.some(p => p.id === guestId)) {
        claimNextEmptySlot();
        toast({
          title: "Ready!",
          description: "You've claimed a slot in the race.",
        });
      } else {
        toast({
          title: "Already Ready",
          description: "You've already claimed a slot.",
          variant: "destructive"
        });
      }
    } 
    // NPC summoning commands
    else if (cmd.startsWith("/summon npc_")) {
      const difficulty = cmd.replace("/summon npc_", "");
      
      if (NPC_DIFFICULTIES.includes(difficulty)) {
        summonNPC(difficulty);
        toast({
          title: "NPC Summoned",
          description: `Added ${difficulty} NPC to the race.`,
        });
      } else {
        toast({
          title: "Invalid Difficulty",
          description: "Use peaceful, easy, normal, or hard.",
          variant: "destructive"
        });
      }
    } 
    // Invalid command
    else {
      toast({
        title: "Invalid Command",
        description: "Type /ready to join or /summon npc_difficulty to add an NPC.",
        variant: "destructive"
      });
    }
    
    // Clear command input
    setCommand("");
  };
  
  // Claim next empty slot for the player
  const claimNextEmptySlot = () => {
    if (!guestId) return;
    
    const emptySlotIndex = players.findIndex(p => p.id.startsWith('empty-'));
    
    if (emptySlotIndex !== -1) {
      const updatedPlayers = [...players];
      // Select a random HTML sprite for variety
      const selectedSprite = getRandomHtmlSprite();
      
      updatedPlayers[emptySlotIndex] = {
        id: guestId,
        username: guestId,
        isNPC: false,
        status: "ready",
        progress: 0,
        wpm: 0,
        chickenType: selectedSprite,
        jockeyType: selectedSprite
      };
      
      setPlayers(updatedPlayers);
      
      // Start race timer if this is the first player
      if (!timerSeconds && players.every(p => p.id.startsWith('empty-'))) {
        setTimerSeconds(7); // 7-second countdown
      }
      
      // Register with websocket with the selected sprite
      if (connected) {
        sendMessage({
          type: "player_ready",
          guestId,
          guestName: guestId,
          chickenType: selectedSprite,
          jockeyType: selectedSprite
        });
      }
    } else {
      toast({
        title: "Race Full",
        description: "No empty slots available.",
        variant: "destructive"
      });
    }
  };
  
  // Summon an NPC with the specified difficulty
  const summonNPC = (difficulty: string) => {
    const emptySlotIndex = players.findIndex(p => p.id.startsWith('empty-'));
    
    if (emptySlotIndex !== -1) {
      // Generate NPC name based on difficulty
      const npcNames = {
        peaceful: ["Clucky", "Feathers", "Peckington", "Eggbert"],
        easy: ["Wingman", "Beaker", "Cluckles", "Scratcher"],
        normal: ["Peckatrix", "Velocirooster", "Turbo Chick", "Sprint Hen"],
        hard: ["Blazewing", "Nitro Claw", "Mega Peck", "Thunder Beak"]
      };
      
      const names = npcNames[difficulty as keyof typeof npcNames] || npcNames.normal;
      const randomName = names[Math.floor(Math.random() * names.length)];
      
      // Use varied HTML sprites based on difficulty
      const peacefulSprites = ['html_chalisa', 'html_timaru', 'html_fireGaru', 'html_waterGaru'];
      const easySprites = ['html_undeadCJ01', 'html_undeadCJ02', 'html_undeadCJ03', 'html_undeadCJ04'];
      const normalSprites = ['html_undeadCJ05', 'html_undeadCJ06', 'html_undeadCJ07', 'html_undeadCJ08', 'html_undeadCJ09'];
      const hardSprites = ['html_indusKnightCJ01', 'html_indusKnightCJ02', 'html_indusKnightCJ03', 'html_indusKnightCJ04'];
      const insaneSprites = ['html_indusKnightCJ05', 'html_indusKnightCJ06', 'html_indusKnightCJ07', 'html_indusKnightCJ08'];
      
      let spritePool;
      switch(difficulty) {
        case 'peaceful':
          spritePool = peacefulSprites;
          break;
        case 'easy':
          spritePool = easySprites;
          break;
        case 'normal':
          spritePool = normalSprites;
          break;
        case 'hard':
          spritePool = hardSprites;
          break;
        default:
          spritePool = [...peacefulSprites, ...easySprites, ...normalSprites, ...hardSprites, ...insaneSprites];
      }
      
      let chickenType = spritePool[Math.floor(Math.random() * spritePool.length)];
      let jockeyType = chickenType; // Use the same sprite for both chicken and jockey for consistency
      
      const updatedPlayers = [...players];
      updatedPlayers[emptySlotIndex] = {
        id: `npc-${Date.now()}-${emptySlotIndex}`,
        username: `[CPU] ${randomName} (${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)})`,
        isNPC: true,
        difficulty,
        status: "ready",
        progress: 0,
        wpm: 0,
        chickenType,
        jockeyType
      };
      
      setPlayers(updatedPlayers);
      
      // Start race timer if this is the first entity in the race
      if (!timerSeconds && updatedPlayers.filter(p => !p.id.startsWith('empty-')).length === 1) {
        setTimerSeconds(7); // 7-second countdown
      }
    } else {
      toast({
        title: "Race Full",
        description: "No empty slots available for NPCs.",
        variant: "destructive"
      });
    }
  };
  
  // Race countdown timer
  useEffect(() => {
    if (timerSeconds === null) return;
    
    // Check if race should auto-start (all slots filled)
    if (players.every(p => !p.id.startsWith('empty-'))) {
      startRaceCountdown();
      return;
    }
    
    const timer = setInterval(() => {
      setTimerSeconds(prev => {
        if (prev === null) return null;
        
        if (prev <= 1) {
          clearInterval(timer);
          fillEmptySlotsWithNPCs();
          startRaceCountdown();
          return null;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [timerSeconds, players]);
  
  // Fill empty slots with random NPCs
  const fillEmptySlotsWithNPCs = () => {
    const updatedPlayers = [...players];
    
    updatedPlayers.forEach((player, index) => {
      if (player.id.startsWith('empty-')) {
        const randomDifficulty = NPC_DIFFICULTIES[Math.floor(Math.random() * NPC_DIFFICULTIES.length)];
        
        // Generate NPC info
        const npcNames = ["RoboChick", "AutoHen", "MechPecker", "CyberFowl"];
        const randomName = npcNames[Math.floor(Math.random() * npcNames.length)];
        
        // Use HTML sprites for auto-generated NPCs with more variety
        let htmlSprites = [];
        
        // Assign appropriate HTML sprite based on difficulty
        if (randomDifficulty === 'peaceful') {
          htmlSprites = ['html_teacherGuru', 'html_steve'];
        } else if (randomDifficulty === 'easy') {
          htmlSprites = ['html_waterGaru', 'html_airGaru'];
        } else if (randomDifficulty === 'normal') {
          htmlSprites = ['html_fireGaru', 'html_earthGaru'];
        } else if (randomDifficulty === 'hard') {
          htmlSprites = ['html_orderGaru', 'html_etherGaru'];
        } else {
          htmlSprites = ['html_auto', 'html_matikah'];
        }
        
        // Randomly select from the difficulty-appropriate sprites
        const selectedSprite = htmlSprites[Math.floor(Math.random() * htmlSprites.length)];
        let chickenType = selectedSprite;
        let jockeyType = selectedSprite;
        
        updatedPlayers[index] = {
          id: `npc-auto-${Date.now()}-${index}`,
          username: `[CPU] ${randomName} (${randomDifficulty.charAt(0).toUpperCase() + randomDifficulty.slice(1)})`,
          isNPC: true,
          difficulty: randomDifficulty,
          status: "ready",
          progress: 0,
          wpm: 0,
          chickenType,
          jockeyType
        };
      }
    });
    
    setPlayers(updatedPlayers);
  };
  
  // Start race countdown
  const startRaceCountdown = () => {
    setShowCountdown(true);
    setCountdownValue(3);
    
    let count = 3;
    const countdownInterval = setInterval(() => {
      count--;
      setCountdownValue(count);
      
      if (count <= 0) {
        clearInterval(countdownInterval);
        setShowCountdown(false);
        startRace();
      }
    }, 1000);
  };
  
  // Start race
  const startRace = () => {
    setIsRaceActive(true);
    setRaceStartTime(Date.now());
    
    // Update all players to typing status
    const updatedPlayers = players.map(player => ({
      ...player,
      status: "typing" as const
    }));
    
    setPlayers(updatedPlayers);
  };
  
  // Handle typing progress update
  const handleProgressUpdate = (progress: number, wpm: number, accuracy: number) => {
    if (!isRaceActive || !guestId) return;
    
    setPlayerProgress(progress);
    setPlayerWPM(wpm);
    setPlayerAccuracy(accuracy);
    
    // Update player progress
    const updatedPlayers = [...players];
    const playerIndex = updatedPlayers.findIndex(p => p.id === guestId);
    
    if (playerIndex !== -1) {
      updatedPlayers[playerIndex].progress = progress;
      updatedPlayers[playerIndex].wpm = wpm;
      setPlayers(updatedPlayers);
    }
    
    // Check if player has finished
    if (progress >= 100 && playerIndex !== -1 && updatedPlayers[playerIndex].status !== "finished") {
      handlePlayerFinish(playerIndex);
    }
  };
  
  // Update NPC progress
  useEffect(() => {
    if (!isRaceActive || !raceStartTime) return;
    
    const npcProgressInterval = setInterval(() => {
      const elapsedSeconds = (Date.now() - raceStartTime) / 1000;
      
      const updatedPlayers = [...players];
      let anyNPCFinished = false;
      
      updatedPlayers.forEach((player, index) => {
        if (player.isNPC && player.status === "typing") {
          // Calculate base typing speed based on difficulty
          const speedMultipliers = {
            peaceful: 0.5,  // 10-20 WPM
            easy: 1.0,      // 20-30 WPM
            normal: 2.0,    // 30-50 WPM
            hard: 3.0       // 50-80 WPM
          };
          
          const multiplier = speedMultipliers[player.difficulty as keyof typeof speedMultipliers] || 1.0;
          const randomFactor = 0.8 + (Math.random() * 0.4); // 0.8-1.2 randomization
          const wpm = 20 * multiplier * randomFactor;
          
          // Calculate progress based on WPM and elapsed time
          const charsPerSecond = (wpm * 5) / 60; // Assuming 5 chars per word
          const expectedChars = charsPerSecond * elapsedSeconds;
          const promptLength = prompt.length;
          const progress = Math.min(100, Math.floor((expectedChars / promptLength) * 100));
          
          // Update NPC progress and WPM
          updatedPlayers[index].progress = progress;
          updatedPlayers[index].wpm = Math.round(wpm);
          
          // Check if NPC has finished
          if (progress >= 100 && player.status === "typing") {
            handleNPCFinish(index);
            anyNPCFinished = true;
          }
        }
      });
      
      setPlayers(updatedPlayers);
    }, 200);
    
    return () => clearInterval(npcProgressInterval);
  }, [isRaceActive, raceStartTime, players, prompt]);
  
  // Handle player finish
  const handlePlayerFinish = (playerIndex: number) => {
    const finishTime = Date.now() - (raceStartTime || 0);
    
    const updatedPlayers = [...players];
    updatedPlayers[playerIndex] = {
      ...updatedPlayers[playerIndex],
      status: "finished",
      progress: 100,
      finishTime
    };
    
    setPlayers(updatedPlayers);
    
    // Check if race should end (all players finished or timeout)
    checkRaceEnd();
  };
  
  // Handle NPC finish
  const handleNPCFinish = (npcIndex: number) => {
    const finishTime = Date.now() - (raceStartTime || 0);
    
    const updatedPlayers = [...players];
    updatedPlayers[npcIndex] = {
      ...updatedPlayers[npcIndex],
      status: "finished",
      progress: 100,
      finishTime
    };
    
    setPlayers(updatedPlayers);
    
    // Check if race should end
    checkRaceEnd();
  };
  
  // Check if race should end
  const checkRaceEnd = () => {
    // If all players finished, end the race
    if (players.every(p => p.status === "finished")) {
      endRace();
      return;
    }
    
    // If player is finished, start a 30-second countdown
    const playerFinished = players.find(p => p.id === guestId)?.status === "finished";
    
    if (playerFinished && raceEndTimer === null) {
      setRaceEndTimer(30);
      
      const timer = setInterval(() => {
        setRaceEndTimer(prev => {
          if (prev === null) return null;
          
          if (prev <= 1) {
            clearInterval(timer);
            endRace();
            return null;
          }
          return prev - 1;
        });
      }, 1000);
    }
  };
  
  // End race and show results
  const endRace = () => {
    setIsRaceActive(false);
    
    // Prepare race results
    const results = players
      .filter(p => p.status === "finished" || p.progress > 0)
      .map(p => ({
        id: p.id,
        username: p.username,
        position: 0, // Will be calculated below
        wpm: p.wpm,
        accuracy: p.isNPC ? Math.floor(80 + Math.random() * 20) : playerAccuracy, // Random accuracy for NPCs
        isCurrentPlayer: p.id === guestId,
        xpGained: p.isNPC ? 0 : Math.round(p.wpm * (playerAccuracy / 100))
      }))
      .sort((a, b) => {
        // Sort by finish status first
        const aFinished = players.find(p => p.id === a.id)?.status === "finished";
        const bFinished = players.find(p => p.id === b.id)?.status === "finished";
        
        if (aFinished && !bFinished) return -1;
        if (!aFinished && bFinished) return 1;
        
        // If both finished, sort by finish time
        const aFinishTime = players.find(p => p.id === a.id)?.finishTime || 0;
        const bFinishTime = players.find(p => p.id === b.id)?.finishTime || 0;
        
        if (aFinished && bFinished) {
          return aFinishTime - bFinishTime;
        }
        
        // If neither finished, sort by progress
        return (players.find(p => p.id === b.id)?.progress || 0) - (players.find(p => p.id === a.id)?.progress || 0);
      });
    
    // Assign positions
    results.forEach((result, index) => {
      result.position = index + 1;
    });
    
    setRaceResults(results);
    setShowResults(true);
  };
  
  // Handle typing complete
  const handleTypingComplete = (stats: { wpm: number; accuracy: number; time: number }) => {
    // Player has completed the race
    if (!guestId) return;
    
    const playerIndex = players.findIndex(p => p.id === guestId);
    if (playerIndex !== -1) {
      handlePlayerFinish(playerIndex);
    }
  };
  
  // Close results and return to lobby
  const handleCloseResults = () => {
    setShowResults(false);
    resetRace();
  };
  
  // Reset race
  const resetRace = () => {
    // Reset all race-related state
    setIsRaceActive(false);
    setRaceStartTime(null);
    setPlayerProgress(0);
    setTimerSeconds(null);
    setRaceEndTimer(null);
    
    // Get a new prompt
    setPrompt(getRandomPrompt());
    
    // Reset players to empty slots
    const emptyPlayers: Player[] = Array(MAX_PLAYERS).fill(null).map((_, index) => ({
      id: `empty-${index}`,
      username: "Waiting for player...",
      isNPC: false,
      status: "waiting",
      progress: 0,
      wpm: 0,
      chickenType: "html_steve",
      jockeyType: "html_steve"
    }));
    
    setPlayers(emptyPlayers);
    
    // Choose random background
    const randomBg = RACE_BACKGROUNDS[Math.floor(Math.random() * RACE_BACKGROUNDS.length)];
    setRaceBackground(randomBg);
  };
  
  // Handle race start
  const handleStartRace = () => {
    // Auto-join if not already joined
    if (!players.some(p => p.id === guestId)) {
      claimNextEmptySlot();
    }
    
    // Start timer if not already started
    if (timerSeconds === null) {
      setTimerSeconds(30); // 30-second countdown
    } else if (players.filter(p => !p.id.startsWith('empty-')).length >= 1) {
      // If timer is already running and at least one player is ready, start the countdown
      fillEmptySlotsWithNPCs();
      startRaceCountdown();
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-dark text-white">
      <Header />
      
      <main className="flex-grow container mx-auto p-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-minecraft text-center text-primary mb-4">MULTIPLAYER RACE</h1>
          
          {/* Race Track */}
          <div className="mb-6">
            <div className="bg-dark-800 p-4 pixel-border relative">
              <h2 className="font-minecraft text-lg text-primary mb-2">RACE TRACK</h2>
              
              {/* Traffic light countdown */}
              {timerSeconds !== null && (
                <div className="absolute top-4 right-4 z-10 flex items-center bg-black/70 p-2 rounded-lg">
                  <div className={`w-6 h-6 rounded-full mr-2 ${timerSeconds > 10 ? 'bg-red-600' : (timerSeconds > 5 ? 'bg-yellow-400' : 'bg-green-500')}`}></div>
                  <div className="font-minecraft text-white">{timerSeconds}s</div>
                </div>
              )}
              
              {/* Display race track with lanes */}
              <div 
                className="h-72 bg-dark-900 relative overflow-hidden rounded-lg"
                style={{
                  backgroundImage: `url(/assets/race-backgrounds/${raceBackground}.png)`, 
                  backgroundSize: "cover",
                  backgroundPosition: "center"
                }}
              >
                {/* Race lanes with improved visuals */}
                <div className="absolute inset-0 flex flex-col">
                  {players.map((player, index) => (
                    <div 
                      key={`lane-${index}`} 
                      className={`flex-1 relative ${
                        index < players.length - 1 ? "border-b-2 border-dashed border-primary/40" : ""
                      } ${player.id === guestId ? "bg-yellow-500/10" : ""}`}
                    >
                      {/* Lane number */}
                      <div className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/60 w-5 h-5 flex items-center justify-center rounded-full">
                        <span className="text-xs font-bold text-white">{index + 1}</span>
                      </div>
                      
                      {!player.id.startsWith('empty-') ? (
                        <>
                          {/* Dotted progress line */}
                          <div className="absolute top-1/2 left-10 right-10 h-px border-t-2 border-dotted border-white/30"></div>
                          
                          {/* Racing character */}
                          <div 
                            className="absolute top-1/2 transform -translate-y-1/2 transition-all duration-300"
                            style={{
                              left: `${Math.min(10 + player.progress * 0.75, 85)}%`,
                              zIndex: 10
                            }}
                          >
                            {/* Car/racer container */}
                            <div className={`relative ${player.id === guestId ? "scale-110" : "scale-100"}`}>
                              {/* Character sprite - HTML custom avatar */}
                              <div className={`w-12 h-12 ${player.isNPC ? "" : "animate-bounce-slow"} flex items-center justify-center overflow-hidden`}>
                                {player.chickenType.startsWith('html_') ? (
                                  <div 
                                    className={`w-full h-full rounded-full transform scale-125`}
                                    dangerouslySetInnerHTML={{ 
                                      __html: `
                                        <div class="chicken-avatar ${player.chickenType.replace('html_', '')}" 
                                             style="width: 100%; height: 100%; transform: scale(1.2);">
                                        </div>
                                      ` 
                                    }}
                                  />
                                ) : (
                                  <div className={`w-full h-full ${player.chickenType}`}></div>
                                )}
                              </div>
                              
                              {/* Racer name tag */}
                              <div className={`text-xs text-center px-2 py-0.5 rounded-md whitespace-nowrap ${
                                player.id === guestId 
                                  ? "bg-yellow-500/90 text-dark font-bold" 
                                  : "bg-black/70 text-white"
                              }`}>
                                {player.id === guestId ? "YOU" : player.username.substring(0, 10)}
                                {player.wpm > 0 && ` (${player.wpm} WPM)`}
                              </div>
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="absolute top-1/2 transform -translate-y-1/2 left-10">
                          <div className="text-xs text-white/50 bg-black/50 px-2 py-1 rounded-full">
                            Waiting for player...
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                
                {/* Finish line with improved visibility */}
                <div className="absolute top-0 bottom-0 right-12 w-8 flex items-center justify-center">
                  <div className="h-full w-full relative">
                    {/* Checkered pattern */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-white/20"></div>
                    
                    {/* Vertical pole */}
                    <div className="absolute inset-y-0 right-0 w-2 bg-gradient-to-b from-primary via-white to-primary"></div>
                    
                    {/* Finish text */}
                    <div className="absolute top-1/2 right-6 transform -translate-y-1/2 rotate-90 bg-primary/80 px-2 py-1 rounded">
                      <span className="font-minecraft text-sm text-white">FINISH</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Player leaderboard */}
              <div className="mt-4 bg-dark-900 rounded-lg p-3">
                <h3 className="text-sm font-minecraft text-primary mb-2">CURRENT STANDINGS</h3>
                
                <div className="grid grid-cols-3 gap-2 text-xs text-gray-400 mb-1 px-2">
                  <div>RACER</div>
                  <div className="text-center">PROGRESS</div>
                  <div className="text-right">WPM</div>
                </div>
                
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {players
                    .filter(p => !p.id.startsWith('empty-'))
                    .sort((a, b) => b.progress - a.progress)
                    .map((player, i) => (
                      <div 
                        key={player.id} 
                        className={`flex items-center bg-dark-800 rounded p-2 ${player.id === guestId ? "border-l-4 border-yellow-500" : ""}`}
                      >
                        <div className="mr-2 font-bold text-xs w-5 text-center">
                          {i+1}.
                        </div>
                        
                        <div className="w-8 h-8 bg-dark-700 rounded-full overflow-hidden flex items-center justify-center mr-2">
                          {player.chickenType.startsWith('html_') ? (
                            <div 
                              className="w-6 h-6 scale-110 rounded-full overflow-hidden"
                              dangerouslySetInnerHTML={{ 
                                __html: `
                                  <div class="chicken-avatar ${player.chickenType.replace('html_', '')}" 
                                       style="width: 100%; height: 100%; transform: scale(1.3);">
                                  </div>
                                ` 
                              }}
                            />
                          ) : (
                            <div className={`w-6 h-6 scale-110 ${player.chickenType}`}></div>
                          )}
                        </div>
                        
                        <div className="flex-grow">
                          <div className={`text-sm font-medium ${player.id === guestId ? "text-yellow-400" : "text-white"}`}>
                            {player.id === guestId ? "YOU" : player.username.substring(0, 15)}
                          </div>
                          {player.isNPC && (
                            <div className="text-xs text-gray-500">
                              CPU - {player.difficulty}
                            </div>
                          )}
                        </div>
                        
                        <div className="w-24">
                          <div className="h-2 w-full bg-gray-800 rounded-full overflow-hidden">
                            <div 
                              className={`h-full ${
                                player.id === guestId ? "bg-yellow-500" : 
                                player.status === "finished" ? "bg-green-500" : "bg-blue-500"
                              }`}
                              style={{ width: `${player.progress}%` }}
                            ></div>
                          </div>
                          <div className="text-xs text-right mt-1">
                            {Math.round(player.progress)}%
                          </div>
                        </div>
                        
                        <div className="w-12 text-right font-minecraft">
                          {player.wpm}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
          
          {/* Command interface (lobby) */}
          {!isRaceActive && !showResults && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <Card className="minecraft-border p-4 bg-black/60">
                  <h2 className="text-xl font-minecraft text-yellow-400 mb-2">RACE LOBBY</h2>
                  
                  <div className="bg-black/40 p-3 rounded-md mb-4">
                    <p className="text-sm text-gray-300 mb-1">
                      <span className="text-yellow-300 font-bold">Race Status:</span> {timerSeconds !== null ? `Starting in ${timerSeconds}s` : "Waiting for players"}
                    </p>
                    <p className="text-sm text-gray-300">
                      <span className="text-yellow-300 font-bold">Players:</span> {players.filter(p => !p.id.startsWith('empty-')).length}/{MAX_PLAYERS}
                    </p>
                  </div>
                  
                  <div className="flex items-center mb-4">
                    <form onSubmit={handleCommandSubmit} className="flex-grow flex space-x-2">
                      <input
                        type="text"
                        className="flex-grow bg-black/60 border border-gray-700 rounded p-2 text-white"
                        placeholder="Type commands here..."
                        value={command}
                        onChange={handleCommandChange}
                        ref={commandInputRef}
                      />
                      <PixelButton type="submit" size="sm">
                        Submit
                      </PixelButton>
                    </form>
                  </div>
                  
                  <div className="text-xs text-gray-400 mb-4">
                    {COMMAND_INSTRUCTIONS}
                  </div>
                  
                  <div className="flex justify-between">
                    <PixelButton 
                      variant="outline"
                      onClick={() => setLocation('/race')}
                    >
                      Back to Menu
                    </PixelButton>
                    
                    <PixelButton onClick={handleStartRace}>
                      {timerSeconds !== null ? "Ready!" : "Start Race"}
                    </PixelButton>
                  </div>
                </Card>
              </div>
              
              <div>
                <Card className="minecraft-border p-4 bg-black/60">
                  <h2 className="text-xl font-minecraft text-yellow-400 mb-2">CURRENT RACERS</h2>
                  
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {players.map((player, index) => (
                      <div key={player.id} className="flex items-center p-2 bg-black/40 rounded">
                        <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-800 flex items-center justify-center mr-2">
                          {!player.id.startsWith('empty-') ? (
                            <div className={`w-8 h-8 pixel-character ${player.chickenType}`}></div>
                          ) : (
                            <span className="text-xs text-gray-500">{index + 1}</span>
                          )}
                        </div>
                        <div className="flex-grow">
                          <div className={`text-sm ${player.id.startsWith('empty-') ? 'text-gray-500' : 'text-white'}`}>
                            {player.username}
                          </div>
                          {!player.id.startsWith('empty-') && (
                            <div className="text-xs text-gray-400">
                              {player.isNPC ? `CPU (${player.difficulty})` : "Player"}
                            </div>
                          )}
                        </div>
                        <div className="text-xs text-gray-400">
                          {player.status === "ready" ? "Ready" : player.status === "typing" ? `${player.wpm} WPM` : player.status === "finished" ? "Finished!" : ""}
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            </div>
          )}
          
          {/* Race interface (active race) */}
          {isRaceActive && (
            <div className="mb-6">
              <Card className="minecraft-border p-4 bg-black/60">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <span className="text-gray-400 text-sm mr-2">WPM:</span>
                    <span className="font-minecraft text-yellow-400">{playerWPM}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 text-sm mr-2">Accuracy:</span>
                    <span className="font-minecraft text-yellow-400">{playerAccuracy}%</span>
                  </div>
                  <div>
                    <span className="text-gray-400 text-sm mr-2">Progress:</span>
                    <span className="font-minecraft text-yellow-400">{playerProgress}%</span>
                  </div>
                  {raceEndTimer !== null && (
                    <div>
                      <span className="text-gray-400 text-sm mr-2">Race ends in:</span>
                      <span className="font-minecraft text-yellow-400">{raceEndTimer}s</span>
                    </div>
                  )}
                </div>
                
                <MultiplayerRace
                  prompt={prompt}
                  onProgress={handleProgressUpdate}
                  onComplete={handleTypingComplete}
                  onBack={() => resetRace()}
                  isActive={isRaceActive}
                  startTime={raceStartTime}
                />
              </Card>
            </div>
          )}
        </div>
      </main>
      
      {/* Countdown Modal */}
      {showCountdown && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-dark-800 p-8 pixel-border max-w-md text-center rounded-lg">
            <h2 className="font-minecraft text-2xl text-primary mb-6">RACE STARTING!</h2>
            
            {/* Traffic light countdown */}
            <div className="flex justify-center space-x-4 mb-6">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                countdownValue >= 3 ? "bg-red-600" : "bg-gray-800"
              }`}>
                {countdownValue >= 3 && <div className="w-8 h-8 rounded-full bg-red-400 animate-pulse"></div>}
              </div>
              <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                countdownValue === 2 ? "bg-yellow-500" : "bg-gray-800"
              }`}>
                {countdownValue === 2 && <div className="w-8 h-8 rounded-full bg-yellow-300 animate-pulse"></div>}
              </div>
              <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                countdownValue === 1 ? "bg-green-500" : "bg-gray-800"
              }`}>
                {countdownValue === 1 && <div className="w-8 h-8 rounded-full bg-green-300 animate-pulse"></div>}
              </div>
              <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                countdownValue === 0 ? "bg-green-500" : "bg-gray-800"
              }`}>
                {countdownValue === 0 && <div className="w-8 h-8 rounded-full bg-green-300 animate-pulse"></div>}
              </div>
            </div>
            
            <div className="font-minecraft text-6xl text-white mb-6">
              {countdownValue === 0 ? "GO!" : countdownValue}
            </div>
            
            <p className="text-light text-lg">
              {countdownValue === 0 
                ? "Type as fast as you can!" 
                : "Get your fingers ready..."}
            </p>
          </div>
        </div>
      )}
      
      {/* Results Modal */}
      {showResults && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-dark p-8 pixel-border max-w-md">
            <h2 className="font-pixel text-2xl text-primary mb-6 text-center">RACE RESULTS</h2>
            
            <div className="space-y-4 mb-6">
              {raceResults.map((result) => (
                <div key={result.id} className="flex items-center">
                  <div className={`w-6 h-6 rounded-full ${
                    result.position === 1 ? "bg-yellow-400" : 
                    result.position === 2 ? "bg-gray-300" : 
                    result.position === 3 ? "bg-amber-700" : "bg-gray-800"
                  } flex items-center justify-center font-pixel text-black mr-3`}>
                    {result.position}
                  </div>
                  <div className="flex-grow">
                    <div className={result.isCurrentPlayer ? "text-primary font-bold" : "text-light font-bold"}>
                      {result.isCurrentPlayer ? "YOU" : result.username}
                    </div>
                    <div className="text-xs text-light/70">
                      {result.wpm} WPM / {result.accuracy}% accuracy
                    </div>
                  </div>
                  {result.isCurrentPlayer && (
                    <div className="text-primary font-pixel">+{result.xpGained} XP</div>
                  )}
                </div>
              ))}
            </div>
            
            <div className="flex space-x-2">
              <PixelButton 
                className="flex-1" 
                onClick={handleCloseResults}
              >
                BACK TO LOBBY
              </PixelButton>
            </div>
          </div>
        </div>
      )}
      
      <Footer />
    </div>
  );
}