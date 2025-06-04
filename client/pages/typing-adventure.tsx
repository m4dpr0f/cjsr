import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { useLocation } from 'wouter';
import { ChickenAvatar } from '@/components/ui/chicken-avatar';
import { useToast } from '@/hooks/use-toast';

interface Chapter {
  id: number;
  title: string;
  subtitle: string;
  language: string;
  focus: string;
  typingSkills: string;
  keyThemes: string;
  element: string;
  unlocked: boolean;
  completed: boolean;
  progress: number;
}

const chapters: Chapter[] = [
  {
    id: 1,
    title: "The Home Row Awakening",
    subtitle: "Keys as Spells",
    language: "English",
    focus: "Intro & Home Row",
    typingSkills: "ASDF JKL; basics",
    keyThemes: "Keys as spells, language is magic",
    element: "earth",
    unlocked: true,
    completed: false,
    progress: 0
  },
  {
    id: 2,
    title: "The Tower of Typographic Time",
    subtitle: "Ancient Roots",
    language: "Latin",
    focus: "Finger memory, basic words",
    typingSkills: "Latin roots",
    keyThemes: "Time, law, roots of script",
    element: "earth",
    unlocked: true,
    completed: false,
    progress: 0
  },
  {
    id: 3,
    title: "Scrolls of the Sandstone Shrine",
    subtitle: "Sacred Alphabets",
    language: "Aramaic",
    focus: "Speed drills, shift keys",
    typingSkills: "Aramaic/Syriac",
    keyThemes: "Sacred alphabets, holy scribes",
    element: "air",
    unlocked: true,
    completed: false,
    progress: 0
  },
  {
    id: 4,
    title: "Desert Winds and the Dotted Word",
    subtitle: "Divine Calligraphy",
    language: "Arabic",
    focus: "Punctuation & advanced accuracy",
    typingSkills: "Arabic",
    keyThemes: "Flow, right-to-left, divine calligraphy",
    element: "fire",
    unlocked: true,
    completed: false,
    progress: 0
  },
  {
    id: 5,
    title: "Flame Letters of the Living Light",
    subtitle: "Mystical Characters",
    language: "Hebrew",
    focus: "Numbers, symbols, passwords",
    typingSkills: "Hebrew",
    keyThemes: "Mysticism, Kabbalah, hidden meaning",
    element: "fire",
    unlocked: true,
    completed: false,
    progress: 0
  },
  {
    id: 6,
    title: "Forest of Sacred Sounds",
    subtitle: "Mantric Vibrations",
    language: "Sanskrit",
    focus: "Vowels, rhythm typing",
    typingSkills: "Sanskrit (Devanagari)",
    keyThemes: "Mantra, vibration, seed syllables",
    element: "earth",
    unlocked: true,
    completed: false,
    progress: 0
  },
  {
    id: 7,
    title: "The Crystal Pagoda",
    subtitle: "Image-Spells",
    language: "Chinese",
    focus: "Word accuracy & poetry",
    typingSkills: "Chinese (Hanzi)",
    keyThemes: "Characters as image-spells, history in glyphs",
    element: "water",
    unlocked: true,
    completed: false,
    progress: 0
  },
  {
    id: 8,
    title: "Mountain of Echoes",
    subtitle: "Dual Systems",
    language: "Japanese",
    focus: "Complex key combos",
    typingSkills: "Japanese (Kana/Kanji)",
    keyThemes: "Dual writing systems, meaning vs sound",
    element: "air",
    unlocked: true,
    completed: false,
    progress: 0
  },
  {
    id: 9,
    title: "Mirror of the Hangeul Gate",
    subtitle: "Logical Harmony",
    language: "Korean",
    focus: "Reflex training & short forms",
    typingSkills: "Korean (Hangeul)",
    keyThemes: "Logical glyph building, harmony",
    element: "water",
    unlocked: true,
    completed: false,
    progress: 0
  },
  {
    id: 10,
    title: "Northern Flame and the Iron Ink",
    subtitle: "Revolutionary Script",
    language: "Russian",
    focus: "Paragraph drills",
    typingSkills: "Russian (Cyrillic)",
    keyThemes: "Strength, endurance, revolutionary script",
    element: "fire",
    unlocked: true,
    completed: false,
    progress: 0
  },
  {
    id: 11,
    title: "Glyphstorm of the Ancients",
    subtitle: "Cosmic Patterns",
    language: "Egyptian + Mayan",
    focus: "Story typing, timed tests",
    typingSkills: "Egyptian + Mayan (symbolic systems)",
    keyThemes: "Time, myth, cosmic patterns",
    element: "chaos",
    unlocked: true,
    completed: false,
    progress: 0
  },
  {
    id: 12,
    title: "The Grand Library of Garu",
    subtitle: "Master Scribe",
    language: "All Languages",
    focus: "Final test & free scribing",
    typingSkills: "Multilingual challenge",
    keyThemes: "Choose your Element, Earn your Egg",
    element: "ether",
    unlocked: true,
    completed: false,
    progress: 0
  }
];

