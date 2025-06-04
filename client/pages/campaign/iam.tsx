import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { PixelButton } from "@/components/ui/pixel-button";
import { ChickenAvatar } from "@/components/ui/chicken-avatar";
import { CampaignRace } from "@/components/campaign-race";
import { apiRequest } from "@/lib/queryClient";
import { useQuery } from "@tanstack/react-query";
import { Lock, Crown, Star, Scroll, Feather, Wind } from "lucide-react";

// Iam's campaign races - The Song Between
const iamCampaignRaces = [
  {
    id: 1,
    title: "The Scrollrunner's Festival",
    faction: "d12",
    unlocked: true,
    prompt: "As a child of the trade routes, Iam learned to read stories from sand, wind, and whispers. At the Scrollrunner's Festival, young scribes raced across open fields carrying glowing scrolls, each step unlocking a new verse. Iam's scroll sang only when she laughed. She didn't win, but her story danced through the crowd. That night, her father told her, 'You ride the world with your words.'",
    description: "A young scribe learns to race with words and laughter"
  },
  {
    id: 2,
    title: "The Featherwind Trail",
    faction: "d8",
    unlocked: false,
    prompt: "Iam wandered the wild trails alone, learning the names of birds and the shape of silent things. She raced with wind-garlanded traders and learned to speak the 'feather tongue' — a code of colors and motions. Her mount then was no Garu, but her own two feet and the whispers of the sky. Each journey added a symbol to her cloak, stitched with windthread and patience.",
    description: "Learning the ancient feather tongue while racing on foot"
  },
  {
    id: 3,
    title: "The Ember Market (Revisited)",
    faction: "d4",
    unlocked: false,
    prompt: "At the famous Ember Market, Iam traded a poem for a golden quill. She used it to carve fire-letters on leaves and lanterns. That day, she met a soft-eyed rider named Steve, who shared his song in return. They walked between market stalls long after the sun had set. 'You write like you're flying,' he said. 'You ride like you're listening,' she replied. A bond was sparked, not claimed.",
    description: "The fateful meeting with Steve where love first sparked"
  },
  {
    id: 4,
    title: "The Grove of Cradlelight",
    faction: "d20",
    unlocked: false,
    prompt: "After the escape, Iam and Steve hid in the ridgewood. Their home was built from roots and moonlight. Iam planted memory-ribbons in the trees, each one holding a whisper of their love. She raced quietly through the glades, marking safe paths with lullaby glyphs. When she dreamed of catching a fish, her father's words echoed: 'That means a child is coming.' Matikah stirred in her belly. The forest hummed.",
    description: "Building a hidden home and expecting their first child"
  },
  {
    id: 5,
    title: "The Path of Threads",
    faction: "d6",
    unlocked: false,
    prompt: "While Steve mapped trails with stone and speed, Iam charted meaning with color and cloth. She raced between safehouses and villages, delivering stitched scrolls no code-breaker could read. Her quill wrote paths only the heart could follow. She learned the turns of the land by how they echoed her children's names — Auto in thunder, Matikah in mist.",
    description: "Creating secret maps with threads and unbreakable codes"
  },
  {
    id: 6,
    title: "The Day of Ashwinds",
    faction: "d10",
    unlocked: false,
    prompt: "The drone came fast. Steve rode to draw it away. Iam stayed to shield the children. She raced through the camp, gathering tools, hiding scrolls, singing safety into stones. When the fire cracked the sky, she drew a line of protection around their home. 'Not today,' she whispered. Her race wasn't for escape. It was to hold the center.",
    description: "The day of sacrifice when Steve drew danger away"
  },
  {
    id: 7,
    title: "The Inkstone Trial",
    faction: "d100",
    unlocked: false,
    prompt: "Years passed. Iam stood before the Council of Scribes, holding a book with no words. To earn her seal, she had to ride the Inkstone Track and let the world write through her. Each curve brought memories: Steve's laugh, Auto's rage, Matikah's song. Her quill floated. Her mount was made of light and silence. When she crossed the final line, her book was full.",
    description: "The legendary trial where Iam earns her Scribe seal"
  },
  {
    id: 8,
    title: "The Ledger of Reunions",
    faction: "d2",
    unlocked: false,
    prompt: "Iam returned to her old home, now a meeting place for Riders. She gave each visitor a story of who they were — not from blood, but from rhythm. She was no longer just a mother or a rider. She was a keeper of kin. In the flamebasket near the door, she found a feather. Brutus's feather. Left by someone unseen.",
    description: "Becoming the keeper of stories and finding signs of hope"
  },
  {
    id: 9,
    title: "The Seven-Voice Flight",
    faction: "d12",
    unlocked: false,
    prompt: "On the day of the Great Ride, Iam didn't race. She stood on a high hill and sang. Her voice wove seven old songs into one — one for each Rider who'd ever held the quill with love. Her voice called across the fields, guiding lost Garu home. And as the stars turned, Matikah and Auto raced below. 'Let them ride,' she whispered. 'I will be the wind that carries them.'",
    description: "Iam's ascension as the guiding voice for all riders"
  }
];

