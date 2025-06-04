import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import GameWrapper from "@/components/GameWrapper";

export default function FirstPersonRace() {
  const [, setLocation] = useLocation();
  const [gameStarted, setGameStarted] = useState(false);

  if (gameStarted) {
    return (
      <div className="relative">
        {/* Back button overlay */}
        <div className="absolute top-4 left-4 z-50">
          <Button
            variant="ghost"
            onClick={() => setLocation("/")}
            className="text-white hover:text-gray-300 bg-black/50 hover:bg-black/70"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </div>
        <GameWrapper />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 via-purple-900 to-black flex items-center justify-center">
      <div className="text-center text-white max-w-2xl mx-auto p-8">
        <h1 className="text-4xl font-bold mb-6">First-Person Typing Race</h1>
        <p className="text-xl mb-8">
          Experience typing like never before! Phrases overlay directly on your viewport. 
          Type accurately to move forward through the immersive racing environment.
        </p>
        <div className="space-y-4 mb-8">
          <div className="flex gap-2 justify-center">
            <Button
              onClick={() => setGameStarted(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg"
            >
              🏁 Start Immersive Race
            </Button>
            <Button
              variant="outline"
              onClick={() => setLocation("/")}
              className="border-blue-500 text-blue-200 hover:bg-blue-600 hover:text-white px-6 py-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </div>
        </div>
        <div className="text-sm text-gray-300 space-y-2">
          <p>• Typing overlays directly on the racing view</p>
          <p>• Forward motion driven by typing accuracy</p>
          <p>• No NPCs or multiplayer - pure typing experience</p>
          <p>• Works on both desktop and mobile</p>
        </div>
      </div>
    </div>
  );
}