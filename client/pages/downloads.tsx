import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';

export default function Downloads() {
  const { toast } = useToast();

  const handleDownload = (packageName: string, url?: string) => {
    if (url) {
      const link = document.createElement('a');
      link.href = url;
      link.download = packageName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "Download Started",
        description: `${packageName} is being downloaded...`
      });
    } else {
      toast({
        title: "Coming Soon",
        description: `${packageName} will be available for download soon!`,
        variant: "default"
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
            CJSR Downloads
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Download standalone packages of CJSR components for offline play, educational use, or custom implementations
          </p>
          
          {/* Testing Notice */}
          <div className="mt-6 p-4 bg-yellow-900/50 border border-yellow-600 rounded-lg max-w-2xl mx-auto">
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="text-yellow-400 text-xl">⚠️</span>
              <h3 className="text-yellow-400 font-bold">FOR INTERNAL TESTING ONLY</h3>
            </div>
            <p className="text-yellow-200 text-sm">
              These download packages are currently in testing phase and are intended for development and internal evaluation purposes. 
              Public release versions will be announced when ready for general distribution.
            </p>
            <div className="mt-3 flex justify-center gap-4 text-xs">
              <a href="/terms" className="text-yellow-300 hover:text-yellow-100 underline">
                Terms of Service
              </a>
              <span className="text-yellow-500">•</span>
              <a href="/privacy" className="text-yellow-300 hover:text-yellow-100 underline">
                Privacy Policy
              </a>
            </div>
          </div>
        </div>

        {/* Available Downloads */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold mb-6 text-center">📦 Available Downloads</h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            {/* Matrix Multiplayer Core */}
            <Card className="bg-slate-800 border-purple-500 hover:border-purple-400 transition-all duration-300">
              <CardHeader>
                <CardTitle className="text-2xl text-purple-400 flex items-center gap-3">
                  <div className="text-3xl">🌐</div>
                  Matrix Multiplayer Core
                  <Badge className="bg-green-600 text-white">v2.1.0</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-300">
                  Complete Matrix federation system with real-time multiplayer racing, WebSocket infrastructure, and cross-server synchronization.
                </p>
                
                <div className="space-y-2">
                  <h4 className="font-semibold text-white">Features:</h4>
                  <ul className="text-sm text-gray-300 space-y-1 list-disc list-inside">
                    <li>Matrix protocol integration</li>
                    <li>Real-time race synchronization</li>
                    <li>Cross-server player matching</li>
                    <li>Leaderboard federation</li>
                    <li>WebSocket server implementation</li>
                  </ul>
                </div>

                <div className="flex items-center justify-between pt-4">
                  <div className="text-sm text-gray-400">
                    Size: ~2.8MB | Node.js + TypeScript
                  </div>
                  <Button 
                    onClick={() => handleDownload('CJSR-Matrix-Core-v2.1.0.zip', '/api/download/matrix-core')}
                    className="bg-purple-600 hover:bg-purple-500"
                  >
                    📥 Download
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Learn to Type Adventure */}
            <Card className="bg-slate-800 border-yellow-500 hover:border-yellow-400 transition-all duration-300">
              <CardHeader>
                <CardTitle className="text-2xl text-yellow-400 flex items-center gap-3">
                  <div className="text-3xl">📚</div>
                  Learn to Type Adventure
                  <Badge className="bg-green-600 text-white">v1.5.0</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-300">
                  Complete 12-chapter typing education system featuring sacred texts from diverse languages and progressive skill development.
                </p>
                
                <div className="space-y-2">
                  <h4 className="font-semibold text-white">Includes:</h4>
                  <ul className="text-sm text-gray-300 space-y-1 list-disc list-inside">
                    <li>12 cultural wisdom chapters</li>
                    <li>Sacred texts in 12 languages</li>
                    <li>Progressive difficulty system</li>
                    <li>Achievement tracking</li>
                    <li>Offline-compatible design</li>
                  </ul>
                </div>

                <div className="flex items-center justify-between pt-4">
                  <div className="text-sm text-gray-400">
                    Size: ~1.2MB | React + TypeScript
                  </div>
                  <Button 
                    onClick={() => handleDownload('CJSR-Learn-to-Type-v1.5.0.zip', '/api/download/typing-adventure')}
                    className="bg-yellow-600 hover:bg-yellow-500"
                  >
                    📥 Download
                  </Button>
                </div>
              </CardContent>
            </Card>
            {/* CJSR Complete Flatpak */}
            <Card className="bg-gradient-to-br from-green-900 to-emerald-800 border-green-600">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">🐧</span>
                  </div>
                  <div>
                    <CardTitle className="text-white text-xl">CJSR COMPLETE FLATPAK</CardTitle>
                    <Badge className="bg-green-600 text-white mt-1">READY</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="text-green-100">
                <p className="mb-4">
                  Complete Linux Flatpak package with all CJSR features including campaigns, typing adventures, Matrix multiplayer, HTML sprites, factions, leaderboards, and educational content.
                </p>
                
                <div className="space-y-2 mb-4">
                  <h4 className="font-semibold text-green-200">Complete Package Includes:</h4>
                  <ul className="text-sm space-y-1 list-disc list-inside">
                    <li>Campaign system (Steve, Auto, Matikah, Iam)</li>
                    <li>Learn to Type Adventure (12 chapters)</li>
                    <li>Matrix federation multiplayer</li>
                    <li>Quick races with intelligent NPCs</li>
                    <li>HTML sprite customization</li>
                    <li>Faction progression system</li>
                    <li>Educational WISDOMS module</li>
                    <li>Egg collection mini-games</li>
                    <li>Comprehensive leaderboards</li>
                    <li>Discord integration</li>
                    <li>Practice modes with scaling difficulty</li>
                  </ul>
                </div>

                <div className="flex items-center justify-between pt-4">
                  <div className="text-sm text-green-300">
                    Size: ~15MB | Linux Flatpak
                  </div>
                  <Button 
                    onClick={() => handleDownload('CJSR-Flatpak-Complete-v2.1.0.zip', '/api/download/flatpak-complete')}
                    className="bg-green-600 hover:bg-green-500"
                  >
                    🐧 Download Flatpak
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Coming Soon */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold mb-6 text-center">🚀 Coming Soon</h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            {/* Campaign System */}
            <Card className="bg-slate-800 border-blue-500 opacity-75">
              <CardHeader>
                <CardTitle className="text-xl text-blue-400 flex items-center gap-2">
                  <div className="text-2xl">⚔️</div>
                  Campaign System
                  <Badge variant="outline" className="border-blue-500 text-blue-400">Preview</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-gray-300 text-sm">
                  Complete campaign progression with character unlocks, elemental faction quests, and narrative-driven typing challenges.
                </p>
                
                <Progress value={75} className="w-full" />
                <div className="text-xs text-gray-400">Development: 75% complete</div>
                
                <Button 
                  onClick={() => handleDownload('Campaign System')}
                  variant="outline" 
                  className="w-full border-blue-500 text-blue-400 hover:bg-blue-500 hover:text-white"
                  disabled
                >
                  📋 Preview Available Soon
                </Button>
              </CardContent>
            </Card>

            {/* Scribe Hall Collections */}
            <Card className="bg-slate-800 border-emerald-500 opacity-75">
              <CardHeader>
                <CardTitle className="text-xl text-emerald-400 flex items-center gap-2">
                  <div className="text-2xl">📜</div>
                  Scribe Hall UCG
                  <Badge variant="outline" className="border-emerald-500 text-emerald-400">Preview</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-gray-300 text-sm">
                  User-generated content collections featuring custom typing passages, community challenges, and modular text libraries.
                </p>
                
                <Progress value={45} className="w-full" />
                <div className="text-xs text-gray-400">Development: 45% complete</div>
                
                <Button 
                  onClick={() => handleDownload('Scribe Hall UCG Collections')}
                  variant="outline" 
                  className="w-full border-emerald-500 text-emerald-400 hover:bg-emerald-500 hover:text-white"
                  disabled
                >
                  🎨 Preview Available Soon
                </Button>
              </CardContent>
            </Card>

            {/* Faction War Engine */}
            <Card className="bg-slate-800 border-red-500 opacity-75">
              <CardHeader>
                <CardTitle className="text-xl text-red-400 flex items-center gap-2">
                  <div className="text-2xl">⚡</div>
                  Faction War Engine
                  <Badge variant="outline" className="border-red-500 text-red-400">Preview</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-gray-300 text-sm">
                  Advanced faction competition system with territory control, seasonal events, and cross-server faction battles.
                </p>
                
                <Progress value={60} className="w-full" />
                <div className="text-xs text-gray-400">Development: 60% complete</div>
                
                <Button 
                  onClick={() => handleDownload('Faction War Engine')}
                  variant="outline" 
                  className="w-full border-red-500 text-red-400 hover:bg-red-500 hover:text-white"
                  disabled
                >
                  ⚔️ Preview Available Soon
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Documentation & Support */}
        <div className="bg-slate-800 rounded-lg p-8 border border-slate-700">
          <h2 className="text-2xl font-bold mb-4 text-center">📖 Documentation & Support</h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-3 text-blue-400">Installation Guides</h3>
              <ul className="space-y-2 text-gray-300">
                <li>• Matrix Federation Setup Guide</li>
                <li>• Learn to Type Integration Manual</li>
                <li>• Custom Implementation Examples</li>
                <li>• API Documentation</li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-3 text-green-400">Community Resources</h3>
              <ul className="space-y-2 text-gray-300">
                <li>• Discord Developer Community</li>
                <li>• GitHub Repository Access</li>
                <li>• Video Tutorial Series</li>
                <li>• Community Forums</li>
              </ul>
            </div>
          </div>
          
          <div className="mt-6 text-center">
            <p className="text-gray-400 mb-4">
              All downloads include full source code, documentation, and MIT license for educational and commercial use.
            </p>
            <div className="flex justify-center gap-4">
              <Button variant="outline" className="border-blue-500 text-blue-400 hover:bg-blue-500 hover:text-white">
                📚 View Documentation
              </Button>
              <Button variant="outline" className="border-green-500 text-green-400 hover:bg-green-500 hover:text-white">
                💬 Join Community
              </Button>
            </div>
          </div>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-8">
          <Button 
            onClick={() => window.location.href = '/'}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          >
            🏠 Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
}