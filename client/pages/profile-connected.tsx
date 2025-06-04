import { useState, useEffect } from "react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLocation, Link } from "wouter";
import { ChickenAvatar } from "@/components/ui/chicken-avatar";
import { ChickenSprite } from "@/components/html-sprites/chicken-sprite";
import { JockeySprite } from "@/components/html-sprites/jockey-sprite";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { PlayerStats } from "@/components/player-stats";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { PixelButton } from "@/components/ui/pixel-button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getLevelFromXp, cn } from "@/lib/utils";
import { EggCard } from "@/components/ui/egg-card";
import { isUnlocked } from "@/lib/unlocks";

// Import HTML sprites
import { GaruEgg } from "@/components/html-sprites/garu-egg";
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
  Save
} from "lucide-react";

// Types
interface User {
  id: number;
  username: string;
  email?: string;
  avatar_url?: string;
  xp: number;
  races_won: number;
  total_races: number;
  avg_wpm: number;
  accuracy: number;
  prompts_added: number;
  chicken_name: string;
  chicken_type: string;
  jockey_type: string;
  trail_type: string;
  created_at: string;
}

interface Race {
  id: number;
  user_id: number;
  prompt_id: number;
  position: number;
  total_players: number;
  wpm: number;
  accuracy: number;
  time_taken: number;
  xp_gained: number;
  race_date: string;
}

interface Prompt {
  id: number;
  text: string;
  author_id: number;
  is_active: boolean;
  used_count: number;
  created_at: string;
}

interface GaruEgg {
  id: number;
  user_id: number;
  name: string;
  type: string;
  elemental_affinity: string;
  color: string;
  rarity: string;
  hatched: number;
  level: number;
  xp: number;
  stats: {
    speed: number;
    endurance: number;
    luck: number;
    intellect: number;
  };
  created_at: string;
  source: string;
}

interface ProfileResponse {
  id: number;
  username: string;
  email?: string;
  avatar_url?: string;
  xp: number;
  races_won: number;
  total_races: number;
  avg_wpm: number;
  accuracy: number;
  prompts_added: number;
  chicken_name: string;
  chicken_type: string;
  jockey_type: string;
  trail_type: string;
  created_at: string;
  faction: string;
  faction_xp: {
    d2: number;
    d4: number;
    d6: number;
    d8: number;
    d10: number;
    d12: number;
    d20: number;
    d100: number;
  };
  recentRaces: Race[];
  prompts: Prompt[];
  eggs: GaruEgg[];
}

interface Achievement {
  id: number;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  progress?: number;
  maxProgress?: number;
}

// Customization options
const chickenOptions = [
  // HTML Sprites (new system)
  { id: "html_matikah", name: "Matikah & Chalisa", requiredLevel: 0 },
  { id: "html_auto", name: "Auto & Timaru", requiredLevel: 0 },
  { id: "html_death", name: "Death", requiredLevel: 5 },
  { id: "html_iam", name: "Iam", requiredLevel: 10 },
  { id: "html_steve", name: "Steve", requiredLevel: 0 },
  { id: "html_teacherGuru", name: "Teacher Guru", requiredLevel: 15 },
  { id: "html_golden", name: "Golden Champion", requiredLevel: 15 },
];

const trailOptions = [
  { id: "none", name: "None" },
  { id: "dust", name: "Dust" },
  { id: "flames", name: "Flames", requiredLevel: 12 },
  { id: "rainbow", name: "Rainbow", requiredLevel: 18 }
];

// Achievement definitions
const getAchievements = (user: User): Achievement[] => [
  { 
    id: 1, 
    name: "First Race", 
    description: "Complete your first race", 
    icon: "🏁",
    unlocked: user.total_races > 0 
  },
  { 
    id: 2, 
    name: "Speed Demon", 
    description: "Reach 80 WPM", 
    icon: "🔥",
    unlocked: user.avg_wpm >= 80,
    progress: Math.min(user.avg_wpm, 80),
    maxProgress: 80
  },
  { 
    id: 3, 
    name: "Chicken Whisperer", 
    description: "Win 10 races", 
    icon: "🏆",
    unlocked: user.races_won >= 10,
    progress: Math.min(user.races_won, 10),
    maxProgress: 10
  },
  { 
    id: 4, 
    name: "Perfect Typist", 
    description: "Get 100% accuracy in a race", 
    icon: "✨",
    unlocked: user.accuracy >= 98 // We're being lenient here
  },
  { 
    id: 5, 
    name: "Marathon Runner", 
    description: "Complete 50 races", 
    icon: "🏃",
    unlocked: user.total_races >= 50,
    progress: Math.min(user.total_races, 50),
    maxProgress: 50
  },
  { 
    id: 6, 
    name: "Content Creator", 
    description: "Add 5 prompts to the system", 
    icon: "📝",
    unlocked: user.prompts_added >= 5,
    progress: Math.min(user.prompts_added, 5),
    maxProgress: 5
  },
  { 
    id: 7, 
    name: "Race Champion", 
    description: "Win more than 50% of your races", 
    icon: "👑",
    unlocked: user.total_races > 0 && (user.races_won / user.total_races) > 0.5
  },
  { 
    id: 8, 
    name: "Speed Typist", 
    description: "Maintain 95% accuracy at 70+ WPM", 
    icon: "⚡",
    unlocked: user.avg_wpm >= 70 && user.accuracy >= 95
  }
];

