import { useState, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { generateAvatar } from "@/lib/utils";

interface PlayerProfile {
  id: string;
  username: string;
  xp: number;
  level: number;
  racesWon: number;
  totalRaces: number;
  avgWpm: number;
  accuracy: number;
  promptsAdded: number;
  chickenName: string;
  chickenType: string;
  jockeyType: string;
  trailType: string;
}

interface Player {
  id: string;
  username: string;
  level: number;
  wpm: number;
  status: "waiting" | "ready" | "typing" | "finished";
  progress: number;
  isCurrentPlayer: boolean;
  chickenType: string;
  jockeyType: string;
  color: string;
}

interface RaceResult {
  id: string;
  username: string;
  position: number;
  wpm: number;
  accuracy: number;
  isCurrentPlayer: boolean;
  xpGained: number;
}

export function useRace(socket: WebSocket | null) {
  // Fetch player profile
  const { data: profile } = useQuery<PlayerProfile>({
    queryKey: ["/api/profile"],
    retry: false, // Don't retry auth failures
    gcTime: 0 // Don't cache errors
  });
  
  // Race state
  const [isRaceActive, setIsRaceActive] = useState(false);
  const [raceStartTime, setRaceStartTime] = useState<number | null>(null);
  const [currentPrompt, setCurrentPrompt] = useState("");
  const [players, setPlayers] = useState<Player[]>([]);
  const [playerProgress, setPlayerProgress] = useState(0);
  const [raceResults, setRaceResults] = useState<RaceResult[]>([]);
  const [isWinner, setIsWinner] = useState(false);
  
  // Handle WebSocket messages
  useEffect(() => {
    if (!socket) return;
    
    const handleMessage = (event: MessageEvent) => {
      try {
        const message = JSON.parse(event.data);
        
        switch (message.type) {
          case "player_list":
            setPlayers(message.players.map((player: any) => ({
              ...player,
              isCurrentPlayer: player.id === profile?.id,
              color: generateAvatar(player.id, player.username),
            })));
            break;
            
          case "race_start":
            setIsRaceActive(true);
            setRaceStartTime(Date.now());
            setCurrentPrompt(message.prompt);
            break;
            
          case "player_progress":
            setPlayers(prev => prev.map(player => 
              player.id === message.playerId 
                ? { ...player, progress: message.progress, status: "typing" }
                : player
            ));
            break;
            
          case "player_finished":
            setPlayers(prev => prev.map(player => 
              player.id === message.playerId 
                ? { ...player, progress: 100, status: "finished" }
                : player
            ));
            break;
            
          case "race_end":
            setIsRaceActive(false);
            
            console.log("Received race results:", message.results);
            
            // Check if results array is valid
            if (Array.isArray(message.results) && message.results.length > 0) {
              // Make sure we have unique player entries
              const processedPlayers = new Set();
              const uniqueResults = [];
              
              for (const result of message.results) {
                if (!processedPlayers.has(result.id)) {
                  uniqueResults.push({
                    ...result,
                    isCurrentPlayer: result.id === profile?.id,
                  });
                  processedPlayers.add(result.id);
                }
              }
              
              // Sort by position
              uniqueResults.sort((a, b) => a.position - b.position);
              setRaceResults(uniqueResults);
            } else {
              console.error("Invalid race results received:", message.results);
            }
            
            // Check if current player is the winner
            if (message.winnerId === profile?.id) {
              setIsWinner(true);
            }
            break;
        }
      } catch (error) {
        console.error("Error handling WebSocket message:", error);
      }
    };
    
    socket.addEventListener("message", handleMessage);
    
    return () => {
      socket.removeEventListener("message", handleMessage);
    };
  }, [socket, profile?.id]);
  
  // Update player's progress
  const updateProgress = useCallback((progress: number) => {
    setPlayerProgress(progress);
    
    if (socket?.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({
        type: "update_progress",
        progress,
      }));
    }
  }, [socket]);
  
  // Join race as an authenticated player with optional customization
  const joinRace = useCallback((mode: string, customization?: { chickenType: string, jockeyType: string }) => {
    if (socket?.readyState === WebSocket.OPEN) {
      try {
        // If authenticated user with valid profile
        if (profile && profile.id) {
          console.log('Joining as authenticated user:', profile.username);
          socket.send(JSON.stringify({
            type: "join_race",
            mode,
            player: {
              id: profile.id,
              username: profile.username || 'Player',
              level: profile.level || 1,
              wpm: profile.avgWpm || 0,
              chickenType: customization?.chickenType || profile.chickenType || "racer01",
              jockeyType: customization?.jockeyType || profile.jockeyType || "combined",
            },
          }));
        } 
        // If guest user or invalid profile
        else {
          // Get custom chicken data from session storage
          const playerProfile = getPlayerProfileFromSession();
          const guestId = `guest_${Math.floor(Math.random() * 10000)}`;
          
          console.log('Joining as guest with chicken:', 
            customization?.chickenType || playerProfile.chickenType);
          
          socket.send(JSON.stringify({
            type: "player_ready",
            guestId,
            guestName: playerProfile.username || `Guest${Math.floor(Math.random() * 10000)}`,
            chickenType: customization?.chickenType || playerProfile.chickenType || "racer01", 
            jockeyType: customization?.jockeyType || playerProfile.jockeyType || "combined"
          }));
        }
      } catch (error) {
        // Fallback if anything goes wrong
        console.error("Error joining race:", error);
        const guestId = `guest_${Math.floor(Math.random() * 10000)}`;
        
        socket.send(JSON.stringify({
          type: "player_ready",
          guestId,
          guestName: `Player${Math.floor(Math.random() * 10000)}`,
          chickenType: "racer01",
          jockeyType: "combined"
        }));
      }
    }
  }, [socket, profile]);
  
  // Join race as a guest player
  const joinAsGuest = useCallback((guestName?: string) => {
    if (socket?.readyState === WebSocket.OPEN) {
      // Get player profile from session storage to include customization
      const playerProfile = getPlayerProfileFromSession();
      const guestId = `guest_${Math.floor(Math.random() * 10000)}`;
      
      // Log the chicken type being sent
      console.log('Joining race with chicken:', playerProfile.chickenType);
      
      socket.send(JSON.stringify({
        type: "player_ready",
        guestId,
        guestName: guestName || `Guest${Math.floor(Math.random() * 10000)}`,
        chickenType: playerProfile.chickenType || "racer01",
        jockeyType: "combined" // Using combined sprites
      }));
    }
  }, [socket]);
  
  // Helper function to get player profile from session
  function getPlayerProfileFromSession() {
    try {
      const storedProfile = localStorage.getItem('cjsr_player_profile');
      if (storedProfile) {
        return JSON.parse(storedProfile);
      }
    } catch (error) {
      console.error('Error accessing player profile:', error);
    }
    
    // Default profile if none found
    return {
      chickenType: "racer01",
      jockeyType: "steve",
      username: `Player${Math.floor(Math.random() * 10000)}`
    };
  }
  
  // Add NPC opponent to the race
  const addNpcOpponent = useCallback((difficulty: 'peaceful' | 'easy' | 'normal' | 'hard' | 'insane') => {
    if (socket?.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({
        type: "add_npc",
        difficulty
      }));
    }
  }, [socket]);
  
  // Leave race
  const leaveRace = useCallback(() => {
    if (socket?.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({
        type: "leave_race",
      }));
    }
  }, [socket]);
  
  // Finish race
  const finishRace = useCallback((stats: { wpm: number; accuracy: number; time: number }) => {
    if (socket?.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({
        type: "finish_race",
        stats,
      }));
    }
  }, [socket]);
  
  // Reset race state
  const resetRace = useCallback(() => {
    setIsRaceActive(false);
    setRaceStartTime(null);
    setCurrentPrompt("");
    setPlayerProgress(0);
    setRaceResults([]);
    setIsWinner(false);
  }, []);
  
  return {
    playerProfile: profile,
    isRaceActive,
    raceStartTime,
    currentPrompt,
    players,
    playerProgress,
    raceResults,
    isWinner,
    updateProgress,
    joinRace,
    joinAsGuest,
    addNpcOpponent,
    leaveRace,
    finishRace,
    resetRace,
  };
}