export default function IamCampaign() {
  const [_, setLocation] = useLocation();
  const [currentRace, setCurrentRace] = useState<number | null>(null);
  const [campaignProgress, setCampaignProgress] = useState(1);

  // Get user profile to check level
  const { data: profile } = useQuery({
    queryKey: ["/api/profile"],
  });

  // ALL CAMPAIGNS UNLOCKED - No level restrictions
  const userLevel = profile?.level || 0;

  // Load campaign progress from localStorage
  useEffect(() => {
    const savedProgress = localStorage.getItem('iam_campaign_progress');
    if (savedProgress) {
      setCampaignProgress(parseInt(savedProgress));
    }
  }, []);

  // Update race unlock status based on progress - ALL RACES UNLOCKED
  const racesWithUnlockStatus = iamCampaignRaces.map((race, index) => ({
    ...race,
    unlocked: true // All races are unlockedd
  }));

  const handleRaceComplete = (stats: { wpm: number; accuracy: number; time: number; position: number; xpGained: number }) => {
    // Player completed the race successfully (top 3)
    if (stats.position <= 3) {
      const newProgress = Math.max(campaignProgress, currentRace! + 1);
      setCampaignProgress(newProgress);
      localStorage.setItem('iam_campaign_progress', newProgress.toString());
      
      // Award XP
      apiRequest('POST', '/api/stats/update-race', {
        wpm: stats.wpm,
        accuracy: stats.accuracy,
        position: stats.position,
        totalPlayers: 8,
        faction: iamCampaignRaces[currentRace! - 1].faction,
        xpGained: stats.xpGained
      });
    }
    
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
    const race = iamCampaignRaces[currentRace - 1];
    return (
      <CampaignRace
        campaignPrompt={race.prompt}
        campaignTitle={race.title}
        campaignCharacter="iam"
        raceId={currentRace}
        onRaceComplete={handleRaceComplete}
        onBackToMenu={handleBackToMenu}
      />
    );
  }

  // Show campaign overview
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-indigo-900 via-purple-900 to-black text-white">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 pt-8 pb-16">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-6">
              <Scroll className="w-16 h-16 text-indigo-400 mr-4" />
              <h1 className="text-4xl font-minecraft text-indigo-400">IAM</h1>
              <Scroll className="w-16 h-16 text-indigo-400 ml-4" />
            </div>
            <p className="text-xl text-indigo-300 mb-2">The Song Between</p>
            <p className="text-gray-300 max-w-2xl mx-auto">
              Experience Iam's profound journey from scrollrunner to the keeper of stories, 
              whose voice guides all riders home across the stars.
            </p>
          </div>

          {/* Character Display */}
          <div className="flex justify-center mb-8">
            <div className="relative">
              <ChickenAvatar 
                chickenType="html_iam" 
                jockeyType="iam" 
                size="lg"
                className="border-4 border-indigo-400 rounded-lg bg-indigo-900/30 p-4"
              />
              <div className="absolute -top-2 -right-2">
                <Star className="w-8 h-8 text-yellow-400 fill-yellow-400" />
              </div>
            </div>
          </div>

          {/* Progress Indicator */}
          <div className="bg-gray-800 border-2 border-indigo-400 rounded-lg p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-minecraft text-indigo-400">Campaign Progress</h3>
              <span className="text-indigo-300">{campaignProgress - 1}/{iamCampaignRaces.length} Complete</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-indigo-500 to-purple-500 h-3 rounded-full transition-all duration-500"
                style={{ width: `${((campaignProgress - 1) / iamCampaignRaces.length) * 100}%` }}
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
                    ? 'border-indigo-400 bg-indigo-900/20 hover:bg-indigo-800/30' 
                    : 'border-gray-600 bg-gray-800/50'
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className={`text-lg font-minecraft ${race.unlocked ? 'text-indigo-300' : 'text-gray-500'}`}>
                    Race {race.id}
                  </h3>
                  {race.unlocked ? (
                    index < campaignProgress - 1 ? (
                      <Crown className="w-6 h-6 text-yellow-400 fill-yellow-400" />
                    ) : (
                      <Feather className="w-6 h-6 text-indigo-400" />
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
                    race.unlocked ? 'bg-indigo-600 text-white' : 'bg-gray-600 text-gray-400'
                  }`}>
                    {race.faction.toUpperCase()} Faction
                  </span>
                  
                  <PixelButton
                    onClick={() => handleStartRace(race.id)}
                    disabled={!race.unlocked}
                    className={race.unlocked 
                      ? "bg-indigo-600 hover:bg-indigo-700 text-white" 
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