import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ChickenAvatar } from '@/components/ui/chicken-avatar';
import { 
  Sword, 
  Crown, 
  Users, 
  Trophy, 
  Zap, 
  Flame, 
  Droplets, 
  Wind, 
  Mountain, 
  Sparkles, 
  Coins, 
  Shield,
  ChevronRight,
  Target,
  BookOpen,
  Gamepad2
} from 'lucide-react';

interface FactionStats {
  faction: string;
  name: string;
  element: string;
  totalXp: number;
  playerCount: number;
  avgXp: number;
  eggType: string;
  color: string;
  description: string;
}

interface UserProfile {
  id: number;
  username: string;
  current_faction: string;
  faction_xp: Record<string, number>;
  chicken_type: string;
  jockey_type: string;
  chicken_name: string;
  [key: string]: any;
}

const FACTION_INFO = {
  d2: {
    name: 'Coin',
    element: 'Coin',
    eggType: 'silver 🥚',
    color: '#C0C0C0',
    icon: Coins,
    description: 'The Coin faction values practical efficiency and measured progress. Swift decisions and calculated strategies guide their pursuit of victory through the silver 🥚\'s power.'
  },
  d4: {
    name: 'Fire',
    element: 'Fire',
    eggType: 'flameheart 🥚',
    color: '#FF4444',
    icon: Flame,
    description: 'Forge masters who channel the flameheart 🥚\'s molten energy. Every keystroke must be precise and powerful, like the strike of a master blacksmith shaping destiny.'
  },
  d6: {
    name: 'Earth',
    element: 'Earth',
    eggType: 'terraverde 🥚',
    color: '#22C55E',
    icon: Mountain,
    description: 'Deep beneath mountain roots, the terraverde 🥚 whispers secrets of endurance. Steady hands and unwavering determination carve paths through solid rock.'
  },
  d8: {
    name: 'Air',
    element: 'Air',
    eggType: 'skywisp 🥚',
    color: '#FFFFFF',
    icon: Wind,
    description: 'High above the clouds where winds dance freely, the skywisp 🥚 carries messages across vast distances. Agility and grace guide every action.'
  },
  d10: {
    name: 'Chaos',
    element: 'Chaos',
    eggType: 'voidmyst 🥚',
    color: '#4F46E5',
    icon: Zap,
    description: 'The voidmyst 🥚 thrives in uncertainty and embraces the unpredictable. Chaos faction members find strength in disorder and opportunity in randomness.'
  },
  d12: {
    name: 'Ether',
    element: 'Ether',
    eggType: 'ethereal 🥚',
    color: '#000000',
    icon: Sparkles,
    description: 'Mystical scholars bonded to the ethereal 🥚 explore boundaries between known and unknown. They seek deeper understanding through ancient wisdom.'
  },
  d20: {
    name: 'Water',
    element: 'Water',
    eggType: 'aquafrost 🥚',
    color: '#3B82F6',
    icon: Droplets,
    description: 'The aquafrost 🥚 flows around obstacles and adapts to any situation. Water faction members find strength in unity and fluid tactics.'
  },
  d100: {
    name: 'Order',
    element: 'Order',
    eggType: 'goldstone 🥚',
    color: '#FFD700',
    icon: Shield,
    description: 'The goldstone 🥚 embodies perfect structure and systematic progress. Order faction members build disciplined systems through methodical strategy.'
  }
};

// Calculate faction level based on XP
const calculateFactionLevel = (factionXp: number): number => {
  if (factionXp === 0) return 1;
  
  // Progressive XP requirements: Level 1 = 0-99, Level 2 = 100-299, Level 3 = 300-599, etc.
  // Formula: Level = floor(sqrt(factionXp / 100)) + 1
  return Math.floor(Math.sqrt(factionXp / 100)) + 1;
};

// Calculate XP needed for next level
const getXpForNextLevel = (currentLevel: number): number => {
  return currentLevel * currentLevel * 100;
};

