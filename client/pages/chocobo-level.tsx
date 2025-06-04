import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { PixelCard } from "@/components/ui/pixel-card";
import { PixelButton } from "@/components/ui/pixel-button";
import { Progress } from "@/components/ui/progress";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { ChevronLeft, Sword, Feather } from "lucide-react";
import { CampaignRace } from "@/components/campaign-race";
import { simpleAudio } from "@/lib/simple-audio";

// Zack Fair as Black Chocobo (Player Character)
const ZackChocobo = ({ position = "racing" }: { position?: "racing" | "victory" | "defeat" }) => (
  <div className="relative w-16 h-12">
    {/* Black chocobo body with SOLDIER details */}
    <div className="absolute bottom-0 left-2 w-12 h-8 bg-gradient-to-br from-gray-800 to-black rounded-full border-2 border-gray-600">
      {/* Dark wings */}
      <div className="absolute -top-1 -left-1 w-3 h-4 bg-gradient-to-t from-gray-700 to-gray-500 rounded-t-full"></div>
      <div className="absolute -top-1 -right-1 w-3 h-4 bg-gradient-to-t from-gray-700 to-gray-500 rounded-t-full"></div>
      {/* SOLDIER emblem on chest */}
      <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-yellow-400 rounded-full"></div>
    </div>
    {/* Black chocobo head */}
    <div className="absolute top-0 left-4 w-6 h-6 bg-gradient-to-br from-gray-700 to-black rounded-full border border-gray-500">
      {/* Mako-enhanced purple eyes */}
      <div className="absolute top-2 left-1 w-1 h-1 bg-purple-400 rounded-full animate-pulse"></div>
      <div className="absolute top-2 right-1 w-1 h-1 bg-purple-400 rounded-full animate-pulse"></div>
      {/* Small beak */}
      <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-orange-400"></div>
    </div>
    {/* Strong legs */}
    <div className="absolute bottom-0 left-3 w-1 h-3 bg-gray-700"></div>
    <div className="absolute bottom-0 left-5 w-1 h-3 bg-gray-700"></div>
    <div className="absolute bottom-0 left-7 w-1 h-3 bg-gray-700"></div>
    <div className="absolute bottom-0 left-9 w-1 h-3 bg-gray-700"></div>
  </div>
);

// Genesis as Crimson Chocobo
const GenesisChocobo = ({ position = "racing" }: { position?: "racing" | "victory" | "defeat" }) => (
  <div className="relative w-16 h-12">
    {/* Crimson chocobo body */}
    <div className="absolute bottom-0 left-2 w-12 h-8 bg-gradient-to-br from-red-500 to-red-800 rounded-full border-2 border-red-700">
      {/* Elegant wings */}
      <div className="absolute -top-1 -left-1 w-3 h-4 bg-gradient-to-t from-red-600 to-red-300 rounded-t-full"></div>
      <div className="absolute -top-1 -right-1 w-3 h-4 bg-gradient-to-t from-red-600 to-red-300 rounded-t-full"></div>
    </div>
    {/* Crimson head */}
    <div className="absolute top-0 left-4 w-6 h-6 bg-gradient-to-br from-red-400 to-red-700 rounded-full border border-red-600">
      {/* Sapphire blue mako eyes */}
      <div className="absolute top-2 left-1 w-1 h-1 bg-blue-400 rounded-full animate-pulse"></div>
      <div className="absolute top-2 right-1 w-1 h-1 bg-blue-400 rounded-full animate-pulse"></div>
    </div>
    {/* Graceful legs */}
    <div className="absolute bottom-0 left-3 w-1 h-3 bg-red-700"></div>
    <div className="absolute bottom-0 left-5 w-1 h-3 bg-red-700"></div>
    <div className="absolute bottom-0 left-7 w-1 h-3 bg-red-700"></div>
    <div className="absolute bottom-0 left-9 w-1 h-3 bg-red-700"></div>
  </div>
);

