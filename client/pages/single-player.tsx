import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { PixelButton } from "@/components/ui/pixel-button";
import { useToast } from "@/hooks/use-toast";

const SAMPLE_TEXTS = [
  "The quick brown fox jumps over the lazy dog.",
  "In a hole in the ground there lived a hobbit. Not a nasty, dirty, wet hole, filled with the ends of worms and an oozy smell, nor yet a dry, bare, sandy hole with nothing in it to sit down on or to eat: it was a hobbit-hole, and that means comfort.",
  "The Chicken Jockey Scribe Racer is the most exciting typing game you'll ever play!",
  "Practice your typing skills and race against opponents to become the ultimate Chicken Jockey champion."
];

export default function SinglePlayer() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [currentText, setCurrentText] = useState("");
  const [typedText, setTypedText] = useState("");
  const [timeLeft, setTimeLeft] = useState(60);
  const [isRacing, setIsRacing] = useState(false);
  const [wordsPerMinute, setWordsPerMinute] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [showResults, setShowResults] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [aiProgress, setAiProgress] = useState(0);
  const aiIntervalRef = useRef<number | null>(null);

  // Start the race with a random text
  const startRace = () => {
    const randomText = SAMPLE_TEXTS[Math.floor(Math.random() * SAMPLE_TEXTS.length)];
    setCurrentText(randomText);
    setTypedText("");
    setTimeLeft(60);
    setWordsPerMinute(0);
    setAccuracy(100);
    setShowResults(false);
    setAiProgress(0);
    
    // Start countdown
    setCountdown(3);
    
    // After countdown finishes, start the race
    setTimeout(() => {
      setCountdown(null);
      setIsRacing(true);
      
      // Start AI movement
      if (aiIntervalRef.current) {
        clearInterval(aiIntervalRef.current);
      }
      
      // AI moves at a relatively constant speed with small random variations
      aiIntervalRef.current = window.setInterval(() => {
        setAiProgress(prev => {
          // Random speed variations to make it more realistic
          const speedVariation = Math.random() * 0.7 + 0.5; // Between 0.5 and 1.2
          const newProgress = prev + (randomText.length / 300) * speedVariation;
          
          // Cap at 100%
          if (newProgress >= 100) {
            clearInterval(aiIntervalRef.current!);
            return 100;
          }
          
          return newProgress;
        });
      }, 100);
    }, 3000);
  };

  // Handle typing input
  const handleTyping = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (!isRacing) return;
    
    const value = e.target.value;
    setTypedText(value);
    
    // Calculate accuracy
    let correctChars = 0;
    let totalAttempted = 0;
    
    for (let i = 0; i < value.length; i++) {
      totalAttempted++;
      if (i < currentText.length && value[i] === currentText[i]) {
        correctChars++;
      }
    }
    
    // Update accuracy percentage
    const currentAccuracy = totalAttempted > 0 ? (correctChars / totalAttempted) * 100 : 100;
    setAccuracy(Math.round(currentAccuracy));
    
    // Update WPM in real-time
    const elapsedMinutes = (60 - timeLeft) / 60 || 0.01; // Avoid division by zero
    const words = value.length / 5; // Assume average word length of 5 characters
    setWordsPerMinute(Math.round(words / elapsedMinutes));
    
    // Check if race is complete
    if (value === currentText) {
      finishRace();
    }
  };

  // Timer for the race
  useEffect(() => {
    if (!isRacing) return;
    
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          finishRace();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [isRacing]);

  // Calculate WPM
  useEffect(() => {
    if (!isRacing) return;
    
    // Calculate words per minute (assuming average word length is 5 characters)
    const words = typedText.length / 5;
    const minutes = (60 - timeLeft) / 60;
    
    if (minutes > 0) {
      setWordsPerMinute(Math.round(words / minutes));
    }
  }, [typedText, timeLeft, isRacing]);

  // Finish the race
  const finishRace = () => {
    setIsRacing(false);
    setShowResults(true);
    
    // Show toast notification
    toast({
      title: "Race Complete!",
      description: `You typed at ${wordsPerMinute} WPM with ${accuracy}% accuracy.`,
    });
  };

  return (
    <div className="min-h-screen bg-dark text-white flex flex-col">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8 max-w-6xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-minecraft text-primary mb-2">SINGLE PLAYER RACE</h1>
          <p className="text-secondary">Practice your typing skills against the clock!</p>
        </div>

        <div className="bg-dark-800 p-6 rounded-lg pixel-border mb-8">
          {!isRacing && !showResults && countdown === null && (
            <div className="text-center">
              <p className="mb-6 text-secondary">Ready to test your typing skills?</p>
              <PixelButton onClick={startRace} className="mx-auto">
                START RACE
              </PixelButton>
            </div>
          )}

          {countdown !== null && (
            <div className="flex items-center justify-center h-48">
              <span className="text-6xl font-minecraft text-primary animate-pulse">
                {countdown}
              </span>
            </div>
          )}

          {isRacing && (
            <div>
              <div className="flex justify-between mb-4">
                <div>
                  <span className="text-secondary">Time Left: </span>
                  <span className="font-minecraft">{timeLeft}s</span>
                </div>
                <div>
                  <span className="text-secondary">WPM: </span>
                  <span className="font-minecraft">{wordsPerMinute}</span>
                </div>
                <div>
                  <span className="text-secondary">Accuracy: </span>
                  <span className="font-minecraft">{accuracy}%</span>
                </div>
              </div>
              
              <div className="mb-4">
                {/* Race Track */}
                <div className="w-full h-32 bg-amber-800 rounded-lg mb-4 relative overflow-hidden">
                  {/* Finish Line */}
                  <div className="absolute right-0 top-0 h-full w-4 bg-gradient-to-r from-amber-900 to-red-600 flex items-center justify-center">
                    <div className="h-full w-2 bg-white opacity-50"></div>
                  </div>
                  
                  {/* Player Racer */}
                  <div 
                    className="absolute top-5 h-16 transition-all duration-300 flex flex-col items-center"
                    style={{ left: `${Math.min((typedText.length / currentText.length) * 100, 100)}%` }}
                  >
                    <div className="w-16 h-16 bg-green-600 rounded-full relative flex items-center justify-center shadow-lg">
                      <div className="absolute w-8 h-8 bg-white rounded-full top-1 left-1 opacity-30"></div>
                      <span className="font-bold text-white">You</span>
                    </div>
                    <div className="h-1 w-full bg-green-400"></div>
                  </div>
                  
                  {/* AI Racer - moves based on aiProgress state */}
                  <div 
                    className="absolute top-16 h-16 transition-all duration-300 flex flex-col items-center"
                    style={{ left: `${Math.min(aiProgress, 100)}%` }}
                  >
                    <div className="w-16 h-16 bg-red-600 rounded-full relative flex items-center justify-center shadow-lg">
                      <div className="absolute w-8 h-8 bg-white rounded-full top-1 left-1 opacity-30"></div>
                      <span className="font-bold text-white">NPC</span>
                    </div>
                    <div className="h-1 w-full bg-red-400"></div>
                  </div>
                </div>
                
                {/* Text to Type */}
                <div className="p-4 bg-dark-900 rounded-lg text-lg whitespace-pre-wrap text-gray-300" style={{ fontFamily: "Inter, sans-serif" }}>
                  {currentText.split('').map((char, index) => {
                    let colorClass = "";
                    
                    if (index < typedText.length) {
                      colorClass = typedText[index] === char ? "text-green-500" : "text-red-500";
                    }
                    
                    return (
                      <span key={index} className={colorClass || "text-gray-300"}>
                        {char}
                      </span>
                    );
                  })}
                </div>
              </div>
              
              <textarea
                className="w-full p-4 bg-dark-700 rounded-lg text-white resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                value={typedText}
                onChange={handleTyping}
                placeholder="Start typing here..."
                rows={4}
                autoFocus
                style={{ fontFamily: "Inter, sans-serif" }}
              />
            </div>
          )}

          {showResults && (
            <div className="text-center">
              <h2 className="text-2xl font-minecraft text-primary mb-4">RACE RESULTS</h2>
              
              <div className="bg-dark-900 p-6 rounded-lg mb-6">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-secondary text-sm">TYPING SPEED</p>
                    <p className="text-white text-2xl font-minecraft">{wordsPerMinute} WPM</p>
                  </div>
                  <div>
                    <p className="text-secondary text-sm">ACCURACY</p>
                    <p className="text-white text-2xl font-minecraft">{accuracy}%</p>
                  </div>
                  <div>
                    <p className="text-secondary text-sm">CHARACTERS</p>
                    <p className="text-white text-2xl font-minecraft">{typedText.length}</p>
                  </div>
                  <div>
                    <p className="text-secondary text-sm">TIME</p>
                    <p className="text-white text-2xl font-minecraft">{60 - timeLeft}s</p>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-4 justify-center">
                <PixelButton onClick={() => {
                  setShowResults(false);
                  setTypedText('');
                  setTimeLeft(60);
                  setStartTime(null);
                  setWordsPerMinute(0);
                  setAccuracy(100);
                  startRace();
                }}>
                  RACE AGAIN
                </PixelButton>
                <PixelButton onClick={() => setLocation('/race')} variant="outline">
                  BACK TO MENU
                </PixelButton>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}