// Calculate progress to next level
const getFactionProgress = (factionXp: number): { level: number, xpToNext: number, progressPercent: number } => {
  const level = calculateFactionLevel(factionXp);
  const currentLevelMin = (level - 1) * (level - 1) * 100;
  const nextLevelMin = level * level * 100;
  const xpInCurrentLevel = factionXp - currentLevelMin;
  const xpNeededForLevel = nextLevelMin - currentLevelMin;
  
  return {
    level,
    xpToNext: nextLevelMin - factionXp,
    progressPercent: Math.min(100, (xpInCurrentLevel / xpNeededForLevel) * 100)
  };
};

export default function FactionWars() {
  const [, setLocation] = useLocation();
  const [userProfile, setUserProfile] = useState<any>(null);

  const { data: factionStats, isLoading } = useQuery<{factions: FactionStats[]}>({
    queryKey: ['/api/stats/factions'],
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  const { data: profile } = useQuery<UserProfile>({
    queryKey: ['/api/profile'],
    retry: false
  });

  useEffect(() => {
    if (profile) {
      console.log('Raw profile data:', profile);
      console.log('Profile has data:', !!profile);
      setUserProfile(profile);
    }
  }, [profile]);

  const totalXpAcrossAllFactions = factionStats?.factions?.reduce((sum: number, faction: FactionStats) => sum + faction.totalXp, 0) || 0;

  const sortedFactions = factionStats?.factions?.sort((a: FactionStats, b: FactionStats) => b.totalXp - a.totalXp) || [];

  // Use profile directly instead of userProfile state to avoid timing issues
  const userFaction = profile?.current_faction;
  
  // Get user's faction XP and calculate level
  const userFactionXp = userFaction && profile?.faction_xp ? profile.faction_xp[userFaction] || 0 : 0;
  const factionProgress = getFactionProgress(userFactionXp);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Sword className="w-8 h-8 text-yellow-400" />
            <h1 className="text-4xl font-bold text-white">Faction Wars</h1>
            <Crown className="w-8 h-8 text-yellow-400" />
          </div>
          <p className="text-xl text-gray-300 max-w-4xl mx-auto">
            Eight ancient elemental factions compete for supremacy in the CJSR Federation. 
            Each faction draws power from a unique Garu egg type, channeling elemental forces 
            through typing mastery and strategic gameplay.
          </p>
        </div>

        {/* User Faction Status */}
        {profile && (
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center space-x-2">
                <Users className="w-5 h-5" />
                <span>Your Faction Status</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {userFaction ? (
                <div className="flex items-center justify-between">
                  {/* Large Avatar Display */}
                  <div className="flex items-center space-x-6">
                    <div className="flex flex-col items-center space-y-2">
                      <div 
                        className="border-4 rounded-lg p-3 bg-slate-900/50" 
                        style={{ borderColor: FACTION_INFO[userFaction as keyof typeof FACTION_INFO]?.color }}
                      >
                        <ChickenAvatar
                          chickenType={profile.chicken_type || "black"}
                          jockeyType={profile.jockey_type || "fire_jockey"}
                          size="lg"
                          animation="idle"
                          showName={false}
                        />
                      </div>
                      <div className="text-center">
                        <div className="text-sm font-semibold text-white">{profile.username}</div>
                        <div className="text-xs text-gray-400">{profile.chicken_name}</div>
                      </div>
                    </div>
                    
                    {/* Faction Info */}
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center space-x-3">
                        {FACTION_INFO[userFaction as keyof typeof FACTION_INFO]?.icon && (() => {
                          const IconComponent = FACTION_INFO[userFaction as keyof typeof FACTION_INFO].icon;
                          return (
                            <IconComponent 
                              className="w-8 h-8" 
                              style={{ color: FACTION_INFO[userFaction as keyof typeof FACTION_INFO].color }} 
                            />
                          );
                        })()}
                        <div>
                          <div className="text-white font-bold text-xl">
                            {FACTION_INFO[userFaction as keyof typeof FACTION_INFO]?.name || userFaction.toUpperCase()}
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge variant="secondary">
                              {FACTION_INFO[userFaction as keyof typeof FACTION_INFO]?.element} Element
                            </Badge>
                            <Badge variant="outline" style={{ borderColor: FACTION_INFO[userFaction as keyof typeof FACTION_INFO]?.color }}>
                              {FACTION_INFO[userFaction as keyof typeof FACTION_INFO]?.eggType}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      
                      {/* Faction Level & Progress */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-white font-semibold">
                            Level {factionProgress.level} • {userFactionXp} XP
                          </span>
                          <span className="text-gray-400 text-sm">
                            {factionProgress.xpToNext} XP to Level {factionProgress.level + 1}
                          </span>
                        </div>
                        <Progress 
                          value={factionProgress.progressPercent} 
                          className="h-2"
                          style={{ 
                            background: 'rgba(0,0,0,0.3)',
                          }}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <Button onClick={() => setLocation('/profile')} variant="outline" size="sm">
                    Manage Faction
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-gray-300">You haven't chosen a faction yet!</p>
                  <Button onClick={() => setLocation('/profile')} className="bg-blue-600 hover:bg-blue-700">
                    Choose Your Faction
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Elemental Garu System Explanation */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">The Eight Elemental Garu</CardTitle>
            <CardDescription className="text-gray-300">
              Ancient egg types that form the foundation of faction power
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-300">
              Each faction is bound to a specific Garu egg type, channeling its elemental essence 
              through typing challenges and strategic gameplay. These eight core elements represent 
              different approaches to mastery and competition:
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {Object.entries(FACTION_INFO).map(([factionId, info]) => (
                <div key={factionId} className="p-4 bg-slate-700/50 rounded-lg border border-slate-600">
                  <div className="flex items-center space-x-2 mb-2">
                    <info.icon className="w-5 h-5" style={{ color: info.color }} />
                    <span className="text-white font-semibold">{info.element}</span>
                  </div>
                  <p className="text-sm text-gray-400">{info.eggType}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Current Faction Standings */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center space-x-2">
              <Trophy className="w-5 h-5 text-yellow-400" />
              <span>Current Faction Standings</span>
            </CardTitle>
            <CardDescription className="text-gray-300">
              Real-time competition between the eight elemental factions
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="h-16 bg-slate-700/50 rounded animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {sortedFactions.map((faction: FactionStats, index: number) => {
                  const factionInfo = FACTION_INFO[faction.faction as keyof typeof FACTION_INFO];
                  const percentage = totalXpAcrossAllFactions > 0 ? (faction.totalXp / totalXpAcrossAllFactions) * 100 : 0;
                  
                  return (
                    <div key={faction.faction} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Badge variant={index === 0 ? "default" : "secondary"}>
                            #{index + 1}
                          </Badge>
                          {factionInfo?.icon && (() => {
                            const IconComponent = factionInfo.icon;
                            return (
                              <IconComponent 
                                className="w-5 h-5" 
                                style={{ color: factionInfo.color }} 
                              />
                            );
                          })()}
                          <span className="text-white font-medium">{factionInfo?.name || faction.name}</span>
                          {userFaction === faction.faction && (
                            <Badge variant="outline" className="text-blue-400 border-blue-400">
                              Your Faction
                            </Badge>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="text-white font-semibold">{faction.totalXp.toLocaleString()} XP</div>
                          <div className="text-sm text-gray-400">{faction.playerCount} members</div>
                        </div>
                      </div>
                      <Progress value={percentage} className="h-2" />
                    </div>
                  );
                })}
              </div>
            )}
            
            <div className="mt-6 text-center">
              <Button 
                onClick={() => setLocation('/leaderboard')} 
                variant="outline"
                className="border-slate-600 text-white hover:bg-slate-700"
              >
                View Detailed Leaderboard
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Future Features Teaser */}
        <Card className="bg-gradient-to-r from-purple-900/50 to-blue-900/50 border-purple-600">
          <CardHeader>
            <CardTitle className="text-white">Coming Soon: Advanced Guild System</CardTitle>
            <CardDescription className="text-purple-200">
              The next evolution of faction warfare
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-purple-100">
              Prepare for the arrival of custom guilds and hybrid elemental combinations! 
              Soon, players will be able to:
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="text-white font-semibold">🔮 Elemental Fusion</h4>
                <p className="text-sm text-purple-200">
                  Combine multiple Garu egg types to create powerful hybrid factions 
                  with unique abilities and strategic advantages.
                </p>
              </div>
              
              <div className="space-y-2">
                <h4 className="text-white font-semibold">🏰 Custom Guilds</h4>
                <p className="text-sm text-purple-200">
                  Form specialized guilds within your faction, each with distinct 
                  goals, challenges, and exclusive rewards.
                </p>
              </div>
              
              <div className="space-y-2">
                <h4 className="text-white font-semibold">⚔️ Guild Wars</h4>
                <p className="text-sm text-purple-200">
                  Epic battles between guilds with territory control, 
                  seasonal campaigns, and legendary prizes.
                </p>
              </div>
              
              <div className="space-y-2">
                <h4 className="text-white font-semibold">🎯 Specialized Roles</h4>
                <p className="text-sm text-purple-200">
                  Take on unique roles like Scribe Master, Battle Tactician, 
                  or Egg Cultivator with special abilities and responsibilities.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Call to Action */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Join the Faction Wars</CardTitle>
            <CardDescription className="text-gray-300">
              Every keystroke matters in the battle for elemental supremacy
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Button 
                onClick={() => setLocation('/practice')} 
                className="h-auto p-4 flex flex-col items-center space-y-2 bg-blue-600 hover:bg-blue-700"
              >
                <Target className="w-6 h-6" />
                <span className="font-semibold">Practice & Train</span>
                <span className="text-xs text-center opacity-80">
                  Hone your skills and earn XP for your faction
                </span>
              </Button>
              
              <Button 
                onClick={() => setLocation('/race')} 
                className="h-auto p-4 flex flex-col items-center space-y-2 bg-green-600 hover:bg-green-700"
              >
                <Gamepad2 className="w-6 h-6" />
                <span className="font-semibold">Enter Races</span>
                <span className="text-xs text-center opacity-80">
                  Compete against other factions in real-time
                </span>
              </Button>
              
              <Button 
                onClick={() => setLocation('/scribe')} 
                className="h-auto p-4 flex flex-col items-center space-y-2 bg-purple-600 hover:bg-purple-700"
              >
                <BookOpen className="w-6 h-6" />
                <span className="font-semibold">Scribe Hall</span>
                <span className="text-xs text-center opacity-80">
                  Master ancient symbols and earn wisdom points
                </span>
              </Button>

              <Button 
                onClick={() => setLocation('/campaign')} 
                className="h-auto p-4 flex flex-col items-center space-y-2 bg-orange-600 hover:bg-orange-700"
              >
                <Crown className="w-6 h-6" />
                <span className="font-semibold">Quilltangle Lore</span>
                <span className="text-xs text-center opacity-80">
                  Learn the lore of Quilltangle
                </span>
              </Button>
            </div>
            
            <Separator className="my-6 bg-slate-600" />
            
            <div className="text-center space-y-4">
              <p className="text-gray-300">
                Don't have an account yet? Join the CJSR Federation and choose your destiny.
              </p>
              <Button 
                onClick={() => setLocation('/register')} 
                size="lg"
                className="bg-yellow-600 hover:bg-yellow-700 text-black font-bold"
              >
                Create Account & Choose Faction
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}