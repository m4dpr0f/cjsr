import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { PixelButton } from "@/components/ui/pixel-button";
import { Card, CardContent } from "@/components/ui/card";
import { ChickenAvatar } from "@/components/ui/chicken-avatar";
import { Badge } from "@/components/ui/badge";
import { Lock, AlertTriangle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  selectCharacter,
  PlayerCharacter,
  getCharacterDialogue,
} from "@/lib/fork";
import { getUserProgress } from "@/lib/single-player";
import { getLevelFromXp } from "@/lib/utils";
import { getCampaignProgress, isCampaignUnlocked } from "@/lib/campaigns";
import { useToast } from "@/hooks/use-toast";

export default function NewCampaignSelector() {
  const [, setLocation] = useLocation();
  const [selectedCharacter, setSelectedCharacter] = useState<PlayerCharacter>(null);
  const [showGuestWarning, setShowGuestWarning] = useState(false);
  const [showUnlockNotification, setShowUnlockNotification] = useState(false);
  const [unlockMessage, setUnlockMessage] = useState("");
  const { toast } = useToast();
  
  // Fetch profile data to check if user is logged in
  const { 
    data: profile, 
    isLoading: profileLoading,
  } = useQuery({
    queryKey: ['/api/profile'],
    retry: false,
  });
  
  const isLoggedIn = !!profile;
  
  useEffect(() => {
    document.title = "Campaign Selection - Chicken Jockey Scribe Racer";
  }, []);
  
  // Get player level from profile data
  const level = profile?.level || 0;
  
  // Get campaign progress to check unlock status
  const { data: campaignProgressData } = useQuery({
    queryKey: ['/api/campaign-progress'],
    enabled: isLoggedIn,
    retry: false,
  });
  
  const handleCharacterSelect = (character: PlayerCharacter) => {
    // Check if campaign is unlocked
    const unlockStatus = getCharacterLockStatus(character);
    
    if (unlockStatus.locked) {
      setUnlockMessage(unlockStatus.message);
      setShowUnlockNotification(true);
      return;
    }
    
    setSelectedCharacter(character);
    
    // Show guest warning if not logged in
    if (!isLoggedIn) {
      setShowGuestWarning(true);
    }
  };
  
  const handleStartCampaign = () => {
    if (!selectedCharacter) return;
    
    // Navigate to the appropriate character campaign page
    switch (selectedCharacter) {
      case "Steve":
        setLocation('/campaign/steve');
        break;
      case "Auto":
        setLocation('/campaign/auto');
        break;
      case "Matikah":
        setLocation('/campaign/matikah');
        break;
      case "Iam":
        setLocation('/campaign/iam');
        break;
      default:
        // Default to Steve's campaign
        setLocation('/campaign/steve');
    }
  };
  
  const handleLoginRedirect = () => {
    setLocation('/login');
  };
  
  const handleContinueAsGuest = () => {
    handleStartCampaign();
  };
  
  // ALL CAMPAIGNS UNLOCKED - No level restrictions
  const getCharacterLockStatus = (characterId: PlayerCharacter) => {
    return { locked: false, requiredLevel: 0 };
  };
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-3xl font-minecraft text-primary text-center mb-6">CHOOSE YOUR CAMPAIGN</h1>
        <p className="text-center text-light mb-8 max-w-2xl mx-auto">
          Select a character to begin their unique story campaign. Each character offers a different perspective on the world of Chicken Jockey Scribe Racers and will face unique challenges and rewards.
        </p>
        
        {/* Character selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto mb-8">
          {/* Steve & Brutus */}
          <Card 
            className={`bg-dark border-2 ${selectedCharacter === "Steve" ? "border-yellow-500" : "border-gray-700"} hover:border-yellow-500 transition-all relative overflow-hidden cursor-pointer`}
            onClick={() => handleCharacterSelect("Steve")}
          >
            <CardContent className="p-6 flex flex-col items-center">
              <div className="mb-4">
                <ChickenAvatar 
                  chickenType="html_steve" 
                  jockeyType="html_steve"
                  size="lg"
                />
              </div>
              <h3 className="font-minecraft text-lg text-yellow-400 mb-2 text-center">STEVE & BRUTUS</h3>
              <p className="text-sm text-gray-300 text-center mb-4 min-h-[60px]">
                A legendary Chicken Jockey and father figure whose culture has been outlawed by the Empire.
              </p>
              <div className="w-full text-center">
                <Badge variant="outline" className="bg-green-900/50 text-green-400 border-green-500">
                  Original Campaign
                </Badge>
              </div>
            </CardContent>
          </Card>
          
          {/* Auto & Timaru */}
          <Card 
            className={`bg-dark border-2 ${selectedCharacter === "Auto" ? "border-yellow-500" : "border-gray-700"} hover:border-yellow-500 transition-all relative overflow-hidden ${getCharacterLockStatus("Auto").locked ? "opacity-70" : ""} cursor-pointer`}
            onClick={() => !getCharacterLockStatus("Auto").locked && handleCharacterSelect("Auto")}
          >
            <CardContent className="p-6 flex flex-col items-center">
              <div className="mb-4">
                <ChickenAvatar 
                  chickenType="html_auto" 
                  jockeyType="html_auto"
                  size="lg"
                />
              </div>
              <h3 className="font-minecraft text-lg text-yellow-400 mb-2 text-center">AUTO & TIMARU</h3>
              <p className="text-sm text-gray-300 text-center mb-4 min-h-[60px]">
                The mysterious hooded champion with a golden visage and loyal red mount with a green eye.
              </p>
              <div className="w-full text-center">
                <Badge variant="outline" className="bg-blue-900/50 text-blue-400 border-blue-500">
                  Technology Path
                </Badge>
              </div>
              
              {getCharacterLockStatus("Auto").locked && (
                <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex flex-col items-center justify-center">
                  <Lock className="w-8 h-8 text-yellow-500 mb-2" />
                  <Badge variant="outline" className="border-yellow-500 text-yellow-400">
                    Unlocks at Level {getCharacterLockStatus("Auto").requiredLevel}
                  </Badge>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Matikah & Chalisa */}
          <Card 
            className={`bg-dark border-2 ${selectedCharacter === "Matikah" ? "border-yellow-500" : "border-gray-700"} hover:border-yellow-500 transition-all relative overflow-hidden ${getCharacterLockStatus("Matikah").locked ? "opacity-70" : ""} cursor-pointer`}
            onClick={() => !getCharacterLockStatus("Matikah").locked && handleCharacterSelect("Matikah")}
          >
            <CardContent className="p-6 flex flex-col items-center">
              <div className="mb-4">
                <ChickenAvatar 
                  chickenType="html_matikah" 
                  jockeyType="html_matikah"
                  size="lg"
                />
              </div>
              <h3 className="font-minecraft text-lg text-yellow-400 mb-2 text-center">MATIKAH & CHALISA</h3>
              <p className="text-sm text-gray-300 text-center mb-4 min-h-[60px]">
                The teal and orange clad rider with a distinctive feathered headdress and knowledge of ancient texts.
              </p>
              <div className="w-full text-center">
                <Badge variant="outline" className="bg-green-900/50 text-green-400 border-green-500">
                  Scholar Path
                </Badge>
              </div>
              
              {getCharacterLockStatus("Matikah").locked && (
                <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex flex-col items-center justify-center">
                  <Lock className="w-8 h-8 text-yellow-500 mb-2" />
                  <Badge variant="outline" className="border-yellow-500 text-yellow-400">
                    Unlocks at Level {getCharacterLockStatus("Matikah").requiredLevel}
                  </Badge>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Iam */}
          <Card 
            className={`bg-dark border-2 ${selectedCharacter === "Iam" ? "border-yellow-500" : "border-gray-700"} hover:border-yellow-500 transition-all relative overflow-hidden ${getCharacterLockStatus("Iam").locked ? "opacity-70" : ""} cursor-pointer`}
            onClick={() => !getCharacterLockStatus("Iam").locked && handleCharacterSelect("Iam")}
          >
            <CardContent className="p-6 flex flex-col items-center">
              <div className="mb-4">
                <ChickenAvatar 
                  chickenType="html_iam" 
                  jockeyType="html_iam"
                  size="lg"
                />
              </div>
              <h3 className="font-minecraft text-lg text-yellow-400 mb-2 text-center">IAM</h3>
              <p className="text-sm text-gray-300 text-center mb-4 min-h-[60px]">
                The enigmatic traveler with untold typing powers and a mysterious connection to the ancient scripts.
              </p>
              <div className="w-full text-center">
                <Badge variant="outline" className="bg-purple-900/50 text-purple-400 border-purple-500">
                  Mystery Path
                </Badge>
              </div>
              
              {getCharacterLockStatus("Iam").locked && (
                <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex flex-col items-center justify-center">
                  <Lock className="w-8 h-8 text-yellow-500 mb-2" />
                  <Badge variant="outline" className="border-yellow-500 text-yellow-400">
                    Unlocks at Level {getCharacterLockStatus("Iam").requiredLevel}
                  </Badge>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        {/* Character dialogue */}
        {selectedCharacter && (
          <div className="bg-black/40 p-4 rounded-md mb-6 max-w-2xl mx-auto">
            <p className="text-primary font-bold mb-2">
              {selectedCharacter === "Matikah" ? "Matikah" : 
               selectedCharacter === "Auto" ? "Auto" : 
               selectedCharacter === "Steve" ? "Steve" : "Iam"}:
            </p>
            <p className="text-gray-200 italic">
              {getCharacterDialogue(selectedCharacter, "intro")}
            </p>
          </div>
        )}
        
        {/* Guest warning modal */}
        {showGuestWarning && !isLoggedIn && (
          <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/80">
            <Card className="w-full max-w-md mx-4 border-2 border-yellow-500">
              <CardContent className="p-6">
                <div className="flex items-center mb-4 text-yellow-400">
                  <AlertTriangle className="w-6 h-6 mr-2" />
                  <h3 className="font-minecraft text-lg">Guest Mode Warning</h3>
                </div>
                
                <p className="text-gray-300 mb-4">
                  You're about to play in guest mode. Your progress and unlocks won't be saved.
                </p>
                
                <p className="text-gray-300 mb-6">
                  Create an account to track your progress, unlock rewards, and customize your chicken jockey!
                </p>
                
                <div className="grid grid-cols-2 gap-3">
                  <PixelButton variant="default" onClick={handleLoginRedirect}>
                    Create Account
                  </PixelButton>
                  
                  <PixelButton variant="outline" onClick={handleContinueAsGuest}>
                    Continue as Guest
                  </PixelButton>
                </div>
                
                <Button 
                  variant="link" 
                  className="w-full mt-2 text-gray-400" 
                  onClick={() => setShowGuestWarning(false)}
                >
                  Cancel
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
        
        {/* Action buttons */}
        <div className="flex justify-center gap-4">
          <PixelButton variant="outline" onClick={() => setLocation('/')}>
            Back to Menu
          </PixelButton>
          
          {selectedCharacter && (
            <PixelButton onClick={handleStartCampaign}>
              Start Campaign
            </PixelButton>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
}