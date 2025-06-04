import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { PixelButton } from "@/components/ui/pixel-button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { cn } from "@/lib/utils";
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
  Zap
} from "lucide-react";

interface WritingPrompt {
  id: string;
  title: string;
  description: string;
  category: 'epic' | 'lore' | 'story';
  difficulty: 'novice' | 'adept' | 'master';
  xpReward: number;
  keywords: string[];
  inspiration: string;
}

interface Submission {
  id: number;
  title: string;
  content: string;
  category: string;
  status: 'pending' | 'approved' | 'featured';
  xp_awarded: number;
  word_count: number;
  created_at: string;
}

// Legends of the Garu Riders Writing Prompts
const WRITING_PROMPTS: WritingPrompt[] = [
  // Epic Prompts
  {
    id: 'epic_001',
    title: 'The First Garu Bond',
    description: 'Chronicle the legendary tale of how the first human formed a sacred bond with a Garu, establishing the foundation of all Garu Rider traditions.',
    category: 'epic',
    difficulty: 'master',
    xpReward: 500,
    keywords: ['first bond', 'ancient times', 'sacred ritual', 'elemental awakening'],
    inspiration: 'Long before the Eight Factions divided the realm, when the elements themselves walked the earth...'
  },
  {
    id: 'epic_002', 
    title: 'The Great Elemental War',
    description: 'Tell the story of the cataclysmic war that split the Garu Riders into eight elemental factions, reshaping the very fabric of their world.',
    category: 'epic',
    difficulty: 'master',
    xpReward: 500,
    keywords: ['faction war', 'elemental chaos', 'broken alliances', 'world-changing'],
    inspiration: 'When Order clashed with Chaos, and the elements themselves chose sides...'
  },
  {
    id: 'lore_001',
    title: 'Garu Evolution Mysteries',
    description: 'Explore the scientific and magical theories behind how Garu evolved their elemental affinities and bonding capabilities.',
    category: 'lore',
    difficulty: 'adept',
    xpReward: 300,
    keywords: ['evolution', 'elemental affinity', 'bonding magic', 'science'],
    inspiration: 'Ancient texts speak of Garu who once roamed wild, before the Great Awakening...'
  },
  {
    id: 'story_001',
    title: 'A Rider\'s First Race',
    description: 'Write about a young person\'s first official race with their newly bonded Garu companion.',
    category: 'story',
    difficulty: 'novice',
    xpReward: 150,
    keywords: ['first race', 'young rider', 'nervous energy', 'friendship'],
    inspiration: 'Heart pounding, hands trembling on the reins, as the starting horn echoes across the track...'
  }
];

