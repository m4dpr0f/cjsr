import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { PixelButton } from "@/components/ui/pixel-button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { GlyphToolkit, getUnlockedGlyphs } from "@/components/glyph-toolkit";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { IslamicInputGuide } from "@/components/islamic-input-guide";
import {
  Scroll,
  Feather,
  Star,
  Clock,
  Trophy,
  Users,
  Sparkles,
  BookOpen,
  Shield,
  Swords,
  Crown,
  Zap,
  Home,
  ArrowLeft,
} from "lucide-react";

interface WritingPrompt {
  id: string;
  title: string;
  description: string;
  category: "epic" | "lore" | "story";
  difficulty: "novice" | "adept" | "master";
  xpReward: number;
  keywords: string[];
  inspiration: string;
}

interface Submission {
  id: number;
  title: string;
  content: string;
  category: string;
  promptId: string;
  authorUsername: string;
  submittedAt: string;
  status: "pending" | "approved" | "featured";
  xpAwarded: number;
  wordCount: number;
}

interface WisdomText {
  id: string;
  title: string;
  content: string;
  source: string;
  tradition: string;
  reference?: string;
}

interface WisdomReflection {
  id: string;
  wisdomTextId: string;
  title: string;
  reflection: string;
  submittedAt: string;
}

// Wisdom Traditions Available for Study
const WISDOM_TRADITIONS = [
  { id: "atheism", name: "Atheism", source: "sacred-texts.com" },
  { id: "buddhism", name: "Buddhism", source: "sacred-texts.com" },
  { id: "christianity", name: "Christianity", source: "sacred-texts.com" },
  { id: "islam", name: "Islam", source: "sacred-texts.com" },
  { id: "judaism", name: "Judaism", source: "sacred-texts.com" },
  { id: "hawaiian", name: "Hawaiian Religion", source: "sacred-texts.com" },
  { id: "taoism", name: "Taoism", source: "sacred-texts.com" },
  { id: "sikhism", name: "Sikhism", source: "sacred-texts.com" },
  { id: "jainism", name: "Jainism", source: "sacred-texts.com" },
  { id: "shinto", name: "Shinto", source: "sacred-texts.com" },
  { id: "folk", name: "Folk Religion", source: "sacred-texts.com" },
  { id: "spiritism", name: "Spiritism", source: "sacred-texts.com" },
  { id: "confucianism", name: "Confucianism", source: "sacred-texts.com" },
  {
    id: "indigenous",
    name: "Indigenous Religions",
    source: "sacred-texts.com",
  },
  { id: "vedanta", name: "Vedanta", source: "vedabase.io" },
  { id: "other", name: "Other", source: "sacred-texts.com" },
];

