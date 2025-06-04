import { useEffect, useState, useRef } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { PixelButton } from "@/components/ui/pixel-button";
import { ChickenAvatar } from "@/components/ui/chicken-avatar";
import { apiRequest } from "@/lib/queryClient";
import { Flag, Clock3 } from "lucide-react";
import { cn } from "@/lib/utils";
import { calculateWpm } from "@/lib/wpm-simple";
import { simpleAudio } from "@/lib/simple-audio";
import { saveGameToProfile, loadGameFromProfile } from "@/lib/campaigns";
import { useToast } from "@/hooks/use-toast";

// Dice roll WPM system for elemental factions
const assignNpcWpm = (faction: string): number => {
  const randBetween = (min: number, max: number): number => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };

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
};

interface CampaignRacer {
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
  faction: string;
  factionColor: string;
  xpEarned: number;
  xpGained?: number;
}

interface CampaignRaceProps {
  campaignPrompt: string;
  campaignTitle: string;
  campaignCharacter: string;
  raceId: number;
  onRaceComplete: (stats: { wpm: number; accuracy: number; time: number; position: number; xpGained: number }) => void;
  onBackToMenu: () => void;
}

// Elemental faction system
const ELEMENTAL_FACTIONS = {
  d2: { name: "Coin", color: "#C0C0C0", element: "Coin" },
  d4: { name: "Fire", color: "#FF0000", element: "Fire" },
  d6: { name: "Earth", color: "#00FF00", element: "Earth" },
  d8: { name: "Air", color: "#FFFFFF", element: "Air" },
  d10: { name: "Chaos", color: "#4B0082", element: "Chaos" },
  d12: { name: "Ether", color: "#FFFFFF", element: "Ether" }, // Changed to white for visibility
  d20: { name: "Water", color: "#0000FF", element: "Water" },
  d100: { name: "Order", color: "#FFD700", element: "Order" }
};

