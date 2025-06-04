import { useState } from "react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { ChickenAvatar } from "@/components/ui/chicken-avatar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, User, Trophy, Clock } from "lucide-react";

// Helper function to get player title based on level
function getPlayerTitle(level: number): string {
  if (level >= 50) return "Legendary Scribe";
  if (level >= 40) return "Master Scribe";
  if (level >= 30) return "Expert Scribe";
  if (level >= 20) return "Advanced Scribe";
  if (level >= 10) return "Skilled Scribe";
  if (level >= 5) return "Apprentice Scribe";
  return "Novice Scribe";
}

export default function ProfileWorking() {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("overview");

  // Get user profile data
  const { data: profile, isLoading } = useQuery<any>({
    queryKey: ["/api/profile"],
  });

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8">
          <div className="text-center">
            <p className="text-light">Loading profile...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8">
          <div className="text-center">
            <p className="text-light">Please log in to view your profile.</p>
            <Button onClick={() => setLocation("/login")} className="mt-4">
              Log In
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Calculate profile data from real API data
  const playerProfile = {
    id: profile.id,
    username: profile.username,
    level: profile.level || 1,
    xp: profile.xp || 0,
    xpProgress: Math.round(((profile.xp || 0) % ((profile.level || 1) * 100)) / ((profile.level || 1) * 100) * 100),
    racesWon: profile.races_won || 0,
    totalRaces: profile.total_races || 0,
    avgWpm: profile.avg_wpm || 0,
    accuracy: profile.accuracy || 0,
    promptsAdded: profile.prompts_added || 0,
    chickenName: profile.chicken_name || "GARU CHICK",
    chickenType: profile.chicken_type || "white",
    jockeyType: profile.jockey_type || "steve",
    title: getPlayerTitle(profile.level || 1),
    qlxCoins: profile.qlx_coins || 0
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        {/* Back button */}
        <Button
          variant="ghost"
          onClick={() => setLocation("/")}
          className="mb-6 text-light hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Button>

        <Card className="bg-dark/80 pixel-border border-primary/50">
          <CardHeader>
            <CardTitle className="text-2xl text-primary font-minecraft">
              SCRIBE PROFILE
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-dark/60">
                <TabsTrigger 
                  value="overview" 
                  className="data-[state=active]:bg-primary data-[state=active]:text-dark font-minecraft"
                >
                  <User className="h-4 w-4 mr-2" />
                  OVERVIEW
                </TabsTrigger>
                <TabsTrigger 
                  value="stats" 
                  className="data-[state=active]:bg-primary data-[state=active]:text-dark font-minecraft"
                >
                  <Trophy className="h-4 w-4 mr-2" />
                  STATS
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="mt-6">
                <div className="grid lg:grid-cols-3 gap-6">
                  {/* Profile summary */}
                  <div className="lg:col-span-1">
                    <Card className="bg-dark/80 pixel-border border-primary/50">
                      <CardContent className="flex flex-col items-center p-4">
                        <div className="mb-4">
                          <ChickenAvatar
                            chickenType={playerProfile.chickenType}
                            jockeyType={playerProfile.jockeyType}
                            size="lg"
                          />
                        </div>
                        <h2 className="text-xl text-primary font-bold mb-1">{playerProfile.username}</h2>
                        <div className="flex items-center gap-2 mb-4">
                          <div className="bg-primary/20 w-7 h-7 flex items-center justify-center">
                            <span className="text-primary font-pixel text-xs">{playerProfile.level}</span>
                          </div>
                          <span className="text-light text-sm">{playerProfile.title}</span>
                        </div>
                        
                        <div className="w-full mb-6">
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-secondary">Level {playerProfile.level}</span>
                            <span className="text-secondary">Level {playerProfile.level + 1}</span>
                          </div>
                          <div className="h-2 w-full bg-dark border border-primary">
                            <div 
                              className="h-full bg-primary" 
                              style={{ width: `${playerProfile.xpProgress}%` }}
                            ></div>
                          </div>
                          <div className="text-xs text-center mt-1 text-light/70">
                            {playerProfile.xpProgress}% to next level
                          </div>
                        </div>
                        
                        {/* QLX Coins Display */}
                        <div className="w-full mb-4 p-3 bg-black/40 border border-yellow-500/50 rounded">
                          <div className="flex items-center justify-center gap-2">
                            <span className="text-lg">🧮</span>
                            <span className="text-yellow-400 font-bold">
                              {playerProfile.qlxCoins} QuiLuX Coins
                            </span>
                          </div>
                          <div className="text-xs text-center text-gray-400 mt-1">
                            Math Racing Currency
                          </div>
                        </div>

                        <div className="w-full text-center">
                          <p className="text-xs text-light/70 mb-2">Chicken: {playerProfile.chickenName}</p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Stats overview */}
                  <div className="lg:col-span-2">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                      <Card className="bg-dark/60 pixel-border border-primary/30">
                        <CardContent className="p-4 text-center">
                          <div className="text-2xl font-bold text-primary">{playerProfile.racesWon}</div>
                          <div className="text-xs text-light/70">Races Won</div>
                        </CardContent>
                      </Card>
                      <Card className="bg-dark/60 pixel-border border-primary/30">
                        <CardContent className="p-4 text-center">
                          <div className="text-2xl font-bold text-primary">{playerProfile.totalRaces}</div>
                          <div className="text-xs text-light/70">Total Races</div>
                        </CardContent>
                      </Card>
                      <Card className="bg-dark/60 pixel-border border-primary/30">
                        <CardContent className="p-4 text-center">
                          <div className="text-2xl font-bold text-primary">{playerProfile.avgWpm}</div>
                          <div className="text-xs text-light/70">Avg WPM</div>
                        </CardContent>
                      </Card>
                      <Card className="bg-dark/60 pixel-border border-primary/30">
                        <CardContent className="p-4 text-center">
                          <div className="text-2xl font-bold text-primary">{playerProfile.accuracy}%</div>
                          <div className="text-xs text-light/70">Accuracy</div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Recent activity */}
                    <Card className="bg-dark/60 pixel-border border-primary/30">
                      <CardHeader>
                        <CardTitle className="text-lg text-primary font-minecraft">RECENT ACTIVITY</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {profile.recentRaces && profile.recentRaces.length > 0 ? (
                          <div className="space-y-2">
                            {profile.recentRaces.slice(0, 5).map((race: any, index: number) => (
                              <div key={index} className="flex justify-between items-center p-2 bg-dark/40 rounded">
                                <div className="flex items-center gap-2">
                                  <Clock className="h-4 w-4 text-secondary" />
                                  <span className="text-sm text-light">Race #{index + 1}</span>
                                </div>
                                <div className="text-sm text-primary">{race.wpm || 0} WPM</div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-light/70 text-center">No recent races found. Start racing to see your activity!</p>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="stats" className="mt-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <Card className="bg-dark/60 pixel-border border-primary/30">
                    <CardHeader>
                      <CardTitle className="text-lg text-primary font-minecraft">RACING STATISTICS</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-between">
                        <span className="text-light">Total XP:</span>
                        <span className="text-primary font-bold">{playerProfile.xp.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-light">Win Rate:</span>
                        <span className="text-primary font-bold">
                          {playerProfile.totalRaces > 0 ? Math.round((playerProfile.racesWon / playerProfile.totalRaces) * 100) : 0}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-light">Prompts Added:</span>
                        <span className="text-primary font-bold">{playerProfile.promptsAdded}</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-dark/60 pixel-border border-primary/30">
                    <CardHeader>
                      <CardTitle className="text-lg text-primary font-minecraft">MATH RACING</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-between">
                        <span className="text-light">QuiLuX Coins:</span>
                        <span className="text-yellow-400 font-bold">{playerProfile.qlxCoins}</span>
                      </div>
                      <div className="text-xs text-gray-400">
                        Earn QuiLuX coins by completing math races. These coins are specific to the math racing feature.
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
}