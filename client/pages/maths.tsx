import { useEffect, useState, useRef } from "react";
import { useLocation } from "wouter";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PixelButton } from "@/components/ui/pixel-button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ChickenAvatar } from "@/components/ui/chicken-avatar";
import { Calculator, Clock, Trophy, Star, Zap, Target, BookOpen } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface MathProblem {
  id: number;
  question: string;
  answer: number;
  level: number;
  type: 'counting' | 'addition' | 'subtraction' | 'multiplication' | 'word_problem';
}

interface MathLevel {
  id: number;
  name: string;
  description: string;
  icon: string;
  color: string;
  difficulty: string;
  minAge: number;
  maxAge: number;
}

const mathLevels: MathLevel[] = [
  {
    id: 1,
    name: "COUNTING & NUMBERS",
    description: "Learn to type numbers 0-9 and basic counting",
    icon: "🔢",
    color: "from-green-900/80 to-green-800/80",
    difficulty: "Beginner",
    minAge: 5,
    maxAge: 6
  },
  {
    id: 2,
    name: "BASIC ADDITION & SUBTRACTION",
    description: "Simple math with single digits",
    icon: "➕",
    color: "from-blue-900/80 to-blue-800/80",
    difficulty: "Easy",
    minAge: 6,
    maxAge: 7
  },
  {
    id: 3,
    name: "DOUBLE DIGIT MATH",
    description: "Two-digit addition and subtraction",
    icon: "🔢",
    color: "from-yellow-900/80 to-yellow-800/80",
    difficulty: "Medium",
    minAge: 7,
    maxAge: 8
  },
  {
    id: 4,
    name: "MATH WORD SPELLS",
    description: "Word problems combining reading and math",
    icon: "📚",
    color: "from-red-900/80 to-red-800/80",
    difficulty: "Advanced",
    minAge: 8,
    maxAge: 9
  },
  {
    id: 5,
    name: "MULTIPLICATION MASTERY",
    description: "Times tables and multiplication challenges",
    icon: "✖️",
    color: "from-purple-900/80 to-purple-800/80",
    difficulty: "Expert",
    minAge: 9,
    maxAge: 10
  }
];

const sampleRaceTitles = [
  "Counting Coins with Chalisa",
  "Matikah's Market Math",
  "Auto's Treasure Tokens",
  "Timaru's Multiplication Maze",
  "Steve's Subtraction Swamp"
];

