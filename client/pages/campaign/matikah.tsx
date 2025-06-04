import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { PixelButton } from "@/components/ui/pixel-button";
import { ChickenAvatar } from "@/components/ui/chicken-avatar";
import { CampaignRace } from "@/components/campaign-race";
import { apiRequest } from "@/lib/queryClient";
import { useQuery } from "@tanstack/react-query";
import { getCampaignProgressWithUnlocks } from "@/lib/campaigns";
import { Lock, Crown, Star, Moon, Wind, Feather } from "lucide-react";
import matikahAndChalisaImg from "@assets/Matikah and Chalisa.png";

// Matikah's campaign races with mystical themes
const matikahCampaignRaces = [
  {
    id: 1,
    title: "The Moonlight Run",
    faction: "d12",
    unlocked: true,
    prompt: "Matikah didn't ride at first. She ran barefoot, side by side with Chalisa, her Garu friend. Beneath the full moon, they raced through misty trees while the leaves sang above. It wasn't about speed — it was about breath. Matching step for step. Heart for heart. At the finish, Chalisa bent her long neck, and Matikah placed her hand over her golden beak. The world shifted. The bond began.",
    description: "The mystical bond between rider and Garu is formed under moonlight"
  },
  {
    id: 2,
    title: "The Wind Dancers' Trail",
    faction: "d8",
    unlocked: false,
    prompt: "To earn her place as a rider, Matikah had to gather the wind-feathers: rare plumage that only appeared during dawn gusts. With Chalisa's help, she climbed, leapt, and collected each one. Every feather glowed with a different story. She weaved them into a sash that shimmered with motion. This was not just her gear — it was her wind-song, stitched from trust and sky.",
    description: "Collecting mystical wind-feathers to weave her legendary sash"
  },
  {
    id: 3,
    title: "The Bazaar of Echoes",
    faction: "d4",
    unlocked: false,
    prompt: "In a hidden forest market, Matikah danced between booths, trading her woven sash for old scrolls, feathers, and a glowing flute that once belonged to a scribe. There she met Ayo, a dancer who taught her how to race with flame underfoot. They competed in a spinning fire-circle, where each turn made her laugh and leap. 'You ride with music,' Ayo said. 'That's rarer than gold.'",
    description: "Trading wind-woven treasures for ancient scribal artifacts"
  },
  {
    id: 4,
    title: "The Hollow Archive",
    faction: "d20",
    unlocked: false,
    prompt: "Matikah found a flooded temple deep in the swamp. Its walls whispered old stories of riders forgotten by time. She and Chalisa had to wade through dark waters, reading glyphs aloud to open stone doors. With each spoken name, the pool shimmered. As she reached the center, a memory called out — not hers, but her mother's. Iam's voice, hidden in the walls. 'Speak, daughter. Sing us free.'",
    description: "Discovering her mother Iam's hidden memories in the flooded temple"
  },
  {
    id: 5,
    title: "The Mossroot Maze",
    faction: "d6",
    unlocked: false,
    prompt: "To protect her people's stories, Matikah raced through the ancient mossroot trails, chased by echo-beasts of stone and code. She drew new maps with her flute and quill, each note revealing secret paths. Chalisa trusted her sound more than sight, galloping through vines and fog. By the end, they had shaped a new path through the earth — one only moon-riders could follow.",
    description: "Creating new paths through music while being chased by echo-beasts"
  },
  {
    id: 6,
    title: "The Spiral Storm",
    faction: "d10",
    unlocked: false,
    prompt: "Everything changed when the sky cracked open. A storm of glitch and light swallowed the old trails. Matikah was pulled into the Spiral — a shifting track made of broken songs and twisted gravity. Only her rhythm kept her grounded. She and Chalisa raced not forward, but inward — and emerged with a melody that no one else remembered. A spell of balance in chaos.",
    description: "Racing through a reality-bending storm of chaos and code"
  },
  {
    id: 7,
    title: "The Trial of Names",
    faction: "d100",
    unlocked: false,
    prompt: "Matikah was called to the Circle of Feathered Elders. To become a Scribe Rider, she had to ride across a bridge of names — every step a story, every breath a memory. As she typed and rode, the track changed based on her heart. She rode as herself, but carried her whole family: Steve's hammerbeat, Iam's whisper-song, and Auto's flame. At the far end, Chalisa bowed. Matikah had become a legend, and she had earned her name.",
    description: "The legendary trial where Matikah earns her place among the Scribe Riders"
  },
  {
    id: 8,
    title: "The Offering of Flight",
    faction: "d2",
    unlocked: false,
    prompt: "As tradition called, Matikah gave up her most treasured creation — the wind-feather sash — to the Codex Flame. In return, she was gifted a pearl-quill made from starlight. It allowed her to write mid-race, shaping spells in motion. With it, she recorded her own line in the Book of Riders: 'I did not tame my Garu. I followed her. And we arrived.'",
    description: "Sacrificing her greatest treasure to receive the pearl-quill of starlight"
  },
  {
    id: 9,
    title: "The Night of Seven Songs",
    faction: "d12",
    unlocked: false,
    prompt: "At the next World Ride, Matikah did not join the race. Instead, she stood at the peak with Chalisa. She sang. As she did, riders from seven nations launched from the hill, her voice guiding them across the stars. The Codex glowed. Riders wept. The flame danced in the sky like a story retold. Matikah closed her eyes. 'Let them race. I will sing the way.'",
    description: "Matikah's ascension as the guide who sings others to victory"
  }
];