export function CampaignRace({
  campaignPrompt,
  campaignTitle,
  campaignCharacter,
  raceId,
  onRaceComplete,
  onBackToMenu,
  musicTrack // Add music track from chapter data
}: CampaignRaceProps & { musicTrack?: string }) {
  const [setLocation] = useLocation();
  const { toast } = useToast();

  // Get user profile to check authentication
  const { data: profile } = useQuery({
    queryKey: ["/api/profile"],
  });

  const isAuthenticated = !!profile;
  const [racers, setRacers] = useState<CampaignRacer[]>([]);
  const [raceStarted, setRaceStarted] = useState(false);
  const [raceFinished, setRaceFinished] = useState(false);
  const [countdownSeconds, setCountdownSeconds] = useState(3);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [currentWpm, setCurrentWpm] = useState(0);

  // Typing state
  const [typed, setTyped] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [error, setError] = useState(false);
  const [errorCount, setErrorCount] = useState(0);
  const [totalKeypresses, setTotalKeypresses] = useState(0);

  // Refs
  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const timeStartRef = useRef<number | null>(null);
  const typingStartTimeRef = useRef<number | null>(null);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Get lore-appropriate NPCs based on campaign content
  const getLoreNPCs = (prompt: string, character: string) => {
    const factionKeys = Object.keys(ELEMENTAL_FACTIONS);
    
    // Extract character names and themes from the race prompt
    const loreNames = [];
    const chickens = [];
    const jockeys = [];
    const factions = [];
    
    // Steve campaign NPCs - only use vibrant NPCs, story characters only when mentioned
    if (character === 'steve') {
      if (campaignTitle.includes('MARKET') || (prompt.includes('Iam') && prompt.includes('meet'))) {
        // Only when Iam actually appears in the story context
        loreNames.push("Iam", "PrismTail", "VoidRunner");
        chickens.push("html_iam", "html_prismTail", "html_voidRunner");
        jockeys.push("iam", "generic", "generic");
        factions.push("d12", "d10", "d8");
      } else if ((prompt.includes('Auto') || campaignTitle.includes('Auto')) && 
                 (prompt.includes('meet') || prompt.includes('encounter') || prompt.includes('together') || prompt.includes('festival'))) {
        // Only when Auto actually appears in the story
        loreNames.push("Auto", "SolarFlare", "FrostWing");
        chickens.push("html_auto", "html_solarFlare", "html_frostWing");
        jockeys.push("auto", "generic", "generic");
        factions.push("d6", "d4", "d8");
      } else {
        // Default vibrant NPCs for all Steve races - no Death character
        loreNames.push("CrystalWing", "ThunderBeak", "ShadowFeather");
        chickens.push("html_crystalWing", "html_thunderBeak", "html_shadowFeather");
        jockeys.push("generic", "generic", "generic");
        factions.push("d4", "d12", "d6");
      }
    }
    
    // Auto campaign NPCs - only vibrant NPCs, story characters only when mentioned
    else if (character === 'auto') {
      if (prompt.includes('Steve') && (prompt.includes('meet') || prompt.includes('encounter') || prompt.includes('festival') || prompt.includes('together'))) {
        // Only when Steve actually appears in the story
        loreNames.push("Steve", "NeonRush", "CrystalWing");
        chickens.push("html_steve", "html_neonRush", "html_crystalWing");
        jockeys.push("steve", "generic", "generic");
        factions.push("d4", "d6", "d12");
      } else {
        // Default vibrant NPCs for all Auto races
        loreNames.push("FrostWing", "VoidRunner", "PrismTail");
        chickens.push("html_frostWing", "html_voidRunner", "html_prismTail");
        jockeys.push("generic", "generic", "generic");
        factions.push("d6", "d8", "d12");
      }
    }
    
    // Matikah campaign NPCs - only vibrant NPCs, story characters only when mentioned
    else if (character === 'matikah') {
      if (prompt.includes('Steve') && (prompt.includes('meet') || prompt.includes('encounter') || prompt.includes('together'))) {
        loreNames.push("Steve", "SolarFlare", "ThunderBeak");
        chickens.push("html_steve", "html_solarFlare", "html_thunderBeak");
        jockeys.push("steve", "generic", "generic");
        factions.push("d4", "d12", "d8");
      } else {
        // Default vibrant NPCs for all Matikah races
        loreNames.push("ShadowFeather", "CrystalWing", "NeonRush");
        chickens.push("html_shadowFeather", "html_crystalWing", "html_neonRush");
        jockeys.push("generic", "generic", "generic");
        factions.push("d12", "d8", "d20");
      }
    }
    
    // Iam campaign NPCs - only vibrant NPCs, story characters only when mentioned
    else if (character === 'iam') {
      if (prompt.includes('Steve') && (prompt.includes('meet') || prompt.includes('encounter') || prompt.includes('together'))) {
        loreNames.push("Steve", "VoidRunner", "FrostWing");
        chickens.push("html_steve", "html_voidRunner", "html_frostWing");
        jockeys.push("steve", "generic", "generic");
        factions.push("d4", "d20", "d12");
      } else {
        // Default vibrant NPCs for all Iam races
        loreNames.push("PrismTail", "ThunderBeak", "SolarFlare");
        chickens.push("html_prismTail", "html_thunderBeak", "html_solarFlare");
        jockeys.push("generic", "generic", "generic");
        factions.push("d20", "d12", "d100");
      }
    }
    
    // Chocobo SOLDIER campaign - the SOLDIERs ARE the chocobos (no jockeys!)
    else if (character === 'zack_chocobo') {
      // Genesis, Angeal, and Sephiroth as fellow SOLDIER chocobos
      loreNames.push("Genesis", "Angeal", "Sephiroth");
      chickens.push("html_red", "html_silver", "html_black"); // Red, Silver, Black
      jockeys.push("none", "none", "none"); // NO JOCKEYS - they ARE the chocobos!
      factions.push("d4", "d12", "d100"); // Fire, Ether, Order factions
    }
    
    // Ensure we have enough NPCs for 4-racer format (3 NPCs + 1 player)
    while (loreNames.length < 3) {
      const npcPool = ["CrystalWing", "ThunderBeak", "ShadowFeather", "PrismTail", "VoidRunner", "SolarFlare", "FrostWing", "NeonRush"];
      const npcChickenPool = ["html_crystalWing", "html_thunderBeak", "html_shadowFeather", "html_prismTail", "html_voidRunner", "html_solarFlare", "html_frostWing", "html_neonRush"];
      const index: number = loreNames.length % npcPool.length;
      loreNames.push(npcPool[index]);
      chickens.push(npcChickenPool[index]);
      jockeys.push("generic");
      factions.push(factionKeys[loreNames.length % factionKeys.length]);
    }
    
    return { loreNames: loreNames.slice(0, 3), chickens: chickens.slice(0, 3), jockeys: jockeys.slice(0, 3), factions: factions.slice(0, 3) };
  };

  // Play background music for this chapter
  useEffect(() => {
    if (musicTrack) {
      simpleAudio.playMusic(musicTrack, 0.3); // Play chapter music at 30% volume
    }
    return () => {
      simpleAudio.stopMusic(); // Stop music when component unmounts
    };
  }, [musicTrack]);

  // Initialize campaign race with player + lore-appropriate NPCs
  useEffect(() => {
    const selectedFaction = localStorage.getItem('selectedFaction') || 'd2';

    // Player ALWAYS plays as the campaign character in their own campaign
    let playerChicken = `html_${campaignCharacter}`;
    let playerJockey = campaignCharacter;
    
    // Special handling for Chocobo SOLDIER campaign - Zack is a dark blue chocobo without jockey
    if (campaignCharacter === 'zack_chocobo') {
      playerChicken = "html_blue"; // HTML dark blue chicken for Zack
      playerJockey = "none"; // NO JOCKEY - Zack IS the chocobo!
    }

    // Get lore-appropriate NPCs for this race
    const { loreNames, chickens, jockeys, factions } = getLoreNPCs(campaignPrompt, campaignCharacter);

    const newRacers: CampaignRacer[] = [];

    // Add player first - always as the campaign character
    const playerFactionData = ELEMENTAL_FACTIONS[selectedFaction as keyof typeof ELEMENTAL_FACTIONS];
    newRacers.push({
      id: 100,
      username: "You",
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
      factionColor: playerFactionData.color,
      xpEarned: 0
    });

    // Add exactly 3 lore-appropriate NPCs for 4-racer format
    const npcCount = Math.min(3, loreNames.length);
    for (let i = 0; i < npcCount; i++) {
      const faction = factions[i];
      const factionData = ELEMENTAL_FACTIONS[faction as keyof typeof ELEMENTAL_FACTIONS];
      
      newRacers.push({
        id: 101 + i,
        username: loreNames[i],
        level: Math.floor(Math.random() * 5) + 1,
        isYou: false,
        chickenType: chickens[i],
        jockeyType: jockeys[i],
        progress: 0,
        position: null,
        wpm: 0,
        accuracy: 100,
        finishTime: null,
        faction: faction,
        factionColor: factionData.color,
        xpEarned: 0
      });
    }

    setRacers(newRacers);

    // Start countdown after brief delay
    setTimeout(() => {
      // Use simpler countdown without interfering AudioContext
      let count = 3;
      setCountdownSeconds(count);
      
      const countdownInterval = setInterval(() => {
        count--;
        setCountdownSeconds(count);
        
        if (count <= 0) {
          clearInterval(countdownInterval);
          setRaceStarted(true);
          timeStartRef.current = Date.now();
          setCountdownSeconds(0);
        }
      }, 1000);
    }, 1000);
  }, []);

  // Main race loop
  useEffect(() => {
    if (raceStarted && inputRef.current) {
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
          // Restart music after focus (browser might pause it)
          simpleAudio.playCampaignTheme(campaignCharacter);
        }
      }, 100);
      
      // Start the race timer
      timerRef.current = setInterval(() => {
        if (timeStartRef.current) {
          const now = Date.now();
          const elapsed = Math.floor((now - timeStartRef.current) / 1000);
          setElapsedTime(elapsed);
          
          let wpm = 0;
          if (typingStartTimeRef.current && currentIndex > 0) {
            const typingElapsedMs = now - typingStartTimeRef.current;
            if (typingElapsedMs > 0) {
              wpm = calculateWpm(currentIndex, typingElapsedMs);
              setCurrentWpm(wpm);
            }
          }
          
          // Update player progress
          const progressPercentage = (typed.length / campaignPrompt.length) * 100;
          setRacers(prev => prev.map(racer => 
            racer.isYou ? { 
              ...racer, 
              progress: progressPercentage, 
              wpm: wpm 
            } : racer
          ));
        }
      }, 100);
      
      // Smoother NPC movement with shorter intervals
      const npcInterval = setInterval(() => {
        if (!raceFinished) {
          setRacers(prev => {
            const updatedRacers = prev.map(racer => {
              if (racer.isYou || racer.finishTime !== null) return racer;
              
              const targetWPM = racer.wpm || 60;
              const charactersPerSecond = (targetWPM * 5) / 60;
              const progressPerInterval = (charactersPerSecond * 0.1) / campaignPrompt.length * 100; // 0.1 second interval for smoother movement
              const randomFactor = (Math.random() * 0.3) + 0.85; // Less randomness for smoother movement
              
              const newProgress = Math.min(100, racer.progress + (progressPerInterval * randomFactor));
              
              if (newProgress >= 100 && racer.finishTime === null) {
                return {
                  ...racer,
                  progress: 100,
                  finishTime: elapsedTime,
                  wpm: racer.wpm || 60
                };
              }
              
              return {
                ...racer,
                progress: newProgress,
                wpm: Math.floor(25 + (newProgress * 0.5) + (Math.random() * 15))
              };
            });
            
            return updatedRacers;
          });
        }
      }, 100);
      
      return () => {
        if (timerRef.current) clearInterval(timerRef.current);
        clearInterval(npcInterval);
      };
    }
  }, [raceStarted, raceFinished, currentIndex, campaignPrompt.length, typed.length, elapsedTime]);

  // Handle typing
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (raceStarted && !raceFinished) {
      if (typingStartTimeRef.current === null) {
        typingStartTimeRef.current = Date.now();
      }
      
      if (e.key === 'Backspace') {
        if (typed.length > 0) {
          setTyped(prev => prev.slice(0, -1));
          setError(false);
        }
        e.preventDefault();
        return;
      }
      
      if (e.key.length === 1) {
        setTotalKeypresses(prev => prev + 1);
        
        const expectedChar = campaignPrompt[typed.length];
        
        // Handle special characters - allow regular dash for em dash
        const isCharMatch = e.key === expectedChar || 
          (expectedChar === '—' && e.key === '-') ||
          (expectedChar === '–' && e.key === '-');
        
        if (isCharMatch) {
          const newTyped = typed + e.key;
          setTyped(newTyped);
          setError(false);
          setCurrentIndex(newTyped.length);
          
          // Check if race is completed
          if (newTyped.length === campaignPrompt.length) {
            const finishedRacers = racers.filter(r => r.finishTime !== null);
            const playerPosition = finishedRacers.length + 1;
            
            setRaceFinished(true);
            
            const actualTypingTime = typingStartTimeRef.current 
              ? Math.floor((Date.now() - typingStartTimeRef.current) / 1000)
              : elapsedTime;
            const finishTime = Math.max(1, actualTypingTime);
            const accuracy = Math.max(0, Math.min(100, 100 - (errorCount / Math.max(1, totalKeypresses)) * 100));
            
            if (timerRef.current) {
              clearInterval(timerRef.current);
              timerRef.current = null;
            }
            
            // Calculate XP using campaign formula: (8 base + campaign bonus) + (characters typed × position multiplier)
            const charactersTyped = newTyped.length;
            const positionMultipliers = { 1: 1.0, 2: 0.5, 3: 0.33 };
            const multiplier = positionMultipliers[playerPosition as keyof typeof positionMultipliers] || 0.25;
            const baseXP = 8; // Base participation reward
            const campaignBonus = 25 + (10 * raceId); // Campaign-specific bonus
            const raceXP = Math.round((charactersTyped * multiplier));
            const totalXP = baseXP + campaignBonus + raceXP;
            
            // Update player with final stats
            setRacers(prev => prev.map(racer => {
              if (racer.isYou) {
                return {
                  ...racer,
                  progress: 100,
                  finishTime,
                  position: playerPosition,
                  wpm: currentWpm,
                  accuracy,
                  xpGained: totalXP
                };
              }
              return racer;
            }));
            
            // Play victory or defeat music based on position and campaign type
            setTimeout(() => {
              const isWinner = playerPosition <= 3; // Top 3 get victory music
              simpleAudio.playRaceResult(isWinner, playerPosition, campaignCharacter);
            }, 1000); // Small delay to let race finish visually
            
            // Update player stats to profile for campaign races
            setTimeout(async () => {
              try {
                await apiRequest('POST', '/api/stats/update-race', {
                  wpm: Math.round(currentWpm),
                  accuracy: Math.round(accuracy),
                  position: playerPosition,
                  totalPlayers: 8, // Campaign races have 8 total racers
                  faction: 'd4', // Use player's current faction instead of character-specific factions
                  charactersTyped: typed.length,
                  xpGained: totalXP,
                  raceNumber: raceId, // Use race ID directly (already 0-based)
                  raceType: 'Campaign',
                  promptText: `${campaignCharacter}, Race ${raceId}: ${campaignTitle}`, // Include character and race title
                  raceTime: timeStartRef.current ? (Date.now() - timeStartRef.current) / 1000 : 30 // Convert to seconds
                });
                console.log('✅ Campaign race stats updated successfully!');
              } catch (error) {
                console.error('Failed to update campaign race stats:', error);
              }
            }, 500);

            // Save campaign progress to backend - only for authenticated users
            setTimeout(async () => {
              try {
                // Check if user is authenticated by making a quick profile check
                const profileResponse = await fetch('/api/profile');
                if (profileResponse.ok) {
                  // User is authenticated, save to backend
                  await apiRequest('POST', '/api/campaign/complete-race', {
                    character: campaignCharacter,
                    raceNumber: raceId, // Use actual race ID without conversion
                    stats: {
                      wpm: Math.round(currentWpm),
                      accuracy: Math.round(accuracy),
                      time: elapsedTime,
                      position: playerPosition,
                      xpGained: totalXP
                    }
                  });
                  console.log(`✅ Campaign race ${raceId} progress saved to database!`);
                } else {
                  console.log(`📝 Guest user - race ${raceId} progress saved locally only`);
                }
              } catch (error) {
                console.log(`📝 Race ${raceId} saved locally (guest mode or network issue)`);
              }
            }, 750);

            // Call onRaceComplete callback to mark race as completed
            onRaceComplete({
              wpm: Math.round(currentWpm),
              accuracy: Math.round(accuracy),
              time: elapsedTime,
              position: playerPosition,
              xpGained: totalXP
            });

            // Victory screen stays visible - no auto-dismiss
            // Player must manually continue by clicking a button
          }
        } else {
          setError(true);
          setErrorCount(prev => prev + 1);
          setCurrentIndex(typed.length);
          // Play error sound for mistakes
          simpleAudio.playErrorSound();
        }
      }
    }
  };

  // Add keyboard event listener and cleanup audio on unmount
  useEffect(() => {
    const keyDownHandler = (e: KeyboardEvent) => {
      handleKeyDown(e as any);
    };
    
    window.addEventListener('keydown', keyDownHandler);
    return () => {
      window.removeEventListener('keydown', keyDownHandler);
      // Stop all audio when component unmounts (navigating away)
      simpleAudio.stopAllAudio();
    };
  }, [raceStarted, raceFinished, typed, currentIndex, elapsedTime, errorCount, totalKeypresses, racers, currentWpm]);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-dark-900 to-black text-white">
      <Header />
      
      <main className="flex-1 container mx-auto px-2 sm:px-4 pt-2 pb-6">
        <div className="flex justify-between items-center mb-2 sm:mb-4">
          <h1 className="text-xl sm:text-2xl font-minecraft text-primary">{campaignTitle}</h1>
          
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

        {/* Countdown */}
        {countdownSeconds > 0 && !raceStarted && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
            <div className="text-center">
              <div className="font-minecraft text-6xl text-primary mb-4">
                {countdownSeconds}
              </div>
              <p className="text-light text-lg">Get ready to race!</p>
            </div>
          </div>
        )}

        {/* Race Track */}
        <div className="bg-dark-900 border border-primary rounded-lg p-2 sm:p-4 mb-4">
          <div className="space-y-1 sm:space-y-2">
            {racers.map((racer, index) => (
              <div key={racer.id} className="relative">
                <div className="flex items-center space-x-2 text-xs sm:text-sm mb-1">
                  <div className="w-4 sm:w-6 text-center font-minecraft text-yellow-400">
                    {index + 1}
                  </div>
                  
                  <div className="w-4 sm:w-6 flex justify-center">
                    <ChickenAvatar 
                      chickenType={racer.chickenType} 
                      jockeyType={racer.jockeyType} 
                      size="xs" 
                      animation="idle"
                      className="transform scale-50 sm:scale-75"
                    />
                  </div>
                  
                  <div 
                    className="px-2 py-0.5 rounded text-xs font-minecraft text-black font-bold"
                    style={{ backgroundColor: racer.factionColor }}
                  >
                    {racer.faction.toUpperCase()}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <span className={cn(
                      "font-minecraft text-xs sm:text-sm truncate",
                      racer.isYou ? "text-primary font-bold" : "text-white"
                    )}>
                      {racer.username}
                    </span>
                  </div>
                  
                  <div className="text-xs text-gray-400 flex-shrink-0 w-8 text-right">
                    {Math.round(racer.wpm)}
                  </div>
                </div>
                
                <div className="relative h-4 sm:h-6 bg-dark-800 rounded-full overflow-visible">
                  {/* Progress Bar with Faction Color */}
                  <div 
                    className="absolute top-0 left-0 h-full transition-all duration-200 rounded-full"
                    style={{ 
                      width: `${racer.progress}%`,
                      backgroundColor: racer.factionColor,
                      opacity: 0.8,
                      boxSizing: 'border-box'
                    }}
                  ></div>
                </div>
                
                {/* Racing Sprite OUTSIDE the progress bar for proper layering */}
                <div 
                  className="absolute top-0 h-4 sm:h-6 transform -translate-x-1/2 transition-all duration-200 z-30 pointer-events-none"
                  style={{ left: `${racer.progress}%` }}
                >
                  <div className="transform scale-[4] -translate-y-4 drop-shadow-lg">
                    <ChickenAvatar 
                      chickenType={racer.chickenType} 
                      jockeyType={racer.jockeyType} 
                      size="sm" 
                      animation={racer.finishTime !== null ? "idle" : "run"}
                      className="flex-shrink-0 border border-white/30 rounded bg-black/20"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Typing Interface */}
        {raceStarted && !raceFinished && (
          <div className="bg-dark-900 border border-primary rounded-lg p-4 mb-4">
            <div className="mb-4">
              <div className="text-base sm:text-lg leading-relaxed font-mono">
                {(() => {
                  const windowSize = 60;
                  const windowStart = Math.max(0, currentIndex - 30);
                  const windowEnd = Math.min(campaignPrompt.length, windowStart + windowSize);
                  
                  return (
                    <>
                      {windowStart > 0 && <span className="text-gray-500">...</span>}
                      {campaignPrompt.slice(windowStart, windowEnd).split('').map((char, index) => {
                        const actualIndex = windowStart + index;
                        let className = "transition-colors duration-100";
                        
                        if (actualIndex < typed.length) {
                          className += " text-green-400 bg-green-900/30";
                        } else if (actualIndex === currentIndex) {
                          className += error ? " bg-red-600 text-white animate-pulse" : " bg-primary text-black";
                        } else {
                          className += " text-gray-300";
                        }
                        
                        return (
                          <span key={actualIndex} className={className}>
                            {char}
                          </span>
                        );
                      })}
                      {windowEnd < campaignPrompt.length && <span className="text-gray-500">...</span>}
                    </>
                  );
                })()}
              </div>
            </div>
            
            <div className="w-full relative" onClick={() => {
              if (inputRef.current && raceStarted) inputRef.current.focus();
              // Try to unlock/start music on click
              simpleAudio.resume();
            }}>
              <input
                ref={inputRef}
                type="text"
                className="w-full p-2 rounded-md bg-black border border-primary text-white mb-2 sm:opacity-0 sm:absolute sm:left-[-9999px]"
                value={typed}
                onChange={() => {}}
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
            <h2 className="text-2xl font-minecraft text-primary mb-4">Campaign Race Complete!</h2>
            

            
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
                  <div className="text-sm text-gray-400">Total XP</div>
                </div>
              </div>
              
              {/* XP BREAKDOWN - Show detailed calculation */}
              <div className="bg-dark-800 border border-dark-600 rounded-lg p-4 mt-4">
                <h3 className="text-lg font-minecraft text-yellow-400 mb-3 text-center">📚 Campaign XP Breakdown</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Base XP:</span>
                    <span className="text-white font-bold">+8</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Campaign BONUS:</span>
                    <span className="text-yellow-400 font-bold">+{25 + (10 * raceId)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Race Performance:</span>
                    <span className="text-blue-400 font-bold">+{(() => {
                      const playerRacer = racers.find(r => r.isYou);
                      if (!playerRacer) return 0;
                      const charactersTyped = typed.length;
                      const position = playerRacer.position || 8;
                      const positionMultipliers = { 1: 1.0, 2: 0.5, 3: 0.33 };
                      const multiplier = positionMultipliers[position as keyof typeof positionMultipliers] || 0.25;
                      return Math.round(charactersTyped * multiplier);
                    })()}</span>
                  </div>
                  <div className="flex justify-between border-t border-dark-600 pt-2">
                    <span className="text-yellow-300 font-bold">TOTAL XP:</span>
                    <span className="text-yellow-400 font-bold text-lg">+{(() => {
                      const playerRacer = racers.find(r => r.isYou);
                      return playerRacer?.xpGained || 0;
                    })()}</span>
                  </div>
                </div>
                <div className="text-xs text-gray-500 text-center mt-2">
                  Race {raceId} • Campaign bonus increases with each race!
                </div>
              </div>
            </div>
            
            {/* AUTOSAVE STATUS */}
            <div className="bg-gradient-to-r from-green-600 to-blue-600 border-4 border-green-400 rounded-lg p-4 mb-6 text-center">
              <div className="text-2xl font-minecraft text-green-100 mb-2">
                ⚡ AUTOSAVE ENABLED
              </div>
              <div className="text-lg font-minecraft text-green-200 mb-1">
                {isAuthenticated ? "Progress automatically saved to your account!" : "Progress saved locally - create an account for cloud backup!"}
              </div>
              {!isAuthenticated && (
                <div className="text-sm text-green-100 mt-2">
                  Sign up to sync your progress across devices
                </div>
              )}
            </div>
            
            <div className="flex justify-center space-x-4">
              <PixelButton onClick={onBackToMenu}>
                Continue Campaign
              </PixelButton>
            </div>
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
}