export default function MathsPage() {
  const [, setLocation] = useLocation();
  const [selectedLevel, setSelectedLevel] = useState<MathLevel | null>(null);
  const [currentProblem, setCurrentProblem] = useState<MathProblem | null>(null);
  const [userAnswer, setUserAnswer] = useState("");
  const [isRacing, setIsRacing] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [score, setScore] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [totalProblems, setTotalProblems] = useState(0);
  const [streak, setStreak] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [raceProgress, setRaceProgress] = useState(0);
  const [showCoachMode, setShowCoachMode] = useState(false);
  const [qlxCoinsEarned, setQlxCoinsEarned] = useState(0);
  const [guestCoins, setGuestCoins] = useState(() => {
    // Load guest coins from localStorage
    return parseInt(localStorage.getItem('guestQlxCoins') || '0');
  });
  const [showCalculator, setShowCalculator] = useState(false);
  const [calculatorDisplay, setCalculatorDisplay] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch profile data
  const { data: profile } = useQuery({
    queryKey: ["/api/profile"],
    retry: false,
  });

  // Mutation to update QuiLuX coins
  const updateQlxCoinsMutation = useMutation({
    mutationFn: async (coinsEarned: number) => {
      const response = await fetch('/api/update-qlx-coins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ coinsEarned }),
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to update coins');
      return response.json();
    },
    onSuccess: () => {
      // Invalidate profile cache to refresh coin count
      queryClient.invalidateQueries({ queryKey: ["/api/profile"] });
    }
  });

  useEffect(() => {
    document.title = "Math Races - Chicken Jockey Scribe Racer";
  }, []);

  // Calculator functions
  const handleCalculatorInput = (value: string) => {
    if (value === 'C') {
      setCalculatorDisplay('');
      setUserAnswer('');
    } else if (value === '⌫') {
      const newDisplay = calculatorDisplay.slice(0, -1);
      setCalculatorDisplay(newDisplay);
      setUserAnswer(newDisplay);
    } else if (value === '=') {
      try {
        // Simple evaluation for basic math
        const result = Function('"use strict"; return (' + calculatorDisplay + ')')();
        const finalAnswer = result.toString();
        setCalculatorDisplay(finalAnswer);
        setUserAnswer(finalAnswer);
      } catch (error) {
        setCalculatorDisplay('Error');
        setUserAnswer('');
      }
    } else {
      const newDisplay = calculatorDisplay + value;
      setCalculatorDisplay(newDisplay);
      setUserAnswer(newDisplay);
    }
  };

  // Auto-show calculator on mobile during races
  useEffect(() => {
    if (isRacing && window.innerWidth <= 768) {
      setShowCalculator(true);
    }
  }, [isRacing]);

  // Generate math problems based on level
  const generateProblem = (level: number): MathProblem => {
    const problemId = Math.floor(Math.random() * 1000);
    
    switch (level) {
      case 1: // Counting & Numbers
        const countNum = Math.floor(Math.random() * 20) + 1;
        return {
          id: problemId,
          question: `What number comes after ${countNum}?`,
          answer: countNum + 1,
          level: 1,
          type: 'counting'
        };
        
      case 2: // Basic Addition & Subtraction
        const a = Math.floor(Math.random() * 9) + 1;
        const b = Math.floor(Math.random() * 9) + 1;
        const isAddition = Math.random() > 0.5;
        
        if (isAddition) {
          return {
            id: problemId,
            question: `${a} + ${b} = ?`,
            answer: a + b,
            level: 2,
            type: 'addition'
          };
        } else {
          const larger = Math.max(a, b);
          const smaller = Math.min(a, b);
          return {
            id: problemId,
            question: `${larger} - ${smaller} = ?`,
            answer: larger - smaller,
            level: 2,
            type: 'subtraction'
          };
        }
        
      case 3: // Double Digit Math
        const c = Math.floor(Math.random() * 50) + 10;
        const d = Math.floor(Math.random() * 20) + 1;
        const isAdd = Math.random() > 0.5;
        
        if (isAdd) {
          return {
            id: problemId,
            question: `${c} + ${d} = ?`,
            answer: c + d,
            level: 3,
            type: 'addition'
          };
        } else {
          return {
            id: problemId,
            question: `${c} - ${d} = ?`,
            answer: c - d,
            level: 3,
            type: 'subtraction'
          };
        }
        
      case 4: // Word Problems
        const wordProblems = [
          { question: "What is 'five plus nine'?", answer: 14 },
          { question: "What is 'twelve minus seven'?", answer: 5 },
          { question: "What is 'eight plus six'?", answer: 14 },
          { question: "What is 'fifteen minus nine'?", answer: 6 },
          { question: "What is 'seven plus eight'?", answer: 15 }
        ];
        const wordProblem = wordProblems[Math.floor(Math.random() * wordProblems.length)];
        return {
          id: problemId,
          question: wordProblem.question,
          answer: wordProblem.answer,
          level: 4,
          type: 'word_problem'
        };
        
      case 5: // Multiplication
        const e = Math.floor(Math.random() * 12) + 1;
        const f = Math.floor(Math.random() * 12) + 1;
        return {
          id: problemId,
          question: `${e} × ${f} = ?`,
          answer: e * f,
          level: 5,
          type: 'multiplication'
        };
        
      default:
        return generateProblem(1);
    }
  };

  // Start a math race
  const startRace = (level: MathLevel) => {
    setSelectedLevel(level);
    setIsRacing(true);
    setTimeLeft(60);
    setScore(0);
    setCorrectAnswers(0);
    setTotalProblems(0);
    setStreak(0);
    setShowResult(false);
    setRaceProgress(0);
    setQlxCoinsEarned(0);
    setCalculatorDisplay('');
    setCurrentProblem(generateProblem(level.id));
    
    // Focus input
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  // Handle answer submission
  const submitAnswer = () => {
    if (!currentProblem || !userAnswer.trim()) return;
    
    const answer = parseInt(userAnswer);
    const isCorrect = answer === currentProblem.answer;
    
    if (isCorrect) {
      setCorrectAnswers(prev => prev + 1);
      setScore(prev => prev + (10 * (selectedLevel?.id || 1)));
      setStreak(prev => prev + 1);
      setRaceProgress(prev => Math.min(prev + (100 / 10), 100)); // Progress towards finish line
      
      toast({
        title: "Correct!",
        description: `Great job! Streak: ${streak + 1}`,
        duration: 1500, // Shorter duration to avoid overlay
      });
      
      // Combo bonus for 3+ correct in a row
      if (streak >= 2) {
        setScore(prev => prev + 50);
        toast({
          title: "Combo Bonus!",
          description: "Extra 50 points for your streak!",
          duration: 1500, // Shorter duration to avoid overlay
        });
      }
    } else {
      setStreak(0);
      toast({
        title: "Try Again",
        description: `The answer was ${currentProblem.answer}`,
        variant: "destructive"
      });
    }
    
    setTotalProblems(prev => prev + 1);
    setUserAnswer("");
    
    // Generate next problem
    if (selectedLevel) {
      setCurrentProblem(generateProblem(selectedLevel.id));
    }
  };

  // Timer effect
  useEffect(() => {
    if (isRacing && timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (isRacing && timeLeft === 0) {
      // Race finished
      setIsRacing(false);
      setShowResult(true);
      
      // Award QuiLuX coins for correct answers
      if (correctAnswers > 0) {
        setQlxCoinsEarned(correctAnswers);
        
        // Post race results to Discord and Telegram
        const postMathRaceResults = async () => {
          try {
            const username = profile?.username || `Guest_${Math.random().toString(36).substr(2, 8)}`;
            const accuracy = totalProblems > 0 ? Math.round((correctAnswers / totalProblems) * 100) : 0;
            const mathWpm = Math.round(correctAnswers * 2); // Math problems per minute equivalent
            
            await fetch('/api/math-race-complete', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              credentials: 'include',
              body: JSON.stringify({
                username,
                correctAnswers,
                totalProblems,
                accuracy,
                mathWpm,
                qlxEarned: correctAnswers,
                level: selectedLevel?.name || 'Unknown',
                isGuest: !profile
              }),
            });
          } catch (error) {
            console.error('Failed to post math race results:', error);
          }
        };
        
        postMathRaceResults();
        
        if (profile) {
          // Logged in user - save to database
          updateQlxCoinsMutation.mutate(correctAnswers);
          toast({
            title: "Race Complete!",
            description: `You earned ${correctAnswers} QuiLuX coins! 🧮`,
          });
        } else {
          // Guest user - save to localStorage
          const newGuestTotal = guestCoins + correctAnswers;
          setGuestCoins(newGuestTotal);
          localStorage.setItem('guestQlxCoins', newGuestTotal.toString());
          
          toast({
            title: "Race Complete!",
            description: `You earned ${correctAnswers} QuiLuX coins! Sign up to save your progress.`,
          });
        }
      }
    }
  }, [isRacing, timeLeft, correctAnswers, profile, guestCoins, updateQlxCoinsMutation, toast]);

  // Handle enter key
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      submitAnswer();
    }
  };

  if (showResult) {
    const accuracy = totalProblems > 0 ? Math.round((correctAnswers / totalProblems) * 100) : 0;
    const wpm = Math.round(correctAnswers); // Simplified WPM calculation for math
    
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8">
          <Card className="max-w-2xl mx-auto bg-dark/90 border-primary">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl font-minecraft text-primary mb-4">
                🏁 MATH RACE COMPLETE!
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-black/30 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-400">{score}</div>
                  <div className="text-sm text-gray-300">Total Score</div>
                </div>
                <div className="bg-black/30 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-green-400">{correctAnswers}</div>
                  <div className="text-sm text-gray-300">Correct Answers</div>
                </div>
                <div className="bg-black/30 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-blue-400">{accuracy}%</div>
                  <div className="text-sm text-gray-300">Accuracy</div>
                </div>
                <div className="bg-black/30 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-purple-400">{wpm}</div>
                  <div className="text-sm text-gray-300">Problems/Min</div>
                </div>
              </div>
              
              <div className="bg-black/30 p-4 rounded-lg">
                <div className="text-2xl font-bold text-green-400 mb-2">
                  🧮 {qlxCoinsEarned} QuiLuX Coins Earned!
                </div>
                {profile ? (
                  <div className="text-sm text-gray-300">
                    Total QuiLuX Coins: {(profile as any)?.qlx_coins || 0}
                  </div>
                ) : (
                  <div className="text-sm text-gray-300">
                    Guest Total: {guestCoins} QuiLuX Coins
                    <br />
                    <span className="text-yellow-400">Sign up to save your coins!</span>
                  </div>
                )}
              </div>
              
              <div className="space-y-3">
                <PixelButton 
                  onClick={() => selectedLevel && startRace(selectedLevel)}
                  className="w-full"
                >
                  Race Again
                </PixelButton>
                <PixelButton 
                  onClick={() => {
                    setShowResult(false);
                    setSelectedLevel(null);
                  }}
                  variant="outline"
                  className="w-full"
                >
                  Choose Different Level
                </PixelButton>
                <PixelButton 
                  onClick={() => setLocation("/game-menu")}
                  variant="secondary"
                  className="w-full"
                >
                  Back to Game Menu
                </PixelButton>
              </div>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  if (isRacing && currentProblem) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8">
          {/* Race Header */}
          <div className="max-w-4xl mx-auto mb-6">
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-2xl font-minecraft text-primary">
                {selectedLevel?.name} RACE
              </h1>
              <div className="flex items-center space-x-4">
                <Badge variant="outline" className="bg-black/30">
                  <Clock className="w-4 h-4 mr-1" />
                  {timeLeft}s
                </Badge>
                <Badge variant="outline" className="bg-black/30">
                  <Trophy className="w-4 h-4 mr-1" />
                  {score}
                </Badge>
                <Badge variant="outline" className="bg-black/30">
                  <Target className="w-4 h-4 mr-1" />
                  {correctAnswers}/{totalProblems}
                </Badge>
                {streak > 0 && (
                  <Badge variant="outline" className="bg-yellow-900/50 border-yellow-500">
                    <Zap className="w-4 h-4 mr-1" />
                    {streak} streak
                  </Badge>
                )}
              </div>
            </div>

          </div>

          {/* Math Problem */}
          <Card className="max-w-2xl mx-auto bg-dark/90 border-primary">
            <CardContent className="p-8 text-center">
              <div className="mb-8">
                <div className="text-4xl mb-4">{selectedLevel?.icon}</div>
                <h2 className="text-3xl font-minecraft text-primary mb-6">
                  {currentProblem.question}
                </h2>
                
                {/* Race Progress - moved below question */}
                <div className="bg-black/30 p-4 rounded-lg mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-300">Race Progress</span>
                    <span className="text-sm text-gray-300">{Math.round(raceProgress)}%</span>
                  </div>
                  <div className="relative">
                    <Progress value={raceProgress} className="h-4" />
                    <div 
                      className="absolute top-0 h-4 flex items-center"
                      style={{ left: `${raceProgress}%`, transform: 'translateX(-50%)' }}
                    >
                      <ChickenAvatar 
                        chickenType={(profile as any)?.chicken_type || "black"}
                        jockeyType={(profile as any)?.jockey_type || "fire_jockey"}
                        size="sm"
                        animation="run"
                        showName={false}
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                {/* Answer Display - Clickable to Submit */}
                <div 
                  className={`text-center text-2xl h-16 border rounded-md flex items-center justify-center transition-all group ${
                    userAnswer.trim() 
                      ? 'bg-primary/20 border-primary cursor-pointer hover:bg-primary/30 hover:scale-105 shadow-lg shadow-primary/20' 
                      : 'bg-black/30 border-primary/50'
                  }`}
                  onClick={userAnswer.trim() ? submitAnswer : undefined}
                >
                  <span className={`font-mono transition-colors ${
                    userAnswer.trim() ? 'text-primary font-bold' : 'text-green-400'
                  }`}>
                    {userAnswer || "Enter your answer..."}
                  </span>
                  {userAnswer.trim() && (
                    <span className="ml-3 text-sm font-bold text-white bg-primary/80 px-2 py-1 rounded animate-pulse">
                      CLICK TO SUBMIT
                    </span>
                  )}
                </div>

                {/* Calculator Toggle for Desktop */}
                <div className="hidden md:flex justify-center mb-4">
                  <PixelButton
                    onClick={() => setShowCalculator(!showCalculator)}
                    variant="outline"
                    size="sm"
                  >
                    {showCalculator ? "Hide Calculator" : "Show Calculator"}
                  </PixelButton>
                </div>

                {/* On-Screen Calculator */}
                {showCalculator && (
                  <div className="bg-black/40 p-4 rounded-lg border border-primary/30">
                    <div className="grid grid-cols-4 gap-2 max-w-xs mx-auto">
                      {/* Calculator Display */}
                      <div className="col-span-4 bg-black/50 p-3 rounded text-right text-lg font-mono text-green-400 border border-primary/30 mb-2">
                        {calculatorDisplay || "0"}
                      </div>
                      
                      {/* Calculator Buttons */}
                      {['C', '⌫', '÷', '×',
                        '7', '8', '9', '-',
                        '4', '5', '6', '+',
                        '1', '2', '3', '=',
                        '0', '.', '', ''].map((btn, idx) => (
                        btn && (
                          <button
                            key={idx}
                            onClick={() => handleCalculatorInput(btn)}
                            className={`h-12 rounded text-lg font-bold transition-all hover:scale-105 ${
                              ['C', '⌫', '÷', '×', '-', '+', '='].includes(btn)
                                ? 'bg-primary/20 text-primary border border-primary/50 hover:bg-primary/30'
                                : 'bg-gray-700 text-white border border-gray-600 hover:bg-gray-600'
                            }`}
                          >
                            {btn === '÷' ? '/' : btn === '×' ? '*' : btn}
                          </button>
                        )
                      ))}
                    </div>
                  </div>
                )}

                {/* Traditional Input (Hidden on Mobile during races) */}
                <Input
                  ref={inputRef}
                  type="number"
                  value={userAnswer}
                  onChange={(e) => {
                    setUserAnswer(e.target.value);
                    setCalculatorDisplay(e.target.value);
                  }}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your answer..."
                  className={`text-center text-2xl h-16 bg-black/30 border-primary/50 ${
                    showCalculator && window.innerWidth <= 768 ? 'hidden' : ''
                  }`}
                  autoFocus={!showCalculator}
                />


              </div>
              
              <div className="mt-6 text-sm text-gray-400">
                Tip: Type fast but be accurate! Each correct answer moves your Garu forward.
              </div>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-minecraft text-primary mb-4">
            🧮 CJSR MATH RACES
          </h1>
          <p className="text-lg text-gray-300 max-w-3xl mx-auto">
            Welcome to Math Races! In this game, typing numbers is just as important as spelling words. 
            Math is its own language — and every time you type a number or symbol, you're practicing essential skills!
          </p>
          
          {/* QuiLuX Coin Status */}
          <div className="mt-6 inline-block bg-black/30 px-6 py-3 rounded-lg border border-primary/30">
            {profile ? (
              <div className="text-green-400">
                🧮 QuiLuX Coins: {(profile as any)?.qlx_coins || 0}
              </div>
            ) : guestCoins > 0 ? (
              <div className="text-yellow-400">
                🧮 Guest Coins: {guestCoins} QuiLuX
                <div className="text-xs text-gray-400 mt-1">Sign up to save your coins!</div>
              </div>
            ) : (
              <div className="text-gray-400">
                🧮 Start racing to earn QuiLuX coins!
              </div>
            )}
          </div>
        </div>

        {/* Level Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {mathLevels.map((level) => (
            <Card 
              key={level.id}
              className={`bg-gradient-to-r ${level.color} border-2 border-primary/50 hover:border-primary transition-all hover:shadow-xl cursor-pointer transform hover:scale-105`}
              onClick={() => startRace(level)}
            >
              <CardContent className="p-6">
                <div className="text-center mb-4">
                  <div className="text-4xl mb-2">{level.icon}</div>
                  <h3 className="text-xl font-minecraft text-primary mb-2">
                    {level.name}
                  </h3>
                  <p className="text-sm text-gray-300 mb-3">
                    {level.description}
                  </p>
                  <div className="flex justify-center space-x-2 mb-3">
                    <Badge variant="outline" className="bg-black/30">
                      {level.difficulty}
                    </Badge>
                    <Badge variant="outline" className="bg-black/30">
                      Ages {level.minAge}-{level.maxAge}
                    </Badge>
                  </div>
                </div>
                
                <PixelButton 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                >
                  Start Level {level.id}
                </PixelButton>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Game Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="bg-dark/80 border-primary/50">
            <CardHeader>
              <CardTitle className="text-primary font-minecraft flex items-center">
                <Star className="w-5 h-5 mr-2" />
                SPECIAL FEATURES
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>• Earn 1 QuiLuX coin for each correct answer</li>
                <li>• Combo bonuses for 3+ answers in a row</li>
                <li>• Contribute to unlocking the D2 Egg of Coin 🪙</li>
                <li>• Race animations based on accuracy AND speed</li>
                <li>• Progress shown if answer is close (within ±1)</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-dark/80 border-primary/50">
            <CardHeader>
              <CardTitle className="text-primary font-minecraft flex items-center">
                <BookOpen className="w-5 h-5 mr-2" />
                SAMPLE RACE TITLES
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-300">
                {sampleRaceTitles.map((title, index) => (
                  <li key={index}>• {title}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Teacher Mode Toggle */}
        <Card className="bg-dark/80 border-primary/50 mb-8">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-minecraft text-primary mb-2">🧠 Math Coach Mode</h3>
                <p className="text-sm text-gray-300">
                  Slower races, hints, and auto-repeat problem sets for educational use
                </p>
              </div>
              <PixelButton 
                variant={showCoachMode ? "default" : "outline"}
                onClick={() => setShowCoachMode(!showCoachMode)}
              >
                {showCoachMode ? "ON" : "OFF"}
              </PixelButton>
            </div>
          </CardContent>
        </Card>

        <div className="text-center">
          <PixelButton 
            variant="secondary" 
            onClick={() => setLocation("/game-menu")}
          >
            Back to Game Menu
          </PixelButton>
        </div>
      </main>

      <Footer />
    </div>
  );
}