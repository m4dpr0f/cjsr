import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Card } from "@/components/ui/card";
import { PixelButton } from "@/components/ui/pixel-button";
import { ArrowLeft, Scroll, Shield, Construction } from "lucide-react";
import tessarionScrollPath from "@assets/Scroll of Tessarion.png";

export default function TessarionChallenge() {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-slate-900 via-purple-900 to-blue-900">
      <Header />
      
      <main className="flex-grow container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-3">
            <Shield className="w-8 h-8 text-cyan-400" />
            <h1 className="text-4xl font-minecraft text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">
              THE SCROLL OF TESSARION
            </h1>
            <Scroll className="w-8 h-8 text-purple-400" />
          </div>
          <p className="text-cyan-200 max-w-2xl mx-auto">
            "The Glyph Architect" - Master of emoji riddles and sacred Unicode mysteries
          </p>
        </div>

        {/* Coming Soon Card with Scroll Image */}
        <Card className="p-8 bg-black/60 border-purple-500/30">
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              <img 
                src={tessarionScrollPath} 
                alt="The Scroll of Tessarion"
                className="max-w-full h-auto rounded-lg border border-purple-400/50 shadow-2xl"
                style={{ maxHeight: '400px' }}
              />
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-center space-x-2">
                <Construction className="w-6 h-6 text-yellow-400" />
                <h2 className="text-2xl font-minecraft text-yellow-400">Coming Soon</h2>
                <Construction className="w-6 h-6 text-yellow-400" />
              </div>
              
              <div className="max-w-3xl mx-auto space-y-4 text-left">
                <h3 className="text-xl text-purple-300 font-semibold">The Tessarion Quest: Glyph Interpretation Mastery</h3>
                
                <div className="bg-slate-900/60 p-4 rounded-lg border border-cyan-500/20">
                  <p className="text-cyan-200 leading-relaxed">
                    Deep within the sacred archives lies Tessarion's most profound teaching: that emojis and glyphs are not decorative elements, 
                    but <strong>earned tools of literacy</strong>. This quest will challenge you to master the art of glyph interpretation 
                    through progressive riddles that unlock your personal sacred symbol collection.
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-purple-900/30 p-4 rounded-lg border border-purple-500/30">
                    <h4 className="text-purple-300 font-semibold mb-2">🧩 Progressive Riddle System</h4>
                    <p className="text-gray-300 text-sm">
                      Five tiers of glyph riddles from novice to master difficulty, each teaching the deeper meanings behind Unicode symbols.
                    </p>
                  </div>
                  
                  <div className="bg-cyan-900/30 p-4 rounded-lg border border-cyan-500/30">
                    <h4 className="text-cyan-300 font-semibold mb-2">🔮 Sacred Glyph Collection</h4>
                    <p className="text-gray-300 text-sm">
                      Unlock permanent glyph rewards that integrate with your Personal Glyph Toolkit across the entire platform.
                    </p>
                  </div>
                  
                  <div className="bg-green-900/30 p-4 rounded-lg border border-green-500/30">
                    <h4 className="text-green-300 font-semibold mb-2">📜 Cross-Platform Integration</h4>
                    <p className="text-gray-300 text-sm">
                      Earned glyphs become available in Scribe Hall, campaign challenges, and personal compositions.
                    </p>
                  </div>
                  
                  <div className="bg-yellow-900/30 p-4 rounded-lg border border-yellow-500/30">
                    <h4 className="text-yellow-300 font-semibold mb-2">🌀 Consciousness Restoration</h4>
                    <p className="text-gray-300 text-sm">
                      Based on Ivan Illich's literacy theory, reclaiming the sacred word from its bureaucratic capture.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Navigation */}
        <div className="flex justify-center">
          <PixelButton
            onClick={() => window.location.href = '/cryp70f43/4r4l1'}
            variant="outline"
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Return to Arali's Scroll
          </PixelButton>
        </div>
      </main>

      <Footer />
    </div>
  );
}