// Angeal as Silver Chocobo
const AngeaChocobo = ({ position = "racing" }: { position?: "racing" | "victory" | "defeat" }) => (
  <div className="relative w-16 h-12">
    {/* Silver chocobo body */}
    <div className="absolute bottom-0 left-2 w-12 h-8 bg-gradient-to-br from-gray-300 to-gray-500 rounded-full border-2 border-gray-400">
      {/* Honor wings */}
      <div className="absolute -top-1 -left-1 w-3 h-4 bg-gradient-to-t from-gray-400 to-gray-100 rounded-t-full"></div>
      <div className="absolute -top-1 -right-1 w-3 h-4 bg-gradient-to-t from-gray-400 to-gray-100 rounded-t-full"></div>
    </div>
    {/* Silver head */}
    <div className="absolute top-0 left-4 w-6 h-6 bg-gradient-to-br from-gray-200 to-gray-400 rounded-full border border-gray-300">
      {/* Steel blue mako eyes */}
      <div className="absolute top-2 left-1 w-1 h-1 bg-blue-500 rounded-full animate-pulse"></div>
      <div className="absolute top-2 right-1 w-1 h-1 bg-blue-500 rounded-full animate-pulse"></div>
    </div>
    {/* Disciplined legs */}
    <div className="absolute bottom-0 left-3 w-1 h-3 bg-gray-500"></div>
    <div className="absolute bottom-0 left-5 w-1 h-3 bg-gray-500"></div>
    <div className="absolute bottom-0 left-7 w-1 h-3 bg-gray-500"></div>
    <div className="absolute bottom-0 left-9 w-1 h-3 bg-gray-500"></div>
  </div>
);

// Sephiroth as Platinum Chocobo
const SephirothChocobo = ({ position = "racing" }: { position?: "racing" | "victory" | "defeat" }) => (
  <div className="relative w-16 h-12">
    {/* Platinum chocobo body */}
    <div className="absolute bottom-0 left-2 w-12 h-8 bg-gradient-to-br from-gray-100 to-gray-300 rounded-full border-2 border-gray-200">
      {/* Majestic wings */}
      <div className="absolute -top-1 -left-1 w-3 h-4 bg-gradient-to-t from-gray-200 to-white rounded-t-full"></div>
      <div className="absolute -top-1 -right-1 w-3 h-4 bg-gradient-to-t from-gray-200 to-white rounded-t-full"></div>
      {/* Long silver mane flowing */}
      <div className="absolute -top-2 left-2 w-8 h-2 bg-gradient-to-r from-white to-gray-200 rounded-full"></div>
    </div>
    {/* Platinum head */}
    <div className="absolute top-0 left-4 w-6 h-6 bg-gradient-to-br from-white to-gray-200 rounded-full border border-gray-100">
      {/* Cat-like green mako eyes */}
      <div className="absolute top-2 left-1 w-1 h-1 bg-green-400 rounded-full animate-pulse"></div>
      <div className="absolute top-2 right-1 w-1 h-1 bg-green-400 rounded-full animate-pulse"></div>
    </div>
    {/* Elegant legs */}
    <div className="absolute bottom-0 left-3 w-1 h-3 bg-gray-300"></div>
    <div className="absolute bottom-0 left-5 w-1 h-3 bg-gray-300"></div>
    <div className="absolute bottom-0 left-7 w-1 h-3 bg-gray-300"></div>
    <div className="absolute bottom-0 left-9 w-1 h-3 bg-gray-300"></div>
  </div>
);

// Music tracks for each chapter - authentic FF music from your collection
const CHOCOBO_CHAPTER_MUSIC = [
  "/music/chocobo-theme.mp3",                // Chapter 1 - Perfect for awakening as chocobos
  "/music/06. Pleasant Journey.mp3",          // Chapter 2 - Genesis struggling
  "/music/07. Golem's Theme.mp3",            // Chapter 3 - Angeal's honor
  "/music/08. Goblin's Theme.mp3",           // Chapter 4 - Sephiroth's transformation
  "/music/09. Bizarre Mystery.mp3",          // Chapter 5 - Sensing the marshes
  "/music/10. Black Mage's Theme.mp3",       // Chapter 6 - Journey to Bill's Farm
  "/music/11. White Mage's Theme.mp3",       // Chapter 7 - Cloud's emergency
  "/music/12. Crystal Legend.mp3",           // Chapter 8 - Mako eyes revelation
  "/music/15. Phantom Beast Lord.mp3",       // Chapter 9 - Purple glow mystery
  "/music/26 Happily Ever Chocobo.mp3"      // Chapter 10 - Desperate rescue
];