// Legends of the Garu Riders Writing Prompts
const WRITING_PROMPTS: WritingPrompt[] = [
  // Epic Prompts
  {
    id: "epic_001",
    title: "The First Garu Bond",
    description:
      "Chronicle the legendary tale of how the first human formed a sacred bond with a Garu, establishing the foundation of all Garu Rider traditions.",
    category: "epic",
    difficulty: "master",
    xpReward: 500,
    keywords: [
      "first bond",
      "ancient times",
      "sacred ritual",
      "elemental awakening",
    ],
    inspiration:
      "Long before the Eight Factions divided the realm, when the elements themselves walked the earth...",
  },
  {
    id: "epic_002",
    title: "The Great Elemental War",
    description:
      "Tell the story of the cataclysmic war that split the Garu Riders into eight elemental factions, reshaping the very fabric of their world.",
    category: "epic",
    difficulty: "master",
    xpReward: 500,
    keywords: [
      "faction war",
      "elemental chaos",
      "broken alliances",
      "world-changing",
    ],
    inspiration:
      "When Order clashed with Chaos, and the elements themselves chose sides...",
  },
  {
    id: "epic_003",
    title: "The Lost Ninth Faction",
    description:
      "Reveal the forgotten history of the mysterious Ninth Faction that vanished from all records, and what their return might mean.",
    category: "epic",
    difficulty: "master",
    xpReward: 600,
    keywords: [
      "lost faction",
      "forbidden knowledge",
      "ancient mystery",
      "return",
    ],
    inspiration:
      "In the deepest archives, whispers speak of nine, not eight...",
  },

  // Lore Prompts
  {
    id: "lore_001",
    title: "Garu Evolution Mysteries",
    description:
      "Explain how Garu developed their elemental affinities and what triggers their evolution into higher forms.",
    category: "lore",
    difficulty: "adept",
    xpReward: 300,
    keywords: [
      "evolution",
      "elemental affinity",
      "natural selection",
      "bonding",
    ],
    inspiration:
      "Each Garu carries the potential of their element within their very essence...",
  },
  {
    id: "lore_002",
    title: "The Elemental Egg Prophecy",
    description:
      "Detail the ancient prophecy surrounding the eight elemental eggs and their role in choosing destined riders.",
    category: "lore",
    difficulty: "adept",
    xpReward: 350,
    keywords: ["prophecy", "elemental eggs", "destiny", "choosing ceremony"],
    inspiration:
      "When the eggs sing in harmony, a new age of riders shall dawn...",
  },
  {
    id: "lore_003",
    title: "TeacherGuru's Origins",
    description:
      "Uncover the mysterious background of TeacherGuru and their role as the eternal guide for new riders.",
    category: "lore",
    difficulty: "novice",
    xpReward: 200,
    keywords: ["TeacherGuru", "mentor", "wisdom", "guidance"],
    inspiration:
      "Some say TeacherGuru was the first to bond with all eight elements...",
  },
  {
    id: "lore_004",
    title: "The Faction Hierarchy",
    description:
      "Describe the internal structure, ranks, and traditions within each of the eight elemental factions.",
    category: "lore",
    difficulty: "adept",
    xpReward: 250,
    keywords: ["faction structure", "ranks", "traditions", "hierarchy"],
    inspiration:
      "From novice egg-tender to legendary rider, each faction honors its own path...",
  },

  // Story Prompts
  {
    id: "story_001",
    title: "A Rider's First Race",
    description:
      "Write about a young rider's nervous excitement during their first official race after bonding with their Garu.",
    category: "story",
    difficulty: "novice",
    xpReward: 150,
    keywords: ["first race", "nervous excitement", "bonding", "coming of age"],
    inspiration:
      "The starting line stretched before them, their Garu sensing their racing heart...",
  },
  {
    id: "story_002",
    title: "The Rival's Redemption",
    description:
      "Tell the tale of two rival riders from opposing factions who must work together to save their Garu from a common threat.",
    category: "story",
    difficulty: "adept",
    xpReward: 275,
    keywords: ["rivalry", "redemption", "cooperation", "common enemy"],
    inspiration:
      "Fire and Water, eternal opposites, yet in this moment they shared the same goal...",
  },
  {
    id: "story_003",
    title: "The Legendary Mount",
    description:
      "Chronicle the adventures of a rider searching for a mythical Garu said to possess powers beyond any known element.",
    category: "story",
    difficulty: "master",
    xpReward: 400,
    keywords: [
      "legendary quest",
      "mythical Garu",
      "unknown powers",
      "adventure",
    ],
    inspiration:
      "Legends spoke of a Garu that shimmered with all colors yet belonged to no faction...",
  },
  {
    id: "story_004",
    title: "The Great Tournament",
    description:
      "Capture the drama and excitement of the annual inter-faction tournament where riders compete for ultimate glory.",
    category: "story",
    difficulty: "adept",
    xpReward: 300,
    keywords: ["tournament", "competition", "glory", "inter-faction"],
    inspiration:
      "Once a year, all factions gather to test their finest riders in sacred competition...",
  },
  {
    id: "story_005",
    title: "The Outcast's Journey",
    description:
      "Follow a rider expelled from their faction who must find their own path in the world beyond traditional bonds.",
    category: "story",
    difficulty: "adept",
    xpReward: 275,
    keywords: ["outcast", "exile", "self-discovery", "independence"],
    inspiration:
      "Without a faction's colors, they rode alone under the vast sky...",
  },
];

