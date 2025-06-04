import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'wouter';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { SocialShare } from '@/components/social-share';
import { IslamicReverence, QuranVerse, HadithText } from '@/components/islamic-reverence';
import { IslamicInputGuide } from '@/components/islamic-input-guide';

interface WisdomText {
  id: number;
  language: string;
  original: string;
  translation?: string;
  source: string;
  reflection: string;
  element: string;
  phonetics?: string;
}

const wisdomTexts: WisdomText[] = [
  {
    id: 1,
    language: "English",
    original: "In the beginning was the Word, and the Word was with God, and the Word was God.",
    source: "John 1:1 (King James Bible)",
    reflection: "Power of language, creation through speech",
    element: "earth"
  },
  {
    id: 2,
    language: "Latin", 
    original: "Verba volant, scripta manent.",
    translation: "Spoken words fly away, written words remain.",
    source: "Classical Latin Proverb",
    reflection: "The permanence of writing",
    element: "earth"
  },
  {
    id: 3,
    language: "Aramaic",
    original: "Abun d'bashmaya, nethqadash shmokh...",
    translation: "Our Father who art in heaven, hallowed be thy name...",
    source: "Peshitta / Lord's Prayer",
    reflection: "Sacred utterance and lineage",
    element: "air",
    phonetics: "AH-boon d'bash-MY-ah, neth-KAH-dash SHMOKH"
  },
  {
    id: 4,
    language: "Arabic",
    original: "اقرأ باسم ربك الذي خلق",
    translation: "Read in the name of your Lord who created",
    source: "Qur'an, Surah Al-'Alaq (96:1)",
    reflection: "Reading as divine act - the first revelation to Prophet Muhammad ﷺ",
    element: "fire",
    phonetics: "IQ-ra bis-mi rab-bi-ka al-la-DHI kha-laq"
  },
  {
    id: 15,
    language: "Arabic",
    original: "وما أرسلناك إلا رحمة للعالمين",
    translation: "And We have not sent you except as a mercy to the worlds",
    source: "Qur'an, Surah Al-Anbiya (21:107)",
    reflection: "The universal mercy of Prophet Muhammad ﷺ to all creation",
    element: "water",
    phonetics: "wa-ma ar-sal-NA-ka il-la rah-ma-tan lil-'a-la-MEEN"
  },
  {
    id: 16,
    language: "Arabic", 
    original: "لقد كان لكم في رسول الله أسوة حسنة",
    translation: "Indeed in the Messenger of Allah you have a good example",
    source: "Qur'an, Surah Al-Ahzab (33:21)",
    reflection: "Following the noble character of Prophet Muhammad ﷺ",
    element: "earth",
    phonetics: "la-qad ka-na la-kum fee ra-SOOL il-LAH us-wa-tun ha-SA-na"
  },
  {
    id: 17,
    language: "Arabic",
    original: "إن الله جميل يحب الجمال",
    translation: "Verily, Allah is beautiful and He loves beauty",
    source: "Hadith - Sahih Muslim, narrated by Abdullah ibn Mas'ud",
    reflection: "The Prophet Muhammad ﷺ taught that Allah appreciates excellence and beauty in all things",
    element: "ether",
    phonetics: "in-na ALLAH ja-MEEL yu-hib-bu al-ja-MAAL"
  },
  {
    id: 18,
    language: "Arabic",
    original: "طلب العلم فريضة على كل مسلم",
    translation: "Seeking knowledge is an obligation upon every Muslim",
    source: "Hadith - Sunan Ibn Majah, narrated by Anas ibn Malik",
    reflection: "The Prophet Muhammad ﷺ emphasized learning as a sacred duty",
    element: "air",
    phonetics: "TA-lab al-'ilm fa-REE-da 'a-la kul-li MUS-lim"
  },
  {
    id: 5,
    language: "Hebrew",
    original: "בראשית ברא אלהים את השמים ואת הארץ",
    translation: "In the beginning God created the heavens and the earth",
    source: "Genesis 1:1 (Torah)",
    reflection: "Letters as living entities",
    element: "fire",
    phonetics: "be-re-SHEET ba-RA e-lo-HEEM et ha-sha-MA-yim ve-et ha-A-retz"
  },
  {
    id: 6,
    language: "Sanskrit",
    original: "ॐ भूर्भुवः स्वः तत्सवितुर्वरेण्यं भर्गो देवस्य धीमहि धियो यो नः प्रचोदयात्",
    translation: "Om, earth, atmosphere, heaven. We meditate on the glory of that Being who has produced this universe; may He enlighten our minds.",
    source: "Gayatri Mantra (Rig Veda)",
    reflection: "Sound as spiritual energy",
    element: "earth",
    phonetics: "OM bhur BHU-vah SVAH tat sa-vi-TUR va-ren-YAM"
  },
  {
    id: 7,
    language: "Chinese",
    original: "道可道，非常道。名可名，非常名。",
    translation: "The Tao that can be spoken is not the eternal Tao. The name that can be named is not the eternal name.",
    source: "Tao Te Ching, Chapter 1",
    reflection: "Silence, paradox, flow",
    element: "water",
    phonetics: "dao ke dao, fei chang dao. ming ke ming, fei chang ming."
  },
  {
    id: 8,
    language: "Japanese",
    original: "悟りは不図来る",
    translation: "Satori wa futo kuru - Enlightenment comes suddenly",
    source: "Buddhist wisdom",
    reflection: "Simplicity, clarity",
    element: "air",
    phonetics: "sa-TO-ri wa FU-to ku-ru"
  },
  {
    id: 9,
    language: "Korean",
    original: "훈민정음",
    translation: "The proper sounds for instructing the people",
    source: "Hunminjeongeum (Hangeul Proclamation)",
    reflection: "Accessibility of knowledge",
    element: "water",
    phonetics: "hun-min-jeong-eum"
  },
  {
    id: 10,
    language: "Russian",
    original: "Красота спасет мир",
    translation: "Beauty will save the world",
    source: "Fyodor Dostoevsky",
    reflection: "Moral power of aesthetics",
    element: "fire",
    phonetics: "kra-so-TA spa-SYOT mir"
  },
  {
    id: 11,
    language: "Egyptian",
    original: "𓈖𓏏𓂋 𓇳 𓈖 𓊪𓏏𓍯",
    translation: "The heart of Ra is satisfied",
    source: "Book of the Dead",
    reflection: "Visual storytelling, cosmic literacy",
    element: "chaos",
    phonetics: "nejer Ra en pet"
  },
  {
    id: 12,
    language: "All Languages",
    original: "May wisdom flow through all scripts, may understanding bridge all tongues, may the sacred art of writing unite all peoples in the eternal dance of knowledge.",
    source: "The Scribe's Blessing",
    reflection: "Unity, the global scribe's responsibility",
    element: "ether"
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

export default function Wisdom() {
  const [selectedWisdom, setSelectedWisdom] = useState<WisdomText | null>(null);
  const [userInput, setUserInput] = useState('');
  const [reflection, setReflection] = useState('');
  const [isTypingComplete, setIsTypingComplete] = useState(false);
  const [accuracy, setAccuracy] = useState(100);
  const [reflectionTimer, setReflectionTimer] = useState(60);
  const [showReflection, setShowReflection] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  // Get query params for tradition filtering
  const searchParams = new URLSearchParams(window.location.search);
  const traditionFilter = searchParams.get('tradition');

  const filteredWisdoms = traditionFilter 
    ? wisdomTexts.filter(w => w.language.toLowerCase().includes(traditionFilter))
    : wisdomTexts;

  useEffect(() => {
    if (selectedWisdom && userInput) {
      let correct = 0;
      for (let i = 0; i < userInput.length; i++) {
        if (userInput[i] === selectedWisdom.original[i]) {
          correct++;
        }
      }
      const currentAccuracy = userInput.length > 0 ? (correct / userInput.length) * 100 : 100;
      setAccuracy(Math.round(currentAccuracy));

      if (userInput === selectedWisdom.original) {
        setIsTypingComplete(true);
        setShowReflection(true);
        toast({
          title: "Sacred Text Transcribed!",
          description: `You have channeled the wisdom of ${selectedWisdom.language}`
        });
      }
    }
  }, [userInput, selectedWisdom, toast]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (showReflection && reflectionTimer > 0) {
      timer = setTimeout(() => {
        setReflectionTimer(reflectionTimer - 1);
      }, 1000);
    }
    return () => clearTimeout(timer);
  }, [showReflection, reflectionTimer]);

  const completeWisdom = () => {
    toast({
      title: "Wisdom Complete!",
      description: "Your reflection has been recorded in the cosmic library."
    });
    setSelectedWisdom(null);
    setUserInput('');
    setReflection('');
    setIsTypingComplete(false);
    setShowReflection(false);
    setReflectionTimer(60);
    setAccuracy(100);
  };

  if (selectedWisdom) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 to-indigo-900 text-white">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          {/* Emergency escape button */}
          <div className="mb-4 text-center">
            <Button 
              onClick={() => setLocation('/typing-adventure')}
              className="bg-red-600 hover:bg-red-700 text-white font-bold px-8 py-3"
              size="lg"
            >
              ← RETURN TO QUEST HUB
            </Button>
          </div>
          <Card className="bg-gray-800 border-yellow-500">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl text-yellow-400 flex items-center justify-center gap-2">
                📜 Wisdom of {selectedWisdom.language}
                <Badge className={`${elementColors[selectedWisdom.element as keyof typeof elementColors]} text-white`}>
                  {elementIcons[selectedWisdom.element as keyof typeof elementIcons]} {selectedWisdom.element}
                </Badge>
              </CardTitle>
              <p className="text-purple-300">{selectedWisdom.reflection}</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-gray-900 rounded-lg p-6 border border-yellow-500/30">
                <h3 className="text-lg font-semibold text-yellow-400 mb-3">Sacred Text</h3>
                <div className="text-xl text-white leading-relaxed italic text-center mb-4">
                  "{selectedWisdom.original}"
                </div>
                {selectedWisdom.phonetics && (
                  <div className="text-sm text-blue-300 text-center mb-2">
                    Phonetics: {selectedWisdom.phonetics}
                  </div>
                )}
                {selectedWisdom.translation && (
                  <div className="text-sm text-gray-300 text-center mb-4">
                    Translation: "{selectedWisdom.translation}"
                  </div>
                )}
                <p className="text-sm text-gray-400 text-center">
                  — {selectedWisdom.source}
                </p>
              </div>
              
              {!showReflection ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-purple-300">
                      Type the sacred text to unlock its wisdom:
                    </h3>
                    {selectedWisdom.language === 'Arabic' && (
                      <IslamicInputGuide className="ml-4" />
                    )}
                  </div>
                  
                  {/* Visual typing guide */}
                  <div className="bg-gray-900 rounded-lg p-4 border border-purple-500/30">
                    <div className="text-lg leading-relaxed font-mono">
                      {selectedWisdom.original.split('').map((char, index) => {
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
                  
                  <Textarea
                    ref={textareaRef}
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    placeholder="Begin typing the sacred text..."
                    className="min-h-32 bg-gray-900 border-purple-500 text-white text-lg font-mono"
                  />
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="text-center">
                      <span className="text-gray-400">Accuracy:</span>
                      <div className="text-2xl font-bold text-green-400">{accuracy}%</div>
                    </div>
                    <div className="text-center">
                      <span className="text-gray-400">Progress:</span>
                      <div className="text-2xl font-bold text-blue-400">
                        {Math.min(100, Math.round((userInput.length / selectedWisdom.original.length) * 100))}%
                      </div>
                    </div>
                  </div>
                  
                  <Progress 
                    value={Math.min(100, (userInput.length / selectedWisdom.original.length) * 100)} 
                    className="h-3"
                  />
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-green-900/30 border border-green-500 rounded-lg p-4">
                    <h3 className="text-green-400 font-semibold mb-2">Sacred Text Transcribed!</h3>
                    <p className="text-green-200">
                      You have successfully channeled the sacred words. Now reflect on their meaning.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-purple-300 font-semibold mb-2 flex items-center gap-2">
                      Your Reflection
                      {reflectionTimer > 0 && (
                        <Badge variant="outline" className="border-purple-400 text-purple-300">
                          {reflectionTimer}s
                        </Badge>
                      )}
                    </h3>
                    <Textarea
                      value={reflection}
                      onChange={(e) => setReflection(e.target.value)}
                      placeholder="What insights did this sacred text reveal to you? How does it speak to your journey as a scribe?"
                      className="min-h-32 bg-gray-900 border-purple-500 text-white"
                    />
                  </div>
                  
                  <div className="flex gap-4">
                    <Button 
                      variant="outline"
                      onClick={() => setLocation('/typing-adventure')}
                      className="flex-1 border-gray-500"
                    >
                      Return to Quest Hub
                    </Button>
                    <Button 
                      onClick={completeWisdom}
                      className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                      disabled={!reflection.trim()}
                    >
                      Complete & Continue
                    </Button>
                  </div>
                </div>
              )}

              <div className="flex gap-4">
                <Button 
                  variant="outline" 
                  onClick={() => setSelectedWisdom(null)}
                  className="border-gray-500"
                >
                  Back to Library
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
            📜 Sacred Wisdom Library 📜
          </h1>
          <p className="text-xl text-purple-200 mb-6">
            Twelve Sacred Texts from the World's Great Traditions
          </p>
          <p className="text-gray-300">
            Each sacred text holds ancient wisdom. Type it carefully, reflect deeply, and expand your understanding.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {filteredWisdoms.map((wisdom) => (
            <Card 
              key={wisdom.id}
              className="cursor-pointer transition-all duration-300 hover:scale-105 bg-gray-800 border-purple-500 hover:border-purple-400"
              onClick={() => setSelectedWisdom(wisdom)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between mb-2">
                  <Badge className={`${elementColors[wisdom.element as keyof typeof elementColors]} text-white`}>
                    {elementIcons[wisdom.element as keyof typeof elementIcons]} {wisdom.element}
                  </Badge>
                  <span className="text-sm text-gray-400">{wisdom.language}</span>
                </div>
                <CardTitle className="text-lg text-white">{wisdom.source}</CardTitle>
                <p className="text-sm text-purple-300">{wisdom.reflection}</p>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-900 rounded p-3 mb-4">
                  <p className="text-sm text-white italic line-clamp-3">
                    "{wisdom.original}"
                  </p>
                  {wisdom.translation && (
                    <p className="text-xs text-gray-400 mt-2">
                      {wisdom.translation}
                    </p>
                  )}
                </div>
                <Button className="w-full bg-purple-600 hover:bg-purple-700">
                  Transcribe Sacred Text
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <Button 
            onClick={() => setLocation('/typing-adventure')}
            variant="outline"
            className="border-purple-500 text-purple-400 hover:bg-purple-500 hover:text-white"
          >
            Return to Typing Adventure
          </Button>
        </div>
      </div>
    </div>
  );
}