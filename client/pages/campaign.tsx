import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { PixelButton } from "@/components/ui/pixel-button";
import { Card } from "@/components/ui/card";
import { 
  Campaign,
  CampaignRace, 
  CAMPAIGNS, 
  getCampaignProgress, 
  markRaceCompleted,
  getCurrentCampaignRace 
} from "@/lib/campaigns";
import { SinglePlayerRace } from "@/components/single-player-race";
import { getLevelFromXp } from "@/lib/utils";
import { getUserProgress, saveUserProgress } from "@/lib/single-player";

export default function CampaignPage() {
  const [, setLocation] = useLocation();
  const [activeCampaign, setActiveCampaign] = useState<Campaign | null>(null);
  const [currentRace, setCurrentRace] = useState<CampaignRace | null>(null);
  const [showRaceSelection, setShowRaceSelection] = useState(true);
  const [showCampaignStart, setShowCampaignStart] = useState(false);
  const [showRace, setShowRace] = useState(false);
  
  // Load campaign data on mount
  useEffect(() => {
    const campaigns = getCampaignProgress();
    if (campaigns && campaigns.season0) {
      setActiveCampaign(campaigns.season0);
      const currentRace = getCurrentCampaignRace('season0');
      if (currentRace) {
        setCurrentRace(currentRace);
      }
    }
  }, []);
  
  // Set document title
  useEffect(() => {
    document.title = "Campaign - Chicken Jockey Scribe Racer";
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
  
  const handleRaceComplete = (stats: { wpm: number; accuracy: number; time: number }) => {
    if (activeCampaign && currentRace) {
      // Mark race as completed
      markRaceCompleted('season0', currentRace.id, stats);
      
      // Update XP
      const progress = getUserProgress();
      saveUserProgress(progress.level, progress.xp + currentRace.xpReward);
      
      // Reload campaign data
      const campaigns = getCampaignProgress();
      if (campaigns && campaigns.season0) {
        setActiveCampaign(campaigns.season0);
        const nextRace = getCurrentCampaignRace('season0');
        if (nextRace) {
          setCurrentRace(nextRace);
        }
      }
      
      // Return to selection view but keep current state
      setShowRace(false);
      setShowCampaignStart(false);
      setShowRaceSelection(true);
    }
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
            <div className="minecraft-border p-6 bg-black/60 mb-6">
              <h1 className="text-2xl font-minecraft text-center text-primary mb-4">SEASON 0: THE RISE OF THE FIRST FEATHER</h1>
              
              <div className="bg-yellow-800/50 border border-yellow-600 p-3 mb-4 rounded">
                <p className="text-white font-bold mb-1">⚠️ PROVISIONAL CANON NOTICE</p>
                <p className="text-yellow-200 text-sm">
                  This initial CJSR campaign presents provisional canon in genesis. A "choose your own adventure" campaign with multiple story branches is coming in the next deployment.
                </p>
              </div>
              
              <p className="text-yellow-100 mb-6">
                A 7-race single-player typing campaign that tells the legendary origin of the first Chicken Jockey.
                Each race contains lore, themed prompts, and unlockable rewards.
              </p>
              
              <div className="flex items-center justify-between mb-6">
                <div>
                  <div className="text-sm text-gray-300">Current Progress</div>
                  <div className="font-minecraft text-yellow-400">Race {currentRaceNumber} of {totalRaces}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-300">Your Level</div>
                  <div className="font-minecraft text-yellow-400">Level {level}</div>
                </div>
                <div>
                  <PixelButton onClick={handleStartCampaign}>
                    {activeCampaign?.completed ? "Replay Campaign" : "Continue Campaign"}
                  </PixelButton>
                </div>
              </div>
              
              {/* Campaign progress bar */}
              <div className="h-4 w-full bg-black/60 rounded-full overflow-hidden mb-8">
                <div 
                  className="h-full bg-gradient-to-r from-yellow-600 to-yellow-400" 
                  style={{ width: `${(currentRaceNumber - 1) / totalRaces * 100}%` }}
                />
              </div>
              
              {/* Race cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeCampaign?.races.map((race, index) => (
                  <Card 
                    key={race.id}
                    className={`p-4 ${index > (activeCampaign.progress || 0) ? "opacity-70" : ""}`}
                  >
                    <div className="flex justify-between items-start">
                      <h3 className="font-minecraft text-lg text-yellow-400">Race {race.id}: {race.title}</h3>
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
                        <div className="text-xs text-yellow-200">+{race.xpReward} XP</div>
                        {race.completed ? (
                          <div className="text-xs font-bold px-2 py-1 bg-green-900/30 text-green-400 rounded">COMPLETED</div>
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
                ))}
              </div>
            </div>
          </div>
        )}
        
        {showCampaignStart && currentRace && (
          <div className="max-w-4xl mx-auto">
            <div className="minecraft-border p-6 bg-black/60 mb-6">
              <div className="font-minecraft text-yellow-400 text-sm mb-2">SEASON 0: THE RISE OF THE FIRST FEATHER</div>
              <h1 className="text-2xl font-minecraft text-white mb-6">Race {currentRace.id}: {currentRace.title}</h1>
              
              <div className="bg-black/40 p-4 rounded-md mb-6">
                <h3 className="font-minecraft text-yellow-400 mb-2">SETTING</h3>
                <p className="text-gray-200 mb-4">{currentRace.setting}</p>
                
                <h3 className="font-minecraft text-yellow-400 mb-2">PROMPT THEME</h3>
                <p className="text-gray-200">{currentRace.promptDescription}</p>
              </div>
              
              <div className="bg-black/40 p-4 rounded-md mb-6">
                <h3 className="font-minecraft text-yellow-400 mb-2">REWARDS</h3>
                <div className="flex flex-wrap gap-2 mb-2">
                  {currentRace.unlocks.map((unlock, i) => (
                    <div key={i} className="text-xs font-bold px-2 py-1 bg-yellow-900/30 text-yellow-400 rounded">
                      {unlock}
                    </div>
                  ))}
                </div>
                <div className="text-sm text-yellow-200">+{currentRace.xpReward} XP</div>
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
        )}
        
        {showRace && currentRace && (
          <SinglePlayerRace 
            onRaceComplete={handleRaceComplete}
            onBackToMenu={handleBackToSelection}
            campaignMode={true}
            campaignPrompt={currentRace.prompt}
            campaignRaceNumber={currentRace.id}
            campaignRaceTitle={currentRace.title}
          />
        )}
      </main>
      
      <Footer />
    </div>
  );
}