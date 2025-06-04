import { useEffect } from "react";
import { useLocation } from "wouter";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Card, CardContent } from "@/components/ui/card";
import { PixelButton } from "@/components/ui/pixel-button";
import { ChickenAvatar } from "@/components/ui/chicken-avatar";

export default function GameMenu() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    document.title = "Game Menu - Chicken Jockey Scribe Racer";
  }, []);

  // Go to practice arena (includes placement test for new users)
  const goToPracticeArena = () => {
    setLocation("/practice");
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-3xl font-minecraft text-primary text-center mb-8">
          CHOOSE YOUR GAME MODE
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
          {/* Math Races - New K-4th Grade Feature */}
          <Card
            className="bg-gradient-to-r from-emerald-900/80 to-teal-800/80 border-2 border-emerald-500 hover:border-cyan-400 transition-all hover:shadow-xl cursor-pointer transform hover:scale-105"
            onClick={() => setLocation("/maths")}
          >
            <CardContent className="p-6">
              <div className="flex items-center mb-4">
                <div className="mr-4 text-3xl">🧮</div>
                <div>
                  <h2 className="text-xl font-minecraft text-emerald-400 mb-1">
                    MATH RACES
                  </h2>
                  <p className="text-sm text-emerald-200">
                    Type numbers and solve problems at racing speed
                  </p>
                </div>
              </div>
              <div className="bg-black/30 p-3 rounded-lg mb-4">
                <p className="text-xs text-gray-300">
                  • K-4th grade math levels: counting to multiplication
                </p>
                <p className="text-xs text-gray-300">
                  • Earn GaruCoins and contribute to D2 Egg unlocks
                </p>
                <p className="text-xs text-gray-300">
                  • Math Coach Mode available for educators
                </p>
              </div>
              <PixelButton variant="outline" size="sm" className="w-full bg-emerald-600 hover:bg-emerald-700 border-emerald-500">
                Start Math Adventure
              </PixelButton>
            </CardContent>
          </Card>
          {/* Learn to Type Adventure - New Feature */}
          <Card
            className="bg-gradient-to-r from-blue-900/80 to-indigo-800/80 border-2 border-blue-500 hover:border-cyan-400 transition-all hover:shadow-xl cursor-pointer transform hover:scale-105"
            onClick={() => setLocation("/learn-to-type")}
          >
            <CardContent className="p-6">
              <div className="flex items-center mb-4">
                <div className="mr-4 text-3xl">🎓</div>
                <div>
                  <h2 className="text-xl font-minecraft text-blue-400 mb-1">
                    LEARN TO TYPE
                  </h2>
                  <p className="text-sm text-blue-200">
                    Adventure through typing fundamentals
                  </p>
                </div>
              </div>
              <div className="bg-black/30 p-3 rounded-lg mb-4">
                <p className="text-xs text-gray-300">
                  • Interactive typing lessons
                </p>
                <p className="text-xs text-gray-300">
                  • Progress from basics to advanced
                </p>
                <p className="text-xs text-gray-300">
                  • Fun adventure-style learning
                </p>
              </div>
              <PixelButton variant="outline" size="sm" className="w-full">
                Start Adventure
              </PixelButton>
            </CardContent>
          </Card>

          {/* Scribe Hall - Featured prominently */}
          <Card
            className="bg-gradient-to-r from-amber-900/80 to-orange-800/80 border-2 border-amber-500 hover:border-yellow-400 transition-all hover:shadow-xl cursor-pointer transform hover:scale-105"
            onClick={() => setLocation("/scribe")}
          >
            <CardContent className="p-6">
              <div className="flex items-center mb-4">
                <div className="mr-4 text-3xl">✏️</div>
                <div>
                  <h2 className="text-xl font-minecraft text-amber-400 mb-1">
                    SCRIBE HALL
                  </h2>
                  <p className="text-sm text-amber-200">
                    Chronicle wisdom & legends - Type sacred texts
                  </p>
                </div>
              </div>
              <div className="bg-black/30 p-3 rounded-lg mb-4">
                <p className="text-xs text-gray-300">
                  • Type authentic sacred texts from 16 traditions
                </p>
                <p className="text-xs text-gray-300">
                  • Add personal reflections and create wisdom works
                </p>
                <p className="text-xs text-gray-300">
                  • Earn XP through contemplative typing practice
                </p>
              </div>
              <PixelButton
                variant="outline"
                size="sm"
                className="w-full bg-amber-600 hover:bg-amber-700 border-amber-500"
              >
                Enter Scribe Hall
              </PixelButton>
            </CardContent>
          </Card>

          {/* Practice Arena */}
          <Card
            className="bg-gradient-to-r from-blue-900/80 to-blue-800/80 border-2 border-primary hover:border-yellow-500 transition-all hover:shadow-lg cursor-pointer"
            onClick={goToPracticeArena}
          >
            <CardContent className="p-6">
              <div className="flex items-center mb-4">
                <div className="mr-4 text-3xl">📊</div>
                <div>
                  <h2 className="text-xl font-minecraft text-primary mb-1">
                    PLACEMENT RACE
                  </h2>
                  <p className="text-sm text-light">
                    Take a quick test to measure your typing skills
                  </p>
                </div>
              </div>
              <div className="bg-black/30 p-3 rounded-lg mb-4">
                <p className="text-xs text-gray-300">
                  • Type a short sentence to establish your baseline skill
                </p>
                <p className="text-xs text-gray-300">
                  • See your WPM and accuracy stats
                </p>
                <p className="text-xs text-gray-300">
                  • Results aren't saved to your profile
                </p>
              </div>
              <PixelButton variant="outline" size="sm" className="w-full">
                Start Placement Race
              </PixelButton>
            </CardContent>
          </Card>

          {/* Practice Mode */}
          <Card
            className="bg-gradient-to-r from-green-900/80 to-green-800/80 border-2 border-primary hover:border-yellow-500 transition-all hover:shadow-lg cursor-pointer"
            onClick={() => setLocation("/practice")}
          >
            <CardContent className="p-6">
              <div className="flex items-center mb-4">
                <div className="mr-4 text-3xl">🏋️</div>
                <div>
                  <h2 className="text-xl font-minecraft text-primary mb-1">
                    PRACTICE MODE
                  </h2>
                  <p className="text-sm text-light">
                    Train your typing skills at your own pace
                  </p>
                </div>
              </div>
              <div className="bg-black/30 p-3 rounded-lg mb-4">
                <p className="text-xs text-gray-300">
                  • Practice without affecting your stats
                </p>
                <p className="text-xs text-gray-300">
                  • Choose from various text difficulty levels
                </p>
                <p className="text-xs text-gray-300">
                  • Focus on improving accuracy and speed
                </p>
              </div>
              <PixelButton variant="outline" size="sm" className="w-full">
                Start Practice
              </PixelButton>
            </CardContent>
          </Card>

          {/* Multiplayer Mode */}
          <Card
            className="bg-gradient-to-r from-purple-900/80 to-purple-800/80 border-2 border-primary hover:border-yellow-500 transition-all hover:shadow-lg cursor-pointer"
            onClick={() => setLocation("/race")}
          >
            <CardContent className="p-6">
              <div className="flex items-center mb-4">
                <div className="mr-4 text-3xl">🏁</div>
                <div>
                  <h2 className="text-xl font-minecraft text-primary mb-1">
                    MULTIPLAYER RACE
                  </h2>
                  <p className="text-sm text-light">
                    Compete against other players in real-time
                  </p>
                </div>
              </div>
              <div className="bg-black/30 p-3 rounded-lg mb-4">
                <p className="text-xs text-gray-300">
                  • Race against up to 7 other players
                </p>
                <p className="text-xs text-gray-300">
                  • Winners can submit new race prompts
                </p>
                <p className="text-xs text-gray-300">
                  • Earn XP and improve your rank
                </p>
              </div>
              <PixelButton variant="outline" size="sm" className="w-full">
                Enter Race Lobby
              </PixelButton>
            </CardContent>
          </Card>

          {/* Campaign Mode */}
          <Card
            className="bg-gradient-to-r from-yellow-900/80 to-yellow-800/80 border-2 border-primary hover:border-yellow-500 transition-all hover:shadow-lg cursor-pointer"
            onClick={() => setLocation("/campaign")}
          >
            <CardContent className="p-6">
              <div className="flex items-center mb-4">
                <div className="mr-4 text-3xl">📜</div>
                <div>
                  <h2 className="text-xl font-minecraft text-primary mb-1">
                    CAMPAIGN MODE
                  </h2>
                  <p className="text-sm text-light">
                    Experience the story of the First Feather
                  </p>
                </div>
              </div>
              <div className="bg-black/30 p-3 rounded-lg mb-4">
                <p className="text-xs text-gray-300">
                  • Choose your character and forge your path
                </p>
                <p className="text-xs text-gray-300">
                  • Your choices affect the story and challenges
                </p>
                <p className="text-xs text-gray-300">
                  • Unlock special characters and mounts
                </p>
              </div>
              <PixelButton variant="outline" size="sm" className="w-full">
                Choose Campaign
              </PixelButton>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-center mt-8">
          <PixelButton variant="secondary" onClick={() => setLocation("/")}>
            Back to Main Menu
          </PixelButton>
        </div>
      </main>

      <Footer />
    </div>
  );
}
