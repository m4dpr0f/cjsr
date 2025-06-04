import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Card } from "@/components/ui/card";
import { PixelButton } from "@/components/ui/pixel-button";
import { useToast } from "@/hooks/use-toast";
import { Shield, Users, Settings, Copy, Plus, Play, Lock } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";

interface PrivateRoom {
  id: string;
  name: string;
  host: string;
  playerCount: number;
  maxPlayers: number;
  customPrompt?: string;
  isPasswordProtected: boolean;
  status: "waiting" | "racing" | "finished";
}

export default function PrivateRaces() {
  const [, setLocation] = useLocation();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [roomName, setRoomName] = useState("");
  // Remove custom prompt - will use multiplayer prompts automatically
  const [maxPlayers, setMaxPlayers] = useState(4);
  const [roomPassword, setRoomPassword] = useState("");
  const [isPasswordProtected, setIsPasswordProtected] = useState(false);
  const { toast } = useToast();

  // Get user profile to check if logged in
  const { data: profile } = useQuery({
    queryKey: ["/api/profile"],
    retry: false,
  });

  const isLoggedIn = !!profile;

  useEffect(() => {
    document.title = "Private Races - Chicken Jockey Scribe Racer";
  }, []);

  // Fetch rooms from server
  const { data: privateRooms = [], refetch: refetchRooms } = useQuery({
    queryKey: ["/api/private-rooms"],
    refetchInterval: 3000 // Refresh every 3 seconds
  });

  // Create room mutation
  const createRoomMutation = useMutation({
    mutationFn: async (roomData: any) => {
      const response = await apiRequest("POST", "/api/private-rooms", roomData);
      if (!response.ok) {
        throw new Error(`Failed to create room: ${response.status}`);
      }
      const text = await response.text();
      try {
        return JSON.parse(text);
      } catch {
        // If JSON parsing fails but request succeeded, return success
        return { success: true };
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/private-rooms'] });
      setShowCreateForm(false);
      setRoomName("");
      toast({
        title: "Room Created!",
        description: "Joining your private race room now..."
      });
      
      // Auto-redirect to the newly created room
      if (data && data.id) {
        setTimeout(() => {
          setLocation(`/private-race/${data.id}`);
        }, 500); // Small delay to show the success message
      }
    },
    onError: (error: any) => {
      toast({
        title: "Creation Failed",
        description: error.message || "Failed to create private room",
        variant: "destructive"
      });
    }
  });

  const handleCreateRoom = () => {
    if (!isLoggedIn) {
      toast({
        title: "Login Required",
        description: "Please log in to create private race rooms.",
        variant: "destructive"
      });
      return;
    }

    if (!roomName.trim()) {
      toast({
        title: "Room Name Required",
        description: "Please enter a name for your private room.",
        variant: "destructive"
      });
      return;
    }

    // Auto-generate prompt from multiplayer prompts

    // Create room on server - send the actual room name
    createRoomMutation.mutate({
      name: roomName,
      customPrompt: null, // Let server generate Art of War text
      maxPlayers,
      isPasswordProtected
    });
  };

  const handleJoinRoom = (roomId: string) => {
    if (!isLoggedIn) {
      toast({
        title: "Login Required",
        description: "Please log in to join private race rooms.",
        variant: "destructive"
      });
      return;
    }

    const room = (privateRooms as any)?.find((r: any) => r.id === roomId);
    if (!room) return;

    if (room.isPasswordProtected) {
      toast({
        title: "Password Required",
        description: "This room requires a password to join.",
        variant: "destructive"
      });
      return;
    }

    if (room.playerCount >= room.maxPlayers) {
      toast({
        title: "Room Full",
        description: "This room is already at maximum capacity.",
        variant: "destructive"
      });
      return;
    }

    if (room.status === "racing") {
      toast({
        title: "Race in Progress",
        description: "This room is currently racing. Please wait for the next race.",
        variant: "destructive"
      });
      return;
    }

    // Navigate to private race room
    setLocation(`/private-race/${roomId}`);
  };

  const copyRoomLink = (roomId: string) => {
    const roomLink = `${window.location.origin}/private-race/${roomId}`;
    navigator.clipboard.writeText(roomLink).then(() => {
      toast({
        title: "Link Copied!",
        description: "Room invitation link copied to clipboard."
      });
    });
  };

  return (
    <div className="flex flex-col min-h-screen bg-dark text-white">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <h1 className="text-4xl font-minecraft text-primary mr-4">
                <Shield className="inline-block w-10 h-10 mr-3" />
                MATRIX FEDERATION RACING
              </h1>
              <span className="bg-green-600/20 text-green-300 border border-green-600 px-3 py-1 rounded-full text-sm font-minecraft">
                NOW AVAILABLE
              </span>
            </div>
            <p className="text-gray-300 text-lg max-w-2xl mx-auto">
              Join cross-server multiplayer racing! Compete with players across different Matrix servers while keeping your CJSR progress.
            </p>
            <div className="mt-6">
              <PixelButton 
                onClick={() => setLocation('/matrix-race')}
                className="bg-primary hover:bg-primary/80 text-dark font-bold px-8 py-3"
              >
                ENTER MATRIX FEDERATION
              </PixelButton>
            </div>
          </div>

          {/* Create Room Button - Disabled */}
          <div className="mb-8 text-center">
            <PixelButton
              disabled
              className="bg-gray-600 cursor-not-allowed text-gray-400 font-minecraft text-lg px-8 py-3"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create Private Room - Feature Coming Soon!
            </PixelButton>
          </div>

          {/* Create Room Form */}
          {showCreateForm && (
            <Card className="mb-8 bg-dark-800 border-primary">
              <div className="p-6">
                <h2 className="text-2xl font-minecraft text-primary mb-6">Create Private Race Room</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Room Name</label>
                    <input
                      type="text"
                      value={roomName}
                      onChange={(e) => setRoomName(e.target.value)}
                      placeholder="Enter room name..."
                      className="w-full px-3 py-2 bg-dark-900 border border-gray-600 rounded-lg text-white focus:border-primary focus:outline-none"
                      maxLength={50}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Max Players</label>
                    <select
                      value={maxPlayers}
                      onChange={(e) => setMaxPlayers(parseInt(e.target.value))}
                      className="w-full px-3 py-2 bg-dark-900 border border-gray-600 rounded-lg text-white focus:border-primary focus:outline-none"
                      style={{ colorScheme: 'dark' }}
                    >
                      <option value={2} className="bg-dark-900 text-white">2 Players</option>
                      <option value={4} className="bg-dark-900 text-white">4 Players</option>
                      <option value={6} className="bg-dark-900 text-white">6 Players</option>
                      <option value={8} className="bg-dark-900 text-white">8 Players</option>
                    </select>
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium mb-2">Custom Text Prompt</label>
                  <div className="w-full px-3 py-2 bg-dark-900 border border-gray-600 rounded-lg text-white h-24 flex items-center justify-center">
                    <span className="text-gray-400">Prompts are automatically selected from our collection</span>
                  </div>
                </div>

                <div className="mt-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={isPasswordProtected}
                      onChange={(e) => setIsPasswordProtected(e.target.checked)}
                      className="mr-2"
                    />
                    <span>Password Protected Room</span>
                  </label>
                  
                  {isPasswordProtected && (
                    <input
                      type="password"
                      value={roomPassword}
                      onChange={(e) => setRoomPassword(e.target.value)}
                      placeholder="Enter room password..."
                      className="w-full mt-2 px-3 py-2 bg-dark-900 border border-gray-600 rounded-lg text-white focus:border-primary focus:outline-none"
                    />
                  )}
                </div>

                <div className="flex gap-4 mt-6">
                  <PixelButton
                    onClick={handleCreateRoom}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Create Room
                  </PixelButton>
                  <PixelButton
                    onClick={() => setShowCreateForm(false)}
                    className="bg-gray-600 hover:bg-gray-700"
                  >
                    Cancel
                  </PixelButton>
                </div>
              </div>
            </Card>
          )}

          {/* Private Rooms List */}
          <div>
            <h2 className="text-2xl font-minecraft text-primary mb-6">
              <Users className="inline-block w-6 h-6 mr-2" />
              Available Private Rooms
            </h2>
            
            {(privateRooms as any)?.length === 0 ? (
              <Card className="bg-dark-800 border-gray-600">
                <div className="p-8 text-center">
                  <div className="text-gray-400 mb-4">
                    <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg">No private rooms available</p>
                    <p className="text-sm">Create the first private race room!</p>
                  </div>
                </div>
              </Card>
            ) : (
              <div className="grid gap-4">
                {(privateRooms as any)?.map((room: any) => (
                  <Card key={room.id} className="bg-dark-800 border-gray-600 hover:border-primary transition-colors">
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center">
                          <h3 className="text-xl font-minecraft text-white mr-3">
                            {room.name}
                          </h3>
                          {room.isPasswordProtected && (
                            <Lock className="w-4 h-4 text-yellow-400" />
                          )}
                          <span className={`ml-3 px-2 py-1 rounded text-xs font-medium ${
                            room.status === "waiting" ? "bg-green-600" :
                            room.status === "racing" ? "bg-yellow-600" : "bg-gray-600"
                          }`}>
                            {room.status.toUpperCase()}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-400">
                            {room.playerCount}/{room.maxPlayers} players
                          </span>
                        </div>
                      </div>
                      
                      <div className="mb-4">
                        <p className="text-sm text-gray-400 mb-2">Host: {room.host}</p>
                        <div className="bg-dark-900 p-3 rounded border-l-4 border-primary">
                          <p className="text-sm text-gray-300 font-mono">
                            "{room.customPrompt}"
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <PixelButton
                          disabled
                          className="bg-gray-600 cursor-not-allowed text-gray-400"
                        >
                          <Play className="w-4 h-4 mr-1" />
                          Coming Soon!
                        </PixelButton>
                        
                        <PixelButton
                          disabled
                          className="bg-gray-600 cursor-not-allowed text-gray-400"
                        >
                          <Copy className="w-4 h-4 mr-1" />
                          Coming Soon!
                        </PixelButton>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}