import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { PixelButton } from "@/components/ui/pixel-button";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ChickenAvatar } from "@/components/ui/chicken-avatar";
import { apiRequest } from "@/lib/queryClient";
import { useQuery } from "@tanstack/react-query";
import {
  Users,
  Crown,
  Timer,
  Zap,
  Shield,
  Gamepad2,
  Flame,
  ArrowRight,
} from "lucide-react";

export default function Race() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("public");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  // Fetch live leaderboard data
  const { data: leaderboardData } = useQuery({
    queryKey: ["/api/leaderboard"],
    retry: false,
  });

  // Check login status
  useEffect(() => {
    apiRequest("GET", "/api/profile")
      .then((response) => {
        if (response.ok) {
          response.json().then((data) => {
            setIsLoggedIn(true);
            setProfile(data);
          });
        } else {
          setIsLoggedIn(false);
        }
      })
      .catch(() => {
        setIsLoggedIn(false);
      });
  }, []);

  // Set page title
  useEffect(() => {
    document.title = "Multiplayer Race - Chicken Jockey Scribe Racer";
  }, []);

  const handleJoinRace = (raceMode: string = "matrix") => {
    if (raceMode === "quickrace") {
      // Direct to the original multiplayer race system with NPCs
      setLocation("/multiplayer/race?mode=quickrace");
    } else if (raceMode === "matrix") {
      // Direct to Matrix Federation race (default multiplayer option)
      setLocation("/matrix-race");
    } else {
      // If not logged in for other modes, show login prompt
      if (!isLoggedIn) {
        setShowLoginPrompt(true);
        return;
      }

      // Route to the optimized real-time race experience
      setLocation(`/multiplayer/race-restored?mode=${raceMode}`);
    }
  };

  const handleNPCRace = (difficulty: string) => {
    // Send directly to the improved race experience with NPC opponents
    setLocation(`/matrix-race`);
  };

  const handleLoginRedirect = () => {
    setLocation("/login");
  };

  const handleRegisterRedirect = () => {
    setLocation("/register");
  };

  const handleContinueAsGuest = () => {
    setShowLoginPrompt(false);
    setLocation("/multiplayer/race");
  };

  const handleCustomizeClick = () => {
    if (!isLoggedIn) {
      toast({
        title: "Login Required",
        description: "Create an account to customize your racer!",
      });
      return;
    }

    // Navigate to profile page where customization is available
    setLocation("/profile");
  };

  return (
    <div className="min-h-screen bg-dark text-white flex flex-col">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8 max-w-6xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-minecraft text-primary mb-2">
            MULTIPLAYER RACES
          </h1>
          <p className="text-secondary">
            Race against other players in real-time typing competitions!
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left column - Race options */}
          <div className="lg:col-span-2">
            <Card className="bg-dark-800 p-6 rounded-lg pixel-border mb-6">
              <Tabs
                defaultValue="public"
                value={activeTab}
                onValueChange={setActiveTab}
              >
                <TabsList className="grid grid-cols-3 mb-6">
                  <TabsTrigger value="public" className="font-pixel">
                    PUBLIC RACES
                  </TabsTrigger>
                  <TabsTrigger value="npc" className="font-pixel">
                    NPC TRAINING
                  </TabsTrigger>
                  <TabsTrigger value="private" className="font-pixel">
                    PRIVATE RACES
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="public">
                  <div className="space-y-6">
                    {/* Quick Race Mode */}
                    <div className="bg-gray-800/60 p-4 rounded-lg">
                      <div className="flex items-center mb-3">
                        <Zap className="text-yellow-400 w-5 h-5 mr-2" />
                        <h3 className="text-xl font-pixel text-yellow-400">
                          QUICK RACE
                        </h3>
                      </div>
                      <p className="text-gray-300 mb-4">
                        Fast-paced races with skill-matched NPCs! 10-second
                        window for other players to join, then race begins
                        automatically.
                      </p>

                      <div className="flex items-center justify-between mb-6">
                        <div className="flex space-x-2">
                          <Badge
                            variant="outline"
                            className="bg-yellow-900/30 text-yellow-400 border-yellow-500"
                          >
                            <Gamepad2 className="w-3 h-3 mr-1" /> NPCs + Players
                          </Badge>
                          <Badge
                            variant="outline"
                            className="bg-blue-900/30 text-blue-400 border-blue-500"
                          >
                            <Timer className="w-3 h-3 mr-1" /> 10s Join Window
                          </Badge>
                        </div>
                      </div>

                      <PixelButton
                        onClick={() => handleJoinRace("quickrace")}
                        className="w-full flex items-center justify-center bg-yellow-600 hover:bg-yellow-500"
                      >
                        <Zap className="w-4 h-4 mr-2" />
                        JOIN QUICK RACE
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </PixelButton>
                    </div>

                    {/* Multiplayer Only Mode */}
                    <div className="bg-gray-800/60 p-4 rounded-lg">
                      <div className="flex items-center mb-3">
                        <Users className="text-primary w-5 h-5 mr-2" />
                        <h3 className="text-xl font-pixel text-primary">
                          MULTIPLAYER ONLY
                        </h3>
                      </div>
                      <p className="text-gray-300 mb-4">
                        Pure player vs player racing! No NPCs - wait for at
                        least 2 human players before the race begins.
                      </p>

                      <div className="flex items-center justify-between mb-6">
                        <div className="flex space-x-2">
                          <Badge
                            variant="outline"
                            className="bg-green-900/30 text-green-400 border-green-500"
                          >
                            <Users className="w-3 h-3 mr-1" /> Players Only
                          </Badge>
                          <Badge
                            variant="outline"
                            className="bg-purple-900/30 text-purple-400 border-purple-500"
                          >
                            <Crown className="w-3 h-3 mr-1" /> Pure Competition
                          </Badge>
                        </div>
                      </div>

                      <PixelButton
                        onClick={() =>
                          (window.location.href = "/private-races")
                        }
                        className="w-full flex items-center justify-center"
                      >
                        <Users className="w-4 h-4 mr-2" />
                        JOIN MULTIPLAYER LOBBY
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </PixelButton>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Card className="bg-gray-800/40 hover:bg-gray-800/60 p-4 rounded-lg border border-gray-700 cursor-pointer">
                        <div className="flex items-center mb-2">
                          <Crown className="text-yellow-400 w-5 h-5 mr-2" />
                          <h4 className="font-pixel text-yellow-400">
                            Ranked Races
                          </h4>
                        </div>
                        <p className="text-sm text-gray-300 mb-3">
                          Compete in ranked matches to climb the global
                          leaderboard
                        </p>
                        <Badge className="bg-yellow-900/30 text-yellow-300 border-yellow-600">
                          Coming Soon
                        </Badge>
                      </Card>

                      <Card className="bg-gray-800/40 hover:bg-gray-800/60 p-4 rounded-lg border border-gray-700 cursor-pointer">
                        <div className="flex items-center mb-2">
                          <Flame className="text-red-400 w-5 h-5 mr-2" />
                          <h4 className="font-pixel text-red-400">
                            Tournament Mode
                          </h4>
                        </div>
                        <p className="text-sm text-gray-300 mb-3">
                          Compete in bracketed tournaments with elimination
                          rounds
                        </p>
                        <Badge className="bg-red-900/30 text-red-300 border-red-600">
                          Coming Soon
                        </Badge>
                      </Card>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="npc">
                  <div className="space-y-6">
                    <div className="bg-gray-800/60 p-4 rounded-lg">
                      <div className="flex items-center mb-3">
                        <Gamepad2 className="text-primary w-5 h-5 mr-2" />
                        <h3 className="text-xl font-pixel text-primary">
                          NPC TRAINING RACES
                        </h3>
                      </div>
                      <p className="text-gray-300 mb-4">
                        Hone your typing skills by racing against AI opponents
                        of varying difficulty levels. Perfect for practice
                        before joining competitive races!
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="bg-gray-900/70 p-3 rounded-lg border border-green-900">
                          <h4 className="font-pixel text-green-400 mb-2">
                            EASY DIFFICULTY
                          </h4>
                          <div className="flex space-x-2 mb-3">
                            <div className="flex -space-x-2">
                              <div className="w-8 h-8 rounded-full overflow-hidden bg-green-900/50 border border-green-800 flex items-center justify-center">
                                <span className="text-xs text-green-300">
                                  NPC
                                </span>
                              </div>
                              <div className="w-8 h-8 rounded-full overflow-hidden bg-green-900/50 border border-green-800 flex items-center justify-center">
                                <span className="text-xs text-green-300">
                                  NPC
                                </span>
                              </div>
                            </div>
                            <div className="text-xs text-gray-300">
                              UndeadCJ01-09
                            </div>
                          </div>
                          <div className="flex items-center justify-between text-xs text-gray-300 mb-3">
                            <div>Average Speed:</div>
                            <div className="text-green-400">30-45 WPM</div>
                          </div>
                          <PixelButton
                            onClick={() => handleNPCRace("easy")}
                            size="sm"
                            className="w-full"
                          >
                            START EASY RACE
                          </PixelButton>
                        </div>

                        <div className="bg-gray-900/70 p-3 rounded-lg border border-orange-900">
                          <h4 className="font-pixel text-orange-400 mb-2">
                            HARD DIFFICULTY
                          </h4>
                          <div className="flex space-x-2 mb-3">
                            <div className="flex -space-x-2">
                              <div className="w-8 h-8 rounded-full overflow-hidden bg-orange-900/50 border border-orange-800 flex items-center justify-center">
                                <span className="text-xs text-orange-300">
                                  NPC
                                </span>
                              </div>
                              <div className="w-8 h-8 rounded-full overflow-hidden bg-orange-900/50 border border-orange-800 flex items-center justify-center">
                                <span className="text-xs text-orange-300">
                                  NPC
                                </span>
                              </div>
                            </div>
                            <div className="text-xs text-gray-300">
                              IndusKnightCJ01-12
                            </div>
                          </div>
                          <div className="flex items-center justify-between text-xs text-gray-300 mb-3">
                            <div>Average Speed:</div>
                            <div className="text-orange-400">60-80 WPM</div>
                          </div>
                          <PixelButton
                            onClick={() => handleNPCRace("hard")}
                            size="sm"
                            className="w-full"
                          >
                            START HARD RACE
                          </PixelButton>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="private">
                  <div className="bg-gray-800/60 p-4 rounded-lg">
                    <div className="flex items-center mb-3">
                      <Shield className="text-primary w-5 h-5 mr-2" />
                      <h3 className="text-xl font-pixel text-primary">
                        PRIVATE RACES
                      </h3>
                    </div>
                    <p className="text-gray-300 mb-4">
                      Create your own private race room and invite friends to
                      compete! Set custom text prompts and race settings.
                    </p>

                    <div className="flex items-center justify-between mb-6">
                      <div className="flex space-x-2">
                        <Badge
                          variant="outline"
                          className="bg-purple-900/30 text-purple-400 border-purple-500"
                        >
                          <Shield className="w-3 h-3 mr-1" /> Custom Rooms
                        </Badge>
                        <Badge
                          variant="outline"
                          className="bg-blue-900/30 text-blue-400 border-blue-500"
                        >
                          <Users className="w-3 h-3 mr-1" /> Invite Friends
                        </Badge>
                      </div>
                    </div>

                    <PixelButton
                      onClick={() => setLocation("/matrix-race")}
                      className="w-full flex items-center justify-center"
                    >
                      <Shield className="w-4 h-4 mr-2" />
                      MATRIX FEDERATION RACING
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </PixelButton>
                  </div>
                </TabsContent>
              </Tabs>
            </Card>

            {/* How To Play */}
            <Card className="bg-dark-800 p-6 rounded-lg pixel-border">
              <CardContent className="p-0">
                <h3 className="text-xl font-minecraft text-primary mb-4">
                  HOW TO PLAY MULTIPLAYER
                </h3>

                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center mr-3 mt-0.5">
                      <span className="font-bold">1</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-white mb-1">
                        Join a Race
                      </h4>
                      <p className="text-sm text-gray-300">
                        Enter the multiplayer lobby and wait for the next race
                        to begin. Races start every few minutes.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center mr-3 mt-0.5">
                      <span className="font-bold">2</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-white mb-1">
                        Type Accurately and Quickly
                      </h4>
                      <p className="text-sm text-gray-300">
                        When the race begins, type the displayed text as quickly
                        and accurately as possible. Mistakes will slow you down!
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center mr-3 mt-0.5">
                      <span className="font-bold">3</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-white mb-1">
                        Race to Victory
                      </h4>
                      <p className="text-sm text-gray-300">
                        Cross the finish line first to win! Winners can submit
                        new race prompts for future races.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right column - Player stats */}
          <div>
            <Card className="bg-dark-800 p-6 rounded-lg pixel-border mb-6">
              <CardContent className="p-0">
                <h3 className="text-xl font-minecraft text-primary mb-4">
                  PLAYER PROFILE
                </h3>

                {isLoggedIn && profile ? (
                  <div>
                    <div className="flex items-center mb-6 bg-gray-900/70 p-3 rounded-lg">
                      <div className="mr-3">
                        <ChickenAvatar
                          chickenType={profile.chicken_type || "white"}
                          jockeyType={profile.jockey_type || "steve"}
                          size="md"
                        />
                      </div>
                      <div className="flex-1">
                        <div className="font-pixel text-primary text-lg">
                          {profile.username}
                        </div>
                        <div className="text-xs text-gray-300">
                          Level {profile.level || 1}
                        </div>
                        <div className="mt-1 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary"
                            style={{ width: "35%" }}
                          ></div>
                        </div>
                      </div>
                    </div>

                    <h4 className="font-pixel text-gray-400 mb-2">
                      RACE STATISTICS
                    </h4>
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div>
                        <p className="text-xs text-gray-400 mb-1">
                          RACES COMPLETED
                        </p>
                        <p className="text-xl font-minecraft text-primary">
                          {profile.races_completed || 0}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 mb-1">RACES WON</p>
                        <p className="text-xl font-minecraft text-primary">
                          {profile.races_won || 0}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 mb-1">
                          AVERAGE WPM
                        </p>
                        <p className="text-xl font-minecraft text-primary">
                          {Math.round(profile.avg_wpm) || 0}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 mb-1">ACCURACY</p>
                        <p className="text-xl font-minecraft text-primary">
                          {profile.accuracy || 0}%
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <PixelButton onClick={() => handleJoinRace()} className="w-full">
                        JOIN MULTIPLAYER RACE
                      </PixelButton>
                      <PixelButton
                        onClick={handleCustomizeClick}
                        variant="outline"
                        className="w-full"
                      >
                        CUSTOMIZE RACER
                      </PixelButton>
                      <Button
                        variant="link"
                        className="w-full text-gray-400 hover:text-primary"
                        onClick={() => setLocation("/profile")}
                      >
                        View Full Statistics
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <div className="w-20 h-20 mx-auto bg-gray-800 rounded-full flex items-center justify-center mb-4">
                      <Users className="w-10 h-10 text-gray-500" />
                    </div>
                    <h4 className="font-pixel text-gray-200 mb-2">
                      Guest Mode
                    </h4>
                    <p className="text-sm text-gray-400 mb-6">
                      Create an account to track your progress, customize your
                      racer, and compete in ranked races!
                    </p>
                    <div className="space-y-3">
                      <PixelButton
                        onClick={handleRegisterRedirect}
                        className="w-full"
                      >
                        CREATE ACCOUNT
                      </PixelButton>
                      <PixelButton
                        onClick={handleLoginRedirect}
                        variant="outline"
                        className="w-full"
                      >
                        LOGIN
                      </PixelButton>
                      <PixelButton
                        onClick={() => handleJoinRace()}
                        variant="ghost"
                        className="w-full"
                      >
                        CONTINUE AS GUEST
                      </PixelButton>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Leaderboard Preview */}
            <Card className="bg-dark-800 p-6 rounded-lg pixel-border">
              <CardContent className="p-0">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-minecraft text-primary">
                    TOP RACERS
                  </h3>
                  <Button
                    variant="link"
                    className="text-sm text-gray-400 hover:text-primary"
                    onClick={() => setLocation("/leaderboard")}
                  >
                    View Full Rankings
                  </Button>
                </div>

                <div className="space-y-2">
                  {leaderboardData?.leaderboard &&
                  leaderboardData.leaderboard.length > 0 ? (
                    leaderboardData.leaderboard
                      .slice(0, 3)
                      .map((player: any, index: number) => {
                        const position = index + 1;
                        const positionStyles = {
                          1: "bg-yellow-900/20 border-yellow-900/50",
                          2: "bg-gray-800/50 border-gray-600/50",
                          3: "bg-orange-900/20 border-orange-800/50",
                        };
                        const positionColors = {
                          1: "bg-yellow-500",
                          2: "bg-gray-600",
                          3: "bg-orange-800",
                        };
                        const textColors = {
                          1: "text-yellow-400",
                          2: "text-gray-300",
                          3: "text-orange-400",
                        };

                        return (
                          <div
                            key={player.id}
                            className={`flex items-center ${positionStyles[position as keyof typeof positionStyles] || "bg-gray-800/50"} p-2 rounded border`}
                          >
                            <div
                              className={`w-6 h-6 rounded-full ${positionColors[position as keyof typeof positionColors] || "bg-gray-600"} flex items-center justify-center mr-2 text-xs font-bold`}
                            >
                              {position}
                            </div>
                            <div className="mr-2">
                              <ChickenAvatar
                                chickenType={player.chicken_type || "black"}
                                jockeyType={player.jockey_type || "steve"}
                                size="sm"
                              />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-white">
                                {player.username}
                              </p>
                            </div>
                            <div
                              className={`text-sm font-semibold ${textColors[position as keyof typeof textColors] || "text-gray-300"}`}
                            >
                              {Math.round(
                                player.avg_wpm || player.fastest_wpm || 0,
                              )}{" "}
                              WPM
                            </div>
                          </div>
                        );
                      })
                  ) : (
                    <div className="text-center py-4 text-gray-400">
                      <p className="text-sm">Loading top racers...</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Login Prompt Modal */}
        {showLoginPrompt && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
            <Card className="w-full max-w-md mx-4 border-2 border-primary">
              <CardContent className="p-6">
                <h3 className="text-xl font-minecraft text-primary mb-4">
                  CREATE AN ACCOUNT
                </h3>
                <p className="text-gray-300 mb-6">
                  Create an account to track your race stats, customize your
                  racer, and unlock special rewards!
                </p>

                <div className="space-y-3">
                  <PixelButton
                    onClick={handleRegisterRedirect}
                    className="w-full"
                  >
                    CREATE ACCOUNT
                  </PixelButton>
                  <PixelButton
                    onClick={handleLoginRedirect}
                    variant="outline"
                    className="w-full"
                  >
                    LOGIN
                  </PixelButton>
                  <Button
                    variant="ghost"
                    className="w-full text-gray-400"
                    onClick={handleContinueAsGuest}
                  >
                    Continue as Guest
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