export default function ProfileConnected() {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("overview");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Form state for customization
  const [chickenName, setChickenName] = useState("");
  const [chickenType, setChickenType] = useState("");
  const [jockeyType, setJockeyType] = useState("");
  const [trailType, setTrailType] = useState("");
  const [faction, setFaction] = useState("");
  
  // Get user profile data
  const { data: profile, isLoading, isError } = useQuery({
    queryKey: ['/api/profile'],
    queryFn: async () => {
      const response = await fetch('/api/profile', {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch profile');
      }
      
      const data = await response.json();
      console.log("Fetched profile data:", data);
      return data;
    },
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000 // 5 minutes
  });

  // Fetch faction war data for the current faction status
  const { data: factionData } = useQuery({
    queryKey: ['/api/stats/factions'],
  });

  const factionStats = (factionData as { factions?: any[] })?.factions || [];
  
  // Mutation for updating customization
  const updateCustomizationMutation = useMutation({
    mutationFn: (data: { chickenName: string; chickenType: string; jockeyType: string; trailType: string; faction: string }) => {
      return apiRequest('PATCH', '/api/profile/customization', data);
    },
    onSuccess: () => {
      toast({
        title: "Customization Saved",
        description: "Your chicken jockey customization has been updated."
      });
      
      // Invalidate profile cache to refetch with new data
      queryClient.invalidateQueries({ queryKey: ['/api/profile'] });
    },
    onError: (error) => {
      console.error("Error updating customization:", error);
      toast({
        title: "Error",
        description: "Failed to update customization. Please try again.",
        variant: "destructive"
      });
    }
  });
  
  // Set document title
  useEffect(() => {
    document.title = "Profile - Chicken Jockey Scribe Racer";
  }, []);
  
  // Initialize form with user data when it loads
  useEffect(() => {
    if (profile) {
      // Only use custom name if it's not the default, otherwise show empty for user to fill
      setChickenName(profile.chicken_name && profile.chicken_name !== "Birdanus" ? profile.chicken_name : "");
      setChickenType(profile.chicken_type || "white");
      setJockeyType(profile.jockey_type || "steve");
      setTrailType(profile.trail_type || "none");
      setFaction(profile.faction || "d6");
    }
  }, [profile]);
  
  // Name validation function
  const validateChickenName = (name: string) => {
    if (name.length < 2) {
      return { valid: false, error: "Name must be at least 2 characters long" };
    }
    if (name.length > 20) {
      return { valid: false, error: "Name must be 20 characters or less" };
    }
    if (!/^[a-zA-Z0-9\s]+$/.test(name)) {
      return { valid: false, error: "Name can only contain letters, numbers, and spaces" };
    }
    return { valid: true };
  };

  // Handle customization form submission
  const handleSaveCustomization = () => {
    // Validate chicken name if provided
    if (chickenName.trim()) {
      const validation = validateChickenName(chickenName);
      if (!validation.valid) {
        toast({
          title: "Invalid Name",
          description: validation.error,
          variant: "destructive",
        });
        return;
      }
    }

    const finalChickenName = chickenName.trim() || "Talonhoof";
    
    updateCustomizationMutation.mutate({
      chickenName: finalChickenName,
      chickenType,
      jockeyType: jockeyType || chickenType, // Default to matching jockey and chicken
      trailType,
      faction
    });
  };
  
  // Get faction emoji
  const getFactionEmoji = (factionId: string) => {
    const factionEmojis: Record<string, string> = {
      'd2': '💰',
      'd4': '🔥', 
      'd6': '🌱',
      'd8': '💨',
      'd10': '⚡',
      'd12': '✨',
      'd20': '🌊',
      'd100': '⚖️'
    };
    return factionEmojis[factionId] || '💰';
  };

  // Calculate level and progress
  const getUserLevel = () => {
    if (!profile) return { level: 1, progress: 0 };
    
    const { level, progress } = getLevelFromXp(profile.xp || 0);
    return { level, progress };
  };
  
  // Get achievements
  const getUnlockedAchievements = () => {
    if (!profile) return [];
    return getAchievements(profile);
  };
  
  // Format date string
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };
  
  // If no session, show login prompt
  if (isError) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        
        <main className="flex-grow container mx-auto p-4 flex items-center justify-center">
          <Card className="w-full max-w-md bg-dark minecraft-border">
            <CardHeader>
              <CardTitle className="text-primary font-minecraft text-center">LOGIN REQUIRED</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-light">You need to be logged in to view your profile.</p>
              
              <div className="flex gap-4 justify-center mt-4">
                <PixelButton onClick={() => setLocation("/login")}>
                  Login
                </PixelButton>
                <PixelButton variant="outline" onClick={() => setLocation("/register")}>
                  Register
                </PixelButton>
              </div>
            </CardContent>
          </Card>
        </main>
        
        <Footer />
      </div>
    );
  }
  
  // Debug and fix profile data access
  console.log("Raw profile data:", profile);
  console.log("Profile has data:", profile && Object.keys(profile).length > 0);
  
  // Show loading until we have actual profile data
  if (!profile || !profile.username) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow container mx-auto p-4 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-light">Loading your profile data...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }
  
  const { level, progress } = getUserLevel();
  const achievements = getUnlockedAchievements();
  const unlockedCount = achievements.filter(a => a.unlocked).length;
  
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
          
          {isLoading ? (
            <CardContent className="p-6 flex justify-center items-center min-h-[400px]">
              <div className="text-center space-y-4">
                <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
                <p className="text-light">Loading profile data...</p>
              </div>
            </CardContent>
          ) : profile ? (
            <CardContent className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Profile summary */}
                <div className="lg:col-span-1">
                  <Card className="bg-dark/80 pixel-border border-primary/50">
                    <CardContent className="flex flex-col items-center p-4">
                      <div className="mb-4">
                        <ChickenAvatar
                          chickenType={profile.chicken_type || "html_matikah"}
                          jockeyType={profile.jockey_type || "html_matikah"}
                          size="lg"
                        />
                      </div>
                      <h2 className="text-xl text-primary font-bold mb-1">{profile.username}</h2>
                      <div className="flex items-center gap-2 mb-4">
                        <div className="bg-primary/20 w-7 h-7 flex items-center justify-center">
                          <span className="text-primary font-pixel text-xs">{level}</span>
                        </div>
                        <span className="text-light text-sm">
                          {level < 5 ? "Novice Typist" : 
                           level < 10 ? "Adept Scribe" : 
                           level < 15 ? "Master Typist" : 
                           level < 20 ? "Grandmaster Scribe" : 
                           "Legendary Typist"}
                        </span>
                      </div>
                      
                      <div className="w-full mb-6">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-secondary">Level {level}</span>
                          <span className="text-secondary">Level {level + 1}</span>
                        </div>
                        <div className="h-2 w-full bg-dark border border-primary">
                          <div 
                            className="h-full bg-primary" 
                            style={{ width: `${progress}%` }}
                          ></div>
                        </div>
                        <div className="text-xs text-center mt-1 text-light/70">
                          {progress}% to next level
                        </div>
                      </div>
                      
                      {/* QLX Coins Display */}
                      <div className="w-full mb-4 p-3 bg-black/40 border border-yellow-500/50 rounded">
                        <div className="flex items-center justify-center gap-2">
                          <span className="text-lg">🧮</span>
                          <span className="text-yellow-400 font-bold">
                            {profile.qlx_coins || 0} QuiLuX Coins
                          </span>
                        </div>
                      </div>

                      <PlayerStats
                        level={level}
                        xpProgress={progress}
                        racesWon={profile.races_won || 0}
                        avgWpm={profile.avg_wpm || 0}
                        accuracy={profile.accuracy || 0}
                        promptsAdded={profile.prompts_added || 0}
                      />
                      
                      <div className="text-xs text-light/50 mt-4">
                        Member since: {profile.created_at ? new Date(profile.created_at).toLocaleDateString() : "Recently"}
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                {/* Main content area */}
                <div className="lg:col-span-3">
                  <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="bg-dark border-2 border-primary flex w-full flex-wrap gap-1">
                      <TabsTrigger 
                        value="overview" 
                        className="px-3 py-2 text-xs font-minecraft data-[state=active]:bg-primary data-[state=active]:text-dark whitespace-nowrap"
                      >
                        OVERVIEW
                      </TabsTrigger>
                      <TabsTrigger 
                        value="statistics" 
                        className="px-3 py-2 text-xs font-minecraft data-[state=active]:bg-primary data-[state=active]:text-dark whitespace-nowrap"
                      >
                        STATS
                      </TabsTrigger>
                      <TabsTrigger 
                        value="eggs" 
                        className="px-3 py-2 text-xs font-minecraft data-[state=active]:bg-primary data-[state=active]:text-dark whitespace-nowrap"
                      >
                        EGGS
                      </TabsTrigger>
                      <TabsTrigger 
                        value="customize" 
                        className="px-3 py-2 text-xs font-minecraft data-[state=active]:bg-primary data-[state=active]:text-dark whitespace-nowrap"
                      >
                        CUSTOMIZE
                      </TabsTrigger>
                      <TabsTrigger 
                        value="elemental" 
                        className="px-3 py-2 text-xs font-minecraft data-[state=active]:bg-primary data-[state=active]:text-dark whitespace-nowrap"
                      >
                        XP
                      </TabsTrigger>
                      <TabsTrigger 
                        value="achievements" 
                        className="px-3 py-2 text-xs font-minecraft data-[state=active]:bg-primary data-[state=active]:text-dark whitespace-nowrap"
                      >
                        BADGES
                      </TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="overview" className="mt-6 space-y-6">
                      {/* Recent races */}
                      <Card className="bg-dark/80 pixel-border border-primary/50">
                        <CardHeader>
                          <CardTitle className="text-lg text-primary font-minecraft">RECENT RACES</CardTitle>
                        </CardHeader>
                        <CardContent>
                          {profile.recentRaces && profile.recentRaces.length > 0 ? (
                            <div className="space-y-3">
                              {profile.recentRaces.map((race) => (
                                <div key={race.id} className="p-3 border border-primary/30 bg-primary/10 rounded-sm">
                                  <div className="flex justify-between mb-2">
                                    <div className="text-primary font-bold">
                                      Position: {race.position} / {race.total_players}
                                    </div>
                                    <div className="text-light/70 text-xs">
                                      {formatDate(race.race_date)}
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
                                      <span className="text-light">+{race.xp_gained}</span>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-center text-light/50">No race history yet. Start racing to see your stats!</p>
                          )}
                        </CardContent>
                      </Card>
                      
                      {/* Quick actions */}
                      <Card className="bg-dark/80 pixel-border border-primary/50">
                        <CardHeader>
                          <CardTitle className="text-lg text-primary font-minecraft">QUICK ACTIONS</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                            <div className="p-3 border border-primary/30 rounded">
                              <div className="text-sm text-light/70">Total Races</div>
                              <div className="text-2xl text-primary font-bold">{profile.total_races}</div>
                            </div>
                            <div className="p-3 border border-primary/30 rounded">
                              <div className="text-sm text-light/70">Races Won</div>
                              <div className="text-2xl text-primary font-bold">{profile.races_won}</div>
                            </div>
                            <div className="p-3 border border-primary/30 rounded">
                              <div className="text-sm text-light/70">Win Rate</div>
                              <div className="text-2xl text-primary font-bold">
                                {profile.total_races > 0 ? Math.round((profile.races_won / profile.total_races) * 100) : 0}%
                              </div>
                            </div>
                            <div className="p-3 border border-primary/30 rounded">
                              <div className="text-sm text-light/70">Average WPM</div>
                              <div className="text-2xl text-primary font-bold">{profile.avg_wpm}</div>
                            </div>
                            <div className="p-3 border border-primary/30 rounded">
                              <div className="text-sm text-light/70">Accuracy</div>
                              <div className="text-2xl text-primary font-bold">{profile.accuracy}%</div>
                            </div>
                            <div className="p-3 border border-primary/30 rounded">
                              <div className="text-sm text-light/70">Total XP</div>
                              <div className="text-2xl text-primary font-bold">{profile.xp}</div>
                            </div>
                            <div className="p-3 border border-primary/30 rounded">
                              <div className="text-sm text-light/70">Level</div>
                              <div className="text-2xl text-primary font-bold">{level}</div>
                            </div>
                            <div className="p-3 border border-primary/30 rounded">
                              <div className="text-sm text-light/70">Prompts Added</div>
                              <div className="text-2xl text-primary font-bold">{profile.prompts_added}</div>
                            </div>
                            <div className="p-3 border border-primary/30 rounded">
                              <div className="text-sm text-light/70">Achievements</div>
                              <div className="text-2xl text-primary font-bold">{unlockedCount}/{achievements.length}</div>
                            </div>
                          </div>
                          
                          {/* Submitted prompts */}
                          {profile.prompts && profile.prompts.length > 0 && (
                            <div className="mt-6">
                              <h3 className="text-primary font-minecraft mb-3">YOUR PROMPTS</h3>
                              <div className="space-y-2">
                                {profile.prompts.map(prompt => (
                                  <div key={prompt.id} className="p-3 bg-dark border border-primary/30 rounded text-sm">
                                    <div className="mb-1 flex justify-between">
                                      <span className="text-xs text-light/50">Used {prompt.used_count} times</span>
                                      <span className="text-xs text-light/50">{formatDate(prompt.created_at)}</span>
                                    </div>
                                    <p className="text-light">{prompt.text}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </TabsContent>
                    
                    <TabsContent value="eggs" className="mt-6 space-y-4">
                      <div className="bg-gray-900 border-2 border-yellow-500 rounded-lg p-6">
                        <h2 className="text-2xl font-minecraft text-yellow-500 mb-2">ELEMENTAL EGG COLLECTION</h2>
                        <p className="text-gray-300 mb-6">Collect and hatch magical Garu eggs by typing in the Egg Shrine!</p>
                        
                        <div className="text-center py-8">
                          <div className="text-6xl mb-4">🥚</div>
                          <h3 className="text-lg font-minecraft text-yellow-500 mb-2">No Eggs Yet</h3>
                          <p className="text-gray-300 mb-4">
                            Visit the Egg Shrine to type sacred texts and collect magical Garu eggs!
                          </p>
                          <button 
                            onClick={() => window.location.href = '/egg-shrine'}
                            className="bg-yellow-500 text-black px-6 py-3 rounded-lg font-minecraft hover:bg-yellow-400 transition-colors"
                          >
                            VISIT EGG SHRINE
                          </button>
                        </div>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="elemental" className="mt-6 space-y-6">
                      {/* Elemental Faction System */}
                      <Card className="bg-dark/80 pixel-border border-primary/50">
                        <CardHeader>
                          <CardTitle className="text-lg text-primary font-minecraft">ELEMENTAL FACTION & XP SYSTEM</CardTitle>
                          <p className="text-light/70 text-sm">Choose your faction and track your elemental XP progress across all 8 elements</p>
                        </CardHeader>
                        <CardContent className="space-y-6">


                          {/* Current Faction Status */}
                          <div className="mb-6">
                            <div className="flex items-center justify-between mb-3">
                              <h3 className="text-primary font-bold">Current Faction Status</h3>
                              <button 
                                onClick={() => setLocation("/faction-war")}
                                className="text-xs text-yellow-400 hover:text-yellow-300 underline"
                              >
                                View Full Standings →
                              </button>
                            </div>
                            {factionStats.length > 0 && profile?.faction && (() => {
                              const currentFactionData = factionStats.find((f: any) => f.faction === profile.faction);
                              const factionInfoMap = {
                                d2: { name: 'Coin', emoji: '💰', color: '#C0C0C0' },
                                d4: { name: 'Fire', emoji: '🔥', color: '#FF4444' },
                                d6: { name: 'Earth', emoji: '🌱', color: '#22C55E' },
                                d8: { name: 'Air', emoji: '💨', color: '#FFFFFF' },
                                d10: { name: 'Chaos', emoji: '⚡', color: '#4F46E5' },
                                d12: { name: 'Ether', emoji: '✨', color: '#000000' },
                                d20: { name: 'Water', emoji: '🌊', color: '#3B82F6' },
                                d100: { name: 'Order', emoji: '⚖️', color: '#FFD700' }
                              };
                              const factionInfo = factionInfoMap[profile.faction as keyof typeof factionInfoMap];
                              
                              if (!currentFactionData || !factionInfo) return null;
                              
                              const rank = factionStats.findIndex((f: any) => f.faction === profile.faction) + 1;
                              
                              return (
                                <div className="border border-primary/30 p-4 rounded bg-primary/5">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                      <div 
                                        className={`w-10 h-10 rounded border flex items-center justify-center text-lg ${profile.faction === 'd8' ? 'border-gray-400' : 'border-gray-600'}`}
                                        style={{ backgroundColor: factionInfo.color, color: factionInfo.color === '#000000' ? '#FFFFFF' : '#000000' }}
                                      >
                                        {factionInfo.emoji}
                                      </div>
                                      <div>
                                        <h4 className="text-lg font-bold text-primary">
                                          {factionInfo.name} Faction (D{profile.faction.slice(1)})
                                        </h4>
                                        <p className="text-xs text-light/60">Rank #{rank} • {currentFactionData.playerCount} active members</p>
                                      </div>
                                    </div>
                                    <div className="text-right">
                                      <div className="text-xl font-bold text-primary">
                                        {currentFactionData.totalXp.toLocaleString()} XP
                                      </div>
                                      {currentFactionData.topPlayer && (
                                        <div className="text-xs text-light/80">
                                          Top: {currentFactionData.topPlayer}
                                          {currentFactionData.topPlayerMount && (
                                            <span className="text-yellow-400"> ({currentFactionData.topPlayerMount})</span>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              );
                            })()}
                          </div>

                          {/* Total XP Progress */}
                          <div>
                            <h3 className="text-primary font-bold mb-4">XP Progress</h3>
                            <div className="border border-primary/30 p-4 rounded bg-dark/50">
                              <div className="flex items-center justify-between mb-3">
                                <div>
                                  <h4 className="font-bold text-light text-lg">Total XP</h4>
                                  <p className="text-sm text-light/60">Level {Math.floor((profile?.xp || 0) / 100) + 1}</p>
                                </div>
                                <div className="text-right">
                                  <p className="font-bold text-primary text-2xl">{profile?.xp || 0}</p>
                                  <p className="text-xs text-light/60">XP Earned</p>
                                </div>
                              </div>
                              <div className="w-full bg-dark border border-primary/30 h-3 rounded">
                                <div 
                                  className="h-full bg-gradient-to-r from-yellow-400 to-primary rounded"
                                  style={{ width: `${Math.min(100, ((profile?.xp || 0) % 100))}%` }}
                                ></div>
                              </div>
                              <p className="text-xs text-light/50 mt-2 text-center">
                                {(profile?.xp || 0) % 100}/100 to next level
                              </p>
                            </div>
                          </div>

                          {/* Faction XP Breakdown */}
                          <div>
                            <h3 className="text-primary font-bold mb-4">Faction XP Breakdown</h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                              {[
                                { name: "D2 Coin", faction: "d2", color: "#C0C0C0" },
                                { name: "D4 Fire", faction: "d4", color: "#FF4444" },
                                { name: "D6 Earth", faction: "d6", color: "#22C55E" },
                                { name: "D8 Air", faction: "d8", color: "#FFFFFF" },
                                { name: "D10 Chaos", faction: "d10", color: "#4F46E5" },
                                { name: "D12 Ether", faction: "d12", color: "#000000" },
                                { name: "D20 Water", faction: "d20", color: "#3B82F6" },
                                { name: "D100 Order", faction: "d100", color: "#FFD700" }
                              ].map((element) => {
                                // Get faction XP from stored faction_xp data
                                const factionXP = profile?.faction_xp?.[element.faction] || 0;
                                
                                const isCurrentFaction = profile?.faction === element.faction;
                                
                                return (
                                  <div key={element.faction} className={`border p-3 rounded ${isCurrentFaction ? 'border-yellow-400 bg-yellow-400/10' : 'border-primary/30 bg-dark/50'}`}>
                                    <div className="text-center">
                                      <div 
                                        className={`w-8 h-8 rounded border mx-auto mb-2 ${isCurrentFaction ? 'ring-2 ring-yellow-400' : ''} ${element.faction === 'd8' ? 'border-gray-400' : 'border-gray-600'}`}
                                        style={{ backgroundColor: element.color }}
                                      ></div>
                                      <h4 className={`font-bold text-xs ${isCurrentFaction ? 'text-yellow-400' : 'text-light'}`}>
                                        {element.name}
                                        {isCurrentFaction && <span className="ml-1">⭐</span>}
                                      </h4>
                                      <p className="text-primary font-bold text-lg">{factionXP}</p>
                                      <p className="text-xs text-light/60">XP</p>
                                      {isCurrentFaction && (
                                        <p className="text-xs text-yellow-400 font-bold mt-1">CURRENT</p>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          {/* Faction Selection */}
                          <div>
                            <h3 className="text-primary font-bold mb-3">Change Faction</h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                              {[
                                { id: "d2", name: "Coin", color: "#C0C0C0", border: "border-gray-300" },
                                { id: "d4", name: "Fire", color: "#FF4444", border: "border-red-300" },
                                { id: "d6", name: "Earth", color: "#22C55E", border: "border-green-300" },
                                { id: "d8", name: "Air", color: "#FFFFFF", border: "border-gray-300" },
                                { id: "d10", name: "Chaos", color: "#4F46E5", border: "border-indigo-300" },
                                { id: "d12", name: "Ether", color: "#000000", border: "border-gray-500" },
                                { id: "d20", name: "Water", color: "#3B82F6", border: "border-blue-300" },
                                { id: "d100", name: "Order", color: "#FFD700", border: "border-yellow-300" }
                              ].map((faction) => (
                                <button
                                  key={faction.id}
                                  className={`p-3 border-2 ${faction.border} rounded hover:scale-105 transition-transform`}
                                  style={{ backgroundColor: faction.color }}
                                  onClick={async () => {
                                    try {
                                      await apiRequest('POST', '/api/profile/faction', { faction: faction.id });
                                      queryClient.invalidateQueries({ queryKey: ['/api/profile'] });
                                      toast({
                                        title: "Faction Changed!",
                                        description: `You are now aligned with the ${faction.name} faction.`,
                                      });
                                    } catch (error) {
                                      toast({
                                        title: "Error",
                                        description: "Failed to change faction. Please try again.",
                                        variant: "destructive",
                                      });
                                    }
                                  }}
                                >
                                  <div className={`font-bold text-lg ${
                                    faction.id === 'd12' ? 'text-white' : 
                                    faction.id === 'd8' ? 'text-gray-800' : 
                                    faction.id === 'd100' ? 'text-gray-800' : 
                                    faction.id === 'd2' ? 'text-gray-800' : 
                                    'text-white'
                                  }`}>{faction.id.toUpperCase()}</div>
                                  <div className={`text-xs ${
                                    faction.id === 'd12' ? 'text-white' : 
                                    faction.id === 'd8' ? 'text-gray-800' : 
                                    faction.id === 'd100' ? 'text-gray-800' : 
                                    faction.id === 'd2' ? 'text-gray-800' : 
                                    'text-white'
                                  }`}>{faction.name}</div>
                                </button>
                              ))}
                            </div>
                            <p className="text-light/60 text-xs mt-3 text-center">
                              Your selected faction determines which elemental XP you gain from races
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>
                    
                    <TabsContent value="customize" className="mt-6">
                      <div className="bg-gray-900 border-2 border-yellow-500 rounded-lg p-6">
                        <h2 className="text-2xl font-minecraft text-yellow-500 mb-6">CUSTOMIZE YOUR CHICKEN JOCKEY</h2>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          {/* Character Preview */}
                          <div className="md:col-span-1">
                            <div className="bg-gray-800 border-2 border-yellow-500 rounded-lg p-6 flex flex-col items-center">
                              <div className="w-32 h-32 mb-4 flex items-center justify-center bg-gray-700 rounded-lg border border-gray-600">
                                <ChickenAvatar 
                                  chickenType={chickenType}
                                  jockeyType={jockeyType}
                                  size="lg"
                                  animation="idle"
                                  className="w-full h-full"
                                />
                              </div>
                              <h3 className="text-yellow-500 font-bold text-lg mb-1">{chickenName || "Talonhoof"}</h3>
                              <p className="text-gray-300 text-sm text-center">Level {level} • {['💰','🔥','🌱','💨','⚡','✨','🌊','⚖️'][['d2','d4','d6','d8','d10','d12','d20','d100'].indexOf(faction)] || '💰'} {faction.toUpperCase()} Faction</p>
                            </div>
                          </div>
                          
                          {/* Customization Form */}
                          <div className="md:col-span-2 space-y-6">
                            {/* Name Input */}
                            <div>
                              <label className="block text-yellow-500 font-minecraft text-sm mb-2">Mount Name</label>
                              <input
                                type="text"
                                value={chickenName}
                                onChange={(e) => setChickenName(e.target.value)}
                                placeholder="Enter custom chicken name"
                                maxLength={20}
                                className="w-full p-3 bg-gray-800 border-2 border-yellow-500 text-white placeholder-gray-400 rounded-lg focus:border-yellow-400 focus:outline-none transition-colors"
                              />
                            </div>
                            
                            {/* Garu Type */}
                            <div>
                              <label className="block text-yellow-500 font-minecraft text-sm mb-2">Garu Type</label>
                              <div className="mb-2 p-2 bg-gray-700 rounded border flex items-center gap-2">
                                <div className="w-8 h-8 bg-gray-600 rounded flex items-center justify-center">
                                  <ChickenSprite 
                                    variant="normal"
                                    colorScheme={chickenType === 'white' ? '#F5F5DC' :
                                               chickenType === 'black' ? '#333333' :
                                               chickenType === 'brown' ? '#8B4513' :
                                               chickenType === 'gold' ? '#FFD700' :
                                               chickenType === 'blue' ? '#4169E1' :
                                               chickenType === 'red' ? '#DC143C' :
                                               chickenType === 'green' ? '#228B22' :
                                               chickenType === 'cyan' ? '#00CED1' :
                                               chickenType === 'purple' ? '#8A2BE2' :
                                               chickenType === 'pink' ? '#FF69B4' :
                                               chickenType === 'indigo' ? '#4B0082' :
                                               chickenType === 'orange' ? '#FF8C00' : '#F5F5DC'}
                                    size="xs"
                                    animation="idle"
                                    direction="right"
                                    pixelSize={1}
                                    showName={false}
                                  />
                                </div>
                                <span className="text-gray-300 text-sm">Mount Preview</span>
                              </div>
                              <select
                                value={chickenType}
                                onChange={(e) => setChickenType(e.target.value)}
                                className="w-full p-3 bg-gray-800 border-2 border-yellow-500 text-white rounded-lg focus:border-yellow-400 focus:outline-none transition-colors"
                              >
                                <option value="white">White Garu (Always Available)</option>
                                <option value="black">Black Garu (Always Available)</option>
                                <option value="brown">Brown Garu (Always Available)</option>
                                {isUnlocked('mounts', 'html_steve') && <option value="steve">⚔️ Steve's Garu (Campaign Reward)</option>}
                                {isUnlocked('mounts', 'html_auto') && <option value="auto">🔧 Timaru (Auto's Campaign Reward)</option>}
                                {isUnlocked('mounts', 'html_ember') && <option value="ember">🔥 Ember (Auto's Campaign Reward)</option>}
                                {isUnlocked('mounts', 'html_matikah') && <option value="matikah">🌙 Chalisa (Matikah's Campaign Reward)</option>}
                                {isUnlocked('mounts', 'html_iam') && <option value="iam">📝 Iam's Garu (Campaign Reward)</option>}
                                {(profile?.faction_xp?.d2 || 0) >= 1000 && <option value="blue">💰 Coin Garu (D2 - 1000 XP)</option>}
                                {(profile?.faction_xp?.d4 || 0) >= 1000 && <option value="red">🔥 Fire Garu (D4 - 1000 XP)</option>}
                                {(profile?.faction_xp?.d6 || 0) >= 1000 && <option value="green">🌱 Earth Garu (D6 - 1000 XP)</option>}
                                {(profile?.faction_xp?.d8 || 0) >= 1000 && <option value="cyan">💨 Air Garu (D8 - 1000 XP)</option>}
                                {(profile?.faction_xp?.d10 || 0) >= 1000 && <option value="purple">⚡ Chaos Garu (D10 - 1000 XP)</option>}
                                {(profile?.faction_xp?.d12 || 0) >= 1000 && <option value="pink">✨ Ether Garu (D12 - 1000 XP)</option>}
                                {(profile?.faction_xp?.d20 || 0) >= 1000 && <option value="indigo">🌊 Water Garu (D20 - 1000 XP)</option>}
                                {(profile?.faction_xp?.d100 || 0) >= 1000 && <option value="orange">⚖️ Order Garu (D100 - 1000 XP)</option>}
                                <option value="gold">🏆 Golden Garu (Special Event)</option>
                                {Math.max(...Object.values(profile?.faction_xp || {})) >= 1000 && <option value="peacock_mount">🦚 Peacock Mount (Ultra Elite)</option>}
                              </select>
                            </div>
                            
                            {/* Jockey Type */}
                            <div>
                              <label className="block text-yellow-500 font-minecraft text-sm mb-2">Jockey Type</label>
                              <div className="mb-2 p-2 bg-gray-700 rounded border flex items-center gap-2">
                                <div className="w-8 h-8 bg-gray-600 rounded flex items-center justify-center">
                                  <JockeySprite 
                                    character={jockeyType === 'steve' ? 'steve' :
                                              jockeyType === 'auto' ? 'auto' :
                                              jockeyType === 'matikah' ? 'matikah' :
                                              jockeyType === 'iam' ? 'iam' :
                                              jockeyType === 'generic' ? 'generic' : 'custom'}
                                    outfitColor={jockeyType === 'coin_jockey' ? '#FFD700' :
                                               jockeyType === 'fire_jockey' ? '#FF4500' :
                                               jockeyType === 'earth_jockey' ? '#8B4513' :
                                               jockeyType === 'air_jockey' ? '#87CEEB' :
                                               jockeyType === 'chaos_jockey' ? '#8B008B' :
                                               jockeyType === 'ether_jockey' ? '#DDA0DD' :
                                               jockeyType === 'water_jockey' ? '#4682B4' :
                                               jockeyType === 'order_jockey' ? '#F5F5F5' : undefined}
                                    size="xs"
                                    animation="idle"
                                    direction="right"
                                    pixelSize={1}
                                    showName={false}
                                  />
                                </div>
                                <span className="text-gray-300 text-sm">Jockey Preview</span>
                              </div>
                              <select
                                value={jockeyType}
                                onChange={(e) => setJockeyType(e.target.value)}
                                className="w-full p-3 bg-gray-800 border-2 border-yellow-500 text-white rounded-lg focus:border-yellow-400 focus:outline-none transition-colors"
                              >
                                <option value="zombie">🧟 Zombie Jockey (Always Available)</option>
                                {isUnlocked('jockeys', 'steve') && <option value="steve">⚔️ Steve (Campaign Reward)</option>}
                                {isUnlocked('jockeys', 'auto') && <option value="auto">🔧 Auto (Campaign Reward)</option>}
                                {isUnlocked('jockeys', 'matikah') && <option value="matikah">🌙 Matikah (Campaign Reward)</option>}
                                {isUnlocked('jockeys', 'iam') && <option value="iam">📝 Iam (Campaign Reward)</option>}
                                {(profile?.faction_xp?.d2 || 0) >= 500 && <option value="coin_jockey">💰 Coin Rider (D2)</option>}
                                {(profile?.faction_xp?.d4 || 0) >= 500 && <option value="fire_jockey">🔥 Fire Rider (D4)</option>}
                                {(profile?.faction_xp?.d6 || 0) >= 500 && <option value="earth_jockey">🌱 Earth Rider (D6)</option>}
                                {(profile?.faction_xp?.d8 || 0) >= 500 && <option value="air_jockey">💨 Air Rider (D8)</option>}
                                {(profile?.faction_xp?.d10 || 0) >= 500 && <option value="chaos_jockey">⚡ Chaos Rider (D10)</option>}
                                {(profile?.faction_xp?.d12 || 0) >= 500 && <option value="ether_jockey">✨ Ether Rider (D12)</option>}
                                {(profile?.faction_xp?.d20 || 0) >= 500 && <option value="water_jockey">🌊 Water Rider (D20)</option>}
                                {(profile?.faction_xp?.d100 || 0) >= 500 && <option value="order_jockey">⚖️ Order Rider (D100)</option>}
                                {Math.max(...Object.values(profile?.faction_xp || {})) >= 900 && <option value="golden_champion">👑 Golden Champion (Elite)</option>}
                                {Math.max(...Object.values(profile?.faction_xp || {})) >= 1000 && <option value="peacock_champion">🦚 Peacock Champion (Ultra Elite)</option>}
                              </select>
                            </div>
                            
                            {/* Campaign Trail Selection */}
                            <div>
                              <label className="block text-yellow-500 font-minecraft text-sm mb-2">Campaign Trail</label>
                              <div className="flex items-center justify-center mb-2 p-3 bg-gray-900 border border-yellow-600 rounded">
                                <div className="text-center">
                                  <div className="text-xs text-yellow-200 mb-1">Trail Preview</div>
                                  <div className="w-12 h-6 mx-auto rounded-sm relative overflow-hidden bg-gray-800">
                                    {/* Trail preview based on selection */}
                                    {(() => {
                                      const selectedTrail = localStorage.getItem('selectedTrail') || 'none';
                                      switch(selectedTrail) {
                                        case 'steve':
                                          return <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-500 opacity-70 animate-pulse"></div>;
                                        case 'auto':
                                          return <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-500 opacity-70 animate-pulse"></div>;
                                        case 'matikah':
                                          return <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-purple-600 opacity-70 animate-pulse"></div>;
                                        case 'iam':
                                          return <div className="absolute inset-0 bg-gradient-to-r from-pink-400 to-blue-400 opacity-70 animate-pulse"></div>;
                                        default:
                                          return <div className="text-xs text-gray-500">None</div>;
                                      }
                                    })()}
                                  </div>
                                </div>
                              </div>
                              <select
                                value={localStorage.getItem('selectedTrail') || 'none'}
                                onChange={(e) => {
                                  localStorage.setItem('selectedTrail', e.target.value);
                                  window.location.reload(); // Refresh to update preview
                                }}
                                className="w-full p-3 bg-gray-800 border-2 border-yellow-500 text-white rounded-lg focus:border-yellow-400 focus:outline-none transition-colors"
                              >
                                <option value="none">🚫 No Trail (Default)</option>
                                {isUnlocked('trails', 'steve') && <option value="steve">✨ Steve's Festival Trail (Campaign Reward)</option>}
                                {isUnlocked('trails', 'auto') && <option value="auto">⚙️ Auto's Tech Trail (Campaign Reward)</option>}
                                {isUnlocked('trails', 'matikah') && <option value="matikah">🌙 Matikah's Mystic Trail (Campaign Reward)</option>}
                                {isUnlocked('trails', 'iam') && <option value="iam">📜 Iam's Poetry Trail (Campaign Reward)</option>}
                              </select>
                            </div>
                            
                            {/* Faction Selection */}
                            <div>
                              <label className="block text-yellow-500 font-minecraft text-sm mb-2">Current Faction</label>
                              <select
                                value={faction}
                                onChange={(e) => setFaction(e.target.value)}
                                className="w-full p-3 bg-gray-800 border-2 border-yellow-500 text-white rounded-lg focus:border-yellow-400 focus:outline-none transition-colors"
                              >
                                <option value="d2">💰 D2 - Coin (Duality & Balance)</option>
                                <option value="d4">🔥 D4 - Fire (Passion & Energy)</option>
                                <option value="d6">🌱 D6 - Earth (Stability & Growth)</option>
                                <option value="d8">💨 D8 - Air (Freedom & Speed)</option>
                                <option value="d10">⚡ D10 - Chaos (Change & Power)</option>
                                <option value="d12">✨ D12 - Ether (Mystery & Magic)</option>
                                <option value="d20">🌊 D20 - Water (Flow & Adaptability)</option>
                                <option value="d100">⚖️ D100 - Order (Structure & Control)</option>
                              </select>
                            </div>
                            
                            {/* Save Button */}
                            <div className="pt-4">
                              <button
                                onClick={handleSaveCustomization}
                                disabled={updateCustomizationMutation.isPending}
                                className="w-full p-4 bg-yellow-500 hover:bg-yellow-400 text-black font-minecraft text-lg rounded-lg border-2 border-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                              >
                                {updateCustomizationMutation.isPending ? (
                                  <>
                                    <div className="animate-spin w-5 h-5 border-2 border-black border-t-transparent rounded-full mr-2"></div>
                                    Saving...
                                  </>
                                ) : (
                                  <>
                                    <Save className="mr-2 h-5 w-5" />
                                    Save Customization
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="achievements" className="mt-6">
                      <Card className="bg-dark/80 pixel-border border-primary/50">
                        <CardHeader>
                          <CardTitle className="text-lg text-primary font-minecraft">ACHIEVEMENTS ({unlockedCount}/{achievements.length})</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {achievements.map((achievement) => (
                              <div 
                                key={achievement.id} 
                                className={`p-4 border ${achievement.unlocked ? 'border-primary/70 bg-primary/10' : 'border-gray-700 bg-gray-900/30'} rounded-sm`}
                              >
                                <div className="flex items-center gap-3">
                                  <div className="text-2xl">{achievement.icon}</div>
                                  <div>
                                    <h3 className={`font-bold ${achievement.unlocked ? 'text-primary' : 'text-gray-400'}`}>
                                      {achievement.name}
                                      {achievement.unlocked ? (
                                        <span className="ml-2 text-xs bg-primary/20 text-primary px-1 py-0.5 rounded">UNLOCKED</span>
                                      ) : (
                                        <span className="ml-2 text-xs bg-gray-800 text-gray-400 px-1 py-0.5 rounded">LOCKED</span>
                                      )}
                                    </h3>
                                    <p className={`text-sm ${achievement.unlocked ? 'text-light/70' : 'text-gray-500'}`}>
                                      {achievement.description}
                                    </p>
                                    
                                    {/* Progress bar for achievements with progress */}
                                    {achievement.progress !== undefined && achievement.maxProgress !== undefined && (
                                      <div className="mt-2 w-full">
                                        <div className="h-1.5 w-full bg-dark border border-gray-700 overflow-hidden">
                                          <div 
                                            className={`h-full ${achievement.unlocked ? 'bg-primary' : 'bg-gray-600'}`}
                                            style={{ width: `${(achievement.progress / achievement.maxProgress) * 100}%` }}
                                          ></div>
                                        </div>
                                        <div className="text-xs mt-1 text-gray-500">
                                          {achievement.progress} / {achievement.maxProgress}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>
                  </Tabs>
                </div>
              </div>
            </CardContent>
          ) : (
            <CardContent className="p-6 text-center">
              <p className="text-light">No profile data available. Please try again.</p>
            </CardContent>
          )}
        </Card>
      </main>
      
      <Footer />
    </div>
  );
}