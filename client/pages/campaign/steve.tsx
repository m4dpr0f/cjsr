import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { PixelButton } from "@/components/ui/pixel-button";
import { Card } from "@/components/ui/card";
import { 
  Campaign,
  CampaignRace as CampaignRaceType, 
  CAMPAIGNS, 
  getCampaignProgress, 
  getDatabaseCampaignProgress,
  markRaceCompleted,
  getCurrentCampaignRace,
  autoSaveCampaignProgress,
  isRaceUnlocked
} from "@/lib/campaigns";
import { CampaignRace } from "@/components/campaign-race";
import { getLevelFromXp } from "@/lib/utils";
import { getUserProgress, saveUserProgress } from "@/lib/single-player";
import { unlockCampaignRewards } from "@/lib/unlocks";
import { useToast } from "@/hooks/use-toast";

// Simple HTML Pattern Background Component for Campaign Scenes
const PixelArtBackground = ({ raceId }: { raceId: number }) => {
  // Generate ASCII art backgrounds based on race scenes
  const getBgPatternStyle = () => {
    switch(raceId) {
      case 1: // Festival of Flightsong
        return {
          backgroundColor: '#2a3b30',
          color: '#ffb74d',
          content: `* . * . * . * . *\n * * * * * * * *\n* * * * * * * * *\n . . . . . . . .\n`,
          fontFamily: 'monospace'
        };
      case 2: // Maker's Ride
        return {
          backgroundColor: '#283228',
          color: '#d4a76a',
          content: `+-+-+-+-+-+-+-+-+\n| | | | | | | | |\n+-+-+-+-+-+-+-+-+\n| | | | | | | | |\n`,
          fontFamily: 'monospace'
        };
      case 3: // Ember Market
        return {
          backgroundColor: '#1d2840',
          color: '#ffa726',
          content: `o o o o o o o o o\n| | | | | | | | |\n| | | | | | | | |\no o o o o o o o o\n`,
          fontFamily: 'monospace'
        };
      case 4: // Rooftop Reclaiming
        return {
          backgroundColor: '#111827',
          color: '#a5c0e0',
          content: `/\\/\\/\\/\\/\\/\\/\\/\\/\\\n\\/\\/\\/\\/\\/\\/\\/\\/\\/\n/\\/\\/\\/\\/\\/\\/\\/\\/\\\n\\/\\/\\/\\/\\/\\/\\/\\/\\/\n`,
          fontFamily: 'monospace'
        };
      case 5: // The Way of Roots
        return {
          backgroundColor: '#213528',
          color: '#7ea766',
          content: `^ ^ ^ ^ ^ ^ ^ ^ ^\n| | | | | | | | |\n\\/ \\/ \\/ \\/ \\/ \\/ \\/ \\/ \\/\n. . . . . . . . .\n`,
          fontFamily: 'monospace'
        };
      case 6: // Ashwind Skirmish
        return {
          backgroundColor: '#3a1f1f',
          color: '#ff704d',
          content: `~ ~ ~ ~ ~ ~ ~ ~ ~\n- - - - - - - - -\n~ ~ ~ ~ ~ ~ ~ ~ ~\n- - - - - - - - -\n`,
          fontFamily: 'monospace'
        };
      case 7: // Summit Circuit
        return {
          backgroundColor: '#2c3e50',
          color: '#a1c4fd',
          content: `/\\ /\\ /\\ /\\ /\\ /\\ /\\\n\\/ \\/ \\/ \\/ \\/ \\/ \\/\n/\\ /\\ /\\ /\\ /\\ /\\ /\\\n\\/ \\/ \\/ \\/ \\/ \\/ \\/\n`,
          fontFamily: 'monospace'
        };
      case 8: // Feather Ledger
        return {
          backgroundColor: '#362917',
          color: '#d4a76a',
          content: `> > > > > > > > >\n= = = = = = = = =\n< < < < < < < < <\n= = = = = = = = =\n`,
          fontFamily: 'monospace'
        };
      case 9: // Grand Gathering of Wings
        return {
          backgroundColor: '#413b23',
          color: '#ffd54f',
          content: `^  ^  ^  ^  ^  ^\n |  |  |  |  |  |\n/|\\//|\\//|\\//|\\\n |  |  |  |  |  |\n`,
          fontFamily: 'monospace'
        };
      default:
        return {
          backgroundColor: '#1a1a1a',
          color: '#999999',
          content: `· · · · · · · · ·\n· · · · · · · · ·\n· · · · · · · · ·\n· · · · · · · · ·\n`,
          fontFamily: 'monospace'
        };
    }
  };

  const pattern = getBgPatternStyle();
  
  // Create the pattern with repeated elements
  const createPatternElement = () => {
    const lines = pattern.content.split('\n').filter(line => line.length > 0);
    
    return (
      <div className="absolute inset-0 overflow-hidden opacity-20">
        <div className="absolute inset-0 flex flex-col">
          {Array.from({ length: 20 }).map((_, rowIndex) => (
            <div key={rowIndex} className="flex whitespace-pre">
              {Array.from({ length: 8 }).map((_, colIndex) => (
                <pre 
                  key={`${rowIndex}-${colIndex}`} 
                  className="text-xs" 
                  style={{ 
                    color: pattern.color, 
                    fontFamily: pattern.fontFamily,
                    lineHeight: '1rem'
                  }}
                >
                  {lines[rowIndex % lines.length]}
                </pre>
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div 
      className="absolute inset-0 -z-10 overflow-hidden" 
      style={{ backgroundColor: pattern.backgroundColor }}
    >
      {createPatternElement()}
      <div className="absolute inset-0 bg-black/40"></div>
    </div>
  );
};

export default function SteveCampaignPage() {
  const [, setLocation] = useLocation();
  const [activeCampaign, setActiveCampaign] = useState<Campaign | null>(null);
  const [currentRace, setCurrentRace] = useState<CampaignRaceType | null>(null);
  const [showRaceSelection, setShowRaceSelection] = useState(true);
  const [showCampaignStart, setShowCampaignStart] = useState(false);
  const [showRace, setShowRace] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Get user profile to check authentication
  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ["/api/profile"],
  });

  const isAuthenticated = !!profile;
  
  // Load campaign data on mount
  useEffect(() => {
    const loadCampaignData = async () => {
      let campaigns;
      
      if (isAuthenticated) {
        // For authenticated users, use database
        campaigns = await getDatabaseCampaignProgress();
      } else {
        // For guests, use local storage
        campaigns = getCampaignProgress();
      }
      
      if (campaigns && campaigns.season0) {
        setActiveCampaign(campaigns.season0);
        const currentRace = getCurrentCampaignRace('season0');
        if (currentRace) {
          setCurrentRace(currentRace);
        }
      }
    };
    
    if (!profileLoading) {
      loadCampaignData();
    }
  }, [isAuthenticated, profileLoading]);
  
  // Set document title
  useEffect(() => {
    document.title = "Steve's Campaign - Chicken Jockey Scribe Racer";
  }, []);
  
  const handleStartCampaign = () => {
    setShowRaceSelection(false);
    setShowCampaignStart(true);
  };
  
  const handleStartRace = () => {
    setShowCampaignStart(false);
    setShowRace(true);
  };
  
  const handleBackToSelection = () => {
    setShowRace(false);
    setShowCampaignStart(false);
    setShowRaceSelection(true);
  };

  // Removed manual save/load - now using autosave system
  
  const handleBackToCampaignSelect = () => {
    setLocation('/campaign');
  };
  
  const handleRaceComplete = async (stats: { wpm: number; accuracy: number; time: number; position: number; xpGained: number }) => {
    // Process completion immediately but keep victory screen visible
    if (activeCampaign && currentRace) {
      // Update XP with the calculated amount from the race
      const progress = getUserProgress();
      saveUserProgress(progress.level, progress.xp + stats.xpGained);
      
      // Wait a moment for the backend race completion to process
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Reload campaign data from database to get the updated state
      let campaigns;
      if (isAuthenticated) {
        campaigns = await getDatabaseCampaignProgress();
      } else {
        // For guests, mark race as completed in localStorage
        markRaceCompleted('season0', currentRace.id, stats);
        campaigns = getCampaignProgress();
      }
      
      if (campaigns && campaigns.season0) {
        setActiveCampaign(campaigns.season0);
        
        // Auto-save progress with user-friendly notifications
        try {
          const saveResult = await autoSaveCampaignProgress(campaigns);
          
          if (saveResult.isGuest) {
            toast({
              title: "Progress Saved Locally",
              description: "Create an account to backup your progress across devices!",
              duration: 5000,
            });
          } else if (saveResult.saved) {
            toast({
              title: "Progress Saved",
              description: "Your campaign progress has been saved to your account.",
              duration: 3000,
            });
          }
        } catch (error) {
          toast({
            title: "Save Notice",
            description: "Progress saved locally. Consider creating an account for cloud backup.",
            duration: 4000,
          });
        }
        
        const nextRace = getCurrentCampaignRace('season0');
        if (nextRace) {
          setCurrentRace(nextRace);
        } else if (campaigns.season0.completed) {
          // Campaign completed! Unlock Steve jockey
          unlockCampaignRewards('steve');
        }
      }
    }
    // Victory screen stays visible until player manually continues
  };
  
  // Extract player progress
  const userProgress = getUserProgress();
  const { level, progress: xpProgress } = getLevelFromXp(userProgress.xp);
  
  // Determine current race number and total races
  const currentRaceNumber = activeCampaign?.progress !== undefined ? activeCampaign.progress + 1 : 1;
  const totalRaces = activeCampaign?.races.length || 7;
  
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-400';
      case 'medium': return 'text-yellow-400';
      case 'hard': return 'text-orange-400';
      case 'extreme': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-grow container mx-auto p-4">
        {showRaceSelection && (
          <div className="max-w-4xl mx-auto">
            <div className="minecraft-border p-6 bg-black/80 mb-6 relative overflow-hidden">
              <div className="relative z-10">
                <div className="flex justify-between items-center mb-4">
                  <h1 className="text-2xl font-minecraft text-primary">STEVE GARUHEART: RIDER IN FUGITIVITY</h1>
                  <div className="flex gap-2">
                    <div className="flex items-center px-3 py-2 bg-green-600/20 border border-green-500 rounded text-green-400 text-sm">
                      ⚡ Autosave Active
                    </div>
                    <PixelButton variant="outline" size="sm" onClick={handleBackToCampaignSelect}>
                      Back to Campaigns
                    </PixelButton>
                  </div>
                </div>
                
                <div className="bg-yellow-800/50 border border-yellow-600 p-3 mb-4 rounded">
                  <p className="text-white font-bold mb-1">⚠️ PROVISIONAL CANON NOTICE</p>
                  <p className="text-yellow-200 text-sm">
                    This campaign tells the story of Steve Garuheart, a legendary Garu rider and father figure whose culture has been outlawed by the Empire.
                  </p>
                </div>
                
                <p className="text-yellow-100 mb-6">
                  A 9-race single-player typing campaign that follows Steve's journey from festival racer to legendary figure.
                  Each race contains lore, themed prompts, and unlockable rewards.
                </p>
                
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4 sm:gap-0">
                  <div className="bg-black/40 p-3 rounded-md">
                    <div className="text-sm text-gray-300">Current Progress</div>
                    <div className="font-minecraft text-yellow-400">Race {currentRaceNumber} of {totalRaces}</div>
                  </div>
                  <div className="bg-black/40 p-3 rounded-md">
                    <div className="text-sm text-gray-300">Your Level</div>
                    <div className="font-minecraft text-yellow-400">Level {level}</div>
                  </div>
                  <div>
                    <PixelButton onClick={handleStartCampaign}>
                      {activeCampaign?.completed ? "Replay Campaign" : activeCampaign ? "Continue Campaign" : "Start Campaign"}
                    </PixelButton>
                  </div>
                </div>
                
                {/* Campaign progress bar */}
                <div className="h-5 w-full bg-black/60 rounded-full overflow-hidden mb-8 border border-yellow-900/30">
                  <div 
                    className="h-full bg-gradient-to-r from-yellow-600 to-yellow-400 relative"
                    style={{ width: `${(currentRaceNumber - 1) / totalRaces * 100}%` }}
                  >
                    <div className="absolute top-0 right-0 h-full w-2 bg-yellow-300/50"></div>
                  </div>
                </div>
                
                {/* Race cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {activeCampaign?.races.map((race, index) => {
                    const isUnlocked = isRaceUnlocked('season0', race.id);
                    const isCompleted = race.completed;
                    
                    return (
                      <div 
                        key={race.id}
                        className={`relative overflow-hidden rounded-lg border ${
                          isUnlocked ? 'border-yellow-800' : 'border-gray-600'
                        } ${!isUnlocked ? 'opacity-50' : ''}`}
                      >
                        <PixelArtBackground raceId={race.id} />
                        <Card 
                          className={`p-4 bg-black/70 h-full backdrop-blur-sm ${!isUnlocked ? 'grayscale' : ''}`}
                        >
                          <div className="flex justify-between items-start">
                            <h3 className={`font-minecraft text-lg ${isUnlocked ? 'text-yellow-400' : 'text-gray-500'}`}>
                              Race {race.id}: {race.title}
                            </h3>
                            <div className={`text-xs font-bold px-2 py-1 rounded ${getDifficultyColor(race.difficulty)}`}>
                              {race.difficulty.toUpperCase()}
                            </div>
                          </div>
                          
                          <p className="text-sm text-gray-300 mt-2 mb-3">
                            <span className="text-gray-400 font-bold">Setting: </span>
                            {race.setting}
                          </p>
                          
                          <p className="text-sm text-gray-300 mb-4">
                            <span className="text-gray-400 font-bold">Theme: </span>
                            {race.promptDescription}
                          </p>
                          
                          {/* Best Score Display */}
                          {race.bestStats && isCompleted && (
                            <div className="mb-3 p-3 bg-gradient-to-r from-yellow-900/40 to-green-900/40 border border-yellow-600/50 rounded">
                              <div className="text-xs text-yellow-200 font-bold mb-2 flex items-center gap-1">
                                🏆 High Score - Position #{race.bestStats.position}
                              </div>
                              <div className="grid grid-cols-3 gap-2 text-xs">
                                <div className="text-green-400 font-bold">{race.bestStats.wpm} WPM</div>
                                <div className="text-blue-400 font-bold">{race.bestStats.accuracy}% ACC</div>
                                <div className="text-purple-400 font-bold">{Math.round(race.bestStats.time)}s</div>
                              </div>
                            </div>
                          )}
                          
                          {/* Lock message for locked races */}
                          {!isUnlocked && (
                            <div className="mb-3 p-2 bg-red-900/30 border border-red-800/50 rounded">
                              <div className="text-xs text-red-200 font-bold">🔒 LOCKED</div>
                              <div className="text-xs text-gray-400 mt-1">
                                {race.id === 0 ? 'This race should be unlocked!' : 'Complete previous race in top 3 to unlock'}
                              </div>
                            </div>
                          )}
                          
                          <div className="mt-auto">
                            <div className="flex justify-between items-center">
                              <div className="text-xs bg-black/40 px-2 py-1 rounded text-yellow-200">+{race.xpReward} XP</div>
                              <PixelButton 
                                onClick={() => {
                                  setCurrentRace(race);
                                  handleStartCampaign();
                                }}
                                size="sm"
                                variant={isCompleted ? "outline" : "default"}
                                disabled={!isUnlocked}
                                className={`px-3 py-2 ${
                                  !isUnlocked ? 'opacity-50 cursor-not-allowed' : ''
                                } ${isCompleted ? 'bg-green-600 hover:bg-green-500 border-green-500' : ''}`}
                              >
                                {!isUnlocked ? "🔒 LOCKED" : isCompleted ? "RETRY" : "START RACE"}
                              </PixelButton>
                            </div>
                          </div>
                        </Card>
                      </div>
                    );
                  })}
                </div>
              </div>
              
              {/* Main campaign background */}
              <div className="absolute inset-0 -z-10 bg-gradient-to-b from-black/90 to-yellow-950/40"></div>
            </div>
          </div>
        )}
        
        {showCampaignStart && currentRace && (
          <div className="max-w-4xl mx-auto">
            <div className="minecraft-border p-6 bg-black/80 mb-6 relative overflow-hidden">
              {/* Race-specific background */}
              <PixelArtBackground raceId={currentRace.id} />
              
              <div className="relative z-10">
                <div className="font-minecraft text-yellow-400 text-sm mb-2">STEVE GARUHEART: RIDER IN FUGITIVITY</div>
                <h1 className="text-2xl font-minecraft text-white mb-6">Race {currentRace.id}: {currentRace.title}</h1>
                
                <div className="bg-black/60 backdrop-blur-sm p-4 rounded-md mb-6 border border-yellow-900/30">
                  <h3 className="font-minecraft text-yellow-400 mb-2">SETTING</h3>
                  <p className="text-gray-200 mb-4">{currentRace.setting}</p>
                  
                  <h3 className="font-minecraft text-yellow-400 mb-2">PROMPT THEME</h3>
                  <p className="text-gray-200">{currentRace.promptDescription}</p>
                </div>
                
                <div className="bg-black/60 backdrop-blur-sm p-4 rounded-md mb-6 border border-yellow-900/30">
                  <h3 className="font-minecraft text-yellow-400 mb-2">REWARDS</h3>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {currentRace.unlocks.map((unlock, i) => (
                      <div key={i} className="text-xs font-bold px-2 py-1 bg-yellow-900/40 text-yellow-400 rounded border border-yellow-800/50">
                        {unlock}
                      </div>
                    ))}
                  </div>
                  <div className="text-sm text-yellow-200 mt-2 font-bold">+{currentRace.xpReward} XP</div>
                </div>
                
                <div className="flex justify-between">
                  <PixelButton variant="secondary" onClick={handleBackToSelection}>
                    Back
                  </PixelButton>
                  <PixelButton onClick={handleStartRace}>
                    Start Race
                  </PixelButton>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {showRace && currentRace && (
          <div className="relative">
            {/* Add subtle background for the race screen */}
            <div className="fixed inset-0 -z-10 opacity-20">
              <PixelArtBackground raceId={currentRace.id} />
            </div>
            <CampaignRace
              campaignPrompt={currentRace.prompt}
              campaignTitle={`Steve Garuheart: ${currentRace.title}`}
              campaignCharacter="steve"
              raceId={currentRace.id}
              onRaceComplete={handleRaceComplete}
              onBackToMenu={handleBackToSelection}
            />
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
}