export default function ScribePage() {
  const [selectedPrompt, setSelectedPrompt] = useState<WritingPrompt | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Check authentication
  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ['/api/profile'],
    retry: false,
  });

  // Handle "Use This Prompt" functionality
  const handleUsePrompt = (prompt: WritingPrompt) => {
    setSelectedPrompt(prompt);
    setTitle(prompt.title);
    setCategory(prompt.category);
    setContent(`Inspired by: ${prompt.inspiration}\n\n`);
    
    toast({
      title: "Prompt Selected!",
      description: `Now writing "${prompt.title}" - ${prompt.xpReward} XP reward`,
    });
  };

  // Fetch user submissions
  const { data: submissions = [], isLoading: submissionsLoading } = useQuery({
    queryKey: ['/api/scribe/submissions'],
    enabled: !!user,
  });

  // Fetch featured submissions
  const { data: featured = [], isLoading: featuredLoading } = useQuery({
    queryKey: ['/api/scribe/featured'],
  });

  // Submit mutation
  const submitMutation = useMutation({
    mutationFn: async (submissionData: {
      title: string;
      content: string;
      category: string;
      promptId?: string;
    }) => {
      const response = await apiRequest('POST', '/api/scribe/submit', submissionData);
      if (!response.ok) {
        throw new Error('Failed to submit writing');
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
      setCategory("");
      
      // Refresh submissions
      queryClient.invalidateQueries({ queryKey: ['/api/scribe/submissions'] });
    },
    onError: (error: any) => {
      toast({
        title: "Submission Failed",
        description: error.message || "Failed to submit your writing. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) {
      toast({
        title: "Incomplete Submission",
        description: "Please provide both a title and content for your inscription.",
        variant: "destructive",
      });
      return;
    }

    if (content.length < 100) {
      toast({
        title: "Content Too Short",
        description: "Your inscription must be at least 100 characters long.",
        variant: "destructive",
      });
      return;
    }

    if (!category) {
      toast({
        title: "Category Required",
        description: "Please select a category for your inscription.",
        variant: "destructive",
      });
      return;
    }

    submitMutation.mutate({
      title,
      content,
      category,
      promptId: selectedPrompt?.id,
    });
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'novice': return 'bg-green-600';
      case 'adept': return 'bg-yellow-600';
      case 'master': return 'bg-red-600';
      default: return 'bg-gray-600';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'epic': return <Crown className="w-4 h-4" />;
      case 'lore': return <BookOpen className="w-4 h-4" />;
      case 'story': return <Feather className="w-4 h-4" />;
      default: return <Scroll className="w-4 h-4" />;
    }
  };

  // Authentication check
  if (userLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-purple-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-purple-900 flex items-center justify-center p-4">
        <Card className="p-8 bg-slate-800/50 border-yellow-500/20 max-w-md w-full text-center">
          <div className="space-y-4">
            <Scroll className="w-16 h-16 text-yellow-400 mx-auto" />
            <h2 className="text-2xl font-bold text-white">SCRIBE HALL</h2>
            <p className="text-slate-300">
              Please log in to access the SCRIBE Hall and contribute your stories to the Legends of Garu Riders universe.
            </p>
            <PixelButton 
              onClick={() => window.location.href = '/api/login'}
              className="w-full"
            >
              Log In to Write
            </PixelButton>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-purple-900 p-6">
      <div className="container mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-3">
            <Scroll className="w-8 h-8 text-yellow-400" />
            <h1 className="text-4xl font-bold text-white">SCRIBE HALL</h1>
            <Feather className="w-8 h-8 text-yellow-400" />
          </div>
          <p className="text-slate-300 max-w-2xl mx-auto">
            Chronicle the Legends of the Garu Riders! Contribute to the official lore, compose epic tales, 
            and earn XP for your literary mastery. Your inscriptions may become part of the eternal canon.
          </p>
        </div>

        <Tabs defaultValue="compose" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-slate-800/50">
            <TabsTrigger value="compose" className="data-[state=active]:bg-yellow-600">
              <Feather className="w-4 h-4 mr-2" />
              Compose
            </TabsTrigger>
            <TabsTrigger value="prompts" className="data-[state=active]:bg-yellow-600">
              <Sparkles className="w-4 h-4 mr-2" />
              Prompts
            </TabsTrigger>
            <TabsTrigger value="submissions" className="data-[state=active]:bg-yellow-600">
              <Clock className="w-4 h-4 mr-2" />
              My Works
            </TabsTrigger>
            <TabsTrigger value="featured" className="data-[state=active]:bg-yellow-600">
              <Trophy className="w-4 h-4 mr-2" />
              Featured
            </TabsTrigger>
          </TabsList>

          {/* Compose Tab */}
          <TabsContent value="compose" className="space-y-6">
            <Card className="p-6 bg-slate-800/50 border-yellow-500/20">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-white">New Inscription</h2>
                  {selectedPrompt && (
                    <Badge className={cn("text-white", getDifficultyColor(selectedPrompt.difficulty))}>
                      {selectedPrompt.difficulty} • {selectedPrompt.xpReward} XP
                    </Badge>
                  )}
                </div>

                <div className="grid gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Title</label>
                    <Input
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Enter your inscription title..."
                      className="bg-slate-700 border-slate-600 text-white placeholder-slate-400"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Category</label>
                    <Select value={category} onValueChange={setCategory}>
                      <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-700 border-slate-600">
                        <SelectItem value="epic" className="text-white">Epic Tale</SelectItem>
                        <SelectItem value="lore" className="text-white">Lore Entry</SelectItem>
                        <SelectItem value="story" className="text-white">Character Story</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Content ({content.length} characters)
                    </label>
                    <Textarea
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder="Begin your inscription here... (minimum 100 characters)"
                      className="min-h-64 bg-slate-700 border-slate-600 text-white placeholder-slate-400 resize-y"
                      rows={12}
                    />
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="text-sm text-slate-400">
                      {content.length >= 100 ? (
                        <span className="text-green-400">✓ Minimum length met</span>
                      ) : (
                        <span>Need {100 - content.length} more characters</span>
                      )}
                    </div>
                    <PixelButton
                      onClick={handleSubmit}
                      disabled={submitMutation.isPending || content.length < 100}
                      className="bg-yellow-600 hover:bg-yellow-700"
                    >
                      {submitMutation.isPending ? "Submitting..." : "Submit Inscription"}
                    </PixelButton>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Prompts Tab */}
          <TabsContent value="prompts" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {WRITING_PROMPTS.map((prompt) => (
                <Card key={prompt.id} className="p-6 bg-slate-800/50 border-yellow-500/20">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-2">
                        {getCategoryIcon(prompt.category)}
                        <h3 className="text-xl font-bold text-white">{prompt.title}</h3>
                      </div>
                      <Badge className={cn("text-white", getDifficultyColor(prompt.difficulty))}>
                        {prompt.difficulty}
                      </Badge>
                    </div>

                    <p className="text-slate-300">{prompt.description}</p>

                    <div className="space-y-2">
                      <p className="text-sm text-yellow-400 italic">"{prompt.inspiration}"</p>
                      <div className="flex flex-wrap gap-1">
                        {prompt.keywords.map((keyword) => (
                          <Badge key={keyword} variant="outline" className="text-xs border-slate-600 text-slate-300">
                            {keyword}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-2 text-yellow-400">
                        <Star className="w-4 h-4" />
                        <span className="font-medium">{prompt.xpReward} XP</span>
                      </div>
                      <PixelButton
                        onClick={() => handleUsePrompt(prompt)}
                        size="sm"
                        className="bg-yellow-600 hover:bg-yellow-700"
                      >
                        Use This Prompt
                      </PixelButton>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* My Works Tab */}
          <TabsContent value="submissions" className="space-y-6">
            {submissionsLoading ? (
              <div className="text-center text-white">Loading your submissions...</div>
            ) : submissions.length === 0 ? (
              <Card className="p-8 text-center bg-slate-800/50 border-yellow-500/20">
                <Feather className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">No Inscriptions Yet</h3>
                <p className="text-slate-300">Start writing to see your submissions here!</p>
              </Card>
            ) : (
              <div className="grid gap-4">
                {(submissions as Submission[]).map((submission) => (
                  <Card key={submission.id} className="p-6 bg-slate-800/50 border-yellow-500/20">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <h3 className="text-xl font-bold text-white">{submission.title}</h3>
                        <div className="flex items-center space-x-4 text-sm text-slate-300">
                          <span>{submission.category}</span>
                          <span>{submission.word_count} words</span>
                          <span>{new Date(submission.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="text-right space-y-1">
                        <Badge className={cn(
                          "text-white",
                          submission.status === 'approved' ? 'bg-green-600' :
                          submission.status === 'featured' ? 'bg-purple-600' : 'bg-yellow-600'
                        )}>
                          {submission.status}
                        </Badge>
                        <div className="text-yellow-400 font-medium">{submission.xp_awarded} XP</div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Featured Tab */}
          <TabsContent value="featured" className="space-y-6">
            {featuredLoading ? (
              <div className="text-center text-white">Loading featured works...</div>
            ) : featured.length === 0 ? (
              <Card className="p-8 text-center bg-slate-800/50 border-yellow-500/20">
                <Trophy className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">No Featured Works Yet</h3>
                <p className="text-slate-300">Be the first to create a masterpiece!</p>
              </Card>
            ) : (
              <div className="grid gap-6">
                {(featured as Submission[]).map((work) => (
                  <Card key={work.id} className="p-6 bg-slate-800/50 border-yellow-500/20">
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <h3 className="text-xl font-bold text-white">{work.title}</h3>
                        <Badge className="bg-purple-600 text-white">Featured</Badge>
                      </div>
                      <p className="text-slate-300 line-clamp-3">{work.content}</p>
                      <div className="flex justify-between items-center text-sm text-slate-400">
                        <span>{work.category} • {work.word_count} words</span>
                        <span>{new Date(work.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}