import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { PixelButton } from "@/components/ui/pixel-button";
import { Card, CardContent } from "@/components/ui/card";
import { ChickenAvatar } from "@/components/ui/chicken-avatar";
import { 
  getForkState, 
  selectCharacter, 
  PlayerCharacter,
  getCharacterDialogue, 
  markForkRaceCompleted 
} from "@/lib/fork";
import { SinglePlayerRace } from "@/components/single-player-race";
import { getLevelFromXp } from "@/lib/utils";
import { getUserProgress, saveUserProgress } from "@/lib/single-player";

// Fork prompts for RACE 0 and beyond
const FORK_PROMPTS = {
  race0: "Welcome to the Chicken Jockey Scribe Racer fork campaign! This adventure allows you to choose your path through the legendary tale of the First Feather. Your choices will affect the story, dialogues, and challenges you encounter. Type this message to begin and make your first choice on the next screen.",
  
  // Initial fork prompts will adapt based on character choice
  race1_matikah: "As Matikah, you approach the ancient scrolls with reverence. The parchment crackles beneath your fingers as you read the words that have guided Chicken Jockey scribes for generations. With each letter you type, you feel more connected to the wisdom of those who came before. The magic of the First Feather begins to resonate with your scholarly nature.",
  
  race1_auto: "Auto's systems analyze the racing data with perfect precision. Each keystroke represents another calculation, another optimization of the perfect racing algorithm. The history of Chicken Jockeys unfolds in binary sequences and mathematical patterns. With every character typed, Auto's understanding of racing mechanics grows more advanced.",
};