export default function MatikahCampaign() {
  const [_, setLocation] = useLocation();
  const [currentRace, setCurrentRace] = useState<number | null>(null);
  const [campaignProgress, setCampaignProgress] = useState(1);

  // Get user profile to check level
  const { data: profile } = useQuery({
    queryKey: ["/api/profile"],
  });

  // ALL CAMPAIGNS UNLOCKED - No level restrictions
  const userLevel = profile?.level || 0;

  // Load campaign progress and check unlock status
  useEffect(() => {
    const loadCampaignData = async () => {
      const campaigns = await getCampaignProgressWithUnlocks();
      if (campaigns && campaigns.matikah) {
        // Check if Matikah campaign is unlocked
        if (!campaigns.matikah.unlocked) {
          // Redirect back to campaign selection if not unlocked
          setLocation('/campaign');
          return;
        }
      }
    };
    
    const savedProgress = localStorage.getItem('matikah_campaign_progress');
    if (savedProgress) {
      setCampaignProgress(parseInt(savedProgress));
    }
    
    loadCampaignData();
  }, [setLocation]);

  // Update race unlock status based on progress - ALL RACES UNLOCKED
  const racesWithUnlockStatus = matikahCampaignRaces.map((race, index) => ({
    ...race,
    unlocked: true // All races are unlockedow unlocked
  }));

  const handleRaceComplete = (stats: { wpm: number; accuracy: number; time: number; position: number; xpGained: number }) => {
    // Process completion immediately but keep victory screen visible
    if (currentRace) {
      // Mark race as completed using campaign system
      markRaceCompleted('matikah', currentRace.toString(), stats);
      
      // Update local progress
      const newProgress = Math.max(campaignProgress, currentRace + 1);
      setCampaignProgress(newProgress);
      localStorage.setItem('matikah_campaign_progress', newProgress.toString());
      
      // Update XP with the calculated amount from the race
      const progress = getUserProgress();
      saveUserProgress(progress.level, progress.xp + stats.xpGained);
      
      // Award XP to database
      apiRequest('POST', '/api/stats/update-race', {
        wpm: stats.wpm,
        accuracy: stats.accuracy,
        position: stats.position,
        totalPlayers: 8,
        faction: matikahCampaignRaces[currentRace - 1].faction,
        xpGained: stats.xpGained
      });
      
      // Check if campaign completed
      if (newProgress >= 9) {
        unlockCampaignRewards('matikah');
      }
    }
    // Victory screen stays visible until player manually continues
    setCurrentRace(null);
  };

  const handleBackToMenu = () => {
    setCurrentRace(null);
  };

  const handleStartRace = (raceId: number) => {
    setCurrentRace(raceId);
  };

  const handleBackToCampaigns = () => {
    setLocation("/campaign");
  };

  // If currently in a race, show the race component
  if (currentRace) {
    const race = matikahCampaignRaces[currentRace - 1];
    return (
      <CampaignRace
        campaignPrompt={race.prompt}
        campaignTitle={race.title}
        campaignCharacter="matikah"
        raceId={currentRace}
        onRaceComplete={handleRaceComplete}
        onBackToMenu={handleBackToMenu}
      />
    );
  }

  // Show campaign overview
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-purple-900 via-blue-900 to-black text-white">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 pt-8 pb-16">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-6">
              <Moon className="w-16 h-16 text-purple-400 mr-4" />
              <h1 className="text-4xl font-minecraft text-purple-400">MATIKAH</h1>
              <Moon className="w-16 h-16 text-purple-400 ml-4" />
            </div>
            <p className="text-xl text-purple-300 mb-2">The Moon-Born Singer</p>
            <p className="text-gray-300 max-w-2xl mx-auto">
              Follow Matikah's mystical journey from barefoot runner to legendary Scribe Rider, 
              guided by her bond with Chalisa and the power of song.
            </p>
          </div>

          {/* Character Display with Authentic Artwork */}
          <div className="flex justify-center mb-8">
            <div className="relative bg-gradient-to-r from-purple-800/30 to-blue-800/30 rounded-lg p-6 border border-purple-500/30">
              <img 
                src={matikahAndChalisaImg} 
                alt="Matikah and Chalisa - The mystical bond between rider and Garu under moonlight"
                className="w-64 h-64 object-cover rounded-lg shadow-lg border-2 border-purple-400/50"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-purple-900/40 to-transparent rounded-lg"></div>
              <div className="absolute bottom-2 left-2 right-2 text-center">
                <p className="text-purple-200 text-sm font-semibold">Matikah & Chalisa</p>
                <p className="text-purple-300 text-xs">Heart for Heart, Under Moonlight</p>
              </div>
            </div>
          </div>

          {/* Legacy Character Avatar */}
          <div className="flex justify-center mb-8">
            <div className="relative">
              <ChickenAvatar 
                chickenType="html_matikah" 
                jockeyType="matikah" 
                size="lg"
                className="border-4 border-purple-400 rounded-lg bg-purple-900/30 p-4"
              />
              <div className="absolute -top-2 -right-2">
                <Star className="w-8 h-8 text-yellow-400 fill-yellow-400" />
              </div>
            </div>
          </div>

          {/* Progress Indicator */}
          <div className="bg-gray-800 border-2 border-purple-400 rounded-lg p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-minecraft text-purple-400">Campaign Progress</h3>
              <span className="text-purple-300">{campaignProgress - 1}/{matikahCampaignRaces.length} Complete</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-purple-500 to-blue-500 h-3 rounded-full transition-all duration-500"
                style={{ width: `${((campaignProgress - 1) / matikahCampaignRaces.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Race Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {racesWithUnlockStatus.map((race, index) => (
              <div 
                key={race.id}
                className={`border-2 rounded-lg p-6 transition-all duration-300 ${
                  race.unlocked 
                    ? 'border-purple-400 bg-purple-900/20 hover:bg-purple-800/30' 
                    : 'border-gray-600 bg-gray-800/50'
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className={`text-lg font-minecraft ${race.unlocked ? 'text-purple-300' : 'text-gray-500'}`}>
                    Race {race.id}
                  </h3>
                  {race.unlocked ? (
                    index < campaignProgress - 1 ? (
                      <Crown className="w-6 h-6 text-yellow-400 fill-yellow-400" />
                    ) : (
                      <Wind className="w-6 h-6 text-purple-400" />
                    )
                  ) : (
                    <Lock className="w-6 h-6 text-gray-500" />
                  )}
                </div>
                
                <h4 className={`text-xl mb-3 ${race.unlocked ? 'text-white' : 'text-gray-400'}`}>
                  {race.title}
                </h4>
                
                <p className={`text-sm mb-4 ${race.unlocked ? 'text-gray-300' : 'text-gray-500'}`}>
                  {race.description}
                </p>
                
                <div className="flex items-center justify-between">
                  <span className={`text-xs px-2 py-1 rounded ${
                    race.unlocked ? 'bg-purple-600 text-white' : 'bg-gray-600 text-gray-400'
                  }`}>
                    {race.faction.toUpperCase()} Faction
                  </span>
                  
                  <PixelButton
                    onClick={() => handleStartRace(race.id)}
                    disabled={!race.unlocked}
                    className={race.unlocked 
                      ? "bg-purple-600 hover:bg-purple-700 text-white" 
                      : "bg-gray-600 text-gray-400 cursor-not-allowed"
                    }
                  >
                    {index < campaignProgress - 1 ? "Replay" : race.unlocked ? "Start" : "Locked"}
                  </PixelButton>
                </div>
              </div>
            ))}
          </div>

          {/* Navigation */}
          <div className="text-center">
            <PixelButton 
              onClick={handleBackToCampaigns}
              className="bg-gray-600 hover:bg-gray-700"
            >
              Back to Campaigns
            </PixelButton>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}