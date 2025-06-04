import { useState } from "react";
import { useLocation } from "wouter";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { PixelButton } from "@/components/ui/pixel-button";
import { Card, CardContent } from "@/components/ui/card";
import { ChickenAvatar } from "@/components/ui/chicken-avatar";

export default function CampaignSelector() {
  const [, setLocation] = useLocation();
  
  // Function to navigate to different campaign modes
  const navigateToCampaign = (campaignType: string) => {
    if (campaignType === 'classic') {
      setLocation('/campaign');
    } else if (campaignType === 'fork') {
      setLocation('/fork');
    }
  };
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-grow container mx-auto p-4">
        <div className="max-w-4xl mx-auto">
          <div className="minecraft-border p-6 bg-black/60 mb-6">
            <h1 className="text-2xl font-minecraft text-center text-primary mb-4">CHOOSE YOUR CAMPAIGN</h1>
            
            <div className="bg-yellow-800/50 border border-yellow-600 p-3 mb-4 rounded">
              <p className="text-white font-bold mb-1">🏆 CHICKEN JOCKEY CAMPAIGN</p>
              <p className="text-yellow-200 text-sm">
                Choose your adventure path through the legendary world of Chicken Jockey racing. Each campaign offers unique storylines, characters, and challenges.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
              {/* Classic Campaign */}
              <Card className="bg-dark border-2 border-yellow-800 hover:border-yellow-500 transition-all cursor-pointer"
                    onClick={() => navigateToCampaign('classic')}>
                <CardContent className="p-4 flex flex-col items-center">
                  <div className="mb-4">
                    <ChickenAvatar 
                      chickenType="racer01" 
                      jockeyType="combined"
                      size="lg"
                    />
                  </div>
                  <h3 className="font-minecraft text-xl text-yellow-400 mb-2 text-center">CLASSIC CAMPAIGN</h3>
                  <p className="text-sm text-gray-300 text-center mb-4">
                    The original Chicken Jockey adventure
                  </p>
                  <div className="bg-black/40 p-3 rounded-md mb-2 w-full">
                    <p className="text-xs text-gray-200 mb-2">
                      <span className="text-yellow-300">•</span> Linear storyline with progressive difficulty
                    </p>
                    <p className="text-xs text-gray-200 mb-2">
                      <span className="text-yellow-300">•</span> Race against classic opponents
                    </p>
                    <p className="text-xs text-gray-200">
                      <span className="text-yellow-300">•</span> Unlock traditional rewards
                    </p>
                  </div>
                  <PixelButton className="mt-4">
                    START CLASSIC
                  </PixelButton>
                </CardContent>
              </Card>
              
              {/* Fork Campaign */}
              <Card className="bg-dark border-2 border-cyan-800 hover:border-cyan-500 transition-all cursor-pointer"
                    onClick={() => navigateToCampaign('fork')}>
                <CardContent className="p-4 flex flex-col items-center">
                  <div className="mb-4">
                    <ChickenAvatar 
                      chickenType="html_matikah" 
                      jockeyType="html_matikah"
                      size="lg"
                    />
                  </div>
                  <h3 className="font-minecraft text-xl text-cyan-400 mb-2 text-center">FORK CAMPAIGN</h3>
                  <p className="text-sm text-gray-300 text-center mb-4">
                    Choose your own path and destiny
                  </p>
                  <div className="bg-black/40 p-3 rounded-md mb-2 w-full">
                    <p className="text-xs text-gray-200 mb-2">
                      <span className="text-cyan-300">•</span> Branching storyline with character selection
                    </p>
                    <p className="text-xs text-gray-200 mb-2">
                      <span className="text-cyan-300">•</span> Race as Matikah, Auto, Steve or other heroes
                    </p>
                    <p className="text-xs text-gray-200">
                      <span className="text-cyan-300">•</span> Discover the secrets of the TEK8 Petals
                    </p>
                  </div>
                  <PixelButton className="mt-4 bg-cyan-900 hover:bg-cyan-800">
                    START FORK
                  </PixelButton>
                </CardContent>
              </Card>
            </div>
            
            <div className="mt-8 text-center">
              <PixelButton 
                variant="outline"
                onClick={() => setLocation('/race')}
              >
                BACK TO RACE MENU
              </PixelButton>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}