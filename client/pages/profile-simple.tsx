import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { isUnlocked } from "@/lib/unlocks";

export default function ProfileSimple() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Query user profile data
  const {
    data: profile,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["/api/profile"],
    retry: false,
  });

  const [chickenName, setChickenName] = useState("");
  const [chickenType, setChickenType] = useState("white");
  const [jockeyType, setJockeyType] = useState("zombie");
  const [trailType, setTrailType] = useState("none");

  // Initialize form with user data when it loads
  useEffect(() => {
    if (profile) {
      setChickenName(profile.chicken_name || "GARU CHICK");
      setChickenType(profile.chicken_type || "white");
      setJockeyType(profile.jockey_type || "steve");
      setTrailType(profile.trail_type || "none");
    }
  }, [profile]);

  // Mutation for updating customization
  const updateCustomizationMutation = useMutation({
    mutationFn: (data: {
      chickenName: string;
      chickenType: string;
      jockeyType: string;
      trailType: string;
    }) => {
      return apiRequest("PATCH", "/api/profile/customization", data);
    },
    onSuccess: () => {
      toast({
        title: "Customization Saved",
        description: "Your chicken jockey customization has been updated.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/profile"] });
    },
    onError: (error) => {
      console.error("Error updating customization:", error);
      toast({
        title: "Error",
        description: "Failed to update customization. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Handle customization form submission
  const handleSaveCustomization = () => {
    updateCustomizationMutation.mutate({
      chickenName,
      chickenType,
      jockeyType,
      trailType,
    });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow container mx-auto p-4 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-light">Loading profile...</p>
          </div>
        </main>
      </div>
    );
  }

  if (isError || !profile) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow container mx-auto p-4 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-primary mb-4">
              Please log in to view your profile
            </h1>
            <p className="text-light mb-6">
              You need to be logged in to access your profile and stats.
            </p>
            <Button
              onClick={() => (window.location.href = "/login")}
              className="bg-primary hover:bg-primary/80 text-dark"
            >
              Go to Login
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-dark-900 to-black text-white">
      <Header />

      <main className="flex-grow container mx-auto p-4 max-w-4xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Profile Overview */}
          <div className="border border-primary/30 p-6 rounded bg-dark/50">
            <h2 className="text-2xl font-bold text-primary mb-4">
              Profile Overview
            </h2>

            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-bold text-light">
                  {profile.username}
                </h3>
                <p className="text-light/60 text-sm">
                  {profile.email || "No email"}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 border border-primary/30 rounded bg-primary/10">
                  <p className="text-2xl font-bold text-primary">
                    {profile.xp || 0}
                  </p>
                  <p className="text-xs text-light/60">Total XP</p>
                </div>
                <div className="text-center p-3 border border-primary/30 rounded bg-primary/10">
                  <p className="text-2xl font-bold text-primary">
                    Level {Math.floor((profile.xp || 0) / 100) + 1}
                  </p>
                  <p className="text-xs text-light/60">Current Level</p>
                </div>
                <div className="text-center p-3 border border-primary/30 rounded bg-dark/50">
                  <p className="text-xl font-bold text-light">
                    {profile.races_won || 0}
                  </p>
                  <p className="text-xs text-light/60">Races Won</p>
                </div>
                <div className="text-center p-3 border border-primary/30 rounded bg-dark/50">
                  <p className="text-xl font-bold text-light">
                    {profile.total_races || 0}
                  </p>
                  <p className="text-xs text-light/60">Total Races</p>
                </div>
                <div className="text-center p-3 border border-primary/30 rounded bg-dark/50">
                  <p className="text-xl font-bold text-light">
                    {profile.avg_wpm || 0}
                  </p>
                  <p className="text-xs text-light/60">Avg WPM</p>
                </div>
                <div className="text-center p-3 border border-primary/30 rounded bg-dark/50">
                  <p className="text-xl font-bold text-light">
                    {profile.accuracy || 0}%
                  </p>
                  <p className="text-xs text-light/60">Accuracy</p>
                </div>
              </div>

              {/* QLX Coins Display */}
              <div className="mt-4 p-3 bg-black/40 border border-yellow-500/50 rounded">
                <div className="flex items-center justify-center gap-2">
                  <span className="text-lg">🧮</span>
                  <span className="text-yellow-400 font-bold">
                    {profile.qlx_coins || 0} QuiLuX Coins
                  </span>
                </div>
                <div className="text-xs text-center text-gray-400 mt-1">
                  Math Racing Currency
                </div>
              </div>
            </div>
          </div>

          {/* Customization */}
          <div className="border border-primary/30 p-6 rounded bg-dark/50">
            <h2 className="text-2xl font-bold text-primary mb-4">
              Customize Your Racer
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-light mb-2">
                  Chicken Name
                </label>
                <Input
                  value={chickenName}
                  onChange={(e) => setChickenName(e.target.value)}
                  placeholder="Enter chicken name"
                  className="bg-dark border-primary/30 text-light"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-light mb-2">
                  Chicken Type
                </label>
                <select
                  value={chickenType}
                  onChange={(e) => setChickenType(e.target.value)}
                  className="w-full p-2 bg-dark border border-primary/30 rounded text-light"
                >
                  <option value="white">White Chicken</option>
                  <option value="brown">Brown Chicken</option>
                  <option value="black">Black Chicken</option>
                  <option value="red">Red Chicken</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-light mb-2">
                  Jockey Type
                </label>
                <select
                  value={jockeyType}
                  onChange={(e) => setJockeyType(e.target.value)}
                  className="w-full p-2 bg-dark border border-primary/30 rounded text-light"
                >
                  <option value="generic">Generic Jockey</option>
                  {isUnlocked("jockeys", "steve") && (
                    <option value="steve">Steve (Campaign Reward)</option>
                  )}
                  {isUnlocked("jockeys", "auto") && (
                    <option value="auto">Auto (Campaign Reward)</option>
                  )}
                  {isUnlocked("jockeys", "matikah") && (
                    <option value="matikah">Matikah (Campaign Reward)</option>
                  )}
                  {isUnlocked("jockeys", "iam") && (
                    <option value="iam">Iam (Campaign Reward)</option>
                  )}
                </select>
              </div>

              <Button
                onClick={handleSaveCustomization}
                disabled={updateCustomizationMutation.isPending}
                className="w-full bg-primary hover:bg-primary/80 text-dark"
              >
                {updateCustomizationMutation.isPending
                  ? "Saving..."
                  : "Save Customization"}
              </Button>
            </div>
          </div>

          {/* Recent Race History */}
          <div className="border border-primary/30 p-6 rounded bg-dark/50 lg:col-span-2">
            <h2 className="text-2xl font-bold text-primary mb-4">
              Recent Race History
            </h2>

            {profile.recentRaces && profile.recentRaces.length > 0 ? (
              <div className="space-y-2">
                {profile.recentRaces.map((race: any, index: number) => (
                  <div
                    key={index}
                    className="border border-primary/20 p-3 rounded bg-dark/30"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-bold text-light">
                          Position {race.position || "N/A"}/
                          {race.total_players || "N/A"}
                        </p>
                        <p className="text-sm text-light/60">
                          {race.wpm || 0} WPM • {race.accuracy || 0}% accuracy
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-primary">
                          +{race.xp_gained || 0} XP
                        </p>
                        <p className="text-xs text-light/60">
                          {race.faction || "d2"} faction
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-light/60 mb-4">No race history yet!</p>
                <p className="text-sm text-light/40">
                  Complete some races to see your stats here.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