// Victory and defeat music
const VICTORY_FANFARE = "/music/final-fantasy-vii-victory-fanfare-1.mp3";
const DEFEAT_JINGLE = "/music/30 Loser's Requiem.mp3";

// Chapter data based on the fan fiction
const CHOCOBO_SOLDIER_CHAPTERS = [
  {
    id: 1,
    title: "Awakening in Feathers",
    description: "Zack Fair awakens as a black chocobo alongside three other SOLDIER companions who have also been transformed.",
    text: "The breeze felt great, soft and airy but filled with the scent of fresh grass and rain. It felt good to feel it again after feeling nothing for such a long time. No offense to his girl, but if the breeze left when he opened his eyes then he didn't want to see her again. He shifted without opening his eyes and he felt wrong like things weren't in their proper place.",
    character: "Zack Fair",
    location: "Chocobo Plains",
    raceType: "chocobo_only", // No jockeys - the SOLDIERs ARE the chocobos
    playerChocobo: "ZackChocobo",
    npcChocobos: ["GenesisChocobo", "AngeaChocobo", "SephirothChocobo"],
    musicTrack: CHOCOBO_CHAPTER_MUSIC[0]
  },
  {
    id: 2,
    title: "The Crimson Genesis",
    description: "Genesis Rhapsodos struggles with his new crimson chocobo form, elegant but confused by the transformation.",
    text: "Looking around showed him two other chocobos, a silver and a black, both watching the struggling red chocobo, the black one slowly trying to approach by falling forward, only to catch itself with its wings, almost as if it didn't know how to walk properly. He watched silently, wondering if this was a dream or reality, as the black one finally reached the red one and started cooing gently, his voice deep but friendly and still also very, very painfully familiar.",
    character: "Genesis Rhapsodos", 
    location: "Chocobo Plains",
    musicTrack: CHOCOBO_CHAPTER_MUSIC[1]
  },
  {
    id: 3,
    title: "Silver Wings of Honor",
    description: "Angeal Hewley, now a silver chocobo, maintains his disciplined nature even in this strange new form.",
    text: "Then the silver one moved, shifting its head to look at him, glowing green cat-like eyes watching him closely, as it stood gracefully and took two steps forward, towards the red chocobo as well, only to fall flat, its wings flying out too late to catch him. When his head lifted from the ground, his feathers covered in grass and dirt, his eyes were wide with shock and confusion, and maybe a bit of fear that it had fallen flat on its face when the other two had just fallen back down onto their chests.",
    character: "Angeal Hewley",
    location: "Chocobo Plains",
    musicTrack: CHOCOBO_CHAPTER_MUSIC[2]
  },
  {
    id: 4,
    title: "The General's Transformation",
    description: "Sephiroth awakens as a magnificent silver chocobo, his legendary grace intact despite the shocking change.",
    text: "Sephiroth, Calamity's son, adored and loved General of SOLDIER, and fellow First Class SOLDIER, was standing back up, his green cat-like eyes flickering between Genesis, Angeal, and Zack, almost as if nervously watching for any sign that he would have to interfere and stop a fight.",
    character: "Sephiroth",
    location: "Chocobo Plains",
    musicTrack: CHOCOBO_CHAPTER_MUSIC[3]
  },
  {
    id: 5,
    title: "Instincts and Marshlands",
    description: "The transformed SOLDIERs discover their chocobo instincts, sensing danger from the nearby marshes.",
    text: "He paused and stared off at the mountains in the distance, something, most likely instinct or repressed memories, screaming at him that going in that direction would be a bad idea, something about giant snake monsters. 'That's the marshes,' came a quiet and awed voice from beside him.",
    character: "Zack Fair",
    location: "Edge of the Marshes",
    musicTrack: CHOCOBO_CHAPTER_MUSIC[4]
  },
  {
    id: 6,
    title: "Journey to Bill's Farm",
    description: "Zack leads his confused SOLDIER companions toward Bill's Chocobo Farm, knowing Cloud will find them there.",
    text: "Come on guys, Zack said, moving in front of the others, only to realize he was smaller than them, but that had never stopped him before, nor did it ever stop Cloud from taking down something ten times his size. We are heading towards Bill's Chocobo Farm. He should realize we have Mako in our systems and will call the only man on the planet that can care for Mako Chocobos.",
    character: "Zack Fair",
    location: "Path to Bill's Farm",
    musicTrack: CHOCOBO_CHAPTER_MUSIC[5]
  },
  {
    id: 7,
    title: "Cloud's Emergency",
    description: "Cloud receives Bill's urgent call about mysterious mako-enhanced chocobos appearing at the farm.",
    text: "Cloud! Came the relieved and slightly more awake voice. It's Bill. I have a chocobo here that I think belongs to you. I mean I think it does, its eyes are glowing and unless it's a wild bird, you're the only one who can actually raise and tame the damn things.",
    character: "Cloud Strife",
    location: "Mt. Nibel",
    musicTrack: CHOCOBO_CHAPTER_MUSIC[6]
  },
  {
    id: 8,
    title: "Mako Eyes and Recognition",
    description: "Bill describes the unusual black chocobo with distinctive mako-enhanced eyes that seem far too intelligent.",
    text: "Smaller black, eyes have the mako glow, Bill started listing, and Cloud started running through his flock mentally, so far the description matched three of his blacks, though all of them were too well behaved to run half the continent to get to Bill's place. But his eyes are strange, way too intelligent for his own good. The color is also extremely unusual.",
    character: "Bill",
    location: "Bill's Chocobo Farm",
    musicTrack: CHOCOBO_CHAPTER_MUSIC[7]
  },
  {
    id: 9,
    title: "The Purple Glow",
    description: "The mystery deepens as Bill reveals the chocobo's eyes show an impossible purple glow in certain light.",
    text: "Blue, but when they hit the light right, Bill paused and cocked his head, then chuckled. Smart one alright. When the light hits his eyes just right they are the most vibrant purple I've ever seen.",
    character: "Bill",
    location: "Bill's Chocobo Farm",
    musicTrack: CHOCOBO_CHAPTER_MUSIC[8]
  },
  {
    id: 10,
    title: "Desperate Rescue",
    description: "Something goes wrong at the farm, and Cloud must race against time to reach his transformed friends.",
    text: "A very sudden and very loud distressed sound rang from the phone and Cloud heard Bill yelp and then loud crashes were heard. Bill? Cloud called out, his phone back to his ear quickly. Bill, what happened? Are you alright? Fuck! Was all Cloud got before something smashed again and the line went dead.",
    character: "Cloud Strife",
    location: "En Route to Bill's Farm",
    musicTrack: CHOCOBO_CHAPTER_MUSIC[9]
  }
];

