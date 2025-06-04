import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { simpleAudio } from "@/lib/simple-audio";
import { Volume2, VolumeX, Music } from "lucide-react";

export default function SettingsPage() {
  const { toast } = useToast();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [soundEnabled, setSoundEnabled] = useState(() => simpleAudio.isEnabled());

  // Fetch user profile
  const { data: profile, isLoading } = useQuery({
    queryKey: ["/api/profile"]
  });

  // Update form when profile loads
  useEffect(() => {
    if (profile) {
      setUsername((profile as any).username || "");
      setEmail((profile as any).email || "");
    }
  }, [profile]);

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (updates: { username?: string; email?: string }) => {
      return apiRequest("PATCH", "/api/profile", updates);
    },
    onSuccess: () => {
      toast({
        title: "Settings Updated",
        description: "Your profile has been updated successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/profile"] });
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    const updates: any = {};
    if (username !== (profile as any)?.username) updates.username = username;
    if (email !== (profile as any)?.email) updates.email = email;
    
    if (Object.keys(updates).length > 0) {
      updateProfileMutation.mutate(updates);
    } else {
      toast({
        title: "No Changes",
        description: "No changes were made to save.",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow container mx-auto p-4 flex items-center justify-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-dark text-white">
      <Header />
      
      <main className="flex-grow container mx-auto p-4">
        <Card className="bg-dark/90 border-2 border-primary max-w-2xl mx-auto">
          <CardHeader className="border-b border-primary/50">
            <CardTitle className="text-primary font-minecraft text-center text-2xl">
              ⚙️ ACCOUNT SETTINGS
            </CardTitle>
          </CardHeader>
          
          <CardContent className="p-6 space-y-6">
            {/* Account Settings */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="username" className="text-primary font-minecraft">USERNAME</Label>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="mt-2 bg-dark border-primary/30 text-light"
                  placeholder="Enter your username"
                />
              </div>
              
              <div>
                <Label htmlFor="email" className="text-primary font-minecraft">
                  EMAIL {!email && "(OPTIONAL)"}
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-2 bg-dark border-primary/30 text-light"
                  placeholder={email ? "Change your email address" : "Add an email address (optional)"}
                />
                <p className="text-xs text-accent mt-1">
                  {email ? 
                    "Email currently set. You can change it or leave it as is." : 
                    "No email on file. Add one to receive notifications and account recovery options."
                  }
                </p>
              </div>
            </div>

            {/* Audio Settings */}
            <div className="border-t border-primary/30 pt-6">
              <div className="flex items-center gap-2 mb-4">
                <Music className="w-5 h-5 text-primary" />
                <Label className="text-primary font-minecraft">AUDIO SETTINGS</Label>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {soundEnabled ? <Volume2 className="w-4 h-4 text-primary" /> : <VolumeX className="w-4 h-4 text-accent" />}
                    <Label htmlFor="sound-toggle" className="text-light">
                      Sound & Music
                    </Label>
                  </div>
                  <Switch
                    id="sound-toggle"
                    checked={soundEnabled}
                    onCheckedChange={(checked) => {
                      setSoundEnabled(checked);
                      simpleAudio.setEnabled(checked);
                      if (checked) {
                        toast({
                          title: "Audio Enabled",
                          description: "Sound effects and music are now enabled!",
                        });
                      } else {
                        simpleAudio.stopAllAudio();
                        toast({
                          title: "Audio Disabled", 
                          description: "Sound effects and music are now disabled.",
                        });
                      }
                    }}
                  />
                </div>
                
                {soundEnabled && (
                  <div className="ml-6 space-y-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        simpleAudio.playRaceResult(true, 1);
                        toast({
                          title: "Audio Test",
                          description: "Playing victory celebration sound!",
                        });
                      }}
                      className="border-primary/30 text-primary hover:bg-primary/10"
                    >
                      🎵 Test Audio System
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        simpleAudio.playRaceResult(true, 1);
                        toast({
                          title: "Victory Sound Test",
                          description: "Playing your custom victory sound!",
                        });
                      }}
                      className="border-primary/30 text-primary hover:bg-primary/10"
                    >
                      🏆 Test Victory Sound
                    </Button>
                  </div>
                )}
                
                <p className="text-xs text-accent">
                  {soundEnabled ? 
                    "Audio is enabled. You'll hear music in campaigns and victory sounds when you finish races!" :
                    "Audio is disabled. Enable to hear campaign music and victory celebrations."
                  }
                </p>
              </div>
            </div>
            
            <div className="flex gap-4 pt-4">
              <Button
                onClick={handleSave}
                disabled={updateProfileMutation.isPending}
                className="bg-primary text-dark hover:bg-primary/80 flex-1"
              >
                {updateProfileMutation.isPending ? "SAVING..." : "SAVE CHANGES"}
              </Button>
            </div>
            
            <div className="text-center text-accent text-sm mt-4">
              Changes to your username and email will be saved to your account.
            </div>
          </CardContent>
        </Card>
      </main>
      
      <Footer />
    </div>
  );
}