import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { PixelButton } from "@/components/ui/pixel-button";
import { Card } from "@/components/ui/card";
import { ChickenAvatar } from "@/components/ui/chicken-avatar";
import { Users, Play, Keyboard, ArrowRight, Info, Settings } from "lucide-react";
import { initializeWebSocket } from "@/lib/websocket";

// Multiplayer lobby page - central hub for racing
export default function MultiplayerLobbyPage() {
  const [, setLocation] = useLocation();
  const [activePlayers, setActivePlayers] = useState<number>(0);
  const [username, setUsername] = useState<string>("");
  const [showWelcome, setShowWelcome] = useState(true);
  const [activeLobbies, setActiveLobbies] = useState([
    {
      id: "general",
      name: "General Lobby",
      players: 0,
      status: "open",
      skill: "all"
    },
    {
      id: "beginner",
      name: "Beginner Races",
      players: 0,
      status: "open",
      skill: "beginner"
    },
    {
      id: "advanced",
      name: "Advanced Racers",
      players: 0,
      status: "open",
      skill: "advanced"
    }
  ]);
  
  // Initialize websocket and player count
  useEffect(() => {
    // Try to load username from localStorage
    const savedUsername = localStorage.getItem('username');
    if (savedUsername) {
      setUsername(savedUsername);
      setShowWelcome(false);
    }
    
    // Initialize WebSocket connection
    initializeWebSocket();
    
    // Start polling for active players
    const interval = setInterval(() => {
      const count = Math.floor(Math.random() * 25) + 5; // Simulate 5-30 active players
      setActivePlayers(count);
      
      // Update lobby counts
      setActiveLobbies(prev => prev.map(lobby => {
        // Assign some random distribution of players to different lobbies
        const lobbyCount = Math.floor(Math.random() * Math.min(count, 7));
        return {...lobby, players: lobbyCount};
      }));
    }, 5000);
    
    return () => {
      clearInterval(interval);
    };
  }, []);
  
  // Start a race
  const handleStartRace = (lobbyId: string) => {
    // Store the lobby ID for the race component to use
    localStorage.setItem('selectedLobby', lobbyId);
    
    // Navigate to the race
    setLocation('/multiplayer/race-accurate');
  };
  
  // Save username and continue
  const handleSaveUsername = () => {
    if (username.trim()) {
      localStorage.setItem('username', username);
      setShowWelcome(false);
    }
  };
  
  return (
    <div className="flex flex-col min-h-screen bg-dark-950">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-6 max-w-6xl">
        {showWelcome ? (
          <div className="max-w-md mx-auto bg-dark-900 rounded-lg p-6 minecraft-border">
            <h1 className="text-2xl font-minecraft text-primary mb-4 text-center">WELCOME TO MULTIPLAYER</h1>
            
            <p className="text-gray-300 mb-6 text-center">
              Join other players in competitive typing races! Enter a username to get started.
            </p>
            
            <div className="mb-6">
              <label className="block text-sm font-minecraft text-gray-400 mb-2">YOUR RACING NAME:</label>
              <input
                type="text"
                className="w-full p-3 bg-dark-800 border-2 border-primary text-white rounded-md"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                maxLength={16}
                placeholder="Enter a username"
              />
            </div>
            
            <div className="text-center">
              <PixelButton onClick={handleSaveUsername} disabled={!username.trim()}>
                Start Racing
              </PixelButton>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-minecraft text-primary">MULTIPLAYER LOBBY</h1>
              <div className="bg-dark-900 px-3 py-1 rounded-md flex items-center">
                <Users className="w-4 h-4 text-primary mr-2" />
                <span className="text-gray-200">
                  {activePlayers} Active Players
                </span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Lobbies list */}
              <div className="space-y-4">
                <h2 className="text-xl font-minecraft text-gray-300 mb-2">ACTIVE LOBBIES</h2>
                
                {activeLobbies.map(lobby => (
                  <Card key={lobby.id} className="bg-dark-900 border-dark-700 overflow-hidden">
                    <div className="p-4">
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="font-minecraft text-primary">{lobby.name}</h3>
                        <div className="bg-dark-800 px-2 py-1 rounded-md text-xs">
                          <span className="text-gray-300">
                            {lobby.players} {lobby.players === 1 ? 'player' : 'players'}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="bg-dark-800 px-2 py-1 rounded-md text-xs text-gray-300">
                            {lobby.skill === 'beginner' ? 'For newcomers' : 
                             lobby.skill === 'advanced' ? 'Experienced typists' : 'All skill levels'}
                          </div>
                        </div>
                        
                        <PixelButton size="sm" onClick={() => handleStartRace(lobby.id)}>
                          <Play className="w-4 h-4 mr-1" />
                          Join Race
                        </PixelButton>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
              
              {/* Quick access section */}
              <div className="space-y-4">
                <h2 className="text-xl font-minecraft text-gray-300 mb-2">QUICK ACCESS</h2>
                
                <Card className="bg-dark-900 border-dark-700">
                  <div className="p-4">
                    <h3 className="font-minecraft text-blue-400 mb-2">INSTANT MATCH</h3>
                    <p className="text-gray-300 text-sm mb-4">
                      Start typing immediately in a random lobby with other players.
                    </p>
                    <PixelButton onClick={() => handleStartRace('general')} className="w-full">
                      <Keyboard className="w-4 h-4 mr-2" />
                      Quick Race
                    </PixelButton>
                  </div>
                </Card>
                
                <Card className="bg-dark-900 border-dark-700">
                  <div className="p-4">
                    <h3 className="font-minecraft text-yellow-400 mb-2">CUSTOM RACE</h3>
                    <p className="text-gray-300 text-sm mb-4">
                      Create a private race and invite friends with a custom link.
                    </p>
                    <PixelButton variant="secondary" onClick={() => setLocation('/multiplayer/custom')} className="w-full">
                      <Settings className="w-4 h-4 mr-2" />
                      Create Custom Race
                    </PixelButton>
                  </div>
                </Card>
                
                <Card className="bg-dark-900 border-dark-700">
                  <div className="p-4 flex items-center justify-between">
                    <div>
                      <h3 className="font-minecraft text-primary mb-1">Return to Campaign</h3>
                      <p className="text-gray-400 text-sm">
                        Continue your single-player journey
                      </p>
                    </div>
                    <PixelButton variant="outline" size="sm" onClick={() => setLocation('/campaign')}>
                      <ArrowRight className="w-4 h-4" />
                    </PixelButton>
                  </div>
                </Card>
              </div>
            </div>
            
            {/* Player section at bottom */}
            <div className="bg-dark-900 p-4 rounded-lg minecraft-border mt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <ChickenAvatar 
                    chickenType="html_steve" 
                    jockeyType="html_steve"
                    size="sm"
                    animation="idle"
                  />
                  <div>
                    <div className="font-minecraft text-primary">{username}</div>
                    <div className="text-xs text-gray-400">Ready to race</div>
                  </div>
                </div>
                
                <div>
                  <PixelButton 
                    variant="outline" 
                    size="sm"
                    onClick={() => setLocation('/profile')}
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Customize
                  </PixelButton>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
}