export default function Fork() {
  const [, setLocation] = useLocation();
  const [forkState, setForkState] = useState(getForkState());
  const [showCharacterSelection, setShowCharacterSelection] = useState(false);
  const [showRace, setShowRace] = useState(false);
  const [selectedCharacter, setSelectedCharacter] = useState<PlayerCharacter>(null);
  const [racePrompt, setRacePrompt] = useState("");
  
  // Load fork state on mount
  useEffect(() => {
    const state = getForkState();
    setForkState(state);
    
    // If user hasn't started fork yet or we're at character selection, show selection screen
    if (!state.hasStartedFork || state.currentForkRace < 0) {
      setShowCharacterSelection(true);
      if (state.selectedCharacter) {
        setSelectedCharacter(state.selectedCharacter);
      }
    } else {
      // Handle loading proper race based on progress
      prepareRace(state.currentForkRace, state.selectedCharacter);
    }
  }, []);
  
  // Set document title
  useEffect(() => {
    document.title = "Choose Your Path - Chicken Jockey Scribe Racer";
  }, []);
  
  const prepareRace = (raceId: number, character: PlayerCharacter) => {
    // For Race 0 (intro race)
    if (raceId === 0) {
      setRacePrompt(FORK_PROMPTS.race0);
      setShowRace(true);
      return;
    }
    
    // For Race 1, character-specific prompt
    if (raceId === 1) {
      if (character === "Matikah") {
        setRacePrompt(FORK_PROMPTS.race1_matikah);
      } else if (character === "Auto") {
        setRacePrompt(FORK_PROMPTS.race1_auto);
      } else {
        // Fallback
        setRacePrompt(FORK_PROMPTS.race1_matikah);
      }
      setShowRace(true);
      return;
    }
    
    // For future races, we'll add more logic here
    setRacePrompt("To be continued! More fork content coming soon.");
    setShowRace(true);
  };
  
  const handleCharacterSelect = (character: PlayerCharacter) => {
    setSelectedCharacter(character);
    selectCharacter(character);
    
    // Update local state
    const newState = getForkState();
    setForkState(newState);
    
    // Show appropriate race based on the selected character
    prepareRace(newState.currentForkRace, newState.selectedCharacter || character);
    setShowCharacterSelection(false);
  };
  
  const handleRaceComplete = (stats: { wpm: number; accuracy: number; time: number }) => {
    // Update XP
    const progress = getUserProgress();
    const xpReward = 50 * (forkState.currentForkRace + 1); // More XP for later races
    saveUserProgress(progress.level, progress.xp + xpReward);
    
    // Mark race as completed
    markForkRaceCompleted(forkState.currentForkRace);
    
    // Get updated state
    const newState = getForkState();
    setForkState(newState);
    
    // Prepare next race
    if (newState.currentForkRace <= 1) {
      prepareRace(newState.currentForkRace, newState.selectedCharacter);
    } else {
      // For now, return to selection if we've completed race 1
      setShowRace(false);
      setShowCharacterSelection(true);
    }
  };
  
  const handleBackToMenu = () => {
    setLocation('/');
  };
  
  // Extract player progress
  const userProgress = getUserProgress();
  const { level } = getLevelFromXp(userProgress.xp);
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-grow container mx-auto p-4">
        {showCharacterSelection && (
          <div className="max-w-4xl mx-auto">
            <div className="minecraft-border p-6 bg-black/60 mb-6">
              <h1 className="text-2xl font-minecraft text-center text-primary mb-4">CHOOSE YOUR CHICKEN JOCKEY PATH</h1>
              
              <div className="bg-yellow-800/50 border border-yellow-600 p-3 mb-4 rounded">
                <p className="text-white font-bold mb-1">✨ FORK CAMPAIGN: NARRATIVE CHOICE</p>
                <p className="text-yellow-200 text-sm">
                  This new adventure allows you to choose your path through the legendary tale of the First Feather.
                  Your character choice will affect the story, dialogues, and challenges you encounter.
                </p>
              </div>
              
              <p className="text-yellow-100 mb-6">
                Select your character to begin the journey. Each character brings unique perspectives and abilities.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                {/* Matikah Character Card */}
                <Card className="bg-dark border-2 border-transparent hover:border-yellow-500 transition-all cursor-pointer"
                      onClick={() => handleCharacterSelect("Matikah")}>
                  <CardContent className="p-4 flex flex-col items-center">
                    <div className="mb-4">
                      <ChickenAvatar 
                        chickenType="html_matikah" 
                        jockeyType="html_matikah"
                        size="lg"
                      />
                    </div>
                    <h3 className="font-minecraft text-lg text-yellow-400 mb-2 text-center">MATIKAH</h3>
                    <p className="text-sm text-gray-300 text-center mb-4">
                      The Scholar of Ancient Texts
                    </p>
                    <div className="bg-black/40 p-2 rounded-md mb-2 w-full">
                      <p className="text-xs text-gray-200">
                        <span className="text-yellow-300">+</span> Knowledge of ancient lore
                      </p>
                      <p className="text-xs text-gray-200">
                        <span className="text-yellow-300">+</span> Ability to decipher complex texts
                      </p>
                      <p className="text-xs text-gray-200">
                        <span className="text-yellow-300">-</span> Lower racing speed
                      </p>
                    </div>
                  </CardContent>
                </Card>
              
                {/* Auto Character Card */}
                <Card className="bg-dark border-2 border-transparent hover:border-yellow-500 transition-all cursor-pointer"
                      onClick={() => handleCharacterSelect("Auto")}>
                  <CardContent className="p-4 flex flex-col items-center">
                    <div className="mb-4">
                      <ChickenAvatar 
                        chickenType="html_auto" 
                        jockeyType="html_auto"
                        size="lg"
                      />
                    </div>
                    <h3 className="font-minecraft text-lg text-yellow-400 mb-2 text-center">AUTO</h3>
                    <p className="text-sm text-gray-300 text-center mb-4">
                      The Technical Racer
                    </p>
                    <div className="bg-black/40 p-2 rounded-md mb-2 w-full">
                      <p className="text-xs text-gray-200">
                        <span className="text-yellow-300">+</span> Faster racing speed
                      </p>
                      <p className="text-xs text-gray-200">
                        <span className="text-yellow-300">+</span> Logical approach to challenges
                      </p>
                      <p className="text-xs text-gray-200">
                        <span className="text-yellow-300">-</span> Less intuitive with scrolls
                      </p>
                    </div>
                  </CardContent>
                </Card>
              
                {/* Iam Character Card */}
                <Card className="bg-dark border-2 border-transparent hover:border-yellow-500 transition-all cursor-pointer"
                      onClick={() => handleCharacterSelect("Iam")}>
                  <CardContent className="p-4 flex flex-col items-center">
                    <div className="mb-4">
                      <ChickenAvatar 
                        chickenType="html_iam" 
                        jockeyType="html_iam"
                        size="lg"
                      />
                    </div>
                    <h3 className="font-minecraft text-lg text-yellow-400 mb-2 text-center">IAM</h3>
                    <p className="text-sm text-gray-300 text-center mb-4">
                      The Mystery Jockey
                    </p>
                    <div className="bg-black/40 p-2 rounded-md mb-2 w-full">
                      <p className="text-xs text-gray-200">
                        <span className="text-yellow-300">+</span> Random character assignment
                      </p>
                      <p className="text-xs text-gray-200">
                        <span className="text-yellow-300">+</span> Unpredictable story path
                      </p>
                      <p className="text-xs text-gray-200">
                        <span className="text-yellow-300">?</span> Unknown attributes
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Character dialogue */}
              {selectedCharacter && (
                <div className="bg-black/40 p-4 rounded-md mb-6">
                  <p className="text-primary font-bold mb-2">{selectedCharacter === "Matikah" ? "Matikah" : selectedCharacter === "Auto" ? "Auto" : "???"}:</p>
                  <p className="text-gray-200 italic">"{getCharacterDialogue(selectedCharacter, "intro")}"</p>
                </div>
              )}
              
              <div className="flex justify-between">
                <PixelButton variant="secondary" onClick={handleBackToMenu}>
                  Back to Menu
                </PixelButton>
                
                {selectedCharacter && (
                  <PixelButton onClick={() => {
                    prepareRace(0, selectedCharacter);
                    setShowCharacterSelection(false);
                  }}>
                    Begin Journey
                  </PixelButton>
                )}
              </div>
            </div>
          </div>
        )}
        
        {showRace && (
          <SinglePlayerRace 
            onRaceComplete={handleRaceComplete}
            onBackToMenu={handleBackToMenu}
            campaignMode={true}
            campaignPrompt={racePrompt}
            campaignRaceNumber={forkState.currentForkRace}
            campaignRaceTitle={forkState.currentForkRace === 0 ? "Choose Your Path" : `${forkState.selectedCharacter}'s Journey`}
          />
        )}
      </main>
      
      <Footer />
    </div>
  );
}