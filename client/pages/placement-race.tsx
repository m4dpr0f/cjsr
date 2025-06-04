import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { SinglePlayerRace } from "@/components/single-player-race";
import { Card, CardContent } from "@/components/ui/card";
import { PixelButton } from "@/components/ui/pixel-button";
import { Progress } from "@/components/ui/progress";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function PlacementRace() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [raceCompleted, setRaceCompleted] = useState(false);
  const [racerStats, setRacerStats] = useState<{
    wpm: number;
    accuracy: number;
    time: number;
  } | null>(null);
  const [placementPrompt, setPlacementPrompt] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  useEffect(() => {
    // Set document title
    document.title = "Placement Race - Chicken Jockey Scribe Racer";
    
    // Check if user is logged in
    apiRequest('GET', '/api/profile')
      .then(response => {
        if (response.ok) {
          return response.json().then(data => {
            setIsLoggedIn(true);
          });
        }
      })
      .catch(() => {
        setIsLoggedIn(false);
      });
    
    // Get placement prompt from session storage
    const storedPrompt = sessionStorage.getItem('placement_prompt');
    if (storedPrompt) {
      setPlacementPrompt(storedPrompt);
    } else {
      // Default prompt if none is set
      setPlacementPrompt("The quick brown fox jumps over the lazy dog.");
    }
  }, []);
  
  const handleRaceComplete = (stats: { wpm: number; accuracy: number; time: number }) => {
    setRacerStats(stats);
    setRaceCompleted(true);
    
    // Show congrats toast
    toast({
      title: `Great job! ${stats.wpm} WPM`,
      description: `You completed the placement race with ${stats.accuracy}% accuracy.`,
    });
    
    // Check if user is already logged in via API
    apiRequest('GET', '/api/profile')
      .then(response => {
        if (response.ok) {
          // User is already logged in, we'll handle this in the UI
          setIsLoggedIn(true);
          return response.json();
        }
        setIsLoggedIn(false);
        return null;
      })
      .catch(() => {
        setIsLoggedIn(false);
      }); // Silently fail if there's an error
  };
  
  const handleCreateAccount = () => {
    // Store stats in session storage for the registration page
    if (racerStats) {
      sessionStorage.setItem('placement_stats', JSON.stringify(racerStats));
    }
    setLocation('/register');
  };
  
  const handleTryAgain = () => {
    setRaceCompleted(false);
  };
  
  const handleSkipToGameMenu = () => {
    // Go to the game mode selection screen
    setLocation('/game-menu');
  };
  
  const handleBackToMenu = () => {
    setLocation('/');
  };
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        {!raceCompleted ? (
          <>
            <h1 className="text-2xl font-minecraft text-primary text-center mb-6">PLACEMENT RACE</h1>
            <div className="bg-blue-900/30 border border-blue-700 rounded-md p-4 mb-6 max-w-xl mx-auto">
              <h3 className="text-blue-400 font-bold mb-2">👋 Welcome to Chicken Jockey Scribe Racer!</h3>
              <p className="text-blue-200 text-sm mb-2">
                This quick placement race will help us determine your typing skill level.
                Type the sentence below as quickly and accurately as you can.
              </p>
            </div>
            
            <SinglePlayerRace
              onRaceComplete={handleRaceComplete}
              onBackToMenu={handleBackToMenu}
              campaignMode={true}
              campaignPrompt={placementPrompt}
              campaignRaceNumber={0}
              campaignRaceTitle="Placement Race"
            />
          </>
        ) : (
          <div className="max-w-2xl mx-auto">
            <Card className="minecraft-border p-6 bg-gradient-to-b from-gray-900 to-dark border-2 border-primary">
              <CardContent className="p-0">
                <div className="text-center mb-6">
                  <h2 className="text-3xl font-minecraft text-yellow-400 mb-2">
                    {racerStats && racerStats.wpm >= 40 ? "1st Place!" : "Finish!"}
                  </h2>
                  <div className="flex justify-center mb-4">
                    {racerStats && racerStats.wpm >= 40 ? (
                      <div className="text-6xl">🏆</div>
                    ) : (
                      <div className="text-6xl">🏁</div>
                    )}
                  </div>
                  
                  <div className="bg-dark p-4 rounded-lg mb-6">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-light">WPM:</span>
                      <span className="text-2xl font-minecraft text-primary">{racerStats?.wpm || 0}</span>
                    </div>
                    <Progress value={Math.min((racerStats?.wpm || 0) / 1.5, 100)} className="h-2 mb-4" />
                    
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-light">Accuracy:</span>
                      <span className="text-2xl font-minecraft text-primary">{racerStats?.accuracy || 0}%</span>
                    </div>
                    <Progress value={racerStats?.accuracy || 0} className="h-2 mb-4" />
                    
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-light">Time:</span>
                      <span className="text-2xl font-minecraft text-primary">
                        {racerStats ? (racerStats.time / 1000).toFixed(2) : 0}s
                      </span>
                    </div>
                  </div>
                  
                  {isLoggedIn ? (
                    <div className="text-center mb-6">
                      <h3 className="text-lg font-minecraft text-primary mb-2">Race Complete!</h3>
                      <p className="text-light mb-4">
                        Your results have been saved to your profile. Continue to explore more game modes!
                      </p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <PixelButton
                          variant="outline"
                          onClick={handleTryAgain}
                        >
                          Race Again
                        </PixelButton>
                        
                        <PixelButton
                          variant="default"
                          onClick={handleSkipToGameMenu}
                        >
                          Continue to Game Menu
                        </PixelButton>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="text-center mb-6">
                        <h3 className="text-lg font-minecraft text-primary mb-2">Ready to save your results?</h3>
                        <p className="text-light mb-4">
                          Create an account to track your progress, customize your chicken jockey, and compete in multiplayer races!
                        </p>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <PixelButton
                          variant="default"
                          onClick={handleCreateAccount}
                          className="bg-red-600 hover:bg-red-700 border-0"
                        >
                          Create Account
                        </PixelButton>
                        
                        <PixelButton
                          variant="outline"
                          onClick={handleTryAgain}
                        >
                          Try Again
                        </PixelButton>
                        
                        <PixelButton
                          variant="outline"
                          onClick={handleSkipToGameMenu}
                        >
                          Continue as Guest
                        </PixelButton>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
}