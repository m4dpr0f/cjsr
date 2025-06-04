import { useEffect, useState, useRef } from "react";
import { useLocation } from "wouter";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { PixelButton } from "@/components/ui/pixel-button";
import { ChickenAvatar } from "@/components/ui/chicken-avatar";
import { apiRequest } from "@/lib/queryClient";
import { Flag, Clock3, Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { calculateWpm } from "@/lib/wpm-simple";
import { simpleAudio } from "@/lib/simple-audio";
import { SPECIAL_RACES } from "@/lib/campaigns";

interface DonorRacer {
  id: number;
  username: string;
  wpm: number;
  accuracy: number;
  progress: number;
  position: number | null;
  finishTime: number | null;
  faction: string;
  factionColor: string;
  avatar: string;
}

export function DonorRace() {
  const [setLocation] = useLocation();
  const [racers, setRacers] = useState<DonorRacer[]>([]);
  const [raceStarted, setRaceStarted] = useState(false);
  const [raceFinished, setRaceFinished] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [userInput, setUserInput] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [finishTime, setFinishTime] = useState<number | null>(null);
  const [errors, setErrors] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const donorRace = SPECIAL_RACES.donor;
  const prompt = donorRace.prompt;

  // Initialize donor showcase racers with new jockey types
  const initializeDonorRacers = () => {
    const showcaseRacers: DonorRacer[] = [
      {
        id: 1,
        username: "EmeraldWing",
        wpm: 85,
        accuracy: 95,
        progress: 0,
        position: null,
        finishTime: null,
        faction: "d6",
        factionColor: "#00FF00",
        avatar: "steve"
      },
      {
        id: 2,
        username: "CrimsonFeather",
        wmp: 92,
        accuracy: 88,
        progress: 0,
        position: null,
        finishTime: null,
        faction: "d4",
        factionColor: "#FF0000",
        avatar: "fire_jockey"
      },
      {
        id: 3,
        username: "SapphireGlider",
        wpm: 78,
        accuracy: 97,
        progress: 0,
        position: null,
        finishTime: null,
        faction: "d20",
        factionColor: "#0000FF",
        avatar: "zombie"
      },
      {
        id: 4,
        username: "GoldenFlame",
        wpm: 88,
        accuracy: 91,
        progress: 0,
        position: null,
        finishTime: null,
        faction: "d12",
        factionColor: "#FFD700",
        avatar: "flame_champion"
      },
      {
        id: 5,
        username: "VioletStorm",
        wpm: 94,
        accuracy: 89,
        progress: 0,
        position: null,
        finishTime: null,
        faction: "d10",
        factionColor: "#4B0082",
        avatar: "peacock_champion"
      },
      {
        id: 6,
        username: "RainbowRider",
        wpm: 90,
        accuracy: 93,
        progress: 0,
        position: null,
        finishTime: null,
        faction: "d8",
        factionColor: "#FFFFFF",
        avatar: "wind_guardian"
      }
    ];
    setRacers(showcaseRacers);
  };

  useEffect(() => {
    initializeDonorRacers();
    simpleAudio.playMusic("03 Chocobo's Theme.mp3");
  }, []);

  const startCountdown = () => {
    setCountdown(3);
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(timer);
          setRaceStarted(true);
          setStartTime(Date.now());
          if (inputRef.current) {
            inputRef.current.focus();
          }
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!raceStarted || raceFinished) return;

    const value = e.target.value;
    setUserInput(value);

    // Check typing accuracy
    let newErrors = 0;
    for (let i = 0; i < value.length; i++) {
      if (value[i] !== prompt[i]) {
        newErrors++;
      }
    }
    setErrors(newErrors);

    // Update progress
    const progress = Math.min((value.length / prompt.length) * 100, 100);
    setCurrentIndex(value.length);

    // Check if race is finished
    if (value === prompt) {
      const endTime = Date.now();
      setFinishTime(endTime);
      setRaceFinished(true);
      simpleAudio.playRaceResult(true, 1);
      
      setTimeout(() => setShowResults(true), 1000);
    }
  };

  const calculateStats = () => {
    if (!startTime || !finishTime) return { wpm: 0, accuracy: 0, time: 0 };
    
    const timeInSeconds = (finishTime - startTime) / 1000;
    const timeInMinutes = timeInSeconds / 60;
    const wpm = Math.round(prompt.length / 5 / timeInMinutes);
    const accuracy = Math.round(((prompt.length - errors) / prompt.length) * 100);
    
    return { wpm, accuracy, time: Math.round(timeInSeconds) };
  };

  const stats = calculateStats();

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 via-blue-900 to-indigo-900 text-yellow-400 font-mono">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Heart className="w-8 h-8 text-pink-400 fill-current animate-pulse" />
              <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                {donorRace.title}
              </h1>
              <Heart className="w-8 h-8 text-pink-400 fill-current animate-pulse" />
            </div>
            <p className="text-xl text-purple-300 mb-6">
              {donorRace.description}
            </p>
            <div className="bg-gradient-to-r from-purple-800/50 to-blue-800/50 rounded-lg p-4 border border-purple-500/30">
              <p className="text-cyan-300 text-lg">
                Experience the future of CJSR with these upcoming jockey designs!
              </p>
            </div>
          </div>

          {/* Race Track Display */}
          <div className="bg-black/40 rounded-lg border border-yellow-600/50 p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {racers.map((racer) => (
                <div key={racer.id} className="bg-gray-900/60 rounded-lg p-3 border border-gray-600/50">
                  <div className="flex items-center gap-3 mb-2">
                    <ChickenAvatar chickenType="speedy" jockeyType={racer.avatar as any} className="w-8 h-8" />
                    <div>
                      <div className="text-sm font-bold" style={{ color: racer.factionColor }}>
                        {racer.username}
                      </div>
                      <div className="text-xs text-gray-400">
                        {racer.wpm} WPM • {racer.accuracy}% ACC
                      </div>
                    </div>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className="h-2 rounded-full transition-all duration-300"
                      style={{ 
                        width: `${racer.progress}%`,
                        backgroundColor: racer.factionColor 
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Race Controls */}
          <div className="bg-black/40 rounded-lg border border-yellow-600/50 p-6 mb-6">
            {!raceStarted && countdown === null && (
              <div className="text-center">
                <PixelButton onClick={startCountdown} className="mb-4">
                  Start Donor Appreciation Race
                </PixelButton>
              </div>
            )}

            {countdown !== null && (
              <div className="text-center">
                <div className="text-6xl font-bold text-yellow-400 mb-4">
                  {countdown}
                </div>
                <div className="text-xl text-purple-300">Get ready to type!</div>
              </div>
            )}

            {raceStarted && !raceFinished && (
              <div className="space-y-4">
                <div className="text-lg text-purple-300 mb-4">
                  Type the text below:
                </div>
                <div className="bg-gray-900/60 p-4 rounded-lg border border-gray-600/50 text-white leading-relaxed">
                  <span className="text-green-400">{userInput}</span>
                  <span className="bg-yellow-400 text-black">
                    {prompt[currentIndex] || ""}
                  </span>
                  <span className="text-gray-400">
                    {prompt.slice(currentIndex + 1)}
                  </span>
                </div>
                <input
                  ref={inputRef}
                  type="text"
                  value={userInput}
                  onChange={handleInputChange}
                  className="w-full p-3 bg-gray-900 border border-gray-600 rounded-lg text-white focus:border-yellow-400 focus:outline-none"
                  placeholder="Start typing here..."
                  autoComplete="off"
                />
                <div className="flex justify-between text-sm text-gray-400">
                  <div>Progress: {Math.round((currentIndex / prompt.length) * 100)}%</div>
                  <div>Errors: {errors}</div>
                  <div>WPM: {calculateWpm(userInput, startTime || 0)}</div>
                </div>
              </div>
            )}
          </div>

          {/* Results */}
          {showResults && (
            <div className="bg-black/40 rounded-lg border border-yellow-600/50 p-6 mb-6">
              <div className="text-center">
                <h2 className="text-3xl font-bold text-yellow-400 mb-4">
                  Thank You for Your Support! 🎉
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-purple-900/40 rounded-lg p-4">
                    <div className="text-2xl font-bold text-purple-400">{stats.wpm}</div>
                    <div className="text-sm text-gray-400">Words Per Minute</div>
                  </div>
                  <div className="bg-blue-900/40 rounded-lg p-4">
                    <div className="text-2xl font-bold text-blue-400">{stats.accuracy}%</div>
                    <div className="text-sm text-gray-400">Accuracy</div>
                  </div>
                  <div className="bg-green-900/40 rounded-lg p-4">
                    <div className="text-2xl font-bold text-green-400">{stats.time}s</div>
                    <div className="text-sm text-gray-400">Time</div>
                  </div>
                </div>
                <div className="bg-gradient-to-r from-purple-800/50 to-pink-800/50 rounded-lg p-6 border border-purple-500/30">
                  <h3 className="text-xl font-bold text-pink-400 mb-3">Your contribution makes this possible!</h3>
                  <p className="text-purple-200 mb-4">
                    The colorful jockeys you saw in this race represent the future of CJSR. 
                    Thanks to generous supporters like you, we're bringing new characters, 
                    stories, and adventures to life!
                  </p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {donorRace.specialRewards.map((reward, index) => (
                      <span key={index} className="bg-yellow-600/20 text-yellow-300 px-3 py-1 rounded-full text-sm border border-yellow-600/50">
                        {reward}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="text-center">
            <PixelButton onClick={() => setLocation("/")} variant="secondary">
              Return to Home
            </PixelButton>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}