export default function ChocoboLevel() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedChapter, setSelectedChapter] = useState<number | null>(null);
  const [showRace, setShowRace] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(() => {
    return localStorage.getItem('soundEnabled') !== 'false';
  });

  // Load user progress
  const { data: profile } = useQuery({
    queryKey: ["/api/profile"],
  });

  // Get chocobo campaign progress
  const chocoboProgress = profile?.campaign_progress ? 
    JSON.parse(profile.campaign_progress).chocobo_soldiers || {} : {};

  const startRace = (chapterId: number) => {
    setSelectedChapter(chapterId);
    setShowRace(true);
  };

  const onRaceComplete = (stats: { wpm: number; accuracy: number; time: number; position: number; xpGained: number }) => {
    const chapter = CHOCOBO_SOLDIER_CHAPTERS.find(c => c.id === selectedChapter);
    if (chapter && stats.wpm > 0) {
      // Save progress
      const updatedProgress = {
        ...chocoboProgress,
        [chapter.id]: {
          completed: true,
          wpm: stats.wpm,
          accuracy: stats.accuracy,
          completedAt: new Date().toISOString()
        }
      };

      // Update campaign progress
      updateProgress.mutate({
        campaign: "chocobo_soldiers",
        progress: updatedProgress
      });

      toast({
        title: "Chapter Complete!",
        description: `${chapter.title} completed with ${stats.wpm} WPM!`,
      });
    }
    setShowRace(false);
    setSelectedChapter(null);
  };

  const onBackToMenu = () => {
    setShowRace(false);
    setSelectedChapter(null);
  };

  const updateProgress = useMutation({
    mutationFn: async (data: { campaign: string; progress: any }) => {
      return await apiRequest("POST", "/api/campaign/progress", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/profile"] });
    },
  });

  if (showRace && selectedChapter) {
    const chapter = CHOCOBO_SOLDIER_CHAPTERS.find(c => c.id === selectedChapter);
    if (chapter) {
      return (
        <CampaignRace
          campaignPrompt={chapter.text}
          campaignTitle={chapter.title}
          campaignCharacter="zack_chocobo"
          onRaceComplete={onRaceComplete}
          onBackToMenu={onBackToMenu}
          musicTrack={chapter.musicTrack}
        />
      );
    }
  }

  const completedChapters = Object.keys(chocoboProgress).length;
  const totalChapters = CHOCOBO_SOLDIER_CHAPTERS.length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 via-purple-900 to-black p-4">
      {/* Secret Header */}
      <div className="container mx-auto max-w-4xl">
        <div className="flex items-center gap-4 mb-6">
          <PixelButton
            variant="outline"
            onClick={() => setLocation("/")}
            className="flex items-center gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Return
          </PixelButton>
          
          <div className="flex-1">
            <h1 className="text-3xl font-pixel text-cyan-400 mb-2 flex items-center gap-3">
              <Sword className="w-8 h-8 text-blue-400" />
              CHOCOBO SOLDIERs
              <Feather className="w-8 h-8 text-yellow-400" />
            </h1>
            <p className="text-blue-300 text-sm">
              A secret Final Fantasy VII fan fiction campaign - {completedChapters}/{totalChapters} chapters completed
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <PixelCard className="mb-6 bg-black/50 border-cyan-500">
          <div className="p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-cyan-400 font-pixel text-sm">Campaign Progress</span>
              <span className="text-yellow-400 font-pixel text-sm">
                {Math.round((completedChapters / totalChapters) * 100)}%
              </span>
            </div>
            <Progress 
              value={(completedChapters / totalChapters) * 100} 
              className="h-3 bg-blue-900/50"
            />
          </div>
        </PixelCard>

        {/* Story Introduction */}
        <PixelCard className="mb-6 bg-gradient-to-r from-blue-900/50 to-purple-900/50 border-purple-500">
          <div className="p-6">
            <h2 className="text-xl font-pixel text-purple-300 mb-3">The Story Begins...</h2>
            <p className="text-blue-200 text-sm leading-relaxed mb-4">
              Everything was right in the world. Zack and Aerith were looking after the lifestream, 
              Cloud was getting better in his everyday life, and everyone was finally happy! 
              At least they were until Zack wakes up as a Chocobo along with three other SOLDIERs 
              he thought were dead. Cloud and Chocobo Zack now have to save the world.
            </p>
            <div className="flex items-center gap-4">
              <ZackChocobo />
              <GenesisChocobo />
              <AngeaChocobo />
              <SephirothChocobo />
              <span className="text-cyan-300 text-sm">The SOLDIER Chocobos</span>
            </div>
          </div>
        </PixelCard>

        {/* Chapter Selection */}
        <div className="grid gap-4">
          {CHOCOBO_SOLDIER_CHAPTERS.map((chapter) => {
            const isCompleted = chocoboProgress[chapter.id]?.completed;
            const isLocked = chapter.id > 1 && !chocoboProgress[chapter.id - 1]?.completed;
            
            return (
              <PixelCard 
                key={chapter.id}
                className={`transition-all duration-200 ${
                  isCompleted 
                    ? "bg-green-900/30 border-green-500" 
                    : isLocked 
                      ? "bg-gray-900/30 border-gray-600" 
                      : "bg-blue-900/30 border-blue-500 hover:border-cyan-400"
                }`}
              >
                <div className="p-4 flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-yellow-400 font-pixel text-sm">
                        Chapter {chapter.id}
                      </span>
                      {isCompleted && (
                        <span className="text-green-400 text-xs font-pixel">COMPLETE</span>
                      )}
                      {isLocked && (
                        <span className="text-gray-500 text-xs font-pixel">LOCKED</span>
                      )}
                    </div>
                    <h3 className="text-lg font-pixel text-cyan-300 mb-2">
                      {chapter.title}
                    </h3>
                    <p className="text-blue-200 text-sm mb-2">
                      {chapter.description}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-purple-300">
                      <span>Character: {chapter.character}</span>
                      <span>Location: {chapter.location}</span>
                    </div>
                    {isCompleted && chocoboProgress[chapter.id] && (
                      <div className="mt-2 text-xs text-green-400">
                        Best: {chocoboProgress[chapter.id].wpm} WPM • 
                        {chocoboProgress[chapter.id].accuracy}% accuracy
                      </div>
                    )}
                  </div>
                  
                  <PixelButton
                    onClick={() => startRace(chapter.id)}
                    disabled={isLocked}
                    variant={isCompleted ? "default" : "outline"}
                    className="ml-4"
                  >
                    {isCompleted ? "Replay" : "Start"}
                  </PixelButton>
                </div>
              </PixelCard>
            );
          })}
        </div>

        {/* Important Disclaimers and Credits */}
        <div className="mt-8 space-y-4">
          {/* Dream Statement */}
          <div className="text-center p-4 bg-black/50 border border-purple-500 rounded">
            <p className="text-purple-300 text-sm font-pixel mb-2">
              ⚠️ THERE IS NO CHOCOBO LEVEL ⚠️
            </p>
            <p className="text-gray-400 text-xs">
              Nobody ever saw this... it is all a dream... this level doesn't exist...
            </p>
          </div>

          {/* Fan Fiction Credits */}
          <div className="text-center p-4 bg-blue-900/20 border border-blue-500 rounded">
            <p className="text-blue-300 text-sm font-pixel mb-2">Original Fan Fiction Credits</p>
            <p className="text-blue-200 text-xs mb-1">
              Based on "Chocobo SOLDIERs" by{" "}
              <a 
                href="https://www.fanfiction.net/u/6329966/Annibeliese" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-yellow-400 hover:underline"
              >
                Annibeliese
              </a>
            </p>
            <p className="text-blue-200 text-xs">
              Original story:{" "}
              <a 
                href="https://www.fanfiction.net/s/13539856/1/Chocobo-SOLDIERs" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-yellow-400 hover:underline"
              >
                FanFiction.net
              </a>
            </p>
          </div>

          {/* Legal Disclaimers */}
          <div className="text-center p-4 bg-red-900/20 border border-red-500 rounded">
            <p className="text-red-300 text-sm font-pixel mb-2">Educational Use Only</p>
            <p className="text-gray-300 text-xs leading-relaxed">
              We own none of the rights to any of these characters and have no official affiliation 
              with SQUARE ENIX. This project is merely an educational tool to help people learn 
              to study and type by paying homage to the most legendary game of all time. 
              All Final Fantasy VII characters and concepts are the property of SQUARE ENIX.
            </p>
          </div>

          {/* Secret Footer */}
          <div className="text-center">
            <p className="text-purple-400 text-xs font-pixel opacity-50">
              A hidden tribute that doesn't exist • Made with love for FF7 fans
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}