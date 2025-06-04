import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'wouter';
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { ChickenAvatar } from "@/components/ui/chicken-avatar";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { getLevelFromXp } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// Types for eggs and other data
interface GaruEgg {
  id: number;
  name: string;
  type: string;
  elemental_affinity: string;
  color: string;
  rarity: string;
  hatched: number;
  level: number;
  xp: number;
  stats: {
    speed: number;
    endurance: number;
    luck: number;
    intellect: number;
  };
  created_at: string;
  source: string;
}

export default function CharacterRecordPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('stats');
  
  // Fetch profile data
  const { 
    data: profile, 
    isLoading: profileLoading, 
    isError: profileError 
  } = useQuery({
    queryKey: ['/api/profile'],
    retry: false,
  });
  
  // Fetch eggs data
  const { 
    data: eggsData, 
    isLoading: eggsLoading, 
    isError: eggsError 
  } = useQuery({
    queryKey: ['/api/profile/eggs'],
    retry: false,
    enabled: !!profile, // Only fetch if user is logged in
  });
  
  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };
  
  // Calculate win rate
  const calculateWinRate = () => {
    if (!profile) return 0;
    const totalRaces = profile.total_races || 0;
    const racesWon = profile.races_won || 0;
    if (totalRaces === 0) return 0;
    return Math.round((racesWon / totalRaces) * 100);
  };
  
  // Generate color class based on rarity
  const getRarityColorClass = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return 'text-yellow-400';
      case 'epic': return 'text-purple-400';
      case 'rare': return 'text-blue-400';
      case 'uncommon': return 'text-green-400';
      default: return 'text-gray-400';
    }
  };
  
  // Get color based on element
  const getElementColor = (eggType: string) => {
    switch (eggType) {
      case 'FireGaru': return 'text-red-500';
      case 'WaterGaru': return 'text-blue-500';
      case 'EarthGaru': return 'text-green-500';
      case 'AirGaru': return 'text-sky-400';
      case 'EtherGaru': return 'text-purple-500';
      case 'ChaosGaru': return 'text-orange-500';
      case 'OrderGaru': return 'text-indigo-500';
      case 'WealthGaru': return 'text-yellow-400';
      default: return 'text-gray-400';
    }
  };
  
  // Handle collecting an egg from the codex
  const handleCollectEgg = async () => {
    try {
      const response = await apiRequest('POST', '/api/tek8/generate-egg');
      const data = await response.json();
      
      if (data.success) {
        queryClient.invalidateQueries({ queryKey: ['/api/profile/eggs'] });
        toast({
          title: "New Egg Collected!",
          description: `You found a ${data.egg.rarity} ${data.egg.type}: ${data.egg.name}`,
        });
      }
    } catch (error) {
      console.error("Error collecting egg:", error);
      toast({
        title: "Error",
        description: "Failed to collect egg. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  if (profileLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-dark">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
          </div>
        </main>
        <Footer />
      </div>
    );
  }
  
  if (profileError || !profile) {
    return (
      <div className="flex flex-col min-h-screen bg-dark">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8">
          <div className="max-w-md mx-auto bg-dark-accent p-6 rounded-lg shadow-md text-center">
            <h1 className="text-xl font-minecraft text-primary mb-4">Character Record</h1>
            <p className="text-light mb-4">You need to be logged in to view your character record.</p>
            <Link href="/login">
              <Button className="w-full">Login</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }
  
  const { level } = getLevelFromXp(profile.xp || 0);
  
  return (
    <div className="flex flex-col min-h-screen bg-dark">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-2xl font-minecraft text-primary mb-6 text-center">CHARACTER RECORD</h1>
        
        {/* Character Header Card */}
        <div className="bg-dark-accent rounded-lg shadow-md p-4 mb-6">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="w-24 h-24 md:w-32 md:h-32">
              <ChickenAvatar
                chickenType={profile.chicken_type || "white"}
                jockeyType={profile.jockey_type || "steve"}
                size="lg"
                showName={false}
              />
            </div>
            
            <div className="flex-grow">
              <h2 className="text-xl font-minecraft text-primary mb-1">{profile.username}</h2>
              <p className="text-muted-foreground mb-2">
                {profile.chicken_name || "Unnamed Chicken"} • Level {level}
              </p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                <div className="bg-dark p-2 rounded text-center">
                  <p className="text-xs text-muted-foreground">XP</p>
                  <p className="text-primary font-bold">{profile.xp || 0}</p>
                </div>
                <div className="bg-dark p-2 rounded text-center">
                  <p className="text-xs text-muted-foreground">Races</p>
                  <p className="text-primary font-bold">{profile.total_races || 0}</p>
                </div>
                <div className="bg-dark p-2 rounded text-center">
                  <p className="text-xs text-muted-foreground">Wins</p>
                  <p className="text-primary font-bold">{profile.races_won || 0}</p>
                </div>
                <div className="bg-dark p-2 rounded text-center">
                  <p className="text-xs text-muted-foreground">Win Rate</p>
                  <p className="text-primary font-bold">{calculateWinRate()}%</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Tabs for different sections */}
        <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="grid grid-cols-3 w-full max-w-md mx-auto mb-6">
            <TabsTrigger value="stats">Stats</TabsTrigger>
            <TabsTrigger value="eggs">Garu Eggs</TabsTrigger>
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
          </TabsList>
          
          <TabsContent value="stats" className="bg-dark-accent rounded-lg p-4">
            <h3 className="text-lg font-minecraft text-primary mb-4">Racing Stats</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-md font-minecraft text-muted-foreground mb-3">Performance</h4>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">Average WPM</span>
                      <span className="text-primary">{profile.avg_wpm || 0}</span>
                    </div>
                    <Progress value={Math.min(profile.avg_wpm || 0, 100)} className="h-2" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">Accuracy</span>
                      <span className="text-primary">{profile.accuracy || 0}%</span>
                    </div>
                    <Progress value={profile.accuracy || 0} className="h-2" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">Win Rate</span>
                      <span className="text-primary">{calculateWinRate()}%</span>
                    </div>
                    <Progress value={calculateWinRate()} className="h-2" />
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="text-md font-minecraft text-muted-foreground mb-3">Activity</h4>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Total races</span>
                    <span className="text-primary">{profile.total_races || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Races won</span>
                    <span className="text-primary">{profile.races_won || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Codex texts contributed</span>
                    <span className="text-primary">{profile.prompts_added || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Account created</span>
                    <span className="text-primary">{formatDate(profile.created_at || new Date().toISOString())}</span>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="eggs" className="bg-dark-accent rounded-lg p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-minecraft text-primary">Garu Egg Collection</h3>
              <Button onClick={handleCollectEgg} className="bg-primary text-dark hover:bg-primary/90">
                Collect from Codex
              </Button>
            </div>
            
            {eggsLoading ? (
              <div className="flex justify-center items-center h-40">
                <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
              </div>
            ) : eggsError ? (
              <div className="text-center py-8 text-muted-foreground">
                Error loading eggs collection. Please try again.
              </div>
            ) : !eggsData?.eggs || eggsData.eggs.length === 0 ? (
              <div className="text-center py-12 bg-dark rounded-md">
                <h4 className="text-lg font-minecraft text-muted-foreground mb-4">No Eggs Found</h4>
                <p className="text-muted-foreground mb-6">Visit the Codex Crucible to collect magical Garu Eggs!</p>
                <Link href="/codex">
                  <Button className="bg-primary text-dark hover:bg-primary/90">
                    Visit Codex Crucible
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {eggsData.eggs.map((egg: GaruEgg) => (
                  <Card key={egg.id} className="bg-dark border border-dark-accent overflow-hidden">
                    <CardHeader className="pb-2">
                      <CardTitle className="flex justify-between items-start">
                        <span>{egg.name}</span>
                        <span className={`text-sm ${getRarityColorClass(egg.rarity)}`}>
                          {egg.rarity.charAt(0).toUpperCase() + egg.rarity.slice(1)}
                        </span>
                      </CardTitle>
                      <CardDescription className={getElementColor(egg.type)}>
                        {egg.type} • {egg.elemental_affinity}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pb-2">
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Level</span>
                          <span>{egg.level}</span>
                        </div>
                        <div>
                          <div className="flex justify-between text-xs">
                            <span>XP</span>
                            <span>{egg.xp}/{egg.level * 100}</span>
                          </div>
                          <Progress value={(egg.xp % 100)} className="h-1 mt-1" />
                        </div>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-2">
                          <div className="flex justify-between">
                            <span>Speed</span>
                            <span>{egg.stats.speed}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Endurance</span>
                            <span>{egg.stats.endurance}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Luck</span>
                            <span>{egg.stats.luck}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Intellect</span>
                            <span>{egg.stats.intellect}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="pt-0 text-xs text-muted-foreground">
                      <div className="w-full flex justify-between items-center">
                        <span>{formatDate(egg.created_at)}</span>
                        <span>
                          {egg.hatched ? "Hatched" : "Unhatched"} • {egg.source}
                        </span>
                      </div>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="achievements" className="bg-dark-accent rounded-lg p-4">
            <h3 className="text-lg font-minecraft text-primary mb-4">Achievements</h3>
            <div className="text-center py-10">
              <h4 className="text-md font-minecraft text-muted-foreground mb-4">Coming Soon</h4>
              <p className="text-muted-foreground mb-2">
                Achievements will be added in a future update.
              </p>
              <p className="text-muted-foreground">
                Complete races and collect Garu Eggs to unlock achievements!
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </main>
      
      <Footer />
    </div>
  );
}