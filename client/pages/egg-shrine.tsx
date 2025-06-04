import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const EGG_TYPES = [
  { id: "d4", name: "D4", element: "Fire Element", eggName: "flameheart egg", color: "bg-red-600", icon: "🔥" },
  { id: "d6", name: "D6", element: "Earth Element", eggName: "terraverde egg", color: "bg-green-600", icon: "🌿" },
  { id: "d8", name: "D8", element: "Air Element", eggName: "skywisp egg", color: "bg-gray-400", icon: "💨" },
  { id: "d10", name: "D10", element: "Chaos Element", eggName: "voidmyst egg", color: "bg-purple-600", icon: "⚡" },
  { id: "d12", name: "D12", element: "Ether Element", eggName: "ethereal egg", color: "bg-gray-800", icon: "✨" },
  { id: "d20", name: "D20", element: "Water Element", eggName: "aquafrost egg", color: "bg-blue-600", icon: "💧" },
  { id: "d2", name: "D2", element: "Coin Element", eggName: "silver egg", color: "bg-gray-500", icon: "🪙" },
  { id: "d100", name: "D100", element: "Order Element", eggName: "goldstone egg", color: "bg-yellow-500", icon: "⭐" },
];

export default function EggShrinePage() {
  const [selectedEgg, setSelectedEgg] = useState<string | null>(null);
  const { toast } = useToast();

  // Fetch player profile to get total XP and egg inventory
  const { data: profile } = useQuery({
    queryKey: ["/api/profile"],
  });

  // Fetch egg inventory
  const { data: eggData } = useQuery({
    queryKey: ["/api/profile/eggs"],
  });

  // Calculate available claims (1% of total XP)
  const totalXP = (profile as any)?.xp || 0;
  const availableClaims = Math.floor(totalXP * 0.01);
  const eggInventory = (eggData as any)?.egg_inventory ? JSON.parse((eggData as any).egg_inventory) : {};
  const totalClaimedEggs = Object.values(eggInventory).reduce((sum: number, count: any) => sum + (count || 0), 0);
  const remainingClaims = Math.max(0, availableClaims - totalClaimedEggs);

  // Handle claim button click - show season message
  const handleClaimClick = () => {
    if (!selectedEgg) {
      toast({
        title: "Select an Egg Type",
        description: "Please select an egg type first!",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "🎯 Hatching Time Approaches!",
      description: "Egg claiming and hatching will be activated at the end of Season 0. Your claims are being tracked - keep racing to earn more!",
      duration: 5000,
    });
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-grow container mx-auto p-4">
        <Card className="bg-dark minecraft-border max-w-4xl mx-auto">
          <CardHeader className="border-b border-primary/50">
            <CardTitle className="text-primary font-minecraft text-center text-2xl">
              🥚 EGG SHRINE 🥚
            </CardTitle>
            <div className="text-center text-light mt-2">
              <div className="text-lg">Available Claims: <span className="text-primary font-bold">{remainingClaims}</span></div>
              <div className="text-sm text-accent">Based on 1% of your total XP ({totalXP.toLocaleString()})</div>
            </div>
          </CardHeader>
          
          <CardContent className="p-6">
            {/* Season Notice */}
            <div className="bg-purple-900/50 border border-purple-400 p-4 mb-6 rounded">
              <div className="text-center">
                <div className="text-purple-200 font-minecraft text-lg mb-2">🎯 SEASON 0 - EARNING PHASE 🎯</div>
                <div className="text-purple-100 text-sm">
                  You're currently earning egg claims! Actual egg claiming and hatching will be activated at the end of Season 0. 
                  Keep racing to build up your claim count for the grand hatching event!
                </div>
              </div>
            </div>
            
            {/* Egg Grid */}
            <div className="grid grid-cols-4 gap-4 mb-6">
              {EGG_TYPES.map((egg) => {
                const count = eggInventory[egg.id] || 0;
                const isSelected = selectedEgg === egg.id;
                
                return (
                  <div
                    key={egg.id}
                    onClick={() => setSelectedEgg(egg.id)}
                    className={`
                      p-4 border-2 rounded cursor-pointer transition-all
                      ${isSelected ? 'border-primary bg-primary/20' : 'border-primary/30 hover:border-primary/60'}
                    `}
                  >
                    <div className="text-center">
                      {/* Die Icon */}
                      <div className={`w-8 h-8 rounded-full ${egg.color} flex items-center justify-center mx-auto mb-2`}>
                        <span className="text-white font-bold text-sm">{egg.name}</span>
                      </div>
                      
                      {/* Element Info */}
                      <div className="text-primary font-minecraft text-sm mb-1">{egg.element}</div>
                      <div className="text-light text-xs mb-2">{egg.eggName}</div>
                      
                      {/* Count Badge */}
                      {count > 0 && (
                        <div className="bg-primary text-dark rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mx-auto">
                          {count}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* Claim Button */}
            <div className="text-center">
              <Button
                onClick={handleClaimClick}
                disabled={!selectedEgg || remainingClaims <= 0}
                className="bg-green-600 hover:bg-green-700 text-white font-minecraft text-lg px-8 py-4 w-full max-w-md"
              >
                {selectedEgg 
                  ? `CLAIM ${EGG_TYPES.find(e => e.id === selectedEgg)?.name} EGG` 
                  : "SELECT AN EGG TYPE FIRST"
                }
              </Button>
              
              {remainingClaims <= 0 && (
                <div className="text-accent mt-2 text-sm">
                  You've claimed all available eggs! Earn more XP to unlock additional claims.
                </div>
              )}
            </div>
            
            {/* Selected Egg Info */}
            {selectedEgg && (
              <div className="mt-4 p-4 bg-dark/50 rounded border border-primary/30 text-center">
                <div className="text-primary font-minecraft">
                  Selected: {EGG_TYPES.find(e => e.id === selectedEgg)?.element}
                </div>
                <div className="text-light text-sm">
                  {EGG_TYPES.find(e => e.id === selectedEgg)?.eggName}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
      
      <Footer />
    </div>
  );
}