import { useState, useEffect } from "react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { ChickenAvatar } from "@/components/ui/chicken-avatar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { PlayerStats } from "@/components/player-stats";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { GlyphToolkit, getUnlockedGlyphs } from "@/components/glyph-toolkit";
import {
  ArrowLeft, 
  Lock, 
  Star, 
  Trophy, 
  Clock, 
  Download, 
  Unlock,
  FileText,
  User,
  Gift,
  Scroll,
  Plus,
  Crown,
  Feather
} from "lucide-react";
import { FACTION_UNLOCKS, checkFactionUnlocks, isFactionUnlockAvailable } from "@/lib/faction-unlocks";
import { HTML_DEATH_MOUNT, HTML_GOLDEN_CHAMPION, HTML_PEACOCK_CHAMPION, HTML_PEACOCK_MOUNT, SPECIAL_CHARACTER_STYLES } from "@/assets/html-characters";

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

export default function Profile() {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("overview");
  const [showGlyphToolkit, setShowGlyphToolkit] = useState(false);
  const [unlockedGlyphs, setUnlockedGlyphs] = useState<string[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    setUnlockedGlyphs(getUnlockedGlyphs());
  }, []);
  const [showGlyphToolkit, setShowGlyphToolkit] = useState(false);
  const [unlockedGlyphs, setUnlockedGlyphs] = useState<string[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    setUnlockedGlyphs(getUnlockedGlyphs());
  }, []);

  // Get user profile data
  const { data: profile, isLoading } = useQuery<any>({
    queryKey: ["/api/profile"],
  });

  // Get user's scribe submissions
  const { data: submissions } = useQuery({
    queryKey: ["/api/scribe/submissions"],
  });

  // Get user's egg inventory
  const { data: eggData } = useQuery({
    queryKey: ["/api/profile/eggs"],
  });

  // Daily egg claim mutation
  const claimEggMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/profile/claim-daily-egg"),
    onSuccess: () => {
      toast({
        title: "Daily Egg Claimed!",
        description: "You received a random elemental egg! Check your inventory.",
      });
    },
  });
  
  // Calculate profile data from real API data
  const playerProfile = profile ? {
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
    achievements: [
      { id: 1, name: "First Race", description: "Complete your first race", icon: "🏁" },
      { id: 2, name: "Speed Demon", description: "Reach 80 WPM", icon: "🔥" },
      { id: 3, name: "Chicken Whisperer", description: "Win 10 races", icon: "🏆" }
    ],
    recentRaces: profile.recentRaces || []
  } : {
    id: "loading",
    username: "Loading...",
    level: 1,
    xp: 0,
    xpProgress: 0,
    racesWon: 0,
    totalRaces: 0,
    avgWpm: 0,
    accuracy: 0,
    promptsAdded: 0,
    chickenName: "GARU CHICK",
    chickenType: "white",
    jockeyType: "steve",
    title: "Loading...",
    achievements: [],
    recentRaces: []
  };
  
  // Customization options
  const chickenOptions = [
    // HTML Sprites (new system)
    { id: "html_matikah", name: "Matikah & Chalisa", requiredLevel: 0 },
    { id: "html_auto", name: "Auto & Timaru", requiredLevel: 0 },
    { id: "html_death", name: "Death", requiredLevel: 5 },
    { id: "html_iam", name: "Iam", requiredLevel: 10 },
    { id: "html_steve", name: "Steve", requiredLevel: 0 },
    { id: "html_golden", name: "Golden Champion", requiredLevel: 15 },
    
    // Legacy image-based sprites
    { id: "white", name: "Steve Chicken" },
    { id: "red", name: "Zombie Chicken" },
    { id: "golden", name: "Gold Chicken", locked: true, requiredLevel: 10 },
    { id: "diamond", name: "Diamond Chicken", locked: true, requiredLevel: 20 }
  ];
  
  const jockeyOptions = [
    // We're using combined sprites with the new HTML system
    { id: "combined", name: "Default Jockey" },
    
    // Legacy jockey options
    { id: "sj_og", name: "Steve Jockey" },
    { id: "zj_og", name: "Zombie Jockey" },
    { id: "zj_bow", name: "Bow Zombie Jockey", locked: true, requiredLevel: 5 },
    { id: "zj_dark", name: "Dark Zombie Jockey", locked: true, requiredLevel: 8 },
    { id: "zj_dark2", name: "Dark Zombie Jockey II", locked: true, requiredLevel: 10 },
    { id: "zj_diamond", name: "Diamond Zombie Jockey", locked: true, requiredLevel: 12 },
    { id: "zj_diamond2", name: "Diamond Zombie Jockey II", locked: true, requiredLevel: 15 },
    { id: "zj_ghost", name: "Ghost Zombie Jockey", locked: true, requiredLevel: 18 },
    { id: "zj_gold", name: "Gold Zombie Jockey", locked: true, requiredLevel: 20 },
    { id: "zj_helm", name: "Helm Zombie Jockey", locked: true, requiredLevel: 22 },
    { id: "zj_invis_garu", name: "Invisible Zombie Jockey", locked: true, requiredLevel: 25 },
    { id: "zj_orb", name: "Orb Zombie Jockey", locked: true, requiredLevel: 28 },
    { id: "zj_shroom", name: "Mushroom Zombie Jockey", locked: true, requiredLevel: 30 },
    { id: "zj_torch", name: "Torch Zombie Jockey", locked: true, requiredLevel: 35 }
  ];
  
  const trailOptions = [
    { id: "none", name: "None" },
    { id: "dust", name: "Dust" },
    { id: "flames", name: "Flames", locked: true, requiredLevel: 12 },
    { id: "rainbow", name: "Rainbow", locked: true, requiredLevel: 18 }
  ];
  
  // Set document title
  useEffect(() => {
    document.title = "Profile - Chicken Jockey Scribe Racer";
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-grow container mx-auto p-4">
        <Card className="bg-dark minecraft-border max-w-6xl mx-auto">
            <CardHeader className="border-b border-primary/50">
              <div className="flex justify-between items-center">
                <CardTitle className="text-primary font-minecraft">PROFILE & STATS</CardTitle>
                <Button 
                  variant="outline" 
                  className="border-primary text-primary hover:bg-primary/20"
                  onClick={() => setLocation("/")}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Home
                </Button>
              </div>
            </CardHeader>
            
            <CardContent className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
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
                      {profile && (
                        <div className="w-full mb-4 p-3 bg-black/40 border border-yellow-500/50 rounded">
                          <div className="flex items-center justify-center gap-2">
                            <span className="text-lg">🧮</span>
                            <span className="text-yellow-400 font-bold">
                              {profile.qlx_coins || 0} QuiLuX Coins
                            </span>
                          </div>
                          <div className="text-xs text-center text-gray-400 mt-1">
                            Math Racing Currency
                          </div>
                        </div>
                      )}

                      <PlayerStats
                        level={playerProfile.level}
                        xpProgress={playerProfile.xpProgress}
                        racesWon={playerProfile.racesWon}
                        avgWpm={playerProfile.avgWpm}
                        accuracy={playerProfile.accuracy}
                        promptsAdded={playerProfile.promptsAdded}
                      />
                    </CardContent>
                  </Card>
                </div>
                
                {/* Main content area */}
                <div className="lg:col-span-3">
                  <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="bg-black/60 border-2 border-primary/80 flex w-full p-1 gap-1 rounded-lg">
                      <TabsTrigger 
                        value="overview" 
                        className="flex-1 font-minecraft text-sm px-3 py-2 rounded border border-primary/30 bg-dark/50 text-primary hover:bg-primary/20 data-[state=active]:bg-primary data-[state=active]:text-black data-[state=active]:border-primary transition-all"
                      >
                        OVERVIEW
                      </TabsTrigger>
                      <TabsTrigger 
                        value="statistics" 
                        className="flex-1 font-minecraft text-sm px-3 py-2 rounded border border-primary/30 bg-dark/50 text-primary hover:bg-primary/20 data-[state=active]:bg-primary data-[state=active]:text-black data-[state=active]:border-primary transition-all"
                      >
                        STATISTICS
                      </TabsTrigger>
                      <TabsTrigger 
                        value="customize" 
                        className="flex-1 font-minecraft text-sm px-3 py-2 rounded border border-primary/30 bg-dark/50 text-primary hover:bg-primary/20 data-[state=active]:bg-primary data-[state=active]:text-black data-[state=active]:border-primary transition-all"
                      >
                        CUSTOMIZE
                      </TabsTrigger>
                      <TabsTrigger 
                        value="achievements" 
                        className="flex-1 font-minecraft text-sm px-3 py-2 rounded border border-primary/30 bg-dark/50 text-primary hover:bg-primary/20 data-[state=active]:bg-primary data-[state=active]:text-black data-[state=active]:border-primary transition-all"
                      >
                        ACHIEVEMENTS
                      </TabsTrigger>
                      <TabsTrigger 
                        value="eggs" 
                        className="flex-1 font-minecraft text-sm px-3 py-2 rounded border border-primary/30 bg-dark/50 text-primary hover:bg-primary/20 data-[state=active]:bg-primary data-[state=active]:text-black data-[state=active]:border-primary transition-all"
                      >
                        EGGS
                      </TabsTrigger>
                      <TabsTrigger 
                        value="elite" 
                        className="flex-1 font-minecraft text-sm px-3 py-2 rounded border border-primary/30 bg-dark/50 text-primary hover:bg-primary/20 data-[state=active]:bg-primary data-[state=active]:text-black data-[state=active]:border-primary transition-all"
                      >
                        <Crown className="w-3 h-3 mr-1" />
                        ELITE
                      </TabsTrigger>
                      <TabsTrigger 
                        value="scribe" 
                        className="flex-1 font-minecraft text-sm px-3 py-2 rounded border border-primary/30 bg-dark/50 text-primary hover:bg-primary/20 data-[state=active]:bg-primary data-[state=active]:text-black data-[state=active]:border-primary transition-all"
                        onClick={() => setLocation("/scribe")}
                      >
                        SCRIBE
                      </TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="overview" className="mt-6 space-y-6">
                      {/* Recent races */}
                      <Card className="bg-dark/80 pixel-border border-primary/50">
                        <CardHeader>
                          <CardTitle className="text-lg text-primary font-minecraft">RECENT RACES</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            {playerProfile.recentRaces.map((race, index) => (
                              <div key={index} className="p-3 border border-primary/30 bg-primary/10 rounded-sm">
                                <div className="flex justify-between mb-2">
                                  <div className="text-primary font-bold">
                                    Position: {race.position} / {race.totalPlayers}
                                  </div>
                                  <div className="text-light/70 text-xs">
                                    {race.date.toLocaleDateString()}
                                  </div>
                                </div>
                                <div className="grid grid-cols-3 gap-2 text-sm">
                                  <div>
                                    <span className="text-secondary">WPM: </span>
                                    <span className="text-light">{race.wpm}</span>
                                  </div>
                                  <div>
                                    <span className="text-secondary">Accuracy: </span>
                                    <span className="text-light">{race.accuracy}%</span>
                                  </div>
                                  <div>
                                    <span className="text-secondary">XP: </span>
                                    <span className="text-light">+{race.xpGained}</span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                      
                      {/* Quick actions */}
                      <Card className="bg-dark/80 pixel-border border-primary/50">
                        <CardHeader>
                          <CardTitle className="text-lg text-primary font-minecraft">QUICK ACTIONS</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-2 gap-3">
                            <Button 
                              variant="outline" 
                              className="border-primary text-primary hover:bg-primary/20"
                              onClick={() => setLocation("/race")}
                            >
                              <Star className="mr-2 h-4 w-4" />
                              Practice Race
                            </Button>
                            <Button 
                              variant="outline" 
                              className="border-primary text-primary hover:bg-primary/20"
                              onClick={() => setLocation("/campaign")}
                            >
                              <Trophy className="mr-2 h-4 w-4" />
                              Campaign Mode
                            </Button>
                            <Button 
                              variant="outline" 
                              className="border-accent text-accent hover:bg-accent/20"
                              onClick={() => setLocation("/scribe")}
                            >
                              <Scroll className="mr-2 h-4 w-4" />
                              SCRIBE
                            </Button>
                            <Button 
                              variant="outline" 
                              className="border-secondary text-secondary hover:bg-secondary/20"
                              onClick={() => window.location.href = "/api/exports/my-races"}
                            >
                              <Download className="mr-2 h-4 w-4" />
                              Export Race History
                            </Button>
                            <Button 
                              variant="outline" 
                              className="border-secondary text-secondary hover:bg-secondary/20"
                              onClick={() => window.location.href = "/api/exports/leaderboard"}
                            >
                              <FileText className="mr-2 h-4 w-4" />
                              Leaderboard
                            </Button>
                          </div>
                          
                          {/* SCRIBE Button - Standalone */}
                          <div className="mt-4">
                            <Button 
                              onClick={() => setLocation("/scribe")}
                              className="w-full bg-accent hover:bg-accent/80 text-dark font-minecraft text-lg py-3"
                            >
                              <Scroll className="mr-2 h-5 w-5" />
                              SCRIBE - RACE LORE & STORIES
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>
                    
                    <TabsContent value="statistics" className="mt-6">
                      <Card className="bg-dark/80 pixel-border border-primary/50">
                        <CardHeader>
                          <CardTitle className="text-lg text-primary font-minecraft">DETAILED STATISTICS</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {/* Would show detailed statistics here */}
                            <div className="p-3 border border-primary/30 rounded">
                              <div className="text-sm text-light/70">Total Races</div>
                              <div className="text-2xl text-primary font-bold">{playerProfile.totalRaces}</div>
                            </div>
                            <div className="p-3 border border-primary/30 rounded">
                              <div className="text-sm text-light/70">Races Won</div>
                              <div className="text-2xl text-primary font-bold">{playerProfile.racesWon}</div>
                            </div>
                            <div className="p-3 border border-primary/30 rounded">
                              <div className="text-sm text-light/70">Win Rate</div>
                              <div className="text-2xl text-primary font-bold">
                                {Math.round((playerProfile.racesWon / playerProfile.totalRaces) * 100) || 0}%
                              </div>
                            </div>
                            <div className="p-3 border border-primary/30 rounded">
                              <div className="text-sm text-light/70">Average WPM</div>
                              <div className="text-2xl text-primary font-bold">{playerProfile.avgWpm}</div>
                            </div>
                            <div className="p-3 border border-primary/30 rounded">
                              <div className="text-sm text-light/70">Accuracy</div>
                              <div className="text-2xl text-primary font-bold">{playerProfile.accuracy}%</div>
                            </div>
                            <div className="p-3 border border-primary/30 rounded">
                              <div className="text-sm text-light/70">Prompts Added</div>
                              <div className="text-2xl text-primary font-bold">{playerProfile.promptsAdded}</div>
                            </div>
                            <div className="p-3 border border-primary/30 rounded">
                              <div className="text-sm text-light/70">Total XP</div>
                              <div className="text-2xl text-primary font-bold">{playerProfile.xp}</div>
                            </div>
                            <div className="p-3 border border-primary/30 rounded">
                              <div className="text-sm text-light/70">Current Level</div>
                              <div className="text-2xl text-primary font-bold">{playerProfile.level}</div>
                            </div>
                            <div className="p-3 border border-primary/30 rounded">
                              <div className="text-sm text-light/70">Best Position</div>
                              <div className="text-2xl text-primary font-bold">1st</div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>
                    
                    <TabsContent value="customize" className="mt-6">
                      <Card className="bg-dark/80 pixel-border border-primary/50">
                        <CardHeader>
                          <CardTitle className="text-lg text-primary font-minecraft">CHICKEN JOCKEY CUSTOMIZATION</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex flex-col items-center mb-6">
                            <ChickenAvatar
                              chickenType={playerProfile.chickenType}
                              jockeyType={playerProfile.jockeyType}
                              size="lg"
                              className="mb-4"
                            />
                            <h3 className="text-xl text-primary font-bold">{playerProfile.chickenName}</h3>
                          </div>
                          
                          <div className="space-y-4">
                            <div>
                              <h4 className="text-secondary font-minecraft mb-2">CHICKEN TYPE</h4>
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                {chickenOptions.map(option => (
                                  <div 
                                    key={option.id} 
                                    className={`p-2 border ${option.locked && playerProfile.level < (option.requiredLevel || 0) ? 'border-light/20 opacity-50' : 'border-primary/30'} text-center relative rounded`}
                                  >
                                    <div className="w-full h-12 flex items-center justify-center mb-1">
                                      <ChickenAvatar
                                        chickenType={option.id}
                                        jockeyType={playerProfile.jockeyType}
                                        size="sm"
                                      />
                                    </div>
                                    <div className="text-sm">{option.name}</div>
                                    {option.locked && playerProfile.level < (option.requiredLevel || 0) && (
                                      <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded">
                                        <div className="text-xs text-accent flex items-center">
                                          <Lock className="h-3 w-3 mr-1" />
                                          Level {option.requiredLevel}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                            
                            <div>
                              <h4 className="text-secondary font-minecraft mb-2">JOCKEY TYPE</h4>
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                {jockeyOptions.map(option => (
                                  <div 
                                    key={option.id} 
                                    className={`p-2 border ${option.locked && playerProfile.level < (option.requiredLevel || 0) ? 'border-light/20 opacity-50' : 'border-primary/30'} text-center relative rounded`}
                                  >
                                    <div className="w-full h-12 flex items-center justify-center mb-1">
                                      <ChickenAvatar
                                        chickenType={playerProfile.chickenType}
                                        jockeyType={option.id}
                                        size="sm"
                                      />
                                    </div>
                                    <div className="text-sm">{option.name}</div>
                                    {option.locked && playerProfile.level < (option.requiredLevel || 0) && (
                                      <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded">
                                        <div className="text-xs text-accent flex items-center">
                                          <Lock className="h-3 w-3 mr-1" />
                                          Level {option.requiredLevel}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>
                    
                    <TabsContent value="achievements" className="mt-6">
                      <Card className="bg-dark/80 pixel-border border-primary/50">
                        <CardHeader>
                          <CardTitle className="text-lg text-primary font-minecraft">ACHIEVEMENTS</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {playerProfile.achievements.map(achievement => (
                              <div key={achievement.id} className="p-3 border border-primary/30 bg-primary/10 flex items-center rounded">
                                <div className="w-10 h-10 bg-secondary/20 flex items-center justify-center mr-3 rounded">
                                  <span className="text-secondary">{achievement.icon}</span>
                                </div>
                                <div>
                                  <div className="text-primary font-bold">{achievement.name}</div>
                                  <div className="text-xs text-light/70">{achievement.description}</div>
                                </div>
                              </div>
                            ))}
                            
                            {/* Locked achievement examples */}
                            <div className="p-3 border border-light/20 bg-dark/50 flex items-center rounded opacity-50">
                              <div className="w-10 h-10 bg-dark flex items-center justify-center mr-3 rounded">
                                <Lock className="text-light/50 h-4 w-4" />
                              </div>
                              <div>
                                <div className="text-light/80 font-bold">Perfect Accuracy</div>
                                <div className="text-xs text-light/50">Complete a race with 100% accuracy</div>
                              </div>
                            </div>
                            <div className="p-3 border border-light/20 bg-dark/50 flex items-center rounded opacity-50">
                              <div className="w-10 h-10 bg-dark flex items-center justify-center mr-3 rounded">
                                <Lock className="text-light/50 h-4 w-4" />
                              </div>
                              <div>
                                <div className="text-light/80 font-bold">Speed Demon</div>
                                <div className="text-xs text-light/50">Achieve 100+ WPM in a race</div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>
                  </Tabs>
                </div>
              </div>
            </CardContent>
          </Card>
          
                    
                    {/* Eggs Tab */}
                    <TabsContent value="eggs" className="mt-6 space-y-6">
                      <Card className="bg-dark/80 pixel-border border-primary/50">
                        <CardHeader>
                          <CardTitle className="text-primary font-minecraft text-xl flex items-center">
                            <Gift className="mr-2 h-6 w-6" />
                            DAILY EGG CLAIM
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <p className="text-light text-lg">
                            Claim your daily elemental egg! Each egg contains a random faction type.
                          </p>
                          <Button
                            onClick={() => claimEggMutation.mutate()}
                            disabled={claimEggMutation.isPending}
                            className="bg-primary text-dark hover:bg-primary/80 text-lg px-6 py-3"
                          >
                            {claimEggMutation.isPending ? "Claiming..." : "🥚 CLAIM EGGS"}
                          </Button>
                        </CardContent>
                      </Card>
                      
                      <Card className="bg-dark/80 pixel-border border-primary/50">
                        <CardHeader>
                          <CardTitle className="text-primary font-minecraft text-xl">
                            EGG INVENTORY
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-4 gap-4">
                            {(() => {
                              const eggTypes = [
                                { key: "d2", display: "D2 (Coin)" },
                                { key: "d4", display: "D4 (Fire)" },
                                { key: "d6", display: "D6 (Earth)" },
                                { key: "d8", display: "D8 (Air)" },
                                { key: "d10", display: "D10 (Chaos)" },
                                { key: "d12", display: "D12 (Ether)" },
                                { key: "d20", display: "D20 (Water)" },
                                { key: "d100", display: "D100 (Order)" }
                              ];
                              
                              const eggInventory = eggData?.egg_inventory ? JSON.parse(eggData.egg_inventory) : {};
                              
                              return eggTypes.map((eggType) => (
                                <div key={eggType.key} className="text-center p-4 border border-primary/30 rounded relative">
                                  <div className="text-4xl mb-2">🥚</div>
                                  <div className="text-lg font-minecraft text-light">{eggType.display}</div>
                                  <div className="absolute -top-2 -right-2 bg-primary text-dark rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                                    {eggInventory[eggType.key] || 0}
                                  </div>
                                </div>
                              ));
                            })()}
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>

                    {/* Scribe Tab */}
                    <TabsContent value="scribe" className="mt-6 space-y-6">
                      <Card className="bg-dark/80 pixel-border border-primary/50">
                        <CardHeader>
                          <CardTitle className="text-primary font-minecraft text-xl flex items-center">
                            <Scroll className="mr-2 h-6 w-6" />
                            YOUR WRITING CONTRIBUTIONS
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <p className="text-light text-lg">
                            Track your writing submissions and contributions to the game's content library.
                          </p>
                          
                          {submissions && Array.isArray(submissions) ? (
                            <div className="space-y-3">
                              {submissions.map((submission: any) => (
                                <div key={submission.id} className="p-4 border border-primary/30 rounded">
                                  <h4 className="text-primary font-minecraft text-lg">{submission.title}</h4>
                                  <p className="text-light mt-2">{submission.content?.slice(0, 100)}...</p>
                                  <div className="text-accent text-sm mt-2">
                                    Category: {submission.category} | Status: {submission.status}
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-8">
                              <div className="text-6xl mb-4">📝</div>
                              <p className="text-light text-lg">No submissions yet!</p>
                              <p className="text-accent mt-2">Complete campaign races to contribute your writing.</p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </TabsContent>

                    {/* Elite Unlocks Tab */}
                    <TabsContent value="elite" className="mt-6 space-y-6">
                      <div dangerouslySetInnerHTML={{ __html: SPECIAL_CHARACTER_STYLES }} />
                      <Card className="bg-dark/80 pixel-border border-primary/50">
                        <CardHeader>
                          <CardTitle className="text-lg text-primary font-minecraft flex items-center">
                            <Crown className="w-5 h-5 mr-2" />
                            ELITE FACTION UNLOCKS
                          </CardTitle>
                          <p className="text-gray-300 text-sm">
                            Exclusive characters unlocked by reaching high Faction XP thresholds across any element.
                          </p>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Death Mount - 10k XP */}
                            <div className="p-4 border border-gray-700 rounded-lg bg-dark-900/50">
                              <div className="flex items-center justify-between mb-3">
                                <h3 className="text-xl font-minecraft text-primary">Death</h3>
                                <div className="text-right">
                                  <div className="text-sm text-gray-400">Epic Mount</div>
                                  <div className="text-xs text-gray-500">10,000 XP Required</div>
                                </div>
                              </div>
                              <div className="mb-4" dangerouslySetInnerHTML={{ __html: HTML_DEATH_MOUNT }} />
                              <p className="text-sm text-gray-300 mb-3">
                                A mysterious ethereal mount that transcends the mortal realm.
                              </p>
                              {profile?.faction_xp && Math.max(...Object.values(profile.faction_xp)) >= 10000 ? (
                                <div className="flex items-center text-green-400">
                                  <Unlock className="w-4 h-4 mr-2" />
                                  UNLOCKED
                                </div>
                              ) : (
                                <div className="flex items-center text-gray-400">
                                  <Lock className="w-4 h-4 mr-2" />
                                  {profile?.faction_xp ? Math.max(...Object.values(profile.faction_xp)) : 0} / 10,000 XP
                                </div>
                              )}
                            </div>

                            {/* Golden Champion - 20k XP */}
                            <div className="p-4 border border-yellow-600 rounded-lg bg-yellow-900/20">
                              <div className="flex items-center justify-between mb-3">
                                <h3 className="text-xl font-minecraft text-yellow-400">Golden Champion</h3>
                                <div className="text-right">
                                  <div className="text-sm text-yellow-300">Legendary Jockey</div>
                                  <div className="text-xs text-yellow-500">20,000 XP Required</div>
                                </div>
                              </div>
                              <div className="mb-4" dangerouslySetInnerHTML={{ __html: HTML_GOLDEN_CHAMPION }} />
                              <p className="text-sm text-gray-300 mb-3">
                                A legendary warrior adorned in royal gold, master of all elements.
                              </p>
                              {profile?.faction_xp && Math.max(...Object.values(profile.faction_xp)) >= 20000 ? (
                                <div className="flex items-center text-green-400">
                                  <Unlock className="w-4 h-4 mr-2" />
                                  UNLOCKED
                                </div>
                              ) : (
                                <div className="flex items-center text-gray-400">
                                  <Lock className="w-4 h-4 mr-2" />
                                  {profile?.faction_xp ? Math.max(...Object.values(profile.faction_xp)) : 0} / 20,000 XP
                                </div>
                              )}
                            </div>

                            {/* Peacock Champion - 100k XP */}
                            <div className="p-4 border border-purple-600 rounded-lg bg-purple-900/20">
                              <div className="flex items-center justify-between mb-3">
                                <h3 className="text-xl font-minecraft text-purple-400 flex items-center">
                                  <Feather className="w-5 h-5 mr-2" />
                                  Peacock Champion
                                </h3>
                                <div className="text-right">
                                  <div className="text-sm text-purple-300">Ultra Elite Jockey</div>
                                  <div className="text-xs text-purple-500">100,000 XP Required</div>
                                </div>
                              </div>
                              <div className="mb-4" dangerouslySetInnerHTML={{ __html: HTML_PEACOCK_CHAMPION }} />
                              <p className="text-sm text-gray-300 mb-3">
                                Elite rider with dark blue skin and vibrant peacock feather. Grace personified.
                              </p>
                              {profile?.faction_xp && Math.max(...Object.values(profile.faction_xp)) >= 100000 ? (
                                <div className="flex items-center text-green-400">
                                  <Unlock className="w-4 h-4 mr-2" />
                                  UNLOCKED
                                </div>
                              ) : (
                                <div className="flex items-center text-gray-400">
                                  <Lock className="w-4 h-4 mr-2" />
                                  {profile?.faction_xp ? Math.max(...Object.values(profile.faction_xp)) : 0} / 100,000 XP
                                </div>
                              )}
                            </div>

                            {/* Peacock Mount - 100k XP */}
                            <div className="p-4 border border-teal-600 rounded-lg bg-teal-900/20">
                              <div className="flex items-center justify-between mb-3">
                                <h3 className="text-xl font-minecraft text-teal-400">Peacock Mount</h3>
                                <div className="text-right">
                                  <div className="text-sm text-teal-300">Ultra Elite Mount</div>
                                  <div className="text-xs text-teal-500">100,000 XP Required</div>
                                </div>
                              </div>
                              <div className="mb-4" dangerouslySetInnerHTML={{ __html: HTML_PEACOCK_MOUNT }} />
                              <p className="text-sm text-gray-300 mb-3">
                                A magnificent Garu with iridescent peacock plumage that shimmers in the light.
                              </p>
                              {profile?.faction_xp && Math.max(...Object.values(profile.faction_xp)) >= 100000 ? (
                                <div className="flex items-center text-green-400">
                                  <Unlock className="w-4 h-4 mr-2" />
                                  UNLOCKED
                                </div>
                              ) : (
                                <div className="flex items-center text-gray-400">
                                  <Lock className="w-4 h-4 mr-2" />
                                  {profile?.faction_xp ? Math.max(...Object.values(profile.faction_xp)) : 0} / 100,000 XP
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <div className="mt-6 p-4 bg-primary/10 border border-primary/30 rounded-lg">
                            <h4 className="font-minecraft text-primary mb-2">HOW TO UNLOCK</h4>
                            <p className="text-sm text-gray-300">
                              Your highest Faction XP across all elements: <span className="text-primary font-bold">
                                {profile?.faction_xp ? Math.max(...Object.values(profile.faction_xp)).toLocaleString() : 0} XP
                              </span>
                            </p>
                            <p className="text-xs text-gray-400 mt-2">
                              Race in any game mode to earn Faction XP for your selected element. Elite unlocks are permanent once earned!
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>
                  </Tabs>
                </div>
              </div>
            </CardContent>
          </Card>
        </main>

        {/* Personal Glyph Toolkit */}
        <GlyphToolkit 
          isVisible={showGlyphToolkit}
          onToggle={() => setShowGlyphToolkit(!showGlyphToolkit)}
          unlockedGlyphs={unlockedGlyphs}
        />
      
      <Footer />
    </div>
  );
}