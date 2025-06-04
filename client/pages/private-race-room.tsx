import { useState, useEffect, useRef } from "react";
import { useLocation, useParams } from "wouter";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Card } from "@/components/ui/card";
import { PixelButton } from "@/components/ui/pixel-button";
import { useToast } from "@/hooks/use-toast";
import { useWebSocket } from "@/hooks/use-websocket";
import { Users, Settings, Copy, Crown, Timer, Trophy } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { ChickenAvatar } from "@/components/ui/chicken-avatar";

interface PrivateRoomPlayer {
  id: string;
  username: string;
  isHost: boolean;
  isReady: boolean;
  progress: number;
  wpm: number;
  accuracy: number;
  chickenType: string;
  jockeyType: string;
  finishTime?: number;
  position?: number;
}

interface PrivateRoomData {
  id: string;
  name: string;
  host: string;
  customPrompt: string;
  maxPlayers: number;
  status: "waiting" | "countdown" | "racing" | "finished";
  settings: {
    allowSpectators: boolean;
    requireReady: boolean;
  };
}

export default function PrivateRaceRoom() {
  const params = useParams();
  const roomId = (params as any).roomId;
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  // Race state
  const [roomData, setRoomData] = useState<PrivateRoomData | null>(null);
  const [players, setPlayers] = useState<PrivateRoomPlayer[]>([]);
  const [isReady, setIsReady] = useState(false);
  const [typedText, setTypedText] = useState("");
  const [currentTime, setCurrentTime] = useState(0);
  const [raceStartTime, setRaceStartTime] = useState<number | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [raceComplete, setRaceComplete] = useState(false);
  const [raceResults, setRaceResults] = useState<any>(null);
  const [showResults, setShowResults] = useState(false);
  
  // Get user profile
  const { data: profile } = useQuery({
    queryKey: ["/api/profile"],
    retry: false,
  });

  const isLoggedIn = !!profile;
  const username = (profile as any)?.username || "Guest";
  const userId = (profile as any)?.id;
  const currentPlayer = players.find(p => p.username === username);
  
  // Check if this player is the host by comparing with room host ID
  const isHost = roomData?.host === String(userId);
  
  // Reduce debug spam
  const debugKey = `${username}-${userId}-${isHost}`;
  const lastDebugRef = useRef("");
  if (lastDebugRef.current !== debugKey) {
    lastDebugRef.current = debugKey;
    console.log("Host status changed:", { username, isHost });
  }
  
  // WebSocket connection
  const { socket, connected, sendMessage } = useWebSocket();

  useEffect(() => {
    document.title = `Private Race Room - CJSR`;
    
    if (!roomId || !profile) return;
    
    // Initialize room data immediately with defaults to prevent loading screen
    setRoomData({
      id: roomId,
      name: `Private Room ${roomId}`,
      host: String((profile as any).id),
      customPrompt: "The quick brown fox jumps over the lazy dog. This sample text will be replaced when the race starts.",
      maxPlayers: 8,
      status: "waiting",
      settings: {
        allowSpectators: true,
        requireReady: true
      }
    });
    
    // Also initialize current player with proper defaults
    setPlayers([{
      id: String((profile as any).id),
      username: (profile as any).username,
      isHost: true,
      isReady: false,
      progress: 0,
      wpm: 0,
      accuracy: 100,
      chickenType: (profile as any).chicken_type || "html_steve",
      jockeyType: (profile as any).jockey_type || "steve"
    }]);
    
    // Join the private room via WebSocket when connected
    if (connected) {
      sendMessage({
        type: "join_private_room",
        roomId,
        player: {
          id: (profile as any).id,
          username: (profile as any).username,
          level: (profile as any).level || 1,
          wpm: (profile as any).wpm || 60,
          chickenType: (profile as any).chicken_type || "html_steve",
          jockeyType: (profile as any).jockey_type || "steve",
          faction: (profile as any).current_faction || "none"
        }
      });
    }
  }, [roomId, connected, profile, sendMessage]);

  // WebSocket message handling for real-time updates
  useEffect(() => {
    if (!socket) return;

    const handleMessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        
        switch (data.type) {
          case "joined_private_room":
            toast({
              title: "Joined Room!",
              description: "Successfully connected to the private race room."
            });
            break;
            
          case "private_room_update":
            // Update room data and player list - replace completely to avoid duplicates
            if (data.players) {
              setPlayers(data.players.map((player: any) => ({
                ...player,
                chickenType: player.chickenType || "html_steve",
                jockeyType: player.jockeyType || "steve"
              })));
            }
            if (data.roomData) {
              setRoomData(prev => ({
                ...prev,
                ...data.roomData,
                status: "waiting"
              }));
            }
            break;
            
          case "race_countdown":
            setCountdown(data.countdown);
            setRoomData(prev => prev ? { ...prev, status: "countdown" } : null);
            break;
            
          case "race_started":
            console.log(`🎯 CLIENT: Received race_started with prompt: "${data.promptText?.substring(0, 50)}..."`);
            
            // Ensure we have valid prompt text before starting race
            if (!data.promptText) {
              console.error("❌ CLIENT: No prompt text in race_started message");
              toast({
                title: "Race Error",
                description: "No race text received. Please try again.",
                variant: "destructive"
              });
              return;
            }
            
            // CRITICAL FIX: Force update room data with new prompt text
            setRoomData(prev => {
              const newRoomData = prev ? { 
                ...prev, 
                status: "racing",
                customPrompt: data.promptText 
              } : {
                id: roomId,
                name: `Private Room ${roomId}`,
                host: String(profile?.id || 0),
                customPrompt: data.promptText,
                maxPlayers: 8,
                status: "racing",
                settings: {
                  allowSpectators: true,
                  requireReady: true
                }
              };
              
              console.log(`🔄 CLIENT: Updated room data with prompt: "${newRoomData.customPrompt.substring(0, 50)}..."`);
              return newRoomData;
            });
            
            setRaceStartTime(data.startTime);
            setCountdown(null);
            
            console.log(`✅ CLIENT: Race started successfully with prompt: "${data.promptText.substring(0, 50)}..."`);
            break;
            
          case "player_progress":
            // Update individual player progress during race
            setPlayers(prev => prev.map(p => 
              p.id === data.playerId 
                ? { ...p, progress: data.progress, wpm: data.wpm, accuracy: data.accuracy }
                : p
            ));
            break;
            
          case "race_finished":
            setRoomData(prev => prev ? { ...prev, status: "finished" } : null);
            setShowResults(true);
            break;
            
          case "error":
            toast({
              title: "Error",
              description: data.message,
              variant: "destructive"
            });
            break;
        }
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    };

    socket.addEventListener("message", handleMessage);
    return () => socket.removeEventListener("message", handleMessage);
  }, [socket, toast]);

  // Timer effect for race duration
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (roomData?.status === "racing" && raceStartTime) {
      timer = setInterval(() => {
        setCurrentTime(Date.now() - raceStartTime);
      }, 100);
    }
    
    return () => clearInterval(timer);
  }, [roomData?.status, raceStartTime]);

  // Countdown effect
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (countdown !== null && countdown > 0) {
      timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
    } else if (countdown === 0) {
      // Start race
      setRoomData(prev => prev ? { ...prev, status: "racing" } : null);
      setRaceStartTime(Date.now());
      setCountdown(null);
    }
    
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleToggleReady = () => {
    if (!isLoggedIn || !profile) {
      toast({
        title: "Login Required",
        description: "Please log in to participate in private races.",
        variant: "destructive"
      });
      return;
    }
    
    const newReadyState = !isReady;
    setIsReady(newReadyState);
    
    // Send ready state to server via WebSocket
    sendMessage({
      type: "private_room_ready",
      roomId,
      playerId: profile.id,
      isReady: newReadyState
    });
    
    toast({
      title: newReadyState ? "Ready!" : "Not Ready",
      description: newReadyState ? "You are ready to race." : "You are no longer ready."
    });
  };

  const handleStartRace = () => {
    if (!isHost || !profile) {
      toast({
        title: "Host Only",
        description: "Only the room host can start the race.",
        variant: "destructive"
      });
      return;
    }

    // For now, allow race to start even without ready players to fix the freezing issue
    // Start countdown immediately
    setCountdown(3);
    setRoomData(prev => prev ? { ...prev, status: "countdown" } : null);
    
    // Set a sample race prompt for testing
    const samplePrompts = [
      "The quick brown fox jumps over the lazy dog. While the five boxing wizards jump quickly, a quaint village tavern hosts jovial miners.",
      "As the sun sets over the mountain range, a flock of birds takes flight across the amber sky, creating a mesmerizing pattern.",
      "Programming is the art of telling a computer what to do. Good programmers write code that humans can understand.",
      "The ancient scrolls revealed the secret path through the enchanted forest, where magical creatures guarded the crystal fountain."
    ];
    
    const selectedPrompt = samplePrompts[Math.floor(Math.random() * samplePrompts.length)];
    
    setTimeout(() => {
      setRoomData(prev => prev ? { 
        ...prev, 
        status: "racing",
        customPrompt: selectedPrompt 
      } : null);
      setRaceStartTime(Date.now());
    }, 3000);

    toast({
      title: "Starting Race!",
      description: "Initiating countdown for all players..."
    });

    // Try to send WebSocket message if available
    if (connected && sendMessage) {
      sendMessage({
        type: "start_private_race",
        roomId,
        hostId: (profile as any).id
      });
    }
  };

  // Character normalization for accented characters
  const normalizeChar = (char: string): string => {
    const charMap: { [key: string]: string } = {
      'ă': 'a', 'ā': 'a', 'á': 'a', 'à': 'a', 'â': 'a', 'ä': 'a', 'ã': 'a',
      'ĕ': 'e', 'ē': 'e', 'é': 'e', 'è': 'e', 'ê': 'e', 'ë': 'e',
      'ĭ': 'i', 'ī': 'i', 'í': 'i', 'ì': 'i', 'î': 'i', 'ï': 'i',
      'ŏ': 'o', 'ō': 'o', 'ó': 'o', 'ò': 'o', 'ô': 'o', 'ö': 'o', 'õ': 'o',
      'ŭ': 'u', 'ū': 'u', 'ú': 'u', 'ù': 'u', 'û': 'u', 'ü': 'u',
      'ń': 'n', 'ñ': 'n', 'ç': 'c'
    };
    return charMap[char] || char;
  };

  const normalizeText = (text: string): string => {
    return text.split('').map(normalizeChar).join('');
  };

  const handleTextInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (roomData?.status !== "racing") return;
    
    const value = e.target.value;
    const prompt = roomData.customPrompt;
    
    // Normalize both the input and prompt for comparison
    const normalizedValue = normalizeText(value);
    const normalizedPrompt = normalizeText(prompt);
    
    // Only allow typing characters that match the prompt (with normalization)
    if (normalizedValue.length <= normalizedPrompt.length && normalizedPrompt.startsWith(normalizedValue)) {
      setTypedText(value);
      
      // Calculate progress
      const progress = (value.length / prompt.length) * 100;
      
      // Calculate WPM
      const timeInMinutes = currentTime / 60000;
      const wordsTyped = value.trim().split(' ').length;
      const wpm = timeInMinutes > 0 ? Math.round(wordsTyped / timeInMinutes) : 0;
      
      // Calculate accuracy
      let correctChars = 0;
      for (let i = 0; i < value.length; i++) {
        if (value[i] === prompt[i]) correctChars++;
      }
      const accuracy = value.length > 0 ? Math.round((correctChars / value.length) * 100) : 100;
      
      // Update player progress
      setPlayers(prev => prev.map(p => 
        p.username === username 
          ? { ...p, progress, wpm, accuracy }
          : p
      ));
      
      // Check if race is complete (using normalized text comparison)
      if (normalizedValue === normalizedPrompt && !raceComplete) {
        setRaceComplete(true);
        
        const finishTime = currentTime;
        const position = players.filter(p => p.finishTime !== undefined).length + 1;
        
        // Calculate XP based on position and performance
        const charactersTyped = prompt.length;
        const baseXP = charactersTyped; // 1 XP per character
        
        const positionMultipliers = {
          1: 1.0,    // 1st place gets full value
          2: 0.5,    // 2nd gets half value  
          3: 0.33,   // 3rd gets one third
          4: 0.25,   // 4th+ get 25%
        };
        
        const multiplier = positionMultipliers[Math.min(position, 4) as keyof typeof positionMultipliers] || 0.25;
        const xpGained = Math.max(1, Math.floor(baseXP * multiplier));
        
        const results = {
          wpm,
          accuracy,
          time: finishTime / 1000,
          position,
          xpGained,
          charactersTyped
        };
        
        setRaceResults(results);
        
        setPlayers(prev => prev.map(p => 
          p.username === profile?.username 
            ? { ...p, finishTime, position }
            : p
        ));
        
        // Send completion to server for XP tracking
        if (socket && socket.readyState === WebSocket.OPEN) {
          socket.send(JSON.stringify({
            type: "private_room_complete",
            roomId,
            playerId: profile?.id,
            results
          }));
        }
        
        // Show results after a brief delay
        setTimeout(() => {
          setShowResults(true);
        }, 1500);
        
        toast({
          title: `Finished! Position: ${position}`,
          description: `You completed the race in ${(finishTime / 1000).toFixed(1)} seconds!`
        });
        
        // Check if all players finished
        setTimeout(() => {
          const allFinished = players.every(p => p.finishTime !== undefined || !p.isReady);
          if (allFinished) {
            setRoomData(prev => prev ? { ...prev, status: "finished" } : null);
            setShowResults(true);
          }
        }, 1000);
      }
    }
  };

  const copyRoomLink = () => {
    const roomLink = `${window.location.origin}/private-race/${roomId}`;
    navigator.clipboard.writeText(roomLink).then(() => {
      toast({
        title: "Link Copied!",
        description: "Room invitation link copied to clipboard."
      });
    });
  };

  const leaveRoom = () => {
    setLocation('/private-races');
  };

  if (!roomData) {
    return (
      <div className="flex flex-col min-h-screen bg-dark text-white">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <p>Loading private race room...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-dark text-white">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-6">
        <div className="max-w-6xl mx-auto">
          
          {/* Beta Test Disclaimer */}
          <div className="mb-6 p-4 bg-gradient-to-r from-blue-900/50 to-purple-900/50 border border-blue-500/30 rounded-lg">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse"></div>
              <h2 className="text-lg font-minecraft text-blue-300">
                🚀 BETA TEST PREVIEW - v1.2
              </h2>
            </div>
            <p className="text-sm text-gray-300 leading-relaxed">
              You're experiencing <span className="text-blue-400 font-semibold">private race rooms</span> in early access! 
              This feature includes <span className="text-yellow-400">Art of War strategic passages</span>, 
              <span className="text-green-400">auto-finish timers</span>, and enhanced multiplayer racing. 
              Your feedback helps shape the final release! 🎯
            </p>
          </div>
          
          {/* Room Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-3xl font-minecraft text-primary">
                {roomData.name}
              </h1>
              <div className="flex gap-2">
                <PixelButton
                  onClick={copyRoomLink}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Copy className="w-4 h-4 mr-1" />
                  Invite
                </PixelButton>
                <PixelButton
                  onClick={leaveRoom}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Leave Room
                </PixelButton>
              </div>
            </div>
            
            <div className="flex items-center gap-4 text-sm text-gray-400">
              <span>Room ID: {roomData.id}</span>
              <span>Players: {players.length}/{roomData.maxPlayers}</span>
              <span className={`px-2 py-1 rounded text-xs font-medium ${
                roomData.status === "waiting" ? "bg-yellow-600" :
                roomData.status === "countdown" ? "bg-orange-600" :
                roomData.status === "racing" ? "bg-green-600" : "bg-gray-600"
              }`}>
                {roomData.status.toUpperCase()}
              </span>
            </div>
          </div>

          {/* Race Prompt */}
          <Card className="mb-6 bg-dark-800 border-primary">
            <div className="p-6">
              <h2 className="text-xl font-minecraft text-primary mb-4">Race Text</h2>
              <div className="bg-dark-900 p-4 rounded border-l-4 border-primary">
                <p className="font-mono text-lg leading-relaxed">
                  {roomData.customPrompt.split('').map((char, index) => (
                    <span
                      key={index}
                      className={
                        index < typedText.length
                          ? typedText[index] === char
                            ? "bg-green-500/30 text-green-300"
                            : "bg-red-500/30 text-red-300"
                          : index === typedText.length
                          ? "bg-yellow-500/50"
                          : "text-gray-300"
                      }
                    >
                      {char}
                    </span>
                  ))}
                </p>
              </div>
            </div>
          </Card>

          {/* Race Input */}
          {roomData.status === "racing" && (
            <Card className="mb-6 bg-dark-800 border-green-500">
              <div className="p-6">
                <h2 className="text-xl font-minecraft text-green-400 mb-4">
                  <Timer className="inline-block w-5 h-5 mr-2" />
                  Race in Progress - {(currentTime / 1000).toFixed(1)}s
                </h2>
                <input
                  type="text"
                  value={typedText}
                  onChange={handleTextInput}
                  placeholder="Start typing here..."
                  className="w-full px-4 py-3 bg-dark-900 border-2 border-green-500 rounded-lg text-white font-mono text-lg focus:outline-none focus:border-green-400"
                  autoFocus
                />
                <div className="mt-2 text-sm text-gray-400">
                  Progress: {((typedText.length / roomData.customPrompt.length) * 100).toFixed(1)}%
                </div>
              </div>
            </Card>
          )}

          {/* Countdown */}
          {countdown !== null && (
            <Card className="mb-6 bg-dark-800 border-orange-500">
              <div className="p-8 text-center">
                <div className="text-6xl font-minecraft text-orange-400 mb-4">
                  {countdown}
                </div>
                <p className="text-xl text-orange-300">Get ready to race!</p>
              </div>
            </Card>
          )}

          {/* Players List */}
          <Card className="mb-6 bg-dark-800 border-gray-600">
            <div className="p-6">
              <h2 className="text-xl font-minecraft text-primary mb-4">
                <Users className="inline-block w-5 h-5 mr-2" />
                Players ({players.length}/{roomData.maxPlayers})
              </h2>
              
              <div className="space-y-3">
                {players.map((player, index) => (
                  <div
                    key={`${player.id}-${player.username}-${index}`}
                    className={`flex items-center justify-between p-3 rounded-lg ${
                      player.username === username ? "bg-primary/20 border border-primary/50" : "bg-dark-900"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <ChickenAvatar
                        chickenType={player.chickenType}
                        jockeyType={player.jockeyType}
                        size="sm"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{player.username}</span>
                          {player.isHost && (
                            <Crown className="w-4 h-4 text-yellow-400" />
                          )}
                        </div>
                        {roomData.status === "racing" && (
                          <div className="text-sm text-gray-400">
                            {player.wpm} WPM • {player.accuracy}% accuracy
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {roomData.status === "waiting" && (
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          player.isReady ? "bg-green-600" : "bg-gray-600"
                        }`}>
                          {player.isReady ? "READY" : "NOT READY"}
                        </span>
                      )}
                      
                      {roomData.status === "racing" && (
                        <div className="w-32 bg-gray-700 rounded-full h-2">
                          <div
                            className="bg-primary h-2 rounded-full transition-all duration-200"
                            style={{ width: `${player.progress}%` }}
                          />
                        </div>
                      )}
                      
                      {player.finishTime && (
                        <div className="flex items-center gap-1 text-green-400">
                          <Trophy className="w-4 h-4" />
                          <span className="text-sm">#{player.position}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* Control Panel */}
          {roomData.status === "waiting" && (
            <Card className="bg-dark-800 border-gray-600">
              <div className="p-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-minecraft text-primary mb-2">Race Controls</h3>
                    <p className="text-sm text-gray-400">
                      {isHost ? "You are the host. Start the race when ready." : "Waiting for host to start the race."}
                    </p>
                  </div>
                  
                  <div className="flex gap-2">
                    <PixelButton
                      onClick={handleToggleReady}
                      className={isReady ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"}
                    >
                      {isReady ? "Not Ready" : "Ready"}
                    </PixelButton>
                    
                    {isHost && (
                      <PixelButton
                        onClick={handleStartRace}
                        className="bg-primary hover:bg-primary/90"
                      >
                        START RACE
                      </PixelButton>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          )}
        </div>
      </main>
      
      <Footer />
      
      {/* Race Results Modal */}
      {showResults && raceResults && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <Card className="bg-dark-800 border-primary max-w-md w-full mx-4">
            <div className="p-8 text-center">
              <h2 className="text-3xl font-minecraft text-primary mb-6">Race Complete!</h2>
              
              <div className="space-y-4 mb-8">
                <div className="text-6xl font-minecraft text-yellow-400">
                  #{raceResults.position}
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="bg-dark-900 p-3 rounded">
                    <div className="text-gray-400">WPM</div>
                    <div className="text-xl font-bold text-white">{raceResults.wpm}</div>
                  </div>
                  <div className="bg-dark-900 p-3 rounded">
                    <div className="text-gray-400">Accuracy</div>
                    <div className="text-xl font-bold text-white">{raceResults.accuracy}%</div>
                  </div>
                  <div className="bg-dark-900 p-3 rounded">
                    <div className="text-gray-400">Time</div>
                    <div className="text-xl font-bold text-white">{raceResults.time.toFixed(1)}s</div>
                  </div>
                  <div className="bg-dark-900 p-3 rounded">
                    <div className="text-gray-400">XP Gained</div>
                    <div className="text-xl font-bold text-green-400">+{raceResults.xpGained}</div>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-3">
                <PixelButton
                  onClick={() => {
                    setShowResults(false);
                    setRaceComplete(false);
                    setRaceResults(null);
                    setTypedText("");
                    setRoomData(prev => prev ? { ...prev, status: "waiting" } : null);
                    
                    // Auto-ready the player for quick restart
                    setIsReady(true);
                    if (socket && socket.readyState === WebSocket.OPEN) {
                      socket.send(JSON.stringify({
                        type: "private_room_ready",
                        roomId,
                        playerId: profile?.id,
                        isReady: true
                      }));
                    }
                    
                    toast({
                      title: "Ready for Next Race!",
                      description: "You're automatically set to ready status.",
                    });
                  }}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  Ready Again
                </PixelButton>
                
                <PixelButton
                  onClick={() => {
                    // Navigate back to Matrix federation racing
                    window.location.href = '/matrix-race';
                  }}
                  className="flex-1 bg-gray-600 hover:bg-gray-700"
                >
                  Leave Room
                </PixelButton>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}