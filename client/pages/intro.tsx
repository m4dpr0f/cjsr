import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PixelButton } from "@/components/ui/pixel-button";
import { Badge } from "@/components/ui/badge";
import { HTMLSprite, MatikahBlocks } from "@/components/ui/html-sprite";
import { ChickenSprite } from "@/components/html-sprites/chicken-sprite";
import { ChickenAvatar } from "@/components/ui/chicken-avatar";
import { ChalisaSprite } from "@/components/html-sprites/chalisa-sprite";
import matikahAndChalisaImg from "@assets/Matikah and Chalisa.png";
import matikahImg from "@assets/Matikah.png";
import {
  Zap,
  Target,
  Trophy,
  Users,
  BookOpen,
  Keyboard,
  ArrowRight,
  Star,
} from "lucide-react";

export default function Intro() {
  const [, setLocation] = useLocation();
  const [demoText, setDemoText] = useState("");
  const [matikahPosition, setMatikahPosition] = useState(10);
  const [chickenPosition, setChickenPosition] = useState(70);
  const inputRef = useRef<HTMLInputElement>(null);

  const targetText = "Welcome to the world of Chicken Jockey Scribe Racing!";

  useEffect(() => {
    // Calculate positions based on typing progress
    const progress = demoText.length / targetText.length;
    const newMatikahPos = 10 + progress * 60;
    const newChickenPos = 70 + progress * 20;

    setMatikahPosition(newMatikahPos);
    setChickenPosition(newChickenPos);
  }, [demoText]);

  const handleDemoInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const targetSlice = targetText.slice(0, value.length);

    // Only update if typing matches the target text
    if (targetSlice.startsWith(value)) {
      setDemoText(value);
    } else {
      // Reset to last correct position if typing incorrectly
      e.target.value = demoText;
    }
  };

  const resetDemo = () => {
    setDemoText("");
    setMatikahPosition(10);
    setChickenPosition(70);
    if (inputRef.current) {
      inputRef.current.value = "";
      inputRef.current.focus();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-6xl font-minecraft text-primary mb-4 animate-pulse">
            CHICKEN JOCKEY
          </h1>
          <h2 className="text-4xl font-minecraft text-yellow-400 mb-6">
            SCRIBE RACER
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Enter a mystical realm where typing prowess determines racing
            victory. Mount magical companions, master ancient texts, and compete
            in epic cross-dimensional tournaments that blend speed, accuracy,
            and wisdom.
          </p>
        </div>

        {/* Interactive Demo */}
        <Card className="mb-12 bg-gradient-to-br from-purple-900/40 to-blue-900/40 border-2 border-yellow-500/50">
          <CardHeader>
            <CardTitle className="text-center text-2xl font-minecraft text-yellow-400">
              🏁 LIVE TYPING DEMO 🏁
            </CardTitle>
            <p className="text-center text-gray-300">
              Try typing below to see your racer move! Type accurately to
              advance.
            </p>
          </CardHeader>
          <CardContent>
            {/* Matikah & Chalisa Artwork */}
            <div className="flex justify-center mb-6">
              <img
                src={matikahAndChalisaImg}
                alt="Matikah & Chalisa - The Moon-Born Singer and her Garu companion"
                className="w-64 h-auto rounded-lg shadow-xl border-2 border-purple-500/50"
              />
            </div>
            {/* Race Track Visualization */}
            <div className="relative h-48 bg-gradient-to-r from-green-800 to-green-600 rounded-lg mb-6 overflow-visible">
              {/* Track markers */}
              <div className="absolute inset-0 flex justify-between items-center px-4">
                <div className="text-white font-minecraft">START</div>
                <div className="text-white font-minecraft">FINISH</div>
              </div>

              {/* Matikah PNG (5x larger) - Top layer */}
              <div
                className="absolute bottom-0 transition-all duration-300 ease-out z-20"
                style={{ left: `${matikahPosition}%` }}
              >
                <div className="scale-[5] origin-bottom">
                  <img
                    src={matikahImg}
                    alt="Matikah"
                    className={`w-8 h-8 object-contain ${matikahPosition > 15 ? "animate-bounce" : ""}`}
                    style={{
                      imageRendering: "pixelated",
                      filter: "contrast(1.1) saturate(1.2)",
                    }}
                  />
                </div>
                <div className="text-xs text-white font-minecraft mt-2 text-center">
                  Matikah
                </div>
              </div>

              {/* Chalisa (5x larger) */}
              <div
                className="absolute bottom-4 transition-all duration-500 ease-out z-10"
                style={{ left: `${chickenPosition}%` }}
              >
                <div className="scale-[5] origin-bottom">
                  <ChalisaSprite
                    size="xs"
                    animation={chickenPosition > 75 ? "run" : "idle"}
                    direction="right"
                    pixelSize={1}
                  />
                </div>
                <div className="text-xs text-white font-minecraft mt-8 text-center">
                  Chalisa
                </div>
              </div>

              {/* Progress Line */}
              <div
                className="absolute bottom-0 left-0 h-1 bg-yellow-400 transition-all duration-300"
                style={{
                  width: `${(demoText.length / targetText.length) * 100}%`,
                }}
              />
            </div>

            {/* Demo Input */}
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-gray-300 mb-2">
                  Type this text to move your racer:
                </p>
                <div className="bg-gray-800 p-4 rounded font-mono text-lg">
                  <span className="text-green-400">{demoText}</span>
                  <span className="text-gray-400">
                    {targetText.slice(demoText.length)}
                  </span>
                </div>
              </div>

              <div className="flex gap-4 justify-center">
                <input
                  ref={inputRef}
                  type="text"
                  className="flex-1 max-w-md p-3 bg-gray-800 border border-gray-600 rounded text-white font-mono text-lg focus:outline-none focus:border-yellow-400"
                  placeholder="Start typing here..."
                  onChange={handleDemoInput}
                  autoFocus
                />
                <PixelButton
                  onClick={resetDemo}
                  className="bg-yellow-600 hover:bg-yellow-700 px-6"
                >
                  Reset Demo
                </PixelButton>
              </div>

              <div className="text-center">
                <Badge className="bg-green-600 text-white">
                  Progress:{" "}
                  {Math.round((demoText.length / targetText.length) * 100)}%
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Game Features Overview */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card className="bg-dark/80 border-blue-500/50 hover:border-blue-500 transition-colors">
            <CardHeader>
              <CardTitle className="text-blue-400 font-minecraft flex items-center">
                <Zap className="w-5 h-5 mr-2" />
                REAL-TIME RACING
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300 text-sm">
                Compete against players worldwide in synchronized multiplayer
                races across the Matrix federation network.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-dark/80 border-purple-500/50 hover:border-purple-500 transition-colors">
            <CardHeader>
              <CardTitle className="text-purple-400 font-minecraft flex items-center">
                <BookOpen className="w-5 h-5 mr-2" />
                MYSTICAL COMPANIONS
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300 text-sm">
                Unlock magical eggs containing powerful companions. Each brings
                unique abilities and faction bonuses to enhance your racing.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-dark/80 border-green-500/50 hover:border-green-500 transition-colors">
            <CardHeader>
              <CardTitle className="text-green-400 font-minecraft flex items-center">
                <Trophy className="w-5 h-5 mr-2" />
                EPIC CAMPAIGNS
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300 text-sm">
                Experience 4 unique storylines featuring legendary characters
                and ancient wisdom from cultures around the world.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Getting Started Options */}
        <Card className="bg-gradient-to-br from-yellow-900/40 to-orange-900/40 border-2 border-yellow-500/50">
          <CardHeader>
            <CardTitle className="text-center text-3xl font-minecraft text-yellow-400">
              🌟 BEGIN YOUR JOURNEY 🌟
            </CardTitle>
            <p className="text-center text-gray-300 text-lg">
              Choose your path to become a legendary Scribe Racer
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-8">
              {/* Placement Test Path */}
              <div className="text-center space-y-4">
                <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-full w-20 h-20 mx-auto flex items-center justify-center">
                  <Target className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-minecraft text-blue-400">
                  PLACEMENT TEST
                </h3>
                <p className="text-gray-300">
                  <strong>RECOMMENDED FIRST STEP</strong>
                  <br />
                  Discover your typing skill level and unlock your first magical
                  Garu egg. This creates your account and determines your
                  starting companion.
                </p>
                <div className="flex flex-col gap-2">
                  <Badge className="bg-blue-600 text-white mx-auto">
                    ✨ Unlocks Garu Egg Selection
                  </Badge>
                  <Badge className="bg-green-600 text-white mx-auto">
                    🏗️ Creates Your Account
                  </Badge>
                  <Badge className="bg-purple-600 text-white mx-auto">
                    📊 Skill Assessment
                  </Badge>
                </div>
                <PixelButton
                  onClick={() => setLocation("/placement-test")}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-lg py-3"
                >
                  <Target className="w-5 h-5 mr-2" />
                  START PLACEMENT TEST
                  <ArrowRight className="w-5 h-5 ml-2" />
                </PixelButton>
              </div>

              {/* Typing Adventure Path */}
              <div className="text-center space-y-4">
                <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-full w-20 h-20 mx-auto flex items-center justify-center">
                  <Keyboard className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-minecraft text-purple-400">
                  TYPING ADVENTURE
                </h3>
                <p className="text-gray-300">
                  <strong>LEARN & EXPLORE</strong>
                  <br />
                  Master typing fundamentals through 12 progressive chapters
                  filled with sacred texts and cultural wisdom from around the
                  world.
                </p>
                <div className="flex flex-col gap-2">
                  <Badge className="bg-purple-600 text-white mx-auto">
                    📚 12 Learning Chapters
                  </Badge>
                  <Badge className="bg-pink-600 text-white mx-auto">
                    🌍 Cultural Wisdom
                  </Badge>
                  <Badge className="bg-orange-600 text-white mx-auto">
                    ⚡ Skill Building
                  </Badge>
                </div>
                <PixelButton
                  onClick={() => setLocation("/typing-adventure")}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-lg py-3"
                >
                  <BookOpen className="w-5 h-5 mr-2" />
                  BEGIN ADVENTURE
                  <ArrowRight className="w-5 h-5 ml-2" />
                </PixelButton>
              </div>
            </div>

            {/* Additional Quick Options */}
            <div className="mt-8 pt-8 border-t border-gray-600">
              <h4 className="text-xl font-minecraft text-center text-yellow-400 mb-6">
                OR EXPLORE OTHER OPTIONS
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <PixelButton
                  onClick={() => setLocation("/practice")}
                  className="bg-teal-600 hover:bg-teal-700 text-sm py-2"
                >
                  <Target className="w-4 h-4 mr-1" />
                  Practice
                </PixelButton>
                <PixelButton
                  onClick={() => setLocation("/matrix-race")}
                  className="bg-blue-600 hover:bg-blue-700 text-sm py-2"
                >
                  <Users className="w-4 h-4 mr-1" />
                  Multiplayer
                </PixelButton>
                <PixelButton
                  onClick={() => setLocation("/campaign")}
                  className="bg-green-600 hover:bg-green-700 text-sm py-2"
                >
                  <BookOpen className="w-4 h-4 mr-1" />
                  Campaigns
                </PixelButton>
                <PixelButton
                  onClick={() => setLocation("/")}
                  className="bg-gray-600 hover:bg-gray-700 text-sm py-2"
                >
                  <Star className="w-4 h-4 mr-1" />
                  Main Menu
                </PixelButton>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
