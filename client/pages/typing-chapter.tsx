import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'wouter';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

interface TypingExercise {
  id: number;
  title: string;
  instruction: string;
  text: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  focus: string[];
}

const chapterData = {
  1: {
    title: "The Home Row Awakening",
    subtitle: "Keys as Spells",
    language: "English",
    description: "Master the foundation of all typing - the home row keys. Each keystroke channels the power of language itself.",
    element: "earth",
    exercises: [
      {
        id: 1,
        title: "The Sacred Foundation",
        instruction: "Place your fingers on the home row: A S D F (left hand) and J K L ; (right hand). Type each letter slowly and deliberately.",
        text: "asdf jkl; asdf jkl; asdf jkl; fff jjj fff jjj ddd kkk ddd kkk sss lll sss lll aaa ;;; aaa ;;;",
        difficulty: 'beginner' as const,
        focus: ['home-row', 'finger-placement']
      },
      {
        id: 2,
        title: "Binding the Elements",
        instruction: "Combine the home row letters into simple words. Feel the magic flow through your fingertips.",
        text: "ask sad lad fall jak salk flask dadask lad fall jak flask ask sad fall jak flask",
        difficulty: 'beginner' as const,
        focus: ['word-formation', 'rhythm']
      },
      {
        id: 3,
        title: "The First Incantation",
        instruction: "Type this mystical phrase that channels the power of creation through words.",
        text: "In the beginning was the Word, and the Word was with the scribes, and the Word was sacred. Through keys and letters, wisdom flows like ancient streams.",
        difficulty: 'intermediate' as const,
        focus: ['sentences', 'punctuation', 'capitalization']
      }
    ],
    wisdomText: {
      original: "In the beginning was the Word, and the Word was with God, and the Word was God.",
      source: "John 1:1 (King James Bible)",
      reflection: "Power of language, creation through speech"
    }
  },
  2: {
    title: "The Tower of Typographic Time",
    subtitle: "Ancient Roots",
    language: "Latin",
    description: "Explore the foundation of Western writing through Latin roots and classical phrases.",
    element: "earth",
    exercises: [
      {
        id: 1,
        title: "Ancient Letters",
        instruction: "Type these Latin characters and feel the weight of history in each keystroke.",
        text: "a e i o u b c d f g h j k l m n p q r s t v w x y z",
        difficulty: 'beginner' as const,
        focus: ['alphabet', 'classical-letters']
      },
      {
        id: 2,
        title: "Sacred Roots",
        instruction: "Master these fundamental Latin root words that form the basis of many English words.",
        text: "aqua terra ignis aer lux nox vita mors amor dolor sapientia veritas",
        difficulty: 'intermediate' as const,
        focus: ['latin-roots', 'vocabulary']
      },
      {
        id: 3,
        title: "The Eternal Phrase",
        instruction: "Type this timeless Latin wisdom about the permanence of written words.",
        text: "Verba volant, scripta manent. Spoken words fly away, written words remain eternal.",
        difficulty: 'advanced' as const,
        focus: ['classical-phrases', 'translation']
      }
    ],
    wisdomText: {
      original: "Verba volant, scripta manent.",
      source: "Classical Latin Proverb",
      reflection: "The permanence of writing"
    }
  },
  3: {
    title: "Scrolls of the Sandstone Shrine",
    subtitle: "Sacred Lineage",
    language: "Aramaic",
    description: "Enter the ancient Aramaic tradition and learn the language Jesus spoke.",
    element: "air",
    exercises: [
      {
        id: 1,
        title: "Sacred Alphabet",
        instruction: "Master the Aramaic letters that carried sacred words across centuries.",
        text: "Alap Bet Gamal Dalat He Waw Zayn Het Tet Yod Kap Lamad Mem Nun",
        difficulty: 'beginner' as const,
        focus: ['aramaic-alphabet', 'sacred-letters']
      },
      {
        id: 2,
        title: "Ancient Prayer Words",
        instruction: "Type these foundational Aramaic words from ancient prayers.",
        text: "Abba melka shamaya arqa lahma yoma hayye tubana",
        difficulty: 'intermediate' as const,
        focus: ['aramaic-vocabulary', 'prayer-language']
      },
      {
        id: 3,
        title: "The Lord's Prayer Opening",
        instruction: "Type the opening of the Lord's Prayer in the language Jesus spoke.",
        text: "Abun d'bashmaya, nethqadash shmokh, tethe malkuthokh",
        difficulty: 'advanced' as const,
        focus: ['aramaic-phrases', 'sacred-text']
      }
    ],
    wisdomText: {
      original: "Abun d'bashmaya, nethqadash shmokh",
      source: "Lord's Prayer in Aramaic (Peshitta)",
      reflection: "Sacred utterance and lineage"
    }
  },
  4: {
    title: "Desert Winds and the Dotted Word",
    subtitle: "Divine Calligraphy",
    language: "Arabic",
    description: "Journey through the flowing Arabic script and experience divine calligraphy.",
    element: "fire",
    exercises: [
      {
        id: 1,
        title: "Sacred Calligraphy",
        instruction: "Learn the beautiful flowing letters of Arabic script.",
        text: "alif ba ta tha jim ha kha dal dhal ra zay sin shin",
        difficulty: 'beginner' as const,
        focus: ['arabic-alphabet', 'calligraphy']
      },
      {
        id: 2,
        title: "Divine Names",
        instruction: "Type these sacred Arabic words with reverence and care.",
        text: "bismillah rahman rahim allah subhan taala baraka",
        difficulty: 'intermediate' as const,
        focus: ['arabic-phrases', 'sacred-words']
      },
      {
        id: 3,
        title: "The First Revelation",
        instruction: "Type the opening words of the first Quranic revelation.",
        text: "Iqra bismi rabbika alladhi khalaq - Read in the name of your Lord who created",
        difficulty: 'advanced' as const,
        focus: ['quranic-text', 'revelation']
      }
    ],
    wisdomText: {
      original: "اقرأ باسم ربك الذي خلق",
      source: "Surah Al-'Alaq (Quran 96:1)",
      reflection: "Reading as divine act"
    }
  },
  5: {
    title: "Flame Letters of the Living Light",
    subtitle: "Mystical Script",
    language: "Hebrew",
    description: "Discover the mystical Hebrew letters and their hidden meanings.",
    element: "fire",
    exercises: [
      {
        id: 1,
        title: "Letters of Fire",
        instruction: "Type the Hebrew alphabet, each letter a flame of divine light.",
        text: "alef bet gimel dalet he vav zayin het tet yod kaf lamed mem nun",
        difficulty: 'beginner' as const,
        focus: ['hebrew-alphabet', 'mystical-letters']
      },
      {
        id: 2,
        title: "Sacred Names",
        instruction: "Type these holy Hebrew words with deep reverence.",
        text: "baruch hashem elohim shalom torah kadosh chokhmah",
        difficulty: 'intermediate' as const,
        focus: ['hebrew-vocabulary', 'sacred-names']
      },
      {
        id: 3,
        title: "Genesis Opening",
        instruction: "Type the opening words of creation from the Hebrew Bible.",
        text: "B'reishit bara Elohim et hashamayim v'et ha'aretz",
        difficulty: 'advanced' as const,
        focus: ['biblical-hebrew', 'creation-text']
      }
    ],
    wisdomText: {
      original: "בראשית ברא אלהים את השמים ואת הארץ",
      source: "Genesis 1:1 (Hebrew Bible)",
      reflection: "Letters as living entities"
    }
  },
  6: {
    title: "Forest of Sacred Sounds",
    subtitle: "Mantric Vibrations",
    language: "Sanskrit",
    description: "Enter the Sanskrit tradition and experience the power of mantric vibrations.",
    element: "water",
    exercises: [
      {
        id: 1,
        title: "Devanagari Script",
        instruction: "Master the divine script that carries ancient wisdom.",
        text: "a aa i ii u uu e ai o au ka kha ga gha cha chha ja jha",
        difficulty: 'beginner' as const,
        focus: ['devanagari-alphabet', 'sacred-script']
      },
      {
        id: 2,
        title: "Sacred Mantras",
        instruction: "Type these powerful Sanskrit mantras with focused intention.",
        text: "om namah shivaya gayatri mantra satyam shivam sundaram",
        difficulty: 'intermediate' as const,
        focus: ['sanskrit-mantras', 'spiritual-words']
      },
      {
        id: 3,
        title: "Gayatri Mantra",
        instruction: "Type the most sacred of all Sanskrit mantras.",
        text: "Om bhur bhuvah svah tat savitur varenyam bhargo devasya dhimahi dhiyo yo nah prachodayat",
        difficulty: 'advanced' as const,
        focus: ['gayatri-mantra', 'vedic-chanting']
      }
    ],
    wisdomText: {
      original: "ॐ भूर्भुवः स्वः तत्सवितुर्वरेण्यं भर्गो देवस्य धीमहि धियो यो नः प्रचोदयात्",
      source: "Gayatri Mantra (Rig Veda)",
      reflection: "Sound as spiritual energy"
    }
  },
  7: {
    title: "The Crystal Pagoda",
    subtitle: "Image-Spells",
    language: "Chinese",
    description: "Experience Chinese characters as image-spells carrying millennia of wisdom.",
    element: "earth",
    exercises: [
      {
        id: 1,
        title: "Fundamental Characters",
        instruction: "Learn these basic Chinese characters that form the foundation of the language.",
        text: "yi er san si wu liu qi ba jiu shi ren da xiao shan shui",
        difficulty: 'beginner' as const,
        focus: ['basic-hanzi', 'fundamental-characters']
      },
      {
        id: 2,
        title: "Wisdom Characters",
        instruction: "Type these characters that represent profound concepts.",
        text: "dao de zhi hui ren yi li he ping jing xin shen tian di",
        difficulty: 'intermediate' as const,
        focus: ['wisdom-characters', 'philosophical-concepts']
      },
      {
        id: 3,
        title: "Tao Te Ching Opening",
        instruction: "Type the immortal opening lines of the Tao Te Ching.",
        text: "Dao ke dao fei chang dao. Ming ke ming fei chang ming. The Tao that can be spoken is not the eternal Tao.",
        difficulty: 'advanced' as const,
        focus: ['classical-chinese', 'taoist-wisdom']
      }
    ],
    wisdomText: {
      original: "道可道，非常道。名可名，非常名。",
      source: "Tao Te Ching, Chapter 1 (Lao Tzu)",
      reflection: "Silence, paradox, flow"
    }
  },
  8: {
    title: "Mountain of Echoes",
    subtitle: "Dual Systems",
    language: "Japanese",
    description: "Navigate the dual writing systems of Japanese and find enlightenment in simplicity.",
    element: "air",
    exercises: [
      {
        id: 1,
        title: "Hiragana Flow",
        instruction: "Master the flowing hiragana syllabary.",
        text: "a i u e o ka ki ku ke ko sa shi su se so ta chi tsu te to",
        difficulty: 'beginner' as const,
        focus: ['hiragana', 'syllabary']
      },
      {
        id: 2,
        title: "Katakana Precision",
        instruction: "Practice the precise katakana characters.",
        text: "a i u e o ka ki ku ke ko sa shi su se so ta chi tsu te to",
        difficulty: 'intermediate' as const,
        focus: ['katakana', 'foreign-words']
      },
      {
        id: 3,
        title: "Zen Wisdom",
        instruction: "Type this profound Zen teaching about sudden enlightenment.",
        text: "Satori wa totsuzen kuru. Enlightenment comes suddenly like cherry blossoms in spring.",
        difficulty: 'advanced' as const,
        focus: ['kanji-hiragana-mix', 'zen-teaching']
      }
    ],
    wisdomText: {
      original: "悟りは突然来る",
      source: "Zen Buddhist Teaching",
      reflection: "Simplicity, clarity"
    }
  },
  9: {
    title: "Mirror of the Hangeul Gate",
    subtitle: "Logical Harmony",
    language: "Korean",
    description: "Experience the logical harmony of Korean script and its democratic ideals.",
    element: "water",
    exercises: [
      {
        id: 1,
        title: "Hangeul Harmony",
        instruction: "Learn the elegant Korean alphabet created for the people.",
        text: "ga na da ra ma ba sa a ja cha ka ta pa ha ya yeo yo yu",
        difficulty: 'beginner' as const,
        focus: ['hangeul-alphabet', 'korean-consonants-vowels']
      },
      {
        id: 2,
        title: "Democratic Script",
        instruction: "Type these Korean words that celebrate the accessibility of knowledge.",
        text: "hangeul baekseong jihye baeum jeongui pyeonghwa sarang huimang",
        difficulty: 'intermediate' as const,
        focus: ['korean-vocabulary', 'democratic-ideals']
      },
      {
        id: 3,
        title: "Hangeul Proclamation",
        instruction: "Type from the original proclamation of Hangeul creation.",
        text: "Hunminjeongeum - The proper sounds for instructing the people in their own language.",
        difficulty: 'advanced' as const,
        focus: ['classical-korean', 'historical-text']
      }
    ],
    wisdomText: {
      original: "훈민정음",
      source: "Hunminjeongeum (The Proper Sounds for Instructing the People)",
      reflection: "Accessibility of knowledge"
    }
  },
  10: {
    title: "Northern Flame and the Iron Ink",
    subtitle: "Revolutionary Script",
    language: "Russian",
    description: "Master the Cyrillic script and discover how beauty can save the world.",
    element: "fire",
    exercises: [
      {
        id: 1,
        title: "Cyrillic Foundation",
        instruction: "Learn the powerful Cyrillic alphabet born from Byzantine tradition.",
        text: "a be ve ge de ye zhe ze i ka el em en o pe er es te u ef kha",
        difficulty: 'beginner' as const,
        focus: ['cyrillic-alphabet', 'slavic-letters']
      },
      {
        id: 2,
        title: "Revolutionary Words",
        instruction: "Type these powerful Russian words that shaped history and literature.",
        text: "pravda mir svoboda krasota lyubov dusha narod revolyutsiya",
        difficulty: 'intermediate' as const,
        focus: ['russian-vocabulary', 'cultural-concepts']
      },
      {
        id: 3,
        title: "Dostoevsky's Vision",
        instruction: "Type this immortal line about beauty's power to transform the world.",
        text: "Krasota spaset mir. Beauty will save the world through truth and compassion.",
        difficulty: 'advanced' as const,
        focus: ['literary-russian', 'philosophical-statement']
      }
    ],
    wisdomText: {
      original: "Красота спасёт мир",
      source: "Fyodor Dostoevsky, The Idiot",
      reflection: "Moral power of aesthetics"
    }
  },
  11: {
    title: "Glyphstorm of the Ancients",
    subtitle: "Cosmic Patterns",
    language: "Egyptian + Mayan",
    description: "Decode the cosmic patterns of Egyptian hieroglyphs and Mayan glyphs.",
    element: "ether",
    exercises: [
      {
        id: 1,
        title: "Sacred Hieroglyphs",
        instruction: "Type these Egyptian hieroglyphic concepts and their meanings.",
        text: "Ra ankh heart water djed was scepter eye of horus ma'at feather",
        difficulty: 'beginner' as const,
        focus: ['hieroglyphs', 'egyptian-symbols']
      },
      {
        id: 2,
        title: "Mayan Day Signs",
        instruction: "Learn the Mayan day signs that measure cosmic time.",
        text: "Imix Ik Akbal Kan Chicchan Cimi Manik Lamat Muluc Oc Chuen Eb",
        difficulty: 'intermediate' as const,
        focus: ['mayan-calendar', 'day-signs']
      },
      {
        id: 3,
        title: "Heart Weighing Ceremony",
        instruction: "Type this description of the ancient Egyptian judgment of souls.",
        text: "The heart is weighed against the feather of Ma'at. Truth and justice measure the soul's worth in the eternal scales of cosmic balance.",
        difficulty: 'advanced' as const,
        focus: ['egyptian-mythology', 'cosmic-justice']
      }
    ],
    wisdomText: {
      original: "Heart = Feather (Hieroglyphic Balance)",
      source: "Egyptian Book of the Dead",
      reflection: "Visual storytelling, cosmic literacy"
    }
  },
  12: {
    title: "The Grand Library of Garu",
    subtitle: "Unity in Diversity",
    language: "All Languages",
    description: "Unite all languages in a final test of your mastery as a global scribe.",
    element: "all",
    exercises: [
      {
        id: 1,
        title: "Universal Greeting",
        instruction: "Type greetings from around the world, connecting all peoples.",
        text: "Hello Shalom Salaam Nihao Konnichiwa Annyeonghaseyo Zdravstvuyte Namaste",
        difficulty: 'beginner' as const,
        focus: ['multilingual', 'global-connection']
      },
      {
        id: 2,
        title: "Sacred Numbers",
        instruction: "Type the concept of 'one' in multiple ancient languages.",
        text: "One echad wahid yi hitotsu hana odin ek unum hen",
        difficulty: 'intermediate' as const,
        focus: ['numbers', 'unity-concept']
      },
      {
        id: 3,
        title: "Global Blessing",
        instruction: "Type this multilingual blessing that unites all scribing traditions.",
        text: "May the words we write bring peace to all peoples. Through diversity we grow, in unity we serve, by wisdom we transcend.",
        difficulty: 'advanced' as const,
        focus: ['multilingual-blessing', 'global-harmony']
      }
    ],
    wisdomText: {
      original: "In unity we write, through diversity we grow, by wisdom we serve all peoples.",
      source: "The Scribe's Creed (Original)",
      reflection: "Unity, the global scribe's responsibility"
    }
  }
};

