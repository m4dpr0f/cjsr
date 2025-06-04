import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { PixelButton } from "@/components/ui/pixel-button";
import { Card } from "@/components/ui/card";
import { ChickenAvatar } from "@/components/ui/chicken-avatar";
import { Badge } from "@/components/ui/badge";
// import { useAuth } from "@/hooks/use-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import PracticeRaceNew from "@/components/practice-race-new";
import { Dice1, Dice2, Dice3, Dice4, Dice5, Dice6, Crown, Zap } from "lucide-react";

// Elemental faction data
const ELEMENTAL_FACTIONS = [
  {
    id: 'd2',
    name: 'Coin Dynasty',
    element: 'Order',
    dice: '2-sided',
    color: 'bg-yellow-600',
    textColor: 'text-yellow-300',
    description: 'Masters of precision and consistency. The steady foundation of all racing.',
    philosophy: 'Balance through order',
    icon: Dice1,
    speedRange: '25-40 WPM',
    welcomeGift: 'Golden Hatchling'
  },
  {
    id: 'd4',
    name: 'Fire Legion',
    element: 'Fire',
    dice: '4-sided',
    color: 'bg-red-600',
    textColor: 'text-red-300',
    description: 'Fierce competitors driven by passion and determination.',
    philosophy: 'Victory through intensity',
    icon: Dice2,
    speedRange: '40-70 WPM',
    welcomeGift: 'Ember Striker'
  },
  {
    id: 'd6',
    name: 'Earth Wardens',
    element: 'Earth',
    dice: '6-sided',
    color: 'bg-green-600',
    textColor: 'text-green-300',
    description: 'Reliable and enduring, like the mountains themselves.',
    philosophy: 'Strength through patience',
    icon: Dice3,
    speedRange: '47-89 WPM',
    welcomeGift: 'Stone Guardian'
  },
  {
    id: 'd8',
    name: 'Air Nomads',
    element: 'Air',
    dice: '8-sided',
    color: 'bg-cyan-600',
    textColor: 'text-cyan-300',
    description: 'Swift and agile, dancing with the wind.',
    philosophy: 'Freedom through movement',
    icon: Dice4,
    speedRange: '55-95 WPM',
    welcomeGift: 'Wind Dancer'
  },
  {
    id: 'd10',
    name: 'Chaos Riders',
    element: 'Chaos',
    dice: '10-sided',
    color: 'bg-purple-600',
    textColor: 'text-purple-300',
    description: 'Unpredictable and wild, embracing the unknown.',
    philosophy: 'Power through chaos',
    icon: Dice5,
    speedRange: '65-115 WPM',
    welcomeGift: 'Void Walker'
  },
  {
    id: 'd12',
    name: 'Ether Seekers',
    element: 'Ether',
    dice: '12-sided',
    color: 'bg-indigo-600',
    textColor: 'text-indigo-300',
    description: 'Mystical scholars seeking ancient knowledge.',
    philosophy: 'Wisdom through understanding',
    icon: Dice6,
    speedRange: '74-122 WPM',
    welcomeGift: 'Spirit Guide'
  },
  {
    id: 'd20',
    name: 'Water Guardians',
    element: 'Water',
    dice: '20-sided',
    color: 'bg-blue-600',
    textColor: 'text-blue-300',
    description: 'Fluid and adaptive, flowing around obstacles.',
    philosophy: 'Grace through adaptation',
    icon: Crown,
    speedRange: '83-143 WPM',
    welcomeGift: 'Tide Runner'
  },
  {
    id: 'd100',
    name: 'Order Ascendant',
    element: 'Pure Order',
    dice: '100-sided',
    color: 'bg-white',
    textColor: 'text-gray-900',
    description: 'The ultimate expression of perfect control and mastery.',
    philosophy: 'Perfection through discipline',
    icon: Zap,
    speedRange: '100-160 WPM',
    welcomeGift: 'Celestial Mount'
  }
];

