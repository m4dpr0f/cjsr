import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Card } from "@/components/ui/card";
import { PixelButton } from "@/components/ui/pixel-button";
import { useLocation } from "wouter";

interface FactionStat {
  faction: string;
  name: string;
  color: string;
  totalXp: number;
  topPlayer: string | null;
  topPlayerWpm: number;
  topPlayerAccuracy: number;
  topPlayerMount: string | null;
  playerCount: number;
}

const FACTION_INFO = {
  d2: { name: 'Coin', emoji: '💰', color: '#C0C0C0' },
  d4: { name: 'Fire', emoji: '🔥', color: '#FF4444' },
  d6: { name: 'Earth', emoji: '🌱', color: '#22C55E' },
  d8: { name: 'Air', emoji: '💨', color: '#FFFFFF' },
  d10: { name: 'Chaos', emoji: '⚡', color: '#4F46E5' },
  d12: { name: 'Ether', emoji: '✨', color: '#000000' },
  d20: { name: 'Water', emoji: '🌊', color: '#3B82F6' },
  d100: { name: 'Order', emoji: '⚖️', color: '#FFD700' }
};

export default function FactionWar() {
  const [, setLocation] = useLocation();

  const { data: factionData, isLoading } = useQuery({
    queryKey: ['/api/stats/factions'],
  });

  const factionTotals = (factionData as { factions?: FactionStat[] })?.factions || [];

  // Sort factions by total XP (descending)
  const sortedFactions = [...factionTotals].sort((a, b) => b.totalXp - a.totalXp);

  const getRankEmoji = (index: number) => {
    switch (index) {
      case 0: return '🥇';
      case 1: return '🥈';
      case 2: return '🥉';
      default: return `#${index + 1}`;
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toLocaleString();
  };

  const maxXp = sortedFactions.length > 0 ? sortedFactions[0].totalXp : 1;

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-grow container mx-auto p-4">
        <div className="max-w-4xl mx-auto">
          <div className="minecraft-border p-6 bg-black/80 mb-6">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-minecraft text-primary">⚔️ FACTION WAR LEADERBOARD</h1>
              <PixelButton variant="outline" size="sm" onClick={() => setLocation('/leaderboard')}>
                Back to Leaderboards
              </PixelButton>
            </div>
            
            <p className="text-yellow-100 mb-6 text-center">
              The eternal battle between the eight elemental factions! See which faction has earned the most XP across all players.
            </p>

            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-gray-300">Loading faction war standings...</p>
              </div>
            ) : (
              <div className="space-y-4">
                {sortedFactions.map((faction, index) => {
                  const info = FACTION_INFO[faction.faction as keyof typeof FACTION_INFO];
                  const percentage = maxXp > 0 ? (faction.totalXp / maxXp) * 100 : 0;
                  
                  return (
                    <Card key={faction.faction} className="p-4 bg-gray-900/50 border-2 border-gray-700 hover:border-primary/50 transition-colors">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-4">
                          <div className="text-2xl font-bold text-yellow-400 min-w-[60px]">
                            {getRankEmoji(index)}
                          </div>
                          <div 
                            className={`w-8 h-8 rounded border ${faction.faction === 'd8' ? 'border-gray-400' : 'border-gray-600'}`}
                            style={{ backgroundColor: info.color }}
                          ></div>
                          <div>
                            <h3 className="text-xl font-minecraft text-white">
                              {info.emoji} {info.name} (D{faction.faction.slice(1)})
                            </h3>
                            <p className="text-sm text-gray-400">
                              {faction.playerCount} active players
                            </p>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div className="text-2xl font-bold text-primary">
                            {formatNumber(faction.totalXp)} XP
                          </div>
                          {faction.topPlayer && (
                            <div className="text-sm text-gray-300">
                              <p className="font-semibold">Top: {faction.topPlayer}</p>
                              {(faction as any).topPlayerMount && (
                                <p className="text-xs text-yellow-400 font-medium">Mount: {(faction as any).topPlayerMount}</p>
                              )}
                              <p className="text-xs text-gray-400">
                                {faction.topPlayerWpm} WPM • {faction.topPlayerAccuracy}% ACC
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Progress bar showing relative faction strength */}
                      <div className="w-full bg-gray-800 rounded-full h-3 overflow-hidden">
                        <div 
                          className="h-full transition-all duration-1000 ease-out rounded-full"
                          style={{ 
                            width: `${percentage}%`,
                            backgroundColor: info.color,
                            opacity: 0.8
                          }}
                        ></div>
                      </div>
                    </Card>
                  );
                })}
                
                {sortedFactions.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-gray-400 text-lg">No faction data available yet.</p>
                    <p className="text-gray-500 text-sm mt-2">Start racing to earn XP for your faction!</p>
                  </div>
                )}
              </div>
            )}

            {/* Detailed Faction Statistics Table */}
            {!isLoading && sortedFactions.length > 0 && (
              <div className="mt-8 minecraft-border bg-black/60 p-6">
                <h2 className="text-2xl font-minecraft text-primary mb-4">📈 DETAILED FACTION STATISTICS</h2>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-600">
                        <th className="text-left py-3 px-2 text-yellow-400 font-minecraft">RANK</th>
                        <th className="text-left py-3 px-2 text-yellow-400 font-minecraft">FACTION</th>
                        <th className="text-right py-3 px-2 text-yellow-400 font-minecraft">TOTAL XP</th>
                        <th className="text-right py-3 px-2 text-yellow-400 font-minecraft">PLAYERS</th>
                        <th className="text-left py-3 px-2 text-yellow-400 font-minecraft">TOP CONTRIBUTOR</th>
                        <th className="text-right py-3 px-2 text-yellow-400 font-minecraft">WPM</th>
                        <th className="text-right py-3 px-2 text-yellow-400 font-minecraft">ACCURACY</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedFactions.map((faction, index) => {
                        const info = FACTION_INFO[faction.faction as keyof typeof FACTION_INFO];
                        return (
                          <tr key={faction.faction} className="border-b border-gray-700/50 hover:bg-gray-800/30">
                            <td className="py-3 px-2">
                              <span className="text-xl">{getRankEmoji(index)}</span>
                            </td>
                            <td className="py-3 px-2">
                              <div className="flex items-center space-x-2">
                                <div 
                                  className={`w-4 h-4 rounded border ${faction.faction === 'd8' ? 'border-gray-400' : 'border-gray-600'}`}
                                  style={{ backgroundColor: info.color }}
                                ></div>
                                <span className="text-white font-minecraft">
                                  {info.emoji} {info.name}
                                </span>
                                <span className="text-gray-400 text-xs">
                                  (D{faction.faction.slice(1)})
                                </span>
                              </div>
                            </td>
                            <td className="py-3 px-2 text-right">
                              <span className="text-primary font-bold">
                                {formatNumber(faction.totalXp)}
                              </span>
                            </td>
                            <td className="py-3 px-2 text-right text-gray-300">
                              {faction.playerCount}
                            </td>
                            <td className="py-3 px-2">
                              <span className="text-white">
                                {faction.topPlayer || 'None'}
                              </span>
                            </td>
                            <td className="py-3 px-2 text-right">
                              <span className="text-green-400 font-bold">
                                {faction.topPlayerWpm || '-'}
                              </span>
                            </td>
                            <td className="py-3 px-2 text-right">
                              <span className="text-blue-400 font-bold">
                                {faction.topPlayerAccuracy ? `${faction.topPlayerAccuracy}%` : '-'}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            
            <div className="mt-8 p-4 bg-yellow-900/30 border border-yellow-600 rounded">
              <h3 className="text-yellow-200 font-bold mb-2">📊 How Faction Wars Work</h3>
              <ul className="text-yellow-100 text-sm space-y-1">
                <li>• Every race you complete earns XP for your current faction</li>
                <li>• XP is based on characters typed and finishing position</li>
                <li>• Change factions anytime in your profile settings</li>
                <li>• Rankings update in real-time as players race</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}