interface TypingChapterProps {
  chapterId: string;
}

export default function TypingChapter({ chapterId }: TypingChapterProps) {
  const [, setLocation] = useLocation();
  const [currentExercise, setCurrentExercise] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [isComplete, setIsComplete] = useState(false);
  const [accuracy, setAccuracy] = useState(100);
  const [wpm, setWpm] = useState(0);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [showWisdom, setShowWisdom] = useState(false);
  const [wisdomReflection, setWisdomReflection] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();

  const chapter = chapterData[parseInt(chapterId) as keyof typeof chapterData];
  const exercise = chapter?.exercises[currentExercise];

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [currentExercise]);

  useEffect(() => {
    if (!exercise) return;
    
    if (userInput.length === 1 && !startTime) {
      setStartTime(new Date());
      setIsTyping(true);
    }

    // Calculate accuracy
    let correct = 0;
    for (let i = 0; i < userInput.length; i++) {
      if (userInput[i] === exercise.text[i]) {
        correct++;
      }
    }
    const currentAccuracy = userInput.length > 0 ? (correct / userInput.length) * 100 : 100;
    setAccuracy(Math.round(currentAccuracy));

    // Calculate WPM
    if (startTime && userInput.length > 0) {
      const timeElapsed = (new Date().getTime() - startTime.getTime()) / 1000 / 60; // minutes
      const wordsTyped = userInput.length / 5; // standard: 5 characters = 1 word
      const currentWpm = timeElapsed > 0 ? Math.round(wordsTyped / timeElapsed) : 0;
      setWpm(currentWpm);
    }

    // Check completion
    if (userInput === exercise.text) {
      setIsComplete(true);
      setIsTyping(false);
      toast({
        title: "Exercise Complete!",
        description: `${exercise.title} mastered with ${Math.round(currentAccuracy)}% accuracy!`
      });
    }
  }, [userInput, exercise, startTime, toast]);

  const nextExercise = () => {
    if (currentExercise < chapter.exercises.length - 1) {
      setCurrentExercise(currentExercise + 1);
      setUserInput('');
      setIsComplete(false);
      setStartTime(null);
      setAccuracy(100);
      setWpm(0);
      setIsTyping(false);
    } else {
      setShowWisdom(true);
    }
  };

  const completeChapter = async () => {
    try {
      // Calculate performance metrics
      const currentTime = Date.now();
      const totalTime = startTime ? currentTime - startTime.getTime() : 60000; // fallback to 1 minute
      const timeInSeconds = totalTime / 1000;
      const finalWpm = Math.round((userInput.length / 5) / (timeInSeconds / 60));
      const finalAccuracy = accuracy; // Use the accuracy state we're already tracking
      
      // Save progress to localStorage first
      const chapterIdNum = parseInt(chapterId);
      const saved = localStorage.getItem('typing-adventure-progress');
      
      interface ProgressData {
        completedChapters: number[];
        lastUpdated: string;
      }
      
      let progress: ProgressData = { 
        completedChapters: [], 
        lastUpdated: new Date().toISOString() 
      };
      
      if (saved) {
        try {
          const parsed = JSON.parse(saved) as ProgressData;
          if (parsed && Array.isArray(parsed.completedChapters)) {
            progress = parsed;
          }
        } catch (error) {
          console.error('Failed to parse saved progress:', error);
        }
      }
      
      // Add this chapter to completed if not already there
      if (!progress.completedChapters.includes(chapterIdNum)) {
        progress.completedChapters.push(chapterIdNum);
        progress.lastUpdated = new Date().toISOString();
        localStorage.setItem('typing-adventure-progress', JSON.stringify(progress));
      }
      
      // Call the API to post to Discord and save progress
      const response = await fetch('/api/typing-adventure/complete-chapter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chapterId: chapterIdNum,
          chapterTitle: chapter.title,
          language: chapter.language,
          wpm: finalWpm,
          accuracy: finalAccuracy,
          timeSpent: timeInSeconds,
          sacredText: chapter.wisdomText.original
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        // Save progress locally
        const currentProgress = JSON.parse(localStorage.getItem('typing-adventure-progress') || '{}');
        const completedChapters = currentProgress.completedChapters || [];
        if (!completedChapters.includes(parseInt(chapterId))) {
          completedChapters.push(parseInt(chapterId));
          localStorage.setItem('typing-adventure-progress', JSON.stringify({
            completedChapters,
            lastUpdated: new Date().toISOString()
          }));
        }
        
        toast({
          title: "Chapter Complete!",
          description: `${result.message} You earned ${result.xpEarned} XP! Posted to Discord as ${result.username}.`
        });
      } else {
        toast({
          title: "Chapter Complete!",
          description: `You mastered ${chapter.title}! Performance: ${finalWpm} WPM at ${finalAccuracy}% accuracy.`
        });
      }
    } catch (error) {
      console.error('Error completing chapter:', error);
      toast({
        title: "Chapter Complete!",
        description: `You have mastered ${chapter.title}!`
      });
    }
    
    setLocation('/typing-adventure');
  };

  if (!chapter) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 to-indigo-900 text-white flex items-center justify-center">
        <Card className="bg-gray-800 border-red-500">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold text-red-400 mb-4">Chapter Not Found</h2>
            <p className="text-gray-300 mb-4">This chapter is not yet available.</p>
            <Button onClick={() => setLocation('/typing-adventure')}>
              Return to Adventure Map
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (showWisdom) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 to-indigo-900 text-white">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <Card className="bg-gray-800 border-yellow-500">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl text-yellow-400">
                📜 Wisdom of {chapter.language}
              </CardTitle>
              <p className="text-purple-300">{chapter.wisdomText.reflection}</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-gray-900 rounded-lg p-6 border border-yellow-500/30">
                <h3 className="text-lg font-semibold text-yellow-400 mb-3">Sacred Text</h3>
                <p className="text-xl text-white leading-relaxed italic text-center">
                  "{chapter.wisdomText.original}"
                </p>
                <p className="text-sm text-gray-400 text-center mt-4">
                  — {chapter.wisdomText.source}
                </p>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-purple-300">
                  Type the wisdom text to complete this chapter:
                </h3>
                <Textarea
                  ref={textareaRef}
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  onPaste={(e) => {
                    e.preventDefault();
                    toast({
                      title: "Paste Disabled",
                      description: "You must type the text manually to practice properly!",
                      variant: "destructive",
                    });
                  }}
                  placeholder="Type the sacred text here..."
                  className="min-h-32 bg-gray-900 border-purple-500 text-white text-lg"
                />
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="text-center">
                    <span className="text-gray-400">Accuracy:</span>
                    <div className="text-2xl font-bold text-green-400">{accuracy}%</div>
                  </div>
                  <div className="text-center">
                    <span className="text-gray-400">Progress:</span>
                    <div className="text-2xl font-bold text-blue-400">
                      {Math.min(100, Math.round((userInput.length / chapter.wisdomText.original.length) * 100))}%
                    </div>
                  </div>
                </div>
                
                <Progress 
                  value={Math.min(100, (userInput.length / chapter.wisdomText.original.length) * 100)} 
                  className="h-3"
                />
              </div>

              {userInput === chapter.wisdomText.original && (
                <div className="space-y-4">
                  <div className="bg-green-900/30 border border-green-500 rounded-lg p-4">
                    <h3 className="text-green-400 font-semibold mb-2">Wisdom Transcribed!</h3>
                    <p className="text-green-200">
                      You have successfully channeled the sacred words. Now reflect on their meaning.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-purple-300 font-semibold mb-2">Your Reflection (60 seconds):</h3>
                    <Textarea
                      value={wisdomReflection}
                      onChange={(e) => setWisdomReflection(e.target.value)}
                      placeholder="What insights did this sacred text reveal to you?"
                      className="min-h-24 bg-gray-900 border-purple-500 text-white"
                    />
                  </div>
                  
                  <div className="space-y-3">
                    <Button 
                      onClick={completeChapter}
                      className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-lg py-3"
                    >
                      Complete Chapter & Return to Adventure
                    </Button>
                    <Button 
                      onClick={() => setLocation('/typing-adventure')}
                      className="w-full bg-gray-600 hover:bg-gray-700 text-white py-2"
                    >
                      Return to Quest Hub (Skip Completion)
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 to-indigo-900 text-white">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Navigation */}
        <div className="mb-4 text-center">
          <Button 
            onClick={() => setLocation('/typing-adventure')}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2"
          >
            ← Return to Quest Hub
          </Button>
        </div>
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-yellow-400 mb-2">{chapter.title}</h1>
          <p className="text-purple-300 text-lg">{chapter.subtitle}</p>
          <p className="text-gray-300 mt-4">{chapter.description}</p>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">
              Exercise {currentExercise + 1} of {chapter.exercises.length}
            </span>
            <Badge className="bg-purple-600">
              {chapter.language}
            </Badge>
          </div>
          <Progress value={((currentExercise + (isComplete ? 1 : 0)) / chapter.exercises.length) * 100} className="h-3" />
        </div>

        {/* Exercise */}
        <Card className="bg-gray-800 border-purple-500">
          <CardHeader>
            <CardTitle className="text-xl text-purple-300">{exercise.title}</CardTitle>
            <p className="text-gray-300">{exercise.instruction}</p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Target Text */}
            <div className="bg-gray-900 rounded-lg p-4 border border-purple-500/30">
              <h3 className="text-sm font-semibold text-purple-300 mb-2">Text to Type:</h3>
              <div className="text-lg leading-relaxed font-mono">
                {exercise.text.split('').map((char, index) => {
                  let className = 'text-gray-400';
                  if (index < userInput.length) {
                    className = userInput[index] === char ? 'text-green-400 bg-green-900/30' : 'text-red-400 bg-red-900/30';
                  } else if (index === userInput.length) {
                    className = 'text-white bg-purple-500';
                  }
                  return (
                    <span key={index} className={className}>
                      {char}
                    </span>
                  );
                })}
              </div>
            </div>

            {/* Input Area */}
            <div>
              <h3 className="text-sm font-semibold text-purple-300 mb-2">Your Typing:</h3>
              <Textarea
                ref={textareaRef}
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="Begin typing here..."
                className="min-h-32 bg-gray-900 border-purple-500 text-white text-lg font-mono"
                disabled={isComplete}
              />
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <span className="text-gray-400 text-sm">Accuracy</span>
                <div className="text-2xl font-bold text-green-400">{accuracy}%</div>
              </div>
              <div>
                <span className="text-gray-400 text-sm">WPM</span>
                <div className="text-2xl font-bold text-blue-400">{wpm}</div>
              </div>
              <div>
                <span className="text-gray-400 text-sm">Progress</span>
                <div className="text-2xl font-bold text-purple-400">
                  {Math.round((userInput.length / exercise.text.length) * 100)}%
                </div>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex gap-4">
              <Button 
                variant="outline" 
                onClick={() => setLocation('/typing-adventure')}
                className="border-gray-500"
              >
                Return to Map
              </Button>
              
              {isComplete && (
                <Button 
                  onClick={nextExercise}
                  className="flex-1 bg-purple-600 hover:bg-purple-700"
                >
                  {currentExercise < chapter.exercises.length - 1 ? 'Next Exercise' : 'Complete Chapter'}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}