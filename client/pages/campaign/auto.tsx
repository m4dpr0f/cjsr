import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { PixelButton } from "@/components/ui/pixel-button";
import { Card } from "@/components/ui/card";
import { 
  Campaign,
  CAMPAIGNS, 
  getCampaignProgress, 
  getCampaignProgressWithUnlocks,
  markRaceCompleted,
  getCurrentCampaignRace 
} from "@/lib/campaigns";
import { CampaignRace } from "@/components/campaign-race";
import { getLevelFromXp } from "@/lib/utils";
import { getUserProgress, saveUserProgress } from "@/lib/single-player";

// Simple HTML Pattern Background Component for Campaign Scenes
const PixelArtBackground = ({ raceId }: { raceId: number }) => {
  // Generate ASCII art backgrounds based on race scenes
  const getBgPatternStyle = () => {
    switch(raceId) {
      case 1: // Grand Gathering of Wings
        return {
          backgroundColor: '#403b28',
          color: '#ffd54f',
          content: `^  ^  ^  ^  ^  ^\n |  |  |  |  |  |\n/|\\//|\\//|\\//|\\\n |  |  |  |  |  |\n`,
          fontFamily: 'monospace'
        };
      case 2: // Tinker's Trail
        return {
          backgroundColor: '#2d3a47',
          color: '#a1d6e2',
          content: `[+] [+] [+] [+] [+]\n |   |   |   |   |\n<=> <=> <=> <=> <=>\n |   |   |   |   |\n`,
          fontFamily: 'monospace'
        };
      case 3: // City of Shadows
        return {
          backgroundColor: '#1a1e2e',
          color: '#8c9eff',
          content: `┌─┐ ┌─┐ ┌─┐ ┌─┐ ┌─┐\n│ │ │ │ │ │ │ │ │ │\n└─┘ └─┘ └─┘ └─┘ └─┘\n... ... ... ... ...\n`,
          fontFamily: 'monospace'
        };
      case 4: // Vault of Names
        return {
          backgroundColor: '#263238',
          color: '#80deea',
          content: `101 010 101 010 101\n010 101 010 101 010\n101 010 101 010 101\n010 101 010 101 010\n`,
          fontFamily: 'monospace'
        };
      case 5: // Geargrave Below
        return {
          backgroundColor: '#212121',
          color: '#90a4ae',
          content: `⚙️  ⚙️  ⚙️  ⚙️  ⚙️\n |   |   |   |   |\n ⚙️  ⚙️  ⚙️  ⚙️  ⚙️\n |   |   |   |   |\n`,
          fontFamily: 'monospace'
        };
      case 6: // Firewall Run
        return {
          backgroundColor: '#370000',
          color: '#ff5722',
          content: `>>> >>> >>> >>> >>>\n ||| ||| ||| ||| |||\n <<< <<< <<< <<< <<<\n ||| ||| ||| ||| |||\n`,
          fontFamily: 'monospace'
        };
      case 7: // Arrival of Timaru
        return {
          backgroundColor: '#2c2c2c',
          color: '#ff8a65',
          content: `* * * * * * * * *\n| | | | | | | | |\n~ ~ ~ ~ ~ ~ ~ ~ ~\n. . . . . . . . .\n`,
          fontFamily: 'monospace'
        };
      case 8: // Ledger of Sparks
        return {
          backgroundColor: '#1e3a4f',
          color: '#ffca28',
          content: `::: ::: ::: ::: :::\n--- --- --- --- ---\n::: ::: ::: ::: :::\n--- --- --- --- ---\n`,
          fontFamily: 'monospace'
        };
      case 9: // Flameborn Flight
        return {
          backgroundColor: '#4e1c00',
          color: '#ff9100',
          content: `^/^/^/^/^/^/^/^/^\n|||||||||||||||||\n\\/\\/\\/\\/\\/\\/\\/\\/\\/\n|||||||||||||||||\n`,
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

export default function AutoCampaignPage() {
  const [, setLocation] = useLocation();
  const [activeCampaign, setActiveCampaign] = useState<Campaign | null>(null);
  const [currentRace, setCurrentRace] = useState<CampaignRace | null>(null);
  const [showRaceSelection, setShowRaceSelection] = useState(true);
  const [showCampaignStart, setShowCampaignStart] = useState(false);
  const [showRace, setShowRace] = useState(false);
  
  // Load campaign data on mount
  useEffect(() => {
    const loadCampaignData = async () => {
      const campaigns = await getCampaignProgressWithUnlocks();
      if (campaigns && campaigns.auto) {
        // Check if Auto campaign is unlocked
        if (!campaigns.auto.unlocked) {
          // Redirect back to campaign selection if not unlocked
          setLocation('/campaign');
          return;
        }
        setActiveCampaign(campaigns.auto);
        const currentRace = getCurrentCampaignRace('auto');
        if (currentRace) {
          setCurrentRace(currentRace);
        }
      }
    };
    loadCampaignData();
  }, [setLocation]);
  
  // Set document title
  useEffect(() => {
    document.title = "Auto's Campaign - Chicken Jockey Scribe Racer";
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
  
  const handleBackToCampaignSelect = () => {
    setLocation('/campaign');
  };
  
  const handleRaceComplete = (stats: { wpm: number; accuracy: number; time: number; position: number; xpGained: number }) => {
    // Process completion immediately but keep victory screen visible
    if (activeCampaign && currentRace) {
      // Mark race as completed
      markRaceCompleted('auto', currentRace.id, stats);
      
      // Update XP with the calculated amount from the race
      const progress = getUserProgress();
      saveUserProgress(progress.level, progress.xp + stats.xpGained);
      
      // Reload campaign data
      const campaigns = getCampaignProgress();
      if (campaigns && campaigns.auto) {
        setActiveCampaign(campaigns.auto);
        const nextRace = getCurrentCampaignRace('auto');
        if (nextRace) {
          setCurrentRace(nextRace);
        } else if (campaigns.auto.completed) {
          // Campaign completed! Unlock Auto jockey
          unlockCampaignRewards('auto');
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
  const totalRaces = activeCampaign?.races.length || 9;
  
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
                  <h1 className="text-2xl font-minecraft text-primary">AUTO GARUHEART: THE LEGEND BEGINS</h1>
                  <PixelButton variant="outline" size="sm" onClick={handleBackToCampaignSelect}>
                    Back to Campaigns
                  </PixelButton>
                </div>
                
                <div className="bg-blue-900/50 border border-blue-600 p-3 mb-4 rounded">
                  <p className="text-white font-bold mb-1">⚙️ TECHNOLOGY PATH</p>
                  <p className="text-blue-200 text-sm">
                    This campaign tells the story of Auto Garuheart, son of Steve, who combines ancient riding traditions with technological innovation in his quest against the empire.
                  </p>
                </div>
                
                <p className="text-blue-100 mb-6">
                  A 9-race single-player typing campaign that follows Auto's journey from Steve's son to a legendary rider in his own right.
                  Each race contains lore, themed prompts, and unlockable rewards.
                </p>
                
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4 sm:gap-0">
                  <div className="bg-black/40 p-3 rounded-md">
                    <div className="text-sm text-gray-300">Current Progress</div>
                    <div className="font-minecraft text-blue-400">Race {currentRaceNumber} of {totalRaces}</div>
                  </div>
                  <div className="bg-black/40 p-3 rounded-md">
                    <div className="text-sm text-gray-300">Your Level</div>
                    <div className="font-minecraft text-blue-400">Level {level}</div>
                  </div>
                  <div>
                    <PixelButton onClick={handleStartCampaign}>
                      {activeCampaign?.completed ? "Replay Campaign" : "Continue Campaign"}
                    </PixelButton>
                  </div>
                </div>
                
                {/* Campaign progress bar */}
                <div className="h-5 w-full bg-black/60 rounded-full overflow-hidden mb-8 border border-blue-900/30">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-600 to-blue-400 relative"
                    style={{ width: `${(currentRaceNumber - 1) / totalRaces * 100}%` }}
                  >
                    <div className="absolute top-0 right-0 h-full w-2 bg-blue-300/50"></div>
                  </div>
                </div>
                
                {/* Race cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {activeCampaign?.races.map((race, index) => (
                    <div 
                      key={race.id}
                      className={`relative overflow-hidden rounded-lg border ${index > (activeCampaign.progress || 0) ? "border-gray-700 opacity-70" : "border-blue-800"}`}
                    >
                      <PixelArtBackground raceId={race.id} />
                      <Card 
                        className={`p-4 bg-black/70 h-full backdrop-blur-sm`}
                      >
                        <div className="flex justify-between items-start">
                          <h3 className="font-minecraft text-lg text-blue-400">Race {race.id}: {race.title}</h3>
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
                        
                        <div className="mt-auto">
                          <div className="flex justify-between items-center">
                            <div className="text-xs bg-black/40 px-2 py-1 rounded text-blue-200">+{race.xpReward} XP</div>
                            {race.completed ? (
                              <div className="text-xs font-bold px-2 py-1 bg-green-900/50 text-green-400 rounded border border-green-800/50">COMPLETED</div>
                            ) : index === (activeCampaign.progress || 0) ? (
                              <PixelButton 
                                onClick={handleStartCampaign}
                                size="sm"
                              >
                                Start Race
                              </PixelButton>
                            ) : null}
                          </div>
                        </div>
                      </Card>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Main campaign background */}
              <div className="absolute inset-0 -z-10 bg-gradient-to-b from-black/90 to-blue-950/40"></div>
            </div>
          </div>
        )}
        
        {showCampaignStart && currentRace && (
          <div className="max-w-4xl mx-auto">
            <div className="minecraft-border p-6 bg-black/80 mb-6 relative overflow-hidden">
              {/* Race-specific background */}
              <PixelArtBackground raceId={currentRace.id} />
              
              <div className="relative z-10">
                <div className="font-minecraft text-blue-400 text-sm mb-2">AUTO GARUHEART: THE LEGEND BEGINS</div>
                <h1 className="text-2xl font-minecraft text-white mb-6">Race {currentRace.id}: {currentRace.title}</h1>
                
                <div className="bg-black/60 backdrop-blur-sm p-4 rounded-md mb-6 border border-blue-900/30">
                  <h3 className="font-minecraft text-blue-400 mb-2">SETTING</h3>
                  <p className="text-gray-200 mb-4">{currentRace.setting}</p>
                  
                  <h3 className="font-minecraft text-blue-400 mb-2">PROMPT THEME</h3>
                  <p className="text-gray-200">{currentRace.promptDescription}</p>
                </div>
                
                <div className="bg-black/60 backdrop-blur-sm p-4 rounded-md mb-6 border border-blue-900/30">
                  <h3 className="font-minecraft text-blue-400 mb-2">REWARDS</h3>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {currentRace.unlocks.map((unlock, i) => (
                      <div key={i} className="text-xs font-bold px-2 py-1 bg-blue-900/40 text-blue-400 rounded border border-blue-800/50">
                        {unlock}
                      </div>
                    ))}
                  </div>
                  <div className="text-sm text-blue-200 mt-2 font-bold">+{currentRace.xpReward} XP</div>
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
              campaignTitle={`Auto Garuheart: ${currentRace.title}`}
              campaignCharacter="auto"
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