import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { PixelButton } from "@/components/ui/pixel-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChickenAvatar } from "@/components/ui/chicken-avatar";
import { apiRequest } from "@/lib/queryClient";
import { RefreshCw, ArrowLeft, Clock } from "lucide-react";

interface Player {
  id: number;
  username: string;
  level: number;
  wpm: number;
  accuracy: number;
  isReady: boolean;
  isYou: boolean;
  chickenType: string;
  jockeyType: string;
}

interface RaceDetails {
  mode: string;
  difficulty: string;
  textLength: number;
  currentPlayers: number;
  maxPlayers: number;
  startingSoon: boolean;
  timeRemaining?: number;
}

export default function MultiplayerLobby() {
  const [, setLocation] = useLocation();
  const [players, setPlayers] = useState<Player[]>([]);
  const [raceDetails, setRaceDetails] = useState<RaceDetails>({
    mode: "Public Match",
    difficulty: "Medium",
    textLength: 100,
    currentPlayers: 4,
    maxPlayers: 8,
    startingSoon: true,
    timeRemaining: 15,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [currentPlayerId, setCurrentPlayerId] = useState<number | null>(null);

  // Emergency exit function
  const forceExit = () => {
    // Stop all audio
    const audios = document.querySelectorAll('audio');
    audios.forEach(audio => {
      audio.pause();
      audio.currentTime = 0;
    });
    
    // Clear any intervals/timeouts
    window.location.href = '/';
  };

  // Add escape key handler
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        forceExit();
      }
    };
    
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  // Initialize mock data for demo
  useEffect(() => {
    document.title = "Multiplayer Lobby - Chicken Jockey Scribe Racer";
    
    // Simulate loading data from API
    setIsLoading(true);
    
    // Get the current user's profile
    apiRequest("GET", "/api/profile")
      .then(response => {
        if (response.ok) {
          return response.json();
        }
        return null;
      })
      .then(profile => {
        if (profile) {
          setCurrentPlayerId(profile.id);
          
          // Connect to real multiplayer lobby via WebSocket
          const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
          const wsUrl = `${protocol}//${window.location.host}/ws`;
          const socket = new WebSocket(wsUrl);
          
          socket.onopen = () => {
            console.log("🔗 Connected to multiplayer lobby!");
            // Join the multiplayer lobby
            socket.send(JSON.stringify({
              type: "join_lobby",
              mode: "multiplayer-only",
              player: {
                id: profile.id,
                username: profile.username,
                level: profile.level || 1,
                faction: profile.current_faction || 'd2',
                chickenType: profile.chicken_type || "html_steve",
                jockeyType: profile.jockey_type || "html_steve"
              }
            }));
          };
          
          socket.onmessage = (event) => {
            const message = JSON.parse(event.data);
            console.log("📨 Lobby message:", message);
            
            if (message.type === "lobby_update") {
              // Update players list with real connected players
              setPlayers(message.players.map((p: any) => ({
                id: p.id,
                username: p.username,
                level: 1,
                wpm: 0,
                accuracy: 0,
                isReady: true,
                isYou: p.id === profile.id,
                chickenType: p.chickenType || "html_steve",
                jockeyType: p.jockeyType || "html_steve"
              })));
            } else if (message.type === "race_start") {
              // Navigate to the actual race
              window.location.href = `/multiplayer/race?mode=multiplayer-only&prompt=${encodeURIComponent(message.prompt)}`;
            }
          };
          
          // Initial player setup
          const realPlayers: Player[] = [
            {
              id: profile.id,
              username: profile.username,
              level: profile.level || 1,
              wpm: profile.avg_wpm || Math.floor(Math.random() * 40) + 35,
              accuracy: profile.accuracy || Math.floor(Math.random() * 20) + 75,
              isReady: true,
              isYou: true,
              chickenType: profile.chicken_type || "white",
              jockeyType: profile.jockey_type || "steve"
            },
          ];
          
          // Start with just the current player until lobby updates arrive
          setPlayers(realPlayers);
        } else {
          // No profile, create a guest player
          const guestPlayers: Player[] = [
            {
              id: 999,
              username: "Guest" + Math.floor(Math.random() * 1000),
              level: 1,
              wpm: 0,
              accuracy: 0,
              isReady: true,
              isYou: true,
              chickenType: "white",
              jockeyType: "steve"
            },
            {
              id: 101,
              username: "SpeedTyper",
              level: 15,
              wpm: 95,
              accuracy: 98,
              isReady: false,
              isYou: false,
              chickenType: "black",
              jockeyType: "auto"
            },
            {
              id: 102,
              username: "TypeRacer2000",
              level: 8,
              wpm: 75,
              accuracy: 96,
              isReady: false,
              isYou: false,
              chickenType: "white",
              jockeyType: "matikah"
            },
            {
              id: 103,
              username: "QwertySmashеr",
              level: 12,
              wpm: 82,
              accuracy: 94,
              isReady: false,
              isYou: false,
              chickenType: "brown",
              jockeyType: "steve"
            }
          ];
          
          setPlayers(guestPlayers);
        }
        
        setIsLoading(false);
      })
      .catch(err => {
        console.error("Error fetching profile:", err);
        setIsLoading(false);
      });
      
    // Countdown timer
    const timer = setInterval(() => {
      setRaceDetails(prev => {
        if (prev.timeRemaining && prev.timeRemaining > 0) {
          return { ...prev, timeRemaining: prev.timeRemaining - 1 };
        } else if (prev.timeRemaining === 0) {
          // Start race when timer reaches 0
          handleEnterRace();
          clearInterval(timer);
        }
        return prev;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);
  
  const handleRefresh = () => {
    // Simulate refreshing the lobby
    setIsLoading(true);
    
    setTimeout(() => {
      // Add or remove a random player
      if (Math.random() > 0.5 && players.length < 7) {
        const newPlayer: Player = {
          id: 104 + players.length,
          username: "Player" + Math.floor(Math.random() * 1000),
          level: Math.floor(Math.random() * 20) + 1,
          wpm: Math.floor(Math.random() * 60) + 40,
          accuracy: Math.floor(Math.random() * 20) + 80,
          isReady: Math.random() > 0.5,
          isYou: false,
          chickenType: Math.random() > 0.5 ? "white" : "brown",
          jockeyType: Math.random() > 0.5 ? "steve" : "auto"
        };
        
        setPlayers([...players, newPlayer]);
      }
      
      setIsLoading(false);
    }, 800);
  };
  
  const handleBack = () => {
    setLocation("/game-menu");
  };
  
  const handleEnterRace = () => {
    setLocation("/multiplayer/race");
  };

  return (
    <div className="min-h-screen bg-dark text-white flex flex-col">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8 max-w-6xl">
        {/* EMERGENCY EXIT BUTTON */}
        <div className="mb-4 p-4 bg-red-900/50 border border-red-500 rounded-lg">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-red-400 font-bold">STUCK IN LOBBY?</h2>
              <p className="text-red-300 text-sm">Click here to force exit and stop all music</p>
            </div>
            <Button 
              onClick={forceExit}
              className="bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-3"
            >
              EMERGENCY EXIT
            </Button>
          </div>
        </div>

        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-minecraft text-primary">MULTIPLAYER LOBBY</h1>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="icon"
              onClick={handleRefresh}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span className="sr-only">Refresh</span>
            </Button>
            <Button 
              variant="outline" 
              size="icon"
              onClick={handleBack}
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back</span>
            </Button>
          </div>
        </div>
        
        <p className="text-secondary mb-8">Join a typing race with up to 7 other players</p>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column - Race details */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-dark-800 p-6 rounded-lg pixel-border">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-minecraft text-primary">NEXT RACE</h2>
                {raceDetails.startingSoon && (
                  <Badge variant="outline" className="bg-green-900/40 text-green-400 border-green-500 flex items-center">
                    <Clock className="w-3 h-3 mr-1" />
                    Starting Soon
                  </Badge>
                )}
              </div>
              
              <div className="bg-dark-900 p-4 rounded mb-6">
                <h3 className="text-md text-secondary mb-4">RACE DETAILS</h3>
                
                <div className="grid grid-cols-2 gap-y-4">
                  <div>
                    <p className="text-gray-400 text-sm">Mode:</p>
                    <p className="text-white">{raceDetails.mode}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Difficulty:</p>
                    <p className="text-white">{raceDetails.difficulty}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Text Length:</p>
                    <p className="text-white">~{raceDetails.textLength} words</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Players:</p>
                    <p className="text-white">{raceDetails.currentPlayers} / {raceDetails.maxPlayers}</p>
                  </div>
                </div>
              </div>
              
              <PixelButton 
                onClick={handleEnterRace}
                className="w-full flex items-center justify-center"
              >
                ▶ ENTER RACE NOW
              </PixelButton>
            </div>
            
            <div className="bg-dark-800 p-6 rounded-lg pixel-border">
              <h2 className="text-2xl font-minecraft text-primary mb-4">LOBBY CHAT</h2>
              <div className="bg-dark-900 p-4 rounded h-40 flex items-center justify-center">
                <p className="text-gray-400 italic">Chat feature coming soon!</p>
              </div>
            </div>
          </div>
          
          {/* Right column - Player list */}
          <div>
            <div className="bg-dark-800 p-6 rounded-lg pixel-border">
              <div className="flex items-center mb-4">
                <h2 className="text-2xl font-minecraft text-primary">PLAYERS IN LOBBY</h2>
              </div>
              
              <div className="space-y-2">
                {players.map(player => (
                  <div 
                    key={player.id}
                    className={`flex items-center p-3 rounded ${
                      player.isYou ? 'bg-blue-900/20 border border-blue-800/50' : 'bg-dark-900'
                    }`}
                  >
                    <div className="mr-3">
                      <ChickenAvatar 
                        chickenType={player.chickenType} 
                        jockeyType={player.jockeyType}
                        size="sm" 
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center">
                        <p className="font-medium text-white">{player.username}</p>
                        {player.isYou && (
                          <Badge variant="outline" className="ml-2 text-xs bg-blue-900/20 text-blue-300 border-blue-700">
                            You
                          </Badge>
                        )}
                      </div>
                      <div className="text-xs text-gray-400">
                        Level {player.level} • WPM: {player.wpm} • Acc: {player.accuracy}%
                      </div>
                    </div>
                    <div>
                      <Badge 
                        variant={player.isReady ? "default" : "outline"} 
                        className={player.isReady ? 
                          "bg-green-900/60 text-green-300 border-green-700" : 
                          "bg-transparent text-gray-400 border-gray-600"
                        }
                      >
                        {player.isReady ? "Ready" : "Waiting"}
                      </Badge>
                    </div>
                  </div>
                ))}
                
                {/* Empty slots */}
                {Array(Math.max(0, raceDetails.maxPlayers - players.length)).fill(0).map((_, index) => (
                  <div key={`empty-${index}`} className="flex items-center p-3 rounded bg-dark-900/50">
                    <div className="text-center w-full text-gray-500">
                      Waiting for player...
                    </div>
                  </div>
                ))}
              </div>
              
              {raceDetails.timeRemaining !== undefined && raceDetails.timeRemaining > 0 && (
                <div className="mt-4 bg-dark-900 p-3 rounded text-center">
                  <p className="text-gray-400 text-sm">Race starting in</p>
                  <p className="text-2xl font-minecraft text-primary">{raceDetails.timeRemaining}s</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}