export default function Practice() {
  const [, setLocation] = useLocation();
  // const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const isAuthenticated = false;
  const isLoading = false;
  const [currentStep, setCurrentStep] = useState<'welcome' | 'tutorial' | 'placementTest' | 'factionSelect' | 'practice' | 'racing' | 'signupPrompt'>('welcome');
  const [selectedFaction, setSelectedFaction] = useState<string | null>(null);
  const [currentDifficulty, setCurrentDifficulty] = useState<'novice' | 'adept' | 'master' | null>(null);
  const [placementResults, setPlacementResults] = useState<{ wpm: number; accuracy: number; position: number; time: number } | null>(null);

  // Fetch user profile data for customization
  const { data: userProfile } = useQuery({
    queryKey: ['/api/profile'],
    retry: false,
  });

  useEffect(() => {
    document.title = "Scribe Arena - Chicken Jockey Scribe Racer";
  }, []);

  const handleFactionSelect = async (factionId: string) => {
    if (isAuthenticated) {
      try {
        await apiRequest("POST", "/api/profile/faction", {
          faction: factionId
        });
        
        // Invalidate profile cache to ensure fresh data
        queryClient.invalidateQueries({ queryKey: ['/api/profile'] });
        
        const faction = ELEMENTAL_FACTIONS.find(f => f.id === factionId);
        toast({
          title: "Faction Selected!",
          description: `Welcome to the ${faction?.name}! You've received a ${faction?.welcomeGift} as your starter mount.`,
        });
        
        setSelectedFaction(factionId);
        setCurrentStep('practice');
      } catch (error) {
        console.error('Error selecting faction:', error);
        toast({
          title: "Error",
          description: "Failed to select faction. Please try again.",
          variant: "destructive",
        });
      }
    } else {
      // For non-authenticated users, show signup prompt after faction selection
      setSelectedFaction(factionId);
      setCurrentStep('signupPrompt');
      const faction = ELEMENTAL_FACTIONS.find(f => f.id === factionId);
      toast({
        title: "Faction Selected!",
        description: `${faction?.name} chosen! Create an account to save your progress and unlock rewards.`,
      });
    }
  };

  const renderWelcomeStep = () => (
    <div className="text-center space-y-6">
      <div className="mb-8">
        <h1 className="text-4xl font-pixel text-yellow-400 mb-4">WELCOME TO THE SCRIBE ARENA</h1>
        <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
          Master the ancient art of racing while scribing sacred texts. Choose your elemental path and begin your journey as a Garu rider.
        </p>
      </div>
      
      <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        <Card className="minecraft-border p-6 bg-gray-900/80">
          <h3 className="text-xl font-pixel text-blue-400 mb-3">For New Racers</h3>
          <p className="text-gray-300 mb-4">
            Take the placement test on foot to discover your racing potential, then choose your first Garu egg based on your performance.
          </p>
          <PixelButton 
            onClick={() => setCurrentStep('placementTest')}
            className="w-full"
          >
            TAKE PLACEMENT TEST
          </PixelButton>
        </Card>
        
        <Card className="minecraft-border p-6 bg-gray-900/80">
          <h3 className="text-xl font-pixel text-green-400 mb-3">Experienced Riders</h3>
          <p className="text-gray-300 mb-4">
            Jump straight into practice mode with random faction matchups and varying difficulty.
          </p>
          <PixelButton 
            onClick={() => setCurrentStep('practice')}
            variant="secondary"
            className="w-full"
          >
            QUICK PRACTICE
          </PixelButton>
        </Card>
      </div>
      
      {!isAuthenticated && (
        <div className="mt-8 p-4 bg-blue-900/30 border border-blue-700 rounded-lg max-w-2xl mx-auto">
          <p className="text-blue-300 text-sm">
            💡 <strong>Sign up</strong> to save your progress, unlock campaign stories, and earn permanent faction rewards!
          </p>
        </div>
      )}
    </div>
  );

  const renderTutorialStep = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-pixel text-yellow-400 mb-4">THE EIGHT ELEMENTAL PATHS</h2>
        <p className="text-gray-300 max-w-2xl mx-auto">
          Each faction represents a different philosophy of racing. Choose the path that resonates with your spirit.
        </p>
      </div>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {ELEMENTAL_FACTIONS.map((faction) => {
          const IconComponent = faction.icon;
          return (
            <Card 
              key={faction.id}
              className={`minecraft-border p-4 cursor-pointer transition-all hover:scale-105 ${
                selectedFaction === faction.id ? 'ring-2 ring-yellow-400' : ''
              }`}
              onClick={() => setSelectedFaction(faction.id)}
            >
              <div className={`w-12 h-12 ${faction.color} rounded-lg flex items-center justify-center mb-3 mx-auto`}>
                <IconComponent className={`w-6 h-6 ${faction.textColor}`} />
              </div>
              
              <h3 className={`font-pixel text-sm ${faction.textColor} text-center mb-2`}>
                {faction.name}
              </h3>
              
              <Badge variant="outline" className="mx-auto block w-fit mb-2 text-xs">
                {faction.dice}
              </Badge>
              
              <p className="text-xs text-gray-400 text-center mb-2">
                {faction.speedRange}
              </p>
              
              <p className="text-xs text-gray-300 text-center italic">
                "{faction.philosophy}"
              </p>
            </Card>
          );
        })}
      </div>
      
      {selectedFaction && (
        <div className="text-center mt-8">
          <PixelButton 
            onClick={() => handleFactionSelect(selectedFaction)}
            size="lg"
          >
            CHOOSE {ELEMENTAL_FACTIONS.find(f => f.id === selectedFaction)?.name.toUpperCase()}
          </PixelButton>
        </div>
      )}
      
      <div className="text-center mt-6">
        <PixelButton 
          onClick={() => setCurrentStep('welcome')}
          variant="secondary"
        >
          BACK TO WELCOME
        </PixelButton>
      </div>
    </div>
  );

  const renderPracticeStep = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-pixel text-yellow-400 mb-4">SCRIBE ARENA</h2>
        {selectedFaction && (
          <div className="mb-4">
            <Badge className={ELEMENTAL_FACTIONS.find(f => f.id === selectedFaction)?.color}>
              Racing as {ELEMENTAL_FACTIONS.find(f => f.id === selectedFaction)?.name}
            </Badge>
          </div>
        )}
        <p className="text-gray-300">
          Practice your scribing skills against AI opponents. Perfect for warming up or learning new techniques.
        </p>
      </div>
      
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="minecraft-border p-6 bg-green-900/30">
          <h3 className="text-xl font-pixel text-green-400 mb-3">NOVICE SCROLLS</h3>
          <p className="text-gray-300 text-sm mb-4">
            Simple texts, slower opponents. Perfect for beginners learning the basics.
          </p>
          <div className="text-xs text-gray-400 mb-4">
            Opponents: 25-45 WPM
          </div>
          <PixelButton 
            className="w-full"
            onClick={() => {
              setCurrentDifficulty('novice');
              setCurrentStep('racing');
            }}
          >
            START NOVICE RACE
          </PixelButton>
        </Card>
        
        <Card className="minecraft-border p-6 bg-yellow-900/30">
          <h3 className="text-xl font-pixel text-yellow-400 mb-3">ADEPT TEXTS</h3>
          <p className="text-gray-300 text-sm mb-4">
            Moderate complexity with competitive AI racers.
          </p>
          <div className="text-xs text-gray-400 mb-4">
            Opponents: 45-75 WPM
          </div>
          <PixelButton 
            className="w-full"
            onClick={() => {
              setCurrentDifficulty('adept');
              setCurrentStep('racing');
            }}
          >
            START ADEPT RACE
          </PixelButton>
        </Card>
        
        <Card className="minecraft-border p-6 bg-red-900/30">
          <h3 className="text-xl font-pixel text-red-400 mb-3">MASTER CODEX</h3>
          <p className="text-gray-300 text-sm mb-4">
            Complex passages against elite AI opponents.
          </p>
          <div className="text-xs text-gray-400 mb-4">
            Opponents: 75-120 WPM
          </div>
          <PixelButton 
            className="w-full"
            onClick={() => {
              setCurrentDifficulty('master');
              setCurrentStep('racing');
            }}
          >
            START MASTER RACE
          </PixelButton>
        </Card>
      </div>
      
      <div className="text-center mt-8 space-x-4">
        <PixelButton 
          onClick={() => setLocation("/")}
          variant="secondary"
        >
          BACK TO LOBBY
        </PixelButton>
        
        <PixelButton 
          onClick={() => setCurrentStep('welcome')}
          variant="secondary"
        >
          RESTART TUTORIAL
        </PixelButton>
      </div>
    </div>
  );

  const renderPlacementTestStep = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-pixel text-yellow-400 mb-4">PLACEMENT TEST</h2>
        <p className="text-gray-300 max-w-2xl mx-auto mb-4">
          Face TeacherGuru in a 1v1 race to the Elemental Egg Nest. Race on foot while TeacherGuru rides his mount.
        </p>
        <p className="text-blue-300 max-w-2xl mx-auto">
          Your performance will unlock recommendations from the 8 elemental eggs waiting at the finish line.
        </p>
      </div>
      
      <PracticeRaceNew
        playerProfile={userProfile}
        onRaceComplete={(results) => {
          setPlacementResults(results);
          toast({
            title: "Placement Test Complete!",
            description: `You achieved ${results.wpm} WPM with ${results.accuracy}% accuracy. Now choose your first Garu egg!`,
          });
          setCurrentStep('factionSelect');
        }}
        onBackToMenu={() => setCurrentStep('welcome')}
      />
    </div>
  );

  const getFactionRecommendations = () => {
    if (!placementResults) return [];
    
    const { wpm } = placementResults;
    
    // Recommend factions based on WPM performance
    if (wpm >= 80) return ['d100', 'd20', 'd12']; // Order, Water, Ether for high performers
    if (wpm >= 60) return ['d12', 'd8', 'd10']; // Ether, Air, Chaos for good performers  
    if (wpm >= 40) return ['d6', 'd4', 'd8']; // Earth, Fire, Air for average performers
    return ['d2', 'd6', 'd4']; // Coin, Earth, Fire for beginners
  };

  const renderFactionSelectStep = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-pixel text-yellow-400 mb-4">CHOOSE YOUR FIRST GARU EGG</h2>
        {placementResults && (
          <div className="mb-4 p-4 bg-blue-900/30 border border-blue-700 rounded-lg max-w-2xl mx-auto">
            <p className="text-blue-300">
              Your placement results: <strong>{placementResults.wpm} WPM</strong> with <strong>{placementResults.accuracy}% accuracy</strong>
            </p>
            <p className="text-blue-200 text-sm mt-2">
              Based on your performance, these factions are recommended for you:
            </p>
          </div>
        )}
      </div>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {ELEMENTAL_FACTIONS.map((faction) => {
          const IconComponent = faction.icon;
          const recommendations = getFactionRecommendations();
          const isRecommended = recommendations.includes(faction.id);
          
          return (
            <Card 
              key={faction.id}
              className={`minecraft-border p-4 cursor-pointer transition-all hover:scale-105 ${
                selectedFaction === faction.id ? 'ring-2 ring-yellow-400' : ''
              } ${isRecommended ? 'border-green-400 bg-green-900/20' : ''}`}
              onClick={() => {
                setSelectedFaction(faction.id);
                // Save faction selection for potential account creation
                localStorage.setItem('selected_faction', faction.id);
              }}
            >
              {isRecommended && (
                <div className="text-center mb-2">
                  <span className="text-xs text-green-400 font-pixel">RECOMMENDED</span>
                </div>
              )}
              
              <div className={`w-12 h-12 ${faction.color} rounded-lg flex items-center justify-center mb-3 mx-auto`}>
                <IconComponent className={`w-6 h-6 ${faction.textColor}`} />
              </div>
              
              <h3 className={`font-pixel text-sm ${faction.textColor} text-center mb-2`}>
                {faction.name}
              </h3>
              
              <Badge variant="outline" className="mx-auto block w-fit mb-2 text-xs">
                {faction.dice}
              </Badge>
              
              <p className="text-xs text-gray-400 text-center mb-2">
                {faction.speedRange}
              </p>
              
              <p className="text-xs text-gray-300 text-center italic">
                "{faction.philosophy}"
              </p>
            </Card>
          );
        })}
      </div>
      
      {selectedFaction && (
        <div className="text-center mt-8">
          <PixelButton 
            onClick={() => handleFactionSelect(selectedFaction)}
            size="lg"
          >
            CLAIM {ELEMENTAL_FACTIONS.find(f => f.id === selectedFaction)?.welcomeGift.toUpperCase()} EGG
          </PixelButton>
        </div>
      )}
      
      <div className="text-center mt-6">
        <PixelButton 
          onClick={() => setCurrentStep('placementTest')}
          variant="secondary"
        >
          RETAKE PLACEMENT TEST
        </PixelButton>
      </div>
    </div>
  );

  const renderRacingStep = () => {
    if (!currentDifficulty) return null;
    
    return (
      <PracticeRaceNew
        playerProfile={userProfile}
        onRaceComplete={(results) => {
          toast({
            title: "Race Complete!",
            description: `You achieved ${results.wpm} WPM with ${results.accuracy}% accuracy in ${results.position}${results.position === 1 ? 'st' : results.position === 2 ? 'nd' : results.position === 3 ? 'rd' : 'th'} place!`,
          });
          setCurrentStep('practice');
        }}
        onBackToMenu={() => setCurrentStep('practice')}
      />
    );
  };

  const renderSignupPromptStep = () => {
    const selectedFactionData = ELEMENTAL_FACTIONS.find(f => f.id === selectedFaction);
    
    return (
      <div className="text-center space-y-8">
        <div className="mb-8">
          <h1 className="text-4xl font-pixel text-yellow-400 mb-4">🎉 FACTION SELECTED! 🎉</h1>
          <div className="bg-gradient-to-r from-gray-900 to-gray-800 border-2 border-amber-500 rounded-lg p-6 max-w-2xl mx-auto">
            <div className={`w-16 h-16 ${selectedFactionData?.color} rounded-lg flex items-center justify-center mb-4 mx-auto`}>
              {selectedFactionData && <selectedFactionData.icon className={`w-8 h-8 ${selectedFactionData.textColor}`} />}
            </div>
            <h2 className={`text-2xl font-pixel ${selectedFactionData?.textColor} mb-2`}>
              {selectedFactionData?.name}
            </h2>
            <p className="text-gray-300 mb-4">"{selectedFactionData?.philosophy}"</p>
            <div className="text-amber-300 font-bold">
              🥚 Welcome Gift: {selectedFactionData?.welcomeGift}
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-900 to-blue-900 border-2 border-cyan-400 rounded-lg p-6 max-w-xl mx-auto">
          <h3 className="text-xl font-pixel text-cyan-300 mb-4">SAVE YOUR PROGRESS</h3>
          <p className="text-gray-300 mb-6 leading-relaxed">
            Create an account to keep your faction selection, unlock rewards, track your racing stats, 
            and compete in leaderboards!
          </p>
          
          <div className="space-y-4">
            <PixelButton 
              onClick={() => setLocation('/register')}
              size="lg"
              className="w-full bg-green-600 hover:bg-green-700"
            >
              CREATE ACCOUNT & KEEP PROGRESS
            </PixelButton>
            
            <PixelButton 
              onClick={() => setCurrentStep('practice')}
              size="sm" 
              className="w-full bg-gray-600 hover:bg-gray-700"
            >
              Continue as Guest (Progress Lost)
            </PixelButton>
          </div>
        </div>
        
        <div className="text-center">
          <p className="text-sm text-gray-500">
            Already have an account? 
            <button 
              onClick={() => setLocation('/login')}
              className="text-cyan-400 hover:text-cyan-300 ml-1 underline"
            >
              Sign in here
            </button>
          </p>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-dark">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-gray-400">Loading Scribe Arena...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-dark">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-8 bg-dark text-light">
        <div className="max-w-6xl mx-auto">
          {currentStep === 'welcome' && renderWelcomeStep()}
          {currentStep === 'tutorial' && renderTutorialStep()}
          {currentStep === 'placementTest' && renderPlacementTestStep()}
          {currentStep === 'factionSelect' && renderFactionSelectStep()}
          {currentStep === 'signupPrompt' && renderSignupPromptStep()}
          {currentStep === 'practice' && renderPracticeStep()}
          {currentStep === 'racing' && renderRacingStep()}
        </div>
      </main>
      
      <Footer />
    </div>
  );
}