export default function Scribe() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [selectedPrompt, setSelectedPrompt] = useState<WritingPrompt | null>(
    null,
  );
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState<"epic" | "lore" | "story">("story");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Glyph Toolkit state
  const [showGlyphToolkit, setShowGlyphToolkit] = useState(false);
  const [unlockedGlyphs, setUnlockedGlyphs] = useState<string[]>([]);

  // WISDOMS section state
  const [selectedTradition, setSelectedTradition] = useState<string>("");
  const [currentWisdomText, setCurrentWisdomText] = useState<WisdomText | null>(
    null,
  );
  const [reflectionTitle, setReflectionTitle] = useState("");
  const [reflection, setReflection] = useState("");
  const [isLoadingWisdom, setIsLoadingWisdom] = useState(false);

  // Fetch user submissions
  const { data: submissions = [], isLoading: submissionsLoading } = useQuery({
    queryKey: ["/api/scribe/submissions"],
    retry: false,
  });

  // Fetch featured submissions
  const { data: featured = [], isLoading: featuredLoading } = useQuery({
    queryKey: ["/api/scribe/featured"],
    retry: false,
  });

  // Load unlocked glyphs on component mount
  useEffect(() => {
    setUnlockedGlyphs(getUnlockedGlyphs());
  }, []);

  // Handle glyph selection in compose area
  const handleGlyphSelect = (glyph: string) => {
    if (content !== null) {
      const newContent = content + glyph;
      setContent(newContent);
      toast({
        title: "Sacred Glyph Inserted",
        description: `Added ${glyph} to your inscription`,
        variant: "default"
      });
    }
  };

  // Submit writing mutation
  const submitWriting = useMutation({
    mutationFn: async (submissionData: {
      title: string;
      content: string;
      category: string;
      promptId?: string;
    }) => {
      const response = await apiRequest(
        "POST",
        "/api/scribe/submit",
        submissionData,
      );
      if (!response.ok) {
        throw new Error("Failed to submit writing");
      }
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Inscription Submitted!",
        description: `Your ${category} has been submitted for review. You've earned ${data.xpAwarded} XP!`,
        variant: "default",
      });

      // Reset form
      setTitle("");
      setContent("");
      setSelectedPrompt(null);

      // Refresh submissions
      queryClient.invalidateQueries({ queryKey: ["/api/scribe/submissions"] });
    },
    onError: (error: any) => {
      toast({
        title: "Submission Failed",
        description:
          error.message || "Failed to submit your writing. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) {
      toast({
        title: "Incomplete Submission",
        description:
          "Please provide both a title and content for your inscription.",
        variant: "destructive",
      });
      return;
    }

    if (content.length < 100) {
      toast({
        title: "Too Short",
        description: "Your inscription must be at least 100 characters long.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await submitWriting.mutateAsync({
        title,
        content,
        category,
        promptId: selectedPrompt?.id,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPromptsByCategory = (cat: string) => {
    return WRITING_PROMPTS.filter((p) => p.category === cat);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "novice":
        return "bg-green-600";
      case "adept":
        return "bg-yellow-600";
      case "master":
        return "bg-red-600";
      default:
        return "bg-gray-600";
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "epic":
        return <Crown className="w-4 h-4" />;
      case "lore":
        return <BookOpen className="w-4 h-4" />;
      case "story":
        return <Feather className="w-4 h-4" />;
      default:
        return <Scroll className="w-4 h-4" />;
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Exit Door - Prominent Return Home Button */}
      <div className="mb-6">
        <PixelButton
          onClick={() => (window.location.href = "/game-menu")}
          className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-6 py-3 text-lg font-bold shadow-lg transition-all transform hover:scale-105"
        >
          <ArrowLeft className="w-5 h-5" />
          <Home className="w-5 h-5" />
          Exit Scribe Hall
        </PixelButton>
      </div>

      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-3">
          <Scroll className="w-8 h-8 text-primary" />
          <h1 className="text-4xl font-minecraft text-primary">SCRIBE HALL</h1>
          <Feather className="w-8 h-8 text-primary" />
        </div>
        <p className="text-gray-300 max-w-2xl mx-auto">
          Chronicle the Legends of the Garu Riders! Contribute to the official
          lore, compose epic tales, and earn XP for your literary mastery. Your
          inscriptions may become part of the eternal canon.
        </p>
        
        {/* Personal Glyph Toolkit Access */}
        <div className="flex justify-center">
          <PixelButton
            onClick={() => setShowGlyphToolkit(!showGlyphToolkit)}
            className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-4 py-2 text-sm font-bold shadow-lg transition-all"
          >
            📜 Personal Glyph Toolkit ({unlockedGlyphs.length})
          </PixelButton>
        </div>
      </div>

      {/* Glyph Toolkit Panel */}
      {showGlyphToolkit && (
        <Card className="p-4 bg-dark-800 border-purple-500/30">
          <GlyphToolkit
            isVisible={true}
            onToggle={() => setShowGlyphToolkit(false)}
            onGlyphSelect={handleGlyphSelect}
            onGlyphUnlock={() => setUnlockedGlyphs(getUnlockedGlyphs())}
            unlockedGlyphs={unlockedGlyphs}
          />
        </Card>
      )}

      <Tabs defaultValue="compose" className="w-full">
        <TabsList className="grid w-full grid-cols-6 bg-dark-800">
          <TabsTrigger
            value="compose"
            className="data-[state=active]:bg-primary"
          >
            <Feather className="w-4 h-4 mr-2" />
            Compose
          </TabsTrigger>
          <TabsTrigger
            value="practice"
            className="data-[state=active]:bg-primary"
          >
            <Shield className="w-4 h-4 mr-2" />
            Practice
          </TabsTrigger>
          <TabsTrigger
            value="wisdoms"
            className="data-[state=active]:bg-primary"
          >
            <BookOpen className="w-4 h-4 mr-2" />
            Wisdoms
          </TabsTrigger>
          <TabsTrigger
            value="prompts"
            className="data-[state=active]:bg-primary"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Prompts
          </TabsTrigger>
          <TabsTrigger
            value="submissions"
            className="data-[state=active]:bg-primary"
          >
            <Clock className="w-4 h-4 mr-2" />
            My Works
          </TabsTrigger>
          <TabsTrigger
            value="featured"
            className="data-[state=active]:bg-primary"
          >
            <Trophy className="w-4 h-4 mr-2" />
            Featured
          </TabsTrigger>
        </TabsList>

        {/* Compose Tab */}
        <TabsContent value="compose" className="space-y-6">
          <Card className="p-6 bg-dark-800 border-primary/20">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-minecraft text-primary">
                  New Inscription
                </h2>
                {selectedPrompt && (
                  <Badge
                    className={cn(
                      "text-white",
                      getDifficultyColor(selectedPrompt.difficulty),
                    )}
                  >
                    {selectedPrompt.difficulty} • {selectedPrompt.xpReward} XP
                  </Badge>
                )}
              </div>

              {selectedPrompt && (
                <div className="p-4 bg-dark-900 rounded-lg border border-primary/30">
                  <div className="flex items-center space-x-2 mb-2">
                    {getCategoryIcon(selectedPrompt.category)}
                    <h3 className="font-minecraft text-primary">
                      {selectedPrompt.title}
                    </h3>
                  </div>
                  <p className="text-gray-300 mb-3">
                    {selectedPrompt.description}
                  </p>
                  <div className="text-sm text-gray-400 italic">
                    "{selectedPrompt.inspiration}"
                  </div>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {selectedPrompt.keywords.map((keyword) => (
                      <Badge
                        key={keyword}
                        variant="outline"
                        className="text-xs"
                      >
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                  <PixelButton
                    onClick={() => setSelectedPrompt(null)}
                    variant="outline"
                    size="sm"
                    className="mt-3"
                  >
                    Clear Prompt
                  </PixelButton>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Title
                  </label>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter your inscription title..."
                    className="bg-slate-700 border-slate-600 text-white placeholder-slate-400 focus:ring-yellow-500 focus:border-yellow-500"
                    maxLength={100}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Category
                  </label>
                  <Select
                    value={category}
                    onValueChange={(value: "epic" | "lore" | "story") =>
                      setCategory(value)
                    }
                  >
                    <SelectTrigger className="bg-slate-700 border-slate-600 text-white focus:ring-yellow-500 focus:border-yellow-500">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-600 text-white">
                      <SelectItem
                        value="story"
                        className="text-white hover:bg-slate-700 focus:bg-slate-700"
                      >
                        📖 Short Story
                      </SelectItem>
                      <SelectItem
                        value="lore"
                        className="text-white hover:bg-slate-700 focus:bg-slate-700"
                      >
                        📚 Lore Entry
                      </SelectItem>
                      <SelectItem
                        value="epic"
                        className="text-white hover:bg-slate-700 focus:bg-slate-700"
                      >
                        👑 Epic Chronicle
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-300">
                    Content ({content.length} characters)
                  </label>
                  <IslamicInputGuide />
                </div>
                <Textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  onPaste={(e) => {
                    e.preventDefault();
                    toast({
                      title: "Paste Blocked",
                      description:
                        "For authenticity, please type your inscription manually. Copy/paste is not allowed in SCRIBE Hall.",
                      variant: "destructive",
                    });
                  }}
                  placeholder="Begin your inscription here... Let the legends flow through your words!"
                  className="bg-slate-700 border-slate-600 text-white placeholder-slate-400 min-h-[300px] font-mono focus:ring-yellow-500 focus:border-yellow-500"
                  maxLength={5000}
                />
                <div className="text-xs text-gray-500 mt-1">
                  Minimum 100 characters • Copy/paste detection active
                </div>
              </div>

              <div className="flex space-x-4">
                <PixelButton
                  onClick={handleSubmit}
                  disabled={isSubmitting || !title.trim() || !content.trim()}
                  className="bg-primary hover:bg-primary/80"
                >
                  {isSubmitting ? (
                    <>
                      <Clock className="w-4 h-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Scroll className="w-4 h-4 mr-2" />
                      Submit Inscription
                    </>
                  )}
                </PixelButton>

                <PixelButton
                  onClick={() => {
                    setTitle("");
                    setContent("");
                    setSelectedPrompt(null);
                  }}
                  variant="outline"
                >
                  Clear All
                </PixelButton>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Practice Tab */}
        <TabsContent value="practice" className="space-y-6">
          <Card className="p-6 bg-dark-800 border-primary/20">
            <div className="space-y-4">
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-minecraft text-primary flex items-center justify-center gap-2">
                  <Shield className="w-6 h-6" />
                  Glyph Practice Arena
                </h2>
                <p className="text-gray-300">
                  Practice typing with your unlocked sacred glyphs and emojis. Perfect your transcription skills!
                </p>
              </div>

              {unlockedGlyphs.length > 0 ? (
                <div className="space-y-4">
                  <div className="bg-dark-900 p-4 rounded-lg border border-primary/30">
                    <h3 className="text-lg font-minecraft text-primary mb-3 flex items-center gap-2">
                      📜 Your Unlocked Glyphs ({unlockedGlyphs.length})
                    </h3>
                    <div className="grid grid-cols-8 md:grid-cols-12 gap-2">
                      {unlockedGlyphs.map((glyph, index) => (
                        <div
                          key={index}
                          className="bg-slate-700 hover:bg-slate-600 p-2 rounded text-center text-lg cursor-pointer transition-colors"
                          onClick={() => handleGlyphSelect(glyph)}
                          title={`Click to copy: ${glyph}`}
                        >
                          {glyph}
                        </div>
                      ))}
                    </div>
                    <p className="text-sm text-gray-400 mt-2">
                      Click any glyph to add it to your current composition
                    </p>
                  </div>

                  <div className="bg-dark-900 p-4 rounded-lg border border-primary/30">
                    <h3 className="text-lg font-minecraft text-primary mb-3">
                      Practice Sequences
                    </h3>
                    <div className="space-y-3">
                      <div className="p-3 bg-slate-700 rounded">
                        <h4 className="text-primary font-medium mb-2">Basic Sequence:</h4>
                        <p className="font-mono text-sm text-gray-300">
                          {unlockedGlyphs.slice(0, 5).join(' ')}
                        </p>
                      </div>
                      <div className="p-3 bg-slate-700 rounded">
                        <h4 className="text-primary font-medium mb-2">Advanced Sequence:</h4>
                        <p className="font-mono text-sm text-gray-300">
                          {unlockedGlyphs.join(' ')}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Lock className="w-12 h-12 mx-auto mb-4 text-gray-500" />
                  <h3 className="text-lg font-minecraft text-gray-400 mb-2">
                    No Glyphs Unlocked Yet
                  </h3>
                  <p className="text-gray-500 mb-4">
                    Complete the Cryptofae campaign to unlock sacred glyphs for practice
                  </p>
                  <PixelButton
                    onClick={() => (window.location.href = "/campaign")}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    Explore Campaigns
                  </PixelButton>
                </div>
              )}
            </div>
          </Card>
        </TabsContent>

        {/* Prompts Tab */}
        <TabsContent value="prompts" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {WRITING_PROMPTS.map((prompt) => (
              <Card
                key={prompt.id}
                className="p-4 bg-dark-800 border-primary/20 hover:border-primary/50 transition-colors"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {getCategoryIcon(prompt.category)}
                      <Badge
                        className={cn(
                          "text-white text-xs",
                          getDifficultyColor(prompt.difficulty),
                        )}
                      >
                        {prompt.difficulty}
                      </Badge>
                    </div>
                    <Badge
                      variant="outline"
                      className="text-primary border-primary"
                    >
                      {prompt.xpReward} XP
                    </Badge>
                  </div>

                  <h3 className="font-minecraft text-primary text-lg">
                    {prompt.title}
                  </h3>
                  <p className="text-gray-300 text-sm">{prompt.description}</p>

                  <div className="text-xs text-gray-400 italic">
                    "{prompt.inspiration}"
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {prompt.keywords.slice(0, 3).map((keyword) => (
                      <Badge
                        key={keyword}
                        variant="outline"
                        className="text-xs"
                      >
                        {keyword}
                      </Badge>
                    ))}
                  </div>

                  <PixelButton
                    onClick={() => {
                      setSelectedPrompt(prompt);
                      setCategory(prompt.category);
                      // Switch to compose tab
                      const composeTab = document.querySelector(
                        '[value="compose"]',
                      ) as HTMLElement;
                      composeTab?.click();
                    }}
                    size="sm"
                    className="w-full"
                  >
                    Use This Prompt
                  </PixelButton>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* My Submissions Tab */}
        <TabsContent value="submissions" className="space-y-6">
          {submissionsLoading ? (
            <div className="text-center py-8">
              <Clock className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
              <p className="text-gray-400">Loading your inscriptions...</p>
            </div>
          ) : submissions.length > 0 ? (
            <div className="space-y-4">
              {submissions.map((submission: Submission) => (
                <Card
                  key={submission.id}
                  className="p-4 bg-dark-800 border-primary/20"
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center space-x-3">
                        <h3 className="font-minecraft text-primary">
                          {submission.title}
                        </h3>
                        <Badge
                          variant={
                            submission.status === "approved"
                              ? "default"
                              : submission.status === "featured"
                                ? "secondary"
                                : "outline"
                          }
                        >
                          {submission.status}
                        </Badge>
                        {submission.status === "featured" && (
                          <Star className="w-4 h-4 text-yellow-500" />
                        )}
                      </div>
                      <p className="text-gray-400 text-sm">
                        {submission.category} • {submission.wordCount} words •{" "}
                        {submission.xpAwarded} XP awarded
                      </p>
                      <p className="text-gray-500 text-xs">
                        Submitted{" "}
                        {submission.submittedAt
                          ? new Date(
                              submission.submittedAt,
                            ).toLocaleDateString()
                          : "Recently"}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-8 bg-dark-800 border-primary/20 text-center">
              <Scroll className="w-12 h-12 mx-auto mb-4 text-gray-500" />
              <h3 className="text-xl font-minecraft text-gray-400 mb-2">
                No Inscriptions Yet
              </h3>
              <p className="text-gray-500 mb-4">
                Start writing to contribute to the Legends of the Garu Riders!
              </p>
              <PixelButton
                onClick={() => {
                  const composeTab = document.querySelector(
                    '[value="compose"]',
                  ) as HTMLElement;
                  composeTab?.click();
                }}
              >
                Begin Writing
              </PixelButton>
            </Card>
          )}
        </TabsContent>

        {/* WISDOMS Tab */}
        <TabsContent value="wisdoms" className="space-y-6">
          <Card className="p-6 bg-dark-800 border-primary/20">
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-minecraft text-primary">
                  Sacred Wisdom Studies
                </h2>
                <p className="text-gray-300">
                  Explore sacred texts from world wisdom traditions. Scribe the
                  passages that speak to you and add your own reflections to
                  build your personal collection of wisdom.
                </p>
              </div>

              {/* Tradition Selection */}
              <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-300">
                  Select Wisdom Tradition
                </label>
                <Select
                  value={selectedTradition}
                  onValueChange={setSelectedTradition}
                >
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white focus:ring-yellow-500 focus:border-yellow-500">
                    <SelectValue placeholder="Choose a wisdom tradition to explore..." />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-600 text-white">
                    {WISDOM_TRADITIONS.map((tradition) => (
                      <SelectItem
                        key={tradition.id}
                        value={tradition.id}
                        className="text-white hover:bg-slate-700 focus:bg-slate-700"
                      >
                        📚 {tradition.name} ({tradition.source})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {selectedTradition && (
                  <div className="flex space-x-4">
                    <PixelButton
                      onClick={() => {
                        toast({
                          title: "Coming Soon!",
                          description: "Sacred text typing meditation will be available in the next update!",
                        });
                      }}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Sparkles className="w-4 h-4 mr-2" />
                      Get Sacred Text
                    </PixelButton>

                    <PixelButton
                      onClick={() => {
                        toast({
                          title: "Browse Feature",
                          description:
                            "Browse specific texts feature coming soon!",
                        });
                      }}
                      variant="outline"
                    >
                      <BookOpen className="w-4 h-4 mr-2" />
                      Browse Texts
                    </PixelButton>
                  </div>
                )}
              </div>

              {/* Wisdom Text Typing Challenge */}
              {currentWisdomText && (
                <Card className="p-6 bg-slate-900 border-yellow-500/30">
                  <div className="space-y-6">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-minecraft text-yellow-400">
                        {currentWisdomText.title}
                      </h3>
                      <Badge className="bg-yellow-600 text-white">
                        {
                          WISDOM_TRADITIONS.find(
                            (t) => t.id === currentWisdomText.tradition,
                          )?.name
                        }
                      </Badge>
                    </div>

                    {/* Sacred Text Display for Typing */}
                    <div className="space-y-4">
                      <h4 className="text-lg text-gray-200">
                        Type the Sacred Text Accurately
                      </h4>

                      {/* Target Text Display */}
                      <div className="p-4 bg-slate-800 rounded border-l-4 border-yellow-500">
                        <p className="text-gray-200 leading-relaxed italic">
                          "{currentWisdomText.content}"
                        </p>
                        {currentWisdomText.reference && (
                          <p className="text-sm text-gray-400 mt-2">
                            — {currentWisdomText.reference}
                          </p>
                        )}
                      </div>

                      {/* Typing Input */}
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-300">
                          Begin typing the sacred text:
                        </label>
                        <textarea
                          placeholder="Type the sacred text above exactly as shown..."
                          className="w-full h-32 p-4 bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-400 focus:ring-yellow-500 focus:border-yellow-500"
                        />
                      </div>

                      {/* Meditation Phase - appears after accurate typing */}
                      <div className="border-t border-slate-700 pt-4">
                        <h4 className="text-lg text-yellow-400 mb-2">
                          Personal Reflection (60 seconds)
                        </h4>
                        <p className="text-sm text-gray-400 mb-4">
                          After typing the sacred text accurately, you'll have
                          60 seconds to write your personal reflection and
                          meditation.
                        </p>

                        <textarea
                          value={wisdomReflection}
                          onChange={(e) => setWisdomReflection(e.target.value)}
                          placeholder="What insights does this sacred text bring to your life? How does it speak to your current journey?"
                          className="w-full h-40 p-4 bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-400 focus:ring-yellow-500 focus:border-yellow-500"
                        />
                      </div>

                      {/* Save Button */}
                      <div className="flex justify-center">
                        <PixelButton
                          onClick={async () => {
                            try {
                              const combinedWork = `Sacred Text: ${currentWisdomText.title}\n"${currentWisdomText.content}"\n— ${currentWisdomText.reference}\n\nPersonal Reflection:\n${wisdomReflection}`;

                              await apiRequest("POST", "/api/scribe/submit", {
                                title: `Wisdom Reflection: ${currentWisdomText.title}`,
                                content: combinedWork,
                                category: "wisdom",
                                promptId: currentWisdomText.id,
                              });

                              setCurrentWisdomText(null);
                              setWisdomReflection("");
                              toast({
                                title: "Wisdom Reflection Complete!",
                                description:
                                  "Your sacred text and reflection have been saved to My Works.",
                              });
                            } catch (error) {
                              toast({
                                title: "Save Error",
                                description:
                                  "Failed to save your reflection. Please try again.",
                                variant: "destructive",
                              });
                            }
                          }}
                          className="bg-green-600 hover:bg-green-700"
                          disabled={true}
                        >
                          <Save className="w-4 h-4 mr-2" />
                          Coming Soon!
                        </PixelButton>
                      </div>
                    </div>

                    {/* Reference */}
                    <div className="text-xs text-gray-500 border-t border-slate-700 pt-4">
                      <p>Source: {currentWisdomText.source}</p>
                    </div>
                  </div>
                </Card>
              )}

              {/* Original Reflection Writing Area - hidden when doing typing challenge */}
              {false && currentWisdomText && (
                <Card className="p-6 bg-slate-900 border-primary/20">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-minecraft text-primary">
                        Your Reflection & Meditation
                      </h3>
                      <IslamicInputGuide className="ml-4" />
                    </div>
                    <p className="text-sm text-gray-400">
                      Write your thoughts, insights, and personal reflections on
                      this sacred text. This will be saved to your personal
                      wisdom collection.
                    </p>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Reflection Title
                      </label>
                      <Input
                        value={reflectionTitle}
                        onChange={(e) => setReflectionTitle(e.target.value)}
                        placeholder="Title for your reflection..."
                        className="bg-slate-700 border-slate-600 text-white placeholder-slate-400 focus:ring-yellow-500 focus:border-yellow-500"
                        maxLength={100}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Your Reflection ({reflection.length} characters)
                      </label>
                      <Textarea
                        value={reflection}
                        onChange={(e) => setReflection(e.target.value)}
                        placeholder="Share your thoughts, insights, and personal reflections on this wisdom text..."
                        className="bg-slate-700 border-slate-600 text-white placeholder-slate-400 focus:ring-yellow-500 focus:border-yellow-500 min-h-[200px]"
                        maxLength={2000}
                      />
                    </div>

                    <PixelButton
                      onClick={() => {
                        if (!reflectionTitle.trim() || !reflection.trim()) {
                          toast({
                            title: "Incomplete Reflection",
                            description:
                              "Please provide both a title and your reflection.",
                            variant: "destructive",
                          });
                          return;
                        }

                        toast({
                          title: "Reflection Saved!",
                          description:
                            "Your wisdom reflection has been added to your collection.",
                        });

                        // Reset form
                        setReflectionTitle("");
                        setReflection("");
                        setCurrentWisdomText(null);
                      }}
                      className="bg-green-600 hover:bg-green-700"
                      disabled={!reflectionTitle.trim() || !reflection.trim()}
                    >
                      <Scroll className="w-4 h-4 mr-2" />
                      Save Reflection
                    </PixelButton>
                  </div>
                </Card>
              )}

              {/* Coming Soon Features */}
              <Card className="p-6 bg-dark-800 border-primary/20">
                <div className="text-center space-y-2">
                  <h3 className="text-lg font-minecraft text-primary">
                    Coming Soon
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-400">
                    <div>• View your personal wisdom collection</div>
                    <div>• Search through saved reflections</div>
                    <div>• Connect to sacred-texts.com API</div>
                    <div>• Connect to vedabase.io for Vedanta texts</div>
                    <div>• Daily wisdom text recommendations</div>
                    <div>• Share reflections with community</div>
                  </div>
                </div>
              </Card>
            </div>
          </Card>
        </TabsContent>

        {/* Featured Tab */}
        <TabsContent value="featured" className="space-y-6">
          {featuredLoading ? (
            <div className="text-center py-8">
              <Trophy className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
              <p className="text-gray-400">Loading featured works...</p>
            </div>
          ) : featured.length > 0 ? (
            <div className="space-y-6">
              {featured.map((submission: Submission) => (
                <Card
                  key={submission.id}
                  className="p-6 bg-dark-800 border-yellow-500/30"
                >
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <Star className="w-5 h-5 text-yellow-500" />
                      <h3 className="text-xl font-minecraft text-primary">
                        {submission.title}
                      </h3>
                      <Badge className="bg-yellow-600 text-white">
                        Featured
                      </Badge>
                    </div>
                    <p className="text-gray-300 leading-relaxed">
                      {submission.content.substring(0, 300)}...
                    </p>
                    <div className="flex items-center justify-between text-sm text-gray-400">
                      <span>By {submission.authorUsername}</span>
                      <span>
                        {submission.category} • {submission.wordCount} words
                      </span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-8 bg-dark-800 border-primary/20 text-center">
              <Trophy className="w-12 h-12 mx-auto mb-4 text-gray-500" />
              <h3 className="text-xl font-minecraft text-gray-400 mb-2">
                No Featured Works Yet
              </h3>
              <p className="text-gray-500">
                Be the first to create a masterpiece worthy of legend!
              </p>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
