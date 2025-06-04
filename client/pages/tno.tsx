import { useEffect } from "react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { PixelButton } from "@/components/ui/pixel-button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "wouter";
import reactJamGraphic from "@assets/spring-2025-theme-reveal-67d7efc1_1748345271957.png";

export default function TrustNoOne() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    document.title = "TRUST NO ONE - React Jam Spring 2025 | CJSR";
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-gray-900 via-red-900/20 to-gray-900">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        {/* React Jam Hero Banner */}
        <div className="text-center mb-8">
          <a 
            href="https://reactjam.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="block transition-transform hover:scale-105"
          >
            <img 
              src={reactJamGraphic} 
              alt="React Jam Spring 2025 - Trust No One"
              className="w-full max-w-4xl mx-auto rounded-lg shadow-2xl border-2 border-red-500"
            />
          </a>
          
          <div className="mt-6">
            <Badge className="bg-red-600 text-white px-4 py-2 text-lg mb-4">
              🏆 COMPETING IN REACT JAM SPRING 2025
            </Badge>
            
            <h1 className="text-4xl md:text-6xl font-pixel text-white mb-4">
              TRUST NO ONE
            </h1>
            <p className="text-xl text-red-300 mb-6">
              Every keystroke could be a lie. Every race hides a secret. Can you type fast enough to uncover the truth?
            </p>
          </div>
        </div>

        {/* Competition Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
          <Card className="bg-gray-800/80 border-2 border-red-500">
            <CardContent className="p-6">
              <h2 className="text-2xl font-pixel text-red-400 mb-4">🎮 Our Submission</h2>
              <div className="space-y-3 text-gray-300">
                <p><strong>Game:</strong> Chicken Jockey Scribe Racer (CJSR)</p>
                <p><strong>Theme Integration:</strong> "TRUST NO ONE" themed typing prompts</p>
                <p><strong>Features:</strong> Multiplayer typing races with paranoia-inducing text</p>
                <p><strong>Innovation:</strong> Suspenseful typing that makes you question every word</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/80 border-2 border-orange-500">
            <CardContent className="p-6">
              <h2 className="text-2xl font-pixel text-orange-400 mb-4">⚠️ Theme Implementation</h2>
              <div className="space-y-3 text-gray-300">
                <p>• <strong>Deceptive Prompts:</strong> "A shadow Garu mimics you..."</p>
                <p>• <strong>False Narratives:</strong> "Your opponent's screen lies..."</p>
                <p>• <strong>Hidden Truths:</strong> "Only one track is real..."</p>
                <p>• <strong>Paranoid Racing:</strong> "Imposter feeds false prompts..."</p>
                <p>• <strong>Faction Wars:</strong> 8 competing elemental factions with hidden agendas</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Faction Wars - TNO Theme Implementation */}
        <div className="bg-gradient-to-r from-purple-900 to-indigo-900 rounded-lg p-8 mb-10">
          <h2 className="text-3xl font-pixel text-white mb-4 text-center">⚡ FACTION WARS: THE ULTIMATE BETRAYAL</h2>
          <p className="text-lg text-purple-200 mb-6 text-center">
            Our 8-faction elemental system perfectly embodies "TRUST NO ONE" - every player belongs to a faction with hidden motives and shifting loyalties.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-black/40 p-4 rounded-lg">
              <h3 className="text-xl font-pixel text-purple-400 mb-3">🎭 Hidden Agendas</h3>
              <ul className="text-purple-200 space-y-2">
                <li>• 8 elemental factions: Fire, Water, Earth, Air, Chaos, Order, Ether, Coin</li>
                <li>• Each faction has secret advantages and weaknesses</li>
                <li>• XP gains vary mysteriously by faction alignment</li>
                <li>• Alliance systems that can shift without warning</li>
              </ul>
            </div>
            
            <div className="bg-black/40 p-4 rounded-lg">
              <h3 className="text-xl font-pixel text-red-400 mb-3">⚠️ Trust Issues</h3>
              <ul className="text-red-200 space-y-2">
                <li>• Your faction color may not match your true loyalty</li>
                <li>• Faction bonuses can be lies or traps</li>
                <li>• Other players' factions might be disguised</li>
                <li>• The leaderboard shows faction bias</li>
              </ul>
            </div>
          </div>
          
          <div className="text-center">
            <PixelButton 
              onClick={() => setLocation("/faction-war")}
              className="bg-purple-600 hover:bg-purple-700 border-0 text-lg px-8 py-3"
            >
              🏛️ ENTER FACTION WARS
            </PixelButton>
          </div>
        </div>

        {/* Call to Action Section */}
        <div className="bg-gradient-to-r from-red-900 to-orange-900 rounded-lg p-8 mb-10 text-center">
          <h2 className="text-3xl font-pixel text-white mb-4">Experience the Paranoia</h2>
          <p className="text-lg text-red-200 mb-6">
            Race against others while questioning every word you type. The theme isn't just decoration—it's woven into every race, creating genuine suspense and uncertainty.
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <PixelButton 
              onClick={() => setLocation("/race")}
              className="bg-red-600 hover:bg-red-700 border-0"
            >
              🏁 QUICK RACE
            </PixelButton>
            
            <PixelButton 
              onClick={() => setLocation("/private-races")}
              className="bg-orange-600 hover:bg-orange-700 border-0"
            >
              👥 MULTIPLAYER
            </PixelButton>
            
            <PixelButton 
              onClick={() => setLocation("/campaign")}
              variant="outline"
              className="border-red-500 text-red-300"
            >
              📖 CAMPAIGNS
            </PixelButton>
          </div>
        </div>

        {/* Competition Status */}
        <div className="bg-gray-800/60 rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-pixel text-primary mb-4 text-center">🏆 Competition Status</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl mb-2">⏰</div>
              <h3 className="font-pixel text-red-400">SUBMISSION</h3>
              <p className="text-gray-300">React Jam Spring 2025</p>
            </div>
            
            <div className="text-center">
              <div className="text-3xl mb-2">🎯</div>
              <h3 className="font-pixel text-orange-400">THEME</h3>
              <p className="text-gray-300">TRUST NO ONE</p>
            </div>
            
            <div className="text-center">
              <div className="text-3xl mb-2">🚀</div>
              <h3 className="font-pixel text-primary">STATUS</h3>
              <p className="text-gray-300">Live & Ready!</p>
            </div>
          </div>
        </div>

        {/* Learn More About React Jam */}
        <div className="text-center">
          <h2 className="text-2xl font-pixel text-white mb-4">Learn More About React Jam</h2>
          <p className="text-gray-300 mb-6">
            React Jam is a premier competition for React developers. Discover amazing projects and vote for your favorites!
          </p>
          
          <div className="space-y-4">
            <div>
              <PixelButton 
                onClick={() => window.open('https://reactjam.com/', '_blank')}
                className="bg-blue-600 hover:bg-blue-700 border-0 text-lg px-8 py-3"
              >
                🌐 Visit React Jam Official Site
              </PixelButton>
            </div>
            
            <div>
              <PixelButton 
                onClick={() => setLocation("/")}
                variant="outline"
                className="border-primary text-primary"
              >
                ← Back to CJSR Home
              </PixelButton>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}