const elementColors = {
  earth: "bg-green-600",
  fire: "bg-red-600", 
  water: "bg-blue-600",
  air: "bg-purple-600",
  chaos: "bg-orange-600",
  ether: "bg-pink-600"
};

const elementIcons = {
  earth: "🌍",
  fire: "🔥",
  water: "🌊", 
  air: "💨",
  chaos: "⚡",
  ether: "✨"
};

export default function TypingAdventure() {
  const [, setLocation] = useLocation();
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);
  const [completedChapters, setCompletedChapters] = useState<number[]>([]);
  const { toast } = useToast();
  
  const { data: profile } = useQuery({
    queryKey: ["/api/profile"]
  });

  // Load progress from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('typing-adventure-progress');
    if (saved) {
      try {
        const progress = JSON.parse(saved);
        setCompletedChapters(progress.completedChapters || []);
      } catch (error) {
        console.error('Failed to load progress:', error);
      }
    }
  }, []);

  // Save progress to localStorage
  const saveProgress = (chapterId: number) => {
    const newCompleted = [...completedChapters, chapterId];
    setCompletedChapters(newCompleted);
    localStorage.setItem('typing-adventure-progress', JSON.stringify({
      completedChapters: newCompleted,
      lastUpdated: new Date().toISOString()
    }));
  };

  // Save progress to profile
  const saveGameToProfile = async () => {
    try {
      const response = await fetch("/api/typing-adventure-progress", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          completedChapters,
          lastUpdated: new Date().toISOString()
        }),
      });

      if (response.ok) {
        toast({
          title: "Progress Saved",
          description: "Typing adventure progress saved to your profile successfully!"
        });
      } else {
        toast({
          title: "Save Failed",
          description: "Failed to save to profile. Progress saved locally only.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Save game error:", error);
      toast({
        title: "Save Error",
        description: "Error saving progress. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Load progress from profile
  const loadGameFromProfile = async () => {
    try {
      const response = await fetch("/api/typing-adventure-progress");
      
      if (response.ok) {
        const data = await response.json();
        if (data.completedChapters) {
          setCompletedChapters(data.completedChapters);
          localStorage.setItem('typing-adventure-progress', JSON.stringify({
            completedChapters: data.completedChapters,
            lastUpdated: data.lastUpdated || new Date().toISOString()
          }));
          toast({
            title: "Progress Loaded",
            description: "Typing adventure progress loaded from your profile!"
          });
        }
      } else {
        toast({
          title: "Load Failed",
          description: "No saved progress found on your profile.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Load game error:", error);
      toast({
        title: "Load Error",
        description: "Error loading progress. Please try again.",
        variant: "destructive"
      });
    }
  };

  const startChapter = (chapter: Chapter) => {
    if (!chapter.unlocked) return;
    setLocation(`/typing-adventure/${chapter.id}`);
  };

  const openWisdoms = (language: string) => {
    setLocation(`/wisdom?tradition=${language.toLowerCase()}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
            ⌨️ Learn to Type Adventure Quest ⌨️
          </h1>
          <p className="text-xl text-purple-200 mb-6">
            Master the Sacred Keys Through 12 Mystical Realms
          </p>
          <div className="flex items-center justify-center gap-4 text-purple-300">
            <ChickenAvatar 
              chickenType={profile?.chicken_type || 'white'}
              jockeyType={profile?.jockey_type || 'steve'}
              size="lg"
            />
            <div>
              <div className="text-lg font-semibold">{profile?.username || 'Scribe'}</div>
              <div className="text-sm">Total XP: {profile?.xp || 0}</div>
            </div>
          </div>
        </div>

        {/* Save/Load Controls */}
        <div className="flex justify-center gap-4 mb-8">
          <Button 
            onClick={saveGameToProfile}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2"
          >
            💾 Save Progress to Profile
          </Button>
          <Button 
            onClick={loadGameFromProfile}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2"
          >
            📁 Load Progress from Profile
          </Button>
        </div>

        {/* Chapter Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {chapters.map((chapter) => {
            const isCompleted = completedChapters.includes(chapter.id);
            const displayProgress = isCompleted ? 100 : chapter.progress;
            
            return (
              <Card 
                key={chapter.id} 
                className={`cursor-pointer transition-all duration-300 hover:scale-105 ${
                  chapter.unlocked 
                    ? `bg-gray-800 border-purple-500 hover:border-purple-400 ${isCompleted ? 'ring-2 ring-green-500' : ''}` 
                    : 'bg-gray-900 border-gray-700 opacity-50'
                }`}
                onClick={() => chapter.unlocked && startChapter(chapter)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between mb-2">
                    <Badge className={`${elementColors[chapter.element]} text-white`}>
                      {elementIcons[chapter.element]} {chapter.element}
                    </Badge>
                    <div className="flex items-center gap-2">
                      {isCompleted && <span className="text-green-400">✓</span>}
                      <span className="text-sm text-gray-400">Ch. {chapter.id}</span>
                    </div>
                  </div>
                  <CardTitle className="text-lg text-white">{chapter.title}</CardTitle>
                  <p className="text-sm text-purple-300">{chapter.subtitle}</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <span className="text-xs text-gray-400">Language:</span>
                      <p className="text-sm font-semibold text-yellow-400">{chapter.language}</p>
                    </div>
                    <div>
                      <span className="text-xs text-gray-400">Focus:</span>
                      <p className="text-xs text-gray-300">{chapter.focus}</p>
                    </div>
                    <div>
                      <span className="text-xs text-gray-400">Skills:</span>
                      <p className="text-xs text-gray-300">{chapter.typingSkills}</p>
                    </div>
                    
                    {chapter.unlocked && (
                      <div className="pt-2">
                        <div className="flex justify-between text-xs text-gray-400 mb-1">
                          <span>Progress</span>
                          <span className={isCompleted ? 'text-green-400 font-bold' : ''}>{displayProgress}%</span>
                        </div>
                        <Progress 
                          value={displayProgress} 
                          className={`h-2 ${isCompleted ? '[&>div]:bg-green-500' : ''}`} 
                        />
                      </div>
                    )}
                    
                    <div className="flex gap-2 pt-2">
                      {chapter.unlocked ? (
                        <>
                          <Button 
                            size="sm" 
                            className={`flex-1 ${isCompleted ? 'bg-green-600 hover:bg-green-700' : 'bg-purple-600 hover:bg-purple-700'}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              startChapter(chapter);
                            }}
                          >
                            {isCompleted ? 'Replay' : (displayProgress > 0 ? 'Continue' : 'Start')}
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="border-yellow-500 text-yellow-400 hover:bg-yellow-500 hover:text-black"
                            onClick={(e) => {
                              e.stopPropagation();
                              openWisdoms(chapter.language);
                            }}
                          >
                            📜 Wisdom
                          </Button>
                        </>
                      ) : (
                        <Button size="sm" disabled className="flex-1">
                          🔒 Locked
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Quick Access */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="bg-gray-800 border-purple-500">
            <CardHeader>
              <CardTitle className="text-yellow-400">🎯 Typing Test</CardTitle>
              <p className="text-sm text-gray-300">Test your current skill level</p>
            </CardHeader>
            <CardContent>
              <Button 
                className="w-full bg-purple-600 hover:bg-purple-700"
                onClick={() => setLocation('/practice')}
              >
                Take Diagnostic Test
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-blue-500">
            <CardHeader>
              <CardTitle className="text-blue-400">📚 Wisdom Texts</CardTitle>
              <p className="text-sm text-gray-300">Sacred texts from all traditions</p>
            </CardHeader>
            <CardContent>
              <Button 
                className="w-full bg-blue-600 hover:bg-blue-700"
                onClick={() => setLocation('/wisdom')}
              >
                Explore Wisdoms
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-green-500">
            <CardHeader>
              <CardTitle className="text-green-400">🏆 Your Progress</CardTitle>
              <p className="text-sm text-gray-300">Track your typing mastery</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Chapters Unlocked:</span>
                  <span className="text-green-400">1/12</span>
                </div>
                <div className="flex justify-between">
                  <span>Average WPM:</span>
                  <span className="text-blue-400">{profile?.avg_wpm || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Accuracy:</span>
                  <span className="text-purple-400">{profile?.accuracy || 0}%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}